# Validation Rules: Account Code Mapping

## Module Information
- **Module**: System Administration
- **Sub-Module**: Account Code Mapping
- **Route**: `/system-administration/account-code-mapping`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17
- **Owner**: Finance Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-17 | Documentation Team | Initial version |

---

## Overview

This document defines the validation rules for the Account Code Mapping module. The current implementation has minimal validation with form inputs accepting any values.

**Related Documents**:
- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Data Dictionary](./DD-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Flow Diagrams](./FD-account-code-mapping.md)

---

## Validation Summary

| Rule ID | Field | Rule | Implemented |
|---------|-------|------|-------------|
| VAL-ACM-001 | All fields | Accept any string value | Yes |
| VAL-ACM-002 | Delete | Browser confirmation required | Yes |
| VAL-ACM-003 | Account Code | Display in monospace font | Yes |

---

## Current Validation State

### No Required Field Validation

The current implementation does not enforce required fields. All form inputs accept empty values.

### No Format Validation

Account codes and department codes are not validated for format or existence.

### Delete Confirmation Only

```typescript
const handleDelete = (id: string) => {
  if (window.confirm('Are you sure you want to delete this mapping?')) {
    // Proceed with deletion
  }
}
```

---

## AP Mapping Fields

### Business Unit

| Property | Value |
|----------|-------|
| Type | text |
| Required | No (should be Yes) |
| Values | Operations, Rooms, Administration |

### Store/Location

| Property | Value |
|----------|-------|
| Type | text |
| Required | No (should be Yes) |
| Format | Free text |

### Category

| Property | Value |
|----------|-------|
| Type | text |
| Required | No (should be Yes) |
| Values | Food, Beverage, Supplies |

### Sub-Category

| Property | Value |
|----------|-------|
| Type | text |
| Required | No (should be Yes) |
| Format | Free text |

### Item Group

| Property | Value |
|----------|-------|
| Type | text |
| Required | No (should be Yes) |
| Format | Free text |

### Department

| Property | Value |
|----------|-------|
| Type | text |
| Required | No (should be Yes) |
| Format | Numeric code (not validated) |

### Account Code

| Property | Value |
|----------|-------|
| Type | text |
| Required | No (should be Yes) |
| Format | Numeric code (not validated) |
| Display | Monospace font |

---

## GL Mapping Fields

### Movement Type

| Property | Value |
|----------|-------|
| Type | text |
| Required | No (should be Yes) |
| Values | Purchase, Transfer, Sale, Usage |

### Dr. Department / Cr. Department

| Property | Value |
|----------|-------|
| Type | text |
| Required | No (should be Yes) |
| Format | Department name |

### Dr. Account / Cr. Account

| Property | Value |
|----------|-------|
| Type | text |
| Required | No (should be Yes) |
| Format | GL account code |
| Display | Monospace font |

---

## Business Rule Validations

### BR-ACM-001: AP Debit Only

**Rule**: AP mappings should only define debit accounts.
**Validation**: Not enforced
**Status**: Informational only (in description text)

### BR-ACM-002: GL Double Entry

**Rule**: GL mappings must have both debit and credit accounts.
**Validation**: Not enforced
**Status**: Planned for Phase 2

### BR-ACM-003: Valid Account Codes

**Rule**: Account codes should exist in Chart of Accounts.
**Validation**: Not enforced
**Status**: Planned for Phase 3

---

## Recommended Validations (Phase 2)

### Required Fields

| View | Required Fields |
|------|-----------------|
| AP | businessUnit, store, category, subCategory, itemGroup, department, accountCode |
| GL | businessUnit, store, category, itemGroup, movementType, drDepartment, crDepartment, drAccount, crAccount |

### Format Validations

| Field | Recommended Format |
|-------|-------------------|
| accountCode | Numeric, 7 digits |
| drAccount | Numeric, 7 digits |
| crAccount | Numeric, 7 digits |
| department | Numeric, 2-3 digits |

### Business Rule Validations

| Rule | Validation |
|------|------------|
| Account exists | Lookup against Chart of Accounts |
| Movement type valid | Enum validation (Purchase, Transfer, Sale, Usage) |
| Unique mapping | No duplicate combinations |

---

## Error Messages (Recommended)

### Create/Edit Form

| Scenario | Recommended Message |
|----------|-------------------|
| Empty required field | "[Field name] is required" |
| Invalid account format | "Account code must be 7 digits" |
| Account not found | "Account code not found in Chart of Accounts" |
| Duplicate mapping | "A mapping for this combination already exists" |

### Delete Confirmation

| Current | Improved |
|---------|----------|
| "Are you sure you want to delete this mapping?" | "Delete mapping for [Store] - [Category]? This may affect financial posting accuracy." |

---

## Test Scenarios

### Valid Input Tests

| Test | Input | Expected Result |
|------|-------|-----------------|
| Create with all fields | All fields populated | Mapping created |
| Edit existing | Modify account code | Mapping updated |
| Search by account | "5000020" | Matching rows shown |

### Invalid Input Tests (Future)

| Test | Input | Expected Result |
|------|-------|-----------------|
| Create empty | All fields empty | Validation errors shown |
| Invalid account format | "ABC123" | Format error |
| Duplicate mapping | Existing combination | Duplicate warning |

---

**Document End**
