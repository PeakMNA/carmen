# PROCESS: Lot-Based Costing Process Logic

**Document Type**: Process Documentation
**Module**: Inventory Management
**Feature**: Lot-Based Costing with FIFO Methodology
**Version**: 1.0
**Last Updated**: 2025-01-07

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-07 | Initial document creation with complete process logic |

---

## Document Purpose

This document provides complete step-by-step process logic for all lot-based inventory costing scenarios in the Carmen ERP system. It covers:

- LOT creation scenarios (receipts)
- LOT consumption scenarios (FIFO-based)
- Cost calculations and allocations
- Database record structures
- Inventory balance impacts

**Related Documents**:
- [BR-LOT: Business Requirements](./BR-lot-based-costing.md)
- [UC-LOT: Use Cases](./UC-lot-based-costing.md)
- [TS-LOT: Technical Specification](./TS-lot-based-costing.md)
- [DS-LOT: Data Schema](./DS-lot-based-costing.md)

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [LOT Creation Scenarios](#lot-creation-scenarios)
3. [LOT Consumption Scenarios](#lot-consumption-scenarios)
4. [Complete Database Record Flow](#complete-database-record-flow)
5. [Key Patterns & Formulas](#key-patterns--formulas)
6. [Quick Reference](#quick-reference)

---

## Core Concepts

### Pattern Recognition

The lot-based costing system uses two primary patterns distinguished by field values:

| Pattern | lot_no | parent_lot_no | in_qty | out_qty | Meaning |
|---------|--------|---------------|--------|---------|---------|
| **LOT** | Generated | NULL | > 0 | 0 | Receipt/Lot Creation |
| **ADJUSTMENT** | NULL | Populated | 0 | > 0 | Consumption from existing lot |

### FIFO Methodology

**First-In-First-Out (FIFO)** consumes inventory in chronological order based on lot number:

```sql
-- FIFO Query Pattern
SELECT lot_no,
       SUM(in_qty) - SUM(out_qty) as remaining_quantity,
       cost_per_unit
FROM tb_inventory_transaction_cost_layer
WHERE product_id = :product_id
  AND location_id = :location_id
  AND lot_no IS NOT NULL
GROUP BY lot_no, cost_per_unit
HAVING SUM(in_qty) - SUM(out_qty) > 0
ORDER BY lot_no ASC  -- ⭐ CRITICAL: Chronological FIFO order
```

### Lot Number Format

```
Format: {LOCATION}-{YYMMDD}-{SEQSEQ}

Example: MK-251107-0001
- MK: Location code (Main Kitchen)
- 251107: Date (2025-11-07)
- 0001: 4-digit sequence (0001-9999)

Natural Sort: MK-251105-0001 < MK-251106-0001 < MK-251107-0001
```

### Balance Calculation

Balances are **never stored**, always calculated on-the-fly:

```sql
-- Lot Balance Formula
Balance = SUM(in_qty) - SUM(out_qty)

-- Example for lot MK-251107-0001:
-- Record 1 (creation):   in_qty = 50, out_qty = 0
-- Record 2 (consumption): in_qty = 0,  out_qty = 20
-- Record 3 (consumption): in_qty = 0,  out_qty = 15
-- Balance: (50 + 0 + 0) - (0 + 20 + 15) = 15 kg
```

---

## Business Rules for Credit Notes

Credit Notes have special business rules that affect both inventory and financial processing. These rules are critical for understanding how CNs interact with the lot-based costing system.

### CN Transaction Types

| Credit Type | Physical Return | Inventory Impact | Lot Consumption | GL Accounts |
|-------------|----------------|------------------|-----------------|-------------|
| **QUANTITY_RETURN** | ✅ Yes | ✅ Reduces inventory | ✅ FIFO from lots | DR A/P, CR Inventory, CR Input VAT |
| **AMOUNT_DISCOUNT** | ❌ No | ❌ No impact | ❌ No lots | DR A/P, CR Purchase Discount, CR Input VAT |

### Key Business Rules

**BR-CN-040**: Stock movements generated only for QUANTITY_RETURN type credits
- AMOUNT_DISCOUNT credits do NOT create cost layer records
- No `lot_no` or `parent_lot_no` entries for amount-only discounts

**BR-CN-008**: Credit amount cannot exceed original GRN amount
- Cumulative credits across all CNs for same GRN must ≤ original amount
- System validates total credit vs. GRN value before commitment

**BR-CN-014**: Return quantity cannot exceed received quantity from selected lot
- FIFO allocation ensures only available lots are consumed
- System validates lot balances before creating ADJUSTMENT records

**BR-CN-043**: Cannot post credit if insufficient lot quantity available
- Exception: Partial availability scenario (see Scenario 9)
- System splits available vs. consumed quantities

### CN Cost Calculations

```typescript
// QUANTITY_RETURN formulas
Return Amount = Return Quantity × Current Unit Price
Cost of Goods Sold = Return Quantity × Weighted Average Cost (FIFO)
Realized Gain/Loss = Return Amount - Cost of Goods Sold

// AMOUNT_DISCOUNT formulas
Tax Amount = Discount Amount × Tax Rate / 100
Total Credit = Discount Amount + Tax Amount

// PARTIAL AVAILABILITY split
Available Quantity = MIN(Return Quantity, Available Balance)
Consumed Quantity = Return Quantity - Available Quantity
```

### GL Posting Patterns

**For QUANTITY_RETURN (Physical Return)**:
```
DR: Accounts Payable (Vendor)         $XXX.XX
CR: Inventory Asset (Product)         $XXX.XX
CR: Input VAT (Tax Recoverable)       $XX.XX
```

**For AMOUNT_DISCOUNT (Pricing Adjustment)**:
```
DR: Accounts Payable (Vendor)         $XXX.XX
CR: Purchase Discounts (Income)       $XXX.XX
CR: Input VAT (Tax Recoverable)       $XX.XX
```

**For PARTIAL AVAILABILITY (Mixed Processing)**:
```
DR: Accounts Payable (Vendor)         $XXX.XX
CR: Inventory Asset (Available Qty)   $XX.XX
CR: Cost of Goods Sold (Consumed Qty) $XX.XX
CR: Input VAT (Tax Recoverable)       $XX.XX
```

---

## LOT Creation Scenarios

These scenarios create **NEW lot records** with `parent_lot_no = NULL` and `in_qty > 0`.

### Scenario 1: GRN Commitment

**Business Context**: Purchasing staff commits a Good Received Note (GRN) after verifying received products.

#### Initial State
```yaml
Inventory: Empty (no existing lots)
Date: 2025-11-07
Location: Main Kitchen (MK)
```

#### Transaction Details
```yaml
Document: GRN-2501-0001
Product: Flour (All Purpose)
Quantity: 50 kg
Unit Cost: $5.50/kg
Total Cost: $275.00
Status: APPROVED → COMMITTED
```

#### Step-by-Step Process

**Step 1: Validate GRN**
```typescript
// Validation checks
- GRN status = "APPROVED" ✓
- Quantity > 0 ✓
- Unit cost > 0 ✓
- Location exists ✓
- Product exists ✓
```

**Step 2: Generate Lot Number**
```sql
-- Query last sequence for location + date
SELECT lot_seq_no
FROM tb_inventory_transaction_cost_layer
WHERE location_code = 'MK'
  AND lot_at_date::date = '2025-11-07'::date
ORDER BY lot_seq_no DESC
LIMIT 1;

-- Result: NULL (first lot of day)
-- Next sequence: 1
-- Generated lot: "MK-251107-0001"
```

**Step 3: Create Inventory Transaction Detail**
```typescript
// tb_inventory_transaction_detail
{
  id: "uuid-txn-001",
  transaction_id: "GRN-2501-0001",
  transaction_type: "good_received_note",
  transaction_date: "2025-11-07T10:30:00Z",
  product_id: "flour-uuid",
  location_id: "mk-uuid",
  quantity: 50.00000,
  unit_cost: 5.50000,
  reference_document: "PO-2501-0050"
}
```

**Step 4: Create Cost Layer Record (LOT)**
```typescript
// tb_inventory_transaction_cost_layer
{
  id: "uuid-cl-001",
  inventory_transaction_detail_id: "uuid-txn-001",

  // LOT PATTERN FIELDS
  lot_no: "MK-251107-0001",           // 🟢 Generated lot number
  lot_index: 1,                        // First record for this lot
  parent_lot_no: NULL,                 // 🟢 NULL = LOT creation

  // Location & Product
  location_id: "mk-uuid",
  location_code: "MK",
  lot_at_date: "2025-11-07T00:00:00Z",
  lot_seq_no: 1,
  product_id: "flour-uuid",

  // Transaction Details
  transaction_type: "good_received_note",

  // Quantities & Costs
  in_qty: 50.00000,                    // 🟢 Receipt quantity
  out_qty: 0.00000,                    // 🟢 No consumption
  cost_per_unit: 5.50000,
  total_cost: 275.00000                // 50 × 5.50
}
```

**Step 5: Update Inventory Balances**
```typescript
// Calculate new balance
const lotBalance = await calculateLotBalance("MK-251107-0001");
// Result: 50.00000 kg

// Update overall inventory
const totalInventory = await calculateTotalInventory("flour-uuid", "mk-uuid");
// Result: 50.00000 kg
```

#### Inventory Impact

```
Before GRN Commitment:
┌─────────────┬──────────┬──────────┐
│ Lot Number  │ Balance  │ Cost     │
├─────────────┼──────────┼──────────┤
│ (none)      │ 0 kg     │ $0.00    │
└─────────────┴──────────┴──────────┘
Total: 0 kg

After GRN Commitment:
┌─────────────────┬──────────┬──────────┬───────────┐
│ Lot Number      │ Balance  │ Unit Cost│ Value     │
├─────────────────┼──────────┼──────────┼───────────┤
│ MK-251107-0001  │ 50 kg    │ $5.50/kg │ $275.00   │
└─────────────────┴──────────┴──────────┴───────────┘
Total: 50 kg, Value: $275.00
```

#### GL Posting
```
DR: Inventory Asset (Flour)     $275.00
CR: GRN/Accrued Payables        $275.00
```

---

### Scenario 2: Stock-In Adjustment

**Business Context**: Storekeeper performs physical count and finds additional stock not in the system.

#### Initial State
```yaml
Existing Lots:
  - MK-251107-0001: 50 kg @ $5.50/kg (from GRN)

Physical Count: 60 kg (10 kg variance)
Reason: "Found stock during physical count"
```

#### Transaction Details
```yaml
Document: ADJ-2501-001234
Type: Stock-In Adjustment
Product: Flour (All Purpose)
Quantity: +10 kg
Unit Cost: $4.95/kg (manual entry or system calculated)
Reason: "Physical count variance - found stock"
```

#### Step-by-Step Process

**Step 1: Create Adjustment**
```typescript
// User enters adjustment
{
  product_id: "flour-uuid",
  location_id: "mk-uuid",
  adjustment_type: "STOCK_IN",
  quantity: 10.00000,            // Positive = stock-in
  unit_cost: 4.95000,            // Manual or calculated
  reason: "Physical count variance - found stock",
  reference_document: "COUNT-2025-11-07"
}
```

**Step 2: Validate Adjustment**
```typescript
// Validation checks
- Quantity > 0 ✓ (stock-in)
- Unit cost > 0 ✓
- Reason code valid ✓
- User has permission ✓
```

**Step 3: Generate Lot Number**
```sql
-- Query last sequence for MK + 2025-11-07
SELECT lot_seq_no
FROM tb_inventory_transaction_cost_layer
WHERE location_code = 'MK'
  AND lot_at_date::date = '2025-11-07'::date
ORDER BY lot_seq_no DESC
LIMIT 1;

-- Result: 1 (from GRN earlier)
-- Next sequence: 2
-- Generated lot: "MK-251107-0002"
```

**Step 4: Create Cost Layer Record (LOT)**
```typescript
{
  id: "uuid-cl-002",

  // LOT PATTERN
  lot_no: "MK-251107-0002",           // 🟢 New lot for adjustment
  lot_index: 1,
  parent_lot_no: NULL,                 // 🟢 NULL = LOT creation

  location_code: "MK",
  lot_at_date: "2025-11-07T00:00:00Z",
  lot_seq_no: 2,
  product_id: "flour-uuid",

  transaction_type: "adjustment",

  in_qty: 10.00000,                    // 🟢 Stock-in
  out_qty: 0.00000,                    // 🟢 No consumption
  cost_per_unit: 4.95000,
  total_cost: 49.50000                 // 10 × 4.95
}
```

#### Inventory Impact

```
Before Adjustment:
┌─────────────────┬──────────┬───────────┬───────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │
├─────────────────┼──────────┼───────────┼───────────┤
│ MK-251107-0001  │ 50 kg    │ $5.50/kg  │ $275.00   │
└─────────────────┴──────────┴───────────┴───────────┘
Total: 50 kg, Value: $275.00

After Adjustment:
┌─────────────────┬──────────┬───────────┬───────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │
├─────────────────┼──────────┼───────────┼───────────┤
│ MK-251107-0001  │ 50 kg    │ $5.50/kg  │ $275.00   │
│ MK-251107-0002  │ 10 kg    │ $4.95/kg  │ $49.50    │
└─────────────────┴──────────┴───────────┴───────────┘
Total: 60 kg, Value: $324.50
```

#### GL Posting
```
DR: Inventory Asset (Flour)     $49.50
CR: Inventory Variance/Other    $49.50
```

---

### Scenario 3: Transfer-In

**Business Context**: Inventory is transferred from one location to another. Transfer-in creates a NEW lot at the destination with weighted average cost from source lots.

#### Initial State

**Source Location (Pastry Venue - PV):**
```yaml
Available Lots:
  - PV-251106-0025: 7 kg @ $8.20/kg
  - PV-251106-0030: 5 kg @ $8.30/kg
Total: 12 kg
```

**Destination Location (Main Kitchen - MK):**
```yaml
Butter inventory: 0 kg (receiving transfer)
```

#### Transaction Details
```yaml
Document: TRF-2501-0001
Transfer Date: 2025-11-07
From: Pastry Venue (PV)
To: Main Kitchen (MK)
Product: Butter (Unsalted)
Quantity: 10 kg
```

#### Step-by-Step Process

**Step 1: Process Transfer-Out at Source** (See Consumption Scenario 5 for details)

```
FIFO Allocation at Source:
1. Consume PV-251106-0025: 7 kg @ $8.20 = $57.40
2. Consume PV-251106-0030: 3 kg @ $8.30 = $24.90

Total Cost: $82.30
Weighted Average: $82.30 / 10 kg = $8.23/kg
```

**Step 2: Generate Lot Number at Destination**
```sql
-- Query last sequence for MK + 2025-11-07
SELECT lot_seq_no
FROM tb_inventory_transaction_cost_layer
WHERE location_code = 'MK'
  AND lot_at_date::date = '2025-11-07'::date
ORDER BY lot_seq_no DESC
LIMIT 1;

-- Result: 2 (from previous adjustments)
-- Next sequence: 3
-- Generated lot: "MK-251107-0003"
```

**Step 3: Create Transfer-In Transaction**
```typescript
// tb_inventory_transaction_detail
{
  id: "uuid-txn-transfer-in",
  transaction_id: "TRF-2501-0001",
  transaction_type: "transfer_in",
  transaction_date: "2025-11-07T14:00:00Z",
  product_id: "butter-uuid",
  location_id: "mk-uuid",           // Destination
  quantity: 10.00000,
  unit_cost: 8.23000,               // 🟢 Weighted avg from source
  reference_document: "TRF-2501-0001",
  source_location_id: "pv-uuid"
}
```

**Step 4: Create Cost Layer Record at Destination (LOT)**
```typescript
{
  id: "uuid-cl-transfer-in",
  inventory_transaction_detail_id: "uuid-txn-transfer-in",

  // LOT PATTERN - New lot at destination
  lot_no: "MK-251107-0003",           // 🟢 New lot at destination
  lot_index: 1,
  parent_lot_no: NULL,                 // 🟢 NULL = lot creation

  location_id: "mk-uuid",
  location_code: "MK",                 // 🟢 Destination location
  lot_at_date: "2025-11-07T00:00:00Z",
  lot_seq_no: 3,
  product_id: "butter-uuid",

  transaction_type: "transfer_in",

  in_qty: 10.00000,                    // 🟢 Receipt at destination
  out_qty: 0.00000,
  cost_per_unit: 8.23000,              // 🟢 Weighted avg from source
  total_cost: 82.30000
}
```

**Step 5: Link Transfer Transactions**
```typescript
// Store transfer linkage in transaction metadata
{
  transfer_id: "TRF-2501-0001",
  source_lot_nos: ['PV-251106-0025', 'PV-251106-0030'],
  destination_lot_no: "MK-251107-0003",
  traceability: "PV lots → MK-251107-0003"
}
```

#### Inventory Impact

**Source Location (PV) - After Transfer-Out:**
```
Before:
┌─────────────────┬──────────┬───────────┬───────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │
├─────────────────┼──────────┼───────────┼───────────┤
│ PV-251106-0025  │ 7 kg     │ $8.20/kg  │ $57.40    │
│ PV-251106-0030  │ 5 kg     │ $8.30/kg  │ $41.50    │
└─────────────────┴──────────┴───────────┴───────────┘
Total: 12 kg

After:
┌─────────────────┬──────────┬───────────┬───────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │
├─────────────────┼──────────┼───────────┼───────────┤
│ PV-251106-0025  │ 0 kg     │ $8.20/kg  │ $0.00     │ (DEPLETED)
│ PV-251106-0030  │ 2 kg     │ $8.30/kg  │ $16.60    │
└─────────────────┴──────────┴───────────┴───────────┘
Total: 2 kg (-10 kg transferred out)
```

**Destination Location (MK) - After Transfer-In:**
```
Before:
No butter inventory

After:
┌─────────────────┬──────────┬───────────┬───────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │
├─────────────────┼──────────┼───────────┼───────────┤
│ MK-251107-0003  │ 10 kg    │ $8.23/kg  │ $82.30    │
└─────────────────┴──────────┴───────────┴───────────┘
Total: 10 kg (NEW, transferred in)
```

#### GL Posting
```
Transfer-Out (PV):
DR: Inventory in Transit      $82.30
CR: Inventory Asset (PV)      $82.30

Transfer-In (MK):
DR: Inventory Asset (MK)      $82.30
CR: Inventory in Transit      $82.30
```

---

## LOT Consumption Scenarios

These scenarios create **ADJUSTMENT records** with `lot_no = NULL`, `parent_lot_no` populated, and `out_qty > 0`.

### Scenario 4: Issue/Consumption with Multiple Lots (FIFO)

**Business Context**: Kitchen issues flour for production. FIFO ensures oldest lots are consumed first.

#### Initial State

```yaml
Available Lots (ordered by lot_no ASC for FIFO):
  1. MK-251105-0012: 15 kg @ $4.80/kg  (oldest - created Nov 5)
  2. MK-251106-0008: 40 kg @ $4.95/kg  (created Nov 6)
  3. MK-251107-0001: 50 kg @ $5.50/kg  (newest - created Nov 7)

Total Available: 105 kg
```

#### Transaction Details
```yaml
Document: ISS-2501-0050
Issue Date: 2025-11-07
Product: Flour (All Purpose)
Quantity Requested: 25 kg
Purpose: Production Order #1234
Department: Pastry
```

#### Step-by-Step FIFO Allocation

**Step 1: Query Available Lots (FIFO Order)**
```sql
SELECT
  lot_no,
  SUM(in_qty) - SUM(out_qty) as remaining_quantity,
  cost_per_unit,
  lot_at_date
FROM tb_inventory_transaction_cost_layer
WHERE product_id = 'flour-uuid'
  AND location_id = 'mk-uuid'
  AND lot_no IS NOT NULL
GROUP BY lot_no, cost_per_unit, lot_at_date
HAVING SUM(in_qty) - SUM(out_qty) > 0
ORDER BY lot_no ASC;  -- ⭐ FIFO: Chronological order

-- Results (ordered oldest to newest):
-- 1. MK-251105-0012: 15 kg @ $4.80/kg
-- 2. MK-251106-0008: 40 kg @ $4.95/kg
-- 3. MK-251107-0001: 50 kg @ $5.50/kg
```

**Step 2: FIFO Consumption Algorithm**

```typescript
interface FifoIteration {
  iteration: number;
  lotNo: string;
  needToConsume: number;
  lotBalance: number;
  qtyTaken: number;
  costPerUnit: number;
  cost: number;
  remaining: number;
}

const fifoAllocations: FifoIteration[] = [];
let remainingQty = 25; // Need to consume 25 kg

// ITERATION 1: Process oldest lot
{
  iteration: 1,
  lotNo: "MK-251105-0012",
  needToConsume: 25,
  lotBalance: 15,
  qtyTaken: Math.min(25, 15) = 15,    // Take full lot
  costPerUnit: 4.80,
  cost: 15 × 4.80 = 72.00,
  remaining: 25 - 15 = 10              // Still need 10 kg
}

// ITERATION 2: Process next lot
{
  iteration: 2,
  lotNo: "MK-251106-0008",
  needToConsume: 10,
  lotBalance: 40,
  qtyTaken: Math.min(10, 40) = 10,    // Take partial
  costPerUnit: 4.95,
  cost: 10 × 4.95 = 49.50,
  remaining: 10 - 10 = 0               // ✓ Complete
}

// ALLOCATION SUMMARY
Total Quantity: 25 kg
Total Cost: $72.00 + $49.50 = $121.50
Weighted Average Cost: $121.50 / 25 kg = $4.86/kg
Lots Consumed: 2 (1 full, 1 partial)
```

**Step 3: Create Issue Transaction**
```typescript
// tb_inventory_transaction_detail
{
  id: "uuid-txn-issue",
  transaction_id: "ISS-2501-0050",
  transaction_type: "issue",
  transaction_date: "2025-11-07T16:30:00Z",
  product_id: "flour-uuid",
  location_id: "mk-uuid",
  quantity: 25.00000,
  unit_cost: 4.86000,                  // 🟢 Weighted average
  total_cost: 121.50000,
  reference_document: "PO-1234"
}
```

**Step 4: Create Cost Layer Records (ADJUSTMENTS)**

**Consumption Record 1 (Lot 1 - Full Consumption):**
```typescript
{
  id: "uuid-cl-issue-1",
  inventory_transaction_detail_id: "uuid-txn-issue",

  // ADJUSTMENT PATTERN
  lot_no: NULL,                        // 🔴 NULL = consumption
  lot_index: 2,                        // Next index for this parent
  parent_lot_no: "MK-251105-0012",    // 🔴 Links to consumed lot

  location_code: "MK",
  product_id: "flour-uuid",

  transaction_type: "issue",

  in_qty: 0.00000,                     // 🔴 No receipt
  out_qty: 15.00000,                   // 🔴 Full lot consumed
  cost_per_unit: 4.80000,              // Cost from parent lot
  total_cost: 72.00000                 // 15 × 4.80
}
```

**Consumption Record 2 (Lot 2 - Partial Consumption):**
```typescript
{
  id: "uuid-cl-issue-2",
  inventory_transaction_detail_id: "uuid-txn-issue",

  // ADJUSTMENT PATTERN
  lot_no: NULL,                        // 🔴 NULL = consumption
  lot_index: 2,                        // Next index for this parent
  parent_lot_no: "MK-251106-0008",    // 🔴 Links to consumed lot

  location_code: "MK",
  product_id: "flour-uuid",

  transaction_type: "issue",

  in_qty: 0.00000,
  out_qty: 10.00000,                   // 🔴 Partial consumption
  cost_per_unit: 4.95000,
  total_cost: 49.50000                 // 10 × 4.95
}
```

**Step 5: Calculate Updated Balances**

```sql
-- Lot MK-251105-0012 Balance
SELECT SUM(in_qty) - SUM(out_qty) as balance
FROM tb_inventory_transaction_cost_layer
WHERE parent_lot_no = 'MK-251105-0012'
   OR lot_no = 'MK-251105-0012';

-- Records:
-- 1. lot_no = MK-251105-0012: in_qty = 15, out_qty = 0  (creation)
-- 2. parent_lot_no = MK-251105-0012: in_qty = 0, out_qty = 15  (consumption)
-- Balance: (15 + 0) - (0 + 15) = 0 kg  ❌ DEPLETED

-- Lot MK-251106-0008 Balance
-- 1. lot_no = MK-251106-0008: in_qty = 40, out_qty = 0
-- 2. parent_lot_no = MK-251106-0008: in_qty = 0, out_qty = 10
-- Balance: (40 + 0) - (0 + 10) = 30 kg  ✓ ACTIVE

-- Lot MK-251107-0001 Balance
-- 1. lot_no = MK-251107-0001: in_qty = 50, out_qty = 0
-- Balance: 50 - 0 = 50 kg  ✓ ACTIVE (untouched)
```

#### Inventory Impact

```
Before Issue:
┌─────────────────┬──────────┬───────────┬───────────┬────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │ Age    │
├─────────────────┼──────────┼───────────┼───────────┼────────┤
│ MK-251105-0012  │ 15 kg    │ $4.80/kg  │ $72.00    │ 2 days │ ← Oldest
│ MK-251106-0008  │ 40 kg    │ $4.95/kg  │ $198.00   │ 1 day  │
│ MK-251107-0001  │ 50 kg    │ $5.50/kg  │ $275.00   │ 0 days │ ← Newest
└─────────────────┴──────────┴───────────┴───────────┴────────┘
Total: 105 kg, Value: $545.00

After Issue (FIFO consumed oldest first):
┌─────────────────┬──────────┬───────────┬───────────┬────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │ Status │
├─────────────────┼──────────┼───────────┼───────────┼────────┤
│ MK-251105-0012  │ 0 kg     │ $4.80/kg  │ $0.00     │ DEPLETED ❌
│ MK-251106-0008  │ 30 kg    │ $4.95/kg  │ $148.50   │ ACTIVE ✓
│ MK-251107-0001  │ 50 kg    │ $5.50/kg  │ $275.00   │ ACTIVE ✓
└─────────────────┴──────────┴───────────┴───────────┴────────┘
Total: 80 kg, Value: $423.50

Issue Summary:
- Quantity Issued: 25 kg
- Total Cost: $121.50
- Weighted Avg Cost: $4.86/kg
- Lots Affected: 2 (1 depleted, 1 partial)
```

#### GL Posting
```
DR: Production/Cost of Goods Used    $121.50
CR: Inventory Asset (Flour)          $121.50
```

---

### Scenario 5: Transfer-Out with Multiple Source Lots (FIFO)

**Business Context**: Transfer inventory between locations. Uses FIFO at source, creates new lot at destination.

#### Initial State

**Source Location (Pastry Venue - PV):**
```yaml
Available Lots:
  1. PV-251106-0025: 7 kg @ $8.20/kg  (older)
  2. PV-251106-0030: 5 kg @ $8.30/kg  (newer)
Total: 12 kg
```

#### Transaction Details
```yaml
Document: TRF-2501-0001
Transfer Date: 2025-11-07
From: Pastry Venue (PV)
To: Main Kitchen (MK)
Product: Butter (Unsalted)
Quantity: 10 kg
```

#### Step-by-Step Process

**Step 1: FIFO Allocation at Source**

```typescript
// Transfer-out uses FIFO at source location
let remainingQty = 10;

// Iteration 1
{
  lotNo: "PV-251106-0025",
  needToConsume: 10,
  lotBalance: 7,
  qtyTaken: Math.min(10, 7) = 7,      // Full lot
  costPerUnit: 8.20,
  cost: 7 × 8.20 = 57.40,
  remaining: 10 - 7 = 3
}

// Iteration 2
{
  lotNo: "PV-251106-0030",
  needToConsume: 3,
  lotBalance: 5,
  qtyTaken: Math.min(3, 5) = 3,       // Partial
  costPerUnit: 8.30,
  cost: 3 × 8.30 = 24.90,
  remaining: 3 - 3 = 0  ✓
}

// Total Cost: $57.40 + $24.90 = $82.30
// Weighted Avg: $82.30 / 10 kg = $8.23/kg
```

**Step 2: Create Transfer-Out Transaction**
```typescript
// tb_inventory_transaction_detail (at source)
{
  id: "uuid-txn-transfer-out",
  transaction_id: "TRF-2501-0001",
  transaction_type: "transfer_out",
  transaction_date: "2025-11-07T14:00:00Z",
  product_id: "butter-uuid",
  location_id: "pv-uuid",             // Source location
  quantity: 10.00000,
  unit_cost: 8.23000,                 // Weighted average
  total_cost: 82.30000,
  destination_location_id: "mk-uuid"
}
```

**Step 3: Create Transfer-Out Cost Layer Records**

**Record 1 (Lot 1 - Full Consumption):**
```typescript
{
  id: "uuid-cl-transfer-out-1",
  inventory_transaction_detail_id: "uuid-txn-transfer-out",

  // ADJUSTMENT PATTERN
  lot_no: NULL,
  lot_index: 2,
  parent_lot_no: "PV-251106-0025",    // Source lot 1

  location_code: "PV",
  product_id: "butter-uuid",
  transaction_type: "transfer_out",

  in_qty: 0.00000,
  out_qty: 7.00000,                   // Full lot
  cost_per_unit: 8.20000,
  total_cost: 57.40000
}
```

**Record 2 (Lot 2 - Partial Consumption):**
```typescript
{
  id: "uuid-cl-transfer-out-2",
  inventory_transaction_detail_id: "uuid-txn-transfer-out",

  // ADJUSTMENT PATTERN
  lot_no: NULL,
  lot_index: 2,
  parent_lot_no: "PV-251106-0030",    // Source lot 2

  location_code: "PV",
  product_id: "butter-uuid",
  transaction_type: "transfer_out",

  in_qty: 0.00000,
  out_qty: 3.00000,                   // Partial
  cost_per_unit: 8.30000,
  total_cost: 24.90000
}
```

**Step 4: Create Transfer-In at Destination** (See Scenario 3)

New lot created: `MK-251107-0003` with cost $8.23/kg (weighted average from source)

#### Inventory Impact

**Source Location (PV):**
```
Before Transfer:
┌─────────────────┬──────────┬───────────┬───────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │
├─────────────────┼──────────┼───────────┼───────────┤
│ PV-251106-0025  │ 7 kg     │ $8.20/kg  │ $57.40    │
│ PV-251106-0030  │ 5 kg     │ $8.30/kg  │ $41.50    │
└─────────────────┴──────────┴───────────┴───────────┘
Total: 12 kg

After Transfer:
┌─────────────────┬──────────┬───────────┬───────────┬─────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │ Status  │
├─────────────────┼──────────┼───────────┼───────────┼─────────┤
│ PV-251106-0025  │ 0 kg     │ $8.20/kg  │ $0.00     │ DEPLETED│
│ PV-251106-0030  │ 2 kg     │ $8.30/kg  │ $16.60    │ ACTIVE  │
└─────────────────┴──────────┴───────────┴───────────┴─────────┘
Total: 2 kg (-10 kg)
```

**Destination Location (MK):**
```
After Transfer:
┌─────────────────┬──────────┬───────────┬───────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │
├─────────────────┼──────────┼───────────┼───────────┤
│ MK-251107-0003  │ 10 kg    │ $8.23/kg  │ $82.30    │ ← NEW
└─────────────────┴──────────┴───────────┴───────────┘
Total: 10 kg (+10 kg)
```

#### Traceability
```
Transfer Linkage:
Source Lots → Destination Lot
PV-251106-0025 (7 kg) ┐
                       ├──→ MK-251107-0003 (10 kg @ $8.23/kg)
PV-251106-0030 (3 kg) ┘
```

---

### Scenario 6: Stock-Out Adjustment (FIFO)

**Business Context**: Storekeeper adjusts inventory down due to spoilage, damage, or physical count shortage.

#### Initial State
```yaml
Available Lots:
  1. MK-251105-0018: 8 kg @ $6.50/kg  (tomatoes, older)
  2. MK-251106-0020: 12 kg @ $6.75/kg (tomatoes, newer)
Total: 20 kg
```

#### Transaction Details
```yaml
Document: ADJ-2501-001235
Type: Stock-Out Adjustment
Product: Tomatoes (Fresh)
Quantity: -5 kg (negative = stock-out)
Reason: "Spoilage - temperature issue"
Approval: Required for stock-out adjustments
```

#### Step-by-Step Process

**Step 1: Create Stock-Out Adjustment**
```typescript
{
  product_id: "tomato-uuid",
  location_id: "mk-uuid",
  adjustment_type: "STOCK_OUT",
  quantity: -5.00000,                  // Negative
  reason_code: "SPOILAGE",
  reason_description: "Spoilage - temperature issue",
  approval_status: "APPROVED",
  approved_by: "manager-uuid"
}
```

**Step 2: Convert to Consumption Quantity**
```typescript
// System converts negative quantity to positive for FIFO processing
const consumptionQty = Math.abs(-5); // 5 kg
```

**Step 3: FIFO Allocation**
```typescript
// Use FIFO to determine which lots to adjust
let remainingQty = 5;

// Iteration 1: Oldest lot
{
  lotNo: "MK-251105-0018",
  needToConsume: 5,
  lotBalance: 8,
  qtyTaken: Math.min(5, 8) = 5,       // Partial consumption
  costPerUnit: 6.50,
  cost: 5 × 6.50 = 32.50,
  remaining: 5 - 5 = 0  ✓
}

// Total Cost: $32.50
// Only 1 lot needed
```

**Step 4: Create Adjustment Transaction**
```typescript
{
  id: "uuid-txn-adj-stockout",
  transaction_id: "ADJ-2501-001235",
  transaction_type: "adjustment",
  transaction_date: "2025-11-07T18:00:00Z",
  product_id: "tomato-uuid",
  location_id: "mk-uuid",
  quantity: -5.00000,                  // Negative for stock-out
  unit_cost: 6.50000,
  total_cost: 32.50000
}
```

**Step 5: Create Cost Layer Record (ADJUSTMENT)**
```typescript
{
  id: "uuid-cl-adj-stockout",
  inventory_transaction_detail_id: "uuid-txn-adj-stockout",

  // ADJUSTMENT PATTERN
  lot_no: NULL,
  lot_index: 2,
  parent_lot_no: "MK-251105-0018",    // Oldest lot

  location_code: "MK",
  product_id: "tomato-uuid",
  transaction_type: "adjustment",

  in_qty: 0.00000,
  out_qty: 5.00000,                   // Stock reduction
  cost_per_unit: 6.50000,
  total_cost: 32.50000
}
```

#### Inventory Impact

```
Before Adjustment:
┌─────────────────┬──────────┬───────────┬───────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │
├─────────────────┼──────────┼───────────┼───────────┤
│ MK-251105-0018  │ 8 kg     │ $6.50/kg  │ $52.00    │
│ MK-251106-0020  │ 12 kg    │ $6.75/kg  │ $81.00    │
└─────────────────┴──────────┴───────────┴───────────┘
Total: 20 kg, Value: $133.00

After Adjustment:
┌─────────────────┬──────────┬───────────┬───────────┬────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │ Status │
├─────────────────┼──────────┼───────────┼───────────┼────────┤
│ MK-251105-0018  │ 3 kg     │ $6.50/kg  │ $19.50    │ ACTIVE │
│ MK-251106-0020  │ 12 kg    │ $6.75/kg  │ $81.00    │ ACTIVE │
└─────────────────┴──────────┴───────────┴───────────┴────────┘
Total: 15 kg, Value: $100.50

Adjustment Summary:
- Quantity Reduced: 5 kg (spoilage)
- Cost Removed: $32.50
- Lot Affected: MK-251105-0018 (oldest)
```

#### GL Posting
```
DR: Spoilage Expense             $32.50
CR: Inventory Asset (Tomatoes)   $32.50
```

---

### Scenario 7: Credit Note (Vendor Return)

**Business Context**: Company returns defective or excess goods to vendor. Credit note reduces inventory and accounts payable using FIFO costing.

#### Initial State
```yaml
Available Lots:
  1. MK-251105-0015: 20 kg @ $7.20/kg  (olive oil, older)
  2. MK-251106-0022: 30 kg @ $7.35/kg  (olive oil, newer)
Total: 50 kg
```

#### Transaction Details
```yaml
Document: CN-2501-0005
Type: Credit Note (Vendor Return)
Product: Olive Oil (Extra Virgin)
Quantity: 12 kg
Reason: "Quality issue - cloudiness detected"
Vendor: Mediterranean Imports Ltd
Original GRN: GRN-2501-0095
```

#### Step-by-Step Process

**Step 1: Create Credit Note**
```typescript
{
  credit_note_id: "CN-2501-0005",
  vendor_id: "vendor-mediterranean-uuid",
  product_id: "olive-oil-uuid",
  location_id: "mk-uuid",
  return_quantity: 12.00000,
  reason_code: "QUALITY_ISSUE",
  reason_description: "Quality issue - cloudiness detected",
  original_grn: "GRN-2501-0095",
  approval_status: "APPROVED",
  approved_by: "purchasing-manager-uuid"
}
```

**Step 2: FIFO Allocation for Return**
```typescript
// Credit note uses FIFO to determine which lots to return
let remainingQty = 12;

// Iteration 1: Oldest lot
{
  lotNo: "MK-251105-0015",
  needToConsume: 12,
  lotBalance: 20,
  qtyTaken: Math.min(12, 20) = 12,    // Partial consumption
  costPerUnit: 7.20,
  cost: 12 × 7.20 = 86.40,
  remaining: 12 - 12 = 0  ✓
}

// Total Cost: $86.40
// Only 1 lot needed
```

**Step 3: Create Credit Note Transaction**
```typescript
{
  id: "uuid-txn-cn",
  transaction_id: "CN-2501-0005",
  transaction_type: "credit_note",
  transaction_date: "2025-11-07T11:00:00Z",
  product_id: "olive-oil-uuid",
  location_id: "mk-uuid",
  quantity: 12.00000,
  unit_cost: 7.20000,
  total_cost: 86.40000,
  reference_document: "GRN-2501-0095"
}
```

**Step 4: Create Cost Layer Record (ADJUSTMENT)**
```typescript
{
  id: "uuid-cl-cn",
  inventory_transaction_detail_id: "uuid-txn-cn",

  // ADJUSTMENT PATTERN (same as issue/consumption)
  lot_no: NULL,                        // 🔴 NULL = consumption
  lot_index: 2,                        // Next index for parent
  parent_lot_no: "MK-251105-0015",    // 🔴 Oldest lot

  location_code: "MK",
  product_id: "olive-oil-uuid",
  transaction_type: "credit_note",

  in_qty: 0.00000,                     // 🔴 No receipt
  out_qty: 12.00000,                   // 🔴 Returned to vendor
  cost_per_unit: 7.20000,              // Cost from parent lot
  total_cost: 86.40000                 // Cost recovered
}
```

**Step 5: Calculate Updated Balances**
```sql
-- Lot MK-251105-0015 Balance
SELECT SUM(in_qty) - SUM(out_qty) as balance
FROM tb_inventory_transaction_cost_layer
WHERE parent_lot_no = 'MK-251105-0015'
   OR lot_no = 'MK-251105-0015';

-- Records:
-- 1. lot_no = MK-251105-0015: in_qty = 20, out_qty = 0  (creation)
-- 2. parent_lot_no = MK-251105-0015: in_qty = 0, out_qty = 12  (credit note)
-- Balance: (20 + 0) - (0 + 12) = 8 kg  ✓ ACTIVE
```

#### Inventory Impact

```
Before Credit Note:
┌─────────────────┬──────────┬───────────┬───────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │
├─────────────────┼──────────┼───────────┼───────────┤
│ MK-251105-0015  │ 20 kg    │ $7.20/kg  │ $144.00   │
│ MK-251106-0022  │ 30 kg    │ $7.35/kg  │ $220.50   │
└─────────────────┴──────────┴───────────┴───────────┘
Total: 50 kg, Value: $364.50

After Credit Note (FIFO - oldest lot returned):
┌─────────────────┬──────────┬───────────┬───────────┬────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │ Status │
├─────────────────┼──────────┼───────────┼───────────┼────────┤
│ MK-251105-0015  │ 8 kg     │ $7.20/kg  │ $57.60    │ ACTIVE │
│ MK-251106-0022  │ 30 kg    │ $7.35/kg  │ $220.50   │ ACTIVE │
└─────────────────┴──────────┴───────────┴───────────┴────────┘
Total: 38 kg, Value: $278.10

Credit Note Summary:
- Quantity Returned: 12 kg
- Cost Recovered: $86.40
- Lot Affected: MK-251105-0015 (oldest)
- Vendor Credit: $86.40
```

#### GL Posting
```
DR: Accounts Payable (Vendor)    $86.40
CR: Inventory Asset (Olive Oil)  $86.40

Note: Reduces both inventory and vendor liability
```

#### Business Impact
```yaml
Financial Impact:
  - Inventory Value Reduced: $86.40
  - Vendor Payable Reduced: $86.40
  - Net P&L Impact: $0 (asset reduction offset by liability reduction)

Operational Impact:
  - Available inventory reduced by 12 kg
  - Vendor relationship: Quality issue documented
  - Future purchasing decision: Review vendor quality control

Traceability:
  - Original Receipt: GRN-2501-0095
  - Return Document: CN-2501-0005
  - Lot Consumed: MK-251105-0015 (FIFO)
  - Cost Basis: Historical cost from original receipt
```

#### Comparison: Credit Note vs Other Consumption Transactions

| Aspect | Credit Note | Issue | Transfer-Out | Stock-Out Adj |
|--------|-------------|-------|--------------|---------------|
| **Purpose** | Vendor return | Production use | Location transfer | Count variance |
| **FIFO?** | ✓ Yes | ✓ Yes | ✓ Yes | ✓ Yes |
| **GL Debit** | Accounts Payable | Production Cost | Inventory-Transit | Spoilage/Variance |
| **GL Credit** | Inventory Asset | Inventory Asset | Inventory Asset | Inventory Asset |
| **Vendor Impact** | Reduces payable | None | None | None |
| **Approval** | Required | Standard | Standard | Required |
| **Traceability** | Links to GRN | Links to PO | Links to transfer | Links to count |

---

### Scenario 8: Credit Note - Amount-Only Discount (AMOUNT_DISCOUNT)

**Business Context**: Company receives a pricing adjustment or retrospective discount from vendor without physical return of goods. This is a purely financial transaction with no inventory impact.

#### Initial State
```yaml
Inventory Status: Normal operations (no physical return)
Previous Purchases: Multiple GRNs in Q1 2025
Total Purchase Value: $12,500.00
Vendor Agreement: 4% volume rebate for Q1 purchases
```

#### Transaction Details
```yaml
Document: CN-2501-0006
Type: Credit Note (Amount-Only Discount)
Credit Type: AMOUNT_DISCOUNT
Discount Amount: $500.00 (4% of $12,500)
Reason: DISCOUNT_AGREEMENT (Volume Rebate)
Vendor: Premium Suppliers Ltd
Period: Q1 2025 purchases (Jan-Mar)
Tax Rate: 18%
Tax Amount: $90.00
Total Credit: $590.00
```

#### Step-by-Step Process

**Step 1: Create Amount-Only Credit Note**
```typescript
{
  credit_note_id: "CN-2501-0006",
  credit_type: "AMOUNT_DISCOUNT",         // 🟢 No physical return
  vendor_id: "vendor-premium-uuid",
  discount_amount: 500.00000,
  reason_code: "DISCOUNT_AGREEMENT",
  reason_description: "Q1 2025 Volume Rebate - 4%",
  period_start: "2025-01-01",
  period_end: "2025-03-31",
  total_purchase_value: 12500.00000,
  discount_rate: 0.04,
  tax_rate: 0.18,
  tax_amount: 90.00000,
  total_credit: 590.00000,
  approval_status: "APPROVED",
  approved_by: "finance-manager-uuid"
}
```

**Step 2: NO Cost Layer Records Created**
```typescript
// ❌ CRITICAL: No cost layer records for AMOUNT_DISCOUNT
// ❌ No lot_no entries
// ❌ No parent_lot_no entries
// ❌ No inventory adjustment
// ❌ No FIFO processing

// This is purely a financial transaction
```

**Step 3: Create Financial Transaction Only**
```typescript
{
  id: "uuid-txn-cn-discount",
  transaction_id: "CN-2501-0006",
  transaction_type: "credit_note",
  transaction_date: "2025-03-31T16:00:00Z",
  vendor_id: "vendor-premium-uuid",
  discount_amount: 500.00000,
  tax_amount: 90.00000,
  total_amount: 590.00000,
  reference_period: "Q1-2025"
}
```

**Step 4: NO Inventory Impact**
```sql
-- NO changes to inventory balances
-- NO lot consumption
-- NO stock movements
```

#### GL Posting
```
DR: Accounts Payable (Vendor)      $590.00
CR: Purchase Discounts (Income)    $500.00
CR: Input VAT (Tax Recoverable)    $90.00

Note: Reduces vendor liability and records discount income
```

#### Business Impact
```yaml
Financial Impact:
  - Vendor Payable Reduced: $590.00
  - Purchase Discount Income: $500.00
  - Input VAT Reduced: $90.00
  - Net P&L Impact: +$500.00 (income from discount)

Inventory Impact:
  - Inventory Value: No change ✓
  - Inventory Quantity: No change ✓
  - Lot Balances: No change ✓

Operational Impact:
  - Vendor relationship: Volume rebate achieved
  - Future purchasing: Incentivized to maintain volume
  - Cash flow: Reduced amount owed to vendor
```

#### Comparison: AMOUNT_DISCOUNT vs QUANTITY_RETURN

| Aspect | AMOUNT_DISCOUNT | QUANTITY_RETURN |
|--------|-----------------|-----------------|
| **Physical Return** | ❌ No | ✅ Yes |
| **Inventory Impact** | ❌ None | ✅ Reduces inventory |
| **Lot Processing** | ❌ No FIFO | ✅ FIFO from lots |
| **Cost Layer Records** | ❌ None created | ✅ ADJUSTMENT records |
| **GL Debit** | Accounts Payable | Accounts Payable |
| **GL Credit (Primary)** | Purchase Discounts | Inventory Asset |
| **GL Credit (Tax)** | Input VAT | Input VAT |
| **Use Cases** | Pricing errors, discounts, rebates | Damaged goods, defects, over-shipment |
| **Approval Required** | Standard | Required |
| **Traceability** | Links to period/GRNs | Links to specific GRN + lots |

---

### Scenario 9: Credit Note - Partial Inventory Availability

**Business Context**: Company needs to return goods to vendor, but some inventory has already been consumed. System splits processing between available inventory (physical return) and consumed inventory (COGS adjustment).

#### Initial State
```yaml
Original Receipt (GRN-2501-0120):
  - Product: Chicken Breast (Fresh)
  - Received: 50 kg @ $8.50/kg
  - Lot: MK-251202-0025
  - Total Value: $425.00

Current Status:
  - Lot MK-251202-0025 Balance: 10 kg (40 kg already issued to production)
  - Available for return: 10 kg
  - Already consumed: 40 kg
```

#### Transaction Details
```yaml
Document: CN-2501-0007
Type: Credit Note (Vendor Return - Partial Availability)
Credit Type: QUANTITY_RETURN
Product: Chicken Breast (Fresh)
Return Quantity: 30 kg (requested by purchasing)
Reason: QUALITY_ISSUE (temperature abuse during transport)
Vendor: Fresh Poultry Suppliers
Original GRN: GRN-2501-0120

Split Processing:
  - Available Portion: 10 kg (will be returned to stock)
  - Consumed Portion: 20 kg (already used, COGS adjustment)
```

#### Step-by-Step Process

**Step 1: System Detects Partial Availability**
```typescript
// Check lot balance
const lotBalance = await calculateLotBalance("MK-251202-0025");
// Result: 10 kg available

const returnQty = 30;  // Requested
const availableQty = Math.min(returnQty, lotBalance);  // 10 kg
const consumedQty = returnQty - availableQty;          // 20 kg

console.log(`
  Return Request: ${returnQty} kg
  Available: ${availableQty} kg (can return to stock)
  Consumed: ${consumedQty} kg (COGS adjustment only)
`);
```

**Step 2: FIFO Allocation for Available Portion**
```typescript
// Process available 10 kg using standard FIFO
{
  lotNo: "MK-251202-0025",
  availableBalance: 10,
  qtyTaken: 10,                    // ✓ Full available balance
  costPerUnit: 8.50,
  cost: 10 × 8.50 = 85.00
}
```

**Step 3: Create Cost Layer Record for Available Portion (ADJUSTMENT)**
```typescript
{
  id: "uuid-cl-cn-available",
  inventory_transaction_detail_id: "uuid-txn-cn",

  // ADJUSTMENT PATTERN (standard FIFO consumption)
  lot_no: NULL,                        // 🔴 NULL = consumption
  lot_index: 2,
  parent_lot_no: "MK-251202-0025",    // 🔴 Consumed lot

  location_code: "MK",
  product_id: "chicken-breast-uuid",
  transaction_type: "credit_note",

  in_qty: 0.00000,                     // 🔴 No receipt
  out_qty: 10.00000,                   // 🔴 Available portion
  cost_per_unit: 8.50000,
  total_cost: 85.00000
}
```

**Step 4: Calculate COGS Adjustment for Consumed Portion**
```typescript
// Consumed portion: 20 kg already issued to production
// Must adjust COGS to reflect vendor credit on consumed goods

const consumedCOGS = {
  quantity: 20,
  historicalCost: 8.50,  // Original cost from GRN
  totalCOGS: 20 × 8.50 = 170.00
};

// NO cost layer record for consumed portion
// Only financial GL adjustment
```

**Step 5: Calculate Combined Balances**
```sql
-- Lot MK-251202-0025 Balance After Return
SELECT SUM(in_qty) - SUM(out_qty) as balance
FROM tb_inventory_transaction_cost_layer
WHERE parent_lot_no = 'MK-251202-0025'
   OR lot_no = 'MK-251202-0025';

-- Records:
-- 1. lot_no = MK-251202-0025: in_qty = 50, out_qty = 0  (creation)
-- 2. parent_lot_no = MK-251202-0025: in_qty = 0, out_qty = 40 (issued)
-- 3. parent_lot_no = MK-251202-0025: in_qty = 0, out_qty = 10 (CN available)
-- Balance: (50 + 0 + 0) - (0 + 40 + 10) = 0 kg  ✓ DEPLETED
```

#### Inventory Impact

```
Before Credit Note:
┌─────────────────┬──────────┬───────────┬───────────┬────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │ Status │
├─────────────────┼──────────┼───────────┼───────────┼────────┤
│ MK-251202-0025  │ 10 kg    │ $8.50/kg  │ $85.00    │ ACTIVE │
└─────────────────┴──────────┴───────────┴───────────┴────────┘
Total: 10 kg, Value: $85.00

After Credit Note:
┌─────────────────┬──────────┬───────────┬───────────┬──────────┐
│ Lot Number      │ Balance  │ Unit Cost │ Value     │ Status   │
├─────────────────┼──────────┼───────────┼───────────┼──────────┤
│ MK-251202-0025  │ 0 kg     │ $8.50/kg  │ $0.00     │ DEPLETED │
└─────────────────┴──────────┴───────────┴───────────┴──────────┘
Total: 0 kg, Value: $0.00

Credit Note Summary:
- Total Return Quantity: 30 kg
- Available Portion: 10 kg (FIFO from lot, reduces inventory)
- Consumed Portion: 20 kg (COGS adjustment, no inventory)
- Total Credit Amount: $255.00 (30 kg × $8.50)
- Vendor Credit: $255.00
```

#### GL Posting (Split Processing)
```
DR: Accounts Payable (Vendor)           $255.00
CR: Inventory Asset (Available 10 kg)   $85.00
CR: Cost of Goods Sold (Consumed 20 kg) $170.00
CR: Input VAT (Tax on total)            $45.90

Note: Combined entry for both available and consumed portions
```

#### Business Impact
```yaml
Financial Impact:
  - Vendor Payable Reduced: $255.00 (full return credit)
  - Inventory Value Reduced: $85.00 (available portion only)
  - COGS Reduced: $170.00 (consumed portion adjustment)
  - Input VAT Reduced: $45.90
  - Net P&L Impact: -$170.00 (COGS reduction offsets consumed goods)

Inventory Impact:
  - Physical inventory reduced: 10 kg (available portion)
  - Lot MK-251202-0025: Fully depleted
  - No new lots created

Operational Impact:
  - Quality issue documented for 30 kg total
  - Vendor relationship: Quality control review required
  - Production impact: 20 kg already consumed (no physical return possible)
  - Future purchasing: Review temperature controls with vendor
```

#### Split Processing Logic

```typescript
interface PartialAvailabilityResult {
  availablePortion: {
    quantity: number;           // 10 kg
    costPerUnit: number;        // $8.50
    totalCost: number;          // $85.00
    processing: "FIFO_INVENTORY";
    glAccount: "1140 Inventory Asset";
  };
  consumedPortion: {
    quantity: number;           // 20 kg
    costPerUnit: number;        // $8.50
    totalCost: number;          // $170.00
    processing: "COGS_ADJUSTMENT";
    glAccount: "5000 Cost of Goods Sold";
  };
  totalCredit: number;          // $255.00
  vendorPayableReduction: number; // $255.00
}

// Processing workflow:
// 1. Check lot balance → 10 kg available
// 2. Split: 10 kg available, 20 kg consumed
// 3. FIFO process available portion → create ADJUSTMENT record
// 4. Calculate COGS for consumed portion → GL entry only
// 5. Combined journal entry → DR A/P, CR Inventory + COGS
```

---

## Complete Database Record Flow

### Full Lifecycle Example: Receipt → Consumption → Depletion

This example shows all database records for a single lot through its entire lifecycle.

#### Day 1: Lot Creation (GRN)

**Transaction:**
```typescript
// tb_inventory_transaction_detail
{
  id: "txn-001",
  transaction_id: "GRN-2501-0100",
  transaction_type: "good_received_note",
  transaction_date: "2025-11-05T10:00:00Z",
  product_id: "sugar-uuid",
  location_id: "mk-uuid",
  quantity: 30.00000,
  unit_cost: 4.80000
}
```

**Cost Layer Record (LOT):**
```typescript
// tb_inventory_transaction_cost_layer
{
  id: "cl-001",
  inventory_transaction_detail_id: "txn-001",

  // LOT PATTERN
  lot_no: "MK-251105-0012",           // 🟢 New lot
  lot_index: 1,                        // First record
  parent_lot_no: NULL,                 // 🟢 NULL = creation

  transaction_type: "good_received_note",

  in_qty: 30.00000,                    // 🟢 Receipt
  out_qty: 0.00000,
  cost_per_unit: 4.80000,
  total_cost: 144.00000
}

-- Balance calculation:
-- SUM(in_qty) - SUM(out_qty) = 30 - 0 = 30 kg ✓
```

#### Day 2: First Consumption (Issue)

**Transaction:**
```typescript
{
  id: "txn-002",
  transaction_id: "ISS-2501-0200",
  transaction_type: "issue",
  transaction_date: "2025-11-06T15:00:00Z",
  product_id: "sugar-uuid",
  location_id: "mk-uuid",
  quantity: 20.00000,
  unit_cost: 4.80000
}
```

**Cost Layer Record (ADJUSTMENT):**
```typescript
{
  id: "cl-002",
  inventory_transaction_detail_id: "txn-002",

  // ADJUSTMENT PATTERN
  lot_no: NULL,                        // 🔴 NULL = consumption
  lot_index: 2,                        // Second record for parent
  parent_lot_no: "MK-251105-0012",    // 🔴 Links to lot

  transaction_type: "issue",

  in_qty: 0.00000,
  out_qty: 20.00000,                   // 🔴 Consumption
  cost_per_unit: 4.80000,
  total_cost: 96.00000
}

-- Balance calculation:
-- Record 1: in_qty = 30, out_qty = 0
-- Record 2: in_qty = 0, out_qty = 20
-- Balance: (30 + 0) - (0 + 20) = 10 kg ✓
```

#### Day 3: Second Consumption (Adjustment)

**Transaction:**
```typescript
{
  id: "txn-003",
  transaction_id: "ADJ-2501-0300",
  transaction_type: "adjustment",
  transaction_date: "2025-11-07T09:00:00Z",
  product_id: "sugar-uuid",
  location_id: "mk-uuid",
  quantity: -5.00000,                  // Stock-out
  unit_cost: 4.80000
}
```

**Cost Layer Record (ADJUSTMENT):**
```typescript
{
  id: "cl-003",
  inventory_transaction_detail_id: "txn-003",

  // ADJUSTMENT PATTERN
  lot_no: NULL,
  lot_index: 3,                        // Third record for parent
  parent_lot_no: "MK-251105-0012",

  transaction_type: "adjustment",

  in_qty: 0.00000,
  out_qty: 5.00000,
  cost_per_unit: 4.80000,
  total_cost: 24.00000
}

-- Balance calculation:
-- Record 1: in_qty = 30, out_qty = 0
-- Record 2: in_qty = 0, out_qty = 20
-- Record 3: in_qty = 0, out_qty = 5
-- Balance: (30) - (20 + 5) = 5 kg ✓
```

#### Day 4: Final Consumption (Depletion)

**Transaction:**
```typescript
{
  id: "txn-004",
  transaction_id: "ISS-2501-0400",
  transaction_type: "issue",
  transaction_date: "2025-11-08T11:00:00Z",
  product_id: "sugar-uuid",
  location_id: "mk-uuid",
  quantity: 5.00000,
  unit_cost: 4.80000
}
```

**Cost Layer Record (ADJUSTMENT):**
```typescript
{
  id: "cl-004",
  inventory_transaction_detail_id: "txn-004",

  // ADJUSTMENT PATTERN
  lot_no: NULL,
  lot_index: 4,                        // Fourth record
  parent_lot_no: "MK-251105-0012",

  transaction_type: "issue",

  in_qty: 0.00000,
  out_qty: 5.00000,                    // Final consumption
  cost_per_unit: 4.80000,
  total_cost: 24.00000
}

-- Balance calculation:
-- Record 1: in_qty = 30, out_qty = 0
-- Record 2: in_qty = 0, out_qty = 20
-- Record 3: in_qty = 0, out_qty = 5
-- Record 4: in_qty = 0, out_qty = 5
-- Balance: (30) - (20 + 5 + 5) = 0 kg ❌ DEPLETED
```

### Complete Lot Record Summary

```sql
-- Query all records for lot MK-251105-0012
SELECT
  id,
  lot_no,
  lot_index,
  parent_lot_no,
  transaction_type,
  in_qty,
  out_qty,
  cost_per_unit,
  total_cost,
  transaction_date
FROM tb_inventory_transaction_cost_layer
WHERE lot_no = 'MK-251105-0012'
   OR parent_lot_no = 'MK-251105-0012'
ORDER BY lot_index ASC;
```

**Results:**
```
┌─────────┬──────────────────┬───────────┬──────────────────┬──────────────────────┬─────────┬──────────┬──────────────┬─────────────┬──────────────┐
│ id      │ lot_no           │ lot_index │ parent_lot_no    │ transaction_type     │ in_qty  │ out_qty  │ cost_per_unit│ total_cost  │ date         │
├─────────┼──────────────────┼───────────┼──────────────────┼──────────────────────┼─────────┼──────────┼──────────────┼─────────────┼──────────────┤
│ cl-001  │ MK-251105-0012   │ 1         │ NULL             │ good_received_note   │ 30.00   │ 0.00     │ 4.80         │ 144.00      │ 2025-11-05   │ ← Creation
│ cl-002  │ NULL             │ 2         │ MK-251105-0012   │ issue                │ 0.00    │ 20.00    │ 4.80         │ 96.00       │ 2025-11-06   │ ← Consumption
│ cl-003  │ NULL             │ 3         │ MK-251105-0012   │ adjustment           │ 0.00    │ 5.00     │ 4.80         │ 24.00       │ 2025-11-07   │ ← Consumption
│ cl-004  │ NULL             │ 4         │ MK-251105-0012   │ issue                │ 0.00    │ 5.00     │ 4.80         │ 24.00       │ 2025-11-08   │ ← Consumption
└─────────┴──────────────────┴───────────┴──────────────────┴──────────────────────┴─────────┴──────────┴──────────────┴─────────────┴──────────────┘

Balance Progression:
- Day 1 (Index 1): 30 - 0 = 30 kg
- Day 2 (Index 2): 30 - 20 = 10 kg
- Day 3 (Index 3): 30 - 25 = 5 kg
- Day 4 (Index 4): 30 - 30 = 0 kg (DEPLETED)

Total Value Consumed: $144.00 (30 kg @ $4.80/kg)
```

---

## Key Patterns & Formulas

### Pattern Recognition Table

| Field | LOT (Creation) | ADJUSTMENT (Consumption) |
|-------|----------------|--------------------------|
| **lot_no** | Generated (e.g., MK-251107-0001) | NULL |
| **parent_lot_no** | NULL | Populated (references consumed lot) |
| **in_qty** | > 0 (receipt quantity) | 0 |
| **out_qty** | 0 | > 0 (consumption quantity) |
| **transaction_type** | good_received_note, adjustment, transfer_in | issue, adjustment, transfer_out |
| **Meaning** | New inventory receipt | Consumption from existing lot |

### FIFO Query Pattern

```sql
-- Standard FIFO query for available lots
SELECT
  lot_no,
  SUM(in_qty) - SUM(out_qty) as remaining_quantity,
  cost_per_unit,
  lot_at_date,
  location_code
FROM tb_inventory_transaction_cost_layer
WHERE product_id = :product_id
  AND location_id = :location_id
  AND lot_no IS NOT NULL
GROUP BY lot_no, cost_per_unit, lot_at_date, location_code
HAVING SUM(in_qty) - SUM(out_qty) > 0
ORDER BY lot_no ASC;  -- ⭐ FIFO: Chronological order

-- Why ORDER BY lot_no ASC ensures FIFO:
-- Lot numbers contain embedded date: {LOCATION}-{YYMMDD}-{SEQSEQ}
-- Example: MK-251105-0001 < MK-251106-0001 < MK-251107-0001
-- Natural string sort = chronological sort
```

### Balance Calculation Formula

```typescript
// Balance for a specific lot
function calculateLotBalance(lotNo: string): Decimal {
  const records = await prisma.tb_inventory_transaction_cost_layer.findMany({
    where: {
      OR: [
        { lot_no: lotNo },              // Creation record
        { parent_lot_no: lotNo }        // Consumption records
      ]
    }
  });

  const totalIn = records
    .reduce((sum, r) => sum.plus(r.in_qty), new Decimal(0));

  const totalOut = records
    .reduce((sum, r) => sum.plus(r.out_qty), new Decimal(0));

  return totalIn.minus(totalOut);
}

// Example:
// Lot MK-251107-0001 records:
// 1. lot_no = MK-251107-0001, in_qty = 50, out_qty = 0
// 2. parent_lot_no = MK-251107-0001, in_qty = 0, out_qty = 15
// 3. parent_lot_no = MK-251107-0001, in_qty = 0, out_qty = 20
// Balance = (50 + 0 + 0) - (0 + 15 + 20) = 15 kg
```

### Weighted Average Cost Formula

```typescript
// Calculate weighted average cost from multiple lots
function calculateWeightedAvgCost(
  allocations: LotAllocation[]
): Decimal {
  const totalCost = allocations
    .reduce((sum, a) => sum.plus(a.totalCost), new Decimal(0));

  const totalQty = allocations
    .reduce((sum, a) => sum.plus(a.qtyConsumed), new Decimal(0));

  return totalCost.dividedBy(totalQty);
}

// Example:
// Lot 1: 7 kg @ $8.20 = $57.40
// Lot 2: 3 kg @ $8.30 = $24.90
// Total: 10 kg, Cost: $82.30
// Weighted Avg: $82.30 / 10 kg = $8.23/kg
```

### FIFO Allocation Algorithm

```typescript
async function allocateFifo(
  productId: string,
  locationId: string,
  requiredQty: Decimal
): Promise<FifoAllocation[]> {
  // Step 1: Get available lots in FIFO order
  const availableLots = await getAvailableLots(productId, locationId);

  const allocations: FifoAllocation[] = [];
  let remainingQty = requiredQty;

  // Step 2: Allocate from oldest to newest
  for (const lot of availableLots) {
    if (remainingQty.lte(0)) break;

    // Take lesser of: what we need or what's available
    const qtyFromLot = remainingQty.gte(lot.remainingQty)
      ? lot.remainingQty
      : remainingQty;

    allocations.push({
      lotNo: lot.lot_no,
      qtyConsumed: qtyFromLot,
      costPerUnit: lot.cost_per_unit,
      totalCost: qtyFromLot.mul(lot.cost_per_unit),
      lotIndex: await getNextLotIndex(lot.lot_no)
    });

    remainingQty = remainingQty.sub(qtyFromLot);
  }

  // Step 3: Validate sufficient inventory
  if (remainingQty.gt(0)) {
    throw new InsufficientInventoryError(
      `Required: ${requiredQty}, Available: ${requiredQty.sub(remainingQty)}`
    );
  }

  return allocations;
}
```

### Lot Number Generation Algorithm

```typescript
async function generateLotNumber(
  locationCode: string,
  receiptDate: Date
): Promise<{ lotNo: string; seqNo: number }> {
  const dateStr = format(receiptDate, 'yyMMdd');

  // Get last sequence for location + date
  const lastLot = await prisma.$queryRaw`
    SELECT lot_seq_no
    FROM tb_inventory_transaction_cost_layer
    WHERE location_code = ${locationCode}
      AND lot_at_date::date = ${receiptDate}::date
    ORDER BY lot_seq_no DESC
    LIMIT 1
  `;

  const nextSeq = lastLot ? lastLot.lot_seq_no + 1 : 1;

  // Validate sequence limit
  if (nextSeq > 9999) {
    throw new Error(
      `Daily lot limit (9999) exceeded for ${locationCode} on ${dateStr}`
    );
  }

  // Format with 4-digit padding
  const seqStr = nextSeq.toString().padStart(4, '0');

  return {
    lotNo: `${locationCode}-${dateStr}-${seqStr}`,
    seqNo: nextSeq
  };
}

// Examples:
// generateLotNumber("MK", new Date("2025-11-07"))
// → { lotNo: "MK-251107-0001", seqNo: 1 }

// generateLotNumber("PV", new Date("2025-11-07"))
// → { lotNo: "PV-251107-0001", seqNo: 1 }
```

---

## Quick Reference

### Transaction Type Mapping

| Transaction Type | Creates LOT? | Uses FIFO? | Field Pattern | Notes |
|------------------|--------------|------------|---------------|-------|
| **good_received_note** | ✓ Yes | No | lot_no populated, parent_lot_no = NULL | Creates new lot |
| **adjustment** (stock-in) | ✓ Yes | No | lot_no populated, parent_lot_no = NULL | Creates new lot |
| **transfer_in** | ✓ Yes | No | lot_no populated, parent_lot_no = NULL | Creates new lot with weighted avg cost |
| **issue** | No | ✓ Yes | lot_no = NULL, parent_lot_no populated | FIFO consumption |
| **adjustment** (stock-out) | No | ✓ Yes | lot_no = NULL, parent_lot_no populated | FIFO consumption |
| **transfer_out** | No | ✓ Yes | lot_no = NULL, parent_lot_no populated | FIFO consumption |
| **credit_note** (QUANTITY_RETURN) | No | ✓ Yes | lot_no = NULL, parent_lot_no populated | FIFO consumption, physical return |
| **credit_note** (AMOUNT_DISCOUNT) | No | ❌ No | ❌ No cost layer records | Financial only, no inventory impact |
| **credit_note** (Partial Availability) | No | ✓ Yes | lot_no = NULL, parent_lot_no populated (available only) | Split: FIFO for available + COGS for consumed |

### Field Value Quick Reference

**LOT Creation Pattern:**
```typescript
{
  lot_no: "MK-251107-0001",    // ✓ Generated
  parent_lot_no: NULL,          // ✓ NULL
  in_qty: 50.00000,             // ✓ > 0
  out_qty: 0.00000              // ✓ = 0
}
```

**Consumption Pattern:**
```typescript
{
  lot_no: NULL,                 // ✓ NULL
  parent_lot_no: "MK-251107-0001", // ✓ Populated
  in_qty: 0.00000,              // ✓ = 0
  out_qty: 15.00000             // ✓ > 0
}
```

### Common Scenarios Matrix

| Scenario | LOT Created? | FIFO Used? | Multiple Lots? | Weighted Avg? | Inventory Impact? |
|----------|--------------|------------|----------------|---------------|-------------------|
| GRN Commitment | ✓ | - | No | - | Increases |
| Stock-In Adjustment | ✓ | - | No | - | Increases |
| Transfer-In | ✓ | - | No | ✓ (from source) | Increases |
| Issue/Consumption | - | ✓ | Possible | ✓ | Decreases |
| Stock-Out Adjustment | - | ✓ | Possible | ✓ | Decreases |
| Transfer-Out | - | ✓ | Possible | ✓ | Decreases |
| CN - QUANTITY_RETURN (Full) | - | ✓ | Possible | ✓ | Decreases |
| CN - AMOUNT_DISCOUNT | ❌ | ❌ | No | No | ❌ None |
| CN - Partial Availability | - | ✓ | Possible | ✓ | Decreases (available only) |

### SQL Quick Queries

**Get Available Lots (FIFO Order):**
```sql
SELECT lot_no,
       SUM(in_qty) - SUM(out_qty) as balance,
       cost_per_unit
FROM tb_inventory_transaction_cost_layer
WHERE product_id = :product_id
  AND location_id = :location_id
  AND lot_no IS NOT NULL
GROUP BY lot_no, cost_per_unit
HAVING SUM(in_qty) - SUM(out_qty) > 0
ORDER BY lot_no ASC;
```

**Get Lot Transaction History:**
```sql
SELECT *
FROM tb_inventory_transaction_cost_layer
WHERE lot_no = :lot_no
   OR parent_lot_no = :lot_no
ORDER BY lot_index ASC;
```

**Get Next Lot Index:**
```sql
SELECT COALESCE(MAX(lot_index), 0) + 1 as next_index
FROM tb_inventory_transaction_cost_layer
WHERE lot_no = :lot_no
   OR parent_lot_no = :lot_no;
```

**Calculate Total Inventory Value:**
```sql
SELECT
  SUM((SUM(in_qty) - SUM(out_qty)) * cost_per_unit) as total_value
FROM tb_inventory_transaction_cost_layer
WHERE product_id = :product_id
  AND location_id = :location_id
  AND lot_no IS NOT NULL
GROUP BY lot_no, cost_per_unit
HAVING SUM(in_qty) - SUM(out_qty) > 0;
```

---

**End of Document**
