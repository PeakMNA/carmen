# API Reference - Inventory Valuation Service

**📌 Schema Reference**: Data structures defined in `/app/data-struc/schema.prisma`

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

## Overview

This document provides the technical API reference for the centralized Inventory Valuation Service and related services.

**Database Enum**: `enum_calculation_method` with values `FIFO` and `AVG` (see schema.prisma:42-45)

## Core Services

### InventoryValuationService

**Location**: `/lib/services/db/inventory-valuation-service.ts`

**Purpose**: Centralized service for calculating inventory costs using either FIFO or Periodic Average methods.

---

#### `calculateInventoryValuation()`

Calculate the cost of inventory based on the configured costing method.

**Signature**:
```typescript
async calculateInventoryValuation(
  itemId: string,
  quantity: number,
  date: Date
): Promise<ValuationResult>
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemId` | `string` | Yes | Unique identifier of the inventory item |
| `quantity` | `number` | Yes | Quantity to value (positive number) |
| `date` | `Date` | Yes | Transaction date (determines period for Periodic Average) |

**Returns**: `Promise<ValuationResult>`

```typescript
interface ValuationResult {
  itemId: string
  quantity: number
  unitCost: number
  totalValue: number
  method: 'FIFO' | 'AVG'
  calculatedAt: Date

  // FIFO-specific
  layersConsumed?: FIFOLayerConsumption[]

  // Periodic Average-specific
  period?: Date
  averageCost?: number
}
```

**Example Usage**:
```typescript
const service = new InventoryValuationService()

const result = await service.calculateInventoryValuation(
  'ITEM-12345',
  100,
  new Date('2025-01-15')
)

console.log(result)
// {
//   itemId: 'ITEM-12345',
//   quantity: 100,
//   unitCost: 11.4778,
//   totalValue: 1147.78,
//   method: 'AVG',
//   period: Date('2025-01-01'),
//   averageCost: 11.4778,
//   calculatedAt: Date('2025-01-15T10:30:00Z')
// }
```

**Errors**:
- `ITEM_NOT_FOUND` - Item ID doesn't exist
- `INVALID_QUANTITY` - Quantity is zero or negative
- `NO_COST_AVAILABLE` - Cannot determine cost (no receipts, no fallback)
- `SETTINGS_NOT_CONFIGURED` - Inventory settings not initialized

---

#### `getCostingMethod()`

Get the current system-wide costing method.

**Signature**:
```typescript
async getCostingMethod(): Promise<'FIFO' | 'AVG'>
```

**Returns**: `Promise<'FIFO' | 'AVG'>`

**Example**:
```typescript
const method = await service.getCostingMethod()
console.log(method) // 'FIFO' or 'PERIODIC_AVERAGE'
```

---

#### `calculateFIFOCost()` (Internal)

Calculate cost using FIFO layer consumption.

**Signature**:
```typescript
private async calculateFIFOCost(
  itemId: string,
  quantity: number,
  date: Date
): Promise<ValuationResult>
```

**Returns**: `Promise<ValuationResult>` with `layersConsumed` populated

**FIFO-Specific Result**:
```typescript
interface FIFOLayerConsumption {
  layerId: string
  lotNumber: string
  quantityConsumed: number
  unitCost: number
  totalCost: number
  receiptDate: Date
}
```

---

#### `calculatePeriodicAverageCost()` (Internal)

Calculate cost using Periodic Average method.

**Signature**:
```typescript
private async calculatePeriodicAverageCost(
  itemId: string,
  quantity: number,
  date: Date
): Promise<ValuationResult>
```

**Returns**: `Promise<ValuationResult>` with `period` and `averageCost` populated

---

### PeriodicAverageService

**Location**: `/lib/services/inventory/periodic-average-service.ts`

**Purpose**: Specialized service for Periodic Average costing calculations and cache management.

---

#### `calculateMonthlyAverageCost()`

Calculate the average cost for a specific month and item.

**Signature**:
```typescript
async calculateMonthlyAverageCost(
  itemId: string,
  month: Date
): Promise<number>
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemId` | `string` | Yes | Inventory item identifier |
| `month` | `Date` | Yes | Any date within the target month |

**Returns**: `Promise<number>` - Average cost per unit (5 decimal precision, DECIMAL(20,5) in schema)

**Example**:
```typescript
const service = new PeriodicAverageService()

const avgCost = await service.calculateMonthlyAverageCost(
  'ITEM-12345',
  new Date('2025-01-15') // Any date in January
)

console.log(avgCost) // 11.4778
```

**Algorithm**:
```
1. Get period boundaries (start/end of month)
2. Fetch all GRN receipts in period
3. Calculate: Total Cost ÷ Total Quantity
4. Round to 5 decimal places (DECIMAL(20,5))
5. Return average cost
```

**Errors**:
- `NO_RECEIPTS_FOUND` - No receipts in the specified period
- `ZERO_QUANTITY` - Total quantity is zero (shouldn't happen with valid receipts)

---

#### `getCachedCost()`

Retrieve cached period cost if available.

**Signature**:
```typescript
async getCachedCost(
  itemId: string,
  period: Date
): Promise<number | null>
```

**Returns**: `Promise<number | null>`
- `number` - Cached average cost
- `null` - No cache entry found

**Example**:
```typescript
const cached = await service.getCachedCost(
  'ITEM-12345',
  new Date('2025-01-01')
)

if (cached) {
  console.log(`Using cached cost: ${cached}`)
} else {
  console.log('Cache miss - will calculate')
}
```

---

#### `cachePeriodCost()`

Store calculated period cost in cache.

**Signature**:
```typescript
async cachePeriodCost(
  itemId: string,
  period: Date,
  cost: number,
  metadata?: CacheMetadata
): Promise<void>
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemId` | `string` | Yes | Inventory item identifier |
| `period` | `Date` | Yes | Period (will be normalized to 1st of month) |
| `cost` | `number` | Yes | Average cost to cache |
| `metadata` | `CacheMetadata` | No | Optional metadata (receipt count, totals) |

**Example**:
```typescript
await service.cachePeriodCost(
  'ITEM-12345',
  new Date('2025-01-15'), // Will be normalized to 2025-01-01
  11.4778,
  {
    receiptCount: 4,
    totalQuantity: 450,
    totalCost: 5165.00
  }
)
```

---

#### `invalidateCache()`

Invalidate (delete) cached period cost.

**Signature**:
```typescript
async invalidateCache(
  itemId: string,
  period: Date,
  reason?: string
): Promise<void>
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemId` | `string` | Yes | Inventory item identifier |
| `period` | `Date` | Yes | Period to invalidate |
| `reason` | `string` | No | Reason for invalidation (for audit trail) |

**Example**:
```typescript
await service.invalidateCache(
  'ITEM-12345',
  new Date('2025-01-01'),
  'New GRN posted to January'
)
```

**When to Call**:
- New GRN posted to a period
- Existing GRN edited (quantity/cost changed)
- GRN deleted from a period
- Manual recalculation requested

---

#### `getReceiptsForPeriod()`

Fetch all GRN receipts for an item within a period.

**Signature**:
```typescript
async getReceiptsForPeriod(
  itemId: string,
  startDate: Date,
  endDate: Date
): Promise<Receipt[]>
```

**Returns**: `Promise<Receipt[]>`

```typescript
interface Receipt {
  grnId: string
  grnNumber: string
  itemId: string
  receiptDate: Date
  quantity: number
  unitCost: number
  totalCost: number
}
```

**Example**:
```typescript
const receipts = await service.getReceiptsForPeriod(
  'ITEM-12345',
  new Date('2025-01-01'),
  new Date('2025-01-31')
)

console.log(receipts.length) // 4 receipts in January
console.log(receipts[0])
// {
//   grnId: 'GRN-001',
//   grnNumber: 'GRN-2501-0001',
//   itemId: 'ITEM-12345',
//   receiptDate: Date('2025-01-05'),
//   quantity: 100,
//   unitCost: 10.00,
//   totalCost: 1000.00
// }
```

---

### InventorySettingsService

**Location**: `/lib/services/settings/inventory-settings-service.ts`

**Purpose**: Manage inventory configuration settings (costing method, etc.).

---

#### `getSettings()`

Retrieve inventory settings for a company.

**Signature**:
```typescript
async getSettings(companyId?: string): Promise<InventorySettings>
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `companyId` | `string` | No | Company ID (defaults to current user's company) |

**Returns**: `Promise<InventorySettings>`

```typescript
interface InventorySettings {
  id: string
  companyId: string
  defaultCostingMethod: 'FIFO' | 'PERIODIC_AVERAGE'
  periodType: 'CALENDAR_MONTH'
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}
```

**Example**:
```typescript
const settingsService = new InventorySettingsService()
const settings = await settingsService.getSettings()

console.log(settings.defaultCostingMethod) // 'FIFO' or 'PERIODIC_AVERAGE'
```

---

#### `updateCostingMethod()`

Update the system-wide costing method.

**Signature**:
```typescript
async updateCostingMethod(
  method: 'FIFO' | 'AVG',
  userId: string,
  reason?: string
): Promise<InventorySettings>
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method` | `'FIFO' \| 'PERIODIC_AVERAGE'` | Yes | New costing method |
| `userId` | `string` | Yes | User making the change |
| `reason` | `string` | No | Reason for change (audit trail) |

**Returns**: `Promise<InventorySettings>` - Updated settings

**Example**:
```typescript
const updated = await settingsService.updateCostingMethod(
  'PERIODIC_AVERAGE',
  'USER-123',
  'Switching to periodic average for performance reasons'
)

console.log(updated.defaultCostingMethod) // 'PERIODIC_AVERAGE'
```

**Side Effects**:
- Audit log entry created
- System notification sent to relevant users
- Cache invalidation (if applicable)

---

#### `getDefaultCostingMethod()`

Quick method to get just the costing method.

**Signature**:
```typescript
async getDefaultCostingMethod(): Promise<'FIFO' | 'PERIODIC_AVERAGE'>
```

**Returns**: `Promise<'FIFO' | 'AVG'>`

**Example**:
```typescript
const method = await settingsService.getDefaultCostingMethod()

if (method === 'FIFO') {
  // Use FIFO logic
} else {
  // Use Periodic Average logic
}
```

---

## Type Definitions

### Core Types

```typescript
// Costing method enum (from enum_calculation_method in schema.prisma:42-45)
type CostingMethod = 'FIFO' | 'AVG'

// Valuation result
interface ValuationResult {
  itemId: string
  quantity: number
  unitCost: number
  totalValue: number
  method: CostingMethod
  calculatedAt: Date
  layersConsumed?: FIFOLayerConsumption[]
  period?: Date
  averageCost?: number
}

// FIFO layer (from tb_inventory_transaction_closing_balance in schema.prisma:614-639)
interface FIFOLayer {
  id: string
  itemId: string  // product_id
  lotNumber: string  // lot_no
  receiptDate: Date
  receiptNumber: string
  originalQuantity: number  // in_qty, DECIMAL(20,5)
  remainingQuantity: number  // calculated from in_qty - out_qty
  unitCost: number  // cost_per_unit, DECIMAL(20,5)
  totalCost: number  // total_cost, DECIMAL(20,5)
  createdAt: Date
}

// FIFO consumption (tracked via tb_inventory_transaction_detail, schema.prisma:587-613)
interface FIFOLayerConsumption {
  layerId: string
  lotNumber: string
  quantityConsumed: number  // DECIMAL(20,5)
  unitCost: number  // DECIMAL(20,5)
  totalCost: number  // DECIMAL(20,5)
  receiptDate: Date
}

// Period cost cache
// ⚠️ Note: This table does not exist in current schema (schema.prisma)
// Average costs are calculated on-demand from tb_inventory_transaction_detail
// Consider implementing application-level caching (Redis, memory cache) or adding table to schema
interface PeriodCostCache {
  id: string
  itemId: string
  period: Date
  averageCost: number  // DECIMAL(20,5)
  totalQuantity: number  // DECIMAL(20,5)
  totalCost: number  // DECIMAL(20,5)
  receiptCount: number
  calculatedAt: Date
  createdBy: string
}

// Inventory settings
interface InventorySettings {
  id: string
  companyId: string
  defaultCostingMethod: CostingMethod  // 'FIFO' | 'AVG' from enum_calculation_method
  periodType: 'CALENDAR_MONTH'
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

// Receipt (GRN item from tb_inventory_transaction_detail)
interface Receipt {
  grnId: string
  grnNumber: string
  itemId: string  // product_id
  receiptDate: Date
  quantity: number  // qty, DECIMAL(20,5)
  unitCost: number  // cost_per_unit, DECIMAL(20,5)
  totalCost: number  // total_cost, DECIMAL(20,5)
}
```

### Error Types

```typescript
// Valuation errors
enum ValuationError {
  ITEM_NOT_FOUND = 'VAL_ITEM_NOT_FOUND',
  INVALID_QUANTITY = 'VAL_INVALID_QUANTITY',
  NO_COST_AVAILABLE = 'VAL_NO_COST',
  SETTINGS_NOT_CONFIGURED = 'VAL_NO_SETTINGS',
  INSUFFICIENT_LAYERS = 'VAL_INSUFFICIENT_LAYERS', // FIFO only
  NO_RECEIPTS_FOUND = 'VAL_NO_RECEIPTS', // Periodic Average only
  CACHE_WRITE_FAILED = 'VAL_CACHE_FAILED'
}

// Error response
interface ValuationErrorResponse {
  code: ValuationError
  message: string
  itemId: string
  details?: any
}
```

---

## Usage Patterns

### Pattern 1: Calculate Credit Note Cost

```typescript
import { InventoryValuationService } from '@/lib/services/db/inventory-valuation-service'

async function calculateCreditNoteCost(creditNote: CreditNote) {
  const service = new InventoryValuationService()

  const valuation = await service.calculateInventoryValuation(
    creditNote.itemId,
    creditNote.quantity,
    creditNote.date
  )

  return {
    unitCost: valuation.unitCost,
    totalCost: valuation.totalValue,
    method: valuation.method,
    details: valuation
  }
}
```

### Pattern 2: Check Costing Method Before Processing

```typescript
import { InventorySettingsService } from '@/lib/services/settings/inventory-settings-service'

async function processCreditNote(creditNote: CreditNote) {
  const settingsService = new InventorySettingsService()
  const method = await settingsService.getDefaultCostingMethod()

  if (method === 'FIFO') {
    // Show FIFO layer selection UI
    return renderFIFOLayerSelection(creditNote)
  } else {
    // Show simple average cost UI
    return renderPeriodicAverageCost(creditNote)
  }
}
```

### Pattern 3: Month-End Cost Calculation

```typescript
import { PeriodicAverageService } from '@/lib/services/inventory/periodic-average-service'

async function monthEndProcessing(month: Date) {
  const service = new PeriodicAverageService()
  const activeItems = await getActiveItemsForMonth(month)

  for (const item of activeItems) {
    // Calculate and cache
    const avgCost = await service.calculateMonthlyAverageCost(item.id, month)
    await service.cachePeriodCost(item.id, month, avgCost)
  }
}
```

---

## Performance Considerations

### Caching Best Practices

1. **Use cached costs when available**:
```typescript
const cached = await periodicService.getCachedCost(itemId, period)
if (cached) {
  return cached // Fast path
}
// Slow path: calculate and cache
const calculated = await periodicService.calculateMonthlyAverageCost(itemId, period)
await periodicService.cachePeriodCost(itemId, period, calculated)
return calculated
```

2. **Batch operations**:
```typescript
const valuations = await Promise.all(
  items.map(item =>
    valuationService.calculateInventoryValuation(item.id, item.qty, date)
  )
)
```

3. **Pre-calculate at month-end**:
```typescript
// Run as scheduled job at end of each month
await monthEndBatchCostCalculation(previousMonth)
```

---

**Version**: 1.1
**Last Updated**: 2025-11-03
**Maintained By**: Architecture Team

---

## Document Revision Notes

**✅ Schema Alignment Completed** (2025-11-03)

This document has been updated to accurately reflect the **actual Prisma database schema** defined in `/app/data-struc/schema.prisma`.

**Key Updates**:
- Costing method enum values clarified: Database uses `FIFO` and `AVG` (display as "Periodic Average")
- Updated cost precision from 4 to 5 decimal places (DECIMAL(20,5))
- Added schema references for all data structures with line number citations
- Updated FIFOLayer interface to match `tb_inventory_transaction_closing_balance` table
- Updated FIFOLayerConsumption to reference `tb_inventory_transaction_detail` tracking
- Added note that PeriodCostCache table doesn't exist - costs calculated on-demand
- Updated Receipt interface to reference `tb_inventory_transaction_detail` table
- Updated all type signatures and return types to use `'AVG'` instead of `'PERIODIC_AVERAGE'`
- Updated example code to reflect actual enum values
