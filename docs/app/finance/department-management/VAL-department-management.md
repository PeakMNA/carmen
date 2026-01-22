# Validation Rules: Department Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Department Management
- **Route**: `/finance/department-list`
- **Version**: 2.0.0
- **Last Updated**: 2026-01-17
- **Owner**: Finance Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-17 | Documentation Team | Updated to reflect actual implementation |
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format |
| 1.0.0 | 2025-11-13 | Documentation Team | Initial version |

---

## Overview

This document defines validation rules for the Department Management module. The current implementation uses Zod schema validation with react-hook-form for form management.

**Related Documents**:
- [Business Requirements](./BR-department-management.md)
- [Use Cases](./UC-department-management.md)
- [Data Dictionary](./DD-department-management.md)
- [Technical Specification](./TS-department-management.md)
- [Flow Diagrams](./FD-department-management.md)

---

## Validation Summary

| ID | Field | Rule | Type | Status |
|----|-------|------|------|--------|
| VAL-DEPT-001 | code | Required, max 10 characters | Field | Implemented |
| VAL-DEPT-002 | name | Required, max 100 characters | Field | Implemented |
| VAL-DEPT-003 | description | Optional | Field | Implemented |
| VAL-DEPT-004 | status | Must be 'active' or 'inactive' | Field | Implemented |
| VAL-DEPT-005 | managers | Optional array of user IDs | Field | Implemented |
| VAL-DEPT-006 | costCenter | Optional string | Field | Implemented |
| VAL-DEPT-007 | Code Immutability | Code disabled when editing | Business | Implemented |
| VAL-DEPT-008 | Delete Confirmation | Requires user confirmation | Business | Implemented |
| VAL-DEPT-009 | Manager Eligibility | Only managers/directors as heads | Business | Implemented |

---

## Zod Schema Implementation

### VAL-DEPT-SCHEMA: Form Validation Schema

**Location**: `app/(main)/finance/department-list/components/department-edit-form.tsx`

```typescript
const departmentSchema = z.object({
  code: z.string()
    .min(1, 'Department code is required')
    .max(10, 'Code must be 10 characters or less'),
  name: z.string()
    .min(1, 'Department name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z.string().optional(),
  managers: z.array(z.string()).optional(),
  costCenter: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})
```

---

## Field-Level Validations

### VAL-DEPT-001: Department Code Validation

**Field**: `code`
**Data Type**: string

**Validation Rules**:
- Required - cannot be empty
- Minimum length: 1 character
- Maximum length: 10 characters

**Implementation**:
- **Client-Side**: Zod validation via react-hook-form
- **UI Feedback**: Error message displayed below input

**Error Messages**:
- "Department code is required" (when empty)
- "Code must be 10 characters or less" (when exceeds limit)

**Test Cases**:
- VALID: "KITCHEN" (typical code)
- VALID: "FB" (short code)
- VALID: "HOUSEKEEP" (max length)
- INVALID: "" (empty string)
- INVALID: "KITCHEN-OPS" (11 characters)

---

### VAL-DEPT-002: Department Name Validation

**Field**: `name`
**Data Type**: string

**Validation Rules**:
- Required - cannot be empty
- Minimum length: 1 character
- Maximum length: 100 characters

**Implementation**:
- **Client-Side**: Zod validation via react-hook-form
- **UI Feedback**: Error message displayed below input

**Error Messages**:
- "Department name is required" (when empty)
- "Name must be 100 characters or less" (when exceeds limit)

**Test Cases**:
- VALID: "Kitchen Operations" (typical name)
- VALID: "F&B" (short name)
- VALID: "Housekeeping and Room Cleaning Services" (longer name)
- INVALID: "" (empty string)

---

### VAL-DEPT-003: Description Validation

**Field**: `description`
**Data Type**: string (optional)

**Validation Rules**:
- Optional field
- No length restriction in current implementation

**Implementation**:
- **Client-Side**: Optional in Zod schema
- **UI Feedback**: None required (always valid)

**Test Cases**:
- VALID: "" (empty string)
- VALID: "Main kitchen production area" (typical description)
- VALID: undefined (not provided)

---

### VAL-DEPT-004: Status Validation

**Field**: `status`
**Data Type**: enum

**Validation Rules**:
- Must be one of: 'active', 'inactive'
- Default value: 'active'

**Implementation**:
- **Client-Side**: Zod enum validation
- **UI Element**: Checkbox (checked = active)

**Error Messages**:
- Zod automatically rejects invalid values

**Test Cases**:
- VALID: "active"
- VALID: "inactive"
- INVALID: "pending" (not in enum)
- INVALID: "" (empty string)

---

### VAL-DEPT-005: Managers Validation

**Field**: `managers`
**Data Type**: string[] (optional)

**Validation Rules**:
- Optional field
- Array of user ID strings
- Empty array allowed

**Implementation**:
- **Client-Side**: Optional array in Zod schema
- **UI Element**: Checkbox list of eligible managers

**Test Cases**:
- VALID: [] (empty array)
- VALID: ["user-1"] (single manager)
- VALID: ["user-1", "user-2"] (multiple managers)
- VALID: undefined (not provided)

---

### VAL-DEPT-006: Cost Center Validation

**Field**: `costCenter`
**Data Type**: string (optional)

**Validation Rules**:
- Optional field
- No format restriction in current implementation

**Implementation**:
- **Client-Side**: Optional in Zod schema
- **UI Element**: Text input

**Test Cases**:
- VALID: "" (empty string)
- VALID: "CC-001" (typical cost center)
- VALID: undefined (not provided)

---

## Business Rule Validations

### VAL-DEPT-007: Code Immutability

**Rule**: Department code cannot be changed after creation.

**Trigger**: Edit mode for existing department

**Implementation**:
```tsx
<Input
  {...register('code')}
  disabled={isEditing}
  className={isEditing ? 'bg-muted' : ''}
/>
```

**Behavior**:
- New department: Code field is editable
- Existing department: Code field is disabled with muted background
- Code value preserved from original department

**Test Cases**:
- NEW: User can enter code "KITCHEN"
- EDIT: Code field shows "KITCHEN" but cannot be modified

---

### VAL-DEPT-008: Delete Confirmation

**Rule**: Department deletion requires explicit user confirmation.

**Trigger**: Click delete button (from list or detail page)

**Implementation**:
```typescript
const handleDelete = () => {
  if (window.confirm(`Are you sure you want to delete ${department.name}?`)) {
    // Perform deletion
  }
}
```

**Behavior**:
- Browser confirm dialog shown with department name
- Cancel: No action taken
- Confirm: Department removed from list

**Test Cases**:
- Confirm: Department deleted
- Cancel: Department remains

---

### VAL-DEPT-009: Manager Eligibility Filter

**Rule**: Only users with management roles can be assigned as department heads.

**Trigger**: Displaying department head selection checkboxes

**Implementation**:
```typescript
const eligibleManagers = mockUsers.filter(user =>
  user.role.toLowerCase().includes('manager') ||
  user.role.toLowerCase().includes('director') ||
  user.role.toLowerCase().includes('head') ||
  user.role.toLowerCase().includes('chef')
)
```

**Eligible Roles**:
- Roles containing "manager" (e.g., "Hotel Manager", "Finance Manager")
- Roles containing "director" (e.g., "Director of Operations")
- Roles containing "head" (e.g., "Head Chef")
- Roles containing "chef" (e.g., "Executive Chef")

**Test Cases**:
- ELIGIBLE: "Hotel Manager" (contains 'manager')
- ELIGIBLE: "Executive Chef" (contains 'chef')
- NOT ELIGIBLE: "Staff" (no management keyword)
- NOT ELIGIBLE: "Accountant" (no management keyword)

---

## Form Submission Validation

### VAL-DEPT-010: Form Submission Process

**Trigger**: Click "Save Department" button

**Validation Sequence**:
1. Zod schema validates all fields
2. react-hook-form collects errors
3. If errors exist: Display error messages, block submission
4. If valid: Create/update department object

**Implementation**:
```typescript
const onSubmit = (data: DepartmentFormValues) => {
  if (isEditing) {
    // Update existing department
    const updated = { ...department, ...data }
    // Navigate to detail page
  } else {
    // Create new department
    const newDept = { id: `dept-${Date.now()}`, ...data }
    // Navigate to list page
  }
}
```

**Error Display**:
```tsx
{errors.code && (
  <p className="text-sm text-destructive">{errors.code.message}</p>
)}
```

---

## Client-Side Validation Flow

```
User Input
    |
    v
[Form Field Change]
    |
    v
[Zod Schema Validation] --> Invalid --> [Display Error Message]
    |
    v (Valid)
[Update Form State]
    |
    v
[Submit Button Click]
    |
    v
[react-hook-form handleSubmit]
    |
    v
[Full Form Validation] --> Invalid --> [Display All Errors]
    |
    v (Valid)
[Execute onSubmit Handler]
    |
    v
[Create/Update Department]
    |
    v
[Navigate Away]
```

---

## Validation Error Messages

### Field Errors

| Field | Condition | Error Message |
|-------|-----------|---------------|
| code | Empty | "Department code is required" |
| code | > 10 chars | "Code must be 10 characters or less" |
| name | Empty | "Department name is required" |
| name | > 100 chars | "Name must be 100 characters or less" |

### Confirmation Dialogs

| Action | Dialog Message |
|--------|----------------|
| Delete | "Are you sure you want to delete {department.name}?" |

---

## Future Validations (Planned)

The following validations are planned for future implementation:

| ID | Validation | Description | Phase |
|----|------------|-------------|-------|
| VAL-DEPT-020 | Code Uniqueness | Prevent duplicate department codes | Phase 2 |
| VAL-DEPT-021 | Server-Side Validation | API-level validation | Phase 2 |
| VAL-DEPT-022 | Hierarchy Depth | Maximum 5 levels | Phase 3 |
| VAL-DEPT-023 | Circular Reference | Prevent self-reference in hierarchy | Phase 3 |
| VAL-DEPT-024 | Budget Constraints | Child budgets <= parent budget | Phase 4 |
| VAL-DEPT-025 | Active Parent | Cannot create under inactive parent | Phase 3 |
| VAL-DEPT-026 | Approval Limits | Validate against parent limits | Phase 4 |

---

## Testing Checklist

### Unit Tests

- [ ] Zod schema validates required code
- [ ] Zod schema validates code max length
- [ ] Zod schema validates required name
- [ ] Zod schema validates name max length
- [ ] Zod schema allows optional description
- [ ] Zod schema validates status enum
- [ ] Zod schema allows optional managers array
- [ ] Zod schema allows optional costCenter

### Integration Tests

- [ ] Form displays error when code empty on submit
- [ ] Form displays error when name empty on submit
- [ ] Code field disabled when editing existing department
- [ ] Delete confirmation dialog appears before deletion
- [ ] Only eligible managers shown in department heads list

### E2E Tests

- [ ] Create department with valid data succeeds
- [ ] Create department with empty code fails
- [ ] Edit department preserves immutable code
- [ ] Delete department with confirmation succeeds
- [ ] Delete department with cancel does nothing

---

**Document End**
