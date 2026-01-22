# Business Rules: Currency Management

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
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format |
| 1.0.0 | 2025-11-12 | Documentation Team | Initial version |

---

## Overview

The Currency Management module provides a simple interface for maintaining currency master data. It enables finance administrators to create, view, edit, and manage currencies that are available for use throughout the Carmen ERP system.

**Current Implementation Scope**: Currency master data management with basic CRUD operations. Exchange rate management, multi-currency transactions, and period-end revaluation are planned for future phases.

**Related Documents**:
- [Use Cases](./UC-currency-management.md)
- [Data Dictionary](./DD-currency-management.md)
- [Technical Specification](./TS-currency-management.md)
- [Flow Diagrams](./FD-currency-management.md)
- [Validations](./VAL-currency-management.md)

---

## Business Context

### Module Purpose

The Currency Management module serves as the foundational component for multi-currency support in Carmen ERP. In its current implementation, it provides:

1. **Currency Master Data**: Maintain list of currencies available in the system
2. **Active/Inactive Status**: Control which currencies are available for selection
3. **Search and Filter**: Find currencies quickly by code or description

### Current Features

| Feature | Status | Description |
|---------|--------|-------------|
| Currency List | Implemented | View all currencies in table format |
| Create Currency | Implemented | Add new currency with code and description |
| Edit Currency | Implemented | Modify currency description and status |
| Delete Currency | Implemented | Remove currencies from the system |
| Duplicate Currency | Implemented | Copy an existing currency |
| Search | Implemented | Filter by code or description |
| Active Filter | Implemented | Show only active currencies |
| Bulk Selection | Implemented | Select multiple currencies for deletion |
| Print | Implemented | Print current currency list |

### Future Enhancements (Not Yet Implemented)

The following features are planned for future development phases:
- Exchange rate management and automatic retrieval
- Multi-currency transaction support
- Period-end currency revaluation
- Exchange gain/loss calculations
- IAS 21 compliance features
- Currency exposure reporting

---

## Functional Requirements

### FR-CUR-001: Currency Master List Display

**Description**: Display all currencies in a table format with code, description, and active status.

**Business Need**: Users need visibility into all available currencies to manage the currency master data.

**Acceptance Criteria**:
- Table displays currency code, description, and active status
- Table supports row selection via checkboxes
- Each row has an actions menu

**User Roles**: Finance Manager, System Administrator

---

### FR-CUR-002: Create New Currency

**Description**: Allow users to add new currencies to the system.

**Business Need**: Organizations need to add currencies as they expand operations to new markets.

**Acceptance Criteria**:
- Modal dialog opens when clicking "Create" button
- Currency code field (auto-uppercase)
- Description field
- Active status checkbox (default: checked)
- Cancel and Create buttons
- Currency added to list on successful creation

**User Roles**: Finance Manager, System Administrator

**Validation Rules**:
- Currency code is required
- Description is required
- Code should be uppercase (auto-converted)

---

### FR-CUR-003: Edit Existing Currency

**Description**: Allow users to modify currency description and active status.

**Business Need**: Currency information may need updates as business requirements change.

**Acceptance Criteria**:
- Edit option available in row actions menu
- Modal dialog opens with current values
- Currency code is read-only (cannot be changed)
- Description and active status are editable
- Changes saved on clicking "Save Changes"

**User Roles**: Finance Manager, System Administrator

---

### FR-CUR-004: Delete Currency

**Description**: Allow users to remove currencies from the system.

**Business Need**: Obsolete or incorrectly created currencies need to be removed.

**Acceptance Criteria**:
- Delete option in row actions menu
- Confirmation dialog before deletion
- Currency removed from list on confirmation
- Bulk delete supported for selected currencies

**User Roles**: Finance Manager, System Administrator

**Business Rule**: Deletion should be prevented if currency is in use (future enhancement when transactions are implemented).

---

### FR-CUR-005: Duplicate Currency

**Description**: Create a copy of an existing currency.

**Business Need**: Quickly create similar currencies for testing or variations.

**Acceptance Criteria**:
- Duplicate option in row actions menu
- New currency created with `_COPY` suffix on code
- All other properties copied from source currency

**User Roles**: Finance Manager, System Administrator

---

### FR-CUR-006: Search and Filter

**Description**: Filter the currency list by search term and active status.

**Business Need**: Quickly find currencies in large lists.

**Acceptance Criteria**:
- Search input filters by code or description
- Case-insensitive search
- "Show Active" checkbox filters to active currencies only
- Filtering is real-time as user types

**User Roles**: All users with module access

---

### FR-CUR-007: Bulk Selection

**Description**: Select multiple currencies for bulk operations.

**Business Need**: Efficiently manage multiple currencies at once.

**Acceptance Criteria**:
- Checkbox on each row for individual selection
- Header checkbox for select all/deselect all
- Selected count reflected in delete button state
- Delete button disabled when no selection

**User Roles**: Finance Manager, System Administrator

---

### FR-CUR-008: Print Currency List

**Description**: Print the current view of the currency list.

**Business Need**: Generate hard copies for review or records.

**Acceptance Criteria**:
- Print button triggers browser print dialog
- Current filter state reflected in printout

**User Roles**: All users with module access

---

## Data Model

### Currency Entity

The currency entity represents a single currency in the system.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | ISO 4217 currency code (e.g., USD, EUR) |
| description | string | Yes | Full currency name (e.g., United States Dollar) |
| active | boolean | Yes | Whether currency is available for use |

### Default Currencies

The system is initialized with the following currencies:

| Code | Description | Active |
|------|-------------|--------|
| USD | United States Dollar | Yes |
| EUR | Euro | Yes |
| JPY | Japanese Yen | Yes |
| GBP | British Pound Sterling | Yes |

---

## Business Rules

### BR-CUR-001: Currency Code Format

**Rule**: Currency codes should follow ISO 4217 standard format.

**Implementation**:
- Codes are automatically converted to uppercase
- Recommended: 3 uppercase letters

**Enforcement**: Client-side (auto-uppercase on input)

---

### BR-CUR-002: Unique Currency Codes

**Rule**: Each currency code must be unique in the system.

**Implementation**: Duplicate codes create a new entry with `_COPY` suffix.

**Note**: Strict uniqueness validation to be implemented in future phase.

---

### BR-CUR-003: Active Status Control

**Rule**: Only active currencies should be available for selection in other modules.

**Implementation**:
- Active status toggleable via checkbox in table or edit dialog
- "Show Active" filter hides inactive currencies

**Note**: Integration with other modules to be implemented in future phase.

---

### BR-CUR-004: Delete Confirmation

**Rule**: Currency deletion requires user confirmation.

**Implementation**: Browser confirm dialog before deletion.

**Note**: Enhanced deletion rules (prevent deletion of in-use currencies) to be implemented in future phase.

---

## User Interface Summary

### Main Page Layout

```
+----------------------------------------------------------------+
| Currency Management                    [Create] [Delete] [Print]|
+----------------------------------------------------------------+
| [Search currencies...]                       [x] Show Active    |
+----------------------------------------------------------------+
| [x] | Currency Code | Currency Description | Active | Actions   |
+----+---------------+---------------------+--------+-----------+
| [ ] | USD           | United States Dollar |  [x]   |   [...]   |
| [ ] | EUR           | Euro                 |  [x]   |   [...]   |
| [ ] | JPY           | Japanese Yen         |  [x]   |   [...]   |
| [ ] | GBP           | British Pound        |  [x]   |   [...]   |
+----+---------------+---------------------+--------+-----------+
```

### Action Menu Options

- Edit - Open edit dialog
- Duplicate - Create copy of currency
- Delete - Remove currency

### Create/Edit Dialog

```
+--------------------------------------+
| Create New Currency / Edit Currency  |
+--------------------------------------+
| Currency Code                        |
| [_________________________]          |
|                                      |
| Description                          |
| [_________________________]          |
|                                      |
| [x] Active                           |
+--------------------------------------+
|            [Cancel]  [Create/Save]   |
+--------------------------------------+
```

---

## Security and Access

### Role-Based Access

| Role | View | Create | Edit | Delete |
|------|------|--------|------|--------|
| System Administrator | Yes | Yes | Yes | Yes |
| Finance Manager | Yes | Yes | Yes | Yes |
| Accountant | Yes | - | - | - |
| Staff | - | - | - | - |

**Note**: Role-based access control to be implemented in future phase. Current implementation allows full access.

---

## Integration Points

### Current Integrations

None - Currency Management operates as a standalone module in the current implementation.

### Planned Integrations

| Module | Integration Type | Purpose |
|--------|-----------------|---------|
| Vendor Management | Reference | Currency selection for vendors |
| Purchase Orders | Reference | Transaction currency |
| Accounts Payable | Reference | Invoice currency |
| Exchange Rate Management | Parent-Child | Rate configuration |

---

## Glossary

| Term | Definition |
|------|------------|
| Currency Code | ISO 4217 three-letter code identifying a currency |
| Active Currency | Currency available for selection in transactions |
| ISO 4217 | International standard for currency codes |

---

**Document End**
