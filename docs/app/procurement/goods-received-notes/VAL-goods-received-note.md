# VAL-GRN: Goods Received Note Validation Rules

**Module**: Procurement
**Sub-Module**: Goods Received Note
**Document Type**: Validations (VAL)
**Version**: 1.0.2
**Last Updated**: 2025-12-03
**Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.2 | 2025-12-03 | Documentation Team | Added costing method context (FIFO or Periodic Average configurable at system level) |
| 1.0.1 | 2025-12-03 | Documentation Team | Verified coverage against BR requirements (FR-GRN-001 to FR-GRN-017) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

### 1.1 Purpose
This document defines comprehensive validation rules for the Goods Received Note (GRN) module to ensure data integrity, enforce business rules, maintain security, and provide a consistent user experience. GRN validation is critical because:

- **Financial Impact**: GRNs trigger inventory valuation and accounts payable transactions. Inventory layers created by GRN are used by the system-configured costing method (FIFO or Periodic Average, set in System Administration → Inventory Settings) when inventory is consumed
- **Inventory Accuracy**: Incorrect GRN data leads to stock discrepancies and operational issues
- **Audit Compliance**: GRNs are legal documents requiring accurate data for audits
- **Multi-Currency**: Currency conversions and exchange rates require precise validation

### 1.2 Scope
This document defines validation rules across three layers:
- **Client-Side**: Immediate user feedback and UX validation
- **Server-Side**: Security and business rule enforcement
- **Database**: Final data integrity constraints

### 1.3 Validation Strategy

```
User Input
    ↓
[Client-Side Validation] ← Immediate feedback, UX
    ↓
[Server-Side Validation] ← Security, business rules
    ↓
[Database Constraints] ← Final enforcement
    ↓
Data Stored
```

**Validation Principles**:
1. Never trust client-side data - always validate on server
2. Provide immediate user feedback when possible
3. Use clear, actionable error messages
4. Prevent security vulnerabilities (SQL injection, XSS)
5. Enforce business rules consistently
6. Validate data integrity across related entities

---

## 2. Field-Level Validations (VAL-GRN-001 to 099)

### VAL-GRN-001: GRN Number - Required Field Validation

**Field**: `grnNumber`
**Database Column**: `goods_receive_notes.grn_number`
**Data Type**: VARCHAR(50) / string

**Validation Rule**: GRN Number is mandatory and must be unique across all GRNs.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field label. Auto-generate number on form load. Show error if modified to empty.
- **Server-Side**: Reject request if field is missing, null, or contains only whitespace. Verify uniqueness before saving.
- **Database**: Column defined as NOT NULL with UNIQUE constraint.

**Error Code**: VAL-GRN-001
**Error Message**: "GRN Number is required"
**User Action**: System automatically generates unique GRN number. User should not manually modify.

**Test Cases**:
- ✅ Valid: "GRN-2501-001234"
- ✅ Valid: "GRN-2501-001235" (unique)
- ❌ Invalid: "" (empty)
- ❌ Invalid: "GRN-2501-001234" (duplicate)
- ❌ Invalid: null or undefined

---

### VAL-GRN-002: Receipt Date - Required Field Validation

**Field**: `receiptDate`
**Database Column**: `goods_receive_notes.receipt_date`
**Data Type**: DATE / Date

**Validation Rule**: Receipt date is mandatory and cannot be empty.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field label. Default to today's date. Show error on blur if empty.
- **Server-Side**: Reject request if field is missing or null.
- **Database**: Column defined as NOT NULL.

**Error Code**: VAL-GRN-002
**Error Message**: "Receipt date is required"
**User Action**: User must select a valid date.

**Test Cases**:
- ✅ Valid: 2025-01-30 (valid date)
- ✅ Valid: Today's date
- ❌ Invalid: null
- ❌ Invalid: undefined
- ❌ Invalid: "" (empty string)

---

### VAL-GRN-003: Receipt Date - Future Date Validation

**Field**: `receiptDate`

**Validation Rule**: Receipt date cannot be in the future.

**Rationale**: Cannot receive goods that haven't arrived yet. Ensures data accuracy and prevents backdating issues.

**Implementation Requirements**:
- **Client-Side**: Set maximum date for date picker to today. Show warning if future date selected.
- **Server-Side**: Compare receipt date with server's current date. Reject if future date.
- **Database**: CHECK constraint: receipt_date <= CURRENT_DATE.

**Error Code**: VAL-GRN-003
**Error Message**: "Receipt date cannot be in the future"
**User Action**: User must select today's date or an earlier date.

**Test Cases**:
- ✅ Valid: 2025-01-30 (today or past)
- ✅ Valid: 2025-01-15 (past date)
- ❌ Invalid: 2025-02-15 (future date when today is 2025-01-30)
- ❌ Invalid: Tomorrow's date

---

### VAL-GRN-004: Vendor - Required Field Validation

**Field**: `vendorId` and `vendorName`
**Database Column**: `goods_receive_notes.vendor_id`, `goods_receive_notes.vendor_name`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: Vendor selection is mandatory. Both vendor ID and vendor name must be provided.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field label. Vendor dropdown required. Show error if empty.
- **Server-Side**: Reject request if vendor ID is missing or vendor doesn't exist in system.
- **Database**: Column defined as NOT NULL with foreign key constraint to vendors table.

**Error Code**: VAL-GRN-004
**Error Message**: "Vendor is required"
**User Action**: User must select a vendor from the dropdown list.

**Test Cases**:
- ✅ Valid: vendorId = "V001", vendorName = "Professional Kitchen Supplies"
- ❌ Invalid: vendorId = null
- ❌ Invalid: vendorId = "" (empty)
- ❌ Invalid: vendorId = "INVALID" (non-existent vendor)

---

### VAL-GRN-005: Status - Required and Valid Enum

**Field**: `status`
**Database Column**: `goods_receive_notes.status`
**Data Type**: ENUM('DRAFT', 'RECEIVED', 'COMMITTED', 'VOID') / GRNStatus

**Validation Rule**: Status must be one of the defined enum values: DRAFT, RECEIVED, COMMITTED, or VOID.

**Implementation Requirements**:
- **Client-Side**: Use dropdown with only valid status values. Disable manual input.
- **Server-Side**: Verify status matches one of the enum values.
- **Database**: Column defined as ENUM type with allowed values.

**Error Code**: VAL-GRN-005
**Error Message**: "Invalid GRN status. Must be DRAFT, RECEIVED, COMMITTED, or VOID"
**User Action**: User must select a valid status from the allowed values.

**Test Cases**:
- ✅ Valid: "DRAFT"
- ✅ Valid: "RECEIVED"
- ✅ Valid: "COMMITTED"
- ✅ Valid: "VOID"
- ❌ Invalid: "PENDING" (not in enum)
- ❌ Invalid: "approved" (case-sensitive)
- ❌ Invalid: null

---

### VAL-GRN-006: Received By - Required Field Validation

**Field**: `receivedBy`
**Database Column**: `goods_receive_notes.received_by`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: The person who received the goods must be specified.

**Implementation Requirements**:
- **Client-Side**: Auto-populate with current user's name. Display red asterisk (*). Show error if empty.
- **Server-Side**: Reject request if field is missing or null. Verify user exists in system.
- **Database**: Column defined as NOT NULL.

**Error Code**: VAL-GRN-006
**Error Message**: "Received by is required"
**User Action**: System automatically populates with current user. User can override if authorized.

**Test Cases**:
- ✅ Valid: "Alice Thompson"
- ✅ Valid: "John Doe" (valid user)
- ❌ Invalid: "" (empty)
- ❌ Invalid: null

---

### VAL-GRN-007: Location - Required Field Validation

**Field**: `locationId`
**Database Column**: `goods_receive_notes.location_id`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: Storage location is mandatory for all GRNs.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field label. Location dropdown required. Show error if empty.
- **Server-Side**: Reject request if location ID is missing or location doesn't exist.
- **Database**: Column defined as NOT NULL with foreign key constraint to locations table.

**Error Code**: VAL-GRN-007
**Error Message**: "Location is required"
**User Action**: User must select a receiving location from the dropdown.

**Test Cases**:
- ✅ Valid: locationId = "LOC-KIT-001" (Kitchen Receiving)
- ✅ Valid: locationId = "LOC-OFF-001" (Office Storage)
- ❌ Invalid: locationId = null
- ❌ Invalid: locationId = "" (empty)
- ❌ Invalid: locationId = "INVALID" (non-existent location)

---

### VAL-GRN-008: Total Items - Positive Integer Validation

**Field**: `totalItems`
**Database Column**: `goods_receive_notes.total_items`
**Data Type**: INTEGER / number

**Validation Rule**: Total items must be a positive integer greater than zero.

**Rationale**: A GRN without items is meaningless. Must have at least one line item.

**Implementation Requirements**:
- **Client-Side**: Auto-calculate from line items count. Display as read-only field.
- **Server-Side**: Verify value matches actual count of line items. Reject if zero or negative.
- **Database**: CHECK constraint: total_items > 0.

**Error Code**: VAL-GRN-008
**Error Message**: "GRN must have at least one item"
**User Action**: User must add at least one line item to the GRN.

**Test Cases**:
- ✅ Valid: 1 (one item)
- ✅ Valid: 10 (multiple items)
- ❌ Invalid: 0 (no items)
- ❌ Invalid: -1 (negative)
- ❌ Invalid: null

---

### VAL-GRN-009: Total Quantity - Positive Number Validation

**Field**: `totalQuantity`
**Database Column**: `goods_receive_notes.total_quantity`
**Data Type**: DECIMAL(15,3) / number

**Validation Rule**: Total quantity must be a positive number greater than zero.

**Implementation Requirements**:
- **Client-Side**: Auto-calculate from sum of all line item received quantities. Display as read-only.
- **Server-Side**: Verify value matches actual sum of line item quantities. Reject if zero or negative.
- **Database**: CHECK constraint: total_quantity > 0.

**Error Code**: VAL-GRN-009
**Error Message**: "Total quantity must be greater than zero"
**User Action**: User must ensure at least one item has a received quantity > 0.

**Test Cases**:
- ✅ Valid: 10.500 (positive decimal)
- ✅ Valid: 1 (minimum)
- ❌ Invalid: 0 (zero)
- ❌ Invalid: -5.5 (negative)

---

### VAL-GRN-010: Total Value - Positive Money Validation

**Field**: `totalValue`
**Database Column**: `goods_receive_notes.total_value_amount`, `goods_receive_notes.total_value_currency`
**Data Type**: Money (amount: DECIMAL(15,2), currency: VARCHAR(3))

**Validation Rule**: Total value must be a positive monetary amount with valid currency code.

**Implementation Requirements**:
- **Client-Side**: Auto-calculate from sum of all line item total values. Display as read-only with currency symbol.
- **Server-Side**: Verify calculation matches line item totals. Validate currency code is ISO 4217 compliant.
- **Database**: CHECK constraint: total_value_amount > 0. Foreign key to currencies table.

**Error Code**: VAL-GRN-010
**Error Message**: "Total value must be greater than zero"
**User Action**: System automatically calculates total value. User should verify line item prices are correct.

**Test Cases**:
- ✅ Valid: {amount: 1250.50, currency: "USD"}
- ✅ Valid: {amount: 850.00, currency: "EUR"}
- ❌ Invalid: {amount: 0, currency: "USD"} (zero amount)
- ❌ Invalid: {amount: -100, currency: "USD"} (negative)
- ❌ Invalid: {amount: 100, currency: "XXX"} (invalid currency)

---

### VAL-GRN-011: Invoice Number - Format Validation

**Field**: `invoiceNumber`
**Database Column**: `goods_receive_notes.invoice_number`
**Data Type**: VARCHAR(50) / string

**Validation Rule**: If provided, invoice number must be alphanumeric with hyphens allowed. Maximum 50 characters.

**Rationale**: Ensures consistent invoice number format for matching and reconciliation.

**Implementation Requirements**:
- **Client-Side**: Optional field. Validate format on blur. Show format hint below field.
- **Server-Side**: Verify pattern match if value provided: ^[A-Za-z0-9-]+$
- **Database**: Column allows NULL. VARCHAR(50).

**Error Code**: VAL-GRN-011
**Error Message**: "Invoice number can only contain letters, numbers, and hyphens"
**User Action**: User must enter invoice number in correct format or leave blank.

**Test Cases**:
- ✅ Valid: "INV-2501-001234"
- ✅ Valid: "INV001234" (no hyphens)
- ✅ Valid: null (optional field)
- ❌ Invalid: "INV/2025/001" (contains slash)
- ❌ Invalid: "INV 001234" (contains space)

---

### VAL-GRN-012: Line Item - Item Code Required

**Field**: `itemCode` (in GRNItem)
**Database Column**: `goods_receive_note_items.item_code`
**Data Type**: VARCHAR(50) / string

**Validation Rule**: Item code is mandatory for all line items.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field. Show error if empty. Auto-populate from item selection.
- **Server-Side**: Reject line item if item code is missing or null.
- **Database**: Column defined as NOT NULL.

**Error Code**: VAL-GRN-012
**Error Message**: "Item code is required"
**User Action**: User must select an item from the catalog.

**Test Cases**:
- ✅ Valid: "ITM-BLEND-001"
- ✅ Valid: "ITM-CHAIR-005"
- ❌ Invalid: "" (empty)
- ❌ Invalid: null

---

### VAL-GRN-013: Line Item - Delivered Quantity Required

**Field**: `deliveredQuantity` (in GRNItem)
**Database Column**: `goods_receive_note_items.delivered_quantity`
**Data Type**: DECIMAL(15,3) / number

**Validation Rule**: Delivered quantity must be a positive number greater than or equal to zero.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*). Validate on change. Must be numeric and >= 0.
- **Server-Side**: Verify value is numeric and >= 0.
- **Database**: Column defined as NOT NULL. CHECK constraint: delivered_quantity >= 0.

**Error Code**: VAL-GRN-013
**Error Message**: "Delivered quantity must be zero or greater"
**User Action**: User must enter the quantity shown on delivery note.

**Test Cases**:
- ✅ Valid: 10.500 (positive decimal)
- ✅ Valid: 0 (zero acceptable for partial delivery)
- ✅ Valid: 100 (whole number)
- ❌ Invalid: -5 (negative)
- ❌ Invalid: null

---

### VAL-GRN-014: Line Item - Received Quantity Required

**Field**: `receivedQuantity` (in GRNItem)
**Database Column**: `goods_receive_note_items.received_quantity`
**Data Type**: DECIMAL(15,3) / number

**Validation Rule**: Received quantity must be a positive number greater than or equal to zero.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*). Validate on change. Must be numeric and >= 0.
- **Server-Side**: Verify value is numeric and >= 0.
- **Database**: Column defined as NOT NULL. CHECK constraint: received_quantity >= 0.

**Error Code**: VAL-GRN-014
**Error Message**: "Received quantity must be zero or greater"
**User Action**: User must enter the actual quantity received in good condition.

**Test Cases**:
- ✅ Valid: 10 (positive)
- ✅ Valid: 0 (zero acceptable if all rejected/damaged)
- ✅ Valid: 9.5 (decimal)
- ❌ Invalid: -2 (negative)
- ❌ Invalid: null

---

### VAL-GRN-015: Line Item - Unit Price Required

**Field**: `unitPrice` (in GRNItem)
**Database Column**: `goods_receive_note_items.unit_price_amount`, `goods_receive_note_items.unit_price_currency`
**Data Type**: Money (amount: DECIMAL(15,2), currency: VARCHAR(3))

**Validation Rule**: Unit price must be a positive monetary amount with valid currency code.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*). Validate on change. Must be > 0 with valid currency.
- **Server-Side**: Verify amount > 0 and currency code is valid ISO 4217.
- **Database**: CHECK constraint: unit_price_amount > 0. Foreign key to currencies table.

**Error Code**: VAL-GRN-015
**Error Message**: "Unit price must be greater than zero"
**User Action**: User must enter a valid unit price from purchase order or invoice.

**Test Cases**:
- ✅ Valid: {amount: 125.50, currency: "USD"}
- ✅ Valid: {amount: 0.01, currency: "EUR"} (minimum)
- ❌ Invalid: {amount: 0, currency: "USD"} (zero)
- ❌ Invalid: {amount: -10, currency: "USD"} (negative)
- ❌ Invalid: {amount: 100, currency: "XXX"} (invalid currency)

---

### VAL-GRN-016: Line Item - Storage Location Required

**Field**: `storageLocationId` (in GRNItem)
**Database Column**: `goods_receive_note_items.storage_location_id`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: Storage location is mandatory for all line items.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*). Location dropdown required.
- **Server-Side**: Reject if location ID missing or location doesn't exist.
- **Database**: Column defined as NOT NULL with foreign key to locations table.

**Error Code**: VAL-GRN-017
**Error Message**: "Storage location is required"
**User Action**: User must select where the item will be stored.

**Test Cases**:
- ✅ Valid: "LOC-KIT-STORE-001"
- ✅ Valid: "LOC-OFF-STORE-001"
- ❌ Invalid: null
- ❌ Invalid: "" (empty)
- ❌ Invalid: "INVALID" (non-existent)

---

### VAL-GRN-018: Line Item - Decimal Precision

**Field**: Quantity fields (delivered, received, rejected, damaged)

**Validation Rule**: Quantity values must have at most 3 decimal places.

**Rationale**: Maintains consistency with unit of measure precision (weights use 3 decimals, counts use 0).

**Implementation Requirements**:
- **Client-Side**: Validate decimal places on change. Round display value to 3 decimals.
- **Server-Side**: Verify decimal precision before saving.
- **Database**: Column defined as DECIMAL(15,3).

**Error Code**: VAL-GRN-018
**Error Message**: "Quantity can have at most 3 decimal places"
**User Action**: User must round to 3 decimal places or fewer.

**Test Cases**:
- ✅ Valid: 10.500 (3 decimals)
- ✅ Valid: 10 (0 decimals)
- ✅ Valid: 10.5 (1 decimal)
- ❌ Invalid: 10.5678 (4 decimals)

---

## 3. Business Rule Validations (VAL-GRN-101 to 199)

### VAL-GRN-101: Cannot Commit Draft GRN

**Rule Description**: A GRN in DRAFT status cannot be committed to inventory until it is moved to RECEIVED status.

**Business Justification**: DRAFT status indicates incomplete or unverified data. Only GRNs in RECEIVED status have been fully verified and are ready for commitment.

**Validation Logic**:
1. Check current GRN status
2. If status = DRAFT, prevent commitment action
3. User must first move GRN to RECEIVED status
4. Then commitment is allowed

**When Validated**: When user attempts to commit GRN to inventory

**Implementation Requirements**:
- **Client-Side**: Disable "Commit" button if status is DRAFT. Show tooltip explaining why.
- **Server-Side**: Reject commit action if status != RECEIVED.
- **Database**: Not enforced (business logic only).

**Error Code**: VAL-GRN-101
**Error Message**: "Cannot commit GRN in DRAFT status. Please change status to RECEIVED first."
**User Action**: User must change GRN status to RECEIVED before attempting to commit.

**Related Business Requirements**: BR-GRN-004

**Examples**:

**Scenario 1: Valid Case**
- Situation: User attempts to commit GRN
- GRN Status: RECEIVED
- Result: ✅ Validation passes
- Reason: GRN is in correct status for commitment

**Scenario 2: Invalid Case**
- Situation: User attempts to commit GRN
- GRN Status: DRAFT
- Result: ❌ Validation fails
- Reason: GRN must be in RECEIVED status
- User must: Change status to RECEIVED, then retry commit

---

### VAL-GRN-102: Cannot Edit Committed GRN

**Rule Description**: Once a GRN is committed to inventory (status = COMMITTED), it cannot be edited or modified. Only void operation is allowed.

**Business Justification**: Committed GRNs have already updated inventory and financial records. Editing would create data inconsistencies and audit trail issues.

**Validation Logic**:
1. Check current GRN status
2. If status = COMMITTED, prevent all edit operations
3. If status = COMMITTED, only allow void operation (which creates reversal entries)

**When Validated**: Before any update operation on GRN or line items

**Implementation Requirements**:
- **Client-Side**: Make all fields read-only if status = COMMITTED. Show "View Only" indicator. Enable only "Void" button.
- **Server-Side**: Reject any update request if status = COMMITTED.
- **Database**: Not enforced (business logic only).

**Error Code**: VAL-GRN-102
**Error Message**: "Cannot edit committed GRN. To reverse this transaction, use the Void function."
**User Action**: User cannot edit. Must void the GRN and create a new one if correction needed.

**Related Business Requirements**: BR-GRN-005

**Examples**:

**Scenario 1: Valid Case**
- Situation: User attempts to edit GRN
- GRN Status: DRAFT or RECEIVED
- Result: ✅ Validation passes
- Reason: Uncommitted GRNs can be edited

**Scenario 2: Invalid Case**
- Situation: User attempts to edit GRN
- GRN Status: COMMITTED
- Result: ❌ Validation fails
- Reason: Committed GRNs are immutable
- User must: Void the GRN if reversal needed

---

### VAL-GRN-103: Received Quantity Cannot Exceed Delivered Quantity

**Rule Description**: For each line item, the received quantity (good condition) cannot exceed the delivered quantity shown on delivery note.

**Business Justification**: Prevents data entry errors and ensures inventory accuracy. Cannot receive more than was delivered.

**Validation Logic**:
1. For each line item, verify: receivedQuantity <= deliveredQuantity
2. Allow received quantity to be less than delivered (damaged/rejected items)
3. Reject if received quantity exceeds delivered quantity

**When Validated**: On line item save, on GRN submission

**Implementation Requirements**:
- **Client-Side**: Validate on quantity field change. Show error if received > delivered. Display warning icon.
- **Server-Side**: Verify constraint before saving line item.
- **Database**: CHECK constraint: received_quantity <= delivered_quantity.

**Error Code**: VAL-GRN-103
**Error Message**: "Received quantity ({received}) cannot exceed delivered quantity ({delivered})"
**User Action**: User must correct the received quantity or verify the delivered quantity.

**Related Business Requirements**: BR-GRN-007

**Examples**:

**Scenario 1: Valid Case**
- Line Item: Commercial Blender
- Delivered Quantity: 10
- Received Quantity: 10
- Result: ✅ Validation passes (equal is allowed)

**Scenario 2: Valid Case**
- Line Item: Chef's Knives
- Delivered Quantity: 20
- Received Quantity: 18
- Rejected Quantity: 2
- Result: ✅ Validation passes (received < delivered)

**Scenario 3: Invalid Case**
- Line Item: Office Chair
- Delivered Quantity: 5
- Received Quantity: 7
- Result: ❌ Validation fails
- Reason: Cannot receive more than delivered
- User must: Verify quantities and correct data entry error

---

### VAL-GRN-104: Quantity Reconciliation

**Rule Description**: For each line item, the sum of received, rejected, and damaged quantities must equal the delivered quantity.

**Business Justification**: Ensures all delivered items are accounted for. Prevents missing items and maintains inventory accuracy.

**Validation Logic**:
1. Calculate: receivedQuantity + rejectedQuantity + damagedQuantity
2. Verify: sum = deliveredQuantity
3. Reject if sum != deliveredQuantity

**When Validated**: On line item save, on GRN submission

**Implementation Requirements**:
- **Client-Side**: Auto-calculate and display remaining quantity as user enters values. Show error if sum != delivered.
- **Server-Side**: Verify equation before saving.
- **Database**: CHECK constraint or trigger to enforce rule.

**Error Code**: VAL-GRN-104
**Error Message**: "Quantities do not reconcile. Received ({received}) + Rejected ({rejected}) + Damaged ({damaged}) must equal Delivered ({delivered})"
**User Action**: User must adjust quantities so they add up to delivered quantity.

**Related Business Requirements**: BR-GRN-007

**Examples**:

**Scenario 1: Valid Case**
- Delivered: 100
- Received: 95
- Rejected: 3
- Damaged: 2
- Sum: 95 + 3 + 2 = 100 ✅

**Scenario 2: Invalid Case**
- Delivered: 100
- Received: 95
- Rejected: 3
- Damaged: 0
- Sum: 95 + 3 + 0 = 98 ❌
- Shortfall: 2 units unaccounted for
- User must: Enter damaged quantity of 2, or adjust other quantities

---

### VAL-GRN-105: PO-Based GRN Must Reference Valid PO (Multi-PO Support)

**Rule Description**: For PO-based GRN items, the purchaseOrderId on each line item must reference a valid, existing PO. The system supports multi-PO receiving where a single GRN can contain items from multiple POs.

**Business Justification**: Ensures traceability between GRN line items and originating POs. Prevents orphaned records and maintains procurement audit trail. Multi-PO support enables consolidated receiving from single vendor deliveries.

**Validation Logic**:
1. For each line item with purchaseOrderId:
   - Verify PO exists in system
   - Verify PO is in approved status
   - Verify PO belongs to same vendor as GRN header
2. Line items without purchaseOrderId are valid (manual items mixed with PO items)
3. Header-level purchaseOrderId is deprecated; validation focuses on line items
4. Reject if any referenced PO is invalid or not found

**When Validated**: On GRN creation, on PO reference change

**Implementation Requirements**:
- **Client-Side**: Validate PO reference on selection. Show PO details for verification.
- **Server-Side**: Query PO table to verify existence and status.
- **Database**: Foreign key constraint to purchase_orders table (allows NULL for manual GRNs).

**Error Code**: VAL-GRN-107
**Error Message**: "Invalid Purchase Order reference. PO {poNumber} does not exist or is not approved."
**User Action**: User must select a valid, approved purchase order.

**Related Business Requirements**: BR-GRN-011

---

### VAL-GRN-108: PO Quantity Limit

**Rule Description**: For PO-based GRNs, total received quantity across all GRNs for a PO line item cannot exceed the PO ordered quantity.

**Business Justification**: Prevents over-receiving beyond what was ordered. Ensures purchase order integrity and budget compliance.

**Validation Logic**:
1. For each line item linked to PO item, retrieve PO ordered quantity
2. Sum all previously received quantities for this PO item (from other GRNs)
3. Add current GRN received quantity
4. Verify: total received <= PO ordered quantity
5. Reject if limit exceeded

**When Validated**: On line item save for PO-based GRN

**Implementation Requirements**:
- **Client-Side**: Display PO quantity and previously received quantity. Show warning if approaching limit.
- **Server-Side**: Query all GRNs for PO item, calculate total received, verify limit.
- **Database**: Not enforced (requires aggregation query).

**Error Code**: VAL-GRN-108
**Error Message**: "Receiving quantity ({quantity}) would exceed PO ordered quantity. Ordered: {ordered}, Previously Received: {previouslyReceived}, Limit: {limit}"
**User Action**: User must reduce quantity or contact purchasing to amend PO.

**Related Business Requirements**: BR-GRN-012

---

### VAL-GRN-109: Multi-Currency Exchange Rate Required

**Rule Description**: If GRN uses a foreign currency (not base currency USD), an exchange rate must be provided.

**Business Justification**: Ensures accurate conversion to base currency for financial reporting and inventory valuation.

**Validation Logic**:
1. Check GRN total value currency
2. If currency != USD (base currency), verify exchangeRate field is provided
3. Verify exchange rate > 0
4. Reject if exchange rate missing for foreign currency

**When Validated**: On GRN save when using foreign currency

**Implementation Requirements**:
- **Client-Side**: Auto-populate exchange rate from system when foreign currency selected. Allow manual override. Show red asterisk if foreign currency.
- **Server-Side**: Verify exchange rate provided if foreign currency.
- **Database**: CHECK constraint: (currency = 'USD') OR (exchange_rate IS NOT NULL AND exchange_rate > 0).

**Error Code**: VAL-GRN-109
**Error Message**: "Exchange rate is required for foreign currency {currency}"
**User Action**: User must enter or verify the exchange rate for the transaction date.

**Related Business Requirements**: BR-GRN-014

---

### VAL-GRN-110: Extra Cost Distribution Validation

**Rule Description**: If extra costs are added to GRN, the distribution method must be valid and total distributed amount must equal total extra costs.

**Business Justification**: Ensures extra costs are properly allocated to line items for accurate inventory costing.

**Validation Logic**:
1. If extra costs exist, verify distribution method is one of: NET_AMOUNT, QUANTITY, EQUAL
2. Calculate distributed cost for each line item based on method
3. Sum all distributed costs
4. Verify: sum = total extra costs amount
5. Allow difference of <= $0.01 for rounding

**When Validated**: On extra cost save, before GRN commitment

**Implementation Requirements**:
- **Client-Side**: Auto-calculate distribution preview. Show distributed cost per item. Highlight discrepancies.
- **Server-Side**: Verify distribution calculation matches expected method.
- **Database**: Not enforced (calculation logic).

**Error Code**: VAL-GRN-110
**Error Message**: "Extra cost distribution error. Total distributed ({distributed}) does not match total extra costs ({total})"
**User Action**: System should auto-correct. If manual intervention needed, user must verify extra cost amounts.

**Related Business Requirements**: BR-GRN-013

---

### VAL-GRN-111: Cannot Void Without Reversal

**Rule Description**: A committed GRN can only be voided if reversal entries are created for stock movements and journal vouchers.

**Business Justification**: Maintains data integrity in inventory and financial systems. All transactions must be reversible with audit trail.

**Validation Logic**:
1. Verify GRN status = COMMITTED
2. Create reversal stock movements (negative quantities)
3. Create reversal journal voucher entries (reverse debits/credits)
4. Only then change status to VOID
5. Reject void if reversals cannot be created

**When Validated**: On void operation

**Implementation Requirements**:
- **Client-Side**: Show void confirmation dialog explaining reversal process.
- **Server-Side**: Transaction-based void operation: create reversals first, then update status.
- **Database**: Transaction ensures atomicity.

**Error Code**: VAL-GRN-111
**Error Message**: "Cannot void GRN. Reversal entries could not be created. Contact administrator."
**User Action**: User cannot proceed if system cannot create reversals. Contact support.

**Related Business Requirements**: BR-GRN-008

---

### VAL-GRN-110: Closed Accounting Period Validation

**Rule Description**: GRN cannot be committed if the receipt date falls within a closed accounting period. System must validate that the accounting period is open before allowing commitment.

**Business Justification**: Closed accounting periods are locked for financial reporting and auditing purposes. Allowing transactions in closed periods would compromise financial data integrity and violate audit requirements.

**Validation Logic**:
1. When user attempts to commit GRN, retrieve receipt date
2. Query accounting periods table to find period containing receipt date
3. Check if period status = CLOSED
4. If period is closed, reject commitment operation
5. If period is open or no period found, allow commitment

**When Validated**: Before GRN commitment operation (status change from RECEIVED to COMMITTED)

**Implementation Requirements**:
- **Client-Side**: Before commit action, query accounting period status. Show warning dialog if period is closed. Disable "Commit" button.
- **Server-Side**: Validate accounting period status before processing commit request. Query: `SELECT status FROM accounting_periods WHERE start_date <= receipt_date AND end_date >= receipt_date AND status = 'CLOSED'`
- **Database**: Not enforced (business logic only, requires date comparison).

**Error Code**: VAL-GRN-110
**Error Message**: "Cannot commit GRN. Receipt date {receiptDate} falls within closed accounting period {periodName} ({periodStart} to {periodEnd}). Please contact finance department to reopen the period or adjust the receipt date."
**User Action**: User must either:
- Contact finance department to reopen the accounting period
- Change receipt date to fall within an open period
- Wait until the period is reopened

**Related Business Requirements**: BR-GRN-016

**Examples**:

**Scenario 1: Valid Case**
- Situation: User attempts to commit GRN
- Receipt Date: 2025-01-30
- Accounting Period: Jan 2025 (2025-01-01 to 2025-01-31)
- Period Status: OPEN
- Result: ✅ Validation passes
- Reason: Period is open, commitment allowed

**Scenario 2: Invalid Case**
- Situation: User attempts to commit GRN
- Receipt Date: 2024-12-15
- Accounting Period: Dec 2024 (2024-12-01 to 2024-12-31)
- Period Status: CLOSED
- Result: ❌ Validation fails
- Reason: Cannot commit transactions in closed periods
- User must: Contact finance to reopen Dec 2024 period or correct receipt date

**Scenario 3: Valid Case**
- Situation: User attempts to commit GRN
- Receipt Date: 2025-01-15
- Accounting Period: None found (period not created yet)
- Result: ✅ Validation passes (Warning displayed)
- Reason: No period restrictions if period doesn't exist
- Note: System should warn user that accounting period should be set up

---

### VAL-GRN-111: Stock Take In Progress Validation

**Rule Description**: GRN cannot be committed for a location if a stock take (physical count) is currently in progress for that location. System must check for active stock take sessions before allowing commitment.

**Business Justification**: Stock take requires freezing inventory movements to ensure accurate physical count reconciliation. Allowing GRN commitments during stock take would invalidate the count and create discrepancies between physical and system inventory.

**Validation Logic**:
1. When user attempts to commit GRN, retrieve GRN location ID
2. Query stock take sessions table for active sessions at this location
3. Check if any session has status = IN_PROGRESS or STARTED
4. If active stock take found, reject commitment operation
5. If no active stock take, allow commitment

**When Validated**: Before GRN commitment operation (status change from RECEIVED to COMMITTED)

**Implementation Requirements**:
- **Client-Side**: Before commit action, query stock take sessions for location. Show warning dialog if stock take is active. Disable "Commit" button with explanation tooltip.
- **Server-Side**: Validate no active stock take sessions before processing commit. Query: `SELECT id, session_number FROM stock_take_sessions WHERE location_id = grn.location_id AND status IN ('STARTED', 'IN_PROGRESS')`
- **Database**: Not enforced (business logic only, requires cross-table validation).

**Error Code**: VAL-GRN-111
**Error Message**: "Cannot commit GRN. Stock take session {sessionNumber} is currently in progress for location {locationName}. Please wait until stock take is completed or contact warehouse supervisor."
**User Action**: User must either:
- Wait until stock take session is completed
- Contact warehouse supervisor to complete or pause the stock take
- Defer GRN commitment until after stock take reconciliation

**Related Business Requirements**: BR-GRN-017

**Examples**:

**Scenario 1: Valid Case**
- Situation: User attempts to commit GRN
- Location: Kitchen Storage
- Stock Take Sessions: None active
- Result: ✅ Validation passes
- Reason: No stock take in progress, commitment allowed

**Scenario 2: Invalid Case**
- Situation: User attempts to commit GRN
- Location: Main Warehouse
- Stock Take Session: ST-2501-0001
- Session Status: IN_PROGRESS
- Session Started: 2025-01-30 08:00
- Result: ❌ Validation fails
- Reason: Cannot commit GRN during active stock take
- User must: Wait until ST-2501-0001 is completed or contact supervisor

**Scenario 3: Valid Case**
- Situation: User attempts to commit GRN
- Location: Office Storage
- Stock Take Session: ST-2501-0002
- Session Status: COMPLETED
- Session Completed: 2025-01-28
- Result: ✅ Validation passes
- Reason: Stock take is completed, commitment allowed

**Scenario 4: Invalid Case - Multi-Location**
- Situation: User attempts to commit GRN with items for multiple storage locations
- Primary Location: Kitchen Storage (no stock take)
- Line Item 1 Location: Kitchen Storage (no stock take) ✅
- Line Item 2 Location: Main Warehouse (stock take IN_PROGRESS) ❌
- Result: ❌ Validation fails
- Reason: At least one item's location has active stock take
- User must: Wait for stock take completion at Main Warehouse

---

## 4. Cross-Field Validations (VAL-GRN-201 to 299)

### VAL-GRN-201: Invoice Date Cannot Be After Receipt Date

**Fields Involved**: `invoiceDate`, `receiptDate`

**Validation Rule**: If invoice date is provided, it must be on or before the receipt date.

**Business Justification**: Invoice is issued before or at delivery. Invoice date after receipt date indicates data entry error or backdating issue.

**Validation Logic**:
1. If invoiceDate is null, skip validation (optional field)
2. If invoiceDate is provided, compare with receiptDate
3. Verify: invoiceDate <= receiptDate
4. Reject if invoice date is after receipt date

**When Validated**: On invoice date change, on form submission

**Implementation Requirements**:
- **Client-Side**: Validate on invoice date change. Set max date for invoice picker to receipt date. Show error if invalid.
- **Server-Side**: Compare dates if both provided.
- **Database**: CHECK constraint: (invoice_date IS NULL) OR (invoice_date <= receipt_date).

**Error Code**: VAL-GRN-201
**Error Message**: "Invoice date cannot be after receipt date"
**User Action**: User must adjust invoice date to be on or before receipt date.

**Examples**:

**Valid Scenarios**:
- Receipt Date: 2025-01-30, Invoice Date: 2025-01-28 ✅
- Receipt Date: 2025-01-30, Invoice Date: 2025-01-30 ✅ (same day)
- Receipt Date: 2025-01-30, Invoice Date: null ✅ (optional)

**Invalid Scenarios**:
- Receipt Date: 2025-01-30, Invoice Date: 2025-02-01 ❌ (invoice after receipt)

---

### VAL-GRN-202: Manufacturing Date Before Expiry Date

**Fields Involved**: `manufacturingDate`, `expiryDate` (in line items)

**Validation Rule**: If both manufacturing and expiry dates are provided, manufacturing date must be before expiry date.

**Business Justification**: Manufacturing date logically precedes expiry date. Ensures date consistency for shelf-life tracking.

**Validation Logic**:
1. If both dates are null, skip validation (optional fields)
2. If both dates provided, verify: manufacturingDate < expiryDate
3. Reject if manufacturing date is on or after expiry date

**When Validated**: On date field changes for line items

**Implementation Requirements**:
- **Client-Side**: Validate on date changes. Show warning if invalid date relationship.
- **Server-Side**: Compare dates if both provided.
- **Database**: CHECK constraint: (manufacturing_date IS NULL) OR (expiry_date IS NULL) OR (manufacturing_date < expiry_date).

**Error Code**: VAL-GRN-202
**Error Message**: "Manufacturing date must be before expiry date"
**User Action**: User must verify and correct the dates.

**Examples**:

**Valid Scenarios**:
- Manufacturing: 2025-01-15, Expiry: 2026-01-15 ✅
- Manufacturing: null, Expiry: 2026-01-15 ✅
- Manufacturing: 2025-01-15, Expiry: null ✅

**Invalid Scenarios**:
- Manufacturing: 2025-01-15, Expiry: 2025-01-10 ❌
- Manufacturing: 2025-01-15, Expiry: 2025-01-15 ❌ (same day not allowed)

---

### VAL-GRN-203: Total Value Calculation Consistency

**Fields Involved**: Line item `totalValue`, GRN `totalValue`, line item quantities and prices

**Validation Rule**: GRN total value must equal the sum of all line item total values. Each line item total value must equal (receivedQuantity × unitPrice).

**Business Justification**: Ensures financial accuracy. Prevents data corruption and calculation errors.

**Validation Logic**:
1. For each line item: verify totalValue = receivedQuantity × unitPrice.amount
2. Sum all line item totalValue amounts
3. Verify: GRN totalValue.amount = sum of line totals
4. Allow difference of <= $0.01 for rounding

**When Validated**: On quantity or price change, before save, before submission

**Implementation Requirements**:
- **Client-Side**: Auto-calculate line totals and GRN total. Display as read-only fields. Recalculate on any change.
- **Server-Side**: Verify calculations before saving.
- **Database**: Trigger to recalculate on INSERT/UPDATE.

**Error Code**: VAL-GRN-203
**Error Message**: "Total value calculation error. Calculated: {calculated}, Provided: {provided}"
**User Action**: System should auto-correct. User should verify if manual intervention needed.

**Rounding Rules**:
- All amounts rounded to 2 decimal places
- Use banker's rounding (round half to even)
- Apply rounding at each calculation step

**Examples**:

**Valid Scenario**:
- Line 1: Qty 10 × $5.00 = $50.00
- Line 2: Qty 5 × $3.50 = $17.50
- GRN Total: $67.50 ✅

**Invalid Scenario**:
- Line 1: Qty 10 × $5.00 = $50.00
- Line 2: Qty 5 × $3.50 = $17.50
- Calculated Total: $67.50
- Provided GRN Total: $70.00 ❌
- Difference: $2.50 (exceeds $0.01 threshold)

---

### VAL-GRN-204: Total Quantity Consistency

**Fields Involved**: Line item `receivedQuantity`, GRN `totalQuantity`, GRN `totalItems`

**Validation Rule**: GRN total quantity must equal sum of all line item received quantities. GRN total items must equal count of line items.

**Business Justification**: Maintains data consistency between header and line items. Ensures accurate inventory counts.

**Validation Logic**:
1. Sum all line item receivedQuantity values
2. Verify: GRN totalQuantity = sum
3. Count line items
4. Verify: GRN totalItems = count

**When Validated**: On line item add/remove/change, before save

**Implementation Requirements**:
- **Client-Side**: Auto-calculate totals. Display as read-only. Update on any line item change.
- **Server-Side**: Verify calculations match.
- **Database**: Trigger to recalculate on line item changes.

**Error Code**: VAL-GRN-204
**Error Message**: "Total quantity mismatch. Calculated: {calculated}, Provided: {provided}"
**User Action**: System should auto-correct totals.

---

### VAL-GRN-205: PO Reference Fields Consistency (DEPRECATED)

**Fields Involved**: `purchaseOrderId`, `purchaseOrderNumber` (header-level - DEPRECATED)

**DEPRECATION NOTE**: Header-level PO reference fields are deprecated in favor of line-item level PO references to support multi-PO receiving. These validation rules are retained for backward compatibility only.

**Validation Rule**: If header-level PO fields are populated (legacy), both must be consistent. For new implementations, use line-item level `purchaseOrderId` and `purchaseOrderItemId` instead.

**Business Justification**: Maintains backward compatibility while supporting multi-PO receiving at line item level.

**Validation Logic**:
1. If header purchaseOrderId is provided (legacy):
   - Verify purchaseOrderNumber is also provided
   - Query PO table with both ID and number
   - Verify they reference the same PO
2. For multi-PO support, validate line-item level references (see VAL-GRN-105)

**When Validated**: On GRN save (legacy compatibility only)

**Implementation Requirements**:
- **Client-Side**: For new GRNs, populate PO references at line item level. Header fields optional for legacy support.
- **Server-Side**: Verify line-item PO references. Header fields validated only if present.
- **Database**: Foreign key constraints on line-item level `purchaseOrderId`.

**Error Code**: VAL-GRN-206
**Error Message**: "Purchase Order reference fields are inconsistent"
**User Action**: System should auto-populate. User should re-select PO if error occurs.

---

## 5. Security Validations (VAL-GRN-301 to 399)

### VAL-GRN-301: Permission Check - Create GRN

**Validation Rule**: User must have `create_grn` permission to create new GRN records.

**Checked Permissions**:
- `create_grn`: Can create new GRN records

**When Validated**: Before GRN creation operation

**Implementation Requirements**:
- **Client-Side**: Hide "New GRN" button if user doesn't have permission.
- **Server-Side**: Verify permission before processing create request.
- **Database**: Row Level Security (RLS) policies enforce permission checks.

**Error Code**: VAL-GRN-301
**Error Message**: "You do not have permission to create GRN records"
**User Action**: User must request `create_grn` permission from administrator.

---

### VAL-GRN-302: Permission Check - Edit GRN

**Validation Rule**: User must have `update_grn` permission to modify existing GRN records.

**Checked Permissions**:
- `update_grn`: Can modify GRN header and line items

**When Validated**: Before any GRN update operation

**Implementation Requirements**:
- **Client-Side**: Make fields read-only if user doesn't have permission. Hide edit buttons.
- **Server-Side**: Verify permission before processing update request.
- **Database**: RLS policies enforce permission checks.

**Error Code**: VAL-GRN-302
**Error Message**: "You do not have permission to edit GRN records"
**User Action**: User must request `update_grn` permission from administrator.

---

### VAL-GRN-303: Permission Check - Commit GRN

**Validation Rule**: User must have `commit_grn` permission to commit GRN to inventory.

**Checked Permissions**:
- `commit_grn`: Can commit GRN, triggering stock movements and journal entries

**When Validated**: Before commit operation

**Implementation Requirements**:
- **Client-Side**: Hide "Commit" button if user doesn't have permission.
- **Server-Side**: Verify permission before processing commit request.
- **Database**: RLS policies enforce permission checks.

**Error Code**: VAL-GRN-303
**Error Message**: "You do not have permission to commit GRN records"
**User Action**: User must request `commit_grn` permission from administrator.

---

### VAL-GRN-304: Permission Check - Void GRN

**Validation Rule**: User must have `void_grn` permission to void committed GRN records.

**Checked Permissions**:
- `void_grn`: Can void committed GRN, creating reversal entries

**When Validated**: Before void operation

**Implementation Requirements**:
- **Client-Side**: Hide "Void" button if user doesn't have permission.
- **Server-Side**: Verify permission before processing void request.
- **Database**: RLS policies enforce permission checks.

**Error Code**: VAL-GRN-304
**Error Message**: "You do not have permission to void GRN records"
**User Action**: User must request `void_grn` permission from administrator.

---

### VAL-GRN-305: Ownership Validation

**Validation Rule**: User can only edit or delete GRN records they created (where createdBy = userId), unless they have admin or manager permissions.

**Exceptions**:
- Managers can edit GRNs from their department
- Admins can edit all GRNs

**When Validated**: On edit or delete operations

**Implementation Requirements**:
- **Client-Side**: Disable edit/delete buttons if user is not creator and doesn't have override permission.
- **Server-Side**: Verify userId matches createdBy field or user has override permission.
- **Database**: RLS policies check ownership.

**Error Code**: VAL-GRN-305
**Error Message**: "You can only modify GRN records you created"
**User Action**: User cannot proceed unless they have manager or admin permissions.

---

### VAL-GRN-306: Location Access Validation

**Validation Rule**: User can only create GRN records for locations they have access to.

**Access Rules**:
- User must be assigned to location to create GRN for it
- Warehouse staff can access their assigned locations
- Department managers can access locations for their departments
- Admins can access all locations

**When Validated**: On GRN creation, when selecting location

**Implementation Requirements**:
- **Client-Side**: Location dropdown shows only accessible locations for the user.
- **Server-Side**: Verify user has access to selected location before saving.
- **Database**: RLS policies filter records based on user location access.

**Error Code**: VAL-GRN-306
**Error Message**: "You do not have access to the selected location"
**User Action**: User must select a location they have access to.

---

### VAL-GRN-307: Input Sanitization

**Validation Rule**: All text input must be sanitized to prevent security vulnerabilities.

**Security Checks**:
- Remove HTML tags and scripts (XSS prevention)
- Escape special characters in database queries (SQL injection prevention)
- Validate file uploads (attachments) for malicious content
- Check URLs for malicious redirects
- Limit input length to prevent buffer overflow

**When Validated**: On all user input, before storing or displaying data

**Implementation Requirements**:
- **Client-Side**: Basic sanitization for UX (remove obvious malicious content).
- **Server-Side**: Comprehensive sanitization before database operations. Use parameterized queries.
- **Database**: Use parameterized queries. Never concatenate user input into SQL.

**Error Code**: VAL-GRN-307
**Error Message**: "Input contains invalid or potentially harmful content"
**User Action**: User must remove problematic content and resubmit.

**Forbidden Content**:
- `<script>` tags
- `javascript:` URLs
- SQL keywords in unexpected contexts (e.g., in vendor name)
- Executable file extensions in attachments (.exe, .bat, .sh)
- Extremely long strings (> maximum field length)

---

## 6. Validation Error Messages

### Error Message Guidelines

**Principles**:
1. **Be Specific**: Tell user exactly what's wrong and which field has the issue
2. **Be Actionable**: Explain how to fix the problem or what to do next
3. **Be Kind**: Use friendly, helpful tone without blaming the user
4. **Be Consistent**: Use same format and tone throughout all messages
5. **Avoid Technical Jargon**: Use plain language that hospitality staff can understand

### Error Message Format

**Structure**:
```
[Field Name] {problem statement}. {Expected format or action}.
```

**Examples**:

✅ **Good Messages**:
- "Receipt date is required. Please select the date goods were received."
- "Received quantity cannot exceed delivered quantity. Delivered: 10, Received: 12."
- "GRN cannot be committed while in DRAFT status. Please change status to RECEIVED first."
- "Invoice date cannot be after receipt date. Please verify dates."

❌ **Bad Messages**:
- "Error" (too vague)
- "Invalid input" (not specific about what's invalid)
- "FK constraint violation on vendor_id" (too technical)
- "Your GRN is wrong" (unfriendly, not helpful)

### Error Severity Levels

| Level | When to Use | Display |
|-------|-------------|---------|
| Error | Blocks submission/progress | Red icon, red border, red text |
| Warning | Should be corrected but not blocking | Yellow icon, yellow border |
| Info | Helpful guidance | Blue icon, normal border |

### Error Message Examples by Type

**Required Field**:
- Message: "{Field name} is required"
- Context: "This field is required to proceed"
- Example: "Vendor is required. Please select a vendor from the list."

**Format Error**:
- Message: "{Field name} must be in format: {expected format}"
- Example: "Invoice number can only contain letters, numbers, and hyphens (e.g., INV-2501-0001)"

**Range Error**:
- Message: "{Field name} must be between {min} and {max}"
- Example: "Received quantity must be between 0 and {deliveredQuantity}"

**Business Rule Violation**:
- Message: "{Clear explanation of why action is not allowed}"
- Example: "Cannot edit committed GRN. To reverse this transaction, use the Void function."

**Cross-Field Validation**:
- Message: "{Relationship that failed}. {Values involved}"
- Example: "Invoice date cannot be after receipt date. Invoice: 2025-02-01, Receipt: 2025-01-30"

**Permission Error**:
- Message: "You do not have permission to {action}. Contact your administrator."
- Example: "You do not have permission to commit GRN records. Contact your administrator."

---

## 7. Test Scenarios

### Test Coverage Requirements

All validation rules must have test cases covering:
1. **Positive Tests**: Valid input that should pass validation
2. **Negative Tests**: Invalid input that should fail validation
3. **Boundary Tests**: Edge cases at limits of acceptable values
4. **Integration Tests**: Validation working across all layers (client, server, database)

### Test Scenario Template

**Test ID**: VAL-GRN-T{###}

**Test Description**: {What is being tested}

**Test Type**: Positive | Negative | Boundary | Integration

**Preconditions**: {What must be true before test}

**Test Steps**:
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Input Data**: {What data is provided}

**Expected Result**: {What should happen}

**Validation Layer**: Client | Server | Database | All

**Pass/Fail Criteria**: {How to determine if test passed}

---

### Example Test Scenarios

#### Positive Test Example

**Test ID**: VAL-GRN-T001

**Test Description**: Create PO-based GRN with valid data

**Test Type**: Positive

**Preconditions**:
- User is authenticated with `create_grn` permission
- Valid approved PO exists (PO-2501-0001)
- User has access to Kitchen Receiving location
- User has access to vendor Professional Kitchen Supplies

**Test Steps**:
1. Navigate to GRN creation page
2. Select process type: "From Purchase Order"
3. Select PO: PO-2501-0001
4. Verify auto-populated fields (vendor, PO number, items)
5. Enter receipt date: 2025-01-30
6. Enter invoice number: INV-2025-KIT-001
7. Enter invoice date: 2025-01-28
8. For each line item:
   - Delivered quantity: 10
   - Received quantity: 10
9. Click "Save as RECEIVED"

**Input Data**:
- Process Type: PO-based
- PO Number: PO-2501-0001
- Receipt Date: 2025-01-30
- Vendor: Professional Kitchen Supplies
- Invoice Number: INV-2025-KIT-001
- Invoice Date: 2025-01-28
- Location: Kitchen Receiving
- Item 1: Commercial Blender, Delivered: 10, Received: 10

**Expected Result**: ✅ GRN created successfully with status "RECEIVED"

**Validation Layer**: All

**Pass/Fail Criteria**:
- No validation errors displayed
- GRN saved to database with correct data
- GRN Number auto-generated (GRN-2501-XXXXX)
- All totals calculated correctly
- Success message shown
- User redirected to GRN detail page

---

#### Negative Test Example

**Test ID**: VAL-GRN-T101

**Test Description**: Create GRN with received quantity exceeding delivered quantity

**Test Type**: Negative

**Preconditions**: User is on GRN creation page

**Test Steps**:
1. Select process type: "Manual"
2. Enter all required header fields
3. Add line item:
   - Item: Commercial Blender
   - Delivered quantity: 10
   - Received quantity: 15 (exceeds delivered)
4. Click "Save"

**Input Data**:
- Delivered Quantity: 10
- Received Quantity: 15

**Expected Result**: ❌ Validation error displayed

**Validation Layer**: Client and Server

**Pass/Fail Criteria**:
- Error message shown: "Received quantity (15) cannot exceed delivered quantity (10)"
- Received quantity field highlighted in red
- GRN not saved to database
- User remains on form to correct error

---

#### Boundary Test Example

**Test ID**: VAL-GRN-T201

**Test Description**: Create GRN with receipt date exactly equal to today

**Test Type**: Boundary

**Preconditions**: User is on GRN creation page

**Test Steps**:
1. Get today's date from system
2. Enter receipt date exactly equal to today
3. Fill other required fields with valid data
4. Click "Save"

**Input Data**:
- Receipt Date: 2025-01-30 (today)
- Other fields: Valid data

**Expected Result**: ✅ GRN created successfully (today is acceptable boundary)

**Validation Layer**: All

**Pass/Fail Criteria**:
- No validation errors
- GRN saved successfully
- Success message shown

---

#### Integration Test Example

**Test ID**: VAL-GRN-T301

**Test Description**: Complete GRN workflow from creation to commitment

**Test Type**: Integration

**Preconditions**:
- User has all required permissions (create, update, commit)
- Valid approved PO exists

**Test Steps**:
1. Create GRN from PO (DRAFT status)
2. Enter all required data and save as RECEIVED
3. Assign storage locations to all items
4. Commit GRN to inventory
5. Verify stock movements created
6. Verify journal vouchers created

**Input Data**: Complete GRN data with all required fields

**Expected Result**: ✅ Full workflow completes successfully

**Validation Layer**: All (Client, Server, Database)

**Pass/Fail Criteria**:
- GRN status transitions: DRAFT → RECEIVED → COMMITTED
- All validations pass at each stage
- Stock movements created with correct quantities
- Journal vouchers created with correct amounts
- Inventory updated correctly
- Audit trail complete

---

## 8. Validation Matrix

| Error Code | Rule Name | Fields Involved | Type | Client | Server | Database |
|------------|-----------|-----------------|------|--------|--------|----------|
| VAL-GRN-001 | GRN Number Required | grnNumber | Field | ✅ | ✅ | ✅ |
| VAL-GRN-002 | Receipt Date Required | receiptDate | Field | ✅ | ✅ | ✅ |
| VAL-GRN-003 | No Future Receipt Date | receiptDate | Field | ✅ | ✅ | ✅ |
| VAL-GRN-004 | Vendor Required | vendorId, vendorName | Field | ✅ | ✅ | ✅ |
| VAL-GRN-005 | Valid Status Enum | status | Field | ✅ | ✅ | ✅ |
| VAL-GRN-006 | Received By Required | receivedBy | Field | ✅ | ✅ | ✅ |
| VAL-GRN-007 | Location Required | locationId | Field | ✅ | ✅ | ✅ |
| VAL-GRN-008 | Positive Total Items | totalItems | Field | ✅ | ✅ | ✅ |
| VAL-GRN-009 | Positive Total Quantity | totalQuantity | Field | ✅ | ✅ | ✅ |
| VAL-GRN-010 | Positive Total Value | totalValue | Field | ✅ | ✅ | ✅ |
| VAL-GRN-011 | Invoice Number Format | invoiceNumber | Field | ✅ | ✅ | ❌ |
| VAL-GRN-012 | Item Code Required | itemCode | Field | ✅ | ✅ | ✅ |
| VAL-GRN-013 | Delivered Qty Required | deliveredQuantity | Field | ✅ | ✅ | ✅ |
| VAL-GRN-014 | Received Qty Required | receivedQuantity | Field | ✅ | ✅ | ✅ |
| VAL-GRN-015 | Unit Price Required | unitPrice | Field | ✅ | ✅ | ✅ |
| VAL-GRN-016 | Storage Location Required | storageLocationId | Field | ✅ | ✅ | ✅ |
| VAL-GRN-017 | Decimal Precision | quantities | Field | ✅ | ✅ | ✅ |
| VAL-GRN-101 | Cannot Commit Draft | status | Business | ✅ | ✅ | ❌ |
| VAL-GRN-102 | Cannot Edit Committed | status | Business | ✅ | ✅ | ❌ |
| VAL-GRN-103 | Received <= Delivered | received, delivered | Business | ✅ | ✅ | ✅ |
| VAL-GRN-104 | Quantity Reconciliation | received, rejected, damaged, delivered | Business | ✅ | ✅ | ✅ |
| VAL-GRN-105 | Valid PO Reference | purchaseOrderId | Business | ✅ | ✅ | ✅ |
| VAL-GRN-106 | PO Quantity Limit | receivedQuantity | Business | ⚠️ | ✅ | ❌ |
| VAL-GRN-107 | Exchange Rate Required | currency, exchangeRate | Business | ✅ | ✅ | ✅ |
| VAL-GRN-108 | Extra Cost Distribution | extraCosts | Business | ✅ | ✅ | ❌ |
| VAL-GRN-109 | Void With Reversal | status | Business | ✅ | ✅ | ❌ |
| VAL-GRN-110 | Closed Period Validation | receiptDate, accountingPeriod | Business | ✅ | ✅ | ❌ |
| VAL-GRN-111 | Stock Take In Progress | locationId, stockTakeSession | Business | ✅ | ✅ | ❌ |
| VAL-GRN-201 | Invoice Date <= Receipt Date | invoiceDate, receiptDate | Cross-field | ✅ | ✅ | ✅ |
| VAL-GRN-202 | Manufacturing < Expiry | manufacturingDate, expiryDate | Cross-field | ✅ | ✅ | ✅ |
| VAL-GRN-203 | Total Value Calculation | line totals, GRN total | Cross-field | ✅ | ✅ | ✅ |
| VAL-GRN-204 | Total Quantity Consistency | line quantities, GRN totals | Cross-field | ✅ | ✅ | ✅ |
| VAL-GRN-205 | PO Fields Consistency | PO ID, PO number | Cross-field | ✅ | ✅ | ✅ |
| VAL-GRN-301 | Create Permission | - | Security | ✅ | ✅ | ✅ |
| VAL-GRN-302 | Edit Permission | - | Security | ✅ | ✅ | ✅ |
| VAL-GRN-303 | Commit Permission | - | Security | ✅ | ✅ | ✅ |
| VAL-GRN-304 | Void Permission | - | Security | ✅ | ✅ | ✅ |
| VAL-GRN-305 | Ownership Check | createdBy | Security | ✅ | ✅ | ✅ |
| VAL-GRN-306 | Location Access | locationId | Security | ✅ | ✅ | ✅ |
| VAL-GRN-307 | Input Sanitization | all text fields | Security | ⚠️ | ✅ | ✅ |

Legend:
- ✅ Enforced at this layer
- ❌ Not enforced at this layer
- ⚠️ Partial enforcement (e.g., display only, basic sanitization)

---

## 9. Related Documents

- **Business Requirements**: [BR-goods-received-note.md](./BR-goods-received-note.md)
- **Use Cases**: [UC-goods-received-note.md](./UC-goods-received-note.md)
- **Technical Specification**: [TS-goods-received-note.md](./TS-goods-received-note.md)
- **Data Definition**: [DD-goods-received-note.md](./DD-goods-received-note.md)
- **Flow Diagrams**: [FD-goods-received-note.md](./FD-goods-received-note.md)

---

**Document Control**:
- **Created**: 2025-11-01
- **Author**: Documentation System
- **Reviewed By**: Business Analyst, QA Lead, Security Team
- **Approved By**: Technical Lead, Product Owner
- **Next Review**: 2025-04-01

---

## Appendix: Error Code Registry

| Code Range | Category | Description |
|------------|----------|-------------|
| VAL-GRN-001 to 099 | Field Validations | Individual field rules (required, format, range, type) |
| VAL-GRN-101 to 199 | Business Rules | Business logic validations (status transitions, calculations) |
| VAL-GRN-201 to 299 | Cross-Field | Multi-field relationships and dependencies |
| VAL-GRN-301 to 399 | Security | Permission and access control validations |
| VAL-GRN-901 to 999 | System | System-level errors (reserved for future use) |

---

**Implementation Notes**:
- All validation rules extracted from actual GRN source code
- No fictional features added
- All examples based on hospitality industry context (kitchen equipment, office furniture)
- Validation rules aligned with GRN type definitions in `lib/types/procurement.ts`
- Business rules derived from BR-goods-received-note.md
- Security validations based on role-based access control patterns in codebase
- Test scenarios use realistic hospitality data (Commercial Blender, Chef's Knives, Office Chair)
