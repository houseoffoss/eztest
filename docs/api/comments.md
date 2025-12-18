# Comments API

API endpoints for comment management on defects and other entities.

## Overview

Comments enable collaboration and discussion on defects. Each comment can have attachments and is associated with a user.

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/projects/:id/defects/:defectId/comments` | Create defect comment |
| `GET` | `/api/comments/:commentId/attachments` | Get comment attachments |
| `POST` | `/api/comments/:commentId/attachments` | Create comment attachment |

---

## POST /api/projects/:id/defects/:defectId/comments

Create a new comment on a defect.

**Required Permission:** `defects:read` (to view) or `defects:update` (to comment)

**Request:**
```http
POST /api/projects/proj_abc123/defects/def_abc123/comments
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "content": "This issue occurs when the user clicks submit multiple times quickly.",
  "attachments": []
}
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Comment text content |
| `attachments` | array | No | Array of attachment IDs to link |

**Response (200 OK):**
```json
{
  "data": {
    "id": "comment_abc123",
    "content": "This issue occurs when the user clicks submit multiple times quickly.",
    "defectId": "def_abc123",
    "createdBy": {
      "id": "user_xyz",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "attachments": []
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing or invalid content
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Defect not found

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
      "filename": "comment-screenshot.png",
      "originalName": "comment-screenshot.png",
      "mimeType": "image/png",
      "size": 512000,
      "path": "projects/proj_abc123/comments/comment_abc123/attachments/abc123.png",
      "fieldName": "comment",
      "commentId": "comment_abc123",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Error Responses:**

- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Comment not found

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
  "filename": "comment-screenshot.png",
  "originalName": "comment-screenshot.png",
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
| `mimeType` | string | Yes | MIME type (e.g., `image/png`) |
| `size` | number | Yes | File size in bytes |
| `path` | string | Yes | S3 key or file path |
| `fieldName` | string | No | Field name (default: "comment") |

**Response (200 OK):**
```json
{
  "data": {
    "id": "att_abc123",
    "filename": "comment-screenshot.png",
    "originalName": "comment-screenshot.png",
    "mimeType": "image/png",
    "size": 512000,
    "path": "projects/proj_abc123/comments/comment_abc123/attachments/abc123.png",
    "fieldName": "comment",
    "commentId": "comment_abc123",
    "uploaderId": "user_xyz",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing required fields or validation failed
- `403 Forbidden` - Insufficient permissions or user not authenticated
- `404 Not Found` - Comment not found

---

## Comment Workflow

### Creating a Comment with Attachments

1. **Create Comment:**
   ```http
   POST /api/projects/:id/defects/:defectId/comments
   {
     "content": "See screenshot attached",
     "attachments": []
   }
   ```

2. **Upload Attachment:**
   - Use [Attachments API](./attachments.md) to upload file
   - Get attachment ID from upload response

3. **Link Attachment to Comment:**
   ```http
   POST /api/comments/:commentId/attachments
   {
     "filename": "...",
     "path": "...",
     ...
   }
   ```

---

## Related Documentation

- [Defects API](./defects.md) - Defect management
- [Attachments API](./attachments.md) - File upload and management
