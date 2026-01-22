# Functional Design: Stock Issues View

## 1. Module Overview

**KEY ARCHITECTURE**: Stock Issues are NOT separate documents. They are **filtered views** of Store Requisitions at the Issue stage with DIRECT type destinations.

### 1.1 Purpose
The Stock Issues view provides visibility into direct stock issues to expense locations, displaying Store Requisitions at the Issue/Complete stage with DIRECT destinations in an issue-focused layout with department and expense allocation.

### 1.2 Key Capabilities
- View and search stock issues (filtered SR data)
- Filter by status (active, completed) and department
- View issue details with department and expense allocation
- Navigate to source Store Requisition for actions
- Print issue documents
- View expense allocation details
- **Read-only view** - all actions performed on SR

### 1.3 Removed Capabilities
The following capabilities have been **removed** as Stock Issues are now views:
- ~~Issue stock from source location~~ → Via SR workflow
- ~~Cancel issue~~ → Via SR cancellation
- ~~Create new issue~~ → Via SR creation

## 2. Screen Designs

### 2.1 Stock Issues List Page

**Route**: `/store-operations/stock-issues`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Stock Issues                                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ Total        │ │ Active       │ │ Completed    │ │ Total Value  │        │
│ │ Issues       │ │              │ │              │ │              │        │
│ │    8         │ │    2         │ │    6         │ │   $1,250     │        │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                                             │
│ ┌────────────────────────────┐ ┌─────────────────────┐                     │
│ │ 🔍 Search issues...        │ │ Status: All       ▼│                      │
│ └────────────────────────────┘ └─────────────────────┘                     │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │SR Ref No ↕│ Date ↕  │ Status      │ From         │ To         │🏢 Dept │ │
│ ├───────────┼─────────┼─────────────┼──────────────┼────────────┼────────┤ │
│ │SR-2412-004│Dec 12   │[In Progress]│Main Warehouse│Bar Direct  │F&B     │ │
│ ├───────────┼─────────┼─────────────┼──────────────┼────────────┼────────┤ │
│ │SR-2412-003│Dec 10   │[Completed]  │Main Warehouse│Maint Direct│Maint.  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                              [< 1 2 3 ... 5 >]                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Summary Cards**:
| Card | Icon | Value | Description |
|------|------|-------|-------------|
| Total Issues | FileText | Count of all issues | Blue |
| Active | Clock | Count of in_progress | Blue |
| Completed | CheckCircle | Count of completed | Green |
| Total Value | DollarSign | Sum of issue values | Gray |

**Filters**:
| Filter | Type | Options |
|--------|------|---------|
| Search | Text input | Searches SR ref no, locations, department |
| Status | Select | All, Active (in_progress), Completed |

**Table Columns**:
| Column | Sortable | Description |
|--------|----------|-------------|
| SR Ref No | Yes | SR reference number (SR-YYMM-NNNN) |
| Date | Yes | Required date |
| Status | No | SR status badge |
| From | No | Source location name |
| To | No | Destination location name (DIRECT) |
| Department | No | Assigned department (with Building2 icon) |
| Total Value | Yes | Total issue value |
| Actions | No | View button |

**Note**: No "+ New" button as issues are created via Store Requisitions.

### 2.2 Stock Issue Detail Page (Read-Only)

**Route**: `/store-operations/stock-issues/[id]`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [← Back] Stock Issue Detail                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ SR-2412-004                               [View Full SR] [🖨️ Print]    │ │
│ │                                                                         │ │
│ │ [In Progress]                                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────┐ ┌─────────────────────┐ ┌─────────────────┐            │
│ │ From            │ │ Issue Summary       │ │ To              │            │
│ │                 │ │                     │ │                 │            │
│ │ 🏭 Main         │ │ Items: 1            │ │ 📍 Bar Direct   │            │
│ │ Warehouse       │ │ Quantity: 12        │ │ [BAR-001]       │            │
│ │                 │ │ Value: $180.00      │ │                 │            │
│ │ Code: WH-001    │ │                     │ │ Type: DIRECT    │            │
│ │ Type: INVENTORY │ │                     │ │                 │            │
│ └─────────────────┘ └─────────────────────┘ └─────────────────┘            │
│                                                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────────────────────────┐ │
│ │ Department              │ │ Expense Account                             │ │
│ │                         │ │                                             │ │
│ │ 🏢 Food & Beverage      │ │ F&B Cost - Bar                              │ │
│ └─────────────────────────┘ └─────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Items                                                                   │ │
│ ├──────────┬────────────────┬──────┬─────┬──────────┬─────────┬──────────┤ │
│ │ Code     │ Product        │ Unit │ Req │ Approved │ Issued  │ Total    │ │
│ ├──────────┼────────────────┼──────┼─────┼──────────┼─────────┼──────────┤ │
│ │BEV-WIN-01│House Red Wine  │ btl  │ 12  │    12    │   12    │  $180.00 │ │
│ └──────────┴────────────────┴──────┴─────┴──────────┴─────────┴──────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Tracking Information                                                    │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ Issued At:   Dec 12, 2024 4:00 PM by Warehouse Staff                   │ │
│ │ Created At:  Dec 12, 2024 2:00 PM by Bar Manager                       │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Header Section**:
- SR Reference number (large text) - NOT SI reference
- SR Status badge (In Progress or Completed)
- "View Full SR" button → navigates to Store Requisition detail
- Print button

**Location Cards**:
| Card | Content |
|------|---------|
| From | Source location name, code, type (INVENTORY) |
| Summary | Items count, total quantity, total value |
| To | Destination location name, code, type (DIRECT) |

**Expense Allocation Cards**:
| Card | Content |
|------|---------|
| Department | Department name with Building2 icon |
| Expense Account | Expense account name (if assigned) |

**Action Buttons**:
| Button | Action | Always Visible |
|--------|--------|----------------|
| View Full SR | Navigate to `/store-operations/store-requisitions/[id]` | Yes |
| Print | Open print dialog | Yes |

**Note**: No Issue Stock button - this is a read-only view.

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

## 3. User Interactions

### 3.1 View Issue List
1. User navigates to Stock Issues
2. System filters mockStoreRequisitions for:
   - stage = 'issue' (NOTE: Only Issue stage, not Complete)
   - destinationLocationType = 'DIRECT'
3. System displays filtered results
4. User can search, filter, and sort
5. User clicks row to view details

### 3.2 View Issue Details
1. User clicks on issue row
2. System loads SR by ID
3. System validates SR is a valid issue (correct stage and destination type)
4. System displays SR data in "issue" layout with department/expense info
5. User can view all details (read-only)

### 3.3 Navigate to Source SR
1. User views issue detail
2. User clicks "View Full SR" button
3. System navigates to `/store-operations/store-requisitions/[id]`
4. User can perform SR actions (complete, etc.)

### 3.4 Print Issue Document
1. User clicks "Print" button
2. System generates printable document
3. Browser print dialog opens
4. User prints document

### 3.5 View Expense Allocation
1. User views issue detail
2. System displays department card
3. System displays expense account card (if assigned)
4. User sees expense allocation information

### 3.6 Removed Interactions
The following interactions have been **removed**:
- ~~Issue Stock Dialog~~ → Actions via SR
- ~~Cancel Issue~~ → Via SR cancellation

## 4. Status Badges

### 4.1 SR Status Badges (Used for Issues)

| Status | Background | Text | Border |
|--------|------------|------|--------|
| In Progress | blue-100 | blue-800 | blue-200 |
| Completed | green-100 | green-800 | green-200 |

**Note**: Only SRs with status `in_progress` at the Issue stage appear in the Stock Issue view. Once an SR moves to Complete stage, it no longer appears in this view.

### 4.2 Removed Status Badges

The following status badges have been **removed**:
- ~~Pending~~ (IssueStatus)
- ~~Issued~~ (IssueStatus)
- ~~Cancelled~~ (IssueStatus) → SR Cancelled won't appear in view

## 5. Navigation

### 5.1 Breadcrumb Trail

```
Store Operations > Stock Issues > SR-2412-004
```

**Note**: Uses SR reference, not SI reference.

### 5.2 Navigation Links

| From | To | Trigger |
|------|-----|---------|
| List | Detail | Click row or "View" button |
| Detail | List | Click back button |
| Detail | Store Requisition | Click "View Full SR" button |

### 5.3 Cross-Module Navigation

```
Stock Issue Detail
         │
         │ "View Full SR" button
         ▼
Store Requisition Detail
         │
         │ SR actions (Complete, Print, etc.)
         ▼
Updated SR (reflects in Issue view)
```

## 6. Responsive Behavior

### 6.1 Mobile Adaptations

| Breakpoint | List Changes | Detail Changes |
|------------|--------------|----------------|
| < 768px | Summary cards in 2x2 grid, table scrolls horizontally | All cards stack vertically |
| < 640px | Summary cards stack, hide Department column | Full-width cards, accordion for items |

### 6.2 Hidden Columns on Mobile

List page columns hidden on mobile:
- Department (shown as badge)
- Total Value

## 7. Error States

### 7.1 Error Messages

| Scenario | Message | Recovery |
|----------|---------|----------|
| Issue not found | "Issue not found" | Link to issues list |
| Not a valid issue | "This SR is not a stock issue" | Redirect to SR detail |
| Network error | "Failed to load issue data" | Retry button |

### 7.2 Empty States

| Scenario | Message | Action |
|----------|---------|--------|
| No issues | "No stock issues found" | - |
| No search results | "No issues match your search" | Clear filters button |
| No items | "No items in this issue" | - |

## 8. Print Layout

### 8.1 Issue Document

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                            STOCK ISSUE                                      │
│                                                                             │
│  SR Reference: SR-2412-004                    Date: December 12, 2024      │
│  Status: Completed                                                          │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  FROM:                                     TO:                              │
│  Main Warehouse                            Restaurant Bar Direct            │
│  Code: WH-001                              Code: BAR-001                    │
│  Type: INVENTORY                           Type: DIRECT                     │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  EXPENSE ALLOCATION:                                                        │
│  Department: Food & Beverage                                                │
│  Account: F&B Cost - Bar                                                    │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ITEMS:                                                                     │
│  ┌────────┬────────────────────┬──────┬─────┬──────────┬─────────┬────────┐│
│  │ Code   │ Product            │ Unit │ Req │ Approved │ Issued  │ Value  ││
│  ├────────┼────────────────────┼──────┼─────┼──────────┼─────────┼────────┤│
│  │BEV-WIN1│ House Red Wine     │ btl  │ 12  │ 12       │ 12      │$180.00 ││
│  ├────────┴────────────────────┴──────┴─────┴──────────┴─────────┼────────┤│
│  │                                                     TOTAL:    │$180.00 ││
│  └───────────────────────────────────────────────────────────────┴────────┘│
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  TRACKING:                                                                  │
│  Issued At: Dec 12, 2024 4:00 PM by Warehouse Staff                        │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  SIGNATURES:                                                                │
│                                                                             │
│  Issued By: ___________________    Received By: ___________________        │
│  Date: ________________________    Date: ________________________          │
│                                                                             │
│  Department Approval: ___________________                                   │
│  Date: ________________________                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Note**:
- Uses SR reference (SR-YYMM-NNNN), not SI reference
- Includes Department and Expense Account section
- Signature fields for physical sign-off

## 9. Removed Features (Previous Architecture)

The following features have been **removed** as Stock Issues are now views:

| Feature | Previous | Current |
|---------|----------|---------|
| "+ New" button | Create new SI | Not available (via SR) |
| Issue Stock dialog | Issue stock confirmation | Removed (via SR) |
| SI reference | SI-YYMM-NNNN | Uses SR reference |
| Cancel action | Cancel issue | Via SR cancellation |
| IssueStatus badges | Pending/Issued/Cancelled | Uses SR status badges |

## 10. Data Flow

### 10.1 List Page Data Flow

```
mockStoreRequisitions
         │
         │ Filter: stage === 'issue'
         │         AND destinationLocationType === 'DIRECT'
         │         (via getStoreRequisitionsForStockIssue())
         ▼
filteredIssues (StoreRequisition[])
         │
         │ Apply search, status filter, sort
         ▼
displayedIssues
         │
         ▼
Stock Issues List UI
```

**Note**: Current implementation only filters for `SRStage.Issue` (not 'issue' OR 'complete').

### 10.2 Detail Page Data Flow

```
URL params (id)
         │
         │ Find in mockStoreRequisitions
         ▼
StoreRequisition
         │
         │ Validate: isValidIssue()
         ▼
Stock Issue Detail UI (Read-Only)
         │
         │ "View Full SR" action
         ▼
Store Requisition Detail Page
```
