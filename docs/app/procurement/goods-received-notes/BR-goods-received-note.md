# Business Requirements: Goods Received Note (GRN)

**Module**: Procurement
**Sub-module**: Goods Received Note
**Document Version**: 1.3
**Last Updated**: 2025-12-03

---

## 1. Overview

### 1.1 Purpose
The Goods Received Note (GRN) module enables receiving clerks and storekeeper staff to record and validate delivery of goods from vendors, reconcile deliveries against purchase orders, manage inventory receipts, and maintain accurate stock records for hotel operations.

### 1.2 Scope
- GRN creation from purchase orders (single or multiple POs)
- Manual GRN creation without PO reference
- Multi-PO receiving capability (single GRN can receive items from multiple POs)
- Delivery validation and discrepancy tracking
- Extra cost allocation (freight, handling, customs)
- Stock movement integration
- Financial accounting integration
- Multi-currency transaction support

### 1.3 Key Stakeholders
- **Receiving Clerk**: Records goods receipt, validates deliveries
- **Storekeeper**: Manages inventory locations, confirms stock movements
- **Purchasing Staff**: Reviews GRN against PO, resolves discrepancies
- **AP Clerk**: Processes vendor invoices against GRN
- **Financial Controller**: Reviews cost allocations and accounting entries

---

## 2. Functional Requirements

### FR-GRN-001: GRN List Management
**Priority**: High
**User Story**: As a Receiving Clerk, I want to view all goods received notes with filtering and search capabilities so that I can quickly find and manage delivery records.

**Requirements**:
- Display GRN list with key information (number, date, vendor, status, total amount)
- Quick filters by status (DRAFT, RECEIVED, COMMITTED, VOID)
- Advanced filtering by date range, vendor, location
- Search by GRN number, vendor name, invoice number
- Export GRN list to Excel/PDF
- Print selected GRNs

**Acceptance Criteria**:
- List displays all GRNs with pagination
- Filters update results in real-time
- Search returns results within 2 seconds
- Export includes all visible columns
- Print format is properly formatted

**Source**: `app/(main)/procurement/goods-received-note/page.tsx`

---

### FR-GRN-002: Create GRN from Purchase Order
**Priority**: High
**User Story**: As a Receiving Clerk, I want to create a GRN from one or multiple purchase orders so that I can efficiently record deliveries and auto-populate item details.

**Requirements**:
- **Step 1 - Vendor Selection**: Select vendor from active vendor list with search
- **Step 2 - PO Selection**: Display open/partial POs for selected vendor, allow multi-select
- **Step 3 - Item & Location Selection**: Review PO items, specify receiving quantities and storage locations
- Auto-populate item details from PO (name, ordered quantity, unit price, tax rate)
- Support receiving partial quantities
- Support receiving from multiple POs in single GRN
- Each line item can reference different PO (multi-PO support)

**Acceptance Criteria**:
- Vendor selection shows only active vendors
- PO selection shows only OPEN or PARTIAL status POs
- Can select multiple POs from same vendor
- Item details pre-fill from PO accurately
- Can specify different storage location per item
- Received quantity cannot exceed remaining PO quantity
- Creates GRN in RECEIVED status

**Source**:
- `app/(main)/procurement/goods-received-note/new/vendor-selection/page.tsx`
- `app/(main)/procurement/goods-received-note/new/po-selection/page.tsx`
- `app/(main)/procurement/goods-received-note/new/item-location-selection/page.tsx`

---

### FR-GRN-003: Create GRN Manually
**Priority**: High
**User Story**: As a Receiving Clerk, I want to create a GRN manually without PO reference so that I can record unexpected deliveries or emergency purchases.

**Requirements**:
- Create blank GRN with system-generated temporary ID
- Manually enter vendor information
- Manually add line items with product search
- Specify quantity, unit, price per item
- Enter invoice and delivery details
- Support consignment and cash purchase flags

**Acceptance Criteria**:
- Can create GRN without PO reference
- Vendor dropdown shows active vendors
- Product search finds items from catalog
- Can add unlimited line items
- All required fields validated before save
- Creates GRN in RECEIVED status

**Source**: `app/(main)/procurement/goods-received-note/page.tsx:15-88`

---

### FR-GRN-004: GRN Header Information
**Priority**: High
**User Story**: As a Receiving Clerk, I want to capture complete delivery information in the GRN header so that all delivery details are documented for reference and audit.

**Requirements**:
- **GRN Number**: Auto-generated unique identifier (format: GRN-YYMM-NNNN)
- **Receipt Date**: Date goods physically received (default: today)
- **Invoice Number**: Vendor invoice reference
- **Invoice Date**: Date on vendor invoice
- **Tax Invoice Number**: Tax invoice reference (if different)
- **Tax Invoice Date**: Tax invoice date
- **Vendor**: Vendor name and ID (required)
- **Received By**: User who received goods (required)
- **Location**: Storage/receiving location (required)
- **Currency**: Transaction currency with exchange rate
- **Description**: Free-text notes about delivery
- **Status**: DRAFT, RECEIVED, COMMITTED, VOID
- **Consignment Flag**: Mark as consignment stock
- **Cash Purchase Flag**: Mark as cash purchase
- **Cash Book**: Associated cash book (if cash purchase)

**Acceptance Criteria**:
- GRN number generated automatically on save
- Receipt date defaults to current date
- Vendor must be selected from active vendors
- Received by defaults to current user
- Location must be valid storage location
- Currency selection triggers exchange rate lookup
- All required fields enforced
- Status transitions follow workflow rules

**Source**:
- `lib/types/procurement.ts:346-374` (GoodsReceiveNote interface)
- `app/(main)/procurement/goods-received-note/components/GoodsReceiveNoteDetail.tsx:260-383`

---

### FR-GRN-005: GRN Line Items Management
**Priority**: High
**User Story**: As a Receiving Clerk, I want to record received quantities for each item with full details so that inventory and costs are accurately tracked.

**Requirements**:
- **Line Number**: Sequential item numbering
- **Item Code & Name**: Product identification
- **Description**: Item description
- **PO References**: Purchase Order ID and Line Item ID (if from PO)
- **Ordered Quantity**: Quantity per PO (if applicable)
- **Received Quantity**: Actual quantity accepted
- **Unit**: Unit of measure
- **Unit Price**: Cost per unit
- **Subtotal**: Quantity × Price
- **Discount Rate/Amount**: Line discount
- **Tax Rate/Amount**: Line tax
- **Net Amount**: Subtotal - Discount
- **Total Amount**: Net + Tax
- **Storage Location**: Warehouse/kitchen location
- **Job Code**: Project/job reference
- **Delivery Date**: Expected/actual delivery date
- **Notes**: Line item remarks
- **FOC Fields**: Free of Charge quantity and unit (if applicable)
- **Tax Included**: Flag for tax-inclusive pricing

**Acceptance Criteria**:
- Support adding/editing/deleting line items
- Unit price validates against PO (if from PO)
- Storage location must be valid
- Discrepancies auto-flagged when ordered vs received quantities don't match
- Can mark items as Free of Charge (FOC)
- Financial calculations accurate (discount, tax, totals)

**Source**:
- `lib/types/procurement.ts:378-410` (GoodsReceiveNoteItem interface)
- `app/(main)/procurement/goods-received-note/components/tabs/GoodsReceiveNoteItems.tsx`

---

### FR-GRN-006: Multi-PO Receiving Support
**Priority**: High
**User Story**: As a Receiving Clerk, I want to receive items from multiple purchase orders in a single GRN so that I can efficiently process consolidated vendor deliveries.

**Requirements**:
- Single GRN can reference multiple POs
- Each line item stores its own PO reference
- PO reference stored at line item level (purchaseOrderId, purchaseOrderItemId)
- Can mix PO-based and manual items in same GRN
- Header-level PO fields deprecated but retained for compatibility

**Acceptance Criteria**:
- Can select multiple POs during creation workflow
- Line items correctly reference source PO
- Can add manual items to PO-based GRN
- Financial summary consolidates across all POs
- Stock movements created per line item
- Each line updates respective PO item status

**Source**: `lib/types/procurement.ts:354-357, 383-385`

---

### FR-GRN-007: Extra Costs Allocation
**Priority**: Medium
**User Story**: As an AP Clerk, I want to allocate additional costs (freight, handling, customs) to received goods so that total landed cost is accurately calculated.

**Requirements**:
- Add extra cost entries: type, amount, currency
- **Cost Types**: Freight, Handling, Customs, Insurance, Other
- Multi-currency support with exchange rates
- **Distribution Methods**:
  - **Net Amount**: Distribute proportionally by line net amount
  - **Quantity Ratio**: Distribute proportionally by quantity received
- Auto-calculate distributed cost per line item
- Update line item total costs with allocated extras

**Acceptance Criteria**:
- Can add multiple extra cost entries
- Cost type must be selected from predefined list
- Amount must be positive number
- Distribution method applies to all items
- Line item costs update automatically
- Extra costs included in financial totals

**Source**:
- `lib/types/procurement.ts:329-333` (CostDistributionMethod enum)
- `app/(main)/procurement/goods-received-note/components/tabs/ExtraCostsTab.tsx`

---

### FR-GRN-008: Stock Movement Integration
**Priority**: High
**User Story**: As a Storekeeper, I want GRN to automatically create stock movements so that inventory levels are updated when goods are received.

**Requirements**:
- Auto-generate stock movement entries on GRN commit
- One stock movement per line item
- **Movement Details**: Item, quantity, unit, location, batch/lot
- Movement type: "GRN Receipt"
- Link to source GRN and line item
- Update on-hand inventory quantities
- Support multiple storage locations per GRN

**Acceptance Criteria**:
- Stock movements created only when GRN status = COMMITTED
- Each line item creates one stock movement
- Inventory quantities increase by received amount
- Rejected/damaged quantities handled separately
- Can view stock movements from GRN detail page
- Movement transaction is atomic (all or none)

**Source**:
- `app/(main)/procurement/goods-received-note/components/tabs/StockMovementTab.tsx`
- `app/(main)/procurement/goods-received-note/components/tabs/stock-movement.tsx`

---

### FR-GRN-009: Financial Summary and Accounting
**Priority**: High
**User Story**: As an AP Clerk, I want to view complete financial summary with accounting entries so that I can process vendor invoices and verify costs.

**Requirements**:
- **Financial Totals**:
  - Subtotal (sum of line subtotals)
  - Discount Amount (if applicable)
  - Net Amount (subtotal - discount)
  - Tax Amount (VAT/GST)
  - Total Amount (net + tax + extra costs)
- Display in both transaction currency and base currency
- Exchange rate conversion
- **Journal Voucher Preview**:
  - JV Type: GRN
  - JV Number: Auto-generated
  - JV Date: Receipt date
  - Debit: Inventory account
  - Credit: Accounts Payable
  - GL account codes per department
- Tax breakdown by tax rate
- Cost center allocation

**Acceptance Criteria**:
- Financial summary calculates automatically
- Multi-currency amounts displayed correctly
- Exchange rate applied consistently
- JV preview shows all accounting entries
- Debits equal credits
- Tax calculations accurate
- Extra costs included in totals

**Source**:
- `app/(main)/procurement/goods-received-note/components/tabs/FinancialSummaryTab.tsx`
- `app/(main)/procurement/goods-received-note/components/SummaryTotal.tsx`
- `app/(main)/procurement/goods-received-note/components/GoodsReceiveNoteDetail.tsx:185-217`

---

### FR-GRN-010: GRN Status Workflow
**Priority**: High
**User Story**: As a Receiving Clerk, I want clear status workflow for GRN lifecycle so that I can track document progress and ensure proper controls.

**Requirements**:
- **DRAFT**: Initial creation, editable, no inventory impact
- **RECEIVED**: Goods physically received, pending verification
- **COMMITTED**: Verified and committed, inventory updated, creates stock movements
- **VOID**: Cancelled GRN, reverses inventory impact

**Status Transitions**:
- New GRN → RECEIVED (on save)
- RECEIVED → COMMITTED (user commits)
- RECEIVED → VOID (user cancels)
- COMMITTED → cannot change (final state)
- VOID → cannot change (final state)

**Permissions**:
- Receiving Clerk: Create, edit DRAFT/RECEIVED
- Storekeeper: Commit RECEIVED → COMMITTED
- Purchasing Manager: Void GRN

**Acceptance Criteria**:
- Status displayed prominently on GRN detail
- Only valid transitions allowed
- COMMITTED GRN cannot be edited
- VOID GRN cannot be un-voided
- Inventory updated only on COMMITTED
- Audit log captures all status changes

**Source**: `lib/types/procurement.ts:338-343` (GRNStatus enum)

---

### FR-GRN-011: Multi-Currency Support
**Priority**: Medium
**User Story**: As a Purchasing Staff, I want to record GRN in vendor's currency and convert to base currency so that foreign vendor invoices are accurately tracked.

**Requirements**:
- Select transaction currency per GRN
- Enter/retrieve exchange rate for conversion date
- Display amounts in both transaction and base currency
- Store both currency amounts in database
- Base currency defined in system settings
- **Exchange Rate**:
  - Auto-fetch from system exchange rate table
  - Allow manual override if needed
  - Use receipt date for rate lookup

**Acceptance Criteria**:
- Can select any active currency
- Exchange rate auto-populated
- Can override exchange rate manually
- All amounts calculated in transaction currency
- Base currency amounts calculated automatically
- Both currencies displayed in financial summary
- Exchange rate locked when GRN committed

**Source**:
- `app/(main)/procurement/goods-received-note/components/GoodsReceiveNoteDetail.tsx:339-355`
- Line items support multi-currency

---

### FR-GRN-012: Comments and Attachments
**Priority**: Medium
**User Story**: As a Receiving Clerk, I want to add comments and attach documents to GRN so that additional context and supporting documents are available.

**Requirements**:
- Add text comments with timestamp and user
- Attach files (PDF, images, Excel)
- Supported document types: Invoice, Delivery Note, Packing List, Photos, Other
- Comment history with user name and timestamp
- Download attached files
- Preview images inline

**Acceptance Criteria**:
- Can add unlimited comments
- Comments show user and timestamp
- Can upload multiple files
- File size limit: 10MB per file
- Supported formats: PDF, JPG, PNG, XLSX
- Can delete own comments/attachments
- Cannot delete others' comments (except admin)

**Source**: `app/(main)/procurement/goods-received-note/components/tabs/CommentsAttachmentsTab.tsx`

---

### FR-GRN-013: Activity Log and Audit Trail
**Priority**: Medium
**User Story**: As a Financial Controller, I want to view complete activity log of GRN changes so that I can audit all modifications and ensure compliance.

**Requirements**:
- **Logged Actions**:
  - GRN created
  - Status changed
  - Items added/edited/deleted
  - Extra costs added/modified
  - Comments added
  - Attachments uploaded
  - GRN committed
  - GRN voided
- Each log entry includes: timestamp, user, action type, description
- Activity log read-only (cannot modify history)
- Sort by timestamp (newest first)

**Acceptance Criteria**:
- All modifications logged automatically
- Log shows user who made change
- Timestamp accurate to second
- Action descriptions clear and specific
- Cannot delete or modify log entries
- Log retained even if GRN voided

**Source**: `app/(main)/procurement/goods-received-note/components/tabs/ActivityLogTab.tsx`

---

### FR-GRN-014: Bulk Actions on Line Items
**Priority**: Low
**User Story**: As a Receiving Clerk, I want to perform bulk actions on multiple line items so that I can efficiently manage large GRNs.

**Requirements**:
- Select multiple line items via checkbox
- **Bulk Actions**:
  - Delete selected items
  - Apply same storage location
  - Apply same discount rate
  - Mark as accepted (set received = delivered)
- Select all / deselect all functionality
- Action confirmation prompt
- Actions apply to all selected items

**Acceptance Criteria**:
- Can select/deselect individual items
- Select all checkbox works
- Bulk delete removes all selected items
- Bulk location updates all selected items
- Confirmation required for destructive actions
- Selected item count displayed
- Bulk actions only available in edit mode

**Source**: `app/(main)/procurement/goods-received-note/components/tabs/GoodsReceiveNoteItemsBulkActions.tsx`

---

### FR-GRN-015: Export and Print
**Priority**: Medium
**User Story**: As a Receiving Clerk, I want to export and print GRN so that I can share with vendors and maintain paper records.

**Requirements**:
- Export GRN to PDF (formatted for printing)
- Export GRN to Excel (data format)
- Print-friendly GRN format with logo
- Include all line items and totals
- Show company and vendor details
- Display status and approvals
- Include attached documents in PDF export

**Acceptance Criteria**:
- PDF export matches print layout
- Excel export includes all data fields
- Print layout fits standard paper size
- Company logo displayed on print
- Vendor details clearly visible
- All line items included
- Page breaks appropriate for long GRNs

**Source**: `app/(main)/procurement/goods-received-note/page.tsx:122-130`

---

### FR-GRN-016: QR/Barcode Scanning for Mobile Receiving
**Priority**: High
**User Story**: As a Receiving Clerk using mobile device, I want to scan PO QR codes to quickly create GRN so that I can efficiently receive goods in the warehouse.

**Status**: ✅ **IMPLEMENTED IN MOBILE APP** (`cmobile` repository)

**Requirements**:
- **Mobile-First Workflow**: Optimized for warehouse tablets and smartphones
- **QR/Barcode Scanner Integration**: Camera-based scanning for PO documents
- **PO Lookup Methods**:
  1. **Primary: Scan QR Code**: Scan QR on PO printout (fastest method)
  2. **Alternative: Scan Barcode**: Scan 1D barcode on delivery note
  3. **Fallback: Manual Entry**: Type PO number if scan unavailable
  4. **Fallback: Advanced Search**: Search by vendor, date, amount
- **Auto-GRN Creation**: Automatically create GRN when PO found via scan
- **Streamlined Item Receiving**: Touch-optimized interface for quantity entry
- **Draft Auto-Save**: Save work-in-progress if user exits before completing
- **Offline Capability**: Queue scans for processing when network returns
- **Business Unit Selection**: Select receiving location before scanning

**Scan Receiving Process** (5-Step Mobile Workflow):

**Step 1: Business Unit Selection**
- User selects business unit/location before scanning
- Defaults to user's primary location
- Required for proper stock allocation

**Step 2: Scan PO QR/Barcode**
- User taps "Scan PO" button
- Camera opens with viewfinder overlay
- User aims camera at QR code or barcode on PO
- System decodes and validates PO number
- **Scan time**: ~2 seconds

**Step 3: Auto-Create GRN**
- If PO found and valid:
  - System retrieves PO details (vendor, items, quantities)
  - System auto-creates GRN in RECEIVED status
  - System pre-fills header (vendor, date, PO reference)
  - System loads all PO line items
  - System navigates to GRN Detail page
- If PO not found:
  - Display "PO not found" message
  - Offer manual PO entry option
  - Offer advanced search option

**Step 4: Item Receiving**
- Display touch-optimized items table:
  - Product name and SKU
  - PO number (if multi-PO supported)
  - Ordered quantity and unit
  - Remaining to receive
  - **Received quantity** (editable, default: remaining)
  - **Received unit** (editable dropdown)
  - **FOC quantity** (Free of Charge, optional)
  - **Comment** (optional notes per item)
- User adjusts received quantities via:
  - Touch-friendly number pads
  - Quick buttons: Full, Half, Zero
  - Manual keyboard entry
- **Mobile UX Features**:
  - Large touch targets (44x44px minimum)
  - Haptic feedback on tap
  - Swipe to navigate items
  - Pinch to zoom item details
  - Voice input for comments (optional)

**Step 5: Save/Submit**
- User clicks "Save Draft" or "Submit GRN"
- **Save Draft**:
  - Saves GRN with status DRAFT
  - User can resume later from "Draft GRNs" list
  - Auto-saves every 30 seconds
- **Submit GRN**:
  - Validates all data (quantities, locations)
  - Sets status to RECEIVED
  - Generates GRN number
  - Displays success confirmation
  - Returns to Receiving home

**Mobile-Specific Features**:
- **Touch Optimization**: Large buttons, gesture navigation, swipe actions
- **Haptic Feedback**: Vibration on scan success, button taps
- **Network Monitoring**: Online/offline status indicator
- **Camera Permissions**: Request camera access on first use
- **Scan History**: Recent scans list for quick re-scan
- **Photo Capture**: Take photos of damaged goods (optional)
- **Voice Notes**: Record voice notes for discrepancies (optional)

**Performance Targets** (Mobile):
- Scan to PO lookup: < 2 seconds
- PO to GRN creation: < 1 second
- Item list load: < 1 second
- Save draft: < 500ms
- Full scan-to-save workflow: 30 seconds to 3 minutes

**Acceptance Criteria**:
- Can scan QR codes from printed PO documents
- Can scan 1D barcodes from delivery notes
- Auto-creates GRN when valid PO scanned
- Supports manual PO entry if scan unavailable
- Works on iOS and Android mobile browsers
- Handles poor lighting conditions (flash available)
- Validates PO status (only OPEN/PARTIAL allowed)
- Pre-fills item quantities with remaining PO quantities
- Saves draft automatically every 30 seconds
- Works offline (queues scans for sync when online)
- Touch-friendly UI (minimum 44x44px tap targets)
- Haptic feedback for user actions

**Supported Barcode Formats**:
- QR Code (primary, recommended)
- Code 128
- Code 39
- EAN-13
- UPC-A

**Error Handling**:
- Invalid QR/barcode: Display "Invalid code" message
- PO not found: Offer manual entry or search
- PO already fully received: Display "PO already received" message
- Network unavailable: Queue scan for processing when online
- Camera permission denied: Prompt user to enable in settings
- Low light conditions: Suggest using flash or manual entry

**Source**:
- `cmobile/src/app/(mobile)/receiving/page.tsx` - Main receiving page with scan button
- `cmobile/src/app/(mobile)/receiving/scan-po/page.tsx` - QR/Barcode scanning workflow
- `cmobile/src/app/(mobile)/receiving/grn-detail/page.tsx` - Item receiving interface
- `cmobile/components/mobile-nav.tsx` - Bottom navigation
- `cmobile/components/mobile-optimizations.tsx` - Touch feedback, haptics, network monitoring

**Platform**: Mobile Web App (PWA) - Next.js 15, React 19, Tailwind CSS 4

**Deployment Status**: Production (Mobile app: `cmobile` repository)

**Integration with Desktop**:
- Mobile creates GRN in RECEIVED status
- Desktop can view/edit/commit mobile-created GRNs
- Sync via shared database (real-time)
- Desktop handles COMMITTED status and stock movements
- Both platforms share same GRN data model

**Future Enhancements** (Mobile):
- Batch/Lot barcode scanning (scan item barcodes)
- Multi-item scanning (scan all items in delivery)
- Weight scale integration (Bluetooth scales)
- Signature capture for delivery acceptance
- GPS location verification (geofence receiving area)
- Augmented reality (AR) location guidance

---

### FR-GRN-017: Consignment and Cash Purchase Handling
**Priority**: Low
**User Story**: As an AP Clerk, I want to flag consignment and cash purchases so that accounting treatment differs from standard credit purchases.

**Requirements**:
- **Consignment Flag**: Indicates goods held on consignment
  - No immediate payment obligation
  - Inventory tracked separately
  - Payment due when goods sold/used
- **Cash Purchase Flag**: Indicates paid in cash on delivery
  - Requires cash book selection
  - Payment recorded immediately
  - No AP entry created

**Acceptance Criteria**:
- Consignment checkbox on GRN header
- Cash purchase checkbox on GRN header
- Cash book dropdown required if cash purchase
- Consignment GRN creates different JV entry
- Cash purchase debits cash book, not AP
- Cannot be both consignment and cash

**Source**: `app/(main)/procurement/goods-received-note/components/GoodsReceiveNoteDetail.tsx:374-380`

---

## 3. Non-Functional Requirements

### NFR-GRN-001: Performance
- GRN list loads within 2 seconds for up to 10,000 records
- GRN detail page loads within 1 second
- Save/update operations complete within 3 seconds
- Search returns results within 2 seconds
- Export to Excel completes within 10 seconds for 500 line items

### NFR-GRN-002: Usability
- Mobile-responsive interface for warehouse tablet use
- Touch-friendly controls for receiving staff
- Keyboard shortcuts for frequent actions
- Auto-save draft functionality (every 30 seconds)
- Confirmation prompts for destructive actions

### NFR-GRN-003: Data Integrity
- All financial calculations rounded to 2 decimal places
- Quantity fields support 3 decimal places
- Exchange rates stored with 4 decimal places
- Database transactions ensure atomicity
- Concurrent edit detection prevents data conflicts

### NFR-GRN-004: Security
- Role-based access control (RBAC)
- Receiving Clerk: Create, edit DRAFT/RECEIVED GRNs
- Storekeeper: Commit GRNs
- Purchasing Manager: View all, void GRNs
- Financial Controller: View all, export reports
- Audit log immutable and tamper-proof

### NFR-GRN-005: Compliance
- Support for tax regulations (VAT, GST)
- Audit trail for regulatory compliance
- Data retention per company policy
- Support for tax invoicing requirements
- Proper accounting controls and segregation of duties

---

## 4. Business Rules

### BR-GRN-001: GRN Numbering
- GRN numbers auto-generated in format: GRN-YYMM-NNNN
- Sequential numbering per month
- No gaps allowed in sequence
- Cannot manually assign GRN number

### BR-GRN-002: PO Reference Validation
- If GRN created from PO, line items must reference valid PO item
- Received quantity cannot exceed (ordered - previously received)
- Unit price should match PO price (±10% tolerance, flag if exceeded)
- Vendor on GRN must match PO vendor

### BR-GRN-003: Status Transition Rules
- Can only commit GRN if all required fields complete
- Cannot edit COMMITTED or VOID GRN
- Voiding GRN requires reason entry
- COMMITTED GRN creates irreversible stock movements

### BR-GRN-004: Financial Calculations
- Line Subtotal = Received Qty × Unit Price
- Line Discount = Subtotal × Discount %
- Line Net = Subtotal - Discount
- Line Tax = Net × Tax %
- Line Total = Net + Tax
- GRN Total = Sum(Line Totals) + Extra Costs

### BR-GRN-005: Discrepancy Handling
- Quantity discrepancy auto-flagged if |delivered - ordered| > 0
- Rejected quantity must have rejection reason
- Damaged goods tracked separately from rejected
- Received Qty + Rejected Qty + Damaged Qty = Delivered Qty

### BR-GRN-006: Multi-PO Constraints
- All POs in single GRN must be from same vendor
- All POs must be in same currency (or base currency)
- Cannot mix different exchange rates in single GRN
- Each line item references one PO line item (or manual entry)

### BR-GRN-007: Inventory Impact
- Stock movements created only when status = COMMITTED
- Rejected and damaged quantities do not increase inventory
- Only received quantity (accepted) increases on-hand stock
- Stock movement cannot be reversed (must create adjustment)
- GRN creates inventory layers with unit cost data used for inventory valuation
- Inventory costing method (FIFO or Periodic Average) is configured at system level (System Administration → Inventory Settings) and determines how costs are calculated when inventory is consumed (e.g., credit note returns, requisitions)

### BR-GRN-008: Location Type Business Rules

GRN processing behavior varies based on the **location type** of the receiving location. The system supports three location types that determine whether inventory balances are updated and how costs are recorded.

#### Location Type Definitions

| Location Type | Code | Purpose | Examples |
|---------------|------|---------|----------|
| **INVENTORY** | INV | Standard tracked warehouse locations | Main Warehouse, Central Kitchen Store |
| **DIRECT** | DIR | Direct expense locations (no stock balance) | Restaurant Bar Direct, Kitchen Direct |
| **CONSIGNMENT** | CON | Vendor-owned inventory locations | Beverage Consignment, Linen Consignment |

#### BR-GRN-008.1: Location Type Processing Rules

**INVENTORY Locations (INV)**:
- ✅ Standard GRN processing with stock balance update
- ✅ Creates FIFO cost layer with lot tracking
- ✅ Updates inventory asset balance
- ✅ GL: Debit Inventory Asset, Credit Accounts Payable
- ✅ Full stock movement recorded
- ✅ Stock card updated with receipt details

**DIRECT Locations (DIR)**:
- ❌ No stock-in or balance update (items expensed on receipt)
- ❌ No cost layer created
- ✅ GRN recorded for audit and AP matching
- ✅ GL: Debit Department Expense, Credit Accounts Payable
- ⚠️ Items filtered out from stock movement display
- ⚠️ Alert displayed indicating direct expense processing

**CONSIGNMENT Locations (CON)**:
- ✅ Creates consignment stock layer with vendor ownership
- ✅ Updates consignment stock balance
- ✅ Vendor liability tracking (not asset until consumption)
- ✅ GL: Debit Consignment Asset, Credit Vendor Liability
- ✅ Full stock movement recorded with vendor ownership indicator
- ✅ Stock card shows vendor-owned quantities

#### BR-GRN-008.2: Location Type Feature Matrix

| Feature | INVENTORY | DIRECT | CONSIGNMENT |
|---------|-----------|--------|-------------|
| **Stock Balance Update** | ✅ Yes | ❌ No | ✅ Yes (vendor-owned) |
| **Cost Layer Creation** | ✅ FIFO layer | ❌ None | ✅ FIFO layer (vendor) |
| **Lot Tracking** | ✅ Full | ❌ None | ✅ Full |
| **Batch/Expiry** | ✅ Tracked | ❌ Not tracked | ✅ Tracked |
| **GL Posting** | Asset increase | Expense posting | Vendor liability |
| **Stock Movement Display** | ✅ Shown | ❌ Filtered out | ✅ Shown |
| **Stock Card** | ✅ Updated | ❌ Not maintained | ✅ Updated (vendor) |
| **AP Matching** | ✅ Full | ✅ Full | ✅ Full |

#### BR-GRN-008.3: Location Type Validation Rules

1. **Mixed Location Type GRN**:
   - Single GRN can receive items to multiple location types
   - Each line item's processing determined by its destination location type
   - Summary shows breakdown by location type

2. **UI Behavior**:
   - Location type badge displayed in location selection
   - Alert banner when receiving to DIRECT location
   - Stock movement tab shows count of filtered DIRECT items
   - Consignment items show vendor ownership indicator

3. **Reporting Impact**:
   - DIRECT items excluded from inventory valuation reports
   - DIRECT items included in expense reports by department
   - Stock movement report filters DIRECT items by default

---

## 5. Integration Points

### 5.1 Purchase Order Module
- Retrieve open/partial POs by vendor
- Link GRN line items to PO line items
- Update PO item status (partial/fully received)
- Update PO header status based on items received

### 5.2 Inventory Management
- Create stock movement transactions
- Update on-hand inventory quantities
- Update storage location balances
- Record batch/lot numbers and expiry dates
- Create inventory layers with unit cost for inventory valuation (supports FIFO and Periodic Average costing methods)

### 5.3 Accounts Payable
- Trigger AP invoice matching
- Create journal voucher for GRN
- Update vendor payable balance
- Three-way matching: PO - GRN - Invoice

### 5.4 General Ledger
- Post inventory receipt entries
- Debit inventory account
- Credit accounts payable
- Handle tax entries (input VAT)
- Cost center allocation

### 5.5 Vendor Management
- Retrieve vendor master data
- Track vendor delivery performance
- Update last purchase date and price
- Feed vendor evaluation metrics

---

## 6. Assumptions and Dependencies

### Assumptions
- Users have basic computer and warehouse operations knowledge
- Vendors provide accurate delivery notes and invoices
- Network connectivity available in receiving areas
- Purchase orders created before goods delivered (in normal workflow)
- System exchange rates updated daily

### Dependencies
- Purchase Order module operational
- Vendor master data maintained
- Product catalog current and complete
- Storage locations configured
- GL account codes defined
- User roles and permissions assigned
- Exchange rate table updated

---

## 7. Success Criteria

- 100% of goods receipts documented in system
- 95% of GRNs created from POs (vs manual)
- <5% discrepancy rate on received goods
- GRN committed within 24 hours of receipt
- Zero accounting errors from GRN entries
- 90% user satisfaction rating
- <2 seconds average page load time
- Zero data loss incidents

---

## 8. Future Enhancements (Out of Scope for Current Release)

**Note**: Mobile app with QR/Barcode scanning is already implemented (see FR-GRN-016).

**Desktop Enhancements**:
- QR code generation on PO printouts for mobile scanning
- **Webcam-based QR scanning during GRN creation** - Allow desktop users to scan PO QR codes using webcam as alternative to manual selection during the PO selection step of GRN creation workflow
- Barcode printing for inventory items
- Quality inspection workflow integration
- Automatic discrepancy notification to purchasing
- Vendor performance scoring based on GRN data
- Predictive analytics for delivery times
- Integration with weighing scales
- RFID tag support for high-value items
- Blockchain-based audit trail

**Mobile Enhancements** (Beyond Current Implementation):
- Batch/Lot barcode scanning (scan individual item barcodes)
- Multi-item scanning (scan all items in delivery at once)
- Photo capture of damaged goods (camera integration)
- Signature capture for delivery acceptance
- Weight scale integration (Bluetooth scales)
- GPS location verification (geofence receiving area)
- Augmented reality (AR) location guidance
- Voice-to-text for comments and notes
- Offline mode with full sync capability

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-02 | System Analyst | Initial BR document based on code analysis |
| 1.1 | 2025-12-02 | System Analyst | Added FR-GRN-016: QR/Barcode Scanning for Mobile Receiving with complete scan workflow documentation |
| 1.2 | 2025-12-02 | System Analyst | Added desktop webcam-based QR scanning to Future Enhancements |
| 1.3 | 2025-12-03 | Documentation Team | Added context for inventory costing methods (FIFO or Periodic Average) used for inventory valuation |

**Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Owner | | | |
| Project Manager | | | |
| IT Manager | | | |
