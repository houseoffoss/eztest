import { attachmentController } from '@/backend/controllers/attachment/controller';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * DELETE /api/attachments/upload/abort
 * Abort an in-progress multipart upload
 * Purpose: Cancel S3 multipart upload and free resources if user cancels upload
 * Query params: uploadId, fileKey
 * NOTE: Should be POST not DELETE for semantic correctness (state-changing operation)
 * Returns: success message
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await attachmentController.abortUpload(request as unknown as { url: string; json: () => Promise<Record<string, unknown>> });
    return Response.json(result.data, { status: result.statusCode });
  } catch (error: unknown) {
    console.error('Error aborting upload:', error);
    const statusCode = (error as { statusCode?: number }).statusCode || 500;
    const message = error instanceof Error ? error.message : 'Failed to abort upload';
    return Response.json(
      { error: message },
      { status: statusCode }
    );
  }
}
