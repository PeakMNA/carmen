# Business Requirements: Account Code Mapping

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

The Account Code Mapping module enables Financial Controllers to configure how inventory transactions are posted to the financial system. It provides two mapping views: Posting to AP (Accounts Payable) and Posting to GL (General Ledger).

**Related Documents**:
- [Use Cases](./UC-account-code-mapping.md)
- [Data Dictionary](./DD-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Flow Diagrams](./FD-account-code-mapping.md)
- [Validation Rules](./VAL-account-code-mapping.md)

---

## Business Context

### Module Purpose

The Account Code Mapping module enables hospitality operations to:

1. **AP Integration**: Map inventory purchases to Accounts Payable accounts
2. **GL Integration**: Map inventory movements to General Ledger accounts
3. **Department Mapping**: Link transactions to correct cost centers
4. **Transaction Accuracy**: Ensure financial postings are correct

### Current Features

| Feature | Status | Description |
|---------|--------|-------------|
| View Mappings | Implemented | Display AP and GL mappings in tables |
| Switch Views | Implemented | Toggle between AP and GL mapping views |
| Search Mappings | Implemented | Filter mappings by any field |
| Create Mapping | Implemented | Add new mapping record |
| Edit Mapping | Implemented | Modify existing mapping |
| View Mapping | Implemented | View mapping details in dialog |
| Delete Mapping | Implemented | Remove mapping with confirmation |
| Duplicate Mapping | Implemented | Copy existing mapping |
| Scan (Placeholder) | Placeholder | Scan for new codes |
| Import/Export (Placeholder) | Placeholder | Import/export mappings |
| Print | Implemented | Print current mapping list |

---

## Functional Requirements

### FR-ACM-001: Mapping List Display

**Priority**: High
**User Story**: As a Financial Controller, I want to view all account code mappings so that I can verify financial posting configurations.

**Requirements**:
- Display mappings in table format
- Support two views: Posting to AP, Posting to GL
- View selector dropdown
- Search across all fields
- Actions per row: View, Edit, Duplicate, Delete

**Acceptance Criteria**:
- Table shows all mappings for selected view
- Search filters in real-time
- Empty state when no results match

---

### FR-ACM-002: Posting to AP View

**Priority**: High
**User Story**: As a Financial Controller, I want to configure AP posting mappings so that purchases are posted to correct payable accounts.

**Requirements**:
- Table columns: Business Unit, Store/Location, Category, Sub-Category, Item Group, Department, Account Code
- Each row maps inventory categories to AP accounts
- Only debit accounts allowed

**Acceptance Criteria**:
- All mapping columns visible
- Account codes displayed in monospace font
- Clear relationship between inventory and AP accounts

---

### FR-ACM-003: Posting to GL View

**Priority**: High
**User Story**: As a Financial Controller, I want to configure GL posting mappings so that inventory movements post correct journal entries.

**Requirements**:
- Table columns: Business Unit, Store/Location, Category, Item Group, Movement Type, Dr. Department, Cr. Department, Dr. Account, Cr. Account
- Each row maps inventory movements to debit/credit GL accounts
- Support for various movement types (Purchase, Transfer, Sale, Usage)

**Acceptance Criteria**:
- All mapping columns visible
- Both debit and credit accounts shown
- Movement types clearly indicated

---

### FR-ACM-004: Create Mapping

**Priority**: High
**User Story**: As a Financial Controller, I want to create new mappings so that new transaction types can be posted correctly.

**Requirements**:
- Create button opens dialog form
- Form fields match selected view (AP or GL)
- All fields editable

**Acceptance Criteria**:
- Dialog opens with empty form
- Form layout matches view type
- New mapping appears in list after save

---

### FR-ACM-005: Edit Mapping

**Priority**: High
**User Story**: As a Financial Controller, I want to edit mappings so that I can correct posting configurations.

**Requirements**:
- Edit opens dialog with current values
- All fields editable
- Save updates the mapping

**Acceptance Criteria**:
- Dialog pre-populated with current values
- Changes reflected in list after save
- Cancel discards changes

---

### FR-ACM-006: View Mapping Details

**Priority**: Medium
**User Story**: As a Financial Controller, I want to view mapping details in a dialog so that I can review configurations without editing.

**Requirements**:
- View opens read-only dialog
- Display all mapping fields
- Close button returns to list

**Acceptance Criteria**:
- All fields displayed in read-only format
- Field labels clearly visible
- Dialog title indicates mapping type

---

### FR-ACM-007: Delete Mapping

**Priority**: Medium
**User Story**: As a Financial Controller, I want to delete unused mappings so that the list stays current.

**Requirements**:
- Delete button with browser confirmation
- Confirm message before deletion
- Remove from list on confirm

**Acceptance Criteria**:
- Confirmation dialog shown
- Mapping removed on confirm
- Cancel returns without deleting

---

### FR-ACM-008: Duplicate Mapping

**Priority**: Medium
**User Story**: As a Financial Controller, I want to duplicate mappings so that I can quickly create similar configurations.

**Requirements**:
- Duplicate creates copy of mapping
- New mapping added to list with new ID

**Acceptance Criteria**:
- New row appears with same values
- New ID generated for duplicate

---

### FR-ACM-009: Search Mappings

**Priority**: High
**User Story**: As a Financial Controller, I want to search mappings so that I can quickly find specific configurations.

**Requirements**:
- Single search input
- Filter across all visible fields
- Case-insensitive matching

**Acceptance Criteria**:
- Typing filters results in real-time
- Matches any column value
- Empty search shows all mappings

---

### FR-ACM-010: Print Mappings

**Priority**: Low
**User Story**: As a Financial Controller, I want to print the mapping list so that I have a physical reference for audits.

**Requirements**:
- Print button triggers browser print
- Current view and filters applied

**Acceptance Criteria**:
- window.print() called
- Browser print dialog opens

---

## Data Model

### AP Mapping Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| businessUnit | string | Yes | Business unit (Operations, Rooms, Administration) |
| store | string | Yes | Store or location code |
| category | string | Yes | Item category (Food, Beverage) |
| subCategory | string | Yes | Item sub-category |
| itemGroup | string | Yes | Item group |
| department | string | Yes | Department code |
| accountCode | string | Yes | AP account code |

### GL Mapping Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| businessUnit | string | Yes | Business unit |
| store | string | Yes | Store or location |
| category | string | Yes | Item category |
| itemGroup | string | Yes | Item group |
| movementType | string | Yes | Movement type (Purchase, Transfer, Sale, Usage) |
| drDepartment | string | Yes | Debit department |
| crDepartment | string | Yes | Credit department |
| drAccount | string | Yes | Debit GL account |
| crAccount | string | Yes | Credit GL account |

---

## Business Rules

### BR-ACM-001: AP Debit Only

**Rule**: AP mappings only define debit accounts. Tax accounts default from Vendor Profile.

### BR-ACM-002: GL Double Entry

**Rule**: GL mappings must define both debit and credit accounts for double-entry accounting.

### BR-ACM-003: Movement Type Posting

**Rule**: Different movement types (Purchase, Transfer, Sale, Usage) may post to different accounts.

### BR-ACM-004: Location-Based Accounts

**Rule**: GL postings use "To" Location accounts for inventory movements.

---

## User Interface Summary

### Main Page Layout

```
+------------------------------------------------------------------+
| Account Code Mapping          [Scan] [Import/Export] [Print] [Create] |
+------------------------------------------------------------------+
| [Search...]                            View Name: [Posting to AP v] |
+------------------------------------------------------------------+
| Business Unit | Store | Category | SubCat | Item Group | Dept | Account | Actions |
+---------------+-------+----------+--------+------------+------+---------+---------+
| Operations    | Kitchen| Food    | Meat   | Poultry    | 35   | 5000020 | [...] |
| Rooms         | HK     | Supplies | Clean  | Chemicals  | 21   | 1116007 | [...] |
+------------------------------------------------------------------+
| Posting to AP: Manages account code mappings for Accounts Payable... |
+------------------------------------------------------------------+
```

---

## Integration Points

| Module | Integration Type | Purpose |
|--------|-----------------|---------|
| Procurement | Consumer | Uses AP mappings for purchase postings |
| Inventory | Consumer | Uses GL mappings for movement postings |
| Location Management | Reference | Store/Location codes |
| Product Management | Reference | Category and Item Group codes |

---

## Future Enhancements

| Phase | Feature | Description |
|-------|---------|-------------|
| Phase 2 | Database Integration | Persist mappings to database |
| Phase 2 | Scan Feature | Auto-discover unmapped combinations |
| Phase 2 | Import/Export CSV | Bulk mapping management |
| Phase 3 | Validation Rules | Ensure account codes exist |
| Phase 3 | Audit Trail | Track mapping changes |

---

**Document End**
