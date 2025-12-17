# Data Definition: Wastage Reporting

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Wastage Reporting
- **Database**: PostgreSQL 14+ (via Supabase)
- **Schema Version**: 1.2.0
- **Last Updated**: 2025-12-09
- **Owner**: Store Operations Team
- **Status**: Partially Implemented
- **Implementation Status**: FRONTEND IMPLEMENTED (Mock data exists, database tables pending)

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.3.0 | 2025-12-09 | Documentation Team | Updated to reflect implemented mock data structures |
| 1.2.0 | 2025-12-05 | Documentation Team | Added implementation status warning |
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |
| 1.0.0 | 2025-01-12 | Store Operations Team | Initial proposed schema |

---

## ✅ IMPLEMENTATION NOTE

The Wastage Reporting module frontend has been implemented with comprehensive mock data structures that demonstrate the intended data model:

**Implemented Mock Data Structures**:
- ✅ `wastageReportData` - Report headers with item details, reason, attachments, timeline, related reports
- ✅ `allWastageReports` - List of reports with status, location, reason, reporter, approver
- ✅ `inventoryItems` - Available items for wastage selection with batch numbers, expiry dates
- ✅ `wastageCategories` - Category configuration with approval thresholds, color coding
- ✅ `approvalRules` - Configurable approval rules with conditions and actions
- ✅ Chart data arrays for analytics (monthly trends, by reason, by location, by category)

**Status Values**: `pending`, `under_review`, `approved`, `rejected`

**Reason Categories**: `expiration`, `damage`, `quality`, `spoilage`, `overproduction`, `contamination`, `other`

**Pending**:
- ⏳ Database tables in PostgreSQL/Supabase
- ⏳ Centralized mock data in `/lib/mock-data/`
- ⏳ TypeScript interfaces in `/lib/types/`

See [BR-wastage-reporting.md](./BR-wastage-reporting.md) for complete implementation details.

---

## Overview

The Wastage Reporting data model manages food and beverage wastage transactions across restaurant locations, supporting the complete lifecycle from wastage recording through multi-level approval workflows to inventory adjustment and financial posting. The schema is designed to capture comprehensive wastage data including photos, detailed reasons, approval history, and supplier quality tracking for analytics and compliance.

The data model consists of five primary entities: wastage headers (main transaction records), wastage line items (individual products wasted supporting batch transactions), wastage photos (photo evidence metadata with files stored in Supabase Storage), wastage approvals (multi-level approval workflow state and history), and wastage configuration (system settings for thresholds and rules). All entities follow standard patterns including UUID primary keys, soft delete support, comprehensive audit trails, and PostgreSQL Row-Level Security (RLS) policies for location-based data isolation.

Key design principles include: (1) Separation of header and line items to support both single-product and batch wastage, (2) Complete audit trail capturing all changes and approvals with timestamps and user attribution, (3) Flexible metadata fields using JSONB for extensibility without schema changes, (4) Financial fields using DECIMAL(15,2) for precise currency calculations, (5) Status-driven workflow with immutable approved records, and (6) Row-Level Security ensuring users only access wastage for their assigned locations.

**⚠️ IMPORTANT**: This is a Data Schema Document describing the PROPOSED database structure in TEXT FORMAT ONLY. This schema must be reviewed and approved before implementation. Actual database creation will be performed using Prisma migrations or SQL scripts after approval. This document does NOT include executable SQL code - it describes the intended database structure in clear text.

**Related Documents**:
- [Business Requirements](./BR-wastage-reporting.md) - Functional requirements driving schema design
- [Use Cases](./UC-wastage-reporting.md) - Usage patterns informing access patterns
- [Technical Specification](./TS-wastage-reporting.md) - Implementation architecture and patterns
- [Flow Diagrams](./FD-wastage-reporting.md) - Process flows showing data lifecycle
- [Validations](./VAL-wastage-reporting.md) - Validation rules enforced at database level

---

## Entity Relationship Overview

### Primary Entities

- **wastage_headers**: Main wastage transaction records capturing header-level information including location, category, total value, status, and approval state. Each header represents a single wastage submission which may contain multiple line items.

- **wastage_line_items**: Individual products wasted within a transaction. Supports batch wastage where multiple products are recorded in single submission. Each line item tracks quantity, cost, and approval status independently for partial approval scenarios.

- **wastage_photos**: Photo evidence metadata records. Actual photo files stored in Supabase Storage, this table stores file paths, captions, capture metadata, and watermark information. Photos provide visual proof of wastage for high-value items and fraud prevention.

- **wastage_approvals**: Approval workflow history capturing each approval level action. Tracks approver identity, approval date, action taken (approved/partially approved/rejected), comments, and value adjustments. Supports multi-level approval workflows based on value thresholds.

- **wastage_configuration**: System configuration including approval thresholds, photo requirements, alert rules, active wastage categories, and GL account mappings. Configuration can be global or location-specific for flexibility.

### Key Relationships

1. **wastage_headers → wastage_line_items**: One-to-Many relationship
   - Business meaning: A wastage transaction can contain multiple line items representing different products wasted in a batch. Single-product wastage has one line item, batch wastage has multiple.
   - Cardinality: One header has 1 to many line items (minimum one required for valid transaction)
   - Cascade behavior: Deleting header cascades to delete all line items (maintain referential integrity)
   - Example: Wastage WST-2501-0112-0023 contains 3 line items - Atlantic Salmon (2.5 kg), Beef Ribeye (1 kg), and Fresh Pasta (3 kg)

2. **wastage_headers → wastage_photos**: One-to-Many relationship
   - Business meaning: A wastage transaction can have multiple photo evidence attachments (up to 5 photos per transaction)
   - Cardinality: One header has 0 to 5 photos (zero photos allowed for low-value wastage, mandatory for high-value)
   - Cascade behavior: Deleting header soft-deletes photos (retains for audit, optionally purges physical files)
   - Example: Wastage WST-2501-0112-0023 has 2 photos showing overcooked salmon from different angles

3. **wastage_headers → wastage_approvals**: One-to-Many relationship
   - Business meaning: A wastage transaction progresses through approval workflow with each level creating an approval record. Multi-level approvals create multiple approval records.
   - Cardinality: One header has 1 to 3 approval records (1 for single-level, 2-3 for multi-level approvals)
   - Cascade behavior: Deleting header cascades to delete approvals (maintain audit trail integrity)
   - Example: High-value wastage ($550) has 2 approval records - Level 1 (Store Manager) and Level 2 (Finance Manager)

4. **wastage_headers → products**: Many-to-One relationship (via wastage_line_items)
   - Business meaning: Each line item references a product from Product Management module
   - Cardinality: Many line items reference one product (same product can be wasted multiple times)
   - Cascade behavior: Product deletion restricted if referenced by non-deleted wastage (RESTRICT)
   - Example: Product "Atlantic Salmon Fillet" is referenced by 50+ wastage line items over time

5. **wastage_headers → users**: Many-to-One relationships (multiple user references)
   - Business meaning: Wastage transaction tracks submitter (created_by), responsible party, approvers, and modifier
   - Cardinality: Many wastage records created by one user, many approved by one manager
   - Cascade behavior: User deletion sets foreign keys to NULL (preserve history even if user deleted)
   - Example: Chef Daniel (created_by) records wastage, Maria (approver) approves it

6. **wastage_headers → locations**: Many-to-One relationship
   - Business meaning: Wastage occurs at specific restaurant location and belongs to that location's data
   - Cardinality: Many wastage records belong to one location
   - Cascade behavior: Location deletion restricted if active wastage exists (RESTRICT)
   - Row-Level Security: Users can only see wastage for locations they have access to
   - Example: All wastage at "Restaurant A Downtown" linked via location_id

7. **wastage_headers → vendors**: Many-to-One relationship (optional, for supplier quality issues)
   - Business meaning: Wastage attributed to supplier quality problems tracks which vendor supplied the defective product
   - Cardinality: Many wastage records can reference one vendor (most wastage has no vendor reference)
   - Cascade behavior: Vendor deletion sets foreign key to NULL (preserve wastage history)
   - Example: Wastage flagged as supplier quality issue references Vendor "ABC Seafood Suppliers"

### Relationship Notes

- **Parent-Child Cascade**: All parent-child relationships use CASCADE delete to maintain referential integrity. Deleting a wastage header automatically removes all child records (line items, photos, approvals) to prevent orphaned data.

- **User References Preserve History**: User foreign keys use SET NULL on delete to preserve historical records even when users are deleted or deactivated. Wastage records show "Deleted User" for historical accountability.

- **Soft Delete Pattern**: Primary entities use deleted_at timestamp for soft deletion. Soft-deleted records remain in database for audit purposes but are excluded from normal queries using WHERE deleted_at IS NULL filters.

- **Row-Level Security**: PostgreSQL RLS policies enforce location-based access control at database level. Users can only query wastage for locations they have access to (via user_locations junction table), preventing data leaks through application bugs.

- **Immutable Approved Records**: Once wastage is approved (status = 'approved'), the header and line item amounts become immutable. Updates are restricted to prevent tampering after inventory adjustment. Only audit fields (updated_at, updated_by) can change.

- **Optimistic Locking**: All headers include doc_version field incremented on each update. Concurrent updates detected by version mismatch prevent lost update problems in multi-user scenarios.

---

## Data Entities

### Entity: wastage_headers

**Description**: Represents wastage transactions capturing header-level information including location, category, total value, workflow status, and approval state. Each record represents a single wastage submission by kitchen staff or managers.

**Business Purpose**: Central entity for wastage tracking, serving as the primary record for all wastage-related data. Supports complete wastage lifecycle from recording through approval to inventory adjustment. Enables wastage analytics, trend analysis, and financial reporting.

**Data Ownership**: Owned by location where wastage occurred. Access controlled through Row-Level Security ensuring users only see wastage for their assigned locations. Finance and Operations teams may have cross-location access based on roles.

**Access Pattern**: Primarily accessed by wastage number (unique key lookup), location and date range (list queries), status (approval queue queries), and submitter (user's wastage history). Heavy read workload for reporting and analytics.

**Data Volume**: Expected ~50-100 records per location per month. For 50 locations: 2,500-5,000 records/month, 30,000-60,000 records/year. Total 5-year projection: 150,000-300,000 records. Manageable without partitioning initially.

#### Fields Overview

**Primary Identification**:
- **ID Field**: `id` - UUID unique identifier, auto-generated using gen_random_uuid()
- **Business Key**: `wastage_number` - Human-readable wastage number in format WST-YYYY-MMDD-NNNN (e.g., WST-2501-0112-0023)
- **Display Name**: Wastage number combined with product summary (e.g., "WST-2501-0112-0023 - Atlantic Salmon 2.5kg")

**Core Business Fields**:

- **wastage_date** - DATE - Date when wastage actually occurred (not submission date)
  - Required: Yes
  - Business meaning: Actual date of wastage event for trend analysis
  - Validation: Cannot be more than 7 days in past (without special approval) or in future
  - Example values: 2025-01-12, 2025-01-11

- **wastage_time** - TIME - Time when wastage occurred (24-hour format)
  - Required: Yes
  - Default: Current time at submission
  - Business meaning: Helps identify time-based patterns (e.g., end-of-service wastage peaks)
  - Example values: 14:30:00 (2:30 PM), 21:45:00 (9:45 PM)

- **location_id** - UUID - Foreign key to locations table
  - Required: Yes
  - Business meaning: Restaurant location where wastage occurred, determines data ownership
  - Constraint: Must reference existing active location
  - RLS: Users can only create/view wastage for locations they have access to
  - Example: 550e8400-e29b-41d4-a716-446655440001

- **department_id** - UUID - Foreign key to departments table
  - Required: Yes
  - Business meaning: Department within location (e.g., Kitchen, Bar, Housekeeping)
  - Used for department-level wastage analysis
  - Example: 550e8400-e29b-41d4-a716-446655440010

- **wastage_category** - VARCHAR(50) - Primary wastage category
  - Required: Yes
  - Allowed values: 'spoilage', 'overproduction', 'preparation_error', 'damaged', 'expired', 'customer_return', 'portion_control', 'quality_issue', 'contamination', 'equipment_failure', 'training_testing', 'sampling', 'other'
  - Business meaning: Categorizes root cause of wastage for analytics and corrective action
  - Example values: preparation_error, spoilage, overproduction

- **subcategory** - VARCHAR(100) - Optional sub-classification within category
  - Required: No
  - Example values: "overcooked", "undercooked", "wrong_recipe", "dropped", "burned" (for preparation_error category)
  - Business meaning: Provides granular detail for targeted training and process improvements

- **reason** - TEXT - Detailed explanation of wastage
  - Required: Yes
  - Validation: Minimum 20 characters, maximum 500 characters
  - Business meaning: Captures context, root cause, and circumstances for review and learning
  - Example: "Salmon overcooked during grill service, 3 portions affected due to temperature control issue. Grill temperature calibration scheduled."

- **additional_notes** - TEXT - Optional supplementary context
  - Required: No
  - Business meaning: Extra information that doesn't fit in reason field
  - Example: "Corrective action: Reviewed temperature settings with kitchen staff, implemented 15-minute temperature checks"

**Responsible Party**:

- **responsible_party_id** - UUID - Foreign key to users table (optional)
  - Required: No (NULL if not assigned to specific person)
  - Business meaning: Staff member responsible for wastage (not punitive, for training identification)
  - Constraint: Must reference active user assigned to location
  - Privacy note: Used for coaching and training, not disciplinary action
  - Example: 550e8400-e29b-41d4-a716-446655440050 (Chef Daniel)

**Supplier Quality Tracking**:

- **is_supplier_quality_issue** - BOOLEAN - Flag indicating supplier-related wastage
  - Required: Yes
  - Default: false
  - Business meaning: Marks wastage caused by supplier quality problems (damaged goods, short shelf life, wrong product)
  - Drives supplier performance reporting

- **supplier_id** - UUID - Foreign key to vendors table (optional)
  - Required: Only if is_supplier_quality_issue = true
  - Business meaning: Vendor who supplied the defective product
  - Example: 550e8400-e29b-41d4-a716-446655440100

- **quality_issue_type** - VARCHAR(100) - Type of quality problem
  - Required: Only if is_supplier_quality_issue = true
  - Allowed values: 'incorrect_specification', 'damaged_in_transit', 'short_shelf_life', 'poor_freshness', 'wrong_product', 'contamination', 'packaging_defect', 'other'
  - Example: damaged_in_transit, poor_freshness

- **grn_reference** - VARCHAR(50) - Goods Receipt Note number for traceability
  - Required: No
  - Business meaning: Links wastage to specific delivery for supplier complaint and return
  - Example: GRN-2501-0110-0015

**Financial Fields**:

- **total_value** - DECIMAL(15,2) - Total wastage value in transaction currency
  - Required: Yes
  - Validation: Must be >= 0 (non-negative)
  - Business meaning: Sum of all line item values (quantity × unit cost)
  - Precision: 2 decimal places for currency accuracy
  - Example values: 31.25, 125.00, 0.50

- **currency** - VARCHAR(3) - ISO 4217 currency code
  - Required: Yes
  - Default: 'USD' (or location's default currency)
  - Validation: Must be valid ISO currency code
  - Example values: USD, EUR, GBP, CAD

**Status and Workflow**:

- **doc_status** - VARCHAR(50) - Current status in approval workflow
  - Required: Yes
  - Default: 'draft'
  - Allowed values: 'draft', 'pending_approval', 'approved', 'partially_approved', 'rejected', 'cancelled'
  - Status transitions:
    - draft → pending_approval (user submits)
    - pending_approval → approved (approver approves)
    - pending_approval → partially_approved (partial quantity approved)
    - pending_approval → rejected (approver rejects)
    - draft → cancelled (user cancels before submission)
    - pending_approval → cancelled (user withdraws submission)
  - Immutability: Cannot change status from 'approved' once inventory adjusted (prevent tampering)

- **approval_level_required** - INTEGER - Number of approval levels required based on value
  - Required: Yes
  - Default: Calculated based on total_value and configuration thresholds
  - Range: 0 (auto-approve) to 3 (multi-level approval)
  - Business rule: 0 = auto-approved, 1 = Department Manager, 2 = Store Manager, 3 = Finance Manager
  - Example: Value $450 requires 2 levels (Store Manager + Finance Manager)

- **current_approval_level** - INTEGER - Current approval level reached
  - Required: Yes
  - Default: 0
  - Business meaning: Tracks progress through approval workflow (increments as each level approves)
  - Example: Level 1 complete, awaiting Level 2 approval = current_approval_level = 1

- **is_auto_approved** - BOOLEAN - Whether automatically approved by system rules
  - Required: Yes
  - Default: false
  - Business meaning: True if auto-approved (e.g., expired items within 24 hours of expiry)
  - Audit purpose: Distinguish human-approved from rule-based approvals

**Batch Transaction**:

- **is_batch** - BOOLEAN - Whether this is batch wastage with multiple line items
  - Required: Yes
  - Default: false
  - Business meaning: True if recording multiple products in single transaction
  - UI impact: Batch wastage shows line item table instead of single product form

- **batch_context** - TEXT - Context for batch wastage (optional)
  - Required: No
  - Example: "End of day buffet wastage", "Weekly expired items cleanup"
  - Business meaning: Provides context for why multiple items recorded together

**Integration Status**:

- **inventory_adjusted** - BOOLEAN - Whether inventory has been adjusted
  - Required: Yes
  - Default: false
  - Business meaning: True once inventory adjustment transaction created (prevents duplicate adjustments)
  - Set to true automatically when status changes to 'approved'

- **inventory_adjustment_id** - UUID - Link to inventory adjustment transaction
  - Required: No (NULL until adjustment created)
  - Business meaning: Foreign key to inventory_transactions table for traceability
  - Enables drill-down from wastage to inventory impact

- **gl_posted** - BOOLEAN - Whether posted to General Ledger
  - Required: Yes
  - Default: false
  - Business meaning: True once GL journal entry created for wastage expense
  - May be async (queued for batch posting)

- **gl_journal_entry_id** - UUID - Link to GL journal entry
  - Required: No (NULL until posted)
  - Business meaning: Foreign key to gl_journal_entries table
  - Enables drill-down from wastage to financial posting

**Optimistic Locking**:

- **doc_version** - INTEGER - Version number for optimistic locking
  - Required: Yes
  - Default: 1
  - Business meaning: Incremented on each update to detect concurrent modifications
  - Update logic: WHERE id = ? AND doc_version = ? prevents lost updates

**Metadata**:

- **metadata** - JSONB - Flexible additional data
  - Required: No
  - Default: {}
  - Common JSON keys:
    - `approval_escalated`: boolean - whether approval escalated due to timeout
    - `anomaly_detected`: boolean - whether statistical anomaly detected
    - `anomaly_reason`: string - explanation of anomaly
    - `seasonal_context`: string - seasonal factors (e.g., "holiday_season", "summer_heat")
    - `corrective_action`: string - actions taken to prevent recurrence
  - Example: `{"anomaly_detected": true, "anomaly_reason": "Value 3.2× above 90-day average", "corrective_action": "Reviewed supplier quality with purchasing team"}`

**Audit Fields** (Standard for all entities):

- **created_date** - TIMESTAMPTZ - Record creation timestamp (UTC)
  - Required: Yes
  - Default: NOW()
  - Immutable: Cannot be changed after creation
  - Example: 2025-01-12T14:23:45.678Z

- **created_by** - UUID - User who created the record (foreign key to users)
  - Required: Yes
  - Constraint: Must reference existing user
  - Business meaning: Original submitter for accountability
  - Example: 550e8400-e29b-41d4-a716-446655440020 (Chef Daniel)

- **updated_date** - TIMESTAMPTZ - Last modification timestamp (UTC)
  - Required: Yes
  - Default: NOW()
  - Auto-updated: Database trigger updates on every change
  - Example: 2025-01-12T15:10:23.456Z

- **updated_by** - UUID - User who last modified the record
  - Required: Yes
  - Business meaning: Tracks who made last change (could be approver, editor, system)
  - Example: 550e8400-e29b-41d4-a716-446655440030 (Store Manager Maria)

- **deleted_at** - TIMESTAMPTZ - Soft delete timestamp
  - Required: No
  - Default: NULL
  - Business meaning: NULL for active records, timestamp for soft-deleted records
  - Soft-deleted records excluded from normal queries but retained for audit

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key, unique identifier | 550e8400-e29b... | PRIMARY KEY, NOT NULL |
| wastage_number | VARCHAR(20) | Yes | Auto-generated | Human-readable wastage number | WST-2501-0112-0023 | UNIQUE (where deleted_at IS NULL) |
| wastage_date | DATE | Yes | - | Date wastage occurred | 2025-01-12 | NOT NULL, <= CURRENT_DATE |
| wastage_time | TIME | Yes | CURRENT_TIME | Time wastage occurred | 14:30:00 | NOT NULL |
| location_id | UUID | Yes | - | Location where wastage occurred | 550e8400-... | FK locations(id), NOT NULL |
| department_id | UUID | Yes | - | Department within location | 550e8400-... | FK departments(id), NOT NULL |
| wastage_category | VARCHAR(50) | Yes | - | Primary wastage category | preparation_error | NOT NULL, CHECK (valid values) |
| subcategory | VARCHAR(100) | No | NULL | Sub-classification | overcooked | - |
| reason | TEXT | Yes | - | Detailed explanation | "Salmon overcooked..." | NOT NULL, LENGTH >= 20 |
| additional_notes | TEXT | No | NULL | Optional supplementary context | "Corrective action..." | - |
| responsible_party_id | UUID | No | NULL | Staff member responsible | 550e8400-... | FK users(id) |
| is_supplier_quality_issue | BOOLEAN | Yes | false | Supplier quality flag | true, false | NOT NULL |
| supplier_id | UUID | No | NULL | Vendor reference | 550e8400-... | FK vendors(id) |
| quality_issue_type | VARCHAR(100) | No | NULL | Type of quality problem | damaged_in_transit | Required if is_supplier_quality_issue |
| grn_reference | VARCHAR(50) | No | NULL | Goods receipt note number | GRN-2501-0110-0015 | - |
| total_value | DECIMAL(15,2) | Yes | 0.00 | Total wastage value | 31.25, 125.00 | NOT NULL, >= 0 |
| currency | VARCHAR(3) | Yes | 'USD' | ISO currency code | USD, EUR, GBP | NOT NULL, valid ISO code |
| doc_status | VARCHAR(50) | Yes | 'draft' | Current workflow status | pending_approval | NOT NULL, CHECK (valid values) |
| approval_level_required | INTEGER | Yes | Calculated | Required approval levels | 0, 1, 2, 3 | NOT NULL, >= 0, <= 3 |
| current_approval_level | INTEGER | Yes | 0 | Current approval level reached | 0, 1, 2 | NOT NULL, >= 0 |
| is_auto_approved | BOOLEAN | Yes | false | Auto-approved by rules | true, false | NOT NULL |
| is_batch | BOOLEAN | Yes | false | Batch wastage flag | true, false | NOT NULL |
| batch_context | TEXT | No | NULL | Batch context description | "End of day buffet" | - |
| inventory_adjusted | BOOLEAN | Yes | false | Inventory adjustment created | true, false | NOT NULL |
| inventory_adjustment_id | UUID | No | NULL | Link to inventory transaction | 550e8400-... | FK inventory_transactions(id) |
| gl_posted | BOOLEAN | Yes | false | GL posting completed | true, false | NOT NULL |
| gl_journal_entry_id | UUID | No | NULL | Link to GL entry | 550e8400-... | FK gl_journal_entries(id) |
| doc_version | INTEGER | Yes | 1 | Optimistic locking version | 1, 2, 3 | NOT NULL, >= 1 |
| metadata | JSONB | No | {} | Flexible additional data | {"anomaly_detected": true} | Valid JSON object |
| created_date | TIMESTAMPTZ | Yes | NOW() | Creation timestamp (UTC) | 2025-01-12T14:23:45Z | NOT NULL, immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | FK users(id), NOT NULL |
| updated_date | TIMESTAMPTZ | Yes | NOW() | Last update timestamp (UTC) | 2025-01-12T15:10:23Z | NOT NULL, auto-updated |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | FK users(id), NOT NULL |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL or timestamp | NULL for active records |

#### Data Constraints and Rules

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated using gen_random_uuid()
- Purpose: Uniquely identifies each wastage transaction across the system
- Immutable: Never changes after creation

**Unique Constraints**:
- `wastage_number`: Must be unique among non-deleted records (allows reuse after soft delete)
  - Format: WST-YYYY-MMDD-NNNN (e.g., WST-2501-0112-0023)
  - YYYY = 4-digit year, MMDD = 2-digit month and day, NNNN = 4-digit sequence
  - Sequence resets daily for manageable numbering
  - Unique constraint: CREATE UNIQUE INDEX idx_wastage_number_active ON wastage_headers(wastage_number) WHERE deleted_at IS NULL

**Foreign Key Relationships**:

- **Location** (`location_id` → `locations.id`)
  - On Delete: RESTRICT (cannot delete location with active wastage)
  - On Update: CASCADE
  - Business rule: Wastage belongs to location, must exist
  - Row-Level Security: Filter by user's accessible locations

- **Department** (`department_id` → `departments.id`)
  - On Delete: RESTRICT (cannot delete department with active wastage)
  - On Update: CASCADE
  - Business rule: Department must exist and belong to location

- **Responsible Party** (`responsible_party_id` → `users.id`)
  - On Delete: SET NULL (preserve wastage history if user deleted)
  - On Update: CASCADE
  - Business rule: Optional reference, NULL acceptable

- **Supplier** (`supplier_id` → `vendors.id`)
  - On Delete: SET NULL (preserve wastage history if vendor deleted)
  - On Update: CASCADE
  - Business rule: Required only if is_supplier_quality_issue = true

- **Creator** (`created_by` → `users.id`)
  - On Delete: SET NULL (preserve wastage history)
  - On Update: CASCADE
  - Business rule: Track original submitter

- **Updater** (`updated_by` → `users.id`)
  - On Delete: SET NULL (preserve audit trail)
  - On Update: CASCADE
  - Business rule: Track who modified record last

- **Inventory Adjustment** (`inventory_adjustment_id` → `inventory_transactions.id`)
  - On Delete: SET NULL (preserve reference attempt)
  - On Update: CASCADE
  - Business rule: Links to inventory module for traceability

- **GL Journal Entry** (`gl_journal_entry_id` → `gl_journal_entries.id`)
  - On Delete: SET NULL (preserve reference attempt)
  - On Update: CASCADE
  - Business rule: Links to finance module for traceability

**Check Constraints**:

- **Wastage Category Values**: `wastage_category` must be one of allowed values
  - Values: 'spoilage', 'overproduction', 'preparation_error', 'damaged', 'expired', 'customer_return', 'portion_control', 'quality_issue', 'contamination', 'equipment_failure', 'training_testing', 'sampling', 'other'
  - Constraint: CHECK (wastage_category IN (...))

- **Status Values**: `doc_status` must be one of allowed values
  - Values: 'draft', 'pending_approval', 'approved', 'partially_approved', 'rejected', 'cancelled'
  - Constraint: CHECK (doc_status IN (...))

- **Total Value Non-Negative**: `total_value` must be >= 0
  - Constraint: CHECK (total_value >= 0)
  - Business rule: Negative wastage not allowed

- **Date Validation**: `wastage_date` must be <= CURRENT_DATE
  - Constraint: CHECK (wastage_date <= CURRENT_DATE)
  - Business rule: Cannot record future wastage

- **Approval Level Range**: `approval_level_required` must be between 0 and 3
  - Constraint: CHECK (approval_level_required >= 0 AND approval_level_required <= 3)

- **Supplier Quality Consistency**: If `is_supplier_quality_issue` = true, then `supplier_id` must be NOT NULL
  - Constraint: CHECK (is_supplier_quality_issue = false OR supplier_id IS NOT NULL)

- **Reason Minimum Length**: `reason` must be at least 20 characters
  - Constraint: CHECK (LENGTH(reason) >= 20)
  - Business rule: Ensure adequate detail

**Not Null Constraints**:
- Critical fields: id, wastage_number, wastage_date, wastage_time, location_id, department_id, wastage_category, reason, total_value, currency, doc_status
- Business justification: These fields are essential for identifying, categorizing, and processing wastage transactions

**Default Values**:
- `wastage_time`: CURRENT_TIME - Defaults to submission time if not specified
- `currency`: 'USD' - Default currency (or location's currency from configuration)
- `doc_status`: 'draft' - New records start in draft status
- `total_value`: 0.00 - Initialize to zero (calculated from line items)
- `approval_level_required`: Calculated based on total_value and thresholds
- `current_approval_level`: 0 - No approvals yet
- `is_auto_approved`: false
- `is_batch`: false
- `is_supplier_quality_issue`: false
- `inventory_adjusted`: false
- `gl_posted`: false
- `doc_version`: 1 - Initial version
- `metadata`: {} - Empty JSON object
- `created_date`, `updated_date`: NOW() - Automatic timestamps
- `deleted_at`: NULL - Active record by default

**Indexes** (for performance):
- PRIMARY KEY on `id` (clustered index)
- UNIQUE INDEX on `wastage_number` WHERE deleted_at IS NULL
- INDEX on `location_id, doc_status, wastage_date` (list queries)
- INDEX on `doc_status, current_approval_level` (approval queue)
- INDEX on `created_by, wastage_date` (user's wastage history)
- INDEX on `supplier_id, is_supplier_quality_issue` WHERE is_supplier_quality_issue = true (supplier quality reports)
- GIN INDEX on `metadata` (JSONB queries)

#### Sample Data Examples

**Example 1: Standard Preparation Error Wastage**
```
ID: 550e8400-e29b-41d4-a716-446655440001
Wastage Number: WST-2501-0112-0023
Date: 2025-01-12
Time: 14:30:00
Location: Restaurant A Downtown
Department: Kitchen
Category: preparation_error
Subcategory: overcooked
Reason: "Salmon overcooked during grill service, 3 portions affected due to temperature control issue. Grill temperature calibration scheduled for tomorrow morning."
Responsible Party: Chef Daniel
Total Value: $31.25 USD
Status: approved
Approval Level Required: 1
Current Approval Level: 1
Is Batch: false
Inventory Adjusted: true
GL Posted: true
Created: 2025-01-12T14:23:45Z by Chef Daniel
Approved: 2025-01-12T15:10:00Z by Store Manager Maria
```

**Example 2: High-Value Multi-Product Batch Wastage**
```
ID: 550e8400-e29b-41d4-a716-446655440002
Wastage Number: WST-2501-0112-0045
Date: 2025-01-12
Time: 21:45:00
Location: Hotel Grand Restaurant
Department: Kitchen
Category: overproduction
Subcategory: buffet_excess
Reason: "End of day Sunday buffet wastage. Production quantities exceeded actual customer count by 30%. Adjusting forecasting model based on winter season patterns."
Batch Context: "Sunday dinner buffet cleanup"
Total Value: $450.00 USD
Status: approved
Approval Level Required: 2 (Store Manager + Finance Manager)
Current Approval Level: 2
Is Batch: true (3 line items: Beef Ribeye, Salmon, Pasta)
Inventory Adjusted: true
Metadata: {"seasonal_context": "winter_low_occupancy", "corrective_action": "Updated forecasting model with 20% reduction for winter Sundays"}
Created: 2025-01-12T21:50:00Z by Chef Sarah
Approved Level 1: 2025-01-13T08:15:00Z by Store Manager Maria
Approved Level 2: 2025-01-13T10:30:00Z by Finance Manager Frank
```

**Example 3: Supplier Quality Issue Wastage**
```
ID: 550e8400-e29b-41d4-a716-446655440003
Wastage Number: WST-2501-0113-0007
Date: 2025-01-13
Time: 09:15:00
Location: Restaurant B Harbor
Department: Kitchen
Category: quality_issue
Reason: "Entire shipment of fresh salmon received this morning showing signs of temperature abuse in transit. Product temperature was 45°F on arrival (should be 38°F). Fish has compromised texture and off odor. All 20 kg rejected."
Is Supplier Quality Issue: true
Supplier: ABC Seafood Suppliers (Vendor-123)
Quality Issue Type: damaged_in_transit
GRN Reference: GRN-2501-0113-0005
Total Value: $250.00 USD
Status: approved
Photos: 3 photos attached showing product condition and thermometer reading
Created: 2025-01-13T09:20:00Z by Receiving Manager Robert
Approved: 2025-01-13T09:45:00Z by Store Manager Maria
Notes: "Supplier complaint filed. Requesting credit memo and replacement shipment with proper cold chain documentation."
```

**Example 4: Auto-Approved Expired Items**
```
ID: 550e8400-e29b-41d4-a716-446655440004
Wastage Number: WST-2501-0114-0012
Date: 2025-01-14
Time: 07:30:00
Location: Restaurant A Downtown
Department: Kitchen
Category: expired
Reason: "Daily expired items check - Fresh milk past best-by date (expired 2025-01-13). Product stored properly but reached expiration overnight. Disposed according to FIFO protocol."
Total Value: $12.50 USD
Status: approved
Approval Level Required: 0 (auto-approved)
Is Auto Approved: true
Inventory Adjusted: true
Created: 2025-01-14T07:35:00Z by Kitchen Supervisor Tom
Auto-Approved: 2025-01-14T07:35:05Z by System (expired items rule)
Notes: "Auto-approved per policy: expired items within 24 hours of expiry date and value <$50"
```

**Example 5: Rejected Wastage (Insufficient Documentation)**
```
ID: 550e8400-e29b-41d4-a716-446655440005
Wastage Number: WST-2501-0114-0018
Date: 2025-01-14
Time: 16:20:00
Location: Restaurant A Downtown
Department: Kitchen
Category: preparation_error
Subcategory: dropped
Reason: "Dropped meat on floor" (only 20 characters - minimum required)
Responsible Party: Chef Daniel
Total Value: $125.00 USD (5 kg Beef Ribeye)
Status: rejected
Rejection Reason: "Insufficient documentation. Photo does not clearly show wasted product. Please resubmit with: 1) Clear photos showing damage, 2) Detailed explanation of how dropping occurred, 3) Steps taken to prevent recurrence."
Photos: 1 photo (shows floor but not meat clearly)
Created: 2025-01-14T16:25:00Z by Chef Daniel
Rejected: 2025-01-14T17:10:00Z by Store Manager Maria
Notes: "Resubmit with better documentation for approval"
```

---

### Entity: wastage_line_items

**Description**: Represents individual products wasted within a wastage transaction. Supports both single-product wastage (one line item per transaction) and batch wastage (multiple line items per transaction). Each line item tracks specific product, quantity, cost, and independent approval status for partial approval scenarios.

**Business Purpose**: Enables granular tracking of what products were wasted, supporting detailed analytics by product, category, and supplier. Allows partial approvals where only some line items are approved while others are rejected or reduced. Essential for inventory adjustment calculation and COGS reporting.

**Data Ownership**: Owned by parent wastage_headers record. Access controlled through parent's RLS policy (users can only see line items for wastage they can access).

**Access Pattern**: Always accessed via parent wastage_header (never queried independently). Fetched with parent using JOIN or Prisma include. Heavy aggregation for product-level wastage analytics (GROUP BY product_id).

**Data Volume**: Average 1.5 line items per wastage transaction (most are single-item, some batch). For 50,000 wastage/year: ~75,000 line items/year, 375,000 over 5 years. Requires proper indexing for product-level queries.

#### Fields Overview

**Primary Identification**:
- **ID Field**: `id` - UUID unique identifier
- **Parent Reference**: `wastage_header_id` - Links to parent wastage transaction
- **Display Name**: Product name combined with quantity (e.g., "Atlantic Salmon 2.5 kg")

**Parent Relationship**:
- **wastage_header_id** - UUID - Foreign key to wastage_headers
  - Required: Yes
  - Cascade: DELETE CASCADE (deleting header deletes all line items)
  - Business meaning: Line item belongs to specific wastage transaction

- **line_number** - INTEGER - Sequence number within transaction
  - Required: Yes
  - Business meaning: Display order of line items (1, 2, 3...)
  - Unique within parent: Composite unique constraint (wastage_header_id, line_number)

**Product Information**:
- **product_id** - UUID - Foreign key to products table
  - Required: Yes
  - Constraint: Must reference existing active product
  - Business meaning: Product that was wasted

- **product_code** - VARCHAR(50) - Snapshot of product code at wastage time
  - Required: Yes
  - Business meaning: Preserves product code even if product later deleted or code changed

- **product_name** - VARCHAR(255) - Snapshot of product name
  - Required: Yes
  - Business meaning: Display name for historical record integrity

- **product_category** - VARCHAR(100) - Product category for reporting
  - Required: Yes
  - Business meaning: Enables category-level wastage analysis

**Quantity Fields**:
- **quantity** - DECIMAL(12,3) - Wastage quantity in specified unit
  - Required: Yes
  - Precision: 3 decimal places (supports fractional quantities like 2.5 kg)
  - Validation: Must be > 0
  - Example: 2.5, 10.0, 0.25

- **unit_of_measure** - VARCHAR(20) - Unit (kg, liters, portions, ea, etc.)
  - Required: Yes
  - Business meaning: Specifies how quantity is measured
  - Example: kg, l, portions, ea, cases

- **base_quantity** - DECIMAL(12,3) - Converted to product's base unit (optional)
  - Required: No
  - Business meaning: Standardized quantity for cross-UOM reporting
  - Example: If UOM is "portions" and base is "kg", convert portions to kg

**Stock Tracking**:
- **stock_on_hand_before** - DECIMAL(12,3) - Stock before wastage recording
  - Required: Yes
  - Business meaning: Captures stock level for validation (wastage can't exceed stock)
  - Audit value: Helps detect inventory discrepancies

- **stock_on_hand_after** - DECIMAL(12,3) - Expected stock after adjustment
  - Required: Yes
  - Calculated: stock_on_hand_before - quantity
  - Validation: Must be >= 0 (no negative stock)

**Costing Fields**:
- **unit_cost** - DECIMAL(15,4) - Cost per unit at wastage time
  - Required: Yes
  - Precision: 4 decimal places for accuracy (especially for low-cost items)
  - Business meaning: Snapshot of product cost for valuation
  - Example: 12.5000 ($/kg), 0.2500 ($/portion)

- **total_value** - DECIMAL(15,2) - Line item total value
  - Required: Yes
  - Calculated: quantity × unit_cost
  - Precision: 2 decimal places for currency
  - Example: 31.25

- **costing_method** - VARCHAR(50) - Method used to determine unit_cost
  - Required: Yes
  - Allowed values: 'FIFO', 'LIFO', 'WeightedAverage', 'SpecificIdentification'
  - Business meaning: Documents how cost was calculated for audit

**Line-Specific Details**:
- **line_reason** - TEXT - Optional reason specific to this line item
  - Required: No
  - Business meaning: Additional detail beyond header-level reason
  - Example: "This portion burned while others overcooked"

- **line_photos** - JSONB - Array of photo URLs specific to this line
  - Required: No
  - Structure: Array of photo_id UUIDs
  - Business meaning: Photos can be associated with specific line items in batch wastage
  - Example: ['550e8400-...', '660e8400-...']

**Expiry Tracking** (for expired items):
- **expiry_date** - DATE - Product expiry date (if applicable)
  - Required: Only for category 'expired'
  - Business meaning: Documents when product expired for FIFO compliance

- **days_past_expiry** - INTEGER - Days past expiry date at wastage time
  - Required: No
  - Calculated: wastage_date - expiry_date
  - Business meaning: Measures how quickly expired items are removed

**Approval Fields** (for partial approval support):
- **approved_quantity** - DECIMAL(12,3) - Quantity approved (if different from original)
  - Required: No (NULL means full quantity approved)
  - Business meaning: Supports partial approval (approver reduces quantity)
  - Example: Original 2.5 kg, approved 2.0 kg, rejected 0.5 kg

- **rejected_quantity** - DECIMAL(12,3) - Quantity not approved
  - Required: No
  - Calculated: quantity - approved_quantity
  - Business meaning: Documents rejected portion for resubmission

- **line_status** - VARCHAR(50) - Line item approval status
  - Required: Yes
  - Default: 'pending'
  - Allowed values: 'pending', 'approved', 'partially_approved', 'rejected'
  - Business meaning: Independent status allows partial approval of batch transactions

**Audit Fields**:
- Standard audit fields: created_date, created_by, updated_date, updated_by
- Same pattern as wastage_headers
- Line items inherit parent's created_by typically

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key | 550e8400-... | PRIMARY KEY, NOT NULL |
| wastage_header_id | UUID | Yes | - | Parent wastage transaction | 550e8400-... | FK wastage_headers(id) CASCADE, NOT NULL |
| line_number | INTEGER | Yes | - | Sequence number | 1, 2, 3 | NOT NULL, >= 1, UNIQUE with wastage_header_id |
| product_id | UUID | Yes | - | Product reference | 550e8400-... | FK products(id) RESTRICT, NOT NULL |
| product_code | VARCHAR(50) | Yes | - | Product code snapshot | SALM-ATL-001 | NOT NULL |
| product_name | VARCHAR(255) | Yes | - | Product name snapshot | Atlantic Salmon Fillet | NOT NULL |
| product_category | VARCHAR(100) | Yes | - | Product category | Seafood | NOT NULL |
| quantity | DECIMAL(12,3) | Yes | - | Wastage quantity | 2.500, 10.000 | NOT NULL, > 0 |
| unit_of_measure | VARCHAR(20) | Yes | - | Unit | kg, l, portions, ea | NOT NULL |
| base_quantity | DECIMAL(12,3) | No | NULL | Converted to base unit | 2.500 | >= 0 |
| stock_on_hand_before | DECIMAL(12,3) | Yes | - | Stock before wastage | 25.000 | NOT NULL, >= 0 |
| stock_on_hand_after | DECIMAL(12,3) | Yes | - | Expected stock after | 22.500 | NOT NULL, >= 0 |
| unit_cost | DECIMAL(15,4) | Yes | - | Cost per unit | 12.5000 | NOT NULL, >= 0 |
| total_value | DECIMAL(15,2) | Yes | - | Line item value | 31.25 | NOT NULL, >= 0 |
| costing_method | VARCHAR(50) | Yes | - | Costing method | FIFO, WeightedAverage | NOT NULL, CHECK (valid values) |
| line_reason | TEXT | No | NULL | Line-specific reason | "This portion burned" | - |
| line_photos | JSONB | No | [] | Photo IDs array | ['550e8400-...'] | Valid JSON array |
| expiry_date | DATE | No | NULL | Product expiry date | 2025-01-13 | - |
| days_past_expiry | INTEGER | No | NULL | Days past expiry | 1, 5, -2 (before expiry) | - |
| approved_quantity | DECIMAL(12,3) | No | NULL | Approved quantity | 2.000 | >= 0, <= quantity |
| rejected_quantity | DECIMAL(12,3) | No | NULL | Rejected quantity | 0.500 | >= 0, <= quantity |
| line_status | VARCHAR(50) | Yes | 'pending' | Line approval status | approved, rejected | NOT NULL, CHECK (valid values) |
| created_date | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-12T14:23:45Z | NOT NULL |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | FK users(id), NOT NULL |
| updated_date | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-01-12T15:10:23Z | NOT NULL |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | FK users(id), NOT NULL |

#### Data Constraints and Rules

**Primary Key**: `id` (UUID)

**Foreign Keys**:
- `wastage_header_id` → `wastage_headers.id`: CASCADE on delete (delete line items when header deleted)
- `product_id` → `products.id`: RESTRICT on delete (cannot delete product with wastage history)
- `created_by`, `updated_by` → `users.id`: SET NULL on delete

**Unique Constraints**:
- Composite: (wastage_header_id, line_number) must be unique
- Ensures line numbers are sequential and unique within parent transaction

**Check Constraints**:
- `quantity` > 0
- `total_value` >= 0
- `unit_cost` >= 0
- `stock_on_hand_before` >= 0
- `stock_on_hand_after` >= 0
- `approved_quantity` <= `quantity` (if not NULL)
- `rejected_quantity` <= `quantity` (if not NULL)
- `line_status` IN ('pending', 'approved', 'partially_approved', 'rejected')
- `costing_method` IN ('FIFO', 'LIFO', 'WeightedAverage', 'SpecificIdentification')

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `wastage_header_id` (JOIN with parent)
- INDEX on `product_id` (product-level aggregation)
- INDEX on `line_status` (filtering by status)

---

### Entity: wastage_photos

**Description**: Stores metadata for photo evidence attached to wastage transactions. Actual photo files are stored in Supabase Storage, this table contains file paths, signed URLs, captions, capture metadata (device, timestamp, GPS if available), and watermark information. Photos provide visual proof of wastage for verification, fraud prevention, and training purposes.

**Business Purpose**: Mandatory photo evidence for high-value wastage (>$100) and recommended for all wastage. Enables visual verification by approvers reducing fraud and supporting disputes. Photos with timestamps and watermarks provide tamper-proof documentation for audits. Storage of capture metadata (device, location) helps identify patterns and authenticate submissions.

**Data Ownership**: Owned by parent wastage_headers record. Photos can be associated with specific line items in batch wastage scenarios. Access controlled through parent's RLS policy plus signed URL expiration for security.

**Access Pattern**: Fetched with parent wastage using JOIN or Prisma include. Individual photo access via signed URLs (expires after 1 hour). Bulk operations for watermarking and thumbnail generation during upload. Rarely queried independently except for storage cleanup jobs.

**Data Volume**: Average 1.2 photos per wastage transaction (40% have no photos, 40% have 1 photo, 20% have 2-5 photos). For 50,000 wastage/year: ~60,000 photos/year, 300,000 over 5 years at average 2MB per photo = 600GB storage.

#### Fields Overview

**Primary Identification**:
- **ID Field**: `id` - UUID unique identifier
- **Parent Reference**: `wastage_header_id` - Links to parent wastage transaction
- **Display Name**: Photo caption or "Photo {sequence}" (e.g., "Photo 1 of 3")

**Parent Relationships**:
- **wastage_header_id** - UUID - Foreign key to wastage_headers
  - Required: Yes
  - Cascade: DELETE CASCADE (deleting header soft-deletes photos)
  - Business meaning: Photo belongs to specific wastage transaction

- **wastage_line_item_id** - UUID - Foreign key to wastage_line_items (optional)
  - Required: No
  - Business meaning: Associates photo with specific line item in batch wastage
  - Example: In 3-item batch wastage, 2 photos show salmon (line 1), 1 photo shows beef (line 2)

- **photo_sequence** - INTEGER - Display order within transaction
  - Required: Yes
  - Business meaning: Order photos should be displayed (1, 2, 3...)
  - Example: Primary photo showing overall waste = sequence 1, detail photos = 2, 3

**File Storage**:
- **storage_bucket** - VARCHAR(100) - Supabase Storage bucket name
  - Required: Yes
  - Default: 'wastage-photos' (or environment-specific: 'wastage-photos-prod', 'wastage-photos-dev')
  - Business meaning: Isolates wastage photos from other uploads

- **storage_path** - VARCHAR(500) - Full path within bucket
  - Required: Yes
  - Format: `{location_id}/{year}/{month}/{wastage_number}/{photo_id}.{ext}`
  - Example: `550e8400-e29b/2025/01/WST-2501-0112-0023/photo-001.jpg`
  - Business meaning: Organized storage structure for efficient retrieval and cleanup

- **file_name** - VARCHAR(255) - Original file name from upload
  - Required: Yes
  - Business meaning: Preserves original name for user reference
  - Example: IMG_20250112_143045.jpg, wastage_salmon_overcooked.jpg

- **file_size** - INTEGER - File size in bytes
  - Required: Yes
  - Business meaning: Track storage usage and enforce upload limits
  - Validation: Maximum 10MB (10485760 bytes) per photo
  - Example: 2457600 (2.4 MB)

- **mime_type** - VARCHAR(100) - MIME type
  - Required: Yes
  - Allowed values: 'image/jpeg', 'image/png', 'image/heic', 'image/webp'
  - Business meaning: Determines how browser displays image
  - Example: image/jpeg

- **file_extension** - VARCHAR(10) - File extension
  - Required: Yes
  - Derived from mime_type or original filename
  - Example: jpg, png, heic

**Image Dimensions**:
- **width** - INTEGER - Image width in pixels
  - Required: Yes
  - Business meaning: Original image dimensions for display calculations
  - Example: 4032 (typical smartphone photo width)

- **height** - INTEGER - Image height in pixels
  - Required: Yes
  - Example: 3024 (typical smartphone photo height)

- **thumbnail_width** - INTEGER - Thumbnail width in pixels
  - Required: No
  - Default: 300
  - Business meaning: Generated thumbnail for list views

- **thumbnail_height** - INTEGER - Thumbnail height in pixels
  - Required: No
  - Default: Calculated maintaining aspect ratio

**Access URLs**:
- **signed_url** - TEXT - Temporary signed URL for secure access
  - Required: No (generated on-demand, not stored)
  - Business meaning: Time-limited URL (1 hour) preventing unauthorized access
  - Security: Includes signature preventing URL tampering
  - Example: https://storage.supabase.co/wastage-photos/...?token=abc123&expires=1705072800

- **public_url** - TEXT - Public URL (if bucket is public)
  - Required: No (only for public buckets, wastage photos are private)
  - Business meaning: Direct access URL without authentication

**Photo Content**:
- **caption** - VARCHAR(500) - Optional user-provided caption
  - Required: No
  - Business meaning: Describes what photo shows
  - Example: "Overcooked salmon portions showing dark charring on surface", "Temperature gauge showing incorrect setting"

- **description** - TEXT - Optional detailed description
  - Required: No
  - Business meaning: Extended context about photo
  - Example: "Photo taken immediately after wastage incident. Shows 3 portions of Atlantic Salmon with excessive charring on presentation side. Grill marks indicate temperature exceeded safe range."

**Capture Metadata**:
- **captured_at** - TIMESTAMPTZ - When photo was taken (from EXIF if available)
  - Required: Yes
  - Default: upload_timestamp if EXIF not available
  - Business meaning: Documents timing of photo capture for authenticity
  - Validation: Should be within 24 hours of wastage_date (warning if older)
  - Example: 2025-01-12T14:25:30Z

- **device_info** - JSONB - Device information from EXIF/browser
  - Required: No
  - Common JSON keys:
    - `make`: string - Camera/phone manufacturer (e.g., "Apple")
    - `model`: string - Device model (e.g., "iPhone 13 Pro")
    - `os`: string - Operating system (e.g., "iOS 16.5")
    - `browser`: string - Browser info (e.g., "Safari 16.5")
  - Example: `{"make": "Apple", "model": "iPhone 13 Pro", "os": "iOS 16.5"}`

- **gps_latitude** - DECIMAL(10,8) - GPS latitude (if available)
  - Required: No
  - Business meaning: Photo location verification (should match location coordinates)
  - Privacy: Only stored if user grants location permission
  - Example: 40.7589880 (New York latitude)

- **gps_longitude** - DECIMAL(11,8) - GPS longitude (if available)
  - Required: No
  - Example: -73.9851740 (New York longitude)

- **gps_accuracy** - DECIMAL(8,2) - GPS accuracy in meters
  - Required: No
  - Business meaning: Confidence level of GPS coordinates
  - Example: 10.5 (accurate to 10.5 meters)

**Watermark Information**:
- **is_watermarked** - BOOLEAN - Whether watermark applied
  - Required: Yes
  - Default: true
  - Business meaning: Watermark prevents photo misuse and proves authenticity
  - Server-side watermarking using Sharp library

- **watermark_text** - VARCHAR(200) - Text embedded in watermark
  - Required: If is_watermarked = true
  - Format: "{Wastage Number} | {Location Name} | {Date} {Time}"
  - Example: "WST-2501-0112-0023 | Restaurant A Downtown | 2025-01-12 14:30"
  - Business meaning: Identifies source and prevents unauthorized use

- **watermark_position** - VARCHAR(50) - Watermark placement
  - Required: If is_watermarked = true
  - Allowed values: 'bottom_right', 'bottom_center', 'bottom_left', 'top_right', 'center'
  - Default: 'bottom_right'

**Processing Status**:
- **upload_status** - VARCHAR(50) - Upload processing status
  - Required: Yes
  - Default: 'pending'
  - Allowed values: 'pending', 'uploading', 'processing', 'completed', 'failed'
  - Business meaning: Track asynchronous upload pipeline
  - Status flow: pending → uploading → processing (watermark, thumbnail) → completed

- **processing_error** - TEXT - Error message if upload/processing failed
  - Required: No
  - Business meaning: Diagnostic information for failed uploads
  - Example: "Image compression failed: Invalid JPEG format"

**Audit Fields**:
- Standard audit fields: created_date, created_by, updated_date, updated_by, deleted_at
- Photos soft-deleted when parent wastage deleted (retain for audit period)
- Physical file deletion scheduled after retention period (90 days after soft delete)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key | 550e8400-... | PRIMARY KEY, NOT NULL |
| wastage_header_id | UUID | Yes | - | Parent wastage transaction | 550e8400-... | FK wastage_headers(id) CASCADE, NOT NULL |
| wastage_line_item_id | UUID | No | NULL | Specific line item | 550e8400-... | FK wastage_line_items(id) CASCADE |
| photo_sequence | INTEGER | Yes | - | Display order | 1, 2, 3 | NOT NULL, >= 1 |
| storage_bucket | VARCHAR(100) | Yes | 'wastage-photos' | Storage bucket name | wastage-photos-prod | NOT NULL |
| storage_path | VARCHAR(500) | Yes | - | File path in bucket | location/2025/01/... | NOT NULL, UNIQUE |
| file_name | VARCHAR(255) | Yes | - | Original filename | IMG_20250112.jpg | NOT NULL |
| file_size | INTEGER | Yes | - | File size in bytes | 2457600 | NOT NULL, > 0, <= 10485760 |
| mime_type | VARCHAR(100) | Yes | - | MIME type | image/jpeg | NOT NULL, CHECK (valid values) |
| file_extension | VARCHAR(10) | Yes | - | File extension | jpg, png | NOT NULL |
| width | INTEGER | Yes | - | Image width (pixels) | 4032 | NOT NULL, > 0 |
| height | INTEGER | Yes | - | Image height (pixels) | 3024 | NOT NULL, > 0 |
| thumbnail_width | INTEGER | No | 300 | Thumbnail width | 300 | > 0 |
| thumbnail_height | INTEGER | No | Calculated | Thumbnail height | 225 | > 0 |
| signed_url | TEXT | No | NULL | Temporary access URL | https://storage... | - |
| public_url | TEXT | No | NULL | Public URL (if applicable) | https://storage... | - |
| caption | VARCHAR(500) | No | NULL | User-provided caption | "Overcooked salmon..." | - |
| description | TEXT | No | NULL | Detailed description | "Photo taken..." | - |
| captured_at | TIMESTAMPTZ | Yes | NOW() | Photo capture time | 2025-01-12T14:25:30Z | NOT NULL |
| device_info | JSONB | No | {} | Device metadata | {"make": "Apple"} | Valid JSON object |
| gps_latitude | DECIMAL(10,8) | No | NULL | GPS latitude | 40.7589880 | Valid latitude range |
| gps_longitude | DECIMAL(11,8) | No | NULL | GPS longitude | -73.9851740 | Valid longitude range |
| gps_accuracy | DECIMAL(8,2) | No | NULL | GPS accuracy (meters) | 10.5 | >= 0 |
| is_watermarked | BOOLEAN | Yes | true | Watermark applied | true, false | NOT NULL |
| watermark_text | VARCHAR(200) | No | NULL | Watermark content | "WST-2501-0112..." | Required if is_watermarked |
| watermark_position | VARCHAR(50) | No | 'bottom_right' | Watermark placement | bottom_right | CHECK (valid values) |
| upload_status | VARCHAR(50) | Yes | 'pending' | Processing status | completed, failed | NOT NULL, CHECK (valid values) |
| processing_error | TEXT | No | NULL | Error message | "Compression failed" | - |
| created_date | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-12T14:26:00Z | NOT NULL |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | FK users(id), NOT NULL |
| updated_date | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-01-12T14:28:00Z | NOT NULL |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | FK users(id), NOT NULL |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL or timestamp | - |

#### Data Constraints and Rules

**Primary Key**: `id` (UUID)

**Foreign Keys**:
- `wastage_header_id` → `wastage_headers.id`: CASCADE on delete (soft-delete photos when header deleted)
- `wastage_line_item_id` → `wastage_line_items.id`: CASCADE on delete (optional association)
- `created_by`, `updated_by` → `users.id`: SET NULL on delete

**Unique Constraints**:
- `storage_path`: Must be unique (prevents duplicate file paths)
- Composite: (wastage_header_id, photo_sequence) should be unique for clean sequencing

**Check Constraints**:
- `file_size` > 0 AND `file_size` <= 10485760 (10MB max)
- `mime_type` IN ('image/jpeg', 'image/png', 'image/heic', 'image/webp')
- `upload_status` IN ('pending', 'uploading', 'processing', 'completed', 'failed')
- `watermark_position` IN ('bottom_right', 'bottom_center', 'bottom_left', 'top_right', 'center')
- `width` > 0 AND `height` > 0
- `photo_sequence` >= 1
- `gps_latitude` BETWEEN -90 AND 90 (if not NULL)
- `gps_longitude` BETWEEN -180 AND 180 (if not NULL)
- `is_watermarked` = false OR `watermark_text` IS NOT NULL

**Business Rules**:
- Maximum 5 photos per wastage transaction (enforced at application level)
- Photos required for wastage >$100 (enforced in wastage_headers validation)
- Photo retention: Keep for 90 days after soft delete, then physically purge
- Signed URLs expire after 1 hour (regenerated on-demand)
- Watermarking performed server-side before storage (prevents tampering)

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `storage_path`
- INDEX on `wastage_header_id` (JOIN with parent)
- INDEX on `wastage_line_item_id` (line item photos)
- INDEX on `upload_status` (processing queue queries)
- INDEX on `created_date` (cleanup jobs for old photos)

---

### Entity: wastage_approvals

**Description**: Records approval workflow history capturing each approval level action. Tracks approver identity, approval timestamp, action taken (approved/partially approved/rejected/escalated), comments, original and adjusted values, and approval authority. Supports multi-level approval workflows based on value thresholds with complete audit trail.

**Business Purpose**: Provides immutable audit trail of all approval decisions for compliance and accountability. Enables workflow tracking showing which levels completed and who is responsible. Supports partial approvals where approver reduces wastage value. Historical record for performance analysis and fraud detection.

**Data Ownership**: Owned by parent wastage_headers record. Each approval record belongs to specific approval level. Access controlled through parent's RLS policy plus approver visibility rules.

**Access Pattern**: Fetched with parent wastage for approval history display. Queried for "Pending My Approval" queue filtering by approver and approval_level. Analytics queries aggregate by approver for performance metrics. Append-only table (no updates, only inserts) for audit integrity.

**Data Volume**: Average 1.2 approval records per wastage (80% have 1 approval, 15% have 2 approvals, 5% have 3 approvals). For 50,000 wastage/year: ~60,000 approval records/year, 300,000 over 5 years. Manageable without partitioning.

#### Fields Overview

**Primary Identification**:
- **ID Field**: `id` - UUID unique identifier
- **Parent Reference**: `wastage_header_id` - Links to parent wastage transaction
- **Display Name**: "{Approver Name} - Level {N} - {Action}" (e.g., "Maria Johnson - Level 1 - Approved")

**Parent Relationship**:
- **wastage_header_id** - UUID - Foreign key to wastage_headers
  - Required: Yes
  - Cascade: DELETE CASCADE (deleting header removes approval history)
  - Business meaning: Approval belongs to specific wastage transaction

**Approval Level**:
- **approval_level** - INTEGER - Which approval level this record represents
  - Required: Yes
  - Range: 1 to 3
  - Business meaning: Level 1 = Department Manager, Level 2 = Store Manager, Level 3 = Finance Manager
  - Validation: approval_level <= parent wastage_header.approval_level_required
  - Example: 1, 2, 3

**Approver Information**:
- **approver_id** - UUID - Foreign key to users table
  - Required: Yes
  - Constraint: Must reference active user with appropriate approval authority
  - Business meaning: User who performed the approval action
  - Example: 550e8400-e29b-41d4-a716-446655440030 (Store Manager Maria)

- **approver_name** - VARCHAR(255) - Snapshot of approver name
  - Required: Yes
  - Business meaning: Preserves approver name even if user deleted or renamed
  - Example: "Maria Johnson"

- **approver_role** - VARCHAR(100) - Role/title at approval time
  - Required: Yes
  - Business meaning: Documents authority level (Store Manager, Finance Manager)
  - Example: "Store Manager", "Finance Manager"

- **approval_authority_limit** - DECIMAL(15,2) - Approver's value threshold
  - Required: Yes
  - Business meaning: Maximum value approver is authorized to approve
  - Validates approver has sufficient authority for wastage value
  - Example: 500.00 (Store Manager authorized up to $500)

**Approval Action**:
- **approval_action** - VARCHAR(50) - Action taken by approver
  - Required: Yes
  - Allowed values: 'approved', 'partially_approved', 'rejected', 'escalated', 'returned'
  - Business meaning:
    - approved: Full approval of wastage
    - partially_approved: Approved reduced value/quantity
    - rejected: Rejected wastage with reason
    - escalated: Forwarded to higher authority
    - returned: Sent back to submitter for revision
  - Example: approved, rejected

- **approval_date** - TIMESTAMPTZ - When approval action was taken
  - Required: Yes
  - Default: NOW()
  - Business meaning: Timestamp of decision for SLA tracking
  - Example: 2025-01-12T15:10:23Z

**Value Adjustments**:
- **original_value** - DECIMAL(15,2) - Total value submitted for approval
  - Required: Yes
  - Business meaning: Value before any approver adjustments
  - Example: 125.00

- **approved_value** - DECIMAL(15,2) - Value approved by this approver
  - Required: If action = 'approved' or 'partially_approved'
  - Business meaning: Value after approver adjustments (if any)
  - Validation: approved_value <= original_value
  - Example: 100.00 (reduced from 125.00)

- **rejected_value** - DECIMAL(15,2) - Value not approved
  - Required: If action = 'partially_approved' or 'rejected'
  - Calculated: original_value - approved_value
  - Business meaning: Portion of wastage not approved
  - Example: 25.00

- **adjustment_reason** - TEXT - Reason for value adjustment
  - Required: If approved_value != original_value
  - Business meaning: Explains why approver reduced value
  - Example: "Approved 4 kg instead of 5 kg. Only 4 kg clearly visible in photos. Resubmit additional 1 kg with better documentation."

**Comments and Justification**:
- **comments** - TEXT - Approver's comments
  - Required: Yes for rejected/escalated, Optional for approved
  - Minimum length: 20 characters for rejected actions
  - Business meaning: Documents decision rationale, guidance, or concerns
  - Example: "Approved. Photos clearly show overcooked condition. Recommend temperature calibration training for kitchen staff."

- **rejection_reason** - TEXT - Specific reason for rejection
  - Required: If action = 'rejected'
  - Business meaning: Structured explanation for rejection
  - Example: "Insufficient photo evidence. Please provide: 1) Clear photos of all wasted items, 2) Photo of temperature logs, 3) Incident report from shift supervisor."

- **escalation_reason** - TEXT - Reason for escalating to higher level
  - Required: If action = 'escalated'
  - Business meaning: Why approver forwarded to higher authority
  - Example: "Value exceeds my approval authority ($200 limit). Escalating to Finance Manager for review."

**Line Item Approvals** (for partial approval scenarios):
- **line_item_adjustments** - JSONB - Adjustments by line item
  - Required: No (NULL for full approval)
  - Structure: Array of objects with line_item_id, original_qty, approved_qty, reason
  - Business meaning: Documents which line items approved/adjusted/rejected in batch wastage
  - Example:
    ```json
    [
      {
        "line_item_id": "550e8400-...",
        "product_name": "Atlantic Salmon",
        "original_quantity": 2.5,
        "approved_quantity": 2.0,
        "rejected_quantity": 0.5,
        "reason": "Only 2 kg visible in photos"
      },
      {
        "line_item_id": "660e8400-...",
        "product_name": "Beef Ribeye",
        "original_quantity": 1.0,
        "approved_quantity": 1.0,
        "rejected_quantity": 0,
        "reason": "Fully approved"
      }
    ]
    ```

**Workflow Timing**:
- **time_to_approve_seconds** - INTEGER - Approval duration
  - Required: Yes
  - Calculated: approval_date - wastage submitted/previous approval date
  - Business meaning: Measures approval turnaround time for SLA monitoring
  - Example: 3600 (1 hour), 86400 (24 hours)

- **is_overdue** - BOOLEAN - Whether approval exceeded SLA
  - Required: Yes
  - Default: false
  - Business meaning: Flag approvals that exceeded configured timeframe
  - SLA: 24 hours for Level 1, 48 hours for Level 2, 72 hours for Level 3

**Notification Status**:
- **notified_at** - TIMESTAMPTZ - When approver was notified
  - Required: No
  - Business meaning: Timestamp of approval request notification
  - Tracks notification delivery for audit

- **reminder_sent_at** - TIMESTAMPTZ - When reminder was sent
  - Required: No
  - Business meaning: Tracks follow-up reminder for pending approvals
  - Example: Reminder sent after 18 hours if no response

**Delegation** (if approver delegates):
- **delegated_to_id** - UUID - User ID approval delegated to
  - Required: No
  - Business meaning: Tracks if approver delegated to another authorized user
  - Constraint: Must reference user with >= approval_authority_limit

- **delegation_reason** - TEXT - Reason for delegation
  - Required: If delegated_to_id is not NULL
  - Example: "Out of office - delegated to Assistant Manager John Smith"

**Metadata**:
- **metadata** - JSONB - Flexible additional data
  - Required: No
  - Common JSON keys:
    - `ip_address`: string - Approver's IP for security audit
    - `device_info`: object - Browser/device used for approval
    - `location_verified`: boolean - Whether GPS matched location
    - `approval_notes`: array - Additional structured notes
  - Example: `{"ip_address": "192.168.1.100", "device_info": {"browser": "Chrome 120", "os": "Windows 11"}}`

**Audit Fields**:
- Standard audit fields: created_date, created_by, updated_date, updated_by
- Approval records are immutable after creation (no updates allowed)
- created_by = approver_id typically
- Soft delete not used (approvals are permanent audit records)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key | 550e8400-... | PRIMARY KEY, NOT NULL |
| wastage_header_id | UUID | Yes | - | Parent wastage | 550e8400-... | FK wastage_headers(id) CASCADE, NOT NULL |
| approval_level | INTEGER | Yes | - | Approval level (1-3) | 1, 2, 3 | NOT NULL, >= 1, <= 3 |
| approver_id | UUID | Yes | - | Approver user | 550e8400-... | FK users(id), NOT NULL |
| approver_name | VARCHAR(255) | Yes | - | Approver name snapshot | Maria Johnson | NOT NULL |
| approver_role | VARCHAR(100) | Yes | - | Approver role/title | Store Manager | NOT NULL |
| approval_authority_limit | DECIMAL(15,2) | Yes | - | Approval threshold | 500.00 | NOT NULL, >= 0 |
| approval_action | VARCHAR(50) | Yes | - | Action taken | approved, rejected | NOT NULL, CHECK (valid values) |
| approval_date | TIMESTAMPTZ | Yes | NOW() | Action timestamp | 2025-01-12T15:10:23Z | NOT NULL |
| original_value | DECIMAL(15,2) | Yes | - | Original submitted value | 125.00 | NOT NULL, >= 0 |
| approved_value | DECIMAL(15,2) | No | NULL | Approved value | 100.00 | >= 0, <= original_value |
| rejected_value | DECIMAL(15,2) | No | NULL | Rejected value | 25.00 | >= 0, <= original_value |
| adjustment_reason | TEXT | No | NULL | Value adjustment reason | "Approved 4kg..." | Required if adjusted |
| comments | TEXT | No | NULL | Approver comments | "Approved. Photos..." | Required if rejected |
| rejection_reason | TEXT | No | NULL | Rejection explanation | "Insufficient..." | Required if rejected |
| escalation_reason | TEXT | No | NULL | Escalation explanation | "Exceeds authority" | Required if escalated |
| line_item_adjustments | JSONB | No | NULL | Line item changes | [{'line_item_id'...}] | Valid JSON array |
| time_to_approve_seconds | INTEGER | Yes | Calculated | Approval duration | 3600, 86400 | NOT NULL, >= 0 |
| is_overdue | BOOLEAN | Yes | false | SLA exceeded flag | true, false | NOT NULL |
| notified_at | TIMESTAMPTZ | No | NULL | Notification timestamp | 2025-01-12T14:30:00Z | - |
| reminder_sent_at | TIMESTAMPTZ | No | NULL | Reminder timestamp | 2025-01-13T08:30:00Z | - |
| delegated_to_id | UUID | No | NULL | Delegated approver | 550e8400-... | FK users(id) |
| delegation_reason | TEXT | No | NULL | Delegation explanation | "Out of office..." | Required if delegated |
| metadata | JSONB | No | {} | Additional data | {"ip_address": ...} | Valid JSON object |
| created_date | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-12T15:10:23Z | NOT NULL |
| created_by | UUID | Yes | - | Creator (approver) | 550e8400-... | FK users(id), NOT NULL |
| updated_date | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-01-12T15:10:23Z | NOT NULL |
| updated_by | UUID | Yes | - | Last modifier | 550e8400-... | FK users(id), NOT NULL |

#### Data Constraints and Rules

**Primary Key**: `id` (UUID)

**Foreign Keys**:
- `wastage_header_id` → `wastage_headers.id`: CASCADE on delete
- `approver_id` → `users.id`: SET NULL on delete (preserve approval history)
- `delegated_to_id` → `users.id`: SET NULL on delete
- `created_by`, `updated_by` → `users.id`: SET NULL on delete

**Unique Constraints**:
- Composite: (wastage_header_id, approval_level) should be unique (one approval per level)
  - Exception: Multiple records allowed if approval returned/resubmitted

**Check Constraints**:
- `approval_level` >= 1 AND `approval_level` <= 3
- `approval_action` IN ('approved', 'partially_approved', 'rejected', 'escalated', 'returned')
- `original_value` >= 0
- `approved_value` <= `original_value` (if not NULL)
- `rejected_value` <= `original_value` (if not NULL)
- `time_to_approve_seconds` >= 0
- `approval_authority_limit` >= 0
- `rejection_reason` IS NOT NULL if action = 'rejected'
- `escalation_reason` IS NOT NULL if action = 'escalated'
- `approved_value` IS NOT NULL if action IN ('approved', 'partially_approved')

**Business Rules**:
- Approval records are immutable (no updates after creation, only inserts)
- Approver cannot approve own wastage (enforced at application level)
- Approval authority must be >= wastage value for approval level
- Sequential approval: Level 2 requires Level 1 complete, Level 3 requires Level 2 complete
- SLA timeframes: L1=24h, L2=48h, L3=72h (configurable)

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `wastage_header_id` (approval history queries)
- INDEX on `approver_id, approval_date` (approver performance metrics)
- INDEX on `approval_level, approval_date` (level-based analytics)
- INDEX on `approval_action, approval_date` (action-based reporting)
- INDEX on `is_overdue` WHERE is_overdue = true (SLA monitoring)

---

### Entity: wastage_configuration

**Description**: System configuration for wastage reporting including approval thresholds, photo requirements, alert rules, active wastage categories, costing methods, and GL account mappings. Configuration can be global (applies to all locations) or location-specific for flexibility. Supports configuration versioning with effective dates.

**Business Purpose**: Centralized configuration management enabling business users to adjust thresholds and rules without code changes. Different locations can have different approval thresholds based on operational needs. Configuration history maintained for audit compliance showing when thresholds changed. Enables adaptive system behavior based on business requirements.

**Data Ownership**: Owned by Finance/Operations teams. Global configuration accessible to all, location-specific configuration filtered by RLS. Configuration changes logged in audit trail showing who changed what and when.

**Access Pattern**: Cached aggressively (configuration rarely changes). Loaded at application startup and cached for duration of server session. Invalidated when configuration updated. Queries filter by location_id and effective_date to get active configuration for specific location.

**Data Volume**: Minimal - typically 1 global configuration + 1 per location. For 50 locations: ~51 configuration records total. Version history grows slowly (1-2 versions per year per configuration = 50-100 versions over 5 years).

#### Fields Overview

**Primary Identification**:
- **ID Field**: `id` - UUID unique identifier
- **Business Key**: Composite of location_id (or NULL for global) and config_type
- **Display Name**: "{Config Type} - {Location Name or 'Global'}" (e.g., "Approval Thresholds - Restaurant A")

**Configuration Scope**:
- **location_id** - UUID - Foreign key to locations (NULL for global)
  - Required: No (NULL = global configuration)
  - Business meaning: Location-specific configuration overrides global
  - Example: 550e8400-e29b-41d4-a716-446655440001 or NULL

- **config_type** - VARCHAR(100) - Type of configuration
  - Required: Yes
  - Allowed values: 'approval_thresholds', 'photo_requirements', 'alert_rules', 'wastage_categories', 'gl_mappings', 'costing_methods', 'system_settings'
  - Business meaning: Categorizes configuration for organized management
  - Example: approval_thresholds

- **config_name** - VARCHAR(255) - Human-readable name
  - Required: Yes
  - Business meaning: Descriptive name for UI display
  - Example: "Standard Approval Thresholds", "Restaurant A Custom Thresholds"

**Version Control**:
- **version** - INTEGER - Configuration version number
  - Required: Yes
  - Default: 1
  - Business meaning: Tracks configuration changes over time
  - Increments on each update
  - Example: 1, 2, 3

- **effective_date** - DATE - When configuration becomes active
  - Required: Yes
  - Default: CURRENT_DATE
  - Business meaning: Supports scheduled configuration changes
  - Query pattern: WHERE effective_date <= CURRENT_DATE ORDER BY effective_date DESC LIMIT 1
  - Example: 2025-01-01 (new year thresholds)

- **expiry_date** - DATE - When configuration becomes inactive
  - Required: No (NULL = no expiration)
  - Business meaning: Automatic configuration retirement
  - Example: 2025-12-31 (year-end)

- **is_active** - BOOLEAN - Whether configuration currently active
  - Required: Yes
  - Default: true
  - Business meaning: Manual activation/deactivation override
  - Only one active configuration per (location_id, config_type) at a time

**Approval Threshold Configuration**:
- **approval_thresholds** - JSONB - Approval level thresholds
  - Required: If config_type = 'approval_thresholds'
  - Structure:
    ```json
    {
      "auto_approve_threshold": 50.00,
      "level_1_threshold": 200.00,
      "level_2_threshold": 500.00,
      "level_3_threshold": null,
      "currency": "USD",
      "auto_approve_rules": [
        {
          "category": "expired",
          "condition": "days_past_expiry <= 1",
          "max_value": 50.00,
          "description": "Auto-approve expired items within 24 hours"
        }
      ]
    }
    ```
  - Business meaning: Defines value thresholds for each approval level

**Photo Requirements Configuration**:
- **photo_requirements** - JSONB - Photo policy settings
  - Required: If config_type = 'photo_requirements'
  - Structure:
    ```json
    {
      "mandatory_threshold": 100.00,
      "recommended_threshold": 50.00,
      "minimum_photos": 1,
      "maximum_photos": 5,
      "watermark_enabled": true,
      "watermark_template": "{wastage_number} | {location_name} | {date}",
      "require_gps": false,
      "accepted_formats": ['jpg', 'png', 'heic'],
      "max_file_size_mb": 10
    }
    ```

**Alert Rules Configuration**:
- **alert_rules** - JSONB - Anomaly detection and alert thresholds
  - Required: If config_type = 'alert_rules'
  - Structure:
    ```json
    {
      "anomaly_threshold_multiplier": 3.0,
      "daily_value_alert": 500.00,
      "weekly_value_alert": 2000.00,
      "frequent_submitter_threshold": 5,
      "supplier_quality_alert_threshold": 3,
      "notification_recipients": [
        {'role': 'Store Manager', 'email': true, 'sms': false},
        {'role': 'Finance Manager', 'email': true, 'sms': true}
      ]
    }
    ```

**Wastage Categories Configuration**:
- **wastage_categories** - JSONB - Active categories and subcategories
  - Required: If config_type = 'wastage_categories'
  - Structure:
    ```json
    {
      "categories": [
        {
          "code": "preparation_error",
          "name": "Preparation Error",
          "active": true,
          "subcategories": ["overcooked", "undercooked", 'wrong_recipe', 'dropped', 'burned']
        },
        {
          "code": "spoilage",
          "name": "Spoilage",
          "active": true,
          "subcategories": ["temperature_abuse", 'expired', 'mold', 'oxidation']
        }
      ]
    }
    ```

**GL Mapping Configuration**:
- **gl_mappings** - JSONB - GL account mappings by category
  - Required: If config_type = 'gl_mappings'
  - Structure:
    ```json
    {
      "mappings": [
        {
          "wastage_category": "preparation_error",
          "gl_account": "5200-010",
          "account_name": "Food Cost - Wastage - Kitchen Error",
          "cost_center": "Kitchen"
        },
        {
          "wastage_category": "supplier_quality",
          "gl_account": "1500-025",
          "account_name": "Vendor Claims Receivable",
          "cost_center": "Procurement"
        }
      ]
    }
    ```

**System Settings Configuration**:
- **system_settings** - JSONB - General system behavior
  - Required: If config_type = 'system_settings'
  - Structure:
    ```json
    {
      "retention_days": 90,
      "auto_delete_photos_after_days": 90,
      "sla_hours_level_1": 24,
      "sla_hours_level_2": 48,
      "sla_hours_level_3": 72,
      "allow_backdated_days": 7,
      "require_reason_min_length": 20,
      "default_currency": "USD",
      "enable_gps_validation": false
    }
    ```

**Metadata**:
- **description** - TEXT - Configuration description/purpose
  - Required: No
  - Business meaning: Explains what configuration does and when to use
  - Example: "Standard approval thresholds for US locations. Higher thresholds than EMEA due to different labor costs."

- **change_notes** - TEXT - Notes about this version
  - Required: No
  - Business meaning: Documents what changed from previous version
  - Example: "Increased auto-approve threshold from $30 to $50 per CFO directive dated 2025-01-10"

- **metadata** - JSONB - Additional configuration data
  - Required: No
  - Business meaning: Flexible extension point for future configuration needs

**Audit Fields**:
- Standard audit fields: created_date, created_by, updated_date, updated_by
- No soft delete (configuration history retained permanently)
- created_by tracks who created this configuration version

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | gen_random_uuid() | Primary key | 550e8400-... | PRIMARY KEY, NOT NULL |
| location_id | UUID | No | NULL | Location (NULL=global) | 550e8400-... or NULL | FK locations(id) |
| config_type | VARCHAR(100) | Yes | - | Configuration type | approval_thresholds | NOT NULL, CHECK (valid values) |
| config_name | VARCHAR(255) | Yes | - | Configuration name | Standard Thresholds | NOT NULL |
| version | INTEGER | Yes | 1 | Version number | 1, 2, 3 | NOT NULL, >= 1 |
| effective_date | DATE | Yes | CURRENT_DATE | Effective date | 2025-01-01 | NOT NULL |
| expiry_date | DATE | No | NULL | Expiry date | 2025-12-31 or NULL | >= effective_date |
| is_active | BOOLEAN | Yes | true | Active status | true, false | NOT NULL |
| approval_thresholds | JSONB | No | NULL | Threshold config | {"auto_approve"...} | Valid JSON, required if config_type |
| photo_requirements | JSONB | No | NULL | Photo policy config | {"mandatory"...} | Valid JSON |
| alert_rules | JSONB | No | NULL | Alert config | {"anomaly"...} | Valid JSON |
| wastage_categories | JSONB | No | NULL | Category config | {"categories"...} | Valid JSON |
| gl_mappings | JSONB | No | NULL | GL mapping config | {"mappings"...} | Valid JSON |
| system_settings | JSONB | No | NULL | System settings | {"retention"...} | Valid JSON |
| description | TEXT | No | NULL | Config description | "Standard approval..." | - |
| change_notes | TEXT | No | NULL | Version change notes | "Increased threshold..." | - |
| metadata | JSONB | No | {} | Additional data | {} | Valid JSON object |
| created_date | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-12T10:00:00Z | NOT NULL |
| created_by | UUID | Yes | - | Creator user | 550e8400-... | FK users(id), NOT NULL |
| updated_date | TIMESTAMPTZ | Yes | NOW() | Update timestamp | 2025-01-12T10:00:00Z | NOT NULL |
| updated_by | UUID | Yes | - | Last modifier | 550e8400-... | FK users(id), NOT NULL |

#### Data Constraints and Rules

**Primary Key**: `id` (UUID)

**Foreign Keys**:
- `location_id` → `locations.id`: RESTRICT on delete (cannot delete location with configuration)
- `created_by`, `updated_by` → `users.id`: SET NULL on delete

**Unique Constraints**:
- Active configuration: Only one active configuration per (location_id, config_type) combination
  - Implemented: UNIQUE INDEX idx_active_config ON wastage_configuration(location_id, config_type) WHERE is_active = true
- Version uniqueness: (location_id, config_type, version) must be unique

**Check Constraints**:
- `config_type` IN ('approval_thresholds', 'photo_requirements', 'alert_rules', 'wastage_categories', 'gl_mappings', 'costing_methods', 'system_settings')
- `version` >= 1
- `effective_date` <= `expiry_date` (if expiry_date not NULL)
- Exactly one JSONB field must be NOT NULL based on config_type

**Business Rules**:
- Location-specific configuration overrides global configuration
- Only one active configuration per (location_id, config_type) at a time
- Effective date supports future configuration scheduling
- Version history retained permanently (no deletion)
- Configuration changes require Finance Manager or System Admin approval

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on (location_id, config_type) WHERE is_active = true
- INDEX on (location_id, config_type, effective_date) (lookup active config)
- INDEX on (config_type, is_active) (global config queries)
- INDEX on effective_date (scheduled config activation jobs)

---

## Summary

This Data Schema document defines the complete proposed database structure for the Wastage Reporting module consisting of five primary entities:

1. **wastage_headers** (27 fields) - Main wastage transaction records with workflow status and approvals
2. **wastage_line_items** (24 fields) - Individual products wasted supporting batch transactions and partial approvals
3. **wastage_photos** (34 fields) - Photo evidence metadata with watermarking and GPS tracking
4. **wastage_approvals** (28 fields) - Multi-level approval workflow history with complete audit trail
5. **wastage_configuration** (22 fields) - System configuration for thresholds, rules, and GL mappings

### Key Design Patterns Applied

- **UUID Primary Keys**: All entities use UUID with gen_random_uuid() for distributed system compatibility
- **Soft Delete**: wastage_headers and wastage_photos use deleted_at timestamp pattern
- **Audit Trail**: All entities have created_date, created_by, updated_date, updated_by fields
- **Row-Level Security**: Location-based access control at database level
- **Optimistic Locking**: wastage_headers uses doc_version for concurrent update detection
- **JSONB Metadata**: Flexible extension fields for evolving requirements
- **Cascade Behaviors**: Parent-child relationships use CASCADE, user references use SET NULL
- **Financial Precision**: DECIMAL(15,2) for currency, DECIMAL(15,4) for unit costs
- **Status-Driven Workflow**: doc_status and line_status fields control approval flow
- **Immutable Approvals**: wastage_approvals records are append-only for audit integrity

### Database Size Projections

- **5-Year Storage**: ~300,000 wastage headers, 450,000 line items, 360,000 photos, 360,000 approval records
- **Photo Storage**: ~600-700GB for 300,000 photos at 2MB average
- **Database Size**: ~5-10GB for transactional data (excluding photos)
- **Performance**: No partitioning required initially, proper indexing sufficient for query performance

### Integration Points

- **Inventory Management**: inventory_transactions table for stock adjustments
- **Finance Module**: gl_journal_entries table for expense posting
- **Vendor Management**: vendors table for supplier quality tracking
- **Product Management**: products table for product references
- **User Management**: users table for authentication and authorization
- **Supabase Storage**: Secure photo storage with signed URLs
- **Workflow Engine**: Multi-level approval routing based on value thresholds

**Next Steps**: This proposed schema requires review and approval before implementation. Upon approval, Prisma schema definitions will be created and migrations generated for database creation.
