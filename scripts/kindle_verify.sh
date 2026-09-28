#!/bin/sh
# Name: Diagnostico Kindle
# Author: Kindle Newspaper

# Run on the Kindle through HDNEXT SH_Integration, not on the Mac.
# Writes a new technical report to USB storage. Does not use the network,
# install packages, change OTA state, or read account/network credentials.
# `kpm version` may initialize/update KPM's own database as part of startup.

umask 077

if [ "$(uname -s 2>/dev/null)" != Linux ] ||
   [ ! -d /mnt/us/documents ] || [ ! -r /proc/uptime ] ||
   [ ! -r /mnt/us/system/version.txt ]; then
    printf '%s\n' 'This diagnostic must run on the intended Kindle.' >&2
    exit 1
fi

# Compare the product and complete firmware-version token without recording
# the version file or any device identifiers in the report.
firmware=$(awk 'NR == 1 { print $1 " " $2; exit }' /mnt/us/system/version.txt)
if [ "$firmware" != 'Kindle 5.12.2.2' ]; then
    printf '%s\n' 'Unsupported firmware; expected Kindle 5.12.2.2.' >&2
    exit 1
fi

n=1
out="/mnt/us/kt2-diagnostic-$n.txt"
while [ -e "$out" ] || [ -L "$out" ]; do
    n=$((n + 1))
    out="/mnt/us/kt2-diagnostic-$n.txt"
done

# Do not replace an existing report, even if another invocation races us.
(set -C; : > "$out") 2>/dev/null || exit 1
exec >> "$out" 2>&1

printf '%s\n' 'KT2 diagnostic v1'
printf 'utc='
date -u '+%Y-%m-%dT%H:%M:%SZ'
printf 'uid='
id -u
printf 'uptime_seconds='
cut -d ' ' -f 1 /proc/uptime
awk '/^btime / { print "boot_time=" $2 }' /proc/stat

flag() {
    if [ "$2" = executable ]; then
        if [ -x "$3" ]; then
            printf '%s=1\n' "$1"
        else
            printf '%s=0\n' "$1"
        fi
    else
        if [ -f "$3" ]; then
            printf '%s=1\n' "$1"
        else
            printf '%s=0\n' "$1"
        fi
    fi
}

flag kpm_executable executable /var/local/kmc/bin/kpm
flag kpm_library file /var/local/kmc/lib/libkpm.so
flag sh_launcher executable /var/local/kmc/bin/sh_integration_launcher
flag sh_extractor file /var/local/kmc/lib/sh_integration_extractor.so
flag patch_script file /var/local/kmc/system_patches/patch_system.sh
flag boot_hook file /etc/upstart/kmc.conf
flag fbink_internal executable /var/local/kmc/bin/fbink
flag fbink_usb executable /mnt/us/libkh/bin/fbink
flag dispatch_script file /usr/bin/logThis.sh

printf 'kmc_bin_target='
readlink /var/local/kmc/bin 2>/dev/null || printf '%s\n' 'unavailable'

# -e initializes FBInk and reads screen state without drawing a frame.
# Discard metadata: the exit code is sufficient for this diagnostic.
if [ -x /mnt/us/libkh/bin/fbink ]; then
    /mnt/us/libkh/bin/fbink -e >/dev/null 2>&1
    printf 'fbink_initialization_rc=%s\n' "$?"
else
    printf '%s\n' 'fbink_initialization_rc=not_run'
fi

printf '%s\n' 'kpm_version_output_begin'
if [ -x /var/local/kmc/bin/kpm ]; then
    LD_LIBRARY_PATH=/var/local/kmc/lib /var/local/kmc/bin/kpm version
    printf 'kpm_version_rc=%s\n' "$?"
else
    printf '%s\n' 'kpm_version_rc=not_run'
fi
printf '%s\n' 'kpm_version_output_end'

for name in otaupd otav3; do
    active="/usr/bin/$name"
    backup="/usr/bin/$name.bck"

    if [ ! -e "$active" ] && [ ! -L "$active" ] && [ -f "$backup" ]; then
        printf '%s_binary_state=renamed\n' "$name"
    elif [ -e "$active" ] || [ -L "$active" ]; then
        printf '%s_binary_state=original_present\n' "$name"
    else
        printf '%s_binary_state=neither_present\n' "$name"
    fi

    if command -v pidof >/dev/null 2>&1; then
        if pidof "$name" >/dev/null 2>&1; then
            printf '%s_running=1\n' "$name"
        else
            printf '%s_running=0\n' "$name"
        fi
    else
        printf '%s_running=unknown\n' "$name"
    fi
done

printf '%s\n' 'display_rendering=not_tested'
printf '%s\n' 'package_installation=not_tested'
printf '%s\n' 'diagnostic_complete=1'
sync
