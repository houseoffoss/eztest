import { otpService } from '@/backend/services/otp/services';

interface SendOtpInput {
  email: string;
  type: 'login' | 'register';
}

interface VerifyOtpInput {
  email: string;
  otp: string;
  type: 'login' | 'register';
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
      console.error('Error in sendOtp controller:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
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
