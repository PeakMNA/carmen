# Use Cases: Goods Received Note (GRN)

**Module**: Procurement
**Sub-module**: Goods Received Note
**Document Version**: 1.2
**Last Updated**: 2025-12-03

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.2 | 2025-12-03 | Documentation Team | Updated inventory section with configurable costing method context (FIFO or Periodic Average) |
| 1.1 | 2025-12-03 | Documentation Team | Verified coverage against BR requirements (FR-GRN-001 to FR-GRN-017) |
| 1.0 | 2025-12-02 | Documentation Team | Initial version |

---

## 1. Overview

### 1.1 Purpose
This document defines detailed use cases for the Goods Received Note (GRN) module, describing how users interact with the system to record, validate, and manage goods receipts from vendors.

### 1.2 Scope
This document covers:
- Primary use cases for all GRN workflows
- Actor interactions and system responses
- Preconditions, postconditions, and business rules
- Main flows and alternative/exception flows
- Integration points with other modules

### 1.3 Actors

| Actor | Description | Permissions |
|-------|-------------|-------------|
| **Receiving Clerk** | Records goods receipt, validates deliveries against POs | Create, edit DRAFT/RECEIVED GRNs |
| **Storekeeper** | Manages inventory locations, confirms stock movements | Commit GRNs, verify stock movements |
| **Purchasing Staff** | Reviews GRN against PO, resolves discrepancies | View all GRNs, edit before commit |
| **AP Clerk** | Processes vendor invoices, allocates costs | View GRNs, add extra costs |
| **Financial Controller** | Reviews accounting entries, audits GRN | View all, export reports, audit logs |
| **Purchasing Manager** | Oversees procurement operations, handles exceptions | Void GRNs, override validations |
| **System** | Automated system processes | Auto-generate numbers, create stock movements, post JVs |

---

## 2. Use Case Index

| UC ID | Use Case Name | Actor(s) | Priority | FR Reference |
|-------|---------------|----------|----------|--------------|
| UC-GRN-001 | View GRN List | All Users | High | FR-GRN-001 |
| UC-GRN-002 | Filter and Search GRNs | All Users | High | FR-GRN-001 |
| UC-GRN-003 | Create GRN from Single PO | Receiving Clerk | High | FR-GRN-002 |
| UC-GRN-004 | Create GRN from Multiple POs | Receiving Clerk | High | FR-GRN-002, FR-GRN-006 |
| UC-GRN-005 | Create Manual GRN | Receiving Clerk | High | FR-GRN-003 |
| UC-GRN-006 | Edit GRN Header | Receiving Clerk | High | FR-GRN-004 |
| UC-GRN-007 | Add Line Items | Receiving Clerk | High | FR-GRN-005 |
| UC-GRN-008 | Edit Line Items | Receiving Clerk | High | FR-GRN-005 |
| UC-GRN-009 | Delete Line Items | Receiving Clerk | Medium | FR-GRN-005 |
| UC-GRN-010 | Add Extra Costs | AP Clerk | Medium | FR-GRN-007 |
| UC-GRN-011 | Commit GRN | Storekeeper | High | FR-GRN-010, FR-GRN-008 |
| UC-GRN-012 | Void GRN | Purchasing Manager | Medium | FR-GRN-010 |
| UC-GRN-013 | View Financial Summary | AP Clerk | High | FR-GRN-009 |
| UC-GRN-014 | View Stock Movements | Storekeeper | High | FR-GRN-008 |
| UC-GRN-015 | Add Comments | All Users | Medium | FR-GRN-012 |
| UC-GRN-016 | Upload Attachments | Receiving Clerk | Medium | FR-GRN-012 |
| UC-GRN-017 | View Activity Log | Financial Controller | Medium | FR-GRN-013 |
| UC-GRN-018 | Perform Bulk Actions | Receiving Clerk | Low | FR-GRN-014 |
| UC-GRN-019 | Export GRN to PDF | All Users | Medium | FR-GRN-015 |
| UC-GRN-020 | Export GRN to Excel | All Users | Medium | FR-GRN-015 |
| UC-GRN-021 | Print GRN | Receiving Clerk | Medium | FR-GRN-015 |
| UC-GRN-022 | Handle Consignment Receipt | AP Clerk | Low | FR-GRN-017 |
| UC-GRN-023 | Handle Cash Purchase | AP Clerk | Low | FR-GRN-017 |

---

## 3. Detailed Use Cases

### UC-GRN-001: View GRN List

**Primary Actor**: All Users
**Stakeholders**: Receiving Clerk, Storekeeper, AP Clerk, Financial Controller
**Priority**: High
**FR Reference**: FR-GRN-001

**Description**: User views a paginated list of all GRNs with key summary information.

**Preconditions**:
- User is authenticated and has permission to view GRNs
- At least one GRN exists in the system (or list shows empty state)

**Postconditions**:
- GRN list is displayed with current data
- User can select a GRN to view details

**Main Flow**:
1. User navigates to GRN List page (`/procurement/goods-received-note`)
2. System retrieves GRN records from database
3. System displays GRN list with columns:
   - GRN Number
   - Receipt Date
   - Vendor Name
   - Status (with color badge)
   - Total Amount
   - Created By
   - Actions (View, Edit, Print)
4. System displays pagination controls (10/25/50/100 per page)
5. User can click on GRN to view details

**Alternative Flows**:

**A1: No GRNs Exist**
- 3a. If no GRNs exist, system displays empty state with "Create New GRN" button
- 3b. User can click button to create first GRN

**A2: Large Dataset**
- 3a. If >1000 GRNs, system displays pagination and loads data incrementally
- 3b. User can navigate pages using pagination controls

**Exception Flows**:

**E1: Database Connection Error**
- 2a. System cannot retrieve GRN data
- 2b. System displays error message: "Unable to load GRNs. Please try again."
- 2c. System provides "Retry" button

**Business Rules**:
- BR-GRN-001: GRN numbers displayed in format GRN-YYMM-NNNN
- Users see only GRNs they have permission to view based on role

**UI Requirements**:
- List loads within 2 seconds (NFR-GRN-001)
- Responsive table design for tablet use
- Status badges color-coded: DRAFT (gray), RECEIVED (blue), COMMITTED (green), VOID (red)

---

### UC-GRN-002: Filter and Search GRNs

**Primary Actor**: All Users
**Priority**: High
**FR Reference**: FR-GRN-001

**Description**: User filters and searches GRN list to find specific records.

**Preconditions**:
- User is on GRN List page
- GRNs exist in system

**Postconditions**:
- GRN list is filtered based on criteria
- User can clear filters to return to full list

**Main Flow**:
1. User enters search term in search box (GRN number, vendor name, invoice number)
2. System filters list in real-time as user types
3. System highlights matching text in results
4. User can apply additional filters:
   - **Status filter**: Quick buttons for DRAFT, RECEIVED, COMMITTED, VOID
   - **Date range**: Receipt date from/to
   - **Vendor filter**: Dropdown of vendors
   - **Location filter**: Dropdown of storage locations
5. System combines all active filters using AND logic
6. System displays filtered result count: "Showing X of Y GRNs"
7. User can export filtered results

**Alternative Flows**:

**A1: No Results Found**
- 6a. If filters return no results, system displays "No GRNs match your filters"
- 6b. System suggests clearing some filters
- 6c. User can click "Clear All Filters" to reset

**A2: Advanced Search**
- 4a. User clicks "Advanced Search" button
- 4b. System displays modal with additional filters:
   - Created by (user)
   - Amount range (min/max)
   - PO reference
   - Job code
- 4c. User applies advanced filters
- 4d. System returns to main flow at step 5

**Exception Flows**:

**E1: Search Timeout**
- 2a. If search takes >2 seconds, system displays loading indicator
- 2b. If search takes >5 seconds, system shows timeout message
- 2c. User can retry or refine search criteria

**Business Rules**:
- Search is case-insensitive
- Filters persist during session (until page refresh or logout)
- Date range defaults to current month if not specified
- Status filter allows multi-select

**UI Requirements**:
- Search returns results within 2 seconds (NFR-GRN-001)
- Filter panel collapsible on mobile
- Active filter count badge displayed
- "Clear All" button visible when filters active

---

### UC-GRN-003: Create GRN from Single PO

**Primary Actor**: Receiving Clerk
**Priority**: High
**FR Reference**: FR-GRN-002

**Description**: User creates a GRN by selecting a vendor and one purchase order, then specifying received quantities.

**Preconditions**:
- User has "Create GRN" permission
- At least one vendor with open/partial POs exists
- Products in PO are in product catalog

**Postconditions**:
- New GRN created with status RECEIVED
- GRN number auto-generated
- Line items populated from PO
- PO status updated (if fully received)
- Activity log entry created

**Main Flow**:

**Step 1: Vendor Selection**
1. User clicks "Create GRN" button on GRN list page
2. System displays vendor selection page
3. System loads active vendors with open/partial POs
4. User can search vendors by name or business registration number
5. User selects vendor from list
6. User clicks "Next" button
7. System navigates to PO selection page

**Step 2: PO Selection**
8. System loads open/partial POs for selected vendor
9. System displays PO list with:
   - PO Number
   - PO Date
   - Total Amount
   - Currency
   - Status (OPEN/PARTIAL)
10. User selects one PO from list
11. User clicks "Next" button
12. System navigates to item selection page

**Step 3: Item & Location Selection**
13. System loads PO line items
14. System displays items table with:
    - Item Code & Name
    - Ordered Quantity & Unit
    - Previously Received
    - Remaining to Receive
    - **Received Quantity** (editable, default: remaining)
    - **Storage Location** (editable, required)
    - Unit Price (read-only)
15. User reviews each item and:
    - Adjusts received quantity if different from remaining
    - Selects storage location from dropdown
    - Can mark items as FOC (Free of Charge)
    - Can add line notes
16. User clicks "Create GRN" button
17. System validates all data:
    - Received qty ≤ remaining qty
    - Storage location selected for each item
    - No duplicate items
18. System creates GRN record:
    - Auto-generates GRN number (GRN-YYMM-NNNN)
    - Sets receipt date to today
    - Sets status to RECEIVED
    - Sets created by to current user
19. System saves all line items
20. System updates PO line item status:
    - If all items fully received → PO item status = RECEIVED
    - If partial → PO item status = PARTIAL
21. System updates PO header status
22. System displays success message: "GRN [number] created successfully"
23. System navigates to GRN detail page

**Alternative Flows**:

**A1: Partial Quantity Received**
- 15a. User receives less than remaining quantity
- 15b. User enters actual received quantity
- 15c. System flags as partial receipt
- 15d. PO line item remains PARTIAL status

**A2: Zero Received Quantity**
- 15a. User sets received quantity to 0 for one or more items
- 15b. System excludes these items from GRN
- 15c. System only creates GRN with items having qty > 0

**A3: Quantity Discrepancy**
- 15a. User receives more than remaining quantity
- 17a. System displays validation error: "Received quantity exceeds PO remaining quantity"
- 17b. User must reduce received quantity or cancel
- 17c. If over-receipt allowed (system setting), system shows warning but allows

**A4: Cancel Creation**
- At any step, user clicks "Cancel" button
- System displays confirmation dialog: "Discard GRN creation?"
- If confirmed, system returns to GRN list without saving
- If declined, user continues editing

**Exception Flows**:

**E1: No Storage Location Selected**
- 17a. System detects items without storage location
- 17b. System highlights items in red
- 17c. System displays error: "Please select storage location for all items"
- 17d. User corrects and resubmits

**E2: PO No Longer Available**
- 8a. Selected PO changed status to CLOSED or CANCELLED
- 8b. System displays error: "PO no longer available for receiving"
- 8c. System returns to vendor selection

**E3: Save Failure**
- 18a. Database transaction fails
- 18b. System rolls back all changes
- 18c. System displays error: "Failed to create GRN. Please try again."
- 18d. User data preserved in form for retry

**Business Rules**:
- BR-GRN-001: GRN number auto-generated, sequential per month
- BR-GRN-002: Received qty cannot exceed (ordered - previously received)
- BR-GRN-003: New GRN created with RECEIVED status
- BR-GRN-004: Line subtotal = received qty × unit price
- All PO prices and item details auto-populated

**UI Requirements**:
- Wizard navigation with step indicators (1/3, 2/3, 3/3)
- "Back" button available on steps 2 and 3
- Real-time quantity validation (red border if invalid)
- Storage location dropdown grouped by warehouse/kitchen
- Quantity fields support 3 decimal places

**Integration Points**:
- Purchase Order module: Retrieve PO data, update PO status
- Product Catalog: Validate item codes, retrieve item details
- Inventory Management: Validate storage locations

---

### UC-GRN-004: Create GRN from Multiple POs

**Primary Actor**: Receiving Clerk
**Priority**: High
**FR Reference**: FR-GRN-002, FR-GRN-006

**Description**: User creates a single GRN by receiving items from multiple purchase orders from the same vendor.

**Preconditions**:
- User has "Create GRN" permission
- Vendor has multiple open/partial POs
- All POs are in same currency (or base currency)

**Postconditions**:
- Single GRN created with line items from multiple POs
- Each line item references its source PO
- All source POs updated with received quantities
- GRN status set to RECEIVED

**Main Flow**:

**Steps 1-7**: Same as UC-GRN-003 (Vendor Selection)

**Step 2: PO Selection (Multi-Select)**
8. System loads open/partial POs for selected vendor
9. System displays PO list with checkboxes
10. User selects multiple POs (minimum 2)
11. System validates all POs:
    - Same vendor
    - Same currency (or all in base currency)
12. System displays summary: "X POs selected, Y total items"
13. User clicks "Next" button
14. System navigates to item selection page

**Step 3: Item & Location Selection (Multi-PO)**
15. System loads line items from ALL selected POs
16. System groups items by PO number
17. System displays items table with:
    - **PO Number** (for reference)
    - Item Code & Name
    - Ordered Quantity & Unit
    - Remaining to Receive
    - **Received Quantity** (editable)
    - **Storage Location** (editable)
    - Unit Price
18. User processes each item:
    - Reviews items from all POs
    - Adjusts received quantities
    - Selects storage locations
19. User clicks "Create GRN" button
20. System validates:
    - All received quantities valid per PO
    - All storage locations selected
    - No conflicts across POs
21. System creates single GRN:
    - One GRN header
    - Multiple line items, each with purchaseOrderId reference
22. System updates all source POs:
    - Updates received quantities per PO line item
    - Updates PO statuses (PARTIAL/RECEIVED)
23. System displays success message
24. System navigates to GRN detail page

**Alternative Flows**:

**A1: Items from Same Product Across POs**
- 17a. Same product appears in multiple selected POs
- 17b. System lists each PO item separately (not combined)
- 17c. Each line item maintains its own PO reference

**A2: Mixed Currencies**
- 11a. User selects POs with different currencies
- 11b. System displays error: "All POs must be in same currency"
- 11c. User deselects POs until all same currency
- 11d. System allows proceeding

**A3: Select All Items from Some POs Only**
- 18a. User receives all items from PO-A, partial from PO-B
- 18b. System creates GRN with all items
- 18c. PO-A status → RECEIVED
- 18d. PO-B status → PARTIAL

**Exception Flows**:

**E1: PO Changed During Creation**
- 15a. One of selected POs changed status (closed/cancelled)
- 15b. System displays warning: "PO [number] no longer available"
- 15c. System removes items from that PO
- 15d. User can proceed with remaining POs or cancel

**E2: Cross-PO Validation Errors**
- 21a. System detects conflicting data across POs
- 21b. System displays specific error messages
- 21c. User corrects issues and resubmits

**Business Rules**:
- BR-GRN-006: All POs in single GRN must be from same vendor
- BR-GRN-006: All POs must be in same currency
- BR-GRN-006: Each line item references one PO line item
- Each line item stores purchaseOrderId and purchaseOrderItemId
- Cannot mix different exchange rates in single GRN

**UI Requirements**:
- PO selection shows currency in list for easy verification
- Items table has "PO Number" column for clarity
- Can expand/collapse items by PO for easier review
- Selected PO count badge displayed

**Integration Points**:
- Purchase Order module: Retrieve multiple POs, update multiple PO statuses
- Validation: Ensure vendor consistency, currency consistency

---

### UC-GRN-005: Create Manual GRN

**Primary Actor**: Receiving Clerk
**Priority**: High
**FR Reference**: FR-GRN-003

**Description**: User creates a GRN without PO reference for unexpected deliveries or emergency purchases.

**Preconditions**:
- User has "Create GRN" permission
- Vendor exists in system
- Products exist in product catalog

**Postconditions**:
- GRN created without PO reference
- Status set to RECEIVED
- No PO status updates triggered
- Activity log records manual creation

**Main Flow**:

1. User clicks "Create Manual GRN" button on GRN list page
2. System displays blank GRN form
3. System auto-generates temporary GRN ID (not saved until submit)
4. User enters header information:
   - **Vendor**: Select from dropdown (required)
   - **Receipt Date**: Default today (editable)
   - **Invoice Number**: Manual entry
   - **Invoice Date**: Manual entry
   - **Description**: Free text notes
   - **Currency**: Select from active currencies
   - **Exchange Rate**: Auto-populated (editable)
5. User adds line items:
   - Click "Add Item" button
   - Search and select product from catalog
   - Enter received quantity and unit
   - Enter unit price
   - Select storage location
   - Optional: Add line notes, job code
6. User repeats step 5 for all items
7. System calculates:
   - Line subtotals
   - Tax amounts (if applicable)
   - Total amount
8. User can:
   - Mark as consignment or cash purchase
   - Add comments or attachments
9. User clicks "Save GRN" button
10. System validates:
    - Vendor selected
    - At least one line item
    - All required fields complete
    - Storage locations valid
11. System saves GRN:
    - Generates final GRN number (GRN-YYMM-NNNN)
    - Sets status to RECEIVED
    - Records created by user and timestamp
12. System displays success message
13. System navigates to GRN detail page

**Alternative Flows**:

**A1: Save as Draft**
- 9a. User clicks "Save as Draft" instead of "Save GRN"
- 9b. System saves GRN with status DRAFT
- 9c. Validation relaxed (can save with incomplete data)
- 9d. User can continue editing later

**A2: Copy from Another GRN**
- 1a. User clicks "Copy from GRN" button
- 1b. System displays GRN selection dialog
- 1c. User selects source GRN
- 1d. System copies header and line items (excluding GRN number, dates)
- 1e. User edits as needed and saves

**A3: Product Not in Catalog**
- 5a. User cannot find product in search
- 5b. User clicks "Add New Product" (if permission)
- 5c. System opens product creation modal
- 5d. User creates product (minimum info)
- 5e. System returns to GRN with new product selected

**Exception Flows**:

**E1: Vendor Not Found**
- 4a. Vendor not in system
- 4b. User clicks "Add New Vendor" (if permission)
- 4c. System opens vendor creation modal
- 4d. User creates vendor (minimum info)
- 4e. System returns to GRN with new vendor selected

**E2: Invalid Price**
- 5a. User enters unit price = 0 or negative
- 10a. System displays error: "Unit price must be greater than 0"
- 10b. User corrects price

**E3: Duplicate Items**
- 5a. User adds same product twice
- 10a. System warns: "Product already exists in line items"
- 10b. User can:
   - Combine quantities
   - Keep separate (different locations/prices)
   - Remove duplicate

**Business Rules**:
- BR-GRN-001: GRN number auto-generated on save
- No PO validation required
- All line item data manually entered
- Manual GRNs flagged in reporting for audit

**UI Requirements**:
- Product search autocomplete with typeahead
- Quantity and price fields support decimals
- Real-time total calculation
- Can reorder line items via drag-and-drop
- "Save as Draft" and "Save GRN" buttons both visible

**Integration Points**:
- Product Catalog: Search products, retrieve details
- Vendor Management: Search vendors, retrieve vendor details
- Inventory Management: Validate storage locations

---

### UC-GRN-006: Edit GRN Header

**Primary Actor**: Receiving Clerk
**Priority**: High
**FR Reference**: FR-GRN-004

**Description**: User edits GRN header information (dates, invoice details, currency).

**Preconditions**:
- GRN exists in DRAFT or RECEIVED status
- User has edit permission for GRN
- GRN not yet committed

**Postconditions**:
- GRN header updated with new information
- Activity log records changes
- Financial calculations updated if currency changed

**Main Flow**:

1. User opens GRN detail page
2. System displays GRN in view mode
3. User clicks "Edit" button
4. System enables edit mode for header fields:
   - Receipt Date
   - Invoice Number
   - Invoice Date
   - Tax Invoice Number
   - Tax Invoice Date
   - Description
   - Currency (if not yet committed)
   - Exchange Rate (if currency changed)
   - Consignment Flag
   - Cash Purchase Flag
   - Cash Book (if cash purchase)
5. User modifies desired fields
6. If currency changed:
   - System prompts to update exchange rate
   - System recalculates all line totals in new currency
   - System displays confirmation: "Currency change will recalculate all amounts. Continue?"
7. User clicks "Save" button
8. System validates:
   - Receipt date not in future
   - Invoice date not before PO date (if from PO)
   - Required fields complete
   - Cash book selected if cash purchase = true
9. System saves changes
10. System updates financial summary if currency/exchange rate changed
11. System creates activity log entry: "Header updated by [user]"
12. System displays success message: "GRN updated successfully"
13. System returns to view mode

**Alternative Flows**:

**A1: Cancel Editing**
- 7a. User clicks "Cancel" button
- 7b. System prompts: "Discard changes?"
- 7c. If confirmed, system reverts to original values
- 7d. System returns to view mode

**A2: Exchange Rate Override**
- 6a. System auto-fetches exchange rate from system table
- 6b. User manually overrides rate
- 6c. System displays warning: "Using custom exchange rate"
- 6d. System flags GRN for audit review

**A3: Mark as Cash Purchase**
- 5a. User checks "Cash Purchase" checkbox
- 5b. System displays cash book dropdown (required)
- 5c. User selects cash book
- 5d. System updates accounting preview (cash book instead of AP)

**Exception Flows**:

**E1: GRN Already Committed**
- 3a. GRN status = COMMITTED
- 3b. System displays error: "Cannot edit committed GRN"
- 3c. "Edit" button disabled

**E2: Invoice Number Duplicate**
- 8a. Invoice number already exists for same vendor
- 8b. System displays warning: "Duplicate invoice number detected"
- 8c. User can:
   - Confirm duplicate (allowed if legitimate)
   - Correct invoice number

**E3: Currency Exchange Rate Not Found**
- 6a. No exchange rate available for selected currency and date
- 6b. System displays error: "Exchange rate not available for [currency] on [date]"
- 6c. User must:
   - Enter manual exchange rate
   - Change receipt date
   - Contact admin to add exchange rate

**Business Rules**:
- Cannot edit vendor once GRN created
- Cannot edit GRN number (auto-generated)
- Cannot change currency if GRN committed
- Receipt date must be ≥ PO date (if from PO)
- Exchange rate locked when committed

**UI Requirements**:
- Edit mode clearly distinguishable from view mode
- Currency change confirmation modal with impact summary
- Real-time validation messages
- "Save" and "Cancel" buttons prominently displayed in edit mode

**Integration Points**:
- Currency Exchange Rate: Fetch rate from system table
- Cash Book: Validate cash book selection

---

### UC-GRN-007: Add Line Items

**Primary Actor**: Receiving Clerk
**Priority**: High
**FR Reference**: FR-GRN-005

**Description**: User adds new line items to existing GRN.

**Preconditions**:
- GRN exists in DRAFT or RECEIVED status
- User has edit permission
- Product catalog accessible

**Postconditions**:
- New line items added to GRN
- Financial totals recalculated
- Activity log updated

**Main Flow**:

1. User opens GRN detail page
2. User navigates to "Items" tab
3. User clicks "Add Item" button
4. System displays item selection dialog:
   - Product search field
   - Recent products list
   - Frequently used products
5. User searches for product:
   - Enter product code or name
   - System shows autocomplete results
6. User selects product from results
7. System displays item entry form:
   - **Product**: Pre-filled (read-only)
   - **Description**: Pre-filled from catalog (editable)
   - **Received Quantity**: Empty (required)
   - **Unit**: Dropdown of product UOMs (required)
   - **Unit Price**: Empty (required)
   - **Storage Location**: Dropdown (required)
   - **Discount %**: Default 0 (optional)
   - **Tax Rate**: Default from product (editable)
   - **FOC Quantity**: Default 0 (optional)
   - **Job Code**: Dropdown (optional)
   - **Notes**: Free text (optional)
8. User enters:
   - Received quantity
   - Unit price
   - Selects storage location
9. System calculates:
   - Subtotal = Qty × Price
   - Discount Amount = Subtotal × Discount %
   - Net = Subtotal - Discount
   - Tax Amount = Net × Tax %
   - Total = Net + Tax
10. User clicks "Add to GRN" button
11. System validates:
    - Quantity > 0
    - Unit price > 0 (unless FOC)
    - Storage location selected
    - Valid unit for product
12. System adds line item to GRN
13. System assigns line number (auto-increment)
14. System recalculates GRN totals
15. System creates activity log entry: "Item [product] added by [user]"
16. System displays item in items table
17. User can repeat steps 3-16 to add more items

**Alternative Flows**:

**A1: Add from PO Item**
- 3a. User clicks "Add from PO" button (if GRN created from PO)
- 3b. System displays remaining PO items not yet in GRN
- 3c. User selects PO item
- 3d. System pre-fills all fields from PO:
   - Product, description, unit
   - Ordered qty, unit price
   - Remaining qty to receive
- 3e. User adjusts received qty if needed
- 3f. System continues from step 8

**A2: Mark as FOC (Free of Charge)**
- 8a. User checks "Free of Charge" checkbox
- 8b. System sets unit price to 0
- 8c. System calculates subtotal = 0
- 8d. FOC quantity stored separately from received quantity

**A3: Apply Discount**
- 8a. User enters discount percentage
- 8b. System calculates discount amount
- 8c. System updates net amount and total

**A4: Batch/Lot Tracking**
- 8a. Product requires batch/lot tracking
- 8b. System displays additional fields:
   - Batch Number (required)
   - Manufacturing Date
   - Expiry Date
- 8c. User enters batch information
- 8d. System validates expiry date > today

**Exception Flows**:

**E1: Product Not Found**
- 5a. Search returns no results
- 5b. User clicks "Create New Product" (if permission)
- 5c. System opens product creation modal
- 5d. User creates product
- 5e. System returns to item entry with new product selected

**E2: Duplicate Product**
- 11a. Same product already exists in GRN (same location)
- 11b. System displays warning: "Product already in GRN"
- 11c. User can:
   - Combine with existing line (add quantities)
   - Add as separate line (different batch/price)
   - Cancel

**E3: Invalid Unit Price**
- 11a. Unit price significantly differs from last purchase price (>20%)
- 11b. System displays warning: "Price differs from last purchase ($X.XX)"
- 11c. User can:
   - Confirm price (allowed)
   - Correct price

**E4: Storage Location Full**
- 11a. Selected storage location at capacity
- 11b. System displays warning: "Location [name] is at capacity"
- 11c. User selects different location or overrides

**Business Rules**:
- Line numbers auto-assigned sequentially (10, 20, 30...)
- Cannot add items to COMMITTED or VOID GRN
- Unit price must match PO price ±10% tolerance (if from PO)
- Storage location must be active and valid
- Quantity supports up to 3 decimal places

**UI Requirements**:
- Product search with real-time autocomplete
- Line calculations update in real-time as user types
- Storage location grouped by warehouse/kitchen
- Tax rate dropdown from system tax rates
- Validation messages display inline

**Integration Points**:
- Product Catalog: Search products, retrieve product details, UOMs, tax settings
- Inventory Management: Validate storage locations, check capacity
- Purchase Order: Retrieve PO item details (if applicable)

---

### UC-GRN-008: Edit Line Items

**Primary Actor**: Receiving Clerk
**Priority**: High
**FR Reference**: FR-GRN-005

**Description**: User edits existing line items in GRN (quantity, price, location, etc.).

**Preconditions**:
- GRN exists in DRAFT or RECEIVED status
- Line items exist in GRN
- User has edit permission

**Postconditions**:
- Line item updated with new values
- Financial totals recalculated
- Activity log records changes

**Main Flow**:

1. User opens GRN detail page
2. User navigates to "Items" tab
3. System displays items table with all line items
4. User clicks "Edit" icon on specific line item
5. System displays inline edit mode or edit modal with fields:
   - Product (read-only)
   - Description (editable)
   - Received Quantity (editable)
   - Unit (editable)
   - Unit Price (editable)
   - Storage Location (editable)
   - Discount % (editable)
   - Tax Rate (editable)
   - FOC Quantity (editable)
   - Job Code (editable)
   - Notes (editable)
6. User modifies desired fields
7. System recalculates line totals in real-time:
   - Subtotal
   - Discount amount
   - Net amount
   - Tax amount
   - Total
8. User clicks "Save" button
9. System validates:
   - Quantity > 0
   - Unit price ≥ 0
   - Storage location valid
   - If from PO: Received qty ≤ PO remaining qty
10. System updates line item
11. System recalculates GRN financial totals
12. System creates activity log entry: "Item [product] updated by [user] - [fields changed]"
13. System displays updated item in table
14. System shows success message: "Item updated"

**Alternative Flows**:

**A1: Quantity Increased**
- 6a. User increases received quantity
- 9a. If from PO, system validates new qty ≤ remaining qty
- 9b. If exceeds, system displays error
- 9c. User reduces quantity or cancels

**A2: Quantity Decreased**
- 6a. User decreases received quantity
- 10a. System recalculates totals with new quantity

**A3: Price Changed**
- 6a. User changes unit price
- 9a. If from PO and price differs >10% from PO price:
   - System displays warning: "Price differs from PO: $X.XX"
   - User confirms or corrects

**A4: Storage Location Changed**
- 6a. User selects different storage location
- 10a. System validates new location is active
- 10b. System creates note in activity log about location change

**A5: Cancel Editing**
- 8a. User clicks "Cancel" button
- 8b. System discards changes
- 8c. Line item returns to view mode with original values

**Exception Flows**:

**E1: GRN Already Committed**
- 4a. GRN status = COMMITTED
- 4b. System disables all edit icons
- 4c. System displays message: "Cannot edit committed GRN"

**E2: Validation Errors**
- 9a. Multiple validation errors detected
- 9b. System displays all errors in list
- 9c. System highlights invalid fields in red
- 9d. User corrects all errors before saving

**E3: Concurrent Edit Conflict**
- 8a. Another user edited same GRN since page loaded
- 9a. System detects version conflict
- 9b. System displays error: "GRN has been modified by another user"
- 9c. User options:
   - Reload page to see latest data (lose changes)
   - Review conflicts and merge manually

**E4: Line Linked to Stock Movement**
- 4a. Line item already has stock movement (GRN committed then uncommitted)
- 4b. System displays warning: "Stock movement exists for this item"
- 4c. Edit allowed but changes flagged for review

**Business Rules**:
- Cannot change product once line item created
- Cannot edit if GRN status = COMMITTED or VOID
- Price tolerance: PO price ±10% (warning if exceeded)
- Quantity precision: up to 3 decimal places
- All financial calculations rounded to 2 decimal places

**UI Requirements**:
- Inline editing preferred for quick changes
- Modal editing for complex changes (batch/lot details)
- Real-time calculation feedback
- Validation errors display immediately on field blur
- Unsaved changes indicator (asterisk or badge)

**Integration Points**:
- Purchase Order: Validate against PO quantities and prices
- Inventory Management: Validate storage locations
- Financial: Recalculate tax and totals

---

### UC-GRN-009: Delete Line Items

**Primary Actor**: Receiving Clerk
**Priority**: Medium
**FR Reference**: FR-GRN-005

**Description**: User removes line items from GRN.

**Preconditions**:
- GRN exists in DRAFT or RECEIVED status
- Line items exist in GRN
- User has edit permission

**Postconditions**:
- Line item removed from GRN
- Line numbers resequenced
- Financial totals recalculated
- Activity log records deletion

**Main Flow**:

1. User opens GRN detail page
2. User navigates to "Items" tab
3. User clicks "Delete" icon on specific line item
4. System displays confirmation dialog:
   - "Delete [product name]?"
   - "This action cannot be undone."
   - [Cancel] [Delete] buttons
5. User clicks "Delete" button
6. System removes line item from GRN
7. System resequences remaining line numbers (10, 20, 30...)
8. System recalculates GRN totals:
   - Subtotal
   - Tax total
   - Grand total
9. System creates activity log entry: "Item [product] deleted by [user]"
10. System displays success message: "Item deleted"
11. System refreshes items table

**Alternative Flows**:

**A1: Delete Last Item**
- 6a. User deletes the only line item
- 6b. System allows deletion
- 6c. GRN exists with zero line items
- 6d. System displays message: "GRN has no items. Add items or delete GRN."

**A2: Bulk Delete**
- 3a. User selects multiple line items (checkboxes)
- 3b. User clicks "Delete Selected" button
- 4a. System displays confirmation: "Delete X items?"
- 5a. User confirms
- 6a. System deletes all selected items in single transaction
- 8a. System recalculates totals once

**A3: Cancel Deletion**
- 5a. User clicks "Cancel" button
- 5b. System closes dialog without changes
- 5c. Line item remains in GRN

**Exception Flows**:

**E1: GRN Already Committed**
- 3a. GRN status = COMMITTED
- 3b. System disables delete icon
- 3c. System displays message: "Cannot delete items from committed GRN"

**E2: Line Item Linked to Stock Movement**
- 6a. Line item has associated stock movement (rare: GRN committed then uncommitted)
- 6b. System displays error: "Cannot delete item with stock movement"
- 6c. User must first reverse stock movement or contact admin

**E3: Line Item Part of Invoice**
- 6a. Line item already matched to AP invoice
- 6b. System displays warning: "Item matched to invoice [number]"
- 6c. User can:
   - Cancel deletion
   - Force delete (creates discrepancy, requires approval)

**Business Rules**:
- Cannot delete from COMMITTED or VOID GRN
- Deleting all items leaves empty GRN (valid state)
- Line numbers resequenced after deletion (no gaps)
- Activity log preserves deleted item details for audit

**UI Requirements**:
- Delete icon visible only in edit mode
- Confirmation dialog requires explicit "Delete" click (not accidental)
- Bulk delete checkbox column appears in edit mode
- Deleted items briefly fade out before removal (visual feedback)

**Integration Points**:
- Purchase Order: If from PO, deletion does not revert PO item status
- Inventory: Check for stock movements before deletion
- AP: Check for invoice matching before deletion

---

### UC-GRN-010: Add Extra Costs

**Primary Actor**: AP Clerk
**Priority**: Medium
**FR Reference**: FR-GRN-007

**Description**: User allocates additional costs (freight, handling, customs) to GRN and distributes across line items.

**Preconditions**:
- GRN exists (any status except VOID)
- At least one line item exists
- User has permission to add costs

**Postconditions**:
- Extra cost entries added to GRN
- Costs distributed to line items
- Line item totals updated
- GRN total increased by extra costs
- Activity log records cost additions

**Main Flow**:

1. User opens GRN detail page
2. User navigates to "Extra Costs" tab
3. System displays:
   - List of existing extra costs (if any)
   - "Add Extra Cost" button
   - Distribution method selector
4. User clicks "Add Extra Cost" button
5. System displays cost entry form:
   - **Cost Type**: Dropdown (Freight, Handling, Customs, Insurance, Other)
   - **Description**: Free text
   - **Amount**: Numeric field
   - **Currency**: Dropdown (defaults to GRN currency)
   - **Exchange Rate**: Auto-populated if different currency
6. User enters:
   - Selects cost type
   - Enters description
   - Enters amount
   - Selects currency (if different from GRN)
7. If currency different from GRN currency:
   - System fetches exchange rate
   - System displays: "Amount in GRN currency: [converted amount]"
8. User selects distribution method:
   - **By Net Amount**: Distribute proportionally by line item net amount
   - **By Quantity**: Distribute proportionally by quantity received
9. User clicks "Add Cost" button
10. System validates:
    - Amount > 0
    - Cost type selected
    - Exchange rate available (if multi-currency)
11. System calculates distribution:
    - If By Net Amount:
      - Line allocation = (Line Net / Total Net) × Extra Cost
    - If By Quantity:
      - Line allocation = (Line Qty / Total Qty) × Extra Cost
12. System adds extra cost entry
13. System updates each line item:
    - Adds allocated extra cost to line total
    - Stores allocation in line item metadata
14. System recalculates GRN grand total
15. System creates activity log entry: "Extra cost [type] added: [amount]"
16. System displays cost in extra costs table
17. System shows updated line item costs

**Alternative Flows**:

**A1: Multi-Currency Extra Cost**
- 6a. User selects different currency than GRN currency
- 7a. System fetches exchange rate for cost entry date
- 7b. System converts to GRN currency for distribution
- 7c. System stores both original and converted amounts

**A2: Change Distribution Method**
- 8a. User changes distribution method after adding costs
- 8b. System recalculates all cost allocations using new method
- 8c. System updates all line item totals
- 8d. User confirms recalculation

**A3: Edit Existing Extra Cost**
- 3a. User clicks "Edit" on existing extra cost
- 5a. System displays edit form with current values
- 9a. User modifies values and saves
- 10a. System recalculates distribution
- 14a. System updates all affected line items

**A4: Delete Extra Cost**
- 3a. User clicks "Delete" on existing extra cost
- 3b. System displays confirmation dialog
- 3c. User confirms deletion
- 3d. System removes cost entry
- 3e. System recalculates line items (removes allocated costs)
- 3f. System updates GRN total

**Exception Flows**:

**E1: No Line Items**
- 4a. GRN has no line items
- 4b. System disables "Add Extra Cost" button
- 4c. System displays message: "Add line items before adding extra costs"

**E2: Invalid Amount**
- 10a. User enters amount ≤ 0
- 10b. System displays error: "Amount must be greater than 0"
- 10c. User corrects amount

**E3: Exchange Rate Not Available**
- 7a. No exchange rate found for selected currency and date
- 10a. System displays error: "Exchange rate not available"
- 10b. User options:
   - Enter manual exchange rate
   - Change currency
   - Contact admin to add exchange rate

**E4: Distribution Precision Issues**
- 11a. Distribution results in >2 decimal places for line items
- 11b. System rounds each line allocation to 2 decimals
- 11c. System adjusts last line item to ensure total equals extra cost exactly

**Business Rules**:
- Extra costs always increase GRN total (never negative)
- Distribution method applies to all extra costs in GRN
- Cannot add extra costs to VOID GRN
- Exchange rate locked once GRN committed
- Line allocations rounded to 2 decimal places
- Sum of allocations must equal extra cost amount exactly

**UI Requirements**:
- Extra costs table shows: Type, Description, Amount, Currency, Allocated (Yes/No)
- Distribution method selector with visual explanation
- Real-time distribution preview before confirming
- Line items table shows allocated extra cost per line

**Integration Points**:
- Currency Exchange Rate: Fetch rates for multi-currency costs
- Financial Accounting: Extra costs included in inventory cost and JV entries

---

### UC-GRN-011: Commit GRN

**Primary Actor**: Storekeeper
**Priority**: High
**FR Reference**: FR-GRN-010, FR-GRN-008

**Description**: User commits GRN, finalizing the receipt and triggering stock movements and accounting entries.

**Preconditions**:
- GRN exists in RECEIVED status
- User has "Commit GRN" permission
- All line items have storage locations
- All required fields complete

**Postconditions**:
- GRN status changed to COMMITTED
- Stock movements created for all line items
- Inventory quantities updated
- Journal voucher posted to GL
- PO status updated (if applicable)
- GRN becomes read-only (cannot edit)
- Activity log records commit action

**Main Flow**:

1. User opens GRN detail page (status = RECEIVED)
2. System displays "Commit" button
3. User clicks "Commit" button
4. System performs pre-commit validation:
   - All line items have storage location
   - All required header fields complete
   - At least one line item exists
   - Financial totals calculated
   - No pending validations or errors
5. System displays commit confirmation dialog:
   - "Commit GRN-YYMM-NNNN?"
   - "This will update inventory and post accounting entries."
   - "This action cannot be undone."
   - Summary: X items, Total amount $Y.YY
   - [Cancel] [Commit] buttons
6. User clicks "Commit" button
7. System initiates commit transaction:
   - Updates GRN status to COMMITTED
   - Locks GRN for editing
8. System creates stock movements:
   - One stock movement per line item
   - Movement type: "GRN Receipt"
   - Quantity: Received quantity (excluding rejected/damaged)
   - Location: Line item storage location
   - Batch/Lot: If applicable
   - Cost: Unit price + allocated extra costs
   - Reference: GRN number and line number
9. System updates inventory:
   - Increases on-hand quantity per location
   - Creates inventory layer with unit cost for valuation
   - Cost calculation method (FIFO or Periodic Average) configured at System Administration → Inventory Settings
   - Records batch/lot details if applicable
10. System updates PO status (if applicable):
    - Updates each linked PO item:
      - Received qty increased
      - Status updated (PARTIAL/RECEIVED)
    - Updates PO header status if all items received
11. System creates journal voucher:
    - JV Type: GRN
    - JV Date: Receipt date
    - Debit: Inventory account (per line item dept)
    - Credit: Accounts Payable - Vendor
    - Amount: GRN total (including extra costs)
    - Tax entries: Input VAT/GST
12. System posts JV to GL
13. System updates vendor payable balance
14. System sets commit timestamp and user
15. System creates activity log entry: "GRN committed by [user]"
16. System sends notifications:
    - Email to AP Clerk: "GRN ready for invoice matching"
    - Email to Purchasing Manager (if discrepancies)
17. System displays success message: "GRN committed successfully"
18. System refreshes page in view-only mode
19. System displays "COMMITTED" badge prominently

**Alternative Flows**:

**A1: Partial Quantities**
- 8a. Some line items have received qty < ordered qty
- 8b. System creates stock movements for received quantities only
- 10a. PO items remain in PARTIAL status

**A2: Multi-PO GRN**
- 10a. GRN references multiple POs
- 10b. System updates each PO separately
- 10c. Each PO status updated independently

**A3: Consignment GRN**
- 11a. GRN marked as consignment
- 11b. System creates different JV:
   - Debit: Consignment Inventory
   - Credit: Consignment Payable
- 11c. No immediate payment obligation

**A4: Cash Purchase GRN**
- 11a. GRN marked as cash purchase
- 11b. System creates different JV:
   - Debit: Inventory
   - Credit: Cash Book (not AP)
- 11c. Payment recorded immediately

**A5: Cancel Commit**
- 6a. User clicks "Cancel" button
- 6b. System closes dialog without changes
- 6c. GRN remains in RECEIVED status

**Exception Flows**:

**E1: Validation Errors**
- 4a. Validation fails on one or more checks
- 4b. System displays error dialog with all issues:
   - "3 line items missing storage location"
   - "Invoice number required"
- 4c. System highlights problematic fields
- 4d. User must fix all issues before retrying commit

**E2: Storage Location Inactive**
- 8a. Storage location became inactive since item added
- 8b. System displays error: "Location [name] is inactive"
- 8c. User must edit item to select active location
- 8d. System cancels commit

**E3: Inventory Update Failure**
- 9a. Inventory update fails (database error, constraint violation)
- 9b. System rolls back entire commit transaction
- 9c. GRN status reverts to RECEIVED
- 9d. System displays error: "Inventory update failed. Please try again."
- 9e. Admin notified of failure

**E4: JV Posting Failure**
- 12a. Journal voucher posting fails (GL account missing, period closed)
- 12b. System rolls back commit transaction
- 12c. Stock movements reversed
- 12d. GRN status reverts to RECEIVED
- 12e. System displays error: "Accounting entry failed: [reason]"
- 12f. Admin notified for resolution

**E5: Concurrent Commit Attempt**
- 7a. Another user already committed this GRN
- 7b. System detects version conflict
- 7c. System displays error: "GRN already committed by [user]"
- 7d. System refreshes page to show committed status

**Business Rules**:
- BR-GRN-003: Can only commit if all required fields complete
- BR-GRN-003: COMMITTED GRN cannot be edited
- BR-GRN-003: COMMITTED GRN creates irreversible stock movements
- BR-GRN-007: Stock movements created only when status = COMMITTED
- BR-GRN-007: Only received quantity (not rejected/damaged) increases inventory
- Commit operation must be atomic (all or nothing)

**UI Requirements**:
- "Commit" button prominently placed (green, primary action)
- Confirmation dialog clearly warns of irreversibility
- Loading indicator during commit process (may take several seconds)
- Success state shows confetti or checkmark animation
- COMMITTED badge in green with lock icon

**Integration Points**:
- **Inventory Management**: Create stock movements, update on-hand quantities
- **Purchase Order**: Update PO item and header statuses
- **General Ledger**: Post journal voucher
- **Accounts Payable**: Update vendor payable balance
- **Notification System**: Send email alerts

---

### UC-GRN-012: Void GRN

**Primary Actor**: Purchasing Manager
**Priority**: Medium
**FR Reference**: FR-GRN-010

**Description**: User voids/cancels a GRN, reversing its effects if committed.

**Preconditions**:
- GRN exists in RECEIVED or COMMITTED status
- User has "Void GRN" permission (manager only)
- If committed, stock has not been consumed/transferred

**Postconditions**:
- GRN status changed to VOID
- If was committed: Stock movements reversed, JV reversed
- PO status reverted (if applicable)
- GRN becomes read-only with VOID badge
- Activity log records void action with reason

**Main Flow**:

1. User opens GRN detail page
2. User clicks "Actions" dropdown
3. User selects "Void GRN"
4. System displays void confirmation dialog:
   - "Void GRN-YYMM-NNNN?"
   - Warning: "This action cannot be undone."
   - If committed: "This will reverse inventory and accounting entries."
   - **Void Reason**: Text area (required)
   - [Cancel] [Void GRN] buttons
5. User enters void reason (required)
6. User clicks "Void GRN" button
7. System validates:
   - Void reason not empty (minimum 10 characters)
   - If committed: Check if inventory consumed
8. If GRN status = COMMITTED:
   - System creates reversal stock movements:
     - Negative quantities for each original movement
     - Same locations and products
     - Movement type: "GRN Reversal"
     - Reference: Original GRN number
   - System updates inventory:
     - Decreases on-hand quantity
     - Adjusts inventory value
   - System creates reversal journal voucher:
     - Opposite entries from original JV
     - JV Type: GRN Reversal
     - Posts to GL
9. System updates GRN:
   - Status → VOID
   - Void reason saved
   - Voided by user and timestamp
10. System updates PO status (if applicable):
    - Reverts each linked PO item:
      - Reduces received qty
      - Status reverts (OPEN/PARTIAL)
    - Updates PO header status
11. System creates activity log entry: "GRN voided by [user] - Reason: [reason]"
12. System sends notifications:
    - Email to AP Clerk: "GRN voided, check invoices"
    - Email to Receiving Clerk (original creator)
    - Email to Financial Controller
13. System displays success message: "GRN voided successfully"
14. System refreshes page with VOID badge

**Alternative Flows**:

**A1: Void RECEIVED GRN (Not Committed)**
- 8a. GRN status = RECEIVED (not yet committed)
- 8b. No stock movements to reverse
- 8c. No JV to reverse
- 8d. System skips steps 8a-8c, proceeds to step 9

**A2: Multi-PO GRN**
- 10a. GRN references multiple POs
- 10b. System reverts each PO separately
- 10c. Each PO status updated independently

**A3: Cancel Void**
- 6a. User clicks "Cancel" button
- 6b. System closes dialog without changes
- 6c. GRN remains in original status

**Exception Flows**:

**E1: Void Reason Missing**
- 7a. User clicks "Void GRN" without entering reason
- 7b. System displays error: "Void reason is required"
- 7c. User must enter reason (min 10 characters)

**E2: Inventory Already Consumed**
- 8a. Stock from GRN already used in production or transferred
- 8b. System cannot reverse stock movements
- 8c. System displays error: "Cannot void GRN - Inventory already consumed"
- 8d. System suggests:
   - Create adjustment transaction
   - Contact administrator for manual reversal

**E3: Invoice Already Processed**
- 8a. Vendor invoice already matched and paid
- 8b. System displays warning: "Invoice [number] already processed"
- 8c. System allows void but flags for AP review
- 8d. AP must handle payment reversal separately

**E4: JV Reversal Failure**
- 8c. JV posting fails (GL period closed, account locked)
- 8d. System rolls back void transaction
- 8e. GRN status unchanged
- 8f. System displays error: "Cannot void - Accounting period closed"
- 8g. User must contact financial controller

**E5: Concurrent Edit Conflict**
- 6a. Another user editing or committing same GRN
- 7a. System detects version conflict
- 7b. System displays error: "GRN has been modified. Please refresh."
- 7c. System reloads page with latest data

**Business Rules**:
- BR-GRN-003: Voiding GRN requires reason entry
- BR-GRN-003: VOID GRN cannot be un-voided
- Only users with manager permission can void
- Cannot void if inventory already consumed
- Voiding committed GRN creates reversal entries (not deletion)

**UI Requirements**:
- "Void GRN" option in Actions dropdown (destructive action, red text)
- Confirmation dialog prominent and clear
- Void reason text area with character counter (min 10, max 500)
- VOID badge displayed in red with strikethrough on GRN number
- Void reason and voided by/date displayed in header

**Integration Points**:
- **Inventory Management**: Reverse stock movements, update quantities
- **General Ledger**: Post reversal journal voucher
- **Purchase Order**: Revert PO statuses and received quantities
- **Accounts Payable**: Flag for invoice review
- **Notification System**: Send alerts to stakeholders

---

### UC-GRN-013: View Financial Summary

**Primary Actor**: AP Clerk
**Priority**: High
**FR Reference**: FR-GRN-009

**Description**: User views complete financial breakdown of GRN with tax details and accounting preview.

**Preconditions**:
- GRN exists (any status)
- User has view permission
- Financial calculations complete

**Postconditions**:
- User understands financial totals and breakdown
- Ready to match against vendor invoice

**Main Flow**:

1. User opens GRN detail page
2. User navigates to "Financial Summary" tab
3. System displays financial sections:

   **Section A: Line Items Totals**
   - Subtotal: Sum of (Qty × Unit Price) for all items
   - Discount: Sum of line discounts
   - Net Amount: Subtotal - Discount
   - Tax Amount: Sum of line taxes
   - Items Total: Net + Tax

   **Section B: Extra Costs**
   - List of extra costs with type and amount
   - Extra Costs Total

   **Section C: GRN Total**
   - Grand Total: Items Total + Extra Costs
   - Display in transaction currency
   - Display in base currency (if different)

   **Section D: Tax Breakdown**
   - Table with columns: Tax Rate | Taxable Amount | Tax Amount
   - One row per tax rate
   - Total row

   **Section E: Journal Voucher Preview**
   - JV Type: GRN
   - JV Number: Auto-generated (if committed)
   - JV Date: Receipt date
   - Table with columns: Account Code | Account Name | Debit | Credit
   - Example entries:
     - Debit: 1300 - Inventory | $1,000.00 | -
     - Debit: 1450 - Input VAT | $100.00 | -
     - Credit: 2100 - Accounts Payable | - | $1,100.00
   - Total row: Debit = Credit
   - Status: Posted (if committed) or Preview (if not)

4. User can click "Expand" to see line-by-line financial details
5. User can export financial summary to PDF or Excel

**Alternative Flows**:

**A1: Multi-Currency GRN**
- 3a. GRN in foreign currency
- 3b. System displays both currencies side-by-side:
   - Transaction Currency column
   - Base Currency column
   - Exchange rate displayed
- 3c. JV preview shows base currency amounts

**A2: Consignment GRN**
- 3e. GRN marked as consignment
- 3e2. JV preview shows:
   - Debit: Consignment Inventory
   - Credit: Consignment Payable (not regular AP)

**A3: Cash Purchase GRN**
- 3e. GRN marked as cash purchase
- 3e2. JV preview shows:
   - Debit: Inventory
   - Credit: Cash Book (not AP)

**A4: Multiple Tax Rates**
- 3d. Line items have different tax rates (0%, 5%, 10%)
- 3d. Tax Breakdown shows separate row for each rate
- Example:
   - 0% Tax: $100.00 | $0.00
   - 5% Tax: $200.00 | $10.00
   - 10% Tax: $300.00 | $30.00
   - Total: $600.00 | $40.00

**Exception Flows**:

**E1: Financial Calculations Incomplete**
- 3a. Extra costs not yet distributed
- 3b. System displays warning: "Extra costs pending distribution"
- 3c. Line item totals shown without extra costs
- 3d. Grand total excludes extra costs until distributed

**E2: JV Posting Failed**
- 3e. GRN committed but JV posting failed
- 3e2. System displays error: "JV posting failed - [reason]"
- 3e3. JV Preview shown but status = "Failed"
- 3e4. User must contact finance to resolve

**E3: Tax Configuration Missing**
- 3d. Tax rate assigned but GL account not configured
- 3d. System displays warning: "Tax account not configured for [rate]%"
- 3d. Tax breakdown shown but JV preview incomplete

**Business Rules**:
- BR-GRN-004: All financial calculations follow standard formulas
- Financial amounts rounded to 2 decimal places
- Currency precision per currency settings (0-4 decimals)
- Tax amounts calculated on net (after discount)
- Extra costs distributed before final totals

**UI Requirements**:
- Amounts formatted with thousand separators and currency symbol
- Color coding: Debit (blue), Credit (red), Total (bold)
- Expandable/collapsible sections for cleaner view
- Export button exports all sections to single PDF/Excel
- Responsive table for mobile view

**Integration Points**:
- **General Ledger**: Fetch GL account codes and names
- **Tax Configuration**: Fetch tax rates and associated GL accounts
- **Currency**: Fetch exchange rates for conversion

---

### UC-GRN-014: View Stock Movements

**Primary Actor**: Storekeeper
**Priority**: High
**FR Reference**: FR-GRN-008

**Description**: User views all stock movements generated from GRN commit.

**Preconditions**:
- GRN exists in COMMITTED status
- Stock movements created during commit

**Postconditions**:
- User understands inventory impact of GRN
- Can verify stock movements are correct

**Main Flow**:

1. User opens GRN detail page (status = COMMITTED)
2. User navigates to "Stock Movements" tab
3. System retrieves all stock movements linked to GRN
4. System displays stock movements table:
   - **Movement Number**: Auto-generated ID
   - **Line Number**: GRN line reference
   - **Product Code & Name**
   - **Quantity**: Received quantity
   - **Unit**: Unit of measure
   - **Location**: Storage location
   - **Batch/Lot**: If applicable
   - **Movement Date**: GRN commit date
   - **Created By**: User who committed GRN
   - **Status**: POSTED
5. User can click on movement number to view details
6. System displays summary:
   - Total movements: X
   - Total items moved: Y units
   - Locations affected: Z
7. User can filter movements by:
   - Location
   - Product
   - Date range
8. User can export stock movements to Excel

**Alternative Flows**:

**A1: Batch/Lot Tracked Items**
- 4a. Product requires batch/lot tracking
- 4b. Table shows Batch/Lot columns
- 4c. Can click batch number to view batch details

**A2: Multiple Locations**
- 4a. GRN has items going to different locations
- 4b. Movements grouped by location for clarity
- 4c. Can expand/collapse location groups

**A3: GRN Not Yet Committed**
- 1a. GRN status = RECEIVED or DRAFT
- 3a. No stock movements exist
- 3b. System displays message: "Stock movements will be created when GRN is committed"
- 3c. Tab shows "Preview" mode with expected movements

**A4: GRN Voided**
- 1a. GRN status = VOID
- 3a. Original stock movements and reversal movements both exist
- 3b. System displays both:
   - Original movements (crossed out)
   - Reversal movements (highlighted)
- 3c. Net effect = 0

**Exception Flows**:

**E1: Stock Movements Missing**
- 3a. GRN status = COMMITTED but no stock movements found
- 3b. System displays error: "Stock movements not found. Please contact administrator."
- 3c. System flags GRN for admin review

**E2: Movement Quantity Mismatch**
- 4a. Stock movement quantity ≠ GRN line item quantity
- 4b. System highlights discrepancy in red
- 4c. System displays warning: "Quantity mismatch detected"
- 4d. User contacts administrator to investigate

**Business Rules**:
- BR-GRN-007: Stock movements created only when status = COMMITTED
- One stock movement per line item
- Movement quantity = Received quantity (not including rejected/damaged)
- Stock movements read-only (cannot be edited directly)
- Reversal requires voiding entire GRN

**UI Requirements**:
- Table with fixed header for scrolling long lists
- Batch/Lot columns hidden if not applicable
- Color coding: Posted (green), Reversed (red)
- Export includes all movement details

**Integration Points**:
- **Inventory Management**: Retrieve stock movement records
- **Product Catalog**: Retrieve product names and details

---

### UC-GRN-015: Add Comments

**Primary Actor**: All Users
**Priority**: Medium
**FR Reference**: FR-GRN-012

**Description**: User adds text comments to GRN for communication and documentation.

**Preconditions**:
- GRN exists (any status)
- User has view permission (minimum)

**Postconditions**:
- Comment added to GRN
- Comment visible to all users with access
- Activity log records comment addition

**Main Flow**:

1. User opens GRN detail page
2. User navigates to "Comments & Attachments" tab
3. System displays comments section:
   - List of existing comments (newest first)
   - Comment entry box at top
4. User enters comment text (rich text editor)
5. User can format text:
   - Bold, italic, underline
   - Bullet lists
   - @mention other users
6. User clicks "Post Comment" button
7. System validates:
   - Comment not empty
   - Comment ≤ 5000 characters
8. System saves comment:
   - Comment text
   - Created by (current user)
   - Created timestamp
   - Associated GRN ID
9. System displays comment in list:
   - User avatar
   - User name
   - Timestamp (relative: "2 hours ago")
   - Comment text
10. System sends notifications:
    - Email to @mentioned users
    - Email to GRN creator (if different)
11. System creates activity log entry: "Comment added by [user]"

**Alternative Flows**:

**A1: Edit Own Comment**
- 9a. User clicks "Edit" on own comment (within 15 minutes)
- 9b. System enables edit mode
- 9c. User modifies text
- 9d. User clicks "Save"
- 9e. System updates comment
- 9f. System adds "(edited)" label

**A2: Delete Own Comment**
- 9a. User clicks "Delete" on own comment
- 9b. System displays confirmation: "Delete comment?"
- 9c. User confirms
- 9d. System removes comment
- 9e. System creates activity log entry: "Comment deleted by [user]"

**A3: @Mention User**
- 5a. User types "@" symbol
- 5b. System displays autocomplete list of users
- 5c. User selects user from list
- 5d. System inserts user mention (highlighted)
- 10a. System sends email to mentioned user: "[User] mentioned you in GRN [number]"

**A4: Reply to Comment**
- 9a. User clicks "Reply" on existing comment
- 9b. System displays reply box under comment
- 9c. User enters reply
- 9d. Reply indented under original comment

**Exception Flows**:

**E1: Comment Too Long**
- 7a. Comment exceeds 5000 characters
- 7b. System displays error: "Comment too long (5000 character limit)"
- 7c. System shows character counter
- 7d. User reduces text length

**E2: Empty Comment**
- 7a. User clicks "Post Comment" with empty text
- 7b. System ignores action (button disabled until text entered)

**E3: Cannot Edit Others' Comments**
- 9a. User tries to edit another user's comment
- 9b. Edit/Delete buttons not visible (admin exception)

**E4: Edit Timeout**
- 9a. User tries to edit comment after 15 minutes
- 9b. System disables edit option
- 9c. User must add new comment with correction

**Business Rules**:
- All users can add comments to GRNs they can view
- Can edit own comments within 15 minutes
- Can delete own comments (comment removed, not hidden)
- Admin can delete any comment
- Comments retained even if GRN voided

**UI Requirements**:
- Rich text editor with formatting toolbar
- Character counter (live)
- @mention autocomplete
- Comments threaded for replies
- Timestamp shows relative time ("2 hours ago", "yesterday")

**Integration Points**:
- **User Management**: Retrieve user list for @mentions
- **Notification System**: Send emails to mentioned users

---

### UC-GRN-016: Upload Attachments

**Primary Actor**: Receiving Clerk
**Priority**: Medium
**FR Reference**: FR-GRN-012

**Description**: User uploads supporting documents (invoices, delivery notes, photos) to GRN.

**Preconditions**:
- GRN exists (any status)
- User has edit permission
- Files to upload exist

**Postconditions**:
- Attachments uploaded and linked to GRN
- Files accessible to authorized users
- Activity log records upload

**Main Flow**:

1. User opens GRN detail page
2. User navigates to "Comments & Attachments" tab
3. System displays attachments section:
   - List of existing attachments
   - "Upload File" button
4. User clicks "Upload File" button
5. System displays file upload dialog:
   - Drag-and-drop area
   - "Browse Files" button
   - **Document Type**: Dropdown (Invoice, Delivery Note, Packing List, Photo, Other)
   - **Description**: Text field (optional)
   - Supported formats: PDF, JPG, PNG, XLSX (max 10MB)
6. User selects file(s) via:
   - Drag-and-drop to upload area
   - Browse file system
7. User can upload multiple files at once
8. User selects document type for each file
9. User optionally enters description
10. User clicks "Upload" button
11. System validates each file:
    - File size ≤ 10MB
    - File type in allowed list (PDF, JPG, PNG, XLSX)
    - Virus scan passed
12. System uploads files:
    - Saves to secure storage
    - Generates unique file ID
    - Records metadata:
      - Original filename
      - Document type
      - Description
      - File size
      - Uploaded by (user)
      - Upload timestamp
13. System displays uploaded files in attachments list:
    - File icon (based on type)
    - Filename
    - Document type badge
    - File size
    - Uploaded by and date
    - [Download] [Delete] buttons
14. System creates activity log entry: "Attachment uploaded by [user]: [filename]"

**Alternative Flows**:

**A1: Preview Image**
- 13a. User clicks on image file (JPG, PNG)
- 13b. System displays image preview modal
- 13c. User can zoom, rotate image
- 13d. User can download or delete from preview

**A2: Download Attachment**
- 13a. User clicks "Download" button
- 13b. System streams file to user's browser
- 13c. File downloads with original filename

**A3: Delete Attachment**
- 13a. User clicks "Delete" button on own attachment
- 13b. System displays confirmation: "Delete [filename]?"
- 13c. User confirms
- 13d. System deletes file from storage
- 13e. System removes from attachments list
- 13f. System creates activity log entry: "Attachment deleted: [filename]"

**A4: Multiple Files Upload**
- 6a. User selects 5 files at once
- 11a. System validates all files in batch
- 12a. System uploads all files concurrently
- 12b. System shows progress bar for each file
- 13a. System displays all uploaded files

**Exception Flows**:

**E1: File Too Large**
- 11a. File size exceeds 10MB limit
- 11b. System displays error: "[filename] exceeds 10MB limit"
- 11c. File excluded from upload
- 11d. Other valid files continue uploading

**E2: Invalid File Type**
- 11a. User uploads .exe or .zip file
- 11b. System displays error: "File type not allowed: [extension]"
- 11c. System suggests allowed types
- 11d. File excluded from upload

**E3: Virus Detected**
- 11a. Virus scan detects malware
- 11b. System quarantines file
- 11c. System displays error: "File failed security scan"
- 11d. Admin notified
- 11e. File not uploaded

**E4: Upload Failure**
- 12a. Network error during upload
- 12b. System retries upload (3 attempts)
- 12c. If fails, system displays error: "Upload failed. Please try again."
- 12d. User can retry upload

**E5: Storage Quota Exceeded**
- 12a. GRN attachment storage limit reached (100MB per GRN)
- 12b. System displays error: "Storage limit exceeded. Delete old attachments or contact admin."
- 12c. Upload cancelled

**E6: Cannot Delete Others' Attachments**
- 13a. User tries to delete another user's attachment
- 13b. Delete button not visible (admin exception)

**Business Rules**:
- Supported formats: PDF, JPG, PNG, XLSX
- Max file size: 10MB per file
- Max total attachments: 100MB per GRN
- Can delete own attachments only (except admin)
- Attachments retained even if GRN voided
- Virus scanning required for all uploads

**UI Requirements**:
- Drag-and-drop upload area with visual feedback
- Progress bars for upload status
- File type icons for visual identification
- Image thumbnails for photos
- Inline PDF preview (if browser supports)

**Integration Points**:
- **File Storage**: Save files to secure cloud storage or server
- **Virus Scanning**: Scan all uploads for malware
- **User Management**: Validate user permissions

---

### UC-GRN-017: View Activity Log

**Primary Actor**: Financial Controller
**Priority**: Medium
**FR Reference**: FR-GRN-013

**Description**: User views complete audit trail of all changes to GRN.

**Preconditions**:
- GRN exists (any status)
- User has view permission (audit access)

**Postconditions**:
- User understands full change history of GRN
- Audit requirements satisfied

**Main Flow**:

1. User opens GRN detail page
2. User navigates to "Activity Log" tab
3. System retrieves all activity log entries for GRN
4. System displays activity log table:
   - **Timestamp**: Date and time of action (newest first)
   - **User**: Who performed the action
   - **Action**: Type of action performed
   - **Description**: Details of the change
   - **IP Address**: User's IP (if audit requirement)
5. System displays filter options:
   - Filter by action type
   - Filter by user
   - Filter by date range
6. System displays summary:
   - Total actions: X
   - First action: [date] by [user]
   - Last action: [date] by [user]
7. User can export activity log to Excel/PDF

**Activity Types Logged**:

**Creation**:
- "GRN created by [user]"
- "Created from PO [numbers]" or "Created manually"

**Status Changes**:
- "Status changed from [old] to [new] by [user]"
- "GRN committed by [user]"
- "GRN voided by [user] - Reason: [reason]"

**Header Changes**:
- "Header updated by [user] - [fields changed]"
- "Currency changed from [old] to [new] by [user]"
- "Invoice number updated to [number] by [user]"

**Line Item Changes**:
- "Item [product] added by [user]"
- "Item [product] updated by [user] - [fields changed]"
- "Item [product] deleted by [user]"
- "Quantity changed from [old] to [new] for [product]"

**Extra Costs**:
- "Extra cost added by [user]: [type] $[amount]"
- "Extra cost updated by [user]: [details]"
- "Extra cost deleted by [user]"

**Comments & Attachments**:
- "Comment added by [user]"
- "Attachment uploaded by [user]: [filename]"
- "Attachment deleted by [user]: [filename]"

**System Actions**:
- "Stock movements created - [count] movements"
- "Journal voucher posted - JV-[number]"
- "PO status updated - PO-[number] to [status]"

**Alternative Flows**:

**A1: Filter by Action Type**
- 5a. User selects "Status Changes" filter
- 5b. System displays only status change entries
- 5c. Other entries hidden

**A2: Filter by User**
- 5a. User selects specific user from dropdown
- 5b. System displays only actions by that user

**A3: Date Range Filter**
- 5a. User selects date range (from/to)
- 5b. System displays actions within range

**A4: View Change Details**
- 4a. User clicks "View Details" on entry
- 4b. System displays modal with full change details:
   - Before/after values for fields
   - Associated records affected
   - Related system actions

**Exception Flows**:

**E1: Activity Log Empty**
- 3a. GRN just created, no actions yet
- 3b. System displays message: "No activity yet"
- 3c. Shows creation entry only

**E2: Activity Log Corrupted**
- 3a. Activity log data missing or corrupted
- 3b. System displays warning: "Activity log incomplete"
- 3c. Shows available entries
- 3d. Admin notified to investigate

**Business Rules**:
- All actions automatically logged (no manual logging)
- Activity log is immutable (cannot edit/delete entries)
- Log retained even if GRN voided or deleted
- Timestamp accurate to second
- System actions logged alongside user actions

**UI Requirements**:
- Table sortable by timestamp (default: newest first)
- Color coding: Creation (blue), Changes (yellow), Deletions (red), System (gray)
- Expandable rows for detailed change info
- Filter badges show active filters
- Export includes all columns and details

**Integration Points**:
- **User Management**: Retrieve user details for display
- **Audit System**: Central audit logging service

---

### UC-GRN-018: Perform Bulk Actions

**Primary Actor**: Receiving Clerk
**Priority**: Low
**FR Reference**: FR-GRN-014

**Description**: User performs actions on multiple line items simultaneously for efficiency.

**Preconditions**:
- GRN exists in DRAFT or RECEIVED status
- Multiple line items exist
- User has edit permission

**Postconditions**:
- Selected items updated with bulk action
- Activity log records bulk action

**Main Flow**:

1. User opens GRN detail page
2. User navigates to "Items" tab
3. User clicks "Edit" mode button
4. System displays checkboxes for each line item
5. User selects multiple items via checkboxes
6. System displays bulk action toolbar:
   - Selected count: "X items selected"
   - Bulk action dropdown: [Select Action]
   - [Apply] button
7. User selects action from dropdown:
   - **Delete Selected**: Remove all selected items
   - **Set Location**: Apply same storage location to all
   - **Set Discount**: Apply same discount rate to all
   - **Mark as Accepted**: Set received = ordered for all
8. User clicks "Apply" button
9. If action requires input:
   - System displays input dialog
   - Example: "Set Location" shows location dropdown
   - User selects value
   - User confirms
10. System displays confirmation:
    - "Apply [action] to X items?"
    - [Cancel] [Confirm] buttons
11. User clicks "Confirm"
12. System applies action to all selected items
13. System recalculates financial totals if needed
14. System creates activity log entry: "Bulk action by [user]: [action] applied to X items"
15. System displays success message: "[Action] applied to X items"
16. System refreshes items table
17. System clears selection

**Alternative Flows**:

**A1: Select All Items**
- 5a. User clicks "Select All" checkbox in header
- 5b. System selects all line items
- 5c. Selected count updates: "All X items selected"

**A2: Deselect All**
- 5a. User clicks "Select All" checkbox again (toggle)
- 5b. System deselects all items
- 5c. Bulk action toolbar hides

**A3: Cancel Bulk Action**
- 11a. User clicks "Cancel" in confirmation
- 11b. System closes dialog without changes
- 11c. Items remain selected for different action

**A4: Partial Success**
- 12a. Action succeeds for some items, fails for others
- 12b. Example: Delete fails if item has stock movement
- 12c. System displays summary:
   - "Action applied to X items"
   - "Failed for Y items: [reasons]"
- 12d. Failed items remain selected for retry

**Exception Flows**:

**E1: No Items Selected**
- 6a. User clicks bulk action without selecting items
- 6b. Bulk action dropdown disabled
- 6c. System displays hint: "Select items to perform bulk actions"

**E2: Incompatible Selection**
- 12a. Selected items have conflicting properties
- Example: Different UOMs for "Set Location"
- 12b. System displays error: "Cannot apply action to items with different [property]"
- 12c. User must refine selection

**E3: Validation Errors**
- 12a. Bulk action violates business rules
- Example: Setting location to inactive location
- 12b. System displays errors for each item
- 12c. Action not applied to any items
- 12d. User corrects issues and retries

**E4: GRN Status Changed**
- 12a. GRN committed while user editing
- 12b. System detects status change
- 12c. System displays error: "GRN has been committed. Bulk actions not allowed."
- 12d. System reloads page

**Business Rules**:
- Cannot perform bulk actions on COMMITTED or VOID GRN
- Delete action requires confirmation
- Bulk discount applies to all selected, overwriting individual discounts
- "Mark as Accepted" sets received = ordered quantity
- Selection persists during session (until action or cancel)

**UI Requirements**:
- Checkboxes appear only in edit mode
- Bulk action toolbar sticky at top when scrolling
- Selected item count badge prominently displayed
- Actions disabled until items selected
- Confirmation dialog lists affected items (if ≤10 items)

**Integration Points**:
- Same as individual item operations (UC-GRN-007, UC-GRN-008, UC-GRN-009)

---

## 4. Use Case Relationships

### Use Case Diagram (Text Representation)

```
                         GRN Module Use Cases

Actors                          Primary Use Cases
------                          -----------------

Receiving Clerk ───────────── UC-GRN-001: View GRN List
      │                        UC-GRN-002: Filter and Search
      │                        UC-GRN-003: Create from Single PO
      │                        UC-GRN-004: Create from Multiple POs
      │                        UC-GRN-005: Create Manual GRN
      │                        UC-GRN-006: Edit Header
      │                        UC-GRN-007: Add Line Items
      │                        UC-GRN-008: Edit Line Items
      │                        UC-GRN-009: Delete Line Items
      │                        UC-GRN-018: Bulk Actions
      │                        UC-GRN-021: Print GRN
      │
Storekeeper ──────────────── UC-GRN-011: Commit GRN
      │                        UC-GRN-014: View Stock Movements
      │
AP Clerk ─────────────────── UC-GRN-010: Add Extra Costs
      │                        UC-GRN-013: View Financial Summary
      │                        UC-GRN-022: Consignment Receipt
      │                        UC-GRN-023: Cash Purchase
      │
Purchasing Manager ──────── UC-GRN-012: Void GRN
      │
Financial Controller ────── UC-GRN-017: View Activity Log
      │
All Users ────────────────── UC-GRN-015: Add Comments
                              UC-GRN-016: Upload Attachments
                              UC-GRN-019: Export to PDF
                              UC-GRN-020: Export to Excel

System ─────────────────── (Auto-generate GRN numbers)
                              (Create stock movements)
                              (Post journal vouchers)
                              (Update PO statuses)
                              (Send notifications)
```

### Include Relationships

- UC-GRN-003, UC-GRN-004, UC-GRN-005 **include** UC-GRN-006 (Edit Header)
- UC-GRN-003, UC-GRN-004, UC-GRN-005 **include** UC-GRN-007 (Add Line Items)
- UC-GRN-011 (Commit GRN) **includes** UC-GRN-014 (View Stock Movements)

### Extend Relationships

- UC-GRN-007 (Add Line Items) **extends to** UC-GRN-018 (Bulk Actions)
- UC-GRN-011 (Commit GRN) **extends to** UC-GRN-012 (Void GRN)

---

## 5. Cross-References

### FR to UC Mapping

| Functional Requirement | Related Use Cases |
|------------------------|-------------------|
| FR-GRN-001: GRN List Management | UC-GRN-001, UC-GRN-002 |
| FR-GRN-002: Create from PO | UC-GRN-003, UC-GRN-004 |
| FR-GRN-003: Manual Creation | UC-GRN-005 |
| FR-GRN-004: Header Information | UC-GRN-006 |
| FR-GRN-005: Line Items | UC-GRN-007, UC-GRN-008, UC-GRN-009 |
| FR-GRN-006: Multi-PO Support | UC-GRN-004 |
| FR-GRN-007: Extra Costs | UC-GRN-010 |
| FR-GRN-008: Stock Movement | UC-GRN-011, UC-GRN-014 |
| FR-GRN-009: Financial Summary | UC-GRN-013 |
| FR-GRN-010: Status Workflow | UC-GRN-011, UC-GRN-012 |
| FR-GRN-011: Multi-Currency | UC-GRN-006, UC-GRN-010 |
| FR-GRN-012: Comments & Attachments | UC-GRN-015, UC-GRN-016 |
| FR-GRN-013: Activity Log | UC-GRN-017 |
| FR-GRN-014: Bulk Actions | UC-GRN-018 |
| FR-GRN-015: Export & Print | UC-GRN-019, UC-GRN-020, UC-GRN-021 |
| FR-GRN-017: Consignment & Cash | UC-GRN-022, UC-GRN-023 |

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-02 | System Analyst | Initial UC document based on BR analysis |

**Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Analyst | | | |
| Project Manager | | | |
| Development Lead | | | |
