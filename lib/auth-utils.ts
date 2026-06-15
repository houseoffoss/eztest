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
  const subject = 'Сброс пароля EZTest';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Запрос на сброс пароля</h2>
      <p>Здравствуйте, ${userName}.</p>
      <p>Мы получили запрос на сброс вашего пароля. Нажмите ссылку ниже, чтобы установить новый пароль:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #033977; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Сбросить пароль
        </a>
      </p>
      <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
      <p style="word-break: break-all; color: #666;">${resetLink}</p>
      <p style="color: #999; font-size: 12px;">
        Ссылка действует 1 час. Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">EZTest - Self-hosted платформа управления тестированием</p>
    </div>
  `;

  const text = `
Запрос на сброс пароля

Здравствуйте, ${userName}.

Мы получили запрос на сброс вашего пароля. Перейдите по ссылке ниже, чтобы установить новый пароль:

${resetLink}

Ссылка действует 1 час. Если вы не запрашивали сброс пароля, проигнорируйте это письмо.

EZTest - Self-hosted платформа управления тестированием
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