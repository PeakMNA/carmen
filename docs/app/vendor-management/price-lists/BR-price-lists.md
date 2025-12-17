# Price Lists - Business Requirements (BR)

## Document Information
- **Document Type**: Business Requirements Document
- **Module**: Vendor Management > Price Lists
- **Version**: 2.0.0
- **Last Updated**: 2025-11-26
- **Document Status**: Updated

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-11-26 | System | Complete rewrite to match actual code implementation; Removed fictional features (RFQ integration, contract pricing, complex approval workflows, price alerts, bulk operations, analytics dashboard, archival); Updated to reflect implemented price list functionality |
| 1.1.0 | 2025-11-18 | Documentation Team | Previous version with aspirational features |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---

## 1. Executive Summary

### 1.1 Purpose
The Price Lists module provides a centralized system for managing vendor-submitted pricing information. It enables procurement staff to view, create, and manage price lists from vendors with MOQ (Minimum Order Quantity) pricing tiers.

### 1.2 Scope
**In Scope**:
- Price list viewing and management
- Price list creation with line items
- MOQ-based pricing tiers
- Status management (draft, active, pending, expired)
- Price list duplication
- Export functionality
- Search and filtering

**Out of Scope**:
- RFQ Integration (not implemented)
- Contract pricing (not implemented)
- Complex approval workflows (not implemented)
- Price alerts and notifications (not implemented)
- Bulk import operations (not implemented)
- Multi-vendor price comparison (not implemented)
- Price history tracking (not implemented)
- Analytics dashboard (not implemented)
- Archival system (not implemented)
- Vendor portal submission (separate module)

### 1.3 Business Value
- **Centralized Pricing**: Single source for vendor price information
- **Procurement Support**: Easy lookup of vendor pricing for purchase decisions
- **Price Visibility**: Clear view of current and expired price lists

---

## 2. Functional Requirements

### FR-PL-001: Price List Management
**Priority**: Critical
**Description**: System shall provide a list view for managing all vendor price lists.

**Requirements**:
- Display all price lists in table or card view
- Toggle between table view and card view
- Show key information: name, vendor, status, validity period, item count
- Support pagination for large lists
- Row click navigates to detail page

**Business Rules**:
- Default view displays all price lists
- Both table and card views show same information
- Card view shows 3 columns on desktop

**Acceptance Criteria**:
- Price list page loads successfully
- View toggle works between table and card
- Price lists display with correct information
- Navigation to detail page works

---

### FR-PL-002: Price List Search and Filtering
**Priority**: High
**Description**: System shall provide search and filter capabilities for price lists.

**Requirements**:
- Search by price list name
- Filter by status (all, active, expired, pending, draft)
- Filter by vendor
- Real-time filtering as user types

**Business Rules**:
- Search is case-insensitive
- Filters combine (AND logic)
- Empty search shows all results

**Acceptance Criteria**:
- Search filters results by name
- Status filter shows only matching price lists
- Vendor filter shows only matching price lists
- Filters work in combination

---

### FR-PL-003: Price List Status Management
**Priority**: High
**Description**: System shall manage price list lifecycle with defined statuses.

**Requirements**:
- Support statuses:
  - **draft**: Initial creation, not finalized
  - **pending**: Awaiting review or activation
  - **active**: Current and in use
  - **expired**: Past effective end date
- Status badges with color coding:
  - Active: Green (bg-green-100 text-green-800)
  - Expired: Red (bg-red-100 text-red-800)
  - Pending: Yellow (bg-yellow-100 text-yellow-800)
  - Draft: Gray (bg-gray-100 text-gray-800)

**Business Rules**:
- Status determines availability for procurement
- Only active price lists should be used for purchasing

**Acceptance Criteria**:
- Status badges display with correct colors
- Status filtering works correctly

---

### FR-PL-004: Price List Actions
**Priority**: High
**Description**: System shall support various actions on price lists.

**Requirements**:
- **View**: Navigate to price list detail page
- **Edit**: Modify price list (navigates to edit view)
- **Duplicate**: Create copy of price list
- **Export**: Download price list data
- **Mark as Expired**: Update status to expired
- **Delete**: Remove price list (with confirmation)

**Business Rules**:
- Delete requires user confirmation via dialog
- Duplicate copies all data to new price list
- Export triggers download of price list data

**Acceptance Criteria**:
- All actions available from dropdown menu
- View action navigates to detail page
- Duplicate creates copy with same data
- Delete shows confirmation dialog
- Mark as Expired updates status

---

### FR-PL-005: Price List Creation
**Priority**: High
**Description**: System shall allow users to create new price lists with line items.

**Requirements**:
- Enter basic information:
  - Price list number (auto-generated or manual)
  - Vendor selection
  - Currency selection
  - Valid from date
  - Valid to date
  - Submission notes
- Add line items with:
  - Product selection
  - MOQ (Minimum Order Quantity)
  - Unit of measure
  - Unit price
  - Lead time (days)
  - Notes

**Business Rules**:
- Valid to date must be after valid from date
- At least one line item recommended
- Currency applies to all items in price list

**Acceptance Criteria**:
- Create form displays all required fields
- Vendor selection dropdown works
- Line items can be added and removed
- Form validates required fields
- Price list created successfully

---

### FR-PL-006: Price List Detail View
**Priority**: High
**Description**: System shall display comprehensive price list details.

**Requirements**:
- Display header information:
  - Price list name/code
  - Vendor name
  - Status badge
  - Effective dates
  - Currency
  - Total items count
  - Created by
  - Approved by (if applicable)
  - Notes
- Display line items in table:
  - Item code
  - Item name
  - Description
  - Unit
  - Unit price
  - MOQ
  - Lead time
  - Price change indicator (if applicable)
- Show MOQ pricing tiers with different prices

**Business Rules**:
- Price change shows percentage difference from previous
- Items display with all pricing tiers

**Acceptance Criteria**:
- Detail page loads with all information
- Line items display in table format
- MOQ pricing tiers visible
- Price change percentages calculated correctly

---

### FR-PL-007: Price List Duplication
**Priority**: Medium
**Description**: System shall support duplicating existing price lists.

**Requirements**:
- Copy all price list data to new entry
- Store copied data in sessionStorage for add page
- Navigate to add page with pre-filled data
- Allow modifications before saving

**Business Rules**:
- Duplicate inherits all items and pricing
- User must save to create the duplicate

**Acceptance Criteria**:
- Duplicate action copies data correctly
- Add page loads with copied data
- User can modify before saving

---

### FR-PL-008: Export Functionality
**Priority**: Medium
**Description**: System shall support exporting price list data.

**Requirements**:
- Export button available on list page
- Download price list data

**Acceptance Criteria**:
- Export button triggers download
- Downloaded file contains price list data

---

## 3. Data Model

### 3.1 VendorPriceList Entity

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| vendorId | string | Associated vendor ID |
| priceListName | string | Display name of price list |
| priceListCode | string | Reference code (e.g., PL-2401-0001) |
| description | string | Description of price list |
| currency | string | Currency name |
| currencyCode | string | Currency code (e.g., USD) |
| effectiveStartDate | Date | Start of validity period |
| effectiveEndDate | Date | End of validity period |
| status | string | draft, pending, active, expired |
| version | string | Version number |
| volumeDiscounts | array | Volume discount rules |
| totalItems | number | Count of line items |
| createdBy | string | Creator email/ID |
| approvedBy | string | Approver email/ID (optional) |
| approvedAt | Date | Approval timestamp (optional) |
| notes | string | Additional notes |

### 3.2 VendorPriceListItem Entity

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| priceListId | string | Parent price list ID |
| itemCode | string | Product/item code |
| itemName | string | Product/item name |
| productIdentifier | string | Combined code and name |
| description | string | Item description |
| unit | string | Unit of measure |
| unitPrice | object | Price with amount and currency |
| minimumOrderQuantity | number | MOQ for this price |
| leadTimeDays | number | Lead time in days |
| itemDiscounts | array | Item-level discounts |
| notes | string | Item notes |
| isActive | boolean | Active status |
| isFoc | boolean | Free of charge flag |
| isPreferredVendor | boolean | Preferred vendor flag |

### 3.3 Item Discount Structure

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| minQuantity | number | Minimum quantity for discount |
| discountType | string | 'percentage' or 'fixed_amount' |
| discountValue | number | Discount value |
| description | string | Discount description |

---

## 4. Business Rules

### BR-PL-001: Status Values
**Rule**: Price lists use four status values: draft, pending, active, expired.

**Enforcement**: System validates status transitions.

### BR-PL-002: Date Validation
**Rule**: Effective end date must be after effective start date.

**Enforcement**: Form validation prevents invalid date ranges.

### BR-PL-003: Currency Consistency
**Rule**: All items in a price list share the same currency.

**Enforcement**: Currency set at price list level, inherited by items.

### BR-PL-004: MOQ Pricing
**Rule**: Items can have multiple pricing tiers based on MOQ.

**Enforcement**: Each tier specifies MOQ and corresponding price.

---

## 5. User Interface Specifications

### 5.1 Price List Page
**Route**: `/vendor-management/pricelists`

**Layout**:
- Card container with header and content
- Header: Title, subtitle, Export button, Add New button
- Filters: Search input, status dropdown, vendor dropdown, view toggle
- Content: Table or Card view based on toggle

**Table Columns**:
- Name (clickable link)
- Vendor
- Status (badge)
- Validity Period
- Items count
- Actions (dropdown menu)

**Card Layout**:
- Price list name and status badge
- Vendor name
- Validity period
- Item count
- Action buttons

### 5.2 Price List Detail Page
**Route**: `/vendor-management/pricelists/[id]`

**Layout**:
- Back navigation
- Header with name, vendor, status badge
- Info grid: Validity, Currency, Items, Created by, Approved by, Notes
- Items table with pricing tiers

### 5.3 Add Price List Page
**Route**: `/vendor-management/pricelists/add`

**Layout**:
- Form card with header
- Basic info section: Number, Vendor, Currency, Dates, Notes
- Items section: Table with add/remove functionality
- Action buttons: Cancel, Save

---

## 6. User Roles and Permissions

### 6.1 Procurement Staff
**Permissions**:
- View all price lists
- Create new price lists
- Edit price lists
- Duplicate price lists
- Export price lists
- Mark as expired
- Delete price lists

### 6.2 Procurement Manager
**Permissions**:
- All Procurement Staff permissions
- Approve price lists

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Price list page loads within 2 seconds
- Search filters apply in real-time
- Detail page renders within 2 seconds

### 7.2 Usability
- Responsive design for different screen sizes
- Intuitive search and filtering
- Clear status indicators
- Accessible color coding for status badges

### 7.3 Security
- Role-based access control
- Secure data handling

---

## 8. Integration Points

### 8.1 Internal Integrations
- **Vendor Directory**: Retrieve vendor list for selection
- **Product Catalog**: Product selection for line items
- **Mock Data**: Uses centralized mock data from lib/mock-data

---

## 9. Related Documents
- [DD-price-lists.md](./DD-price-lists.md) - Data Definition
- [FD-price-lists.md](./FD-price-lists.md) - Flow Diagrams
- [TS-price-lists.md](./TS-price-lists.md) - Technical Specification
- [UC-price-lists.md](./UC-price-lists.md) - Use Cases
- [VAL-price-lists.md](./VAL-price-lists.md) - Validations

---

**End of Business Requirements Document**
