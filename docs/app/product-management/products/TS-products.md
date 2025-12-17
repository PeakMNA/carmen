# Technical Specification: Products

## Module Information
- **Module**: Product Management
- **Sub-Module**: Products
- **Route**: /product-management/products
- **Version**: 1.0.0
- **Last Updated**: 2025-02-11
- **Owner**: Product Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-02-11 | System | Initial technical specification |

---

## Overview

The Products sub-module is implemented as a full-stack Next.js 14 application using the App Router pattern with React Server Components. The technical architecture follows a layered approach with clear separation of concerns: presentation layer (React components), business logic layer (server actions), and data access layer (PostgreSQL via Supabase).

The implementation leverages Next.js Server Components for initial page rendering and data fetching, combined with Client Components for interactive features. State management is split between Zustand for UI state and React Query for server state caching. All data mutations go through server actions which provide type-safe, server-side validation and business logic execution.

The product module serves as a central master data repository with extensive integration points to other ERP modules. The technical design emphasizes performance through pagination, search indexing, and caching strategies. Data integrity is enforced at multiple levels: client-side validation for user experience, server-side validation for security, and database constraints for data consistency.

**⚠️ IMPORTANT: This is a Technical Specification Document - TEXT FORMAT ONLY**
- **DO NOT include actual code** - describe implementation patterns in text
- **DO NOT include TypeScript/JavaScript code** - describe component responsibilities
- **DO NOT include SQL code** - refer to DD (Data Dictionary) document for database descriptions
- **DO include**: Architecture descriptions, component responsibilities, data flow descriptions, integration patterns
- **Focus on**: WHAT components do, HOW they interact, WHERE data flows - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-products.md) - Requirements in text format
- [Use Cases](./UC-products.md) - Use cases in text format
- [Data Dictionary](./DD-products.md) - Data definitions in text format
- [Flow Diagrams](./FD-products.md) - Visual diagrams
- [Validations](./VAL-products.md) - Validation rules in text format

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Products sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/product-management/products)']
    CreatePage['Create Page<br>(/product-management/products/new)']
    DetailPage["Detail Page<br>(/product-management/products/[id])"]
    EditPage["Edit Page<br>(/product-management/products/[id]/edit)"]

    %% List Page Tabs
    ListPage --> ListTab1['Tab: All Items']
    ListPage --> ListTab2['Tab: Active']
    ListPage --> ListTab3['Tab: Archived']

    %% List Page Dialogues
    ListPage -.-> ListDialog1['Dialog: Quick Create']
    ListPage -.-> ListDialog2['Dialog: Bulk Actions']
    ListPage -.-> ListDialog3['Dialog: Export']
    ListPage -.-> ListDialog4['Dialog: Filter']

    %% Detail Page Tabs
    DetailPage --> DetailTab1['Tab: Overview']
    DetailPage --> DetailTab2['Tab: History']
    DetailPage --> DetailTab3['Tab: Activity Log']

    %% Detail Page Dialogues
    DetailPage -.-> DetailDialog1['Dialog: Edit']
    DetailPage -.-> DetailDialog2['Dialog: Delete Confirm']
    DetailPage -.-> DetailDialog3['Dialog: Status Change']

    %% Create/Edit Dialogues
    CreatePage -.-> CreateDialog1['Dialog: Cancel Confirm']
    CreatePage -.-> CreateDialog2['Dialog: Save Draft']

    EditPage -.-> EditDialog1['Dialog: Discard Changes']
    EditPage -.-> EditDialog2['Dialog: Save Draft']

    %% Navigation Flow
    ListPage --> DetailPage
    ListPage --> CreatePage
    DetailPage --> EditPage
    CreatePage --> DetailPage
    EditPage --> DetailPage

    style ListPage fill:#e1f5ff
    style CreatePage fill:#fff4e1
    style DetailPage fill:#e8f5e9
    style EditPage fill:#fce4ec
```

### Pages

#### 1. List Page
**Route**: `/product-management/products`
**File**: `page.tsx`
**Purpose**: Display paginated list of all products

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all products
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/product-management/products/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive product details

**Sections**:
- Header: Breadcrumbs, product title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change product status with reason

#### 3. Create Page
**Route**: `/product-management/products/new`
**File**: `new/page.tsx`
**Purpose**: Create new product

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/product-management/products/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing product

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## Architecture

### High-Level Architecture

The Products sub-module follows a three-tier architecture pattern with clear separation between presentation, business logic, and data persistence layers:

```
┌─────────────────────────────────────────────────┐
│            Client Browser Layer                 │
│   ┌─────────────────────────────────────┐      │
│   │  React Components (Client/Server)    │      │
│   │  - ProductList, ProductDetail        │      │
│   │  - ProductForm, ProductFilters       │      │
│   └─────────────┬───────────────────────┘      │
└─────────────────┼───────────────────────────────┘
                  │ HTTPS/API Calls
┌─────────────────▼───────────────────────────────┐
│         Next.js Server Layer                    │
│   ┌─────────────────────────────────────┐      │
│   │  Server Actions (actions.ts)         │      │
│   │  - createProduct, updateProduct      │      │
│   │  - deleteProduct, listProducts       │      │
│   └─────────────┬───────────────────────┘      │
│                 │                                │
│   ┌─────────────▼───────────────────────┐      │
│   │  Business Logic Layer                │      │
│   │  - Validation, Authorization         │      │
│   │  - Unit Conversions, Cost Calc       │      │
│   └─────────────┬───────────────────────┘      │
└─────────────────┼───────────────────────────────┘
                  │ Database Queries
┌─────────────────▼───────────────────────────────┐
│         Data Persistence Layer                  │
│   ┌─────────────────────────────────────┐      │
│   │  PostgreSQL Database (Supabase)      │      │
│   │  - products table                    │      │
│   │  - product_units table               │      │
│   │  - product_store_assignments table   │      │
│   │  - product_attributes table          │      │
│   │  - product_activity_log table        │      │
│   └─────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│       Integration Layer (External Modules)      │
│                                                  │
│  Procurement ←→ Inventory ←→ Recipe ←→ Sales    │
│        GRN ←→ Finance ←→ Vendor Management      │
└─────────────────────────────────────────────────┘
```

### Component Architecture

The application is organized into distinct layers with specific responsibilities:

**Frontend Layer** (Client and Server Components):
- **Page Components**: Server Components that handle routing and initial data fetching
- **List Components**: Display paginated, sortable, filterable product lists
- **Detail Components**: Show complete product information with related data
- **Form Components**: Client Components for data entry with validation
- **Filter Components**: Search and filter controls with real-time updates
- **Modal Components**: Dialogs for purchase history, confirmations, unit conversions

**Backend Layer** (Server Actions and Business Logic):
- **Server Actions**: Handle all data mutations with validation and authorization
- **Query Functions**: Fetch data from database with proper filtering and joins
- **Business Logic Services**: Unit conversion calculations, deviation validation, cost updates
- **Integration Services**: APIs for external module communication
- **Validation Layer**: Zod schemas for type-safe input validation
- **Authorization Layer**: Role-based access control and permission checks

**Data Layer** (Database and Caching):
- **Core Tables**: products, product_units, product_store_assignments, product_attributes, product_activity_log
- **Database Views**: Pre-joined views for common queries (products with category path, products with latest costs)
- **Indexes**: Full-text search indexes on product code, descriptions, barcode
- **Triggers**: Automatic audit log entry creation on data changes
- **Cache Layer**: React Query cache for GET operations, invalidation on mutations

---

## Technology Stack

### Frontend

**Core Framework**:
- Next.js 14 with App Router for server-side rendering and static generation
- React 18 with Server Components for optimal performance
- TypeScript for type safety and developer experience

**UI and Styling**:
- Tailwind CSS for utility-first styling with custom theme configuration
- Shadcn/ui components for consistent, accessible UI patterns
- Radix UI primitives for complex interactive components (dropdowns, dialogs, popovers)
- Lucide React for icon library with consistent visual language

**State Management**:
- Zustand for global UI state (filters, selections, sidebar state)
- React Query (TanStack Query) for server state management with automatic caching
- React Hook Form for form state management with minimal re-renders
- Local component state with useState for isolated component logic

**Form Handling and Validation**:
- React Hook Form for performant form management
- Zod for schema-based validation on client and server
- Custom validation hooks for business rule validation
- Error boundary components for graceful error handling

**Data Fetching**:
- React Query for GET operations with caching and revalidation
- Server Actions for POST/PUT/DELETE operations
- Optimistic updates for immediate UI feedback
- Automatic retry logic for failed requests

**Date and Time**:
- date-fns for date manipulation and formatting
- UTC storage with local timezone display
- Relative time formatting for activity logs

### Backend

**Runtime and Framework**:
- Node.js 20 LTS for server runtime
- Next.js Server Actions for type-safe server mutations
- API Routes for external integrations and webhooks

**Database**:
- PostgreSQL 14+ via Supabase for relational data
- Supabase client for database access with connection pooling
- Row Level Security (RLS) policies for fine-grained access control
- Database triggers for automatic audit logging

**Authentication and Authorization**:
- Supabase Auth for user authentication
- JWT tokens for session management
- Role-based access control with permission checks
- User context propagation through request headers

**File Storage**:
- Supabase Storage for product images and import files
- Signed URLs for secure file access
- Automatic image optimization and resizing

**Validation and Type Safety**:
- Zod schemas for runtime validation
- TypeScript interfaces for compile-time type checking
- Custom validation functions for complex business rules

### Testing

**Unit Testing**:
- Vitest as test runner for fast unit tests
- React Testing Library for component testing
- Mock Service Worker (MSW) for API mocking
- Test fixtures for consistent test data

**Integration Testing**:
- Vitest with test database for integration tests
- Supabase local development for database testing
- API endpoint testing with supertest

**End-to-End Testing**:
- Playwright for cross-browser E2E tests
- Page Object Model pattern for test organization
- Visual regression testing with screenshot comparison
- Accessibility testing with axe-core

### DevOps and Deployment

**Version Control**:
- Git for source control
- GitHub for repository hosting
- Branch protection rules for main branch

**CI/CD**:
- GitHub Actions for automated testing and deployment
- Automated test runs on pull requests
- Deployment previews for every pull request
- Automated database migrations on deployment

**Hosting and Infrastructure**:
- Vercel for Next.js application hosting
- Supabase for database and authentication
- Edge functions for global low-latency responses
- CDN for static asset delivery

**Monitoring and Observability**:
- Vercel Analytics for performance monitoring
- Sentry for error tracking and alerting
- Custom logging to database for audit trails
- Database query performance monitoring

---

## Component Structure

### Directory Structure

The Products sub-module follows Next.js 14 App Router conventions with components organized by feature:

```
app/(main)/product-management/products/
├── page.tsx                              # Product list page (Server Component)
├── [id]/
│   └── page.tsx                          # Product detail page (Server Component)
├── components/
│   ├── ProductList.tsx                   # Product list table (Client Component)
│   ├── ProductDetail.tsx                 # Product detail display (Client Component)
│   ├── ProductForm.tsx                   # Create/edit form (Client Component)
│   ├── ProductFilters.tsx                # Search and filters (Client Component)
│   ├── ProductUnitManager.tsx            # Unit management (Client Component)
│   ├── ProductStoreAssignments.tsx       # Store assignment manager (Client Component)
│   ├── ProductAttributes.tsx             # Attribute key-value manager (Client Component)
│   ├── PurchaseHistoryModal.tsx          # Purchase history dialog (Client Component)
│   ├── ProductStatusBadge.tsx            # Status display (Server Component)
│   ├── ProductCategoryPath.tsx           # Category breadcrumb (Server Component)
│   └── ProductActions.tsx                # Action menu (Client Component)
├── types.ts                              # TypeScript interfaces and types
├── actions.ts                            # Server actions for CRUD operations
├── validations.ts                        # Zod validation schemas
├── hooks/
│   ├── useProducts.ts                    # React Query hook for products list
│   ├── useProduct.ts                     # React Query hook for single product
│   ├── useProductForm.ts                 # Form state and validation hook
│   ├── useUnitConversion.ts              # Unit conversion calculator hook
│   └── useProductFilters.ts              # Filter state management hook
└── utils/
    ├── unit-conversion.ts                # Unit conversion calculations
    ├── cost-validation.ts                # Price/quantity deviation validation
    └── formatters.ts                     # Data formatting utilities
```

### Key Components

#### Page Component (page.tsx)
**Type**: Server Component
**Purpose**: Main product list page with server-side data fetching
**Responsibilities**:
- Fetch initial product list data on server
- Pass data to client components as props
- Handle route parameters for filtering
- Render page layout with filters and list
- Provide loading and error states
**Data Flow**: Calls server actions to fetch products, passes to ProductList component

#### Product List Page ([id]/page.tsx)
**Type**: Server Component
**Purpose**: Product detail page with server-side data fetching
**Responsibilities**:
- Fetch single product by ID on server
- Include related data (units, store assignments, attributes, activity log)
- Handle 404 if product not found
- Render detail layout with edit/delete actions
**Data Flow**: Calls getProductById server action, passes to ProductDetail component

#### ProductList Component
**Type**: Client Component
**Purpose**: Display paginated, sortable, filterable product table
**Responsibilities**:
- Render table with product rows
- Handle column sorting (click header to sort)
- Manage row selection with checkboxes
- Provide pagination controls
- Display loading skeleton during data fetch
- Show empty state when no products match filters
**Props**: Accepts products array, loading state, pagination state, sort handlers
**State**: Selected rows, sort column, sort direction
**Events**: onRowClick (navigate to detail), onSort (update sort), onPageChange (pagination)

#### ProductForm Component
**Type**: Client Component
**Purpose**: Create and edit product form with validation
**Responsibilities**:
- Render form fields with React Hook Form
- Validate inputs with Zod schema
- Display validation errors inline
- Handle form submission
- Support draft saving (save without validation)
- Show confirmation before cancel if form is dirty
**Props**: Initial data (null for create, product object for edit), onSubmit, onCancel
**State**: Form state managed by React Hook Form, isDirty flag, isSubmitting flag
**Validation**: Client-side with Zod, server-side in server action
**Events**: onSubmit (create or update), onCancel (return to list), onDraftSave (save as draft)

#### ProductFilters Component
**Type**: Client Component
**Purpose**: Search box and filter controls for product list
**Responsibilities**:
- Render search input with type-ahead
- Provide filter dropdowns (category, status, type, store)
- Display active filters as removable tags
- Debounce search input (300ms delay)
- Persist filter state to URL query parameters
**Props**: Current filter values, onChange handlers
**State**: Search term, selected filters, filter panel expanded state
**Events**: onSearchChange (update search), onFilterChange (update filters), onClearFilters (reset all)

#### ProductUnitManager Component
**Type**: Client Component
**Purpose**: Manage product units and conversion rates
**Responsibilities**:
- Display three sections: Inventory Unit, Order Units, Recipe Units
- Allow adding units with conversion rates
- Support editing conversion rates
- Calculate and display reverse conversion rates
- Provide real-time conversion calculator
- Validate unique units within each type
**Props**: Product units data, onUnitsChange callback
**State**: Order units array, recipe units array, calculator input values
**Validation**: Conversion rate positive non-zero, max 5 decimals, unique units

#### PurchaseHistoryModal Component
**Type**: Client Component
**Purpose**: Display recent purchase orders and goods receipts
**Responsibilities**:
- Fetch and display 10 most recent POs and GRNs
- Provide tabs to switch between POs and Receipts
- Show loading state during fetch
- Display empty state if no history
- Allow clicking rows to open full PO/GRN detail
- Provide export to Excel functionality
**Props**: Product ID, isOpen state, onClose callback
**State**: Selected tab (PO/GRN), loading state, history data
**Data Fetching**: React Query hook fetches on modal open

---

## Data Flow

### Read Operations Flow

The read operations follow a caching strategy with automatic revalidation:

1. **User navigates** to product list page
2. **Page component** (Server Component) executes on server
3. **Server action** `listProducts` called with filter parameters
4. **Database query** executes with WHERE clauses and JOINs
5. **Results returned** to page component
6. **Initial HTML rendered** on server with product data
7. **Client hydration** occurs, React Query cache populated
8. **Subsequent navigation** checks React Query cache first
9. **Cache hit** returns data immediately (stale-while-revalidate)
10. **Background refetch** updates cache with fresh data
11. **UI updates** automatically when fresh data arrives

**Type-Ahead Search Flow**:
1. User types in search box
2. 300ms debounce delay prevents excessive queries
3. Client component calls search API via React Query
4. Server action performs full-text search on indexed fields
5. Results returned as JSON array
6. Component displays dropdown with top 10 matches
7. User selects product from dropdown
8. Form populated with selected product data

### Write Operations Flow

All write operations go through server actions for validation and security:

1. **User fills form** and clicks submit button
2. **Form component** validates client-side with Zod schema
3. **Validation passes**, form submits to server action
4. **Server action** receives form data
5. **Server validation** runs Zod schema again (security)
6. **Authorization check** ensures user has permission
7. **Business logic** executes (e.g., deviation validation, cost calculations)
8. **Database transaction** begins
9. **Product record** inserted or updated
10. **Activity log entry** created in same transaction
11. **Transaction commits** if all succeed
12. **Success response** returned to client
13. **React Query cache** invalidated for affected queries
14. **UI updates** with optimistic update or refetch
15. **Success message** displayed to user
16. **Navigation** to detail page (for create) or stay on form (for update)

**Error Flow**:
- **Validation fails** at step 3: errors displayed inline, form not submitted
- **Authorization fails** at step 6: error message displayed, user redirected if needed
- **Business rule violation** at step 7: error returned, form shows error message
- **Database error** at step 10: transaction rolls back, error logged, user-friendly message shown
- **Network error**: automatic retry with exponential backoff, manual retry option

### Integration Data Flow

Products integrate with multiple modules through defined APIs:

**Procurement Integration**:
1. User creates Purchase Request in Procurement module
2. Procurement calls Product API: GET /api/products/search?q=term
3. Product module returns matching products with cost data
4. User selects product, Procurement validates price against deviation limit
5. If price exceeds deviation, Procurement requests approval
6. Purchase Request saved with product reference

**GRN Cost Update Integration**:
1. User posts Goods Receipt Note in GRN module
2. GRN module calls Product API: POST /api/products/update-receiving-cost
3. Product module updates lastReceivingCost, lastReceivingDate, lastReceivingVendor
4. Activity log entry created
5. Success response returned to GRN module
6. GRN posting continues

**Inventory Integration**:
1. User creates inventory transaction in Inventory module
2. Inventory calls Product API: GET /api/products/{id}/inventory-data
3. Product module returns inventory unit, conversion rates, store thresholds
4. Inventory calls Product API: POST /api/products/convert-unit
5. Product module calculates conversion and returns result
6. Inventory records transaction in base unit
7. Inventory checks quantity against thresholds and triggers alerts if needed

---

## Server Actions

### Overview

All server-side operations are implemented as Next.js Server Actions in the actions.ts file. Server actions provide type-safe, server-side execution with automatic request handling and response serialization. Each action follows a consistent pattern: validate input, check authorization, execute business logic, handle errors.

### Create Operations

#### createProduct Action
**Purpose**: Create new product with all required information
**Input**: Product data object conforming to createProductSchema Zod validation
**Validation Steps**:
- Validate required fields (productCode, englishDescription, categoryId, inventoryUnitId)
- Check product code uniqueness (case-insensitive query)
- Validate category hierarchy (subcategory belongs to category, item group belongs to subcategory)
- Validate inventory unit exists in units master
- Validate numeric fields (standardCost >= 0, deviations 0-100%)
**Business Logic**:
- Set default values (isActive = true, status = 'Active')
- Inherit deviations from item group if not provided
- Generate UUID for product ID
- Set audit fields (createdBy, createdAt)
**Database Operations**:
- Begin transaction
- Insert product record
- Create activity log entry with action type 'CREATED'
- Commit transaction
**Returns**: Success object with product ID or error object with validation messages
**Authorization**: Requires create_product permission

#### createProductUnit Action
**Purpose**: Add unit (order or recipe) to product with conversion rate
**Input**: Product ID, unit ID, unit type (ORDER/RECIPE), conversion rate
**Validation**:
- Product exists and user has permission
- Unit exists in units master
- Unit not already assigned to product for this type
- Conversion rate positive, non-zero, max 5 decimals
**Business Logic**:
- Calculate reverse conversion rate for display
**Database Operations**:
- Insert product_unit record
- Create activity log entry 'UNIT_ADDED'
**Returns**: Success with unit details or error
**Authorization**: Requires update_product permission

### Read Operations

#### listProducts Action
**Purpose**: Fetch paginated, filtered list of products
**Input**: Filter options object containing:
- searchTerm (string, optional) - searches code, descriptions, barcode
- categoryId (UUID, optional) - filters by any category level
- status (ACTIVE/INACTIVE/ALL, default ALL)
- productType (RECIPE/SALE/BOTH/STOCK_ONLY, optional)
- storeId (UUID, optional) - filters by store assignment
- sortField (string, default 'productCode')
- sortDirection (ASC/DESC, default ASC)
- page (number, default 1)
- pageSize (number, default 25, max 100)
**Query Construction**:
- Build WHERE clause from filters with AND logic
- Use full-text search index for searchTerm
- JOIN categories table for category path
- JOIN product_store_assignments for store filter
- Apply soft delete filter (deleted_at IS NULL)
**Pagination**:
- Calculate offset: (page - 1) × pageSize
- Execute two queries in parallel: data query with LIMIT/OFFSET, count query for total
**Returns**: Object with products array and pagination metadata (total, page, pageSize, totalPages)
**Performance**: Uses database indexes on productCode, categoryId, isActive, deleted_at

#### getProductById Action
**Purpose**: Fetch single product with all related data
**Input**: Product UUID
**Query**:
- SELECT product with JOIN to categories for category path
- LEFT JOIN product_units for all assigned units
- LEFT JOIN product_store_assignments for store assignments
- LEFT JOIN product_attributes for custom attributes
- Filter on deleted_at IS NULL
**Returns**: Complete product object with nested arrays or null if not found
**Authorization**: Check user has view_product permission

#### getProductPurchaseHistory Action
**Purpose**: Fetch recent purchase orders and goods receipt notes
**Input**: Product ID
**Queries**: Two parallel queries to procurement database:
- 10 most recent purchase orders containing product (ORDER BY deliveryDate DESC)
- 10 most recent goods receipts for product (ORDER BY receiptDate DESC)
**Data Mapping**: Transform procurement data to display format with calculated columns
**Returns**: Object with purchaseOrders array and receipts array
**Authorization**: Check user has view_purchase_history permission

### Update Operations

#### updateProduct Action
**Purpose**: Update existing product with partial data
**Input**: Product ID and partial product data object
**Validation**:
- Product exists and not soft-deleted
- User has update_product permission
- Validate changed fields only (not full object)
- Product code cannot be changed (immutable after creation)
- Category change: validate hierarchy if category changed
- Inventory unit change: block if product has transaction history
**Business Logic**:
- Detect which fields changed by comparing to current values
- For cost change >10%: set pending approval flag, send notification
- For category change with history: display warning, require confirmation
**Database Operations**:
- Begin transaction
- UPDATE product record with new values
- For each changed field: INSERT activity log entry with field name, old value, new value
- Commit transaction
**Concurrency Handling**: Use updated_at timestamp to detect concurrent updates, return conflict error if detected
**Returns**: Updated product object or error
**Authorization**: Requires update_product permission

#### updateLastReceivingCost Action (System)
**Purpose**: Automatically update receiving cost from GRN posting
**Input**: Product ID, unit cost, receipt date, vendor name, GRN number
**Triggered By**: GRN Module when GRN is posted
**Validation**: Product exists, cost is valid number >= 0
**Database Operations**:
- UPDATE product: lastReceivingCost, lastReceivingDate, lastReceivingVendor
- INSERT activity log: action type 'COST_CHANGED', description includes GRN number
**Returns**: Success or error (non-fatal to GRN posting)
**Authorization**: System service account (not user-initiated)

### Delete Operations

#### deleteProduct Action (Soft Delete)
**Purpose**: Soft delete product by setting deleted_at timestamp
**Input**: Product ID
**Dependency Check**:
- Query purchase_orders for active POs with this product
- Query inventory_transactions for transactions in current fiscal period
- Query recipes for active recipes using this product
- Query sales_orders for open orders with this product
**Blocking Conditions**: If any dependencies found, return error with counts
**Database Operations** (if no dependencies):
- UPDATE product: deleted_at = current timestamp, deleted_by = current user
- INSERT activity log: action type 'DELETED'
**Returns**: Success or error with dependency details
**Authorization**: Requires delete_product permission (System Admin only)

---

## Database Schema Overview

**NOTE**: Detailed database definitions including table structures, column specifications, indexes, constraints, and relationships are documented in the [Data Dictionary (DD) document](./DD-products.md). This section provides a high-level technical overview only.

### Core Tables

#### products Table
**Purpose**: Main product master data table
**Key Technical Aspects**:
- Primary key: UUID (uuid_generate_v4())
- Unique constraint on product_code (case-insensitive)
- Foreign keys to categories (3 levels), units, users (audit)
- Soft delete column: deleted_at (TIMESTAMP WITH TIME ZONE, nullable)
- Audit columns: created_at, created_by, updated_at, updated_by, deleted_at, deleted_by
- Check constraints: standardCost >= 0, priceDeviation between 0 and 100
**Indexes**:
- Primary key index on id
- Unique index on product_code (case-insensitive with LOWER())
- Index on category_id, subcategory_id, item_group_id for filtering
- Index on is_active for status filtering
- Full-text search index on product_code, english_description, local_description, barcode
- Index on deleted_at for soft delete filtering

#### product_units Table
**Purpose**: Multi-unit assignments with conversion rates
**Key Technical Aspects**:
- Composite foreign key to products and units tables
- unit_type ENUM: 'INVENTORY', 'ORDER', 'RECIPE'
- conversion_rate NUMERIC(12, 5) for 5 decimal precision
- is_default BOOLEAN for default unit per type
- Unique constraint on (product_id, unit_id, unit_type) to prevent duplicates
**Indexes**:
- Index on product_id for efficient lookup by product
- Index on unit_type for filtering by type

#### product_store_assignments Table
**Purpose**: Product availability at stores with inventory thresholds
**Key Technical Aspects**:
- Foreign keys to products and stores tables
- minimum_quantity NUMERIC(15, 3) for 3 decimal precision
- maximum_quantity NUMERIC(15, 3) for 3 decimal precision
- Check constraint: maximum_quantity > minimum_quantity
- Unique constraint on (product_id, store_id) to prevent duplicate assignments
**Indexes**:
- Index on product_id for product-based queries
- Index on store_id for store-based queries

#### product_attributes Table
**Purpose**: Flexible key-value storage for custom attributes
**Key Technical Aspects**:
- Foreign key to products table with CASCADE delete
- attribute_key VARCHAR(100), attribute_value VARCHAR(500)
- data_type ENUM: 'TEXT', 'NUMBER', 'DATE', 'TEXTAREA'
- display_order INTEGER for sorting
- Unique constraint on (product_id, attribute_key) to prevent duplicate keys
**Indexes**:
- Index on product_id for efficient lookup
- Index on attribute_key for searching by attribute name

#### product_activity_log Table
**Purpose**: Complete audit trail of all product changes
**Key Technical Aspects**:
- Foreign key to products and users tables
- activity_type ENUM: 'CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED', 'UNIT_ADDED', 'UNIT_CHANGED', 'UNIT_REMOVED', 'STORE_ASSIGNED', 'STORE_REMOVED', 'COST_CHANGED'
- field_name VARCHAR(100) for updated field
- old_value, new_value TEXT for change tracking (JSON serialized)
- ip_address, user_agent for security audit
- Immutable (no UPDATE or DELETE, INSERT only)
**Indexes**:
- Index on product_id for product history
- Index on activity_date for chronological queries
- Index on activity_type for filtering by action

### Database Views

#### v_products_with_category_path View
**Purpose**: Pre-joined view with full category path for efficient queries
**Definition**: SELECT from products with triple JOIN to categories table for all three levels, concatenates category names into path string
**Usage**: Product list queries, search results, exports
**Performance**: Eliminates need for multiple JOINs in application queries

#### v_products_with_latest_cost View
**Purpose**: Products with latest receiving cost and vendor information
**Definition**: SELECT from products with last receiving cost details
**Usage**: Procurement reports, cost analysis queries
**Performance**: Avoids repeated subqueries for cost information

### Database Functions and Triggers

#### Trigger: audit_product_changes
**Purpose**: Automatically create activity log entries on product changes
**Fires**: AFTER INSERT, UPDATE, DELETE on products table
**Logic**: Compare OLD and NEW records, create activity log entry with changed fields
**Performance**: Minimal overhead, executes in same transaction

#### Function: calculate_unit_conversion
**Purpose**: Calculate conversion between any two units for a product
**Parameters**: product_id, from_unit_code, to_unit_code, quantity
**Logic**: Retrieve conversion rates, convert to base unit, then to target unit
**Returns**: Converted quantity with 3 decimal precision
**Usage**: Called from inventory module, recipe module for unit conversions

---

## State Management

### Global UI State (Zustand)

**Store Name**: productStore
**Purpose**: Manage UI state that needs to be shared across product components
**State Properties**:
- selectedProducts: Array of product IDs currently selected in list
- filterState: Object with search term, category filter, status filter, product type filter, store filter
- sortState: Object with sort field and sort direction
- viewMode: 'list' or 'grid' display mode
- sidebarCollapsed: Boolean for sidebar expanded/collapsed state
**Action Methods**:
- setSelectedProducts: Update selected IDs array
- toggleProductSelection: Add/remove product ID from selection
- clearSelection: Empty selected products array
- updateFilters: Merge new filters into filter state
- resetFilters: Clear all filters to default
- updateSort: Change sort field and direction
- toggleViewMode: Switch between list and grid
- toggleSidebar: Expand/collapse sidebar
**Persistence**: Filter state persisted to localStorage, restored on page load
**When to Use**: Cross-component UI state that doesn't come from server

### Server State (React Query)

**Query Keys Structure**: Hierarchical structure for granular cache invalidation
- ['products'] - All products queries
- ['products', 'list', filterState] - Specific list query with filter params
- ['products', 'detail', productId] - Single product detail
- ['products', 'purchase-history', productId] - Purchase history for product
- ['units'] - Units master data
- ['categories'] - Categories master data
- ['stores'] - Stores master data

**Cache Strategy**: Stale-while-revalidate pattern
- staleTime: 5 minutes for list queries (data changes infrequently)
- cacheTime: 30 minutes (keep in cache even if not actively used)
- refetchOnWindowFocus: true (refresh when user returns to tab)
- refetchOnReconnect: true (refresh when network reconnects)

**Custom Hooks**:

**useProducts Hook**:
- Purpose: Fetch filtered, paginated product list
- Parameters: Filter options object
- Query Key: ['products', 'list', filterOptions]
- Returns: products array, isLoading, error, pagination metadata
- Enabled: Always enabled (runs on mount)
- Refetch Interval: None (only manual refetch)

**useProduct Hook**:
- Purpose: Fetch single product by ID with related data
- Parameters: Product ID
- Query Key: ['products', 'detail', productId]
- Returns: product object, isLoading, error
- Enabled: Only when productId is provided
- Related Data: Includes units, store assignments, attributes (pre-joined)

**useProductPurchaseHistory Hook**:
- Purpose: Fetch recent POs and GRNs for product
- Parameters: Product ID
- Query Key: ['products', 'purchase-history', productId]
- Returns: purchaseOrders array, receipts array, isLoading
- Enabled: False initially, enabled when modal opens (lazy loading)
- Stale Time: 1 minute (history changes frequently during procurement)

**Mutation Hooks**:

**useCreateProduct Mutation**:
- Mutation Function: Calls createProduct server action
- Optimistic Update: None (wait for server confirmation)
- On Success:
  - Invalidate ['products', 'list'] queries (refresh all lists)
  - Show success toast message
  - Navigate to product detail page
- On Error: Display error message in toast, keep form data for correction

**useUpdateProduct Mutation**:
- Mutation Function: Calls updateProduct server action
- Optimistic Update: Update cache immediately with new values
- On Success:
  - Invalidate ['products', 'detail', productId] query
  - Invalidate ['products', 'list'] queries (product may appear in multiple lists)
  - Show success toast
- On Error: Revert optimistic update, display error message

**useDeleteProduct Mutation**:
- Mutation Function: Calls deleteProduct server action
- Optimistic Update: None (wait for dependency check)
- On Success:
  - Remove from ['products', 'list'] cache
  - Invalidate related queries
  - Show success toast
  - Navigate to products list
- On Error: Display error with dependency details, offer resolution guidance

**Cache Invalidation Strategy**:
- Create: Invalidate all list queries
- Update: Invalidate specific detail and all list queries
- Delete: Remove from cache and invalidate lists
- Bulk Operations: Invalidate all products queries
- Related Changes: Invalidate when categories, units, or stores change

---

## Security Implementation

### Authentication

**Provider**: Supabase Auth with JWT tokens
**Flow**:
- User logs in via login page with email/password
- Supabase Auth validates credentials, returns JWT access token and refresh token
- Access token stored in HTTP-only cookie (secure, sameSite: strict)
- Refresh token stored in secure cookie with longer expiration
- Token included automatically in all requests via cookie

**Session Management**:
- Access token expires after 1 hour
- Refresh token expires after 30 days
- Automatic refresh via Supabase client before access token expiration
- Session invalidation on logout (server-side token revocation)

**Protected Routes**:
- All product routes require authentication
- Middleware checks for valid session on each request
- Unauthenticated users redirected to login page with return URL

### Authorization

**Role-Based Access Control (RBAC)**:
- Roles defined: admin, manager, procurement_staff, inventory_staff, viewer
- Permissions assigned to roles: create_product, update_product, delete_product, view_product, view_costs, import_products
- User-role mapping stored in user_roles table
- Role checked on every server action execution

**Permission Checks**:
- Server actions check user permissions before executing business logic
- Permission helper function: hasPermission(userId, permissionName)
- Query user_roles table with JOIN to roles and role_permissions tables
- Cache permission results in session for performance

**Resource-Level Security**:
- Users can only access products in their assigned departments (if department-scoped)
- Store managers can only assign products to their own stores
- Cost information hidden from users without view_costs permission

**Row-Level Security (RLS)**:
- Supabase RLS policies applied to products table
- Policy filters rows based on user role and department
- Automatic enforcement at database level
- Bypassed for service account (system operations)

### Data Protection

**Input Validation**:
- All form inputs validated with Zod schemas on client
- Server actions re-validate with same schemas (defense in depth)
- Dangerous characters escaped before display (XSS prevention)
- File uploads restricted to specific types and sizes

**SQL Injection Prevention**:
- All database queries use parameterized queries via Supabase client
- No string concatenation in SQL statements
- Prepared statements for complex queries
- Database user has minimal required permissions

**XSS Protection**:
- React automatically escapes output by default
- Dangerous HTML rendering disabled (no dangerouslySetInnerHTML)
- Content Security Policy headers configured
- User-generated content sanitized before storage

**CSRF Protection**:
- Next.js provides automatic CSRF protection for server actions
- CSRF tokens verified on all state-changing requests
- SameSite cookie attribute set to 'strict'

**Data Encryption**:
- HTTPS enforced for all requests (HTTP redirects to HTTPS)
- Database connections encrypted with TLS
- Sensitive fields (if any) encrypted at application level
- Passwords hashed with bcrypt (handled by Supabase Auth)

### Audit Logging

**What is Logged**:
- All product create, update, delete operations
- User ID, timestamp, IP address, user agent
- Changed fields with before/after values
- Authentication events (login, logout, failed attempts)
- Authorization failures (permission denied attempts)

**Log Storage**:
- Activity log stored in product_activity_log table
- Authentication logs stored by Supabase Auth
- Application logs sent to centralized logging service

**Log Retention**:
- Activity logs retained indefinitely (compliance requirement)
- Authentication logs retained for 2 years
- Application logs retained for 90 days

**Log Access**:
- Activity logs viewable by admin users in product detail page
- Export to CSV for audit reports
- Searchable by date range, user, action type
- Real-time monitoring dashboard for security team

---

## Error Handling

### Client-Side Error Handling

**Form Validation Errors**:
- Display inline below form fields in red text
- Highlight invalid fields with red border
- Show field-level error messages from Zod validation
- Clear errors when user corrects field
- Prevent form submission until all errors resolved

**Server Action Errors**:
- Catch errors from server actions in try-catch blocks
- Display error messages in toast notifications
- Show detailed error for development, generic message for production
- Log errors to console in development
- Provide retry button for transient errors

**Network Errors**:
- React Query automatically retries failed requests (3 attempts with exponential backoff)
- Display "Network error, retrying..." message during retries
- After max retries, show "Network error" with manual retry button
- Disable UI interactions during retry attempts

**Component Error Boundaries**:
- Error boundary components wrap feature areas
- Catch React component errors during rendering
- Display fallback UI with error message and reload button
- Log error details to error tracking service (Sentry)
- Prevent entire app crash from component error

### Server-Side Error Handling

**Validation Errors**:
- Zod throws ZodError with detailed validation issues
- Catch ZodError and format as user-friendly messages
- Return structured error response: {success: false, errors: [{field, message}]}
- Client displays field-level errors

**Authorization Errors**:
- Throw UnauthorizedError when user lacks permission
- Catch in error handler and return 403 Forbidden response
- Client redirects to login or shows permission denied message
- Log authorization failures to security log

**Business Rule Violations**:
- Throw BusinessRuleError with specific rule code
- Example: PRODUCT_CODE_DUPLICATE, PRICE_DEVIATION_EXCEEDED
- Return error with code and user-friendly message
- Client displays error message with guidance on resolution

**Database Errors**:
- Catch database errors (connection, constraint, deadlock)
- Log error with full context (query, parameters, stack trace)
- Rollback transaction automatically
- Return generic error to client: "Unable to save. Please try again."
- Alert monitoring system for database errors

**Unhandled Exceptions**:
- Global error handler catches all unhandled exceptions
- Log to error tracking service with request context
- Return 500 Internal Server Error to client
- Send alert to on-call engineer for critical errors
- Display generic error message to user

### Error Response Format

All server actions return consistent response format:

**Success Response**:
- success: true
- data: Result object (product, list, etc.)
- message: Optional success message

**Error Response**:
- success: false
- error: Error message string
- errors: Array of field-level errors (for validation)
- code: Error code for client handling (VALIDATION_ERROR, NOT_FOUND, etc.)

---

## Performance Optimization

### Frontend Optimization

**Code Splitting**:
- Next.js automatically splits pages and routes
- Dynamic imports for large components (modal dialogs, charts)
- Lazy load purchase history modal component
- Load Zod schemas only when needed

**React Component Optimization**:
- Memo components that receive complex props (ProductList, ProductDetail)
- useCallback for event handlers passed to child components
- useMemo for expensive calculations (filtered lists, sorted data, unit conversions)
- Virtualization for long product lists (react-window) with 1000+ items

**Image Optimization**:
- Next.js Image component for automatic optimization
- Lazy loading images below fold
- Responsive images with srcset for different screen sizes
- WebP format with fallback for older browsers

**Search and Filter Optimization**:
- Debounce search input (300ms delay)
- Throttle scroll events for infinite scroll
- Client-side filtering for small datasets (<100 items)
- Server-side filtering for large datasets

**Bundle Size Optimization**:
- Tree shaking removes unused code
- Import only needed components from libraries
- Minimize dependencies, use lighter alternatives
- Analyze bundle size with webpack bundle analyzer

### Backend Optimization

**Database Query Optimization**:
- Indexes on frequently queried columns (see Database Schema section)
- Avoid N+1 queries with proper JOINs
- Use database views for complex pre-joined queries
- EXPLAIN ANALYZE queries to identify slow operations
- Connection pooling to reduce connection overhead

**Caching Strategy**:
- React Query caches GET requests for 5 minutes
- Database query result caching for master data (categories, units) with 1 hour TTL
- Invalidate cache on data changes
- HTTP cache headers for static assets (1 year)

**API Response Optimization**:
- Paginate large result sets (default 25, max 100 per page)
- Return only needed fields (select specific columns)
- Compress responses with gzip
- Use streaming for large data exports

**Pagination Implementation**:
- Server-side pagination with offset and limit
- Parallel queries for data and total count
- Return metadata: total, page, pageSize, totalPages, hasNext, hasPrevious
- Cursor-based pagination for real-time data (if needed)

### Search Performance

**Full-Text Search**:
- PostgreSQL full-text search with GIN index
- Search across product_code, english_description, local_description, barcode
- Rank results by relevance (ts_rank)
- Support for partial word matches with prefix searching

**Search Index Maintenance**:
- Trigger updates search vector on product insert/update
- Periodic reindex job to rebuild search index
- Monitor index size and query performance

---

## Testing Strategy

### Unit Tests

**Location**: Components and server actions have co-located test files (ComponentName.test.tsx, actions.test.ts)
**Framework**: Vitest for test runner, React Testing Library for component tests
**Coverage Target**: 80% code coverage for business logic, 70% for components
**Focus Areas**:
- Server action validation logic with various inputs
- Business rule enforcement (deviation validation, cost calculations)
- Zod schema validation with edge cases
- Utility functions (unit conversion, formatters)
- Component rendering with different props and states

**Test Patterns**:
- Describe blocks group related tests by feature
- Test happy path and error paths for each function
- Mock database calls with in-memory database or mocks
- Use fixtures for consistent test data
- Snapshot tests for component output

**Example Test Structure** (described in text):
Test suite for createProduct server action includes:
- Test case: Successfully creates product with valid data - mocks database insert, verifies product created with correct fields
- Test case: Rejects duplicate product code - mocks database query returning existing product, verifies error returned
- Test case: Validates required fields - provides incomplete data, verifies validation error for missing fields
- Test case: Inherits deviations from item group - provides product without deviations, verifies inherited values from category
- Test case: Creates activity log entry - verifies activity log insert called with correct action type

### Integration Tests

**Location**: __tests__/integration/ directory
**Framework**: Vitest with Supabase local development for test database
**Coverage Target**: 70% of critical user workflows
**Focus Areas**:
- Complete CRUD workflows (create product, update, delete)
- Database transactions and rollback behavior
- Cross-table queries and JOINs
- Data validation with real database constraints
- Integration with external module APIs

**Test Database Setup**:
- Supabase local development with test database
- Database schema applied from migrations
- Test data seeded before each test suite
- Database reset between test suites
- Cleanup after all tests complete

**Example Integration Test** (described in text):
Test suite for product creation workflow includes:
- Setup: Seed categories, units, stores in test database
- Test case: Create product with units and store assignments - inserts product, units, store assignments in transaction, verifies all records created
- Test case: Rollback on error - attempts invalid insert, verifies transaction rolled back, no partial data
- Test case: Activity log created - verifies activity log entry exists after product creation
- Teardown: Clean up test data

### E2E Tests

**Location**: e2e/ directory at project root
**Framework**: Playwright for cross-browser testing
**Focus Areas**:
- Critical user workflows end-to-end (create product, search, edit)
- Form submissions with validation errors
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Responsive design on different screen sizes
- Authentication and authorization flows

**Test Execution**:
- Run on staging environment before production deployment
- Run nightly on main branch
- Run on pull requests for critical changes
- Parallel execution across browsers

**Example E2E Test** (described in text):
Test spec for creating product includes:
- Step 1: Navigate to products list page, verify page loads
- Step 2: Click "Create Product" button, verify form displays
- Step 3: Fill product code, description, category, unit fields
- Step 4: Submit form, wait for server action to complete
- Step 5: Verify success message displays
- Step 6: Verify redirected to product detail page
- Step 7: Verify product data displays correctly
- Step 8: Take screenshot for visual regression testing

**Visual Regression Testing**:
- Playwright screenshot comparison
- Baseline screenshots stored in version control
- Compare new screenshots to baseline
- Flag differences for manual review
- Update baseline on intentional changes

---

## Deployment Configuration

### Environment Variables

**Database Configuration**:
- DATABASE_URL: PostgreSQL connection string for Supabase (connection pooler)
- DIRECT_URL: Direct PostgreSQL connection for migrations (non-pooled)
- Both URLs include authentication credentials and SSL settings

**Authentication Configuration**:
- NEXTAUTH_SECRET: Secret key for JWT signing (random 32-character string)
- NEXTAUTH_URL: Full URL of application (https://carmen.example.com)
- SUPABASE_URL: Supabase project URL
- SUPABASE_ANON_KEY: Supabase anonymous key for client-side calls
- SUPABASE_SERVICE_ROLE_KEY: Service role key for server-side admin operations

**External Service Configuration**:
- SENTRY_DSN: Sentry project DSN for error tracking (if used)
- VERCEL_ENV: Environment name (production/preview/development)
- NODE_ENV: Node environment (production/development)

**Feature Flags**:
- ENABLE_BULK_IMPORT: Enable/disable bulk import feature (true/false)
- ENABLE_PURCHASE_HISTORY: Enable/disable purchase history modal (true/false)

### Build Configuration

**Next.js Configuration** (next.config.js):
- Output: Standalone build for serverless deployment
- Image domains: Allow images from Supabase storage domain
- Redirects: None currently configured
- Headers: Security headers including CSP, X-Frame-Options, X-Content-Type-Options
- Webpack: Custom configuration for alias imports (@/ for app root)

**TypeScript Configuration**:
- Strict mode enabled for maximum type safety
- Path aliases configured (@/ for src directory)
- Include all app and lib directories
- Exclude node_modules, .next, out directories

**Environment-Specific Configuration**:
- Development: Hot reload, detailed error messages, source maps
- Staging: Production build, staging database, verbose logging
- Production: Minified build, production database, error tracking, minimal logging

### Database Migrations

**Migration Tool**: Supabase CLI or custom migration scripts
**Migration Files Location**: supabase/migrations/ directory
**Naming Convention**: YYYYMMDD_HHMMSS_description.sql (timestamped)

**Migration Workflow**:
1. Developer creates migration file with new schema changes
2. Migration tested in local Supabase development environment
3. Migration committed to version control
4. CI/CD pipeline runs migrations on staging database
5. Staging deployment tested with new schema
6. Manual approval gate before production migration
7. Production migration executed during maintenance window
8. Application deployed with migration applied

**Migration Commands** (described):
- Create migration: supabase migration new migration_name
- Run migrations: supabase db push (applies pending migrations)
- Rollback: Manual execution of down migration script
- Status: supabase migration list (shows applied and pending)

**Migration Best Practices**:
- Always include rollback steps in migration file comments
- Test migrations on copy of production data
- Avoid destructive operations during business hours
- Create indexes CONCURRENTLY to avoid table locks
- Add columns as nullable first, backfill data, then add NOT NULL constraint

---

## Dependencies

### npm Packages

**Core Framework and Libraries**:

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| react | ^18.2.0 | UI library and component model | MIT |
| next | ^14.0.0 | Full-stack framework with App Router | MIT |
| typescript | ^5.0.0 | Type safety and developer experience | Apache-2.0 |

**UI and Styling**:

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| tailwindcss | ^3.4.0 | Utility-first CSS framework | MIT |
| @radix-ui/react-* | ^1.0.0 | Accessible UI primitives (14 packages) | MIT |
| lucide-react | ^0.300.0 | Icon library | ISC |
| class-variance-authority | ^0.7.0 | Component variant styling | Apache-2.0 |
| clsx | ^2.0.0 | Conditional className utility | MIT |
| tailwind-merge | ^2.0.0 | Merge Tailwind classes intelligently | MIT |

**Form Handling and Validation**:

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| react-hook-form | ^7.48.0 | Performant form state management | MIT |
| zod | ^3.22.0 | Schema validation for forms and API | MIT |
| @hookform/resolvers | ^3.3.0 | Zod integration with React Hook Form | MIT |

**State Management**:

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| zustand | ^4.4.0 | Lightweight global state management | MIT |
| @tanstack/react-query | ^5.0.0 | Server state caching and synchronization | MIT |

**Database and Backend**:

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| @supabase/supabase-js | ^2.38.0 | Supabase client for database and auth | MIT |
| @supabase/ssr | ^0.0.10 | Supabase Server-Side Rendering support | MIT |

**Utilities**:

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| date-fns | ^2.30.0 | Date manipulation and formatting | MIT |
| uuid | ^9.0.0 | UUID generation (rarely needed, DB handles) | MIT |

**Development Dependencies**:

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| vitest | ^1.0.0 | Unit test runner | MIT |
| @testing-library/react | ^14.0.0 | React component testing | MIT |
| @playwright/test | ^1.40.0 | End-to-end testing | Apache-2.0 |
| eslint | ^8.50.0 | Code linting | MIT |
| prettier | ^3.0.0 | Code formatting | MIT |
| @types/* | latest | TypeScript type definitions | MIT |

### Internal Dependencies

**Shared Components** (from components/ui/):
- Button, Input, Select, Checkbox, Radio, Textarea - Form controls
- Table, Card, Badge, Separator - Layout and display
- Dialog, Sheet, Popover, Tooltip - Overlay components
- Toast - Notification system
- All components from Shadcn/ui library, customized for project

**Shared Utilities** (from lib/):
- cn: className merging utility (clsx + tailwind-merge)
- formatters: Currency, date, number formatting functions
- validators: Reusable validation functions
- api-client: Centralized API client with error handling

**Shared Types** (from lib/types/):
- User: User account and authentication types
- Category: Category hierarchy types (shared with Categories module)
- Unit: Unit master data types (shared with Units module)
- Store: Store/location types
- Common: Shared types like Money, DateRange, Pagination

**Context Providers**:
- UserContext: Current user information and permissions
- ThemeContext: Theme and dark mode settings (if applicable)
- Dependes on user-context.tsx for role and permission data

---

## Monitoring and Logging

### Application Logging

**Logging Library**: Custom logging utility wrapping console with structured output

**Log Levels**:
- Debug: Detailed execution information (development only, not in production)
- Info: Successful operations, user actions, system events
- Warning: Recoverable errors, unusual conditions, deprecated feature usage
- Error: Failed operations, exceptions, data inconsistencies

**What is Logged**:
- All server action executions with input parameters (sanitized)
- Database query performance (queries taking >1 second)
- External API calls with response time
- Authentication events (login, logout, token refresh)
- Authorization failures with user and resource details
- Errors with full stack trace and request context
- Performance metrics (page load time, API response time)

**Log Structure** (described as JSON):
- timestamp: ISO 8601 format with timezone
- level: debug/info/warning/error
- message: Human-readable log message
- context: Object with relevant data (userId, productId, etc.)
- requestId: Unique ID for request tracing
- duration: Execution time in milliseconds (for operations)
- error: Error object with stack trace (for errors)

**Log Storage**:
- Development: Console output only
- Staging: Console + database table (system_logs) for persistent storage
- Production: Console + centralized logging service (e.g., Datadog, LogDNA)

**Log Retention**:
- Development: No retention (console only)
- Staging: 30 days in database
- Production: 90 days in logging service, 1 year for error logs

### Performance Monitoring

**Metrics Tracked**:
- Page Load Time: Time from navigation to interactive (target <3 seconds)
- API Response Time: Server action execution time (target <500ms for reads, <1s for writes)
- Database Query Time: Individual query performance (target <100ms)
- Search Response Time: Full-text search performance (target <1 second)
- Cache Hit Rate: Percentage of requests served from React Query cache (target >70%)

**Monitoring Tools**:
- Vercel Analytics: Built-in performance monitoring for page loads
- Custom middleware: Tracks server action execution time
- Database: pg_stat_statements extension for query performance
- React Query DevTools: Cache hit rate and query performance in development

**Performance Dashboards**:
- Real-time dashboard showing current response times
- Historical charts for performance trends over time
- Percentile metrics (p50, p95, p99) for response times
- Slowest queries report for optimization priorities

### Alerts

**Alert Channels**:
- Email: For non-urgent alerts during business hours
- Slack: For warnings and moderate-priority issues
- PagerDuty: For critical errors requiring immediate response

**Alert Conditions**:

**Critical Alerts** (immediate response required):
- Error rate >5% over 5-minute window
- Database connection failures
- Authentication service down
- Data corruption detected (failed constraint checks)
- Security events (unauthorized access attempts)

**Warning Alerts** (response within 1 hour):
- Error rate >2% over 15-minute window
- Average response time >2 seconds for 10 minutes
- Database query performance degradation (>1 second average)
- High memory usage (>80% for 15 minutes)
- Disk space low (<20% available)

**Info Alerts** (review within 24 hours):
- Unusual activity patterns (e.g., bulk imports at odd hours)
- Deprecated API usage
- Configuration changes
- Scheduled job failures (non-critical)

**Alert Escalation**:
- Level 1: On-call engineer notified via PagerDuty
- Level 2: If not acknowledged within 15 minutes, escalate to backup
- Level 3: If not resolved within 1 hour, escalate to team lead

---

## Technical Debt

| Item | Priority | Effort | Impact | Notes |
|------|----------|--------|--------|-------|
| Implement optimistic concurrency control for product updates | High | Medium | Prevents data loss from concurrent edits by multiple users | Currently uses timestamp check, should use version field |
| Add full-text search highlighting in results | Medium | Small | Improved user experience showing matched terms | Currently returns matches without highlighting |
| Implement virtual scrolling for product list | Medium | Medium | Better performance with 1000+ products | Currently loads all products in page, slow for large datasets |
| Add export to Excel with formatting | Low | Medium | Better formatted exports with headers, colors | Currently exports raw CSV data |
| Implement product image upload and display | Low | Large | Visual product identification | Currently text-only, images planned for Phase 2 |
| Add bulk edit capabilities for multiple products | Low | Medium | Efficiency for updating many products at once | Currently must edit products individually |
| Implement real-time collaboration (WebSocket) | Low | Large | See other users editing same product | Currently no real-time updates, relies on refetch |

---

## Migration Guide

**NOTE**: This is a new module with no existing functionality to replace. This section describes data migration from legacy systems.

### Data Migration from Legacy System

**Source Data**: Excel spreadsheets and Access database tables from legacy system

**Migration Phases**:

**Phase 1: Master Data Migration**
- Migrate categories (three-level hierarchy) from Excel spreadsheet
- Validate category structure, ensure all three levels complete
- Migrate units master data from Access units table
- Map legacy unit codes to new system unit IDs

**Phase 2: Product Master Migration**
- Extract products from Access products table
- Clean and validate product codes (remove duplicates, standardize format)
- Map legacy categories to new category IDs
- Map legacy units to new unit IDs
- Import products in batches of 1000 records
- Validate each batch before committing

**Phase 3: Product Units Migration**
- Extract unit assignments from Access product_units table
- Calculate conversion rates from legacy system formulas
- Verify conversion rate accuracy with sample calculations
- Import order units and recipe units

**Phase 4: Product Attributes Migration**
- Extract custom fields from Excel spreadsheets
- Map to key-value attributes structure
- Import attributes for products that have them

**Migration Tools**:
- Custom Node.js script for data extraction and transformation
- Zod validation for data quality checks before import
- Bulk import API for efficient data loading
- Error logging and reporting for failed records

**Migration Steps**:
1. Export all data from legacy system to CSV files
2. Run data validation script to identify issues
3. Clean data in Excel/Access based on validation report
4. Run test migration to staging environment
5. Validate migrated data with business users
6. Fix any issues and repeat until clean
7. Run production migration during planned maintenance window
8. Verify all data migrated successfully
9. Run parallel comparison for 2 weeks (legacy vs new system)
10. Cut over to new system after validation complete

### Data Transformation Rules

**Product Code Normalization**:
- Legacy codes may have leading zeros, spaces, inconsistent casing
- Transformation: Trim whitespace, convert to uppercase, pad with zeros to fixed length
- Duplicate detection: Compare case-insensitive after normalization

**Category Mapping**:
- Legacy system has 2-level structure, new system requires 3 levels
- Transformation: Map legacy categories to new structure, create default item groups where needed
- Manual review required for ambiguous mappings

**Unit Conversion Rates**:
- Legacy system stores formulas, new system stores rates
- Transformation: Evaluate formulas to calculate numeric rates
- Round to 5 decimal places for consistency

### Rollback Plan

If migration encounters critical issues:

**Immediate Rollback** (within 1 hour of cutover):
1. Switch application to maintenance mode
2. Restore database from pre-migration backup
3. Switch DNS back to legacy system
4. Notify users of rollback
5. Investigate and fix migration issues
6. Schedule new migration date

**Delayed Rollback** (after cutover if issues discovered later):
1. Cannot rollback database (data entered in new system)
2. Run data sync script to copy new data back to legacy system
3. Switch users to legacy system
4. Fix migration issues
5. Re-run migration with new data included

---

## Appendix

### Related Documents

- [Business Requirements](./BR-products.md) - Detailed business requirements
- [Use Cases](./UC-products.md) - User and system use cases
- [Data Dictionary](./DD-products.md) - Database schema definitions
- [Flow Diagrams](./FD-products.md) - Process and data flow diagrams
- [Validations](./VAL-products.md) - Validation rules and error messages

### Useful Commands

**Development**:
```
npm run dev                    # Start development server on localhost:3000
npm run dev:db                 # Start Supabase local database
npm run dev:debug              # Start with Node debugger attached
```

**Testing**:
```
npm run test                   # Run unit tests with Vitest
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Generate coverage report
npm run test:integration       # Run integration tests
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:ui            # Run E2E tests with Playwright UI
```

**Database**:
```
npm run db:migrate             # Run pending migrations
npm run db:migrate:create      # Create new migration file
npm run db:seed                # Seed database with test data
npm run db:reset               # Reset database to clean state
npm run db:studio              # Open Supabase Studio for database admin
```

**Linting and Formatting**:
```
npm run lint                   # Run ESLint
npm run lint:fix               # Fix ESLint errors automatically
npm run format                 # Format code with Prettier
npm run type-check             # Run TypeScript type checking
```

**Build and Deployment**:
```
npm run build                  # Build production bundle
npm run start                  # Start production server
npm run analyze                # Analyze bundle size with webpack analyzer
```

---

**Document End**

> 📝 **Note to Implementation Team**:
> - This technical specification provides implementation guidance without actual code
> - Refer to code repository for actual implementation details
> - Database schema details documented in DD-products.md
> - Keep this document updated as architecture evolves
> - Review and approve major architectural changes before implementation
