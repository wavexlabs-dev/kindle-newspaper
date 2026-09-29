"""Build local offline KMC staging from the exact reviewed jb.sh snapshot.

Uses only the Python standard library. Does not access the Kindle or execute
the installer. Adds the reviewed local control scripts. Output must not exist.
"""

import argparse
import base64
import binascii
import difflib
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import shlex
import tarfile
import lzma


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_SOURCE_SHA256 = '65a63528fbe9515950cc3aa0d931749548680f37898a3819a4ebc0a740588942'
EXPECTED_ENTRIES = 48
EXPECTED_FILES = 38
EXPECTED_DIRECTORIES = 10
STAGE = '/mnt/us/newspaper-repair/kmc'
CHECKSUMS = '/mnt/us/newspaper-repair/payload.sha256'
START_MARKER = '# Packed from 00_helpers.sh'
END_MARKER = 'if [ $RUN_MODE -eq 1 ] || [ $JAILBROKEN -eq 0 ]; then'


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def assemble_controls(output):
    """Add only new local control files after checking the extracted payload."""
    manifest = json.loads((output / 'MANIFEST.json').read_text())
    require(manifest['source']['sha256'] == EXPECTED_SOURCE_SHA256,
            'Staging belongs to a different upstream snapshot.')
    for item in manifest['files']:
        require(sha256((output / 'kmc' / item['path']).read_bytes()) == item['sha256'],
                f"Payload changed: {item['path']}")
    require(sha256((output / 'installer-tail.sh').read_bytes()) ==
            manifest['installer_tail']['sha256'], 'Installer tail changed.')
    mapping = {
        'repair.sh': 'kindle_repair_offline.sh',
        'check-installed.sh': 'kindle_check_repair.sh',
        'postboot-check.sh': 'kindle_postboot_repair.sh',
    }
    controls = {name: (ROOT / 'scripts' / source).read_bytes()
                for name, source in mapping.items()}
    controls['OWNER.txt'] = b'Kindle Newspaper offline repair v1\n'
    controls['postboot-entry.sh'] = (
        b'#!/bin/sh\n# Kindle Newspaper one-shot postboot diagnostic\n'
        b'exec /bin/sh /mnt/us/newspaper-repair/postboot-check.sh\n')
    html = (ROOT / 'scripts/winterbreak2_diagnostic.html').read_text()
    require(html.count('/mnt/us/newspaper-diagnostics/probe-001.sh') == 1,
            'Unexpected browser diagnostic command.')
    require(html.count('kindle-newspaper-diagnostic-001') == 1,
            'Unexpected browser diagnostic identifier.')
    html = html.replace('/mnt/us/newspaper-diagnostics/probe-001.sh',
                        '/mnt/us/newspaper-repair/repair.sh')
    html = html.replace('kindle-newspaper-diagnostic-001', 'kindle-newspaper-repair-001')
    html = html.replace('Diagnostic adaptation', 'Offline repair adaptation')
    controls['repair-dialoger.html'] = html.encode()
    for name in [*controls, 'bundle.sha256']:
        require(not (output / name).exists() and not (output / name).is_symlink(),
                f'Control file already exists: {name}')
    for name, data in controls.items():
        with (output / name).open('xb') as stream:
            stream.write(data)
    lines = []
    for path in sorted(output.rglob('*')):
        if path.is_file():
            require(not path.is_symlink(), 'Unexpected staging symlink.')
            lines.append(f'{sha256(path.read_bytes())}  {path.relative_to(output).as_posix()}\n')
    (output / 'bundle.sha256').write_text(''.join(lines))


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read_payload(source_text):
    expression = r'^echo "([A-Za-z0-9+/=]+)" \| base64 -d \| xz -d \| tar xf - -C /tmp/kmc$'
    matches = re.findall(expression, source_text, flags=re.MULTILINE)
    require(len(matches) == 1, 'Expected exactly one embedded KMC archive.')
    archive_bytes = lzma.decompress(base64.b64decode(matches[0], validate=True))
    entries = []
    seen = {}
    with tarfile.open(fileobj=io.BytesIO(archive_bytes), mode='r:') as archive:
        members = archive.getmembers()
        require(len(members) == EXPECTED_ENTRIES, 'Unexpected archive entry count.')
        for member in members:
            raw_name = member.name
            require(not raw_name.startswith('/'), f'Absolute archive path: {raw_name!r}')
            require('\\' not in raw_name, f'Backslash in archive path: {raw_name!r}')
            require('..' not in raw_name.split('/'), f'Parent traversal: {raw_name!r}')
            require(not any(ord(char) < 32 or ord(char) == 127 for char in raw_name),
                    f'Control character in archive path: {raw_name!r}')
            require(member.isdir() or member.isreg(), f'Unsupported archive entry: {raw_name!r}')
            require(not member.linkname, f'Archive link target: {raw_name!r}')
            path = PurePosixPath(raw_name)
            require(not path.is_absolute(), f'Absolute archive path: {raw_name!r}')
            relative = path.as_posix()
            require(relative != '.' or member.isdir(), 'Archive root must be a directory.')
            require(relative not in seen, f'Duplicate archive path: {relative!r}')
            seen[relative] = member.isdir()
            data = b''
            if member.isreg():
                stream = archive.extractfile(member)
                require(stream is not None, f'Cannot read archive member: {relative!r}')
                with stream:
                    data = stream.read()
                require(len(data) == member.size, f'Truncated archive member: {relative!r}')
            entries.append({'path': relative, 'directory': member.isdir(),
                            'mode': member.mode & 0o777, 'data': data})

    require(sum(not entry['directory'] for entry in entries) == EXPECTED_FILES,
            'Unexpected regular-file count.')
    require(sum(entry['directory'] for entry in entries) == EXPECTED_DIRECTORIES,
            'Unexpected directory count.')
    for entry in entries:
        for parent in PurePosixPath(entry['path']).parents:
            require(seen.get(parent.as_posix(), True),
                    f'File used as parent directory: {parent.as_posix()!r}')
    return entries, len(archive_bytes)


def build_tail(source_text, entries):
    require(source_text.count(START_MARKER) == 1, 'Unexpected helper marker count.')
    require(source_text.count(END_MARKER) == 1, 'Unexpected final GUI block count.')
    start = source_text.index(START_MARKER)
    end = source_text.index(END_MARKER)
    require(start < end, 'Installer markers are out of order.')
    original = '#!/bin/sh\n' + source_text[start:end]
    tail = original
    transforms = []

    def replace_exact(label, old, new, expected):
        nonlocal tail
        count = tail.count(old)
        require(count == expected, f'{label}: expected {expected} matches, found {count}.')
        tail = tail.replace(old, new)
        transforms.append({'name': label, 'expected_count': expected, 'actual_count': count,
                           'before': old, 'after': new})

    def remove_lines(label, expression, expected):
        nonlocal tail
        matches = re.findall(expression, tail, flags=re.MULTILINE)
        require(len(matches) == expected,
                f'{label}: expected {expected} matches, found {len(matches)}.')
        tail, count = re.subn(expression, '', tail, flags=re.MULTILINE)
        transforms.append({'name': label, 'expected_count': expected, 'actual_count': count,
                           'removed_lines': matches})

    replace_exact('Measure USB staging', 'du -ks /tmp/kmc', f'du -ks "{STAGE}"', 2)
    remove_lines('Keep staging; omit temporary cleanup', r'^[ \t]*rm -rf /tmp/kmc[ \t]*\n', 2)
    remove_lines('Preserve USB partial files', r'^rm -rf /mnt/us/\*\.tmp\.partial[ \t]*\n', 1)
    remove_lines('Preserve USB bin files', r'^rm -rf /mnt/us/\*\.bin[ \t]*\n', 1)
    remove_lines('Preserve hotfix documents', r'^rm /mnt/us/documents/\*\.run_hotfix[ \t]*\n', 1)
    # FAT USB storage does not preserve Unix modes. Restore the exact modes
    # from the reviewed archive before upstream sets setuid/immutable flags.
    modes = {}
    for entry in entries:
        path = '/var/local/kmc' if entry['path'] == '.' else '/var/local/kmc/' + entry['path']
        modes.setdefault(entry['mode'], []).append(path)
    restore_modes = '\n'.join(
        f"chmod {mode:04o} " + ' '.join(shlex.quote(path) for path in sorted(paths)) + ' || exit 1'
        for mode, paths in sorted(modes.items()))
    copy_and_verify = f'''cp -rf "{STAGE}"/* /var/local/kmc
REPAIR_COPY_RC=$?
if [ "$REPAIR_COPY_RC" -ne 0 ]; then
    log "Offline KMC copy failed (rc=$REPAIR_COPY_RC)"
    exit "$REPAIR_COPY_RC"
fi
{restore_modes}
if ! (cd /var/local/kmc && /bin/busybox sha256sum -c "{CHECKSUMS}"); then
    log "Offline KMC integrity verification failed"
    exit 1
fi'''
    replace_exact('Copy and verify complete KMC payload',
                  'cp -rf /tmp/kmc/* /var/local/kmc', copy_and_verify, 1)
    require('/tmp/kmc' not in tail, 'Unexpected remaining temporary KMC path.')
    require(END_MARKER not in tail and 'Restarting GUI' not in tail,
            'Final GUI block was not excluded.')
    require('/mnt/us/documents/JAILBROKEN.txt' not in tail,
            'Final jailbreak marker write was not excluded.')
    copy_check = tail.index('REPAIR_COPY_RC=$?')
    hash_check = tail.index('/bin/busybox sha256sum -c')
    permission_stage = tail.index('log "Setting KMC permissions"')
    require(copy_check < hash_check < permission_stage,
            'Copy verification must precede payload permissions and immutability.')
    audit = ''.join(difflib.unified_diff(original.splitlines(keepends=True),
                                       tail.splitlines(keepends=True),
                                       fromfile='reviewed-installer-tail.sh',
                                       tofile='installer-tail.sh'))
    return tail, audit, transforms


def build(source, output):
    source_bytes = source.read_bytes()
    require(sha256(source_bytes) == EXPECTED_SOURCE_SHA256,
            'Snapshot SHA-256 differs from the reviewed jb.sh; no output created.')
    source_text = source_bytes.decode('utf-8')
    entries, tar_bytes = read_payload(source_text)
    tail, audit, transforms = build_tail(source_text, entries)
    files = [{'path': entry['path'], 'size': len(entry['data']),
              'sha256': sha256(entry['data'])}
             for entry in entries if not entry['directory']]
    files.sort(key=lambda item: item['path'])
    checksums = ''.join(f"{item['sha256']}  {item['path']}\n" for item in files)
    manifest = {
        'schema_version': 1,
        'source': {'name': source.name, 'sha256': EXPECTED_SOURCE_SHA256,
                   'size': len(source_bytes), 'jb_sh_version': 'v1.3.7'},
        'archive_entries': len(entries),
        'directory_count': EXPECTED_DIRECTORIES,
        'file_count': len(files),
        'tar_bytes': tar_bytes,
        'payload_bytes': sum(item['size'] for item in files),
        'device_stage': STAGE,
        'files': files,
        'installer_tail': {
            'sha256': sha256(tail.encode('utf-8')),
            'slice_start_inclusive': START_MARKER,
            'slice_end_exclusive': END_MARKER,
            'shebang_added': True,
            'global_errexit_added': False,
            'transforms': transforms,
        },
        'payload_checksums_sha256': sha256(checksums.encode('utf-8')),
        'audit_diff': 'installer-tail.diff',
    }

    # All source validation and transformations finish before creating output.
    require(not output.exists() and not output.is_symlink(),
            'Output already exists; choose a new local output directory.')
    resolved_output = output.resolve()
    for device_root in (Path('/Volumes/Kindle'), Path('/mnt/us')):
        require(device_root != resolved_output and device_root not in resolved_output.parents,
                'Output must be local staging, not Kindle storage.')
    output.mkdir(parents=True)
    kmc = output / 'kmc'
    kmc.mkdir()
    for entry in entries:
        destination = kmc / entry['path']
        if entry['directory']:
            destination.mkdir(parents=True, exist_ok=True)
        else:
            destination.parent.mkdir(parents=True, exist_ok=True)
            with destination.open('xb') as stream:
                stream.write(entry['data'])
            destination.chmod(entry['mode'])
    for entry in reversed(entries):
        if entry['directory']:
            (kmc / entry['path']).chmod(entry['mode'])
    (output / 'payload.sha256').write_text(checksums, encoding='utf-8')
    (output / 'installer-tail.sh').write_text(tail, encoding='utf-8')
    (output / 'installer-tail.diff').write_text(audit, encoding='utf-8')
    (output / 'MANIFEST.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    assemble_controls(output)
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path, help='Reviewed jb.sh snapshot.')
    parser.add_argument('--output', type=Path, default=ROOT / '.local/repair-v1',
                        help='New local staging directory (default: .local/repair-v1).')
    args = parser.parse_args()
    try:
        manifest = build(args.source, args.output)
    except (OSError, ValueError, binascii.Error, lzma.LZMAError, tarfile.TarError) as error:
        parser.exit(1, f'Offline repair build failed: {error}\n')
    print(json.dumps({'output': str(args.output.resolve()),
                      'source_sha256': manifest['source']['sha256'],
                      'files': manifest['file_count'],
                      'payload_bytes': manifest['payload_bytes'],
                      'installer_tail_sha256': manifest['installer_tail']['sha256']}))


if __name__ == '__main__':
    main()
