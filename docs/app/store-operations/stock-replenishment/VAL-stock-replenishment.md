# Validation Rules: Stock Replenishment Module

## 1. Overview

This document defines all validation rules for the Stock Replenishment module, including field-level validations, business rule validations, and cross-field validations.

## 2. Validation Rule Categories

| Category | Code Prefix | Description |
|----------|-------------|-------------|
| Field Validation | VAL-FLD | Individual field format and constraint checks |
| Business Rule | VAL-BIZ | Business logic and domain rules |
| Cross-Field | VAL-XFD | Validations involving multiple fields |
| Security | VAL-SEC | Access control and permission checks |

## 3. Field Validations

### 3.1 Replenishment Suggestion Fields

| Rule ID | Field | Validation | Error Message |
|---------|-------|------------|---------------|
| VAL-FLD-001 | currentStock | >= 0 | Stock quantity cannot be negative |
| VAL-FLD-002 | parLevel | > 0 | PAR level must be greater than zero |
| VAL-FLD-003 | reorderPoint | > 0 AND < parLevel | Reorder point must be between 0 and PAR level |
| VAL-FLD-004 | suggestedQty | > 0 | Suggested quantity must be positive |
| VAL-FLD-005 | minOrderQty | >= 1 | Minimum order quantity must be at least 1 |
| VAL-FLD-006 | maxOrderQty | >= minOrderQty | Maximum must be >= minimum order quantity |
| VAL-FLD-007 | estimatedUnitCost | >= 0 | Unit cost cannot be negative |
| VAL-FLD-008 | productId | NOT NULL | Product reference is required |
| VAL-FLD-009 | locationId | NOT NULL | Location reference is required |

### 3.2 Replenishment Request Fields

| Rule ID | Field | Validation | Error Message |
|---------|-------|------------|---------------|
| VAL-FLD-010 | sourceLocationId | NOT NULL OR 'none' | Source location is required |
| VAL-FLD-011 | destinationLocationId | NOT NULL | Destination location is required |
| VAL-FLD-012 | requiredDate | >= TODAY | Required date must be today or in the future |
| VAL-FLD-013 | priority | IN ('standard', 'urgent', 'emergency') | Invalid priority value |
| VAL-FLD-014 | items | length > 0 | At least one item is required |
| VAL-FLD-015 | items[].requestedQty | > 0 | Requested quantity must be positive |
| VAL-FLD-016 | items[].productId | NOT NULL | Product reference is required |
| VAL-FLD-017 | notes | length <= 500 | Notes cannot exceed 500 characters |

### 3.3 Store Requisition Fields

| Rule ID | Field | Validation | Error Message |
|---------|-------|------------|---------------|
| VAL-FLD-018 | refNo | FORMAT: SR-YYMM-NNNN | Invalid reference number format |
| VAL-FLD-019 | requestDate | NOT NULL | Request date is required |
| VAL-FLD-020 | status | VALID_ENUM | Invalid status value |
| VAL-FLD-021 | workflowType | VALID_ENUM | Invalid workflow type |
| VAL-FLD-022 | departmentId | NOT NULL | Department is required |
| VAL-FLD-023 | requestorId | NOT NULL | Requestor is required |

## 4. Business Rule Validations

### 4.1 Location Type Rules

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-BIZ-001 | Source Location Type | sourceLocationType = INVENTORY OR sourceLocationId = 'none' | Only INVENTORY locations can be transfer sources |
| VAL-BIZ-002 | Destination Location Type | destinationLocationType != DIRECT | Cannot replenish DIRECT expense locations |
| VAL-BIZ-003 | CONSIGNMENT Source | IF sourceLocationType = CONSIGNMENT THEN WARNING | Vendor notification required for consignment transfers |
| VAL-BIZ-004 | PR-Only Workflow | IF sourceLocationId = 'none' THEN workflowType = 'pr_only' | PR-only workflow requires no source location |

### 4.2 Stock Availability Rules

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-BIZ-005 | Stock Availability | requestedQty <= sourceAvailableQty OR sourceLocationId = 'none' | Insufficient stock at source location |
| VAL-BIZ-006 | Partial Fulfillment | IF requestedQty > sourceAvailableQty THEN CREATE_PR_FOR_SHORTFALL | Shortfall will be directed to Purchase Request |
| VAL-BIZ-007 | Reserved Stock | requestedQty <= (availableQty - reservedQty) | Stock is reserved for other requests |
| VAL-BIZ-008 | PAR Level Check | currentStock < parLevel | Item does not need replenishment |

### 4.3 Quantity Rules

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-BIZ-009 | Minimum Order | requestedQty >= minOrderQty | Quantity below minimum order requirement |
| VAL-BIZ-010 | Maximum Order | requestedQty <= maxOrderQty | Quantity exceeds maximum order limit |
| VAL-BIZ-011 | Approved vs Requested | approvedQty <= requestedQty | Approved quantity cannot exceed requested |
| VAL-BIZ-012 | Issued vs Approved | issuedQty <= approvedQty | Issued quantity cannot exceed approved |

### 4.4 Workflow Rules

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-BIZ-013 | Status Transition | status transition VALID | Invalid status transition |
| VAL-BIZ-014 | Emergency Priority | IF priority = 'emergency' THEN SKIP_APPROVAL | Emergency requests bypass approval |
| VAL-BIZ-015 | Document Generation | status = 'approved' BEFORE generateDocuments | Documents can only be generated after approval |
| VAL-BIZ-016 | Cancellation | status IN ('draft', 'submitted') FOR cancel | Cannot cancel approved or processed requisitions |

## 5. Cross-Field Validations

### 5.1 Location Pair Validations

| Rule ID | Fields | Validation | Error Message |
|---------|--------|------------|---------------|
| VAL-XFD-001 | sourceLocationId, destinationLocationId | source != destination (unless source = 'none') | Source and destination cannot be the same |
| VAL-XFD-002 | sourceLocationType, destinationLocationType | VALID_TRANSFER_COMBINATION | Invalid transfer between location types |
| VAL-XFD-003 | sourceLocationId, items | ALL items.productId EXISTS at source | Product not available at source location |

### 5.2 Quantity Pair Validations

| Rule ID | Fields | Validation | Error Message |
|---------|--------|------------|---------------|
| VAL-XFD-004 | suggestedQty, currentStock, parLevel | suggestedQty = parLevel - currentStock (adjusted) | Suggested quantity calculation mismatch |
| VAL-XFD-005 | totalQuantity, items | totalQuantity = SUM(items.requestedQty) | Total quantity mismatch |
| VAL-XFD-006 | estimatedValue, items | estimatedValue = SUM(items.totalCost) | Estimated value calculation error |

### 5.3 Fulfillment Validations

| Rule ID | Fields | Validation | Error Message |
|---------|--------|------------|---------------|
| VAL-XFD-007 | fulfillment.fromStock, fulfillment.toPurchase | fromStock + toPurchase = requestedQty | Fulfillment breakdown mismatch |
| VAL-XFD-008 | sourceAvailableQty, fulfillment.fromStock | fromStock <= sourceAvailableQty | Fulfillment exceeds available stock |

## 6. Security Validations

### 6.1 Access Control

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-SEC-001 | Module Access | user.hasPermission('stock_replenishment.view') | Access denied to Stock Replenishment module |
| VAL-SEC-002 | Create Permission | user.hasPermission('stock_replenishment.create') | Not authorized to create replenishment requests |
| VAL-SEC-003 | Location Access | user.canAccessLocation(destinationLocationId) | Not authorized for this location |
| VAL-SEC-004 | Department Access | user.canAccessDepartment(departmentId) | Not authorized for this department |
| VAL-SEC-005 | PR Workflow | user.hasPermission('purchase_request.create') | Not authorized for PR workflow |
| VAL-SEC-006 | Emergency Priority | user.hasRole('manager') OR user.hasRole('admin') | Only managers can set emergency priority |

### 6.2 Data Access

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-SEC-007 | Own Location View | IF role = 'department_manager' THEN filter by department | Access limited to own department |
| VAL-SEC-008 | Cost Data Access | user.hasPermission('view_costs') | Not authorized to view cost information |
| VAL-SEC-009 | History Access | user.hasPermission('stock_replenishment.history') | Not authorized to view history |

## 7. Validation Implementation

### 7.1 Client-Side Validation (Zod Schema)

```typescript
import { z } from 'zod'

export const replenishmentRequestSchema = z.object({
  sourceLocationId: z.string().min(1, 'Source location is required'),
  destinationLocationId: z.string().min(1, 'Destination location is required'),
  requiredDate: z.date().min(new Date(), 'Required date must be in the future'),
  priority: z.enum(['standard', 'urgent', 'emergency']),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    requestedQty: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required')
  })).min(1, 'At least one item is required')
}).refine(
  data => data.sourceLocationId !== data.destinationLocationId || data.sourceLocationId === 'none',
  { message: 'Source and destination cannot be the same', path: ['destinationLocationId'] }
)

export const urgencySchema = z.enum(['critical', 'warning', 'low'])

export const locationTypeSchema = z.enum(['INVENTORY', 'DIRECT', 'CONSIGNMENT'])
```

### 7.2 Server-Side Validation Functions

```typescript
// Location type validation
function validateSourceLocation(
  sourceLocationId: string,
  locations: InventoryLocation[]
): ValidationResult {
  if (sourceLocationId === NONE_SOURCE_ID) {
    return { valid: true, workflow: 'pr_only' }
  }
  
  const location = locations.find(l => l.id === sourceLocationId)
  if (!location) {
    return { valid: false, error: 'Source location not found' }
  }
  
  if (location.type !== InventoryLocationType.INVENTORY) {
    return { valid: false, error: 'Only INVENTORY locations can be transfer sources' }
  }
  
  return { valid: true }
}

function validateDestinationLocation(
  destinationLocationId: string,
  locations: InventoryLocation[]
): ValidationResult {
  const location = locations.find(l => l.id === destinationLocationId)
  if (!location) {
    return { valid: false, error: 'Destination location not found' }
  }
  
  if (location.type === InventoryLocationType.DIRECT) {
    return { valid: false, error: 'Cannot replenish DIRECT expense locations' }
  }
  
  return { valid: true }
}

// Stock availability validation
function validateStockAvailability(
  productId: string,
  requestedQty: number,
  sourceLocationId: string,
  stockBalances: StockBalance[]
): ValidationResult {
  if (sourceLocationId === NONE_SOURCE_ID) {
    return { valid: true, fulfillment: 'pr_only' }
  }
  
  const balance = stockBalances.find(
    b => b.productId === productId && b.locationId === sourceLocationId
  )
  
  const available = balance?.availableQty ?? 0
  
  if (requestedQty > available) {
    return {
      valid: true, // Allow with warning
      warning: `Only ${available} available, ${requestedQty - available} will go to PR`,
      fulfillment: 'partial'
    }
  }
  
  return { valid: true, fulfillment: 'full' }
}
```

## 8. Error Handling

### 8.1 Validation Error Response Format

```typescript
interface ValidationError {
  field: string
  ruleId: string
  message: string
  severity: 'error' | 'warning' | 'info'
  details?: Record<string, unknown>
}

interface ValidationResponse {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}
```

### 8.2 Example Error Responses

```json
// Source location validation error
{
  "valid": false,
  "errors": [
    {
      "field": "sourceLocationId",
      "ruleId": "VAL-BIZ-001",
      "message": "Only INVENTORY locations can be transfer sources",
      "severity": "error",
      "details": {
        "locationType": "DIRECT",
        "locationName": "Bar Direct"
      }
    }
  ],
  "warnings": []
}

// Partial fulfillment warning
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "field": "items[0].requestedQty",
      "ruleId": "VAL-BIZ-006",
      "message": "Shortfall will be directed to Purchase Request",
      "severity": "warning",
      "details": {
        "requested": 50,
        "available": 30,
        "shortfall": 20
      }
    }
  ]
}
```

## 9. Validation Triggers

| Trigger Point | Validations Applied |
|---------------|---------------------|
| Form Field Change | VAL-FLD-* (field-level) |
| Form Submit | All VAL-FLD-*, VAL-XFD-* |
| API Request | All validations |
| Status Change | VAL-BIZ-013, VAL-BIZ-* |
| Document Generation | VAL-BIZ-015, VAL-XFD-007, VAL-XFD-008 |

## 10. Validation Summary Matrix

| Validation Type | Client-Side | Server-Side | Real-Time |
|----------------|-------------|-------------|-----------|
| Field Format | ✓ | ✓ | ✓ |
| Required Fields | ✓ | ✓ | ✓ |
| Business Rules | ✓ (basic) | ✓ (full) | - |
| Cross-Field | ✓ | ✓ | - |
| Stock Availability | - | ✓ | ✓ (refresh) |
| Security | - | ✓ | - |
| Location Type | ✓ | ✓ | - |
