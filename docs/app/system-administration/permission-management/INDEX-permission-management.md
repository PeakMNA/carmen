# Permission Management Module

## Overview

The **Permission Management** module provides comprehensive access control capabilities for Carmen ERP through policies, roles, and subscriptions. It supports both RBAC (Role-Based Access Control) and ABAC (Attribute-Based Access Control) models for fine-grained permission management.

---

## Module Information

| Property | Value |
|----------|-------|
| **Module** | System Administration |
| **Sub-module** | Permission Management |
| **Route** | `/system-administration/permission-management` |
| **Version** | 1.0 |
| **Status** | Active |

---

## Key Features

### Policy-Based Access Control
- RBAC policies for role-based permissions
- ABAC policies for attribute-based conditions
- Priority-based policy evaluation
- Permit and deny effects

### Role Management
- Role creation and configuration
- Role hierarchy with inheritance
- Parent/child role relationships
- System role protection

### Permission Inheritance
- Inherit permissions from parent roles
- Cumulative permission model
- Hierarchy level evaluation

### Feature Subscriptions
- Subscription tier management
- Feature activation per tier
- Resource limit enforcement

---

## Sub-Modules

| Module | Route | Status | Description |
|--------|-------|--------|-------------|
| [Policy Management](./policies/INDEX-policies.md) | `/permission-management/policies` | Active | RBAC/ABAC policy configuration |
| [Role Management](./roles/INDEX-roles.md) | `/permission-management/roles` | Active | User roles and hierarchy |
| [Subscription Settings](./subscription/INDEX-subscription.md) | `/permission-management/subscription` | Placeholder | Feature subscriptions |

---

## Documentation Index

| Document | Description | Link |
|----------|-------------|------|
| **Business Requirements** | Functional requirements and user stories | [BR-permission-management.md](./BR-permission-management.md) |
| **Use Cases** | User interaction scenarios | [UC-permission-management.md](./UC-permission-management.md) |
| **Data Dictionary** | Type definitions and data structures | [DD-permission-management.md](./DD-permission-management.md) |
| **Technical Specification** | Architecture and implementation | [TS-permission-management.md](./TS-permission-management.md) |
| **Flow Diagrams** | Visual process flows | [FD-permission-management.md](./FD-permission-management.md) |
| **Validation Rules** | Data validation and business rules | [VAL-permission-management.md](./VAL-permission-management.md) |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [User Management](/docs/app/system-administration/user-management) | Users assigned to roles |
| [Location Management](/docs/app/system-administration/location-management) | Location-based permissions |
| [Workflow](/docs/app/system-administration/workflow) | Approval workflow permissions |

---

## Quick Start

### Creating a Role
1. Navigate to **Permission Management > Roles**
2. Click **Create Role**
3. Configure role settings and permissions
4. Save role

### Creating a Policy
1. Navigate to **Permission Management > Policies**
2. Click **Create Policy**
3. Define policy rules and conditions
4. Save and activate policy

### Assigning Permissions
1. Create or edit a role
2. Select permissions to assign
3. Optionally select parent roles for inheritance
4. Save changes

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial release with policies and roles |
