# Use Cases: Inventory Aging

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Aging |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated expiry thresholds (30/90 days); Added alert viewing use cases; Added expiry timeline analytics; Added oldest items use case; Added value at risk summary use case |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. View Inventory Aging

### UC-AG-001: View Aging Summary
**Actor**: Quality Manager, Inventory Manager

**Preconditions**:
- User is authenticated
- User has access to inventory aging module

**Main Flow**:
1. User navigates to Inventory Management > Stock Overview > Inventory Aging
2. System displays loading state
3. System loads aging items with permission filtering
4. System calculates summary statistics
5. System calculates value at risk
6. System generates alerts for expired/near-expiry items
7. System displays 6 summary cards
8. System displays alert section (if any alerts)
9. System displays item list in default view

**Postconditions**:
- User sees aging items for permitted locations
- Value at risk displayed prominently
- Alerts visible for critical conditions

**Source Evidence**: `inventory-aging/page.tsx:84-120`

---

### UC-AG-002: View Alerts
**Actor**: Quality Manager, Inventory Manager

**Preconditions**:
- Inventory aging page is loaded
- Alert conditions exist

**Main Flow**:
1. System checks for expired items (daysToExpiry < 0)
2. System checks for near-expiry items (daysToExpiry < 90)
3. System displays destructive alert for expired items
4. System displays warning alert for near-expiry items

**Postconditions**:
- User sees prioritized alerts for action

**Source Evidence**: `inventory-aging/page.tsx:694-718`

---

### UC-AG-003: View Item Age Details
**Actor**: Storekeeper, Quality Manager

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User views item in list
2. User sees product code, name, category
3. User sees received date and age in days
4. User sees age bucket badge with color coding
5. User sees expiry date and days to expiry
6. User sees expiry status badge
7. User sees quantity, unit, and value

**Postconditions**:
- User understands item age and expiry status

**Source Evidence**: `inventory-aging/page.tsx:1003-1033`

---

## 2. Filter Aging Items

### UC-AG-004: Search Items
**Actor**: All Users

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User types in search box
2. System filters by product name, code, or lot number
3. System updates display in real-time
4. System updates summary statistics
5. System updates alerts

**Postconditions**:
- Only matching items displayed

**Source Evidence**: `inventory-aging/page.tsx:820-903`

---

### UC-AG-005: Filter by Category
**Actor**: Inventory Manager

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User clicks category dropdown
2. User selects category from dynamic list
3. System filters items by category
4. System updates all displays and statistics

**Postconditions**:
- Only items in selected category shown

---

### UC-AG-006: Filter by Age Bucket
**Actor**: Inventory Manager

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User clicks age bucket dropdown
2. User selects bucket (0-30, 31-60, 61-90, 90+)
3. System filters items by age bucket
4. System updates displays and statistics

**Postconditions**:
- Only items in selected age bucket shown

---

### UC-AG-007: Filter by Expiry Status
**Actor**: Quality Manager

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User clicks expiry status dropdown
2. User selects status (Good, Expiring Soon, Critical, Expired, No Expiry)
3. System filters items by expiry status
4. System updates displays

**Postconditions**:
- Only items with selected expiry status shown
- Useful for finding critical items

---

### UC-AG-008: Filter by Location
**Actor**: Storekeeper

**Preconditions**:
- Inventory aging page is loaded
- User has multiple locations assigned

**Main Flow**:
1. User clicks location dropdown
2. User selects from available locations
3. System filters items by location
4. System updates displays

**Postconditions**:
- Only items at selected location shown

---

## 3. Analyze Aging Data

### UC-AG-009: View Analytics Dashboard
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User clicks "Analytics" tab
2. System displays expiry timeline chart (next 12 weeks)
3. System displays age bucket distribution pie chart
4. System displays expiry status bar chart
5. System displays location aging performance chart
6. System displays category aging analysis table

**Postconditions**:
- User understands age and expiry distribution

**Source Evidence**: `inventory-aging/page.tsx:1124-1323`

---

### UC-AG-010: View Expiry Timeline
**Actor**: Inventory Manager, Quality Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views expiry timeline chart
2. Chart shows items expiring in next 12 weeks
3. Bars show item count per week
4. Line shows value at risk per week
5. User identifies peak expiry periods for planning

**Postconditions**:
- User can plan for upcoming expirations

**Source Evidence**: `inventory-aging/page.tsx:1124-1156`

---

### UC-AG-011: Analyze Age Distribution
**Actor**: Inventory Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views age bucket distribution pie chart
2. User sees segments for each age bucket (0-30, 31-60, 61-90, 90+)
3. User sees percentage breakdown
4. User hovers for exact counts

**Postconditions**:
- User understands inventory age profile

**Source Evidence**: `inventory-aging/page.tsx:1159-1203`

---

### UC-AG-012: Analyze Expiry Status
**Actor**: Quality Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views expiry status bar chart (horizontal)
2. User sees bars for: Good, Expiring Soon, Critical, Expired, No Expiry
3. User identifies dominant status
4. User focuses on critical/expired segments

**Postconditions**:
- User understands expiry risk distribution

**Source Evidence**: `inventory-aging/page.tsx:1205-1241`

---

### UC-AG-013: Analyze Location Aging Performance
**Actor**: Inventory Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views location aging performance chart
2. Chart shows bars for average age and at-risk items per location
3. Line shows total value per location
4. User identifies locations with aging problems

**Postconditions**:
- User can compare location performance

**Source Evidence**: `inventory-aging/page.tsx:1244-1278`

---

### UC-AG-014: View Category Aging Analysis
**Actor**: Inventory Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views category aging analysis table
2. Table shows: category, items, avg age, total value, expired value
3. Table sorted by average age descending
4. Progress bars show age distribution
5. User identifies problem categories

**Postconditions**:
- User understands category-level aging

**Source Evidence**: `inventory-aging/page.tsx:1281-1323`

---

### UC-AG-015: Assess Value at Risk
**Actor**: Financial Controller

**Preconditions**:
- Action Center tab is active

**Main Flow**:
1. User views value at risk summary panel
2. User sees already expired value with critical badge
3. User sees expiring <30 days value with urgent badge
4. User sees expiring 30-90 days value with monitor badge
5. User sees total value at risk

**Postconditions**:
- User can prioritize by financial impact

**Source Evidence**: `inventory-aging/page.tsx:1329-1367`

---

## 4. Use Grouped Views

### UC-AG-016: Group by Location
**Actor**: Inventory Manager

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User selects "Grouped" view mode
2. User selects "Group by Location" option
3. System groups items by location
4. System shows expand/collapse controls
5. System displays subtotals per location

**Postconditions**:
- Items organized by location
- Location-specific analysis possible

---

### UC-AG-017: Group by Age Bucket
**Actor**: Inventory Manager

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User selects "Grouped" view mode
2. User selects "Group by Age Bucket" option
3. System groups items by age bucket
4. System shows oldest items first (90+ at top)
5. System displays subtotals per bucket

**Postconditions**:
- Items organized by age
- FIFO planning facilitated

---

### UC-AG-018: Expand/Collapse Groups
**Actor**: All Users

**Preconditions**:
- Grouped view is active

**Main Flow**:
1. User clicks expand icon on group header
2. System expands group to show items
3. User clicks collapse icon
4. System collapses group

**Postconditions**:
- User can focus on specific groups

---

## 5. Take Action on Items

### UC-AG-019: View Action Center
**Actor**: Inventory Manager, Quality Manager

**Preconditions**:
- User has action permission

**Main Flow**:
1. User clicks "Action Center" tab
2. System displays value at risk summary panel
3. System displays critical items list (expired/near-expiry)
4. System displays oldest items list
5. System displays recommended actions

**Postconditions**:
- User sees prioritized action queue

**Source Evidence**: `inventory-aging/page.tsx:1326-1538`

---

### UC-AG-020: View Critical Items
**Actor**: Quality Manager

**Preconditions**:
- Action Center tab is active

**Main Flow**:
1. User views critical items list
2. System shows expired and near-expiry items
3. Items sorted by expiry date ascending
4. User sees top 10 items
5. User sees action buttons (Dispose for expired, Use/Transfer for near-expiry)

**Postconditions**:
- User can take immediate action on critical items

**Source Evidence**: `inventory-aging/page.tsx:1369-1440`

---

### UC-AG-021: View Oldest Items
**Actor**: Inventory Manager

**Preconditions**:
- Action Center tab is active

**Main Flow**:
1. User views oldest items list
2. System shows items with longest time in stock
3. Items sorted by ageInDays descending
4. User sees top 10 items
5. User sees action buttons

**Postconditions**:
- User can prioritize usage of oldest stock

**Source Evidence**: `inventory-aging/page.tsx:1442-1482`

---

### UC-AG-022: View Recommended Actions
**Actor**: Inventory Manager

**Preconditions**:
- Action Center tab is active

**Main Flow**:
1. User views recommended actions section
2. System shows "Dispose Expired" if expired items exist
3. System shows "Prioritize Usage" if near-expiry items exist
4. System shows "Rebalance Stock" if location has high avg age
5. User clicks to initiate recommended action

**Postconditions**:
- User guided to appropriate next steps

**Source Evidence**: `inventory-aging/page.tsx:1484-1538`

---

### UC-AG-023: Mark for Disposal
**Actor**: Quality Manager

**Preconditions**:
- Item is expired

**Main Flow**:
1. User selects expired item
2. User clicks "Dispose" action
3. System opens disposal dialog
4. User enters disposal reason
5. User selects disposal method
6. System creates disposal record

**Postconditions**:
- Item marked for disposal
- Audit record created

---

### UC-AG-024: Initiate FIFO Transfer
**Actor**: Inventory Manager

**Preconditions**:
- Item is in 90+ age bucket

**Main Flow**:
1. User selects old item
2. User clicks "Transfer" action
3. System suggests high-demand locations
4. User confirms transfer
5. System creates transfer request

**Postconditions**:
- Transfer initiated for FIFO compliance

---

## 6. Export Data

### UC-AG-025: Export Aging Report
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Data is loaded

**Main Flow**:
1. User clicks "Export" button
2. System generates export with current filters
3. System includes age and expiry data
4. File downloads to user's device

**Postconditions**:
- Export file contains filtered data with all fields

---

## 7. Access Control

### UC-AG-026: Location-Based Access
**Actor**: System (automatic)

**Preconditions**:
- User is authenticated

**Main Flow**:
1. System retrieves user context
2. System checks user role
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
| UC-AG-001 | View Aging Summary | Quality Manager | High |
| UC-AG-002 | View Alerts | Quality Manager | Critical |
| UC-AG-003 | View Item Age Details | Storekeeper | High |
| UC-AG-004 | Search Items | All Users | High |
| UC-AG-005 | Filter by Category | Inventory Manager | Medium |
| UC-AG-006 | Filter by Age Bucket | Inventory Manager | High |
| UC-AG-007 | Filter by Expiry Status | Quality Manager | High |
| UC-AG-008 | Filter by Location | Storekeeper | Medium |
| UC-AG-009 | View Analytics Dashboard | Financial Controller | High |
| UC-AG-010 | View Expiry Timeline | Inventory Manager | High |
| UC-AG-011 | Analyze Age Distribution | Inventory Manager | Medium |
| UC-AG-012 | Analyze Expiry Status | Quality Manager | High |
| UC-AG-013 | Analyze Location Performance | Inventory Manager | Medium |
| UC-AG-014 | View Category Analysis | Inventory Manager | Medium |
| UC-AG-015 | Assess Value at Risk | Financial Controller | High |
| UC-AG-016 | Group by Location | Inventory Manager | Medium |
| UC-AG-017 | Group by Age Bucket | Inventory Manager | High |
| UC-AG-018 | Expand/Collapse Groups | All Users | Low |
| UC-AG-019 | View Action Center | Quality Manager | High |
| UC-AG-020 | View Critical Items | Quality Manager | High |
| UC-AG-021 | View Oldest Items | Inventory Manager | High |
| UC-AG-022 | View Recommended Actions | Inventory Manager | High |
| UC-AG-023 | Mark for Disposal | Quality Manager | High |
| UC-AG-024 | Initiate FIFO Transfer | Inventory Manager | High |
| UC-AG-025 | Export Aging Report | Financial Controller | High |
| UC-AG-026 | Location-Based Access | System | Critical |

---

## Related Documents

- [BR-inventory-aging.md](./BR-inventory-aging.md) - Business Requirements
- [TS-inventory-aging.md](./TS-inventory-aging.md) - Technical Specification
- [FD-inventory-aging.md](./FD-inventory-aging.md) - Flow Diagrams
- [VAL-inventory-aging.md](./VAL-inventory-aging.md) - Validations
