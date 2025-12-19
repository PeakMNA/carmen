# Functional Design: Stock Transfers View

## 1. Module Overview

**KEY ARCHITECTURE**: Stock Transfers are NOT separate documents. They are **filtered views** of Store Requisitions at the Issue stage with INVENTORY type destinations.

### 1.1 Purpose
The Stock Transfers view provides visibility into inventory movements between INVENTORY type locations, displaying Store Requisitions at the Issue/Complete stage in a transfer-focused layout.

### 1.2 Key Capabilities
- View and search stock transfers (filtered SR data)
- Filter by status (active, completed)
- View transfer details in specialized layout
- Navigate to source Store Requisition for actions
- Print transfer documents
- **Read-only view** - all actions performed on SR

### 1.3 Removed Capabilities
The following capabilities have been **removed** as Stock Transfers are now views:
- ~~Issue stock from source location~~ → Via SR workflow
- ~~Confirm receipt at destination~~ → Removed entirely (no receipt process)
- ~~Track variances between issued and received~~ → Not applicable
- ~~Priority filtering~~ → Uses SR priority if needed

## 2. Screen Designs

### 2.1 Stock Transfers List Page

**Route**: `/store-operations/stock-transfers`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Stock Transfers                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ Total        │ │ Active       │ │ Completed    │ │ Total Value  │        │
│ │ Transfers    │ │              │ │              │ │              │        │
│ │    15        │ │    5         │ │    10        │ │   $2,450.00  │        │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                                             │
│ ┌────────────────────────────┐ ┌─────────────────────┐                     │
│ │ 🔍 Search transfers...     │ │ Status: All       ▼│                      │
│ └────────────────────────────┘ └─────────────────────┘                     │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ SR Ref No ↕│ Date ↕  │ Status      │ From         │ To           │Items│ │
│ ├────────────┼─────────┼─────────────┼──────────────┼──────────────┼─────┤ │
│ │SR-2412-004 │Dec 17   │[In Progress]│Main Warehouse│Central Kitchen│  1 │ │
│ ├────────────┼─────────┼─────────────┼──────────────┼──────────────┼─────┤ │
│ │SR-2412-003 │Dec 10   │[Completed]  │Central Kitch.│Corporate Off.│  1 │ │
│ ├────────────┼─────────┼─────────────┼──────────────┼──────────────┼─────┤ │
│ │SR-2412-002 │Dec 5    │[Completed]  │Main Warehouse│Central Kitchen│  1 │ │
│ ├────────────┼─────────┼─────────────┼──────────────┼──────────────┼─────┤ │
│ │SR-2412-001 │Dec 1    │[Completed]  │Main Warehouse│Central Kitchen│  2 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                              [< 1 2 3 ... 5 >]                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Summary Cards**:
| Card | Icon | Value | Description |
|------|------|-------|-------------|
| Total Transfers | Package | Count of all transfers | Blue |
| Active | Clock | Count of in_progress | Blue |
| Completed | CheckCircle | Count of completed | Green |
| Total Value | DollarSign | Sum of transfer values | Gray |

**Filters**:
| Filter | Type | Options |
|--------|------|---------|
| Search | Text input | Searches SR ref no, from/to location names |
| Status | Select | All, Active (in_progress), Completed |

**Table Columns**:
| Column | Sortable | Description |
|--------|----------|-------------|
| SR Ref No | Yes | SR reference number (SR-YYMM-NNNN) |
| Date | Yes | Required date |
| Status | No | SR status badge |
| From | No | Source location name |
| To | No | Destination location name |
| Items | No | Count of line items |
| Total Value | Yes | Total transfer value |
| Actions | No | View button |

**Note**: No "+ New" button as transfers are created via Store Requisitions.

### 2.2 Stock Transfer Detail Page (Read-Only)

**Route**: `/store-operations/stock-transfers/[id]`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [← Back] Stock Transfer Detail                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ SR-2412-004                               [View Full SR] [🖨️ Print]    │ │
│ │                                                                         │ │
│ │ [In Progress]                                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────┐ ┌─────────────────────┐ ┌─────────────────┐            │
│ │ From            │ │ Transfer Summary    │ │ To              │            │
│ │                 │ │                     │ │                 │            │
│ │ 🏭 Main         │ │ Items: 1            │ │ 🏭 Central      │            │
│ │ Warehouse       │ │ Quantity: 50        │ │ Kitchen         │            │
│ │                 │ │ Value: $150.00      │ │                 │            │
│ │ Code: WH-001    │ │                     │ │ Code: CK-001    │            │
│ │ Type: INVENTORY │ │                     │ │ Type: INVENTORY │            │
│ └─────────────────┘ └─────────────────────┘ └─────────────────┘            │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Items                                                                   │ │
│ ├──────────┬────────────────┬──────┬─────┬──────────┬─────────┬──────────┤ │
│ │ Code     │ Product        │ Unit │ Req │ Approved │ Issued  │ Total    │ │
│ ├──────────┼────────────────┼──────┼─────┼──────────┼─────────┼──────────┤ │
│ │DRY-RIC-01│Jasmine Rice    │ kg   │ 50  │    50    │   50    │  $150.00 │ │
│ └──────────┴────────────────┴──────┴─────┴──────────┴─────────┴──────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Tracking Information                                                    │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ Issued At:   Dec 17, 2024 7:00 AM by Warehouse Staff                   │ │
│ │ Created At:  Dec 15, 2024 2:00 PM by Kitchen Staff                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Header Section**:
- SR Reference number (large text) - NOT ST reference
- SR Status badge (In Progress or Completed)
- "View Full SR" button → navigates to Store Requisition detail
- Print button

**Location Cards**:
| Card | Content |
|------|---------|
| From | Source location name, code, type (INVENTORY) |
| Summary | Items count, total quantity, total value |
| To | Destination location name, code, type (INVENTORY) |

**Action Buttons**:
| Button | Action | Always Visible |
|--------|--------|----------------|
| View Full SR | Navigate to `/store-operations/store-requisitions/[id]` | Yes |
| Print | Open print dialog | Yes |

**Note**: No Issue Transfer or Confirm Receipt buttons - this is a read-only view.

**Items Table Columns**:
| Column | Description |
|--------|-------------|
| Code | Product code/SKU |
| Product | Product name |
| Unit | Unit of measure |
| Req | Requested quantity |
| Approved | Approved quantity |
| Issued | Issued quantity |
| Total | Total value |

**Note**: No "Received" column as there is no receipt process.

## 3. User Interactions

### 3.1 View Transfer List
1. User navigates to Stock Transfers
2. System filters mockStoreRequisitions for:
   - stage = 'issue' OR stage = 'complete'
   - destinationLocationType = 'INVENTORY'
3. System displays filtered results
4. User can search, filter, and sort
5. User clicks row to view details

### 3.2 View Transfer Details
1. User clicks on transfer row
2. System loads SR by ID
3. System validates SR is a valid transfer (correct stage and destination type)
4. System displays SR data in "transfer" layout
5. User can view all details (read-only)

### 3.3 Navigate to Source SR
1. User views transfer detail
2. User clicks "View Full SR" button
3. System navigates to `/store-operations/store-requisitions/[id]`
4. User can perform SR actions (complete, etc.)

### 3.4 Print Transfer Document
1. User clicks "Print" button
2. System generates printable document
3. Browser print dialog opens
4. User prints document

### 3.5 Removed Interactions
The following interactions have been **removed**:
- ~~Issue Transfer Dialog~~ → Actions via SR
- ~~Confirm Receipt Dialog~~ → No receipt process
- ~~Cancel Transfer~~ → Via SR cancellation

## 4. Status Badges

### 4.1 SR Status Badges (Used for Transfers)

| Status | Background | Text | Border |
|--------|------------|------|--------|
| In Progress | blue-100 | blue-800 | blue-200 |
| Completed | green-100 | green-800 | green-200 |

**Note**: Only `in_progress` and `completed` statuses appear in transfer view (filtered by stage).

### 4.2 Removed Status Badges

The following status badges have been **removed**:
- ~~Pending~~ (TransferStatus)
- ~~Issued~~ (TransferStatus)
- ~~In Transit~~ (TransferStatus)
- ~~Received~~ (TransferStatus)
- ~~Cancelled~~ (TransferStatus) → SR Cancelled won't appear in view
- ~~Priority badges~~ → Not used in view

## 5. Navigation

### 5.1 Breadcrumb Trail

```
Store Operations > Stock Transfers > SR-2412-001
```

**Note**: Uses SR reference, not ST reference.

### 5.2 Navigation Links

| From | To | Trigger |
|------|-----|---------|
| List | Detail | Click row or "View" button |
| Detail | List | Click back button |
| Detail | Store Requisition | Click "View Full SR" button |

### 5.3 Cross-Module Navigation

```
Stock Transfer Detail
         │
         │ "View Full SR" button
         ▼
Store Requisition Detail
         │
         │ SR actions (Complete, Print, etc.)
         ▼
Updated SR (reflects in Transfer view)
```

## 6. Responsive Behavior

### 6.1 Mobile Adaptations

| Breakpoint | List Changes | Detail Changes |
|------------|--------------|----------------|
| < 768px | Summary cards in 2x2 grid, table scrolls horizontally | Location cards stack vertically |
| < 640px | Summary cards stack, hide Items column | Full-width cards, accordion for items |

### 6.2 Hidden Columns on Mobile

List page columns hidden on mobile:
- Items count
- Total Value

## 7. Error States

### 7.1 Error Messages

| Scenario | Message | Recovery |
|----------|---------|----------|
| Transfer not found | "Transfer not found" | Link to transfers list |
| Not a valid transfer | "This SR is not a stock transfer" | Redirect to SR detail |
| Network error | "Failed to load transfer data" | Retry button |

### 7.2 Empty States

| Scenario | Message | Action |
|----------|---------|--------|
| No transfers | "No stock transfers found" | - |
| No search results | "No transfers match your search" | Clear filters button |
| No items | "No items in this transfer" | - |

## 8. Print Layout

### 8.1 Transfer Document

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                          STOCK TRANSFER                                     │
│                                                                             │
│  SR Reference: SR-2412-001                    Date: December 1, 2024       │
│  Status: Completed                                                          │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  FROM:                                     TO:                              │
│  Main Warehouse                            Central Kitchen                  │
│  Code: WH-001                              Code: CK-001                     │
│  Type: INVENTORY                           Type: INVENTORY                  │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ITEMS:                                                                     │
│  ┌────────┬────────────────────┬──────┬─────┬──────────┬─────────┬────────┐│
│  │ Code   │ Product            │ Unit │ Req │ Approved │ Issued  │ Value  ││
│  ├────────┼────────────────────┼──────┼─────┼──────────┼─────────┼────────┤│
│  │OIL-001 │ Premium Olive Oil  │ btl  │ 10  │ 10       │ 10      │ $85.00 ││
│  │DRY-003 │ All-Purpose Flour  │ kg   │ 25  │ 25       │ 25      │ $52.50 ││
│  ├────────┴────────────────────┴──────┴─────┴──────────┴─────────┼────────┤│
│  │                                                     TOTAL:    │$137.50 ││
│  └───────────────────────────────────────────────────────────────┴────────┘│
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  TRACKING:                                                                  │
│  Issued At: Dec 1, 2024 9:00 AM by Warehouse Staff                         │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  SIGNATURES:                                                                │
│                                                                             │
│  Issued By: ___________________    Received By: ___________________        │
│  Date: ________________________    Date: ________________________          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Note**:
- Uses SR reference (SR-YYMM-NNNN), not ST reference
- No "Received" column in items table
- Signature fields still included for physical sign-off

## 9. Removed Features (Previous Architecture)

The following features have been **removed** as Stock Transfers are now views:

| Feature | Previous | Current |
|---------|----------|---------|
| "+ New" button | Create new ST | Not available (via SR) |
| Issue Transfer dialog | Issue stock confirmation | Removed (via SR) |
| Confirm Receipt dialog | Enter received quantities | Removed entirely |
| Priority filter | Filter by priority | Removed |
| In Transit status | Shows transfers in transit | Removed |
| Received column | Shows received quantity | Removed |
| Variance tracking | Issued vs received | Removed |
| Cancel action | Cancel transfer | Via SR cancellation |

## 10. Data Flow

### 10.1 List Page Data Flow

```
mockStoreRequisitions
         │
         │ Filter: stage IN ('issue', 'complete')
         │         AND destinationLocationType = 'INVENTORY'
         ▼
filteredTransfers (StoreRequisition[])
         │
         │ Apply search, status filter, sort
         ▼
displayedTransfers
         │
         ▼
Stock Transfers List UI
```

### 10.2 Detail Page Data Flow

```
URL params (id)
         │
         │ Find in mockStoreRequisitions
         ▼
StoreRequisition
         │
         │ Validate: isValidTransfer()
         ▼
Stock Transfer Detail UI (Read-Only)
         │
         │ "View Full SR" action
         ▼
Store Requisition Detail Page
```
