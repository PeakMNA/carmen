# Use Cases: Inventory Transactions

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Transactions |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

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
  - System displays empty state message
  - User adjusts filters or date range

**Postconditions**:
- Transaction list displayed with pagination controls

---

## UC-TXN-002: Filter Transactions

**Actor**: Financial Controller, Department Manager

**Preconditions**:
- Transaction list is displayed
- User has filter panel access

**Main Flow**:
1. User clicks "Filters" to expand filter panel
2. User selects date range using calendar picker
3. User selects transaction types (IN/OUT/ADJUSTMENT)
4. User selects reference types (GRN, SO, etc.)
5. User selects location from dropdown
6. System applies filters and updates results
7. System displays active filter badges

**Alternative Flows**:
- **AF1**: Use quick date filter
  1. User clicks "Today", "7 Days", "30 Days", or "This Month"
  2. System applies date range automatically

- **AF2**: Clear filters
  1. User clicks "Clear All"
  2. System removes all active filters
  3. System reloads unfiltered data

**Postconditions**:
- Filtered transactions displayed
- Summary cards updated to reflect filtered data

---

## UC-TXN-003: Search Transactions

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

---

## UC-TXN-004: Sort Transactions

**Actor**: All users with view access

**Preconditions**:
- Transaction table is displayed

**Main Flow**:
1. User clicks sortable column header
2. System sorts by column in descending order
3. Sort indicator shows current direction
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

---

## UC-TXN-005: Change Page Size

**Actor**: All users with view access

**Preconditions**:
- Transaction table has more than 10 records

**Main Flow**:
1. User clicks page size selector
2. User selects 10, 25, or 50
3. System updates table to show selected number of rows
4. System resets to page 1

**Postconditions**:
- Table displays selected number of rows per page

---

## UC-TXN-006: Navigate Pages

**Actor**: All users with view access

**Preconditions**:
- Transaction list has multiple pages

**Main Flow**:
1. User clicks "Next" to go to next page
2. System loads next page of transactions
3. User clicks "Previous" to go back
4. System loads previous page

**Postconditions**:
- Current page indicator updated
- Table shows transactions for current page

---

## UC-TXN-007: View Analytics

**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Transaction data is loaded

**Main Flow**:
1. User clicks "Analytics" tab
2. System displays Transaction Trend area chart
3. System displays Distribution by Type pie chart
4. System displays Location Activity bar chart
5. System displays Reference Type bar chart
6. System displays Top Categories bar chart
7. User hovers on chart elements for tooltips

**Postconditions**:
- All analytics charts rendered with current filtered data

---

## UC-TXN-008: Export to CSV

**Actor**: Financial Controller, Inventory Manager

**Preconditions**:
- Transaction list is displayed
- At least one transaction exists in filtered results

**Main Flow**:
1. User clicks "Export CSV" button
2. System generates CSV with all filtered records
3. System includes columns: Date, Time, Reference, Reference Type, Product Code, Product Name, Category, Location, Transaction Type, Qty In, Qty Out, Unit Cost, Total Value, Balance Before, Balance After, User
4. Browser downloads file named `inventory-transactions-YYYY-MM-DD.csv`

**Alternative Flows**:
- **AF1**: No records to export
  - Export button is disabled
  - User adjusts filters to include records

**Postconditions**:
- CSV file downloaded to user's device

---

## UC-TXN-009: Refresh Data

**Actor**: All users with view access

**Preconditions**:
- Transaction page is displayed

**Main Flow**:
1. User clicks "Refresh" button
2. System shows loading state (spinning icon)
3. System reloads data with current filters
4. System updates table and summary cards

**Postconditions**:
- Data refreshed with latest transactions

---

## UC-TXN-010: View Transaction with Location Restriction

**Actor**: Department Storekeeper (limited access)

**Preconditions**:
- User has restricted location access (not System Administrator)
- User has `availableLocations` defined

**Main Flow**:
1. User navigates to Transactions page
2. System checks user's `availableLocations`
3. System auto-filters to only user's locations
4. Location dropdown shows only permitted locations
5. User views transactions for assigned locations only

**Postconditions**:
- Only transactions from user's locations displayed
- No access to other location data
