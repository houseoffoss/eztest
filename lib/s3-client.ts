import { S3Client } from '@aws-sdk/client-s3';

// Lazy initialization - only fails when S3 is actually used
let s3ClientInstance: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    if (!process.env.AWS_REGION) {
      throw new Error('AWS_REGION environment variable is not set');
    }
    if (!process.env.AWS_ACCESS_KEY_ID) {
      throw new Error('AWS_ACCESS_KEY_ID environment variable is not set');
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS_SECRET_ACCESS_KEY environment variable is not set');
    }
    if (!process.env.AWS_S3_BUCKET) {
      throw new Error('AWS_S3_BUCKET environment variable is not set');
    }

    s3ClientInstance = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3ClientInstance;
}

// Backward compatibility - lazy getter
export const s3Client = new Proxy({} as S3Client, {
  get(target, prop) {
    return getS3Client()[prop as keyof S3Client];
  },
});

export function getS3Bucket(): string {
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error('AWS_S3_BUCKET environment variable is not set');
  }
  return process.env.AWS_S3_BUCKET;
}

export const S3_BUCKET = process.env.AWS_S3_BUCKET || '';
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const CHUNK_SIZE = parseInt(process.env.S3_CHUNK_SIZE || '10485760'); // 10MB chunks (configurable)
