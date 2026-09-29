#!/bin/sh
# Manual diagnostic bridge. Copy as RUNME.sh only when using ;log runme.
# No installer, network requests, reboot or system-patch commands are used.

umask 077
if [ "$(uname -s 2>/dev/null)" != Linux ] ||
   [ ! -r /mnt/us/system/version.txt ] ||
   [ ! -f /mnt/us/documents/KT2_Diagnostico.sh ]; then
    exit 1
fi
firmware=$(awk 'NR == 1 { print $1 " " $2; exit }' /mnt/us/system/version.txt)
[ "$firmware" = 'Kindle 5.12.2.2' ] || exit 1

n=1
out="/mnt/us/kt2-diagnostic-launch-$n.txt"
while [ -e "$out" ] || [ -L "$out" ]; do
    n=$((n + 1))
    out="/mnt/us/kt2-diagnostic-launch-$n.txt"
done
(set -C; : > "$out") 2>/dev/null || exit 1
exec >> "$out" 2>&1
printf '%s\n' 'Kindle Newspaper diagnostic launcher v1' 'launcher_started=1'
printf 'uid='
id -u
/bin/sh /mnt/us/documents/KT2_Diagnostico.sh
result=$?
printf 'diagnostic_exit_code=%s\n' "$result"
sync
exit "$result"
