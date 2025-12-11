# S3 Client Utilities

Reusable functions for direct browser-to-S3 file uploads using presigned URLs.

## Overview

These utilities handle all S3 operations for the attachment system:
- File validation (size, type)
- Chunked multipart uploads (10MB chunks)
- Retry logic (3 attempts with exponential backoff)
- Download/preview via presigned URLs
- Delete operations via presigned URLs
- Attachment linking to entities

## Import

```typescript
import { uploadFileToS3, deleteFile, type Attachment } from '@/lib/s3';
```

## API Reference

### Types

#### `Attachment`
```typescript
interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}
```

#### `UploadOptions`
```typescript
interface UploadOptions {
  file: File;
  fieldName: string;
  entityId?: string;
  onProgress?: (progress: number) => void;
}
```

#### `UploadResult`
```typescript
interface UploadResult {
  success: boolean;
  attachment?: Attachment;
  error?: string;
}
```

### Constants

- `MAX_FILE_SIZE`: 500 MB
- `CHUNK_SIZE`: 10 MB

### Functions

#### `validateFile(file: File)`

Validates a file before upload.

```typescript
const validation = validateFile(file);
if (!validation.valid) {
  console.error(validation.error);
  return;
}
```

**Returns:** `{ valid: boolean; error?: string }`

**Validation Rules:**
- Max size: 500 MB
- Video files: Blocked
- All other file types: Allowed

---

#### `uploadFileToS3(options: UploadOptions)`

Uploads a file directly to S3 using chunked multipart upload.

```typescript
const result = await uploadFileToS3({
  file,
  fieldName: 'description',
  entityId: 'clx123...',
  onProgress: (progress) => console.log(`${progress}%`),
});

if (result.success) {
  console.log('Uploaded:', result.attachment);
} else {
  console.error(result.error);
}
```

**Features:**
- Uploads in 10MB chunks
- Real-time progress tracking
- Automatic retry (3 attempts)
- Automatic abort on failure

**Returns:** `Promise<UploadResult>`

---

#### `abortUpload(uploadId: string, s3Key: string)`

Aborts a failed multipart upload.

```typescript
await abortUpload(uploadId, s3Key);
```

**Note:** Usually called automatically by `uploadFileToS3` on failure.

**Returns:** `Promise<void>`

---

#### `getFileUrl(attachmentId: string)`

Gets a presigned URL for downloading or previewing a file.

```typescript
const { url, isPreviewable } = await getFileUrl('clx123...');
console.log('File URL:', url);
console.log('Can preview:', isPreviewable); // true for images/PDFs
```

**Returns:** `Promise<{ url: string; isPreviewable?: boolean }>`

---

#### `downloadFile(attachmentId: string)`

Opens a file in a new tab (preview or download).

```typescript
await downloadFile('clx123...');
```

**Behavior:**
- **Images/PDFs**: Opens inline preview
- **Other files**: Triggers download

**Returns:** `Promise<void>`

---

#### `deleteFile(attachmentId: string)`

Deletes a file from S3 and database using presigned URLs.

```typescript
try {
  await deleteFile('clx123...');
  console.log('File deleted successfully');
} catch (error) {
  console.error('Delete failed:', error);
}
```

**Process:**
1. Get presigned DELETE URL from backend
2. Delete directly from S3
3. Confirm deletion in database

**Returns:** `Promise<void>`

---

#### `linkAttachment(attachmentId, entityType, entityId)`

Links an attachment to an entity after creation.

```typescript
await linkAttachment(
  'clx123...', 
  'testCaseId', 
  'clx456...'
);
```

**Entity Types:**
- `testCaseId`
- `defectId`
- `commentId`
- `testResultId`

**Returns:** `Promise<void>`

---

#### `linkAttachments(attachments, entityType, entityId)`

Links multiple attachments to an entity.

```typescript
await linkAttachments(
  [attachment1, attachment2],
  'defectId',
  'clx789...'
);
```

**Returns:** `Promise<void>`

---

#### `formatFileSize(bytes: number)`

Formats file size for display.

```typescript
formatFileSize(52428800); // "50 MB"
formatFileSize(1024);     // "1 KB"
formatFileSize(500);      // "500 Bytes"
```

**Returns:** `string`

---

#### `getFileIconType(mimeType: string)`

Determines the appropriate icon type for a file.

```typescript
getFileIconType('image/png');          // 'image'
getFileIconType('application/pdf');    // 'pdf'
getFileIconType('application/zip');    // 'archive'
getFileIconType('text/plain');         // 'file'
```

**Returns:** `'image' | 'video' | 'pdf' | 'archive' | 'file'`

---

## Usage Examples

### Basic Upload with Progress

```typescript
import { validateFile, uploadFileToS3 } from '@/lib/s3';

async function handleFileUpload(file: File) {
  // Validate
  const validation = validateFile(file);
  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  // Upload
  const result = await uploadFileToS3({
    file,
    fieldName: 'description',
    onProgress: (progress) => {
      console.log(`Upload progress: ${progress}%`);
    },
  });

  if (result.success) {
    console.log('Uploaded:', result.attachment);
  } else {
    console.error('Upload failed:', result.error);
  }
}
```

### Complete Dialog Flow

```typescript
import { uploadFileToS3, linkAttachments, deleteFile } from '@/lib/s3';
import type { Attachment } from '@/lib/s3';

function CreateDefectDialog() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // Upload attachment
  const handleUpload = async (file: File) => {
    const result = await uploadFileToS3({
      file,
      fieldName: 'description',
    });
    
    if (result.success && result.attachment) {
      setAttachments([...attachments, result.attachment]);
    }
  };

  // Submit with attachments
  const handleSubmit = async () => {
    // 1. Create defect
    const res = await fetch('/api/defects', {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
    const { defect } = await res.json();

    // 2. Link attachments
    await linkAttachments(attachments, 'defectId', defect.id);
  };

  // Delete attachment
  const handleDelete = async (id: string) => {
    await deleteFile(id);
    setAttachments(attachments.filter(a => a.id !== id));
  };

  return (
    // ... dialog UI
  );
}
```

### Download/Preview

```typescript
import { downloadFile, getFileUrl } from '@/lib/s3';

// Simple download/preview
async function handleView(attachmentId: string) {
  await downloadFile(attachmentId);
}

// Get URL for custom handling
async function handleCustom(attachmentId: string) {
  const { url, isPreviewable } = await getFileUrl(attachmentId);
  
  if (isPreviewable) {
    // Show in modal/iframe
    showPreviewModal(url);
  } else {
    // Force download
    window.location.href = url;
  }
}
```

## Error Handling

All functions throw errors that should be caught:

```typescript
try {
  await uploadFileToS3({ file, fieldName: 'description' });
} catch (error) {
  console.error('Operation failed:', error);
  // Show user-friendly error message
}
```

## Architecture

### Upload Flow

```
1. validateFile() → Check size/type
2. uploadFileToS3() → Initialize S3 multipart upload
3. Backend → Generate presigned URLs for all chunks
4. Browser → Upload chunks directly to S3
5. Browser → Extract ETags from responses
6. uploadFileToS3() → Complete multipart upload
7. Backend → Save metadata to database
```

### Delete Flow

```
1. deleteFile() → Request presigned DELETE URL
2. Backend → Generate presigned URL
3. Browser → Delete directly from S3
4. deleteFile() → Confirm deletion
5. Backend → Remove from database
```

## Security

- ✅ All operations require authentication
- ✅ Presigned URLs expire (1 hour for upload/download, 5 min for delete)
- ✅ Backend validates all requests
- ✅ File validation on client and server
- ✅ AES256 encryption at rest

## Performance

- **Upload**: Limited by user's upload bandwidth
- **Chunk size**: 10MB (optimized for reliability)
- **Retries**: 3 attempts with exponential backoff
- **Parallel uploads**: Sequential for reliability
- **Backend load**: Minimal (only metadata operations)

## Testing

```typescript
import { validateFile, formatFileSize, getFileIconType } from '@/lib/s3';

// Test validation
const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
const validation = validateFile(file);
expect(validation.valid).toBe(true);

// Test formatters
expect(formatFileSize(1024)).toBe('1 KB');
expect(getFileIconType('image/png')).toBe('image');
```

## See Also

- [Attachment System Documentation](../../docs/ATTACHMENTS.md)
- [API Routes](../../app/api/attachments/)
- [AttachmentField Component](../../components/common/AttachmentField.tsx)
- [TextareaWithAttachments Element](../../elements/textarea-with-attachments.tsx)
