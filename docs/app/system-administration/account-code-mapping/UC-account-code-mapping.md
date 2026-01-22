# Use Cases: Account Code Mapping

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

This document describes the use cases for the Account Code Mapping module, which manages financial posting configurations for inventory transactions.

**Related Documents**:
- [Business Requirements](./BR-account-code-mapping.md)
- [Data Dictionary](./DD-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Flow Diagrams](./FD-account-code-mapping.md)
- [Validation Rules](./VAL-account-code-mapping.md)

---

## Actors

### Primary Actors

| Actor | Description | Typical Tasks |
|-------|-------------|---------------|
| **Financial Controller** | Oversees financial operations | Configures account mappings |
| **AP Clerk** | Processes payable invoices | Views AP mappings for reference |
| **Cost Accountant** | Manages cost allocations | Reviews GL mappings |

---

## Use Case Summary

| ID | Use Case | Actor | Priority |
|----|----------|-------|----------|
| UC-ACM-001 | View Mapping List | All Actors | High |
| UC-ACM-002 | Switch View Type | All Actors | High |
| UC-ACM-003 | Search Mappings | All Actors | High |
| UC-ACM-004 | Create Mapping | Financial Controller | High |
| UC-ACM-005 | Edit Mapping | Financial Controller | High |
| UC-ACM-006 | View Mapping Details | All Actors | Medium |
| UC-ACM-007 | Delete Mapping | Financial Controller | Medium |
| UC-ACM-008 | Duplicate Mapping | Financial Controller | Medium |
| UC-ACM-009 | Print Mappings | All Actors | Low |

---

## Use Case Specifications

### UC-ACM-001: View Mapping List

**Use Case ID**: UC-ACM-001
**Use Case Name**: View Mapping List
**Actor**: All Actors
**Priority**: High
**Status**: Implemented

#### Description
User views the list of account code mappings for the selected view type.

#### Preconditions
1. User has access to System Administration module
2. User navigates to `/system-administration/account-code-mapping`

#### Main Flow
1. System displays AccountCodeMapping component
2. System loads AP mappings by default (selectedView = "posting-to-ap")
3. System renders table with AP mapping columns
4. Each row shows Business Unit, Store, Category, SubCategory, Item Group, Department, Account Code
5. Actions dropdown per row with View, Edit, Duplicate, Delete options

#### Postconditions
- Mapping list displayed to user

---

### UC-ACM-002: Switch View Type

**Use Case ID**: UC-ACM-002
**Use Case Name**: Switch View Type
**Actor**: All Actors
**Priority**: High
**Status**: Implemented

#### Description
User switches between Posting to AP and Posting to GL views.

#### Preconditions
1. User is on Account Code Mapping page

#### Main Flow
1. User clicks View Name dropdown
2. User selects "Posting to GL"
3. System updates selectedView state
4. System renders GL mapping table
5. Columns change to: Business Unit, Store, Category, Item Group, Movement Type, Dr. Department, Cr. Department, Dr. Account, Cr. Account

#### Alternative Flow - Switch Back to AP
3a. User selects "Posting to AP"
3b. System renders AP mapping table

#### Postconditions
- Selected view displayed with appropriate columns

---

### UC-ACM-003: Search Mappings

**Use Case ID**: UC-ACM-003
**Use Case Name**: Search Mappings
**Actor**: All Actors
**Priority**: High
**Status**: Implemented

#### Description
User filters mappings using search input.

#### Preconditions
1. User is on Account Code Mapping page

#### Main Flow
1. User types in search input
2. System updates searchTerm state
3. System filters data using Object.values filter
4. System matches against all fields (case-insensitive)
5. Table displays only matching rows

#### Alternative Flow - No Results
4a. No mappings match search term
4b. System displays "No mappings found" message

#### Postconditions
- Table shows filtered results

---

### UC-ACM-004: Create Mapping

**Use Case ID**: UC-ACM-004
**Use Case Name**: Create Mapping
**Actor**: Financial Controller
**Priority**: High
**Status**: Implemented

#### Description
User creates a new account code mapping.

#### Preconditions
1. User is on Account Code Mapping page
2. User has permission to create mappings

#### Main Flow
1. User clicks Create button
2. System opens isCreateDialogOpen dialog
3. System displays form fields for current view type
4. For AP: Business Unit, Store, Category, Sub-Category, Item Group, Department, Account Code
5. For GL: Business Unit, Store, Category, Item Group, Movement Type, Dr/Cr Department, Dr/Cr Account
6. User fills in all fields
7. User clicks Create button
8. System executes handleSaveCreate
9. System generates new ID (Date.now())
10. System adds mapping to state array
11. System closes dialog

#### Postconditions
- New mapping appears in list

---

### UC-ACM-005: Edit Mapping

**Use Case ID**: UC-ACM-005
**Use Case Name**: Edit Mapping
**Actor**: Financial Controller
**Priority**: High
**Status**: Implemented

#### Description
User modifies an existing mapping.

#### Preconditions
1. Mapping exists in list
2. User is on Account Code Mapping page

#### Main Flow
1. User clicks Actions dropdown on row
2. User selects Edit
3. System calls handleEdit(mapping)
4. System sets selectedMapping and formData
5. System opens isEditDialogOpen dialog
6. Form displays current values
7. User modifies fields
8. User clicks Save Changes
9. System executes handleSaveEdit
10. System updates mapping in state array
11. System closes dialog

#### Postconditions
- Mapping updated with new values

---

### UC-ACM-006: View Mapping Details

**Use Case ID**: UC-ACM-006
**Use Case Name**: View Mapping Details
**Actor**: All Actors
**Priority**: Medium
**Status**: Implemented

#### Description
User views mapping details in read-only dialog.

#### Preconditions
1. Mapping exists in list

#### Main Flow
1. User clicks Actions dropdown on row
2. User selects View
3. System calls handleView(mapping)
4. System sets selectedMapping
5. System opens isViewDialogOpen dialog
6. Dialog displays all fields in read-only format
7. User clicks Close
8. System closes dialog

#### Postconditions
- Dialog closed, no changes made

---

### UC-ACM-007: Delete Mapping

**Use Case ID**: UC-ACM-007
**Use Case Name**: Delete Mapping
**Actor**: Financial Controller
**Priority**: Medium
**Status**: Implemented

#### Description
User removes a mapping from the system.

#### Preconditions
1. Mapping exists in list

#### Main Flow
1. User clicks Actions dropdown on row
2. User selects Delete
3. System calls handleDelete(id)
4. System shows window.confirm dialog
5. User clicks OK
6. System filters out mapping from state array
7. Mapping removed from list

#### Alternative Flow - Cancel
5a. User clicks Cancel
5b. No changes made

#### Postconditions
- Mapping removed from list (if confirmed)

---

### UC-ACM-008: Duplicate Mapping

**Use Case ID**: UC-ACM-008
**Use Case Name**: Duplicate Mapping
**Actor**: Financial Controller
**Priority**: Medium
**Status**: Implemented

#### Description
User creates a copy of an existing mapping.

#### Preconditions
1. Mapping exists in list

#### Main Flow
1. User clicks Actions dropdown on row
2. User selects Duplicate
3. System calls handleDuplicate(mapping)
4. System generates new ID (Date.now())
5. System creates copy with new ID
6. System adds to state array
7. New row appears in list

#### Postconditions
- Duplicate mapping appears in list

---

### UC-ACM-009: Print Mappings

**Use Case ID**: UC-ACM-009
**Use Case Name**: Print Mappings
**Actor**: All Actors
**Priority**: Low
**Status**: Implemented

#### Description
User prints the current mapping list.

#### Preconditions
1. User is on Account Code Mapping page

#### Main Flow
1. User clicks Print button
2. System calls handlePrint
3. System executes window.print()
4. Browser print dialog opens

#### Postconditions
- Browser print dialog displayed

---

## User Journey Diagram

```
                Account Code Mapping User Journey
                ==================================

    [Navigate to Account Code Mapping]
           |
           v
    +------------------+
    | View AP Mappings |<--------------------------------+
    +------------------+                                 |
           |                                             |
           +---> [Switch to GL] --> View GL Mappings ---+
           |                                             |
           +---> [Search] --> Filter Results -----------+
           |                                             |
           +---> [Create] --> Dialog --> Save ----------+
           |                                             |
           +---> [Actions Menu]                          |
                      |                                  |
                      +---> View --> Read-only Dialog ---+
                      +---> Edit --> Edit Dialog --------+
                      +---> Duplicate ------------------+
                      +---> Delete --> Confirm ---------+
```

---

**Document End**
