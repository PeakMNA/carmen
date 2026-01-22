# Validation Rules: Currency Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Currency Management
- **Route**: `/finance/currency-management`
- **Version**: 2.0.0
- **Last Updated**: 2026-01-17
- **Owner**: Finance Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-17 | Documentation Team | Updated to reflect actual implementation |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---

## Overview

This document defines validation rules for the Currency Management module. The current implementation uses simple client-side validation for the basic CRUD operations.

**Related Documents**:
- [Business Requirements](./BR-currency-management.md)
- [Use Cases](./UC-currency-management.md)
- [Data Dictionary](./DD-currency-management.md)
- [Technical Specification](./TS-currency-management.md)
- [Flow Diagrams](./FD-currency-management.md)

---

## Validation Summary

| Rule ID | Field | Validation | Layer |
|---------|-------|------------|-------|
| VAL-CUR-001 | code | Required, non-empty | Client |
| VAL-CUR-002 | code | Auto-uppercase | Client |
| VAL-CUR-003 | description | Required, non-empty | Client |
| VAL-CUR-004 | active | Boolean value | Client |
| VAL-CUR-005 | Delete | Requires confirmation | Client |

---

## Field-Level Validations

### VAL-CUR-001: Currency Code Required

**Field**: `code`
**Data Type**: string
**Validation Rule**: Currency code must not be empty.

**Implementation**:
```typescript
const handleCreateCurrency = () => {
  if (newCurrency.code && newCurrency.description) {
    // Proceed with creation
  }
}
```

**Trigger**: On create button click
**Layer**: Client-side

**Error Handling**: Create button action is blocked if code is empty.

**Test Cases**:
- Valid: "USD" (non-empty)
- Valid: "EUR" (non-empty)
- Invalid: "" (empty string)
- Invalid: null

---

### VAL-CUR-002: Currency Code Auto-Uppercase

**Field**: `code`
**Data Type**: string
**Validation Rule**: Currency code is automatically converted to uppercase.

**Implementation**:
```typescript
onChange={(e) => setNewCurrency({
  ...newCurrency,
  code: e.target.value.toUpperCase()
})}
```

**Trigger**: On input change
**Layer**: Client-side

**Test Cases**:
- Input: "usd" becomes "USD"
- Input: "Eur" becomes "EUR"
- Input: "GBP" stays "GBP"

---

### VAL-CUR-003: Description Required

**Field**: `description`
**Data Type**: string
**Validation Rule**: Description must not be empty.

**Implementation**:
```typescript
const handleCreateCurrency = () => {
  if (newCurrency.code && newCurrency.description) {
    // Proceed with creation
  }
}
```

**Trigger**: On create button click
**Layer**: Client-side

**Error Handling**: Create button action is blocked if description is empty.

**Test Cases**:
- Valid: "United States Dollar" (non-empty)
- Valid: "Euro" (non-empty)
- Invalid: "" (empty string)

---

### VAL-CUR-004: Active Status Boolean

**Field**: `active`
**Data Type**: boolean
**Validation Rule**: Active status must be a boolean value.

**Implementation**:
```typescript
interface Currency {
  code: string
  description: string
  active: boolean
}
```

**Default Value**: `true` for new currencies

**Trigger**: On checkbox change
**Layer**: Client-side (TypeScript type enforcement)

**Test Cases**:
- Valid: `true`
- Valid: `false`
- Invalid: `null` (TypeScript will catch)
- Invalid: `undefined` (TypeScript will catch)

---

## Operation Validations

### VAL-CUR-005: Delete Confirmation

**Operation**: Delete (single or bulk)
**Validation Rule**: User must confirm deletion before proceeding.

**Implementation**:
```typescript
// Single delete
if (confirm('Are you sure you want to delete this currency?')) {
  setCurrencies(currencies.filter(c => c.code !== currency.code))
}

// Bulk delete
const handleDeleteSelected = () => {
  if (confirm(`Are you sure you want to delete ${selectedCurrencies.length} currency(ies)?`)) {
    setCurrencies(currencies.filter(c => !selectedCurrencies.includes(c.code)))
    setSelectedCurrencies([])
  }
}
```

**Trigger**: On delete action
**Layer**: Client-side (browser dialog)

**Test Cases**:
- Confirm: Currency deleted
- Cancel: Currency retained

---

### VAL-CUR-006: Edit Currency Code Immutable

**Operation**: Edit
**Validation Rule**: Currency code cannot be changed during edit.

**Implementation**:
```typescript
<Input
  id="edit-code"
  value={editingCurrency.code}
  disabled
  className="bg-muted"
/>
```

**Trigger**: On edit dialog open
**Layer**: Client-side (UI disabled)

**Rationale**: Currency codes are identifiers and should not change after creation.

---

### VAL-CUR-007: Bulk Delete Button State

**Operation**: Bulk Delete
**Validation Rule**: Delete button is disabled when no currencies are selected.

**Implementation**:
```typescript
<Button
  size="sm"
  variant="destructive"
  onClick={handleDeleteSelected}
  disabled={selectedCurrencies.length === 0}
>
```

**Trigger**: On selection change
**Layer**: Client-side (UI disabled state)

---

## Validation Error Handling

### Current Implementation

The current implementation uses simple validation patterns:

1. **Required Fields**: Create button action only proceeds if both `code` and `description` are non-empty
2. **Delete Confirmation**: Browser `confirm()` dialog
3. **Disabled States**: UI elements disabled when actions are not available

### Error Display

Currently, no explicit error messages are shown. Validation failures result in:
- Blocked actions (create without required fields)
- Disabled buttons (delete without selection)

---

## Future Validations (Planned)

The following validations are planned for future implementation:

| Rule | Description | Phase |
|------|-------------|-------|
| ISO 4217 Code Format | Validate 3-letter ISO code | Phase 2 |
| Unique Code | Prevent duplicate currency codes | Phase 2 |
| In-Use Protection | Prevent deletion of currencies in use | Phase 2 |
| Server-Side Validation | Duplicate validation on server | Phase 2 |
| Exchange Rate Bounds | Validate rate range 0.0001 to 10,000 | Phase 3 |
| Rate Variance Check | Flag rates with >5% variance | Phase 3 |

---

## Validation Layers

### Current Implementation

| Layer | Status | Description |
|-------|--------|-------------|
| Client-Side | Implemented | Basic required field checks |
| TypeScript | Implemented | Type enforcement at compile time |
| Server-Side | Not Implemented | Planned for Phase 2 |
| Database | Not Implemented | Planned for Phase 2 |

### Planned Implementation

```
User Input
    |
    v
[Client-Side Validation] <-- Current
    |
    v
[Server-Side Validation] <-- Phase 2
    |
    v
[Database Constraints] <-- Phase 2
    |
    v
Data Stored
```

---

## Test Coverage

### Validation Test Matrix

| Rule | Unit Test | Integration Test | E2E Test |
|------|-----------|-----------------|----------|
| VAL-CUR-001 | Planned | - | Planned |
| VAL-CUR-002 | Planned | - | Planned |
| VAL-CUR-003 | Planned | - | Planned |
| VAL-CUR-004 | Planned | - | Planned |
| VAL-CUR-005 | Planned | - | Planned |
| VAL-CUR-006 | Planned | - | Planned |
| VAL-CUR-007 | Planned | - | Planned |

---

**Document End**
