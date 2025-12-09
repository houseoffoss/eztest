import { emailController } from '@/backend/controllers/email/controller';
import { baseInterceptor } from '@/backend/utils/baseInterceptor';

/**
 * GET /api/email/status
 * Check if email service is configured and available
 * Public endpoint - no authentication required
 */
export const GET = baseInterceptor(
  async () => {
    return emailController.getEmailServiceStatus();
  }
);
