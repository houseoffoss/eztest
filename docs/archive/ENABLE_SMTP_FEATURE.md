# ENABLE_SMTP Feature Implementation

## Summary

Added a new environment variable `ENABLE_SMTP` that acts as a master switch to enable or disable all email functionality in the EzTest application.

## Changes Made

### 1. Environment Configuration Files

#### `.env.example`
- Added `ENABLE_SMTP=false` as a new environment variable
- Added documentation explaining when to enable/disable SMTP
- Placed before the SMTP configuration section

#### `.env.docker.example`
- Added `ENABLE_SMTP=false` with comment explaining its purpose
- Maintains consistency with main `.env.example` file

### 2. Email Service Implementation (`lib/email-service.ts`)

#### `getTransporter()` Function
- Added check for `ENABLE_SMTP` environment variable at the beginning
- Returns `null` if `ENABLE_SMTP !== 'true'`
- Logs informational message when SMTP is disabled
- Prevents unnecessary SMTP configuration validation when disabled

```typescript
// Check if SMTP is enabled
if (ENABLE_SMTP !== 'true') {
  console.log('[EMAIL] SMTP is disabled via ENABLE_SMTP environment variable');
  return null;
}
```

#### `isEmailServiceAvailable()` Function
- Added early check for `ENABLE_SMTP` flag
- Returns `false` immediately if SMTP is disabled
- Provides clear logging about why email service is unavailable

```typescript
// Check if SMTP is enabled first
if (process.env.ENABLE_SMTP !== 'true') {
  console.log('[EMAIL] Email service is disabled (ENABLE_SMTP is not set to true)');
  return false;
}
```

### 3. Documentation Updates

#### `docs/ENVIRONMENT_VARIABLES.md`
- Added comprehensive `ENABLE_SMTP` variable documentation
- Included usage examples and best practices
- Updated Quick Start section to mention ENABLE_SMTP configuration
- Documented when to set to `true` vs `false`
- Listed all affected email features

#### `SMTP_DOCUMENTATION.md`
- Updated Quick Start section with `ENABLE_SMTP=true`
- Added ENABLE_SMTP to all SMTP provider examples:
  - Gmail
  - Outlook/Office 365
  - SendGrid
  - AWS SES
- Added note about the importance of setting ENABLE_SMTP

#### `docs/DEPLOYMENT_CHECKLIST.md`
- Added checklist item for setting `ENABLE_SMTP=true`
- Updated deployment preparation steps

## How It Works

### When `ENABLE_SMTP=true`:
1. Email service checks for SMTP configuration (host, user, pass, from)
2. If configured correctly, emails are sent normally
3. All email features work as expected:
   - OTP verification emails
   - Password reset emails
   - Defect assignment notifications
   - Test run report emails
   - User management notifications
   - Project membership notifications

### When `ENABLE_SMTP=false` (or not set):
1. `getTransporter()` returns `null` immediately
2. `isEmailServiceAvailable()` returns `false`
3. No SMTP connection attempts are made
4. All email functions return gracefully without sending
5. **OTP verification is automatically bypassed:**
   - `sendOtp()` returns success with `smtpDisabled: true` flag
   - `verifyOtp()` auto-succeeds without checking OTP
   - `isEmailVerified()` always returns `true`
   - Login/Register pages skip OTP UI and proceed directly to authentication
6. **No email-related errors shown to end users**
7. Application continues to work with password-only authentication
8. Clear logging indicates email service is disabled (server-side only)

## Benefits

1. **Easy Control**: Single flag to enable/disable all email functionality
2. **Development Friendly**: Can disable emails in local/test environments
3. **Production Ready**: Enable emails only when SMTP is properly configured
4. **Clear Logging**: Provides informative messages about email service status
5. **Graceful Degradation**: Application works fine with emails disabled
6. **Security**: Prevents accidental email sending in non-production environments

## Usage Examples

### Development Environment (No Email)
```env
ENABLE_SMTP=false
# No need to configure other SMTP variables
```

### Staging Environment (Testing Email)
```env
ENABLE_SMTP=true
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="test_user"
SMTP_PASS="test_pass"
SMTP_FROM="staging@eztest.local"
SMTP_SECURE=false
```

### Production Environment (Full Email)
```env
ENABLE_SMTP=true
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="notifications@company.com"
SMTP_PASS="app_specific_password"
SMTP_FROM="EzTest <notifications@company.com>"
SMTP_SECURE=false
```

## Testing

To test the implementation:

1. **With SMTP Disabled:**
   ```env
   ENABLE_SMTP=false
   ```
   - Login/Register → Works without OTP verification (proceeds directly)
   - No email error messages shown to users
   - Check logs → Should see "[OTP] SMTP disabled" messages
   - Application works normally with password-only authentication
   - Email notifications (defects, test runs, etc.) silently skip

2. **With SMTP Enabled:**
   ```env
   ENABLE_SMTP=true
   SMTP_HOST="smtp.example.com"
   # ... other SMTP settings
   ```
   - Login/Register → Requires OTP verification via email
   - OTP emails should be sent
   - Notification emails should work
   - Check logs for successful email sending

## Migration Guide

For existing installations:

1. Add `ENABLE_SMTP=false` to your `.env` file (or `true` if you want emails)
2. If setting to `true`, ensure all SMTP_* variables are configured
3. Restart the application
4. Test email functionality

## Backward Compatibility

The implementation is backward compatible:
- If `ENABLE_SMTP` is not set, it defaults to disabled (returns `null`)
- Existing SMTP configuration continues to work when `ENABLE_SMTP=true`
- No breaking changes to existing email functions
