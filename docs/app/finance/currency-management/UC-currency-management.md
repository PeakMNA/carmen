# Use Cases: Currency Management

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

This document describes the use cases for the Currency Management module, which provides basic CRUD operations for managing currency master data. The current implementation focuses on maintaining a list of available currencies that can be used throughout the Carmen ERP system.

**Related Documents**:
- [Business Requirements](./BR-currency-management.md)
- [Data Dictionary](./DD-currency-management.md)
- [Technical Specification](./TS-currency-management.md)
- [Flow Diagrams](./FD-currency-management.md)
- [Validation Rules](./VAL-currency-management.md)

---

## Actors

### Primary Actors

| Actor | Description | Typical Tasks |
|-------|-------------|---------------|
| **Finance Manager** | Manages finance configurations | Creates and configures currencies |
| **System Administrator** | System configuration owner | Manages currency master data |

### Secondary Actors

| Actor | Description | Typical Tasks |
|-------|-------------|---------------|
| **Accountant** | Finance team member | Views available currencies |

---

## Use Case Summary

| ID | Use Case | Actor | Priority |
|----|----------|-------|----------|
| UC-CUR-001 | View Currency List | All Actors | High |
| UC-CUR-002 | Create New Currency | Finance Manager, Admin | High |
| UC-CUR-003 | Edit Currency | Finance Manager, Admin | High |
| UC-CUR-004 | Delete Currency | Finance Manager, Admin | Medium |
| UC-CUR-005 | Duplicate Currency | Finance Manager, Admin | Low |
| UC-CUR-006 | Search Currencies | All Actors | High |
| UC-CUR-007 | Filter Active Currencies | All Actors | Medium |
| UC-CUR-008 | Select Multiple Currencies | Finance Manager, Admin | Medium |
| UC-CUR-009 | Print Currency List | All Actors | Low |

---

## Use Case Specifications

### UC-CUR-001: View Currency List

**Use Case ID**: UC-CUR-001
**Use Case Name**: View Currency List
**Actor**: All Actors
**Priority**: High
**Status**: Implemented

#### Description
User views the list of all currencies in the system displayed in a table format.

#### Preconditions
1. User has access to the Currency Management module
2. User navigates to `/finance/currency-management`

#### Main Flow
1. System displays the Currency Management page
2. System shows table with columns: Checkbox, Currency Code, Currency Description, Active, Actions
3. System displays all currencies (or filtered list if filters are active)
4. User can view currency details in each row

#### Postconditions
- Currency list is displayed to user

#### UI Elements
- Table with currency data
- Column headers: Currency Code, Currency Description, Active, Actions
- Row selection checkboxes
- Actions dropdown menu per row

---

### UC-CUR-002: Create New Currency

**Use Case ID**: UC-CUR-002
**Use Case Name**: Create New Currency
**Actor**: Finance Manager, System Administrator
**Priority**: High
**Status**: Implemented

#### Description
User creates a new currency by entering currency code, description, and active status.

#### Preconditions
1. User has access to create currencies
2. User is on the Currency Management page

#### Main Flow
1. User clicks the "Create" button in the header
2. System opens the "Create New Currency" dialog
3. User enters Currency Code (auto-converts to uppercase)
4. User enters Description
5. User optionally toggles Active status (default: checked)
6. User clicks "Create" button
7. System validates input (code and description required)
8. System adds currency to the list
9. System closes dialog

#### Alternative Flow - Cancel Creation
3a. User clicks "Cancel" button
3b. System closes dialog without saving

#### Alternative Flow - Validation Failure
7a. Code or description is empty
7b. System prevents creation (button remains inactive or shows error)
7c. User must fill required fields

#### Postconditions
- New currency is added to the currency list
- Currency is visible in the table

#### Business Rules
- Currency code auto-converts to uppercase
- Both code and description are required

---

### UC-CUR-003: Edit Currency

**Use Case ID**: UC-CUR-003
**Use Case Name**: Edit Currency
**Actor**: Finance Manager, System Administrator
**Priority**: High
**Status**: Implemented

#### Description
User modifies an existing currency's description or active status.

#### Preconditions
1. User has access to edit currencies
2. At least one currency exists in the system

#### Main Flow
1. User locates the currency in the table
2. User clicks the Actions menu (three dots icon) on the row
3. User selects "Edit" from the dropdown
4. System opens "Edit Currency" dialog with current values
5. System displays Currency Code as read-only
6. User modifies Description and/or Active status
7. User clicks "Save Changes" button
8. System updates the currency
9. System closes dialog

#### Alternative Flow - Cancel Edit
7a. User clicks "Cancel" button
7b. System closes dialog without saving changes

#### Postconditions
- Currency is updated with new values
- Changes are reflected in the table

#### Business Rules
- Currency code cannot be changed (read-only)
- Description can be updated to any non-empty value
- Active status can be toggled

---

### UC-CUR-004: Delete Currency

**Use Case ID**: UC-CUR-004
**Use Case Name**: Delete Currency
**Actor**: Finance Manager, System Administrator
**Priority**: Medium
**Status**: Implemented

#### Description
User removes one or more currencies from the system.

#### Preconditions
1. User has access to delete currencies
2. At least one currency exists in the system

#### Main Flow - Single Delete
1. User locates the currency in the table
2. User clicks the Actions menu on the row
3. User selects "Delete" from the dropdown
4. System shows confirmation dialog
5. User confirms deletion
6. System removes currency from the list

#### Main Flow - Bulk Delete
1. User selects multiple currencies using row checkboxes
2. User clicks "Delete" button in header
3. System shows confirmation dialog with count
4. User confirms deletion
5. System removes all selected currencies

#### Alternative Flow - Cancel Deletion
5a. User cancels the confirmation dialog
5b. Currency is not deleted

#### Postconditions
- Currency is removed from the system
- Currency no longer appears in the table

#### Business Rules
- Deletion requires user confirmation
- Multiple currencies can be deleted at once via bulk selection

---

### UC-CUR-005: Duplicate Currency

**Use Case ID**: UC-CUR-005
**Use Case Name**: Duplicate Currency
**Actor**: Finance Manager, System Administrator
**Priority**: Low
**Status**: Implemented

#### Description
User creates a copy of an existing currency.

#### Preconditions
1. User has access to create currencies
2. At least one currency exists in the system

#### Main Flow
1. User locates the currency to duplicate
2. User clicks the Actions menu on the row
3. User selects "Duplicate" from the dropdown
4. System creates new currency with code "{original}_COPY"
5. System copies description and active status from original
6. New currency appears in the table

#### Postconditions
- New currency created with `_COPY` suffix
- Original currency remains unchanged

---

### UC-CUR-006: Search Currencies

**Use Case ID**: UC-CUR-006
**Use Case Name**: Search Currencies
**Actor**: All Actors
**Priority**: High
**Status**: Implemented

#### Description
User searches for currencies by code or description.

#### Preconditions
1. User is on the Currency Management page

#### Main Flow
1. User enters search term in the search input field
2. System filters currencies in real-time as user types
3. System matches against currency code and description
4. System displays only matching currencies

#### Alternative Flow - Clear Search
1. User clears the search input
2. System displays all currencies (respecting other active filters)

#### Postconditions
- Table shows only currencies matching search term
- Search is case-insensitive

#### Business Rules
- Search matches both code and description
- Search is case-insensitive
- Filtering is real-time (no submit button needed)

---

### UC-CUR-007: Filter Active Currencies

**Use Case ID**: UC-CUR-007
**Use Case Name**: Filter Active Currencies
**Actor**: All Actors
**Priority**: Medium
**Status**: Implemented

#### Description
User filters the currency list to show only active currencies.

#### Preconditions
1. User is on the Currency Management page

#### Main Flow
1. User checks the "Show Active" checkbox
2. System filters table to show only currencies with active = true
3. Inactive currencies are hidden from view

#### Alternative Flow - Show All
1. User unchecks the "Show Active" checkbox
2. System displays all currencies regardless of active status

#### Postconditions
- Table shows currencies based on filter selection
- Filter works in combination with search

---

### UC-CUR-008: Select Multiple Currencies

**Use Case ID**: UC-CUR-008
**Use Case Name**: Select Multiple Currencies
**Actor**: Finance Manager, System Administrator
**Priority**: Medium
**Status**: Implemented

#### Description
User selects multiple currencies for bulk operations.

#### Preconditions
1. User is on the Currency Management page
2. At least one currency exists

#### Main Flow - Individual Selection
1. User clicks checkbox on individual rows
2. System tracks selected currencies
3. Delete button becomes enabled when selection exists

#### Main Flow - Select All
1. User clicks checkbox in table header
2. System selects all visible currencies
3. Clicking again deselects all

#### Postconditions
- Selected currencies are marked for bulk operations
- Selection count affects Delete button state

---

### UC-CUR-009: Print Currency List

**Use Case ID**: UC-CUR-009
**Use Case Name**: Print Currency List
**Actor**: All Actors
**Priority**: Low
**Status**: Implemented

#### Description
User prints the current view of the currency list.

#### Preconditions
1. User is on the Currency Management page

#### Main Flow
1. User clicks "Print" button in the header
2. System triggers browser print dialog
3. User proceeds with printing

#### Postconditions
- Browser print dialog is displayed
- Current filter/search state is reflected in print view

---

## User Journey Diagram

```
                    Currency Management User Journey
                    ================================

    [Navigate to Module]
           |
           v
    +----------------+
    | View Currency  |<----------------------------------+
    | List           |                                   |
    +----------------+                                   |
           |                                             |
           +---> [Search] ---> Filter Results --+       |
           |                                     |       |
           +---> [Show Active] ---> Filter -----+       |
           |                                     |       |
           +---> [Select Rows] ---> Enable -----+       |
           |     Bulk Delete                     |       |
           |                                     |       |
           +---> [Create] ----+                  |       |
           |                  |                  |       |
           |                  v                  |       |
           |          +----------------+         |       |
           |          | Create Dialog  |         |       |
           |          +----------------+         |       |
           |                  |                  |       |
           |          [Save] / [Cancel]          |       |
           |                  |                  |       |
           |                  +------------------+       |
           |                                             |
           +---> [Row Actions]                           |
                      |                                  |
                      +---> [Edit] ----> Edit Dialog ----+
                      |                                  |
                      +---> [Duplicate] --> Add Copy ----+
                      |                                  |
                      +---> [Delete] ---> Confirm -------+
                      |
                      +---> [Print] ---> Browser Print
```

---

## Interaction Summary

### Button Actions

| Button | Location | Action | Precondition |
|--------|----------|--------|--------------|
| Create | Header | Opens create dialog | Always enabled |
| Delete | Header | Deletes selected currencies | Enabled when selection exists |
| Print | Header | Opens browser print dialog | Always enabled |

### Row Actions Menu

| Action | Effect |
|--------|--------|
| Edit | Opens edit dialog for the currency |
| Duplicate | Creates copy with _COPY suffix |
| Delete | Removes currency after confirmation |

### Inline Controls

| Control | Location | Effect |
|---------|----------|--------|
| Row Checkbox | First column | Toggles row selection |
| Header Checkbox | Table header | Select/deselect all visible rows |
| Active Checkbox | Active column | Toggles currency active status |

---

## Future Use Cases (Planned)

The following use cases are planned for future implementation:

| ID | Use Case | Description |
|----|----------|-------------|
| UC-CUR-101 | Manage Exchange Rates | Create and maintain exchange rates |
| UC-CUR-102 | Auto-Fetch Exchange Rates | Retrieve rates from external APIs |
| UC-CUR-103 | Process Foreign Currency Transaction | Handle multi-currency transactions |
| UC-CUR-104 | Calculate Exchange Gain/Loss | Compute realized/unrealized gains |
| UC-CUR-105 | Period-End Revaluation | Revalue foreign currency balances |
| UC-CUR-106 | Currency Exposure Report | View currency risk exposure |

---

**Document End**
