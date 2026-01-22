# Use Cases: Inventory Balance

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Balance |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Updated movement history use cases for IN/OUT only; Added inventory status use cases; Removed Analytics and Insights tabs; Added pagination use case |
| 2.0.0 | 2024-06-15 | System | Previous version |
| 1.0 | 2024-01-15 | Documentation Team | Initial version |

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
5. System displays balance report with hierarchical data
6. System displays "As of" date header

**Postconditions**:
- User sees accurate balance data
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
1. User enters location range (From/To) in filter panel
2. User clicks "Apply" button
3. System displays loading indicator
4. System filters data by selected location range
5. System updates table with filtered data

**Postconditions**:
- Data displays only for selected location range
- Summary metrics reflect filtered data

**Alternative Flows**:
- **AF1**: User clicks Reset to clear all filters
- **AF2**: User selects only "From" location for single location view

---

### UC-BAL-003: Apply Category Filter
**Actor**: Inventory Manager

**Preconditions**:
- Inventory Balance page is loaded

**Main Flow**:
1. User enters category range (From/To) in filter panel
2. User clicks "Apply" button
3. System applies category filter
4. System updates all data displays

**Postconditions**:
- Data filtered to selected category range

---

### UC-BAL-004: Apply Product Filter
**Actor**: Inventory Manager, Storekeeper

**Preconditions**:
- Inventory Balance page is loaded

**Main Flow**:
1. User enters product range (From/To) in filter panel
2. User clicks "Apply" button
3. System applies product filter
4. System updates balance table

**Postconditions**:
- Table shows only products in range
- Summary metrics reflect filtered products

---

### UC-BAL-005: Set As-of Date
**Actor**: Financial Controller, Inventory Manager

**Preconditions**:
- Inventory Balance page is loaded

**Main Flow**:
1. User clicks date picker in filter panel
2. User selects date from calendar
3. User clicks "Apply" button
4. System loads balance as of selected date
5. System displays selected date in header

**Postconditions**:
- Balance reflects inventory state at selected date
- Header shows "As of [selected date]"

---

### UC-BAL-006: Clear All Filters
**Actor**: All Users

**Preconditions**:
- One or more filters are active

**Main Flow**:
1. User clicks "Reset" button
2. System clears all filter parameters
3. System reloads default data (current date, all permitted locations)

**Postconditions**:
- Data returns to default unfiltered state
- All filter inputs cleared

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
5. User views product-level quantities, values, and inventory status

**Postconditions**:
- Hierarchical data displayed
- Totals match parent-level aggregations

---

### UC-BAL-008: View Lot Details
**Actor**: Storekeeper, Quality Manager

**Preconditions**:
- Balance table is displayed
- Products have lot tracking enabled (tracking.batch = true)

**Main Flow**:
1. User expands product with lot tracking
2. System displays lot-level detail
3. User views lot numbers, quantities, expiry dates, unit costs, and values

**Postconditions**:
- Lot-level detail visible for tracked products
- Lot quantities sum to product total

---

### UC-BAL-009: View Inventory Status
**Actor**: Inventory Manager, Storekeeper

**Preconditions**:
- Balance table is displayed with products expanded

**Main Flow**:
1. User views product rows in expanded state
2. System displays inventory status badge for each product:
   - **Low** (red): quantity ≤ minimum threshold
   - **Normal** (green): minimum < quantity < maximum
   - **High** (amber): quantity ≥ maximum threshold

**Postconditions**:
- User can quickly identify stock level issues

**Source Evidence**: `components/BalanceTable.tsx:112-121`

---

### UC-BAL-010: Navigate to Stock Card
**Actor**: All Users

**Preconditions**:
- Balance table is displayed with products visible

**Main Flow**:
1. User clicks on a product row
2. System navigates to Stock Card page for selected product

**Postconditions**:
- User is on Stock Card page
- Product context preserved

---

## 4. View Movement History

### UC-BAL-011: View Recent Movements
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Movement History tab is active

**Main Flow**:
1. User clicks "Movement History" tab
2. System displays summary cards (Total In, Total Out, Net Change, Transactions)
3. System displays movement table with recent transactions
4. User views transaction details

**Postconditions**:
- User sees recent inventory activity
- Summary cards show accurate totals

---

### UC-BAL-012: Filter by Transaction Type
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Movement History tab is active

**Main Flow**:
1. User selects transaction type from dropdown:
   - All Types
   - In (IN transactions)
   - Out (OUT transactions)
2. System filters movement records by selected type
3. System updates table display

**Postconditions**:
- Table shows only selected transaction type
- Summary cards update accordingly

**Note**: Only IN and OUT transaction types are available. No ADJUSTMENT type.

**Source Evidence**: `components/MovementHistory.tsx:298-310`

---

### UC-BAL-013: Filter by Date Range
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Movement History tab is active

**Main Flow**:
1. User clicks date range picker
2. User selects start date and end date
3. System filters movement records within date range
4. System updates table display

**Postconditions**:
- Table shows movements within selected date range

---

### UC-BAL-014: Search Movements
**Actor**: All Users

**Preconditions**:
- Movement History tab is active

**Main Flow**:
1. User enters search term in search input
2. System filters by product name, product code, reference, location, or reason
3. System updates table display

**Postconditions**:
- Table shows matching movements
- Search is case-insensitive

**Source Evidence**: `components/MovementHistory.tsx:90-98`

---

### UC-BAL-015: Navigate Movement Pages
**Actor**: All Users

**Preconditions**:
- Movement History tab is active
- More than 10 movements exist

**Main Flow**:
1. User views current page of movements (10 per page)
2. User clicks "Next" to view next page
3. User clicks "Previous" to view previous page
4. System updates displayed records

**Postconditions**:
- Correct page of movements displayed
- Pagination controls update state

**Source Evidence**: `components/MovementHistory.tsx:398-420`

---

## 5. Export Data

### UC-BAL-016: Export Balance Report
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

### UC-BAL-017: Export Movement History
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Movement History tab is active

**Main Flow**:
1. User clicks "Export" button on Movement History tab
2. System generates file with filtered movement data
3. File downloads to user's device

**Postconditions**:
- Export file contains filtered movements
- Filename includes date stamp

---

## 6. Access Control

### UC-BAL-018: Location-Based Access
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
| UC-BAL-009 | View Inventory Status | Inventory Manager | High |
| UC-BAL-010 | Navigate to Stock Card | All Users | High |
| UC-BAL-011 | View Recent Movements | Storekeeper | Medium |
| UC-BAL-012 | Filter by Transaction Type | Storekeeper | Medium |
| UC-BAL-013 | Filter by Date Range | Inventory Manager | Medium |
| UC-BAL-014 | Search Movements | All Users | Medium |
| UC-BAL-015 | Navigate Movement Pages | All Users | Low |
| UC-BAL-016 | Export Balance Report | Financial Controller | High |
| UC-BAL-017 | Export Movement History | Inventory Manager | Medium |
| UC-BAL-018 | Location-Based Access | System | Critical |

---

## Related Documents

- [BR-inventory-balance.md](./BR-inventory-balance.md) - Business Requirements
- [TS-inventory-balance.md](./TS-inventory-balance.md) - Technical Specification
- [FD-inventory-balance.md](./FD-inventory-balance.md) - Flow Diagrams
- [VAL-inventory-balance.md](./VAL-inventory-balance.md) - Validations
