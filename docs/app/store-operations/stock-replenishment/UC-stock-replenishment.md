# Use Cases: Stock Replenishment Module

## 1. Use Case Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Stock Replenishment Module                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────────┐                                                      │
│   │Store Manager │──────┬─► UC-01: Monitor Stock Levels                │
│   └──────────────┘      │                                               │
│                         ├─► UC-02: Create Replenishment Request        │
│   ┌──────────────┐      │                                               │
│   │ Purchasing   │──────┼─► UC-03: Review Stock Availability           │
│   │ Staff        │      │                                               │
│   └──────────────┘      ├─► UC-04: Generate Purchase Request           │
│                         │                                               │
│   ┌──────────────┐      ├─► UC-05: View Stock Levels by Location       │
│   │ Department   │──────┤                                               │
│   │ Manager      │      └─► UC-06: View Replenishment History          │
│   └──────────────┘                                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Detailed Use Cases

---

### UC-01: Monitor Stock Levels Dashboard

**Actor**: Store Manager, Purchasing Staff, Department Manager

**Description**: View items below PAR level with urgency classification

**Preconditions**:
- User has access to Stock Replenishment module
- PAR levels configured for products at locations
- Stock balances are up to date

**Main Flow**:
1. User navigates to Stock Replenishment dashboard
2. System displays items below PAR level grouped by location
3. System shows urgency indicators:
   - Critical (red): Stock < 30% of PAR
   - Warning (amber): Stock 30-60% of PAR
   - Low (blue): Stock > 60% of PAR
4. System displays summary cards:
   - Total items below PAR
   - Critical count
   - Warning count
   - Low urgency count
5. User can filter by:
   - Urgency level (critical/warning/low)
   - Location
6. User can search by product name or SKU

**Alternative Flows**:
- **A1**: No items below PAR → System displays "All stock levels normal" message
- **A2**: Filter applied returns no results → System displays "No items match filters"

**Postconditions**:
- User has visibility of all stock requiring attention
- Items are sorted by urgency level

**Business Rules**:
- BR-REP-001, BR-REP-002, BR-REP-003, BR-REP-004

---

### UC-02: Create Replenishment Request

**Actor**: Store Manager, Department Manager

**Description**: Create a Store Requisition from items below PAR level

**Preconditions**:
- Items selected for replenishment
- User has permission to create Store Requisitions
- Destination location is valid (INVENTORY type)

**Main Flow**:
1. User selects items from dashboard (checkbox selection)
2. User clicks "Create Request" button
3. System opens replenishment request form
4. System auto-populates:
   - Selected items with suggested quantities
   - Destination location (user's assigned location)
   - Source location (based on stock availability)
5. User reviews and adjusts:
   - Requested quantities
   - Source location (if override needed)
   - Priority (standard/urgent/emergency)
   - Expected delivery date
6. System validates:
   - Source location has sufficient stock (or shows shortfall)
   - Destination location can receive transfers
7. User submits request
8. System creates Store Requisition
9. System redirects to Store Requisitions module

**Alternative Flows**:
- **A1**: No source stock available
  1. System sets source to "None" (PR-only workflow)
  2. All quantities directed to Purchase Request
  3. User confirms PR-only workflow
- **A2**: Partial stock available
  1. System shows available quantity and shortfall
  2. Available quantity → Stock Transfer
  3. Shortfall quantity → Purchase Request
- **A3**: User selects "None" as source
  1. System confirms PR-only workflow
  2. All quantities directed to Purchase Request

**Postconditions**:
- Store Requisition created with status "Draft" or "Submitted"
- Source replenishment IDs linked to SR

**Business Rules**:
- BR-REP-005, BR-REP-006, BR-REP-007, BR-REP-008, BR-REP-009, BR-REP-010, BR-REP-011, BR-REP-012

---

### UC-03: Review Stock Availability

**Actor**: Store Manager, Purchasing Staff

**Description**: Check source location availability before creating request

**Preconditions**:
- Items identified for replenishment
- Source location selected or suggested

**Main Flow**:
1. User reviews replenishment request items
2. For each item, system displays:
   - Requested quantity
   - Source location available quantity
   - Shortfall quantity (if any)
   - Alternative source locations
3. User can:
   - Change source location per item
   - Accept suggested allocation
   - Force PR-only for specific items

**Alternative Flows**:
- **A1**: Multiple source locations have stock
  1. System shows availability at each location
  2. User can split across sources (future enhancement)
  3. Currently, single source per request

**Postconditions**:
- User understands fulfillment breakdown
- Source allocation finalized

**Business Rules**:
- BR-REP-005, BR-REP-006, BR-REP-007

---

### UC-04: Generate Purchase Request (PR-Only Workflow)

**Actor**: Store Manager, Purchasing Staff

**Description**: Create PR when no internal stock available

**Preconditions**:
- Items require external procurement
- Source location set to "None" (NONE_SOURCE_ID)
- User has permission for PR workflow

**Main Flow**:
1. User selects items requiring external purchase
2. User selects "None" as source location
3. System displays PR-only workflow confirmation
4. User enters:
   - Requested quantities
   - Priority level
   - Required date
   - Notes/justification
5. System validates entries
6. User submits request
7. System creates Store Requisition
8. Upon SR approval, system generates:
   - Purchase Request document
   - Links PR to original SR

**Alternative Flows**:
- **A1**: Mixed fulfillment (partial stock + PR)
  1. System splits quantities
  2. Available stock → Stock Transfer
  3. Shortfall → Purchase Request

**Postconditions**:
- Store Requisition created for PR workflow
- PR generated upon approval

**Business Rules**:
- BR-REP-008, BR-REP-011, BR-REP-012

---

### UC-05: View Stock Levels by Location

**Actor**: Store Manager, Department Manager

**Description**: Monitor inventory levels across hotel locations

**Preconditions**:
- User has access to Stock Levels view
- Location data available

**Main Flow**:
1. User navigates to Stock Levels tab
2. System displays locations with:
   - Location name and code
   - Location type indicator (emoji/icon)
   - Stock status (critical/low/normal)
   - Items count per status
3. User can:
   - Filter by status
   - Search by location name
   - Click location for detailed view

**Alternative Flows**:
- **A1**: Location has no items below threshold
  1. System shows "Normal" status badge
  2. Green indicator displayed

**Postconditions**:
- User has overview of stock health by location

**Business Rules**:
- BR-REP-003, BR-REP-004

---

### UC-06: View Replenishment History

**Actor**: Store Manager, Purchasing Staff, Operations Manager

**Description**: Review historical replenishment activities and statistics

**Preconditions**:
- Historical data exists
- User has permission to view history

**Main Flow**:
1. User navigates to History tab
2. System displays:
   - Statistics cards:
     - Total transfers
     - Success rate percentage
     - Average delivery time
     - Total value
   - Monthly transfer trends chart
   - Transfers by location chart
3. User can filter by:
   - Date range
   - Status (completed/rejected/cancelled)
   - Location
4. User can view individual request details

**Alternative Flows**:
- **A1**: No history in selected period
  1. System displays "No data for selected period"
  2. Charts show empty state

**Postconditions**:
- User has insight into replenishment performance

---

## 3. Use Case Relationships

```
UC-01 Monitor Stock Levels
    │
    ├──► includes ──► UC-03 Review Stock Availability
    │
    └──► extends ──► UC-02 Create Replenishment Request
                         │
                         ├──► includes ──► UC-03 Review Stock Availability
                         │
                         └──► extends ──► UC-04 Generate PR (PR-Only Workflow)

UC-05 View Stock Levels by Location
    │
    └──► includes ──► UC-01 Monitor Stock Levels (filtered)

UC-06 View Replenishment History
    │
    └──► standalone (reporting/analytics)
```

## 4. Actor Permissions Matrix

| Use Case | Store Manager | Purchasing Staff | Department Manager | Finance Manager |
|----------|---------------|------------------|-------------------|-----------------|
| UC-01: Monitor Stock Levels | ✓ | ✓ | ✓ (own dept) | View Only |
| UC-02: Create Replenishment | ✓ | ✓ | ✓ (own dept) | ✗ |
| UC-03: Review Availability | ✓ | ✓ | ✓ | View Only |
| UC-04: Generate PR | ✓ | ✓ | Request Only | ✗ |
| UC-05: View Stock Levels | ✓ | ✓ | ✓ (own dept) | ✓ |
| UC-06: View History | ✓ | ✓ | ✓ (own dept) | ✓ |

## 5. User Journey Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Replenishment Request Journey                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. DISCOVER        2. SELECT         3. CONFIGURE       4. SUBMIT         │
│  ─────────────      ─────────────     ─────────────      ─────────────     │
│                                                                             │
│  View Dashboard     Select Items      Choose Source      Review & Submit   │
│       │                 │                  │                   │           │
│       ▼                 ▼                  ▼                   ▼           │
│  ┌─────────┐       ┌─────────┐        ┌─────────┐        ┌─────────┐      │
│  │ Filter  │──────►│Checkbox │───────►│ Source  │───────►│ Create  │      │
│  │ Urgency │       │ Select  │        │Location │        │   SR    │      │
│  └─────────┘       └─────────┘        └─────────┘        └─────────┘      │
│       │                 │                  │                   │           │
│  ┌─────────┐       ┌─────────┐        ┌─────────┐        ┌─────────┐      │
│  │ View    │       │ Floating│        │Priority │        │Redirect │      │
│  │ Summary │       │ Action  │        │& Notes  │        │to SR    │      │
│  └─────────┘       │ Bar     │        └─────────┘        │ Module  │      │
│                    └─────────┘                           └─────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6. Exception Scenarios

| Scenario | Trigger | System Response |
|----------|---------|-----------------|
| No items below PAR | All stock above threshold | Display empty state with success message |
| Source unavailable | All source locations at zero | Force PR-only workflow |
| Invalid destination | DIRECT location selected | Block and show validation error |
| Network timeout | API call fails | Show error toast, allow retry |
| Concurrent edit | Another user modified item | Refresh data, show conflict warning |
