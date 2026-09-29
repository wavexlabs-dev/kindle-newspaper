#!/bin/sh
# Name: Diagnostico autonomia
# Author: Kindle Newspaper
# DontUseFBInk
# Explicit dispatcher entry: read-only probe, no installation or service changes.
umask 077
PATH=/usr/bin:/bin:/usr/sbin:/sbin
export PATH
BASE=/mnt/us/newspaper-diagnostics
[ "$(uname -s 2>/dev/null)" = Linux ] || exit 1
[ ! -L "$BASE" ] && [ ! -L "$BASE/OWNER.txt" ] || exit 1
[ "$(cat "$BASE/OWNER.txt" 2>/dev/null)" = 'Kindle Newspaper diagnostics only' ] || exit 1
n=1
while ! (set -C; : > "$BASE/autonomy-launch-$n.txt") 2>/dev/null; do
    n=$((n + 1))
    [ "$n" -lt 100 ] || exit 1
done
exec >> "$BASE/autonomy-launch-$n.txt" 2>&1
printf 'launcher_started=1\nuid='; id -u
date -u '+utc=%Y-%m-%dT%H:%M:%SZ'
eips 0 3 'Probando autonomia. Espera...' 2>/dev/null || :
/bin/sh "$BASE/autonomy-006.sh"
result=$?
printf 'autonomy_probe_rc=%s\nlauncher_complete=1\n' "$result"
sync
if [ "$result" -eq 0 ] && grep -q '^autonomy_probe_complete=1$' "$BASE/autonomy-006.txt"; then
    eips 0 3 'Autonomia guardada. Conecta USB.' 2>/dev/null || :
else
    eips 0 3 'Revision guardada. Conecta USB.' 2>/dev/null || :
fi
exit "$result"
