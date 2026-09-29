#!/bin/sh
# Name: Diagnostico pantalla
# Author: Kindle Newspaper
# DontUseFBInk
# Read technical display state after Home is ready. Never run on the Mac.
# No installation, network, service changes, or remounts. FBInk only reads
# display state; the final status message uses the stock eips utility.
umask 077
ulimit -c 0
base=/mnt/us/newspaper-diagnostics
[ "$(uname -s 2>/dev/null)" = Linux ] || exit 1
[ "$(cat "$base/OWNER.txt" 2>/dev/null)" = 'Kindle Newspaper diagnostics only' ] || exit 1
mkdir "$base/display-004.lock" 2>/dev/null || exit 0
(set -C; : > "$base/display-004.txt") 2>/dev/null || exit 1
exec >> "$base/display-004.txt" 2>&1
printf '%s\n' 'display_probe_started=1'
printf 'uid='; id -u
printf 'kernel='; uname -r
printf 'machine='; uname -m
printf 'uptime_seconds='; cut -d ' ' -f 1 /proc/uptime
awk '/^btime / { print "boot_time=" $2 }' /proc/stat
[ "$(id -u)" = 0 ] || exit 1
firmware=$(awk 'NR == 1 {print $1 " " $2; exit}' /mnt/us/system/version.txt)
[ "$firmware" = 'Kindle 5.12.2.2' ] || exit 1
printf '%s\n' 'cpu_capabilities_begin'
awk '/^(Processor|model name|Features|CPU architecture|Hardware)[[:space:]]*:/ {print}' /proc/cpuinfo
printf '%s\n' 'cpu_capabilities_end' 'framebuffer_devices_begin'
ls -l /dev/fb0 /dev/fb1
cat /proc/fb
if [ -r /sys/class/graphics/fb0/name ]; then cat /sys/class/graphics/fb0/name; fi
printf '%s\n' 'framebuffer_devices_end' 'runtime_links_begin'
readlink /lib/ld-linux.so.3
readlink /lib/libc.so.6
readlink /lib/libm.so.6
printf '%s\n' 'runtime_links_end' 'loader_dependencies_begin'
bin=/var/local/kmc/bin/fbink
LD_LIBRARY_PATH=/var/local/kmc/lib /lib/ld-linux.so.3 --list "$bin"
printf 'loader_dependencies_rc=%s\n' "$?"
printf '%s\n' 'loader_dependencies_end' 'fbink_help_begin'
LD_LIBRARY_PATH=/var/local/kmc/lib "$bin" --help >/dev/null
printf 'fbink_help_rc=%s\n' "$?"
printf '%s\n' 'fbink_help_end' 'fbink_eval_with_library_path_begin'
# Keep stderr in this report; retain only dimensions from the stdout state.
state=$(LD_LIBRARY_PATH=/var/local/kmc/lib "$bin" -e)
result=$?
printf 'fbink_eval_with_library_path_rc=%s\n' "$result"
printf '%s\n' "$state" | tr ';' '\n' | sed -n '/^screenWidth=/p; /^screenHeight=/p; /^BPP=/p'
unset state
printf '%s\n' 'fbink_eval_with_library_path_end' 'fbink_eval_default_libraries_begin'
state=$(unset LD_LIBRARY_PATH; "$bin" -e)
result=$?
printf 'fbink_eval_default_libraries_rc=%s\n' "$result"
printf '%s\n' "$state" | tr ';' '\n' | sed -n '/^screenWidth=/p; /^screenHeight=/p; /^BPP=/p'
unset state
printf '%s\n' 'fbink_eval_default_libraries_end' 'display_probe_complete=1'
sync
eips 0 3 'Pantalla: informe guardado. USB.' >/dev/null 2>&1
exit 0
