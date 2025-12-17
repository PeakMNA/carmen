# Data Definition: System Administration

## Module Information
- **Module**: System Administration
- **Sub-Module**: ABAC Permission Management
- **Database**: PostgreSQL 15+ via Prisma ORM
- **Version**: 1.1.0
- **Last Updated**: 2025-11-15
- **Owner**: Database Architecture Team
- **Status**: Active

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |
| 1.0.0 | 2025-11-13 | Documentation Team | Initial version based on schema.prisma ABAC schema |

---

## Overview

The System Administration data schema implements a comprehensive Attribute-Based Access Control (ABAC) system with 24 interrelated tables. The schema uses PostgreSQL JSONB fields extensively for flexible data storage, enabling dynamic policy structures, role attributes, user profiles, and workflow configurations without schema migrations.

**Key Design Principles**:
- **Flexible JSON Storage**: Policy data, role attributes, user attributes stored as JSON for schema flexibility
- **Hierarchical Relationships**: Roles support multi-level parent-child relationships (up to 10 levels)
- **Temporal Validity**: Policies and assignments support time-based activation/deactivation
- **Audit Trail**: Complete change tracking with immutable logs (7-year retention)
- **Performance Optimization**: Strategic indexing on frequently queried fields, JSONB operators for efficient JSON queries

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**

This document describes data structures, entities, relationships, and constraints in TEXT FORMAT. It does NOT contain executable SQL code, database scripts, or implementation code. For database implementation details, refer to the Technical Specification document.

**Related Documents**:
- [Business Requirements](./BR-system-administration.md)
- [Use Cases](./UC-system-administration.md)
- [Technical Specification](./TS-system-administration.md)
- [Flow Diagrams](./FD-system-administration.md)
- [Validations](./VAL-system-administration.md)

---

## Schema Overview

### Table Categories

**Core Policy Management** (6 tables):
- `Policy` - ABAC policy definitions with JSON structure
- `ResourceDefinition` - Dynamic resource type definitions
- `EnvironmentDefinition` - Environment attribute definitions
- `Attribute` - Universal attribute storage for subjects, resources, environment
- `RolePolicyAssignment` - Links roles to policies
- `PolicyMigration` - Policy schema version tracking

**Role & User Management** (4 tables):
- `Role` - Hierarchical role definitions with inheritance
- `User` - User profiles with attributes
- `UserRoleAssignment` - Contextual role assignments with scope
- `UserAccessAnalytic` - User access pattern analytics

**Access Control** (3 tables):
- `AccessRequest` - Access request evaluation records
- `PolicyEvaluationLog` - Detailed policy evaluation logs
- `PermissionCache` - Cached permission decisions

**Workflow Management** (1 table):
- `WorkflowDefinition` - Workflow configuration with stages and routing

**Subscription & Monitoring** (4 tables):
- `SubscriptionConfig` - Subscription package and limits
- `PolicyPerformanceMetric` - Policy performance metrics
- `AuditLog` - Comprehensive audit trail
- `NotificationTemplate` - Notification configuration

**Testing & Validation** (2 tables):
- `PolicyTestScenario` - Policy test scenarios
- `PolicyTestResult` - Policy test execution results

---

## Core Tables

### Policy

**Table Name**: `abac_policies`
**Purpose**: Stores ABAC policy definitions with JSON-based structure for target, rules, obligations, and advice

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique policy identifier |
| name | String | Unique, Not Null | Policy name (e.g., "Kitchen Manager Purchase Approval Policy") |
| description | String | Nullable | Policy purpose and scope description |
| version | String | Not Null, Default "1.0" | Policy version (semantic versioning) |
| priority | Int | Not Null, Default 500 | Evaluation priority (0-1000, lower = higher priority) |
| effect | PolicyEffect | Not Null | PERMIT or DENY |
| status | PolicyStatus | Not Null, Default DRAFT | DRAFT, ACTIVE, INACTIVE, ARCHIVED |
| combiningAlgorithm | CombiningAlgorithm | Not Null, Default DENY_OVERRIDES | DENY_OVERRIDES, PERMIT_OVERRIDES, FIRST_APPLICABLE, ONLY_ONE_APPLICABLE |
| policyData | Json | Not Null | Complete policy structure (see JSON structure below) |
| createdBy | String | Not Null | User ID who created policy |
| updatedBy | String | Not Null | User ID who last updated policy |
| validFrom | DateTime | Nullable | Policy effective start date |
| validTo | DateTime | Nullable | Policy effective end date |
| tags | String[] | Default [] | Tags for categorization (e.g., ['approval', 'kitchen', 'purchase']) |
| createdAt | DateTime | Not Null, Auto | Policy creation timestamp |
| updatedAt | DateTime | Not Null, Auto | Last update timestamp |

**Relationships**:
- `assignedRoles` → RolePolicyAssignment[] (one-to-many)
- `evaluationLogs` → PolicyEvaluationLog[] (one-to-many)

**Indexes**:
- Primary: `id`
- Unique: `name`
- Composite: `(priority, status)` for policy query performance
- Composite: `(validFrom, validTo)` for time-based filtering

**JSON Structure for `policyData`**:
```json
{
  "target": {
    "subject": {
      "role": "kitchen-manager",
      "department": ['Kitchen', 'F&B'],
      "clearanceLevel": "manager"
    },
    "resource": {
      "type": "purchase_request",
      "category": "Food & Beverage",
      "subcategory": "Ingredients"
    },
    "action": "approve",
    "environment": {
      "businessHours": true,
      "networkZone": "internal"
    }
  },
  "rules": [
    {
      "ruleId": "rule-1",
      "description": "Amount within approval limit",
      "condition": "resource.amount <= subject.approvalLimit && resource.amount <= 5000",
      "effect": "PERMIT"
    },
    {
      "ruleId": "rule-2",
      "description": "Department match",
      "condition": "resource.requestingDepartment IN subject.departments OR subject.role = 'general-manager'",
      "effect": "PERMIT"
    },
    {
      "ruleId": "rule-3",
      "description": "Location authorization",
      "condition": "resource.location IN subject.assignedLocations",
      "effect": "PERMIT"
    },
    {
      "ruleId": "rule-4",
      "description": "Not self-approval",
      "condition": "resource.requestedBy != subject.userId",
      "effect": "PERMIT"
    }
  ],
  "obligations": [
    {
      "obligationId": "log_audit",
      "description": "Log approval action to audit trail",
      "required": true
    },
    {
      "obligationId": "notify_requester",
      "description": "Send notification to requesting user",
      "required": true
    },
    {
      "obligationId": "update_status",
      "description": "Update request status to Approved",
      "required": true
    }
  ],
  "advice": [
    {
      "adviceId": "recommend_secondary_approval",
      "description": "Recommend secondary approval from General Manager for amounts >$3,000",
      "condition": "resource.amount > 3000"
    }
  ]
}
```

**Sample Data**:
```
id: "pol-abc123"
name: "Kitchen Manager Purchase Approval Policy"
description: "Allows kitchen managers to approve purchase requests up to $5,000 for food ingredients"
version: "1.0"
priority: 100
effect: PERMIT
status: ACTIVE
combiningAlgorithm: DENY_OVERRIDES
policyData: { ... } (see JSON structure above)
createdBy: "user-admin"
updatedBy: "user-admin"
validFrom: 2025-11-13T00:00:00Z
validTo: null
tags: ["approval", 'kitchen', 'purchase', 'manager']
```

---

### Role

**Table Name**: `abac_roles`
**Purpose**: Stores hierarchical role definitions with attributes, permissions, and inheritance

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique role identifier |
| name | String | Unique, Not Null | Role name (e.g., "kitchen-manager") |
| displayName | String | Not Null | User-friendly role name (e.g., "Kitchen Manager") |
| description | String | Nullable | Role purpose and responsibilities |
| parentId | String | FK (self-reference), Nullable | Parent role ID for hierarchy |
| level | Int | Not Null, Default 0 | Hierarchy level (0 = top level, max 10) |
| path | String | Not Null | Hierarchical path (e.g., "/staff/chef/sous-chef") |
| roleData | Json | Not Null, Default {} | Complete role definition (see JSON structure below) |
| isSystemRole | Boolean | Not Null, Default false | Protected system role (cannot delete) |
| isActive | Boolean | Not Null, Default true | Role enabled/disabled status |
| createdAt | DateTime | Not Null, Auto | Role creation timestamp |
| updatedAt | DateTime | Not Null, Auto | Last update timestamp |

**Relationships**:
- `parent` → Role (many-to-one, self-reference)
- `children` → Role[] (one-to-many, self-reference)
- `userAssignments` → UserRoleAssignment[] (one-to-many)
- `policyAssignments` → RolePolicyAssignment[] (one-to-many)

**Indexes**:
- Primary: `id`
- Unique: `name`
- Index: `parentId` for hierarchy queries
- Index: `(level, isActive)` for level-based filtering
- Index: `path` for hierarchical queries

**JSON Structure for `roleData`**:
```json
{
  "attributes": {
    "department": "Kitchen",
    "clearanceLevel": "supervisor",
    "approvalLimit": 2000,
    "assignedLocations": ['main-kitchen', 'prep-kitchen'],
    "workShifts": ['morning', 'afternoon', 'evening'],
    "specialPermissions": [
      "manage_kitchen_inventory",
      "approve_ingredient_purchases",
      "create_production_orders"
    ],
    "requiredCertifications": ['food-safety', 'kitchen-management']
  },
  "basePermissions": [
    {
      "resourceType": "inventory_item",
      "actions": ['view', 'create', 'update'],
      "conditions": {
        "productCategory": "Food & Beverage",
        "department": "Kitchen"
      }
    },
    {
      "resourceType": "purchase_request",
      "actions": ['view', 'create', 'approve'],
      "conditions": {
        "requestingDepartment": "Kitchen",
        "amount": { "lte": 2000 }
      }
    }
  ],
  "inheritance": {
    "inheritFrom": "chef",
    "overridePermissions": ['approve_purchases'],
    "additionalRestrictions": ['cannot_delete_inventory']
  },
  "constraints": {
    "locationRestrictions": ['main-kitchen', 'prep-kitchen'],
    "timeRestrictions": {
      "workShifts": ['morning', 'afternoon', 'evening'],
      "noWeekendAccess": false
    },
    "ipRestrictions": ['192.168.1.0/24']
  }
}
```

**Sample Data**:
```
id: "role-sous-chef"
name: "sous-chef"
displayName: "Sous Chef"
description: "Assistant to Executive Chef, responsible for kitchen operations in chef's absence"
parentId: "role-chef"
level: 3
path: "/staff/chef/sous-chef"
roleData: { ... } (see JSON structure above)
isSystemRole: false
isActive: true
```

---

### User

**Table Name**: `abac_users`
**Purpose**: Stores user profiles with complete attribute data for ABAC evaluation

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique user identifier |
| name | String | Unique, Not Null | Username (unique login identifier) |
| email | String | Unique, Not Null | User email address |
| userData | Json | Not Null, Default {} | Complete user profile and attributes (see JSON structure below) |
| isActive | Boolean | Not Null, Default true | User account active/disabled status |
| lastLoginAt | DateTime | Nullable | Last successful login timestamp |
| createdAt | DateTime | Not Null, Auto | Account creation timestamp |
| updatedAt | DateTime | Not Null, Auto | Last profile update timestamp |

**Relationships**:
- `roleAssignments` → UserRoleAssignment[] (one-to-many)

**Indexes**:
- Primary: `id`
- Unique: `name`, `email`
- Index: `isActive` for active user queries
- Index: `lastLoginAt` for activity tracking

**JSON Structure for `userData`**:
```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Smith",
    "employeeId": "EMP-12345",
    "hireDate": "2024-01-15",
    "phone": "+1-555-1234",
    "emergencyContact": {
      "name": "Jane Smith",
      "relationship": "Spouse",
      "phone": "+1-555-5678"
    }
  },
  "context": {
    "primaryRole": "kitchen-manager",
    "department": "Kitchen",
    "location": "main-kitchen",
    "clearanceLevel": "manager",
    "activeShift": "morning",
    "timezone": "America/New_York"
  },
  "attributes": {
    "approvalLimit": 5000,
    "weekendAccess": true,
    "mobileAccess": true,
    "specializations": ['pastry', 'meat-preparation'],
    "certifications": [
      {
        "name": "Food Safety Advanced",
        "issuer": "NSF",
        "issueDate": "2024-03-15",
        "expiryDate": "2026-03-15"
      },
      {
        "name": "Kitchen Management",
        "issuer": "ACF",
        "issueDate": "2024-06-20",
        "expiryDate": null
      }
    ]
  },
  "preferences": {
    "language": "en-US",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h",
    "currency": "USD",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    }
  }
}
```

**Sample Data**:
```
id: "user-john-smith"
name: "john.smith"
email: "john.smith@hotel.com"
userData: { ... } (see JSON structure above)
isActive: true
lastLoginAt: 2025-11-13T08:30:00Z
```

---

### UserRoleAssignment

**Table Name**: `abac_user_role_assignments`
**Purpose**: Assigns roles to users with contextual scope (departments, locations, time periods)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique assignment identifier |
| userId | String | FK (User), Not Null | User receiving role assignment |
| roleId | String | FK (Role), Not Null | Role being assigned |
| isPrimary | Boolean | Not Null, Default false | Primary role designation (each user must have exactly one) |
| context | Json | Not Null, Default {} | Contextual scope and attributes (see JSON structure below) |
| effectiveFrom | DateTime | Nullable | Assignment effective start date |
| effectiveTo | DateTime | Nullable | Assignment effective end date |
| createdBy | String | Not Null | User ID who created assignment |
| createdAt | DateTime | Not Null, Auto | Assignment creation timestamp |
| updatedAt | DateTime | Not Null, Auto | Last update timestamp |

**Relationships**:
- `user` → User (many-to-one)
- `role` → Role (many-to-one)

**Indexes**:
- Primary: `id`
- Composite: `(userId, roleId)` for assignment lookups
- Index: `isPrimary` for primary role queries
- Composite: `(effectiveFrom, effectiveTo)` for time-based filtering

**JSON Structure for `context`**:
```json
{
  "scope": {
    "departments": ['Kitchen', 'F&B'],
    "locations": ['main-kitchen', 'prep-kitchen'],
    "resources": ['purchase_request', 'inventory_item']
  },
  "constraints": {
    "effectiveDates": {
      "from": "2025-11-13",
      "to": "2026-02-28",
      "reason": "Temporary assignment while Jane Doe is on maternity leave"
    },
    "workShifts": ['morning', 'afternoon', 'evening'],
    "maxApprovalValue": 2500
  },
  "customAttributes": {
    "approvalLimit": 2500,
    "trainingCompleted": true,
    "certifications": ['Food Safety Advanced', 'Kitchen Management']
  },
  "delegatedAuthorities": {
    "canDelegateTo": ['role-chef'],
    "canActAs": "sous-chef"
  },
  "notes": "Temporary assignment while Jane Doe is on maternity leave. Review progress monthly."
}
```

**Sample Data**:
```
id: "ura-abc123"
userId: "user-john-smith"
roleId: "role-sous-chef"
isPrimary: false
context: { ... } (see JSON structure above)
effectiveFrom: 2025-11-13T00:00:00Z
effectiveTo: 2026-02-28T23:59:59Z
createdBy: "user-manager"
```

---

### AccessRequest

**Table Name**: `abac_access_requests`
**Purpose**: Logs all access requests with complete context and evaluation results

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique request identifier |
| requestType | String | Not Null | Request type (e.g., "permission_check") |
| sessionId | String | Nullable | User session identifier |
| requestData | Json | Not Null | Complete request context (subject, resource, action, environment) |
| evaluationResult | Json | Not Null | Evaluation result (decision, policies, obligations, advice) |
| evaluationTime | Int | Nullable | Evaluation duration in milliseconds |
| processingTime | Int | Nullable | Total processing duration in milliseconds |
| decision | AccessDecisionStatus | Not Null | PERMIT, DENY, NOT_APPLICABLE, INDETERMINATE |
| matchedPolicies | String[] | Default [] | List of policy IDs that matched |
| createdAt | DateTime | Not Null, Auto | Request timestamp |

**Relationships**:
- None (log table)

**Indexes**:
- Primary: `id`
- Index: `sessionId` for session-based queries
- Index: `decision` for decision analysis
- Composite: `(createdAt, decision)` for time-based decision analysis
- JSONB Index: `requestData->>'userId'` for user-based queries

**JSON Structure for `requestData`**:
```json
{
  "subject": {
    "userId": "user-john-smith",
    "primaryRole": "kitchen-manager",
    "roles": ['kitchen-manager', 'chef'],
    "department": "Kitchen",
    "clearanceLevel": "manager",
    "approvalLimit": 5000,
    "assignedLocations": ['main-kitchen', 'prep-kitchen'],
    "currentShift": "morning"
  },
  "resource": {
    "resourceType": "purchase_request",
    "resourceId": "PR-2501-0123",
    "attributes": {
      "requestValue": 2500,
      "productCategory": "Food & Beverage",
      "requestingDepartment": "Kitchen",
      "requestedBy": "user-jane-doe",
      "location": "main-kitchen",
      "status": "pending_approval"
    }
  },
  "action": {
    "actionType": "approve",
    "attributes": {
      "approvalLevel": 1,
      "reason": "Approve ingredient purchase for weekend prep"
    }
  },
  "environment": {
    "timestamp": "2025-11-13T09:30:00Z",
    "ipAddress": "192.168.1.100",
    "location": "main-kitchen",
    "networkZone": "internal",
    "deviceType": "desktop",
    "businessHours": true
  }
}
```

**JSON Structure for `evaluationResult`**:
```json
{
  "decision": "PERMIT",
  "confidence": 1.0,
  "applicablePolicies": ['POL-2501-0123'],
  "evaluatedRules": [
    { 'policyId': 'POL-2501-0123', 'ruleId': 'rule-1', 'result': 'pass' },
    { 'policyId': 'POL-2501-0123', 'ruleId': 'rule-2', 'result': 'pass' },
    { 'policyId': 'POL-2501-0123', 'ruleId': 'rule-3', 'result': 'pass' },
    { 'policyId': 'POL-2501-0123', 'ruleId': 'rule-4', 'result': 'pass' }
  ],
  "obligations": [
    { 'obligationId': 'log_audit', 'status': 'pending' },
    { 'obligationId': 'notify_requester', 'status': 'pending' },
    { 'obligationId': 'update_status', 'status': 'pending' }
  ],
  "advice": [
    {
      "adviceId": "recommend_secondary_review",
      "message": "Request value exceeds $2,000. Consider secondary approval."
    }
  ]
}
```

---

### PermissionCache

**Table Name**: `abac_permission_cache`
**Purpose**: Caches policy evaluation results for performance optimization

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique cache entry identifier |
| contextHash | String | Unique, Not Null | Hash of request context (userId + resourceType + actionType + attributes) |
| decision | AccessDecisionStatus | Not Null | Cached decision (PERMIT, DENY, NOT_APPLICABLE, INDETERMINATE) |
| cacheData | Json | Not Null | Cached evaluation result (decision, policies, obligations, advice) |
| createdAt | DateTime | Not Null, Auto | Cache entry creation timestamp |
| expiresAt | DateTime | Not Null | Cache expiration timestamp (TTL: 15 minutes default) |
| hitCount | Int | Not Null, Default 0 | Number of cache hits (incremented on each use) |
| lastAccessed | DateTime | Not Null, Auto | Last cache access timestamp (for LRU eviction) |

**Relationships**:
- None (cache table)

**Indexes**:
- Primary: `id`
- Unique: `contextHash` for quick lookup
- Index: `expiresAt` for expiration cleanup
- Index: `lastAccessed` for LRU eviction

**Cache Key Generation**:
```
contextHash = SHA256(userId + resourceType + actionType + JSON.stringify(relevantAttributes))
Example: "cache-user-john-smith-purchase_request-approve-kitchen-2500"
```

**Sample Data**:
```
id: "cache-abc123"
contextHash: "3f8d9e7a2b1c4f5e6d7a8b9c0d1e2f3a"
decision: PERMIT
cacheData: {
  "decision": "PERMIT",
  "applicablePolicies": ['POL-2501-0123'],
  "obligations": ['log_audit', 'notify_requester'],
  "advice": []
}
createdAt: 2025-11-13T09:30:00Z
expiresAt: 2025-11-13T09:45:00Z (15 minutes TTL)
hitCount: 5
lastAccessed: 2025-11-13T09:35:00Z
```

---

### AuditLog

**Table Name**: `abac_audit_logs`
**Purpose**: Comprehensive immutable audit trail for all permission-related events

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique audit log entry identifier |
| eventCategory | EventCategory | Not Null | POLICY, ACCESS, ROLE, USER, SYSTEM |
| eventType | String | Not Null | Specific event type (e.g., "POLICY_CREATED", "ACCESS_GRANTED") |
| actor | Json | Not Null | Actor information (userId, sessionId, ipAddress, userAgent) |
| action | Json | Not Null | Action details (actionType, resource, resourceId, resourceName) |
| changes | Json | Nullable | Change tracking (oldValues, newValues, fieldsChanged) |
| eventData | Json | Not Null, Default {} | Additional event-specific data |
| result | String | Nullable | Action result (success, failure, error details) |
| complianceFlags | String[] | Default [] | Compliance tags (GDPR, HIPAA, SOX) |
| retentionPeriod | Int | Not Null, Default 2555 | Retention in days (7 years = 2555 days default) |
| createdAt | DateTime | Not Null, Auto | Event timestamp |

**Relationships**:
- None (immutable log table)

**Indexes**:
- Primary: `id`
- Composite: `(eventCategory, eventType)` for event filtering
- Index: `createdAt` for time-based queries
- JSONB Index: `actor->>'userId'` for user-based audit trails
- Index: `complianceFlags` (GIN index) for compliance reporting

**JSON Structure for `actor`**:
```json
{
  "userId": "user-john-smith",
  "userName": "john.smith",
  "sessionId": "sess-abc123",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "location": "main-kitchen"
}
```

**JSON Structure for `action`**:
```json
{
  "actionType": "POLICY_CREATED",
  "resource": "policy",
  "resourceId": "POL-2501-0123",
  "resourceName": "Kitchen Manager Purchase Approval Policy",
  "description": "Created new ABAC policy for kitchen manager approvals"
}
```

**JSON Structure for `changes`**:
```json
{
  "oldValues": {
    "status": "DRAFT",
    "priority": 100
  },
  "newValues": {
    "status": "ACTIVE",
    "priority": 90
  },
  "fieldsChanged": ['status', 'priority']
}
```

**Sample Data**:
```
id: "audit-abc123"
eventCategory: POLICY
eventType: "POLICY_ACTIVATED"
actor: { "userId": "user-admin", "ipAddress": "192.168.1.50", ... }
action: { "actionType": "POLICY_ACTIVATED", "resourceId": "POL-2501-0123", ... }
changes: { "oldValues": { "status": "DRAFT" }, "newValues": { "status": "ACTIVE" }, ... }
result: "success"
complianceFlags: ['SOX']
retentionPeriod: 2555 (7 years)
createdAt: 2025-11-13T09:30:00Z
```

---

## Supporting Tables

### ResourceDefinition

**Table Name**: `abac_resource_definitions`
**Purpose**: Defines resource types dynamically (purchase_request, inventory_item, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique resource definition identifier |
| resourceType | String | Unique, Not Null | Resource type identifier (e.g., "purchase_request") |
| displayName | String | Not Null | User-friendly name (e.g., "Purchase Request") |
| description | String | Nullable | Resource type description |
| category | String | Not Null | Resource category (procurement, inventory, financial, operational) |
| resourceSchema | Json | Not Null | Resource attributes schema and available actions |
| isActive | Boolean | Not Null, Default true | Resource type enabled/disabled |
| createdAt | DateTime | Not Null, Auto | Creation timestamp |
| updatedAt | DateTime | Not Null, Auto | Last update timestamp |

**JSON Structure for `resourceSchema`**:
```json
{
  "attributes": [
    {
      "name": "requestValue",
      "type": "number",
      "required": true,
      "description": "Total purchase request amount"
    },
    {
      "name": "productCategory",
      "type": "string",
      "required": true,
      "allowedValues": ['Food & Beverage', 'Equipment', 'Supplies']
    },
    {
      "name": "requestingDepartment",
      "type": "string",
      "required": true
    }
  ],
  "actions": [
    {
      "actionType": "view",
      "description": "View purchase request details",
      "requiresConditions": false
    },
    {
      "actionType": "create",
      "description": "Create new purchase request",
      "requiresConditions": false
    },
    {
      "actionType": "approve",
      "description": "Approve purchase request",
      "requiresConditions": true,
      "conditions": ['approvalLimit', 'department', 'location']
    }
  ],
  "classification": "internal"
}
```

---

### SubscriptionConfig

**Table Name**: `abac_subscription_configs`
**Purpose**: Manages subscription packages and enforces usage limits

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, CUID | Unique subscription identifier |
| organizationId | String | Not Null | Organization identifier |
| packageType | PackageType | Not Null | BASIC, PROFESSIONAL, ENTERPRISE, CUSTOM |
| limits | Json | Not Null | Subscription limits (maxUsers, maxPolicies, etc.) |
| usage | Json | Not Null, Default {} | Current usage tracking |
| billingInfo | Json | Nullable | Billing contact and payment details |
| startDate | DateTime | Not Null | Subscription start date |
| endDate | DateTime | Nullable | Subscription end date |
| autoRenewal | Boolean | Not Null, Default true | Automatic renewal enabled |
| isActive | Boolean | Not Null, Default true | Subscription active status |
| createdAt | DateTime | Not Null, Auto | Subscription creation timestamp |
| updatedAt | DateTime | Not Null, Auto | Last update timestamp |

**JSON Structure for `limits`**:
```json
{
  "maxUsers": 50,
  "maxLocations": 10,
  "maxDepartments": 20,
  "maxPolicies": 100,
  "maxRoles": 50,
  "maxResourceTypes": 20,
  "storageLimit": 10737418240,
  "apiCallsPerMonth": 100000
}
```

**JSON Structure for `usage`**:
```json
{
  "currentUsers": 42,
  "currentLocations": 5,
  "currentDepartments": 12,
  "currentPolicies": 23,
  "currentRoles": 18,
  "storageUsed": 2147483648,
  "apiCallsThisMonth": 45678,
  "lastUpdated": "2025-11-13T09:30:00Z"
}
```

---

## Enumerations

### PolicyEffect
```
PERMIT - Grant access
DENY - Deny access
```

### PolicyStatus
```
DRAFT - Policy being created/edited
ACTIVE - Policy active and enforced
INACTIVE - Policy temporarily disabled
ARCHIVED - Policy retired and archived
```

### CombiningAlgorithm
```
DENY_OVERRIDES - If any policy denies, final decision is DENY
PERMIT_OVERRIDES - If any policy permits, final decision is PERMIT
FIRST_APPLICABLE - First matching policy determines decision
ONLY_ONE_APPLICABLE - Exactly one policy must match
```

### AccessDecisionStatus
```
PERMIT - Access granted
DENY - Access denied
NOT_APPLICABLE - No applicable policies
INDETERMINATE - Evaluation error or ambiguity
```

### PackageType
```
BASIC - Basic subscription tier
PROFESSIONAL - Professional subscription tier
ENTERPRISE - Enterprise subscription tier
CUSTOM - Custom subscription package
```

### EventCategory
```
POLICY - Policy-related events
ACCESS - Access request events
ROLE - Role management events
USER - User management events
SYSTEM - System events
```

---

## Relationships Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Policy    │←─────→│RolePolicy   │──────→│    Role     │
│             │       │Assignment   │       │             │
└─────────────┘       └─────────────┘       └──────┬──────┘
       │                                             │
       │                                             │ parent
       │                                             │ children
       ▼                                             ▼
┌─────────────┐                              ┌─────────────┐
│PolicyEval   │                              │   Role      │
│  Log        │                              │ (self-ref)  │
└─────────────┘                              └──────┬──────┘
                                                    │
                                                    │
┌─────────────┐       ┌─────────────┐             │
│AccessRequest│       │UserRole     │←────────────┘
│             │       │Assignment   │
└─────────────┘       └──────┬──────┘
                             │
                             ▼
┌─────────────┐       ┌─────────────┐
│Permission   │       │    User     │
│   Cache     │       │             │
└─────────────┘       └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ Workflow    │       │Subscription │       │  AuditLog   │
│ Definition  │       │   Config    │       │  (isolated) │
└─────────────┘       └─────────────┘       └─────────────┘
```

---

## Indexing Strategy

**High-Priority Indexes** (for frequent queries):
- `Policy`: (priority, status), (validFrom, validTo)
- `Role`: parentId, (level, isActive), path
- `UserRoleAssignment`: (userId, roleId), (effectiveFrom, effectiveTo)
- `AccessRequest`: createdAt, decision, requestData->>'userId' (JSONB)
- `PermissionCache`: contextHash (unique), expiresAt, lastAccessed
- `AuditLog`: (eventCategory, eventType), createdAt, actor->>'userId' (JSONB)

**Composite Indexes** (for complex queries):
- `Policy`: (status, priority, validFrom, validTo)
- `UserRoleAssignment`: (userId, isPrimary, effectiveFrom, effectiveTo)
- `AccessRequest`: (decision, createdAt)

**JSONB Indexes** (for JSON field queries):
- `Policy.policyData`: GIN index for full JSON search
- `Role.roleData->>'department'`: For department-based role queries
- `User.userData->>'primaryRole'`: For role-based user queries
- `AccessRequest.requestData->>'userId'`: For user-based access history
- `AuditLog.actor->>'userId'`: For user-based audit trails

---

**Document Control**:
- **Created**: 2025-11-13
- **Migrated to DD**: 2025-11-15
- **Author**: Carmen ERP Database Architecture Team
- **Reviewed By**: Database Administrator, Solutions Architect, Security Engineer
- **Approved By**: VP Engineering, CTO
- **Next Review**: 2025-12-15

---

**Document End**
