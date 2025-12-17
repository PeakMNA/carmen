# PROCESS: Periodic Average Costing Process Logic

**Document Type**: Process Documentation
**Module**: Inventory Management
**Feature**: Periodic Average Costing Method
**Version**: 1.0
**Last Updated**: 2025-01-07

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-07 | Initial document creation with complete process logic |

---

## Document Purpose

This document provides complete step-by-step process logic for Periodic Average inventory costing in the Carmen ERP system. It covers:

- Receipt transaction processing
- Consumption transaction processing
- Period-end average cost calculation
- Cost application to transactions
- Cache management strategies
- Database record structures
- Inventory balance impacts

**Related Documents**:
- [SM: Periodic Average Deep Dive](../../shared-methods/inventory-valuation/SM-periodic-average.md)
- [SM: Costing Methods](../../shared-methods/inventory-valuation/SM-costing-methods.md)
- [BR: Inventory Valuation](../../shared-methods/inventory-valuation/BR-inventory-valuation.md)

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Receipt Scenarios](#receipt-scenarios)
3. [Consumption Scenarios](#consumption-scenarios)
4. [Period-End Processing](#period-end-processing)
5. [Key Patterns & Formulas](#key-patterns--formulas)
6. [Quick Reference](#quick-reference)

---

## Core Concepts

### What is Periodic Average?

**Principle**: Calculate a **single average unit cost per period** (calendar month) and apply it uniformly to all transactions within that period.

**Key Difference from FIFO**:
- **FIFO**: Tracks individual lots with specific costs, consumes oldest first
- **Periodic Average**: No lot tracking, all transactions use same average cost

### Period Definition

```typescript
// Period = Calendar Month (fixed)
interface Period {
  start: Date  // 1st day of month at 00:00:00
  end: Date    // Last day of month at 23:59:59
}

// Example: January 2025
{
  start: new Date("2025-01-01T00:00:00"),
  end: new Date("2025-01-31T23:59:59")
}
```

### Average Cost Calculation

```
Period Average Cost = (Σ Total Cost of All Receipts) ÷ (Σ Quantity of All Receipts)

Example:
  Receipt 1: 100 kg @ $10.00 = $1,000.00
  Receipt 2: 150 kg @ $12.50 = $1,875.00
  Receipt 3:  80 kg @ $11.00 = $880.00

  Total: 330 kg, $3,755.00
  Average: $3,755.00 ÷ 330 = $11.3788/kg

  All transactions in this period use $11.3788/kg
```

### Database Structure

**No Lot Tracking**: Unlike FIFO, Periodic Average does not use `lot_no` or `parent_lot_no` fields.

**Table**: `tb_inventory_transaction_cost_layer` (same table, different pattern)

**Pattern Recognition**:
| Field | Value | Meaning |
|-------|-------|---------|
| `lot_no` | NULL | No lot tracking |
| `parent_lot_no` | NULL | No parent-child relationship |
| `in_qty` | > 0 for receipts, 0 for consumption | Receipt or consumption |
| `out_qty` | 0 for receipts, > 0 for consumption | Receipt or consumption |
| `cost_per_unit` | Period average cost | Same for all transactions in period |

### Cost Application Timeline

```
Month: January 2025

┌─────────────────────────────────────────────────────────────────┐
│  Jan 5: GRN-001 (100 kg @ $10.00)                               │
│  Jan 8: Issue (60 kg) ← Uses Jan average: $11.3788              │
│  Jan 12: GRN-002 (150 kg @ $12.50)                              │
│  Jan 18: GRN-003 (80 kg @ $11.00)                               │
│  Jan 20: Adjustment (-25 kg) ← Uses Jan average: $11.3788       │
│  Jan 29: Credit Note (40 kg) ← Uses Jan average: $11.3788       │
└─────────────────────────────────────────────────────────────────┘

Key Insight: ALL transactions use SAME cost ($11.3788)
regardless of when they occurred in the month
```

---

## Business Rules for Credit Notes

Credit Notes have special business rules that affect both inventory and financial processing. These rules are critical for understanding how CNs interact with the periodic average costing system.

### CN Transaction Types

| Credit Type | Physical Return | Inventory Impact | Period Average | GL Accounts |
|-------------|----------------|------------------|----------------|-------------|
| **QUANTITY_RETURN** | ✅ Yes | ✅ Reduces inventory | Uses period average | DR A/P, CR Inventory, CR Input VAT |
| **AMOUNT_DISCOUNT** | ❌ No | ❌ No impact | N/A (no costing) | DR A/P, CR Purchase Discount, CR Input VAT |

### Key Business Rules

**BR-CN-040**: Stock movements generated only for QUANTITY_RETURN type credits
- AMOUNT_DISCOUNT credits do NOT create cost layer records
- No inventory transaction records for amount-only discounts

**BR-CN-008**: Credit amount cannot exceed original GRN amount
- Cumulative credits across all CNs for same GRN must ≤ original amount
- System validates total credit vs. GRN value before commitment

**BR-CN-043**: Cannot post credit if insufficient inventory available
- Exception: Partial availability scenario (see Scenario 9)
- System splits available vs. consumed quantities

### CN Cost Calculations

```typescript
// QUANTITY_RETURN formulas (Periodic Average)
Return Amount = Return Quantity × Current Unit Price
Cost of Goods = Return Quantity × Period Average Cost
Realized Gain/Loss = Return Amount - Cost of Goods

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
CR: Inventory Asset (Product)         $XXX.XX (at period average cost)
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
CR: Inventory Asset (Available Qty)   $XX.XX (at period average)
CR: Cost of Goods Sold (Consumed Qty) $XX.XX (at period average)
CR: Input VAT (Tax Recoverable)       $XX.XX
```

---

## Receipt Scenarios

Receipt transactions **contribute to the period average** but do NOT immediately affect transaction costing. The average is calculated at period-end or on-demand.

### Scenario 1: GRN Commitment

**Business Context**: Purchasing staff commits a Good Received Note (GRN).

#### Initial State
```yaml
Period: January 2025
Existing Receipts: None (first receipt)
Product: Flour (All Purpose)
Location: Main Kitchen (MK)
```

#### Transaction Details
```yaml
Document: GRN-2501-0001
Date: 2025-01-05
Quantity: 100 kg
Unit Cost: $10.00/kg
Total Cost: $1,000.00
```

#### Step-by-Step Process

**Step 1: Create Transaction Record**
```typescript
// tb_inventory_transaction_detail
{
  id: "uuid-txn-001",
  transaction_id: "GRN-2501-0001",
  transaction_type: "good_received_note",
  transaction_date: "2025-01-05T10:00:00Z",
  product_id: "flour-uuid",
  location_id: "mk-uuid",
  quantity: 100.00000,
  unit_cost: 10.00000,                  // GRN unit cost
  total_cost: 1000.00000
}
```

**Step 2: Create Cost Layer Record**
```typescript
// tb_inventory_transaction_cost_layer
{
  id: "uuid-cl-001",
  inventory_transaction_detail_id: "uuid-txn-001",

  // PERIODIC AVERAGE PATTERN - No lot tracking
  lot_no: NULL,                          // 🟢 NULL (no lots)
  lot_index: 1,
  parent_lot_no: NULL,                   // 🟢 NULL (no parent)

  location_code: "MK",
  product_id: "flour-uuid",
  transaction_type: "good_received_note",

  in_qty: 100.00000,                     // 🟢 Receipt
  out_qty: 0.00000,
  cost_per_unit: 10.00000,               // GRN cost (will be used in avg calculation)
  total_cost: 1000.00000
}
```

**Step 3: Invalidate Period Cache**
```typescript
// New receipt invalidates cached average for January 2025
await invalidatePeriodCache(
  productId: "flour-uuid",
  period: new Date("2025-01-01"),
  reason: "New GRN posted"
);
```

#### Inventory Impact

```
Before GRN:
- Quantity: 0 kg
- Value: $0.00
- Jan Average: Not yet calculated

After GRN:
- Quantity: 100 kg
- Value: $1,000.00 (at GRN cost)
- Jan Average: Pending recalculation
```

#### GL Posting
```
DR: Inventory Asset (Flour)     $1,000.00
CR: GRN/Accrued Payables        $1,000.00
```

---

### Scenario 2: Stock-In Adjustment

**Business Context**: Storekeeper adjusts inventory up due to physical count variance.

#### Transaction Details
```yaml
Document: ADJ-2501-001234
Date: 2025-01-10
Type: Stock-In
Quantity: +20 kg
Unit Cost: $11.50/kg (manual entry)
Reason: "Physical count variance"
```

#### Process (Similar to GRN)

```typescript
// Cost layer record
{
  lot_no: NULL,                          // No lot tracking
  parent_lot_no: NULL,
  transaction_type: "adjustment",
  in_qty: 20.00000,                      // Stock-in
  out_qty: 0.00000,
  cost_per_unit: 11.50000,               // Manual cost
  total_cost: 230.00000                  // 20 × $11.50
}

// Invalidate cache
await invalidatePeriodCache(productId, januaryPeriod, "Stock-in adjustment");
```

---

### Scenario 3: Transfer-In

**Business Context**: Inventory transferred from another location.

#### Transaction Details
```yaml
Document: TRF-2501-0001
Date: 2025-01-15
From: Pastry Venue (PV)
To: Main Kitchen (MK)
Quantity: 30 kg
Transfer Cost: $11.20/kg (from source location average)
```

#### Process

```typescript
// Transfer-in at destination
{
  lot_no: NULL,                          // No lot tracking
  parent_lot_no: NULL,
  transaction_type: "transfer_in",
  in_qty: 30.00000,
  out_qty: 0.00000,
  cost_per_unit: 11.20000,               // From source location
  total_cost: 336.00000
}

// Invalidate cache at destination
await invalidatePeriodCache(productId, januaryPeriod, "Transfer-in");
```

---

## Consumption Scenarios

Consumption transactions **use the period average cost** for valuation. If average not yet calculated, it's computed on-demand.

### Scenario 4: Issue/Consumption

**Business Context**: Kitchen issues flour for production.

#### Initial State
```yaml
Period: January 2025
Receipts in Period:
  - Jan 5: GRN-001, 100 kg @ $10.00 = $1,000.00
  - Jan 12: GRN-002, 150 kg @ $12.50 = $1,875.00
  - Jan 18: GRN-003, 80 kg @ $11.00 = $880.00

Total Receipts: 330 kg, $3,755.00
Calculated Average: $3,755.00 ÷ 330 = $11.3788/kg
```

#### Transaction Details
```yaml
Document: ISS-2501-0050
Date: 2025-01-20
Quantity: 60 kg
Purpose: Production Order #1234
```

#### Step-by-Step Process

**Step 1: Get Period Average Cost**
```typescript
async function getPeriodAverageCost(
  productId: string,
  transactionDate: Date
): Promise<number> {
  const period = getPeriodStart(transactionDate); // 2025-01-01

  // Check cache first
  let averageCost = await getCachedCost(productId, period);

  if (averageCost === null) {
    // Calculate on-demand
    const receipts = await getReceiptsForPeriod(
      productId,
      new Date("2025-01-01"),
      new Date("2025-01-31")
    );

    averageCost = calculateAverage(receipts);
    // Result: $11.3788/kg

    // Cache for future use
    await cachePeriodCost(productId, period, averageCost);
  }

  return averageCost;
}
```

**Step 2: Create Issue Transaction**
```typescript
{
  id: "uuid-txn-issue",
  transaction_id: "ISS-2501-0050",
  transaction_type: "issue",
  transaction_date: "2025-01-20T16:00:00Z",
  product_id: "flour-uuid",
  location_id: "mk-uuid",
  quantity: 60.00000,
  unit_cost: 11.37880,                   // 🟢 Period average
  total_cost: 682.72800                  // 60 × $11.3788
}
```

**Step 3: Create Cost Layer Record**
```typescript
{
  id: "uuid-cl-issue",
  inventory_transaction_detail_id: "uuid-txn-issue",

  // PERIODIC AVERAGE PATTERN
  lot_no: NULL,                          // No lot tracking
  parent_lot_no: NULL,                   // No parent

  transaction_type: "issue",

  in_qty: 0.00000,
  out_qty: 60.00000,                     // 🟢 Consumption
  cost_per_unit: 11.37880,               // 🟢 Period average
  total_cost: 682.72800
}
```

#### Inventory Impact

```
Before Issue:
- Quantity: 330 kg (from receipts)
- Value: $3,755.00
- Period Average: $11.3788/kg

After Issue:
- Quantity: 270 kg (330 - 60)
- Value: $3,072.27 ($3,755.00 - $682.73)
- Period Average: $11.3788/kg (unchanged)

Key Point: Average cost remains constant for the period
```

#### GL Posting
```
DR: Production/Cost of Goods Used    $682.73
CR: Inventory Asset (Flour)          $682.73
```

---

### Scenario 5: Transfer-Out

**Business Context**: Transfer inventory to another location.

#### Transaction Details
```yaml
Document: TRF-2501-0002
Date: 2025-01-22
From: Main Kitchen (MK)
To: Pastry Venue (PV)
Quantity: 45 kg
Period Average: $11.3788/kg
```

#### Process

**Step 1: Get Period Average**
```typescript
const averageCost = await getPeriodAverageCost(
  "flour-uuid",
  new Date("2025-01-22")
);
// Result: $11.3788/kg
```

**Step 2: Create Transfer-Out Record**
```typescript
{
  transaction_type: "transfer_out",
  in_qty: 0.00000,
  out_qty: 45.00000,
  cost_per_unit: 11.37880,               // Period average
  total_cost: 512.04600                  // 45 × $11.3788
}
```

**Step 3: Create Transfer-In at Destination**
```typescript
// At destination location (PV)
{
  transaction_type: "transfer_in",
  in_qty: 45.00000,
  out_qty: 0.00000,
  cost_per_unit: 11.37880,               // Same cost from source
  total_cost: 512.04600
}

// Invalidate destination period cache
await invalidatePeriodCache("flour-uuid", januaryPeriod, "Transfer-in");
```

---

### Scenario 6: Stock-Out Adjustment

**Business Context**: Reduce inventory due to spoilage or count variance.

#### Transaction Details
```yaml
Document: ADJ-2501-001235
Date: 2025-01-25
Type: Stock-Out
Quantity: -15 kg
Reason: "Spoilage - temperature issue"
Period Average: $11.3788/kg
```

#### Process

```typescript
// Get period average
const averageCost = await getPeriodAverageCost(productId, transactionDate);

// Create cost layer record
{
  transaction_type: "adjustment",
  in_qty: 0.00000,
  out_qty: 15.00000,                     // Stock reduction
  cost_per_unit: 11.37880,               // Period average
  total_cost: 170.68200                  // 15 × $11.3788
}
```

#### GL Posting
```
DR: Spoilage Expense             $170.68
CR: Inventory Asset (Flour)      $170.68
```

---

### Scenario 7: Credit Note (Vendor Return)

**Business Context**: Return defective goods to vendor.

#### Transaction Details
```yaml
Document: CN-2501-0005
Date: 2025-01-28
Quantity: 25 kg
Reason: "Quality issue"
Vendor: Mediterranean Imports
Period Average: $11.3788/kg
```

#### Process

```typescript
// Get period average
const averageCost = await getPeriodAverageCost(productId, transactionDate);

// Create cost layer record
{
  transaction_type: "credit_note",
  in_qty: 0.00000,
  out_qty: 25.00000,                     // Returned to vendor
  cost_per_unit: 11.37880,               // Period average
  total_cost: 284.47000                  // 25 × $11.3788
}
```

#### GL Posting
```
DR: Accounts Payable (Vendor)    $284.47
CR: Inventory Asset              $284.47
```

---

### Scenario 8: Credit Note - Amount-Only Discount (AMOUNT_DISCOUNT)

**Business Context**: Company receives a pricing adjustment or retrospective discount from vendor without physical return of goods. This is a purely financial transaction with no inventory impact.

#### Initial State
```yaml
Inventory Status: Normal operations (no physical return)
Previous Purchases: Multiple GRNs in Q1 2025
Total Purchase Value: $12,500.00
Vendor Agreement: 4% volume rebate for Q1 purchases
Costing Method: Periodic Average
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
// ❌ No inventory transaction records
// ❌ No period average calculation impact
// ❌ No inventory adjustment

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
-- NO period average recalculation
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
  - Period Average: No change ✓

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
| **Costing Method** | N/A | Period average |
| **Cost Layer Records** | ❌ None created | ✅ Transaction records |
| **GL Debit** | Accounts Payable | Accounts Payable |
| **GL Credit (Primary)** | Purchase Discounts | Inventory Asset |
| **GL Credit (Tax)** | Input VAT | Input VAT |
| **Use Cases** | Pricing errors, discounts, rebates | Damaged goods, defects, over-shipment |

---

### Scenario 9: Credit Note - Partial Inventory Availability

**Business Context**: Company needs to return goods to vendor, but some inventory has already been consumed. System splits processing between available inventory (physical return) and consumed inventory (COGS adjustment). Uses period average cost for both portions.

#### Initial State
```yaml
Original Receipt (GRN-2501-0120):
  - Product: Chicken Breast (Fresh)
  - Received: 50 kg @ $8.50/kg (original GRN cost)
  - Month: December 2025
  - Period Average Cost: $8.35/kg

Current Status:
  - Available Balance: 10 kg (40 kg already issued to production)
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
Period: December 2025
Period Average Cost: $8.35/kg

Split Processing:
  - Available Portion: 10 kg (will be returned to stock)
  - Consumed Portion: 20 kg (already used, COGS adjustment)
```

#### Step-by-Step Process

**Step 1: System Detects Partial Availability**
```typescript
// Check current inventory balance
const currentBalance = await calculateBalance("chicken-breast-uuid", "mk-uuid");
// Result: 10 kg available

const returnQty = 30;  // Requested
const availableQty = Math.min(returnQty, currentBalance);  // 10 kg
const consumedQty = returnQty - availableQty;              // 20 kg

console.log(`
  Return Request: ${returnQty} kg
  Available: ${availableQty} kg (can return to stock)
  Consumed: ${consumedQty} kg (COGS adjustment only)
`);
```

**Step 2: Get Period Average Cost**
```typescript
// Retrieve period average cost for December 2025
const periodAverageCost = await getCachedOrCalculate(
  "chicken-breast-uuid",
  new Date("2025-12-15")
);
// Result: $8.35/kg

const availableCost = availableQty * periodAverageCost;  // 10 × $8.35 = $83.50
const consumedCost = consumedQty * periodAverageCost;    // 20 × $8.35 = $167.00
const totalCost = availableCost + consumedCost;          // $250.50
```

**Step 3: Create Cost Layer Record for Available Portion**
```typescript
{
  id: "uuid-cl-cn-available",
  inventory_transaction_detail_id: "uuid-txn-cn",

  // PERIODIC AVERAGE PATTERN
  lot_no: NULL,                        // ❌ No lot tracking
  parent_lot_no: NULL,                 // ❌ No parent
  lot_index: NULL,

  location_code: "MK",
  product_id: "chicken-breast-uuid",
  transaction_type: "credit_note",

  in_qty: 0.00000,                     // 🔴 No receipt
  out_qty: 10.00000,                   // 🔴 Available portion
  cost_per_unit: 8.35000,              // 🟢 Period average
  total_cost: 83.50000
}
```

**Step 4: Calculate COGS Adjustment for Consumed Portion**
```typescript
// Consumed portion: 20 kg already issued to production
// Must adjust COGS using period average cost

const consumedCOGS = {
  quantity: 20,
  periodAverageCost: 8.35,  // December 2025 average
  totalCOGS: 20 × 8.35 = 167.00
};

// NO cost layer record for consumed portion
// Only financial GL adjustment
```

**Step 5: Calculate Updated Balances**
```typescript
// Product balance calculation (no lot tracking)
const previousBalance = 10;      // Before CN
const afterBalance = 10 - 10;    // After CN (available portion consumed)
// Result: 0 kg

// Period average remains: $8.35/kg (unchanged by CN)
```

#### Inventory Impact

```
Before Credit Note:
Product: Chicken Breast (Fresh)
Balance: 10 kg
Period Average Cost: $8.35/kg
Value: $83.50

After Credit Note:
Product: Chicken Breast (Fresh)
Balance: 0 kg
Period Average Cost: $8.35/kg (unchanged)
Value: $0.00

Credit Note Summary:
- Total Return Quantity: 30 kg
- Available Portion: 10 kg (uses period average, reduces inventory)
- Consumed Portion: 20 kg (uses period average, COGS adjustment)
- Period Average Cost: $8.35/kg (same for both portions)
- Total Credit Amount: $250.50 (30 kg × $8.35)
- Vendor Credit: $250.50
```

#### GL Posting (Split Processing)
```
DR: Accounts Payable (Vendor)           $250.50
CR: Inventory Asset (Available 10 kg)   $83.50
CR: Cost of Goods Sold (Consumed 20 kg) $167.00
CR: Input VAT (Tax on total)            $45.09

Note: Combined entry using period average cost for both portions
```

#### Business Impact
```yaml
Financial Impact:
  - Vendor Payable Reduced: $250.50 (full return credit)
  - Inventory Value Reduced: $83.50 (available portion only)
  - COGS Reduced: $167.00 (consumed portion adjustment)
  - Input VAT Reduced: $45.09
  - Net P&L Impact: -$167.00 (COGS reduction offsets consumed goods)

Inventory Impact:
  - Physical inventory reduced: 10 kg (available portion)
  - Balance after CN: 0 kg (fully consumed)
  - Period average: $8.35/kg (unchanged)

Operational Impact:
  - Quality issue documented for 30 kg total
  - Vendor relationship: Quality control review required
  - Production impact: 20 kg already consumed (no physical return possible)
  - Future purchasing: Review temperature controls with vendor
```

#### Key Differences from FIFO

```yaml
Costing Method:
  - FIFO: Uses actual lot costs (could be $8.50, $8.40, $8.60 from different lots)
  - Periodic Average: Uses single period average ($8.35) for ALL quantities

Complexity:
  - FIFO: Must track which specific lots to consume (chronological order)
  - Periodic Average: Simpler - same cost for available and consumed portions

Cost Variance:
  - FIFO: Cost variance depends on lot ages and price changes
  - Periodic Average: Consistent cost across all transactions in period

Performance:
  - FIFO: More complex queries, lot balance calculations
  - Periodic Average: Faster - no lot tracking, single cost lookup
```

---

## Period-End Processing

### Month-End Average Calculation

**Timing**: Typically run at month-end or calculated on-demand for first transaction in period.

#### Complete January 2025 Example

**Step 1: Gather All Receipts**
```typescript
const receipts = await getReceiptsForPeriod(
  "flour-uuid",
  new Date("2025-01-01"),
  new Date("2025-01-31")
);

// Results:
// GRN-001: 100 kg @ $10.00 = $1,000.00
// GRN-002: 150 kg @ $12.50 = $1,875.00
// GRN-003:  80 kg @ $11.00 = $880.00
// ADJ-001:  20 kg @ $11.50 = $230.00
// TRF-IN:   30 kg @ $11.20 = $336.00

Total: 380 kg, $4,321.00
```

**Step 2: Calculate Average**
```typescript
const averageCost = receipts.reduce((sum, r) => sum + r.totalCost, 0)
  / receipts.reduce((sum, r) => sum + r.quantity, 0);

// $4,321.00 ÷ 380 = $11.3711/kg
```

**Step 3: Cache Result**
```typescript
interface PeriodCostCache {
  productId: string;
  period: Date;                  // 2025-01-01
  averageCost: number;           // $11.3711
  totalQuantity: number;         // 380 kg
  totalCost: number;             // $4,321.00
  receiptCount: number;          // 5
  calculatedAt: Date;
}

await cachePeriodCost({
  productId: "flour-uuid",
  period: new Date("2025-01-01"),
  averageCost: 11.3711,
  totalQuantity: 380,
  totalCost: 4321.00,
  receiptCount: 5,
  calculatedAt: new Date("2025-01-31T23:00:00Z")
});
```

**Step 4: Verify All Transactions Use Correct Average**
```typescript
// Query all January transactions
const transactions = await db.query(`
  SELECT transaction_date, transaction_type, out_qty, cost_per_unit
  FROM tb_inventory_transaction_cost_layer
  WHERE product_id = :product_id
    AND transaction_date BETWEEN '2025-01-01' AND '2025-01-31'
    AND out_qty > 0
  ORDER BY transaction_date
`);

// All should have cost_per_unit = $11.3711
```

### Period Summary Report

```
┌──────────────────────────────────────────────────────────────────┐
│ PERIOD COST SUMMARY - JANUARY 2025                              │
│ Product: Flour (All Purpose)                                    │
│ Location: Main Kitchen                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ RECEIPTS:                                                        │
│   Total Receipts: 5                                             │
│   Total Quantity: 380 kg                                        │
│   Total Cost: $4,321.00                                         │
│                                                                  │
│ PERIOD AVERAGE COST: $11.3711/kg                                │
│                                                                  │
│ CONSUMPTION:                                                     │
│   Issues: 60 kg × $11.3711 = $682.27                           │
│   Transfers Out: 45 kg × $11.3711 = $511.70                    │
│   Adjustments: 15 kg × $11.3711 = $170.57                      │
│   Credit Notes: 25 kg × $11.3711 = $284.28                     │
│   Total: 145 kg, $1,648.82                                      │
│                                                                  │
│ ENDING BALANCE:                                                  │
│   Quantity: 235 kg (380 - 145)                                  │
│   Value: $2,672.18 (235 × $11.3711)                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Patterns & Formulas

### Period Average Cost Formula

```typescript
// Basic formula
PeriodAvgCost = Σ(receipt_total_cost) ÷ Σ(receipt_quantity)

// With validation
function calculatePeriodAverage(receipts: Receipt[]): number {
  if (receipts.length === 0) {
    throw new Error("No receipts in period");
  }

  const totalCost = receipts.reduce((sum, r) => sum + r.totalCost, 0);
  const totalQty = receipts.reduce((sum, r) => sum + r.quantity, 0);

  if (totalQty === 0) {
    throw new Error("Total quantity is zero");
  }

  // Round to 5 decimal places (DECIMAL(20,5))
  return Math.round((totalCost / totalQty) * 100000) / 100000;
}
```

### Period Boundaries

```typescript
function getPeriodBoundaries(date: Date): { start: Date; end: Date } {
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
    0, 0, 0, 0
  );

  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23, 59, 59, 999
  );

  return { start, end };
}

// Examples:
// Input: 2025-01-15 → Start: 2025-01-01, End: 2025-01-31
// Input: 2025-02-28 → Start: 2025-02-01, End: 2025-02-28
// Input: 2025-03-10 → Start: 2025-03-01, End: 2025-03-31
```

### Cache Management

```typescript
// Get cached or calculate
async function getCachedOrCalculate(
  productId: string,
  transactionDate: Date
): Promise<number> {
  const period = getPeriodStart(transactionDate);

  // Try cache first
  const cached = await getCachedCost(productId, period);
  if (cached !== null) {
    return cached;
  }

  // Calculate on-demand
  const { start, end } = getPeriodBoundaries(transactionDate);
  const receipts = await getReceiptsForPeriod(productId, start, end);

  if (receipts.length === 0) {
    // Fallback logic
    return await getFallbackCost(productId, period);
  }

  const average = calculatePeriodAverage(receipts);

  // Cache for future
  await cachePeriodCost(productId, period, average, receipts);

  return average;
}
```

### Fallback Strategy

```typescript
// When no receipts in current period
async function getFallbackCost(
  productId: string,
  currentPeriod: Date
): Promise<number> {
  // 1. Try previous period (up to 12 months back)
  for (let i = 1; i <= 12; i++) {
    const previousPeriod = subMonths(currentPeriod, i);
    const cost = await getCachedCost(productId, previousPeriod);
    if (cost !== null) {
      return cost;
    }
  }

  // 2. Try standard cost
  const standardCost = await getStandardCost(productId);
  if (standardCost !== null) {
    return standardCost;
  }

  // 3. Try latest purchase price
  const latestPrice = await getLatestPurchasePrice(productId);
  if (latestPrice !== null) {
    return latestPrice;
  }

  // 4. Error
  throw new Error(
    `Cannot determine cost for product ${productId}. ` +
    `No receipts, no historical cost, no standard cost.`
  );
}
```

### Database Query Pattern

```sql
-- Get all receipts for period
SELECT
  transaction_id,
  transaction_date,
  SUM(in_qty) as quantity,
  cost_per_unit,
  SUM(total_cost) as total_cost
FROM tb_inventory_transaction_cost_layer
WHERE product_id = :product_id
  AND location_id = :location_id
  AND transaction_date BETWEEN :period_start AND :period_end
  AND in_qty > 0                    -- Only receipts
GROUP BY transaction_id, transaction_date, cost_per_unit
ORDER BY transaction_date ASC;

-- Calculate average
-- SUM(total_cost) / SUM(quantity)
```

---

## Quick Reference

### Transaction Type Mapping

| Transaction Type | in_qty | out_qty | cost_per_unit | Uses Period Avg? | Notes |
|------------------|--------|---------|---------------|------------------|-------|
| **good_received_note** | > 0 | 0 | GRN cost | No (contributes to avg) | Receipt |
| **adjustment** (stock-in) | > 0 | 0 | Manual/calculated | No (contributes to avg) | Receipt |
| **transfer_in** | > 0 | 0 | From source | No (contributes to avg) | Receipt |
| **issue** | 0 | > 0 | Period average | ✓ Yes | Consumption |
| **adjustment** (stock-out) | 0 | > 0 | Period average | ✓ Yes | Consumption |
| **transfer_out** | 0 | > 0 | Period average | ✓ Yes | Consumption |
| **credit_note** (QUANTITY_RETURN) | 0 | > 0 | Period average | ✓ Yes | Physical return |
| **credit_note** (AMOUNT_DISCOUNT) | - | - | - | ❌ No | ❌ No cost layer records |
| **credit_note** (Partial Availability) | 0 | > 0 (available) | Period average | ✓ Yes | Split: inventory + COGS |

### Key Differences: Periodic Average vs FIFO

| Aspect | Periodic Average | FIFO |
|--------|------------------|------|
| **Lot Tracking** | ❌ No | ✓ Yes |
| **Cost Calculation** | Monthly average | Per-lot specific |
| **Consumption Logic** | Use period average | Oldest lot first |
| **Complexity** | Simple | Complex |
| **Database Fields** | lot_no = NULL | lot_no populated |
| **Cost Consistency** | Same cost all month | Varies by lot |
| **Period Dependency** | ✓ Yes | ❌ No |
| **Cache Required** | ✓ Yes (performance) | ❌ No |
| **Backdated Impact** | Recalculate period | No impact |

### Common Scenarios Matrix

| Scenario | Uses Period Avg? | Contributes to Avg? | Invalidates Cache? | Inventory Impact? |
|----------|------------------|---------------------|-------------------|-------------------|
| GRN Commitment | No | ✓ Yes | ✓ Yes | Increases |
| Stock-In Adjustment | No | ✓ Yes | ✓ Yes | Increases |
| Transfer-In | No | ✓ Yes (destination) | ✓ Yes | Increases |
| Issue/Consumption | ✓ Yes | No | No | Decreases |
| Stock-Out Adjustment | ✓ Yes | No | No | Decreases |
| Transfer-Out | ✓ Yes | No | No | Decreases |
| CN - QUANTITY_RETURN (Full) | ✓ Yes | No | No | Decreases |
| CN - AMOUNT_DISCOUNT | ❌ No | No | No | ❌ None |
| CN - Partial Availability | ✓ Yes | No | No | Decreases (available only) |

### SQL Quick Queries

**Calculate Period Average:**
```sql
SELECT
  product_id,
  SUM(total_cost) / SUM(in_qty) as period_average_cost,
  SUM(in_qty) as total_receipts,
  SUM(total_cost) as total_cost,
  COUNT(*) as receipt_count
FROM tb_inventory_transaction_cost_layer
WHERE product_id = :product_id
  AND location_id = :location_id
  AND transaction_date BETWEEN :period_start AND :period_end
  AND in_qty > 0
GROUP BY product_id;
```

**Get All Transactions in Period:**
```sql
SELECT
  transaction_date,
  transaction_type,
  in_qty,
  out_qty,
  cost_per_unit,
  total_cost
FROM tb_inventory_transaction_cost_layer
WHERE product_id = :product_id
  AND location_id = :location_id
  AND transaction_date BETWEEN :period_start AND :period_end
ORDER BY transaction_date ASC;
```

**Verify Cost Consistency:**
```sql
-- All consumption transactions in period should have same cost
SELECT DISTINCT cost_per_unit
FROM tb_inventory_transaction_cost_layer
WHERE product_id = :product_id
  AND transaction_date BETWEEN :period_start AND :period_end
  AND out_qty > 0;

-- Should return single value (the period average)
```

---

**End of Document**
