# Permission Management - Use Cases (UC)

**Module**: System Administration - Permission Management
**Version**: 1.0
**Last Updated**: 2026-01-16
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Document Status**: Active

---

## Overview

This document defines use cases for the Permission Management module, focusing on current RBAC (Role-Based Access Control) implementation with notes on planned ABAC enhancements.

**Implementation Status**:
- ✅ Role management workflows (UC-PM-001 to UC-PM-008)
- 🔄 Policy management workflows (Planned - UC-PM-009 to UC-PM-010)

---

## Use Case Index

| ID | Use Case Name | Priority | Status |
|----|---------------|----------|--------|
| UC-PM-001 | Create New Role | High | Implemented |
| UC-PM-002 | Edit Existing Role | High | Implemented |
| UC-PM-003 | View Role Details | Medium | Implemented |
| UC-PM-004 | Delete Role | Medium | Implemented |
| UC-PM-005 | Search and Filter Roles | Medium | Implemented |
| UC-PM-006 | Assign Users to Role | High | Implemented |
| UC-PM-007 | Duplicate Role | Low | Implemented |
| UC-PM-008 | View Role Hierarchy | Medium | Implemented |
| UC-PM-009 | Create Policy (ABAC) | High | Planned |
| UC-PM-010 | Test Policy | Medium | Planned |

---

## UC-PM-001: Create New Role

### Basic Information
- **Actor**: System Administrator, General Manager
- **Goal**: Create a new role with specific permissions
- **Preconditions**:
  - User is authenticated with role creation permission
  - User has access to Permission Management module
- **Postconditions**:
  - New role is created and available for assignment
  - Role appears in role list
  - Audit log entry is created

### Main Flow
1. User navigates to Permission Management > Roles
2. System displays role list page
3. User clicks "Create Role" button
4. System displays role creation form with tabs:
   - **General**: Name, description, hierarchy
   - **Permissions**: Permission assignment interface
   - **Parent Roles**: Role inheritance configuration
5. User enters role information:
   - Role Name: "Restaurant Manager" (required)
   - Description: "Manages restaurant operations" (optional)
   - Hierarchy Level: Auto-calculated based on parent
6. User selects parent role (optional):
   - Searches for "Department Manager"
   - Selects parent role from dropdown
   - System displays parent's permissions for reference
7. User assigns permissions:
   - Uses permission search to find relevant permissions
   - Selects permissions from categorized list:
     - Procurement: purchase_request:create, purchase_request:approve_department
     - Inventory: inventory_item:view_stock, stock_count:view
     - Reporting: department_report:view
   - System shows inherited permissions from parent (read-only)
   - Total permissions: Direct (5) + Inherited (12) = 17
8. User reviews role summary:
   - Role name, hierarchy level, parent roles
   - Direct permissions count
   - Inherited permissions count
   - Effective permissions preview
9. User clicks "Create Role" button
10. System validates input:
    - Role name is unique
    - Permission format is valid
    - No circular inheritance
11. System creates role in data store
12. System logs role creation in audit trail
13. System displays success message: "Role 'Restaurant Manager' created successfully"
14. System returns to role list with new role highlighted

### Alternative Flows

**AF-001: Role Name Already Exists**
- At step 10, if role name exists:
  - System displays error: "A role with this name already exists"
  - System highlights name field
  - User modifies role name
  - Flow continues from step 10

**AF-002: Invalid Permission Format**
- At step 10, if permission format is invalid:
  - System displays error: "Invalid permission format. Use resource:action"
  - System highlights invalid permission
  - User corrects permission
  - Flow continues from step 10

**AF-003: Circular Inheritance Detected**
- At step 10, if circular inheritance detected:
  - System displays error: "Circular inheritance detected. Role A cannot inherit from Role B if Role B inherits from Role A"
  - User removes problematic parent role
  - Flow continues from step 6

**AF-004: User Cancels Creation**
- At any step before step 10:
  - User clicks "Cancel" button
  - System prompts: "Discard changes?"
  - If confirmed, system returns to role list without creating role
  - If cancelled, user continues editing

### Exception Flows

**EF-001: Validation Error**
- If multiple validation errors occur:
  - System displays all errors in a list
  - System highlights all invalid fields
  - User corrects all errors
  - Flow continues from step 10

**EF-002: System Error**
- If system error occurs during creation:
  - System displays error: "Unable to create role. Please try again."
  - System logs error details
  - User can retry or cancel

### Business Rules
- **BR-PM-001**: Role name must be unique (case-insensitive)
- **BR-PM-002**: Role name must be 3-100 characters
- **BR-PM-003**: Permission format must be "resource:action"
- **BR-PM-004**: Circular inheritance is not allowed
- **BR-PM-007**: Child roles inherit all parent permissions

### Data Requirements
- Role name (required, 3-100 chars, unique)
- Description (optional, max 500 chars)
- Permissions (array of strings in "resource:action" format)
- Parent roles (optional, array of role IDs)
- Hierarchy level (auto-calculated)

### UI Requirements
- Clean, intuitive form layout
- Permission search with auto-complete
- Visual indication of inherited vs. direct permissions
- Real-time validation feedback
- Hierarchy level auto-calculation display

---

## UC-PM-002: Edit Existing Role

### Basic Information
- **Actor**: System Administrator, General Manager
- **Goal**: Modify an existing role's properties or permissions
- **Preconditions**:
  - User is authenticated with role edit permission
  - Role exists and is not being edited by another user
  - System roles can be edited with warning
- **Postconditions**:
  - Role is updated with new information
  - Users with this role have updated effective permissions
  - Audit log entry is created

### Main Flow
1. User navigates to role detail page or clicks "Edit" from role list
2. System displays role edit form pre-populated with current values:
   - General tab: name, description, hierarchy
   - Permissions tab: direct and inherited permissions
   - Parent Roles tab: current parent relationships
3. User modifies role information:
   - Updates description
   - Adds new permissions
   - Removes existing permissions (if not inherited)
   - Changes parent roles
4. System updates effective permissions preview in real-time
5. System warns if changes affect assigned users:
   - "This role is assigned to 15 users. Changes will affect their access."
   - Shows count of users who will gain/lose specific permissions
6. User reviews changes summary:
   - Added permissions: 3
   - Removed permissions: 1
   - Affected users: 15
7. User clicks "Save Changes" button
8. System validates changes (same as creation validation)
9. System updates role in data store
10. System updates effective permissions for all assigned users
11. System logs role modification in audit trail
12. System displays success message: "Role updated successfully"
13. System returns to role detail view

### Alternative Flows

**AF-001: Editing System Role**
- At step 2, if role is system-defined:
  - System displays warning banner: "This is a system role. Modifications may affect core functionality."
  - User can continue or cancel
  - Name field is disabled
  - Permission modifications require confirmation

**AF-002: Cannot Remove Inherited Permission**
- At step 3, if user tries to remove inherited permission:
  - System displays message: "This permission is inherited from parent role. Remove parent role to exclude this permission."
  - Permission remains selected

**AF-003: User Count Warning**
- At step 5, if role has many assigned users (>50):
  - System displays prominent warning: "This role is assigned to 127 users. Verify changes carefully."
  - User must confirm understanding before proceeding

### Business Rules
- **BR-PM-003**: System roles cannot have name changed
- **BR-PM-007**: Inherited permissions cannot be removed directly

---

## UC-PM-003: View Role Details

### Basic Information
- **Actor**: All authenticated users
- **Goal**: View comprehensive information about a role
- **Preconditions**: User is authenticated
- **Postconditions**: User has viewed role information

### Main Flow
1. User clicks role name from role list
2. System displays role detail page with tabs:
   - **Overview**: Basic information (name, description, hierarchy, type)
   - **Permissions**: Direct and inherited permissions with visual distinction
   - **Users**: List of users assigned to this role
   - **Child Roles**: Roles that inherit from this role
   - **Audit**: Change history
3. User views Overview tab:
   - Role name with system role indicator (if applicable)
   - Description
   - Hierarchy level with visual hierarchy tree
   - Parent roles with links
   - Created by and date
   - Last modified by and date
   - User count badge
4. User switches to Permissions tab:
   - Direct permissions (highlighted in blue)
   - Inherited permissions (greyed out with parent role indicator)
   - Permission count summary
   - Search and filter capabilities
5. User switches to Users tab:
   - Table of assigned users with columns: Name, Department, Location, Assigned Date
   - Filters: Department, Location, Status
   - Export capability
6. User switches to Child Roles tab:
   - List of roles that inherit from this role
   - For each child: name, hierarchy level, user count
   - Inheritance path visualization
7. User switches to Audit tab:
   - Timeline of changes with filters
   - Change details: what changed, who changed it, when
   - Rollback capability (admin only)

### UI Requirements
- Tabbed interface for organized information
- Visual hierarchy tree showing role relationships
- Color-coded permissions (direct vs. inherited)
- Responsive design for mobile viewing

---

## UC-PM-004: Delete Role

### Basic Information
- **Actor**: System Administrator
- **Goal**: Remove a role from the system
- **Preconditions**:
  - User is authenticated with delete permission
  - Role exists and is not a system role
  - Role has no assigned users
  - Role has no child roles
- **Postconditions**:
  - Role is permanently deleted
  - Audit log entry is created

### Main Flow
1. User navigates to role detail page
2. User clicks "Delete Role" button
3. System validates deletion constraints:
   - Role is not a system role
   - Role has no assigned users
   - Role has no child roles that inherit from it
4. System displays confirmation dialog:
   - "Delete role 'Restaurant Manager'?"
   - Warning: "This action cannot be undone"
   - Checkbox: "I understand this role will be permanently deleted"
5. User checks confirmation checkbox
6. User clicks "Delete" button
7. System deletes role from data store
8. System logs deletion in audit trail
9. System displays success message: "Role 'Restaurant Manager' deleted successfully"
10. System redirects to role list

### Alternative Flows

**AF-001: Role Has Assigned Users**
- At step 3, if role has assigned users:
  - System displays error: "Cannot delete role with assigned users (15 users). Please reassign users first."
  - System shows "View Users" button
  - User can click to see assigned users
  - User must reassign users before deletion

**AF-002: Role Has Child Roles**
- At step 3, if role has child roles:
  - System displays error: "Cannot delete role with child roles (3 roles). Please reassign child role parents first."
  - System lists child roles
  - User must update child roles before deletion

**AF-003: Attempting to Delete System Role**
- At step 3, if role is system-defined:
  - System displays error: "System roles cannot be deleted"
  - Delete button is disabled

---

## UC-PM-005: Search and Filter Roles

### Basic Information
- **Actor**: All authenticated users
- **Goal**: Find specific roles using search and filters
- **Preconditions**: User is authenticated
- **Postconditions**: Filtered role list is displayed

### Main Flow
1. User navigates to role list page
2. System displays all roles with search and filter controls
3. User enters search term in search box: "manager"
4. System filters roles in real-time:
   - Matches on role name
   - Matches on description
   - Results: 8 roles found
5. User applies filters:
   - Hierarchy Level: 4-5
   - Role Type: Custom roles only
   - Results: 5 roles found
6. User applies sorting: "User Count (High to Low)"
7. System displays filtered and sorted results
8. User can export results or clear filters

### Filter Options
- **Hierarchy Level**: Single or range (1-10)
- **Role Type**: All / System / Custom
- **Has Users**: Yes / No / All
- **Has Permissions**: Specific permission lookup
- **Parent Role**: Filter by parent role

---

## UC-PM-006: Assign Users to Role

### Basic Information
- **Actor**: System Administrator, General Manager
- **Goal**: Assign one or more users to a role
- **Preconditions**:
  - User is authenticated with assignment permission
  - Role exists
  - Users exist in the system
- **Postconditions**:
  - Users are assigned to role
  - Users gain role's effective permissions
  - Audit log entries are created

### Main Flow
1. User navigates to role detail page
2. User switches to "Users" tab
3. User clicks "Assign Users" button
4. System displays user selection dialog:
   - Search box for finding users
   - Filter by department, location, current roles
   - Multi-select user list
   - Selected users panel
5. User searches for "John Smith"
6. System displays matching users with current roles
7. User selects users (supports multi-select):
   - John Smith (Department Manager)
   - Jane Doe (Currently no roles)
8. User optionally sets context:
   - Department: "Kitchen" (restricts role to this department)
   - Location: "Main Restaurant" (restricts role to this location)
   - Effective From: Today
   - Effective To: (optional) One year from today
9. User reviews selection:
   - 2 users selected
   - Kitchen department context
   - Main Restaurant location context
10. User clicks "Assign" button
11. System validates:
    - Users exist and are active
    - No conflicting role assignments
12. System creates user-role assignments
13. System updates users' effective permissions
14. System logs assignments in audit trail
15. System displays success: "2 users assigned to role successfully"
16. System refreshes Users tab showing new assignments

### Alternative Flows

**AF-001: User Already Has Role**
- At step 11, if user already has this role:
  - System displays warning: "John Smith already has this role"
  - User can choose to:
    - Skip this user and continue with others
    - Update assignment context
    - Cancel entire operation

---

## UC-PM-007: Duplicate Role

### Basic Information
- **Actor**: System Administrator, General Manager
- **Goal**: Create a new role based on an existing role
- **Preconditions**:
  - User is authenticated with create permission
  - Source role exists
- **Postconditions**:
  - New role is created with copied permissions
  - New role has unique name
  - Audit log entry is created

### Main Flow
1. User navigates to role detail page
2. User clicks "Duplicate" button
3. System creates draft role with:
   - Name: "Copy of [Original Role Name]"
   - Description: Copied from original
   - Permissions: All permissions copied
   - Hierarchy: Same as original
   - Parent Roles: NOT copied
   - User Assignments: NOT copied
4. System displays role creation form pre-populated with copied data
5. User modifies role as needed:
   - Changes name to "Senior Restaurant Manager"
   - Adds additional permissions
   - Selects different parent role
6. User clicks "Create Role" button
7. System validates and creates role (same as UC-PM-001)
8. System logs role creation in audit trail
9. System displays success message
10. System redirects to new role detail page

---

## UC-PM-008: View Role Hierarchy

### Basic Information
- **Actor**: All authenticated users
- **Goal**: Visualize role hierarchy and inheritance relationships
- **Preconditions**: User is authenticated
- **Postconditions**: Hierarchy visualization is displayed

### Main Flow
1. User navigates to Permission Management > Roles
2. User clicks "View Hierarchy" button
3. System displays interactive hierarchy tree:
   - Level 1: System Administrator (root)
   - Level 2: General Manager (inherits from System Admin)
   - Level 3: Department Directors (inherit from General Manager)
   - Level 4: Department Managers, Procurement Manager, etc.
   - Level 5: Operational staff roles
   - Level 6: Support staff roles
4. User can interact with hierarchy:
   - Expand/collapse role nodes
   - Click role to view details
   - Hover to see quick info (permission count, user count)
5. System highlights inheritance paths on hover
6. User can filter hierarchy:
   - Show only roles with assigned users
   - Show only custom roles
   - Search for specific role
7. User can export hierarchy as:
   - PDF diagram
   - CSV data
   - Image file

### UI Requirements
- Interactive tree visualization
- Color coding by hierarchy level
- Visual connection lines showing inheritance
- Responsive zoom and pan
- Quick info tooltips

---

## UC-PM-009: Create Policy (ABAC) - Planned

### Basic Information
- **Actor**: System Administrator
- **Goal**: Create attribute-based access control policy
- **Status**: Planned for Q2 2025
- **Preconditions**:
  - User is authenticated with policy creation permission
  - ABAC engine is implemented
- **Postconditions**:
  - New policy is created and active
  - Policy is evaluated for access decisions

### Planned Flow
1. User navigates to Permission Management > Policies
2. User clicks "Create Policy" button
3. System displays policy builder with visual interface:
   - **Policy Target**: Define when policy applies
   - **Rules**: Define conditions using expressions
   - **Effect**: Permit or Deny
   - **Obligations**: Actions required on access
4. User defines policy target:
   - Subject: role = "Purchasing Staff"
   - Resource: resourceType = "purchase_request"
   - Action: "approve"
   - Environment: isBusinessHours = true
5. User adds rule with conditions:
   - Subject.department = Resource.ownerDepartment
   - Resource.totalValue < Subject.approvalLimit
   - Resource.documentStatus = "Pending"
6. User sets effect: "Permit"
7. User adds obligations:
   - Log approval action
   - Send notification to requester
8. User tests policy with sample scenarios
9. User activates policy
10. System begins evaluating policy for access decisions

---

## UC-PM-010: Test Policy - Planned

### Basic Information
- **Actor**: System Administrator
- **Goal**: Test policy with sample scenarios before activation
- **Status**: Planned for Q2 2025
- **Preconditions**:
  - User is authenticated
  - Policy exists (active or draft)
  - ABAC engine is implemented
- **Postconditions**:
  - Test results are displayed
  - Policy is validated or issues are identified

### Planned Flow
1. User navigates to policy detail page
2. User clicks "Test Policy" button
3. System displays policy testing interface
4. User defines test scenario:
   - Subject attributes (user, role, department, approval limit)
   - Resource attributes (document type, value, status, owner)
   - Action to test
   - Environment attributes (time, location, system state)
5. User runs test
6. System evaluates policy against scenario
7. System displays result:
   - Decision: Permit or Deny
   - Reason: Which rules matched
   - Obligations triggered
   - Evaluation time
8. User can save test scenarios for regression testing
9. User can run batch tests against multiple scenarios

---

## Appendices

### Appendix A: Role Permission Categories

**Procurement**:
- purchase_request:create, view, approve_department, approve_finance
- purchase_order:create, view, approve, cancel
- vendor:create, view, update, approve
- vendor_quotation:view, create, compare

**Inventory**:
- inventory_item:view, create, update, view_stock
- stock_adjustment:create, approve
- stock_count:create, approve, view
- goods_receipt_note:create, approve

**Financial**:
- invoice:create, approve, pay
- payment:create, approve
- budget:view, create, approve
- journal_entry:create, approve

**System Administration**:
- user:create, update, delete, assign_role
- role:create, update, delete
- workflow:create, configure, activate
- settings:view, edit

### Appendix B: Hierarchy Level Guidelines

| Level | Typical Roles | Permission Scope |
|-------|---------------|------------------|
| 1 | System Administrator | All permissions (*) |
| 2 | General Manager | Full business operations |
| 3 | Directors (Finance, Operations) | Departmental + cross-functional |
| 4 | Department Managers | Departmental authority |
| 5 | Operational Staff | Execution permissions |
| 6 | Support Staff | Limited operational access |

---

**Document Control**:
- **Created**: 2026-01-16
- **Last Modified**: 2026-01-16
- **Version**: 1.0
- **Status**: Active
- **Review Cycle**: Quarterly
