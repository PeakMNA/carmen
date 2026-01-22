# Use Cases: Inventory Adjustments

**Module**: Inventory Management
**Sub-module**: Inventory Adjustments
**Version**: 2.0.0
**Last Updated**: 2026-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-16 | Documentation Team | Updated to match current UI: Stock-in/Stock-out header buttons, Two-Level Category/Reason classification, updated source evidence |
| 1.1.0 | 2025-12-09 | Documentation Team | Updated to match implementation: type-specific adjustment reasons, costing rules, type change restrictions |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Table of Contents
1. [Use Case Index](#use-case-index)
2. [User Use Cases](#user-use-cases)
3. [System Use Cases](#system-use-cases)

### Related Documentation
**Shared Methods** (Infrastructure):
- **[SM: Costing Methods](../../shared-methods/inventory-valuation/SM-costing-methods.md)** - Transaction system, FIFO consumption, lot tracking
- **[SM: Period-End Snapshots](../../shared-methods/inventory-valuation/SM-period-end-snapshots.md)** - Period management integration

**Module Documentation**:
- [Business Requirements](./BR-inventory-adjustments.md)
- [Technical Specification](./TS-inventory-adjustments.md)
- [Data Definition](./DD-inventory-adjustments.md)
- [Flow Diagrams](./FD-inventory-adjustments.md)
- [Validations](./VAL-inventory-adjustments.md)

---

## Use Case Index

### User Use Cases
- **UC-INV-ADJ-001**: View Adjustment List
- **UC-INV-ADJ-002**: Search and Filter Adjustments
- **UC-INV-ADJ-003**: Navigate to Adjustment Details
- **UC-INV-ADJ-004**: Create New Adjustment (Stock-in or Stock-out)
- **UC-INV-ADJ-005**: Edit Draft Adjustment
- **UC-INV-ADJ-006**: Add Items to Adjustment
- **UC-INV-ADJ-007**: View Stock Movement by Lot
- **UC-INV-ADJ-008**: View Journal Entries
- **UC-INV-ADJ-009**: Post Adjustment
- **UC-INV-ADJ-010**: Void Posted Adjustment

### System Use Cases
- **UC-INV-ADJ-101**: Load Adjustment List Data
- **UC-INV-ADJ-102**: Calculate Adjustment Totals
- **UC-INV-ADJ-103**: Generate Journal Entries
- **UC-INV-ADJ-104**: Update Stock Balances

---

## User Use Cases

### UC-INV-ADJ-001: View Adjustment List

**Actor(s)**: Storekeeper, Warehouse Manager, Financial Controller

**Priority**: Critical

**Preconditions**:
- User is authenticated
- User has "Inventory View" permission
- User is assigned to at least one location

**Postconditions**:
- List of adjustments displayed
- User can see status, type, and details of each adjustment

**Main Flow**:
1. User navigates to `/inventory-management/inventory-adjustments` route
2. System displays loading state
3. System loads adjustment list data (UC-INV-ADJ-101)
4. System renders page header with:
   - Title: "Inventory Adjustments"
   - **Stock-in button** (green, navigates to `/new?type=in`)
   - **Stock-out button** (red/destructive, navigates to `/new?type=out`)
5. System renders adjustment list table with columns:
   - Adjustment # (ID) - format ADJ-YYMM-NNNN
   - Date
   - Type (IN/OUT with StatusBadge)
   - Location
   - Reason
   - Items count
   - Total Value (formatted currency)
   - Status (Draft/Posted/Voided badge)
   - Actions menu (three-dot icon)
6. System displays search bar above table
7. System displays filter/sort options button
8. List renders with all adjustments visible (consolidated view, no tabs)

**Alternative Flows**:

**AF-001: First Time User**
- At step 5: No adjustments exist yet
- System displays empty state message
- User can click Stock-in or Stock-out button to create first adjustment

**AF-002: Large Dataset**
- At step 5: More than 50 adjustments exist
- System implements pagination
- User can navigate between pages

**Exception Flows**:

**EF-001: Loading Error**
- At step 3: API call fails
- System displays error message
- System offers "Retry" button

**Source Evidence**: `page.tsx:63-96` (header with Stock-in/Stock-out buttons), `components/inventory-adjustment-list.tsx:273-376` (table rendering)

---

### UC-INV-ADJ-002: Search and Filter Adjustments

**Actor(s)**: All users with inventory access

**Priority**: High

**Preconditions**:
- User is viewing adjustment list (UC-INV-ADJ-001)
- Adjustments are loaded

**Postconditions**:
- List filtered/sorted according to user criteria
- Filter indicators visible

**Main Flow**:
1. User views adjustment list
2. User types in search box
3. System filters results in real-time as user types
4. System searches across all fields: ID, date, type, status, location, reason
5. Filtered results display immediately
6. User clicks "Filter/Sort" button
7. System displays filter options:
   - Status: Posted, Draft, Voided
   - Type: Stock In, Stock Out (maps to IN/OUT values)
   - Location: Main Warehouse, Production Store, etc.
8. User selects one or more filters
9. System applies filters cumulatively (four-stage pipeline)
10. User selects sort field (Date, ID, Total Value, Items)
11. System sorts results ascending or descending
12. Filtered and sorted list displays

**Alternative Flows**:

**AF-001: Clear Search**
- At step 5: User clears search box
- System restores full list
- Filters remain active if set

**AF-002: No Results**
- At step 5: Search/filter yields no matches
- System displays "No adjustments found" message
- System suggests clearing filters

**Exception Flows**:

**EF-001: Performance Issue**
- At step 3: Large dataset causes lag
- System implements debouncing (300ms delay)
- Results update after user stops typing

**Source Evidence**: `components/inventory-adjustment-list.tsx:186-191` (searchQuery state), `209-267` (filteredAndSortedData useMemo with four-stage pipeline), `components/filter-sort-options.tsx`

---

### UC-INV-ADJ-003: Navigate to Adjustment Details

**Actor(s)**: All users with inventory access

**Priority**: Critical

**Preconditions**:
- User is viewing adjustment list
- At least one adjustment exists

**Postconditions**:
- User viewing full adjustment details
- All data loaded

**Main Flow**:
1. User views adjustment list
2. User clicks on adjustment row or "View Details" in actions menu
3. System navigates to `/inventory-management/inventory-adjustments/[id]`
4. System displays loading state
5. System loads adjustment data including:
   - Header information (ID, date, type, status, location, category, description)
   - All items with quantities, costs, reasons
   - Audit trail (Created By/At, Posted By/At)
6. System renders detail page with:
   - Color-coded type indicator (green banner for IN, red banner for OUT)
   - Header section (ID, date, status, location, category, description)
   - Action buttons (Edit for Draft, Print)
   - Items table with product details
   - Summary section with totals
7. User can view all adjustment details

**Alternative Flows**:

**AF-001: Draft Adjustment**
- At step 6: Adjustment status is "Draft"
- System shows "Edit" button in header
- Edit button navigates to `/[id]/edit`

**AF-002: Posted Adjustment**
- At step 6: Adjustment status is "Posted"
- No Edit button visible
- All fields read-only
- Shows Posted By and Posted At in audit trail

**AF-003: Voided Adjustment**
- At step 6: Adjustment status is "Voided"
- All fields read-only
- Shows Voided status badge

**Exception Flows**:

**EF-001: Adjustment Not Found**
- At step 5: Invalid ID or deleted adjustment
- System displays "Adjustment not found" error
- System offers "Back to List" button

**Source Evidence**: `[id]/page.tsx:1-683` (detail page), `components/inventory-adjustment-list.tsx:313` (row click navigation)

---

### UC-INV-ADJ-004: Create New Adjustment (Stock-in or Stock-out)

**Actor(s)**: Storekeeper, Warehouse Manager

**Priority**: Critical

**Preconditions**:
- User has "Inventory Create" permission
- User has at least one accessible location

**Postconditions**:
- New adjustment created in Draft status
- Adjustment # auto-generated (ADJ-YYMM-NNNN format)
- Ready for item entry

**Main Flow**:
1. User views adjustment list page
2. User clicks **Stock-in** button (green) OR **Stock-out** button (red)
3. System navigates to `/inventory-management/inventory-adjustments/new?type=in` or `?type=out`
4. System displays adjustment creation form with:
   - Type indicator locked based on URL parameter (cannot change)
   - Date field (defaults to today)
   - Location dropdown (user's accessible locations)
   - **Category dropdown** (Two-Level Classification - header level)
   - Description (free text, optional)
5. System displays **type-specific category options**:

   **For Stock IN adjustments (type=in):**
   - Physical Count Variance
   - Found Items
   - Return to Stock
   - System Correction
   - Other

   **For Stock OUT adjustments (type=out):**
   - Damaged Goods
   - Expired Items
   - Theft / Loss
   - Spoilage
   - Physical Count Variance
   - Quality Control Rejection
   - Other

6. User fills required fields: Location, Category
7. User optionally adds Description
8. User adds items using inline add pattern:
   - Search and select products from dropdown
   - Enter adjustment quantity
   - Select item-level **Reason** (filtered by header category)
   - For Stock IN: Enter unit cost (required)
   - For Stock OUT: System uses average cost automatically (read-only)
9. System calculates line totals and summary totals in real-time
10. User clicks "Save as Draft" or can navigate away
11. System validates all required fields
12. System generates Adjustment # (ADJ-YYMM-NNNN format)
13. System creates adjustment with Draft status
14. System navigates to adjustment detail page or list

**Alternative Flows**:

**AF-001: Discard Changes**
- At any time: User clicks back or navigates away with unsaved changes
- System shows discard confirmation dialog
- User confirms discard or cancels to stay on page

**AF-002: Bulk Item Selection**
- At step 8: User selects multiple items using checkboxes
- User can delete selected items in bulk

**Exception Flows**:

**EF-001: Validation Error**
- At step 11: Required fields missing
- System displays validation errors
- System highlights missing fields with red indicators
- User corrects and resubmits

**EF-002: No Items Added**
- At step 10: User tries to save without items
- System prevents save
- System displays "At least one item required" message

**Source Evidence**: `page.tsx:72-85` (Stock-in/Stock-out buttons), `new/page.tsx:1-1237` (create form with inline item add), `new/page.tsx:99-149` (AdjustmentItem and AdjustmentFormData interfaces)

---

### UC-INV-ADJ-005: Edit Draft Adjustment

**Actor(s)**: Storekeeper, Warehouse Manager

**Priority**: High

**Preconditions**:
- Adjustment exists with "Draft" status
- User has edit permission

**Postconditions**:
- Adjustment updated with changes
- Still in Draft status
- Changes saved

**Main Flow**:
1. User views adjustment detail page (Draft status)
2. System displays "Edit" button in header
3. User clicks "Edit" button
4. System navigates to `/inventory-management/inventory-adjustments/[id]/edit`
5. System loads current adjustment data into edit form
6. User can modify:
   - Location
   - Category (type-specific dropdown)
   - Description
   - **Note**: Type (IN/OUT) cannot be changed after creation
7. User can modify items:
   - Edit quantities
   - Edit item-level reasons
   - For Stock IN: Edit unit costs (required)
   - For Stock OUT: Unit costs auto-calculated from average cost (read-only)
   - Add new items using inline add pattern
   - Remove items (individual or bulk selection)
8. System recalculates totals in real-time
9. User clicks "Save" button
10. System validates all changes:
    - Location required
    - Category required
    - At least one item required
    - For Stock IN: All items have unit cost > 0
    - For Stock OUT: Quantities validated
11. System updates adjustment record
12. System displays success message
13. System navigates to detail page

**Alternative Flows**:

**AF-001: Discard Changes**
- At any time: User clicks "Cancel" or navigates away
- System shows discard confirmation dialog if unsaved changes exist
- User confirms discard or cancels to stay

**Exception Flows**:

**EF-001: Validation Error**
- At step 10: Invalid data entered (negative quantities, missing costs)
- System displays validation errors
- User corrects errors

**EF-002: Concurrent Edit**
- At step 11: Another user modified same adjustment
- System detects conflict
- System displays warning
- User chooses to overwrite or reload

**Source Evidence**: `[id]/edit/page.tsx` (edit page), `[id]/page.tsx:282-287` (Edit button visibility for Draft status)

---

### UC-INV-ADJ-006: Add Items to Adjustment

**Actor(s)**: Storekeeper, Warehouse Manager

**Priority**: Critical

**Preconditions**:
- Adjustment in Draft status (new or edit mode)
- User on create/edit page

**Postconditions**:
- New items added to adjustment
- Totals recalculated
- Items ready for posting

**Main Flow**:
1. User views adjustment create/edit page
2. System displays items section with:
   - Search/select product dropdown
   - Items table showing added items
   - Summary totals
3. User searches for product by name in dropdown
4. System displays matching products from inventory
5. User selects product from dropdown
6. System adds item row to table with:
   - Product name and SKU
   - Current stock (On Hand)
   - UOM
   - Adjustment quantity field (editable)
   - **Reason dropdown** (item-level, filtered by header category)

   **For Stock OUT adjustments:**
   - Unit cost = product's average cost (auto-filled, read-only)

   **For Stock IN adjustments:**
   - Unit cost field (editable, required)

7. User enters:
   - Adjustment quantity (positive number)
   - Item-level reason (optional, filtered by category)
   - For Stock IN: Unit cost (required)
8. System calculates:
   - Total value = Unit Cost x Adjustment Quantity
9. Item appears in table with all details
10. System updates summary section:
    - Total items count
    - Total quantity
    - Total value (color-coded: green for IN, red for OUT)

**Alternative Flows**:

**AF-001: Add Multiple Items**
- At step 5: User can repeat selection to add more items
- Each selection adds a new row
- User can continue adding without saving

**AF-002: Edit Item Inline**
- At any time: User modifies quantity or cost directly in table row
- Changes reflected immediately
- Totals recalculate in real-time

**AF-003: Remove Items**
- User clicks delete icon on item row
- Item removed from table
- Totals recalculate

**AF-004: Bulk Delete Items**
- User selects multiple items using checkboxes
- User clicks bulk delete button
- Selected items removed

**Exception Flows**:

**EF-001: Product Not Found**
- At step 4: Search yields no results
- System displays "No products found" in dropdown
- User refines search

**EF-002: Duplicate Product**
- At step 5: Product already in items list
- System may warn or allow (depends on implementation)
- User can increase quantity of existing item instead

**Source Evidence**: `new/page.tsx:610-850` (inline item add pattern), `new/page.tsx:99-149` (AdjustmentItem interface), `new/page.tsx:272-305` (addItem handler)

---

### UC-INV-ADJ-007: View Stock Movement by Lot

**Actor(s)**: Storekeeper, Quality Control Inspector, Head Chef

**Priority**: High

**Preconditions**:
- Adjustment exists with items
- User viewing adjustment details

**Postconditions**:
- User understands lot-level stock changes
- Traceability information visible

**Main Flow**:
1. User views adjustment detail page
2. System displays items table with:
   - Product name and SKU
   - Quantity
   - UOM
   - Unit cost
   - Total cost per item
3. For posted adjustments, lot information included:
   - Lot numbers affected
   - IN/OUT quantity per lot
4. System displays totals:
   - Total quantity
   - Total value
5. User can view all items affected by adjustment

**Alternative Flows**:

**AF-001: Multiple Lots Per Item**
- At step 3: Item has multiple lots
- System shows expanded view with lot details
- Each lot displayed separately with quantities

**AF-002: No Lots Yet (Draft)**
- At step 2: Adjustment in Draft, lots not assigned
- System displays items without lot details
- Message: "Lot assignment will occur on posting"

**Exception Flows**:

**EF-001: Missing Lot Data**
- At step 3: Lot information incomplete
- System displays "N/A" for missing data
- System highlights items needing attention

**Source Evidence**: `[id]/page.tsx:383-456` (items table in detail view)

---

### UC-INV-ADJ-008: View Journal Entries

**Actor(s)**: Financial Controller, Accounting Manager, Warehouse Manager

**Priority**: High

**Preconditions**:
- Adjustment status is "Posted"
- Journal entries generated
- User has accounting view permission

**Postconditions**:
- User verifies accounting impact
- GL account distribution visible

**Main Flow**:
1. User views adjustment detail page (Posted status)
2. System displays journal information section:
   - Journal # (JE-YYMM-NNNN)
   - Posting Date
   - Posting Period (YYYY-MM)
   - Reference (links to adjustment #)
3. System displays audit trail:
   - Created By (user name)
   - Created At (timestamp)
   - Posted By (user name)
   - Posted At (timestamp)
4. System displays journal entries:
   - Account code
   - Account name
   - Debit amount
   - Credit amount
   - Department
5. System shows totals:
   - Total Debits
   - Total Credits
6. System verifies balance: Total Debits = Total Credits
7. User can review accounting impact

**Alternative Flows**:

**AF-001: Multiple Departments**
- At step 4: Adjustment spans multiple departments
- Each entry shows department allocation
- User can filter by department

**AF-002: Export Journal Entries**
- At any time: User clicks "Print" button
- System generates printable view
- File includes all journal details

**Exception Flows**:

**EF-001: Draft Adjustment**
- At step 1: Adjustment not yet posted
- Journal entries section not displayed
- Message: "Journal entries will be generated upon posting"

**Source Evidence**: `[id]/page.tsx:146-205` (mock journal data), journal entry display in detail page

---

### UC-INV-ADJ-009: Post Adjustment

**Actor(s)**: Warehouse Manager, Store Manager

**Priority**: Critical

**Preconditions**:
- Adjustment status is "Draft"
- Adjustment has at least one item
- All items have quantities and costs
- User has "Post Adjustment" permission

**Postconditions**:
- Adjustment status changed to "Posted"
- Stock balances updated
- Journal entries created and posted
- Inventory transactions recorded
- Cannot be edited anymore

**Main Flow**:
1. User views adjustment detail page (Draft status)
2. System displays "Post" button in header actions
3. User reviews all items, quantities, and costs
4. User clicks "Post" button
5. System displays confirmation dialog:
   - "Post this adjustment? This action cannot be undone."
   - Summary: Total items, Total cost
   - Warning: Stock balances and GL will be updated
6. User confirms posting
7. System validates adjustment:
   - All items have quantities > 0
   - All items have unit costs
   - At least one item exists
   - Location is valid
   - Category is set
8. System begins posting process:
   - Creates inventory transactions for each item
   - Updates stock balances by location and lot
   - Generates balanced journal entries
   - Creates GL postings
9. System updates adjustment:
   - Status = "Posted"
   - Posted By = current user
   - Posted At = current timestamp
10. System displays success message: "Adjustment posted successfully"
11. System refreshes page showing Posted status
12. "Post" button removed, "Edit" button hidden

**Alternative Flows**:

**AF-001: Cancel Posting**
- At step 6: User clicks "Cancel" on confirmation
- No changes made
- Returns to adjustment detail

**Exception Flows**:

**EF-001: Validation Failed**
- At step 7: One or more validation errors
- System displays specific error messages
- System highlights problematic items
- User must correct before reposting

**EF-002: Insufficient Stock for OUT**
- At step 8: OUT adjustment would create negative stock
- System displays warning
- User chooses to: continue with override, or cancel and adjust quantities

**EF-003: System Error During Posting**
- At step 8: Database error or system failure
- System rolls back all changes
- Adjustment remains in Draft
- Error logged and admin notified
- User shown error message with reference #

**Source Evidence**: `[id]/page.tsx:299-318` (Post button and handler)

---

### UC-INV-ADJ-010: Void Posted Adjustment

**Actor(s)**: Financial Controller, Warehouse Manager

**Priority**: Medium

**Preconditions**:
- Adjustment status is "Posted"
- User has "Void Adjustment" permission
- No dependent transactions reference this adjustment

**Postconditions**:
- Adjustment status changed to "Voided"
- Reversing journal entries created
- Stock balances restored to pre-adjustment values
- Original data preserved for audit

**Main Flow**:
1. User views adjustment detail page (Posted status)
2. System displays "Void" button in header actions
3. User clicks "Void" button
4. System displays void confirmation dialog:
   - "Void this adjustment? This will reverse all stock and accounting impacts."
   - Requires reason for voiding (dropdown)
   - Optional notes field
5. User selects void reason:
   - Error in quantities
   - Wrong location
   - Duplicate entry
   - Other (requires notes)
6. User enters optional notes
7. User confirms void
8. System validates:
   - Adjustment is Posted (not already Voided)
   - No dependent transactions
   - User has permission
9. System begins void process:
   - Creates reversing inventory transactions
   - Restores stock balances (reverses original changes)
   - Generates reversing journal entries (opposite DR/CR)
   - Posts to GL
10. System updates adjustment:
    - Status = "Voided"
    - Voided By = current user
    - Voided At = current timestamp
    - Void Reason = selected reason
    - Void Notes = entered notes
11. System displays success message: "Adjustment voided successfully"
12. System refreshes page showing Voided status
13. All action buttons disabled (read-only)

**Alternative Flows**:

**AF-001: Cancel Void**
- At step 7: User clicks "Cancel"
- No changes made
- Returns to adjustment detail

**Exception Flows**:

**EF-001: Dependent Transactions Exist**
- At step 9: Other transactions reference this adjustment
- System displays error: "Cannot void - dependent transactions exist"
- System lists dependent transactions
- User must resolve dependencies first

**EF-002: Void After Period Close**
- At step 8: Accounting period already closed
- System displays warning
- Requires special override permission
- Adjustment to period reopening or next period

**EF-003: System Error During Void**
- At step 9: Database error or system failure
- System rolls back all changes
- Adjustment remains Posted
- Error logged and admin notified

**Source Evidence**: `components/inventory-adjustment-list.tsx:124` (Voided status in mock data)

---

## System Use Cases

### UC-INV-ADJ-101: Load Adjustment List Data

**Actor(s)**: System

**Triggered By**: User navigates to adjustment list page, user refreshes page

**Priority**: Critical

**Preconditions**:
- User authenticated
- Database connection available

**Postconditions**:
- Adjustment list data loaded into memory
- Ready for display

**Main Flow**:
1. System receives list page request
2. System identifies current user and accessible locations
3. System queries database:
   - SELECT adjustments for user's locations
   - Include: id, date, type, status, location, reason, item count, total value
   - ORDER BY date DESC
   - Apply pagination (default 50 per page)
4. System retrieves adjustment records
5. System formats data:
   - Format dates (YYYY-MM-DD)
   - Format currency values
   - Map status codes to display values
6. System caches results (TTL: 5 minutes)
7. System returns data to client
8. Total load time < 2 seconds

**Exception Flows**:

**EF-001: Database Timeout**
- At step 3: Query exceeds timeout (5 seconds)
- System logs error
- System returns cached data if available
- Displays error message to user

**EF-002: No Data**
- At step 4: No adjustments found for user
- System returns empty array
- Client displays empty state

**Source Evidence**: `components/inventory-adjustment-list.tsx:69-150` (mock data structure)

---

### UC-INV-ADJ-102: Calculate Adjustment Totals

**Actor(s)**: System

**Triggered By**: Items added/modified, adjustment loaded

**Priority**: High

**Preconditions**:
- Adjustment exists with items

**Postconditions**:
- Totals calculated and displayed
- Balances accurate

**Main Flow**:
1. System receives adjustment with items
2. System initializes totals:
   - totalItems = 0
   - totalQuantity = 0
   - totalCost = 0
3. System iterates through each item:
   ```
   For each item:
     itemTotal = unitCost x adjustmentQty
     totalItems += 1
     totalQuantity += adjustmentQty
     totalCost += itemTotal
   ```
4. System updates adjustment totals in summary section
5. System displays formatted values:
   - Total items count
   - Total quantity with UOM
   - Total cost in currency format (color-coded by type)
6. System validates calculation:
   - Verify no negative totals
   - Verify cost matches sum of items

**Source Evidence**: `new/page.tsx:307-324` (calculateTotals function), `new/page.tsx:908-963` (summary section display)

---

### UC-INV-ADJ-103: Generate Journal Entries

**Actor(s)**: System

**Triggered By**: Adjustment posted (UC-INV-ADJ-009)

**Priority**: Critical

**Preconditions**:
- Adjustment validated and ready for posting
- Chart of accounts configured
- User has posting permission

**Postconditions**:
- Balanced journal entries created
- GL accounts updated
- Audit trail recorded

**Main Flow**:
1. System receives posting request for adjustment
2. System retrieves adjustment data and items
3. System determines journal entry type based on adjustment type and **category**:

   **For IN adjustments (increase stock):**
   - Debit: Raw Materials Inventory (account based on category)
   - Credit: Inventory Variance (account based on category)

   **For OUT adjustments (decrease stock):**
   - Debit: Inventory Variance/Expense (account based on category)
   - Credit: Raw Materials Inventory (account based on category)

   **Category-to-GL Account Mapping:**
   - Category at header level maps to appropriate GL accounts
   - Different categories may map to different expense/variance accounts

4. System creates journal header:
   - Journal # = "JE-" + YYMM + "-" + sequence
   - Posting Date = adjustment date
   - Posting Period = YYYY-MM from date
   - Description = "Inventory Adjustment - " + category
   - Reference = adjustment #
   - Created By = current user
   - Created At = current timestamp

5. System creates journal entries:
   - Entry 1: Inventory account with amount
   - Entry 2: Variance/expense account with offset amount
   - Department = adjustment location department
   - Reference = adjustment #

6. System validates journal:
   - Total Debits = Total Credits
   - No zero-amount entries
   - Valid account codes

7. System posts journal entries to GL

8. System updates journal header:
   - Status = "Posted"
   - Posted By = current user
   - Posted At = current timestamp

9. System links journal to adjustment

**Exception Flows**:

**EF-001: Unbalanced Entry**
- At step 6: Debits != Credits
- System logs error with details
- System cancels posting
- System rolls back changes
- Admin notification sent

**EF-002: Invalid Account Code**
- At step 5: Account code not found in chart of accounts
- System uses default variance account
- System logs warning
- Continues with posting

**Source Evidence**: `[id]/page.tsx:146-205` (journal entry structure in mock data), Two-Level Category/Reason classification in DD

---

### UC-INV-ADJ-104: Update Stock Balances

**Actor(s)**: System

**Triggered By**: Adjustment posted (UC-INV-ADJ-009)

**Priority**: Critical

**Preconditions**:
- Adjustment posted successfully
- Items have lot assignments

**Postconditions**:
- Stock balances updated at location and lot level
- Inventory transactions recorded
- Audit trail maintained

**Main Flow**:
1. System receives posted adjustment
2. System retrieves all items with lot details
3. For each item:
   ```
   For each lot in item:
     Get current stock balance for:
       - product_id
       - location_id
       - lot_no

     Calculate new balance:
       If adjustment type = IN:
         new_balance = current_balance + adjustment_qty
       Else (OUT):
         new_balance = current_balance - adjustment_qty

     Validate:
       If new_balance < 0:
         Log warning
         Set to 0 or allow negative based on system setting

     Update stock_balance table:
       - quantity_on_hand = new_balance
       - last_movement_date = adjustment date
       - updated_at = current timestamp
   ```

4. System creates inventory transaction record:
   - transaction_id = unique ID
   - product_id = product
   - location_id = location
   - transaction_type = ADJ (Adjustment)
   - movement_type = IN or OUT
   - quantity = adjustment quantity
   - unit_cost = item unit cost
   - total_cost = quantity x unit cost
   - balance_after = new stock balance
   - transaction_date = adjustment date
   - reference_no = adjustment #
   - reference_type = "ADJ"
   - lot_no = lot number
   - user_id = posting user

5. System updates aggregate balances:
   - Recalculate quantity_available
   - Update total_value = quantity x average_cost
   - Update average_cost if needed (for Stock IN with new unit cost)

6. System logs all balance changes for audit

**Exception Flows**:

**EF-001: Negative Stock**
- At step 3: OUT adjustment creates negative balance
- System checks allow_negative_stock setting
- If not allowed: error, roll back
- If allowed: log warning, continue

**EF-002: Lot Not Found**
- At step 3: Lot number doesn't exist
- System creates new lot record
- System logs new lot creation
- Continues with balance update

**Source Evidence**: Integration with Inventory Transactions module (see `docs/app/inventory-management/transactions/`)

---

## Appendices

### Appendix A: User Actions Summary

| Action | Draft | Posted | Voided |
|--------|-------|--------|--------|
| View | ✅ | ✅ | ✅ |
| Edit | ✅ | ❌ | ❌ |
| Add Items | ✅ | ❌ | ❌ |
| Post | ✅ | ❌ | ❌ |
| Void | ❌ | ✅ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| Print | ✅ | ✅ | ✅ |

### Appendix B: System Transaction Flow

```
[List Page]
     |
     v
[Stock-in/Stock-out Button] --> [Create Form /new?type=in|out]
     |                                    |
     v                                    v
[Select Location, Category]          [Add Items]
     |                                    |
     v                                    v
[Save as Draft] -----------------------> [Draft Adjustment]
                                              |
                                              v
                                         [Post] --> [Update Stock & GL] --> [Posted]
                                              |
                                              v
                                         [Void] --> [Reverse Stock & GL] --> [Voided]
```

### Appendix C: Two-Level Category/Reason Classification

**Header Level - Category (maps to GL accounts):**
- Stock IN categories: Physical Count Variance, Found Items, Return to Stock, System Correction, Other
- Stock OUT categories: Damaged Goods, Expired Items, Theft/Loss, Spoilage, Physical Count Variance, Quality Control Rejection, Other

**Item Level - Reason (filtered by header category):**
- Each item can have a specific reason within the selected category
- Reasons provide granular tracking within the broader category
- Category drives GL account selection for financial reporting

### Appendix D: Integration Points

- **Inventory Transactions**: All posted adjustments create inventory transactions (Reference Type: ADJ)
- **General Ledger**: Journal entries posted to GL on adjustment posting (category determines accounts)
- **Stock Balances**: Real-time updates to location and lot-level balances
- **Audit Log**: All actions logged for compliance and traceability
- **Physical Count**: Generates adjustments from count variances
- **Spot Check**: Can trigger adjustment for discrepancies

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-01-16 | Documentation Team | Updated UI flow, Two-Level Category/Reason, source evidence |
| 1.1.0 | 2025-12-09 | Documentation Team | Type-specific reasons, costing rules |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial creation |
