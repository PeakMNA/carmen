# Credit Note API - Attachment Operations

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
  - [Get Credit Note Attachments](#get-credit-note-attachments)
  - [Get Attachment by ID](#get-attachment-by-id)
  - [Upload Attachment](#upload-attachment)
  - [Download Attachment](#download-attachment)
  - [Delete Attachment](#delete-attachment)
- [Error Responses](#error-responses)
- [Related Documentation](#related-documentation)

## Introduction

This document describes the API endpoints for managing attachments associated with Credit Notes. These endpoints allow for uploading, downloading, and managing file attachments related to credit notes.

## Data Models

### Attachment

```typescript
interface Attachment {
  id: string
  creditNoteId: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
  uploadedBy: {
    id: string
    name: string
  }
  uploadedAt: string
  description?: string
  tags?: string[]
}
```

## Endpoints

### Get Credit Note Attachments

Retrieves all attachments associated with a credit note.

**Request:**
```
GET /api/credit-notes/:creditNoteId/attachments
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note

**Query Parameters:**
```typescript
{
  fileType?: string
  fileName?: string
  sortBy?: string
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}
```

**Response:**
```typescript
{
  data: Attachment[]
  total: number
  page: number
  limit: number
}
```

**Example:**
```
GET /api/credit-notes/CN-2401-0001/attachments?fileType=application/pdf
```

### Get Attachment by ID

Retrieves a specific attachment by its ID.

**Request:**
```
GET /api/credit-notes/:creditNoteId/attachments/:attachmentId
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note
- `attachmentId`: The unique identifier of the attachment

**Response:**
```typescript
Attachment
```

**Example:**
```
GET /api/credit-notes/CN-2401-0001/attachments/ATT-001
```

### Upload Attachment

Uploads a new attachment to a credit note.

**Request:**
```
POST /api/credit-notes/:creditNoteId/attachments
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note

**Request Body:**
```typescript
{
  fileName: string
  fileType: string
  fileContent: string // Base64 encoded file content
  description?: string
  tags?: string[]
}
```

**Response:**
```typescript
Attachment
```

**Example Request:**
```json
POST /api/credit-notes/CN-2401-0001/attachments
{
  "fileName": "damage_evidence.pdf",
  "fileType": "application/pdf",
  "fileContent": "base64_encoded_content...",
  "description": "Photos showing physical damage on laptop",
  "tags": ["evidence", "damage"]
}
```

### Download Attachment

Downloads an attachment file.

**Request:**
```
GET /api/credit-notes/:creditNoteId/attachments/:attachmentId/download
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note
- `attachmentId`: The unique identifier of the attachment

**Response:**
Binary file content with appropriate Content-Type header

**Example:**
```
GET /api/credit-notes/CN-2401-0001/attachments/ATT-001/download
```

### Delete Attachment

Deletes an attachment from a credit note.

**Request:**
```
DELETE /api/credit-notes/:creditNoteId/attachments/:attachmentId
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note
- `attachmentId`: The unique identifier of the attachment

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

**Example:**
```
DELETE /api/credit-notes/CN-2401-0001/attachments/ATT-001
```

## Error Responses

### Common Error Responses

```typescript
// Not Found Error
{
  "error": "NotFoundError",
  "message": "Attachment not found",
  "details": {
    "creditNoteId": "CN-2401-0001",
    "attachmentId": "ATT-999"
  }
}

// Validation Error
{
  "error": "ValidationError",
  "message": "Invalid request data",
  "details": {
    "fields": [
      {
        "field": "fileContent",
        "message": "File content is required"
      }
    ]
  }
}

// File Size Error
{
  "error": "FileSizeError",
  "message": "File size exceeds maximum allowed size",
  "details": {
    "fileName": "large_file.pdf",
    "fileSize": 15000000,
    "maxAllowedSize": 10000000
  }
}

// File Type Error
{
  "error": "FileTypeError",
  "message": "File type not allowed",
  "details": {
    "fileName": "script.exe",
    "fileType": "application/x-msdownload",
    "allowedTypes": ["application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
  }
}
```

## Related Documentation

- [Credit Note API Overview](./CN-API-Endpoints-Overview.md)
- [Credit Note API - Core Operations](./CN-API-Endpoints-Core.md)
- [Credit Note API - Financial Operations](./CN-API-Endpoints-Financial.md)
- [Credit Note API - Item Operations](./CN-API-Endpoints-Items.md)
- [Credit Note API - Comment Operations](./CN-API-Endpoints-Comments.md)
- [Credit Note API - Inventory Operations](./CN-API-Endpoints-Inventory.md) 