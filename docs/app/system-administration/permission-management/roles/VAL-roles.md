# Validation Rules: Role Management

## Module Information
- **Module**: System Administration > Permission Management
- **Sub-Module**: Role Management
- **Route**: `/system-administration/permission-management/roles`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## Form Validations

### VAL-ROLE-001: Role Name

| Rule | Description |
|------|-------------|
| Type | Required |
| Min Length | 1 character |
| Unique | Should be unique across roles |

---

### VAL-ROLE-002: Hierarchy Level

| Rule | Description |
|------|-------------|
| Type | Number |
| Default | 0 |
| Higher | Higher hierarchy = more authority |

---

### VAL-ROLE-003: Permissions Array

| Rule | Description |
|------|-------------|
| Type | string[] |
| Default | [] |
| Valid | Must be valid permission strings |

---

### VAL-ROLE-004: Parent Roles

| Rule | Description |
|------|-------------|
| Type | string[] (optional) |
| Constraint | Cannot be circular |
| Effect | Inherits permissions from parents |

---

## Business Rules

### VAL-ROLE-005: System Role Protection

| Rule | Description |
|------|-------------|
| Check | isSystem === true |
| Effect | Cannot be deleted |
| Example | Admin, SuperAdmin |

---

### VAL-ROLE-006: View Mode

| Rule | Description |
|------|-------------|
| Type | Enum |
| Values | 'table', 'card' |
| Default | 'table' |

---

## State Validations

### VAL-ROLE-007: Current View

| Value | Requirements |
|-------|--------------|
| 'list' | Display role list |
| 'create' | selectedRole must be null |
| 'edit' | selectedRole must be set |
| 'view' | selectedRole must be set |

---

### VAL-ROLE-008: Loading State

| Rule | Description |
|------|-------------|
| State | isLoading |
| True | Disable form submission |
| False | Enable form submission |

---

## Current Implementation

- Form validation in RoleForm component
- No Zod schemas in source code
- Zustand store for state management
- Simulated API call (1 second delay)

---

## Future Validations

| Rule | Description |
|------|-------------|
| Unique Name | Server-side check for duplicate names |
| Circular Reference | Prevent role from being its own parent |
| Permission Validation | Validate against allowed permissions |

---

**Document End**
