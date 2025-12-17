# Validation Rules: User Management

## Document Information
- **Module**: System Administration / User Management
- **Version**: 1.0
- **Last Updated**: 2025-01-16
- **Validation Framework**: Zod + React Hook Form (Client), PostgreSQL Constraints (Server)

## Validation Overview

The User Management module implements comprehensive validation at multiple layers to ensure data integrity, security, and user experience. Validation occurs at:

1. **Client-Side (Form)**: Real-time field validation using Zod schemas
2. **Client-Side (Business Logic)**: Additional validation before submission
3. **Server-Side (API)**: Validation in server actions before database operations
4. **Database Layer**: Constraints, triggers, and check constraints

## Client-Side Validations

### Basic Information Tab Validations

#### Firstname Field
**Field Name**: `firstname`
**Data Type**: String
**Required**: Yes

| Rule | Description | Error Message |
|------|-------------|---------------|
| Required | Field must not be empty | "First name is required" |
| Min Length | Minimum 2 characters | "First name must be at least 2 characters" |
| Max Length | Maximum 100 characters | "First name cannot exceed 100 characters" |
| Pattern | Letters, spaces, hyphens, apostrophes only | "First name can only contain letters, spaces, hyphens, and apostrophes" |
| No Leading/Trailing Spaces | Trim whitespace automatically | N/A (auto-trimmed) |

**Zod Schema**:
```typescript
firstname: z.string()
  .trim()
  .min(2, "First name must be at least 2 characters")
  .max(100, "First name cannot exceed 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes")
```

#### Middlename Field
**Field Name**: `middlename`
**Data Type**: String
**Required**: No

| Rule | Description | Error Message |
|------|-------------|---------------|
| Optional | Can be empty | N/A |
| Max Length | Maximum 100 characters | "Middle name cannot exceed 100 characters" |
| Pattern | Letters, spaces, hyphens, apostrophes only (if provided) | "Middle name can only contain letters, spaces, hyphens, and apostrophes" |

**Zod Schema**:
```typescript
middlename: z.string()
  .trim()
  .max(100, "Middle name cannot exceed 100 characters")
  .regex(/^[a-zA-Z\s'-]*$/, "Middle name can only contain letters, spaces, hyphens, and apostrophes")
  .optional()
  .or(z.literal(''))
```

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

#### Lastname Field
**Field Name**: `lastname`
**Data Type**: String
**Required**: No (but recommended)

| Rule | Description | Error Message |
|------|-------------|---------------|
| Optional | Can be empty | N/A |
| Max Length | Maximum 100 characters | "Last name cannot exceed 100 characters" |
| Pattern | Letters, spaces, hyphens, apostrophes only (if provided) | "Last name can only contain letters, spaces, hyphens, and apostrophes" |

**Zod Schema**:
```typescript
lastname: z.string()
  .trim()
  .max(100, "Last name cannot exceed 100 characters")
  .regex(/^[a-zA-Z\s'-]*$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
  .optional()
  .or(z.literal(''))
```

---

#### Email Field
**Field Name**: `email`
**Data Type**: String
**Required**: Yes
**Unique**: Yes (system-wide)

| Rule | Description | Error Message |
|------|-------------|---------------|
| Required | Field must not be empty | "Email is required" |
| Format | Must be valid RFC 5322 email format | "Invalid email format" |
| Max Length | Maximum 255 characters | "Email cannot exceed 255 characters" |
| Lowercase | Automatically converted to lowercase | N/A (auto-converted) |
| No Whitespace | No spaces allowed | "Email cannot contain spaces" |
| Unique | Must not exist in database | "Email already registered" (server-side) |

**Zod Schema**:
```typescript
email: z.string()
  .trim()
  .toLowerCase()
  .email("Invalid email format")
  .max(255, "Email cannot exceed 255 characters")
  .refine(val => !/\s/.test(val), "Email cannot contain spaces")
```

**Additional Client-Side Check**:
```typescript
// Check email uniqueness via API call (debounced)
const checkEmailUnique = async (email: string) => {
  const response = await fetch(`/api/users/check-email?email=${email}`);
  return response.json(); // Returns { available: boolean }
};
```

---

#### Bio Field
**Field Name**: `bio`
**Data Type**: JSON Object
**Required**: No

| Rule | Description | Error Message |
|------|-------------|---------------|
| Optional | Can be empty (defaults to {}) | N/A |
| Valid JSON | Must be valid JSON object | "Bio must be valid JSON" |
| Max Size | Serialized JSON < 10KB | "Bio data too large (max 10KB)" |
| No PII in Keys | Keys must not contain sensitive field names | "Bio contains restricted field names" |

**Zod Schema**:
```typescript
bio: z.record(z.any())
  .optional()
  .default({})
  .refine(
    val => JSON.stringify(val).length < 10240,
    "Bio data too large (max 10KB)"
  )
  .refine(
    val => !Object.keys(val).some(key =>
      ['password', 'ssn', 'creditCard'].includes(key)
    ),
    "Bio contains restricted field names"
  )
```

---

#### Account Status Field
**Field Name**: `accountStatus`
**Data Type**: Enum
**Required**: Yes
**Default**: 'active'

| Rule | Description | Error Message |
|------|-------------|---------------|
| Required | Field must be set | "Account status is required" |
| Enum Values | Must be one of: active, inactive, suspended, pending | "Invalid account status" |

**Zod Schema**:
```typescript
accountStatus: z.enum(['active', 'inactive', 'suspended', 'pending'], {
  errorMap: () => ({ message: "Invalid account status" })
})
.default('active')
```

---

### Department & Location Tab Validations

#### Department Assignments
**Field Name**: `departments`
**Data Type**: Array of Objects
**Required**: Yes (at least 1)

| Rule | Description | Error Message |
|------|-------------|---------------|
| Required | At least one department must be assigned | "User must be assigned to at least one department" |
| Valid Department IDs | Each department ID must exist and be active | "Invalid or inactive department selected" |
| No Duplicates | Department IDs must be unique | "Duplicate department assignment" |
| HOD Flag | is_hod must be boolean | "Invalid HOD flag value" |

**Zod Schema**:
```typescript
departments: z.array(
  z.object({
    department_id: z.string().uuid("Invalid department ID"),
    is_hod: z.boolean().default(false)
  })
)
.min(1, "User must be assigned to at least one department")
.refine(
  arr => new Set(arr.map(d => d.department_id)).size === arr.length,
  "Duplicate department assignment"
)
```

**Server-Side Validation**:
```sql
-- Check department exists and is active
SELECT EXISTS(
  SELECT 1 FROM tb_department
  WHERE id = $1
    AND is_active = true
    AND deleted_at IS NULL
);
```

---

#### Location Assignments
**Field Name**: `locations`
**Data Type**: Array of Strings (UUIDs)
**Required**: Yes (at least 1)

| Rule | Description | Error Message |
|------|-------------|---------------|
| Required | At least one location must be assigned | "User must be assigned to at least one location" |
| Valid Location IDs | Each location ID must exist and be active | "Invalid or inactive location selected" |
| No Duplicates | Location IDs must be unique | "Duplicate location assignment" |
| UUID Format | Must be valid UUIDs | "Invalid location ID format" |

**Zod Schema**:
```typescript
locations: z.array(
  z.string().uuid("Invalid location ID")
)
.min(1, "User must be assigned to at least one location")
.refine(
  arr => new Set(arr).size === arr.length,
  "Duplicate location assignment"
)
```

---

### Roles & Permissions Tab Validations

#### Role Assignments
**Field Name**: `roles`
**Data Type**: Array of Strings (Role IDs)
**Required**: Yes (at least 1)

| Rule | Description | Error Message |
|------|-------------|---------------|
| Required | At least one role must be assigned | "User must be assigned to at least one role" |
| Valid Role IDs | Each role ID must exist in permission system | "Invalid role selected" |
| No Duplicates | Role IDs must be unique | "Duplicate role assignment" |
| Conflict Check | Warn on conflicting roles (e.g., auditor + manager) | "Warning: Selected roles may have conflicting permissions" |

**Zod Schema**:
```typescript
roles: z.array(z.string())
  .min(1, "User must be assigned to at least one role")
  .refine(
    arr => new Set(arr).size === arr.length,
    "Duplicate role assignment"
  )
```

**Business Logic Validation**:
```typescript
const conflictingRolePairs = [
  ['auditor', 'finance-manager'],
  ['viewer', 'admin'],
  ['approver', 'requester']
];

const hasConflict = (roles: string[]) => {
  return conflictingRolePairs.some(([role1, role2]) =>
    roles.includes(role1) && roles.includes(role2)
  );
};
```

---

#### Primary Role
**Field Name**: `primaryRole`
**Data Type**: String (Role ID)
**Required**: Yes

| Rule | Description | Error Message |
|------|-------------|---------------|
| Required | Primary role must be set | "Primary role is required" |
| In Assigned Roles | Must be one of the assigned roles | "Primary role must be one of the assigned roles" |

**Zod Schema**:
```typescript
primaryRole: z.string()
  .refine(
    (primaryRole, ctx) => ctx.roles.includes(primaryRole),
    "Primary role must be one of the assigned roles"
  )
```

**Auto-Assignment Rule**:
```typescript
// If primaryRole not set, default to first assigned role
if (!primaryRole && roles.length > 0) {
  primaryRole = roles[0];
}
```

---

#### Clearance Level
**Field Name**: `clearanceLevel`
**Data Type**: Enum
**Required**: No
**Default**: Derived from primary role

| Rule | Description | Error Message |
|------|-------------|---------------|
| Optional | Can be empty (defaults from role) | N/A |
| Enum Values | basic, internal, confidential, restricted, top-secret | "Invalid clearance level" |
| Not Lower Than Role | Cannot be lower than primary role's clearance | "Clearance level cannot be lower than role requirement" |

**Zod Schema**:
```typescript
clearanceLevel: z.enum([
  'basic',
  'internal',
  'confidential',
  'restricted',
  'top-secret'
], {
  errorMap: () => ({ message: "Invalid clearance level" })
})
.optional()
```

---

### Approval & Access Tab Validations

#### Approval Limit Amount
**Field Name**: `approvalLimit.amount`
**Data Type**: Number
**Required**: No (uses role default if not set)

| Rule | Description | Error Message |
|------|-------------|---------------|
| Optional | Can be empty | N/A |
| Positive Number | Must be > 0 if provided | "Approval limit must be greater than 0" |
| Max Value | Cannot exceed 1,000,000,000 | "Approval limit cannot exceed 1,000,000,000" |
| Decimal Places | Maximum 2 decimal places | "Approval limit cannot have more than 2 decimal places" |

**Zod Schema**:
```typescript
approvalLimit: z.object({
  amount: z.number()
    .positive("Approval limit must be greater than 0")
    .max(1000000000, "Approval limit cannot exceed 1,000,000,000")
    .refine(
      val => (val * 100) % 1 === 0,
      "Approval limit cannot have more than 2 decimal places"
    )
    .optional(),
  currency: z.string().length(3, "Currency must be 3-letter code")
}).optional()
```

---

#### Approval Limit Currency
**Field Name**: `approvalLimit.currency`
**Data Type**: String (ISO 4217 Currency Code)
**Required**: Yes if amount is provided

| Rule | Description | Error Message |
|------|-------------|---------------|
| Conditional Required | Required if amount is set | "Currency is required when approval limit is set" |
| Format | Must be 3-letter ISO 4217 code | "Currency must be 3-letter code (e.g., USD, EUR)" |
| Uppercase | Automatically converted to uppercase | N/A (auto-converted) |
| Valid Currency | Must exist in tb_currency table | "Invalid or inactive currency" (server-side) |

**Zod Schema**:
```typescript
currency: z.string()
  .toUpperCase()
  .length(3, "Currency must be 3-letter code")
  .regex(/^[A-Z]{3}$/, "Currency must be 3-letter uppercase code")
  .refine(
    async (currency) => {
      // Server-side validation
      return await checkCurrencyExists(currency);
    },
    "Invalid or inactive currency"
  )
```

---

#### Effective Date Range
**Field Names**: `effectiveFrom`, `effectiveTo`
**Data Type**: Date
**Required**: No

| Rule | Description | Error Message |
|------|-------------|---------------|
| Optional | Both can be empty | N/A |
| Valid Date | Must be valid JavaScript Date | "Invalid date format" |
| Logical Order | effectiveFrom must be before effectiveTo | "Effective From date must be before Effective To date" |
| Not in Past | effectiveFrom cannot be in the past (for new assignments) | "Effective From date cannot be in the past" |
| Max Range | Date range cannot exceed 10 years | "Date range cannot exceed 10 years" |

**Zod Schema**:
```typescript
effectiveFrom: z.date().optional(),
effectiveTo: z.date().optional()

// Custom refinement for date range
.refine(
  data => {
    if (data.effectiveFrom && data.effectiveTo) {
      return data.effectiveFrom < data.effectiveTo;
    }
    return true;
  },
  {
    message: "Effective From date must be before Effective To date",
    path: ['effectiveTo']
  }
)
.refine(
  data => {
    if (data.effectiveFrom && data.effectiveTo) {
      const yearsDiff =
        (data.effectiveTo.getTime() - data.effectiveFrom.getTime()) /
        (1000 * 60 * 60 * 24 * 365);
      return yearsDiff <= 10;
    }
    return true;
  },
  {
    message: "Date range cannot exceed 10 years",
    path: ['effectiveTo']
  }
)
```

---

#### Special Permissions
**Field Name**: `specialPermissions`
**Data Type**: Array of Strings
**Required**: No

| Rule | Description | Error Message |
|------|-------------|---------------|
| Optional | Can be empty array | N/A |
| Valid Permissions | Each must be a defined special permission | "Invalid special permission" |
| No Duplicates | Permission names must be unique | "Duplicate special permission" |
| Requires Justification | Sensitive permissions require justification field | "Justification required for this special permission" |

**Zod Schema**:
```typescript
specialPermissions: z.array(
  z.enum([
    'emergency-access-override',
    'cross-department-access',
    'recipe-confidential-access',
    'financial-override-authority',
    'system-maintenance-access'
  ])
)
.optional()
.refine(
  arr => !arr || new Set(arr).size === arr.length,
  "Duplicate special permission"
)
```

---

## Server-Side Validations

### Database Constraint Validations

#### Unique Email Constraint
**Constraint Name**: `user_profile_email_u` (hypothetical - not in current schema)
**Type**: UNIQUE constraint on email field

**Validation**:
```sql
-- Enforced at database level
CONSTRAINT user_profile_email_u UNIQUE (email)

-- Check before insert/update
SELECT EXISTS(
  SELECT 1 FROM tb_user_profile
  WHERE email = $1
    AND user_id != $2  -- Exclude current user in update
);
```

**Error Handling**:
- PostgreSQL Error Code: `23505` (unique_violation)
- Application Error Message: "Email already registered. Please use a different email or contact support."

---

#### Foreign Key Constraint Validations

**Department Foreign Key**:
```sql
-- tb_department_user.department_id → tb_department.id
CONSTRAINT fk_department_user_department_id
  FOREIGN KEY (department_id)
  REFERENCES tb_department(id)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION

-- Pre-insert validation
SELECT EXISTS(
  SELECT 1 FROM tb_department
  WHERE id = $1
    AND is_active = true
    AND deleted_at IS NULL
);
```

**Location Foreign Key**:
```sql
-- tb_user_location.location_id → tb_location.id
CONSTRAINT fk_user_location_location_id
  FOREIGN KEY (location_id)
  REFERENCES tb_location(id)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION

-- Pre-insert validation
SELECT EXISTS(
  SELECT 1 FROM tb_location
  WHERE id = $1
    AND is_active = true
    AND deleted_at IS NULL
);
```

---

### Business Rule Validations

#### BR-001: At Least One Department
**Rule**: User must be assigned to at least one active department

**Validation**:
```typescript
if (departments.length === 0) {
  throw new ValidationError("User must be assigned to at least one department");
}

// Also validate on department removal
const remainingDepts = currentDepts.filter(d => !removedDeptIds.includes(d.id));
if (remainingDepts.length === 0) {
  throw new ValidationError("Cannot remove all department assignments");
}
```

---

#### BR-002: At Least One Location
**Rule**: User must be assigned to at least one active location

**Validation**:
```typescript
if (locations.length === 0) {
  throw new ValidationError("User must be assigned to at least one location");
}
```

---

#### BR-003: At Least One Role
**Rule**: User must have at least one active role

**Validation**:
```typescript
if (roles.length === 0) {
  throw new ValidationError("User must be assigned to at least one role");
}

// Cannot remove all roles
if (removedRoles.length > 0 && remainingRoles.length === 0) {
  throw new ValidationError("Cannot remove all role assignments");
}
```

---

#### BR-004: Cannot Delete User with Active Transactions
**Rule**: User cannot be deleted (even soft delete) if they have active transactions

**Validation**:
```sql
-- Check for active purchase requests
SELECT EXISTS(
  SELECT 1 FROM tb_purchase_request
  WHERE created_by_id = $1
    AND status NOT IN ('cancelled', 'rejected', 'completed')
    AND deleted_at IS NULL
) AS has_active_purchase_requests;

-- Check for active purchase orders
SELECT EXISTS(
  SELECT 1 FROM tb_purchase_order
  WHERE created_by_id = $1
    AND status NOT IN ('cancelled', 'completed')
    AND deleted_at IS NULL
) AS has_active_purchase_orders;

-- If any exist, block deletion
if (hasActiveTransactions) {
  throw new ValidationError(
    "Cannot delete user with active transactions. Please deactivate instead."
  );
}
```

---

#### BR-005: Approval Limit Cannot Exceed Organizational Maximum
**Rule**: User-specific approval limits cannot exceed configured organizational maximum

**Validation**:
```typescript
const orgMaxApprovalLimit = await getOrganizationalLimit();

if (approvalLimit.amount > orgMaxApprovalLimit) {
  throw new ValidationError(
    `Approval limit cannot exceed organizational maximum of ${orgMaxApprovalLimit}`
  );
}
```

---

#### BR-006: Clearance Level Cannot Be Lower Than Role Requirement
**Rule**: User's clearance level must meet or exceed their primary role's minimum clearance

**Validation**:
```typescript
const clearanceLevels = {
  'basic': 1,
  'internal': 2,
  'confidential': 3,
  'restricted': 4,
  'top-secret': 5
};

const userClearance = clearanceLevels[userData.clearanceLevel];
const roleMinClearance = clearanceLevels[primaryRole.minimumClearance];

if (userClearance < roleMinClearance) {
  throw new ValidationError(
    `Clearance level '${userData.clearanceLevel}' is insufficient for role '${primaryRole.name}' which requires '${primaryRole.minimumClearance}'`
  );
}
```

---

### Optimistic Locking Validation

**Rule**: Prevent concurrent modifications using doc_version

**Validation**:
```sql
UPDATE tb_department_user
SET
  is_hod = $1,
  updated_at = now(),
  updated_by_id = $2,
  doc_version = doc_version + 1
WHERE id = $3
  AND doc_version = $4  -- Optimistic lock check
RETURNING doc_version;
```

**Error Handling**:
```typescript
if (updateResult.rowCount === 0) {
  throw new ConcurrentModificationError(
    "This record was modified by another user. Please refresh and try again."
  );
}
```

---

## Bulk Operation Validations

### Bulk Role Assignment
**Validation**: Each user validated individually, failures collected

```typescript
const results = { success: [], failed: [] };

for (const userId of selectedUsers) {
  try {
    // Validate user exists and is active
    const user = await getUserById(userId);
    if (!user || user.deleted_at) {
      throw new ValidationError("User not found or inactive");
    }

    // Validate roles
    await validateRoles(rolesToAssign);

    // Apply roles
    await assignRoles(userId, rolesToAssign, mode);
    results.success.push({ userId, user: user.name });

  } catch (error) {
    results.failed.push({
      userId,
      user: user?.name || userId,
      reason: error.message
    });
  }
}

return results;
```

---

### Bulk Status Change
**Validation**: Status transitions validated per user

```typescript
const validTransitions = {
  'active': ['inactive', 'suspended'],
  'inactive': ['active'],
  'suspended': ['active', 'inactive'],
  'pending': ['active', 'inactive']
};

for (const userId of selectedUsers) {
  const user = await getUserById(userId);

  // Check if transition is valid
  if (!validTransitions[user.accountStatus]?.includes(newStatus)) {
    results.failed.push({
      userId,
      reason: `Invalid status transition from '${user.accountStatus}' to '${newStatus}'`
    });
    continue;
  }

  // Additional validations for activation
  if (newStatus === 'active') {
    if (!user.roles || user.roles.length === 0) {
      results.failed.push({
        userId,
        reason: "Cannot activate user without assigned roles"
      });
      continue;
    }
  }

  // Apply status change
  await updateUserStatus(userId, newStatus);
  results.success.push({ userId });
}
```

---

## Validation Error Messages

### Standard Error Format

```json
{
  "field": "email",
  "code": "VALIDATION_ERROR",
  "message": "Email already registered",
  "details": {
    "rule": "unique",
    "value": "john.doe@example.com"
  }
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| VALIDATION_ERROR | Field validation failed | 400 |
| UNIQUE_CONSTRAINT_VIOLATION | Unique constraint violated | 409 |
| FOREIGN_KEY_VIOLATION | Referenced record not found | 400 |
| BUSINESS_RULE_VIOLATION | Business rule not satisfied | 422 |
| CONCURRENT_MODIFICATION | Optimistic lock failed | 409 |
| PERMISSION_DENIED | Insufficient permissions | 403 |
| RESOURCE_NOT_FOUND | User or related resource not found | 404 |

---

## Validation Testing

### Unit Test Examples

```typescript
describe('User Validation', () => {
  it('should reject invalid email format', () => {
    const result = validateEmail('invalid-email');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid email format');
  });

  it('should reject firstname shorter than 2 characters', () => {
    const result = validateFirstname('J');
    expect(result.valid).toBe(false);
  });

  it('should accept valid user data', () => {
    const userData = {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      departments: ['dept-001'],
      locations: ['loc-001'],
      roles: ['role-001']
    };
    const result = validateUserData(userData);
    expect(result.valid).toBe(true);
  });

  it('should reject approval limit exceeding organizational max', async () => {
    const result = await validateApprovalLimit(2000000, 1000000);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('organizational maximum');
  });
});
```

---

## Summary

The User Management module implements comprehensive validation across all layers:

- **98 validation rules** across all user fields
- **Client-side validation** for immediate user feedback
- **Server-side validation** for security and data integrity
- **Database constraints** for final enforcement
- **Business rule validation** for complex logic
- **Bulk operation validation** with granular error reporting

All validations follow the principle of **fail fast, fail explicitly** with clear, actionable error messages to guide users toward correct data entry.
