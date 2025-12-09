# Use Cases: Inventory Balance

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Balance |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. View Inventory Balance Summary

### UC-BAL-001: View Current Balance Summary
**Actor**: Inventory Manager, Storekeeper, Financial Controller

**Preconditions**:
- User is authenticated
- User has access to inventory balance module
- User has at least one location assigned

**Main Flow**:
1. User navigates to Inventory Management > Stock Overview > Inventory Balance
2. System displays loading state with skeleton placeholders
3. System loads user context and filters locations by permission
4. System calculates total quantities and values for accessible locations
5. System displays summary cards:
   - Total Quantity with trend indicator
   - Total Value with trend indicator
   - Location count
   - Category count
6. System displays "As of" date header

**Postconditions**:
- User sees accurate summary metrics
- Data reflects user's permitted locations only

**Alternative Flows**:
- **AF1**: System Administrator views all locations without filtering
- **AF2**: Empty state displayed if no inventory data exists

---

## 2. Filter Balance Report

### UC-BAL-002: Apply Location Filter
**Actor**: Inventory Manager, Storekeeper

**Preconditions**:
- Inventory Balance page is loaded
- User has multiple locations assigned

**Main Flow**:
1. User clicks "Filters" to expand filter panel
2. User enters location range (From/To)
3. System displays loading indicator
4. System filters data by selected location range
5. System updates summary cards with filtered totals
6. System displays "Location" filter badge
7. System updates table and charts with filtered data

**Postconditions**:
- Data displays only for selected location range
- Filter badge shows active filter
- Summary metrics reflect filtered data

**Alternative Flows**:
- **AF1**: User clicks X on badge to remove filter
- **AF2**: User selects only "From" location for single location view

---

### UC-BAL-003: Apply Category Filter
**Actor**: Inventory Manager

**Preconditions**:
- Inventory Balance page is loaded

**Main Flow**:
1. User expands filter panel
2. User enters category range (From/To)
3. System applies category filter
4. System displays "Category" filter badge
5. System updates all data displays

**Postconditions**:
- Data filtered to selected category range
- Charts reflect category filtering

---

### UC-BAL-004: Apply Product Filter
**Actor**: Inventory Manager, Storekeeper

**Preconditions**:
- Inventory Balance page is loaded

**Main Flow**:
1. User expands filter panel
2. User enters product range (From/To)
3. System applies product filter
4. System displays "Product" filter badge
5. System updates balance table

**Postconditions**:
- Table shows only products in range
- Summary metrics reflect filtered products

---

### UC-BAL-005: Set As-of Date
**Actor**: Financial Controller, Inventory Manager

**Preconditions**:
- Inventory Balance page is loaded

**Main Flow**:
1. User expands filter panel
2. User selects date from calendar picker
3. System loads balance as of selected date
4. System displays selected date in header
5. System updates all data for historical point-in-time

**Postconditions**:
- Balance reflects inventory state at selected date
- Header shows "As of [selected date]"

---

### UC-BAL-006: Clear All Filters
**Actor**: All Users

**Preconditions**:
- One or more filters are active

**Main Flow**:
1. User clicks "Clear All" or removes all filter badges
2. System clears all filter parameters
3. System reloads default data (current date, all permitted locations)
4. System removes all filter badges

**Postconditions**:
- Data returns to default unfiltered state
- No active filter badges displayed

---

## 3. View Balance Details

### UC-BAL-007: Expand Location Details
**Actor**: Inventory Manager, Storekeeper

**Preconditions**:
- Balance table is displayed

**Main Flow**:
1. User clicks on location row or expand icon
2. System expands location to show categories
3. User clicks on category row
4. System expands category to show products
5. User views product-level quantities and values

**Postconditions**:
- Hierarchical data displayed
- Totals match parent-level aggregations

---

### UC-BAL-008: View Lot Details
**Actor**: Storekeeper, Quality Manager

**Preconditions**:
- Balance table is displayed
- Products have lot tracking enabled

**Main Flow**:
1. User enables "Show Lots" toggle
2. System reloads data with lot-level detail
3. User expands product to see lot breakdown
4. User views lot numbers, quantities, expiry dates, and values

**Postconditions**:
- Lot-level detail visible for tracked products
- Lot quantities sum to product total

---

### UC-BAL-009: Change View Type
**Actor**: All Users

**Preconditions**:
- Balance table is displayed

**Main Flow**:
1. User clicks view type selector (PRODUCT/CATEGORY/LOT)
2. System switches to selected view level
3. System reorganizes table display accordingly

**Postconditions**:
- Table displays at selected aggregation level
- Totals remain consistent across views

---

## 4. Analyze Inventory

### UC-BAL-010: View Analytics Tab
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Balance page is loaded with data

**Main Flow**:
1. User clicks "Analytics" tab
2. System displays value trend chart (6-month)
3. System displays category distribution pie chart
4. System displays location bar charts

**Postconditions**:
- All charts render with current filtered data
- Interactive tooltips provide detail on hover

---

### UC-BAL-011: Analyze Value Trend
**Actor**: Financial Controller

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views inventory value trend area chart
2. User hovers over data points for monthly values
3. User identifies trends (increasing/decreasing)
4. User notes seasonal patterns

**Postconditions**:
- User understands inventory value trajectory
- Insights inform budget planning

---

### UC-BAL-012: Analyze Category Distribution
**Actor**: Inventory Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views category distribution pie chart
2. User identifies dominant categories by value
3. User hovers for percentage breakdown
4. User compares category investments

**Postconditions**:
- User understands inventory composition
- Informs category management decisions

---

### UC-BAL-013: Compare Location Stock
**Actor**: Inventory Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views stock by location bar chart
2. User compares quantity distribution
3. User views value by location bar chart
4. User identifies imbalanced locations

**Postconditions**:
- User understands location distribution
- Identifies potential transfer opportunities

---

## 5. View Insights

### UC-BAL-014: Review High Value Items
**Actor**: Financial Controller, Inventory Manager

**Preconditions**:
- Insights tab is active

**Main Flow**:
1. User clicks "Insights" tab
2. System displays top 5 items by value
3. User reviews product, location, quantity, and value
4. User clicks item to navigate to stock card

**Postconditions**:
- User identifies highest value inventory
- Can take action on high-value items

---

### UC-BAL-015: Review Low Stock Alerts
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Insights tab is active
- Low stock items exist

**Main Flow**:
1. User views low stock items table
2. User identifies items below threshold
3. User clicks "View Items" button in alert banner
4. User creates purchase request or transfer

**Postconditions**:
- User aware of low stock situations
- Can initiate replenishment action

---

### UC-BAL-016: Analyze Location Performance
**Actor**: Inventory Manager

**Preconditions**:
- Insights tab is active

**Main Flow**:
1. User views location performance table
2. User compares total items, value, and percentage
3. User identifies concentration risks
4. User reviews average item value by location

**Postconditions**:
- User understands location efficiency
- Can plan inventory optimization

---

## 6. View Movement History

### UC-BAL-017: View Recent Movements
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Movement History tab is active

**Main Flow**:
1. User clicks "Movement History" tab
2. System displays recent transactions
3. User filters by transaction type (IN/OUT/ADJUSTMENT)
4. User clicks transaction to view source document

**Postconditions**:
- User sees recent inventory activity
- Can trace transactions to source

---

## 7. Export Data

### UC-BAL-018: Export Balance Report
**Actor**: Financial Controller, Inventory Manager

**Preconditions**:
- Balance data is loaded
- Filters applied as needed

**Main Flow**:
1. User clicks "Export" button
2. System generates file with filtered data
3. System includes summary, detail, and metadata
4. File downloads to user's device

**Postconditions**:
- Export file contains filtered dataset
- Filename includes date stamp

---

## 8. Access Control

### UC-BAL-019: Location-Based Access
**Actor**: System (automatic)

**Preconditions**:
- User is authenticated

**Main Flow**:
1. System retrieves user context
2. System checks user role
3. If not System Administrator:
   - System filters locations by `availableLocations`
4. System recalculates totals for permitted locations

**Postconditions**:
- User sees only authorized data
- Totals reflect permitted locations only

---

## Use Case Summary Matrix

| UC ID | Use Case | Primary Actor | Priority |
|-------|----------|---------------|----------|
| UC-BAL-001 | View Balance Summary | All Users | High |
| UC-BAL-002 | Apply Location Filter | Inventory Manager | High |
| UC-BAL-003 | Apply Category Filter | Inventory Manager | Medium |
| UC-BAL-004 | Apply Product Filter | Storekeeper | Medium |
| UC-BAL-005 | Set As-of Date | Financial Controller | High |
| UC-BAL-006 | Clear All Filters | All Users | Medium |
| UC-BAL-007 | Expand Location Details | Inventory Manager | High |
| UC-BAL-008 | View Lot Details | Storekeeper | Medium |
| UC-BAL-009 | Change View Type | All Users | Medium |
| UC-BAL-010 | View Analytics Tab | Inventory Manager | High |
| UC-BAL-011 | Analyze Value Trend | Financial Controller | High |
| UC-BAL-012 | Analyze Category Distribution | Inventory Manager | Medium |
| UC-BAL-013 | Compare Location Stock | Inventory Manager | Medium |
| UC-BAL-014 | Review High Value Items | Financial Controller | High |
| UC-BAL-015 | Review Low Stock Alerts | Storekeeper | High |
| UC-BAL-016 | Analyze Location Performance | Inventory Manager | Medium |
| UC-BAL-017 | View Recent Movements | Storekeeper | Medium |
| UC-BAL-018 | Export Balance Report | Financial Controller | High |
| UC-BAL-019 | Location-Based Access | System | Critical |
