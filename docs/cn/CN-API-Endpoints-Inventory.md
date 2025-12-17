# Credit Note API - Inventory Operations

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
  - [Get Returnable Inventory](#get-returnable-inventory)
  - [Process Return Inventory](#process-return-inventory)
  - [Process Reusable Return](#process-reusable-return)
  - [Process Scrap Inventory](#process-scrap-inventory)
  - [Get Stock Movement](#get-stock-movement)
- [Error Responses](#error-responses)
- [Related Documentation](#related-documentation)

## Introduction

This document describes the API endpoints for managing inventory operations related to Credit Notes. These endpoints allow for processing returns, managing returnable inventory, and tracking stock movements.

## Data Models

### ReturnableInventory

```typescript
interface ReturnableInventory {
  itemId: string
  itemName: string
  returnableInventory: {
    lotNumber: string
    receiptDate: string
    manufacturingDate?: string
    lotExpiryDate?: string
    originalQuantity: number
    returnedQuantity: number
    availableQuantity: number
    unitCost: number
    serialNumbers?: string[]
    daysFromReceipt: number
    isWithinReturnPeriod: boolean
    returnPeriodDetails: {
      allowedDays: number
      remainingDays: number
      returnDeadline: string
    }
    lotDetails?: {
      remainingShelfLife: string
      shelfLifeStatus: string
      qualityStatus: string
    }
  }[]
  summary: {
    totalReturnableQuantity: number
    totalReturnValue: number
    averageCost: number
    lotAnalysis: {
      totalLots: number
      expiringWithin30Days: number
      expiringWithin90Days: number
      expiringBeyond90Days: number
    }
  }
}
```

### InventoryTransaction

```typescript
interface InventoryTransaction {
  transactionId: string
  itemId: string
  lotNumber: string
  quantityReturned: number
  unitCost: number
  totalCost: number
  adjustmentAmount: number
  newStockQuantity: number
  inventoryImpact: {
    originalLocation: {
      locationId: string
      previousQuantity: number
      newQuantity: number
      adjustment: number
    }
    newLocation?: {
      locationId: string
      previousQuantity: number
      newQuantity: number
      adjustment: number
    }
    disposalDetails?: {
      method: string
      reason: string
      disposalReference: string
    }
    qualityCheck?: {
      status: string
      checklistId: string
      assignedTo: string
    }
    lotDetails?: {
      manufacturingDate: string
      lotExpiryDate: string
      remainingShelfLife: string
    }
  }
}
```

### StockMovement

```typescript
interface StockMovement {
  id: string
  creditNoteId: string
  creditNoteItemId: string
  transactionType: 'Return' | 'Scrap' | 'Reusable'
  itemId: string
  itemName: string
  lotNumber: string
  fromLocation: string
  toLocation?: string
  quantity: number
  unitCost: number
  totalCost: number
  transactionDate: string
  referenceNumber: string
  createdBy: {
    id: string
    name: string
  }
  createdAt: string
}
```

## Endpoints

### Get Returnable Inventory

Retrieves a list of inventory items available for return based on purchase order and/or goods received note.

**Request:**
```
GET /api/credit-notes/returnable-inventory
```

**Query Parameters:**
```typescript
{
  poId?: string
  grnId?: string
  itemId?: string
  includeExpired?: boolean
  includeOutOfReturnPeriod?: boolean
  page?: number
  limit?: number
}
```

**Response:**
```typescript
{
  data: ReturnableInventory[]
  total: number
  page: number
  limit: number
}
```

**Example:**
```
GET /api/credit-notes/returnable-inventory?poId=PO-2401-0001&itemId=ITEM-001
```

### Process Return Inventory

Processes a return inventory transaction for a credit note item.

**Request:**
```
POST /api/credit-notes/:creditNoteId/items/:itemId/inventory/return
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note
- `itemId`: The unique identifier of the credit note item

**Request Body:**
```typescript
{
  locationId: string
  quantity: number
  returnCondition: string
  lotNumber: string
  serialNumbers?: string[]
  valuationMethod: 'FIFO' | 'Average'
  isReusable: boolean
  returnReason: string
  disposalMethod?: string
  manufacturingDate?: string
  lotExpiryDate?: string
}
```

**Response:**
```typescript
InventoryTransaction
```

**Example Request:**
```json
POST /api/credit-notes/CN-2401-0001/items/CNITEM-001/inventory/return
{
  "locationId": "LOC-001",
  "quantity": 1,
  "returnCondition": "Damaged",
  "lotNumber": "LOT-2401-0001",
  "serialNumbers": ["SN001"],
  "valuationMethod": "FIFO",
  "isReusable": false,
  "returnReason": "Physical damage",
  "disposalMethod": "Scrap",
  "manufacturingDate": "2024-01-15T00:00:00Z",
  "lotExpiryDate": "2025-01-15T00:00:00Z"
}
```

### Process Reusable Return

Processes a reusable return inventory transaction for a credit note item.

**Request:**
```
POST /api/credit-notes/:creditNoteId/items/:itemId/inventory/reusable-return
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note
- `itemId`: The unique identifier of the credit note item

**Request Body:**
```typescript
{
  locationId: string
  quantity: number
  returnCondition: string
  lotNumber: string
  serialNumbers?: string[]
  valuationMethod: 'FIFO' | 'Average'
  newLocationId: string
  qualityCheckRequired: boolean
  manufacturingDate?: string
  lotExpiryDate?: string
}
```

**Response:**
```typescript
InventoryTransaction
```

**Example Request:**
```json
POST /api/credit-notes/CN-2401-0001/items/CNITEM-002/inventory/reusable-return
{
  "locationId": "LOC-001",
  "quantity": 1,
  "returnCondition": "Good",
  "lotNumber": "LOT-2401-0001",
  "serialNumbers": ["SN002"],
  "valuationMethod": "FIFO",
  "newLocationId": "LOC-002",
  "qualityCheckRequired": true,
  "manufacturingDate": "2024-01-15T00:00:00Z",
  "lotExpiryDate": "2025-01-15T00:00:00Z"
}
```

### Process Scrap Inventory

Processes a scrap inventory transaction for a credit note item.

**Request:**
```
POST /api/credit-notes/:creditNoteId/items/:itemId/inventory/scrap
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note
- `itemId`: The unique identifier of the credit note item

**Request Body:**
```typescript
{
  locationId: string
  quantity: number
  reason: string
  disposalMethod: string
  disposalDate: string
  disposalNotes?: string
  attachments?: {
    fileName: string
    fileType: string
    fileContent: string // Base64 encoded file content
  }[]
}
```

**Response:**
```typescript
{
  transactionId: string
  disposalReference: string
  itemDetails: {
    itemId: string
    quantity: number
    disposalValue: number
  }
  disposalDetails: {
    method: string
    facility?: string
    certificateNumber?: string
    disposalDate: string
  }
  inventoryImpact: {
    locationId: string
    previousQuantity: number
    newQuantity: number
    adjustment: number
    valueAdjustment: number
  }
  accountingEntries: {
    debit: {
      account: string
      amount: number
    }
    credit: {
      account: string
      amount: number
    }
  }
}
```

**Example Request:**
```json
POST /api/credit-notes/CN-2401-0001/items/CNITEM-001/inventory/scrap
{
  "locationId": "LOC-001",
  "quantity": 1,
  "reason": "Unrepairable damage",
  "disposalMethod": "Electronic Waste",
  "disposalDate": "2024-03-27T10:00:00Z",
  "disposalNotes": "Sent to certified e-waste facility",
  "attachments": [
    {
      "fileName": "disposal_certificate.pdf",
      "fileType": "application/pdf",
      "fileContent": "base64_encoded_content..."
    }
  ]
}
```

### Get Stock Movement

Retrieves stock movement records associated with a credit note.

**Request:**
```
GET /api/credit-notes/:creditNoteId/stock-movement
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note

**Query Parameters:**
```typescript
{
  itemId?: string
  transactionType?: 'Return' | 'Scrap' | 'Reusable'
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}
```

**Response:**
```typescript
{
  data: StockMovement[]
  total: number
  page: number
  limit: number
}
```

**Example:**
```
GET /api/credit-notes/CN-2401-0001/stock-movement?transactionType=Return
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

// Invalid Lot Number Error
{
  "error": "InvalidLotNumberError",
  "message": "Lot number not found in original GRN",
  "details": {
    "lotNumber": "LOT-999",
    "grnId": "GRN-2401-0001"
  }
}

// Expired Lot Error
{
  "error": "ExpiredLotError",
  "message": "Cannot process return for expired lot",
  "details": {
    "lotNumber": "LOT-2401-0001",
    "lotExpiryDate": "2024-01-15T00:00:00Z",
    "currentDate": "2024-03-26T10:00:00Z"
  }
}

// Invalid Return Period Error
{
  "error": "InvalidReturnPeriodError",
  "message": "Item return period has expired",
  "details": {
    "lotNumber": "LOT-2401-0001",
    "receiptDate": "2024-03-26T10:00:00Z",
    "returnDeadline": "2024-04-25T10:00:00Z",
    "currentDate": "2024-05-01T10:00:00Z",
    "allowedDays": 30
  }
}

// Quantity Error
{
  "error": "QuantityError",
  "message": "Requested return quantity exceeds available quantity",
  "details": {
    "lotNumber": "LOT-2401-0001",
    "requestedQuantity": 5,
    "availableQuantity": 3
  }
}
```

## Related Documentation

- [Credit Note API Overview](./CN-API-Endpoints-Overview.md)
- [Credit Note API - Core Operations](./CN-API-Endpoints-Core.md)
- [Credit Note API - Financial Operations](./CN-API-Endpoints-Financial.md)
- [Credit Note API - Item Operations](./CN-API-Endpoints-Items.md)
- [Credit Note API - Attachment Operations](./CN-API-Endpoints-Attachments.md)
- [Credit Note API - Comment Operations](./CN-API-Endpoints-Comments.md) 