# Purchase Order Module - API Specification

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Core Endpoints](#core-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)

## Overview

The Purchase Order API provides comprehensive functionality for managing purchase orders within the Carmen Hospitality ERP system. This RESTful API supports the complete purchase order lifecycle from creation to fulfillment.

**Base URL:** `https://api.carmen-erp.com/v1`

**API Version:** v1.0

**Content Type:** `application/json`

## Authentication

All API requests require authentication using JWT tokens.

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Token Structure:**
```json
{
  "user_id": "12345",
  "role": "procurement_manager",
  "permissions": ["po:read", "po:write", "po:delete"],
  "business_unit": "BU001",
  "exp": 1640995200
}
```

## Core Endpoints

### Purchase Orders

#### List Purchase Orders
```http
GET /purchase-orders
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 50, max: 100)
- `status` (string): Filter by status
- `vendor_id` (integer): Filter by vendor
- `start_date` (string): Filter from date (YYYY-MM-DD)
- `end_date` (string): Filter to date (YYYY-MM-DD)
- `currency` (string): Filter by currency code
- `search` (string): Search in PO number, vendor name, description

**Response:**
```json
{
  "data": [
    {
      "po_id": "PO-2301-0001",
      "number": "PO-2301-0001",
      "vendor_id": 123,
      "vendor_name": "Office Supplies Inc.",
      "order_date": "2023-06-15",
      "delivery_date": "2023-06-30",
      "status": "Sent",
      "currency_code": "USD",
      "total_amount": 1250.00,
      "created_at": "2023-06-15T10:30:00Z",
      "updated_at": "2023-06-15T15:45:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 50,
    "total": 150,
    "total_pages": 3
  }
}
```

#### Get Purchase Order
```http
GET /purchase-orders/{po_id}
```

**Response:**
```json
{
  "po_id": "PO-2301-0001",
  "number": "PO-2301-0001",
  "vendor_id": 123,
  "vendor_name": "Office Supplies Inc.",
  "vendor_email": "orders@officesupplies.com",
  "order_date": "2023-06-15",
  "delivery_date": "2023-06-30",
  "status": "Sent",
  "currency_code": "USD",
  "base_currency_code": "USD",
  "exchange_rate": 1.0000,
  "credit_terms": "Net 30",
  "description": "Monthly office supplies order",
  "remarks": "Please deliver to reception",
  "items": [
    {
      "id": "item-001",
      "name": "Copy Paper A4",
      "description": "White copy paper, 80gsm, 500 sheets",
      "ordered_quantity": 10,
      "received_quantity": 0,
      "remaining_quantity": 10,
      "order_unit": "reams",
      "unit_price": 5.50,
      "tax_rate": 7.00,
      "discount_rate": 0.00,
      "sub_total_price": 55.00,
      "tax_amount": 3.85,
      "total_amount": 58.85,
      "status": "Open"
    }
  ],
  "financial_summary": {
    "sub_total_price": 1150.00,
    "discount_amount": 50.00,
    "net_amount": 1100.00,
    "tax_amount": 77.00,
    "total_amount": 1177.00
  },
  "activity_log": [
    {
      "id": "log-001",
      "action": "Created",
      "user_id": "user-123",
      "user_name": "John Doe",
      "timestamp": "2023-06-15T10:30:00Z",
      "description": "Purchase order created"
    }
  ]
}
```

#### Create Purchase Order
```http
POST /purchase-orders
```

**Request Body:**
```json
{
  "vendor_id": 123,
  "order_date": "2023-06-15",
  "delivery_date": "2023-06-30",
  "currency_code": "USD",
  "exchange_rate": 1.0000,
  "credit_terms": "Net 30",
  "description": "Monthly office supplies order",
  "remarks": "Please deliver to reception",
  "items": [
    {
      "name": "Copy Paper A4",
      "description": "White copy paper, 80gsm, 500 sheets",
      "ordered_quantity": 10,
      "order_unit": "reams",
      "unit_price": 5.50,
      "tax_rate": 7.00,
      "discount_rate": 0.00
    }
  ],
  "source_pr_ids": ["PR-2301-0001", "PR-2301-0002"]
}
```

**Response:**
```json
{
  "po_id": "PO-2301-0001",
  "number": "PO-2301-0001",
  "status": "Draft",
  "created_at": "2023-06-15T10:30:00Z",
  "message": "Purchase order created successfully"
}
```

#### Update Purchase Order
```http
PUT /purchase-orders/{po_id}
```

**Request Body:** (Same as create, with optional fields)

**Response:**
```json
{
  "po_id": "PO-2301-0001",
  "updated_at": "2023-06-15T15:45:00Z",
  "message": "Purchase order updated successfully"
}
```

#### Delete Purchase Order
```http
DELETE /purchase-orders/{po_id}
```

**Response:**
```json
{
  "message": "Purchase order deleted successfully",
  "deleted_at": "2023-06-15T16:00:00Z"
}
```

#### Update Purchase Order Status
```http
PATCH /purchase-orders/{po_id}/status
```

**Request Body:**
```json
{
  "status": "Sent",
  "reason": "Ready for vendor processing"
}
```

**Response:**
```json
{
  "po_id": "PO-2301-0001",
  "old_status": "Draft",
  "new_status": "Sent",
  "updated_at": "2023-06-15T15:45:00Z",
  "message": "Status updated successfully"
}
```

### Purchase Order Items

#### Add Item to Purchase Order
```http
POST /purchase-orders/{po_id}/items
```

**Request Body:**
```json
{
  "name": "Ballpoint Pens",
  "description": "Blue ink, pack of 10",
  "ordered_quantity": 5,
  "order_unit": "packs",
  "unit_price": 12.50,
  "tax_rate": 7.00,
  "discount_rate": 10.00
}
```

#### Update Purchase Order Item
```http
PUT /purchase-orders/{po_id}/items/{item_id}
```

#### Delete Purchase Order Item
```http
DELETE /purchase-orders/{po_id}/items/{item_id}
```

### Document Operations

#### Export Purchase Order
```http
GET /purchase-orders/{po_id}/export
```

**Query Parameters:**
- `format` (string): pdf|excel|csv
- `sections` (array): header,items,financial,vendor,comments

**Response:**
```json
{
  "download_url": "https://files.carmen-erp.com/exports/po-2023-001.pdf",
  "expires_at": "2023-06-15T18:00:00Z"
}
```

#### Email Purchase Order
```http
POST /purchase-orders/{po_id}/email
```

**Request Body:**
```json
{
  "to": "vendor@supplier.com",
  "cc": ["buyer@company.com"],
  "subject": "Purchase Order PO-2301-0001",
  "message": "Please find attached purchase order for processing.",
  "include_attachments": true
}
```

#### Get Related Documents
```http
GET /purchase-orders/{po_id}/related-documents
```

**Response:**
```json
{
  "grns": [
    {
      "grn_id": "GRN-2301-0001",
      "grn_number": "GRN-2301-0001",
      "received_date": "2023-06-20",
      "status": "Completed",
      "amount": 580.00
    }
  ],
  "invoices": [
    {
      "invoice_id": "INV-2301-0001",
      "invoice_number": "SUPP-001",
      "invoice_date": "2023-06-25",
      "amount": 1177.00,
      "status": "Paid"
    }
  ],
  "credit_notes": []
}
```

### Bulk Operations

#### Bulk Create Purchase Orders
```http
POST /purchase-orders/bulk-create
```

**Request Body:**
```json
{
  "source": "purchase_requests",
  "grouping": {
    "by_vendor": true,
    "by_currency": true
  },
  "purchase_request_ids": ["PR-2301-0001", "PR-2301-0002", "PR-2301-0003"]
}
```

**Response:**
```json
{
  "created_pos": [
    {
      "po_id": "PO-2301-0001",
      "vendor_name": "Office Supplies Inc.",
      "currency": "USD",
      "total_amount": 1177.00,
      "item_count": 5
    }
  ],
  "summary": {
    "total_pos_created": 2,
    "total_items_processed": 12,
    "processing_time": "2.3 seconds"
  }
}
```

#### Bulk Export
```http
POST /purchase-orders/bulk-export
```

**Request Body:**
```json
{
  "po_ids": ["PO-2301-0001", "PO-2301-0002"],
  "format": "pdf",
  "sections": ["header", "items", "financial"]
}
```

#### Bulk Status Update
```http
PATCH /purchase-orders/bulk-status
```

**Request Body:**
```json
{
  "po_ids": ["PO-2301-0001", "PO-2301-0002"],
  "status": "Sent",
  "reason": "Batch processing for vendor submission"
}
```

## Data Models

### Purchase Order
```typescript
interface PurchaseOrder {
  po_id: string
  number: string
  vendor_id: number
  vendor_name: string
  vendor_email?: string
  order_date: string
  delivery_date?: string
  status: PurchaseOrderStatus
  currency_code: string
  base_currency_code: string
  exchange_rate: number
  credit_terms?: string
  description?: string
  remarks?: string
  sub_total_price: number
  discount_amount: number
  net_amount: number
  tax_amount: number
  total_amount: number
  items: PurchaseOrderItem[]
  source_pr_ids?: string[]
  created_by: number
  created_at: string
  updated_at: string
  activity_log: ActivityLogEntry[]
}
```

### Purchase Order Item
```typescript
interface PurchaseOrderItem {
  id: string
  name: string
  description?: string
  ordered_quantity: number
  received_quantity: number
  remaining_quantity: number
  order_unit: string
  base_unit?: string
  conversion_factor?: number
  unit_price: number
  tax_rate: number
  discount_rate: number
  sub_total_price: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  status: ItemStatus
  source_pr_id?: string
  source_pr_item_id?: string
}
```

### Activity Log Entry
```typescript
interface ActivityLogEntry {
  id: string
  action: string
  user_id: string
  user_name: string
  activity_type: ActivityType
  description: string
  timestamp: string
  metadata?: object
}
```

### Enums

#### Purchase Order Status
```typescript
enum PurchaseOrderStatus {
  Draft = "Draft",
  Sent = "Sent",
  PartiallyReceived = "PartiallyReceived",
  FullyReceived = "FullyReceived",
  Closed = "Closed",
  Cancelled = "Cancelled",
  Voided = "Voided"
}
```

#### Item Status
```typescript
enum ItemStatus {
  Open = "Open",
  PartiallyReceived = "PartiallyReceived",
  FullyReceived = "FullyReceived",
  Cancelled = "Cancelled",
  Closed = "Closed"
}
```

#### Activity Type
```typescript
enum ActivityType {
  Creation = "Creation",
  StatusChange = "StatusChange",
  ItemModification = "ItemModification",
  DocumentGeneration = "DocumentGeneration",
  Communication = "Communication",
  SystemEvent = "SystemEvent"
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "vendor_id",
        "message": "Vendor ID is required"
      }
    ],
    "request_id": "req_123456789"
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Invalid or missing authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

### Business Logic Errors

| Code | Description |
|------|-------------|
| PO_ALREADY_SENT | Cannot modify sent purchase order |
| INVALID_STATUS_TRANSITION | Invalid status change |
| INSUFFICIENT_PERMISSIONS | User lacks required permissions |
| VENDOR_INACTIVE | Selected vendor is inactive |
| CURRENCY_NOT_SUPPORTED | Currency not supported |
| ITEM_ALREADY_RECEIVED | Cannot modify received items |

## Rate Limiting

**Standard Limits:**
- 1000 requests per hour per user
- 100 requests per minute per user
- 10 bulk operations per hour per user

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Available Events

| Event | Description |
|-------|-------------|
| po.created | Purchase order created |
| po.updated | Purchase order updated |
| po.status_changed | Status changed |
| po.item_added | Item added to PO |
| po.item_updated | Item updated |
| po.sent | PO sent to vendor |
| po.received | Items received |

### Webhook Payload
```json
{
  "event": "po.status_changed",
  "timestamp": "2023-06-15T15:45:00Z",
  "data": {
    "po_id": "PO-2301-0001",
    "old_status": "Draft",
    "new_status": "Sent",
    "user_id": "user-123"
  }
}
```

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

*API Documentation Version: 1.0*
*Last Updated: Latest*