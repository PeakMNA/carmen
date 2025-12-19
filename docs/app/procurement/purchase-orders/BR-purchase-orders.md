# Business Requirements: Purchase Orders

## Module Information
- **Module**: Procurement
- **Sub-Module**: Purchase Orders
- **Route**: `/procurement/purchase-orders`
- **Version**: 1.4.0
- **Last Updated**: 2025-12-19
- **Owner**: Procurement Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.4.0 | 2025-12-19 | System Analyst | Simplified FR-PO-002 PR selection table (PR#, Date, Description only), added PO Summary dialog workflow, removed "Create from Template" and "Create Recurring PO" UI options (FR-PO-015 marked as backend-only), updated grouping to vendor + currency (not delivery date) |
| 1.3.0 | 2025-12-02 | System Analyst | Added FR-PO-017: QR Code Generation for Mobile Receiving Integration with implementation details, updated PDF generation section, updated dependencies with qrcode library v1.5.3 |
| 1.2.0 | 2025-12-01 | System | Enhanced PO Item Details dialog with inventory indicators (On Hand, On Order, Received), Related PR section, Order Summary with financial calculations, and linked mock data with sourceRequestId |
| 1.1.0 | 2025-12-01 | System | Added Comments & Attachments sidebar feature; Updated page layout to match PR page pattern |
| 1.0.0 | 2025-10-31 | System | Initial version based on comprehensive code analysis |


## Overview

The Purchase Orders module manages the entire lifecycle of purchase orders in the hotel procurement system, from creation through vendor acknowledgment to goods receipt. Purchase Orders represent formal commitments to vendors for goods or services, containing agreed-upon prices, quantities, delivery dates, and terms.

**IMPORTANT**: Unlike Purchase Requests which require multi-stage approvals, Purchase Orders are created by authorized purchasing staff (buyers) and represent **already finalized purchasing decisions**. POs do not have approval workflows - they are created from approved PRs or directly by purchasing staff with proper authorization. The workflow focuses on **operational status transitions** (sending to vendor, acknowledgment, receiving), not approvals.

The module supports multiple creation methods including blank PO creation, **intelligent creation from approved Purchase Requests with automatic vendor/currency/delivery-date grouping**, and bulk PO generation.

The system provides comprehensive tracking of PO status progression (draft → sent → acknowledged → partial receipt → fully received → closed), vendor communications, receiving operations, and financial reconciliation with invoices.

## Business Objectives

1. **Formalize purchasing commitments** - Convert approved purchase requests into legally binding purchase orders with complete vendor and item details
2. **Optimize vendor consolidation** - Automatically group approved PRs by vendor, currency, and delivery date to minimize orders and maximize purchasing efficiency
3. **Enable efficient receiving** - Provide seamless integration with Goods Receipt Note (GRN) module for accurate tracking of deliveries and inventory updates
4. **Ensure financial accuracy** - Maintain precise pricing, tax calculations, and discounts for 3-way matching (PO-GRN-Invoice) in accounts payable
5. **Track order fulfillment** - Monitor PO status from creation through complete receipt, including partial deliveries and pending quantities
6. **Support multi-currency operations** - Handle purchase orders in various currencies with exchange rate tracking for international hotel operations
7. **Maintain vendor relationships** - Track PO communications, vendor acknowledgments, and delivery performance
8. **Provide audit trails** - Record all PO changes, status transitions, and actions for compliance and dispute resolution
9. **Enable reporting and analytics** - Support spend analysis, vendor performance tracking, and procurement KPIs

## Key Stakeholders

- **Primary Users**: Purchasing Staff/Buyers (create and manage POs), Purchasing Manager/Chief Buyer (oversee procurement, review high-value POs)
- **Secondary Users**: Receiving Staff (reference POs during goods receipt), Department Managers (track their requisitions converted to POs)
- **Administrators**: System Administrator (PO templates, settings, workflow configuration)
- **Reviewers**: Accounts Payable Staff (3-way matching), Internal Auditors (compliance review), Financial Manager (budget monitoring)
- **Support**: IT Support (technical issues), Procurement Support (user training and assistance)
- **External**: Vendors/Suppliers (receive and fulfill POs), Delivery Services (transport goods)

---

## Functional Requirements

### FR-PO-001: Purchase Order List View
**Priority**: High

**User Story**: As a purchasing staff member, I want to view all purchase orders in a sortable and filterable list so that I can quickly find specific orders and monitor their status.

**Requirements**:
- Display paginated list of all purchase orders with columns:
  * PO Number (clickable link to detail page)
  * Order Date
  * Vendor Name
  * Status Badge (color-coded: Draft=gray, Sent=blue, Acknowledged=purple, Partial=yellow, Fully Received=green, Cancelled=red, Closed=dark gray)
  * Currency Code
  * Total Amount (formatted with currency symbol)
  * Expected Delivery Date
  * Items Received / Total Items (e.g., "5/10")
- Support both table view and card view modes
- Quick filters for common status categories
- Advanced filtering: status, date ranges, vendor, currency, amount, department/location
- Search across PO number, vendor name, items
- Sorting by any column
- Pagination (10, 20, 50, 100 records per page)
- Bulk actions: Export (Excel, CSV, PDF), Print, Send to Vendor
- Summary statistics: Total POs, Total value, Count by status

**Acceptance Criteria**:
- List loads within 2 seconds with 1000+ PO records
- Filters apply instantly (<500ms response)
- Status badges use consistent color coding
- Card view is mobile-responsive
- Export includes all filtered/sorted data
- Can navigate to referenced Purchase Requests
- Summary statistics update with filters

**Related Requirements**: FR-PO-002, FR-PO-003, FR-PO-015

---

### FR-PO-002: Create Purchase Order from Approved Purchase Requests
**Priority**: High

**User Story**: As a purchasing staff member, I want to convert approved purchase requests into purchase orders with intelligent vendor grouping so that I can consolidate orders efficiently and reduce vendor communications.

**Requirements**:

**Entry Point**:
- "New PO" dropdown menu → "Create from Purchase Requests" option

**PR Selection Interface**:
- **Access Points**:
  * Dialog mode: "New PO" dropdown menu → "Create from Purchase Requests" opens dialog
  * Page mode: `/procurement/purchase-orders/create/from-pr` provides full-page experience
- Display list of all approved Purchase Requests (status = 'approved')
- Filter out PRs already fully converted to POs
- **Simplified Table Columns** (cleaner selection experience):
  * Checkbox (selection)
  * PR# (purchase request number)
  * Date (request date)
  * Description (PR description)
- Multi-select checkboxes with row-click selection
- Search/filter by PR number, description
- **Design Language** (consistent with PO Summary dialog):
  * Page header with Package icon in `bg-primary/10` circle
  * Info banner: `bg-blue-50`, `border-blue-200` explaining automatic grouping
  * Workflow indicator: Shows "Select PRs → Review Summary → Create PO(s)"
  * Main card with `border-l-4 border-l-primary` accent
  * Selection badge: Green badge with CheckCircle icon showing count

**PO Summary Dialog** (displayed before creation):
- Triggered when user clicks "Create PO" button
- Shows grouped PRs with creation preview:
  * Header: "X PRs selected → Y PO(s) will be created"
  * For each PO to be created:
    - PO number placeholder (auto-generated on save)
    - Vendor name with Building icon
    - Delivery date with Calendar icon
    - Total amount with currency badge (green)
    - List of source PR numbers as badges
  * Grand total (if multiple POs)
- **Design Language**:
  * Scrollable dialog body with `overflow-y-auto` and `min-h-0` for flex layout
  * Card-based layout per PO group
  * `border-l-4 border-l-primary` accent on each card
  * Green badges for currency amounts
- Action buttons: "Cancel" and "Confirm & Create"
- User must confirm before navigation to create page

**Automatic Grouping Logic**:
- Group selected PRs by two criteria:
  1. Vendor ID (must match exactly)
  2. Currency Code (must match exactly)
- Each unique vendor+currency combination creates ONE purchase order
- Example: 10 PRs with 3 different vendor/currency combinations → 3 POs created
- Note: Delivery date is NOT a grouping criterion (PRs with same vendor+currency but different dates go to same PO)

**Create Button Behavior**:
- Button text: "Create PO" (always, regardless of group count)
- Disabled if no PRs selected
- Opens PO Summary dialog on click (not direct navigation)

**Two Creation Paths**:

**Path A - Single PO Creation** (when only 1 group):
- Store grouped data in localStorage
- Navigate to: `/procurement/purchase-orders/create?mode=fromPR&grouped=true`
- Open PO detail page in edit mode
- Pre-populate all fields from PR data:
  * Vendor ID and name
  * Currency code and exchange rate
  * Expected delivery date (from PR)
  * PO description: "Purchase Order created from X items from PR: PR-001, PR-002"
  * All line items from all PRs in group
- Source PR traceability fields:
  * `purchaseRequisitionIds[]` - array of PR IDs
  * `purchaseRequisitionNumbers[]` - array of PR numbers
  * Each line item has: `sourcePRId`, `sourcePRNumber`, `sourcePRItemId`
- User can edit before saving
- Status starts as DRAFT

**Path B - Bulk PO Creation** (when multiple groups):
- Store all grouped data in localStorage
- Navigate to: `/procurement/purchase-orders/create/bulk`
- Display summary page showing all POs to be created
- Card-based layout, one card per PO group:
  * Vendor name with icon
  * Currency and delivery date
  * Item count and source PR count
  * Total amount in PO currency
  * Full item list table within card
- "Back to Reselect PRs" button (returns to selection, clears localStorage)
- "Create All X POs" button
- Creates all POs in sequence (server-side batch operation)
- Success screen:
  * Checkmark icon and success message
  * List of created PO numbers with "View PO" button
  * "View All Purchase Orders" button
  * "Back to Purchase Requests" button

**Data Transformation (PR → PO)**:

*Header level*:
- orderNumber: Auto-generated (PO-YYMM-NNNN)
- orderDate: Current date/time
- vendorId, vendorName: From PR
- status: 'draft'
- currency: From PR
- exchangeRate: Current rate or PR rate
- deliveryLocationId: From PR
- expectedDeliveryDate: From PR required date
- paymentTerms: Default from vendor master
- approvedBy: Current user ID (purchasing staff are pre-authorized)
- approvedAt: Current timestamp
- notes: Auto-generated with PR references

*Line item level*:
- itemId, itemCode, itemName: From PR item
- description, specification: From PR item
- orderedQuantity: From PR `approvedQuantity` (or `requestedQuantity`)
- unit: From PR item unit
- unitPrice: From PR `estimatedUnitPrice` or `approvedUnitPrice`
- receivedQuantity: 0 (initialize)
- pendingQuantity: = orderedQuantity
- status: 'pending'
- deliveryDate: From PR item `requiredDate`
- discount, taxRate: From PR item if available
- Source traceability: sourceRequestId, sourceRequestItemId

**Financial Calculations**:
- Subtotal: Sum of (quantity × unit price)
- Discount: Apply item-level and header-level discounts
- Tax: Calculate based on tax rates
- Total: Subtotal - Discount + Tax
- All amounts in PO currency
- Store base currency amounts for reporting

**Acceptance Criteria**:
- Only approved PRs appear in selection list
- PRs already converted are excluded
- Visual grouping colors make vendor/currency combinations obvious
- Real-time preview accurately shows how many POs will be created
- Single PO creation allows editing before save
- Bulk creation creates all POs correctly grouped
- All PR items included in generated POs
- PR traceability maintained (can navigate PO → PR)
- Quantities and prices from PR preserved
- Cannot create duplicate POs from same PR
- PR items marked "converted" after PO creation
- Success message clearly indicates what was created
- Can handle large selections (50+ PRs, 500+ line items) without performance issues
- Grouping logic correctly handles mixed vendors, currencies, dates
- Exchange rates applied correctly for multi-currency
- Bulk creation completes within 30 seconds for 20 PO groups

**Related Requirements**: FR-PO-003, FR-PO-004, FR-PO-016

---

### FR-PO-003: Create Blank Purchase Order
**Priority**: High

**User Story**: As a purchasing staff member, I want to create a purchase order from scratch (not from PRs) so that I can handle ad-hoc purchases, emergency orders, or vendor quotes that don't have corresponding purchase requests.

**Requirements**:
- Entry point: "New PO" dropdown menu → "Create Blank PO"
- Navigate to: `/procurement/purchase-orders/create`
- PO detail page opens in edit mode with empty form
- Header section fields (initially empty):
  * PO Number: Auto-generated, display "New PO" until saved
  * Order Date: Default to current date (editable)
  * Vendor: Searchable dropdown from vendor master (type-ahead)
  * Vendor Contact: Auto-populate from vendor master (editable)
  * Currency: Dropdown from active currencies
  * Exchange Rate: Auto-populate based on currency (editable)
  * Expected Delivery Date: Date picker (required)
  * Delivery Location: Dropdown from active locations (required)
  * Payment Terms: Auto-populate from vendor master (editable)
  * Description/Notes: Free text area
- Items section:
  * "Add Item" button opens item selection dialog
  * For each line item: Item Code/Name, Description, Specification, Ordered Quantity, Unit, Unit Price, Discount %, Tax Rate %, Line Total, Delivery Date, Notes
  * Actions: Edit, Delete, Duplicate buttons per line
  * Drag-and-drop to reorder
  * Line numbering auto-updates
- Financial summary panel (auto-calculated):
  * Subtotal, Total Discount, Net Amount, Total Tax, Total Amount
  * Display in PO currency
  * Show base currency equivalent if different
- Action buttons:
  * Save as Draft: Save without sending (status = draft)
  * Save and Send: Save and mark as sent (status = sent), optional email to vendor
  * Cancel: Discard changes (with confirmation)
- Validation rules:
  * At least one line item required
  * All required fields must be filled
  * Quantities > 0, Prices ≥ 0
  * Delivery dates must be in future
  * Exchange rate > 0
- Auto-save to localStorage every 30 seconds
- Warn if navigating away with unsaved changes
- Restore from localStorage if browser closed

**Acceptance Criteria**:
- Can create PO without referencing any PR
- Vendor dropdown shows only active vendors
- Item dropdown shows only active, purchasable items
- Currency exchange rate auto-updates when currency changes
- Line item calculations accurate and update in real-time
- Can add unlimited line items (practical limit 1000+)
- Drag-and-drop reordering works smoothly
- Save as Draft saves without validation errors
- Save and Send validates all required fields
- Auto-save recovers data after browser crash
- Vendor contact auto-populates from vendor master
- Payment terms auto-populate from vendor settings
- Delivery location defaults to user's department location
- Can duplicate existing line items
- Non-catalog items can be added with manual entry

**Related Requirements**: FR-PO-002, FR-PO-004, FR-PO-007

---

### FR-PO-004: Purchase Order Detail View and Edit
**Priority**: High

**User Story**: As a purchasing staff member, I want to view complete purchase order details and edit them when needed so that I can review PO information, make corrections, and track order progress.

**Requirements**:

**Route**: `/procurement/purchase-orders/[id]`

**Page Modes**:
- View mode: Read-only display (default for non-draft POs)
- Edit mode: Editable fields (for draft POs or users with edit permission)

**Header Section**:
- PO Number (large, bold)
- Status Badge (color-coded, current status)
- Order Date
- Created By (user name)
- Created Date/Time

**Vendor Information Card**:
- Vendor Name (with link to vendor profile)
- Vendor Code
- Contact Person and Contact Details
- Vendor Address
- Payment Terms
- Delivery Address

**Financial Summary Card** (sticky on scroll):
- Currency Code
- Subtotal Amount
- Discount Amount
- Net Amount
- Tax Amount
- Total Amount
- Base Currency Equivalent (if different currency)
- Exchange Rate

**Tabbed Content Area**:

*Tab 1 - Items* (default):
- List all line items in table/enhanced view
- For each item show: Line Number, Item Code/Name, Description, Ordered Quantity/Unit, Received Quantity, Pending Quantity, Unit Price, Discount, Tax Rate, Line Total, Delivery Date, Status Badge
- Expandable rows for additional details: Full specification, Source PR reference, Receiving history, Notes
- Summary row: Total Lines, Total Quantity Ordered/Received/Pending, Total Amount
- Actions (in edit mode): Add, Edit, Delete, Duplicate line item
- Search and filter items within PO

*Tab 2 - Financial Details*:
- Detailed pricing breakdown
- Tax calculation details
- Discount details (header and line-level)
- Extra costs (freight, handling, insurance)
- Cost distribution method
- Budget allocation (if applicable)
- Account codes

*Tab 3 - Related Documents*:
- Source Purchase Requests: PR numbers, links, status, date
- Goods Receipt Notes: GRN numbers, links, date, received quantity, status
- Invoices: Vendor invoices, invoice numbers, dates, amounts, 3-way match status
- Change Orders: Amendments/revisions, change order numbers, dates, reasons

*Note: Comments & Attachments and Activity Log are displayed in the collapsible right sidebar instead of as tabs. See "Collapsible Sidebar" section below for details.*

**Action Buttons** (context-sensitive based on status and permissions):
- Draft status: Edit, Delete, Send to Vendor
- Sent status: Cancel, Mark as Acknowledged
- Acknowledged status: Receive Goods (opens GRN creation), Cancel
- Partial/Fully Received status: Close PO
- All statuses: Print, Export (PDF, Excel), Duplicate, Email to Vendor

**Status Transition Actions**:
- Send to Vendor: Validates PO, sends email with PDF, updates status to 'sent'
- Mark as Acknowledged: Records vendor acknowledgment, updates status to 'acknowledged'
- Receive Goods: Redirects to GRN creation with PO pre-selected
- Close PO: Requires reason, validates closure rules, updates status to 'closed'
- Cancel PO: Requires reason, confirmation dialog, releases budget encumbrances, sends cancellation notice, updates status to 'cancelled'

**Edit Mode Behavior**:
- Edit button toggles to edit mode
- Fields become editable (except system-generated)
- Save and Cancel buttons appear
- Validation on save
- Changes tracked in activity log
- Restrictions based on PO status:
  * Draft: All fields editable
  * Sent/Acknowledged: Limited edits (notes, delivery date, contact)
  * Partial/Fully Received: Very restricted (notes only)
  * Closed/Cancelled: No edits allowed

**Collapsible Sidebar** (right side, full-page height):
- Toggle button in header to show/hide sidebar
- Sidebar hidden by default
- When visible, spans full page height alongside main content
- **Comments & Attachments Section**:
  * Comments list with user avatar, name, timestamp
  * Blue left-border cards for each comment
  * Add new comment with textarea
  * Keyboard shortcut: Ctrl+Enter to send
  * Attachments list with file type badges
  * View and Download actions for attachments
  * Attach File button for uploads
- **Activity Log Section**:
  * Chronological activity entries
  * User avatar, action badge, description, timestamp
  * Actions: Created, Updated, Approved, Sent, Comment

**Acceptance Criteria**:
- Page loads within 2 seconds for POs with 100+ line items
- All tabs load content on-demand (lazy loading)
- Status badges use consistent color scheme
- Related documents show accurate, real-time data
- Activity log captures all changes with complete details
- Edit mode validates data before allowing save
- Status transitions follow defined workflow rules
- Cannot edit fields not allowed for current status
- Email to vendor includes correctly formatted PO PDF
- Collapsible sidebar saves state (open/closed) in user preferences
- Can navigate to related PRs, GRNs, invoices
- Attachment upload handles large files without timeout
- Comments support markdown formatting
- Print function generates professional PO document
- Duplicate function creates new draft PO with copied data

**Related Requirements**: FR-PO-003, FR-PO-005, FR-PO-008, FR-PO-010

---

### FR-PO-005: Purchase Order Status Management
**Priority**: High

**User Story**: As a purchasing staff member, I want to track and update purchase order status throughout its lifecycle so that all stakeholders can see current order progress and receiving status.

**Requirements**:

**Status Workflow** (defined progression):

1. **Draft**: PO created but not finalized
   - Fully editable
   - Not visible to vendor
   - No budget encumbrance
   - Actions: Edit, Delete, Send to Vendor

2. **Sent**: PO transmitted to vendor
   - Email sent with PO document
   - Limited edits (contact, notes, dates)
   - Budget encumbrance created
   - Awaiting vendor acknowledgment
   - Actions: Cancel, Mark as Acknowledged, Re-send

3. **Acknowledged**: Vendor confirmed receipt
   - Vendor confirmed PO
   - Expected delivery date confirmed
   - Ready for receiving
   - Actions: Receive Goods (create GRN), Cancel

4. **Partial Received**: Some items received
   - At least one GRN created
   - Some items still pending
   - Automatically set when first GRN posted
   - Cannot revert to earlier status
   - Actions: Receive More Goods, Close PO

5. **Fully Received**: All items received
   - All ordered quantities received
   - Automatically set when last item received
   - Ready for closure
   - Actions: Close PO, Create Adjustment GRN

6. **Closed**: PO administratively closed
   - No further receipts allowed
   - Requires closure reason
   - Budget encumbrance released
   - Final status (except reopening by admin)
   - Actions: Reopen (admin only)

7. **Cancelled**: PO cancelled before completion
   - Requires cancellation reason
   - Budget encumbrance released
   - Vendor notified
   - Cannot receive goods
   - Terminal status (cannot reopen)

**Status Transition Rules**:
- Draft → Sent: Requires complete PO validation
- Sent → Acknowledged: Manual action by purchasing staff
- Acknowledged → Partial Received: Automatic on first GRN
- Partial Received → Fully Received: Automatic when all items received
- Any status → Closed: Manual action with reason
- Sent/Acknowledged → Cancelled: Manual action with reason (no receipts yet)
- Partial Received → Closed: Manual action (cannot cancel once received)

**Status Change Requirements**:
- All status changes require user authentication
- Mandatory fields:
  * Cancel: Reason (dropdown + free text)
  * Close: Reason code, optional notes
  * Send: Vendor email confirmation
  * Acknowledge: Optional vendor acknowledgment document upload
- Status change validation:
  * Cannot cancel if any items received (must close instead)
  * Cannot send if validation fails
  * Cannot close if significant pending quantities without reason
- Notifications on status change:
  * Email to PO creator
  * Email to requester (if from PR)
  * Email to vendor (for sent, acknowledged, cancelled)
  * In-app notification to relevant users

**Status Display**:
- Color-coded badges:
  * Draft: Gray badge
  * Sent: Blue badge
  * Acknowledged: Purple badge
  * Partial Received: Yellow badge, shows "X/Y items"
  * Fully Received: Green badge
  * Closed: Dark gray badge
  * Cancelled: Red badge
- Status with additional context:
  * Partial: "5/10 items received"
  * Fully Received: "Received MM/DD/YYYY"
  * Closed: "Closed MM/DD/YYYY - [Reason]"
  * Cancelled: "Cancelled MM/DD/YYYY - [Reason]"
- Timeline visualization on PO detail page: Horizontal timeline, completed statuses with checkmark, current status highlighted, dates for each transition

**Status-based Permissions**:
- Draft: Purchasing staff can edit, delete
- Sent: Purchasing staff can acknowledge, cancel, limited edit
- Acknowledged: Purchasing staff and receiving staff can receive goods
- Partial/Fully Received: Receiving staff can receive more, purchasing staff can close
- Closed: Admin can reopen
- Cancelled: No further actions allowed

**Status Filters and Reports**:
- Quick filter buttons on PO list for each status
- Status aging reports:
  * POs in Draft > 7 days
  * POs Sent but not Acknowledged > 14 days
  * POs Acknowledged > 30 days with no receipts
  * POs Partial Received > 45 days
- Dashboard widgets showing PO count by status
- Status change history report

**Acceptance Criteria**:
- Status transitions follow defined workflow without skipping
- Status badges display with correct colors consistently
- Cannot perform invalid status transitions
- Mandatory fields enforced for status changes
- Status change notifications sent within 5 minutes
- Activity log records all status changes with user and timestamp
- Status aging reports identify problematic POs accurately
- Timeline visualization shows complete status history
- Partial received status shows accurate item receipt count
- Fully received status only sets when 100% received (within tolerance)
- Closed POs do not allow further goods receipts
- Cancelled POs release budget encumbrances immediately
- Vendors receive email notification for sent, cancelled status changes
- Status filters on PO list work instantly
- Can bulk update status for multiple POs (where applicable)

**Related Requirements**: FR-PO-004, FR-PO-006, FR-PO-008

---

### FR-PO-006: Purchase Order Line Item Management
**Priority**: High

**User Story**: As a purchasing staff member, I want to add, edit, delete, and reorder line items on a purchase order so that I can accurately specify what goods or services we are ordering.

**Requirements**:

**Add Line Item**:
- "Add Item" button on PO detail page (in Items tab)
- Opens item selection dialog with search and filter
- Search by: Item code, Name, Category, Vendor catalog number
- Display item information: Code, Name, Unit, Standard price, Vendor price (if available), Current stock level, Reorder level, Last price, Last vendor
- For non-catalog items: Manual entry form for item details
- Required fields: Item, Quantity, Unit, Unit Price
- Optional fields: Description, Specification, Discount %, Tax Rate %, Delivery Date, Notes
- Real-time calculation of line total as fields entered
- Validate: Quantity > 0, Price ≥ 0, Delivery date ≥ Order date

**Edit Line Item**:
- Click edit icon on line item row
- Inline editing or modal form based on complexity
- Can change: Quantity, Unit Price, Discount, Tax Rate, Delivery Date, Description, Notes
- Cannot change: Item (must delete and add new)
- Real-time validation and total recalculation
- Changes reflected in financial summary immediately

**Delete Line Item**:
- Click delete icon on line item row
- Confirmation dialog: "Remove this item from the PO?"
- Cannot delete if PO sent/acknowledged and item already received
- Soft delete for sent/acknowledged POs (marks as cancelled, preserves for audit)
- Hard delete for draft POs
- Recalculates PO totals automatically

**Duplicate Line Item**:
- Click duplicate icon
- Creates copy with same item, quantity, pricing
- Allows quick addition of similar items with different specs
- New item opens in edit mode

**Reorder Line Items**:
- Drag-and-drop handles on each row
- Visual feedback during drag
- Line numbers auto-renumber after reordering
- Preserves order in printed/exported documents

**Bulk Operations on Line Items**:
- Multi-select checkboxes on line items
- Bulk actions: Delete, Apply discount, Change delivery date, Change tax rate
- "Select all" checkbox in header
- Display count of selected items

**Line Item Display**:
- Table view with columns: Line #, Item Code, Item Name, Description, Ordered Qty, Unit, Received Qty, Pending Qty, Unit Price, Discount %, Tax Rate %, Line Total, Delivery Date, Status
- Expandable row for additional details: Full specification, Source PR, Receiving history, Notes, Item image
- Status indicators: Pending (gray), Partial (yellow), Fully Received (green), Cancelled (red)
- Progress bar showing received/ordered ratio

**Acceptance Criteria**:
- Can add unlimited line items (practical limit 500+)
- Item search returns results within 1 second
- Line total calculates correctly with all discounts and taxes
- Cannot add duplicate items (same item multiple times warns user)
- Drag-and-drop works smoothly on desktop and touch devices
- Editing one item doesn't affect others unexpectedly
- Delete confirmation prevents accidental removal
- Non-catalog items can be manually entered with all necessary fields
- Vendor-specific item codes and pricing auto-populate when vendor selected
- Bulk operations complete within 3 seconds for 100 items
- Line item status updates correctly based on GRN receipts

**Related Requirements**: FR-PO-003, FR-PO-004, FR-PO-009

---

### FR-PO-006A: Purchase Order Item Details Dialog
**Priority**: High

**User Story**: As a purchasing staff member, I want to view comprehensive details of a PO line item including inventory status, related purchase requests, and order summary so that I can track item fulfillment and make informed decisions.

**Requirements**:

**Item Details Dialog**:
- Opened by clicking on a line item row in the Items tab
- Modal dialog displaying complete item information
- View and Edit modes (edit only for Draft status)

**Header Section**:
- Item Name (large, prominent)
- Item Description
- Inventory Status Indicators (clickable cards):
  * **On Hand**: Total quantity across all locations (in inventory units)
  * **On Order**: Total quantity on pending POs (in inventory units)
  * **Received**: Total quantity received via GRNs (in inventory units)
- Each indicator opens a breakdown dialog when clicked

**Inventory Breakdown Dialogs**:

*On Hand Dialog*:
- Table showing inventory by location
- Columns: Location, Quantity On Hand, Inventory Units, Par, Reorder Point, Min Stock, Max Stock
- Data sourced from inventory management system

*On Order Dialog (Pending POs)*:
- Table showing all pending purchase orders for this item
- Columns: PO Number, Vendor, Delivery Date, Remaining Qty, Inventory Units, Locations Ordered
- Total On Order summary at bottom

*Received Dialog (GRN Items)*:
- Table showing all GRN receipts for this item
- Columns: GRN Number, Received Date, Received Qty, Rejected Qty, Inspected By, Location
- Comment row below each GRN entry
- Provides receipt history and quality information

**Key Metrics Grid**:
- Unit: Base unit of measure
- Ordered: Quantity ordered on this PO
- Received: Quantity received against this PO
- Remaining: Calculated (Ordered - Received)
- Price: Unit price from PO
- FOC: Free of Charge indicator (checkbox)

**Related Purchase Requests Section**:
- Shows source PR(s) linked to this PO line item
- Table columns: PR Number, Requested Qty, Approved Qty, Unit Price, Status, Requestor
- Displays "No related purchase requests" if item not from PR
- Summary panel:
  * Total PRs count
  * Total Requested quantity
  * Total Approved quantity
  * Average Price per unit
- "View All PRs" button to open detailed PR list

**Order Summary Section**:
- **Order Details**:
  * Order Quantity (with unit)
  * Received Quantity (with unit)
  * Remaining (highlighted in orange if >0)
  * Unit Price
- **Financial Summary**:
  * Total Amount: Calculated as (orderedQuantity × unitPrice) or from lineTotal field
  * Displays in PO currency

**Data Source Requirements**:
- Item data from `PurchaseOrderItem` type
- Must include `sourceRequestId` and `sourceRequestItemId` for PR traceability
- Must include `lineTotal` for accurate financial display
- Inventory indicators require integration with inventory and receiving systems

**Acceptance Criteria**:
- Item details dialog opens within 500ms
- All item data displays correctly from itemData props
- Inventory indicators show accurate totals from related systems
- On Hand, On Order, and Received dialogs show correct breakdown data
- Financial summary calculates correctly (quantity × price)
- Related PR section shows linked purchase request(s)
- Order Summary reflects actual PO item quantities and amounts
- Edit mode allows modification of editable fields (Draft status only)
- Changes saved correctly when dialog closed

**Related Requirements**: FR-PO-004, FR-PO-006, FR-PO-014

---

### FR-PO-007: Purchase Order Communication and Distribution
**Priority**: High

**User Story**: As a purchasing staff member, I want to send purchase orders to vendors via email and print professional PO documents so that vendors receive clear, official purchase orders.

**Requirements**:

**Send PO to Vendor**:
- "Send to Vendor" button on PO detail page
- Available only when status = 'draft'
- Pre-send validation:
  * All required fields complete
  * At least one line item
  * Valid vendor email address
  * Valid pricing and quantities
- Sends professional email with:
  * Subject: "Purchase Order [PO-Number] from [Company Name]"
  * Body: Professional message, PO details summary, delivery instructions, contact information
  * Attachment: PDF of PO in standard format
- Updates PO status to 'sent'
- Records send timestamp and user
- Creates activity log entry
- Budget encumbrance created upon sending

**Email PO**:
- "Email" button available in all statuses (not just send)
- Use case: Re-send, send to additional recipients, send updated version
- Email composition dialog:
  * To: (pre-filled with vendor email, editable)
  * CC: (optional additional recipients)
  * Subject: (pre-filled, editable)
  * Message: (rich text editor with default template)
  * Attachments: PO PDF (always included), Additional files (optional uploads)
- Email templates: Initial send, Re-send/Follow-up, Cancellation notice, Acknowledgment request
- Email history tracked in activity log

**Print PO**:
- "Print" button opens print preview
- Professional PO document format:
  * Company header: Logo, Name, Address, Contact
  * PO details: PO Number (prominent), Order Date, Expected Delivery Date
  * Vendor information: Name, Address, Contact Person, Vendor Code
  * Line items table: Formatted with clear columns, subtotals
  * Financial summary: Subtotal, Discount, Tax, Total (with currency)
  * Terms and Conditions: Payment terms, Delivery terms, Return policy, Validity period
  * Footer: Authorized signature line, Page numbering, Print date/time
- Print options: Include/exclude pricing, Include/exclude notes, Number of copies
- Export to PDF option within print dialog

**PO PDF Generation**:
- Generate on-demand or pre-generated for sent POs
- Standard template (professional business format)
- Custom templates per organization/department (if configured)
- **Includes QR code with PO number for mobile scanning**:
  * QR code format: `PO:{orderNumber}` (e.g., "PO:PO-2501-0001")
  * Positioned on PDF: Top right corner, bottom right corner, or dedicated section (configurable)
  * QR code size: 2×2 cm minimum for reliable scanning
  * Generated using `qrcode` library v1.5.3
  * Error correction level: Medium (M) for 15% data restoration
  * Purpose: Enable quick GRN creation via mobile app scanning
- Watermark for draft/cancelled POs
- File naming: PO-[Number]-[Vendor]-[Date].pdf

**Vendor Portal Access** (if available):
- Generate secure link for vendor to view PO online
- Vendor can download PO PDF
- Vendor can acknowledge receipt online
- Vendor can upload acknowledgment documents
- Link expires after configurable period (default: 30 days)

**Acceptance Criteria**:
- Email sends within 30 seconds
- PO PDF generated within 10 seconds
- PDF layout is professional and print-friendly
- All PO data appears correctly in email and PDF
- Vendor receives email with PDF attachment intact
- Can resend PO without changing status
- Print preview matches final PDF output
- Company logo and branding appear correctly
- Multi-page POs paginate properly with headers/footers on each page
- Email delivery failures are logged and user notified
- Can send PO to multiple vendor contacts simultaneously
- Email template can be customized per organization
- Print function works across different browsers
- PDF is accessible (screen reader compatible)

**Related Requirements**: FR-PO-004, FR-PO-005, FR-PO-014

---

### FR-PO-008: Purchase Order Export and Reporting
**Priority**: Medium

**User Story**: As a purchasing manager, I want to export purchase order data in various formats so that I can analyze spending, share reports with stakeholders, and integrate with other systems.

**Requirements**:

**Export from PO List**:
- "Export" button on PO list page
- Export filtered/sorted data (respects current filters)
- Format options: Excel (.xlsx), CSV, PDF
- Export options dialog:
  * Select columns to include/exclude
  * Include summary statistics
  * Date range filter
  * Grouping options (by vendor, by status, by department)
- Export file naming: PurchaseOrders-[Date]-[Filter].extension
- Large exports (1000+ records) processed in background with download notification

**Export Single PO**:
- "Export" button on PO detail page
- Includes full PO details, line items, related documents, activity log
- Format options: PDF (formatted), Excel (data), JSON (system integration)
- Sections to include/exclude: Header, Items, Financial, Comments, Attachments, Activity Log

**Scheduled Exports** (if configured):
- Automated daily/weekly/monthly exports
- Email delivery to designated recipients
- Configurable format and content
- Use cases: Daily PO report, Weekly spend analysis, Monthly vendor performance

**Quick Reports**:
- "Reports" dropdown menu with pre-configured reports:
  * POs by Status (count and value)
  * Top Vendors by Spend
  * Pending Delivery Report (POs with past delivery dates)
  * POs Awaiting Acknowledgment (sent but not acknowledged >7 days)
  * Budget Utilization (encumbered vs spent vs available)
  * Multi-currency Spend Analysis
- One-click generation
- PDF or Excel output
- Date range parameter

**Dashboard Widgets**:
- PO Count by Status (pie chart)
- Monthly PO Value Trend (line chart)
- Top 10 Vendors by PO Value (bar chart)
- Average PO Value by Department
- PO Cycle Time (draft to received)
- Budget vs Actual Spending

**Acceptance Criteria**:
- Export completes within 30 seconds for 500 POs
- Excel exports preserve formatting (currency, dates)
- CSV exports are properly encoded (UTF-8) for international characters
- PDF exports match screen formatting
- Large exports don't freeze browser
- Exported data matches displayed data exactly
- Column selection remembered for next export
- Export file downloads automatically (no manual save)
- Excel exports have frozen header row and auto-filters
- Charts in dashboard widgets are interactive
- Reports can be scheduled for automatic generation
- Export permissions respected (users see only their authorized data)

**Related Requirements**: FR-PO-001, FR-PO-015

---

### FR-PO-009: Integration with Goods Receipt Note (GRN) Module
**Priority**: High

**User Story**: As a receiving staff member, I want to create goods receipts directly from purchase orders so that inventory updates accurately and the system tracks what has been received against what was ordered.

**Requirements**:

**Create GRN from PO**:
- "Receive Goods" button on PO detail page (when status = acknowledged, partial_received)
- Opens GRN creation page with PO pre-selected
- PO data auto-populates GRN:
  * Vendor information
  * Expected delivery date
  * All line items with ordered quantities
  * Currency and pricing
- Receiving staff enters:
  * Actual delivery date
  * GRN number (auto-generated or manual)
  * Received quantities per item (can be partial)
  * Quality check results (pass/fail/conditional)
  * Delivery note number from vendor
  * Vehicle/transport information
  * Receiving location
  * Notes and discrepancies

**Receiving Quantity Tracking**:
- For each PO line item, maintain:
  * Ordered Quantity
  * Received Quantity (sum of all GRN receipts)
  * Pending Quantity (Ordered - Received)
  * Status: Pending, Partial, Fully Received, Over-received
- Update these fields automatically when GRN posted
- Allow over-receiving with configurable tolerance (e.g., +5%)
- Warn if over-tolerance exceeded
- Can receive in multiple batches (multiple GRNs per PO)

**PO Status Auto-update**:
- When first item received: Status → 'partial_received'
- When all items fully received: Status → 'fully_received'
- Status update triggers activity log entry

**GRN Linkage**:
- Display all GRNs linked to PO in "Related Documents" tab
- Show for each GRN: GRN number, Date, Received quantity, Status, Actions (view, print)
- Can navigate from PO to GRN and back
- Display receiving history per line item

**3-Way Matching**:
- Compare PO, GRN, and Invoice for matching:
  * Quantity match: GRN received = PO ordered
  * Price match: Invoice price = PO price (within tolerance)
  * Vendor match: All documents for same vendor
- Match status: Matched, Variance, Mismatch
- Variances flagged for approval before invoice payment
- Tolerance settings: Quantity (±2%), Price (±1%)

**Quality Inspection Integration**:
- If item requires quality check: GRN holds inventory in "inspection" status
- Quality team performs inspection, updates result
- Pass: Stock moves to "available"
- Fail: Stock moves to "rejected", initiate return process
- Conditional: Partial acceptance with debit note

**Return to Vendor**:
- If goods rejected or damaged: Initiate "Return to Vendor" from GRN
- Creates Return GRN (negative quantities)
- Reverses inventory receipt
- Updates PO quantities (pending qty increases)
- Triggers vendor debit note

**Acceptance Criteria**:
- GRN creation pre-populates correctly from PO
- Can receive partial quantities multiple times
- Over-receiving warns user appropriately
- PO status updates automatically and correctly
- Received quantities display accurately in real-time
- Cannot receive more than ordered (beyond tolerance)
- 3-way matching algorithm identifies discrepancies accurately
- Quality inspection holds inventory correctly
- Return process reverses all accounting entries correctly
- Multiple receivers can receive different items simultaneously without conflict
- Inventory updates immediately upon GRN posting
- Can trace from PO → GRN → Stock Movement → Inventory

**Related Requirements**: FR-PO-004, FR-PO-005, FR-PO-014

---

### FR-PO-010: Purchase Order Amendment and Change Management
**Priority**: Medium

**User Story**: As a purchasing staff member, I want to modify purchase orders after they have been sent to vendors so that I can handle changes in requirements, pricing, or delivery dates while maintaining proper audit trails.

**Requirements**:

**Amendment Scenarios**:
- Quantity changes (increase or decrease)
- Price changes (vendor negotiation, currency fluctuation)
- Delivery date changes
- Line item additions or deletions
- Vendor change (rare, requires approval)
- Payment terms adjustment

**Amendment Types**:
- **Minor amendments** (no vendor notification required): Notes, internal references, contact person
- **Major amendments** (vendor notification required): Quantities, prices, delivery dates, items, terms

**Amendment Process**:
- Edit PO when status = sent, acknowledged, partial_received
- System detects changes and marks as "Pending Amendment"
- Amendment summary dialog shows:
  * What changed (old value → new value)
  * Impact on total amount
  * Impact on delivery schedule
  * Reason for change (required input)
- Save creates Amendment Record:
  * Amendment number (PO-XXXXX-A01, A02, etc.)
  * Amendment date
  * Changed by user
  * List of changes
  * Reason
  * Amendment status: Draft, Pending Vendor Approval, Approved, Rejected
- Major amendments:
  * Generate Amendment Notice PDF
  * Send to vendor via email
  * Await vendor acknowledgment
  * Track vendor response
- Minor amendments:
  * Save immediately, log in activity

**Amendment Approval Workflow** (for major amendments):
- If amount increase >$5,000 or >10%: Require manager approval
- Approval request notification sent
- Manager reviews amendment summary and reason
- Approve or Reject with comments
- If approved: Send to vendor
- If rejected: Return to draft, notify requester

**Amendment History**:
- "Amendments" tab on PO detail page
- Display all amendments chronologically
- For each: Amendment number, Date, User, Changes summary, Status
- Compare versions: Select two versions, show diff view (old vs new)
- Download amendment notices as PDF
- Full audit trail preserved

**Vendor Acknowledgment**:
- Vendor receives amendment notice
- Vendor can: Acknowledge (accept), Reject, Request Discussion
- Track vendor response in system
- If vendor rejects: Flag for purchaser follow-up

**Change Order Generation**:
- For significant amendments: Generate formal Change Order document
- Includes: Original PO reference, Amendment details, New totals, Authorization signatures
- Becomes legal amendment to original PO

**Restrictions**:
- Cannot amend fully_received POs (must close and create new)
- Cannot amend cancelled POs
- Cannot amend if invoice already matched (requires special approval)
- Cannot decrease quantities below already received amounts
- Cannot change vendor if any items received

**Acceptance Criteria**:
- System accurately detects all PO changes
- Amendment summary clearly shows before/after values
- Major amendments require proper approvals before sending to vendor
- Amendment notices are professional and clear
- Cannot circumvent amendment process by deleting and recreating PO
- Version comparison shows exact differences
- Vendor acknowledgment tracked accurately
- Financial impact calculated correctly
- GRN references updated PO after amendment
- Invoice 3-way matching uses amended PO values
- Amendment history complete and auditable
- Cannot make contradictory amendments simultaneously

**Related Requirements**: FR-PO-004, FR-PO-005, FR-PO-016

---

### FR-PO-011: Multi-Currency Purchase Order Management
**Priority**: Medium

**User Story**: As a purchasing staff member in an international hotel, I want to create purchase orders in various currencies with accurate exchange rates so that we can procure from international vendors while tracking costs in our base currency.

**Requirements**:

**Currency Selection**:
- Currency dropdown on PO creation
- Display: Currency code, Symbol, Description
- Only active currencies available
- Default: Vendor's preferred currency or base currency
- Can change currency before sending (not after)

**Exchange Rate Management**:
- Auto-fetch current exchange rate when currency selected
- Source: Central bank rates, Accounting system, Manual entry
- Exchange rate displayed prominently
- Exchange rate date/time stamp
- Can override auto-rate (requires permission)
- Historical rate lookup for specific date
- Rate verification: Warn if rate differs significantly from recent rate (>5%)

**Dual Currency Display**:
- All amounts show in both PO currency and base currency:
  * PO Currency (primary): USD 10,000.00
  * Base Currency (secondary): PHP 565,000.00 (@ 56.50)
- Financial summary shows both currencies
- Line items can toggle currency display
- Reports support both single-currency and multi-currency views

**Exchange Rate Lock**:
- Exchange rate locked when PO sent to vendor
- Protects against rate fluctuations
- Original rate used for all subsequent transactions (GRN, Invoice matching)
- Can update rate only via formal amendment process

**Currency Restrictions**:
- Vendor must support PO currency
- Payment terms must be compatible with currency
- Bank accounts validated for currency
- Tax rates applied correctly per currency

**Multi-Currency Reporting**:
- Spending reports in base currency (for comparison)
- Currency-specific reports (actual PO currency)
- Exchange gain/loss tracking
- Currency exposure analysis
- Vendor spend by currency

**Budget Integration**:
- Budget encumbrance in base currency (converted at PO exchange rate)
- Budget reports show base currency amounts
- Multi-currency budget allocation (if configured)

**3-Way Matching with Currency**:
- PO, GRN, Invoice must all use same currency
- Exchange rate applied consistently
- Currency conversion for reporting purposes
- Handle minor rounding differences

**Acceptance Criteria**:
- Exchange rate auto-populates within 2 seconds
- Rate is accurate to 4-6 decimal places
- Dual currency display accurate to 2 decimal places
- Cannot change currency after PO sent
- Historical rates retrievable for any past date
- Reports correctly aggregate multi-currency POs
- Base currency totals calculated correctly
- Exchange rate lock prevents unauthorized changes
- Currency validation prevents invalid combinations
- Can filter PO list by currency
- Export functions support multi-currency formats
- Rounding differences handled consistently

**Related Requirements**: FR-PO-002, FR-PO-003, FR-PO-004

---

### FR-PO-012: Purchase Order Search and Advanced Filtering
**Priority**: Medium

**User Story**: As a user, I want to quickly search and filter purchase orders using various criteria so that I can find specific POs and analyze procurement patterns.

**Requirements**:

**Quick Search**:
- Global search box at top of PO list
- Search across: PO number, Vendor name, Item names, Description, Notes
- Real-time search (as-you-type)
- Results update within 500ms
- Highlight matching terms in results
- Search history dropdown (last 10 searches)

**Advanced Filter Panel**:
- Collapsible filter sidebar
- Filter categories:

  *Status Filters*:
  - Multi-select status checkboxes
  - Quick filters: Active POs, Pending Delivery, Overdue, Recent (last 30 days)

  *Date Filters*:
  - Order Date range (from/to date pickers)
  - Expected Delivery Date range
  - Received Date range
  - Created Date range
  - Quick ranges: Today, Last 7 days, Last 30 days, This Month, Last Month, This Quarter, This Year

  *Vendor Filters*:
  - Vendor multi-select dropdown (searchable)
  - Vendor category filter
  - Vendor rating filter (if ratings enabled)

  *Financial Filters*:
  - Currency multi-select
  - Amount range (min/max)
  - Amount buckets: <$1K, $1K-$5K, $5K-$10K, $10K-$50K, >$50K

  *Item Filters*:
  - Item category multi-select
  - Item name search
  - Contains specific item

  *Organizational Filters*:
  - Department multi-select
  - Location multi-select
  - Created by user
  - Approved by user

  *Source Filters*:
  - Created from PR (yes/no)
  - Blank POs only
  - Template-based POs

**Filter Behavior**:
- Filters combine with AND logic (all must match)
- Within multi-select, OR logic (any matches)
- Real-time result count updates as filters applied
- "Clear All Filters" button
- Active filters displayed as chips/tags (removable)
- Filter state persists in session
- Save filter combinations as "Saved Searches"

**Saved Searches**:
- "Save Current Search" button
- Name the saved search
- Make private or shared (team/organization)
- "My Saved Searches" dropdown
- Edit/Delete saved searches
- Default search on page load (user preference)

**Sorting**:
- Click column headers to sort
- Ascending/Descending toggle
- Multi-column sort (Shift+Click)
- Sort indicator (arrow icon)
- Sort state persists in session

**Result Summary**:
- Display count: "Showing X of Y POs"
- Summary statistics for filtered results:
  * Total PO count
  * Total value (in base currency)
  * Count by status
  * Count by vendor
- Update in real-time as filters applied

**Acceptance Criteria**:
- Quick search returns results within 500ms for 10,000+ POs
- Advanced filters apply instantly (<1 second)
- Can combine multiple filters without performance degradation
- Saved searches load correctly with all filter settings
- Filter state preserved when navigating away and returning
- Clear all filters resets to default view immediately
- Sort works correctly on all columns including calculated fields
- Date filters handle different formats and timezones correctly
- Amount filters work with multi-currency POs (converts to base)
- Can share saved searches with team members
- Search highlights matching text in PO list
- Filter dropdown options load dynamically based on data

**Related Requirements**: FR-PO-001, FR-PO-015

---

### FR-PO-013: Bulk Operations on Purchase Orders
**Priority**: Low

**User Story**: As a purchasing manager, I want to perform actions on multiple purchase orders simultaneously so that I can efficiently manage large numbers of POs.

**Requirements**:

**Bulk Selection**:
- Checkbox on each PO row in list
- "Select All" checkbox in header (selects all on current page)
- "Select All Matching" (selects all matching current filter, across pages)
- Selection counter: "X POs selected"
- Clear selection button

**Bulk Actions Menu**:
- Appears when POs selected
- Actions available:

  *Communication*:
  - Send to Vendors (only unsent draft POs)
  - Resend to Vendors (only sent POs)
  - Email to Vendors
  - Print All

  *Status Changes*:
  - Mark as Acknowledged (only sent POs, requires confirmation)
  - Cancel Selected (only draft/sent/acknowledged, requires reason)
  - Close Selected (only partially/fully received, requires reason)

  *Export*:
  - Export Selected (Excel, CSV, PDF)
  - Download as ZIP (all PO PDFs)

  *Administrative*:
  - Change Delivery Date (updates all line items)
  - Apply Discount (percentage or amount)
  - Reassign Owner/Buyer
  - Add Comment to All
  - Change Priority
  - Add Tags

**Bulk Processing**:
- Show progress bar for long operations
- Process in batches (50 POs at a time)
- Can cancel in progress
- Summary report at end:
  * Successful: X POs
  * Failed: Y POs with reasons
  * Skipped: Z POs (didn't meet criteria)
- Failed items logged with error details
- Option to retry failed items

**Bulk Validation**:
- Pre-validate before performing action
- Warn if action can't be applied to all selected:
  * "5 POs cannot be sent (missing required fields)"
  * "3 POs cannot be cancelled (already received)"
- Option to proceed with valid subset
- Clear indication which POs will be affected

**Bulk Confirmation**:
- Confirmation dialog before destructive actions
- List affected POs (up to 10, then "+X more")
- Summary of what will happen
- Cannot bypass confirmation for sensitive actions

**Permissions**:
- Bulk actions respect user permissions
- Can only bulk-operate on authorized POs
- Attempting unauthorized action shows error

**Audit Trail**:
- All bulk actions logged in activity
- Activity log entry format: "Bulk action: [Action] applied to [N] POs by [User] on [Date]"
- Individual PO activity logs also updated

**Acceptance Criteria**:
- Can select 100+ POs without performance issues
- Bulk actions complete within reasonable time (100 POs in <30 seconds)
- Progress indicator accurate and responsive
- Validation prevents invalid bulk operations
- Partial success handled gracefully (some succeed, some fail)
- Summary report clearly shows what happened to each PO
- Can cancel long-running bulk operation
- Confirmation dialog prevents accidental bulk changes
- Activity logs capture bulk operations properly
- Failed operations provide clear error messages
- Can retry failed operations individually
- Bulk selection state cleared after action complete

**Related Requirements**: FR-PO-001, FR-PO-005, FR-PO-007

---

### FR-PO-014: Purchase Requisition Traceability
**Priority**: Medium

**User Story**: As a department manager, I want to track which purchase orders were created from my department's purchase requests so that I can monitor procurement status and ensure my requisitions are being fulfilled.

**Requirements**:

**PR-to-PO Linkage**:
- PO stores reference to source PR(s):
  * purchaseRequisitionIds[] - array of PR IDs
  * purchaseRequisitionNumbers[] - array of PR numbers for display
- Each PO line item stores reference to source PR item:
  * sourcePRId - source PR ID
  * sourcePRNumber - source PR number
  * sourcePRItemId - source PR line item ID
- Linkage created automatically during "Create from PR" process
- Cannot be manually edited (system-maintained)

**Display PR References**:
- PO header shows: "Created from PRs: PR-001, PR-002, PR-003" (clickable links)
- PO line item shows: "From PR: PR-001 (Line 5)" (clickable)
- Badge count: "Created from 3 PRs"
- "Related Documents" tab lists all source PRs with:
  * PR number (link)
  * PR date
  * Requester
  * Status
  * Total amount
  * Items converted (X of Y items)

**Navigate PR ↔ PO**:
- From PO → Click PR reference → Opens PR detail page
- From PR → "Related POs" section shows all POs created from this PR
- Bidirectional navigation
- Visual indicator if PR partially or fully converted

**PR Conversion Status**:
- PR tracks which items converted to POs:
  * Item conversion status: Not Converted, Partially Converted, Fully Converted
  * Quantity tracking: Requested → Approved → Converted to PO → Received
- PR summary shows: "5 of 10 items converted to POs"
- PR cannot be deleted if any items converted

**PO Impact on PR Status**:
- When PO created from PR: PR item status → "Converted"
- If PO cancelled before receiving: PR item status → "Approved" (can be re-converted)
- When goods received on PO: PR item status → "Fulfilled"
- PR overall status updates based on item statuses

**PR Fulfillment Report**:
- Report showing PR-to-PO-to-GRN chain
- For each PR: Items requested → POs created → Items received → Outstanding
- Filter by: Date range, Department, Requester, Status
- Highlight overdue PRs not yet converted
- Highlight POs created but not yet received

**Partial Conversion Handling**:
- If PR only partially converted (some items selected, others not):
  * Converted items show PO reference
  * Unconverted items remain available for future PO creation
  * PR status = "Partially Converted"
- Can create multiple POs from same PR
- Prevents converting same item twice

**Consolidated PR View**:
- When multiple PRs consolidated into one PO:
  * PO shows all source PRs
  * Each PR shows partial conversion
  * Clear indication which PR items ended up in which PO
  * Visual grouping in PO line items by source PR

**Acceptance Criteria**:
- All PO-PR linkages accurate and complete
- Can navigate from PO to PR and back seamlessly
- PR conversion status updates correctly when PO created/cancelled
- Cannot create duplicate POs from same PR items
- Partially converted PRs tracked accurately
- Consolidated PO correctly references all source PRs
- PR fulfillment report shows accurate status
- Deleted PRs cannot be used to create POs (soft delete only)
- PO line item source PR reference survives PO amendments
- Can filter PO list by source PR
- Excel export includes PR reference columns

**Related Requirements**: FR-PO-002, FR-PO-009, FR-PO-016

---

### FR-PO-015: Purchase Order Templates and Recurring POs
**Priority**: Low
**Implementation Status**: Backend-only (UI options removed as of v1.4.0)

> **Note**: As of version 1.4.0, the "Create from Template" and "Create Recurring PO" options have been removed from the "New PO" dropdown menu. The backend functionality described below remains available for future implementation or API access, but the UI entry points are currently disabled. The dropdown now only shows:
> - "Create Blank PO"
> - "Create from Purchase Requests"

**User Story**: As a purchasing staff member, I want to create PO templates for commonly ordered items and set up recurring POs for regular suppliers so that I can reduce repetitive data entry and ensure consistency.

**Requirements**:

**PO Templates** (Backend-only):

*Create Template*:
- "Save as Template" button on PO detail page (future implementation)
- Template metadata:
  * Template name (required)
  * Description
  * Category (Office Supplies, Maintenance, Food & Beverage, etc.)
  * Applicable vendors (multi-select)
  * Active/Inactive status
- Template stores:
  * Line items (item, quantity, unit, estimated price)
  * Delivery location
  * Payment terms
  * Standard notes/instructions
  * Does NOT store: Vendor (selectable at creation), Dates (set at creation), PO number (auto-generated)

*Use Template* (UI disabled):
- ~~"Create from Template" option in New PO dropdown~~ (Removed in v1.4.0)
- Template selection dialog (available for future implementation):
  * Search templates by name, category
  * Preview template items and details
  * Template card shows: Name, Category, Item count, Last used date, Use count
- Select template → Opens PO creation page pre-filled
- All fields editable before saving
- Select vendor (template suggests compatible vendors)
- Set delivery date
- Review/adjust quantities and prices
- Save as draft or send

*Manage Templates* (Future implementation):
- Templates management page: /procurement/templates
- List all templates with search/filter
- Actions: Edit, Delete, Duplicate, Deactivate
- Template usage statistics
- Version control (track template changes)

**Recurring POs** (Backend-only):

*Setup Recurring PO* (UI disabled):
- ~~"Create Recurring PO" option in New PO dropdown~~ (Removed in v1.4.0)
- Recurring PO setup form (available for future implementation):
  * Base PO template (select existing template or create new)
  * Vendor (required)
  * Recurrence pattern:
    - Frequency: Daily, Weekly, Monthly, Quarterly, Annually
    - Specific day: Day of week (Weekly), Day of month (Monthly), Specific date (Annually)
    - Interval: Every X days/weeks/months
    - Start date
    - End date or Number of occurrences
  * Delivery offset: How many days before required date to send PO
  * Auto-send or Draft: Send automatically or create as draft for review
  * Notification: Email notification when auto-created

*Recurring PO Processing*:
- System runs daily job to check for due recurring POs
- Creates PO from template with:
  * Current date as order date
  * Calculated delivery date (based on frequency)
  * Latest prices from vendor master
  * Auto-generated PO number
- If auto-send enabled: Send to vendor automatically
- If draft mode: Create draft PO, notify buyer for review
- Activity log entry: "Auto-created from Recurring PO Schedule [ID]"

*Manage Recurring POs*:
- Recurring POs management page
- List active recurring PO schedules
- For each schedule show: Name, Vendor, Frequency, Next due date, Status, Last created PO
- Actions: Edit schedule, Pause/Resume, Skip next occurrence, Cancel schedule
- View history: All POs created from this schedule

*Recurring PO Exceptions*:
- If vendor inactive: Pause schedule, notify buyer
- If price increase >10%: Create as draft for review (don't auto-send)
- If item discontinued: Flag for buyer action
- If failure creating PO: Log error, retry next day, notify admin

**Template Categories**:
- Pre-defined categories: Office Supplies, Cleaning Supplies, Maintenance Parts, Food & Beverage, Linen, Guest Amenities, IT Equipment
- Custom categories per organization
- Template filtering by category

**Acceptance Criteria**:
- Template saves all necessary PO components
- Creating PO from template pre-populates correctly
- Can edit template without affecting existing POs created from it
- Recurring PO auto-creates at correct intervals
- Recurring PO uses latest vendor prices
- Auto-send respects PO approval rules
- Paused recurring schedules don't create POs
- Can manually trigger recurring PO creation (off-schedule)
- Template usage tracked for analytics
- Recurring PO exceptions handled gracefully without system errors
- Notifications sent reliably for auto-created POs
- Can bulk-create POs from multiple templates simultaneously
- Template versioning preserves history

**Related Requirements**: FR-PO-002, FR-PO-003, FR-PO-013

---

### FR-PO-016: Activity Logging and Audit Trail
**Priority**: Medium

**User Story**: As an auditor, I want to see complete history of all changes made to purchase orders so that I can verify compliance, investigate discrepancies, and maintain audit trails.

**Requirements**:

**Activity Log Scope**:
- Capture all changes to PO:
  * Header field changes (vendor, dates, terms, etc.)
  * Line item changes (add, edit, delete, reorder)
  * Status transitions
  * Document attachments (add, delete)
  * Comments (add, edit, delete)
  * Approvals and rejections
  * Amendments
  * Email sends and communications
  * Exports and prints
  * Related document associations (GRN, Invoice)

**Activity Log Entry Structure**:
- Timestamp (date and time, timezone)
- User (ID, name, role)
- Action type (Create, Update, Delete, Status Change, Send, etc.)
- Description (natural language summary)
- Old value → New value (for updates)
- IP address (for security audit)
- Session ID
- Additional context (browser, device if available)

**Activity Log Display**:
- "Activity Log" tab on PO detail page
- Chronological list (newest first)
- Entry format:
  ```
  [Icon] [User] performed [Action] on [Date/Time]
  Description: [What changed]
  [Details Button]
  ```
- Expandable details show old/new values
- User avatars/initials
- Color-coded action types
- Relative timestamps ("2 hours ago") with absolute on hover

**Activity Log Filtering**:
- Filter by:
  * Action type (dropdown multi-select)
  * Date range
  * User (multi-select)
  * Field changed
- Search within activity log
- Clear filters button

**Change Comparison**:
- "Compare Versions" feature
- Select two timestamps
- Side-by-side diff view showing:
  * What was added (green highlight)
  * What was removed (red highlight)
  * What was modified (yellow highlight)
- Diff view for: Header fields, Line items table, Financial summary

**System-Generated Activities**:
- Auto-status updates (e.g., from receiving)
- Budget encumbrance creation/release
- Email delivery confirmations
- Scheduled task executions (recurring PO)
- Integration events (external system updates)
- Marked with "System" user icon

**Activity Log Export**:
- Export activity log to Excel, PDF
- Filtered logs export with active filters
- Include user details and full change history
- Useful for audit reports

**Activity Log Retention**:
- Retain all activity logs indefinitely (or per organization policy)
- Cannot be deleted by users (only system admin with special permission)
- Archived POs retain activity logs
- Backup activity logs separately from PO data

**Activity Notifications**:
- Configurable notifications based on activity:
  * Notify requester when PO created from their PR
  * Notify buyer when vendor acknowledges PO
  * Notify manager when high-value PO created
  * Notify finance when PO cancelled (release budget)
- In-app notifications
- Email notifications (optional)
- Digest emails (daily/weekly summary)

**Security and Compliance**:
- Activity log is tamper-proof (write-only)
- Changes logged before and after transaction
- Failed operations also logged (with error details)
- Compliance with audit standards (GAAP, SOX if applicable)
- Activity log can be sealed/locked after PO closure

**Performance**:
- Activity log loading optimized (lazy loading)
- Doesn't slow down PO detail page load
- Can handle POs with 1000+ activity entries
- Efficient querying and filtering

**Acceptance Criteria**:
- Every PO change captured in activity log without exception
- Activity entries created in real-time (not batch)
- Activity log displays within 2 seconds even for large logs
- Old/new values captured accurately for all field types
- System-generated activities clearly distinguished from user actions
- Activity log survives PO amendments and maintains full history
- Export includes complete activity details
- Cannot delete or modify activity log entries (audit integrity)
- Notifications sent reliably within 5 minutes of activity
- Activity log accessible via API for external audit tools
- Filtering and search perform well on large activity logs
- Change comparison accurately highlights all differences

**Related Requirements**: FR-PO-004, FR-PO-005, FR-PO-010

---

### FR-PO-017: QR Code Generation for Mobile Receiving Integration
**Priority**: High

**User Story**: As a purchasing staff member, I want QR codes automatically generated on purchase orders so that receiving staff can quickly scan and create goods receipt notes using the mobile receiving app.

**Requirements**:

**QR Code Generation**:
- QR code automatically generated when PO created/updated
- Generated using `qrcode` library (v1.5.3)
- QR code format: `PO:{orderNumber}`
  * Example: `PO:PO-2501-0001`
  * Prefix: "PO" (identifies entity type)
  * Separator: ":"
  * PO Number: Full purchase order number
- Base64-encoded data URL stored in database
- Regenerated if PO number changes (rare edge case)

**QR Code Display on PO Detail Page**:
- **QRCodeSection Component**: Located at `app/(main)/procurement/purchase-orders/components/QRCodeSection.tsx`
- Displayed as card in PO detail page sidebar or detail section
- Card sections:
  * **Header**: "Mobile Receiving" title with QR code icon
  * **Description**: "Scan this QR code with the mobile app to quickly receive goods"
  * **QR Code Display**:
    - 200×200px QR code image
    - Error correction level: Medium (M) - ~15% data restoration
    - 2-module margin around code
    - White background with subtle border
    - Loading spinner during generation
  * **PO Number**: Displayed below QR code for reference
  * **Action Buttons**:
    - Download QR Code: Downloads high-resolution PNG (400×400px, 4-module margin)
    - Copy PO Number: Copies PO number to clipboard with confirmation
  * **Instructions Panel**:
    - "How to use:" header
    - 5-step mobile scanning workflow
    - Visual guide with icons
  * **Mobile App Link**: Link to mobile app download page

**QR Code Storage**:
- PO interface fields:
  * `qrCode: string` - QR code value (e.g., "PO:PO-2501-0001")
  * `qrCodeImage: string` - Base64 data URL for display
  * `qrCodeGeneratedAt: Date` - Generation timestamp
- Updated whenever PO created or PO number changes
- Stored in database for quick retrieval

**QR Code PDF Integration**:
- QR code included in PDF printouts
- Positioned on PO document:
  * Top right corner OR
  * Bottom right corner OR
  * Dedicated section (configurable)
- PDF QR code size: Scaled for printing (2×2 cm minimum)
- Maintains scannability when printed

**Mobile Receiving Integration**:
- Mobile app (cmobile repository) scans QR code
- Extracts PO number from format: `PO:{orderNumber}`
- Retrieves PO details from API
- Auto-creates GRN in RECEIVED status
- See GRN BR document (FR-GRN-016) for complete mobile receiving workflow

**QR Code Utility Functions** (`lib/utils/qr-code.ts`):
- `generatePOQRValue(orderNumber)`: Creates QR code value string
- `parseQRValue(qrValue)`: Parses scanned QR code, extracts type and ID
- `isPOQRCode(qrValue)`: Validates QR code is for a PO
- `generatePOQRCode(orderNumber, options)`: Generates base64 QR code image
- `generatePOQRCodeCanvas(orderNumber, canvas, options)`: Renders QR code to HTML5 canvas
- `downloadPOQRCode(orderNumber, filename, options)`: Downloads QR code as PNG file
- `generateBatchPOQRCodes(orderNumbers, options)`: Bulk generates QR codes for multiple POs

**QR Code Options**:
- Error correction level: L (7%), M (15%), Q (25%), H (30%)
- Width/height: Configurable (default: 300px for display, 400px for download)
- Margin: Configurable modules (default: 4 for download, 2 for display)
- Image type: PNG, JPEG, WebP (default: PNG)

**Performance**:
- QR code generation: <200ms per PO
- Asynchronous generation to avoid blocking UI
- Cached in component state after generation
- Background regeneration if PO updated

**Security**:
- QR code contains only PO number (no sensitive data)
- API authentication required to retrieve PO details after scan
- Scanned PO must exist and be in valid status for receiving
- Role-based access controls enforced on mobile API

**Acceptance Criteria**:
- QR code auto-generates when PO created or updated
- QR code displays correctly on PO detail page within 500ms
- QR code format is `PO:{orderNumber}` exactly
- Download button creates PNG file named `{orderNumber}-QR.png`
- Downloaded QR code is high-resolution (400×400px) and scannable
- Copy button copies PO number and shows "Copied!" confirmation
- QR code visible on both desktop and mobile browsers
- QR code in PDF printouts is scannable when printed
- Mobile app successfully scans QR code and extracts PO number
- Scanning invalid QR code shows appropriate error message
- QR code component handles missing/invalid PO number gracefully
- Instructions panel clearly explains mobile scanning workflow
- Can generate QR codes for 100+ POs without performance issues

**Related Requirements**: FR-PO-004, FR-PO-007, FR-PO-009, FR-GRN-016 (GRN module)

---

## Business Rules

### Data Validation Rules

**BR-PO-VAL-001: PO Number Uniqueness**
- PO number must be unique across the system
- Auto-generated PO numbers follow format: PO-YYMM-NNNN
- Manual PO numbers must not duplicate existing

**BR-PO-VAL-002: Required Fields**
- Before sending PO to vendor, following fields mandatory:
  * Vendor (valid, active vendor)
  * At least one line item
  * Expected delivery date (future date)
  * Delivery location
  * Currency and exchange rate
  * All line items: Item, Quantity > 0, Unit Price ≥ 0

**BR-PO-VAL-003: Date Logic**
- Expected delivery date must be >= Order date
- Line item delivery dates must be >= PO order date
- Cannot set dates more than 5 years in future (configurable)

**BR-PO-VAL-004: Quantity Validations**
- Ordered quantity must be > 0
- Received quantity cannot exceed ordered quantity (beyond tolerance)
- Over-receiving tolerance: configurable per organization (default: +5%)
- Pending quantity = Ordered - Received (system calculated, cannot be manually set)

**BR-PO-VAL-005: Price Validations**
- Unit price must be ≥ 0
- Negative prices not allowed (use credit memos)
- Price variance alert if >20% different from last purchase price for same item
- Total amount cannot exceed configured maximum (e.g., $1M) without special approval

**BR-PO-VAL-006: Currency Rules**
- PO currency must be supported by vendor
- Exchange rate must be > 0
- Exchange rate cannot be changed after PO sent (requires amendment)
- All line items in PO must use same currency as PO header

**BR-PO-VAL-007: Vendor Validations**
- Vendor must be Active status
- Vendor must have valid contact information (at least email or phone)
- Cannot change vendor after PO sent (extremely restricted, requires admin)
- Vendor credit limit check (if enabled): Cannot create PO if will exceed vendor credit limit

### Workflow Rules

**BR-PO-WF-001: Status Progression**
- Status must follow defined workflow (cannot skip statuses arbitrarily)
- Valid transitions:
  * Draft → Sent, Cancelled, Deleted
  * Sent → Acknowledged, Cancelled
  * Acknowledged → Partial Received, Cancelled
  * Partial Received → Fully Received, Closed
  * Fully Received → Closed
  * Any → Closed (admin override)
- Cannot revert to earlier status (except Closed → Reopened by admin)

**BR-PO-WF-002: Edit Restrictions by Status**
- Draft: All fields editable, can delete PO
- Sent: Limited edits (notes, contact, delivery date), cannot delete
- Acknowledged: Very limited edits (notes only), cannot delete
- Partial Received: Notes only, cannot delete line items that are fully received
- Fully Received: Cannot edit financial data, notes only
- Closed: No edits allowed (except reopen)
- Cancelled: No edits allowed

**BR-PO-WF-003: Cancellation Rules**
- Can cancel PO only if status = Draft, Sent, or Acknowledged
- Cannot cancel if any items received (must close instead)
- Cancellation requires reason (mandatory field)
- Cancelled PO releases budget encumbrance
- Vendor must be notified of cancellation (auto-email)

**BR-PO-WF-004: Closure Rules**
- Can close PO only if status = Partial Received or Fully Received
- Closure reason required if pending quantities > tolerance (e.g., >2%)
- Closed PO cannot receive further goods
- Budget encumbrance released upon closure
- Can reopen closed PO within 30 days (admin only)

**BR-PO-WF-005: Deletion Rules**
- Can delete only Draft POs (not sent to vendor)
- Deleted POs soft-deleted (not permanently removed)
- Deleted POs retain PO number (cannot be reused)
- Cannot delete if linked to other documents (GRN, Invoice)

### Financial Rules

**BR-PO-FIN-001: Price Calculation**
- Line Total = Quantity × Unit Price × (1 - Discount%) × (1 + Tax%)
- Subtotal = Sum of all (Quantity × Unit Price)
- Discount = Item-level discounts + Header-level discount
- Net Amount = Subtotal - Discount
- Tax Amount = Net Amount × Tax Rate (or sum of line-level tax)
- Total Amount = Net Amount + Tax Amount + Additional Charges (freight, etc.)

**BR-PO-FIN-002: Budget Encumbrance**
- Budget encumbered when PO sent (status = Sent)
- Encumbrance amount = PO Total Amount in base currency
- Released when: PO Cancelled, PO Closed, Fiscal year end
- Partial release as goods received (if configured)
- Over-budget POs require manager approval before sending

**BR-PO-FIN-003: Currency Conversion**
- Base currency amount = PO currency amount × Exchange rate
- Exchange rate locked when PO sent
- Historical exchange rate used for all accounting entries
- Realized gain/loss calculated when invoice paid in different currency

**BR-PO-FIN-004: Discount Rules**
- Line-level discount: 0% to 100%
- Header-level discount: Applied after line totals calculated
- Both discounts can apply (line discount first, then header)
- Discount cannot result in negative price
- Discount must be approved if >10% (configurable)

**BR-PO-FIN-005: Tax Calculation**
- Tax rate per line item (can vary by item tax category)
- Tax calculated on net amount (after discount)
- Multiple tax rates supported (e.g., VAT + local tax)
- Tax exemption flag per line item (if applicable)
- Tax rules follow organizational tax configuration

### Receiving Rules

**BR-PO-RCV-001: Partial Receiving**
- Can receive items in multiple batches (multiple GRNs)
- Each GRN must reference original PO
- Received quantity per GRN cannot exceed pending quantity (beyond tolerance)
- PO status updates automatically:
  * First GRN → Partial Received
  * Last item fully received → Fully Received

**BR-PO-RCV-002: Over-Receiving**
- Over-receiving allowed within configured tolerance (default +5%)
- Beyond tolerance: Requires supervisor approval
- Over-received quantity creates variance for resolution
- Option to:
  * Accept over-shipment (adjust PO quantity via amendment)
  * Reject excess (return to vendor)
  * Accept as free goods (no charge)

**BR-PO-RCV-003: Quality Inspection**
- Items flagged for quality inspection: GRN holds inventory in "inspection" status
- Inventory not available until inspection passed
- Inspection failure: Initiate return process
- Partial acceptance: Accepted quantity moves to stock, rejected quantity returned

**BR-PO-RCV-004: Returns**
- Can return received goods within configured period (e.g., 30 days)
- Return reduces received quantity, increases pending quantity
- Return GRN (negative quantities) created
- Vendor debit note generated
- Return reasons tracked (damaged, defective, wrong item, etc.)

### Integration Rules

**BR-PO-INT-001: PR Integration**
- POs created from PRs maintain source linkage
- PR items marked "converted" when included in sent PO
- Cannot create multiple POs from same PR item (duplicate prevention)
- Cancelled PO reverts PR item to "approved" (available for new PO)
- PR cannot be deleted if any items converted to PO

**BR-PO-INT-002: GRN Integration**
- GRN must reference valid PO
- GRN line items must match PO line items (item and unit)
- Received quantity in GRN updates PO received/pending quantities
- Multiple GRNs can reference same PO
- Cannot create GRN for cancelled PO

**BR-PO-INT-003: Invoice Integration (3-Way Matching)**
- Invoice must reference PO
- Matching checks:
  * Quantity match: Invoice qty ≈ GRN received qty (within tolerance)
  * Price match: Invoice unit price ≈ PO unit price (within tolerance)
  * Vendor match: Invoice vendor = PO vendor
- Match status:
  * Matched: All criteria met, approve for payment
  * Variance: Minor discrepancies within tolerance, flag for review
  * Mismatch: Significant discrepancies, hold for investigation
- Cannot pay invoice until match status resolved

**BR-PO-INT-004: Budget Integration**
- PO amount checked against available budget
- Budget source: Department budget, Cost center budget, Project budget
- Over-budget POs require approval workflow
- Budget encumbrance created when PO sent
- Budget verification happens at PO send time (not creation)

### Approval Rules

**BR-PO-APP-001: PO Approval (Not Workflow)**
- **IMPORTANT**: POs do NOT have multi-stage approval workflows like PRs
- POs are created by authorized purchasing staff who have approval authority
- High-value PO review (optional): POs above configured threshold (e.g., $50K) can be flagged for manager review before sending
- Review is informational, not blocking (manager notified, can suggest changes)
- Purchasing staff retains authority to send PO after consideration

**BR-PO-APP-002: Amendment Approval**
- Amendments increasing PO value by >10% or >$5,000: Require manager approval
- Approval via simple approve/reject action (not multi-stage workflow)
- Approved amendments can be sent to vendor
- Rejected amendments returned to purchasing staff for revision

### Security and Permissions

**BR-PO-SEC-001: Role-Based Access**
- **Purchasing Staff**: Create, edit, send, cancel POs; Full PO management
- **Purchasing Manager**: All purchasing staff actions + Approve high-value POs/amendments, Access all department POs, Override business rules
- **Receiving Staff**: View sent/acknowledged POs, Create GRNs, Mark items as received
- **Department Manager**: View POs related to their department PRs, Track requisition fulfillment, Read-only access
- **Finance Staff**: View all POs, Access for 3-way matching, Read-only access to PO details
- **General User**: View their own created POs (if allowed to create blank POs), No access to other users' POs

**BR-PO-SEC-002: Data Access**
- Users see POs based on: Their created POs, Their department's POs, Organization-wide (if permission granted)
- Sensitive information (pricing) can be hidden for certain roles
- Cannot access deleted or archived POs without special permission

**BR-PO-SEC-003: Audit Trail**
- All changes logged with user, timestamp, old/new values
- Activity log cannot be modified or deleted by regular users
- Failed login attempts to access PO recorded
- Export and print actions logged

---

## Constraints

### Technical Constraints

1. **Performance**: PO list must load within 2 seconds for 10,000+ records
2. **Concurrent Access**: System must handle 50+ concurrent users editing different POs
3. **Browser Support**: Must work on modern browsers (Chrome, Firefox, Safari, Edge) - last 2 versions
4. **Mobile Responsive**: PO list and detail pages must be usable on tablets (iPads, Android tablets)
5. **File Size**: Attachment uploads limited to 10MB per file, 50MB total per PO
6. **Data Retention**: PO data retained for minimum 7 years for audit compliance

### Business Constraints

1. **Budget**: PO creation depends on budget availability (if budget control enabled)
2. **Vendor Status**: Can only create POs for active vendors with valid contact information
3. **Item Availability**: Can only order active, purchasable items from catalog
4. **Approval Authority**: Purchasing staff must have proper role permissions to create/send POs
5. **Currency Support**: Limited to currencies configured in system and supported by vendors
6. **Fiscal Year**: Some operations restricted during fiscal year-end closing period

### Integration Constraints

1. **PR System**: PO module depends on Purchase Requests module for "Create from PR" functionality
2. **Vendor Master**: Vendor information pulled from centralized vendor management system
3. **Item Master**: Item catalog must be maintained for item selection
4. **Budget System**: Budget checking requires integration with finance/budget module
5. **GRN System**: Receiving functionality requires Goods Receipt Note module
6. **Email Service**: Email notifications require configured SMTP server or email service

### Regulatory Constraints

1. **Audit Requirements**: Must maintain complete audit trail for all PO changes (SOX compliance if applicable)
2. **Tax Compliance**: Tax calculations must follow local tax laws and regulations
3. **Data Privacy**: PII in POs (contact information) must be handled per data privacy regulations (GDPR, etc.)
4. **Record Retention**: Financial records must be retained per legal requirements (varies by jurisdiction)

---

## Success Criteria

### Functional Success

1. **PO Creation Efficiency**: Users can create and send a 10-item PO in less than 5 minutes
2. **PR Conversion**: 90%+ of approved PRs converted to POs within 48 hours
3. **Data Accuracy**: 99%+ accuracy in PO data (quantities, prices, vendors)
4. **Status Tracking**: Real-time PO status visible to all stakeholders
5. **Receiving Integration**: Seamless GRN creation from POs with <2% discrepancies

### User Adoption

1. **Training**: 80%+ of purchasing staff trained and proficient within 2 weeks
2. **User Satisfaction**: Average user satisfaction score >4/5 in feedback surveys
3. **Error Rate**: <5% of POs require corrections after sending to vendor
4. **Self-Service**: 70%+ of POs created without IT support

### Performance Success

1. **Page Load Time**: PO list loads <2 seconds, Detail page loads <3 seconds
2. **Search Performance**: Search results return <1 second for 10,000+ POs
3. **System Uptime**: 99.5%+ uptime during business hours
4. **Concurrent Users**: Support 50+ concurrent users without performance degradation

### Business Impact

1. **Process Time Reduction**: 40% reduction in time from PR approval to PO sent
2. **Cost Savings**: Improved vendor consolidation reduces redundant POs by 20%
3. **Budget Compliance**: 95%+ of POs within budget at time of creation
4. **Vendor Communication**: 80% of vendors acknowledge POs within 3 business days
5. **Audit Compliance**: Zero audit findings related to PO documentation and approval

---

## Dependencies

### Upstream Dependencies (Required)

1. **User Authentication System**: User login, roles, permissions
2. **Vendor Management Module**: Vendor master data, contact information, payment terms
3. **Item/Product Master**: Catalog of purchasable items, pricing, specifications
4. **Purchase Requests Module**: Approved PRs available for PO conversion
5. **Currency Management**: Supported currencies, exchange rates, conversion logic
6. **Budget Module** (if enabled): Budget allocation, availability checking, encumbrance

### Downstream Dependencies (Dependent on PO)

1. **Goods Receipt Note (GRN) Module**: Receives goods against POs, updates received quantities
2. **Accounts Payable/Invoice Module**: 3-way matching (PO-GRN-Invoice) for payment processing
3. **Inventory Management**: Stock levels updated upon GRN posting
4. **Financial Reporting**: PO data for spend analysis, budget vs actual reports
5. **Vendor Performance Module**: PO delivery data for vendor rating

### External Dependencies

1. **Email Service**: SMTP server or email service (SendGrid, AWS SES) for sending PO emails
2. **PDF Generation Library**: For creating PO PDF documents
3. **Exchange Rate Service** (optional): External API for real-time currency exchange rates (e.g., exchangeratesapi.io, xe.com)
4. **QR Code Library**: ✅ **IMPLEMENTED** - `qrcode` v1.5.3 (npm package)
   - Generates QR codes for PO numbers in format `PO:{orderNumber}`
   - Used for mobile receiving integration with cmobile app
   - Provides base64 data URLs for web display and PNG downloads
   - Implementation: `lib/utils/qr-code.ts` utilities and `QRCodeSection.tsx` component
   - Purpose: Enable quick GRN creation by scanning PO QR codes on mobile devices

### Infrastructure Dependencies

1. **Database**: PostgreSQL or similar relational database for PO data storage
2. **File Storage**: For PO attachments, PDF archives (AWS S3, Azure Blob, local storage)
3. **Application Server**: Node.js/Next.js server environment
4. **Web Server**: For hosting application and serving static assets

---

## Glossary

| Term | Definition |
|------|------------|
| **3-Way Matching** | Process of comparing Purchase Order, Goods Receipt Note, and Vendor Invoice to ensure quantities, prices, and vendors match before approving payment |
| **Acknowledgment** | Vendor's confirmation of receipt and acceptance of a Purchase Order |
| **Amendment** | Official modification to a sent or acknowledged Purchase Order, requiring documentation and often vendor approval |
| **Base Currency** | The organization's primary currency for financial reporting and accounting (e.g., PHP for Philippines-based hotel) |
| **Budget Encumbrance** | Reservation of budget funds when PO is sent, preventing over-spending |
| **Bulk Creation** | Creating multiple Purchase Orders simultaneously from grouped Purchase Requests |
| **Change Order** | Formal document recording amendments to original PO terms |
| **Credit Memo/Debit Note** | Document issued for returns, price adjustments, or corrections after goods received |
| **Exchange Rate** | Conversion rate between PO currency and base currency, locked when PO sent |
| **Goods Receipt Note (GRN)** | Document recording actual receipt of goods, quantities, and condition |
| **Grouping** | Automatic consolidation of Purchase Requests by vendor, currency, and delivery date to create single PO |
| **Line Item** | Individual product or service entry within a Purchase Order |
| **Over-Receiving** | Receiving more quantity than ordered, within defined tolerance |
| **Partial Receipt** | Receiving some but not all ordered items on a Purchase Order |
| **Pending Quantity** | Ordered quantity minus received quantity (still expected to be delivered) |
| **Purchase Order (PO)** | Official document issued to vendor, authorizing purchase of specific goods/services at agreed prices and terms |
| **Purchase Requisition (PR)** | Internal request for goods/services, requiring approval before conversion to PO |
| **PO Currency** | The currency in which the Purchase Order is denominated (may differ from base currency) |
| **PO Template** | Saved PO configuration for commonly ordered items, used to quickly create new POs |
| **QR Code** | Machine-readable code containing PO number in format `PO:{orderNumber}`, scannable by mobile app for quick GRN creation |
| **Received Quantity** | Actual quantity of items received and recorded in GRNs |
| **Recurring PO** | Purchase Order automatically created at regular intervals based on predefined schedule |
| **Source PR** | The original Purchase Requisition from which a PO was created (traceability) |
| **Status** | Current state of PO in its lifecycle (Draft, Sent, Acknowledged, Partial Received, Fully Received, Closed, Cancelled) |
| **Three-Way Match** | See "3-Way Matching" |
| **Tolerance** | Acceptable variance in quantity or price (e.g., +5% over-receiving tolerance) |
| **Vendor** | Supplier or service provider who receives and fulfills Purchase Orders |

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Business Owner** | Procurement Manager | | |
| **Product Owner** | | | |
| **Technical Lead** | | | |
| **QA Lead** | | | |

---

**Document Control**
- Location: `/docs/app/procurement/purchase-orders/BR-purchase-orders.md`
- Last Updated: 2025-12-02
- Next Review: 2026-03-01
- Version: 1.3.0

---

*This Business Requirements document was generated based on comprehensive source code analysis of the Carmen ERP purchase orders module. All functional requirements documented herein represent features that exist in the implemented system.*
