import crypto from 'crypto';

/**
 * Generate a random password reset token
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Calculate expiration time for password reset token
 * Default: 1 hour from now
 */
export function getPasswordResetTokenExpiration(
  expirationHours: number = 1
): Date {
  return new Date(Date.now() + expirationHours * 60 * 60 * 1000);
}

/**
 * Check if password reset token is expired
 */
export function isTokenExpired(expirationDate: Date): boolean {
  return new Date() > expirationDate;
}

/**
 * Generate password reset email HTML
 */
export function generatePasswordResetEmail(
  resetLink: string,
  userName: string
): { subject: string; html: string; text: string } {
  const subject = 'Reset Your EZTest Password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #033977; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetLink}</p>
      <p style="color: #999; font-size: 12px;">
        This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">EZTest - Self-hosted Test Management Platform</p>
    </div>
  `;

  const text = `
Password Reset Request

Hi ${userName},

We received a request to reset your password. Click the link below to reset it:

${resetLink}

This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.

EZTest - Self-hosted Test Management Platform
  `;

  return { subject, html, text };
}

/**
 * Get default admin email from environment
 */
export function getDefaultAdminEmail(): string {
  return process.env.ADMIN_EMAIL || 'admin@eztest.local';
}

/**
 * Get default admin password from environment
 */
export function getDefaultAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'Admin@123456';
}

/**
 * Check if email matches the default admin email
 */
export function isDefaultAdminEmail(email: string): boolean {
  const defaultEmail = getDefaultAdminEmail();
  return email.toLowerCase().trim() === defaultEmail.toLowerCase().trim();
}

/**
 * Check if email and password match default admin credentials
 */
export function isDefaultAdminCredentials(email: string, password: string): boolean {
  return isDefaultAdminEmail(email) && password === getDefaultAdminPassword();
}