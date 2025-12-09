import { prisma } from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/email-service';
import { isEmailServiceAvailable } from '@/lib/email-service';

interface SendOtpInput {
  email: string;
  type: 'login' | 'register';
  appUrl: string;
}

interface VerifyOtpInput {
  email: string;
  otp: string;
  type: 'login' | 'register';
}

export class OtpService {
  /**
   * Generate a random 6-digit OTP
   */
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to email
   * Creates a new OTP record and sends email
   */
  async sendOtp(input: SendOtpInput): Promise<{ success: boolean; message: string }> {
    const { email, type, appUrl } = input;

    // Check if email service is available
    const isAvailable = await isEmailServiceAvailable();
    if (!isAvailable) {
      return {
        success: false,
        message: 'Email service is not configured. Please contact administrator.',
      };
    }

    try {
      // Clean up expired OTPs for this email
      await this.cleanupExpiredOtps(email);

      // Check if there's a recent OTP (rate limiting - 1 OTP per minute)
      const recentOtp = await prisma.otpVerification.findFirst({
        where: {
          email: email.toLowerCase(),
          type,
          createdAt: {
            gte: new Date(Date.now() - 60 * 1000), // Last 1 minute
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentOtp) {
        return {
          success: false,
          message: 'Please wait before requesting a new OTP. Try again in 1 minute.',
        };
      }

      // Generate new OTP
      const otp = this.generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to database
      await prisma.otpVerification.create({
        data: {
          email: email.toLowerCase(),
          otp,
          type,
          expiresAt,
        },
      });

      // Send OTP email
      const emailSent = await sendOtpEmail({
        email: email.toLowerCase(),
        otp,
        type,
        appUrl,
      });

      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send OTP email. Please try again.',
        };
      }

      return {
        success: true,
        message: `OTP sent successfully to ${email}`,
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
      };
    }
  }

  /**
   * Verify OTP
   * Checks if OTP is valid and not expired
   */
  async verifyOtp(input: VerifyOtpInput): Promise<{ success: boolean; message: string }> {
    const { email, otp, type } = input;

    try {
      // Find the most recent unverified OTP for this email
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          email: email.toLowerCase(),
          type,
          verified: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) {
        return {
          success: false,
          message: 'No OTP found. Please request a new one.',
        };
      }

      // Check if OTP has expired
      if (new Date() > otpRecord.expiresAt) {
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.',
        };
      }

      // Check if too many attempts (max 5)
      if (otpRecord.attempts >= 5) {
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.',
        };
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        // Increment attempts
        await prisma.otpVerification.update({
          where: { id: otpRecord.id },
          data: { attempts: otpRecord.attempts + 1 },
        });

        const remainingAttempts = 5 - (otpRecord.attempts + 1);
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        };
      }

      // Mark OTP as verified
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });

      return {
        success: true,
        message: 'OTP verified successfully',
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
      };
    }
  }

  /**
   * Check if email has been verified with OTP
   */
  async isEmailVerified(email: string, type: 'login' | 'register'): Promise<boolean> {
    try {
      const verifiedOtp = await prisma.otpVerification.findFirst({
        where: {
          email: email.toLowerCase(),
          type,
          verified: true,
          createdAt: {
            gte: new Date(Date.now() - 15 * 60 * 1000), // Last 15 minutes
          },
        },
      });

      return !!verifiedOtp;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  }

  /**
   * Clean up expired OTPs for an email
   */
  private async cleanupExpiredOtps(email: string): Promise<void> {
    try {
      await prisma.otpVerification.deleteMany({
        where: {
          email: email.toLowerCase(),
          OR: [
            { expiresAt: { lt: new Date() } }, // Expired
            { verified: true }, // Already verified
          ],
        },
      });
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }

  /**
   * Delete all OTPs for an email (used after successful login/register)
   */
  async clearEmailOtps(email: string): Promise<void> {
    try {
      await prisma.otpVerification.deleteMany({
        where: { email: email.toLowerCase() },
      });
    } catch (error) {
      console.error('Error clearing email OTPs:', error);
    }
  }
}

export const otpService = new OtpService();
