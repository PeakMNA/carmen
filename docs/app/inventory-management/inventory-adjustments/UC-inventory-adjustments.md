# Use Cases: Inventory Adjustments

**Module**: Inventory Management
**Sub-module**: Inventory Adjustments
**Version**: 1.1
**Last Updated**: 2025-12-09

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
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
- [Data Schema](./DS-inventory-adjustments.md)
- [Flow Diagrams](./FD-inventory-adjustments.md)
- [Validations](./VAL-inventory-adjustments.md)

---

## Use Case Index

### User Use Cases
- **UC-INV-ADJ-001**: View Adjustment List
- **UC-INV-ADJ-002**: Search and Filter Adjustments
- **UC-INV-ADJ-003**: Navigate to Adjustment Details
- **UC-INV-ADJ-004**: Create New Adjustment
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
4. System renders adjustment list table with columns:
   - Adjustment # (ID)
   - Date
   - Type (IN/OUT badge)
   - Location
   - Reason
   - Items count
   - Total Value (formatted currency)
   - Status (badge)
   - Actions menu
5. System displays search bar at top
6. System displays filter/sort options button
7. List renders with all adjustments visible

**Alternative Flows**:

**AF-001: First Time User**
- At step 4: No adjustments exist yet
- System displays empty state message
- System shows "Create New Adjustment" call-to-action button

**AF-002: Large Dataset**
- At step 4: More than 50 adjustments exist
- System implements pagination
- User can navigate between pages

**Exception Flows**:

**EF-001: Loading Error**
- At step 3: API call fails
- System displays error message
- System offers "Retry" button

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/page.tsx:8-25`, `components/inventory-adjustment-list.tsx:111-237`

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
   - Type: IN, OUT
   - Location: Main Warehouse, Production Store, etc.
8. User selects one or more filters
9. System applies filters cumulatively
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

**Source Evidence**: `components/inventory-adjustment-list.tsx:113-115, 117-155, 159-173` (search and filter logic)

---

### UC-INV-ADJ-003: Navigate to Adjustment Details

**Actor(s)**: All users with inventory access

**Priority**: Critical

**Preconditions**:
- User is viewing adjustment list
- At least one adjustment exists

**Postconditions**:
- User viewing full adjustment details
- All tabs and data loaded

**Main Flow**:
1. User views adjustment list
2. User clicks on adjustment row or "View Details" in actions menu
3. System navigates to `/inventory-management/inventory-adjustments/[id]`
4. System displays loading state
5. System loads adjustment data including:
   - Header information
   - All items with quantities and costs
   - Stock movement with lot details
   - Journal entries (if posted)
6. System renders detail page with:
   - Header section (ID, date, type, status, location, reason, description)
   - Action buttons (Edit, Post, Void based on status)
   - Three tabs: Items, Stock Movement, Journal Entries
7. Default tab "Stock Movement" displays first
8. User can switch between tabs

**Alternative Flows**:

**AF-001: Draft Adjustment**
- At step 6: Adjustment status is "Draft"
- System shows "Edit" and "Post" buttons
- Items tab shows editable fields

**AF-002: Posted Adjustment**
- At step 6: Adjustment status is "Posted"
- System shows "Void" button only
- All fields read-only
- Journal Entries tab populated

**Exception Flows**:

**EF-001: Adjustment Not Found**
- At step 5: Invalid ID or deleted adjustment
- System displays "Adjustment not found" error
- System offers "Back to List" button

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/[id]/page.tsx:6-18`, `components/inventory-adjustment-detail.tsx:251-417`

---

### UC-INV-ADJ-004: Create New Adjustment

**Actor(s)**: Storekeeper, Warehouse Manager

**Priority**: Critical

**Preconditions**:
- User has "Inventory Create" permission
- User has at least one accessible location

**Postconditions**:
- New adjustment created in Draft status
- Adjustment # auto-generated
- Ready for item entry

**Main Flow**:
1. User views adjustment list page
2. User clicks "New Adjustment" button
3. System opens adjustment creation form/page
4. System displays Adjustment Type selection:
   - Stock OUT (decrease inventory) - default selection
   - Stock IN (increase inventory)
5. User selects adjustment type using visual card buttons
6. System displays header fields:
   - Date (defaults to today)
   - Location dropdown (user's accessible locations)
   - Reason dropdown (TYPE-SPECIFIC options - see below)
   - Description (free text)
7. System displays **type-specific** reason dropdown:

   **For Stock OUT adjustments:**
   - Damaged Goods
   - Expired Items
   - Theft / Loss
   - Spoilage
   - Physical Count Variance
   - Quality Control Rejection
   - Other (requires notes)

   **For Stock IN adjustments:**
   - Physical Count Variance
   - Found Items
   - Return to Stock
   - System Correction
   - Other (requires notes)

8. User fills required fields: Location, Reason
9. User optionally adds Description
10. User adds items to adjustment:
    - Search and select products
    - Enter adjustment quantities
    - For Stock IN: Enter unit cost (required)
    - For Stock OUT: System uses average cost automatically
11. User clicks "Save as Draft" or "Post Adjustment"
12. System validates all required fields
13. System generates Adjustment # (ADJ-YYMM-NNNN format)
14. System creates adjustment with appropriate status
15. System navigates to adjustment detail page or list

**Alternative Flows**:

**AF-001: Save and Add Items**
- At step 7: User clicks "Save & Add Items"
- System saves and navigates to Items tab
- User can immediately add items

**Exception Flows**:

**EF-001: Validation Error**
- At step 8: Required fields missing
- System displays validation errors
- System highlights missing fields
- User corrects and resubmits

**EF-002: Duplicate Prevention**
- At step 9: Check for duplicate adjustments (same date, location, type)
- System warns user of potential duplicate
- User confirms or cancels creation

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/page.tsx:13-16` (New Adjustment button)

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
2. System displays "Edit" button
3. User clicks "Edit" button
4. System enables edit mode:
   - Header fields become editable (except Type - cannot change after creation)
   - Items table shows edit/delete buttons
   - "Add Item" button enabled
5. User modifies header fields:
   - Location
   - Reason (type-specific dropdown - options depend on adjustment type)
   - Description
   - **Note**: Type (IN/OUT) cannot be changed after creation
6. User modifies items:
   - Edit quantities
   - For Stock IN: Edit unit costs (required)
   - For Stock OUT: Unit costs auto-calculated from average cost
   - Add new items
   - Remove items
7. System recalculates totals in real-time
8. User clicks "Save" button
9. System validates all changes:
   - Location required
   - Reason required
   - At least one item required
   - For Stock IN: All items have unit cost > 0
   - For Stock OUT: Quantities do not exceed current stock
10. System updates adjustment record
11. System displays success message
12. System exits edit mode

**Alternative Flows**:

**AF-001: Cancel Edit**
- At step 8: User clicks "Cancel" button
- System discards all changes
- System exits edit mode
- Original data restored

**Exception Flows**:

**EF-001: Validation Error**
- At step 9: Invalid data entered (negative quantities, missing costs)
- System displays validation errors
- System keeps edit mode active
- User corrects errors

**EF-002: Concurrent Edit**
- At step 10: Another user modified same adjustment
- System detects conflict
- System displays warning
- User chooses to overwrite or reload

**Source Evidence**: `components/inventory-adjustment-detail.tsx:253, 275-277` (edit mode state), `components/header-actions.tsx`

---

### UC-INV-ADJ-006: Add Items to Adjustment

**Actor(s)**: Storekeeper, Warehouse Manager

**Priority**: Critical

**Preconditions**:
- Adjustment in Draft status
- Edit mode enabled
- User on Items tab

**Postconditions**:
- New items added to adjustment
- Totals recalculated
- Items ready for posting

**Main Flow**:
1. User views adjustment detail (Draft status, edit mode)
2. User switches to "Items" tab
3. System displays items table
4. User clicks "Add Item" button
5. System opens item selection dialog/form
6. User searches for product by name or SKU
7. System displays matching products
8. User selects product
9. System pre-fills based on adjustment type:
   - Product name and SKU
   - Current stock (On Hand)
   - UOM

   **For Stock OUT adjustments:**
   - Unit cost = product's average cost (auto-filled, read-only)

   **For Stock IN adjustments:**
   - Unit cost = 0 (user must enter)

10. User enters:
    - Adjustment quantity (positive integer)
    - For Stock IN: Unit cost (required, affects inventory valuation)
    - Item-level reason (optional, uses type-specific dropdown)
11. System calculates:
    - Total value = Unit Cost × Adjustment Quantity
12. User clicks "Add" (or item is added directly to table)
13. System validates:
    - Quantity > 0
    - For Stock OUT: Quantity ≤ current stock
    - For Stock IN: Unit cost > 0
14. System adds item to table
15. System updates summary section:
    - Total items count
    - Total quantity
    - Total value (color-coded: green for IN, red for OUT)

**Alternative Flows**:

**AF-001: Add Multiple Items**
- At step 12: User clicks "Add & Continue"
- Item added, dialog remains open
- User can add another item immediately

**AF-002: Edit Item Inline**
- At any time: User clicks edit icon on existing item
- Fields become editable inline
- User modifies and saves

**Exception Flows**:

**EF-001: Product Not Found**
- At step 7: Search yields no results
- System displays "Product not found"
- User refines search or cancels

**EF-002: Insufficient Stock for OUT**
- At step 10: OUT quantity exceeds on hand
- System displays warning
- User confirms or adjusts quantity

**Source Evidence**: `components/inventory-adjustment-detail.tsx:330-411` (Items tab), lines 103-211 (mock item data)

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
2. User clicks "Stock Movement" tab
3. System displays stock movement table
4. For each item, system shows:
   - Product name and SKU
   - Location (type, code, name)
   - Lot numbers affected
   - IN quantity per lot (if Type = IN)
   - OUT quantity per lot (if Type = OUT)
   - UOM
   - Unit cost
   - Total cost per item
5. System displays subtotals:
   - Total IN for item
   - Total OUT for item
6. System displays grand totals:
   - Total IN all items
   - Total OUT all items
   - Total cost
7. User can view all lots affected by adjustment

**Alternative Flows**:

**AF-001: Multiple Lots Per Item**
- At step 4: Item has multiple lots
- System shows expandable rows
- Each lot displayed separately with quantities

**AF-002: No Lots Yet (Draft)**
- At step 3: Adjustment in Draft, lots not assigned
- System displays items without lot details
- Message: "Lot assignment will occur on posting"

**Exception Flows**:

**EF-001: Missing Lot Data**
- At step 4: Lot information incomplete
- System displays "N/A" for missing data
- System highlights items needing attention

**Source Evidence**: `components/inventory-adjustment-detail.tsx:302-323` (Stock Movement tab), `components/stock-movement/stock-movement-table.tsx`, `components/types.ts:7-22` (Lot interface)

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
2. User clicks "Journal Entries" tab
3. System displays journal header information:
   - Status badge (Posted)
   - Journal # (JE-YYMM-NNNN)
   - Posting Date
   - Posting Period (YYYY-MM)
   - Description
   - Reference (links to adjustment #)
4. System displays audit trail:
   - Created By (user name)
   - Created At (timestamp)
   - Posted By (user name)
   - Posted At (timestamp)
5. System displays journal entries table:
   - Account code
   - Account name
   - Debit amount
   - Credit amount
   - Department
   - Reference
6. System shows totals:
   - Total Debits
   - Total Credits
7. System verifies balance: Total Debits = Total Credits
8. User can review accounting impact

**Alternative Flows**:

**AF-001: Multiple Departments**
- At step 5: Adjustment spans multiple departments
- Each entry shows department allocation
- User can filter by department

**AF-002: Export Journal Entries**
- At any time: User clicks "Export" button
- System generates PDF or Excel
- File includes all journal details

**Exception Flows**:

**EF-001: Unbalanced Entry**
- At step 7: Debits ≠ Credits (system error)
- System displays error message
- System prevents completion until balanced
- Admin notification sent

**EF-002: Draft Adjustment**
- At step 2: Adjustment not yet posted
- Journal Entries tab disabled or shows placeholder
- Message: "Journal entries will be generated upon posting"

**Source Evidence**: `components/inventory-adjustment-detail.tsx:213-249` (mock journal data), lines 325-328 (Journal tab), `components/journal-entries/journal-header.tsx`, `components/journal-entries/journal-table.tsx`

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
12. "Post" button removed, "Void" button appears

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

**Source Evidence**: `components/header-actions.tsx` (Post button), mock data shows status transitions

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

**Source Evidence**: `components/inventory-adjustment-list.tsx:86-89` (Voided status in mock data)

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

**Source Evidence**: `components/inventory-adjustment-list.tsx:28-109` (mock data structure)

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
   - totalInQty = 0
   - totalOutQty = 0
   - totalCost = 0
3. System iterates through each item:
   ```
   For each item:
     itemTotal = unitCost × adjustmentQuantity

     If adjustmentQuantity > 0:
       totalInQty += adjustmentQuantity
     Else:
       totalOutQty += abs(adjustmentQuantity)

     totalCost += abs(itemTotal)
   ```
4. System updates adjustment totals:
   - totals.inQty = totalInQty
   - totals.outQty = totalOutQty
   - totals.totalCost = totalCost
5. System validates calculation:
   - Verify no negative totals
   - Verify cost matches sum of items
6. System returns calculated totals

**Source Evidence**: `components/types.ts:35-40` (totals interface), mock data lines 206-210

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
3. System determines journal entry type based on adjustment type:

   **For IN adjustments (increase stock):**
   - Debit: Raw Materials Inventory (1310)
   - Credit: Inventory Variance (5110)

   **For OUT adjustments (decrease stock):**
   - Debit: Inventory Variance (5110)
   - Credit: Raw Materials Inventory (1310)

4. System creates journal header:
   - Journal # = "JE-" + YYMM + "-" + sequence
   - Posting Date = adjustment date
   - Posting Period = YYYY-MM from date
   - Description = "Inventory Adjustment - " + reason
   - Reference = adjustment #
   - Created By = current user
   - Created At = current timestamp

5. System creates journal entries:
   - Entry 1: Inventory account with amount
   - Entry 2: Variance account with offset amount
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
- At step 6: Debits ≠ Credits
- System logs error with details
- System cancels posting
- System rolls back changes
- Admin notification sent

**EF-002: Invalid Account Code**
- At step 5: Account code not found in chart of accounts
- System uses default variance account
- System logs warning
- Continues with posting

**Source Evidence**: `components/inventory-adjustment-detail.tsx:213-249` (journal entry structure), `components/types.ts:42-63` (JournalEntry interface)

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
       - item_id
       - location_id
       - lot_no

     Calculate new balance:
       If adjustment type = IN:
         new_balance = current_balance + lot_quantity
       Else (OUT):
         new_balance = current_balance - lot_quantity

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
   - item_id = item
   - location_id = location
   - transaction_type = ADJUST_UP or ADJUST_DOWN
   - quantity = adjustment quantity
   - unit_cost = item unit cost
   - total_cost = quantity × unit cost
   - balance_after = new stock balance
   - transaction_date = adjustment date
   - reference_no = adjustment #
   - reference_type = "ADJUSTMENT"
   - lot_no = lot number
   - user_id = posting user

5. System updates aggregate balances:
   - Recalculate quantity_available
   - Update total_value = quantity × average_cost
   - Update average_cost if needed (based on costing method)

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

**Source Evidence**: `lib/types/inventory.ts:52-64` (StockBalance interface), lines 86-104 (InventoryTransaction interface)

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

### Appendix B: System Transaction Flow

```
Create Draft → Add Items → Post → Update Stock & GL → Complete
                         ↓
                      Void → Reverse Stock & GL → Complete
```

### Appendix C: Integration Points

- **Inventory Transactions**: All posted adjustments create inventory transactions
- **General Ledger**: Journal entries posted to GL on adjustment posting
- **Stock Balances**: Real-time updates to location and lot-level balances
- **Audit Log**: All actions logged for compliance and traceability

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-10 | System | Initial creation from source code analysis |
