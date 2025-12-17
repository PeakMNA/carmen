# Technical Specification: System Administration

## Module Information
- **Module**: System Administration
- **Sub-Module**: ABAC Permission Management, User Management, Workflow Configuration
- **Route**: `/system-administration`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-13
- **Owner**: IT & Platform Engineering Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-13 | Documentation Team | Initial version based on schema.prisma ABAC architecture |

---

## Overview

The System Administration module implements a comprehensive Attribute-Based Access Control (ABAC) permission system for the Carmen hospitality ERP platform. The system provides fine-grained, dynamic permission management based on user attributes, resource properties, and environmental context, enabling flexible security policies that adapt to complex hospitality business requirements.

**Key Technical Features**:
- **Dynamic JSON-based policies** with target, rules, obligations, and advice structures
- **Hierarchical role system** with multi-level inheritance (up to 10 levels)
- **Contextual user assignments** scoped by department, location, time period, and shift
- **Real-time policy evaluation engine** with caching for performance (<200ms non-cached, <10ms cached)
- **Flexible workflow routing** based on request attributes and business rules
- **Comprehensive audit logging** with 7-year retention for compliance

**⚠️ IMPORTANT: This is a Technical Specification Document - TEXT FORMAT ONLY**
- **DO NOT include actual code** - describe implementation patterns in text
- **DO include**: Architecture descriptions, component responsibilities, data flow descriptions, integration patterns
- **Focus on**: WHAT components do, HOW they interact, WHERE data flows - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-system-administration.md)
- [Use Cases](./UC-system-administration.md)
- [Data Schema](./DS-system-administration.md)
- [Flow Diagrams](./FD-system-administration.md)
- [Validations](./VAL-system-administration.md)

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Overview sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/system-administration)']
    CreatePage['Create Page<br>(/system-administration/new)']
    DetailPage["Detail Page<br>(/system-administration/[id])"]
    EditPage["Edit Page<br>(/system-administration/[id]/edit)"]

    %% List Page Tabs
    ListPage --> ListTab1['Tab: All Items']
    ListPage --> ListTab2['Tab: Active']
    ListPage --> ListTab3['Tab: Archived']

    %% List Page Dialogues
    ListPage -.-> ListDialog1['Dialog: Quick Create']
    ListPage -.-> ListDialog2['Dialog: Bulk Actions']
    ListPage -.-> ListDialog3['Dialog: Export']
    ListPage -.-> ListDialog4['Dialog: Filter']

    %% Detail Page Tabs
    DetailPage --> DetailTab1['Tab: Overview']
    DetailPage --> DetailTab2['Tab: History']
    DetailPage --> DetailTab3['Tab: Activity Log']

    %% Detail Page Dialogues
    DetailPage -.-> DetailDialog1['Dialog: Edit']
    DetailPage -.-> DetailDialog2['Dialog: Delete Confirm']
    DetailPage -.-> DetailDialog3['Dialog: Status Change']

    %% Create/Edit Dialogues
    CreatePage -.-> CreateDialog1['Dialog: Cancel Confirm']
    CreatePage -.-> CreateDialog2['Dialog: Save Draft']

    EditPage -.-> EditDialog1['Dialog: Discard Changes']
    EditPage -.-> EditDialog2['Dialog: Save Draft']

    %% Navigation Flow
    ListPage --> DetailPage
    ListPage --> CreatePage
    DetailPage --> EditPage
    CreatePage --> DetailPage
    EditPage --> DetailPage

    style ListPage fill:#e1f5ff
    style CreatePage fill:#fff4e1
    style DetailPage fill:#e8f5e9
    style EditPage fill:#fce4ec
```

### Pages

#### 1. List Page
**Route**: `/system-administration`
**File**: `page.tsx`
**Purpose**: Display paginated list of all configurations

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all configurations
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/system-administration/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive configuration details

**Sections**:
- Header: Breadcrumbs, configuration title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change configuration status with reason

#### 3. Create Page
**Route**: `/system-administration/new`
**File**: `new/page.tsx`
**Purpose**: Create new configuration

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/system-administration/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing configuration

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## Architecture

### High-Level Architecture

The System Administration module follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Policy Mgmt │  │ User Mgmt   │  │ Workflow    │       │
│  │   UI        │  │    UI       │  │ Config UI   │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                 │                 │              │
└─────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Policy Evaluation Engine (Core)             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │  │
│  │  │ Target      │  │ Rule        │  │ Combining   │ │  │
│  │  │ Matcher     │  │ Evaluator   │  │ Algorithm   │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Permission  │  │ Workflow    │  │ Subscription│       │
│  │ Cache       │  │ Routing     │  │ Monitor     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────┬───────────────────┬─────────────────┬────────────┘
          │                   │                 │
          ▼                   ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Policy      │  │ Role &      │  │ User &      │       │
│  │ Store       │  │ Assignment  │  │ Attribute   │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Access      │  │ Audit       │  │ Performance │       │
│  │ Request Log │  │ Log         │  │ Metrics     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

**Frontend Layer**:
- **Policy Management Interface**: CRUD operations for ABAC policies with JSON editor, target criteria builder, rule configurator, and test scenario execution
- **Role Hierarchy Manager**: Visual tree view of role hierarchy, role creation/modification forms, permission inheritance configuration, drag-and-drop role restructuring
- **User Assignment Interface**: User profile management, contextual role assignment forms, effective permission viewer, bulk assignment tools
- **Workflow Configuration**: Stage definition interface, routing rule builder, SLA configuration, notification template editor
- **Audit & Compliance Dashboards**: Real-time audit log viewer, security incident analysis, compliance report generator, performance metrics charts

**Backend Layer - Core Services**:

1. **Policy Evaluation Engine** (Core ABAC Component)
   - **Target Matcher**: Evaluates if request attributes match policy target criteria (subject, resource, action, environment)
   - **Rule Evaluator**: Executes policy rules against request context, handles complex conditions with AND/OR logic, evaluates nested attribute references
   - **Combining Algorithm Processor**: Applies DENY_OVERRIDES, PERMIT_OVERRIDES, FIRST_APPLICABLE, or ONLY_ONE_APPLICABLE logic to resolve multiple policy results
   - **Obligation & Advice Handler**: Returns required obligations (must execute) and optional advice (recommendations) with policy results
   - **Performance**: Targets <200ms non-cached evaluation, <10ms cached evaluation

2. **Permission Cache Service**
   - **Cache Key Generation**: Creates context-sensitive hash from userId, resourceType, actionType, and relevant attributes
   - **LRU Cache Implementation**: Least-recently-used eviction policy, configurable TTL (default 15 minutes), hitCount tracking
   - **Invalidation Logic**: Triggers cache invalidation on policy updates, role assignment changes, user attribute modifications, manual cache clear
   - **Cache Metrics**: Tracks hit rate, miss rate, average response time, cache size

3. **Workflow Routing Engine**
   - **Stage Determination**: Evaluates routing rules to determine current stage and next stage based on request attributes
   - **Eligible Approver Finder**: Queries users with required roles, filters by department, location, approval limits, and availability
   - **SLA Tracker**: Monitors stage duration, triggers escalation notifications on SLA breach, calculates business hours vs calendar hours
   - **Notification Dispatcher**: Sends emails and system notifications based on workflow events (onSubmit, onApprove, onReject, onSendBack, onSLA)

4. **Subscription Monitor Service** (Background Job)
   - **Limit Tracker**: Monitors current usage against subscription limits (maxUsers, maxLocations, maxPolicies, maxRoles, maxResourceTypes, storageUsed, apiCallsThisMonth)
   - **Enforcement Logic**: Blocks operations that would exceed limits (hard stop), sends warnings at 80% threshold, generates usage reports
   - **Auto-Renewal Handler**: Processes subscription renewals, updates limits, archives old subscription records

5. **Audit Log Service**
   - **Event Capture**: Records all policy operations, access requests, role assignments, user attribute changes, workflow transitions
   - **Structured Logging**: Stores actor information (userId, sessionId, ipAddress, userAgent), action details (actionType, resource, resourceId), change tracking (oldValues, newValues, fieldsChanged)
   - **Compliance Tagging**: Tags logs with GDPR, HIPAA, SOX flags for regulatory reporting
   - **Retention Management**: Enforces 7-year retention for financial logs, configurable retention for other log types, automatic archival to cold storage

6. **Performance Metrics Collector** (Background Job)
   - **Policy Metrics**: Tracks totalEvaluations, averageTime, maxTime, minTime, permitCount, denyCount, errorCount per policy
   - **Cache Metrics**: Monitors hitRate, missRate, cacheSize, evictionCount, averageRetrievalTime
   - **Resource Metrics**: Analyzes most accessed resources, most denied actions, peak usage times
   - **Reporting**: Generates hourly, daily, weekly, monthly aggregates, identifies performance bottlenecks, suggests optimization opportunities

**Data Layer**:
- **PostgreSQL Database**: Primary data store for all ABAC entities (policies, roles, users, assignments, attributes, access requests, audit logs)
- **JSON Field Storage**: Flexible schema for policy data, role attributes, user attributes, environment attributes, workflow configuration
- **Indexing Strategy**: Indexes on priority, status, validFrom/validTo for policy queries; indexes on userId, roleId for assignment lookups; indexes on timestamp, userId for audit queries
- **Transaction Management**: Atomic operations for policy activation, role assignments, permission recalculation

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS, Shadcn/ui components
- **State Management**: Zustand (UI state), React Query (server state)
- **Form Handling**: React Hook Form, Zod validation
- **JSON Editor**: React JSON Editor component for policy configuration
- **Tree View**: React Tree component for role hierarchy visualization
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js Server Actions / API Routes
- **Database**: PostgreSQL 15+ (via Supabase)
- **ORM**: Prisma 5+ with JSON field support
- **Authentication**: NextAuth.js with session management
- **Caching**: In-memory LRU cache (node-lru-cache library)
- **Background Jobs**: Node-cron for scheduled tasks (subscription monitoring, metrics collection, cache cleanup)

### Data Processing
- **JSON Validation**: Zod schemas for policy structure validation
- **Expression Evaluation**: Custom expression evaluator for policy rules (supports comparison operators, logical operators, attribute references)
- **Attribute Resolution**: Dynamic attribute lookup from user profiles, resource definitions, environment context

### Testing
- **Unit Tests**: Vitest for policy evaluation logic, rule evaluation, combining algorithms
- **Integration Tests**: Vitest + Supertest for API endpoints, workflow routing, cache behavior
- **E2E Tests**: Playwright for user workflows (policy creation, role assignment, access approval)
- **Policy Testing**: Custom test framework for scenario-based policy validation

### DevOps
- **Version Control**: Git with branch protection for policy changes
- **CI/CD**: GitHub Actions for automated testing, policy validation, deployment
- **Hosting**: Vercel for application, Supabase for database
- **Monitoring**: Sentry for error tracking, custom metrics dashboard for ABAC performance

---

## Component Structure

### Directory Structure

```
app/(main)/system-administration/
├── page.tsx                              # System admin dashboard
├── permission-management/
│   ├── policies/
│   │   ├── page.tsx                      # Policy list page
│   │   ├── [id]/
│   │   │   └── page.tsx                  # Policy detail page
│   │   ├── new/
│   │   │   └── page.tsx                  # Create policy page
│   │   ├── components/
│   │   │   ├── PolicyList.tsx            # Policy list with filters
│   │   │   ├── PolicyEditor.tsx          # JSON policy editor
│   │   │   ├── TargetCriteriaBuilder.tsx # Target builder UI
│   │   │   ├── RuleBuilder.tsx           # Rule configuration UI
│   │   │   ├── TestScenarioRunner.tsx    # Policy testing UI
│   │   │   └── PolicyPreview.tsx         # JSON preview component
│   │   ├── types.ts                      # Policy type definitions
│   │   └── actions.ts                    # Policy server actions
│   └── subscriptions/
│       ├── page.tsx                       # Subscription management
│       └── components/
│           ├── UsageMetrics.tsx           # Usage dashboard
│           └── LimitMonitor.tsx           # Limit tracking UI
├── user-management/
│   ├── page.tsx                           # User list page
│   ├── [id]/
│   │   └── page.tsx                       # User profile page
│   ├── components/
│   │   ├── UserList.tsx                   # User list with search
│   │   ├── UserProfile.tsx                # User profile display
│   │   ├── RoleAssignmentForm.tsx         # Role assignment UI
│   │   ├── EffectivePermissionsView.tsx   # Permission viewer
│   │   └── UserAttributeEditor.tsx        # Attribute management UI
│   ├── types.ts                           # User type definitions
│   └── actions.ts                         # User server actions
├── workflow/
│   ├── role-assignment/
│   │   ├── page.tsx                       # Role hierarchy page
│   │   └── components/
│   │       ├── RoleTree.tsx               # Hierarchical role tree
│   │       ├── RoleEditor.tsx             # Role CRUD form
│   │       └── PermissionInheritanceView.tsx # Inheritance visualization
│   └── workflow-configuration/
│       ├── page.tsx                       # Workflow list page
│       ├── [id]/
│       │   └── page.tsx                   # Workflow detail page
│       └── components/
│           ├── StageBuilder.tsx           # Stage configuration UI
│           ├── RoutingRuleEditor.tsx      # Routing rule builder
│           └── NotificationTemplateEditor.tsx # Template editor
├── location-management/
│   └── page.tsx                            # Location hierarchy page
├── business-rules/
│   └── page.tsx                            # Business rules config
├── monitoring/
│   ├── page.tsx                            # Monitoring dashboard
│   └── components/
│       ├── AuditLogViewer.tsx              # Audit log search UI
│       ├── SecurityIncidentDashboard.tsx   # Security dashboard
│       ├── PerformanceMetricsChart.tsx     # Metrics visualization
│       └── ComplianceReportGenerator.tsx   # Report generator
└── lib/
    ├── abac/
    │   ├── policy-evaluator.ts             # Core policy evaluation logic
    │   ├── rule-engine.ts                  # Rule evaluation engine
    │   ├── cache-manager.ts                # Permission cache management
    │   ├── combining-algorithms.ts         # DENY_OVERRIDES, PERMIT_OVERRIDES, etc.
    │   └── attribute-resolver.ts           # Dynamic attribute lookup
    ├── workflow/
    │   ├── routing-engine.ts               # Workflow routing logic
    │   ├── sla-tracker.ts                  # SLA monitoring
    │   └── notification-service.ts         # Notification dispatch
    └── audit/
        ├── audit-logger.ts                 # Audit log writer
        └── compliance-reporter.ts          # Compliance report generation
```

### Key Components

#### Policy Evaluation Engine
**Location**: `lib/abac/policy-evaluator.ts`
**Purpose**: Core ABAC engine that evaluates access requests against policies

**Responsibilities**:
- Accepts access request with subject, resource, action, environment attributes
- Queries applicable policies from database (status = ACTIVE, valid date range, target criteria match)
- Sorts policies by priority (ascending: 0 = highest priority)
- Evaluates each policy's rules against request context
- Applies combining algorithm to determine final decision (PERMIT, DENY, NOT_APPLICABLE, INDETERMINATE)
- Returns evaluation result with decision, applicable policies, obligations, advice, evaluation time
- Logs evaluation details to access_requests and policy_evaluation_logs tables

**Integration Points**:
- Called by all application modules requiring permission checks (procurement, inventory, finance)
- Uses Permission Cache Service for performance optimization
- Sends evaluation metrics to Performance Metrics Collector

#### Permission Cache Service
**Location**: `lib/abac/cache-manager.ts`
**Purpose**: Caches policy evaluation results for performance

**Responsibilities**:
- Generates cache key from context hash (userId + resourceType + actionType + relevant attributes)
- Stores evaluation results with TTL (default 15 minutes)
- Implements LRU eviction policy when cache reaches size limit
- Invalidates cache on policy updates, role changes, user attribute modifications
- Tracks cache hit rate, miss rate, retrieval time for performance monitoring

**Cache Structure**:
- Key: `cache-{userId}-{resourceType}-{actionType}-{contextHash}`
- Value: `{ decision, confidence, applicablePolicies, obligations, advice, timestamp }`
- TTL: 15 minutes (configurable)
- Max Size: 10,000 entries (configurable)

#### Workflow Routing Engine
**Location**: `lib/workflow/routing-engine.ts`
**Purpose**: Determines workflow stages and eligible approvers

**Responsibilities**:
- Evaluates routing rules based on request attributes (amount, category, department, urgency)
- Determines current stage and next stage transitions
- Finds eligible approvers by querying users with required roles, department, location, approval limits
- Tracks SLA for each stage, triggers escalation on breach
- Coordinates with ABAC system for approval permission checks
- Sends notifications via notification service

**Routing Logic**:
- Reads workflow configuration from database (stages, routing rules, notification templates)
- Evaluates conditions (field, operator, value) for each routing rule
- Applies actions (SKIP_STAGE, NEXT_STAGE) based on rule results
- Maintains workflow state in purchase request/document status

---

## Data Flow

### Policy Evaluation Flow

```
1. Application Module (e.g., Procurement)
   │
   ├─→ User Action: "Approve Purchase Request PR-2501-0123"
   │
   ├─→ Constructs Access Request:
   │   {
   │     subject: { userId, role, department, approvalLimit, ... },
   │     resource: { type: "purchase_request", id, amount, category, ... },
   │     action: "approve",
   │     environment: { timestamp, location, networkZone, businessHours, ... }
   │   }
   │
   └─→ Calls: POST /api/abac/evaluate

2. Policy Evaluation Engine
   │
   ├─→ Validates request structure
   │
   ├─→ Checks Permission Cache:
   │   ├─→ Cache Hit? → Return cached decision (3ms)
   │   └─→ Cache Miss? → Continue to full evaluation
   │
   ├─→ Queries Applicable Policies:
   │   SELECT * FROM policies
   │   WHERE status = 'ACTIVE'
   │     AND (validFrom IS NULL OR validFrom <= NOW())
   │     AND (validTo IS NULL OR validTo >= NOW())
   │     AND target.subject matches request.subject
   │     AND target.resource matches request.resource
   │     AND target.action matches request.action
   │   ORDER BY priority ASC
   │
   ├─→ Evaluates Each Policy:
   │   ├─→ Target Match? → Evaluate Rules
   │   ├─→ All Rules Pass? → Record result (PERMIT/DENY)
   │   └─→ Target No Match? → NOT_APPLICABLE
   │
   ├─→ Applies Combining Algorithm:
   │   ├─→ DENY_OVERRIDES: If any DENY → Final = DENY
   │   ├─→ PERMIT_OVERRIDES: If any PERMIT → Final = PERMIT
   │   ├─→ FIRST_APPLICABLE: First match → Final
   │   └─→ ONLY_ONE_APPLICABLE: Single match required
   │
   ├─→ Constructs Evaluation Result:
   │   {
   │     decision: PERMIT | DENY | NOT_APPLICABLE | INDETERMINATE,
   │     confidence: 1.0,
   │     applicablePolicies: ['POL-2501-0123'],
   │     evaluatedRules: [...],
   │     obligations: ['log_audit', 'notify_requester', 'update_status'],
   │     advice: ['recommend_secondary_review'],
   │     evaluationTime: 45ms
   │   }
   │
   ├─→ Caches Result (TTL: 15 min)
   │
   ├─→ Logs to Database:
   │   ├─→ access_requests table
   │   └─→ policy_evaluation_logs table
   │
   └─→ Returns Result to Application

3. Application Module
   │
   ├─→ Receives Decision: PERMIT
   │
   ├─→ Executes Obligations:
   │   ├─→ log_audit → Audit Log Service
   │   ├─→ notify_requester → Email/Notification Service
   │   └─→ update_status → Update PR status to "Approved"
   │
   ├─→ Displays Advice to User:
   │   "Approval successful. Recommendation: Consider secondary approval for amounts >$2,000"
   │
   └─→ Grants Access: PR approved, workflow continues
```

### Workflow Routing Flow

```
1. User Submits Purchase Request
   │
   ├─→ Procurement System validates request
   │
   ├─→ Changes status to "Pending Approval"
   │
   └─→ Calls: POST /api/workflow/route

2. Workflow Routing Engine
   │
   ├─→ Retrieves Workflow Configuration:
   │   SELECT * FROM workflows WHERE type = 'purchase_request'
   │
   ├─→ Evaluates Routing Rules:
   │   IF request.amount <= 5000 THEN skip_stage(2)
   │   IF request.amount <= 10000 THEN skip_stage(3)
   │
   ├─→ Determines Current Stage: Stage 1 (Department Manager Approval)
   │
   ├─→ Finds Eligible Approvers:
   │   SELECT users
   │   FROM users u
   │   JOIN user_role_assignments ura ON u.id = ura.userId
   │   JOIN roles r ON ura.roleId = r.id
   │   WHERE r.name IN ('kitchen-manager', 'department-manager')
   │     AND ura.departments @> '['Kitchen']'
   │     AND ura.assignedLocations @> '['main-kitchen']'
   │     AND u.userData->>'approvalLimit' >= 2500
   │     AND ura.effectiveFrom <= NOW()
   │     AND (ura.effectiveTo IS NULL OR ura.effectiveTo >= NOW())
   │
   ├─→ Result: 2 eligible approvers (John Smith, Sarah Lee)
   │
   ├─→ Assigns Request to Approvers
   │
   ├─→ Sends Notifications:
   │   ├─→ Email to John Smith
   │   ├─→ Email to Sarah Lee
   │   └─→ System notifications
   │
   └─→ Starts SLA Timer: 24 hours for Stage 1

3. Approver Takes Action
   │
   ├─→ John Smith clicks "Approve"
   │
   ├─→ ABAC Evaluation (see Policy Evaluation Flow above)
   │   └─→ Result: PERMIT
   │
   ├─→ Workflow Engine:
   │   ├─→ Records approval (approver, timestamp)
   │   ├─→ Evaluates next stage routing
   │   ├─→ Amount $2,500 <= $5,000 → Skip Stage 2
   │   ├─→ Workflow Complete (no further stages)
   │   └─→ Changes status: "Fully Approved"
   │
   ├─→ Generates Purchase Order: PO-2501-00456
   │
   └─→ Notifications:
       ├─→ Email to Requester: "Request approved"
       ├─→ Email to Approver: "Approval confirmed"
       └─→ Email to Purchasing: "New PO ready"
```

---

## Integration Points

### Procurement System Integration
**Integration Type**: Internal API calls
**Direction**: Procurement → ABAC System

**Access Evaluation**:
- Endpoint: `POST /api/abac/evaluate`
- Called for: Purchase request approval, PO modification, GRN posting, invoice approval
- Request payload: Subject (user), Resource (purchase document), Action (approve/create/modify)
- Response: Decision (PERMIT/DENY), Obligations, Advice

**Workflow Routing**:
- Endpoint: `POST /api/workflow/route`
- Called when: Purchase request submitted, status changes
- Request payload: Document ID, type, attributes (amount, category, department)
- Response: Current stage, eligible approvers, SLA deadline, next stage

### Inventory System Integration
**Integration Type**: Internal API calls
**Direction**: Inventory → ABAC System

**Access Control**:
- Endpoint: `POST /api/abac/evaluate`
- Called for: Stock adjustments, physical counts, transfers, wastage recording
- Attribute checks: Department, location, product category, adjustment value
- Response: Decision with contextual restrictions

### Finance System Integration
**Integration Type**: Internal API calls
**Direction**: Finance → ABAC System

**Approval Enforcement**:
- Endpoint: `POST /api/abac/evaluate`
- Called for: Journal entry posting, payment approval, budget allocation
- Attribute checks: Approval limit, department authorization, financial period status
- Response: Decision with approval requirements

### Notification Service Integration
**Integration Type**: Event-driven messaging
**Direction**: ABAC → Notification Service

**Event Types**:
- `policy.created`, `policy.updated`, `policy.activated`
- `role.assigned`, `role.revoked`, `role.modified`
- `approval.granted`, `approval.denied`, `workflow.escalated`
- `sla.breach`, `subscription.limit_warning`, `security.incident`

**Notification Channels**:
- Email (SMTP via Supabase)
- System notifications (in-app)
- Push notifications (for mobile app)

### Audit Log Integration
**Integration Type**: Asynchronous logging
**Direction**: All modules → Audit Log Service

**Logged Events**:
- All ABAC policy operations (create, update, activate, deactivate)
- All access requests and evaluation results
- All role assignments and modifications
- All user attribute changes
- All workflow transitions
- All subscription limit changes

**Log Structure**:
- Actor: userId, sessionId, ipAddress, userAgent
- Action: actionType, resource, resourceId, resourceName
- Changes: oldValues, newValues, fieldsChanged
- Context: timestamp, compliance flags (GDPR, HIPAA, SOX)

---

## Performance Considerations

### Caching Strategy
**Cache Layers**:
1. **Permission Cache** (L1): In-memory LRU cache for policy evaluation results
   - Hit rate target: >80%
   - TTL: 15 minutes
   - Size limit: 10,000 entries
   - Eviction: LRU policy

2. **Policy Query Cache** (L2): Database query result cache for applicable policies
   - Cached queries: Active policies by resource type, active policies by priority
   - TTL: 5 minutes
   - Invalidation: On policy updates

3. **User Context Cache** (L3): User profile and role assignment cache
   - Cached data: User attributes, role assignments, effective permissions
   - TTL: 30 minutes
   - Invalidation: On user or role updates

**Invalidation Triggers**:
- Policy created/updated/activated/deactivated → Invalidate permission cache + policy query cache
- Role assigned/revoked/modified → Invalidate user context cache + permission cache for affected users
- User attributes modified → Invalidate user context cache + permission cache for user
- Manual cache clear → Clear all caches

### Performance Targets
- **Policy Evaluation**:
  - Cached evaluation: <10ms (P95)
  - Non-cached evaluation: <200ms (P95)
  - Complex policy evaluation: <500ms (P99)
  - Timeout threshold: 5 seconds (hard limit)

- **Workflow Routing**:
  - Stage determination: <100ms (P95)
  - Eligible approver query: <200ms (P95)
  - Notification dispatch: <500ms (P95)

- **Audit Logging**:
  - Async write: <10ms (non-blocking)
  - Log query: <500ms for 1000 records (P95)
  - Compliance report generation: <5 seconds for 10,000 records

### Database Optimization
**Indexing Strategy**:
- `policies`: Index on (status, priority), (validFrom, validTo), (policyData->>'effect')
- `roles`: Index on (parentId, level, isActive), (path)
- `user_role_assignments`: Index on (userId, roleId), (effectiveFrom, effectiveTo), (isPrimary)
- `access_requests`: Index on (requestData->>'userId', timestamp), (decision, timestamp)
- `audit_logs`: Index on (userId, timestamp), (actionType, timestamp), (complianceFlags)

**Query Optimization**:
- Use JSONB operators for efficient JSON field queries (@>, ->, ->>)
- Implement database views for complex joins (user_effective_permissions, policy_summary)
- Use prepared statements for frequently executed queries
- Implement query result caching for read-heavy operations

### Scalability Considerations
**Horizontal Scaling**:
- Policy Evaluation Engine: Stateless, can be replicated across multiple instances
- Permission Cache: Distributed cache with consistent hashing (Redis future consideration)
- Background Jobs: Single instance with leader election to prevent duplicate execution

**Vertical Scaling**:
- Database: PostgreSQL connection pooling (PgBouncer), read replicas for report queries
- Application: Node.js clustering for multi-core utilization

**Load Distribution**:
- CDN: Static assets (UI components, images)
- API Gateway: Rate limiting, request throttling per user/role
- Background Jobs: Queue-based processing for non-blocking operations (metrics collection, cache cleanup)

---

## Security Considerations

### Authentication & Authorization
- **Authentication**: NextAuth.js with JWT tokens, session management with secure cookies
- **Authorization**: ABAC system for all resource access, role-based UI element visibility
- **Session Management**: 30-minute inactivity timeout, session invalidation on logout, concurrent session limits

### Data Protection
- **Encryption at Rest**: PostgreSQL transparent data encryption (TDE) for sensitive data
- **Encryption in Transit**: TLS 1.3 for all API communication, HTTPS enforced
- **Sensitive Data Handling**: User passwords hashed with bcrypt, PII fields encrypted in database

### Policy Security
- **Policy Validation**: JSON schema validation before saving, syntax checking for rule expressions
- **Policy Testing**: Required test scenarios before activation, version control for policy changes
- **Policy Audit**: Complete audit trail for policy lifecycle (creation, modification, activation, deactivation)

### Compliance
- **GDPR**: User consent tracking, right to erasure support, data export capabilities
- **SOX**: Financial transaction audit trails, approval workflow enforcement, separation of duties
- **ISO 27001**: Access control standards, security incident logging, regular security audits

---

## Deployment Architecture

### Production Environment
```
┌─────────────────────────────────────────────────────────────┐
│                      Vercel Edge Network                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Region:   │  │  Region:   │  │  Region:   │           │
│  │  US-East   │  │  EU-West   │  │  Asia-SE   │           │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘           │
│         │                │                │                 │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
                ┌──────────▼──────────┐
                │   Next.js Server    │
                │   (App Router)      │
                │  ┌──────────────┐   │
                │  │ ABAC Engine  │   │
                │  │ (Stateless)  │   │
                │  └──────────────┘   │
                └──────────┬──────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐
   │  Supabase   │  │   Redis   │  │   Sentry    │
   │  Database   │  │   Cache   │  │  Monitoring │
   │ (PostgreSQL)│  │  (Future) │  │   & Errors  │
   └─────────────┘  └───────────┘  └─────────────┘
```

### Development Environment
- **Local Development**: Next.js dev server, local PostgreSQL database, local cache
- **Staging**: Vercel preview deployments, Supabase staging database, production-like configuration
- **Testing**: Separate test database, mock cache for unit tests, Playwright for E2E tests

### CI/CD Pipeline
1. **Commit**: Developer commits code to feature branch
2. **Validation**: GitHub Actions runs lint, type-check, unit tests
3. **Policy Tests**: Automated policy scenario tests execute
4. **Build**: Next.js build with production configuration
5. **Deploy Preview**: Vercel creates preview deployment for PR
6. **E2E Tests**: Playwright tests run against preview deployment
7. **Review**: Code review and approval required
8. **Merge**: Merge to main branch
9. **Production Deploy**: Automatic deployment to Vercel production
10. **Post-Deploy**: Smoke tests, monitoring alerts

---

**Document Control**:
- **Created**: 2025-11-13
- **Author**: Carmen ERP Platform Engineering Team
- **Reviewed By**: Solutions Architect, Security Engineer, Database Administrator
- **Approved By**: CTO, VP Engineering
- **Next Review**: 2025-12-13

---

**Document End**
