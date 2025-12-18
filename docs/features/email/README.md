# Email Notifications

Complete guide to email notifications and SMTP configuration in EZTest.

---

## Overview

EZTest supports email notifications via SMTP for various events and actions. The email system is designed to be flexible, secure, and easy to configure.

### Key Features

- ✅ **Password Reset** - Email with reset link
- ✅ **OTP Verification** - One-time password for authentication
- ✅ **Defect Assignment** - Notify when defects are assigned
- ✅ **Defect Updates** - Notify on status/priority changes
- ✅ **Defect Comments** - Notify on new comments
- ✅ **Test Run Reports** - Send test execution reports
- ✅ **User Updates** - Notify on profile changes
- ✅ **Project Invitations** - Welcome new team members

---

## Quick Start

### 1. Enable Email Service

Add to your `.env` file:

```env
# Enable email functionality
ENABLE_SMTP="true"

# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="EZTest <noreply@yourdomain.com>"
SMTP_SECURE="false"
```

### 2. Verify Configuration

Check if email service is available:

```bash
curl http://localhost:3000/api/email/status
```

Response:
```json
{
  "available": true,
  "message": "Email service is configured and ready"
}
```

---

## Email Types

### 1. Password Reset Email

**Trigger:** User requests password reset

**Recipients:** User requesting reset

**Content:**
- Reset link with token
- Expiration time
- Security notice

**Configuration:** Automatic when SMTP is enabled

---

### 2. OTP Verification Email

**Trigger:** User registration or sensitive operations

**Recipients:** User email address

**Content:**
- 6-digit OTP code
- Expiration time (10 minutes)
- Purpose (registration, password reset, etc.)

**Note:** If `ENABLE_SMTP=false`, OTP verification is automatically bypassed

---

### 3. Defect Assignment Email

**Trigger:** Defect is assigned to a user

**Recipients:** Assigned user

**Content:**
- Defect title and description
- Severity and priority badges
- Project name
- Assignor information
- Direct link to defect

**Example:**
```
Subject: 🐛 Defect Assigned: Login fails with special characters

A new defect has been assigned to you:
- Title: Login fails with special characters
- Severity: High
- Priority: Medium
- Project: E-Commerce Platform
- Assigned by: John Doe

[View Defect] button
```

---

### 4. Defect Update Email

**Trigger:** Defect status or priority changes

**Recipients:** Defect assignee and creator

**Content:**
- Defect title and key
- What changed (status, priority, etc.)
- Updated by information
- Link to defect

**Example:**
```
Subject: 🔄 Defect Updated: DEF-001 - Login fails

Defect DEF-001 has been updated:
- Status: OPEN → IN_PROGRESS
- Updated by: Jane Smith

[View Defect] button
```

---

### 5. Defect Comment Email

**Trigger:** New comment added to defect

**Recipients:**
- Defect assignee
- Defect creator
- Previous commenters (excluding comment author)

**Content:**
- Comment text
- Defect information
- Comment author
- Link to defect

---

### 6. Test Run Report Email

**Trigger:** Manual request to send test run report

**Recipients:**
- System Admins
- Project Managers (project members)
- Defect assignees (if tests failed/blocked)

**Content:**
- Test run name and description
- Environment information
- Test statistics:
  - Passed count
  - Failed count
  - Blocked count
  - Skipped count
  - Pass rate percentage
- Link to test run

**Example:**
```
Subject: 📊 Test Run Report: Sprint 10 Regression

Test Run: Sprint 10 Regression
Environment: Production
Pass Rate: 85%

Statistics:
✅ Passed: 45
❌ Failed: 3
⚠️ Blocked: 2
⏭️ Skipped: 5

[View Test Run] button
```

---

### 7. User Update Email

**Trigger:** Admin updates user profile

**Recipients:** Updated user

**Content:**
- What changed (role, status, etc.)
- Updated by information
- Link to profile

---

### 8. Project Invitation Email

**Trigger:** User added to project

**Recipients:** New project member

**Content:**
- Project name and description
- Inviter information
- Project role
- Link to project

---

## SMTP Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ENABLE_SMTP` | Yes | Set to `"true"` to enable email |
| `SMTP_HOST` | Yes* | SMTP server hostname |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | Yes* | SMTP username |
| `SMTP_PASS` | Yes* | SMTP password |
| `SMTP_FROM` | Yes* | Sender email address |
| `SMTP_SECURE` | No | Use SSL (true for 465, false for 587) |

\* Required if `ENABLE_SMTP=true`

### SMTP Providers

#### Gmail

```env
ENABLE_SMTP="true"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-char-app-password"
SMTP_FROM="your-email@gmail.com"
SMTP_SECURE="false"
```

**Setup Steps:**
1. Enable 2FA: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password as `SMTP_PASS`

---

#### Outlook/Office 365

```env
ENABLE_SMTP="true"
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
SMTP_FROM="your-email@outlook.com"
SMTP_SECURE="false"
```

---

#### SendGrid

```env
ENABLE_SMTP="true"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"
SMTP_SECURE="false"
```

---

#### Mailgun

```env
ENABLE_SMTP="true"
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-password"
SMTP_FROM="noreply@your-domain.com"
SMTP_SECURE="false"
```

---

#### Amazon SES

```env
ENABLE_SMTP="true"
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="your-ses-smtp-username"
SMTP_PASS="your-ses-smtp-password"
SMTP_FROM="noreply@yourdomain.com"
SMTP_SECURE="false"
```

---

#### MinIO / Self-Hosted

For development/testing, you can use a local SMTP server or disable emails:

```env
# Disable emails (development)
ENABLE_SMTP="false"
```

---

## API Endpoints

### Check Email Status

```http
GET /api/email/status
```

**Response:**
```json
{
  "available": true,
  "message": "Email service is configured and ready"
}
```

**Use Cases:**
- Verify SMTP configuration
- Check if emails can be sent
- UI can show/hide email options

---

### Send Defect Assignment Email

```http
POST /api/defects/[defectId]/send-assignment-email
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "assigneeId": "user-id"  // Optional if defect already assigned
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

### Send Test Run Report

```http
POST /api/testruns/[testRunId]/send-report
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Report sent to 3 recipient(s)",
  "recipients": 3
}
```

---

## How It Works

### Email Service Flow

```
1. User Action (e.g., assign defect)
   ↓
2. Check if ENABLE_SMTP=true
   ↓
3. Validate SMTP configuration
   ↓
4. Fetch required data (user, defect, etc.)
   ↓
5. Generate email template
   ↓
6. Send via SMTP
   ↓
7. Log result (success/failure)
```

### When Emails Are Disabled

If `ENABLE_SMTP=false`:
- ✅ Application continues to work normally
- ✅ OTP verification is automatically bypassed
- ✅ No email sending attempts
- ✅ No errors shown to users
- ✅ Clear logging (server-side only)

---

## Email Templates

All emails use professional HTML templates with:
- EZTest branding
- Responsive design
- Clear call-to-action buttons
- Color-coded badges (severity, priority, status)
- Direct links to relevant pages

### Template Features

- **HTML Formatting** - Professional styling
- **Mobile Responsive** - Works on all devices
- **Accessible** - Screen reader friendly
- **Branded** - EZTest colors and logo
- **Actionable** - Direct links to take action

---

## Configuration Examples

### Development (No Email)

```env
ENABLE_SMTP="false"
```

**Benefits:**
- No SMTP setup required
- Faster development
- No accidental emails
- OTP verification bypassed

---

### Production (Gmail)

```env
ENABLE_SMTP="true"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourcompany.com"
SMTP_PASS="your-app-password"
SMTP_FROM="EZTest <noreply@yourcompany.com>"
SMTP_SECURE="false"
```

---

### Production (SendGrid)

```env
ENABLE_SMTP="true"
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="SG.your-sendgrid-api-key"
SMTP_FROM="EZTest <noreply@yourdomain.com>"
SMTP_SECURE="false"
```

---

## Troubleshooting

### Email Not Sending

**Check 1: SMTP Enabled**
```bash
# Verify ENABLE_SMTP is set
echo $ENABLE_SMTP  # Should be "true"
```

**Check 2: Configuration**
```bash
# Check email status
curl http://localhost:3000/api/email/status
```

**Check 3: Logs**
- Check application logs for email errors
- Look for `[EMAIL]` prefixed messages
- Common errors:
  - `ECONNREFUSED` - SMTP server not reachable
  - `EAUTH` - Authentication failed
  - `ETIMEDOUT` - Connection timeout

**Check 4: Firewall**
- Ensure outbound SMTP (port 587/465) is allowed
- Some hosting providers block SMTP ports

---

### Gmail-Specific Issues

**Problem:** Authentication fails

**Solutions:**
1. Enable 2FA on Google account
2. Generate App Password (not regular password)
3. Use App Password as `SMTP_PASS`
4. Verify "Less secure app access" is not needed (deprecated)

---

### SendGrid/Mailgun Issues

**Problem:** Emails not delivered

**Solutions:**
1. Verify sender domain
2. Check API key permissions
3. Verify sender reputation
4. Check spam folder

---

## Best Practices

### Security

1. **Never commit credentials** - Use environment variables
2. **Use App Passwords** - For Gmail and similar providers
3. **Enable TLS/SSL** - Use `SMTP_SECURE` appropriately
4. **Rotate credentials** - Regularly update passwords
5. **Limit access** - Use dedicated email account

### Configuration

1. **Environment-specific** - Different settings for dev/staging/prod
2. **Test configuration** - Use `/api/email/status` endpoint
3. **Monitor delivery** - Check logs and email delivery rates
4. **Rate limiting** - Consider limits for production
5. **Error handling** - Application continues if email fails

### User Experience

1. **Optional emails** - Allow users to skip sending
2. **Clear notifications** - Inform users when emails are sent
3. **Graceful fallback** - App works without email
4. **User preferences** - Future: allow opt-in/opt-out

---

## Email Service Status

### When Available

- ✅ `ENABLE_SMTP=true`
- ✅ All SMTP variables configured
- ✅ SMTP server reachable
- ✅ Authentication successful

### When Unavailable

- ❌ `ENABLE_SMTP=false` (or not set)
- ❌ Missing SMTP configuration
- ❌ SMTP server unreachable
- ❌ Authentication failed

**Note:** Application continues to work normally when email is unavailable.

---

## Related Documentation

- [Configuration Guide](../getting-started/configuration.md#email-configuration) - Environment variables
- [Authentication](../authentication/README.md) - Password reset and OTP
- [Defects](../defects/README.md) - Defect assignment and updates
- [Test Runs](../test-runs/README.md) - Test run reports
- [API Reference](../../api/README.md) - Email API endpoints

---

## Examples

### Example: Defect Assignment Flow

```typescript
// 1. User assigns defect
const defect = await assignDefect(defectId, assigneeId);

// 2. System automatically sends email
await emailService.sendDefectAssignmentEmail({
  defectId: defect.id,
  assigneeId: assigneeId,
  assignedByUserId: currentUserId,
  appUrl: process.env.NEXTAUTH_URL
});

// 3. Email sent to assignee with defect details
```

### Example: Test Run Report

```typescript
// 1. User requests to send report
const report = await sendTestRunReport(testRunId);

// 2. System sends to:
// - Admins
// - Project Managers
// - Defect Assignees (if tests failed)

// 3. Recipients receive email with statistics
```

---

## Future Enhancements

- 📧 **Email Templates** - Custom templates per project
- 📬 **Digest Emails** - Daily/weekly summaries
- ⚙️ **User Preferences** - Opt-in/opt-out per notification type
- 📊 **Email Analytics** - Track open rates and clicks
- 🔔 **Webhook Integration** - Slack, Teams, etc.
- 🌍 **Multi-language** - Localized email content

---

**Last Updated:** December 2025
