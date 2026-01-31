import { otpService } from '@/backend/services/otp/services';
import { getDefaultAdminEmail } from '@/lib/auth-utils';

interface SendOtpInput {
  email: string;
  type: 'login' | 'register';
  password?: string; // Optional password for login verification
}

interface VerifyOtpInput {
  email: string;
  otp: string;
  type: 'login' | 'register';
}

/**
 * Validate email format (allows default admin email from environment)
 */
function isValidEmailForOtp(email: string): boolean {
  // Allow default admin email from environment (even if it has invalid domains like .local)
  const defaultAdminEmail = getDefaultAdminEmail().toLowerCase().trim();
  if (email.toLowerCase().trim() === defaultAdminEmail) {
    return true;
  }
  
  // Standard email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

export class OtpController {
  /**
   * POST /api/auth/otp/send - Send OTP to email
   */
  async sendOtp(request: Request) {
    try {
      const body = (await request.json()) as SendOtpInput;
      const { email, type } = body;

      if (!email || !type) {
        return {
          success: false,
          message: 'Email and type are required',
        };
      }

      // Validate email format (allows default admin email from environment)
      if (!isValidEmailForOtp(email)) {
        return {
          success: false,
          message: 'Invalid email format. Email addresses with .local, .invalid, .test, .example domains are not allowed (except default admin email).',
        };
      }

      if (!['login', 'register'].includes(type)) {
        return {
          success: false,
          message: 'Invalid type. Must be "login" or "register"',
        };
      }

      const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';

      const result = await otpService.sendOtp({
        email: email.toLowerCase().trim(),
        type,
        appUrl,
        password: body.password, // Pass password for login verification
      });

      return result;
    } catch (error) {
      console.error('Error in sendOtp controller:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      return {
        success: false,
        message: `Failed to send OTP. Please try again. (${errorMessage})`,
      };
    }
  }

  /**
   * POST /api/auth/otp/verify - Verify OTP
   */
  async verifyOtp(request: Request) {
    try {
      const body = (await request.json()) as VerifyOtpInput;
      const { email, otp, type } = body;

      if (!email || !otp || !type) {
        return {
          success: false,
          message: 'Email, OTP, and type are required',
        };
      }

      // Validate email format (allows default admin email from environment)
      if (!isValidEmailForOtp(email)) {
        return {
          success: false,
          message: 'Invalid email format. Email addresses with .local, .invalid, .test, .example domains are not allowed (except default admin email).',
        };
      }

      if (!['login', 'register'].includes(type)) {
        return {
          success: false,
          message: 'Invalid type. Must be "login" or "register"',
        };
      }

      if (!/^\d{6}$/.test(otp)) {
        return {
          success: false,
          message: 'Invalid OTP format. Must be 6 digits.',
        };
      }

      const result = await otpService.verifyOtp({
        email: email.toLowerCase().trim(),
        otp,
        type,
      });

      return result;
    } catch (error) {
      console.error('Error in verifyOtp controller:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
      };
    }
  }

  /**
   * POST /api/auth/otp/resend - Resend OTP to email
   */
  async resendOtp(request: Request) {
    try {
      const body = (await request.json()) as SendOtpInput;
      const { email, type } = body;

      if (!email || !type) {
        return {
          success: false,
          message: 'Email and type are required',
        };
      }

      // Validate email format (allows default admin email from environment)
      if (!isValidEmailForOtp(email)) {
        return {
          success: false,
          message: 'Invalid email format. Email addresses with .local, .invalid, .test, .example domains are not allowed (except default admin email).',
        };
      }

      if (!['login', 'register'].includes(type)) {
        return {
          success: false,
          message: 'Invalid type. Must be "login" or "register"',
        };
      }

      const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';

      const result = await otpService.sendOtp({
        email: email.toLowerCase().trim(),
        type,
        appUrl,
      });

      return result;
    } catch (error) {
      console.error('Error in resendOtp controller:', error);
      return {
        success: false,
        message: 'Failed to resend OTP. Please try again.',
      };
    }
  }
}

export const otpController = new OtpController();
