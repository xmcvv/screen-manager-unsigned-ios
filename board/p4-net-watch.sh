#!/bin/sh
# Re-apply the USB-NCM address after a P4 OTA/reboot re-enumerates usb1.
# carplay_up.sh also performs this check; this tiny watcher keeps the link
# recoverable while carplay_up itself is being restarted or debugged.

while :; do
    if [ -d /sys/class/net/usb1 ]; then
        if ! ip -4 addr show usb1 2>/dev/null | grep -q "192.168.77.2"; then
            ifconfig usb1 192.168.77.2 netmask 255.255.255.0 up 2>/dev/null
            echo "p4-net-watch: restored usb1 192.168.77.2 at $(cat /proc/uptime)" \
                >> /mnt/p4_net_watch.log
        fi
    fi
    sleep 2
done
