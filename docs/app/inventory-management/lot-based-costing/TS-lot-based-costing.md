# TS-LOT: Lot-Based Costing Technical Specification

**Document Version**: 1.0
**Last Updated**: 2025-11-07
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Module**: Inventory Management
**Feature**: Lot-Based Costing with Automatic Lot Creation

---

## Document Overview

This document provides the technical specification for implementing lot-based costing with automatic lot record creation. It covers system architecture, API design, database schema, service layer implementation, and integration points.

**Related Documents**:
- [BR-LOT: Business Requirements](./BR-lot-based-costing.md)
- [UC-LOT: Use Cases](./UC-lot-based-costing.md)
- [SM: Costing Methods](../../shared-methods/inventory-valuation/SM-costing-methods.md)

---

## Technology Stack

### Core Framework
- **Next.js**: 14.x (App Router)
- **React**: 18.x
- **TypeScript**: 5.8.2
- **Node.js**: 20.14.0

### Database
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 14+
- **Connection Pool**: PgBouncer (optional)

### State Management
- **Global State**: Zustand
- **Server State**: React Query (TanStack Query)
- **Form State**: React Hook Form + Zod

### UI Components
- **Component Library**: Shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Testing
- **Unit Tests**: Vitest
- **E2E Tests**: Playwright (planned)

---

## System Architecture

### Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  GRN Pages   │  │ Adjustment   │  │   Reports    │      │
│  │              │  │   Pages      │  │   Pages      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
┌─────────┼─────────────────┼──────────────────┼──────────────┐
│         ▼                 ▼                  ▼              │
│                    Server Actions Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   commitGrn  │  │ saveAdjustmt │  │  queryLots   │      │
│  │     ()       │  │      ()      │  │     ()       │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
┌─────────┼─────────────────┼──────────────────┼──────────────┐
│         ▼                 ▼                  ▼              │
│                     Service Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           LotGenerationService                        │   │
│  │  • generateLotNumber()                                │   │
│  │  • getNextSequence()                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           FifoConsumptionService                      │   │
│  │  • allocateLots()                                     │   │
│  │  • calculateCost()                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          LotTraceabilityService                       │   │
│  │  • getLotHistory()                                    │   │
│  │  • getLotBalance()                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                 │                  │              │
└─────────┼─────────────────┼──────────────────┼──────────────┘
          │                 │                  │
┌─────────┼─────────────────┼──────────────────┼──────────────┐
│         ▼                 ▼                  ▼              │
│                      Data Access Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Prisma Client                           │   │
│  │  • tb_inventory_transaction_cost_layer                │   │
│  │  • tb_inventory_transaction_detail                    │   │
│  │  • tb_inventory_transaction_closing_balance           │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────┐
│                PostgreSQL Database                           │
│  • ACID Transactions                                        │
│  • Row-Level Locking                                        │
│  • Unique Constraints                                       │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

**Lot Creation Flow (GRN Commitment)**:
1. User commits GRN via UI
2. Server Action `commitGrn()` validates data
3. Service Layer calls `LotGenerationService.generateLotNumber()`
4. Service queries last sequence for location+date
5. Service generates lot number with format `{LOCATION}-{YYMMDD}-{SEQSEQ}`
6. Data Access Layer creates cost layer record via Prisma
7. Transaction commits atomically
8. UI displays confirmation with lot number

**FIFO Consumption Flow (Issue)**:
1. User creates issue transaction via UI
2. Server Action `processIssue()` validates data
3. Service Layer calls `FifoConsumptionService.allocateLots()`
4. Service queries available lots ordered by lot_no (chronological)
5. Service allocates issue quantity across lots (oldest first)
6. Data Access Layer creates consumption records via Prisma
7. Transaction commits atomically
8. UI displays consumed lots and total cost

---

## Database Schema

### Core Tables

#### tb_inventory_transaction_cost_layer

**Purpose**: Stores all lot creation and consumption records

**Schema Definition**:
```prisma
model tb_inventory_transaction_cost_layer {
  id                              String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inventory_transaction_detail_id String  @db.Uuid

  // Lot Identification
  lot_no                          String? @db.VarChar    // Format: {LOCATION}-{YYMMDD}-{SEQSEQ}
  lot_index                       Int     @default(1)    // Auto-increment per lot
  parent_lot_no                   String? @db.VarChar    // NULL for LOT creation, populated for consumption

  // Location Context
  location_id                     String?   @db.Uuid
  location_code                   String?   @db.VarChar

  // Lot Metadata
  lot_at_date                     DateTime? @db.Timestamptz(6)  // Lot creation date
  lot_seq_no                      Int?      @default(1)         // Sequence number (1-9999)

  // Product Reference
  product_id                      String?   @db.Uuid

  // Transaction Details
  transaction_type                enum_transaction_type?
  in_qty                          Decimal?  @default(0) @db.Decimal(20, 5)
  out_qty                         Decimal?  @default(0) @db.Decimal(20, 5)

  // Costing
  cost_per_unit                   Decimal?  @default(0) @db.Decimal(20, 5)
  total_cost                      Decimal?  @default(0) @db.Decimal(20, 5)

  // Audit Fields
  created_at                      DateTime? @default(now()) @db.Timestamptz(6)
  updated_at                      DateTime? @updatedAt @db.Timestamptz(6)
  created_by                      String?   @db.Uuid
  updated_by                      String?   @db.Uuid

  // Relationships
  tb_inventory_transaction_detail tb_inventory_transaction_detail
    @relation(fields: [inventory_transaction_detail_id], references: [id])

  @@unique([lot_no, lot_index])
  @@index([lot_no])
  @@index([parent_lot_no])
  @@index([product_id, location_id])
  @@index([lot_at_date])
}
```

**Key Constraints**:
- **Unique Constraint**: `(lot_no, lot_index)` - Ensures unique lot records
- **Index**: `lot_no` - Fast lot lookup
- **Index**: `parent_lot_no` - Fast consumption query
- **Index**: `(product_id, location_id)` - Fast balance queries
- **Index**: `lot_at_date` - Date-based reporting

**Field Descriptions**:

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `lot_no` | String? | Lot identifier (NULL for consumption records) | Format: `{LOCATION}-{YYMMDD}-{SEQSEQ}` |
| `lot_index` | Int | Sequence within lot (1 for creation, 2+ for consumption) | ≥ 1 |
| `parent_lot_no` | String? | Reference to consumed lot (NULL for lot creation) | Must exist if populated |
| `lot_at_date` | DateTime? | Date component of lot number | Not future date |
| `lot_seq_no` | Int? | Daily sequence number (1-9999) | 1 ≤ seq ≤ 9999 |
| `in_qty` | Decimal | Quantity received (for lot creation) | ≥ 0, > 0 for LOT |
| `out_qty` | Decimal | Quantity consumed (for consumption) | ≥ 0, > 0 for ADJUSTMENT |
| `cost_per_unit` | Decimal | Unit cost (from source transaction) | > 0 |
| `total_cost` | Decimal | Total cost (qty × cost_per_unit) | ≥ 0 |

**Data Patterns**:

**LOT Pattern** (Lot Creation):
```typescript
{
  lot_no: "MK-251107-0001",       // Generated lot number
  lot_index: 1,                   // Always 1 for creation
  parent_lot_no: null,            // NULL indicates LOT creation
  transaction_type: "good_received_note" | "adjustment",
  in_qty: 50.00000,              // Quantity received
  out_qty: 0.00000,              // No consumption
  cost_per_unit: 5.50000,        // Unit cost
  total_cost: 275.00000          // 50 × 5.50
}
```

**ADJUSTMENT Pattern** (Lot Consumption):
```typescript
{
  lot_no: null,                   // No lot number for consumption
  lot_index: 2,                   // Incremented per parent lot
  parent_lot_no: "MK-251107-0001", // Reference to consumed lot
  transaction_type: "issue" | "adjustment" | "transfer_out",
  in_qty: 0.00000,               // No receipt
  out_qty: 10.00000,             // Quantity consumed
  cost_per_unit: 5.50000,        // Cost from parent lot
  total_cost: 55.00000           // 10 × 5.50
}
```

#### tb_inventory_transaction_detail

**Purpose**: Parent transaction details

**Relevant Fields**:
```prisma
model tb_inventory_transaction_detail {
  id                      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  transaction_id          String   @db.VarChar
  transaction_type        enum_transaction_type
  transaction_date        DateTime @db.Timestamptz(6)
  product_id              String   @db.Uuid
  location_id             String   @db.Uuid
  quantity                Decimal  @db.Decimal(20, 5)
  unit_cost               Decimal  @db.Decimal(20, 5)
  reference_document      String?  @db.VarChar

  // Relationship
  cost_layers             tb_inventory_transaction_cost_layer[]
}
```

#### tb_inventory_transaction_closing_balance

**Purpose**: Optimized balance queries (optional performance enhancement)

**Schema**:
```prisma
model tb_inventory_transaction_closing_balance {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  product_id      String   @db.Uuid
  location_id     String   @db.Uuid
  lot_no          String?  @db.VarChar
  balance_qty     Decimal  @db.Decimal(20, 5)
  balance_value   Decimal  @db.Decimal(20, 5)
  as_of_date      DateTime @db.Timestamptz(6)

  @@unique([product_id, location_id, lot_no])
  @@index([product_id, location_id])
  @@index([lot_no])
}
```

### Transaction Types Enum

```prisma
enum enum_transaction_type {
  good_received_note    // GRN commitment - creates new lot
  transfer_in           // Inter-location transfer receipt - creates new lot
  transfer_out          // Inter-location transfer issue - consumes from lot
  issue                 // Production/store issue - consumes from lot
  adjustment            // Stock-in (creates lot) or stock-out (consumes lot)
  credit_note           // Vendor return - consumes from lot
  close_period          // Period-end snapshot
  open_period           // Period-opening snapshot
}
```

**Transaction Type Characteristics**:

| Transaction Type | Creates Lot? | Consumes Lot? | parent_lot_no | in_qty | out_qty |
|------------------|-------------|---------------|---------------|--------|---------|
| `good_received_note` | Yes | No | NULL | > 0 | 0 |
| `transfer_in` | Yes | No | NULL | > 0 | 0 |
| `adjustment` (stock-in) | Yes | No | NULL | > 0 | 0 |
| `transfer_out` | No | Yes | populated | 0 | > 0 |
| `issue` | No | Yes | populated | 0 | > 0 |
| `adjustment` (stock-out) | No | Yes | populated | 0 | > 0 |
| `credit_note` | No | Yes | populated | 0 | > 0 |

---

## Service Layer Implementation

### LotGenerationService

**Purpose**: Generate unique lot numbers with proper sequencing

**File**: `lib/services/lot-generation.service.ts`

**Interface**:
```typescript
import { Prisma } from '@prisma/client'

interface LotGenerationResult {
  lotNo: string
  lotSeqNo: number
  lotAtDate: Date
  locationCode: string
}

interface LotGenerationParams {
  locationCode: string
  receiptDate: Date
  productId?: string  // Optional, for validation
}

class LotGenerationService {
  /**
   * Generate unique lot number with format {LOCATION}-{YYMMDD}-{SEQSEQ}
   * @param params - Location code and receipt date
   * @returns Generated lot number and metadata
   * @throws Error if sequence limit exceeded (>9999)
   */
  async generateLotNumber(
    params: LotGenerationParams
  ): Promise<LotGenerationResult>

  /**
   * Get next sequence number for location and date
   * @param locationCode - Location code (e.g., "MK")
   * @param receiptDate - Receipt date
   * @returns Next available sequence number (1-9999)
   */
  private async getNextSequence(
    locationCode: string,
    receiptDate: Date
  ): Promise<number>

  /**
   * Format lot number components
   * @param locationCode - Location code
   * @param receiptDate - Receipt date
   * @param sequenceNo - Sequence number
   * @returns Formatted lot number
   */
  private formatLotNumber(
    locationCode: string,
    receiptDate: Date,
    sequenceNo: number
  ): string

  /**
   * Validate lot number format
   * @param lotNo - Lot number to validate
   * @returns true if valid, false otherwise
   */
  validateLotNumberFormat(lotNo: string): boolean

  /**
   * Parse lot number into components
   * @param lotNo - Lot number to parse
   * @returns Parsed components or null if invalid
   */
  parseLotNumber(lotNo: string): {
    locationCode: string
    date: Date
    sequence: number
  } | null
}
```

**Implementation**:

```typescript
import { prisma } from '@/lib/db'
import { format, parse } from 'date-fns'

export class LotGenerationService {
  /**
   * Maximum sequence number per location per day
   */
  private readonly MAX_SEQUENCE = 9999

  /**
   * Lot number regex pattern
   */
  private readonly LOT_PATTERN = /^([A-Z0-9]{2,4})-(\d{6})-(\d{4})$/

  async generateLotNumber(
    params: LotGenerationParams
  ): Promise<LotGenerationResult> {
    const { locationCode, receiptDate } = params

    // Validate inputs
    if (!locationCode || locationCode.length < 2 || locationCode.length > 4) {
      throw new Error('Invalid location code: must be 2-4 uppercase alphanumeric characters')
    }

    if (receiptDate > new Date()) {
      throw new Error('Receipt date cannot be in the future')
    }

    // Get next sequence number
    const sequenceNo = await this.getNextSequence(locationCode, receiptDate)

    // Check sequence limit
    if (sequenceNo > this.MAX_SEQUENCE) {
      throw new Error(
        `Daily lot limit (${this.MAX_SEQUENCE}) exceeded for location ${locationCode}. ` +
        'Please use a different location code or defer receipt to next day.'
      )
    }

    // Format lot number
    const lotNo = this.formatLotNumber(locationCode, receiptDate, sequenceNo)

    // Return result
    return {
      lotNo,
      lotSeqNo: sequenceNo,
      lotAtDate: receiptDate,
      locationCode: locationCode.toUpperCase()
    }
  }

  private async getNextSequence(
    locationCode: string,
    receiptDate: Date
  ): Promise<number> {
    // Normalize date to start of day (remove time component)
    const dateOnly = new Date(receiptDate)
    dateOnly.setHours(0, 0, 0, 0)

    // Query last sequence for this location and date
    const lastLot = await prisma.tb_inventory_transaction_cost_layer.findFirst({
      where: {
        location_code: locationCode.toUpperCase(),
        lot_at_date: {
          gte: dateOnly,
          lt: new Date(dateOnly.getTime() + 24 * 60 * 60 * 1000) // < next day
        },
        lot_no: { not: null } // Only LOT records, not consumption records
      },
      orderBy: {
        lot_seq_no: 'desc'
      },
      select: {
        lot_seq_no: true
      }
    })

    // Return next sequence
    return lastLot ? (lastLot.lot_seq_no ?? 0) + 1 : 1
  }

  private formatLotNumber(
    locationCode: string,
    receiptDate: Date,
    sequenceNo: number
  ): string {
    // Format date as YYMMDD
    const dateStr = format(receiptDate, 'yyMMdd')

    // Format sequence with 4-digit padding
    const seqStr = sequenceNo.toString().padStart(4, '0')

    // Construct lot number
    return `${locationCode.toUpperCase()}-${dateStr}-${seqStr}`
  }

  validateLotNumberFormat(lotNo: string): boolean {
    return this.LOT_PATTERN.test(lotNo)
  }

  parseLotNumber(lotNo: string): {
    locationCode: string
    date: Date
    sequence: number
  } | null {
    const match = lotNo.match(this.LOT_PATTERN)

    if (!match) {
      return null
    }

    const [, locationCode, dateStr, seqStr] = match

    // Parse date (YYMMDD format)
    const date = parse(dateStr, 'yyMMdd', new Date())

    // Parse sequence
    const sequence = parseInt(seqStr, 10)

    return {
      locationCode,
      date,
      sequence
    }
  }
}

// Singleton instance
export const lotGenerationService = new LotGenerationService()
```

**Usage Example**:
```typescript
// Generate lot number for GRN
const lotResult = await lotGenerationService.generateLotNumber({
  locationCode: 'MK',
  receiptDate: new Date('2025-11-07'),
  productId: 'product-uuid'
})

console.log(lotResult)
// {
//   lotNo: 'MK-251107-0001',
//   lotSeqNo: 1,
//   lotAtDate: 2025-11-07T00:00:00.000Z,
//   locationCode: 'MK'
// }
```

### FifoConsumptionService

**Purpose**: Calculate FIFO lot allocation and consumption cost

**File**: `lib/services/fifo-consumption.service.ts`

**Interface**:
```typescript
interface AvailableLot {
  lotNo: string
  productId: string
  locationId: string
  remainingQty: Decimal
  costPerUnit: Decimal
  lotAtDate: Date
}

interface LotAllocation {
  lotNo: string
  qtyConsumed: Decimal
  costPerUnit: Decimal
  totalCost: Decimal
  lotIndex: number
}

interface FifoAllocationResult {
  allocations: LotAllocation[]
  totalQty: Decimal
  totalCost: Decimal
  weightedAvgCost: Decimal
}

interface FifoAllocationParams {
  productId: string
  locationId: string
  issueQty: Decimal
  issueDate: Date
}

class FifoConsumptionService {
  /**
   * Allocate issue quantity across available lots using FIFO
   * @param params - Product, location, quantity, and date
   * @returns Lot allocations with costs
   * @throws Error if insufficient inventory
   */
  async allocateLots(
    params: FifoAllocationParams
  ): Promise<FifoAllocationResult>

  /**
   * Query available lots for product/location
   * @param productId - Product UUID
   * @param locationId - Location UUID
   * @returns Available lots ordered by lot_no (FIFO)
   */
  private async getAvailableLots(
    productId: string,
    locationId: string
  ): Promise<AvailableLot[]>

  /**
   * Calculate next lot_index for parent lot
   * @param parentLotNo - Parent lot number
   * @returns Next lot_index value
   */
  private async getNextLotIndex(
    parentLotNo: string
  ): Promise<number>

  /**
   * Calculate total available balance
   * @param productId - Product UUID
   * @param locationId - Location UUID
   * @returns Total available quantity
   */
  async getTotalAvailableBalance(
    productId: string,
    locationId: string
  ): Promise<Decimal>
}
```

**Implementation**:

```typescript
import { prisma } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

export class FifoConsumptionService {
  async allocateLots(
    params: FifoAllocationParams
  ): Promise<FifoAllocationResult> {
    const { productId, locationId, issueQty, issueDate } = params

    // Validate issue quantity
    if (issueQty.lte(0)) {
      throw new Error('Issue quantity must be greater than zero')
    }

    // Get available lots (FIFO order)
    const availableLots = await this.getAvailableLots(productId, locationId)

    // Check total availability
    const totalAvailable = availableLots.reduce(
      (sum, lot) => sum.add(lot.remainingQty),
      new Decimal(0)
    )

    if (totalAvailable.lt(issueQty)) {
      throw new Error(
        `Insufficient inventory. Available: ${totalAvailable.toString()}, ` +
        `Requested: ${issueQty.toString()}`
      )
    }

    // Allocate quantity across lots
    const allocations: LotAllocation[] = []
    let remainingQty = issueQty

    for (const lot of availableLots) {
      if (remainingQty.lte(0)) {
        break // All quantity allocated
      }

      // Get next lot_index for this parent lot
      const lotIndex = await this.getNextLotIndex(lot.lotNo)

      // Determine consumption quantity from this lot
      const qtyFromLot = remainingQty.gte(lot.remainingQty)
        ? lot.remainingQty  // Consume entire lot
        : remainingQty      // Partial consumption

      // Calculate cost
      const costFromLot = qtyFromLot.mul(lot.costPerUnit)

      // Record allocation
      allocations.push({
        lotNo: lot.lotNo,
        qtyConsumed: qtyFromLot,
        costPerUnit: lot.costPerUnit,
        totalCost: costFromLot,
        lotIndex
      })

      // Reduce remaining quantity
      remainingQty = remainingQty.sub(qtyFromLot)
    }

    // Calculate totals
    const totalCost = allocations.reduce(
      (sum, alloc) => sum.add(alloc.totalCost),
      new Decimal(0)
    )

    const weightedAvgCost = totalCost.div(issueQty)

    return {
      allocations,
      totalQty: issueQty,
      totalCost,
      weightedAvgCost
    }
  }

  private async getAvailableLots(
    productId: string,
    locationId: string
  ): Promise<AvailableLot[]> {
    // Query cost layers with aggregated balances
    const lots = await prisma.$queryRaw<Array<{
      lot_no: string
      product_id: string
      location_id: string
      cost_per_unit: Decimal
      remaining_qty: Decimal
      lot_at_date: Date
    }>>`
      SELECT
        lot_no,
        product_id,
        location_id,
        cost_per_unit,
        SUM(in_qty) - SUM(out_qty) as remaining_qty,
        lot_at_date
      FROM tb_inventory_transaction_cost_layer
      WHERE product_id = ${productId}::uuid
        AND location_id = ${locationId}::uuid
        AND lot_no IS NOT NULL
      GROUP BY lot_no, product_id, location_id, cost_per_unit, lot_at_date
      HAVING SUM(in_qty) - SUM(out_qty) > 0
      ORDER BY lot_no ASC  -- FIFO: oldest lot first (chronological due to date-based format)
    `

    return lots.map(lot => ({
      lotNo: lot.lot_no,
      productId: lot.product_id,
      locationId: lot.location_id,
      remainingQty: lot.remaining_qty,
      costPerUnit: lot.cost_per_unit,
      lotAtDate: lot.lot_at_date
    }))
  }

  private async getNextLotIndex(parentLotNo: string): Promise<number> {
    const lastConsumption = await prisma.tb_inventory_transaction_cost_layer.findFirst({
      where: {
        parent_lot_no: parentLotNo
      },
      orderBy: {
        lot_index: 'desc'
      },
      select: {
        lot_index: true
      }
    })

    return lastConsumption ? lastConsumption.lot_index + 1 : 2  // Start at 2 (1 is lot creation)
  }

  async getTotalAvailableBalance(
    productId: string,
    locationId: string
  ): Promise<Decimal> {
    const result = await prisma.$queryRaw<Array<{ balance: Decimal }>>`
      SELECT
        COALESCE(SUM(in_qty) - SUM(out_qty), 0) as balance
      FROM tb_inventory_transaction_cost_layer
      WHERE product_id = ${productId}::uuid
        AND location_id = ${locationId}::uuid
        AND lot_no IS NOT NULL
    `

    return result[0]?.balance ?? new Decimal(0)
  }
}

// Singleton instance
export const fifoConsumptionService = new FifoConsumptionService()
```

**Usage Example**:
```typescript
// Allocate 25 kg for issue
const allocation = await fifoConsumptionService.allocateLots({
  productId: 'product-uuid',
  locationId: 'location-uuid',
  issueQty: new Decimal(25),
  issueDate: new Date('2025-11-07')
})

console.log(allocation)
// {
//   allocations: [
//     {
//       lotNo: 'MK-251105-0012',
//       qtyConsumed: Decimal(15),
//       costPerUnit: Decimal(4.80),
//       totalCost: Decimal(72.00),
//       lotIndex: 2
//     },
//     {
//       lotNo: 'MK-251106-0008',
//       qtyConsumed: Decimal(10),
//       costPerUnit: Decimal(4.95),
//       totalCost: Decimal(49.50),
//       lotIndex: 2
//     }
//   ],
//   totalQty: Decimal(25),
//   totalCost: Decimal(121.50),
//   weightedAvgCost: Decimal(4.86)
// }
```

### LotTraceabilityService

**Purpose**: Query lot balances and consumption history

**File**: `lib/services/lot-traceability.service.ts`

**Interface**:
```typescript
interface LotBalance {
  lotNo: string
  productId: string
  productName: string
  locationId: string
  locationName: string
  lotAtDate: Date
  costPerUnit: Decimal
  totalIn: Decimal
  totalOut: Decimal
  currentBalance: Decimal
  balanceValue: Decimal
  lotAgeDays: number
}

interface LotTransaction {
  transactionDate: Date
  transactionType: string
  transactionId: string
  referenceDocument?: string
  inQty: Decimal
  outQty: Decimal
  costPerUnit: Decimal
  totalCost: Decimal
  runningBalance: Decimal
}

interface LotHistory {
  lot: LotBalance
  transactions: LotTransaction[]
  summary: {
    totalReceived: Decimal
    totalConsumed: Decimal
    currentBalance: Decimal
    transactionCount: number
    firstTransactionDate: Date
    lastTransactionDate: Date
  }
}

class LotTraceabilityService {
  /**
   * Query lot balances with filters
   * @param filters - Product, location, date filters
   * @returns Array of lot balances
   */
  async queryLotBalances(filters: {
    productId?: string
    locationId?: string
    asOfDate?: Date
    includeZeroBalances?: boolean
  }): Promise<LotBalance[]>

  /**
   * Get complete history for a specific lot
   * @param lotNo - Lot number to trace
   * @returns Lot history with all transactions
   */
  async getLotHistory(lotNo: string): Promise<LotHistory>

  /**
   * Get consumption details for a lot
   * @param lotNo - Parent lot number
   * @returns Array of consumption transactions
   */
  async getLotConsumptions(lotNo: string): Promise<LotTransaction[]>
}
```

**Implementation**:

```typescript
import { prisma } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'
import { differenceInDays } from 'date-fns'

export class LotTraceabilityService {
  async queryLotBalances(filters: {
    productId?: string
    locationId?: string
    asOfDate?: Date
    includeZeroBalances?: boolean
  }): Promise<LotBalance[]> {
    const { productId, locationId, asOfDate, includeZeroBalances = false } = filters

    const lots = await prisma.$queryRaw<Array<{
      lot_no: string
      product_id: string
      product_name: string
      location_id: string
      location_name: string
      lot_at_date: Date
      cost_per_unit: Decimal
      total_in: Decimal
      total_out: Decimal
      current_balance: Decimal
      balance_value: Decimal
    }>>`
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
        (SUM(l.in_qty) - SUM(l.out_qty)) * l.cost_per_unit as balance_value
      FROM tb_inventory_transaction_cost_layer l
      INNER JOIN tb_product p ON l.product_id = p.id
      INNER JOIN tb_location loc ON l.location_id = loc.id
      WHERE l.lot_no IS NOT NULL
        AND (${productId}::uuid IS NULL OR l.product_id = ${productId}::uuid)
        AND (${locationId}::uuid IS NULL OR l.location_id = ${locationId}::uuid)
        AND (${asOfDate}::timestamptz IS NULL OR l.lot_at_date <= ${asOfDate}::timestamptz)
      GROUP BY l.lot_no, l.product_id, p.product_name,
               l.location_id, loc.location_name,
               l.lot_at_date, l.cost_per_unit
      HAVING ${includeZeroBalances} OR SUM(l.in_qty) - SUM(l.out_qty) > 0
      ORDER BY l.lot_no ASC
    `

    const currentDate = asOfDate ?? new Date()

    return lots.map(lot => ({
      lotNo: lot.lot_no,
      productId: lot.product_id,
      productName: lot.product_name,
      locationId: lot.location_id,
      locationName: lot.location_name,
      lotAtDate: lot.lot_at_date,
      costPerUnit: lot.cost_per_unit,
      totalIn: lot.total_in,
      totalOut: lot.total_out,
      currentBalance: lot.current_balance,
      balanceValue: lot.balance_value,
      lotAgeDays: differenceInDays(currentDate, lot.lot_at_date)
    }))
  }

  async getLotHistory(lotNo: string): Promise<LotHistory> {
    // Get lot header
    const lot = await this.queryLotBalances({
      productId: undefined,
      locationId: undefined,
      includeZeroBalances: true
    }).then(lots => lots.find(l => l.lotNo === lotNo))

    if (!lot) {
      throw new Error(`Lot not found: ${lotNo}`)
    }

    // Get all transactions for this lot
    const transactions = await prisma.$queryRaw<Array<{
      transaction_date: Date
      transaction_type: string
      transaction_id: string
      reference_document: string | null
      in_qty: Decimal
      out_qty: Decimal
      cost_per_unit: Decimal
      total_cost: Decimal
      running_balance: Decimal
    }>>`
      SELECT
        itd.transaction_date,
        cl.transaction_type,
        itd.transaction_id,
        itd.reference_document,
        cl.in_qty,
        cl.out_qty,
        cl.cost_per_unit,
        cl.total_cost,
        SUM(cl.in_qty - cl.out_qty) OVER (
          PARTITION BY cl.lot_no
          ORDER BY itd.transaction_date, cl.lot_index
        ) as running_balance
      FROM tb_inventory_transaction_cost_layer cl
      INNER JOIN tb_inventory_transaction_detail itd
        ON cl.inventory_transaction_detail_id = itd.id
      WHERE cl.lot_no = ${lotNo}
         OR cl.parent_lot_no = ${lotNo}
      ORDER BY itd.transaction_date ASC, cl.lot_index ASC
    `

    const transactionList: LotTransaction[] = transactions.map(t => ({
      transactionDate: t.transaction_date,
      transactionType: t.transaction_type,
      transactionId: t.transaction_id,
      referenceDocument: t.reference_document ?? undefined,
      inQty: t.in_qty,
      outQty: t.out_qty,
      costPerUnit: t.cost_per_unit,
      totalCost: t.total_cost,
      runningBalance: t.running_balance
    }))

    // Calculate summary
    const summary = {
      totalReceived: lot.totalIn,
      totalConsumed: lot.totalOut,
      currentBalance: lot.currentBalance,
      transactionCount: transactions.length,
      firstTransactionDate: transactions[0]?.transaction_date ?? lot.lotAtDate,
      lastTransactionDate: transactions[transactions.length - 1]?.transaction_date ?? lot.lotAtDate
    }

    return {
      lot,
      transactions: transactionList,
      summary
    }
  }

  async getLotConsumptions(lotNo: string): Promise<LotTransaction[]> {
    const consumptions = await prisma.$queryRaw<Array<{
      transaction_date: Date
      transaction_type: string
      transaction_id: string
      reference_document: string | null
      in_qty: Decimal
      out_qty: Decimal
      cost_per_unit: Decimal
      total_cost: Decimal
      running_balance: Decimal
    }>>`
      SELECT
        itd.transaction_date,
        cl.transaction_type,
        itd.transaction_id,
        itd.reference_document,
        cl.in_qty,
        cl.out_qty,
        cl.cost_per_unit,
        cl.total_cost,
        SUM(cl.in_qty - cl.out_qty) OVER (
          PARTITION BY cl.parent_lot_no
          ORDER BY itd.transaction_date, cl.lot_index
        ) as running_balance
      FROM tb_inventory_transaction_cost_layer cl
      INNER JOIN tb_inventory_transaction_detail itd
        ON cl.inventory_transaction_detail_id = itd.id
      WHERE cl.parent_lot_no = ${lotNo}
      ORDER BY itd.transaction_date ASC, cl.lot_index ASC
    `

    return consumptions.map(c => ({
      transactionDate: c.transaction_date,
      transactionType: c.transaction_type,
      transactionId: c.transaction_id,
      referenceDocument: c.reference_document ?? undefined,
      inQty: c.in_qty,
      outQty: c.out_qty,
      costPerUnit: c.cost_per_unit,
      totalCost: c.total_cost,
      runningBalance: c.running_balance
    }))
  }
}

// Singleton instance
export const lotTraceabilityService = new LotTraceabilityService()
```

---

## Server Actions

### commitGrn (GRN Commitment with Lot Creation)

**File**: `app/(main)/procurement/goods-received-notes/actions.ts`

**Action Signature**:
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { lotGenerationService } from '@/lib/services/lot-generation.service'
import { getCurrentUser } from '@/lib/auth'

interface CommitGrnParams {
  grnId: string
  commitDate: Date
}

interface CommitGrnResult {
  success: boolean
  message: string
  lotsCreated?: string[]
  error?: string
}

export async function commitGrn(
  params: CommitGrnParams
): Promise<CommitGrnResult>
```

**Implementation**:
```typescript
export async function commitGrn(
  params: CommitGrnParams
): Promise<CommitGrnResult> {
  const { grnId, commitDate } = params

  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, message: 'Unauthorized', error: 'USER_NOT_AUTHENTICATED' }
    }

    // Execute in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get GRN with lines
      const grn = await tx.tb_goods_received_note.findUnique({
        where: { id: grnId },
        include: {
          lines: {
            include: {
              product: true
            }
          },
          location: true
        }
      })

      if (!grn) {
        throw new Error('GRN not found')
      }

      if (grn.status !== 'APPROVED') {
        throw new Error('GRN must be in APPROVED status to commit')
      }

      // 2. Validate quantities and costs
      for (const line of grn.lines) {
        if (line.received_qty <= 0) {
          throw new Error(`Invalid quantity for product ${line.product.product_name}`)
        }
        if (line.unit_cost <= 0) {
          throw new Error(`Invalid cost for product ${line.product.product_name}`)
        }
      }

      const lotsCreated: string[] = []

      // 3. Create lot records for each line
      for (const line of grn.lines) {
        // Generate lot number
        const lotResult = await lotGenerationService.generateLotNumber({
          locationCode: grn.location.location_code,
          receiptDate: commitDate,
          productId: line.product_id
        })

        // Create inventory transaction detail
        const transactionDetail = await tx.tb_inventory_transaction_detail.create({
          data: {
            transaction_id: grn.grn_no,
            transaction_type: 'good_received_note',
            transaction_date: commitDate,
            product_id: line.product_id,
            location_id: grn.location_id,
            quantity: line.received_qty,
            unit_cost: line.unit_cost,
            reference_document: grn.purchase_order_no,
            created_by: user.id
          }
        })

        // Create cost layer record (LOT)
        await tx.tb_inventory_transaction_cost_layer.create({
          data: {
            inventory_transaction_detail_id: transactionDetail.id,
            lot_no: lotResult.lotNo,
            lot_index: 1,  // Always 1 for lot creation
            parent_lot_no: null,  // NULL indicates LOT creation
            location_id: grn.location_id,
            location_code: lotResult.locationCode,
            lot_at_date: lotResult.lotAtDate,
            lot_seq_no: lotResult.lotSeqNo,
            product_id: line.product_id,
            transaction_type: 'good_received_note',
            in_qty: line.received_qty,
            out_qty: 0,
            cost_per_unit: line.unit_cost,
            total_cost: line.received_qty * line.unit_cost,
            created_by: user.id
          }
        })

        lotsCreated.push(lotResult.lotNo)
      }

      // 4. Update GRN status
      await tx.tb_goods_received_note.update({
        where: { id: grnId },
        data: {
          status: 'COMMITTED',
          committed_at: commitDate,
          committed_by: user.id,
          updated_at: new Date(),
          updated_by: user.id
        }
      })

      return { lotsCreated }
    })

    // Revalidate paths
    revalidatePath('/procurement/goods-received-notes')
    revalidatePath(`/procurement/goods-received-notes/${grnId}`)

    return {
      success: true,
      message: `GRN committed successfully. ${result.lotsCreated.length} lot(s) created.`,
      lotsCreated: result.lotsCreated
    }
  } catch (error) {
    console.error('Error committing GRN:', error)
    return {
      success: false,
      message: 'Failed to commit GRN',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
```

### saveInventoryAdjustment (Stock-In with Lot Creation)

**File**: `app/(main)/inventory-management/inventory-adjustments/actions.ts`

**Action Signature**:
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { lotGenerationService } from '@/lib/services/lot-generation.service'
import { getCurrentUser } from '@/lib/auth'

interface AdjustmentLine {
  productId: string
  quantity: number  // Positive for stock-in, negative for stock-out
  unitCost: number
  reason: string
  notes?: string
}

interface SaveAdjustmentParams {
  locationId: string
  adjustmentDate: Date
  lines: AdjustmentLine[]
}

interface SaveAdjustmentResult {
  success: boolean
  message: string
  adjustmentId?: string
  lotsCreated?: string[]
  error?: string
}

export async function saveInventoryAdjustment(
  params: SaveAdjustmentParams
): Promise<SaveAdjustmentResult>
```

**Implementation Pattern** (similar to commitGrn - shortened for brevity):
```typescript
export async function saveInventoryAdjustment(
  params: SaveAdjustmentParams
): Promise<SaveAdjustmentResult> {
  const { locationId, adjustmentDate, lines } = params

  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, message: 'Unauthorized', error: 'USER_NOT_AUTHENTICATED' }
    }

    const result = await prisma.$transaction(async (tx) => {
      const lotsCreated: string[] = []

      for (const line of lines) {
        if (line.quantity > 0) {
          // Stock-in: create new lot
          const lotResult = await lotGenerationService.generateLotNumber({
            locationCode: location.location_code,
            receiptDate: adjustmentDate
          })

          // Create LOT record with parent_lot_no = NULL
          // ...

          lotsCreated.push(lotResult.lotNo)
        } else {
          // Stock-out: consume from existing lots using FIFO
          // Call fifoConsumptionService.allocateLots()
          // Create ADJUSTMENT records with parent_lot_no populated
          // ...
        }
      }

      return { lotsCreated }
    })

    revalidatePath('/inventory-management/inventory-adjustments')

    return {
      success: true,
      message: `Adjustment saved. ${result.lotsCreated.length} lot(s) created.`,
      lotsCreated: result.lotsCreated
    }
  } catch (error) {
    // Error handling...
  }
}
```

---

## Type Definitions

### Core Types

**File**: `lib/types/inventory.ts`

```typescript
import { Decimal } from '@prisma/client/runtime/library'

export enum CostingMethod {
  FIFO = 'FIFO',
  PERIODIC_AVERAGE = 'PERIODIC_AVERAGE'
}

export enum TransactionType {
  GOOD_RECEIVED_NOTE = 'good_received_note',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  ISSUE = 'issue',
  ADJUSTMENT = 'adjustment',
  CREDIT_NOTE = 'credit_note',
  CLOSE_PERIOD = 'close_period',
  OPEN_PERIOD = 'open_period'
}

export interface LotRecord {
  id: string
  lotNo: string
  lotIndex: number
  parentLotNo: string | null
  locationId: string
  locationCode: string
  lotAtDate: Date
  lotSeqNo: number
  productId: string
  transactionType: TransactionType
  inQty: Decimal
  outQty: Decimal
  costPerUnit: Decimal
  totalCost: Decimal
  createdAt: Date
  createdBy: string
}

export interface LotBalance {
  lotNo: string
  productId: string
  productName: string
  locationId: string
  locationName: string
  currentBalance: Decimal
  costPerUnit: Decimal
  balanceValue: Decimal
  lotAtDate: Date
  lotAgeDays: number
}

export interface FifoAllocation {
  lotNo: string
  qtyConsumed: Decimal
  costPerUnit: Decimal
  totalCost: Decimal
}
```

---

## Error Handling

### Error Categories

1. **Validation Errors**: Input data validation failures
2. **Business Logic Errors**: Business rule violations
3. **Database Errors**: Constraint violations, deadlocks
4. **System Errors**: Network, timeout, resource exhaustion

### Error Response Format

```typescript
interface ErrorResponse {
  success: false
  message: string           // User-friendly message
  error: string            // Error code or technical details
  validationErrors?: Record<string, string[]>  // Field-level errors
}

interface SuccessResponse<T> {
  success: true
  message: string
  data?: T
}

type ActionResult<T = void> = SuccessResponse<T> | ErrorResponse
```

### Error Handling Patterns

```typescript
try {
  // Business logic
  const result = await performOperation()
  return { success: true, message: 'Operation successful', data: result }
} catch (error) {
  console.error('Operation failed:', error)

  if (error instanceof ValidationError) {
    return {
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      validationErrors: error.fields
    }
  }

  if (error instanceof BusinessRuleError) {
    return {
      success: false,
      message: error.message,
      error: error.code
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return {
        success: false,
        message: 'Duplicate record detected',
        error: 'DUPLICATE_RECORD'
      }
    }
  }

  return {
    success: false,
    message: 'An unexpected error occurred',
    error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
  }
}
```

---

## Performance Optimization

### Database Optimization

**Indexing Strategy**:
```sql
-- Primary indexes (already defined in schema)
CREATE INDEX idx_cost_layer_lot_no ON tb_inventory_transaction_cost_layer(lot_no);
CREATE INDEX idx_cost_layer_parent_lot_no ON tb_inventory_transaction_cost_layer(parent_lot_no);
CREATE INDEX idx_cost_layer_product_location ON tb_inventory_transaction_cost_layer(product_id, location_id);
CREATE INDEX idx_cost_layer_lot_date ON tb_inventory_transaction_cost_layer(lot_at_date);

-- Additional performance indexes
CREATE INDEX idx_cost_layer_balance_query
  ON tb_inventory_transaction_cost_layer(product_id, location_id, lot_no)
  WHERE lot_no IS NOT NULL;

CREATE INDEX idx_cost_layer_fifo_query
  ON tb_inventory_transaction_cost_layer(product_id, location_id, lot_no)
  INCLUDE (in_qty, out_qty, cost_per_unit);
```

**Query Optimization**:
- Use `SELECT` with specific columns instead of `SELECT *`
- Leverage database aggregation (`SUM`, `GROUP BY`) instead of application-level calculation
- Use covering indexes for frequently queried columns
- Implement query result caching for balance queries (React Query with 5-minute TTL)

### Application-Level Optimization

**Batch Operations**:
```typescript
// Good: Batch insert in single transaction
const costLayers = lines.map(line => ({
  // ... cost layer data
}))
await tx.tb_inventory_transaction_cost_layer.createMany({ data: costLayers })

// Bad: Individual inserts
for (const line of lines) {
  await tx.tb_inventory_transaction_cost_layer.create({ data: /* ... */ })
}
```

**Parallel Processing**:
```typescript
// Process independent operations in parallel
const [lotResult, balance] = await Promise.all([
  lotGenerationService.generateLotNumber(/* ... */),
  fifoConsumptionService.getTotalAvailableBalance(/* ... */)
])
```

**Connection Pooling**:
```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Security Considerations

### Authentication & Authorization

**Server Action Security**:
```typescript
export async function commitGrn(params: CommitGrnParams) {
  // 1. Authenticate user
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, message: 'Unauthorized', error: 'USER_NOT_AUTHENTICATED' }
  }

  // 2. Check permission
  const hasPermission = await checkUserPermission(user.id, 'procurement:commit_grn')
  if (!hasPermission) {
    return { success: false, message: 'Access denied', error: 'INSUFFICIENT_PERMISSIONS' }
  }

  // 3. Execute business logic
  // ...
}
```

### Data Validation

**Input Validation with Zod**:
```typescript
import { z } from 'zod'

const commitGrnSchema = z.object({
  grnId: z.string().uuid('Invalid GRN ID'),
  commitDate: z.date().max(new Date(), 'Commit date cannot be in future')
})

export async function commitGrn(params: unknown) {
  // Validate input
  const validationResult = commitGrnSchema.safeParse(params)
  if (!validationResult.success) {
    return {
      success: false,
      message: 'Invalid input',
      error: 'VALIDATION_ERROR',
      validationErrors: validationResult.error.flatten().fieldErrors
    }
  }

  const { grnId, commitDate } = validationResult.data
  // ...
}
```

### SQL Injection Prevention

**Always use Prisma parameterized queries**:
```typescript
// Good: Parameterized query
const lots = await prisma.$queryRaw`
  SELECT * FROM tb_inventory_transaction_cost_layer
  WHERE product_id = ${productId}::uuid
    AND location_id = ${locationId}::uuid
`

// Bad: String interpolation (vulnerable to SQL injection)
const lots = await prisma.$queryRawUnsafe(`
  SELECT * FROM tb_inventory_transaction_cost_layer
  WHERE product_id = '${productId}'
`)
```

---

## Testing Strategy

### Unit Tests

**Service Layer Tests**:
```typescript
// lot-generation.service.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { lotGenerationService } from '@/lib/services/lot-generation.service'
import { prisma } from '@/lib/db'

describe('LotGenerationService', () => {
  beforeEach(async () => {
    // Setup test data
    await prisma.tb_location.create({
      data: { location_code: 'TEST', location_name: 'Test Location' }
    })
  })

  afterEach(async () => {
    // Cleanup
    await prisma.tb_inventory_transaction_cost_layer.deleteMany({
      where: { location_code: 'TEST' }
    })
  })

  describe('generateLotNumber', () => {
    it('should generate lot number with format {LOCATION}-{YYMMDD}-{SEQSEQ}', async () => {
      const result = await lotGenerationService.generateLotNumber({
        locationCode: 'TEST',
        receiptDate: new Date('2025-11-07')
      })

      expect(result.lotNo).toMatch(/^TEST-251107-\d{4}$/)
      expect(result.lotSeqNo).toBe(1)
    })

    it('should increment sequence for same location and date', async () => {
      // Create first lot
      await lotGenerationService.generateLotNumber({
        locationCode: 'TEST',
        receiptDate: new Date('2025-11-07')
      })

      // Create second lot
      const result = await lotGenerationService.generateLotNumber({
        locationCode: 'TEST',
        receiptDate: new Date('2025-11-07')
      })

      expect(result.lotSeqNo).toBe(2)
      expect(result.lotNo).toBe('TEST-251107-0002')
    })

    it('should throw error if sequence exceeds 9999', async () => {
      // Create mock data with sequence 9999
      await prisma.tb_inventory_transaction_cost_layer.create({
        data: {
          lot_no: 'TEST-251107-9999',
          lot_seq_no: 9999,
          location_code: 'TEST',
          lot_at_date: new Date('2025-11-07'),
          // ... other required fields
        }
      })

      // Attempt to generate next lot
      await expect(
        lotGenerationService.generateLotNumber({
          locationCode: 'TEST',
          receiptDate: new Date('2025-11-07')
        })
      ).rejects.toThrow('Daily lot limit (9999) exceeded')
    })
  })
})
```

### Integration Tests

**Server Action Tests**:
```typescript
// commitGrn.test.ts
import { describe, it, expect } from 'vitest'
import { commitGrn } from '@/app/(main)/procurement/goods-received-notes/actions'
import { createMockGrn, createMockUser } from '@/lib/test-utils'

describe('commitGrn', () => {
  it('should create lot records for all GRN lines', async () => {
    const grn = await createMockGrn({
      status: 'APPROVED',
      lines: [
        { product_id: 'product-1', received_qty: 10, unit_cost: 5.0 },
        { product_id: 'product-2', received_qty: 20, unit_cost: 3.5 }
      ]
    })

    const result = await commitGrn({
      grnId: grn.id,
      commitDate: new Date('2025-11-07')
    })

    expect(result.success).toBe(true)
    expect(result.lotsCreated).toHaveLength(2)
    expect(result.lotsCreated[0]).toMatch(/^[A-Z0-9]{2,4}-\d{6}-\d{4}$/)
  })
})
```

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Lot-Based Costing sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/inventory-management/lot-based-costing)']
    CreatePage['Create Page<br>(/inventory-management/lot-based-costing/new)']
    DetailPage["Detail Page<br>(/inventory-management/lot-based-costing/[id])"]
    EditPage["Edit Page<br>(/inventory-management/lot-based-costing/[id]/edit)"]

    %% List Page Tabs
    ListPage --> ListTab1['Tab: All Items']
    ListPage --> ListTab2['Tab: Active']
    ListPage --> ListTab3['Tab: Archived']

    %% List Page Dialogues
    ListPage -.-> ListDialog1['Dialog: Quick Create']
    ListPage -.-> ListDialog2['Dialog: Bulk Actions']
    ListPage -.-> ListDialog3['Dialog: Export']
    ListPage -.-> ListDialog4['Dialog: Filter']

    %% Detail Page Tabs
    DetailPage --> DetailTab1['Tab: Overview']
    DetailPage --> DetailTab2['Tab: History']
    DetailPage --> DetailTab3['Tab: Activity Log']

    %% Detail Page Dialogues
    DetailPage -.-> DetailDialog1['Dialog: Edit']
    DetailPage -.-> DetailDialog2['Dialog: Delete Confirm']
    DetailPage -.-> DetailDialog3['Dialog: Status Change']

    %% Create/Edit Dialogues
    CreatePage -.-> CreateDialog1['Dialog: Cancel Confirm']
    CreatePage -.-> CreateDialog2['Dialog: Save Draft']

    EditPage -.-> EditDialog1['Dialog: Discard Changes']
    EditPage -.-> EditDialog2['Dialog: Save Draft']

    %% Navigation Flow
    ListPage --> DetailPage
    ListPage --> CreatePage
    DetailPage --> EditPage
    CreatePage --> DetailPage
    EditPage --> DetailPage

    style ListPage fill:#e1f5ff
    style CreatePage fill:#fff4e1
    style DetailPage fill:#e8f5e9
    style EditPage fill:#fce4ec
```

### Pages

#### 1. List Page
**Route**: `/inventory-management/lot-based-costing`
**File**: `page.tsx`
**Purpose**: Display paginated list of all lots

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all lots
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/inventory-management/lot-based-costing/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive lot details

**Sections**:
- Header: Breadcrumbs, lot title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change lot status with reason

#### 3. Create Page
**Route**: `/inventory-management/lot-based-costing/new`
**File**: `new/page.tsx`
**Purpose**: Create new lot

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/inventory-management/lot-based-costing/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing lot

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## Deployment Considerations

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/carmen"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://carmen.example.com"

# Logging
LOG_LEVEL="info"
LOG_SQL_QUERIES="false"

# Performance
DATABASE_CONNECTION_POOL_SIZE="10"
```

### Database Migrations

**Migration Workflow**:
1. Develop schema changes locally
2. Generate migration: `npx prisma migrate dev --name add_lot_costing`
3. Review migration SQL
4. Test migration on staging database
5. Apply to production: `npx prisma migrate deploy`

### Monitoring

**Key Metrics to Monitor**:
- Lot generation rate (lots/minute)
- FIFO allocation time (ms/operation)
- Database query performance (slow query log)
- Error rate by error type
- API response times (p50, p95, p99)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-07 | System | Initial technical specification with 4-digit lot sequence |

---

**Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Technical Lead | | | |
| Database Administrator | | | |
| DevOps Lead | | | |
| Security Officer | | | |
