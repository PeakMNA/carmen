# Inventory Adjustment API - Core Endpoints

**Document Status:** Draft  
**Last Updated:** March 27, 2024

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Table of Contents

1. [Introduction](#1-introduction)
2. [Data Models](#2-data-models)
3. [Endpoints](#3-endpoints)
4. [Error Responses](#4-error-responses)
5. [Related Documentation](#5-related-documentation)

## 1. Introduction

This document details the core API endpoints for the Inventory Adjustment module within the Carmen F&B Management System. These endpoints provide CRUD operations and status transitions for inventory adjustments.

## 2. Data Models

### 2.1 Inventory Adjustment

```typescript
interface InventoryAdjustment {
  id: string;                   // Unique identifier (e.g., "ADJ-2401-0001")
  date: string;                 // ISO 8601 format (e.g., "2024-03-27T10:00:00Z")
  type: "IN" | "OUT";           // Adjustment type
  status: "Draft" | "Posted" | "Void"; // Adjustment status
  location: {                   // Location information
    id: string;                 // Location ID
    code: string;               // Location code
    name: string;               // Location name
  };
  reason: {                     // Reason information
    id: string;                 // Reason ID
    code: string;               // Reason code
    description: string;        // Reason description
  };
  description: string;          // Adjustment description
  department: {                 // Department information
    id: string;                 // Department ID
    code: string;               // Department code
    name: string;               // Department name
  };
  items: AdjustmentItem[];      // Array of adjustment items
  totals: {                     // Adjustment totals
    inQty: number;              // Total IN quantity
    outQty: number;             // Total OUT quantity
    totalCost: number;          // Total cost impact
  };
  documents: DocumentInfo[];    // Array of attached documents
  createdBy: {                  // Creator information
    id: string;                 // User ID
    username: string;           // Username
    name: string;               // Full name
  };
  createdAt: string;            // ISO 8601 format
  modifiedBy?: {                // Modifier information (optional)
    id: string;                 // User ID
    username: string;           // Username
    name: string;               // Full name
  };
  modifiedAt?: string;          // ISO 8601 format (optional)
  postedBy?: {                  // Poster information (optional)
    id: string;                 // User ID
    username: string;           // Username
    name: string;               // Full name
  };
  postedAt?: string;            // ISO 8601 format (optional)
}
```

### 2.2 Adjustment Item

```typescript
interface AdjustmentItem {
  id: string;                   // Unique identifier
  product: {                    // Product information
    id: string;                 // Product ID
    code: string;               // Product code
    name: string;               // Product name
    description: string;        // Product description
    isLotTracked: boolean;      // Whether product is lot tracked
  };
  quantity: number;             // Adjustment quantity
  uom: {                        // Unit of measure
    id: string;                 // UOM ID
    code: string;               // UOM code
    name: string;               // UOM name
  };
  unitCost: number;             // Unit cost
  totalCost: number;            // Total cost (quantity * unitCost)
  currentStock: number;         // Current stock before adjustment
  adjustedStock: number;        // Stock after adjustment
  lots: AdjustmentLot[];        // Array of lots (for lot-tracked items)
  notes?: string;               // Additional notes (optional)
}
```

### 2.3 Adjustment Lot

```typescript
interface AdjustmentLot {
  id: string;                   // Unique identifier
  lotNumber: string;            // Lot number
  quantity: number;             // Lot quantity
  expiryDate?: string;          // ISO 8601 format (optional)
  manufacturingDate?: string;   // ISO 8601 format (optional)
  unitCost: number;             // Unit cost for this lot
  totalCost: number;            // Total cost for this lot
}
```

### 2.4 Document Info

```typescript
interface DocumentInfo {
  id: string;                   // Unique identifier
  filename: string;             // Original filename
  fileSize: number;             // File size in bytes
  mimeType: string;             // MIME type
  description?: string;         // Document description (optional)
  uploadedBy: {                 // Uploader information
    id: string;                 // User ID
    username: string;           // Username
    name: string;               // Full name
  };
  uploadedAt: string;           // ISO 8601 format
  url: string;                  // Download URL
}
```

## 3. Endpoints

### 3.1 List Adjustments

Retrieves a paginated list of inventory adjustments with optional filtering.

**Request:**

```
GET /inventory/adjustments
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| status | string | Filter by status (comma-separated) |
| type | string | Filter by type (IN, OUT) |
| location | string | Filter by location ID |
| reason | string | Filter by reason code |
| dateFrom | string | Filter by date range start (ISO 8601) |
| dateTo | string | Filter by date range end (ISO 8601) |
| search | string | Search term for text search |
| sort | string | Field to sort by (default: date) |
| order | string | Sort direction (asc, desc) (default: desc) |

**Response:**

```json
{
  "data": [
    {
      "id": "ADJ-2401-0001",
      "date": "2024-03-27T10:00:00Z",
      "type": "IN",
      "status": "Draft",
      "location": {
        "id": "LOC-001",
        "code": "WH-001",
        "name": "Main Warehouse"
      },
      "reason": {
        "id": "RSN-001",
        "code": "PHY-VAR",
        "description": "Physical Count Variance"
      },
      "description": "Adjustment based on monthly physical inventory count",
      "totals": {
        "inQty": 100,
        "outQty": 0,
        "totalCost": 1500.00
      },
      "createdBy": {
        "id": "USR-001",
        "username": "john.doe",
        "name": "John Doe"
      },
      "createdAt": "2024-03-27T09:30:00Z"
    },
    // Additional adjustments...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 42,
    "totalPages": 3
  }
}
```

### 3.2 Get Adjustment by ID

Retrieves a specific inventory adjustment by its ID.

**Request:**

```
GET /inventory/adjustments/{id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Adjustment ID |

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| include | string | Related data to include (comma-separated: items, lots, documents) |

**Response:**

```json
{
  "data": {
    "id": "ADJ-2401-0001",
    "date": "2024-03-27T10:00:00Z",
    "type": "IN",
    "status": "Draft",
    "location": {
      "id": "LOC-001",
      "code": "WH-001",
      "name": "Main Warehouse"
    },
    "reason": {
      "id": "RSN-001",
      "code": "PHY-VAR",
      "description": "Physical Count Variance"
    },
    "description": "Adjustment based on monthly physical inventory count",
    "department": {
      "id": "DEP-001",
      "code": "WH",
      "name": "Warehouse"
    },
    "items": [
      {
        "id": "ADJITM-001",
        "product": {
          "id": "PRD-001",
          "code": "RICE-001",
          "name": "Jasmine Rice",
          "description": "Premium Jasmine Rice",
          "isLotTracked": true
        },
        "quantity": 50,
        "uom": {
          "id": "UOM-001",
          "code": "KG",
          "name": "Kilogram"
        },
        "unitCost": 10.00,
        "totalCost": 500.00,
        "currentStock": 200,
        "adjustedStock": 250,
        "lots": [
          {
            "id": "LOT-001",
            "lotNumber": "L2024-001",
            "quantity": 50,
            "expiryDate": "2024-12-31T00:00:00Z",
            "manufacturingDate": "2024-01-15T00:00:00Z",
            "unitCost": 10.00,
            "totalCost": 500.00
          }
        ]
      },
      // Additional items...
    ],
    "totals": {
      "inQty": 100,
      "outQty": 0,
      "totalCost": 1500.00
    },
    "documents": [
      {
        "id": "DOC-001",
        "filename": "physical_count_sheet.pdf",
        "fileSize": 1024000,
        "mimeType": "application/pdf",
        "description": "Physical count sheet",
        "uploadedBy": {
          "id": "USR-001",
          "username": "john.doe",
          "name": "John Doe"
        },
        "uploadedAt": "2024-03-27T09:35:00Z",
        "url": "https://api.carmenfb.com/v1/documents/DOC-001"
      }
    ],
    "createdBy": {
      "id": "USR-001",
      "username": "john.doe",
      "name": "John Doe"
    },
    "createdAt": "2024-03-27T09:30:00Z"
  }
}
```

### 3.3 Create Adjustment

Creates a new inventory adjustment.

**Request:**

```
POST /inventory/adjustments
```

**Request Body:**

```json
{
  "date": "2024-03-27T10:00:00Z",
  "type": "IN",
  "locationId": "LOC-001",
  "reasonId": "RSN-001",
  "description": "Adjustment based on monthly physical inventory count",
  "departmentId": "DEP-001",
  "items": [
    {
      "productId": "PRD-001",
      "quantity": 50,
      "uomId": "UOM-001",
      "unitCost": 10.00,
      "notes": "Found extra stock during count",
      "lots": [
        {
          "lotNumber": "L2024-001",
          "quantity": 50,
          "expiryDate": "2024-12-31T00:00:00Z",
          "manufacturingDate": "2024-01-15T00:00:00Z"
        }
      ]
    },
    // Additional items...
  ]
}
```

**Response:**

```json
{
  "data": {
    "id": "ADJ-2401-0001",
    "date": "2024-03-27T10:00:00Z",
    "type": "IN",
    "status": "Draft",
    // Other fields as in Get Adjustment response...
  }
}
```

### 3.4 Update Adjustment

Updates an existing inventory adjustment.

**Request:**

```
PUT /inventory/adjustments/{id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Adjustment ID |

**Request Body:**

```json
{
  "date": "2024-03-27T10:00:00Z",
  "type": "IN",
  "locationId": "LOC-001",
  "reasonId": "RSN-001",
  "description": "Updated description for monthly physical inventory count",
  "departmentId": "DEP-001",
  "items": [
    // Updated items...
  ]
}
```

**Response:**

```json
{
  "data": {
    "id": "ADJ-2401-0001",
    "date": "2024-03-27T10:00:00Z",
    "type": "IN",
    "status": "Draft",
    // Other updated fields...
  }
}
```

### 3.5 Delete Adjustment

Deletes a draft inventory adjustment.

**Request:**

```
DELETE /inventory/adjustments/{id}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Adjustment ID |

**Response:**

```json
{
  "success": true,
  "message": "Adjustment successfully deleted"
}
```

### 3.6 Post Adjustment

Posts an adjustment to update inventory.

**Request:**

```
POST /inventory/adjustments/{id}/post
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Adjustment ID |

**Response:**

```json
{
  "success": true,
  "message": "Adjustment successfully posted",
  "data": {
    "id": "ADJ-2401-0001",
    "status": "Posted",
    "postedBy": {
      "id": "USR-001",
      "username": "john.doe",
      "name": "John Doe"
    },
    "postedAt": "2024-03-27T11:15:00Z"
  }
}
```

### 3.7 Void Adjustment

Voids a posted adjustment.

**Request:**

```
POST /inventory/adjustments/{id}/void
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Adjustment ID |

**Request Body:**

```json
{
  "reason": "Adjustment created in error"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Adjustment successfully voided",
  "data": {
    "id": "ADJ-2401-0001",
    "status": "Void"
  }
}
```

## 4. Error Responses

### 4.1 Validation Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "date",
        "message": "Date cannot be in the future"
      },
      {
        "field": "items",
        "message": "At least one item is required"
      }
    ]
  }
}
```

### 4.2 Not Found Error

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Adjustment not found",
    "details": {
      "id": "ADJ-2401-0999"
    }
  }
}
```

### 4.3 Business Rule Violation

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Cannot post adjustment",
    "details": {
      "rule": "ADJ_PRC_001",
      "message": "Negative stock balance is not allowed"
    }
  }
}
```

### 4.4 Status Transition Error

```json
{
  "error": {
    "code": "STATUS_TRANSITION_ERROR",
    "message": "Invalid status transition",
    "details": {
      "currentStatus": "Posted",
      "requestedAction": "post"
    }
  }
}
```

### 4.5 Permission Error

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Permission denied",
    "details": {
      "requiredPermission": "inventory.adjustment.post"
    }
  }
}
```

## 5. Related Documentation

- [INV-ADJ-API-Endpoints-Overview](./INV-ADJ-API-Endpoints-Overview.md)
- [INV-ADJ-API-Endpoints-Items](./INV-ADJ-API-Endpoints-Items.md)
- [INV-ADJ-API-Endpoints-Financial](./INV-ADJ-API-Endpoints-Financial.md)
- [INV-ADJ-API-Endpoints-Documents](./INV-ADJ-API-Endpoints-Documents.md)
- [INV-ADJ-API-Endpoints-Comments](./INV-ADJ-API-Endpoints-Comments.md) 