# Data Definition: My Approvals

## Module Information
- **Module**: Procurement
- **Sub-Module**: My Approvals
- **Database**: PostgreSQL (Supabase)
- **Schema Version**: 1.0.0
- **Last Updated**: 2025-11-15
- **Owner**: Procurement & Workflow Team
- **Status**: Active

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-12 | Documentation Team | Initial version |
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |


---

## Overview

The My Approvals data model provides a centralized approval workflow infrastructure supporting multi-level approvals across all document types in the Carmen ERP system. The schema design emphasizes audit trail completeness, real-time queue performance, and flexible delegation capabilities while maintaining referential integrity with source document tables.

The data model consists of five core entities: approval_queue_items for pending approvals, approval_actions for audit trail, approval_delegations for temporary authority transfer, approval_sla_configuration for SLA policies, and approval_authority_matrix for approval limits. These entities support the complete approval lifecycle from submission through final approval or rejection, with full audit trail for compliance and reporting.

**⚠️ IMPORTANT: This is a Data Schema Document - TEXT FORMAT ONLY**
- **DO NOT include SQL code** - describe database structures in text
- **DO NOT include CREATE TABLE statements** - describe table purposes and fields
- **DO NOT include mermaid ERD diagrams** - describe relationships in text
- **DO include**: Entity descriptions, field definitions, relationship explanations, business rules
- **Focus on**: WHAT data is stored, WHY it exists, HOW it relates - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-my-approvals.md)
- [Use Cases](./UC-my-approvals.md)
- [Technical Specification](./TS-my-approvals.md)
- [Flow Diagrams](./FD-my-approvals.md)
- [Validations](./VAL-my-approvals.md)

---

## Entity Relationship Overview

**Primary Entities**:
- **approval_queue_items**: Represents documents awaiting approval in an approver's queue
- **approval_actions**: Records all approval decisions and actions for audit trail
- **approval_delegations**: Defines temporary delegation of approval authority between users
- **approval_sla_configuration**: Stores SLA targets and escalation rules by document type
- **approval_authority_matrix**: Defines approval authority limits by user role and document type

**Key Relationships**:

1. **approval_queue_items → documents (polymorphic)**: Many-to-One relationship
   - Business meaning: Each queue item references a specific document awaiting approval (PR, PO, GRN, Wastage, etc.)
   - Cardinality: Many queue items can reference different document types
   - Implementation: document_id and document_type fields create polymorphic reference
   - Example: Queue item references purchase_requests.id when document_type = 'purchase_request'

2. **approval_queue_items → users**: Many-to-One relationship
   - Business meaning: Each queue item is assigned to a specific approver
   - Cardinality: One user has 0 to many queue items (their approval queue)
   - Foreign key: approver_user_id references users.id
   - Example: All PRs awaiting Sarah Johnson's approval have approver_user_id = Sarah's UUID

3. **approval_actions → approval_queue_items**: Many-to-One relationship
   - Business meaning: Each approval action belongs to a specific queue item (document)
   - Cardinality: One queue item can have multiple approval actions (Level 1, Level 2, Level 3)
   - Foreign key: queue_item_id references approval_queue_items.id
   - Example: PR-2501-001234 has 3 approval actions (Dept Head, Purchasing Mgr, Finance Controller)

4. **approval_actions → users**: Many-to-One relationship
   - Business meaning: Each approval action is performed by a specific user
   - Cardinality: One user performs many approval actions over time
   - Foreign key: approver_user_id references users.id
   - Example: John Smith's approval history shows all actions he performed

5. **approval_delegations → users**: Many-to-One relationships (delegator and delegate)
   - Business meaning: Delegation connects original approver (delegator) to temporary approver (delegate)
   - Cardinality: One user can delegate to one other user, but can have multiple delegations over time
   - Foreign keys: delegator_user_id and delegate_user_id both reference users.id
   - Example: John Smith delegates to Sarah Johnson while on vacation (delegator = John, delegate = Sarah)

6. **approval_authority_matrix → users**: Many-to-One relationship
   - Business meaning: Each authority matrix entry defines approval limits for a specific user or role
   - Cardinality: One user can have multiple authority entries for different document types
   - Foreign key: user_id references users.id OR role_id references roles.id
   - Example: Sarah Johnson has $50K authority for PRs, $75K for POs

7. **approval_sla_configuration → document_types**: One-to-Many relationship
   - Business meaning: Each document type has multiple SLA configurations (by priority level)
   - Cardinality: One document type has multiple SLA targets (Urgent, High, Normal, Low priority)
   - Implementation: document_type field with enum values
   - Example: Purchase Requests have 4 SLA configs (one for each priority level)

**Relationship Notes**:
- All foreign keys use ON DELETE RESTRICT to prevent accidental data loss
- User references use ON DELETE SET NULL to preserve audit trail when users deleted
- Soft delete pattern (deleted_at timestamp) preserves referential integrity
- Polymorphic relationship (approval_queue_items → documents) implemented through document_id + document_type compound key
- See [Flow Diagrams](./FD-my-approvals.md) for visual ERD diagrams

---

## Data Entities

### Entity: approval_queue_items

**Description**: Represents a document awaiting approval in an approver's queue. Each row is a pending approval task assigned to a specific user for a specific document at a specific approval level.

**Business Purpose**: Provides the data structure for the centralized approval queue interface, enabling approvers to see all pending approvals across document types in a single view. Supports real-time queue updates, filtering, sorting, and bulk selection.

**Data Ownership**: Workflow Engine (system-managed)

**Access Pattern**:
- Primary: Query by approver_user_id + status = 'Pending' (user's active queue)
- Secondary: Query by document_id + document_type (check approval status of specific document)
- Tertiary: Query by sla_deadline < NOW() (find overdue approvals for escalation)
- Real-time: Listen for INSERT/UPDATE/DELETE events via Supabase Realtime for queue updates

**Data Volume**: ~5,000 active queue items at any time (high turnover as approvals processed), ~100K historical records per year

#### Fields Overview

**Primary Identification**:
- **ID Field**: id - UUID primary key, auto-generated using gen_random_uuid()
- **Business Key**: No human-readable key (system-generated queue entries)
- **Display Name**: Document reference number from source document (e.g., PR-2501-001234)

**Core Business Fields**:
- **document_id**: UUID reference to source document
  - Required: Yes
  - Purpose: Links queue item to specific document awaiting approval
  - Example: 550e8400-e29b-41d5-a716-446655440000 (ID of purchase_requests record)

- **document_type**: VARCHAR(50) - Enum of supported document types
  - Required: Yes
  - Allowed values: 'purchase_request', 'purchase_order', 'grn', 'credit_note', 'wastage', 'stock_requisition', 'inventory_adjustment', 'stock_transfer'
  - Purpose: Identifies which table the document_id references (polymorphic key)
  - Example: 'purchase_request'

- **document_reference_number**: VARCHAR(50) - Human-readable document number
  - Required: Yes
  - Purpose: Display reference for user identification (denormalized from source document for query performance)
  - Example: PR-2501-001234, WAS-2501-000456

- **submission_timestamp**: TIMESTAMPTZ - When document was submitted for approval
  - Required: Yes
  - Purpose: Calculate approval age and SLA compliance
  - Example: 2025-11-12 08:30:00+00

- **approval_level_required**: INTEGER - Total number of approval levels needed
  - Required: Yes
  - Range: 1 to 10
  - Purpose: Indicates multi-level approval depth
  - Example: 3 (requires Dept Head, Purchasing Mgr, Finance Controller)

- **current_approval_level**: INTEGER - Which approval level this queue item represents
  - Required: Yes
  - Range: 1 to approval_level_required
  - Purpose: Tracks progress through multi-level workflow
  - Example: 2 (currently at Purchasing Manager approval)

- **approver_user_id**: UUID reference to users table
  - Required: Yes
  - Purpose: User assigned to approve this document at this level
  - Foreign key: users(id) ON DELETE RESTRICT
  - Example: User UUID for Sarah Johnson (Purchasing Manager)

- **assignee_type**: VARCHAR(20) - How approver was assigned
  - Required: Yes
  - Allowed values: 'primary', 'delegate', 'escalation'
  - Purpose: Distinguish between normal assignment, delegated approval, and escalated approval
  - Example: 'delegate' (assigned due to active delegation from John Smith)

- **priority**: VARCHAR(20) - Approval urgency
  - Required: Yes
  - Allowed values: 'urgent', 'high', 'normal', 'low'
  - Default: 'normal'
  - Purpose: Determine SLA targets and queue ordering
  - Example: 'urgent' (critical purchase for VIP event)

**Financial Attributes**:
- **total_amount**: NUMERIC(15,2) - Document total value
  - Required: Yes
  - Validation: Non-negative (CHECK constraint)
  - Purpose: Display in queue and validate approval authority
  - Example: 12450.00

- **currency_code**: VARCHAR(3) - ISO 4217 currency code
  - Required: Yes
  - Example: USD, SGD, EUR

- **base_currency_amount**: NUMERIC(15,2) - Amount converted to organization's base currency
  - Required: Yes
  - Purpose: Authority validation and reporting in consistent currency
  - Example: 16620.00 (SGD converted to USD)

**Request Context** (Denormalized for Query Performance):
- **requestor_user_id**: UUID reference to users table
  - Required: Yes
  - Purpose: Who submitted the document for approval
  - Example: User UUID for Chef Daniel Martinez

- **requestor_name**: VARCHAR(255)
  - Required: Yes
  - Purpose: Display requestor name in queue without JOIN
  - Example: Daniel Martinez

- **requestor_department_id**: UUID reference to departments table
  - Required: No
  - Purpose: Department of requestor
  - Example: Department UUID for F&B Department

- **requestor_location_id**: UUID reference to locations table
  - Required: No
  - Purpose: Location of requestor
  - Example: Location UUID for Main Kitchen

- **request_description**: TEXT - Short description of document
  - Required: No
  - Max length: 500 characters
  - Purpose: Brief overview for queue display
  - Example: F&B ingredients for December menu launch

- **request_justification**: TEXT - Business justification for request
  - Required: No
  - Max length: 1000 characters
  - Purpose: Help approver understand business need
  - Example: Essential ingredients for new seasonal menu launching Dec 1. Expected 30% increase in sales.

**Workflow Attributes**:
- **status**: VARCHAR(50) - Queue item lifecycle status
  - Required: Yes
  - Allowed values: 'pending', 'under_review', 'approved', 'rejected', 'returned', 'awaiting_info', 'recalled'
  - Default: 'pending'
  - Purpose: Track approval progress
  - Status transitions:
    - pending → under_review (approver opens document)
    - pending → awaiting_info (approver requests more info)
    - under_review → approved (approval granted)
    - under_review → rejected (approval denied)
    - under_review → returned (sent back to requestor)
    - awaiting_info → pending (requestor provides info)
    - pending/under_review → recalled (requestor cancels)
  - Example: 'under_review'

- **is_delegated**: BOOLEAN - Whether this approval is via delegation
  - Required: Yes
  - Default: false
  - Purpose: Distinguish between primary and delegated approvals
  - Example: true

- **original_approver_user_id**: UUID reference to users table
  - Required: No (only if is_delegated = true)
  - Purpose: Track original approver when delegated
  - Example: John Smith's UUID (original approver, now delegated to Sarah)

- **delegation_id**: UUID reference to approval_delegations table
  - Required: No (only if is_delegated = true)
  - Purpose: Link to delegation configuration
  - Example: Delegation UUID for John → Sarah delegation

- **is_escalated**: BOOLEAN - Whether this approval is escalated
  - Required: Yes
  - Default: false
  - Purpose: Track escalated approvals
  - Example: true (escalated to manager due to SLA breach)

- **escalation_level**: INTEGER - Escalation depth
  - Required: No (only if is_escalated = true)
  - Range: 1 to 3
  - Purpose: Track how many escalation levels applied
  - Example: 2 (escalated to manager's manager)

- **requires_policy_override**: BOOLEAN - Whether approval violates policy
  - Required: Yes
  - Default: false
  - Purpose: Flag approvals requiring policy exception justification
  - Example: true (budget exceeded, needs GM approval)

**SLA Attributes**:
- **sla_deadline**: TIMESTAMPTZ - When approval must be completed
  - Required: Yes
  - Calculation: submission_timestamp + SLA hours (business hours only)
  - Purpose: Track SLA compliance and trigger escalations
  - Example: 2025-11-13 16:30:00+00

- **sla_paused_at**: TIMESTAMPTZ - When SLA timer was paused
  - Required: No (NULL when SLA active)
  - Purpose: Pause SLA when awaiting requestor response
  - Example: 2025-11-12 14:20:00+00

- **sla_paused_duration**: INTERVAL - Total time SLA has been paused
  - Required: No
  - Purpose: Adjust SLA calculation for time awaiting info
  - Example: 2 hours 30 minutes

- **sla_escalation_sent**: BOOLEAN - Whether escalation notification sent
  - Required: Yes
  - Default: false
  - Purpose: Prevent duplicate escalation emails
  - Example: true

- **sla_escalation_sent_at**: TIMESTAMPTZ - When escalation was sent
  - Required: No
  - Purpose: Track escalation timing
  - Example: 2025-11-13 16:35:00+00

**Budget and Integration Context**:
- **budget_impact**: NUMERIC(15,2) - Amount that will be committed on approval
  - Required: No
  - Purpose: Display budget impact to approver
  - Example: 12450.00

- **budget_available**: NUMERIC(15,2) - Available budget balance
  - Required: No
  - Purpose: Display budget availability to approver
  - Example: 35000.00

- **inventory_impacted**: BOOLEAN - Whether approval affects inventory
  - Required: Yes
  - Default: false
  - Purpose: Trigger inventory transaction on approval
  - Example: true (wastage report reduces stock)

- **gl_impacted**: BOOLEAN - Whether approval affects general ledger
  - Required: Yes
  - Default: false
  - Purpose: Trigger GL posting on approval
  - Example: true (purchase creates expense)

**Flexible Data Fields**:
- **metadata**: JSONB - Additional flexible attributes
  - Required: No
  - Common attributes:
    - urgency_reason: Why approval is urgent
    - business_unit: Additional organizational context
    - project_code: Project or event allocation
    - compliance_flags: Regulatory requirements
  - Example: {"urgency_reason": "VIP event Dec 15", "project_code": "HOLIDAY2025"}

**Audit Fields** (Standard for all entities):
- **created_date**: TIMESTAMPTZ - When queue item was created
  - Required: Yes
  - Default: NOW()
  - Immutable: Yes
  - Purpose: Track when document entered approval workflow
  - Example: 2025-11-12 08:30:15+00

- **created_by**: UUID reference to users table (system user for workflow engine)
  - Required: Yes
  - Purpose: Track who/what created the queue item
  - Example: System user UUID

- **updated_date**: TIMESTAMPTZ - Last modification timestamp
  - Required: Yes
  - Default: NOW()
  - Auto-updated: Yes (database trigger)
  - Purpose: Track when queue item last changed (e.g., status update)
  - Example: 2025-11-12 14:20:00+00

- **updated_by**: UUID reference to users table
  - Required: Yes
  - Purpose: Track who last modified the queue item
  - Example: Approver's UUID when status changed to 'under_review'

- **deleted_at**: TIMESTAMPTZ - Soft delete timestamp
  - Required: No (NULL for active records)
  - Purpose: Preserve queue history without hard delete
  - Example: NULL (active) or 2025-11-12 18:00:00+00 (soft deleted)

**Optimistic Locking**:
- **doc_version**: INTEGER - Version number for concurrent update detection
  - Required: Yes
  - Default: 1
  - Auto-incremented: Yes (on each UPDATE)
  - Purpose: Prevent concurrent approval actions
  - Example: 3 (document has been updated twice)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|------------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key, unique identifier | 550e8400-e29b-41d5-a716-446655440000 | PK, NOT NULL |
| document_id | UUID | Yes | - | Reference to source document | 660e8400-e29b-41d5-a716-446655440001 | NOT NULL, INDEX |
| document_type | VARCHAR(50) | Yes | - | Type of document | purchase_request, wastage | NOT NULL, CHECK (IN allowed values), INDEX |
| document_reference_number | VARCHAR(50) | Yes | - | Human-readable document number | PR-2501-001234 | NOT NULL |
| submission_timestamp | TIMESTAMPTZ | Yes | - | When document submitted for approval | 2025-11-12 08:30:00+00 | NOT NULL, INDEX |
| approval_level_required | INTEGER | Yes | - | Total approval levels needed | 3 | NOT NULL, CHECK (1-10) |
| current_approval_level | INTEGER | Yes | - | Current approval level | 2 | NOT NULL, CHECK (1-10) |
| approver_user_id | UUID | Yes | - | User assigned to approve | User UUID | NOT NULL, FK users(id), INDEX |
| assignee_type | VARCHAR(20) | Yes | 'primary' | Assignment type | primary, delegate, escalation | NOT NULL, CHECK (IN allowed values) |
| priority | VARCHAR(20) | Yes | 'normal' | Approval priority | urgent, high, normal, low | NOT NULL, CHECK (IN allowed values), INDEX |
| total_amount | NUMERIC(15,2) | Yes | - | Document total value | 12450.00 | NOT NULL, CHECK (≥0) |
| currency_code | VARCHAR(3) | Yes | - | ISO 4217 currency code | USD, SGD | NOT NULL |
| base_currency_amount | NUMERIC(15,2) | Yes | - | Amount in base currency | 16620.00 | NOT NULL, CHECK (≥0) |
| requestor_user_id | UUID | Yes | - | User who submitted document | User UUID | NOT NULL, FK users(id), INDEX |
| requestor_name | VARCHAR(255) | Yes | - | Requestor display name | Daniel Martinez | NOT NULL |
| requestor_department_id | UUID | No | - | Requestor's department | Department UUID | FK departments(id) |
| requestor_location_id | UUID | No | - | Requestor's location | Location UUID | FK locations(id) |
| request_description | TEXT | No | - | Short description | F&B ingredients for December menu | MAX 500 chars |
| request_justification | TEXT | No | - | Business justification | Essential for new seasonal menu launch | MAX 1000 chars |
| status | VARCHAR(50) | Yes | 'pending' | Queue item status | pending, approved, rejected | NOT NULL, CHECK (IN allowed values), INDEX |
| is_delegated | BOOLEAN | Yes | false | Approval via delegation | true, false | NOT NULL |
| original_approver_user_id | UUID | No | - | Original approver (if delegated) | User UUID | FK users(id) |
| delegation_id | UUID | No | - | Link to delegation config | Delegation UUID | FK approval_delegations(id) |
| is_escalated | BOOLEAN | Yes | false | Approval escalated | true, false | NOT NULL |
| escalation_level | INTEGER | No | - | Escalation depth | 1, 2, 3 | CHECK (1-3) |
| requires_policy_override | BOOLEAN | Yes | false | Policy violation flag | true, false | NOT NULL |
| sla_deadline | TIMESTAMPTZ | Yes | - | SLA completion deadline | 2025-11-13 16:30:00+00 | NOT NULL, INDEX |
| sla_paused_at | TIMESTAMPTZ | No | - | SLA pause timestamp | 2025-11-12 14:20:00+00 | NULL if not paused |
| sla_paused_duration | INTERVAL | No | - | Total SLA pause time | 02:30:00 | NULL if never paused |
| sla_escalation_sent | BOOLEAN | Yes | false | Escalation notification sent | true, false | NOT NULL |
| sla_escalation_sent_at | TIMESTAMPTZ | No | - | Escalation sent timestamp | 2025-11-13 16:35:00+00 | NULL if not sent |
| budget_impact | NUMERIC(15,2) | No | - | Budget amount to commit | 12450.00 | CHECK (≥0) |
| budget_available | NUMERIC(15,2) | No | - | Available budget balance | 35000.00 | CHECK (≥0) |
| inventory_impacted | BOOLEAN | Yes | false | Affects inventory | true, false | NOT NULL |
| gl_impacted | BOOLEAN | Yes | false | Affects general ledger | true, false | NOT NULL |
| metadata | JSONB | No | - | Flexible additional data | {"urgency_reason": "VIP event"} | Valid JSON |
| created_date | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-11-12 08:30:15+00 | NOT NULL, Immutable |
| created_by | UUID | Yes | - | Creator user | System UUID | NOT NULL, FK users(id) |
| updated_date | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12 14:20:00+00 | NOT NULL, Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user | Approver UUID | NOT NULL, FK users(id) |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL or timestamp | NULL for active |
| doc_version | INTEGER | Yes | 1 | Optimistic locking version | 3 | NOT NULL, Auto-incremented |

#### Indexes

**Primary Index**:
- PRIMARY KEY (id)

**Foreign Key Indexes**:
- INDEX idx_queue_approver (approver_user_id, status, deleted_at) - Fast queue loading for approver
- INDEX idx_queue_document (document_id, document_type) - Find queue items for specific document
- INDEX idx_queue_requestor (requestor_user_id) - Find queue items by requestor

**Query Optimization Indexes**:
- INDEX idx_queue_sla_overdue (sla_deadline, status) WHERE deleted_at IS NULL AND status IN ('pending', 'under_review') - Find overdue approvals
- INDEX idx_queue_priority (priority, submission_timestamp) WHERE deleted_at IS NULL AND status IN ('pending', 'under_review') - Queue ordering
- INDEX idx_queue_delegation (delegation_id) WHERE is_delegated = true - Track delegated approvals

**Unique Constraints**:
- UNIQUE (document_id, document_type, current_approval_level) WHERE deleted_at IS NULL - Prevent duplicate queue items for same document at same level

#### Business Rules Enforced by Schema

1. **BR-QUEUE-001**: A document can only have one active queue item per approval level
   - Enforcement: Unique constraint on (document_id, document_type, current_approval_level) WHERE deleted_at IS NULL

2. **BR-QUEUE-002**: Total amount must be non-negative
   - Enforcement: CHECK constraint (total_amount >= 0 AND base_currency_amount >= 0)

3. **BR-QUEUE-003**: Approval level must be within valid range (1 to approval_level_required, max 10)
   - Enforcement: CHECK constraint (current_approval_level >= 1 AND current_approval_level <= approval_level_required AND approval_level_required <= 10)

4. **BR-QUEUE-004**: SLA deadline must be after submission timestamp
   - Enforcement: CHECK constraint (sla_deadline > submission_timestamp)

5. **BR-QUEUE-005**: Delegated approvals must reference original approver and delegation
   - Enforcement: CHECK constraint (NOT is_delegated OR (original_approver_user_id IS NOT NULL AND delegation_id IS NOT NULL))

6. **BR-QUEUE-006**: Escalated approvals must have escalation level
   - Enforcement: CHECK constraint (NOT is_escalated OR escalation_level IS NOT NULL)

7. **BR-QUEUE-007**: SLA pause duration only valid when SLA is paused
   - Enforcement: CHECK constraint (sla_paused_at IS NOT NULL OR sla_paused_duration IS NULL)

8. **BR-QUEUE-008**: Status must be from allowed enumeration
   - Enforcement: CHECK constraint (status IN ('pending', 'under_review', 'approved', 'rejected', 'returned', 'awaiting_info', 'recalled'))

9. **BR-QUEUE-009**: Priority must be from allowed enumeration
   - Enforcement: CHECK constraint (priority IN ('urgent', 'high', 'normal', 'low'))

10. **BR-QUEUE-010**: Document type must be from allowed enumeration
    - Enforcement: CHECK constraint (document_type IN ('purchase_request', 'purchase_order', 'grn', 'credit_note', 'wastage', 'stock_requisition', 'inventory_adjustment', 'stock_transfer'))

---

### Entity: approval_actions

**Description**: Records all approval decisions and actions taken by approvers. Each row is an immutable audit trail entry capturing who approved/rejected a document, when, why, and any modifications made (partial approvals).

**Business Purpose**: Provides complete, tamper-proof audit trail for compliance, forensics, and reporting. Enables approval history visualization, performance metrics, and regulatory compliance reporting.

**Data Ownership**: Audit & Compliance Team (immutable records)

**Access Pattern**:
- Primary: Query by document_id + document_type (approval history for specific document)
- Secondary: Query by approver_user_id + action_timestamp (approver's action history)
- Tertiary: Query by action_type + action_timestamp (all approvals/rejections in date range)
- Analytics: Aggregate queries for approval metrics (average time, rejection rate, etc.)

**Data Volume**: ~200K approval actions per year (assumes ~15K documents × 1.5 avg approval levels × 1.2 rejection/rework factor)

#### Fields Overview

**Primary Identification**:
- **ID Field**: id - UUID primary key, auto-generated
- **Business Key**: No human-readable key (audit log entries)
- **Display Name**: Action type + approver name + timestamp

**Core Business Fields**:
- **queue_item_id**: UUID reference to approval_queue_items table
  - Required: Yes
  - Purpose: Link action to specific queue item (and through it, to document)
  - Foreign key: approval_queue_items(id) ON DELETE RESTRICT
  - Example: Queue item UUID for PR-2501-001234 Level 2 approval

- **document_id**: UUID reference to source document (denormalized)
  - Required: Yes
  - Purpose: Direct link to document without JOIN (query performance)
  - Example: Purchase request UUID

- **document_type**: VARCHAR(50) - Document type (denormalized)
  - Required: Yes
  - Purpose: Quick filtering by document type without JOIN
  - Example: 'purchase_request'

- **document_reference_number**: VARCHAR(50) - Human-readable reference (denormalized)
  - Required: Yes
  - Purpose: Display in audit trail without JOIN
  - Example: PR-2501-001234

- **approval_level**: INTEGER - Which approval level this action occurred at
  - Required: Yes
  - Range: 1 to 10
  - Purpose: Track multi-level approval progress
  - Example: 2 (Purchasing Manager level)

- **approver_user_id**: UUID reference to users table
  - Required: Yes
  - Purpose: Who performed the approval action
  - Foreign key: users(id) ON DELETE SET NULL (preserve audit even if user deleted)
  - Example: Sarah Johnson's UUID

- **approver_name**: VARCHAR(255) - Approver display name (denormalized)
  - Required: Yes
  - Purpose: Display name in audit trail even if user deleted or renamed
  - Example: Sarah Johnson

- **approver_title**: VARCHAR(255) - Approver's title at time of action
  - Required: No
  - Purpose: Provide context for approval authority
  - Example: Purchasing Manager

- **action_type**: VARCHAR(50) - Type of approval action
  - Required: Yes
  - Allowed values: 'approve', 'reject', 'request_info', 'return', 'delegate', 'partial_approve', 'recall'
  - Purpose: Categorize approval decisions
  - Example: 'approve'

- **action_timestamp**: TIMESTAMPTZ - Exact time action was performed
  - Required: Yes
  - Purpose: Audit trail timestamp and SLA calculation
  - Example: 2025-11-12 14:45:30+00

- **action_comments**: TEXT - Approver's comments or notes
  - Required: No (mandatory for certain actions per policy)
  - Max length: 500 characters
  - Purpose: Capture approval rationale, rejection reason, questions
  - Example: Approved. Necessary for Q4 menu launch. Budget available.

- **rejection_reason**: TEXT - Specific reason for rejection
  - Required: Yes (if action_type = 'reject')
  - Min length: 20 characters
  - Max length: 500 characters
  - Purpose: Clear communication to requestor
  - Example: Rejected. Similar items already ordered via PR-2501-001180 last week.

- **info_request_text**: TEXT - Information requested from requestor
  - Required: Yes (if action_type = 'request_info')
  - Min length: 20 characters
  - Max length: 1000 characters
  - Purpose: Specify what information is needed
  - Example: Please provide: 1) Equipment specifications, 2) Alternate vendor quote, 3) Justification for urgent delivery.

- **info_request_deadline**: TIMESTAMPTZ - When requestor must respond
  - Required: No (if action_type = 'request_info')
  - Default: 48 business hours from action_timestamp
  - Purpose: Set expectation for response time
  - Example: 2025-11-14 14:45:00+00

**Partial Approval Fields** (if action_type = 'partial_approve'):
- **original_quantity**: NUMERIC(15,4) - Original requested quantity
  - Required: Yes (if partial approval)
  - Purpose: Track what was requested
  - Example: 100.000

- **approved_quantity**: NUMERIC(15,4) - Approved quantity
  - Required: Yes (if partial approval)
  - Purpose: Track what was approved
  - Example: 75.000

- **rejected_quantity**: NUMERIC(15,4) - Rejected quantity (calculated: original - approved)
  - Required: Yes (if partial approval)
  - Purpose: Track what was rejected
  - Example: 25.000

- **partial_approval_reason**: TEXT - Why quantity was reduced
  - Required: Yes (if partial approval)
  - Min length: 20 characters
  - Purpose: Explain partial approval decision
  - Example: Approved 75 units. Budget sufficient for 75 only. Reject remaining 25.

**Delegation Context** (if performed by delegate):
- **acted_as_user_id**: UUID reference to users table
  - Required: No (only if approval performed by delegate)
  - Purpose: Track original approver when action by delegate
  - Foreign key: users(id) ON DELETE SET NULL
  - Example: John Smith's UUID (original approver, Sarah acted as delegate)

- **delegation_id**: UUID reference to approval_delegations table
  - Required: No (only if approval performed by delegate)
  - Purpose: Link to delegation configuration
  - Example: Delegation UUID

- **is_acting_approval**: BOOLEAN - Whether this action was by delegate
  - Required: Yes
  - Default: false
  - Purpose: Distinguish primary vs. delegated approvals
  - Example: true

**Policy Override Context** (if approval violated policy):
- **is_policy_override**: BOOLEAN - Whether approval required policy exception
  - Required: Yes
  - Default: false
  - Purpose: Flag approvals that bypassed standard policy
  - Example: true

- **override_justification**: TEXT - Justification for policy override
  - Required: Yes (if is_policy_override = true)
  - Min length: 50 characters
  - Max length: 1000 characters
  - Purpose: Document why exception was granted
  - Example: Approved with override. This vendor is the sole authorized distributor. Technical specifications require this specific brand.

- **override_approver_user_id**: UUID reference to users table
  - Required: No (if is_policy_override = true and required by policy)
  - Purpose: Track executive who authorized override
  - Example: General Manager's UUID

**Technical Context**:
- **ip_address**: VARCHAR(45) - IP address of approver
  - Required: Yes
  - Purpose: Audit trail for security and forensics
  - Example: 203.0.113.42 (IPv4) or 2001:db8::1 (IPv6)

- **device_information**: TEXT - Browser and device details
  - Required: No
  - Purpose: Provide context for approval action
  - Example: Chrome 119.0.0.0 on Windows 10

- **geographic_location**: TEXT - Approximate location from IP
  - Required: No
  - Purpose: Fraud detection and audit context
  - Example: Singapore, SG

- **session_id**: VARCHAR(255) - User session identifier
  - Required: Yes
  - Purpose: Correlate actions within same session
  - Example: sess_550e8400e29b41d5a716446655440000

- **is_biometric_auth**: BOOLEAN - Whether biometric authentication used
  - Required: Yes
  - Default: false
  - Purpose: Flag approvals using biometric for added security
  - Example: true (Face ID on mobile device)

**Performance Metrics** (calculated):
- **approval_duration_seconds**: INTEGER - Time from submission to this approval
  - Required: No
  - Calculation: action_timestamp - submission_timestamp (in seconds)
  - Purpose: Track approval speed for SLA compliance
  - Example: 3600 (1 hour)

- **level_duration_seconds**: INTEGER - Time from previous level to this level
  - Required: No
  - Calculation: this.action_timestamp - previous_level.action_timestamp
  - Purpose: Identify bottlenecks at specific approval levels
  - Example: 1800 (30 minutes)

**Flexible Data Fields**:
- **metadata**: JSONB - Additional flexible attributes
  - Required: No
  - Common attributes:
    - approval_notes: Internal notes not visible to requestor
    - risk_assessment: Risk score or notes
    - alternative_vendors: Suggested vendors
    - budget_notes: Budget-related annotations
  - Example: {"risk_assessment": "Low risk, routine purchase", "budget_notes": "Within Q4 allocation"}

**Audit Fields** (Standard for all entities):
- **created_date**: TIMESTAMPTZ - When action was recorded
  - Required: Yes
  - Default: NOW()
  - Immutable: Yes
  - Purpose: Audit trail timestamp (should match action_timestamp)
  - Example: 2025-11-12 14:45:30+00

- **created_by**: UUID reference to users table
  - Required: Yes
  - Purpose: Who created the audit record (same as approver_user_id)
  - Example: Approver's UUID

- **deleted_at**: TIMESTAMPTZ - Soft delete timestamp
  - Required: No (NULL for active records)
  - Purpose: Soft delete for audit corrections (rarely used, approval actions are immutable)
  - Note: Approval actions should never be deleted; use correction records instead
  - Example: NULL

**Integrity Verification**:
- **action_hash**: VARCHAR(64) - Cryptographic hash of action data
  - Required: Yes
  - Calculation: SHA-256 hash of concatenated key fields
  - Purpose: Tamper detection for audit trail integrity
  - Example: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

- **previous_action_hash**: VARCHAR(64) - Hash of previous action for this document
  - Required: No (NULL for first action)
  - Purpose: Create hash chain for tamper evidence
  - Example: d3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|------------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key | 770e8400-e29b-41d5-a716-446655440000 | PK, NOT NULL |
| queue_item_id | UUID | Yes | - | Reference to queue item | Queue UUID | NOT NULL, FK approval_queue_items(id), INDEX |
| document_id | UUID | Yes | - | Reference to source document | Document UUID | NOT NULL, INDEX |
| document_type | VARCHAR(50) | Yes | - | Type of document | purchase_request | NOT NULL, INDEX |
| document_reference_number | VARCHAR(50) | Yes | - | Human-readable document ref | PR-2501-001234 | NOT NULL |
| approval_level | INTEGER | Yes | - | Approval level number | 2 | NOT NULL, CHECK (1-10) |
| approver_user_id | UUID | Yes | - | Approver user | User UUID | NOT NULL, FK users(id) ON DELETE SET NULL, INDEX |
| approver_name | VARCHAR(255) | Yes | - | Approver display name | Sarah Johnson | NOT NULL |
| approver_title | VARCHAR(255) | No | - | Approver's title | Purchasing Manager | |
| action_type | VARCHAR(50) | Yes | - | Type of action | approve, reject | NOT NULL, CHECK (IN allowed values), INDEX |
| action_timestamp | TIMESTAMPTZ | Yes | - | When action performed | 2025-11-12 14:45:30+00 | NOT NULL, INDEX |
| action_comments | TEXT | No | - | Approver comments | Approved. Budget available. | MAX 500 chars |
| rejection_reason | TEXT | No | - | Rejection reason | Rejected. Budget insufficient. | MIN 20 chars, MAX 500 chars |
| info_request_text | TEXT | No | - | Information requested | Please provide specifications | MIN 20 chars, MAX 1000 chars |
| info_request_deadline | TIMESTAMPTZ | No | - | Response deadline | 2025-11-14 14:45:00+00 | |
| original_quantity | NUMERIC(15,4) | No | - | Original requested qty | 100.0000 | CHECK (>0) if partial |
| approved_quantity | NUMERIC(15,4) | No | - | Approved quantity | 75.0000 | CHECK (>0) if partial |
| rejected_quantity | NUMERIC(15,4) | No | - | Rejected quantity | 25.0000 | CHECK (≥0) if partial |
| partial_approval_reason | TEXT | No | - | Why partial | Budget only covers 75 units | MIN 20 chars if partial |
| acted_as_user_id | UUID | No | - | Original approver (if delegated) | User UUID | FK users(id) ON DELETE SET NULL |
| delegation_id | UUID | No | - | Delegation reference | Delegation UUID | FK approval_delegations(id) |
| is_acting_approval | BOOLEAN | Yes | false | Approval by delegate | true, false | NOT NULL |
| is_policy_override | BOOLEAN | Yes | false | Policy exception | true, false | NOT NULL |
| override_justification | TEXT | No | - | Override reason | Sole authorized distributor | MIN 50 chars if override |
| override_approver_user_id | UUID | No | - | Override authorizer | GM UUID | FK users(id) |
| ip_address | VARCHAR(45) | Yes | - | Approver IP address | 203.0.113.42 | NOT NULL |
| device_information | TEXT | No | - | Browser and device | Chrome 119 on Windows 10 | |
| geographic_location | TEXT | No | - | Approximate location | Singapore, SG | |
| session_id | VARCHAR(255) | Yes | - | Session identifier | sess_550e8400... | NOT NULL |
| is_biometric_auth | BOOLEAN | Yes | false | Biometric authentication used | true, false | NOT NULL |
| approval_duration_seconds | INTEGER | No | - | Time from submission | 3600 | CHECK (≥0) |
| level_duration_seconds | INTEGER | No | - | Time from previous level | 1800 | CHECK (≥0) |
| metadata | JSONB | No | - | Flexible additional data | {"risk_assessment": "Low"} | Valid JSON |
| created_date | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-11-12 14:45:30+00 | NOT NULL, Immutable |
| created_by | UUID | Yes | - | Creator user | Approver UUID | NOT NULL, FK users(id) |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL | Rarely used |
| action_hash | VARCHAR(64) | Yes | - | SHA-256 hash of action | e3b0c44298... | NOT NULL, Unique |
| previous_action_hash | VARCHAR(64) | No | - | Previous action hash | d3b0c44298... | Creates hash chain |

#### Indexes

**Primary Index**:
- PRIMARY KEY (id)

**Foreign Key Indexes**:
- INDEX idx_actions_queue (queue_item_id) - Find all actions for queue item
- INDEX idx_actions_document (document_id, document_type, approval_level) - Approval history for document
- INDEX idx_actions_approver (approver_user_id, action_timestamp DESC) - Approver's action history

**Query Optimization Indexes**:
- INDEX idx_actions_type_timestamp (action_type, action_timestamp) - Filter by action type and date
- INDEX idx_actions_delegation (delegation_id) WHERE is_acting_approval = true - Track delegated approvals

**Analytics Indexes**:
- INDEX idx_actions_metrics (document_type, action_type, action_timestamp) - Approval metrics calculations

#### Business Rules Enforced by Schema

1. **BR-ACTION-001**: Rejection requires rejection reason (min 20 characters)
   - Enforcement: CHECK constraint ((action_type != 'reject') OR (rejection_reason IS NOT NULL AND LENGTH(rejection_reason) >= 20))

2. **BR-ACTION-002**: Information request requires request text and deadline
   - Enforcement: CHECK constraint ((action_type != 'request_info') OR (info_request_text IS NOT NULL AND info_request_deadline IS NOT NULL))

3. **BR-ACTION-003**: Partial approval requires quantity fields and reason
   - Enforcement: CHECK constraint ((action_type != 'partial_approve') OR (original_quantity IS NOT NULL AND approved_quantity IS NOT NULL AND rejected_quantity IS NOT NULL AND partial_approval_reason IS NOT NULL))

4. **BR-ACTION-004**: Policy override requires justification (min 50 characters)
   - Enforcement: CHECK constraint (NOT is_policy_override OR (override_justification IS NOT NULL AND LENGTH(override_justification) >= 50))

5. **BR-ACTION-005**: Acting approval requires acted_as_user_id and delegation_id
   - Enforcement: CHECK constraint (NOT is_acting_approval OR (acted_as_user_id IS NOT NULL AND delegation_id IS NOT NULL))

6. **BR-ACTION-006**: Approval actions are immutable (deleted_at should always be NULL)
   - Enforcement: Application-level enforcement (database allows soft delete for error correction only)

7. **BR-ACTION-007**: Action timestamp cannot be in the future
   - Enforcement: CHECK constraint (action_timestamp <= NOW())

8. **BR-ACTION-008**: Info request deadline must be after action timestamp
   - Enforcement: CHECK constraint ((action_type != 'request_info') OR (info_request_deadline > action_timestamp))

9. **BR-ACTION-009**: Approved quantity must be less than original quantity for partial approval
   - Enforcement: CHECK constraint ((action_type != 'partial_approve') OR (approved_quantity < original_quantity))

10. **BR-ACTION-010**: Rejected quantity must equal original minus approved
    - Enforcement: CHECK constraint ((action_type != 'partial_approve') OR (rejected_quantity = original_quantity - approved_quantity))

---

### Entity: approval_delegations

**Description**: Defines temporary delegation of approval authority from one user (delegator) to another user (delegate). Each row represents a time-bound delegation configuration enabling business continuity during absences.

**Business Purpose**: Enable approvers to delegate their approval authority to colleagues during planned absences (vacation, business trips) or urgent unavailability (illness, emergencies), ensuring approval workflows continue without bottlenecks.

**Data Ownership**: Delegator (user who creates delegation)

**Access Pattern**:
- Primary: Query by delegator_user_id + is_active = true (user's active delegations)
- Secondary: Query by delegate_user_id + is_active = true (delegations assigned to user)
- Tertiary: Query by start_datetime <= NOW() AND end_datetime >= NOW() + status = 'active' (currently active delegations)
- Background: Query by start_datetime <= NOW() + status = 'scheduled' (delegations ready for activation)
- Background: Query by end_datetime <= NOW() + status = 'active' (delegations ready for expiration)

**Data Volume**: ~500 active delegations at any time, ~5,000 delegations per year

#### Fields Overview

**Primary Identification**:
- **ID Field**: id - UUID primary key, auto-generated
- **Business Key**: No human-readable key (internal system records)
- **Display Name**: Delegator name → Delegate name (start - end dates)

**Core Delegation Fields**:
- **delegator_user_id**: UUID reference to users table
  - Required: Yes
  - Purpose: Original approver delegating authority
  - Foreign key: users(id) ON DELETE CASCADE
  - Example: John Smith's UUID

- **delegate_user_id**: UUID reference to users table
  - Required: Yes
  - Purpose: User receiving delegated authority
  - Foreign key: users(id) ON DELETE CASCADE
  - Constraint: Must be different from delegator_user_id
  - Example: Sarah Johnson's UUID

- **delegation_reason**: TEXT - Why delegation is needed
  - Required: Yes
  - Min length: 10 characters
  - Max length: 500 characters
  - Purpose: Document delegation justification
  - Example: Annual leave - will be out of office Dec 15-22

- **delegation_notes**: TEXT - Additional notes or instructions
  - Required: No
  - Max length: 1000 characters
  - Purpose: Special instructions for delegate
  - Example: Contact me via email only for emergencies. High-value PRs (>$25K) require extra scrutiny.

**Temporal Attributes**:
- **start_datetime**: TIMESTAMPTZ - When delegation becomes active
  - Required: Yes
  - Purpose: Schedule delegation activation
  - Constraint: Must be ≥ NOW() for new delegations (can be immediate or future)
  - Example: 2025-12-15 00:00:00+00

- **end_datetime**: TIMESTAMPTZ - When delegation expires
  - Required: Yes
  - Purpose: Schedule automatic delegation expiration
  - Constraint: Must be > start_datetime, maximum 90 days duration
  - Example: 2025-12-22 23:59:59+00

- **is_active**: BOOLEAN - Computed field: Whether delegation currently active
  - Required: Yes
  - Calculation: start_datetime <= NOW() AND end_datetime >= NOW() AND status = 'active'
  - Purpose: Quick filter for active delegations
  - Example: true

**Scope Attributes**:
- **delegation_scope**: VARCHAR(50) - What the delegation covers
  - Required: Yes
  - Allowed values: 'all_documents', 'specific_types', 'specific_departments'
  - Default: 'all_documents'
  - Purpose: Define breadth of delegation
  - Example: 'specific_types'

- **document_types**: TEXT[] (array) - Document types included (if scope = 'specific_types')
  - Required: No (Yes if delegation_scope = 'specific_types')
  - Allowed values: Array of document type enums
  - Purpose: Limit delegation to certain document types
  - Example: ['purchase_request', 'wastage']

- **departments**: UUID[] (array) - Departments included (if scope = 'specific_departments')
  - Required: No (Yes if delegation_scope = 'specific_departments')
  - Purpose: Limit delegation to specific departments
  - Example: [F&B Dept UUID, Kitchen Dept UUID]

- **maximum_amount_limit**: NUMERIC(15,2) - Maximum amount delegate can approve
  - Required: No
  - Default: Delegator's approval authority
  - Constraint: Cannot exceed delegate's own approval authority
  - Purpose: Cap delegation for risk management
  - Example: 50000.00 (delegate can approve up to $50K)

- **delegation_type**: VARCHAR(20) - How delegation works
  - Required: Yes
  - Allowed values: 'full_delegation', 'notification_only'
  - Default: 'full_delegation'
  - Purpose: Distinguish between full authority transfer and awareness notification
  - Example: 'full_delegation'
  - Note: 'notification_only' means delegate gets notified but cannot approve

**Status Attributes**:
- **status**: VARCHAR(20) - Delegation lifecycle status
  - Required: Yes
  - Allowed values: 'scheduled', 'active', 'expired', 'revoked', 'refused'
  - Default: 'scheduled' (if start_datetime > NOW()) or 'active' (if start_datetime <= NOW())
  - Purpose: Track delegation state
  - Status transitions:
    - scheduled → active (at start_datetime)
    - active → expired (at end_datetime)
    - scheduled/active → revoked (delegator cancels)
    - scheduled → refused (delegate refuses)
  - Example: 'active'

- **activation_timestamp**: TIMESTAMPTZ - When delegation was activated
  - Required: No (NULL until activated)
  - Purpose: Track actual activation time (may differ from start_datetime due to processing delay)
  - Example: 2025-12-15 00:01:05+00

- **deactivation_timestamp**: TIMESTAMPTZ - When delegation was deactivated
  - Required: No (NULL while active)
  - Purpose: Track expiration or revocation time
  - Example: 2025-12-22 23:59:59+00

- **revocation_reason**: TEXT - Why delegation was revoked
  - Required: No (Yes if status = 'revoked')
  - Min length: 10 characters
  - Purpose: Document early termination reason
  - Example: Returned from trip early due to emergency

- **refusal_reason**: TEXT - Why delegate refused delegation
  - Required: No (Yes if status = 'refused')
  - Min length: 10 characters
  - Purpose: Document delegate's refusal reason
  - Example: I will also be on leave during this period. Cannot accept delegation.

**Transfer Tracking**:
- **approvals_transferred_count**: INTEGER - Number of pending approvals transferred to delegate
  - Required: No
  - Default: 0
  - Purpose: Track how many approvals moved to delegate on activation
  - Example: 12

- **approvals_processed_count**: INTEGER - Number of approvals delegate processed during delegation
  - Required: No
  - Default: 0
  - Purpose: Track delegation usage
  - Example: 8

**Flexible Data Fields**:
- **metadata**: JSONB - Additional flexible attributes
  - Required: No
  - Common attributes:
    - manager_approved: Whether manager approved delegation
    - emergency_contact: How to reach delegator
    - business_justification: Detailed business reason
    - auto_suggested: Whether system suggested this delegation
  - Example: {"manager_approved": true, "emergency_contact": "john.smith@email.com"}

**Audit Fields** (Standard for all entities):
- **created_date**: TIMESTAMPTZ - When delegation was created
  - Required: Yes
  - Default: NOW()
  - Immutable: Yes
  - Purpose: Track delegation creation
  - Example: 2025-11-12 10:30:00+00

- **created_by**: UUID reference to users table
  - Required: Yes
  - Purpose: Who created the delegation (should match delegator_user_id)
  - Example: John Smith's UUID

- **updated_date**: TIMESTAMPTZ - Last modification timestamp
  - Required: Yes
  - Default: NOW()
  - Auto-updated: Yes
  - Purpose: Track delegation edits (extending end date, revocation, etc.)
  - Example: 2025-12-10 08:15:00+00

- **updated_by**: UUID reference to users table
  - Required: Yes
  - Purpose: Who last modified the delegation
  - Example: John Smith's UUID (or system user for auto-expiration)

- **deleted_at**: TIMESTAMPTZ - Soft delete timestamp
  - Required: No (NULL for active records)
  - Purpose: Preserve delegation history
  - Example: NULL

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|------------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key | 880e8400-e29b-41d5-a716-446655440000 | PK, NOT NULL |
| delegator_user_id | UUID | Yes | - | User delegating authority | User UUID | NOT NULL, FK users(id) ON DELETE CASCADE, INDEX |
| delegate_user_id | UUID | Yes | - | User receiving delegation | User UUID | NOT NULL, FK users(id) ON DELETE CASCADE, INDEX |
| delegation_reason | TEXT | Yes | - | Why delegation needed | Annual leave Dec 15-22 | NOT NULL, MIN 10 chars, MAX 500 chars |
| delegation_notes | TEXT | No | - | Additional instructions | Contact via email only | MAX 1000 chars |
| start_datetime | TIMESTAMPTZ | Yes | - | Delegation start time | 2025-12-15 00:00:00+00 | NOT NULL |
| end_datetime | TIMESTAMPTZ | Yes | - | Delegation end time | 2025-12-22 23:59:59+00 | NOT NULL, CHECK (> start_datetime) |
| is_active | BOOLEAN | Yes | Computed | Currently active | true, false | NOT NULL |
| delegation_scope | VARCHAR(50) | Yes | 'all_documents' | What delegation covers | all_documents, specific_types | NOT NULL, CHECK (IN allowed values) |
| document_types | TEXT[] | No | - | Included document types | {purchase_request, wastage} | Array of enums |
| departments | UUID[] | No | - | Included departments | {UUID1, UUID2} | Array of UUIDs |
| maximum_amount_limit | NUMERIC(15,2) | No | - | Max approval amount | 50000.00 | CHECK (>0) |
| delegation_type | VARCHAR(20) | Yes | 'full_delegation' | Delegation type | full_delegation, notification_only | NOT NULL, CHECK (IN allowed values) |
| status | VARCHAR(20) | Yes | 'scheduled' or 'active' | Delegation status | scheduled, active, expired | NOT NULL, CHECK (IN allowed values), INDEX |
| activation_timestamp | TIMESTAMPTZ | No | - | When activated | 2025-12-15 00:01:05+00 | NULL until activated |
| deactivation_timestamp | TIMESTAMPTZ | No | - | When deactivated | 2025-12-22 23:59:59+00 | NULL while active |
| revocation_reason | TEXT | No | - | Revocation reason | Returned early from trip | MIN 10 chars if revoked |
| refusal_reason | TEXT | No | - | Refusal reason | Also on leave during period | MIN 10 chars if refused |
| approvals_transferred_count | INTEGER | No | 0 | Approvals transferred | 12 | CHECK (≥0) |
| approvals_processed_count | INTEGER | No | 0 | Approvals processed | 8 | CHECK (≥0) |
| metadata | JSONB | No | - | Flexible additional data | {"manager_approved": true} | Valid JSON |
| created_date | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-11-12 10:30:00+00 | NOT NULL, Immutable |
| created_by | UUID | Yes | - | Creator user | Delegator UUID | NOT NULL, FK users(id) |
| updated_date | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-12-10 08:15:00+00 | NOT NULL, Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user | Delegator UUID | NOT NULL, FK users(id) |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL | NULL for active |

#### Indexes

**Primary Index**:
- PRIMARY KEY (id)

**Foreign Key Indexes**:
- INDEX idx_delegations_delegator (delegator_user_id, status, is_active) - Find user's delegations
- INDEX idx_delegations_delegate (delegate_user_id, status, is_active) - Find delegations assigned to user

**Query Optimization Indexes**:
- INDEX idx_delegations_active (start_datetime, end_datetime, status) WHERE is_active = true - Find currently active delegations
- INDEX idx_delegations_scheduled (start_datetime) WHERE status = 'scheduled' - Find delegations ready for activation
- INDEX idx_delegations_expiring (end_datetime) WHERE status = 'active' - Find delegations ready for expiration

**Unique Constraints**:
- UNIQUE (delegator_user_id, start_datetime, end_datetime) WHERE deleted_at IS NULL - Prevent overlapping delegations from same user

#### Business Rules Enforced by Schema

1. **BR-DELEG-001**: Delegate must be different from delegator
   - Enforcement: CHECK constraint (delegate_user_id != delegator_user_id)

2. **BR-DELEG-002**: End datetime must be after start datetime
   - Enforcement: CHECK constraint (end_datetime > start_datetime)

3. **BR-DELEG-003**: Delegation period cannot exceed 90 days
   - Enforcement: CHECK constraint ((end_datetime - start_datetime) <= INTERVAL '90 days')

4. **BR-DELEG-004**: Specific types scope requires document_types array
   - Enforcement: CHECK constraint ((delegation_scope != 'specific_types') OR (document_types IS NOT NULL))

5. **BR-DELEG-005**: Specific departments scope requires departments array
   - Enforcement: CHECK constraint ((delegation_scope != 'specific_departments') OR (departments IS NOT NULL))

6. **BR-DELEG-006**: Revoked delegation requires revocation reason
   - Enforcement: CHECK constraint ((status != 'revoked') OR (revocation_reason IS NOT NULL))

7. **BR-DELEG-007**: Refused delegation requires refusal reason
   - Enforcement: CHECK constraint ((status != 'refused') OR (refusal_reason IS NOT NULL))

8. **BR-DELEG-008**: Active delegation must be within start and end datetime
   - Enforcement: CHECK constraint ((status != 'active') OR (NOW() >= start_datetime AND NOW() <= end_datetime))

9. **BR-DELEG-009**: Maximum amount limit must be positive
   - Enforcement: CHECK constraint ((maximum_amount_limit IS NULL) OR (maximum_amount_limit > 0))

10. **BR-DELEG-010**: Approval counts must be non-negative
    - Enforcement: CHECK constraint (approvals_transferred_count >= 0 AND approvals_processed_count >= 0)

---

### Entity: approval_sla_configuration

**Description**: Defines Service Level Agreement (SLA) targets and escalation rules for approval workflows by document type and priority level. Each row represents an SLA policy specifying how quickly approvals should be completed and when to escalate if deadlines are missed.

**Business Purpose**: Enable organization to enforce consistent approval turnaround times across document types, with stricter SLAs for urgent requests. Provides the foundation for SLA monitoring, compliance reporting, and automatic escalation.

**Data Ownership**: System Administration Team

**Access Pattern**:
- Primary: Query by document_type + priority_level (lookup SLA for specific document)
- Secondary: Query by document_type only (all SLA tiers for document type)
- Tertiary: Query by escalation_enabled = true (find which SLAs have escalation)
- Configuration: Admin UI for SLA policy management

**Data Volume**: ~32 rows (8 document types × 4 priority levels), very low change frequency

#### Fields Overview

**Primary Identification**:
- **ID Field**: id - UUID primary key, auto-generated
- **Business Key**: Composite of document_type + priority_level (unique constraint)
- **Display Name**: Document type name + priority level

**Core Business Fields**:
- **document_type**: VARCHAR(50) - Type of document this SLA applies to
  - Required: Yes
  - Allowed values: 'purchase_request', 'purchase_order', 'grn', 'credit_note', 'wastage', 'stock_requisition', 'inventory_adjustment', 'stock_transfer'
  - Purpose: Define which documents this SLA policy governs
  - Example: 'purchase_request'

- **priority_level**: VARCHAR(20) - Priority level for this SLA
  - Required: Yes
  - Allowed values: 'urgent', 'high', 'normal', 'low'
  - Purpose: Different priorities have different SLA targets
  - Example: 'urgent'

- **target_response_hours**: NUMERIC(8,2) - Target hours for first response (view/review)
  - Required: Yes
  - Unit: Business hours
  - Purpose: How quickly approver should first review document
  - Example: 2.00 (2 hours for urgent PRs)

- **target_approval_hours**: NUMERIC(8,2) - Target hours for approval decision
  - Required: Yes
  - Unit: Business hours
  - Purpose: How quickly approval should be completed
  - Example: 8.00 (8 hours for urgent PRs)

- **target_approval_business_days**: INTEGER - Target in business days (derived from hours)
  - Required: No
  - Calculation: target_approval_hours / 8 (rounded up)
  - Purpose: Display-friendly SLA target for users
  - Example: 1 (1 business day)

**Escalation Configuration**:
- **escalation_enabled**: BOOLEAN - Whether escalation is enabled for this SLA
  - Required: Yes
  - Default: true
  - Purpose: Some SLAs may not require escalation
  - Example: true

- **escalation_threshold_percent**: INTEGER - When to escalate (% of SLA elapsed)
  - Required: No (Yes if escalation_enabled = true)
  - Range: 50 to 100
  - Default: 80
  - Purpose: Trigger escalation before SLA breach (e.g., at 80% elapsed)
  - Example: 80 (escalate when 6.4 hours elapsed of 8-hour SLA)

- **escalation_level_1_role**: VARCHAR(100) - Role to escalate to (Level 1)
  - Required: No (Yes if escalation_enabled = true)
  - Purpose: Define who receives escalation notification
  - Example: 'purchasing_manager'

- **escalation_level_2_role**: VARCHAR(100) - Role for second escalation (Level 2)
  - Required: No
  - Purpose: Further escalation if Level 1 doesn't resolve
  - Example: 'financial_controller'

- **escalation_level_3_role**: VARCHAR(100) - Role for final escalation (Level 3)
  - Required: No
  - Purpose: Executive escalation for critical delays
  - Example: 'general_manager'

- **escalation_intervals_hours**: NUMERIC(8,2) - Hours between escalation levels
  - Required: No
  - Default: 4.00
  - Purpose: Time to wait before escalating to next level
  - Example: 2.00 (2 hours between Level 1 and Level 2)

**Business Hours Configuration**:
- **business_hours_start**: TIME - Start of business day
  - Required: Yes
  - Default: 08:00:00
  - Purpose: Define when SLA clock starts counting
  - Example: 08:00:00

- **business_hours_end**: TIME - End of business day
  - Required: Yes
  - Default: 18:00:00
  - Purpose: Define when SLA clock stops counting
  - Example: 18:00:00

- **business_days**: TEXT[] (array) - Which days are business days
  - Required: Yes
  - Default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  - Purpose: Exclude weekends and holidays from SLA calculation
  - Example: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

- **exclude_holidays**: BOOLEAN - Whether to exclude public holidays
  - Required: Yes
  - Default: true
  - Purpose: Pause SLA on holidays
  - Example: true

**Notification Configuration**:
- **notify_approaching_sla**: BOOLEAN - Send notification when approaching SLA deadline
  - Required: Yes
  - Default: true
  - Purpose: Warn approver before SLA breach
  - Example: true

- **approaching_sla_threshold_percent**: INTEGER - When to send approaching notification
  - Required: No (Yes if notify_approaching_sla = true)
  - Range: 50 to 100
  - Default: 75
  - Purpose: Warn at 75% SLA elapsed
  - Example: 75

- **notify_sla_breach**: BOOLEAN - Send notification on SLA breach
  - Required: Yes
  - Default: true
  - Purpose: Alert stakeholders of SLA violation
  - Example: true

**Scope Attributes**:
- **applies_to_departments**: UUID[] (array) - Departments this SLA applies to
  - Required: No
  - Default: NULL (applies to all departments)
  - Purpose: Allow department-specific SLA policies
  - Example: NULL or [F&B Dept UUID, Kitchen Dept UUID]

- **applies_to_locations**: UUID[] (array) - Locations this SLA applies to
  - Required: No
  - Default: NULL (applies to all locations)
  - Purpose: Allow location-specific SLA policies (e.g., stricter for main office)
  - Example: NULL

- **is_active**: BOOLEAN - Whether this SLA configuration is active
  - Required: Yes
  - Default: true
  - Purpose: Deactivate old SLA policies without deletion
  - Example: true

**Flexible Data Fields**:
- **metadata**: JSONB - Additional flexible attributes
  - Required: No
  - Common attributes:
    - exception_rules: Special cases for this SLA
    - holiday_calendar_id: Reference to holiday calendar
    - timezone: Time zone for SLA calculation
    - sla_calculation_notes: Implementation notes
  - Example: {"timezone": "Asia/Singapore", "holiday_calendar_id": "SG2025"}

**Audit Fields**:
- **created_date**: TIMESTAMPTZ - When SLA configuration was created
  - Required: Yes
  - Default: NOW()
  - Immutable: Yes
  - Example: 2025-01-01 00:00:00+00

- **created_by**: UUID reference to users table
  - Required: Yes
  - Purpose: Admin who created this SLA policy
  - Example: System Admin UUID

- **updated_date**: TIMESTAMPTZ - Last modification timestamp
  - Required: Yes
  - Default: NOW()
  - Auto-updated: Yes
  - Purpose: Track SLA policy changes
  - Example: 2025-11-12 10:00:00+00

- **updated_by**: UUID reference to users table
  - Required: Yes
  - Purpose: Admin who last modified this SLA policy
  - Example: System Admin UUID

- **deleted_at**: TIMESTAMPTZ - Soft delete timestamp
  - Required: No
  - Purpose: Preserve SLA policy history
  - Example: NULL

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|------------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key | UUID | PK, NOT NULL |
| document_type | VARCHAR(50) | Yes | - | Document type | purchase_request, wastage | NOT NULL, CHECK (IN allowed values), INDEX |
| priority_level | VARCHAR(20) | Yes | - | Priority level | urgent, high, normal, low | NOT NULL, CHECK (IN allowed values), INDEX |
| target_response_hours | NUMERIC(8,2) | Yes | - | Target hours for first response | 2.00 | NOT NULL, CHECK (>0) |
| target_approval_hours | NUMERIC(8,2) | Yes | - | Target hours for approval | 8.00 | NOT NULL, CHECK (>0) |
| target_approval_business_days | INTEGER | No | - | Target business days | 1 | Computed from hours |
| escalation_enabled | BOOLEAN | Yes | true | Escalation enabled | true, false | NOT NULL |
| escalation_threshold_percent | INTEGER | No | 80 | When to escalate (%) | 80 | CHECK (50-100) if enabled |
| escalation_level_1_role | VARCHAR(100) | No | - | Level 1 escalation role | purchasing_manager | Required if enabled |
| escalation_level_2_role | VARCHAR(100) | No | - | Level 2 escalation role | financial_controller | |
| escalation_level_3_role | VARCHAR(100) | No | - | Level 3 escalation role | general_manager | |
| escalation_intervals_hours | NUMERIC(8,2) | No | 4.00 | Hours between escalations | 2.00 | CHECK (>0) |
| business_hours_start | TIME | Yes | 08:00:00 | Business day start time | 08:00:00 | NOT NULL |
| business_hours_end | TIME | Yes | 18:00:00 | Business day end time | 18:00:00 | NOT NULL, CHECK (> start) |
| business_days | TEXT[] | Yes | weekdays | Business days array | {monday, tuesday, ...} | NOT NULL, Valid days |
| exclude_holidays | BOOLEAN | Yes | true | Exclude public holidays | true, false | NOT NULL |
| notify_approaching_sla | BOOLEAN | Yes | true | Notify when approaching SLA | true, false | NOT NULL |
| approaching_sla_threshold_percent | INTEGER | No | 75 | Approaching notification % | 75 | CHECK (50-100) if enabled |
| notify_sla_breach | BOOLEAN | Yes | true | Notify on SLA breach | true, false | NOT NULL |
| applies_to_departments | UUID[] | No | NULL | Department scope | {UUID1, UUID2} or NULL | Array of UUIDs |
| applies_to_locations | UUID[] | No | NULL | Location scope | {UUID1, UUID2} or NULL | Array of UUIDs |
| is_active | BOOLEAN | Yes | true | Configuration active | true, false | NOT NULL |
| metadata | JSONB | No | - | Flexible additional data | {"timezone": "Asia/Singapore"} | Valid JSON |
| created_date | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-01 00:00:00+00 | NOT NULL, Immutable |
| created_by | UUID | Yes | - | Creator user | Admin UUID | NOT NULL, FK users(id) |
| updated_date | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12 10:00:00+00 | NOT NULL, Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user | Admin UUID | NOT NULL, FK users(id) |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL | NULL for active |

#### Indexes

**Primary Index**:
- PRIMARY KEY (id)

**Unique Constraints**:
- UNIQUE (document_type, priority_level, applies_to_departments, applies_to_locations) WHERE deleted_at IS NULL AND is_active = true - One active SLA per document type + priority + scope

**Query Optimization Indexes**:
- INDEX idx_sla_lookup (document_type, priority_level, is_active) - Fast SLA lookup
- INDEX idx_sla_escalation (escalation_enabled, escalation_threshold_percent) WHERE is_active = true - Find escalation policies

#### Business Rules Enforced by Schema

1. **BR-SLA-001**: Document type and priority level combination must be unique per scope
   - Enforcement: Unique constraint on (document_type, priority_level, applies_to_departments, applies_to_locations) WHERE deleted_at IS NULL AND is_active = true

2. **BR-SLA-002**: Target hours must be positive
   - Enforcement: CHECK constraint (target_response_hours > 0 AND target_approval_hours > 0)

3. **BR-SLA-003**: Response SLA must be less than or equal to approval SLA
   - Enforcement: CHECK constraint (target_response_hours <= target_approval_hours)

4. **BR-SLA-004**: Escalation threshold must be between 50% and 100%
   - Enforcement: CHECK constraint (escalation_threshold_percent >= 50 AND escalation_threshold_percent <= 100)

5. **BR-SLA-005**: Escalation enabled requires at least Level 1 escalation role
   - Enforcement: CHECK constraint (NOT escalation_enabled OR escalation_level_1_role IS NOT NULL)

6. **BR-SLA-006**: Business hours end must be after business hours start
   - Enforcement: CHECK constraint (business_hours_end > business_hours_start)

7. **BR-SLA-007**: Business days array must contain valid day names
   - Enforcement: CHECK constraint (all elements IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'))

8. **BR-SLA-008**: Approaching SLA notification requires threshold percentage
   - Enforcement: CHECK constraint (NOT notify_approaching_sla OR approaching_sla_threshold_percent IS NOT NULL)

9. **BR-SLA-009**: Escalation interval hours must be positive
   - Enforcement: CHECK constraint ((escalation_intervals_hours IS NULL) OR (escalation_intervals_hours > 0))

10. **BR-SLA-010**: Priority level must be from allowed enumeration
    - Enforcement: CHECK constraint (priority_level IN ('urgent', 'high', 'normal', 'low'))

---

### Entity: approval_authority_matrix

**Description**: Defines approval authority limits for users by document type and approval level. Each row specifies the minimum and maximum amounts a user can approve for a specific document type, enabling automated authority validation during approval workflows.

**Business Purpose**: Enforce organizational approval hierarchy and financial controls by preventing users from approving amounts beyond their authority. Provides the foundation for automatic routing to appropriate approval levels based on document amount.

**Data Ownership**: System Administration Team

**Access Pattern**:
- Primary: Query by user_id + document_type (find user's authority for document type)
- Secondary: Query by role_id + document_type (find role-based authority)
- Tertiary: Query by document_type + amount (find required approval level for amount)
- Configuration: Admin UI for authority matrix management

**Data Volume**: ~200 rows (40 users × 5 key document types average), moderate change frequency as users promoted/roles change

#### Fields Overview

**Primary Identification**:
- **ID Field**: id - UUID primary key, auto-generated
- **Business Key**: Composite of (user_id OR role_id) + document_type + approval_level
- **Display Name**: User/Role name + document type + approval level

**Authority Subject** (One of the following must be populated):
- **user_id**: UUID reference to users table
  - Required: Conditional (user_id OR role_id must be populated, not both)
  - Purpose: Define approval authority for specific user
  - Foreign key: users(id) ON DELETE CASCADE
  - Example: Sarah Johnson's UUID (Purchasing Manager)

- **role_id**: UUID reference to roles table
  - Required: Conditional (user_id OR role_id must be populated, not both)
  - Purpose: Define approval authority for entire role
  - Foreign key: roles(id) ON DELETE CASCADE
  - Example: 'purchasing_manager' role UUID

**Authority Scope**:
- **document_type**: VARCHAR(50) - Type of document this authority applies to
  - Required: Yes
  - Allowed values: 'purchase_request', 'purchase_order', 'grn', 'credit_note', 'wastage', 'stock_requisition', 'inventory_adjustment', 'stock_transfer'
  - Purpose: Different document types may have different authority limits
  - Example: 'purchase_request'

- **approval_level**: INTEGER - Which approval level this authority applies to
  - Required: Yes
  - Range: 1 to 10
  - Purpose: Multi-level approvals have cumulative authority
  - Example: 1 (Level 1 approval: Department Head)

**Authority Limits**:
- **minimum_amount**: NUMERIC(15,2) - Minimum amount that requires this approval level
  - Required: Yes
  - Default: 0.00
  - Purpose: Define range where this authority applies
  - Example: 0.00 (can approve from $0)

- **maximum_amount**: NUMERIC(15,2) - Maximum amount this user/role can approve
  - Required: No (NULL = unlimited authority)
  - Purpose: Cap approval authority for risk management
  - Example: 50000.00 (can approve up to $50K)

- **currency_code**: VARCHAR(3) - Currency for amount limits
  - Required: Yes
  - Default: Organization's base currency
  - Purpose: Define which currency these limits apply to
  - Example: USD

- **unlimited_authority**: BOOLEAN - Whether this user/role has unlimited approval authority
  - Required: Yes
  - Default: false
  - Computed: maximum_amount IS NULL
  - Purpose: Flag executives with unlimited authority (e.g., General Manager)
  - Example: true

**Delegation Rules**:
- **can_delegate**: BOOLEAN - Whether user can delegate this authority
  - Required: Yes
  - Default: true
  - Purpose: Some authorities may be non-delegable (e.g., compliance approvals)
  - Example: true

- **can_delegate_partial**: BOOLEAN - Whether user can delegate with reduced limits
  - Required: Yes
  - Default: true
  - Purpose: Allow delegation with amount caps
  - Example: true

- **requires_biometric_auth**: BOOLEAN - Whether biometric authentication required for this authority
  - Required: Yes
  - Default: false
  - Purpose: Add security for high-value approvals
  - Example: true (for amounts >$100K)

**Scope Restrictions**:
- **applies_to_departments**: UUID[] (array) - Departments this authority applies to
  - Required: No
  - Default: NULL (applies to all departments)
  - Purpose: Limit approval authority to specific departments (e.g., F&B Manager approves only F&B PRs)
  - Example: [F&B Dept UUID, Kitchen Dept UUID]

- **applies_to_locations**: UUID[] (array) - Locations this authority applies to
  - Required: No
  - Default: NULL (applies to all locations)
  - Purpose: Limit approval authority to specific locations (e.g., Site Manager approves only their site)
  - Example: [Main Kitchen UUID, Downtown Location UUID]

- **applies_to_categories**: UUID[] (array) - Product categories this authority applies to
  - Required: No
  - Default: NULL (applies to all categories)
  - Purpose: Specialized approvers for specific categories (e.g., IT Manager for technology purchases)
  - Example: [Technology Category UUID, Equipment Category UUID]

**Effective Period**:
- **effective_start_date**: DATE - When this authority becomes effective
  - Required: Yes
  - Default: TODAY
  - Purpose: Schedule authority changes (promotions, role changes)
  - Example: 2025-01-01

- **effective_end_date**: DATE - When this authority expires
  - Required: No
  - Default: NULL (no expiration)
  - Purpose: Temporary authority assignments (acting roles, project-based)
  - Example: 2025-12-31

- **is_active**: BOOLEAN - Whether this authority is currently active
  - Required: Yes
  - Computed: effective_start_date <= TODAY AND (effective_end_date IS NULL OR effective_end_date >= TODAY)
  - Purpose: Quick filter for current authorities
  - Example: true

**Override Rules**:
- **allows_policy_override**: BOOLEAN - Whether user can approve with policy override
  - Required: Yes
  - Default: false
  - Purpose: Flag executives who can bypass normal policies (e.g., GM can approve without budget)
  - Example: true

- **requires_justification**: BOOLEAN - Whether approval requires comment/justification
  - Required: Yes
  - Default: false
  - Purpose: Enforce documentation for high-value approvals
  - Example: true (for amounts >$25K)

- **requires_dual_approval**: BOOLEAN - Whether two approvers needed at this level
  - Required: Yes
  - Default: false
  - Purpose: High-risk approvals require two signatures
  - Example: true (for amounts >$500K)

**Flexible Data Fields**:
- **metadata**: JSONB - Additional flexible attributes
  - Required: No
  - Common attributes:
    - approval_conditions: Special conditions for this authority
    - risk_level: Risk classification
    - audit_frequency: How often to audit these approvals
    - board_approval_required: Whether board notification needed
  - Example: {"risk_level": "high", "board_approval_required": true}

**Audit Fields**:
- **created_date**: TIMESTAMPTZ - When authority was created
  - Required: Yes
  - Default: NOW()
  - Immutable: Yes
  - Example: 2025-01-01 00:00:00+00

- **created_by**: UUID reference to users table
  - Required: Yes
  - Purpose: Admin who granted this authority
  - Example: System Admin UUID

- **updated_date**: TIMESTAMPTZ - Last modification timestamp
  - Required: Yes
  - Default: NOW()
  - Auto-updated: Yes
  - Purpose: Track authority changes
  - Example: 2025-11-12 10:00:00+00

- **updated_by**: UUID reference to users table
  - Required: Yes
  - Purpose: Admin who last modified this authority
  - Example: System Admin UUID

- **deleted_at**: TIMESTAMPTZ - Soft delete timestamp
  - Required: No
  - Purpose: Preserve authority history (promotions, departures)
  - Example: NULL

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|------------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key | UUID | PK, NOT NULL |
| user_id | UUID | Conditional | - | User with this authority | User UUID | FK users(id) ON DELETE CASCADE, INDEX |
| role_id | UUID | Conditional | - | Role with this authority | Role UUID | FK roles(id) ON DELETE CASCADE, INDEX |
| document_type | VARCHAR(50) | Yes | - | Document type | purchase_request, wastage | NOT NULL, CHECK (IN allowed values), INDEX |
| approval_level | INTEGER | Yes | - | Approval level number | 1 | NOT NULL, CHECK (1-10) |
| minimum_amount | NUMERIC(15,2) | Yes | 0.00 | Minimum amount | 0.00 | NOT NULL, CHECK (≥0) |
| maximum_amount | NUMERIC(15,2) | No | NULL | Maximum amount | 50000.00 | CHECK (>0) if not NULL |
| currency_code | VARCHAR(3) | Yes | Base currency | Currency code | USD, SGD | NOT NULL |
| unlimited_authority | BOOLEAN | Yes | false | Unlimited approval authority | true, false | NOT NULL |
| can_delegate | BOOLEAN | Yes | true | Can delegate authority | true, false | NOT NULL |
| can_delegate_partial | BOOLEAN | Yes | true | Can delegate with reduced limits | true, false | NOT NULL |
| requires_biometric_auth | BOOLEAN | Yes | false | Biometric auth required | true, false | NOT NULL |
| applies_to_departments | UUID[] | No | NULL | Department scope | {UUID1, UUID2} or NULL | Array of UUIDs |
| applies_to_locations | UUID[] | No | NULL | Location scope | {UUID1, UUID2} or NULL | Array of UUIDs |
| applies_to_categories | UUID[] | No | NULL | Category scope | {UUID1, UUID2} or NULL | Array of UUIDs |
| effective_start_date | DATE | Yes | TODAY | Effective start date | 2025-01-01 | NOT NULL |
| effective_end_date | DATE | No | NULL | Effective end date | 2025-12-31 or NULL | CHECK (> start) if not NULL |
| is_active | BOOLEAN | Yes | Computed | Currently active | true, false | NOT NULL |
| allows_policy_override | BOOLEAN | Yes | false | Can override policy | true, false | NOT NULL |
| requires_justification | BOOLEAN | Yes | false | Justification required | true, false | NOT NULL |
| requires_dual_approval | BOOLEAN | Yes | false | Two approvers needed | true, false | NOT NULL |
| metadata | JSONB | No | - | Flexible additional data | {"risk_level": "high"} | Valid JSON |
| created_date | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-01 00:00:00+00 | NOT NULL, Immutable |
| created_by | UUID | Yes | - | Creator user | Admin UUID | NOT NULL, FK users(id) |
| updated_date | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12 10:00:00+00 | NOT NULL, Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user | Admin UUID | NOT NULL, FK users(id) |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL | NULL for active |

#### Indexes

**Primary Index**:
- PRIMARY KEY (id)

**Foreign Key Indexes**:
- INDEX idx_authority_user (user_id, document_type, is_active) - Find user's authorities
- INDEX idx_authority_role (role_id, document_type, is_active) - Find role-based authorities

**Query Optimization Indexes**:
- INDEX idx_authority_lookup (document_type, approval_level, is_active) - Fast authority lookup
- INDEX idx_authority_amount (document_type, minimum_amount, maximum_amount) WHERE is_active = true - Find required approval level by amount

**Unique Constraints**:
- UNIQUE (user_id, document_type, approval_level, applies_to_departments, applies_to_locations, applies_to_categories) WHERE deleted_at IS NULL AND is_active = true AND user_id IS NOT NULL - One active user authority per scope
- UNIQUE (role_id, document_type, approval_level, applies_to_departments, applies_to_locations, applies_to_categories) WHERE deleted_at IS NULL AND is_active = true AND role_id IS NOT NULL - One active role authority per scope

#### Business Rules Enforced by Schema

1. **BR-AUTH-001**: Either user_id or role_id must be populated, but not both
   - Enforcement: CHECK constraint ((user_id IS NOT NULL AND role_id IS NULL) OR (user_id IS NULL AND role_id IS NOT NULL))

2. **BR-AUTH-002**: Maximum amount must be greater than minimum amount
   - Enforcement: CHECK constraint ((maximum_amount IS NULL) OR (maximum_amount > minimum_amount))

3. **BR-AUTH-003**: Amounts must be non-negative
   - Enforcement: CHECK constraint (minimum_amount >= 0 AND (maximum_amount IS NULL OR maximum_amount > 0))

4. **BR-AUTH-004**: Unlimited authority flag must match NULL maximum amount
   - Enforcement: CHECK constraint (unlimited_authority = (maximum_amount IS NULL))

5. **BR-AUTH-005**: Effective end date must be after effective start date
   - Enforcement: CHECK constraint ((effective_end_date IS NULL) OR (effective_end_date > effective_start_date))

6. **BR-AUTH-006**: Approval level must be within valid range
   - Enforcement: CHECK constraint (approval_level >= 1 AND approval_level <= 10)

7. **BR-AUTH-007**: Document type must be from allowed enumeration
   - Enforcement: CHECK constraint (document_type IN ('purchase_request', 'purchase_order', 'grn', 'credit_note', 'wastage', 'stock_requisition', 'inventory_adjustment', 'stock_transfer'))

8. **BR-AUTH-008**: Partial delegation requires delegation to be enabled
   - Enforcement: CHECK constraint (NOT can_delegate_partial OR can_delegate)

9. **BR-AUTH-009**: Is active must reflect effective date range
   - Enforcement: CHECK constraint (is_active = (effective_start_date <= CURRENT_DATE AND (effective_end_date IS NULL OR effective_end_date >= CURRENT_DATE)))

10. **BR-AUTH-010**: Currency code must be valid ISO 4217
    - Enforcement: CHECK constraint (LENGTH(currency_code) = 3 AND currency_code = UPPER(currency_code))

---

## Data Schema Summary

This data schema provides a comprehensive foundation for implementing the My Approvals module with the following key capabilities:

**Core Capabilities**:
1. **Unified Approval Queue**: approval_queue_items table supports polymorphic document references across all document types
2. **Complete Audit Trail**: approval_actions table with immutable append-only log and cryptographic hash chain
3. **Flexible Delegation**: approval_delegations table with scope-based temporary authority transfer
4. **Configurable SLAs**: approval_sla_configuration table with business hours calculation and automatic escalation
5. **Authority Matrix**: approval_authority_matrix table with amount-based approval routing and role-based limits

**Schema Design Patterns**:
- **Polymorphic Relationships**: document_id + document_type compound key for multi-document-type support
- **Soft Delete**: deleted_at timestamp on all entities preserves audit trail
- **Optimistic Locking**: doc_version field on queue items prevents concurrent approval conflicts
- **Denormalization**: requestor_name, document_reference_number copied for query performance
- **Audit Trail**: created_date, created_by, updated_date, updated_by on all entities
- **Flexible Extension**: metadata JSONB fields allow schema evolution without migrations
- **Composite Unique Constraints**: Prevent duplicate records with scope awareness
- **CHECK Constraints**: Enforce business rules at database level
- **Foreign Key Cascades**: ON DELETE RESTRICT (data preservation), ON DELETE CASCADE (cleanup), ON DELETE SET NULL (audit preservation)

**Performance Optimizations**:
- **Strategic Indexes**: Composite indexes for common query patterns (approver + status, document lookup, SLA monitoring)
- **Partial Indexes**: WHERE clauses on indexes reduce index size for inactive/deleted records
- **Array Fields**: document_types[], departments[], business_days[] for flexible scope without junction tables
- **JSONB Metadata**: Flexible extension without schema changes

**Integration Points**:
- **Users Table**: approver_user_id, requestor_user_id, delegator_user_id, delegate_user_id
- **Roles Table**: role_id in authority matrix for role-based limits
- **Departments Table**: requestor_department_id, applies_to_departments arrays
- **Locations Table**: requestor_location_id, applies_to_locations arrays
- **Document Tables**: Polymorphic reference via document_id + document_type

**Security & Compliance**:
- **Row-Level Security**: Schema supports RLS policies filtering by approver_user_id
- **Audit Trail**: Immutable approval_actions with cryptographic integrity
- **Soft Delete**: Preserves compliance records while logically removing data
- **Authority Validation**: Approval limits enforced at database and application levels

---

**Document Status**: Complete - All 5 entities documented
**Next Steps**: Create FD-my-approvals.md (Flow Diagrams) and VAL-my-approvals.md (Validation Rules)
**Next Review Date**: 2025-11-19
**Document Classification**: Internal Use Only
