import { NextResponse } from 'next/server';
import { buildOpenApiDocument } from '@/lib/openapi';

/**
 * GET /api/openapi.json
 * Serves the OpenAPI 3.1 document describing the automation API.
 * Public (the contract contains no data); the endpoints it describes remain
 * protected by API-key authentication.
 */
export async function GET() {
  return NextResponse.json(buildOpenApiDocument(), {
    headers: { 'Cache-Control': 'public, max-age=300' },
  });
}
