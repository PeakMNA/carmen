# Use Cases: Department Management

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

This document describes the use cases for the Department Management module, which provides organizational structure management with CRUD operations and user/location assignment capabilities.

**Related Documents**:
- [Business Requirements](./BR-department-management.md)
- [Data Dictionary](./DD-department-management.md)
- [Technical Specification](./TS-department-management.md)
- [Flow Diagrams](./FD-department-management.md)
- [Validation Rules](./VAL-department-management.md)

---

## Actors

### Primary Actors

| Actor | Description | Typical Tasks |
|-------|-------------|---------------|
| **Finance Manager** | Manages organizational structure | Creates/edits departments, assigns cost centers |
| **HR Manager** | Manages employee assignments | Assigns users to departments |
| **Department Head** | Manages team operations | Views department details, reviews assigned staff |

### Secondary Actors

| Actor | Description | Typical Tasks |
|-------|-------------|---------------|
| **System Administrator** | System configuration | Full department management access |

---

## Use Case Summary

| ID | Use Case | Actor | Priority |
|----|----------|-------|----------|
| UC-DEPT-001 | View Department List | All Actors | High |
| UC-DEPT-002 | Search Departments | All Actors | High |
| UC-DEPT-003 | View Department Detail | All Actors | High |
| UC-DEPT-004 | Create Department | Finance Manager | High |
| UC-DEPT-005 | Edit Department | Finance Manager | High |
| UC-DEPT-006 | Delete Department | Finance Manager | Medium |
| UC-DEPT-007 | Assign Users | Finance/HR Manager | High |
| UC-DEPT-008 | Assign Locations | Finance Manager | High |
| UC-DEPT-009 | Assign Department Heads | Finance Manager | High |

---

## Use Case Specifications

### UC-DEPT-001: View Department List

**Use Case ID**: UC-DEPT-001
**Use Case Name**: View Department List
**Actor**: All Actors
**Priority**: High
**Status**: Implemented

#### Description
User views the list of all departments in a table format.

#### Preconditions
1. User has access to the Department Management module
2. User navigates to `/finance/department-list`

#### Main Flow
1. System displays the Department List page
2. System shows header with title and "New Department" button
3. System shows search input
4. System displays table with columns: Code, Name, Description, Head of Department, Status, Actions
5. System shows count of displayed departments

#### Postconditions
- Department list is displayed to user
- Action buttons (View, Edit, Delete) available per row

---

### UC-DEPT-002: Search Departments

**Use Case ID**: UC-DEPT-002
**Use Case Name**: Search Departments
**Actor**: All Actors
**Priority**: High
**Status**: Implemented

#### Description
User filters the department list by search term.

#### Preconditions
1. User is on the Department List page

#### Main Flow
1. User enters search term in search input
2. System filters departments in real-time
3. System matches against code, name, and description
4. System displays only matching departments

#### Alternative Flow - No Results
3a. No departments match the search term
3b. System displays "No departments found matching your search."

#### Postconditions
- Table shows only departments matching search term
- Count updates to show filtered count

---

### UC-DEPT-003: View Department Detail

**Use Case ID**: UC-DEPT-003
**Use Case Name**: View Department Detail
**Actor**: All Actors
**Priority**: High
**Status**: Implemented

#### Description
User views complete information for a specific department.

#### Preconditions
1. Department exists in the system
2. User is on Department List or has direct link

#### Main Flow
1. User clicks View (eye icon) on a department row
2. System navigates to `/finance/department-list/{id}`
3. System displays department detail page with:
   - Header with name, code badge, status badge
   - Basic Information card (name, code, description)
   - Management card (department heads with avatars, cost center)
   - Tabs for Users and Locations
4. User can click tabs to switch between Users and Locations views

#### Alternative Flow - Department Not Found
2a. Department ID does not exist
2b. System displays "Department Not Found" message
2c. System shows link to return to list

#### Postconditions
- Department details displayed
- Edit and Delete buttons available

---

### UC-DEPT-004: Create Department

**Use Case ID**: UC-DEPT-004
**Use Case Name**: Create Department
**Actor**: Finance Manager, System Administrator
**Priority**: High
**Status**: Implemented

#### Description
User creates a new department with basic information and assignments.

#### Preconditions
1. User has permission to create departments
2. User is on Department List page

#### Main Flow
1. User clicks "New Department" button
2. System navigates to `/finance/department-list/new/edit`
3. System displays edit form with empty fields
4. User enters Department Name (required)
5. User enters Department Code (required, max 10 chars)
6. User optionally enters Description
7. User selects department heads from checkbox list
8. User optionally enters Cost Center
9. User sets Active status (default: active)
10. User switches to Users tab and assigns users
11. User switches to Locations tab and assigns locations
12. User clicks "Save Department"
13. System validates form
14. System creates department and redirects to list

#### Alternative Flow - Validation Failure
13a. Required fields are empty
13b. System displays validation error messages
13c. User corrects errors and resubmits

#### Postconditions
- New department created with assignments
- Department appears in list

---

### UC-DEPT-005: Edit Department

**Use Case ID**: UC-DEPT-005
**Use Case Name**: Edit Department
**Actor**: Finance Manager, System Administrator
**Priority**: High
**Status**: Implemented

#### Description
User modifies an existing department's information and assignments.

#### Preconditions
1. Department exists
2. User has permission to edit departments

#### Main Flow
1. User clicks Edit (pencil icon) from list or detail page
2. System navigates to `/finance/department-list/{id}/edit`
3. System displays edit form pre-populated with current values
4. System displays Code field as disabled
5. User modifies Name, Description, Cost Center, Status
6. User modifies department heads selection
7. User modifies user assignments in Users tab
8. User modifies location assignments in Locations tab
9. User clicks "Save Department"
10. System updates department and redirects to detail page

#### Postconditions
- Department updated with new values
- Changes reflected in list and detail views

---

### UC-DEPT-006: Delete Department

**Use Case ID**: UC-DEPT-006
**Use Case Name**: Delete Department
**Actor**: Finance Manager, System Administrator
**Priority**: Medium
**Status**: Implemented

#### Description
User removes a department from the system.

#### Preconditions
1. Department exists
2. User has permission to delete departments

#### Main Flow - Delete from List
1. User clicks Delete (trash icon) on department row
2. System shows confirmation dialog
3. User confirms deletion
4. System removes department from list
5. Department no longer appears in table

#### Main Flow - Delete from Detail
1. User is on department detail page
2. User clicks "Delete" button
3. System shows confirmation with department name
4. User confirms deletion
5. System removes department and redirects to list

#### Alternative Flow - Cancel
3a. User cancels the confirmation
3b. Department is not deleted
3c. User returns to previous state

#### Postconditions
- Department removed from system
- Associated assignments cleared

---

### UC-DEPT-007: Assign Users

**Use Case ID**: UC-DEPT-007
**Use Case Name**: Assign Users to Department
**Actor**: Finance Manager, HR Manager
**Priority**: High
**Status**: Implemented

#### Description
User assigns or removes staff members from a department using dual-pane picker.

#### Preconditions
1. Department exists or is being created
2. User is on edit form

#### Main Flow
1. User clicks "Users" tab in Assignments section
2. System displays dual-pane picker:
   - Left pane: "Assigned Users" (currently in department)
   - Right pane: "Available Users" (not in department)
3. User searches for users in either pane
4. User selects users via checkboxes
5. User clicks arrow button to move users between panes
6. System updates assignment state

#### Alternative Flow - Select All
4a. User clicks "Select All" checkbox
4b. All visible users in that pane are selected

#### Postconditions
- User assignments updated when form is saved
- Users show role and current department info

---

### UC-DEPT-008: Assign Locations

**Use Case ID**: UC-DEPT-008
**Use Case Name**: Assign Locations to Department
**Actor**: Finance Manager
**Priority**: High
**Status**: Implemented

#### Description
User assigns or removes physical locations from a department.

#### Preconditions
1. Department exists or is being created
2. User is on edit form

#### Main Flow
1. User clicks "Locations" tab in Assignments section
2. System displays dual-pane picker:
   - Left pane: "Assigned Locations" (currently linked)
   - Right pane: "Available Locations" (not linked)
3. User searches for locations in either pane
4. User selects locations via checkboxes
5. User clicks arrow button to move locations
6. System updates assignment state

#### Postconditions
- Location assignments updated when form is saved
- Locations show type badge (hotel, restaurant, warehouse, etc.)

---

### UC-DEPT-009: Assign Department Heads

**Use Case ID**: UC-DEPT-009
**Use Case Name**: Assign Department Heads
**Actor**: Finance Manager
**Priority**: High
**Status**: Implemented

#### Description
User selects one or more users as department heads.

#### Preconditions
1. Department exists or is being created
2. User is on edit form

#### Main Flow
1. User views Management section
2. System displays "Department Heads" label
3. System shows checkbox list of eligible managers
4. User checks/unchecks users to assign as heads
5. Multiple heads can be selected

#### Postconditions
- Selected users become department heads
- Eligible managers filtered by role (manager, director, head, chef)

---

## User Journey Diagram

```
                Department Management User Journey
                ===================================

    [Navigate to Module]
           |
           v
    +------------------+
    | View Department  |<----------------------------------+
    | List             |                                   |
    +------------------+                                   |
           |                                               |
           +---> [Search] ---> Filter Results ---+        |
           |                                      |        |
           +---> [New Department] -+              |        |
           |                       |              |        |
           |                       v              |        |
           |               +---------------+      |        |
           |               | Edit Form     |      |        |
           |               | - Basic Info  |      |        |
           |               | - Management  |      |        |
           |               | - Assignments |      |        |
           |               +---------------+      |        |
           |                       |              |        |
           |               [Save] / [Cancel]      |        |
           |                       |              |        |
           |                       +-------------+        |
           |                                               |
           +---> [View] ---> Department Detail ----+       |
           |                       |               |       |
           |               [Edit] ---> Edit Form --+       |
           |                       |                       |
           |               [Delete] --> Confirm ----+------+
           |                                        |
           +---> [Delete] --> Confirm --------------+
```

---

## Interaction Summary

### List Page Actions

| Element | Action | Result |
|---------|--------|--------|
| New Department button | Click | Navigate to create form |
| Search input | Type | Filter department list |
| View button (eye) | Click | Navigate to detail page |
| Edit button (pencil) | Click | Navigate to edit form |
| Delete button (trash) | Click | Show confirmation dialog |

### Detail Page Actions

| Element | Action | Result |
|---------|--------|--------|
| Back button | Click | Return to list |
| Edit button | Click | Navigate to edit form |
| Delete button | Click | Show confirmation dialog |
| Users tab | Click | Show assigned users |
| Locations tab | Click | Show assigned locations |

### Edit Form Actions

| Element | Action | Result |
|---------|--------|--------|
| Cancel button | Click | Return to previous page |
| Save Department | Click | Validate and save |
| Users tab | Click | Show user assignment picker |
| Locations tab | Click | Show location assignment picker |
| Arrow buttons | Click | Move items between panes |
| Manager checkbox | Toggle | Add/remove as department head |

---

**Document End**
