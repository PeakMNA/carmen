# Technical Specification: Stock Transfers View

## 1. Overview

### 1.1 Module Purpose

**KEY ARCHITECTURE**: Stock Transfers are NOT separate documents. They are **filtered views** of Store Requisitions at the Issue stage with INVENTORY type destinations.

The Stock Transfers view displays Store Requisitions that are being issued to INVENTORY locations, providing a specialized read-only interface for tracking inventory movements between locations.

### 1.2 Technical Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Shadcn/ui
- **State**: React hooks (useState, useMemo, useCallback)
- **Icons**: Lucide React

### 1.3 File Structure
```
app/(main)/store-operations/stock-transfers/
├── page.tsx                    # List page - Filtered SR listing
└── [id]/
    └── page.tsx                # Detail page - SR detail in "transfer" layout
```

## 2. Core Components

### 2.1 List Page (`page.tsx`)

**Purpose**: Display filtered Store Requisitions at Issue stage with INVENTORY destinations

**Key Features**:
- Summary cards (Total Transfers, Active, Completed, Total Value)
- Search by SR reference number, location names
- Status filter (all, active, completed)
- Sortable columns with pagination
- Read-only view (no action buttons)

**State Management**:
```typescript
import { mockStoreRequisitions } from '@/lib/mock-data'
import { SRStatus, SRStage, InventoryLocationType } from '@/lib/types'

// Filter states
const [searchQuery, setSearchQuery] = useState('')
const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all')

// Sort state
const [sortConfig, setSortConfig] = useState<{
  field: 'refNo' | 'requiredDate' | 'totalValue'
  direction: 'asc' | 'desc'
}>({ field: 'requiredDate', direction: 'desc' })

// Computed values - Filter SRs for transfer view
const filteredTransfers = useMemo(() => {
  return mockStoreRequisitions
    .filter(sr => {
      // Must be at Issue or Complete stage
      const isTransferStage = sr.stage === SRStage.Issue || sr.stage === SRStage.Complete

      // Destination must be INVENTORY type
      const isInventoryDestination = sr.destinationLocationType === InventoryLocationType.INVENTORY

      if (!isTransferStage || !isInventoryDestination) return false

      // Search filter
      const matchesSearch = searchQuery === '' ||
        sr.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sr.sourceLocationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sr.destinationLocationName.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter (maps to SR status)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && sr.status === SRStatus.InProgress) ||
        (statusFilter === 'completed' && sr.status === SRStatus.Completed)

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => { /* sorting logic */ })
}, [searchQuery, statusFilter, sortConfig])
```

**UI Components**:
- `<Card>` - Summary statistics
- `<Input>` - Search field with Search icon
- `<Select>` - Status filter (All, Active, Completed)
- `<Table>` - Transfers list with sortable headers
- `<Badge>` - Status indicators
- `<Button>` - Navigation to detail page (View)

**Status Badge Classes**:
```typescript
const getStatusBadgeClass = (status: SRStatus): string => {
  switch (status) {
    case SRStatus.Completed: return 'bg-green-100 text-green-800 border-green-200'
    case SRStatus.InProgress: return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}
```

### 2.2 Detail Page (`[id]/page.tsx`)

**Purpose**: Display SR detail in "transfer" layout (read-only)

**Key Features**:
- Header with SR reference, status badge
- Read-only view (no action buttons except Print and "View Full SR")
- Location cards (From: Source INVENTORY, To: Destination INVENTORY)
- Transfer summary card
- Items table with quantity tracking
- Link to source Store Requisition

**Key Interface**:
```typescript
interface StockTransferDetailProps {
  params: { id: string }
}

// Load StoreRequisition by ID
const sr = mockStoreRequisitions.find(r => r.id === params.id)

// Validate it's a valid transfer (Issue/Complete stage with INVENTORY destination)
const isValidTransfer = sr &&
  (sr.stage === SRStage.Issue || sr.stage === SRStage.Complete) &&
  sr.destinationLocationType === InventoryLocationType.INVENTORY

// Display states
const isCompleted = sr?.status === SRStatus.Completed
```

**UI Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│ [Back] Stock Transfer Detail                                     │
│                                                                 │
│ SR-2412-001                               [View Full SR] [Print] │
│ [In Progress Badge]                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────┐  ┌─────────────────┐  ┌─────────────┐          │
│ │ From        │  │ Transfer Summary│  │ To          │          │
│ │ Location    │  │                 │  │ Location    │          │
│ │             │  │ Items: 2        │  │             │          │
│ │ Main        │  │ Quantity: 35    │  │ Central     │          │
│ │ Warehouse   │  │ Value: $137.50  │  │ Kitchen     │          │
│ │ [WH-001]    │  │                 │  │ [CK-001]    │          │
│ │ INVENTORY   │  │                 │  │ INVENTORY   │          │
│ └─────────────┘  └─────────────────┘  └─────────────┘          │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Items                                                       │ │
│ ├──────────┬────────────────┬──────┬─────┬─────────┬─────────┤ │
│ │ Code     │ Product        │ Unit │ Req │ Approved│ Issued  │ │
│ ├──────────┼────────────────┼──────┼─────┼─────────┼─────────┤ │
│ │ OIL-001  │ Olive Oil      │ btl  │ 10  │ 10      │ 10      │ │
│ │ DRY-003  │ All-Purp Flour │ kg   │ 25  │ 25      │ 25      │ │
│ └──────────┴────────────────┴──────┴─────┴─────────┴─────────┘ │
│                                                                 │
│ Tracking Information:                                           │
│ Issued At: Dec 1, 2024 9:00 AM by Warehouse Staff              │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Type Definitions

### 3.1 Core Types (from `lib/types/store-requisition.ts`)

**Note**: Stock Transfers do NOT have separate types. They use Store Requisition types.

```typescript
// SR Status Enum (5 values)
enum SRStatus {
  Draft = 'draft',
  InProgress = 'in_progress',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Voided = 'voided'
}

// SR Stage Enum (5 stages)
enum SRStage {
  Draft = 'draft',
  Submit = 'submit',
  Approve = 'approve',
  Issue = 'issue',
  Complete = 'complete'
}

// SR Status Labels
const SR_STATUS_LABELS: Record<SRStatus, string> = {
  [SRStatus.Draft]: 'Draft',
  [SRStatus.InProgress]: 'In Progress',
  [SRStatus.Completed]: 'Completed',
  [SRStatus.Cancelled]: 'Cancelled',
  [SRStatus.Voided]: 'Voided'
}

// Location Type
enum InventoryLocationType {
  INVENTORY = 'INVENTORY',
  DIRECT = 'DIRECT',
  CONSIGNMENT = 'CONSIGNMENT'
}

// Store Requisition (used for transfers)
interface StoreRequisition {
  id: string
  refNo: string                           // SR-YYMM-NNNN
  status: SRStatus
  stage: SRStage
  // Source location (From)
  sourceLocationId: string
  sourceLocationCode: string
  sourceLocationName: string
  sourceLocationType: InventoryLocationType
  // Destination location (To)
  destinationLocationId: string
  destinationLocationCode: string
  destinationLocationName: string
  destinationLocationType: InventoryLocationType  // INVENTORY for transfers
  // Line items
  items: StoreRequisitionItem[]
  // Totals
  totalItems: number
  totalQuantity: number
  estimatedValue: Money
  // Dates
  requiredDate: Date
  // Issue tracking
  issuedAt?: Date
  issuedBy?: string
  // Audit fields
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
}

// Store Requisition Line Item
interface StoreRequisitionItem {
  id: string
  requisitionId: string
  // Product reference
  productId: string
  productCode: string
  productName: string
  unit: string
  // Quantities
  requestedQty: number
  approvedQty: number
  issuedQty: number
  // Costing
  unitCost: Money
  totalCost: Money
  // Notes
  notes?: string
}
```

### 3.2 Transfer View is SR Filtering

```typescript
// What makes an SR appear in Stock Transfer view:
const isStockTransfer = (sr: StoreRequisition): boolean => {
  return (
    (sr.stage === SRStage.Issue || sr.stage === SRStage.Complete) &&
    sr.destinationLocationType === InventoryLocationType.INVENTORY
  )
}
```

## 4. Data Flow

### 4.1 No Separate Transfer Entity

Stock Transfers are NOT created as separate documents. When an SR reaches the Issue stage:
1. If destination is INVENTORY → appears in Stock Transfer view
2. If destination is DIRECT → appears in Stock Issue view

### 4.2 View Flow

```
Store Requisition Lifecycle
    │
    ├─► Draft
    │
    ├─► Submit
    │
    ├─► Approve
    │
    ├─► Issue ──────────────────────────────────────────┐
    │       │                                            │
    │       ├── destinationLocationType = INVENTORY     │
    │       │   └── Appears in Stock Transfer View      │
    │       │                                            │
    │       └── destinationLocationType = DIRECT        │
    │           └── Appears in Stock Issue View         │
    │                                                    │
    └─► Complete ───────────────────────────────────────┘
```

### 4.3 Navigate to SR for Actions

All workflow actions are performed on the underlying SR, not on the transfer view:

```typescript
// In transfer detail page, link to full SR
const handleViewFullSR = () => {
  router.push(`/store-operations/store-requisitions/${sr.id}`)
}

// Actions available on SR at Issue stage:
// - Complete (advances SR to Complete stage)
// - Print
// - View history
```

## 5. API Endpoints

### 5.1 No Separate Transfer Endpoints

Stock Transfers use Store Requisition endpoints with filtering:

| Action | Purpose | Endpoint |
|--------|---------|----------|
| `getStoreRequisitions` | Fetch SR list (filter for transfers) | `GET /api/store-requisitions?stage=issue,complete&destType=INVENTORY` |
| `getStoreRequisitionById` | Fetch single SR | `GET /api/store-requisitions/:id` |
| `completeRequisition` | Complete SR (on SR, not transfer) | `POST /api/store-requisitions/:id/complete` |

### 5.2 Transfer View Query

```typescript
// Filter SRs to get transfers
interface TransferViewQuery {
  stage: ['issue', 'complete']
  destinationLocationType: 'INVENTORY'
  search?: string
  status?: SRStatus
}
```

## 6. Performance Considerations

### 6.1 Memoization Strategy
- Filter results with `useMemo`
- Event handlers with `useCallback`
- Avoid inline object/array creation in renders

### 6.2 Data Loading
- Paginate filtered SR list (default 20 per page)
- Lazy load item details on expand
- Cache SR data during session

## 7. Security Considerations

### 7.1 Access Control
- Role-based access to Stock Transfers view
- Location-based filtering for warehouse staff
- All actions require SR permissions (not separate transfer permissions)

### 7.2 Data Validation
- View is read-only; validation happens on SR actions
- Location type validation ensures only INVENTORY destinations shown

## 8. Removed Features (Previous Architecture)

The following features have been **removed** as Stock Transfers are now view-only:

| Feature | Previous | Current |
|---------|----------|---------|
| TransferStatus enum | 5 values (Pending, Issued, InTransit, Received, Cancelled) | Uses SRStatus (5 values) |
| StockTransfer interface | Separate entity | Filtered view of SR |
| StockTransferItem interface | Separate entity | Uses StoreRequisitionItem |
| mockStockTransfers | Separate mock data | Filter mockStoreRequisitions |
| Issue Transfer action | On transfer | On SR |
| Confirm Receipt action | On transfer | **Removed entirely** |
| Receipt tracking | receivedAt, receivedBy, receivedQty | Not applicable |
| InTransit status | Yes | No (Issue = Complete) |
