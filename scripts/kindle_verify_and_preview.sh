#!/bin/sh
# Verify the installed system without FBInk's broken -e, then preview a cover.
umask 077
ulimit -c 0
base=/mnt/us/newspaper-diagnostics
[ "$(uname -s 2>/dev/null)" = Linux ] || exit 1
[ "$(id -u)" = 0 ] || exit 1
[ "$(cat "$base/OWNER.txt" 2>/dev/null)" = 'Kindle Newspaper diagnostics only' ] || exit 1
mkdir "$base/display-005.lock" 2>/dev/null || exit 0
(set -C; : > "$base/display-005.txt") 2>/dev/null || exit 1
exec >> "$base/display-005.txt" 2>&1
printf '%s\n' 'verification_and_preview_started=1'
finish() {
    status=$?
    trap - 0 HUP INT TERM
    printf 'verification_and_preview_rc=%s\n' "$status"
    sync
    if [ "$status" = 0 ]; then
        eips 0 3 'Prueba terminada. Conecta USB.' 2>/dev/null
    else
        eips 0 3 'Revision pendiente. Conecta USB.' 2>/dev/null
    fi
    exit "$status"
}
trap finish 0
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
/bin/sh "$base/check-installed-005.sh"
check_rc=$?
printf 'system_check_rc=%s\n' "$check_rc"
[ "$check_rc" = 0 ] || exit 1
printf '%s\n' 'system_verification_passed=1'
: > "$base/display-005.system-success"
/bin/sh /mnt/us/newspaper-test/preview.sh
preview_rc=$?
printf 'preview_script_rc=%s\n' "$preview_rc"
[ "$preview_rc" = 0 ] || exit 1
printf '%s\n' 'preview_finished=1' 'visual_confirmation=required'
exit 0
