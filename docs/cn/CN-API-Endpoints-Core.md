# Credit Note API - Core Operations

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
  - [Get Credit Notes](#get-credit-notes)
  - [Get Credit Note by ID](#get-credit-note-by-id)
  - [Create Credit Note](#create-credit-note)
  - [Update Credit Note](#update-credit-note)
  - [Delete Credit Note](#delete-credit-note)
  - [Cancel Credit Note](#cancel-credit-note)
- [Error Responses](#error-responses)
- [Related Documentation](#related-documentation)

## Introduction

This document describes the core API endpoints for managing Credit Notes. These endpoints provide basic CRUD (Create, Read, Update, Delete) operations for credit notes in the system.

## Data Models

### CreditNote

```typescript
interface CreditNote {
  id: string
  refNumber: string
  date: string
  poId: string
  poRefNumber: string
  grnId?: string
  grnRefNumber?: string
  status: CreditNoteStatus
  type: CreditNoteType
  reason: string
  location: string
  department: string
  vendor: string
  vendorId: number
  requestedBy: {
    id: string
    name: string
    department: string
  }
  currency: string
  baseCurrencyCode: string
  exchangeRate: number
  items: CreditNoteItem[]
  attachments: Attachment[]
  comments: Comment[]
  totalQuantity: number
  baseSubTotalAmount: number
  subTotalAmount: number
  baseTaxAmount: number
  taxAmount: number
  baseTotalAmount: number
  totalAmount: number
  createdAt: string
  updatedAt: string
}

type CreditNoteStatus = 'Draft' | 'Cancelled' | 'Completed'
type CreditNoteType = 'Return' | 'Price Adjustment' | 'Quality Issue' | 'Quantity Discrepancy'
```

### CreditNoteItem

```typescript
interface CreditNoteItem {
  id: string
  poItemId: string
  grnItemId?: string
  name: string
  description: string
  unit: string
  quantityReturned: number
  price: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  reason: string
  condition: ItemCondition
  location: string
  warehouseLocation?: string
}

type ItemCondition = 'Damaged' | 'Wrong Item' | 'Quality Issue' | 'Excess Quantity' | 'Other'
```

## Endpoints

### Get Credit Notes

Retrieves a list of credit notes based on the provided filters.

**Request:**
```
GET /api/credit-notes
```

**Query Parameters:**
```typescript
{
  status?: CreditNoteStatus
  poId?: string
  grnId?: string
  department?: string
  fromDate?: string
  toDate?: string
  vendor?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}
```

**Response:**
```typescript
{
  data: CreditNote[]
  total: number
  page: number
  limit: number
}
```

**Example:**
```
GET /api/credit-notes?status=Draft&fromDate=2024-01-01&toDate=2024-03-31&page=1&limit=10
```

### Get Credit Note by ID

Retrieves a specific credit note by its ID.

**Request:**
```
GET /api/credit-notes/:id
```

**Path Parameters:**
- `id`: The unique identifier of the credit note

**Response:**
```typescript
CreditNote
```

**Example:**
```
GET /api/credit-notes/CN-2401-0001
```

### Create Credit Note

Creates a new credit note.

**Request:**
```
POST /api/credit-notes
```

**Request Body:**
```typescript
{
  poId: string
  grnId?: string
  type: CreditNoteType
  reason: string
  date: string
  location: string
  items: {
    poItemId: string
    grnItemId?: string
    quantityReturned: number
    price: number
    reason: string
    condition: ItemCondition
    warehouseLocation?: string
  }[]
  attachments?: {
    fileName: string
    fileType: string
    fileContent: Base64String
  }[]
}
```

**Response:**
```typescript
CreditNote
```

**Example Request:**
```json
POST /api/credit-notes
{
  "poId": "PO-2401-0001",
  "grnId": "GRN-2401-0001",
  "type": "Quality Issue",
  "reason": "Received items with physical damage",
  "date": "2024-03-26T10:00:00Z",
  "location": "HQ",
  "items": [
    {
      "poItemId": "POITEM-001",
      "grnItemId": "GRNITEM-001",
      "quantityReturned": 1,
      "price": 22500,
      "reason": "Physical damage on laptop",
      "condition": "Damaged",
      "warehouseLocation": "RACK-A1"
    }
  ],
  "attachments": [
    {
      "fileName": "damage_evidence.pdf",
      "fileType": "application/pdf",
      "fileContent": "base64_encoded_content..."
    }
  ]
}
```

### Update Credit Note

Updates an existing credit note. Only credit notes in 'Draft' status can be updated.

**Request:**
```
PUT /api/credit-notes/:id
```

**Path Parameters:**
- `id`: The unique identifier of the credit note

**Request Body:**
```typescript
{
  type?: CreditNoteType
  reason?: string
  date?: string
  location?: string
  items?: {
    id?: string // If provided, updates existing item
    poItemId: string
    grnItemId?: string
    quantityReturned: number
    price: number
    reason: string
    condition: ItemCondition
    warehouseLocation?: string
  }[]
  removeItems?: string[] // Array of item IDs to remove
}
```

**Response:**
```typescript
CreditNote
```

### Delete Credit Note

Deletes a credit note. Only credit notes in 'Draft' status can be deleted.

**Request:**
```
DELETE /api/credit-notes/:id
```

**Path Parameters:**
- `id`: The unique identifier of the credit note

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

### Cancel Credit Note

Cancels a credit note. This is different from deletion as it keeps a record of the credit note but marks it as cancelled.

**Request:**
```
POST /api/credit-notes/:id/cancel
```

**Path Parameters:**
- `id`: The unique identifier of the credit note

**Request Body:**
```typescript
{
  reason: string
}
```

**Response:**
```typescript
{
  id: string
  status: 'Cancelled'
  cancelledAt: string
  cancelReason: string
}
```

## Error Responses

### Common Error Responses

```typescript
// Not Found Error
{
  "error": "NotFoundError",
  "message": "Credit note not found",
  "details": {
    "id": "CN-2401-0999"
  }
}

// Validation Error
{
  "error": "ValidationError",
  "message": "Invalid request data",
  "details": {
    "fields": [
      {
        "field": "items",
        "message": "At least one item is required"
      }
    ]
  }
}

// Status Conflict Error
{
  "error": "StatusConflictError",
  "message": "Cannot update credit note in current status",
  "details": {
    "id": "CN-2401-0001",
    "currentStatus": "Completed",
    "allowedStatus": ["Draft"]
  }
}
```

## Related Documentation

- [Credit Note API Overview](./CN-API-Endpoints-Overview.md)
- [Credit Note API - Financial Operations](./CN-API-Endpoints-Financial.md)
- [Credit Note API - Item Operations](./CN-API-Endpoints-Items.md)
- [Credit Note API - Attachment Operations](./CN-API-Endpoints-Attachments.md)
- [Credit Note API - Comment Operations](./CN-API-Endpoints-Comments.md)
- [Credit Note API - Inventory Operations](./CN-API-Endpoints-Inventory.md) 