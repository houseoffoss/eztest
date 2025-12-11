import { attachmentController } from '@/backend/controllers/attachment/controller';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/attachments/upload/complete
 * Complete multipart upload and save attachment metadata
 * Purpose: Finalize S3 multipart upload and persist attachment record to database
 * Request body: uploadId, s3Key, parts, fileName, fileSize, fileType, testCaseId, fieldName
 * Returns: success boolean and attachment metadata
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await attachmentController.completeUpload(request as unknown as { url: string; json: () => Promise<Record<string, unknown>> });
    return Response.json(result.data, { status: result.statusCode });
  } catch (error: unknown) {
    console.error('Error completing upload:', error);
    const statusCode = (error as { statusCode?: number }).statusCode || 500;
    const message = error instanceof Error ? error.message : 'Failed to complete upload';
    return Response.json(
      { error: message },
      { status: statusCode }
    );
  }
}

