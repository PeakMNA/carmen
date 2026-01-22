# Price Lists - Technical Specification (TS)

## Document Information
- **Document Type**: Technical Specification Document
- **Module**: Vendor Management > Price Lists
- **Version**: 3.0.0
- **Last Updated**: 2026-01-15
- **Document Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2026-01-15 | Documentation Team | Synced with current code; Added 5-step staff creation wizard route (/new); Added edit page routes ([id]/edit, [id]/edit-new); Updated component hierarchy; Added PriceValidation utility documentation; Updated status values |
| 2.0.0 | 2025-11-26 | System | Complete rewrite to match BR v2.0.0 and actual code; Removed fictional features (5-step wizard, bulk import, price comparison, price history charts, approval workflows, alerts, RFQ integration); Removed code blocks per specification (text + sitemap only); Updated to reflect implemented functionality |
| 1.0 | 2024-01-15 | System | Initial technical specification document |

**Note**: This document describes technical specifications in text format with sitemap. Code examples are not included per specification requirements.

---

## 1. Technical Overview

### 1.1 Technology Stack

**Frontend**
- Framework: Next.js 14 with App Router
- Language: TypeScript 5.8.2 (strict mode)
- Styling: Tailwind CSS with Shadcn/ui components
- State Management: React useState for local state, React Query for server state
- Forms: React Hook Form with Zod validation
- UI Components: Radix UI primitives with Lucide React icons
- Date Handling: date-fns

**Backend**
- Framework: Next.js 14 Server Actions and Route Handlers
- Data Layer: Mock data with TypeScript interfaces (future: Prisma ORM)
- Database: PostgreSQL with tables tb_pricelist, tb_pricelist_detail
- Authentication: User context system

**Infrastructure**
- Development: Local Next.js development server
- Data: Centralized mock data in lib/mock-data

### 1.2 Architecture Pattern

The module follows the Next.js App Router pattern with Server Components as default and Client Components for interactive elements.

**Key Principles**
- Server Components for initial page rendering
- Client Components for interactive features (filters, actions, forms)
- Centralized mock data for development
- TypeScript interfaces for type safety
- React Query for data caching and state management

---

## 2. Site Map

### 2.1 Route Structure

```
/vendor-management/pricelists
├── page.tsx                    # Price List Page (list view)
├── add/
│   └── page.tsx               # Add Price List Page (simple form)
├── new/
│   └── page.tsx               # Staff Creation Wizard (5-step)
├── components/
│   └── PricelistProductEditingComponent.tsx  # Shared editing component
├── types/
│   └── PricelistEditingTypes.ts             # TypeScript interfaces
├── utils/
│   └── PriceValidation.ts                   # Validation utilities
└── [id]/
    ├── page.tsx               # Price List Detail Page
    ├── edit/
    │   └── page.tsx           # Edit Price List Page (legacy)
    └── edit-new/
        └── page.tsx           # Enhanced Edit Page (form-based)
```

### 2.2 Page Descriptions

**Price List Page** (`/vendor-management/pricelists`)
- Route: `/vendor-management/pricelists`
- Component Type: Client Component
- Purpose: Display all price lists with filtering and search
- Features: Table view, card view toggle, status filter, vendor filter, search, action menu

**Add Price List Page** (`/vendor-management/pricelists/add`)
- Route: `/vendor-management/pricelists/add`
- Component Type: Client Component
- Purpose: Create new price list with line items (simple form)
- Features: Basic info form, line items with MOQ pricing tiers, add/remove items
- Supports pre-population from copied pricelist data via sessionStorage

**Staff Creation Wizard** (`/vendor-management/pricelists/new`)
- Route: `/vendor-management/pricelists/new`
- Component Type: Client Component (Suspense wrapped)
- Purpose: 5-step wizard for staff to create pricelists on behalf of vendors
- Query Parameters: `vendorId`, `campaignId`, `templateId` (optional pre-selection)
- Steps:
  1. Basic Information: Pricelist number, creation notes
  2. Vendor Selection: Search and select vendor
  3. Creation Method: Template-based, Manual, or Excel Import
  4. Configuration: Currency, validity dates, template selection
  5. Review & Create: Summary and confirmation
- Features: Progress indicator, step validation, audit logging

**Price List Detail Page** (`/vendor-management/pricelists/[id]`)
- Route: `/vendor-management/pricelists/[id]`
- Component Type: Client Component
- Purpose: Display price list details with line items
- Features: Header info, line items table, action buttons

**Enhanced Edit Page** (`/vendor-management/pricelists/[id]/edit-new`)
- Route: `/vendor-management/pricelists/[id]/edit-new`
- Component Type: Client Component
- Purpose: Modern form-based editing with product editing component
- Features: Form validation, MOQ tier management, save draft, submit actions

---

## 3. Component Architecture

### 3.1 Component Hierarchy

**Price List Page Components**
- PriceListsPage (main page component)
  - Card with CardHeader and CardContent
  - Search Input
  - Status Filter Dropdown (Select)
  - Vendor Filter Dropdown (Select)
  - View Toggle (Table/Card)
  - Export Button
  - Add New Button
  - Table Component (table view)
  - Card Grid (card view)
  - Dropdown Menu (row actions)

**Add Price List Page Components**
- AddPriceListPage (main page component)
  - Form Container (Card)
  - Basic Info Section
    - Price List Number Input (auto-generated option)
    - Vendor Select
    - Currency Select
    - Valid From Date Picker
    - Valid To Date Picker
    - Notes Textarea
  - Line Items Section
    - Items Table
    - Add Item Button
    - Remove Item Button
    - Product Select per row
    - MOQ Input per row
    - Unit Select per row
    - Unit Price Input per row
    - Lead Time Input per row
    - Notes Input per row
  - Action Buttons (Cancel, Save)

**Price List Detail Page Components**
- PriceListDetailPage (main page component)
  - Back Navigation Button
  - Header Section
    - Price List Name
    - Status Badge
    - Vendor Name
  - Info Grid
    - Validity Period
    - Currency
    - Total Items
    - Created By
    - Approved By (if applicable)
    - Notes
  - Line Items Table
    - Item Code Column
    - Item Name Column
    - Description Column
    - Unit Column
    - Unit Price Column
    - MOQ Column
    - Lead Time Column
    - Price Change Indicator (if applicable)
  - Action Buttons (Edit, Duplicate, Export, Delete)

### 3.2 Shared Components Used

**From Shadcn/ui**
- Button (various variants)
- Card, CardHeader, CardContent, CardTitle, CardDescription
- Badge
- Input
- Select, SelectTrigger, SelectContent, SelectItem, SelectValue
- Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
- Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription
- AlertDialog (for delete confirmation)

**From Lucide React**
- Plus, Search, Filter, Download (actions)
- List, Grid (view toggle)
- Eye, Edit, Copy, Trash2, MoreHorizontal (row actions)
- Calendar, DollarSign, Package (info icons)
- ArrowLeft (back navigation)
- CheckCircle, Clock, AlertCircle (status indicators)

---

## 4. Data Layer

### 4.1 Database Schema

**tb_pricelist Table**
- id: UUID (primary key)
- pricelist_no: VARCHAR (unique, not null)
- name: VARCHAR (unique)
- url_token: VARCHAR
- vendor_id: UUID (FK to tb_vendor)
- vendor_name: VARCHAR (denormalized)
- from_date: TIMESTAMPTZ
- to_date: TIMESTAMPTZ
- currency_id: UUID (FK to tb_currency)
- currency_name: VARCHAR (denormalized)
- is_active: BOOLEAN (default true)
- description: VARCHAR
- note: VARCHAR
- info: JSON
- dimension: JSON
- doc_version: DECIMAL (default 0)
- Audit fields: created_at, created_by_id, updated_at, updated_by_id, deleted_at, deleted_by_id

**tb_pricelist_detail Table**
- id: UUID (primary key)
- pricelist_id: UUID (FK to tb_pricelist, not null)
- sequence_no: INT (default 1)
- product_id: UUID (FK to tb_product, not null)
- product_name: VARCHAR (denormalized)
- unit_id: UUID (FK to tb_unit)
- unit_name: VARCHAR (denormalized)
- tax_profile_id: UUID
- tax_profile_name: VARCHAR (denormalized)
- tax_rate: DECIMAL(15,5)
- price: DECIMAL(20,5)
- price_without_vat: DECIMAL(20,5)
- price_with_vat: DECIMAL(20,5)
- is_active: BOOLEAN (default true)
- description: VARCHAR
- note: VARCHAR
- info: JSON
- dimension: JSON
- doc_version: DECIMAL (default 0)
- Audit fields: created_at, created_by_id, updated_at, updated_by_id, deleted_at, deleted_by_id

### 4.2 Type Definitions

**VendorPriceList Interface**
- id: string (unique identifier)
- vendorId: string (vendor reference)
- vendorName: string (vendor display name)
- priceListName: string (display name)
- priceListCode: string (reference code)
- description: string (optional)
- currency: string (currency name)
- currencyCode: string (ISO code)
- effectiveStartDate: Date
- effectiveEndDate: Date (optional)
- status: string (draft, pending, active, expired)
- totalItems: number (line item count)
- createdBy: string (creator identifier)
- approvedBy: string (optional)
- approvedAt: Date (optional)
- notes: string (optional)

**VendorPriceListItem Interface**
- id: string (unique identifier)
- priceListId: string (parent reference)
- itemCode: string (product code)
- itemName: string (product name)
- description: string (optional)
- unit: string (unit of measure)
- unitPrice: object (amount and currency)
- minimumOrderQuantity: number (optional)
- leadTimeDays: number (optional)
- itemDiscounts: array (optional, volume discounts)
- notes: string (optional)
- isActive: boolean

### 4.3 Mock Data Location

**Price List Mock Data**: lib/mock-data/pricelists.ts
- mockPriceLists: Array of VendorPriceList objects
- mockPriceListItems: Array of VendorPriceListItem objects

**Vendor Mock Data**: lib/mock-data/vendors.ts
- mockVendors: Array of vendor objects for selection

**Product Mock Data**: lib/mock-data/products.ts
- mockProducts: Array of product objects for selection

### 4.4 Type Definitions Location

**Price List Types**: lib/types/vendor.ts or lib/types/pricelist.ts
- VendorPriceList interface
- VendorPriceListItem interface
- ItemDiscount interface

---

## 5. State Management

### 5.1 Price List Page State

**Local State (useState)**
- searchTerm: string (search input value)
- statusFilter: string (status dropdown value)
- vendorFilter: string (vendor dropdown value)
- viewMode: 'table' | 'card' (current view mode)

**Derived State (useMemo)**
- filteredPriceLists: Filtered price list array based on search, status, and vendor filters

### 5.2 Add Price List Page State

**Local State (useState)**
- formData: Object containing form data
  - priceListNumber: string (auto or manual)
  - vendorId: string
  - currency: string
  - validFrom: Date
  - validTo: Date (optional)
  - notes: string
- lineItems: Array of line item objects
  - productId: string
  - moq: number
  - unitId: string
  - unitPrice: number
  - leadTime: number
  - notes: string

**Form State (useForm)**
- React Hook Form manages form validation and submission

### 5.3 Price List Detail State

**Local State (useState)**
- priceList: VendorPriceList object (loaded data)
- isLoading: boolean
- showDeleteDialog: boolean

---

## 6. Form Validation

### 6.1 Add Price List Form Validation

**Basic Info Fields**
- vendorId: Required, must select valid vendor
- currency: Required, valid currency code
- validFrom: Required, valid date
- validTo: Optional, must be after validFrom if provided
- notes: Optional, max 1000 characters

**Line Item Fields**
- productId: Required, must select product
- moq: Optional, positive integer
- unitId: Required, valid unit
- unitPrice: Required, positive number
- leadTime: Optional, positive integer 1-365
- notes: Optional, max 500 characters

### 6.2 Validation Rules

- Price list name: Required, 3-200 characters
- Vendor: Required, must exist in vendor list
- Currency: Required, ISO 4217 code
- Start date: Required, valid date format
- End date: Must be after start date if provided
- Unit price: Must be positive, max 2 decimal places
- MOQ: Must be positive integer if provided
- Lead time: Must be 1-365 days if provided

---

## 7. Navigation Flows

### 7.1 Entry Points

**Sidebar Navigation**
- Path: Vendor Management > Price Lists
- Route: /vendor-management/pricelists

### 7.2 Internal Navigation

**From List Page**
- Add New Button → /vendor-management/pricelists/add
- Row Click → /vendor-management/pricelists/[id]
- View Action → /vendor-management/pricelists/[id]
- Edit Action → /vendor-management/pricelists/[id] (with edit mode)

**From Add Page**
- Cancel → /vendor-management/pricelists
- Save Success → /vendor-management/pricelists/[id]

**From Detail Page**
- Back Button → /vendor-management/pricelists
- Duplicate → Creates copy and navigates to /vendor-management/pricelists/add with pre-filled data

---

## 8. Actions and Operations

### 8.1 Price List Page Actions

**View Action**
- Navigate to price list detail page
- Route: /vendor-management/pricelists/[id]

**Edit Action**
- Navigate to price list detail/edit page
- Only available for draft status price lists

**Duplicate Action**
- Copy price list data to sessionStorage
- Navigate to add page with copied data pre-filled
- Reset status to draft

**Export Action**
- Download price list data as file
- Format: CSV or Excel

**Mark as Expired Action**
- Update price list status to expired
- Display confirmation toast

**Delete Action**
- Show confirmation dialog
- Remove price list from database
- Display success toast

### 8.2 Add Price List Actions

**Add Line Item**
- Add new row to line items table
- Focus on product selection

**Remove Line Item**
- Remove selected row from table
- Update line item count

**Save**
- Validate all fields
- Create price list in database
- Navigate to detail page

**Cancel**
- Discard changes
- Navigate back to list page

### 8.3 Detail Page Actions

**Edit**
- Enable edit mode for price list
- Only for draft status

**Duplicate**
- Same as list page duplicate action

**Export**
- Download price list data

**Delete**
- Same as list page delete action

---

## 9. Integration Points

### 9.1 Vendor Directory Integration

**Integration Type**: Read-only reference
**Purpose**: Select vendor when creating price list
**Data Flow**: Vendor ID and name stored in price list

### 9.2 Product Catalog Integration

**Integration Type**: Read-only reference
**Purpose**: Select products for line items
**Data Flow**: Product ID and name stored in line item

### 9.3 Currency Integration

**Integration Type**: Read-only reference
**Purpose**: Select currency for price list
**Data Flow**: Currency ID and name stored in price list

### 9.4 Purchase Request Integration

**Integration Type**: Outbound reference
**Purpose**: Price lists referenced during purchase request creation
**Data Flow**: Price list ID, price values used for cost calculation

---

## 10. Performance Considerations

### 10.1 Client-Side Optimization

**Memoization**
- useMemo for filtered price lists to prevent recalculation
- useCallback for event handlers where appropriate

**Lazy Loading**
- Load price list detail data on navigation
- Pagination for large price lists (future)

### 10.2 Rendering Optimization

**Conditional Rendering**
- Only render table or card view based on toggle
- Lazy render action dropdowns on open

**View Mode Toggle**
- Preserve view mode preference during session
- Efficient re-render when switching views

---

## 11. Accessibility

### 11.1 Keyboard Navigation

**List Page**
- Tab navigation through interactive elements
- Enter to activate buttons and links
- Arrow keys for dropdown navigation

**Form**
- Tab through form fields
- Enter to submit form
- Escape to cancel

### 11.2 Screen Reader Support

**ARIA Labels**
- Buttons labeled with action descriptions
- Form fields with proper labels
- Status badges with accessible text

**Focus Management**
- Focus trap in dialogs
- Focus return on dialog close
- Focus first invalid field on validation error

---

## 12. Error Handling

### 12.1 Form Validation Errors

**Display Strategy**
- Inline error messages below fields
- Error summary at form level
- Focus first invalid field

### 12.2 Action Errors

**Toast Notifications**
- Success toasts for completed actions
- Error toasts for failed operations
- Descriptive error messages

### 12.3 Navigation Errors

**Route Protection**
- Redirect to list if price list not found
- Show permission error if unauthorized

---

## 13. Status Management

### 13.1 Current Implementation

The database uses `is_active` boolean field:
- true: Price list is active
- false: Price list is inactive

### 13.2 UI Status Mapping

The UI displays status with color-coded badges:
- **active**: Green badge (bg-green-100 text-green-800)
- **expired**: Red badge (bg-red-100 text-red-800)
- **pending**: Yellow badge (bg-yellow-100 text-yellow-800)
- **draft**: Gray badge (bg-gray-100 text-gray-800)

Status is currently computed from is_active and date range in the UI layer.

---

## 14. Future Enhancements

### 14.1 Planned Features

**Database Enhancements**
- Add status enum field to tb_pricelist
- Add minimum_order_quantity to tb_pricelist_detail
- Add lead_time_days to tb_pricelist_detail
- Create tb_pricelist_discount table for volume discounts

**API Integration**
- Replace mock data with API calls
- Implement server actions for mutations
- Add optimistic updates with React Query

**Advanced Features**
- Bulk import from Excel/CSV
- Price comparison across vendors
- Approval workflow for price changes
- Price history tracking

---

## 15. Related Documents

- [BR-price-lists.md](./BR-price-lists.md) - Business Requirements v2.0.0
- [DD-price-lists.md](./DD-price-lists.md) - Data Definition v2.1.0
- [FD-price-lists.md](./FD-price-lists.md) - Flow Diagrams
- [UC-price-lists.md](./UC-price-lists.md) - Use Cases
- [VAL-price-lists.md](./VAL-price-lists.md) - Validations

---

**End of Technical Specification Document**
