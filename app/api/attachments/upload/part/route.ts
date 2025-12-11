import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UploadPartCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET } from '@/lib/s3-client';

/**
 * PUT /api/attachments/upload/part - Upload a single part via backend
 * 
 * ⚠️ FALLBACK ROUTE - NOT CURRENTLY USED
 * 
 * This route provides an alternative upload method where chunks are sent through
 * the backend server instead of directly to S3 using presigned URLs.
 * 
 * Current Implementation: Uses presigned URLs (lib/s3/upload-utils.ts)
 * - Chunks upload directly from browser to S3
 * - Faster, more scalable, lower bandwidth costs
 * 
 * When to use this fallback:
 * - Corporate networks that block S3 URLs
 * - Environments where presigned URLs are restricted
 * - CORS issues that can't be resolved
 * - Testing/debugging upload issues
 * 
 * To enable: Modify upload-utils.ts to POST chunks to this endpoint instead
 * of using presigned URLs.
 * 
 * Trade-offs:
 * ✅ Works in restricted networks
 * ✅ No CORS configuration needed
 * ❌ Slower (data passes through backend)
 * ❌ Higher bandwidth costs
 * ❌ Backend memory/CPU overhead
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('uploadId');
    const fileKey = searchParams.get('fileKey');
    const partNumber = searchParams.get('partNumber');

    if (!uploadId || !fileKey || !partNumber) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the chunk data from request body
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the part
    const uploadPartResponse = await s3Client.send(
      new UploadPartCommand({
        Bucket: S3_BUCKET,
        Key: fileKey,
        UploadId: uploadId,
        PartNumber: parseInt(partNumber),
        Body: buffer,
      })
    );

    return NextResponse.json({
      etag: uploadPartResponse.ETag,
      partNumber: parseInt(partNumber),
    });
  } catch (error) {
    console.error('Error uploading part:', error);
    return NextResponse.json(
      { error: 'Failed to upload part' },
      { status: 500 }
    );
  }
}
