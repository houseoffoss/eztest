import { commentController } from '@/backend/controllers/comment/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const POST = hasPermission(
  async (request, context) => {
    const { commentId } = await context.params;
    const body = await request.json();
    return commentController.createCommentAttachment(request, commentId, body);
  },
  'defects',
  'read'
);

export const GET = hasPermission(
  async (request, context) => {
    const { commentId } = await context.params;
    return commentController.getCommentAttachments(request, commentId);
  },
  'defects',
  'read'
);
