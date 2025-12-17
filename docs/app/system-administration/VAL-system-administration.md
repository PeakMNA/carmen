# VAL-SYSADMIN: System Administration Validation Rules

**Module**: System Administration
**Sub-Module**: ABAC Permission Management, User Management, Workflow Configuration
**Document Type**: Validations (VAL)
**Version**: 1.0.0
**Last Updated**: 2025-11-13
**Status**: Draft

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

### 1.1 Purpose

This document defines comprehensive validation rules for the System Administration module to ensure permission system integrity, prevent security vulnerabilities, and maintain consistent access control across the hospitality ERP system. Critical validations include policy logic correctness, role hierarchy integrity, user attribute consistency, and workflow routing rules. Invalid permission data can result in unauthorized access, security breaches, failed workflows, and system unavailability.

### 1.2 Scope

This document defines validation rules across three layers:
- **Client-Side**: Immediate user feedback and UX validation
- **Server-Side**: Security and business rule enforcement
- **Database**: Final data integrity constraints

### 1.3 Validation Strategy

```
User Input
    ↓
[Client-Side Validation] ← Immediate feedback, UX
    ↓
[Server-Side Validation] ← Security, business rules
    ↓
[Database Constraints] ← Final enforcement
    ↓
Data Stored
```

**Validation Principles**:
1. Never trust client-side data - always validate on server
2. Permission data requires strictest validation (zero tolerance for security errors)
3. Provide immediate user feedback when possible
4. Use clear, actionable error messages
5. Prevent security vulnerabilities (JSON injection, XSS, ABAC bypass)
6. Enforce role hierarchy and permission inheritance rules consistently
7. Validate JSON structure and content for all policy and attribute data

---

## 2. Field-Level Validations (VAL-SYSADMIN-001 to 099)

### VAL-SYSADMIN-001: policy_name - Required & Uniqueness Validation

**Field**: `name`
**Database Column**: `abac_policies.name`
**Data Type**: VARCHAR(255) / string

**Validation Rule**: Policy name is mandatory, must be unique globally, minimum 5 characters, maximum 255 characters.

**Implementation Requirements**:
- **Client-Side**: Show character counter (5-255), async uniqueness check on blur (debounced 500ms)
- **Server-Side**: Trim whitespace, check length, verify uniqueness (case-sensitive)
- **Database**: VARCHAR(255) NOT NULL UNIQUE, CHECK length >= 5

**Error Codes**:
- VAL-SYSADMIN-001A: "Policy name is required"
- VAL-SYSADMIN-001B: "Policy name must be at least 5 characters"
- VAL-SYSADMIN-001C: "Policy name cannot exceed 255 characters"
- VAL-SYSADMIN-001D: "Policy name '{name}' already exists"

**User Action**: Provide unique, meaningful policy name describing the permission rule.

**Test Cases**:
- ✅ Valid: "Kitchen Manager Purchase Approval Policy"
- ✅ Valid: "Executive Budget Override Policy"
- ❌ Invalid: "test" (too short)
- ❌ Invalid: Duplicate name
- ❌ Invalid: "" (empty)

---

### VAL-SYSADMIN-002: priority - Range & Uniqueness Validation

**Field**: `priority`
**Database Column**: `abac_policies.priority`
**Data Type**: INTEGER / number

**Validation Rule**: Priority must be between 0 and 1000, must be unique across active policies. Lower number = higher priority.

**Implementation Requirements**:
- **Client-Side**: Number input with min=0, max=1000, show priority explanation
- **Server-Side**: Validate range, check uniqueness among status IN ('DRAFT', 'ACTIVE', 'INACTIVE')
- **Database**: INTEGER NOT NULL DEFAULT 500, CHECK BETWEEN 0 AND 1000

**Error Codes**:
- VAL-SYSADMIN-002A: "Priority must be between 0 and 1000"
- VAL-SYSADMIN-002B: "Priority {n} already exists in active policies"
- VAL-SYSADMIN-002C: "Priority is required"

**Priority Guidelines**:
- 0-99: System-critical policies (admin, emergency access)
- 100-299: High-priority policies (management, financial controls)
- 300-699: Standard policies (departmental, operational)
- 700-900: Low-priority policies (general access, read-only)
- 901-1000: Default/catch-all policies

**Test Cases**:
- ✅ Valid: 0 (highest priority)
- ✅ Valid: 500 (default)
- ✅ Valid: 1000 (lowest priority)
- ❌ Invalid: -1 (below minimum)
- ❌ Invalid: 1001 (above maximum)
- ❌ Invalid: 100 (if already exists)

---

### VAL-SYSADMIN-003: policy_effect - Enum Validation

**Field**: `effect`
**Database Column**: `abac_policies.effect`
**Data Type**: PolicyEffect enum

**Validation Rule**: Effect must be exactly "PERMIT" or "DENY" (case-sensitive).

**Implementation Requirements**:
- **Client-Side**: Radio button group with two options only
- **Server-Side**: Validate against enum values, case-sensitive match
- **Database**: PolicyEffect enum ('PERMIT', 'DENY')

**Error Code**: VAL-SYSADMIN-003
**Error Message**: "Policy effect must be 'PERMIT' or 'DENY'"

**Test Cases**:
- ✅ Valid: "PERMIT"
- ✅ Valid: "DENY"
- ❌ Invalid: "permit" (wrong case)
- ❌ Invalid: "ALLOW" (not in enum)
- ❌ Invalid: "" (empty)

---

### VAL-SYSADMIN-004: combining_algorithm - Enum Validation

**Field**: `combiningAlgorithm`
**Database Column**: `abac_policies.combining_algorithm`
**Data Type**: CombiningAlgorithm enum

**Validation Rule**: Combining algorithm must be one of: DENY_OVERRIDES, PERMIT_OVERRIDES, FIRST_APPLICABLE, ONLY_ONE_APPLICABLE.

**Implementation Requirements**:
- **Client-Side**: Dropdown with descriptions for each algorithm
- **Server-Side**: Validate against enum, provide default DENY_OVERRIDES if not specified
- **Database**: CombiningAlgorithm enum

**Algorithm Descriptions**:
- **DENY_OVERRIDES**: Any DENY result overrides all PERMIT results (most secure)
- **PERMIT_OVERRIDES**: Any PERMIT result overrides all DENY results (most permissive)
- **FIRST_APPLICABLE**: Use result of first matching policy
- **ONLY_ONE_APPLICABLE**: Error if multiple policies match (strictest)

**Error Code**: VAL-SYSADMIN-004
**Error Message**: "Combining algorithm must be one of: DENY_OVERRIDES, PERMIT_OVERRIDES, FIRST_APPLICABLE, ONLY_ONE_APPLICABLE"

**Test Cases**:
- ✅ Valid: "DENY_OVERRIDES"
- ✅ Valid: "PERMIT_OVERRIDES"
- ❌ Invalid: "deny_overrides" (wrong case)
- ❌ Invalid: "ALLOW_OVERRIDES" (not in enum)

---

### VAL-SYSADMIN-005: policy_data - JSON Structure Validation

**Field**: `policyData`
**Database Column**: `abac_policies.policy_data`
**Data Type**: JSONB / object

**Validation Rule**: Policy data must be valid JSON with required structure: target, rules, obligations, advice.

**Required JSON Structure**:
```json
{
  "target": {
    "subject": { /* role, department, attributes */ },
    "resource": { /* type, category, attributes */ },
    "action": "string",
    "environment": { /* time, location, conditions */ }
  },
  "rules": [
    {
      "ruleId": "string",
      "condition": "string",
      "effect": "PERMIT | DENY"
    }
  ],
  "obligations": [ /* optional */ ],
  "advice": [ /* optional */ ]
}
```

**Implementation Requirements**:
- **Client-Side**: JSON editor with syntax highlighting, validation on change
- **Server-Side**: Parse JSON, validate structure, verify required fields, check rule conditions are valid expressions
- **Database**: JSONB type with GIN index

**Error Codes**:
- VAL-SYSADMIN-005A: "Policy data must be valid JSON"
- VAL-SYSADMIN-005B: "Policy data must contain 'target' object"
- VAL-SYSADMIN-005C: "Policy data must contain 'rules' array with at least one rule"
- VAL-SYSADMIN-005D: "Rule condition '{condition}' is not a valid expression"

**Test Cases**:
- ✅ Valid: Properly structured JSON with target and rules
- ❌ Invalid: Malformed JSON syntax
- ❌ Invalid: Missing target object
- ❌ Invalid: Empty rules array
- ❌ Invalid: Rule condition with SQL injection attempt

---

### VAL-SYSADMIN-006: role_name - Required & Uniqueness Validation

**Field**: `name`
**Database Column**: `abac_roles.name`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: Role name is mandatory, must be unique globally, 3-100 characters, alphanumeric with hyphens only.

**Format**: Lowercase alphanumeric with hyphens (kebab-case), e.g., "kitchen-manager", "sous-chef"

**Implementation Requirements**:
- **Client-Side**: Pattern validation on blur, show format hint, async uniqueness check
- **Server-Side**: Validate pattern ^[a-z0-9-]+$, check uniqueness (case-insensitive), convert to lowercase
- **Database**: VARCHAR(100) NOT NULL UNIQUE, CHECK pattern

**Error Codes**:
- VAL-SYSADMIN-006A: "Role name is required"
- VAL-SYSADMIN-006B: "Role name must be 3-100 characters"
- VAL-SYSADMIN-006C: "Role name must be lowercase alphanumeric with hyphens only"
- VAL-SYSADMIN-006D: "Role name '{name}' already exists"

**Test Cases**:
- ✅ Valid: "kitchen-manager"
- ✅ Valid: "sous-chef"
- ❌ Invalid: "Kitchen Manager" (spaces)
- ❌ Invalid: "chef@123" (special characters)
- ❌ Invalid: "km" (too short)

---

### VAL-SYSADMIN-007: role_level - Range Validation

**Field**: `level`
**Database Column**: `abac_roles.level`
**Data Type**: INTEGER / number

**Validation Rule**: Role level must be between 0 and 10. Root roles have level 0, maximum hierarchy depth is 10.

**Implementation Requirements**:
- **Client-Side**: Calculate automatically based on parent role (parent.level + 1)
- **Server-Side**: Validate level matches parent.level + 1 (if parent exists), ensure level <= 10
- **Database**: INTEGER NOT NULL DEFAULT 0, CHECK BETWEEN 0 AND 10

**Error Codes**:
- VAL-SYSADMIN-007A: "Role level must be between 0 and 10"
- VAL-SYSADMIN-007B: "Role level must be parent level + 1"
- VAL-SYSADMIN-007C: "Maximum role hierarchy depth (10 levels) exceeded"

**Test Cases**:
- ✅ Valid: 0 (root role)
- ✅ Valid: 3 (if parent level = 2)
- ❌ Invalid: 11 (exceeds maximum)
- ❌ Invalid: 5 (if parent level = 2, should be 3)

---

### VAL-SYSADMIN-008: user_email - Format & Uniqueness Validation

**Field**: `email`
**Database Column**: `abac_users.email`
**Data Type**: VARCHAR(255) / string

**Validation Rule**: Email must be valid format, unique globally, maximum 255 characters.

**Format Pattern**: RFC 5322 compliant email address

**Implementation Requirements**:
- **Client-Side**: Email input type, pattern validation on blur, async uniqueness check
- **Server-Side**: Validate format with comprehensive regex, check uniqueness (case-insensitive), convert to lowercase
- **Database**: VARCHAR(255) NOT NULL UNIQUE, CHECK format

**Error Codes**:
- VAL-SYSADMIN-008A: "Email address is required"
- VAL-SYSADMIN-008B: "Email address must be valid format"
- VAL-SYSADMIN-008C: "Email address '{email}' already exists"

**Test Cases**:
- ✅ Valid: "john.smith@example.com"
- ✅ Valid: "chef+kitchen@hotel.com"
- ❌ Invalid: "notanemail" (missing @)
- ❌ Invalid: "@example.com" (missing local part)
- ❌ Invalid: "user@" (missing domain)

---

### VAL-SYSADMIN-009: approval_limit - Range Validation

**Field**: `approvalLimit`
**Database Column**: User role data JSON
**Data Type**: NUMERIC(15,2) / number

**Validation Rule**: Approval limit must be >= 0, maximum 999,999,999.99, cannot exceed role's maximum approval limit.

**Implementation Requirements**:
- **Client-Side**: Currency input, show role's max limit, warn if approaching limit
- **Server-Side**: Validate range, compare with role.roleData.approvalLimit, reject if exceeds
- **Database**: NUMERIC(15,2) in JSON, validation via trigger

**Error Codes**:
- VAL-SYSADMIN-009A: "Approval limit must be greater than or equal to zero"
- VAL-SYSADMIN-009B: "Approval limit cannot exceed ${max}"
- VAL-SYSADMIN-009C: "Approval limit ${amount} exceeds role limit ${roleLimit}"

**Test Cases**:
- ✅ Valid: 5000.00 (if role limit = 10000.00)
- ✅ Valid: 0.00 (no approval authority)
- ❌ Invalid: -100.00 (negative)
- ❌ Invalid: 15000.00 (if role limit = 10000.00)

---

### VAL-SYSADMIN-010: cache_ttl - Range Validation

**Field**: `ttl`
**Database Column**: `abac_permission_cache.ttl`
**Data Type**: INTEGER / number

**Validation Rule**: Cache TTL (time-to-live) must be between 60 and 3600 seconds (1 minute to 1 hour).

**Implementation Requirements**:
- **Client-Side**: Number input with min=60, max=3600, show as minutes:seconds
- **Server-Side**: Validate range, provide default 900 (15 minutes) if not specified
- **Database**: INTEGER NOT NULL DEFAULT 900

**Error Codes**:
- VAL-SYSADMIN-010A: "Cache TTL must be between 60 and 3600 seconds"
- VAL-SYSADMIN-010B: "Cache TTL is required"

**Test Cases**:
- ✅ Valid: 60 (1 minute)
- ✅ Valid: 900 (15 minutes - default)
- ✅ Valid: 3600 (1 hour)
- ❌ Invalid: 30 (below minimum)
- ❌ Invalid: 7200 (above maximum)

---

## 3. Business Rule Validations (VAL-SYSADMIN-101 to 199)

### VAL-SYSADMIN-101: Policy Status Transition Rules

**Validation Rule**: Policy status transitions must follow valid state machine: DRAFT → ACTIVE → INACTIVE → ARCHIVED. Cannot skip states.

**Valid Transitions**:
- DRAFT → ACTIVE (requires test scenarios to pass)
- ACTIVE → INACTIVE (immediate effect, cache invalidated)
- INACTIVE → ACTIVE (reactivation, cache invalidated)
- ACTIVE → ARCHIVED (permanent)
- INACTIVE → ARCHIVED (permanent)
- DELETE: Only DRAFT or INACTIVE (with no references)

**Implementation Requirements**:
- **Client-Side**: Show only valid status transitions based on current status
- **Server-Side**: Validate transition rules, verify test scenarios pass for DRAFT → ACTIVE, check no references for DELETE
- **Database**: Trigger to validate transitions, prevent skipping states

**Error Codes**:
- VAL-SYSADMIN-101A: "Cannot transition from {current} to {new} status"
- VAL-SYSADMIN-101B: "Policy activation requires all test scenarios to pass (current: {passed}/{total})"
- VAL-SYSADMIN-101C: "Cannot delete policy - it is referenced by {count} access requests"

**Test Cases**:
- ✅ Valid: DRAFT → ACTIVE (tests pass)
- ✅ Valid: ACTIVE → INACTIVE
- ✅ Valid: INACTIVE → ACTIVE
- ❌ Invalid: DRAFT → ARCHIVED (skipping states)
- ❌ Invalid: ACTIVE → ACTIVE (no change)
- ❌ Invalid: ARCHIVED → ACTIVE (archived is final)

---

### VAL-SYSADMIN-102: Role Hierarchy Integrity

**Validation Rule**: Role hierarchy must maintain integrity - no circular references, maximum depth 10 levels, parent must exist.

**Hierarchy Rules**:
1. Parent role must exist if parentId is specified
2. Parent role must be active
3. Level must equal parent.level + 1
4. Path must be parent.path + "/" + name
5. No circular references (role cannot be its own ancestor)
6. Maximum depth 10 levels

**Implementation Requirements**:
- **Client-Side**: Disable self and descendants in parent dropdown, show hierarchy tree
- **Server-Side**: Validate parent exists and active, check circular reference with recursive query, validate level and path
- **Database**: CHECK constraints, recursive CTE validation in trigger

**Error Codes**:
- VAL-SYSADMIN-102A: "Parent role '{id}' does not exist"
- VAL-SYSADMIN-102B: "Parent role must be active"
- VAL-SYSADMIN-102C: "Circular reference detected - role cannot be its own ancestor"
- VAL-SYSADMIN-102D: "Maximum hierarchy depth (10 levels) exceeded"
- VAL-SYSADMIN-102E: "Role level must be {expected} (parent level + 1)"
- VAL-SYSADMIN-102F: "Role path must be '{expected}'"

**Test Cases**:
- ✅ Valid: Parent "chef" (level 1) → Child "sous-chef" (level 2)
- ✅ Valid: Root role with no parent (level 0)
- ❌ Invalid: Parent = self
- ❌ Invalid: Parent = own descendant
- ❌ Invalid: Level 10 role with parent (would create level 11)

---

### VAL-SYSADMIN-103: Single Primary Role Per User

**Validation Rule**: Each user must have exactly one primary role (isPrimary = true). When assigning new primary role, previous primary must be unset.

**Implementation Requirements**:
- **Client-Side**: Show confirmation dialog when changing primary role, highlight current primary
- **Server-Side**: When isPrimary = true, query for existing primary, unset previous primary atomically in transaction
- **Database**: Partial unique index: UNIQUE (user_id, isPrimary) WHERE isPrimary = true

**Error Codes**:
- VAL-SYSADMIN-103A: "User must have at least one role with isPrimary = true"
- VAL-SYSADMIN-103B: "User already has primary role '{roleName}'. Confirm change?"

**Transaction Flow**:
1. BEGIN TRANSACTION
2. Verify user has at least one role assignment
3. If isPrimary = true: UPDATE existing primary to isPrimary = false
4. INSERT/UPDATE new assignment with isPrimary = true
5. COMMIT

**Test Cases**:
- ✅ Valid: User has exactly one isPrimary = true
- ✅ Valid: Changing primary from "chef" to "kitchen-manager"
- ❌ Invalid: No primary role assignments
- ❌ Invalid: Two or more primary roles simultaneously

---

### VAL-SYSADMIN-104: Approval Limit Enforcement

**Validation Rule**: User's approval limit cannot exceed their role's maximum approval limit. Role's approval limit enforced across all user assignments.

**Implementation Requirements**:
- **Client-Side**: Show role limit when setting user limit, validate before submit
- **Server-Side**: Query role's roleData.approvalLimit, compare with user's limit, reject if exceeds
- **Database**: Validation function called by trigger

**Error Code**: VAL-SYSADMIN-104
**Error Message**: "User approval limit ${userLimit} exceeds role maximum ${roleLimit}. Please reduce to ${roleLimit} or less"

**Business Justification**: Ensures users cannot be granted approval authority beyond their role's authorized limits, maintaining financial controls.

**Test Cases**:
- ✅ Valid: User limit $5,000, Role limit $10,000
- ✅ Valid: User limit $10,000, Role limit $10,000 (equal)
- ❌ Invalid: User limit $15,000, Role limit $10,000

---

### VAL-SYSADMIN-105: Subscription Limit Enforcement

**Validation Rule**: System must prevent operations that would exceed subscription limits for users, locations, policies, roles, etc.

**Monitored Limits**:
- maxUsers: Maximum active user accounts
- maxLocations: Maximum locations
- maxDepartments: Maximum departments
- maxPolicies: Maximum active policies
- maxRoles: Maximum roles
- maxResourceTypes: Maximum resource type definitions

**Implementation Requirements**:
- **Client-Side**: Show usage meters (e.g., "25 of 50 users"), warn when approaching limit (>90%)
- **Server-Side**: Check current count + 1 <= limit before allowing creation, provide clear error with upgrade path
- **Database**: Validation function checking subscription config

**Error Codes**:
- VAL-SYSADMIN-105A: "User limit reached ({current}/{max}). Please upgrade subscription or deactivate unused accounts"
- VAL-SYSADMIN-105B: "Policy limit reached ({current}/{max}). Please archive inactive policies or upgrade subscription"
- VAL-SYSADMIN-105C: "Role limit reached ({current}/{max}). Please upgrade subscription"

**Test Cases**:
- ✅ Valid: Creating 25th user when limit = 50
- ✅ Valid: Creating 50th user when limit = 50
- ❌ Invalid: Creating 51st user when limit = 50

---

### VAL-SYSADMIN-106: Policy Evaluation Performance Budget

**Validation Rule**: Policy evaluation must complete within performance budget: <50ms cached, <200ms non-cached, <5 seconds absolute timeout.

**Implementation Requirements**:
- **Client-Side**: Show loading spinner if evaluation >500ms
- **Server-Side**: Track evaluation time, log slow evaluations, timeout after 5 seconds
- **Database**: Metrics table tracking evaluation times

**Error Code**: VAL-SYSADMIN-106
**Error Message**: "Policy evaluation timeout ({elapsed}ms). This may indicate a performance issue. Please contact administrator"

**Performance Thresholds**:
- **Target**: <50ms (cached), <200ms (non-cached)
- **Acceptable**: <100ms (cached), <500ms (non-cached)
- **Warning**: >500ms
- **Error**: >5000ms (timeout)

**Automatic Actions**:
- Log slow evaluations (>500ms) with full context
- Alert administrator if average evaluation time >300ms
- Suggest cache optimization if hit rate <70%

---

### VAL-SYSADMIN-107: Cache Hit Rate Threshold

**Validation Rule**: Permission cache hit rate must maintain >70% target, >80% optimal. System alerts when hit rate <70% for 1 hour.

**Implementation Requirements**:
- **Client-Side**: Display cache statistics dashboard (hit rate, size, evictions)
- **Server-Side**: Track cache hits/misses, calculate rolling average hit rate, alert when <70%
- **Database**: Metrics table with hourly aggregation

**Error Code**: VAL-SYSADMIN-107
**Error Message**: "Cache hit rate ({rate}%) below optimal threshold. Consider increasing cache size or TTL"

**Optimization Actions**:
- Increase cache size if hit rate <70% and evictions high
- Increase TTL if hit rate <70% and many expired entries
- Review policy complexity if evaluation times consistently high

---

### VAL-SYSADMIN-108: Workflow Stage Assignment Validity

**Validation Rule**: Users can only be assigned to workflow stages within their authorized departments and locations.

**Implementation Requirements**:
- **Client-Side**: Filter user dropdown by department/location match
- **Server-Side**: Verify user has access to stage's department and location
- **Database**: Validation function checking user assignments

**Error Code**: VAL-SYSADMIN-108
**Error Message**: "User '{name}' does not have access to department '{dept}' or location '{loc}'. Cannot assign to this workflow stage"

**Assignment Requirements**:
- User must have role assignment scoped to stage's department (or no scope = all departments)
- User must have role assignment scoped to stage's location (or no scope = all locations)
- User must have appropriate role type (approver, reviewer)
- User's approval limit must be sufficient for expected transaction amounts

**Test Cases**:
- ✅ Valid: User assigned to "Kitchen" dept, stage requires "Kitchen" dept
- ✅ Valid: User has no department scope (all departments)
- ❌ Invalid: User assigned to "Kitchen" dept, stage requires "F&B" dept
- ❌ Invalid: User assigned to "Main Location", stage requires "Branch Location"

---

### VAL-SYSADMIN-109: Attribute Data Type Consistency

**Validation Rule**: Attribute values must match declared data type. Type coercion not permitted.

**Supported Data Types**:
- **string**: Text values
- **number**: Numeric values (integer or decimal)
- **boolean**: true or false
- **datetime**: ISO 8601 date/time strings
- **array**: JSON arrays of strings or numbers

**Implementation Requirements**:
- **Client-Side**: Render appropriate input type based on attribute data type
- **Server-Side**: Validate value matches data type, reject if mismatch
- **Database**: JSONB validation via trigger

**Error Code**: VAL-SYSADMIN-109
**Error Message**: "Attribute '{name}' must be type '{type}', received '{actual}'"

**Test Cases**:
- ✅ Valid: approvalLimit (number) = 5000
- ✅ Valid: weekendAccess (boolean) = true
- ✅ Valid: hireDate (datetime) = "2025-01-15T00:00:00Z"
- ❌ Invalid: approvalLimit (number) = "five thousand"
- ❌ Invalid: weekendAccess (boolean) = "yes"

---

## 4. Cross-Field Validations (VAL-SYSADMIN-201 to 299)

### VAL-SYSADMIN-201: Policy Target and Rules Consistency

**Fields Involved**: policyData.target, policyData.rules

**Validation Rule**: Policy rules must reference only attributes and resources defined in the policy target. Rules cannot reference undefined fields.

**Validation Logic**:
1. Extract all field references from rule conditions (e.g., "resource.amount", "subject.department")
2. Verify each field reference exists in target definition
3. Check data types match (e.g., numeric comparisons on numeric fields)
4. Reject if undefined fields referenced

**Implementation Requirements**:
- **Client-Side**: Autocomplete in rule editor showing available target fields, validate on change
- **Server-Side**: Parse rule conditions, extract field references, validate against target schema
- **Database**: Validation trigger on policy INSERT/UPDATE

**Error Code**: VAL-SYSADMIN-201
**Error Message**: "Rule condition references undefined field '{field}'. Available fields: {targetFields}"

**Examples**:

**Valid Scenario**:
- Target defines: resource.amount, resource.category
- Rule condition: "resource.amount < 5000 && resource.category == 'Food & Beverage'"
- Result: ✅ Passes (all fields defined)

**Invalid Scenario**:
- Target defines: resource.amount (no category defined)
- Rule condition: "resource.category == 'Food & Beverage'"
- Result: ❌ Fails (category not in target)
- User must: Add category to target definition or remove from rule

---

### VAL-SYSADMIN-202: Role Assignment Scope Consistency

**Fields Involved**: role, scope (departments, locations, resources)

**Validation Rule**: Role assignment scope must be subset of role's allowed departments and locations.

**Validation Logic**:
1. Get role's roleData.assignedLocations and roleData.department
2. Verify assignment scope.departments ⊆ role's departments
3. Verify assignment scope.locations ⊆ role's locations
4. If role has no restrictions, any scope is valid

**Implementation Requirements**:
- **Client-Side**: Filter scope options by role's allowed values
- **Server-Side**: Validate scope is subset of role's allowances
- **Database**: Validation function with array containment check

**Error Code**: VAL-SYSADMIN-202
**Error Message**: "Assignment scope includes {item} which is not allowed for role '{roleName}'. Allowed: {allowedItems}"

**Examples**:

**Valid Scenario**:
- Role allows: departments ['Kitchen', 'F&B']
- Assignment scope: departments ['Kitchen']
- Result: ✅ Passes (subset)

**Invalid Scenario**:
- Role allows: departments ['Kitchen']
- Assignment scope: departments ['Kitchen', 'Housekeeping']
- Result: ❌ Fails (Housekeeping not allowed)
- User must: Remove Housekeeping or assign different role

---

### VAL-SYSADMIN-203: Validity Period Range

**Fields Involved**: validFrom, validTo (policies), effectiveFrom, effectiveTo (role assignments)

**Validation Rule**: End date must be after start date, maximum 5-year validity period, both dates required if either is specified.

**Validation Logic**:
1. If validFrom specified, validTo must be specified (and vice versa)
2. validTo must be > validFrom (at least 1 day difference)
3. validTo - validFrom <= 1825 days (5 years)
4. Both dates must be valid dates (not in distant past >10 years ago)

**Implementation Requirements**:
- **Client-Side**: Date range picker with automatic validTo = validFrom + 1 day minimum
- **Server-Side**: Validate date range, calculate difference, enforce maximum
- **Database**: CHECK constraint: validTo > validFrom

**Error Codes**:
- VAL-SYSADMIN-203A: "End date must be after start date"
- VAL-SYSADMIN-203B: "If start date is specified, end date must also be specified"
- VAL-SYSADMIN-203C: "Validity period cannot exceed 5 years"
- VAL-SYSADMIN-203D: "Start date cannot be more than 10 years in the past"

**Examples**:

**Valid Scenarios**:
- validFrom: 2025-01-01, validTo: 2025-12-31 (1 year) ✅
- validFrom: 2025-01-01, validTo: 2029-12-31 (5 years) ✅
- No dates specified (permanent validity) ✅

**Invalid Scenarios**:
- validFrom: 2025-01-01, validTo: 2025-01-01 (same day) ❌
- validFrom: 2025-12-31, validTo: 2025-01-01 (reversed) ❌
- validFrom: 2025-01-01, validTo: 2031-01-01 (>5 years) ❌

---

### VAL-SYSADMIN-204: Workflow Routing Rule Conditions

**Fields Involved**: Workflow routing rules (field, operator, value, action)

**Validation Rule**: Routing rule conditions must reference valid request fields with type-compatible operators and values.

**Supported Operators by Data Type**:
- **String**: equals, not_equals, contains, starts_with, in
- **Number**: equals, not_equals, greater_than, less_than, between, in
- **Boolean**: equals, not_equals
- **Array**: contains, contains_any, contains_all, is_empty

**Implementation Requirements**:
- **Client-Side**: Dynamic operator dropdown based on selected field type, type-appropriate value input
- **Server-Side**: Validate field exists in request schema, operator valid for field type, value matches type
- **Database**: JSONB validation trigger

**Error Codes**:
- VAL-SYSADMIN-204A: "Routing rule references invalid field '{field}'"
- VAL-SYSADMIN-204B: "Operator '{operator}' not valid for type '{type}'"
- VAL-SYSADMIN-204C: "Value '{value}' does not match field type '{type}'"

**Examples**:

**Valid Scenario**:
- Field: amount (number type)
- Operator: greater_than
- Value: 5000
- Result: ✅ Valid

**Invalid Scenario**:
- Field: amount (number type)
- Operator: contains (string operator)
- Value: "5000"
- Result: ❌ Invalid operator for number type

---

## 5. Security Validations (VAL-SYSADMIN-301 to 399)

### VAL-SYSADMIN-301: ABAC Permission Check

**Validation Rule**: All operations must pass ABAC evaluation before execution. User must have PERMIT decision for requested action on resource.

**Checked Actions**:
- create_policy, update_policy, activate_policy, delete_policy
- create_role, update_role, delete_role
- assign_user_role, revoke_user_role
- create_user, update_user, suspend_user, delete_user
- create_workflow, update_workflow, delete_workflow
- view_audit_log, export_audit_log

**Implementation Requirements**:
- **Client-Side**: Hide/disable UI elements for actions user lacks permission for
- **Server-Side**: Call ABAC evaluation engine before every operation, reject if DENY or NOT_APPLICABLE
- **Database**: Row Level Security (RLS) policies enforcing permission checks

**Error Code**: VAL-SYSADMIN-301
**Error Message**: "You do not have permission to perform this action. Required: {action} on {resource}"

**Special Cases**:
- System administrators bypass some checks (defined by system policy)
- Emergency access requests logged with high priority
- Failed permission checks logged to audit trail

---

### VAL-SYSADMIN-302: JSON Injection Prevention

**Validation Rule**: All JSON input must be sanitized to prevent injection attacks. No code execution through JSON policy rules.

**Security Checks**:
1. Validate JSON structure with strict parser (reject malformed JSON)
2. Scan rule conditions for dangerous patterns (eval, Function, require, import)
3. Limit JSON depth to 10 levels
4. Limit JSON size to 1MB
5. Whitelist allowed functions in rule conditions (comparison, arithmetic, logical operators only)

**Forbidden Patterns in Rules**:
- Code execution: eval(), Function(), require(), import()
- Prototype pollution: __proto__, constructor.prototype
- System access: process, fs, child_process
- SQL keywords in unexpected contexts: SELECT, INSERT, UPDATE, DELETE
- Suspicious patterns: .., //, \x, %00

**Implementation Requirements**:
- **Client-Side**: JSON syntax validation only (not security validation)
- **Server-Side**: Comprehensive sanitization before storage, rule condition parsing with whitelist
- **Database**: JSONB type prevents SQL injection, but doesn't prevent logic injection

**Error Code**: VAL-SYSADMIN-302
**Error Message**: "Input contains potentially harmful content. Please remove: {pattern}"

**Test Cases**:
- ✅ Valid: "resource.amount < 5000"
- ✅ Valid: "subject.department IN ['Kitchen', 'F&B']"
- ❌ Invalid: "eval('malicious code')"
- ❌ Invalid: "Function('return process.env')()"
- ❌ Invalid: JSON with __proto__ keys

---

### VAL-SYSADMIN-303: Audit Log Immutability

**Validation Rule**: Audit log records cannot be updated or deleted after creation. Only INSERT operations allowed.

**Implementation Requirements**:
- **Client-Side**: No edit/delete buttons on audit log UI (read-only)
- **Server-Side**: Reject UPDATE and DELETE operations on audit log table
- **Database**: Revoke UPDATE and DELETE grants, trigger preventing modifications

**Error Code**: VAL-SYSADMIN-303
**Error Message**: "Audit logs are immutable and cannot be modified or deleted"

**Special Cases**:
- Retention policy enforced by archival system (move to archive, not delete)
- Compliance requirements: 7-year retention for financial logs
- Export functionality for compliance audits

---

### VAL-SYSADMIN-304: Password Complexity Requirements

**Validation Rule**: User passwords must meet complexity requirements: minimum 12 characters, uppercase, lowercase, number, special character.

**Implementation Requirements**:
- **Client-Side**: Real-time password strength indicator, show requirements
- **Server-Side**: Validate all requirements, hash with bcrypt (cost factor 12)
- **Database**: Store only hashed passwords, never plaintext

**Error Codes**:
- VAL-SYSADMIN-304A: "Password must be at least 12 characters"
- VAL-SYSADMIN-304B: "Password must contain uppercase letter"
- VAL-SYSADMIN-304C: "Password must contain lowercase letter"
- VAL-SYSADMIN-304D: "Password must contain number"
- VAL-SYSADMIN-304E: "Password must contain special character"

**Test Cases**:
- ✅ Valid: "SecureP@ssw0rd123"
- ❌ Invalid: "password" (too simple)
- ❌ Invalid: "Password123" (no special char)

---

### VAL-SYSADMIN-305: Session Timeout Enforcement

**Validation Rule**: User sessions must timeout after 30 minutes of inactivity. Sensitive operations require re-authentication after 15 minutes.

**Implementation Requirements**:
- **Client-Side**: Track last activity, show countdown timer, redirect to login on timeout
- **Server-Side**: Validate session timestamp, reject if >30 minutes since last activity
- **Database**: Session table with lastActivityAt timestamp

**Error Code**: VAL-SYSADMIN-305
**Error Message**: "Your session has expired. Please log in again"

**Sensitive Operations** (15-minute timeout):
- Activate/deactivate policy
- Assign/revoke user roles
- Modify approval limits
- Export audit logs
- System configuration changes

---

## 6. Validation Error Messages

### Error Message Guidelines

**Principles**:
1. **Be Specific**: Tell user exactly what's wrong with the data
2. **Be Actionable**: Explain how to fix the problem
3. **Be Secure**: Don't reveal sensitive system information in errors
4. **Be Consistent**: Use same format and tone throughout
5. **Provide Context**: Show current values when relevant

### Error Message Format

**Structure**:
```
[Field/Rule Name] {problem statement}. {Expected format or action}.
```

**Examples**:

✅ **Good Messages**:
- "Policy name must be at least 5 characters. Current length: 3"
- "User approval limit $15,000 exceeds role limit $10,000. Please reduce to $10,000 or less"
- "Role hierarchy depth (11 levels) exceeds maximum (10 levels). Please reduce hierarchy depth"
- "Policy rule references undefined field 'resource.vendor'. Available fields: resource.type, resource.amount"

❌ **Bad Messages**:
- "Error" (too vague)
- "Invalid policy data" (not specific)
- "CHECK constraint violation on abac_policies_priority_check" (too technical)
- "Access denied" (not actionable)

### Error Severity Levels

| Level | When to Use | Display |
|-------|-------------|---------|
| Error | Blocks submission/progress | Red icon, red border, red text |
| Warning | Should be corrected but not blocking | Yellow icon, yellow border |
| Info | Helpful guidance | Blue icon, normal border |
| Security | Security-related errors | Red icon with shield, emphasis |

---

## 7. Test Scenarios

### Test Coverage Requirements

All validation rules must have test cases covering:
1. **Positive Tests**: Valid input that should pass validation
2. **Negative Tests**: Invalid input that should fail validation
3. **Boundary Tests**: Edge cases at limits of acceptable values
4. **Security Tests**: Malicious input that should be rejected
5. **Integration Tests**: Validation working across all layers

### Example Test Scenarios

#### Positive Test: Create Policy with Valid Data

**Test ID**: VAL-SYSADMIN-T001

**Test Description**: Create ABAC policy with all required fields and valid JSON structure

**Test Type**: Positive

**Preconditions**:
- User is authenticated as IT Manager
- User has create_policy permission

**Test Steps**:
1. Navigate to Create Policy page
2. Enter Policy Name: "Kitchen Manager Approval Policy"
3. Set Priority: 100
4. Select Effect: PERMIT
5. Select Combining Algorithm: DENY_OVERRIDES
6. Enter valid JSON policy data with target and rules
7. Click Save Draft

**Input Data**:
```json
{
  "name": "Kitchen Manager Approval Policy",
  "priority": 100,
  "effect": "PERMIT",
  "combiningAlgorithm": "DENY_OVERRIDES",
  "policyData": {
    "target": {
      "subject": { "role": "kitchen-manager" },
      "resource": { "type": "purchase_request" },
      "action": "approve"
    },
    "rules": [
      {
        "ruleId": "rule-1",
        "condition": "resource.amount <= 5000",
        "effect": "PERMIT"
      }
    ]
  }
}
```

**Expected Result**: ✅ Policy created with status "DRAFT"

**Validation Layer**: All

---

#### Negative Test: Create Policy with Invalid Priority

**Test ID**: VAL-SYSADMIN-T101

**Test Description**: Attempt to create policy with priority exceeding maximum (1000)

**Test Type**: Negative

**Preconditions**: User is on Create Policy page

**Test Steps**:
1. Enter Policy Name: "Test Policy"
2. Set Priority: 1500
3. Fill other required fields with valid data
4. Click Save

**Input Data**:
- Priority: 1500

**Expected Result**: ❌ Validation error displayed

**Validation Layer**: Client and Server

**Pass/Fail Criteria**:
- Error message shown: "Priority must be between 0 and 1000"
- Priority field highlighted in red
- Policy not saved to database

---

#### Security Test: JSON Injection Attempt

**Test ID**: VAL-SYSADMIN-T301

**Test Description**: Attempt to inject malicious code through policy rule condition

**Test Type**: Security

**Preconditions**: User is on Create Policy page

**Test Steps**:
1. Enter valid policy name and basic info
2. In policy data JSON, enter malicious rule condition:
```json
{
  "rules": [
    {
      "ruleId": "malicious",
      "condition": "eval('process.exit(1)')",
      "effect": "PERMIT"
    }
  ]
}
```
3. Click Save

**Expected Result**: ❌ Security validation error

**Validation Layer**: Server (client-side bypassed)

**Pass/Fail Criteria**:
- Error message: "Input contains potentially harmful content. Please remove: eval"
- Policy not saved
- Security event logged to audit trail

---

## 8. Validation Matrix

| Error Code | Rule Name | Fields Involved | Type | Client | Server | Database |
|------------|-----------|-----------------|------|--------|--------|----------|
| VAL-SYSADMIN-001 | Policy Name Required | name | Field | ✅ | ✅ | ✅ |
| VAL-SYSADMIN-002 | Priority Range | priority | Field | ✅ | ✅ | ✅ |
| VAL-SYSADMIN-003 | Policy Effect Enum | effect | Field | ✅ | ✅ | ✅ |
| VAL-SYSADMIN-004 | Combining Algorithm | combiningAlgorithm | Field | ✅ | ✅ | ✅ |
| VAL-SYSADMIN-005 | Policy JSON Structure | policyData | Field | ✅ | ✅ | ✅ |
| VAL-SYSADMIN-006 | Role Name Required | name | Field | ✅ | ✅ | ✅ |
| VAL-SYSADMIN-007 | Role Level Range | level | Field | ✅ | ✅ | ✅ |
| VAL-SYSADMIN-008 | Email Format | email | Field | ✅ | ✅ | ✅ |
| VAL-SYSADMIN-009 | Approval Limit Range | approvalLimit | Field | ✅ | ✅ | ⚠️ |
| VAL-SYSADMIN-010 | Cache TTL Range | ttl | Field | ✅ | ✅ | ✅ |
| VAL-SYSADMIN-101 | Policy Status Transitions | status | Business | ❌ | ✅ | ✅ |
| VAL-SYSADMIN-102 | Role Hierarchy Integrity | parentId, level, path | Business | ⚠️ | ✅ | ✅ |
| VAL-SYSADMIN-103 | Single Primary Role | isPrimary | Business | ⚠️ | ✅ | ✅ |
| VAL-SYSADMIN-104 | Approval Limit Enforcement | approvalLimit | Business | ⚠️ | ✅ | ⚠️ |
| VAL-SYSADMIN-105 | Subscription Limits | counts | Business | ⚠️ | ✅ | ❌ |
| VAL-SYSADMIN-106 | Performance Budget | evaluation_time | Business | ❌ | ✅ | ❌ |
| VAL-SYSADMIN-107 | Cache Hit Rate | hit_rate | Business | ❌ | ✅ | ❌ |
| VAL-SYSADMIN-108 | Workflow Stage Assignment | departments, locations | Business | ⚠️ | ✅ | ⚠️ |
| VAL-SYSADMIN-109 | Attribute Data Type | attribute values | Business | ⚠️ | ✅ | ⚠️ |
| VAL-SYSADMIN-201 | Policy Target/Rules Consistency | target, rules | Cross-field | ⚠️ | ✅ | ⚠️ |
| VAL-SYSADMIN-202 | Role Assignment Scope | scope | Cross-field | ⚠️ | ✅ | ⚠️ |
| VAL-SYSADMIN-203 | Validity Period Range | validFrom, validTo | Cross-field | ✅ | ✅ | ✅ |
| VAL-SYSADMIN-204 | Workflow Routing Rules | field, operator, value | Cross-field | ⚠️ | ✅ | ⚠️ |
| VAL-SYSADMIN-301 | ABAC Permission Check | - | Security | ✅ | ✅ | ✅ |
| VAL-SYSADMIN-302 | JSON Injection Prevention | JSON fields | Security | ❌ | ✅ | ❌ |
| VAL-SYSADMIN-303 | Audit Log Immutability | audit_logs | Security | ✅ | ✅ | ✅ |
| VAL-SYSADMIN-304 | Password Complexity | password | Security | ✅ | ✅ | ❌ |
| VAL-SYSADMIN-305 | Session Timeout | session | Security | ✅ | ✅ | ⚠️ |

Legend:
- ✅ Enforced at this layer
- ❌ Not enforced at this layer
- ⚠️ Partial enforcement (display hints, not full validation)

---

## 9. Related Documents

- **Business Requirements**: [BR-system-administration.md](./BR-system-administration.md)
- **Use Cases**: [UC-system-administration.md](./UC-system-administration.md)
- **Technical Specification**: [TS-system-administration.md](./TS-system-administration.md)
- **Data Schema**: [DS-system-administration.md](./DS-system-administration.md)
- **Flow Diagrams**: [FD-system-administration.md](./FD-system-administration.md)

---

**Document Control**:
- **Created**: 2025-11-13
- **Author**: Documentation Team
- **Reviewed By**: Security Team, QA Lead, IT Manager
- **Approved By**: Technical Lead, Product Owner
- **Next Review**: 2025-12-13

---

## Appendix: Error Code Registry

| Code Range | Category | Description |
|------------|----------|-------------|
| VAL-SYSADMIN-001 to 099 | Field Validations | Individual field rules for policies, roles, users |
| VAL-SYSADMIN-101 to 199 | Business Rules | Business logic validations for ABAC system |
| VAL-SYSADMIN-201 to 299 | Cross-Field | Multi-field relationships and consistency |
| VAL-SYSADMIN-301 to 399 | Security | Permission checks, injection prevention, audit requirements |
| VAL-SYSADMIN-901 to 999 | System | System-level errors and performance thresholds |

---

**Document End**
