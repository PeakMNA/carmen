# UC-LOT: Lot-Based Costing Use Cases

**Document Version**: 1.0
**Last Updated**: 2025-11-07
**Module**: Inventory Management
**Feature**: Lot-Based Costing with Automatic Lot Creation

---

## Document Overview

This document defines the use cases for the lot-based costing system with automatic lot record creation for inventory receipts (GRN and stock-in adjustments). All use cases support FIFO inventory valuation methodology.

**Related Documents**:
- [BR-LOT: Business Requirements](./BR-lot-based-costing.md)
- [SM: Costing Methods](../../shared-methods/inventory-valuation/SM-costing-methods.md)
- [SM: Transaction Types and Cost Layers](../../shared-methods/inventory-valuation/SM-transaction-types-and-cost-layers.md)

---

## Actor Definitions

### Primary Actors

| Actor | Role | Responsibilities |
|-------|------|------------------|
| **Storekeeper** | Store/warehouse operations | Process inventory receipts, adjustments, and issues |
| **Purchasing Staff** | Procurement operations | Commit GRNs, manage purchase orders |
| **Head Chef** | Production planning | Issue ingredients from inventory, review lot traceability |
| **Financial Controller** | Financial oversight | Monitor inventory valuation, review costing reports |
| **System Administrator** | System configuration | Configure locations, manage master data |

### System Actors

| Actor | Role | Responsibilities |
|-------|------|------------------|
| **Lot Generation Service** | Automated service | Generate unique lot numbers, maintain sequence counters |
| **FIFO Consumption Engine** | Automated service | Calculate FIFO consumption, update cost layers |
| **Period-End Process** | Scheduled job | Snapshot lot balances, close/open periods |

---

## Use Case Catalog

| Use Case ID | Use Case Name | Priority | Complexity | Frequency |
|-------------|---------------|----------|------------|-----------|
| UC-LOT-001 | Create Lot Records on GRN Commitment | High | Medium | Daily |
| UC-LOT-002 | Create Lot Records on Stock-In Adjustment | High | Medium | Weekly |
| UC-LOT-003 | Generate Lot Numbers Automatically | Critical | Low | Daily |
| UC-LOT-004 | Consume Inventory Using FIFO | Critical | High | Daily |
| UC-LOT-005 | Query Lot Balances | High | Medium | Daily |
| UC-LOT-006 | Trace Lot Consumption History | Medium | Medium | Weekly |
| UC-LOT-007 | Handle Inventory Issues with FIFO | High | High | Daily |
| UC-LOT-008 | Adjust Lot Quantities (Stock-Out) | Medium | Medium | Weekly |
| UC-LOT-009 | Transfer Inventory Between Locations | Medium | High | Daily |
| UC-LOT-010 | Generate Lot Balance Reports | Medium | Low | Daily |

---

## Detailed Use Cases

### UC-LOT-001: Create Lot Records on GRN Commitment

**Priority**: High
**Status**: New Feature
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---
**Trigger**: Purchasing Staff commits a Good Received Note (GRN)

#### Primary Flow

**Preconditions**:
- Purchase Order exists with status "Approved"
- GRN has been created and linked to PO
- Products have been received and verified
- Each GRN line has quantity and unit cost

**Main Success Scenario**:

1. **Purchasing Staff** commits the GRN in the procurement system
2. **System** validates GRN data:
   - All required fields populated (product, quantity, unit cost, location)
   - Quantities match within acceptable variance
   - Unit costs are positive non-zero values
3. **System** retrieves location code for the receiving location
4. **Lot Generation Service** generates lot number for each GRN line:
   - Format: `{LOCATION}-{YYMMDD}-{SEQSEQ}` (4-digit sequence)
   - Example: `MK-251107-0001` (Main Kitchen, 2025-11-07, sequence 0001)
   - Sequence increments per location per day
5. **System** creates inventory transaction record:
   - `transaction_type` = `good_received_note`
   - `transaction_id` = GRN reference number
   - `transaction_date` = GRN commitment date
6. **System** creates cost layer record for each GRN line:
   - `lot_no` = Generated lot number
   - `lot_index` = 1 (initial creation)
   - `parent_lot_no` = NULL (indicates LOT creation)
   - `transaction_type` = `good_received_note`
   - `in_qty` = Received quantity
   - `out_qty` = 0
   - `cost_per_unit` = Unit cost from GRN
   - `total_cost` = in_qty × cost_per_unit
   - `location_id`, `location_code` = Receiving location
   - `lot_at_date` = GRN commitment date
   - `lot_seq_no` = Sequence number (1-9999)
   - `product_id` = Product identifier
7. **System** updates inventory balances:
   - Creates/updates `tb_inventory_transaction_closing_balance` record
   - Balance = SUM(in_qty) - SUM(out_qty) for the lot
8. **System** logs the transaction in activity log
9. **System** displays success message: "Lot {LOT_NO} created for {PRODUCT_NAME}"

**Postconditions**:
- GRN status changed to "Committed"
- Lot record created with balance = received quantity
- Inventory balance increased by received quantity
- Transaction visible in lot traceability reports

#### Alternate Flows

**A1: Duplicate Lot Number Detected**
- **Step**: After step 4
- **Flow**:
  - System detects existing lot with same lot_no
  - System increments sequence and retries (up to 3 attempts)
  - If all attempts fail, system generates error
  - Transaction rolled back
  - Error logged: "Unable to generate unique lot number for location {LOCATION}"

**A2: Multiple Products in Single GRN**
- **Step**: At step 4
- **Flow**:
  - System processes each GRN line sequentially
  - Each line gets unique lot number with same date, incremented sequence
  - Example:
    - Line 1: `MK-251107-0001` (Flour)
    - Line 2: `MK-251107-0002` (Sugar)
    - Line 3: `MK-251107-0003` (Butter)

**A3: Sequence Exceeds 9999**
- **Step**: During step 4
- **Flow**:
  - System checks if sequence > 9999
  - System generates error: "Daily lot limit exceeded for location {LOCATION}"
  - Transaction blocked, manual intervention required
  - System administrator creates additional location code or splits receipt

#### Exception Flows

**E1: Invalid Unit Cost**
- **Condition**: Unit cost ≤ 0
- **Flow**: System rejects GRN commitment, displays error: "Unit cost must be greater than zero"

**E2: Location Not Found**
- **Condition**: Receiving location not configured
- **Flow**: System blocks transaction, requires location setup first

**E3: Database Constraint Violation**
- **Condition**: Unique constraint violation on `lot_no`
- **Flow**: Transaction rolled back, retry with incremented sequence

#### Business Rules
- BR-LOT-001: Lot number format must be `{LOCATION}-{YYMMDD}-{SEQSEQ}` (4 digits)
- BR-LOT-002: Lot creation date = GRN commitment date (not receipt date)
- BR-LOT-003: Each GRN line creates separate lot record
- BR-LOT-004: `parent_lot_no` must be NULL for LOT transactions
- BR-LOT-005: `in_qty` must be > 0 for lot creation

---

### UC-LOT-002: Create Lot Records on Stock-In Adjustment

**Priority**: High
**Status**: New Feature
**Trigger**: Storekeeper saves a stock-in inventory adjustment

#### Primary Flow

**Preconditions**:
- Inventory adjustment form is open
- Adjustment type = "Stock In" (positive adjustment)
- Product, location, quantity, and unit cost specified
- Unit cost represents actual replacement cost

**Main Success Scenario**:

1. **Storekeeper** fills in stock-in adjustment form:
   - Product selection
   - Location selection
   - Adjustment quantity (positive)
   - Unit cost (actual replacement cost)
   - Reason code (e.g., "Found stock", "Correction", "Physical count adjustment")
   - Reference document (optional)
   - Notes (optional)
2. **Storekeeper** clicks "Save Adjustment"
3. **System** validates adjustment data:
   - Quantity > 0 (must be positive for stock-in)
   - Unit cost > 0
   - Location exists and is active
   - Product exists and is active
   - Reason code is valid
4. **System** retrieves location code
5. **Lot Generation Service** generates lot number:
   - Format: `{LOCATION}-{YYMMDD}-{SEQSEQ}` (4-digit sequence)
   - Example: `PV-251107-0005` (Pastry Venue, 2025-11-07, sequence 0005)
   - Uses adjustment date for date component
6. **System** creates inventory transaction record:
   - `transaction_type` = `adjustment`
   - `transaction_id` = Adjustment reference number (e.g., "ADJ-2501-001234")
   - `transaction_date` = Adjustment date
7. **System** creates cost layer record:
   - `lot_no` = Generated lot number
   - `lot_index` = 1 (initial creation)
   - `parent_lot_no` = NULL (indicates LOT creation, not consumption)
   - `transaction_type` = `adjustment`
   - `in_qty` = Adjustment quantity
   - `out_qty` = 0
   - `cost_per_unit` = User-entered unit cost
   - `total_cost` = in_qty × cost_per_unit
   - `location_id`, `location_code` = Adjustment location
   - `lot_at_date` = Adjustment date
   - `lot_seq_no` = Sequence number
   - `product_id` = Adjusted product
8. **System** updates inventory balances:
   - Creates/updates closing balance record
   - Balance = Adjustment quantity (new lot)
9. **System** logs adjustment in activity log
10. **System** displays confirmation: "Stock-in adjustment saved. Lot {LOT_NO} created."

**Postconditions**:
- Inventory adjustment committed
- New lot created with balance = adjustment quantity
- Overall inventory balance increased
- Adjustment appears in lot traceability reports

#### Alternate Flows

**A1: System-Generated Cost (Future Enhancement)**
- **Step**: Instead of step 1 (manual cost entry)
- **Flow**:
  - System retrieves latest purchase cost for product
  - System pre-populates unit cost field
  - Storekeeper can override if needed
  - System logs whether cost was overridden

**A2: Batch Adjustment (Multiple Products)**
- **Step**: At step 1
- **Flow**:
  - Storekeeper adds multiple products to adjustment
  - Each product line gets separate lot number
  - All adjustments processed in single transaction
  - Example:
    - Line 1: `PV-251107-0005` (Flour, +10 kg)
    - Line 2: `PV-251107-0006` (Sugar, +5 kg)

**A3: Physical Count Adjustment**
- **Step**: At step 1
- **Flow**:
  - Reason code = "Physical count variance"
  - System requires count date and counter name
  - System links to physical count document
  - Variance quantity becomes adjustment quantity

#### Exception Flows

**E1: Negative Quantity Entered**
- **Condition**: Adjustment quantity < 0
- **Flow**: System displays error: "Stock-in adjustment must have positive quantity. Use stock-out adjustment for negative quantities."

**E2: Zero Cost Entered**
- **Condition**: Unit cost = 0
- **Flow**: System displays warning: "Zero cost will affect inventory valuation. Confirm to proceed?" (requires confirmation)

**E3: Invalid Reason Code**
- **Condition**: Reason code not in allowed list
- **Flow**: System blocks save, requires valid reason code selection

#### Business Rules
- BR-LOT-001: Lot number format must be `{LOCATION}-{YYMMDD}-{SEQSEQ}` (4 digits)
- BR-LOT-006: Stock-in adjustment creates new lot (parent_lot_no = NULL)
- BR-LOT-007: Adjustment date determines lot number date component
- BR-LOT-008: Unit cost required for stock-in adjustments (no default)

---

### UC-LOT-003: Generate Lot Numbers Automatically

**Priority**: Critical
**Status**: New Feature
**Trigger**: System needs to create a new lot record (called by UC-LOT-001 or UC-LOT-002)

#### Primary Flow

**Preconditions**:
- Location code is known and valid
- Receipt/adjustment date is known
- Database connection is available

**Main Success Scenario**:

1. **Calling Process** (GRN or Adjustment) requests lot number generation
2. **Lot Generation Service** receives request with:
   - `location_code` (e.g., "MK")
   - `receipt_date` (e.g., 2025-11-07)
3. **Service** formats date component:
   - Extract year (2 digits): 25
   - Extract month (2 digits): 11
   - Extract day (2 digits): 07
   - Result: "251107"
4. **Service** queries database for last sequence:
```sql
SELECT lot_seq_no
FROM tb_inventory_transaction_cost_layer
WHERE location_code = 'MK'
  AND lot_at_date::date = '2025-11-07'::date
ORDER BY lot_seq_no DESC
LIMIT 1
```
5. **Service** calculates next sequence number:
   - If no existing lots: sequence = 1
   - If existing lots found: sequence = last_lot_seq_no + 1
6. **Service** formats sequence with 4-digit padding:
   - sequence = 1 → "0001"
   - sequence = 42 → "0042"
   - sequence = 999 → "0999"
   - sequence = 1234 → "1234"
7. **Service** constructs lot number:
   - Pattern: `{location_code}-{date_str}-{seq_str}`
   - Example: `MK-251107-0001`
8. **Service** validates lot number:
   - Length check (format validation)
   - Uniqueness check (database query)
9. **Service** returns lot number to calling process

**Postconditions**:
- Unique lot number generated
- Sequence number stored for reference
- Lot number ready for cost layer creation

#### Alternate Flows

**A1: First Lot of the Day**
- **Step**: At step 4
- **Flow**:
  - Query returns no results
  - Sequence starts at 1
  - First lot becomes: `{LOCATION}-{YYMMDD}-0001`

**A2: Multiple Concurrent Requests**
- **Step**: During step 4-5
- **Flow**:
  - Service uses database-level locking
  - Row-level lock on location sequence table
  - Each request gets unique sequence atomically
  - Lock released after sequence increment

**A3: Sequence Gap Detection**
- **Step**: After step 5
- **Flow**:
  - Service detects gap in sequence (e.g., 0001, 0002, 0005 - missing 0003, 0004)
  - Service logs warning but continues with next available
  - Gap likely due to rolled-back transactions
  - No automatic gap filling (preserves audit trail)

#### Exception Flows

**E1: Invalid Location Code**
- **Condition**: Location code is NULL or empty
- **Flow**: Service throws exception: "Location code required for lot generation"

**E2: Invalid Date**
- **Condition**: Receipt date is NULL or in future
- **Flow**: Service throws exception: "Valid receipt date required"

**E3: Sequence Limit Exceeded**
- **Condition**: Next sequence would be > 9999
- **Flow**:
  - Service throws exception: "Daily lot limit (9999) exceeded for location {LOCATION}"
  - Calling process displays error to user
  - Requires manual intervention (create sub-location or defer receipt)

**E4: Duplicate Lot Number After Generation**
- **Condition**: Generated lot_no already exists (race condition)
- **Flow**:
  - Service retries with incremented sequence
  - Maximum 3 retry attempts
  - If all retries fail, throws exception

#### Business Rules
- BR-LOT-001: Format `{LOCATION}-{YYMMDD}-{SEQSEQ}` with 4-digit sequence
- BR-LOT-009: Sequence resets daily per location (date-based partitioning)
- BR-LOT-010: Maximum 9,999 lots per location per day
- BR-LOT-011: No sequence reuse (even after transaction rollback)
- BR-LOT-012: Location code must be uppercase alphanumeric (2-4 chars)

---

### UC-LOT-004: Consume Inventory Using FIFO

**Priority**: Critical
**Status**: New Feature
**Trigger**: System processes an inventory issue transaction

#### Primary Flow

**Preconditions**:
- Issue transaction created (e.g., production issue, store requisition, transfer-out)
- Product, location, and issue quantity specified
- Sufficient inventory balance exists

**Main Success Scenario**:

1. **User** (Chef/Storekeeper) creates issue transaction:
   - Product selection
   - Issue quantity
   - Issue date
   - Reference document (recipe, requisition, transfer order)
2. **System** validates issue request:
   - Product exists and is active
   - Location has inventory of the product
   - Available balance ≥ issue quantity
3. **FIFO Consumption Engine** queries available lots:
```sql
SELECT lot_no,
  SUM(in_qty) - SUM(out_qty) as remaining_quantity,
  cost_per_unit,
  lot_at_date
FROM tb_inventory_transaction_cost_layer
WHERE product_id = :product_id
  AND location_id = :location_id
  AND lot_no IS NOT NULL
GROUP BY lot_no, cost_per_unit, lot_at_date
HAVING SUM(in_qty) - SUM(out_qty) > 0
ORDER BY lot_no ASC  -- Chronological order due to date-based format
```
4. **Engine** determines lots to consume:
   - Start with oldest lot (first in result set)
   - If lot balance ≥ issue quantity: consume from this lot only
   - If lot balance < issue quantity: consume entire lot, continue to next lot
   - Repeat until issue quantity fully allocated
5. **System** creates inventory transaction record:
   - `transaction_type` = `issue` (or `transfer_out`, etc.)
   - `transaction_id` = Issue reference number
   - `transaction_date` = Issue date
6. **System** creates cost layer record for each consumed lot:
   - `lot_no` = NULL (consumption record doesn't have its own lot number)
   - `lot_index` = Auto-incremented per parent lot
   - `parent_lot_no` = Lot number being consumed
   - `transaction_type` = Issue transaction type
   - `in_qty` = 0
   - `out_qty` = Quantity consumed from this lot
   - `cost_per_unit` = Cost from parent lot
   - `total_cost` = out_qty × cost_per_unit
   - `location_id`, `location_code` = Issue location
7. **System** calculates total issue cost:
   - Sum of all `total_cost` values from consumed lots
   - Weighted average cost = total_cost / total_issue_qty
8. **System** updates closing balances:
   - Decreases balance for each consumed lot
9. **System** logs consumption in activity log
10. **System** displays confirmation:
    - "Issue completed. Consumed from lots: {LOT_LIST}"
    - "Total cost: {TOTAL_COST}"

**Postconditions**:
- Issue transaction committed
- Multiple cost layer records created (one per consumed lot)
- Lot balances decreased by consumed quantities
- Overall inventory balance decreased by issue quantity
- Issue cost calculated using FIFO methodology

#### Alternate Flows

**A1: Single Lot Consumption**
- **Step**: At step 4
- **Flow**:
  - Issue quantity = 10 kg
  - Oldest lot balance = 50 kg
  - Engine consumes 10 kg from single lot
  - Lot balance becomes 40 kg
  - Example:
    - Parent lot: `MK-251107-0001`
    - Remaining after issue: 40 kg

**A2: Multiple Lot Consumption**
- **Step**: At step 4
- **Flow**:
  - Issue quantity = 100 kg
  - Oldest lot balance = 30 kg (cost: $5.00/kg)
  - Second lot balance = 80 kg (cost: $5.20/kg)
  - Engine consumes:
    - 30 kg from first lot @ $5.00 = $150.00
    - 70 kg from second lot @ $5.20 = $364.00
  - Total cost = $514.00, weighted average = $5.14/kg
  - Two cost layer records created:
    - Record 1: parent_lot_no = `MK-251107-0001`, out_qty = 30
    - Record 2: parent_lot_no = `MK-251107-0002`, out_qty = 70

**A3: Exact Lot Depletion**
- **Step**: At step 4
- **Flow**:
  - Issue quantity = 50 kg
  - Oldest lot balance = exactly 50 kg
  - Engine consumes entire lot
  - Lot balance becomes 0 (depleted)
  - Lot still appears in history but excluded from FIFO queries (HAVING clause)

#### Exception Flows

**E1: Insufficient Inventory**
- **Condition**: Total available balance < issue quantity
- **Flow**:
  - System displays error: "Insufficient inventory. Available: {AVAILABLE}, Requested: {REQUESTED}"
  - Transaction blocked
  - User can adjust issue quantity or cancel

**E2: No Lots Available**
- **Condition**: No lots with positive balance exist
- **Flow**:
  - System displays error: "No inventory lots available for product {PRODUCT}"
  - Suggests checking:
    - Product/location selection
    - Whether receipts have been processed
    - Period closure status

**E3: Cost Layer Integrity Violation**
- **Condition**: Parent lot not found during consumption
- **Flow**:
  - System logs critical error
  - Transaction rolled back
  - Alert sent to system administrator

#### Business Rules
- BR-LOT-013: FIFO consumption based on lot_no chronological order
- BR-LOT-014: Consumption records have `parent_lot_no` populated, `lot_no` = NULL
- BR-LOT-015: Multiple cost layers created if multiple lots consumed
- BR-LOT-016: Issue cost = sum of (out_qty × cost_per_unit) from all consumed lots
- BR-LOT-017: Lot balance calculated as SUM(in_qty) - SUM(out_qty)

---

### UC-LOT-005: Query Lot Balances

**Priority**: High
**Status**: New Feature
**Trigger**: User needs to view current lot balances

#### Primary Flow

**Preconditions**:
- User has inventory query permissions
- Product and location filters specified (optional)

**Main Success Scenario**:

1. **User** opens "Lot Balance Inquiry" screen
2. **User** specifies search criteria:
   - Product (optional)
   - Location (optional)
   - Include zero balances (checkbox, default: unchecked)
   - Date range (optional, for historical balances)
3. **User** clicks "Search"
4. **System** executes lot balance query:
```sql
SELECT
  l.lot_no,
  l.product_id,
  p.product_name,
  l.location_id,
  loc.location_name,
  l.lot_at_date,
  l.cost_per_unit,
  SUM(l.in_qty) as total_in,
  SUM(l.out_qty) as total_out,
  SUM(l.in_qty) - SUM(l.out_qty) as current_balance,
  (SUM(l.in_qty) - SUM(l.out_qty)) * l.cost_per_unit as balance_value,
  MIN(itd.transaction_date) as first_transaction_date,
  MAX(itd.transaction_date) as last_transaction_date
FROM tb_inventory_transaction_cost_layer l
INNER JOIN tb_product p ON l.product_id = p.id
INNER JOIN tb_location loc ON l.location_id = loc.id
LEFT JOIN tb_inventory_transaction_detail itd
  ON l.inventory_transaction_detail_id = itd.id
WHERE l.lot_no IS NOT NULL
  AND (:product_id IS NULL OR l.product_id = :product_id)
  AND (:location_id IS NULL OR l.location_id = :location_id)
GROUP BY l.lot_no, l.product_id, p.product_name,
         l.location_id, loc.location_name,
         l.lot_at_date, l.cost_per_unit
HAVING (:include_zero = TRUE OR SUM(l.in_qty) - SUM(l.out_qty) > 0)
ORDER BY l.lot_no ASC
```
5. **System** displays results in data grid:
   - Lot number
   - Product name
   - Location
   - Lot date
   - Unit cost
   - Current balance
   - Balance value
   - Age (days since lot creation)
6. **System** provides grid features:
   - Sorting (click column headers)
   - Filtering (search box)
   - Export to Excel/PDF
   - Drill-down to lot detail (click lot number)

**Postconditions**:
- Lot balance data displayed
- User has visibility into current inventory by lot
- Data can be exported for analysis

#### Alternate Flows

**A1: Drill-Down to Lot Detail**
- **Step**: After step 6
- **Flow**:
  - User clicks on lot number hyperlink
  - System opens "Lot Detail" screen showing:
    - Lot header information
    - All transactions affecting this lot (in and out)
    - Running balance calculation
    - Related documents (GRN, issues, transfers)

**A2: Export to Excel**
- **Step**: After step 6
- **Flow**:
  - User clicks "Export" button
  - System generates Excel file with:
    - All visible columns
    - Summary row with totals
    - Formatted with colors (low balance warning)
  - File downloaded to user's device

**A3: Filter by Product Category**
- **Step**: At step 2
- **Flow**:
  - User selects product category instead of individual product
  - System includes all products in that category
  - Results grouped by category, then product

#### Exception Flows

**E1: No Lots Found**
- **Condition**: Query returns no results
- **Flow**:
  - System displays message: "No lots found matching criteria"
  - Suggests:
    - Broadening search criteria
    - Checking date range
    - Including zero balances

**E2: Query Timeout**
- **Condition**: Query takes longer than 30 seconds
- **Flow**:
  - System cancels query
  - Displays message: "Query timed out. Please narrow search criteria."
  - Suggests filtering by location or product

#### Business Rules
- BR-LOT-018: Balance = SUM(in_qty) - SUM(out_qty) per lot
- BR-LOT-019: Zero balance lots excluded by default
- BR-LOT-020: Lot age = current date - lot_at_date
- BR-LOT-021: Balance value = current_balance × cost_per_unit

---

### UC-LOT-006: Trace Lot Consumption History

**Priority**: Medium
**Status**: New Feature
**Trigger**: User needs to track where inventory from a specific lot was used

#### Primary Flow

**Preconditions**:
- Lot number is known
- User has traceability query permissions

**Main Success Scenario**:

1. **User** opens "Lot Traceability" screen
2. **User** enters lot number (e.g., `MK-251107-0001`)
3. **System** validates lot number exists
4. **System** retrieves lot header information:
   - Product
   - Location
   - Lot date
   - Original quantity
   - Unit cost
   - Source transaction (GRN or adjustment)
5. **System** queries lot consumption history:
```sql
-- Get all transactions for this lot
SELECT
  itd.transaction_date,
  itd.transaction_type,
  itd.transaction_id,
  itd.reference_document,
  cl.in_qty,
  cl.out_qty,
  cl.cost_per_unit,
  cl.total_cost,
  -- Running balance
  SUM(cl.in_qty - cl.out_qty) OVER (
    PARTITION BY cl.lot_no
    ORDER BY itd.transaction_date, cl.lot_index
  ) as running_balance
FROM tb_inventory_transaction_cost_layer cl
INNER JOIN tb_inventory_transaction_detail itd
  ON cl.inventory_transaction_detail_id = itd.id
WHERE cl.lot_no = :lot_no
   OR cl.parent_lot_no = :lot_no
ORDER BY itd.transaction_date ASC, cl.lot_index ASC
```
6. **System** displays traceability timeline:
   - **Lot Creation** (in_qty > 0, parent_lot_no = NULL):
     - Date
     - Transaction type (GRN or Adjustment)
     - Source document
     - Quantity received
     - Unit cost
   - **Consumptions** (out_qty > 0, parent_lot_no = lot_no):
     - Date
     - Transaction type (Issue, Transfer, etc.)
     - Quantity consumed
     - Running balance after consumption
     - Destination (production order, requisition, transfer location)
7. **System** displays summary:
   - Total received: {TOTAL_IN}
   - Total consumed: {TOTAL_OUT}
   - Current balance: {CURRENT_BALANCE}
   - Number of consumption transactions
   - Date range (first to last transaction)
8. **System** provides visualization:
   - Timeline chart showing consumption over time
   - Pie chart showing consumption by transaction type
   - Bar chart showing consumption by destination

**Postconditions**:
- Complete lot consumption history displayed
- User can trace inventory from receipt to final consumption
- Data available for audit and compliance purposes

#### Alternate Flows

**A1: Lot Fully Depleted**
- **Step**: At step 7
- **Flow**:
  - Current balance = 0
  - System highlights "Fully Consumed" status
  - Shows depletion date (last consumption transaction)

**A2: Trace Forward (Consumption Chain)**
- **Step**: After step 6
- **Flow**:
  - User clicks on consumption transaction
  - System shows downstream traceability:
    - If issue to production: shows production batch
    - If transfer: shows destination lot at receiving location
    - If sale: shows sales order/invoice

**A3: Trace Backward (Source Chain)**
- **Step**: At step 4
- **Flow**:
  - If source is GRN:
    - System links to purchase order
    - Shows vendor information
    - Displays receiving inspection data
  - If source is transfer-in:
    - System links to source lot at originating location
    - Continues backward chain to original receipt

#### Exception Flows

**E1: Lot Not Found**
- **Condition**: Lot number doesn't exist in database
- **Flow**:
  - System displays error: "Lot number not found: {LOT_NO}"
  - Suggests:
    - Verifying lot number format
    - Checking for typos
    - Using lot number lookup

**E2: Lot Has No Transactions**
- **Condition**: Lot record exists but no transactions found
- **Flow**:
  - System displays warning: "Lot created but no transactions recorded"
  - Shows lot header only
  - Suggests data integrity check

#### Business Rules
- BR-LOT-022: Traceability includes both forward (consumption) and backward (source) chains
- BR-LOT-023: All transactions affecting a lot must be included in traceability
- BR-LOT-024: Running balance must be calculated chronologically
- BR-LOT-025: Source transaction identified by parent_lot_no = NULL

---

### UC-LOT-007: Handle Inventory Issues with FIFO

**Priority**: High
**Status**: Enhanced (extends existing issue functionality)
**Trigger**: Chef/Storekeeper processes an inventory issue

#### Primary Flow

**Preconditions**:
- Issue document created (store requisition, production order, etc.)
- Products and quantities specified
- Issuing location has sufficient inventory

**Main Success Scenario**:

1. **User** opens issue document (e.g., Store Requisition SR-2501-0001)
2. **User** adds products to issue:
   - Product: Flour (All Purpose)
   - Quantity: 25 kg
   - Issue date: 2025-11-07
3. **User** clicks "Issue" button
4. **System** validates issue:
   - Product exists
   - Location has inventory
   - Quantity > 0
5. **System** checks available balance:
```sql
SELECT
  product_id,
  location_id,
  SUM(in_qty) - SUM(out_qty) as available_balance
FROM tb_inventory_transaction_cost_layer
WHERE product_id = :product_id
  AND location_id = :location_id
  AND lot_no IS NOT NULL
GROUP BY product_id, location_id
```
6. **System** confirms sufficient inventory (25 kg requested, 150 kg available)
7. **FIFO Consumption Engine** determines lot allocation:
   - Lot `MK-251105-0012`: 15 kg @ $4.80/kg
   - Lot `MK-251106-0008`: 10 kg @ $4.95/kg
8. **System** creates inventory transaction:
   - `transaction_type` = `issue`
   - `transaction_id` = "SR-2501-0001"
   - `transaction_date` = 2025-11-07
9. **System** creates cost layer records:

   **Record 1:**
   - `parent_lot_no` = `MK-251105-0012`
   - `lot_index` = (next for this lot)
   - `out_qty` = 15 kg
   - `cost_per_unit` = $4.80
   - `total_cost` = $72.00

   **Record 2:**
   - `parent_lot_no` = `MK-251106-0008`
   - `lot_index` = (next for this lot)
   - `out_qty` = 10 kg
   - `cost_per_unit` = $4.95
   - `total_cost` = $49.50

10. **System** calculates weighted average cost:
    - Total cost = $72.00 + $49.50 = $121.50
    - Total quantity = 15 + 10 = 25 kg
    - Average cost = $121.50 / 25 = $4.86/kg

11. **System** updates issue document with cost information
12. **System** posts to general ledger:
    - DR: Cost of Goods Issued $121.50
    - CR: Inventory Asset $121.50

13. **System** displays confirmation:
    - "Issue completed"
    - "Quantity: 25 kg"
    - "Cost: $121.50 (avg $4.86/kg)"
    - "Consumed from 2 lots"

**Postconditions**:
- Issue transaction committed
- Inventory decreased by 25 kg
- FIFO cost calculation applied
- GL posted with actual FIFO cost
- Lot balances updated

#### Alternate Flows

**A1: Single Lot Sufficient**
- **Step**: At step 7
- **Flow**:
  - Oldest lot has balance ≥ issue quantity
  - System consumes from single lot only
  - Single cost layer record created
  - Example:
    - Issue 10 kg
    - Lot `MK-251105-0012` has 50 kg @ $4.80
    - Consume 10 kg @ $4.80 = $48.00

**A2: Partial Lot Consumption with Remainder**
- **Step**: At step 7
- **Flow**:
  - Issue quantity = 60 kg
  - Lot 1: 50 kg @ $4.80 (fully consumed)
  - Lot 2: 40 kg @ $4.95 (10 kg consumed, 30 kg remains)
  - Cost = (50 × $4.80) + (10 × $4.95) = $289.50

**A3: Multiple Issues in Sequence**
- **Step**: Entire flow
- **Flow**:
  - Issue 1: 25 kg (consumes from Lot A and B)
  - Issue 2: 30 kg (consumes remainder of Lot B and starts Lot C)
  - Each issue independently calculates FIFO
  - Order of issues matters for cost calculation

#### Exception Flows

**E1: Insufficient Inventory Mid-Day**
- **Condition**: Issue quantity > available balance
- **Flow**:
  - System blocks issue
  - Displays: "Insufficient inventory. Available: {AVAILABLE} kg, Requested: {REQUESTED} kg"
  - User options:
    - Adjust issue quantity
    - Split into partial issue
    - Wait for receipt
    - Cancel

**E2: Negative Balance Prevention**
- **Condition**: Issue would cause negative balance
- **Flow**:
  - System prevents transaction
  - Logs warning: "Attempted issue would result in negative inventory"
  - Requires investigation of inventory records

#### Business Rules
- BR-LOT-026: Issues always use FIFO method based on lot_no chronological order
- BR-LOT-027: Issue cost = sum of (out_qty × lot cost_per_unit) across consumed lots
- BR-LOT-028: Multiple lots may be consumed in single issue transaction
- BR-LOT-029: Issue cannot proceed if available balance < issue quantity
- BR-LOT-030: Each consumed lot creates separate cost layer record with parent_lot_no populated

---

### UC-LOT-008: Adjust Lot Quantities (Stock-Out)

**Priority**: Medium
**Status**: New Feature
**Trigger**: Storekeeper needs to reduce inventory (damage, spoilage, correction)

#### Primary Flow

**Preconditions**:
- Inventory adjustment form is open
- Adjustment type = "Stock Out" (negative adjustment)
- Product, location, and quantity specified
- Adjustment reason selected

**Main Success Scenario**:

1. **Storekeeper** fills in stock-out adjustment form:
   - Product: Tomatoes (Fresh)
   - Location: Main Kitchen
   - Adjustment quantity: -5 kg (negative)
   - Reason: "Spoilage"
   - Notes: "Batch found damaged due to temperature issue"
2. **Storekeeper** clicks "Save Adjustment"
3. **System** validates adjustment:
   - Quantity < 0 (negative for stock-out)
   - Absolute value ≤ available balance
   - Reason code is valid
4. **System** checks available balance (current: 30 kg)
5. **FIFO Consumption Engine** determines which lots to adjust:
   - Convert negative adjustment to positive consumption quantity (5 kg)
   - Query oldest lots with positive balance
   - Lot `MK-251105-0018`: 8 kg @ $6.50/kg (oldest)
   - Allocate 5 kg from this lot
6. **System** creates inventory transaction:
   - `transaction_type` = `adjustment`
   - `transaction_id` = "ADJ-2501-001235"
   - `transaction_date` = 2025-11-07
7. **System** creates cost layer record:
   - `lot_no` = NULL (this is a consumption)
   - `parent_lot_no` = `MK-251105-0018`
   - `lot_index` = (next for parent lot)
   - `transaction_type` = `adjustment`
   - `in_qty` = 0
   - `out_qty` = 5 kg
   - `cost_per_unit` = $6.50 (from parent lot)
   - `total_cost` = 5 × $6.50 = $32.50
8. **System** posts to GL:
   - DR: Spoilage/Waste Expense $32.50
   - CR: Inventory Asset $32.50
9. **System** updates lot balance:
   - Lot `MK-251105-0018`: 8 kg → 3 kg
10. **System** displays confirmation:
    - "Stock-out adjustment saved"
    - "Quantity adjusted: -5 kg"
    - "Lot adjusted: MK-251105-0018"
    - "Adjustment cost: $32.50"

**Postconditions**:
- Inventory decreased by 5 kg
- Lot balance decreased using FIFO
- Adjustment cost calculated from oldest lot
- GL posted with actual cost from FIFO lot

#### Alternate Flows

**A1: Adjustment Spans Multiple Lots**
- **Step**: At step 5
- **Flow**:
  - Adjustment quantity = -15 kg
  - Lot 1: 8 kg @ $6.50 (fully consumed)
  - Lot 2: 12 kg @ $6.75 (7 kg consumed, 5 kg remains)
  - Total cost = (8 × $6.50) + (7 × $6.75) = $99.25
  - Two cost layer records created

**A2: Physical Count Adjustment (Stock-Out)**
- **Step**: At step 1
- **Flow**:
  - Reason = "Physical count variance"
  - System compares:
    - Book balance: 30 kg
    - Physical count: 25 kg
    - Variance: -5 kg (shortage)
  - Adjustment = -5 kg
  - Links to physical count document

#### Exception Flows

**E1: Adjustment Exceeds Available Balance**
- **Condition**: Absolute adjustment quantity > available balance
- **Flow**:
  - System displays error: "Adjustment quantity (-15 kg) exceeds available balance (10 kg)"
  - User must:
    - Reduce adjustment quantity
    - Verify product/location
    - Investigate discrepancy

**E2: No Lots Available to Adjust**
- **Condition**: Available balance = 0
- **Flow**:
  - System displays error: "No inventory available to adjust"
  - Suggests:
    - Verify product/location selection
    - Check if receipts have been processed
    - Review transaction history

#### Business Rules
- BR-LOT-031: Stock-out adjustments consume from oldest lots (FIFO)
- BR-LOT-032: Adjustment cost based on actual lot cost, not current/average cost
- BR-LOT-033: Multiple lots may be affected by single stock-out adjustment
- BR-LOT-034: Adjustment cannot exceed available balance
- BR-LOT-035: Stock-out adjustment creates consumption records (parent_lot_no populated)

---

### UC-LOT-009: Transfer Inventory Between Locations

**Priority**: Medium
**Status**: Enhanced (extends existing transfer functionality)
**Trigger**: Storekeeper initiates inter-location transfer

#### Primary Flow

**Preconditions**:
- Transfer order created
- Source and destination locations specified
- Product and quantity specified
- Sufficient inventory at source location

**Main Success Scenario**:

1. **Storekeeper** creates transfer order:
   - Transfer No: TRF-2501-0001
   - From: Main Kitchen (MK)
   - To: Pastry Venue (PV)
   - Product: Butter (Unsalted)
   - Quantity: 10 kg
   - Transfer date: 2025-11-07
2. **Storekeeper** clicks "Issue Transfer"
3. **System** validates transfer:
   - Source location has sufficient inventory (check balance ≥ 10 kg)
   - Destination location exists and accepts this product
4. **FIFO Consumption Engine** determines source lots:
   - Lot `MK-251106-0025`: 7 kg @ $8.20/kg
   - Lot `MK-251106-0030`: 5 kg @ $8.30/kg (use 3 kg)
5. **System** processes transfer-out at source location (MK):

   **Transaction:**
   - `transaction_type` = `transfer_out`
   - `transaction_id` = "TRF-2501-0001"
   - `transaction_date` = 2025-11-07

   **Cost Layer Records:**
   - Record 1:
     - `parent_lot_no` = `MK-251106-0025`
     - `out_qty` = 7 kg, cost = $57.40
   - Record 2:
     - `parent_lot_no` = `MK-251106-0030`
     - `out_qty` = 3 kg, cost = $24.90

   **Total Transfer Cost:** $82.30 (weighted avg: $8.23/kg)

6. **System** generates lot number for destination location (PV):
   - New lot: `PV-251107-0012`

7. **System** processes transfer-in at destination location (PV):

   **Transaction:**
   - `transaction_type` = `transfer_in`
   - `transaction_id` = "TRF-2501-0001" (same reference)
   - `transaction_date` = 2025-11-07

   **Cost Layer Record:**
   - `lot_no` = `PV-251107-0012`
   - `parent_lot_no` = NULL (new lot creation at destination)
   - `transaction_type` = `transfer_in`
   - `in_qty` = 10 kg
   - `out_qty` = 0
   - `cost_per_unit` = $8.23/kg (weighted average from source lots)
   - `total_cost` = $82.30

8. **System** links source and destination lots:
   - Store transfer mapping in transaction metadata
   - Link `PV-251107-0012` ← `MK-251106-0025`, `MK-251106-0030`

9. **System** displays confirmation:
   - "Transfer completed"
   - "Transfer-out from MK: 10 kg, cost $82.30"
   - "Transfer-in to PV: Lot PV-251107-0012 created"
   - "Source lots: MK-251106-0025 (7 kg), MK-251106-0030 (3 kg)"

**Postconditions**:
- Inventory decreased at source location (MK) by 10 kg
- Inventory increased at destination location (PV) by 10 kg
- New lot created at destination with weighted average cost from source
- Source lot balances decreased using FIFO
- Transfer fully traceable from source lots to destination lot

#### Alternate Flows

**A1: Single Source Lot Sufficient**
- **Step**: At step 4
- **Flow**:
  - Transfer quantity = 10 kg
  - Single source lot has balance ≥ 10 kg
  - Transfer-out consumes from one lot only
  - Destination lot cost = source lot cost (no averaging needed)

**A2: Transfer with Cost Adjustment**
- **Step**: After step 5, before step 7
- **Flow**:
  - User can optionally adjust transfer cost
  - Reason: freight, handling, or transfer pricing policy
  - System records cost adjustment:
    - Base cost: $82.30
    - Adjustment: +$5.00 (freight)
    - Final cost: $87.30
  - Destination lot cost = $8.73/kg

**A3: Partial Transfer Fulfillment**
- **Step**: At step 3
- **Flow**:
  - Requested: 20 kg
  - Available: 15 kg
  - User can either:
    - Option 1: Partial transfer (15 kg)
    - Option 2: Split transfer (multiple shipments)
    - Option 3: Cancel and wait for receipt

#### Exception Flows

**E1: Insufficient Inventory at Source**
- **Condition**: Source balance < transfer quantity
- **Flow**:
  - System blocks transfer
  - Displays: "Insufficient inventory at source. Available: {AVAILABLE}, Requested: {REQUESTED}"
  - User options:
    - Reduce transfer quantity
    - Cancel transfer
    - Wait for receipt at source

**E2: Destination Location Invalid**
- **Condition**: Destination location doesn't accept product category
- **Flow**:
  - System blocks transfer
  - Displays: "Product {PRODUCT} not allowed at destination location {LOCATION}"
  - Requires location configuration update or product reassignment

**E3: Transfer-In Fails After Transfer-Out**
- **Condition**: Transfer-out succeeded but transfer-in fails
- **Flow**:
  - System automatically rolls back transfer-out
  - Restores source lot balances
  - Logs error: "Transfer failed at destination, transaction rolled back"
  - Requires investigation before retry

#### Business Rules
- BR-LOT-036: Transfer-out uses FIFO from source location
- BR-LOT-037: Transfer-in creates new lot at destination location
- BR-LOT-038: Destination lot cost = weighted average of consumed source lots
- BR-LOT-039: Transfer-in lot uses destination location code and current date
- BR-LOT-040: Transfer transaction links source and destination lots for traceability
- BR-LOT-041: Both transfer-out and transfer-in must succeed (atomic transaction)

---

### UC-LOT-010: Generate Lot Balance Reports

**Priority**: Medium
**Status**: New Feature
**Trigger**: User needs inventory valuation or lot aging report

#### Primary Flow

**Preconditions**:
- User has reporting permissions
- Report parameters specified

**Main Success Scenario**:

1. **User** opens "Inventory Reports" menu
2. **User** selects "Lot Balance Report"
3. **User** specifies report parameters:
   - Report date: 2025-11-07
   - Location: All (or specific)
   - Product category: All (or specific)
   - Include zero balances: No
   - Sort by: Lot age (oldest first)
4. **User** clicks "Generate Report"
5. **System** executes lot balance query:
```sql
SELECT
  l.lot_no,
  p.product_code,
  p.product_name,
  pc.category_name,
  loc.location_name,
  l.lot_at_date,
  CURRENT_DATE - l.lot_at_date::date as lot_age_days,
  l.cost_per_unit,
  SUM(l.in_qty) as total_received,
  SUM(l.out_qty) as total_consumed,
  SUM(l.in_qty) - SUM(l.out_qty) as current_balance,
  (SUM(l.in_qty) - SUM(l.out_qty)) * l.cost_per_unit as balance_value,
  CASE
    WHEN CURRENT_DATE - l.lot_at_date::date > 90 THEN 'Slow Moving'
    WHEN CURRENT_DATE - l.lot_at_date::date > 60 THEN 'Aging'
    WHEN CURRENT_DATE - l.lot_at_date::date > 30 THEN 'Normal'
    ELSE 'Fresh'
  END as age_category
FROM tb_inventory_transaction_cost_layer l
INNER JOIN tb_product p ON l.product_id = p.id
INNER JOIN tb_product_category pc ON p.category_id = pc.id
INNER JOIN tb_location loc ON l.location_id = loc.id
WHERE l.lot_no IS NOT NULL
  AND (:as_of_date IS NULL OR l.lot_at_date <= :as_of_date)
GROUP BY l.lot_no, p.product_code, p.product_name,
         pc.category_name, loc.location_name,
         l.lot_at_date, l.cost_per_unit
HAVING SUM(l.in_qty) - SUM(l.out_qty) > 0
ORDER BY lot_age_days DESC, l.lot_no ASC
```
6. **System** generates report with sections:

   **Summary:**
   - Total lots: 245
   - Total inventory value: $125,430.50
   - Average lot age: 12 days

   **By Age Category:**
   - Fresh (0-30 days): 198 lots, $98,240.25
   - Normal (31-60 days): 35 lots, $18,650.75
   - Aging (61-90 days): 10 lots, $7,239.50
   - Slow Moving (>90 days): 2 lots, $1,300.00

   **Detail Listing:** (sample rows)
   | Lot No | Product | Location | Lot Date | Age | Balance | Unit Cost | Value |
   |--------|---------|----------|----------|-----|---------|-----------|-------|
   | MK-250815-0042 | Flour AP | Main Kitchen | 2025-08-15 | 84 | 5.0 kg | $4.50 | $22.50 |
   | PV-250901-0018 | Sugar | Pastry | 2025-09-01 | 67 | 8.0 kg | $3.20 | $25.60 |
   | MK-251020-0105 | Butter | Main Kitchen | 2025-10-20 | 18 | 15.0 kg | $8.20 | $123.00 |

7. **System** provides report actions:
   - Export to Excel/PDF
   - Email to recipients
   - Schedule recurring report
   - Print report

8. **System** displays report on screen

**Postconditions**:
- Lot balance report generated
- Management has visibility into inventory aging
- Slow-moving inventory identified
- Report available for export/distribution

#### Alternate Flows

**A1: Inventory Valuation Report**
- **Step**: At step 2
- **Flow**:
  - User selects "Inventory Valuation Report"
  - Report focuses on value rather than aging
  - Groups by: Product category → Product → Location → Lot
  - Shows:
    - Value by category
    - Value by product
    - Total inventory value
    - Valuation date

**A2: FIFO Consumption Analysis**
- **Step**: At step 2
- **Flow**:
  - User selects "FIFO Consumption Report"
  - Report shows:
    - Lots consumed in period
    - Average days to consumption
    - Cost variance (oldest vs. newest lots)
    - Turnover rate by product

**A3: Slow-Moving Inventory Alert**
- **Step**: At step 6
- **Flow**:
  - System highlights lots > 90 days old
  - Generates alert list:
    - Lot number
    - Product
    - Age
    - Balance value
    - Recommended action (use, transfer, dispose)

#### Exception Flows

**E1: No Lots in Date Range**
- **Condition**: Query returns no results
- **Flow**:
  - System displays message: "No lots found for specified criteria"
  - Suggests:
    - Broadening date range
    - Checking location/category filters
    - Verifying inventory has been received

**E2: Report Generation Timeout**
- **Condition**: Query takes longer than 60 seconds
- **Flow**:
  - System cancels report generation
  - Displays message: "Report generation timed out. Please narrow scope."
  - Suggests:
    - Filter by specific location
    - Reduce date range
    - Schedule report for off-peak hours

#### Business Rules
- BR-LOT-042: Lot age = report date - lot_at_date
- BR-LOT-043: Lot balance = SUM(in_qty) - SUM(out_qty) as of report date
- BR-LOT-044: Inventory value = lot balance × cost_per_unit
- BR-LOT-045: Age categories: Fresh (0-30), Normal (31-60), Aging (61-90), Slow (>90)
- BR-LOT-046: Zero balance lots excluded from reports unless explicitly requested

---

## Use Case Dependencies

### Dependency Matrix

| Use Case | Depends On | Enables |
|----------|------------|---------|
| UC-LOT-001 | UC-LOT-003 | UC-LOT-004, UC-LOT-005, UC-LOT-006 |
| UC-LOT-002 | UC-LOT-003 | UC-LOT-004, UC-LOT-005, UC-LOT-006 |
| UC-LOT-003 | (none) | UC-LOT-001, UC-LOT-002, UC-LOT-009 |
| UC-LOT-004 | UC-LOT-001 or UC-LOT-002 | UC-LOT-006, UC-LOT-007 |
| UC-LOT-005 | UC-LOT-001 or UC-LOT-002 | UC-LOT-010 |
| UC-LOT-006 | UC-LOT-004 | (reporting) |
| UC-LOT-007 | UC-LOT-001, UC-LOT-003, UC-LOT-004 | UC-LOT-006 |
| UC-LOT-008 | UC-LOT-001, UC-LOT-003, UC-LOT-004 | UC-LOT-006 |
| UC-LOT-009 | UC-LOT-001, UC-LOT-003, UC-LOT-004 | UC-LOT-001 (at destination) |
| UC-LOT-010 | UC-LOT-005 | (management reporting) |

### Implementation Sequence

**Phase 1: Foundation** (Critical Path)
1. UC-LOT-003: Generate Lot Numbers Automatically
2. UC-LOT-001: Create Lot Records on GRN Commitment
3. UC-LOT-005: Query Lot Balances

**Phase 2: Consumption** (Core Functionality)
4. UC-LOT-004: Consume Inventory Using FIFO
5. UC-LOT-007: Handle Inventory Issues with FIFO

**Phase 3: Adjustments** (Operational Support)
6. UC-LOT-002: Create Lot Records on Stock-In Adjustment
7. UC-LOT-008: Adjust Lot Quantities (Stock-Out)

**Phase 4: Advanced** (Enhanced Capabilities)
8. UC-LOT-009: Transfer Inventory Between Locations
9. UC-LOT-006: Trace Lot Consumption History
10. UC-LOT-010: Generate Lot Balance Reports

---

## Non-Functional Requirements

### Performance Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| **NFR-UC-001**: Lot number generation | < 100ms | 95th percentile response time |
| **NFR-UC-002**: FIFO consumption calculation | < 500ms for 10 lots | Average processing time |
| **NFR-UC-003**: Lot balance query | < 2 seconds | Single location, all products |
| **NFR-UC-004**: Traceability query | < 3 seconds | Full lot history |
| **NFR-UC-005**: Report generation | < 30 seconds | Up to 1000 lots |

### Scalability Requirements

| Requirement | Target |
|-------------|--------|
| **NFR-UC-006**: Support 10,000 lots per location | System must handle growing lot inventory |
| **NFR-UC-007**: Support 1,000 daily receipts | Peak load during high-volume periods |
| **NFR-UC-008**: Support 5,000 daily issues | Peak consumption during production periods |

### Reliability Requirements

| Requirement | Description |
|-------------|-------------|
| **NFR-UC-009** | Lot number uniqueness guaranteed (database constraint + application logic) |
| **NFR-UC-010** | FIFO calculation must be deterministic and repeatable |
| **NFR-UC-011** | Transaction atomicity: lot creation and inventory update must succeed or fail together |

### Usability Requirements

| Requirement | Description |
|-------------|-------------|
| **NFR-UC-012** | Lot number format must be human-readable and sortable |
| **NFR-UC-013** | Error messages must be clear and actionable |
| **NFR-UC-014** | UI must display lot information without requiring drill-down |

---

## Glossary

| Term | Definition |
|------|------------|
| **Lot Number** | Unique identifier for inventory receipt: `{LOCATION}-{YYMMDD}-{SEQSEQ}` (4-digit sequence) |
| **LOT Transaction** | Transaction that creates a new lot (parent_lot_no = NULL, in_qty > 0) |
| **ADJUSTMENT Transaction** | Transaction that consumes from existing lot (parent_lot_no populated, out_qty > 0) |
| **FIFO** | First-In, First-Out: inventory valuation method consuming oldest lots first |
| **Cost Layer** | Record in tb_inventory_transaction_cost_layer table |
| **Lot Balance** | SUM(in_qty) - SUM(out_qty) for a specific lot |
| **Parent Lot** | Original lot from which inventory is consumed (referenced by parent_lot_no) |
| **Lot Age** | Number of days since lot creation (current date - lot_at_date) |
| **Weighted Average Cost** | Total cost / total quantity when consuming from multiple lots |
| **Lot Traceability** | Ability to track inventory from receipt through consumption |

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-07 | System | Initial use cases document with 4-digit lot sequence format |

---

**Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Owner | | | |
| Technical Lead | | | |
| QA Lead | | | |
| Project Manager | | | |
