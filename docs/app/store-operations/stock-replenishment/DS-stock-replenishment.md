# Data Schema: Stock Replenishment Module

## 1. Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         Stock Replenishment Data Model                          │
└─────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
  │    Product       │         │InventoryLocation │         │  ReplenishmentSuggestion  │
  ├──────────────────┤         ├──────────────────┤         ├──────────────────┤
  │ id               │◄───────►│ id               │◄───────►│ id               │
  │ code             │         │ name             │         │ productId        │
  │ name             │         │ code             │         │ locationId       │
  │ categoryId       │         │ type             │         │ currentStock     │
  │ unit             │         │ isActive         │         │ parLevel         │
  │ parLevel         │         │                  │         │ reorderPoint     │
  └──────────────────┘         └──────────────────┘         │ suggestedQty     │
          │                            │                    │ urgency          │
          │                            │                    │ estimatedCost    │
          │                            │                    └──────────────────┘
          │                            │                            │
          ▼                            ▼                            ▼
  ┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
  │  StockBalance    │         │ StoreRequisition │         │  GeneratedDoc    │
  ├──────────────────┤         ├──────────────────┤         ├──────────────────┤
  │ productId        │◄───────►│ id               │◄───────►│ id               │
  │ locationId       │         │ refNo            │         │ documentType     │
  │ quantity         │         │ sourceLocationId │         │ refNo            │
  │ reservedQty      │         │ destLocationId   │         │ status           │
  │ availableQty     │         │ status           │         │ requisitionId    │
  │ lastUpdated      │         │ workflowType     │         │ lineItemIds[]    │
  └──────────────────┘         │ priority         │         │ totalQuantity    │
                               │ items[]          │         │ totalValue       │
                               └──────────────────┘         └──────────────────┘
```

## 2. Core Entities

### 2.1 ReplenishmentSuggestion

Represents an item that requires replenishment based on PAR level analysis.

```typescript
interface ReplenishmentSuggestion {
  // Identifiers
  id: string                          // Unique suggestion ID
  
  // Product Reference
  productId: string                   // FK to Product
  productCode: string                 // Product SKU
  productName: string                 // Product display name
  categoryName: string                // Category for grouping
  unit: string                        // Base unit of measure
  
  // Location Reference
  locationId: string                  // FK to InventoryLocation
  locationName: string                // Location display name
  locationType: InventoryLocationType // INVENTORY | DIRECT | CONSIGNMENT
  
  // Stock Levels
  currentStock: number                // Current quantity at location
  parLevel: number                    // Target PAR level
  reorderPoint: number                // Reorder trigger point
  minOrderQty: number                 // Minimum order quantity
  maxOrderQty: number                 // Maximum order quantity
  
  // Suggestion Data
  suggestedQty: number                // System-calculated replenishment qty
  urgency: ReplenishmentUrgency       // 'critical' | 'warning' | 'low'
  
  // Source Availability
  sourceAvailability: SourceAvailability[]  // Available sources
  
  // Cost Estimation
  estimatedUnitCost: number           // Estimated unit cost
  estimatedTotalCost: number          // suggestedQty * estimatedUnitCost
  
  // UI State
  isSelected?: boolean                // Selection state for batch operations
  
  // Tracking (after conversion)
  generatedRequisitionId?: string     // FK to StoreRequisition (when created)
  generatedRequisitionRefNo?: string  // SR reference number
}

interface SourceAvailability {
  locationId: string                  // Source location ID
  locationName: string                // Source location name
  availableQty: number                // Available quantity
  canFulfill: boolean                 // Can fully fulfill suggestedQty
}

type ReplenishmentUrgency = 'critical' | 'warning' | 'low'
```

### 2.2 StoreRequisition

Primary document created from replenishment requests.

```typescript
interface StoreRequisition {
  // Document Identity
  id: string                          // Primary key
  refNo: string                       // Document reference: SR-YYMM-NNNN
  
  // Dates
  requestDate: Date                   // Date request was created
  requiredDate: Date                  // Required delivery date
  
  // Status & Workflow
  status: SRStatus                    // Current document status
  workflowType: SRWorkflowType        // Determines approval & doc generation
  
  // Source Location (From)
  sourceLocationId: string            // FK to InventoryLocation (or 'none')
  sourceLocationCode: string          // Location code
  sourceLocationName: string          // Location display name
  sourceLocationType: InventoryLocationType
  
  // Destination Location (To)
  destinationLocationId: string       // FK to InventoryLocation
  destinationLocationCode: string     // Location code
  destinationLocationName: string     // Location display name
  destinationLocationType: InventoryLocationType
  
  // Requestor
  requestedBy: string                 // User display name
  requestorId: string                 // FK to User
  departmentId: string                // FK to Department
  departmentName: string              // Department display name
  
  // Line Items
  items: StoreRequisitionItem[]       // Requested items
  
  // Totals
  totalItems: number                  // Count of line items
  totalQuantity: number               // Sum of requested quantities
  estimatedValue: Money               // Total estimated value
  
  // Generated Documents
  generatedDocuments: GeneratedDocumentReference[]
  
  // Notes
  description?: string                // Request description
  notes?: string                      // Additional notes
  
  // Approval Tracking
  approvedAt?: Date
  approvedBy?: string
  rejectedAt?: Date
  rejectedBy?: string
  rejectionReason?: string
  
  // Source Reference (from replenishment)
  sourceReplenishmentIds?: string[]   // Original suggestion IDs
  
  // Audit
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
}

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
```

### 2.3 StoreRequisitionItem

Line items within a Store Requisition.

```typescript
interface StoreRequisitionItem {
  id: string                          // Line item ID
  
  // Product Reference
  productId: string
  productCode: string
  productName: string
  categoryId?: string
  categoryName?: string
  
  // Unit of Measure
  unit: string
  unitId?: string
  
  // Quantities
  requestedQty: number                // Requested quantity
  approvedQty: number                 // Approved quantity
  issuedQty: number                   // Issued quantity
  
  // Costs
  unitCost: number                    // Unit cost
  totalCost: number                   // requestedQty * unitCost
  
  // Stock Availability
  sourceAvailableQty: number          // Available at source
  
  // Fulfillment Breakdown
  fulfillment: SRLineItemFulfillment
  
  // Business Dimensions
  jobCodeId?: string
  jobCodeName?: string
  projectId?: string
  projectName?: string
  
  // Approval
  approvalStatus: ApprovalStatus
  approvalNotes?: string
  
  // Notes
  notes?: string
}

interface SRLineItemFulfillment {
  fromStock: number                   // Quantity from stock
  toPurchase: number                  // Quantity requiring PR
  documentType: GeneratedDocumentType // Primary doc type
  sourceLocationId?: string           // Source for stock portion
  sourceLocationName?: string
}
```

### 2.4 GeneratedDocumentReference

References to documents generated from Store Requisition approval.

```typescript
interface GeneratedDocumentReference {
  id: string                          // Reference ID
  documentType: GeneratedDocumentType // ST | SI | PR
  refNo: string                       // Document reference number
  status: string                      // Current document status
  lineItemIds: string[]               // SR line items covered
  totalQuantity: number               // Total quantity in document
  totalValue: Money                   // Total value
  createdAt: Date                     // Generation timestamp
  documentId: string                  // FK to actual document
}

enum GeneratedDocumentType {
  STOCK_TRANSFER = 'ST',
  STOCK_ISSUE = 'SI',
  PURCHASE_REQUEST = 'PR'
}
```

### 2.5 InventoryLocation

Location master data with type classification.

```typescript
interface InventoryLocation {
  id: string                          // Primary key
  name: string                        // Display name
  code: string                        // Location code
  type: InventoryLocationType         // Location type
  isActive: boolean                   // Active status
  
  // SR Configuration
  srConfig?: LocationSRConfig
}

enum InventoryLocationType {
  INVENTORY = 'INVENTORY',            // Full tracking, FIFO costing
  DIRECT = 'DIRECT',                  // Immediate expense, no tracking
  CONSIGNMENT = 'CONSIGNMENT'         // Vendor-owned, FIFO tracking
}

interface LocationSRConfig {
  isSourceLocation: boolean           // Can be source (From)
  isRequestableLocation: boolean      // Can be destination (To)
  defaultCostCenterId?: string        // Default cost center
  sourcePriority: number              // Priority for auto-selection
  isMainStore: boolean                // Main warehouse flag
}
```

## 3. Data Relationships

### 3.1 Key Relationships

| From Entity | To Entity | Relationship | Description |
|-------------|-----------|--------------|-------------|
| ReplenishmentSuggestion | Product | Many-to-One | Suggestion references product |
| ReplenishmentSuggestion | InventoryLocation | Many-to-One | Suggestion at location |
| StoreRequisition | InventoryLocation (source) | Many-to-One | Source location |
| StoreRequisition | InventoryLocation (dest) | Many-to-One | Destination location |
| StoreRequisition | StoreRequisitionItem | One-to-Many | Line items |
| StoreRequisition | GeneratedDocumentReference | One-to-Many | Generated documents |
| StoreRequisition | ReplenishmentSuggestion | Many-to-Many | Source suggestions |

### 3.2 Cardinality Summary

```
Product (1) ──── (*) ReplenishmentSuggestion (*) ──── (1) InventoryLocation
                            │
                            │ generates
                            ▼
                    StoreRequisition (1) ──── (*) StoreRequisitionItem
                            │
                            │ produces
                            ▼
                    GeneratedDocumentReference
                            │
                            ├──► StockTransfer
                            ├──► StockIssue
                            └──► PurchaseRequest
```

## 4. Computed Fields

### 4.1 Urgency Calculation

```typescript
// Urgency based on current stock vs PAR level
function calculateUrgency(currentStock: number, parLevel: number): ReplenishmentUrgency {
  if (parLevel === 0) return 'low'
  
  const percentage = (currentStock / parLevel) * 100
  
  if (percentage < 30) return 'critical'      // Below 30% of PAR
  if (percentage < 60) return 'warning'       // 30-60% of PAR
  return 'low'                                // Above 60% of PAR
}
```

### 4.2 Suggested Quantity Calculation

```typescript
// Suggested quantity to reach PAR level
function calculateSuggestedQty(
  currentStock: number,
  parLevel: number,
  minOrderQty: number,
  maxOrderQty: number
): number {
  const deficit = parLevel - currentStock
  
  if (deficit <= 0) return 0
  
  // Round up to minimum order quantity
  let suggestedQty = Math.max(deficit, minOrderQty)
  
  // Cap at maximum order quantity
  suggestedQty = Math.min(suggestedQty, maxOrderQty)
  
  return suggestedQty
}
```

### 4.3 Workflow Type Determination

```typescript
// Determine workflow based on source and destination locations
function determineWorkflowType(
  sourceLocationId: string | null,
  sourceLocationType: InventoryLocationType | null,
  destinationLocationType: InventoryLocationType
): SRWorkflowType | 'pr_only' {
  // PR-only workflow
  if (sourceLocationId === NONE_SOURCE_ID || !sourceLocationId) {
    return 'pr_only'
  }
  
  // Stock Issue - destination is DIRECT
  if (destinationLocationType === InventoryLocationType.DIRECT) {
    return SRWorkflowType.DIRECT_ISSUE
  }
  
  // Stock Transfer - both INVENTORY type
  return SRWorkflowType.TRANSFER_INTERNAL
}
```

## 5. Indexes and Query Patterns

### 5.1 Recommended Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| replenishment_suggestion | (location_id, urgency) | Filter by location + urgency |
| replenishment_suggestion | (product_id, location_id) | Unique product-location |
| store_requisition | (status, created_at) | Status filtering with date sort |
| store_requisition | (source_location_id) | Source location queries |
| store_requisition | (destination_location_id) | Destination location queries |
| inventory_location | (type, is_active) | Location type filtering |

### 5.2 Common Query Patterns

```sql
-- Get items below PAR for a location
SELECT * FROM replenishment_suggestion
WHERE location_id = ? AND current_stock < par_level
ORDER BY urgency DESC, product_name ASC;

-- Get pending requisitions for a location
SELECT * FROM store_requisition
WHERE destination_location_id = ?
  AND status IN ('draft', 'submitted')
ORDER BY created_at DESC;

-- Get source locations with availability
SELECT loc.*, COALESCE(SUM(bal.available_qty), 0) as total_available
FROM inventory_location loc
LEFT JOIN stock_balance bal ON loc.id = bal.location_id
WHERE loc.type = 'INVENTORY' AND loc.is_active = true
GROUP BY loc.id;
```

## 6. Data Validation Rules

### 6.1 ReplenishmentSuggestion Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| currentStock | >= 0 | Stock cannot be negative |
| parLevel | > 0 | PAR level must be positive |
| suggestedQty | >= minOrderQty | Must meet minimum order quantity |
| suggestedQty | <= maxOrderQty | Cannot exceed maximum order quantity |
| locationType | Must be INVENTORY | Only INVENTORY locations have PAR levels |

### 6.2 StoreRequisition Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| sourceLocationId | INVENTORY type or 'none' | Invalid source location type |
| destinationLocationId | Not DIRECT type | Cannot replenish DIRECT locations |
| requiredDate | >= today | Required date must be in future |
| items | length > 0 | At least one item required |
| items[].requestedQty | > 0 | Quantity must be positive |

## 7. Mock Data Structure

### 7.1 Sample Locations

```typescript
const mockLocations: InventoryLocation[] = [
  { id: 'loc-1', name: 'Main Kitchen', code: 'MK', type: 'INVENTORY' },
  { id: 'loc-2', name: 'Pool Bar', code: 'PB', type: 'INVENTORY' },
  { id: 'loc-3', name: 'Rooftop Restaurant', code: 'RR', type: 'INVENTORY' },
  { id: 'loc-4', name: 'Lobby Café', code: 'LC', type: 'INVENTORY' },
  { id: 'loc-5', name: 'Banquet Hall', code: 'BH', type: 'INVENTORY' },
  { id: 'loc-6', name: 'Central Store', code: 'CS', type: 'INVENTORY' },  // Main Store
]
```

### 7.2 Sample Replenishment Suggestions

```typescript
const mockSuggestions: ReplenishmentSuggestion[] = [
  {
    id: 'rep-1',
    productId: 'prod-1',
    productCode: 'BEV-001',
    productName: 'Mineral Water 500ml',
    categoryName: 'Beverages',
    unit: 'Case',
    locationId: 'loc-1',
    locationName: 'Main Kitchen',
    locationType: InventoryLocationType.INVENTORY,
    currentStock: 5,
    parLevel: 50,
    reorderPoint: 15,
    minOrderQty: 10,
    maxOrderQty: 100,
    suggestedQty: 45,
    urgency: 'critical',
    sourceAvailability: [
      { locationId: 'loc-6', locationName: 'Central Store', availableQty: 200, canFulfill: true }
    ],
    estimatedUnitCost: 12.50,
    estimatedTotalCost: 562.50
  }
]
```
