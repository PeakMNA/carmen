# Credit Note API - Comment Operations

**Document Status:** Draft  
**Last Updated:** March 27, 2024

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Table of Contents
- [Introduction](#introduction)
- [Data Models](#data-models)
- [Endpoints](#endpoints)
  - [Get Credit Note Comments](#get-credit-note-comments)
  - [Get Comment by ID](#get-comment-by-id)
  - [Add Comment](#add-comment)
  - [Update Comment](#update-comment)
  - [Delete Comment](#delete-comment)
- [Error Responses](#error-responses)
- [Related Documentation](#related-documentation)

## Introduction

This document describes the API endpoints for managing comments associated with Credit Notes. These endpoints allow for adding, updating, and managing comments related to credit notes.

## Data Models

### Comment

```typescript
interface Comment {
  id: string
  creditNoteId: string
  userId: string
  userName: string
  userRole: string
  content: string
  type: CommentType
  visibility: CommentVisibility
  attachments?: {
    id: string
    fileName: string
    fileType: string
    fileSize: number
    url: string
  }[]
  mentions?: {
    userId: string
    userName: string
  }[]
  createdAt: string
  updatedAt: string
}

type CommentType = 'general' | 'system' | 'return'
type CommentVisibility = 'public' | 'private' | 'internal'
```

## Endpoints

### Get Credit Note Comments

Retrieves all comments associated with a credit note.

**Request:**
```
GET /api/credit-notes/:creditNoteId/comments
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note

**Query Parameters:**
```typescript
{
  type?: CommentType
  visibility?: CommentVisibility
  fromDate?: string
  toDate?: string
  sortBy?: 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}
```

**Response:**
```typescript
{
  data: Comment[]
  total: number
  page: number
  limit: number
}
```

**Example:**
```
GET /api/credit-notes/CN-2401-0001/comments?type=general&visibility=internal
```

### Get Comment by ID

Retrieves a specific comment by its ID.

**Request:**
```
GET /api/credit-notes/:creditNoteId/comments/:commentId
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note
- `commentId`: The unique identifier of the comment

**Response:**
```typescript
Comment
```

**Example:**
```
GET /api/credit-notes/CN-2401-0001/comments/CMT-001
```

### Add Comment

Adds a new comment to a credit note.

**Request:**
```
POST /api/credit-notes/:creditNoteId/comments
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note

**Request Body:**
```typescript
{
  content: string
  type: CommentType
  visibility: CommentVisibility
  attachments?: {
    fileName: string
    fileType: string
    fileContent: string // Base64 encoded file content
  }[]
  mentions?: string[] // Array of user IDs
}
```

**Response:**
```typescript
Comment
```

**Example Request:**
```json
POST /api/credit-notes/CN-2401-0001/comments
{
  "content": "Verified the physical damage on the laptop. The screen is cracked and the chassis is dented.",
  "type": "general",
  "visibility": "internal",
  "attachments": [
    {
      "fileName": "damage_inspection.pdf",
      "fileType": "application/pdf",
      "fileContent": "base64_encoded_content..."
    }
  ],
  "mentions": ["USER456", "USER789"]
}
```

### Update Comment

Updates an existing comment. Users can only update their own comments.

**Request:**
```
PUT /api/credit-notes/:creditNoteId/comments/:commentId
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note
- `commentId`: The unique identifier of the comment

**Request Body:**
```typescript
{
  content?: string
  visibility?: CommentVisibility
  addAttachments?: {
    fileName: string
    fileType: string
    fileContent: string // Base64 encoded file content
  }[]
  removeAttachments?: string[] // Array of attachment IDs to remove
  addMentions?: string[] // Array of user IDs to add
  removeMentions?: string[] // Array of user IDs to remove
}
```

**Response:**
```typescript
Comment
```

**Example Request:**
```json
PUT /api/credit-notes/CN-2401-0001/comments/CMT-001
{
  "content": "Updated: Verified the physical damage on the laptop. The screen is cracked, the chassis is dented, and the keyboard is not functioning properly.",
  "addAttachments": [
    {
      "fileName": "keyboard_inspection.jpg",
      "fileType": "image/jpeg",
      "fileContent": "base64_encoded_content..."
    }
  ],
  "addMentions": ["USER101"]
}
```

### Delete Comment

Deletes a comment from a credit note. Users can only delete their own comments.

**Request:**
```
DELETE /api/credit-notes/:creditNoteId/comments/:commentId
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note
- `commentId`: The unique identifier of the comment

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

**Example:**
```
DELETE /api/credit-notes/CN-2401-0001/comments/CMT-001
```

## Error Responses

### Common Error Responses

```typescript
// Not Found Error
{
  "error": "NotFoundError",
  "message": "Comment not found",
  "details": {
    "creditNoteId": "CN-2401-0001",
    "commentId": "CMT-999"
  }
}

// Validation Error
{
  "error": "ValidationError",
  "message": "Invalid request data",
  "details": {
    "fields": [
      {
        "field": "content",
        "message": "Content is required"
      }
    ]
  }
}

// Permission Error
{
  "error": "PermissionError",
  "message": "You do not have permission to update this comment",
  "details": {
    "commentId": "CMT-001",
    "commentUserId": "USER456",
    "currentUserId": "USER789"
  }
}

// Attachment Error
{
  "error": "AttachmentError",
  "message": "Failed to process attachment",
  "details": {
    "fileName": "large_file.pdf",
    "reason": "File size exceeds maximum allowed size"
  }
}
```

## Related Documentation

- [Credit Note API Overview](./CN-API-Endpoints-Overview.md)
- [Credit Note API - Core Operations](./CN-API-Endpoints-Core.md)
- [Credit Note API - Financial Operations](./CN-API-Endpoints-Financial.md)
- [Credit Note API - Item Operations](./CN-API-Endpoints-Items.md)
- [Credit Note API - Attachment Operations](./CN-API-Endpoints-Attachments.md)
- [Credit Note API - Inventory Operations](./CN-API-Endpoints-Inventory.md) 