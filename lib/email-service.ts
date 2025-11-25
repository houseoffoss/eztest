import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

/**
 * Initialize SMTP transporter with environment variables
 * Validates that all required SMTP settings are configured
 */
function getTransporter(): nodemailer.Transporter | null {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    SMTP_SECURE,
  } = process.env;

  // Check if SMTP is configured
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    console.warn(
      'Email service not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM environment variables.'
    );
    return null;
  }

  try {
    const config: SMTPConfig = {
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587', 10),
      secure: SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      from: SMTP_FROM,
    };

    const transporter = nodemailer.createTransport(config);
    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
}

/**
 * Send email with configured SMTP settings
 * Returns true on success, false on failure
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.error('Email service is not configured');
      return false;
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  userName: string
): Promise<boolean> {
  const subject = 'Reset Your EZTest Password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted Test Management Platform</p>
        </div>

        <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0;">Password Reset Request</h2>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
          Hi ${userName},
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          We received a request to reset your password. Click the button below to reset it:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${resetLink}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Reset Password
            </a>
          </div>
        </div>

        <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 20px 0 10px 0;">
          Or copy and paste this link in your browser:
        </p>
        <p style="word-break: break-all; color: #033977; font-size: 13px; background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin: 0 0 20px 0;">
          ${resetLink}
        </p>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support immediately.
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          © 2025 EZTest. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const text = `
Password Reset Request

Hi ${userName},

We received a request to reset your password. Click the link below to reset it:

${resetLink}

This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support immediately.

---
EZTest - Self-hosted Test Management Platform
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Verify SMTP connection (used for testing/validation)
 */
export async function verifyEmailConnection(): Promise<boolean> {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      return false;
    }

    await transporter.verify();
    console.log('Email service connection verified');
    return true;
  } catch (error) {
    console.error('Failed to verify email connection:', error);
    return false;
  }
}
