# Data Dictionary: Role Management

## Module Information
- **Module**: System Administration > Permission Management
- **Sub-Module**: Role Management
- **Route**: `/system-administration/permission-management/roles`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## Data Structures

### Role

**Source**: `lib/types/permissions.ts` and `lib/types/user.ts`

```typescript
interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
  parentRole?: string
  parentRoles?: string[]
  hierarchy: number
  isSystem?: boolean
  childRoles?: string[]
  effectivePermissions?: string[]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier |
| name | string | Yes | Role display name |
| description | string | No | Role description |
| permissions | string[] | Yes | Direct permissions |
| parentRole | string | No | Single parent (legacy) |
| parentRoles | string[] | No | Multiple parents |
| hierarchy | number | Yes | Hierarchy level |
| isSystem | boolean | No | System role flag |
| childRoles | string[] | No | Inheriting roles |
| effectivePermissions | string[] | No | Computed permissions |

---

## Component State

### RoleManagementPage State

| State | Type | Initial | Description |
|-------|------|---------|-------------|
| currentView | ViewMode | 'list' | Current view mode |
| selectedRole | Role \| null | null | Role being edited/viewed |
| isLoading | boolean | false | Save loading state |
| viewType | 'table' \| 'card' | 'table' | List display mode |

### ViewMode Type

```typescript
type ViewMode = 'list' | 'create' | 'edit' | 'view'
```

---

## Store: useRoleStore

**Source**: `lib/stores/role-store.ts`

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| roles | - | Role[] | All roles |
| addRole | data | Role | Create new role |
| updateRole | id, data | boolean | Update existing role |
| getRole | id | Role \| undefined | Get role by ID |

---

## Components

### RoleDataTable

| Prop | Type | Description |
|------|------|-------------|
| columns | ColumnDef[] | Table column definitions |
| data | Role[] | Role data |
| viewMode | 'table' \| 'card' | Display mode |
| onViewModeChange | function | Toggle handler |
| cardView | ReactNode | Card view component |

### RoleForm

| Prop | Type | Description |
|------|------|-------------|
| role | Role \| undefined | Existing role for edit |
| onSave | function | Save handler |
| onCancel | function | Cancel handler |
| isLoading | boolean | Loading state |

### RoleCardView

| Prop | Type | Description |
|------|------|-------------|
| data | Role[] | Role data |
| selectedItems | string[] | Selected role IDs |
| onView | function | View handler |
| onEdit | function | Edit handler |
| onDelete | function | Delete handler |
| onDuplicate | function | Duplicate handler |
| onAssignUsers | function | Assign handler |

---

## Data Sources

| Source | Description |
|--------|-------------|
| mockRoles | Initial mock role data |
| useRoleStore | Zustand store for role state |

---

**Document End**
