# Data Definition: {Sub-Module Name}

## Module Information
- **Module**: {Module Name}
- **Sub-Module**: {Sub-Module Name}
- **Database**: {Database Name}
- **Schema Version**: 1.0.0
- **Last Updated**: {YYYY-MM-DD}
- **Owner**: {Team/Person Name}
- **Status**: Draft | Review | Approved | Deprecated

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | {YYYY-MM-DD} | {Author} | Initial version |

---

## Overview

{Brief description of the data model for this sub-module. What entities does it manage? What are the key relationships? What business processes does it support?}

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**
- **DO NOT include SQL code** - describe database structures in text
- **DO NOT include CREATE TABLE statements** - describe table purposes and fields
- **DO NOT include mermaid ERD diagrams** - describe relationships in text
- **DO include**: Entity descriptions, field definitions, relationship explanations, business rules
- **Focus on**: WHAT data is stored, WHY it exists, HOW it relates - all in descriptive text

---

## Core Schema Reference

**📋 CORE PATTERN**: All data definitions MUST align with the core Prisma schema located at:
- **Primary Schema**: `docs/app/data-struc/schema.prisma`

### Schema Alignment Rules

1. **Existing Tables/Fields**: If a table or field exists in the core schema, use the exact naming and data types defined there
2. **Proposed Additions**: Tables or fields NOT in the core schema must be marked as **🆕 PROPOSED**
3. **Proposed Modifications**: Changes to existing schema structures must be marked as **✏️ PROPOSED CHANGE**

### Proposed Entry Highlighting

Use the following markers to indicate schema alignment status:

| Marker | Meaning | Usage |
|--------|---------|-------|
| ✅ **CORE** | Exists in schema.prisma | Field/table already defined in core schema |
| 🆕 **PROPOSED** | New addition | Field/table NOT in core schema - requires schema migration |
| ✏️ **PROPOSED CHANGE** | Modification | Changes to existing core schema field/table |
| ⚠️ **DEPRECATED** | Marked for removal | Field/table scheduled for deprecation |

**Example Usage in Field Definitions**:

| Field Name | Data Type | Status | Description |
|-----------|-----------|--------|-------------|
| id | UUID | ✅ CORE | Primary key |
| name | VARCHAR(255) | ✅ CORE | Entity name |
| priority_score | INTEGER | 🆕 PROPOSED | New field for ranking - requires migration |
| status | VARCHAR(50) | ✏️ PROPOSED CHANGE | Adding new status value 'on_hold' |

---

**Related Documents**:
- [Business Requirements](./BR-template.md) - Requirements in text format (no code)
- [Technical Specification](./TS-template.md) - Implementation patterns in text format (no code)
- [Use Cases](./UC-template.md) - Use cases in text format (no code)
- [Flow Diagrams](./FD-template.md) - Visual diagrams with mermaid (ONLY place for diagrams)
- [Validations](./VAL-template.md) - Validation rules in text format (no code)

---

## Entity Relationship Overview

**Primary Entities**: List the main data entities in this sub-module
- **{Entity 1}**: {Brief description of what this entity represents}
- **{Entity 2}**: {Brief description of what this entity represents}
- **{Entity 3}**: {Brief description of what this entity represents}

**Key Relationships**:
1. **{Entity 1} → {Entity 2}**: One-to-Many relationship
   - Business meaning: {Explain why one Entity 1 can have multiple Entity 2 records}
   - Cardinality: One {Entity 1} has 0 to many {Entity 2} records
   - Example: One Purchase Request has many Line Items

2. **{Entity 2} ↔ {Entity 3}**: Many-to-Many relationship
   - Business meaning: {Explain the many-to-many relationship}
   - Junction entity: {Name of the junction table that connects them}
   - Example: Products can have multiple Vendors, Vendors can supply multiple Products

3. **{Entity 1} → {Same Entity}**: Hierarchical relationship (Self-referencing)
   - Business meaning: {Explain the hierarchy}
   - Example: Department can have sub-departments

**Relationship Notes**:
- {Explain relationship cardinality and business meaning}
- {Explain key business rules reflected in relationships}
- {Explain any special considerations or constraints}
- See [Flow Diagrams](./FD-template.md) for visual ERD diagrams if needed

---

## Data Entities

### Entity: {Entity Name}

**Schema Status**: ✅ CORE | 🆕 PROPOSED | ✏️ PROPOSED CHANGE
> If PROPOSED: Describe why this new entity is needed and its relationship to existing schema

**Description**: {What business entity or concept this represents - e.g., "Represents purchase requests submitted by department staff"}

**Business Purpose**: {Why this entity exists and what business process it supports}

**Data Ownership**: {Which department or role owns this data}

**Access Pattern**: {How this data is typically accessed - by ID, by status, by date range, by department, etc.}

**Data Volume**: {Expected data volume and growth - e.g., "~1000 records/month, 12K records/year"}

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID format, auto-generated)
- **Business Key**: {Natural/human-readable identifier if applicable - e.g., "PR-2401-001"}
- **Display Name**: {Primary field used for display purposes}

**Core Business Fields**:
- **Field 1**: {Field name} - {Data type} - {Purpose and business meaning}
  - Required: Yes/No
  - Unique: Yes/No
  - Example values: {Provide realistic examples}

- **Field 2**: {Field name} - {Data type} - {Purpose and business meaning}
  - Required: Yes/No
  - Default value: {If applicable}
  - Constraints: {Any validation rules or constraints}
  - Example values: {Provide realistic examples}

**Status and Workflow**:
- **Status Field**: {Field name} - Tracks entity lifecycle
  - Allowed values: {List all status values and their meanings}
  - Status transitions: {Describe valid status flows}
  - Default status: {Initial status for new records}

**Monetary Fields** (if applicable):
- **Amount Field**: {Field name} - Currency value (2 decimal precision)
  - Currency code field: {Associated currency field}
  - Base amount field: {Converted to base currency if multi-currency}
  - Validation: Must be positive/non-negative

**Date and Time Fields**:
- **Effective Date**: When the record becomes active or valid
- **Expiry Date**: When the record expires (if applicable)
- **Event Date**: {Other business-relevant dates}
- Note: All dates stored with timezone awareness (UTC)

**Relationship Fields**:
- **Parent Reference**: Links to {parent entity name}
  - Purpose: {Why this relationship exists}
  - Cascade behavior: {What happens when parent is deleted/updated}

- **User Reference**: Links to {user/department/location}
  - Purpose: {Ownership, creation, assignment, etc.}
  - Behavior: {What happens when user is deleted/deactivated}

**Flexible Data Fields**:
- **Metadata**: Stores additional flexible information as JSON
  - Common attributes: {List typical JSON keys and their purposes}
  - Use cases: {When and why metadata is used}

- **Settings/Preferences**: Configuration data specific to this entity
  - Structure: {Describe expected JSON structure}

**Audit Fields** (Standard for all entities):
- **Created At**: Timestamp when record was created (UTC, immutable)
- **Created By**: User who created the record (UUID reference)
- **Updated At**: Timestamp of last modification (UTC, auto-updated)
- **Updated By**: User who last modified the record (UUID reference)
- **Deleted At**: Soft delete timestamp (NULL for active records)

#### Field Definitions Table

**Note**: The **Schema Status** column indicates alignment with `docs/app/data-struc/schema.prisma`

| Field Name | Data Type | Schema Status | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|---------------|----------|---------|-------------|----------------|-------------|
| id | UUID | ✅ CORE | Yes | Auto-generated | Primary key, unique identifier | 550e8400-... | Unique, Non-null |
| {business_key} | VARCHAR(100) | ✅ CORE | Yes | - | Human-readable business identifier | PR-2401-001 | Unique within active records |
| name | VARCHAR(255) | ✅ CORE | Yes | - | Display name or title | "Kitchen Equipment Request" | Non-empty string |
| description | TEXT | ✅ CORE | No | NULL | Detailed description or notes | "Replacement for broken..." | - |
| status | VARCHAR(50) | ✅ CORE | Yes | 'draft' | Current status in workflow | draft, submitted, approved | Must be from allowed values |
| amount | DECIMAL(15,2) | ✅ CORE | Yes | 0.00 | Monetary value in transaction currency | 1250.50 | Must be ≥ 0 |
| currency_code | VARCHAR(3) | ✅ CORE | Yes | 'USD' | ISO 4217 currency code | USD, EUR, GBP | Must be valid ISO code |
| effective_date | DATE | ✅ CORE | Yes | - | Date when record becomes effective | 2024-01-15 | Cannot be in far past |
| parent_id | UUID | ✅ CORE | No | NULL | Reference to parent entity | 550e8400-... | Must reference existing record |
| department_id | UUID | ✅ CORE | Yes | - | Department that owns this record | 550e8400-... | Must reference existing dept |
| metadata | JSONB | ✅ CORE | No | {} | Flexible additional data | {"priority": "high"} | Valid JSON object |
| created_at | TIMESTAMPTZ | ✅ CORE | Yes | NOW() | Creation timestamp (UTC) | 2024-01-15T10:30:00Z | Immutable |
| created_by | UUID | ✅ CORE | Yes | - | Creator user reference | 550e8400-... | Must reference existing user |
| updated_at | TIMESTAMPTZ | ✅ CORE | Yes | NOW() | Last update timestamp (UTC) | 2024-01-15T14:20:00Z | Auto-updated |
| updated_by | UUID | ✅ CORE | Yes | - | Last modifier user reference | 550e8400-... | Must reference existing user |
| deleted_at | TIMESTAMPTZ | ✅ CORE | No | NULL | Soft delete timestamp | NULL or timestamp | NULL for active records |
| {new_field} | {type} | 🆕 PROPOSED | {req} | {default} | {New field not in core schema} | {examples} | {constraints} |

#### Data Constraints and Rules

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated using uuid_generate_v4()
- Purpose: Uniquely identifies each record across the system

**Unique Constraints**:
- `{business_key}`: Must be unique among non-deleted records
  - Allows reuse after soft delete
  - Format: {Describe format pattern - e.g., "PR-YYMM-NNNN"}

**Foreign Key Relationships**:
- **Parent Entity** (`parent_id` → `parent_table.id`)
  - On Delete: CASCADE (deleting parent deletes children) | SET NULL | RESTRICT
  - On Update: CASCADE
  - Business rule: {Explain business logic}

- **User** (`created_by` → `users.id`)
  - On Delete: SET NULL (preserve history even if user deleted)
  - On Update: CASCADE
  - Business rule: Track record ownership and accountability

- **Department** (`department_id` → `departments.id`)
  - On Delete: RESTRICT (cannot delete dept with active records)
  - On Update: CASCADE
  - Business rule: Enforce departmental data ownership

**Check Constraints**:
- **Status values**: Must be one of: {list allowed values}
  - Example: 'draft', 'submitted', 'approved', 'rejected', 'completed', 'cancelled'

- **Amount validation**: Must be greater than or equal to 0
  - Business rule: Negative amounts not allowed in this context

- **Date validation**: `expiry_date` must be >= `effective_date` (if not null)
  - Business rule: Records cannot expire before they become effective

- **Business logic constraints**: {Other domain-specific rules}

**Not Null Constraints**:
- Required fields cannot be NULL: {list critical fields}
- Business justification: {Explain why each field must have a value}

**Default Values**:
- `status`: 'draft' - New records start in draft status
- `amount`: 0.00 - Initialize to zero for safety
- `currency_code`: 'USD' - Default operating currency
- `created_at`, `updated_at`: NOW() - Automatic timestamp capture
- `metadata`: {} - Empty JSON object rather than NULL
- `deleted_at`: NULL - Records are active by default

#### Sample Data Examples

**Example 1: Standard Purchase Request**
```
ID: 550e8400-e29b-41d4-a716-446655440001
Business Key: PR-2401-001
Name: Kitchen Equipment Purchase
Description: New commercial refrigerator for main kitchen
Status: approved
Amount: 5,250.00
Currency: USD
Department: Kitchen
Created: 2024-01-15 10:30:00 UTC
Created By: John Smith (Head Chef)
```

**Example 2: Multi-item Request**
```
ID: 550e8400-e29b-41d4-a716-446655440002
Business Key: PR-2401-002
Name: Cleaning Supplies Bulk Order
Description: Monthly cleaning supplies for housekeeping
Status: submitted
Amount: 1,850.50
Currency: USD
Department: Housekeeping
Metadata: {"items_count": 15, "priority": "normal", "delivery_required": "2024-02-01"}
Created: 2024-01-16 14:20:00 UTC
Created By: Maria Garcia (Housekeeping Manager)
```

**Example 3: Urgent Request**
```
ID: 550e8400-e29b-41d4-a716-446655440003
Business Key: PR-2401-003
Name: Emergency HVAC Repair Parts
Description: Replacement parts for broken AC unit in presidential suite
Status: draft
Amount: 3,750.00
Currency: USD
Department: Maintenance
Metadata: {"urgency": "high", "location": "Presidential Suite 1201", "required_by": "2024-01-18"}
Created: 2024-01-17 09:15:00 UTC
Created By: Robert Lee (Chief Engineer)
```

---

### Entity: {Related Entity Name}

{Repeat the same structure for additional entities...}

---

## Relationships

### One-to-Many Relationships

#### {Parent Entity} → {Child Entity}

**Relationship Type**: One {parent entity} has many {child entities}

**Foreign Key**: `{child_table}.{parent_id_field}` references `{parent_table}.id`

**Cardinality**:
- One parent can have: 0 to many children
- Each child must have: exactly 1 parent (or 0..1 if optional)

**Cascade Behavior**:
- **On Delete**: CASCADE | SET NULL | RESTRICT
  - CASCADE: Deleting parent automatically deletes all children
  - SET NULL: Deleting parent sets child's foreign key to NULL
  - RESTRICT: Cannot delete parent if children exist

- **On Update**: CASCADE
  - Updating parent ID propagates to all children (rare in practice with UUIDs)

**Business Rule**: {Explain the business logic and purpose of this relationship}

**Example Scenario**:
```
Parent: Purchase Request PR-2401-001
Children:
  - Line Item 1: "Commercial Refrigerator"
  - Line Item 2: "Installation Services"
  - Line Item 3: "Extended Warranty"

When PR-2401-001 is deleted:
  - All 3 line items are automatically deleted (CASCADE)
  - Ensures no orphaned line items exist
```

**Common Query Patterns**:
- Get parent with all children: Filter children by parent_id, aggregate or join
- Get children for specific parent: WHERE parent_id = {parent_id}
- Count children per parent: GROUP BY parent_id with COUNT
- Get parents with no children: LEFT JOIN with WHERE child IS NULL

---

### Many-to-Many Relationships

#### {Entity A} ↔ {Entity B}

**Relationship Type**: Many {entity A} can relate to many {entity B}

**Junction Entity**: `{entity_a}_{entity_b}` - Connects the two entities

**Cardinality**:
- Each {entity A} can have: 0 to many {entity B}
- Each {entity B} can have: 0 to many {entity A}

**Junction Entity Fields**:
- `id`: UUID primary key of the relationship itself
- `{entity_a}_id`: Foreign key to entity A
- `{entity_b}_id`: Foreign key to entity B
- **Relationship Attributes**: Additional data about the relationship
  - Examples: role, priority, start_date, end_date, is_primary
- **Audit Fields**: created_at, created_by (who established the relationship)

**Unique Constraint**: Combination of ({entity_a}_id, {entity_b}_id) must be unique
- Prevents duplicate relationships between same two entities
- May allow duplicates if relationship has meaningful variations

**Cascade Behavior**:
- Deleting entity A: CASCADE deletes all relationships (removes from junction table)
- Deleting entity B: CASCADE deletes all relationships (removes from junction table)
- Deleting junction record: Does not affect entity A or entity B

**Business Rule**: {Explain what this relationship represents in business terms}

**Example Scenario**:
```
Entity A: Purchase Request (PR-2401-001)
Entity B: Vendor (Vendor-123, Vendor-456)

Junction Records:
  - PR-2401-001 ↔ Vendor-123 (role: "primary", priority: 1)
  - PR-2401-001 ↔ Vendor-456 (role: "backup", priority: 2)

Business meaning:
  - Request can be fulfilled by multiple vendors
  - Vendors can fulfill multiple requests
  - Each relationship has a role and priority
```

**Common Query Patterns**:
- Get all entity B for a given entity A: JOIN junction ON entity_a_id, then JOIN entity B
- Get all entity A for a given entity B: JOIN junction ON entity_b_id, then JOIN entity A
- Check if relationship exists: SELECT from junction WHERE entity_a_id AND entity_b_id
- Get relationship attributes: SELECT from junction with both IDs

---

### Hierarchical Relationships (Self-Referencing)

#### {Entity} → {Same Entity} (Parent-Child Hierarchy)

**Relationship Type**: {Entity} can have a parent {entity} and multiple child {entities}

**Foreign Key**: `parent_id` references `{same_table}.id`

**Hierarchy Characteristics**:
- **Depth**: {Specify if depth is limited - e.g., "Maximum 3 levels", "Unlimited depth"}
- **Root Nodes**: Records with parent_id = NULL
- **Leaf Nodes**: Records with no children
- **Cycles**: {Prevented by database constraint or application logic}

**Business Rule**: {Explain the business hierarchy - e.g., "Department can have sub-departments"}

**Example Scenario**:
```
Entity: Department

Root: Hotel Operations (parent_id = NULL)
  ├── Front of House (parent_id = Hotel Ops ID)
  │   ├── Reception (parent_id = Front of House ID)
  │   └── Concierge (parent_id = Front of House ID)
  └── Back of House (parent_id = Hotel Ops ID)
      ├── Kitchen (parent_id = Back of House ID)
      └── Housekeeping (parent_id = Back of House ID)
```

**Common Query Patterns**:
- Get immediate children: WHERE parent_id = {parent_id}
- Get all descendants: Recursive query (CTE) or iterative traversal
- Get ancestors: Recursive upward traversal following parent_id
- Get root: WHERE parent_id IS NULL
- Get siblings: WHERE parent_id = (SELECT parent_id FROM table WHERE id = {current_id})

---

## Data Indexing Strategy

### Primary Indexes

**Primary Key Index** (Automatic):
- **Field**: `id`
- **Purpose**: Ensure uniqueness and fast lookup by UUID
- **Type**: B-tree (automatic with PRIMARY KEY constraint)
- **Performance**: O(log n) lookup, highly efficient

### Business Key Indexes

**Unique Business Key**:
- **Field**: `{business_key}`
- **Purpose**: Fast lookup by human-readable identifier, enforce uniqueness
- **Type**: Unique B-tree index
- **Partial Index**: Only on non-deleted records (WHERE deleted_at IS NULL)
- **Use Cases**: User searches by PR number, invoice number, etc.

### Foreign Key Indexes

**Parent Reference Index**:
- **Field**: `parent_id`
- **Purpose**: Fast joins with parent table, efficient relationship queries
- **Type**: B-tree index
- **Use Cases**: Loading children for a parent, cascade operations

**User Reference Indexes**:
- **Fields**: `created_by`, `updated_by`, `department_id`, `location_id`
- **Purpose**: Filter by user, department, or location ownership
- **Type**: B-tree indexes
- **Use Cases**: "Show me all requests I created", "Show department's data"

### Status and Workflow Indexes

**Status Index**:
- **Field**: `status`
- **Purpose**: Fast filtering by workflow state
- **Type**: B-tree index
- **Partial Index**: WHERE deleted_at IS NULL (only active records)
- **Use Cases**: Dashboard showing "pending approvals", status-specific views

### Composite Indexes

**Status + Date Index**:
- **Fields**: (`status`, `created_at DESC`)
- **Purpose**: Efficient sorting and filtering by status and date together
- **Type**: Composite B-tree index
- **Partial Index**: WHERE deleted_at IS NULL
- **Use Cases**: "Show recent approved requests", time-based reports by status

**Department + Date Index**:
- **Fields**: (`department_id`, `created_at DESC`)
- **Purpose**: Department-specific time-ordered queries
- **Type**: Composite B-tree index
- **Use Cases**: Department manager viewing recent department activity

### Date Range Indexes

**Date Range Index**:
- **Fields**: (`effective_date`, `expiry_date`)
- **Purpose**: Fast date range queries and validity checks
- **Type**: B-tree index
- **Use Cases**: "Active records on date X", "Expiring soon" queries

**Temporal Index**:
- **Field**: `created_at`
- **Purpose**: Time-series analysis, chronological sorting
- **Type**: B-tree index (often composite with other fields)
- **Use Cases**: Reports, analytics, audit trails

### Full-Text Search Indexes

**Search Index**:
- **Fields**: Combination of `name` and `description`
- **Purpose**: Fast text search across multiple text fields
- **Type**: GIN (Generalized Inverted Index) with tsvector
- **Function**: to_tsvector('english', name || ' ' || COALESCE(description, ''))
- **Use Cases**: Search bar, finding records by keywords

### JSON/JSONB Indexes

**Metadata Index**:
- **Field**: `metadata`
- **Purpose**: Fast queries on JSON properties
- **Type**: GIN index on JSONB column
- **Use Cases**: Filter by metadata properties, JSON path queries
- **Example Queries**: metadata->>'priority' = 'high', metadata ? 'special_flag'

### Partial Indexes (Soft Delete)

**Active Records Index**:
- **Fields**: Multiple indexes with WHERE clause
- **Condition**: WHERE deleted_at IS NULL
- **Purpose**: Exclude soft-deleted records from index, improve performance
- **Benefit**: Smaller index size, faster queries on active data
- **Use Cases**: All production queries that filter out deleted records

### Index Maintenance Guidelines

**Monitoring**:
- Track index usage statistics: Identify unused indexes
- Monitor index bloat: Reindex when bloat exceeds threshold
- Check slow query log: Add indexes for frequently slow queries

**Best Practices**:
- Index foreign keys used in joins
- Index columns used in WHERE clauses frequently (>10% of queries)
- Index columns used in ORDER BY
- Use composite indexes for multi-column queries
- Avoid over-indexing: Each index has write overhead
- Remove unused indexes: Monitor and cleanup periodically

**Index Naming Convention**:
- Primary key: `{table}_pkey` (automatic)
- Unique: `idx_{table}_{column}_unique`
- Foreign key: `idx_{table}_{fk_column}`
- Composite: `idx_{table}_{col1}_{col2}`
- Partial: `idx_{table}_{column}_active` (with WHERE clause)
- Full-text: `idx_{table}_search`
- JSONB: `idx_{table}_metadata`

---

## Data Integrity Rules

### Referential Integrity

**Foreign Key Constraints**:
- All foreign keys must reference existing records in the target table
- Foreign key fields are indexed for query performance
- Relationship validation occurs at database level (cannot be bypassed)

**Cascade Rules** - What happens when parent record is deleted/updated:
- **CASCADE**: Changes propagate to child records
  - Delete parent → Automatically delete all children
  - Update parent ID → Update in all children (rare with UUIDs)
  - Use case: Parent-child relationships where children have no meaning without parent

- **SET NULL**: Foreign key set to NULL when parent deleted
  - Delete parent → Set child's foreign key to NULL (if nullable)
  - Preserves child record but removes relationship
  - Use case: Historical data where relationship is optional

- **RESTRICT**: Prevent parent deletion/update if children exist
  - Delete parent → Error if any children exist
  - Forces explicit handling of children first
  - Use case: Protect critical relationships, enforce data cleanup

**Orphan Prevention**:
- No child records without valid parent (enforced by foreign key constraints)
- Application logic must handle cascade scenarios appropriately
- Soft delete parent → Typically cascade soft delete to children

### Domain Integrity

**Data Type Enforcement**:
- Column data types strictly enforced by database
- Type mismatches rejected at insert/update time
- Application must send correctly typed data
- Examples: UUIDs must be valid UUID format, dates must be valid dates

**Check Constraints**:
- Business rules enforced at database level
- Examples:
  - Status must be from allowed list: `status IN ('draft', 'submitted', 'approved')`
  - Amount must be positive: `amount >= 0`
  - End date after start date: `expiry_date >= effective_date`
  - Email format validation: `email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'`

**NOT NULL Constraints**:
- Required fields cannot be null
- Enforced for critical business data
- Examples: id, created_at, created_by, status
- Application must provide values for these fields

**DEFAULT Values**:
- Sensible defaults for optional fields
- Reduce application complexity
- Ensure consistency across records
- Examples:
  - `status` defaults to 'draft'
  - `created_at` defaults to NOW()
  - `metadata` defaults to empty JSON object '{}'
  - `deleted_at` defaults to NULL (active record)

**UNIQUE Constraints**:
- Prevent duplicate values where business requires uniqueness
- Can be composite (multiple columns together must be unique)
- Can be partial (unique only within subset, like non-deleted records)
- Examples:
  - Business keys: Purchase request number, invoice number
  - Natural keys: Email address, employee ID
  - Composite: (vendor_id, product_code) for vendor-specific product codes

### Entity Integrity

**Primary Key Requirements**:
- Every table must have a primary key
- Primary keys are immutable (never updated)
- Primary keys are always NOT NULL and UNIQUE
- UUID type for distributed system compatibility

**Audit Trail Requirements** (All tables must have):
- `created_at`: When record was created (immutable)
- `created_by`: Who created the record (immutable)
- `updated_at`: When record was last modified (auto-updated)
- `updated_by`: Who last modified the record (auto-updated)
- Purpose: Accountability, troubleshooting, compliance

**Soft Delete Requirements**:
- `deleted_at`: Timestamp for soft delete (NULL = active)
- Never physically delete records (preserve history)
- Queries must filter WHERE deleted_at IS NULL
- Allows recovery and audit trail preservation

### Data Quality Constraints

**Value Range Constraints**:
- Monetary amounts: Must be within reasonable business limits
- Quantities: Must be positive for stock items
- Percentages: Must be between 0 and 100
- Dates: Must be within acceptable business timeframe

**Format Constraints**:
- Business keys: Follow consistent format (e.g., "PR-YYMM-NNNN")
- Phone numbers: Consistent format for easier validation
- Currency codes: Must be valid ISO 4217 codes
- Email addresses: Must match email format pattern

**Business Logic Constraints**:
- Effective date cannot be far in the past or future
- Approval date must be after submission date
- Delivery date must be after order date
- Amount in line items must sum to header total

---

## Database Triggers and Automation

### Automatic Timestamp Updates

**Updated At Trigger**:
- **Purpose**: Automatically update `updated_at` timestamp on every record modification
- **Trigger Event**: BEFORE UPDATE on the table
- **Behavior**: Sets `updated_at` to current timestamp (NOW()) before saving changes
- **Benefits**: Ensures accurate last-modified tracking without application logic

**Created At Protection**:
- **Purpose**: Prevent modification of `created_at` and `created_by` fields
- **Trigger Event**: BEFORE UPDATE on the table
- **Behavior**: Rejects any attempt to change creation timestamp or creator
- **Benefits**: Immutable audit trail, data integrity

### Audit Logging

**Change Tracking Trigger**:
- **Purpose**: Record all insert, update, and delete operations for audit trail
- **Trigger Event**: AFTER INSERT OR UPDATE OR DELETE on the table
- **Audit Table**: Separate audit log table stores change history
- **Captured Data**:
  - Operation type: INSERT, UPDATE, DELETE
  - User who performed action
  - Timestamp of change
  - Old values (before change)
  - New values (after change)
  - Changed fields only (efficient storage)

**Use Cases**:
- Compliance and regulatory requirements
- Troubleshooting data issues
- User accountability
- Security investigation
- Data recovery

### Data Validation Triggers

**Business Rule Validation**:
- **Purpose**: Enforce complex business rules that cannot be expressed with simple constraints
- **Trigger Event**: BEFORE INSERT OR UPDATE on the table
- **Validation Examples**:
  - Check budget availability before approving purchase request
  - Verify user has permission to perform the operation
  - Validate status transitions (can only move from draft to submitted, not backwards)
  - Ensure line item quantities match available stock
  - Verify department codes exist and are active

**Error Handling**:
- Trigger raises exception with meaningful error message
- Transaction is rolled back
- Application receives clear error to display to user

### Cascade Operations

**Soft Delete Cascade**:
- **Purpose**: When parent is soft-deleted, automatically soft-delete children
- **Trigger Event**: AFTER UPDATE on parent table (when deleted_at set)
- **Behavior**: Updates all child records to set their deleted_at to same timestamp
- **Benefits**: Maintains referential integrity with soft deletes

**Status Propagation**:
- **Purpose**: Update related records when parent status changes
- **Example**: When purchase order is approved, update purchase request status
- **Trigger Event**: AFTER UPDATE on parent table (when status changes)
- **Behavior**: Triggers business logic to update dependent records

### Computed Fields

**Auto-calculation Trigger**:
- **Purpose**: Automatically calculate derived fields
- **Trigger Event**: BEFORE INSERT OR UPDATE
- **Examples**:
  - Calculate total from line items
  - Compute tax amount from subtotal
  - Set base currency amount from transaction currency
  - Calculate days between start and end date

**Benefits**:
- Data consistency
- Reduces application complexity
- Prevents calculation errors
- Single source of truth

### Notification Triggers

**Event Notification**:
- **Purpose**: Notify external systems or queue background jobs
- **Trigger Event**: AFTER INSERT OR UPDATE
- **Mechanism**: NOTIFY/LISTEN or message queue integration
- **Use Cases**:
  - Send notification when approval required
  - Queue email when status changes
  - Trigger workflow step
  - Update search index
  - Invalidate cache

---

## Performance Considerations

### Query Performance Targets

**Response Time Objectives**:
- **Simple Queries** (single record by ID): < 10ms
- **List Queries** (filtered, sorted, paginated): < 100ms
- **Complex Queries** (joins, aggregations): < 500ms
- **Reports and Analytics**: < 5 seconds
- **Batch Operations** (1000 records): < 10 seconds

**Achieving Targets**:
- Proper indexing on frequently queried columns
- Query optimization using EXPLAIN ANALYZE
- Connection pooling to manage database connections
- Read replicas for reporting and analytics
- Caching frequently accessed data

### Table Size Projections

| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Month 1 | 1,000 | 5 MB | Initial adoption phase |
| Year 1 | 12,000 | 60 MB | Steady monthly growth |
| Year 3 | 36,000 | 180 MB | With archival strategy |
| Year 5 | 60,000 | 300 MB | Mature state with archival |

**Sizing Assumptions**:
- Average row size: ~5 KB (including indexes and JSONB data)
- Growth rate: ~1000 records/month
- Archival: Records older than 12 months moved to archive tables
- Retention: Archived data kept for 7 years, then purged

**Storage Planning**:
- Primary tables: Active 12 months of data
- Archive tables: 7 years of historical data
- Indexes: Approximately 50% of table size
- Total with overhead: Plan for 3x estimated size

### Optimization Techniques

**Query Optimization**:
- Use EXPLAIN ANALYZE to understand query execution plans
- Identify slow queries from slow query log
- Add indexes for frequently accessed columns
- Optimize JOIN order and conditions
- Use appropriate WHERE clause filtering
- Limit result sets with LIMIT and OFFSET for pagination

**Indexing Best Practices**:
- Index foreign keys used in JOINs
- Index columns in WHERE clauses (high selectivity)
- Index columns in ORDER BY
- Use composite indexes for multi-column queries
- Create partial indexes for filtered queries
- Monitor and remove unused indexes

**Partitioning** (for very large tables > 10M rows):
- Partition by date range (e.g., monthly partitions)
- Partition by status or department (list partitioning)
- Improves query performance on large datasets
- Simplifies archival and purging

**Connection Pooling**:
- Limit concurrent database connections
- Reuse connections across requests
- Typical pool size: 10-50 connections
- Prevents connection exhaustion

**Caching Strategy**:
- Cache frequently accessed, rarely changed data
- Use in-memory cache (Redis, Memcached)
- Cache at application level
- Invalidate cache on data changes
- Typical cache TTL: 5-60 minutes

**Read Replicas**:
- Offload reporting and analytics to read replicas
- Reduce load on primary database
- Eventually consistent reads acceptable for reports
- Failover capability for high availability

**Batch Operations**:
- Group multiple INSERTs into single transaction
- Use bulk UPDATE where possible
- Process large datasets in chunks
- Avoid row-by-row processing in application

---

## Data Archival Strategy

### Archival Policy

**Retention Periods**:
- **Active Data**: Last 12 months in primary tables
- **Archived Data**: 1-7 years in archive tables
- **Purge After**: 7 years (compliance requirement)

**Archival Criteria**:
- Records older than 12 months
- Completed/closed records only
- Status = 'completed', 'cancelled', or 'archived'
- No active dependencies or references

**Archival Frequency**:
- Monthly archival process (scheduled job)
- Off-peak hours (e.g., 2 AM on first Sunday of month)
- Incremental archival (only new records meeting criteria)

### Archive Table Structure

**Archive Tables**:
- Identical schema to primary table (LIKE ... INCLUDING ALL)
- Additional `archived_at` timestamp field
- Same indexes for query performance
- Separate tablespace for cost-effective storage

**Archive Table Naming**:
- Pattern: `{primary_table}_archive`
- Example: `purchase_requests_archive`

**Data Location**:
- Primary tables: High-performance SSD storage
- Archive tables: Cost-effective HDD or cloud storage
- Compressed storage for archive data

### Archival Process

**Archival Workflow**:
1. Identify records meeting archival criteria
2. Copy records to archive table
3. Delete records from primary table (or mark as archived)
4. Update archive metadata
5. Verify data integrity
6. Log archival operation

**Transaction Safety**:
- Entire archival process in single transaction
- Rollback on any error
- Verify row counts before and after
- Maintain referential integrity

**Archival Verification**:
- Compare row counts (archived vs. deleted)
- Verify no data loss
- Check archive table integrity
- Test archive data accessibility

### Archive Data Access

**Querying Archive Data**:
- Create views combining primary and archive tables
- Use UNION ALL for combined queries
- Partition by archive status for query optimization

**Archive Data Retrieval**:
- Slower query performance acceptable (not real-time)
- Read-only access for most users
- Admin-only restore capabilities
- Export to external systems for long-term storage

**Data Restore**:
- Move records from archive back to primary table (if needed)
- Update `deleted_at` to NULL
- Refresh indexes and statistics
- Verify data consistency

---

## Security Considerations

### Row-Level Security (RLS)

**Purpose**: Control which rows users can see and modify based on their role and department

**Policy Types**:
- **Read Policies**: Control which rows users can SELECT
- **Write Policies**: Control which rows users can INSERT/UPDATE/DELETE
- **Department Isolation**: Users only see their department's data
- **Role-Based**: Different policies for different user roles

**Example Policies**:

**Department Isolation**:
- Users can only access records from their own department
- Policy: `department_id = current_user_department_id`
- Exception: Managers and admins can access multiple departments

**Creator Access**:
- Users can only see/edit records they created
- Policy: `created_by = current_user_id`
- Exception: Managers can see their team's records

**Status-Based Access**:
- Regular users can only see approved records
- Policy: `status IN ('approved', 'completed')`
- Exception: Approvers can see 'submitted' status

**Admin Override**:
- Admins bypass all RLS policies
- Policy: `USING (true)` for admin role
- Full system access for troubleshooting

### Column-Level Security

**Purpose**: Hide sensitive columns from unauthorized users

**Sensitive Data Examples**:
- Monetary amounts (salary, cost)
- Personal information (SSN, passport)
- Financial data (bank accounts, credit cards)
- Proprietary information (formulas, recipes)

**Access Control**:
- Grant SELECT on specific columns only
- Revoke access to sensitive columns
- Use views with filtered columns
- Encrypt sensitive data at rest

**Example Permissions**:
```
Grant read-only user SELECT on: id, name, status, created_at
Revoke from read-only user: amount, cost, profit_margin
Grant financial manager full access to all columns
```

### Data Encryption

**Encryption At Rest**:
- Database-level encryption enabled on storage
- Transparent to application (automatic encrypt/decrypt)
- Encryption key management by cloud provider or HSM
- Meets compliance requirements (PCI-DSS, HIPAA)

**Encryption In Transit**:
- SSL/TLS for all database connections
- Certificate-based authentication
- Encrypted connection strings
- No plaintext data transmission

**Column-Level Encryption** (for extra sensitive data):
- Encrypt specific columns using pgcrypto extension
- Application manages encryption keys
- Encrypt before INSERT, decrypt after SELECT
- Use cases: Credit card numbers, passwords, SSN

**Encryption Key Management**:
- Separate encryption keys from encrypted data
- Regular key rotation policy
- Secure key storage (HSM, Key Management Service)
- Multi-factor authentication for key access

### Access Control

**Database Users and Roles**:
- **app_read_only**: SELECT only
- **app_read_write**: SELECT, INSERT, UPDATE (no DELETE)
- **app_admin**: Full access including DELETE
- **reporting_user**: SELECT on views and archive tables

**Authentication**:
- Strong password policy
- Multi-factor authentication for admin access
- Service account credentials for applications
- Rotate credentials regularly

**Authorization**:
- Principle of least privilege
- Grant minimum necessary permissions
- Regular access reviews and audits
- Revoke access when no longer needed

**Audit Trail**:
- Log all access attempts
- Track failed login attempts
- Monitor suspicious activity
- Alert on security violations

---

## Backup and Recovery

### Backup Strategy

**Full Backups**:
- **Frequency**: Daily at 2 AM (off-peak hours)
- **Retention**: 30 days online, 90 days in cold storage
- **Method**: Database snapshot or dump
- **Location**: Off-site cloud storage (separate region)

**Incremental Backups**:
- **Frequency**: Every 4 hours
- **Retention**: 7 days
- **Method**: Write-Ahead Log (WAL) archiving
- **Purpose**: Minimize data loss window

**Continuous Archiving**:
- **Method**: WAL streaming to backup server
- **Purpose**: Near-zero Recovery Point Objective (RPO)
- **Benefit**: Point-in-time recovery capability

**Backup Verification**:
- Weekly restore test to verify backup integrity
- Automated backup health checks
- Alert on backup failures
- Document restore procedures

### Backup Contents

**Included in Backup**:
- All database tables (structure and data)
- Indexes and constraints
- Views and stored procedures
- User roles and permissions
- Database configuration

**Excluded from Backup** (stored separately):
- Large binary files (use object storage)
- Temporary tables
- Cache tables
- Log tables (optional)

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
- Restore specific table from backup to staging
- Copy needed data back to production
- Use case: Recover accidentally deleted records
- RTO: < 2 hours

**Disaster Recovery**:
- Failover to backup region/server
- Automated failover triggers
- Use case: Primary datacenter failure
- RTO: < 1 hour

### Backup Retention Policy

**Retention Schedule**:
- **Daily backups**: Keep for 30 days
- **Weekly backups**: Keep for 90 days (13 weeks)
- **Monthly backups**: Keep for 1 year (12 months)
- **Yearly backups**: Keep for 7 years (compliance)

**Storage Optimization**:
- Compress old backups
- Move to cheaper storage tiers over time
- Delete expired backups automatically
- Monitor storage costs

---

## Data Migration

### Version 1.0.0 - Initial Schema

**Migration Metadata**:
- **Migration File**: `001_create_{table_name}.sql`
- **Date**: {YYYY-MM-DD}
- **Author**: {Author Name}
- **Purpose**: Initial database schema creation

**Migration Steps** (Description):
1. Create primary table with all columns and data types
2. Create primary key constraint on `id` column
3. Create foreign key constraints for relationships
4. Create unique constraints on business keys
5. Create check constraints for data validation
6. Create indexes on foreign keys and frequently queried columns
7. Create audit triggers for timestamp updates and change tracking
8. Insert seed/reference data (statuses, categories, etc.)
9. Set up row-level security policies (if applicable)
10. Grant permissions to database roles

**Data Included**:
- Table structure and constraints
- Initial reference data (lookup values, statuses)
- Admin/system users (if applicable)
- Sample data for testing (optional)

**Verification**:
- Verify table structure created correctly
- Test constraints work as expected
- Validate triggers fire properly
- Confirm indexes created
- Test data inserted successfully

**Rollback Plan**:
- Drop triggers
- Drop indexes
- Drop table with CASCADE to remove dependencies
- Verify clean rollback

---

### Version 1.1.0 - Add New Columns

**Migration Metadata**:
- **Migration File**: `002_add_columns_to_{table_name}.sql`
- **Date**: {YYYY-MM-DD}
- **Author**: {Author Name}
- **Purpose**: Add new columns for {feature/requirement}

**Migration Steps** (Description):
1. Add new columns as NULLABLE initially (to allow backfill)
2. Backfill existing records with default or calculated values
3. Update NOT NULL constraint if field is required
4. Add new indexes on new columns (if needed)
5. Update validation triggers/constraints
6. Grant permissions on new columns

**Example Changes**:
- Add `priority` column (VARCHAR, default 'normal')
- Add `metadata` JSONB column for flexible data
- Add `approved_by` foreign key for approval workflow
- Add `approval_date` timestamp

**Backfill Strategy**:
- Set default value for new required fields
- Calculate values based on existing data
- Run backfill in batches to avoid locking large table
- Verify backfill completed successfully

**Verification**:
- Check new columns exist in table
- Verify backfilled data is correct
- Test constraints and defaults work
- Confirm indexes created

**Rollback Plan**:
- Drop new indexes
- Drop new columns
- Revert any modified constraints
- Verify data integrity

---

### Version 1.2.0 - Schema Refactoring

**Migration Metadata**:
- **Migration File**: `003_refactor_{table_name}.sql`
- **Date**: {YYYY-MM-DD}
- **Author**: {Author Name}
- **Purpose**: Refactor schema for {performance/normalization/etc}

**Migration Steps** (Description):
1. Create new tables (if splitting data)
2. Migrate data from old structure to new structure
3. Update foreign key references
4. Create new indexes on new structure
5. Update views and stored procedures
6. Test new structure with application
7. Drop old columns/tables after verification

**Example Changes**:
- Split large JSONB into separate related table
- Normalize repeated data into lookup table
- Rename column for clarity
- Change data type (with conversion)

**Data Migration**:
- Extract data from old columns
- Transform to new structure
- Load into new columns/tables
- Validate data integrity
- Keep old columns temporarily for safety

**Verification**:
- Verify data migrated completely
- Check referential integrity
- Test application queries still work
- Performance test new structure

**Rollback Plan**:
- Revert to old columns (if still present)
- Restore from pre-migration backup
- Document rollback steps

---

## Data Quality

### Data Quality Dimensions

**Completeness**:
- All required fields populated (no NULL in NOT NULL columns)
- All records have necessary related data
- No missing foreign key references
- Measured: % of records with all required fields complete

**Accuracy**:
- Data matches source system or real-world truth
- Calculations are correct
- Derived fields match computed values
- Measured: % of records matching validation rules

**Consistency**:
- Related data is consistent across tables
- Same entity has same values everywhere
- Status values align across related records
- Measured: % of records passing consistency checks

**Validity**:
- Data conforms to business rules and formats
- Status values from allowed list
- Dates are reasonable (not far past/future)
- Measured: % of records passing validation rules

**Timeliness**:
- Data updated within SLA
- Audit timestamps reflect actual changes
- Real-time or near-real-time updates
- Measured: Average lag between event and data update

**Uniqueness**:
- No duplicate records
- Business keys are unique
- No duplicate relationships in junction tables
- Measured: % of records with unique business keys

### Data Quality Checks

**Automated Quality Checks** (Run daily/weekly):

**Check for Orphaned Records**:
```
Purpose: Find child records with non-existent parent
Query Logic: LEFT JOIN parent table, WHERE parent IS NULL
Expected: 0 orphaned records
Action: Investigate and fix referential integrity
```

**Check for Invalid Status Values**:
```
Purpose: Ensure status values are from allowed list
Query Logic: SELECT WHERE status NOT IN (allowed_values)
Expected: 0 invalid statuses
Action: Correct invalid values, investigate root cause
```

**Check for Future Dates**:
```
Purpose: Find timestamps in the future (data error)
Query Logic: SELECT WHERE created_at > NOW()
Expected: 0 future dates
Action: Correct timestamps, check data entry process
```

**Check for Null Required Fields**:
```
Purpose: Verify NOT NULL constraints enforced
Query Logic: SELECT WHERE required_field IS NULL
Expected: 0 null values in required fields
Action: Should never happen due to constraints
```

**Check for Duplicate Business Keys**:
```
Purpose: Ensure unique business keys
Query Logic: GROUP BY business_key HAVING COUNT(*) > 1
Expected: 0 duplicates
Action: Resolve duplicates, enforce unique constraint
```

**Check for Inconsistent Totals**:
```
Purpose: Verify header totals match sum of line items
Query Logic: Compare header.total with SUM(line.amount)
Expected: 100% match
Action: Recalculate totals, investigate discrepancies
```

**Check for Old Pending Records**:
```
Purpose: Find stuck records in workflow
Query Logic: SELECT WHERE status = 'pending' AND created_at < NOW() - INTERVAL '30 days'
Expected: Review and resolve old pending items
Action: Escalate or close old pending records
```

### Data Quality Monitoring

**Quality Metrics Dashboard**:
- Completeness score by entity
- Accuracy score by entity
- Daily quality trend
- Top quality issues

**Alerting**:
- Alert when quality score drops below threshold
- Alert on critical quality checks failing
- Alert on data volume anomalies
- Alert on unusual data patterns

**Reporting**:
- Weekly data quality report
- Monthly quality trends
- Issue resolution tracking
- Root cause analysis

---

## Testing Data

### Test Data Requirements

**Test Environments**:
- **Development**: Full synthetic test data
- **Staging**: Copy of production data (sanitized)
- **Testing**: Mix of synthetic and sanitized data
- **Demo**: Curated realistic data for demos

**Data Sanitization** (for production data copies):
- Remove or mask personal information
- Anonymize user names and email addresses
- Replace real monetary amounts with random values
- Mask sensitive business data
- Preserve data relationships and integrity

### Test Data Generation

**Synthetic Data Creation**:

**Approach 1: Manual Test Records**:
- Create specific test scenarios
- Well-known test data for development
- Predictable values for testing
- Examples below

**Approach 2: Generated Test Data**:
- Use database generate_series() function
- Generate large volumes for performance testing
- Randomized values within valid ranges
- Automated test data creation

**Example: Generate 1000 Test Purchase Requests**:
```
Logic:
- Generate series from 1 to 1000
- Business key: 'TEST-' + series number
- Name: 'Test Request ' + series number
- Amount: Random value between 100 and 10,000
- Status: Randomly chosen from allowed values
- Created by: Random test user
- Department: Random test department
```

**Realistic Test Data**:
- Use realistic names (not "Test User 1")
- Realistic amounts (not $1, $2, $3)
- Realistic dates (not all same date)
- Realistic distributions (status mix, departments)

### Test Scenarios

**Volume Testing**:
- Insert 10,000+ records
- Test pagination with large datasets
- Verify query performance under load
- Test batch operations

**Concurrency Testing**:
- Simultaneous INSERT from multiple users
- Concurrent UPDATE to same record
- Test locking and transaction isolation
- Verify no data corruption

**Edge Case Testing**:
- Null values in optional fields
- Minimum and maximum values
- Boundary conditions (exactly at limits)
- Empty strings vs. NULL
- Special characters in text fields

**Referential Integrity Testing**:
- Test CASCADE delete behavior
- Test SET NULL on parent delete
- Test RESTRICT prevents deletion
- Verify orphan prevention

**Constraint Testing**:
- Test unique constraint violations
- Test check constraint enforcement
- Test NOT NULL requirements
- Test default value application

**Data Quality Testing**:
- Test validation triggers
- Test data transformation
- Test calculated fields
- Test status transitions

### Test Data Cleanup

**Cleanup Strategy**:
- Mark test data with identifiable pattern (e.g., business_key starts with 'TEST-')
- Automated cleanup scripts
- Separate test data tenant/department
- Regular cleanup of old test data

**Cleanup Query Example**:
```
Delete test data:
- WHERE business_key LIKE 'TEST-%'
- WHERE department_id = (test department)
- WHERE created_by IN (test users)
```

---

## Glossary

**Database Terms**:
- **Primary Key**: Unique identifier for each record, cannot be null or duplicate
- **Foreign Key**: Column that references the primary key of another table, establishes relationships
- **Index**: Database structure that improves query performance by enabling fast lookups
- **Constraint**: Rule enforced by the database to maintain data integrity
- **Cascade**: Automatic propagation of changes or deletes to related records
- **Transaction**: Group of database operations that succeed or fail together (atomic)
- **ACID**: Atomicity, Consistency, Isolation, Durability - database transaction properties

**PostgreSQL-Specific Terms**:
- **UUID**: Universally Unique Identifier, 128-bit value used for primary keys
- **TIMESTAMPTZ**: Timestamp with timezone, stores UTC time with timezone offset
- **JSONB**: Binary JSON storage format, indexed and queryable
- **GIN**: Generalized Inverted Index, used for JSONB and full-text search
- **B-tree**: Default index type for efficient equality and range queries
- **Partial Index**: Index with WHERE clause, indexes only subset of rows
- **RLS**: Row-Level Security, PostgreSQL feature for fine-grained access control
- **WAL**: Write-Ahead Log, transaction log used for crash recovery and replication

**Application Terms**:
- **Soft Delete**: Marking record as deleted (deleted_at timestamp) instead of removing it
- **Audit Trail**: Historical record of who changed what and when
- **Backfill**: Updating existing records with new data after adding a column
- **Migration**: Script to change database schema from one version to another
- **Seed Data**: Initial reference data inserted during setup (statuses, categories)
- **Orphan Record**: Child record with non-existent parent (referential integrity violation)

**Business Terms**:
- **Entity**: Business object represented by a database table (e.g., Purchase Request)
- **Business Key**: Human-readable identifier (e.g., PR-2401-001)
- **Status**: Current state in a workflow (e.g., draft, submitted, approved)
- **Workflow**: Series of steps and approvals for a business process
- **Department**: Organizational unit that owns data (e.g., Kitchen, Housekeeping)
- **Line Item**: Detail record belonging to a header (e.g., items in a purchase request)

---

## Related Documents

- [Business Requirements](./BR-{submodule}.md) - User stories and functional requirements
- [Technical Specification](./TS-{submodule}.md) - System architecture and component design
- [Use Cases](./UC-{submodule}.md) - Detailed user workflows and scenarios
- [Flow Diagrams](./FD-{submodule}.md) - Visual workflow and process diagrams
- [Validations](./VAL-{submodule}.md) - Data validation rules and error handling

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Database Architect | | | |
| Technical Lead | | | |
| Security Officer | | | |
| Operations Manager | | | |

---

**Document End**

> 📝 **Note to Authors**:
> - Extract data definitions from actual code implementation
> - Use descriptive text instead of SQL CREATE statements
> - Focus on business meaning and relationships
> - Include realistic sample data examples
> - Document constraints and rules in plain language
> - Describe indexing strategy conceptually
> - Explain cascade behaviors and referential integrity
> - No code, no SQL queries - only text descriptions
> - Keep examples realistic and hospitality-focused
> - Update when schema changes based on code
> - Review with database team and stakeholders
