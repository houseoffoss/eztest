import { NextResponse } from 'next/server';

/**
 * GET /api/config/features
 * Returns feature flags that can be checked at runtime
 * Reads directly from environment variables (works in Docker)
 */
export async function GET() {
  try {
    // Read directly from process.env to get the latest value
    const enableAttachments = process.env.ENABLE_ATTACHMENTS === 'true';
    
    return NextResponse.json({
      enableAttachments,
    });
  } catch (error) {
    console.error('Error fetching feature config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature config' },
      { status: 500 }
    );
  }
}
