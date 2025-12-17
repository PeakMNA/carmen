# Permission Management - Validation Rules (VAL)

**Module**: System Administration - Permission Management
**Version**: 1.0
**Last Updated**: 2025-01-16
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Document Status**: Active

---

## Table of Contents

1. [Overview](#overview)
2. [Field-Level Validation](#field-level-validation)
3. [Cross-Field Validation](#cross-field-validation)
4. [Business Rule Validation](#business-rule-validation)
5. [Database Constraints](#database-constraints)
6. [Client-Side Validation](#client-side-validation)
7. [Server-Side Validation](#server-side-validation)
8. [Validation Error Messages](#validation-error-messages)
9. [Validation Testing](#validation-testing)

---

## Overview

### Purpose
This document defines comprehensive validation rules for the Permission Management module, covering both current RBAC implementation and planned database schema. Validation is implemented in three layers: client-side, server-side, and database constraints.

### Validation Layers

```
┌─────────────────────────────────────────────────┐
│         Client-Side Validation                   │
│  - Real-time field validation                    │
│  - Zod schema validation                         │
│  - React Hook Form integration                   │
│  - Immediate user feedback                       │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│         Server-Side Validation                   │
│  - Zod schema re-validation                      │
│  - Business rule enforcement                     │
│  - Cross-entity validation                       │
│  - Security checks                               │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│         Database Constraints                     │
│  - Primary key constraints                       │
│  - Unique constraints                            │
│  - Foreign key constraints                       │
│  - Check constraints                             │
│  - NOT NULL constraints                          │
└─────────────────────────────────────────────────┘
```

---

## Field-Level Validation

### VAL-PM-001: Role Name Validation

**Priority**: CRITICAL
**Layer**: Client + Server + Database

**Rules**:
- **Required**: Must not be empty or null
- **Length**: Minimum 3 characters, maximum 100 characters
- **Format**: Alphanumeric characters, spaces, hyphens, and underscores only
- **Uniqueness**: Case-insensitive unique across all roles
- **Reserved**: Cannot use reserved names: "System", "Admin", "Default", "Test"

**Zod Schema**:
```typescript
const roleNameSchema = z.string()
  .min(3, "Role name must be at least 3 characters")
  .max(100, "Role name must not exceed 100 characters")
  .regex(
    /^[a-zA-Z0-9\s\-_]+$/,
    "Role name can only contain letters, numbers, spaces, hyphens, and underscores"
  )
  .refine(
    (name) => !["system", 'admin', 'default', 'test'].includes(name.toLowerCase()),
    "This role name is reserved and cannot be used"
  )
  .refine(
    async (name) => {
      const existing = await checkRoleNameExists(name)
      return !existing
    },
    "A role with this name already exists"
  )
```

**Database Constraint**:
```sql
ALTER TABLE tb_role
ADD CONSTRAINT tb_role_name_unique UNIQUE (LOWER(name));

ALTER TABLE tb_role
ADD CONSTRAINT tb_role_name_length CHECK (LENGTH(name) BETWEEN 3 AND 100);

ALTER TABLE tb_role
ADD CONSTRAINT tb_role_name_format CHECK (name ~ '^[a-zA-Z0-9\s\-_]+$');
```

**Error Messages**:
- `ROLE_NAME_REQUIRED`: "Role name is required"
- `ROLE_NAME_TOO_SHORT`: "Role name must be at least 3 characters"
- `ROLE_NAME_TOO_LONG`: "Role name must not exceed 100 characters"
- `ROLE_NAME_INVALID_FORMAT`: "Role name contains invalid characters"
- `ROLE_NAME_RESERVED`: "This role name is reserved"
- `ROLE_NAME_EXISTS`: "A role with this name already exists"

---

### VAL-PM-002: Role Description Validation

**Priority**: MEDIUM
**Layer**: Client + Server

**Rules**:
- **Optional**: Can be null or empty
- **Length**: Maximum 500 characters
- **Format**: Any printable characters allowed

**Zod Schema**:
```typescript
const roleDescriptionSchema = z.string()
  .max(500, "Description must not exceed 500 characters")
  .optional()
```

**Error Messages**:
- `ROLE_DESCRIPTION_TOO_LONG`: "Description must not exceed 500 characters"

---

### VAL-PM-003: Permission Format Validation

**Priority**: CRITICAL
**Layer**: Client + Server

**Rules**:
- **Required**: Permissions array must not be empty
- **Format**: Each permission must follow "resource:action" pattern
- **Resource**: Lowercase alphanumeric with underscores only
- **Action**: Lowercase alphanumeric with underscores or wildcard (*)
- **Wildcard**: Global wildcard (*) only for System Administrator role

**Zod Schema**:
```typescript
const permissionSchema = z.string()
  .regex(
    /^[a-z_]+:[a-z_*]+$/,
    "Permission must follow format: resource:action (e.g., purchase_request:create)"
  )
  .refine(
    (perm, ctx) => {
      if (perm === '*' && ctx.role?.name !== 'System Administrator') {
        return false
      }
      return true
    },
    "Global wildcard (*) permission is only allowed for System Administrator"
  )

const permissionsArraySchema = z.array(permissionSchema)
  .min(1, "At least one permission is required")
  .refine(
    (perms) => {
      const unique = new Set(perms)
      return unique.size === perms.length
    },
    "Duplicate permissions are not allowed"
  )
```

**Valid Permission Examples**:
```typescript
"purchase_request:create"
"purchase_request:approve_department"
"inventory_item:view_stock"
"purchase_order:*"  // Wildcard for all actions on resource
"*"                 // Only for System Administrator
```

**Error Messages**:
- `PERMISSION_REQUIRED`: "At least one permission is required"
- `PERMISSION_INVALID_FORMAT`: "Permission must follow format: resource:action"
- `PERMISSION_GLOBAL_WILDCARD`: "Global wildcard (*) is only allowed for System Administrator"
- `PERMISSION_DUPLICATE`: "Duplicate permissions are not allowed"

---

### VAL-PM-004: Hierarchy Level Validation

**Priority**: HIGH
**Layer**: Client + Server + Database

**Rules**:
- **Required**: Must not be null
- **Range**: Must be between 1 and 10 (inclusive)
- **Auto-calculation**: If parent roles exist, must be max(parent levels) + 1
- **System Administrator**: Must always be level 1

**Zod Schema**:
```typescript
const hierarchyLevelSchema = z.number()
  .int("Hierarchy level must be an integer")
  .min(1, "Hierarchy level must be at least 1")
  .max(10, "Hierarchy level must not exceed 10")
  .refine(
    (level, ctx) => {
      if (ctx.role?.name === 'System Administrator' && level !== 1) {
        return false
      }
      return true
    },
    "System Administrator must be hierarchy level 1"
  )
```

**Database Constraint**:
```sql
ALTER TABLE tb_role
ADD CONSTRAINT tb_role_hierarchy_range CHECK (hierarchy BETWEEN 1 AND 10);
```

**Error Messages**:
- `HIERARCHY_REQUIRED`: "Hierarchy level is required"
- `HIERARCHY_OUT_OF_RANGE`: "Hierarchy level must be between 1 and 10"
- `HIERARCHY_SYSADMIN`: "System Administrator must be hierarchy level 1"

---

### VAL-PM-005: Parent Roles Validation

**Priority**: HIGH
**Layer**: Client + Server

**Rules**:
- **Optional**: Can be empty array
- **Format**: Array of valid role IDs (UUID format)
- **Existence**: All parent role IDs must exist in the system
- **Circular Prevention**: Cannot create circular inheritance (role A → role B → role A)
- **Level Consistency**: Child level must be greater than all parent levels

**Zod Schema**:
```typescript
const parentRolesSchema = z.array(z.string().uuid())
  .optional()
  .refine(
    async (parentIds, ctx) => {
      if (!parentIds || parentIds.length === 0) return true

      // Check all parent roles exist
      const roles = await getRolesByIds(parentIds)
      return roles.length === parentIds.length
    },
    "One or more parent roles do not exist"
  )
  .refine(
    (parentIds, ctx) => {
      if (!parentIds || parentIds.length === 0) return true

      // Check for circular inheritance
      return !hasCircularInheritance(ctx.role.id, parentIds)
    },
    "Circular inheritance detected. A role cannot inherit from itself directly or indirectly"
  )
```

**Circular Inheritance Detection**:
```typescript
function hasCircularInheritance(roleId: string, parentIds: string[]): boolean {
  const visited = new Set<string>()

  function checkCycle(currentId: string): boolean {
    if (visited.has(currentId)) return true
    if (currentId === roleId) return true

    visited.add(currentId)

    const role = getRoleById(currentId)
    if (!role.parentRoles) return false

    return role.parentRoles.some(parentId => checkCycle(parentId))
  }

  return parentIds.some(parentId => checkCycle(parentId))
}
```

**Error Messages**:
- `PARENT_INVALID_ID`: "Invalid parent role ID format"
- `PARENT_NOT_FOUND`: "One or more parent roles do not exist"
- `PARENT_CIRCULAR`: "Circular inheritance detected"

---

## Cross-Field Validation

### VAL-PM-006: System Role Protection

**Priority**: CRITICAL
**Layer**: Server + Database

**Rules**:
- System roles (where `is_system = true`) have restricted modifications:
  - **Name**: Cannot be changed
  - **Deletion**: Cannot be deleted
  - **is_system flag**: Cannot be changed once set to true

**Validation**:
```typescript
function validateSystemRoleModification(role: Role, updates: Partial<Role>): ValidationResult {
  if (!role.isSystem) return { valid: true }

  const errors: string[] = []

  if (updates.name && updates.name !== role.name) {
    errors.push("System role name cannot be changed")
  }

  if (updates.isSystem === false) {
    errors.push("Cannot change system role to custom role")
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

**Error Messages**:
- `SYSTEM_ROLE_NAME_CHANGE`: "System role name cannot be changed"
- `SYSTEM_ROLE_FLAG_CHANGE`: "Cannot change system role to custom role"
- `SYSTEM_ROLE_DELETE`: "System roles cannot be deleted"

---

### VAL-PM-007: Permission Inheritance Consistency

**Priority**: HIGH
**Layer**: Client + Server

**Rules**:
- Inherited permissions cannot be directly removed from child role
- To remove inherited permission, must remove parent role relationship
- Effective permissions must include all parent permissions

**Validation**:
```typescript
function validatePermissionRemoval(
  role: Role,
  permissionToRemove: string
): ValidationResult {
  const inheritedPermissions = getInheritedPermissions(role)

  if (inheritedPermissions.includes(permissionToRemove)) {
    return {
      valid: false,
      errors: [`Cannot remove inherited permission. This permission comes from parent role(s). Remove parent role to exclude this permission.`]
    }
  }

  return { valid: true }
}
```

**Error Messages**:
- `PERMISSION_INHERITED`: "Cannot remove inherited permission. Remove parent role instead."

---

### VAL-PM-008: User Assignment Validation

**Priority**: HIGH
**Layer**: Client + Server + Database

**Rules**:
- **User Existence**: User ID must exist in tb_user table
- **User Active**: User must have status = 'active'
- **Department**: If specified, must exist in tb_department table
- **Location**: If specified, must exist in tb_location table
- **Effective Dates**: effective_to must be greater than effective_from
- **Unique Assignment**: Combination of (user_id, role_id, department_id, location_id) must be unique

**Zod Schema**:
```typescript
const userRoleAssignmentSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  effectiveFrom: z.date(),
  effectiveTo: z.date().optional()
})
.refine(
  async (data) => {
    const user = await getUserById(data.userId)
    return user && user.status === 'active'
  },
  "User does not exist or is not active"
)
.refine(
  (data) => {
    if (!data.effectiveTo) return true
    return data.effectiveTo > data.effectiveFrom
  },
  "Effective end date must be after start date"
)
.refine(
  async (data) => {
    const exists = await checkUserRoleExists(
      data.userId,
      data.roleId,
      data.departmentId,
      data.locationId
    )
    return !exists
  },
  "User is already assigned to this role with the same context"
)
```

**Database Constraint**:
```sql
ALTER TABLE tb_user_role
ADD CONSTRAINT tb_user_role_dates_valid
CHECK (effective_to IS NULL OR effective_to > effective_from);

ALTER TABLE tb_user_role
ADD CONSTRAINT tb_user_role_unique
UNIQUE (user_id, role_id, department_id, location_id);
```

**Error Messages**:
- `USER_NOT_FOUND`: "User does not exist"
- `USER_INACTIVE`: "User is not active"
- `DEPARTMENT_NOT_FOUND`: "Department does not exist"
- `LOCATION_NOT_FOUND`: "Location does not exist"
- `DATES_INVALID`: "Effective end date must be after start date"
- `ASSIGNMENT_EXISTS`: "User is already assigned to this role with the same context"

---

## Business Rule Validation

### VAL-PM-009: Role Deletion Constraints

**Priority**: CRITICAL
**Layer**: Server

**Rules**:
- Cannot delete role with assigned users
- Cannot delete role with child roles that inherit from it
- Cannot delete system roles
- Must provide confirmation before deletion

**Validation**:
```typescript
function validateRoleDeletion(roleId: string): ValidationResult {
  const role = getRoleById(roleId)
  const errors: string[] = []

  // Check if system role
  if (role.isSystem) {
    errors.push("System roles cannot be deleted")
  }

  // Check for assigned users
  const userCount = getUserCountForRole(roleId)
  if (userCount > 0) {
    errors.push(`Cannot delete role with ${userCount} assigned users. Please reassign users first.`)
  }

  // Check for child roles
  const childRoles = getChildRoles(roleId)
  if (childRoles.length > 0) {
    errors.push(`Cannot delete role with ${childRoles.length} child roles. Please reassign parent roles first.`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: errors.length === 0 ? ['This action cannot be undone'] : []
  }
}
```

**Error Messages**:
- `ROLE_SYSTEM_DELETE`: "System roles cannot be deleted"
- `ROLE_HAS_USERS`: "Cannot delete role with assigned users"
- `ROLE_HAS_CHILDREN`: "Cannot delete role with child roles"

---

### VAL-PM-010: Minimum Active User Role

**Priority**: HIGH
**Layer**: Server

**Rules**:
- A user must have at least one active role assignment
- Cannot remove last active role from a user
- Can remove expired or inactive role assignments

**Validation**:
```typescript
function validateUserRoleRemoval(userId: string, roleId: string): ValidationResult {
  const activeRoles = getActiveUserRoles(userId)

  if (activeRoles.length === 1 && activeRoles[0].id === roleId) {
    return {
      valid: false,
      errors: ['Cannot remove user's last active role. Users must have at least one active role.']
    }
  }

  return { valid: true }
}
```

**Error Messages**:
- `USER_LAST_ROLE`: "Cannot remove user's last active role"

---

## Database Constraints

### VAL-PM-011: Primary Key Constraints

**Priority**: CRITICAL
**Layer**: Database

```sql
-- tb_role primary key
ALTER TABLE tb_role
ADD CONSTRAINT tb_role_pkey PRIMARY KEY (id);

-- tb_role_hierarchy primary key
ALTER TABLE tb_role_hierarchy
ADD CONSTRAINT tb_role_hierarchy_pkey PRIMARY KEY (id);

-- tb_user_role primary key
ALTER TABLE tb_user_role
ADD CONSTRAINT tb_user_role_pkey PRIMARY KEY (id);

-- tb_permission_audit primary key
ALTER TABLE tb_permission_audit
ADD CONSTRAINT tb_permission_audit_pkey PRIMARY KEY (id);
```

---

### VAL-PM-012: Foreign Key Constraints

**Priority**: CRITICAL
**Layer**: Database

```sql
-- tb_role_hierarchy foreign keys
ALTER TABLE tb_role_hierarchy
ADD CONSTRAINT fk_role_hierarchy_parent
FOREIGN KEY (parent_id) REFERENCES tb_role(id) ON DELETE CASCADE;

ALTER TABLE tb_role_hierarchy
ADD CONSTRAINT fk_role_hierarchy_child
FOREIGN KEY (child_id) REFERENCES tb_role(id) ON DELETE CASCADE;

-- tb_user_role foreign keys
ALTER TABLE tb_user_role
ADD CONSTRAINT fk_user_role_user
FOREIGN KEY (user_id) REFERENCES tb_user(id) ON DELETE CASCADE;

ALTER TABLE tb_user_role
ADD CONSTRAINT fk_user_role_role
FOREIGN KEY (role_id) REFERENCES tb_role(id) ON DELETE RESTRICT;

ALTER TABLE tb_user_role
ADD CONSTRAINT fk_user_role_department
FOREIGN KEY (department_id) REFERENCES tb_department(id) ON DELETE SET NULL;

ALTER TABLE tb_user_role
ADD CONSTRAINT fk_user_role_location
FOREIGN KEY (location_id) REFERENCES tb_location(id) ON DELETE SET NULL;
```

---

### VAL-PM-013: Check Constraints

**Priority**: HIGH
**Layer**: Database

```sql
-- No self-reference in role hierarchy
ALTER TABLE tb_role_hierarchy
ADD CONSTRAINT tb_role_hierarchy_no_self
CHECK (parent_id != child_id);

-- Soft delete consistency
ALTER TABLE tb_role
ADD CONSTRAINT tb_role_soft_delete
CHECK (
  (deleted_at IS NULL AND deleted_by_id IS NULL) OR
  (deleted_at IS NOT NULL AND deleted_by_id IS NOT NULL)
);

-- Effective date consistency
ALTER TABLE tb_user_role
ADD CONSTRAINT tb_user_role_dates_check
CHECK (effective_to IS NULL OR effective_to > effective_from);
```

---

## Client-Side Validation

### VAL-PM-014: React Hook Form Integration

**Priority**: HIGH
**Layer**: Client

**Implementation**:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const roleFormSchema = z.object({
  name: roleNameSchema,
  description: roleDescriptionSchema,
  permissions: permissionsArraySchema,
  parentRoles: parentRolesSchema,
  hierarchy: hierarchyLevelSchema
})

type RoleFormData = z.infer<typeof roleFormSchema>

export function RoleForm() {
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    mode: 'onChange', // Real-time validation
    reValidateMode: 'onChange'
  })

  // Form submission with validation
  const onSubmit = async (data: RoleFormData) => {
    try {
      await createRole(data)
      toast.success("Role created successfully")
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          form.setError(err.path[0] as any, {
            type: 'manual',
            message: err.message
          })
        })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

**Features**:
- Real-time validation on field change
- Debounced async validation (300ms)
- Field-level error messages
- Submit button disabled until form is valid

---

### VAL-PM-015: Async Validation Debouncing

**Priority**: MEDIUM
**Layer**: Client

**Implementation**:
```typescript
import { debounce } from 'lodash'

const checkRoleNameAvailability = debounce(async (name: string) => {
  const exists = await api.checkRoleNameExists(name)
  return !exists
}, 300)

const roleNameField = useFormField({
  name: 'name',
  validate: async (value) => {
    const isAvailable = await checkRoleNameAvailability(value)
    return isAvailable || "Role name already exists"
  }
})
```

---

## Server-Side Validation

### VAL-PM-016: Server Action Validation

**Priority**: CRITICAL
**Layer**: Server

**Implementation**:
```typescript
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

export async function createRole(formData: FormData) {
  // 1. Parse and validate input
  const rawData = Object.fromEntries(formData.entries())

  const validatedData = roleFormSchema.safeParse(rawData)

  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors
    }
  }

  // 2. Business rule validation
  const businessValidation = await validateRoleBusinessRules(validatedData.data)

  if (!businessValidation.valid) {
    return {
      success: false,
      errors: businessValidation.errors
    }
  }

  // 3. Create role
  try {
    const role = await prisma.tb_role.create({
      data: validatedData.data
    })

    // 4. Invalidate cache
    revalidatePath('/system-administration/permission-management/roles')

    // 5. Log audit trail
    await logAudit({
      entityType: 'role',
      entityId: role.id,
      action: 'create',
      performedBy: getCurrentUserId()
    })

    return {
      success: true,
      data: role
    }
  } catch (error) {
    return {
      success: false,
      errors: { _form: ['Failed to create role. Please try again.'] }
    }
  }
}
```

---

### VAL-PM-017: Permission Check Validation

**Priority**: CRITICAL
**Layer**: Server

**Implementation**:
```typescript
export async function hasPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  // 1. Validate inputs
  if (!userId || !resource || !action) {
    throw new Error("Invalid permission check parameters")
  }

  // 2. Get user's effective permissions
  const effectivePermissions = await getUserEffectivePermissions(userId)

  // 3. Check permission
  const requiredPermission = `${resource}:${action}`

  return (
    effectivePermissions.includes(requiredPermission) ||
    effectivePermissions.includes(`${resource}:*`) ||
    effectivePermissions.includes('*')
  )
}
```

---

## Validation Error Messages

### VAL-PM-018: Error Message Catalog

**Priority**: HIGH
**Layer**: All

**Error Message Format**:
```typescript
interface ValidationError {
  code: string          // Machine-readable error code
  field?: string        // Field name (if field-specific)
  message: string       // User-friendly message
  details?: any         // Additional error details
}
```

**Complete Error Catalog**:

| Code | Field | Message |
|------|-------|---------|
| ROLE_NAME_REQUIRED | name | Role name is required |
| ROLE_NAME_TOO_SHORT | name | Role name must be at least 3 characters |
| ROLE_NAME_TOO_LONG | name | Role name must not exceed 100 characters |
| ROLE_NAME_INVALID_FORMAT | name | Role name contains invalid characters |
| ROLE_NAME_RESERVED | name | This role name is reserved |
| ROLE_NAME_EXISTS | name | A role with this name already exists |
| ROLE_DESCRIPTION_TOO_LONG | description | Description must not exceed 500 characters |
| PERMISSION_REQUIRED | permissions | At least one permission is required |
| PERMISSION_INVALID_FORMAT | permissions | Permission must follow format: resource:action |
| PERMISSION_GLOBAL_WILDCARD | permissions | Global wildcard (*) is only allowed for System Administrator |
| PERMISSION_DUPLICATE | permissions | Duplicate permissions are not allowed |
| PERMISSION_INHERITED | permissions | Cannot remove inherited permission |
| HIERARCHY_REQUIRED | hierarchy | Hierarchy level is required |
| HIERARCHY_OUT_OF_RANGE | hierarchy | Hierarchy level must be between 1 and 10 |
| HIERARCHY_SYSADMIN | hierarchy | System Administrator must be hierarchy level 1 |
| PARENT_INVALID_ID | parentRoles | Invalid parent role ID format |
| PARENT_NOT_FOUND | parentRoles | One or more parent roles do not exist |
| PARENT_CIRCULAR | parentRoles | Circular inheritance detected |
| SYSTEM_ROLE_NAME_CHANGE | name | System role name cannot be changed |
| SYSTEM_ROLE_FLAG_CHANGE | isSystem | Cannot change system role to custom role |
| SYSTEM_ROLE_DELETE | - | System roles cannot be deleted |
| ROLE_HAS_USERS | - | Cannot delete role with assigned users |
| ROLE_HAS_CHILDREN | - | Cannot delete role with child roles |
| USER_NOT_FOUND | userId | User does not exist |
| USER_INACTIVE | userId | User is not active |
| USER_LAST_ROLE | - | Cannot remove user's last active role |
| DEPARTMENT_NOT_FOUND | departmentId | Department does not exist |
| LOCATION_NOT_FOUND | locationId | Location does not exist |
| DATES_INVALID | effectiveTo | Effective end date must be after start date |
| ASSIGNMENT_EXISTS | - | User is already assigned to this role |

---

## Validation Testing

### VAL-PM-019: Unit Tests

**Priority**: HIGH
**Layer**: All

**Test Coverage**:
```typescript
describe('Role Validation', () => {
  describe('Role Name Validation', () => {
    it('should reject names shorter than 3 characters', () => {
      const result = roleNameSchema.safeParse('ab')
      expect(result.success).toBe(false)
    })

    it('should reject names longer than 100 characters', () => {
      const longName = 'a'.repeat(101)
      const result = roleNameSchema.safeParse(longName)
      expect(result.success).toBe(false)
    })

    it('should reject names with invalid characters', () => {
      const result = roleNameSchema.safeParse('Role@Name!')
      expect(result.success).toBe(false)
    })

    it('should reject reserved names', () => {
      const result = roleNameSchema.safeParse('System')
      expect(result.success).toBe(false)
    })

    it('should accept valid role names', () => {
      const result = roleNameSchema.safeParse('Restaurant Manager')
      expect(result.success).toBe(true)
    })
  })

  describe('Permission Format Validation', () => {
    it('should accept valid permission format', () => {
      const result = permissionSchema.safeParse('purchase_request:create')
      expect(result.success).toBe(true)
    })

    it('should accept resource wildcard', () => {
      const result = permissionSchema.safeParse('purchase_request:*')
      expect(result.success).toBe(true)
    })

    it('should reject invalid format', () => {
      const result = permissionSchema.safeParse('invalid-permission')
      expect(result.success).toBe(false)
    })

    it('should reject uppercase characters', () => {
      const result = permissionSchema.safeParse('PurchaseRequest:Create')
      expect(result.success).toBe(false)
    })
  })

  describe('Circular Inheritance Detection', () => {
    it('should detect direct circular inheritance', () => {
      const result = hasCircularInheritance('role-a', ['role-b'])
      // Assuming role-b has parent role-a
      expect(result).toBe(true)
    })

    it('should detect indirect circular inheritance', () => {
      const result = hasCircularInheritance('role-a', ['role-c'])
      // Assuming role-c → role-b → role-a
      expect(result).toBe(true)
    })

    it('should accept valid hierarchy', () => {
      const result = hasCircularInheritance('role-child', ['role-parent'])
      // Assuming no circular path
      expect(result).toBe(false)
    })
  })
})
```

---

### VAL-PM-020: Integration Tests

**Priority**: MEDIUM
**Layer**: Server + Database

**Test Cases**:
```typescript
describe('Role Creation Integration', () => {
  it('should create role with valid data', async () => {
    const roleData = {
      name: 'Test Manager',
      description: 'Test role',
      permissions: ['purchase_request:create'],
      hierarchy: 2
    }

    const result = await createRole(roleData)

    expect(result.success).toBe(true)
    expect(result.data.id).toBeDefined()
  })

  it('should reject duplicate role name', async () => {
    await createRole({ name: 'Duplicate Role', permissions: ['test:read'] })

    const result = await createRole({ name: 'Duplicate Role', permissions: ['test:write'] })

    expect(result.success).toBe(false)
    expect(result.errors.name).toContain('already exists')
  })

  it('should prevent circular inheritance', async () => {
    const roleA = await createRole({ name: 'Role A', permissions: ['test:a'] })
    const roleB = await createRole({ name: 'Role B', permissions: ['test:b'], parentRoles: [roleA.id] })

    const result = await updateRole(roleA.id, { parentRoles: [roleB.id] })

    expect(result.success).toBe(false)
    expect(result.errors).toContain('Circular inheritance')
  })
})
```

---

**Document Control**:
- **Created**: 2025-01-16
- **Version**: 1.0
- **Status**: Active
- **Review Cycle**: Quarterly
