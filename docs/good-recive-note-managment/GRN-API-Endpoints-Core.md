# Goods Received Note Module - API Core Endpoints

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
> **Document Status**: Content Migration Complete (Phase 2)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 3 - Content Review and Refinement

> **Note**: This is a consolidated document that combines content from:
> - grn-api-sp.md (API Endpoints - Core Operations)

## Table of Contents
1. [Introduction](#introduction)
2. [GRN Resource](#grn-resource)
3. [List GRNs](#list-grns)
4. [Create GRN](#create-grn)
5. [Get GRN by ID](#get-grn-by-id)
6. [Update GRN](#update-grn)
7. [Delete GRN](#delete-grn)
8. [Related Documentation](#related-documentation)

## Introduction

This document provides detailed specifications for the core API endpoints of the Goods Received Note (GRN) module. These endpoints allow clients to perform basic CRUD (Create, Read, Update, Delete) operations on GRNs.

## GRN Resource

The GRN resource represents a Goods Received Note in the system. It contains information about received goods, including references to purchase orders, vendors, items, and more.

### GRN Resource Structure

```typescript
interface GoodsReceivedNote {
  id: string                    // UUID primary key
  grnNumber: string             // System-generated GRN number
  poId?: string                 // Reference to Purchase Order (optional)
  vendorId: string              // Reference to Vendor
  departmentId: string          // Reference to Department
  locationId: string            // Reference to Location
  status: GRNStatus             // Enum: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED
  receiptDate: Date             // Date when goods were received
  documentDate: Date            // Date of GRN document creation
  referenceNumber?: string      // External reference number (e.g., delivery note)
  currencyCode: string          // 3-letter ISO currency code
  exchangeRate: number          // Exchange rate to base currency
  subtotal: number              // Sum of all item subtotals
  discountAmount: number        // Total discount amount
  taxAmount: number             // Total tax amount
  extraCostsTotal: number       // Sum of all extra costs
  total: number                 // Final total amount
  notes?: string                // General notes
  createdBy: string             // User who created the GRN
  createdAt: Date               // Creation timestamp
  updatedBy?: string            // User who last updated the GRN
  updatedAt?: Date              // Last update timestamp
  approvedBy?: string           // User who approved the GRN
  approvedAt?: Date             // Approval timestamp
  items: GRNItem[]              // Line items
  extraCosts: GRNExtraCost[]    // Additional costs
  journalEntries: JournalEntry[] // Financial journal entries
  taxEntries: TaxEntry[]        // Tax breakdown entries
  attachments: Attachment[]     // Document attachments
  comments: Comment[]           // User comments
  activityLogs: ActivityLog[]   // Audit trail
}

enum GRNStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}
```

## List GRNs

Retrieves a paginated list of GRNs based on the provided filters.

### Request

```
GET /api/grns
```

### Query Parameters

| Parameter    | Type     | Required | Description                                      |
|--------------|----------|----------|--------------------------------------------------|
| status       | string   | No       | Filter by GRN status                             |
| poId         | string   | No       | Filter by Purchase Order ID                      |
| departmentId | string   | No       | Filter by Department ID                          |
| fromDate     | string   | No       | Filter by receipt date (from) - ISO 8601 format  |
| toDate       | string   | No       | Filter by receipt date (to) - ISO 8601 format    |
| vendorId     | string   | No       | Filter by Vendor ID                              |
| page         | number   | No       | Page number (default: 1)                         |
| limit        | number   | No       | Items per page (default: 20, max: 100)           |
| sortBy       | string   | No       | Field to sort by (default: 'createdAt')          |
| order        | string   | No       | Sort order: 'asc' or 'desc' (default: 'desc')    |

### Response

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "grnNumber": "GRN-2401-0001",
      "poId": "123e4567-e89b-12d3-a456-426614174001",
      "vendorId": "123e4567-e89b-12d3-a456-426614174002",
      "departmentId": "123e4567-e89b-12d3-a456-426614174003",
      "locationId": "123e4567-e89b-12d3-a456-426614174004",
      "status": "APPROVED",
      "receiptDate": "2024-03-15T00:00:00Z",
      "documentDate": "2024-03-15T00:00:00Z",
      "referenceNumber": "DN-12345",
      "currencyCode": "USD",
      "exchangeRate": 1,
      "subtotal": 1000.00,
      "discountAmount": 100.00,
      "taxAmount": 90.00,
      "extraCostsTotal": 50.00,
      "total": 1040.00,
      "notes": "Received in good condition",
      "createdBy": "john.doe@example.com",
      "createdAt": "2024-03-15T10:30:00Z",
      "updatedBy": "jane.smith@example.com",
      "updatedAt": "2024-03-15T14:45:00Z",
      "approvedBy": "jane.smith@example.com",
      "approvedAt": "2024-03-15T15:00:00Z"
    },
    // More GRNs...
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "pages": 3
  }
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST      | Invalid query parameters                         |
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |

## Create GRN

Creates a new GRN in the system.

### Request

```
POST /api/grns
```

### Request Body

```json
{
  "poId": "123e4567-e89b-12d3-a456-426614174001",
  "vendorId": "123e4567-e89b-12d3-a456-426614174002",
  "departmentId": "123e4567-e89b-12d3-a456-426614174003",
  "locationId": "123e4567-e89b-12d3-a456-426614174004",
  "receiptDate": "2024-03-15T00:00:00Z",
  "documentDate": "2024-03-15T00:00:00Z",
  "referenceNumber": "DN-12345",
  "currencyCode": "USD",
  "exchangeRate": 1,
  "notes": "Received in good condition",
  "items": [
    {
      "poItemId": "123e4567-e89b-12d3-a456-426614174005",
      "productId": "123e4567-e89b-12d3-a456-426614174006",
      "description": "Product A",
      "uomId": "123e4567-e89b-12d3-a456-426614174007",
      "receivedQuantity": 10,
      "unitPrice": 100.00,
      "discountRate": 10,
      "taxRate": 10,
      "notes": "Item notes",
      "lotNumber": "LOT-12345",
      "expiryDate": "2025-03-15T00:00:00Z",
      "manufacturingDate": "2024-02-15T00:00:00Z",
      "locationId": "123e4567-e89b-12d3-a456-426614174008"
    }
  ],
  "extraCosts": [
    {
      "costTypeId": "123e4567-e89b-12d3-a456-426614174009",
      "description": "Freight",
      "amount": 50.00,
      "taxRate": 10,
      "allocationMethod": "BY_VALUE",
      "notes": "Shipping from vendor warehouse"
    }
  ]
}
```

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "grnNumber": "GRN-2401-0001",
  "status": "DRAFT",
  "createdBy": "john.doe@example.com",
  "createdAt": "2024-03-15T10:30:00Z",
  // Full GRN object as described in the GRN Resource Structure
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST      | Invalid request body                             |
| 400         | VALIDATION_ERROR     | Validation errors in the request                 |
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | Referenced resource not found                    |
| 422         | BUSINESS_RULE_VIOLATION | Business rule violation                       |

## Get GRN by ID

Retrieves a specific GRN by its ID.

### Request

```
GET /api/grns/{id}
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Query Parameters

| Parameter | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| expand    | string | No       | Comma-separated list of related resources to expand (e.g., "items,vendor,journalEntries") |

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "grnNumber": "GRN-2401-0001",
  "poId": "123e4567-e89b-12d3-a456-426614174001",
  "vendorId": "123e4567-e89b-12d3-a456-426614174002",
  "departmentId": "123e4567-e89b-12d3-a456-426614174003",
  "locationId": "123e4567-e89b-12d3-a456-426614174004",
  "status": "APPROVED",
  "receiptDate": "2024-03-15T00:00:00Z",
  "documentDate": "2024-03-15T00:00:00Z",
  "referenceNumber": "DN-12345",
  "currencyCode": "USD",
  "exchangeRate": 1,
  "subtotal": 1000.00,
  "discountAmount": 100.00,
  "taxAmount": 90.00,
  "extraCostsTotal": 50.00,
  "total": 1040.00,
  "notes": "Received in good condition",
  "createdBy": "john.doe@example.com",
  "createdAt": "2024-03-15T10:30:00Z",
  "updatedBy": "jane.smith@example.com",
  "updatedAt": "2024-03-15T14:45:00Z",
  "approvedBy": "jane.smith@example.com",
  "approvedAt": "2024-03-15T15:00:00Z",
  "items": [
    // GRN items
  ],
  "extraCosts": [
    // Extra costs
  ],
  "journalEntries": [
    // Journal entries (if expanded)
  ],
  "taxEntries": [
    // Tax entries (if expanded)
  ],
  "attachments": [
    // Attachments (if expanded)
  ],
  "comments": [
    // Comments (if expanded)
  ],
  "activityLogs": [
    // Activity logs (if expanded)
  ]
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST      | Invalid request parameters                       |
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN not found                                    |

## Update GRN

Updates an existing GRN. Only GRNs in DRAFT status can be updated.

### Request

```
PUT /api/grns/{id}
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Request Body

```json
{
  "vendorId": "123e4567-e89b-12d3-a456-426614174002",
  "departmentId": "123e4567-e89b-12d3-a456-426614174003",
  "locationId": "123e4567-e89b-12d3-a456-426614174004",
  "receiptDate": "2024-03-15T00:00:00Z",
  "documentDate": "2024-03-15T00:00:00Z",
  "referenceNumber": "DN-12345-UPDATED",
  "currencyCode": "USD",
  "exchangeRate": 1,
  "notes": "Received in good condition - Updated notes"
}
```

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "grnNumber": "GRN-2401-0001",
  "status": "DRAFT",
  "updatedBy": "john.doe@example.com",
  "updatedAt": "2024-03-15T16:30:00Z",
  // Full updated GRN object
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST      | Invalid request body                             |
| 400         | VALIDATION_ERROR     | Validation errors in the request                 |
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN not found                                    |
| 409         | CONFLICT             | GRN is not in DRAFT status                       |
| 422         | BUSINESS_RULE_VIOLATION | Business rule violation                       |

## Delete GRN

Deletes a GRN. Only GRNs in DRAFT status can be deleted.

### Request

```
DELETE /api/grns/{id}
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Response

```json
{
  "success": true,
  "message": "GRN deleted successfully"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN not found                                    |
| 409         | CONFLICT             | GRN is not in DRAFT status                       |

## Related Documentation

For more information about the GRN API, please refer to the following documentation:

1. **API Overview**:
   - [GRN API Endpoints Overview](./GRN-API-Endpoints-Overview.md)
   - [GRN API Overview](./GRN-API-Overview.md)

2. **Other API Endpoints**:
   - [Workflow Operations](./GRN-API-Endpoints-Workflow.md)
   - [Financial Operations](./GRN-API-Endpoints-Financial.md)
   - [Item Operations](./GRN-API-Endpoints-Items.md)
   - [Attachment Operations](./GRN-API-Endpoints-Attachments.md)
   - [Comment Operations](./GRN-API-Endpoints-Comments.md) 