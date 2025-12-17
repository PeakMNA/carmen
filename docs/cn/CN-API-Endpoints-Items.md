# Credit Note API - Item Operations

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
  - [Get Credit Note Items](#get-credit-note-items)
  - [Get Credit Note Item by ID](#get-credit-note-item-by-id)
  - [Add Item to Credit Note](#add-item-to-credit-note)
  - [Update Credit Note Item](#update-credit-note-item)
  - [Remove Item from Credit Note](#remove-item-from-credit-note)
  - [Get Available Items for Return](#get-available-items-for-return)
- [Error Responses](#error-responses)
- [Related Documentation](#related-documentation)

## Introduction

This document describes the API endpoints for managing items within Credit Notes. These endpoints allow for adding, updating, and removing items from credit notes, as well as retrieving information about available items for return.

## Data Models

### CreditNoteItem

```typescript
interface CreditNoteItem {
  id: string
  creditNoteId: string
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
  createdAt: string
  updatedAt: string
}

type ItemCondition = 'Damaged' | 'Wrong Item' | 'Quality Issue' | 'Excess Quantity' | 'Other'
```

### AvailableItem

```typescript
interface AvailableItem {
  poItemId: string
  grnItemId?: string
  poRefNumber: string
  grnRefNumber?: string
  name: string
  description: string
  unit: string
  originalQuantity: number
  returnedQuantity: number
  availableQuantity: number
  price: number
  taxRate: number
  receiptDate?: string
  lotNumbers?: {
    lotNumber: string
    quantity: number
    expiryDate?: string
    manufacturingDate?: string
  }[]
  serialNumbers?: string[]
}
```

## Endpoints

### Get Credit Note Items

Retrieves all items associated with a credit note.

**Request:**
```
GET /api/credit-notes/:creditNoteId/items
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note

**Query Parameters:**
```typescript
{
  condition?: ItemCondition
  sortBy?: string
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}
```

**Response:**
```typescript
{
  data: CreditNoteItem[]
  total: number
  page: number
  limit: number
}
```

**Example:**
```
GET /api/credit-notes/CN-2401-0001/items?condition=Damaged
```

### Get Credit Note Item by ID

Retrieves a specific item from a credit note by its ID.

**Request:**
```
GET /api/credit-notes/:creditNoteId/items/:itemId
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note
- `itemId`: The unique identifier of the item

**Response:**
```typescript
CreditNoteItem
```

**Example:**
```
GET /api/credit-notes/CN-2401-0001/items/CNITEM-001
```

### Add Item to Credit Note

Adds a new item to an existing credit note. Only credit notes in 'Draft' status can have items added.

**Request:**
```
POST /api/credit-notes/:creditNoteId/items
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note

**Request Body:**
```typescript
{
  poItemId: string
  grnItemId?: string
  quantityReturned: number
  price: number
  reason: string
  condition: ItemCondition
  warehouseLocation?: string
  lotNumber?: string
  serialNumbers?: string[]
}
```

**Response:**
```typescript
CreditNoteItem
```

**Example Request:**
```json
POST /api/credit-notes/CN-2401-0001/items
{
  "poItemId": "POITEM-002",
  "grnItemId": "GRNITEM-002",
  "quantityReturned": 2,
  "price": 1500,
  "reason": "Wrong items received",
  "condition": "Wrong Item",
  "warehouseLocation": "RACK-B2",
  "lotNumber": "LOT-2401-0002",
  "serialNumbers": ["SN003", "SN004"]
}
```

### Update Credit Note Item

Updates an existing item in a credit note. Only credit notes in 'Draft' status can have items updated.

**Request:**
```
PUT /api/credit-notes/:creditNoteId/items/:itemId
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note
- `itemId`: The unique identifier of the item

**Request Body:**
```typescript
{
  quantityReturned?: number
  price?: number
  reason?: string
  condition?: ItemCondition
  warehouseLocation?: string
  lotNumber?: string
  serialNumbers?: string[]
}
```

**Response:**
```typescript
CreditNoteItem
```

**Example Request:**
```json
PUT /api/credit-notes/CN-2401-0001/items/CNITEM-001
{
  "quantityReturned": 2,
  "reason": "Updated: Multiple laptops with physical damage",
  "serialNumbers": ["SN001", "SN005"]
}
```

### Remove Item from Credit Note

Removes an item from a credit note. Only credit notes in 'Draft' status can have items removed.

**Request:**
```
DELETE /api/credit-notes/:creditNoteId/items/:itemId
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note
- `itemId`: The unique identifier of the item

**Response:**
```typescript
{
  success: boolean
  message: string
}
```

**Example:**
```
DELETE /api/credit-notes/CN-2401-0001/items/CNITEM-002
```

### Get Available Items for Return

Retrieves a list of items available for return based on purchase order and/or goods received note.

**Request:**
```
GET /api/credit-notes/available-items
```

**Query Parameters:**
```typescript
{
  poId?: string
  grnId?: string
  itemName?: string
  includeReturnedItems?: boolean
  page?: number
  limit?: number
}
```

**Response:**
```typescript
{
  data: AvailableItem[]
  total: number
  page: number
  limit: number
}
```

**Example:**
```
GET /api/credit-notes/available-items?poId=PO-2401-0001&grnId=GRN-2401-0001
```

## Error Responses

### Common Error Responses

```typescript
// Not Found Error
{
  "error": "NotFoundError",
  "message": "Credit note item not found",
  "details": {
    "creditNoteId": "CN-2401-0001",
    "itemId": "CNITEM-999"
  }
}

// Validation Error
{
  "error": "ValidationError",
  "message": "Invalid request data",
  "details": {
    "fields": [
      {
        "field": "quantityReturned",
        "message": "Quantity must be greater than 0"
      }
    ]
  }
}

// Status Conflict Error
{
  "error": "StatusConflictError",
  "message": "Cannot modify items in current credit note status",
  "details": {
    "creditNoteId": "CN-2401-0001",
    "currentStatus": "Completed",
    "allowedStatus": ["Draft"]
  }
}

// Quantity Error
{
  "error": "QuantityError",
  "message": "Requested return quantity exceeds available quantity",
  "details": {
    "poItemId": "POITEM-001",
    "requestedQuantity": 5,
    "availableQuantity": 3
  }
}
```

## Related Documentation

- [Credit Note API Overview](./CN-API-Endpoints-Overview.md)
- [Credit Note API - Core Operations](./CN-API-Endpoints-Core.md)
- [Credit Note API - Financial Operations](./CN-API-Endpoints-Financial.md)
- [Credit Note API - Attachment Operations](./CN-API-Endpoints-Attachments.md)
- [Credit Note API - Comment Operations](./CN-API-Endpoints-Comments.md)
- [Credit Note API - Inventory Operations](./CN-API-Endpoints-Inventory.md) 