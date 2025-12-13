import { defectController } from '@/backend/controllers/defect/controller';

/**
 * GET /api/defect-attachments/[id]
 * Get defect attachment download URL with presigned access
 * Purpose: Generate time-limited presigned URL for secure file downloads
 * No permission check - presigned URLs are self-secured with time expiration
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attachmentId } = await params;
    const result = await defectController.getDefectAttachmentDownloadUrl(
      attachmentId
    );
    return Response.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return Response.json(
        { error: 'Defect attachment not found' },
        { status: 404 }
      );
    }
    return Response.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/defect-attachments/[id]
 * Delete defect attachment
 * Purpose: Generate presigned URL for S3 deletion and remove from database
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: attachmentId } = await params;
    const url = new URL(request.url);
    const step = url.searchParams.get('step');

    const result = await defectController.deleteDefectAttachment(
      attachmentId,
      step
    );
    return Response.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return Response.json(
        { error: 'Defect attachment not found' },
        { status: 404 }
      );
    }
    return Response.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}
