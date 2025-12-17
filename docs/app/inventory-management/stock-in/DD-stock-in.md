# Data Definition: Stock In

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Stock In
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Inventory Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-01-11 | System | Initial version |

---

## Overview

This document defines the data structures, database schema, relationships, and data integrity rules for the Stock In sub-module. Stock In uses multiple tables to represent inbound inventory transactions, line items, movements, comments, attachments, and activity logs.

**Related Documents**:
- [Business Requirements](./BR-stock-in.md)
- [Use Cases](./UC-stock-in.md)
- [Technical Specification](./TS-stock-in.md)
- [Flow Diagrams](./FD-stock-in.md)
- [Validations](./VAL-stock-in.md)

---

## Entity Relationship Diagram

```
┌─────────────────────────────┐
│  StockInTransaction         │ (Header)
│  - id (PK)                  │
│  - refNo (unique)           │
│  - date                     │
│  - type                     │
│  - relatedDoc               │
│  - locationId (FK)          │
│  - status                   │
│  - totalQty                 │
│  - commitDate               │
│  - committedBy (FK)         │
│  - glJournalEntryNumber     │
│  - isReversed               │
│  - reversalTransactionId    │
└───────────┬─────────────────┘
            │
            │ 1:N
            │
┌───────────▼─────────────────┐
│  StockInItem                │ (Line Items)
│  - id (PK)                  │
│  - stockInTransactionId (FK)│
│  - lineNumber               │
│  - productId (FK)           │
│  - unitId (FK)              │
│  - qty                      │
│  - unitCost                 │
│  - totalCost                │
│  - destinationLocationId    │
│  - costCalculationMethod    │
└───────────┬─────────────────┘
            │
            │ 1:N
            │
┌───────────▼─────────────────┐
│  StockInMovement            │ (Inventory Movements)
│  - id (PK)                  │
│  - stockInTransactionId (FK)│
│  - stockInItemId (FK)       │
│  - commitDate               │
│  - locationId (FK)          │
│  - productId (FK)           │
│  - stockIn                  │
│  - stockOut (always 0)      │
│  - amount                   │
│  - isReversed               │
└─────────────────────────────┘


StockInTransaction 1:N StockInComment
StockInTransaction 1:N StockInAttachment
StockInTransaction 1:N StockInActivity
```

---

## Database Tables

### stock_in_transaction

**Purpose**: Header record for stock in transactions, stores transaction-level information.

**Table Definition**:

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| ref_no | VARCHAR(20) | UNIQUE, NOT NULL | Transaction reference number (STK-IN-YYMM-NNNN) |
| date | DATE | NOT NULL | Transaction date (determines costing period) |
| type | ENUM | NOT NULL | Transaction type: 'Good Receive Note', 'Transfer', 'Credit Note', 'Issue Return', 'Adjustment' |
| related_doc | VARCHAR(50) | NULL | Reference to source document (GRN-XXXX, TRF-XXXX, etc.) |
| location_id | UUID | FK to tb_location, NOT NULL | Receiving location |
| location_code | VARCHAR(20) | NULL | Denormalized location code for display |
| location_name | VARCHAR(100) | NULL | Denormalized location name for display |
| description | TEXT | NULL | Transaction description/notes (max 500 chars) |
| total_qty | DECIMAL(18,4) | NOT NULL, DEFAULT 0 | Sum of all line item quantities |
| status | ENUM | NOT NULL, DEFAULT 'Saved' | 'Saved', 'Committed', 'Void' |
| commit_date | TIMESTAMP | NULL | When transaction was committed |
| committed_by | UUID | FK to tb_user, NULL | User who committed transaction |
| gl_journal_entry_number | VARCHAR(30) | NULL | Reference to GL journal entry (JE-YYMM-NNNN) |
| is_reversed | BOOLEAN | NOT NULL, DEFAULT false | True if transaction has been reversed |
| reversal_transaction_id | UUID | FK to stock_out_transaction, NULL | Link to reversal transaction |
| reversal_date | TIMESTAMP | NULL | When reversal occurred |
| reversal_by | UUID | FK to tb_user, NULL | User who reversed transaction |
| reversal_reason | TEXT | NULL | Reason for reversal |
| created_date | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| created_by | UUID | FK to tb_user, NOT NULL | Creator user ID |
| modified_date | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification timestamp |
| modified_by | UUID | FK to tb_user, NOT NULL | Last modifier user ID |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes**:
- PRIMARY KEY (id)
- UNIQUE INDEX idx_stock_in_transaction_ref_no (ref_no)
- INDEX idx_stock_in_transaction_location_status (location_id, status)
- INDEX idx_stock_in_transaction_date (date DESC)
- INDEX idx_stock_in_transaction_created_date (created_date DESC)
- INDEX idx_stock_in_transaction_type_status (type, status)

**Foreign Keys**:
- location_id → tb_location(id) ON DELETE RESTRICT
- committed_by → tb_user(id) ON DELETE RESTRICT
- created_by → tb_user(id) ON DELETE RESTRICT
- modified_by → tb_user(id) ON DELETE RESTRICT

**Check Constraints**:
- CHECK (total_qty >= 0)
- CHECK (status IN ('Saved', 'Committed', 'Void'))
- CHECK (commit_date IS NULL OR status = 'Committed')
- CHECK (committed_by IS NULL OR status = 'Committed')

**Example Data**:
```
id: 550e8400-e29b-41d4-a716-446655440001
ref_no: STK-IN-2501-0001
date: 2025-01-15
type: Good Receive Note
related_doc: GRN-2401-0001
location_id: loc-550e8400-...
location_code: WH-MAIN
location_name: Main Warehouse
description: Monthly F&B supplies delivery from Thai Beverage Co.
total_qty: 500.0000
status: Committed
commit_date: 2024-01-15 11:00:00
committed_by: user-550e8400-...
gl_journal_entry_number: JE-2401-5678
is_reversed: false
```

---

### stock_in_item

**Purpose**: Line items representing individual products in a stock in transaction.

**Table Definition**:

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| stock_in_transaction_id | UUID | FK to stock_in_transaction, NOT NULL | Parent transaction |
| line_number | INTEGER | NOT NULL | Line sequence (1, 2, 3...) |
| product_id | UUID | FK to tb_product, NOT NULL | Product being received |
| item_code | VARCHAR(50) | NULL | Denormalized product code |
| description | VARCHAR(200) | NULL | Denormalized product description |
| category | VARCHAR(50) | NULL | Denormalized category |
| sub_category | VARCHAR(50) | NULL | Denormalized sub-category |
| item_group | VARCHAR(50) | NULL | Denormalized item group |
| bar_code | VARCHAR(50) | NULL | Product barcode |
| unit_id | UUID | FK to tb_unit, NOT NULL | Unit of measure |
| unit | VARCHAR(20) | NULL | Denormalized unit name |
| qty | DECIMAL(18,4) | NOT NULL | Quantity (must be > 0) |
| unit_cost | DECIMAL(18,4) | NULL | Cost per unit (4 decimal precision) |
| total_cost | DECIMAL(18,4) | NULL | qty * unit_cost |
| cost_calculation_method | ENUM | NULL | 'FIFO' or 'Periodic Average' |
| cost_layer_id | UUID | NULL | For FIFO: link to cost layer record |
| destination_location_id | UUID | FK to tb_location, NOT NULL | Destination location (can differ from header) |
| destination_location_code | VARCHAR(20) | NULL | Denormalized location code |
| comment | TEXT | NULL | Line item notes (max 200 chars) |
| inventory_info | JSONB | NULL | Snapshot of inventory context at time of entry |
| created_date | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| created_by | UUID | FK to tb_user, NOT NULL | Creator user ID |
| modified_date | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification timestamp |
| modified_by | UUID | FK to tb_user, NOT NULL | Last modifier user ID |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_stock_in_item_transaction (stock_in_transaction_id, line_number)
- INDEX idx_stock_in_item_product (product_id)
- INDEX idx_stock_in_item_location (destination_location_id)

**Foreign Keys**:
- stock_in_transaction_id → stock_in_transaction(id) ON DELETE CASCADE
- product_id → tb_product(id) ON DELETE RESTRICT
- unit_id → tb_unit(id) ON DELETE RESTRICT
- destination_location_id → tb_location(id) ON DELETE RESTRICT

**Check Constraints**:
- CHECK (qty > 0)
- CHECK (unit_cost IS NULL OR unit_cost >= 0)
- CHECK (total_cost IS NULL OR total_cost >= 0)
- CHECK (cost_calculation_method IS NULL OR cost_calculation_method IN ('FIFO', 'Periodic Average'))

**inventory_info JSONB Structure**:
```json
{
  "onHand": 350,
  "onOrdered": 200,
  "reorder": 250,
  "restock": 500,
  "lastPrice": 82.00,
  "lastVendor": "Thai Beverage Co.",
  "snapshotDate": "2024-01-15T09:00:00Z"
}
```

**Example Data**:
```
id: item-550e8400-...
stock_in_transaction_id: 550e8400-...
line_number: 1
product_id: prod-550e8400-...
item_code: BEV-0001
description: Heineken Beer 330ml
unit_id: unit-bottle
unit: Bottle
qty: 200.0000
unit_cost: 85.5000
total_cost: 17100.0000
cost_calculation_method: FIFO
destination_location_id: loc-550e8400-...
```

---

### stock_in_movement

**Purpose**: Immutable inventory movement records created when transactions are committed.

**Table Definition**:

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| stock_in_transaction_id | UUID | FK to stock_in_transaction, NOT NULL | Source transaction |
| stock_in_item_id | UUID | FK to stock_in_item, NOT NULL | Source line item |
| commit_date | TIMESTAMP | NOT NULL | When movement was created |
| location_id | UUID | FK to tb_location, NOT NULL | Destination location |
| location | VARCHAR(100) | NULL | Denormalized location name |
| product_id | UUID | FK to tb_product, NOT NULL | Product moved |
| item_description | VARCHAR(200) | NULL | Denormalized product description |
| inventory_unit | VARCHAR(20) | NULL | Unit of measure |
| stock_in | DECIMAL(18,4) | NOT NULL | Quantity added (always positive) |
| stock_out | DECIMAL(18,4) | NOT NULL, DEFAULT 0 | Always 0 for stock in |
| amount | DECIMAL(18,4) | NOT NULL | Total value (stock_in * unit_cost) |
| reference | VARCHAR(50) | NULL | Related document reference |
| is_reversed | BOOLEAN | NOT NULL, DEFAULT false | True if movement has been reversed |
| reversal_movement_id | UUID | FK to stock_out_movement, NULL | Link to reversal movement |
| created_date | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp (immutable) |
| created_by | UUID | FK to tb_user, NOT NULL | Creator user ID |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_stock_in_movement_transaction (stock_in_transaction_id)
- INDEX idx_stock_in_movement_product_location (product_id, location_id, commit_date DESC)
- INDEX idx_stock_in_movement_commit_date (commit_date DESC)

**Foreign Keys**:
- stock_in_transaction_id → stock_in_transaction(id) ON DELETE RESTRICT
- stock_in_item_id → stock_in_item(id) ON DELETE RESTRICT
- location_id → tb_location(id) ON DELETE RESTRICT
- product_id → tb_product(id) ON DELETE RESTRICT

**Check Constraints**:
- CHECK (stock_in > 0)
- CHECK (stock_out = 0)
- CHECK (amount >= 0)

**Note**: Movement records are immutable. No modified_date or modified_by fields. No soft delete (deleted_at) as movements must be preserved for audit trail.

**Example Data**:
```
id: mov-550e8400-...
stock_in_transaction_id: 550e8400-...
stock_in_item_id: item-550e8400-...
commit_date: 2024-01-15 11:00:00
location_id: loc-550e8400-...
location: Main Warehouse
product_id: prod-550e8400-...
item_description: Heineken Beer 330ml
inventory_unit: Bottle
stock_in: 200.0000
stock_out: 0.0000
amount: 17100.0000
reference: GRN-2401-0001
is_reversed: false
```

---

### stock_in_comment

**Purpose**: User comments for collaboration and documentation.

**Table Definition**:

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| stock_in_transaction_id | UUID | FK to stock_in_transaction, NOT NULL | Parent transaction |
| date | TIMESTAMP | NOT NULL, DEFAULT NOW() | Comment timestamp |
| by | UUID | FK to tb_user, NOT NULL | Commenter user ID |
| by_name | VARCHAR(100) | NULL | Denormalized user name |
| comment | TEXT | NOT NULL | Comment text (max 1000 chars, supports markdown) |
| mentions | TEXT[] | NULL | Array of mentioned user IDs |
| is_edited | BOOLEAN | NOT NULL, DEFAULT false | True if comment was edited |
| edited_date | TIMESTAMP | NULL | Last edit timestamp |
| created_date | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| created_by | UUID | FK to tb_user, NOT NULL | Creator user ID |
| modified_date | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last modification timestamp |
| modified_by | UUID | FK to tb_user, NOT NULL | Last modifier user ID |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_stock_in_comment_transaction (stock_in_transaction_id, date DESC)
- INDEX idx_stock_in_comment_user (by)

**Example Data**:
```
id: cmt-550e8400-...
stock_in_transaction_id: 550e8400-...
date: 2024-01-15 09:30:00
by: user-550e8400-...
by_name: John Doe
comment: All items received in good condition. Temperature checks completed for beverages.
mentions: []
is_edited: false
```

---

### stock_in_attachment

**Purpose**: File attachments for supporting documentation.

**Table Definition**:

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| stock_in_transaction_id | UUID | FK to stock_in_transaction, NOT NULL | Parent transaction |
| file_name | VARCHAR(255) | NOT NULL | Original file name |
| file_size | BIGINT | NOT NULL | File size in bytes |
| file_type | VARCHAR(100) | NOT NULL | MIME type |
| storage_url | TEXT | NOT NULL | Secure cloud storage URL |
| description | VARCHAR(200) | NULL | User-provided description |
| is_public | BOOLEAN | NOT NULL, DEFAULT false | Public (all users) vs private (authorized only) |
| date | TIMESTAMP | NOT NULL, DEFAULT NOW() | Upload timestamp |
| by | UUID | FK to tb_user, NOT NULL | Uploader user ID |
| by_name | VARCHAR(100) | NULL | Denormalized user name |
| created_date | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| created_by | UUID | FK to tb_user, NOT NULL | Creator user ID |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_stock_in_attachment_transaction (stock_in_transaction_id, date DESC)

**Example Data**:
```
id: att-550e8400-...
stock_in_transaction_id: 550e8400-...
file_name: delivery-note.pdf
file_size: 524288
file_type: application/pdf
storage_url: https://s3.amazonaws.com/inventory-attachments/...
description: Thai Beverage Co. Delivery Note
is_public: true
date: 2024-01-15 09:15:00
by: user-550e8400-...
by_name: John Doe
```

---

### stock_in_activity

**Purpose**: Immutable audit log of all transaction actions.

**Table Definition**:

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| stock_in_transaction_id | UUID | FK to stock_in_transaction, NOT NULL | Parent transaction |
| date | TIMESTAMP | NOT NULL, DEFAULT NOW() | Action timestamp (high precision) |
| by | UUID | FK to tb_user, NOT NULL | User who performed action |
| by_name | VARCHAR(100) | NULL | Denormalized user name |
| action | ENUM | NOT NULL | 'Create', 'Update', 'Commit', 'Void', 'Reverse', 'AutoSave', 'ValidationFailed', 'IntegrationEvent' |
| log | TEXT | NOT NULL | Detailed log message |
| field_changes | JSONB | NULL | For Update actions: array of {field, oldValue, newValue} |
| integration_context | JSONB | NULL | For IntegrationEvent actions: service call details |
| ip_address | INET | NULL | User IP address |
| user_agent | TEXT | NULL | Browser user agent string |
| created_date | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp (immutable) |

**Indexes**:
- PRIMARY KEY (id)
- INDEX idx_stock_in_activity_transaction (stock_in_transaction_id, date DESC)
- INDEX idx_stock_in_activity_user (by, date DESC)
- INDEX idx_stock_in_activity_action (action, date DESC)

**Note**: Activity log is immutable. No modified_date, modified_by, or deleted_at fields.

**Example Data**:
```
id: act-550e8400-...
stock_in_transaction_id: 550e8400-...
date: 2024-01-15 09:00:00.123456
by: user-550e8400-...
by_name: John Doe
action: Create
log: Stock In transaction created
field_changes: null
integration_context: null
ip_address: 192.168.1.100
user_agent: Mozilla/5.0 ...
```

---

## Relationships and Cardinality

| Parent Entity | Child Entity | Relationship | Cardinality | Foreign Key | Cascade |
|---------------|--------------|--------------|-------------|-------------|---------|
| stock_in_transaction | stock_in_item | Parent-Child | 1:N | stock_in_transaction_id | CASCADE on delete |
| stock_in_transaction | stock_in_movement | Parent-Child | 1:N | stock_in_transaction_id | RESTRICT on delete |
| stock_in_transaction | stock_in_comment | Parent-Child | 1:N | stock_in_transaction_id | CASCADE on delete |
| stock_in_transaction | stock_in_attachment | Parent-Child | 1:N | stock_in_transaction_id | CASCADE on delete |
| stock_in_transaction | stock_in_activity | Parent-Child | 1:N | stock_in_transaction_id | RESTRICT on delete |
| stock_in_item | stock_in_movement | Parent-Child | 1:N | stock_in_item_id | RESTRICT on delete |
| tb_location | stock_in_transaction | Referenced | 1:N | location_id | RESTRICT on delete |
| tb_product | stock_in_item | Referenced | 1:N | product_id | RESTRICT on delete |
| tb_unit | stock_in_item | Referenced | 1:N | unit_id | RESTRICT on delete |
| tb_user | stock_in_transaction | Referenced | 1:N | created_by, committed_by | RESTRICT on delete |

**Cascade Rules**:
- **CASCADE on DELETE**: When parent transaction deleted, child records (items, comments, attachments) automatically deleted
- **RESTRICT on DELETE**: Prevent deletion if child records exist (movements, activities must be preserved for audit trail)

---

## Data Integrity Rules

### Referential Integrity

**Enforced via Foreign Keys**:
- All foreign key relationships have ON DELETE constraints (CASCADE or RESTRICT)
- Invalid references prevented at database level
- Orphaned records not possible

### Data Consistency

**Triggers** (Conceptual - implement as needed):

1. **trg_update_total_qty**: After INSERT/UPDATE/DELETE on stock_in_item
   - Recalculate transaction.total_qty = SUM(item.qty)
   - Update transaction.modified_date and modified_by

2. **trg_prevent_committed_edit**: Before UPDATE on stock_in_transaction
   - IF OLD.status = 'Committed' AND operation != soft_delete THEN RAISE EXCEPTION
   - Prevent modification of committed transactions except soft delete

3. **trg_create_movement**: After UPDATE on stock_in_transaction (status changed to 'Committed')
   - FOR EACH line item: INSERT INTO stock_in_movement
   - Create movement records atomically with commit

4. **trg_log_activity**: After INSERT/UPDATE/DELETE on stock_in_transaction
   - INSERT INTO stock_in_activity with action type and details
   - Automatic audit trail creation

5. **trg_validate_reversal**: Before UPDATE on stock_in_transaction (setting is_reversed = true)
   - Check transaction.status = 'Committed'
   - Check transaction.is_reversed = false
   - Prevent double reversals

### Unique Constraints

- **stock_in_transaction.ref_no**: UNIQUE constraint ensures no duplicate reference numbers
- **Generated sequence**: Reference number generation must use database sequence or atomic counter to prevent collisions

### Check Constraints

**stock_in_transaction**:
- total_qty >= 0
- status IN ('Saved', 'Committed', 'Void')
- commit_date and committed_by set only when status = 'Committed'

**stock_in_item**:
- qty > 0 (cannot have zero or negative quantities in stock in)
- unit_cost >= 0 (cost cannot be negative)
- total_cost >= 0

**stock_in_movement**:
- stock_in > 0
- stock_out = 0 (always zero for stock in movements)
- amount >= 0

---

## Performance Considerations

### Indexing Strategy

**Query Patterns**:
1. List transactions by location and status → Index on (location_id, status)
2. List transactions by date range → Index on (date DESC)
3. Search by reference number → Index on (ref_no)
4. Fetch transaction detail with all children → Prisma `include` prevents N+1 queries
5. Movement history for product/location → Index on (product_id, location_id, commit_date DESC)

**Index Maintenance**:
- Rebuild indexes monthly (REINDEX) for heavily-updated tables
- Monitor index usage with pg_stat_user_indexes
- Drop unused indexes to reduce write overhead

### Partitioning (Future Consideration)

**Candidates for Partitioning**:
- **stock_in_movement**: Partition by commit_date (monthly or yearly) as table grows
- **stock_in_activity**: Partition by date for audit log with 7+ years retention

**Partitioning Strategy**:
- Range partitioning by date (e.g., stock_in_movement_2024_01, stock_in_movement_2024_02, ...)
- Automatic partition creation via scheduled job
- Archive old partitions to separate tablespace for cost savings

### Archival Strategy

**Long-Term Data Retention**:
- **Active Data**: Current year + previous 2 years in primary database
- **Archived Data**: Older than 3 years moved to archive database (still queryable but slower)
- **Backup**: 7+ years retained for compliance on cold storage

**Archive Process**:
1. Monthly scheduled job identifies transactions older than 3 years
2. Export to archive database (read-only)
3. Keep metadata in primary database (transaction header only, no line items or movements)
4. Provide "View Archived Transaction" link that queries archive database

---

## Security and Compliance

### Row-Level Security (RLS)

**Concept**: Enforce location-based access control at database level

**Implementation** (PostgreSQL RLS policies):
```
CREATE POLICY stock_in_location_access ON stock_in_transaction
  USING (location_id IN (
    SELECT location_id FROM user_location_access WHERE user_id = current_user_id()
  ));
```

**Benefits**:
- Prevents unauthorized access even if application code bypassed
- Simplifies application logic (no need to add WHERE clauses everywhere)
- Audit-friendly (database enforces access control)

### Encryption

**Data at Rest**:
- Enable PostgreSQL Transparent Data Encryption (TDE) for sensitive fields
- Encrypt file attachments in cloud storage (AES-256)

**Data in Transit**:
- All database connections use SSL/TLS
- API calls to external services use HTTPS only

### Audit Trail

**Requirements**:
- **Immutability**: Activity log cannot be modified or deleted
- **Completeness**: All CRUD operations logged
- **Retention**: 7+ years for compliance
- **Accessibility**: Queryable for audit reports and investigations

**Implementation**:
- stock_in_activity table with no UPDATE/DELETE permissions
- Separate audit database user with INSERT-only access
- Regular backups with long-term retention policy

---

## Backup and Recovery

### Backup Strategy

**Full Backup**: Daily at 2 AM
- Complete database dump (pg_dump)
- Stored in S3 with versioning enabled
- Retention: 30 days

**Incremental Backup**: Every 6 hours
- WAL (Write-Ahead Log) archiving
- Enables point-in-time recovery (PITR)
- Retention: 7 days

**File Attachments Backup**: Daily
- S3 bucket with versioning and cross-region replication
- Lifecycle policy: Archive to Glacier after 90 days
- Retention: 7 years

### Recovery Procedures

**Scenario 1: Accidental Data Deletion**
- Restore from most recent full backup + apply WAL logs up to desired point in time
- Recovery time: < 2 hours

**Scenario 2: Database Corruption**
- Failover to standby replica (read replica promoted to primary)
- Rebuild primary from backup
- Recovery time: < 30 minutes (using standby)

**Scenario 3: Accidental Transaction Commit**
- Use transaction reversal feature (creates offsetting entries)
- Preserves audit trail (original and reversal both recorded)
- No data loss or history tampering

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial data definition |

---

## References

1. **PostgreSQL Documentation**: https://www.postgresql.org/docs/
2. **Prisma Schema Reference**: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
3. **Database Design Best Practices**: Internal Standards Document

---

**Document Control**:
- **Classification**: Internal Use
- **Review Required**: Yes
- **Approved By**: Pending
- **Next Review Date**: TBD
