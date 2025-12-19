# Technical Specification: Stock Replenishment Module

## 1. Overview

### 1.1 Module Purpose
The Stock Replenishment module provides a proactive inventory management interface for monitoring PAR levels and creating replenishment requests that generate Store Requisitions, Stock Transfers, Stock Issues, and Purchase Requests.

### 1.2 Technical Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Shadcn/ui
- **State**: React hooks (useState, useMemo, useCallback)
- **Charts**: Recharts library
- **Icons**: Lucide React

### 1.3 File Structure
```
app/(main)/store-operations/stock-replenishment/
├── page.tsx                    # Dashboard - Items below PAR level
├── new/
│   └── page.tsx                # Create replenishment request
├── stock-levels/
│   └── page.tsx                # Stock levels by location view
└── history/
    └── page.tsx                # Historical replenishment view
```

## 2. Core Components

### 2.1 Dashboard Page (`page.tsx`)

**Purpose**: Display items below PAR level grouped by location with urgency classification

**Key Features**:
- Urgency filtering (critical/warning/low)
- Location filtering
- Item selection with floating action bar
- Summary statistics cards

**State Management**:
```typescript
// Filter states
const [selectedUrgency, setSelectedUrgency] = useState<'all' | 'critical' | 'warning' | 'low'>('all')
const [selectedLocation, setSelectedLocation] = useState<string>('all')
const [selectedItems, setSelectedItems] = useState<TransferItem[]>([])

// Computed values
const filteredItems = useMemo(() => {
  return mockStockItems
    .filter(item => {
      // Location filter - only INVENTORY type locations
      const inventoryLoc = inventoryLocations.find(loc => loc.id === item.locationId)
      if (!inventoryLoc || inventoryLoc.type !== InventoryLocationType.INVENTORY) {
        return false
      }
      // Urgency and location filters...
    })
}, [selectedUrgency, selectedLocation])
```

**UI Components**:
- `<Card>` - Summary statistics
- `<Select>` - Urgency and location filters
- `<Badge>` - Urgency and status indicators
- `<Checkbox>` - Item selection
- Floating action bar for bulk actions

### 2.2 New Request Page (`new/page.tsx`)

**Purpose**: Create Store Requisition from replenishment workflow

**Key Features**:
- PR-only workflow support (`NONE_SOURCE_ID = "none"`)
- Source location selection with availability check
- Priority selection (standard/urgent/emergency)
- Stock availability enrichment

**Critical Constants**:
```typescript
// Indicates PR-only workflow - no source stock available
const NONE_SOURCE_ID = "none"
```

**Key Interface**:
```typescript
interface RequestItem extends TransferItem {
  requestedQty: number
  sourceAvailable: number
  isValid: boolean
  validationError?: string
  itemInfo: {
    location: string
    locationCode: string
    itemName: string
    category: string
    subCategory: string
    itemGroup: string
    barCode: string
  }
}
```

**Workflow Type Detection**:
```typescript
const workflowType = useMemo(() => {
  const srcLoc = inventoryLocations.find(loc => loc.id === sourceLocationId)
  const destLoc = inventoryLocations.find(loc => loc.id === userInventoryLocation?.id)
  
  if (!srcLoc && sourceLocationId !== NONE_SOURCE_ID) return null
  if (!destLoc) return null
  
  // PR-only workflow
  if (sourceLocationId === NONE_SOURCE_ID) {
    return 'pr_only'
  }
  
  // Stock Issue - destination is DIRECT
  if (destLoc.type === InventoryLocationType.DIRECT) {
    return 'stock_issue'
  }
  
  // Stock Transfer - both INVENTORY type
  return 'stock_transfer'
}, [sourceLocationId, userInventoryLocation])
```

**Location Validation**:
```typescript
// Source locations - INVENTORY type only
const sourceLocations = useMemo(() => {
  return getSourceLocations(inventoryLocations)
}, [])

// Destination validation - must be able to receive transfers
const canReceiveTransfer = (locationType: InventoryLocationType) => {
  return locationType !== InventoryLocationType.DIRECT
}
```

### 2.3 Stock Levels Page (`stock-levels/page.tsx`)

**Purpose**: Monitor inventory levels across hotel locations

**Features**:
- Location cards with status badges
- Location type indicators (emoji icons)
- Status filtering (critical/low/normal)

**Mock Data Structure**:
```typescript
interface LocationStockLevel {
  id: string
  name: string
  code: string
  type: string
  criticalItems: number
  lowItems: number
  normalItems: number
  status: 'critical' | 'low' | 'normal'
}
```

### 2.4 History Page (`history/page.tsx`)

**Purpose**: View historical replenishment and transfer activities

**Features**:
- Statistics summary cards
- Monthly transfer trends chart (AreaChart)
- Transfers by location chart (BarChart)
- Filterable history list

**Chart Configuration**:
```typescript
// Monthly trends - AreaChart
<AreaChart data={monthlyData}>
  <XAxis dataKey="month" />
  <YAxis />
  <Area type="monotone" dataKey="inbound" />
  <Area type="monotone" dataKey="outbound" />
</AreaChart>

// Location breakdown - BarChart
<BarChart data={locationData} layout="vertical">
  <XAxis type="number" />
  <YAxis dataKey="location" type="category" />
  <Bar dataKey="count" />
</BarChart>
```

## 3. Type Definitions

### 3.1 Core Types (from `lib/types/store-requisition.ts`)

```typescript
// Enums
enum SRStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Approved = 'approved',
  Processing = 'processing',
  Processed = 'processed',
  PartialComplete = 'partial_complete',
  Completed = 'completed',
  Rejected = 'rejected',
  Cancelled = 'cancelled'
}

enum SRWorkflowType {
  TRANSFER_INTERNAL = 'transfer_internal',
  MAIN_STORE = 'main_store',
  STORE_TO_STORE = 'store_to_store',
  DIRECT_ISSUE = 'direct_issue'
}

enum GeneratedDocumentType {
  STOCK_TRANSFER = 'ST',
  STOCK_ISSUE = 'SI',
  PURCHASE_REQUEST = 'PR'
}

// Replenishment Types
type ReplenishmentUrgency = 'critical' | 'warning' | 'low'

interface ReplenishmentSuggestion {
  id: string
  productId: string
  productCode: string
  productName: string
  categoryName: string
  unit: string
  locationId: string
  locationName: string
  locationType: InventoryLocationType
  currentStock: number
  parLevel: number
  reorderPoint: number
  suggestedQty: number
  urgency: ReplenishmentUrgency
  sourceAvailability: {
    locationId: string
    locationName: string
    availableQty: number
    canFulfill: boolean
  }[]
  estimatedUnitCost: number
  estimatedTotalCost: number
  isSelected?: boolean
  generatedRequisitionId?: string
}

enum ReplenishmentMode {
  SUGGEST = 'suggest',
  AUTO_DRAFT = 'auto_draft',
  AUTO_APPROVE = 'auto_approve'
}
```

### 3.2 Location Types (from `lib/types/location-management.ts`)

```typescript
enum InventoryLocationType {
  INVENTORY = 'INVENTORY',
  DIRECT = 'DIRECT',
  CONSIGNMENT = 'CONSIGNMENT'
}
```

## 4. Utility Functions

### 4.1 Location Type Helpers (`lib/utils/location-type-helpers.ts`)

```typescript
// Check if location can receive replenishment
function canReceiveTransfer(locationType: InventoryLocationType): boolean {
  return locationType !== InventoryLocationType.DIRECT
}

// Check if location can be source for transfers
function canBeTransferSource(locationType: InventoryLocationType): boolean {
  return locationType !== InventoryLocationType.DIRECT
}

// Get source locations (INVENTORY type only)
function getSourceLocations(locations: InventoryLocation[]): InventoryLocation[] {
  return locations.filter(loc => loc.type === InventoryLocationType.INVENTORY)
}
```

### 4.2 Urgency Calculation

```typescript
function calculateUrgency(currentStock: number, parLevel: number): ReplenishmentUrgency {
  const percentage = (currentStock / parLevel) * 100
  if (percentage < 30) return 'critical'
  if (percentage < 60) return 'warning'
  return 'low'
}
```

## 5. Data Flow

### 5.1 Replenishment Request Flow

```
Dashboard (page.tsx)
    │
    ├─► Filter items by urgency/location
    │
    ├─► Select items (checkbox)
    │
    └─► Click "Create Request"
            │
            ▼
New Request (new/page.tsx)
    │
    ├─► Auto-populate selected items
    │
    ├─► Determine workflow type:
    │   ├─► PR-only (source = "none")
    │   ├─► Stock Transfer (INVENTORY → INVENTORY)
    │   └─► Stock Issue (INVENTORY → DIRECT)
    │
    ├─► Validate source availability
    │
    ├─► Set priority and notes
    │
    └─► Submit → Create Store Requisition
            │
            ▼
Store Requisitions Module
    │
    ├─► Approval workflow
    │
    └─► Generate documents (ST/SI/PR)
```

### 5.2 Stock Availability Enrichment

```typescript
// Enrich items with source availability
const enrichedItems = useMemo(() => {
  return requestItems.map(item => {
    // Find stock at source location
    const sourceStock = getSourceStock(item.productId, sourceLocationId)
    
    return {
      ...item,
      sourceAvailable: sourceStock,
      isValid: item.requestedQty <= sourceStock || sourceLocationId === NONE_SOURCE_ID,
      validationError: item.requestedQty > sourceStock && sourceLocationId !== NONE_SOURCE_ID
        ? `Only ${sourceStock} available at source`
        : undefined
    }
  })
}, [requestItems, sourceLocationId])
```

## 6. API Endpoints

### 6.1 Planned Server Actions

| Action | Purpose | Input | Output |
|--------|---------|-------|--------|
| `getItemsBelowPAR` | Fetch items below PAR level | `locationId?, urgency?` | `ReplenishmentSuggestion[]` |
| `getSourceAvailability` | Check stock at source locations | `productIds[], sourceLocationId` | `StockAvailability[]` |
| `createReplenishmentRequest` | Create SR from replenishment | `ReplenishmentRequestData` | `StoreRequisition` |
| `getReplenishmentHistory` | Fetch historical requests | `filters` | `ReplenishmentHistory[]` |

### 6.2 Request/Response Types

```typescript
interface CreateReplenishmentRequestInput {
  items: {
    productId: string
    requestedQty: number
    unit: string
  }[]
  sourceLocationId: string | 'none'  // NONE_SOURCE_ID for PR-only
  destinationLocationId: string
  priority: 'standard' | 'urgent' | 'emergency'
  requiredDate: Date
  notes?: string
}

interface CreateReplenishmentRequestOutput {
  success: boolean
  requisitionId?: string
  requisitionRefNo?: string
  error?: string
}
```

## 7. Performance Considerations

### 7.1 Memoization Strategy
- Filter results with `useMemo`
- Event handlers with `useCallback`
- Avoid inline object/array creation in renders

### 7.2 Data Loading
- Lazy load history charts
- Paginate large item lists
- Cache source availability results

## 8. Security Considerations

### 8.1 Access Control
- Role-based access to replenishment module
- Location-based filtering for department managers
- PR workflow requires procurement permission

### 8.2 Data Validation
- Server-side validation of quantities
- Source location type validation
- Destination location type validation
