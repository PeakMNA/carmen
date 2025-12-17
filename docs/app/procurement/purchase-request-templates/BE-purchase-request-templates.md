# Backend Requirements: Purchase Request Templates

## Module Information
- **Module**: Procurement
- **Sub-Module**: Purchase Request Templates
- **Route**: `/procurement/purchase-request-templates`
- **API Base**: `/api/procurement/templates`
- **Version**: 1.0.0
- **Last Updated**: 2025-12-04
- **Owner**: Procurement Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-12-04 | System Documentation | Initial version based on prototype analysis |

---

## Overview

This document specifies the backend requirements to support the Purchase Request Templates prototype UI. The backend must provide API endpoints, data persistence, and business logic for creating, managing, and utilizing PR templates.

**Prototype Features Requiring Backend Support**:
- Template CRUD operations (Create, Read, Update, Delete)
- Template items management (Add, Edit, Delete items)
- Template listing with filtering, sorting, and pagination
- Bulk operations (Delete Selected, Clone Selected, Set as Default)
- Template cloning functionality
- Default template designation per department

---

## 1. Database Schema

### 1.1 PurchaseRequestTemplate Table

```sql
CREATE TABLE purchase_request_templates (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core Identification
  template_number VARCHAR(20) NOT NULL UNIQUE,  -- TPL-YY-NNNN format
  description VARCHAR(500) NOT NULL,            -- Template name/notes (min 10 chars)

  -- Classification
  department_id UUID NOT NULL REFERENCES departments(id),
  request_type VARCHAR(20) NOT NULL DEFAULT 'goods',  -- goods, services, capital

  -- Status Management
  status VARCHAR(20) NOT NULL DEFAULT 'draft',  -- draft, active, inactive
  is_default BOOLEAN NOT NULL DEFAULT FALSE,

  -- Financial Summary (calculated)
  estimated_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'THB',

  -- Usage Tracking
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,

  -- Audit Fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by UUID NOT NULL REFERENCES users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,  -- Soft delete
  deleted_by UUID REFERENCES users(id),

  -- Constraints
  CONSTRAINT chk_request_type CHECK (request_type IN ('goods', 'services', 'capital')),
  CONSTRAINT chk_status CHECK (status IN ('draft', 'active', 'inactive')),
  CONSTRAINT chk_description_length CHECK (LENGTH(description) >= 10)
);

-- Indexes
CREATE INDEX idx_templates_department ON purchase_request_templates(department_id);
CREATE INDEX idx_templates_status ON purchase_request_templates(status);
CREATE INDEX idx_templates_request_type ON purchase_request_templates(request_type);
CREATE INDEX idx_templates_is_default ON purchase_request_templates(is_default) WHERE is_default = TRUE;
CREATE INDEX idx_templates_deleted ON purchase_request_templates(deleted_at) WHERE deleted_at IS NULL;
```

### 1.2 TemplateItem Table

```sql
CREATE TABLE template_items (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES purchase_request_templates(id) ON DELETE CASCADE,

  -- Product Identification
  item_code VARCHAR(50) NOT NULL,
  description VARCHAR(500) NOT NULL,

  -- Quantity and Measurement
  uom VARCHAR(20) NOT NULL,           -- KG, EA, BTL, CTN, etc.
  quantity DECIMAL(10,3) NOT NULL,

  -- Pricing
  unit_price DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'THB',
  total_amount DECIMAL(15,2) NOT NULL,  -- quantity * unit_price

  -- Financial Coding
  budget_code VARCHAR(50) NOT NULL,
  account_code VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  tax_code VARCHAR(20) NOT NULL,       -- VAT7, VAT0, EXEMPT

  -- Ordering
  line_number INTEGER NOT NULL,

  -- Audit Fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_by UUID NOT NULL REFERENCES users(id),

  -- Constraints
  CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
  CONSTRAINT chk_unit_price_positive CHECK (unit_price >= 0),
  CONSTRAINT uq_template_item_code UNIQUE (template_id, item_code)
);

-- Indexes
CREATE INDEX idx_template_items_template ON template_items(template_id);
CREATE INDEX idx_template_items_item_code ON template_items(item_code);
```

### 1.3 Template Number Sequence

```sql
CREATE SEQUENCE template_number_seq START 1;

-- Function to generate template number
CREATE OR REPLACE FUNCTION generate_template_number()
RETURNS VARCHAR(20) AS $$
DECLARE
  seq_val INTEGER;
  year_str VARCHAR(4);
BEGIN
  seq_val := nextval('template_number_seq');
  year_str := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
  RETURN 'TPL-' || year_str || '-' || LPAD(seq_val::VARCHAR, 3, '0');
END;
$$ LANGUAGE plpgsql;
```

---

## 2. API Endpoints

### 2.1 Template CRUD Operations

#### GET /api/procurement/templates
**Purpose**: List templates with filtering, sorting, and pagination

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10, max: 100) |
| search | string | No | Search in template_number and description |
| status | string | No | Filter by status (draft, active, inactive) |
| request_type | string | No | Filter by type (goods, services, capital) |
| department_id | UUID | No | Filter by department |
| sort_by | string | No | Sort field (default: created_at) |
| sort_order | string | No | asc or desc (default: desc) |

**Response**:
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "uuid",
        "templateNumber": "TPL-24-0001",
        "description": "Office Supplies Template",
        "departmentId": "uuid",
        "departmentName": "Kitchen",
        "requestType": "goods",
        "status": "active",
        "isDefault": false,
        "estimatedTotal": 2500.00,
        "currency": "THB",
        "itemCount": 5,
        "usageCount": 12,
        "lastUsedAt": "2024-12-01T10:30:00Z",
        "createdAt": "2024-01-15T08:00:00Z",
        "createdBy": "uuid",
        "createdByName": "John Doe"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 45,
      "totalPages": 5
    }
  }
}
```

---

#### GET /api/procurement/templates/:id
**Purpose**: Get single template with all items

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "templateNumber": "TPL-24-0001",
    "description": "Office Supplies Template",
    "departmentId": "uuid",
    "departmentName": "Kitchen",
    "requestType": "goods",
    "status": "active",
    "isDefault": false,
    "estimatedTotal": 2500.00,
    "currency": "THB",
    "usageCount": 12,
    "lastUsedAt": "2024-12-01T10:30:00Z",
    "items": [
      {
        "id": "uuid",
        "itemCode": "RAW-001",
        "description": "Fresh Vegetables Assortment",
        "uom": "KG",
        "quantity": 100,
        "unitPrice": 5.50,
        "totalAmount": 550.00,
        "budgetCode": "BUD-2401-0001",
        "accountCode": "5001",
        "department": "Kitchen",
        "taxCode": "VAT7",
        "currency": "THB",
        "lineNumber": 1
      }
    ],
    "createdAt": "2024-01-15T08:00:00Z",
    "createdBy": "uuid",
    "createdByName": "John Doe",
    "updatedAt": "2024-06-20T14:30:00Z",
    "updatedBy": "uuid",
    "updatedByName": "Jane Smith"
  }
}
```

---

#### POST /api/procurement/templates
**Purpose**: Create new template

**Request Body**:
```json
{
  "description": "Office Supplies Template",
  "departmentId": "uuid",
  "requestType": "goods",
  "currency": "THB"
}
```

**Validation Rules**:
- description: required, min 10 characters, max 500 characters
- departmentId: required, must exist and be active
- requestType: required, must be one of: goods, services, capital
- currency: optional (default: THB), must be valid currency code

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "templateNumber": "TPL-24-0001",
    "description": "Office Supplies Template",
    "departmentId": "uuid",
    "requestType": "goods",
    "status": "draft",
    "isDefault": false,
    "estimatedTotal": 0,
    "currency": "THB",
    "items": [],
    "createdAt": "2024-12-04T10:00:00Z"
  },
  "message": "Template created successfully"
}
```

---

#### PUT /api/procurement/templates/:id
**Purpose**: Update template metadata

**Request Body**:
```json
{
  "description": "Updated Office Supplies Template",
  "departmentId": "uuid",
  "requestType": "services",
  "status": "active",
  "currency": "THB"
}
```

**Business Rules**:
- Cannot change departmentId if template has items
- Status can only be changed: draft → active (if has items), active → inactive, inactive → active
- Cannot update deleted templates

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "templateNumber": "TPL-24-0001",
    "description": "Updated Office Supplies Template",
    "status": "active",
    "updatedAt": "2024-12-04T11:00:00Z"
  },
  "message": "Template updated successfully"
}
```

---

#### DELETE /api/procurement/templates/:id
**Purpose**: Soft delete template

**Business Rules**:
- Cannot delete if is_default = true (must remove default status first)
- Performs soft delete (sets deleted_at, deleted_by)
- Cascade soft-deletes all template items

**Response**:
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

**Error Response** (if default):
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_DELETE_DEFAULT",
    "message": "Cannot delete default template. Remove default status first."
  }
}
```

---

### 2.2 Template Items Operations

#### POST /api/procurement/templates/:id/items
**Purpose**: Add item to template

**Request Body**:
```json
{
  "itemCode": "RAW-001",
  "description": "Fresh Vegetables Assortment",
  "uom": "KG",
  "quantity": 100,
  "unitPrice": 5.50,
  "budgetCode": "BUD-2401-0001",
  "accountCode": "5001",
  "department": "Kitchen",
  "taxCode": "VAT7",
  "currency": "THB"
}
```

**Validation Rules**:
- itemCode: required, min 3 chars, unique within template
- description: required, min 5 chars, max 500 chars
- uom: required, must be valid UOM from lookup
- quantity: required, must be > 0
- unitPrice: required, must be >= 0
- budgetCode: required
- accountCode: required
- department: required
- taxCode: required, must be one of: VAT7, VAT0, EXEMPT

**Business Logic**:
1. Validate all fields
2. Check item_code uniqueness within template
3. Calculate total_amount = quantity * unit_price
4. Assign next line_number
5. Insert item record
6. Recalculate template estimated_total
7. Update template updated_at, updated_by

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "itemCode": "RAW-001",
    "description": "Fresh Vegetables Assortment",
    "uom": "KG",
    "quantity": 100,
    "unitPrice": 5.50,
    "totalAmount": 550.00,
    "budgetCode": "BUD-2401-0001",
    "accountCode": "5001",
    "department": "Kitchen",
    "taxCode": "VAT7",
    "currency": "THB",
    "lineNumber": 1
  },
  "templateTotal": 550.00,
  "message": "Item added successfully"
}
```

---

#### PUT /api/procurement/templates/:templateId/items/:itemId
**Purpose**: Update template item

**Request Body**:
```json
{
  "itemCode": "RAW-001",
  "description": "Fresh Vegetables Assortment - Premium",
  "uom": "KG",
  "quantity": 150,
  "unitPrice": 6.00,
  "budgetCode": "BUD-2401-0001",
  "accountCode": "5001",
  "department": "Kitchen",
  "taxCode": "VAT7",
  "currency": "THB"
}
```

**Business Logic**:
1. Validate item exists and belongs to template
2. Validate all fields
3. If itemCode changed, check uniqueness
4. Recalculate total_amount
5. Update item record
6. Recalculate template estimated_total

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "itemCode": "RAW-001",
    "description": "Fresh Vegetables Assortment - Premium",
    "quantity": 150,
    "unitPrice": 6.00,
    "totalAmount": 900.00
  },
  "templateTotal": 900.00,
  "message": "Item updated successfully"
}
```

---

#### DELETE /api/procurement/templates/:templateId/items/:itemId
**Purpose**: Delete template item

**Business Logic**:
1. Validate item exists and belongs to template
2. Delete item record
3. Reorder remaining items (line_number)
4. Recalculate template estimated_total

**Response**:
```json
{
  "success": true,
  "templateTotal": 350.00,
  "message": "Item deleted successfully"
}
```

---

### 2.3 Bulk Operations

#### POST /api/procurement/templates/bulk/delete
**Purpose**: Delete multiple templates

**Request Body**:
```json
{
  "templateIds": ['uuid1', 'uuid2', 'uuid3']
}
```

**Business Rules**:
- Skip templates where is_default = true
- Soft delete all non-default templates
- Return summary of results

**Response**:
```json
{
  "success": true,
  "data": {
    "deleted": 2,
    "skipped": 1,
    "skippedIds": ['uuid3'],
    "skippedReasons": {
      "uuid3": "Cannot delete default template"
    }
  },
  "message": "Bulk delete completed: 2 deleted, 1 skipped"
}
```

---

#### POST /api/procurement/templates/bulk/clone
**Purpose**: Clone multiple templates

**Request Body**:
```json
{
  "templateIds": ['uuid1', 'uuid2']
}
```

**Business Logic**:
For each template:
1. Create new template with same data
2. Generate new template_number
3. Append " (Copy)" to description
4. Set status = 'draft'
5. Set is_default = false
6. Copy all items with new IDs

**Response**:
```json
{
  "success": true,
  "data": {
    "cloned": 2,
    "newTemplates": [
      {
        "originalId": "uuid1",
        "newId": "new-uuid1",
        "templateNumber": "TPL-24-0045"
      },
      {
        "originalId": "uuid2",
        "newId": "new-uuid2",
        "templateNumber": "TPL-24-0046"
      }
    ]
  },
  "message": "2 templates cloned successfully"
}
```

---

### 2.4 Default Template Management

#### POST /api/procurement/templates/:id/set-default
**Purpose**: Set template as default for its department

**Business Logic**:
1. Get template's department_id
2. Find current default for that department (if any)
3. Begin transaction
4. Remove is_default from previous default (if exists)
5. Set is_default = true on selected template
6. Commit transaction

**Response**:
```json
{
  "success": true,
  "data": {
    "templateId": "uuid",
    "templateNumber": "TPL-24-0001",
    "departmentId": "uuid",
    "previousDefault": {
      "templateId": "old-uuid",
      "templateNumber": "TPL-24-0005"
    }
  },
  "message": "Template set as default for Kitchen department"
}
```

---

#### DELETE /api/procurement/templates/:id/default
**Purpose**: Remove default status from template

**Response**:
```json
{
  "success": true,
  "message": "Default status removed"
}
```

---

### 2.5 Template Cloning

#### POST /api/procurement/templates/:id/clone
**Purpose**: Clone single template

**Business Logic**:
1. Fetch source template with all items
2. Create new template record:
   - Generate new template_number
   - Copy description + " (Copy)"
   - Copy departmentId, requestType, currency
   - Set status = 'draft'
   - Set is_default = false
   - Set estimated_total from source
3. Copy all items with new IDs
4. Return new template

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "templateNumber": "TPL-24-0046",
    "description": "Office Supplies Template (Copy)",
    "departmentId": "uuid",
    "requestType": "goods",
    "status": "draft",
    "isDefault": false,
    "estimatedTotal": 2500.00,
    "itemCount": 5,
    "sourceTemplateId": "original-uuid",
    "sourceTemplateNumber": "TPL-24-0001"
  },
  "message": "Template cloned successfully"
}
```

---

## 3. Server Actions (Next.js)

For Next.js App Router integration, implement server actions in `app/(main)/procurement/purchase-request-templates/actions.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Types
interface CreateTemplateInput {
  description: string
  departmentId: string
  requestType: 'goods' | 'services' | 'capital'
  currency?: string
}

interface UpdateTemplateInput {
  id: string
  description?: string
  departmentId?: string
  requestType?: 'goods' | 'services' | 'capital'
  status?: 'draft' | 'active' | 'inactive'
  currency?: string
}

interface TemplateItemInput {
  itemCode: string
  description: string
  uom: string
  quantity: number
  unitPrice: number
  budgetCode: string
  accountCode: string
  department: string
  taxCode: string
  currency?: string
}

// Server Actions
export async function createTemplate(input: CreateTemplateInput) {
  // Implementation
}

export async function updateTemplate(input: UpdateTemplateInput) {
  // Implementation
}

export async function deleteTemplate(id: string) {
  // Implementation
}

export async function cloneTemplate(id: string) {
  // Implementation
}

export async function setDefaultTemplate(id: string) {
  // Implementation
}

export async function removeDefaultStatus(id: string) {
  // Implementation
}

export async function addTemplateItem(templateId: string, item: TemplateItemInput) {
  // Implementation
}

export async function updateTemplateItem(templateId: string, itemId: string, item: Partial<TemplateItemInput>) {
  // Implementation
}

export async function deleteTemplateItem(templateId: string, itemId: string) {
  // Implementation
}

export async function bulkDeleteTemplates(ids: string[]) {
  // Implementation
}

export async function bulkCloneTemplates(ids: string[]) {
  // Implementation
}
```

---

## 4. Business Rules Summary

### Template Rules
| Rule ID | Description |
|---------|-------------|
| BR-01 | Template numbers follow pattern TPL-YY-NNNN |
| BR-02 | Description minimum 10 characters |
| BR-03 | Only one default template per department |
| BR-04 | Cannot delete default templates |
| BR-05 | Cannot change department if template has items |
| BR-06 | Status transitions: draft → active (needs items), active ↔ inactive |

### Item Rules
| Rule ID | Description |
|---------|-------------|
| BR-07 | Item code unique within template |
| BR-08 | Quantity must be > 0 |
| BR-09 | Unit price must be >= 0 |
| BR-10 | Total amount = quantity × unit_price |
| BR-11 | All financial codes (budget, account, tax) required |

### Calculation Rules
| Rule ID | Description |
|---------|-------------|
| BR-12 | Template estimated_total = SUM(item total_amounts) |
| BR-13 | Recalculate template total after any item change |

---

## 5. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| TEMPLATE_NOT_FOUND | 404 | Template does not exist |
| TEMPLATE_DELETED | 410 | Template has been deleted |
| CANNOT_DELETE_DEFAULT | 400 | Cannot delete default template |
| DUPLICATE_ITEM_CODE | 400 | Item code already exists in template |
| INVALID_STATUS_TRANSITION | 400 | Invalid status change |
| CANNOT_CHANGE_DEPARTMENT | 400 | Cannot change department with existing items |
| VALIDATION_ERROR | 400 | Input validation failed |
| DEPARTMENT_NOT_FOUND | 400 | Referenced department not found |
| UNAUTHORIZED | 401 | User not authenticated |
| FORBIDDEN | 403 | User lacks permission |

---

## 6. Permissions

| Permission | Description |
|------------|-------------|
| templates.view | View template list and details |
| templates.create | Create new templates |
| templates.edit | Edit existing templates |
| templates.delete | Delete templates |
| templates.set_default | Set/remove default status |
| templates.bulk_operations | Perform bulk delete/clone |

---

## 7. Audit Logging

All template operations should be logged:

```sql
CREATE TABLE template_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,  -- created, updated, deleted, cloned, set_default, etc.
  changes JSONB,                 -- Before/after values for updates
  performed_by UUID NOT NULL REFERENCES users(id),
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX idx_audit_template ON template_audit_log(template_id);
CREATE INDEX idx_audit_action ON template_audit_log(action);
CREATE INDEX idx_audit_date ON template_audit_log(performed_at);
```

---

## 8. Future Enhancements (Phase 2)

Features documented but NOT in current prototype scope:

| Feature | Description | Priority |
|---------|-------------|----------|
| Template → PR Conversion | "Use Template" to create Purchase Request | High |
| Advanced Item Fields | Discount rate, tax rate, tax included flag | Medium |
| Template Versioning | Track template changes over time | Medium |
| Template Approval Workflow | Require approval for template activation | Low |
| Template Sharing | Share templates across departments | Low |
| Import/Export | Bulk import/export via CSV/Excel | Low |

---

## Appendix: Prototype UI → API Mapping

| UI Action | API Endpoint | Method |
|-----------|--------------|--------|
| Load template list | /api/procurement/templates | GET |
| Search templates | /api/procurement/templates?search=... | GET |
| Filter by type | /api/procurement/templates?request_type=... | GET |
| Filter by status | /api/procurement/templates?status=... | GET |
| View template | /api/procurement/templates/:id | GET |
| Create template | /api/procurement/templates | POST |
| Edit template | /api/procurement/templates/:id | PUT |
| Delete template | /api/procurement/templates/:id | DELETE |
| Clone template | /api/procurement/templates/:id/clone | POST |
| Set as default | /api/procurement/templates/:id/set-default | POST |
| Add item | /api/procurement/templates/:id/items | POST |
| Edit item | /api/procurement/templates/:id/items/:itemId | PUT |
| Delete item | /api/procurement/templates/:id/items/:itemId | DELETE |
| Bulk delete | /api/procurement/templates/bulk/delete | POST |
| Bulk clone | /api/procurement/templates/bulk/clone | POST |

---

**Document End**
