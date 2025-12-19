# Validation Rules: Stock Issues View

## 1. Overview

**KEY ARCHITECTURE**: Stock Issues are NOT separate documents. They are **filtered views** of Store Requisitions at the Issue stage with DIRECT type destinations.

This document defines validation rules for the Stock Issues **view**. All document-level validations (create, issue, complete) are performed on the underlying Store Requisition.

### 1.1 Validation Scope

| Scope | Location | Description |
|-------|----------|-------------|
| View Filter | Stock Issue View | Validates SR matches issue criteria |
| Display | Stock Issue View | Validates data for display |
| Actions | Store Requisition | All actions validated on SR |

## 2. Validation Rule Categories

| Category | Code Prefix | Description |
|----------|-------------|-------------|
| View Validation | VAL-VIEW | Validates SR appears correctly in issue view |
| Display Validation | VAL-DSP | Validates data for display purposes |
| Security | VAL-SEC | Access control for view |

**Removed Categories** (now on SR):
- ~~Field Validation (VAL-FLD)~~ → On SR
- ~~Business Rule (VAL-BIZ)~~ → On SR
- ~~Cross-Field (VAL-XFD)~~ → On SR

## 3. View Filter Validations

### 3.1 Issue View Criteria

| Rule ID | Criteria | Validation | Error Message |
|---------|----------|------------|---------------|
| VAL-VIEW-001 | Stage | stage IN ('issue', 'complete') | SR must be at Issue or Complete stage |
| VAL-VIEW-002 | Destination Type | destinationLocationType = 'DIRECT' | Destination must be DIRECT type |
| VAL-VIEW-003 | Status | status IN ('in_progress', 'completed') | SR must be active or completed |

### 3.2 View Filter Function

```typescript
// Validation function for issue view
function isValidIssue(sr: StoreRequisition): boolean {
  // VAL-VIEW-001: Check stage
  const validStage = sr.stage === SRStage.Issue || sr.stage === SRStage.Complete

  // VAL-VIEW-002: Check destination type
  const validDestination = sr.destinationLocationType === InventoryLocationType.DIRECT

  // VAL-VIEW-003: Check status (cancelled/voided don't appear in view)
  const validStatus = sr.status === SRStatus.InProgress || sr.status === SRStatus.Completed

  return validStage && validDestination && validStatus
}
```

### 3.3 Detail Page Validation

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-VIEW-004 | SR Exists | SR found by ID | Issue not found |
| VAL-VIEW-005 | Valid Issue | isValidIssue(sr) = true | This SR is not a stock issue |

## 4. Display Validations

### 4.1 Required Display Fields

| Rule ID | Field | Validation | Fallback |
|---------|-------|------------|----------|
| VAL-DSP-001 | refNo | NOT NULL | Display "N/A" |
| VAL-DSP-002 | status | Valid SRStatus enum | Display "Unknown" |
| VAL-DSP-003 | sourceLocationName | NOT NULL | Display location code |
| VAL-DSP-004 | destinationLocationName | NOT NULL | Display location code |
| VAL-DSP-005 | departmentName | NOT NULL for DIRECT | Display "Unassigned" |
| VAL-DSP-006 | items | Array exists | Display empty table |
| VAL-DSP-007 | estimatedValue | Valid Money object | Display "$0.00" |

### 4.2 Computed Display Values

| Rule ID | Field | Validation | Error Handling |
|---------|-------|------------|----------------|
| VAL-DSP-008 | totalItems | items.length >= 0 | Display 0 |
| VAL-DSP-009 | totalQuantity | SUM(items.issuedQty) >= 0 | Display 0 |
| VAL-DSP-010 | totalValue | SUM(items.totalCost) >= 0 | Display $0.00 |

## 5. Security Validations

### 5.1 View Access Control

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-SEC-001 | Module Access | user.hasPermission('store_operations.view') | Access denied to Stock Issues |
| VAL-SEC-002 | Location Access | user.canAccessLocation(sr.sourceLocationId) | Not authorized for source location |
| VAL-SEC-003 | Department Access | user.canAccessDepartment(sr.departmentId) | Not authorized for this department |

### 5.2 Action Permissions (Via SR)

| Rule ID | Rule | Where Validated | Error Message |
|---------|------|-----------------|---------------|
| VAL-SEC-004 | Complete SR | Store Requisition | Not authorized to complete requisition |
| VAL-SEC-005 | Print Issue | Stock Issue View | Not authorized to print |
| VAL-SEC-006 | View Full SR | Store Requisition | Not authorized to view requisition |

**Note**: All workflow actions (issue, complete, cancel) are validated on the Store Requisition, not the issue view.

### 5.3 Data Access

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-SEC-007 | Own Department View | IF role = 'department_manager' THEN filter by department | Access limited to own department |
| VAL-SEC-008 | Cost Data Access | user.hasPermission('view_costs') | Cost information hidden |
| VAL-SEC-009 | Expense Account Access | user.hasPermission('view_expense_accounts') | Expense account hidden |

## 6. Validation Implementation

### 6.1 View Filter Validation (TypeScript)

```typescript
import { SRStage, SRStatus, InventoryLocationType, StoreRequisition } from '@/lib/types'

// View filter validation
export function validateIssueView(sr: StoreRequisition): ValidationResult {
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
  if (sr.destinationLocationType !== InventoryLocationType.DIRECT) {
    errors.push({
      field: 'destinationLocationType',
      ruleId: 'VAL-VIEW-002',
      message: 'Destination must be DIRECT type',
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
export function validateIssueDetail(sr: StoreRequisition | null, id: string): ValidationResult {
  // VAL-VIEW-004: SR exists
  if (!sr) {
    return {
      valid: false,
      errors: [{
        field: 'id',
        ruleId: 'VAL-VIEW-004',
        message: 'Issue not found',
        severity: 'error'
      }],
      warnings: []
    }
  }

  // VAL-VIEW-005: Valid issue
  const viewValidation = validateIssueView(sr)
  if (!viewValidation.valid) {
    return {
      valid: false,
      errors: [{
        field: 'sr',
        ruleId: 'VAL-VIEW-005',
        message: 'This SR is not a stock issue',
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
export function validateIssueAccess(
  sr: StoreRequisition,
  user: User
): ValidationResult {
  const errors: ValidationError[] = []

  // VAL-SEC-001: Module access
  if (!user.hasPermission('store_operations.view')) {
    errors.push({
      field: 'permission',
      ruleId: 'VAL-SEC-001',
      message: 'Access denied to Stock Issues',
      severity: 'error'
    })
  }

  // VAL-SEC-002: Location access
  if (!user.canAccessLocation(sr.sourceLocationId)) {
    errors.push({
      field: 'sourceLocation',
      ruleId: 'VAL-SEC-002',
      message: 'Not authorized for source location',
      severity: 'error'
    })
  }

  // VAL-SEC-003: Department access (if user is department-restricted)
  if (sr.departmentId && !user.canAccessDepartment(sr.departmentId)) {
    errors.push({
      field: 'department',
      ruleId: 'VAL-SEC-003',
      message: 'Not authorized for this department',
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
// Issue not found
{
  "valid": false,
  "errors": [
    {
      "field": "id",
      "ruleId": "VAL-VIEW-004",
      "message": "Issue not found",
      "severity": "error",
      "details": {
        "requestedId": "sr-999"
      }
    }
  ],
  "warnings": []
}

// Not a valid issue (wrong destination type)
{
  "valid": false,
  "errors": [
    {
      "field": "sr",
      "ruleId": "VAL-VIEW-005",
      "message": "This SR is not a stock issue",
      "severity": "error",
      "details": {
        "srId": "sr-001",
        "destinationType": "INVENTORY",
        "expectedType": "DIRECT"
      }
    }
  ],
  "warnings": []
}

// Department access denied
{
  "valid": false,
  "errors": [
    {
      "field": "department",
      "ruleId": "VAL-SEC-003",
      "message": "Not authorized for this department",
      "severity": "error",
      "details": {
        "departmentId": "dept-003",
        "departmentName": "Food & Beverage"
      }
    }
  ],
  "warnings": []
}
```

## 8. Validation Triggers

| Trigger Point | Validations Applied |
|---------------|---------------------|
| List Page Load | VAL-VIEW-001, VAL-VIEW-002, VAL-VIEW-003, VAL-SEC-001 |
| Detail Page Load | VAL-VIEW-004, VAL-VIEW-005, VAL-SEC-001, VAL-SEC-002, VAL-SEC-003 |
| Search/Filter | VAL-DSP-* (display validations) |
| Print Action | VAL-SEC-005 |
| View Full SR | VAL-SEC-006 |

## 9. Validation Summary Matrix

| Validation Type | Client-Side | Server-Side | Real-Time |
|----------------|-------------|-------------|-----------|
| View Filter | ✓ | ✓ | - |
| Display Values | ✓ | ✓ | - |
| Access Control | - | ✓ | - |
| Location Access | - | ✓ | - |
| Department Access | - | ✓ | - |

## 10. Removed Validations (Previous Architecture)

The following validations have been **removed** as they applied to the separate StockIssue entity:

| Previous Rule ID | Previous Rule | Current Status |
|------------------|---------------|----------------|
| VAL-FLD-001 | refNo format SI-YYMM-NNNN | Uses SR refNo (SR-YYMM-NNNN) |
| VAL-FLD-003 | IssueStatus enum | Uses SRStatus enum |
| VAL-BIZ-015-020 | Status transitions | **Removed** (SR handles workflow) |

## 11. SR-Level Validations (Reference)

The following validations are performed on the Store Requisition, not the issue view:

| SR Rule | Description | Where Applied |
|---------|-------------|---------------|
| SR-VAL-001 | SR reference format | SR creation |
| SR-VAL-002 | Location type validation | SR creation/edit |
| SR-VAL-003 | Stock availability | SR issue stage |
| SR-VAL-004 | Quantity validations | SR item editing |
| SR-VAL-005 | Status transitions | SR workflow |
| SR-VAL-006 | Issue permissions | SR issue action |
| SR-VAL-007 | Complete permissions | SR complete action |
| SR-VAL-008 | Department required for DIRECT | SR creation for DIRECT dest |
| SR-VAL-009 | Expense account validation | SR creation/edit |

See `docs/app/store-operations/store-requisitions/VAL-store-requisitions.md` for full SR validation rules.

## 12. Department-Specific Validation

### 12.1 Department Validation for DIRECT Destinations

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-VIEW-006 | Department Required | IF destType = DIRECT THEN departmentId IS NOT NULL | Department required for issues |
| VAL-VIEW-007 | Department Active | department.isActive = true | Department must be active |

### 12.2 Expense Account Validation

| Rule ID | Rule | Validation | Error Message |
|---------|------|------------|---------------|
| VAL-VIEW-008 | Expense Account Active | IF expenseAccountId THEN account.isActive = true | Expense account must be active |
| VAL-VIEW-009 | Default Account | IF !expenseAccountId THEN department has default | Uses department default account |

**Note**: These validations are displayed for information in the view but enforced on the SR level.
