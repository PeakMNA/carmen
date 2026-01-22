# Use Cases: Stock Cards

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Stock Cards |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated to single product detail page with 6 tabs; Added analytics and alerts use cases; Added quick actions use cases; Corrected transaction types to IN/OUT only |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

---

## 1. View Stock Card

### UC-SC-001: View Stock Card Detail
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- User is authenticated
- User has access to stock card module
- Product exists in system

**Main Flow**:
1. User navigates from stock cards list or directly via URL with productId
2. System displays loading skeleton
3. System loads product data via generateMockStockCardData
4. System calculates analytics data (trends, alerts, distributions)
5. System displays page header with product info and status badges
6. System displays alerts section if any alerts exist
7. System displays 6 summary cards
8. System displays tabs with default General Information tab

**Postconditions**:
- User sees complete stock card information
- Alerts are visible for critical/warning conditions
- Analytics are calculated and available

**Source Evidence**: `stock-card/page.tsx:73-89`

---

### UC-SC-002: View Stock Status
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Stock card is loaded

**Main Flow**:
1. System calculates stock status based on thresholds
2. If currentStock ≤ minimumStock → display "Low Stock" badge (red)
3. If currentStock ≥ maximumStock → display "Overstocked" badge (amber)
4. If normal → display green indicator
5. Progress bar shows stock level vs maximum

**Postconditions**:
- User clearly sees stock status
- Color coding indicates urgency

**Source Evidence**: `stock-card/page.tsx:213-215, 325-336`

---

## 2. View Summary Information

### UC-SC-003: View Summary Cards
**Actor**: All Users

**Preconditions**:
- Stock card is loaded

**Main Flow**:
1. User views 6 summary cards at top of page
2. Current Stock card shows quantity, unit, and progress bar
3. Current Value card shows total value and average cost
4. Days of Supply card shows calculated days and daily usage
5. Last Movement card shows date and type
6. Locations card shows count and primary location
7. Active Lots card shows available/total lot count

**Postconditions**:
- User has quick overview of key metrics
- Visual indicators highlight status

**Source Evidence**: `stock-card/page.tsx:392-529`

---

### UC-SC-004: View Days of Supply
**Actor**: Inventory Manager, Purchasing Staff

**Preconditions**:
- Stock card is loaded
- Movement history exists

**Main Flow**:
1. System calculates average daily usage from OUT transactions over 30 days
2. System calculates Days of Supply = currentStock / avgDailyUsage
3. If avgDailyUsage = 0, display "365+" days
4. Color coding: red (<7 days), amber (<14 days), green (≥14 days)

**Postconditions**:
- User understands how long stock will last
- Color indicates urgency

**Source Evidence**: `stock-card/page.tsx:159-162, 454-475`

---

## 3. View Alerts

### UC-SC-005: View Critical Alerts
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Stock card is loaded
- Alert conditions exist

**Main Flow**:
1. System checks for Low Stock Alert (currentStock ≤ minimumStock)
2. System checks for Expired Lots (lots with status = 'Expired')
3. Critical alerts display with red destructive variant
4. AlertCircle icon indicates critical status

**Postconditions**:
- User is aware of critical inventory issues
- Alerts are prominently displayed

**Source Evidence**: `stock-card/page.tsx:171-180, 203-211`

---

### UC-SC-006: View Warning Alerts
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Stock card is loaded
- Warning conditions exist

**Main Flow**:
1. System checks for Reorder Point Reached (currentStock ≤ reorderPoint AND > minimumStock)
2. System checks for Lots Expiring Soon (expiry within 30 days)
3. Warning alerts display with amber styling
4. AlertTriangle icon indicates warning status

**Postconditions**:
- User is aware of upcoming issues
- Can take proactive action

**Source Evidence**: `stock-card/page.tsx:181-201`

---

## 4. Tab Navigation

### UC-SC-007: Navigate Tabs
**Actor**: All Users

**Preconditions**:
- Stock card is loaded

**Main Flow**:
1. User clicks on one of 6 tabs
2. Tab options: General Information, Movement History, Lot Information, Valuation, Analytics, Actions
3. System displays corresponding tab content
4. Previous tab content is unmounted

**Postconditions**:
- Selected tab content is visible
- Tab indicator shows active tab

**Source Evidence**: `stock-card/page.tsx:534-542`

---

### UC-SC-008: View General Information
**Actor**: All Users

**Preconditions**:
- General Information tab is active

**Main Flow**:
1. User clicks "General Information" tab
2. System displays product details (name, code, category, unit)
3. System displays specifications (barcode, alternate unit, conversion factor)
4. System displays storage parameters (minimum, maximum, reorder point, reorder quantity)
5. System displays shelf life and storage requirements

**Postconditions**:
- User sees complete product information

---

### UC-SC-009: View Movement History
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Movement History tab is active

**Main Flow**:
1. User clicks "Movement History" tab
2. System displays movement records table
3. Table columns: Date/Time, Reference, Location, Type (IN/OUT), Reason, Quantity Change, Value Change
4. User can filter by transaction type
5. User can search by reference or location

**Postconditions**:
- User sees transaction history
- Can identify patterns and issues

**Note**: Only IN and OUT transaction types are available.

---

### UC-SC-010: View Lot Information
**Actor**: Storekeeper, Quality Manager

**Preconditions**:
- Lot Information tab is active

**Main Flow**:
1. User clicks "Lot Information" tab
2. System displays lot tracking table
3. Table columns: Lot Number, Expiry Date, Received Date, Quantity, Unit Cost, Value, Location, Status
4. Status options: Available, Reserved, Expired, Quarantine
5. Status badges color-coded appropriately

**Postconditions**:
- User sees all lot details
- Can identify expiring or problematic lots

---

### UC-SC-011: View Valuation
**Actor**: Financial Controller, Inventory Manager

**Preconditions**:
- Valuation tab is active

**Main Flow**:
1. User clicks "Valuation" tab
2. System displays valuation history
3. Table columns: Date, Reference, Type, Quantity, Unit Cost, Value, Running Quantity, Running Value, Running Avg Cost
4. Shows how average cost changes over time

**Postconditions**:
- User understands cost tracking
- Can verify valuation accuracy

---

## 5. Analytics

### UC-SC-012: View Movement Trend Chart
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User clicks "Analytics" tab
2. System displays Movement Trend chart (ComposedChart)
3. Chart shows last 30 days of In, Out, and Net movements
4. X-axis: Date, Y-axis: Quantity
5. User can hover for tooltip details

**Postconditions**:
- User sees movement patterns
- Can identify trends

**Source Evidence**: `stock-card/page.tsx:560-589`

---

### UC-SC-013: View Location Distribution
**Actor**: Inventory Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views Stock by Location section
2. System displays location distribution with progress bars
3. Each location shows quantity and percentage of total
4. Locations sorted by quantity descending
5. Value displayed for each location

**Postconditions**:
- User understands stock distribution
- Can identify imbalances

**Source Evidence**: `stock-card/page.tsx:591-616`

---

### UC-SC-014: View Lot Status Distribution
**Actor**: Quality Manager, Storekeeper

**Preconditions**:
- Analytics tab is active
- Product has lot tracking

**Main Flow**:
1. User views Lot Status Distribution section
2. System displays pie chart with lot status counts
3. Colors: Available (green), Reserved (blue), Expired (red), Quarantine (amber)
4. If no lots, display "No lot data available" message

**Postconditions**:
- User sees lot health at a glance

**Source Evidence**: `stock-card/page.tsx:617-656`

---

### UC-SC-015: View Movement Summary
**Actor**: All Users

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views Movement Summary by Type section
2. System displays cards for Receipts (IN) and Issues (OUT)
3. Each card shows total quantity and transaction count
4. Icons differentiate movement types

**Postconditions**:
- User sees summary of movement activity

**Source Evidence**: `stock-card/page.tsx:658-689`

---

## 6. Quick Actions

### UC-SC-016: Access Quick Actions
**Actor**: Storekeeper, Purchasing Staff

**Preconditions**:
- Actions tab is active

**Main Flow**:
1. User clicks "Actions" tab
2. System displays Quick Actions section with 3 buttons:
   - Create Purchase Request (ShoppingCart icon)
   - Request Transfer (Truck icon)
   - Adjust Stock (Target icon)
3. Each button has description text

**Postconditions**:
- User can initiate common actions
- Actions are contextually relevant

**Source Evidence**: `stock-card/page.tsx:692-722`

---

### UC-SC-017: View Recommended Actions
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Actions tab is active
- Alerts exist

**Main Flow**:
1. User views Recommended Actions section
2. System displays actions based on current alerts
3. Each recommendation shows alert icon, title, description
4. "Take Action" button for each recommendation

**Postconditions**:
- User has guided action items
- Can address issues systematically

**Source Evidence**: `stock-card/page.tsx:724-758`

---

### UC-SC-018: View Stock Parameters
**Actor**: Inventory Manager

**Preconditions**:
- Actions tab is active

**Main Flow**:
1. User views Stock Parameters section
2. System displays: Minimum Stock, Maximum Stock, Reorder Point, Reorder Quantity
3. "Edit Parameters" button available

**Postconditions**:
- User can review and update parameters

**Source Evidence**: `stock-card/page.tsx:760-797`

---

## 7. Header Actions

### UC-SC-019: Refresh Data
**Actor**: All Users

**Preconditions**:
- Stock card is loaded

**Main Flow**:
1. User clicks "Refresh" button
2. System shows loading state
3. System reloads stock card data
4. System recalculates analytics

**Postconditions**:
- Data is refreshed
- Analytics are updated

---

### UC-SC-020: Print Stock Card
**Actor**: All Users

**Preconditions**:
- Stock card is loaded

**Main Flow**:
1. User clicks "Print" button
2. System opens print dialog
3. User can print or save as PDF

**Postconditions**:
- Stock card is printed/saved

---

### UC-SC-021: Export Stock Card
**Actor**: Financial Controller, Inventory Manager

**Preconditions**:
- Stock card is loaded

**Main Flow**:
1. User clicks "Export" button
2. System generates export data
3. File downloads with stock card information

**Postconditions**:
- Export file downloaded

---

### UC-SC-022: Navigate Back
**Actor**: All Users

**Preconditions**:
- Stock card is loaded

**Main Flow**:
1. User clicks "Back" button
2. System navigates to stock cards list page

**Postconditions**:
- User returns to list view

---

## Use Case Summary Matrix

| UC ID | Use Case | Primary Actor | Priority |
|-------|----------|---------------|----------|
| UC-SC-001 | View Stock Card Detail | Storekeeper | High |
| UC-SC-002 | View Stock Status | Storekeeper | High |
| UC-SC-003 | View Summary Cards | All Users | High |
| UC-SC-004 | View Days of Supply | Inventory Manager | High |
| UC-SC-005 | View Critical Alerts | Storekeeper | Critical |
| UC-SC-006 | View Warning Alerts | Storekeeper | High |
| UC-SC-007 | Navigate Tabs | All Users | High |
| UC-SC-008 | View General Information | All Users | Medium |
| UC-SC-009 | View Movement History | Storekeeper | High |
| UC-SC-010 | View Lot Information | Storekeeper | Medium |
| UC-SC-011 | View Valuation | Financial Controller | Medium |
| UC-SC-012 | View Movement Trend Chart | Inventory Manager | Medium |
| UC-SC-013 | View Location Distribution | Inventory Manager | Medium |
| UC-SC-014 | View Lot Status Distribution | Quality Manager | Medium |
| UC-SC-015 | View Movement Summary | All Users | Low |
| UC-SC-016 | Access Quick Actions | Storekeeper | High |
| UC-SC-017 | View Recommended Actions | Storekeeper | High |
| UC-SC-018 | View Stock Parameters | Inventory Manager | Medium |
| UC-SC-019 | Refresh Data | All Users | Medium |
| UC-SC-020 | Print Stock Card | All Users | Low |
| UC-SC-021 | Export Stock Card | Financial Controller | Medium |
| UC-SC-022 | Navigate Back | All Users | Medium |

---

## Related Documents

- [BR-stock-cards.md](./BR-stock-cards.md) - Business Requirements
- [TS-stock-cards.md](./TS-stock-cards.md) - Technical Specification
- [FD-stock-cards.md](./FD-stock-cards.md) - Flow Diagrams
- [VAL-stock-cards.md](./VAL-stock-cards.md) - Validations
