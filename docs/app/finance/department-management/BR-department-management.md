# Business Rules: Department Management

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

The Department Management module provides organizational structure management for hospitality operations. It enables administrators to create and manage departments, assign department heads, assign users to departments, and link departments to physical locations.

**Current Implementation**: Full CRUD operations with user/location assignment interfaces using React local state.

**Related Documents**:
- [Use Cases](./UC-department-management.md)
- [Data Dictionary](./DD-department-management.md)
- [Technical Specification](./TS-department-management.md)
- [Flow Diagrams](./FD-department-management.md)
- [Validations](./VAL-department-management.md)

---

## Business Context

### Module Purpose

The Department Management module establishes the organizational hierarchy for hospitality operations:

1. **Department Master Data**: Create and maintain departments (Kitchen, Housekeeping, F&B, etc.)
2. **Department Heads**: Assign managers/directors as department heads
3. **User Assignment**: Assign staff members to departments
4. **Location Assignment**: Link departments to physical locations (kitchens, stores, restaurants)
5. **Cost Center Tracking**: Associate cost centers with departments

### Current Features

| Feature | Status | Description |
|---------|--------|-------------|
| Department List | Implemented | View all departments in table format with search |
| Department Detail | Implemented | View department info, heads, users, and locations |
| Create Department | Implemented | Add new department with form validation |
| Edit Department | Implemented | Modify department details and assignments |
| Delete Department | Implemented | Remove department with confirmation |
| User Assignment | Implemented | Dual-pane picker to assign users |
| Location Assignment | Implemented | Dual-pane picker to assign locations |
| Search | Implemented | Filter by code, name, or description |

---

## Functional Requirements

### FR-DEPT-001: Department List Display

**Priority**: High
**User Story**: As a Finance Manager, I want to view all departments in a searchable table so that I can quickly find and manage organizational units.

**Requirements**:
- Table displays: Code, Name, Description, Head of Department, Status
- Search filters by code, name, or description
- Action buttons: View, Edit, Delete per row
- "New Department" button to create

**Acceptance Criteria**:
- Table loads with all departments from mock data
- Search filters in real-time as user types
- Empty state shown when no results match search

---

### FR-DEPT-002: Department Detail View

**Priority**: High
**User Story**: As a Department Manager, I want to view complete department information including assigned staff and locations so that I understand my team structure.

**Requirements**:
- Display basic info: Name, Code, Description, Status, Cost Center
- Show department heads with names and emails
- Tabs for Users and Locations with counts
- Edit and Delete action buttons

**Acceptance Criteria**:
- Detail page loads for valid department ID
- "Not Found" message for invalid department ID
- Users tab shows all assigned users with avatars
- Locations tab shows all assigned locations with type badges

---

### FR-DEPT-003: Create New Department

**Priority**: High
**User Story**: As a Finance Manager, I want to create new departments with user and location assignments so that I can establish the organizational structure.

**Requirements**:
- Form fields: Name (required), Code (required), Description, Cost Center
- Department heads selection (checkbox list of eligible managers)
- Status toggle (active/inactive)
- User assignment tab (dual-pane picker)
- Location assignment tab (dual-pane picker)

**Acceptance Criteria**:
- Form validates required fields before submission
- Code field auto-limited to 10 characters
- Save creates department and redirects to list

---

### FR-DEPT-004: Edit Department

**Priority**: High
**User Story**: As a Finance Manager, I want to edit department information and reassign users/locations so that I can keep the organizational structure current.

**Requirements**:
- Pre-populate form with existing department data
- Code field disabled for existing departments
- All other fields editable
- User and location assignments editable

**Acceptance Criteria**:
- Edit page loads with current values
- Code cannot be changed for existing departments
- Save updates department and redirects to detail page

---

### FR-DEPT-005: Delete Department

**Priority**: Medium
**User Story**: As a Finance Manager, I want to delete obsolete departments so that the department list remains accurate.

**Requirements**:
- Confirmation dialog before deletion
- Delete from list page or detail page

**Acceptance Criteria**:
- Confirmation shows department name
- Cancel returns without deleting
- Confirm removes department and redirects to list

---

### FR-DEPT-006: User Assignment

**Priority**: High
**User Story**: As a Department Manager, I want to assign and remove staff members from my department so that I can manage my team membership.

**Requirements**:
- Dual-pane picker: Assigned Users (left) | Available Users (right)
- Search in both panes
- Select All checkbox in each pane
- Arrow buttons to move users between panes
- Shows user name, role, current department(s)

**Acceptance Criteria**:
- Available users excludes already assigned
- Multiple users can be selected and moved at once
- Search filters by name or email
- User details show role and existing departments

---

### FR-DEPT-007: Location Assignment

**Priority**: High
**User Story**: As a Finance Manager, I want to assign locations to departments so that physical spaces are linked to organizational units for cost tracking.

**Requirements**:
- Dual-pane picker: Assigned Locations (left) | Available Locations (right)
- Search in both panes
- Select All checkbox in each pane
- Arrow buttons to move locations between panes
- Shows location name and type badge

**Acceptance Criteria**:
- Available locations excludes already assigned
- Location type shown as badge (hotel, restaurant, warehouse, etc.)
- Multiple locations can be selected and moved at once

---

### FR-DEPT-008: Department Head Selection

**Priority**: High
**User Story**: As a Finance Manager, I want to assign one or more department heads so that leadership responsibility is clearly defined.

**Requirements**:
- Checkbox list of eligible managers
- Eligible users have roles containing: manager, director, head, chef
- Multiple heads can be selected

**Acceptance Criteria**:
- Only users with management roles appear in list
- Current heads pre-selected when editing
- User name and email shown for each option

---

## Data Model

### Department Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| code | string | Yes | Department code (max 10 chars) |
| name | string | Yes | Department name (max 100 chars) |
| description | string | No | Department description |
| status | enum | Yes | 'active' or 'inactive' |
| parentDepartment | string | No | Parent department ID |
| costCenter | string | No | Cost center code |
| managers | string[] | No | User IDs of department heads |
| assignedUsers | string[] | No | User IDs assigned to department |
| assignedLocations | string[] | No | Location IDs assigned to department |

### Sample Departments

| Code | Name | Description |
|------|------|-------------|
| KITCHEN | Kitchen Operations | Main kitchen production |
| FB | Food & Beverage | F&B service operations |
| HOUSEKP | Housekeeping | Room cleaning and maintenance |
| FRONT | Front Office | Reception and guest services |
| PURCH | Purchasing | Procurement department |

---

## Business Rules

### BR-DEPT-001: Department Code Uniqueness

**Rule**: Department codes should be unique across the organization.

**Implementation**: Current implementation adds to array; server-side uniqueness validation planned.

---

### BR-DEPT-002: Code Immutability

**Rule**: Department code cannot be changed after creation.

**Implementation**: Code field is disabled when editing existing department.

---

### BR-DEPT-003: Delete Confirmation

**Rule**: Department deletion requires user confirmation.

**Implementation**: Browser confirm dialog before deletion.

---

### BR-DEPT-004: Manager Eligibility

**Rule**: Only users with management roles can be department heads.

**Implementation**: Filters users by role name containing: manager, director, head, chef.

---

## User Interface Summary

### List Page

```
+----------------------------------------------------------------+
| Department List                              [New Department]   |
+----------------------------------------------------------------+
| Manage organizational departments and user assignments          |
+----------------------------------------------------------------+
| [Search departments by name, code, or description...]           |
+----------------------------------------------------------------+
| Code    | Name           | Description      | Head   | Status | |
+---------+----------------+------------------+--------+--------+-+
| KITCHEN | Kitchen Ops    | Main kitchen...  | J.Doe  | Active |[>][E][D]
| FB      | Food & Beverage| F&B service...   | M.Smith| Active |[>][E][D]
+----------------------------------------------------------------+
| Showing 5 of 5 departments                                      |
+----------------------------------------------------------------+
```

### Detail Page

```
+----------------------------------------------------------------+
| [Back] Kitchen Operations                                       |
|        [KITCHEN] [Active]                    [Edit] [Delete]    |
+----------------------------------------------------------------+
| Basic Information                                               |
| Name: Kitchen Operations    Code: KITCHEN                       |
| Description: Main kitchen production area                       |
+----------------------------------------------------------------+
| Management                                                      |
| Department Heads (1): John Doe (john@example.com)              |
| Cost Center: CC-001                                             |
+----------------------------------------------------------------+
| [Users (5)]  [Locations (2)]                                    |
|   +------------------+  +------------------+                     |
|   | JD John Doe      |  | [icon] Main Kitchen |                 |
|   | JS Jane Smith    |  | [icon] Prep Area    |                 |
|   +------------------+  +------------------+                     |
+----------------------------------------------------------------+
```

### Edit Form

```
+----------------------------------------------------------------+
| [Back] Edit Kitchen Operations                                  |
|        Update department information and user assignments       |
+----------------------------------------------------------------+
| Basic Information                               [Cancel] [Save] |
| Name: [Kitchen Operations_____]                                 |
| Code: [KITCHEN_____] (disabled)                                 |
| Description: [Main kitchen production area___]                  |
+----------------------------------------------------------------+
| Management                                                      |
| Department Heads:                                               |
| [x] John Doe (john@example.com)                                |
| [ ] Mary Director (mary@example.com)                           |
| Cost Center: [CC-001______]    [x] Active                      |
+----------------------------------------------------------------+
| Assignments                                                     |
| [Users (5)]  [Locations (2)]                                    |
| [Dual-pane picker interface]                                    |
+----------------------------------------------------------------+
```

---

## Security and Access

### Role-Based Access

| Role | View | Create | Edit | Delete |
|------|------|--------|------|--------|
| System Administrator | Yes | Yes | Yes | Yes |
| Finance Manager | Yes | Yes | Yes | Yes |
| HR Manager | Yes | Yes | Yes | - |
| Department Manager | Own | - | Own | - |
| Staff | - | - | - | - |

**Note**: Role-based access control to be fully implemented in future phase.

---

## Integration Points

### Current Integrations

| Integration | Type | Description |
|-------------|------|-------------|
| Mock Users | Reference | User data for assignments |
| Mock Locations | Reference | Location data for assignments |

### Planned Integrations

| Module | Integration Type | Purpose |
|--------|-----------------|---------|
| User Management | Bidirectional | Sync user-department assignments |
| Location Management | Bidirectional | Sync location-department assignments |
| Account Code Mapping | Reference | Default GL accounts per department |
| Purchase Requests | Reference | Department-based approval workflows |

---

**Document End**
