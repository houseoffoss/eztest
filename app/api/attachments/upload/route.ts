import { attachmentController } from '@/backend/controllers/attachment/controller';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/attachments/upload
 * Initialize multipart upload and generate presigned URLs
 * Purpose: Start S3 multipart upload process and provide presigned URLs for chunk uploads
 * Request body: fileName, fileSize, fileType, fieldName, entityType, entityId
 * Returns: uploadId, s3Key, presignedUrls array for browser-based chunk uploads
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await attachmentController.initializeUpload(request as unknown as { url: string; json: () => Promise<Record<string, unknown>> });
    return Response.json(result.data, { status: result.statusCode });
  } catch (error: unknown) {
    console.error('Error initializing upload:', error);
    const statusCode = (error as { statusCode?: number }).statusCode || 500;
    const message = error instanceof Error ? error.message : 'Failed to initialize upload';
    return Response.json(
      { error: message },
      { status: statusCode }
    );
  }
}
