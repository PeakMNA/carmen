# Business Requirements: Goods Received Note (GRN)

**Module**: Procurement
**Sub-module**: Goods Received Note
**Document Version**: 2.0
**Last Updated**: 2026-01-15

---

## 1. Overview

### 1.1 Purpose
The Goods Received Note (GRN) module enables receiving clerks and storekeeper staff to record and validate delivery of goods from vendors, reconcile deliveries against purchase orders, manage inventory receipts, and maintain accurate stock records for hotel operations.

### 1.2 Scope
- GRN creation from purchase orders (single or multiple POs)
- Manual GRN creation without PO reference
- Multi-PO receiving capability (single GRN can receive items from multiple POs)
- Hierarchical items view with Product → Location → PO grouping
- Delivery validation and discrepancy tracking
- Free of Charge (FOC) quantity handling
- Extra cost allocation (freight, handling, customs, insurance)
- Stock movement integration with location type processing
- Financial accounting integration with journal entries
- Multi-currency transaction support with exchange rates
- Purchase Request (PR) allocation tracking for business context
- Tax handling (GST/VAT, inclusive/exclusive modes)

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

### FR-GRN-002: Create GRN from Purchase Order (PO-Based Wizard)
**Priority**: High
**User Story**: As a Receiving Clerk, I want to create a GRN from one or multiple purchase orders using a guided wizard so that I can efficiently record deliveries and auto-populate item details.

**Requirements**:

**Step 1 - Vendor Selection** (`vendor-selection`):
- Select vendor from active vendor list with search functionality
- Display vendor details (name, code, contact information)
- Filter vendors by status (active only)
- Search by vendor name or code

**Step 2 - PO Selection** (`po-selection`):
- Display open/partial POs for selected vendor
- Allow multi-select of POs to consolidate receiving
- Show PO details: number, date, total amount, status
- Filter by PO status (OPEN, PARTIAL)
- Show remaining quantity per PO

**Step 3 - Item & Location Selection** (`item-location-selection`):
- Display all items from selected POs in a consolidated list
- **Location Type Handling**:
  - INVENTORY (INV): Standard receiving with full inventory tracking
  - DIRECT (DIR): Items expensed immediately (no stock-in)
  - CONSIGNMENT (CON): Items tracked as vendor-owned inventory
- Location filter badges with icons indicating location type
- Alert displayed when Direct Expense locations selected
- Specify receiving quantities and storage locations per item
- Select/Deselect All functionality
- Search by item name, description, or PO number
- Display columns: Item, PO #, Location, Ordered, Remaining, Receiving Qty/Unit, Amount
- Show base quantity and base amount calculations
- Unit selection dropdown for receiving unit changes
- Navigate to GRN detail page in `confirm` mode after selection

**Auto-Population**:
- Item details from PO (name, ordered quantity, unit price, tax rate)
- Currency and exchange rate from PO
- Vendor information from PO

**Acceptance Criteria**:
- Vendor selection shows only active vendors
- PO selection shows only OPEN or PARTIAL status POs
- Can select multiple POs from same vendor
- Item details pre-fill from PO accurately
- Can specify different storage location per item
- Received quantity cannot exceed remaining PO quantity
- Location type icons help users understand processing behavior
- Creates GRN data and navigates to confirm page

**Source**:
- `app/(main)/procurement/goods-received-note/new/vendor-selection/page.tsx`
- `app/(main)/procurement/goods-received-note/new/po-selection/page.tsx`
- `app/(main)/procurement/goods-received-note/new/item-location-selection/page.tsx`
- `lib/store/grn-creation.store.ts` (Zustand store for wizard state)

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

**Source**: `app/(main)/procurement/goods-received-note/new/manual-entry/page.tsx`

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
- **Base Currency**: System base currency for conversion
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
- `app/(main)/procurement/goods-received-note/components/GoodsReceiveNoteDetail.tsx`

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
- **Delivered Quantity**: Quantity delivered by vendor
- **Received Quantity**: Actual quantity accepted
- **Rejected Quantity**: Quantity rejected (with reason)
- **Damaged Quantity**: Quantity damaged
- **Unit**: Unit of measure (with conversion support)
- **Unit Price**: Cost per unit
- **Subtotal**: Quantity × Price
- **Discount Rate/Amount**: Line discount
- **Tax Rate/Amount**: Line tax (GST/VAT)
- **Tax Included Flag**: Indicates tax-inclusive pricing
- **Tax System**: GST or VAT selection
- **Net Amount**: Subtotal - Discount
- **Total Amount**: Net + Tax
- **Storage Location**: Warehouse/kitchen location
- **Delivery Point**: Specific receiving location
- **Job Code**: Project/job reference
- **Event**: Associated event
- **Project**: Associated project
- **Market Segment**: Business segment
- **Delivery Date**: Expected/actual delivery date
- **Notes**: Line item remarks
- **Batch/Lot Number**: For traceability
- **Expiry Date**: For perishables
- **Serial Number**: For serialized items
- **Discrepancy Flag**: Auto-set when quantities don't match
- **Discrepancy Type**: quantity, quality, specification, damage
- **Discrepancy Notes**: Explanation of discrepancy

**FOC (Free of Charge) Fields**:
- **FOC Quantity**: Free quantity received
- **FOC Unit**: Unit for FOC quantity
- **FOC Conversion Rate**: Conversion to base unit
- **Is Free of Charge Flag**: Mark entire line as FOC

**Consignment Fields**:
- **Is Consignment Flag**: Mark as consignment item

**Acceptance Criteria**:
- Support adding/editing/deleting line items
- Unit price validates against PO (if from PO)
- Storage location must be valid
- Discrepancies auto-flagged when ordered vs received quantities don't match
- Can mark items as Free of Charge (FOC)
- FOC quantities tracked separately
- Financial calculations accurate (discount, tax, totals)
- Tax-inclusive pricing correctly calculates base amounts

**Source**:
- `lib/types/procurement.ts:378-410` (GoodsReceiveNoteItem interface)
- `app/(main)/procurement/goods-received-note/components/tabs/itemDetailForm.tsx`
- `app/(main)/procurement/goods-received-note/components/tabs/GRNItemsHierarchical.tsx`

---

### FR-GRN-006: Hierarchical Items View
**Priority**: High
**User Story**: As a Receiving Clerk, I want to view GRN items in a hierarchical structure grouped by Product → Location → PO so that I can easily manage multi-PO receiving and understand item distribution.

**Requirements**:
- **Product Level Grouping**: Group items by product/item ID
- **Location Level Grouping**: Within product, group by storage location
- **PO Line Level**: Show individual PO lines within location group
- **Expand/Collapse**: Collapsible sections for products and locations
- **Expand All / Collapse All**: Bulk expand/collapse controls
- **4-Column Entry Grid**: Received Qty, Receive Unit, FOC Qty, FOC Unit
- **Item Selection**: Checkbox selection for bulk actions
- **Detail Panel**: Right-side Sheet component for item details
- **Totals Display**: Show totals per product, per location, and overall

**Acceptance Criteria**:
- Items grouped correctly by Product → Location → PO hierarchy
- Expand/Collapse works at both product and location levels
- Expand All/Collapse All affects all groups
- Detail panel opens when item row clicked
- Bulk selection works across all hierarchy levels
- Totals calculate correctly at each level

**Source**:
- `app/(main)/procurement/goods-received-note/components/tabs/GRNItemsHierarchical.tsx`
- `app/(main)/procurement/goods-received-note/lib/groupItems.ts`

---

### FR-GRN-007: Item Detail Form (5-Tab Interface)
**Priority**: High
**User Story**: As a Receiving Clerk, I want a comprehensive item detail form with organized tabs so that I can enter and review all item information efficiently.

**Requirements**:

**Tab 1 - Details**:
- Item name and description
- Location and delivery point
- Job code, event, project, market segment
- Lot/batch number
- Serial number
- Expiry date
- Notes

**Tab 2 - Quantity**:
- Ordered quantity and unit
- Received quantity and unit
- FOC quantity and unit
- Base quantity calculations
- Conversion rates
- Delivered vs received tracking
- Rejected/damaged quantities
- Remaining quantity to receive

**Tab 3 - Pricing**:
- Unit price (transaction currency)
- Tax rate and tax system (GST/VAT)
- Tax inclusive/exclusive toggle
- Discount rate and amount
- Subtotal, net amount, tax amount, total amount
- Exchange rate
- Base currency amounts
- Extra cost allocation
- Multi-currency display

**Tab 4 - Related PRs**:
- List of related Purchase Requests
- PR allocation tracking:
  - PR number and line number
  - Job code, event, project from PR
  - Requester and department
  - Requested quantity vs received
  - Previously received quantity
  - This GRN quantity allocation
  - Remaining quantity
- Add/Edit/Delete PR allocations
- Validation that allocations don't exceed received quantity

**Tab 5 - Inventory**:
- Current on-hand quantity
- On-order quantity
- Reorder threshold
- Restock level
- Last purchase price
- Last order date
- Last vendor

**Acceptance Criteria**:
- All five tabs accessible and functional
- Tab switching preserves data entry
- Real-time calculations update across tabs
- PR allocations validate against received quantity
- Inventory information read-only (reference only)

**Source**: `app/(main)/procurement/goods-received-note/components/tabs/itemDetailForm.tsx`

---

### FR-GRN-008: Multi-PO Receiving Support
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

### FR-GRN-009: Extra Costs Allocation
**Priority**: Medium
**User Story**: As an AP Clerk, I want to allocate additional costs (freight, handling, customs, insurance) to received goods so that total landed cost is accurately calculated.

**Requirements**:
- Add extra cost entries: type, amount
- **Cost Types**: Shipping, Handling, Insurance, Other
- **Distribution Methods** (Radio Selection):
  - **Net Amount (NET_AMOUNT)**: Distribute proportionally by line net amount
  - **Quantity Ratio (QUANTITY)**: Distribute proportionally by quantity received
- Add/Delete cost entries dynamically
- Auto-calculate distributed cost per line item
- Display total extra costs
- Update line item total costs with allocated extras

**Acceptance Criteria**:
- Can add multiple extra cost entries
- Cost type must be selected from predefined list
- Amount must be positive number
- Distribution method selection via radio buttons
- Line item costs update automatically when distribution method changes
- Extra costs included in financial totals
- Delete confirmation for cost removal

**Source**:
- `lib/types/procurement.ts:329-333` (CostDistributionMethod enum)
- `app/(main)/procurement/goods-received-note/components/tabs/ExtraCostsTab.tsx`

---

### FR-GRN-010: Stock Movement Integration
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
- **Location Type Processing**:
  - INVENTORY: Standard stock-in with inventory tracking
  - DIRECT: Immediate expense (no stock movement)
  - CONSIGNMENT: Vendor-owned inventory tracking

**Acceptance Criteria**:
- Stock movements created only when GRN status = COMMITTED
- Each line item creates one stock movement (except DIRECT type)
- Inventory quantities increase by received amount
- Rejected/damaged quantities handled separately
- Can view stock movements from GRN detail page
- Movement transaction is atomic (all or none)
- Location type determines processing behavior

**Source**:
- `app/(main)/procurement/goods-received-note/components/tabs/StockMovementTab.tsx`
- `app/(main)/procurement/goods-received-note/components/tabs/stock-movement.tsx`
- `lib/utils/location-type-helpers.ts`

---

### FR-GRN-011: Financial Summary and Journal Entries
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

**Journal Voucher Display**:
- **JV Number**: Auto-generated journal voucher number
- **JV Date**: Receipt date
- **JV Status**: Posted/Pending
- **JV Reference**: GRN number reference
- **Journal Entries Table**:
  - Account (GL account code and name)
  - Department
  - Description
  - Debit Amount (transaction currency)
  - Credit Amount (transaction currency)
  - Base Debit Amount (base currency)
  - Base Credit Amount (base currency)
- **Balance Indicator**: Shows Balanced/Unbalanced status
- **Recalculate Button**: Trigger recalculation of entries

**Accounting Entries**:
- Debit: Inventory account
- Credit: Accounts Payable
- Tax entries (input VAT/GST)
- Cost center allocation
- Department breakdown

**Acceptance Criteria**:
- Financial summary calculates automatically
- Multi-currency amounts displayed correctly
- Exchange rate applied consistently
- Journal entries display all accounting lines
- Debits equal credits (balanced indicator)
- Recalculate button triggers fresh calculation
- Tax calculations accurate
- Extra costs included in totals

**Source**:
- `app/(main)/procurement/goods-received-note/components/tabs/FinancialSummaryTab.tsx`
- `app/(main)/procurement/goods-received-note/components/SummaryTotal.tsx`

---

### FR-GRN-012: GRN Status Workflow
**Priority**: High
**User Story**: As a Receiving Clerk, I want clear status workflow for GRN lifecycle so that I can track document progress and ensure proper controls.

**Requirements**:
- **DRAFT**: Initial creation, editable, no inventory impact
- **RECEIVED**: Goods physically received, pending verification
- **COMMITTED**: Verified and committed, inventory updated, creates stock movements
- **VOID**: Cancelled GRN, reverses inventory impact

**Status Transitions**:
```
DRAFT → RECEIVED → COMMITTED
                 ↘ VOID
```

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

### FR-GRN-013: Multi-Currency Support
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
- **Multi-Currency Display**:
  - Transaction currency amounts in primary display
  - Base currency amounts shown below/beside
  - Exchange rate visible in header

**Acceptance Criteria**:
- Can select any active currency
- Exchange rate auto-populated
- Can override exchange rate manually
- All amounts calculated in transaction currency
- Base currency amounts calculated automatically
- Both currencies displayed in financial summary
- Exchange rate locked when GRN committed
- Line items show both currency amounts

**Source**:
- `app/(main)/procurement/goods-received-note/components/GoodsReceiveNoteDetail.tsx`
- `app/(main)/procurement/goods-received-note/components/tabs/itemDetailForm.tsx`

---

### FR-GRN-014: Purchase Request Allocation Tracking
**Priority**: Medium
**User Story**: As a Purchasing Staff, I want to track which Purchase Requests are being fulfilled by a GRN so that business context (job codes, events, projects) is maintained for cost allocation.

**Requirements**:
- **Related PR Information**:
  - PR Number and Line Number
  - PR Line Item ID
  - Job Code (with name)
  - Event (with name)
  - Project (with name)
  - Market Segment (with name)
  - Requester Name and Department

- **Quantity Tracking**:
  - Requested Quantity (PR qty) and Unit
  - Requested Base Quantity and Base Unit
  - Previously Received Quantity (from other GRNs)
  - This GRN Quantity allocation
  - Remaining Quantity to receive
  - Conversion Rate

- **Allocation Management**:
  - Add PR allocations to GRN item
  - Edit existing allocations
  - Delete allocations
  - Validate total allocation doesn't exceed received quantity

**Acceptance Criteria**:
- Can link multiple PRs to single GRN item
- Business context (job, event, project) inherited from PR
- Quantity allocations tracked at PR line level
- Validation prevents over-allocation
- Remaining quantity updates automatically
- PR allocations visible in item detail form

**Source**:
- `app/(main)/procurement/goods-received-note/components/tabs/itemDetailForm.tsx` (RelatedPRAllocation interface)

---

### FR-GRN-015: Comments and Attachments
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

### FR-GRN-016: Activity Log and Audit Trail
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

### FR-GRN-017: Bulk Actions on Line Items
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

### FR-GRN-018: Export and Print
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

**Source**: `app/(main)/procurement/goods-received-note/page.tsx`

---

### FR-GRN-019: QR/Barcode Scanning for Mobile Receiving
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

**Source**:
- `cmobile/src/app/(mobile)/receiving/page.tsx`
- `cmobile/src/app/(mobile)/receiving/scan-po/page.tsx`
- `cmobile/src/app/(mobile)/receiving/grn-detail/page.tsx`

**Platform**: Mobile Web App (PWA) - Next.js 15, React 19, Tailwind CSS 4

---

### FR-GRN-020: Consignment and Cash Purchase Handling
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

**Source**: `app/(main)/procurement/goods-received-note/components/GoodsReceiveNoteDetail.tsx`

---

### FR-GRN-021: GRN Detail Page Modes
**Priority**: High
**User Story**: As a system user, I want the GRN detail page to support different modes so that I can view, edit, add, or confirm GRNs appropriately.

**Requirements**:
- **View Mode**: Read-only display of GRN data
- **Edit Mode**: Full editing capability for DRAFT/RECEIVED GRNs
- **Add Mode**: Create new manual GRN
- **Confirm Mode**: Review and confirm PO-based GRN from wizard

**Mode Behaviors**:
- View: All fields read-only, no save button
- Edit: Fields editable, save/cancel buttons
- Add: Empty form, all fields editable
- Confirm: Review data from wizard, confirm/cancel buttons

**URL Pattern**: `/procurement/goods-received-note/{id}?mode={view|edit|add|confirm}`

**Acceptance Criteria**:
- Mode determined by URL query parameter
- UI adapts to mode (buttons, editability)
- Confirm mode shows data populated from wizard
- Invalid mode defaults to view mode
- New GRN uses temporary ID until saved

**Source**: `app/(main)/procurement/goods-received-note/[id]/page.tsx`

---

## 3. Non-Functional Requirements

### NFR-GRN-001: Performance
- GRN list loads within 2 seconds for up to 10,000 records
- GRN detail page loads within 1 second
- Save/update operations complete within 3 seconds
- Search returns results within 2 seconds
- Export to Excel completes within 10 seconds for 500 line items
- Hierarchical grouping calculates in under 500ms

### NFR-GRN-002: Usability
- Mobile-responsive interface for warehouse tablet use
- Touch-friendly controls for receiving staff
- Keyboard shortcuts for frequent actions
- Auto-save draft functionality (every 30 seconds)
- Confirmation prompts for destructive actions
- Hierarchical view supports expand/collapse for easy navigation

### NFR-GRN-003: Data Integrity
- All financial calculations rounded to 2 decimal places
- Quantity fields support 3 decimal places
- Exchange rates stored with 4 decimal places
- Database transactions ensure atomicity
- Concurrent edit detection prevents data conflicts
- PR allocations validated against received quantities

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
- Line Tax = Net × Tax % (or reverse calculated if tax-inclusive)
- Line Total = Net + Tax
- GRN Total = Sum(Line Totals) + Extra Costs
- Base amounts = Transaction amounts / Exchange Rate

### BR-GRN-005: Discrepancy Handling
- Quantity discrepancy auto-flagged if |delivered - ordered| > 0
- Rejected quantity must have rejection reason
- Damaged goods tracked separately from rejected
- Received Qty + Rejected Qty + Damaged Qty = Delivered Qty
- Discrepancy types: quantity, quality, specification, damage

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
- GRN creates inventory layers with unit cost data for valuation
- Location type determines processing: INV = stock-in, DIR = expense, CON = consignment tracking

### BR-GRN-008: FOC (Free of Charge) Handling
- FOC quantity tracked separately from paid quantity
- FOC has separate unit and conversion rate
- FOC items included in inventory but not in financial totals
- Line can be marked entirely as FOC (isFreeOfCharge flag)

### BR-GRN-009: PR Allocation Rules
- Total PR allocation quantity cannot exceed GRN received quantity
- PR business context (job, event, project) inherited for cost allocation
- Multiple PRs can be allocated to single GRN item
- Remaining PR quantity updates based on GRN allocation

### BR-GRN-010: Extra Cost Distribution
- NET_AMOUNT: Cost distributed proportionally by line net amount
- QUANTITY: Cost distributed proportionally by received quantity
- Distribution recalculates when method changes
- Extra costs included in total landed cost

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
- Create inventory layers with unit cost for valuation
- Support FIFO and Periodic Average costing methods
- Handle location type processing (INV/DIR/CON)

### 5.3 Accounts Payable
- Trigger AP invoice matching
- Create journal voucher for GRN
- Update vendor payable balance
- Three-way matching: PO - GRN - Invoice

### 5.4 General Ledger
- Post inventory receipt entries
- Debit inventory account
- Credit accounts payable
- Handle tax entries (input VAT/GST)
- Cost center allocation

### 5.5 Vendor Management
- Retrieve vendor master data
- Track vendor delivery performance
- Update last purchase date and price
- Feed vendor evaluation metrics

### 5.6 Purchase Request Module
- Link GRN items to PR line items
- Inherit business context (job, event, project, market segment)
- Track PR fulfillment status
- Allocate received quantities across PRs

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
- Storage locations configured with location types
- GL account codes defined
- User roles and permissions assigned
- Exchange rate table updated
- Purchase Request module operational (for PR allocation)

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
- PR allocations tracked for 100% of PO-based GRNs

---

## 8. Future Enhancements (Out of Scope for Current Release)

**Note**: Mobile app with QR/Barcode scanning is already implemented (see FR-GRN-019).

**Desktop Enhancements**:
- QR code generation on PO printouts for mobile scanning
- Webcam-based QR scanning during GRN creation
- Barcode printing for inventory items
- Quality inspection workflow integration
- Automatic discrepancy notification to purchasing
- Vendor performance scoring based on GRN data
- Predictive analytics for delivery times
- Integration with weighing scales
- RFID tag support for high-value items

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
| 1.1 | 2025-12-02 | System Analyst | Added FR-GRN-016: QR/Barcode Scanning for Mobile Receiving |
| 1.2 | 2025-12-02 | System Analyst | Added desktop webcam-based QR scanning to Future Enhancements |
| 1.3 | 2025-12-03 | Documentation Team | Added inventory costing methods context |
| 2.0 | 2026-01-15 | System Analyst | Major update: Added hierarchical items view (FR-GRN-006), 5-tab item detail form (FR-GRN-007), PR allocation tracking (FR-GRN-014), FOC handling (BR-GRN-008), location type processing, detail page modes (FR-GRN-021), and comprehensive field documentation from source code analysis |

**Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Owner | | | |
| Project Manager | | | |
| IT Manager | | | |
