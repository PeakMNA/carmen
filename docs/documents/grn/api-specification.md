# Goods Received Note Module - API Specification

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Core Endpoints](#core-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)

## Overview

The Goods Received Note API provides comprehensive functionality for managing goods receipt within the Carmen Hospitality ERP system. This RESTful API supports the complete GRN lifecycle from creation to financial posting, with integration to Purchase Orders and inventory management.

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
  "role": "warehouse_manager",
  "permissions": ["grn:read", "grn:write", "grn:delete"],
  "business_unit": "BU001",
  "exp": 1640995200
}
```

## Core Endpoints

### Goods Received Notes

#### List Goods Received Notes
```http
GET /goods-received-notes
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 50, max: 100)
- `status` (string): Filter by status
- `vendor_id` (integer): Filter by vendor
- `start_date` (string): Filter from date (YYYY-MM-DD)
- `end_date` (string): Filter to date (YYYY-MM-DD)
- `currency` (string): Filter by currency code
- `search` (string): Search in GRN ref, vendor name, invoice number

**Response:**
```json
{
  "data": [
    {
      "id": "grn-uuid-123",
      "ref": "GRN-2301-0001",
      "vendor_id": "vendor-uuid-456",
      "vendor_name": "Global Foods Inc.",
      "date": "2023-06-15",
      "invoice_number": "INV-789",
      "invoice_date": "2023-06-14",
      "status": "Received",
      "currency": "USD",
      "total_amount": 1250.00,
      "item_count": 5,
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

#### Get Goods Received Note
```http
GET /goods-received-notes/{grn_id}
```

**Response:**
```json
{
  "id": "grn-uuid-123",
  "ref": "GRN-2301-0001",
  "vendor_id": "vendor-uuid-456",
  "vendor": {
    "id": "vendor-uuid-456",
    "company_name": "Global Foods Inc.",
    "business_registration_number": "BRN001",
    "contact_email": "orders@globalfoods.com"
  },
  "receiver_id": "user-uuid-789",
  "receiver_name": "John Warehouse",
  "date": "2023-06-15",
  "invoice_number": "INV-789",
  "invoice_date": "2023-06-14",
  "tax_invoice_number": "TAX-INV-789",
  "tax_invoice_date": "2023-06-14",
  "description": "Monthly food supplies delivery",
  "currency": "USD",
  "exchange_rate": 1.0000,
  "base_currency": "USD",
  "status": "Received",
  "cash_book_id": "cb-uuid-101",
  "is_consignment": false,
  "is_cash": false,
  "items": [
    {
      "id": "grn-item-uuid-001",
      "product_id": "product-uuid-202",
      "product_name": "Premium Rice 25kg",
      "description": "Long grain premium rice",
      "ordered_quantity": 10.000,
      "received_quantity": 10.000,
      "remaining_quantity": 0.000,
      "order_unit": "bags",
      "base_unit": "kg",
      "conversion_factor": 25.0000,
      "unit_price": 45.50,
      "sub_total_price": 455.00,
      "discount_rate": 5.00,
      "discount_amount": 22.75,
      "net_amount": 432.25,
      "tax_rate": 7.00,
      "tax_amount": 30.26,
      "total_amount": 462.51,
      "status": "FullyReceived",
      "po_reference": "PO-2301-0001",
      "po_item_id": "po-item-uuid-303"
    }
  ],
  "extra_costs": [
    {
      "id": "extra-cost-uuid-001",
      "description": "Freight charges",
      "amount": 75.00,
      "currency": "USD",
      "allocation_type": "even",
      "allocation": [
        {
          "item_id": "grn-item-uuid-001",
          "allocated_amount": 15.00
        }
      ]
    }
  ],
  "financial_summary": {
    "sub_total_price": 1150.00,
    "discount_amount": 57.50,
    "net_amount": 1092.50,
    "tax_amount": 76.48,
    "extra_costs_total": 75.00,
    "total_amount": 1243.98,
    "base_currency": "USD",
    "base_total_amount": 1243.98
  },
  "stock_movements": [
    {
      "id": "movement-uuid-001",
      "item_id": "grn-item-uuid-001",
      "product_id": "product-uuid-202",
      "movement_type": "IN",
      "quantity": 250.000,
      "to_location": "main-warehouse",
      "unit_cost": 1.73,
      "total_cost": 432.25,
      "movement_date": "2023-06-15",
      "status": "Processed"
    }
  ],
  "activity_log": [
    {
      "id": "log-uuid-001",
      "action": "Created",
      "user_id": "user-uuid-789",
      "user_name": "John Warehouse",
      "activity_type": "Creation",
      "description": "GRN created from PO-2301-0001",
      "timestamp": "2023-06-15T10:30:00Z"
    }
  ]
}
```

#### Create Goods Received Note
```http
POST /goods-received-notes
```

**Request Body:**
```json
{
  "vendor_id": "vendor-uuid-456",
  "receiver_id": "user-uuid-789",
  "date": "2023-06-15",
  "invoice_number": "INV-789",
  "invoice_date": "2023-06-14",
  "tax_invoice_number": "TAX-INV-789",
  "tax_invoice_date": "2023-06-14",
  "description": "Monthly food supplies delivery",
  "currency": "USD",
  "exchange_rate": 1.0000,
  "cash_book_id": "cb-uuid-101",
  "is_consignment": false,
  "is_cash": false,
  "source_po_ids": ["po-uuid-123", "po-uuid-124"],
  "items": [
    {
      "product_id": "product-uuid-202",
      "ordered_quantity": 10.000,
      "received_quantity": 10.000,
      "order_unit": "bags",
      "unit_price": 45.50,
      "discount_rate": 5.00,
      "tax_rate": 7.00,
      "po_item_id": "po-item-uuid-303"
    }
  ],
  "extra_costs": [
    {
      "description": "Freight charges",
      "amount": 75.00,
      "currency": "USD",
      "allocation_type": "even"
    }
  ]
}
```

**Response:**
```json
{
  "id": "grn-uuid-123",
  "ref": "GRN-2301-0001",
  "status": "Draft",
  "created_at": "2023-06-15T10:30:00Z",
  "message": "Goods Received Note created successfully"
}
```

#### Update Goods Received Note
```http
PUT /goods-received-notes/{grn_id}
```

**Request Body:** (Same as create, with optional fields)

**Response:**
```json
{
  "id": "grn-uuid-123",
  "ref": "GRN-2301-0001",
  "updated_at": "2023-06-15T15:45:00Z",
  "message": "Goods Received Note updated successfully"
}
```

#### Delete Goods Received Note
```http
DELETE /goods-received-notes/{grn_id}
```

**Response:**
```json
{
  "message": "Goods Received Note deleted successfully",
  "deleted_at": "2023-06-15T16:00:00Z"
}
```

#### Update GRN Status
```http
PATCH /goods-received-notes/{grn_id}/status
```

**Request Body:**
```json
{
  "status": "Verified",
  "reason": "Quality check completed, all items verified"
}
```

**Response:**
```json
{
  "id": "grn-uuid-123",
  "ref": "GRN-2301-0001",
  "old_status": "Received",
  "new_status": "Verified",
  "updated_at": "2023-06-15T15:45:00Z",
  "message": "Status updated successfully"
}
```

### GRN Items Management

#### Add Item to GRN
```http
POST /goods-received-notes/{grn_id}/items
```

**Request Body:**
```json
{
  "product_id": "product-uuid-203",
  "ordered_quantity": 5.000,
  "received_quantity": 5.000,
  "order_unit": "boxes",
  "unit_price": 25.75,
  "discount_rate": 0.00,
  "tax_rate": 7.00
}
```

#### Update GRN Item
```http
PUT /goods-received-notes/{grn_id}/items/{item_id}
```

**Request Body:**
```json
{
  "received_quantity": 4.500,
  "unit_price": 26.00,
  "discount_rate": 2.50
}
```

#### Delete GRN Item
```http
DELETE /goods-received-notes/{grn_id}/items/{item_id}
```

#### Bulk Item Operations
```http
POST /goods-received-notes/{grn_id}/items/bulk
```

**Request Body:**
```json
{
  "action": "update_status",
  "item_ids": ["item-uuid-001", "item-uuid-002"],
  "data": {
    "status": "FullyReceived"
  }
}
```

### Extra Costs Management

#### Add Extra Cost
```http
POST /goods-received-notes/{grn_id}/extra-costs
```

**Request Body:**
```json
{
  "description": "Insurance charges",
  "amount": 50.00,
  "currency": "USD",
  "allocation_type": "weighted"
}
```

#### Update Extra Cost
```http
PUT /goods-received-notes/{grn_id}/extra-costs/{cost_id}
```

#### Delete Extra Cost
```http
DELETE /goods-received-notes/{grn_id}/extra-costs/{cost_id}
```

### Document Operations

#### Export GRN
```http
GET /goods-received-notes/{grn_id}/export
```

**Query Parameters:**
- `format` (string): pdf|excel|csv
- `sections` (array): header,items,financial,vendor,comments

**Response:**
```json
{
  "download_url": "https://files.carmen-erp.com/exports/grn-2023-001.pdf",
  "expires_at": "2023-06-15T18:00:00Z"
}
```

#### Print GRN
```http
POST /goods-received-notes/{grn_id}/print
```

**Request Body:**
```json
{
  "template": "standard",
  "copies": 2,
  "include_items": true,
  "include_financial": true
}
```

### Integration Endpoints

#### Get Available Purchase Orders
```http
GET /goods-received-notes/available-pos
```

**Query Parameters:**
- `vendor_id` (string): Filter POs by vendor

**Response:**
```json
{
  "data": [
    {
      "po_id": "po-uuid-123",
      "po_number": "PO-2301-0001",
      "vendor_name": "Global Foods Inc.",
      "order_date": "2023-06-10",
      "delivery_date": "2023-06-15",
      "currency": "USD",
      "total_amount": 1250.00,
      "status": "Sent",
      "items_count": 5,
      "pending_receipt": true
    }
  ]
}
```

#### Process Stock Movements
```http
POST /goods-received-notes/{grn_id}/stock-movements
```

**Request Body:**
```json
{
  "auto_process": true,
  "target_location": "main-warehouse",
  "movement_date": "2023-06-15"
}
```

#### Generate Financial Entries
```http
POST /goods-received-notes/{grn_id}/financial-entries
```

**Request Body:**
```json
{
  "posting_date": "2023-06-15",
  "cost_center": "kitchen-operations",
  "auto_post": false
}
```

## Data Models

### Goods Received Note
```typescript
interface GoodsReceiveNote {
  id: string
  ref: string
  vendor_id: string
  vendor?: Vendor
  receiver_id: string
  receiver_name: string
  date: string
  invoice_number?: string
  invoice_date?: string
  tax_invoice_number?: string
  tax_invoice_date?: string
  description?: string
  currency: string
  exchange_rate: number
  base_currency: string
  status: GRNStatus
  cash_book_id?: string
  is_consignment: boolean
  is_cash: boolean

  // Financial totals
  sub_total_price: number
  discount_amount: number
  net_amount: number
  tax_amount: number
  total_amount: number
  base_total_amount: number

  items: GRNItem[]
  extra_costs: ExtraCost[]
  stock_movements: StockMovement[]
  activity_log: ActivityLogEntry[]

  source_po_ids?: string[]
  created_by: string
  created_at: string
  updated_at: string
}
```

### GRN Item
```typescript
interface GRNItem {
  id: string
  grn_id: string
  product_id: string
  product_name: string
  description?: string
  ordered_quantity: number
  received_quantity: number
  remaining_quantity: number
  order_unit: string
  base_unit: string
  conversion_factor: number
  unit_price: number
  sub_total_price: number
  discount_rate: number
  discount_amount: number
  net_amount: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  status: ItemStatus
  po_reference?: string
  po_item_id?: string
}
```

### Extra Cost
```typescript
interface ExtraCost {
  id: string
  grn_id: string
  description: string
  amount: number
  currency: string
  allocation_type: 'even' | 'weighted' | 'manual'
  allocation: ExtraCostAllocation[]
}

interface ExtraCostAllocation {
  item_id: string
  allocated_amount: number
  allocation_percentage: number
}
```

### Stock Movement
```typescript
interface StockMovement {
  id: string
  grn_id: string
  item_id: string
  product_id: string
  movement_type: 'IN' | 'OUT' | 'TRANSFER'
  quantity: number
  from_location?: string
  to_location: string
  unit_cost: number
  total_cost: number
  movement_date: string
  status: 'Pending' | 'Processed' | 'Cancelled'
}
```

### Activity Log Entry
```typescript
interface ActivityLogEntry {
  id: string
  grn_id: string
  user_id: string
  user_name: string
  action: string
  activity_type: ActivityType
  description: string
  timestamp: string
  metadata?: object
}
```

### Enums

#### GRN Status
```typescript
enum GRNStatus {
  Draft = "Draft",
  Received = "Received",
  Verified = "Verified",
  Posted = "Posted",
  Cancelled = "Cancelled"
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
      },
      {
        "field": "date",
        "message": "Date must be in YYYY-MM-DD format"
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
| GRN_ALREADY_POSTED | Cannot modify posted GRN |
| INVALID_STATUS_TRANSITION | Invalid status change |
| INSUFFICIENT_PERMISSIONS | User lacks required permissions |
| VENDOR_INACTIVE | Selected vendor is inactive |
| CURRENCY_MISMATCH | Currency doesn't match PO currency |
| QUANTITY_EXCEEDED | Received quantity exceeds ordered |
| PO_ALREADY_COMPLETED | Purchase order is already fully received |

## Rate Limiting

**Standard Limits:**
- 1000 requests per hour per user
- 100 requests per minute per user
- 20 bulk operations per hour per user

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
| grn.created | GRN created |
| grn.updated | GRN updated |
| grn.status_changed | Status changed |
| grn.item_added | Item added to GRN |
| grn.item_updated | Item updated |
| grn.received | Goods received |
| grn.verified | Quality verification completed |
| grn.posted | Financial posting completed |
| grn.cancelled | GRN cancelled |

### Webhook Payload
```json
{
  "event": "grn.status_changed",
  "timestamp": "2023-06-15T15:45:00Z",
  "data": {
    "grn_id": "grn-uuid-123",
    "ref": "GRN-2301-0001",
    "old_status": "Received",
    "new_status": "Verified",
    "user_id": "user-uuid-789",
    "vendor_id": "vendor-uuid-456"
  }
}
```

### Webhook Configuration
```http
POST /webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/grn",
  "events": ["grn.created", "grn.status_changed"],
  "secret": "your_webhook_secret"
}
```

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

*API Documentation Version: 1.0*
*Last Updated: Latest*