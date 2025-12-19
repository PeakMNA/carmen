# Technical Specification: Stock Issues View

## 1. Overview

### 1.1 Module Purpose

**KEY ARCHITECTURE**: Stock Issues are NOT separate documents. They are **filtered views** of Store Requisitions at the Issue stage with DIRECT type destinations.

The Stock Issues view displays Store Requisitions that are being issued to DIRECT (expense) locations, providing a specialized read-only interface for tracking inventory issues with department and expense allocation.

### 1.2 Technical Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Shadcn/ui
- **State**: React hooks (useState, useMemo, useCallback)
- **Icons**: Lucide React

### 1.3 File Structure
```
app/(main)/store-operations/stock-issues/
├── page.tsx                    # List page - Filtered SR listing
└── [id]/
    └── page.tsx                # Detail page - SR detail in "issue" layout
```

## 2. Core Components

### 2.1 List Page (`page.tsx`)

**Purpose**: Display filtered Store Requisitions at Issue stage with DIRECT destinations

**Key Features**:
- Summary cards (Total Issues, Active, Completed, Total Value)
- Search by SR reference number, location names, department
- Status filter (all, active, completed)
- Sortable columns with pagination
- Department column with Building2 icon
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

// Computed values - Filter SRs for issue view
const filteredIssues = useMemo(() => {
  return mockStoreRequisitions
    .filter(sr => {
      // Must be at Issue or Complete stage
      const isIssueStage = sr.stage === SRStage.Issue || sr.stage === SRStage.Complete

      // Destination must be DIRECT type
      const isDirectDestination = sr.destinationLocationType === InventoryLocationType.DIRECT

      if (!isIssueStage || !isDirectDestination) return false

      // Search filter
      const matchesSearch = searchQuery === '' ||
        sr.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sr.sourceLocationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sr.destinationLocationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sr.departmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

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
- `<Table>` - Issues list with sortable headers
- `<Badge>` - Status indicators
- `<Button>` - Navigation to detail page (View)
- Building2 icon - Department indicator

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

**Purpose**: Display SR detail in "issue" layout (read-only)

**Key Features**:
- Header with SR reference, status badge
- Read-only view (no action buttons except Print and "View Full SR")
- Location cards (From: Source INVENTORY, To: Destination DIRECT)
- Department card (required for DIRECT destinations)
- Expense Account card (if assigned)
- Issue summary card
- Items table with quantity and cost tracking
- Link to source Store Requisition

**Key Interface**:
```typescript
interface StockIssueDetailProps {
  params: { id: string }
}

// Load StoreRequisition by ID
const sr = mockStoreRequisitions.find(r => r.id === params.id)

// Validate it's a valid issue (Issue/Complete stage with DIRECT destination)
const isValidIssue = sr &&
  (sr.stage === SRStage.Issue || sr.stage === SRStage.Complete) &&
  sr.destinationLocationType === InventoryLocationType.DIRECT

// Display states
const isCompleted = sr?.status === SRStatus.Completed
```

**UI Layout**:
```
┌─────────────────────────────────────────────────────────────────┐
│ [Back] Stock Issue Detail                                        │
│                                                                 │
│ SR-2412-004                               [View Full SR] [Print] │
│ [In Progress Badge]                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────┐  ┌─────────────────┐  ┌─────────────┐          │
│ │ From        │  │ Issue Summary   │  │ To          │          │
│ │ Location    │  │                 │  │ Location    │          │
│ │             │  │ Items: 1        │  │             │          │
│ │ Main        │  │ Quantity: 12    │  │ Bar Direct  │          │
│ │ Warehouse   │  │ Value: $180.00  │  │ [BAR-001]   │          │
│ │ [WH-001]    │  │                 │  │ DIRECT      │          │
│ │ INVENTORY   │  │                 │  │             │          │
│ └─────────────┘  └─────────────────┘  └─────────────┘          │
│                                                                 │
│ ┌─────────────────────┐  ┌─────────────────────────────────────┐ │
│ │ Department          │  │ Expense Account                     │ │
│ │ 🏢 Food & Beverage  │  │ F&B Cost - Bar                     │ │
│ └─────────────────────┘  └─────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Items                                                       │ │
│ ├──────────┬────────────────┬──────┬─────┬─────────┬─────────┤ │
│ │ Code     │ Product        │ Unit │ Req │ Approved│ Issued  │ │
│ ├──────────┼────────────────┼──────┼─────┼─────────┼─────────┤ │
│ │BEV-WIN-01│ House Red Wine │ btl  │ 12  │ 12      │ 12      │ │
│ └──────────┴────────────────┴──────┴─────┴─────────┴─────────┘ │
│                                                                 │
│ Tracking Information:                                           │
│ Issued At: Dec 12, 2024 4:00 PM by Warehouse Staff             │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Type Definitions

### 3.1 Core Types (from `lib/types/store-requisition.ts`)

**Note**: Stock Issues do NOT have separate types. They use Store Requisition types.

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

// Store Requisition (used for issues)
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
  destinationLocationType: InventoryLocationType  // DIRECT for issues
  // Department (required for DIRECT destinations)
  departmentId?: string
  departmentName?: string
  // Expense Account (optional)
  expenseAccountId?: string
  expenseAccountName?: string
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

### 3.2 Issue View is SR Filtering

```typescript
// What makes an SR appear in Stock Issue view:
const isStockIssue = (sr: StoreRequisition): boolean => {
  return (
    (sr.stage === SRStage.Issue || sr.stage === SRStage.Complete) &&
    sr.destinationLocationType === InventoryLocationType.DIRECT
  )
}
```

## 4. Data Flow

### 4.1 No Separate Issue Entity

Stock Issues are NOT created as separate documents. When an SR reaches the Issue stage:
1. If destination is DIRECT → appears in Stock Issue view
2. If destination is INVENTORY → appears in Stock Transfer view

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
    │       ├── destinationLocationType = DIRECT        │
    │       │   └── Appears in Stock Issue View         │
    │       │                                            │
    │       └── destinationLocationType = INVENTORY     │
    │           └── Appears in Stock Transfer View      │
    │                                                    │
    └─► Complete ───────────────────────────────────────┘
```

### 4.3 Navigate to SR for Actions

All workflow actions are performed on the underlying SR, not on the issue view:

```typescript
// In issue detail page, link to full SR
const handleViewFullSR = () => {
  router.push(`/store-operations/store-requisitions/${sr.id}`)
}

// Actions available on SR at Issue stage:
// - Complete (advances SR to Complete stage)
// - Print
// - View history
```

## 5. API Endpoints

### 5.1 No Separate Issue Endpoints

Stock Issues use Store Requisition endpoints with filtering:

| Action | Purpose | Endpoint |
|--------|---------|----------|
| `getStoreRequisitions` | Fetch SR list (filter for issues) | `GET /api/store-requisitions?stage=issue,complete&destType=DIRECT` |
| `getStoreRequisitionById` | Fetch single SR | `GET /api/store-requisitions/:id` |
| `completeRequisition` | Complete SR (on SR, not issue) | `POST /api/store-requisitions/:id/complete` |

### 5.2 Issue View Query

```typescript
// Filter SRs to get issues
interface IssueViewQuery {
  stage: ['issue', 'complete']
  destinationLocationType: 'DIRECT'
  search?: string
  status?: SRStatus
  departmentId?: string
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
- Role-based access to Stock Issues view
- Department-based filtering for managers
- All actions require SR permissions (not separate issue permissions)

### 7.2 Data Validation
- View is read-only; validation happens on SR actions
- Location type validation ensures only DIRECT destinations shown
- Department validation ensures expense allocation is correct

## 8. Removed Features (Previous Architecture)

The following features have been **removed** as Stock Issues are now view-only:

| Feature | Previous | Current |
|---------|----------|---------|
| IssueStatus enum | 3 values (Pending, Issued, Cancelled) | Uses SRStatus (5 values) |
| StockIssue interface | Separate entity | Filtered view of SR |
| StockIssueItem interface | Separate entity | Uses StoreRequisitionItem |
| mockStockIssues | Separate mock data | Filter mockStoreRequisitions |
| Issue Stock action | On issue | On SR |
| SI-YYMM-NNNN reference | Separate reference | Uses SR reference (SR-YYMM-NNNN) |
