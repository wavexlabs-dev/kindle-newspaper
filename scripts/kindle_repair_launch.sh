#!/bin/sh
# Trace the browser entry before the repair wrapper's early preconditions.
# The existing repair retains its own integrity checks and one-shot guard.
umask 077
base=/mnt/us/newspaper-diagnostics
[ -d "$base" ] || exit 1
[ "$(cat "$base/OWNER.txt" 2>/dev/null)" = 'Kindle Newspaper diagnostics only' ] || exit 1
mkdir "$base/repair-launch-002.lock" 2>/dev/null || exit 0
(set -C; : > "$base/repair-launch-002.txt") 2>/dev/null || exit 1
exec >> "$base/repair-launch-002.txt" 2>&1
printf '%s\n' 'repair_launch_started=1'
printf 'uid='; id -u
printf 'system='; uname -s
printf 'machine='; uname -m
awk '/^btime / { print "boot_time=" $2 }' /proc/stat
sync
if [ "$(uname -s)" != Linux ] || [ "$(id -u)" != 0 ]; then
    printf '%s\n' 'repair_launch_error=unexpected_execution_context'
    sync
    exit 1
fi
eips 0 3 'Iniciando reparacion...' 2>/dev/null
/bin/sh /mnt/us/newspaper-repair/repair.sh
result=$?
printf 'repair_wrapper_rc=%s\n' "$result"
if [ -f /mnt/us/newspaper-repair/repair-001.success ]; then
    printf '%s\n' 'repair_success_marker_present=1'
else
    printf '%s\n' 'repair_success_marker_present=0'
    eips 0 3 'Revision pendiente. Conecta USB.' 2>/dev/null
fi
sync
exit "$result"
