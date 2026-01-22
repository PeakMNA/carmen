# Role Management Module

## Overview

The **Role Management** module enables administrators to create, configure, and manage user roles within Carmen ERP. It supports role hierarchy with inheritance, allowing child roles to inherit permissions from parent roles while adding their own specific permissions.

---

## Module Information

| Property | Value |
|----------|-------|
| **Module** | System Administration > Permission Management |
| **Sub-module** | Role Management |
| **Route** | `/system-administration/permission-management/roles` |
| **Version** | 1.0 |
| **Status** | Active |

---

## Key Features

### Role Configuration
- Role name and description
- Direct permission assignment
- Role hierarchy level
- Parent/child role relationships
- System role protection

### Role Hierarchy
- Inherit permissions from parent roles
- Multiple parent role support
- Hierarchy levels for evaluation order
- Visual hierarchy display

### View Modes
- **Table View**: Traditional list with sortable columns
- **Card View**: Visual cards showing role details

### Role Operations
- Create new roles
- Edit existing roles
- Delete non-system roles
- View role details
- Assign users to roles

---

## Role Properties

| Property | Description |
|----------|-------------|
| `name` | Role display name |
| `description` | Role description |
| `permissions` | Direct permissions assigned |
| `hierarchy` | Level in role hierarchy |
| `parentRoles` | Roles to inherit permissions from |
| `childRoles` | Roles that inherit from this role |
| `isSystem` | Protected system role flag |

---

## Documentation Index

| Document | Description | Link |
|----------|-------------|------|
| **Business Requirements** | Functional requirements and user stories | [BR-roles.md](./BR-roles.md) |
| **Use Cases** | User interaction scenarios | [UC-roles.md](./UC-roles.md) |
| **Data Dictionary** | Type definitions and data structures | [DD-roles.md](./DD-roles.md) |
| **Technical Specification** | Architecture and implementation | [TS-roles.md](./TS-roles.md) |
| **Flow Diagrams** | Visual process flows | [FD-roles.md](./FD-roles.md) |
| **Validation Rules** | Data validation and business rules | [VAL-roles.md](./VAL-roles.md) |

---

## Quick Start

### Creating a Role
1. Navigate to **Permission Management > Roles**
2. Click **Create Role**
3. Enter role name and description
4. Set hierarchy level
5. Select parent roles (optional)
6. Assign permissions
7. Save role

### Managing Role Hierarchy
1. View existing roles in table or card view
2. Click role to see inheritance details
3. Edit role to modify parent relationships
4. Permissions automatically inherited from parents

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial release |
