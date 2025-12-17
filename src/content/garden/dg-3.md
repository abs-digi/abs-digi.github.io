---
title: 'Setting Up Proxmox'
description: 'Notes on installing and configuring Proxmox virtualization platform'
created: '2025-12-16'
status: 'seedling'
tags:
  - proxmox
  - virtualization
  - homelab
---

# Setting Up Proxmox

*This is a seedling note—rough thoughts that will grow over time.*

## Introduction

Proxmox Virtual Environment (Proxmox VE) is an open-source server virtualization platform that combines KVM hypervisor and LXC containers. This note documents my journey setting up Proxmox for my homelab.

## Installation Steps

1. **Download ISO** from [Proxmox website](https://www.proxmox.com/en/downloads)
2. **Create bootable USB** using Ventoy or BalenaEtcher
3. **Boot from USB** and follow graphical installer
4. **Configure network** – set static IP, hostname, DNS
5. **Set root password** and email for notifications
6. **Select installation disk** (usually the entire drive)
7. **Complete installation** and reboot

## Initial Configuration

After installation, access the web interface at `https://<server-ip>:8006`.

- **Update package repositories**: `apt update && apt upgrade`
- **Configure storage**: Add local storage, NFS, or Ceph
- **Set up backup**: Configure scheduled backups to external storage
- **Create network bridges**: For VM networking

## Creating Virtual Machines

1. **Download ISO templates** (Debian, Ubuntu, Windows, etc.)
2. **Create VM** with appropriate resources (CPU, RAM, disk)
3. **Install guest OS** using ISO
4. **Install Proxmox guest agent** for better integration
5. **Take snapshots** before major changes

## Container Management

Proxmox also supports LXC containers for lightweight virtualization.

- **Create container** from template
- **Configure resource limits**
- **Use bind mounts** for host directories

## Troubleshooting

Common issues and solutions:

- **Can't access web interface**: Check firewall, ensure Proxmox service is running
- **VM won't start**: Verify storage availability, check logs
- **Network problems**: Validate bridge configuration, check `/etc/network/interfaces`

## References

- [Proxmox Documentation](https://pve.proxmox.com/wiki/Main_Page)
- [Awesome Proxmox](https://github.com/awesome-proxmox/awesome-proxmox)
- [Proxmox Subreddit](https://www.reddit.com/r/Proxmox/)

## Next Steps

- [ ] Set up cluster for high availability
- [ ] Configure ZFS storage
- [ ] Implement automated backups
- [ ] Explore Proxmox Backup Server

---

*Last updated: December 2025*