# Technical Specification: Units Management

## Module Information
- **Module**: Product Management
- **Sub-Module**: Units Management
- **Route**: `/product-management/units`
- **Version**: 1.0.0
- **Last Updated**: 2025-02-11
- **Owner**: Product Management Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-02-11 | Product Management Team | Initial version |

---

## Overview

The Units Management sub-module provides a comprehensive system for managing measurement units used throughout the CARMEN hospitality ERP system. This sub-module is built using Next.js 14 App Router with React 18, TypeScript, and modern React patterns including hooks and functional components.

The implementation follows a clean architecture pattern with clear separation between presentation (React components), state management (local state with hooks), and business logic (server actions). The user interface is built with Shadcn/ui components styled with Tailwind CSS, providing a consistent and responsive user experience.

Units are categorized into three types: INVENTORY units for stock management, ORDER units for purchasing operations, and RECIPE units for kitchen preparation. This categorization ensures proper unit usage across different operational contexts while maintaining data integrity through validation rules and business logic enforcement.

**⚠️ IMPORTANT: This is a Technical Specification Document - TEXT FORMAT ONLY**
- **DO NOT include actual code** - describe implementation patterns in text
- **DO NOT include TypeScript/JavaScript code** - describe component responsibilities
- **DO NOT include SQL code** - refer to DD (Data Dictionary) document for database descriptions
- **DO include**: Architecture descriptions, component responsibilities, data flow descriptions, integration patterns
- **Focus on**: WHAT components do, HOW they interact, WHERE data flows - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-units.md) - Business requirements in text format (no code)
- [Use Cases](./UC-units.md) - Use cases in text format (no code)
- [Data Dictionary](./DD-units.md) - Data dictionary definitions in text format (no SQL code)
- [Flow Diagrams](./FD-units.md) - Visual diagrams (no code)
- [Validations](./VAL-units.md) - Validation rules in text format (no code)

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Units sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/product-management/units)']
    CreatePage['Create Page<br>(/product-management/units/new)']
    DetailPage["Detail Page<br>(/product-management/units/[id])"]
    EditPage["Edit Page<br>(/product-management/units/[id]/edit)"]

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
**Route**: `/product-management/units`
**File**: `page.tsx`
**Purpose**: Display paginated list of all units

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all units
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/product-management/units/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive unit details

**Sections**:
- Header: Breadcrumbs, unit title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change unit status with reason

#### 3. Create Page
**Route**: `/product-management/units/new`
**File**: `new/page.tsx`
**Purpose**: Create new unit

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/product-management/units/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing unit

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## Architecture

### High-Level Architecture

The Units Management sub-module follows the Next.js 14 App Router architecture with React Server Components (RSC) as the default rendering strategy and Client Components for interactive features.

```
┌─────────────────────────────────────┐
│         Browser (Client)            │
│  ┌───────────────────────────────┐  │
│  │   React Client Components     │  │
│  │  - Unit List (Interactive)    │  │
│  │  - Search & Filter UI         │  │
│  │  - Forms & Dialogs            │  │
│  └───────────┬───────────────────┘  │
└──────────────┼──────────────────────┘
               │ HTTP/HTTPS
               │ (Server Actions)
               ▼
┌─────────────────────────────────────┐
│      Next.js 14 Server              │
│  ┌───────────────────────────────┐  │
│  │   React Server Components     │  │
│  │  - Page Wrapper               │  │
│  │  - Initial Data Fetching      │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│  ┌───────────▼───────────────────┐  │
│  │      Server Actions           │  │
│  │  - CRUD Operations            │  │
│  │  - Business Logic             │  │
│  │  - Validation Layer           │  │
│  └───────────┬───────────────────┘  │
└──────────────┼──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    PostgreSQL Database              │
│    (via Supabase)                   │
│  - units table                      │
│  - Audit logs                       │
│  - Constraints & Indexes            │
└─────────────────────────────────────┘
```

**Data Flow Summary**:
1. Browser renders React Client Components with interactive UI elements
2. User actions trigger Server Actions via HTTP requests
3. Server Actions execute business logic and database operations
4. Database returns results which flow back through the Server Actions
5. Client Components update UI based on server responses

### Component Architecture

The component architecture is organized into three distinct layers:

**Presentation Layer** (Client Components):
- Page wrapper component that serves as the entry point
- Unit list component with search, filter, and table/card views
- Unit form component for create and edit operations
- Dialog components for inline editing and confirmations
- Filter controls for status and unit type
- Search input with real-time filtering
- View mode toggle (table/cards)

**Business Logic Layer** (Server Actions):
- Create unit action with validation and duplicate checking
- Read unit actions for list and detail retrieval
- Update unit action with optimistic locking
- Delete unit action with dependency checking
- Validation functions using Zod schemas
- Business rule enforcement functions

**Data Access Layer**:
- Database queries via Supabase client
- Transaction management for complex operations
- Audit log insertion for all write operations
- Query optimization with proper indexes
- Error handling and rollback mechanisms

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.0 (App Router with React Server Components)
- **UI Library**: React 18.3.1
- **Language**: TypeScript 5.8.2 (strict mode enabled)
- **Styling**: Tailwind CSS 3.4.1 with custom configuration
- **Component Library**: Shadcn/ui components built on Radix UI primitives
- **Form Handling**: React Hook Form 7.x with Zod validation
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns 3.x for date formatting and manipulation

### Backend
- **Runtime**: Node.js 20.14.0
- **Framework**: Next.js Server Actions for server-side operations
- **Database**: PostgreSQL (via Supabase)
- **Database Client**: Supabase JavaScript Client
- **Validation**: Zod 3.x for schema validation
- **Authentication**: NextAuth.js / Supabase Auth integration
- **Audit Logging**: Custom audit trail implementation

### Development Tools
- **Package Manager**: npm 10.7.0
- **Code Quality**: ESLint with Next.js configuration
- **Type Checking**: TypeScript compiler with strict checks
- **Testing**: Vitest for unit and integration tests
- **E2E Testing**: Playwright for end-to-end testing

### DevOps
- **Version Control**: Git with GitHub
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Hosting**: Vercel for Next.js application hosting
- **Database Hosting**: Supabase managed PostgreSQL
- **Monitoring**: Vercel Analytics for performance monitoring

---

## Component Structure

### Directory Structure

```
app/(main)/product-management/units/
├── page.tsx                          # Main page wrapper (Server Component)
├── components/
│   ├── unit-list-improved.tsx        # Main list component (Client Component)
│   ├── unit-dialog.tsx               # Create/Edit dialog
│   ├── unit-filters.tsx              # Filter controls
│   ├── unit-table.tsx                # Table view component
│   └── unit-cards.tsx                # Card view component
├── data/
│   └── mock-units.ts                 # Mock data for development
├── actions.ts                        # Server actions for CRUD operations
└── types.ts                          # TypeScript interfaces and types

lib/
├── types/
│   └── product.ts                    # Shared Unit interface and types
└── validations/
    └── unit-validation.ts            # Zod schemas for validation
```

### Key Components

#### Page Component
**File**: `page.tsx`
**Type**: React Server Component
**Purpose**: Entry point for the Units Management page

**Responsibilities**:
- Serve as the main route handler for the units URL path
- Render the page layout with proper Next.js metadata
- Import and render the UnitList client component
- Handle server-side rendering and initial page load
- Manage page-level error boundaries

**Implementation Pattern**: Simple wrapper component that delegates all interactive functionality to client components while maintaining the benefits of Server Components for initial page load performance.

#### Unit List Component
**File**: `components/unit-list-improved.tsx`
**Type**: Client Component (marked with "use client" directive)
**Purpose**: Display and manage the list of measurement units

**Responsibilities**:
- Display paginated list of units in table or card view format
- Implement real-time search functionality across unit code and name
- Provide status filtering (all, active, inactive)
- Provide type filtering (all, INVENTORY, ORDER, RECIPE)
- Handle view mode toggle between table and card layouts
- Manage inline editing through dialog components
- Trigger server actions for create, update, and delete operations
- Display loading states during async operations
- Show success and error toast notifications
- Maintain local state for filters, search, and selected items

**State Management**:
- searchTerm: Local state for search input value
- statusFilter: Local state for active/inactive filter selection
- typeFilter: Local state for unit type filter selection
- viewMode: Local state for table/cards view toggle
- editingUnit: Local state for currently editing unit (null when not editing)
- isDialogOpen: Local state for dialog visibility

**Props**: Accepts initial units data array passed from parent component

**User Interactions**:
- Search input with debounced filtering
- Filter dropdowns with immediate filtering
- Add Unit button opens creation dialog
- Edit button (per row/card) opens edit dialog with pre-filled data
- Delete button (per row/card) triggers confirmation then delete action
- View mode toggle switches between table and card layouts

#### Unit Form Component
**File**: `components/unit-dialog.tsx`
**Type**: Client Component
**Purpose**: Create and edit unit forms within a dialog

**Responsibilities**:
- Render form fields with proper labels and placeholders
- Implement form validation using React Hook Form and Zod
- Display validation errors inline below each field
- Handle form submission with loading states
- Differentiate between create and edit modes
- Pre-populate fields in edit mode
- Clear form on successful submission
- Close dialog on cancel or successful submission
- Show toast notifications for success and errors

**Form Fields**:
- Code: Text input, required, uppercase transformation, 2-10 characters
- Name: Text input, required, 2-100 characters
- Description: Textarea, optional, max 500 characters
- Type: Select dropdown with three options (INVENTORY, ORDER, RECIPE)
- Status: Toggle or checkbox for isActive boolean

**Validation**: Client-side validation using Zod schema that mirrors the server-side schema, providing immediate feedback before server submission. Server-side validation provides final verification and handles duplicate checking.

**Props**:
- unit: Optional Unit object for edit mode (null for create mode)
- isOpen: Boolean to control dialog visibility
- onClose: Callback function when dialog is closed
- onSuccess: Callback function after successful submission

#### Filter Component
**File**: `components/unit-filters.tsx`
**Type**: Client Component
**Purpose**: Provide filtering controls for the units list

**Responsibilities**:
- Render search input field with search icon
- Render status filter dropdown (All, Active, Inactive)
- Render type filter dropdown (All, INVENTORY, ORDER, RECIPE)
- Render view mode toggle buttons (Table, Cards)
- Emit filter changes to parent component
- Maintain responsive layout that adapts to screen size

**Props**:
- searchTerm: Current search value
- onSearchChange: Callback when search input changes
- statusFilter: Current status filter value
- onStatusChange: Callback when status filter changes
- typeFilter: Current type filter value
- onTypeChange: Callback when type filter changes
- viewMode: Current view mode (table or cards)
- onViewModeChange: Callback when view mode changes

**Implementation Details**: Uses Shadcn/ui Input component for search, Select component for dropdowns, and Button component for view mode toggle. Implements proper accessibility attributes (aria-labels, roles) for screen readers.

#### Table View Component
**File**: `components/unit-table.tsx`
**Type**: Client Component
**Purpose**: Display units in a table format

**Responsibilities**:
- Render responsive table with sortable columns
- Display unit code, name, type, status in columns
- Include actions column with edit and delete buttons
- Handle column sorting (ascending/descending)
- Display empty state when no units match filters
- Show loading skeleton during data fetching
- Implement row hover effects for better UX
- Handle mobile responsive layout (stacking or horizontal scroll)

**Table Columns**:
1. Code: Displays unit code (e.g., "KG", "ML")
2. Name: Displays full unit name (e.g., "Kilogram")
3. Type: Displays unit type with color-coded badge
4. Status: Displays active/inactive with status indicator
5. Actions: Edit and Delete buttons with proper icon buttons

**Props**:
- units: Filtered array of Unit objects
- onEdit: Callback function when edit is clicked
- onDelete: Callback function when delete is clicked
- sortField: Current sort field
- sortDirection: Current sort direction (asc/desc)
- onSort: Callback when column header is clicked

#### Card View Component
**File**: `components/unit-cards.tsx`
**Type**: Client Component
**Purpose**: Display units in a card grid format

**Responsibilities**:
- Render responsive grid of unit cards
- Display unit information in card layout
- Include action buttons on each card
- Implement card hover and focus effects
- Display empty state when no units available
- Handle responsive grid layout (1, 2, 3, or 4 columns)

**Card Content**:
- Header with unit code and type badge
- Unit name as primary text
- Description text (truncated if too long)
- Status indicator
- Action buttons at bottom (Edit, Delete)

**Props**:
- units: Filtered array of Unit objects
- onEdit: Callback function when edit is clicked
- onDelete: Callback function when delete is clicked

---

## Data Flow

### Read Operations Flow

```
User Opens Units Page
    ↓
Next.js Server Component (page.tsx)
    ↓
Initial Data Fetch (Server Action)
    ↓
Database Query (SELECT * FROM units)
    ↓
Return Units Array
    ↓
Server Component Renders with Data
    ↓
Client Component Receives Props
    ↓
User Sees Units List

[User Applies Filters]
    ↓
Client-Side Filtering (useMemo)
    ↓
Filtered Array Computed
    ↓
UI Updates Immediately (No Server Round-Trip)
```

**Read Operation Details**:
1. Initial page load triggers server-side data fetching
2. Server action queries database for all units
3. Results are passed to client component as props
4. Client component applies filters locally using useMemo hook
5. Filtered results are displayed in current view mode
6. Sorting is handled client-side for better performance
7. Search is implemented with debounced client-side filtering

**Performance Optimization**: All filtering, sorting, and searching is performed client-side after initial data load, eliminating server round-trips for these operations. This provides instant feedback to users while reducing server load.

### Write Operations Flow

```
User Clicks "Add Unit" or "Edit"
    ↓
Dialog Opens with Form
    ↓
User Fills Form Fields
    ↓
User Clicks "Save"
    ↓
Client-Side Validation (Zod Schema)
    ↓
[If Valid]
    ↓
Server Action Called (createUnit or updateUnit)
    ↓
Server-Side Validation (Zod Schema)
    ↓
Duplicate Check (For Code Uniqueness)
    ↓
Business Rules Validation
    ↓
Database Transaction Begins
    ↓
[Create or Update Operation]
    ↓
Audit Log Insert
    ↓
Transaction Commit
    ↓
Success Response Returned
    ↓
Client Receives Response
    ↓
Dialog Closes
    ↓
Success Toast Displayed
    ↓
Data Refresh (Re-fetch from Server)
    ↓
UI Updates with New/Updated Data

[If Validation Fails]
    ↓
Error Response Returned
    ↓
Error Toast Displayed
    ↓
Form Remains Open with Error Messages
    ↓
User Can Correct and Retry
```

**Write Operation Details**:
1. Form validation occurs at two levels: client (immediate) and server (authoritative)
2. Client validation provides instant feedback without server round-trip
3. Server validation ensures data integrity even if client validation is bypassed
4. Duplicate checking occurs during server validation
5. Database transactions ensure atomicity of writes and audit logs
6. Optimistic UI updates are not used; UI refreshes after confirmed server response
7. Error handling provides specific error messages for different failure types

### Delete Operations Flow

```
User Clicks "Delete" Button
    ↓
Confirmation Dialog Appears
    ↓
User Confirms Deletion
    ↓
Server Action Called (deleteUnit)
    ↓
Dependency Check (References in Products/Recipes)
    ↓
[If No Dependencies]
    ↓
Database Transaction Begins
    ↓
Soft Delete (Set isActive = false)
    ↓
Audit Log Insert
    ↓
Transaction Commit
    ↓
Success Response
    ↓
Success Toast Displayed
    ↓
Data Refresh
    ↓
UI Updates (Unit Hidden if Filtering Active Only)

[If Dependencies Exist]
    ↓
Error Response with Dependency List
    ↓
Error Toast with Details
    ↓
Dialog Remains Closed
    ↓
User Informed Cannot Delete
```

**Delete Operation Details**:
1. Delete confirmation prevents accidental deletions
2. Soft delete approach sets isActive to false instead of removing record
3. Dependency checking prevents deletion of units referenced by products or recipes
4. Audit trail records deletion action with timestamp and user
5. Error messages include specific information about why deletion failed
6. UI refresh shows updated state after successful deletion

---

## Server Actions

### Overview
Server actions are implemented in the `actions.ts` file and handle all server-side operations including data validation, business logic execution, and database transactions. Each action follows the same pattern: validate input, execute business logic, perform database operation, log to audit trail, return structured response.

All server actions use the "use server" directive to mark them as server-only code. They accept validated input data and return a structured response object with success flag, data or error message, and optional metadata.

### Create Operations

#### createUnit
**Purpose**: Create a new measurement unit in the system

**Input Parameters**:
- code: String value for unit code (required)
- name: String value for unit name (required)
- description: Optional string for unit description
- type: Enum value (INVENTORY | ORDER | RECIPE)
- isActive: Boolean for active status (defaults to true)

**Validation Steps**:
1. Validate input against Zod schema (field types, required fields, string lengths)
2. Transform code to uppercase for consistency
3. Trim whitespace from all string fields
4. Check code uniqueness in database (case-insensitive)
5. Verify user has permission to create units

**Business Logic**:
1. Generate UUID for new unit ID
2. Set created_at timestamp to current server time
3. Set created_by to authenticated user ID
4. Set updated_at and updated_by to same values initially
5. Apply default values for optional fields

**Database Operations**:
1. Begin database transaction
2. Insert new record into units table
3. Insert audit log record with action type CREATE
4. Commit transaction if both operations succeed
5. Rollback transaction if any operation fails

**Return Values**:
- Success case: Return object with success true, created unit data
- Duplicate code: Return object with success false, error message about duplicate code
- Validation error: Return object with success false, validation error details
- Database error: Return object with success false, generic error message

**Error Handling**: All errors are caught, logged with context, and returned as structured error responses. Database errors are logged with full stack trace but user sees sanitized message.

### Read Operations

#### listUnits
**Purpose**: Fetch all units from the database

**Input Parameters**: None (returns all units)

**Database Query**:
- Select all columns from units table
- Order by type ascending, then code ascending
- No pagination initially (small dataset expected)

**Return Values**:
- Success case: Return array of Unit objects
- Empty case: Return empty array (not an error)
- Database error: Return error response

**Performance Considerations**: Query includes indexes on type and code columns for efficient sorting. Results are cached at the component level to avoid repeated database queries during filtering/sorting operations.

#### getUnitById
**Purpose**: Fetch a single unit by its UUID identifier

**Input Parameters**:
- id: UUID string for unit identifier

**Validation Steps**:
1. Validate id is valid UUID format
2. Verify user has permission to view units

**Database Query**:
- Select all columns from units table
- Where id equals provided id
- Return single row or null

**Return Values**:
- Found case: Return Unit object
- Not found case: Return null (not an error for this operation)
- Invalid ID: Return error response with validation message
- Database error: Return error response

**Use Cases**: Used for detail pages, edit form pre-population, and reference lookups in other modules.

#### getUnitByCode
**Purpose**: Fetch a unit by its unique code value

**Input Parameters**:
- code: String value for unit code (case-insensitive)

**Validation Steps**:
1. Convert code to uppercase
2. Trim whitespace

**Database Query**:
- Select all columns from units table
- Where UPPER(code) equals provided code
- Return single row or null

**Return Values**: Same pattern as getUnitById

**Use Cases**: Used for validation during product creation, recipe ingredient specification, and unit conversion lookups.

#### getUnitsByType
**Purpose**: Fetch all units of a specific type

**Input Parameters**:
- type: Enum value (INVENTORY | ORDER | RECIPE)

**Validation Steps**:
1. Validate type is one of the allowed enum values

**Database Query**:
- Select all columns from units table
- Where type equals provided type
- Where isActive equals true (only return active units)
- Order by code ascending

**Return Values**:
- Success case: Return array of Unit objects
- Empty case: Return empty array
- Invalid type: Return error response

**Use Cases**: Used in dropdown selectors when filtering by unit type, for example when selecting base unit for a product or ingredient unit in a recipe.

### Update Operations

#### updateUnit
**Purpose**: Update an existing unit's information

**Input Parameters**:
- id: UUID of unit to update
- code: Optional string (code cannot be changed if already referenced)
- name: Optional string for updated name
- description: Optional string for updated description
- type: Optional enum value (type cannot be changed if already referenced)
- isActive: Optional boolean for status update

**Validation Steps**:
1. Validate id is valid UUID
2. Validate changed fields against Zod schema
3. Check if unit exists in database
4. If code is being changed, verify new code is unique
5. If type is being changed, verify unit has no references
6. Verify user has permission to update units

**Business Logic**:
1. Fetch current unit data from database
2. Merge provided changes with existing data (only update provided fields)
3. Set updated_at to current server timestamp
4. Set updated_by to authenticated user ID
5. Check for references if immutable fields are being changed

**Database Operations**:
1. Begin database transaction
2. Update units table with new values
3. Insert audit log record with action type UPDATE and before/after values
4. Commit transaction if both operations succeed
5. Rollback if any operation fails

**Return Values**:
- Success case: Return updated Unit object
- Not found: Return error response
- Code conflict: Return error response about duplicate code
- Immutable field: Return error response explaining field cannot be changed
- Validation error: Return validation error details
- Database error: Return generic error message

**Concurrency Handling**: Optimistic locking is not implemented initially. Last write wins. Future enhancement could add version field for optimistic locking.

### Delete Operations

#### deleteUnit
**Purpose**: Soft delete a unit (set isActive to false)

**Input Parameters**:
- id: UUID of unit to delete

**Validation Steps**:
1. Validate id is valid UUID
2. Check if unit exists
3. Check if unit is referenced in products table
4. Check if unit is referenced in recipes table
5. Verify user has permission to delete units

**Business Logic**:
1. Query database for references in products (base_unit, alternative units)
2. Query database for references in recipes (ingredient units)
3. If references exist, compile list of referencing entities
4. If no references, proceed with soft delete
5. Set isActive to false instead of removing record
6. Set updated_at and updated_by fields

**Database Operations**:
1. Begin database transaction
2. Update units table setting isActive = false
3. Insert audit log record with action type DELETE
4. Commit transaction if both operations succeed
5. Rollback if any operation fails

**Return Values**:
- Success case: Return success true with deleted unit data
- Referenced case: Return error with list of referencing entities
- Not found: Return error response
- Permission denied: Return error response
- Database error: Return generic error message

**Hard Delete Option**: Hard delete (permanent removal) is not exposed in UI but exists for administrative cleanup operations. Requires special permission and bypasses reference checks (assumes admin knows the consequences).

---

## Database Schema

**NOTE**: Detailed database definitions including SQL DDL statements, constraints, and indexes are documented in the [Data Dictionary (DD) document](./DD-units.md). This section provides a high-level overview only.

### Tables Overview

#### units
**Purpose**: Store all measurement units used across the system

**Key Fields**:
- id: UUID primary key, automatically generated
- code: Unique unit code (e.g., "KG", "ML"), varchar(10), uppercase, indexed
- name: Full unit name (e.g., "Kilogram"), varchar(100), required
- description: Optional text description, varchar(500)
- type: Enum (INVENTORY, ORDER, RECIPE), indexed for filtered queries
- isActive: Boolean status flag, indexed, defaults to true
- created_at: Timestamp with timezone, defaults to current timestamp
- created_by: UUID foreign key to users table
- updated_at: Timestamp with timezone, updated on each modification
- updated_by: UUID foreign key to users table

**Constraints**:
- Primary key on id column
- Unique constraint on code column (case-insensitive)
- Foreign key on created_by referencing users(id)
- Foreign key on updated_by referencing users(id)
- Check constraint: type must be one of allowed enum values
- Check constraint: code length between 1 and 10 characters
- Check constraint: name length between 1 and 100 characters

**Indexes**:
- Primary key index on id (automatic)
- Unique index on UPPER(code) for case-insensitive uniqueness
- Non-unique index on type for filtered queries
- Non-unique index on isActive for filtering active/inactive units
- Composite index on (type, isActive) for common filtered queries

**Relationships**:
- Referenced by products.base_unit (foreign key)
- Referenced by product_units.unit (foreign key)
- Referenced by recipe_ingredients.unit (foreign key)
- Referenced by inventory_transactions.unit (foreign key)

### Audit Log Table

#### audit_logs
**Purpose**: Track all changes to units for compliance and debugging

**Key Fields**:
- id: UUID primary key
- entity_type: Fixed value "unit" for unit operations
- entity_id: UUID of the affected unit
- action: Enum (CREATE, UPDATE, DELETE, APPROVE, REJECT)
- user_id: UUID of user who performed the action
- timestamp: When the action occurred
- changes: JSONB field storing before and after values for updates
- ip_address: IP address of the request
- user_agent: Browser/client information

**Usage**: Every write operation to units table creates an audit log entry. For updates, the changes field stores both old and new values for auditing purposes.

---

## State Management

### Local Component State (useState)

The Units Management sub-module uses only local component state managed with React's useState hook. No global state management (like Zustand) is required because:
1. Units data is self-contained and not shared across multiple pages
2. Filter state only needs to be maintained within the units page
3. Selected items and editing state are transient and page-specific

**State Variables in Unit List Component**:

**searchTerm**:
- Type: String
- Purpose: Store current search input value
- Updates: On every keystroke in search input (debounced)
- Default: Empty string

**statusFilter**:
- Type: String ("all" | "active" | "inactive")
- Purpose: Track selected status filter
- Updates: When user selects from status dropdown
- Default: "all"

**typeFilter**:
- Type: String ("all" | "INVENTORY" | "ORDER" | "RECIPE")
- Purpose: Track selected type filter
- Updates: When user selects from type dropdown
- Default: "all"

**viewMode**:
- Type: String ("table" | "cards")
- Purpose: Track current view mode
- Updates: When user clicks view mode toggle
- Default: "table"

**editingUnit**:
- Type: Unit object or null
- Purpose: Track which unit is currently being edited
- Updates: When edit button clicked (set to unit) or dialog closed (set to null)
- Default: null

**isDialogOpen**:
- Type: Boolean
- Purpose: Control dialog visibility
- Updates: When user opens/closes create or edit dialog
- Default: false

### Computed State (useMemo)

**filteredUnits**:
- Purpose: Compute filtered list based on search and filter criteria
- Dependencies: [units, searchTerm, statusFilter, typeFilter]
- Implementation: useMemo hook to prevent unnecessary recalculations
- Logic: Filters units array by checking all three filter criteria
- Performance: Memoization prevents recalculation when unrelated state changes

**sortedUnits**:
- Purpose: Sort filtered units by selected column and direction
- Dependencies: [filteredUnits, sortField, sortDirection]
- Implementation: useMemo hook for performance
- Logic: Sorts by comparing values of sortField in specified direction

### State Update Patterns

**Search Input**:
- User types in search field
- onChange handler updates searchTerm state
- filteredUnits automatically recomputes (useMemo dependency)
- UI re-renders with filtered results
- No server action needed

**Filter Selection**:
- User selects from dropdown
- onChange handler updates filter state
- filteredUnits automatically recomputes
- UI re-renders with filtered results
- No server action needed

**Create/Edit Form**:
- User opens dialog (sets isDialogOpen to true)
- User fills form fields (form state managed by React Hook Form)
- User submits form
- Server action called with form data
- On success: Dialog closes, success toast shown, data refreshed
- On error: Dialog stays open, error toast shown, form displays errors

---

## Security Implementation

### Authentication

**Session Management**:
- Users must be authenticated via NextAuth.js before accessing Units Management
- Session tokens stored in secure HTTP-only cookies
- Session expiration handled automatically with token refresh
- Unauthenticated users redirected to login page via middleware

**User Context**:
- Current user information retrieved from session on server side
- User ID and role used for authorization checks
- User context passed to server actions for audit logging

### Authorization

**Role-Based Access Control (RBAC)**:
- System Admin: Full access to all unit operations (create, read, update, delete)
- Purchasing Manager: Full access to all unit operations
- Inventory Manager: Read access, create and update access, no delete access
- Department Manager: Read access only
- Staff: Read access only for active units

**Permission Checks**:
- Every server action verifies user has required permission
- Permissions checked at the start of each server action
- Unauthorized attempts logged to audit trail
- Error response returned with permission denied message

**Resource-Level Security**:
- Users can only view units relevant to their department context (future enhancement)
- Soft-deleted units (isActive = false) only visible to admins

### Data Protection

**Input Validation**:
- All user input validated against Zod schemas
- Client-side validation provides immediate feedback
- Server-side validation is authoritative and cannot be bypassed
- Validation includes type checking, length limits, format requirements
- Dangerous characters sanitized or rejected

**SQL Injection Prevention**:
- All database queries use parameterized queries via Supabase client
- No raw SQL strings constructed with user input
- ORM layer (Supabase) handles parameter escaping automatically

**XSS Protection**:
- React automatically escapes rendered content
- User input never rendered as raw HTML
- Dangerous HTML tags stripped from input
- Content Security Policy headers configured

**CSRF Protection**:
- Next.js Server Actions include built-in CSRF protection
- Each request includes CSRF token in headers
- Token verified on server before processing request

### Audit Logging

All write operations to the units table are logged to the audit_logs table with the following information:

**Logged Information**:
- Action type: CREATE, UPDATE, DELETE
- Entity type: "unit"
- Entity ID: UUID of affected unit
- User ID: Who performed the action
- Timestamp: When the action occurred
- Changes: For UPDATE operations, JSON object with before and after values
- IP address: Source IP of the request
- User agent: Browser and device information
- Session ID: Associated session identifier

**Audit Log Usage**:
- Compliance reporting and auditing
- Debugging data issues
- Investigating unauthorized access attempts
- Rollback capability for accidental changes
- Analytics on system usage patterns

**Retention**: Audit logs retained for minimum 7 years per compliance requirements.

---

## Error Handling

### Client-Side Error Handling

**Form Validation Errors**:
- Pattern: Display inline error messages below each field
- Implementation: React Hook Form provides field-level error state
- User Experience: Errors appear immediately on blur or submission attempt
- Clearing: Errors clear when user corrects the field value

**Server Action Errors**:
- Pattern: Wrap server action calls in try-catch blocks
- Implementation: Check response.success flag to determine outcome
- User Experience: Display error toast with user-friendly message
- Form Behavior: Keep form open with entered data on error

**Network Errors**:
- Pattern: Catch fetch failures and connection timeouts
- User Experience: Display "Connection lost" toast with retry option
- Retry Behavior: User can click retry to resubmit same request
- Fallback: Provide offline message if repeated failures

**Generic Errors**:
- Pattern: Catch-all error boundary for unexpected errors
- User Experience: Display generic error message with support contact
- Logging: Log full error details to console (dev) and monitoring service (prod)
- Recovery: Provide "Refresh page" button to recover

### Server-Side Error Handling

**Validation Errors**:
- Detection: Zod schema validation before business logic
- Response: Return structured error with field-specific messages
- Logging: Log validation errors with input data (sanitized)
- User Impact: User sees specific error messages for each field

**Authorization Errors**:
- Detection: Permission check at start of server action
- Response: Return error with "Permission denied" message
- Logging: Log unauthorized attempts with user ID and action
- User Impact: User sees permission denied toast, cannot proceed

**Not Found Errors**:
- Detection: Database query returns null when expecting entity
- Response: Return error with "Unit not found" message
- Logging: Log not found errors with entity ID
- User Impact: User sees toast that unit no longer exists

**Duplicate Errors**:
- Detection: Unique constraint violation on code field
- Response: Return error with "Unit code already exists" message
- Logging: Log duplicate attempts with conflicting code
- User Impact: User sees specific message about duplicate code

**Dependency Errors**:
- Detection: References found when attempting to delete
- Response: Return error with list of referencing entities
- Logging: Log deletion attempts with reference counts
- User Impact: User sees message explaining why delete is not allowed

**Database Errors**:
- Detection: Database query throws exception
- Response: Return generic "An error occurred" message to user
- Logging: Log full error details including stack trace and query
- User Impact: User sees generic error, support team gets detailed logs
- Transaction: Automatic rollback ensures data consistency

### Error Response Pattern

All server actions return a structured response object:

**Success Response**:
```
{
  success: true,
  data: { /* Unit object or operation result */ }
}
```

**Error Response**:
```
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "User-friendly error message",
    details: { /* Optional field-specific errors */ }
  }
}
```

**Benefits of Pattern**:
- Consistent error handling across all server actions
- Easy to check success with simple boolean flag
- Type-safe error handling in TypeScript
- Separates user-facing messages from technical details

---

## Performance Optimization

### Frontend Optimization

**Code Splitting**:
- Next.js 14 automatically code-splits by route
- Dynamic imports not needed for this sub-module (small bundle size)
- Shared components bundled efficiently by Next.js

**Lazy Loading**:
- Dialog components lazy loaded only when opened
- Heavy components (if any) loaded on demand
- Images lazy loaded by default with Next.js Image component

**Memoization**:
- useMemo used for filteredUnits to prevent unnecessary filtering
- useMemo used for sortedUnits to prevent unnecessary sorting
- useCallback used for event handlers passed to child components
- React.memo used for list item components to prevent re-renders

**Debouncing**:
- Search input debounced with 300ms delay
- Prevents excessive filtering operations while user types
- Improves typing performance in search field

**Rendering Optimization**:
- Table rows use stable keys (unit.id) for React reconciliation
- Avoid inline object/function creation in render
- Use stable references for event handlers

### Backend Optimization

**Database Indexing**:
- Unique index on code for fast duplicate checking
- Index on type for filtered queries by unit type
- Index on isActive for filtering active/inactive units
- Composite index on (type, isActive) for common combined filter

**Query Optimization**:
- Select only needed columns (though currently selecting all)
- Use indexes for WHERE clauses
- Avoid N+1 queries with proper joins (not applicable for units)
- Batch operations when possible (future enhancement)

**Caching Strategy**:
- Units data cached at component level after initial fetch
- Cache invalidated after any write operation
- No server-side caching initially (small dataset)
- Future: Implement Redis caching if dataset grows large

**Connection Pooling**:
- Supabase manages connection pooling automatically
- Connection pool size configured based on load
- Proper connection cleanup after each query

### Pagination Implementation

**Current Implementation**: No pagination (loads all units)

**Justification**: Small dataset (expected < 100 units) can be loaded and filtered client-side efficiently

**Future Enhancement** (when dataset grows > 500 units):

**Approach**: Server-side pagination with cursor-based paging
- Page size: 25 units per page
- Offset calculation: (page - 1) * pageSize
- Parallel queries for data and total count
- Response includes pagination metadata (total, page, pageSize, totalPages, hasMore)

**Pagination Metadata**:
- currentPage: Current page number
- totalPages: Total number of pages
- totalItems: Total count of filtered items
- hasNextPage: Boolean indicating if more pages available
- hasPreviousPage: Boolean indicating if previous pages exist

**Client-Side State**:
- currentPage: Track current page in local state
- pageSize: Track items per page (default 25, adjustable)
- Server action parameters: Pass page and pageSize to list action

---

## Testing Strategy

### Unit Tests

**Location**: `__tests__/unit/units/`
**Framework**: Vitest with React Testing Library
**Coverage Target**: >80% code coverage

**Test Categories**:

**Component Tests**:
- Unit list component renders correctly with mock data
- Search input filters units correctly
- Status filter works correctly
- Type filter works correctly
- View mode toggle switches between table and cards
- Edit button opens dialog with correct unit data
- Delete button triggers confirmation dialog
- Empty state displays when no units match filters

**Server Action Tests**:
- createUnit succeeds with valid data
- createUnit fails with invalid data (validation errors)
- createUnit fails with duplicate code
- updateUnit succeeds with valid changes
- updateUnit fails when unit not found
- deleteUnit succeeds when no dependencies
- deleteUnit fails when dependencies exist
- listUnits returns all units sorted correctly

**Validation Tests**:
- Zod schema validates correct data
- Zod schema rejects invalid code formats
- Zod schema rejects missing required fields
- Zod schema accepts optional fields when omitted

**Utility Function Tests**:
- Filter function works correctly with various criteria
- Sort function orders units correctly
- Transform functions convert data correctly

**Mocking Strategy**:
- Mock Supabase client for database operations
- Mock Next.js router for navigation testing
- Mock toast notifications to verify calls
- Use test fixtures for consistent unit data

### Integration Tests

**Location**: `__tests__/integration/units/`
**Framework**: Vitest with test database
**Coverage Target**: >70% of critical paths

**Test Categories**:

**CRUD Workflow Tests**:
- Complete create workflow from form to database
- Read unit list with various filters
- Update workflow changes database correctly
- Delete workflow with confirmation
- Transaction rollback on error

**Database Integration Tests**:
- Unit created in database with correct values
- Unique constraint prevents duplicate codes
- Foreign key relationships maintained
- Audit log created for each write operation
- Transaction isolation works correctly

**Validation Integration Tests**:
- Server validation catches invalid data
- Duplicate checking works correctly
- Dependency checking prevents invalid deletes
- Business rules enforced at database level

**Error Handling Tests**:
- Database errors handled gracefully
- Connection failures handled correctly
- Transaction rollbacks work properly
- Error messages returned correctly

**Setup and Teardown**:
- Test database created before test suite
- Database seeded with test data before each test
- Database cleaned after each test
- Test database dropped after suite

### E2E Tests

**Location**: `e2e/units/`
**Framework**: Playwright
**Browsers**: Chromium, Firefox, WebKit

**Test Scenarios**:

**Happy Path Tests**:
- User navigates to units page and sees list
- User searches for unit and finds it
- User creates new unit successfully
- User edits existing unit successfully
- User views unit in detail

**Error Path Tests**:
- User tries to create duplicate unit code
- User tries to delete unit with dependencies
- User submits form with validation errors
- User loses connection during operation

**Responsive Design Tests**:
- Page displays correctly on mobile (375px)
- Page displays correctly on tablet (768px)
- Page displays correctly on desktop (1920px)
- Table switches to cards on mobile

**Accessibility Tests**:
- Keyboard navigation works throughout page
- Screen reader can navigate and read content
- Focus indicators visible on interactive elements
- ARIA labels present on all controls

**Performance Tests**:
- Page loads within 3 seconds on 3G
- Search results update within 500ms
- Form submission completes within 2 seconds

**Test Execution**:
- Run before deployment to staging
- Run on all supported browsers
- Take screenshots on failure for debugging
- Generate HTML report with test results

---

## Deployment Configuration

### Environment Variables

The following environment variables must be configured for deployment:

**Database Configuration**:
- DATABASE_URL: PostgreSQL connection string for pooled connections
- DIRECT_URL: PostgreSQL connection string for direct connections (migrations)

**Authentication Configuration**:
- NEXTAUTH_SECRET: Secret key for session encryption
- NEXTAUTH_URL: Full URL where application is deployed
- NEXTAUTH_PROVIDERS: Comma-separated list of enabled auth providers

**Supabase Configuration**:
- NEXT_PUBLIC_SUPABASE_URL: Public Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Public anon key for client-side
- SUPABASE_SERVICE_ROLE_KEY: Service role key for server-side operations

**Application Configuration**:
- NODE_ENV: Environment (development, staging, production)
- NEXT_PUBLIC_APP_URL: Public URL for the application
- LOG_LEVEL: Logging level (debug, info, warn, error)

**Monitoring Configuration**:
- SENTRY_DSN: Sentry project DSN for error tracking (optional)
- ANALYTICS_ID: Analytics tracking ID (optional)

### Build Configuration

**next.config.js Settings**:
- Output: Standalone build for optimized production bundle
- Image optimization: Enabled with Next.js Image component
- Compression: Enabled for static assets
- Source maps: Enabled for production debugging
- Environment variables: Exposed to client with NEXT_PUBLIC prefix

**Build Process**:
1. Install dependencies with npm ci
2. Run TypeScript type checking
3. Run ESLint checks
4. Run unit tests
5. Build Next.js application
6. Generate static assets
7. Create optimized production bundle

**Build Output**:
- .next/standalone: Minimal server bundle
- .next/static: Static assets for CDN
- public: Public static files

### Database Migrations

**Migration Tool**: Supabase migration system

**Migration Files**: Located in `supabase/migrations/`

**Creating Migrations**:
```bash
# Create new migration file with timestamp
supabase migration new unit_management_initial

# Edit migration file with SQL DDL
# Add both up and down migrations
```

**Running Migrations**:
```bash
# Apply all pending migrations
supabase db push

# Check migration status
supabase migration list

# Rollback last migration
supabase migration rollback
```

**Migration Strategy**:
- All migrations versioned in Git
- Migrations applied automatically on deployment
- Rollback capability for each migration
- Test migrations on staging before production

**Migration Best Practices**:
- Include both up and down migrations
- Make migrations idempotent (safe to run multiple times)
- Test migrations on copy of production data
- Include data migrations separate from schema migrations
- Coordinate migrations with code deployments

---

## Dependencies

### npm Packages

| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.2.0 | React framework for routing and SSR |
| react | 18.3.1 | UI library for components |
| react-dom | 18.3.1 | React rendering for web |
| typescript | 5.8.2 | Type safety and static analysis |
| @supabase/supabase-js | ^2.39.0 | Database client library |
| zod | ^3.22.4 | Schema validation library |
| react-hook-form | ^7.50.0 | Form state management and validation |
| @hookform/resolvers | ^3.3.4 | Zod integration for React Hook Form |
| tailwindcss | 3.4.1 | Utility-first CSS framework |
| lucide-react | ^0.344.0 | Icon library for UI |
| date-fns | ^3.3.1 | Date formatting and manipulation |
| @radix-ui/react-dialog | ^1.0.5 | Accessible dialog primitive |
| @radix-ui/react-select | ^2.0.0 | Accessible select primitive |
| @radix-ui/react-toast | ^1.1.5 | Toast notification primitive |

### Internal Dependencies

**Shared Type Definitions**:
- Module: `lib/types/product.ts`
- Usage: Unit interface, UnitType enum
- Reason: Centralized type definitions shared across product management modules

**Shared Components**:
- Module: `components/ui/`
- Components: Button, Input, Select, Dialog, Card, Table components
- Reason: Shadcn/ui components provide consistent styling and behavior

**Utility Functions**:
- Module: `lib/utils.ts`
- Functions: cn (className utility), formatDate, generateUUID
- Reason: Common utilities used across application

**Validation Schemas**:
- Module: `lib/validations/`
- Usage: Shared Zod schemas for common patterns
- Reason: Consistent validation across modules

**Database Client**:
- Module: `lib/supabase/client.ts`
- Usage: Configured Supabase client instance
- Reason: Centralized database connection configuration

---

## Monitoring and Logging

### Application Logging

**Logging Levels**:
- DEBUG: Detailed information for diagnosing problems (development only)
- INFO: General informational messages about application operation
- WARN: Warning messages for potentially harmful situations
- ERROR: Error messages for error events that might still allow operation
- FATAL: Very severe error events that might cause application termination

**Logged Operations**:

**INFO Level Logging**:
- Successful unit creation with unit ID
- Successful unit update with unit ID and changed fields
- Successful unit deletion with unit ID
- User authentication events
- Cache invalidation events

**WARN Level Logging**:
- Duplicate code attempts with conflicting code
- Delete attempts on referenced units with reference counts
- Permission denied attempts with user ID and action
- Slow database queries (>1 second)
- High memory usage warnings

**ERROR Level Logging**:
- Database connection failures with error details
- Database query errors with query and parameters
- Validation errors during critical operations
- Unexpected exceptions with full stack traces
- External service failures

**Log Structure**:
- Timestamp: ISO 8601 format with timezone
- Level: Log level (DEBUG, INFO, WARN, ERROR, FATAL)
- Message: Human-readable log message
- Context: Additional structured data (user ID, entity ID, action, etc.)
- Error: Error object with stack trace (for ERROR level)
- Request ID: Unique identifier for request tracing
- User Agent: Browser/client information
- IP Address: Source IP of request

**Log Storage**:
- Development: Console output with color-coded levels
- Staging: Cloud logging service (e.g., CloudWatch, Datadog)
- Production: Cloud logging service with long-term retention

### Performance Monitoring

**Metrics Tracked**:

**Page Performance**:
- Time to First Byte (TTFB): <500ms target
- First Contentful Paint (FCP): <1.5s target
- Largest Contentful Paint (LCP): <2.5s target
- First Input Delay (FID): <100ms target
- Cumulative Layout Shift (CLS): <0.1 target

**API Performance**:
- Server action response time: <200ms target
- Database query time: <100ms target
- Create operation time: <500ms target
- Update operation time: <500ms target
- Delete operation time: <300ms target
- List operation time: <200ms target

**Resource Usage**:
- Memory consumption per request
- CPU usage during operations
- Database connection pool usage
- Network bandwidth usage

**Error Tracking**:
- Error rate: Percentage of requests resulting in errors
- Error types: Distribution of error types (validation, database, network, etc.)
- Error trends: Increase or decrease in error rates over time

**Monitoring Tools**:
- Vercel Analytics: Built-in performance monitoring
- Sentry: Error tracking and performance monitoring
- PostgreSQL Logs: Database query performance and errors

### Alerts

**Critical Alerts** (Immediate notification):
- Error rate exceeds 5% of requests
- Database connection failures
- Authentication service downtime
- Critical security events (multiple failed auth attempts)

**High Priority Alerts** (Within 15 minutes):
- Response time exceeds 2x normal (>1 second)
- Memory usage exceeds 80% of limit
- Database query time exceeds 1 second
- Disk space below 10% free

**Medium Priority Alerts** (Within 1 hour):
- Error rate exceeds 1% of requests
- Response time exceeds 1.5x normal
- Unusual traffic patterns
- Failed background jobs

**Low Priority Alerts** (Daily summary):
- Performance degradation under 20%
- Non-critical warnings in logs
- Usage statistics and trends

**Alert Channels**:
- Critical: SMS, phone call, PagerDuty
- High: Email, Slack
- Medium: Email, daily report
- Low: Daily report, dashboard

---

## Technical Debt

| Item | Priority | Effort | Notes |
|------|----------|--------|-------|
| Implement pagination for large datasets | Medium | Small | Currently loads all units client-side. Add server-side pagination when unit count exceeds 500. |
| Add optimistic locking for concurrent updates | Low | Medium | Currently using last-write-wins. Add version field to prevent lost updates. |
| Implement bulk operations | Low | Medium | Add ability to update or delete multiple units at once with batch API. |
| Add unit conversion calculator | Low | Small | Helper tool to test unit conversions between different units. |
| Implement hard delete for admins | Low | Small | Add permanent deletion option for system administrators with proper warning. |
| Add audit log viewer | Medium | Medium | UI to view and search audit logs for compliance and debugging. |
| Implement export functionality | Low | Small | Export units list to CSV or Excel for reporting purposes. |
| Add unit usage analytics | Low | Large | Dashboard showing which units are most commonly used, reference counts, etc. |
| Optimize database queries | Medium | Small | Add query performance monitoring and optimize slow queries. |
| Implement real-time updates | Low | Large | Use WebSockets or polling to show real-time changes when other users modify units. |

**Prioritization Rationale**:
- High priority items impact correctness or security
- Medium priority items impact performance or usability for many users
- Low priority items are nice-to-have features or edge case improvements

**Effort Estimation**:
- Small: 1-3 days of development time
- Medium: 1-2 weeks of development time
- Large: 2-4 weeks of development time

---

## Migration Guide

This sub-module is a new implementation with no migration from existing systems required. However, if migrating data from a legacy system:

### Migration Steps

1. **Audit Existing Units**: Review all measurement units in legacy system
2. **Map Unit Types**: Categorize legacy units into INVENTORY, ORDER, or RECIPE types
3. **Standardize Codes**: Ensure all unit codes follow uppercase convention and uniqueness
4. **Clean Data**: Remove duplicate or unused units
5. **Create Migration Script**: Generate SQL or script to bulk insert units
6. **Test Migration**: Run migration on test database first
7. **Validate Data**: Verify all units migrated correctly with proper types
8. **Migrate Production**: Run migration during maintenance window
9. **Verify**: Confirm all units visible and functional in new system
10. **Update References**: Update product and recipe references to new unit IDs

### Data Migration

**Migration Script Requirements**:
- Idempotent: Safe to run multiple times without duplicating data
- Transactional: All-or-nothing approach with rollback on error
- Logging: Detailed logs of what was migrated
- Validation: Pre-migration validation of source data
- Mapping: Clear mapping between old and new unit IDs

**Migration Script Template**:
1. Begin transaction
2. Create temporary staging table
3. Load legacy data into staging table
4. Validate staging data (check for duplicates, invalid types, etc.)
5. Transform staging data to match new schema
6. Insert into units table with generated UUIDs
7. Create mapping table (old ID to new ID)
8. Update references in products and recipes
9. Validate migration success (count matches, no orphaned references)
10. Commit transaction if successful, rollback if any errors

**Data Validation Checks**:
- All legacy units present in new system
- No duplicate codes in migrated data
- All unit types correctly categorized
- All references updated to new IDs
- No orphaned references in products or recipes

### Rollback Plan

If issues are discovered after migration:

**Immediate Rollback** (within 1 hour):
1. Stop application to prevent new data creation
2. Restore database from pre-migration backup
3. Verify backup restoration successful
4. Restart application
5. Investigate migration issues
6. Fix migration script
7. Schedule new migration window

**Partial Rollback** (after 1 hour but before significant new data):
1. Create backup of current state
2. Delete migrated units from units table
3. Restore references to legacy system
4. Verify system functionality
5. Fix migration issues
6. Re-run migration

**Cannot Rollback** (after significant new data created):
- Forward-only fixes required
- Manually correct any data issues
- Update migration script for future reference
- Document issues and resolutions

---

## Appendix

### Related Documents
- [Business Requirements (BR-units.md)](./BR-units.md) - Business requirements and rules
- [Use Cases (UC-units.md)](./UC-units.md) - User workflows and scenarios
- [Data Dictionary (DD-units.md)](./DD-units.md) - Database schema and constraints
- [Flow Diagrams (FD-units.md)](./FD-units.md) - Visual workflow diagrams
- [Validation Rules (VAL-units.md)](./VAL-units.md) - Comprehensive validation specifications

### Useful Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Code Quality
npm run lint                   # Run ESLint
npm run checktypes             # TypeScript type checking
npm run format                 # Format code with Prettier

# Testing
npm run test                   # Run unit tests in watch mode
npm run test:run               # Run unit tests once
npm run test:coverage          # Run tests with coverage report
npm run test:e2e               # Run Playwright E2E tests

# Database
npx supabase db push           # Apply database migrations
npx supabase db reset          # Reset database to initial state
npx supabase db seed           # Seed database with test data
npx supabase migration new     # Create new migration file

# Analysis
npm run analyze                # Run all analysis tools
npm run analyze:bundle         # Analyze bundle size
```

### Component File Paths

For quick reference when working with the codebase:

- Main page: `app/(main)/product-management/units/page.tsx`
- Unit list: `app/(main)/product-management/units/components/unit-list-improved.tsx`
- Unit dialog: `app/(main)/product-management/units/components/unit-dialog.tsx`
- Server actions: `app/(main)/product-management/units/actions.ts`
- Type definitions: `lib/types/product.ts`
- Validation schemas: `lib/validations/unit-validation.ts`
- Mock data: `app/(main)/product-management/units/data/mock-units.ts`

---

**Document End**

> 📝 **Note to Developers**:
> - This document describes the technical implementation in text format only
> - For actual code examples, refer to the source files listed above
> - For database schema details, see the Data Schema (DS) document
> - For visual workflow diagrams, see the Flow Diagrams (FD) document
> - Update this document when making architectural changes to the sub-module
