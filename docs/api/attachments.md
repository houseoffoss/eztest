# Attachments API

API endpoints for file attachment management with S3 support.

## Overview

EzTest supports file attachments for test cases, test steps, defects, and comments. Files are stored in AWS S3 (or compatible storage) with support for multipart uploads for large files.

**Maximum File Size:** 500MB  
**Supported Formats:** Images, documents, videos, archives (see configuration)

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/attachments/upload` | Initialize upload |
| `POST` | `/api/attachments/upload/part` | Upload part (multipart) |
| `POST` | `/api/attachments/upload/complete` | Complete multipart upload |
| `POST` | `/api/attachments/upload/abort` | Abort upload |
| `GET` | `/api/attachments/:id` | Get attachment details |
| `GET` | `/api/testcases/:id/attachments` | Get test case attachments |
| `POST` | `/api/testcases/:id/attachments` | Link attachments to test case |
| `GET` | `/api/teststeps/:stepId/attachments` | Get test step attachments |
| `POST` | `/api/teststeps/:stepId/attachments` | Associate attachments with step |
| `GET` | `/api/defects/:id/attachments` | Get defect attachments |
| `POST` | `/api/defects/:id/attachments` | Link attachments to defect |
| `GET` | `/api/comments/:commentId/attachments` | Get comment attachments |
| `POST` | `/api/comments/:commentId/attachments` | Create comment attachment |

---

## POST /api/attachments/upload

Initialize a file upload and get presigned URLs.

**Required Permission:** Varies by entity type (e.g., `testcases:update` for test case attachments)

**Request:**
```http
POST /api/attachments/upload
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "fileName": "screenshot.png",
  "fileSize": 1024000,
  "fileType": "image/png",
  "projectId": "proj_abc123",
  "entityType": "testcase",
  "entityId": "tc_abc123"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fileName` | string | Yes | Original file name |
| `fileSize` | number | Yes | File size in bytes |
| `fileType` | string | Yes | MIME type (e.g., `image/png`) |
| `projectId` | string | Yes | Project ID |
| `entityType` | string | Yes | `testcase`, `teststep`, `defect`, `comment` |
| `entityId` | string | No | Entity ID (required for some types) |

**Response (200 OK):**
```json
{
  "data": {
    "uploadId": "upload_123",
    "s3Key": "projects/proj_abc123/testcases/tc_abc123/attachments/abc123.png",
    "presignedUrl": "https://s3.amazonaws.com/bucket/...",
    "parts": [
      {
        "partNumber": 1,
        "presignedUrl": "https://s3.amazonaws.com/bucket/...?partNumber=1&uploadId=..."
      }
    ],
    "multipart": true,
    "maxPartSize": 5242880
  }
}
```

**For files < 5MB (single upload):**
```json
{
  "data": {
    "uploadId": "upload_123",
    "s3Key": "projects/proj_abc123/testcases/tc_abc123/attachments/abc123.png",
    "presignedUrl": "https://s3.amazonaws.com/bucket/...",
    "multipart": false
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid file type, size exceeds limit, or validation failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Entity not found

---

## POST /api/attachments/upload/part

Upload a part of a multipart upload.

**Request:**
```http
POST /api/attachments/upload/part
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "uploadId": "upload_123",
  "partNumber": 1,
  "partData": "base64-encoded-data..."
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uploadId` | string | Yes | Upload ID from initialize |
| `partNumber` | number | Yes | Part number (1-indexed) |
| `partData` | string | Yes | Base64-encoded part data |

**Response (200 OK):**
```json
{
  "data": {
    "partNumber": 1,
    "etag": "etag_value",
    "size": 5242880
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid upload ID or part number
- `404 Not Found` - Upload not found

---

## POST /api/attachments/upload/complete

Complete a multipart upload and create attachment record.

**Request:**
```http
POST /api/attachments/upload/complete
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "uploadId": "upload_123",
  "s3Key": "projects/proj_abc123/testcases/tc_abc123/attachments/abc123.png",
  "parts": [
    {
      "partNumber": 1,
      "etag": "etag_value"
    }
  ],
  "fileName": "screenshot.png",
  "fileSize": 10240000,
  "fileType": "image/png",
  "testCaseId": "tc_abc123",
  "testStepId": null
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uploadId` | string | Yes | Upload ID |
| `s3Key` | string | Yes | S3 object key |
| `parts` | array | Yes | Array of part objects with `partNumber` and `etag` |
| `fileName` | string | Yes | Original file name |
| `fileSize` | number | Yes | Total file size |
| `fileType` | string | Yes | MIME type |
| `testCaseId` | string | No | Test case ID (if applicable) |
| `testStepId` | string | No | Test step ID (if applicable) |

**Response (200 OK):**
```json
{
  "data": {
    "id": "att_abc123",
    "fileName": "screenshot.png",
    "originalName": "screenshot.png",
    "mimeType": "image/png",
    "size": 10240000,
    "s3Key": "projects/proj_abc123/testcases/tc_abc123/attachments/abc123.png",
    "url": "https://s3.amazonaws.com/bucket/...",
    "entityType": "testcase",
    "entityId": "tc_abc123",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid upload or missing parts
- `404 Not Found` - Upload not found

---

## POST /api/attachments/upload/abort

Abort an in-progress multipart upload.

**Request:**
```http
POST /api/attachments/upload/abort?uploadId=upload_123&fileKey=projects/...
Cookie: next-auth.session-token=...
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `uploadId` | string | Yes | Upload ID to abort |
| `fileKey` | string | Yes | S3 key of the file |

**Response (200 OK):**
```json
{
  "message": "Upload aborted successfully"
}
```

---

## GET /api/attachments/:id

Get attachment details and download URL.

**Request:**
```http
GET /api/attachments/att_abc123
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "att_abc123",
    "fileName": "screenshot.png",
    "originalName": "screenshot.png",
    "mimeType": "image/png",
    "size": 10240000,
    "s3Key": "projects/proj_abc123/testcases/tc_abc123/attachments/abc123.png",
    "url": "https://s3.amazonaws.com/bucket/...",
    "presignedUrl": "https://s3.amazonaws.com/bucket/...?X-Amz-Signature=...",
    "entityType": "testcase",
    "entityId": "tc_abc123",
    "fieldName": "attachment",
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": {
      "id": "user_xyz",
      "name": "John Doe"
    }
  }
}
```

**Error Responses:**

- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Attachment not found

---

## GET /api/testcases/:id/attachments

Get all attachments for a test case.

**Required Permission:** `testcases:read`

**Request:**
```http
GET /api/testcases/tc_abc123/attachments
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "att_abc123",
      "fileName": "screenshot.png",
      "originalName": "screenshot.png",
      "mimeType": "image/png",
      "size": 10240000,
      "url": "https://s3.amazonaws.com/bucket/...",
      "fieldName": "attachment",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## POST /api/testcases/:id/attachments

Link existing attachments to a test case.

**Required Permission:** `testcases:update`

**Request:**
```http
POST /api/testcases/tc_abc123/attachments
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "attachments": [
    {
      "id": "att_abc123",
      "fieldName": "attachment"
    }
  ]
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `attachments` | array | Yes | Array of attachment objects with `id` and optional `fieldName` |

**Response (200 OK):**
```json
{
  "data": {
    "success": true,
    "attachments": [
      {
        "id": "att_abc123",
        "entityType": "testcase",
        "entityId": "tc_abc123"
      }
    ]
  }
}
```

---

## GET /api/teststeps/:stepId/attachments

Get all attachments for a test step.

**Required Permission:** `testcases:read`

**Request:**
```http
GET /api/teststeps/step_abc123/attachments
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "att_abc123",
      "fileName": "step-screenshot.png",
      "mimeType": "image/png",
      "size": 512000,
      "url": "https://s3.amazonaws.com/bucket/...",
      "fieldName": "expectedResult",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## POST /api/teststeps/:stepId/attachments

Associate attachments with a test step.

**Required Permission:** `testcases:update`

**Request:**
```http
POST /api/teststeps/step_abc123/attachments
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "attachments": [
    {
      "id": "att_abc123",
      "s3Key": "projects/.../attachments/abc123.png",
      "fileName": "screenshot.png",
      "mimeType": "image/png",
      "fieldName": "expectedResult"
    }
  ]
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `attachments` | array | Yes | Array of attachment objects |

**Response (200 OK):**
```json
{
  "data": {
    "success": true,
    "attachments": [
      {
        "id": "att_abc123",
        "entityType": "teststep",
        "entityId": "step_abc123"
      }
    ]
  }
}
```

---

## GET /api/defects/:id/attachments

Get all attachments for a defect.

**Required Permission:** `defects:read`

**Request:**
```http
GET /api/defects/def_abc123/attachments
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "att_abc123",
      "fileName": "bug-screenshot.png",
      "mimeType": "image/png",
      "size": 2048000,
      "url": "https://s3.amazonaws.com/bucket/...",
      "fieldName": "attachment",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## POST /api/defects/:id/attachments

Link attachments to a defect.

**Required Permission:** `defects:update`

**Request:**
```http
POST /api/defects/def_abc123/attachments
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "attachments": [
    {
      "id": "att_abc123",
      "fieldName": "attachment"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "data": {
    "success": true,
    "attachments": [
      {
        "id": "att_abc123",
        "entityType": "defect",
        "entityId": "def_abc123"
      }
    ]
  }
}
```

---

## GET /api/comments/:commentId/attachments

Get all attachments for a comment.

**Required Permission:** Varies by parent entity (e.g., `defects:read`)

**Request:**
```http
GET /api/comments/comment_abc123/attachments
Cookie: next-auth.session-token=...
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "att_abc123",
      "fileName": "comment-image.png",
      "mimeType": "image/png",
      "size": 512000,
      "url": "https://s3.amazonaws.com/bucket/...",
      "fieldName": "comment",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## POST /api/comments/:commentId/attachments

Create an attachment for a comment.

**Required Permission:** Varies by parent entity (e.g., `defects:update`)

**Request:**
```http
POST /api/comments/comment_abc123/attachments
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "filename": "comment-image.png",
  "originalName": "comment-image.png",
  "mimeType": "image/png",
  "size": 512000,
  "path": "projects/proj_abc123/comments/comment_abc123/attachments/abc123.png",
  "fieldName": "comment"
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `filename` | string | Yes | File name |
| `originalName` | string | Yes | Original file name |
| `mimeType` | string | Yes | MIME type |
| `size` | number | Yes | File size in bytes |
| `path` | string | Yes | S3 key or file path |
| `fieldName` | string | No | Field name (default: "comment") |

**Response (200 OK):**
```json
{
  "data": {
    "id": "att_abc123",
    "filename": "comment-image.png",
    "originalName": "comment-image.png",
    "mimeType": "image/png",
    "size": 512000,
    "path": "projects/proj_abc123/comments/comment_abc123/attachments/abc123.png",
    "fieldName": "comment",
    "commentId": "comment_abc123",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Upload Flow

### Single Upload (< 5MB)

1. **Initialize:** `POST /api/attachments/upload`
2. **Upload:** PUT file to `presignedUrl`
3. **Complete:** `POST /api/attachments/upload/complete`

### Multipart Upload (≥ 5MB)

1. **Initialize:** `POST /api/attachments/upload` (returns multiple part URLs)
2. **Upload Parts:** PUT each part to its `presignedUrl` (in parallel)
3. **Complete:** `POST /api/attachments/upload/complete` with all part ETags

---

## Related Documentation

- [Attachments Feature](../features/attachments/README.md) - Feature guide
- [S3 Configuration](../getting-started/configuration.md#s3-configuration) - S3 setup
