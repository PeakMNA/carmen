# Data Schema: Stock Issues View

## 1. Overview

**KEY ARCHITECTURE**: Stock Issues are NOT separate documents. They are **filtered views** of Store Requisitions at the Issue stage with DIRECT type destinations.

- **No separate StockIssue entity** - data comes from StoreRequisition
- **No separate StockIssueItem entity** - data comes from StoreRequisitionItem
- **No IssueStatus enum** - uses SRStatus from Store Requisition
- **Department required** - DIRECT destinations require department for expense allocation

## 2. Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      Stock Issues View - Data Model                             │
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
          │                            │                    │ departmentId     │
          │                            │                    │ expenseAccountId │
          │                            │                    └──────────────────┘
          ▼                            ▼                            │
  ┌──────────────────┐         ┌──────────────────┐                │
  │  StockBalance    │         │   Department     │◄───────────────┤
  ├──────────────────┤         ├──────────────────┤                │
  │ productId        │         │ id               │                │
  │ locationId       │         │ name             │                │
  │ quantity         │         │ code             │                ▼
  │ reservedQty      │         │ isActive         │         ┌──────────────────┐
  │ availableQty     │         └──────────────────┘         │StoreRequisition  │
  │ lastUpdated      │                                      │     Item         │
  └──────────────────┘         ┌─ ─ ─ ─ ─ ─ ─ ─ ─┐        ├──────────────────┤
                                   STOCK ISSUE            │ id               │
                               │       VIEW       │        │ requisitionId    │
                                     (Filter)              │ productId        │
                               │                  │        │ requestedQty     │
                               │ stage = 'issue'  │        │ approvedQty      │
                               │ OR 'complete'    │        │ issuedQty        │
                               │       AND        │        │ unitCost         │
                               │ destLocationType │        │ totalCost        │
                               │ = 'DIRECT'       │        └──────────────────┘
                               └─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

## 3. Source Entity: StoreRequisition

Stock Issues view uses StoreRequisition as the source data, filtered by stage and destination type.

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
  destinationLocationType: InventoryLocationType  // DIRECT for issues

  // Department (required for DIRECT destinations)
  departmentId?: string                   // FK to Department
  departmentName?: string                 // Department name (denormalized)

  // Expense Account (optional)
  expenseAccountId?: string               // FK to ExpenseAccount
  expenseAccountName?: string             // Expense account name (denormalized)

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

// Department (referenced)
interface Department {
  id: string
  name: string
  code: string
  isActive: boolean
  defaultExpenseAccountId?: string
}

// Expense Account (referenced)
interface ExpenseAccount {
  id: string
  name: string
  code: string
  isActive: boolean
  accountType: string
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

### 4.1 Stock Issue View Filter

Stock Issues are SRs that match these criteria:

```typescript
// Filter function to identify SRs that appear in Stock Issue view
const isStockIssue = (sr: StoreRequisition): boolean => {
  return (
    // Must be at Issue or Complete stage
    (sr.stage === SRStage.Issue || sr.stage === SRStage.Complete) &&
    // Destination must be DIRECT type
    sr.destinationLocationType === InventoryLocationType.DIRECT
  )
}
```

### 4.2 View vs Entity Comparison

| Aspect | Previous (Entity) | Current (View) |
|--------|-------------------|----------------|
| Document | StockIssue | StoreRequisition (filtered) |
| Line Items | StockIssueItem | StoreRequisitionItem |
| Reference | SI-YYMM-NNNN | SR-YYMM-NNNN |
| Status | IssueStatus (3 values) | SRStatus (5 values) |
| Data Storage | mockStockIssues | mockStoreRequisitions (filtered) |

## 5. Data Relationships

### 5.1 Key Relationships

| From Entity | To Entity | Relationship | Description |
|-------------|-----------|--------------|-------------|
| StoreRequisition | InventoryLocation (source) | Many-to-One | Source location |
| StoreRequisition | InventoryLocation (dest) | Many-to-One | Destination location |
| StoreRequisition | Department | Many-to-One | Department for expense |
| StoreRequisition | ExpenseAccount | Many-to-One | Expense account (optional) |
| StoreRequisition | StoreRequisitionItem | One-to-Many | Line items |
| StoreRequisitionItem | Product | Many-to-One | Product reference |

### 5.2 View Relationship

```
StoreRequisition
       │
       │ Filter: stage IN ('issue', 'complete')
       │         AND destinationLocationType = 'DIRECT'
       ▼
Stock Issue View (Read-Only)
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

## 7. Query Patterns

### 7.1 Get Issues (Filter SRs)

```typescript
// Get all stock issues (from SR data)
function getStockIssues(srs: StoreRequisition[]): StoreRequisition[] {
  return srs.filter(sr =>
    (sr.stage === SRStage.Issue || sr.stage === SRStage.Complete) &&
    sr.destinationLocationType === InventoryLocationType.DIRECT
  )
}

// Get active issues
function getActiveIssues(srs: StoreRequisition[]): StoreRequisition[] {
  return getStockIssues(srs).filter(sr => sr.status === SRStatus.InProgress)
}

// Get completed issues
function getCompletedIssues(srs: StoreRequisition[]): StoreRequisition[] {
  return getStockIssues(srs).filter(sr => sr.status === SRStatus.Completed)
}

// Get issues by department
function getIssuesByDepartment(srs: StoreRequisition[], deptId: string): StoreRequisition[] {
  return getStockIssues(srs).filter(sr => sr.departmentId === deptId)
}
```

### 7.2 API Endpoints (Use SR Endpoints)

| Action | Purpose | Endpoint |
|--------|---------|----------|
| List Issues | Filter SR list | `GET /api/store-requisitions?stage=issue,complete&destType=DIRECT` |
| Get Issue | Get SR by ID | `GET /api/store-requisitions/:id` |
| Complete | Complete SR | `POST /api/store-requisitions/:id/complete` |

## 8. Data Validation Rules

### 8.1 SR Validation (Applies to Issues)

| Field | Rule | Error Message |
|-------|------|---------------|
| refNo | Pattern: SR-YYMM-NNNN | Invalid reference number format |
| status | Valid SRStatus enum | Invalid status |
| stage | Valid SRStage enum | Invalid stage |
| sourceLocationType | Must be INVENTORY | Source must be INVENTORY location |
| destinationLocationType | Must be DIRECT | Destination must be DIRECT location |
| departmentId | NOT NULL for DIRECT | Department is required |
| items | length > 0 | At least one item required |

### 8.2 SR Item Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| requestedQty | > 0 | Requested quantity must be positive |
| approvedQty | >= 0 AND <= requestedQty | Invalid approved quantity |
| issuedQty | >= 0 AND <= approvedQty | Invalid issued quantity |
| unitCost | >= 0 | Unit cost cannot be negative |

## 9. Sample Data (SR Format)

### 9.1 Sample SR (Appears in Issue View)

```typescript
const sampleIssueSR: StoreRequisition = {
  id: 'sr-004',
  refNo: 'SR-2412-004',
  status: SRStatus.InProgress,
  stage: SRStage.Issue,

  // Source Location (From)
  sourceLocationId: 'loc-004',
  sourceLocationCode: 'WH-001',
  sourceLocationName: 'Main Warehouse',
  sourceLocationType: InventoryLocationType.INVENTORY,

  // Destination Location (To) - DIRECT type = Issue
  destinationLocationId: 'loc-bar-direct',
  destinationLocationCode: 'BAR-001',
  destinationLocationName: 'Restaurant Bar Direct',
  destinationLocationType: InventoryLocationType.DIRECT,

  // Department (required for DIRECT)
  departmentId: 'dept-003',
  departmentName: 'Food & Beverage',

  // Expense Account (optional)
  expenseAccountId: 'exp-fnb-001',
  expenseAccountName: 'F&B Cost - Bar',

  items: [
    {
      id: 'sri-004-01',
      requisitionId: 'sr-004',
      productId: 'product-wine-001',
      productCode: 'BEV-WIN-001',
      productName: 'House Red Wine',
      unit: 'bottle',
      requestedQty: 12,
      approvedQty: 12,
      issuedQty: 12,
      unitCost: { amount: 15.00, currency: 'USD' },
      totalCost: { amount: 180.00, currency: 'USD' }
    }
  ],

  totalItems: 1,
  totalQuantity: 12,
  estimatedValue: { amount: 180.00, currency: 'USD' },
  requiredDate: new Date('2024-12-12'),

  // Issue tracking
  issuedAt: new Date('2024-12-12T16:00:00'),
  issuedBy: 'Warehouse Staff',

  createdAt: new Date('2024-12-12'),
  createdBy: 'system'
}
```

## 10. Stock Movement (Immediate Expense on Issue)

### 10.1 Movement Rules

| Event | Source Location Impact | Destination Impact | Expense Impact |
|-------|------------------------|-------------------|----------------|
| SR → Issue Stage | Deduct issuedQty | None (DIRECT) | Create expense entry |
| SR → Complete | No additional change | No additional change | No additional change |

**Note**: Stock issued to DIRECT locations is immediately expensed. There is no inventory tracking at DIRECT locations.

### 10.2 Expense Recording

```typescript
// Expense entry created when SR reaches Issue stage with DIRECT destination
interface ExpenseEntry {
  id: string
  amount: Money
  departmentId: string
  departmentName: string
  expenseAccountId: string
  expenseAccountName: string
  sourceDocumentType: 'SR'
  sourceDocumentId: string
  sourceDocumentRefNo: string
  createdAt: Date
}
```

## 11. Removed Fields (Previous Architecture)

The following fields have been **removed** as Stock Issues are now views, not entities:

| Field | Previous Purpose | Current Status |
|-------|------------------|----------------|
| `issueId` | Primary key for SI | Uses SR `id` |
| `refNo` (SI-YYMM-NNNN) | SI reference | Uses SR `refNo` (SR-YYMM-NNNN) |
| `IssueStatus` | SI-specific status | Uses `SRStatus` |
| `issueDate` | SI creation date | Uses SR `requiredDate` |

## 12. Migration Notes

### 12.1 Data Migration (if needed)

```typescript
// Convert legacy StockIssue to SR view pattern
// No actual migration needed - just filter existing SR data

// Legacy query (deprecated)
// SELECT * FROM stock_issue WHERE status = 'pending'

// New query (use SR with filter)
// SELECT * FROM store_requisition
// WHERE stage IN ('issue', 'complete')
// AND destination_location_type = 'DIRECT'
```

### 12.2 Code Migration

- Remove imports of `IssueStatus`, `StockIssue`, `StockIssueItem`
- Replace with `SRStatus`, `SRStage`, `StoreRequisition`, `StoreRequisitionItem`
- Update queries to filter SR data instead of querying separate SI table
