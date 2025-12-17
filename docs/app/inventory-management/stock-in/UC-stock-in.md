# Use Cases: Stock In

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Stock In
- **Route**: `/inventory-management/stock-in`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Inventory Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-01-11 | System | Initial version based on UI prototype and system analysis |

---

## Overview

This document describes all use cases for the Stock In sub-module, which manages inbound inventory transactions including Goods Received Notes (GRN), Stock Transfers, Issue Returns, Stock Adjustments, and Credit Notes. Use cases are organized into User, System, Integration, and Background categories.

**Related Documents**:
- [Business Requirements](./BR-stock-in.md)
- [Technical Specification](./TS-stock-in.md)
- [Data Definition](./DD-stock-in.md)
- [Flow Diagrams](./FD-stock-in.md)
- [Validations](./VAL-stock-in.md)

---

## Actors

### Primary Actors

| Actor | Description | Role |
|-------|-------------|------|
| Storekeeper | Warehouse staff responsible for receiving goods | Creates and manages stock in transactions daily |
| Inventory Coordinator | Inventory management staff | Reviews, validates, and commits transactions |
| Inventory Supervisor | Supervisory staff with approval authority | Approves high-value adjustments and transaction reversals |
| Inventory Manager | Management level with full access | Overrides system restrictions, voids transactions, handles exceptions |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| Purchasing Staff | Procurement team members | Views GRN-related stock in transactions to track deliveries |
| Finance Team | Accounting and finance staff | Reviews transaction costs and GL postings for reconciliation |
| Auditor | Internal or external audit personnel | Reviews activity logs and compliance with procedures |

### System Actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| Inventory Valuation Service | Centralized cost calculation service using FIFO or Periodic Average | REST API |
| Finance Module (GL Posting) | General Ledger posting for inventory movements | REST API / Event |
| Procurement Module | Source of GRN and Credit Note data | Module / REST API |
| Transfer Management | Internal transfer order management | Module / REST API |
| Store Operations | Source of issue transactions for returns | Module / REST API |

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **User Use Cases** | | | | | |
| UC-STI-001 | Create Stock In Transaction | Storekeeper | High | Medium | User |
| UC-STI-002 | Add/Edit Line Items | Storekeeper | High | Medium | User |
| UC-STI-003 | Save Draft Transaction | Storekeeper | High | Simple | User |
| UC-STI-004 | Commit Transaction | Inventory Coordinator | High | Complex | User |
| UC-STI-005 | Void Transaction | Inventory Supervisor | Medium | Simple | User |
| UC-STI-006 | Reverse Committed Transaction | Inventory Supervisor | Medium | Complex | User |
| UC-STI-007 | View Transaction Detail | All Users | High | Simple | User |
| UC-STI-008 | Search and Filter Transactions | All Users | High | Medium | User |
| UC-STI-009 | Add Comment | All Users | Low | Simple | User |
| UC-STI-010 | Upload Attachment | Storekeeper | Low | Simple | User |
| UC-STI-011 | Print Transaction Document | All Users | Medium | Simple | User |
| UC-STI-012 | Export to Excel | Inventory Coordinator | Medium | Simple | User |
| **System Use Cases** | | | | | |
| UC-STI-101 | Auto-Save Draft Transaction | System | High | Simple | System |
| UC-STI-102 | Calculate Transaction Total | System | High | Simple | System |
| UC-STI-103 | Update Inventory Balances | System | High | Complex | System |
| UC-STI-104 | Create Movement History | System | High | Medium | System |
| UC-STI-105 | Generate Transaction Reference Number | System | High | Simple | System |
| **Integration Use Cases** | | | | | |
| UC-STI-201 | Retrieve Cost from Inventory Valuation Service | Inventory Valuation Service | High | Complex | Integration |
| UC-STI-202 | Post to General Ledger | Finance Module | High | Complex | Integration |
| UC-STI-203 | Link to Source Document | Procurement/Transfer/Store Ops | High | Medium | Integration |
| UC-STI-204 | Validate Product and Location Master Data | Product/Location Module | High | Simple | Integration |

---

## User Use Cases

### UC-STI-001: Create Stock In Transaction

**Description**: User initiates a new stock in transaction by selecting transaction type and providing basic information.

**Actor(s)**: Storekeeper, Inventory Coordinator

**Priority**: High

**Frequency**: Daily (10-50 transactions per day per location)

**Preconditions**:
- User is authenticated with "Inventory.StockIn.Create" permission
- User has access to at least one location
- Product Master and Location Master contain active records

**Postconditions**:
- **Success**: New transaction created in "Saved" status with unique reference number, ready for line item entry
- **Failure**: Transaction not created, user shown error message, no data persisted

**Main Flow**:
1. User navigates to Stock In module and clicks "Add New" button
2. System displays transaction creation form with fields: Transaction Type, Date, Location, Related Document, Description
3. User selects Transaction Type from dropdown (Good Receive Note, Transfer, Issue Return, Adjustment, Credit Note)
4. User selects Transaction Date (defaults to today)
5. User selects Location from dropdown (filtered to user's accessible locations)
6. User enters Related Document reference (e.g., GRN-2401-0001)
7. User enters Description (optional)
8. User clicks "Create" button
9. System validates all required fields (UC-STI-204)
10. System generates unique reference number in format STK-IN-YYMM-NNNN (UC-STI-105)
11. System creates transaction record with status = "Saved"
12. System displays success message: "Transaction STK-IN-2501-0123 created successfully"
13. System navigates to transaction detail page for line item entry
14. Use case ends

**Alternative Flows**:

**Alt-1A: Related Document Not Found** (At step 6)
- 6a. User enters related document reference
- 6b. System validates document exists (UC-STI-203)
- 6c. System displays error: "Related document 'GRN-2401-0999' not found. Please verify the reference number."
- 6d. User corrects the reference or removes it
- Resume at step 9

**Alt-1B: User Cancels Creation** (At step 8)
- 8a. User clicks "Cancel" button
- 8b. System displays confirmation dialog: "Discard unsaved changes?"
- 8c. User confirms cancellation
- 8d. System returns to transaction list without saving
- Use case ends

**Alt-1C: Date Outside Allowed Range** (At step 4)
- 4a. User selects date more than 30 days in past or 1 day in future
- 4b. System displays error: "Transaction date must be within last 30 days or up to 1 day in future"
- 4c. User selects valid date
- Resume at step 5

**Exception Flows**:

**Exc-1A: Validation Failure** (At step 9)
- 9a. System detects validation errors (missing required fields, invalid data)
- 9b. System displays inline error messages for each invalid field
- 9c. User corrects errors
- Resume at step 9

**Exc-1B: Database Connection Failure** (At step 11)
- 11a. System fails to save transaction to database
- 11b. System logs error with technical details
- 11c. System displays user-friendly error: "Unable to create transaction due to system error. Please try again."
- 11d. User retries or contacts support
- Use case ends

**Business Rules Applied**:
- BR-STI-001 to BR-STI-005 (Transaction type rules)
- BR-STI-016 (Transaction date range)
- BR-STI-017, BR-STI-018 (Reference number format and uniqueness)
- BR-STI-019 (Valid, active location)

**Related Use Cases**: UC-STI-002, UC-STI-105, UC-STI-203, UC-STI-204

---

### UC-STI-002: Add/Edit Line Items

**Description**: User adds products to stock in transaction, specifying quantities, units, and destinations.

**Actor(s)**: Storekeeper, Inventory Coordinator

**Priority**: High

**Frequency**: Daily (per transaction creation)

**Preconditions**:
- Transaction exists in "Saved" status
- User has edit permission for the transaction
- Product Master contains active products

**Postconditions**:
- **Success**: Line items added/updated, transaction total quantity calculated, changes auto-saved
- **Failure**: Line items not saved, user shown validation errors, transaction remains unchanged

**Main Flow**:
1. User is on transaction detail page (from UC-STI-001 or UC-STI-007)
2. System displays transaction header and empty/existing line item grid
3. User clicks "Add Product" button
4. System displays product search/selection dialog
5. User searches and selects product from catalog
6. System displays line item entry form with fields: Store (Location), Item Code, Description, Unit, Qty, Comment
7. System pre-fills Item Code and Description from selected product
8. System loads available units for product from Product Master
9. User selects Unit from dropdown
10. User enters Quantity (must be > 0)
11. User selects destination Store/Location (defaults to transaction header location)
12. User enters Comment (optional)
13. User clicks "Add" button
14. System validates line item data (BR-STI-021 to BR-STI-025)
15. System checks for duplicate product (same product, unit, location)
16. System retrieves current inventory info for display: On Hand, On Ordered, Reorder, Restock, Last Price, Last Vendor (UC-STI-204)
17. System adds line item to grid
18. System calculates total quantity: SUM(all line items qty) (UC-STI-102)
19. System updates transaction header Total Qty field
20. System auto-saves changes (UC-STI-101)
21. System displays updated line item grid with inventory context
22. Use case ends

**Alternative Flows**:

**Alt-2A: Edit Existing Line Item** (At step 3)
- 3a. User clicks "Edit" icon on existing line item row
- 3b. System displays line item edit dialog with current values
- 3c. User modifies Qty, Unit, Location, or Comment
- Resume at step 14

**Alt-2B: Remove Line Item** (At step 3)
- 3a. User clicks "Delete" icon on line item row
- 3b. System displays confirmation: "Remove product '{Product Name}' from transaction?"
- 3c. User confirms deletion
- 3d. System marks line item as deleted (soft delete)
- 3e. System recalculates total quantity (UC-STI-102)
- 3f. System auto-saves (UC-STI-101)
- Use case ends

**Alt-2C: Duplicate Product Detected** (At step 15)
- 15a. System detects same product with same unit and location already exists in transaction
- 15b. System displays warning: "Product '{Product Name}' with unit '{Unit}' already exists for location '{Location}'. Update existing quantity or use different unit/location."
- 15c. User chooses to: update existing line item quantity OR change unit/location OR cancel
- Resume at step 14

**Alt-2D: Product Stock Low Warning** (At step 16)
- 16a. System retrieves inventory info and detects On Hand < Reorder Point
- 16b. System displays warning icon next to inventory info: "⚠️ Stock below reorder point"
- 16c. User acknowledges warning
- Continue to step 17

**Exception Flows**:

**Exc-2A: Invalid Quantity** (At step 10)
- 10a. User enters quantity ≤ 0 or non-numeric value
- 10b. System displays error: "Quantity must be a positive number"
- 10c. User corrects quantity
- Resume at step 11

**Exc-2B: Product Not Found** (At step 5)
- 5a. User searches for product code or name
- 5b. System finds no matching active products
- 5c. System displays message: "No products found matching '{search term}'. Try different search or contact administrator to add product."
- 5d. User refines search or cancels
- Resume at step 5 or end use case

**Exc-2C: Auto-Save Failure** (At step 20)
- 20a. System attempts auto-save but network request fails
- 20b. System stores changes in browser local storage as backup
- 20c. System displays warning: "⚠️ Auto-save failed. Changes saved locally. Will retry automatically."
- 20d. System retries save in background (3 attempts with exponential backoff)
- 20e. If retry succeeds: clear local storage and display success confirmation
- 20f. If all retries fail: keep data in local storage and alert user to save manually
- Use case continues

**Business Rules Applied**:
- BR-STI-020 (Minimum 1 line item)
- BR-STI-021 (Valid product)
- BR-STI-022 (Valid unit for product)
- BR-STI-023 (Quantity > 0)
- BR-STI-024 (Unit cost ≥ 0)
- BR-STI-025 (Duplicate products allowed with different units/locations)

**Related Use Cases**: UC-STI-001, UC-STI-101, UC-STI-102, UC-STI-204

---

### UC-STI-004: Commit Transaction

**Description**: User finalizes stock in transaction, triggering cost calculation, inventory balance updates, and GL posting.

**Actor(s)**: Inventory Coordinator, Inventory Supervisor

**Priority**: High

**Frequency**: Daily (after transaction entry and verification)

**Preconditions**:
- Transaction exists in "Saved" status
- Transaction has at least 1 line item
- User has "Inventory.StockIn.Commit" permission
- Inventory Valuation Service is available
- Finance Module (GL) is available

**Postconditions**:
- **Success**: Transaction status = "Committed", inventory balances updated, movement history created, GL entry posted, status cannot be changed except by reversal
- **Failure**: Transaction remains in "Saved" status, no inventory changes, user shown error message with reason

**Main Flow**:
1. User views transaction detail page (status = "Saved")
2. System displays "Commit" button (enabled only for users with commit permission)
3. User clicks "Commit" button
4. System displays commit confirmation dialog with transaction summary: Total Items, Total Qty, Estimated Cost Impact
5. User reviews summary and clicks "Confirm Commit"
6. System validates transaction is committable: status = "Saved", has line items, all required fields complete
7. System initiates commit process (shows progress indicator)
8. **Step 8: Cost Calculation** - System calls Inventory Valuation Service API for each line item to calculate unit costs (UC-STI-201)
9. System receives cost data: unit cost, total cost, cost calculation method (FIFO or Periodic Average)
10. System updates line item records with cost information (4 decimal precision)
11. **Step 11: Inventory Balance Update** - System updates inventory balances atomically for all line items (UC-STI-103):
    - Increase quantity on-hand for each product at each location
    - Update quantity available if no allocation constraints
12. **Step 12: Movement History** - System creates movement history records for each line item (UC-STI-104):
    - Store commit date, location, item, unit, stockIn qty, stockOut = 0, amount, reference
13. **Step 13: GL Posting** - System calls Finance Module API to post GL journal entry (UC-STI-202):
    - Debit: Inventory Asset Account
    - Credit: Accounts Payable (for GRN) or Inventory Variance (for adjustments) or Inter-Location Transfer
14. System receives GL posting confirmation with journal entry number
15. System updates transaction record: status = "Committed", commitDate = now, committedBy = current user
16. System creates activity log entry: "Committed by {User Name} on {DateTime}"
17. System displays success message: "Transaction STK-IN-2501-0123 committed successfully. Inventory balances updated. GL Entry: JE-2501-5678"
18. System refreshes transaction detail view showing "Committed" badge and updated fields
19. System disables edit/delete actions (only View and Reverse allowed)
20. Use case ends

**Alternative Flows**:

**Alt-4A: User Cancels Commit** (At step 5)
- 5a. User clicks "Cancel" button in confirmation dialog
- 5b. System cancels commit operation
- 5c. Transaction remains in "Saved" status
- Use case ends

**Alt-4B: Partial Cost Calculation Failure** (At step 8-9)
- 8a. Inventory Valuation Service returns costs for some items but fails for others
- 8b. System displays error: "Unable to calculate costs for {N} item(s): {Item Names}. Please review and retry."
- 8c. System rolls back entire commit (no partial commits allowed)
- 8d. Transaction remains in "Saved" status
- 8e. User investigates cost calculation issues and retries
- Use case ends

**Alt-4C: Negative Inventory Prevention** (At step 11)
- 11a. System calculates new balance for product at location
- 11b. System detects product has "Allow Negative Inventory = false" setting
- 11c. Calculated balance would not be negative (stock IN always increases balance)
- Continue normally (this check is more relevant for stock OUT, but included for completeness)

**Exception Flows**:

**Exc-4A: Inventory Valuation Service Unavailable** (At step 8)
- 8a. System calls Inventory Valuation Service API
- 8b. Service returns timeout or connection error
- 8c. System retries 3 times with exponential backoff (1s, 2s, 4s) per BR-STI-049
- 8d. All retries fail
- 8e. System displays error: "Inventory Valuation Service is temporarily unavailable. Transaction remains in Saved status. Please try again in a few minutes."
- 8f. System logs error with technical details for support team
- 8g. Transaction remains in "Saved" status
- Use case ends

**Exc-4B: GL Posting Failure** (At step 13-14)
- 13a. System calls Finance Module GL Posting API
- 13b. GL posting fails (e.g., period closed, account inactive, duplicate entry)
- 13c. System rolls back inventory balance updates and movement history (compensating transaction)
- 13d. System displays error: "GL posting failed: {error reason}. Transaction remains in Saved status. Contact Finance team to resolve."
- 13e. System logs full error details and rollback actions
- 13f. Transaction remains in "Saved" status with error flag
- 13g. User contacts Finance team or system administrator
- Use case ends

**Exc-4C: Database Transaction Failure** (At step 11-15)
- 11a. System starts database transaction (BEGIN TRANSACTION)
- 11b. One of the updates fails (balance update, movement creation, transaction status update)
- 11c. System automatically rolls back all changes (ROLLBACK)
- 11d. System displays error: "Commit failed due to database error. No changes were made. Please try again."
- 11e. System logs error with stack trace
- 11f. Transaction remains in "Saved" status
- Use case ends

**Exc-4D: Permission Revoked Mid-Commit** (At step 7)
- 7a. System validates user still has "Inventory.StockIn.Commit" permission
- 7b. Permission has been revoked since page load
- 7c. System displays error: "Permission denied. Your role no longer allows committing transactions. Please refresh and contact administrator."
- 7d. Transaction remains in "Saved" status
- Use case ends

**Business Rules Applied**:
- BR-STI-011 (Only Saved transactions can be committed)
- BR-STI-015 (Commit is irreversible)
- BR-STI-026 to BR-STI-030 (Cost calculation rules)
- BR-STI-031 to BR-STI-035 (Inventory balance update rules)
- BR-STI-036 to BR-STI-038 (Movement history rules)
- BR-STI-045 (Commit permission required)
- BR-STI-048 to BR-STI-053 (Integration rules)

**Related Use Cases**: UC-STI-101, UC-STI-103, UC-STI-104, UC-STI-201, UC-STI-202

---

### UC-STI-006: Reverse Committed Transaction

**Description**: User reverses a committed transaction, creating offsetting inventory movements to undo the effects.

**Actor(s)**: Inventory Supervisor, Inventory Manager

**Priority**: Medium

**Frequency**: Weekly (error corrections, returns to vendor)

**Preconditions**:
- Transaction exists in "Committed" status
- User has "Inventory.StockIn.Reverse" permission (typically Manager level)
- Transaction has not been previously reversed
- System allows reversals (configuration setting)

**Postconditions**:
- **Success**: Original transaction marked as reversed, new offsetting Stock OUT transaction created with negative quantities, inventory balances decreased, GL reversal entry posted
- **Failure**: Transaction remains committed and unreversed, user shown error message

**Main Flow**:
1. User views committed transaction detail
2. System displays "Reverse" button (enabled only for Supervisors/Managers)
3. User clicks "Reverse" button
4. System displays reversal confirmation dialog with warning: "Reversing this transaction will create offsetting inventory OUT movements and GL entries. This action cannot be undone. Reason for reversal: [text field]"
5. User enters reversal reason (required, e.g., "Goods returned to vendor", "Data entry error")
6. User clicks "Confirm Reversal"
7. System validates user has "Inventory.StockIn.Reverse" permission
8. System validates transaction is reversible: status = "Committed", not already reversed
9. System creates new Stock OUT transaction with mirror-image line items:
    - Same products, locations, units
    - Negative quantities (original qty * -1)
    - Same costs as original transaction
    - Reference to original Stock IN transaction number
    - Description: "Reversal of STK-IN-2401-0123: {reversal reason}"
10. System updates inventory balances: decrease quantity on-hand by original amounts (UC-STI-103)
11. System creates movement history records with negative stockOut quantities (UC-STI-104)
12. System calls Finance Module to post GL reversal entry (UC-STI-202):
    - Credit: Inventory Asset Account (decrease)
    - Debit: Original contra account (AP, variance, etc.)
13. System updates original transaction: isReversed = true, reversalTransactionId = new OUT transaction ID, reversalDate = now, reversalBy = current user
14. System creates activity log entry in both original and new transactions
15. System displays success message: "Transaction STK-IN-2401-0123 reversed successfully. Reversal transaction: STK-OUT-2401-0456"
16. System provides link to view reversal transaction
17. Use case ends

**Alternative Flows**:

**Alt-6A: User Cancels Reversal** (At step 6)
- 6a. User clicks "Cancel" button
- 6b. System closes dialog without making changes
- Use case ends

**Alt-6B: Partial Reversal Request** (At step 4)
- 4a. User requests to reverse only some line items (not full transaction)
- 4b. System displays info message: "Partial reversals are not supported. To adjust specific items, create a manual Stock OUT transaction or Stock Adjustment."
- 4c. User cancels reversal
- Use case ends

**Exception Flows**:

**Exc-6A: Already Reversed** (At step 8)
- 8a. System detects transaction.isReversed = true
- 8b. System displays error: "This transaction has already been reversed. View reversal transaction: {link to STK-OUT-XXXX}"
- 8c. User views reversal transaction or closes dialog
- Use case ends

**Exc-6B: Insufficient Inventory for Reversal** (At step 10)
- 10a. System attempts to decrease inventory balance
- 10b. System detects resulting balance would be negative for product with "Allow Negative Inventory = false"
- 10c. System displays error: "Cannot reverse transaction. Product '{Product Name}' at '{Location}' has insufficient stock. Current: {qty}, Required: {qty}. Resolve inventory discrepancy first."
- 10d. System does not create reversal transaction
- 10e. User investigates inventory discrepancy (possible subsequent stock outs occurred)
- Use case ends

**Exc-6C: GL Reversal Posting Failure** (At step 12)
- 12a. System calls Finance Module to post GL reversal
- 12b. GL posting fails (e.g., period closed for the original transaction date)
- 12c. System rolls back reversal transaction, inventory changes, movement history
- 12d. System displays error: "GL reversal failed: {reason}. Transaction not reversed. Contact Finance team."
- 12e. Original transaction remains committed and unreversed
- Use case ends

**Business Rules Applied**:
- BR-STI-012 (Only committed transactions can be reversed)
- BR-STI-047 (Reversal requires manager approval/permission)
- BR-STI-033 (Negative inventory prevention)
- BR-STI-039 (Reversal creates offsetting movements)

**Related Use Cases**: UC-STI-103, UC-STI-104, UC-STI-202

---

### UC-STI-008: Search and Filter Transactions

**Description**: User searches for specific transactions or applies filters to narrow transaction list.

**Actor(s)**: All Users

**Priority**: High

**Frequency**: Daily

**Preconditions**:
- User is authenticated
- User has access to at least one location
- Transaction list page is displayed

**Postconditions**:
- **Success**: Filtered transaction list displayed matching search/filter criteria, count and pagination updated
- **Failure**: No results found, user shown message, filters remain applied

**Main Flow**:
1. User navigates to Stock In transaction list page
2. System displays all transactions for user's accessible locations (default view: last 30 days)
3. **Search by Keyword** - User enters search term in search box (searches: Reference No, Location, Description)
4. System filters transactions in real-time as user types (debounced 300ms)
5. System displays matching transactions with search term highlighted
6. **Filter by Type** - User selects transaction type from dropdown (All Types, GRN, Transfer, Credit Note, Issue Return, Adjustment)
7. System applies type filter, updates list
8. **Filter by Status** - User selects status from More Filters: Saved, Committed, Void
9. **Filter by Date Range** - User selects date filter: Today, Yesterday, Last 7 Days, Last 30 Days, Custom Range
10. If Custom Range: user selects start and end dates from date picker
11. **Filter by Location** - User selects location from dropdown (shows only user's accessible locations)
12. System applies all active filters simultaneously
13. System displays filtered results with count: "Showing 15 of 234 results"
14. System updates pagination based on filtered results
15. Use case ends

**Alternative Flows**:

**Alt-8A: Clear All Filters** (At step 12)
- 12a. User clicks "Clear Filters" button
- 12b. System resets all filters to default values
- 12c. System displays unfiltered results (last 30 days, all types, all statuses)
- Resume at step 2

**Alt-8B: No Results Found** (At step 13)
- 13a. System applies filters but finds no matching transactions
- 13b. System displays message: "No transactions found matching your criteria. Try adjusting filters or search term."
- 13c. User modifies filters or clears them
- Resume at step 12

**Alt-8C: Save Filter Preset** (At step 12)
- 12a. User applies multiple filters (type, date range, location)
- 12b. User clicks "Save Filter" button
- 12c. System prompts for filter preset name
- 12d. User enters name (e.g., "My GRNs - Last Week")
- 12e. System saves filter configuration to user preferences
- 12f. Filter preset appears in "Saved Filters" dropdown for quick access
- Use case continues

**Exception Flows**:

**Exc-8A: Search Timeout** (At step 4)
- 4a. System searches database for matching transactions
- 4b. Search query takes longer than 5 seconds (large dataset)
- 4c. System displays loading indicator
- 4d. If query exceeds 10 seconds: system displays timeout message and suggests narrowing search
- Use case ends

**Business Rules Applied**:
- BR-STI-043 (Users can only view transactions for accessible locations)

**Related Use Cases**: UC-STI-007

---

## System Use Cases

### UC-STI-101: Auto-Save Draft Transaction

**Description**: System automatically saves draft transaction changes every 30 seconds to prevent data loss.

**Actor(s)**: System (Automated)

**Priority**: High

**Frequency**: Continuous (every 30 seconds during transaction editing)

**Preconditions**:
- User is editing a transaction in "Saved" status
- Transaction has unsaved changes
- User session is active

**Postconditions**:
- **Success**: Transaction changes persisted to database, last saved timestamp updated, user sees confirmation indicator
- **Failure**: Changes stored in browser local storage as backup, retry scheduled, user notified

**Main Flow**:
1. User makes changes to transaction (header fields or line items)
2. System detects changes and sets "hasUnsavedChanges" flag
3. System starts 30-second timer
4. Timer expires
5. System checks if "hasUnsavedChanges" = true
6. System sends auto-save API request with changed data
7. System receives success response
8. System updates "lastSavedAt" timestamp
9. System displays subtle save confirmation: "✓ Auto-saved at {time}"
10. System clears "hasUnsavedChanges" flag
11. System restarts 30-second timer
12. Use case continues (loops until user leaves page)

**Alternative Flows**:

**Alt-101A: No Changes to Save** (At step 5)
- 5a. System checks "hasUnsavedChanges" flag
- 5b. Flag is false (no changes since last save)
- 5c. System skips auto-save request
- Resume at step 11 (restart timer)

**Alt-101B: User Commits Transaction** (At step 2)
- 2a. User clicks "Commit" button
- 2b. System triggers manual save before commit process
- 2c. System proceeds with commit (UC-STI-004)
- Auto-save timer cancelled
- Use case ends

**Exception Flows**:

**Exc-101A: Auto-Save API Failure** (At step 6-7)
- 6a. System sends auto-save request
- 6b. Request fails (network error, server timeout)
- 6c. System stores transaction data in browser localStorage as backup
- 6d. System schedules retry in 10 seconds (max 3 retries)
- 6e. System displays warning: "⚠️ Auto-save failed. Changes saved locally. Will retry."
- 6f. If retry succeeds: clear localStorage, show success, resume normal operation
- 6g. If all retries fail: keep data in localStorage, show error, suggest manual save
- Use case continues with timer

**Exc-101B: User Session Expired** (At step 6)
- 6a. System sends auto-save request
- 6b. Server returns 401 Unauthorized (session expired)
- 6c. System stores data in localStorage
- 6d. System displays session expiration warning: "Your session has expired. Please login again to save changes."
- 6e. System redirects to login page
- 6f. After re-login: system recovers data from localStorage and prompts user to restore
- Use case ends

**Business Rules Applied**:
- Auto-save interval: 30 seconds (configurable)
- Retry attempts: 3 with exponential backoff (10s, 20s, 40s)
- Local storage retention: 24 hours

**Related Use Cases**: UC-STI-002, UC-STI-003

---

## Integration Use Cases

### UC-STI-201: Retrieve Cost from Inventory Valuation Service

**Description**: System calls centralized Inventory Valuation Service to calculate transaction costs using FIFO or Periodic Average method.

**Actor(s)**: Inventory Valuation Service (External System)

**Priority**: High

**Frequency**: Per transaction commit

**Preconditions**:
- Transaction is being committed (UC-STI-004)
- Line items contain product, location, quantity, transaction date
- Inventory Valuation Service is available and configured
- Product has costing method configured (FIFO or Periodic Average)

**Postconditions**:
- **Success**: Line items populated with unit cost, total cost, and calculation method; ready for inventory update
- **Failure**: Cost calculation incomplete, commit process halted, transaction remains in Saved status

**Main Flow**:
1. Commit process initiates (UC-STI-004 step 8)
2. System prepares API request payload for Inventory Valuation Service:
   - Transaction date (determines cost period for periodic average)
   - Array of line items: productId, locationId, quantity, unitId
   - Operation type: "STOCK_IN"
3. System sends POST request to `/api/valuation/calculate-cost` endpoint
4. Inventory Valuation Service receives request
5. **For FIFO Method**: Service creates cost layer record for each line item:
   - Unit cost = cost from source (GRN cost, transfer cost, latest purchase price for adjustment)
   - Total cost = quantity * unit cost
   - Cost layer ID generated for future FIFO consumption tracking
6. **For Periodic Average Method**: Service calculates period average cost:
   - Period = month of transaction date
   - Average cost = (beginning balance value + period receipts value) / (beginning balance qty + period receipts qty)
   - Unit cost = period average cost
   - Total cost = quantity * period average cost
7. Service returns response with cost data for each line item:
   ```json
   {
     "success": true,
     "costData": [
       {
         "lineItemId": "uuid",
         "productId": "uuid",
         "unitCost": 85.5000,
         "totalCost": 17100.0000,
         "calculationMethod": "FIFO",
         "costLayerId": "uuid",  // Only for FIFO
         "calculationDate": "2024-01-15T11:00:00Z"
       },
       ...
     ]
   }
   ```
8. System receives response and validates structure
9. System updates each line item with cost information (4 decimal precision)
10. System logs API call: request payload, response, calculation date, duration
11. Use case returns success to commit process (UC-STI-004 step 9)

**Alternative Flows**:

**Alt-201A: Partial Cost Data Returned** (At step 8)
- 8a. Service returns costs for some line items but not all
- 8b. Response indicates errors for specific items: `{"success": false, "errors": [{"lineItemId": 'uuid', 'error': 'Product not found in costing system'}]}`
- 8c. System displays error listing problematic items
- 8d. System halts commit process
- Use case returns failure to commit process

**Exception Flows**:

**Exc-201A: Valuation Service Timeout** (At step 3-4)
- 3a. System sends request with 5-second timeout
- 3b. Request times out (no response within 5 seconds)
- 3c. System retries request (max 3 attempts with exponential backoff: 1s, 2s, 4s)
- 3d. All retries time out
- 3e. System logs error with request details
- 3f. System displays error: "Inventory Valuation Service timeout. Unable to calculate costs. Try again later."
- Use case returns failure to commit process (UC-STI-004 Exc-4A)

**Exc-201B: Invalid Cost Data Returned** (At step 8)
- 8a. System receives response with invalid or missing cost values
- 8b. System validates: unitCost must be ≥ 0, totalCost must equal qty * unitCost
- 8c. Validation fails for one or more items
- 8d. System logs response data for investigation
- 8e. System displays error: "Invalid cost data received from valuation service. Contact support."
- Use case returns failure to commit process

**Exc-201C: Service Returns Business Error** (At step 7)
- 7a. Service processes request but encounters business rule violation
- 7b. Service returns structured error: `{"success": false, "errorCode": "NEGATIVE_COST_LAYER", "message": "Cannot create negative cost layer for STOCK_IN", "details": {...}}`
- 7c. System displays business error message to user
- 7d. System logs error with full context
- Use case returns failure to commit process

**Business Rules Applied**:
- BR-STI-026 to BR-STI-030 (Cost calculation rules by transaction type)
- BR-STI-048 (Must call valuation service before commit)
- BR-STI-049 (Retry logic: 3 attempts with backoff)
- BR-STI-050 (Valuation failure keeps transaction in Saved status)

**API Specification**:
- **Endpoint**: `POST /api/valuation/calculate-cost`
- **Authentication**: OAuth 2.0 Bearer token
- **Timeout**: 5 seconds per request, 15 seconds total with retries
- **Retry Policy**: 3 attempts with exponential backoff (1s, 2s, 4s)
- **Rate Limit**: 100 requests per minute per client

**Related Use Cases**: UC-STI-004

---

### UC-STI-202: Post to General Ledger

**Description**: System posts inventory movement to Finance Module GL after successful commit.

**Actor(s)**: Finance Module (Internal System)

**Priority**: High

**Frequency**: Per transaction commit

**Preconditions**:
- Transaction committed successfully in inventory system
- Inventory balances updated (UC-STI-103)
- Cost data calculated (UC-STI-201)
- Finance Module is available
- Accounting period is open for transaction date

**Postconditions**:
- **Success**: GL journal entry created with debit to Inventory Asset and credit to appropriate account, JE number returned, transaction fully committed
- **Failure**: GL entry not created, inventory changes rolled back, transaction returns to Saved status

**Main Flow**:
1. Commit process reaches GL posting step (UC-STI-004 step 13)
2. System determines GL accounts based on transaction type:
   - **GRN**: Debit Inventory Asset, Credit Accounts Payable
   - **Transfer**: Debit Inventory Asset (destination), Credit Inventory Asset (source)
   - **Issue Return**: Debit Inventory Asset, Credit COGS or Department Expense (reversal)
   - **Adjustment (positive)**: Debit Inventory Asset, Credit Inventory Variance
   - **Credit Note**: Debit Accounts Payable, Credit Inventory Asset (if returning goods)
3. System calculates GL amounts: sum of line item total costs
4. System prepares GL posting API request:
   ```json
   {
     "transactionDate": "2024-01-15",
     "referenceNumber": "STK-IN-2401-0123",
     "description": "Stock In - GRN-2401-0001",
     "sourceModule": "Inventory Management",
     "lines": [
       {
         "accountCode": "1200", // Inventory Asset
         "debit": 17100.00,
         "credit": 0,
         "locationCode": "WH-MAIN",
         "costCenter": "CC-001"
       },
       {
         "accountCode": "2100", // Accounts Payable
         "debit": 0,
         "credit": 17100.00,
         "vendorId": "VEN-001"
       }
     ]
   }
   ```
5. System sends POST request to Finance Module `/api/gl/journal-entry` endpoint
6. Finance Module validates request: accounts exist, period open, balanced entry (debits = credits)
7. Finance Module creates GL journal entry record
8. Finance Module returns success response with JE number:
   ```json
   {
     "success": true,
     "journalEntryNumber": "JE-2401-5678",
     "postingDate": "2024-01-15T11:00:00Z",
     "status": "Posted"
   }
   ```
9. System receives response and validates JE number format
10. System stores JE number in transaction record (glJournalEntryNumber field)
11. System creates activity log entry: "GL posted: JE-2401-5678"
12. Use case returns success to commit process (UC-STI-004 step 14)

**Alternative Flows**:

**Alt-202A: Period Closed** (At step 6)
- 6a. Finance Module validates accounting period for transaction date
- 6b. Period is closed (no posting allowed)
- 6c. Finance returns error: `{"success": false, "errorCode": "PERIOD_CLOSED", "message": "Accounting period 2024-01 is closed"}`
- 6d. System displays error: "Cannot commit transaction. Accounting period for {date} is closed. Change transaction date or contact Finance team."
- 6e. System rolls back inventory changes (UC-STI-004 Exc-4B)
- Use case returns failure to commit process

**Alt-202B: Manual GL Posting Mode** (At step 5)
- 5a. System configuration has "Manual GL Posting" enabled (bypass automatic posting)
- 5b. System skips Finance Module API call
- 5c. System queues transaction for manual GL review (creates entry in gl_posting_queue table)
- 5d. System displays warning: "Transaction committed in inventory. Manual GL posting required."
- 5e. Finance team manually creates JE and updates transaction with JE number later
- Continue to UC-STI-004 step 15 (transaction committed despite no auto GL posting)

**Exception Flows**:

**Exc-202A: GL API Unavailable** (At step 5)
- 5a. System sends GL posting request
- 5b. Request fails with network error or timeout
- 5c. System retries 2 times (shorter retry than valuation service due to downstream dependency)
- 5d. All retries fail
- 5e. System logs error with full request context
- 5f. System displays error: "GL posting failed. Transaction cannot be committed. Try again later."
- 5g. System rolls back inventory balance updates and movement history (compensating transaction)
- Use case returns failure to commit process (UC-STI-004 Exc-4B)

**Exc-202B: GL Validation Error** (At step 6-7)
- 6a. Finance Module validates journal entry
- 6b. Validation fails (e.g., invalid account code, unbalanced entry, missing cost center)
- 6c. Finance returns error: `{"success": false, "errorCode": "INVALID_ACCOUNT", "message": "Account code '9999' does not exist", "field": "lines[0].accountCode"}`
- 6d. System logs error details
- 6e. System displays error: "GL posting failed due to configuration error: {message}. Contact system administrator."
- 6f. System rolls back inventory changes
- Use case returns failure to commit process

**Business Rules Applied**:
- BR-STI-051 (Committed transactions must trigger GL posting)
- BR-STI-052 (GL posting failure prevents commit)
- BR-STI-053 (Support manual GL posting retry)

**API Specification**:
- **Endpoint**: `POST /api/gl/journal-entry`
- **Authentication**: Service-to-service JWT token
- **Timeout**: 10 seconds
- **Retry Policy**: 2 attempts with 2-second delay
- **Idempotency**: Requests include unique idempotency key (transaction ID) to prevent duplicate postings

**Related Use Cases**: UC-STI-004, UC-STI-006

---

## Background Job Use Cases

*No scheduled background jobs are currently defined for Stock In. All processing is event-driven (user-initiated or integration-triggered).*

---

## Use Case Traceability Matrix

| Business Requirement | Related Use Cases |
|---------------------|-------------------|
| FR-STI-001 (Transaction Type Support) | UC-STI-001 |
| FR-STI-002 (Transaction List View) | UC-STI-008 |
| FR-STI-003 (Status Management) | UC-STI-003, UC-STI-004, UC-STI-005, UC-STI-006 |
| FR-STI-004 (Transaction Detail Management) | UC-STI-001, UC-STI-002, UC-STI-003, UC-STI-007 |
| FR-STI-005 (Inventory Valuation Integration) | UC-STI-004, UC-STI-201 |
| FR-STI-006 (Inventory Balance Updates) | UC-STI-004, UC-STI-103 |
| FR-STI-007 (Movement History Tracking) | UC-STI-004, UC-STI-104 |
| FR-STI-008 (Comment and Collaboration) | UC-STI-009 |
| FR-STI-009 (Document Attachments) | UC-STI-010 |
| FR-STI-010 (Activity Log) | All use cases (automatic logging) |
| FR-STI-011 (Related Document Linking) | UC-STI-001, UC-STI-203 |
| FR-STI-012 (Bulk Operations) | (To be detailed in future iteration) |
| FR-STI-013 (Print and Export) | UC-STI-011, UC-STI-012 |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version with 17 detailed use cases covering user, system, and integration scenarios |

---

## References

1. **Business Requirements**: BR-stock-in.md
2. **UI Prototype**: stock-in-list.tsx, stock-in-detail.tsx
3. **Inventory Transactions System**: SM-inventory-transactions.md
4. **Inventory Valuation Service**: SM-inventory-valuation.md

---

**Document Control**:
- **Classification**: Internal Use
- **Review Required**: Yes
- **Approved By**: Pending
- **Next Review Date**: TBD
