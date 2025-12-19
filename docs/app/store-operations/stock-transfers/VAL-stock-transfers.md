# Validation Rules: Stock Transfers View

## 1. Overview

**KEY ARCHITECTURE**: Stock Transfers are NOT separate documents. They are **filtered views** of Store Requisitions at the Issue stage with INVENTORY type destinations.

This document defines validation rules for the Stock Transfers **view**. All document-level validations (create, issue, complete) are performed on the underlying Store Requisition.

### 1.1 Validation Scope

| Scope | Location | Description |
|-------|----------|-------------|
| View Filter | Stock Transfer View | Validates SR matches transfer criteria |
| Display | Stock Transfer View | Validates data for display |
| Actions | Store Requisition | All actions validated on SR |

## 2. Validation Rule Categories

| Category | Code Prefix | Description |
|----------|-------------|-------------|
| View Validation | VAL-VIEW | Validates SR appears correctly in transfer view |
| Display Validation | VAL-DSP | Validates data for display purposes |
| Security | VAL-SEC | Access control for view |

**Removed Categories** (now on SR):
- ~~Field Validation (VAL-FLD)~~ → On SR
- ~~Business Rule (VAL-BIZ)~~ → On SR
- ~~Cross-Field (VAL-XFD)~~ → On SR

## 3. View Filter Validations

### 3.1 Transfer View Criteria

| Rule ID | Criteria | Validation | Error Message |
|---------|----------|------------|---------------|
| VAL-VIEW-001 | Stage | stage IN ('issue', 'complete') | SR must be at Issue or Complete stage |
| VAL-VIEW-002 | Destination Type | destinationLocationType = 'INVENTORY' | Destination must be INVENTORY type |
| VAL-VIEW-003 | Status | status IN ('in_progress', 'completed') | SR must be active or completed |

### 3.2 View Filter Function

```typescript
// Validation function for transfer view
function isValidTransfer(sr: StoreRequisition): boolean {
  // VAL-VIEW-001: Check stage
  const validStage = sr.stage === SRStage.Issue || sr.stage === SRStage.Complete

  // VAL-VIEW-002: Check destination type
  const validDestination = sr.destinationLocationType === InventoryLocationType.INVENTORY

  // VAL-VIEW-003: Check status (cancelled/voided don't appear in view)
  const validStatus = sr.status === SRStatus.InProgress || sr.status === SRStatus.Completed

  return validStage && validDestination && validStatus
}
```

### 3.3 Detail Page Validation

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-VIEW-004 | SR Exists | SR found by ID | Transfer not found |
| VAL-VIEW-005 | Valid Transfer | isValidTransfer(sr) = true | This SR is not a stock transfer |

## 4. Display Validations

### 4.1 Required Display Fields

| Rule ID | Field | Validation | Fallback |
|---------|-------|------------|----------|
| VAL-DSP-001 | refNo | NOT NULL | Display "N/A" |
| VAL-DSP-002 | status | Valid SRStatus enum | Display "Unknown" |
| VAL-DSP-003 | sourceLocationName | NOT NULL | Display location code |
| VAL-DSP-004 | destinationLocationName | NOT NULL | Display location code |
| VAL-DSP-005 | items | Array exists | Display empty table |
| VAL-DSP-006 | estimatedValue | Valid Money object | Display "$0.00" |

### 4.2 Computed Display Values

| Rule ID | Field | Validation | Error Handling |
|---------|-------|------------|----------------|
| VAL-DSP-007 | totalItems | items.length >= 0 | Display 0 |
| VAL-DSP-008 | totalQuantity | SUM(items.issuedQty) >= 0 | Display 0 |
| VAL-DSP-009 | totalValue | SUM(items.totalCost) >= 0 | Display $0.00 |

## 5. Security Validations

### 5.1 View Access Control

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-SEC-001 | Module Access | user.hasPermission('store_operations.view') | Access denied to Stock Transfers |
| VAL-SEC-002 | Location Access | user.canAccessLocation(sr.sourceLocationId) OR user.canAccessLocation(sr.destinationLocationId) | Not authorized for these locations |

### 5.2 Action Permissions (Via SR)

| Rule ID | Rule | Where Validated | Error Message |
|---------|------|-----------------|---------------|
| VAL-SEC-003 | Complete SR | Store Requisition | Not authorized to complete requisition |
| VAL-SEC-004 | Print Transfer | Stock Transfer View | Not authorized to print |
| VAL-SEC-005 | View Full SR | Store Requisition | Not authorized to view requisition |

**Note**: All workflow actions (issue, complete, cancel) are validated on the Store Requisition, not the transfer view.

### 5.3 Data Access

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-SEC-006 | Own Location View | IF role = 'warehouse_staff' THEN filter by assigned location | Access limited to assigned locations |
| VAL-SEC-007 | Cost Data Access | user.hasPermission('view_costs') | Cost information hidden |

## 6. Validation Implementation

### 6.1 View Filter Validation (TypeScript)

```typescript
import { SRStage, SRStatus, InventoryLocationType, StoreRequisition } from '@/lib/types'

// View filter validation
export function validateTransferView(sr: StoreRequisition): ValidationResult {
  const errors: ValidationError[] = []

  // VAL-VIEW-001: Stage validation
  if (sr.stage !== SRStage.Issue && sr.stage !== SRStage.Complete) {
    errors.push({
      field: 'stage',
      ruleId: 'VAL-VIEW-001',
      message: 'SR must be at Issue or Complete stage',
      severity: 'error'
    })
  }

  // VAL-VIEW-002: Destination type validation
  if (sr.destinationLocationType !== InventoryLocationType.INVENTORY) {
    errors.push({
      field: 'destinationLocationType',
      ruleId: 'VAL-VIEW-002',
      message: 'Destination must be INVENTORY type',
      severity: 'error'
    })
  }

  // VAL-VIEW-003: Status validation
  if (sr.status !== SRStatus.InProgress && sr.status !== SRStatus.Completed) {
    errors.push({
      field: 'status',
      ruleId: 'VAL-VIEW-003',
      message: 'SR must be active or completed',
      severity: 'error'
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  }
}

// Detail page validation
export function validateTransferDetail(sr: StoreRequisition | null, id: string): ValidationResult {
  // VAL-VIEW-004: SR exists
  if (!sr) {
    return {
      valid: false,
      errors: [{
        field: 'id',
        ruleId: 'VAL-VIEW-004',
        message: 'Transfer not found',
        severity: 'error'
      }],
      warnings: []
    }
  }

  // VAL-VIEW-005: Valid transfer
  const viewValidation = validateTransferView(sr)
  if (!viewValidation.valid) {
    return {
      valid: false,
      errors: [{
        field: 'sr',
        ruleId: 'VAL-VIEW-005',
        message: 'This SR is not a stock transfer',
        severity: 'error'
      }],
      warnings: []
    }
  }

  return { valid: true, errors: [], warnings: [] }
}
```

### 6.2 Security Validation

```typescript
// Access control validation
export function validateTransferAccess(
  sr: StoreRequisition,
  user: User
): ValidationResult {
  const errors: ValidationError[] = []

  // VAL-SEC-001: Module access
  if (!user.hasPermission('store_operations.view')) {
    errors.push({
      field: 'permission',
      ruleId: 'VAL-SEC-001',
      message: 'Access denied to Stock Transfers',
      severity: 'error'
    })
  }

  // VAL-SEC-002: Location access
  const canAccessSource = user.canAccessLocation(sr.sourceLocationId)
  const canAccessDest = user.canAccessLocation(sr.destinationLocationId)

  if (!canAccessSource && !canAccessDest) {
    errors.push({
      field: 'location',
      ruleId: 'VAL-SEC-002',
      message: 'Not authorized for these locations',
      severity: 'error'
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  }
}
```

## 7. Error Handling

### 7.1 Validation Error Response Format

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

### 7.2 Example Error Responses

```json
// Transfer not found
{
  "valid": false,
  "errors": [
    {
      "field": "id",
      "ruleId": "VAL-VIEW-004",
      "message": "Transfer not found",
      "severity": "error",
      "details": {
        "requestedId": "sr-999"
      }
    }
  ],
  "warnings": []
}

// Not a valid transfer (wrong destination type)
{
  "valid": false,
  "errors": [
    {
      "field": "sr",
      "ruleId": "VAL-VIEW-005",
      "message": "This SR is not a stock transfer",
      "severity": "error",
      "details": {
        "srId": "sr-001",
        "destinationType": "DIRECT",
        "expectedType": "INVENTORY"
      }
    }
  ],
  "warnings": []
}

// Access denied
{
  "valid": false,
  "errors": [
    {
      "field": "permission",
      "ruleId": "VAL-SEC-001",
      "message": "Access denied to Stock Transfers",
      "severity": "error"
    }
  ],
  "warnings": []
}
```

## 8. Validation Triggers

| Trigger Point | Validations Applied |
|---------------|---------------------|
| List Page Load | VAL-VIEW-001, VAL-VIEW-002, VAL-VIEW-003, VAL-SEC-001 |
| Detail Page Load | VAL-VIEW-004, VAL-VIEW-005, VAL-SEC-001, VAL-SEC-002 |
| Search/Filter | VAL-DSP-* (display validations) |
| Print Action | VAL-SEC-004 |
| View Full SR | VAL-SEC-005 |

## 9. Validation Summary Matrix

| Validation Type | Client-Side | Server-Side | Real-Time |
|----------------|-------------|-------------|-----------|
| View Filter | ✓ | ✓ | - |
| Display Values | ✓ | ✓ | - |
| Access Control | - | ✓ | - |
| Location Access | - | ✓ | - |

## 10. Removed Validations (Previous Architecture)

The following validations have been **removed** as they applied to the separate StockTransfer entity:

| Previous Rule ID | Previous Rule | Current Status |
|------------------|---------------|----------------|
| VAL-FLD-001 | refNo format ST-YYMM-NNNN | Uses SR refNo (SR-YYMM-NNNN) |
| VAL-FLD-003 | TransferStatus enum | Uses SRStatus enum |
| VAL-FLD-014 | receivedQty >= 0 | **Removed** (no receipt) |
| VAL-BIZ-009 | receivedQty <= issuedQty | **Removed** (no receipt) |
| VAL-BIZ-012-019 | Status transitions | **Removed** (SR handles workflow) |
| VAL-XFD-004 | receivedQty <= issuedQty | **Removed** (no receipt) |
| VAL-XFD-008 | receivedAt >= issuedAt | **Removed** (no receipt) |
| VAL-SEC-003 | Receive permission | **Removed** (no receipt) |

## 11. SR-Level Validations (Reference)

The following validations are performed on the Store Requisition, not the transfer view:

| SR Rule | Description | Where Applied |
|---------|-------------|---------------|
| SR-VAL-001 | SR reference format | SR creation |
| SR-VAL-002 | Location type validation | SR creation/edit |
| SR-VAL-003 | Stock availability | SR issue stage |
| SR-VAL-004 | Quantity validations | SR item editing |
| SR-VAL-005 | Status transitions | SR workflow |
| SR-VAL-006 | Issue permissions | SR issue action |
| SR-VAL-007 | Complete permissions | SR complete action |

See `docs/app/store-operations/store-requisitions/VAL-store-requisitions.md` for full SR validation rules.
