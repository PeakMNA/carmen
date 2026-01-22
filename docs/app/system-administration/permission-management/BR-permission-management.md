# Permission Management - Business Requirements (BR)

**Module**: System Administration - Permission Management
**Version**: 1.0
**Last Updated**: 2026-01-16
**Document Status**: Active
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |


**Implementation Status**: In Development (RBAC Implemented, ABAC Planned)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Functional Requirements](#functional-requirements)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [Business Rules](#business-rules)
6. [Future Enhancements](#future-enhancements)
7. [Success Metrics](#success-metrics)
8. [Glossary](#glossary)

---

## 1. Executive Summary

### 1.1 Purpose
The Permission Management module provides centralized control over user access rights through Role-Based Access Control (RBAC), with plans for future Attribute-Based Access Control (ABAC) capabilities. This system ensures secure, auditable access management aligned with hospitality industry requirements.

### 1.2 Current Implementation Status
- **Implemented**: Role-Based Access Control (RBAC) with role hierarchy
- **In Development**: Policy management UI and ABAC engine
- **Planned**: Database schema implementation, advanced policy builder, subscription-based permissions

### 1.3 Key Capabilities
- **Role Management**: Create, edit, and manage 20+ hospitality-specific roles
- **Permission Assignment**: Granular resource:action permission model
- **Role Hierarchy**: Multi-level role inheritance for complex organizational structures
- **User Assignment**: Assign users to roles with department/location context
- **Audit Trail**: Track all permission changes and access attempts

---

## 2. System Overview

### 2.1 Access Control Models

#### Current: Role-Based Access Control (RBAC)
```typescript
// Permission Format: resource:action
Examples:
  - "purchase_request:create"
  - "purchase_request:approve_department"
  - "purchase_order:*" // All actions on resource
  - "*" // All permissions (System Administrator only)
```

#### Planned: Attribute-Based Access Control (ABAC)
Future enhancement to support complex conditional access based on:
- Subject attributes (user properties, department, location, clearance level)
- Resource attributes (document status, value, classification)
- Environment attributes (time, location, system state)
- Action attributes (read, write, approve, delete)

### 2.2 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Permission Management                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │              │  │              │  │              │ │
│  │     Role     │  │   Policy     │  │ Subscription │ │
│  │  Management  │  │  Management  │  │  Management  │ │
│  │              │  │              │  │              │ │
│  │  [Active]    │  │  [Planned]   │  │  [Planned]   │ │
│  │              │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Access Decision Engine                   │  │
│  │          [Mock Implementation]                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Functional Requirements

### FR-PM-001: Role Management

**Priority**: CRITICAL
**Status**: Implemented (Mock Data)

#### Description
System must provide comprehensive role management capabilities for hospitality operations.

#### Requirements
1. Create, read, update, delete roles
2. Define role hierarchy with parent-child relationships
3. Assign granular permissions using resource:action format
4. Support system-defined roles (cannot be deleted)
5. Support custom user-defined roles
6. Display effective permissions (including inherited)

#### Acceptance Criteria
- ✅ Users can create new roles with unique names
- ✅ Users can assign permissions using resource:action format
- ✅ Users can define parent roles for inheritance
- ✅ System prevents deletion of system-defined roles
- ✅ System calculates and displays effective permissions
- ✅ Changes are logged in audit trail

#### Pre-defined Roles (20+ Hospitality-Specific)

**Executive Level**:
- System Administrator (hierarchy level 1)
- General Manager (hierarchy level 2)
- Finance Director (hierarchy level 3)

**Management Level**:
- Procurement Manager (hierarchy level 4)
- Department Manager (hierarchy level 4)
- Warehouse Manager (hierarchy level 4)
- Executive Chef (hierarchy level 4)
- Front Office Manager (hierarchy level 4)
- F&B Manager (hierarchy level 4)

**Operational Level**:
- Purchasing Staff (hierarchy level 5)
- Store Keeper (hierarchy level 5)
- Chef de Partie (hierarchy level 5)
- Sous Chef (hierarchy level 5)
- Front Desk Agent (hierarchy level 5)
- Server (hierarchy level 5)

**Support Level**:
- Accounts Clerk (hierarchy level 6)
- Inventory Clerk (hierarchy level 6)
- Kitchen Assistant (hierarchy level 6)
- Housekeeping Staff (hierarchy level 6)

---

### FR-PM-002: Permission Assignment

**Priority**: CRITICAL
**Status**: Implemented (Mock Data)

#### Description
System must support granular permission assignment using a structured resource:action model.

#### Permission Structure
```typescript
Format: "resource:action"
Wildcard Support:
  - "resource:*" (all actions on resource)
  - "*" (all permissions - admin only)

Examples by Module:
  Procurement:
    - "purchase_request:create"
    - "purchase_request:approve_department"
    - "purchase_request:approve_finance"
    - "purchase_order:create"
    - "purchase_order:approve"

  Inventory:
    - "inventory_item:view_stock"
    - "stock_adjustment:create"
    - "stock_count:approve"
    - "goods_receipt_note:approve"

  Vendor Management:
    - "vendor:create"
    - "vendor:approve"
    - "vendor_quotation:view"

  Financial:
    - "invoice:create"
    - "payment:approve"
    - "budget:view"
    - "journal_entry:create"
```

#### Acceptance Criteria
- ✅ Permissions follow resource:action format
- ✅ Wildcard permissions are restricted to admin roles
- ✅ Permission lists are searchable and filterable
- ✅ Invalid permission formats are rejected

---

### FR-PM-003: Role Hierarchy

**Priority**: HIGH
**Status**: Implemented (Mock Data)

#### Description
System must support multi-level role hierarchy with permission inheritance.

#### Requirements
1. Support single or multiple parent roles
2. Calculate effective permissions by merging parent permissions
3. Prevent circular inheritance dependencies
4. Display hierarchy level (1-10)
5. Show child roles that inherit from a role

#### Hierarchy Rules
- **Level 1**: System Administrator (no parents)
- **Level 2**: General Manager (inherits from Level 1)
- **Level 3**: Department Directors (inherit from Level 2)
- **Level 4**: Department Managers (inherit from Level 2 or 3)
- **Level 5**: Operational Staff (inherit from Level 4)
- **Level 6**: Support Staff (inherit from Level 5)

#### Acceptance Criteria
- ✅ Child roles inherit all parent permissions
- ✅ System detects and prevents circular inheritance
- ✅ Hierarchy level is calculated automatically
- ✅ Effective permissions include inherited permissions

---

### FR-PM-004: User-Role Assignment

**Priority**: HIGH
**Status**: Implemented (Mock Data)

#### Description
System must allow assignment of users to roles with contextual restrictions.

#### Requirements
1. Assign single or multiple roles to a user
2. Support role assignment with department context
3. Support role assignment with location context
4. Display assigned roles on user profile
5. Show effective permissions for a user

#### Assignment Context
```typescript
UserRoleAssignment {
  userId: string
  roleId: string
  department?: Department // Optional department restriction
  location?: Location // Optional location restriction
  effectiveFrom: Date
  effectiveTo?: Date // Optional expiration
}
```

#### Acceptance Criteria
- ✅ Users can be assigned multiple roles
- ✅ Role assignments can be restricted by department
- ✅ Role assignments can be restricted by location
- ✅ Time-based role assignments are supported
- ✅ User's effective permissions are calculated correctly

---

### FR-PM-005: Role Search and Filtering

**Priority**: MEDIUM
**Status**: Implemented

#### Description
System must provide efficient search and filtering capabilities for roles.

#### Requirements
1. Search by role name or description
2. Filter by hierarchy level
3. Filter by system vs. custom roles
4. Filter by permission (roles with specific permission)
5. Sort by name, hierarchy, user count

#### Acceptance Criteria
- ✅ Real-time search as user types
- ✅ Multiple filters can be applied simultaneously
- ✅ Results update immediately on filter change
- ✅ Filter state persists during session

---

### FR-PM-006: Role Detail View

**Priority**: MEDIUM
**Status**: Implemented

#### Description
System must provide comprehensive role detail view with tabbed interface.

#### Tabs
1. **Overview**: Role name, description, hierarchy
2. **Permissions**: Assigned and inherited permissions
3. **Users**: Users assigned to this role
4. **Child Roles**: Roles that inherit from this role
5. **Audit**: Change history and access logs

#### Acceptance Criteria
- ✅ All role information is visible in organized tabs
- ✅ Permission tab shows both direct and inherited permissions
- ✅ Users tab shows all assigned users with filters
- ✅ Child roles tab shows inheritance relationships

---

### FR-PM-007: Role Duplication

**Priority**: LOW
**Status**: Implemented

#### Description
System must allow duplication of existing roles for quick role creation.

#### Requirements
1. Copy role name (with "Copy of" prefix)
2. Copy all permissions
3. Copy hierarchy level
4. Do NOT copy user assignments
5. Do NOT copy parent role relationships

#### Acceptance Criteria
- ✅ Duplicate role has unique name
- ✅ All permissions are copied
- ✅ User assignments are not copied
- ✅ User can modify duplicate before saving

---

### FR-PM-008: Policy Management (Planned)

**Priority**: HIGH
**Status**: Planned

#### Description
Future enhancement to support ABAC policies with complex conditional access rules.

#### Planned Features
1. Visual policy builder with drag-and-drop interface
2. Condition builder for subject/resource/environment attributes
3. Policy templates for common scenarios
4. Policy testing and validation
5. Policy versioning and rollback
6. Policy conflict detection and resolution

---

### FR-PM-009: Subscription Management (Planned)

**Priority**: LOW
**Status**: Planned

#### Description
Future enhancement to support subscription-based permission packages.

#### Planned Features
1. Define subscription packages (Basic, Professional, Enterprise)
2. Assign resource access limits per package
3. Track subscription usage and limits
4. Support upgrade/downgrade workflows
5. Billing integration for subscription management

---

### FR-PM-010: Access Decision Engine

**Priority**: HIGH
**Status**: Mock Implementation

#### Description
System must provide centralized access decision engine for permission checks.

#### Current Implementation (Mock)
```typescript
// Simple RBAC check
function hasPermission(user, resource, action): boolean {
  const permission = `${resource}:${action}`
  return user.roles.some(role =>
    role.permissions.includes(permission) ||
    role.permissions.includes(`${resource}:*`) ||
    role.permissions.includes('*')
  )
}
```

#### Planned Enhancement (ABAC)
```typescript
// Complex policy evaluation
function evaluateAccess(
  subject: SubjectAttributes,
  resource: ResourceAttributes,
  action: string,
  environment: EnvironmentAttributes
): AccessDecision {
  // Evaluate all applicable policies
  // Apply combining algorithm
  // Return permit/deny decision with obligations
}
```

---

## 4. Non-Functional Requirements

### NFR-PM-001: Performance
- Role list page must load within 500ms
- Permission check must complete within 50ms
- Support up to 10,000 concurrent permission checks/second
- Cache frequently accessed role and permission data

### NFR-PM-002: Security
- All permission changes must be logged in audit trail
- Role modifications require authentication and authorization
- Sensitive permissions require additional confirmation
- System administrator role cannot be deleted or modified

### NFR-PM-003: Scalability
- Support up to 1,000 custom roles
- Support up to 10,000 users with role assignments
- Support up to 100 hierarchy levels (practical limit)
- Efficient permission inheritance calculation

### NFR-PM-004: Usability
- Intuitive role creation wizard
- Visual hierarchy display
- Permission search and auto-complete
- Bulk user assignment interface

### NFR-PM-005: Data Integrity
- Prevent orphaned role assignments
- Maintain referential integrity between users and roles
- Prevent circular role inheritance
- Validate permission format before saving

### NFR-PM-006: Auditability
- Track all role creations, modifications, deletions
- Track all user-role assignments and removals
- Track all permission changes
- Maintain audit log for minimum 7 years

---

## 5. Business Rules

### BR-PM-001: Role Naming
- Role names must be unique (case-insensitive)
- Role names must be 3-100 characters
- Role names can only contain letters, numbers, spaces, hyphens
- Reserved names: "System", "Admin", "Default"

### BR-PM-002: Role Hierarchy
- Hierarchy level must be 1-10
- System Administrator must be level 1
- Child role level must be greater than parent role level
- Circular inheritance is not allowed

### BR-PM-003: Permission Format
- Must follow "resource:action" format
- Resource name must be alphanumeric with underscores
- Action must be valid action keyword
- Wildcard "*" only allowed for System Administrator

### BR-PM-004: System Roles
- System-defined roles cannot be deleted
- System-defined roles cannot have name changed
- System-defined roles can have permissions modified (with warning)
- System Administrator role always has "*" permission

### BR-PM-005: User Assignment
- A user can have multiple roles
- Role assignment can be time-bound (effective from/to dates)
- Expired role assignments are automatically inactive
- User must have at least one active role

### BR-PM-006: Role Deletion
- Cannot delete role with assigned users
- Cannot delete role with child roles
- Must reassign users before deletion
- System roles cannot be deleted

### BR-PM-007: Permission Inheritance
- Child roles inherit all parent permissions
- Inherited permissions cannot be removed from child
- Child can have additional permissions beyond parent
- Multiple parents: union of all parent permissions

---

## 6. Future Enhancements

### 6.1 Attribute-Based Access Control (ABAC)

**Planned Q2 2025**

Comprehensive ABAC implementation with:
- Policy builder with visual interface
- Support for complex conditional rules
- Subject, resource, environment attribute evaluation
- Combining algorithms (deny-overrides, permit-overrides)
- Policy testing and simulation
- Policy version control

### 6.2 Database Schema Implementation

**Planned Q1 2025**

Replace mock data with production database:
- `tb_role` table for role storage
- `tb_permission` table for permission definitions
- `tb_user_role` table for user-role assignments
- `tb_policy` table for ABAC policies (future)
- `tb_permission_audit` table for audit trail

### 6.3 Advanced Features

**Planned Q3 2025**

- Time-based access (temporary permissions)
- Location-based access restrictions
- Dynamic role assignment based on context
- Permission request and approval workflow
- Delegation and proxy permissions
- Emergency access with audit

### 6.4 Integration Enhancements

**Planned Q4 2025**

- SSO integration for role provisioning
- LDAP/Active Directory sync
- Third-party identity provider integration
- API for external permission checks
- Webhook notifications for permission changes

---

## 7. Success Metrics

### 7.1 Functional Metrics
- **Role Coverage**: 100% of system functions covered by permissions
- **Assignment Accuracy**: <1% incorrect role assignments
- **Search Efficiency**: 95% of role searches succeed in <3 clicks

### 7.2 Performance Metrics
- **Permission Check Speed**: <50ms average response time
- **Role Load Time**: <500ms for role list page
- **Hierarchy Calculation**: <100ms for inheritance resolution

### 7.3 Security Metrics
- **Audit Compliance**: 100% of permission changes logged
- **Unauthorized Access**: 0 successful unauthorized access attempts
- **Security Incidents**: 0 incidents related to permission misconfiguration

### 7.4 Usability Metrics
- **User Satisfaction**: >85% satisfaction with role management interface
- **Training Time**: <2 hours for administrators to master role management
- **Error Rate**: <5% of role creation attempts result in errors

---

## 8. Glossary

### Permission Terms

**Role**: A collection of permissions that can be assigned to users

**Permission**: An authorization to perform a specific action on a specific resource

**Resource**: An entity or object in the system (e.g., purchase_request, inventory_item)

**Action**: An operation that can be performed on a resource (e.g., create, approve, delete)

**Hierarchy**: The level of a role in the organizational structure (1-10)

**Inheritance**: The mechanism by which child roles automatically receive parent permissions

**Effective Permissions**: The complete set of permissions a user has, including inherited permissions

**System Role**: A predefined role that cannot be deleted (e.g., System Administrator)

**Custom Role**: A user-defined role that can be modified or deleted

### Access Control Terms

**RBAC**: Role-Based Access Control - permissions based on user roles

**ABAC**: Attribute-Based Access Control - permissions based on attributes and conditions

**Subject**: The entity requesting access (user, service account)

**Policy**: A set of rules defining access conditions (ABAC concept)

**Effect**: The result of a policy evaluation (permit or deny)

**Obligation**: Required actions when access is granted (e.g., audit logging)

**Combining Algorithm**: Method for resolving conflicting policies

---

**Document Control**:
- **Created**: 2026-01-16
- **Last Modified**: 2026-01-16
- **Version**: 1.0
- **Status**: Active
- **Review Cycle**: Quarterly
- **Next Review**: 2025-04-16
