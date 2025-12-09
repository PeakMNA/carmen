# Validations: Period End Management

## Document Information
- **Module**: Inventory Management - Period End
- **Component**: Period End Management
- **Version**: 1.1.0
- **Last Updated**: 2025-12-09
- **Status**: Active

## Related Documents
- [Business Requirements](./BR-period-end.md)
- [Use Cases](./UC-period-end.md)
- [Technical Specification](./TS-period-end.md)
- [Data Definition](./DD-period-end.md)
- [Flow Diagrams](./FD-period-end.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2025-12-09 | Development Team | Updated status enum values (open, closing, closed, reopened), updated state transition tests for correct status values |
---

## 1. Introduction

This document defines comprehensive validation rules, Zod schemas, database constraints, error messages, and testing matrices for the Period End Management sub-module.

### 1.1 Validation Layers

1. **Client-Side Validation** (Zod + React Hook Form) - Immediate feedback
2. **Server-Side Validation** (Zod + Business Logic) - Security and data integrity
3. **Database Validation** (PostgreSQL constraints) - Final enforcement

### 1.2 Validation Principles

- **Fail Fast**: Validate early, provide immediate feedback
- **Clear Messages**: User-friendly error messages with guidance
- **Security First**: Never trust client input, validate server-side
- **Consistency**: Same validation logic across all layers

---

## 2. Field-Level Validations

### 2.1 Period End Fields

#### period_id
- **Type**: String
- **Format**: PE-YYYY-MM (e.g., PE-2024-01)
- **Rules**:
  - Required: Yes
  - Min Length: 10 characters
  - Max Length: 10 characters
  - Pattern: `^PE-[0-9]{4}-[0-9]{2}$`
  - Must be unique across system
- **Error Messages**:
  - Empty: "Period ID is required"
  - Invalid Format: "Period ID must follow format PE-YYYY-MM (e.g., PE-2024-01)"
  - Duplicate: "Period {periodId} already exists"

#### period_name
- **Type**: String
- **Rules**:
  - Required: Yes
  - Min Length: 3 characters (e.g., "Jan")
  - Max Length: 50 characters
  - Pattern: Letters, numbers, spaces only
- **Error Messages**:
  - Empty: "Period name is required"
  - Too Short: "Period name must be at least 3 characters"
  - Too Long: "Period name cannot exceed 50 characters"
  - Invalid Characters: "Period name can only contain letters, numbers, and spaces"

#### start_date
- **Type**: DateTime (ISO 8601)
- **Rules**:
  - Required: Yes
  - Must be first day of month (DD = 01)
  - Must be at 00:00:00.000
  - Must be before end_date
  - Cannot be more than 1 month in future
- **Error Messages**:
  - Empty: "Start date is required"
  - Invalid Date: "Start date must be first day of calendar month"
  - Future: "Cannot create period more than 1 month in advance"
  - After End: "Start date must be before end date"

#### end_date
- **Type**: DateTime (ISO 8601)
- **Rules**:
  - Required: Yes
  - Must be last day of same month as start_date
  - Must be at 23:59:59.999
  - Must be after start_date
- **Error Messages**:
  - Empty: "End date is required"
  - Invalid Date: "End date must be last day of calendar month"
  - Before Start: "End date must be after start date"
  - Wrong Month: "End date must be in same month as start date"

#### status
- **Type**: Enum (enum_period_status)
- **Values**: open, closing, closed, reopened
- **Rules**:
  - Required: Yes
  - Must be valid enum value
  - Transitions must follow allowed paths (see state diagram)
- **Error Messages**:
  - Empty: "Status is required"
  - Invalid: "Status must be one of: open, closing, closed, reopened"
  - Invalid Transition: "Cannot transition from {from} to {to}"

#### notes
- **Type**: String (optional)
- **Rules**:
  - Required: No
  - Max Length: 1000 characters
  - No HTML/script tags allowed (sanitize)
- **Error Messages**:
  - Too Long: "Notes cannot exceed 1000 characters"
  - Invalid Content: "Notes contain invalid characters or HTML"

#### reopen_reason
- **Type**: String (required for re-open)
- **Rules**:
  - Required: Yes (when re-opening period)
  - Min Length: 100 characters
  - Max Length: 2000 characters
  - Must be meaningful text (not just spaces/repeated chars)
- **Error Messages**:
  - Empty: "Reason is required when re-opening a period"
  - Too Short: "Re-open reason must be at least 100 characters. Please provide detailed explanation."
  - Too Long: "Re-open reason cannot exceed 2000 characters"
  - Invalid: "Reason must contain meaningful text, not just spaces or repeated characters"

#### cancel_reason
- **Type**: String (required for cancellation)
- **Rules**:
  - Required: Yes (when cancelling period)
  - Min Length: 50 characters
  - Max Length: 1000 characters
- **Error Messages**:
  - Empty: "Reason is required when cancelling a period"
  - Too Short: "Cancellation reason must be at least 50 characters"
  - Too Long: "Cancellation reason cannot exceed 1000 characters"

### 2.2 Period Task Fields

#### name
- **Type**: String
- **Rules**:
  - Required: Yes
  - Min Length: 5 characters
  - Max Length: 200 characters
- **Error Messages**:
  - Empty: "Task name is required"
  - Too Short: "Task name must be at least 5 characters"
  - Too Long: "Task name cannot exceed 200 characters"

#### sequence
- **Type**: Integer
- **Rules**:
  - Required: Yes
  - Min: 1
  - Max: 100
  - Must be unique within period
- **Error Messages**:
  - Empty: "Sequence is required"
  - Invalid: "Sequence must be between 1 and 100"
  - Duplicate: "Task sequence {sequence} already exists for this period"

#### is_required
- **Type**: Boolean
- **Rules**:
  - Required: Yes
  - Default: true
- **Error Messages**:
  - Empty: "Required flag must be specified"

#### status
- **Type**: Enum (enum_task_status)
- **Values**: pending, completed
- **Rules**:
  - Required: Yes
  - Can only transition pending → completed
  - Cannot unmark once completed
- **Error Messages**:
  - Empty: "Task status is required"
  - Invalid: "Task status must be one of: pending, completed"
  - Cannot Unmark: "Cannot unmark completed tasks (audit trail integrity)"

---

## 3. Business Rule Validations

### 3.1 Period Creation Validation

```typescript
import { z } from 'zod';
import { startOfMonth, endOfMonth, addMonths, isAfter } from 'date-fns';

// Validation function
async function validatePeriodCreation(
  input: CreatePeriodInput,
  context: ValidationContext
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  // 1. Check if period already exists
  const existingPeriod = await db.periodEnd.findUnique({
    where: { periodId: input.periodId }
  });

  if (existingPeriod) {
    errors.push({
      field: 'periodId',
      message: `Period ${input.periodId} already exists`
    });
  }

  // 2. Check if dates align with calendar month
  const expectedStart = startOfMonth(input.startDate);
  const expectedEnd = endOfMonth(input.startDate);

  if (input.startDate.getTime() !== expectedStart.getTime()) {
    errors.push({
      field: 'startDate',
      message: 'Start date must be first day of month at 00:00:00'
    });
  }

  if (input.endDate.getTime() !== expectedEnd.getTime()) {
    errors.push({
      field: 'endDate',
      message: 'End date must be last day of month at 23:59:59'
    });
  }

  // 3. Check if not more than 1 month in advance
  const maxFutureDate = addMonths(new Date(), 1);
  if (isAfter(input.startDate, maxFutureDate)) {
    errors.push({
      field: 'startDate',
      message: 'Cannot create period more than 1 month in advance'
    });
  }

  // 4. Check if prior period is closed (unless admin override)
  if (!context.user.isAdmin) {
    const priorPeriod = await db.periodEnd.findFirst({
      where: {
        endDate: { lt: input.startDate },
        status: { not: 'closed' }
      },
      orderBy: { endDate: 'desc' }
    });

    if (priorPeriod) {
      errors.push({
        field: 'general',
        message: `Prior period ${priorPeriod.periodId} must be closed before creating new period`
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 3.2 Period Closure Validation

```typescript
async function validatePeriodClosure(
  periodId: string,
  context: ValidationContext
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  // 1. Check period status
  const period = await db.periodEnd.findUnique({
    where: { id: periodId },
    include: { tasks: true }
  });

  if (!period) {
    errors.push({
      field: 'periodId',
      message: 'Period not found'
    });
    return { isValid: false, errors };
  }

  if (period.status !== 'closing') {
    errors.push({
      field: 'status',
      message: `Period must be in 'Closing' status to close. Current status: ${period.status}`
    });
  }

  // 2. Check all required tasks completed
  const incompleteTasks = period.tasks.filter(
    t => t.isRequired && t.status !== 'completed'
  );

  if (incompleteTasks.length > 0) {
    errors.push({
      field: 'tasks',
      message: `${incompleteTasks.length} required tasks incomplete: ${incompleteTasks.map(t => t.name).join(', ')}`
    });
  }

  // 3. Check physical count completion
  const uncommittedCounts = await db.physicalCount.count({
    where: {
      scheduledDate: {
        gte: period.startDate,
        lte: period.endDate
      },
      status: { not: 'committed' }
    }
  });

  if (uncommittedCounts > 0) {
    errors.push({
      field: 'physicalCounts',
      message: `${uncommittedCounts} physical counts not yet committed for this period`
    });
  }

  // 4. Check user permission
  if (!hasPermission(context.user, 'Period.Close')) {
    errors.push({
      field: 'permission',
      message: 'Insufficient permissions to close period. Requires Inventory Manager or Financial Manager role.'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 3.3 Period Re-Open Validation

```typescript
async function validatePeriodReopen(
  periodId: string,
  reason: string,
  context: ValidationContext
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  // 1. Check period exists and is closed
  const period = await db.periodEnd.findUnique({
    where: { id: periodId }
  });

  if (!period) {
    errors.push({
      field: 'periodId',
      message: 'Period not found'
    });
    return { isValid: false, errors };
  }

  if (period.status !== 'closed') {
    errors.push({
      field: 'status',
      message: `Only closed periods can be re-opened. Current status: ${period.status}`
    });
  }

  // 2. Check if most recent closed period
  const morerecentClosedPeriod = await db.periodEnd.findFirst({
    where: {
      startDate: { gt: period.endDate },
      status: 'closed'
    }
  });

  if (moreRecentClosedPeriod) {
    errors.push({
      field: 'period',
      message: 'Can only re-open most recent closed period. A newer period has been closed.'
    });
  }

  // 3. Check reason length
  if (reason.length < 100) {
    errors.push({
      field: 'reason',
      message: `Re-open reason must be at least 100 characters. Current: ${reason.length}`
    });
  }

  // 4. Check user permission
  if (!hasPermission(context.user, 'Period.Reopen')) {
    errors.push({
      field: 'permission',
      message: 'Insufficient permissions to re-open period. Requires Financial Manager or System Administrator role.'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 3.4 Single Active Period Validation

```typescript
async function validateSingleActivePeriod(
  periodId: string,
  newStatus: string
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  if (newStatus === 'closing') {
    // Check if another period is already in closing status
    const activePeriod = await db.periodEnd.findFirst({
      where: {
        status: 'closing',
        id: { not: periodId }
      }
    });

    if (activePeriod) {
      errors.push({
        field: 'status',
        message: `Only one period can be in 'Closing' status at a time. Period ${activePeriod.periodId} is currently being closed.`
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 3.5 Task Completion Validation

```typescript
async function validateTaskCompletion(
  taskId: string,
  context: ValidationContext
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  // 1. Check task exists
  const task = await db.periodTask.findUnique({
    where: { id: taskId },
    include: { periodEnd: true }
  });

  if (!task) {
    errors.push({
      field: 'taskId',
      message: 'Task not found'
    });
    return { isValid: false, errors };
  }

  // 2. Check period status (allowed: open, closing, or reopened)
  if (!['open', 'closing', 'reopened'].includes(task.periodEnd.status)) {
    errors.push({
      field: 'period',
      message: `Cannot complete tasks for period with status: ${task.periodEnd.status}`
    });
  }

  // 3. Check task not already completed
  if (task.status === 'completed') {
    errors.push({
      field: 'status',
      message: 'Task is already completed. Cannot mark again (audit trail integrity).'
    });
  }

  // 4. Check user permission
  if (!hasPermission(context.user, 'Period.TaskComplete')) {
    errors.push({
      field: 'permission',
      message: 'Insufficient permissions to complete tasks. Requires Inventory Coordinator or higher role.'
    });
  }

  // 5. Run automated validation if specified
  if (task.validationType === 'automated' && task.validationCriteria) {
    const criteriaResult = await runAutomatedValidation(task.validationCriteria);
    if (!criteriaResult.passed) {
      errors.push({
        field: 'validation',
        message: `Automated validation failed: ${criteriaResult.message}`
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 3.6 Period Cancellation Validation

```typescript
async function validatePeriodCancellation(
  periodId: string,
  reason: string,
  context: ValidationContext
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  // 1. Check period exists
  const period = await db.periodEnd.findUnique({
    where: { id: periodId }
  });

  if (!period) {
    errors.push({
      field: 'periodId',
      message: 'Period not found'
    });
    return { isValid: false, errors };
  }

  // 2. Check period status (only open or closing can be cancelled)
  if (!['open', 'closing'].includes(period.status)) {
    errors.push({
      field: 'status',
      message: `Only Open or Closing periods can be cancelled. Current status: ${period.status}`
    });
  }

  // 3. Check no transactions posted
  const transactionCount = await db.inventoryTransaction.count({
    where: {
      transactionDate: {
        gte: period.startDate,
        lte: period.endDate
      }
    }
  });

  if (transactionCount > 0) {
    errors.push({
      field: 'transactions',
      message: `Cannot cancel period with ${transactionCount} posted transactions. Use re-open instead.`
    });
  }

  // 4. Check reason length
  if (reason.length < 50) {
    errors.push({
      field: 'reason',
      message: `Cancellation reason must be at least 50 characters. Current: ${reason.length}`
    });
  }

  // 5. Check user permission
  if (!hasPermission(context.user, 'Period.Cancel')) {
    errors.push({
      field: 'permission',
      message: 'Insufficient permissions to cancel period. Requires Inventory Manager or higher role.'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

---

## 4. Complete Zod Schemas

### 4.1 Create Period Schema

```typescript
import { z } from 'zod';

export const createPeriodSchema = z.object({
  periodId: z.string()
    .length(10, 'Period ID must be exactly 10 characters')
    .regex(/^PE-[0-9]{4}-[0-9]{2}$/, 'Period ID must follow format PE-YYYY-MM (e.g., PE-2024-01)'),

  periodName: z.string()
    .min(3, 'Period name must be at least 3 characters')
    .max(50, 'Period name cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Period name can only contain letters, numbers, and spaces'),

  startDate: z.coerce.date()
    .refine(date => date.getDate() === 1, {
      message: 'Start date must be first day of month'
    })
    .refine(date => date.getHours() === 0 && date.getMinutes() === 0, {
      message: 'Start date must be at 00:00:00'
    }),

  endDate: z.coerce.date()
    .refine(date => date.getHours() === 23 && date.getMinutes() === 59, {
      message: 'End date must be at 23:59:59'
    }),

  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
}).refine(data => data.startDate < data.endDate, {
  message: 'Start date must be before end date',
  path: ['startDate']
}).refine(data => {
  // Check same month
  return data.startDate.getMonth() === data.endDate.getMonth() &&
         data.startDate.getFullYear() === data.endDate.getFullYear();
}, {
  message: 'Start and end dates must be in same month',
  path: ['endDate']
});

export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;
```

### 4.2 Close Period Schema

```typescript
export const closePeriodSchema = z.object({
  periodId: z.string().uuid('Invalid period ID'),

  confirmationText: z.string()
    .min(1, 'Please type "CLOSE" to confirm')
    .refine(text => text.toUpperCase() === 'CLOSE', {
      message: 'Please type "CLOSE" exactly to confirm closure'
    }),

  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
});

export type ClosePeriodInput = z.infer<typeof closePeriodSchema>;
```

### 4.3 Re-Open Period Schema

```typescript
export const reopenPeriodSchema = z.object({
  periodId: z.string().uuid('Invalid period ID'),

  reason: z.string()
    .min(100, 'Re-open reason must be at least 100 characters for audit purposes')
    .max(2000, 'Re-open reason cannot exceed 2000 characters')
    .refine(text => text.trim().length >= 100, {
      message: 'Reason must contain at least 100 meaningful characters (not just spaces)'
    })
    .refine(text => {
      // Check not just repeated characters
      const uniqueChars = new Set(text.toLowerCase().replace(/\s/g, ''));
      return uniqueChars.size >= 10;
    }, {
      message: 'Reason must be meaningful text, not repeated characters'
    }),

  confirmationText: z.string()
    .min(1, 'Please type "REOPEN" to confirm')
    .refine(text => text.toUpperCase() === 'REOPEN', {
      message: 'Please type "REOPEN" exactly to confirm re-opening'
    })
});

export type ReopenPeriodInput = z.infer<typeof reopenPeriodSchema>;
```

### 4.4 Cancel Period Schema

```typescript
export const cancelPeriodSchema = z.object({
  periodId: z.string().uuid('Invalid period ID'),

  reason: z.string()
    .min(50, 'Cancellation reason must be at least 50 characters')
    .max(1000, 'Cancellation reason cannot exceed 1000 characters'),

  confirmationText: z.string()
    .min(1, 'Please type "CANCEL" to confirm')
    .refine(text => text.toUpperCase() === 'CANCEL', {
      message: 'Please type "CANCEL" exactly to confirm cancellation'
    })
});

export type CancelPeriodInput = z.infer<typeof cancelPeriodSchema>;
```

### 4.5 Complete Task Schema

```typescript
export const completeTaskSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),

  notes: z.string()
    .max(500, 'Task notes cannot exceed 500 characters')
    .optional()
});

export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
```

### 4.6 Update Period Notes Schema

```typescript
export const updatePeriodNotesSchema = z.object({
  periodId: z.string().uuid('Invalid period ID'),

  notes: z.string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .transform(text => text.trim())
});

export type UpdatePeriodNotesInput = z.infer<typeof updatePeriodNotesSchema>;
```

---

## 5. Database Constraints

### 5.1 Check Constraints

```sql
-- Period dates validity
ALTER TABLE tb_period_end
  ADD CONSTRAINT chk_period_end_dates
  CHECK (start_date < end_date);

-- Period ID format
ALTER TABLE tb_period_end
  ADD CONSTRAINT chk_period_end_period_id_format
  CHECK (period_id ~ '^PE-[0-9]{4}-[0-9]{2}$');

-- Notes length
ALTER TABLE tb_period_end
  ADD CONSTRAINT chk_period_end_notes_length
  CHECK (notes IS NULL OR LENGTH(notes) <= 1000);

-- Re-open reason minimum length
ALTER TABLE tb_period_end
  ADD CONSTRAINT chk_period_end_reopen_reason_length
  CHECK (reopen_reason IS NULL OR LENGTH(reopen_reason) >= 100);

-- Cancel reason minimum length
ALTER TABLE tb_period_end
  ADD CONSTRAINT chk_period_end_cancel_reason_length
  CHECK (cancel_reason IS NULL OR LENGTH(cancel_reason) >= 50);

-- Task sequence positive
ALTER TABLE tb_period_task
  ADD CONSTRAINT chk_period_task_sequence_positive
  CHECK (sequence > 0);

-- Task name length
ALTER TABLE tb_period_task
  ADD CONSTRAINT chk_period_task_name_length
  CHECK (LENGTH(name) >= 5 AND LENGTH(name) <= 200);
```

### 5.2 Unique Constraints

```sql
-- Unique period ID
ALTER TABLE tb_period_end
  ADD CONSTRAINT uq_period_end_period_id UNIQUE (period_id);

-- Unique task sequence per period
ALTER TABLE tb_period_task
  ADD CONSTRAINT uq_period_task_sequence UNIQUE (period_end_id, sequence);
```

### 5.3 NOT NULL Constraints

```sql
-- Period End required fields
ALTER TABLE tb_period_end
  ALTER COLUMN period_id SET NOT NULL,
  ALTER COLUMN period_name SET NOT NULL,
  ALTER COLUMN start_date SET NOT NULL,
  ALTER COLUMN end_date SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

-- Period Task required fields
ALTER TABLE tb_period_task
  ALTER COLUMN period_end_id SET NOT NULL,
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN sequence SET NOT NULL,
  ALTER COLUMN is_required SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;

-- Period Activity required fields
ALTER TABLE tb_period_activity
  ALTER COLUMN period_end_id SET NOT NULL,
  ALTER COLUMN action_type SET NOT NULL,
  ALTER COLUMN action_date SET NOT NULL,
  ALTER COLUMN action_by_id SET NOT NULL,
  ALTER COLUMN action_by_name SET NOT NULL,
  ALTER COLUMN ip_address SET NOT NULL;
```

---

## 6. Error Codes and Messages

### 6.1 Validation Error Codes

| Code | Message | Resolution |
|------|---------|------------|
| `PE-001` | Period ID already exists | Use different period ID or view existing period |
| `PE-002` | Invalid period ID format | Use format PE-YYYY-MM (e.g., PE-2024-01) |
| `PE-003` | Start date must be first day of month | Select first day of calendar month |
| `PE-004` | End date must be last day of month | Select last day of calendar month |
| `PE-005` | Start date must be before end date | Correct date order |
| `PE-006` | Dates must be in same month | Ensure both dates in same calendar month |
| `PE-007` | Cannot create period more than 1 month in advance | Wait until appropriate time or contact administrator |
| `PE-008` | Prior period not closed | Close prior period first or request admin override |
| `PE-009` | Notes exceed maximum length (1000 characters) | Shorten notes text |
| `PE-010` | Invalid status transition | Follow allowed status transition paths |

### 6.2 Business Rule Error Codes

| Code | Message | Resolution |
|------|---------|------------|
| `PE-020` | Only one period can be in Closing status at a time | Complete or cancel active period closure first |
| `PE-021` | Cannot close period with incomplete tasks | Complete all required tasks |
| `PE-022` | Cannot close period with uncommitted physical counts | Commit all physical counts for period |
| `PE-023` | Cannot re-open period: not most recent closed | Only most recent closed period can be re-opened |
| `PE-024` | Cannot re-open period: next period already closed | Historical periods cannot be re-opened |
| `PE-025` | Re-open reason too short (minimum 100 characters) | Provide detailed explanation for re-open |
| `PE-026` | Cannot cancel period with posted transactions | Use re-open workflow for periods with transactions |
| `PE-027` | Cancel reason too short (minimum 50 characters) | Provide clear reason for cancellation |
| `PE-028` | Cannot complete task: period closed | Tasks locked when period is closed |
| `PE-029` | Cannot unmark completed task | Completed tasks cannot be unmarked (audit integrity) |
| `PE-030` | Task automated validation failed | Review validation criteria and correct issues |

### 6.3 Permission Error Codes

| Code | Message | Resolution |
|------|---------|------------|
| `PE-040` | Insufficient permissions to create period | Requires Inventory Manager role |
| `PE-041` | Insufficient permissions to close period | Requires Inventory Manager or Financial Manager role |
| `PE-042` | Insufficient permissions to re-open period | Requires Financial Manager or System Administrator role |
| `PE-043` | Insufficient permissions to cancel period | Requires Inventory Manager or higher role |
| `PE-044` | Insufficient permissions to complete tasks | Requires Inventory Coordinator or higher role |
| `PE-045` | Insufficient permissions to update notes | Requires Inventory Coordinator or higher role |

---

## 7. Validation Testing Matrix

### 7.1 Period Creation Tests

| Test ID | Input | Expected Result | Validation Layer |
|---------|-------|-----------------|------------------|
| TC-PE-001 | Valid period data | Success | All layers |
| TC-PE-002 | Duplicate period ID | Error: PE-001 | Server + Database |
| TC-PE-003 | Invalid period ID format | Error: PE-002 | Client + Server |
| TC-PE-004 | Start date not first of month | Error: PE-003 | Client + Server |
| TC-PE-005 | End date not last of month | Error: PE-004 | Client + Server |
| TC-PE-006 | Start date after end date | Error: PE-005 | Client + Server |
| TC-PE-007 | Dates in different months | Error: PE-006 | Client + Server |
| TC-PE-008 | Period > 1 month in future | Error: PE-007 | Server |
| TC-PE-009 | Prior period not closed | Error: PE-008 | Server |
| TC-PE-010 | Notes > 1000 characters | Error: PE-009 | Client + Server + Database |
| TC-PE-011 | Empty period ID | Error: Required | Client |
| TC-PE-012 | Empty period name | Error: Required | Client |
| TC-PE-013 | Period name < 3 characters | Error: Too short | Client |
| TC-PE-014 | Period name > 50 characters | Error: Too long | Client + Database |
| TC-PE-015 | Admin override for unclosed prior | Success | Server |

### 7.2 Period Closure Tests

| Test ID | Input | Expected Result | Validation Layer |
|---------|-------|-----------------|------------------|
| TC-PE-020 | Valid closure (all tasks complete) | Success | All layers |
| TC-PE-021 | Period status not Closing | Error: Status check | Server |
| TC-PE-022 | Incomplete required tasks | Error: PE-021 | Server |
| TC-PE-023 | Uncommitted physical counts | Warning: PE-022 | Server |
| TC-PE-024 | User without close permission | Error: PE-041 | Server |
| TC-PE-025 | Confirmation text incorrect | Error: Validation | Client |
| TC-PE-026 | Force close with warnings | Success (with override) | Server |

### 7.3 Period Re-Open Tests

| Test ID | Input | Expected Result | Validation Layer |
|---------|-------|-----------------|------------------|
| TC-PE-030 | Valid re-open with reason | Success | All layers |
| TC-PE-031 | Period not closed | Error: Status check | Server |
| TC-PE-032 | Not most recent closed period | Error: PE-023 | Server |
| TC-PE-033 | Next period already closed | Error: PE-024 | Server |
| TC-PE-034 | Reason < 100 characters | Error: PE-025 | Client + Server + Database |
| TC-PE-035 | User without re-open permission | Error: PE-042 | Server |
| TC-PE-036 | Reason with only spaces | Error: Invalid | Client + Server |
| TC-PE-037 | Reason with repeated characters | Error: Invalid | Client + Server |
| TC-PE-038 | Confirmation text incorrect | Error: Validation | Client |

### 7.4 Task Completion Tests

| Test ID | Input | Expected Result | Validation Layer |
|---------|-------|-----------------|------------------|
| TC-PE-040 | Valid task completion | Success | All layers |
| TC-PE-041 | Period closed | Error: PE-028 | Server |
| TC-PE-042 | Task already completed | Error: PE-029 | Server |
| TC-PE-043 | User without permission | Error: PE-044 | Server |
| TC-PE-044 | Automated validation fails | Error: PE-030 | Server |
| TC-PE-045 | Last required task completed | Auto-transition to Closing | Server |
| TC-PE-046 | Optional task completion | Success (no state change) | Server |

### 7.5 Period Cancellation Tests

| Test ID | Input | Expected Result | Validation Layer |
|---------|-------|-----------------|------------------|
| TC-PE-050 | Valid cancellation | Success | All layers |
| TC-PE-051 | Period closed | Error: Status check | Server |
| TC-PE-052 | Transactions posted | Error: PE-026 | Server |
| TC-PE-053 | Reason < 50 characters | Error: PE-027 | Client + Server + Database |
| TC-PE-054 | User without permission | Error: PE-043 | Server |
| TC-PE-055 | Confirmation text incorrect | Error: Validation | Client |

### 7.6 State Transition Tests

| Test ID | From Status | To Status | Expected Result |
|---------|-------------|-----------|-----------------|
| TC-PE-060 | Open | Closing | Success (when initiating period close workflow) |
| TC-PE-061 | Open | Closed | Error: Must go through Closing status |
| TC-PE-062 | Open | Reopened | Error: Invalid transition (period must be closed first) |
| TC-PE-063 | Closing | Closed | Success (if all 11 validation tasks complete) |
| TC-PE-064 | Closing | Open | Success (cancel closing workflow) |
| TC-PE-065 | Closing | Reopened | Error: Invalid transition |
| TC-PE-066 | Closed | Reopened | Success (if most recent + authorized + reason provided) |
| TC-PE-067 | Closed | Closing | Error: Invalid transition (use Reopen first) |
| TC-PE-068 | Closed | Open | Error: Invalid transition (use Reopen first) |
| TC-PE-069 | Reopened | Closing | Success (to close period again) |
| TC-PE-070 | Reopened | Closed | Success (if all tasks still complete) |
| TC-PE-071 | Reopened | Open | Error: Invalid transition |

---

## 8. Related Documentation

- [Period End Business Requirements](./BR-period-end.md)
- [Period End Use Cases](./UC-period-end.md)
- [Period End Technical Specification](./TS-period-end.md)
- [Period End Data Definition](./DD-period-end.md)
- [Period End Flow Diagrams](./FD-period-end.md)
- [Shared Methods: Period Management](../../shared-methods/inventory-valuation/SM-period-management.md)

---

**Document Status**: Active
**Last Review**: 2025-12-09
**Next Review**: 2026-03-09
**Maintained By**: Inventory Management Team
