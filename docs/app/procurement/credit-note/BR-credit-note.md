# Business Requirements: Credit Note

## Module Information
- **Module**: Procurement
- **Sub-Module**: Credit Note (CN)
- **Route**: `/procurement/credit-note`
- **Version**: 1.0.4
- **Last Updated**: 2025-12-03
- **Owner**: Procurement Team
- **Status**: Active

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.4 | 2025-12-03 | Documentation Team | Added Periodic Average Cost as configurable costing method option alongside FIFO |
| 1.0.3 | 2025-12-03 | Documentation Team | Added cross-references to Shared Methods (Inventory Valuation, Inventory Operations) |
| 1.0.2 | 2025-12-03 | Documentation Team | Added Backend Requirements section (BR-BE-001 to BR-BE-014) to document server actions needed to support existing UI features |
| 1.0.1 | 2025-12-03 | Documentation Team | Document history update for consistency across documentation set |
| 1.0.0 | 2025-11-01 | Documentation Team | Initial version from source code analysis |


## Overview

The Credit Note module is a critical financial component of the procurement system that manages vendor credits resulting from returns, pricing adjustments, damaged goods, and billing errors. This module serves as the bridge between Goods Received Notes (GRN) and accounts payable, ensuring accurate financial reconciliation when purchased goods are returned or credits are issued.

The Credit Note system supports two distinct workflows: quantity-based returns (linked to specific GRN items and lots) and amount-only discounts (pricing adjustments without physical returns). It handles multi-currency transactions, tax adjustments, lot-based inventory tracking, and automatic financial postings upon credit note commitment.

This module is essential for hospitality operations, managing vendor credits for everything from damaged kitchen equipment and spoiled food items to pricing errors and negotiated discounts, ensuring all credits are properly documented and reflected in inventory and financial records.

## Business Objectives

1. **Accurate Credit Recording**: Provide a reliable system for documenting all vendor credits with complete traceability and justification
2. **Inventory Reconciliation**: Automatically adjust inventory levels and lot tracking when goods are returned to vendors
3. **Financial Accuracy**: Generate accurate financial records including journal vouchers and tax adjustments for all credits
4. **Multi-Currency Support**: Handle international vendor transactions with automatic currency conversion and exchange rate tracking
5. **Audit Trail**: Maintain comprehensive activity logs for all credit note operations to support compliance and audits
6. **Configurable Costing Method**: Apply system-configured costing methodology (FIFO or Periodic Average) for accurate cost of goods calculations on returns
7. **Tax Compliance**: Properly calculate and adjust input VAT for all credit transactions
8. **Vendor Accountability**: Track credit reasons and patterns to identify vendor performance issues
9. **Lot Tracking**: Maintain detailed lot-level tracking for items being returned or credited

## Key Stakeholders

- **Primary Users**: Accounts payable clerks, purchasing staff, receiving clerks
- **Secondary Users**: Finance managers, warehouse staff, department managers
- **Administrators**: System administrators, finance administrators
- **Reviewers**: Internal auditors, tax compliance team, vendor relationship managers
- **Support**: IT support team, finance support

---

## Functional Requirements

### FR-CN-001: Credit Note List and Overview
**Priority**: Critical

The system must provide a comprehensive list view of all Credit Notes with sorting, filtering, and search capabilities to enable staff to quickly locate and manage credit records.

**Acceptance Criteria**:
- Display all Credit Note records in a sortable, filterable data table
- Show key information: Credit Note number, date, vendor, status, total amount, reason
- Support filtering by status (Draft, Committed, Voided)
- Support filtering by date range, vendor, credit type, reason
- Provide search functionality across credit note number, vendor name, description
- Display row actions for view, edit, delete, commit operations
- Show visual status indicators with color coding (Draft: gray, Committed: green, Void: red)
- Support both card view and table view display modes
- Enable bulk operations on selected credit notes (delete)

**Related Requirements**: FR-CN-002, FR-CN-003, FR-CN-004

---

### FR-CN-002: Create Quantity-Based Credit Note (Item Return)
**Priority**: Critical

The system must support creating credit notes for physical returns of goods, linked to specific GRN items and inventory lots with system-configured costing method.

**Acceptance Criteria**:
- Provide vendor selection interface to filter applicable GRNs
- Display GRNs for selected vendor with invoice references
- Allow selection of GRN and its line items for credit
- Support lot-level selection with cost layer tracking (FIFO or Periodic Average based on system configuration)
- Calculate unit cost based on configured costing method
- Calculate cost variance between current price and historical cost
- Calculate realized gain/loss on return
- Track return quantity per item and lot
- Generate negative stock movements to reduce inventory
- Auto-populate item details from selected GRN (description, unit price, location)
- Generate unique credit note number following format: CN-YYMM-NNNN
- Set credit note type to QUANTITY_RETURN

**Related Requirements**: FR-CN-005, FR-CN-006, FR-CN-008, FR-CN-009

---

### FR-CN-003: Create Amount-Only Credit Note (Pricing Adjustment)
**Priority**: High

The system must support creating credit notes for pricing adjustments or discounts without physical return of goods.

**Acceptance Criteria**:
- Provide vendor selection interface
- Allow selection of GRN reference for credit justification
- Support manual entry of discount amount per line item
- Calculate tax impact based on discount amount
- No stock movement generated (goods not physically returned)
- Generate journal entries for accounts payable and tax adjustment only
- Support credit reason selection (PRICING_ERROR, DISCOUNT_AGREEMENT, OTHER)
- Set credit note type to AMOUNT_DISCOUNT
- Allow multi-line discounts within single credit note

**Related Requirements**: FR-CN-006, FR-CN-010

---

### FR-CN-004: Credit Note Detail View
**Priority**: Critical

The system must provide a comprehensive detail view showing all credit note information with tabs for different data categories.

**Acceptance Criteria**:
- Display credit note header with all key fields (number, date, vendor, status, type, reason)
- Show currency and exchange rate for multi-currency credits
- Display invoice and tax invoice references
- Display GRN reference with link to source GRN
- Provide tabbed interface with following tabs:
  * Items: Line items with quantities, prices, lot information
  * Stock Movement: Inventory adjustments by lot and location
  * Journal Entries: Financial postings with account codes
  * Tax Entries: Tax adjustments with VAT calculations
  * Inventory: Impact on inventory values and quantities
  * Attachments: Uploaded supporting documents
- Show status badge with visual indicator (Draft, Committed, Void)
- Display action buttons based on status (Edit, Delete, Commit, Print, Send)
- Show side panel toggle for additional information display
- Display audit information (created by, created date, updated by, updated date, committed by, committed date)

**Related Requirements**: FR-CN-001, FR-CN-002, FR-CN-003

---

### FR-CN-005: Vendor and GRN Selection Workflow
**Priority**: Critical

The system must provide an intuitive workflow for selecting vendor and associated GRNs when creating credit notes.

**Acceptance Criteria**:
- Step 1: Vendor Selection
  * Display vendor list with search capability
  * Show vendor code, name, contact information
  * Filter active vendors only
  * Allow selection of single vendor
- Step 2: GRN Selection
  * Display GRNs for selected vendor
  * Show GRN number, date, invoice number, total amount
  * Provide search functionality on GRN number and invoice number
  * Filter committed GRNs only (exclude Draft and Void)
  * Allow selection of single GRN
  * Display GRN status and date
- Navigation: Back button to return to vendor selection
- Validation: Cannot proceed without vendor and GRN selection

**Related Requirements**: FR-CN-002, FR-CN-003

---

### FR-CN-006: Item and Lot Selection with Inventory Costing
**Priority**: Critical

The system must support detailed item and lot selection with cost tracking based on the system-configured costing method (FIFO or Periodic Average) for accurate financial calculations.

**Acceptance Criteria**:
- Display all line items from selected GRN
- Show item details: product name, description, location, order quantity, unit price, order unit, inventory unit
- Display current costing method indicator (FIFO or Periodic Average) from system configuration
- Allow selection of items to credit via checkboxes
- For QUANTITY_RETURN type:
  * Display lot information for each item (lot number, receive date, quantity, unit cost)
  * Allow selection of specific lots to return from
  * Support entry of return quantity per item
  * Calculate cost summary based on configured method:
    **For FIFO Method:**
    - Total received quantity from all lots
    - Weighted average cost across selected lots (oldest layers first)
    - Cost breakdown by FIFO layer consumed
    **For Periodic Average Method:**
    - Average cost for the credit note's period
    - Period used for calculation (month/year)
    - Total quantity and value in period
    **Common Calculations:**
    - Current unit price from GRN
    - Cost variance (current price - calculated unit cost)
    - Return amount (return quantity × current price)
    - Cost of goods sold (return quantity × calculated unit cost)
    - Realized gain/loss (return amount - cost of goods sold)
  * Validate return quantity does not exceed available lot quantities
- For AMOUNT_DISCOUNT type:
  * Support entry of discount amount per item
  * No lot selection required
  * Calculate tax impact on discount
- Show expandable detail section for cost analysis with method-specific details
- Display summary totals at bottom

**Related Requirements**: FR-CN-002, FR-CN-009

---

### FR-CN-007: Stock Movement Generation
**Priority**: Critical

The system must automatically generate stock movement transactions when quantity-based credit notes are committed.

**Acceptance Criteria**:
- Generate stock movements only for QUANTITY_RETURN type credits
- Create negative quantity movements (reducing inventory)
- Track movements by lot number
- Include location information (warehouse, store, department)
- Record location type (INV for Inventory, CON for Consignment)
- Calculate costs using system-configured costing method:
  * Unit cost from FIFO layer (if FIFO) or period average (if Periodic Average)
  * Extra cost (if applicable)
  * Total cost (unit cost + extra cost) × quantity
- Link stock movements to credit note reference
- Update lot balance quantities
- Reduce inventory on hand by credit quantity
- Support multi-location returns within single credit note
- Validate sufficient lot quantity available before committing
- Generate movement reference number

**Related Requirements**: FR-CN-002, FR-CN-006

---

### FR-CN-008: Journal Entry Generation
**Priority**: Critical

The system must automatically generate and post journal voucher entries when credit notes are committed.

**Acceptance Criteria**:
- Generate journal entries for both credit note types:

  **For QUANTITY_RETURN**:
  * Debit: Accounts Payable (reduce liability)
  * Credit: Inventory - Raw Materials (reduce asset value)
  * Credit: Input VAT (reduce tax recoverable)
  * Debit: Inventory Cost Variance (if cost variance exists)
  * Credit: Inventory - Raw Materials (offset variance)

  **For AMOUNT_DISCOUNT**:
  * Debit: Accounts Payable (reduce liability)
  * Credit: Input VAT (reduce tax recoverable)
  * Credit: Purchase Discounts (or relevant income account)

- Include in each journal entry line:
  * Account code and name
  * Department code and name
  * Cost center
  * Description
  * Reference (credit note number, GRN number)
  * Debit or Credit amount
  * Tax code and rate (if applicable)
  * Order number (for entry sequence)

- Group entries logically:
  * Primary Entries (main credit adjustments)
  * Inventory Entries (stock value adjustments)
  * Tax Entries (VAT adjustments)

- Calculate and display totals:
  * Total Debit amount
  * Total Credit amount
  * Balance check (Debit = Credit)

- Set journal status to Committed when credit committed
- Link journal voucher to credit note reference
- Allow recalculation before committing
- Support department filtering in journal entry view

**Related Requirements**: FR-CN-009, FR-CN-012

---

### FR-CN-009: Tax Calculation and Adjustment
**Priority**: Critical

The system must accurately calculate tax impacts and generate tax adjustment entries for all credit transactions.

**Acceptance Criteria**:
- Calculate Input VAT adjustment based on credit amount
- Support standard VAT rate (18% or configured rate)
- Display tax summary:
  * Base Amount Impact (credit amount reducing taxable base)
  * Tax Rate (applicable VAT rate)
  * Tax Amount Impact (calculated VAT adjustment)
  * Original Base (from original GRN/invoice)
  * Original Tax (from original GRN/invoice)
- Show tax calculations section with:
  * Original transaction values (base, rate, tax)
  * Credit adjustment values (base, rate, tax)
  * Net impact (difference between original and adjusted)
- Display tax adjustments per line item:
  * Tax type (Input VAT)
  * Tax code (VAT18 or configured)
  * Description (Standard Rate VAT)
  * Base amount
  * Tax rate percentage
  * Tax amount
  * GL account code (1240 Input VAT or configured)
- Show VAT period information:
  * Period (month and year)
  * VAT return status (Open, Submitted, Filed)
  * Due date
  * Reporting code (BOX4 or relevant box)
- Link to tax invoice reference
- Support tax-exclusive and tax-inclusive credit scenarios
- Validate tax calculations before posting

**Related Requirements**: FR-CN-008, FR-CN-012

---

### FR-CN-010: Void Credit Note
**Priority**: High

The system must support voiding of committed credit notes with full reversal of all financial and inventory impacts.

**Acceptance Criteria**:
- Allow voiding only for credits in Committed status
- Require void reason and confirmation
- Generate reversal entries:
  * Reverse all stock movements (opposite sign quantities)
  * Reverse all journal entries (swap debits and credits)
  * Reverse tax adjustments
- Create reversal reference linking to original credit note
- Update credit note status to Void
- Maintain audit trail of void operation:
  * Voided by (user)
  * Voided date
  * Void reason
  * Reversal transaction references
- Mark credit note as read-only after voiding
- Display "VOID" watermark or indicator in printed documents
- Update lot balances (add back voided quantities)
- Update vendor accounts payable balance
- Support void authorization (require manager permission for large amounts)
- Cannot void a credit note that has been reconciled in bank statement

**Related Requirements**: FR-CN-011

---

### FR-CN-011: Credit Note Commitment
**Priority**: Critical

The system must support committing credit notes to post all financial and inventory transactions.

**Acceptance Criteria**:
- Allow commitment for Draft status credits (no approval required)
- Validate before commitment:
  * All required fields populated
  * Item quantities and amounts valid
  * Sufficient lot quantities available (for returns)
  * Journal entries balanced (debit = credit)
  * Tax calculations correct
  * Exchange rates valid (for foreign currency)
- Perform commitment in transaction:
  * Generate and post stock movements
  * Generate and post journal voucher
  * Generate and post tax adjustments
  * Update lot balances
  * Update inventory values
  * Update vendor accounts payable
  * Update credit note status to Committed
  * Record committed by and committed date
- Rollback all changes if any step fails
- Display success message with references:
  * Stock movement numbers
  * Journal voucher number
  * Tax adjustment reference
- Lock credit note for editing after commitment
- Send notification to accounts payable team
- Update vendor credit balance
- Generate audit log entry

**Related Requirements**: FR-CN-007, FR-CN-008, FR-CN-009, FR-CN-010

---

### FR-CN-012: Multi-Currency Support
**Priority**: High

The system must handle credit notes in foreign currencies with automatic conversion to base currency.

**Acceptance Criteria**:
- Display currency field with ISO code (USD, EUR, GBP, THB, etc.)
- Inherit currency from selected GRN
- Support exchange rate entry and update
- Auto-populate current exchange rate from system rates
- Allow manual override of exchange rate with reason
- Display amounts in both transaction currency and base currency
- Calculate all values in transaction currency:
  * Line item amounts
  * Tax amounts
  * Total credit amount
- Convert to base currency for:
  * Journal entry postings
  * Financial reporting
  * Vendor balance updates
- Store both currencies in database
- Display exchange rate information in header
- Validate exchange rate is positive number
- Record exchange rate source (manual, system, bank rate)
- Show conversion calculations in detail view

**Related Requirements**: FR-CN-008, FR-CN-011

---

### FR-CN-013: Credit Reason Management
**Priority**: High

The system must support categorization of credit notes by reason for analytics and vendor performance tracking.

**Acceptance Criteria**:
- Provide credit reason dropdown with predefined values:
  * PRICING_ERROR: Billing or pricing mistakes
  * DAMAGED_GOODS: Goods received in damaged condition
  * RETURN: Goods returned to vendor (quality issues, overstocking, etc.)
  * DISCOUNT_AGREEMENT: Negotiated discounts or rebates
  * OTHER: Other reasons (requires explanation)
- Make reason field mandatory
- Allow description field for additional explanation
- Track reason statistics by vendor:
  * Count of credits by reason
  * Total value by reason
  * Trend analysis over time
- Generate vendor performance reports using reason data
- Display reason prominently in credit note header
- Filter credit note list by reason
- Link reason to accounting treatment (some reasons may use different GL accounts)

**Related Requirements**: FR-CN-001, FR-CN-014

---

### FR-CN-014: Attachment Management
**Priority**: Medium

The system must support uploading and managing supporting documents for credit notes.

**Acceptance Criteria**:
- Allow upload of multiple attachments per credit note
- Support common file formats:
  * Documents: PDF, DOC, DOCX, XLS, XLSX
  * Images: JPG, PNG, GIF
  * Max file size: 10MB per file
- Store attachment metadata:
  * File name
  * File size
  * Upload date
  * Uploaded by (user)
  * File type
- Display attachments in dedicated tab
- Provide download functionality for each attachment
- Allow deletion of attachments (only in Draft status)
- Show attachment count indicator in list view
- Support drag-and-drop upload
- Validate file types and sizes before upload
- Scan for viruses before storing
- Common attachment types:
  * Vendor debit note
  * Photos of damaged goods
  * Email correspondence
  * Quality inspection reports
  * Delivery notes showing damages

**Related Requirements**: FR-CN-004

---

### FR-CN-015: Printing and Export
**Priority**: Medium

The system must support printing credit notes and exporting data for external use.

**Acceptance Criteria**:
- Generate printable credit note document with:
  * Company header and logo
  * Credit note number and date
  * Vendor information
  * Item details with quantities and prices
  * Tax calculations
  * Total credit amount
  * Terms and conditions
  * VOID watermark (if voided)
- Support PDF export
- Support Excel export of:
  * Credit note list with filters
  * Credit note details
  * Journal entries
  * Tax calculations
- Email credit note to vendor contact
- Print journal voucher for finance records
- Print stock movement report
- Include QR code linking to online credit note view
- Support batch printing of multiple credit notes

**Related Requirements**: FR-CN-004

---

## Business Rules

### General Rules

- **BR-CN-001**: Credit note numbers follow format CN-YYMM-NNNN where YY is 2-digit year and MM is month and NNNNNN is sequential number
- **BR-CN-002**: Credit note numbers must be unique system-wide and auto-generated
- **BR-CN-003**: Credit note date cannot be in the future
- **BR-CN-004**: Credit note date should not be more than 90 days after related GRN date (warning if exceeded)
- **BR-CN-005**: Vendor must be active in the system to create credit notes
- **BR-CN-006**: Only committed GRNs can be selected for credit note creation
- **BR-CN-007**: Credit note must reference exactly one GRN (no multi-GRN credits)
- **BR-CN-008**: Credit amount cannot exceed original GRN amount (cumulative across all credits for that GRN)

### Data Validation Rules

- **BR-CN-010**: All monetary amounts must be positive numbers with maximum 2 decimal places
- **BR-CN-011**: Quantities must be positive numbers with maximum 3 decimal places
- **BR-CN-012**: Exchange rates must be positive numbers with maximum 6 decimal places
- **BR-CN-013**: Tax rates must be between 0 and 100 percent
- **BR-CN-014**: Return quantity cannot exceed received quantity from selected lot
- **BR-CN-015**: Total credit amount must equal sum of line item amounts plus tax
- **BR-CN-016**: Journal entries must balance (total debits = total credits)
- **BR-CN-017**: Credit reason must be one of the predefined enum values
- **BR-CN-018**: Description field maximum length is 500 characters
- **BR-CN-019**: Notes field maximum length is 2000 characters

### Workflow Rules

- **BR-CN-020**: Only Draft status credits can be edited or deleted
- **BR-CN-021**: Committed credits cannot be edited (must be voided and recreated)
- **BR-CN-022**: Void operation requires manager authorization
- **BR-CN-023**: Status transitions must follow defined workflow (Draft → Committed → Void)
- **BR-CN-024**: Cannot delete Committed or Void credits (only Draft)

### Calculation Rules

- **BR-CN-030**: Inventory costing: Use system-configured costing method (FIFO or Periodic Average) to calculate unit cost
  - **FIFO**: Use weighted average cost across selected lots (oldest layers first)
  - **Periodic Average**: Use average cost for the credit note's period
- **BR-CN-031**: Cost variance = Current unit price - Calculated unit cost
- **BR-CN-032**: Return amount = Return quantity × Current unit price
- **BR-CN-033**: Cost of goods sold = Return quantity × Calculated unit cost
- **BR-CN-034**: Realized gain/loss = Return amount - Cost of goods sold
- **BR-CN-035**: Tax amount = Base amount × Tax rate / 100
- **BR-CN-036**: For multi-currency: Base currency amount = Transaction currency amount ×  Exchange rate
- **BR-CN-037**: Total credit = Sum of line amounts + Tax amount
- **BR-CN-038**: Stock movement value = Quantity × Unit cost

### Inventory Rules

- **BR-CN-040**: Stock movements generated only for QUANTITY_RETURN type credits
- **BR-CN-041**: Stock movements use negative quantities (reducing inventory)
- **BR-CN-042**: Lot quantities must be tracked and updated on credit posting
- **BR-CN-043**: Cannot post credit if insufficient lot quantity available
- **BR-CN-044**: Voided credits restore lot quantities (reverse stock movements)
- **BR-CN-045**: Stock movements must reference both credit note and original GRN
- **BR-CN-046**: Multiple lots can be referenced in single credit line item

### Financial Rules

- **BR-CN-050**: Journal entries post to Accounts Payable (reduce liability)
- **BR-CN-051**: Inventory credits post to Inventory GL account (reduce asset)
- **BR-CN-052**: Tax adjustments post to Input VAT account (reduce recoverable tax)
- **BR-CN-053**: Cost variances post to Cost Variance GL account
- **BR-CN-054**: All journal entries must have department and cost center
- **BR-CN-055**: Committed credits update vendor accounts payable balance
- **BR-CN-056**: Void reversals use same GL accounts as original with opposite signs
- **BR-CN-057**: Journal voucher number auto-generated and unique
- **BR-CN-058**: Credits committed in open accounting period only

### Security Rules

- **BR-CN-060**: Only purchasing staff and accounts payable can create credits
- **BR-CN-061**: Only system administrators can void Committed credits above $10,000
- **BR-CN-062**: Users can only view credits for their assigned departments (unless admin)
- **BR-CN-063**: Audit log must record all create, update, commit, void operations
- **BR-CN-064**: Cannot modify credit note created by another user (unless manager/admin)

### Location Type Business Rules

Credit note processing behavior varies based on the **location type** of the original GRN receiving location. The system supports three location types that determine whether inventory adjustments are created and how costs are reversed.

#### Location Type Definitions

| Location Type | Code | Purpose | Examples |
|---------------|------|---------|----------|
| **INVENTORY** | INV | Standard tracked warehouse locations | Main Warehouse, Central Kitchen Store |
| **DIRECT** | DIR | Direct expense locations (no stock balance) | Restaurant Bar Direct, Kitchen Direct |
| **CONSIGNMENT** | CON | Vendor-owned inventory locations | Beverage Consignment, Linen Consignment |

#### BR-CN-065: Location Type Processing Rules

**INVENTORY Locations (INV)**:
- ✅ Full credit note processing with inventory adjustment
- ✅ Reverses FIFO cost layer (oldest layers first)
- ✅ Decreases inventory asset balance
- ✅ GL: Debit Accounts Payable, Credit Inventory Asset
- ✅ Full stock movement recorded (negative quantities)
- ✅ Lot tracking maintained for return items

**DIRECT Locations (DIR)**:
- ❌ No inventory adjustment (no stock balance exists)
- ❌ No cost layer reversal
- ✅ Credit note for expense reversal only
- ✅ GL: Debit Accounts Payable, Credit Expense Reversal
- ⚠️ Items filtered out from stock movement display
- ⚠️ Alert displayed indicating expense reversal only

**CONSIGNMENT Locations (CON)**:
- ✅ Full credit note processing with inventory adjustment
- ✅ Reverses consignment cost layer
- ✅ Decreases vendor liability balance
- ✅ GL: Debit Vendor Liability, Credit Consignment Asset
- ✅ Full stock movement recorded with vendor reference
- ✅ Vendor notification of credit/return

#### BR-CN-066: Location Type Feature Matrix

| Feature | INVENTORY | DIRECT | CONSIGNMENT |
|---------|-----------|--------|-------------|
| **Inventory Adjustment** | ✅ Stock decrease | ❌ None | ✅ Stock decrease |
| **Cost Layer Reversal** | ✅ FIFO reversal | ❌ None | ✅ FIFO reversal |
| **Lot Selection** | ✅ Required | ❌ N/A | ✅ Required |
| **GL Posting** | AP vs Inventory | AP vs Expense | AP vs Vendor Liability |
| **Stock Movement** | ✅ Recorded | ❌ Filtered out | ✅ Recorded |
| **Vendor Notification** | Optional | Optional | ✅ Required |
| **Cost Variance** | ✅ Calculated | ❌ N/A | ✅ Calculated |
| **Realized Gain/Loss** | ✅ Recorded | ❌ N/A | ✅ Recorded |

#### BR-CN-067: Location Type Validation Rules

1. **Credit Type Restrictions**:
   - QUANTITY_RETURN from DIRECT location: Blocked (no stock to return)
   - AMOUNT_DISCOUNT from any location: Allowed (no inventory impact)
   - QUANTITY_RETURN from INVENTORY/CONSIGNMENT: Full processing

2. **UI Behavior**:
   - Location type badge displayed for GRN items
   - DIRECT location items disabled for quantity-based credits
   - Warning when creating credit for DIRECT location GRN
   - Stock movement tab filters DIRECT location items

3. **Lot Selection**:
   - INVENTORY: Must select from available lots
   - DIRECT: Lot selection disabled (no lots exist)
   - CONSIGNMENT: Must select from vendor-owned lots

---

## Conceptual Data Models

### Credit Note
Primary entity for vendor credit documentation.

**Key Fields**:
- `id` (integer, PK, auto-increment)
- `refNumber` (string, unique, format: CN-YYMM-NNNN)
- `docNumber` (string, unique, internal document tracking)
- `docDate` (date, credit note date)
- `creditType` (enum: QUANTITY_RETURN, AMOUNT_DISCOUNT)
- `status` (enum: DRAFT, COMMITTED, VOID)
- `reason` (enum: PRICING_ERROR, DAMAGED_GOODS, RETURN, DISCOUNT_AGREEMENT, OTHER)
- `description` (string, max 500)
- `notes` (string, max 2000)
- `vendorId` (integer, FK to Vendor)
- `vendorName` (string)
- `grnReference` (string, FK to GoodsReceiveNote)
- `grnDate` (date)
- `invoiceReference` (string)
- `invoiceDate` (date, nullable)
- `taxInvoiceReference` (string, nullable)
- `taxDate` (date, nullable)
- `currency` (string, ISO 4217 code, length 3)
- `exchangeRate` (decimal 15,6)
- `netAmount` (decimal 15,2)
- `taxAmount` (decimal 15,2)
- `totalAmount` (decimal 15,2)
- `committedBy` (string, nullable)
- `committedDate` (date, nullable)
- `voidedBy` (string, nullable)
- `voidedDate` (date, nullable)
- `voidReason` (string, nullable)
- `createdBy` (string)
- `createdDate` (date)
- `updatedBy` (string)
- `updatedDate` (date)

**Relationships**:
- One-to-Many with CreditNoteItem
- One-to-Many with CreditNoteAttachment
- Many-to-One with Vendor
- Many-to-One with GoodsReceiveNote
- One-to-Many with StockMovement (for QUANTITY_RETURN type)
- One-to-One with JournalVoucher

### CreditNoteItem
Line items within a credit note.

**Key Fields**:
- `id` (integer, PK, auto-increment)
- `creditNoteId` (integer, FK to CreditNote)
- `lineNumber` (integer, sequence within credit note)
- `productName` (string)
- `productDescription` (string)
- `location` (string)
- `lotNumber` (string, nullable)
- `grnNumber` (string, reference to source GRN)
- `grnDate` (date)
- `orderUnit` (string)
- `inventoryUnit` (string)
- `receivedQuantity` (decimal 15,3, from GRN)
- `creditQuantity` (decimal 15,3, quantity being credited)
- `unitPrice` (decimal 15,2)
- `creditAmount` (decimal 15,2, credit quantity × unit price)
- `discountAmount` (decimal 15,2, for AMOUNT_DISCOUNT type)
- `costVariance` (decimal 15,2, current price - calculated unit cost)
- `totalReceivedQuantity` (decimal 15,3, sum from lots)
- `taxRate` (decimal 5,2)
- `taxAmount` (decimal 15,2)
- `totalAmount` (decimal 15,2, credit amount + tax)

**Relationships**:
- Many-to-One with CreditNote
- Many-to-Many with InventoryLot (via AppliedLot)

### AppliedLot
Junction table linking credit note items to specific inventory lots.

**Key Fields**:
- `id` (integer, PK, auto-increment)
- `creditNoteItemId` (integer, FK to CreditNoteItem)
- `lotNumber` (string)
- `receiveDate` (date, lot creation date)
- `grnNumber` (string, GRN that created the lot)
- `invoiceNumber` (string, from original GRN)
- `lotQuantity` (decimal 15,3, quantity from this lot)
- `unitCost` (decimal 15,2, cost from lot based on configured costing method)

**Relationships**:
- Many-to-One with CreditNoteItem
- Many-to-One with InventoryLot

### CreditNoteAttachment
Supporting documents for credit notes.

**Key Fields**:
- `id` (integer, PK, auto-increment)
- `creditNoteId` (integer, FK to CreditNote)
- `fileName` (string)
- `fileSize` (integer, bytes)
- `fileType` (string, MIME type)
- `filePath` (string, storage location)
- `uploadDate` (date)
- `uploadedBy` (string, user ID)

**Relationships**:
- Many-to-One with CreditNote

---

## Backend Requirements

This section documents the server-side functionality required to support the existing UI features. These requirements define the server actions, API endpoints, and database operations needed for full system functionality.

### BR-BE-001: Credit Note CRUD Server Actions
**Priority**: Critical
**Supports UI**: Credit Note List, Detail View, Create/Edit Forms

The system must provide server actions for basic credit note operations.

**Required Server Actions**:
```
actions/
├── getCreditNotes.ts        # List with filtering, sorting, pagination
├── getCreditNoteById.ts     # Single credit note with all relations
├── createCreditNote.ts      # Create new credit note
├── updateCreditNote.ts      # Update draft credit note
├── deleteCreditNote.ts      # Delete draft credit note only
└── index.ts                 # Barrel export
```

**Acceptance Criteria**:
- `getCreditNotes`: Support filters (status, vendor, date range, reason, type), sorting, search, pagination
- `getCreditNoteById`: Return credit note with items, lots, attachments, journal entries, stock movements
- `createCreditNote`: Validate required fields, generate CN number (CN-YYMM-NNNN), set status to DRAFT
- `updateCreditNote`: Only allow updates on DRAFT status, validate all business rules
- `deleteCreditNote`: Only allow deletion of DRAFT status, cascade delete items and attachments
- All actions must use Supabase client with proper error handling
- All actions must validate user authentication and authorization

---

### BR-BE-002: Vendor and GRN Data Fetching
**Priority**: Critical
**Supports UI**: Vendor Selection, GRN Selection Workflow

The system must provide server actions to fetch vendor and GRN data for credit note creation.

**Required Server Actions**:
```
actions/
├── getActiveVendors.ts      # List active vendors with search
├── getVendorGRNs.ts         # GRNs for selected vendor (COMMITTED only)
├── getGRNDetails.ts         # Full GRN with items and lots
└── getGRNItemLots.ts        # Lot details for specific GRN item
```

**Acceptance Criteria**:
- `getActiveVendors`: Return vendors where `status = 'active'`, support search on name/code
- `getVendorGRNs`: Return GRNs where `vendorId = X` AND `status = 'COMMITTED'`
- `getGRNDetails`: Return GRN with all line items, quantities, prices, locations
- `getGRNItemLots`: Return all inventory lots created from GRN item with cost data (calculated per system costing method)
- Include lot balance validation (available quantity for return)

---

### BR-BE-003: Credit Note Commitment Transaction
**Priority**: Critical
**Supports UI**: Commit Button, Status Transition

The system must provide a server action to commit credit notes with atomic transaction handling.

**Required Server Action**: `commitCreditNote.ts`

**Acceptance Criteria**:
- Validate credit note is in DRAFT status
- Validate all required fields are complete
- Validate sufficient lot quantities available (for QUANTITY_RETURN)
- Validate journal entries balance (debits = credits)
- Execute in database transaction:
  1. Update credit note status to COMMITTED
  2. Set committedBy and committedDate
  3. Generate stock movements (for QUANTITY_RETURN type)
  4. Update inventory lot balances (reduce quantities)
  5. Generate journal voucher entries
  6. Update vendor accounts payable balance
  7. Create audit log entry
- Rollback all changes if any step fails
- Return success with generated reference numbers (stock movement, journal voucher)
- Lock credit note for editing after successful commit

**Database Tables Affected**:
- `credit_notes` (status update)
- `stock_movements` (insert negative movements)
- `inventory_lots` (reduce balances)
- `journal_vouchers` (insert header)
- `journal_voucher_lines` (insert debit/credit entries)
- `vendor_balances` (reduce AP balance)
- `audit_logs` (insert commit event)

---

### BR-BE-004: Credit Note Void Transaction
**Priority**: High
**Supports UI**: Delete/Void Button, Void Confirmation Dialog

The system must provide a server action to void committed credit notes with full reversal.

**Required Server Action**: `voidCreditNote.ts`

**Acceptance Criteria**:
- Validate credit note is in COMMITTED status
- Require void reason (string, min 10 characters)
- Check authorization (manager approval for amounts > $10,000)
- Validate credit note not reconciled in bank statement
- Execute in database transaction:
  1. Update credit note status to VOID
  2. Set voidedBy, voidedDate, voidReason
  3. Generate reversal stock movements (positive quantities)
  4. Restore inventory lot balances
  5. Generate reversal journal entries (swap debits/credits)
  6. Update vendor accounts payable (add back amount)
  7. Create audit log entry with void reason
- Return success with reversal reference numbers
- Mark credit note as read-only

---

### BR-BE-005: Stock Movement Generation
**Priority**: Critical
**Supports UI**: Stock Movement Tab Display

The system must generate and store stock movement records when credit notes are committed.

**Required Functions**:
```typescript
interface StockMovementInput {
  creditNoteId: number
  creditNoteNumber: string
  items: CreditNoteItem[]
}

async function generateStockMovements(input: StockMovementInput): Promise<StockMovement[]>
```

**Acceptance Criteria**:
- Generate movements only for QUANTITY_RETURN type
- Create one movement record per lot per item
- Movement fields:
  - `movementType`: 'CREDIT_NOTE'
  - `sourceDocument`: Credit note number
  - `quantity`: Negative value (reducing stock)
  - `lotNumber`: From applied lots
  - `locationCode`: From item location
  - `locationType`: 'INV' or 'CON'
  - `unitCost`: Calculated cost based on system costing method
  - `totalCost`: quantity × unitCost
  - `status`: 'POSTED'
- Update `inventory_lots.balance` for each affected lot
- Validate lot balance >= movement quantity before posting

---

### BR-BE-006: Journal Entry Generation
**Priority**: Critical
**Supports UI**: Journal Entries Tab Display

The system must generate and store journal voucher entries when credit notes are committed.

**Required Functions**:
```typescript
interface JournalEntryInput {
  creditNoteId: number
  creditNoteNumber: string
  creditType: 'QUANTITY_RETURN' | 'AMOUNT_DISCOUNT'
  items: CreditNoteItem[]
  taxAmount: number
  totalAmount: number
}

async function generateJournalEntries(input: JournalEntryInput): Promise<JournalVoucher>
```

**Acceptance Criteria**:
- Generate journal voucher header with unique number (JV-YYMM-NNNN)
- For QUANTITY_RETURN type:
  - Debit: Accounts Payable (2100) - total amount
  - Credit: Inventory Raw Materials (1140) - net amount
  - Credit: Input VAT (1240) - tax amount
  - Debit/Credit: Inventory Cost Variance (1145) - if variance exists
- For AMOUNT_DISCOUNT type:
  - Debit: Accounts Payable (2100) - total amount
  - Credit: Input VAT (1240) - tax amount
  - Credit: Purchase Discounts (4200) - net amount
- Each line must include: account code, department, cost center, description, reference
- Validate total debits = total credits before posting
- Set journal status to 'POSTED'

---

### BR-BE-007: Tax Calculation Service
**Priority**: Critical
**Supports UI**: Tax Entries Tab Display

The system must calculate and store tax adjustments for credit notes.

**Required Functions**:
```typescript
interface TaxCalculationInput {
  baseAmount: number
  taxRate: number
  originalBase: number
  originalTax: number
}

interface TaxCalculationResult {
  taxAmount: number
  baseImpact: number
  taxImpact: number
  vatPeriod: string
  reportingCode: string
}

async function calculateTaxAdjustment(input: TaxCalculationInput): Promise<TaxCalculationResult>
```

**Acceptance Criteria**:
- Calculate tax amount: baseAmount × taxRate / 100
- Determine VAT period from credit note date
- Assign reporting code (BOX4 for input VAT adjustments)
- Store tax adjustment record with:
  - Tax type, code, rate
  - Base amount, tax amount
  - GL account code
  - VAT period and due date
- Support multiple tax rates per credit note

---

### BR-BE-008: Inventory Cost Calculation Service
**Priority**: Critical
**Supports UI**: Lot Selection, Cost Variance Display

The system must calculate inventory costs for credit note items using the system-configured costing method (FIFO or Periodic Average).

**Costing Method Configuration**:
The costing method is set at the system level in System Administration → Inventory Settings:
- **FIFO (First-In-First-Out)**: Costs are calculated based on the oldest inventory layers first
- **Periodic Average**: Costs are calculated using the weighted average cost for the period

**Required Functions**:
```typescript
type CostingMethod = 'FIFO' | 'PERIODIC_AVERAGE'

interface CostCalculationInput {
  grnItemId: number
  returnQuantity: number
  selectedLots: string[]
  creditNoteDate: Date
}

interface CostCalculationResult {
  costingMethod: CostingMethod
  unitCost: number
  totalCost: number
  costVariance: number
  returnAmount: number
  costOfGoodsSold: number
  realizedGainLoss: number

  // FIFO-specific data (when method = 'FIFO')
  lotBreakdown?: LotCostDetail[]
  layersConsumed?: FIFOLayerConsumption[]

  // Periodic Average-specific data (when method = 'PERIODIC_AVERAGE')
  period?: Date  // Month/year used for average calculation
  averageCost?: number
  totalQuantityInPeriod?: number
  totalValueInPeriod?: number
}

async function calculateInventoryCost(input: CostCalculationInput): Promise<CostCalculationResult>
```

**Acceptance Criteria**:
- Retrieve system costing method from configuration
- **For FIFO Method**:
  - Query inventory lots for selected GRN item
  - Calculate weighted average cost across selected lots using oldest layers first
  - Return lot-level breakdown with quantities and costs
  - Track which FIFO layers are consumed
- **For Periodic Average Method**:
  - Calculate average cost for the credit note's period (month/year)
  - Use formula: Total Value of Receipts in Period ÷ Total Quantity Received in Period
  - If no receipts in period, use most recent period with receipts
- **Common Calculations**:
  - Calculate cost variance: current price - calculated unit cost
  - Calculate return amount: return quantity × current price
  - Calculate COGS: return quantity × calculated unit cost
  - Calculate realized gain/loss: return amount - COGS
- Display costing method indicator in UI
- Handle edge cases (no receipts, zero quantities)

**Shared Method Reference**: Uses Inventory Valuation Service from [SM-inventory-valuation.md](../../shared-methods/inventory-valuation/SM-inventory-valuation.md) for centralized cost calculation logic.

---

### BR-BE-009: Attachment Management
**Priority**: Medium
**Supports UI**: Attachments Panel, File Upload

The system must provide server actions for attachment upload and management.

**Required Server Actions**:
```
actions/
├── uploadAttachment.ts      # Upload file to storage
├── getAttachments.ts        # List attachments for credit note
├── deleteAttachment.ts      # Remove attachment (DRAFT only)
└── downloadAttachment.ts    # Generate download URL
```

**Acceptance Criteria**:
- Upload files to Supabase Storage bucket `credit-note-attachments`
- Validate file type (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF)
- Validate file size (max 10MB)
- Store metadata in `credit_note_attachments` table
- Only allow deletion for DRAFT status credit notes
- Generate signed URLs for secure downloads
- Record uploadedBy and uploadDate

---

### BR-BE-010: Audit Logging
**Priority**: High
**Supports UI**: Audit Log Panel

The system must log all credit note operations for audit trail.

**Required Function**:
```typescript
interface AuditLogEntry {
  entityType: 'CREDIT_NOTE'
  entityId: number
  action: 'CREATE' | 'UPDATE' | 'COMMIT' | 'VOID' | 'DELETE'
  userId: string
  userName: string
  timestamp: Date
  details: string
  previousValues?: object
  newValues?: object
}

async function createAuditLog(entry: AuditLogEntry): Promise<void>
```

**Acceptance Criteria**:
- Log all create, update, commit, void, delete operations
- Store user ID and name who performed action
- Store timestamp of action
- Store human-readable description of changes
- For updates, store previous and new values
- Audit logs must be immutable (no update or delete allowed)
- Support querying audit logs by entity ID

---

### BR-BE-011: Credit Note Number Generation
**Priority**: Critical
**Supports UI**: Credit Note Creation

The system must generate unique sequential credit note numbers.

**Required Function**:
```typescript
async function generateCreditNoteNumber(): Promise<string>
// Returns: "CN-2401-000001"
```

**Acceptance Criteria**:
- Format: CN-YYMM-NNNN (2-digit year + month + 6-digit sequence)
- Sequence resets annually
- Must be atomic to prevent duplicate numbers
- Use database sequence or transaction-safe increment
- Number must be unique across all credit notes

---

### BR-BE-012: Vendor Balance Update
**Priority**: High
**Supports UI**: Vendor Account Reconciliation

The system must update vendor accounts payable balance when credit notes are committed or voided.

**Required Functions**:
```typescript
async function reduceVendorBalance(vendorId: number, amount: number, reference: string): Promise<void>
async function restoreVendorBalance(vendorId: number, amount: number, reference: string): Promise<void>
```

**Acceptance Criteria**:
- Reduce vendor AP balance on credit note commit
- Restore vendor AP balance on credit note void
- Store transaction reference for reconciliation
- Update `vendor_balances` table with new balance
- Create balance history record for audit

---

### BR-BE-013: Data Validation Service
**Priority**: Critical
**Supports UI**: Form Validation, Commit Validation

The system must provide comprehensive validation for credit note data.

**Required Validation Functions**:
```typescript
async function validateCreditNoteForCommit(creditNoteId: number): Promise<ValidationResult>
async function validateReturnQuantities(items: CreditNoteItem[]): Promise<ValidationResult>
async function validateJournalBalance(entries: JournalEntry[]): Promise<ValidationResult>
```

**Validation Rules to Implement**:
- All required fields populated
- Credit note date not in future
- Credit note date within 90 days of GRN date
- Return quantities do not exceed lot balances
- Total amounts are positive with max 2 decimal places
- Journal entries balance (debits = credits)
- Exchange rate is valid positive number
- Tax rate between 0 and 100
- Credit reason is valid enum value

---

### BR-BE-014: Real-time Data Sync
**Priority**: Medium
**Supports UI**: List View Auto-refresh, Concurrent Edit Detection

The system should support real-time updates for collaborative use.

**Acceptance Criteria**:
- Use Supabase Realtime subscriptions for credit note changes
- Detect concurrent edits and notify users
- Auto-refresh list view when new credit notes are created
- Show optimistic updates with rollback on failure

---

## Non-Functional Requirements

### Performance
- **NFR-CN-001**: Credit note list page must load within 2 seconds for up to 10,000 records
- **NFR-CN-002**: Search and filter operations must return results within 1 second
- **NFR-CN-003**: Credit note commitment (posting) must complete within 5 seconds for single credit
- **NFR-CN-004**: Cost calculation (FIFO or Periodic Average) for lot selection must complete within 3 seconds for up to 100 lots
- **NFR-CN-005**: System must support concurrent creation of 20 credit notes without performance degradation
- **NFR-CN-006**: Journal entry generation must complete within 2 seconds

### Usability
- **NFR-CN-010**: User interface must be responsive and work on tablets (minimum 768px width)
- **NFR-CN-011**: Workflow must be intuitive with clear step-by-step progression
- **NFR-CN-012**: Error messages must be clear and actionable
- **NFR-CN-013**: Required fields must be clearly marked with asterisks
- **NFR-CN-014**: Validation errors must be displayed inline next to relevant fields
- **NFR-CN-015**: Success and error notifications must be prominently displayed
- **NFR-CN-016**: Keyboard navigation must be supported for power users
- **NFR-CN-017**: Cost calculations (FIFO or Periodic Average) and cost variance must be clearly explained in UI with method indicator

### Reliability
- **NFR-CN-020**: System must maintain 99.5% uptime during business hours
- **NFR-CN-021**: Data must be backed up daily with point-in-time recovery capability
- **NFR-CN-022**: Failed commitment operations must rollback completely (atomic transactions)
- **NFR-CN-023**: System must auto-save draft credits every 2 minutes to prevent data loss
- **NFR-CN-024**: Concurrent edit conflicts must be detected and user notified

### Security
- **NFR-CN-030**: All API endpoints must require authentication
- **NFR-CN-031**: Role-based access control must be enforced at both UI and API levels
- **NFR-CN-032**: Sensitive operations (approve, commit, void) must be logged in audit trail
- **NFR-CN-033**: Attachment uploads must be scanned for malware
- **NFR-CN-034**: Session timeout after 30 minutes of inactivity
- **NFR-CN-035**: SQL injection and XSS vulnerabilities must be prevented
- **NFR-CN-036**: Financial data must be encrypted in transit (HTTPS/TLS)

### Scalability
- **NFR-CN-040**: System must handle 500 credit notes per day
- **NFR-CN-041**: Database must support storing 50,000+ credit note records
- **NFR-CN-042**: Attachment storage must support up to 100GB total size
- **NFR-CN-043**: System must scale to support 100 concurrent users

### Maintainability
- **NFR-CN-050**: Code must follow consistent coding standards and conventions
- **NFR-CN-051**: All business logic must be thoroughly documented
- **NFR-CN-052**: Database schema changes must be versioned and migration scripts maintained
- **NFR-CN-053**: API endpoints must have comprehensive documentation
- **NFR-CN-054**: System must log errors with sufficient context for troubleshooting

### Compliance
- **NFR-CN-060**: System must comply with accounting standards (GAAP/IFRS)
- **NFR-CN-061**: Tax calculations must comply with local tax regulations
- **NFR-CN-062**: Audit trail must be tamper-proof and immutable
- **NFR-CN-063**: Data retention must comply with legal requirements (7 years minimum)
- **NFR-CN-064**: Financial reports must be accurate and reconcilable

---

## Success Metrics

### Operational Metrics
- **Average credit note processing time**: < 10 minutes from creation to commitment
- **Error rate**: < 2% credits requiring correction or void
- **User satisfaction score**: > 4.0 out of 5.0

### Financial Metrics
- **Monthly credit volume**: Track total value of credits processed
- **Credit ratio**: Credits as percentage of total purchases (< 5% target)
- **Vendor credit distribution**: Top 10 vendors by credit value and frequency
- **Reason analysis**: Breakdown of credits by reason category

### Quality Metrics
- **Data accuracy**: > 99% accuracy in financial postings
- **Reconciliation success**: 100% of credits reconcilable in vendor statements
- **Audit findings**: Zero audit exceptions related to credit notes
- **System uptime**: > 99.5% during business hours

---

## Dependencies

### Internal Systems
- **Procurement Module**: Requires GRN data and vendor information
- **Inventory Module**: Updates stock movements and lot balances
- **Finance Module**: Posts journal entries and tax adjustments
- **Vendor Management**: Vendor master data and accounts payable balances
- **User Management**: Authentication, authorization, and user information
- **System Configuration**: Inventory Settings for costing method (FIFO or Periodic Average)
- **Shared Methods**: Inventory Valuation Service (FIFO/Periodic Average costing), Inventory Operations Service (stock movements, audit trail, state management)

### External Systems
- **ERP System**: May integrate with external ERP for GL posting
- **Tax Reporting System**: VAT return preparation and submission
- **Email System**: Notifications to approvers and vendors
- **Document Storage**: Attachment file storage and retrieval

### Data Sources
- **GRN Module**: Source for item, pricing, and lot information
- **Vendor Master**: Vendor details, contacts, payment terms
- **Inventory Master**: Product information, units of measure, locations
- **Exchange Rate Service**: Current and historical exchange rates
- **Tax Configuration**: Tax rates, GL accounts, reporting codes

---

## Assumptions and Constraints

### Assumptions
- Users have stable internet connectivity
- Users have basic accounting knowledge
- Vendors provide valid credit justification
- GRN data is accurate and complete
- Exchange rates are updated daily
- Tax rates configured correctly in system
- GL account codes are properly mapped

### Constraints
- Must use existing authentication system
- Must follow company chart of accounts structure
- Cannot modify posted credits (must void and recreate)
- Limited to single GRN reference per credit note
- Maximum attachment size: 10MB per file
- Credit note date cannot exceed 90 days after GRN
- Costing method (FIFO or Periodic Average) is configured at system level and applies consistently across all credit notes

---

## Related Documents

### Module Documentation
- **Use Cases**: [UC-credit-note.md](./UC-credit-note.md)
- **Technical Specification**: [TS-credit-note.md](./TS-credit-note.md)
- **Data Definition**: [DD-credit-note.md](./DD-credit-note.md)
- **Flow Diagrams**: [FD-credit-note.md](./FD-credit-note.md)
- **Validations**: [VAL-credit-note.md](./VAL-credit-note.md)
- **GRN Business Requirements**: [../goods-received-note/BR-goods-received-note.md](../goods-received-note/BR-goods-received-note.md)

### Shared Methods
- **Inventory Valuation Service**: [SM-inventory-valuation.md](../../shared-methods/inventory-valuation/SM-inventory-valuation.md) - Centralized FIFO/Periodic Average costing calculations
- **Credit Note Integration Example**: [credit-note-integration.md](../../shared-methods/inventory-valuation/examples/credit-note-integration.md) - Implementation guide for cost calculation integration
- **Inventory Operations Service**: [SM-inventory-operations.md](../../shared-methods/inventory-operations/SM-inventory-operations.md) - Stock movements, audit trail, state management, atomic transactions

---

**Document Control**:
- **Created**: 2025-11-01
- **Author**: Documentation System
- **Reviewed By**: Business Analyst, Finance Manager, Procurement Manager
- **Approved By**: Product Owner, Finance Director
- **Next Review**: 2025-04-01
