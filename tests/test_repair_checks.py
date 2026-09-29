"""Run only the read-only checker against a temporary, entirely fake Kindle."""

import hashlib
from pathlib import Path
import re
import shlex
import shutil
import subprocess
import tempfile
import unittest


CHECKER = Path(__file__).resolve().parents[1] / "scripts/kindle_check_repair.sh"


class RepairCheckTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="kindle-check-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "root"
        self.mockbin = Path(self.temp.name) / "mockbin"
        self.mockbin.mkdir()
        self.kmc = self.root / "var/local/kmc"

        def put(relative, text, mode=0o644):
            path = self.root / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
            path.chmod(mode)
            return path

        self.put = put
        binary = "var/local/kmc/kindlepw2/bin/"
        self.put(binary + "fbink", '#!/bin/sh\n[ "$1" = -e ]\n', 0o755)
        self.put(binary + "kpm", """#!/bin/sh
[ "$1" = version ] || exit 20
if [ "${KPM_TEST_BAD_OUTPUT:-0}" = 1 ]; then
    printf 'usage: kpm version\n'
else
    printf 'cli v1.0.0\nlibkpm v1.0.0\nbuilt for platform: kindlepw2\n'
fi
exit "${KPM_TEST_RC:-0}"
""", 0o755)
        for name in ("gandalf", "sh_integration_launcher"):
            self.put(binary + name, "#!/bin/sh\nexit 0\n", 0o755)
        self.put("var/local/kmc.fixture-setuid", "simulated setuid metadata\n")
        (self.root / "var/local/mkk").mkdir(mode=0o755)
        self.put("var/local/kmc/kindlepw2/lib/sh_integration_extractor.so", "fake library\n")
        self.put("var/local/kmc/system_patches/dispatch.sh", "fake dispatch\n")
        self.put("var/local/kmc/payload-version.txt", "fixture version 1\n")
        (self.kmc / "bin").symlink_to(self.kmc / "kindlepw2/bin", target_is_directory=True)
        (self.kmc / "lib").symlink_to(self.kmc / "kindlepw2/lib", target_is_directory=True)

        for source, destination in (
            (binary + "fbink", "mnt/us/libkh/bin/fbink"),
            ("var/local/kmc/system_patches/dispatch.sh", "usr/bin/logThis.sh"),
            ("var/local/kmc/kindlepw2/lib/sh_integration_extractor.so", "usr/lib/ccat/sh_integration_extractor.so"),
        ):
            self.put(destination, (self.root / source).read_text())
        for path in (
            "etc/upstart/kmc.conf", "usr/bin/otaupd.bck", "usr/bin/otav3.bck",
            "etc/uks/pubdevkey01.pem", "var/local/appreg.db",
            "PRE_GM_DEBUGGING_FEATURES_ENABLED__REMOVE_AT_GMC", "MNTUS_EXEC",
        ):
            self.put(path, "fixture\n")
        self.put("proc/uptime", "120.0 100.0\n")
        self.put("proc/stat", "btime 1234567890\n")
        self.put("proc/mounts", "/dev/fake / ext3 ro,relatime 0 0\n")

        manifest = []
        for path in sorted(self.kmc.rglob("*")):
            if path.is_file() and not path.is_symlink():
                digest = hashlib.sha256(path.read_bytes()).hexdigest()
                manifest.append(f"{digest}  {path.relative_to(self.kmc)}\n")
        self.put("mnt/us/newspaper-repair/payload.sha256", "".join(manifest))

        mocks = {
            "id": '[ "$1" = -u ] || exit 2\nprintf "0\\n"\n',
            "pidof": '[ "${OTA_TEST_ACTIVE:-}" = "$1" ] || exit 1\nprintf "123\\n"\n',
            "sqlite3": """case "$2" in
  *shell_integration.extractor*) printf '2\n' ;;
  *shell_integration.launcher*) printf '1\n' ;;
  *) exit 2 ;;
esac
""",
            "md5sum": 'printf "7130ce39bb3596c5067cabb377c7a9ed  %s\\n" "$1"\n',
        }
        for name, body in mocks.items():
            path = self.mockbin / name
            path.write_text("#!/bin/sh\n" + body)
            path.chmod(0o755)
        shasum = shutil.which("shasum")
        if not shasum:
            self.skipTest("shasum is needed for the macOS BusyBox substitute")
        self.put("bin/busybox", "#!/bin/sh\n[ \"$1\" = sha256sum ] || exit 2\nshift\n"
                 + f"exec {shlex.quote(shasum)} -a 256 \"$@\"\n", 0o755)

        # Change paths in a private copy only. Never invoke the installer or a
        # binary from the real device: every executable above is a shell stub.
        prefixes = ("/bin/busybox", "/var/local", "/mnt/us", "/usr", "/etc", "/proc",
                    "/PRE_GM_DEBUGGING_FEATURES_ENABLED__REMOVE_AT_GMC", "/MNTUS_EXEC")
        pattern = re.compile("|".join(re.escape(p) for p in sorted(prefixes, key=len, reverse=True)))
        source = CHECKER.read_text()
        # macOS sandbox strips SUID bits. Model that one metadata predicate,
        # rather than requiring privilege or creating a real SUID executable.
        setuid_test = "[ -u /var/local/kmc/bin/gandalf ]"
        self.assertEqual(source.count(setuid_test), 1)
        source = source.replace(setuid_test, "[ -f /var/local/kmc.fixture-setuid ]")
        adapted = pattern.sub(lambda match: str(self.root / match.group().lstrip("/")), source)
        self.checker = Path(self.temp.name) / "check.sh"
        self.checker.write_text(adapted)

    def run_checker(self, **overrides):
        env = {
            "PATH": str(self.mockbin) + ":/usr/bin:/bin",
            "LC_ALL": "C",
        }
        env.update(overrides)
        return subprocess.run(["/bin/sh", str(self.checker)], cwd=self.temp.name,
                              env=env, text=True, capture_output=True, timeout=10)

    def assert_failed(self, result, check):
        self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn(f"{check}=0\n", result.stdout)
        self.assertIn("failed_checks=1\n", result.stdout)

    def test_consistent_installation_passes(self):
        result = self.run_checker()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("installed_payload_matches=1\n", result.stdout)
        self.assertIn("kpm_responds=1\n", result.stdout)
        self.assertIn("failed_checks=0\n", result.stdout)

    def test_modified_payload_fails(self):
        (self.kmc / "payload-version.txt").write_text("tampered\n")
        self.assert_failed(self.run_checker(), "installed_payload_matches")

    def test_running_ota_process_fails(self):
        self.assert_failed(self.run_checker(OTA_TEST_ACTIVE="otaupd"), "otaupd_stopped")

    def test_kpm_nonzero_exit_fails_despite_valid_version_text(self):
        self.assert_failed(self.run_checker(KPM_TEST_RC="17"), "kpm_responds")

    def test_kpm_missing_expected_version_fails_despite_zero_exit(self):
        self.assert_failed(self.run_checker(KPM_TEST_BAD_OUTPUT="1"), "kpm_responds")


if __name__ == "__main__":
    unittest.main()
