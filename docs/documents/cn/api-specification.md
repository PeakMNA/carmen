# Credit Note Module - API Specification

Complete API documentation for the Carmen ERP Credit Note module with endpoints, data models, authentication, and integration patterns.

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Core Endpoints](#core-endpoints)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Webhooks](#webhooks)
7. [Integration Patterns](#integration-patterns)

## Authentication & Authorization

### Authentication Methods

**Bearer Token Authentication**:
```http
Authorization: Bearer <jwt_token>
```

**API Key Authentication**:
```http
X-API-Key: <api_key>
X-API-Secret: <api_secret>
```

### Authorization Levels

**Role-based Permissions**:
- `credit-note:read` - View credit notes
- `credit-note:create` - Create new credit notes
- `credit-note:edit` - Modify existing credit notes
- `credit-note:delete` - Delete credit notes
- `credit-note:approve` - Approve credit notes
- `credit-note:process` - Process approved credit notes

**Scope-based Access**:
- `department:procurement` - Procurement department access
- `department:finance` - Finance department access
- `location:specific` - Location-specific access
- `vendor:specific` - Vendor-specific access

### JWT Token Structure
```json
{
  "sub": "user_id",
  "roles": ["procurement_staff", "finance_manager"],
  "permissions": ["credit-note:read", "credit-note:create"],
  "department": "procurement",
  "location": "main_warehouse",
  "exp": 1640995200
}
```

## Core Endpoints

### 1. Credit Note Management

#### Get All Credit Notes
```http
GET /api/v1/credit-notes
```

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `status` (string): Filter by status (draft, pending_approval, approved, processed)
- `vendor_id` (string): Filter by vendor ID
- `date_from` (string): Start date filter (ISO 8601)
- `date_to` (string): End date filter (ISO 8601)
- `type` (string): Credit note type (quantity_return, amount_discount)
- `search` (string): Search in reference number, vendor name, description
- `sort_by` (string): Sort field (date, amount, vendor_name, status)
- `sort_order` (string): Sort direction (asc, desc)

**Response**:
```json
{
  "data": [
    {
      "id": "cn_001",
      "ref_number": "CN-2501-0001",
      "vendor": {
        "id": "vendor_001",
        "name": "ACME Corporation",
        "registration_number": "BN123456"
      },
      "type": "quantity_return",
      "status": "pending_approval",
      "date": "2025-01-15T00:00:00Z",
      "currency": "MYR",
      "total_amount": 1250.50,
      "items_count": 3,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T14:20:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 95,
    "items_per_page": 20
  },
  "filters": {
    "status": ["draft", "pending_approval", "approved", "processed"],
    "vendors": [{"id": "vendor_001", "name": "ACME Corporation"}],
    "types": ["quantity_return", "amount_discount"]
  }
}
```

#### Get Credit Note by ID
```http
GET /api/v1/credit-notes/{id}
```

**Response**:
```json
{
  "data": {
    "id": "cn_001",
    "ref_number": "CN-2501-0001",
    "vendor": {
      "id": "vendor_001",
      "name": "ACME Corporation",
      "registration_number": "BN123456",
      "contact_person": "John Doe",
      "email": "john@acme.com"
    },
    "type": "quantity_return",
    "status": "pending_approval",
    "date": "2025-01-15T00:00:00Z",
    "currency": "MYR",
    "exchange_rate": 1.0,
    "reason": "Quality issues with delivered items",
    "description": "Credit note for defective products returned",
    "items": [
      {
        "id": "item_001",
        "product": {
          "id": "prod_001",
          "name": "Premium Rice 5kg",
          "sku": "RICE-PREM-5KG"
        },
        "quantity": 10,
        "unit_price": 25.50,
        "total_amount": 255.00,
        "reason_code": "quality_defect",
        "lot_number": "LOT-2501-0001",
        "expiry_date": "2025-12-31T00:00:00Z",
        "grn_reference": "GRN-2501-0001"
      }
    ],
    "related_grns": ["GRN-2501-0001", "GRN-2501-0002"],
    "financial_summary": {
      "subtotal": 1200.00,
      "tax_amount": 50.50,
      "total_amount": 1250.50
    },
    "workflow": {
      "created_by": "user_001",
      "approved_by": null,
      "approval_date": null,
      "processed_by": null,
      "processing_date": null
    },
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T14:20:00Z"
  }
}
```

#### Create Credit Note
```http
POST /api/v1/credit-notes
```

**Request Body**:
```json
{
  "vendor_id": "vendor_001",
  "type": "quantity_return",
  "date": "2025-01-15T00:00:00Z",
  "currency": "MYR",
  "reason": "Quality issues with delivered items",
  "description": "Credit note for defective products",
  "items": [
    {
      "product_id": "prod_001",
      "quantity": 10,
      "unit_price": 25.50,
      "reason_code": "quality_defect",
      "lot_number": "LOT-2501-0001",
      "grn_reference": "GRN-2501-0001",
      "notes": "Visible damage on packaging"
    }
  ],
  "related_grn_ids": ["GRN-2501-0001"]
}
```

**Response**:
```json
{
  "data": {
    "id": "cn_002",
    "ref_number": "CN-2501-0002",
    "status": "draft",
    "total_amount": 255.00,
    "created_at": "2025-01-15T15:30:00Z"
  },
  "message": "Credit note created successfully"
}
```

#### Update Credit Note
```http
PUT /api/v1/credit-notes/{id}
```

**Request Body**:
```json
{
  "reason": "Updated reason for credit note",
  "description": "Updated description",
  "items": [
    {
      "id": "item_001",
      "quantity": 8,
      "unit_price": 25.50,
      "reason_code": "partial_damage"
    }
  ]
}
```

**Response**:
```json
{
  "data": {
    "id": "cn_001",
    "ref_number": "CN-2501-0001",
    "status": "draft",
    "total_amount": 204.00,
    "updated_at": "2025-01-15T16:45:00Z"
  },
  "message": "Credit note updated successfully"
}
```

#### Delete Credit Note
```http
DELETE /api/v1/credit-notes/{id}
```

**Response**:
```json
{
  "message": "Credit note deleted successfully",
  "deleted_at": "2025-01-15T17:00:00Z"
}
```

### 2. Credit Note Workflow

#### Submit for Approval
```http
POST /api/v1/credit-notes/{id}/submit
```

**Response**:
```json
{
  "data": {
    "id": "cn_001",
    "status": "pending_approval",
    "submitted_at": "2025-01-15T17:30:00Z",
    "submitted_by": "user_001"
  },
  "message": "Credit note submitted for approval"
}
```

#### Approve Credit Note
```http
POST /api/v1/credit-notes/{id}/approve
```

**Request Body**:
```json
{
  "comments": "Approved - valid quality issues documented"
}
```

**Response**:
```json
{
  "data": {
    "id": "cn_001",
    "status": "approved",
    "approved_at": "2025-01-16T09:00:00Z",
    "approved_by": "manager_001"
  },
  "message": "Credit note approved successfully"
}
```

#### Reject Credit Note
```http
POST /api/v1/credit-notes/{id}/reject
```

**Request Body**:
```json
{
  "reason": "insufficient_documentation",
  "comments": "Please provide quality inspection reports"
}
```

**Response**:
```json
{
  "data": {
    "id": "cn_001",
    "status": "rejected",
    "rejected_at": "2025-01-16T09:15:00Z",
    "rejected_by": "manager_001",
    "rejection_reason": "insufficient_documentation"
  },
  "message": "Credit note rejected"
}
```

#### Process Credit Note
```http
POST /api/v1/credit-notes/{id}/process
```

**Response**:
```json
{
  "data": {
    "id": "cn_001",
    "status": "processed",
    "processed_at": "2025-01-16T14:30:00Z",
    "processed_by": "finance_001",
    "journal_entry_id": "je_001",
    "vendor_balance_updated": true
  },
  "message": "Credit note processed successfully"
}
```

### 3. Credit Note Items

#### Get Credit Note Items
```http
GET /api/v1/credit-notes/{id}/items
```

**Response**:
```json
{
  "data": [
    {
      "id": "item_001",
      "product": {
        "id": "prod_001",
        "name": "Premium Rice 5kg",
        "sku": "RICE-PREM-5KG",
        "category": "Grains & Cereals"
      },
      "quantity": 10,
      "unit_price": 25.50,
      "total_amount": 255.00,
      "reason_code": "quality_defect",
      "reason_description": "Quality defect identified",
      "lot_number": "LOT-2501-0001",
      "expiry_date": "2025-12-31T00:00:00Z",
      "grn_reference": "GRN-2501-0001",
      "notes": "Visible damage on packaging"
    }
  ]
}
```

#### Add Credit Note Item
```http
POST /api/v1/credit-notes/{id}/items
```

**Request Body**:
```json
{
  "product_id": "prod_002",
  "quantity": 5,
  "unit_price": 12.75,
  "reason_code": "pricing_error",
  "lot_number": "LOT-2501-0002",
  "notes": "Incorrect pricing applied"
}
```

#### Update Credit Note Item
```http
PUT /api/v1/credit-notes/{id}/items/{item_id}
```

#### Delete Credit Note Item
```http
DELETE /api/v1/credit-notes/{id}/items/{item_id}
```

### 4. Document Management

#### Get Credit Note Documents
```http
GET /api/v1/credit-notes/{id}/documents
```

**Response**:
```json
{
  "data": [
    {
      "id": "doc_001",
      "name": "quality_inspection_report.pdf",
      "type": "quality_report",
      "size": 245760,
      "mime_type": "application/pdf",
      "uploaded_by": "user_001",
      "uploaded_at": "2025-01-15T16:00:00Z",
      "url": "/api/v1/documents/doc_001/download"
    }
  ]
}
```

#### Upload Document
```http
POST /api/v1/credit-notes/{id}/documents
Content-Type: multipart/form-data
```

**Form Data**:
- `file`: Document file
- `type`: Document type (quality_report, vendor_correspondence, photo_evidence)
- `description`: Document description

#### Download Document
```http
GET /api/v1/credit-notes/{id}/documents/{document_id}/download
```

### 5. Vendor Integration

#### Get Vendor Credit Notes
```http
GET /api/v1/vendors/{vendor_id}/credit-notes
```

#### Get Available GRNs for Vendor
```http
GET /api/v1/vendors/{vendor_id}/grns
```

**Query Parameters**:
- `status` (string): GRN status filter
- `date_from` (string): Start date filter
- `date_to` (string): End date filter

**Response**:
```json
{
  "data": [
    {
      "id": "grn_001",
      "ref_number": "GRN-2501-0001",
      "date": "2025-01-10T00:00:00Z",
      "total_amount": 2500.00,
      "currency": "MYR",
      "items_count": 5,
      "available_for_credit": true
    }
  ]
}
```

### 6. Reporting & Analytics

#### Credit Note Summary Report
```http
GET /api/v1/credit-notes/reports/summary
```

**Query Parameters**:
- `period` (string): Report period (daily, weekly, monthly, yearly)
- `date_from` (string): Start date
- `date_to` (string): End date
- `vendor_id` (string): Vendor filter
- `type` (string): Credit note type filter

**Response**:
```json
{
  "data": {
    "summary": {
      "total_credit_notes": 125,
      "total_amount": 15750.25,
      "by_status": {
        "draft": 5,
        "pending_approval": 8,
        "approved": 12,
        "processed": 100
      },
      "by_type": {
        "quantity_return": 95,
        "amount_discount": 30
      }
    },
    "trends": [
      {
        "period": "2025-01",
        "count": 25,
        "amount": 3125.50
      }
    ],
    "top_vendors": [
      {
        "vendor_id": "vendor_001",
        "vendor_name": "ACME Corporation",
        "credit_notes_count": 15,
        "total_amount": 2250.75
      }
    ]
  }
}
```

#### Export Credit Notes
```http
POST /api/v1/credit-notes/export
```

**Request Body**:
```json
{
  "format": "xlsx",
  "filters": {
    "status": ["approved", "processed"],
    "date_from": "2025-01-01T00:00:00Z",
    "date_to": "2025-01-31T23:59:59Z"
  },
  "fields": [
    "ref_number",
    "vendor_name",
    "date",
    "type",
    "status",
    "total_amount"
  ]
}
```

**Response**:
```json
{
  "data": {
    "export_id": "export_001",
    "status": "processing",
    "estimated_completion": "2025-01-15T18:05:00Z"
  }
}
```

#### Get Export Status
```http
GET /api/v1/exports/{export_id}
```

## Data Models

### Credit Note Model
```json
{
  "id": "string",
  "ref_number": "string",
  "vendor": {
    "id": "string",
    "name": "string",
    "registration_number": "string",
    "contact_person": "string",
    "email": "string",
    "phone": "string"
  },
  "type": "quantity_return | amount_discount",
  "status": "draft | pending_approval | approved | rejected | processed | cancelled",
  "date": "ISO 8601 datetime",
  "currency": "string",
  "exchange_rate": "number",
  "reason": "string",
  "description": "string",
  "items": ["CreditNoteItem"],
  "related_grns": ["string"],
  "financial_summary": {
    "subtotal": "number",
    "tax_amount": "number",
    "discount_amount": "number",
    "total_amount": "number"
  },
  "workflow": {
    "created_by": "string",
    "created_at": "ISO 8601 datetime",
    "submitted_by": "string",
    "submitted_at": "ISO 8601 datetime",
    "approved_by": "string",
    "approved_at": "ISO 8601 datetime",
    "processed_by": "string",
    "processed_at": "ISO 8601 datetime"
  },
  "documents": ["Document"],
  "activity_log": ["ActivityLogEntry"],
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### Credit Note Item Model
```json
{
  "id": "string",
  "credit_note_id": "string",
  "product": {
    "id": "string",
    "name": "string",
    "sku": "string",
    "category": "string",
    "unit": "string"
  },
  "quantity": "number",
  "unit_price": "number",
  "total_amount": "number",
  "reason_code": "string",
  "reason_description": "string",
  "lot_number": "string",
  "expiry_date": "ISO 8601 datetime",
  "grn_reference": "string",
  "grn_item_id": "string",
  "notes": "string",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

### Reason Code Model
```json
{
  "code": "string",
  "category": "quality | pricing | quantity | other",
  "description": "string",
  "requires_documentation": "boolean",
  "automatic_approval": "boolean",
  "active": "boolean"
}
```

### Document Model
```json
{
  "id": "string",
  "credit_note_id": "string",
  "name": "string",
  "type": "quality_report | vendor_correspondence | photo_evidence | other",
  "description": "string",
  "file_path": "string",
  "size": "number",
  "mime_type": "string",
  "uploaded_by": "string",
  "uploaded_at": "ISO 8601 datetime",
  "download_url": "string"
}
```

### Activity Log Entry Model
```json
{
  "id": "string",
  "credit_note_id": "string",
  "action": "string",
  "description": "string",
  "user_id": "string",
  "user_name": "string",
  "timestamp": "ISO 8601 datetime",
  "metadata": "object"
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object",
    "timestamp": "ISO 8601 datetime",
    "request_id": "string"
  }
}
```

### Common Error Codes

**Client Errors (4xx)**:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity

**Server Errors (5xx)**:
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable
- `504` - Gateway Timeout

### Validation Errors
```json
{
  "error": {
    "code": "validation_failed",
    "message": "Validation failed for one or more fields",
    "details": {
      "fields": {
        "vendor_id": ["Vendor ID is required"],
        "items[0].quantity": ["Quantity must be greater than 0"]
      }
    }
  }
}
```

### Business Logic Errors
```json
{
  "error": {
    "code": "insufficient_grn_quantity",
    "message": "Credit quantity exceeds available GRN quantity",
    "details": {
      "grn_id": "GRN-2501-0001",
      "product_id": "prod_001",
      "available_quantity": 50,
      "requested_quantity": 75
    }
  }
}
```

## Rate Limiting

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 3600
```

### Rate Limit Tiers
- **Standard User**: 1000 requests/hour
- **Premium User**: 5000 requests/hour
- **Enterprise**: 10000 requests/hour
- **System Integration**: 50000 requests/hour

### Rate Limit Exceeded Response
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Try again later.",
    "details": {
      "limit": 1000,
      "window": 3600,
      "reset_time": "2025-01-15T19:00:00Z"
    }
  }
}
```

## Webhooks

### Webhook Events

**Credit Note Events**:
- `credit_note.created` - New credit note created
- `credit_note.updated` - Credit note modified
- `credit_note.submitted` - Submitted for approval
- `credit_note.approved` - Credit note approved
- `credit_note.rejected` - Credit note rejected
- `credit_note.processed` - Credit note processed
- `credit_note.cancelled` - Credit note cancelled

### Webhook Payload
```json
{
  "event": "credit_note.approved",
  "timestamp": "2025-01-16T09:00:00Z",
  "data": {
    "credit_note_id": "cn_001",
    "ref_number": "CN-2501-0001",
    "vendor_id": "vendor_001",
    "total_amount": 1250.50,
    "currency": "MYR",
    "approved_by": "manager_001",
    "approved_at": "2025-01-16T09:00:00Z"
  },
  "metadata": {
    "request_id": "req_001",
    "api_version": "v1"
  }
}
```

### Webhook Security
- **Signature Verification**: HMAC-SHA256 signature in `X-Webhook-Signature` header
- **Timestamp Validation**: Timestamp in `X-Webhook-Timestamp` header
- **Retry Logic**: Exponential backoff for failed deliveries
- **Delivery Confirmation**: 200 status code required for successful delivery

## Integration Patterns

### Vendor Portal Integration
```http
GET /api/v1/vendor-portal/credit-notes
Authorization: Bearer <vendor_portal_token>
```

### ERP System Integration
```http
POST /api/v1/integrations/erp/credit-notes/sync
X-Integration-Key: <erp_integration_key>
```

### Accounting System Integration
```http
POST /api/v1/integrations/accounting/journal-entries
Content-Type: application/json

{
  "credit_note_id": "cn_001",
  "entries": [
    {
      "account": "accounts_payable",
      "debit": 0,
      "credit": 1250.50
    },
    {
      "account": "inventory_returns",
      "debit": 1250.50,
      "credit": 0
    }
  ]
}
```

### Inventory Management Integration
```http
POST /api/v1/integrations/inventory/adjustments
Content-Type: application/json

{
  "credit_note_id": "cn_001",
  "adjustments": [
    {
      "product_id": "prod_001",
      "location_id": "loc_001",
      "quantity_change": 10,
      "adjustment_type": "return",
      "reason": "credit_note_return"
    }
  ]
}
```

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

*Generated on: 2025-09-23*
*API Specification Version: 1.0*
*Carmen ERP - Credit Note Module*