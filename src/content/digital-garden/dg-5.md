---
title: 'Linux & ProxMox Commands'
description: Troubleshooting
publishDate: 'Dec 12 2025'
status: '🌱 seedling'
tags:
  - Linux
  - Promox
  - Troubleshooting
---

## Troubleshooting

1.  journalctl, -xe, -u"service", -u "docker" -f        systemD logs
2.  systemctl, status "service", restart "service",     what a service is doing
3.  top, htop, btop
4.  dmesg, --level=err, -w, 
5.  lsblk, -f,
6.  df, -h, 
7.  du,
8.  free -h,                                            total memory, swap
9.  ss, -tulpn, -tunap, 
10. ps                                                  user processes
11. nginx -t,                                           config
