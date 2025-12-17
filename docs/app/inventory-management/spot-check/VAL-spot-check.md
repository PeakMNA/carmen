# Validations: Spot Check

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Spot Check
- **Route**: `/app/(main)/inventory-management/spot-check`
- **Version**: 2.1.0
- **Last Updated**: 2025-12-09
- **Owner**: Inventory Management Team
- **Status**: Implemented

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-01-11 | System | Initial version |
| 2.0.0 | 2025-12-06 | System | Updated to reflect actual implementation with client-side validation |
| 2.1.0 | 2025-12-09 | System | Updated for 2-step wizard, revised SelectionMethod values |

---

## Overview

This document defines all validation rules for the Spot Check sub-module. The current implementation uses client-side validation with React Hook Form and Zod schemas.

**Related Documents**:
- [Business Requirements](./BR-spot-check.md)
- [Use Cases](./UC-spot-check.md)
- [Technical Specification](./TS-spot-check.md)
- [Data Definition](./DD-spot-check.md)
- [Flow Diagrams](./FD-spot-check.md)

---

## Validation Architecture

### Current Implementation
The current prototype uses **client-side validation** with:
1. **React Hook Form**: Form state management and validation triggering
2. **Zod Schemas**: Type-safe validation rules and error messages
3. **Component Logic**: Business rule validation in component handlers

### Future Implementation (Server-Side)
When database integration is added:
1. **Server Actions**: Business logic enforcement, security
2. **Prisma Constraints**: Data integrity at database level
3. **Middleware**: Authentication and authorization validation

### Validation Priorities
- **Critical**: Data integrity violations, required fields, type constraints
- **High**: Business rule violations, workflow disruption
- **Medium**: Data quality issues, user experience impact
- **Low**: Formatting preferences, non-critical warnings

---

## Validation Categories

### 1. Field-Level Validations (VAL-SC-001 to 099)
Individual field constraints: required, format, range, length, data type

### 2. Business Rule Validations (VAL-SC-101 to 199)
Business logic enforcement: status transitions, item limits, variance thresholds

### 3. Cross-Field Validations (VAL-SC-201 to 299)
Multi-field dependencies: date relationships, quantity consistency, status dependencies

### 4. Form Step Validations (VAL-SC-301 to 399)
2-step wizard validations: step completion requirements, step transition rules

---

## Field-Level Validations

### VAL-SC-001: Check Type Required
**Priority**: Critical
**Enforcement**: Client (Zod)

**Rule**: The `checkType` field must be one of the defined check types.

**Validation Logic**:
```typescript
checkType: z.enum(['random', 'targeted', 'high-value', 'variance-based', 'cycle-count'], {
  required_error: "Check type is required"
})
```

**Valid Values**:
- `random`: System-selected random sample
- `targeted`: Specific items of interest
- `high-value`: Focus on expensive items
- `variance-based`: Items with historical variance
- `cycle-count`: Part of regular counting cycle

**Error Message**: "Check type is required. Please select a check type."

---

### VAL-SC-002: Location Required
**Priority**: Critical
**Enforcement**: Client (Zod)

**Rule**: The `locationId` field must be a non-empty string referencing a valid location.

**Validation Logic**:
```typescript
locationId: z.string().min(1, { message: "Location is required" })
```

**Error Message**: "Location is required. Please select a location."

---

### VAL-SC-003: Scheduled Date Required
**Priority**: High
**Enforcement**: Client (Zod)

**Rule**: The `scheduledDate` must be a valid date.

**Validation Logic**:
```typescript
scheduledDate: z.date({
  required_error: "Scheduled date is required",
  invalid_type_error: "Invalid date format"
})
```

**Error Message**: "Scheduled date is required."

---

### VAL-SC-004: Scheduled Date Range
**Priority**: Medium
**Enforcement**: Client (Zod)

**Rule**: Scheduled date should be within a reasonable range (not more than 1 year in past or future).

**Validation Logic**:
```typescript
scheduledDate: z.date()
  .min(subYears(new Date(), 1), { message: "Date cannot be more than 1 year in the past" })
  .max(addYears(new Date(), 1), { message: "Date cannot be more than 1 year in the future" })
```

**Error Messages**:
- "Date cannot be more than 1 year in the past."
- "Date cannot be more than 1 year in the future."

---

### VAL-SC-005: Status Required
**Priority**: Critical
**Enforcement**: Client (Zod)

**Rule**: Status must be one of the defined status values.

**Validation Logic**:
```typescript
status: z.enum(['draft', 'pending', 'in-progress', 'completed', 'cancelled', 'on-hold'], {
  required_error: "Status is required"
})
```

**Valid Values**:
- `draft`: Initial creation state
- `pending`: Awaiting start
- `in-progress`: Active counting
- `completed`: Final state
- `cancelled`: Terminated state
- `on-hold`: Temporarily paused

**Error Message**: "Invalid status value."

---

### VAL-SC-006: Priority Required
**Priority**: High
**Enforcement**: Client (Zod)

**Rule**: Priority must be one of the defined priority levels.

**Validation Logic**:
```typescript
priority: z.enum(['low', 'medium', 'high', 'critical'], {
  required_error: "Priority is required"
})
```

**Valid Values**:
- `low`: Low priority
- `medium`: Medium priority (default)
- `high`: High priority
- `critical`: Critical priority

**Error Message**: "Priority is required. Please select a priority level."

---

### VAL-SC-007: Assigned Staff Required
**Priority**: High
**Enforcement**: Client (Zod)

**Rule**: The `assignedTo` field must be a non-empty string.

**Validation Logic**:
```typescript
assignedTo: z.string().min(1, { message: "Assigned staff is required" })
```

**Error Message**: "Assigned staff is required. Please select a staff member."

---

### VAL-SC-008: Reason Required
**Priority**: Medium
**Enforcement**: Client (Zod)

**Rule**: A reason for the spot check must be provided.

**Validation Logic**:
```typescript
reason: z.string().min(1, { message: "Reason is required" })
```

**Error Message**: "Reason is required. Please provide a reason for this spot check."

---

### VAL-SC-009: Counted Quantity Non-Negative
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: Counted quantity cannot be negative.

**Validation Logic**:
```typescript
if (countedQuantity !== null && countedQuantity < 0) {
  setError("Counted quantity cannot be negative")
}
```

**Error Message**: "Counted quantity cannot be negative."

---

### VAL-SC-010: Counted Quantity Required for Completion
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: When marking an item as counted, quantity must be provided.

**Validation Logic**:
```typescript
if (status === 'counted' && countedQuantity === null) {
  setError("Counted quantity is required")
}
```

**Error Message**: "Counted quantity is required for counted items."

---

### VAL-SC-011: Item Condition Required
**Priority**: High
**Enforcement**: Client (Zod)

**Rule**: Item condition must be one of the defined conditions.

**Validation Logic**:
```typescript
condition: z.enum(['good', 'damaged', 'expired', 'missing'], {
  required_error: "Item condition is required"
})
```

**Valid Values**:
- `good`: Item in good condition
- `damaged`: Item is damaged
- `expired`: Item has expired
- `missing`: Item is missing

**Error Message**: "Item condition is required."

---

### VAL-SC-012: Notes Length Limit
**Priority**: Low
**Enforcement**: Client (Zod)

**Rule**: Notes field cannot exceed 500 characters.

**Validation Logic**:
```typescript
notes: z.string().max(500, { message: "Notes cannot exceed 500 characters" }).optional()
```

**Error Message**: "Notes cannot exceed 500 characters."

---

### VAL-SC-013: Check Number Format
**Priority**: Medium
**Enforcement**: Client/Server

**Rule**: Check number must follow format: SC-YYMMDD-XXXX (e.g., SC-251206-0001).

**Validation Logic**:
```typescript
if (checkNumber && !/^SC-\d{6}-\d{4}$/.test(checkNumber)) {
  setError("Invalid check number format")
}
```

**Error Message**: "Invalid check number format. Expected: SC-YYMMDD-XXXX"

---

### VAL-SC-014: Item Selection Method Required
**Priority**: High
**Enforcement**: Client (Zod)

**Rule**: Selection method must be specified for item generation in the 2-step wizard.

**Validation Logic**:
```typescript
selectionMethod: z.enum(['random', 'high-value', 'manual'], {
  required_error: "Selection method is required"
})
```

**Valid Values**:
- `random`: System generates random selection of items
- `high-value`: Automatically selects highest-value items
- `manual`: User selects individual items

**Error Message**: "Selection method is required."

---

### VAL-SC-015: Item Count for Random/High-Value Selection
**Priority**: High
**Enforcement**: Client (Zod)

**Rule**: When using random or high-value selection, item count must be one of the predefined values.

**Validation Logic**:
```typescript
itemCount: z.union([z.literal(10), z.literal(20), z.literal(50)], {
  required_error: "Item count is required"
})
```

**Valid Values**:
- `10`: Quick spot check (minimal items)
- `20`: Standard spot check (default)
- `50`: Comprehensive spot check

**Error Message**: "Item count must be 10, 20, or 50."

---

### VAL-SC-016: Selected Items Required for Manual Selection
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: When using manual selection method, at least one item must be selected.

**Validation Logic**:
```typescript
if (selectionMethod === 'manual' && selectedItems.length === 0) {
  setError("At least one item must be selected for manual selection")
}
```

**Error Message**: "At least one item must be selected when using manual selection."

---

### VAL-SC-017: Skip Reason Required
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: When skipping an item, a reason must be provided.

**Validation Logic**:
```typescript
if (status === 'skipped' && (!skipReason || skipReason.trim() === '')) {
  setError("Skip reason is required")
}
```

**Error Message**: "Skip reason is required when skipping an item."

---

### VAL-SC-018: Cancel Reason Required
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: When cancelling a spot check, a reason must be selected.

**Validation Logic**:
```typescript
if (!cancelReason) {
  setError("Cancellation reason is required")
}
```

**Valid Cancellation Reasons**:
- Items Unavailable
- Staff Unavailable
- Incorrect Items
- Duplicate Check
- Emergency
- Other

**Error Message**: "Cancellation reason is required."

---

## Business Rule Validations

### VAL-SC-101: Minimum Item Count
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: A spot check must include at least 1 item.

**Validation Logic**:
```typescript
if (items.length < 1) {
  setError("Spot check must include at least 1 item")
}
```

**Error Message**: "Spot check must include at least 1 item. Please add items before proceeding."

---

### VAL-SC-102: Items Required Before Submission
**Priority**: High
**Enforcement**: Client (Wizard Step Validation)

**Rule**: Items must be selected before the spot check can be created.

**Validation Logic**:
```typescript
// Step 3 validation
if (currentStep === 3 && selectedItems.length === 0) {
  setStepError("Please select at least one item")
  return false
}
```

**Error Message**: "Please select at least one item to include in the spot check."

---

### VAL-SC-103: Unique Items Per Spot Check
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: Each item can only appear once in a spot check.

**Validation Logic**:
```typescript
const uniqueIds = new Set(items.map(item => item.itemId))
if (uniqueIds.size !== items.length) {
  setError("Duplicate items detected")
}
```

**Error Message**: "Duplicate items detected. Each item can only appear once in a spot check."

---

### VAL-SC-104: Status Transition - Pending to In-Progress
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: Spot check can transition from 'pending' to 'in-progress' (Start action).

**Validation Logic**:
```typescript
function canStart(status: SpotCheckStatus): boolean {
  return status === 'pending'
}
```

**Error Message**: "Cannot start spot check. Current status must be 'pending'."

---

### VAL-SC-105: Status Transition - In-Progress to Completed
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: Spot check can transition from 'in-progress' to 'completed' only when all items are counted or skipped.

**Validation Logic**:
```typescript
const pendingItems = items.filter(item => item.status === 'pending')
if (pendingItems.length > 0) {
  setError(`Cannot complete. ${pendingItems.length} items still pending.`)
  return false
}
```

**Error Message**: "Cannot complete spot check. {count} item(s) still pending. Please count all items or mark them as skipped."

---

### VAL-SC-106: Status Transition - In-Progress to On-Hold
**Priority**: Medium
**Enforcement**: Client (Component Logic)

**Rule**: Spot check can transition from 'in-progress' to 'on-hold' (Pause action).

**Validation Logic**:
```typescript
function canPause(status: SpotCheckStatus): boolean {
  return status === 'in-progress'
}
```

**Error Message**: "Cannot pause spot check. Current status must be 'in-progress'."

---

### VAL-SC-107: Status Transition - On-Hold to In-Progress
**Priority**: Medium
**Enforcement**: Client (Component Logic)

**Rule**: Spot check can transition from 'on-hold' to 'in-progress' (Resume action).

**Validation Logic**:
```typescript
function canResume(status: SpotCheckStatus): boolean {
  return status === 'on-hold'
}
```

**Error Message**: "Cannot resume spot check. Current status must be 'on-hold'."

---

### VAL-SC-108: Cannot Modify Completed Spot Check
**Priority**: Critical
**Enforcement**: Client (Component Logic)

**Rule**: Completed spot checks cannot be modified.

**Validation Logic**:
```typescript
if (spotCheck.status === 'completed') {
  setError("Cannot modify completed spot check")
  return
}
```

**Error Message**: "Cannot modify completed spot check. Completed spot checks are locked for data integrity."

---

### VAL-SC-109: Cannot Modify Cancelled Spot Check
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: Cancelled spot checks cannot be modified.

**Validation Logic**:
```typescript
if (spotCheck.status === 'cancelled') {
  setError("Cannot modify cancelled spot check")
  return
}
```

**Error Message**: "Cannot modify cancelled spot check. Cancelled spot checks cannot be reopened."

---

### VAL-SC-110: Cancellation Available States
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: Only non-completed spot checks can be cancelled.

**Validation Logic**:
```typescript
function canCancel(status: SpotCheckStatus): boolean {
  return status !== 'completed' && status !== 'cancelled'
}
```

**Valid States for Cancellation**:
- draft
- pending
- in-progress
- on-hold

**Error Message**: "Cannot cancel completed spot check."

---

### VAL-SC-111: Item Status Transitions
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: Item status must follow valid transition paths.

**Valid Transitions**:
- `pending` → `counted`
- `pending` → `skipped`
- `counted` → `variance` (automatic when variance detected)

**Validation Logic**:
```typescript
function isValidItemTransition(from: ItemCheckStatus, to: ItemCheckStatus): boolean {
  const validTransitions = {
    'pending': ['counted', 'skipped'],
    'counted': ['variance'],
    'variance': [],
    'skipped': []
  }
  return validTransitions[from]?.includes(to) ?? false
}
```

**Error Message**: "Invalid item status transition from {from} to {to}."

---

## Cross-Field Validations

### VAL-SC-201: Due Date After Scheduled Date
**Priority**: Medium
**Enforcement**: Client (Zod Refine)

**Rule**: If due date is provided, it must be on or after the scheduled date.

**Validation Logic**:
```typescript
.refine(
  (data) => !data.dueDate || data.dueDate >= data.scheduledDate,
  {
    message: "Due date must be on or after scheduled date",
    path: ['dueDate']
  }
)
```

**Error Message**: "Due date must be on or after scheduled date."

---

### VAL-SC-202: Variance Calculation Consistency
**Priority**: High
**Enforcement**: Client (Automatic Calculation)

**Rule**: Variance quantity must equal (countedQuantity - systemQuantity).

**Validation Logic**:
```typescript
const calculatedVariance = countedQuantity - systemQuantity
if (Math.abs(item.variance - calculatedVariance) > 0.001) {
  console.warn("Variance mismatch detected")
  item.variance = calculatedVariance // Auto-correct
}
```

**Note**: Variance is calculated automatically; this validation ensures consistency.

---

### VAL-SC-203: Variance Percentage Calculation
**Priority**: High
**Enforcement**: Client (Automatic Calculation)

**Rule**: Variance percentage must be calculated correctly: (variance / systemQuantity) * 100.

**Validation Logic**:
```typescript
const calculatedPct = systemQuantity !== 0
  ? (variance / systemQuantity) * 100
  : 0

if (Math.abs(item.variancePercent - calculatedPct) > 0.01) {
  console.warn("Variance percentage mismatch detected")
  item.variancePercent = calculatedPct // Auto-correct
}
```

---

### VAL-SC-204: Missing Condition Implies Full Variance
**Priority**: Medium
**Enforcement**: Client (Component Logic)

**Rule**: When item condition is 'missing', variance should equal negative system quantity.

**Validation Logic**:
```typescript
if (condition === 'missing') {
  countedQuantity = 0
  variance = -systemQuantity
  variancePercent = -100
}
```

---

### VAL-SC-205: All Items Counted Before Completion
**Priority**: High
**Enforcement**: Client (Component Logic)

**Rule**: When completing a spot check, all items must have status 'counted' or 'skipped'.

**Validation Logic**:
```typescript
const allItemsProcessed = items.every(
  item => item.status === 'counted' || item.status === 'skipped'
)

if (!allItemsProcessed) {
  setError("All items must be counted or skipped before completion")
}
```

**Error Message**: "All items must be counted or skipped before completing the spot check."

---

## Form Step Validations (2-Step Creation Wizard)

### VAL-SC-301: Step 1 - Location Selection Required
**Priority**: Critical
**Enforcement**: Client (Wizard Navigation)

**Rule**: Cannot proceed to Step 2 without selecting a location.

**Required Fields**:
- locationId (required)
- departmentId (optional)
- assignedTo (required)
- scheduledDate (required)

**Validation Logic**:
```typescript
function validateStep1(data: SpotCheckFormData): boolean {
  return !!(
    data.locationId &&
    data.assignedTo &&
    data.scheduledDate
  )
}
```

**Error Message**: "Please select a location to continue."

---

### VAL-SC-302: Step 2 - Method & Items Configuration Required
**Priority**: High
**Enforcement**: Client (Wizard Navigation)

**Rule**: Cannot create spot check without configuring method and items.

**Required Fields**:
- selectionMethod (required)
- itemCount (required for random/high-value)
- selectedItems (required for manual)

**Validation Logic**:
```typescript
function validateStep2(data: SpotCheckFormData, selectedItems: SpotCheckItem[]): boolean {
  if (!data.selectionMethod) return false;

  if (data.selectionMethod === 'manual') {
    return selectedItems.length > 0;
  }

  // For random and high-value
  return [10, 20, 50].includes(data.itemCount);
}
```

**Error Messages**:
- "Please select a selection method."
- "Please select an item count (10, 20, or 50)."
- "Please select at least one item for manual selection."

---

### VAL-SC-303: (Deprecated - Was Step 3 Item Selection)
**Note**: Merged into VAL-SC-302 as part of the 2-step wizard consolidation.

---

### VAL-SC-304: (Deprecated - Was Step 4 Review)
**Note**: The 2-step wizard eliminates the separate review step. Submission occurs directly from Step 2.

---

## Error Message Standards

### Format Standards
All error messages follow this structure:
- **Field-Level**: "{Field name} {constraint}."
- **Business Rule**: "Cannot {action} because {reason}. {Suggested action}."
- **Step Validation**: "Please {action} to continue."

### Error Display Locations
- **Form Fields**: Below the field with red text
- **Step Validation**: Toast notification or inline alert
- **Dialog Validation**: Within the dialog with highlighted fields
- **Action Buttons**: Tooltip on disabled buttons explaining why

---

## Zod Schema Examples

### Creation Form Schema (2-Step Wizard)
```typescript
const spotCheckFormSchema = z.object({
  // Step 1 - Location Selection
  locationId: z.string().min(1, "Location is required"),
  departmentId: z.string().optional(),
  assignedTo: z.string().min(1, "Assigned staff is required"),
  scheduledDate: z.date(),

  // Step 2 - Method & Items
  selectionMethod: z.enum(['random', 'high-value', 'manual'], {
    required_error: "Selection method is required"
  }),
  itemCount: z.union([z.literal(10), z.literal(20), z.literal(50)]).optional(),
  selectedItems: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.selectionMethod === 'manual') {
      return data.selectedItems && data.selectedItems.length > 0;
    }
    return data.itemCount !== undefined;
  },
  {
    message: "Item count or selected items required based on selection method",
    path: ['itemCount']
  }
)
```

### Counting Form Schema
```typescript
const countingFormSchema = z.object({
  countedQuantity: z.number().min(0, "Quantity cannot be negative"),
  condition: z.enum(['good', 'damaged', 'expired', 'missing']),
  notes: z.string().max(500).optional(),
})
```

### Cancel Dialog Schema
```typescript
const cancelFormSchema = z.object({
  reason: z.enum([
    'items-unavailable',
    'staff-unavailable',
    'incorrect-items',
    'duplicate-check',
    'emergency',
    'other'
  ]),
  notes: z.string().max(500).optional(),
})
```

---

## Validation Matrix

| ID | Priority | Description | Enforcement | Step |
|----|----------|-------------|-------------|------|
| VAL-SC-001 | Critical | Check type required | Client (Zod) | - |
| VAL-SC-002 | Critical | Location required | Client (Zod) | 1 |
| VAL-SC-003 | High | Scheduled date required | Client (Zod) | 1 |
| VAL-SC-005 | Critical | Status validation | Client (Zod) | - |
| VAL-SC-006 | High | Priority required | Client (Zod) | - |
| VAL-SC-007 | High | Assigned staff required | Client (Zod) | 1 |
| VAL-SC-009 | High | Counted qty non-negative | Client (Logic) | Count |
| VAL-SC-011 | High | Item condition required | Client (Zod) | Count |
| VAL-SC-014 | High | Selection method required | Client (Zod) | 2 |
| VAL-SC-015 | High | Item count validation (10/20/50) | Client (Zod) | 2 |
| VAL-SC-016 | High | Selected items for manual | Client (Logic) | 2 |
| VAL-SC-017 | High | Skip reason required | Client (Logic) | Count |
| VAL-SC-018 | High | Cancel reason required | Client (Logic) | Cancel |
| VAL-SC-101 | High | Min 1 item | Client (Logic) | 2 |
| VAL-SC-105 | High | All items counted for completion | Client (Logic) | Complete |
| VAL-SC-108 | Critical | Cannot modify completed | Client (Logic) | - |
| VAL-SC-109 | High | Cannot modify cancelled | Client (Logic) | - |
| VAL-SC-205 | High | All items processed | Client (Logic) | Complete |
| VAL-SC-301 | Critical | Step 1 - Location selection | Client (Wizard) | 1 |
| VAL-SC-302 | High | Step 2 - Method & items | Client (Wizard) | 2 |

---

## Implementation Status

### Completed Validations
- [x] Location selection (Step 1)
- [x] Assignment fields - staff, date (Step 1)
- [x] Selection method validation (Step 2)
- [x] Item count validation - 10/20/50 (Step 2)
- [x] Manual item selection validation (Step 2)
- [x] Counted quantity validation (Counting)
- [x] Item condition selection (Counting)
- [x] Skip reason requirement (Skip dialog)
- [x] Cancel reason requirement (Cancel dialog)
- [x] Status transition rules (Actions)
- [x] Variance calculation (Automatic)

### Pending Validations (Future)
- [ ] Server-side validation (Server Actions)
- [ ] Database constraints (Prisma)
- [ ] User permission validation
- [ ] Location access validation
- [ ] High variance approval workflow
- [ ] Audit logging

---

**Document End**
