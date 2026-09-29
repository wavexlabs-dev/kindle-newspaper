#!/bin/sh
# One-shot boot verification after a completed install whose remount was busy.
# Does not rerun the installer, remount filesystems, or change system settings.
umask 077
base=/mnt/us/newspaper-repair
[ "$(uname -s 2>/dev/null)" = Linux ] || exit 1
[ "$(id -u)" = 0 ] || exit 1
[ "$(cat "$base/OWNER.txt" 2>/dev/null)" = 'Kindle Newspaper offline repair v1' ] || exit 1
mkdir "$base/verify-after-restart-003.lock" 2>/dev/null || exit 0
(set -C; : > "$base/verify-after-restart-003.txt") 2>/dev/null || exit 1
exec >> "$base/verify-after-restart-003.txt" 2>&1
printf '%s\n' 'restart_verification_started=1'
printf 'uid='; id -u
finish() {
    status=$?
    trap - 0 HUP INT TERM
    printf 'restart_verification_rc=%s\n' "$status"
    sync
    if [ "$status" = 0 ]; then
        eips 0 3 'Verificacion lista. Conecta USB.' 2>/dev/null
    else
        eips 0 3 'Revision pendiente. Conecta USB.' 2>/dev/null
    fi
    exit "$status"
}
trap finish 0
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
grep -qx 'installer_exit_code=0' "$base/repair-001.txt" || exit 1
grep -qx 'repair_error=root_remount_failed' "$base/repair-001.txt" || exit 1
(cd "$base" && /bin/busybox sha256sum -c bundle.sha256 >/dev/null) || exit 1
previous_boot=$(sed -n 's/^boot_time=//p' "$base/repair-001.txt" | head -n 1)
current_boot=$(awk '/^btime / { print $2 }' /proc/stat)
printf 'installation_boot_time=%s\n' "$previous_boot"
printf 'verification_boot_time=%s\n' "$current_boot"
case "$previous_boot:$current_boot" in *[!0-9:]*|:*|*:) exit 1;; esac
if [ "$previous_boot" = "$current_boot" ]; then
    printf '%s\n' 'different_boot=0'
    exit 1
fi
printf '%s\n' 'different_boot=1'
sync
/bin/sh "$base/check-installed.sh" || exit 1
printf '%s\n' 'verified_after_restart=1'
: > "$base/verify-after-restart-003.success"
sync
exit 0
