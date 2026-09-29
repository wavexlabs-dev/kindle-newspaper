#!/bin/sh
# Name: Diagnostico autonomia
# Author: Kindle Newspaper
# DontUseFBInk
# Read-only capability probe. No service, Wi-Fi, RTC or power-state changes.
umask 077
ulimit -c 0
PATH=/usr/bin:/bin:/usr/sbin:/sbin
export PATH
BASE=/mnt/us/newspaper-diagnostics
BB=/bin/busybox
[ -x "$BB" ] && [ "$("$BB" uname -s 2>/dev/null)" = Linux ] || exit 1
[ ! -L "$BASE" ] && [ ! -L "$BASE/OWNER.txt" ] || exit 1
[ "$("$BB" cat "$BASE/OWNER.txt" 2>/dev/null)" = 'Kindle Newspaper diagnostics only' ] || exit 1
"$BB" mkdir "$BASE/autonomy-006.lock" 2>/dev/null || exit 0
(set -C; : > "$BASE/autonomy-006.txt") || exit 1
exec >> "$BASE/autonomy-006.txt" 2>&1
printf '%s\n' 'autonomy_probe_started=1'
printf 'uid='; "$BB" id -u
[ "$("$BB" id -u)" = 0 ] || { printf '%s\n' 'error=root_required'; exit 1; }
[ "$("$BB" awk 'NR==1 {print $1 " " $2; exit}' /mnt/us/system/version.txt)" = 'Kindle 5.12.2.2' ] || { printf '%s\n' 'error=firmware_mismatch'; exit 1; }
date -u '+utc=%Y-%m-%dT%H:%M:%SZ'
for tool in curl wget lipc-get-prop lipc-set-prop lipc-wait-event lipc-probe powerd_test initctl evtest python python3 lua luajit rtcwake; do
    printf 'tool_%s=' "$tool"; command -v "$tool" || :
done
printf '%s\n' 'busybox_capabilities_begin'
/bin/busybox --list | grep -E '^(awk|date|dd|hexdump|od|readlink|sha256sum|stat|timeout|usleep|setsid|nohup|rtcwake|start-stop-daemon)$'
printf '%s\n' 'busybox_capabilities_end' 'curl_version_begin'
curl --version
printf '%s\n' 'curl_version_end' 'https_test_begin'
curl --silent --show-error --connect-timeout 10 --max-time 20 --max-filesize 32768 \
    --output /dev/null --write-out 'https_status=%{http_code}\n' https://example.com/
printf 'https_rc=%s\n' "$?"
printf '%s\n' 'https_test_end' 'powerd_state_begin'
powerd_test -s
printf '%s\n' 'powerd_state_end'
for prop in state preventScreenSaver rtcWakeup; do
    printf 'powerd_%s=' "$prop"
    lipc-get-prop com.lab126.powerd "$prop" 2>/dev/null || :
done
printf 'wifi_state='
lipc-get-prop com.lab126.wifid cmState 2>/dev/null || :
printf '%s\n' 'powerd_properties_begin'
lipc-probe -a com.lab126.powerd 2>/dev/null
printf '%s\n' 'powerd_properties_end' 'services_begin'
initctl list | grep -E '^(framework|lab126_gui|powerd|wifid|wifim|wifis|tmd|pillow|volumd|splash)' || :
printf '%s\n' 'services_end' 'rtc_paths_begin'
for path in /sys/class/rtc/rtc*/name /sys/class/rtc/rtc*/wakealarm /sys/devices/platform/*rtc*/wakeup_enable /sys/power/state; do
    if [ -r "$path" ]; then printf '%s=' "$path"; cat "$path"; fi
done
printf '%s\n' 'rtc_paths_end' 'input_devices_begin'
awk '/^N: Name=|^H: Handlers=|^B: (EV|KEY|ABS)=/ {print}' /proc/bus/input/devices
printf '%s\n' 'input_devices_end' 'autonomy_probe_complete=1'
sync
eips 0 3 'Autonomia guardada. Conecta USB.' >/dev/null 2>&1
exit 0
