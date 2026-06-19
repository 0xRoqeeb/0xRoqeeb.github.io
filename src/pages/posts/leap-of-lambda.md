---
layout: '@/templates/BasePost.astro'
title: Leap of Lambda - CyberWarFare Labs
description: Investigating AWS Lambda privilege escalation through CloudTrail log analysis and SIEM correlation.
pubDate: 2026-06-19T00:00:00Z
imgSrc: 'https://infinitylearning-images.s3.eu-west-2.amazonaws.com/images/public/Cloud+Blue+Team+Images/AWS-Lambda-01-Investigating-Privilege-Leap-via-Function-Exploitation%402x.webp'
imgAlt: 'Leap of Lambda CyberWarFare Labs'
tags: ['cyberwarfare', 'cloud', 'easy', 'aws', 'dfir', 'privesc']
---

# Leap of Lambda — CyberWarFare Labs

**Platform:** CyberWarFare Labs  
**Category:** AWS Cloud Security / Blue Team  
**Difficulty:** Easy

## Scenario

As part of Secure-Corp's security team, I was tasked with investigating a suspicious privilege escalation incident involving an AWS Lambda function. The Lambda function — originally set up with restricted permissions — appeared to have acquired elevated privileges, possibly through misconfigured IAM roles or exploitation techniques like SSRF.

The goal was to track the attacker's actions, determine how the function's permissions were escalated, and identify any attempts to assume additional IAM roles using CloudTrail logs and SIEM monitoring.

## Attack Flow Overview

The attack chain here follows a common cloud privilege escalation pattern:

1. An adversary invokes a Lambda function
2. The Lambda function's execution role is abused to assume a more privileged IAM role via `sts:AssumeRole`
3. Temporary credentials are obtained via `GetSessionToken`
4. The attacker operates under the elevated identity

With that mental model in place, I started digging through the SIEM.

---

## Investigation

### Step 1: Targeted Investigation of CloudTrail Logs

The first thing I did was scope the investigation to CloudTrail logs. CloudTrail records detailed API activity across AWS — event time, source, name, user identity, resource info — making it the primary source of truth for cloud security investigations.

```kql
event.dataset: "aws.cloudtrail"
```

This gives a broad view. The next step was narrowing it down to something actionable.

---

### Step 2: Prioritizing the Invoke Request

Lambda functions frequently act as gateways to sensitive operations, making `InvokeFunction` events high-value targets for investigation. I filtered for Lambda invocation activity:

```kql
event.dataset: "aws.cloudtrail" and event.provider: "lambda.amazonaws.com" and event.action : "Invoke"
```

Reviewing the results, I was able to identify the specific Lambda function that was invoked or targeted by the adversary. It's worth noting that in a production environment this query may include legitimate invocations — effective correlation with fields like username, IP address, and timestamps is needed to separate noise from signal.

---

### Step 3: Monitoring the LambdaExecutionRole

With the malicious invocation identified, the next step was to investigate the associated `LambdaExecutionRole`. This role is the identity assumed by the Lambda function during execution — not a traditional user account, but it functions as a principal in AWS logs and becomes a critical pivot point if misconfigured.

```kql
event.dataset: "aws.cloudtrail" and user.name: "LambdaExecutionRole" and aws.cloudtrail.request_parameters : *Bucket-mgmgt-Functionbuk*
```

Lambda functions with overly permissive roles can be used to escalate privileges by assuming other IAM roles via `sts:AssumeRole`. This is exactly what I was looking for.

---

### Step 4: Investigating AssumeRole Activity

Once the `LambdaExecutionRole` was confirmed as active, I investigated whether it used `sts:AssumeRole` to take on a higher-privileged identity within the environment:

```kql
event.dataset: "aws.cloudtrail" and event.action: "AssumeRole" and traefik.access.user_agent.original: "lambda.amazonaws.com"
```

This confirmed the escalation path. The Lambda function assumed a role with significantly higher privileges than its own, which would allow an attacker to move laterally or gain administrative access to the AWS environment.

---

### Step 5: Validating with GetSessionToken

The assumed role activity on its own could look legitimate. To validate intent, I correlated it with `GetSessionToken` events — a common precursor when an attacker uses temporary credentials to impersonate a privileged identity:

```kql
event.dataset: "aws.cloudtrail" and event.action : "GetSessionToken"
```

`GetSessionToken` followed by `AssumeRole` is a legitimate pattern when MFA is enforced, but it can also be abused. By correlating these events, I was able to link the assumed role back to a specific username and confirm the activity was malicious — not routine access.

---

## Findings

Working through the log correlation, I traced the full attack chain:

- A Lambda function was invoked and acted as the initial entry point
- The function's `LambdaExecutionRole` was used to call `sts:AssumeRole` against a higher-privileged role
- `GetSessionToken` activity confirmed temporary credentials were obtained under the escalated identity
- The `user_identity.arn` associated with the privilege escalation was identified, completing the investigation

## Conclusion

The unauthorized privilege escalation via AWS Lambda was successfully traced end-to-end. The attacker exploited an overly permissive IAM execution role attached to the Lambda function to assume a more powerful identity within the environment.

Key takeaways:
- **Least privilege matters** — Lambda execution roles should have only the permissions they need
- **`AssumeRole` activity is a red flag** — especially when originating from a Lambda function's role
- **Log correlation is everything** — no single event tells the full story; linking `Invoke` → `AssumeRole` → `GetSessionToken` revealed the complete chain

This is a great example of how cloud privilege escalation differs from traditional environments — there's no shell, no binary exploit, just API calls and IAM misconfigurations.
