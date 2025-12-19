# File Attachments

Complete guide to managing file attachments in EZTest.

## Overview

EZTest supports file attachments for:

- Test Cases
- Test Steps
- Test Results
- Defects
- Comments

Features include:
- **Direct S3 Upload** - Fast, presigned URL uploads
- **Large Files** - Support up to 500MB
- **Multi-part Upload** - Reliable large file handling
- **Preview** - Image thumbnails and previews
- **Download** - Original filename preservation

---

## Table of Contents

- [Uploading Files](#uploading-files)
- [Supported Contexts](#supported-contexts)
- [File Management](#file-management)
- [S3 Configuration](#s3-configuration)
- [Best Practices](#best-practices)

---

## <a id="uploading-files"></a>Uploading Files

### Quick Upload

1. Click the **📎 Attach** button
2. Select file(s) from your computer
3. Wait for upload to complete
4. File appears in attachments list

### Drag and Drop

1. Drag file(s) from your computer
2. Drop onto the attachment area
3. Upload starts automatically

### Upload Progress

During upload:
- Progress bar shows percentage
- Cancel button to abort
- Error messages if upload fails

### File Size Limits

| File Size | Upload Method |
|-----------|---------------|
| < 5 MB | Single request |
| 5 MB - 500 MB | Multi-part upload |
| > 500 MB | Not supported |

---

## <a id="supported-contexts"></a>Supported Contexts

### Test Case Attachments

Attach files to test case fields:
- **Description** - Overall test documentation
- **Expected Result** - Expected outcome evidence
- **Preconditions** - Setup documentation
- **Postconditions** - Cleanup documentation

### Test Step Attachments

Each test step can have attachments:
- Screenshots of UI state
- Test data files
- Expected output samples

### Test Result Attachments

When recording results, attach:
- Screenshots of actual results
- Error logs
- Console output
- Video recordings

### Defect Attachments

Attach evidence to defects:
- Screenshots showing the bug
- Log files
- Network traces
- Video reproduction

### Comment Attachments

Attach files in comments:
- Additional screenshots
- Documents
- Analysis results

---

## <a id="file-management"></a>File Management

### Viewing Attachments

Click attachment to:
- **Images** - View in lightbox
- **Documents** - Download
- **Other** - Download

### Downloading Files

1. Click the attachment
2. Or click the **↓ Download** icon
3. File downloads with original filename

### Deleting Attachments

1. Hover over attachment
2. Click **🗑️ Delete** icon
3. Confirm deletion

> ⚠️ **Note:** Deleted files cannot be recovered.

### Supported File Types

| Category | Extensions |
|----------|------------|
| **Images** | jpg, jpeg, png, gif, webp, svg |
| **Documents** | pdf, doc, docx, xls, xlsx, txt |

---

## <a id="s3-configuration"></a>S3 Configuration

### Environment Variables

```env
# AWS Credentials
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# S3 Settings
AWS_REGION=us-east-1
AWS_S3_BUCKET=eztest-attachments
```

### IAM Policy

Minimum permissions required:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::eztest-attachments/*"
    }
  ]
}
```

### CORS Configuration

Required for browser uploads:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://your-eztest-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### S3 Bucket Setup

1. **Create S3 bucket**
   ```bash
   aws s3 mb s3://eztest-attachments
   ```

2. **Configure CORS**
   ```bash
   aws s3api put-bucket-cors \
     --bucket eztest-attachments \
     --cors-configuration file://cors.json
   ```

3. **Set bucket policy** (optional, for private access)
   ```bash
   aws s3api put-bucket-policy \
     --bucket eztest-attachments \
     --policy file://policy.json
   ```

### Alternative Storage (S3-Compatible)

**MinIO:**
```env
AWS_S3_ENDPOINT=http://localhost:9000
AWS_S3_BUCKET=eztest
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
```

**DigitalOcean Spaces:**
```env
AWS_S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
AWS_REGION=nyc3
AWS_S3_BUCKET=your-space-name
```

---

## <a id="best-practices"></a>Best Practices

### File Naming

| ✅ Good | ❌ Avoid |
|---------|---------|
| `login-error-screenshot.png` | `IMG_12345.png` |
| `api-response-log.txt` | `log.txt` |
| `payment-flow-video.mp4` | `video.mp4` |

### When to Attach

| Situation | Attachment |
|-----------|------------|
| Failed test | Screenshot + logs |
| UI defect | Screenshot or video |
| Data issue | CSV/JSON sample |
| API error | Request/response log |
| Complex steps | Step-by-step screenshots |

### File Organization

1. **Be descriptive** - Use meaningful filenames
2. **One purpose** - Each attachment should be relevant
3. **Clean up** - Remove outdated attachments
4. **Compress** - Use zip for multiple files

### Performance Tips

1. **Optimize images** - Compress before upload
2. **Crop screenshots** - Show only relevant area
3. **Use video sparingly** - Large files slow down pages
4. **Archive old runs** - Reduce storage usage

### Security Considerations

1. **Sanitize uploads** - Don't upload sensitive data
2. **Access control** - Attachments inherit parent permissions
3. **Audit** - Track who uploads what
4. **Backup** - S3 versioning for recovery

---

## Troubleshooting

### Upload Fails

| Error | Solution |
|-------|----------|
| "File too large" | Compress or use smaller file |
| "Network error" | Check internet connection |
| "Permission denied" | Check S3 credentials |
| "Timeout" | Try smaller file or retry |

### Files Not Displaying

| Issue | Solution |
|-------|----------|
| Image not showing | Check CORS configuration |
| 403 error | Verify S3 permissions |
| Broken link | Check if file was deleted |

---

## API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/attachments/upload` | Initiate upload |
| `POST` | `/api/attachments/upload/part` | Upload part |
| `POST` | `/api/attachments/upload/complete` | Complete upload |
| `POST` | `/api/attachments/upload/abort` | Abort upload |
| `GET` | `/api/attachments/:id` | Get attachment |
| `DELETE` | `/api/attachments/:id` | Delete attachment |

---

## Related Documentation

- [Test Cases](../test-cases/README.md)
- [Defects](../defects/README.md)
- [Configuration](../../getting-started/configuration.md)
