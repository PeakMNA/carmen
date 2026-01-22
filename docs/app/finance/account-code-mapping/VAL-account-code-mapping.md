# Validation Rules: Account Code Mapping

## Module Information
- **Module**: Finance
- **Sub-Module**: Account Code Mapping
- **Version**: 2.0.0
- **Last Updated**: 2026-01-17
- **Status**: Active

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-17 | Documentation Team | Updated to reflect actual implementation |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---

## Overview

This document defines validation rules for the Account Code Mapping module. The current implementation uses local state management with mock data and does not include server-side validation or database constraints. This document describes the current client-side behavior and field requirements.

**Related Documents**:
- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Data Dictionary](./DD-account-code-mapping.md)
- [Flow Diagrams](./FD-account-code-mapping.md)

---

## Validation Strategy

```
User Input
    |
[Client-Side State] - Form inputs with Input components
    |
[Local State Update] - useState arrays
    |
Data Stored (in memory)
```

**Current Implementation**:
- All validation is implicit (no explicit Zod schemas)
- Form fields accept any text input
- Data persists only in component state (not persisted)
- No server-side validation

---

## 1. AP Mapping Field Validations

### APMapping Interface Fields

| Field | Type | Required | Current Validation |
|-------|------|----------|-------------------|
| id | string | Auto | Generated via `Date.now()` |
| businessUnit | string | No | No validation |
| store | string | No | No validation |
| category | string | No | No validation |
| subCategory | string | No | No validation |
| itemGroup | string | No | No validation |
| department | string | No | No validation |
| accountCode | string | No | No validation |

### VAL-ACM-001: Business Unit

**Field**: `businessUnit`
**Type**: string
**Current Behavior**: Text input, accepts any value

**Expected Values** (from mock data):
- Operations
- Rooms
- Administration

---

### VAL-ACM-002: Store/Location

**Field**: `store`
**Type**: string
**Current Behavior**: Text input, accepts any value

**Expected Values** (from mock data):
- Mini Bar, MIN1
- Rooms - Housekeeping, RH
- A&G - Security, AGS

---

### VAL-ACM-003: Category

**Field**: `category`
**Type**: string
**Current Behavior**: Text input, accepts any value

**Expected Values** (from mock data):
- Beverage
- Food

---

### VAL-ACM-004: Sub-Category

**Field**: `subCategory`
**Type**: string
**Current Behavior**: Text input, accepts any value

**Expected Values** (from mock data):
- Beers, Spirits, Soft Drink
- Dry Goods

---

### VAL-ACM-005: Item Group

**Field**: `itemGroup`
**Type**: string
**Current Behavior**: Text input, accepts any value

**Expected Values** (from mock data):
- Beer, Vodka, Waters, Juices
- Coffee/Tea/Hot Bev., Sugar

---

### VAL-ACM-006: Department

**Field**: `department`
**Type**: string
**Current Behavior**: Text input, accepts any value

**Expected Values** (from mock data):
- 35 (Operations/F&B)
- 21 (Rooms)
- 10 (Administration)

---

### VAL-ACM-007: Account Code (AP)

**Field**: `accountCode`
**Type**: string
**Current Behavior**: Text input with `font-mono` styling for display

**Expected Format**: 7-digit numeric account code (debit account only)

**Expected Values** (from mock data):
- 5000020
- 1116007
- 1111005

---

## 2. GL Mapping Field Validations

### GLMapping Interface Fields

| Field | Type | Required | Current Validation |
|-------|------|----------|-------------------|
| id | string | Auto | Generated via `Date.now()` |
| businessUnit | string | No | No validation |
| store | string | No | No validation |
| category | string | No | No validation |
| itemGroup | string | No | No validation |
| movementType | string | No | No validation |
| drDepartment | string | No | No validation |
| crDepartment | string | No | No validation |
| drAccount | string | No | No validation |
| crAccount | string | No | No validation |

### VAL-ACM-008: Movement Type

**Field**: `movementType`
**Type**: string
**Current Behavior**: Text input, accepts any value

**Expected Values** (from mock data):
- Purchase
- Transfer
- Sale
- Usage

---

### VAL-ACM-009: Debit Department

**Field**: `drDepartment`
**Type**: string
**Current Behavior**: Text input, accepts any value

**Expected Values** (from mock data):
- Kitchen
- Bar
- Housekeeping
- Admin

---

### VAL-ACM-010: Credit Department

**Field**: `crDepartment`
**Type**: string
**Current Behavior**: Text input, accepts any value

**Expected Values** (from mock data):
- Inventory
- Warehouse
- Revenue
- Supplies

---

### VAL-ACM-011: Debit Account

**Field**: `drAccount`
**Type**: string
**Current Behavior**: Text input with `font-mono` styling

**Expected Format**: 7-digit numeric GL account code

**Expected Values** (from mock data):
- 5001001, 5001002 (Cost accounts)
- 1100001 (AR/Receivable)
- 6001001, 6002001 (Expense accounts)

---

### VAL-ACM-012: Credit Account

**Field**: `crAccount`
**Type**: string
**Current Behavior**: Text input with `font-mono` styling

**Expected Format**: 7-digit numeric GL account code

**Expected Values** (from mock data):
- 1200001, 1200002, 1200003, 1200004 (Inventory accounts)
- 4000001 (Revenue account)

---

## 3. CRUD Operation Validations

### VAL-ACM-020: Create Validation

**Current Behavior**:
- New ID generated via `String(Date.now())`
- All form fields accepted as-is
- Added to state array immediately
- No duplicate checking
- No required field enforcement

---

### VAL-ACM-021: Edit Validation

**Current Behavior**:
- Updates existing record by ID match
- All form fields accepted as-is
- State array updated via map()
- No change tracking

---

### VAL-ACM-022: Delete Validation

**Current Behavior**:
- Browser confirmation dialog: `window.confirm('Are you sure you want to delete this mapping?')`
- If confirmed, removes from state array by ID
- No cascade checks
- No undo capability

---

### VAL-ACM-023: Duplicate Validation

**Current Behavior**:
- New ID generated via `String(Date.now())`
- All other fields cloned from source
- No duplicate detection
- Immediate addition to state

---

## 4. Search Validation

### VAL-ACM-030: Search Filter

**Current Behavior**:
- Case-insensitive search across all fields
- Searches all field values as strings
- Updates filtered results on every keystroke
- Empty search shows all records

**Implementation**:
```
Object.values(row).some(val =>
  val.toString().toLowerCase().includes(searchTerm.toLowerCase())
)
```

---

## 5. View Selection Validation

### VAL-ACM-040: View Selection

**Field**: `selectedView`
**Type**: string (controlled)
**Valid Values**: "posting-to-ap" | "posting-to-gl"

**Current Behavior**:
- Default: "posting-to-ap"
- Controlled via Select component
- Changes table rendering and form fields
- Persists during session (state only)

---

## 6. UI Component Validations

### VAL-ACM-050: Dialog State Management

**Current Behavior**:
- Three useEffect hooks manage dialog cleanup
- When view dialog closes: `selectedMapping` cleared
- When create dialog closes: `formData` cleared
- When edit dialog closes: `formData` and `selectedMapping` cleared

---

### VAL-ACM-051: Form Data Binding

**Current Behavior**:
- Form fields bound to `formData` state object
- Input changes update `formData` via spread operator
- Type casting to APMapping or GLMapping based on view
- Empty strings used for undefined values

---

## 7. Error Handling

### Current Error Handling

| Scenario | Handling |
|----------|----------|
| Delete confirmation | `window.confirm()` browser dialog |
| Scan button | `alert()` placeholder message |
| Import/Export button | `alert()` placeholder message |
| Empty search results | "No mappings found" table message |

### Planned Error Handling (Not Implemented)

| Scenario | Planned Handling |
|----------|-----------------|
| Required field missing | Form field highlight + error message |
| Invalid account code format | Regex validation + tooltip |
| Duplicate mapping | Detection and warning dialog |
| Network error | Toast notification |

---

## 8. Recommended Future Validations

### Schema-Based Validation (Zod)

**AP Mapping Schema**:
```typescript
const apMappingSchema = z.object({
  businessUnit: z.string().min(1, "Business Unit is required"),
  store: z.string().min(1, "Store is required"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().optional(),
  itemGroup: z.string().min(1, "Item Group is required"),
  department: z.string().regex(/^\d+$/, "Department must be numeric"),
  accountCode: z.string().regex(/^\d{7}$/, "Account code must be 7 digits")
})
```

**GL Mapping Schema**:
```typescript
const glMappingSchema = z.object({
  businessUnit: z.string().min(1, "Business Unit is required"),
  store: z.string().min(1, "Store is required"),
  category: z.string().min(1, "Category is required"),
  itemGroup: z.string().min(1, "Item Group is required"),
  movementType: z.enum(["Purchase", "Transfer", "Sale", "Usage"]),
  drDepartment: z.string().min(1, "Debit Department is required"),
  crDepartment: z.string().min(1, "Credit Department is required"),
  drAccount: z.string().regex(/^\d{7}$/, "Debit account must be 7 digits"),
  crAccount: z.string().regex(/^\d{7}$/, "Credit account must be 7 digits")
})
```

---

## 9. Validation Summary

### Current State

| Category | Validation Count | Implementation |
|----------|-----------------|----------------|
| Field Format | 0 | Not implemented |
| Required Fields | 0 | Not implemented |
| Business Rules | 1 | Delete confirmation only |
| Data Integrity | 0 | Not implemented |
| **Total** | **1** | |

### Validation Status by Feature

| Feature | Client-Side | Server-Side | Database |
|---------|-------------|-------------|----------|
| Create | None | None | None |
| Edit | None | None | None |
| Delete | Confirm dialog | None | None |
| Duplicate | None | None | None |
| Search | Filtering only | None | None |
| View switch | Controlled state | None | None |

---

## Related Documents

- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Data Dictionary](./DD-account-code-mapping.md)
- [Flow Diagrams](./FD-account-code-mapping.md)

---

**Document End**
