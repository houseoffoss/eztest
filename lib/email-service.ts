import nodemailer from 'nodemailer';
import { User } from '@prisma/client';
import { isDefaultAdminEmail } from './auth-utils';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface DefectAssignmentEmailData {
  assignee: User;
  defectId: string;
  defectTitle: string;
  defectDescription?: string;
  severity: string;
  priority: string;
  projectName: string;
  assignedBy: User;
  appUrl: string;
}

interface TestRunReportEmailData {
  recipient: User;
  testRunId: string;
  testRunName: string;
  testRunDescription?: string;
  environment?: string;
  projectName: string;
  stats: {
    total: number;
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
  };
  startedBy: User;
  appUrl: string;
}

interface DefectCommentEmailData {
  defectId: string;
  defectTitle: string;
  defectKey: string;
  commentAuthor: User;
  commentContent: string;
  projectName: string;
  recipients: User[];
  appUrl: string;
}

interface DefectUpdateEmailData {
  defectId: string;
  defectTitle: string;
  defectKey: string;
  projectName: string;
  updatedBy: User;
  changes: {
    field: 'status' | 'priority';
    oldValue: string;
    newValue: string;
  }[];
  assignedTo?: User;
  createdBy: User;
  appUrl: string;
}

interface AddProjectMemberEmailData {
  newMember: User;
  projectName: string;
  addedByUser: User;
  appUrl: string;
}

interface RemoveProjectMemberEmailData {
  removedMember: User;
  projectName: string;
  removedByUser: User;
  appUrl: string;
}

interface OtpEmailData {
  email: string;
  otp: string;
  type: 'login' | 'register';
  appUrl: string;
}

interface InviteUserEmailData {
  invitedUser: User;
  invitedByUser: User;
  tempPassword: string;
  appUrl: string;
}

interface UserUpdateEmailData {
  user: User;
  updatedByUser: User;
  changes: string[];
  appUrl: string;
}

interface UserDeleteEmailData {
  user: User;
  deletedByUser: User;
  appUrl: string;
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
    ENABLE_SMTP,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    SMTP_SECURE,
  } = process.env;

  // Check if SMTP is enabled
  if (ENABLE_SMTP !== 'true') {
    console.log('[EMAIL] SMTP is disabled via ENABLE_SMTP environment variable');
    return null;
  }

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
 * Validate email address format
 * Returns true if valid, false otherwise
 * 
 * Allows the default admin email from environment variables (even if it has invalid domains)
 */
function isValidEmail(email: string): boolean {
  // Allow default admin email from environment (even if it has .local domain)
  if (isDefaultAdminEmail(email)) {
    return true;
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Check basic format
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Check for invalid domains like .local, .invalid, .test, .example
  const invalidDomains = ['.local', '.invalid', '.test', '.example', '.localhost'];
  const lowerEmail = email.toLowerCase();
  
  for (const domain of invalidDomains) {
    if (lowerEmail.endsWith(domain)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Send email with configured SMTP settings
 * Returns true on success, false on failure
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log(`[EMAIL] Preparing to send email to: ${options.to}`);
    
    const transporter = getTransporter();

    if (!transporter) {
      console.error('[EMAIL] Email service is not configured - missing SMTP settings');
      return false;
    }

    // Validate email address
    if (!isValidEmail(options.to)) {
      console.error(`[EMAIL] ✗ Invalid or unsupported email address: ${options.to}. Email addresses with .local, .invalid, .test, .example domains are not supported for email delivery.`);
      return false;
    }

    console.log(`[EMAIL] Email validation passed for: ${options.to}`);
    console.log(`[EMAIL] SMTP Config: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || '587'} (secure: ${process.env.SMTP_SECURE === 'true'})`);
    console.log(`[EMAIL] From: ${process.env.SMTP_FROM}`);
    console.log(`[EMAIL] Subject: ${options.subject}`);

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log(`[EMAIL] ✓ Email sent successfully to ${options.to}`);
    console.log(`[EMAIL] Message ID: ${info.messageId}`);
    console.log(`[EMAIL] Response: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL] ✗ Failed to send email to ${options.to}`);
    console.error(`[EMAIL] Error details:`, error);
    
    // Log more specific error details if available
    if (error instanceof Error) {
      console.error(`[EMAIL] Error name: ${error.name}`);
      console.error(`[EMAIL] Error message: ${error.message}`);
      
      // Check for common SMTP errors
      if (error.message.includes('ECONNREFUSED')) {
        console.error(`[EMAIL] Connection refused - Check if SMTP server is running and accessible`);
      } else if (error.message.includes('EAUTH')) {
        console.error(`[EMAIL] Authentication failed - Check SMTP_USER and SMTP_PASS`);
      } else if (error.message.includes('ETIMEDOUT')) {
        console.error(`[EMAIL] Connection timed out - Check firewall or network settings`);
      } else if (error.message.includes('Invalid login')) {
        console.error(`[EMAIL] Invalid credentials - Verify SMTP username and password`);
      }
    }
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
          © 2025 Belsterns. All rights reserved.
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

/**
 * Check if email service is available
 */
export async function isEmailServiceAvailable(): Promise<boolean> {
  // Check if SMTP is enabled first
  if (process.env.ENABLE_SMTP !== 'true') {
    console.log('[EMAIL] Email service is disabled (ENABLE_SMTP is not set to true)');
    return false;
  }

  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email service verification failed:', error);
    return false;
  }
}

/**
 * Send defect assignment notification email
 */
export async function sendDefectAssignmentEmail(
  data: DefectAssignmentEmailData
): Promise<boolean> {
  const subject = `🐛 Defect Assigned: ${data.defectTitle}`;
  const defectUrl = `${data.appUrl}/projects/${data.defectId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted Test Management Platform</p>
        </div>

        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #991b1b; font-size: 20px; margin: 0;">🐛 New Defect Assignment</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Hi <strong>${data.assignee.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          A new defect has been assigned to you in project <strong>${data.projectName}</strong>.
        </p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">${data.defectTitle}</h3>
          ${data.defectDescription ? `<p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 15px 0;">${data.defectDescription}</p>` : ''}
          
          <div style="margin: 15px 0;">
            <span style="display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 8px; ${
              data.severity === 'CRITICAL' ? 'background-color: #dc2626; color: white;' :
              data.severity === 'HIGH' ? 'background-color: #ea580c; color: white;' :
              data.severity === 'MEDIUM' ? 'background-color: #ca8a04; color: white;' :
              'background-color: #16a34a; color: white;'
            }">
              ${data.severity}
            </span>
            <span style="display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; ${
              data.priority === 'URGENT' ? 'background-color: #dc2626; color: white;' :
              data.priority === 'HIGH' ? 'background-color: #ea580c; color: white;' :
              data.priority === 'MEDIUM' ? 'background-color: #ca8a04; color: white;' :
              'background-color: #6b7280; color: white;'
            }">
              ${data.priority}
            </span>
          </div>

          <p style="color: #4b5563; font-size: 13px; margin: 15px 0 0 0;">
            <strong>Assigned by:</strong> ${data.assignedBy.name} (${data.assignedBy.email})
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${defectUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              View Defect
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification from EZTest. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const text = `
New Defect Assignment

Hi ${data.assignee.name},

A new defect has been assigned to you in project ${data.projectName}.

Defect: ${data.defectTitle}
${data.defectDescription ? `Description: ${data.defectDescription}` : ''}
Severity: ${data.severity}
Priority: ${data.priority}
Assigned by: ${data.assignedBy.name} (${data.assignedBy.email})

View defect: ${defectUrl}

---
This is an automated notification from EZTest.
  `;

  return sendEmail({
    to: data.assignee.email,
    subject,
    html,
    text,
  });
}

/**
 * Send defect update email (status/priority change)
 */
export async function sendDefectUpdateEmail(
  data: DefectUpdateEmailData
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const changeDescription = data.changes
    .map(c => `${c.field} changed from ${c.oldValue} to ${c.newValue}`)
    .join(', ');
  
  const subject = `🔔 Defect Updated: ${data.defectTitle}`;
  const defectUrl = `${data.appUrl}/projects/${data.defectId}`;

  // Determine recipients: assignee, creator, and updater
  // Always send email notification for status/priority changes to all stakeholders
  const recipients: User[] = [];
  const recipientIds = new Set<string>();

  // Add assignee
  if (data.assignedTo) {
    recipientIds.add(data.assignedTo.id);
    recipients.push(data.assignedTo);
  }

  // Add creator (if not already added)
  if (!recipientIds.has(data.createdBy.id)) {
    recipientIds.add(data.createdBy.id);
    recipients.push(data.createdBy);
  }

  // Add updater (if not already added)
  if (!recipientIds.has(data.updatedBy.id)) {
    recipientIds.add(data.updatedBy.id);
    recipients.push(data.updatedBy);
  }

  if (recipients.length === 0) {
    console.log('[EMAIL] No recipients for defect update email');
    return true;
  }

  const changesHtml = data.changes.map(change => {
    const getStatusColor = (status: string) => {
      switch (status.toUpperCase()) {
        case 'OPEN': return 'background-color: #3b82f6; color: white;';
        case 'IN_PROGRESS': return 'background-color: #f59e0b; color: white;';
        case 'RESOLVED': return 'background-color: #10b981; color: white;';
        case 'CLOSED': return 'background-color: #6b7280; color: white;';
        case 'REOPENED': return 'background-color: #ef4444; color: white;';
        default: return 'background-color: #9ca3af; color: white;';
      }
    };

    const getPriorityColor = (priority: string) => {
      switch (priority.toUpperCase()) {
        case 'URGENT': return 'background-color: #dc2626; color: white;';
        case 'HIGH': return 'background-color: #ea580c; color: white;';
        case 'MEDIUM': return 'background-color: #ca8a04; color: white;';
        case 'LOW': return 'background-color: #6b7280; color: white;';
        default: return 'background-color: #9ca3af; color: white;';
      }
    };

    const oldStyle = change.field === 'status' ? getStatusColor(change.oldValue) : getPriorityColor(change.oldValue);
    const newStyle = change.field === 'status' ? getStatusColor(change.newValue) : getPriorityColor(change.newValue);

    return `
      <div style="margin: 10px 0;">
        <strong style="color: #1f2937; text-transform: capitalize;">${change.field}:</strong>
        <div style="margin-top: 5px;">
          <span style="display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 8px; ${oldStyle}">
            ${change.oldValue}
          </span>
          <span style="color: #6b7280; margin: 0 8px;">→</span>
          <span style="display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; ${newStyle}">
            ${change.newValue}
          </span>
        </div>
      </div>
    `;
  }).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted Test Management Platform</p>
        </div>

        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; font-size: 20px; margin: 0;">🔔 Defect Updated</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          A defect has been updated in project <strong>${data.projectName}</strong>.
        </p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">${data.defectKey}: ${data.defectTitle}</h3>
          
          <div style="margin: 20px 0;">
            <h4 style="color: #4b5563; margin: 0 0 10px 0; font-size: 14px;">Changes:</h4>
            ${changesHtml}
          </div>

          <p style="color: #4b5563; font-size: 13px; margin: 15px 0 0 0;">
            <strong>Updated by:</strong> ${data.updatedBy.name} (${data.updatedBy.email})
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${defectUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              View Defect
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification from EZTest. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const changesText = data.changes
    .map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`)
    .join('\n');

  const text = `
Defect Updated

A defect has been updated in project ${data.projectName}.

Defect: ${data.defectKey}: ${data.defectTitle}

Changes:
${changesText}

Updated by: ${data.updatedBy.name} (${data.updatedBy.email})

View defect: ${defectUrl}

---
This is an automated notification from EZTest.
  `;

  // Send email to all recipients
  const results = await Promise.all(
    recipients.map(recipient =>
      sendEmail({
        to: recipient.email,
        subject,
        html,
        text,
      })
    )
  );

  return results.every(result => result);
}

/**
 * Send test run report email
 */
export async function sendTestRunReportEmail(
  data: TestRunReportEmailData
): Promise<boolean> {
  const subject = `📊 Test Run Report: ${data.testRunName}`;
  const testRunUrl = `${data.appUrl}/projects/${data.testRunId}`;
  const passRate = data.stats.total > 0 
    ? Math.round((data.stats.passed / data.stats.total) * 100) 
    : 0;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted Test Management Platform</p>
        </div>

        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; font-size: 20px; margin: 0;">📊 Test Run Report</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Hi <strong>${data.recipient.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Here's the test run report for <strong>${data.testRunName}</strong> in project <strong>${data.projectName}</strong>.
        </p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          ${data.testRunDescription ? `<p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 15px 0;">${data.testRunDescription}</p>` : ''}
          ${data.environment ? `<p style="color: #4b5563; font-size: 13px; margin: 0 0 15px 0;"><strong>Environment:</strong> ${data.environment}</p>` : ''}
          
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 36px; font-weight: bold; color: ${passRate >= 70 ? '#16a34a' : passRate >= 50 ? '#ca8a04' : '#dc2626'};">
              ${passRate}%
            </div>
            <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">Pass Rate</div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0;">
            <div style="background-color: #dcfce7; padding: 15px; border-radius: 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #166534;">${data.stats.passed}</div>
              <div style="font-size: 12px; color: #166534; margin-top: 5px;">Passed</div>
            </div>
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #991b1b;">${data.stats.failed}</div>
              <div style="font-size: 12px; color: #991b1b; margin-top: 5px;">Failed</div>
            </div>
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #854d0e;">${data.stats.blocked}</div>
              <div style="font-size: 12px; color: #854d0e; margin-top: 5px;">Blocked</div>
            </div>
            <div style="background-color: #dbeafe; padding: 15px; border-radius: 6px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #1e40af;">${data.stats.skipped}</div>
              <div style="font-size: 12px; color: #1e40af; margin-top: 5px;">Skipped</div>
            </div>
          </div>

          <p style="color: #4b5563; font-size: 13px; margin: 15px 0 0 0;">
            <strong>Total Tests:</strong> ${data.stats.total}
          </p>
          <p style="color: #4b5563; font-size: 13px; margin: 5px 0 0 0;">
            <strong>Started by:</strong> ${data.startedBy.name} (${data.startedBy.email})
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${testRunUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              View Test Run
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification from EZTest. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const text = `
Test Run Report

Hi ${data.recipient.name},

Here's the test run report for ${data.testRunName} in project ${data.projectName}.

${data.testRunDescription ? `Description: ${data.testRunDescription}` : ''}
${data.environment ? `Environment: ${data.environment}` : ''}

Test Results:
- Total: ${data.stats.total}
- Passed: ${data.stats.passed}
- Failed: ${data.stats.failed}
- Blocked: ${data.stats.blocked}
- Skipped: ${data.stats.skipped}
- Pass Rate: ${passRate}%

Started by: ${data.startedBy.name} (${data.startedBy.email})

View test run: ${testRunUrl}

---
This is an automated notification from EZTest.
  `;

  return sendEmail({
    to: data.recipient.email,
    subject,
    html,
    text,
  });
}

/**
 * Send defect comment notification email
 * Notifies other users when a comment is added to a defect they're involved with
 */
export async function sendDefectCommentEmail(
  data: DefectCommentEmailData
): Promise<boolean> {
  const subject = `💬 New Comment on Defect ${data.defectKey}: ${data.defectTitle}`;
  const defectUrl = `${data.appUrl}/projects/${data.defectId}`;

  // Create email content for each recipient
  const sendPromises = data.recipients.map(async (recipient) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted Test Management Platform</p>
        </div>

        <div style="background-color: #ecf0ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; font-size: 18px; margin: 0;">💬 New Comment Added</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Hi <strong>${recipient.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          <strong>${data.commentAuthor.name}</strong> added a comment to defect <strong>${data.defectKey}</strong> in project <strong>${data.projectName}</strong>.
        </p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">${data.defectTitle}</h3>
          
          <div style="border-left: 3px solid #3b82f6; padding: 15px; background-color: #f0f9ff; border-radius: 4px;">
            <p style="color: #1e40af; font-size: 12px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">Comment from ${data.commentAuthor.name}</p>
            <p style="color: #1f2937; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap; word-break: break-word;">
              ${data.commentContent}
            </p>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${defectUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              View Defect & Comments
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification from EZTest. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

    const text = `
New Comment Added

Hi ${recipient.name},

${data.commentAuthor.name} added a comment to defect ${data.defectKey} in project ${data.projectName}.

Defect: ${data.defectTitle}

Comment from ${data.commentAuthor.name}:
---
${data.commentContent}
---

View defect & comments: ${defectUrl}

---
This is an automated notification from EZTest.
  `;

    return sendEmail({
      to: recipient.email,
      subject,
      html,
      text,
    });
  });

  try {
    const results = await Promise.all(sendPromises);
    return results.every((result) => result === true);
  } catch (error) {
    console.error('Error sending defect comment emails:', error);
    return false;
  }
}

/**
 * Send project member added notification email
 * Notifies user when they're added to a project
 */
export async function sendProjectMemberEmail(
  data: AddProjectMemberEmailData
): Promise<boolean> {
  const subject = `🎉 Added to Project: ${data.projectName}`;
  const projectUrl = `${data.appUrl}/projects`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted Test Management Platform</p>
        </div>

        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #047857; font-size: 18px; margin: 0;">🎉 Welcome to the Team!</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Hi <strong>${data.newMember.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          You've been added to the project <strong>${data.projectName}</strong> by <strong>${data.addedByUser.name}</strong>.
        </p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">Project Information</h3>
          <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>Project:</strong> ${data.projectName}</li>
            <li><strong>Added by:</strong> ${data.addedByUser.name} (${data.addedByUser.email})</li>
            <li><strong>Status:</strong> You now have access to this project</li>
          </ul>
        </div>

        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
          You can now view test cases, manage defects, and participate in test runs for this project. Your permissions are based on your system role.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${projectUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Go to Projects
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification from EZTest. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const text = `
Welcome to the Team!

Hi ${data.newMember.name},

You've been added to the project ${data.projectName} by ${data.addedByUser.name}.

Project Information:
- Project: ${data.projectName}
- Added by: ${data.addedByUser.name} (${data.addedByUser.email})
- Status: You now have access to this project

You can now view test cases, manage defects, and participate in test runs for this project. Your permissions are based on your system role.

Go to Projects: ${projectUrl}

---
This is an automated notification from EZTest.
  `;

  return sendEmail({
    to: data.newMember.email,
    subject,
    html,
    text,
  });
}

/**
 * Send project member removal notification
 * Notifies user when they are removed from a project
 */
export async function sendRemoveProjectMemberEmail(
  data: RemoveProjectMemberEmailData
): Promise<boolean> {
  const subject = `🚫 Removed from Project: ${data.projectName}`;
  const projectsUrl = `${data.appUrl}/projects`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted Test Management Platform</p>
        </div>

        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #991b1b; font-size: 18px; margin: 0;">🚫 Project Access Removed</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Hi <strong>${data.removedMember.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          You have been removed from the project <strong>${data.projectName}</strong> by <strong>${data.removedByUser.name}</strong>.
        </p>

        <div style="background-color: #f3f4f6; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
          <p style="color: #1f2937; font-size: 14px; margin: 0 0 10px 0;">
            <strong>What this means:</strong>
          </p>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="color: #4b5563; font-size: 14px; margin: 5px 0;">You no longer have access to this project's test cases and defects</li>
            <li style="color: #4b5563; font-size: 14px; margin: 5px 0;">You cannot view or participate in test runs for this project</li>
            <li style="color: #4b5563; font-size: 14px; margin: 5px 0;">You can still access other projects you're a member of</li>
          </ul>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>Questions?</strong> If you believe this was done in error, please contact <strong>${data.removedByUser.name}</strong> at <strong>${data.removedByUser.email}</strong>
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${projectsUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              View My Projects
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification from EZTest. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const text = `
Project Access Removed

Hi ${data.removedMember.name},

You have been removed from the project "${data.projectName}" by ${data.removedByUser.name}.

What this means:
- You no longer have access to this project's test cases and defects
- You cannot view or participate in test runs for this project
- You can still access other projects you're a member of

Questions? If you believe this was done in error, please contact ${data.removedByUser.name} at ${data.removedByUser.email}

View My Projects: ${projectsUrl}

---
This is an automated notification from EZTest.
  `;

  return sendEmail({
    to: data.removedMember.email,
    subject,
    html,
    text,
  });
}

/**
 * Send OTP verification email
 * Sends 6-digit OTP code for login or registration
 */
export async function sendOtpEmail(
  data: OtpEmailData
): Promise<boolean> {
  const actionType = data.type === 'login' ? 'Login' : 'Registration';
  const subject = `🔐 Your EZTest ${actionType} OTP Code`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted Test Management Platform</p>
        </div>

        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; font-size: 18px; margin: 0;">🔐 ${actionType} Verification</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          You requested a verification code for ${data.type === 'login' ? 'signing in to' : 'registering on'} your EZTest account.
        </p>

        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
            Your OTP Code
          </p>
          <div style="font-size: 36px; font-weight: bold; color: #033977; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${data.otp}
          </div>
          <p style="color: #ef4444; font-size: 13px; margin: 15px 0 0 0;">
            ⏰ Valid for 10 minutes
          </p>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>Security Notice:</strong> Never share this OTP with anyone. EZTest will never ask for your OTP via phone or email.
          </p>
        </div>

        <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 20px 0 0 0;">
          If you didn't request this code, please ignore this email. Your account remains secure.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification from EZTest. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const text = `
${actionType} Verification

You requested a verification code for ${data.type === 'login' ? 'signing in to' : 'registering on'} your EZTest account.

Your OTP Code: ${data.otp}

Valid for 10 minutes

Security Notice: Never share this OTP with anyone. EZTest will never ask for your OTP via phone or email.

If you didn't request this code, please ignore this email. Your account remains secure.

---
This is an automated notification from EZTest.
  `;

  return sendEmail({
    to: data.email,
    subject,
    html,
    text,
  });
}

/**
 * Send user invitation email (admin creates new user)
 * Notifies new user with welcome message
 */
export async function sendUserInvitationEmail(
  data: InviteUserEmailData
): Promise<boolean> {
  const subject = `👋 Welcome to EZTest - Your Account is Ready`;
  const loginUrl = `${data.appUrl}/auth/login`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted Test Management Platform</p>
        </div>

        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #047857; font-size: 18px; margin: 0;">👋 Welcome to EZTest!</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Hi <strong>${data.invitedUser.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Your EZTest account has been created by <strong>${data.invitedByUser.name}</strong>. You're all set to start collaborating on test management!
        </p>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <p style="color: #92400e; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Your Login Credentials</strong>
          </p>
          <div style="background-color: white; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 13px;">
            <p style="margin: 0 0 8px 0; color: #1f2937;"><strong>Email:</strong> <span style="color: #033977;">${data.invitedUser.email}</span></p>
            <p style="margin: 0; color: #1f2937;"><strong>Temporary Password:</strong> <span style="color: #033977;">${data.tempPassword}</span></p>
          </div>
          <p style="color: #92400e; font-size: 12px; margin: 10px 0 0 0;">
            ⚠️ <strong>Important:</strong> Please change your password after your first login for security.
          </p>
        </div>

        <h3 style="color: #1f2937; font-size: 14px; margin: 0 0 12px 0;">Getting Started:</h3>
        <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
          <li>Click the login button below</li>
          <li>Enter your email and temporary password</li>
          <li>Update your password to something secure</li>
          <li>Start exploring your projects and test cases</li>
        </ol>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${loginUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Login to EZTest
            </a>
          </div>
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #4b5563; font-size: 13px; margin: 0;">
            <strong>Questions?</strong> Contact <strong>${data.invitedByUser.name}</strong> at <strong>${data.invitedByUser.email}</strong>
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification from EZTest. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const text = `
Welcome to EZTest!

Hi ${data.invitedUser.name},

Your EZTest account has been created by ${data.invitedByUser.name}. You're all set to start collaborating on test management!

Your Login Credentials:
- Email: ${data.invitedUser.email}
- Temporary Password: ${data.tempPassword}

IMPORTANT: Please change your password after your first login for security.

Getting Started:
1. Click the login button below
2. Enter your email and temporary password
3. Update your password to something secure
4. Start exploring your projects and test cases

Login to EZTest: ${loginUrl}

Questions? Contact ${data.invitedByUser.name} at ${data.invitedByUser.email}

---
This is an automated notification from EZTest.
  `;

  return sendEmail({
    to: data.invitedUser.email,
    subject,
    html,
    text,
  });
}

/**
 * Send email notification when user account is updated by admin
 */
export async function sendUserUpdateEmail(
  data: UserUpdateEmailData
): Promise<boolean> {
  const subject = `🔄 Your EZTest Account Has Been Updated`;
  const profileUrl = `${data.appUrl}/profile`;

  const changesHtml = data.changes.map(change => 
    `<li style="color: #4b5563; font-size: 14px; margin: 5px 0;">${change}</li>`
  ).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted Test Management Platform</p>
        </div>

        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; font-size: 18px; margin: 0;">🔄 Account Update Notification</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Hi <strong>${data.user.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Your EZTest account has been updated by <strong>${data.updatedByUser.name}</strong> (Administrator).
        </p>

        <div style="background-color: #f3f4f6; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
          <p style="color: #1f2937; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Changes Made:</strong>
          </p>
          <ul style="margin: 0; padding-left: 20px;">
            ${changesHtml}
          </ul>
        </div>

        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
          You can review your updated profile information by logging into your account.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${profileUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              View Profile
            </a>
          </div>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>Security Notice:</strong> If you didn't expect these changes, please contact your administrator immediately at <strong>${data.updatedByUser.email}</strong>
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification from EZTest. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const changesText = data.changes.map(change => `  - ${change}`).join('\n');

  const text = `
Account Update Notification

Hi ${data.user.name},

Your EZTest account has been updated by ${data.updatedByUser.name} (Administrator).

Changes Made:
${changesText}

You can review your updated profile information by logging into your account.

View Profile: ${profileUrl}

Security Notice: If you didn't expect these changes, please contact your administrator immediately at ${data.updatedByUser.email}

---
This is an automated notification from EZTest.
  `;

  return sendEmail({
    to: data.user.email,
    subject,
    html,
    text,
  });
}

/**
 * Send email notification when user account is deleted by admin
 */
export async function sendUserDeleteEmail(
  data: UserDeleteEmailData
): Promise<boolean> {
  const subject = `❌ Your EZTest Account Has Been Deactivated`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted Test Management Platform</p>
        </div>

        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #991b1b; font-size: 18px; margin: 0;">❌ Account Deactivation Notice</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Hi <strong>${data.user.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Your EZTest account has been deactivated by <strong>${data.deletedByUser.name}</strong> (Administrator).
        </p>

        <div style="background-color: #f3f4f6; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
          <p style="color: #1f2937; font-size: 14px; margin: 0 0 10px 0;">
            <strong>What this means:</strong>
          </p>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="color: #4b5563; font-size: 14px; margin: 5px 0;">You will no longer have access to the EZTest platform</li>
            <li style="color: #4b5563; font-size: 14px; margin: 5px 0;">Your account data has been archived</li>
            <li style="color: #4b5563; font-size: 14px; margin: 5px 0;">You cannot log in with your credentials</li>
          </ul>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>Questions or Concerns?</strong> If you believe this is a mistake or need clarification, please contact your administrator at <strong>${data.deletedByUser.email}</strong>
          </p>
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #4b5563; font-size: 13px; margin: 0;">
            <strong>Account Details:</strong><br>
            Email: <strong>${data.user.email}</strong><br>
            Deactivated on: <strong>${new Date().toLocaleDateString()}</strong>
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          This is an automated notification from EZTest. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  const text = `
Account Deactivation Notice

Hi ${data.user.name},

Your EZTest account has been deactivated by ${data.deletedByUser.name} (Administrator).

What this means:
  - You will no longer have access to the EZTest platform
  - Your account data has been archived
  - You cannot log in with your credentials

Questions or Concerns? If you believe this is a mistake or need clarification, please contact your administrator at ${data.deletedByUser.email}

Account Details:
Email: ${data.user.email}
Deactivated on: ${new Date().toLocaleDateString()}

---
This is an automated notification from EZTest.
  `;

  return sendEmail({
    to: data.user.email,
    subject,
    html,
    text,
  });
}
