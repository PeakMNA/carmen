# Business Requirements: Products

## Module Information
- **Module**: Product Management
- **Sub-Module**: Products
- **Route**: /product-management/products
- **Version**: 1.0.0
- **Last Updated**: 2026-01-15
- **Owner**: Product Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-11 | System | Initial business requirements documentation |
| 1.1.0 | 2026-01-15 | System | Updated to sync with current code - renamed Recipe Units to Ingredient Units, added location tags/shelves/PAR levels, added table/card view modes, updated field names (isIngredient, isForSale), added advanced filtering with saved filters |

## Overview

The Products sub-module serves as the central repository for all product information within the CARMEN hospitality ERP system. It provides comprehensive product master data management capabilities that are utilized across all operational modules including Procurement, Inventory Management, Recipe Management, Store Operations, Sales, and Finance.

Products represent items that can be purchased, stored, used in recipes, or sold directly. Each product is assigned to a category within the three-level hierarchy (Category → Subcategory → Item Group) and has defined units of measure for inventory tracking, ordering, and recipe usage. The module supports flexible product configuration including multi-unit conversions, store-specific assignments, pricing and cost tracking, tax handling, and comprehensive activity logging.

This sub-module is critical for maintaining data consistency across the ERP system and enabling efficient product operations throughout the supply chain from procurement through to sale or consumption.

## Business Objectives

1. **Centralize Product Data**: Maintain a single source of truth for all product information accessible by all ERP modules to ensure consistency and eliminate data duplication
2. **Streamline Product Operations**: Enable efficient product creation, modification, and management with intuitive interfaces and bulk operation support
3. **Support Multi-Unit Operations**: Provide flexible unit conversion capabilities for inventory tracking (base unit), ordering (order unit), and ingredient/recipe management (ingredient unit)
4. **Enable Store-Specific Management**: Allow product assignment to multiple locations with store-specific inventory thresholds (min/max quantities, reorder points, PAR levels), shelf assignments, and custom tags for flexible decentralized operations
5. **Track Product History**: Maintain comprehensive purchase history (latest orders and receipts) and complete activity logs for audit trails and analysis
6. **Facilitate Cost Management**: Track standard costs, receiving costs, and price deviations to support financial planning and procurement decisions
7. **Support Tax Compliance**: Manage product-specific tax types and rates to ensure accurate tax calculations across all transactions
8. **Enable Product Classification**: Support flexible categorization, product types (recipe/sale flags), and custom attributes for diverse product portfolio
9. **Provide Search and Discovery**: Offer powerful search, filtering, and sorting capabilities to quickly locate products from large catalogs (1000+ items)
10. **Integrate Seamlessly**: Provide robust integration points with Procurement, Inventory, Recipe, Sales, and Finance modules for end-to-end operations

## Key Stakeholders

- **Primary Users**: Procurement staff, inventory managers, product managers (daily product management, purchasing, receiving operations)
- **Secondary Users**: Store/location managers (viewing assigned products, checking inventory thresholds), recipe planners (product usage in recipes)
- **Approvers**: Department managers (approving product changes affecting costs or operations), finance managers (reviewing cost and pricing data)
- **Administrators**: System administrators (managing product master data, bulk imports/updates, system configuration)
- **Reviewers**: Finance team (auditing cost and price changes), operations managers (monitoring product performance and availability)
- **Support**: IT support team (troubleshooting product data issues, assisting with integrations)

---

## Functional Requirements

### FR-PROD-001: Product Creation
**Priority**: Critical

The system must allow authorized users to create new product records with all required information including unique product code, product name (English and local descriptions), category assignment, default inventory and order units, and basic cost information. The system shall validate uniqueness of product codes and ensure all mandatory fields are completed before saving.

**Acceptance Criteria**:
- User can access product creation form from product list page via "Create Product" button
- All required fields are marked with red asterisk (*) and validated before submission
- Product code must be unique across all active products (case-insensitive comparison)
- System prevents creation if duplicate code exists and displays clear error message
- Category dropdown populated from three-level hierarchy with selection required
- Inventory unit and order unit dropdowns populated from active units master data
- Created product is immediately visible in product list with "Active" status by default
- Activity log automatically records creation with user, timestamp, and "Created" action
- Success message displayed upon successful creation with product code confirmation

**Related Requirements**: BR-PROD-001, BR-PROD-002, BR-PROD-004, BR-PROD-009

---

### FR-PROD-002: Product Update
**Priority**: Critical

The system must allow authorized users to edit existing product information including descriptions, category assignment, units, costs, pricing information, deviations, tax settings, and attributes. Updates shall maintain audit trail of all changes including who made the change, when, and what was modified.

**Acceptance Criteria**:
- User can access product edit mode from detail page via "Edit" button
- All editable fields become enabled when in edit mode with current values displayed
- System validates all field constraints (data types, ranges, uniqueness) before allowing save
- Product code cannot be changed after creation (read-only in edit mode)
- Category change validated to ensure no circular dependencies or invalid hierarchies
- Unit changes validated to ensure default units are from assigned unit list
- Save operation updates all modified fields atomically in database transaction
- Activity log records all field changes with before/after values
- Success message displayed with summary of fields updated
- Updated product immediately reflects changes in all views (list, detail, lookups)

**Related Requirements**: BR-PROD-001, BR-PROD-005, BR-PROD-007, BR-PROD-016

---

### FR-PROD-003: Product Deletion (Soft Delete)
**Priority**: High

The system must allow authorized users to delete product records using soft delete mechanism (setting deleted_at timestamp) rather than physical deletion. Products with active dependencies (assigned to purchase orders, inventory transactions, recipes) cannot be deleted and system shall display clear blocking message with dependency details.

**Acceptance Criteria**:
- User can initiate delete from product detail page via "Delete" button
- System performs dependency check before allowing deletion:
  - Active purchase orders referencing product
  - Inventory transactions (receipts, issues, adjustments) in current fiscal period
  - Active recipes using product as ingredient
  - Open sales orders or quotes with product
- If dependencies exist, display blocking message listing dependency counts by type
- If no dependencies, display confirmation dialog warning of permanent deletion
- User must confirm deletion before proceeding
- Deleted product marked with deleted_at timestamp and deleted_by user ID
- Deleted products excluded from active lists but retained for audit/history
- Activity log records deletion with user, timestamp, and deletion reason if provided
- Soft-deleted products can be restored by admin users only

**Related Requirements**: BR-PROD-006, BR-PROD-018

---

### FR-PROD-004: Product Status Management
**Priority**: High

The system must allow users to toggle product status between Active and Inactive. Inactive products are excluded from product selection dropdowns in operational transactions (new POs, GRNs, recipes) but remain visible in historical records and reports. Status changes are immediately reflected across all modules.

**Acceptance Criteria**:
- Product detail page displays current status with toggle switch or checkbox
- User can change status with single click/toggle action
- Confirmation dialog displayed for status change: "Mark product as [Active/Inactive]?"
- Active products appear in all product selection dropdowns across ERP modules
- Inactive products excluded from new transaction entry screens
- Inactive products visible in edit mode for existing transactions
- Status filter available on product list page (Active, Inactive, All)
- Activity log records status changes with previous and new status values
- Status change notification sent to relevant stakeholders (configurable)
- Product status badge displayed in list view and detail view with color coding

**Related Requirements**: BR-PROD-003

---

### FR-PROD-005: Product Categorization
**Priority**: Critical

The system must support product assignment to the three-level category hierarchy (Category → Subcategory → Item Group) with cascading selection. Category changes must be validated and existing category assignments must be tracked in activity log. Products must inherit category-level settings including deviation limits.

**Acceptance Criteria**:
- Product form displays three-level category selection with cascading dropdowns
- Selecting Category filters Subcategory dropdown to children of selected Category
- Selecting Subcategory filters Item Group dropdown to children of selected Subcategory
- All three levels must be selected for complete categorization
- Category assignment is mandatory for product creation
- Changing category displays warning if product has historical transactions
- Products inherit price/quantity deviation limits from assigned Item Group
- Category path displayed as breadcrumb: "Food → Beverages → Coffee"
- Category filter available on product list with multi-level navigation
- Activity log records category changes with old and new paths

**Related Requirements**: BR-PROD-004, BR-PROD-010

---

### FR-PROD-006: Multi-Unit Management
**Priority**: Critical

The system must support multiple unit types for each product: Inventory Unit (base unit for stock tracking), Order Units (units used in purchasing with conversion rates), and Ingredient Units (units used in recipes with conversion rates). All conversions are relative to the base Inventory Unit with rates stored to 5 decimal precision. Each unit type supports a conversion direction flag (isInverse) to control calculation direction.

**Acceptance Criteria**:
- Product detail displays tabs for unit management: General, Inventory, Order Units, Ingredient Units
- Inventory Unit is mandatory and defines the base unit (conversion rate = 1.00000)
- Order Units section allows adding multiple order units with conversion rates (available units: BAG, BOX, CASE, PALLET, PACK)
- Ingredient Units section allows adding multiple ingredient units with conversion rates (available units: G, KG, LB, OZ)
- Each unit supports:
  - Unit selection from dropdown
  - Conversion factor input (positive non-zero, max 5 decimals)
  - Description field
  - isDefault toggle (only one per unit type)
  - isInverse toggle (direction control for conversion calculations)
- Conversion rate entry validated: must be positive non-zero, max 5 decimals
- System calculates and displays conversion formula based on isInverse flag:
  - When isInverse is true: `1 KG = (1 / factor) × unit` (e.g., 1 KG = 1000 G)
  - When isInverse is false: `1 unit = factor × KG` (standard direction)
- Unit selection dropdowns populated from active units master data
- Duplicate units prevented within same unit type (order/ingredient)
- Conversion rate changes logged in activity log with effective date
- Real-time conversion display shows "Qty × factor" calculation method
- Default unit can be designated for each unit type via isDefault toggle

**Related Requirements**: BR-PROD-005, BR-PROD-011, BR-PROD-012, BR-PROD-013

---

### FR-PROD-007: Store/Location Assignment
**Priority**: High

The system must allow products to be assigned to multiple stores/locations with comprehensive location-specific settings including inventory thresholds (min/max quantities, reorder point, PAR level), shelf assignments, and custom tags. These thresholds support automatic reorder point calculations, stock level alerts, and location-specific organization.

**Acceptance Criteria**:
- Product detail displays "Location Assignment" tab with table of assigned locations
- "Add Location" button opens location selector dialog with unassigned locations
- Each location row displays: Location Name, Location Code, Shelf, Min Qty, Max Qty, Reorder Point, PAR Level, Tags, Actions
- Location assignment fields:
  - **Location ID/Name/Code**: Reference to the assigned store/location (required)
  - **Shelf**: Optional shelf assignment within the location (dropdown from location-specific shelves)
  - **Min Quantity**: Minimum inventory threshold (>= 0, 3 decimal precision)
  - **Max Quantity**: Maximum inventory threshold (> min, 3 decimal precision)
  - **Reorder Point**: Quantity triggering reorder alerts (>= 0, <= max)
  - **PAR Level**: Standard stock level for the location (Periodic Automatic Replacement)
  - **Tags**: Optional array of custom tags for categorization and filtering
- All quantity fields editable inline with validation
- Default values when location first assigned: min=0, max=0, reorderPoint=0, parLevel=0
- Shelf dropdown populated based on selected location (location-specific shelves)
- **Tag Management**:
  - "Manage Tags" button opens tag management dialog
  - Tags are location-specific (each location can have its own set of tags)
  - Create new tags with name and color selection (predefined color palette)
  - Apply/remove multiple tags to location assignment
  - Tag colors available: red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose
- User can remove location assignment if product has zero inventory at that location
- Attempting to remove assignment with inventory displays blocking error
- Location assignments immediately available for inventory transactions at that location
- Activity log records all location assignments/removals with quantities and tags
- List view shows number of assigned locations as badge/count
- Location filter on product list shows products assigned to selected location

**Related Requirements**: BR-PROD-014, BR-PROD-015

---

### FR-PROD-008: Cost Tracking
**Priority**: High

The system must track multiple cost values for each product including Standard Cost (planned/target cost) and Last Receiving Cost (actual cost from most recent GRN). Costs are maintained in base currency with historical cost tracking for trending and analysis. Cost changes trigger notifications to finance team.

**Acceptance Criteria**:
- Product detail displays cost section with Standard Cost and Last Receiving Cost fields
- Standard Cost is manually editable by users with appropriate permissions
- Last Receiving Cost is auto-populated from most recent GRN and read-only
- Last Receiving Cost displays date and vendor from source GRN transaction
- Cost fields display currency symbol from system base currency setting
- Cost values validated: must be >= 0, max 2 decimal places
- Cost change percentage calculated and displayed when Standard Cost is updated
- Cost change above threshold (e.g., 10%) requires approval before saving
- Activity log records all cost changes with old/new values and approval status
- Cost history report accessible showing trend of Standard Cost over time

**Related Requirements**: BR-PROD-016, BR-PROD-021

---

### FR-PROD-009: Price Deviation Control
**Priority**: High

The system must enforce price and quantity deviation limits to control purchase variance. Products inherit deviation percentages from their Item Group category but can have product-specific overrides. Deviations are validated during PO and GRN entry to prevent excessive variance from standard costs/quantities.

**Acceptance Criteria**:
- Product detail displays Price Deviation % and Quantity Deviation % fields
- Deviation fields show inherited values from Item Group category (read-only badge)
- User can override inherited values by enabling edit mode
- Deviation values validated: must be 0-100%, max 2 decimal places
- Zero deviation (0%) means no variance allowed from standard
- 100% deviation means any variance is acceptable (effectively no limit)
- Deviation limits applied during PO entry: price within ±deviation% of Standard Cost
- Deviation limits applied during GRN entry: quantity within ±deviation% of PO quantity
- Transactions exceeding deviation limits display warning and require approval
- Activity log records deviation changes with old/new values and inheritance status

**Related Requirements**: BR-PROD-008, BR-PROD-009, BR-PROD-020

---

### FR-PROD-010: Tax Configuration
**Priority**: High

The system must support product-level tax configuration including Tax Type (Added Tax, Included Tax, or None) and Tax Rate percentage. Tax settings determine how tax is calculated in purchase and sales transactions. Products can reference tax master data for standard rates or have product-specific custom rates.

**Acceptance Criteria**:
- Product detail displays Tax Type dropdown with three options:
  - "Added Tax": Tax calculated on top of product price (price + tax)
  - "Included Tax": Tax already included in product price (price with tax embedded)
  - "None": No tax applies to this product
- Tax Rate field enabled when Tax Type is "Added Tax" or "Included Tax"
- Tax Rate validated: must be 0-100%, max 2 decimal places
- Tax Type dropdown can link to Tax Master lookup for standard tax codes
- Selecting tax code from master auto-populates Tax Type and Tax Rate
- Custom tax rate entry allowed with manual override option
- Tax settings immediately apply to new transactions (POs, GRNs, invoices)
- Existing transactions retain original tax settings (historical integrity)
- Activity log records tax configuration changes
- Tax calculation examples displayed based on sample price and selected tax settings

**Related Requirements**: BR-PROD-017

---

### FR-PROD-011: Product Types (Usage Flags)
**Priority**: Medium

The system must support product type flags indicating how products are used: "isIngredient" flag indicates product is an ingredient for recipe management, and "isForSale" flag indicates product can be sold to customers. Products can have neither, one, or both flags enabled.

**Acceptance Criteria**:
- Product detail displays two toggles/checkboxes: "Is Ingredient" and "Is For Sale"
- Both flags unchecked by default for new products
- User can enable/disable either or both flags independently
- **isIngredient flag**:
  - When enabled, product appears in Recipe module ingredient selection dropdowns
  - Enables "Ingredient Units" tab configuration for recipe-specific unit conversions
  - Displayed in product list with ingredient indicator
- **isForSale flag**:
  - When enabled, product appears in Sales module product selection
  - Enables pricing and sales-specific configuration
  - Displayed in product list with sale indicator
- Products with both flags enabled appear in both Recipe and Sales modules
- Products with neither flag are inventory-only (procurement and storage)
- Activity log records usage flag changes
- List view displays icons/badges indicating product type based on flag combination

**Related Requirements**: BR-PROD-019

---

### FR-PROD-012: Additional Attributes
**Priority**: Medium

The system must support flexible key-value pair attributes for product-specific information not covered by standard fields. Common attributes include Weight, Shelf Life (days), Storage Instructions, Size, Color, and custom business-specific attributes. Attributes support different data types (text, number, date, textarea).

**Acceptance Criteria**:
- Product detail displays Additional Attributes section with key-value grid
- User can add unlimited attribute rows via "Add Attribute" button
- Each attribute row has: Key field (attribute name), Value field (attribute value), Data Type selector, Delete button
- Data Type options: Text (single line), Number (decimal), Date (calendar picker), Textarea (multi-line)
- Common attributes pre-populated as templates with appropriate data types
- Value field input type changes based on Data Type selected
- Number attributes validated for numeric format with decimal support
- Date attributes use date picker with format validation
- Attributes are searchable in global product search
- Activity log records attribute additions/changes/deletions
- Attribute export to Excel includes all key-value pairs in dedicated columns

**Related Requirements**: BR-PROD-023

---

### FR-PROD-013: Purchase History Tracking
**Priority**: High

The system must track and display product purchase history showing the 10 most recent purchase orders and 10 most recent goods receipt notes for each product. This enables users to view recent procurement activity, pricing trends, and supplier patterns to support purchasing decisions and supplier negotiations.

**Acceptance Criteria**:
- Product detail page includes "Latest Purchase" tab or button
- Clicking button opens modal/panel with two sections: Purchase Orders and Receipts
- Purchase Orders section displays 10 most recent POs in descending date order
- PO table columns: PO Number, Delivery Date, Vendor Name, Location, Status, Quantity, Unit, Price, Currency
- Receipts section displays 10 most recent GRNs in descending date order
- GRN table columns: GRN Number, Receipt Date, Vendor Name, Location, Status, Quantity, Unit, Price, Currency
- Each row clickable to navigate to full PO/GRN detail page
- Price column displays unit price with 2 decimal precision
- Quantity column displays quantity with 3 decimal precision
- Empty state message displayed if no purchase history exists: "No purchase history available"
- Modal includes "Close" button to return to product detail page
- Purchase history loads within 2 seconds for typical data volume

**Related Requirements**: Integration with Procurement module

---

### FR-PROD-014: Activity Logging
**Priority**: Medium

The system must maintain comprehensive activity log for all product data changes including creation, updates, deletions, status changes, unit modifications, store assignments, and cost changes. Log entries capture user, timestamp, action type, and changed field details for complete audit trail.

**Acceptance Criteria**:
- Product detail page includes Activity Log section (collapsible or separate tab)
- Activity log displays all events in reverse chronological order (newest first)
- Each log entry shows: Date/Time, User Name, Action Type, Description, Details
- Action Types include: Created, Updated, Deleted, Status Changed, Unit Added/Changed, Store Assigned/Removed, Cost Changed
- Description provides human-readable summary: "Changed Standard Cost from $10.50 to $12.00"
- Details column shows field-level before/after values for updates
- Activity log supports pagination with 25 entries per page
- Log entries permanent and immutable (cannot be edited or deleted)
- Export to Excel/PDF functionality for audit reports
- Filter options: Date range, User, Action Type
- Activity log load time under 2 seconds for typical 100+ entries

**Related Requirements**: BR-PROD-022

---

### FR-PROD-015: Product Search and Filtering
**Priority**: High

The system must provide powerful search and filtering capabilities on product list page to quickly locate products from large catalogs. Search covers product code, descriptions (English and local), category names, and barcode. Advanced filtering supports multiple conditions with logical operators and saved filter configurations.

**Acceptance Criteria**:
- Product list page includes search box supporting real-time type-ahead search
- Search queries product code, English description, local description, barcode, category name
- Search is case-insensitive and supports partial matches
- Search results update as user types with 300ms debounce delay
- **Basic Filters**:
  - Category multi-level hierarchy filter (expandable tree)
  - Status filter (Active, Inactive, All)
  - Product Type filter (Ingredient, For Sale, Both, Stock Only)
  - Location/Store Assignment filter (assigned to selected location)
- **Advanced Filtering**:
  - "Advanced Filters" button opens advanced filtering panel
  - Support for multiple filter conditions with logical operators (AND/OR)
  - Each condition consists of: Field selector, Operator (equals, contains, greater than, less than, etc.), Value
  - Fields available for filtering: all product properties including costs, deviations, thresholds
  - Add/remove filter conditions dynamically
  - Preview filter results before applying
- **Saved Filters**:
  - Save current filter configuration with custom name
  - Load previously saved filters from dropdown
  - Delete saved filters
  - Saved filters persist across sessions
  - Quick access to frequently used filter combinations
- Multiple filters can be applied simultaneously (AND/OR logic based on configuration)
- Active filters displayed as removable tags/pills showing filter criteria
- "Clear All Filters" button resets to default view
- Filter state preserved when navigating away and returning to list page
- Search and filter results display count: "Showing 25 of 150 products"
- Export filtered results to Excel with applied filters indicated in filename

**Related Requirements**: Usability requirements

---

### FR-PROD-016: Product List Display
**Priority**: High

The system must display products in sortable, paginated format with support for both table and card view modes. List supports bulk selection for mass operations and provides quick access to common actions. Default sort is alphabetical by product code with customizable sort preferences.

**Acceptance Criteria**:
- **View Mode Toggle**:
  - Toggle button group allows switching between Table View and Card View
  - User preference for view mode persisted across sessions
  - View mode accessible via keyboard shortcut
- **Table View**:
  - Product list displays columns: Product Code, Description (English), Category Path, Inventory Unit, Standard Cost, Status, Actions
  - All columns sortable (ascending/descending) via column header click
  - Active sort column indicated with arrow icon (↑↓)
  - Checkbox in first column enables multi-row selection
  - "Select All" checkbox in header selects all rows on current page
  - Each row includes action dropdown menu (⋮) with: View, Edit, Delete, Duplicate
  - Status column displays badge with color coding: Green (Active), Gray (Inactive)
  - Cost column right-aligned with currency symbol and 2 decimal precision
- **Card View**:
  - Products displayed as responsive grid of cards
  - Each card shows: Product image (if available), Product Code, Description, Category, Status badge
  - Cards support selection via checkbox for bulk operations
  - Click card to navigate to product detail
  - Hover state shows quick action buttons
  - Cards resize responsively based on screen width (4 per row on desktop, 2 on tablet, 1 on mobile)
- **Common Features**:
  - Pagination controls at bottom with page size options: 25, 50, 100, 200
  - Bulk action buttons enabled when rows/cards selected: Export, Bulk Status Update, Bulk Delete
  - Responsive design: adapts to screen size with appropriate layout
  - List/Grid loads within 3 seconds with up to 100 items
  - Empty state message when no products: "No products found. Create your first product."

**Related Requirements**: Performance requirements

---

### FR-PROD-017: Product Duplication
**Priority**: Medium

The system must allow users to create new products by duplicating existing product records. Duplication copies all product data except unique identifiers (product code) and audit fields. This accelerates product creation for similar items and ensures consistency of settings across product families.

**Acceptance Criteria**:
- Product detail page and list row actions include "Duplicate" button/option
- Clicking Duplicate opens product creation form pre-filled with source product data
- Fields copied: Category, Units, Conversion Rates, Descriptions, Tax Settings, Deviations, Attributes, Store Assignments (min/max only)
- Fields cleared/reset: Product Code (empty), Status (Active), Audit fields (created by/at)
- Product Code field highlighted and focused for immediate entry
- Duplicate button shows source product code: "Duplicating from: PROD-001"
- User must provide new unique product code before saving
- All standard validation rules apply to duplicated product
- Activity log of new product records "Duplicated from: PROD-001"
- Success message confirms creation: "Product created from PROD-001"

**Related Requirements**: Usability requirements

---

### FR-PROD-018: Barcode Management
**Priority**: Medium

The system must support product barcode entry and display for barcode scanning integration in warehouse and point-of-sale operations. Barcode field supports various barcode standards (EAN-13, UPC, Code 128) with format validation. Products can have multiple barcodes (primary and alternate).

**Acceptance Criteria**:
- Product detail includes Barcode field in main information section
- Barcode field accepts alphanumeric input up to 50 characters
- Format validation for common barcode standards: EAN-13 (13 digits), UPC (12 digits), Code 128 (variable)
- Invalid format displays warning but allows saving (not blocking)
- Barcode uniqueness check across all products (soft validation with warning)
- Product search supports barcode lookup (exact match prioritized)
- Support for multiple barcodes via Additional Barcodes section (future enhancement)
- Barcode field can be populated via barcode scanner device (keyboard wedge input)
- Activity log records barcode changes
- Barcode displayed in product list view (optional column)
- Barcode printable on product labels and shelf tags

**Related Requirements**: Integration with barcode scanning devices

---

### FR-PROD-019: Bulk Import/Export
**Priority**: Medium

The system must support bulk product import from Excel/CSV files for initial data migration and ongoing bulk updates. Export functionality creates Excel files with all product data in standard template format. Import includes validation, error reporting, and rollback capabilities.

**Acceptance Criteria**:
- Product list page includes "Import" and "Export" buttons in header
- Export generates Excel file with all visible products (filtered results)
- Export template includes all product fields as columns with headers
- Export file naming: "Products_Export_YYYYMMDD_HHMMSS.xlsx"
- Import button opens file upload dialog accepting .xlsx and .csv formats
- Import process:
  1. Upload file and validate format/headers
  2. Parse and validate all rows (data types, required fields, uniqueness)
  3. Display validation results: X valid, Y errors
  4. Show error details with row numbers and specific error messages
  5. User option to "Import Valid Rows Only" or "Cancel"
  6. Import executes in background with progress indicator
  7. Success notification with counts: "X products created, Y updated"
- Import errors downloadable as Excel with error column added
- Import supports both insert (new) and update (existing based on product code)
- Bulk operations logged in activity log with batch identifier
- Import process can be cancelled mid-execution with rollback

**Related Requirements**: Data migration requirements

---

### FR-PROD-020: Print Product Details
**Priority**: Low

The system must support printing of product detail information in formatted layout suitable for product sheets, shelf labels, and management reports. Print layout includes all key product data organized logically with company branding.

**Acceptance Criteria**:
- Product detail page includes "Print" button in header
- Clicking Print opens browser print preview dialog
- Print layout is print-optimized CSS (no UI chrome, navigation, or action buttons)
- Print includes: Company logo/header, Product code and description, Category path, All units and conversion rates, Cost information, Tax settings, Store assignments, Attributes
- Print layout is A4 page size with proper margins and page breaks
- Multi-page support if product data exceeds single page
- Print footer includes: Generated by [User], Generated on [Date/Time], Page X of Y
- User can save as PDF via browser print-to-PDF functionality
- Print preview loads within 2 seconds
- Print CSS defined in separate stylesheet for maintainability

**Related Requirements**: Reporting requirements

---

## Business Rules

### General Rules

- **BR-PROD-001**: All products must have a unique product code (alphanumeric, max 50 characters, case-insensitive uniqueness check). Product codes cannot be changed after creation to maintain referential integrity across system.

- **BR-PROD-002**: Product English Description is mandatory (max 255 characters). Local Description is optional (max 255 characters) for multilingual support but recommended for hospitality operations.

- **BR-PROD-003**: Products can be Active or Inactive. Only Active products appear in operational transaction entry screens (PO, GRN, recipes, sales). Inactive products remain visible in historical records and reports. Default status is Active upon creation.

- **BR-PROD-004**: Every product must be assigned to exactly one category at each level of the three-level hierarchy (Category, Subcategory, Item Group). Category assignment is mandatory and cannot be null.

- **BR-PROD-005**: Products must have exactly one Inventory Unit (base unit) designated for stock tracking. All other units (Order, Recipe) are converted to/from this base unit. Inventory Unit cannot be changed if product has transaction history.

- **BR-PROD-006**: Products with dependencies cannot be deleted (soft or hard). Dependencies include: active purchase orders, inventory transactions in current fiscal period, active recipes using product as ingredient, open sales orders. System must display specific dependency counts to user.

### Data Validation Rules

- **BR-PROD-007**: Product codes must be unique across all products (active and soft-deleted). Format: alphanumeric with optional hyphens/underscores, max 50 characters, leading/trailing whitespace trimmed.

- **BR-PROD-008**: Price Deviation percentage must be 0-100%, stored as decimal (e.g., 10.50% stored as 0.1050). Products inherit deviation from Item Group but can override with product-specific value.

- **BR-PROD-009**: Quantity Deviation percentage must be 0-100%, stored as decimal. Products inherit deviation from Item Group but can override with product-specific value.

- **BR-PROD-010**: Category assignment at all three levels (Category, Subcategory, Item Group) is mandatory. System validates that Subcategory belongs to selected Category and Item Group belongs to selected Subcategory.

- **BR-PROD-011**: Inventory Unit (base unit) is mandatory and must be from active units master data. Conversion rate for inventory unit is always 1.00000 (by definition of base unit).

- **BR-PROD-012**: Order Units are optional. Multiple order units can be assigned with unique conversion rates to inventory unit. Each order unit has: unit code, conversion factor (positive non-zero, max 5 decimal precision), description, isDefault flag (only one per product), and isInverse flag (controls conversion direction). Available order units: BAG, BOX, CASE, PALLET, PACK.

- **BR-PROD-013**: Ingredient Units are optional (primarily for products where isIngredient=true). Multiple ingredient units can be assigned with unique conversion rates to inventory unit. Each ingredient unit has: unit code, conversion factor (positive non-zero, max 5 decimal precision), description, isDefault flag (only one per product), and isInverse flag (controls conversion direction). Available ingredient units: G, KG, LB, OZ.

- **BR-PROD-014**: Location assignments are optional. Products can be assigned to zero, one, or multiple locations/stores. Same location cannot be assigned multiple times to same product. Each location assignment supports: locationId, locationName, locationCode, shelfId, shelfName, minQuantity, maxQuantity, reorderPoint, parLevel, and optional tags array.

- **BR-PROD-015**: For each location assignment:
  - Minimum Quantity must be >= 0 (3 decimal precision)
  - Maximum Quantity must be > Minimum Quantity (3 decimal precision)
  - Reorder Point must be >= 0 and <= Maximum Quantity
  - PAR Level (Periodic Automatic Replacement) must be >= 0 (3 decimal precision)
  - Shelf assignment is optional and must reference a valid shelf within the selected location
  - Tags are optional, location-specific strings for categorization
  - Min/Max/Reorder/PAR values default to 0 when location first assigned

### Workflow Rules

- **BR-PROD-016**: Standard Cost and Last Receiving Cost are stored in system base currency only. Multi-currency costs handled at transaction level (PO, GRN) with exchange rate conversions.

- **BR-PROD-017**: Tax Type determines tax calculation method: "Added Tax" calculates tax on top of price (price + tax), "Included Tax" assumes tax is embedded in price (price with tax broken out), "None" means no tax applies. Tax Rate required for Added and Included types.

- **BR-PROD-018**: Soft deleted products retain all data with deleted_at timestamp and deleted_by user ID. Soft deleted products excluded from active lists and operational dropdowns but visible in historical reports with deleted indicator.

- **BR-PROD-019**: Product type flags (isIngredient, isForSale) are independent boolean fields and can both be enabled, both disabled, or one of each. Products with neither flag are inventory/stock-only items. When isIngredient is true, the Ingredient Units tab becomes relevant for recipe integration.

### Calculation Rules

- **BR-PROD-020**: Deviation Validation Formula:
  - Price Deviation Check: `|Actual Price - Standard Cost| / Standard Cost * 100 <= Price Deviation %`
  - Quantity Deviation Check: `|Actual Quantity - Expected Quantity| / Expected Quantity * 100 <= Quantity Deviation %`
  - Transactions exceeding deviation require approval or blocking based on configuration

- **BR-PROD-021**: Unit Conversion Calculations:
  - To Base Unit: `Base Quantity = Order Quantity × Order Unit Conversion Rate` (rounded to 3 decimals)
  - From Base Unit: `Order Quantity = Base Quantity ÷ Order Unit Conversion Rate` (rounded to 3 decimals)
  - Between Non-Base Units: Convert to base then to target: `Quantity₂ = (Quantity₁ × Rate₁) ÷ Rate₂` (rounded to 3 decimals)
  - All intermediate calculations rounded before use in subsequent calculations

### Security Rules

- **BR-PROD-022**: All product data changes must be logged to activity log including: user ID, timestamp, action type, affected fields, before/after values. Activity log entries are immutable and retained indefinitely.

- **BR-PROD-023**: Custom product attributes stored as key-value pairs with data type metadata. Attribute keys must be unique within product. No limit on number of attributes per product.

### Additional Attribute Rules

- **BR-PROD-024**: Weight attribute (if used) must be positive decimal in kilograms. Display format: "XX.XX kg". Used for shipping cost calculations.

- **BR-PROD-025**: Shelf Life attribute (if used) must be positive integer in days. Display format: "XX days". Used for expiration date calculations and FIFO management.

- **BR-PROD-026**: Storage Instructions attribute (if used) is free text (max 500 characters) describing temperature, humidity, light, and handling requirements.

---

## Data Model

**Note**: The interfaces shown below are **conceptual data models** used to communicate business requirements. They are NOT intended to be copied directly into code. Developers should use these as a guide to understand the required data structure and then implement using appropriate technologies and patterns for the technical stack.

### Product Entity

**Purpose**: Central entity representing a product item that can be purchased, stored, used in recipes, or sold. Contains all master data for the product including classification, units, costs, and operational settings.

**Conceptual Structure**:

```typescript
interface Product {
  // Primary identification
  id: string;                          // UUID primary key
  productCode: string;                 // Unique product identifier (max 50 chars)

  // Descriptions
  englishDescription: string;          // English product name (max 255, required)
  localDescription: string;            // Local language name (max 255, optional)

  // Classification
  categoryId: string;                  // FK to Category (level 1)
  category?: Category;                 // Navigation to Category entity
  subcategoryId: string;               // FK to Subcategory (level 2)
  subcategory?: Category;              // Navigation to Subcategory entity
  itemGroupId: string;                 // FK to Item Group (level 3)
  itemGroup?: Category;                // Navigation to Item Group entity
  categoryPath: string;                // Computed full path: "Food/Beverages/Coffee"

  // Units
  inventoryUnitId: string;             // FK to Unit (base unit, required)
  inventoryUnit?: Unit;                // Navigation to inventory unit
  defaultOrderUnitId: string;          // FK to Unit (default for POs, optional)
  defaultOrderUnit?: Unit;             // Navigation to default order unit
  orderUnits: ProductUnit[];           // Collection of order units with conversion rates
  ingredientUnits: ProductUnit[];      // Collection of ingredient units with conversion rates (for recipes)

  // Cost and Pricing
  standardCost: number;                // Planned/target cost in base currency (2 decimals)
  lastReceivingCost: number;           // Most recent GRN cost (2 decimals, read-only)
  lastReceivingDate: Date;             // Date of last GRN (for cost context)
  lastReceivingVendor: string;         // Vendor from last GRN
  priceDeviation: number;              // Allowed price variance % (0-100, 2 decimals)
  quantityDeviation: number;           // Allowed quantity variance % (0-100, 2 decimals)

  // Tax Configuration
  taxType: 'ADDED' | 'INCLUDED' | 'NONE'; // Tax calculation method
  taxRate: number;                     // Tax percentage (0-100, 2 decimals)

  // Product Identification
  barcode: string;                     // Primary barcode (max 50 chars, optional)

  // Product Types
  isIngredient: boolean;               // True if product is recipe ingredient (enables Ingredient Units tab)
  isForSale: boolean;                  // True if product can be sold to customers

  // Location Assignments
  locationAssignments: ProductLocationAssignment[]; // Locations where product is available with thresholds, shelves, and tags

  // Additional Attributes
  attributes: ProductAttribute[];      // Flexible key-value attributes

  // Status
  isActive: boolean;                   // Active/Inactive status (default true)

  // Audit fields
  createdAt: Date;                     // Creation timestamp (auto)
  createdBy: string;                   // Creator user ID (FK to users)
  updatedAt: Date;                     // Last update timestamp (auto)
  updatedBy: string;                   // Last updater user ID (FK to users)
  deletedAt: Date | null;              // Soft delete timestamp (null if active)
  deletedBy: string | null;            // Soft delete user ID (null if active)

  // Relations
  purchaseOrders: PurchaseOrderLine[]; // Collection of PO lines for this product
  goodsReceipts: GoodsReceiptLine[];   // Collection of GRN lines for this product
  recipeIngredients: RecipeIngredient[]; // Collection of recipes using this product
  inventoryTransactions: InventoryTransaction[]; // Collection of inventory movements
  activityLog: ProductActivityLog[];   // Complete audit trail
}
```

### ProductUnit Entity

**Purpose**: Represents a unit of measure assigned to a product for ordering or ingredient purposes, with conversion rate to the base inventory unit.

```typescript
interface ProductUnit {
  id: string;                          // UUID primary key
  productId: string;                   // FK to Product (required)
  product?: Product;                   // Navigation property
  unitId: string;                      // FK to Unit master data (required)
  unit?: Unit;                         // Navigation property
  unitType: 'INVENTORY' | 'ORDER' | 'RECIPE'; // Unit classification (RECIPE = ingredient units)
  conversionRate: number;              // Conversion factor to base unit (5 decimals, positive, non-zero)
  description: string;                 // Description of the unit (e.g., "Kilogram", "Box of 12")
  isDefault: boolean;                  // True if default unit for this type (only one per unitType per product)
  isInverse: boolean;                  // Controls conversion direction calculation

  // Conversion calculation based on isInverse flag:
  // When isInverse = true:  1 BaseUnit = (1 / factor) × ThisUnit (e.g., 1 KG = 1000 G)
  // When isInverse = false: 1 ThisUnit = factor × BaseUnit (standard direction)

  // Available units by type:
  // ORDER: BAG, BOX, CASE, PALLET, PACK
  // RECIPE (Ingredient): G, KG, LB, OZ

  // Audit
  createdAt: Date;                     // Creation timestamp
  createdBy: string;                   // Creator user ID
}
```

### ProductLocationAssignment Entity

**Purpose**: Represents product availability at a specific store/location with comprehensive inventory thresholds, shelf assignment, and custom tags for that location.

```typescript
interface ProductLocationAssignment {
  id: string;                          // UUID primary key
  productId: string;                   // FK to Product (required)
  product?: Product;                   // Navigation property

  // Location reference
  locationId: string;                  // FK to Store/Location (required)
  locationName: string;                // Denormalized location name for display
  locationCode: string;                // Denormalized location code for display

  // Shelf assignment
  shelfId: string;                     // FK to Shelf within location (optional)
  shelfName: string;                   // Denormalized shelf name for display

  // Inventory thresholds
  minQuantity: number;                 // Min inventory threshold (3 decimals, >= 0, default 0)
  maxQuantity: number;                 // Max inventory threshold (3 decimals, > min, default 0)
  reorderPoint: number;                // Quantity triggering reorder alerts (>= 0, <= max, default 0)
  parLevel: number;                    // PAR level - standard stock quantity (3 decimals, >= 0, default 0)

  // Custom tags for categorization
  tags?: string[];                     // Array of tag IDs/names for this location assignment

  // Audit
  createdAt: Date;                     // Assignment timestamp
  createdBy: string;                   // Assigner user ID
  updatedAt: Date;                     // Last update timestamp
  updatedBy: string;                   // Last updater user ID
}

// Supporting entity for location-specific tags
interface LocationTag {
  id: string;                          // UUID primary key
  name: string;                        // Tag name (e.g., "High Priority", "Seasonal")
  color: string;                       // Tag color (e.g., "red", "blue", "green")
  locationId: string;                  // FK to Location - tags are location-specific

  // Available colors: red, orange, amber, yellow, lime, green, emerald,
  //                   teal, cyan, sky, blue, indigo, violet, purple,
  //                   fuchsia, pink, rose
}

// Supporting entity for location shelves
interface Shelf {
  id: string;                          // UUID primary key
  name: string;                        // Shelf name (e.g., "Shelf A", "Cold Storage 1")
  code: string;                        // Shelf code for quick reference
  locationId: string;                  // FK to Location - shelves belong to specific locations
}
```

### ProductAttribute Entity

**Purpose**: Flexible key-value storage for product-specific attributes not covered by standard schema fields.

```typescript
interface ProductAttribute {
  id: string;                          // UUID primary key
  productId: string;                   // FK to Product (required)
  product?: Product;                   // Navigation property
  attributeKey: string;                // Attribute name (max 100 chars, e.g., "Weight")
  attributeValue: string;              // Attribute value (max 500 chars, stored as string)
  dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'TEXTAREA'; // Data type for validation/display
  displayOrder: number;                // Sort order for display (integer)

  // Audit
  createdAt: Date;                     // Creation timestamp
  createdBy: string;                   // Creator user ID
  updatedAt: Date;                     // Last update timestamp
  updatedBy: string;                   // Last updater user ID
}
```

### ProductActivityLog Entity

**Purpose**: Comprehensive audit trail of all product data changes for compliance and analysis.

```typescript
interface ProductActivityLog {
  id: string;                          // UUID primary key
  productId: string;                   // FK to Product (required)
  product?: Product;                   // Navigation property
  userId: string;                      // FK to User who performed action
  user?: User;                         // Navigation property
  activityDate: Date;                  // Timestamp of activity (timestamptz)
  activityType: 'CREATED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGED' |
                'UNIT_ADDED' | 'UNIT_CHANGED' | 'UNIT_REMOVED' |
                'STORE_ASSIGNED' | 'STORE_REMOVED' | 'COST_CHANGED'; // Action type
  description: string;                 // Human-readable summary (max 500 chars)
  fieldName: string;                   // Name of field changed (null for create/delete)
  oldValue: string;                    // Previous value (serialized, max 1000 chars)
  newValue: string;                    // New value (serialized, max 1000 chars)
  ipAddress: string;                   // IP address of user (for security audit)
  userAgent: string;                   // Browser/client info (max 255 chars)
}
```

---

## Integration Points

### Internal Integrations

- **Categories Module**: Products depend on three-level category hierarchy for classification. Category changes may impact multiple products inheriting deviation limits.

- **Units Module**: Products reference units master data for inventory, order, and recipe units. Unit changes may impact products using those units.

- **Procurement Module**: Products are selected in Purchase Requests and Purchase Orders. Cost and unit data flows from products to procurement transactions.

- **Goods Receipt (GRN) Module**: GRN transactions update product Last Receiving Cost and create purchase history records.

- **Inventory Management Module**: Products are central to all inventory transactions (receipts, issues, adjustments, transfers). Inventory Unit is base unit for stock tracking.

- **Recipe Management Module**: Products flagged as "Used in Recipes" are available as ingredients. Recipe Units with conversion rates support recipe calculations.

- **Store Operations Module**: Products assigned to stores with min/max thresholds support store requisitions and stock level monitoring.

- **Sales Module**: Products flagged as "Sold Directly" are available for sales orders and POS transactions.

- **Finance Module**: Product cost data (Standard Cost, Last Receiving Cost) integrates with cost accounting and financial reporting. Tax configuration flows to invoicing.

- **Vendor Management Module**: Purchase history links products to vendors for supplier analysis and negotiations.

### External Integrations

- **Barcode Scanning Devices**: Product barcodes integrated with handheld scanners and POS systems for inventory operations and sales.

- **Accounting Systems**: Product cost and price data may sync to external accounting/ERP systems for consolidated financial reporting.

### Data Dependencies

- **Depends On**:
  - Categories (all three levels for product classification)
  - Units (for inventory, order, recipe unit definitions)
  - Stores/Locations (for product availability and thresholds)
  - Users (for audit trail of who created/modified products)
  - Tax Master Data (for standard tax codes and rates)

- **Used By**:
  - Purchase Requests (product selection)
  - Purchase Orders (product procurement)
  - Goods Receipt Notes (product receiving)
  - Recipes (as ingredients)
  - Sales Orders (for direct sales)
  - Inventory Transactions (all stock movements)
  - Store Requisitions (inter-store transfers)
  - Reports and Analytics (product-based reporting)

---

## Non-Functional Requirements

### Performance

- **NFR-PROD-001**: Product list page shall load within 3 seconds with up to 100 records displayed in table format with sorting and pagination enabled.

- **NFR-PROD-002**: Product detail page shall load within 2 seconds including all related data (units, store assignments, attributes, latest costs).

- **NFR-PROD-003**: Product search shall return results within 1 second for type-ahead search with 300ms debounce delay.

- **NFR-PROD-004**: Latest Purchase popup shall load within 3 seconds displaying 10 most recent POs and 10 most recent GRNs.

- **NFR-PROD-005**: Bulk import shall process at least 1000 product records within 30 seconds including validation and database insert operations.

### Security

- **NFR-PROD-006**: All product operations require authentication. Anonymous access denied.

- **NFR-PROD-007**: Product creation, update, and deletion operations require role-based permissions: create_product, update_product, delete_product respectively.

- **NFR-PROD-008**: Sensitive cost information (Standard Cost, Last Receiving Cost) accessible only to users with view_product_costs permission.

- **NFR-PROD-009**: All product data changes logged to activity log with user ID, timestamp, and IP address for security audit trail.

- **NFR-PROD-010**: Product deletion is soft delete only (no physical deletion) to maintain referential integrity and audit trail. Hard delete requires database administrator access.

### Usability

- **NFR-PROD-011**: Product list page shall be responsive and usable on desktop (1920×1080), tablet (1024×768), and mobile (375×667) screen sizes.

- **NFR-PROD-012**: All product forms shall follow WCAG 2.1 Level AA accessibility guidelines including keyboard navigation, screen reader support, and sufficient color contrast.

- **NFR-PROD-013**: Required form fields shall be clearly marked with red asterisk (*) and validated before submission with clear error messages.

- **NFR-PROD-014**: Product search shall provide auto-complete suggestions showing product code and description as user types.

- **NFR-PROD-015**: All monetary values displayed with currency symbol, thousand separators, and 2 decimal places (e.g., $1,234.56).

### Reliability

- **NFR-PROD-016**: Product module shall achieve 99.9% uptime during business hours (8 AM - 6 PM local time, Monday-Friday).

- **NFR-PROD-017**: All product data changes shall be transactional with automatic rollback on failure to ensure data consistency.

- **NFR-PROD-018**: Product database shall be backed up daily with point-in-time recovery capability (RPO <= 1 hour, RTO <= 4 hours).

- **NFR-PROD-019**: Product data integrity validated with CHECK constraints, FOREIGN KEY constraints, and NOT NULL constraints at database level.

- **NFR-PROD-020**: Error conditions shall display user-friendly messages with actionable guidance, not technical stack traces.

### Scalability

- **NFR-PROD-021**: Product module shall support at least 10,000 active products with linear performance degradation.

- **NFR-PROD-022**: Product list pagination and filtering shall maintain sub-3-second load times with up to 50,000 total products in database.

- **NFR-PROD-023**: Product search index shall be optimized for full-text search across product code, descriptions, and barcodes with sub-second response.

---

## Success Metrics

### Efficiency Metrics

- **Product Creation Time**: Average time to create new product reduced from 5 minutes (manual entry in spreadsheet) to 2 minutes (in-system with validation)
- **Product Search Time**: Average time to locate product reduced from 30 seconds (manual spreadsheet search) to 3 seconds (type-ahead search)
- **Purchase History Access**: Time to view product purchase history reduced from 5 minutes (querying multiple systems) to 10 seconds (integrated Latest Purchase view)
- **Data Entry Error Rate**: Product data entry errors reduced by 60% through validation, dropdowns, and auto-calculations

### Quality Metrics

- **Data Accuracy**: Product master data accuracy improved to 99.5% (from 95% in manual system) through validation rules and constraint enforcement
- **Data Completeness**: Mandatory field completion rate maintained at 100% through form validation preventing submission with missing data
- **Data Consistency**: Product data consistency across modules improved to 99.9% through centralized master data repository

### Adoption Metrics

- **User Adoption Rate**: 90% of procurement and inventory staff actively using product module within 3 months of go-live
- **Feature Utilization**: 80% of products have complete data (all optional fields populated) within 6 months
- **User Satisfaction**: 85% positive satisfaction score in post-implementation survey (ease of use, time savings, data access)

### Business Impact Metrics

- **Time Savings**: 10 hours per week saved across procurement and inventory teams through faster product lookup and data access
- **Cost Savings**: $20,000 annual savings from reduced data entry errors and improved procurement decision-making
- **Data Quality ROI**: 50% reduction in time spent resolving data quality issues and discrepancies
- **Process Efficiency**: 30% reduction in time from product request to product availability in system

---

## Dependencies

### Module Dependencies

- **Categories Module**: Required for three-level product classification. Products cannot be created without valid category hierarchy.

- **Units Module**: Required for product unit definitions. Products must have inventory unit and optionally order/recipe units.

- **Users Module**: Required for authentication, authorization, and audit trail (created_by, updated_by fields).

- **Stores Module**: Required for store/location assignments and inventory thresholds.

### Technical Dependencies

- **Database**: PostgreSQL 14+ for robust ACID transactions, foreign key constraints, and full-text search capabilities.

- **Authentication Service**: User authentication and authorization system for role-based access control.

- **Audit Logging Service**: Centralized logging service for product activity tracking.

### Data Dependencies

- **Category Master Data**: Three-level category hierarchy must exist before products can be assigned.

- **Unit Master Data**: Units must be defined before products can reference them for inventory/order/recipe purposes.

- **Store Master Data**: Stores/locations must exist before products can be assigned with inventory thresholds.

- **User Master Data**: Users must exist for audit trail and activity logging.

---

## Assumptions and Constraints

### Assumptions

- Products are uniquely identified by product code which remains immutable after creation for referential integrity.

- All product costs and prices are maintained in system base currency with currency conversion handled at transaction level.

- Product categorization follows strict three-level hierarchy with each level mandatory for complete classification.

- Inventory unit (base unit) is the fundamental unit for all stock tracking with all other units converted to/from it.

- Product master data changes are infrequent (weekly) compared to transaction volume (daily), so real-time synchronization overhead is acceptable.

- Users have basic computer literacy and can navigate web-based forms, dropdowns, and tables.

### Constraints

- Product codes limited to 50 characters due to UI display constraints and database index size limits.

- Description fields limited to 255 characters for English and local descriptions based on UI layout and typical usage patterns.

- Maximum 100 order units and 100 recipe units per product to prevent UI performance degradation.

- Maximum 50 store assignments per product as products are typically available in subset of locations.

- Conversion rates limited to 5 decimal precision balancing accuracy with storage efficiency.

- Activity log retention is indefinite (no automatic purging) which may impact long-term database size.

### Risks

- **Risk**: Product code uniqueness enforcement may cause issues during data migration if legacy systems have duplicate codes.
  - **Mitigation**: Provide data quality pre-check tool and bulk code reassignment utility during migration.

- **Risk**: Performance degradation with very large product catalogs (> 50,000 products) due to full-text search and complex joins.
  - **Mitigation**: Implement database indexing optimization, query caching, and pagination. Monitor query performance metrics.

- **Risk**: User resistance to change from existing manual/spreadsheet-based product management processes.
  - **Mitigation**: Conduct comprehensive user training, provide quick reference guides, and ensure system is more efficient than legacy process.

- **Risk**: Data quality issues during initial data migration may require significant cleanup effort.
  - **Mitigation**: Implement data validation tools, provide migration staging environment for testing, and allocate dedicated time for data cleansing.

- **Risk**: Integration complexity with multiple dependent modules (procurement, inventory, recipes) may cause implementation delays.
  - **Mitigation**: Implement phased rollout starting with standalone product master, then add integrations incrementally.

---

## Future Enhancements

### Phase 2 Enhancements

- **Product Images**: Support upload and display of product images for better visual identification in UI and on shelf labels.

- **Multiple Barcodes**: Support primary and alternate barcodes per product for products sold in different package sizes.

- **Product Variants**: Support product variants (size, color, flavor) with shared master data and variant-specific attributes.

- **Pricing Module Integration**: Integrate with dedicated pricing module for customer-specific price lists, contracts, and promotions.

- **Supplier Catalog Integration**: Sync product data with supplier catalogs for automated product updates and new product discovery.

### Future Considerations

- **Forecasting Integration**: Integrate product data with demand forecasting module for automated reorder point calculations.

- **Quality Management**: Add quality control attributes (inspection requirements, quality grades, defect tracking).

- **Sustainability Metrics**: Track environmental impact data (carbon footprint, packaging materials, recyclability).

- **Product Lifecycle Management**: Track product status through lifecycle stages (development, active, phase-out, discontinued).

- **Compliance Management**: Track regulatory compliance (certifications, allergen information, nutritional data) for food safety.

- **Multi-language Support**: Extend description fields to support unlimited languages with user-selectable display language.

- **Product Bundling**: Support bundle/kit products composed of multiple component products for hospitality packages.

---

## Glossary

- **Product**: A distinct item that can be purchased, stored, used in recipes, or sold directly to customers in hospitality operations.

- **Product Code**: Unique alphanumeric identifier for a product, immutable after creation, used as business key across all transactions.

- **Inventory Unit**: The base unit of measure for stock tracking. All other units are converted to/from this unit. Also called "base unit".

- **Order Unit**: Unit of measure used when purchasing a product from vendors, with conversion rate to inventory unit. Available order units include BAG, BOX, CASE, PALLET, PACK.

- **Ingredient Unit**: Unit of measure used when the product is an ingredient in recipes, with conversion rate to inventory unit. Available ingredient units include G (Gram), KG (Kilogram), LB (Pound), OZ (Ounce). Also referred to as "Recipe Unit" in unit type classification.

- **Conversion Rate**: Numeric factor to convert between units. Example: 1 Box = 12 Each means conversion rate is 12.00000.

- **Standard Cost**: Planned or target cost for a product, used for budgeting and variance analysis.

- **Last Receiving Cost**: Actual unit cost from the most recent goods receipt transaction, used for current cost tracking.

- **Price Deviation**: Maximum allowed percentage variance between purchase order price and standard cost before requiring approval.

- **Quantity Deviation**: Maximum allowed percentage variance between goods receipt quantity and purchase order quantity before requiring approval.

- **Tax Type**: Method of tax calculation - "Added Tax" (tax on top of price), "Included Tax" (tax embedded in price), or "None" (no tax).

- **Product Type**: Classification of product usage based on isIngredient and isForSale flags - ingredient (recipe item), for sale (retail product), both, or neither (stock-only).

- **Location Assignment**: Configuration linking product to specific store/location with comprehensive inventory thresholds (min/max quantities, reorder point, PAR level), shelf assignment, and custom tags.

- **PAR Level**: Periodic Automatic Replacement level - the standard stock quantity that should be maintained at a location for optimal operations.

- **Reorder Point**: The inventory quantity at which a reorder alert is triggered to replenish stock.

- **Location Tag**: A custom label with color that can be applied to product-location assignments for categorization and filtering. Tags are location-specific.

- **Shelf**: A storage location within a store/location where products are physically stored. Shelves are location-specific.

- **isInverse**: A flag on unit conversions that controls the direction of calculation. When true, the conversion formula is inverted (1 BaseUnit = 1/factor × ThisUnit).

- **Activity Log**: Audit trail recording all product data changes with user, timestamp, action type, and field-level details.

- **Soft Delete**: Logical deletion by setting deleted_at timestamp rather than physical removal, preserving data for audit and history.

- **Base Currency**: Primary currency for the ERP system in which all product costs and prices are maintained.

- **Barcode**: Machine-readable identifier (EAN-13, UPC, Code 128) for product, used in scanning operations and POS.

---

## Related Documents

- **Categories Documentation**: [BR-categories.md](../categories/BR-categories.md), [TS-categories.md](../categories/TS-categories.md), [DS-categories.md](../categories/DS-categories.md)
- **Units Documentation**: [BR-units.md](../units/BR-units.md), [TS-units.md](../units/TS-units.md), [DS-units.md](../units/DS-units.md)
- **Product Master PRD**: /docs/product-management/product-master-prd.md
- **Business Analysis**: /docs/business-analysis/product-ba.md
- **API Endpoints**: /docs/product-management/PROD-API-Endpoints-Products.md

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Business Analyst | | | |
| Development Lead | | | |
| QA Lead | | | |
| Operations Manager | | | |

---

**Document End**
