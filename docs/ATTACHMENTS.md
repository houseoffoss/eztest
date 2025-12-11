# EZTest Attachment System Documentation

Complete guide for the direct browser-to-S3 file attachment system with presigned URLs.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Upload Flow](#upload-flow)
- [Implementation Changes](#implementation-changes)
- [Step by Step Guide](#step-by-step-guide)
- [Quick Setup](#quick-setup)
- [API Reference](#api-reference)
- [Component Usage](#component-usage)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Overview

The EZTest attachment system enables users to upload files up to 500MB directly from their browser to AWS S3 using presigned URLs. The backend never handles file data—only coordination and metadata storage.

### Key Features

✅ **Direct S3 Upload**: Files upload from browser to S3 (backend only generates URLs)  
✅ **Large Files**: Support up to 500MB with 10MB chunks  
✅ **Progress Tracking**: Real-time upload progress indicators  
✅ **Retry Logic**: Automatic retry (3 attempts) for failed chunks  
✅ **Preview Support**: Images and PDFs open inline  
✅ **Secure**: Presigned URLs with 1-hour expiry, AES256 encryption  
✅ **Reusable Components**: Base elements for dialogs and forms  

### Flow Diagram

```
Browser → Backend (Get Presigned URLs) → Browser → S3 (Direct Upload) → Backend (Complete) → Database
```

---

## Upload Flow

### Overall Data Flow

```
┌─────────────┐         ┌──────────────┐         ┌────────────┐         ┌──────────────┐
│   FRONTEND  │         │   BACKEND    │         │     S3     │         │   DATABASE   │
│   BROWSER   │         │   SERVER     │         │   STORAGE  │         │   POSTGRES   │
└─────────────┘         └──────────────┘         └────────────┘         └──────────────┘
      │                        │                       │                       │
      │ 1. Select file         │                       │                       │
      │ 2. Validate            │                       │                       │
      │ 3. Store in memory     │                       │                       │
      │ 4. Send metadata ──────────────────────────>  │                       │
      │                        │                       │                       │
      │                        │ 5. Validate           │                       │
      │                        │ 6. Create S3 session  │                       │
      │                        │ 7. Generate URLs      │                       │
      │ <─────────── 8. Return presigned URLs ────────│                       │
      │                        │                       │                       │
      │ 9. Upload chunks ─────────────────────────────────────────────────>  │
      │                        │                   (50MB total)                │
      │                        │                       │                       │
      │ 10. Complete ─────────── 11. Combine chunks ──│                       │
      │                        │                       │                       │
      │                        │ 12. Save metadata ────────────────────────>│
      │ <────── 13. Success ────────────────────────────────────────────────│
      │                        │                       │                       │
```

### Upload on Save Flow (Current Implementation)

```
User Action              Browser State              What Happens
═════════════════════════════════════════════════════════════════════════════

Click Upload Button      File selected            File picker opens

Select file.pdf          File in memory           No upload yet
                         Status: "⏳ Ready"        Just stored in browser

Fill form                File still waiting       No changes to file

Click Save               🔄 Uploading starts      uploadAllPendingAttachments()
                         Progress: 0% → 100%      

1. Send metadata to      📤 Request to backend    Backend validates & 
   backend                                        creates S3 session

2. Get presigned URLs    📥 URLs received         5 URLs (one per chunk)

3. Upload Chunk 1        🔄 20% progress          10MB uploaded to S3
4. Upload Chunk 2        🔄 40% progress          10MB uploaded to S3
5. Upload Chunk 3        🔄 60% progress          10MB uploaded to S3
6. Upload Chunk 4        🔄 80% progress          10MB uploaded to S3
7. Upload Chunk 5        🔄 90% progress          10MB uploaded to S3

8. Tell backend done     📤 Completion request    Backend combines chunks

9. Backend finalizes     Backend combining        S3 combines chunks
                                                  DB saves metadata

10. Create test case     📝 Form submitted        Test case created
                                                  in database

11. Link attachments     🔗 Linking               Attachment linked to
                                                  test case

12. Success!             ✅ 100% Complete         Success message shown

═════════════════════════════════════════════════════════════════════════════
Total Time: ~8-9 seconds
```

### Complete Timeline

```
Time (sec)   Event                              Status
═════════════════════════════════════════════════════════════════════════════
0s           User clicks upload button          📎 Click
1s           User selects file.pdf              ✓ Selected
1.2s         File appears in form               ⏳ Ready (pending)
2-12s        User fills form                    ✏️ Typing
13s          User clicks "Save Test Case"       💾 Saving
13.3s        Browser sends metadata             📤 To backend
13.5s        Backend validates                  ✅ OK
13.8s        Backend creates S3 session         ✅ Ready
14s          Browser gets presigned URLs        📥 Received
14.2s        Browser starts uploading chunks    🔄 Uploading
3-7s         All 5 chunks upload                📤 50MB → S3
7.8s         Browser tells backend complete     📤 Complete request
8.3s         Backend combines in S3             ⚙️ Combining
8.6s         Database saved                     💾 Saved
9s           Create test case                   📝 Created
9.2s         Link attachments                   🔗 Linked
9.5s         Show success                       ✅ Done!
═════════════════════════════════════════════════════════════════════════════
```

---

## Implementation Changes

### What Changed: Upload on Save Flow

#### Before (Auto-Upload)
- Files uploaded to S3 immediately after file selection
- Status: "🔄 Uploading" when user picked file
- Files already in S3 even if user cancels form
- Wasteful storage if user doesn't save

#### After (Upload on Save)
- Files stored in browser memory only
- Status: "⏳ Ready" (not uploading)
- Files upload only when user clicks "Save"
- No wasted S3 storage
- Atomic operation (all or nothing)

### Code Changes

#### 1. `useAttachments.ts` - Removed Auto-Upload
```typescript
// BEFORE - Line 60
uploadAttachment(attachmentId, file); // Removed this

// AFTER - Just store in browser
// Files now stay "pending" until save is clicked
```

#### 2. `useAttachments.ts` - New Function
```typescript
// NEW FUNCTION - Call when user saves
const uploadAllPendingAttachments = async (): Promise<boolean> => {
  const pendingAttachments = attachments.filter(att => att.status === 'pending');
  
  for (const attachment of pendingAttachments) {
    const file = attachmentStorage.getAttachment(attachment.id)?.file;
    if (!file) return false;
    
    const success = await uploadAttachment(attachment.id, file);
    if (!success) return false; // Stop on first failure
  }
  
  return true; // All successful
}
```

#### 3. `useAttachments.ts` - Updated Return Type
```typescript
// BEFORE
const uploadAttachment = async (attachmentId: string, file: File) => { ... }

// AFTER - Now returns success/failure
const uploadAttachment = async (attachmentId: string, file: File): Promise<boolean> => { 
  // ... upload logic ...
  return true; // or false
}
```

#### 4. `useAttachments.ts` - Export New Function
```typescript
return {
  attachments,
  error,
  isUploading,
  handleFileSelect,
  removeAttachment,
  clearAttachments,
  uploadAllPendingAttachments, // ← NEW: Call on save
  getCompletedAttachmentKeys,
}
```

#### 5. `attachment-storage.ts` - Helper Methods
```typescript
// NEW - Check if files are ready to upload
hasPendingAttachments(): boolean {
  return Array.from(this.attachments.values()).some(att => att.status === 'pending');
}

// NEW - Get list of pending files
getPendingAttachments(): BrowserAttachment[] {
  return Array.from(this.attachments.values()).filter(att => att.status === 'pending');
}
```

### How to Use in Your Component

```typescript
import { useAttachments } from '@/hooks/useAttachments';

export function CreateTestCaseForm() {
  const {
    attachments,
    error,
    uploadAllPendingAttachments, // NEW!
    getCompletedAttachmentKeys,
  } = useAttachments();

  const handleSaveTestCase = async (formData) => {
    try {
      // Step 1: Upload all pending files
      const uploadSuccess = await uploadAllPendingAttachments();
      if (!uploadSuccess) {
        showError('File upload failed');
        return;
      }

      // Step 2: Create test case
      const response = await fetch('/api/testcases', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const { testCase } = await response.json();

      // Step 3: Link attachments
      if (getCompletedAttachmentKeys().length > 0) {
        await fetch(`/api/testcases/${testCase.id}/attachments`, {
          method: 'POST',
          body: JSON.stringify({
            attachments: getCompletedAttachmentKeys()
          })
        });
      }

      showSuccess('Test case created!');
    } catch (err) {
      showError('Failed to save');
    }
  };

  return (
    // Your form JSX
  );
}
```

---

## Step by Step Guide

### User Perspective

1. **Select File**
   - Click "📎 Upload Files" button
   - File picker opens
   - Select file.pdf (50MB)
   - Click "Open"
   - File appears as "⏳ Ready" in form

2. **Review & Add More (Optional)**
   - Can add more files by clicking upload again
   - Can remove any file before saving
   - No uploads to S3 yet

3. **Fill Form**
   - Enter test case title
   - Enter description
   - See attached file in list

4. **Save Test Case**
   - Click "Save Test Case" button
   - Button changes to "💾 Saving..."
   - Progress bar shows file uploading: 0% → 100%
   - Test case created with attachment
   - Success message shown

### Developer Perspective

1. **File Selection** (Browser)
   ```
   User selects file
   → Validate size & type (frontend)
   → Store in browser memory (attachmentStorage)
   → Add to React state
   → Show "⏳ Ready" status
   ```

2. **Save Form** (Browser + Backend)
   ```
   User clicks save
   → Call uploadAllPendingAttachments()
   → For each pending file:
     - Send metadata to backend
     - Receive presigned URLs
     - Upload chunks to S3 (direct)
     - Tell backend complete
     - Backend saves to database
   → Create test case via API
   → Link attachments via API
   → Show success
   ```

3. **Upload Process** (Browser → S3)
   ```
   Browser extracts 10MB chunk 1
   → PUT to presigned URL 1
   → S3 stores chunk 1
   → Browser gets ETag 1
   → Repeat for chunks 2-5
   → Tell backend all done
   → Backend tells S3 combine chunks
   → Backend saves metadata
   ```

---



### Components

1. **Backend API** (`app/api/attachments/`)
   - Initialize multipart uploads
   - Generate presigned URLs
   - Complete uploads and save metadata
   - Handle downloads/deletes

2. **Frontend Components**
   - `AttachmentField` - Full component with label and text area
   - `TextareaWithAttachments` - Base element for dialogs

3. **AWS S3**
   - Multipart upload protocol
   - Server-side encryption (AES256)
   - Presigned URL access

4. **Database** (Prisma)
   - Attachment metadata storage
   - Relations to entities (test cases, defects, etc.)

### Technical Specs

- **Max File Size**: 500 MB
- **Chunk Size**: 10 MB per part
- **Upload Method**: S3 Multipart Upload
- **Presigned URL Expiry**: 1 hour (upload/download), 5 minutes (delete)
- **Encryption**: AES256 server-side
- **Retry Strategy**: 3 attempts with exponential backoff

### Supported File Types

**Allowed:**
- Images: `image/*`
- Documents: `.pdf`, `.doc`, `.docx`
- Spreadsheets: `.xls`, `.xlsx`
- Text: `.txt`, `.csv`
- Archives: `.zip`, `.rar`

**Blocked:**
- Videos: `video/*` (explicitly blocked)

---

## Quick Setup

### 1. Install Dependencies

Already installed in this project:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Create S3 Bucket

Using AWS CLI:
```bash
aws s3 mb s3://eztest-attachments --region us-east-1
```

Or via [AWS Console](https://console.aws.amazon.com/s3/)

### 3. Create IAM User

1. Go to AWS IAM Console
2. Create user: `eztest-s3-user`
3. Attach inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": "arn:aws:s3:::eztest-attachments/*"
    }
  ]
}
```

4. Save Access Key ID and Secret Access Key

### 4. Configure Environment

Add to `.env`:

```env
# AWS S3 Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="eztest-attachments"

# Optional: Customize chunk size (default: 10485760 = 10MB)
# Larger chunks = faster uploads on good connections, but less granular progress
# S3_CHUNK_SIZE="10485760"
```

### 5. Configure S3 CORS

**CRITICAL:** The `ExposeHeaders` setting must include `"ETag"` - without it, multipart uploads will fail!

#### Common CORS Errors:
- ❌ "Failed to fetch"
- ❌ "No ETag received from S3"
- ❌ "CORS Error: Cannot upload to S3"

These occur because your S3 bucket blocks browser requests due to missing or incorrect CORS configuration.

#### Method 1: AWS Console (Easiest)

1. **Open AWS Console**: https://console.aws.amazon.com/s3/
2. **Find your bucket**: Click on your bucket name
3. **Go to Permissions tab**
4. **Scroll to "Cross-origin resource sharing (CORS)"**
5. **Click "Edit"**
6. **Paste this configuration**:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

7. **Click "Save changes"**

#### Method 2: AWS CLI

Create a file `cors-config.json`:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
      "AllowedOrigins": [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://yourdomain.com"
      ],
      "ExposeHeaders": ["ETag", "Content-Length"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

Run this command:

```bash
aws s3api put-bucket-cors \
  --bucket your-bucket-name \
  --cors-configuration file://cors-config.json \
  --region us-east-1
```

Verify CORS is set:

```bash
aws s3api get-bucket-cors --bucket your-bucket-name --region us-east-1
```

#### What Each Setting Does

- **AllowedHeaders: ["*"]** - Allows all request headers (required for presigned URLs)
- **AllowedMethods** - Allows GET (download), PUT (upload), DELETE (delete), HEAD (check)
- **AllowedOrigins** - Your app URLs - MUST match exactly (add production URL before deploying)
- **ExposeHeaders: ["ETag", "Content-Length"]** - ⚠️ **CRITICAL!** Without "ETag", uploads will fail
- **MaxAgeSeconds** - Browser caches CORS preflight response for 1 hour

#### Production Setup

Before deploying to production:

1. **Replace** `http://localhost:3000` with your actual domain
2. **Remove** localhost entries from AllowedOrigins
3. **Example**:

```json
"AllowedOrigins": [
  "https://eztest.yourdomain.com",
  "https://www.yourdomain.com"
]
```

#### Troubleshooting CORS

**Still getting CORS errors?**

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Open browser in incognito mode**
3. **Check bucket name** in `.env` - make sure no trailing space
4. **Verify AWS credentials** are correct
5. **Check S3 bucket region** matches `AWS_REGION` in `.env`
6. **Restart Next.js dev server** after CORS changes

**Check CORS is applied:**

```bash
aws s3api get-bucket-cors --bucket your-bucket-name --region us-east-1
```

Should return your CORS configuration. If error, CORS is not set.

### 6. Test the System

1. Start development server: `npm run dev`
2. Navigate to test case creation
3. Upload a file to preconditions/postconditions
4. Verify upload progress and completion
5. Test download and delete operations

---

## API Reference

### Initialize Upload

**POST** `/api/attachments/upload`

Validates file size and generates presigned URLs for all chunks.

**Request:**
```json
{
  "filename": "document.pdf",
  "mimeType": "application/pdf",
  "size": 52428800,
  "fieldName": "preconditions"
}
```

**Response:**
```json
{
  "uploadId": "abc123...",
  "s3Key": "attachments/1733847291234-abc123def456-document.pdf",
  "presignedUrls": [
    { "partNumber": 1, "url": "https://s3.amazonaws.com/..." },
    { "partNumber": 2, "url": "https://s3.amazonaws.com/..." }
  ],
  "totalParts": 5,
  "chunkSize": 10485760
}
```

### Complete Upload

**POST** `/api/attachments/upload/complete`

Completes multipart upload and saves metadata to database.

**Request:**
```json
{
  "uploadId": "abc123...",
  "s3Key": "attachments/...",
  "parts": [
    { "ETag": "\"d41d8cd98f00b204e9800998ecf8427e\"", "PartNumber": 1 },
    { "ETag": "\"098f6bcd4621d373cade4e832627b4f6\"", "PartNumber": 2 }
  ],
  "originalName": "document.pdf",
  "mimeType": "application/pdf",
  "size": 52428800,
  "fieldName": "preconditions"
}
```

**Response:**
```json
{
  "attachment": {
    "id": "clx123...",
    "filename": "attachments/...",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "size": 52428800,
    "fieldName": "preconditions"
  }
}
```

### Get File URL

**GET** `/api/attachments/[id]`

Generates presigned URL for download/preview.

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/...",
  "isPreviewable": true,
  "attachment": { ... }
}
```

### Update Attachment

**PATCH** `/api/attachments/[id]`

Links attachment to an entity after creation.

**Request:**
```json
{
  "testCaseId": "clx456...",
  "defectId": "clx789...",
  "commentId": "clx012..."
}
```

### Delete Attachment

**DELETE** `/api/attachments/[id]?step=prepare`

Two-step delete process:

1. **Prepare**: Get presigned DELETE URL
   ```json
   { "presignedDeleteUrl": "https://s3..." }
   ```

2. **Confirm**: Remove from database (after browser deletes from S3)
   ```json
   { "success": true }
   ```

### Abort Upload

**DELETE** `/api/attachments/upload/abort`

Aborts failed multipart upload.

**Request:**
```json
{
  "uploadId": "abc123...",
  "s3Key": "attachments/..."
}
```

---

## Three-Phase Upload System

### New Implementation (December 2025)

The attachment system now includes a **three-phase upload process** with browser-side staging:

#### Phase 1: Browser Storage
Files selected by users are stored in browser memory (`lib/attachment-storage.ts`) before being uploaded. Users can:
- Add/remove files before saving
- See upload progress
- Handle errors gracefully

#### Phase 2: S3 Upload
When creating/saving an entity, files are uploaded to S3 in chunks:
- `hooks/useAttachments.ts` manages the upload lifecycle
- Frontend directly uploads to S3 using presigned URLs
- Backend never receives file data
- Progress tracking per file

#### Phase 3: Database Association
After successful S3 upload:
- `POST /api/testcases/[id]/attachments` links files to entities
- Metadata saved to database
- Browser storage cleared
- Attachment records created with references to S3 files

### Files Created (December 2025)

| File | Purpose |
|------|---------|
| `lib/attachment-storage.ts` | Singleton for browser-side attachment state (240 lines) |
| `hooks/useAttachments.ts` | React hook managing file upload lifecycle (220 lines) |
| `components/common/AttachmentUpload.tsx` | Reusable drag-and-drop upload component (190 lines) |
| `app/api/testcases/[testCaseId]/attachments/route.ts` | API for linking attachments to test cases (180 lines) |

### Basic Usage

#### Using AttachmentUpload Component

```typescript
import { AttachmentUpload } from '@/components/common/AttachmentUpload';
import { attachmentStorage } from '@/lib/attachment-storage';

export function MyDialog() {
  useEffect(() => {
    // Initialize context for this dialog
    attachmentStorage.setContext({
      entityType: 'testcase',
      projectId: 'proj123'
    });
    
    return () => attachmentStorage.clearContext();
  }, []);

  const handleSave = async () => {
    // Create entity
    const testCase = await createTestCase(data);
    
    // Get completed attachments
    const attachments = attachmentStorage.getCompletedAttachmentKeys();
    
    // Link to entity if attachments exist
    if (attachments.length > 0) {
      await fetch(`/api/testcases/${testCase.id}/attachments`, {
        method: 'POST',
        body: JSON.stringify({ attachments })
      });
    }
    
    // Clean up
    attachmentStorage.clearAllAttachments();
  };

  return (
    <>
      <AttachmentUpload 
        maxFiles={10}
        accept="image/*,.pdf,.doc,.docx"
      />
      <button onClick={handleSave}>Save</button>
    </>
  );
}
```

#### Using useAttachments Hook Directly

```typescript
import { useAttachments } from '@/hooks/useAttachments';

export function CustomUploadForm() {
  const {
    attachments,
    error,
    isUploading,
    handleFileSelect,
    removeAttachment,
    getCompletedAttachmentKeys
  } = useAttachments({
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: ['image/*', 'application/pdf']
  });

  return (
    <div>
      <input 
        type="file" 
        multiple
        onChange={(e) => handleFileSelect(e.currentTarget.files)}
      />
      {error && <p className="error">{error}</p>}
      {attachments.map(att => (
        <div key={att.id}>
          <span>{att.file.name}</span>
          <progress value={att.uploadProgress} />
          <button onClick={() => removeAttachment(att.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

## Component Usage

### Option 1: AttachmentField (Standalone Component)

Full component with label, textarea, and attachments. Best for complex layouts.

```typescript
import { AttachmentField } from '@/components/common/AttachmentField';

function TestCaseForm() {
  const [preconditions, setPreconditions] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  return (
    <AttachmentField
      label="Preconditions"
      fieldName="preconditions"
      textValue={preconditions}
      onTextChange={setPreconditions}
      attachments={attachments}
      onAttachmentsChange={setAttachments}
      entityId={testCaseId}
      maxLength={250}
    />
  );
}
```

**Props:**
- `label` - Field label text
- `fieldName` - Identifier for attachments (string)
- `textValue` - Textarea value
- `onTextChange` - Textarea change handler
- `attachments` - Attachment array
- `onAttachmentsChange` - Attachment change handler
- `entityId` - Parent entity ID (optional)
- `maxLength` - Text character limit
- `showTextArea` - Show/hide textarea (default: true)

### Option 2: TextareaWithAttachments (Base Element)

Reusable element for dialogs. Follows base element patterns.

```typescript
import { TextareaWithAttachments } from '@/elements/textarea-with-attachments';

function CreateDefectDialog() {
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  return (
    <Dialog>
      <DialogContent>
        <Label>Description</Label>
        <TextareaWithAttachments
          variant="glass"
          fieldName="description"
          value={description}
          onChange={setDescription}
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          placeholder="Describe the defect"
          maxLength={500}
          rows={4}
        />
      </DialogContent>
    </Dialog>
  );
}
```

**Props:**
- `variant` - `"default"` | `"glass"`
- `fieldName` - Identifier (required)
- `value` - Text value
- `onChange` - Text change handler
- `attachments` - Attachment array
- `onAttachmentsChange` - Attachment change handler
- `entityId` - Parent entity ID (optional)
- `maxLength` - Character limit
- `showCharCount` - Show counter (default: true)
- `showAttachments` - Show attachment UI (default: true)
- All standard textarea props (className, placeholder, rows, etc.)

### Complete Dialog Example

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/elements/dialog';
import { TextareaWithAttachments, type Attachment } from '@/elements/textarea-with-attachments';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { ButtonPrimary } from '@/elements/button-primary';

export function CreateDefectDialog({ open, onOpenChange, projectId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Create defect
      const res = await fetch('/api/defects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, title, description }),
      });
      const { defect } = await res.json();

      // 2. Link attachments to defect
      for (const attachment of attachments) {
        await fetch(`/api/attachments/${attachment.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ defectId: defect.id }),
        });
      }

      // 3. Reset and close
      setTitle('');
      setDescription('');
      setAttachments([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create defect:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Defect</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              variant="glass"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter defect title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <TextareaWithAttachments
              id="description"
              variant="glass"
              fieldName="description"
              value={description}
              onChange={setDescription}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              placeholder="Describe the defect in detail"
              maxLength={500}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <ButtonPrimary onClick={handleSubmit} disabled={loading || !title.trim()}>
            {loading ? 'Creating...' : 'Create Defect'}
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Linking Attachments Pattern

Attachments are created before the parent entity. Link them after entity creation:

```typescript
// 1. Attachments already uploaded (stored in state)
const [attachments, setAttachments] = useState<Attachment[]>([]);

// 2. Create parent entity
const response = await fetch('/api/entities', {
  method: 'POST',
  body: JSON.stringify({ ...data }),
});
const { entity } = await response.json();

// 3. Link each attachment
for (const attachment of attachments) {
  await fetch(`/api/attachments/${attachment.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ entityId: entity.id }),
  });
}
```

---

## Security

### Authentication

All API endpoints require NextAuth session:

```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Presigned URLs

Time-limited, operation-scoped URLs:

- **Upload**: 1 hour expiry, PUT method only
- **Download**: 1 hour expiry, GET method only
- **Delete**: 5 minutes expiry, DELETE method only

### File Validation

**Backend:**
- Size limit: 500MB
- Type validation: MIME type checks
- Session validation: User must be authenticated

**Frontend:**
- Size check before upload
- Video files blocked
- Inline error messages

### Encryption

- **At Rest**: AES256 server-side encryption on S3
- **In Transit**: HTTPS for all requests
- **Database**: Encrypted connections to PostgreSQL

### S3 Bucket Policy

Restrict access to authenticated requests only:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::eztest-attachments/*",
      "Condition": {
        "Bool": { "aws:SecureTransport": "false" }
      }
    }
  ]
}
```

---

## Troubleshooting

### "Failed to initialize upload"

**Cause**: AWS credentials or bucket configuration issue

**Solutions:**
- Verify AWS credentials in `.env`
- Check S3 bucket exists and region matches
- Verify IAM user has correct permissions
- Check CloudWatch logs for detailed errors

### "CORS error during upload"

**Cause**: S3 CORS not configured or domain not allowed

**Solutions:**
- Add your domain to S3 CORS configuration
- Include `http://localhost:3000` for development
- Ensure `ExposeHeaders: ["ETag"]` is set
- Verify `AllowedMethods` includes PUT

### "Upload fails after 1 hour"

**Cause**: Presigned URLs expired

**Solutions:**
- Upload should complete within 1 hour
- If uploading very large files on slow connections, increase expiry in `lib/s3-client.ts`:
  ```typescript
  expiresIn: 7200, // 2 hours
  ```

### "File size exceeds limit"

**Cause**: File larger than 500MB

**Solutions:**
- Current limit: 500MB (configurable)
- Adjust in `lib/s3-client.ts`:
  ```typescript
  export const MAX_FILE_SIZE = 500 * 1024 * 1024; // Change this
  ```

### Chunk upload fails repeatedly

**Cause**: Network issues or S3 connectivity problems

**Solutions:**
- Check internet connection
- Verify S3 bucket is accessible
- Check browser console for detailed errors
- System auto-retries 3 times with exponential backoff

### Prisma errors

**Cause**: Database schema out of sync

**Solutions:**
```bash
npx prisma generate
npx prisma migrate dev
```

### "Cannot read properties of undefined"

**Cause**: Component receiving undefined attachments

**Solution:**
```typescript
// Always initialize with empty array
const [attachments, setAttachments] = useState<Attachment[]>([]);
```

---

## Database Schema

```prisma
model Attachment {
  id           String   @id @default(cuid())
  filename     String   // S3 key: "attachments/timestamp-hash-name.ext"
  originalName String   // Original filename from user
  mimeType     String   // MIME type
  size         Int      // Size in bytes
  path         String   // Full S3 path
  fieldName    String?  // Field identifier (e.g., "preconditions")
  
  // Relations
  testCaseId   String?
  testResultId String?
  defectId     String?
  commentId    String?
  
  uploadedAt   DateTime @default(now())
  
  testCase     TestCase?   @relation(fields: [testCaseId], references: [id], onDelete: Cascade)
  testResult   TestResult? @relation(fields: [testResultId], references: [id], onDelete: Cascade)
  
  @@index([testCaseId])
  @@index([testResultId])
  @@index([defectId])
  @@index([commentId])
}
```

---

## Production Deployment

### Using IAM Roles (Recommended)

On AWS EC2/ECS, use IAM roles instead of access keys:

1. Create IAM role with S3 permissions
2. Attach role to EC2 instance or ECS task
3. Remove AWS credentials from environment variables
4. SDK automatically uses IAM role

### Using Vercel/Netlify

Add environment variables in platform settings:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=eztest-attachments
```

### Security Checklist

- ✅ Never commit AWS credentials to git
- ✅ Use environment variables
- ✅ Enable S3 bucket encryption
- ✅ Configure restrictive bucket policy
- ✅ Enable CloudWatch logging
- ✅ Set up billing alerts
- ✅ Rotate access keys regularly (every 90 days)
- ✅ Use IAM roles in production when possible

### Performance Optimization

1. **Enable S3 Transfer Acceleration** (optional):
   - Faster uploads from distant locations
   - Additional cost: $0.04-$0.08 per GB

2. **CloudFront CDN** (optional):
   - Cache downloads globally
   - Reduce S3 GET costs
   - Faster download speeds

3. **Lifecycle Policies**:
   - Archive old attachments to Glacier
   - Delete incomplete multipart uploads after 7 days

---

## Cost Estimation

### Storage (S3 Standard)
- **Rate**: $0.023 per GB/month
- **Example**: 100GB = $2.30/month

### Data Transfer
- **First 1GB/month**: Free
- **Next 9.999TB**: $0.09 per GB
- **Example**: 10GB = $0.90

### API Requests
- **PUT** (upload): $0.005 per 1,000
- **GET** (download): $0.0004 per 1,000
- **DELETE**: $0.005 per 1,000

### Typical Monthly Cost
- **Small team** (10GB storage, 20GB transfer): ~$2-3/month
- **Medium team** (100GB storage, 100GB transfer): ~$11-12/month
- **Large team** (1TB storage, 500GB transfer): ~$68-70/month

---

## Recent Security & Validation Improvements

**Last Updated:** December 10, 2025  
**Status:** ✅ Complete

### What's New

#### 1. Backend File Type Validation ✅
- Added server-side MIME type whitelist (30+ safe types)
- Blocks dangerous file types (executables, scripts)
- Returns clear error messages for rejected types

#### 2. Upload Completeness Validation ✅
- Verifies all parts uploaded before finalizing
- Checks parts are sequential (no gaps)
- Validates all ETags present

#### 3. Lazy S3 Client Initialization ✅
- App no longer crashes without AWS credentials
- Better developer experience for local testing
- Cleaner error messages

#### 4. Configurable Chunk Size ✅
- Set via `S3_CHUNK_SIZE` environment variable
- Default: 10MB (optimized for most networks)
- Customize for your network speed

#### 5. Improved Error Handling ✅
- Better logging for abort operations
- Non-blocking cleanup
- More informative error messages

### S3 Lifecycle Policy (Recommended)

**Why:** Auto-delete incomplete multipart uploads after 7 days to prevent storage costs.

**Cost Impact:**
- Without policy: Failed uploads charged forever (~$0.23/year per 100MB)
- With policy: Cleaned up after 7 days (saves ~87%)

**Quick Setup (AWS Console):**
1. Go to S3 Console → Your bucket → Management tab
2. Click "Create lifecycle rule"
3. Name: `DeleteIncompleteMultipartUploads`
4. Choose: "Apply to all objects in the bucket"
5. Check: "Delete expired object delete markers or incomplete multipart uploads"
6. Days after initiation: `7`
7. Create rule

**Quick Setup (AWS CLI):**
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket eztest-attachments \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "DeleteIncompleteMultipartUploads",
      "Status": "Enabled",
      "Filter": {"Prefix": "attachments/"},
      "AbortIncompleteMultipartUpload": {"DaysAfterInitiation": 7}
    }]
  }'
```

**Verify:**
```bash
aws s3api get-bucket-lifecycle-configuration --bucket eztest-attachments
```

### Configuration Changes

**Optional Environment Variable:**

Add to `.env` for custom chunk size:
```env
# Optional: Customize chunk size (default: 10485760 = 10MB)
S3_CHUNK_SIZE=10485760
```

**Recommendations:**
- Slow networks (<5 Mbps): Keep 10MB (default)
- Fast networks (>50 Mbps): Try 50-100MB
- Minimum: 5MB (AWS S3 requirement)

### Security Impact

| Before | After | Improvement |
|--------|-------|-------------|
| ❌ Client MIME type trusted | ✅ Server-side whitelist validation | **High** |
| ❌ No upload completeness check | ✅ Full parts validation | **High** |
| ⚠️ Silent abort failures | ✅ Logged abort operations | **Medium** |
| ⚠️ App crash without AWS | ✅ Lazy initialization | **Medium** |

### Files Modified

- `lib/s3-client.ts` - Lazy initialization, configurable chunk size
- `app/api/attachments/upload/route.ts` - MIME type validation
- `app/api/attachments/upload/complete/route.ts` - Parts validation
- `lib/s3/upload-utils.ts` - Better error handling
- `.env.example` - Added S3_CHUNK_SIZE documentation

**Backward Compatibility:** ✅ Fully compatible - no breaking changes

---

## Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [S3 CORS Setup](./S3_CORS_SETUP.md)

---

## Support

For issues or questions:
1. Check this documentation
2. Review CloudWatch logs (AWS Console)
3. Check browser console for frontend errors
4. Review server logs for backend errors
5. Contact team lead or DevOps

---

**Last Updated**: December 2025  
**Version**: 2.0 (Direct S3 Upload)
