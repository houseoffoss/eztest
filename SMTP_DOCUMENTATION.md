# SMTP Email Notifications - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Features](#features)
5. [API Endpoints](#api-endpoints)
6. [Architecture](#architecture)
7. [Troubleshooting](#troubleshooting)
8. [Email Templates](#email-templates)

---

## Overview

EzTest now supports email notifications via SMTP for:
- 📧 Defect assignment notifications
- 📊 Test run reports (to admins, project managers, and defect assignees)
- 💬 Defect comments
- 👥 Project member invitations
- 🔐 User invitations

### Key Features
- ✅ Professional HTML email templates
- ✅ Support for all major SMTP providers (Gmail, Outlook, SendGrid, AWS SES, etc.)
- ✅ Graceful fallback if SMTP is not configured
- ✅ Role-based recipient selection
- ✅ Detailed logging and error handling
- ✅ Email validation

---

## Quick Start

### 1. Configure SMTP Environment Variables

Add to your `.env` file:

```env
# Email Service (SMTP)
# Enable email functionality (set to true to send emails)
ENABLE_SMTP=true

# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="EzTest <noreply@eztest.com>"
SMTP_SECURE=false
```

**Important:** Set `ENABLE_SMTP=true` to enable email sending. If set to `false`, no emails will be sent regardless of other SMTP settings.

### 2. SMTP Provider Examples

#### Gmail
```env
ENABLE_SMTP=true
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-char-app-password"
SMTP_FROM="your-email@gmail.com"
SMTP_SECURE=false
```

**Gmail Setup:**
1. Enable 2FA: https://myaccount.google.com/security
2. Create App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password as `SMTP_PASS`

#### Outlook/Office 365
```env
ENABLE_SMTP=true
SMTP_HOST="smtp.office365.com"
SMTP_PORT=587
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
SMTP_FROM="your-email@outlook.com"
SMTP_SECURE=false
```

#### SendGrid
```env
ENABLE_SMTP=true
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"
SMTP_SECURE=false
```

#### AWS SES
```env
ENABLE_SMTP=true
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT=587
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@yourdomain.com"
SMTP_SECURE=false
```

#### Mailtrap (Testing)
```env
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=587
SMTP_USER="your-mailtrap-username"
SMTP_PASS="your-mailtrap-password"
SMTP_FROM="noreply@eztest.local"
SMTP_SECURE=false
```

### 3. Restart Application

```bash
# Development
npm run dev

# Production
npm run build
npm start

# Docker
docker-compose restart
```

### 4. Verify Configuration

```bash
curl http://localhost:3000/api/email/status
```

Expected response:
```json
{
  "available": true,
  "message": "Email service is configured and ready"
}
```

---

## Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `SMTP_HOST` | Yes | SMTP server hostname | - |
| `SMTP_PORT` | No | SMTP server port | 587 |
| `SMTP_USER` | Yes | SMTP username/email | - |
| `SMTP_PASS` | Yes | SMTP password | - |
| `SMTP_FROM` | Yes | From email address | - |
| `SMTP_SECURE` | No | Use TLS/SSL (true/false) | false |

### Port Configuration
- **587**: TLS (STARTTLS) - Recommended for most providers
- **465**: SSL - Use with `SMTP_SECURE=true`
- **25**: Plain/STARTTLS - Often blocked by ISPs

### Security Best Practices

1. **Use App Passwords** for Gmail and similar providers
2. **Store credentials securely** - Never commit `.env` to git
3. **Use environment-specific** SMTP configurations
4. **Enable TLS** (`SMTP_SECURE=false` with port 587 uses STARTTLS)
5. **Validate sender domain** to avoid spam filters

---

## Features

### 1. Defect Assignment Notifications

Automatically sends email when a defect is assigned to a user.

**Recipients:** Assigned user  
**Trigger:** Defect assignment  
**Content:** Defect details, severity, priority, assignee info

### 2. Test Run Reports

Sends comprehensive test run reports with statistics.

**Recipients:**
- System Admins (globally)
- Project Managers (project members)
- Defect Assignees (if tests failed/blocked)

**Trigger:** Manual (via API or UI)  
**Content:** Test results, pass rate, statistics, environment details

### 3. Defect Comments

Notifies relevant users when comments are added to defects.

**Recipients:**
- Defect assignee
- Defect creator
- Previous commenters (excluding comment author)

**Trigger:** New defect comment  
**Content:** Comment text, defect info, author details

### 4. Project Member Invitations

Notifies users when they're added to a project.

**Recipients:** New project member  
**Trigger:** User added to project  
**Content:** Project details, inviter info, access link

### 5. User Invitations

Sends welcome email with temporary password to new users.

**Recipients:** Newly created user  
**Trigger:** User creation by admin  
**Content:** Login credentials, welcome message, setup instructions

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

### Send Test Run Report
```http
POST /api/testruns/{testRunId}/send-report
Authorization: Required
Permission: testruns:read
```

**Response:**
```json
{
  "data": {
    "success": true,
    "message": "Report sent to 3 recipient(s)",
    "recipientCount": 3,
    "totalRecipients": 3,
    "failedRecipients": [],
    "recipientDetails": [
      {
        "email": "admin@example.com",
        "role": "ADMIN",
        "status": "sent"
      }
    ]
  }
}
```

---

## Architecture

### Project Structure

```
backend/
├── services/
│   └── email/
│       └── services.ts         # Email service with all methods
├── controllers/
│   └── testrun/
│       └── controller.ts       # sendTestRunReport method
├── validators/
│   └── testrun.validator.ts    # Validation schemas
└── constants/
    └── static_messages.ts      # Status messages

lib/
└── email-service.ts            # SMTP configuration & templates

app/api/
├── email/
│   └── status/
│       └── route.ts           # Email status endpoint
└── testruns/
    └── [id]/
        └── send-report/
            └── route.ts       # Send report endpoint
```

### Service Layer Architecture

```typescript
// backend/services/email/services.ts
class EmailService {
  async sendDefectAssignmentEmail(input): Promise<boolean>
  async sendTestRunReportEmail(input): Promise<boolean>
  async sendDefectCommentEmail(input): Promise<boolean>
  async sendProjectMemberEmail(input): Promise<boolean>
  async sendUserInvitationEmail(input): Promise<boolean>
  async isEmailServiceAvailable(): Promise<boolean>
}
```

### Controller Layer

```typescript
// backend/controllers/testrun/controller.ts
class TestRunController {
  async sendTestRunReport(testRunId, userId): Promise<NextResponse>
}
```

### Recipient Collection Logic

For test run reports, recipients are collected from:

1. **System Admins** - All users with `ADMIN` role globally
2. **Project Managers** - Users with `PROJECT_MANAGER` role in the project
3. **Defect Assignees** - Users assigned to defects linked to failed/blocked tests

```typescript
// backend/services/testrun/services.ts
async getTestRunReportRecipients(testRunId): Promise<{
  recipientIds: string[];
  systemAdminCount: number;
  projectManagerCount: number;
  defectAssigneeCount: number;
}>
```

---

## Troubleshooting

### Common Issues

#### 1. "Email service not configured"

**Cause:** Missing SMTP environment variables

**Solution:**
- Verify all required variables are set in `.env`
- Restart application after updating `.env`
- Check `/api/email/status` endpoint

#### 2. "Authentication failed"

**Cause:** Invalid SMTP credentials

**Solutions:**
- For Gmail: Use App Password, not regular password
- Verify username/email is correct
- Check password has no extra spaces
- Ensure 2FA is enabled (for Gmail)

#### 3. "Connection refused"

**Cause:** Cannot connect to SMTP server

**Solutions:**
- Verify `SMTP_HOST` is correct
- Check `SMTP_PORT` (587 for TLS, 465 for SSL)
- Ensure firewall allows outbound connections
- Try different port if blocked

#### 4. "Rate limit exceeded"

**Cause:** SMTP provider has rate limits (e.g., Mailtrap free tier)

**Solution:**
- Wait before retrying
- Upgrade SMTP provider plan
- Use production email service (SendGrid, AWS SES)

#### 5. "Invalid email address"

**Cause:** Email validation failed

**Solutions:**
- Verify user email addresses in database
- Check for typos or invalid domains
- Ensure emails are not `.local`, `.test`, `.example` (except admin@eztest.local)

#### 6. Emails in Spam Folder

**Causes:**
- Missing SPF/DKIM records
- Suspicious sender domain
- High volume from new domain

**Solutions:**
- Set up SPF, DKIM, DMARC records
- Use verified sender domain
- Warm up new email domains gradually
- Use reputable SMTP provider

### Debug Logging

The system includes detailed logging with `[EMAIL]` prefix:

```
[EMAIL] Preparing to send email to: user@example.com
[EMAIL] Email validation passed for: user@example.com
[EMAIL] SMTP Config: smtp.gmail.com:587 (secure: false)
[EMAIL] ✓ Email sent successfully to user@example.com
```

Check application logs for these messages to diagnose issues.

---

## Email Templates

### Defect Assignment Email

**Subject:** 🐛 Defect Assigned: {defectTitle}

**Content:**
- Defect title and description
- Severity and priority badges
- Assignee and assigner information
- Direct link to defect
- Project name

### Test Run Report Email

**Subject:** 📊 Test Run Report: {testRunName}

**Content:**
- Test run name and description
- Environment information
- Pass rate percentage with color coding
- Test result statistics (passed, failed, blocked, skipped)
- Visual stats cards
- Started by user information
- Direct link to test run

### Defect Comment Email

**Subject:** 💬 New Comment on Defect {defectKey}: {defectTitle}

**Content:**
- Commenter information
- Comment text
- Defect details
- Project name
- Direct link to defect

### Project Member Email

**Subject:** 👥 Added to Project: {projectName}

**Content:**
- Welcome message
- Project name and details
- Added by user information
- Direct link to project
- Access instructions

### User Invitation Email

**Subject:** 🔐 Welcome to EzTest - Your Account Details

**Content:**
- Welcome message
- Login credentials (temporary password)
- Invited by user information
- Login link
- Next steps instructions

---

## Backward Compatibility

### No Configuration = No Emails

If SMTP is not configured:
- Application works normally
- Email sending is skipped silently
- No errors thrown
- Users see "Email service not configured" if checking status

### Graceful Degradation

```typescript
if (!isEmailServiceAvailable()) {
  console.warn('Email service not available, skipping email');
  return false;
}
```

All email features are optional and don't break existing functionality.

---

## Testing

### Local Testing with Mailtrap

1. Sign up at https://mailtrap.io (free tier available)
2. Get SMTP credentials from your inbox
3. Configure in `.env`:

```env
SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT=587
SMTP_USER="your-mailtrap-username"
SMTP_PASS="your-mailtrap-password"
SMTP_FROM="noreply@eztest.local"
SMTP_SECURE=false
```

4. All sent emails appear in Mailtrap inbox (not real recipients)

### Production Testing Checklist

- [ ] Verify SMTP credentials
- [ ] Test email status endpoint
- [ ] Send test defect assignment
- [ ] Send test run report
- [ ] Check spam folder
- [ ] Verify all links work
- [ ] Test with multiple recipients
- [ ] Monitor application logs
- [ ] Check email delivery time

---

## Best Practices

### Development
- Use Mailtrap or similar service
- Don't send to real emails during testing
- Keep separate `.env` for dev/prod

### Production
- Use professional SMTP service (SendGrid, AWS SES, Mailgun)
- Set up SPF, DKIM, DMARC records
- Use verified sender domain
- Monitor email delivery rates
- Set up bounce handling
- Keep SMTP credentials secure
- Use environment variables
- Enable logging for troubleshooting

### Security
- Never commit `.env` to version control
- Use strong SMTP passwords
- Enable 2FA where possible
- Rotate credentials periodically
- Use app-specific passwords
- Limit SMTP access to application only

---

## Additional Documentation

For more detailed technical information, see:

- **[Email Notifications Feature](./docs/EMAIL_NOTIFICATIONS.md)** - Complete feature documentation with implementation examples, API details, and code snippets
- **[Test Run Feature Documentation](./docs/TEST_RUN_FEATURE_COMPLETE.md)** - See section 2.9 for test run report email implementation, recipient collection logic, database queries, and troubleshooting

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review application logs for `[EMAIL]` messages
3. Verify SMTP configuration
4. Test with `/api/email/status` endpoint
5. Consult [Email Notifications docs](./docs/EMAIL_NOTIFICATIONS.md) for detailed examples
6. Check [Test Run Feature docs](./docs/TEST_RUN_FEATURE_COMPLETE.md) section 2.9 for recipient collection issues
7. Consult SMTP provider documentation

---

## Changelog

### Recent Updates
- ✅ Refactored to use validators, controllers, and services pattern
- ✅ Removed console.log statements for production
- ✅ Added static message constants
- ✅ Enhanced error handling and validation
- ✅ Added recipient breakdown in API responses
- ✅ Improved email validation
- ✅ Added role-based recipient collection
- ✅ System admins now fetched globally

---

*Last Updated: December 9, 2025*
