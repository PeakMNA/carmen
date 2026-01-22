# Price Lists - Use Cases (UC)

## Document Information
- **Document Type**: Use Cases Document
- **Module**: Vendor Management > Price Lists
- **Version**: 3.0.0
- **Last Updated**: 2026-01-15
- **Document Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2026-01-15 | Documentation Team | Synced with current code; Added UC-PL-009 Staff Creation Wizard use case; Updated UC-PL-002 with dual creation methods; Added creation method options (template, manual, import); Updated status transitions |
| 2.0.0 | 2025-11-26 | System | Complete rewrite to match BR v2.0.0 and actual code; Removed fictional use cases (bulk import wizard, price comparison, price alerts, approval workflows, vendor portal submission, RFQ integration); Updated to reflect implemented functionality |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

**Note**: This document describes use cases as implemented in the actual code. Features marked as "not implemented" in BR v2.0.0 are excluded.

---

## 1. Introduction

This document provides detailed use case descriptions for the Price Lists module. Each use case includes preconditions, main flows, alternate flows, exception flows, postconditions, business rules, and UI requirements.

The Price Lists module enables procurement staff to view, create, and manage vendor price lists with MOQ-based pricing tiers.

---

## 2. Use Case Index

| Use Case ID | Use Case Name | Actor(s) | Priority |
|-------------|---------------|----------|----------|
| UC-PL-001 | View Price Lists | Procurement Staff, Purchasing Manager | High |
| UC-PL-002 | Create Price List (Simple Form) | Procurement Staff, Purchasing Manager | High |
| UC-PL-003 | View Price List Detail | Procurement Staff, Purchasing Manager | High |
| UC-PL-004 | Edit Price List | Procurement Staff, Purchasing Manager | Medium |
| UC-PL-005 | Duplicate Price List | Procurement Staff, Purchasing Manager | Medium |
| UC-PL-006 | Export Price List | Procurement Staff, Purchasing Manager | Medium |
| UC-PL-007 | Delete Price List | Procurement Staff, Purchasing Manager | Medium |
| UC-PL-008 | Mark Price List as Expired | Procurement Staff, Purchasing Manager | Medium |
| UC-PL-009 | Create Price List (Staff Wizard) | Procurement Staff, Purchasing Manager | High |

---

## 3. Detailed Use Cases

### UC-PL-001: View Price Lists

**Primary Actor**: Procurement Staff, Purchasing Manager

**Stakeholders and Interests**:
- Procurement Staff: Needs to find and review vendor pricing information
- Purchasing Manager: Needs oversight of all vendor price lists
- Finance Team: May need to review pricing for budget planning

**Preconditions**:
- User is authenticated with valid session
- User has access to Vendor Management module

**Trigger**: User navigates to Price Lists page

---

#### Main Flow

**Step 1: Access Price Lists Page**
1. User clicks "Vendor Management" in sidebar navigation
2. User clicks "Price Lists" submenu item
3. System navigates to `/vendor-management/pricelists`
4. System displays Price Lists page

**Step 2: View Price List Display**
5. System displays Card component with header and content
6. Header shows:
   - Title: "Price Lists"
   - Subtitle: "Manage vendor price lists and pricing"
   - Export button
   - "Add New" button
7. System displays filter controls:
   - Search input field
   - Status filter dropdown (All, Active, Expired, Pending, Draft)
   - Vendor filter dropdown (All vendors + vendor list)
   - View toggle (Table/Card icons)
8. System loads price list data from mock data source
9. System displays price lists in default table view

**Step 3: Browse Price Lists**
10. System displays table with columns:
    - Name (clickable link)
    - Vendor
    - Status (badge)
    - Validity Period
    - Items (count)
    - Actions (dropdown menu)
11. User scrolls through list to view all price lists
12. User can click on price list name to view details

---

#### Alternate Flows

**AF-001: Switch to Card View**
- At step 7, user clicks card view icon in view toggle
- System switches display to card grid layout
- System shows 3 cards per row on desktop
- Each card displays: name, status badge, vendor name, validity period, item count, action buttons
- Flow continues from step 10 context

**AF-002: Search Price Lists**
- At step 7, user enters text in search input
- System filters price lists by name (case-insensitive)
- System updates display to show matching results only
- If no results match, system shows empty state

**AF-003: Filter by Status**
- At step 7, user selects status from dropdown
- System filters price lists by selected status
- System updates display to show matching results only

**AF-004: Filter by Vendor**
- At step 7, user selects vendor from dropdown
- System filters price lists by selected vendor
- System updates display to show matching results only

**AF-005: Combined Filters**
- User applies multiple filters (search + status + vendor)
- System applies all filters with AND logic
- System shows only price lists matching all criteria

---

#### Exception Flows

**EF-001: No Price Lists Found**
- At step 8, system returns empty data array
- System displays empty state message
- User can click "Add New" to create first price list

**EF-002: Data Loading Error**
- At step 8, data loading fails
- System displays error message
- User can refresh page to retry

---

#### Postconditions

**Success**:
- Price lists displayed in table or card view
- Filters applied correctly
- User can navigate to detail pages

**Failure**:
- Error message displayed
- User informed of issue
- Retry option available

---

#### Business Rules Applied

- **BR-PL-001**: Status badges display with correct colors (Active=green, Expired=red, Pending=yellow, Draft=gray)
- **BR-PL-002**: Filters combine with AND logic
- **BR-PL-003**: Search is case-insensitive

---

#### UI Requirements

**Page Layout**:
- Card container with CardHeader and CardContent
- Responsive design for different screen sizes

**Filter Bar**:
- Search input with search icon placeholder
- Select dropdown for status filter
- Select dropdown for vendor filter
- Icon buttons for view toggle (List and Grid icons)

**Table View**:
- Sortable columns (implementation dependent)
- Clickable name column for navigation
- Status badges with appropriate colors
- Dropdown menu for row actions

**Card View**:
- 3-column grid on desktop
- Cards with consistent spacing
- Status badge in card header
- Action buttons in card footer

---

### UC-PL-002: Create Price List

**Primary Actor**: Procurement Staff, Purchasing Manager

**Stakeholders and Interests**:
- Procurement Staff: Wants to create accurate price lists for vendors
- Purchasing Manager: Needs to ensure pricing is recorded correctly
- Finance Team: Wants pricing available for procurement decisions

**Preconditions**:
- User is authenticated with valid session
- User has access to create price lists
- Vendor directory contains at least one vendor
- Product catalog contains at least one product

**Trigger**: User clicks "Add New" button on Price Lists page

---

#### Main Flow

**Step 1: Navigate to Add Page**
1. User clicks "Add New" button on Price Lists page
2. System navigates to `/vendor-management/pricelists/add`
3. System displays Add Price List page

**Step 2: Enter Basic Information**
4. System displays form card with header "Create Price List"
5. System displays basic information section:
   - Price List Number input (with auto-generate option)
   - Vendor select dropdown (required)
   - Currency select dropdown (required, defaults to USD)
   - Valid From date picker (required)
   - Valid To date picker (optional)
   - Notes textarea (optional)
6. User enters or selects basic information
7. System validates required fields in real-time

**Step 3: Add Line Items**
8. System displays line items section below basic info
9. System displays items table with columns:
   - Product (select dropdown)
   - MOQ (number input)
   - Unit (select dropdown)
   - Unit Price (number input)
   - Lead Time (number input, days)
   - Notes (text input)
   - Remove button
10. User clicks "Add Item" button
11. System adds new row to items table
12. User selects product from dropdown
13. User enters MOQ (optional)
14. User selects unit of measure
15. User enters unit price (required)
16. User enters lead time in days (optional)
17. User enters item notes (optional)
18. User repeats steps 10-17 for additional items

**Step 4: Save Price List**
19. User reviews all entered information
20. User clicks "Save" button
21. System validates all required fields
22. System validates business rules:
    - End date after start date (if provided)
    - Unit prices are positive numbers
23. System creates price list record
24. System displays success toast message
25. System navigates to price list detail page

---

#### Alternate Flows

**AF-001: Remove Line Item**
- At step 18, user clicks remove button on a line item row
- System removes the row from the table
- User continues adding other items

**AF-002: Cancel Creation**
- At any step, user clicks "Cancel" button
- System displays confirmation dialog (if changes made)
- User confirms cancellation
- System navigates back to Price Lists page
- No price list created

**AF-003: Pre-filled from Duplicate**
- User arrives from duplicate action with sessionStorage data
- System pre-fills form with copied data
- Dates cleared, status set to draft
- User modifies as needed
- Flow continues from step 6

---

#### Exception Flows

**EF-001: Validation Errors**
- At step 21, system detects validation errors
- System displays inline error messages below fields
- System highlights fields with errors
- User corrects errors
- User clicks "Save" again
- Flow returns to step 21

**EF-002: End Date Before Start Date**
- At step 22, end date is before start date
- System displays error: "End date must be after start date"
- User corrects dates
- Flow returns to step 21

**EF-003: No Line Items**
- At step 21, no line items added
- System allows save (line items recommended but not required)
- Flow continues to step 22

**EF-004: Negative Price**
- At step 22, unit price is negative or zero
- System displays error: "Unit price must be positive"
- User corrects price
- Flow returns to step 21

---

#### Postconditions

**Success**:
- Price list created with unique identifier
- Price list stored with all line items
- User navigated to detail page
- Price list available in list view

**Failure**:
- No price list created
- Validation errors displayed
- User can correct and retry

---

#### Business Rules Applied

- **BR-PL-004**: End date must be after start date when provided
- **BR-PL-005**: Currency applies to all items in price list
- **BR-PL-006**: Unit prices must be positive numbers
- **BR-PL-007**: Price list number auto-generated if not provided

---

#### UI Requirements

**Form Layout**:
- Single-page form (not wizard)
- Card container with header
- Basic info section at top
- Line items section below
- Action buttons at bottom (Cancel, Save)

**Basic Info Section**:
- Form grid layout (2 columns on desktop)
- Label above each input
- Required field indicators (asterisk)
- Date pickers for date fields
- Select dropdowns for vendor and currency

**Line Items Section**:
- Table with editable rows
- "Add Item" button above table
- Remove button per row
- Select dropdowns for product and unit
- Number inputs for MOQ, price, lead time

**Validation**:
- Real-time validation on blur
- Inline error messages below fields
- Submit validation before save

---

### UC-PL-003: View Price List Detail

**Primary Actor**: Procurement Staff, Purchasing Manager

**Stakeholders and Interests**:
- Procurement Staff: Needs to review complete pricing information
- Purchasing Manager: Needs to verify pricing details
- Finance Team: May need pricing details for budgeting

**Preconditions**:
- User is authenticated with valid session
- Price list exists in system

**Trigger**: User clicks on price list name or view action

---

#### Main Flow

**Step 1: Navigate to Detail Page**
1. User clicks price list name in list OR selects "View" from actions menu
2. System navigates to `/vendor-management/pricelists/[id]`
3. System loads price list data by ID

**Step 2: Display Header Information**
4. System displays back navigation button
5. System displays header section:
   - Price list name
   - Vendor name
   - Status badge with appropriate color

**Step 3: Display Info Grid**
6. System displays info grid with:
   - Validity Period (start date - end date)
   - Currency (currency name/code)
   - Total Items (count of line items)
   - Created By (user who created)
   - Approved By (if applicable, may be empty)
   - Notes (if any)

**Step 4: Display Line Items**
7. System displays line items table with columns:
   - Item Code
   - Item Name
   - Description
   - Unit
   - Unit Price (formatted with currency)
   - MOQ
   - Lead Time (days)
   - Price Change indicator (if applicable)
8. User scrolls through line items to review all pricing

**Step 5: Available Actions**
9. System displays action buttons:
   - Edit (if editable status)
   - Duplicate
   - Export
   - Delete

---

#### Alternate Flows

**AF-001: Navigate Back**
- User clicks back button
- System navigates to Price Lists page

**AF-002: Edit Price List**
- User clicks "Edit" button
- System enters edit mode or navigates to edit page
- See UC-PL-004

**AF-003: Duplicate Price List**
- User clicks "Duplicate" button
- See UC-PL-005

**AF-004: Export Price List**
- User clicks "Export" button
- See UC-PL-006

**AF-005: Delete Price List**
- User clicks "Delete" button
- See UC-PL-007

---

#### Exception Flows

**EF-001: Price List Not Found**
- At step 3, price list ID not found
- System displays error message
- System offers to navigate back to list

**EF-002: Loading Error**
- At step 3, data loading fails
- System displays error message
- User can refresh or navigate back

---

#### Postconditions

**Success**:
- Price list details displayed completely
- All line items visible
- Actions available for user

**Failure**:
- Error message displayed
- Navigation options available

---

#### Business Rules Applied

- **BR-PL-001**: Status badges display with correct colors
- **BR-PL-008**: Price change indicator shows percentage difference from previous (if applicable)
- **BR-PL-009**: Currency displayed consistently for all prices

---

#### UI Requirements

**Page Layout**:
- Back button at top left
- Header section with name, vendor, status
- Info grid below header
- Line items table as main content
- Action buttons in header or footer

**Header Section**:
- Large price list name
- Vendor name below
- Status badge with color coding

**Info Grid**:
- Grid layout with label/value pairs
- Icons for each info item
- Responsive layout (2-3 columns)

**Line Items Table**:
- Full-width table
- Column headers with labels
- Currency symbol in price column
- Empty state if no items

---

### UC-PL-004: Edit Price List

**Primary Actor**: Procurement Staff, Purchasing Manager

**Stakeholders and Interests**:
- Procurement Staff: Needs to update pricing when vendors change prices
- Purchasing Manager: Needs to ensure pricing stays current

**Preconditions**:
- User is authenticated with valid session
- Price list exists and is editable (draft status)
- User has edit permissions

**Trigger**: User clicks "Edit" button on price list detail page

---

#### Main Flow

**Step 1: Enter Edit Mode**
1. User clicks "Edit" button on detail page
2. System checks if price list is editable
3. System enters edit mode or navigates to edit page

**Step 2: Modify Price List**
4. System displays editable form with current values
5. User modifies basic information as needed:
   - Valid From date
   - Valid To date
   - Notes
6. User modifies line items as needed:
   - Update prices
   - Update MOQ
   - Update lead times
   - Add new items
   - Remove items

**Step 3: Save Changes**
7. User clicks "Save" button
8. System validates all fields
9. System updates price list record
10. System displays success message
11. System returns to view mode

---

#### Alternate Flows

**AF-001: Cancel Edit**
- User clicks "Cancel" button
- System discards changes
- System returns to view mode

---

#### Exception Flows

**EF-001: Price List Not Editable**
- At step 2, price list status is not draft
- System displays message: "Only draft price lists can be edited"
- Edit button disabled or hidden

**EF-002: Validation Errors**
- At step 8, validation fails
- System displays error messages
- User corrects errors and saves again

---

#### Postconditions

**Success**:
- Price list updated with new values
- Changes persisted to database
- User returned to view mode

**Failure**:
- Changes not saved
- Error message displayed
- User can retry or cancel

---

#### Business Rules Applied

- **BR-PL-010**: Only draft status price lists can be edited
- **BR-PL-004**: End date must be after start date
- **BR-PL-006**: Unit prices must be positive

---

#### UI Requirements

**Edit Mode**:
- Same layout as detail page with editable fields
- Clear visual distinction for editable vs read-only fields
- Save and Cancel buttons visible

---

### UC-PL-005: Duplicate Price List

**Primary Actor**: Procurement Staff, Purchasing Manager

**Stakeholders and Interests**:
- Procurement Staff: Wants to quickly create similar price lists
- Purchasing Manager: Needs efficient price list creation

**Preconditions**:
- User is authenticated with valid session
- Source price list exists

**Trigger**: User clicks "Duplicate" button on price list

---

#### Main Flow

**Step 1: Initiate Duplicate**
1. User clicks "Duplicate" from actions menu (list page) or detail page
2. System copies all price list data to sessionStorage
3. System navigates to `/vendor-management/pricelists/add`

**Step 2: Review Copied Data**
4. System loads copied data from sessionStorage
5. System pre-fills form with copied values:
   - Vendor (same as source)
   - Currency (same as source)
   - All line items (same as source)
6. System clears date fields
7. System sets status to draft

**Step 3: Modify and Save**
8. User reviews pre-filled data
9. User modifies as needed (dates, prices, items)
10. User clicks "Save"
11. System creates new price list
12. System displays success message
13. System navigates to new price list detail page

---

#### Alternate Flows

**AF-001: Cancel Duplicate**
- User clicks "Cancel" on add page
- System discards copied data
- System navigates back to list or source detail page

---

#### Postconditions

**Success**:
- New price list created with copied data
- Original price list unchanged
- User viewing new price list

**Failure**:
- No new price list created
- Original unchanged
- User can retry

---

#### Business Rules Applied

- **BR-PL-011**: Duplicate inherits all line items and pricing from source
- **BR-PL-012**: Duplicate creates new price list with draft status
- **BR-PL-013**: Dates must be re-entered for duplicate

---

#### UI Requirements

**Duplicate Flow**:
- Seamless navigation to add page
- Pre-filled form with visual indication of duplicated data
- Clear dates to force user to set new validity period

---

### UC-PL-006: Export Price List

**Primary Actor**: Procurement Staff, Purchasing Manager, Financial Manager

**Stakeholders and Interests**:
- Procurement Staff: Needs to share pricing with vendors or colleagues
- Financial Manager: Needs pricing data for reporting

**Preconditions**:
- User is authenticated with valid session
- Price list exists

**Trigger**: User clicks "Export" button

---

#### Main Flow

**Step 1: Initiate Export**
1. User clicks "Export" button (list page header or detail page)
2. System generates export file

**Step 2: Download File**
3. System triggers file download
4. Browser downloads file to user's device
5. User receives file with price list data

---

#### Alternate Flows

**AF-001: Export from List Page**
- User clicks "Export" in page header
- System exports all visible/filtered price lists
- Flow continues from step 2

**AF-002: Export Single Price List**
- User clicks "Export" on detail page or actions menu
- System exports single price list data
- Flow continues from step 2

---

#### Postconditions

**Success**:
- File downloaded to user's device
- File contains price list data

**Failure**:
- Download fails
- Error message displayed

---

#### UI Requirements

**Export Button**:
- Download icon with "Export" label
- Triggers immediate download

---

### UC-PL-007: Delete Price List

**Primary Actor**: Procurement Staff, Purchasing Manager

**Stakeholders and Interests**:
- Procurement Staff: Needs to remove obsolete price lists
- Purchasing Manager: Needs to maintain clean data

**Preconditions**:
- User is authenticated with valid session
- Price list exists
- User has delete permission

**Trigger**: User clicks "Delete" action

---

#### Main Flow

**Step 1: Initiate Delete**
1. User selects "Delete" from actions dropdown menu
2. System displays confirmation dialog

**Step 2: Confirm Deletion**
3. Dialog shows: "Are you sure you want to delete this price list?"
4. Dialog shows price list name for confirmation
5. User clicks "Delete" to confirm OR "Cancel" to abort

**Step 3: Execute Deletion**
6. If confirmed, system deletes price list record
7. System displays success toast: "Price list deleted successfully"
8. If on detail page, system navigates to list page
9. If on list page, system refreshes list

---

#### Alternate Flows

**AF-001: Cancel Deletion**
- At step 5, user clicks "Cancel"
- Dialog closes
- No deletion occurs
- User returns to previous view

---

#### Exception Flows

**EF-001: Delete Fails**
- At step 6, deletion fails (constraint, permission)
- System displays error message
- Price list unchanged

---

#### Postconditions

**Success**:
- Price list removed from system
- List view refreshed
- Success message displayed

**Failure**:
- Price list unchanged
- Error message displayed

---

#### Business Rules Applied

- **BR-PL-014**: Delete requires user confirmation

---

#### UI Requirements

**Confirmation Dialog**:
- AlertDialog component
- Clear warning message
- Price list name displayed
- Cancel and Delete buttons
- Delete button styled as destructive (red)

---

### UC-PL-008: Mark Price List as Expired

**Primary Actor**: Procurement Staff, Purchasing Manager

**Stakeholders and Interests**:
- Procurement Staff: Needs to mark outdated price lists
- Purchasing Manager: Needs to maintain accurate status

**Preconditions**:
- User is authenticated with valid session
- Price list exists with non-expired status

**Trigger**: User selects "Mark as Expired" action

---

#### Main Flow

**Step 1: Select Action**
1. User selects "Mark as Expired" from actions dropdown menu

**Step 2: Update Status**
2. System updates price list status to "expired"
3. System displays success toast: "Price list marked as expired"
4. System refreshes display to show updated status

---

#### Alternate Flows

**AF-001: Confirmation Required**
- System may display confirmation dialog
- User confirms action
- Flow continues from step 2

---

#### Postconditions

**Success**:
- Price list status changed to expired
- Status badge updated to red
- Price list no longer used for active procurement

**Failure**:
- Status unchanged
- Error message displayed

---

#### Business Rules Applied

- **BR-PL-015**: Expired price lists display with red badge
- **BR-PL-016**: Expired price lists should not be used for new procurement

---

#### UI Requirements

**Action Menu**:
- "Mark as Expired" option in dropdown
- Toast notification on success

---

## 4. Use Case Diagram Summary

```
                    ┌─────────────────────────────────────────┐
                    │          Price Lists Module              │
                    └─────────────────────────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
        ▼                               ▼                               ▼
┌───────────────┐              ┌───────────────┐              ┌───────────────┐
│ View Price    │              │ Create Price  │              │ View Detail   │
│ Lists         │              │ List          │              │ Page          │
│ (UC-PL-001)   │              │ (UC-PL-002)   │              │ (UC-PL-003)   │
└───────────────┘              └───────────────┘              └───────────────┘
        │                               │                               │
        │                               │                               │
        ▼                               ▼                               ▼
┌───────────────┐              ┌───────────────┐              ┌───────────────┐
│ Edit Price    │              │ Duplicate     │              │ Export Price  │
│ List          │              │ Price List    │              │ List          │
│ (UC-PL-004)   │              │ (UC-PL-005)   │              │ (UC-PL-006)   │
└───────────────┘              └───────────────┘              └───────────────┘
        │                               │
        │                               │
        ▼                               ▼
┌───────────────┐              ┌───────────────┐
│ Delete Price  │              │ Mark as       │
│ List          │              │ Expired       │
│ (UC-PL-007)   │              │ (UC-PL-008)   │
└───────────────┘              └───────────────┘
```

---

## 5. Actor Summary

| Actor | Use Cases | Description |
|-------|-----------|-------------|
| Procurement Staff | All (UC-PL-001 to UC-PL-008) | Primary user for price list management |
| Purchasing Manager | All (UC-PL-001 to UC-PL-008) | Supervisory role with full access |
| Financial Manager | UC-PL-001, UC-PL-003, UC-PL-006 | Read access and export for reporting |

---

## 6. Related Documents

- [BR-price-lists.md](./BR-price-lists.md) - Business Requirements v2.0.0
- [DD-price-lists.md](./DD-price-lists.md) - Data Definition v2.1.0
- [FD-price-lists.md](./FD-price-lists.md) - Flow Diagrams
- [TS-price-lists.md](./TS-price-lists.md) - Technical Specification v2.0.0
- [VAL-price-lists.md](./VAL-price-lists.md) - Validations v2.0.0

---

**End of Use Cases Document**
