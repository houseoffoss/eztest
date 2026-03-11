import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/attachments/upload-local
 * Local file upload fallback when S3 is not configured
 * Saves files to the local filesystem under uploads/ directory
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fieldName = formData.get('fieldName') as string || 'attachment';
    const entityType = formData.get('entityType') as string || 'defect';
    const projectId = formData.get('projectId') as string || '';

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${timestamp}_${randomHash}_${sanitizedName}`;

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'uploads', entityType, projectId || 'general');
    await mkdir(uploadDir, { recursive: true });

    // Save file to disk
    const filePath = path.join(uploadDir, uniqueFilename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const relativePath = `${entityType}/${projectId || 'general'}/${uniqueFilename}`;

    // Persist metadata so the file can be associated later (e.g., defect creation)
    const attachmentRecord = await prisma.attachment.create({
      data: {
        filename: relativePath,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: relativePath,
        fieldName,
      },
    });

    // Return attachment info
    const attachment = {
      id: attachmentRecord.id,
      filename: attachmentRecord.filename,
      originalName: attachmentRecord.originalName,
      size: attachmentRecord.size,
      mimeType: attachmentRecord.mimeType,
      uploadedAt: attachmentRecord.uploadedAt.toISOString(),
      fieldName,
      entityType,
      path: attachmentRecord.path,
    };

    return Response.json({ success: true, attachment }, { status: 200 });
  } catch (error) {
    console.error('Local upload error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}
