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
  /** Additional recipients (e.g. watchers) who receive the same notification with watcher wording */
  additionalRecipients?: User[];
  defectId: string;
  defectKey: string;
  defectTitle: string;
  defectDescription?: string;
  status: string;
  severity: string;
  priority: string;
  projectId: string;
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
  projectId: string;
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
  projectId: string;
  projectName: string;
  recipients: User[];
  appUrl: string;
}

interface DefectUpdateEmailData {
  defectId: string;
  defectTitle: string;
  defectKey: string;
  projectId: string;
  projectName: string;
  updatedBy: User;
  changes: {
    field: 'status' | 'priority' | 'progress';
    oldValue: string;
    newValue: string;
  }[];
  assignedTo?: User;
  createdBy: User;
  recipients: User[];
  appUrl: string;
}

interface DefectWatcherAddedEmailData {
  watcher: User;
  defectId: string;
  defectKey: string;
  defectTitle: string;
  projectId: string;
  projectName: string;
  addedByUser: User;
  appUrl: string;
}

interface DefectCreationEmailData {
  creator: User;
  recipients: User[];
  defectId: string;
  defectKey: string;
  defectTitle: string;
  defectDescription?: string;
  status: string;
  severity: string;
  priority: string;
  projectId: string;
  projectName: string;
  assignedTo?: User;
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
  const subject = 'Сброс пароля EZTest';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0;">Запрос на сброс пароля</h2>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
          Здравствуйте, ${userName}.
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Мы получили запрос на сброс вашего пароля. Нажмите кнопку ниже, чтобы установить новый пароль:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${resetLink}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Сбросить пароль
            </a>
          </div>
        </div>

        <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 20px 0 10px 0;">
          Или скопируйте и вставьте эту ссылку в браузер:
        </p>
        <p style="word-break: break-all; color: #033977; font-size: 13px; background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin: 0 0 20px 0;">
          ${resetLink}
        </p>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>Уведомление безопасности:</strong> Ссылка действует 1 час. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо или немедленно свяжитесь с поддержкой.
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
Запрос на сброс пароля

Здравствуйте, ${userName}.

Мы получили запрос на сброс вашего пароля. Перейдите по ссылке ниже, чтобы установить новый пароль:

${resetLink}

Ссылка действует 1 час. Если вы не запрашивали сброс пароля, проигнорируйте это письмо или свяжитесь с поддержкой.

---
EZTest - Self-hosted платформа управления тестированием
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
  const enableSmtp = process.env.ENABLE_SMTP;
  console.log('[EMAIL] Checking email service availability...');
  console.log('[EMAIL] ENABLE_SMTP value:', enableSmtp, '(type:', typeof enableSmtp, ')');
  
  if (enableSmtp !== 'true') {
    console.log('[EMAIL] Email service is disabled (ENABLE_SMTP is not set to "true")');
    console.log('[EMAIL] Current value:', enableSmtp);
    return false;
  }

  console.log('[EMAIL] ENABLE_SMTP is true, checking SMTP configuration...');
  console.log('[EMAIL] SMTP_HOST:', process.env.SMTP_HOST ? 'Set' : 'Missing');
  console.log('[EMAIL] SMTP_USER:', process.env.SMTP_USER ? 'Set' : 'Missing');
  console.log('[EMAIL] SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'Missing');
  console.log('[EMAIL] SMTP_FROM:', process.env.SMTP_FROM ? 'Set' : 'Missing');
  console.log('[EMAIL] SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');
  console.log('[EMAIL] SMTP_SECURE:', process.env.SMTP_SECURE);

  const transporter = getTransporter();
  if (!transporter) {
    console.error('[EMAIL] Failed to create SMTP transporter');
    return false;
  }

  try {
    console.log('[EMAIL] Verifying SMTP connection...');
    await transporter.verify();
    console.log('[EMAIL] ✓ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('[EMAIL] ✗ Email service verification failed');
    if (error instanceof Error) {
      console.error('[EMAIL] Error name:', error.name);
      console.error('[EMAIL] Error message:', error.message);
    }
    console.error('[EMAIL] Full error:', error);
    return false;
  }
}

/**
 * Send defect creation notification email to the creator
 */
export async function sendDefectCreationEmail(
  data: DefectCreationEmailData
): Promise<boolean> {
  const subject = `✅ Дефект создан: ${data.defectTitle}`;
  const defectUrl = `${data.appUrl}/projects/${data.projectId}/defects/${data.defectId}`;

  if (data.recipients.length === 0) {
    console.log('[EMAIL] No recipients for defect creation email');
    return true;
  }

  // Create email content for each recipient
  const sendPromises = data.recipients.map(async (recipient) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #047857; font-size: 20px; margin: 0;">✅ Дефект успешно создан</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Здравствуйте, <strong>${recipient.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          В проекте <strong>${data.projectName}</strong> создан новый дефект пользователем <strong>${data.creator.name}</strong>.
        </p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">${data.defectKey}: ${data.defectTitle}</h3>
          ${data.defectDescription ? `<p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">${data.defectDescription}</p>` : ''}
          
          <div style="margin: 15px 0; padding: 15px; background-color: white; border-radius: 6px;">
            <div style="margin-bottom: 12px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Статус</p>
              <span style="display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold; ${
                data.status === 'NEW' ? 'background-color: #3b82f6; color: white;' :
                data.status === 'IN_PROGRESS' ? 'background-color: #8b5cf6; color: white;' :
                data.status === 'FIXED' ? 'background-color: #10b981; color: white;' :
                data.status === 'TESTED' ? 'background-color: #f59e0b; color: white;' :
                data.status === 'CLOSED' ? 'background-color: #6b7280; color: white;' :
                'background-color: #9ca3af; color: white;'
              }">
                ${data.status === 'IN_PROGRESS' ? 'IN PROGRESS' : data.status}
              </span>
            </div>

            <div style="margin-bottom: 12px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Серьезность</p>
              <span style="display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold; ${
                data.severity === 'CRITICAL' ? 'background-color: #dc2626; color: white;' :
                data.severity === 'HIGH' ? 'background-color: #ea580c; color: white;' :
                data.severity === 'MEDIUM' ? 'background-color: #ca8a04; color: white;' :
                'background-color: #16a34a; color: white;'
              }">
                ${data.severity}
              </span>
            </div>

            <div style="margin-bottom: 12px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Приоритет</p>
              <span style="display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold; ${
                data.priority === 'CRITICAL' || data.priority === 'URGENT' ? 'background-color: #dc2626; color: white;' :
                data.priority === 'HIGH' ? 'background-color: #ea580c; color: white;' :
                data.priority === 'MEDIUM' ? 'background-color: #ca8a04; color: white;' :
                'background-color: #6b7280; color: white;'
              }">
                ${data.priority}
              </span>
            </div>

            ${data.assignedTo ? `
              <div>
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Назначен</p>
                <p style="color: #4b5563; font-size: 14px; margin: 0;">
                  ${data.assignedTo.name} <span style="color: #9ca3af;">(${data.assignedTo.email})</span>
                </p>
              </div>
            ` : `
              <div>
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Назначен</p>
                <p style="color: #9ca3af; font-size: 14px; margin: 0; font-style: italic;">Пока не назначен</p>
              </div>
            `}
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${defectUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Открыть дефект
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Это автоматическое уведомление от EZTest. Пожалуйста, не отвечайте на это письмо.
        </p>
      </div>
    </div>
  `;

    const text = `
Дефект успешно создан

Здравствуйте, ${recipient.name},

В проекте ${data.projectName} пользователем ${data.creator.name}.

Дефект: ${data.defectKey}: ${data.defectTitle}
${data.defectDescription ? `Описание: ${data.defectDescription}` : ''}

Статус: ${data.status === 'IN_PROGRESS' ? 'IN PROGRESS' : data.status}
Серьезность: ${data.severity}
Приоритет: ${data.priority}
${data.assignedTo ? `Назначен: ${data.assignedTo.name} (${data.assignedTo.email})` : 'Назначен: Пока не назначен'}

Открыть дефект: ${defectUrl}

---
Это автоматическое уведомление от EZTest.
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
    console.error('[EMAIL] Error sending defect creation emails:', error);
    return false;
  }
}

/**
 * Send defect assignment notification email
 */
export async function sendDefectAssignmentEmail(
  data: DefectAssignmentEmailData
): Promise<boolean> {
  const subject = `🐛 Назначен дефект: ${data.defectTitle}`;
  const defectUrl = `${data.appUrl}/projects/${data.projectId}/defects/${data.defectId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #991b1b; font-size: 20px; margin: 0;">🐛 Новое назначение дефекта</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Здравствуйте, <strong>${data.assignee.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Вам назначен новый дефект в проекте <strong>${data.projectName}</strong> пользователем <strong>${data.assignedBy.name}</strong>.
        </p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">${data.defectKey}: ${data.defectTitle}</h3>
          ${data.defectDescription ? `<p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">${data.defectDescription}</p>` : ''}
          
          <div style="margin: 15px 0; padding: 15px; background-color: white; border-radius: 6px;">
            <div style="margin-bottom: 12px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Статус</p>
              <span style="display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold; ${
                data.status === 'NEW' ? 'background-color: #3b82f6; color: white;' :
                data.status === 'IN_PROGRESS' ? 'background-color: #8b5cf6; color: white;' :
                data.status === 'FIXED' ? 'background-color: #10b981; color: white;' :
                data.status === 'TESTED' ? 'background-color: #f59e0b; color: white;' :
                data.status === 'CLOSED' ? 'background-color: #6b7280; color: white;' :
                'background-color: #9ca3af; color: white;'
              }">
                ${data.status === 'IN_PROGRESS' ? 'IN PROGRESS' : data.status}
              </span>
            </div>

            <div style="margin-bottom: 12px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Серьезность</p>
              <span style="display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold; ${
                data.severity === 'CRITICAL' ? 'background-color: #dc2626; color: white;' :
                data.severity === 'HIGH' ? 'background-color: #ea580c; color: white;' :
                data.severity === 'MEDIUM' ? 'background-color: #ca8a04; color: white;' :
                'background-color: #16a34a; color: white;'
              }">
                ${data.severity}
              </span>
            </div>

            <div style="margin-bottom: 12px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Приоритет</p>
              <span style="display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 13px; font-weight: bold; ${
                data.priority === 'CRITICAL' || data.priority === 'URGENT' ? 'background-color: #dc2626; color: white;' :
                data.priority === 'HIGH' ? 'background-color: #ea580c; color: white;' :
                data.priority === 'MEDIUM' ? 'background-color: #ca8a04; color: white;' :
                'background-color: #6b7280; color: white;'
              }">
                ${data.priority}
              </span>
            </div>

            <div>
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Назначил</p>
              <p style="color: #4b5563; font-size: 14px; margin: 0;">
                ${data.assignedBy.name} <span style="color: #9ca3af;">(${data.assignedBy.email})</span>
              </p>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${defectUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Открыть дефект
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Это автоматическое уведомление от EZTest. Пожалуйста, не отвечайте на это письмо.
        </p>
      </div>
    </div>
  `;

  const text = `
Новое назначение дефекта

Здравствуйте, ${data.assignee.name},

Вам назначен новый дефект в проекте ${data.projectName} пользователем ${data.assignedBy.name}.

Дефект: ${data.defectKey}: ${data.defectTitle}
${data.defectDescription ? `Описание: ${data.defectDescription}` : ''}

Статус: ${data.status === 'IN_PROGRESS' ? 'IN PROGRESS' : data.status}
Серьезность: ${data.severity}
Приоритет: ${data.priority}
Назначил: ${data.assignedBy.name} (${data.assignedBy.email})

Открыть дефект: ${defectUrl}

---
Это автоматическое уведомление от EZTest.
  `;

  const assigneeSent = await sendEmail({
    to: data.assignee.email,
    subject,
    html,
    text,
  });

  // Send to additional recipients (e.g. watchers) with watcher-specific wording
  if (data.additionalRecipients?.length) {
    const defectUrl = `${data.appUrl}/projects/${data.projectId}/defects/${data.defectId}`;
    const watcherPromises = data.additionalRecipients.map(async (recipient) => {
      const watcherHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #991b1b; font-size: 20px; margin: 0;">🐛 Defect Assignment (Watching)</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Здравствуйте, <strong>${recipient.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Отслеживаемый вами дефект назначен пользователю <strong>${data.assignee.name}</strong> в проекте <strong>${data.projectName}</strong> пользователем <strong>${data.assignedBy.name}</strong>.
        </p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">${data.defectKey}: ${data.defectTitle}</h3>
          ${data.defectDescription ? `<p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">${data.defectDescription}</p>` : ''}
          <p style="color: #6b7280; font-size: 14px; margin: 0;">Статус: ${data.status === 'IN_PROGRESS' ? 'IN PROGRESS' : data.status} | Серьезность: ${data.severity} | Приоритет: ${data.priority}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${defectUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">Открыть дефект</a>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">Это автоматическое уведомление от EZTest.</p>
      </div>
    </div>
  `;
      const watcherText = `Здравствуйте, ${recipient.name},\n\nОтслеживаемый вами дефект назначен пользователю ${data.assignee.name} в проекте ${data.projectName}.\n\n${data.defectKey}: ${data.defectTitle}\nView: ${defectUrl}`;
      return sendEmail({
        to: recipient.email,
        subject,
        html: watcherHtml,
        text: watcherText,
      });
    });
    const watcherResults = await Promise.all(watcherPromises);
    return assigneeSent && watcherResults.every(Boolean);
  }

  return assigneeSent;
}

/**
 * Send email when a user is added as a watcher to a defect
 */
export async function sendDefectWatcherAddedEmail(
  data: DefectWatcherAddedEmailData
): Promise<boolean> {
  const subject = `👁️ Добавлен как наблюдатель: ${data.defectTitle}`;
  const defectUrl = `${data.appUrl}/projects/${data.projectId}/defects/${data.defectId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #eef2ff; border-left: 4px solid #4f46e5; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #3730a3; font-size: 18px; margin: 0;">👁️ Теперь вы наблюдаете за дефектом</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Здравствуйте, <strong>${data.watcher.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Вы добавлены наблюдателем к дефекту <strong>${data.defectKey}: ${data.defectTitle}</strong> в проекте <strong>${data.projectName}</strong> пользователем <strong>${data.addedByUser.name}</strong>.
          Вы будете получать уведомления о комментариях и изменениях статуса этого дефекта.
        </p>

        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <p style="color: #4b5563; font-size: 14px; margin: 0 0 4px 0;"><strong>Дефект:</strong> ${data.defectKey}: ${data.defectTitle}</p>
          <p style="color: #6b7280; font-size: 13px; margin: 0;"><strong>Проект:</strong> ${data.projectName}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${defectUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
            Открыть дефект
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Это автоматическое уведомление от EZTest.
        </p>
      </div>
    </div>
  `;

  const text = `
Теперь вы наблюдаете за этим дефектом.

Дефект: ${data.defectKey}: ${data.defectTitle}
Проект: ${data.projectName}

Вы будете получать уведомления о комментариях и изменениях статуса этого дефекта.

Открыть дефект: ${defectUrl}

---
Это автоматическое уведомление от EZTest.
  `;

  return sendEmail({
    to: data.watcher.email,
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
  const changeDescription = data.changes
    .map(c => `${c.field} changed from ${c.oldValue} to ${c.newValue}`)
    .join(', ');
  
  const subject = `🔔 Дефект обновлен: ${data.defectTitle}`;
  const defectUrl = `${data.appUrl}/projects/${data.projectId}/defects/${data.defectId}`;

  if (data.recipients.length === 0) {
    console.log('[EMAIL] No recipients for defect update email');
    return true;
  }

  // Create email content for each recipient
  const sendPromises = data.recipients.map(async (recipient) => {

  const changesHtml = data.changes.map(change => {
    const getStatusColor = (status: string) => {
      switch (status.toUpperCase()) {
        case 'NEW': return 'background-color: #3b82f6; color: white;';
        case 'IN_PROGRESS': return 'background-color: #8b5cf6; color: white;';
        case 'FIXED': return 'background-color: #10b981; color: white;';
        case 'TESTED': return 'background-color: #f59e0b; color: white;';
        case 'CLOSED': return 'background-color: #6b7280; color: white;';
        case 'OPEN': return 'background-color: #3b82f6; color: white;';
        case 'RESOLVED': return 'background-color: #10b981; color: white;';
        case 'REOPENED': return 'background-color: #ef4444; color: white;';
        default: return 'background-color: #9ca3af; color: white;';
      }
    };

    const getPriorityColor = (priority: string) => {
      switch (priority.toUpperCase()) {
        case 'CRITICAL':
        case 'URGENT': return 'background-color: #dc2626; color: white;';
        case 'HIGH': return 'background-color: #ea580c; color: white;';
        case 'MEDIUM': return 'background-color: #ca8a04; color: white;';
        case 'LOW': return 'background-color: #6b7280; color: white;';
        default: return 'background-color: #9ca3af; color: white;';
      }
    };

    const getProgressColor = (progress: string) => {
      // Extract number from "50%" format
      const progressNum = parseInt(progress.replace('%', '')) || 0;
      if (progressNum === 0) return 'background-color: #e5e7eb; color: #1f2937;';
      if (progressNum < 25) return 'background-color: #fee2e2; color: #991b1b;';
      if (progressNum < 50) return 'background-color: #fef3c7; color: #92400e;';
      if (progressNum < 75) return 'background-color: #dbeafe; color: #1e40af;';
      if (progressNum < 100) return 'background-color: #dcfce7; color: #166534;';
      return 'background-color: #10b981; color: white;';
    };

    let oldStyle: string;
    let newStyle: string;

    if (change.field === 'status') {
      oldStyle = getStatusColor(change.oldValue);
      newStyle = getStatusColor(change.newValue);
    } else if (change.field === 'priority') {
      oldStyle = getPriorityColor(change.oldValue);
      newStyle = getPriorityColor(change.newValue);
    } else if (change.field === 'progress') {
      oldStyle = getProgressColor(change.oldValue);
      newStyle = getProgressColor(change.newValue);
    } else {
      oldStyle = 'background-color: #9ca3af; color: white;';
      newStyle = 'background-color: #9ca3af; color: white;';
    }

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
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; font-size: 20px; margin: 0;">🔔 Дефект обновлен</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Здравствуйте, <strong>${recipient.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          В проекте <strong>${data.projectName}</strong> был обновлен дефект пользователем <strong>${data.updatedBy.name}</strong>.
        </p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">${data.defectKey}: ${data.defectTitle}</h3>
          
          <div style="margin: 20px 0;">
            <h4 style="color: #4b5563; margin: 0 0 10px 0; font-size: 14px;">Изменения:</h4>
            ${changesHtml}
          </div>

          <p style="color: #4b5563; font-size: 13px; margin: 15px 0 0 0;">
            <strong>Обновил:</strong> ${data.updatedBy.name} (${data.updatedBy.email})
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${defectUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Открыть дефект
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Это автоматическое уведомление от EZTest. Пожалуйста, не отвечайте на это письмо.
        </p>
      </div>
    </div>
  `;

    const changesText = data.changes
      .map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`)
      .join('\n');

    const text = `
Дефект обновлен

Здравствуйте, ${recipient.name},

В проекте ${data.projectName} пользователем ${data.updatedBy.name}.

Дефект: ${data.defectKey}: ${data.defectTitle}

Изменения:
${changesText}

Обновил: ${data.updatedBy.name} (${data.updatedBy.email})

Открыть дефект: ${defectUrl}

---
Это автоматическое уведомление от EZTest.
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
    console.error('[EMAIL] Error sending defect update emails:', error);
    return false;
  }
}

/**
 * Send test run report email
 */
export async function sendTestRunReportEmail(
  data: TestRunReportEmailData
): Promise<boolean> {
  const subject = `📊 Отчет по тест-рану: ${data.testRunName}`;
  const testRunUrl = `${data.appUrl}/projects/${data.projectId}/testruns/${data.testRunId}`;
  const passRate = data.stats.total > 0 
    ? Math.round((data.stats.passed / data.stats.total) * 100) 
    : 0;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; font-size: 20px; margin: 0;">📊 Отчет по тест-рану</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Здравствуйте, <strong>${data.recipient.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Ниже отчет по тест-рану <strong>${data.testRunName}</strong> в проекте <strong>${data.projectName}</strong>.
        </p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          ${data.testRunDescription ? `<p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0 0 15px 0;">${data.testRunDescription}</p>` : ''}
          ${data.environment ? `<p style="color: #4b5563; font-size: 13px; margin: 0 0 15px 0;"><strong>Окружение:</strong> ${data.environment}</p>` : ''}
          
          <div style="text-align: center; margin: 20px 0;">
            <div style="font-size: 36px; font-weight: bold; color: ${passRate >= 70 ? '#16a34a' : passRate >= 50 ? '#ca8a04' : '#dc2626'};">
              ${passRate}%
            </div>
            <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">Процент успешных</div>
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
              <div style="font-size: 12px; color: #1e40af; margin-top: 5px;">Пропущено</div>
            </div>
          </div>

          <p style="color: #4b5563; font-size: 13px; margin: 15px 0 0 0;">
            <strong>Всего тестов:</strong> ${data.stats.total}
          </p>
          <p style="color: #4b5563; font-size: 13px; margin: 5px 0 0 0;">
            <strong>Запустил:</strong> ${data.startedBy.name} (${data.startedBy.email})
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${testRunUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Открыть тест-ран
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Это автоматическое уведомление от EZTest. Пожалуйста, не отвечайте на это письмо.
        </p>
      </div>
    </div>
  `;

  const text = `
Отчет по тест-рану

Здравствуйте, ${data.recipient.name},

Ниже отчет по тест-рану ${data.testRunName} в проекте ${data.projectName}.

${data.testRunDescription ? `Описание: ${data.testRunDescription}` : ''}
${data.environment ? `Окружение: ${data.environment}` : ''}

Результаты тестов:
- Всего: ${data.stats.total}
- Успешно: ${data.stats.passed}
- Провалено: ${data.stats.failed}
- Заблокировано: ${data.stats.blocked}
- Пропущено: ${data.stats.skipped}
- Процент успешных: ${passRate}%

Запустил: ${data.startedBy.name} (${data.startedBy.email})

Открыть тест-ран: ${testRunUrl}

---
Это автоматическое уведомление от EZTest.
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
  const subject = `💬 Новый комментарий к дефекту ${data.defectKey}: ${data.defectTitle}`;
  const defectUrl = `${data.appUrl}/projects/${data.projectId}/defects/${data.defectId}`;

  // Create email content for each recipient
  const sendPromises = data.recipients.map(async (recipient) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #ecf0ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; font-size: 18px; margin: 0;">💬 Добавлен новый комментарий</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Здравствуйте, <strong>${recipient.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          <strong>${data.commentAuthor.name}</strong> добавил(а) комментарий к дефекту <strong>${data.defectKey}</strong> в проекте <strong>${data.projectName}</strong>.
        </p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">${data.defectTitle}</h3>
          
          <div style="border-left: 3px solid #3b82f6; padding: 15px; background-color: #f0f9ff; border-radius: 4px;">
            <p style="color: #1e40af; font-size: 12px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">Комментарий от ${data.commentAuthor.name}</p>
            <p style="color: #1f2937; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap; word-break: break-word;">
              ${data.commentContent}
            </p>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${defectUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Открыть дефект и комментарии
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Это автоматическое уведомление от EZTest. Пожалуйста, не отвечайте на это письмо.
        </p>
      </div>
    </div>
  `;

    const text = `
Добавлен новый комментарий

Здравствуйте, ${recipient.name},

${data.commentAuthor.name} added a comment to defect ${data.defectKey} в проекте ${data.projectName}.

Дефект: ${data.defectTitle}

Комментарий от ${data.commentAuthor.name}:
---
${data.commentContent}
---

Открыть дефект & comments: ${defectUrl}

---
Это автоматическое уведомление от EZTest.
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
  const subject = `🎉 Добавлен в проект: ${data.projectName}`;
  const projectUrl = `${data.appUrl}/projects`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #047857; font-size: 18px; margin: 0;">🎉 Добро пожаловать в команду!</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Здравствуйте, <strong>${data.newMember.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Вы добавлены в проект <strong>${data.projectName}</strong> пользователем <strong>${data.addedByUser.name}</strong>.
        </p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 12px 0; font-size: 16px;">Информация о проекте</h3>
          <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>Проект:</strong> ${data.projectName}</li>
            <li><strong>Добавил:</strong> ${data.addedByUser.name} (${data.addedByUser.email})</li>
            <li><strong>Статус:</strong> У вас теперь есть доступ к этому проекту</li>
          </ul>
        </div>

        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
          Теперь вы можете просматривать тест-кейсы, управлять дефектами и участвовать в тест-ранах этого проекта. Доступ определяется вашей системной ролью.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${projectUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Перейти к проектам
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Это автоматическое уведомление от EZTest. Пожалуйста, не отвечайте на это письмо.
        </p>
      </div>
    </div>
  `;

  const text = `
Добро пожаловать в команду!

Здравствуйте, ${data.newMember.name},

Вы добавлены в проект ${data.projectName} пользователем ${data.addedByUser.name}.

Информация о проекте:
- Проект: ${data.projectName}
- Добавил: ${data.addedByUser.name} (${data.addedByUser.email})
- Статус: У вас теперь есть доступ к этому проекту

Теперь вы можете просматривать тест-кейсы, управлять дефектами и участвовать в тест-ранах этого проекта. Доступ определяется вашей системной ролью.

Перейти к проектам: ${projectUrl}

---
Это автоматическое уведомление от EZTest.
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
  const subject = `🚫 Удален из проекта: ${data.projectName}`;
  const projectsUrl = `${data.appUrl}/projects`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #991b1b; font-size: 18px; margin: 0;">🚫 Доступ к проекту удален</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Здравствуйте, <strong>${data.removedMember.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Вы удалены из проекта <strong>${data.projectName}</strong> пользователем <strong>${data.removedByUser.name}</strong>.
        </p>

        <div style="background-color: #f3f4f6; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
          <p style="color: #1f2937; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Что это значит:</strong>
          </p>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="color: #4b5563; font-size: 14px; margin: 5px 0;">У вас больше нет доступа к тест-кейсам и дефектам этого проекта</li>
            <li style="color: #4b5563; font-size: 14px; margin: 5px 0;">Вы больше не можете просматривать и участвовать в тест-ранах этого проекта</li>
            <li style="color: #4b5563; font-size: 14px; margin: 5px 0;">Вы по-прежнему можете работать с другими проектами, где вы являетесь участником</li>
          </ul>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>Вопросы?</strong> Если это сделано по ошибке, свяжитесь с <strong>${data.removedByUser.name}</strong> по адресу <strong>${data.removedByUser.email}</strong>
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${projectsUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Открыть мои проекты
            </a>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Это автоматическое уведомление от EZTest. Пожалуйста, не отвечайте на это письмо.
        </p>
      </div>
    </div>
  `;

  const text = `
Доступ к проекту удален

Здравствуйте, ${data.removedMember.name},

Вы удалены из проекта "${data.projectName}" пользователем ${data.removedByUser.name}.

Что это значит:
- У вас больше нет доступа к тест-кейсам и дефектам этого проекта
- Вы больше не можете просматривать и участвовать в тест-ранах этого проекта
- Вы по-прежнему можете работать с другими проектами, где вы являетесь участником

Вопросы? If you believe this was done in error, please contact ${data.removedByUser.name} по адресу ${data.removedByUser.email}

Открыть мои проекты: ${projectsUrl}

---
Это автоматическое уведомление от EZTest.
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
  const actionType = data.type === 'login' ? 'Вход' : 'Регистрация';
  const subject = `🔐 OTP-код EZTest для ${actionType}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; font-size: 18px; margin: 0;">🔐 Подтверждение: ${actionType}</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Вы запросили код подтверждения для ${data.type === 'login' ? 'входа в' : 'регистрации в'} аккаунте EZTest.
        </p>

        <div style="background-color: #f3f4f6; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
          <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
            Ваш OTP-код
          </p>
          <div style="font-size: 36px; font-weight: bold; color: #033977; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${data.otp}
          </div>
          <p style="color: #ef4444; font-size: 13px; margin: 15px 0 0 0;">
            ⏰ Действителен 10 минут
          </p>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>Уведомление безопасности:</strong> Никому не сообщайте этот OTP-код. EZTest никогда не запрашивает OTP по телефону или email.
          </p>
        </div>

        <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 20px 0 0 0;">
          Если вы не запрашивали этот код, проигнорируйте письмо. Ваш аккаунт остается защищенным.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Это автоматическое уведомление от EZTest. Пожалуйста, не отвечайте на это письмо.
        </p>
      </div>
    </div>
  `;

  const text = `
Подтверждение: ${actionType}

Вы запросили код подтверждения для ${data.type === 'login' ? 'входа в' : 'регистрации в'} аккаунте EZTest.

Ваш OTP-код: ${data.otp}

Действителен 10 минут

Уведомление безопасности: Никому не сообщайте этот OTP-код. EZTest никогда не запрашивает OTP по телефону или email.

Если вы не запрашивали этот код, проигнорируйте письмо. Ваш аккаунт остается защищенным.

---
Это автоматическое уведомление от EZTest.
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
  const subject = `👋 Добро пожаловать в EZTest — аккаунт готов`;
  const loginUrl = `${data.appUrl}/auth/login`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #047857; font-size: 18px; margin: 0;">👋 Добро пожаловать в EZTest!</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Здравствуйте, <strong>${data.invitedUser.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Ваш аккаунт EZTest создан пользователем <strong>${data.invitedByUser.name}</strong>. Все готово для совместной работы в системе тест-менеджмента!
        </p>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <p style="color: #92400e; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Ваши данные для входа</strong>
          </p>
          <div style="background-color: white; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 13px;">
            <p style="margin: 0 0 8px 0; color: #1f2937;"><strong>Email:</strong> <span style="color: #033977;">${data.invitedUser.email}</span></p>
            <p style="margin: 0; color: #1f2937;"><strong>Временный пароль:</strong> <span style="color: #033977;">${data.tempPassword}</span></p>
          </div>
          <p style="color: #92400e; font-size: 12px; margin: 10px 0 0 0;">
            ⚠️ <strong>Важно:</strong> Пожалуйста, смените пароль после первого входа в целях безопасности.
          </p>
        </div>

        <h3 style="color: #1f2937; font-size: 14px; margin: 0 0 12px 0;">Как начать:</h3>
        <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
          <li>Нажмите кнопку входа ниже</li>
          <li>Введите ваш email и временный пароль</li>
          <li>Смените пароль на надежный</li>
          <li>Начните работу с вашими проектами и тест-кейсами</li>
        </ol>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${loginUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Войти в EZTest
            </a>
          </div>
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #4b5563; font-size: 13px; margin: 0;">
            <strong>Вопросы?</strong> Свяжитесь с <strong>${data.invitedByUser.name}</strong> по адресу <strong>${data.invitedByUser.email}</strong>
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Это автоматическое уведомление от EZTest. Пожалуйста, не отвечайте на это письмо.
        </p>
      </div>
    </div>
  `;

  const text = `
Добро пожаловать в EZTest!

Здравствуйте, ${data.invitedUser.name},

Ваш аккаунт EZTest создан пользователем ${data.invitedByUser.name}. Все готово для совместной работы в системе тест-менеджмента!

Ваши данные для входа:
- Email: ${data.invitedUser.email}
- Временный пароль: ${data.tempPassword}

ВАЖНО: Пожалуйста, смените пароль после первого входа в целях безопасности.

Как начать:
1. Нажмите кнопку входа ниже
2. Введите ваш email и временный пароль
3. Смените пароль на надежный
4. Начните работу с вашими проектами и тест-кейсами

Войти в EZTest: ${loginUrl}

Вопросы? Свяжитесь с ${data.invitedByUser.name} по адресу ${data.invitedByUser.email}

---
Это автоматическое уведомление от EZTest.
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
  const subject = `🔄 Ваш аккаунт EZTest обновлен`;
  const profileUrl = `${data.appUrl}/profile`;

  const changesHtml = data.changes.map(change => 
    `<li style="color: #4b5563; font-size: 14px; margin: 5px 0;">${change}</li>`
  ).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #1e40af; font-size: 18px; margin: 0;">🔄 Уведомление об обновлении аккаунта</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Здравствуйте, <strong>${data.user.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Ваш аккаунт EZTest обновлен пользователем <strong>${data.updatedByUser.name}</strong> (администратор).
        </p>

        <div style="background-color: #f3f4f6; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
          <p style="color: #1f2937; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Внесенные изменения:</strong>
          </p>
          <ul style="margin: 0; padding-left: 20px;">
            ${changesHtml}
          </ul>
        </div>

        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
          Вы можете проверить обновленные данные профиля, войдя в свой аккаунт.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 1px; background: linear-gradient(to right, #748ed3, #748ed3, #2c4892); border-radius: 50px;">
            <a href="${profileUrl}" style="background: linear-gradient(to bottom right, #293b64, #1e2c4e); color: white; padding: 10px 28px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: 600; font-size: 14px;">
              Открыть профиль
            </a>
          </div>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>Уведомление безопасности:</strong> Если вы не ожидали этих изменений, немедленно свяжитесь с администратором по адресу <strong>${data.updatedByUser.email}</strong>
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Это автоматическое уведомление от EZTest. Пожалуйста, не отвечайте на это письмо.
        </p>
      </div>
    </div>
  `;

  const changesText = data.changes.map(change => `  - ${change}`).join('\n');

  const text = `
Уведомление об обновлении аккаунта

Здравствуйте, ${data.user.name},

Ваш аккаунт EZTest обновлен пользователем ${data.updatedByUser.name} (администратор).

Внесенные изменения:
${changesText}

Вы можете проверить обновленные данные профиля, войдя в свой аккаунт.

Открыть профиль: ${profileUrl}

Уведомление безопасности: Если вы не ожидали этих изменений, немедленно свяжитесь с администратором по адресу ${data.updatedByUser.email}

---
Это автоматическое уведомление от EZTest.
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
  const subject = `❌ Ваш аккаунт EZTest деактивирован`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 8px;">
      <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #033977; margin: 0; font-size: 28px;">EZTest</h1>
          <p style="color: #656c79; margin: 5px 0 0 0; font-size: 14px;">Self-hosted платформа управления тестированием</p>
        </div>

        <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
          <h2 style="color: #991b1b; font-size: 18px; margin: 0;">❌ Уведомление о деактивации аккаунта</h2>
        </div>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 10px 0;">
          Здравствуйте, <strong>${data.user.name}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Ваш аккаунт EZTest деактивирован пользователем <strong>${data.deletedByUser.name}</strong> (администратор).
        </p>

        <div style="background-color: #f3f4f6; border-radius: 4px; padding: 15px; margin-bottom: 20px;">
          <p style="color: #1f2937; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Что это значит:</strong>
          </p>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="color: #4b5563; font-size: 14px; margin: 5px 0;">У вас больше не будет доступа к платформе EZTest</li>
            <li style="color: #4b5563; font-size: 14px; margin: 5px 0;">Данные вашего аккаунта архивированы</li>
            <li style="color: #4b5563; font-size: 14px; margin: 5px 0;">Вы больше не сможете войти с текущими учетными данными</li>
          </ul>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            <strong>Вопросы или сомнения?</strong> Если вы считаете, что это ошибка, свяжитесь с администратором по адресу <strong>${data.deletedByUser.email}</strong>
          </p>
        </div>

        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #4b5563; font-size: 13px; margin: 0;">
            <strong>Данные аккаунта:</strong><br>
            Email: <strong>${data.user.email}</strong><br>
            Дата деактивации: <strong>${new Date().toLocaleDateString()}</strong>
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Это автоматическое уведомление от EZTest. Пожалуйста, не отвечайте на это письмо.
        </p>
      </div>
    </div>
  `;

  const text = `
Уведомление о деактивации аккаунта

Здравствуйте, ${data.user.name},

Ваш аккаунт EZTest деактивирован пользователем ${data.deletedByUser.name} (администратор).

Что это значит:
  - У вас больше не будет доступа к платформе EZTest
  - Данные вашего аккаунта архивированы
  - Вы больше не сможете войти с текущими учетными данными

Вопросы или сомнения? Если вы считаете, что это ошибка, свяжитесь с администратором по адресу ${data.deletedByUser.email}

Данные аккаунта:
Email: ${data.user.email}
Дата деактивации: ${new Date().toLocaleDateString()}

---
Это автоматическое уведомление от EZTest.
  `;

  return sendEmail({
    to: data.user.email,
    subject,
    html,
    text,
  });
}
