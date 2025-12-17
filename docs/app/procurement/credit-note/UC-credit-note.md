# Use Cases: Credit Note

## Module Information
- **Module**: Procurement
- **Sub-Module**: Credit Note
- **Route**: `/procurement/credit-note`
- **Version**: 1.0.4
- **Last Updated**: 2025-12-03
- **Owner**: Procurement Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.4 | 2025-12-03 | Documentation Team | Updated to support configurable costing method (FIFO or Periodic Average) per system settings |
| 1.0.3 | 2025-12-03 | Documentation Team | Added Shared Method references to backend use cases (UC-CN-207, UC-CN-208, UC-CN-210) |
| 1.0.2 | 2025-12-03 | Documentation Team | Added backend system use cases for server actions (UC-CN-201 to UC-CN-214) |
| 1.0.1 | 2025-12-03 | Documentation Team | Document history update for consistency across documentation set |
| 1.0.0 | 2025-01-11 | Documentation Team | Initial version from source code analysis |

---

## Overview

This document describes the use cases for the Credit Note module, covering all user interactions, system processes, and integration points discovered in the actual codebase. The Credit Note module supports vendor credit management through two primary workflows: quantity-based credit notes (for physical returns with stock movements) and amount-based credit notes (for pricing adjustments without physical returns).

Key workflows include credit note list management, item-level credit processing with inventory costing (FIFO or Periodic Average, configurable at system level), lot tracking, multi-currency handling, automatic journal entry generation, tax adjustments, and stock movement integration.

**Related Documents**:
- [Business Requirements](./BR-credit-note.md)
- [Technical Specification](./TS-credit-note.md)
- [Data Definition](./DD-credit-note.md)
- [Flow Diagrams](./FD-credit-note.md)
- [Validations](./VAL-credit-note.md)

---

## Actors

### Primary Actors

| Actor | Description | Role |
|-------|-------------|------|
| Purchasing Staff | Procurement team members managing vendor relationships | Creates credit notes, manages returns, documents discrepancies |
| Receiving Clerk | Warehouse staff who handle physical returns | Records return quantities, inspects damaged goods |
| Warehouse Staff | Staff responsible for inventory and storage operations | Confirms stock movements, manages returned inventory |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| Procurement Manager | Manager overseeing procurement operations | Reviews credit notes, resolves pricing disputes, voids committed credits |
| Finance Team | Financial staff processing vendor payments | Reviews credit note financial data, processes vendor credits |
| Accounts Payable Clerk | Staff managing vendor payments and credits | Applies credits to vendor accounts, processes adjustments |

### System Actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| Inventory Management Module | Updates stock levels when quantity-based credit note is committed | Internal Module Integration |
| Finance Module | Receives journal entries from committed credit notes | Internal Module Integration |
| GRN Module | Provides source data for credit notes linked to receipts | Internal Module Integration |
| Tax Module | Calculates and adjusts input VAT on credit amounts | Internal Module Integration |

---

## Use Case Diagram

```
                    ┌────────────────────────────────────────┐
                    │       Credit Note System               │
                    └──────────────┬─────────────────────────┘
                                   │
    ┌──────────────────────────────┼──────────────────────────────┐
    │                              │                              │
    │                              │                              │
┌───▼────────┐               ┌────▼─────────┐            ┌───────▼────────┐
│ Purchasing │               │  Receiving   │            │   Warehouse    │
│   Staff    │               │    Clerk     │            │     Staff      │
└───┬────────┘               └────┬─────────┘            └───────┬────────┘
    │                              │                              │
[UC-CN-001]                   [UC-CN-002]                   [UC-CN-006]
[UC-CN-002]                   [UC-CN-005]                   [UC-CN-007]
[UC-CN-003]                   [UC-CN-006]                   [UC-CN-008]
[UC-CN-004]
[UC-CN-005]
[UC-CN-009]
[UC-CN-010]


         ┌──────────────────┐              ┌──────────────────┐
         │   Procurement    │              │     Finance      │
         │     Manager      │              │      Team        │
         └────────┬─────────┘              └────────┬─────────┘
                  │                                 │
             [UC-CN-011]                       [UC-CN-010]
             (void credit)                     (commit credit)


    ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
    │  Inventory   │              │   Finance    │              │ Procurement  │
    │ Management   │              │    Module    │              │    Module    │
    │   Module     │              │              │              │              │
    └──────┬───────┘              └──────┬───────┘              └──────┬───────┘
           │                             │                             │
      [UC-CN-101]                  [UC-CN-102]                   [UC-CN-103]
   (stock update)              (journal voucher)              (tax adjustment)
      [UC-CN-104]                  [UC-CN-104]                   [UC-CN-106]
  (consumed items)            (consumed items)            (retrospective discount)
      [UC-CN-105]                  [UC-CN-105]
 (partial availability)      (partial availability)
```

**Legend**:
- **Primary Actors** (top row): Purchasing Staff, Receiving Clerk, Warehouse Staff
- **Secondary Actors** (middle row): Procurement Manager, Finance Team
- **System Actors** (bottom row): Inventory, Finance, and Procurement modules
  - UC-CN-101: Generate stock movements for quantity returns
  - UC-CN-102: Generate journal entries for all credit notes
  - UC-CN-103: Calculate tax adjustments
  - UC-CN-104: Process credit notes for fully consumed items (COGS adjustment only)
  - UC-CN-105: Process credit notes with partial inventory availability (split processing)
  - UC-CN-106: Process retrospective vendor discounts across historical purchases

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **User Use Cases** | | | | | |
| UC-CN-001 | View and Filter Credit Note List | Purchasing Staff, Finance Team | High | Simple | User |
| UC-CN-002 | Create Quantity-Based Credit Note from GRN | Purchasing Staff, Receiving Clerk | Critical | Complex | User |
| UC-CN-003 | Create Amount-Based Credit Note | Purchasing Staff | High | Medium | User |
| UC-CN-004 | View Credit Note Details | Purchasing Staff, Finance Team, Warehouse Staff | High | Simple | User |
| UC-CN-005 | Edit Credit Note (Draft Status) | Purchasing Staff, Receiving Clerk | High | Medium | User |
| UC-CN-006 | Manage Credit Note Items with Lot Selection | Receiving Clerk, Warehouse Staff | Critical | Complex | User |
| UC-CN-007 | Review Cost Analysis | Purchasing Staff, Finance Team | High | Medium | User |
| UC-CN-008 | Assign Credit Reason and Description | Purchasing Staff | Medium | Simple | User |
| UC-CN-009 | Add Comments and Attachments | Purchasing Staff | Medium | Simple | User |
| UC-CN-010 | Commit Credit Note | Finance Team, Procurement Manager | Critical | Complex | User |
| UC-CN-011 | Void Credit Note | Procurement Manager | Medium | Medium | User |
| **System Use Cases** | | | | | |
| UC-CN-101 | Generate Stock Movements | Inventory Management Module | Critical | Complex | System |
| UC-CN-102 | Generate Journal Entries | Finance Module | Critical | Complex | System |
| UC-CN-103 | Calculate Tax Adjustments | Tax Module | Critical | Medium | System |
| UC-CN-104 | Process Credit Note for Consumed Items | Finance Module, Inventory Module | Critical | Complex | System |
| UC-CN-105 | Process Credit Note with Partial Availability | Finance Module, Inventory Module | Critical | Complex | System |
| UC-CN-106 | Process Retrospective Vendor Discount | Finance Module, Procurement Module | High | Complex | System |
| **Backend System Use Cases** | | | | | |
| UC-CN-201 | Execute Credit Note CRUD Server Actions | Server Action Layer | Critical | Complex | Backend |
| UC-CN-202 | Fetch Vendor and GRN Data | Server Action Layer | Critical | Medium | Backend |
| UC-CN-203 | Execute Commitment Transaction | Server Action Layer | Critical | Complex | Backend |
| UC-CN-204 | Execute Void Transaction | Server Action Layer | Critical | Complex | Backend |
| UC-CN-205 | Calculate Inventory Costs | Server Action Layer | Critical | Complex | Backend |
| UC-CN-206 | Calculate Tax Amounts | Server Action Layer | Critical | Medium | Backend |
| UC-CN-207 | Generate Journal Entries | Server Action Layer | Critical | Complex | Backend |
| UC-CN-208 | Generate Stock Movements | Server Action Layer | Critical | Complex | Backend |
| UC-CN-209 | Manage Attachments | Server Action Layer | High | Medium | Backend |
| UC-CN-210 | Log Audit Events | Server Action Layer | Critical | Medium | Backend |
| UC-CN-211 | Generate CN Number Sequence | Server Action Layer | Critical | Medium | Backend |
| UC-CN-212 | Update Vendor Balance | Server Action Layer | Critical | Medium | Backend |
| UC-CN-213 | Validate Credit Note Data | Server Action Layer | Critical | Medium | Backend |
| UC-CN-214 | Sync Real-time Data | Server Action Layer | High | Medium | Backend |

---

## User Use Cases

### UC-CN-001: View and Filter Credit Note List

**Description**: User views a paginated list of all credit notes and applies filters to find specific credit notes based on criteria such as status, date, vendor, or credit type.

**Actor(s)**: Purchasing Staff, Finance Team

**Priority**: High

**Frequency**: Daily (10-20 times per day)

**Preconditions**:
- User is authenticated and has permission to view credit notes
- Credit note data exists in the system

**Postconditions**:
- **Success**: User sees filtered list of credit notes matching their criteria
- **Failure**: User sees error message, full list displayed if filters invalid

**Main Flow**:
1. User navigates to `/procurement/credit-note` route
2. System loads and displays credit note list in data table with default sorting (newest first)
3. User selects filter criteria (status, vendor, date range, credit type)
4. System applies filters and updates the display
5. User sees filtered credit note list with key information: CN number, date, vendor, type, status, total amount
6. Use case ends

**Alternative Flows**:

**Alt-1A: Search by CN Number or Vendor** (At step 3)
- 3a. User enters search term in search box
- 3b. System filters credit notes matching search term in CN number, vendor name, or description
- 3c. System displays filtered results
- Continue to step 6

**Alt-1B: Sort by Column** (At step 3)
- 3a. User clicks column header to sort
- 3b. System sorts credit notes by selected column (ascending/descending)
- 3c. System displays sorted results
- Continue to step 6

**Alt-1C: Switch Between Views** (At step 3)
- 3a. User clicks view toggle (card view/table view)
- 3b. System switches display mode
- 3c. System maintains current filters and sorting
- Continue to step 6

**Exception Flows**:

**Exc-1A: No Credit Notes Found** (At step 4)
- System finds no credit notes matching filter criteria
- System displays "No results found" message
- User clears filters or modifies search criteria
- Resume at step 3 or end use case

**Business Rules**:
- **BR-CN-060**: Users can only view credit notes for vendors they have permission to access

**Related Requirements**:
- FR-CN-001: Credit Note List and Overview
- NFR-CN-001: List page load performance within 2 seconds

**Notes**:
- List supports sorting by all displayed columns
- Status colors: DRAFT (gray), COMMITTED (green), VOID (red)
- Pagination defaults to 20 rows per page
- Credit type icons differentiate QUANTITY_RETURN vs AMOUNT_DISCOUNT

---

### UC-CN-002: Create Quantity-Based Credit Note from GRN

**Description**: User creates a new quantity-based credit note by selecting a vendor, choosing a GRN, selecting items with specific lot numbers, and recording return quantities with inventory cost calculations.

**Actor(s)**: Purchasing Staff, Receiving Clerk

**Priority**: Critical

**Frequency**: Weekly (5-15 times per week across all locations)

**Preconditions**:
- User is authenticated with purchasing or receiving role
- At least one posted GRN exists for the vendor
- Vendor and product master data are configured
- Inventory lots exist for the items being returned

**Postconditions**:
- **Success**: New credit note created with status DRAFT, linked to source GRN and inventory lots, inventory cost calculated
- **Failure**: No credit note created, user informed of validation errors

**Main Flow**:
1. User clicks "New Credit Note" button from credit note list page
2. System navigates to vendor selection page
3. User searches and selects vendor from list
4. System displays GRN selection dialog for selected vendor
5. User searches and selects GRN by GRN number or invoice number
6. System loads GRN items and displays item/lot selection dialog
7. System shows credit note type options: "Quantity Return" or "Amount Discount"
8. User selects "Quantity Return"
9. For each item to return, user:
   - Selects specific inventory lot(s) from available lots
   - Enters return quantity per lot
   - System auto-calculates inventory cost based on lot selection
   - System displays cost variance and realized gain/loss
10. User enters credit note header information:
    - Document date
    - Invoice reference and date
    - Tax invoice reference and date
    - Credit reason (DAMAGED_GOODS, RETURN, PRICING_ERROR, etc.)
    - Description/notes
11. System generates temporary CN number (new-UUID)
12. User saves credit note
13. System validates data and calculates totals
14. System assigns CN number (CN-YYMM-NNNN format)
15. System saves credit note with status DRAFT
16. System displays success message with CN number
17. System navigates to credit note detail page for review
18. Use case ends

**Alternative Flows**:

**Alt-2A: Select Multiple Lots for Same Item** (At step 9)
- 9a. User checks multiple lot checkboxes for same product
- 9b. System aggregates quantities across selected lots
- 9c. System calculates weighted average cost using system-configured method (FIFO or Periodic Average)
- 9d. System displays lot application details in expandable section
- Continue to step 10

**Alt-2B: Apply Discount on Top of Return** (At step 9)
- 9a. After entering return quantity, user enters discount amount
- 9b. System calculates net credit amount (return value - discount)
- 9c. System displays both amounts in item details
- Continue to step 10

**Alt-2C: Return Partial Lot Quantity** (At step 9)
- 9a. User enters return quantity less than lot available quantity
- 9b. System validates return quantity doesn't exceed lot quantity
- 9c. System calculates credit based on partial quantity
- Continue to step 10

**Exception Flows**:

**Exc-2A: No GRNs Available for Vendor** (At step 4)
- System finds no posted GRNs for selected vendor
- System displays "No GRNs available for this vendor" message
- User cancels operation or selects different vendor
- Resume at step 3 or end use case

**Exc-2B: No Inventory Lots Available** (At step 6)
- System finds no inventory lots for selected GRN items
- System displays "No inventory lots available for return" message
- User cancels operation or checks inventory status
- Use case ends

**Exc-2C: Return Quantity Exceeds Available Lot** (At step 9)
- User enters return quantity greater than lot available quantity
- System displays validation error with available quantity
- User corrects quantity or selects additional lots
- Resume at step 9

**Exc-2D: Inventory Cost Calculation Failure** (At step 9)
- System cannot calculate inventory cost due to missing lot cost data
- System displays warning message
- User contacts administrator to correct lot cost data
- Use case ends (resume later after correction)

**Business Rules**:
- **BR-CN-001**: Each credit note assigned unique sequential number CN-YYMM-NNNN
- **BR-CN-010**: Credit note quantity must be greater than 0
- **BR-CN-011**: Credit note quantity cannot exceed available lot quantity
- **BR-CN-030**: inventory costing method must be used for quantity-based credits
- **BR-CN-031**: Cost variance calculated as (current cost - calculated unit cost)
- **BR-CN-040**: Credit note must reference specific inventory lot(s)
- **BR-CN-041**: Stock movement generated only after credit note posted

**Includes**:
- [UC-CN-006: Manage Credit Note Items with Lot Selection](#uc-cn-006-manage-credit-note-items-with-lot-selection)
- [UC-CN-007: Review Inventory Cost Analysis](#uc-cn-007-review-fifo-cost-analysis)

**Related Requirements**:
- FR-CN-002: Quantity-Based Credit Note Creation
- FR-CN-005: Inventory Costing and Lot Tracking
- FR-CN-006: Multi-Currency Support
- NFR-CN-003: Credit note creation completes within 3 seconds

**UI Mockups**: See Flow Diagrams for quantity-based credit note creation workflow

**Notes**:
- System generates temporary ID (new-UUID) during creation, replaced with actual CN number on save
- cost analysis displayed in expandable section showing lot application details
- Credit note type cannot be changed after save
- System tracks applied lots for audit trail
- Exchange rate captured at document date for multi-currency transactions

---

### UC-CN-003: Create Amount-Based Credit Note

**Description**: User creates a pricing adjustment credit note without physical returns, typically for pricing errors or negotiated discounts.

**Actor(s)**: Purchasing Staff

**Priority**: High

**Frequency**: Weekly (3-8 times per week)

**Preconditions**:
- User is authenticated with purchasing role
- Vendor exists in system
- GRN reference exists (optional but recommended)

**Postconditions**:
- **Success**: New credit note created with status DRAFT, no stock movements required
- **Failure**: No credit note created, user informed of validation errors

**Main Flow**:
1. User clicks "New Credit Note" button from credit note list page
2. System navigates to vendor selection page
3. User searches and selects vendor from list
4. System displays GRN selection dialog (optional step)
5. User selects GRN reference OR skips to create standalone credit note
6. System displays item/lot selection dialog
7. User selects credit note type: "Amount Discount"
8. For each item, user:
   - Selects product from GRN items (if GRN selected) or product catalog
   - Enters discount amount (no quantity entry required)
   - Optionally enters unit price adjustment
9. User enters credit note header information:
   - Document date
   - Invoice reference and date (if applicable)
   - Tax invoice reference and date
   - Credit reason (PRICING_ERROR, DISCOUNT_AGREEMENT, etc.)
   - Description explaining pricing adjustment
10. System calculates tax adjustments based on discount amounts
11. User saves credit note
12. System validates data and calculates totals
13. System assigns CN number (CN-YYMM-NNNN format)
14. System saves credit note with status DRAFT
15. System displays success message
16. System navigates to credit note detail view
17. Use case ends

**Alternative Flows**:

**Alt-3A: Create Without GRN Reference** (At step 4-5)
- 4a. User clicks "Skip GRN Selection"
- 4b. System allows manual product selection from catalog
- 4c. User selects products and enters discount amounts
- Continue to step 8

**Alt-3B: Apply Percentage Discount** (At step 8)
- 8a. User enters discount percentage instead of fixed amount
- 8b. System calculates discount amount from unit price × percentage
- 8c. System displays both percentage and calculated amount
- Continue to step 9

**Alt-3C: Multi-Item Discount** (At step 8)
- 8a. User adds multiple items from same GRN
- 8b. User enters discount amount per item
- 8c. System aggregates total credit amount
- Continue to step 9

**Exception Flows**:

**Exc-3A: Missing Invoice Reference for Tax Credit** (At step 9)
- System detects tax-related credit without invoice reference
- System displays warning message
- User provides invoice reference or acknowledges non-tax credit
- Resume at step 11

**Exc-3B: Discount Exceeds Original Invoice Amount** (At step 12)
- System detects discount amount exceeds referenced invoice total
- System displays validation error
- User corrects discount amount or confirms intentional adjustment
- Resume at step 11 or end use case

**Business Rules**:
- **BR-CN-001**: Each credit note assigned unique sequential number
- **BR-CN-012**: Amount discount must be greater than 0
- **BR-CN-032**: Tax calculated at rate applicable on document date
- **BR-CN-050**: Journal entry generated for AP credit and input VAT adjustment

**Related Requirements**:
- FR-CN-003: Amount-Based Credit Note Creation
- FR-CN-008: Tax Calculation and Adjustment
- FR-CN-012: Multi-Currency Support

**Notes**:
- No stock movements generated for amount-based credit notes
- inventory costing not applicable (no quantity return)
- Credit applied directly to vendor payable account
- Tax adjustment calculated based on discount amount

---

### UC-CN-004: View Credit Note Details

**Description**: User views complete details of a credit note including header information, items, lot applications, journal entries, stock movements, and tax calculations.

**Actor(s)**: Purchasing Staff, Finance Team, Warehouse Staff

**Priority**: High

**Frequency**: Daily (20-40 times per day)

**Preconditions**:
- User is authenticated and has permission to view credit notes
- Credit note exists in the system

**Postconditions**:
- **Success**: User sees complete credit note details with all tabs and information
- **Failure**: User sees error message if credit note not found or no permission

**Main Flow**:
1. User navigates to credit note detail page via list or direct link
2. System loads credit note data including header, items, and reference data
3. System displays credit note header with:
   - CN number, date, status
   - Vendor information
   - Credit type (QUANTITY_RETURN or AMOUNT_DISCOUNT)
   - Currency and exchange rate
   - Invoice and tax invoice references
   - GRN reference (if applicable)
   - Credit reason and description
4. System displays items table with:
   - Product name and description
   - Location and lot number (for quantity returns)
   - Return quantity and unit price
   - Discount amounts
   - Tax calculations
   - Line totals
5. User can switch between tabs to view:
   - **Inventory Tab**: Lot application details with cost analysis
   - **Journal Entries Tab**: GL account postings
   - **Tax Entries Tab**: VAT calculations and adjustments
   - **Stock Movement Tab**: Inventory movements (quantity returns only)
6. System displays document totals:
   - Net amount
   - Tax amount
   - Total credit amount
7. System shows action buttons based on status and permissions
8. Use case ends

**Alternative Flows**:

**Alt-4A: View Inventory Lot Details** (At step 5)
- 5a. User clicks "Inventory" tab
- 5b. System displays lot application table showing:
   - Applied lot numbers with receive dates
   - Original GRN and invoice references
   - inventory cost calculations
   - Cost variance analysis
- Continue to step 6

**Alt-4B: View Journal Entries** (At step 5)
- 5a. User clicks "Journal Entries" tab
- 5b. System displays journal entries grouped by:
   - Primary Entries (AP credit, inventory adjustment, input VAT)
   - Inventory Entries (cost variance adjustments)
- 5c. System shows account codes, descriptions, debit/credit amounts
- Continue to step 6

**Alt-4C: View Tax Calculations** (At step 5)
- 5a. User clicks "Tax Entries" tab
- 5b. System displays:
   - Document information (CN number, tax invoice, vendor tax ID)
   - Tax calculations (base amount, rate, tax amount)
   - VAT adjustments
   - VAT period information
- Continue to step 6

**Alt-4D: View Stock Movements** (At step 5)
- 5a. User clicks "Stock Movement" tab (quantity returns only)
- 5b. System displays:
   - Location type (INV/CON)
   - Lot numbers and quantities (negative for returns)
   - Unit costs and extra costs
   - Movement dates
- Continue to step 6

**Exception Flows**:

**Exc-4A: Credit Note Not Found** (At step 2)
- System cannot find credit note with specified ID
- System displays "Credit note not found" error
- User returns to credit note list
- Use case ends

**Exc-4B: No Permission to View** (At step 2)
- User lacks permission to view this credit note
- System displays "Access denied" message
- User returns to previous page
- Use case ends

**Business Rules**:
- **BR-CN-060**: Users can only view credit notes they have permission to access
- **BR-CN-062**: All financial data displayed according to user's decimal place settings

**Related Requirements**:
- FR-CN-004: Credit Note Detail View
- FR-CN-007: Journal Entry Display
- FR-CN-009: Stock Movement Display
- NFR-CN-002: Detail page load within 1.5 seconds

**Notes**:
- Tabs only show relevant data (e.g., no Stock Movement tab for amount-based credits)
- Status badges color-coded for quick recognition
- cost analysis expandable for detailed lot costing information
- Print button available for PDF generation

---

### UC-CN-005: Edit Credit Note (Draft Status)

**Description**: User modifies credit note details while in DRAFT status, including header information, items, quantities, and amounts.

**Actor(s)**: Purchasing Staff, Receiving Clerk

**Priority**: High

**Frequency**: Daily (5-10 times per day)

**Preconditions**:
- User is authenticated with purchasing or receiving role
- Credit note exists with status DRAFT
- User has permission to edit credit notes

**Postconditions**:
- **Success**: Credit note updated with new values, remains in DRAFT status
- **Failure**: No changes saved, user informed of validation errors

**Main Flow**:
1. User navigates to credit note detail page
2. System displays credit note in view mode
3. User clicks "Edit" button
4. System switches to edit mode, enables form fields
5. User modifies credit note fields:
   - Document date
   - Invoice references
   - Credit reason
   - Description
   - Item quantities or discount amounts
   - Lot selections (for quantity returns)
6. System recalculates totals and tax amounts on field changes
7. System displays updated inventory cost calculations (for quantity changes)
8. User clicks "Save" button
9. System validates all changes
10. System recalculates journal entries and stock movements
11. System updates credit note record
12. System displays success message
13. System returns to view mode with updated data
14. Use case ends

**Alternative Flows**:

**Alt-5A: Cancel Edit** (At step 5)
- 5a. User clicks "Cancel" button
- 5b. System discards all changes
- 5c. System returns to view mode with original data
- Use case ends

**Alt-5B: Add/Remove Items** (At step 5)
- 5a. User clicks "Add Item" or removes existing item
- 5b. System updates item list
- 5c. System recalculates totals
- Continue to step 6

**Alt-5C: Change Lot Selection** (At step 5)
- 5a. User clicks lot selection button for item
- 5b. System displays lot selection dialog
- 5c. User selects different lots or changes quantities
- 5d. System recalculates inventory costs
- Continue to step 6

**Exception Flows**:

**Exc-5A: Credit Note Not in DRAFT Status** (At step 3)
- Credit note status is not DRAFT
- System disables "Edit" button
- System displays "Only draft credit notes can be edited" message
- Use case ends

**Exc-5B: Validation Failure** (At step 9)
- System detects validation errors (missing fields, invalid quantities)
- System displays specific error messages
- User corrects errors
- Resume at step 8

**Exc-5C: Concurrent Edit Detected** (At step 11)
- Another user has modified credit note since current user loaded it
- System displays conflict warning
- User chooses to reload and lose changes or force save
- Resume at step 2 (reload) or step 11 (force save)

**Business Rules**:
- **BR-CN-020**: Only DRAFT status credit notes can be edited
- **BR-CN-021**: CN number and credit type cannot be changed after save
- **BR-CN-010**: All quantity and amount validations must pass

**Related Requirements**:
- FR-CN-004: Credit Note Edit Functionality
- FR-CN-005: Real-time Calculation Updates

**Notes**:
- System auto-saves to temporary storage every 2 minutes
- All calculations update in real-time as user makes changes
- Lot selection changes trigger cost recalculation
- User can discard draft and start over if needed

---

### UC-CN-006: Manage Credit Note Items with Lot Selection

**Description**: User adds, modifies, or removes credit note items with specific inventory lot selections and return quantities.

**Actor(s)**: Receiving Clerk, Warehouse Staff, Purchasing Staff

**Priority**: Critical

**Frequency**: Daily (10-20 times per day)

**Preconditions**:
- Credit note exists in DRAFT status
- Inventory lots exist for items being returned
- User has permission to edit credit notes

**Postconditions**:
- **Success**: Credit note items updated with lot selections and quantities, inventory costs calculated
- **Failure**: No changes saved, user informed of validation errors

**Main Flow**:
1. User opens item/lot selection dialog from credit note edit mode
2. System displays GRN items with expandable lot details
3. For each item to return, user:
   - Expands item row to view available inventory lots
   - Sees lot details: lot number, receive date, GRN number, invoice number, available quantity
4. User checks lot selection checkboxes for lots to include in return
5. For each selected lot, user enters return quantity
6. System validates return quantity doesn't exceed lot available quantity
7. System calculates cost summary:
   - Total received quantity across selected lots
   - Weighted average cost using system-configured costing method
   - Current unit cost
   - Cost variance (current cost - calculated cost)
   - Return amount (quantity × current cost)
   - Cost of goods sold (quantity × calculated cost)
   - Realized gain/loss
8. User optionally enters discount amount for item
9. System displays lot application details in expandable section
10. User saves item/lot selections
11. System updates credit note items with lot references
12. System calculates line totals and updates document total
13. System displays updated credit note
14. Use case ends

**Alternative Flows**:

**Alt-6A: Select All Lots for Item** (At step 4)
- 4a. User clicks "Select All Lots" checkbox
- 4b. System selects all available lots for item
- 4c. System pre-fills return quantities with available quantities
- Continue to step 6

**Alt-6B: Clear All Lot Selections** (At step 4)
- 4a. User clicks "Clear All" button
- 4b. System unchecks all lot selections
- 4c. System clears return quantities
- Continue to step 3

**Alt-6C: Apply Proportional Quantities** (At step 5)
- 5a. User enters total return quantity at item level
- 5b. System distributes quantity proportionally across selected lots using oldest-first ordering
- 5c. System displays calculated quantities per lot
- Continue to step 6

**Exception Flows**:

**Exc-6A: No Lots Available** (At step 3)
- System finds no inventory lots for selected item
- System displays "No inventory lots available" message
- User cannot proceed with return for this item
- User removes item or contacts administrator
- Use case ends

**Exc-6B: Return Quantity Exceeds Lot Quantity** (At step 6)
- User enters quantity greater than lot available quantity
- System displays validation error with available quantity
- User corrects quantity
- Resume at step 5

**Exc-6C: Inventory Cost Calculation Error** (At step 7)
- System cannot calculate inventory cost due to missing lot/period cost data
- System displays error message
- User contacts administrator to correct lot costs
- Use case ends (resume later)

**Business Rules**:
- **BR-CN-040**: Credit note must reference specific inventory lot(s)
- **BR-CN-041**: Return quantity cannot exceed lot available quantity
- **BR-CN-030**: inventory costing method mandatory for quantity-based credits
- **BR-CN-031**: Cost variance calculated as (current cost - calculated unit cost)

**Related Requirements**:
- FR-CN-005: Lot Selection and Tracking
- FR-CN-006: Inventory Cost Calculation
- FR-CN-015: Real-time Calculation Updates

**Notes**:
- Lot selection dialog shows real-time availability from inventory
- cost summary updates immediately as user changes selections
- Expandable sections provide detailed cost analysis
- System stores lot application for audit trail
- Multiple lots can be selected for same item

---

### UC-CN-007: Review Inventory Cost Analysis

**Description**: User reviews detailed inventory costing calculations showing weighted average costs, cost variances, and realized gains/losses for quantity-based credit notes.

**Actor(s)**: Purchasing Staff, Finance Team

**Priority**: High

**Frequency**: Weekly (10-15 times per week)

**Preconditions**:
- Credit note exists with quantity-based items
- Inventory lots selected and inventory cost calculations completed
- User has permission to view cost data

**Postconditions**:
- **Success**: User views detailed cost analysis and understands cost implications
- **Failure**: User sees error message if cost data unavailable

**Main Flow**:
1. User opens credit note detail page
2. System displays credit note with items
3. User clicks "Inventory" tab or expands cost analysis section
4. System displays cost summary for each item:
   - Total received quantity (sum across selected lots)
   - Weighted average cost (inventory cost calculation)
   - Current unit cost
   - Cost variance (current - calculated cost)
   - Return quantity
   - Return amount (quantity × current cost)
   - Cost of goods sold (quantity × calculated cost)
   - Realized gain/loss (return amount - COGS)
5. System displays applied lots table showing:
   - Lot number
   - Receive date
   - GRN number
   - Invoice number
   - Original quantity and cost
   - Return quantity from this lot
6. User can expand/collapse cost details for each item
7. System highlights cost variances (positive in green, negative in red)
8. User can export cost analysis to Excel
9. Use case ends

**Alternative Flows**:

**Alt-7A: View Aggregate Cost Summary** (At step 4)
- 4a. User views document-level cost summary
- 4b. System displays totals across all items:
   - Total return amount
   - Total COGS
   - Total realized gain/loss
- Continue to step 5

**Alt-7B: Drill Down to Lot Details** (At step 5)
- 5a. User clicks lot number link
- 5b. System displays lot detail page with full history
- 5c. User views lot transactions and balances
- User returns to credit note
- Resume at step 6

**Exception Flows**:

**Exc-7A: Cost Data Incomplete** (At step 4)
- System cannot display complete cost analysis due to missing lot cost data
- System displays warning message
- System shows partial data with incomplete indicators
- User contacts administrator to correct data
- Use case ends

**Business Rules**:
- **BR-CN-030**: inventory costing method mandatory for quantity-based credits
- **BR-CN-031**: Cost variance = current cost - calculated unit cost
- **BR-CN-033**: Realized gain/loss = (quantity × current cost) - (quantity × calculated cost)

**Related Requirements**:
- FR-CN-006: Inventory Cost Analysis Display
- FR-CN-005: Lot Tracking and Application

**Notes**:
- cost analysis only applicable to quantity-based credit notes
- Cost variances may indicate pricing changes or inventory aging
- Realized gain/loss impacts gross margin reporting
- Excel export includes detailed lot-by-lot breakdown

---

### UC-CN-008: Assign Credit Reason and Description

**Description**: User selects standardized credit reason and provides detailed description explaining why the credit note is being issued.

**Actor(s)**: Purchasing Staff

**Priority**: Medium

**Frequency**: Every credit note creation (15-25 times per week)

**Preconditions**:
- Credit note is being created or edited
- User has purchasing role

**Postconditions**:
- **Success**: Credit reason and description saved with credit note
- **Failure**: Validation error if reason not selected

**Main Flow**:
1. User creates or edits credit note
2. System displays credit reason dropdown with options:
   - PRICING_ERROR (Pricing or calculation error)
   - DAMAGED_GOODS (Items damaged in transit or storage)
   - RETURN (Items returned to vendor)
   - DISCOUNT_AGREEMENT (Negotiated discount or rebate)
   - OTHER (Other reason not listed)
3. User selects appropriate credit reason
4. System displays description text area
5. User enters detailed description explaining:
   - Specific circumstances requiring credit
   - Reference to vendor communication (if applicable)
   - Impact on inventory or financials
   - Any follow-up actions required
6. System validates description length (minimum 10 characters)
7. User saves credit note
8. System stores reason code and description
9. Use case ends

**Alternative Flows**:

**Alt-8A: Select OTHER Reason** (At step 3)
- 3a. User selects "OTHER" from dropdown
- 3b. System requires detailed description (minimum 50 characters)
- 3c. User provides specific explanation
- Continue to step 6

**Alt-8B: Copy Description from Previous Credit Note** (At step 5)
- 5a. User clicks "Copy from Previous" button
- 5b. System displays recent credit note descriptions for same vendor
- 5c. User selects description to copy
- 5d. System populates description field
- User can edit copied text
- Continue to step 6

**Exception Flows**:

**Exc-8A: Description Too Short** (At step 6)
- User enters description less than minimum length
- System displays validation error
- User adds more detail
- Resume at step 5

**Exc-8B: Reason Not Selected** (At step 7)
- User attempts to save without selecting reason
- System displays required field error
- User selects reason
- Resume at step 3

**Business Rules**:
- **BR-CN-013**: Credit reason is mandatory field
- **BR-CN-014**: Description must be minimum 10 characters (50 for OTHER reason)
- **BR-CN-061**: Reason and description logged in audit trail

**Related Requirements**:
- FR-CN-010: Credit Reason Management
- FR-CN-016: Audit Trail

**Notes**:
- Reason codes standardized for reporting and analysis
- Description supports up to 1000 characters
- Both reason and description appear on printed credit note
- Reason recorded in audit trail and visible in credit note details

---

### UC-CN-009: Add Comments and Attachments

**Description**: User adds internal comments and attaches supporting documents to credit note for collaboration and documentation purposes.

**Actor(s)**: Purchasing Staff, Finance Team

**Priority**: Medium

**Frequency**: As needed (5-10 times per week)

**Preconditions**:
- Credit note exists in system
- User has permission to add comments/attachments

**Postconditions**:
- **Success**: Comments and attachments saved with credit note, visible to authorized users
- **Failure**: Attachment upload fails or exceeds size limits

**Main Flow**:
1. User opens credit note detail page
2. System displays comment and attachment sections
3. User adds comment:
   - Clicks "Add Comment" button
   - Enters comment text
   - Optionally mentions other users with @ symbol
   - Clicks "Post Comment"
4. System saves comment with timestamp and user name
5. System sends notifications to mentioned users
6. User attaches files:
   - Clicks "Attach File" button
   - Selects file(s) from local system
   - Enters file description (optional)
7. System validates file type and size
8. System uploads file to secure storage
9. System displays attachment in list with:
   - File name and size
   - Upload date and user
   - Description
   - Download link
10. Use case ends

**Alternative Flows**:

**Alt-9A: Attach Multiple Files** (At step 6)
- 6a. User selects multiple files at once
- 6b. System uploads all files in batch
- 6c. System displays progress bar
- Continue to step 9

**Alt-9B: Edit Comment** (At step 3)
- 3a. User clicks "Edit" on their own comment
- 3b. User modifies comment text
- 3c. User saves changes
- 3d. System marks comment as edited with timestamp
- Continue to step 4

**Alt-9C: Delete Attachment** (At step 9)
- 9a. User clicks "Delete" on attachment
- 9b. System prompts for confirmation
- 9c. User confirms deletion
- 9d. System removes attachment and logs deletion
- Use case ends

**Exception Flows**:

**Exc-9A: File Too Large** (At step 7)
- User attempts to upload file exceeding size limit (10MB)
- System displays error message with size limit
- User compresses file or selects smaller file
- Resume at step 6

**Exc-9B: Invalid File Type** (At step 7)
- User attempts to upload restricted file type
- System displays error message with allowed types
- User selects appropriate file type
- Resume at step 6

**Exc-9C: Upload Failure** (At step 8)
- File upload fails due to network error
- System displays error message
- User retries upload
- Resume at step 6 or end use case

**Business Rules**:
- **BR-CN-015**: Maximum attachment size 10MB per file
- **BR-CN-016**: Allowed file types: PDF, JPG, PNG, XLSX, DOCX
- **BR-CN-063**: All comments and attachments logged in audit trail

**Related Requirements**:
- FR-CN-011: Comment System
- FR-CN-012: Attachment Management
- NFR-CN-006: File upload completes within 10 seconds

**Notes**:
- Comments support markdown formatting
- Attachments stored in secure cloud storage
- Users can only edit/delete their own comments
- System administrators can manage all comments/attachments
- Email notifications sent for @mentions

---


### UC-CN-010: Commit Credit Note

**Description**: Authorized user commits draft credit note to financial system, generating journal entries, updating inventory, and adjusting vendor payables.

**Actor(s)**: Finance Team, Procurement Manager

**Priority**: Critical

**Frequency**: Daily (10-20 times per day)

**Preconditions**:
- Credit note exists in DRAFT status
- User has commit permission
- Accounting period is open for transaction date

**Postconditions**:
- **Success**: Credit note status changed to COMMITTED, journal entries created, inventory updated (if applicable), vendor payable reduced
- **Failure**: Credit note remains DRAFT, user informed of commitment errors

**Main Flow**:
1. User navigates to draft credit note
2. System displays "Commit" button for draft credit note
3. User clicks "Commit" button
4. System performs pre-commitment validation:
   - Accounting period open
   - GL accounts configured
   - Vendor account active
   - Inventory locations valid (for quantity returns)
5. System generates journal entries:
   - **Primary Entries**:
     - DR: Accounts Payable (vendor credit)
     - CR: Inventory - Raw Materials (for quantity returns)
     - CR: Input VAT (tax adjustment)
   - **Inventory Entries** (if cost variance exists):
     - DR/CR: Cost Variance account
6. System generates stock movements (for quantity returns):
   - Negative quantities for returned items
   - Lot numbers and costs
   - Location adjustments
7. System posts journal entries to Finance module
8. System updates inventory balances via Inventory module
9. System reduces vendor payable balance
10. System changes status to COMMITTED
11. System assigns commitment date and commitment reference number
12. System sends commitment notification to relevant users
13. System logs commitment in audit trail
14. System displays success message with commitment reference
15. System locks credit note from further edits
16. Use case ends

**Alternative Flows**:

**Alt-10A: Commit with Different Date** (At step 3)
- 3a. User enters custom commitment date
- 3b. System validates date within open accounting period
- 3c. System uses custom commitment date for journal entries
- Continue to step 4

**Alt-10B: Review Before Commit** (At step 3)
- 3a. User clicks "Preview Commitment" button
- 3b. System displays commitment preview:
   - Journal entries to be created
   - Stock movements to be generated
   - Account balances to be updated
- 3c. User reviews and confirms commitment
- Continue to step 4

**Alt-10C: Batch Commit Multiple Credit Notes** (At step 1)
- 1a. User selects multiple draft credit notes from list
- 1b. User clicks "Commit Selected" button
- 1c. System commits all selected credit notes
- 1d. System displays summary of successful and failed commitments
- Use case ends

**Exception Flows**:

**Exc-10A: Accounting Period Closed** (At step 4)
- Accounting period is closed for credit note date
- System displays "Accounting period closed" error
- System suggests changing commitment date or reopening period
- User contacts finance team
- Use case ends

**Exc-10B: GL Account Not Configured** (At step 5)
- Required GL account not configured for commitment
- System displays "GL account configuration missing" error
- System identifies specific missing account
- User contacts administrator
- Use case ends

**Exc-10C: Inventory Update Failure** (At step 8)
- Inventory module fails to process stock movement
- System rolls back journal entries
- System displays "Inventory update failed" error
- Credit note remains in DRAFT status
- User investigates inventory issue
- Use case ends (resume after resolution)

**Exc-10D: Vendor Account Inactive** (At step 4)
- Vendor account is marked inactive or on hold
- System displays "Vendor account inactive" error
- User verifies vendor status
- Use case ends (resume after vendor reactivated)

**Business Rules**:
- **BR-CN-050**: Journal entries committed only when credit note status is COMMITTED
- **BR-CN-051**: Posting date must be within open accounting period
- **BR-CN-052**: All GL accounts must be configured before commitment
- **BR-CN-053**: Stock movements generated only for quantity-based credits
- **BR-CN-041**: Stock movements cannot be reversed after commitment
- **BR-CN-054**: Vendor payable reduced by credit total amount

**Includes**:
- [UC-CN-101: Generate Stock Movements](#uc-cn-101-generate-stock-movements)
- [UC-CN-102: Generate Journal Entries](#uc-cn-102-generate-journal-entries)
- [UC-CN-103: Calculate Tax Adjustments](#uc-cn-103-calculate-tax-adjustments)

**Related Requirements**:
- FR-CN-014: Credit Note Posting
- FR-CN-007: Journal Entry Generation
- FR-CN-009: Stock Movement Integration
- FR-CN-008: Tax Calculation
- NFR-CN-009: Posting completes within 5 seconds

**Notes**:
- Posting is irreversible; void credit note if correction needed
- System performs atomic transaction (all or nothing)
- Commitment generates audit trail with detailed log
- Email notifications sent to finance team and requester
- Committed credit notes appear in vendor statement immediately

---

### UC-CN-011: Void Credit Note

**Description**: Authorized user voids a committed credit note due to errors or disputes, generating reversing entries.

**Actor(s)**: Procurement Manager

**Priority**: Medium

**Frequency**: Monthly (1-3 times per month)

**Preconditions**:
- Credit note exists in COMMITTED status
- User has void permission (manager role)
- Accounting period is open

**Postconditions**:
- **Success**: Credit note status changed to VOID, reversing journal entries created, inventory reversed (if applicable)
- **Failure**: Credit note remains COMMITTED, user informed of void errors

**Main Flow**:
1. User navigates to committed credit note
2. System displays "Void" button (manager permission required)
3. User clicks "Void" button
4. System prompts for void reason (required):
   - Error in quantities or amounts
   - Vendor dispute
   - Duplicate credit note
   - Other (with explanation)
5. User enters void reason and comments
6. System displays void confirmation dialog with impact summary:
   - Journal entries to be reversed
   - Inventory movements to be reversed
   - Vendor payable adjustment
7. User confirms void operation
8. System performs void validation:
   - Accounting period open
   - No dependent transactions exist
9. System generates reversing journal entries:
   - Opposite of original posting entries
   - Same amounts with reversed debit/credit
10. System reverses stock movements (for quantity returns):
    - Opposite quantities
    - Same lot numbers and locations
11. System posts reversing entries to Finance module
12. System updates inventory balances
13. System restores vendor payable balance
14. System changes status to VOID
15. System assigns void date and void reference number
16. System sends void notification to relevant users
17. System logs void in audit trail with reason
18. System displays success message
19. Use case ends

**Alternative Flows**:

**Alt-14A: Void and Create Replacement** (At step 3)
- 3a. User selects "Void and Replace" option
- 3b. System voids current credit note
- 3c. System creates new draft credit note copying header data
- 3d. User corrects errors in new draft
- Continue to step 18

**Alt-14B: Partial Void** (Not supported)
- System does not support partial voids
- User must void entire credit note and create new one

**Exception Flows**:

**Exc-14A: Accounting Period Closed** (At step 8)
- Accounting period is closed for void date
- System displays "Cannot void - period closed" error
- User contacts finance to reopen period
- Use case ends

**Exc-14B: Dependent Transactions Exist** (At step 8)
- Credit note referenced in vendor payment or settlement
- System displays "Cannot void - dependent transactions exist" error
- System lists dependent transactions
- User must reverse dependent transactions first
- Use case ends

**Exc-14C: Inventory Reversal Failure** (At step 12)
- Inventory module cannot reverse stock movement
- System displays "Inventory reversal failed" error
- System rolls back all void operations
- User investigates inventory issue
- Use case ends

**Exc-14D: No Void Reason** (At step 5)
- User attempts to void without providing reason
- System displays "Void reason required" error
- User enters void reason
- Resume at step 5

**Business Rules**:
- **BR-CN-055**: Only COMMITTED credit notes can be voided
- **BR-CN-056**: Void reason is mandatory
- **BR-CN-057**: Void generates reversing journal entries with same amounts
- **BR-CN-058**: Stock movements reversed exactly (same lots, opposite quantities)
- **BR-CN-059**: Void date must be within open accounting period

**Related Requirements**:
- FR-CN-015: Credit Note Void Functionality
- FR-CN-016: Audit Trail
- NFR-CN-010: Void operation completes within 5 seconds

**Notes**:
- Void operation is irreversible
- Original credit note retained in system with VOID status
- Void reason appears in audit trail and reports
- New credit note required if correction needed after void
- Void notifications sent to finance and purchasing teams

---

## System Use Cases

### UC-CN-101: Generate Stock Movements

**Description**: System automatically generates negative stock movements for quantity-based credit notes when committed, reducing inventory balances for returned items.

**Actor(s)**: Inventory Management Module (System)

**Priority**: Critical

**Frequency**: Triggered by credit note posting (10-20 times per day)

**Preconditions**:
- Credit note type is QUANTITY_RETURN
- Credit note status changed to COMMITTED
- Inventory lots selected for all items
- Inventory locations configured

**Postconditions**:
- **Success**: Stock movements created, inventory balances updated, movements logged
- **Failure**: Posting rolled back, error logged

**Main Flow**:
1. System detects credit note posting trigger
2. System validates credit note type is QUANTITY_RETURN
3. For each credit note item with lot selection:
   - System retrieves lot number, quantity, and location
   - System calculates negative quantity (return reduces inventory)
   - System retrieves unit cost and extra costs from inventory cost calculation
4. System creates stock movement record for each item:
   - **Transaction type**: Credit Note Return
   - **Location type**: INV (Inventory) or CON (Consignment)
   - **Lot number**: From selected lots
   - **Quantity**: Negative value (e.g., -10 for 10 units returned)
   - **Unit cost**: From inventory cost calculation
   - **Extra cost**: Proportional allocation
   - **Movement date**: Credit note posting date
   - **Reference**: Credit note number
5. System posts stock movements to Inventory module
6. System updates inventory balances:
   - Reduces available quantity per lot
   - Updates inventory valuation
   - Maintains lot traceability
7. System updates inventory transaction history
8. System logs stock movement generation in audit trail
9. System returns success status to posting process
10. Use case ends

**Exception Flows**:

**Exc-101A: Lot Not Found** (At step 3)
- System cannot find specified inventory lot
- System logs error with lot number
- System rolls back posting
- System notifies user of missing lot
- Use case ends with failure

**Exc-101B: Insufficient Inventory Balance** (At step 6)
- Return quantity exceeds available lot balance
- System logs warning (allows negative balance in some configurations)
- System continues or fails based on inventory policy
- If configured to fail, system rolls back posting
- Use case ends

**Exc-101C: Location Not Found** (At step 4)
- Specified inventory location doesn't exist
- System logs error with location code
- System rolls back posting
- System notifies user
- Use case ends with failure

**Business Rules**:
- **BR-CN-040**: Stock movements reference specific inventory lots
- **BR-CN-041**: Stock movements only generated for quantity-based credits
- **BR-CN-042**: Movement quantities are negative (reduce inventory)
- **BR-CN-043**: Unit cost from inventory cost calculation, not current cost
- **BR-CN-044**: Stock movements cannot be manually edited
- **BR-CN-045**: Stock movements voided when credit note voided

**Related Requirements**:
- FR-CN-009: Stock Movement Generation
- FR-CN-005: Lot Tracking
- NFR-CN-011: Stock movement creation within 2 seconds

**Notes**:
- Stock movements create full audit trail for inventory adjustments
- inventory costing ensures accurate inventory valuation
- Negative quantities clearly indicate returns vs receipts
- Location type determines which inventory pool is adjusted
- System maintains lot traceability for regulatory compliance

---

### UC-CN-102: Generate Journal Entries

**Description**: System automatically generates GL journal entries when credit note is posted, debiting accounts payable and crediting inventory and tax accounts.

**Actor(s)**: Finance Module (System)

**Priority**: Critical

**Frequency**: Triggered by credit note posting (10-20 times per day)

**Preconditions**:
- Credit note status changed to COMMITTED
- GL account mapping configured
- Accounting period is open
- Vendor account exists

**Postconditions**:
- **Success**: Journal entries created, accounts updated, vendor payable reduced
- **Failure**: Posting rolled back, error logged

**Main Flow**:
1. System detects credit note posting trigger
2. System retrieves GL account configuration for:
   - Accounts Payable (2100)
   - Inventory - Raw Materials (1140)
   - Input VAT (1240)
   - Cost Variance (if applicable)
3. System creates **Primary Entry Group**:
   - **Entry 1**: Debit Accounts Payable
     - Account: 2100
     - Department: Purchasing (PUR)
     - Amount: Credit note total amount
     - Description: "CN Vendor Adjustment"
     - Reference: Credit note number
   - **Entry 2**: Credit Inventory (for quantity returns only)
     - Account: 1140
     - Department: Warehouse (WHS)
     - Amount: Net inventory value (quantity × inventory cost)
     - Description: "Inventory Value Adjustment"
     - Reference: GRN number
   - **Entry 3**: Credit Input VAT
     - Account: 1240
     - Department: Accounting (ACC)
     - Amount: Tax amount
     - Tax code: VAT with applicable rate
     - Description: "Tax Adjustment"
     - Reference: Credit note number
4. System creates **Inventory Entry Group** (if cost variance exists):
   - **Entry 4**: Debit/Credit Cost Variance
     - Account: Cost variance account
     - Department: Warehouse (WHS)
     - Amount: Cost variance (current cost - inventory cost) × quantity
     - Description: "Inventory Cost Variance"
     - Reference: Credit note number
5. System validates total debits equal total credits
6. System posts journal entries to Finance module
7. System updates vendor payable balance (reduces amount owed)
8. System updates account balances
9. System logs journal entry generation in audit trail
10. System returns success status to posting process
11. Use case ends

**Exception Flows**:

**Exc-102A: GL Account Not Configured** (At step 2)
- Required GL account not found in configuration
- System logs error with missing account type
- System rolls back posting
- System notifies user of configuration issue
- Use case ends with failure

**Exc-102B: Debit/Credit Imbalance** (At step 5)
- Total debits don't equal total credits
- System logs error with amounts
- System rolls back posting
- System notifies administrator
- Use case ends with failure

**Exc-102C: Vendor Account Not Found** (At step 7)
- Vendor GL account doesn't exist
- System logs error
- System rolls back posting
- Use case ends with failure

**Business Rules**:
- **BR-CN-050**: Journal entries posted only when credit note status is COMMITTED
- **BR-CN-051**: Posting date must be within open accounting period
- **BR-CN-052**: Total debits must equal total credits
- **BR-CN-053**: Entry order number determines posting sequence
- **BR-CN-054**: Vendor payable reduced by total credit amount
- **BR-CN-055**: Department codes determine cost center allocation

**Related Requirements**:
- FR-CN-007: Journal Entry Generation
- FR-CN-006: Inventory Costing Integration
- FR-CN-008: Tax Calculation
- NFR-CN-012: Journal entry posting within 3 seconds

**Notes**:
- Primary entries for main financial impact
- Inventory entries for cost variances
- All entries include department for cost center reporting
- Tax entries reference tax codes for VAT reporting
- Journal voucher number assigned for traceability
- Reversing entries generated when credit note voided

---

### UC-CN-103: Calculate Tax Adjustments

**Description**: System automatically calculates input VAT adjustments when credit note is created or modified, reducing tax liability by credit amount.

**Actor(s)**: Tax Module (System)

**Priority**: Critical

**Frequency**: Triggered by credit note save/update (15-25 times per day)

**Preconditions**:
- Credit note has items with amounts
- Tax rates configured in system
- Vendor tax information available
- Tax invoice reference provided

**Postconditions**:
- **Success**: Tax amounts calculated, input VAT adjusted, tax entries created
- **Failure**: Tax calculation error logged, user notified

**Main Flow**:
1. System detects credit note save/update trigger
2. System retrieves vendor tax registration details:
   - Vendor tax ID
   - Tax status (VAT registered or not)
3. System retrieves applicable tax rate for credit note date
4. For each credit note item:
   - System retrieves base amount (quantity × unit price - discount)
   - System applies tax rate (typically 18%)
   - System calculates tax amount
5. System aggregates tax calculations:
   - Total base amount across all items
   - Total tax amount
   - Tax-inclusive total
6. System creates tax entry record:
   - **Document info**:
     - Credit note number
     - Tax invoice reference
     - Document date
     - Vendor name and tax ID
   - **Calculations**:
     - Base amount
     - Tax rate (18%)
     - Tax amount
     - Original invoice base and tax (for reference)
   - **Adjustments**:
     - Type: Input VAT
     - Code: VAT18 (or applicable rate code)
     - Account: 1240 (Input VAT account)
     - Reporting code: BOX4 (for VAT return)
7. System determines VAT period:
   - Period based on document date
   - VAT return status (open/closed)
   - Due date for return
8. System validates tax calculations
9. System stores tax entries with credit note
10. System updates credit note totals
11. System logs tax calculation in audit trail
12. Use case ends

**Exception Flows**:

**Exc-103A: Tax Rate Not Found** (At step 3)
- No tax rate configured for credit note date
- System logs error
- System uses default tax rate or prompts user
- Resume at step 4 or end with failure

**Exc-103B: Vendor Not VAT Registered** (At step 2)
- Vendor tax status is non-VAT
- System sets tax amount to zero
- System logs non-VAT transaction
- Continue to step 5 with zero tax

**Exc-103C: VAT Period Closed** (At step 7)
- VAT return period already closed for credit note date
- System displays warning (doesn't block save)
- System flags for manual review
- Continue to step 8

**Exc-103D: Tax Calculation Error** (At step 8)
- Rounding errors or calculation inconsistency
- System logs error details
- System notifies administrator
- Use case ends with failure

**Business Rules**:
- **BR-CN-032**: Tax calculated at rate applicable on document date
- **BR-CN-033**: Tax amount rounded to 2 decimal places
- **BR-CN-034**: Input VAT adjustment reduces tax liability
- **BR-CN-035**: Tax invoice reference required for VAT credit
- **BR-CN-036**: VAT period determined by document date
- **BR-CN-037**: Tax entries included in VAT return reporting

**Related Requirements**:
- FR-CN-008: Tax Calculation and Adjustment
- FR-CN-007: Financial Integration
- NFR-CN-013: Tax calculation completes within 1 second

**Notes**:
- Tax rate typically 18% but configurable per jurisdiction
- Input VAT credit reduces company tax liability
- Tax adjustments flow to VAT return (Box 4)
- System handles multiple tax rates if items have different rates
- Zero-rated and exempt items supported
- Tax calculations audit-logged for compliance

---

### UC-CN-104: Process Credit Note for Consumed Items

**Description**: System processes credit note for items that have already been consumed or used, adjusting only cost of goods sold without affecting inventory balances.

**Actor(s)**: Finance Module, Inventory Module (System)

**Priority**: Critical

**Frequency**: Triggered when credit note processed for consumed inventory (5-10 times per week)

**Preconditions**:
- Credit note type is QUANTITY_RETURN
- Items referenced in credit note have been fully consumed or used
- No available inventory balance exists for returned items
- Credit note status is being changed to COMMITTED

**Postconditions**:
- **Success**: COGS adjusted, vendor payable reduced, no stock movements generated
- **Failure**: Posting rolled back, error logged

**Main Flow**:
1. System detects credit note posting trigger for quantity return
2. System checks inventory availability status for each credit note item:
   - Queries inventory module for current lot balances
   - Identifies items with zero available quantity (fully consumed)
3. For items already consumed:
   - System determines no stock movement is required
   - System calculates COGS adjustment based on original receipt cost
   - System retrieves original GRN cost and tax information
4. System generates journal entries:
   - **Entry 1**: Debit Accounts Payable
     - Account: 2100
     - Amount: Credit note total amount
     - Description: "CN Vendor Adjustment - Consumed Items"
   - **Entry 2**: Credit Cost of Goods Sold
     - Account: 5000 (COGS account)
     - Amount: Net inventory value at original cost
     - Description: "COGS Adjustment - Items Consumed"
   - **Entry 3**: Credit Input VAT
     - Account: 1240
     - Amount: Tax amount
     - Description: "Tax Adjustment"
5. System validates no inventory balance impact required
6. System posts journal entries to Finance module
7. System updates vendor payable balance
8. System logs transaction in audit trail with note "Items already consumed"
9. System returns success status to posting process
10. Use case ends

**Alternative Flows**:

**Alt-104A: Partial Consumption with Zero Available** (At step 2)
- 2a. Some items consumed, others with available stock
- 2b. System processes consumed items using this use case
- 2c. System processes available items using UC-CN-101
- 2d. System generates combined journal entries
- Continue to step 6

**Exception Flows**:

**Exc-104A: Original Cost Data Not Found** (At step 3)
- System cannot retrieve original GRN cost data
- System logs error with GRN reference
- System rolls back posting
- System notifies user of missing cost data
- Use case ends with failure

**Exc-104B: COGS Account Not Configured** (At step 4)
- COGS GL account not configured for product category
- System logs error with missing account type
- System rolls back posting
- System notifies administrator
- Use case ends with failure

**Business Rules**:
- **BR-CN-070**: Items already consumed require COGS adjustment only
- **BR-CN-071**: No stock movements generated for consumed items
- **BR-CN-072**: Original receipt cost used for COGS calculation
- **BR-CN-073**: Vendor payable reduced regardless of consumption status
- **BR-CN-074**: System logs consumption status in audit trail

**Related Requirements**:
- FR-CN-020: Inventory Consumption Status Handling
- FR-CN-021: COGS Adjustment for Consumed Items
- FR-CN-007: Journal Entry Generation

**Notes**:
- This scenario common for perishable goods or consumed raw materials
- No physical stock return possible for consumed items
- Financial impact on COGS instead of inventory valuation
- Important for restaurants, food service, manufacturing operations
- System maintains full audit trail of consumption-based adjustments

---

### UC-CN-105: Process Credit Note with Partial Availability

**Description**: System processes credit note when some quantity is available in inventory while remaining quantity has been consumed, splitting the processing between stock movement and COGS adjustment.

**Actor(s)**: Finance Module, Inventory Module (System)

**Priority**: Critical

**Frequency**: Triggered when credit note processed with mixed availability (3-8 times per week)

**Preconditions**:
- Credit note type is QUANTITY_RETURN
- Return quantity exceeds available inventory quantity for one or more items
- Some inventory balance exists but less than return quantity
- Credit note status is being changed to COMMITTED

**Postconditions**:
- **Success**: Stock movements generated for available quantity, COGS adjusted for consumed quantity, vendor payable reduced for total amount
- **Failure**: Posting rolled back, error logged

**Main Flow**:
1. System detects credit note posting trigger for quantity return
2. System checks inventory availability for each credit note item:
   - Queries current lot balances across all locations
   - Calculates total available quantity per item
   - Compares return quantity to available quantity
3. For items with partial availability, system identifies split quantities:
   - Available quantity = quantity that can be returned to stock
   - Consumed quantity = return quantity - available quantity
4. **Process Available Quantity** (using UC-CN-101 logic):
   - System creates negative stock movements for available quantity
   - System reduces inventory balance
   - System generates inventory GL entries:
     - CR: 1140 - Inventory (available quantity × inventory cost)
5. **Process Consumed Quantity** (using UC-CN-104 logic):
   - System calculates COGS adjustment for consumed quantity
   - System generates COGS GL entries:
     - CR: 5000 - COGS (consumed quantity × original cost)
6. System creates **Combined Journal Entry Group**:
   - **Entry 1**: Debit Accounts Payable
     - Account: 2100
     - Amount: Total credit note amount (all quantities)
     - Description: "CN Vendor Adjustment - Partial Availability"
   - **Entry 2**: Credit Inventory
     - Account: 1140
     - Amount: Available quantity × inventory cost
     - Description: "Inventory Value Adjustment - Available Stock"
   - **Entry 3**: Credit COGS
     - Account: 5000
     - Amount: Consumed quantity × original cost
     - Description: "COGS Adjustment - Consumed Stock"
   - **Entry 4**: Credit Input VAT
     - Account: 1240
     - Amount: Tax amount on total return
     - Description: "Tax Adjustment"
7. System posts combined journal entries to Finance module
8. System updates inventory balances for available portion
9. System updates vendor payable balance for total amount
10. System logs split processing details in audit trail:
    - Available quantity and stock movement references
    - Consumed quantity and COGS adjustment amount
    - Split calculation methodology
11. System returns success status to posting process
12. Use case ends

**Alternative Flows**:

**Alt-105A: Multiple Items with Different Split Ratios** (At step 3)
- 3a. Different items have different available/consumed ratios
- 3b. System calculates split quantities independently per item
- 3c. System processes each item according to its availability status
- 3d. System aggregates all entries into single journal voucher
- Continue to step 6

**Alt-105B: Location-Specific Availability** (At step 2)
- 2a. Available quantity exists but in different location than original receipt
- 2b. System identifies available lots across all locations
- 2c. System creates stock movements for available locations
- 2d. System processes location transfers if needed
- Continue to step 4

**Exception Flows**:

**Exc-105A: Availability Calculation Error** (At step 2)
- System cannot accurately calculate available quantity
- System logs error with inventory lot details
- System rolls back posting
- System notifies administrator to verify inventory balances
- Use case ends with failure

**Exc-105B: Split Quantity Below Minimum Threshold** (At step 3)
- Available quantity less than minimum handling unit
- System displays warning about impractical split
- System suggests user verify return quantity
- User can override or cancel posting
- Resume at step 4 (override) or end use case (cancel)

**Exc-105C: GL Entry Imbalance** (At step 6)
- Debit/credit totals don't balance due to split calculation
- System logs error with detailed calculation breakdown
- System rolls back posting
- System notifies administrator
- Use case ends with failure

**Business Rules**:
- **BR-CN-075**: System automatically detects partial availability
- **BR-CN-076**: Split processing mandatory when return quantity > available quantity
- **BR-CN-077**: Stock movements only for available portion
- **BR-CN-078**: COGS adjustment only for consumed portion
- **BR-CN-079**: Total vendor payable adjustment includes both portions
- **BR-CN-080**: Split calculations logged in detail for audit

**Related Requirements**:
- FR-CN-022: Partial Availability Detection
- FR-CN-023: Split Processing Logic
- FR-CN-024: Combined Journal Entry Generation
- NFR-CN-014: Split calculation completes within 3 seconds

**Notes**:
- Common scenario in food service and manufacturing
- Requires accurate real-time inventory tracking
- Split methodology critical for accurate financial reporting
- System provides detailed breakdown in credit note detail view
- Users can see available vs consumed quantities in cost analysis tab
- Important for gross margin accuracy and inventory valuation

---

### UC-CN-106: Process Retrospective Vendor Discount

**Description**: System processes credit note for vendor-provided discount that applies retrospectively to previous purchases across multiple GRNs, allocating discount proportionally to historical receipts.

**Actor(s)**: Finance Module, Procurement Module (System)

**Priority**: High

**Frequency**: Triggered when retrospective discount credit note posted (2-5 times per month)

**Preconditions**:
- Credit note type is AMOUNT_DISCOUNT
- Credit note references multiple historical GRNs or purchase orders
- Vendor has agreed to retrospective discount (volume rebate, promotional discount, etc.)
- Discount amount and allocation method specified
- Credit note status is being changed to COMMITTED

**Postconditions**:
- **Success**: Discount allocated across historical purchases, vendor payable reduced, allocation history logged
- **Failure**: Posting rolled back, error logged

**Main Flow**:
1. System detects credit note posting trigger for amount discount
2. System identifies this is a retrospective discount scenario:
   - Credit note references multiple historical GRNs
   - Discount reason indicates retrospective application
   - Date range specified for applicable purchases
3. System retrieves all applicable historical purchases:
   - Queries GRN records within specified date range
   - Filters by vendor and product categories (if specified)
   - Retrieves original purchase amounts and quantities
4. System calculates discount allocation based on specified method:
   - **Proportional by Amount**: Discount allocated based on percentage of total purchase value
     - Example: Purchase A = $10,000 (50%), Purchase B = $10,000 (50%), $1,000 discount
     - Allocation: Purchase A = $500, Purchase B = $500
   - **Proportional by Quantity**: Discount allocated based on quantity purchased
   - **Equal Distribution**: Discount divided equally across all purchases
   - **Custom Allocation**: User-specified allocation percentages
5. System creates discount allocation records:
   - For each historical GRN:
     - GRN reference number
     - Original purchase amount
     - Allocated discount amount
     - Allocation percentage
     - Calculation method used
6. System generates journal entries:
   - **Entry 1**: Debit Accounts Payable
     - Account: 2100
     - Amount: Total discount amount
     - Description: "CN Vendor Discount - Retrospective"
     - Reference: Credit note number
   - **Entry 2**: Credit Purchase Discount/Rebate
     - Account: 5100 (Purchase Discount account)
     - Amount: Total discount amount
     - Description: "Retrospective Vendor Discount"
     - Breakdown: Sub-entries per historical GRN
   - **Entry 3**: Credit Input VAT (if applicable)
     - Account: 1240
     - Amount: Tax adjustment on discount
     - Description: "Tax Adjustment - Retrospective Discount"
7. System updates vendor payable balance (reduces amount owed)
8. System creates discount allocation summary report:
   - Date range of applicable purchases
   - List of GRNs with allocated amounts
   - Total discount amount
   - Allocation methodology
   - Approval and authorization details
9. System links allocation records to original GRN records for traceability
10. System logs retrospective discount processing in audit trail:
    - All GRNs affected
    - Allocation calculations
    - Discount terms and conditions
11. System returns success status to posting process
12. Use case ends

**Alternative Flows**:

**Alt-106A: Product Category-Specific Discount** (At step 3)
- 3a. Discount applies only to specific product categories
- 3b. System filters GRNs by product category codes
- 3c. System calculates allocation only for matching products
- 3d. System excludes non-matching purchases from allocation
- Continue to step 4

**Alt-106B: Tiered Volume Discount** (At step 4)
- 4a. Discount amount varies by volume tiers reached
- 4b. System calculates tier-based discount amounts
- 4c. System allocates higher discount rates to qualifying tiers
- 4d. System documents tier calculations in allocation records
- Continue to step 5

**Alt-106C: Multiple Vendor Agreements** (At step 2)
- 2a. Credit note covers multiple discount agreements
- 2b. System separates discount by agreement type
- 2c. System processes each agreement allocation independently
- 2d. System combines all allocations in single journal entry
- Continue to step 5

**Exception Flows**:

**Exc-106A: No Qualifying Purchases Found** (At step 3)
- System finds no GRNs matching specified criteria
- System displays "No applicable purchases found" error
- System provides date range and filter criteria used
- User verifies discount terms or adjusts date range
- Use case ends with failure

**Exc-106B: Allocation Total Mismatch** (At step 5)
- Sum of allocated amounts doesn't equal total discount
- System logs error with calculation details
- System identifies rounding differences or allocation errors
- If difference < $0.01 (rounding): System adjusts and continues
- If difference >= $0.01: System rolls back and notifies user
- Resume at step 4 (adjust) or end with failure

**Exc-106C: Historical GRN Already Credited** (At step 3)
- One or more GRNs already have credit notes applied
- System displays warning about potential duplicate credits
- System provides option to exclude previously credited GRNs
- User verifies and confirms inclusion/exclusion
- Resume at step 3 or end use case

**Exc-106D: Purchase Discount Account Not Configured** (At step 6)
- GL account for purchase discounts not configured
- System logs error with missing account type
- System rolls back posting
- System notifies administrator
- Use case ends with failure

**Business Rules**:
- **BR-CN-081**: Retrospective discounts must reference historical date range
- **BR-CN-082**: Allocation method must be specified and documented
- **BR-CN-083**: Total allocated amount must equal total discount
- **BR-CN-084**: Allocation records linked to original GRNs for audit trail
- **BR-CN-085**: Discount allocation cannot exceed original purchase amount per GRN
- **BR-CN-086**: Tax adjustments follow same allocation as base discount
- **BR-CN-087**: System supports multiple allocation methods

**Related Requirements**:
- FR-CN-025: Retrospective Discount Processing
- FR-CN-026: Discount Allocation Logic
- FR-CN-027: Historical GRN Linking
- FR-CN-028: Allocation Reporting
- NFR-CN-015: Allocation calculation completes within 5 seconds for 100 GRNs

**Notes**:
- Common for volume rebates, promotional allowances, year-end bonuses
- Critical for accurate cost of goods sold reporting
- Allocation methodology should match vendor agreement terms
- System maintains full traceability from discount to original purchases
- Allocation summary accessible in credit note detail view
- Important for procurement performance metrics and vendor relationship management
- Some jurisdictions require specific documentation for retrospective discounts
- System can generate vendor discount analysis reports showing all allocations

---

## Backend System Use Cases

The following use cases describe the server-side operations implemented as Next.js Server Actions. These backend use cases correspond to the Backend Requirements (BR-BE-001 through BR-BE-014) defined in the Business Requirements document.

### UC-CN-201: Execute Credit Note CRUD Server Actions

**Description**: Server action layer executes Create, Read, Update, and Delete operations for credit notes with atomic database transactions and proper validation.

**Actor(s)**: Server Action Layer (System)

**Priority**: Critical

**Frequency**: Continuous (every credit note operation)

**Related Backend Requirements**: BR-BE-001 (CRUD Operations)

**Preconditions**:
- Next.js server action context established
- Database connection available
- User authenticated and authorized

**Postconditions**:
- **Success**: Credit note created/read/updated/deleted successfully, response returned
- **Failure**: Transaction rolled back, error response returned

**Main Flow**:
1. Server action receives request with credit note data
2. System validates request payload structure
3. System begins database transaction with Serializable isolation level
4. System acquires pessimistic lock on affected records (for update/delete)
5. System performs operation:
   - **Create**: Generates CN number, inserts credit note and items
   - **Read**: Retrieves credit note with related data
   - **Update**: Updates credit note fields, recalculates totals
   - **Delete**: Soft deletes credit note (DRAFT only)
6. System commits transaction
7. System logs operation in audit trail
8. System returns response with credit note data
9. Use case ends

**Exception Flows**:

**Exc-201A: Validation Failure** (At step 2)
- Request payload fails schema validation
- System returns validation error response
- Use case ends with failure

**Exc-201B: Concurrent Modification** (At step 4)
- Another transaction holds lock on record
- System waits for lock timeout (5 seconds)
- If timeout: returns concurrent modification error
- If lock released: continues operation

**Exc-201C: Transaction Failure** (At step 5)
- Database operation fails
- System rolls back transaction
- System logs error details
- System returns error response

**Business Rules**:
- **BR-BE-001**: All CRUD operations use atomic database transactions
- **BR-BE-001**: Serializable isolation level for data consistency
- **BR-BE-001**: Pessimistic locking prevents concurrent modification

---

### UC-CN-202: Fetch Vendor and GRN Data

**Description**: Server action fetches vendor list for credit note creation and retrieves GRN data for a selected vendor with available inventory lots.

**Actor(s)**: Server Action Layer (System)

**Priority**: Critical

**Frequency**: Every credit note creation (15-25 times per day)

**Related Backend Requirements**: BR-BE-002 (Vendor and GRN Fetch)

**Preconditions**:
- User authenticated with purchasing permissions
- Vendor and GRN data exists in database

**Postconditions**:
- **Success**: Vendor list or GRN data returned with inventory lots
- **Failure**: Error response with message

**Main Flow**:
1. Server action receives fetch request (vendor list or GRN data)
2. For vendor list:
   - System queries active vendors with credit note permissions
   - System returns paginated vendor list
3. For GRN data:
   - System validates vendor ID
   - System queries posted GRNs for vendor
   - System joins with inventory lots table
   - System calculates available quantities per lot
   - System returns GRN items with lot details
4. System caches results for performance (5-minute TTL)
5. Use case ends

**Alternative Flows**:

**Alt-202A: Filter GRNs by Date Range** (At step 3)
- Request includes date range filter
- System applies date filter to GRN query
- System returns filtered results

**Exception Flows**:

**Exc-202A: Vendor Not Found** (At step 3)
- Specified vendor ID doesn't exist
- System returns "Vendor not found" error
- Use case ends with failure

**Business Rules**:
- **BR-BE-002**: Only active vendors returned in list
- **BR-BE-002**: Only posted GRNs available for credit note creation
- **BR-BE-002**: Available quantities calculated in real-time

---

### UC-CN-203: Execute Commitment Transaction

**Description**: Server action executes the credit note commitment as a single atomic transaction, generating journal entries, stock movements, and updating vendor balance.

**Actor(s)**: Server Action Layer (System)

**Priority**: Critical

**Frequency**: Every credit note commitment (10-20 times per day)

**Related Backend Requirements**: BR-BE-003 (Commitment Transaction)

**Preconditions**:
- Credit note exists with DRAFT status
- Accounting period open for document date
- GL accounts configured
- User has commit permission

**Postconditions**:
- **Success**: Credit note committed, all related records created
- **Failure**: Transaction rolled back, credit note remains DRAFT

**Main Flow**:
1. Server action receives commitment request with credit note ID
2. System begins transaction with Serializable isolation level
3. System acquires exclusive lock on credit note record
4. System validates pre-commitment conditions:
   - Credit note status is DRAFT
   - Accounting period is open
   - All GL accounts configured
   - Vendor account active
5. System calls inventory cost calculation service (UC-CN-205)
6. System calls journal entry generator (UC-CN-207)
7. For QUANTITY_RETURN type:
   - System calls stock movement generator (UC-CN-208)
   - System updates inventory balances
8. System calls vendor balance update (UC-CN-212)
9. System updates credit note status to COMMITTED
10. System assigns commitment date and reference
11. System calls audit logging service (UC-CN-210)
12. System commits transaction
13. System triggers post-commit notifications
14. System returns success response with commitment reference
15. Use case ends

**Exception Flows**:

**Exc-203A: Pre-commitment Validation Failure** (At step 4)
- One or more validation checks fail
- System rolls back transaction
- System returns specific validation error
- Use case ends with failure

**Exc-203B: Journal Entry Generation Failure** (At step 6)
- GL account not found or calculation error
- System rolls back entire transaction
- System returns error with details
- Use case ends with failure

**Exc-203C: Stock Movement Failure** (At step 7)
- Inventory lot not found or insufficient quantity
- System rolls back entire transaction
- System returns error with lot details
- Use case ends with failure

**Business Rules**:
- **BR-BE-003**: Commitment is atomic (all-or-nothing)
- **BR-BE-003**: Uses Serializable isolation level
- **BR-BE-003**: Exclusive lock prevents concurrent commits
- **BR-BE-003**: All sub-operations must succeed for commit

---

### UC-CN-204: Execute Void Transaction

**Description**: Server action executes the credit note void operation, generating reversing journal entries and restoring inventory balances.

**Actor(s)**: Server Action Layer (System)

**Priority**: Critical

**Frequency**: Monthly (1-3 times per month)

**Related Backend Requirements**: BR-BE-004 (Void Transaction)

**Preconditions**:
- Credit note exists with COMMITTED status
- Accounting period open for void date
- User has void permission (manager role)
- No dependent transactions exist

**Postconditions**:
- **Success**: Credit note voided, reversing entries created
- **Failure**: Transaction rolled back, credit note remains COMMITTED

**Main Flow**:
1. Server action receives void request with credit note ID and reason
2. System begins transaction with Serializable isolation level
3. System acquires exclusive lock on credit note record
4. System validates pre-void conditions:
   - Credit note status is COMMITTED
   - Void reason provided
   - Accounting period open
   - No dependent transactions
5. System retrieves original journal entries
6. System generates reversing journal entries:
   - Same amounts with reversed debit/credit
   - Void reference in description
7. For QUANTITY_RETURN type:
   - System generates reversing stock movements
   - System restores inventory balances
8. System restores vendor payable balance
9. System updates credit note status to VOID
10. System assigns void date and void reference
11. System calls audit logging with void reason
12. System commits transaction
13. System triggers void notifications
14. System returns success response
15. Use case ends

**Exception Flows**:

**Exc-204A: Dependent Transactions Exist** (At step 4)
- Credit note referenced in payment or settlement
- System returns error with dependent transaction list
- Use case ends with failure

**Exc-204B: Inventory Reversal Failure** (At step 7)
- Cannot reverse stock movement (lot modified)
- System rolls back entire transaction
- System returns error with details
- Use case ends with failure

**Business Rules**:
- **BR-BE-004**: Void is atomic (all-or-nothing)
- **BR-BE-004**: Reversing entries exactly mirror original
- **BR-BE-004**: Void reason required and logged
- **BR-BE-004**: Manager permission required

---

### UC-CN-205: Calculate Inventory Costs

**Description**: Server action calculates inventory costs using system-configured costing method (FIFO or Periodic Average) for credit note items based on selected inventory lots or period data.

**Actor(s)**: Server Action Layer (System)

**Priority**: Critical

**Frequency**: Every quantity-based credit note (15-25 times per day)

**Related Backend Requirements**: BR-BE-005 (Inventory Cost Calculation)

**Preconditions**:
- Credit note items with lot selections
- Inventory lot cost data available
- Return quantities specified

**Postconditions**:
- **Success**: inventory costs calculated, cost variance determined
- **Failure**: Error returned with missing data details

**Main Flow**:
1. Server action receives calculation request with lot selections
2. For each credit note item:
   - System retrieves selected lots with receive dates
   - System sorts lots by receive date (oldest first)
   - System retrieves original costs per lot
3. System calculates weighted average cost:
   - Sum of (lot quantity × lot cost) / total quantity
4. System calculates cost variance:
   - Current cost - calculated cost
5. System calculates financial impact:
   - Return amount = quantity × current cost
   - COGS = quantity × calculated cost
   - Realized gain/loss = return amount - COGS
6. System returns inventory cost calculation result:
   - Weighted average cost
   - Current unit cost
   - Cost variance
   - Total realized gain/loss
   - Applied lot details
7. Use case ends

**Alternative Flows**:

**Alt-205A: Partial Lot Availability** (At step 2)
- Some items have consumed inventory
- System splits calculation between available and consumed
- System returns split calculation results

**Exception Flows**:

**Exc-205A: Lot Cost Data Missing** (At step 2)
- Original cost data not found for lot
- System logs error with lot reference
- System returns error with missing data details
- Use case ends with failure

**Business Rules**:
- **BR-BE-005**: system-configured costing method mandatory for quantity returns
- **BR-BE-005**: Oldest lots used first for cost calculation
- **BR-BE-005**: Cost variance impacts gross margin

---

### UC-CN-206: Calculate Tax Amounts

**Description**: Server action calculates input VAT adjustments for credit note amounts based on applicable tax rates.

**Actor(s)**: Server Action Layer (System)

**Priority**: Critical

**Frequency**: Every credit note save (15-25 times per day)

**Related Backend Requirements**: BR-BE-006 (Tax Calculation)

**Preconditions**:
- Credit note with items and amounts
- Tax rates configured for document date
- Vendor tax registration available

**Postconditions**:
- **Success**: Tax amounts calculated, VAT adjustments determined
- **Failure**: Error returned with missing configuration

**Main Flow**:
1. Server action receives tax calculation request
2. System retrieves vendor tax registration status
3. System retrieves applicable tax rate for document date
4. For each credit note item:
   - System calculates base amount (quantity × price - discount)
   - System applies tax rate
   - System calculates tax amount
5. System aggregates tax calculations:
   - Total base amount
   - Total tax amount
   - Tax-inclusive total
6. System determines VAT period for reporting
7. System returns tax calculation result:
   - Tax rate applied
   - Base amount
   - Tax amount
   - Total amount
   - VAT period
   - Reporting codes
8. Use case ends

**Exception Flows**:

**Exc-206A: Tax Rate Not Configured** (At step 3)
- No tax rate for document date
- System uses default rate or returns warning
- Continue with default or end with failure

**Business Rules**:
- **BR-BE-006**: Tax rate from document date
- **BR-BE-006**: Input VAT adjusts tax liability
- **BR-BE-006**: Tax amounts rounded to 2 decimals

---

### UC-CN-207: Generate Journal Entries

**Description**: Server action generates GL journal entries for credit note commitment, including primary entries and inventory variance entries.

**Actor(s)**: Server Action Layer (System)

**Priority**: Critical

**Frequency**: Every credit note commitment (10-20 times per day)

**Related Backend Requirements**: BR-BE-007 (Journal Entry Generator)

**Shared Method Reference**: Uses Transaction Recording Service patterns from [SM-inventory-operations.md#3.2](../../shared-methods/inventory-operations/SM-inventory-operations.md) for consistent transaction recording.

**Preconditions**:
- Credit note data with calculated amounts
- GL account mapping configured
- inventory cost calculations completed

**Postconditions**:
- **Success**: Journal entries generated with balanced debits/credits
- **Failure**: Error returned with configuration issues

**Main Flow**:
1. Server action receives journal entry request
2. System retrieves GL account configuration:
   - Accounts Payable (2100)
   - Inventory - Raw Materials (1140)
   - Input VAT (1240)
   - Cost Variance (5200)
3. System generates Primary Entry Group:
   - Entry 1: DR Accounts Payable (total amount)
   - Entry 2: CR Inventory (for quantity returns)
   - Entry 3: CR Input VAT (tax amount)
4. System generates Inventory Entry Group:
   - Entry 4: DR/CR Cost Variance (if variance exists)
5. System validates debit/credit balance
6. System assigns journal voucher number
7. System returns journal entries:
   - Entry ID and sequence
   - Account codes and descriptions
   - Debit/credit amounts
   - Department codes
   - References
8. Use case ends

**Exception Flows**:

**Exc-207A: GL Account Not Configured** (At step 2)
- Required account not found
- System returns error with missing account type
- Use case ends with failure

**Exc-207B: Debit/Credit Imbalance** (At step 5)
- Totals don't balance
- System returns error with amounts
- Use case ends with failure

**Business Rules**:
- **BR-BE-007**: Debits must equal credits
- **BR-BE-007**: Department codes required
- **BR-BE-007**: Journal voucher number unique

---

### UC-CN-208: Generate Stock Movements

**Description**: Server action generates negative stock movements for quantity-based credit notes, reducing inventory balances by lot.

**Actor(s)**: Server Action Layer (System)

**Priority**: Critical

**Frequency**: Every quantity return commitment (10-20 times per day)

**Related Backend Requirements**: BR-BE-008 (Stock Movement Generator)

**Shared Method Reference**: Uses Transaction Recording Service from [SM-inventory-operations.md#3.2](../../shared-methods/inventory-operations/SM-inventory-operations.md) for stock movement recording, and Inventory Valuation Service from [SM-inventory-valuation.md](../../shared-methods/inventory-valuation/SM-inventory-valuation.md) for inventory cost calculation.

**Preconditions**:
- Credit note type is QUANTITY_RETURN
- Inventory lots selected with quantities
- Locations configured

**Postconditions**:
- **Success**: Stock movements generated, inventory updated
- **Failure**: Error returned with lot/location issues

**Main Flow**:
1. Server action receives stock movement request
2. For each credit note item with lot selection:
   - System retrieves lot number and location
   - System calculates negative quantity (return)
   - System retrieves unit cost from inventory costing calculation
3. System creates stock movement records:
   - Transaction type: Credit Note Return
   - Location type: INV or CON
   - Lot number from selection
   - Quantity (negative value)
   - Unit cost from inventory costing
   - Movement date from credit note
   - Reference: credit note number
4. System validates inventory balance (allows negative per policy)
5. System updates inventory balances per lot
6. System returns stock movements:
   - Movement ID
   - Lot and location
   - Quantity and cost
   - Reference
7. Use case ends

**Exception Flows**:

**Exc-208A: Lot Not Found** (At step 2)
- Specified lot doesn't exist
- System returns error with lot reference
- Use case ends with failure

**Exc-208B: Location Not Found** (At step 3)
- Specified location doesn't exist
- System returns error with location code
- Use case ends with failure

**Business Rules**:
- **BR-BE-008**: Negative quantities for returns
- **BR-BE-008**: inventory costs from calculation
- **BR-BE-008**: Lot traceability maintained

---

### UC-CN-209: Manage Attachments

**Description**: Server action manages file attachments for credit notes, including upload, download, and deletion with secure storage.

**Actor(s)**: Server Action Layer (System)

**Priority**: High

**Frequency**: As needed (5-10 times per week)

**Related Backend Requirements**: BR-BE-009 (Attachment Management)

**Preconditions**:
- Credit note exists
- User has attachment permissions
- Storage service available

**Postconditions**:
- **Success**: Attachment uploaded/deleted, reference stored
- **Failure**: Error returned with storage issues

**Main Flow**:
1. Server action receives attachment operation request
2. For upload:
   - System validates file type (PDF, JPG, PNG, XLSX, DOCX)
   - System validates file size (max 10MB)
   - System generates unique storage key
   - System uploads to secure cloud storage
   - System creates attachment record with metadata
3. For download:
   - System retrieves attachment record
   - System generates signed URL (1-hour expiry)
   - System returns download URL
4. For delete:
   - System retrieves attachment record
   - System removes from cloud storage
   - System soft-deletes attachment record
   - System logs deletion in audit trail
5. System returns operation result
6. Use case ends

**Exception Flows**:

**Exc-209A: File Too Large** (At step 2)
- File exceeds 10MB limit
- System returns size limit error
- Use case ends with failure

**Exc-209B: Invalid File Type** (At step 2)
- File type not allowed
- System returns file type error
- Use case ends with failure

**Business Rules**:
- **BR-BE-009**: Max 10MB per file
- **BR-BE-009**: Allowed types: PDF, JPG, PNG, XLSX, DOCX
- **BR-BE-009**: Secure cloud storage
- **BR-BE-009**: Deletion logged in audit

---

### UC-CN-210: Log Audit Events

**Description**: Server action logs all credit note operations to immutable audit trail with user, timestamp, and change details.

**Actor(s)**: Server Action Layer (System)

**Priority**: Critical

**Frequency**: Every credit note operation

**Related Backend Requirements**: BR-BE-010 (Audit Logging)

**Shared Method Reference**: Uses Audit Trail Service from [SM-inventory-operations.md#3.7](../../shared-methods/inventory-operations/SM-inventory-operations.md) for immutable audit logging with standardized event structure.

**Preconditions**:
- Operation context available
- User identity established
- Audit service available

**Postconditions**:
- **Success**: Audit event logged with full context
- **Failure**: Logged to fallback, error flagged

**Main Flow**:
1. Server action receives audit log request with:
   - Credit note ID
   - Operation type (CREATE, UPDATE, COMMIT, VOID)
   - User ID and session
   - Changed fields with before/after values
2. System creates immutable audit record:
   - Timestamp (UTC)
   - Credit note reference
   - User identity
   - Operation type
   - Change details (JSON)
   - IP address and user agent
   - Session ID
3. System appends to audit log (append-only)
4. System indexes for search
5. System returns audit entry ID
6. Use case ends

**Exception Flows**:

**Exc-210A: Audit Service Unavailable** (At step 3)
- Primary audit service down
- System logs to fallback storage
- System flags for reconciliation
- Continue operation (audit critical but non-blocking)

**Business Rules**:
- **BR-BE-010**: Audit trail is immutable
- **BR-BE-010**: Append-only design
- **BR-BE-010**: All operations logged
- **BR-BE-010**: Sensitive data masked

---

### UC-CN-211: Generate CN Number Sequence

**Description**: Server action generates unique sequential credit note numbers in the format CN-YYMM-NNNN with monthly reset.

**Actor(s)**: Server Action Layer (System)

**Priority**: Critical

**Frequency**: Every credit note creation (15-25 times per day)

**Related Backend Requirements**: BR-BE-011 (CN Number Generator)

**Preconditions**:
- Database sequence table exists
- Transaction context active

**Postconditions**:
- **Success**: Unique CN number generated
- **Failure**: Error returned (transaction blocked)

**Main Flow**:
1. Server action receives CN number generation request
2. System acquires lock on sequence table
3. System retrieves current sequence for year:
   - If current year: increment sequence
   - If new year: reset sequence to 1
4. System formats CN number: CN-YYMM-NNNN
   - YY = 2-digit year, MM = month
   - NNN = zero-padded sequence (001, 002, etc.)
5. System updates sequence table
6. System releases lock
7. System returns generated CN number
8. Use case ends

**Exception Flows**:

**Exc-211A: Sequence Lock Timeout** (At step 2)
- Cannot acquire lock within timeout
- System retries with backoff
- After max retries: returns error
- Use case ends with failure

**Business Rules**:
- **BR-BE-011**: Format CN-YYMM-NNNN
- **BR-BE-011**: Sequence resets monthly
- **BR-BE-011**: Numbers are gap-free
- **BR-BE-011**: Lock ensures uniqueness

---

### UC-CN-212: Update Vendor Balance

**Description**: Server action updates vendor accounts payable balance when credit note is committed or voided.

**Actor(s)**: Server Action Layer (System)

**Priority**: Critical

**Frequency**: Every credit note commitment/void (10-20 times per day)

**Related Backend Requirements**: BR-BE-012 (Vendor Balance Update)

**Preconditions**:
- Vendor account exists and active
- Credit note amount calculated
- Transaction context active

**Postconditions**:
- **Success**: Vendor balance updated
- **Failure**: Transaction rolled back

**Main Flow**:
1. Server action receives balance update request:
   - Vendor ID
   - Credit amount (positive for commit, negative for void)
   - Credit note reference
2. System retrieves vendor account record
3. System applies update within transaction:
   - Reduces payable balance (for commit)
   - Restores payable balance (for void)
4. System creates vendor transaction record
5. System updates vendor aging if applicable
6. System returns updated balance
7. Use case ends

**Exception Flows**:

**Exc-212A: Vendor Account Inactive** (At step 2)
- Vendor marked inactive or on hold
- System returns error
- Use case ends with failure

**Business Rules**:
- **BR-BE-012**: Balance update atomic with commitment
- **BR-BE-012**: Vendor must be active
- **BR-BE-012**: Transaction history maintained

---

### UC-CN-213: Validate Credit Note Data

**Description**: Server action performs comprehensive validation of credit note data including business rules, data integrity, and cross-field validations.

**Actor(s)**: Server Action Layer (System)

**Priority**: Critical

**Frequency**: Every credit note save/commit

**Related Backend Requirements**: BR-BE-013 (Data Validation)

**Preconditions**:
- Credit note data submitted
- Validation rules configured

**Postconditions**:
- **Success**: All validations pass, proceed with operation
- **Failure**: Validation errors returned

**Main Flow**:
1. Server action receives validation request with credit note data
2. System performs schema validation:
   - Required fields present
   - Data types correct
   - Format constraints met
3. System performs business rule validation:
   - Quantity > 0 for quantity returns
   - Amount > 0 for amount discounts
   - Return quantity ≤ lot available quantity
   - Document date ≤ current date
   - GRN exists and is posted
4. System performs cross-field validation:
   - Tax calculations consistent
   - Totals match line items
   - Currency consistent
5. System performs status-specific validation:
   - DRAFT: basic validation
   - COMMIT: pre-commitment validation
6. System returns validation result:
   - Valid: true/false
   - Errors: array of field-level errors
   - Warnings: array of non-blocking issues
7. Use case ends

**Exception Flows**:

**Exc-213A: Critical Validation Failure** (At step 3)
- Required field missing or invalid
- System returns error immediately
- Use case ends with failure

**Business Rules**:
- **BR-BE-013**: All required fields validated
- **BR-BE-013**: Business rules enforced
- **BR-BE-013**: Status-specific rules applied

---

### UC-CN-214: Sync Real-time Data

**Description**: Server action handles real-time data synchronization for credit note list and detail views using optimistic updates and cache invalidation.

**Actor(s)**: Server Action Layer (System)

**Priority**: High

**Frequency**: Continuous (list/detail refreshes)

**Related Backend Requirements**: BR-BE-014 (Real-time Sync)

**Preconditions**:
- WebSocket or SSE connection available
- Cache layer configured
- User session active

**Postconditions**:
- **Success**: Real-time updates delivered to clients
- **Failure**: Fallback to polling, cache invalidated

**Main Flow**:
1. System detects credit note state change
2. System broadcasts update event:
   - Credit note ID
   - Change type (CREATE, UPDATE, COMMIT, VOID)
   - Changed fields summary
   - Timestamp
3. System invalidates relevant caches:
   - Credit note list cache
   - Credit note detail cache
   - Vendor balance cache
   - Inventory lot cache
4. Connected clients receive update:
   - List view refreshes affected rows
   - Detail view refreshes if viewing affected record
5. System logs sync event
6. Use case ends

**Alternative Flows**:

**Alt-214A: No Active Connections** (At step 2)
- No clients connected for affected records
- System skips broadcast
- System still invalidates caches
- Continue to step 5

**Exception Flows**:

**Exc-214A: Broadcast Failure** (At step 2)
- WebSocket service unavailable
- System logs failure
- Clients use polling fallback
- Continue to step 3

**Business Rules**:
- **BR-BE-014**: Updates within 500ms of change
- **BR-BE-014**: Cache invalidation on every change
- **BR-BE-014**: Graceful degradation to polling

---

## Non-Functional Requirements Validation

**Performance Requirements**:
- List page load: < 2 seconds with 1000 credit notes
- Detail page load: < 1.5 seconds
- Credit note creation: < 3 seconds
- inventory cost calculation: < 2 seconds for 10 lots
- Posting operation: < 5 seconds
- Void operation: < 5 seconds

**Usability Requirements**:
- Intuitive wizard-based creation workflow
- Clear status indicators with color coding
- Real-time validation feedback
- cost analysis accessible and understandable
- Responsive design for tablet use in warehouse

**Security Requirements**:
- Role-based access control for all operations
- Audit trail for all credit note changes
- Approval workflow enforcement
- Financial data encryption
- Secure attachment storage

**Reliability Requirements**:
- 99.9% uptime during business hours
- Atomic posting transactions (all or nothing)
- Automatic rollback on posting failures
- Data integrity validation

**Compliance Requirements**:
- inventory costing for accurate inventory valuation
- Input VAT calculation per tax regulations
- Audit trail for financial compliance
- Lot traceability for quality compliance

---

## Glossary

**FIFO (First-In-First-Out)**: Inventory costing method that calculates costs based on oldest inventory layers first. One of two configurable costing methods in the system.

**Periodic Average**: Inventory costing method that calculates costs using weighted average for the period (Total Value in Period / Total Quantity in Period). One of two configurable costing methods in the system.

**Cost Variance**: Difference between current inventory cost and calculated cost (using FIFO or Periodic Average, depending on system configuration), impacts gross margin when returns occur.

**Realized Gain/Loss**: Financial impact of cost variance on credit note, calculated as (return amount - cost of goods sold).

**Lot Tracking**: System capability to track specific inventory batches/lots with unique identifiers for returns and quality control.

**Input VAT**: Value-added tax paid on purchases that can be credited against output VAT, adjusted when credit notes issued.

**Journal Voucher**: Accounting document containing GL entries generated from credit note posting.

**Stock Movement**: Inventory transaction record showing quantity changes by location and lot number.

**Approval Threshold**: Credit note amount limit above which manager approval required before posting.

**GL Account**: General Ledger account number used in financial system for posting transactions.

**Primary Entries**: Main journal entries for accounts payable credit and inventory/tax adjustments.

**Inventory Entries**: Additional journal entries for cost variances between current and inventory costs.

---

## Appendices

### Appendix A: Status Flow Diagram

```
DRAFT ──────────► COMMITTED
  │                     │
  │                     │
  └─────────────────────┴────► VOID
       (delete)              (void)
```

**Status Descriptions**:
- **DRAFT**: Credit note created, editable, not submitted
- **COMMITTED**: Committed to financial system, inventory updated, irreversible except by void
- **VOID**: Reversed after commitment, reversing entries created

### Appendix B: Credit Note Types

| Type | Description | Stock Movement | Inventory Costing | Use Cases |
|------|-------------|----------------|--------------|-----------|
| QUANTITY_RETURN | Physical return of goods | Yes (negative) | Yes | Damaged goods, quality issues, over-shipment |
| AMOUNT_DISCOUNT | Pricing adjustment only | No | No | Pricing errors, negotiated discounts, rebates |

### Appendix C: Inventory Cost Calculation Example

**Scenario**: Return 15 units of Product X with 3 lots:
- Lot A: 5 units @ $10.00 (received 2024-01-15)
- Lot B: 10 units @ $10.50 (received 2024-02-10)
- Lot C: 8 units @ $11.00 (received 2024-03-05)

**Return**: 15 units selected from Lot A (5 units) and Lot B (10 units)

**Inventory Cost Calculation**:
- Weighted average cost = ((5 × $10.00) + (10 × $10.50)) / 15 = $10.33
- Current cost = $11.00 (latest price)
- Cost variance = $11.00 - $10.33 = $0.67 per unit
- Return amount = 15 × $11.00 = $165.00
- COGS = 15 × $10.33 = $155.00
- Realized gain/loss = $165.00 - $155.00 = $10.00 (gain)

### Appendix D: Journal Entry Example

**Credit Note**: CN-2401-001, $4,720 total ($4,000 base + $720 tax)

**Journal Entries**:
```
Primary Entries Group:
DR  2100 - Accounts Payable           $4,720.00
    CR  1140 - Inventory                       $4,000.00
    CR  1240 - Input VAT                         $720.00

Inventory Entries Group (if cost variance exists):
DR  5200 - Cost Variance               $10.00
    CR  1140 - Inventory                          $10.00
```

---

**Document Control**:
- **Classification**: Internal Use
- **Distribution**: Procurement Team, Finance Team, Development Team
- **Review Cycle**: Quarterly or when business requirements change
- **Approval**: Procurement Manager, Finance Manager

**End of Document**
