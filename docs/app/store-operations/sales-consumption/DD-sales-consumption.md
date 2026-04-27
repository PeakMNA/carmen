# Data Dictionary: Sales Consumption

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Sales Consumption
- **Version**: 1.0.0
- **Last Updated**: 2026-01-27

---

## Overview

This document defines the data models for Sales Consumption (SC) documents and their constituent lines.

---

## Enumerations

### SCStatus

```typescript
// lib/types/sales-consumption.ts
type SCStatus =
  | 'draft'
  | 'posted'
  | 'posted_with_exceptions'
  | 'blocked'
  | 'voided'
```

| Value | Description |
|-------|-------------|
| `draft` | SC created by job, validation in progress |
| `posted` | All lines posted to inventory ledger |
| `posted_with_exceptions` | Some lines posted; some lines pending in exception queue |
| `blocked` | Zero lines could post (all exceptions) |
| `voided` | SC voided by manager |

---

### ExceptionCode

```typescript
// lib/types/sales-consumption.ts
type ExceptionCode =
  | 'UNMAPPED_ITEM'
  | 'MISSING_RECIPE'
  | 'ZERO_COST_INGREDIENT'
  | 'LOCATION_UNMAPPED'
  | 'FRACTIONAL_MISSING_VARIANT'
  | 'MODIFIER_UNMAPPED'
  | 'CURRENCY_MISMATCH'
  | 'VOID_AFTER_POST'
  | 'REFUND_PARTIAL'
  | 'TAX_ONLY_ITEM'
  | 'COMP_OR_DISCOUNT'
  | 'STALE_TRANSACTION'
```

| Value | Description |
|-------|-------------|
| `UNMAPPED_ITEM` | POS item has no active recipe mapping |
| `MISSING_RECIPE` | Mapped recipe is deleted or inactive |
| `ZERO_COST_INGREDIENT` | Recipe ingredient has no current cost |
| `LOCATION_UNMAPPED` | POS outlet not linked to a Carmen location |
| `FRACTIONAL_MISSING_VARIANT` | Fractional sale variant has no recipe |
| `MODIFIER_UNMAPPED` | POS modifier/add-on has no recipe link |
| `CURRENCY_MISMATCH` | POS currency has no active exchange rate for business date |
| `VOID_AFTER_POST` | POS void arrived after SC was posted |
| `REFUND_PARTIAL` | Refund references a sale from a prior shift/day |
| `TAX_ONLY_ITEM` | POS line is a non-inventory charge (tax, tip, service charge) |
| `COMP_OR_DISCOUNT` | 100% comped sale — policy-driven handling (TBD) |
| `STALE_TRANSACTION` | POS transaction older than the configured cut-off window |

---

### SCLineStatus

```typescript
// lib/types/sales-consumption.ts
type SCLineStatus = 'posted' | 'pending' | 'reversed'
```

| Value | Description |
|-------|-------------|
| `posted` | Line posted to inventory ledger |
| `pending` | Line queued in exception queue, not yet posted |
| `reversed` | Line reversed by a void or reversing entry |

---

## Entities

### SalesConsumption (Header)

**Purpose**: Stores the header record for one SC document. One record per (locationId, shiftId, businessDate).

**TypeScript Interface**:
```typescript
// lib/types/sales-consumption.ts
interface SalesConsumption {
  id: string                       // UUID, PRIMARY KEY
  docNumber: string                // SC-{YYYYMMDD}-{locationCode}-{shift}-{seq}
  locationId: string               // FK → Location
  businessDate: string             // ISO date (YYYY-MM-DD)
  shiftId: string                  // FK → Shift, or 'all_day'
  status: SCStatus
  sourceConnectionIds: string[]    // FK[] → PosConnection
  transactionCount: number         // Total POS sales aggregated
  postedLineCount: number          // Lines successfully posted
  pendingLineCount: number         // Lines in exception queue
  totalCostPosted: Money           // Sum of ingredient costs posted to ledger
  totalRevenue: Money              // Sum of POS sale amounts (informational only)
  parentSCId?: string              // Present if this is a Supplemental SC
  voidedAt?: string                // ISO timestamp
  voidedBy?: string                // UserId
  voidReason?: string              // Required when voiding
  postedAt?: string                // ISO timestamp of last posting batch
  postedBy: 'system' | string      // 'system' or UserId
  createdAt: string                // ISO timestamp
  updatedAt: string                // ISO timestamp
}
```

**Proposed Table**: `tb_sales_consumption`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| doc_number | VARCHAR(60) | UNIQUE, NOT NULL | SC reference number |
| location_id | UUID | FK → tb_location, NOT NULL | Carmen location |
| business_date | DATE | NOT NULL | Business date |
| shift_id | VARCHAR(50) | NOT NULL | Shift identifier or 'all_day' |
| status | ENUM(SCStatus) | NOT NULL, DEFAULT 'draft' | Document status |
| source_connection_ids | UUID[] | NOT NULL | POS connections contributing data |
| transaction_count | INTEGER | NOT NULL, DEFAULT 0 | Raw POS transactions aggregated |
| posted_line_count | INTEGER | NOT NULL, DEFAULT 0 | Lines posted to ledger |
| pending_line_count | INTEGER | NOT NULL, DEFAULT 0 | Lines in exception queue |
| total_cost_posted | DECIMAL(15,4) | NOT NULL, DEFAULT 0 | Total cost posted (base currency) |
| total_revenue | DECIMAL(15,4) | NOT NULL, DEFAULT 0 | Total revenue from POS (informational) |
| currency | CHAR(3) | NOT NULL | Location base currency code |
| parent_sc_id | UUID | FK → tb_sales_consumption, NULLABLE | Parent SC for supplementals |
| voided_at | TIMESTAMPTZ | NULLABLE | Void timestamp |
| voided_by | UUID | FK → tb_user, NULLABLE | User who voided |
| void_reason | TEXT | NULLABLE | Required when voided |
| posted_at | TIMESTAMPTZ | NULLABLE | Last posting timestamp |
| posted_by | VARCHAR(50) | NOT NULL | 'system' or user UUID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Last update timestamp |

**Indexes**:
- `idx_sc_location_date` ON (location_id, business_date DESC)
- `idx_sc_status` ON (status)
- `idx_sc_parent` ON (parent_sc_id) WHERE parent_sc_id IS NOT NULL
- `idx_sc_date` ON (business_date DESC)

**Constraints**:
- UNIQUE (location_id, shift_id, business_date) WHERE parent_sc_id IS NULL — one primary SC per tuple
- CHECK (voided_at IS NOT NULL OR void_reason IS NULL) — void reason only when voided

---

### SalesConsumptionLine

**Purpose**: Stores one ingredient deduction line per SC. A single POS transaction item may produce multiple lines (one per recipe ingredient).

**TypeScript Interface**:
```typescript
// lib/types/sales-consumption.ts
interface SalesConsumptionLine {
  id: string                       // UUID, PRIMARY KEY
  scId: string                     // FK → SalesConsumption
  posTransactionId: string         // FK → POS raw transaction
  posItemId: string                // POS item identifier
  posItemName: string              // POS item name (snapshot at time of generation)
  recipeId?: string                // FK → Recipe (absent when exception)
  recipeName?: string              // Recipe name snapshot
  ingredientProductId?: string     // FK → Product (absent when exception)
  ingredientProductName?: string   // Product name snapshot
  qtyConsumed: number              // Quantity of ingredient deducted
  unitOfMeasure: string            // UoM for qtyConsumed
  unitCost: number                 // Cost per unit at time of posting
  extendedCost: number             // qtyConsumed × unitCost
  currency: string                 // Base currency code
  status: SCLineStatus
  exceptionCode?: ExceptionCode    // Present when status = 'pending'
  exceptionDetail?: string         // Human-readable exception detail
  reversesLineId?: string          // FK → SalesConsumptionLine being reversed
  inventoryTransactionId?: string  // FK → inventory_transaction (when posted)
  createdAt: string                // ISO timestamp
}
```

**Proposed Table**: `tb_sales_consumption_line`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| sc_id | UUID | FK → tb_sales_consumption, NOT NULL | Parent SC document |
| pos_transaction_id | VARCHAR(100) | NOT NULL | POS raw transaction reference |
| pos_item_id | VARCHAR(100) | NOT NULL | POS item identifier |
| pos_item_name | VARCHAR(255) | NOT NULL | POS item name at time of generation |
| recipe_id | UUID | FK → tb_recipe, NULLABLE | Mapped recipe |
| recipe_name | VARCHAR(255) | NULLABLE | Recipe name snapshot |
| ingredient_product_id | UUID | FK → tb_product, NULLABLE | Ingredient being deducted |
| ingredient_product_name | VARCHAR(255) | NULLABLE | Product name snapshot |
| qty_consumed | DECIMAL(15,4) | NOT NULL | Quantity consumed |
| unit_of_measure | VARCHAR(50) | NOT NULL | UoM for qty_consumed |
| unit_cost | DECIMAL(15,4) | NOT NULL, DEFAULT 0 | Cost per unit |
| extended_cost | DECIMAL(15,4) | NOT NULL, DEFAULT 0 | qty_consumed × unit_cost |
| currency | CHAR(3) | NOT NULL | Currency code |
| status | ENUM(SCLineStatus) | NOT NULL, DEFAULT 'pending' | Line status |
| exception_code | ENUM(ExceptionCode) | NULLABLE | Reason code when pending |
| exception_detail | TEXT | NULLABLE | Human-readable exception details |
| reverses_line_id | UUID | FK → tb_sales_consumption_line, NULLABLE | Line being reversed |
| inventory_transaction_id | UUID | FK → tb_inventory_transaction, NULLABLE | Created when posted |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes**:
- `idx_scl_sc_id` ON (sc_id)
- `idx_scl_status` ON (status)
- `idx_scl_pos_txn` ON (pos_transaction_id)
- `idx_scl_ingredient` ON (ingredient_product_id) WHERE ingredient_product_id IS NOT NULL
- `idx_scl_exception` ON (exception_code) WHERE exception_code IS NOT NULL

---

## TransactionType Extension

**File**: `lib/types/inventory.ts`

```typescript
// ADD to existing TransactionType enum:
export enum TransactionType {
  // ...existing values (RECEIVE, ISSUE, TRANSFER_OUT, TRANSFER_IN, ADJUST_UP, ADJUST_DOWN, COUNT, WASTE, CONVERSION)...
  SALES_CONSUMPTION = 'SALES_CONSUMPTION',  // Inventory deduction from POS menu sales
}
```

The `SALES_CONSUMPTION` type is an OUT-direction transaction (reduces stock). It is always created by the SC generation service, never manually.

---

## Relationships

```
SalesConsumption
    ├── has_many: SalesConsumptionLine (scId)
    ├── belongs_to: Location (locationId)
    ├── may_belong_to: SalesConsumption as parent (parentSCId) — Supplemental SC pattern
    ├── references: PosConnection[] (sourceConnectionIds)
    └── references: Shift (shiftId)

SalesConsumptionLine
    ├── belongs_to: SalesConsumption (scId)
    ├── references: POS raw transaction (posTransactionId)
    ├── may_belong_to: Recipe (recipeId)
    ├── may_belong_to: Product/ingredient (ingredientProductId)
    ├── may_reference: SalesConsumptionLine as reversing entry (reversesLineId)
    └── may_reference: InventoryTransaction (inventoryTransactionId) — created on post
```

---

## Mock Data

**File**: `lib/mock-data/sales-consumption.ts`

```typescript
// Sample SC header
export const mockSalesConsumptions: SalesConsumption[] = [
  {
    id: 'sc-001',
    docNumber: 'SC-20260127-MAIN-LUNCH-001',
    locationId: 'loc-main',
    businessDate: '2026-01-27',
    shiftId: 'shift-lunch',
    status: 'posted_with_exceptions',
    sourceConnectionIds: ['conn-square-main'],
    transactionCount: 47,
    postedLineCount: 89,
    pendingLineCount: 3,
    totalCostPosted: { amount: 1247.50, currency: 'USD' },
    totalRevenue: { amount: 4830.00, currency: 'USD' },
    postedAt: '2026-01-27T15:05:00Z',
    postedBy: 'system',
    createdAt: '2026-01-27T15:00:00Z',
    updatedAt: '2026-01-27T15:05:00Z',
  }
]

// Sample exception line
export const mockSCLines: SalesConsumptionLine[] = [
  {
    id: 'scl-001',
    scId: 'sc-001',
    posTransactionId: 'pos-txn-0047',
    posItemId: 'pos-item-99',
    posItemName: 'Oat Milk Latte',
    status: 'pending',
    exceptionCode: 'UNMAPPED_ITEM',
    exceptionDetail: 'POS item "Oat Milk Latte" has no active recipe mapping',
    qtyConsumed: 0,
    unitOfMeasure: '',
    unitCost: 0,
    extendedCost: 0,
    currency: 'USD',
    createdAt: '2026-01-27T15:00:00Z',
  }
]
```

---

**Document End**
