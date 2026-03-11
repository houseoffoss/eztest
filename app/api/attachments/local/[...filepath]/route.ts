import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * GET /api/attachments/local/[...filepath]
 * Serve locally stored attachment files
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ filepath: string[] }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { filepath } = await context.params;
    const relativePath = filepath.join('/');

    // Security: prevent path traversal
    if (relativePath.includes('..') || relativePath.includes('~')) {
      return new Response('Invalid path', { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'uploads', relativePath);

    if (!existsSync(filePath)) {
      return new Response('File not found', { status: 404 });
    }

    const buffer = await readFile(filePath);

    // Determine content type from extension
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4', '.webm': 'video/webm', '.ogg': 'video/ogg',
      '.mov': 'video/quicktime', '.avi': 'video/x-msvideo',
      '.pdf': 'application/pdf', '.txt': 'text/plain', '.csv': 'text/csv',
      '.doc': 'application/msword', '.zip': 'application/zip',
    };
    const contentType = contentTypes[ext] || 'application/octet-stream';

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Local file serve error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
