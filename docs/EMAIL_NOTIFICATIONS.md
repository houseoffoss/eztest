# Email Notifications Feature

## Overview

EzTest now supports email notifications for defect assignments and test run reports. This feature extends the existing SMTP email service (previously used only for password reset) to send professional, HTML-formatted emails to assignees and team members.

**Note**: This feature builds on the existing email service in `lib/email-service.ts`, which already handles password reset emails. No additional configuration is needed beyond what may already be set up.

## Features

### 1. Defect Assignment Notifications
When a defect is assigned to a user, the system can send an email notification containing:
- Defect title and description
- Severity and priority badges
- Project name
- Assignor information
- Direct link to view the defect

### 2. Test Run Report Emails
When a test run is started or completed, reports can be sent via email containing:
- Test run name and description
- Environment information
- Test statistics (passed, failed, blocked, skipped)
- Pass rate percentage
- Direct link to view the test run

## SMTP Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Email Service (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email@example.com"
SMTP_PASS="your-smtp-password"
SMTP_FROM="noreply@eztest.local"
SMTP_SECURE=false  # Set to true for port 465 (SSL/TLS), false for 587 (STARTTLS)
```

### Common SMTP Providers

#### Gmail
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Use App Password, not regular password
SMTP_FROM="your-email@gmail.com"
SMTP_SECURE=false
```

**Note**: For Gmail, you need to enable 2FA and create an [App Password](https://support.google.com/accounts/answer/185833).

#### Outlook/Office 365
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT=587
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
SMTP_FROM="your-email@outlook.com"
SMTP_SECURE=false
```

#### SendGrid
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"  # Literally the string "apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="verified-sender@yourdomain.com"
SMTP_SECURE=false
```

#### Mailgun
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=587
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-password"
SMTP_FROM="noreply@your-domain.mailgun.org"
SMTP_SECURE=false
```

## API Endpoints

### 1. Check Email Service Status
**GET** `/api/email/status`

Check if the email service is configured and available.

**Response:**
```json
{
  "available": true,
  "message": "Email service is configured and ready"
}
```

### 2. Send Defect Assignment Email
**POST** `/api/defects/[defectId]/send-assignment-email`

Send an assignment notification email to the defect assignee.

**Request Body:**
```json
{
  "assigneeId": "user-id"  // Optional if defect already has assignedToId
}
```

**Response:**
```json
{
  "message": "Email sent successfully",
  "success": true
}
```

### 3. Send Test Run Report Email
**POST** `/api/testruns/[id]/send-report-email`

Send a test run report email.

**Request Body:**
```json
{
  "recipientId": "user-id"  // Optional if test run already has assignedToId
}
```

**Response:**
```json
{
  "message": "Email sent successfully",
  "success": true
}
```

## Frontend Integration

### Using the SendEmailDialog Component

The `SendEmailDialog` component provides a user-friendly dialog for confirming email sends.

```tsx
import { SendEmailDialog } from '@/components/common/SendEmailDialog';
import { useState } from 'react';

function MyComponent() {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const response = await fetch(`/api/defects/${defectId}/send-assignment-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId: 'user-id' }),
      });
      
      if (response.ok) {
        // Show success message
        console.log('Email sent successfully');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setSending(false);
      setEmailDialogOpen(false);
    }
  };

  return (
    <>
      <button onClick={() => setEmailDialogOpen(true)}>
        Send Email Notification
      </button>

      <SendEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        onConfirm={handleSendEmail}
        loading={sending}
        title="Send Assignment Notification"
        description="Would you like to send an email notification to the assignee?"
        recipientName="John Doe"
        recipientEmail="john@example.com"
      />
    </>
  );
}
```

## Email Templates

### Defect Assignment Email

The defect assignment email includes:
- **Subject**: 🐛 Defect Assigned: [Defect Title]
- **Content**:
  - Defect title and description
  - Color-coded severity badge (Critical, High, Medium, Low)
  - Color-coded priority badge (Urgent, High, Medium, Low)
  - Assignor name and email
  - Call-to-action button to view the defect

### Test Run Report Email

The test run report email includes:
- **Subject**: 📊 Test Run Report: [Test Run Name]
- **Content**:
  - Test run name and description
  - Environment information
  - Pass rate percentage
  - Statistics grid with color-coded cards:
    - Passed (green)
    - Failed (red)
    - Blocked (yellow)
    - Skipped (blue)
  - Starter name and email
  - Call-to-action button to view the test run

## Error Handling

The email service gracefully handles configuration issues:

1. **SMTP Not Configured**: If SMTP environment variables are not set, the service will log a warning and return `false` without throwing errors.

2. **Connection Failures**: If the SMTP server cannot be reached, the service will log the error and prevent email sending.

3. **Send Failures**: If an individual email fails to send, the error is logged and the operation continues without crashing.

## Best Practices

1. **Use Environment-Specific Configuration**: Different SMTP settings for development, staging, and production.

2. **Test Email Configuration**: Use the `/api/email/status` endpoint to verify SMTP setup.

3. **Use App Passwords**: For Gmail and similar providers, use app-specific passwords instead of regular passwords.

4. **Monitor Email Delivery**: Check application logs for email sending status.

5. **User Consent**: Always provide users with the option to skip sending emails (the dialog has a "Skip" button).

6. **Rate Limiting**: For production, consider implementing rate limiting to prevent email abuse.

## Security Considerations

1. **Sensitive Data**: SMTP credentials should never be committed to version control.

2. **Environment Variables**: Always use environment variables for SMTP configuration.

3. **TLS/SSL**: Use `SMTP_SECURE=true` for port 465 or STARTTLS for port 587.

4. **Email Content**: Emails only include necessary information and don't expose sensitive system details.

## Troubleshooting

### Email Not Sending

1. **Check SMTP Configuration**: Verify all environment variables are set correctly.
2. **Test Connection**: Use the `/api/email/status` endpoint.
3. **Check Logs**: Look for error messages in application logs.
4. **Firewall Rules**: Ensure outbound SMTP connections are allowed.
5. **Provider Restrictions**: Some hosting providers block SMTP ports.

### Gmail-Specific Issues

1. **Enable 2FA**: Required for app passwords.
2. **Generate App Password**: Use this instead of your regular password.
3. **Less Secure Apps**: Not recommended, but may need to be enabled for older accounts.

### SendGrid/Mailgun Issues

1. **Verify Sender Domain**: Domain verification is required.
2. **API Key Permissions**: Ensure the API key has send permissions.
3. **Sender Reputation**: Check your sender reputation score.

## Future Enhancements

Potential improvements for the email notification system:

1. **Email Templates**: Custom templates per project or organization.
2. **Batch Notifications**: Digest emails for multiple assignments.
3. **User Preferences**: Allow users to opt-in/out of specific notification types.
4. **Email Queue**: Background job processing for better performance.
5. **Email Analytics**: Track open rates and click-through rates.
6. **Rich Content**: Attach test reports or defect screenshots.
7. **Internationalization**: Multi-language email support.
8. **Webhook Integration**: Support for services like Zapier or Slack.

## Testing

### Manual Testing

1. **Configure SMTP**: Set up environment variables.
2. **Assign Defect**: Assign a defect to a user with a valid email.
3. **Trigger Email Dialog**: Click to send email notification.
4. **Verify Receipt**: Check the assignee's inbox.

### Automated Testing

Consider adding integration tests for:
- Email service initialization
- Email template rendering
- SMTP connection handling
- Error scenarios

## Support

For issues or questions related to email notifications:
1. Check application logs for error messages
2. Verify SMTP configuration
3. Review this documentation
4. Contact your system administrator

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Feature Status**: Production Ready
