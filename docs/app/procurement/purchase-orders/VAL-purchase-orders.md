# Validations: Purchase Orders

## Document Information
- **Module**: Procurement
- **Sub-Module**: Purchase Orders
- **Document Type**: Validations (VAL)
- **Version**: 2.4.0
- **Last Updated**: 2025-12-19
- **Status**: Approved

## Related Documents
- [Business Requirements](./BR-purchase-orders.md)
- [Use Cases](./UC-purchase-orders.md)
- [Technical Specification](./TS-purchase-orders.md)
- [Data Definition](./DS-purchase-orders.md)
- [Flow Diagrams](./FD-purchase-orders.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.4.0 | 2025-12-19 | System Analyst | Updated VAL-PO-101 PR selection validations to reflect simplified table (PR#, Date, Description), vendor + currency grouping (removed delivery date), and PO Summary dialog workflow |
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.3.0 | 2025-12-02 | System Analyst | Added VAL-PO-016: QR Code Generation and Format validations for mobile receiving integration |
| 2.2.0 | 2025-12-01 | System | Added PO Item Details Dialog validations (VAL-PO-013 through VAL-PO-015) for inventory status indicators, source PR references, and financial calculations |
| 2.1.0 | 2025-12-01 | System | Added Comments & Attachments sidebar feature documentation; Updated page layout validations to include collapsible right sidebar |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Overview

This document defines all validation requirements for the Purchase Orders sub-module in descriptive text format. Validations are organized into categories and numbered for reference.

**Validation Categories**:
- **001-099**: Field-Level Validations
- **101-199**: Business Rule Validations
- **201-299**: Cross-Field Validations
- **301-399**: Security and Access Validations
- **401-499**: Integration Validations

**Validation Format**: Each validation includes:
- Field name and database column
- Validation rule description
- Rationale
- Implementation requirements (Client, Server, Database layers)
- Error codes and messages
- Test cases

---

## Field-Level Validations (001-099)

### VAL-PO-001: PO Number Auto-Generation

**Field**: `po_number`
**Database Column**: `purchase_orders.po_number`
**Data Type**: VARCHAR(50) / string

**Validation Rule**: PO number must follow the format PO-YYMM-NNNN where YY is 2-digit year and MM is month and NNNNNN is a 6-digit sequential number (e.g., PO-2401-000123).

**Rationale**: Provides unique, traceable identification for all purchase orders with year-based organization.

**Implementation Requirements**:
- **Client-Side**: Display field as read-only (auto-generated). Show format example as placeholder.
- **Server-Side**: Auto-generate PO number using database function. Verify uniqueness before saving. Use atomic sequence increment.
- **Database**: UNIQUE constraint on po_number column. Function `get_next_po_sequence(year)` generates sequential numbers per fiscal year.

**Error Code**: VAL-PO-001
**Error Message**: "Invalid PO number format. Must be PO-YYMM-NNNN"
**User Action**: System auto-generates - no user action required. Error only if database function fails.

**Test Cases**:
- ✅ Valid: PO-2401-000001
- ✅ Valid: PO-2512-999999
- ❌ Invalid: PO-24-0001 (missing month)
- ❌ Invalid: PO-2401-001 (sequence must be 6 digits)
- ❌ Invalid: 2401-000001 (missing PO prefix)

---

### VAL-PO-002: Vendor Selection Required

**Field**: `vendor_id`
**Database Column**: `purchase_orders.vendor_id`
**Data Type**: UUID / string

**Validation Rule**: A valid vendor must be selected for every purchase order.

**Rationale**: Purchase orders cannot be created without knowing who will supply the goods/services.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to Vendor field label. Show error immediately on blur if empty. Disable submit button until vendor selected.
- **Server-Side**: Reject request if vendor_id is missing or null. Verify vendor exists in database and is active.
- **Database**: Column defined as NOT NULL with FOREIGN KEY constraint to vendors table.

**Error Code**: VAL-PO-002
**Error Message**: "Vendor is required. Please select a vendor from the list"
**User Action**: User must select a vendor from the dropdown or search and select.

**Test Cases**:
- ✅ Valid: vendor_id = "uuid-of-existing-active-vendor"
- ❌ Invalid: vendor_id = null
- ❌ Invalid: vendor_id = "" (empty string)
- ❌ Invalid: vendor_id = "non-existent-uuid"

---

### VAL-PO-003: Order Date Validity

**Field**: `order_date`
**Database Column**: `purchase_orders.order_date`
**Data Type**: DATE / Date

**Validation Rule**: Order date must be a valid date and cannot be more than 7 days in the past or more than 30 days in the future.

**Rationale**: Prevents backdating or far-future dating of purchase orders which could cause accounting issues.

**Implementation Requirements**:
- **Client-Side**: Display date picker with valid range. Default to today's date. Show error if date outside allowed range.
- **Server-Side**: Validate date is within allowed range (-7 days to +30 days from today). Reject if outside range.
- **Database**: Column defined as NOT NULL. CHECK constraint ensures date is reasonable.

**Error Code**: VAL-PO-003
**Error Message**: "Order date must be within the last 7 days or next 30 days"
**User Action**: User must select a date within the allowed range.

**Test Cases**:
- ✅ Valid: Today's date
- ✅ Valid: 5 days ago
- ✅ Valid: 20 days from now
- ❌ Invalid: 10 days ago
- ❌ Invalid: 45 days from now
- ❌ Invalid: null or empty

---

### VAL-PO-004: Expected Delivery Date Required and Future

**Field**: `expected_delivery_date`
**Database Column**: `purchase_orders.expected_delivery_date`
**Data Type**: DATE / Date

**Validation Rule**: Expected delivery date is required and must be equal to or after the order date. Must be within 1 year from order date.

**Rationale**: Delivery cannot happen before order is placed, and deliveries beyond 1 year are unusual and require special handling.

**Implementation Requirements**:
- **Client-Side**: Display date picker with minimum date set to order_date. Show error if before order date. Calculate and suggest reasonable delivery date based on vendor lead time.
- **Server-Side**: Verify expected_delivery_date >= order_date AND expected_delivery_date <= order_date + 365 days.
- **Database**: CHECK constraint ensures expected_delivery_date >= order_date.

**Error Code**: VAL-PO-004
**Error Message**: "Expected delivery date must be on or after order date and within 1 year"
**User Action**: User must select a delivery date that is after or equal to the order date.

**Test Cases**:
- ✅ Valid: order_date = 2024-01-01, expected_delivery_date = 2024-01-15
- ✅ Valid: Same as order date (same-day delivery)
- ✅ Valid: 6 months from order date
- ❌ Invalid: expected_delivery_date < order_date
- ❌ Invalid: expected_delivery_date > order_date + 1 year
- ❌ Invalid: null or empty

---

### VAL-PO-005: Delivery Location Required

**Field**: `delivery_location_id`
**Database Column**: `purchase_orders.delivery_location_id`
**Data Type**: UUID / string

**Validation Rule**: A valid delivery location must be specified for every purchase order.

**Rationale**: Need to know where to deliver goods for receiving and inventory purposes.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field. Show dropdown of active locations. If converting from PR, pre-fill with PR delivery location.
- **Server-Side**: Verify location_id is not null and references active location in database.
- **Database**: Column defined as NOT NULL with FOREIGN KEY constraint to locations table.

**Error Code**: VAL-PO-005
**Error Message**: "Delivery location is required"
**User Action**: User must select a delivery location from the dropdown.

**Test Cases**:
- ✅ Valid: delivery_location_id = "uuid-of-active-location"
- ❌ Invalid: delivery_location_id = null
- ❌ Invalid: delivery_location_id = "non-existent-uuid"
- ❌ Invalid: delivery_location_id = "inactive-location-uuid"

---

### VAL-PO-006: Payment Terms Required

**Field**: `payment_terms`
**Database Column**: `purchase_orders.payment_terms`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: Payment terms must be specified and cannot be empty. Common terms include "Net 30", "Net 60", "2/10 Net 30", "COD", "Prepaid".

**Rationale**: Clear payment terms prevent disputes and ensure proper accounts payable processing.

**Implementation Requirements**:
- **Client-Side**: Pre-fill with vendor's default payment terms. Allow user to modify. Provide dropdown of common terms. Show error if left empty.
- **Server-Side**: Verify payment_terms is not null or empty string. Trim whitespace.
- **Database**: Column defined as NOT NULL with minimum length of 1 character.

**Error Code**: VAL-PO-006
**Error Message**: "Payment terms are required"
**User Action**: User must enter or select payment terms.

**Test Cases**:
- ✅ Valid: "Net 30"
- ✅ Valid: "2/10 Net 30"
- ✅ Valid: "Net 60"
- ✅ Valid: "COD"
- ❌ Invalid: null
- ❌ Invalid: "" (empty string)
- ❌ Invalid: "   " (whitespace only)

---

### VAL-PO-007: Delivery Terms Required

**Field**: `delivery_terms`
**Database Column**: `purchase_orders.delivery_terms`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: Delivery terms must be specified. Common terms include "FOB Origin", "FOB Destination", "CIF", "Ex Works", "Delivered".

**Rationale**: Delivery terms define when title transfers and who pays shipping, critical for liability and accounting.

**Implementation Requirements**:
- **Client-Side**: Pre-fill with vendor's default delivery terms. Provide dropdown of standard Incoterms. Show error if empty.
- **Server-Side**: Verify delivery_terms is not null or empty. Trim whitespace.
- **Database**: Column defined as NOT NULL.

**Error Code**: VAL-PO-007
**Error Message**: "Delivery terms are required"
**User Action**: User must enter or select delivery terms.

**Test Cases**:
- ✅ Valid: "FOB Origin"
- ✅ Valid: "FOB Destination"
- ✅ Valid: "CIF"
- ❌ Invalid: null
- ❌ Invalid: "" (empty string)

---

### VAL-PO-008: Subtotal Non-Negative

**Field**: `subtotal`
**Database Column**: `purchase_orders.subtotal`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: Subtotal must be greater than or equal to zero and equal to the sum of all line item totals.

**Rationale**: Subtotal represents the sum of line items before discounts and cannot be negative.

**Implementation Requirements**:
- **Client-Side**: Display as read-only calculated field. Auto-calculate when line items change. Format as currency with 2 decimal places.
- **Server-Side**: Calculate from line items: SUM(quantity * unit_price). Verify calculated value matches submitted value. Reject if negative.
- **Database**: CHECK constraint ensures subtotal >= 0. Trigger recalculates when line items change.

**Error Code**: VAL-PO-008
**Error Message**: "Subtotal cannot be negative and must equal sum of line items"
**User Action**: System auto-calculates - user cannot modify directly.

**Test Cases**:
- ✅ Valid: 0.00 (zero-value PO allowed for samples)
- ✅ Valid: 1250.75
- ✅ Valid: 999999.99
- ❌ Invalid: -100.00 (negative)
- ❌ Invalid: Manually entered value that doesn't match line items

---

### VAL-PO-009: Discount Amount or Percentage (Not Both)

**Fields**: `discount_amount`, `discount_percentage`
**Database Columns**: `purchase_orders.discount_amount`, `purchase_orders.discount_percentage`
**Data Types**: DECIMAL(15,2) and DECIMAL(5,2)

**Validation Rule**: Either discount amount OR discount percentage can be specified, but not both. If discount percentage is used, it must be between 0 and 100.

**Rationale**: Prevents confusion about which discount applies.

**Implementation Requirements**:
- **Client-Side**: Provide toggle between "Dollar Amount" and "Percentage". Disable one field when other is entered. Show preview of calculated discount.
- **Server-Side**: Verify only one discount method is used. If percentage, verify 0 <= discount_percentage <= 100. Calculate and verify discount amount is not greater than subtotal.
- **Database**: CHECK constraint ensures not (discount_amount > 0 AND discount_percentage > 0).

**Error Code**: VAL-PO-009
**Error Message**: "Specify either discount amount OR percentage, not both"
**User Action**: User must choose one discount method and clear the other.

**Test Cases**:
- ✅ Valid: discount_amount = 50.00, discount_percentage = null
- ✅ Valid: discount_amount = 0, discount_percentage = 10.0
- ✅ Valid: Both null (no discount)
- ❌ Invalid: discount_amount = 50.00, discount_percentage = 10.0 (both specified)
- ❌ Invalid: discount_percentage = 150 (exceeds 100%)
- ❌ Invalid: discount_amount > subtotal

---

### VAL-PO-010: Grand Total Calculation Accuracy

**Field**: `grand_total`
**Database Column**: `purchase_orders.grand_total`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: Grand total must equal (subtotal - discount_amount + tax_amount + shipping_amount) with maximum 2 decimal places.

**Rationale**: Accurate totals prevent financial discrepancies and payment issues.

**Implementation Requirements**:
- **Client-Side**: Display as read-only calculated field. Auto-update when any component changes. Show calculation breakdown tooltip.
- **Server-Side**: Calculate grand_total = subtotal - discount + tax + shipping. Verify calculation matches submitted value within 1 cent tolerance (for rounding).
- **Database**: Calculated column or trigger maintains accuracy. CHECK constraint ensures grand_total >= 0.

**Error Code**: VAL-PO-010
**Error Message**: "Grand total calculation error. Please refresh and try again"
**User Action**: System auto-calculates - if error persists, contact support.

**Test Cases**:
- ✅ Valid: subtotal=1000, discount=100, tax=72, shipping=25, grand_total=997
- ✅ Valid: All components=0, grand_total=0
- ❌ Invalid: grand_total != calculated value
- ❌ Invalid: grand_total < 0

---

### VAL-PO-011: Line Items Required

**Field**: Line Items Collection
**Database Table**: `purchase_order_line_items`

**Validation Rule**: At least one line item must exist on every purchase order. Each line item must have description, quantity, unit price, and unit of measure.

**Rationale**: Cannot create a purchase order without specifying what is being purchased.

**Implementation Requirements**:
- **Client-Side**: Prevent form submission if line items table is empty. Show error message above line items section. Require at least one row.
- **Server-Side**: Verify at least one line item in request. Validate each line item has required fields.
- **Database**: Foreign key relationship allows multiple line items per PO. Application logic enforces minimum of 1.

**Error Code**: VAL-PO-011
**Error Message**: "At least one line item is required"
**User Action**: User must add at least one line item with all required fields.

**Test Cases**:
- ✅ Valid: 1 line item with all required fields
- ✅ Valid: Multiple line items
- ❌ Invalid: Empty line items array
- ❌ Invalid: Line items with missing required fields

---

### VAL-PO-012: Line Item Quantity Positive

**Field**: Line Item `quantity`
**Database Column**: `purchase_order_line_items.quantity`
**Data Type**: DECIMAL(15,3) / number

**Validation Rule**: Quantity must be greater than zero with maximum 3 decimal places for fractional units.

**Rationale**: Cannot order zero or negative quantities.

**Implementation Requirements**:
- **Client-Side**: Number input with min=0.001, max=999999, step=0.001. Show error immediately if zero or negative.
- **Server-Side**: Verify quantity > 0 for all line items. Reject if any item has invalid quantity.
- **Database**: CHECK constraint ensures quantity > 0.

**Error Code**: VAL-PO-012
**Error Message**: "Quantity must be greater than zero"
**User Action**: User must enter a positive quantity value.

**Test Cases**:
- ✅ Valid: 1
- ✅ Valid: 10.5
- ✅ Valid: 0.001
- ❌ Invalid: 0
- ❌ Invalid: -5
- ❌ Invalid: null

---

### VAL-PO-013: Item Details Inventory Status Calculations

**Field**: Inventory Status Indicators (On Hand, On Order, Received)
**Display Location**: Item Details Dialog

**Validation Rule**: Inventory status totals must be calculated from actual inventory data and displayed in inventory units (not order units).

**Rationale**: Provides accurate real-time inventory visibility for the specific item across all locations.

**Implementation Requirements**:
- **Client-Side**: Display calculated totals from inventory data. Show loading state while fetching. Handle empty data gracefully (show 0).
- **Server-Side**: Query inventory tables for On Hand, pending PO items for On Order, and GRN items for Received. Return totals with inventory unit.
- **Database**: Aggregate queries from inventory_items, purchase_order_line_items, and grn_line_items tables.

**Calculation Logic**:
- **On Hand**: SUM(inventory_items.quantity_on_hand) WHERE item_code matches
- **On Order**: SUM(po_line_items.pending_quantity) WHERE status = 'pending' AND item_code matches
- **Received**: SUM(grn_line_items.received_quantity) WHERE item_code matches

**Error Code**: VAL-PO-013
**Error Message**: "Unable to calculate inventory status. Please refresh and try again"
**User Action**: System auto-calculates - user can retry if error occurs.

**Test Cases**:
- ✅ Valid: On Hand = 350 (sum of all locations)
- ✅ Valid: On Order = 0 (no pending orders)
- ✅ Valid: Received = 8 (total from all GRNs)
- ❌ Invalid: Negative quantities displayed
- ❌ Invalid: Order units displayed instead of inventory units

---

### VAL-PO-014: Source Purchase Request Reference

**Field**: `source_request_id`, `source_request_item_id`
**Database Columns**: `purchase_order_line_items.source_request_id`, `purchase_order_line_items.source_request_item_id`

**Validation Rule**: If source request ID is provided, it must reference a valid, existing purchase request. The link should navigate to the source PR when clicked.

**Rationale**: Maintains traceability from PO line items back to originating purchase requests for audit purposes.

**Implementation Requirements**:
- **Client-Side**: Display source PR as clickable link. Verify PR exists before navigation. Show "N/A" if no source PR.
- **Server-Side**: Validate source_request_id format (PR-YYMM-NNNN). Verify PR exists in database when saving.
- **Database**: Optional fields (NULL allowed). If provided, should match existing PR records.

**Error Code**: VAL-PO-014
**Error Message**: "Invalid source purchase request reference"
**User Action**: System auto-populates from PR conversion. Manual entry should follow PR-YYMM-NNNN format.

**Test Cases**:
- ✅ Valid: source_request_id = "PR-2401-0045" (existing PR)
- ✅ Valid: source_request_id = null (manual PO, no source)
- ❌ Invalid: source_request_id = "PR-999" (non-existent)
- ❌ Invalid: source_request_id = "PO-2401-001" (wrong document type)

---

### VAL-PO-015: Line Item Financial Calculations

**Field**: Line Item Financial Summary (Subtotal, Discount, Tax, Line Total)
**Display Location**: Item Details Dialog - Order Summary Section

**Validation Rule**: Financial calculations must be accurate and consistent with the formula: Line Total = (Ordered Quantity × Unit Price) - Discount Amount + Tax Amount.

**Rationale**: Ensures accurate financial display and prevents discrepancies between displayed and stored values.

**Implementation Requirements**:
- **Client-Side**: Calculate and display: Subtotal = quantity × unit_price, Tax = subtotal × tax_rate, Line Total = subtotal - discount_amount + tax_amount. Use stored line_total if available, fallback to calculation.
- **Server-Side**: Validate line_total matches calculation within 1 cent tolerance.
- **Database**: line_total, tax_amount stored as DECIMAL(15,2).

**Error Code**: VAL-PO-015
**Error Message**: "Financial calculation error in line item"
**User Action**: System auto-calculates - if discrepancy exists, system should recalculate.

**Test Cases**:
- ✅ Valid: qty=20, price=25.00, discount=0, tax_rate=0.07 → subtotal=500.00, tax=35.00, total=535.00
- ✅ Valid: qty=5, price=8.50, discount=2.50, tax_rate=0.10 → subtotal=42.50, tax=4.00, total=44.00
- ❌ Invalid: displayed total doesn't match calculation
- ❌ Invalid: tax_amount > subtotal

---

### VAL-PO-016: QR Code Generation and Format

**Field**: QR Code (qr_code, qr_code_image, qr_code_generated_at)
**Database Columns**: `purchase_orders.qr_code`, `purchase_orders.qr_code_image`, `purchase_orders.qr_code_generated_at`
**Component**: QRCodeSection.tsx

**Validation Rule**: QR code must be automatically generated when PO is created or updated, following the exact format `PO:{orderNumber}` (e.g., "PO:PO-2501-0001"). The QR code image must be a valid base64-encoded data URL that can be displayed and downloaded.

**Rationale**: Ensures consistent QR code format for reliable mobile scanning, enables quick GRN creation via mobile app, maintains data integrity between QR code value and PO number.

**Implementation Requirements**:
- **Client-Side**:
  * Auto-generate QR code on component mount using `generatePOQRCode()` utility
  * Display 200×200px QR code with 2-module margin
  * Validate QR code format matches `PO:{orderNumber}` pattern
  * Handle generation errors with user-friendly message
  * Download generates 400×400px PNG with 4-module margin
  * Show loading state during generation (<200ms target)
  * Cache generated QR code in component state
  * Validate clipboard copy success/failure

- **Server-Side**:
  * Validate qr_code format exactly matches `PO:{orderNumber}` pattern
  * Verify qr_code_image is valid base64 data URL starting with `data:image/png;base64,`
  * Auto-set qr_code_generated_at timestamp when generated
  * Regenerate QR code if PO number changes
  * Validate QR generation doesn't timeout (5 second max)
  * Log QR generation failures for monitoring

- **Database**:
  * qr_code: VARCHAR(100), nullable, format constraint: `^PO:[A-Z0-9-]+$`
  * qr_code_image: TEXT, nullable, stores base64 data URL
  * qr_code_generated_at: TIMESTAMP, nullable, auto-set on generation

**QR Code Specifications**:
- Format: Exactly `PO:{orderNumber}` with no spaces or variations
- Error Correction Level: Medium (M) - 15% data restoration
- Display Size: 200×200px (2-module margin)
- Download Size: 400×400px (4-module margin)
- Encoding: UTF-8
- Image Format: PNG (base64-encoded data URL)
- Library: qrcode v1.5.3 (npm package)

**Error Code**: VAL-PO-016
**Error Messages**:
- "Unable to generate QR code. Please refresh the page." (generation failure)
- "Invalid QR code format. Expected format: PO:{orderNumber}" (format validation)
- "QR code generation timeout. Please try again." (timeout exceeded)
- "Failed to download QR code. Please try again." (download failure)
- "Clipboard not supported. Please copy manually: {orderNumber}" (clipboard unsupported)

**User Actions**:
- If generation fails: Refresh page or contact support
- If format invalid: System auto-regenerates with correct format
- If download fails: Retry download or take screenshot
- If copy fails: Manually copy displayed PO number

**Test Cases**:
- ✅ Valid: PO number "PO-2501-0001" → QR value "PO:PO-2501-0001"
- ✅ Valid: Generated QR code scans correctly with mobile app
- ✅ Valid: Download creates PNG file named "PO-2501-0001-QR.png"
- ✅ Valid: QR code image is valid base64 data URL
- ✅ Valid: Copy to clipboard copies exact PO number
- ✅ Valid: QR generation completes within 200ms
- ✅ Valid: High-res download QR (400×400px) is scannable when printed
- ❌ Invalid: QR code format "PO-2501-0001" (missing prefix "PO:")
- ❌ Invalid: QR code format "PO: PO-2501-0001" (contains space)
- ❌ Invalid: Empty qr_code field when PO number exists
- ❌ Invalid: qr_code_image not a valid base64 data URL
- ❌ Invalid: Generation timeout exceeds 5 seconds

**Mobile Integration Validation**:
- Mobile app must successfully scan QR code
- Extracted PO number must exactly match database PO number
- Scanned QR triggers automatic GRN creation workflow
- Invalid QR codes must be rejected with clear error message
- See GRN BR document (FR-GRN-016) for mobile validation requirements

**Performance Requirements**:
- QR generation: <200ms per PO (target), <500ms (maximum)
- Download preparation: <100ms
- Clipboard copy: <50ms
- Component load: <300ms including QR generation
- Success rate: >99.5% for generation, >99% for download, >95% for copy

---

## Business Rule Validations (101-199)

### VAL-PO-101: Vendor Must Be Active

**Field**: `vendor_id`
**Database Column**: `purchase_orders.vendor_id`

**Validation Rule**: Selected vendor must have status "Active" in the vendor master data.

**Rationale**: Cannot create purchase orders for inactive, suspended, or deleted vendors.

**Implementation Requirements**:
- **Client-Side**: Filter vendor dropdown to show only active vendors. Display vendor status badge when viewing PO.
- **Server-Side**: Query vendors table to verify status = 'Active'. Reject if vendor is not active.
- **Database**: Foreign key to vendors table. Application enforces status check.

**Error Code**: VAL-PO-101
**Error Message**: "Cannot create PO: Vendor status is {status}. Only active vendors allowed"
**User Action**: User must select a different active vendor or contact vendor management to activate vendor.

**Test Cases**:
- ✅ Valid: Vendor with status = 'Active'
- ❌ Invalid: Vendor with status = 'Inactive'
- ❌ Invalid: Vendor with status = 'Suspended'
- ❌ Invalid: Vendor with status = 'Deleted'

---

### VAL-PO-102: Vendor Approved for Product Categories

**Field**: Vendor-Product Category Relationship

**Validation Rule**: Selected vendor must be approved to supply the product categories of items on the purchase order.

**Rationale**: Ensures vendors are qualified and approved to supply specific types of products.

**Implementation Requirements**:
- **Client-Side**: Show warning badge if vendor is not preferred for selected products. Display approved categories for vendor.
- **Server-Side**: Query vendor_product_categories to verify vendor is approved for all product categories in line items. Allow override with justification.
- **Database**: Many-to-many relationship between vendors and product_categories.

**Error Code**: VAL-PO-102
**Error Message**: "Vendor is not approved for the following product categories: {categories}"
**User Action**: User must either select approved vendor, remove unapproved items, or provide justification for override.

**Test Cases**:
- ✅ Valid: Vendor approved for all product categories on PO
- ✅ Valid: Override with justification provided
- ❌ Invalid: Vendor not approved for one or more categories without justification
- ❌ Invalid: Vendor explicitly restricted from categories

---

### VAL-PO-103: Budget Availability Check

**Field**: Budget Allocations and Grand Total

**Validation Rule**: Total budget available across all allocated budget accounts must be greater than or equal to the purchase order grand total.

**Rationale**: Cannot commit to purchases without available budget.

**Implementation Requirements**:
- **Client-Side**: Display real-time budget availability as user enters amounts. Show green/yellow/red indicators. Calculate required vs. available.
- **Server-Side**: Query budget_accounts for available balance. Calculate: available = total_budget - encumbered - expended. Verify SUM(available) >= grand_total across all allocations.
- **Database**: Integration with budget management system for real-time checks.

**Error Code**: VAL-PO-103
**Error Message**: "Insufficient budget. Required: ${grand_total}, Available: ${available}"
**User Action**: User must reduce PO amount, reallocate to different budget accounts, or request budget increase.

**Test Cases**:
- ✅ Valid: available_budget >= grand_total
- ✅ Valid: Split across multiple accounts with sufficient total
- ❌ Invalid: available_budget < grand_total
- ❌ Invalid: One account has insufficient funds in split allocation

---

### VAL-PO-104: Budget Allocation Totals 100%

**Field**: Budget Allocations Collection

**Validation Rule**: The sum of all budget allocation percentages must equal exactly 100% (allowing for 0.01% floating point tolerance).

**Rationale**: All costs must be fully allocated to budget accounts for proper accounting.

**Implementation Requirements**:
- **Client-Side**: Display running total of allocation percentages. Show error if != 100%. Auto-calculate remaining percentage. Highlight allocation section in red until totals 100%.
- **Server-Side**: Sum allocation percentages. Verify 99.99% <= total <= 100.01%. Reject if outside tolerance.
- **Database**: Validation in application layer before saving allocations.

**Error Code**: VAL-PO-104
**Error Message**: "Budget allocations must total 100% (currently {total}%)"
**User Action**: User must adjust allocation percentages to total exactly 100%.

**Test Cases**:
- ✅ Valid: Single allocation at 100%
- ✅ Valid: Two allocations: 60% + 40%
- ✅ Valid: Three allocations: 50% + 30% + 20%
- ❌ Invalid: Single allocation at 90%
- ❌ Invalid: Two allocations: 50% + 40% (only 90%)
- ❌ Invalid: Two allocations: 60% + 50% (110%)

---

### VAL-PO-107: Status Workflow Transitions

**Field**: PO Status

**Validation Rule**: Purchase order status must follow valid workflow transitions. Invalid transitions are blocked.

**Valid Transitions**:
- Draft → Sent, Cancelled, Deleted
- Sent → Acknowledged, Partially Received, Cancelled (with vendor notice), On Hold
- Acknowledged → Partially Received, Fully Received, On Hold
- Partially Received → Fully Received, Completed, On Hold
- Fully Received → Completed
- On Hold → (return to previous status before hold)

**Rationale**: Prevents invalid state changes that could bypass controls or cause data inconsistencies. POs are sent directly to vendors by authorized purchasing staff without approval workflow.

**Implementation Requirements**:
- **Client-Side**: Show only valid action buttons based on current status. Disable invalid actions with tooltip explaining why. Verify user has send_purchase_orders permission before showing Send button.
- **Server-Side**: Validate status transition is in allowed list before updating. Verify user authorization for state changes. Create budget encumbrance when transitioning Draft → Sent. Reject invalid transitions with clear error.
- **Database**: Trigger validates transitions. History table logs all status changes with user and timestamp.

**Error Code**: VAL-PO-107
**Error Message**: "Invalid status transition from {current_status} to {new_status}"
**User Action**: User must follow proper workflow. Cannot skip required steps.

**Test Cases**:
- ✅ Valid: Draft → Sent (authorized user)
- ✅ Valid: Sent → Acknowledged
- ✅ Valid: Acknowledged → Fully Received
- ❌ Invalid: Draft → Acknowledged (must be sent first)
- ❌ Invalid: Completed → Draft (cannot reopen completed PO)
- ❌ Invalid: Cancelled → any status (cancelled is terminal)

---

## Cross-Field Validations (201-299)

### VAL-PO-201: Line Item Line Numbers Sequential

**Fields**: Line Item Collection

**Validation Rule**: Line item line numbers must be sequential starting from 1 with no gaps or duplicates.

**Rationale**: Maintains clear reference for each item and prevents confusion.

**Implementation Requirements**:
- **Client-Side**: Auto-assign line numbers sequentially. Renumber when items added/removed. Display line numbers in first column.
- **Server-Side**: Verify line numbers are sequential 1, 2, 3, etc. with no gaps. Renumber if necessary before saving.
- **Database**: UNIQUE constraint on (purchase_order_id, line_number).

**Error Code**: VAL-PO-201
**Error Message**: "Line numbers must be sequential starting from 1"
**User Action**: System auto-corrects - no user action needed.

**Test Cases**:
- ✅ Valid: [1, 2, 3]
- ✅ Valid: [1] (single item)
- ❌ Invalid: [1, 3, 4] (gap at 2)
- ❌ Invalid: [0, 1, 2] (doesn't start at 1)
- ❌ Invalid: [1, 1, 2] (duplicate)

---

### VAL-PO-202: Line Item Expected Delivery Not Before PO Delivery

**Fields**: PO `expected_delivery_date` and Line Item `expected_delivery_date`

**Validation Rule**: If line item has specific expected delivery date, it cannot be before the PO-level expected delivery date.

**Rationale**: Individual items cannot arrive before the overall order expected delivery.

**Implementation Requirements**:
- **Client-Side**: Set line item delivery date picker minimum to PO expected delivery date. Show warning if user tries earlier date.
- **Server-Side**: For each line item with expected_delivery_date, verify >= PO.expected_delivery_date.
- **Database**: CHECK constraint or trigger validates this relationship.

**Error Code**: VAL-PO-202
**Error Message**: "Line item delivery date cannot be before PO delivery date"
**User Action**: User must adjust either PO delivery date or line item delivery date.

**Test Cases**:
- ✅ Valid: PO delivery=2024-02-01, line item delivery=2024-02-05
- ✅ Valid: PO delivery=2024-02-01, line item delivery=null (defaults to PO date)
- ✅ Valid: Same date for both
- ❌ Invalid: PO delivery=2024-02-01, line item delivery=2024-01-25

---

### VAL-PO-203: Cannot Modify Sent PO Without Change Order

**Fields**: All PO fields when status is 'Sent' or later

**Validation Rule**: Once a purchase order is sent to vendor, it cannot be directly modified. Changes must go through change order process.

**Rationale**: Maintains audit trail, vendor communication, and requires proper authorization for changes to committed purchases. POs sent to vendors represent contractual commitments that require formal change procedures.

**Implementation Requirements**:
- **Client-Side**: Disable all edit fields when status is Sent or later. Show "Request Change Order" button instead of "Edit". Display warning about vendor notification for changes.
- **Server-Side**: Reject direct update requests to sent POs. Require change_order flag and reason. Create revision record. Notify vendor of changes if applicable.
- **Database**: Triggers prevent updates to sent POs unless through change order workflow. Maintain revision history.

**Error Code**: VAL-PO-203
**Error Message**: "Cannot modify sent PO. Use 'Request Change Order' to make changes"
**User Action**: User must use Change Order process to request modifications. System will notify vendor if PO was already sent.

**Test Cases**:
- ✅ Valid: Edit Draft status PO directly
- ✅ Valid: Change order for Sent PO with >10% change requires manager authorization
- ✅ Valid: Change order for Sent PO with <10% change applies immediately
- ❌ Invalid: Direct edit to Sent PO
- ❌ Invalid: Direct edit to Acknowledged PO

---

### VAL-PO-204: Cannot Cancel if Items Already Received

**Fields**: PO Status and GRN Records

**Validation Rule**: Purchase order cannot be cancelled if any items have been received (GRN records exist).

**Rationale**: Cannot cancel orders that are already fulfilled. Must use return process instead.

**Implementation Requirements**:
- **Client-Side**: Disable "Cancel" button if GRNs exist. Show message "Items received - use Return process".
- **Server-Side**: Query for GRN records linked to PO. Reject cancellation if any exist. Suggest return process.
- **Database**: Foreign key relationship between GRNs and POs allows query.

**Error Code**: VAL-PO-204
**Error Message**: "Cannot cancel PO: Items already received. Use return process for received items"
**User Action**: User must use Return/Credit process or contact receiving team.

**Test Cases**:
- ✅ Valid: Cancel PO with no GRNs
- ✅ Valid: Cancel PO in Draft status
- ❌ Invalid: Cancel PO with partial GRN
- ❌ Invalid: Cancel PO with full GRN

---

## Security and Access Validations (301-399)

### VAL-PO-301: User Has Permission to Create PO

**Field**: User Permissions

**Validation Rule**: User must have 'create_purchase_orders' permission to create new purchase orders.

**Rationale**: Restricts PO creation to authorized purchasing staff.

**Implementation Requirements**:
- **Client-Side**: Hide "Create PO" button if user lacks permission. Show message "Contact purchasing department".
- **Server-Side**: Verify user has required permission before allowing PO creation. Check against user.permissions array.
- **Database**: Permissions stored in user_roles and role_permissions tables.

**Error Code**: VAL-PO-301
**Error Message**: "You do not have permission to create purchase orders"
**User Action**: User must request permission from system administrator or use purchase request process.

**Test Cases**:
- ✅ Valid: User with 'create_purchase_orders' permission
- ❌ Invalid: User without permission
- ❌ Invalid: Inactive user account

---

### VAL-PO-302: User Can Only View Authorized POs

**Field**: User Department and PO Department

**Validation Rule**: Users can only view purchase orders for their own department unless they have admin or cross-department permissions.

**Rationale**: Protects confidential pricing and vendor information.

**Implementation Requirements**:
- **Client-Side**: Filter PO list to show only authorized POs. Display access denied message for unauthorized access attempts.
- **Server-Side**: Check user's department against PO's requesting department. Allow if match OR user has 'view_all_purchase_orders' permission.
- **Database**: Query includes WHERE clause filtering by department or permission.

**Error Code**: VAL-PO-302
**Error Message**: "Access denied: You can only view purchase orders for your department"
**User Action**: User must request access from manager or use proper channels.

**Test Cases**:
- ✅ Valid: User views PO from own department
- ✅ Valid: Admin views any PO
- ❌ Invalid: User tries to view PO from different department
- ❌ Invalid: Non-purchasing staff views detailed PO

---

## Integration Validations (401-499)

### VAL-PO-401: Budget System Availability Check

**Field**: Budget Integration

**Validation Rule**: Budget system must be available and responding to validate budget availability before PO is sent to vendor.

**Rationale**: Cannot send POs to vendors without confirming budget availability, as sending creates budget encumbrance.

**Implementation Requirements**:
- **Client-Side**: Show loading indicator during budget check. Display system availability status. Disable "Send to Vendor" button while checking.
- **Server-Side**: Attempt connection to budget API with 5-second timeout during send operation. If unavailable, prevent sending and save as Draft OR allow override with special permission (e.g., finance manager override).
- **Database**: Log integration attempts and failures. Maintain audit trail of override authorizations.

**Error Code**: VAL-PO-401
**Error Message**: "Budget system temporarily unavailable. Cannot send PO at this time. PO saved as Draft. Please try again later or contact finance team"
**User Action**: User can wait for system to become available or contact finance team for manual budget validation and override approval.

**Test Cases**:
- ✅ Valid: Budget system responds within timeout, PO sent successfully
- ⚠️ Warning: Budget system slow but responds, PO sent with warning
- ❌ Invalid: Budget system timeout with no override permission, PO remains Draft
- ✅ Valid: Budget system timeout with finance manager override, PO sent with flag

---

### VAL-PO-402: Purchase Request Status Update on Conversion

**Field**: PR Status Integration

**Validation Rule**: When PO is created from PR, the source PR status must be updated to "Converted to PO" and PR line items linked to PO line items.

**Rationale**: Prevents duplicate ordering and maintains traceability.

**Implementation Requirements**:
- **Client-Side**: Show source PR reference on PO. Display PR-PO linkage clearly.
- **Server-Side**: Update PR status atomically with PO creation. Create line item linkages. If update fails, rollback PO creation.
- **Database**: Transaction ensures both PR and PO updates succeed or both fail.

**Error Code**: VAL-PO-402
**Error Message**: "Failed to update source purchase request. PO creation rolled back"
**User Action**: User should retry. If problem persists, contact support.

**Test Cases**:
- ✅ Valid: PO created and PR status updated to "Converted"
- ❌ Invalid: PO created but PR status not updated (transaction should rollback)
- ❌ Invalid: PR already converted (duplicate PO attempt)

---

## Summary

This document defines **41 validation rules** across five categories:
- **Field-Level (001-099)**: 15 validations for individual field requirements (including Item Details Dialog validations VAL-PO-013 through VAL-PO-015)
- **Business Rules (101-199)**: 5 validations for business logic
- **Cross-Field (201-299)**: 4 validations for field relationships
- **Security (301-399)**: 2 validations for access control
- **Integration (401-499)**: 2 validations for external systems

**Key Changes in v2.0.0**: Removed approval workflow validations (VAL-PO-105, VAL-PO-106) as Purchase Orders are sent directly to vendors by authorized purchasing staff without multi-stage approval workflows. Updated status transition validations (VAL-PO-107) and modification restrictions (VAL-PO-203) to reflect Draft → Sent workflow.

All validations are implemented across three layers:
- **Client-Side**: Immediate user feedback and prevention
- **Server-Side**: Authoritative validation and security
- **Database**: Data integrity constraints

These validations ensure purchase order data quality, compliance with business rules, and proper integration with related systems.

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-10-30 | System | Initial creation from template |
| 2.0.0 | 2025-10-31 | System | Removed approval workflow validations (VAL-PO-105, VAL-PO-106), updated VAL-PO-107, VAL-PO-203, VAL-PO-401 to reflect Draft → Sent workflow |
| 2.1.0 | 2025-12-01 | System | Added Comments & Attachments sidebar feature documentation |
