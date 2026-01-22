# Use Cases: Slow Moving Inventory

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Slow Moving |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Added alert viewing use cases; Added aging distribution analytics; Added quick actions use cases; Updated field names to match code |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. View Slow Moving Inventory

### UC-SM-001: View Slow Moving Summary
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- User is authenticated
- User has access to slow moving module

**Main Flow**:
1. User navigates to Inventory Management > Stock Overview > Slow Moving
2. System displays loading skeleton
3. System loads slow-moving items with permission filtering
4. System calculates summary statistics
5. System generates alerts based on conditions
6. System displays 6 summary cards
7. System displays alerts section (if any alerts)
8. System displays item list in default tab

**Postconditions**:
- User sees slow-moving items for permitted locations
- Summary statistics reflect filtered data
- Alerts visible for critical conditions

**Source Evidence**: `slow-moving/page.tsx:54-89`

---

### UC-SM-002: View Alerts
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Slow moving page is loaded
- Alert conditions exist

**Main Flow**:
1. System checks for critical risk items (120+ days idle)
2. System checks for write-off recommendations
3. System checks for items inactive 180+ days
4. System displays critical alerts with red styling
5. System displays warning alerts with amber styling

**Postconditions**:
- User sees prioritized alerts for action

**Source Evidence**: `slow-moving/page.tsx:419-444`

---

### UC-SM-003: View Item Details
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User views item in list
2. User sees product code, name, category
3. User sees current stock with unit
4. User sees days since movement and risk level badge
5. User sees suggested action badge
6. User sees inventory value and turnover rate

**Postconditions**:
- User understands item status and recommendation

**Source Evidence**: `slow-moving/page.tsx:858-885`

---

## 2. Filter Slow Moving Items

### UC-SM-004: Search Items
**Actor**: All Users

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User types in search input
2. System filters by product name or product code
3. System updates display in real-time
4. System recalculates summary statistics
5. System updates alerts and analytics

**Postconditions**:
- Only matching items displayed
- Statistics reflect filtered data

**Source Evidence**: `slow-moving/page.tsx:696-768`

---

### UC-SM-005: Filter by Category
**Actor**: Inventory Manager

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User clicks category dropdown
2. User selects category from dynamic list
3. System filters items by category
4. System updates all displays and statistics

**Postconditions**:
- Only items in selected category shown

---

### UC-SM-006: Filter by Risk Level
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User clicks risk level dropdown
2. User selects level (Low/Medium/High/Critical)
3. System filters items by risk level
4. System updates displays and statistics

**Postconditions**:
- Only items at selected risk level shown
- Useful for prioritizing critical items

---

### UC-SM-007: Filter by Suggested Action
**Actor**: Inventory Manager

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User clicks action dropdown
2. User selects action (Transfer/Promote/Write Off/Hold)
3. System filters items by suggested action
4. System updates displays

**Postconditions**:
- Only items with selected action shown
- Enables batch action planning

---

### UC-SM-008: Filter by Location
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Slow moving page is loaded
- User has multiple locations assigned

**Main Flow**:
1. User clicks location dropdown
2. User selects from available locations
3. System filters items by location
4. System updates displays

**Postconditions**:
- Only items at selected location shown

---

## 3. Analyze Slow Moving Data

### UC-SM-009: View Analytics Dashboard
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User clicks "Analytics" tab
2. System displays risk distribution pie chart
3. System displays action distribution pie chart
4. System displays aging distribution chart (bars + line)
5. System displays category breakdown with progress bars
6. System displays location breakdown with progress bars
7. User hovers for detailed tooltips

**Postconditions**:
- User understands risk and action distribution
- User identifies problem areas

**Source Evidence**: `slow-moving/page.tsx:964-1125`

---

### UC-SM-010: Analyze Risk Distribution
**Actor**: Financial Controller

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views risk distribution pie chart
2. Chart shows: Critical (red), High (orange), Medium (yellow), Low (green)
3. User sees percentage breakdown by risk level
4. User hovers for exact counts
5. Legend displays all risk levels

**Postconditions**:
- User understands overall risk profile

**Source Evidence**: `slow-moving/page.tsx:964-995`

---

### UC-SM-011: Analyze Action Distribution
**Actor**: Inventory Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views action distribution pie chart
2. Chart shows: Transfer (blue), Promote (purple), Write Off (red), Hold (gray)
3. User sees percentage by suggested action
4. User hovers for exact counts

**Postconditions**:
- User understands recommended action mix

**Source Evidence**: `slow-moving/page.tsx:997-1029`

---

### UC-SM-012: View Aging Distribution
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views aging distribution composed chart
2. X-axis shows day ranges: 30-60, 60-90, 90-120, 120-180, 180+
3. Bars show item count per range
4. Line shows value per range
5. User identifies concentration of old items

**Postconditions**:
- User understands aging pattern of slow-moving inventory

**Source Evidence**: `slow-moving/page.tsx:1033-1061`

---

### UC-SM-013: Analyze Category Breakdown
**Actor**: Inventory Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views category breakdown section
2. System displays top 10 categories by value
3. Progress bars show relative distribution
4. Each category shows items count, value, avg days

**Postconditions**:
- User identifies problem categories

**Source Evidence**: `slow-moving/page.tsx:1065-1091`

---

### UC-SM-014: Analyze Location Breakdown
**Actor**: Inventory Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views location breakdown section
2. System displays locations sorted by value
3. Progress bars show relative distribution
4. Critical badge shown for locations with critical items
5. Each location shows items count, value, critical count

**Postconditions**:
- User identifies locations with highest slow-moving value

**Source Evidence**: `slow-moving/page.tsx:1093-1125`

---

## 4. Take Action on Items

### UC-SM-015: View Action Center
**Actor**: Inventory Manager

**Preconditions**:
- User has action permission

**Main Flow**:
1. User clicks "Action Center" tab
2. System displays Quick Actions section with 4 buttons
3. System displays Recommended Actions by risk level
4. System displays Action Summary cards

**Postconditions**:
- User sees prioritized action queue

**Source Evidence**: `slow-moving/page.tsx:1127-1285`

---

### UC-SM-016: Use Quick Actions
**Actor**: Inventory Manager

**Preconditions**:
- Action Center tab is active

**Main Flow**:
1. User views 4 quick action buttons:
   - Bulk Transfer (ArrowRightLeft icon)
   - Create Promotion (Megaphone icon)
   - Request Write-Off (Trash2 icon)
   - Export Report (FileDown icon)
2. User clicks desired action button
3. System initiates corresponding workflow

**Postconditions**:
- Action workflow started

**Source Evidence**: `slow-moving/page.tsx:1141-1163`

---

### UC-SM-017: View Recommended Actions by Risk
**Actor**: Inventory Manager

**Preconditions**:
- Action Center tab is active
- Critical or high risk items exist

**Main Flow**:
1. User views Critical Risk section (red border)
2. User sees top 5 critical items with action badges
3. User views High Risk section (orange border)
4. User sees top 5 high risk items with action badges
5. User can expand to view all items in category

**Postconditions**:
- User has prioritized list for action

**Source Evidence**: `slow-moving/page.tsx:1168-1238`

---

### UC-SM-018: Initiate Transfer
**Actor**: Inventory Manager

**Preconditions**:
- Item has "Transfer" recommendation
- User has transfer permission

**Main Flow**:
1. User identifies item with transfer recommendation
2. User clicks "Transfer" action
3. System opens transfer dialog
4. User selects destination location
5. User confirms transfer quantity
6. System initiates transfer process

**Postconditions**:
- Transfer request created
- Item action status updated

---

### UC-SM-019: Initiate Promotion
**Actor**: Inventory Manager

**Preconditions**:
- Item has "Promote" recommendation

**Main Flow**:
1. User identifies item with promote recommendation
2. User clicks "Promote" action
3. System opens promotion dialog
4. User sets promotional price/discount
5. User sets promotion period
6. System creates promotion

**Postconditions**:
- Promotion created for item
- Item status updated

---

### UC-SM-020: Execute Write-Off
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Item has "Write Off" recommendation
- User has write-off permission

**Main Flow**:
1. User identifies item with write-off recommendation
2. User clicks "Write Off" action
3. System shows confirmation dialog
4. User enters reason/justification
5. User confirms write-off
6. System processes inventory adjustment

**Postconditions**:
- Item written off from inventory
- Adjustment record created

---

### UC-SM-021: View Action Summary
**Actor**: Inventory Manager

**Preconditions**:
- Action Center tab is active

**Main Flow**:
1. User views 4 action summary cards:
   - Transfer (blue) - count of transfer items
   - Promote (purple) - count of promote items
   - Write Off (red) - count of write-off items
   - Hold (gray) - count of hold items
2. Each card shows count and label

**Postconditions**:
- User understands action distribution

**Source Evidence**: `slow-moving/page.tsx:1241-1285`

---

## 5. View Modes

### UC-SM-022: Switch to List View
**Actor**: All Users

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User clicks "List" view toggle
2. System displays items in table format
3. User can sort by columns
4. Table shows all item details in rows

**Postconditions**:
- Items displayed in list format

**Source Evidence**: `slow-moving/page.tsx:672-694`

---

### UC-SM-023: Switch to Grouped View
**Actor**: All Users

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User clicks "Grouped" view toggle
2. System groups items by location
3. User can expand/collapse groups
4. User sees subtotals per location (items, quantity, value, avg days, critical count)

**Postconditions**:
- Items displayed grouped by location

---

## 6. Export Data

### UC-SM-024: Export Slow Moving Report
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Data is loaded

**Main Flow**:
1. User clicks "Export" button in header or Action Center
2. System generates export with current filters applied
3. System includes all item fields
4. File downloads to user's device

**Postconditions**:
- Export file contains filtered data

---

## 7. Access Control

### UC-SM-025: Location-Based Access
**Actor**: System (automatic)

**Preconditions**:
- User is authenticated

**Main Flow**:
1. System retrieves user context
2. System checks user role and available locations
3. If not System Administrator:
   - System filters by availableLocations
4. System displays permitted items only
5. Location filter dropdown shows only permitted locations

**Postconditions**:
- User sees only authorized data

---

## Use Case Summary Matrix

| UC ID | Use Case | Primary Actor | Priority |
|-------|----------|---------------|----------|
| UC-SM-001 | View Slow Moving Summary | Inventory Manager | High |
| UC-SM-002 | View Alerts | Inventory Manager | Critical |
| UC-SM-003 | View Item Details | All Users | High |
| UC-SM-004 | Search Items | All Users | High |
| UC-SM-005 | Filter by Category | Inventory Manager | Medium |
| UC-SM-006 | Filter by Risk Level | Financial Controller | High |
| UC-SM-007 | Filter by Action | Inventory Manager | High |
| UC-SM-008 | Filter by Location | Storekeeper | Medium |
| UC-SM-009 | View Analytics Dashboard | Financial Controller | High |
| UC-SM-010 | Analyze Risk Distribution | Financial Controller | High |
| UC-SM-011 | Analyze Action Distribution | Inventory Manager | Medium |
| UC-SM-012 | View Aging Distribution | Financial Controller | High |
| UC-SM-013 | Analyze Category Breakdown | Inventory Manager | Medium |
| UC-SM-014 | Analyze Location Breakdown | Inventory Manager | Medium |
| UC-SM-015 | View Action Center | Inventory Manager | High |
| UC-SM-016 | Use Quick Actions | Inventory Manager | High |
| UC-SM-017 | View Recommended Actions | Inventory Manager | High |
| UC-SM-018 | Initiate Transfer | Inventory Manager | High |
| UC-SM-019 | Initiate Promotion | Inventory Manager | Medium |
| UC-SM-020 | Execute Write-Off | Financial Controller | High |
| UC-SM-021 | View Action Summary | Inventory Manager | Medium |
| UC-SM-022 | Switch to List View | All Users | Medium |
| UC-SM-023 | Switch to Grouped View | All Users | Medium |
| UC-SM-024 | Export Report | Financial Controller | High |
| UC-SM-025 | Location-Based Access | System | Critical |

---

## Related Documents

- [BR-slow-moving.md](./BR-slow-moving.md) - Business Requirements
- [TS-slow-moving.md](./TS-slow-moving.md) - Technical Specification
- [FD-slow-moving.md](./FD-slow-moving.md) - Flow Diagrams
- [VAL-slow-moving.md](./VAL-slow-moving.md) - Validations
