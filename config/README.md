# Configuration Files

This directory contains application configuration files.

## Files

- **`seo.config.ts`** - SEO metadata configuration for different pages
- **`cors-config.json`** - CORS configuration for S3 bucket (used during AWS S3 setup)
  - Referenced in: `docs/features/attachments/README.md`
  - Used for: Configuring S3 bucket CORS policy

## Usage

### SEO Configuration

The SEO config is imported in page components:

```typescript
import CONFIG_SEO from '@/config/seo.config';

export const metadata = {
  title: CONFIG_SEO.Projects.title,
  description: CONFIG_SEO.Projects.description,
};
```

### CORS Configuration

The CORS config is used when setting up AWS S3:

```bash
aws s3api put-bucket-cors \
  --bucket your-bucket-name \
  --cors-configuration file://config/cors-config.json
```
