# Technical Specification: Product Categories

## Module Information
- **Module**: Product Management
- **Sub-Module**: Product Categories
- **Route**: `/product-management/categories`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-02
- **Owner**: Product Management Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-02 | Documentation Team | Initial version |

---

## Overview

The Product Categories sub-module provides a technical implementation of a three-level hierarchical category system for organizing products within the CARMEN hospitality ERP. The implementation leverages Next.js 14 App Router with React Server Components for optimal performance, React Hook Form with Zod for robust form validation, and a PostgreSQL database for reliable data storage.

The architecture follows a modern React pattern with clear separation between server and client components, using server actions for all data mutations and React Query for efficient server state management. The hierarchy tree uses recursive rendering with drag-and-drop functionality powered by React DnD libraries, while search and filtering operations occur client-side for instantaneous feedback.

Key technical features include optimized database queries with proper indexing, soft delete implementation for data preservation, real-time item count aggregation, and comprehensive validation at both client and server levels. The system supports concurrent user access with proper locking mechanisms and includes full audit trail logging for all operations.

**⚠️ IMPORTANT: This is a Technical Specification Document - TEXT FORMAT ONLY**
- **DO NOT include actual code** - describe implementation patterns in text
- **DO NOT include TypeScript/JavaScript code** - describe component responsibilities
- **DO NOT include SQL code** - refer to DD (Data Definition) document for database descriptions
- **DO include**: Architecture descriptions, component responsibilities, data flow descriptions, integration patterns
- **Focus on**: WHAT components do, HOW they interact, WHERE data flows - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-categories.md) - Requirements and business rules
- [Use Cases](./UC-categories.md) - User workflows and scenarios
- [Data Dictionary](./DD-categories.md) - Database structure and relationships
- [Flow Diagrams](./FD-categories.md) - Visual process flows
- [Validations](./VAL-categories.md) - Validation rules and error messages

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Categories sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/product-management/categories)']
    CreatePage['Create Page<br>(/product-management/categories/new)']
    DetailPage["Detail Page<br>(/product-management/categories/[id])"]
    EditPage["Edit Page<br>(/product-management/categories/[id]/edit)"]

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
**Route**: `/product-management/categories`
**File**: `page.tsx`
**Purpose**: Display paginated list of all categories

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all categories
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/product-management/categories/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive category details

**Sections**:
- Header: Breadcrumbs, category title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change category status with reason

#### 3. Create Page
**Route**: `/product-management/categories/new`
**File**: `new/page.tsx`
**Purpose**: Create new category

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/product-management/categories/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing category

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## Architecture

### High-Level Architecture

The Product Categories module follows Next.js 14 App Router architecture with clear separation between server and client responsibilities. The system implements a three-tier architecture: presentation layer (React components), application layer (Next.js server actions), and data layer (PostgreSQL via Supabase).

```
┌──────────────────────────────────────┐
│         User Browser                  │
│  ┌────────────────────────────────┐  │
│  │   React Client Components      │  │
│  │   - CategoryList               │  │
│  │   - CategoryTree               │  │
│  │   - CategoryForm               │  │
│  │   - DragDrop Handler           │  │
│  └────────┬───────────────────────┘  │
│           │ Server Actions            │
└───────────┼───────────────────────────┘
            │ HTTPS
┌───────────▼───────────────────────────┐
│      Next.js Server (Node 20)         │
│  ┌────────────────────────────────┐  │
│  │   React Server Components      │  │
│  │   - Page Wrapper (RSC)         │  │
│  │   - Initial Data Fetch         │  │
│  └────────┬───────────────────────┘  │
│  ┌────────▼───────────────────────┐  │
│  │   Server Actions Layer         │  │
│  │   - createCategory             │  │
│  │   - updateCategory             │  │
│  │   - deleteCategory             │  │
│  │   - reorderCategories          │  │
│  └────────┬───────────────────────┘  │
│  ┌────────▼───────────────────────┐  │
│  │   Business Logic Layer         │  │
│  │   - Validation (Zod)           │  │
│  │   - Authorization Checks       │  │
│  │   - Hierarchy Validation       │  │
│  └────────┬───────────────────────┘  │
│  ┌────────▼───────────────────────┐  │
│  │   Data Access Layer            │  │
│  │   - Database Queries           │  │
│  │   - Transaction Management     │  │
│  │   - Count Calculations         │  │
│  └────────┬───────────────────────┘  │
└───────────┼───────────────────────────┘
            │ PostgreSQL Connection
┌───────────▼───────────────────────────┐
│   Supabase PostgreSQL Database        │
│  ┌────────────────────────────────┐  │
│  │   categories table             │  │
│  │   - Hierarchical relationships │  │
│  │   - Sort order tracking        │  │
│  │   - Audit fields               │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │   products table               │  │
│  │   - category_id foreign key    │  │
│  └────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### Component Architecture

**Frontend Layer - Client Components**:
- CategoryList: Main container component managing view mode (tree/list), search, and filters
- CategoryTree: Recursive tree rendering with expand/collapse, drag-and-drop, and selection
- CategoryListView: Flat table display with column sorting, pagination, and bulk actions
- CategoryForm: Dialog-based form for create/edit operations with validation
- CategoryDeleteDialog: Confirmation dialog with impact analysis and cascade options
- SearchInput: Debounced search field triggering real-time filtering
- FilterPanel: Multiple filter controls with chip display and clear all functionality
- DragDropHandler: Manages drag-and-drop interactions with visual feedback

**Frontend Layer - Server Components**:
- Page: Top-level page wrapper (React Server Component) fetching initial category tree and rendering layout
- CategoryDetailPanel: Server component displaying category details fetched on demand

**Application Layer - Server Actions**:
- createCategory: Validates input, generates UUID, assigns sort order, creates database record
- updateCategory: Validates changes, checks permissions, updates record with optimistic locking
- deleteCategory: Validates deletion rules (no products, cascade children), performs soft delete
- reorderCategories: Updates sort order for dragged item and affected siblings atomically
- moveCategory: Changes parent relationship with hierarchy validation and path recalculation

**Business Logic Layer**:
- Validation functions using Zod schemas for field-level and business rule validation
- Authorization middleware checking user permissions against required roles
- Hierarchy validation functions preventing circular references and depth violations
- Item count calculation service aggregating direct and nested product counts

**Data Layer**:
- Category query functions with indexed lookups and join optimization
- Transaction wrappers ensuring atomic multi-step operations
- Audit logging service recording all category modifications with user context
- Soft delete handlers setting timestamp and preserving historical data

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.0 with App Router (server and client components)
- **UI Library**: React 18.3.1 (functional components with hooks)
- **Language**: TypeScript 5.8.2 in strict mode
- **Styling**: Tailwind CSS 3.4.1 with custom utility classes
- **Component Library**: Shadcn/ui built on Radix UI primitives for accessibility
- **State Management**:
  - Zustand for UI state (view mode, filters, selections)
  - React Query for server state (category data with caching)
- **Form Handling**: React Hook Form 7.x with Zod validation schemas
- **Drag and Drop**: React DnD (or @dnd-kit) for tree reordering
- **Icons**: Lucide React for consistent icon set
- **Date Handling**: date-fns for timestamp formatting

### Backend
- **Runtime**: Node.js 20.14.0
- **Framework**: Next.js 14 Server Actions (no separate API routes)
- **Database**: PostgreSQL 15+ via Supabase
- **Validation**: Zod 3.x for runtime type checking
- **Authentication**: Supabase Auth with role-based access control

### Testing
- **Unit Tests**: Vitest for component and function testing
- **Integration Tests**: Vitest with test database for server action testing
- **E2E Tests**: Playwright for critical user workflows

### DevOps
- **Version Control**: Git with GitHub repository
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Hosting**: Vercel for Next.js deployment
- **Database**: Supabase managed PostgreSQL
- **Monitoring**: Vercel Analytics and custom error tracking

---

## Component Structure

### Directory Structure

```
app/(main)/product-management/categories/
├── page.tsx                          # Main page (React Server Component)
├── components/
│   ├── category-list.tsx             # Main container (client component)
│   ├── category-tree.tsx             # Tree view with drag-drop
│   ├── category-list-view.tsx        # Flat table view
│   ├── category-form.tsx             # Create/edit dialog
│   ├── category-detail.tsx           # Detail side panel
│   ├── category-delete-dialog.tsx    # Deletion confirmation
│   ├── category-filters.tsx          # Filter panel
│   ├── category-search.tsx           # Search input
│   ├── drag-drop-provider.tsx        # DnD context provider
│   └── tree-node.tsx                 # Recursive tree node
├── hooks/
│   ├── use-categories.ts             # React Query hooks
│   ├── use-category-tree.ts          # Tree state management
│   ├── use-drag-drop.ts              # Drag-drop logic
│   └── use-filters.ts                # Filter state
├── types.ts                          # TypeScript interfaces
├── actions.ts                        # Server actions
├── validations.ts                    # Zod schemas
└── utils.ts                          # Helper functions

lib/types/product.ts                  # Category interface definition
lib/mock-data/categories.ts           # Mock data (development)
```

### Key Components

#### Page Component
**File**: `page.tsx`
**Type**: React Server Component
**Purpose**: Main entry point fetching initial category data and rendering page layout
**Responsibilities**:
- Fetch initial category tree from database server-side for fast first load
- Render page header with title, breadcrumbs, and action buttons
- Pass initial data to client component for hydration
- Handle authentication check and redirect if not logged in
**Data Fetching**: Calls server action to fetch complete category tree with item counts
**Rendering**: Returns CategoryList client component wrapped in layout

#### CategoryList Component
**File**: `components/category-list.tsx`
**Type**: Client Component (use client directive)
**Purpose**: Main container managing view mode, search, filters, and category operations
**Responsibilities**:
- Maintain view mode state (tree or list)
- Manage search term and filter state
- Handle create category action triggering dialog
- Coordinate updates between tree/list views and detail panel
- Display empty states when no categories exist
**Props**: Accepts initialCategories from server, user permissions
**State**: View mode, search term, filter state, selected category ID
**Hooks**: Uses useCategories for data fetching, useFilters for filter logic

#### CategoryTree Component
**File**: `components/category-tree.tsx`
**Type**: Client Component
**Purpose**: Render hierarchical tree with expand/collapse and drag-and-drop
**Responsibilities**:
- Recursively render tree nodes with proper indentation (20px per level)
- Manage expand/collapse state for each node (stored in localStorage)
- Enable drag-and-drop reordering with visual feedback
- Highlight selected node and scroll into view if needed
- Display item counts as badges on each node
- Show loading skeleton while data fetching
**Props**: Categories array, onSelect handler, onReorder handler, expanded state
**Rendering**: Maps over root categories and renders TreeNode for each with children
**Performance**: Uses React.memo to prevent unnecessary re-renders, virtualizes for large trees

#### TreeNode Component
**File**: `components/tree-node.tsx`
**Type**: Client Component (recursive)
**Purpose**: Individual tree node with expand/collapse, drag handle, and actions
**Responsibilities**:
- Render node with name, icon, item count badge, and action buttons
- Handle expand/collapse toggle storing state in parent
- Implement drag source and drop target for reordering
- Show visual feedback during drag (preview, drop zones, hover states)
- Recursively render child nodes when expanded
- Display edit and delete buttons based on permissions
**Props**: Category object, level (depth), expanded flag, handlers for actions
**Drag-Drop**: Uses useDrag and useDrop hooks from React DnD library
**Visual Feedback**: Changes opacity during drag, shows drop indicator lines between nodes

#### CategoryForm Component
**File**: `components/category-form.tsx`
**Type**: Client Component
**Purpose**: Dialog-based form for creating and editing categories
**Responsibilities**:
- Render form fields: name (required), description (optional), parent (for subcategories), active status checkbox
- Validate input using React Hook Form with Zod schema resolver
- Display field-specific error messages below each field
- Handle form submission calling appropriate server action (create or update)
- Show loading spinner during submission
- Close dialog and refresh data on success
- Display server errors if save fails
**Props**: Mode (create or edit), initial data (for edit), parent category (for subcategory creation), onSuccess callback
**Form Fields**: Name (text input), description (textarea), parent selector (disabled in edit mode), active checkbox
**Validation**: Client-side validation on blur and submit, server-side validation on save

#### CategoryDeleteDialog Component
**File**: `components/category-delete-dialog.tsx`
**Type**: Client Component
**Purpose**: Confirmation dialog showing deletion impact and handling deletion
**Responsibilities**:
- Display category name and deletion confirmation message
- Show impact analysis: product count, child category count, warnings
- Offer cascade delete option if category has children
- Require deletion reason input for audit (admin only)
- Call deleteCategory server action on confirmation
- Handle errors (cannot delete if has products) with clear messages
- Close dialog and refresh tree on successful deletion
**Props**: Category to delete, onConfirm callback, onCancel callback
**Warnings**: Displays blocking warnings (has products) vs informational warnings (has children with cascade option)
**Authorization**: Only shows dialog to System Administrators (Product Managers can only deactivate)

#### CategoryListView Component
**File**: `components/category-list-view.tsx`
**Type**: Client Component
**Purpose**: Flat table view with sorting, pagination, and column filtering
**Responsibilities**:
- Render categories in table format with columns: Name, Type, Level, Parent Path, Item Count, Status, Actions
- Implement column sorting (click header to toggle ascending/descending)
- Handle pagination with configurable page size (25, 50, 100, 200)
- Display hierarchical path in Parent column (Category > Subcategory)
- Show action buttons (Edit, Delete) per row with permission checks
- Apply search and filters to visible rows
- Highlight search matches in name and description columns
**State**: Sort column, sort direction, current page, page size
**Pagination**: Client-side pagination after search and filter applied
**Performance**: Virtualizes rows if count exceeds 500 for smooth scrolling

#### SearchInput Component
**File**: `components/category-search.tsx`
**Type**: Client Component
**Purpose**: Debounced search input filtering categories in real-time
**Responsibilities**:
- Render search input field with search icon and placeholder
- Debounce input changes (300ms delay after last keystroke)
- Update parent component's search state triggering filter
- Show clear button (X icon) when search term present
- Display result count below input
- Store search term in URL query parameter for bookmarking
**Debouncing**: Uses useDebounce hook to prevent excessive filtering during typing
**Accessibility**: Properly labeled with aria attributes, keyboard accessible

#### FilterPanel Component
**File**: `components/category-filters.tsx`
**Type**: Client Component
**Purpose**: Multiple filter controls with active filter display
**Responsibilities**:
- Render filter dropdowns: By Level, By Status, By Parent, By Item Count
- Display active filters as removable chips above results
- Provide "Clear All Filters" button when any filter active
- Update filter state in parent component
- Show result count: "Showing X of Y categories"
- Persist filter state to localStorage for session continuity
**Props**: Filter state object, onChange handlers for each filter type
**Chips**: Each active filter shown as chip with filter name and remove (X) button
**Mobile**: Filters collapse into drawer or accordion on small screens

---

## Data Flow

### Read Operations - View Category Hierarchy

```
User navigates to Categories page
    ↓
Page component (RSC) executes on server
    ↓
Server action: getCategories() called server-side
    ↓
Query database for all active categories
    ↓
Build hierarchical tree structure in memory
    ↓
Calculate item counts (direct + nested) for each category
    ↓
Return category tree as JSON
    ↓
Page component renders with initial data
    ↓
CategoryList client component receives initialCategories prop
    ↓
React Query initializes cache with data (no initial fetch needed)
    ↓
User sees category tree instantly (hydrated from server data)
```

**Performance Notes**:
- Server-side rendering eliminates loading spinner on page load
- React Query cache prevents re-fetching unless data changes
- Item counts pre-calculated on server to avoid client-side aggregation
- Single database query with joins for optimal performance

### Read Operations - Search Categories

```
User types in search input
    ↓
Debounce hook waits 300ms after last keystroke
    ↓
Search term updates in component state
    ↓
useMemo recalculates filtered categories
    ↓
Filter applied client-side (no server round-trip):
  - Case-insensitive matching
  - Searches name and description fields
  - Returns matching categories
    ↓
Tree/List view re-renders with filtered results
    ↓
Result count updates ("Found X categories")
    ↓
User sees results within 300ms of last keystroke
```

**Performance Notes**:
- Client-side filtering for instant feedback
- Debouncing prevents excessive filter operations
- useMemo optimization prevents re-filtering on unrelated re-renders
- Search works on cached category data (no network latency)

### Write Operations - Create Category

```
User clicks "Add Category" button
    ↓
CategoryForm dialog opens with empty fields
    ↓
User enters name, description, selects parent (if subcategory/item group)
    ↓
User clicks "Save"
    ↓
React Hook Form validation triggers (client-side)
    ↓
If validation fails: Display field errors, prevent submission
    ↓
If validation passes: Call createCategory server action
    ↓
=== SERVER SIDE ===
Server action receives form data
    ↓
Zod schema validation (authoritative)
    ↓
If validation fails: Return error response
    ↓
Check user has permission to create categories
    ↓
If unauthorized: Return 403 error
    ↓
Check name uniqueness within parent (case-insensitive query)
    ↓
If duplicate: Return validation error
    ↓
Validate hierarchy rules (correct parent level, max depth 3)
    ↓
Begin database transaction
    ↓
Generate unique UUID for new category
    ↓
Calculate sort_order: MAX(siblings.sort_order) + 1
    ↓
Insert category record with all fields
    ↓
Set created_at timestamp and created_by user ID
    ↓
Commit transaction
    ↓
Log creation action to audit table
    ↓
Return success response with created category
=== CLIENT SIDE ===
    ↓
React Query invalidates categories cache
    ↓
Automatic refetch triggered
    ↓
New category appears in tree/list
    ↓
Success toast notification displayed
    ↓
Form dialog closes
    ↓
Tree expands to show new category
    ↓
New category highlighted with scroll into view
```

**Transaction Handling**:
- All database operations wrapped in transaction
- Rollback on any error ensures data consistency
- Audit log written within same transaction

**Error Handling**:
- Client validation prevents invalid submissions
- Server validation catches tampered data
- Database constraints provide final safety net
- User sees specific error messages for each failure type

### Write Operations - Drag-and-Drop Reorder

```
User hovers over category node
    ↓
Drag handle (6 dots icon) becomes visible
    ↓
User clicks and holds on drag handle
    ↓
useDrag hook detects drag start
    ↓
Semi-transparent drag preview follows cursor
    ↓
Source node highlighted with blue border
    ↓
User drags over valid drop zone
    ↓
useDrop hook detects hover
    ↓
Drop zone highlighted with horizontal line
    ↓
User releases mouse over valid target
    ↓
onDrop handler calculates new position
    ↓
Call reorderCategories server action with:
  - dragged category ID
  - new position (index)
  - parent ID (same parent for reorder, different for move)
    ↓
=== SERVER SIDE ===
Validate user has reorder permission
    ↓
Validate drop is allowed (no circular reference, same level)
    ↓
Begin database transaction
    ↓
Calculate new sort_order for dragged category
    ↓
Update sort_order for all affected siblings:
  - Siblings between old and new position
  - Increment or decrement as needed
    ↓
If parent changed: Recalculate path field
    ↓
Update category record
    ↓
Set updated_at and updated_by
    ↓
Commit transaction
    ↓
Log reorder action to audit
    ↓
Return success response
=== CLIENT SIDE ===
    ↓
Optimistic update: Category moves immediately in UI
    ↓
Animate category to new position (300ms slide)
    ↓
React Query invalidates cache
    ↓
Background refetch syncs with server
    ↓
If server error: Revert to original position, show error
    ↓
Success toast: "Category reordered successfully"
```

**Optimistic Updates**:
- Category moves immediately for responsive feel
- Reverts if server rejects operation
- Animation provides visual feedback of movement

**Validation**:
- Prevents dragging category onto its own descendant (circular reference)
- Prevents dragging across hierarchy levels (category to subcategory)
- Prevents dragging to invalid parents

### Delete Operations - Soft Delete Category

```
User clicks "Delete" button on category
    ↓
CategoryDeleteDialog opens
    ↓
System checks category dependencies:
  - Query products.category_id = this category
  - Count child categories
    ↓
Display impact analysis in dialog:
  - "X products assigned" (blocking if X > 0)
  - "Y child categories" (offer cascade option)
  - List affected items
    ↓
If has products: Disable Delete button, show error message
    ↓
If has children: Show cascade delete option
    ↓
User confirms deletion (and cascade if applicable)
    ↓
Admin enters deletion reason (required for audit)
    ↓
Call deleteCategory server action
    ↓
=== SERVER SIDE ===
Verify user is System Administrator (only role with delete permission)
    ↓
If not admin: Return 403 Forbidden
    ↓
Recheck products assigned (prevent race condition)
    ↓
If products found: Return error "Cannot delete, has products"
    ↓
Begin database transaction
    ↓
If cascade delete:
  - Recursively mark all children as deleted
  - Set deleted_at, deleted_by for each child
    ↓
Set deleted_at = current timestamp
    ↓
Set deleted_by = current user ID
    ↓
Set deletion_reason = user-entered reason
    ↓
Do NOT physically delete record (soft delete)
    ↓
Commit transaction
    ↓
Log deletion to audit table with reason
    ↓
Return success response
=== CLIENT SIDE ===
    ↓
React Query invalidates categories cache
    ↓
Refetch triggers
    ↓
Deleted category (and children if cascade) removed from tree
    ↓
If category was selected: Clear selection
    ↓
Close delete dialog
    ↓
Success toast: "Category deleted successfully"
    ↓
Tree re-renders without deleted category
```

**Soft Delete Implementation**:
- Record remains in database with deleted_at timestamp
- Excluded from normal queries via WHERE deleted_at IS NULL
- Preserved for audit trail and historical data integrity
- Restorable by System Administrator if needed

**Cascade Behavior**:
- Children deleted recursively if user confirms
- Each child gets own deleted_at timestamp
- Products on children must be reassigned before cascade
- Transaction ensures atomic deletion (all or nothing)

---

## Server Actions

### Overview

Server actions are located in `actions.ts` and handle all server-side operations. Each action follows a consistent pattern: validate permissions, validate input with Zod schema, execute business logic within transaction, log to audit trail, return structured response. All actions use TypeScript for type safety and return objects with success flag and either data or error message.

### Create Operations

#### createCategory
**Purpose**: Create new category at any hierarchy level with validation and audit logging
**Input Parameters**: Category data object containing name (required string 1-100 chars), description (optional string 0-500 chars), type (CATEGORY, SUBCATEGORY, or ITEM_GROUP), parent_id (required for subcategory and item group, null for category), is_active (boolean defaulting true)
**Validation Steps**:
- Zod schema validates field types, lengths, required fields
- Check user has "Product Manager" or "System Administrator" role
- Validate name uniqueness within same parent (case-insensitive query)
- If type is SUBCATEGORY, validate parent is CATEGORY type
- If type is ITEM_GROUP, validate parent is SUBCATEGORY type
- Prevent creating beyond level 3 (maximum depth enforcement)
- Validate parent exists and is not soft deleted
**Business Logic**:
- Generate UUID using crypto randomUUID
- Calculate level based on type (1 for CATEGORY, 2 for SUBCATEGORY, 3 for ITEM_GROUP)
- Query max sort_order for siblings, add 1 for new sort_order (append to end)
- Construct path by traversing parent chain to root
- Set created_at to current UTC timestamp
- Set created_by to current authenticated user ID
**Database Operations**:
- Begin transaction
- Insert record into categories table
- Commit transaction
- If error: Rollback transaction
**Audit Logging**: Log CREATE action with category ID, user ID, timestamp, all field values
**Returns**: Success object with created category including generated ID, or error object with validation message
**Errors Handled**: ValidationError (field validation fails), DuplicateError (name exists in parent), AuthorizationError (user lacks permission), DatabaseError (insert fails), HierarchyError (invalid parent type or depth exceeded)

#### createSubcategory
**Purpose**: Specialized create operation for subcategories (level 2) with parent category reference
**Differences from createCategory**: Type auto-set to SUBCATEGORY, parent_id required and must reference CATEGORY type, level auto-calculated as 2, validates parent is active before creating child
**Used When**: User right-clicks category and selects "Add Subcategory" or uses "+" button on category node

#### createItemGroup
**Purpose**: Specialized create operation for item groups (level 3) with parent subcategory reference
**Differences from createCategory**: Type auto-set to ITEM_GROUP, parent_id must reference SUBCATEGORY type, level auto-calculated as 3, validates no children can be added to item groups
**Used When**: User right-clicks subcategory and selects "Add Item Group"

### Read Operations

#### getCategories
**Purpose**: Fetch complete category hierarchy for tree view display
**Input Parameters**: Filter options including active_only (boolean default true), level (optional 1, 2, or 3 to filter by hierarchy level), include_counts (boolean default true to include product counts)
**Query Strategy**:
- Select all categories where deleted_at IS NULL (exclude soft deleted)
- If active_only true: Add is_active = true condition
- If level specified: Filter by level field
- Order by parent_id (nulls first for root categories), then sort_order ascending
- Join with products table to calculate item_count if include_counts true
**Tree Construction**:
- Create map of category ID to category object
- Iterate through flat result set
- For each category, find parent in map and add to parent's children array
- Return root categories (parent_id null) with nested children
**Item Count Calculation**: For each category, sum direct products (products.category_id = this category) plus recursive sum of all descendant category product counts
**Returns**: Array of root category objects with nested children arrays and item counts
**Authorization**: All authenticated users can view categories (read access is universal)
**Performance**: Single query with join, builds tree in memory (O(n) complexity), cached by React Query for 5 minutes

#### getCategoryById
**Purpose**: Fetch single category details by UUID with parent and children information
**Input Parameters**: Category ID (UUID string)
**Query**: Select category where id = provided ID and deleted_at IS NULL
**Related Data Fetched**:
- Parent category (if exists) for breadcrumb display
- All child categories for child count
- Product count (direct products assigned to this category)
- Audit fields (created_at, created_by, updated_at, updated_by) with user name lookups
**Returns**: Category object with parent object, children array, and product count, or null if not found
**Used For**: Detail panel display, edit form pre-population, delete impact analysis

#### getCategoryPath
**Purpose**: Construct full breadcrumb path from root to specified category
**Input**: Category ID
**Algorithm**:
- Start with target category
- Recursively query parent_id until reaching root (parent_id null)
- Build array of category names from root to target
- Join with " > " separator
**Returns**: String path like "Raw Materials > Coffee Beans > Arabica"
**Optimization**: Path field pre-calculated and stored in database, updated when parent changes, eliminates need for recursive queries

#### getCategoriesByLevel
**Purpose**: Fetch categories filtered by specific hierarchy level for reports
**Input**: Level (1, 2, or 3)
**Query**: Select where level = specified level and deleted_at IS NULL and is_active = true
**Returns**: Flat array of categories at specified level with item counts
**Used For**: Level-specific reports, parent selector dropdowns (only show appropriate levels)

### Update Operations

#### updateCategory
**Purpose**: Update category name, description, or active status with validation
**Input Parameters**: Category ID (UUID), partial category data object with fields to update
**Validation Steps**:
- Verify user has "Product Manager" or "System Administrator" role
- Fetch existing category from database
- If not found or deleted: Return NotFoundError
- Validate changed fields with Zod schema
- If name changed: Check uniqueness within parent (exclude self from uniqueness check)
- If making inactive: Check if parent is active (cannot activate if parent inactive)
**Optimistic Locking**: Compare updated_at timestamp from client with database value, if mismatch return ConcurrentUpdateError (another user modified category)
**Business Logic**:
- Apply only changed fields to existing record (partial update)
- Recalculate path if parent changed (handled by moveCategory action)
- Set updated_at to current timestamp
- Set updated_by to current user ID
**Database Operations**:
- Begin transaction
- Update record WHERE id = category_id AND updated_at = original_timestamp
- If rows affected = 0: Concurrent update detected, rollback
- Commit transaction
**Audit Logging**: Log UPDATE action with category ID, user ID, timestamp, before and after values for changed fields
**Returns**: Success with updated category object, or error with message
**Errors**: ValidationError, NotFoundError, ConcurrentUpdateError, AuthorizationError

#### updateCategoryStatus
**Purpose**: Toggle active/inactive status separately from other updates
**Input**: Category ID, new is_active value (boolean)
**Validation**: If activating, ensure parent is active (cannot be active if parent inactive)
**Cascade Behavior**: If deactivating, optionally cascade to children (make all descendants inactive)
**Used When**: User clicks Activate/Deactivate toggle or button

#### reorderCategories
**Purpose**: Update sort_order for dragged category and affected siblings atomically
**Input Parameters**: Dragged category ID, new position (integer index within siblings), parent ID (may be different if move to different parent)
**Validation**:
- Verify user has reorder permission
- Validate new parent is appropriate type (if parent changed)
- Check no circular reference (category not its own ancestor)
**Sort Order Calculation Algorithm**:
- If moving down in list: Decrement sort_order of siblings between old and new position
- If moving up in list: Increment sort_order of siblings between new and old position
- Set dragged category sort_order to new position value
- Ensure contiguous sequence (no gaps in sort_order values)
**Database Operations**:
- Begin transaction
- Update multiple category records in single UPDATE statement using CASE
- If parent changed: Also update parent_id and recalculate path
- Commit transaction
**Returns**: Success with updated sort orders for all affected categories
**Used By**: Drag-and-drop handler after user drops category in new position

### Delete Operations

#### deleteCategory
**Purpose**: Soft delete category after validating no products assigned and handling children
**Input Parameters**: Category ID, cascade flag (boolean indicating if children should also be deleted), deletion reason (string required for audit)
**Validation Steps**:
- Verify user is "System Administrator" (only role with delete permission)
- Query products table WHERE category_id = this category
- If products found: Return error "Cannot delete category with {count} products assigned"
- Query categories table for children WHERE parent_id = this category
- If children exist and cascade = false: Return error "Category has children, must cascade delete or move children first"
**Cascade Delete Logic**:
- If cascade = true: Recursively mark all descendants as deleted
- Traverse tree depth-first
- For each child: Verify no products assigned before marking deleted
- If any descendant has products: Abort entire operation (transaction rollback)
**Business Logic**:
- Do NOT physically delete record (SOFT DELETE)
- Set deleted_at = current UTC timestamp
- Set deleted_by = current authenticated user ID
- Store deletion_reason in audit log for compliance
- Record remains in database for historical data and audit trail
**Database Operations**:
- Begin transaction
- Update category (and children if cascade) SET deleted_at, deleted_by
- Commit transaction
- On error: Rollback all changes
**Audit Logging**: Log DELETE action with category ID, cascade flag, deletion reason, user ID, list of affected children if cascade
**Returns**: Success with count of deleted categories, or error explaining why deletion blocked
**Errors**: AuthorizationError (not admin), CannotDeleteError (has products), InvalidOperationError (has children without cascade)

#### restoreCategory
**Purpose**: Restore soft-deleted category by clearing deleted_at timestamp (admin only)
**Input**: Deleted category ID
**Validation**: Verify parent still exists and is not deleted, check user is administrator
**Logic**: Set deleted_at = NULL, deleted_by = NULL, is_active = false (requires explicit reactivation after restore)
**Used When**: Administrator wants to recover accidentally deleted category

---

## Database Schema

**NOTE**: Detailed database definitions are documented in the [Data Dictionary (DD) document](./DD-categories.md). This section provides high-level overview only.

### Tables Overview

#### categories
**Purpose**: Store hierarchical three-level category structure for product organization
**Key Fields**:
- id (UUID primary key): Unique identifier for category
- name (VARCHAR 100, required): Display name, unique within parent
- description (VARCHAR 500, optional): Detailed category description
- type (VARCHAR 20, required): Category type (CATEGORY, SUBCATEGORY, ITEM_GROUP)
- parent_id (UUID, nullable): Foreign key to parent category (null for root level)
- level (INTEGER, required): Hierarchy depth (1, 2, or 3)
- sort_order (INTEGER, required, default 0): Display order among siblings
- path (TEXT, computed): Full breadcrumb path from root (e.g., "Category > Subcategory")
- is_active (BOOLEAN, default true): Active status for dropdown visibility
- created_at (TIMESTAMP, required): Creation timestamp
- created_by (UUID, required): Foreign key to user who created
- updated_at (TIMESTAMP, required): Last modification timestamp
- updated_by (UUID, required): Foreign key to user who last updated
- deleted_at (TIMESTAMP, nullable): Soft delete timestamp (null if active)
- deleted_by (UUID, nullable): Foreign key to user who deleted
**Indexes**:
- Primary key index on id (B-tree)
- Index on parent_id for parent-child queries (B-tree)
- Index on type for filtering by category type (B-tree)
- Index on is_active for active-only queries (B-tree)
- Composite index on (parent_id, sort_order) for sibling ordering (B-tree)
- Unique index on UPPER(name) where parent_id and deleted_at IS NULL (case-insensitive uniqueness within parent)
- Partial index on deleted_at IS NULL for filtering soft-deleted records
**Constraints**:
- Foreign key parent_id references categories(id) with ON DELETE RESTRICT (cannot delete category with children)
- Check constraint: level IN (1, 2, 3) enforces valid levels
- Check constraint: name length between 1 and 100 characters
- Check constraint: sort_order >= 0 (no negative ordering)
- Business rule constraint: If level = 1 then parent_id IS NULL
- Business rule constraint: If level = 2 then parent type must be CATEGORY
- Business rule constraint: If level = 3 then parent type must be SUBCATEGORY

#### products (Referenced)
**Purpose**: Product catalog with category assignments
**Key Fields for Category Integration**:
- category_id (UUID, required): Foreign key to categories(id)
**Constraint**: Foreign key with ON DELETE RESTRICT (cannot delete category with products)
**Usage**: Joined with categories for item count calculations and category-based filtering

### Views

**v_category_counts**: Materialized view pre-calculating direct and nested product counts for each category, refreshed every 5 minutes or on product changes, improves read performance by eliminating recursive COUNT queries.

**v_category_tree**: View flattening category hierarchy with computed columns: full_path (root to leaf), depth (level from root), has_children (boolean), direct_product_count, total_product_count (includes descendants), used for reporting and analytics.

### Triggers

**before_category_update**: Trigger updating updated_at timestamp automatically on any category modification, ensures audit field always current without application code managing it.

**after_category_insert**: Trigger recalculating parent category's item count after child category created, maintains count accuracy in real-time.

**after_product_category_change**: Trigger updating item counts for both old and new categories when product reassigned, ensures counts remain accurate.

**validate_category_hierarchy**: Before insert/update trigger validating hierarchy rules (max depth 3, correct parent types, no circular references), provides database-level enforcement in addition to application validation.

---

## State Management

### Global State (Zustand)

**Purpose**: Manage UI state shared across category components without prop drilling
**Store Name**: useCategoryStore
**State Properties**:
- viewMode: String (tree or list) indicating current display mode
- searchTerm: String for filtering categories by name/description
- filters: Object with filter criteria (level, status, parent, itemCount)
- selectedCategoryId: UUID of currently selected category for detail display
- expandedNodes: Set of category IDs that are expanded in tree view
- isCreating: Boolean flag indicating create dialog is open
- isEditing: Boolean flag indicating edit dialog is open
- draggedCategoryId: UUID of category currently being dragged (null if none)
**Action Methods**:
- setViewMode(mode): Update view mode and persist to localStorage
- setSearchTerm(term): Update search term triggering client-side filter
- setFilters(filters): Update filter criteria object
- setSelectedCategory(id): Select category and load detail data
- toggleNodeExpansion(id): Expand or collapse tree node, persist to localStorage
- openCreateDialog(parentId): Open create form with optional parent preselected
- closeDialog(): Close any open dialog (create, edit, delete)
- startDrag(id): Set dragged category ID when drag starts
- endDrag(): Clear dragged ID when drag ends or cancels
**Persistence**: viewMode and expandedNodes persisted to localStorage for session continuity
**When to Use**: View preferences, temporary selections, UI flags (dialogs open/closed), search and filter state
**Not Used For**: Server data (categories list) - that's managed by React Query

### Server State (React Query)

**Purpose**: Manage category data fetched from server with automatic caching, background refresh, and optimistic updates
**Query Keys**: Hierarchical structure for granular cache invalidation
- ['categories'] - All categories query
- ['categories', 'tree'] - Tree structure with counts
- ['categories', 'list'] - Flat list view
- ['categories', categoryId] - Individual category details
- ['categories', 'counts'] - Item count data
**Query Hooks**:
- useCategories(): Fetch all categories, returns {data, isLoading, error, refetch}
- useCategoryTree(): Fetch tree structure, returns tree with expanded state
- useCategoryById(id): Fetch single category details
- useCategoryCounts(): Fetch pre-calculated item counts
**Mutation Hooks**:
- useCreateCategory(): Create category mutation with optimistic update
- useUpdateCategory(): Update category with optimistic update
- useDeleteCategory(): Delete category with cache invalidation
- useReorderCategories(): Reorder with optimistic positioning
**Cache Strategy**: Stale-while-revalidate pattern - return cached data immediately while fetching fresh data in background, cache valid for 5 minutes (300 seconds), automatic background refetch every 30 seconds if page focused
**Optimistic Updates**: Mutations immediately update local cache before server response for responsive UI, revert on error, apply server response when received for consistency
**Invalidation Strategy**:
- After create: Invalidate ['categories'] and ['categories', 'tree']
- After update: Invalidate ['categories'] and ['categories', categoryId]
- After delete: Invalidate ['categories'] and ['categories', 'tree']
- After reorder: Invalidate ['categories', 'tree'] only
- After product assignment change: Invalidate ['categories', 'counts']
**Error Handling**: Errors stored in query state, component displays error toast, retry button triggers refetch, automatic retry with exponential backoff for transient errors
**Devtools**: React Query Devtools enabled in development for cache inspection

### Local Component State (useState)

**Used For**: Component-specific temporary state not needing global access
**Examples**:
- Form field values (managed by React Hook Form, not manual useState)
- Dialog open/closed state (if not in global store)
- Hover states for drag-drop visual feedback
- Loading flags for individual operations
- Temporary validation messages
**Not Used For**: Data fetched from server (React Query), cross-component shared state (Zustand)

---

## Security Implementation

### Authentication

**Provider**: Supabase Auth provides authentication services
**Session Management**: JWT-based sessions stored in HTTP-only cookies, automatic refresh before expiration
**Token Handling**: Access token included in API request headers (Authorization: Bearer token), refresh token used to obtain new access token when expired
**Login Flow**:
- User submits credentials to Supabase Auth
- Supabase validates and returns access token and refresh token
- Tokens stored in browser cookies (HTTP-only, secure, same-site)
- Next.js middleware validates token on each request
- Expired tokens trigger automatic refresh using refresh token
**Logout**: Clear tokens from cookies, invalidate session server-side, redirect to login page
**Protected Routes**: Next.js middleware checks authentication before allowing access to category pages, redirect to login if not authenticated

### Authorization

**Role-Based Access Control (RBAC)**: Users assigned roles (Staff, Product Manager, System Administrator), each role has specific permissions
**Permission Checks**:
- View categories: All authenticated users (universal read access)
- Create categories: Product Manager and System Administrator roles only
- Edit categories: Product Manager and System Administrator roles only
- Delete categories: System Administrator role only (most restricted)
- Reorder categories: Product Manager and System Administrator roles only
**Enforcement Points**:
- Client-side: Hide action buttons if user lacks permission (UX optimization)
- Server-side: Validate permissions in every server action before executing (authoritative)
- Database-side: Row-level security policies (if using Supabase RLS) provide final safety net
**Permission Check Implementation**: Each server action starts with authorization middleware checking user role against required permission, throws AuthorizationError if check fails, error handled by returning 403 Forbidden response
**Resource-Level Security**: Categories have no ownership model (all users see same categories), permissions based on operation type not resource ownership

### Data Protection

**Input Validation**: All user input validated on both client and server
- Client-side: React Hook Form with Zod schemas provides immediate feedback
- Server-side: Zod schemas validate all input before processing (authoritative)
- Database: Constraints provide final validation layer
**SQL Injection Prevention**: Supabase client uses parameterized queries automatically, no string concatenation in SQL statements, prepared statements for all database operations
**XSS Protection**: All user input sanitized before rendering, React automatically escapes JSX expressions, dangerous HTML functions (dangerouslySetInnerHTML) not used, Content Security Policy (CSP) headers restrict script sources
**CSRF Protection**: Server actions use Next.js built-in CSRF protection with token verification, same-site cookie attribute prevents cross-site requests, custom origin validation for sensitive operations
**Data Encryption**: All data transmitted over HTTPS (TLS 1.3), database connections encrypted, sensitive fields (if any) encrypted at rest using database encryption
**Rate Limiting**: API routes rate limited to prevent abuse, per-user limits: 100 requests per minute for reads, 20 requests per minute for writes, exceeded limits return 429 Too Many Requests

### Audit Logging

**Audit Trail Table**: Separate audit_log table stores all category operations immutably
**Logged Events**:
- CREATE: Category creation with all initial field values
- UPDATE: Category modification with before and after values for changed fields
- DELETE: Category deletion with cascade flag and deletion reason
- REORDER: Drag-and-drop reordering with old and new positions
**Audit Record Fields**:
- event_id (UUID): Unique identifier for audit event
- event_type (VARCHAR): Operation type (CREATE, UPDATE, DELETE, REORDER)
- entity_type (VARCHAR): Always "category" for this module
- entity_id (UUID): ID of affected category
- user_id (UUID): Who performed the operation
- timestamp (TIMESTAMP): When operation occurred (UTC)
- ip_address (VARCHAR): User's IP address for security tracking
- session_id (UUID): User's session ID for request correlation
- before_values (JSONB): Field values before change (null for CREATE)
- after_values (JSONB): Field values after change (null for DELETE)
- metadata (JSONB): Additional context (deletion reason, cascade flag, etc.)
**Audit Log Retention**: Records retained for minimum 7 years for compliance, immutable (insert-only, no updates or deletes), indexed on user_id, timestamp, and entity_id for audit queries
**Audit Queries**: Admin interface allows searching audit logs by date range, user, category, operation type, compliance reports generated from audit data

---

## Error Handling

### Client-Side Error Handling

**Try-Catch Wrapper**: All server action calls wrapped in try-catch blocks to handle async errors
**Error Display Patterns**:
- Form validation errors: Display below each field in red text with error icon
- Operation failures: Show toast notification with error message (top-right corner, auto-dismiss after 5 seconds)
- Network errors: Show persistent error banner with retry button
- Permission errors: Redirect to access denied page or show inline message
**User Feedback Components**:
- Toast notifications for success and error messages (using Sonner or similar library)
- Inline field errors for form validation
- Error boundaries for React component errors
- Loading spinners during async operations
- Skeleton screens for initial page load
**Navigation After Errors**: Stay on current page with error displayed (allow user to correct), redirect only on success or auth errors (login required), preserve form data on validation errors (no data loss)
**Error Recovery Actions**:
- Retry button for network failures
- Refresh button to reload data
- Cancel button to dismiss error and return to previous state
- Help link to support documentation or contact support

**Error Types Handled**:
- **ValidationError**: Display specific field errors on form, highlight invalid fields in red, show summary of errors at top of form if multiple
- **AuthorizationError**: Show "Permission Denied" message with explanation, provide link to request access from administrator, log unauthorized attempt for security review
- **NetworkError**: Show "Connection failed, please try again" with retry button, automatic retry with exponential backoff (3 attempts), switch to offline mode if persistent failure (if applicable)
- **NotFoundError**: Show "Category not found, it may have been deleted" message, remove from local cache, redirect to category list
- **ConcurrentUpdateError**: Show "Another user modified this category" with option to refresh and see latest version or overwrite with current changes (show diff if possible), prevent data loss by showing conflicting values
- **Generic Error**: User-friendly message "Something went wrong, please try again", log full error details to monitoring service, show support contact info

### Server-Side Error Handling

**Validation Layer**: Zod schema validation before any business logic execution
- Parse input with Zod schema
- If validation fails: Return structured error response with field-specific messages
- If validation passes: Continue to business logic
**Error Response Structure**: Consistent format for all server action responses
- success (boolean): True if operation succeeded, false otherwise
- data (object | null): Result data if success, null on error
- error (object | null): Error details if failure, null on success
  - code (string): Machine-readable error code (VALIDATION_ERROR, NOT_FOUND, etc.)
  - message (string): Human-readable error message
  - fields (object): Field-specific errors for validation failures
  - details (object): Additional context for debugging
**Error Logging**: All server errors logged with structured logging
- Log level (ERROR for failures, WARNING for validation failures, INFO for successful operations)
- Timestamp in UTC
- User ID and session ID
- Operation attempted (action name and parameters)
- Error details (stack trace, error code, message)
- Request context (IP address, user agent)
**Database Transaction Rollback**: All database operations wrapped in transactions, automatic rollback on any error, ensures atomic operations (all-or-nothing)
**Error Types**:
- **ValidationError**: Input validation failed, return field-specific error messages
- **AuthorizationError**: User lacks required permission, log attempt, return 403 Forbidden
- **NotFoundError**: Category ID not found or deleted, return 404 Not Found
- **ConflictError**: Duplicate name or constraint violation, return 409 Conflict with details
- **DatabaseError**: Database operation failed (connection lost, query timeout), log error, return 500 Internal Server Error
- **NetworkError**: External service call failed, retry with backoff, if retry exhausted return error
- **BusinessRuleError**: Operation violates business rule (e.g., cannot delete with products), return 400 Bad Request with explanation

**Error Recovery Strategies**:
- Transient errors (network timeout): Automatic retry with exponential backoff (3 attempts)
- Database deadlocks: Retry transaction up to 3 times
- Validation errors: Return immediately without retry (user must fix input)
- Permission errors: Return immediately without retry (user cannot gain permission mid-request)
- Fatal errors (programming bugs): Log error, alert development team, return generic error to user

---

## Performance Optimization

### Frontend Optimization

**Code Splitting**: Large components loaded on demand using dynamic imports
- CategoryForm dialog dynamically imported (not needed until user clicks Add/Edit)
- Detail panel lazy loaded when category selected
- Tree virtualization library imported only when tree exceeds 500 nodes
- Reduces initial bundle size by approximately 30%
**Lazy Loading**: Components and data loaded as needed
- Tree nodes below fold not rendered until scrolled into view
- Detail panel data fetched only when category selected
- Category counts calculated on demand for large datasets
**Memoization**: Expensive calculations cached with useMemo and useCallback
- useMemo for filtered/sorted category lists (only recompute when data or filters change)
- useCallback for event handlers passed to child components (prevent unnecessary re-renders)
- React.memo for TreeNode components (only re-render when props change)
- Item count calculations memoized to avoid recursive sums on every render
**Virtualization**: Long lists rendered with virtual scrolling
- Tree view virtualizes with react-window when nodes exceed 500
- List view virtualizes table rows when categories exceed 1000
- Renders only visible items plus small buffer (30-50 items)
- Reduces DOM nodes and memory usage, maintains 60fps scrolling
**Debouncing**: Rapid input changes throttled to reduce processing
- Search input debounced 300ms after last keystroke
- Filter changes debounced 200ms
- Drag-over events throttled to 100ms for drop zone highlighting
- Prevents excessive re-renders and state updates during typing

### Backend Optimization

**Database Indexing**: Strategic indexes on frequently queried columns
- Index on parent_id for parent-child queries (most common operation)
- Composite index on (parent_id, sort_order) for sibling ordering
- Unique index on UPPER(name) with partial index on deleted_at IS NULL
- Index on is_active for active-only queries (default filter)
- Index on level for level-specific queries
- Query planner uses indexes for O(log n) lookups instead of O(n) scans
**Query Optimization**: Efficient SQL queries with joins and aggregates
- Single query fetches all categories with counts (avoid N+1 queries)
- LEFT JOIN with products table for item counts
- WHERE clause filters soft-deleted records at database level
- EXPLAIN ANALYZE used to verify query plans use indexes
**Caching**: Multi-layer caching strategy
- React Query caches category data client-side for 5 minutes
- Vercel Edge Network caches static assets globally
- Database query results cached at connection pool level
- Item counts pre-calculated and cached, refreshed every 5 minutes
**Pagination**: Limit data transferred per request
- List view paginated server-side (50-200 items per page)
- Tree view loads all data once (typical 100-1000 categories)
- Large trees use cursor-based pagination for lazy loading branches
- Total count query run in parallel with data query for performance
**Batch Operations**: Reduce round trips by batching
- Reorder operation updates multiple categories in single query
- Bulk create/update via array parameters
- Cascade delete processes all children in single transaction

### Caching Strategy

**Browser Caching**: Static assets cached with long TTL
- CSS/JS bundles hashed and cached for 1 year
- Images cached for 30 days
- HTML pages cached for 5 minutes (must-revalidate)
**React Query Cache**: Stale-while-revalidate pattern
- Categories cached for 5 minutes (considered fresh)
- Stale data returned immediately while refetching in background
- Refetch on window focus if data stale
- Manual cache invalidation after mutations
**Server-Side Caching**: Next.js caching at multiple levels
- React Server Components cached at build time (static generation)
- Server action responses cached per request (request deduplication)
- Database query results cached at Supabase connection pool
**Cache Invalidation**: Strategic invalidation on data changes
- Mutations invalidate specific query keys
- Related queries invalidated (e.g., category update invalidates tree and counts)
- Optimistic updates immediately update cache
- Background refetch ensures eventual consistency

---

## Testing Strategy

### Unit Tests

**Location**: `__tests__/unit/` directory
**Framework**: Vitest for fast execution and Jest compatibility
**Coverage Target**: Minimum 80% code coverage
**Focus Areas**:
- Server actions: Test create, update, delete with mocked database
- Business logic functions: Hierarchy validation, item count calculation, path construction
- Validation schemas: Zod schema tests with valid and invalid inputs
- Utility functions: Search filter, sort algorithm, name formatting
**Test Patterns**:
- describe blocks group related tests by function or module
- test blocks for individual scenarios (success cases, error cases, edge cases)
- Mock external dependencies (database, authentication, file system)
- Use test fixtures for consistent test data
- Assertions verify both return values and side effects
**Mocking Strategy**:
- Mock Supabase client to control database responses
- Mock authentication to test with different user roles
- Mock date/time for consistent timestamp testing
- Spy on functions to verify calls and arguments
**Example Tests**:
- createCategory with valid input returns success and generated ID
- createCategory with duplicate name returns validation error
- createCategory with non-admin user returns authorization error
- updateCategory optimistic lock prevents concurrent updates
- deleteCategory with products returns cannot delete error

### Integration Tests

**Location**: `__tests__/integration/` directory
**Framework**: Vitest with test database
**Coverage Target**: Minimum 70% of critical workflows
**Setup**: Test database created before test suite, reset between tests with database migrations and seed data
**Focus Areas**:
- CRUD workflows: Create category, fetch it, update it, delete it (happy path)
- Database queries: Verify correct records returned with proper joins
- Transactions: Verify rollback on error, commit on success
- Constraints: Test database-level validation (unique constraints, foreign keys)
- Cascading operations: Delete with children, update affecting multiple records
**Test Database**: Separate PostgreSQL database for testing
- Schema identical to production
- Reset to known state before each test
- Migrations applied automatically
- Seed data provides consistent starting point
**Test Patterns**:
- Real database operations (no mocking)
- Test end-to-end workflows from server action to database and back
- Verify side effects (audit logs created, counts updated, etc.)
- Test error handling with real database errors (constraint violations)
**Cleanup**: Database reset after each test, connections closed properly, test isolation ensured

### E2E Tests

**Location**: `e2e/` directory
**Framework**: Playwright for cross-browser testing
**Focus Areas**:
- Critical user workflows: View categories, create category, edit category, delete category
- Drag-and-drop: Reorder categories, move to different parent
- Search and filter: Type search, apply filters, clear filters
- View modes: Toggle between tree and list views
- Form validation: Trigger client-side errors, test error display
- Authorization: Verify buttons hidden based on roles
**Browser Coverage**: Test on Chromium, Firefox, and WebKit (Safari)
**Execution Strategy**: Run on staging environment before production deployment, parallel execution for speed, screenshots on failure for debugging
**Test Patterns**:
- Use data-testid attributes for stable element selection
- Page Object Model for reusable page interactions
- Test both happy paths and error paths
- Verify user feedback (toast messages, form errors, redirects)
- Responsive design testing (desktop, tablet, mobile viewports)
**Example Scenarios**:
- User creates category, sees it in tree, selects it, views details
- User searches for category, finds match, clicks to select
- User drags category to new position, sees it move, page refreshes showing new order
- Non-admin user sees view but not edit/delete buttons
- User with invalid permissions sees access denied when attempting operation

### Test Data Management

**Fixtures**: Consistent test data in JSON files
- Sample categories for each hierarchy level
- Various states (active, inactive, with products, empty)
- Different user roles for permission testing
**Factories**: Functions generate test objects with overrides
- createTestCategory(overrides) for custom category data
- createTestUser(role) for different user roles
- createTestTree(depth, width) for various tree structures
**Cleanup**: Tests clean up after themselves
- Delete test records created during test
- Reset database state between tests
- Clear caches and local storage

---

## Deployment Configuration

### Environment Variables

**Required Variables**:
```plaintext
DATABASE_URL: PostgreSQL connection string for Supabase (pooled connection)
DIRECT_URL: Direct PostgreSQL connection for migrations (bypasses connection pooler)
NEXTAUTH_SECRET: Random secret for NextAuth session encryption
NEXTAUTH_URL: Application URL for authentication redirects (https://carmen.example.com)
NEXT_PUBLIC_SUPABASE_URL: Supabase project URL (public, client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anonymous key (public, client-side)
SUPABASE_SERVICE_ROLE_KEY: Supabase service role key (private, server-side only)
```

**Optional Variables**:
```plaintext
LOG_LEVEL: Logging verbosity (debug, info, warn, error) - default: info
SENTRY_DSN: Sentry error tracking DSN for production monitoring
ENABLE_QUERY_LOGGING: Boolean to log all database queries (development only)
```

**Security Best Practices**:
- Never commit .env files to version control (.gitignore includes .env)
- Use Vercel environment variables UI for production secrets
- Rotate secrets periodically (quarterly minimum)
- Separate credentials for development, staging, production
- Service role key restricted to server-side code only (never exposed to client)

### Build Configuration

**Next.js Config** (next.config.js):
- React strict mode enabled for development
- Image optimization configured for Supabase Storage domains
- Redirects for legacy URLs if migrating from old system
- Security headers: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options
- Bundle analyzer enabled in development for size monitoring
**TypeScript Config** (tsconfig.json):
- Strict mode enabled (strictNullChecks, strictFunctionTypes, etc.)
- Path aliases configured: @ maps to root directory
- Target ES2022 for modern JavaScript features
- Module resolution: bundler for Next.js compatibility
**Tailwind Config** (tailwind.config.js):
- Custom color palette for brand colors
- Extended spacing scale for consistent layout
- Custom font family declarations
- Purge configuration to remove unused CSS in production

### Database Migrations

**Migration Tool**: Supabase CLI for database schema changes
**Migration Files**: Located in supabase/migrations/ directory with timestamp prefixes
**Migration Commands**:
```bash
# Create new migration
npx supabase migration new {migration_name}

# Apply migrations locally
npx supabase db push

# Reset local database
npx supabase db reset

# Generate TypeScript types from database schema
npx supabase gen types typescript --local > lib/types/supabase.ts
```

**Migration Strategy**:
- Migrations applied automatically on deployment to staging and production
- Each migration tested on staging before production
- Migrations include both up (apply) and down (rollback) scripts
- Breaking changes deployed in multiple phases (add new, migrate data, remove old)
**Rollback Plan**: Migrations reversible via down scripts, database backups taken before major migrations, rollback tested in staging before production deployment

### Deployment Process

**Development Workflow**:
1. Developer creates feature branch from main
2. Implements changes with tests
3. Runs lint, type check, and tests locally
4. Creates pull request with description
5. Automated CI runs on PR: lint, type check, tests, build
6. Code review by team member
7. Merge to main triggers deployment to staging
8. QA tests on staging environment
9. Manual promotion to production after approval

**CI/CD Pipeline** (GitHub Actions):
- Trigger on push to main branch or pull request
- Install dependencies (npm ci for reproducible builds)
- Run linting (ESLint) to enforce code quality
- Run type checking (TypeScript compiler)
- Run unit and integration tests (Vitest)
- Build Next.js application (npm run build)
- Deploy to Vercel (automatic for main branch)
- Run E2E tests on deployed staging URL
- Send notifications (Slack, email) on success or failure

**Vercel Deployment**:
- Preview deployments for every pull request
- Production deployment on merge to main
- Automatic SSL certificate generation
- Edge network CDN for global performance
- Environment variables configured in Vercel dashboard
- Custom domain configuration
- Automatic database migrations via Vercel build step

---

## Dependencies

### npm Packages

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI library for component rendering |
| react-dom | ^18.3.1 | React DOM bindings |
| next | ^14.2.0 | Full-stack React framework with App Router |
| typescript | ^5.8.2 | Type-safe JavaScript with static analysis |
| @tanstack/react-query | ^5.0.0 | Server state management with caching |
| zustand | ^4.5.0 | Lightweight global state management |
| react-hook-form | ^7.50.0 | Form handling with validation |
| zod | ^3.22.0 | Schema validation for runtime type checking |
| @supabase/supabase-js | ^2.39.0 | Supabase client for database and auth |
| @supabase/auth-helpers-nextjs | ^0.8.0 | Supabase auth integration for Next.js |
| @dnd-kit/core | ^6.1.0 | Drag-and-drop toolkit for reordering |
| @dnd-kit/sortable | ^8.0.0 | Sortable list implementation |
| @radix-ui/react-dialog | ^1.0.5 | Accessible modal dialog primitive |
| @radix-ui/react-dropdown-menu | ^2.0.6 | Accessible dropdown menu primitive |
| tailwindcss | ^3.4.1 | Utility-first CSS framework |
| lucide-react | ^0.344.0 | Icon library with React components |
| date-fns | ^3.3.0 | Date formatting and manipulation |
| sonner | ^1.4.0 | Toast notification library |

### Internal Dependencies

**Shared Type Definitions**: `lib/types/index.ts` exports Category interface used across modules
**Mock Data**: `lib/mock-data/categories.ts` provides test data for development
**Shared Components**: Reuses Button, Input, Dialog components from `components/ui/` (Shadcn)
**Utility Functions**: Uses formatDate, generateId from `lib/utils.ts`
**Authentication Context**: `lib/context/user-context.tsx` provides current user and permissions

### External Service Dependencies

**Supabase**: PostgreSQL database hosting and authentication service
**Vercel**: Hosting platform for Next.js application
**GitHub**: Version control and CI/CD automation
**Sentry** (optional): Error tracking and performance monitoring

---

## Monitoring and Logging

### Application Logging

**Logging Library**: Custom logger utility wrapping console with structured format
**Log Levels**:
- DEBUG: Detailed execution information, function entry/exit, variable states (development only)
- INFO: Significant events, successful operations, user actions (e.g., "User created category")
- WARN: Recoverable errors, deprecated feature usage, unusual conditions (e.g., "Category name contains unusual characters")
- ERROR: Failed operations, unhandled exceptions, system errors (e.g., "Database connection failed")
**Log Structure**: JSON format with consistent fields
- timestamp: ISO 8601 UTC timestamp
- level: Log level (DEBUG, INFO, WARN, ERROR)
- message: Human-readable description
- userId: Current authenticated user ID (if available)
- sessionId: User session ID for request correlation
- categoryId: Affected category ID (for category-specific logs)
- operation: Operation type (CREATE, UPDATE, DELETE, VIEW)
- duration: Operation execution time in milliseconds
- error: Error object with stack trace (if applicable)
- metadata: Additional context as key-value pairs
**Log Destinations**:
- Development: Console output with color coding
- Production: Vercel log drain to external log aggregation service (Datadog, LogDNA, etc.)
- Error logs: Sent to Sentry for alerting and tracking
**Log Retention**: 30 days in log aggregation service, longer retention in archival storage for compliance

### Performance Monitoring

**Metrics Tracked**:
- Page load time: Time from navigation start to page interactive (target: <3 seconds)
- API response time: Server action execution duration (target: <200ms for reads, <500ms for writes)
- Database query performance: Individual query execution time (target: <50ms per query)
- Error rate: Percentage of failed operations (target: <0.1%)
- Cache hit rate: React Query cache effectiveness (target: >80%)
**Monitoring Tools**:
- Vercel Analytics: Page views, user sessions, Core Web Vitals
- Custom instrumentation: Server action timing with timestamps
- Database monitoring: Supabase dashboard shows slow queries, connection pool usage
- React Query Devtools: Cache inspection during development
**Core Web Vitals**:
- Largest Contentful Paint (LCP): Measure largest content element render time (target: <2.5s)
- First Input Delay (FID): Measure interactivity delay (target: <100ms)
- Cumulative Layout Shift (CLS): Measure visual stability (target: <0.1)
**Performance Budgets**:
- Total bundle size: <500KB initial load
- JavaScript bundle: <300KB
- CSS bundle: <50KB
- Images: Optimized and lazy loaded
- Time to Interactive: <3 seconds on 4G network

### Alerts

**Alert Channels**: Email to on-call engineer, Slack notifications to dev channel, Sentry issue creation
**Alert Conditions**:
- Critical: Error rate exceeds 5% for 5 consecutive minutes
- High: Page load time exceeds 5 seconds (p95) for 10 minutes
- Medium: Database query slow (>500ms) detected 10+ times in 5 minutes
- Low: Cache hit rate drops below 60% for 15 minutes
- Security: Unauthorized access attempts detected 5+ times from same IP
- Capacity: Database connections exceed 80% of pool for 5 minutes
**Alert Actions**:
- Automatic page (Pager Duty) for critical alerts
- Slack notification for high/medium alerts
- Email digest for low alerts (batched hourly)
- Auto-scaling triggered if capacity alert
**Alert Dashboard**: Central dashboard showing current system health, active alerts, recent incidents, performance trends

---

## Technical Debt

| Item | Priority | Effort | Notes |
|------|----------|--------|-------|
| Virtualize tree for large datasets | Medium | Medium | Current implementation renders all nodes, consider react-window for >1000 categories |
| Implement offline mode | Low | Large | Allow viewing cached categories when offline, queue mutations for sync when online |
| Optimize item count calculation | Medium | Medium | Pre-calculate and cache counts, update via database triggers instead of real-time aggregation |
| Add keyboard shortcuts | Low | Small | Implement shortcuts: N for new category, E for edit, Delete for delete, Ctrl+F for search |
| Improve drag-drop mobile experience | Medium | Medium | Touch-based drag-drop can be awkward, consider alternative interface for mobile (move buttons) |
| Add bulk operations | Low | Medium | Allow bulk delete, bulk activate/deactivate via checkbox selection |
| Implement category templates | Low | Large | Pre-defined category structures for different industries (hotel, restaurant, etc.) |
| Add category import/export | Medium | Medium | CSV import/export for bulk data management and backup |

---

## Migration Guide

**Note**: This is a new implementation with no prior system to migrate from. This section reserved for future migrations if category system changes significantly.

### Future Migration Considerations

If migrating category data from external system:
1. Export categories from old system in CSV format with hierarchy information
2. Map old category structure to three-level hierarchy (may require flattening or restructuring)
3. Create migration script to insert categories in correct order (parents before children)
4. Validate foreign key relationships after import
5. Recalculate item counts after all products migrated
6. Verify tree structure integrity (no orphans, no circular references)

### Rollback Plan

If deployment causes issues:
1. Revert to previous Vercel deployment via dashboard (one-click rollback)
2. Database migrations automatically rolled back if deploy fails
3. If data corruption detected: Restore from most recent database backup (Supabase provides hourly backups)
4. If partial migration: Complete migration before rollback to avoid inconsistent state

---

## Appendix

### Related Documents
- [Business Requirements](./BR-categories.md) - Functional requirements and business rules
- [Use Cases](./UC-categories.md) - User workflows and scenarios
- [Data Dictionary](./DD-categories.md) - Database structure and relationships
- [Flow Diagrams](./FD-categories.md) - Visual process flows and diagrams
- [Validations](./VAL-categories.md) - Validation rules and error messages

### Useful Commands

**Development**:
```bash
# Start development server with hot reload
npm run dev

# Type check without building
npm run checktypes

# Lint code for errors and style issues
npm run lint

# Format code with Prettier
npm run format
```

**Testing**:
```bash
# Run unit and integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate test coverage report
npm run test:coverage
```

**Database**:
```bash
# Create new migration
npx supabase migration new {name}

# Apply migrations locally
npx supabase db push

# Reset local database to clean state
npx supabase db reset

# Generate TypeScript types from schema
npx supabase gen types typescript --local > lib/types/supabase.ts

# Open Supabase Studio (local database GUI)
npx supabase start
```

**Deployment**:
```bash
# Build production bundle
npm run build

# Start production server locally
npm run start

# Analyze bundle size
npm run analyze

# Deploy to Vercel (automatic on git push)
vercel --prod
```

**Debugging**:
```bash
# Run with Node inspector for debugging
NODE_OPTIONS='--inspect' npm run dev

# Check for outdated packages
npm outdated

# Audit dependencies for vulnerabilities
npm audit
```

---

**Document End**

> 📝 **Note to Implementation Team**:
> - This technical specification describes the implementation in text format without actual code
> - Developers should use this as a guide to understand system architecture and component responsibilities
> - Refer to BR, UC, DS, FD, and VAL documents for complete requirements
> - All described patterns should be implemented following Next.js 14 and React best practices
> - Maintain consistency with existing CARMEN system conventions and patterns
