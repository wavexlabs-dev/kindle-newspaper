#!/bin/sh
# One-shot diagnostic, invoked through the browser trigger without installing.
# Writes only in the project-owned directory, plus the existing diagnostic's
# own reports/KPM version initialization. Does not change system configuration.

umask 077
base=/mnt/us/newspaper-diagnostics
[ "$(uname -s 2>/dev/null)" = Linux ] || exit 1
[ -d /mnt/us/documents ] || exit 1
[ -r "$base/OWNER.txt" ] || exit 1
[ "$(cat "$base/OWNER.txt")" = 'Kindle Newspaper diagnostics only' ] || exit 1

# Transfer retries must not repeat the probe or KPM initialization.
mkdir "$base/run-001.lock" 2>/dev/null || exit 0
out="$base/report-001.txt"
(set -C; : > "$out") 2>/dev/null || exit 1
exec >> "$out" 2>&1
printf '%s\n' 'Kindle Newspaper direct probe v1' 'probe_started=1'
printf 'uid='
id -u
printf 'machine='
uname -m
printf 'utc='
date -u '+%Y-%m-%dT%H:%M:%SZ'
printf 'uptime_seconds='
cut -d ' ' -f 1 /proc/uptime
awk '/^btime / { print "boot_time=" $2 }' /proc/stat
sync

# Report matching status, not device identifiers or entire version files.
for path in /mnt/us/system/version.txt /etc/prettyversion.txt; do
    printf 'version_path=%s\n' "$path"
    if [ -r "$path" ]; then
        printf '%s\n' 'version_readable=1'
        version=$(awk 'NR == 1 { print $1 " " $2; exit }' "$path")
        if [ "$version" = 'Kindle 5.12.2.2' ]; then
            printf '%s\n' 'firmware_matches=1'
        else
            printf '%s\n' 'firmware_matches=0'
        fi
    else
        printf '%s\n' 'version_readable=0'
    fi
done

for app in sh base64 xz tar gzip cp sqlite3 chattr busybox curl; do
    printf 'command_%s=' "$app"
    command -v "$app" || printf '%s\n' 'unavailable'
    for folder in /bin /usr/bin /sbin /usr/sbin; do
        if [ -x "$folder/$app" ]; then
            printf 'available_binary=%s/%s\n' "$folder" "$app"
        fi
    done
done
if [ -x /bin/busybox ]; then
    printf '%s\n' 'busybox_relevant_applets_begin'
    /bin/busybox --list 2>/dev/null |
        awk '/^(base64|xz|unxz|tar|gzip|gunzip|sha256sum)$/'
    printf '%s\n' 'busybox_relevant_applets_end'
fi
printf '%s\n' 'filesystem_space_begin'
df -k /tmp /var/local /mnt/us
printf '%s\n' 'filesystem_space_end'

for path in \
    /lib/ld-linux.so.3 /lib/ld-linux-armhf.so.3 \
    /tmp/kmc /var/local/kmc /var/local/kmc/bin /var/local/kmc/lib \
    /var/local/kmc/kindlepw2/bin/fbink \
    /var/local/kmc/kindlepw2/bin/gandalf \
    /var/local/kmc/kindlepw2/bin/kpm \
    /var/local/kmc/kindlepw2/lib/libkpm.so \
    /var/local/kmc/system_patches/patch_system.sh \
    /var/local/mkk/gandalf /var/local/mkk/su \
    /mnt/us/libkh/bin/fbink /etc/upstart/kmc.conf \
    /usr/bin/logThis.sh /PRE_GM_DEBUGGING_FEATURES_ENABLED__REMOVE_AT_GMC \
    /usr/bin/otaupd /usr/bin/otaupd.bck /usr/bin/otav3 /usr/bin/otav3.bck; do
    if [ -e "$path" ] || [ -L "$path" ]; then
        ls -ld "$path"
    else
        printf 'missing=%s\n' "$path"
    fi
done
printf '%s\n' 'existing_diagnostic_begin'
sync
/bin/sh /mnt/us/documents/KT2_Diagnostico.sh
printf 'existing_diagnostic_rc=%s\n' "$?"
printf '%s\n' 'probe_complete=1'
sync
if command -v eips >/dev/null 2>&1; then
    eips 0 3 'Diagnostico guardado. Conecta USB.' >/dev/null 2>&1
fi
