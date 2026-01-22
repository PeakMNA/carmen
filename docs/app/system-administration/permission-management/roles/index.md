# Role Management

Create, modify, and manage user roles with permissions and hierarchy.

---

## Quick Navigation

| | | |
|:---:|:---:|:---:|
| [**BR**](/system-administration/permission-management/roles/business-requirements)<br/>Business Requirements | [**UC**](/system-administration/permission-management/roles/use-cases)<br/>Use Cases | [**TS**](/system-administration/permission-management/roles/technical-specification)<br/>Technical Spec |
| [**DD**](/system-administration/permission-management/roles/data-dictionary)<br/>Data Dictionary | [**FD**](/system-administration/permission-management/roles/flow-diagrams)<br/>Flow Diagrams | [**VAL**](/system-administration/permission-management/roles/validations)<br/>Validations |

---

## Documents

| Document | Description |
|----------|-------------|
| [BR-roles](./BR-roles.md) | Business Requirements |
| [UC-roles](./UC-roles.md) | Use Cases |
| [DD-roles](./DD-roles.md) | Data Dictionary |
| [TS-roles](./TS-roles.md) | Technical Specification |
| [FD-roles](./FD-roles.md) | Flow Diagrams |
| [VAL-roles](./VAL-roles.md) | Validation Rules |

## Features

- Role CRUD operations
- Permission assignment
- Role hierarchy with inheritance
- Parent/child role relationships
- User assignment to roles
- Table and card view modes
- System role protection

## Role Properties

| Property | Description |
|----------|-------------|
| name | Role display name |
| permissions | Direct permissions |
| hierarchy | Level in role hierarchy |
| parentRoles | Roles to inherit from |
| isSystem | Protected system role |

## Route

`/system-administration/permission-management/roles`
