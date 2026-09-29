#!/bin/sh
# Name: Pablos Time
# Author: Kindle Newspaper
# DontUseFBInk
# Open the verified, offline edition with KOReader's native touch handling.
umask 077
PATH=/usr/bin:/bin:/usr/sbin:/sbin
export PATH
BASE=/mnt/us/newspaper-reader
KO=/mnt/us/koreader
[ "$(uname -s)" = Linux ] && [ "$(id -u)" = 0 ] || exit 1
[ ! -L "$BASE" ] && [ "$(cat "$BASE/OWNER.txt" 2>/dev/null)" = 'Kindle Newspaper reader v1' ] || exit 1
[ "$(awk 'NR==1 {print $1 " " $2; exit}' /mnt/us/system/version.txt)" = 'Kindle 5.12.2.2' ] || exit 1
[ -f "$KO/koreader.sh" ] && [ -f "$BASE/current.cbz" ] || exit 1
if [ "$1" != '--reader-worker' ]; then
    # Return to the document dispatcher while the reader owns its UI lifecycle.
    nohup /bin/sh "$BASE/launch.sh" --reader-worker </dev/null >/dev/null 2>&1 &
    exit 0
fi
mkdir /tmp/la-senal-reader.lock 2>/dev/null || exit 0
trap 'rmdir /tmp/la-senal-reader.lock 2>/dev/null' 0
n=1
while [ -e "$BASE/reader-$n.txt" ]; do n=$((n + 1)); [ "$n" -lt 1000 ] || exit 1; done
exec >>"$BASE/reader-$n.txt" 2>&1
printf 'reader_started=1\nutc='
date -u '+%Y-%m-%dT%H:%M:%SZ'
cd "$BASE" || exit 1
DOC="$BASE/current.cbz"
SUM="$BASE/current.sha256"
active=$(cat "$BASE/active-edition.txt" 2>/dev/null)
if printf '%s\n' "$active" | /bin/busybox grep -Eq '^edition-[0-9]{4}-[0-9]{2}-[0-9]{2}-(daily|[0-9]{13})\.cbz$'; then
    if [ -f "$BASE/$active" ] && [ -f "$BASE/active.sha256" ] && /bin/busybox sha256sum -c "$BASE/active.sha256"; then
        DOC="$BASE/$active"
        SUM="$BASE/active.sha256"
    fi
fi
/bin/busybox sha256sum -c "$SUM" || exit 1
printf 'edition_checksum_match=1\n'
# The unmodified upstream wrapper restores the UI/services it pauses on exit.
# Do not use --framework_stop; no boot, RTC or power settings are changed here.
/bin/sh "$KO/koreader.sh" "$DOC"
rc=$?
printf 'reader_exit_code=%s\n' "$rc"
sync
exit "$rc"
