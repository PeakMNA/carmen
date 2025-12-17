# Use Cases: System Administration

## Module Information
- **Module**: System Administration
- **Sub-Module**: ABAC Permission Management, User Management, Workflow Configuration
- **Route**: `/system-administration`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-13
- **Owner**: IT & Security Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-13 | Documentation Team | Initial version based on schema.prisma ABAC system |

---

## Overview

This document describes the use cases for the System Administration module, which implements a comprehensive Attribute-Based Access Control (ABAC) permission system. The use cases cover dynamic policy management, role hierarchy configuration, contextual user assignments, automated access evaluation, workflow configuration, and compliance monitoring workflows for hospitality operations.

The ABAC system provides fine-grained permission control based on user attributes, resource properties, and environmental context, enabling flexible security policies that adapt to complex hospitality business requirements.

**Related Documents**:
- [Business Requirements](./BR-system-administration.md)
- [Technical Specification](./TS-system-administration.md)
- [Data Schema](./DS-system-administration.md)
- [Flow Diagrams](./FD-system-administration.md)
- [Validations](./VAL-system-administration.md)

---

## Actors

### Primary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **IT Manager / System Administrator** | Senior IT professional responsible for system security and configuration | Designs permission policies, configures role hierarchy, manages system security, oversees compliance |
| **General Manager** | Senior hotel/restaurant executive managing overall operations | Reviews user access, approves critical policy changes, oversees departmental access control |
| **Department Manager** | Manages department operations and team access | Assigns roles to team members, configures department-specific workflows, reviews team permissions |
| **Financial Controller** | Senior finance executive managing financial access control | Configures financial approval limits, defines financial role attributes, reviews sensitive access |
| **Security Officer** | Manages security policies and compliance | Monitors access patterns, reviews audit logs, investigates security incidents, enforces compliance |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **HR Manager** | Human Resources manager handling employee lifecycle | Creates user accounts, manages employee data, coordinates with IT on access provisioning |
| **Compliance Officer** | Ensures regulatory compliance (GDPR, SOX, industry standards) | Reviews access controls, generates compliance reports, audits permission changes |
| **External Auditor** | Independent auditor verifying access controls and compliance | Reviews ABAC policies, tests permission effectiveness, validates audit trails |
| **Legal Counsel** | Provides legal guidance on data access and privacy | Reviews permission policies for legal compliance, advises on data protection |

### System Actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| **Policy Evaluation Engine** | Core ABAC engine that evaluates access requests against policies | Core Service |
| **Mapping Rule Engine** | Determines applicable policies based on request attributes | Core Service |
| **Permission Cache Service** | Caches policy evaluation results for performance | Core Service |
| **Workflow Routing Engine** | Evaluates workflow routing rules and stage transitions | Core Service |
| **Subscription Monitor** | Monitors subscription limits and enforces constraints | Background Job |
| **Audit Log Service** | Records all permission-related events for compliance | Core Service |
| **Performance Metrics Collector** | Collects policy performance and usage analytics | Background Job |
| **Procurement System** | Consumes ABAC for purchase request approvals | Internal Integration |
| **Inventory System** | Consumes ABAC for stock access control | Internal Integration |
| **Finance System** | Consumes ABAC for financial transaction approvals | Internal Integration |

---

## Use Case Diagram

```
                    ┌─────────────────────────────────────────┐
                    │   System Administration (ABAC)         │
                    └────────────┬────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
   ┌─────▼──────┐         ┌─────▼──────┐         ┌─────▼──────┐
   │ IT Manager │         │  General   │         │ Department │
   │            │         │  Manager   │         │  Manager   │
   └─────┬──────┘         └─────┬──────┘         └─────┬──────┘
         │                      │                       │
    [UC-SYSADMIN-001]      [UC-SYSADMIN-005]      [UC-SYSADMIN-006]
    [UC-SYSADMIN-002]      [UC-SYSADMIN-010]      [UC-SYSADMIN-007]
    [UC-SYSADMIN-003]      [UC-SYSADMIN-011]      [UC-SYSADMIN-008]
    [UC-SYSADMIN-004]
    [UC-SYSADMIN-009]
    [UC-SYSADMIN-012]
    [UC-SYSADMIN-013]

   ┌──────────────┐        ┌──────────────┐       ┌──────────────┐
   │ Financial    │        │  Security    │       │  Compliance  │
   │ Controller   │        │  Officer     │       │  Officer     │
   └──────┬───────┘        └──────┬───────┘       └──────┬───────┘
          │                       │                       │
     [UC-SYSADMIN-006]       [UC-SYSADMIN-014]      [UC-SYSADMIN-015]
     (approval limits)       (security monitoring)   (compliance review)

  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
  │  Policy        │      │  Permission    │      │  Subscription  │
  │  Evaluation    │      │  Cache         │      │  Monitor       │
  │  Engine        │      │  Service       │      │  (Background)  │
  └────────┬───────┘      └────────┬───────┘      └────────┬───────┘
           │                       │                       │
      [UC-SYSADMIN-101]       [UC-SYSADMIN-102]      [UC-SYSADMIN-103]
      [UC-SYSADMIN-104]       [UC-SYSADMIN-105]      [UC-SYSADMIN-106]
      (auto-evaluation)       (caching)              (limit monitoring)

  ┌────────────────┐      ┌────────────────┐      ┌────────────────┐
  │  Procurement   │      │   Inventory    │      │    Finance     │
  │    System      │      │    System      │      │    System      │
  │  Integration   │      │  Integration   │      │  Integration   │
  └────────┬───────┘      └────────┬───────┘      └────────┬───────┘
           │                       │                       │
      [UC-SYSADMIN-201]       [UC-SYSADMIN-202]      [UC-SYSADMIN-203]
      (approval workflow)     (access control)       (approval control)
```

**Legend**:
- **Top Section**: Primary administrators (IT, General Manager, Department Managers)
- **Middle Section**: Supporting actors (Financial Controller, Security, Compliance)
- **Bottom Section**: System actors (evaluation engines, cache, integrations, monitoring)

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **Policy & Permission Management** | | | | | |
| UC-SYSADMIN-001 | Create ABAC Permission Policy | IT Manager | Critical | Complex | User |
| UC-SYSADMIN-002 | Test Policy Against Scenarios | IT Manager | High | Medium | User |
| UC-SYSADMIN-003 | Activate Policy for Production Use | IT Manager | Critical | Medium | User |
| UC-SYSADMIN-004 | Define Resource Type and Actions | IT Manager | Critical | Complex | User |
| **Role & User Management** | | | | | |
| UC-SYSADMIN-005 | Configure Role Hierarchy | IT Manager | Critical | Complex | User |
| UC-SYSADMIN-006 | Assign Role to User with Context | Department Manager | Critical | Medium | User |
| UC-SYSADMIN-007 | Manage User Profile and Attributes | General Manager | Critical | Medium | User |
| UC-SYSADMIN-008 | Review User Effective Permissions | Department Manager | High | Medium | User |
| **Workflow Configuration** | | | | | |
| UC-SYSADMIN-009 | Configure Workflow Stages | Department Manager | Critical | Complex | User |
| UC-SYSADMIN-010 | Define Workflow Routing Rules | IT Manager | High | Complex | User |
| **Organization Structure** | | | | | |
| UC-SYSADMIN-011 | Manage Location Hierarchy | General Manager | High | Medium | User |
| UC-SYSADMIN-012 | Configure Department Structure | General Manager | High | Medium | User |
| **Monitoring & Compliance** | | | | | |
| UC-SYSADMIN-013 | Review Audit Log for Compliance | Security Officer | Critical | Medium | User |
| UC-SYSADMIN-014 | Investigate Security Incident | Security Officer | Critical | Complex | User |
| UC-SYSADMIN-015 | Generate Compliance Report | Compliance Officer | High | Simple | User |
| UC-SYSADMIN-016 | Monitor Policy Performance Metrics | IT Manager | Medium | Simple | User |
| **Automated Policy Evaluation** | | | | | |
| UC-SYSADMIN-101 | Evaluate Access Request | Policy Evaluation Engine | Critical | Complex | System |
| UC-SYSADMIN-102 | Cache Permission Decision | Permission Cache Service | Critical | Medium | System |
| UC-SYSADMIN-103 | Invalidate Permission Cache | Permission Cache Service | High | Simple | System |
| UC-SYSADMIN-104 | Execute Workflow Routing Logic | Workflow Routing Engine | Critical | Complex | System |
| UC-SYSADMIN-105 | Calculate Policy Metrics | Performance Metrics Collector | Medium | Medium | System |
| UC-SYSADMIN-106 | Monitor Subscription Limits | Subscription Monitor | High | Medium | System |
| **System Integration** | | | | | |
| UC-SYSADMIN-201 | Approve Purchase Request via Workflow | Procurement Integration | Critical | Complex | Integration |
| UC-SYSADMIN-202 | Control Inventory Access | Inventory Integration | Critical | Medium | Integration |
| UC-SYSADMIN-203 | Enforce Financial Approval Limits | Finance Integration | Critical | Complex | Integration |

---

## Detailed Use Cases

### UC-SYSADMIN-001: Create ABAC Permission Policy

**Actor**: IT Manager / System Administrator

**Goal**: Create a comprehensive attribute-based access control policy that grants or denies permissions based on user attributes, resource properties, and environmental context.

**Priority**: Critical

**Complexity**: Complex

**Preconditions**:
- User is logged in as IT Manager or System Administrator
- User has permission to create and manage ABAC policies
- Resource types defined in system (purchase requests, inventory items, etc.)
- Role hierarchy configured

**Main Flow**:
1. User navigates to System Administration → Permission Management → Policies
2. System displays list of existing policies with status and priority
3. User clicks "Create New Policy" button
4. System displays policy creation wizard
5. User enters policy basic information:
   - **Policy Name**: "Kitchen Manager Purchase Approval Policy"
   - **Description**: "Allows kitchen managers to approve purchase requests up to $5,000 for food ingredients within their assigned locations"
   - **Version**: 1.0 (auto-filled)
   - **Priority**: 100 (higher priority policies evaluated first; range 0-1000)
   - **Effect**: PERMIT (or DENY for restriction policies)
6. User configures target criteria (defines when this policy applies):
   - **Subject Criteria** (User Attributes):
     * primaryRole = "kitchen-manager"
     * clearanceLevel >= "manager"
     * department = "Kitchen" OR department = "F&B"
     * activeShift IN ("morning", "afternoon", "evening")
   - **Resource Criteria** (What they can access):
     * resourceType = "purchase_request"
     * productCategory = "Food & Beverage"
     * productSubcategory = "Ingredients"
     * requestValue <= 5000.00
   - **Action Criteria** (What they can do):
     * action = "approve"
   - **Environment Criteria** (When/Where):
     * businessHours = true
     * location IN user.assignedLocations (contextual check)
     * networkZone = "internal" (not external access)
7. User defines policy rules using rule builder:
   - **Rule 1: Amount Within Approval Limit**
     * Condition: `resource.amount <= subject.approvalLimit`
     * Condition: `resource.amount <= 5000.00`
     * Logic: AND
   - **Rule 2: Department Match**
     * Condition: `resource.requestingDepartment IN subject.departments`
     * Or: `subject.role = "general-manager"` (GMs can approve any department)
   - **Rule 3: Location Authorization**
     * Condition: `resource.location IN subject.assignedLocations`
   - **Rule 4: Not Self-Approval**
     * Condition: `resource.requestedBy != subject.userId`
   - **Combining Logic**: ALL rules must pass (AND operator between rules)
8. User configures obligations (actions required if access granted):
   - **Obligation 1**: Log approval action to audit trail
   - **Obligation 2**: Send notification to requesting user
   - **Obligation 3**: Update request status to "Approved"
   - **Obligation 4**: Record approval timestamp and approver ID
9. User configures advice (recommendations, not required):
   - **Advice 1**: If amount > $3,000, recommend secondary approval from General Manager
   - **Advice 2**: If urgent request, escalate to senior manager for expedite
10. User sets combining algorithm (if multiple policies match):
    - Options: DENY_OVERRIDES, PERMIT_OVERRIDES, FIRST_APPLICABLE, ONLY_ONE_APPLICABLE
    - User selects: **DENY_OVERRIDES** (if any policy denies, final decision is DENY)
11. User configures validity period:
    - **Valid From**: 2025-11-13 (today)
    - **Valid To**: (blank for no expiration)
12. User adds tags for categorization: "approval", "kitchen", "purchase", "manager"
13. User reviews complete policy structure in JSON preview:
    ```json
    {
      "name": "Kitchen Manager Purchase Approval Policy",
      "effect": "PERMIT",
      "priority": 100,
      "target": {
        "subject": { "role": "kitchen-manager", "department": ['Kitchen', 'F&B'] },
        "resource": { "type": "purchase_request", "category": "Food & Beverage" },
        "action": "approve",
        "environment": { "businessHours": true, "networkZone": "internal" }
      },
      "rules": [
        { 'condition': 'resource.amount <= subject.approvalLimit && resource.amount <= 5000' },
        { 'condition': 'resource.requestingDepartment IN subject.departments' },
        { 'condition': 'resource.location IN subject.assignedLocations' },
        { 'condition': 'resource.requestedBy != subject.userId' }
      ],
      "obligations": [ 'log_audit', 'notify_requester', 'update_status' ],
      "advice": [ 'recommend_secondary_approval_over_3000' ]
    }
    ```
14. User clicks "Save as Draft" (policy not yet active)
15. System validates policy structure:
    - All required fields populated
    - JSON structure valid
    - No circular logic in conditions
    - Referenced attributes exist in attribute definitions
    - Combining algorithm valid
16. System saves policy with status = "DRAFT"
17. System generates unique policy ID: POL-2501-0123
18. System logs policy creation in audit trail
19. System displays success message: "Policy saved as draft. Test policy before activation."
20. System returns to policy list with new draft policy visible

**Alternative Flows**:

**AF-001-1: Use Policy Template**
- At step 4, user clicks "Use Template"
- System displays template library: Approval Policies, Access Control Policies, Restriction Policies
- User selects "Standard Manager Approval Template"
- System pre-fills policy structure with template defaults
- User customizes specific values (amounts, departments, locations)
- Continue with step 13 to review

**AF-001-2: Copy from Existing Policy**
- At step 3, user selects existing policy "Restaurant Manager Approval"
- User clicks "Copy Policy"
- System creates duplicate with " - Copy" appended to name
- System sets status to "DRAFT" and assigns new ID
- User modifies criteria to adapt for Kitchen operations
- Continue with step 13

**AF-001-3: Create Policy from Incident**
- User navigates from security incident review (UC-SYSADMIN-014)
- System analyzes incident context and suggests policy structure
- System pre-fills target criteria based on incident attributes
- User reviews and adjusts suggested policy
- Continue with step 7 to define rules

**Exception Flows**:

**EF-001-1: Invalid JSON Structure**
- At step 15, validation detects malformed JSON in policy data
- System displays error: "Policy structure invalid. Error at line 15: Missing closing bracket"
- System highlights problematic section in JSON editor
- User corrects JSON structure
- Return to step 14 to re-save

**EF-001-2: Circular Logic in Conditions**
- At step 15, validation detects circular reference
- System displays error: "Circular dependency detected: Rule A depends on Rule B which depends on Rule A"
- System suggests restructuring logic to remove circular dependency
- User restructures rules
- Return to step 14

**EF-001-3: Referenced Attribute Doesn't Exist**
- At step 15, validation finds attribute not defined in attribute catalog
- System displays error: "Attribute 'subject.specialClearance' not found in attribute definitions"
- System suggests similar attributes: "clearanceLevel", "specialPermissions"
- User corrects attribute reference or creates new attribute definition
- Return to step 14

**EF-001-4: Priority Conflict**
- At step 15, validation detects another active policy with same priority and overlapping target
- System displays warning: "Policy conflict detected with POL-2501-0089 'All Manager Approvals' (Priority 100)"
- System suggests: "Change priority to 90 to ensure this policy evaluates first"
- User adjusts priority to 90
- System re-validates
- Continue with step 16

**Postconditions**:
- ABAC policy created and saved with status DRAFT
- Policy stored in database with complete JSON structure
- Policy visible in policy list for testing
- Audit trail entry created documenting policy creation
- Policy not yet active (requires testing and activation)

**Business Rules**:
- BR-SYSADMIN-001: Policy evaluation order determined by priority (0-1000, higher = first)
- BR-SYSADMIN-002: Policy status must follow: DRAFT → ACTIVE → INACTIVE → ARCHIVED
- BR-SYSADMIN-018: Combining algorithm determines conflict resolution (DENY_OVERRIDES is default)

---

### UC-SYSADMIN-002: Test Policy Against Scenarios

**Actor**: IT Manager

**Goal**: Validate that a draft policy behaves correctly by testing it against defined test scenarios before activating in production.

**Priority**: High

**Complexity**: Medium

**Preconditions**:
- Policy exists with status DRAFT
- User has policy testing permissions
- Test scenarios defined or historical access requests available

**Main Flow**:
1. User navigates to System Administration → Permission Management → Policies
2. System displays policy list
3. User selects draft policy "Kitchen Manager Purchase Approval Policy" (POL-2501-0123)
4. User clicks "Test Policy" button
5. System displays policy testing interface with two options:
   - **Option A**: Test against existing scenarios
   - **Option B**: Create new test scenario
6. User selects "Test against existing scenarios"
7. System displays test scenario library filtered by policy type
8. System shows 15 pre-defined scenarios for manager approval policies
9. User selects 5 relevant scenarios to test:
   - **Scenario 1**: Kitchen manager approves $2,000 ingredient purchase (Expected: PERMIT)
   - **Scenario 2**: Kitchen manager approves $7,000 equipment purchase (Expected: DENY - exceeds limit)
   - **Scenario 3**: Kitchen manager approves purchase from different location (Expected: DENY - not in assigned locations)
   - **Scenario 4**: Kitchen manager approves own request (Expected: DENY - self-approval)
   - **Scenario 5**: General manager approves $2,000 from any department (Expected: PERMIT - GM override)
10. User clicks "Run Tests"
11. System executes test scenarios against draft policy:
    - For each scenario:
      * System constructs access request from scenario data
      * System evaluates request using draft policy
      * System compares actual result vs expected result
      * System captures evaluation details (rules passed/failed, obligations, advice)
12. System displays test results:
    ```
    Test Results: 5 scenarios tested
    ✓ Passed: 4 (80%)
    ✗ Failed: 1 (20%)

    Scenario 1: Kitchen manager approves $2,000 ingredient purchase
    Expected: PERMIT | Actual: PERMIT ✓
    Decision: All rules passed | Obligations: log_audit, notify_requester, update_status

    Scenario 2: Kitchen manager approves $7,000 equipment purchase
    Expected: DENY | Actual: DENY ✓
    Decision: Rule 1 failed (amount exceeds limit) | No access granted

    Scenario 3: Kitchen manager approves purchase from different location
    Expected: DENY | Actual: DENY ✓
    Decision: Rule 3 failed (location not in assigned locations)

    Scenario 4: Kitchen manager approves own request
    Expected: DENY | Actual: DENY ✓
    Decision: Rule 4 failed (self-approval not allowed)

    Scenario 5: General manager approves $2,000 from any department
    Expected: PERMIT | Actual: NOT_APPLICABLE ✗
    Decision: Target criteria not matched (role "general-manager" not in target)
    Issue: Policy target too restrictive, doesn't include GM override
    ```
13. User reviews failed test (Scenario 5)
14. User identifies issue: Policy target doesn't include General Manager override
15. User clicks "Edit Policy"
16. System returns to policy editor
17. User modifies Rule 2 to include GM override:
    - **Rule 2 (Modified)**:
      * Condition: `resource.requestingDepartment IN subject.departments`
      * **OR**: `subject.primaryRole = "general-manager"` (GM can approve any department)
18. User saves policy changes
19. User returns to testing interface
20. User clicks "Re-Run Tests"
21. System re-executes all 5 scenarios with modified policy
22. System displays updated results:
    ```
    Test Results: 5 scenarios tested
    ✓ Passed: 5 (100%)
    ✗ Failed: 0 (0%)

    All scenarios passed successfully. Policy ready for activation.
    ```
23. User reviews complete test report
24. User clicks "Save Test Results"
25. System saves test run with timestamp, scenarios, and results
26. System links test results to policy version history
27. System displays: "Test successful. Proceed to activate policy."

**Alternative Flows**:

**AF-002-1: Create Custom Test Scenario**
- At step 6, user selects "Create new test scenario"
- System displays scenario creation form
- User defines scenario details:
  * Scenario name: "Kitchen manager weekend approval"
  * Subject attributes: { role: "kitchen-manager", department: "Kitchen", clearanceLevel: "manager" }
  * Resource attributes: { type: "purchase_request", amount: 2500, category: "F&B" }
  * Action: "approve"
  * Environment: { timestamp: "2025-11-16T20:00:00Z", businessHours: false }
  * Expected result: DENY (outside business hours)
- System saves scenario to library
- System executes test
- Continue with step 12

**AF-002-2: Test Against Historical Access Requests**
- At step 6, user selects "Test against historical requests"
- System displays filter interface: "Select date range and request type"
- User selects: Last 30 days, Request type = purchase_request
- System queries 250 historical access requests matching criteria
- System tests policy against all 250 requests
- System generates summary:
  * 180 would be PERMIT (72%)
  * 60 would be DENY (24%)
  * 10 would be NOT_APPLICABLE (4%)
- System highlights discrepancies where historical decision differs from policy result
- User investigates significant discrepancies
- User adjusts policy if needed
- Continue with step 22

**AF-002-3: Batch Test Multiple Policies**
- User selects multiple draft policies (3 policies)
- User clicks "Batch Test"
- System tests all policies against same scenario set
- System generates comparative report showing how policies interact
- System identifies policy conflicts and overlaps
- User reviews conflicts and adjusts priorities
- Continue with step 23

**Exception Flows**:

**EF-002-1: Test Execution Error**
- At step 11, policy evaluation engine encounters runtime error
- System displays error: "Test failed for Scenario 3: Attribute 'subject.approvalLimit' not found in test subject data"
- System logs error with full context
- User adds missing attribute to scenario: approvalLimit = 5000
- User re-runs test
- Continue with step 12

**EF-002-2: All Tests Failed**
- At step 12, all 5 scenarios failed
- System displays: "Critical: All test scenarios failed. Policy logic may be incorrect."
- System highlights common failure pattern: "All failed on Rule 1 condition evaluation"
- User reviews Rule 1 logic
- User discovers syntax error in condition: `<=` written as `< =` (space)
- User corrects syntax
- User re-runs tests
- Return to step 11

**EF-002-3: Performance Degradation**
- At step 11, test execution takes >5 seconds per scenario
- System displays warning: "Policy evaluation slow. Average time: 8.2 seconds per request"
- System suggests optimization: "Complex nested conditions detected. Consider simplifying logic or creating attribute index."
- User reviews policy complexity metrics
- User optimizes policy by pre-calculating derived attributes
- User re-runs performance test
- System confirms: "Policy evaluation improved to 0.2 seconds per request"

**Postconditions**:
- Policy tested successfully against scenarios
- Test results documented and linked to policy version
- Policy confidence score calculated (based on test pass rate)
- Policy ready for activation if all tests passed
- Failed tests identified with specific error details
- Test scenarios reusable for future policy testing

**Business Rules**:
- BR-SYSADMIN-012: Policy testing required before activation (recommended practice)
- Policy must pass >90% of scenarios to be considered production-ready
- Test results retained for audit trail (7-year retention)

---

### UC-SYSADMIN-005: Configure Role Hierarchy

**Actor**: IT Manager

**Goal**: Create and manage a hierarchical role structure where child roles inherit permissions from parent roles, enabling efficient permission management and organizational alignment.

**Priority**: Critical

**Complexity**: Complex

**Preconditions**:
- User is logged in as IT Manager
- User has role management permissions
- Base system roles exist (admin, system_operator)

**Main Flow**:
1. User navigates to System Administration → Role Management → Role Hierarchy
2. System displays existing role hierarchy in tree view:
   ```
   ┌─ admin (Level 0)
   ├─ general-manager (Level 1)
   │  ├─ department-manager (Level 2)
   │  │  ├─ kitchen-manager (Level 3)
   │  │  ├─ restaurant-manager (Level 3)
   │  │  └─ housekeeping-manager (Level 3)
   │  └─ financial-manager (Level 2)
   │     ├─ purchasing-staff (Level 3)
   │     └─ accountant (Level 3)
   └─ staff (Level 1)
      ├─ chef (Level 2)
      ├─ server (Level 2)
      └─ housekeeper (Level 2)
   ```
3. User clicks "Add New Role"
4. System displays role creation form
5. User enters role details:
   - **Role Name**: "sous-chef"
   - **Display Name**: "Sous Chef"
   - **Description**: "Assistant to Executive Chef, responsible for kitchen operations in chef's absence"
   - **Parent Role**: Select "chef" from dropdown
   - **Level**: 3 (auto-calculated based on parent level + 1)
   - **Path**: "/staff/chef/sous-chef" (auto-generated hierarchical path)
6. User configures role attributes (stored as JSON):
   ```json
   {
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
     "requiredCertifications": [
       "food-safety",
       "kitchen-management"
     ]
   }
   ```
7. User defines base permissions for this role:
   - **Resource Type**: inventory_item
     * Actions: view, create, update (but NOT delete - requires chef)
     * Conditions: productCategory = "Food & Beverage", department = "Kitchen"
   - **Resource Type**: purchase_request
     * Actions: view, create, approve (up to $2,000)
     * Conditions: requestingDepartment = "Kitchen", amount <= 2000
   - **Resource Type**: production_order
     * Actions: view, create, update, approve
     * Conditions: department = "Kitchen"
8. User configures permission inheritance:
   - **Inherit from Parent**: Yes (inherit all "chef" base permissions)
   - **Override Permissions**: Add approval permission (chef doesn't have approval)
   - **Additional Restrictions**: Cannot delete inventory items (chef can)
9. User sets role time and location restrictions:
   - **Location Restrictions**: Must be working from main-kitchen or prep-kitchen
   - **Time Restrictions**: Can access system during assigned shifts only (morning, afternoon, evening)
   - **IP Restrictions**: Internal network only (no external access)
10. User assigns role color and icon for UI:
    - **Color**: Orange (#FF6B35)
    - **Icon**: chef-hat
11. User sets role status:
    - **Is Active**: Yes
    - **Is System Role**: No (can be modified)
12. User clicks "Save Role"
13. System validates role configuration:
    - Role name unique within organization
    - Parent role exists and is active
    - Hierarchy depth ≤ 10 levels (maximum)
    - No circular references in hierarchy
    - All referenced resources and attributes exist
    - Permission inheritance logic valid
14. System saves role to database
15. System updates role hierarchy path for all affected roles
16. System recalculates effective permissions for users with this role
17. System invalidates permission cache for affected users
18. System logs role creation in audit trail
19. System displays success message: "Role 'sous-chef' created successfully under parent role 'chef'"
20. System returns to role hierarchy view with new role visible in tree

**Alternative Flows**:

**AF-005-1: Create Multiple Sibling Roles in Batch**
- At step 3, user selects parent role "department-manager"
- User clicks "Add Multiple Child Roles"
- System displays batch role creation interface
- User enters multiple roles:
  * Role 1: "bar-manager" - Bar Operations Manager
  * Role 2: "banquet-manager" - Banquet & Events Manager
  * Role 3: "stewarding-manager" - Stewarding & Cleaning Manager
- System creates all roles with same parent, auto-generates paths
- System applies common attributes to all (clearanceLevel, approvalLimit)
- User customizes specific permissions per role
- System saves all roles in single transaction
- System displays: "3 roles created successfully under 'department-manager'"

**AF-005-2: Restructure Hierarchy (Move Role)**
- User selects existing role "purchasing-staff"
- User clicks "Change Parent Role"
- System displays parent role selector
- User changes parent from "financial-manager" to "department-manager"
- System displays warning: "This will affect 12 users. Effective permissions will change."
- System shows permission comparison: Before vs After
- User confirms change
- System updates role hierarchy
- System recalculates permissions for all affected users
- System sends notification to affected users: "Your role permissions have been updated"
- System logs hierarchy change in audit trail

**AF-005-3: Clone Role to Different Department**
- User selects "kitchen-manager" role
- User clicks "Clone for Another Department"
- System creates copy with name: "restaurant-manager"
- System prompts: "Update department-specific attributes?"
- User modifies:
  * Department: "Restaurant" (was "Kitchen")
  * assignedLocations: ['main-dining', 'bar-area'] (was ['main-kitchen'])
- User adjusts permissions to match restaurant operations
- System saves cloned role
- System displays: "Role cloned and customized for Restaurant department"

**Exception Flows**:

**EF-005-1: Maximum Hierarchy Depth Exceeded**
- At step 13, validation detects hierarchy would exceed 10 levels
- System displays error: "Cannot create role at level 11. Maximum hierarchy depth is 10 levels."
- System suggests: "Flatten hierarchy by reducing intermediate levels or choose different parent role."
- User selects higher-level parent role (reduces depth)
- Return to step 12 to re-save

**EF-005-2: Circular Reference Detected**
- User attempts to change parent of "chef" to "sous-chef" (its own child)
- At step 13, validation detects circular reference
- System displays error: "Circular reference detected: 'chef' cannot be a child of 'sous-chef' as 'sous-chef' is already a child of 'chef'"
- System prevents save
- User cancels operation

**EF-005-3: Permission Inheritance Conflict**
- At step 13, validation finds inherited permission conflicts with explicitly defined permission
- System displays warning: "Conflict: Parent role 'chef' grants DELETE on inventory_item, but this role explicitly denies DELETE"
- System asks: "How to resolve? (1) Override parent (deny takes precedence), (2) Inherit from parent (permit takes precedence)"
- User selects: "Override parent (deny takes precedence)"
- System applies override logic
- Continue with step 14

**EF-005-4: Users Assigned to Role Being Modified**
- At step 13, system detects 25 users currently assigned to role being modified
- System displays: "25 users will be affected by this change. Permission recalculation required."
- System estimates: "Recalculation will take approximately 15 seconds"
- User confirms: "Proceed with changes"
- System saves role
- System queues permission recalculation jobs for all 25 users
- System displays progress: "Recalculating permissions... 12 of 25 complete"
- System completes recalculation
- System displays: "Role updated. All user permissions recalculated successfully."

**Postconditions**:
- Role created and saved in role hierarchy
- Parent-child relationships established
- Permission inheritance configured correctly
- Role visible in role selection dropdowns
- Audit trail entry created
- Permission cache invalidated for affected users
- Users can be assigned to new role immediately

**Business Rules**:
- BR-SYSADMIN-002: Role hierarchy inheritance must be valid (child inherits from parent)
- BR-SYSADMIN-002: Maximum hierarchy depth: 10 levels
- BR-SYSADMIN-003: Each user must have exactly one primary role
- BR-SYSADMIN-017: System roles (admin, system_operator) cannot be deleted

---

### UC-SYSADMIN-006: Assign Role to User with Context

**Actor**: Department Manager

**Goal**: Assign one or more roles to a user with specific contextual scope (departments, locations, time periods) to grant precise, situational access.

**Priority**: Critical

**Complexity**: Medium

**Preconditions**:
- User is logged in as Department Manager
- User has permission to assign roles within their department
- Target user exists in system
- Roles defined in role hierarchy

**Main Flow**:
1. User navigates to System Administration → User Management → Users
2. System displays user list filtered by department (Department Manager sees only their department)
3. User searches for employee: "John Smith - Chef"
4. User clicks on employee name to view profile
5. System displays user profile with current role assignments:
   ```
   Current Role Assignments:
   ┌─ Primary Role: chef
   │  Department: Kitchen
   │  Location: Main Kitchen
   │  Effective: 2024-01-15 to (no end date)
   │  Status: Active
   └─ Additional Roles: None
   ```
6. User clicks "Assign Additional Role"
7. System displays role assignment form
8. User selects role from dropdown: "sous-chef"
9. System displays role details and permissions preview
10. User configures contextual assignment:
    - **Is Primary Role**: No (chef remains primary role)
    - **Effective From**: 2025-11-13 (today)
    - **Effective To**: 2026-02-28 (temporary assignment for 3 months)
    - **Reason**: "Covering for sous chef on maternity leave"
11. User defines assignment scope:
    - **Assigned Departments**: Kitchen (inherited from role default)
    - **Assigned Locations**: Main Kitchen, Prep Kitchen (select multiple)
    - **Work Shifts**: Morning, Afternoon, Evening (can approve during all shifts)
12. User configures custom attributes for this assignment:
    - **Custom Approval Limit**: $2,500 (higher than role default $2,000 due to temporary seniority)
    - **Training Completed**: Yes (sous-chef specific training)
    - **Certifications**: Food Safety Advanced, Kitchen Management (verified)
13. User sets delegated authorities:
    - **Can Delegate To**: Other chefs in Kitchen department
    - **Can Act As**: Sous chef (for email signatures and approvals)
14. User adds internal notes: "Temporary assignment while Jane Doe is on maternity leave. Review progress monthly."
15. User clicks "Assign Role"
16. System validates assignment:
    - Role exists and is active
    - User doesn't already have this exact role assignment
    - Effective dates valid (From < To)
    - Assigned locations valid for user's employment
    - Custom approval limit doesn't exceed role maximum ($3,000)
17. System checks subscription limits:
    - Organization subscription: 50 users allowed
    - Current active users: 42
    - New assignment doesn't add user (same user, additional role)
    - Limit check: Pass ✓
18. System creates role assignment record:
    - Links user to role
    - Stores contextual scope (departments, locations, shifts)
    - Records custom attributes
    - Sets effective date range
19. System recalculates user's effective permissions:
    - Combines permissions from chef (primary) + sous-chef (additional)
    - Applies most permissive logic (union of permissions)
    - Considers context restrictions (locations, shifts, time range)
20. System invalidates permission cache for this user
21. System logs role assignment in audit trail:
    - Actor: Department Manager (UserID)
    - Action: Role Assignment Created
    - Target User: John Smith
    - Role: sous-chef
    - Context: Kitchen dept, Main+Prep Kitchen locations
    - Reason: Temporary assignment
22. System sends notification to user:
    - Email: "New role assigned: Sous Chef (effective 2025-11-13)"
    - System notification with role details and new permissions
23. User receives notification on next login
24. System displays success message: "Role 'sous-chef' assigned successfully to John Smith (effective 2025-11-13 to 2026-02-28)"
25. System returns to user profile showing updated role assignments:
    ```
    Current Role Assignments:
    ┌─ Primary Role: chef
    │  Department: Kitchen | Location: Main Kitchen
    │  Effective: 2024-01-15 to (no end date)
    │  Status: Active
    └─ Additional Role: sous-chef (Temporary)
       Department: Kitchen | Locations: Main Kitchen, Prep Kitchen
       Effective: 2025-11-13 to 2026-02-28
       Approval Limit: $2,500 (custom)
       Status: Active
    ```

**Alternative Flows**:

**AF-006-1: Assign Primary Role to New Employee**
- At step 4, user views new employee profile with no roles assigned
- User clicks "Assign Primary Role"
- System requires primary role assignment
- User selects "chef" as primary role
- User configures assignment (same as steps 10-14)
- System sets **Is Primary Role**: Yes (mandatory for first assignment)
- System creates primary role assignment
- User now has system access based on chef permissions

**AF-006-2: Change Primary Role**
- At step 6, user clicks "Change Primary Role"
- System displays: "Changing primary role will affect all permissions. Current primary: chef"
- User selects new primary role: "kitchen-manager" (promotion)
- System prompts: "Keep chef as additional role? Yes/No"
- User selects: "Yes, keep as additional role"
- System updates assignments:
  * Primary role: kitchen-manager (new)
  * Additional role: chef (previous primary)
- System recalculates all permissions
- System sends notification: "Congratulations! You've been promoted to Kitchen Manager"

**AF-006-3: Bulk Role Assignment (Onboarding Multiple Employees)**
- User clicks "Bulk Assign Roles"
- System displays CSV upload interface
- User uploads CSV with employee data:
  ```
  employee_id,role,department,location,effective_from,approval_limit
  EMP-001,server,Restaurant,Main Dining,2025-11-13,500
  EMP-002,server,Restaurant,Main Dining,2025-11-13,500
  EMP-003,bartender,Restaurant,Bar Area,2025-11-13,1000
  ```
- System validates all rows
- System creates role assignments for all employees
- System displays summary: "3 role assignments created successfully"

**AF-006-4: Temporary Role Elevation (Urgent Approval)**
- User (General Manager) needs to grant temporary emergency approval authority
- User selects employee: "Mary Johnson - Purchasing Staff"
- User clicks "Grant Temporary Elevation"
- System displays emergency elevation form:
  * Elevated Role: "purchasing-manager"
  * Duration: 24 hours
  * Reason: "Emergency vendor payment required, manager unavailable"
- System creates temporary assignment expiring in 24 hours
- System sends alert to IT Manager: "Temporary elevation granted"
- After 24 hours, system auto-revokes elevation
- System sends notification: "Temporary elevation expired"

**Exception Flows**:

**EF-006-1: Approval Required for Assignment**
- At step 16, user (Department Manager) attempts to assign "financial-manager" role
- System detects role outside department manager's scope
- System displays: "This role assignment requires General Manager approval"
- System saves assignment with status: "Pending Approval"
- System sends approval request to General Manager
- General Manager reviews and approves
- System activates role assignment
- User receives notification of approval

**EF-006-2: Subscription Limit Exceeded**
- At step 17, subscription check fails
- System displays error: "Subscription limit reached. Maximum users: 50. Current active: 50."
- System blocks assignment
- System suggests: "Contact administrator to upgrade subscription plan"
- User cancels assignment
- User notifies IT Manager to upgrade plan

**EF-006-3: Custom Approval Limit Exceeds Role Maximum**
- At step 16, validation detects custom limit $4,000 exceeds role max $3,000
- System displays error: "Custom approval limit ($4,000) exceeds role maximum ($3,000)"
- System suggests: "Reduce custom limit to $3,000 or request role limit increase"
- User reduces custom limit to $3,000
- Return to step 15 to re-attempt assignment

**EF-006-4: Conflicting Role Assignment**
- At step 16, system detects user already has "kitchen-manager" role
- "kitchen-manager" and "sous-chef" have conflicting permissions (manager can override sous chef decisions)
- System displays warning: "Potential conflict: User already has higher authority role (kitchen-manager)"
- System asks: "Proceed with assignment anyway? This may cause permission ambiguity."
- User selects: "No, cancel assignment"
- User reviews permission requirements
- User assigns different role if needed

**Postconditions**:
- Role assigned to user with complete contextual scope
- User's effective permissions recalculated
- Permission cache invalidated
- User receives notification of new role and permissions
- Audit trail entry created with full assignment details
- User can immediately use new permissions within scope

**Business Rules**:
- BR-SYSADMIN-003: Each user must have exactly one primary role
- BR-SYSADMIN-004: User approval limits must not exceed role maximum
- BR-SYSADMIN-005: Subscription limits enforced (hard stop)
- BR-SYSADMIN-008: Role assignments with scope only grant access within boundaries

---

## System Use Cases

### UC-SYSADMIN-101: Evaluate Access Request

**Actor**: Policy Evaluation Engine (Automated Service)

**Goal**: Automatically evaluate an access request against all applicable ABAC policies to determine if access should be granted or denied.

**Priority**: Critical

**Complexity**: Complex

**Trigger**:
- User attempts to perform action on resource (e.g., approve purchase request)
- Application calls ABAC service with access request
- API endpoint: POST /api/abac/evaluate

**Main Flow**:
1. Application receives user action: "User JohnSmith attempts to approve Purchase Request PR-2501-0123"
2. Application constructs access request payload:
   ```json
   {
     "requestType": "permission_check",
     "sessionId": "sess-abc123",
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
         "productSubcategory": "Ingredients",
         "requestingDepartment": "Kitchen",
         "requestedBy": "user-jane-doe",
         "location": "main-kitchen",
         "status": "pending_approval",
         "urgent": false
       }
     },
     "action": {
       "actionType": "approve",
       "attributes": {
         "approvalLevel": 1,
         "bypassReview": false,
         "reason": "Approve ingredient purchase for weekend prep"
       }
     },
     "environment": {
       "timestamp": "2025-11-13T09:30:00Z",
       "ipAddress": "192.168.1.100",
       "location": "main-kitchen",
       "networkZone": "internal",
       "deviceType": "desktop",
       "threatLevel": "low",
       "businessHours": true
     }
   }
   ```
3. Application sends access request to Policy Evaluation Engine
4. Policy Evaluation Engine receives request
5. System validates request structure:
   - All required fields present (subject, resource, action, environment)
   - Subject userId exists and is active
   - Resource type defined in resource definitions
   - Action type valid for resource type
6. System checks permission cache:
   - Generates cache key: hash(userId + resourceType + actionType + context)
   - Searches cache for matching decision
   - Cache key: `cache-john-kitchen-pr-approve-kitchen`
7. Cache miss (no cached decision found)
8. System retrieves applicable policies:
   - Queries policy database
   - Filters by status = "ACTIVE"
   - Filters by validity period (current timestamp within validFrom-validTo)
   - Filters by target criteria matching request attributes
   - Example filters:
     * subject.role IN ['kitchen-manager', 'chef']
     * resource.type = "purchase_request"
     * action = "approve"
     * environment.businessHours = true
9. System finds 3 applicable policies:
   - Policy 1: "Kitchen Manager Purchase Approval Policy" (Priority 100)
   - Policy 2: "All Manager Approval Policy" (Priority 200)
   - Policy 3: "Deny External Network Approvals" (Priority 50)
10. System sorts policies by priority (ascending: 50, 100, 200)
11. System evaluates policies in order:
    - **Policy 3** (Priority 50, Highest precedence):
      * Effect: DENY
      * Target: networkZone = "external"
      * Current request: networkZone = "internal"
      * Result: NOT_APPLICABLE (target doesn't match)
    - **Policy 1** (Priority 100):
      * Effect: PERMIT
      * Target: role = "kitchen-manager", resourceType = "purchase_request", action = "approve"
      * Target Match: ✓ (all criteria match)
      * Rules to evaluate:
        - Rule 1: `resource.requestValue (2500) <= subject.approvalLimit (5000)` → ✓ Pass
        - Rule 2: `resource.requestingDepartment (Kitchen) IN subject.departments ([Kitchen])` → ✓ Pass
        - Rule 3: `resource.location (main-kitchen) IN subject.assignedLocations ([main-kitchen, prep-kitchen])` → ✓ Pass
        - Rule 4: `resource.requestedBy (user-jane-doe) != subject.userId (user-john-smith)` → ✓ Pass (not self-approval)
      * All Rules Pass: ✓
      * Decision: PERMIT
      * Obligations: ['log_audit', 'notify_requester', 'update_status']
      * Advice: ['request_value_over_2000_recommend_secondary_review']
    - **Policy 2** (Priority 200):
      * Effect: PERMIT
      * (Not evaluated - Policy 1 already returned PERMIT and no DENY policy matched)
12. System applies combining algorithm: DENY_OVERRIDES
    - No DENY policies matched
    - Policy 1 returned PERMIT
    - Final Decision: **PERMIT**
13. System constructs evaluation result:
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
        { 'adviceId': 'recommend_secondary_review', 'message': 'Request value exceeds $2,000. Consider secondary approval.' }
      ],
      "evaluationTime": 45,
      "processingTime": 12,
      "timestamp": "2025-11-13T09:30:01.057Z"
    }
    ```
14. System logs evaluation in access_requests table
15. System logs detailed evaluation in policy_evaluation_logs table
16. System caches decision (UC-SYSADMIN-102)
17. System returns evaluation result to application
18. Application receives result: Decision = PERMIT
19. Application executes obligations:
    - Obligation 1: Log audit → Creates audit log entry
    - Obligation 2: Notify requester → Sends email to Jane Doe: "Your purchase request has been approved by John Smith"
    - Obligation 3: Update status → Changes PR status to "Approved"
20. Application displays advice to user:
    - Message: "Approval successful. Recommendation: Request value $2,500 exceeds $2,000. Consider secondary approval from General Manager."
21. Application grants access: Purchase request marked as approved
22. User sees success message: "Purchase Request PR-2501-0123 approved successfully"

**Alternative Flows**:

**AF-101-1: Cache Hit (Faster Evaluation)**
- At step 7, cache contains matching decision
- System retrieves cached result: PERMIT (cached 5 minutes ago)
- System validates cache freshness:
  * Cache age: 5 minutes
  * Cache TTL: 15 minutes
  * Cache valid: ✓
- System checks cache invalidation conditions:
  * Policy not modified since cache creation
  * User role assignment not changed
  * User attributes not modified
- Cache still valid
- System returns cached decision immediately (skip steps 8-17)
- Processing time: 3ms (vs 45ms for full evaluation)
- System logs cache hit in metrics

**AF-101-2: Multiple Policies Match with DENY**
- At step 11, Policy 3 "Deny External Network Approvals" matches target
- Policy 3 evaluation:
  * Target: networkZone = "external"
  * Current request: networkZone = "external" (user working remotely)
  * Target Match: ✓
  * Effect: DENY
  * Decision: DENY
- System applies combining algorithm: DENY_OVERRIDES
- One DENY policy matched
- Final Decision: **DENY** (even though Policy 1 would PERMIT)
- System constructs denial result with reason: "Access denied: Approvals not allowed from external network"
- Application blocks access
- User sees error: "Approval denied. Approvals must be performed from internal network."

**AF-101-3: No Applicable Policies**
- At step 8, no policies match request criteria
- System returns decision: NOT_APPLICABLE
- Application applies default behavior: Deny by default
- Final Decision: **DENY**
- User sees error: "Access denied. No permission policy grants this action."
- System logs exception for IT review
- IT Manager receives alert: "Access request denied due to no applicable policies"

**Exception Flows**:

**EF-101-1: Invalid Request Structure**
- At step 5, validation fails
- Missing required field: `subject.userId` is null
- System returns error:
  ```json
  {
    "decision": "INDETERMINATE",
    "error": "Invalid request structure: subject.userId is required",
    "errorCode": "INVALID_REQUEST_STRUCTURE"
  }
  ```
- Application logs error
- Application displays: "Permission check failed. Please try again or contact support."

**EF-101-2: Policy Evaluation Error**
- At step 11, policy rule evaluation encounters runtime error
- Rule condition: `resource.requestValue <= subject.approvalLimit`
- Error: `subject.approvalLimit` is null (attribute missing)
- System catches exception
- System logs error with full context
- System returns decision: INDETERMINATE
- Application denies access by default
- System sends alert to IT Manager: "Policy evaluation error for POL-2501-0123"

**EF-101-3: Evaluation Timeout**
- At step 11, policy evaluation exceeds timeout (5 seconds)
- Complex policy with nested conditions taking too long
- System terminates evaluation
- System returns decision: INDETERMINATE
- Application denies access
- System logs performance issue
- System triggers alert: "Policy POL-2501-0123 evaluation timeout. Optimization required."

**EF-101-4: Database Unavailable**
- At step 8, database query for policies fails
- Connection timeout or database offline
- System attempts retry (3 attempts with exponential backoff)
- All retries fail
- System returns decision: INDETERMINATE
- Application denies access
- System sends critical alert to System Administrator
- Manual intervention required

**Postconditions**:
- Access request evaluated successfully
- Decision returned (PERMIT, DENY, NOT_APPLICABLE, or INDETERMINATE)
- Evaluation logged in database
- Detailed evaluation trace stored for audit
- Decision cached for future requests
- Performance metrics updated
- Obligations returned to application for execution
- User receives access granted or denied based on decision

**Performance Requirements**:
- Cached evaluation: <10ms
- Non-cached evaluation: <200ms
- Retry on error: 3 attempts with exponential backoff
- Timeout: 5 seconds (hard limit)
- Target error rate: <0.1%

**Business Rules**:
- BR-SYSADMIN-001: Policies evaluated in priority order (0 = highest priority)
- BR-SYSADMIN-018: Combining algorithm determines conflict resolution (DENY_OVERRIDES default)
- BR-SYSADMIN-011: Environment attributes refreshed on each evaluation
- BR-SYSADMIN-009: Cache invalidated when policy, role, or user attributes change

---

## Integration Use Cases

### UC-SYSADMIN-201: Approve Purchase Request via Workflow

**Actor**: Procurement System Integration

**Goal**: Use ABAC system to enforce approval workflow for purchase requests with stage-based routing and permission checks.

**Priority**: Critical

**Complexity**: Complex

**Trigger**:
- User submits purchase request in procurement system
- Purchase request status changes to "Pending Approval"
- Workflow engine triggered to process approval routing

**Main Flow**:
1. User (Chef) creates purchase request in procurement system:
   - **Request ID**: PR-2501-0123
   - **Amount**: $2,500
   - **Category**: Food & Beverage - Ingredients
   - **Department**: Kitchen
   - **Requested Items**: Vegetables, meat, dairy
2. User clicks "Submit for Approval"
3. Procurement system validates request data
4. Procurement system changes status to "Pending Approval"
5. Procurement system calls Workflow Engine: "Determine approval workflow for PR-2501-0123"
6. Workflow Engine retrieves workflow configuration for "Purchase Request Approval":
   ```json
   {
     "workflowId": "WF-PR-001",
     "name": "Purchase Request Approval Workflow",
     "type": "purchase_request",
     "stages": [
       {
         "stageId": 1,
         "name": "Department Manager Approval",
         "sla": "24 hours",
         "assignedRoles": ['kitchen-manager', 'department-manager'],
         "availableActions": ['approve', 'reject', 'send_back'],
         "requiredApprovalLimit": 5000
       },
       {
         "stageId": 2,
         "name": "General Manager Approval",
         "sla": "48 hours",
         "assignedRoles": ['general-manager'],
         "availableActions": ['approve', 'reject', 'send_back'],
         "requiredApprovalLimit": 10000
       },
       {
         "stageId": 3,
         "name": "Finance Approval",
         "sla": "24 hours",
         "assignedRoles": ['financial-manager'],
         "availableActions": ['approve', 'reject'],
         "requiredApprovalLimit": 999999
       }
     ],
     "routingRules": [
       {
         "triggerStage": 1,
         "condition": { "field": "amount", "operator": "<=", "value": 5000 },
         "action": "SKIP_STAGE",
         "targetStage": 2
       },
       {
         "triggerStage": 2,
         "condition": { "field": "amount", "operator": "<=", "value": 10000 },
         "action": "SKIP_STAGE",
         "targetStage": 3
       }
     ]
   }
   ```
7. Workflow Engine evaluates routing rules for Stage 1:
   - Rule: IF amount <= $5,000 THEN approve at Stage 1, SKIP Stage 2
   - Request amount: $2,500
   - Condition: $2,500 <= $5,000 → ✓ True
   - Action: Stage 1 approves, Skip Stage 2 (General Manager approval not needed)
8. Workflow Engine determines current stage: Stage 1 (Department Manager Approval)
9. Workflow Engine retrieves eligible approvers for Stage 1:
   - Query users with roles: ['kitchen-manager', 'department-manager']
   - Filter by: Department = "Kitchen", Location includes request location
   - Filter by: approvalLimit >= $2,500
   - Result: 2 eligible approvers found:
     * John Smith - Kitchen Manager (approvalLimit: $5,000)
     * Sarah Lee - Department Manager (approvalLimit: $10,000)
10. Workflow Engine assigns request to Stage 1 approvers
11. Workflow Engine sends notifications:
    - Email to John Smith: "Purchase Request PR-2501-0123 requires your approval ($2,500)"
    - Email to Sarah Lee: "Purchase Request PR-2501-0123 assigned for approval"
    - System notification to both users
12. John Smith receives notification, opens purchase request
13. John Smith reviews request details
14. John Smith clicks "Approve Request"
15. Procurement system calls ABAC Evaluation Engine (UC-SYSADMIN-101):
    - Subject: John Smith (kitchen-manager, approvalLimit: $5,000)
    - Resource: PR-2501-0123 (amount: $2,500, category: F&B Ingredients)
    - Action: approve
    - Environment: businessHours: true, networkZone: internal
16. ABAC Evaluation Engine evaluates access request:
    - Policy: "Kitchen Manager Purchase Approval Policy" (POL-2501-0123)
    - Rules checked:
      * Amount ($2,500) <= approval limit ($5,000) → ✓ Pass
      * Department (Kitchen) matches → ✓ Pass
      * Location authorized → ✓ Pass
      * Not self-approval → ✓ Pass
    - Decision: **PERMIT**
17. Procurement system receives PERMIT decision
18. Procurement system executes approval:
    - Updates request status: "Approved - Stage 1"
    - Records approver: John Smith
    - Records approval timestamp: 2025-11-13T10:15:00Z
    - Executes obligations:
      * Log audit entry
      * Notify requester (Chef)
      * Update request status
19. Workflow Engine evaluates next stage:
    - Current stage: 1 (completed)
    - Routing rule: Amount ($2,500) <= $5,000 → Skip Stage 2
    - Next stage: Stage 3 (Finance Approval) - Actually, amount <= $5,000 means no finance approval needed
    - **Workflow complete** (amount under all thresholds)
20. Procurement system finalizes approval:
    - Changes request status: "Fully Approved"
    - Generates purchase order: PO-2501-00456
    - Sends to vendor for fulfillment
21. System sends notifications:
    - Email to Chef (requester): "Your purchase request has been fully approved. PO-2501-00456 created."
    - Email to John Smith (approver): "Purchase request approved successfully"
    - Email to Purchasing team: "New PO ready for processing: PO-2501-00456"
22. Audit Log Service records complete workflow:
    - Request created by Chef
    - Routed to Kitchen Manager
    - Approved by John Smith
    - Skipped General Manager approval (amount <= threshold)
    - PO generated
    - Complete audit trail preserved

**Alternative Flows**:

**AF-201-1: Multi-Stage Approval Required (High Value)**
- At step 1, user creates request with amount: $12,000
- At step 7, routing evaluation:
  * Stage 1 rule: $12,000 > $5,000 → Proceed to Stage 2 (no skip)
  * Stage 2 rule: $12,000 > $10,000 → Proceed to Stage 3 (no skip)
- Workflow requires all 3 stages:
  * Stage 1: Kitchen Manager approves
  * Stage 2: General Manager approves
  * Stage 3: Financial Manager approves
- Each stage follows steps 12-18
- After all approvals, request fully approved
- PO created

**AF-201-2: Approval Denied**
- At step 14, John Smith clicks "Reject Request"
- Reason: "Budget exhausted for this month. Defer to next month."
- ABAC evaluation: Checks "reject" permission → PERMIT
- Procurement system records rejection:
  * Status: "Rejected - Stage 1"
  * Rejector: John Smith
  * Rejection reason: Budget exhausted
- Workflow Engine terminates workflow
- System notifies requester: "Your request has been rejected. Reason: Budget exhausted for this month."
- Request closed, cannot be resubmitted without modifications

**AF-201-3: Send Back for Revision**
- At step 14, John Smith clicks "Send Back"
- Reason: "Need more detail on quantities and pricing"
- ABAC evaluation: Checks "send_back" permission → PERMIT
- Procurement system changes status: "Sent Back for Revision"
- System notifies requester: "Please revise request. Comments: Need more detail on quantities and pricing"
- Chef revises request, resubmits
- Workflow restarts from Stage 1

**Exception Flows**:

**EF-201-1: ABAC Denies Approval**
- At step 16, ABAC evaluation returns DENY
- Reason: John Smith attempting to approve own request (self-approval)
- Procurement system blocks approval action
- System displays error: "You cannot approve your own purchase request"
- Request remains pending
- Alternative: Another kitchen manager must approve

**EF-201-2: No Eligible Approvers Found**
- At step 9, workflow engine finds 0 eligible approvers
- All kitchen managers on leave or unavailable
- Workflow Engine escalates to parent role: Department Manager
- Finds 1 eligible approver: Sarah Lee (Department Manager)
- Assigns to Sarah Lee
- Continues workflow

**EF-201-3: SLA Violation**
- Request pending at Stage 1 for >24 hours (SLA: 24 hours)
- Workflow Engine detects SLA breach
- System sends escalation notification:
  * Email to General Manager: "SLA violation: PR-2501-0123 pending >24 hours"
  * Email to Kitchen Manager (assigned approver): "Urgent: Approval overdue"
- System logs SLA violation
- Request remains pending until approval or escalation

**EF-201-4: Workflow Configuration Error**
- At step 6, workflow configuration retrieval fails
- Workflow not defined for "purchase_request" type
- Workflow Engine returns error
- Procurement system falls back to default workflow: Direct to General Manager
- General Manager approves all requests
- System logs configuration error
- Alert sent to IT Manager: "Workflow configuration missing for purchase_request"

**Postconditions**:
- Purchase request approved or rejected based on workflow
- All approvals validated through ABAC system
- Complete audit trail of workflow progression
- SLA compliance tracked
- Notifications sent to all stakeholders
- Purchase order generated (if approved)
- Request status updated throughout process

**Integration Points**:
- **ABAC Evaluation Engine**: Permission checks at each stage
- **Workflow Routing Engine**: Stage determination and routing
- **Notification Service**: Email and system notifications
- **Audit Log Service**: Complete workflow audit trail
- **Procurement System**: Request management and PO generation

**Business Rules**:
- BR-SYSADMIN-012: Workflow stages must be completed sequentially
- BR-SYSADMIN-013: SLA countdown starts when stage becomes active
- BR-SYSADMIN-004: Approval limits enforced per user role assignment
- Self-approval not allowed (enforced by ABAC policy)

---

## Use Case Traceability Matrix

| Functional Requirement | Related Use Cases |
|------------------------|-------------------|
| FR-SYSADMIN-001: Dynamic Policy Management | UC-SYSADMIN-001, UC-SYSADMIN-002, UC-SYSADMIN-003 |
| FR-SYSADMIN-002: Dynamic Resource Definitions | UC-SYSADMIN-004 |
| FR-SYSADMIN-003: Role-Based Access with Hierarchy | UC-SYSADMIN-005 |
| FR-SYSADMIN-004: User Profile Management | UC-SYSADMIN-007 |
| FR-SYSADMIN-005: Contextual Role Assignment | UC-SYSADMIN-006, UC-SYSADMIN-008 |
| FR-SYSADMIN-006: Dynamic Attribute Management | UC-SYSADMIN-007 |
| FR-SYSADMIN-007: Access Request Evaluation | UC-SYSADMIN-101 |
| FR-SYSADMIN-008: Workflow Configuration | UC-SYSADMIN-009, UC-SYSADMIN-010, UC-SYSADMIN-104, UC-SYSADMIN-201 |
| FR-SYSADMIN-009: Location and Department Management | UC-SYSADMIN-011, UC-SYSADMIN-012 |
| FR-SYSADMIN-010: Subscription Package Management | UC-SYSADMIN-106 |
| FR-SYSADMIN-011: Comprehensive Audit Logging | UC-SYSADMIN-013, UC-SYSADMIN-014, UC-SYSADMIN-015 |
| FR-SYSADMIN-012: Policy Testing Framework | UC-SYSADMIN-002 |
| FR-SYSADMIN-013: Performance Monitoring | UC-SYSADMIN-016, UC-SYSADMIN-102, UC-SYSADMIN-105 |

---

**Document Control**:
- **Created**: 2025-11-13
- **Author**: Carmen ERP Documentation Team
- **Reviewed By**: IT Manager, Security Officer, System Architect
- **Approved By**: CTO, Compliance Officer
- **Next Review**: 2025-12-13

---

**Document End**
