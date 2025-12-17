# Data Definition: Inventory Transactions

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Inventory Transactions
- **Database**: Carmen ERP
- **Schema Version**: 1.0.0
- **Last Updated**: 2025-11-02
- **Owner**: Inventory Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-02 | Inventory Management Team | Initial version |

---

## Overview

This data definition describes the data structures required for managing inventory transactions across the organization. The system tracks physical inventory movements (receipts, issues, transfers, adjustments, returns) and integrates with the centralized inventory valuation service for accurate costing.

**Key Business Processes Supported**:
- Goods receipt processing (GRN)
- Store requisitions and issues
- Stock transfers between locations
- Inventory adjustments (count reconciliation)
- Vendor returns
- Real-time inventory balance tracking
- General ledger integration

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**
- Describes database structures in text format only
- Explains WHAT data is stored, WHY it exists, HOW it relates
- No SQL code, no CREATE TABLE statements
- For visual diagrams, refer to Flow Diagrams document

**Related Documents**:
- [Inventory Transactions Specification](./SM-inventory-transactions.md)
- [Inventory Valuation Service](../../shared-methods/inventory-valuation/SM-inventory-valuation.md)
- [Transaction Flow Diagrams](./FD-inventory-transactions.md)
- [Business Requirements](./BR-inventory-transactions.md)

---

## Entity Relationship Overview

**Primary Entities**:
- **InventoryTransaction**: Records all physical inventory movements
- **InventoryStatus**: Tracks real-time inventory balances per item/location
- **TransactionLineItem**: Individual line items within a transaction (for multi-item transactions)
- **TransactionAuditLog**: Audit trail for all transaction operations
- **StockAllocation**: Reserved inventory for pending orders/requisitions

**Supporting Entities** (from Inventory Valuation module):
- **FIFOLayer**: Cost layers for FIFO costing method (referenced, not owned)

**Key Relationships**:

1. **InventoryTransaction → InventoryItem**: Many-to-One relationship
   - Business meaning: Each transaction involves one inventory item
   - Cardinality: One InventoryItem has 0 to many InventoryTransaction records
   - Example: Item "Chicken Breast" has 1000s of transactions (receipts, issues, transfers)

2. **InventoryTransaction → Location**: Many-to-One relationship
   - Business meaning: Each transaction occurs at a specific location
   - Cardinality: One Location has 0 to many InventoryTransaction records
   - Example: Location "Main Kitchen" has all its receipts, issues, and transfers

3. **InventoryTransaction → SourceDocument**: Polymorphic relationship
   - Business meaning: Each transaction references its source (GRN, requisition, adjustment)
   - Cardinality: One source document can create multiple transactions (multi-item documents)
   - Example: GRN-2501-0001 creates 5 transactions (one per line item)

4. **InventoryStatus → InventoryItem + Location**: Composite relationship
   - Business meaning: Tracks current quantity for each item at each location
   - Cardinality: One unique combination of item + location
   - Example: Item "Tomatoes" at "Main Kitchen" has quantity 150 units

5. **TransactionLineItem → InventoryTransaction**: Many-to-One relationship
   - Business meaning: Multi-item transactions broken into individual lines
   - Cardinality: One InventoryTransaction has 1 to many TransactionLineItem records
   - Example: GRN with 5 items creates 1 transaction header with 5 line items

6. **StockAllocation → InventoryItem + Location**: Many-to-One relationship
   - Business meaning: Reserved inventory reduces available quantity
   - Cardinality: One item/location can have multiple allocations
   - Example: "Chicken Breast" at "Main Kitchen" has allocations for 3 pending requisitions

7. **TransactionAuditLog → InventoryTransaction**: Many-to-One relationship
   - Business meaning: Each transaction has multiple audit entries (create, modify, post, reverse)
   - Cardinality: One InventoryTransaction has 1 to many audit log entries
   - Example: Transaction TXN-001 has entries for draft, approval, posting, GL integration

**Relationship Notes**:
- InventoryTransaction is the core entity - all movements flow through it
- InventoryStatus is the derived entity - updated by transactions
- Integration with FIFOLayer (from Valuation module) for FIFO costing
- Integration with GL posting for financial accounting
- All entities maintain complete audit trails

---

## Data Entities

### Entity: InventoryTransaction

**Description**: Core entity recording all physical inventory movements across the organization, including receipts, issues, transfers, adjustments, and returns.

**Business Purpose**: Provides complete audit trail of inventory movements. Enables real-time inventory tracking, cost allocation, and integration with financial systems.

**Data Ownership**: Operations/Warehouse teams (different teams for different transaction types)

**Access Pattern**:
- Read: Very frequently (inventory inquiries, reports)
- Write: High frequency (~1K-10K transactions/day)
- Query: By transaction_number, by date range, by item_id, by status
- Performance: Critical for warehouse operations

**Data Volume**: Very high (~300K-3M records/year depending on business size)

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID)
- **Business Key**: transaction_number (human-readable, sequential)
- **Display Name**: transaction_number + transaction_type

**Core Business Fields**:
- **transaction_number**: VARCHAR(50) - Unique business identifier
  - Required: Yes
  - Format: System-generated sequence (e.g., `TXN-2501-001234`)
  - Purpose: Human-readable reference for transaction
  - Example: `TXN-2501-001234`, `GRN-2501-0567`
  - Business rule: Auto-generated on creation, immutable

- **transaction_date**: TIMESTAMP - When transaction occurred
  - Required: Yes
  - Timezone: UTC
  - Purpose: Determines costing period for periodic average
  - Example: `2025-01-20 14:30:00`
  - Business rule: Cannot be future date, backdating allowed with permissions

- **transaction_type**: VARCHAR(50) - Type of inventory movement
  - Required: Yes
  - Allowed values: `GRN`, `ISSUE`, `TRANSFER`, `ADJUST`, `RETURN`
  - Purpose: Categorizes the transaction for processing rules
  - Example: `GRN`
  - Business rule: Immutable once set

- **movement_type**: VARCHAR(20) - Direction of inventory flow
  - Required: Yes
  - Allowed values: `IN`, `OUT`, `TRANSFER`
  - Purpose: Indicates if transaction increases, decreases, or moves inventory
  - Derivation:
    - GRN, ADJUST (positive) → `IN`
    - ISSUE, RETURN, ADJUST (negative) → `OUT`
    - TRANSFER → `TRANSFER`
  - Example: `IN`

- **item_id**: UUID - Inventory item being transacted
  - Required: Yes
  - Purpose: Links to master item data
  - Example: `AA1e1900-...` (Chicken Breast)
  - Business rule: Must be active item, foreign key constraint

- **location_id**: UUID - Location where transaction occurs
  - Required: Yes
  - Purpose: Identifies warehouse/store/kitchen location
  - Example: `BB1e2900-...` (Main Kitchen)
  - Business rule: Must be active location, foreign key constraint

- **quantity**: DECIMAL(19,4) - Transaction quantity
  - Required: Yes
  - Precision: 4 decimal places for fractional units
  - Purpose: Amount being received/issued/transferred
  - Example: `150.5000` (150.5 units)
  - Business rule: Must be positive (direction indicated by movement_type)

- **unit_of_measure**: VARCHAR(50) - UOM for quantity
  - Required: Yes
  - Examples: `KG`, `LBS`, `EACH`, `LITERS`
  - Purpose: Clarifies quantity measurement
  - Business rule: Must match item's primary or alternate UOM

- **unit_cost**: DECIMAL(19,4) - Cost per unit
  - Required: Yes (after costing)
  - Precision: 4 decimal places
  - Purpose: Unit cost from valuation service or source document
  - Example: `12.5500`
  - Calculation:
    - IN transactions (GRN): From purchase order/invoice
    - OUT transactions: From inventory valuation service
    - TRANSFER: From inventory valuation service (cost at source location)

- **total_cost**: DECIMAL(19,2) - Total transaction value
  - Required: Yes (after costing)
  - Precision: 2 decimal places
  - Calculated: quantity × unit_cost
  - Purpose: Total value for financial posting
  - Example: `1889.48` (150.5 × $12.55)

- **source_document_type**: VARCHAR(100) - Type of originating document
  - Required: Yes
  - Examples: `GRN`, `REQUISITION`, `TRANSFER_ORDER`, `ADJUSTMENT`, `VENDOR_RETURN`
  - Purpose: Identifies the source system/module
  - Use case: Traceability and drilldown

- **source_document_id**: UUID - ID of source document
  - Required: Yes
  - Purpose: Links to the originating transaction
  - Example: `CC1e3900-...` (GRN record)
  - Business rule: Must exist in source system

- **source_document_number**: VARCHAR(100) - Business number of source
  - Required: Yes
  - Purpose: Human-readable reference
  - Example: `GRN-2501-0567`
  - Use case: User display and reporting

- **reference_transaction_id**: UUID - Links related transactions
  - Required: No
  - Purpose: Links reversal to original, transfer OUT to transfer IN
  - Example: Reversal transaction links to original transaction
  - Use case: Audit trail and transaction history

- **lot_number**: VARCHAR(100) - Lot/batch tracking
  - Required: No (item-dependent)
  - Purpose: Traceability for lot-controlled items
  - Example: `LOT-2025-JAN-001`
  - Business rule: Required if item has lot tracking enabled

- **expiry_date**: DATE - Expiration date (for perishables)
  - Required: No (item-dependent)
  - Purpose: Track expiration for food safety
  - Example: `2025-02-15`
  - Business rule: Must be future date when received

- **status**: VARCHAR(50) - Transaction workflow state
  - Required: Yes
  - Allowed values: `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `POSTED`, `COMPLETED`, `REVERSED`, `CANCELLED`
  - Purpose: Controls workflow and financial impact
  - Default: `DRAFT`
  - State transitions:
    - DRAFT → PENDING_APPROVAL → APPROVED → POSTED → COMPLETED
    - Any → CANCELLED (before POSTED)
    - POSTED → REVERSED (creates reversal transaction)

- **posted_at**: TIMESTAMP - When transaction was financially posted
  - Required: No (set when status becomes POSTED)
  - Timezone: UTC
  - Purpose: Marks when inventory balance and GL were updated
  - Example: `2025-01-20 15:00:00`
  - Business rule: Immutable once set

- **posted_by**: UUID - User who posted the transaction
  - Required: No (set when posted)
  - Purpose: Accountability for posting action
  - Example: `DD1e4900-...`

- **gl_posted**: BOOLEAN - Whether GL entry has been created
  - Required: Yes
  - Default: false
  - Purpose: Tracks financial integration status
  - Set to: true after successful GL posting

- **gl_posting_reference**: VARCHAR(100) - GL journal reference
  - Required: No (set after GL posting)
  - Purpose: Links inventory transaction to GL entry
  - Example: `JE-2501-01234`
  - Use case: Financial reconciliation

- **reversed_by**: UUID - Transaction that reversed this one
  - Required: No
  - Purpose: Points to reversal transaction
  - Example: `EE1e5900-...` (reversal transaction ID)
  - Business rule: Set only if transaction was reversed

- **reversal_date**: TIMESTAMP - When reversal occurred
  - Required: No
  - Purpose: Audit timestamp for reversals
  - Example: `2025-01-25 10:00:00`

- **reversal_reason**: TEXT - Explanation for reversal
  - Required: Yes (if reversed)
  - Purpose: Audit trail and compliance
  - Example: "GRN quantity error - received 100 instead of 150"
  - Max length: 500 characters

- **notes**: TEXT - Additional transaction notes
  - Required: No
  - Purpose: Free-text documentation
  - Example: "Urgent delivery for event on 2025-01-22"
  - Max length: 1000 characters

**Audit Fields**:
- **created_at**: TIMESTAMP - Transaction creation time
- **created_by**: UUID - User who created transaction
- **updated_at**: TIMESTAMP - Last modification time
- **updated_by**: UUID - User who last modified

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key | 550e8400-... | Unique, Non-null |
| transaction_number | VARCHAR(50) | Yes | Auto-generated | Business identifier | TXN-2501-001234 | Unique, Immutable |
| transaction_date | TIMESTAMP | Yes | - | Transaction timestamp | 2025-01-20 14:30:00 | UTC, Not future |
| transaction_type | VARCHAR(50) | Yes | - | Transaction category | GRN, ISSUE, TRANSFER | ENUM constraint |
| movement_type | VARCHAR(20) | Yes | - | Movement direction | IN, OUT, TRANSFER | ENUM constraint |
| item_id | UUID | Yes | - | Inventory item | AA1e1900-... | Foreign Key, Indexed |
| location_id | UUID | Yes | - | Location reference | BB1e2900-... | Foreign Key, Indexed |
| quantity | DECIMAL(19,4) | Yes | - | Transaction quantity | 150.5000 | Positive |
| unit_of_measure | VARCHAR(50) | Yes | - | Quantity UOM | KG, EACH | From item UOM list |
| unit_cost | DECIMAL(19,4) | Yes | - | Cost per unit | 12.5500 | Non-negative |
| total_cost | DECIMAL(19,2) | Yes | - | Total transaction cost | 1889.48 | Calculated |
| source_document_type | VARCHAR(100) | Yes | - | Source doc type | GRN, REQUISITION | Non-empty |
| source_document_id | UUID | Yes | - | Source doc ID | CC1e3900-... | Foreign Key |
| source_document_number | VARCHAR(100) | Yes | - | Source doc number | GRN-2501-0567 | Non-empty |
| reference_transaction_id | UUID | No | NULL | Related transaction | DD1e4900-... | Foreign Key |
| lot_number | VARCHAR(100) | No | NULL | Lot/batch number | LOT-2025-JAN-001 | - |
| expiry_date | DATE | No | NULL | Expiration date | 2025-02-15 | Future date |
| status | VARCHAR(50) | Yes | 'DRAFT' | Workflow state | DRAFT, POSTED | ENUM constraint |
| posted_at | TIMESTAMP | No | NULL | Posting timestamp | 2025-01-20 15:00:00 | UTC, Immutable |
| posted_by | UUID | No | NULL | Posting user | DD1e4900-... | Foreign Key |
| gl_posted | BOOLEAN | Yes | false | GL integration status | true, false | - |
| gl_posting_reference | VARCHAR(100) | No | NULL | GL journal reference | JE-2501-01234 | - |
| reversed_by | UUID | No | NULL | Reversal transaction | EE1e5900-... | Foreign Key |
| reversal_date | TIMESTAMP | No | NULL | Reversal timestamp | 2025-01-25 10:00:00 | UTC |
| reversal_reason | TEXT | No | NULL | Reversal explanation | "Quantity error..." | Max 500 chars |
| notes | TEXT | No | NULL | Additional notes | "Urgent delivery..." | Max 1000 chars |
| created_at | TIMESTAMP | Yes | NOW() | Creation timestamp | 2025-01-20 14:00:00 | UTC |
| created_by | UUID | Yes | - | Creator user ID | FF1e6900-... | Foreign Key |
| updated_at | TIMESTAMP | Yes | NOW() | Update timestamp | 2025-01-20 14:30:00 | UTC, Auto-update |
| updated_by | UUID | No | NULL | Updater user ID | GG1e7900-... | Foreign Key |

**Indexes**:
- Primary: `id`
- Unique: `transaction_number`
- Index: `transaction_date` - For date range queries
- Composite: `(item_id, transaction_date)` - For item history
- Composite: `(location_id, transaction_date)` - For location activity
- Index: `status` - For workflow queries
- Index: `source_document_type, source_document_id` - For source lookups

**Business Rules**:
1. transaction_number auto-generated and immutable
2. transaction_date cannot be more than 30 days in past (configurable)
3. Only DRAFT and PENDING transactions can be edited
4. POSTED transactions update inventory balances
5. total_cost = quantity × unit_cost (validated on save)
6. Reversals create new transactions with negative quantities
7. Cannot delete POSTED transactions (must reverse)

---

### Entity: InventoryStatus

**Description**: Tracks real-time inventory balances for each item at each location, including on-hand, allocated, and available quantities.

**Business Purpose**: Provides current inventory position for operations, prevents overselling, supports reorder calculations.

**Data Ownership**: System-calculated (updated by transactions)

**Access Pattern**:
- Read: Extremely frequently (every inventory check, every order)
- Write: High frequency (every transaction posting)
- Query: By item_id, by location_id, by item + location
- Performance: Critical - requires optimistic locking for concurrency

**Data Volume**: Moderate (~10K-100K records total for unique item/location combinations)

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID)
- **Business Key**: Composite of item_id + location_id
- **Display Name**: Item name + Location name

**Core Business Fields**:
- **item_id**: UUID - Inventory item
  - Required: Yes
  - Purpose: Item being tracked
  - Example: `AA2e1900-...`
  - Business rule: Part of unique constraint with location_id

- **location_id**: UUID - Storage location
  - Required: Yes
  - Purpose: Where inventory is stored
  - Example: `BB2e2900-...`
  - Business rule: Part of unique constraint with item_id

- **quantity_on_hand**: DECIMAL(19,4) - Total physical quantity
  - Required: Yes
  - Default: 0.0000
  - Purpose: Current physical inventory at location
  - Example: `500.0000`
  - Updated by: Every POSTED transaction
  - Business rule: Cannot go negative (configurable per item)

- **quantity_allocated**: DECIMAL(19,4) - Reserved quantity
  - Required: Yes
  - Default: 0.0000
  - Purpose: Quantity reserved for pending orders/requisitions
  - Example: `150.0000`
  - Updated by: Order/requisition creation and fulfillment
  - Business rule: Cannot exceed quantity_on_hand

- **quantity_available**: DECIMAL(19,4) - Available for new orders
  - Required: Yes
  - Calculated: quantity_on_hand - quantity_allocated
  - Purpose: What can be promised to new orders
  - Example: `350.0000` (500 - 150)
  - Business rule: Auto-calculated, not directly updatable

- **quantity_in_transit**: DECIMAL(19,4) - Goods in transit to location
  - Required: Yes
  - Default: 0.0000
  - Purpose: Inventory en route (for transfers)
  - Example: `50.0000`
  - Updated by: Transfer transactions
  - Business rule: Clears when transfer completes

- **average_unit_cost**: DECIMAL(19,4) - Average cost (for reporting only)
  - Required: No
  - Purpose: Rough cost estimate (NOT used for transaction costing)
  - Calculation: Total inventory value ÷ quantity_on_hand
  - Example: `11.2500`
  - **Important**: This is for reporting only - actual transaction costing uses valuation service

- **total_value**: DECIMAL(19,2) - Total inventory value (for reporting only)
  - Required: No
  - Purpose: Approximate value (NOT used for financial posting)
  - Calculation: quantity_on_hand × average_unit_cost
  - Example: `5625.00`
  - **Important**: This is for reporting only - actual GL posting uses valuation service costs

- **reorder_point**: DECIMAL(19,4) - Reorder threshold
  - Required: No
  - Purpose: Alert when stock falls below this level
  - Example: `100.0000`
  - Business rule: Set per item/location combination

- **reorder_quantity**: DECIMAL(19,4) - Suggested reorder amount
  - Required: No
  - Purpose: Economic order quantity
  - Example: `500.0000`
  - Business rule: Calculated from demand patterns

- **last_transaction_date**: TIMESTAMP - Most recent movement
  - Required: No
  - Purpose: Track inventory turnover
  - Example: `2025-01-20 15:00:00`
  - Updated: Every transaction posting

- **last_transaction_id**: UUID - Most recent transaction
  - Required: No
  - Purpose: Audit trail and drilldown
  - Example: `HH2e3900-...`

- **last_count_date**: DATE - Last physical count
  - Required: No
  - Purpose: Track count frequency
  - Example: `2025-01-15`
  - Updated: Stock adjustment transactions

- **version**: INTEGER - Optimistic locking version
  - Required: Yes
  - Default: 1
  - Purpose: Prevent concurrent update conflicts
  - Increment: On every update
  - Use case: Ensures inventory balance consistency under high concurrency

**Audit Fields**:
- **updated_at**: TIMESTAMP - Last balance update
- **updated_by**: UUID - User/system that triggered last update

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key | 550e8400-... | Unique, Non-null |
| item_id | UUID | Yes | - | Inventory item | AA2e1900-... | Foreign Key, Indexed |
| location_id | UUID | Yes | - | Location | BB2e2900-... | Foreign Key, Indexed |
| quantity_on_hand | DECIMAL(19,4) | Yes | 0.0000 | Physical quantity | 500.0000 | Non-negative |
| quantity_allocated | DECIMAL(19,4) | Yes | 0.0000 | Reserved quantity | 150.0000 | 0 ≤ value ≤ on_hand |
| quantity_available | DECIMAL(19,4) | Yes | Calculated | Available quantity | 350.0000 | Calculated |
| quantity_in_transit | DECIMAL(19,4) | Yes | 0.0000 | Goods in transit | 50.0000 | Non-negative |
| average_unit_cost | DECIMAL(19,4) | No | NULL | Avg cost (reporting) | 11.2500 | Non-negative |
| total_value | DECIMAL(19,2) | No | NULL | Total value (reporting) | 5625.00 | Non-negative |
| reorder_point | DECIMAL(19,4) | No | NULL | Reorder threshold | 100.0000 | Non-negative |
| reorder_quantity | DECIMAL(19,4) | No | NULL | Reorder amount | 500.0000 | Positive |
| last_transaction_date | TIMESTAMP | No | NULL | Recent movement | 2025-01-20 15:00:00 | UTC |
| last_transaction_id | UUID | No | NULL | Recent transaction | HH2e3900-... | Foreign Key |
| last_count_date | DATE | No | NULL | Last physical count | 2025-01-15 | - |
| version | INTEGER | Yes | 1 | Optimistic lock version | 1, 2, 3... | Auto-increment |
| updated_at | TIMESTAMP | Yes | NOW() | Update timestamp | 2025-01-20 15:00:00 | UTC, Auto-update |
| updated_by | UUID | No | NULL | Updater | II2e4900-... | Foreign Key |

**Indexes**:
- Primary: `id`
- Unique: `(item_id, location_id)` - One record per item/location
- Index: `item_id` - For item inquiries
- Index: `location_id` - For location reports
- Index: `quantity_available` - For stock availability queries

**Business Rules**:
1. Unique combination of item_id + location_id
2. quantity_available = quantity_on_hand - quantity_allocated (always)
3. quantity_allocated ≤ quantity_on_hand (enforced)
4. quantity_on_hand cannot go negative (unless backorder enabled for item)
5. version incremented on every update (optimistic locking)
6. average_unit_cost and total_value are for reporting only (not financial posting)

**Concurrency Control**:
```
UPDATE inventory_status
SET quantity_on_hand = quantity_on_hand + ?,
    updated_at = NOW(),
    version = version + 1
WHERE item_id = ?
  AND location_id = ?
  AND version = ?  -- Optimistic lock check

IF affected_rows == 0:
  THROW ConcurrencyError "Inventory was modified by another transaction"
```

---

### Entity: TransactionLineItem

**Description**: Individual line items for multi-item transactions (GRN, requisitions, transfers with multiple items).

**Business Purpose**: Supports batch transactions while maintaining granular tracking. Enables rollup reporting and detailed drilldown.

**Data Ownership**: Created with parent transaction

**Access Pattern**:
- Read: Frequently with parent transaction
- Write: Created with transaction, updated during approval
- Query: By transaction_id, by item_id
- Performance: Joined with transaction for display

**Data Volume**: High (5-20 line items per transaction × transaction volume)

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID)
- **Business Key**: Combination of transaction_id + line_number
- **Display Name**: Parent transaction number + line number

**Core Business Fields**:
- **transaction_id**: UUID - Parent transaction
  - Required: Yes
  - Purpose: Links to transaction header
  - Example: `JJ2e5900-...`
  - Business rule: Must reference valid InventoryTransaction

- **line_number**: INTEGER - Line sequence within transaction
  - Required: Yes
  - Purpose: Ordering and display
  - Example: `1`, `2`, `3`
  - Business rule: Unique within transaction, sequential

- **item_id**: UUID - Line item
  - Required: Yes
  - Purpose: Item being transacted
  - Example: `KK2e6900-...`

- **quantity**: DECIMAL(19,4) - Line quantity
  - Required: Yes
  - Purpose: Amount for this line
  - Example: `25.0000`

- **unit_cost**: DECIMAL(19,4) - Line unit cost
  - Required: Yes
  - Purpose: Cost per unit
  - Example: `10.5000`

- **total_cost**: DECIMAL(19,2) - Line total
  - Required: Yes
  - Calculated: quantity × unit_cost
  - Example: `262.50`

- **lot_number**: VARCHAR(100) - Line lot number
  - Required: No (item-dependent)

- **expiry_date**: DATE - Line expiration
  - Required: No (item-dependent)

- **notes**: TEXT - Line-specific notes
  - Required: No
  - Max length: 500 characters

**Audit Fields**:
- **created_at**: TIMESTAMP
- **updated_at**: TIMESTAMP

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key | 550e8400-... | Unique, Non-null |
| transaction_id | UUID | Yes | - | Parent transaction | JJ2e5900-... | Foreign Key, Indexed |
| line_number | INTEGER | Yes | - | Line sequence | 1, 2, 3 | Positive, Unique within txn |
| item_id | UUID | Yes | - | Line item | KK2e6900-... | Foreign Key, Indexed |
| quantity | DECIMAL(19,4) | Yes | - | Line quantity | 25.0000 | Positive |
| unit_cost | DECIMAL(19,4) | Yes | - | Unit cost | 10.5000 | Non-negative |
| total_cost | DECIMAL(19,2) | Yes | - | Line total | 262.50 | Calculated |
| lot_number | VARCHAR(100) | No | NULL | Lot number | LOT-001 | - |
| expiry_date | DATE | No | NULL | Expiry | 2025-02-15 | Future |
| notes | TEXT | No | NULL | Notes | "Partial receipt" | Max 500 chars |
| created_at | TIMESTAMP | Yes | NOW() | Creation time | 2025-01-20 14:00:00 | UTC |
| updated_at | TIMESTAMP | Yes | NOW() | Update time | 2025-01-20 14:30:00 | UTC |

**Indexes**:
- Primary: `id`
- Unique: `(transaction_id, line_number)`
- Index: `transaction_id` - For parent lookup
- Index: `item_id` - For item history

**Business Rules**:
1. line_number starts at 1, sequential within transaction
2. total_cost = quantity × unit_cost
3. Line items inherit transaction status
4. Cannot delete lines from POSTED transactions

---

### Entity: StockAllocation

**Description**: Records reserved inventory for pending orders, requisitions, or production requirements.

**Business Purpose**: Prevents double-promising of inventory. Ensures accurate available quantity calculations.

**Data Ownership**: Order/requisition processing systems

**Access Pattern**:
- Read: Frequently for availability checks
- Write: On order creation, updated on fulfillment
- Query: By item + location, by source document
- Lifecycle: Created with order, deleted on fulfillment or cancellation

**Data Volume**: Moderate (~5K-50K active records)

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID)
- **Business Key**: Composite of source_type + source_id + item_id
- **Display Name**: Source document number

**Core Business Fields**:
- **item_id**: UUID - Allocated item
- **location_id**: UUID - Allocation location
- **allocated_quantity**: DECIMAL(19,4) - Reserved amount
- **source_type**: VARCHAR(100) - Allocating document type (ORDER, REQUISITION, PRODUCTION)
- **source_id**: UUID - Source document ID
- **source_number**: VARCHAR(100) - Source document number
- **allocation_date**: TIMESTAMP - When allocated
- **required_by_date**: DATE - When needed
- **status**: VARCHAR(50) - ACTIVE, FULFILLED, EXPIRED, CANCELLED

**Audit Fields**:
- **created_at**: TIMESTAMP
- **created_by**: UUID

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key | 550e8400-... | Unique |
| item_id | UUID | Yes | - | Item | LL2e7900-... | Foreign Key, Indexed |
| location_id | UUID | Yes | - | Location | MM2e8900-... | Foreign Key |
| allocated_quantity | DECIMAL(19,4) | Yes | - | Allocated amount | 50.0000 | Positive |
| source_type | VARCHAR(100) | Yes | - | Source type | ORDER, REQUISITION | ENUM |
| source_id | UUID | Yes | - | Source ID | NN2e9900-... | Foreign Key |
| source_number | VARCHAR(100) | Yes | - | Source number | REQ-2501-0001 | - |
| allocation_date | TIMESTAMP | Yes | NOW() | Allocation time | 2025-01-20 14:00:00 | UTC |
| required_by_date | DATE | No | NULL | Required date | 2025-01-25 | - |
| status | VARCHAR(50) | Yes | 'ACTIVE' | Allocation status | ACTIVE, FULFILLED | ENUM |
| created_at | TIMESTAMP | Yes | NOW() | Creation time | 2025-01-20 14:00:00 | UTC |
| created_by | UUID | Yes | - | Creator | OO3e0900-... | Foreign Key |

**Indexes**:
- Primary: `id`
- Composite: `(item_id, location_id, status)` - For availability queries
- Index: `(source_type, source_id)` - For source lookup
- Index: `required_by_date` - For expiration checks

**Business Rules**:
1. Allocations reduce quantity_available
2. ACTIVE allocations counted in quantity_allocated
3. FULFILLED/CANCELLED allocations removed from quantity_allocated
4. Allocations can expire if not fulfilled by required_by_date

---

### Entity: TransactionAuditLog

**Description**: Comprehensive audit trail for all inventory transaction operations, status changes, and modifications.

**Business Purpose**: Provides compliance, traceability, and debugging for inventory movements. Required for operational and financial audits.

**Data Ownership**: System-generated

**Access Pattern**:
- Write: On every transaction operation
- Read: For audit reports, investigation
- Query: By transaction_id, by user, by date range
- Retention: Long-term (years)

**Data Volume**: Very high (~5-20 records per transaction × transaction volume)

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier (UUID)
- **Business Key**: Combination of transaction_id + event_type + timestamp
- **Display Name**: event_type + event_description

**Core Business Fields**:
- **transaction_id**: UUID - Transaction being audited
  - Required: Yes
  - Purpose: Links to transaction
  - Example: `PP3e1900-...`

- **event_type**: VARCHAR(100) - Type of event
  - Required: Yes
  - Allowed values:
    - `TRANSACTION_CREATED` - Initial creation
    - `TRANSACTION_MODIFIED` - Edit to DRAFT
    - `STATUS_CHANGED` - Workflow transition
    - `APPROVAL_REQUESTED` - Sent for approval
    - `APPROVED` - Approval granted
    - `REJECTED` - Approval denied
    - `POSTED` - Financial posting
    - `GL_POSTED` - GL integration complete
    - `REVERSED` - Transaction reversed
    - `CANCELLED` - Transaction cancelled
  - Purpose: Categorizes audit event

- **event_description**: TEXT - Human-readable description
  - Required: Yes
  - Purpose: Explains what happened
  - Example: "Transaction status changed from DRAFT to PENDING_APPROVAL"
  - Max length: 500 characters

- **old_value**: JSON - Previous state
  - Required: No
  - Purpose: Before snapshot
  - Example: `{"status": "DRAFT", "quantity": 100}`

- **new_value**: JSON - New state
  - Required: No
  - Purpose: After snapshot
  - Example: `{"status": "PENDING_APPROVAL", "quantity": 150}`

- **user_id**: UUID - User who triggered event
  - Required: Yes (SYSTEM if automated)
  - Purpose: Accountability

- **timestamp**: TIMESTAMP - Event time
  - Required: Yes
  - Timezone: UTC
  - Precision: Milliseconds

- **ip_address**: VARCHAR(50) - User IP
  - Required: No
  - Purpose: Security audit

**Audit Fields**:
- **created_at**: TIMESTAMP

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key | 550e8400-... | Unique |
| transaction_id | UUID | Yes | - | Transaction | PP3e1900-... | Foreign Key, Indexed |
| event_type | VARCHAR(100) | Yes | - | Event category | TRANSACTION_CREATED | ENUM |
| event_description | TEXT | Yes | - | Description | "Status changed..." | Max 500 chars |
| old_value | JSON | No | NULL | Previous state | {"status": "DRAFT"} | - |
| new_value | JSON | No | NULL | New state | {"status": "POSTED"} | - |
| user_id | UUID | Yes | - | User | QQ3e2900-... | Foreign Key |
| timestamp | TIMESTAMP | Yes | NOW() | Event time | 2025-01-20 14:00:00 | UTC, Millisecond |
| ip_address | VARCHAR(50) | No | NULL | IP | 192.168.1.100 | - |
| created_at | TIMESTAMP | Yes | NOW() | Creation time | 2025-01-20 14:00:00 | UTC |

**Indexes**:
- Primary: `id`
- Index: `transaction_id` - For transaction history
- Index: `event_type` - For filtering
- Index: `timestamp` - For date range queries
- Index: `user_id` - For user activity reports

**Business Rules**:
1. Audit log entries are immutable
2. Every status change must be logged
3. Retention: Minimum 7 years
4. Async logging to avoid blocking transactions

---

## Data Integrity Rules

### Cross-Entity Validation

1. **Transaction-Balance Consistency**:
   - Sum of POSTED transaction quantities = InventoryStatus.quantity_on_hand
   - IN transactions increase balance, OUT transactions decrease balance
   - TRANSFER creates two transactions (OUT at source, IN at destination)

2. **Allocation Integrity**:
   - Sum of ACTIVE allocations = InventoryStatus.quantity_allocated
   - quantity_allocated ≤ quantity_on_hand
   - quantity_available = quantity_on_hand - quantity_allocated

3. **Transaction Workflow**:
   - Only POSTED transactions update balances
   - REVERSED transactions create offsetting entries
   - Cannot modify POSTED transactions (must reverse)

4. **Costing Integration**:
   - OUT transactions MUST call valuation service for cost
   - IN transactions (GRN) use cost from purchase order
   - TRANSFER transactions use source location cost

5. **Audit Trail Completeness**:
   - Every transaction must have CREATED audit entry
   - Status changes must have audit entries
   - Reversals must have reason logged

### Referential Integrity

- **InventoryTransaction.item_id** → InventoryItem.id (mandatory)
- **InventoryTransaction.location_id** → Location.id (mandatory)
- **InventoryTransaction.source_document_id** → Source table (polymorphic)
- **InventoryStatus.item_id** → InventoryItem.id (mandatory)
- **InventoryStatus.location_id** → Location.id (mandatory)
- **TransactionLineItem.transaction_id** → InventoryTransaction.id (cascade delete)
- **StockAllocation.item_id** → InventoryItem.id (mandatory)
- **TransactionAuditLog.transaction_id** → InventoryTransaction.id (no cascade)
- **All created_by/updated_by** → User.id (mandatory)

### Data Quality Rules

1. **Monetary Fields**:
   - All cost fields non-negative
   - Precision: 4 decimals unit cost, 2 decimals totals
   - Rounding: Only on final totals

2. **Quantity Fields**:
   - All quantities non-negative
   - Precision: 4 decimal places
   - Zero quantities allowed (for reversals)

3. **Date/Time Fields**:
   - All timestamps in UTC
   - transaction_date not more than 30 days past (configurable)
   - No future dates allowed

4. **Unique Constraints**:
   - One InventoryStatus per item + location
   - Unique transaction_number system-wide
   - Unique line_number within transaction

---

## Performance Considerations

### Indexing Strategy

**Critical Indexes**:
1. `InventoryTransaction(transaction_number)` - Unique
2. `InventoryTransaction(item_id, transaction_date)` - Item history
3. `InventoryTransaction(status)` - Workflow queries
4. `InventoryStatus(item_id, location_id)` - Unique, availability
5. `TransactionAuditLog(transaction_id, timestamp)` - Audit trail

**Optional Indexes**:
- `InventoryTransaction(source_document_type, source_document_id)`
- `StockAllocation(item_id, location_id, status)`
- `TransactionLineItem(item_id)`

### Caching Recommendations

1. **Application Cache**:
   - InventoryStatus for high-volume items (15-minute TTL)
   - Active allocations (5-minute TTL)

2. **Optimistic Locking**:
   - InventoryStatus.version field prevents concurrent conflicts
   - Retry logic for version mismatches

### Data Volume Management

1. **InventoryTransaction**:
   - Partition by year for very high volume
   - Archive COMPLETED transactions older than 2 years
   - Retain for audit (never delete)

2. **TransactionAuditLog**:
   - Partition by month
   - Archive logs older than 7 years to cold storage

3. **StockAllocation**:
   - Purge FULFILLED/CANCELLED older than 90 days
   - Active records only (low volume)

---

## Security and Access Control

### Data Access Levels

1. **InventoryTransaction**:
   - Read: All warehouse/operations staff
   - Create DRAFT: Department staff
   - Approve: Department managers
   - Post: Inventory managers only
   - Reverse: Finance/Inventory managers with approval

2. **InventoryStatus**:
   - Read: All staff
   - Write: System-generated only (via transactions)

3. **StockAllocation**:
   - Read: Operations staff
   - Write: Order/requisition systems only

4. **Audit Logs**:
   - Read: Administrators, Auditors
   - Write: System-generated only
   - Delete: Prohibited

### Data Retention

- **InventoryTransaction**: 7 years minimum
- **InventoryStatus**: Current state only
- **TransactionAuditLog**: 7 years minimum
- **StockAllocation**: 90 days after fulfillment

---

**End of Data Definition Document**

**Note**: This document describes data structures in text format only. For implementation details, refer to:
- System Method (SM) for business rules and workflows
- Flow Diagrams (FD) for visual process flows
- Validation Rules (VAL) for field-level validations
