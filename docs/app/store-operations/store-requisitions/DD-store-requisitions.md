# Data Definition: Store Requisitions

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Store Requisitions
- **Database**: PostgreSQL 14+
- **Schema Version**: 1.3.0
- **Last Updated**: 2025-12-10
- **Owner**: Store Operations Team
- **Status**: Active - Implementation Complete

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-12 | Documentation Team | Initial version from data-struc/schema.prisma |
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |
| 1.2.0 | 2025-12-05 | Documentation Team | Synced related documents with BR, added shared methods references |
| 1.3.0 | 2025-12-10 | Documentation Team | Synced with implemented source code - verified status enums and item approval statuses |


---

## Overview

This document defines the database schema for the Store Requisitions module, which manages internal material requests from hotel departments (Kitchen, Housekeeping, Maintenance) to central stores. The schema supports multi-level approval workflows, item-level approval tracking, partial issuance, and complete audit trails.

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**
- **DO NOT include SQL code** - describe database structures in text
- **DO NOT include CREATE TABLE statements** - describe table purposes and fields
- **DO NOT include mermaid ERD diagrams** - describe relationships in text
- **DO include**: Entity descriptions, field definitions, relationship explanations, business rules
- **Focus on**: WHAT data is stored, WHY it exists, HOW it relates - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-store-requisitions.md) - Business rules, requirements, and backend specifications
- [Technical Specification](./TS-store-requisitions.md) - System architecture and components
- [Use Cases](./UC-store-requisitions.md) - User workflows and scenarios
- [Flow Diagrams](./FD-store-requisitions.md) - Visual workflow diagrams
- [Validations](./VAL-store-requisitions.md) - Validation rules and Zod schemas
- [Backend Requirements](./BR-store-requisitions.md#10-backend-requirements) - API endpoints and database schema (Section 10 of BR)
- [Inventory Operations Shared Method](../../shared-methods/inventory-operations/SM-inventory-operations.md) - Inventory transaction patterns
- [Costing Methods Shared Method](../../shared-methods/inventory-valuation/SM-costing-methods.md) - FIFO/AVG costing integration

**Schema Source**: This schema is extracted from `/docs/app/data-struc/schema.prisma` lines 1688-1787 (authoritative source).

---

## Entity Relationship Overview

**Primary Entities**:
- **tb_store_requisition**: Header entity representing a complete store requisition document with workflow tracking
- **tb_store_requisition_detail**: Line item entity representing individual products requested in a requisition

**Key Relationships**:

1. **tb_store_requisition → tb_store_requisition_detail**: One-to-Many relationship
   - Business meaning: One requisition can request multiple products (line items)
   - Cardinality: One requisition has 1 to many line items (minimum 1 required)
   - Cascade behavior: Deleting requisition deletes all line items
   - Example: Requisition SR-2501-001 has 5 line items (cleaning supplies, kitchen utensils, etc.)

2. **tb_store_requisition → tb_location**: Many-to-One relationship
   - Business meaning: Requisition specifies which store/location to request materials from
   - Cardinality: Many requisitions can reference one location
   - Foreign key: `from_location_id` references `tb_location.id`
   - Example: Multiple requisitions request from "Main Store" location

3. **tb_store_requisition → tb_workflow**: Many-to-One relationship
   - Business meaning: Requisition follows a multi-stage approval workflow
   - Cardinality: Many requisitions can use the same workflow template
   - Foreign key: `workflow_id` references `tb_workflow.id`
   - Example: Kitchen requisitions use "Department Approval → Store Manager → Purchasing" workflow

4. **tb_store_requisition_detail → tb_product**: Many-to-One relationship
   - Business meaning: Each line item requests a specific product from the catalog
   - Cardinality: Many line items can reference the same product
   - Foreign key: `product_id` references `tb_product.id`
   - Example: Multiple requisitions request "Industrial Floor Cleaner 5L"

5. **tb_store_requisition_detail → tb_location**: Many-to-One relationship
   - Business meaning: Each line item can specify destination location (department's specific store)
   - Cardinality: Many line items can have the same destination location
   - Foreign key: `to_location_id` references `tb_location.id`
   - Example: Line items destined for "Kitchen Store", "Housekeeping Store", etc.

6. **tb_store_requisition_detail → tb_inventory_transaction**: One-to-One relationship
   - Business meaning: When items are issued, a corresponding inventory transaction is created
   - Cardinality: Each issued line item links to exactly one inventory transaction
   - Foreign key: `inventory_transaction_id` references `tb_inventory_transaction.id`
   - Example: Issuing 10 units of Product X creates inventory transaction record

**Relationship Notes**:
- All foreign keys use UUID data type for referential integrity
- Name fields (denormalized) stored alongside IDs for display purposes and historical accuracy
- Workflow integration allows flexible multi-stage approval processes
- Item-level tracking enables partial approvals and phased issuance
- Soft delete pattern preserves all historical data

---

## Data Entities

### Entity: tb_store_requisition (Header)

**Description**: Represents the header record of a store requisition document submitted by department staff (Chef, Housekeeper, Engineer) requesting materials from central stores. Contains document-level information, workflow tracking, and approval history.

**Business Purpose**:
- Track material requests from operational departments to stores
- Manage multi-level approval workflows (Department Manager → Storekeeper → Purchasing Manager)
- Maintain complete audit trail of requisition lifecycle
- Support emergency/rush requisition prioritization
- Enable departmental budget tracking and consumption analysis

**Data Ownership**: Requesting department owns the requisition, Store Operations manages fulfillment

**Access Pattern**:
- Primary access by requisition number (`sr_no`) for user lookups
- Filter by status (`doc_status`) for workflow dashboards
- Filter by department (`department_id`) for departmental views
- Filter by date range (`sr_date`, `expected_date`) for reporting
- Filter by workflow stage (`workflow_current_stage`) for approval queues

**Data Volume**:
- Estimated: ~100 requisitions/month for small hotel, ~500/month for large property
- Annual: ~1,200 to ~6,000 requisitions/year
- Growth: Steady based on operational activity

---

#### Fields Overview - tb_store_requisition

**Primary Identification**:
- **ID Field**: `id` - UUID, auto-generated unique identifier (gen_random_uuid())
- **Business Key**: `sr_no` - Human-readable requisition number (format: SR-YYMM-NNNN where YY is 2-digit year and MM is month)
- **Display Name**: Combination of `sr_no` and `description` used for display

**Core Business Fields**:

- **sr_no** - VARCHAR - Requisition number following format SR-YYMM-NNNN
  - Required: Yes
  - Unique: Yes (indexed for fast lookup)
  - Purpose: Human-readable business identifier for requisitions
  - Example values: "SR-2501-0001", "SR-2501-0125"
  - Generation: Auto-generated by system using year + sequential number

- **sr_date** - TIMESTAMPTZ - Date when requisition was created
  - Required: No (nullable)
  - Default: System defaults to current date on creation
  - Purpose: Official requisition date for record-keeping and reporting
  - Example values: "2025-01-15 10:30:00+00", "2025-02-20 14:45:00+00"
  - Timezone: Stored in UTC with timezone offset

- **expected_date** - TIMESTAMPTZ - Date when materials are needed
  - Required: No (nullable)
  - Purpose: Target delivery/availability date for requested materials
  - Example values: "2025-01-20 00:00:00+00", "2025-02-25 00:00:00+00"
  - Business rule: Should be >= sr_date (cannot expect delivery before request)

- **description** - VARCHAR - Brief description or purpose of requisition
  - Required: No (nullable)
  - Purpose: Explain why materials are needed (e.g., "Monthly kitchen supplies", "Emergency AC repair")
  - Example values: "Kitchen equipment for new menu launch", "Housekeeping supplies - March monthly stock"
  - Max length: Database VARCHAR without explicit limit

**Status and Workflow**:

- **doc_status** - enum_doc_status - Current document status in lifecycle
  - Required: Yes
  - Default: 'draft'
  - Allowed values: draft, in_progress, completed, cancelled, voided
  - Status transitions:
    - draft → in_progress (when submitted for approval)
    - in_progress → completed (when fully approved and issued)
    - in_progress → cancelled (when cancelled before completion)
    - any status → voided (when voided by admin)
  - Purpose: Track overall document lifecycle state

**Location Fields**:

- **from_location_id** - UUID - Reference to source store/location
  - Required: No (nullable)
  - Purpose: Identify which store the materials will be issued from
  - Foreign key: References `tb_location.id`
  - Example values: "550e8400-e29b-41d4-a716-446655440001" (Main Store UUID)

- **from_location_name** - VARCHAR - Name of source store (denormalized)
  - Required: No (nullable)
  - Purpose: Display location name without joining, preserve historical name
  - Example values: "Main Store", "Kitchen Store", "Central Warehouse"
  - Denormalization: Copied from tb_location for performance and history

**Workflow Fields**:

- **workflow_id** - UUID - Reference to workflow template being used
  - Required: No (nullable)
  - Purpose: Link to workflow configuration (stages, approvers)
  - Foreign key: References `tb_workflow.id`
  - Example: "550e8400-e29b-41d4-a716-446655440789" (Standard Dept Workflow UUID)

- **workflow_name** - VARCHAR - Name of workflow template (denormalized)
  - Required: No (nullable)
  - Purpose: Display workflow name, preserve historical workflow name
  - Example values: "Standard Department Workflow", "Emergency Requisition Workflow"

- **workflow_history** - JSONB - Complete history of workflow actions
  - Required: No (nullable)
  - Purpose: Maintain audit trail of all approvals, rejections, reviews
  - JSON structure: Array of workflow events with timestamps, actors, actions, comments
  - Example structure:
```json
[
  {
    "stage": "Department Manager Approval",
    "action": "approved",
    "actor_id": "user-uuid-123",
    "actor_name": "John Smith",
    "timestamp": "2025-01-15T14:30:00Z",
    "comments": "Approved for kitchen supplies"
  },
  {
    "stage": "Store Manager Review",
    "action": "approved",
    "actor_id": "user-uuid-456",
    "actor_name": "Jane Doe",
    "timestamp": "2025-01-16T09:15:00Z",
    "comments": "Items available in stock"
  }
]
```

- **workflow_current_stage** - VARCHAR - Current stage in workflow
  - Required: No (nullable)
  - Purpose: Track which approval stage requisition is currently at
  - Example values: "Department Manager Approval", "Store Manager Review", "Purchasing Manager Approval"

- **workflow_previous_stage** - VARCHAR - Previous stage in workflow
  - Required: No (nullable)
  - Purpose: Track workflow progression for audit and rollback
  - Example values: "Submitted", "Department Manager Approval"

- **workflow_next_stage** - VARCHAR - Next stage in workflow
  - Required: No (nullable)
  - Purpose: Display what stage comes next after current approval
  - Example values: "Store Manager Review", "Ready for Issuance"

**Action Tracking Fields**:

- **user_action** - JSONB - User permissions and allowed actions
  - Required: No (nullable)
  - Purpose: Define who can read or execute actions on this requisition
  - JSON structure: Object with read_only array and execute array containing user/group references
  - Example structure:
```json
{
  "read_only": ['@me', '@department'],
  "execute": [
    {'id': 'user-uuid-123'},
    {'id': 'user-uuid-456'}
  ]
}
```
  - Permission patterns:
    - "@me": Current user (creator) can read
    - "@department": All users in same department can read
    - execute array: Specific users who can approve/action

- **last_action** - enum_last_action - Most recent action taken on requisition
  - Required: No (nullable)
  - Default: 'submitted'
  - Allowed values: submitted, approved, reviewed, rejected
  - Purpose: Quick reference to last workflow action without parsing workflow_history
  - Example: "approved" means most recent action was an approval

- **last_action_at_date** - TIMESTAMPTZ - When last action occurred
  - Required: No (nullable)
  - Purpose: Timestamp of most recent workflow action
  - Example: "2025-01-16 09:15:00+00"
  - Used for: SLA tracking, aging reports

- **last_action_by_id** - UUID - User who performed last action
  - Required: No (nullable)
  - Purpose: Identify actor of most recent workflow action
  - Example: "user-uuid-456"

- **last_action_by_name** - VARCHAR - Name of user who performed last action
  - Required: No (nullable)
  - Purpose: Display actor name without joining
  - Example: "Jane Doe (Store Manager)"

**Requestor and Department Fields**:

- **requestor_id** - UUID - User who created requisition
  - Required: No (nullable)
  - Purpose: Identify the staff member who submitted the request
  - Example: "user-uuid-789" (Chef UUID)

- **requestor_name** - VARCHAR - Name of requestor (denormalized)
  - Required: No (nullable)
  - Purpose: Display requestor name without joining
  - Example: "Robert Chen (Head Chef)"

- **department_id** - UUID - Department that owns requisition
  - Required: No (nullable)
  - Purpose: Departmental ownership for access control and reporting
  - Example: "dept-uuid-101" (Kitchen Department UUID)

- **department_name** - VARCHAR - Name of department (denormalized)
  - Required: No (nullable)
  - Purpose: Display department name without joining
  - Example: "Kitchen - Main", "Housekeeping - Floor 2-5"

**Flexible Data Fields**:

- **info** - JSONB - Additional flexible information
  - Required: No (nullable)
  - Purpose: Store custom attributes, metadata, special instructions
  - Example structure:
```json
{
  "priority": "high",
  "urgency_reason": "Equipment breakdown",
  "special_instructions": "Deliver to loading dock",
  "contact_person": "Maria Garcia",
  "contact_phone": "+1-555-0123"
}
```

- **dimension** - JSONB - Dimensional analysis data
  - Required: No (nullable)
  - Purpose: Store cost center, project code, or other financial dimensions
  - Example structure:
```json
{
  "cost_center": "CC-KITCHEN-001",
  "project_code": "RENO-2025-Q1",
  "budget_line": "Operating Supplies",
  "gl_account": "5200-001"
}
```

- **doc_version** - DECIMAL - Document version for optimistic locking
  - Required: Yes
  - Default: 0
  - Purpose: Prevent concurrent edit conflicts (incremented on each update)
  - Example: 0 (new), 1 (first update), 2 (second update)
  - Concurrency: Client must send current version, server rejects if version mismatch

**Audit Fields** (Standard for all entities):

- **created_at** - TIMESTAMPTZ - When record was created
  - Required: No (nullable)
  - Default: NOW() - auto-set to current timestamp
  - Purpose: Track record creation time
  - Example: "2025-01-15 10:30:00+00"
  - Immutable: Never modified after creation

- **created_by_id** - UUID - User who created record
  - Required: No (nullable)
  - Purpose: Identify creator for accountability
  - Example: "user-uuid-789"
  - Immutable: Never modified after creation

- **updated_at** - TIMESTAMPTZ - When record was last modified
  - Required: No (nullable)
  - Default: NOW() - auto-set on create and update
  - Purpose: Track last modification time
  - Example: "2025-01-16 14:20:00+00"
  - Auto-updated: Automatically set by database trigger

- **updated_by_id** - UUID - User who last modified record
  - Required: No (nullable)
  - Purpose: Identify last modifier for accountability
  - Example: "user-uuid-456"

- **deleted_at** - TIMESTAMPTZ - Soft delete timestamp
  - Required: No (nullable)
  - Default: NULL (active record)
  - Purpose: Mark record as deleted without physical removal
  - Example: NULL (active), "2025-02-01 08:00:00+00" (deleted)
  - Soft delete: Allows data recovery and preserves audit trail

- **deleted_by_id** - UUID - User who soft-deleted record
  - Required: No (nullable)
  - Purpose: Identify who performed deletion
  - Example: "user-uuid-admin"

---

#### Field Definitions Table - tb_store_requisition

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key, unique identifier | 550e8400-e29b-... | Unique, Non-null, PK |
| sr_no | VARCHAR | Yes | - | Requisition number SR-YYMM-NNNN | SR-2501-0001 | Unique (indexed) |
| sr_date | TIMESTAMPTZ | No | NULL | Requisition date | 2025-01-15 10:30+00 | - |
| expected_date | TIMESTAMPTZ | No | NULL | Expected delivery date | 2025-01-20 00:00+00 | - |
| description | VARCHAR | No | NULL | Purpose/description | Monthly kitchen supplies | - |
| doc_status | enum_doc_status | Yes | draft | Document lifecycle status | draft, in_progress | Must be from enum |
| from_location_id | UUID | No | NULL | Source store location | 550e8400-... | FK to tb_location |
| from_location_name | VARCHAR | No | NULL | Source store name | Main Store | Denormalized |
| workflow_id | UUID | No | NULL | Workflow template | 550e8400-... | FK to tb_workflow |
| workflow_name | VARCHAR | No | NULL | Workflow name | Standard Workflow | Denormalized |
| workflow_history | JSONB | No | NULL | Approval history JSON | [{stage:..., action:...}] | Valid JSON |
| workflow_current_stage | VARCHAR | No | NULL | Current workflow stage | Dept Manager Approval | - |
| workflow_previous_stage | VARCHAR | No | NULL | Previous workflow stage | Submitted | - |
| workflow_next_stage | VARCHAR | No | NULL | Next workflow stage | Store Manager Review | - |
| user_action | JSONB | No | NULL | User permission JSON | {read_only:[...], execute:[...]} | Valid JSON |
| last_action | enum_last_action | No | submitted | Last workflow action | approved, rejected | Must be from enum |
| last_action_at_date | TIMESTAMPTZ | No | NULL | Last action timestamp | 2025-01-16 09:15+00 | - |
| last_action_by_id | UUID | No | NULL | Last action user | 550e8400-... | - |
| last_action_by_name | VARCHAR | No | NULL | Last action user name | Jane Doe | Denormalized |
| requestor_id | UUID | No | NULL | Requisition creator | 550e8400-... | - |
| requestor_name | VARCHAR | No | NULL | Creator name | Robert Chen | Denormalized |
| department_id | UUID | No | NULL | Owning department | 550e8400-... | - |
| department_name | VARCHAR | No | NULL | Department name | Kitchen - Main | Denormalized |
| info | JSONB | No | NULL | Flexible metadata | {priority: high, ...} | Valid JSON |
| dimension | JSONB | No | NULL | Financial dimensions | {cost_center: CC-001} | Valid JSON |
| doc_version | DECIMAL | Yes | 0 | Optimistic locking version | 0, 1, 2 | ≥ 0 |
| created_at | TIMESTAMPTZ | No | NOW() | Creation timestamp | 2025-01-15 10:30+00 | Immutable |
| created_by_id | UUID | No | NULL | Creator user | 550e8400-... | Immutable |
| updated_at | TIMESTAMPTZ | No | NOW() | Last update timestamp | 2025-01-16 14:20+00 | Auto-updated |
| updated_by_id | UUID | No | NULL | Last modifier user | 550e8400-... | - |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL or timestamp | NULL = active |
| deleted_by_id | UUID | No | NULL | Deletion user | 550e8400-... | - |

---

#### Data Constraints and Rules - tb_store_requisition

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated using `gen_random_uuid()`
- Purpose: Uniquely identifies each requisition across the system
- Immutable: Never changes after record creation

**Unique Constraints**:
- `sr_no`: Must be unique among all requisitions (including deleted)
  - Format: SR-YYMM-NNNN where YY is 2-digit year and MM is month (e.g., SR-2501-0001)
  - Generation: Auto-generated by application using year + auto-incrementing sequence
  - Index: B-tree index named "sr_no_u" for fast lookup

**Foreign Key Relationships**:

1. **Location** (`from_location_id` → `tb_location.id`)
   - On Delete: NO ACTION (prevent deletion of location with active requisitions)
   - On Update: NO ACTION
   - Business rule: Source location must exist and be active
   - Nullable: Yes (can be set later before submission)

2. **Workflow** (`workflow_id` → `tb_workflow.id`)
   - On Delete: NO ACTION (preserve workflow reference)
   - On Update: NO ACTION
   - Business rule: Workflow template must exist and be active
   - Nullable: Yes (set when workflow is initiated)

3. **Line Items** (tb_store_requisition_detail → this table)
   - Relationship: One-to-Many (parent side)
   - Cascade: Deleting requisition cascades to delete all line items
   - Business rule: Requisition must have at least 1 line item to be valid

**Check Constraints**:
- **doc_status values**: Must be one of: draft, in_progress, completed, cancelled, voided
  - Enforced by enum_doc_status enum type
  - Status transition rules enforced by application logic

- **last_action values**: Must be one of: submitted, approved, reviewed, rejected
  - Enforced by enum_last_action enum type

- **Expected date validation**: expected_date should be >= sr_date (if both provided)
  - Business rule: Cannot expect delivery before requisition date
  - Enforced by application logic (not database constraint)

- **Document version**: doc_version must be >= 0
  - Increments on each update for optimistic locking
  - Client must provide current version number on update

**Not Null Constraints**:
- Required fields: `id`, `sr_no`, `doc_status`, `doc_version`
- All other fields nullable to support gradual data entry
- Submission validation requires: sr_date, from_location_id, department_id, requestor_id

**Default Values**:
- `doc_status`: 'draft' - New requisitions start in draft status
- `last_action`: 'submitted' - Default last action when created
- `doc_version`: 0 - New records start at version 0
- `created_at`: NOW() - Automatic timestamp capture
- `updated_at`: NOW() - Automatic timestamp capture
- `deleted_at`: NULL - Records are active by default

---

#### Sample Data Examples - tb_store_requisition

**Example 1: Standard Kitchen Requisition (Draft)**
```
ID: 550e8400-e29b-41d4-a716-446655440001
SR Number: SR-2501-0001
SR Date: 2025-01-15 10:30:00+00
Expected Date: 2025-01-20 00:00:00+00
Description: Monthly kitchen supplies for Chinese New Year menu
Doc Status: draft
From Location: Main Store (UUID: 550e8400-e29b-41d4-a716-446655440100)
Requestor: Robert Chen (Head Chef) (UUID: 550e8400-e29b-41d4-a716-446655440200)
Department: Kitchen - Main (UUID: 550e8400-e29b-41d4-a716-446655440300)
Doc Version: 0
Created At: 2025-01-15 10:30:00+00
Created By: Robert Chen (UUID: 550e8400-e29b-41d4-a716-446655440200)
```

**Example 2: Housekeeping Requisition (In Progress)**
```
ID: 550e8400-e29b-41d4-a716-446655440002
SR Number: SR-2501-0015
SR Date: 2025-01-18 09:15:00+00
Expected Date: 2025-01-22 00:00:00+00
Description: Weekly housekeeping supplies - Floors 2-5
Doc Status: in_progress
From Location: Main Store
Workflow: Standard Department Workflow (UUID: 550e8400-e29b-41d4-a716-446655440400)
Workflow Current Stage: Department Manager Approval
Workflow History: [
  {
    "stage": "Submitted",
    "action": "submitted",
    "actor_id": "550e8400-e29b-41d4-a716-446655440201",
    "actor_name": "Maria Garcia",
    "timestamp": "2025-01-18T09:15:00Z",
    "comments": "Weekly supplies for housekeeping"
  }
]
Last Action: submitted
Last Action At: 2025-01-18 09:15:00+00
Last Action By: Maria Garcia (UUID: 550e8400-e29b-41d4-a716-446655440201)
Requestor: Maria Garcia (Housekeeping Supervisor)
Department: Housekeeping - Floors 2-5
Info: {
  "priority": "normal",
  "contact_person": "Maria Garcia",
  "contact_extension": "ext. 205"
}
Doc Version: 1
Created At: 2025-01-18 09:15:00+00
Updated At: 2025-01-18 09:15:00+00
```

**Example 3: Emergency Maintenance Requisition (Completed)**
```
ID: 550e8400-e29b-41d4-a716-446655440003
SR Number: SR-2501-0008
SR Date: 2025-01-16 14:30:00+00
Expected Date: 2025-01-17 00:00:00+00
Description: Emergency HVAC repair parts - Presidential Suite AC breakdown
Doc Status: completed
From Location: Main Store
Workflow: Emergency Requisition Workflow
Workflow Current Stage: Completed
Workflow History: [
  {
    "stage": "Submitted",
    "action": "submitted",
    "actor_id": "550e8400-e29b-41d4-a716-446655440202",
    "actor_name": "James Wong",
    "timestamp": "2025-01-16T14:30:00Z",
    "comments": "Urgent - Presidential suite guest complaint"
  },
  {
    "stage": "Department Manager Approval",
    "action": "approved",
    "actor_id": "550e8400-e29b-41d4-a716-446655440203",
    "actor_name": "Sarah Lee (Chief Engineer)",
    "timestamp": "2025-01-16T14:45:00Z",
    "comments": "Emergency approved - high priority guest"
  },
  {
    "stage": "Store Manager Review",
    "action": "approved",
    "actor_id": "550e8400-e29b-41d4-a716-446655440204",
    "actor_name": "David Kim (Store Manager)",
    "timestamp": "2025-01-16T15:00:00Z",
    "comments": "Parts available - issuing immediately"
  }
]
Last Action: approved
Last Action At: 2025-01-16 15:00:00+00
Last Action By: David Kim (Store Manager)
Requestor: James Wong (Engineering Technician)
Department: Engineering - Maintenance
Info: {
  "priority": "high",
  "urgency_reason": "VIP guest complaint - AC not cooling",
  "location": "Presidential Suite 1201",
  "required_by": "2025-01-17T08:00:00Z"
}
Dimension: {
  "cost_center": "CC-ENG-001",
  "project_code": "MAINT-URGENT",
  "gl_account": "5300-002"
}
Doc Version: 3
Created At: 2025-01-16 14:30:00+00
Updated At: 2025-01-16 15:00:00+00
```

---

### Entity: tb_store_requisition_detail (Line Item)

**Description**: Represents individual product line items within a store requisition. Each line item specifies a product, requested quantity, approval status, and issuance tracking. Supports item-level approval (can approve/reject individual items) and partial issuance (items can be issued in multiple batches).

**Business Purpose**:
- Track individual products requested in each requisition
- Enable item-level approval workflow (approve/reject/review each item independently)
- Track quantity progression: requested → approved → issued
- Link to inventory transactions when items are issued
- Maintain complete audit trail at line item level
- Support partial issuance scenarios (issue 50 now, 50 later)

**Data Ownership**: Parent requisition owns line items, Store Operations manages item issuance

**Access Pattern**:
- Primary access via parent requisition (`store_requisition_id`)
- Access by product for stock availability checks (`product_id`)
- Filter by approval status (`last_action`) for approval queues
- Access by inventory transaction for reconciliation (`inventory_transaction_id`)

**Data Volume**:
- Average: 5-10 line items per requisition
- Monthly: 500-5,000 line items (based on 100-500 requisitions)
- Annual: 6,000-60,000 line items

---

#### Fields Overview - tb_store_requisition_detail

**Primary Identification**:
- **ID Field**: `id` - UUID, auto-generated unique identifier
- **Parent Reference**: `store_requisition_id` - Links to parent requisition
- **Business Key**: Combination of parent SR number + sequence_no
- **Display Name**: `product_name` with quantity and unit

**Core Business Fields**:

- **id** - UUID - Primary key, unique identifier
  - Required: Yes
  - Default: gen_random_uuid()
  - Purpose: Uniquely identify each line item

- **store_requisition_id** - UUID - Parent requisition reference
  - Required: Yes
  - Purpose: Link line item to parent requisition header
  - Foreign key: References `tb_store_requisition.id`
  - Cascade: Deleting parent deletes this line item

- **sequence_no** - INTEGER - Line item sequence number
  - Required: No (nullable)
  - Default: 1
  - Purpose: Display order within requisition (1, 2, 3...)
  - Example: 1 (first item), 2 (second item)

- **description** - VARCHAR - Additional item description or notes
  - Required: No (nullable)
  - Purpose: Supplementary details about requested product
  - Example: "Extra-strength formula preferred", "Blue color only"

**Location Fields**:

- **to_location_id** - UUID - Destination location for this item
  - Required: No (nullable)
  - Purpose: Specify where this item should be delivered (may differ per item)
  - Foreign key: References `tb_location.id`
  - Example: "Kitchen Store", "Housekeeping Floor 3 Store"
  - Flexibility: Different items can go to different locations

- **to_location_name** - VARCHAR - Destination location name (denormalized)
  - Required: No (nullable)
  - Purpose: Display destination without joining
  - Example: "Kitchen Store", "Housekeeping Store - Floor 3"

**Product Fields**:

- **product_id** - UUID - Product being requested
  - Required: Yes
  - Purpose: Link to product catalog entry
  - Foreign key: References `tb_product.id`
  - Example: Product UUID for "Industrial Floor Cleaner 5L"

- **product_name** - VARCHAR - Product name (denormalized)
  - Required: No (nullable)
  - Purpose: Display product name without joining
  - Example: "Industrial Floor Cleaner 5L"
  - Historical accuracy: Preserves product name at time of request

- **product_local_name** - VARCHAR - Localized product name
  - Required: No (nullable)
  - Purpose: Product name in local language
  - Example: "工业地板清洁剂5升" (Chinese), "ผลิตภัณฑ์ทำความสะอาดพื้น 5 ลิตร" (Thai)

**Quantity Fields**:

- **requested_qty** - DECIMAL(20, 5) - Quantity requested by user
  - Required: No (nullable)
  - Precision: 20 digits total, 5 decimal places
  - Purpose: Original requested quantity from requester
  - Example: 10.00000 (10 units), 2.50000 (2.5 liters)
  - Fractional: Supports fractional quantities for measured products

- **approved_qty** - DECIMAL(20, 5) - Quantity approved by approver
  - Required: No (nullable)
  - Purpose: Approved quantity (may be less than requested)
  - Example: 8.00000 (approved 8 out of 10 requested)
  - Business rule: approved_qty ≤ requested_qty

- **issued_qty** - DECIMAL(20, 5) - Quantity actually issued to department
  - Required: No (nullable)
  - Purpose: Track how much has been issued (supports partial issuance)
  - Example: 5.00000 (issued 5 of 8 approved, 3 pending)
  - Business rule: issued_qty ≤ approved_qty
  - Partial issuance: Can be issued in multiple batches

**Item Workflow Fields**:

- **history** - JSONB - Item-level action history
  - Required: No (nullable)
  - Purpose: Track all actions on this specific line item
  - Example structure:
```json
[
  {
    "action": "requested",
    "qty": 10,
    "timestamp": "2025-01-15T10:30:00Z",
    "by": "Robert Chen"
  },
  {
    "action": "approved",
    "qty": 8,
    "timestamp": "2025-01-16T09:15:00Z",
    "by": "Jane Doe",
    "comments": "Partial approval due to stock availability"
  },
  {
    "action": "issued",
    "qty": 5,
    "timestamp": "2025-01-17T14:00:00Z",
    "by": "Store Clerk"
  }
]
```

- **last_action** - enum_last_action - Most recent action on this item
  - Required: No (nullable)
  - Default: submitted
  - Allowed values: submitted, approved, reviewed, rejected
  - Purpose: Quick status reference for this item
  - Example: "approved" (item has been approved)

**Approval Fields**:

- **approved_message** - VARCHAR - Approver's comment on approval
  - Required: No (nullable)
  - Purpose: Explain approval decision or quantity adjustment
  - Example: "Approved 8 instead of 10 due to stock availability"

- **approved_by_id** - UUID - User who approved this item
  - Required: No (nullable)
  - Purpose: Track item-level approver
  - Example: Approver user UUID

- **approved_by_name** - VARCHAR - Approver name (denormalized)
  - Required: No (nullable)
  - Purpose: Display approver name
  - Example: "Jane Doe (Store Manager)"

- **approved_date_at** - TIMESTAMPTZ - When item was approved
  - Required: No (nullable)
  - Purpose: Track approval timestamp
  - Example: "2025-01-16 09:15:00+00"

**Review Fields**:

- **review_message** - VARCHAR - Reviewer's comment requesting clarification
  - Required: No (nullable)
  - Purpose: Explain why item needs review/clarification
  - Example: "Please confirm brand preference for this item"

- **review_by_id** - UUID - User who requested review
  - Required: No (nullable)
  - Purpose: Track who requested review
  - Example: Reviewer user UUID

- **review_by_name** - VARCHAR - Reviewer name (denormalized)
  - Required: No (nullable)
  - Purpose: Display reviewer name
  - Example: "David Kim (Purchasing Manager)"

- **review_date_at** - TIMESTAMPTZ - When review was requested
  - Required: No (nullable)
  - Purpose: Track review request timestamp
  - Example: "2025-01-16 10:30:00+00"

**Rejection Fields**:

- **reject_message** - VARCHAR - Rejector's comment on rejection
  - Required: No (nullable)
  - Purpose: Explain why item was rejected
  - Example: "Product discontinued - please select alternative"

- **reject_by_id** - UUID - User who rejected this item
  - Required: No (nullable)
  - Purpose: Track item-level rejector
  - Example: Rejector user UUID

- **reject_by_name** - VARCHAR - Rejector name (denormalized)
  - Required: No (nullable)
  - Purpose: Display rejector name
  - Example: "Sarah Lee (Chief Engineer)"

- **reject_date_at** - TIMESTAMPTZ - When item was rejected
  - Required: No (nullable)
  - Purpose: Track rejection timestamp
  - Example: "2025-01-16 11:00:00+00"

**Integration Fields**:

- **inventory_transaction_id** - UUID - Link to inventory transaction
  - Required: No (nullable)
  - Purpose: Reference inventory transaction created when item was issued
  - Foreign key: References `tb_inventory_transaction.id`
  - Example: Inventory transaction UUID
  - Business rule: Set when items are issued, links to stock movement

**Flexible Data Fields**:

- **info** - JSONB - Additional flexible information
  - Required: No (nullable)
  - Purpose: Store item-specific metadata
  - Example: {"brand_preference": "Vendor A", "packaging": "5L bottle"}

- **dimension** - JSONB - Dimensional analysis data for this item
  - Required: No (nullable)
  - Purpose: Item-level cost center or project allocation
  - Example: {"cost_center": "CC-KITCHEN-001", "project": "RENO-2025"}

- **doc_version** - DECIMAL - Document version for optimistic locking
  - Required: Yes
  - Default: 0
  - Purpose: Prevent concurrent edit conflicts on this line item
  - Example: 0 (new), 1 (first update)

**Audit Fields** (Standard for all entities):

- **created_at** - TIMESTAMPTZ - When line item was created
- **created_by_id** - UUID - User who created line item
- **updated_at** - TIMESTAMPTZ - When line item was last modified
- **updated_by_id** - UUID - User who last modified line item
- **deleted_at** - TIMESTAMPTZ - Soft delete timestamp (NULL = active)
- **deleted_by_id** - UUID - User who soft-deleted line item

---

#### Field Definitions Table - tb_store_requisition_detail

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key | 550e8400-... | Unique, Non-null, PK |
| inventory_transaction_id | UUID | No | NULL | Inventory transaction link | 550e8400-... | FK to tb_inventory_transaction |
| store_requisition_id | UUID | Yes | - | Parent requisition | 550e8400-... | FK to tb_store_requisition |
| sequence_no | INTEGER | No | 1 | Line item number | 1, 2, 3 | ≥ 1 |
| description | VARCHAR | No | NULL | Item notes | Blue color only | - |
| to_location_id | UUID | No | NULL | Destination location | 550e8400-... | FK to tb_location |
| to_location_name | VARCHAR | No | NULL | Destination name | Kitchen Store | Denormalized |
| product_id | UUID | Yes | - | Product reference | 550e8400-... | FK to tb_product |
| product_name | VARCHAR | No | NULL | Product name | Floor Cleaner 5L | Denormalized |
| product_local_name | VARCHAR | No | NULL | Local product name | 工业地板清洁剂 | Denormalized |
| requested_qty | DECIMAL(20,5) | No | NULL | Requested quantity | 10.00000 | ≥ 0 |
| approved_qty | DECIMAL(20,5) | No | NULL | Approved quantity | 8.00000 | ≤ requested_qty |
| issued_qty | DECIMAL(20,5) | No | NULL | Issued quantity | 5.00000 | ≤ approved_qty |
| history | JSONB | No | NULL | Item action history | [{action:..., qty:...}] | Valid JSON |
| last_action | enum_last_action | No | submitted | Last item action | approved, rejected | Must be from enum |
| approved_message | VARCHAR | No | NULL | Approval comment | Partial approval | - |
| approved_by_id | UUID | No | NULL | Approver user | 550e8400-... | - |
| approved_by_name | VARCHAR | No | NULL | Approver name | Jane Doe | Denormalized |
| approved_date_at | TIMESTAMPTZ | No | NULL | Approval timestamp | 2025-01-16 09:15+00 | - |
| review_message | VARCHAR | No | NULL | Review comment | Confirm brand | - |
| review_by_id | UUID | No | NULL | Reviewer user | 550e8400-... | - |
| review_by_name | VARCHAR | No | NULL | Reviewer name | David Kim | Denormalized |
| review_date_at | TIMESTAMPTZ | No | NULL | Review timestamp | 2025-01-16 10:30+00 | - |
| reject_message | VARCHAR | No | NULL | Rejection comment | Product discontinued | - |
| reject_by_id | UUID | No | NULL | Rejector user | 550e8400-... | - |
| reject_by_name | VARCHAR | No | NULL | Rejector name | Sarah Lee | Denormalized |
| reject_date_at | TIMESTAMPTZ | No | NULL | Rejection timestamp | 2025-01-16 11:00+00 | - |
| info | JSONB | No | NULL | Flexible metadata | {brand_preference:...} | Valid JSON |
| dimension | JSONB | No | NULL | Financial dimensions | {cost_center:...} | Valid JSON |
| doc_version | DECIMAL | Yes | 0 | Optimistic locking version | 0, 1 | ≥ 0 |
| created_at | TIMESTAMPTZ | No | NOW() | Creation timestamp | 2025-01-15 10:30+00 | Immutable |
| created_by_id | UUID | No | NULL | Creator user | 550e8400-... | Immutable |
| updated_at | TIMESTAMPTZ | No | NOW() | Last update timestamp | 2025-01-16 14:20+00 | Auto-updated |
| updated_by_id | UUID | No | NULL | Last modifier user | 550e8400-... | - |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL or timestamp | NULL = active |
| deleted_by_id | UUID | No | NULL | Deletion user | 550e8400-... | - |

---

#### Data Constraints and Rules - tb_store_requisition_detail

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated using `gen_random_uuid()`
- Purpose: Uniquely identifies each line item

**Foreign Key Relationships**:

1. **Parent Requisition** (`store_requisition_id` → `tb_store_requisition.id`)
   - On Delete: CASCADE implied (deleting parent deletes all children)
   - On Update: NO ACTION
   - Business rule: Line item must belong to valid requisition
   - Required: Yes

2. **Product** (`product_id` → `tb_product.id`)
   - On Delete: NO ACTION (preserve line item even if product deleted)
   - On Update: NO ACTION
   - Business rule: Product must exist in catalog
   - Required: Yes

3. **Destination Location** (`to_location_id` → `tb_location.id`)
   - On Delete: NO ACTION
   - On Update: NO ACTION
   - Business rule: Destination location must exist
   - Required: No (nullable)

4. **Inventory Transaction** (`inventory_transaction_id` → `tb_inventory_transaction.id`)
   - On Delete: NO ACTION (preserve link even if transaction voided)
   - On Update: NO ACTION
   - Business rule: Set when items are issued
   - Required: No (only populated after issuance)

**Business Rule Constraints** (enforced by application):
- **Quantity validation**: 0 ≤ approved_qty ≤ requested_qty
- **Issuance validation**: 0 ≤ issued_qty ≤ approved_qty
- **Approval requirement**: Cannot issue items without approval (approved_qty must be set)
- **Product existence**: Product must be active in catalog to request

**Check Constraints**:
- **last_action values**: Must be one of: submitted, approved, reviewed, rejected
  - Enforced by enum_last_action enum type

- **Quantity non-negative**: All quantity fields must be ≥ 0 if set
  - Business rule: Negative quantities not allowed

**Not Null Constraints**:
- Required fields: `id`, `store_requisition_id`, `product_id`, `doc_version`
- Quantities can be NULL until set
- Audit fields (created_at, updated_at) auto-set to NOW()

**Default Values**:
- `sequence_no`: 1 - Default line number
- `last_action`: submitted - Default item status
- `doc_version`: 0 - New items start at version 0
- `created_at`: NOW() - Automatic timestamp
- `updated_at`: NOW() - Automatic timestamp
- `deleted_at`: NULL - Active by default

---

#### Sample Data Examples - tb_store_requisition_detail

**Example 1: Approved Line Item (Full Quantity)**
```
ID: 550e8400-e29b-41d4-a716-446655441001
Store Requisition ID: 550e8400-e29b-41d4-a716-446655440001 (SR-2501-0001)
Sequence No: 1
Product: Industrial Floor Cleaner 5L (UUID: 550e8400-e29b-41d4-a716-446655442001)
Product Name: Industrial Floor Cleaner 5L
To Location: Housekeeping Store - Floor 3
Requested Qty: 10.00000
Approved Qty: 10.00000
Issued Qty: NULL (not yet issued)
Last Action: approved
Approved Message: "Approved in full - sufficient stock"
Approved By: Jane Doe (Store Manager)
Approved Date: 2025-01-16 09:15:00+00
History: [
  {'action': 'requested', 'qty': 10, 'timestamp': '2025-01-15T10:30:00Z'},
  {'action': 'approved', 'qty': 10, 'timestamp': '2025-01-16T09:15:00Z', 'by': 'Jane Doe'}
]
Created At: 2025-01-15 10:30:00+00
```

**Example 2: Partially Approved Line Item**
```
ID: 550e8400-e29b-41d4-a716-446655441002
Store Requisition ID: 550e8400-e29b-41d4-a716-446655440001
Sequence No: 2
Product: Kitchen Paper Towels (Case of 12)
Requested Qty: 20.00000
Approved Qty: 15.00000
Issued Qty: NULL
Last Action: approved
Approved Message: "Partial approval - 15 cases available now, backorder 5 cases"
Approved By: Jane Doe (Store Manager)
Approved Date: 2025-01-16 09:20:00+00
History: [
  {'action': 'requested', 'qty': 20, 'timestamp': '2025-01-15T10:35:00Z'},
  {'action': 'approved', 'qty': 15, 'timestamp': '2025-01-16T09:20:00Z',
   "by": "Jane Doe", "comments": "Partial - stock availability"}
]
```

**Example 3: Partially Issued Line Item**
```
ID: 550e8400-e29b-41d4-a716-446655441003
Store Requisition ID: 550e8400-e29b-41d4-a716-446655440003 (Emergency HVAC)
Sequence No: 1
Product: HVAC Filter 24x24x2 (UUID: 550e8400-e29b-41d4-a716-446655442050)
Product Name: HVAC Filter 24x24x2
To Location: Engineering Store
Requested Qty: 6.00000
Approved Qty: 6.00000
Issued Qty: 4.00000 (partial issuance)
Inventory Transaction ID: 550e8400-e29b-41d4-a716-446655443001
Last Action: approved
Approved Message: "Emergency approved - issue immediately"
Approved By: Sarah Lee (Chief Engineer)
Approved Date: 2025-01-16 14:45:00+00
History: [
  {'action': 'requested', 'qty': 6, 'timestamp': '2025-01-16T14:30:00Z'},
  {'action': 'approved', 'qty': 6, 'timestamp': '2025-01-16T14:45:00Z'},
  {'action': 'issued', 'qty': 4, 'timestamp': '2025-01-16T15:00:00Z',
   "comments": "Issued 4 available, backorder 2"}
]
Info: {
  "urgency": "high",
  "notes": "2 units backordered - arriving tomorrow"
}
```

**Example 4: Rejected Line Item**
```
ID: 550e8400-e29b-41d4-a716-446655441004
Store Requisition ID: 550e8400-e29b-41d4-a716-446655440002
Sequence No: 3
Product: Luxury Soap Bars (Box of 100)
Requested Qty: 10.00000
Approved Qty: NULL
Issued Qty: NULL
Last Action: rejected
Reject Message: "Product discontinued by vendor - please select alternative brand"
Reject By: David Kim (Purchasing Manager)
Reject Date: 2025-01-18 11:30:00+00
History: [
  {'action': 'requested', 'qty': 10, 'timestamp': '2025-01-18T09:15:00Z'},
  {'action': 'rejected', 'timestamp': '2025-01-18T11:30:00Z',
   "by": "David Kim", "reason": "Product discontinued"}
]
```

**Example 5: Review Requested Line Item**
```
ID: 550e8400-e29b-41d4-a716-446655441005
Store Requisition ID: 550e8400-e29b-41d4-a716-446655440002
Sequence No: 5
Product: Multi-Surface Disinfectant Spray (Case)
Requested Qty: 8.00000
Approved Qty: NULL (pending review)
Issued Qty: NULL
Last Action: reviewed
Review Message: "Please confirm if concentrated formula or ready-to-use preferred"
Review By: Jane Doe (Store Manager)
Review Date: 2025-01-18 10:00:00+00
History: [
  {'action': 'requested', 'qty': 8, 'timestamp': '2025-01-18T09:15:00Z'},
  {'action': 'review_requested', 'timestamp': '2025-01-18T10:00:00Z',
   "by": "Jane Doe", "question": "Formula preference?"}
]
```

---

## Relationships

### One-to-Many Relationships

#### tb_store_requisition → tb_store_requisition_detail

**Relationship Type**: One requisition has many line items

**Foreign Key**: `tb_store_requisition_detail.store_requisition_id` references `tb_store_requisition.id`

**Cardinality**:
- One parent requisition can have: 1 to many line items (minimum 1 required for valid requisition)
- Each line item must have: exactly 1 parent requisition

**Cascade Behavior**:
- **On Delete**: CASCADE - Deleting parent requisition automatically deletes all line items
  - Rationale: Line items have no meaning without parent requisition
  - Ensures: No orphaned line items remain in database

- **On Update**: NO ACTION - UUID primary keys rarely updated
  - Behavior: Parent ID changes would propagate (theoretical, not in practice)

**Business Rule**:
- Requisition must have at least 1 line item to be submitted for approval
- Line items can be added/removed while requisition is in draft status
- Once submitted, items can be approved/rejected but not deleted

**Example Scenario**:
```
Parent Requisition: SR-2501-0001 (Kitchen Monthly Supplies)
Child Line Items:
  1. Industrial Floor Cleaner 5L (Qty: 10)
  2. Kitchen Paper Towels (Qty: 20)
  3. Multi-Surface Disinfectant (Qty: 8)
  4. Stainless Steel Cleaner (Qty: 5)
  5. Glass Cleaner Spray (Qty: 12)

If SR-2501-0001 is deleted:
  - All 5 line items automatically deleted (CASCADE)
  - Prevents orphaned line items
  - Maintains data integrity
```

**Common Query Patterns**:
- Get requisition with all line items: `SELECT * FROM tb_store_requisition_detail WHERE store_requisition_id = ?`
- Count items per requisition: `SELECT store_requisition_id, COUNT(*) FROM tb_store_requisition_detail GROUP BY store_requisition_id`
- Get requisitions with no items (invalid state): `SELECT sr.* FROM tb_store_requisition sr LEFT JOIN tb_store_requisition_detail srd ON sr.id = srd.store_requisition_id WHERE srd.id IS NULL`

---

#### tb_store_requisition → tb_location (from_location)

**Relationship Type**: Many requisitions reference one source location

**Foreign Key**: `tb_store_requisition.from_location_id` references `tb_location.id`

**Cardinality**:
- One location can be referenced by: 0 to many requisitions
- Each requisition references: 0 or 1 location (nullable, set before submission)

**Cascade Behavior**:
- **On Delete**: NO ACTION - Prevents deletion of location with active requisitions
- **On Update**: NO ACTION

**Business Rule**:
- Location must be a store/warehouse type (not office or guest room)
- Location must be active and have inventory management enabled
- Denormalized location name preserves historical accuracy

**Example Scenario**:
```
Location: Main Store (ID: loc-001)
Referenced by Requisitions:
  - SR-2501-0001 (Kitchen)
  - SR-2501-0005 (Housekeeping)
  - SR-2501-0012 (Engineering)
  ... (hundreds of requisitions)

Cannot delete "Main Store" location while active requisitions exist (NO ACTION constraint).
```

---

#### tb_store_requisition_detail → tb_location (to_location)

**Relationship Type**: Many line items reference one destination location

**Foreign Key**: `tb_store_requisition_detail.to_location_id` references `tb_location.id`

**Cardinality**:
- One location can be referenced by: 0 to many line items
- Each line item references: 0 or 1 destination location (nullable)

**Business Rule**:
- Destination can differ per line item within same requisition
- Allows flexible delivery to multiple department sub-stores
- If not specified, defaults to parent requisition's requestor department location

---

#### tb_store_requisition → tb_workflow

**Relationship Type**: Many requisitions use one workflow template

**Foreign Key**: `tb_store_requisition.workflow_id` references `tb_workflow.id`

**Cardinality**:
- One workflow can be used by: 0 to many requisitions
- Each requisition references: 0 or 1 workflow (nullable until submission)

**Business Rule**:
- Workflow assigned based on department, priority, or amount thresholds
- Workflow stages configurable per organization
- Standard workflows: "Department Approval", "Emergency", "High-Value"

---

#### tb_store_requisition_detail → tb_product

**Relationship Type**: Many line items request one product

**Foreign Key**: `tb_store_requisition_detail.product_id` references `tb_product.id`

**Cardinality**:
- One product can be requested by: 0 to many line items
- Each line item references: exactly 1 product

**Business Rule**:
- Product must be active in catalog
- Product must be stockable (not service or non-inventory item)
- Denormalized product name preserves historical product name

---

#### tb_store_requisition_detail → tb_inventory_transaction (One-to-One)

**Relationship Type**: Each issued line item links to one inventory transaction

**Foreign Key**: `tb_store_requisition_detail.inventory_transaction_id` references `tb_inventory_transaction.id`

**Cardinality**:
- One line item links to: 0 or 1 inventory transaction (NULL until issued)
- Each inventory transaction links to: 1 line item

**Business Rule**:
- Transaction created when items issued from store to department
- Transaction records stock movement: from_location → to_location
- Quantity in transaction matches issued_qty in line item
- For partial issuance, multiple transactions can reference same line item (business logic handles this in application)

---

## Data Indexing Strategy

### Primary Indexes

**Primary Key Index on tb_store_requisition** (Automatic):
- **Field**: `id`
- **Purpose**: Unique identifier lookup, join performance
- **Type**: B-tree (automatic with PRIMARY KEY constraint)
- **Performance**: O(log n) lookup

**Primary Key Index on tb_store_requisition_detail** (Automatic):
- **Field**: `id`
- **Purpose**: Unique identifier lookup, join performance
- **Type**: B-tree
- **Performance**: O(log n) lookup

---

### Business Key Indexes

**Requisition Number Index**:
- **Field**: `sr_no` on tb_store_requisition
- **Purpose**: Fast lookup by human-readable requisition number (user searches)
- **Type**: Unique B-tree index
- **Index Name**: "sr_no_u" (as defined in schema)
- **Use Cases**:
  - User searches for "SR-2501-0125"
  - Validation of requisition number uniqueness
  - Sorting by requisition number

---

### Foreign Key Indexes

**Parent Requisition Index on Line Items**:
- **Field**: `store_requisition_id` on tb_store_requisition_detail
- **Purpose**: Fast retrieval of all line items for a requisition
- **Type**: B-tree index
- **Use Cases**: Loading requisition detail page, cascade deletes
- **Performance**: Critical for detail page loading

**Product Index on Line Items**:
- **Field**: `product_id` on tb_store_requisition_detail
- **Purpose**: Find all requisitions requesting specific product
- **Type**: B-tree index
- **Use Cases**: Product demand analysis, stock availability checks

**Location Indexes**:
- **Field**: `from_location_id` on tb_store_requisition
- **Purpose**: Filter requisitions by source store
- **Field**: `to_location_id` on tb_store_requisition_detail
- **Purpose**: Filter items by destination location

**Workflow Index**:
- **Field**: `workflow_id` on tb_store_requisition
- **Purpose**: Find requisitions using specific workflow

**Inventory Transaction Index**:
- **Field**: `inventory_transaction_id` on tb_store_requisition_detail
- **Purpose**: Link issuance to inventory movements

---

### Status and Workflow Indexes

**Status Index on Requisitions**:
- **Field**: `doc_status` on tb_store_requisition
- **Purpose**: Fast filtering by lifecycle status
- **Type**: B-tree index
- **Partial Index**: Recommend WHERE deleted_at IS NULL (active records only)
- **Use Cases**:
  - Dashboard showing "draft" requisitions
  - List of "in_progress" approvals
  - Completed requisitions report

**Workflow Stage Index**:
- **Field**: `workflow_current_stage` on tb_store_requisition
- **Purpose**: Filter requisitions by current approval stage
- **Type**: B-tree index
- **Use Cases**:
  - "Pending Department Manager Approval" queue
  - "Ready for Issuance" list

**Last Action Index on Line Items**:
- **Field**: `last_action` on tb_store_requisition_detail
- **Purpose**: Filter items by approval status
- **Type**: B-tree index
- **Use Cases**:
  - List of approved items ready for issuance
  - Rejected items needing replacement
  - Items pending review

---

### Composite Indexes

**Status + Date Index**:
- **Fields**: (`doc_status`, `sr_date DESC`) on tb_store_requisition
- **Purpose**: Efficient status-based lists sorted by date
- **Type**: Composite B-tree index
- **Use Cases**: "Recent in-progress requisitions", "Completed requisitions this month"

**Department + Date Index**:
- **Fields**: (`department_id`, `sr_date DESC`) on tb_store_requisition
- **Purpose**: Department-specific requisition lists
- **Type**: Composite B-tree index
- **Use Cases**: Department manager viewing their requisitions

**Location + Status Index**:
- **Fields**: (`from_location_id`, `doc_status`) on tb_store_requisition
- **Purpose**: Store-specific requisition queues
- **Use Cases**: Store manager viewing pending requisitions for their store

---

### Date Range Indexes

**Requisition Date Index**:
- **Field**: `sr_date` on tb_store_requisition
- **Purpose**: Time-series queries, date range reports
- **Type**: B-tree index
- **Use Cases**: Monthly requisition reports, year-over-year analysis

**Expected Date Index**:
- **Field**: `expected_date` on tb_store_requisition
- **Purpose**: Urgent requisitions, delivery scheduling
- **Type**: B-tree index
- **Use Cases**: "Requisitions needed this week", overdue tracking

---

### JSON/JSONB Indexes

**Metadata Index on Requisitions**:
- **Field**: `info` on tb_store_requisition
- **Purpose**: Fast queries on JSON properties (priority, urgency)
- **Type**: GIN index on JSONB column
- **Use Cases**:
  - Filter by priority: `info->>'priority' = 'high'`
  - Search by special flag: `info ? 'emergency'`

**Workflow History Index**:
- **Field**: `workflow_history` on tb_store_requisition
- **Purpose**: Search within approval history
- **Type**: GIN index on JSONB column (optional, for advanced queries)

---

### Partial Indexes (Soft Delete)

**Active Requisitions Index**:
- **Condition**: WHERE deleted_at IS NULL
- **Applied to**: All indexes on tb_store_requisition
- **Purpose**: Exclude soft-deleted records from indexes
- **Benefit**: Smaller index size, faster queries on active data
- **Recommendation**: Apply to status, workflow, date indexes

**Active Line Items Index**:
- **Condition**: WHERE deleted_at IS NULL
- **Applied to**: Indexes on tb_store_requisition_detail
- **Purpose**: Query performance on active items only

---

### Index Maintenance Guidelines

**Monitoring**:
- Track index usage: `pg_stat_user_indexes` view
- Identify unused indexes (usage_count = 0 for extended period)
- Monitor index bloat: Reindex when bloat >30%
- Check slow query log for missing index opportunities

**Best Practices**:
- Index all foreign keys (already covered above)
- Index columns in WHERE clauses used in >10% of queries
- Index columns in ORDER BY for large result sets
- Use composite indexes for multi-column filters
- Limit to 5-10 indexes per table (balance between query speed and write performance)
- Remove unused indexes quarterly

**Index Naming Convention** (Recommended):
- Primary key: `tb_store_requisition_pkey` (automatic)
- Unique: `idx_sr_sr_no_unique`
- Foreign key: `idx_srd_store_requisition_id`
- Composite: `idx_sr_status_date`
- Partial: `idx_sr_status_active` (with WHERE deleted_at IS NULL)
- JSONB: `idx_sr_info_gin`

---

## Data Integrity Rules

### Referential Integrity

**Foreign Key Constraints**:
- All foreign keys must reference existing records in target tables
- Foreign key fields are indexed for query performance
- Relationship validation occurs at database level (cannot be bypassed by application)
- UUID data type ensures globally unique references

**Cascade Rules**:

1. **tb_store_requisition → tb_store_requisition_detail**: CASCADE
   - Delete requisition → Automatically delete all line items
   - Rationale: Line items have no meaning without parent
   - Use case: Voiding or deleting requisition removes all items

2. **tb_store_requisition → tb_location (from_location)**: NO ACTION
   - Prevent deletion of location with active requisitions
   - Use case: Cannot delete "Main Store" while requisitions reference it

3. **tb_store_requisition → tb_workflow**: NO ACTION
   - Preserve workflow reference even if workflow template deactivated
   - Use case: Historical requisitions maintain workflow history

4. **tb_store_requisition_detail → tb_product**: NO ACTION
   - Preserve line item even if product discontinued
   - Use case: Historical requisitions show what was requested (even if product no longer exists)

5. **tb_store_requisition_detail → tb_inventory_transaction**: NO ACTION
   - Preserve link even if transaction voided
   - Use case: Audit trail of issuance remains intact

**Orphan Prevention**:
- No line items without valid parent requisition (enforced by foreign key)
- Application must ensure at least 1 line item exists before submission
- Soft delete parent → Application should cascade soft delete to children

---

### Domain Integrity

**Data Type Enforcement**:
- UUID fields: Must be valid UUID format (8-4-4-4-12 hex pattern)
- TIMESTAMPTZ fields: Must be valid timestamp with timezone
- DECIMAL fields: Numeric precision enforced (20 digits total, 5 decimal places)
- JSONB fields: Must be valid JSON format
- Enum fields: Must be from allowed enum values

**Enum Constraints**:

**enum_doc_status** (Document Status):
- Allowed values: draft, in_progress, completed, cancelled, voided
- Application enforces valid status transitions:
  - draft → in_progress (submit)
  - in_progress → completed (approve and issue all items)
  - in_progress → cancelled (cancel before completion)
  - any → voided (admin void)
- Invalid transitions rejected by application logic

**enum_last_action** (Last Action):
- Allowed values: submitted, approved, reviewed, rejected
- Tracks most recent workflow action
- Application sets based on user action

**NOT NULL Constraints**:

**tb_store_requisition** required fields:
- `id`: Primary key must exist
- `sr_no`: Business key must be unique and present
- `doc_status`: Status must always be defined
- `doc_version`: Version tracking required

**tb_store_requisition_detail** required fields:
- `id`: Primary key must exist
- `store_requisition_id`: Parent reference required
- `product_id`: Product reference required
- `doc_version`: Version tracking required

**DEFAULT Values**:

**tb_store_requisition**:
- `doc_status` = 'draft': New requisitions start in draft
- `last_action` = 'submitted': Default action state
- `doc_version` = 0: New records start at version 0
- `created_at` = NOW(): Automatic timestamp
- `updated_at` = NOW(): Automatic timestamp
- `deleted_at` = NULL: Active by default

**tb_store_requisition_detail**:
- `sequence_no` = 1: Default line number
- `last_action` = 'submitted': Default item status
- `doc_version` = 0: New items start at version 0
- Audit timestamps same as parent

**UNIQUE Constraints**:
- `sr_no` on tb_store_requisition: Requisition number must be unique globally
  - Format enforced by application: SR-YYMM-NNNN
  - Index: "sr_no_u" for fast validation

---

### Entity Integrity

**Primary Key Requirements**:
- Every table must have UUID primary key
- Primary keys immutable (never updated after creation)
- Primary keys always NOT NULL and UNIQUE
- UUID type for distributed system compatibility and global uniqueness

**Audit Trail Requirements** (All tables):

**tb_store_requisition**:
- `created_at`: When requisition created (immutable)
- `created_by_id`: Who created (immutable) - the requestor
- `updated_at`: Last modification timestamp (auto-updated by trigger)
- `updated_by_id`: Last modifier (could be approver, editor, etc.)
- Purpose: Full accountability, troubleshooting, compliance

**tb_store_requisition_detail**:
- Same audit fields at line item level
- Tracks who added, modified, approved each item
- Separate from workflow actions (workflow_history, history fields)

**Soft Delete Requirements**:
- `deleted_at`: Timestamp for soft delete (NULL = active)
- `deleted_by_id`: Who performed soft delete
- Never physically delete requisitions (preserve history)
- Queries must filter `WHERE deleted_at IS NULL` for active records
- Allows recovery and complete audit trail preservation
- Soft delete requisition should cascade soft delete to line items (application logic)

---

### Data Quality Constraints

**Value Range Constraints**:
- **Quantities**: Must be positive (≥ 0) if set
  - `requested_qty` ≥ 0
  - `approved_qty` ≥ 0 and ≤ requested_qty
  - `issued_qty` ≥ 0 and ≤ approved_qty
  - Enforced by application logic

- **Dates**: Must be within reasonable business timeframe
  - `sr_date`: Cannot be far in future (> 1 month)
  - `expected_date`: Should be >= sr_date
  - Enforced by application validation

- **Document version**: Must be ≥ 0
  - Increments on each update
  - Optimistic locking prevents concurrent edits

**Format Constraints**:
- **sr_no**: Must follow format SR-YYMM-NNNN where YY is 2-digit year and MM is month
  - Pattern: "SR-" + 2-digit year + 2-digit month + "-" + 4-digit sequence
  - Example: SR-2501-0001, SR-2501-0125
  - Enforced by application on generation

- **UUID fields**: Must be valid UUID format
  - Pattern: 8-4-4-4-12 hexadecimal
  - Enforced by PostgreSQL UUID data type

**Business Logic Constraints** (Application enforced):

**Requisition Level**:
- Cannot submit requisition without line items (minimum 1 required)
- Cannot submit without required fields: sr_date, from_location_id, department_id, requestor_id
- Status transitions must be valid (draft → in_progress, not backwards)
- Workflow stages must progress in order
- Cannot delete or cancel requisition after items issued

**Line Item Level**:
- Approved quantity cannot exceed requested quantity
- Issued quantity cannot exceed approved quantity
- Cannot issue items without approval
- Cannot approve items if product inactive or stock unavailable (warning, not hard constraint)
- Item rejection requires reject_message
- Item review requires review_message

**Workflow Constraints**:
- Approver must have permission for current workflow stage
- Cannot approve own requisition (if configured)
- Approval comments required for partial approvals or rejections
- Workflow history must be maintained (append-only)

---

## Database Triggers and Automation

### Automatic Timestamp Updates

**Updated At Trigger** (Recommended):
- **Purpose**: Automatically update `updated_at` timestamp on every record modification
- **Trigger Event**: BEFORE UPDATE on tb_store_requisition and tb_store_requisition_detail
- **Behavior**: Sets `updated_at` to NOW() before saving changes
- **Benefits**: Ensures accurate last-modified tracking without application logic

**Created At Protection** (Recommended):
- **Purpose**: Prevent modification of `created_at` and `created_by_id` fields
- **Trigger Event**: BEFORE UPDATE on both tables
- **Behavior**: Rejects any attempt to change creation timestamp or creator
- **Benefits**: Immutable audit trail, data integrity

---

### Audit Logging

**Change Tracking Trigger** (Optional):
- **Purpose**: Record all insert, update, delete operations for audit trail
- **Trigger Event**: AFTER INSERT OR UPDATE OR DELETE on both tables
- **Audit Table**: Separate `tb_audit_log` table stores change history
- **Captured Data**:
  - Operation type: INSERT, UPDATE, DELETE
  - User who performed action (from updated_by_id)
  - Timestamp of change
  - Old values (before change) for UPDATE
  - New values (after change) for INSERT/UPDATE
  - Changed fields only (efficient storage)

**Use Cases**:
- Compliance and regulatory requirements
- Troubleshooting data issues ("Who changed this quantity?")
- User accountability
- Security investigation
- Data recovery (restore previous values)

---

### Data Validation Triggers

**Business Rule Validation** (Application-enforced, but could be trigger):
- **Purpose**: Enforce complex business rules
- **Trigger Event**: BEFORE INSERT OR UPDATE
- **Validation Examples**:
  - Check workflow stage permissions before approval
  - Verify stock availability before approval (soft check, warning)
  - Validate quantity relationships (approved ≤ requested, issued ≤ approved)
  - Ensure requisition has line items before changing status to in_progress

**Error Handling**:
- Trigger raises exception with meaningful error message
- Transaction rolled back
- Application receives clear error to display to user

---

### Cascade Operations

**Soft Delete Cascade** (Application logic, not trigger):
- **Purpose**: When parent requisition soft-deleted, automatically soft-delete children
- **Behavior**: Application sets deleted_at on all line items when parent deleted
- **Benefits**: Maintains referential integrity with soft deletes

---

### Computed Fields (Application-calculated, not trigger)

**Line Item Totals** (Calculated on-the-fly):
- Total requested amount: SUM(requested_qty * unit_cost)
- Total approved amount: SUM(approved_qty * unit_cost)
- Total issued amount: SUM(issued_qty * unit_cost)
- Calculated in application or database view, not stored

---

### Notification Triggers (Application-handled)

**Event Notification**:
- **Purpose**: Notify users when actions required
- **Mechanism**: Application queues notifications after database commit
- **Use Cases**:
  - Notify approver when requisition submitted
  - Notify requestor when item approved/rejected
  - Notify storekeeper when ready for issuance
  - Notify requestor when items issued

---

## Performance Considerations

### Query Performance Targets

**Response Time Objectives**:
- **Simple Queries** (requisition by id or sr_no): < 10ms
- **List Queries** (filtered requisitions with pagination): < 100ms
- **Detail Page** (requisition with all line items): < 50ms
- **Complex Queries** (joins with products, workflow, locations): < 200ms
- **Reports** (monthly department consumption): < 2 seconds
- **Batch Operations** (bulk approval of 100 items): < 5 seconds

**Achieving Targets**:
- Proper indexing on foreign keys and filtered fields
- Query optimization using EXPLAIN ANALYZE
- Connection pooling (10-50 connections)
- Application-level caching for reference data (products, locations)
- Database query result caching for expensive reports

---

### Table Size Projections

**tb_store_requisition**:
| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Month 1 | 100-500 | 1-5 MB | Depends on hotel size |
| Year 1 | 1,200-6,000 | 12-60 MB | ~100-500/month |
| Year 3 | 3,600-18,000 | 36-180 MB | With archival |
| Year 5 | 6,000-30,000 | 60-300 MB | Mature with archival |

**tb_store_requisition_detail**:
| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Month 1 | 500-2,500 | 5-25 MB | ~5-10 items/requisition |
| Year 1 | 6,000-30,000 | 60-300 MB | |
| Year 3 | 18,000-90,000 | 180-900 MB | With archival |
| Year 5 | 30,000-150,000 | 300 MB-1.5 GB | Mature with archival |

**Sizing Assumptions**:
- Small hotel: ~100 requisitions/month, ~5 items/requisition
- Large hotel: ~500 requisitions/month, ~10 items/requisition
- Average row size (requisition): ~10 KB (with JSONB fields)
- Average row size (detail): ~5 KB
- Growth rate steady based on operational volume
- Archival: Records older than 12 months moved to archive tables
- Retention: Archived data kept for 7 years, then purged

**Storage Planning**:
- Primary tables: Active 12 months of data
- Archive tables: 7 years of historical data
- Indexes: Approximately 30-50% of table size
- Total with overhead: Plan for 2-3x estimated size

---

### Optimization Techniques

**Query Optimization**:
- Use EXPLAIN ANALYZE to understand execution plans
- Identify slow queries from `pg_stat_statements` extension
- Add indexes for frequently accessed columns
- Optimize JOIN order (smaller tables first)
- Use appropriate WHERE clause filtering (leverage indexes)
- Limit result sets with LIMIT and OFFSET for pagination
- Use COUNT estimates for large tables instead of exact count

**Indexing Best Practices**:
- Index foreign keys (already specified above)
- Index columns in WHERE clauses with high selectivity
- Index columns in ORDER BY for large result sets
- Use composite indexes for multi-column queries
- Create partial indexes for filtered queries (WHERE deleted_at IS NULL)
- Monitor and remove unused indexes quarterly

**Connection Pooling**:
- Limit concurrent database connections (10-50 connections)
- Reuse connections across requests
- Prevents connection exhaustion
- Application-level pooling (PgBouncer or built-in)

**Caching Strategy**:
- Cache reference data (products, locations, workflows) at application level
- TTL: 5-60 minutes depending on change frequency
- Cache expensive reports (daily/weekly reports)
- Invalidate cache on data changes (smart invalidation)

**Read Replicas** (For large deployments):
- Offload reporting and analytics to read replicas
- Reduce load on primary database
- Eventually consistent reads acceptable for reports
- Failover capability for high availability

**Batch Operations**:
- Bulk INSERT line items in single transaction
- Bulk UPDATE approval status for multiple items
- Process large datasets in chunks (1000 records at a time)
- Avoid row-by-row processing in loops

---

## Data Archival Strategy

### Archival Policy

**Retention Periods**:
- **Active Data**: Last 12 months in primary tables
- **Archived Data**: 1-7 years in archive tables
- **Purge After**: 7 years (compliance requirement, adjust as needed)

**Archival Criteria**:
- Requisitions older than 12 months
- Status = 'completed', 'cancelled', or 'voided' (closed requisitions only)
- All workflow stages completed
- No pending actions or approvals

**Archival Frequency**:
- Monthly archival process (scheduled job)
- Run during off-peak hours (e.g., 2 AM on first Sunday of month)
- Incremental archival (only new records meeting criteria)

---

### Archive Table Structure

**Archive Tables**:
- `tb_store_requisition_archive`: Same schema as primary table
- `tb_store_requisition_detail_archive`: Same schema as primary detail table
- Additional field: `archived_at` TIMESTAMPTZ (when record was archived)
- Same indexes for query performance
- Separate tablespace for cost-effective storage (HDD or cloud storage)

**Archive Table Naming**:
- Pattern: `{primary_table}_archive`
- Example: `tb_store_requisition_archive`, `tb_store_requisition_detail_archive`

**Data Location**:
- Primary tables: High-performance SSD storage
- Archive tables: Cost-effective HDD or cloud archival storage
- Compressed storage for archive data (PostgreSQL compression or file system compression)

---

### Archival Process

**Archival Workflow**:
1. Identify requisitions meeting archival criteria
   - Completed/cancelled/voided status
   - Created date > 12 months ago
2. Copy header records to `tb_store_requisition_archive`
3. Copy line item records to `tb_store_requisition_detail_archive`
4. Verify row counts match
5. Soft-delete records in primary tables (set deleted_at)
6. Update archive metadata table
7. Log archival operation
8. Verify data integrity

**Transaction Safety**:
- Entire archival process in single transaction per requisition
- Rollback on any error
- Verify row counts before and after
- Maintain referential integrity (parent + children together)

**Archival Verification**:
- Compare row counts (archived vs. soft-deleted)
- Verify no data loss
- Check archive table integrity
- Test archive data accessibility with sample queries

---

### Archive Data Access

**Querying Archive Data**:
- Create views combining primary and archive tables:
  - `v_store_requisition_all` = tb_store_requisition UNION ALL tb_store_requisition_archive
  - `v_store_requisition_detail_all` = detail tables combined
- Use views for historical reporting
- Partition by archive status for query optimization

**Archive Data Retrieval**:
- Slower query performance acceptable (not real-time)
- Read-only access for most users
- Admin-only restore capabilities
- Export to external systems for long-term storage

**Data Restore** (if needed):
- Copy records from archive back to primary table
- Reset deleted_at to NULL
- Refresh indexes and statistics
- Verify data consistency

---

## Security Considerations

### Row-Level Security (RLS) - Recommended

**Purpose**: Control which rows users can see and modify based on their role and department

**Policy Types**:
- **Read Policies**: Control which rows users can SELECT
- **Write Policies**: Control which rows users can INSERT/UPDATE/DELETE

**Example Policies**:

**Department Isolation**:
- Users can only access requisitions from their own department
- Policy: `department_id = current_user_department_id()`
- Exception: Managers and storekeepers can access multiple departments

**Creator Access**:
- Users can view requisitions they created
- Policy: `created_by_id = current_user_id()`
- Exception: Department managers can see their team's requisitions

**Approver Access**:
- Approvers can see requisitions requiring their approval
- Policy: Based on workflow_current_stage and user role
- Example: Store managers see requisitions at "Store Manager Review" stage

**Admin Override**:
- Admins bypass all RLS policies
- Policy: `USING (true)` for admin role
- Full system access for troubleshooting

---

### Column-Level Security

**Sensitive Data** (if any):
- Cost/pricing information in line items (cost_per_unit)
- Internal notes or comments
- Financial dimension data (dimension JSON field)

**Access Control**:
- Grant SELECT on specific columns only for read-only users
- Revoke access to cost columns for staff users
- Use views with filtered columns for restricted access

---

### Data Encryption

**Encryption At Rest**:
- Database-level encryption enabled on storage
- Transparent to application (automatic encrypt/decrypt)
- Encryption key management by cloud provider or HSM
- Meets compliance requirements (if applicable)

**Encryption In Transit**:
- SSL/TLS for all database connections
- Certificate-based authentication
- Encrypted connection strings
- No plaintext data transmission

**Column-Level Encryption** (Optional, if needed):
- Encrypt sensitive comments or notes using pgcrypto extension
- Application manages encryption keys
- Encrypt before INSERT, decrypt after SELECT

---

### Access Control

**Database Users and Roles**:
- **app_read_only**: SELECT only on requisitions and line items
- **app_read_write**: SELECT, INSERT, UPDATE (no DELETE)
- **app_admin**: Full access including DELETE
- **reporting_user**: SELECT on views and archive tables

**Authentication**:
- Strong password policy for database users
- Service account credentials for application
- Rotate credentials regularly (quarterly)

**Authorization**:
- Principle of least privilege
- Grant minimum necessary permissions
- Regular access reviews and audits
- Revoke access when role changes

**Audit Trail**:
- Log all database access attempts
- Track failed login attempts
- Monitor suspicious activity (unusual queries, bulk deletes)
- Alert on security violations

---

## Backup and Recovery

### Backup Strategy

**Full Backups**:
- **Frequency**: Daily at 2 AM (off-peak hours)
- **Retention**: 30 days online, 90 days in cold storage
- **Method**: PostgreSQL pg_dump or database snapshot
- **Location**: Off-site cloud storage (separate region)

**Incremental Backups**:
- **Frequency**: Every 4 hours
- **Retention**: 7 days
- **Method**: Write-Ahead Log (WAL) archiving
- **Purpose**: Minimize data loss window (Recovery Point Objective)

**Continuous Archiving**:
- **Method**: WAL streaming to backup server
- **Purpose**: Near-zero RPO (Recovery Point Objective)
- **Benefit**: Point-in-time recovery capability

**Backup Verification**:
- Weekly restore test to verify backup integrity
- Automated backup health checks
- Alert on backup failures
- Document restore procedures

---

### Backup Contents

**Included in Backup**:
- tb_store_requisition table (structure and data)
- tb_store_requisition_detail table (structure and data)
- Archive tables (if separate)
- Indexes and constraints
- Audit log tables (if implemented)
- Database configuration

**Excluded from Backup** (if stored separately):
- Large attachments or documents (use object storage)
- Temporary tables
- Cache tables

---

### Recovery Procedures

**Point-in-Time Recovery** (PITR):
- Restore from full backup
- Replay WAL logs to specific timestamp
- Use case: Recover from accidental data deletion
- Recovery Time Objective (RTO): < 4 hours

**Full Database Restore**:
- Restore entire database from latest backup
- Use case: Complete database corruption or loss
- RTO: < 8 hours

**Table-Level Recovery**:
- Restore specific tables (tb_store_requisition, tb_store_requisition_detail) from backup to staging
- Copy needed data back to production
- Use case: Recover accidentally deleted requisitions
- RTO: < 2 hours

**Disaster Recovery**:
- Failover to backup region/server
- Automated failover triggers
- Use case: Primary datacenter failure
- RTO: < 1 hour

---

### Backup Retention Policy

**Retention Schedule**:
- **Daily backups**: Keep for 30 days
- **Weekly backups**: Keep for 90 days (13 weeks)
- **Monthly backups**: Keep for 1 year (12 months)
- **Yearly backups**: Keep for 7 years (compliance, adjust as needed)

**Storage Optimization**:
- Compress old backups (gzip or equivalent)
- Move to cheaper storage tiers over time
- Delete expired backups automatically
- Monitor storage costs

---

## Data Migration

### Version 1.0.0 - Initial Schema

**Migration Metadata**:
- **Migration File**: `001_create_store_requisition_tables.sql`
- **Date**: 2025-01-12
- **Author**: Database Team
- **Purpose**: Initial database schema creation for Store Requisitions module

**Migration Steps** (Description):
1. Create `tb_store_requisition` table with all columns and data types as defined in schema.prisma
2. Create primary key constraint on `id` column
3. Create unique constraint and index on `sr_no` field (index name: "sr_no_u")
4. Create foreign key constraints:
   - `from_location_id` → `tb_location.id` (NO ACTION on delete/update)
   - `workflow_id` → `tb_workflow.id` (NO ACTION on delete/update)
5. Create `tb_store_requisition_detail` table with all columns
6. Create primary key constraint on detail table `id` column
7. Create foreign key constraints on detail table:
   - `store_requisition_id` → `tb_store_requisition.id` (CASCADE on delete implied)
   - `product_id` → `tb_product.id` (NO ACTION)
   - `to_location_id` → `tb_location.id` (NO ACTION)
   - `inventory_transaction_id` → `tb_inventory_transaction.id` (NO ACTION)
8. Create indexes on foreign keys (recommended)
9. Create audit triggers for timestamp updates (recommended)
10. Grant permissions to database roles (app_read_write, app_read_only, app_admin)

**Data Included**:
- Table structure and constraints
- No seed data (requisitions created by users)

**Verification**:
- Verify tables created correctly
- Test constraints work as expected (unique sr_no, foreign keys)
- Verify enum types exist (enum_doc_status, enum_last_action)
- Confirm indexes created
- Test insert, update, delete operations

**Rollback Plan**:
- Drop foreign key constraints on tb_store_requisition_detail
- Drop tb_store_requisition_detail table
- Drop foreign key constraints on tb_store_requisition
- Drop tb_store_requisition table
- Verify clean rollback

---

## Data Quality

### Data Quality Dimensions

**Completeness**:
- All required fields populated (id, sr_no, doc_status, store_requisition_id, product_id)
- All requisitions have at least 1 line item
- No NULL in NOT NULL columns
- Measured: % of requisitions with complete data

**Accuracy**:
- Quantities match business reality (approved ≤ requested, issued ≤ approved)
- Denormalized names match current master data
- Workflow history accurate and complete
- Measured: % of records passing validation checks

**Consistency**:
- Parent requisition status consistent with line item statuses
- Workflow current stage matches workflow history
- Issued quantity matches inventory transaction quantity
- Measured: % of records passing consistency checks

**Validity**:
- Status values from allowed enums
- Dates are reasonable (sr_date not in future, expected_date >= sr_date)
- Foreign key references valid
- JSON fields contain valid JSON
- Measured: % of records passing validation rules

**Timeliness**:
- Audit timestamps accurate and up-to-date
- Workflow actions recorded promptly
- Measured: Average lag between action and data update

**Uniqueness**:
- No duplicate sr_no values
- No duplicate line items within same requisition
- Measured: % of records with unique business keys

---

### Data Quality Checks

**Automated Quality Checks** (Run daily or weekly):

**Check for Orphaned Line Items**:
```
Purpose: Find line items with non-existent parent requisition
Query Logic: LEFT JOIN tb_store_requisition, WHERE parent IS NULL
Expected: 0 orphaned line items (foreign key constraint prevents this)
Action: Should never happen, investigate if found
```

**Check for Invalid Status Values**:
```
Purpose: Ensure doc_status and last_action are from allowed enums
Query Logic: Enum constraints enforce this at database level
Expected: 0 invalid statuses (database prevents invalid values)
```

**Check for Requisitions Without Line Items**:
```
Purpose: Find requisitions with no line items (invalid state)
Query Logic: LEFT JOIN tb_store_requisition_detail, WHERE detail IS NULL
Expected: 0 requisitions without items (business rule requires at least 1)
Action: Identify and fix data integrity issues
```

**Check for Quantity Inconsistencies**:
```
Purpose: Verify approved_qty ≤ requested_qty, issued_qty ≤ approved_qty
Query Logic: WHERE approved_qty > requested_qty OR issued_qty > approved_qty
Expected: 0 inconsistencies
Action: Correct invalid quantities, investigate root cause
```

**Check for Future Dates**:
```
Purpose: Find sr_date or created_at timestamps in the future
Query Logic: WHERE sr_date > NOW() OR created_at > NOW()
Expected: 0 future dates
Action: Correct timestamps, check data entry process
```

**Check for Incomplete Workflow History**:
```
Purpose: Verify workflow_history JSON is valid and complete
Query Logic: Check JSON validity, verify all stages recorded
Expected: Valid JSON, complete history for completed requisitions
Action: Repair invalid JSON, log missing history
```

**Check for Old Pending Requisitions**:
```
Purpose: Find stuck requisitions in workflow (aging report)
Query Logic: WHERE doc_status = 'in_progress' AND sr_date < NOW() - INTERVAL '30 days'
Expected: Review and resolve old pending items
Action: Escalate or close old pending requisitions
```

---

### Data Quality Monitoring

**Quality Metrics Dashboard**:
- Completeness score by requisition (% with all required data)
- Accuracy score (% passing quantity validations)
- Daily quality trend (track improvement over time)
- Top quality issues (most common data problems)

**Alerting**:
- Alert when quality score drops below threshold (e.g., 95%)
- Alert on critical quality checks failing (orphaned records, invalid statuses)
- Alert on data volume anomalies (sudden spike or drop in requisitions)
- Alert on unusual data patterns (many rejections, high cancellation rate)

**Reporting**:
- Weekly data quality report
- Monthly quality trends
- Issue resolution tracking
- Root cause analysis for recurring issues

---

## Testing Data

### Test Data Requirements

**Test Environments**:
- **Development**: Full synthetic test data for feature development
- **Staging**: Copy of production data (sanitized) for testing
- **Testing/QA**: Mix of synthetic and sanitized data for comprehensive testing
- **Demo**: Curated realistic data for product demos

**Data Sanitization** (for production data copies):
- Replace user names with generic "Test User 1", "Test User 2"
- Replace department names with "Test Kitchen", "Test Housekeeping"
- Randomize quantities and dates
- Preserve data relationships and referential integrity
- Mask or remove sensitive comments/notes

---

### Test Data Generation

**Synthetic Data Creation**:

**Approach 1: Manual Test Records**:
- Create specific test scenarios (draft, in-progress, completed, rejected)
- Well-known test data for development (SR-TEST-0001, SR-TEST-0002)
- Predictable values for testing
- Examples:
  - Draft requisition with 5 items
  - In-progress requisition at approval stage
  - Completed requisition with all items issued
  - Cancelled requisition
  - Requisition with partially approved items

**Approach 2: Generated Test Data**:
- Use database generate_series() function to create bulk test data
- Generate 100-1000 test requisitions with random attributes
- Randomized quantities, statuses, dates within valid ranges
- Automated test data creation scripts

**Realistic Test Data**:
- Use hospitality-themed product names (cleaning supplies, kitchen items, maintenance parts)
- Realistic quantities (not just 1, 2, 3)
- Realistic dates (spread across last 12 months)
- Realistic status distributions (80% completed, 10% in-progress, 10% draft)

---

### Test Scenarios

**Volume Testing**:
- Insert 1,000+ requisitions with 5,000+ line items
- Test pagination with large datasets
- Verify query performance under load
- Test bulk approval operations (approve 100 items at once)

**Concurrency Testing**:
- Simultaneous INSERT from multiple users
- Concurrent UPDATE to same requisition (test optimistic locking with doc_version)
- Test workflow approval conflicts (two approvers at same time)
- Verify no data corruption or lost updates

**Edge Case Testing**:
- Null values in optional fields
- Maximum values (999 line items in one requisition)
- Fractional quantities (2.5 units)
- Special characters in description fields
- Very long JSON in info/dimension fields

**Referential Integrity Testing**:
- Test CASCADE delete behavior (delete requisition deletes line items)
- Test NO ACTION prevents deletion (cannot delete location referenced by requisition)
- Verify orphan prevention

**Constraint Testing**:
- Test unique sr_no constraint (duplicate requisition number rejected)
- Test enum constraint enforcement (invalid status rejected)
- Test NOT NULL requirements (missing required field rejected)
- Test default value application

**Workflow Testing**:
- Test complete approval workflow from draft to completed
- Test rejection at various stages
- Test item-level approval and rejection
- Test partial approval scenarios

---

### Test Data Cleanup

**Cleanup Strategy**:
- Mark test data with identifiable pattern (sr_no starts with 'SR-TEST-')
- Automated cleanup scripts
- Separate test department or location for isolation
- Regular cleanup of old test data (delete test data > 30 days old)

**Cleanup Query Example**:
```
Delete test requisitions:
- WHERE sr_no LIKE 'SR-TEST-%'
- WHERE department_name = 'Test Department'
- WHERE created_by_id IN (test user IDs)

Also delete related line items (CASCADE will handle this)
```

---

## Glossary

**Database Terms**:
- **Primary Key**: Unique identifier for each record (UUID in this schema)
- **Foreign Key**: Column that references primary key of another table (establishes relationships)
- **Index**: Database structure that speeds up data retrieval
- **Constraint**: Rule enforced by database to maintain data integrity (UNIQUE, NOT NULL, CHECK)
- **Cascade**: Automatic propagation of deletes to related records
- **Transaction**: Group of database operations that succeed or fail together (ACID)
- **Soft Delete**: Marking record as deleted (deleted_at timestamp) instead of physical removal

**PostgreSQL-Specific Terms**:
- **UUID**: Universally Unique Identifier, 128-bit value for primary keys
- **TIMESTAMPTZ**: Timestamp with timezone, stores UTC time with timezone offset
- **JSONB**: Binary JSON storage format, indexed and queryable
- **GIN**: Generalized Inverted Index, used for JSONB and full-text search
- **B-tree**: Default index type for efficient equality and range queries
- **Partial Index**: Index with WHERE clause, indexes only subset of rows
- **Enum Type**: Custom enumerated type (enum_doc_status, enum_last_action)

**Application Terms**:
- **Soft Delete**: Marking record as deleted without removing it (deleted_at field)
- **Audit Trail**: Historical record of who changed what and when
- **Optimistic Locking**: Using doc_version field to prevent concurrent edit conflicts
- **Denormalization**: Storing name fields (product_name, location_name) for performance and history
- **Backfill**: Updating existing records with new data after adding a column

**Business Terms**:
- **Store Requisition**: Request from department to central store for materials
- **Line Item**: Individual product requested in a requisition
- **Workflow**: Multi-stage approval process (Department Manager → Store Manager → Purchasing)
- **Item-Level Approval**: Approving or rejecting individual line items independently
- **Partial Issuance**: Issuing items in multiple batches over time
- **Business Key**: Human-readable identifier (sr_no: SR-2501-0001)

**Store Operations Terms**:
- **Requestor**: Staff member who creates requisition (Chef, Housekeeper, Engineer)
- **Approver**: Manager who approves requisitions (Department Manager, Store Manager)
- **Storekeeper**: Staff who issues materials from store to departments
- **From Location**: Source store where materials are held (Main Store)
- **To Location**: Destination location where materials are delivered (Kitchen Store)

---

## Enum Type Definitions

### enum_doc_status

**Purpose**: Track document lifecycle status

**Allowed Values**:
1. **draft**: Requisition being prepared, not yet submitted
2. **in_progress**: Requisition submitted and going through approval workflow
3. **completed**: Requisition fully approved and all items issued
4. **cancelled**: Requisition cancelled before completion
5. **voided**: Requisition administratively voided (after completion)

**Status Transitions**:
- draft → in_progress (submit for approval)
- in_progress → completed (all items approved and issued)
- in_progress → cancelled (cancel during workflow)
- any status → voided (admin override)
- Invalid: Cannot go backwards (e.g., in_progress → draft)

---

### enum_last_action

**Purpose**: Track most recent workflow action

**Allowed Values**:
1. **submitted**: Requisition submitted for approval
2. **approved**: Most recent action was approval
3. **reviewed**: Review/clarification requested
4. **rejected**: Most recent action was rejection

**Usage**:
- Set at header level (tb_store_requisition.last_action)
- Set at line item level (tb_store_requisition_detail.last_action)
- Provides quick status reference without parsing full workflow_history

---

## Related Documents

- [Business Requirements](./BR-store-requisitions.md) - Functional requirements and business rules
- [Technical Specification](./TS-store-requisitions.md) - System architecture and component design
- [Use Cases](./UC-store-requisitions.md) - Detailed user workflows and scenarios
- [Flow Diagrams](./FD-store-requisitions.md) - Visual workflow and process diagrams (to be created)
- [Validations](./VAL-store-requisitions.md) - Data validation rules and Zod schemas (to be created)

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Database Architect | | | |
| Technical Lead | | | |
| Store Operations Manager | | | |
| IT Security Officer | | | |

---

**Document End**

> 📝 **Note to Authors**:
> - This schema is extracted from `/docs/app/data-struc/schema.prisma` lines 1688-1787
> - All field definitions match the authoritative Prisma schema exactly
> - Do NOT modify the actual schema.prisma file - this is documentation only
> - Update this document when schema changes are made to schema.prisma
> - Review with database team and stakeholders before implementing
> - Enum definitions (enum_doc_status, enum_last_action) are shared across multiple modules
