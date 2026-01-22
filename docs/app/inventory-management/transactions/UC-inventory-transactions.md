# Use Cases: Inventory Transactions

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Transactions |
| Version | 2.0.0 |
| Last Updated | 2025-01-16 |

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-01-16 | Documentation Team | Updated transaction types to IN/OUT only; Updated reference types; Added source evidence |
| 1.0.0 | 2024-01-15 | Documentation Team | Initial version |

---

## UC-TXN-001: View Transaction List

**Actor**: Storekeeper, Receiving Clerk, Inventory Manager

**Preconditions**:
- User is authenticated
- User has access to at least one location

**Main Flow**:
1. User navigates to Inventory Management > Transactions
2. System loads transactions for user's accessible locations
3. System displays summary cards with totals
4. System displays transaction table (default: 10 rows, sorted by date desc)
5. User views transaction details in table columns

**Alternative Flows**:
- **AF1**: No transactions exist
  - System displays empty state message with icon
  - User adjusts filters or date range

**Postconditions**:
- Transaction list displayed with pagination controls

**Source Evidence**: `page.tsx:60-89`, `components/TransactionTable.tsx:161-171`

---

## UC-TXN-002: Filter Transactions by Date Range

**Actor**: Financial Controller, Department Manager

**Preconditions**:
- Transaction list is displayed
- User has filter panel access

**Main Flow**:
1. User clicks "Filters" to expand filter panel
2. User clicks date range button to open calendar
3. User selects start date and end date
4. System applies date range filter
5. System updates results and summary cards
6. System displays active date filter as badge

**Alternative Flows**:
- **AF1**: Use quick date filter
  1. User clicks "Today", "7 Days", "30 Days", or "This Month"
  2. System calculates date range automatically
  3. System applies filter and updates results

- **AF2**: Clear date filter
  1. User clicks X on date filter badge
  2. System removes date filter
  3. System reloads data without date restriction

**Postconditions**:
- Filtered transactions displayed for selected date range

**Source Evidence**: `components/TransactionFilters.tsx:94-122`, `components/TransactionFilters.tsx:233-274`

---

## UC-TXN-003: Filter by Transaction Type

**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Transaction list is displayed

**Main Flow**:
1. User expands filter panel
2. User clicks "Inbound" or "Outbound" button
3. System toggles transaction type filter
4. System filters to show only selected type(s)
5. User can select multiple types

**Alternative Flows**:
- **AF1**: Select both types
  1. User clicks both Inbound and Outbound
  2. System shows all transactions (same as no filter)

**Postconditions**:
- Only IN or OUT transactions displayed based on selection

**Source Evidence**: `components/TransactionFilters.tsx:59-64`, `components/TransactionFilters.tsx:276-294`

---

## UC-TXN-004: Filter by Reference Type

**Actor**: Financial Controller, Inventory Manager

**Preconditions**:
- Transaction list is displayed

**Main Flow**:
1. User expands filter panel
2. User views reference type badges (GRN, SO, ADJ, ST, SI, WO, PC, WR, etc.)
3. User clicks one or more reference type badges
4. System toggles selected reference types
5. System filters transactions to show only selected reference types

**Reference Types Available**:
- GRN (Goods Received Note)
- SO (Sales Order)
- ADJ (Adjustment)
- ST (Stock Transfer)
- SI (Stock Issue)
- WO (Write Off)
- PC (Physical Count)
- WR (Wastage Report)

**Postconditions**:
- Only transactions matching selected reference types displayed

**Source Evidence**: `components/TransactionFilters.tsx:66-76`, `components/TransactionFilters.tsx:340-357`

---

## UC-TXN-005: Search Transactions

**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Transaction list is displayed

**Main Flow**:
1. User enters search term in search box
2. System filters transactions matching:
   - Product name
   - Product code
   - Reference number
   - Location name
   - Category name
   - User name
3. System updates results in real-time
4. User views matching transactions

**Postconditions**:
- Only matching transactions displayed

**Source Evidence**: `components/TransactionFilters.tsx:51-53`, `components/TransactionFilters.tsx:157-165`

---

## UC-TXN-006: Sort Transactions

**Actor**: All users with view access

**Preconditions**:
- Transaction table is displayed with data

**Main Flow**:
1. User clicks sortable column header
2. System sorts by column in descending order
3. Sort indicator (arrow) shows current direction
4. User clicks same header again
5. System toggles to ascending order

**Sortable Columns**:
- Date/Time
- Reference
- Product
- Location
- Qty In
- Qty Out
- Value

**Postconditions**:
- Table sorted by selected column and direction

**Source Evidence**: `components/TransactionTable.tsx:62-94`, `components/TransactionTable.tsx:104-118`

---

## UC-TXN-007: Change Page Size

**Actor**: All users with view access

**Preconditions**:
- Transaction table has more than 10 records

**Main Flow**:
1. User clicks page size selector dropdown
2. User selects 10, 25, or 50
3. System updates table to show selected number of rows
4. System resets to page 1

**Postconditions**:
- Table displays selected number of rows per page

**Source Evidence**: `components/TransactionTable.tsx:120-123`, `components/TransactionTable.tsx:349-358`

---

## UC-TXN-008: Navigate Pages

**Actor**: All users with view access

**Preconditions**:
- Transaction list has multiple pages

**Main Flow**:
1. User clicks "Next" to go to next page
2. System loads next page of transactions
3. User clicks "Previous" to go back
4. System loads previous page

**Boundary Conditions**:
- Previous button disabled on page 1
- Next button disabled on last page

**Postconditions**:
- Current page indicator updated
- Table shows transactions for current page

**Source Evidence**: `components/TransactionTable.tsx:364-391`

---

## UC-TXN-009: View Analytics

**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Transaction data is loaded

**Main Flow**:
1. User clicks "Analytics" tab
2. System displays Transaction Trend area chart (Inbound/Outbound/Adjustment over time)
3. System displays Distribution by Type pie chart (IN/OUT)
4. System displays Location Activity bar chart (Inbound vs Outbound)
5. System displays Reference Type horizontal bar chart
6. System displays Top Categories by Value horizontal bar chart (top 8)
7. User hovers on chart elements for tooltips

**Postconditions**:
- All analytics charts rendered with current filtered data

**Source Evidence**: `page.tsx:245-256`, `components/TransactionAnalytics.tsx:61-293`

---

## UC-TXN-010: Export to CSV

**Actor**: Financial Controller, Inventory Manager

**Preconditions**:
- Transaction list is displayed
- At least one transaction exists in filtered results

**Main Flow**:
1. User clicks "Export CSV" button
2. System generates CSV with all filtered records
3. System includes 16 columns: Date, Time, Reference, Reference Type, Product Code, Product Name, Category, Location, Transaction Type, Qty In, Qty Out, Unit Cost, Total Value, Balance Before, Balance After, User
4. Browser downloads file named `inventory-transactions-YYYY-MM-DD.csv`

**Alternative Flows**:
- **AF1**: No records to export
  - Export button is disabled
  - User adjusts filters to include records

**Postconditions**:
- CSV file downloaded to user's device

**Source Evidence**: `page.tsx:97-154`

---

## UC-TXN-011: Refresh Data

**Actor**: All users with view access

**Preconditions**:
- Transaction page is displayed

**Main Flow**:
1. User clicks "Refresh" button
2. Button shows spinning icon during load
3. System reloads data with current filters
4. System updates table and summary cards

**Postconditions**:
- Data refreshed with latest transactions

**Source Evidence**: `page.tsx:91-95`, `page.tsx:180-188`

---

## UC-TXN-012: View Transaction with Location Restriction

**Actor**: Department Storekeeper (limited access)

**Preconditions**:
- User has restricted location access (not System Administrator)
- User has `availableLocations` defined

**Main Flow**:
1. User navigates to Transactions page
2. System checks user's role
3. If not System Administrator, system gets `availableLocations`
4. System auto-filters data to only user's locations
5. Location dropdown shows only permitted locations
6. User views transactions for assigned locations only

**Postconditions**:
- Only transactions from user's locations displayed
- No access to other location data

**Source Evidence**: `page.tsx:43-56`, `page.tsx:66-81`

---

## UC-TXN-013: Clear All Filters

**Actor**: All users with view access

**Preconditions**:
- At least one filter is active

**Main Flow**:
1. User clicks "Clear All" button
2. System resets all filters to default:
   - Date range: undefined
   - Transaction types: []
   - Reference types: []
   - Locations: []
   - Categories: []
   - Search term: ''
3. System reloads unfiltered data
4. Active filter badges are removed

**Postconditions**:
- All filters cleared
- Full dataset displayed (subject to location permissions)

**Source Evidence**: `components/TransactionFilters.tsx:124-133`

---

## Related Documents

- [BR-inventory-transactions.md](./BR-inventory-transactions.md) - Business Requirements
- [TS-inventory-transactions.md](./TS-inventory-transactions.md) - Technical Specification
- [FD-inventory-transactions.md](./FD-inventory-transactions.md) - Flow Diagrams
- [VAL-inventory-transactions.md](./VAL-inventory-transactions.md) - Validations
