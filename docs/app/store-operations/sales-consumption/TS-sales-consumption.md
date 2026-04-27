# Technical Specification: Sales Consumption

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Sales Consumption
- **Version**: 1.0.0
- **Last Updated**: 2026-01-27

---

## Overview

This document describes the technical implementation of the Sales Consumption (SC) module, including the service layer, scheduled job, recipe explosion algorithm, and ledger posting flow.

---

## Service Layer

### `lib/services/sales-consumption-service.ts`

**Primary service** for SC generation, exception routing, and supplemental SC creation.

```typescript
// lib/services/sales-consumption-service.ts

interface GenerateOptions {
  locationId: string
  shiftId: string
  businessDate: string            // YYYY-MM-DD
  connectionIds: string[]         // POS connections to include
  dryRun?: boolean                // Validate only, don't write
}

interface GenerateResult {
  scId: string
  docNumber: string
  status: SCStatus
  postedLineCount: number
  pendingLineCount: number
  totalCostPosted: Money
}

// Core generation entry point
async function generate(options: GenerateOptions): Promise<GenerateResult>

// Re-post exception lines from POS queue into Supplemental SC
async function repostExceptions(
  parentSCId: string,
  exceptionLineIds: string[]
): Promise<GenerateResult>

// Manager void with full inventory reversal
async function voidSC(scId: string, userId: string, reason: string): Promise<void>

// Build reference number: SC-{YYYYMMDD}-{locationCode}-{shiftCode}-{seq}
function buildDocNumber(locationCode: string, shiftId: string, businessDate: string, seq: number): string
```

---

## Recipe Explosion Algorithm

The explosion converts one POS transaction line (1 sold menu item) into N ingredient deduction lines.

```
Input:  posItem { id, name, quantitySold }
        mapping { recipeId, portionSize, portionUnit }

Step 1: Load recipe from mapping.recipeId
Step 2: For each recipe.ingredient:
          ingredientQty = (recipe.ingredient.qty / recipe.yield) 
                          × portionSize 
                          × quantitySold
                          × unitConversionFactor(recipe.ingredient.unit → location.baseUnit)
Step 3: Validate each ingredient:
          - recipe must be active
          - ingredient product must have cost > 0
          - ingredient product must be active
Step 4: If all ingredients pass → create posted SC lines
        If any ingredient fails → route entire transaction line to exception queue
          with the most specific ExceptionCode
```

**Modifier explosion** (add-ons):
```
Each POS modifier ID is checked against the modifier mapping table.
If mapped → treated identically to a primary POS item (runs the same explosion)
If unmapped → exception code MODIFIER_UNMAPPED
```

**Fractional variant explosion**:
```
If POS item is a fractional variant (e.g., "Pizza Slice"):
  deductionPct = variant.deductionPercentage / 100
  ingredientQty = baseRecipe.ingredient.qty × deductionPct × quantitySold
  Apply rounding rule: variant.roundingRule (up | down | nearest | exact)
```

---

## Scheduled Job (Vercel Cron)

**Config** (`vercel.ts`):
```typescript
// vercel.ts
export const config: VercelConfig = {
  // ...
  crons: [
    { path: '/api/pos/cron/sc-generation', schedule: '0 * * * *' }  // hourly — checks each location's shift close time
  ],
}
```

**Route** `app/api/pos/cron/sc-generation/route.ts`:
```
1. Load all active locations with SC generation enabled
2. For each location:
   a. Determine if any shift has closed since the last SC generation run
   b. If yes: call sales-consumption-service.generate(location, shift, businessDate)
   c. If no: skip
3. Return summary of SCs generated, skipped, failed
```

The job is idempotent: if an SC already exists for a (location, shift, businessDate) tuple and is not in `draft` status, the job skips it.

---

## Inventory Ledger Posting

When a SC line is posted, a record is written to the inventory transaction table:

```typescript
// Created per SC line that passes validation
await createInventoryTransaction({
  transactionType: TransactionType.SALES_CONSUMPTION,
  productId: line.ingredientProductId,
  locationId: sc.locationId,
  quantity: -line.qtyConsumed,          // negative = OUT direction
  unitCost: line.unitCost,
  totalCost: line.extendedCost,
  referenceType: 'SALES_CONSUMPTION',
  referenceId: sc.id,
  referenceLineId: line.id,
  businessDate: sc.businessDate,
  postedAt: new Date(),
  postedBy: 'system',
})
```

**Costing method** — determined per location:
- `FIFO`: unit cost taken from oldest unconsumed cost layer
- `PERIODIC_AVERAGE`: unit cost taken from current period's average

---

## Menu Engineering Data Source Adapter

**File**: `lib/services/menu-engineering-data-source.ts`

Provides a unified data interface for Menu Engineering components, joining SC data (ingredient cost, consumption) and POS data (revenue, item popularity). ME components call this adapter and never directly query SC or POS tables.

```typescript
// lib/services/menu-engineering-data-source.ts

interface MenuItemPerformance {
  posItemId: string
  posItemName: string
  quantitySold: number
  totalRevenue: Money
  totalCost: Money                   // From SC lines
  grossMargin: number                // (revenue - cost) / revenue
  classification: 'star' | 'plowhorse' | 'puzzle' | 'dog'
}

async function getItemPerformance(
  locationId: string,
  dateRange: { from: string; to: string }
): Promise<MenuItemPerformance[]>

async function getConsumptionByIngredient(
  locationId: string,
  dateRange: { from: string; to: string }
): Promise<IngredientConsumption[]>
```

---

## API Routes

### SC List

**Route**: `GET /api/store-operations/sales-consumption`

| Query Param | Type | Description |
|-------------|------|-------------|
| locationId | string | Filter by location |
| status | SCStatus | Filter by status |
| from | string (ISO date) | Date range start |
| to | string (ISO date) | Date range end |
| page | number | Pagination |
| pageSize | number | Items per page |

### SC Detail

**Route**: `GET /api/store-operations/sales-consumption/:id`

Returns full SC header + all lines with exception details.

### SC Lines (for exception banner)

**Route**: `GET /api/store-operations/sales-consumption/:id/lines`

| Query Param | Type | Description |
|-------------|------|-------------|
| status | SCLineStatus | Filter by line status |

### Void SC

**Route**: `POST /api/store-operations/sales-consumption/:id/void`

**Body**: `{ reason: string }`

**Permission**: `store_operations.manager` or `finance.manager`

### Manual SC Generation Trigger (dev/admin only)

**Route**: `POST /api/pos/admin/sc-generate`

**Body**: `{ locationId, shiftId, businessDate, dryRun? }`

**Permission**: `system_administration.manage`

---

## Route Structure

```
app/(main)/store-operations/sales-consumption/
  layout.tsx                    # breadcrumb, consistent padding
  page.tsx                      # SC list (Server Component)
  [id]/
    page.tsx                    # SC detail (Server Component, read-only)
  components/
    sc-list.tsx                 # List table with status badges, filters
    sc-detail.tsx               # Header card + lines table
    sc-line-table.tsx           # Lines table with exception code badges
    sc-exception-banner.tsx     # Warning banner linking to POS Exception Queue
    sc-status-badge.tsx         # Reusable status badge
```

---

## Error Handling

| Scenario | Handling |
|----------|---------|
| Recipe explosion fails partway | Transaction rolled back; exception lines queued; partial SC not created in half-state |
| Inventory transaction write fails | Retry up to 3 times; if all fail, SC line status = `pending` with a `SYSTEM_ERROR` code |
| Shift close job fails entirely | Job logs error, skips location, retries on next hourly run |
| Duplicate SC attempt | Job detects existing non-draft SC for tuple, skips silently |
| Void on already-voided SC | Returns 409 Conflict |

---

## Performance Considerations

- SC generation processes lines in batches of 100 to avoid memory spikes on high-volume outlets
- Inventory transactions are written in a single database transaction per SC to ensure atomicity
- `idx_sc_location_date` index makes the list view query O(log n) for typical date-range filters
- ME adapter caches period totals for 5 minutes (React Query stale time) to reduce repeated aggregation queries

---

**Document End**
