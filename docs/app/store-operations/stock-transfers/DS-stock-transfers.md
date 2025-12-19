# Data Schema: Stock Transfers View

## 1. Overview

**KEY ARCHITECTURE**: Stock Transfers are NOT separate documents. They are **filtered views** of Store Requisitions at the Issue stage with INVENTORY type destinations.

- **No separate StockTransfer entity** - data comes from StoreRequisition
- **No separate StockTransferItem entity** - data comes from StoreRequisitionItem
- **No TransferStatus enum** - uses SRStatus from Store Requisition
- **No receipt process** - stock movement is immediate when SR reaches Issue stage

## 2. Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                   Stock Transfers View - Data Model                             │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
  │    Product       │         │InventoryLocation │         │ StoreRequisition │
  ├──────────────────┤         ├──────────────────┤         ├──────────────────┤
  │ id               │◄───────►│ id               │◄───────►│ id               │
  │ code             │         │ name             │         │ refNo            │
  │ name             │         │ code             │         │ status           │
  │ categoryId       │         │ type             │         │ stage            │
  │ unit             │         │ isActive         │         │ sourceLocationId │
  └──────────────────┘         └──────────────────┘         │ destLocationId   │
          │                            │                    │ destLocationType │
          │                            │                    └──────────────────┘
          │                            │                            │
          ▼                            ▼                            ▼
  ┌──────────────────┐                                     ┌──────────────────┐
  │  StockBalance    │                                     │StoreRequisition  │
  ├──────────────────┤         ┌─ ─ ─ ─ ─ ─ ─ ─ ─┐        │     Item         │
  │ productId        │             STOCK TRANSFER          ├──────────────────┤
  │ locationId       │         │       VIEW       │        │ id               │
  │ quantity         │               (Filter)              │ requisitionId    │
  │ reservedQty      │         │                  │        │ productId        │
  │ availableQty     │         │ stage = 'issue'  │        │ requestedQty     │
  │ lastUpdated      │         │ OR 'complete'    │        │ approvedQty      │
  └──────────────────┘         │       AND        │        │ issuedQty        │
                               │ destLocationType │        │ unitCost         │
                               │ = 'INVENTORY'    │        │ totalCost        │
                               └─ ─ ─ ─ ─ ─ ─ ─ ─┘        └──────────────────┘
```

## 3. Source Entity: StoreRequisition

Stock Transfers view uses StoreRequisition as the source data, filtered by stage and destination type.

### 3.1 StoreRequisition (Source Entity)

```typescript
interface StoreRequisition {
  // Document Identity
  id: string                              // Primary key (UUID)
  refNo: string                           // Document reference: SR-YYMM-NNNN

  // Status & Stage
  status: SRStatus                        // Current status
  stage: SRStage                          // Current workflow stage

  // Source Location (From)
  sourceLocationId: string                // FK to InventoryLocation
  sourceLocationCode: string              // Location code (denormalized)
  sourceLocationName: string              // Location name (denormalized)
  sourceLocationType: InventoryLocationType // Must be INVENTORY

  // Destination Location (To)
  destinationLocationId: string           // FK to InventoryLocation
  destinationLocationCode: string         // Location code (denormalized)
  destinationLocationName: string         // Location name (denormalized)
  destinationLocationType: InventoryLocationType  // INVENTORY for transfers

  // Line Items
  items: StoreRequisitionItem[]           // SR line items

  // Totals
  totalItems: number                      // Count of line items
  totalQuantity: number                   // Sum of quantities
  estimatedValue: Money                   // Total estimated value

  // Dates
  requiredDate: Date                      // Required date

  // Issue Tracking (populated at Issue stage)
  issuedAt?: Date                         // When stock was issued
  issuedBy?: string                       // Who issued the stock

  // Audit Fields
  createdAt: Date                         // Creation timestamp
  createdBy: string                       // Created by user
  updatedAt?: Date                        // Last update timestamp
  updatedBy?: string                      // Last updated by user
}
```

### 3.2 Status and Stage Enums

```typescript
// SR Status (5 values)
enum SRStatus {
  Draft = 'draft',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Voided = 'voided'
}

// SR Workflow Stage (5 stages)
enum SRStage {
  Draft = 'draft',
  Submit = 'submit',
  Approve = 'approve',
  Issue = 'issue',
  Complete = 'complete'
}

// Status Labels
const SR_STATUS_LABELS: Record<SRStatus, string> = {
  [SRStatus.Draft]: 'Draft',
  [SRStatus.InProgress]: 'In Progress',
  [SRStatus.Completed]: 'Completed',
  [SRStatus.Cancelled]: 'Cancelled',
  [SRStatus.Voided]: 'Voided'
}
```

### 3.3 StoreRequisitionItem (Line Items)

```typescript
interface StoreRequisitionItem {
  // Identity
  id: string                              // Line item ID
  requisitionId: string                   // FK to StoreRequisition

  // Product Reference
  productId: string                       // FK to Product
  productCode: string                     // Product SKU (denormalized)
  productName: string                     // Product name (denormalized)
  unit: string                            // Unit of measure

  // Quantities
  requestedQty: number                    // Originally requested quantity
  approvedQty: number                     // Approved quantity
  issuedQty: number                       // Quantity issued

  // Costing
  unitCost: Money                         // Cost per unit
  totalCost: Money                        // issuedQty × unitCost

  // Notes
  notes?: string                          // Line item notes
}
```

### 3.4 Supporting Types

```typescript
// Money type for consistent currency handling
interface Money {
  amount: number
  currency: string                        // ISO 4217 currency code
}

// Inventory Location (referenced)
interface InventoryLocation {
  id: string
  name: string
  code: string
  type: InventoryLocationType
  isActive: boolean
}

enum InventoryLocationType {
  INVENTORY = 'INVENTORY',
  DIRECT = 'DIRECT',
  CONSIGNMENT = 'CONSIGNMENT'
}
```

## 4. View Definition (Filter Logic)

### 4.1 Stock Transfer View Filter

Stock Transfers are SRs that match these criteria:

```typescript
// Filter function to identify SRs that appear in Stock Transfer view
const isStockTransfer = (sr: StoreRequisition): boolean => {
  return (
    // Must be at Issue or Complete stage
    (sr.stage === SRStage.Issue || sr.stage === SRStage.Complete) &&
    // Destination must be INVENTORY type
    sr.destinationLocationType === InventoryLocationType.INVENTORY
  )
}
```

### 4.2 View vs Entity Comparison

| Aspect | Previous (Entity) | Current (View) |
|--------|-------------------|----------------|
| Document | StockTransfer | StoreRequisition (filtered) |
| Line Items | StockTransferItem | StoreRequisitionItem |
| Reference | ST-YYMM-NNNN | SR-YYMM-NNNN |
| Status | TransferStatus (5 values) | SRStatus (5 values) |
| Receipt | receivedAt, receivedBy, receivedQty | **Removed** |
| Data Storage | mockStockTransfers | mockStoreRequisitions (filtered) |

## 5. Data Relationships

### 5.1 Key Relationships

| From Entity | To Entity | Relationship | Description |
|-------------|-----------|--------------|-------------|
| StoreRequisition | InventoryLocation (source) | Many-to-One | Source location |
| StoreRequisition | InventoryLocation (dest) | Many-to-One | Destination location |
| StoreRequisition | StoreRequisitionItem | One-to-Many | Line items |
| StoreRequisitionItem | Product | Many-to-One | Product reference |

### 5.2 View Relationship

```
StoreRequisition
       │
       │ Filter: stage IN ('issue', 'complete')
       │         AND destinationLocationType = 'INVENTORY'
       ▼
Stock Transfer View (Read-Only)
       │
       │ Actions performed on SR, not view
       ▼
Store Requisition Detail Page
```

## 6. Computed Fields

### 6.1 Calculations (from SR Items)

```typescript
// Calculate total items
function calculateTotalItems(items: StoreRequisitionItem[]): number {
  return items.length
}

// Calculate total quantity (uses issued quantity)
function calculateTotalQuantity(items: StoreRequisitionItem[]): number {
  return items.reduce((sum, item) => sum + item.issuedQty, 0)
}

// Calculate total value
function calculateTotalValue(items: StoreRequisitionItem[]): Money {
  const total = items.reduce((sum, item) => sum + item.totalCost.amount, 0)
  return { amount: total, currency: 'USD' }
}
```

### 6.2 No Variance Calculation

**Removed**: Receipt variance calculation (`issuedQty - receivedQty`) is no longer applicable as there is no receipt process for transfers.

## 7. Query Patterns

### 7.1 Get Transfers (Filter SRs)

```typescript
// Get all stock transfers (from SR data)
function getStockTransfers(srs: StoreRequisition[]): StoreRequisition[] {
  return srs.filter(sr =>
    (sr.stage === SRStage.Issue || sr.stage === SRStage.Complete) &&
    sr.destinationLocationType === InventoryLocationType.INVENTORY
  )
}

// Get active transfers
function getActiveTransfers(srs: StoreRequisition[]): StoreRequisition[] {
  return getStockTransfers(srs).filter(sr => sr.status === SRStatus.InProgress)
}

// Get completed transfers
function getCompletedTransfers(srs: StoreRequisition[]): StoreRequisition[] {
  return getStockTransfers(srs).filter(sr => sr.status === SRStatus.Completed)
}
```

### 7.2 API Endpoints (Use SR Endpoints)

| Action | Purpose | Endpoint |
|--------|---------|----------|
| List Transfers | Filter SR list | `GET /api/store-requisitions?stage=issue,complete&destType=INVENTORY` |
| Get Transfer | Get SR by ID | `GET /api/store-requisitions/:id` |
| Complete | Complete SR | `POST /api/store-requisitions/:id/complete` |

## 8. Data Validation Rules

### 8.1 SR Validation (Applies to Transfers)

| Field | Rule | Error Message |
|-------|------|---------------|
| refNo | Pattern: SR-YYMM-NNNN | Invalid reference number format |
| status | Valid SRStatus enum | Invalid status |
| stage | Valid SRStage enum | Invalid stage |
| sourceLocationType | Must be INVENTORY | Source must be INVENTORY location |
| destinationLocationType | Must be INVENTORY | Destination must be INVENTORY location |
| sourceLocationId | != destinationLocationId | Source and destination must differ |
| items | length > 0 | At least one item required |

### 8.2 SR Item Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| requestedQty | > 0 | Requested quantity must be positive |
| approvedQty | >= 0 AND <= requestedQty | Invalid approved quantity |
| issuedQty | >= 0 AND <= approvedQty | Invalid issued quantity |
| unitCost | >= 0 | Unit cost cannot be negative |

## 9. Sample Data (SR Format)

### 9.1 Sample SR (Appears in Transfer View)

```typescript
const sampleTransferSR: StoreRequisition = {
  id: 'sr-001',
  refNo: 'SR-2412-001',
  status: SRStatus.InProgress,
  stage: SRStage.Issue,

  // Source Location (From)
  sourceLocationId: 'loc-004',
  sourceLocationCode: 'WH-001',
  sourceLocationName: 'Main Warehouse',
  sourceLocationType: InventoryLocationType.INVENTORY,

  // Destination Location (To) - INVENTORY type = Transfer
  destinationLocationId: 'loc-003',
  destinationLocationCode: 'CK-001',
  destinationLocationName: 'Central Kitchen',
  destinationLocationType: InventoryLocationType.INVENTORY,

  items: [
    {
      id: 'sri-001-01',
      requisitionId: 'sr-001',
      productId: 'product-001',
      productCode: 'OIL-OLIVE-001',
      productName: 'Premium Olive Oil',
      unit: 'bottle',
      requestedQty: 10,
      approvedQty: 10,
      issuedQty: 10,
      unitCost: { amount: 8.50, currency: 'USD' },
      totalCost: { amount: 85.00, currency: 'USD' }
    }
  ],

  totalItems: 1,
  totalQuantity: 10,
  estimatedValue: { amount: 85.00, currency: 'USD' },
  requiredDate: new Date('2024-12-01'),

  // Issue tracking
  issuedAt: new Date('2024-12-01T09:00:00'),
  issuedBy: 'Warehouse Staff',

  createdAt: new Date('2024-12-01'),
  createdBy: 'system'
}
```

## 10. Stock Movement (Immediate on Issue)

### 10.1 Movement Rules

| Event | Source Location Impact | Destination Location Impact |
|-------|------------------------|----------------------------|
| SR → Issue Stage | Deduct issuedQty | Add issuedQty |
| SR → Complete | No additional change | No additional change |

**Note**: Stock movement is immediate when SR reaches Issue stage. There is no transit state or receipt process.

### 10.2 No State Machine

**Previous Architecture** had a state machine:
```
Pending → Issued → InTransit → Received → (Complete)
```

**Current Architecture**: No separate state machine. SR workflow handles all states:
```
SR Draft → Submit → Approve → Issue → Complete
                               │
                    Stock moves immediately
                    (no transit, no receipt)
```

## 11. Removed Fields (Previous Architecture)

The following fields have been **removed** as Stock Transfers are now views, not entities:

| Field | Previous Purpose | Current Status |
|-------|------------------|----------------|
| `transferId` | Primary key for ST | Uses SR `id` |
| `refNo` (ST-YYMM-NNNN) | ST reference | Uses SR `refNo` (SR-YYMM-NNNN) |
| `TransferStatus` | ST-specific status | Uses `SRStatus` |
| `receivedAt` | Receipt timestamp | **Removed** |
| `receivedBy` | Receipt user | **Removed** |
| `receivedQty` | Received quantity | **Removed** |
| `priority` | Transfer priority | Uses SR priority (if needed) |
| `notes` (ST level) | Transfer notes | Uses SR notes |

## 12. Migration Notes

### 12.1 Data Migration (if needed)

```typescript
// Convert legacy StockTransfer to SR view pattern
// No actual migration needed - just filter existing SR data

// Legacy query (deprecated)
// SELECT * FROM stock_transfer WHERE status = 'in_transit'

// New query (use SR with filter)
// SELECT * FROM store_requisition
// WHERE stage IN ('issue', 'complete')
// AND destination_location_type = 'INVENTORY'
```

### 12.2 Code Migration

- Remove imports of `TransferStatus`, `StockTransfer`, `StockTransferItem`
- Replace with `SRStatus`, `SRStage`, `StoreRequisition`, `StoreRequisitionItem`
- Update queries to filter SR data instead of querying separate ST table
