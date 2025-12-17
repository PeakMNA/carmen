# Shared Method: Transaction Types and Cost Layers

**📌 Schema Reference**: Data structures defined in `/app/data-struc/schema.prisma`

**Version**: 2.0.0 (Future Enhancement Specification)
**Status**: ⚠️ **PLANNED - NOT YET IMPLEMENTED**
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Last Updated**: 2025-11-03

---

## ⚠️ CRITICAL NOTICE: Future Enhancement Document

**This document describes a PLANNED feature set that is NOT yet implemented.**

### Current Implementation Status

❌ **The following features described in this document DO NOT exist in the current schema**:
- Two-tier cost layer system (LOT vs ADJUSTMENT layers)
- `transaction_type` field to distinguish LOT from ADJUSTMENT
- `parent_lot_number` field for adjustment linkage
- Separate `tb_adjustment_layers` table
- Automatic lot number generation (partial implementation)

✅ **What DOES exist in current schema**:
- Structured lot tracking via `lot_no`: Format `{LOCATION}-{YYMMDD}-{SEQ}` (e.g., `MK-251102-001`)
- Date embedded in lot number (no separate receipt_date field needed)
- Balance tracking via `in_qty` and `out_qty` fields (calculated as SUM(in_qty) - SUM(out_qty))
- FIFO consumption using ORDER BY `lot_no ASC` (natural chronological sort)
- Transaction linkage via `inventory_transaction_detail_id`

**✅ IMPORTANT**: Balance calculation using `SUM(in_qty) - SUM(out_qty)` is the CORRECT design (not a planned feature). This document uses `remaining_quantity` in examples for readability, but implementation will always calculate from transaction history.

### Implementation Roadmap

This document describes **Phase 3: FIFO Algorithm Implementation** from `SCHEMA-ALIGNMENT.md`.

**Prerequisites**: Schema changes in Phase 1-2 must be completed first.

**For current implementation details, see**: `SM-costing-methods.md` v2.0.0

**For implementation roadmap, see**: `SCHEMA-ALIGNMENT.md` Phases 1-5

---

## 📊 Current vs. Future Comparison

### Quick Status Overview

| Feature Category | Current (v1.0) ✅ | Enhanced (v2.0) ⚠️ | Phase |
|------------------|-------------------|---------------------|-------|
| **Lot Tracking** | Basic lot numbers | Full LOT/ADJUSTMENT distinction | Phase 1 |
| **Traceability** | Manual joins (2 levels) | Automatic parent linkage (unlimited) | Phase 1 |
| **Transaction Types** | Inferred from qty patterns | Explicit `transaction_type` field | Phase 1 |
| **FIFO Algorithm** | Basic consumption | Enhanced with edge cases | Phase 3 |
| **Audit Trail** | 70% complete | 100% complete | Phase 3 |

### Using the System Today

**✅ What Works Now**:
- Create lots manually with format `{LOCATION}-{YYMMDD}-{SEQ}`
- Track balances using `in_qty` and `out_qty`
- FIFO consumption works via `ORDER BY lot_no ASC`
- View transaction history from detail tables
- Calculate costs for both FIFO and Periodic Average methods

**⏳ Current Workarounds** (Until Enhancements):
- **No transaction_type field**: Use `in_qty > 0` to identify receipts, `out_qty > 0` for consumption
- **No parent_lot_no field**: Use `from_lot_no` in `tb_inventory_transaction_detail` as temporary reference
- **No separate adjustment table**: All entries in same table, filter by qty patterns
- **Manual lot numbers**: Follow naming guidelines, system doesn't enforce format yet

### Enhancement Benefits Preview

**Why These Enhancements Matter**:

1. **Transaction Type Field** (Phase 1)
   - **Today**: Must infer type from qty patterns → Error-prone queries
   - **Enhanced**: Direct `WHERE transaction_type = 'LOT'` → Clear, fast queries
   - **Business Value**: Automated categorization, no manual interpretation

2. **Parent Lot Linkage** (Phase 1)
   - **Today**: Join through detail table, limited to 2 levels → Slow, complex
   - **Enhanced**: Direct `parent_lot_no` reference → Unlimited traceability
   - **Business Value**: One-click recall analysis, complete audit trail

3. **FIFO Algorithm Enhancement** (Phase 3)
   - **Today**: Basic consumption, some edge cases not handled → Manual intervention
   - **Enhanced**: All edge cases automated → Zero manual fixes
   - **Business Value**: Reliable costing, regulatory compliance

### Example: Tracing Consumption

**Current Method** (v1.0):
```sql
-- Complex multi-table join required
SELECT
  detail.from_lot_no,
  detail.qty,
  detail.cost_per_unit
FROM tb_inventory_transaction_detail detail
WHERE detail.id = :consumption_id
  AND detail.from_lot_no IS NOT NULL  -- May be NULL!
```
⚠️ **Limitations**: `from_lot_no` may not be populated, limited to direct parent

**Enhanced Method** (v2.0 - Phase 1):
```sql
-- Direct parent reference
SELECT
  consumption.lot_no as consumption_lot,
  consumption.parent_lot_no as source_lot,  -- ⭐ NEW FIELD
  consumption.out_qty,
  consumption.transaction_type,  -- ⭐ NEW FIELD
  source.in_qty as original_receipt
FROM tb_inventory_transaction_closing_balance consumption
INNER JOIN tb_inventory_transaction_closing_balance source
  ON consumption.parent_lot_no = source.lot_no
WHERE consumption.transaction_type = 'ADJUSTMENT'  -- ⭐ CLEAR DISTINCTION
```
✅ **Benefits**: Direct linkage, always populated, recursive tracing possible

### Timeline to Enhanced Features

```
Today (v1.0)          Phase 1 (1-2w)        Phase 3 (2-3w)        Complete
    │                      │                     │                    │
    ├─ Manual entry        ├─ transaction_type  ├─ Enhanced FIFO    ├─ 100% audit
    ├─ Inferred types      ├─ parent_lot_no     ├─ Edge cases       ├─ Full trace
    └─ 2-level trace       └─ Direct linkage    └─ Validation       └─ Auto reports

    ✅ Works             ⚠️ Planned           ⚠️ Planned          🎯 Target
```

---

<div style="color: #FFD700;">

## Purpose

This document provides comprehensive specifications for how different inventory transaction types WILL create and manage cost layers in the **planned** lot-based inventory costing system. It serves as the technical reference for **future implementation** of transaction-specific cost layer logic across all inventory modules.

## Overview

The Carmen ERP system uses a **two-tier cost layer system** to track inventory costs with full traceability:

1. **LOT Layers**: Created by receipt transactions (GRN, Transfer In) with unique lot numbers
2. **ADJUSTMENT Layers**: Created by consumption/adjustment transactions, linked to parent lots

This dual-layer approach provides:
- **Complete traceability**: Every cost change is linked to a specific lot
- **Audit compliance**: Full transaction history for regulatory requirements
- **Financial accuracy**: Precise cost tracking for COGS and inventory valuation
- **Operational insights**: Real-time visibility into inventory movement

## Transaction Type Classification

### Transaction Categories

All inventory transactions fall into one of three categories:

| Category | Purpose | Layer Type Created | Examples |
|----------|---------|-------------------|----------|
| **Receipt** | Increase inventory | LOT | GRN, Transfer In |
| **Consumption** | Decrease inventory | ADJUSTMENT | Issues, Returns, Write-Offs |
| **Adjustment** | Correct inventory | ADJUSTMENT or LOT | Inventory Adjustments |

### Transaction Type Matrix

Complete matrix of all 8 transaction types and their cost layer behaviors:

| Transaction Type | Category | Layer Type | parent_lot_no | Creates New Lot? | Consumes From Parent? | Module | Use Case |
|-----------------|----------|------------|---------------|------------------|----------------------|---------|----------|
| **RECEIVE** | Receipt | LOT | NULL | ✅ Yes | ❌ No | Procurement | Goods receipt from supplier |
| **TRANSFER_IN** | Receipt | LOT | NULL | ✅ Yes (new lot) | ❌ No | Inventory | Receive from another location |
| **OPEN** | Balance | LOT | NULL | ✅ Yes | ❌ No | Period Mgmt | Opening balance for new period |
| **CLOSE** | Balance | LOT | NULL | ✅ Yes | ❌ No | Period Mgmt | Closing balance revaluation |
| **ISSUE** | Consumption | ADJUSTMENT | NOT NULL | ❌ No | ✅ Yes | Store Ops | Issue to production/sales |
| **ADJ_IN** | Adjustment Up | ADJUSTMENT | NOT NULL | ❌ No | ✅ Yes* | Inventory | Increase (cannot exceed parent) |
| **ADJ_OUT** | Adjustment Down | ADJUSTMENT | NOT NULL | ❌ No | ✅ Yes | Inventory | Decrease/write-off |
| **TRANSFER_OUT** | Transfer | ADJUSTMENT | NOT NULL | ❌ No | ✅ Yes | Inventory | Send to another location |
| **CN** | Credit Note | ADJUSTMENT | NOT NULL | ❌ No | ✅ Yes (QTY_RETURN) | Procurement | Vendor credit - return or discount |

**Layer Logic**:
- **LOT Layer** (parent_lot_no IS NULL): Creates new independent lot with own balance
- **ADJUSTMENT Layer** (parent_lot_no IS NOT NULL): References and consumes from parent lot

**Important Notes**:
- Only POSTED transactions create or update cost layers (DRAFT transactions don't affect inventory)
- *ADJ_IN cannot increase quantity beyond parent lot's original receipt
- CLOSE transaction revalues remaining inventory to period average (Periodic Average method only)
- OPEN transaction creates opening balance at period average cost (next period)

## LOT Layer Specifications

### LOT Layer Definition

A LOT layer represents a distinct batch of inventory received at a specific location, with a unique identifier and cost basis.

### LOT Layer Properties

| Property | Data Type | Description | Example |
|----------|-----------|-------------|---------|
| `lot_number` | VARCHAR(50) | Unique lot identifier | `MK-250115-001` |
| `item_id` | VARCHAR(50) | Product identifier | `ITEM-12345` |
| `location_id` | VARCHAR(50) | Storage location | `LOC-KITCHEN` |
| ~~`receipt_date`~~ | ~~DATE~~ | ~~Date lot was created~~ | Date embedded in lot_number |
| `receipt_quantity` | DECIMAL(20,5) | Original quantity received | `100.00000` |
| `remaining_quantity` | DECIMAL(20,5) | Current available quantity | `75.00000` |
| `unit_cost` | DECIMAL(20,5) | Cost per unit | `12.50000` |
| `total_cost` | DECIMAL(20,5) | Total cost (qty × unit cost) | `1250.00000` |
| `transaction_type` | ENUM | Type of transaction | `GRN`, `TRANSFER_IN`, `ADJUSTMENT_INCREASE` |
| `transaction_id` | VARCHAR(50) | Source transaction reference | `GRN-2501-0001` |

### Lot Number Format

**Standard Format**: `{LOCATION}-{YYMMDD}-{SEQ}`

**Components**:
- `LOCATION`: 2-4 character location code (MK, KC, BAR, Kitchen)
- `YYMMDD`: 6-digit date (year-month-day, e.g., 250115 for Jan 15, 2025)
- `SEQ`: 2-digit auto-incrementing sequence per location per day (01-99)

**Examples**:
- `MK-250115-001` - First receipt on Jan 15, 2025 at Main Kitchen
- `MK-250115-002` - Second receipt on same day at Main Kitchen
- `BAR-250115-001` - First receipt on same day at Bar
- `KC-250120-001` - First receipt on Jan 20, 2025 at Kitchen Cold

**FIFO Ordering**:
- Natural string sort provides chronological order
- No separate receipt_date field needed
- Date extracted from lot_no when required: `SUBSTRING(lot_no FROM POSITION('-') + 1 FOR 6)`

**Uniqueness Requirements**:
- Lot numbers MUST be unique across the entire company (all locations)
- Sequence resets daily per location
- Format ensures chronological ordering for FIFO consumption

### Lot Number Generation Algorithm

```typescript
function generateLotNumber(
  locationCode: string,
  receiptDate: Date
): string {
  // Format: {LOCATION}-{YYMMDD}-{SEQ}
  const dateStr = format(receiptDate, 'yyMMdd')  // 6-digit date

  // Get next sequence for this location and date
  const lastLot = await db.query(`
    SELECT lot_number
    FROM tb_inventory_transaction_closing_balance
    WHERE lot_number LIKE '${locationCode}-${dateStr}-%'
    ORDER BY lot_number DESC
    LIMIT 1
  `)

  const nextSeq = lastLot ?
    parseInt(lastLot.lot_number.split('-')[2]) + 1 :
    1

  const seqStr = nextSeq.toString().padStart(2, '0')  // 2-digit sequence

  return `${locationCode}-${dateStr}-${seqStr}`
}

// Example usage:
// generateLotNumber('MK', new Date('2025-01-15')) → 'MK-250115-0001'
// generateLotNumber('BAR', new Date('2025-01-20')) → 'BAR-250120-0001'
```

### LOT Layer Creation Rules

#### Rule 1: GRN Receipt (BR-LOT-001)
**When**: Purchase order goods received and posted
**Action**: Create new LOT layer with unique lot number
**Cost Basis**: Unit cost from purchase order + landed costs (freight, duties, etc.)

**Example**:
```typescript
// GRN: Receive 100 units of ITEM-12345 at $12.50 each
{
  lot_number: "MK-250115-0001",
  item_id: "ITEM-12345",
  location_id: "LOC-KITCHEN",
  receipt_date: "2025-01-15",  // Derived from lot_number (MK-250115-001)
  receipt_quantity: 100.00000,
  remaining_quantity: 100.00000,
  unit_cost: 12.50000,
  total_cost: 1250.00000,
  transaction_type: "GRN",
  transaction_id: "GRN-2501-0001"
}
```

#### Rule 2: Transfer In (BR-LOT-002)
**When**: Inventory transferred from another location and posted
**Action**: Create new LOT layer at destination with new lot number
**Cost Basis**: Weighted average cost from source lot consumption

**Example**:
```typescript
// Transfer 50 units from Kitchen to Bar
// Source: Consumes from MK-250115-001 @ $12.50

// Destination creates new lot:
{
  lot_number: "BAR-250116-0001",
  item_id: "ITEM-12345",
  location_id: "LOC-BAR",
  receipt_date: "2025-01-16",  // Derived from lot_number (BAR-250116-001)
  receipt_quantity: 50.00000,
  remaining_quantity: 50.00000,
  unit_cost: 12.50000,  // Cost from source consumption
  total_cost: 625.00000,
  transaction_type: "TRANSFER_IN",
  transaction_id: "TRANSFER-2501-0001"
}
```

#### Rule 3: Inventory Adjustment (Increase) (BR-LOT-001)
**When**: Inventory quantity increased due to count adjustment
**Action**: Create new LOT layer with adjustment cost
**Cost Basis**: Average cost of existing lots or manual entry

**Example**:
```typescript
// Adjustment: Found 10 additional units during count
{
  lot_number: "MK-250117-003",
  item_id: "ITEM-12345",
  location_id: "LOC-KITCHEN",
  receipt_date: "2025-01-17",  // Derived from lot_number (0003)
  receipt_quantity: 10.00000,
  remaining_quantity: 10.00000,
  unit_cost: 12.50000,  // Average of existing lots or manual entry
  total_cost: 125.00000,
  transaction_type: "ADJUSTMENT_INCREASE",
  transaction_id: "ADJ-2501-0001"
}
```

### LOT Layer Update Rules

#### Consumption Update
When stock-out transactions consume from a lot:
1. **Reduce `remaining_quantity`** by consumed amount
2. **Create ADJUSTMENT layer** linking to this lot
3. **Preserve original `receipt_quantity`** (never changes)
4. **Update timestamp** of last modification

**Example**:
```typescript
// Before: MK-250115-001 has remaining_quantity = 100
// Issue 25 units

// After update:
{
  lot_number: "MK-250115-0001",
  remaining_quantity: 75.00000,  // Reduced by 25
  // All other properties unchanged
}

// ADJUSTMENT layer created (see next section)
```

#### Lot Exhaustion
When `remaining_quantity` reaches zero:
1. Lot remains in database for audit trail
2. Lot excluded from FIFO consumption queries
3. Lot included in period-end snapshots for historical reporting
4. Lot can be viewed in transaction history

## ADJUSTMENT Layer Specifications

### ADJUSTMENT Layer Definition

An ADJUSTMENT layer records the consumption or adjustment of inventory from a specific lot, maintaining complete traceability between transactions and lots.

### ADJUSTMENT Layer Properties

| Property | Data Type | Description | Example |
|----------|-----------|-------------|---------|
| `adjustment_id` | VARCHAR(50) | Unique adjustment identifier | `ADJ-LAYER-2501-0001` |
| `parent_lot_number` | VARCHAR(50) | Lot being consumed/adjusted | `MK-250115-001` |
| `item_id` | VARCHAR(50) | Product identifier | `ITEM-12345` |
| `location_id` | VARCHAR(50) | Storage location | `LOC-KITCHEN` |
| `transaction_date` | DATE | Date of transaction | `2025-01-20` |
| `transaction_type` | ENUM | Type of transaction | `ISSUE`, `RETURN`, `WRITE_OFF` |
| `transaction_id` | VARCHAR(50) | Source transaction reference | `SR-2501-0001` |
| `quantity` | DECIMAL(20,5) | Quantity consumed/adjusted | `25.00000` |
| `unit_cost` | DECIMAL(20,5) | Cost per unit from parent lot | `12.50000` |
| `total_cost` | DECIMAL(20,5) | Total cost (qty × unit cost) | `312.50000` |
| `reason_code` | VARCHAR(20) | Reason for transaction | `PRODUCTION`, `WASTAGE`, etc. |
| `notes` | TEXT | Additional information | `Used in Recipe XYZ` |

### ADJUSTMENT Layer Creation Rules

#### Rule 1: Store Requisition (Issue) (BR-LOT-005, BR-LOT-012)
**When**: Inventory issued for production or department use
**Action**:
1. Query available lots using FIFO order
2. Consume from oldest lot(s) first
3. Create ADJUSTMENT layer for each lot consumed
4. Update parent lot `remaining_quantity`

**Example - Single Lot Consumption**:
```typescript
// Issue 25 units for production
// Available: MK-250115-001 (100 units @ $12.50)

// ADJUSTMENT layer created:
{
  adjustment_id: "ADJ-LAYER-2501-0001",
  parent_lot_number: "MK-250115-0001",
  item_id: "ITEM-12345",
  location_id: "LOC-KITCHEN",
  transaction_date: "2025-01-20",
  transaction_type: "ISSUE",
  transaction_id: "SR-2501-0001",
  quantity: 25.00000,
  unit_cost: 12.50000,
  total_cost: 312.50000,
  reason_code: "PRODUCTION",
  notes: "Recipe: Chicken Curry - Batch 001"
}

// Parent lot updated:
// MK-250115-001: remaining_quantity = 75.00000
```

**Example - Multi-Lot Consumption**:
```typescript
// Issue 120 units for production
// Available:
// - MK-250115-001 (100 units @ $12.50)
// - MK-250116-002 (50 units @ $13.00)

// First ADJUSTMENT layer (consume all from oldest):
{
  adjustment_id: "ADJ-LAYER-2501-0002",
  parent_lot_number: "MK-250115-0001",
  quantity: 100.00000,
  unit_cost: 12.50000,
  total_cost: 1250.00000,
  // ... other properties
}

// Second ADJUSTMENT layer (partial from next oldest):
{
  adjustment_id: "ADJ-LAYER-2501-0003",
  parent_lot_number: "MK-250116-0002",
  quantity: 20.00000,
  unit_cost: 13.00000,
  total_cost: 260.00000,
  // ... other properties
}

// Total issue cost: $1,250.00 + $260.00 = $1,510.00
// Weighted average: $1,510.00 ÷ 120 = $12.58 per unit

// Parent lots updated:
// - MK-250115-001: remaining_quantity = 0.00000
// - MK-250116-002: remaining_quantity = 30.00000
```

#### Rule 2: Credit Note (CN) - Comprehensive Handling (BR-LOT-005, BR-LOT-012, BR-CN-001 through BR-CN-008)
**Transaction Type**: `CN` (Credit Note)

**When**: Credit note is committed (DRAFT → COMMITTED)

**Action**: Process based on CN operation type:
1. **QUANTITY_RETURN**: Physical return of goods (creates ADJUSTMENT layer with `out_qty`)
2. **AMOUNT_DISCOUNT**: Cost adjustment without physical return (zero-quantity cost adjustment)

**Both operations**:
- Trigger immediately on CN commit
- Process based on configured cost method (FIFO or Periodic AVG)
- Use transaction_type `CN` (distinct from generic ADJ_OUT)

---

##### CN QUANTITY_RETURN: Same-Lot Return

**Scenario**: Return to the specific lot from original GRN receipt

**Example**:
```typescript
// Original GRN: MK-250115-001 (100 units @ $12.50)
// CN: Return 30 units from same lot

// ADJUSTMENT layer created:
{
  adjustment_id: "ADJ-LAYER-2501-0004",
  parent_lot_number: "MK-250115-001",  // Same lot as GRN
  item_id: "ITEM-12345",
  location_id: "LOC-KITCHEN",
  transaction_date: "2025-01-20",
  transaction_type: "CN",  // ⭐ Specific CN transaction type
  transaction_id: "CN-2501-0001",
  quantity: 30.00000,
  unit_cost: 12.50000,  // ⭐ Uses original lot cost
  total_cost: 375.00000,
  reason_code: "QUALITY_ISSUE",
  notes: "Damaged goods - returning to vendor"
}

// Parent lot updated:
// MK-250115-001: remaining_quantity = 70.00000 (100-30)
```

**Key Points**:
- Uses original lot's cost (maintains cost consistency)
- Lot NOT depleted (remaining = 70 units)
- Full audit trail preserved

---

##### CN QUANTITY_RETURN: Different-Lot Return (FIFO)

**Scenario**: Return when original lot partially/fully consumed - uses FIFO consumption

**Example**:
```typescript
// Lot State:
// MK-250115-001: 20 units remaining (100-80 consumed)
// MK-250120-001: 150 units remaining
//
// CN: Return 30 units (but original lot only has 20 left)

// First ADJUSTMENT layer (consume all from original lot):
{
  adjustment_id: "ADJ-LAYER-2501-0005",
  parent_lot_number: "MK-250115-001",  // Original lot
  transaction_type: "CN",
  transaction_id: "CN-2501-0002",
  quantity: 20.00000,  // All remaining from original lot
  unit_cost: 12.50000,
  total_cost: 250.00000,
  reason_code: "OVER_DELIVERED",
  notes: "Return excess - Part 1"
}

// Second ADJUSTMENT layer (consume from next FIFO lot):
{
  adjustment_id: "ADJ-LAYER-2501-0006",
  parent_lot_number: "MK-250120-001",  // Next oldest lot
  transaction_type: "CN",
  transaction_id: "CN-2501-0002",
  quantity: 10.00000,  // Remaining needed (30-20)
  unit_cost: 13.00000,  // Different cost from second lot
  total_cost: 130.00000,
  reason_code: "OVER_DELIVERED",
  notes: "Return excess - Part 2"
}

// Total CN-2501-0002 cost: $250 + $130 = $380

// Parent lots updated:
// MK-250115-001: remaining_quantity = 0.00000 ⭐ LOT DEPLETED
// MK-250120-001: remaining_quantity = 140.00000 (150-10)
```

**Lot Depletion**:
- MK-250115-001: `SUM(in_qty) - SUM(out_qty) = 100 - (80+20) = 0` ✅ DEPLETED
- No explicit flag needed, calculated from transaction history

---

##### CN AMOUNT_DISCOUNT: Cost Adjustment (Zero-Quantity)

**Scenario**: Adjust inventory cost without physical return (e.g., volume discount, price negotiation)

**Key Characteristics**:
- `quantity = 0` (no physical movement)
- `unit_cost = 0` (not applicable for zero-quantity)
- `total_cost < 0` (negative = discount/cost reduction)
- Links to affected lot via `parent_lot_number`

**Example - Single Lot Discount**:
```typescript
// Original GRN: MK-250125-001 (200 units @ $15.00 = $3,000)
// CN: $300 volume discount negotiated

// ADJUSTMENT layer created:
{
  adjustment_id: "ADJ-LAYER-2501-0007",
  parent_lot_number: "MK-250125-001",
  item_id: "ITEM-12345",
  location_id: "LOC-KITCHEN",
  transaction_date: "2025-01-28",
  transaction_type: "CN",
  transaction_id: "CN-2501-0003",
  quantity: 0.00000,  // ⭐ Zero quantity (no physical movement)
  unit_cost: 0.00000,  // ⭐ Not applicable for zero-quantity
  total_cost: -300.00000,  // ⭐ Negative = discount
  reason_code: "VOLUME_DISCOUNT",
  notes: "Volume discount negotiated post-delivery"
}

// Parent lot state (no quantity change):
// MK-250125-001: remaining_quantity = 200.00000 (unchanged)

// Effective cost calculation:
// Original total cost: $3,000
// Discount applied: -$300
// New total cost: $2,700
// New effective unit cost: $2,700 ÷ 200 = $13.50/unit (reduced from $15.00)
```

**Formula**:
```
Effective Unit Cost = (SUM(quantity × unit_cost) + SUM(cost_adjustments)) / SUM(quantity)
                    = (200 × $15.00 + (-$300)) / 200
                    = ($3,000 - $300) / 200
                    = $13.50 per unit
```

**Example - Multi-Lot Discount Allocation**:
```typescript
// Scenario: 300 units received, 100 consumed, $450 discount
// Remaining: 200 units @ $4,000

// ADJUSTMENT layer created:
{
  adjustment_id: "ADJ-LAYER-2501-0008",
  parent_lot_number: "MK-250130-001",
  transaction_type: "CN",
  transaction_id: "CN-2501-0004",
  quantity: 0.00000,
  unit_cost: 0.00000,
  total_cost: -450.00000,  // Discount on remaining inventory only
  reason_code: "AMOUNT_DISCOUNT",
  notes: "Applies to remaining 200 units only"
}

// Effective cost calculation:
// Remaining value: 200 × $20.00 = $4,000
// Discount: -$450
// New effective cost: ($4,000 - $450) / 200 = $17.75/unit
```

**Important**: Discount allocates to **remaining inventory only** (not consumed items)

---

##### CN Transaction Business Rules

**BR-CN-001: Transaction Type**
- All CN inventory transactions MUST use transaction_type `CN`
- Distinct from generic ADJ_OUT for audit trail

**BR-CN-002: Cost Method Processing**
- FIFO: Uses lot-specific costs with FIFO consumption order
- Periodic AVG: Uses period average cost for QUANTITY_RETURN
- Periodic AVG: Adjusts period average calculation for AMOUNT_DISCOUNT

**BR-CN-003: QUANTITY_RETURN Same-Lot**
- Uses original lot's `unit_cost` from GRN
- Creates ADJUSTMENT layer with `parent_lot_number=original_lot`
- Maintains cost consistency

**BR-CN-004: QUANTITY_RETURN Different-Lot (FIFO)**
- When original lot insufficient, consume from next available lots
- Query: `ORDER BY lot_number ASC` (FIFO order)
- Create separate ADJUSTMENT layers for each lot consumed
- Calculate lot depletion: `SUM(in_qty) - SUM(out_qty) = 0`

**BR-CN-005: AMOUNT_DISCOUNT Processing**
- Create ADJUSTMENT layer with `quantity=0`, `total_cost<0`
- Set `unit_cost=0` (not applicable)
- Link via `parent_lot_number`
- Allocate to remaining inventory only

**BR-CN-006: Effective Cost Calculation**
- Formula: `(SUM(qty × cost) + SUM(cost_adjustments)) / SUM(qty)`
- Apply per lot in FIFO
- Apply per period in Periodic AVG
- Recalculate on-the-fly during valuation queries

**BR-CN-007: Timing**
- Trigger immediately on CN commit (DRAFT → COMMITTED)
- Cost adjustments apply at moment of commitment

**BR-CN-008: Lot Depletion**
- No explicit "depleted" flag in database
- Calculate: `SUM(in_qty) - SUM(out_qty) = 0`
- Depleted lots excluded from available inventory queries
- Audit trail preserved (entries remain)

#### Rule 3: Inventory Adjustment (Decrease) (BR-LOT-005, BR-LOT-012)
**When**: Inventory quantity decreased due to count adjustment
**Action**: Consume from oldest lot(s) using FIFO

**Example**:
```typescript
// Adjustment: Found 15 units missing during count

{
  adjustment_id: "ADJ-LAYER-2501-0005",
  parent_lot_number: "MK-250115-0001",
  transaction_type: "ADJ_OUT",
  transaction_id: "ADJ-2501-0002",
  quantity: 15.00000,
  unit_cost: 12.50000,
  total_cost: 187.50000,
  reason_code: "COUNT_VARIANCE",
  notes: "Physical count variance - Period 2025-01"
}
```

#### Rule 4: Write-Off/Scrap (BR-LOT-005, BR-LOT-012)
**When**: Inventory written off due to damage, expiry, or obsolescence
**Action**: Consume from oldest lot(s) using FIFO

**Example**:
```typescript
// Write-off 20 units due to expiry

{
  adjustment_id: "ADJ-LAYER-2501-0006",
  parent_lot_number: "MK-250115-0001",
  transaction_type: "ADJ_OUT",
  transaction_id: "WO-2501-0001",
  quantity: 20.00000,
  unit_cost: 12.50000,
  total_cost: 250.00000,
  reason_code: "EXPIRED",
  notes: "Expired on 2025-01-25"
}
```

### ADJUSTMENT Layer Linkage Rules (BR-LOT-006, BR-LOT-007)

#### Multiple Adjustments to Same Lot
A single lot can have multiple ADJUSTMENT layers from different transactions:

```typescript
// MK-250115-001 (Original: 100 units @ $12.50)

// Adjustment 1: Issue 25 units on 2025-01-20
{
  adjustment_id: "ADJ-LAYER-2501-0001",
  parent_lot_number: "MK-250115-0001",
  quantity: 25.00000,
  transaction_type: "ISSUE",
  // ... remaining_quantity = 75
}

// Adjustment 2: Return 10 units on 2025-01-22
{
  adjustment_id: "ADJ-LAYER-2501-0007",
  parent_lot_number: "MK-250115-0001",
  quantity: 10.00000,
  transaction_type: "ADJ_OUT",
  // ... remaining_quantity = 65
}

// Adjustment 3: Write-off 5 units on 2025-01-25
{
  adjustment_id: "ADJ-LAYER-2501-0008",
  parent_lot_number: "MK-250115-0001",
  quantity: 5.00000,
  transaction_type: "ADJ_OUT",
  // ... remaining_quantity = 60
}

// Final state: MK-250115-001 has remaining_quantity = 60.00000
// Three ADJUSTMENT layers linked to this lot
```

## FIFO Consumption Algorithm

### Algorithm Overview

The FIFO (First-In-First-Out) consumption algorithm ensures that inventory is consumed from the oldest lots first, maintaining consistent cost flow.

### Query Logic (BR-LOT-010, BR-LOT-011)

```sql
-- Get available lots for consumption (FIFO order)
SELECT
  lot_number,  -- Format: {LOCATION}-{YYMMDD}-{SEQ} (e.g., MK-250115-001)
  remaining_quantity,
  unit_cost,
  -- Date can be extracted if needed:
  SUBSTRING(lot_number FROM POSITION('-' IN lot_number) + 1 FOR 6) as embedded_date
FROM tb_inventory_transaction_closing_balance
WHERE
  item_id = :item_id
  AND location_id = :location_id
  AND remaining_quantity > 0
ORDER BY
  lot_number ASC  -- Natural chronological sort (FIFO)
```

**Key Points**:
- Only lots with `remaining_quantity > 0` are eligible (BR-LOT-011)
- Sort by `lot_number ASC`: Natural string sort provides chronological order (FIFO)
- No separate receipt_date field needed (date embedded in lot_number)
- Lot format `{LOCATION}-{YYMMDD}-{SEQ}` ensures correct chronological ordering
- This ensures consistent, predictable FIFO consumption order

### Consumption Process

**Step-by-Step Process**:

1. **Query Available Lots**: Execute FIFO query to get ordered list of available lots
2. **Calculate Required Quantity**: Determine total quantity needed for transaction
3. **Iterate Through Lots**: Process lots in order until requirement met
4. **Create Adjustment Layers**: Create one ADJUSTMENT layer per lot consumed
5. **Update Remaining Quantities**: Update `remaining_quantity` for each affected lot
6. **Calculate Total Cost**: Sum costs from all consumed lots

### Implementation Example

```typescript
async function consumeInventoryFIFO(
  itemId: string,
  locationId: string,
  quantityNeeded: number,
  transactionId: string,
  transactionType: string
): Promise<ConsumptionResult> {

  // Step 1: Get available lots in FIFO order
  const availableLots = await db.query(`
    SELECT lot_number, remaining_quantity, unit_cost
    FROM tb_inventory_transaction_closing_balance
    WHERE item_id = $1
      AND location_id = $2
      AND remaining_quantity > 0
    ORDER BY lot_number ASC  -- Natural chronological sort (FIFO)
  `, [itemId, locationId])

  // Check sufficient quantity
  const totalAvailable = sum(availableLots.map(lot => lot.remaining_quantity))
  if (totalAvailable < quantityNeeded) {
    throw new InsufficientInventoryError()
  }

  // Step 2 & 3: Consume from lots
  let remainingToConsume = quantityNeeded
  const adjustmentLayers: AdjustmentLayer[] = []
  let totalCost = 0

  for (const lot of availableLots) {
    if (remainingToConsume <= 0) break

    // Determine quantity to consume from this lot
    const consumeFromLot = Math.min(lot.remaining_quantity, remainingToConsume)
    const costFromLot = consumeFromLot * lot.unit_cost

    // Step 4: Create ADJUSTMENT layer
    const adjustmentLayer = {
      adjustment_id: generateAdjustmentId(),
      parent_lot_number: lot.lot_number,
      quantity: consumeFromLot,
      unit_cost: lot.unit_cost,
      total_cost: costFromLot,
      transaction_id: transactionId,
      transaction_type: transactionType,
      // ... other properties
    }
    adjustmentLayers.push(adjustmentLayer)
    await db.insert('tb_adjustment_layers', adjustmentLayer)

    // Step 5: Update lot remaining quantity
    const newRemainingQty = lot.remaining_quantity - consumeFromLot
    await db.update('tb_inventory_transaction_closing_balance', {
      remaining_quantity: newRemainingQty
    }, {
      lot_number: lot.lot_number
    })

    // Accumulate cost and reduce remaining needed
    totalCost += costFromLot
    remainingToConsume -= consumeFromLot
  }

  // Step 6: Return results
  return {
    adjustmentLayers,
    totalCost,
    weightedAverageCost: totalCost / quantityNeeded
  }
}
```

## Transfer Transaction Special Handling

### Transfer Overview

A transfer transaction has **two sides** with distinct cost layer behaviors:

1. **Transfer Out (Source)**: Consumes lots using FIFO, creates ADJUSTMENT layers
2. **Transfer In (Destination)**: Creates new LOT layer with new lot number

### Transfer Out Processing (BR-TRANSFER-001, BR-TRANSFER-002)

**Steps**:
1. Query source location lots using FIFO order
2. Consume required quantity from oldest lot(s)
3. Create ADJUSTMENT layer(s) for consumed lots
4. Update parent lot `remaining_quantity`
5. Calculate weighted average cost for transfer

**Example**:
```typescript
// Transfer 50 units from Kitchen to Bar
// Source location (Kitchen):

// Available lots:
// - MK-250115-001: 75 units @ $12.50
// - MK-250116-002: 30 units @ $13.00

// Consume 50 units from MK-250115-001

{
  adjustment_id: "ADJ-LAYER-2501-0009",
  parent_lot_number: "MK-250115-0001",
  transaction_type: "TRANSFER_OUT",
  transaction_id: "TRANSFER-2501-0001",
  quantity: 50.00000,
  unit_cost: 12.50000,
  total_cost: 625.00000,
  reason_code: "TRANSFER",
  notes: "Transfer to Bar"
}

// MK-250115-001: remaining_quantity = 25.00000
```

### Transfer In Processing (BR-TRANSFER-003, BR-TRANSFER-004, BR-TRANSFER-005)

**Steps**:
1. Generate new lot number for destination location
2. Create new LOT layer at destination
3. Use cost from source consumption as unit cost
4. Set `receipt_quantity` and `remaining_quantity` to transfer quantity

**Example**:
```typescript
// Transfer 50 units from Kitchen to Bar (continued)
// Destination location (Bar):

{
  lot_number: "BAR-250120-0001",  // NEW lot number
  item_id: "ITEM-12345",
  location_id: "LOC-BAR",  // Destination
  receipt_date: "2025-01-20",  // Derived from lot_number (BAR-250120-001)
  receipt_quantity: 50.00000,
  remaining_quantity: 50.00000,
  unit_cost: 12.50000,  // Cost from source consumption
  total_cost: 625.00000,
  transaction_type: "TRANSFER_IN",
  transaction_id: "TRANSFER-2501-0001"
}
```

### Transfer Traceability (BR-TRANSFER-006)

Both sides of transfer reference same `transaction_id` for complete traceability:

```typescript
// Query transfer details
const transferOut = await db.query(`
  SELECT * FROM tb_adjustment_layers
  WHERE transaction_id = 'TRANSFER-2501-0001'
    AND transaction_type = 'TRANSFER_OUT'
`)

const transferIn = await db.query(`
  SELECT * FROM tb_inventory_transaction_closing_balance
  WHERE transaction_id = 'TRANSFER-2501-0001'
    AND transaction_type = 'TRANSFER_IN'
`)

// Results show:
// - Which source lot(s) were consumed (ADJUSTMENT layers)
// - Which destination lot was created (LOT layer)
// - Exact quantities and costs
// - Complete audit trail
```

## Transaction Status and Layer Creation

### Document Status Flow

All transactions follow this status flow:
1. **DRAFT**: Transaction being created/edited (no cost impact)
2. **POSTED**: Transaction finalized (creates/updates cost layers)
3. **CANCELLED**: Transaction voided (reverses cost layers if previously posted)

### Cost Layer Timing Rules

| Status | Cost Layer Action | Inventory Impact | Financial Impact |
|--------|------------------|------------------|------------------|
| **DRAFT** | None | None | None |
| **POSTED** | Create/Update layers | Update quantities | Update COGS/inventory value |
| **CANCELLED** | Reverse layers | Reverse quantities | Reverse financial entries |

**Important**: Only POSTED transactions affect cost layers and inventory. This allows users to prepare transactions without impacting inventory until ready.

### Posting Validation

Before allowing transition from DRAFT to POSTED:
1. Validate all required fields are complete
2. Check sufficient inventory available (for stock-out transactions)
3. Verify lot numbers valid (for lot-specific transactions)
4. Validate cost calculations
5. Check period is open (not closed or locked)

## Complete Transaction Example

### Scenario: Issue 120 units for production

**Initial State**:
```
Available lots at Kitchen:
- MK-250115-001: 100 units @ $12.50 ($1,250.00)
- MK-250116-002: 50 units @ $13.00 ($650.00)
Total: 150 units, $1,900.00
```

**Transaction**: Store Requisition SR-2501-0001
- Item: ITEM-12345 (Chicken Breast)
- Location: Kitchen
- Quantity: 120 units
- Purpose: Production - Recipe Chicken Curry Batch 001
- Status: POSTED

**FIFO Consumption Process**:

**Step 1**: Query available lots
```sql
SELECT lot_number, remaining_quantity, unit_cost
FROM tb_inventory_transaction_closing_balance
WHERE item_id = 'ITEM-12345'
  AND location_id = 'LOC-KITCHEN'
  AND remaining_quantity > 0
ORDER BY lot_number ASC  -- Natural chronological sort (FIFO)

-- Results:
-- 1. MK-250115-001: 100 units @ $12.50
-- 2. MK-250116-001: 50 units @ $13.00
```

**Step 2**: Consume from first lot (MK-250115-001)
- Available: 100 units
- Needed: 120 units
- Consume: 100 units (all available)
- Cost: 100 × $12.50 = $1,250.00

Create ADJUSTMENT layer:
```typescript
{
  adjustment_id: "ADJ-LAYER-2501-0010",
  parent_lot_number: "MK-250115-0001",
  item_id: "ITEM-12345",
  location_id: "LOC-KITCHEN",
  transaction_date: "2025-01-20",
  transaction_type: "ISSUE",
  transaction_id: "SR-2501-0001",
  quantity: 100.00000,
  unit_cost: 12.50000,
  total_cost: 1250.00000,
  reason_code: "PRODUCTION",
  notes: "Recipe: Chicken Curry - Batch 001 (Part 1 of 2)"
}
```

Update lot:
```sql
UPDATE tb_inventory_transaction_closing_balance
SET remaining_quantity = 0.00000
WHERE lot_number = 'MK-250115-0001'
```

**Step 3**: Consume from second lot (MK-250116-002)
- Available: 50 units
- Still needed: 20 units
- Consume: 20 units
- Cost: 20 × $13.00 = $260.00

Create ADJUSTMENT layer:
```typescript
{
  adjustment_id: "ADJ-LAYER-2501-0011",
  parent_lot_number: "MK-250116-0002",
  item_id: "ITEM-12345",
  location_id: "LOC-KITCHEN",
  transaction_date: "2025-01-20",
  transaction_type: "ISSUE",
  transaction_id: "SR-2501-0001",
  quantity: 20.00000,
  unit_cost: 13.00000,
  total_cost: 260.00000,
  reason_code: "PRODUCTION",
  notes: "Recipe: Chicken Curry - Batch 001 (Part 2 of 2)"
}
```

Update lot:
```sql
UPDATE tb_inventory_transaction_closing_balance
SET remaining_quantity = 30.00000
WHERE lot_number = 'MK-250116-0002'
```

**Final State**:
```
Remaining lots at Kitchen:
- MK-250115-001: 0 units @ $12.50 ($0.00) - EXHAUSTED
- MK-250116-002: 30 units @ $13.00 ($390.00)
Total: 30 units, $390.00

Transaction Cost Summary:
- Total quantity issued: 120 units
- Total cost: $1,510.00 ($1,250.00 + $260.00)
- Weighted average: $12.58 per unit
- COGS impact: $1,510.00
- Inventory reduction: $1,510.00
```

## Integration Points

### Module Integration Matrix

| Module | Transaction Types | Integration Method | Cost Layer API Endpoint |
|--------|------------------|-------------------|-------------------------|
| **Procurement** | GRN, Credit Notes | POST /api/procurement/grn/post | `/lot-layers/create` |
| **Inventory** | Transfers, Adjustments, Write-Offs | POST /api/inventory/transaction/post | `/lot-layers/consume` |
| **Store Operations** | Store Requisitions (Issues) | POST /api/store/requisition/post | `/lot-layers/consume` |
| **Production** | Material consumption | POST /api/production/consume | `/lot-layers/consume` |
| **Finance** | Period-end valuation | GET /api/finance/inventory-valuation | `/lot-layers/snapshot` |

### API Integration Examples

See [API Reference](./API-lot-based-costing.md) for detailed endpoint specifications and request/response formats.

## Performance Considerations

### Query Optimization

**Index Strategy**:
```sql
-- Primary indexes for FIFO queries
CREATE INDEX idx_fifo_query ON tb_inventory_transaction_closing_balance
(item_id, location_id, remaining_quantity, lot_number);  -- No receipt_date (embedded in lot_number)

-- Index for adjustment layer lookups
CREATE INDEX idx_adjustment_parent ON tb_adjustment_layers
(parent_lot_number, transaction_date);

-- Index for transaction tracing
CREATE INDEX idx_transaction_id ON tb_adjustment_layers
(transaction_id, transaction_type);
```

### Batch Processing

For transactions affecting multiple items:
1. Process items in batches of 50-100
2. Use database transactions to ensure consistency
3. Commit after each batch for progress tracking
4. Implement rollback logic for failures

### Caching Strategy

- Cache lot availability by item-location (5-minute TTL)
- Invalidate cache on any POSTED transaction
- Pre-warm cache for frequently accessed items

## Error Handling

### Common Errors

| Error Code | Description | Resolution |
|-----------|-------------|------------|
| `INSUFFICIENT_INVENTORY` | Not enough inventory to fulfill transaction | Reduce quantity or adjust transaction |
| `LOT_NOT_FOUND` | Referenced lot number doesn't exist | Verify lot number or use FIFO consumption |
| `INVALID_LOT_NUMBER` | Lot number format invalid | Regenerate using correct format |
| `PERIOD_CLOSED` | Cannot post to closed period | Re-open period or post to current period |
| `DUPLICATE_LOT_NUMBER` | Lot number already exists | Generate new sequence number |
| `NEGATIVE_REMAINING_QTY` | Attempted to consume more than available | Check lot availability before consumption |

### Error Recovery

For critical errors during posting:
1. **Rollback transaction**: Revert all database changes
2. **Log error details**: Capture full context for troubleshooting
3. **Notify user**: Provide clear error message with resolution steps
4. **Preserve draft**: Keep transaction in DRAFT status for correction

## Testing Scenarios

### Unit Test Cases

1. **LOT Layer Creation**
   - GRN creates lot with correct number format
   - Transfer In creates lot at destination with new number
   - Adjustment increase creates lot with average cost

2. **FIFO Consumption**
   - Single lot consumption
   - Multi-lot consumption
   - Partial lot consumption
   - Insufficient inventory error

3. **ADJUSTMENT Layer Creation**
   - Issue creates adjustment linked to correct parent
   - Multiple adjustments to same parent lot
   - Cost correctly inherited from parent

4. **Transfer Processing**
   - Transfer Out consumes from source using FIFO
   - Transfer In creates new lot at destination
   - Costs correctly transferred
   - Both sides traceable via transaction ID

### Integration Test Cases

1. **End-to-End Transaction Flow**
   - GRN receipt → Issue → Transfer → Return
   - Verify cost layers at each step
   - Verify quantities correct at each step

2. **Multi-Location Scenarios**
   - Transfer between multiple locations
   - Verify lot independence between locations
   - Verify lot number uniqueness

3. **Period Boundary Testing**
   - Post transactions at period end
   - Verify snapshot captures correct state
   - Verify opening balance = prior closing balance

## Best Practices

### Development Guidelines

1. **Always use FIFO query** for stock-out transactions (never manual lot selection)
2. **Create adjustment layers** for all lot consumptions (maintain full audit trail)
3. **Use database transactions** for multi-step operations (ensure data consistency)
4. **Validate lot availability** before posting (prevent negative inventory)
5. **Generate unique lot numbers** using standard algorithm (prevent duplicates)
6. **Link adjustments to parents** via parent_lot_number (enable traceability)
7. **Check period status** before posting (respect period close rules)

### Code Review Checklist

- [ ] FIFO query includes `remaining_quantity > 0` filter
- [ ] FIFO query sorts by `lot_number ASC` (natural chronological sort)
- [ ] Adjustment layers created for each lot consumed
- [ ] Parent lot `remaining_quantity` updated correctly
- [ ] New lots use correct lot number format
- [ ] Transaction ID properly recorded
- [ ] Error handling includes rollback logic
- [ ] Unit tests cover edge cases
- [ ] Integration tests verify end-to-end flow

---

**Version**: 1.0.0
**Last Updated**: 2025-11-03
**Status**: Active
**Maintained By**: Architecture Team
**Review Cycle**: Quarterly

---

## Document Revision Notes

**Version 1.0.0** (2025-11-03):
- Initial creation of transaction types and cost layers specification
- Comprehensive coverage of LOT and ADJUSTMENT layer types
- Detailed FIFO consumption algorithm documentation
- Complete transaction examples with multi-lot scenarios
- Integration guidelines for all modules
- Performance optimization recommendations
- Testing scenarios and best practices

</div>
