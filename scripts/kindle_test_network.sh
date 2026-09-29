#!/bin/sh
# Name: Prueba WiFi
# Author: Kindle Newspaper
# DontUseFBInk
# Bounded, authenticated test; leaves stock services and power settings intact.
umask 077
PATH=/usr/bin:/bin:/usr/sbin:/sbin
export PATH
BB=/bin/busybox
BASE=/mnt/us/newspaper-network
FBINK=/var/local/kmc/bin/fbink
[ -x "$BB" ] && [ "$("$BB" uname -s)" = Linux ] || exit 1
[ ! -L "$BASE" ] && [ "$(cat "$BASE/OWNER.txt" 2>/dev/null)" = 'Kindle Newspaper network test v1' ] || exit 1
n=1
while :; do
    report="$BASE/network-$n.txt"
    if (set -C; : > "$report") 2>/dev/null; then break; fi
    n=$((n + 1))
    [ "$n" -lt 1000 ] || exit 1
done
exec >> "$report" 2>&1
printf 'network_test_started=1\nutc='
date -u '+%Y-%m-%dT%H:%M:%SZ'
finish() {
    rc=$?
    trap - 0
    printf 'network_exit_code=%s\n' "$rc"
    sync
    if [ "$rc" -ne 0 ]; then eips 0 2 'Prueba guardada. Conecta USB.' 2>/dev/null || :; fi
    exit "$rc"
}
trap finish 0
[ "$(id -u)" = 0 ] || exit 1
[ "$(awk 'NR==1 {print $1 " " $2; exit}' /mnt/us/system/version.txt)" = 'Kindle 5.12.2.2' ] || exit 1
for file in device.curl cacert.pem expected.sha256; do
    [ -f "$BASE/$file" ] && [ ! -L "$BASE/$file" ] || exit 1
done
printf 'wifi_state='
lipc-get-prop com.lab126.wifid cmState 2>/dev/null || :
eips 0 2 'Descargando portada por WiFi...' 2>/dev/null || :
IMAGE="$BASE/download-$n.png"
[ ! -e "$IMAGE" ] && [ ! -L "$IMAGE" ] || exit 1
/usr/bin/curl -q --config "$BASE/device.curl" --cacert "$BASE/cacert.pem" \
    --proto '=https' --tlsv1.2 --noproxy '*' --fail --silent --show-error \
    --connect-timeout 10 --max-time 25 --max-filesize 100000 \
    --output "$IMAGE" --write-out 'https_status=%{http_code}\nssl_verify_result=%{ssl_verify_result}\n' \
    'https://kindle-newspaper.vercel.app/device/test-cover.png'
rc=$?
printf 'download_rc=%s\n' "$rc"
[ "$rc" -eq 0 ] || exit 1
actual=$("$BB" sha256sum "$IMAGE")
expected=$(cat "$BASE/expected.sha256")
[ "${actual%% *}" = "$expected" ] || { printf 'error=checksum_mismatch\n'; exit 1; }
printf 'download_checksum_match=1\n'
init_output=$(LD_LIBRARY_PATH=/var/local/kmc/lib "$FBINK" -v </dev/null 2>&1 >/dev/null)
rc=$?
[ "$rc" -eq 0 ] || exit 1
dimensions=$(printf '%s\n' "$init_output" | "$BB" sed -n 's/^\[FBInk\] Variable fb info: \([0-9][0-9]*\)x\([0-9][0-9]*\), [0-9][0-9]*bpp @ rotation: [0-9][0-9]* (.*)$/\1 \2/p')
[ "$dimensions" = '600 800' ] || exit 1
LD_LIBRARY_PATH=/var/local/kmc/lib "$FBINK" -c -f -w -V -W GC16 -i "$IMAGE" >/dev/null
rc=$?
printf 'render_rc=%s\n' "$rc"
[ "$rc" -eq 0 ] || exit 1
printf 'network_test_complete=1\nvisual_confirmation=required\ngui_left_running=1\n'
sync
sleep 15
