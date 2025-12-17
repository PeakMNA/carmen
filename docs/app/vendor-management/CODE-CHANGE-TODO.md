# Code Changes for Vendor Management Redesign (ARC-2024-001)

**ARC Reference**: [ARC-2024-001-vendor-management-redesign.md](./ARC-2024-001-vendor-management-redesign.md)
**Version**: 1.1.0
**Last Updated**: 2025-11-17
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Total Tasks**: 91
**Estimated Effort**: 39 Story Points / 10 weeks

## Implementation Phases

- **Phase 1**: Documentation (Weeks 1-2) - Complete
- **Phase 2**: Backend Implementation (Weeks 3-5) - Tasks below
- **Phase 3**: Frontend Implementation (Weeks 6-8) - Tasks below
- **Phase 4**: Testing & Deployment (Weeks 9-10) - Tasks below

---

# PHASE 2: BACKEND IMPLEMENTATION (Weeks 3-5)

## 1. Database Schema Changes

### Price Lists Table

- [ ] **DB-001**: Add effective date range fields
  - **Add**: `effective_start_date` (DATE, NOT NULL) - Price list effective start date
  - **Add**: `effective_end_date` (DATE, OPTIONAL) - Price list effective end date (null = open-ended)
  - **Validation**: If `effective_end_date` provided, must be >= `effective_start_date`
  - **Replaces**: valid_start_date, valid_end_date
  - **Query Logic**: Active = `effective_start_date <= CURRENT_DATE AND (effective_end_date IS NULL OR effective_end_date >= CURRENT_DATE)`

- [ ] **DB-002**: Add `currency_code` field (String(3), Required)
  - Type: VARCHAR(3)
  - Required: true
  - Default: 'USD'
  - Description: ISO 4217 currency code

- [ ] **DB-003**: Remove `valid_start_date` field
  - Drop column from price_lists table
  - Data migration: Copy to effective_date if implementing on existing data

- [ ] **DB-004**: Remove `valid_end_date` field
  - Drop column from price_lists table

- [ ] **DB-005**: Remove `category_id` field
  - Drop column and foreign key constraint
  - Remove index on category_id if exists

- [ ] **DB-006**: Remove `performance_summary` field
  - Drop column from price_lists table

- [ ] **DB-007**: Update `status` enum values
  - Modify enum to replace 'expired' with 'inactive'
  - Enum values: ('active', 'inactive', 'draft')

### Price List Items Table

- [ ] **DB-008**: Add `is_foc` field (Boolean, Default: false)
  - Type: BOOLEAN
  - Required: true
  - Default: false
  - Description: Free of Charge flag

- [ ] **DB-009**: Add `tax_profile_id` field (String/FK, Optional)
  - Type: VARCHAR or UUID
  - Required: false
  - Foreign Key: references tax_profiles.id
  - Description: Reference to tax profile

- [ ] **DB-010**: Add `tax_rate` field (Decimal, Optional)
  - Type: DECIMAL(5,2)
  - Required: false
  - Description: Tax rate percentage (e.g., 10.00 for 10%)

- [ ] **DB-011**: Add `is_preferred_vendor` field (Boolean, Default: false)
  - Type: BOOLEAN
  - Required: true
  - Default: false
  - Description: Preferred vendor flag for this item

- [ ] **DB-012**: Add `product_identifier` field (String, Required)
  - Type: VARCHAR(255)
  - Required: true
  - Description: Combined product number and name (format: "{number} - {name}")

- [ ] **DB-013**: Remove `vat_amount` field
  - Drop column from price_list_items table

- [ ] **DB-014**: Remove `product_name` field
  - Drop column (replaced by product_identifier)

- [ ] **DB-015**: Remove `product_number` field
  - Drop column (replaced by product_identifier)

- [ ] **DB-016**: Modify `lead_time` field to nullable
  - ALTER COLUMN lead_time DROP NOT NULL

- [ ] **DB-017**: Modify `description` field to required
  - ALTER COLUMN description SET NOT NULL
  - Description: Now primary display field

### Request for Pricing Table

- [ ] **DB-018**: Remove `approval_status` field
  - Drop column from requests_for_pricing table

- [ ] **DB-019**: Remove `submission_method` field
  - Drop column from requests_for_pricing table

- [ ] **DB-020**: Remove `performance_summary` field
  - Drop column from requests_for_pricing table (if exists)

### Indexes and Constraints

- [ ] **DB-021**: Create index on `price_lists.effective_start_date` and `effective_end_date`
  - For efficient date range queries
  - Composite index: `(effective_start_date, effective_end_date)`

- [ ] **DB-022**: Create index on `price_lists.currency_code`
  - For currency filtering

- [ ] **DB-023**: Create index on `price_list_items.is_foc`
  - For FOC item filtering

- [ ] **DB-024**: Create index on `price_list_items.is_preferred_vendor`
  - For preferred vendor filtering

- [ ] **DB-025**: Add foreign key constraint for `tax_profile_id`
  - If tax profile table exists

- [ ] **DB-026**: Remove old indexes on deleted columns
  - Drop indexes on valid_start_date, valid_end_date, category_id, vat_amount

---

## 2. TypeScript Type Updates

### Core Type Definitions (lib/types/vendor.ts or similar)

- [ ] **TYPE-001**: Update `PriceList` interface
  ```typescript
  interface PriceList {
    // Add fields
    effective_start_date: Date; // Required - Start of effective date range
    effective_end_date: Date | null; // Optional - End of effective date range (null = open-ended)
    currency_code: string;

    // Remove fields
    // valid_start_date: Date; // REMOVE
    // valid_end_date: Date; // REMOVE
    // category_id: string; // REMOVE
    // performance_summary: string; // REMOVE

    // Modify fields
    status: 'active' | 'inactive' | 'draft'; // Update enum
  }
  ```

- [ ] **TYPE-002**: Update `PriceListItem` interface
  ```typescript
  interface PriceListItem {
    // Add fields
    product_identifier: string;
    is_foc: boolean;
    tax_profile_id?: string;
    tax_rate?: number;
    is_preferred_vendor: boolean;

    // Remove fields
    // product_name: string; // REMOVE
    // product_number: string; // REMOVE
    // vat_amount: number; // REMOVE

    // Modify fields
    lead_time?: number; // Make optional
    description: string; // Now required
  }
  ```

- [ ] **TYPE-003**: Update `RequestForPricing` interface
  ```typescript
  interface RequestForPricing {
    // Remove fields
    // approval_status: string; // REMOVE
    // submission_method: string; // REMOVE
    // performance_summary: string; // REMOVE
  }
  ```

- [ ] **TYPE-004**: Create or update `TaxProfile` type
  ```typescript
  interface TaxProfile {
    id: string;
    name: string;
    tax_rate: number;
    tax_type: string;
    description?: string;
  }
  ```

- [ ] **TYPE-005**: Update `PriceListStatus` enum
  ```typescript
  enum PriceListStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive', // Changed from 'expired'
    DRAFT = 'draft'
  }
  ```

- [ ] **TYPE-006**: Create `ImportResult` type
  ```typescript
  interface ImportResult {
    success: boolean;
    total_rows: number;
    successful_imports: number;
    failed_imports: number;
    errors: ImportError[];
  }

  interface ImportError {
    row: number;
    field: string;
    error: string;
  }
  ```

- [ ] **TYPE-007**: Update form types for price list create/edit
  - Update Zod schemas or form types to match new interface

---

## 3. API / Server Actions

### Price List Actions (app/(main)/vendor-management/price-lists/actions.ts)

- [ ] **API-001**: Update `createPriceList` action
  - Add `effective_start_date` parameter (required)
  - Add `effective_end_date` parameter (optional, null = open-ended)
  - Add `currency_code` parameter
  - Add validation: `effective_end_date >= effective_start_date` (when provided)
  - Remove `valid_start_date`, `valid_end_date`, `category_id`, `performance_summary`
  - Update validation schema

- [ ] **API-002**: Update `updatePriceList` action
  - Same field changes as createPriceList
  - Update validation schema

- [ ] **API-003**: Update `getPriceLists` query
  - Add `currency_code` to select
  - Add `effective_start_date` to select
  - Add `effective_end_date` to select
  - Remove deleted fields from select
  - Update status enum handling
  - Add filter option for current price lists: `effective_start_date <= CURRENT_DATE AND (effective_end_date IS NULL OR effective_end_date >= CURRENT_DATE)`

- [ ] **API-004**: Update `getPriceListById` query
  - Update field selection to match new schema

- [ ] **API-005**: Update `markPriceListInactive` action
  - Rename from `markPriceListExpired` (if exists)
  - Update status value from 'expired' to 'inactive'

- [ ] **API-006**: Create `importPriceListItems` action
  - Accept Excel/CSV file upload
  - Parse file data
  - Validate each row
  - Bulk insert items
  - Return `ImportResult`

- [ ] **API-007**: Update `createPriceListItem` action
  - Add `product_identifier`, `is_foc`, `tax_profile_id`, `tax_rate`, `is_preferred_vendor`
  - Remove `product_name`, `product_number`, `vat_amount`
  - Make `lead_time` optional
  - Ensure `description` is required

- [ ] **API-008**: Update `updatePriceListItem` action
  - Same field changes as createPriceListItem

### Request for Pricing Actions (app/(main)/vendor-management/requests-for-pricing/actions.ts)

- [ ] **API-009**: Update `createRequestForPricing` action
  - Remove `approval_status`, `submission_method`, `performance_summary`
  - Update validation schema

- [ ] **API-010**: Update `updateRequestForPricing` action
  - Remove approval-related parameters
  - Simplify workflow

- [ ] **API-011**: Remove approval workflow actions
  - Remove `approveRequest`, `rejectRequest` (if they exist)

### Vendor Portal Actions

- [ ] **API-012**: Update vendor portal price list display API
  - Add `effective_start_date` to response (required)
  - Add `effective_end_date` to response (optional, null = open-ended)
  - Add `is_foc`, `tax_rate`, `tax_profile_id` to items
  - Add `product_identifier` to items
  - Remove deleted fields (valid_start_date, valid_end_date, product_name, vat_amount)
  - Return date range in vendor-friendly format

- [ ] **API-013**: Update vendor portal price list submission API
  - Accept `effective_start_date` (required)
  - Accept `effective_end_date` (optional)
  - Validate date range: `effective_end_date >= effective_start_date` (when provided)
  - Validate `effective_start_date` not in past
  - Accept item-level fields: `is_foc`, `tax_rate`, `is_preferred_vendor`

---

## 4. Validation Schemas (Zod)

### Price List Validation

- [ ] **VAL-001**: Update price list creation schema
  ```typescript
  const createPriceListSchema = z.object({
    effective_start_date: z.date().refine(
      (date) => date >= new Date(),
      { message: 'Effective start date cannot be in the past' }
    ),
    effective_end_date: z.date().nullable().optional().refine(
      (date, ctx) => {
        if (!date) return true; // null/undefined is valid (open-ended)
        const startDate = ctx.parent.effective_start_date;
        return date >= startDate;
      },
      { message: 'Effective end date must be on or after start date' }
    ),
    currency_code: z.string().length(3).toUpperCase(),
    status: z.enum(['active', 'inactive', 'draft']),
    // Remove: valid_start_date, valid_end_date, category_id, performance_summary
  });
  ```

- [ ] **VAL-002**: Update price list update schema
  - Same as creation schema

- [ ] **VAL-003**: Update price list item schema
  ```typescript
  const priceListItemSchema = z.object({
    product_identifier: z.string().min(1).max(255),
    description: z.string().min(1),
    is_foc: z.boolean().default(false),
    tax_profile_id: z.string().uuid().optional(),
    tax_rate: z.number().min(0).max(100).optional(),
    is_preferred_vendor: z.boolean().default(false),
    lead_time: z.number().int().positive().optional(),
    // Remove: product_name, product_number, vat_amount
  });
  ```

- [ ] **VAL-004**: Create import file validation schema
  ```typescript
  const importItemSchema = z.object({
    product_identifier: z.string().min(1),
    description: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().min(1),
    unit_price: z.number().positive(),
    currency: z.string().length(3),
    is_foc: z.boolean().optional(),
    tax_rate: z.number().min(0).max(100).optional(),
    lead_time: z.number().int().positive().optional(),
    is_preferred_vendor: z.boolean().optional(),
  });
  ```

### Request for Pricing Validation

- [ ] **VAL-005**: Update request for pricing schema
  - Remove `approval_status`, `submission_method`, `performance_summary` fields
  - Simplify validation

---

## 5. Business Logic Updates

- [ ] **LOGIC-001**: Update price list effective date range logic
  - Function to check if price list is currently effective: `isPriceListEffective(priceList)`
  - Logic: `effective_start_date <= CURRENT_DATE AND (effective_end_date IS NULL OR effective_end_date >= CURRENT_DATE)`
  - Handle open-ended price lists (null effective_end_date)
  - Date comparison utilities for date range validation

- [ ] **LOGIC-002**: Remove approval workflow logic
  - Remove approval state machine
  - Remove approval notification emails
  - Simplify submission flow

- [ ] **LOGIC-003**: Update status change logic
  - Change terminology from "expire" to "mark inactive"
  - Update status transition rules

- [ ] **LOGIC-004**: Implement file import logic
  - Excel parser (use library like xlsx or exceljs)
  - CSV parser (use library like papaparse)
  - Row-by-row validation
  - Bulk insert with transaction
  - Error collection and reporting

- [ ] **LOGIC-005**: Update tax calculation logic
  - Support tax_profile_id lookup
  - Fallback to tax_rate if profile not available
  - Handle FOC items (is_foc = true, tax = 0)

- [ ] **LOGIC-006**: Implement vendor preference logic
  - Queries to filter by preferred vendor
  - Display indicators in UI

---

# PHASE 3: FRONTEND IMPLEMENTATION (Weeks 6-8)

## 6. Frontend Components - Price Lists

### List Page (app/(main)/vendor-management/price-lists/page.tsx)

- [ ] **UI-001**: Update table columns
  - Remove VAT column
  - Add Currency column
  - Update Status badge ('expired' → 'inactive')
  - Add Effective Date Range display (show "Start - End" or "Start - Open" if end is null)

- [ ] **UI-002**: Remove category filter
  - Remove category dropdown from filters

- [ ] **UI-003**: Update search functionality
  - Search by description (not by name)
  - Update search placeholder text

- [ ] **UI-004**: Update sort functionality
  - Sort by effective_start_date instead of valid_start_date
  - Add secondary sort by effective_end_date

### Detail/View Page (app/(main)/vendor-management/price-lists/[id]/page.tsx)

- [ ] **UI-005**: Update effective date range display
  - Display `effective_start_date` (required) and `effective_end_date` (optional)
  - Format: "Effective: {start_date} - {end_date}" or "Effective: {start_date} - Open" if end is null
  - Help text: "Price list is valid from start date until end date (or indefinitely if no end date)"
  - Visual indicator for open-ended price lists

- [ ] **UI-006**: Add FOC indicator
  - Badge or icon for items marked as FOC
  - Display in items table

- [ ] **UI-007**: Add tax profile/rate display
  - Show tax profile name (if linked)
  - Show tax_rate value
  - Handle cases where neither is set

- [ ] **UI-008**: Add preferred vendor indicator
  - Star icon or badge for preferred vendor items

- [ ] **UI-009**: Remove performance summary section
  - Delete entire section from detail page

- [ ] **UI-010**: Update description as primary display
  - Larger font/prominence for description
  - Show product_identifier in smaller text

- [ ] **UI-011**: Add currency display
  - Show currency code prominently
  - Display in header or summary section

### Create/Edit Form (app/(main)/vendor-management/price-lists/create/page.tsx or [id]/edit/page.tsx)

- [ ] **UI-012**: Update effective date range fields
  - Add `effective_start_date` date picker (required)
  - Add `effective_end_date` date picker (optional)
  - Add checkbox/toggle: "Open-ended price list" (sets effective_end_date to null)
  - Remove `valid_start_date` and `valid_end_date` fields
  - Add validation:
    - `effective_start_date` cannot be in past
    - `effective_end_date` must be >= `effective_start_date` (when provided)
  - Visual indication when price list is open-ended

- [ ] **UI-013**: Add currency selector
  - Dropdown with ISO currency codes
  - Default to system default (USD or from settings)

- [ ] **UI-014**: Add import button/functionality
  - "Import from Excel/CSV" button
  - File upload dialog
  - Template download link
  - Import progress indicator
  - Results display (success/errors)

- [ ] **UI-015**: Update price list item form fields
  - **Add**: FOC checkbox
  - **Add**: Tax profile selector (dropdown)
  - **Add**: Tax rate input (if no profile selected)
  - **Add**: Preferred vendor checkbox
  - **Add**: Product identifier field (single field)
  - **Remove**: Product name field (separate)
  - **Remove**: Product number field (separate)
  - **Remove**: VAT amount field
  - **Modify**: Lead time → Optional (add "(optional)" label)

- [ ] **UI-016**: Remove category selector
  - Delete category dropdown component

- [ ] **UI-017**: Update form validation
  - Validate new fields (effective_date, currency_code, is_foc, etc.)
  - Update error messages
  - Make lead_time optional in validation

- [ ] **UI-018**: Update status selector
  - Change "Expired" option to "Inactive"
  - Update status badge color/label

### Import Component (new)

- [ ] **UI-019**: Create import dialog component
  - File upload area (drag & drop)
  - File type validation (xlsx, csv only)
  - File size limit (max 5MB)
  - Template download button

- [ ] **UI-020**: Create import progress component
  - Progress bar
  - Current status display
  - Cancel button

- [ ] **UI-021**: Create import results component
  - Success count display
  - Error list with row numbers and messages
  - Option to download error report
  - Close/Done button

---

## 7. Frontend Components - Request for Pricing

### Create/Edit Form (app/(main)/vendor-management/requests-for-pricing/create/page.tsx)

- [ ] **UI-022**: Remove approval workflow UI
  - Remove approval status display
  - Remove approve/reject buttons
  - Simplify submission flow

- [ ] **UI-023**: Remove submission method selector
  - Delete submission method dropdown

- [ ] **UI-024**: Update form validation
  - Remove approval-related validation

- [ ] **UI-025**: Simplify status workflow
  - Remove approval stages
  - Direct submission

### List Page (app/(main)/vendor-management/requests-for-pricing/page.tsx)

- [ ] **UI-026**: Remove approval status column
  - Update table columns

- [ ] **UI-027**: Update filters
  - Remove approval status filter

---

## 8. Frontend Components - Vendor Portal

### Price List Display (app/(main)/vendor-portal/price-lists/[id]/page.tsx or similar)

- [ ] **UI-028**: Update effective date range display in vendor portal
  - Display both `effective_start_date` and `effective_end_date`
  - Format: "Valid from {start_date} to {end_date}" or "Valid from {start_date} (No end date)" if null
  - Clear, vendor-friendly labeling
  - Visual indicator for open-ended price lists (e.g., "∞" icon or "Ongoing" badge)
  - Help tooltip explaining date range meaning

- [ ] **UI-029**: Add FOC support in vendor portal
  - Display FOC badge/indicator for free items
  - Show "Free of Charge" or "FOC" text clearly
  - Distinguish FOC items visually (different row color or icon)

- [ ] **UI-030**: Add tax profile/rate display in vendor portal
  - Show tax information for each item
  - Display tax_rate percentage if available
  - Display tax_profile name if linked

- [ ] **UI-031**: Remove VAT column from vendor portal
  - Replace with tax rate column
  - Update table headers

- [ ] **UI-032**: Add currency display in vendor portal
  - Show currency code prominently in header
  - Display currency symbol with prices
  - Support multi-currency display

- [ ] **UI-033**: Update item display in vendor portal
  - Show product_identifier (combined format)
  - Emphasize description field
  - Remove separate product_name display

### Vendor Portal Price List Submission Form (app/(main)/vendor-portal/price-lists/submit/page.tsx or similar)

- [ ] **UI-034**: Add effective date range fields to vendor submission form
  - Add `effective_start_date` date picker (required)
    - Label: "Price list valid from"
    - Help text: "Date when these prices become active"
    - Validation: Cannot be in past
  - Add `effective_end_date` date picker (optional)
    - Label: "Price list valid until (optional)"
    - Help text: "Leave blank for open-ended price list"
    - Toggle option: "This price list has no end date"
  - Date range validation:
    - If end date provided, must be >= start date
    - Visual feedback for validation errors
  - Date format: User-friendly, locale-appropriate

- [ ] **UI-035**: Add validation feedback for vendor portal date range
  - Real-time validation as vendor types dates
  - Clear error messages:
    - "Start date cannot be in the past"
    - "End date must be on or after start date"
    - "Invalid date format"
  - Success indicators when dates are valid
  - Prevent form submission if date validation fails

- [ ] **UI-036**: Add vendor portal price list card/list view with date range
  - Display effective date range in price list cards
  - Filter option: "Show only current price lists" (based on date range)
  - Filter option: "Show upcoming price lists"
  - Filter option: "Show all price lists"
  - Visual status indicators:
    - "Current" badge for active price lists
    - "Upcoming" badge for future price lists
    - "Expired" badge for past price lists

---

## 9. Frontend Components - Price List Templates

### Template Form (app/(main)/vendor-management/pricelist-templates/[id]/page.tsx or similar)

- [ ] **UI-034**: Update template fields to match price list changes
  - Add effective_date placeholder
  - Add currency_code field
  - Remove date range fields
  - Add FOC, tax profile options
  - Update product identifier handling

---

## 10. Mock Data Updates

### Mock Price Lists (lib/mock-data/vendors.ts or similar)

- [ ] **MOCK-001**: Update mock price list objects
  - Add `effective_start_date` values (various dates)
  - Add `effective_end_date` values (some with dates, some null for open-ended)
  - Add `currency_code` values (USD, EUR, GBP variety)
  - Remove `valid_start_date`, `valid_end_date`
  - Remove `category_id`
  - Remove `performance_summary`
  - Update status values ('expired' → 'inactive')
  - Create variety:
    - Some current price lists (start <= today, end >= today or null)
    - Some upcoming price lists (start > today)
    - Some expired price lists (end < today)
    - Some open-ended price lists (end = null)

- [ ] **MOCK-002**: Update mock price list items
  - Add `product_identifier` (combine existing name/number)
  - Add `is_foc` (some true, most false)
  - Add `tax_profile_id` (some items)
  - Add `tax_rate` (various rates: 0, 5, 10, 15, 20)
  - Add `is_preferred_vendor` (some true)
  - Remove `product_name`, `product_number` (separate)
  - Remove `vat_amount`
  - Make some `lead_time` null

- [ ] **MOCK-003**: Update mock requests for pricing
  - Remove `approval_status`
  - Remove `submission_method`
  - Remove `performance_summary`

- [ ] **MOCK-004**: Create mock tax profiles
  ```typescript
  const mockTaxProfiles: TaxProfile[] = [
    {
      id: 'tax-profile-001',
      name: 'Standard VAT',
      tax_rate: 10.00,
      tax_type: 'VAT',
      description: 'Standard value-added tax'
    },
    // ... more examples
  ];
  ```

- [ ] **MOCK-005**: Create mock import data (Excel/CSV examples)
  - Sample Excel file with correct columns
  - Sample CSV file with test data
  - Examples with errors for testing validation

---

## 11. UI Component Library Updates

### Custom Components (components/ui/ or app/(main)/vendor-management/components/)

- [ ] **COMP-001**: Create or update DateRangePicker component
  - Start date picker (required)
  - End date picker (optional)
  - "Open-ended" toggle option
  - Validation:
    - Start date cannot be in past
    - End date >= start date (when provided)
  - Visual feedback for validation errors
  - Accessible keyboard navigation
  - Clear/reset functionality

- [ ] **COMP-002**: Create FOC Badge component
  - "FOC" or "Free" badge
  - Consistent styling
  - Tooltip explanation

- [ ] **COMP-003**: Create Tax Profile Selector component
  - Dropdown with tax profiles
  - Option for manual tax rate entry
  - Clear labels

- [ ] **COMP-004**: Update Status Badge component
  - Handle 'inactive' status (replace 'expired')
  - Update colors/icons

- [ ] **COMP-005**: Create Preferred Vendor Indicator component
  - Star icon or badge
  - Tooltip: "Preferred vendor for this item"

- [ ] **COMP-006**: Create Currency Selector component
  - Dropdown with common currencies
  - ISO code display
  - Search/filter functionality

- [ ] **COMP-007**: Update Product Identifier Input component
  - Single field combining number and name
  - Suggested format placeholder: "PROD-001 - Product Name"

- [ ] **COMP-008**: Create Import Button component
  - File upload trigger
  - Loading state
  - Error state

---

# PHASE 4: TESTING & DEPLOYMENT (Weeks 9-10)

## 12. Testing

### Unit Tests

- [ ] **TEST-001**: Server action unit tests
  - Test createPriceList with new fields
  - Test updatePriceList with new fields
  - Test import functionality with various file formats
  - Test validation schemas

- [ ] **TEST-002**: Type validation tests
  - Test all TypeScript interfaces
  - Test Zod schemas with valid/invalid data

- [ ] **TEST-003**: Business logic tests
  - Test effective date logic
  - Test tax calculation (FOC items, tax profiles, tax rates)
  - Test import parsing and error handling

### Integration Tests

- [ ] **TEST-004**: Price list creation E2E
  - Create price list with effective_date
  - Verify all new fields saved correctly
  - Verify old fields removed

- [ ] **TEST-005**: Import functionality E2E
  - Upload Excel file with 100 items
  - Verify all items imported
  - Test error handling (invalid data)
  - Test file size limits
  - Test file type validation

- [ ] **TEST-006**: Request for pricing without approval
  - Submit RFP
  - Verify no approval step
  - Verify direct submission

- [ ] **TEST-007**: Vendor portal display and submission
  - View price list as vendor
  - Verify effective date range display (start + end or start + "Open")
  - Verify FOC items shown correctly
  - Verify tax information displayed
  - Test vendor portal submission form:
    - Submit with both start and end dates
    - Submit with start date only (open-ended)
    - Validate date range validation works
    - Verify error messages for invalid dates
  - Test vendor portal list view filtering:
    - Filter by current price lists
    - Filter by upcoming price lists
    - Verify expired price lists display correctly

- [ ] **TEST-008**: Multi-currency support
  - Create price lists in different currencies
  - Verify currency display in list
  - Verify currency in vendor portal

### Security Tests

- [ ] **TEST-009**: File upload security
  - Test malicious file upload (blocked)
  - Test oversized file (rejected)
  - Test wrong file type (rejected)
  - Test SQL injection in imported data (sanitized)
  - Test XSS in imported data (sanitized)

- [ ] **TEST-010**: Authorization checks
  - Verify only authorized users can import
  - Verify rate limiting on imports

### Performance Tests

- [ ] **TEST-011**: Import performance
  - 1000 items: <5s
  - 5000 items: <20s
  - Memory usage reasonable

- [ ] **TEST-012**: Page load performance
  - Price list list page: <800ms
  - Vendor portal: <750ms

### Accessibility Tests

- [ ] **TEST-013**: Keyboard navigation
  - All forms navigable by keyboard
  - Import dialog accessible

- [ ] **TEST-014**: Screen reader compatibility
  - Form labels properly associated
  - Status badges have aria-labels

### User Acceptance Testing

- [ ] **TEST-015**: UAT with purchasing staff (1 week)
  - Create price list with new workflow
  - Import price list items
  - Mark items as FOC
  - Set preferred vendors
  - Submit request for pricing

- [ ] **TEST-016**: UAT with vendors (portal users)
  - View price list with effective date
  - Understand FOC items
  - View tax information

---

## 13. Documentation

### User Documentation

- [ ] **DOC-001**: Update user manual
  - Effective date concept explanation
  - Import feature guide
  - FOC items usage
  - Tax profile usage
  - Multi-currency support

- [ ] **DOC-002**: Create import template guide
  - Excel template structure
  - CSV template structure
  - Field descriptions
  - Error messages guide

- [ ] **DOC-003**: Create FAQ document
  - "What happened to date ranges?"
  - "How do I import large price lists?"
  - "What is FOC?"
  - "How do tax profiles work?"

- [ ] **DOC-004**: Create training materials
  - Video tutorial: Creating price list with new fields
  - Video tutorial: Importing price list items
  - Quick start guide (PDF)

### Technical Documentation

- [ ] **DOC-005**: Update API documentation
  - Document all changed endpoints
  - Update request/response schemas
  - Add import endpoint documentation

- [ ] **DOC-006**: Update database schema documentation
  - Document all table changes
  - Update ERD diagrams

- [ ] **DOC-007**: Create migration guide (if implementing on existing system)
  - Step-by-step migration procedure
  - Data mapping rules
  - Rollback procedure

### Code Documentation

- [ ] **DOC-008**: Add inline code comments
  - Comment complex import logic
  - Document tax calculation logic
  - Comment effective date comparison logic

- [ ] **DOC-009**: Update README files
  - Update module README with changes
  - Add import feature description

---

## 14. Deployment Tasks

### Pre-Deployment

- [ ] **DEPLOY-001**: Create deployment checklist
- [ ] **DEPLOY-002**: Prepare rollback scripts
- [ ] **DEPLOY-003**: Configure feature flags
- [ ] **DEPLOY-004**: Set up monitoring dashboards
- [ ] **DEPLOY-005**: Prepare user notification emails
- [ ] **DEPLOY-006**: Brief support team
- [ ] **DEPLOY-007**: Schedule deployment window

### Deployment

- [ ] **DEPLOY-008**: Deploy to staging
- [ ] **DEPLOY-009**: Run smoke tests on staging
- [ ] **DEPLOY-010**: Deploy to production (rolling deployment)
- [ ] **DEPLOY-011**: Monitor error rates
- [ ] **DEPLOY-012**: Monitor performance metrics
- [ ] **DEPLOY-013**: Verify integrations working

### Post-Deployment

- [ ] **DEPLOY-014**: Send user notification (deployment complete)
- [ ] **DEPLOY-015**: Publish training materials
- [ ] **DEPLOY-016**: Monitor for 48 hours
- [ ] **DEPLOY-017**: Collect user feedback
- [ ] **DEPLOY-018**: Triage bugs
- [ ] **DEPLOY-019**: Create deployment report
- [ ] **DEPLOY-020**: Schedule post-implementation review (4 weeks)

---

## 15. Documentation Updates (DD, BR, TS, UC, VAL, PC)

### Data Dictionary Updates

- [ ] **DD-001**: Update DD-price-lists.md
  - Document all field changes (see Appendix C in ARC)
  - Add new fields with descriptions
  - Mark removed fields as deprecated
  - Update field constraints

- [ ] **DD-002**: Update DD-requests-for-pricing.md
  - Remove approval-related fields
  - Update field list

- [ ] **DD-003**: Update DD-pricelist-templates.md
  - Match changes to price list DD

- [ ] **DD-004**: Update DD-vendor-portal.md (if exists)
  - Document portal display changes for effective date range
  - Document effective_start_date field (required)
  - Document effective_end_date field (optional, null handling)
  - Document date range validation rules
  - Document date range display formats
  - Document FOC and tax field display

### Business Requirements Updates

- [ ] **BR-001**: Update BR-price-lists.md
  - Update functional requirements
  - Add import feature requirement
  - Add multi-currency requirement
  - Add FOC requirement
  - Remove approval requirement
  - Update date model requirement

- [ ] **BR-002**: Update BR-requests-for-pricing.md
  - Remove approval workflow requirement
  - Simplify submission requirements

### Technical Specification Updates

- [ ] **TS-001**: Update TS-price-lists.md
  - Update data model section
  - Add import architecture
  - Update API endpoints
  - Add import file processing flow

- [ ] **TS-002**: Update TS-requests-for-pricing.md
  - Remove approval workflow architecture

- [ ] **TS-003**: Update TS-vendor-portal.md
  - Update portal data model with effective date range fields
  - Document effective_start_date and effective_end_date display logic
  - Document date range validation architecture
  - Document vendor submission form date range handling
  - Document filtering logic for current/upcoming/expired price lists
  - Document API endpoints for vendor portal date range support

### Use Case Updates

- [ ] **UC-001**: Update UC-price-lists.md
  - Update UC-001 (Create Price List) with new workflow
  - Add UC-XXX (Import Price List Items)
  - Update UC-003 (View Price List) with new fields
  - Update UC-005 (Mark Inactive) - rename from Mark Expired

- [ ] **UC-002**: Update UC-requests-for-pricing.md
  - Update UC-001 (Submit Request) - remove approval flow
  - Remove approval-related use cases

### Validation Updates

- [ ] **VAL-001**: Update VAL-price-lists.md
  - Update field validations
  - Add import validations
  - Remove old field validations

- [ ] **VAL-002**: Update VAL-requests-for-pricing.md
  - Remove approval validations

### Page Content Updates

- [ ] **PC-001**: Update price-lists/pages/PC-list-page.md
  - Update table headers
  - Update filter labels
  - Update status badges

- [ ] **PC-002**: Update price-lists/pages/PC-create-form.md
  - Update form labels
  - Add import button text
  - Update help text
  - Update error messages

- [ ] **PC-003**: Update price-lists/pages/PC-detail-page.md
  - Update field labels
  - Add FOC badge text
  - Add tax profile display text

- [ ] **PC-004**: Create price-lists/pages/PC-import-dialog.md
  - Import dialog content
  - Error messages
  - Success messages

---

## Summary

**Total Tasks**: 91 (Updated to include vendor portal effective date range tasks)

### Task Breakdown by Category
- Database: 26 tasks
- TypeScript Types: 7 tasks
- API/Server Actions: 13 tasks (+1 for vendor portal submission API)
- Validation: 5 tasks
- Business Logic: 6 tasks
- Frontend UI: 37 tasks (+3 for vendor portal date range UI tasks)
- Mock Data: 5 tasks
- UI Components: 8 tasks
- Testing: 16 tasks
- Documentation: 9 tasks
- Deployment: 20 tasks
- Doc Updates: 13 tasks

### By Phase
- **Phase 1 (Documentation)**: 13 tasks (Weeks 1-2)
- **Phase 2 (Backend)**: 57 tasks (Weeks 3-5) - includes vendor portal API updates
- **Phase 3 (Frontend)**: 45 tasks (Weeks 6-8) - includes vendor portal UI updates
- **Phase 4 (Testing & Deployment)**: 45 tasks (Weeks 9-10)

**Estimated Effort**: 38 Story Points (~10 weeks with 2 Backend + 2 Frontend developers)

**Priority**:
- 🔴 High Priority: Database changes, Core types, API actions
- 🟡 Medium Priority: UI components, Mock data, Testing
- 🟢 Low Priority: Documentation updates, Training materials

---

**Last Updated**: 2025-11-17
**Document Owner**: Development Team
**ARC Reference**: ARC-2024-001-vendor-management-redesign.md
**Changelog**:
- v1.1.0 (2025-11-17): Updated to correct effective_date to effective date range (effective_start_date + effective_end_date); Added 4 vendor portal tasks (API-013, UI-034, UI-035, UI-036) for date range implementation
