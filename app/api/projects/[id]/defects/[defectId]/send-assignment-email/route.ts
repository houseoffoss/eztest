import { emailController } from '@/backend/controllers/email/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * POST /api/projects/[id]/defects/[defectId]/send-assignment-email
 * Send assignment notification email to the assignee
 * Required permission: defects:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { defectId } = await context.params;
    const body = await request.json();
    return emailController.sendDefectAssignmentEmail(request, defectId, body);
  },
  'defects',
  'update'
);

