#!/bin/sh
# Install the pinned, pre-extracted official payload without XZ on the Kindle.
# No global set -e: upstream intentionally tolerates absent services/files.
umask 077
base=/mnt/us/newspaper-repair
[ "$(uname -s 2>/dev/null)" = Linux ] || exit 1
[ "$(id -u)" = 0 ] || exit 1
[ "$(cat "$base/OWNER.txt" 2>/dev/null)" = 'Kindle Newspaper offline repair v1' ] || exit 1
mkdir "$base/repair-001.lock" 2>/dev/null || exit 0
(set -C; : > "$base/repair-001.txt") 2>/dev/null || exit 1
exec >> "$base/repair-001.txt" 2>&1
printf '%s\n' 'repair_started=1'
printf 'uid='; id -u
awk '/^btime / { print "boot_time=" $2 }' /proc/stat
finish() {
    status=$?
    trap - 0 HUP INT TERM
    /bin/mount -o remount,ro / || status=1
    printf 'repair_exit_code=%s\n' "$status"
    sync
    if [ "$status" = 0 ] && [ -f "$base/repair-001.success" ]; then
        eips 0 3 'Reparacion lista. Reinicia Kindle.' 2>/dev/null
    else
        eips 0 3 'Revision pendiente. Conecta USB.' 2>/dev/null
    fi
    exit "$status"
}
trap finish 0
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
fail() { printf 'repair_error=%s\n' "$1"; exit 1; }
firmware=$(awk 'NR == 1 { print $1 " " $2; exit }' /mnt/us/system/version.txt)
[ "$firmware" = 'Kindle 5.12.2.2' ] || fail firmware_changed
[ "$(uname -m)" = armv7l ] || fail architecture_changed
[ ! -e /lib/ld-linux-armhf.so.3 ] || fail wrong_platform
for marker in /mnt/us/jb.sh.debug /mnt/us/jb.sh.runmode* /mnt/us/update* /mnt/us/emergency.sh; do
    if [ -e "$marker" ] || [ -L "$marker" ]; then fail unexpected_control_or_update_file; fi
done
[ ! -e /var/local/kmc/kindlepw2/bin/kpm ] || fail installation_state_changed
for app in cp chmod chown chattr sqlite3 md5sum pidof; do
    command -v "$app" >/dev/null 2>&1 || fail "missing_$app"
done
[ -x /bin/busybox ] || fail missing_busybox
(cd "$base" && /bin/busybox sha256sum -c bundle.sha256 >/dev/null) || fail bundle_integrity
free=$(df -k /var/local | awk 'END {print $4}')
case "$free" in ''|*[!0-9]*) fail invalid_free_space;; esac
[ "$free" -ge 32768 ] || fail insufficient_varlocal_space
printf 'varlocal_free_kib=%s\n' "$free"
printf '%s\n' 'preflight_passed=1'
sync
(
    # Components must remain traversable by the Kindle's javauser processes.
    # Keep private log permissions in the wrapper, not on installed directories.
    umask 022
    RUN_MODE=1 JB_SH_DEBUG=0 JB_HEADER='Kindle Newspaper offline repair' \
        /bin/sh "$base/installer-tail.sh"
)
result=$?
printf 'installer_exit_code=%s\n' "$result"
[ "$result" = 0 ] || fail installer_returned_error
/bin/mount -o remount,ro / || fail root_remount_failed
printf '%s\n' 'functional_checks_begin'
/bin/sh "$base/check-installed.sh" || fail functional_checks_failed
printf '%s\n' 'functional_checks_passed=1'
# Activate only this reviewed, one-shot check after successful installation.
[ ! -e /mnt/us/emergency.sh ] && [ ! -L /mnt/us/emergency.sh ] || fail emergency_path_changed
cp "$base/postboot-entry.sh" /mnt/us/emergency.sh || fail postboot_copy_failed
if [ "$(/bin/busybox sha256sum /mnt/us/emergency.sh | cut -d ' ' -f 1)" != \
     "$(/bin/busybox sha256sum "$base/postboot-entry.sh" | cut -d ' ' -f 1)" ]; then
    fail postboot_copy_mismatch
fi
chmod 0755 /mnt/us/emergency.sh || fail postboot_permission_failed
: > "$base/repair-001.success"
printf '%s\n' 'repair_verified_before_reboot=1'
sync
exit 0
