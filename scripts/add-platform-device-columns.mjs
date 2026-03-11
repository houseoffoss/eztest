/**
 * Migration script: Add platform and device columns to TestRun table.
 * Run with: node scripts/add-platform-device-columns.mjs
 */
import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read DATABASE_URL from .env file
let databaseUrl;
try {
  const envContent = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
  const match = envContent.match(/DATABASE_URL="([^"]+)"/);
  if (match) {
    databaseUrl = match[1];
  }
} catch {
  // fallback
}

if (!databaseUrl) {
  databaseUrl = process.env.DATABASE_URL;
}

if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL not found in .env or environment variables');
  process.exit(1);
}

console.log('Connecting to database...');

const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();
  console.log('Connected successfully.');

  console.log('Adding "platform" column to TestRun...');
  await client.query('ALTER TABLE "TestRun" ADD COLUMN IF NOT EXISTS "platform" TEXT');

  console.log('Adding "device" column to TestRun...');
  await client.query('ALTER TABLE "TestRun" ADD COLUMN IF NOT EXISTS "device" TEXT');

  console.log('✓ Migration completed successfully! "platform" and "device" columns added to TestRun table.');
} catch (error) {
  console.error('ERROR:', error.message);
  process.exit(1);
} finally {
  await client.end();
}
