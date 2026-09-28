"""Stage verified WinterBreak2, with optional OTA filler; never executes jailbreak.

Default is inspection only. --apply writes only the two project-owned directories.
--apply --fill also reserves space; a partial fill does not block updates.
No backup, deletion, formatting, firmware update or network access is performed.
"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import time


ROOT = Path(__file__).resolve().parents[1]
MOUNT = Path('/Volumes/Kindle')
SOURCE = ROOT / '.local/jailbreak/winterbreak2-v1.1.0/staged/winterbreak2/dialoger.html'
EXPECTED = '9d42a3c880bc6e6a7013a2f59e2d5e8525b369880384384d1c3d856fe7a6bbd5'
FIRMWARE = 'Kindle 5.12.2.2 (379151 038)'
RESERVE = 80 * 1024 * 1024
FILLER = MOUNT / '.newspaper-ota-guard'
MARKER = 'Created by kindle-newspaper preparation; temporary OTA filler.\n'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def emit(**data):
    print(json.dumps(data), flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--fill', action='store_true', help='Opt in to temporary OTA filler.')
    args = parser.parse_args()
    if args.fill and not args.apply:
        parser.error('--fill requires --apply')
    if not os.path.ismount(MOUNT):
        raise SystemExit('Expected mounted Kindle volume is unavailable.')
    if (MOUNT / 'system/version.txt').read_text().strip() != FIRMWARE:
        raise SystemExit('Firmware differs from the reviewed device.')
    if digest(SOURCE) != EXPECTED:
        raise SystemExit('Local payload checksum differs from verified release.')
    if any(p.name.lower().startswith('update') for p in MOUNT.iterdir()):
        raise SystemExit('A possible pending update exists; inspect before proceeding.')
    destination = MOUNT / 'winterbreak2/dialoger.html'
    if destination.parent.is_symlink() or destination.is_symlink():
        raise SystemExit('Unexpected destination symlink.')
    if destination.exists() and digest(destination) != EXPECTED:
        raise SystemExit('A different payload already exists; refusing overwrite.')
    if FILLER.exists():
        if FILLER.is_symlink() or (FILLER / 'OWNER.txt').read_text() != MARKER:
            raise SystemExit('Filler directory does not belong to this preparation.')
    free = shutil.disk_usage(MOUNT).free
    emit(mode='apply' if args.apply else 'inspect', firmware=FIRMWARE,
         payload_sha256=EXPECTED, free_bytes=free, target_free_bytes=RESERVE)
    if not args.apply:
        return
    destination.parent.mkdir(exist_ok=True)
    if not destination.exists():
        with destination.open('xb') as out:
            out.write(SOURCE.read_bytes())
            out.flush()
            os.fsync(out.fileno())
    if digest(destination) != EXPECTED:
        raise SystemExit('Device payload verification failed.')
    emit(stage='payload_copied_and_verified', free_bytes=shutil.disk_usage(MOUNT).free)
    if not args.fill:
        return
    if not FILLER.exists():
        FILLER.mkdir()
        (FILLER / 'OWNER.txt').write_text(MARKER)
    block = bytes(4 * 1024 * 1024)
    index = 0
    last_report = time.monotonic()
    while shutil.disk_usage(MOUNT).free > RESERVE + 1024 * 1024:
        path = FILLER / f'reserve-{index:04d}.dat'
        index += 1
        if path.exists():
            continue
        free_before = shutil.disk_usage(MOUNT).free
        size = min(128 * 1024 * 1024, free_before - RESERVE)
        with path.open('xb') as out:
            # FAT allocates real clusters on extension. Check allocation rather
            # than trusting apparent file size (other filesystems allow holes).
            out.truncate(size)
            out.flush()
            os.fsync(out.fileno())
            if path.stat().st_blocks * 512 < size:
                out.seek(0)
                remaining = size
                while remaining:
                    n = min(len(block), remaining)
                    out.write(block[:n])
                    remaining -= n
            out.flush()
            os.fsync(out.fileno())
        if free_before - shutil.disk_usage(MOUNT).free < size:
            raise SystemExit('Filler did not consume real free space; inspect before proceeding.')
        if time.monotonic() - last_report >= 15:
            emit(stage='filling', free_bytes=shutil.disk_usage(MOUNT).free)
            last_report = time.monotonic()
    free = shutil.disk_usage(MOUNT).free
    emit(stage='prepared', free_bytes=free, payload_sha256=digest(destination))
    if not 50_000_000 <= free <= 90_000_000:
        raise SystemExit('Free storage is outside the guide range; inspect before ejecting.')


if __name__ == '__main__':
    main()
