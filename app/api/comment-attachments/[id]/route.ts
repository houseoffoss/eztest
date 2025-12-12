import { commentController } from '@/backend/controllers/comment/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    return commentController.getCommentAttachmentDownloadUrl(request, id);
  },
  'defects',
  'read'
);

export const DELETE = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const step = searchParams.get('step');
    return commentController.deleteCommentAttachment(request, id, step);
  },
  'defects',
  'read'
);
