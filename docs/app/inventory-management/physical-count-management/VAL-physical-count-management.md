# Validations: Physical Count Management

**Module**: Inventory Management
**Sub-Module**: Physical Count Management
**Version**: 1.0.0
**Status**: IMPLEMENTED (Prototype with Mock Data)
**Last Updated**: 2025-12-09

---

## 1. Overview

This document defines validation rules and Zod schemas for the Physical Count Management module.

---

## 2. Zod Validation Schemas

### 2.1 Create Physical Count Schema

```typescript
import { z } from 'zod';

// Step 1: Count Type
const countTypeStepSchema = z.object({
  type: z.enum(['full', 'cycle', 'annual', 'perpetual', 'partial'], {
    required_error: 'Please select a count type',
  }),
  priority: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Please select a priority level',
  }),
  approvalThreshold: z
    .number({
      required_error: 'Approval threshold is required',
      invalid_type_error: 'Approval threshold must be a number',
    })
    .min(0, 'Threshold cannot be negative')
    .max(100, 'Threshold cannot exceed 100%'),
});

// Step 2: Assignment
const teamMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['primary', 'secondary', 'verifier'], {
    required_error: 'Please select a role',
  }),
});

const assignmentStepSchema = z.object({
  locationId: z.string().min(1, 'Location is required'),
  departmentId: z.string().optional(),
  zoneId: z.string().optional(),
  supervisorId: z.string().min(1, 'Supervisor is required'),
  team: z.array(teamMemberSchema).optional(),
  scheduledDate: z.date({
    required_error: 'Scheduled date is required',
    invalid_type_error: 'Invalid date format',
  }),
  dueDate: z.date({
    required_error: 'Due date is required',
    invalid_type_error: 'Invalid date format',
  }),
}).refine(
  (data) => data.dueDate >= data.scheduledDate,
  {
    message: 'Due date must be on or after scheduled date',
    path: ['dueDate'],
  }
);

// Step 3: Scope Selection
const scopeSelectionSchema = z.object({
  selectedCategories: z.array(z.string()).optional(),
  selectedItems: z.array(z.string()).optional(),
  includeAllItems: z.boolean().optional(),
}).refine(
  (data) => {
    // At least one scope selection method must have values
    return data.includeAllItems || 
           (data.selectedCategories && data.selectedCategories.length > 0) ||
           (data.selectedItems && data.selectedItems.length > 0);
  },
  {
    message: 'Please select at least one category or item, or include all items',
  }
);

// Step 4: Details
const detailsStepSchema = z.object({
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  instructions: z.string().max(2000, 'Instructions cannot exceed 2000 characters').optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

// Complete Form Schema
export const createPhysicalCountSchema = countTypeStepSchema
  .merge(assignmentStepSchema)
  .merge(scopeSelectionSchema)
  .merge(detailsStepSchema);

export type CreatePhysicalCountInput = z.infer<typeof createPhysicalCountSchema>;
```

### 2.2 Count Item Update Schema

```typescript
export const countItemUpdateSchema = z.object({
  countedQuantity: z
    .number({
      required_error: 'Counted quantity is required',
      invalid_type_error: 'Counted quantity must be a number',
    })
    .min(0, 'Quantity cannot be negative'),
  varianceReason: z.enum([
    'damage',
    'theft',
    'spoilage',
    'measurement-error',
    'system-error',
    'receiving-error',
    'issue-error',
    'unknown',
    'other',
  ]).optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
}).refine(
  (data) => {
    // If variance exists and is significant, reason is required
    // This is handled at the component level with systemQuantity context
    return true;
  }
);

export type CountItemUpdateInput = z.infer<typeof countItemUpdateSchema>;
```

### 2.3 Skip Item Schema

```typescript
export const skipItemSchema = z.object({
  skipReason: z.string()
    .min(1, 'Skip reason is required')
    .max(200, 'Skip reason cannot exceed 200 characters'),
});

export type SkipItemInput = z.infer<typeof skipItemSchema>;
```

### 2.4 Cancel Count Schema

```typescript
export const cancelCountSchema = z.object({
  cancellationReason: z.string()
    .min(1, 'Cancellation reason is required')
    .min(10, 'Please provide a more detailed reason (at least 10 characters)')
    .max(500, 'Cancellation reason cannot exceed 500 characters'),
});

export type CancelCountInput = z.infer<typeof cancelCountSchema>;
```

### 2.5 Filter Schema

```typescript
export const filterSchema = z.object({
  status: z.enum([
    'all',
    'draft',
    'planning',
    'pending',
    'in-progress',
    'completed',
    'finalized',
    'cancelled',
    'on-hold',
  ]).optional(),
  type: z.enum([
    'all',
    'full',
    'cycle',
    'annual',
    'perpetual',
    'partial',
  ]).optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  supervisor: z.string().optional(),
  dateRange: z.object({
    start: z.date().nullable().optional(),
    end: z.date().nullable().optional(),
  }).optional(),
  priority: z.enum(['all', 'low', 'medium', 'high', 'critical']).optional(),
  hasVariance: z.boolean().nullable().optional(),
});

export type FilterInput = z.infer<typeof filterSchema>;
```

### 2.6 Counting Interface Filter Schema

```typescript
// Filter state for item display in counting interface
export const countingFilterSchema = z.enum(['all', 'pending', 'counted']);
export type CountingFilter = z.infer<typeof countingFilterSchema>;
```

### 2.7 Calculator Schema

```typescript
export const calculatorSchema = z.object({
  unitType: z.enum(['weight', 'volume', 'count'], {
    required_error: 'Please select a unit type',
  }),
  // Weight values
  kg: z.number().min(0).optional(),
  g: z.number().min(0).optional(),
  lb: z.number().min(0).optional(),
  // Volume values
  L: z.number().min(0).optional(),
  ml: z.number().min(0).optional(),
  // Count values
  pcs: z.number().min(0).int().optional(),
  dozen: z.number().min(0).int().optional(),
  case: z.number().min(0).int().optional(),
  caseSize: z.number().min(1).int().default(12),
});

export type CalculatorInput = z.infer<typeof calculatorSchema>;
```

---

## 3. Business Rule Validations

### 3.1 Count Number Format

```typescript
// Count number format: PC-YYMMDD-XXXX
const countNumberRegex = /^PC-\d{6}-\d{4}$/;

export function validateCountNumber(countNumber: string): boolean {
  return countNumberRegex.test(countNumber);
}

export function generateCountNumber(): string {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const seq = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PC-${yy}${mm}${dd}-${seq}`;
}
```

### 3.2 Status Transition Validation

```typescript
type PhysicalCountStatus = 
  | 'draft' | 'planning' | 'pending' | 'in-progress' 
  | 'completed' | 'finalized' | 'cancelled' | 'on-hold';

const validTransitions: Record<PhysicalCountStatus, PhysicalCountStatus[]> = {
  draft: ['planning', 'cancelled'],
  planning: ['pending', 'cancelled'],
  pending: ['in-progress', 'cancelled'],
  'in-progress': ['completed', 'on-hold', 'cancelled'],
  'on-hold': ['in-progress', 'cancelled'],
  completed: ['finalized', 'cancelled'],
  finalized: [], // Terminal state
  cancelled: [], // Terminal state
};

export function isValidStatusTransition(
  currentStatus: PhysicalCountStatus,
  newStatus: PhysicalCountStatus
): boolean {
  return validTransitions[currentStatus].includes(newStatus);
}

export function getAvailableTransitions(
  currentStatus: PhysicalCountStatus
): PhysicalCountStatus[] {
  return validTransitions[currentStatus];
}
```

### 3.3 Variance Validation

```typescript
interface VarianceValidation {
  requiresReason: boolean;
  exceedsThreshold: boolean;
  variancePercent: number;
}

export function validateVariance(
  systemQuantity: number,
  countedQuantity: number,
  approvalThreshold: number
): VarianceValidation {
  const variance = countedQuantity - systemQuantity;
  const variancePercent = systemQuantity > 0 
    ? Math.abs(variance / systemQuantity) * 100 
    : countedQuantity > 0 ? 100 : 0;
  
  return {
    requiresReason: variance !== 0,
    exceedsThreshold: variancePercent > approvalThreshold,
    variancePercent,
  };
}
```

### 3.4 Completion Validation

```typescript
interface CompletionValidation {
  canComplete: boolean;
  reasons: string[];
  pendingItems: number;
  skippedWithoutReason: number;
}

export function validateCompletion(
  items: PhysicalCountItem[]
): CompletionValidation {
  const pendingItems = items.filter(i => i.status === 'pending').length;
  const skippedWithoutReason = items.filter(
    i => i.status === 'skipped' && !i.skipReason
  ).length;
  
  const reasons: string[] = [];
  
  if (pendingItems > 0) {
    reasons.push(`${pendingItems} items have not been counted`);
  }
  
  if (skippedWithoutReason > 0) {
    reasons.push(`${skippedWithoutReason} skipped items are missing reasons`);
  }
  
  return {
    canComplete: reasons.length === 0,
    reasons,
    pendingItems,
    skippedWithoutReason,
  };
}
```

### 3.5 Finalization Validation

```typescript
interface FinalizationValidation {
  canFinalize: boolean;
  reasons: string[];
  unapprovedVariances: number;
  pendingRecounts: number;
  totalVarianceValue: number;
}

export function validateFinalization(
  count: PhysicalCount
): FinalizationValidation {
  const reasons: string[] = [];
  
  if (count.status !== 'completed') {
    reasons.push('Count must be in completed status');
  }
  
  const unapprovedVariances = count.items.filter(
    i => i.status === 'variance'
  ).length;
  
  if (unapprovedVariances > 0) {
    reasons.push(`${unapprovedVariances} variance items pending approval`);
  }
  
  const pendingRecounts = count.items.filter(
    i => i.status === 'recount'
  ).length;
  
  if (pendingRecounts > 0) {
    reasons.push(`${pendingRecounts} items pending recount`);
  }
  
  return {
    canFinalize: reasons.length === 0,
    reasons,
    unapprovedVariances,
    pendingRecounts,
    totalVarianceValue: count.totalVarianceValue,
  };
}
```

---

## 4. Field-Level Validation Rules

### 4.1 Count Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| countNumber | string | Auto | Format: PC-YYMMDD-XXXX |
| type | enum | Yes | full, cycle, annual, perpetual, partial |
| status | enum | Auto | Valid status values |
| priority | enum | Yes | low, medium, high, critical |
| locationId | string | Yes | Valid location reference |
| supervisorId | string | Yes | Valid user reference |
| scheduledDate | Date | Yes | Cannot be in the past |
| dueDate | Date | Yes | Must be >= scheduledDate |
| approvalThreshold | number | Yes | 0-100 |
| description | string | No | Max 500 characters |
| instructions | string | No | Max 2000 characters |
| notes | string | No | Max 1000 characters |
| cancellationReason | string | Conditional | Required for cancel, min 10 chars |

### 4.2 Item Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| countedQuantity | number | Conditional | >= 0, required when counting |
| varianceReason | enum | Conditional | Required when variance exists |
| skipReason | string | Conditional | Required when skipping, max 200 chars |
| notes | string | No | Max 500 characters |

### 4.3 Team Member Fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| userId | string | Yes | Valid user reference |
| role | enum | Yes | primary, secondary, verifier |

---

## 5. Error Messages

### 5.1 Standard Error Messages

```typescript
export const errorMessages = {
  // Type and Status
  INVALID_COUNT_TYPE: 'Please select a valid count type',
  INVALID_STATUS_TRANSITION: 'This status transition is not allowed',
  
  // Assignment
  LOCATION_REQUIRED: 'Please select a location',
  SUPERVISOR_REQUIRED: 'Please assign a supervisor',
  INVALID_DATE_RANGE: 'Due date must be on or after scheduled date',
  PAST_SCHEDULED_DATE: 'Scheduled date cannot be in the past',
  
  // Counting
  NEGATIVE_QUANTITY: 'Quantity cannot be negative',
  VARIANCE_REASON_REQUIRED: 'Please select a variance reason',
  SKIP_REASON_REQUIRED: 'Please provide a reason for skipping',
  
  // Completion
  PENDING_ITEMS: 'All items must be counted or skipped before completion',
  MISSING_SKIP_REASONS: 'All skipped items must have a reason',
  
  // Finalization
  NOT_COMPLETED: 'Count must be completed before finalization',
  UNAPPROVED_VARIANCES: 'All variances must be approved before finalization',
  PENDING_RECOUNTS: 'All recounts must be completed before finalization',
  
  // Cancellation
  CANCELLATION_REASON_REQUIRED: 'Please provide a cancellation reason',
  CANCELLATION_REASON_TOO_SHORT: 'Please provide a more detailed reason',
  
  // General
  FINALIZED_COUNT_LOCKED: 'Finalized counts cannot be modified',
  CANCELLED_COUNT_LOCKED: 'Cancelled counts cannot be modified',
};
```

---

## 6. Client-Side Validation Hooks

### 6.1 useFormValidation Hook

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function useCreateCountForm() {
  return useForm<CreatePhysicalCountInput>({
    resolver: zodResolver(createPhysicalCountSchema),
    defaultValues: {
      priority: 'medium',
      approvalThreshold: 5,
      team: [],
    },
    mode: 'onChange',
  });
}
```

### 6.2 useCountItemValidation Hook

```typescript
export function useCountItemValidation(
  systemQuantity: number,
  approvalThreshold: number
) {
  return {
    validateQuantity: (value: number) => {
      if (value < 0) return 'Quantity cannot be negative';
      return true;
    },
    validateVarianceReason: (
      countedQuantity: number,
      reason: string | undefined
    ) => {
      if (countedQuantity !== systemQuantity && !reason) {
        return 'Variance reason is required';
      }
      return true;
    },
    getVarianceInfo: (countedQuantity: number) => {
      return validateVariance(systemQuantity, countedQuantity, approvalThreshold);
    },
  };
}
```

---

## 7. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-06 | System | Initial documentation |
| 1.0.1 | 2025-12-09 | System | Added counting interface filter schema and calculator validation schema |
