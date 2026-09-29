#!/bin/sh
# Technical checks only; kpm version may initialize its package-manager DB.
base=/mnt/us/newspaper-repair
failed=0
pass() { printf '%s=1\n' "$1"; }
fail() { printf '%s=0\n' "$1"; failed=$((failed + 1)); }
printf 'uid='; id -u
printf 'uptime_seconds='; cut -d ' ' -f 1 /proc/uptime
awk '/^btime / { print "boot_time=" $2 }' /proc/stat
[ "$(id -u)" = 0 ] || exit 1
[ -r "$base/payload.sha256" ] || exit 1
if (cd /var/local/kmc && /bin/busybox sha256sum -c "$base/payload.sha256" >/dev/null); then
    pass installed_payload_matches
else
    fail installed_payload_matches
fi
for item in fbink kpm gandalf sh_integration_launcher; do
    if [ -x "/var/local/kmc/bin/$item" ]; then pass "executable_$item"; else fail "executable_$item"; fi
done
if [ -u /var/local/kmc/bin/gandalf ]; then pass gandalf_setuid; else fail gandalf_setuid; fi
for directory in /var/local/kmc /var/local/mkk /var/local/kmc/kindlepw2 \
    /var/local/kmc/kindlepw2/bin /var/local/kmc/kindlepw2/lib; do
    permission=$(ls -ld "$directory" 2>/dev/null | cut -c 10)
    if [ "$permission" = x ] || [ "$permission" = t ]; then
        pass "traversable_$directory"
    else
        fail "traversable_$directory"
    fi
done
if [ "$(readlink /var/local/kmc/bin)" = /var/local/kmc/kindlepw2/bin ]; then
    pass platform_link
else
    fail platform_link
fi
if LD_LIBRARY_PATH=/var/local/kmc/lib /var/local/kmc/bin/fbink -e >/dev/null 2>&1; then
    pass fbink_initializes
else
    fail fbink_initializes
fi
version=$(LD_LIBRARY_PATH=/var/local/kmc/lib /var/local/kmc/bin/kpm version 2>&1)
version_rc=$?
printf '%s\n' 'kpm_version_begin' "$version" 'kpm_version_end'
if [ "$version_rc" = 0 ] && printf '%s\n' "$version" | grep -q 'cli v' &&
   printf '%s\n' "$version" | grep -q 'libkpm v' &&
   printf '%s\n' "$version" | grep -q 'built for platform: kindlepw2'; then
    pass kpm_responds
else
    fail kpm_responds
fi
if [ -s /mnt/us/libkh/bin/fbink ] &&
   [ "$(/bin/busybox sha256sum /mnt/us/libkh/bin/fbink | cut -d ' ' -f 1)" = \
     "$(/bin/busybox sha256sum /var/local/kmc/bin/fbink | cut -d ' ' -f 1)" ]; then
    pass fbink_usb_matches
else
    fail fbink_usb_matches
fi
if [ -s /etc/upstart/kmc.conf ]; then pass boot_hook; else fail boot_hook; fi
if [ -s /usr/bin/logThis.sh ] &&
   [ "$(/bin/busybox sha256sum /usr/bin/logThis.sh | cut -d ' ' -f 1)" = \
     "$(/bin/busybox sha256sum /var/local/kmc/system_patches/dispatch.sh | cut -d ' ' -f 1)" ]; then
    pass dispatch_matches
else
    fail dispatch_matches
fi
for marker in /PRE_GM_DEBUGGING_FEATURES_ENABLED__REMOVE_AT_GMC /MNTUS_EXEC; do
    if [ -f "$marker" ]; then pass "flag_$marker"; else fail "flag_$marker"; fi
done
count=$(sqlite3 /var/local/appreg.db "SELECT count(*) FROM properties WHERE handlerId='tech.hackerdude.shell_integration.extractor';")
printf 'extractor_property_count=%s\n' "$count"
if [ "$count" = 2 ]; then pass extractor_registered; else fail extractor_registered; fi
count=$(sqlite3 /var/local/appreg.db "SELECT count(*) FROM associations WHERE handlerId='tech.hackerdude.shell_integration.launcher' AND contentId='MT:text/x-shellscript';")
if [ "$count" = 1 ]; then pass launcher_registered; else fail launcher_registered; fi
if [ -d /usr/lib/ccat ]; then
    if [ -s /usr/lib/ccat/sh_integration_extractor.so ] &&
       [ "$(/bin/busybox sha256sum /usr/lib/ccat/sh_integration_extractor.so | cut -d ' ' -f 1)" = \
         "$(/bin/busybox sha256sum /var/local/kmc/lib/sh_integration_extractor.so | cut -d ' ' -f 1)" ]; then
        pass extractor_copy_matches
    else
        fail extractor_copy_matches
    fi
fi
for item in otaupd otav3; do
    if [ ! -e "/usr/bin/$item" ] && [ ! -L "/usr/bin/$item" ] && [ -s "/usr/bin/$item.bck" ]; then
        pass "${item}_renamed"
    else
        fail "${item}_renamed"
    fi
    if pidof "$item" >/dev/null 2>&1; then fail "${item}_stopped"; else pass "${item}_stopped"; fi
done
if [ -f /etc/uks.sqsh ]; then
    if [ "$(md5sum /etc/uks.sqsh | cut -d ' ' -f 1)" = 17b5ca595e70ffeee1424ed5e7f09c47 ]; then pass update_key; else fail update_key; fi
else
    if [ "$(md5sum /etc/uks/pubdevkey01.pem | cut -d ' ' -f 1)" = 7130ce39bb3596c5067cabb377c7a9ed ]; then pass update_key; else fail update_key; fi
fi
if awk '$2 == "/" { n=split($4,a,","); for(i=1;i<=n;i++) if(a[i]=="ro") found=1 } END { exit !found }' /proc/mounts; then
    pass root_readonly
else
    fail root_readonly
fi
printf 'failed_checks=%s\n' "$failed"
[ "$failed" = 0 ]
