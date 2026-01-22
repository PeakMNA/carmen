# Validation Rules: Exchange Rate Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Exchange Rate Management
- **Route**: `/finance/exchange-rates`
- **Version**: 2.0.0
- **Last Updated**: 2026-01-17
- **Owner**: Finance Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-17 | Documentation Team | Updated to reflect actual implementation |
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format |
| 1.0.0 | 2025-01-13 | Documentation Team | Initial version |

---

## Overview

This document defines the validation rules for the Exchange Rate Management module. The current implementation uses client-side validation only with React local state.

**Related Documents**:
- [Business Requirements](./BR-exchange-rate-management.md)
- [Use Cases](./UC-exchange-rate-management.md)
- [Data Dictionary](./DD-exchange-rate-management.md)
- [Technical Specification](./TS-exchange-rate-management.md)
- [Flow Diagrams](./FD-exchange-rate-management.md)

---

## Validation Summary

| Rule ID | Field | Rule | Implemented |
|---------|-------|------|-------------|
| VAL-EXRATE-001 | Currency Code | Required, non-empty | Yes |
| VAL-EXRATE-002 | Currency Code | Auto-uppercase conversion | Yes |
| VAL-EXRATE-003 | Currency Name | Required, non-empty | Yes |
| VAL-EXRATE-004 | Exchange Rate | Required, greater than zero | Yes |
| VAL-EXRATE-005 | Currency Code | Immutable on edit | Yes |
| VAL-EXRATE-006 | Delete | Confirmation required | Yes |

---

## Field Validations

### VAL-EXRATE-001: Currency Code Required

**Rule ID**: VAL-EXRATE-001
**Field**: Currency Code
**Type**: Required

**Description**: Currency code must be provided and cannot be empty.

**Implementation**:
```typescript
if (newRate.code && newRate.name && newRate.rate > 0) {
  // Proceed with creation
}
```

**Error Handling**: Form does not submit if code is empty.

---

### VAL-EXRATE-002: Currency Code Uppercase

**Rule ID**: VAL-EXRATE-002
**Field**: Currency Code
**Type**: Format

**Description**: Currency code is automatically converted to uppercase on input.

**Implementation**:
```typescript
<Input
  id="code"
  value={newRate.code}
  onChange={(e) => setNewRate({ ...newRate, code: e.target.value.toUpperCase() })}
  placeholder="e.g., USD"
/>
```

**Behavior**: User types "usd" and sees "USD" in the input field.

---

### VAL-EXRATE-003: Currency Name Required

**Rule ID**: VAL-EXRATE-003
**Field**: Currency Name
**Type**: Required

**Description**: Currency name must be provided and cannot be empty.

**Implementation**:
```typescript
if (newRate.code && newRate.name && newRate.rate > 0) {
  // Proceed with creation
}
```

**Error Handling**: Form does not submit if name is empty.

---

### VAL-EXRATE-004: Exchange Rate Positive

**Rule ID**: VAL-EXRATE-004
**Field**: Exchange Rate
**Type**: Range

**Description**: Exchange rate must be a positive number greater than zero.

**Implementation**:
```typescript
if (newRate.code && newRate.name && newRate.rate > 0) {
  // Proceed with creation
}
```

**Input Configuration**:
```typescript
<Input
  id="rate"
  type="number"
  min="0"
  step="0.000001"
  value={newRate.rate}
  onChange={(e) => setNewRate({ ...newRate, rate: parseFloat(e.target.value) })}
/>
```

**Features**:
- Minimum value: 0 (HTML5 validation)
- Step: 0.000001 (6 decimal precision)
- Type: number (numeric keyboard on mobile)

---

### VAL-EXRATE-005: Currency Code Immutable

**Rule ID**: VAL-EXRATE-005
**Field**: Currency Code (Edit Dialog)
**Type**: Immutable

**Description**: Currency code cannot be changed after creation.

**Implementation**:
```typescript
<Input
  id="edit-code"
  value={editingRate.code}
  disabled
  className="bg-muted"
/>
```

**Behavior**: Code field is disabled in edit dialog, preventing changes.

---

### VAL-EXRATE-006: Delete Confirmation

**Rule ID**: VAL-EXRATE-006
**Action**: Delete
**Type**: Confirmation

**Description**: User must confirm before deleting an exchange rate.

**Implementation**:
```typescript
const handleDeleteRate = (code: string) => {
  if (confirm(`Are you sure you want to delete exchange rate for ${code}?`)) {
    setCurrencies(currencies.filter(c => c.code !== code))
  }
}
```

**Behavior**: Browser native confirm dialog appears with currency code in message.

---

## Validation Flow

### Add Rate Validation Flow

```
User fills form
    |
    v
Click "Add Rate" button
    |
    v
Check: code not empty? ----No----> Do nothing (button ineffective)
    |
    Yes
    v
Check: name not empty? ----No----> Do nothing
    |
    Yes
    v
Check: rate > 0? ----------No----> Do nothing
    |
    Yes
    v
Add rate to list
```

### Edit Rate Validation Flow

```
User modifies form
    |
    v
Click "Save Changes" button
    |
    v
Update rate in array (no explicit validation on edit)
    |
    v
Close dialog
```

**Note**: Edit mode assumes data is valid since it was previously validated on creation.

---

## Input Specifications

### Currency Code Input

| Property | Value |
|----------|-------|
| Type | text |
| Transform | toUpperCase() on change |
| Required | Yes (implicit through validation) |
| Max Length | No limit (UI) |
| Placeholder | "e.g., USD" |

### Currency Name Input

| Property | Value |
|----------|-------|
| Type | text |
| Required | Yes (implicit through validation) |
| Max Length | No limit (UI) |
| Placeholder | "e.g., United States Dollar" |

### Exchange Rate Input

| Property | Value |
|----------|-------|
| Type | number |
| Min | 0 |
| Step | 0.000001 |
| Required | Yes (implicit through validation) |
| Default | 1.0 (for new rates) |

---

## Error Messages

### Current Implementation

The current implementation does not display explicit error messages. Validation failures result in the form action not proceeding (silent failure).

| Scenario | Current Behavior |
|----------|------------------|
| Empty code | Add button does nothing |
| Empty name | Add button does nothing |
| Rate <= 0 | Add button does nothing |
| Delete | Browser confirm dialog |

### Recommended Improvements (Phase 2)

| Scenario | Recommended Message |
|----------|-------------------|
| Empty code | "Currency code is required" |
| Empty name | "Currency name is required" |
| Rate <= 0 | "Exchange rate must be greater than zero" |
| Duplicate code | "Currency code already exists" |

---

## Validation Layers

### Current State

| Layer | Implemented |
|-------|-------------|
| Client-Side (React) | Yes |
| Server-Side | No |
| Database Constraints | No |

### Future State (Planned)

| Layer | Technology |
|-------|------------|
| Client-Side | React Hook Form + Zod |
| Server-Side | Next.js Server Actions |
| Database | Prisma schema constraints |

---

## Business Rule Validations

### BR-EXRATE-001: Rate Positivity

**Rule**: Exchange rates must be positive numbers.
**Validation**: `rate > 0`
**Status**: Implemented

### BR-EXRATE-002: Code Immutability

**Rule**: Currency codes cannot be modified after creation.
**Validation**: Disabled input field
**Status**: Implemented

### BR-EXRATE-003: Delete Confirmation

**Rule**: Deletions require user confirmation.
**Validation**: Browser confirm dialog
**Status**: Implemented

### BR-EXRATE-004: Uppercase Codes

**Rule**: Currency codes should follow ISO 4217 standard (uppercase).
**Validation**: Auto-convert to uppercase on input
**Status**: Implemented

### BR-EXRATE-005: Timestamp Update

**Rule**: Last updated date automatically set on create/edit.
**Validation**: `new Date().toISOString().split('T')[0]`
**Status**: Implemented

---

## Test Scenarios

### Valid Input Tests

| Test | Input | Expected Result |
|------|-------|-----------------|
| Create valid rate | code: "CHF", name: "Swiss Franc", rate: 0.89 | Rate added to list |
| Edit rate value | Change rate from 1.0 to 1.05 | Rate updated, date updated |
| Search by code | Search "USD" | Shows USD rate only |
| Search by name | Search "Euro" | Shows EUR rate only |

### Invalid Input Tests

| Test | Input | Expected Result |
|------|-------|-----------------|
| Empty code | code: "", name: "Test", rate: 1.0 | Form does not submit |
| Empty name | code: "TST", name: "", rate: 1.0 | Form does not submit |
| Zero rate | code: "TST", name: "Test", rate: 0 | Form does not submit |
| Negative rate | code: "TST", name: "Test", rate: -1 | Form does not submit |

### Edge Case Tests

| Test | Input | Expected Result |
|------|-------|-----------------|
| Lowercase code | code: "usd" | Converts to "USD" |
| Small rate | rate: 0.000001 | Accepts 6 decimal precision |
| Large rate | rate: 999999.999999 | Accepts value |
| Cancel delete | Click Cancel on confirm | No deletion |

---

**Document End**
