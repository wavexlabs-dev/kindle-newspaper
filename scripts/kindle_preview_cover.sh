#!/bin/sh
# Name: Portada de prueba
# Author: Kindle Newspaper

# Foreground SH_Integration preview; never run this script on the Mac.
# Stage OWNER.txt containing exactly: Kindle Newspaper cover preview v1
# alongside the verified cover-test.png in /mnt/us/newspaper-test.
# A render return code of zero confirms the FBInk call completed, not that
# the physical image was legible or remained free of GUI redraws. A person
# must confirm the cover and the subsequent return to the Kindle interface.
# No services are stopped and no network, installer or background job is used.

umask 077
BB=/bin/busybox
BASE=/mnt/us/newspaper-test
IMAGE=/mnt/us/newspaper-test/cover-test.png
FBINK=/var/local/kmc/bin/fbink
XREFRESH=/usr/bin/xrefresh
LOCK=/tmp/kindle-newspaper-cover-preview.lock
EXPECTED_IMAGE=674ef64967bc45b710e88b169814c243d08a87f58314b7dea5466f2172b1f937

if [ ! -x "$BB" ] || [ "$("$BB" uname -s 2>/dev/null)" != Linux ] ||
   [ ! -d /mnt/us/documents ] || [ ! -r /proc/uptime ]; then
    printf '%s\n' 'This preview must run on the intended Kindle.' >&2
    exit 1
fi
if [ ! -d "$BASE" ] || [ -L "$BASE" ] ||
   [ ! -f "$BASE/OWNER.txt" ] || [ -L "$BASE/OWNER.txt" ] ||
   [ "$("$BB" cat "$BASE/OWNER.txt" 2>/dev/null)" != 'Kindle Newspaper cover preview v1' ]; then
    printf '%s\n' 'Missing or incorrect cover-preview owner marker.' >&2
    exit 1
fi

# Exclusive creation retries name collisions without replacing any report.
n=1
while :; do
    report="$BASE/preview-$n.txt"
    if [ ! -L "$report" ] && (set -C; : > "$report") 2>/dev/null; then
        break
    fi
    if [ ! -e "$report" ] && [ ! -L "$report" ]; then
        printf '%s\n' 'Cannot create the cover-preview report.' >&2
        exit 1
    fi
    n=$((n + 1))
done
exec >> "$report" 2>&1
printf '%s\n' 'Kindle Newspaper cover preview v1' 'visual_confirmation=required'
printf 'utc='
"$BB" date -u '+%Y-%m-%dT%H:%M:%SZ'

lock_owned=0
restore_needed=0
preview_finished=0

fail() {
    printf 'error=%s\n' "$1"
    exit 1
}

cleanup() {
    result=$?
    trap - 0 HUP INT TERM
    if [ "$restore_needed" -eq 1 ]; then
        "$XREFRESH" -d :0.0 >/dev/null 2>&1
        refresh_rc=$?
        printf 'gui_refresh_rc=%s\n' "$refresh_rc"
        if [ "$refresh_rc" -ne 0 ] && [ "$result" -eq 0 ]; then
            result=1
        fi
    fi
    if [ "$lock_owned" -eq 1 ]; then
        owner=$("$BB" cat "$LOCK/pid" 2>/dev/null)
        if [ "$owner" = "$$" ] && [ ! -L "$LOCK" ] && [ ! -L "$LOCK/pid" ]; then
            "$BB" rm -f "$LOCK/pid"
        fi
        # Remove only our empty directory; never recursively remove a lock.
        if [ ! -L "$LOCK" ]; then
            "$BB" rmdir "$LOCK" 2>/dev/null || :
        fi
    fi
    if [ "$preview_finished" -eq 1 ] && [ "$result" -eq 0 ]; then
        printf '%s\n' 'preview_complete=1'
    else
        printf '%s\n' 'preview_complete=0'
    fi
    printf 'preview_exit_code=%s\n' "$result"
    "$BB" sync
    exit "$result"
}

trap cleanup 0
trap 'printf "%s\n" "error=signal_HUP"; exit 129' HUP
trap 'printf "%s\n" "error=signal_INT"; exit 130' INT
trap 'printf "%s\n" "error=signal_TERM"; exit 143' TERM

uid=$("$BB" id -u)
printf 'uid=%s\n' "$uid"
[ "$uid" = 0 ] || fail 'root_required'
[ -r /mnt/us/system/version.txt ] || fail 'firmware_file_unreadable'
firmware=$("$BB" awk 'NR == 1 { print $1 " " $2; exit }' /mnt/us/system/version.txt)
[ "$firmware" = 'Kindle 5.12.2.2' ] || fail 'firmware_mismatch'
printf '%s\n' 'firmware_match=1'
[ -x "$FBINK" ] || fail 'fbink_missing_or_not_executable'
[ -x "$XREFRESH" ] || fail 'xrefresh_missing_or_not_executable'
[ -f "$IMAGE" ] && [ ! -L "$IMAGE" ] || fail 'cover_png_missing_or_symlink'
hash_output=$("$BB" sha256sum "$IMAGE" 2>/dev/null)
[ "$?" -eq 0 ] || fail 'cover_checksum_command_failed'
[ "${hash_output%% *}" = "$EXPECTED_IMAGE" ] || fail 'cover_checksum_mismatch'
printf '%s\n' 'cover_checksum_match=1'
unset hash_output

# A live owner blocks concurrent drawing. A terminated owner can be reclaimed
# on a later attempt, including after an untrappable SIGKILL by the launcher.
# /tmp also discards the lock on reboot. Successful runs remove it in cleanup.
if ! "$BB" mkdir "$LOCK" 2>/dev/null; then
    [ -d "$LOCK" ] && [ ! -L "$LOCK" ] &&
        [ -f "$LOCK/pid" ] && [ ! -L "$LOCK/pid" ] || fail 'unexpected_preview_lock'
    previous_pid=$("$BB" cat "$LOCK/pid" 2>/dev/null)
    case "$previous_pid" in
        ''|*[!0-9]*|0) fail 'invalid_preview_lock_owner' ;;
    esac
    if kill -0 "$previous_pid" 2>/dev/null; then
        fail 'another_preview_is_running'
    fi
    "$BB" rm -f "$LOCK/pid" && "$BB" rmdir "$LOCK" || fail 'cannot_reclaim_preview_lock'
    "$BB" mkdir "$LOCK" 2>/dev/null || fail 'another_preview_acquired_lock'
    printf '%s\n' 'stale_lock_reclaimed=1'
fi
lock_owned=1
(set -C; printf '%s\n' "$$" > "$LOCK/pid") || fail 'cannot_record_preview_lock_owner'

# Read only two numeric fields from FBInk's state. Never eval its output or
# write the full state (which includes unnecessary device metadata) to USB.
state=$(LD_LIBRARY_PATH=/var/local/kmc/lib "$FBINK" -e 2>/dev/null)
state_rc=$?
printf 'fbink_initialization_rc=%s\n' "$state_rc"
[ "$state_rc" -eq 0 ] || fail 'fbink_initialization_failed'
screen_width=$(printf '%s\n' "$state" | "$BB" tr ';' '\n' |
    "$BB" sed -n 's/^screenWidth=\([0-9][0-9]*\)$/\1/p')
screen_height=$(printf '%s\n' "$state" | "$BB" tr ';' '\n' |
    "$BB" sed -n 's/^screenHeight=\([0-9][0-9]*\)$/\1/p')
unset state
[ "$screen_width" = 600 ] && [ "$screen_height" = 800 ] || fail 'expected_600x800_portrait_screen'
printf '%s\n' 'screen_width=600' 'screen_height=800' 'gui_left_running=1'

"$BB" sleep 1 || fail 'initial_delay_interrupted'
# Restore even if drawing fails after partially changing the framebuffer.
restore_needed=1
LD_LIBRARY_PATH=/var/local/kmc/lib "$FBINK" -c -f -w -V -W GC16 -i "$IMAGE" >/dev/null 2>&1
render_rc=$?
printf 'render_rc=%s\n' "$render_rc"
[ "$render_rc" -eq 0 ] || fail 'fbink_render_failed'
printf '%s\n' 'preview_duration_seconds=15'
"$BB" sleep 15 || fail 'preview_delay_interrupted'
preview_finished=1
# EXIT cleanup refreshes the active GUI and releases the lock.
exit 0
