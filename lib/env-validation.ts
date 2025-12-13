/**
 * Environment Configuration Validation
 * Ensures all required environment variables are set on application startup
 */

export interface ValidatedEnv {
  databaseUrl: string;
  nextAuthSecret: string;
  nextAuthUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
  appUrl: string;
  maxFileSize: number;
  uploadDir: string;
  debug: boolean;
  enableAttachments: boolean;
}

/**
 * Validate and return environment variables
 * Throws error if required variables are missing
 */
export function validateEnv(): ValidatedEnv {
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'] as const;
  const missing: string[] = [];

  for (const variable of required) {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  }

  if (missing.length > 0) {
    const errorMessage = `
❌ Missing Required Environment Variables:
${missing.map((v) => `   - ${v}`).join('\n')}

📝 To fix this, create a .env file in your project root:
   cp .env.example .env

⚙️  Edit .env and set the missing variables:
   ${missing.join(', ')}

For development, you can use:
   NEXTAUTH_SECRET=dev-secret-key-not-secure
   NEXTAUTH_URL=http://localhost:3000

For production, generate a secure secret:
   openssl rand -base64 32
    `;
    throw new Error(errorMessage);
  }

  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

  return {
    databaseUrl: process.env.DATABASE_URL!,
    nextAuthSecret: process.env.NEXTAUTH_SECRET!,
    nextAuthUrl: process.env.NEXTAUTH_URL!,
    nodeEnv,
    appUrl: process.env.APP_URL || process.env.NEXTAUTH_URL!,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    debug: process.env.DEBUG === 'true',
    enableAttachments: process.env.ENABLE_ATTACHMENTS === 'true', // Default to false if not set
  };
}

/**
 * Environment configuration singleton
 * Validate once and reuse throughout the application
 */
let cachedEnv: ValidatedEnv | null = null;

export function getEnv(): ValidatedEnv {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * For development/debugging: log environment status
 * Never log actual secret values!
 */
export function logEnvStatus() {
  const env = getEnv();
  console.log('✅ Environment Status:');
  console.log(`   Node Environment: ${env.nodeEnv}`);
  console.log(`   Database: ${env.databaseUrl.split('@')[1] ? '✓ Connected' : '✗ URL configured'}`);
  console.log(`   NextAuth Secret: ${env.nextAuthSecret ? '✓ Configured' : '✗ Missing'}`);
  console.log(`   NextAuth URL: ${env.nextAuthUrl}`);
  console.log(`   Debug Mode: ${env.debug ? 'Enabled' : 'Disabled'}`);
}
