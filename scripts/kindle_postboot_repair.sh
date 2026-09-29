#!/bin/sh
# One-shot verification through the official KMC boot hook.
umask 077
base=/mnt/us/newspaper-repair
[ "$(uname -s 2>/dev/null)" = Linux ] || exit 1
[ "$(id -u)" = 0 ] || exit 1
[ "$(cat "$base/OWNER.txt" 2>/dev/null)" = 'Kindle Newspaper offline repair v1' ] || exit 1
[ -f "$base/repair-001.success" ] || exit 1
mkdir "$base/postboot-001.lock" 2>/dev/null || exit 0
(set -C; : > "$base/postboot-001.txt") 2>/dev/null || exit 1
exec >> "$base/postboot-001.txt" 2>&1
printf '%s\n' 'postboot_probe_started=1'
/bin/sh "$base/check-installed.sh"
result=$?
printf 'postboot_check_rc=%s\n' "$result"
if [ "$result" = 0 ]; then
    printf '%s\n' 'postboot_verified=1'
    : > "$base/postboot-001.success"
fi
sync
exit "$result"
