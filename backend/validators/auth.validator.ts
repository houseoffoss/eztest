import { z } from 'zod';
import { getDefaultAdminEmail } from '@/lib/auth-utils';

/**
 * Custom email validation that allows default admin email from environment
 */
const emailValidation = z
  .string()
  .toLowerCase()
  .trim()
  .refine(
    (email) => {
      // Allow default admin email from environment (even if it has invalid domains like .local)
      const defaultAdminEmail = getDefaultAdminEmail().toLowerCase().trim();
      if (email === defaultAdminEmail) {
        return true;
      }
      
      // Standard email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return false;
      }
      
      // Check for invalid domains like .local, .invalid, .test, .example
      const invalidDomains = ['.local', '.invalid', '.test', '.example', '.localhost'];
      for (const domain of invalidDomains) {
        if (email.endsWith(domain)) {
          return false;
        }
      }
      
      return true;
    },
    {
      message: 'Invalid email format. Email addresses with .local, .invalid, .test, .example domains are not allowed (except default admin email).',
    }
  );

/**
 * User Registration Schema
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters')
    .trim(),
  email: emailValidation,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters'),
});

/**
 * Change Password Schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'New password must not exceed 100 characters'),
});

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  email: emailValidation,
});

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters'),
});
