# Use Cases: User Management

## Document Information
- **Module**: System Administration / User Management
- **Version**: 1.0
- **Last Updated**: 2026-01-16
- **Status**: Active

## Use Case Index

| Use Case ID | Use Case Name | Priority | Status |
|------------|---------------|----------|---------|
| UC-USR-001 | Create New User | High | Active |
| UC-USR-002 | View User Details | High | Active |
| UC-USR-003 | Edit User Profile | High | Active |
| UC-USR-004 | Delete User | Medium | Active |
| UC-USR-005 | Assign User to Department | High | Active |
| UC-USR-006 | Assign User to Location | Medium | Active |
| UC-USR-007 | Assign Roles to User | Critical | Active |
| UC-USR-008 | Set Approval Limit | High | Active |
| UC-USR-009 | Bulk Role Assignment | Medium | Active |
| UC-USR-010 | Bulk Status Change | Medium | Active |
| UC-USR-011 | Export Users to CSV | Low | Active |
| UC-USR-012 | Import Users from CSV | Low | Planned |
| UC-USR-013 | Invite User | Medium | Planned |
| UC-USR-014 | Search and Filter Users | Medium | Active |
| UC-USR-015 | Set Special Permissions | Medium | Active |

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## UC-USR-001: Create New User

### Actor
System Administrator

### Preconditions
- Actor has user:create permission
- Actor is authenticated and authorized
- Valid department and location data exists

### Main Flow
1. System Administrator clicks "New User" button
2. System displays user creation form with tabs:
   - Basic Information (firstname, lastname, email, bio)
   - Department & Location assignment
   - Role assignment
   - Approval & Access configuration
3. Administrator fills Basic Information tab with required fields
4. Administrator selects department(s) and optionally marks as HOD
5. Administrator selects location(s)
6. Administrator assigns role(s) and designates primary role
7. Administrator sets approval limit (amount and currency)
8. Administrator sets clearance level
9. Administrator optionally configures:
   - Effective date range
   - Special permissions
   - Delegated authorities
10. System validates all inputs
11. System creates user record in `tb_user_profile`
12. System creates department assignments in `tb_department_user`
13. System creates location assignments in `tb_user_location`
14. System generates unique user_id (UUID)
15. System sets account_status to 'pending' or 'active'
16. System logs creation in audit trail
17. System displays success confirmation with user ID

### Alternative Flows

#### AF1: Email Already Exists
- At step 10, system detects duplicate email
- System displays error: "Email already registered"
- Returns to step 3 for correction

#### AF2: Invalid Department Selection
- At step 10, system detects inactive department
- System displays error: "Selected department is inactive"
- Returns to step 4 for correction

#### AF3: Missing Required Fields
- At step 10, system detects missing required fields
- System highlights missing fields with error messages
- Returns to step 3 for completion

### Postconditions
- New user record exists in `tb_user_profile`
- User-department relationships created in `tb_department_user`
- User-location relationships created in `tb_user_location`
- User can authenticate if account_status is 'active'
- Audit log records user creation with creator ID and timestamp

---

## UC-USR-002: View User Details

### Actor
System Administrator, Department Manager

### Preconditions
- Actor has user:view permission
- User record exists

### Main Flow
1. Actor navigates to User Management page
2. System displays user list (table or card view)
3. Actor clicks on user row or card
4. System retrieves user data from `tb_user_profile`
5. System retrieves department assignments from `tb_department_user`
6. System retrieves location assignments from `tb_user_location`
7. System displays user detail view with sections:
   - Profile Information (name, email, bio)
   - Account Status (active/inactive/suspended/pending)
   - Department Assignments (with HOD flags)
   - Location Assignments
   - Roles & Permissions (primary role, all roles, effective permissions)
   - Approval Configuration (limit, currency, clearance level)
   - Special Permissions & Delegated Authorities
   - Audit Information (created date, last modified, last login)
8. System displays mode=view URL parameter in browser

### Alternative Flows

#### AF1: User Not Found
- At step 4, system cannot find user_id
- System displays error: "User not found"
- Returns to user list

#### AF2: Insufficient Permissions
- At step 1, actor lacks user:view permission
- System displays error: "Access denied"
- Redirects to dashboard

### Postconditions
- User details displayed without modifications
- View action logged in activity log

---

## UC-USR-003: Edit User Profile

### Actor
System Administrator

### Preconditions
- Actor has user:update permission
- User record exists
- User is not deleted

### Main Flow
1. Actor views user details (UC-USR-002)
2. Actor clicks "Edit" button
3. System displays user edit form pre-populated with current values
4. System sets mode=edit URL parameter
5. Actor modifies desired fields:
   - Basic information (firstname, lastname, bio)
   - Email (if allowed)
   - Department assignments
   - Location assignments
   - Role assignments
   - Approval limit and clearance level
   - Effective date range
   - Special permissions
6. System validates changes in real-time
7. Actor clicks "Save Changes"
8. System re-validates all modified fields
9. System updates `tb_user_profile` with new values
10. System updates `tb_department_user` if departments changed
11. System updates `tb_user_location` if locations changed
12. System sets updated_at and updated_by_id
13. System logs all changes in audit trail
14. System displays success message
15. System redirects to view mode

### Alternative Flows

#### AF1: Email Change Conflict
- At step 8, new email already exists
- System displays error: "Email already in use"
- Returns to step 5 for correction

#### AF2: Validation Failure
- At step 8, validation fails
- System displays specific validation errors
- Returns to step 5 for correction

#### AF3: Concurrent Modification
- At step 9, doc_version mismatch detected
- System displays error: "User data was modified by another user"
- System offers to reload or force update
- Returns to step 3 with refreshed data

### Postconditions
- User record updated with new values
- updated_at and updated_by_id reflect change
- Audit log records detailed change history
- Related workflows notified of permission changes

---

## UC-USR-004: Delete User

### Actor
System Administrator

### Preconditions
- Actor has user:delete permission
- User record exists
- User has no active transactions or pending workflows

### Main Flow
1. Actor views user details or list
2. Actor clicks "Delete" action for user
3. System displays confirmation dialog: "Are you sure you want to delete [username]?"
4. Actor confirms deletion
5. System validates deletion constraints:
   - No active purchase requests
   - No pending approvals
   - No active workflows
6. System performs soft delete:
   - Sets deleted_at = current timestamp
   - Sets deleted_by_id = actor user_id
   - Keeps all data intact
7. System removes user from active user lists
8. System revokes all active sessions for deleted user
9. System logs deletion in audit trail
10. System displays success message
11. System removes user from current view

### Alternative Flows

#### AF1: User Has Active Transactions
- At step 5, system finds active transactions
- System displays error: "Cannot delete user with active transactions. Deactivate instead."
- Returns to step 1

#### AF2: Deletion Cancelled
- At step 4, actor clicks "Cancel"
- System closes confirmation dialog
- Returns to previous view
- No changes made

### Postconditions
- User record soft-deleted (deleted_at set)
- User cannot authenticate
- User excluded from all active user queries
- Audit trail preserved
- Historical data remains accessible

---

## UC-USR-005: Assign User to Department

### Actor
System Administrator, HR Manager

### Preconditions
- Actor has user:update permission
- User exists
- Valid departments exist

### Main Flow
1. Actor opens user edit form (UC-USR-003 steps 1-4)
2. Actor navigates to "Department & Location" tab
3. System displays current department assignments
4. Actor clicks "Add Department"
5. System displays department selection dialog
6. Actor selects department from dropdown
7. Actor checks "Head of Department (HOD)" if applicable
8. Actor clicks "Assign"
9. System validates department is active
10. System checks for unique constraint (user + department combination)
11. System creates record in `tb_department_user`:
    - user_id
    - department_id
    - is_hod (true/false)
    - created_at, created_by_id
12. System displays updated department list
13. System logs department assignment in audit trail

### Alternative Flows

#### AF1: Department Already Assigned
- At step 10, duplicate assignment detected
- System displays error: "User already assigned to this department"
- Returns to step 5

#### AF2: Inactive Department Selected
- At step 9, department is_active = false
- System displays error: "Cannot assign to inactive department"
- Returns to step 6

#### AF3: Remove Department Assignment
- At step 3, actor clicks "Remove" on existing department
- System displays confirmation: "Remove user from [Department Name]?"
- Actor confirms
- System soft-deletes record from `tb_department_user` (sets deleted_at)
- System updates display
- System logs removal in audit trail

### Postconditions
- User-department relationship created in `tb_department_user`
- User can access department-scoped resources
- HOD status grants automatic approval authority if applicable
- Audit log records assignment

---

## UC-USR-006: Assign User to Location

### Actor
System Administrator, Operations Manager

### Preconditions
- Actor has user:update permission
- User exists
- Valid locations exist

### Main Flow
1. Actor opens user edit form
2. Actor navigates to "Department & Location" tab
3. System displays current location assignments
4. Actor clicks "Add Location"
5. System displays location selection dialog with location types:
   - Inventory locations
   - Direct locations
   - Consignment locations
6. Actor selects location(s) from list
7. Actor clicks "Assign"
8. System validates locations are active
9. System creates records in `tb_user_location`:
    - user_id
    - location_id
    - created_at, created_by_id
10. System displays updated location list
11. System logs location assignments in audit trail

### Alternative Flows

#### AF1: Location Already Assigned
- At step 9, duplicate detected
- System displays warning: "Location already assigned"
- Skips duplicate, processes remaining

#### AF2: Remove Location Assignment
- At step 3, actor clicks "Remove" on existing location
- System displays confirmation
- Actor confirms
- System soft-deletes `tb_user_location` record
- System updates display

### Postconditions
- User-location relationships created in `tb_user_location`
- User can only access data from assigned locations
- Location-based filtering applied to all user queries
- Audit log records assignments

---

## UC-USR-007: Assign Roles to User

### Actor
System Administrator

### Preconditions
- Actor has user:assign_role permission
- User exists
- Valid roles exist in permission management system

### Main Flow
1. Actor opens user edit form
2. Actor navigates to "Roles & Permissions" tab
3. System displays current role assignments
4. System displays primary role indicator
5. Actor clicks "Add Role"
6. System displays role selection dialog with:
   - Role list
   - Role descriptions
   - Role permissions preview
7. Actor selects one or more roles
8. Actor designates one role as primary
9. Actor sets effective date range (optional)
10. Actor clicks "Assign"
11. System validates role assignments
12. System updates user roles in permission system
13. System sets clearance level from highest assigned role
14. System calculates effective permissions (union of all role permissions)
15. System displays updated roles and effective permissions
16. System logs role assignments in audit trail

### Alternative Flows

#### AF1: No Primary Role Designated
- At step 11, no primary role found
- System automatically designates first assigned role as primary
- Displays notification to user
- Continues flow

#### AF2: Role Conflict Detected
- At step 11, conflicting roles detected (e.g., auditor + finance manager)
- System displays warning: "Selected roles have conflicting permissions"
- Actor can override or cancel
- If override, system proceeds with note in audit log

#### AF3: Remove Role Assignment
- At step 3, actor clicks "Remove" on assigned role
- System validates it's not the only role
- System displays confirmation
- Actor confirms
- System removes role and recalculates effective permissions
- If primary role removed, system promotes next role to primary

### Postconditions
- User roles updated in permission system
- Effective permissions recalculated
- Primary role set
- User receives new permissions immediately
- Audit log records all changes

---

## UC-USR-008: Set Approval Limit

### Actor
Financial Controller, System Administrator

### Preconditions
- Actor has user:update permission or financial:configure permission
- User exists
- Valid currencies exist

### Main Flow
1. Actor opens user edit form
2. Actor navigates to "Approval & Access" tab
3. System displays current approval configuration:
   - Current approval limit (amount + currency)
   - Role-based default limit
   - Clearance level
4. Actor clicks "Edit Approval Limit"
5. System displays approval limit configuration form
6. Actor enters approval amount (numeric)
7. Actor selects currency from dropdown
8. System displays comparison with role default
9. Actor optionally provides justification for override
10. Actor clicks "Save"
11. System validates:
    - Amount is positive number
    - Currency is active
    - Amount doesn't exceed organizational limits
12. System updates approval configuration
13. System logs change with justification
14. System notifies workflow engine of limit change
15. System displays success message

### Alternative Flows

#### AF1: Amount Exceeds Organizational Limit
- At step 11, amount > max allowed for user level
- System displays error: "Approval limit cannot exceed [max amount]"
- Returns to step 6

#### AF2: Invalid Currency
- At step 11, currency not found or inactive
- System displays error: "Selected currency is invalid"
- Returns to step 7

#### AF3: Remove User-Specific Limit
- At step 5, actor clicks "Reset to Role Default"
- System removes user-specific limit
- System applies role-based default
- System logs reset action

### Postconditions
- User approval limit updated
- Workflow routes consider new limit
- Pending approvals unaffected (grandfathered)
- Audit log records change with justification

---

## UC-USR-009: Bulk Role Assignment

### Actor
System Administrator

### Preconditions
- Actor has user:bulk_update permission
- Multiple users selected
- Valid roles exist

### Main Flow
1. Actor selects multiple users via checkboxes on user list
2. System displays bulk action toolbar with selected count
3. Actor clicks "Bulk Actions" dropdown
4. Actor selects "Assign Roles"
5. System displays bulk role assignment dialog
6. System shows list of selected users (name, email)
7. Actor selects role(s) to assign
8. Actor chooses assignment mode:
   - Add to existing roles
   - Replace all roles
9. Actor clicks "Apply"
10. System processes each user:
    - Validates user exists and is active
    - Validates role assignment permissions
    - Adds or replaces roles per mode
    - Recalculates effective permissions
    - Logs change per user
11. System displays results summary:
    - Successfully updated: [count] users
    - Failed: [count] users with reasons
12. System clears selection
13. System refreshes user list

### Alternative Flows

#### AF1: Partial Failure
- At step 10, some users fail validation
- System processes successful users
- System displays detailed failure report
- Actor can retry failed users

#### AF2: No Users Selected
- At step 3, no users selected
- System displays message: "Please select at least one user"
- Returns to step 1

#### AF3: Operation Cancelled
- At step 9, actor clicks "Cancel"
- System closes dialog
- No changes applied

### Postconditions
- Selected users have updated roles
- Failed updates logged with reasons
- Audit trail records each individual change
- Email notifications sent to updated users (optional)

---

## UC-USR-010: Bulk Status Change

### Actor
System Administrator

### Preconditions
- Actor has user:bulk_update permission
- Multiple users selected

### Main Flow
1. Actor selects multiple users via checkboxes
2. System displays bulk action toolbar
3. Actor clicks "Bulk Actions" > "Change Status"
4. System displays status change dialog
5. System shows list of selected users with current statuses
6. Actor selects new status:
   - Active
   - Inactive
   - Suspended
   - Pending
7. Actor optionally provides reason for change
8. Actor clicks "Apply"
9. System processes each user:
    - Validates status transition is allowed
    - Updates account_status
    - If suspending: revokes active sessions
    - If activating: validates minimum requirements (role, department)
    - Logs change with reason
10. System displays results summary
11. System clears selection
12. System refreshes user list

### Alternative Flows

#### AF1: Invalid Status Transition
- At step 9, status transition not allowed
- System skips user and logs reason
- Continues with remaining users

#### AF2: Activation Requirements Not Met
- At step 9, user missing role or department
- System displays error for that user
- Skips user, continues with others

### Postconditions
- User account statuses updated
- Sessions revoked for suspended users
- Audit log records all changes with reasons
- Email notifications sent to affected users

---

## UC-USR-011: Export Users to CSV

### Actor
System Administrator, HR Manager

### Preconditions
- Actor has user:export permission
- User data exists

### Main Flow
1. Actor navigates to User Management page
2. Actor optionally applies filters to user list
3. Actor clicks "Export" button
4. System gathers all visible users (respecting filters)
5. System generates CSV with columns:
   - Name
   - Email
   - Business Unit
   - Department
   - Roles (semicolon-separated)
   - Account Status
   - Last Login
   - Approval Limit
   - Clearance Level
6. System creates filename: users-[YYYY-MM-DD].csv
7. System triggers browser download
8. Actor saves file to local system
9. System logs export action in audit trail

### Alternative Flows

#### AF1: No Users to Export
- At step 4, no users match filters
- System displays message: "No users to export"
- Returns to user list

#### AF2: Export All vs. Filtered
- At step 4, actor has applied filters
- Export includes only filtered users
- System notes filter criteria in audit log

### Postconditions
- CSV file downloaded to actor's system
- Export action logged with filter criteria
- No changes to user data

---

## UC-USR-014: Search and Filter Users

### Actor
System Administrator, Department Manager, HR Manager

### Preconditions
- Actor has user:view permission
- User data exists

### Main Flow
1. Actor navigates to User Management page
2. System displays user list with search and filter controls
3. Actor enters search term in search box
4. System performs real-time search across:
   - Name (firstname + lastname)
   - Email
   - Department name
5. System updates user list with matching results
6. Actor optionally applies additional filters:
   - Business Unit (dropdown)
   - Department (multi-select)
   - Role (multi-select)
   - Account Status (multi-select)
   - HOD Status (checkbox)
   - Clearance Level (dropdown)
7. System combines filters with AND logic
8. System displays filtered count: "Showing X of Y users"
9. System updates user list in real-time
10. Actor can save filter as "Quick Filter" for future use

### Alternative Flows

#### AF1: No Results Found
- At step 5 or 8, no users match criteria
- System displays message: "No users found matching criteria"
- Suggests clearing filters

#### AF2: Advanced Filter Builder
- At step 6, actor clicks "Advanced Filters"
- System displays filter builder with:
  - Field selection
  - Operator selection (equals, contains, greater than, etc.)
  - Value input
  - AND/OR logic between conditions
- Actor builds complex filter
- System applies and displays results

### Postconditions
- User list filtered according to search and filter criteria
- Filter state persisted in user session
- Quick filters saved for future use
- No changes to user data

---

## UC-USR-015: Set Special Permissions

### Actor
System Administrator

### Preconditions
- Actor has permission:manage permission
- User exists
- Special permissions defined in system

### Main Flow
1. Actor opens user edit form
2. Actor navigates to "Approval & Access" tab
3. System displays "Special Permissions" section
4. System displays available special permissions:
   - Emergency Access Override
   - Cross-Department Access
   - Recipe Confidential Access
   - Financial Override Authority
   - System Maintenance Access
5. Actor selects special permission(s) to grant
6. Actor sets time bounds (optional):
   - Effective From date/time
   - Effective To date/time
7. Actor provides justification (required for sensitive permissions)
8. Actor clicks "Grant Permissions"
9. System validates:
   - Actor has authority to grant requested permissions
   - Justification provided for sensitive permissions
   - Time bounds are logical (from < to)
10. System creates special permission records
11. System schedules auto-revocation if time-bound
12. System logs grant with justification
13. System notifies security team if sensitive permission granted
14. System displays updated permissions list

### Alternative Flows

#### AF1: Insufficient Authority
- At step 9, actor lacks authority for requested permission
- System displays error: "Insufficient authority to grant [permission name]"
- Returns to step 5

#### AF2: Missing Justification
- At step 9, justification missing for sensitive permission
- System displays error: "Justification required for this permission"
- Returns to step 7

#### AF3: Revoke Special Permission
- At step 3, actor clicks "Revoke" on active special permission
- System displays confirmation with security warning
- Actor confirms
- System revokes permission immediately
- System logs revocation with reason
- System notifies user of revocation

### Postconditions
- Special permissions granted and active
- Auto-revocation scheduled for time-bound permissions
- Security team notified for sensitive permissions
- Audit log records grant with full justification
- User gains immediate access to special permission scope

---

## Common Exception Flows

### EF1: Session Timeout
- At any step, user session expires
- System redirects to login page
- System preserves form data in session storage (if applicable)
- After re-authentication, system restores form state

### EF2: Database Connection Lost
- At any save operation, database connection fails
- System displays error: "Connection lost. Please try again."
- System retains form data for retry
- System logs connection failure for troubleshooting

### EF3: Concurrent Modification Conflict
- At any update operation, doc_version mismatch detected
- System displays error: "Data was modified by another user"
- System offers to view changes or force override
- If view changes: system displays diff view
- If force override: system requires additional confirmation

### EF4: Permission Revoked During Operation
- At any step, actor's permissions change
- System detects permission loss
- System displays error: "Your permissions have changed"
- System redirects to appropriate page
- No partial data saved

---

## Use Case Dependencies

```
UC-USR-001 (Create User) is prerequisite for:
  ├── UC-USR-002 (View User)
  ├── UC-USR-003 (Edit User)
  ├── UC-USR-004 (Delete User)
  ├── UC-USR-005 (Assign Department)
  ├── UC-USR-006 (Assign Location)
  ├── UC-USR-007 (Assign Roles)
  └── UC-USR-008 (Set Approval Limit)

UC-USR-003 (Edit User) enables:
  ├── UC-USR-005 (Assign Department)
  ├── UC-USR-006 (Assign Location)
  ├── UC-USR-007 (Assign Roles)
  ├── UC-USR-008 (Set Approval Limit)
  └── UC-USR-015 (Set Special Permissions)

UC-USR-014 (Search/Filter) enables efficient:
  ├── UC-USR-009 (Bulk Role Assignment)
  ├── UC-USR-010 (Bulk Status Change)
  └── UC-USR-011 (Export Users)
```
