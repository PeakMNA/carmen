# Use Cases: Role Management

## Module Information
- **Module**: System Administration > Permission Management
- **Sub-Module**: Role Management
- **Route**: `/system-administration/permission-management/roles`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## UC-ROLE-001: View Role List

**Actor**: IT Administrator

**Main Flow**:
1. Navigate to Permission Management > Role Management
2. System displays role list (table view default)
3. View role name, description, hierarchy, permission count

**Alternative Flow**:
- Switch to card view via toggle button

---

## UC-ROLE-002: Create New Role

**Actor**: IT Administrator

**Main Flow**:
1. Click "Create Role" button
2. System sets currentView to 'create'
3. RoleForm displayed with empty fields
4. Enter role name (required)
5. Enter description
6. Set hierarchy level
7. Select permissions
8. Select parent roles (optional)
9. Click Save
10. System calls addRole from store
11. Toast shows success
12. Return to list view

**Exception Flow**:
- Cancel: Click Cancel, return to list without saving

---

## UC-ROLE-003: Edit Role

**Actor**: IT Administrator

**Main Flow**:
1. Click Edit on role row
2. System sets currentView to 'edit'
3. System loads role data via getRole
4. RoleForm populated with existing values
5. Modify fields as needed
6. Click Save
7. System calls updateRole
8. Toast shows success
9. Return to list view

---

## UC-ROLE-004: View Role Details

**Actor**: IT Administrator

**Main Flow**:
1. Click View on role row
2. Navigate to `/roles/{roleId}`
3. System displays role detail page with tabs:
   - Permission Details tab
   - User Assignment tab
   - Policy Assignment tab
4. View hierarchy level, permission count, parent roles

**Alternative Flow**:
- Click "Edit Role" button to switch to edit mode

---

## UC-ROLE-005: Delete Role

**Actor**: IT Administrator

**Main Flow**:
1. Click Delete on role row
2. System confirms deletion
3. Role removed from store

**Precondition**: Role is not a system role (isSystem = false)

---

## UC-ROLE-006: Duplicate Role

**Actor**: IT Administrator

**Main Flow**:
1. Click Duplicate on role row
2. System creates copy of role data
3. Opens create form with copied data
4. Modify name (required - must be unique)
5. Save as new role

---

## UC-ROLE-007: Assign Users

**Actor**: IT Administrator

**Main Flow**:
1. Click "Assign Users" on role
2. System opens user assignment interface
3. Select users to assign
4. Save assignments

---

## UC-ROLE-008: Toggle View Mode

**Actor**: IT Administrator

**Main Flow**:
1. Click view mode toggle
2. System switches between 'table' and 'card'
3. Same data, different presentation

---

**Document End**
