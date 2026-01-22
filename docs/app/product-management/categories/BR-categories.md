# Business Requirements: Product Categories

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
| 1.0.0 | 2025-11-02 | Documentation Team | Initial version |


## Overview

The Product Categories sub-module provides a comprehensive hierarchical classification system for organizing products within the CARMEN hospitality ERP system. It implements a three-level taxonomy structure (Category → Subcategory → Item Group) that enables effective product organization, inventory management, purchasing workflows, and reporting across all hospitality operations.

The module supports drag-and-drop reorganization, flexible views (tree and list), and real-time search capabilities. Categories serve as the foundational organizational structure referenced by products, recipes, inventory reports, and purchasing workflows throughout the system.

Key capabilities include hierarchical category management (create, read, update, delete operations at all levels), visual tree navigation with expand/collapse functionality, drag-and-drop reordering for intuitive organization, and item count aggregation across the hierarchy. The system ensures referential integrity by preventing deletion of categories containing products while maintaining full audit trails of all category modifications.

## Business Objectives

1. **Organize Product Catalog**: Provide a logical, hierarchical structure for organizing thousands of SKUs across diverse product types (raw materials, finished goods, consumables, non-consumables) used in hospitality operations.

2. **Enable Effective Navigation**: Allow staff to quickly locate products through intuitive tree navigation and search, reducing time spent finding items during purchasing, inventory, and production workflows.

3. **Support Reporting and Analysis**: Enable category-based reporting for spend analysis, inventory valuation, purchasing patterns, and stock movement tracking across departments and cost centers.

4. **Standardize Classification**: Ensure consistent product categorization across all hotel properties and departments, enabling standardized reporting, benchmarking, and best practice sharing.

5. **Facilitate Purchase Planning**: Group related products for bulk purchasing, supplier negotiation, and inventory planning based on category-level demand patterns and lead times.

6. **Improve Data Quality**: Prevent orphaned products and ensure all items are properly classified through enforced category assignment and referential integrity rules.

7. **Enhance User Experience**: Provide intuitive drag-and-drop reorganization and visual hierarchy representation, making it easy for non-technical staff to manage complex taxonomies.

8. **Enable Flexible Organization**: Support multiple organizational perspectives (by product type, by department usage, by supplier, by storage location) through flexible subcategory and item group structures.

## Key Stakeholders

- **Primary Users**: Purchasing Managers (daily product categorization and organization), Inventory Managers (category-based reporting and stock analysis)
- **Secondary Users**: Head Chef (recipe ingredient categorization), Department Managers (category-based budgeting and procurement), Finance Team (category-based spend analysis)
- **Administrators**: System Administrators (category structure design, hierarchy maintenance, data cleanup), Product Management Team (category strategy and taxonomy governance)
- **Support**: IT Support Team (technical issues, data imports, system configuration)

---

## Functional Requirements

### FR-CAT-001: Three-Level Category Hierarchy
**Priority**: Critical

The system must support a three-level hierarchical product classification structure consisting of:
- **Level 1 - Category**: Top-level classification (e.g., "Raw Materials", "Beverages", "Consumables")
- **Level 2 - Subcategory**: Mid-level classification nested under categories (e.g., "Coffee Beans" under "Raw Materials")
- **Level 3 - Item Group**: Finest-level classification nested under subcategories (e.g., "Arabica" under "Coffee Beans")

Each level must support unlimited entries with parent-child relationships enforced through foreign keys. The hierarchy must allow flexible depth (categories with or without subcategories, subcategories with or without item groups) to accommodate different organizational needs.

**Acceptance Criteria**:
- System creates category records with null parent_id (root level)
- System creates subcategory records with category_id as parent_id (level 2)
- System creates item group records with subcategory_id as parent_id (level 3)
- System prevents creating more than 3 levels deep (no children of item groups)
- Each product must be assigned to exactly one category at any level (category, subcategory, or item group)
- System displays hierarchy visually with proper indentation and expansion controls
- Users can navigate through all levels via expandable tree interface

**Related Requirements**: FR-CAT-002 (CRUD operations), FR-CAT-007 (hierarchy navigation), BR-CAT-001 (hierarchy depth limit)

---

### FR-CAT-002: Category CRUD Operations
**Priority**: Critical

The system must provide full Create, Read, Update, and Delete operations for all three hierarchy levels with appropriate validation and permission checks.

**Create Operations**:
- Create new category (root level) with name, description, type identifier
- Create new subcategory under any category with parent reference
- Create new item group under any subcategory with parent reference
- Auto-generate unique IDs for all new entries
- Validate name uniqueness within same parent scope
- Set creation audit fields (created_by, created_at)

**Read Operations**:
- List all categories with optional filtering (by type, search term, status)
- View category details including name, description, item count, children count
- Display hierarchy tree with expand/collapse functionality
- Show parent-child relationships and navigation path (breadcrumb)

**Update Operations**:
- Modify category/subcategory/item group name and description
- Change parent assignment (move within hierarchy with validation)
- Update sort order within siblings
- Set updated audit fields (updated_by, updated_at)

**Delete Operations**:
- Soft delete categories without active product references
- Prevent deletion of categories with product assignments
- Cascade delete prompt for categories with child categories
- Set deleted audit fields (deleted_by, deleted_at)

**Acceptance Criteria**:
- All CRUD operations available at all three hierarchy levels
- System validates data before saving (required fields, uniqueness, format)
- System checks permissions before allowing operations
- System prevents deletion of categories with product references
- System maintains referential integrity across all operations
- All operations logged in audit trail with timestamp and user
- Success/error messages displayed for all operations
- Forms pre-populate with existing data for edit operations

**Related Requirements**: FR-CAT-005 (validation), FR-CAT-010 (permissions), BR-CAT-003 (deletion prevention)

---

### FR-CAT-003: Drag-and-Drop Reordering
**Priority**: High

The system must support intuitive drag-and-drop functionality for reorganizing categories, subcategories, and item groups within the hierarchy. Users can reorder siblings within the same parent and move items to different parents while maintaining hierarchy rules.

**Drag-and-Drop Capabilities**:
- Drag any category/subcategory/item group to reorder within siblings
- Drop on another parent to change hierarchy assignment
- Visual feedback during drag (drag preview, drop zones, hover states)
- Auto-scroll when dragging near viewport edges
- Cancel drag with ESC key or dropping outside valid zones
- Prevent invalid drops (e.g., category into subcategory, circular references)

**Acceptance Criteria**:
- Users can drag-and-drop items using mouse or touch
- System shows visual feedback during drag (preview, drop zones, cursor changes)
- System highlights valid drop targets and dims invalid targets
- System prevents invalid operations (crossing hierarchy levels, circular parents)
- System updates sort order automatically after successful drop
- System persists new order immediately (auto-save)
- System shows loading indicator during save operation
- System handles errors gracefully (revert to original position if save fails)
- Changes immediately reflected in all views without page refresh
- Touch devices support drag-and-drop with appropriate gestures

**Related Requirements**: FR-CAT-001 (hierarchy structure), FR-CAT-006 (sort order), BR-CAT-005 (hierarchy level restrictions)

---

### FR-CAT-004: Tree and List View Modes
**Priority**: High

The system must provide two distinct viewing modes for category data: Tree View (hierarchical with expand/collapse) and List View (flat table with filtering/sorting).

**Tree View Features**:
- Display categories in collapsible tree structure
- Show parent-child relationships with visual indentation
- Expand/collapse controls (chevron icons) for items with children
- Preserve expansion state during session
- Show item count at each level (number of direct products + children counts)
- Visual indicators for category type (icon or color coding)
- Drag-and-drop support for reordering and reparenting
- Breadcrumb navigation showing path from root to selected item
- Highlight currently selected item

**List View Features**:
- Display all categories in flat table format
- Show columns: Name, Type, Level, Item Count, Parent, Status, Actions
- Support column sorting (click header to sort ascending/descending)
- Show hierarchical path in "Parent" column (Category > Subcategory)
- Filter by category level (show only categories, only subcategories, etc.)
- Search across all fields (name, description, parent name)
- Pagination for large datasets (50, 100, 200 items per page)
- Row actions: View, Edit, Delete, View Products

**Acceptance Criteria**:
- Users can toggle between Tree and List views via toggle button
- View preference saved in localStorage for persistence across sessions
- Tree view displays hierarchy correctly with proper indentation (20px per level)
- Tree view expand/collapse works smoothly without page reload
- List view shows all items in tabular format with sortable columns
- List view supports multi-field search and filtering
- Both views show accurate item counts (direct + nested products)
- Both views support quick actions (edit, delete) from row/node
- View transition is instant (< 100ms) with no data reload
- Mobile devices show simplified tree view or switch to list by default

**Related Requirements**: FR-CAT-007 (navigation), FR-CAT-008 (search), FR-CAT-009 (filtering)

---

### FR-CAT-005: Category Data Validation
**Priority**: Critical

The system must enforce comprehensive data validation rules for all category fields at both client and server levels to ensure data integrity and prevent invalid entries.

**Field Validations**:
- **Name**: Required, 1-100 characters, must be unique within same parent, no leading/trailing whitespace, no special characters except space, hyphen, ampersand
- **Description**: Optional, 0-500 characters, allows all text characters
- **Type**: Required, must be one of predefined category types (CATEGORY, SUBCATEGORY, ITEM_GROUP)
- **Parent ID**: Required for subcategories and item groups, must reference valid existing parent, cannot be self or create circular reference
- **Sort Order**: System-generated integer, must be non-negative

**Business Validations**:
- Category names must be unique within the same parent (siblings cannot have duplicate names, but different parents can have children with same names)
- Level validation (categories have no parent, subcategories have category parent, item groups have subcategory parent)
- Prevent circular references (item cannot be its own ancestor)
- Prevent orphaned categories (parent must exist and not be deleted)
- Hierarchy depth limit (maximum 3 levels enforced)

**Acceptance Criteria**:
- System validates all required fields before allowing submission
- System shows field-specific error messages immediately on blur
- System prevents submission if any validation fails
- System checks uniqueness against existing records (case-insensitive)
- System validates parent-child relationships before saving
- System prevents circular references in hierarchy
- System enforces 3-level maximum depth
- System sanitizes input to prevent XSS and injection attacks
- Validation messages are clear, specific, and actionable
- Both client-side (immediate feedback) and server-side (security) validation implemented

**Related Requirements**: FR-CAT-002 (CRUD operations), BR-CAT-002 (naming rules), BR-CAT-004 (uniqueness within parent)

---

### FR-CAT-006: Category Sort Order Management
**Priority**: Medium

The system must maintain and enforce a consistent sort order for categories at each hierarchy level, allowing both automatic sequencing and manual reordering.

**Sort Order Features**:
- Auto-assign sort order on creation (append to end of sibling list)
- Maintain sort order as integer sequence (0, 1, 2, 3...)
- Re-sequence after deletions to maintain continuity (no gaps)
- Support manual reordering via drag-and-drop
- Update sort order of affected siblings when item moved
- Persist sort order in database
- Apply sort order in all views (tree, list, dropdowns, reports)
- Allow sorting by name as alternative (alphabetical A-Z or Z-A)

**Acceptance Criteria**:
- New categories automatically assigned next available sort order
- Sort order is contiguous (no gaps) within siblings
- Drag-and-drop updates sort order of dragged item and affected siblings
- Moving item to different parent updates sort orders in both source and target
- System re-sequences siblings after item deletion
- All queries respect sort order by default
- Users can override with alphabetical sort in list view
- Sort order persists across sessions and page refreshes

**Related Requirements**: FR-CAT-003 (drag-and-drop), FR-CAT-004 (view modes), BR-CAT-006 (sort order default)

---

### FR-CAT-007: Hierarchy Navigation and Breadcrumbs
**Priority**: High

The system must provide intuitive navigation through the category hierarchy with clear visual indication of current location and path from root.

**Navigation Features**:
- Breadcrumb trail showing full path from root to current category (e.g., "Raw Materials > Coffee Beans > Arabica")
- Clickable breadcrumb segments for quick navigation to ancestors
- Expand/collapse controls for tree nodes with children
- Visual hierarchy indicators (indentation, connecting lines, icons)
- Highlight currently selected/active category
- Show sibling count at each level
- Back/forward navigation (browser history integration)

**Acceptance Criteria**:
- Breadcrumb displays complete path from root to selected item
- Each breadcrumb segment is clickable and navigates to that level
- Breadcrumb updates immediately when selection changes
- Tree view shows visual hierarchy with 20px indentation per level
- Expand/collapse icons (chevron right/down) indicate node state
- Clicking node name selects it and displays details
- Clicking expand icon expands without selecting
- Current selection highlighted with background color
- Browser back/forward buttons navigate through category selections
- Breadcrumb wraps appropriately on small screens

**Related Requirements**: FR-CAT-001 (hierarchy), FR-CAT-004 (tree view), FR-CAT-012 (mobile responsiveness)

---

### FR-CAT-008: Category Search Functionality
**Priority**: High

The system must provide fast, comprehensive search capabilities across all category data with real-time results and intelligent matching.

**Search Features**:
- Real-time search (results update as user types, debounced 300ms)
- Search across multiple fields: name, description
- Case-insensitive matching
- Partial word matching (searches for "coff" finds "Coffee Beans")
- Highlight matching terms in results
- Show full hierarchy path in search results
- Clear search button (X icon) to reset
- Search term persists in URL for bookmarking
- Show "no results" message when search returns empty
- Display result count (e.g., "Found 12 categories")

**Acceptance Criteria**:
- Search input prominently displayed at top of page
- Results update within 300ms of last keystroke
- Search matches against name and description fields
- Search is case-insensitive
- Partial matches are found (substring search)
- Results show full hierarchy path (category > subcategory > item group)
- Matching text is highlighted in yellow in results
- Search can be cleared with single click (X icon)
- Empty search shows all categories (no filter)
- Search works in both tree and list views
- Mobile search input is thumb-friendly (minimum 44px height)

**Related Requirements**: FR-CAT-004 (view modes), FR-CAT-009 (filtering), BR-CAT-007 (search scope)

---

### FR-CAT-009: Category Filtering Options
**Priority**: Medium

The system must provide multiple filtering options to help users narrow down category lists based on specific criteria.

**Filter Options**:
- **By Level**: Show only Categories (level 1), only Subcategories (level 2), only Item Groups (level 3), or All levels
- **By Status**: Show only Active, only Inactive, or All
- **By Parent**: Filter to show children of specific parent category
- **By Item Count**: Show only categories with products (item count > 0) or all categories
- **By Name**: Alphabetical ranges (A-F, G-M, N-S, T-Z)

**Filter UI**:
- Dropdown selectors for each filter type
- Multiple filters can be applied simultaneously (AND logic)
- Active filters displayed as chips/tags with remove (X) button
- "Clear All Filters" button when any filter active
- Result count updates to show filtered count vs total
- Filters saved in localStorage for persistence across sessions
- URL parameters reflect active filters for bookmarking/sharing

**Acceptance Criteria**:
- Each filter type displays as dropdown or button group
- Multiple filters can be active simultaneously
- Filters combine with AND logic (all must match)
- Active filters shown as removable chips above results
- Result count shows "Showing X of Y categories"
- Removing filter immediately updates results
- "Clear All" button removes all filters at once
- Filter state persists across page refreshes
- URL reflects active filters (shareable links)
- Filters work in both tree and list views
- Mobile filters collapse into drawer or accordion

**Related Requirements**: FR-CAT-004 (view modes), FR-CAT-008 (search), BR-CAT-008 (filter combinations)

---

### FR-CAT-010: Category Access Permissions
**Priority**: Critical

The system must enforce role-based access control for all category operations, ensuring only authorized users can create, modify, or delete categories.

**Permission Levels**:
- **View Categories**: Can view category tree and details (all authenticated users)
- **Create Categories**: Can add new categories at any level (Product Managers, System Admins)
- **Edit Categories**: Can modify existing category details (Product Managers, System Admins)
- **Delete Categories**: Can soft-delete categories without products (System Admins only)
- **Manage Hierarchy**: Can reorganize hierarchy via drag-and-drop (Product Managers, System Admins)

**Permission Enforcement**:
- Check permissions before displaying action buttons (hide if unauthorized)
- Verify permissions on server before processing operations
- Show "Permission Denied" message if unauthorized access attempted
- Log all permission denials for security audit
- Disable edit fields if user has view-only access
- Show read-only view of category details for unauthorized users

**Acceptance Criteria**:
- UI hides create/edit/delete buttons if user lacks permission
- Server rejects unauthorized operations with 403 Forbidden
- System logs all permission checks and denials
- Users see appropriate error messages when permissions denied
- Permission checks performed before and after form submission
- System prevents direct API access to bypass UI permission checks
- Different users see different UI based on their roles
- Admins see all controls, managers see some, staff see minimal

**Related Requirements**: FR-CAT-002 (CRUD operations), BR-CAT-009 (role-based permissions), NFR-CAT-007 (authorization)

---

### FR-CAT-011: Item Count Aggregation
**Priority**: High

The system must automatically calculate and display item counts (number of products) at each level of the category hierarchy, aggregating counts from all descendant levels.

**Count Calculation**:
- **Direct Count**: Number of products directly assigned to this category/subcategory/item group
- **Nested Count**: Number of products in all child categories (recursive)
- **Total Count**: Direct count + nested count
- Real-time updates: Counts update immediately when products added/removed
- Displayed in category lists, tree nodes, and detail views
- Visual indicator (badge or number in parentheses)

**Acceptance Criteria**:
- Each category node displays total product count (direct + nested)
- Category detail view shows breakdown: X direct products, Y in subcategories
- Counts update immediately when product category assignment changes
- Counts update immediately when products created or deleted
- Empty categories show "0 items" or empty state icon
- Counts are accurate across all hierarchy levels
- Hovering over count shows tooltip with breakdown
- Counts load efficiently (no performance degradation with large datasets)
- Counts visible in both tree and list views
- Counts shown in category dropdowns (for product assignment)

**Related Requirements**: FR-CAT-001 (hierarchy), FR-CAT-004 (view modes), BR-CAT-010 (count accuracy)

---

### FR-CAT-012: Mobile-Responsive Category Management
**Priority**: High

The system must provide full category management functionality on mobile devices (phones and tablets) with touch-optimized interfaces and responsive layouts.

**Mobile Optimizations**:
- Responsive layout adapting to screen sizes (320px to 768px wide)
- Touch-friendly controls (minimum 44x44px tap targets)
- Swipe gestures for navigation and actions (swipe to reveal edit/delete)
- Mobile-optimized tree view (simpler than desktop, less indentation)
- Collapsible filters and search (drawer or accordion pattern)
- Large, thumb-friendly buttons for primary actions
- Modal dialogs fit mobile screens (full-screen on small devices)
- Form inputs optimized for mobile keyboards
- No horizontal scrolling required
- Fast load times on mobile networks (< 3 seconds on 3G)

**Acceptance Criteria**:
- All category management features accessible on mobile devices
- Layout adapts smoothly from desktop to tablet to phone
- Touch targets are at least 44x44 pixels for easy tapping
- Tree view displays correctly with simplified mobile styling
- Drag-and-drop works with touch gestures on mobile
- Forms are easy to fill on mobile (appropriate input types, large fields)
- No features hidden or inaccessible on mobile
- Page loads in under 3 seconds on 3G network
- No horizontal scrolling on any screen size
- Text remains readable without zooming (minimum 16px font size)

**Related Requirements**: FR-CAT-004 (view modes), FR-CAT-007 (navigation), NFR-CAT-002 (responsive design)

---

## Business Rules

### General Rules
- **BR-CAT-001**: **Hierarchy Depth Limit** - The category hierarchy must not exceed 3 levels (Category → Subcategory → Item Group). Item groups cannot have children. This limit ensures manageable complexity and optimal performance.

- **BR-CAT-002**: **Category Naming Conventions** - Category names must be 1-100 characters, cannot contain special characters except space, hyphen, and ampersand, and must start and end with alphanumeric characters. Names should be descriptive and follow title case convention (e.g., "Coffee Beans", not "coffee beans" or "COFFEE BEANS").

- **BR-CAT-003**: **Category Type Assignment** - Each category entry must be explicitly typed as CATEGORY (level 1), SUBCATEGORY (level 2), or ITEM_GROUP (level 3). Type determines allowed operations and relationships.

### Data Validation Rules
- **BR-CAT-004**: **Unique Names Within Parent** - Category names must be unique among siblings (same parent level) but can be reused across different parents. For example, two subcategories under different categories can both be named "Organic", but two subcategories under the same category cannot share the name.

- **BR-CAT-005**: **Parent-Child Level Restrictions** - A CATEGORY can only have SUBCATEGORY children. A SUBCATEGORY can only have ITEM_GROUP children. An ITEM_GROUP cannot have any children. These restrictions enforce the three-level hierarchy limit.

- **BR-CAT-006**: **Circular Reference Prevention** - A category cannot be its own parent or ancestor. When moving categories in the hierarchy, the system must validate that the new parent is not a descendant of the category being moved.

- **BR-CAT-007**: **Cascade Deletion Rules** - When deleting a category with children, the system must either: (1) prevent deletion and warn user that category has children, or (2) cascade delete all children after explicit user confirmation with count of affected items. Products assigned to deleted categories must be re-assigned or flagged for attention.

### Workflow Rules
- **BR-CAT-008**: **Sort Order Management** - Categories at the same level under the same parent are ordered by a numerical sort_order field. When a category is deleted, remaining siblings must be re-sequenced to eliminate gaps (e.g., if items have order 0, 1, 2, 3 and item at position 1 is deleted, remaining items are renumbered to 0, 1, 2).

- **BR-CAT-009**: **Active Status Default** - Newly created categories default to active status (is_active = true). Users must explicitly deactivate categories that should not appear in dropdown selections.

- **BR-CAT-010**: **Product Assignment Requirement** - Every product in the system must be assigned to exactly one category (at any level - category, subcategory, or item group). Products cannot exist without a category assignment. Products can be re-assigned to different categories but cannot be assigned to multiple categories simultaneously.

- **BR-CAT-011**: **Deletion Prevention with Products** - Categories, subcategories, or item groups that have products directly assigned to them cannot be deleted. Users must first re-assign all products to different categories before deletion is allowed. This rule prevents orphaned products.

### Calculation Rules
- **BR-CAT-012**: **Item Count Aggregation** - The displayed item count for each category level includes both direct products and all products in descendant categories. Formula: `total_count = direct_products + sum(children_total_count)`. This recursive calculation must update in real-time when products are added, removed, or reassigned.

- **BR-CAT-013**: **Hierarchy Path Construction** - The full path from root to any category node is constructed by traversing parent relationships upward. Path format: "Level1 > Level2 > Level3" (e.g., "Raw Materials > Coffee Beans > Arabica"). Maximum path length is limited by three-level hierarchy.

### Security Rules
- **BR-CAT-014**: **Role-Based Creation Access** - Only users with roles "Product Manager" or "System Administrator" can create new categories. Regular staff and department managers have read-only access to category structures.

- **BR-CAT-015**: **Role-Based Modification Access** - Only users with roles "Product Manager" or "System Administrator" can modify category names, descriptions, or hierarchy relationships. Edit operations require explicit permission checks before and after submission.

- **BR-CAT-016**: **Role-Based Deletion Access** - Only users with role "System Administrator" can delete categories. Product Managers can deactivate but not delete. This restriction protects system integrity by limiting destructive operations to highest privilege level.

- **BR-CAT-017**: **Audit Trail Requirements** - All category operations (create, update, delete, reorder) must record: user ID, timestamp, operation type, affected category ID, previous values (for updates), and IP address. Audit logs must be immutable and retained for minimum 7 years for compliance.

- **BR-CAT-018**: **Soft Delete Implementation** - Categories are never physically deleted from the database. Deletion sets a `deleted_at` timestamp and `deleted_by` user ID. Soft-deleted categories are excluded from active queries but preserved for historical data integrity and audit purposes.

---

## Data Model

**Note**: The interfaces shown below are **conceptual data models** used to communicate business requirements. They are NOT intended to be copied directly into code. Developers should use these as a guide to understand the required data structure and then implement using appropriate technologies and patterns for the technical stack.

### Category Entity

**Purpose**: Represents a node in the three-level product classification hierarchy. Can be a top-level category, subcategory, or item group depending on its level and parent relationship.

**Conceptual Structure**:

```typescript
/**
 * Base Category interface (from lib/types/common.ts)
 * Supports three-level hierarchy: CATEGORY → SUBCATEGORY → ITEM_GROUP
 */
interface Category {
  // Primary key
  id: string;                          // UUID, unique identifier

  // Core fields
  name: string;                        // Display name (1-100 chars, required)
  description?: string;                // Detailed description (0-500 chars, optional)

  // Hierarchy relationships
  parentId?: string;                   // Parent category ID (undefined for root level)
  level: number;                       // Hierarchy level: 1=Category, 2=Subcategory, 3=ItemGroup

  // Ordering and display
  sortOrder?: number;                  // Position among siblings (BR-CAT-008)
  path?: string;                       // Full hierarchy path (e.g., "Food > Dairy > Cheese")

  // Product relationships (computed fields)
  itemCount?: number;                  // Direct product count (BR-CAT-012)
  totalItemCount?: number;             // Nested product count including children (BR-CAT-012)

  // Status and visibility
  isActive: boolean;                   // Active status (default: true)

  // Audit fields (BR-CAT-017)
  createdAt?: Date;                    // Creation timestamp
  createdBy?: string;                  // Creator user ID
  updatedAt?: Date;                    // Last update timestamp
  updatedBy?: string;                  // Last updater user ID

  // Soft delete fields (BR-CAT-018)
  deletedAt?: Date | null;             // Soft delete timestamp (null if active)
  deletedBy?: string | null;           // User who deleted (null if active)
}

/**
 * Category type classification (from lib/types/product.ts)
 * Used in UI tree operations, not stored on base Category
 */
type CategoryType = 'CATEGORY' | 'SUBCATEGORY' | 'ITEM_GROUP';

/**
 * Extended CategoryItem for UI tree operations (from lib/types/product.ts)
 * Includes type and UI state for tree manipulation
 */
interface CategoryItem {
  id: string;
  name: string;
  type: CategoryType;                  // Explicit type for UI tree operations
  itemCount: number;
  children?: CategoryItem[];
  parentId?: string;
  isExpanded?: boolean;                // UI expansion state
  isEditing?: boolean;                 // UI editing state
}
```

**Note**: The `CategoryType` enum is used in the UI layer (`CategoryItem` interface) for tree operations and display. The base `Category` interface uses the `level` field (1, 2, or 3) to determine hierarchy position. This separation allows flexibility in the data model while providing explicit typing for UI components.

### Product Data Definition (Referenced)

**Purpose**: Products are assigned to categories for organizational purposes. This is a simplified view showing only category-related fields.

```typescript
interface Product {
  id: string;                          // Product UUID
  sku: string;                         // Stock keeping unit code
  name: string;                        // Product name

  // Category relationship
  categoryId: string;                  // Foreign key to Category
  category?: Category;                 // Navigation property

  // Other product fields...
  // (full Product interface defined in Product sub-module documentation)
}
```

---

## Integration Points

### Internal Integrations

- **Product Management - Products Sub-module**: Categories provide the organizational structure for products. Every product must reference a category (category_id foreign key). Products query categories for dropdown selections during creation/editing. Category deletion is blocked if products reference it. Item counts are calculated by querying product assignments.

- **Product Management - Units Sub-module**: No direct integration. Categories and units are independent classification systems (categories for product grouping, units for measurement). However, reporting may combine both dimensions (e.g., "Total inventory value by category and unit type").

- **Inventory Management**: Inventory reports aggregate stock levels and valuations by category. Categories enable reporting queries like "Total inventory value by category", "Stock movement by subcategory", "Low stock alerts by item group". Inventory transactions may be filtered and grouped by product category for analysis.

- **Procurement Module**: Purchase requests and purchase orders can be filtered and grouped by product category. Category-based purchasing enables bulk procurement ("Order all items in Coffee Beans category"), supplier category assignments ("Supplier X provides all Beverage categories"), and category-level budget tracking.

- **Recipe Management**: Recipes may categorize ingredients by product category for costing, inventory planning, and nutritional analysis. Category-based recipe reports enable insights like "Recipe costs by ingredient category", "Recipes using Raw Materials category".

- **Reporting and Analytics**: Categories serve as a primary dimension for all reporting and analytics. Standard reports include: spend by category, inventory valuation by category, product movement by category, supplier performance by category, budget vs actual by category.

### External Integrations

- **None**: Categories are an internal organizational structure with no direct external system integrations. However, category data may be exported to external systems (accounting software, BI tools) as a classification dimension for reporting and analysis.

### Data Dependencies

- **Depends On**:
  - User Management: For user IDs in audit fields (created_by, updated_by, deleted_by)
  - Authentication System: For permission checks on category operations

- **Used By**:
  - Product Management (Products): Requires categories for product classification
  - Inventory Management: Uses categories for inventory reporting and grouping
  - Procurement Module: Uses categories for purchase order grouping and analysis
  - Recipe Management: May use categories for ingredient classification
  - Reporting Module: Uses categories as primary dimension for all product-related reports
  - Financial Management: Uses categories for cost allocation and budgeting

---

## Non-Functional Requirements

### Performance
- **NFR-CAT-001**: **Category List Load Time** - The category list page (tree or list view) must load completely in under 2 seconds with up to 1,000 category entries on a standard 4G connection. Response includes full hierarchy structure, item counts, and initial render.

- **NFR-CAT-002**: **Search Response Time** - Category search must return results within 300ms of the last keystroke for up to 1,000 categories. Debouncing should prevent excessive queries while typing. Search must work efficiently without backend round trips (client-side filtering preferred).

- **NFR-CAT-003**: **Drag-and-Drop Responsiveness** - Drag-and-drop operations must feel responsive with visual feedback appearing within 50ms of mouse/touch interaction. Drop operations (save to database) must complete within 500ms. If save fails, item must revert to original position within 200ms.

- **NFR-CAT-004**: **Item Count Calculation Performance** - Item counts (direct + nested) must be calculated and displayed without perceivable delay (< 200ms). For large hierarchies (100+ categories with 10,000+ products), counts may be pre-calculated and cached, updating asynchronously when products added/removed.

- **NFR-CAT-005**: **Concurrent User Support** - The system must support at least 20 concurrent users viewing and managing categories without performance degradation. Database queries must be optimized with proper indexing on parent_id, type, is_active, and sort_order fields.

### Security
- **NFR-CAT-006**: **Authentication Requirement** - All category management pages and API endpoints must require valid user authentication. Unauthenticated requests must redirect to login page or return 401 Unauthorized.

- **NFR-CAT-007**: **Authorization Enforcement** - All category operations (create, update, delete, reorder) must verify user permissions both in UI (hide unauthorized controls) and on server (reject unauthorized requests with 403 Forbidden). Permission checks must occur before and after form submission.

- **NFR-CAT-008**: **Input Sanitization** - All user input (category names, descriptions) must be sanitized to prevent XSS attacks, SQL injection, and HTML injection. Server-side validation must strip or escape dangerous characters before database storage.

- **NFR-CAT-009**: **Audit Logging** - All category operations must be logged to an immutable audit table including: user ID, timestamp, IP address, operation type (CREATE, UPDATE, DELETE, REORDER), affected category ID, and changed fields with previous and new values. Audit logs must be retained for minimum 7 years.

- **NFR-CAT-010**: **Session Security** - Category management sessions must timeout after 30 minutes of inactivity. Unsaved changes must be preserved in browser storage and restored when user re-authenticates. Sensitive category data must not be cached in browser after logout.

### Usability
- **NFR-CAT-011**: **Intuitive Navigation** - The category hierarchy must be navigable with zero training for users familiar with standard file explorer interfaces. Expand/collapse, drag-and-drop, and breadcrumb navigation must follow common UX patterns.

- **NFR-CAT-012**: **Mobile Usability** - All category management features must be fully functional on mobile devices (phone and tablet) with touch-optimized controls. Minimum tap target size is 44x44 pixels. No horizontal scrolling should be required.

- **NFR-CAT-013**: **Error Message Clarity** - All validation errors and operation failures must display clear, actionable messages explaining what went wrong and how to fix it. Avoid technical jargon in user-facing messages.

- **NFR-CAT-014**: **Keyboard Accessibility** - All category management functions must be accessible via keyboard (no mouse required). Tab navigation, enter to select, arrow keys for tree navigation, and keyboard shortcuts for common actions (N for new, E for edit, Delete for delete).

### Maintainability
- **NFR-CAT-015**: **Code Organization** - Category management code must be organized following Next.js 14 App Router conventions with clear separation: pages (routing), components (UI), services (business logic), types (interfaces), and utils (helpers).

- **NFR-CAT-016**: **Documentation Standards** - All category-related code must include JSDoc comments explaining purpose, parameters, return values, and examples. Complex business logic must include inline comments explaining rationale.

- **NFR-CAT-017**: **Test Coverage** - Category management features must have minimum 80% unit test coverage and 70% integration test coverage. Critical paths (create, update, delete, reorder) must have 100% test coverage.

### Availability
- **NFR-CAT-018**: **Uptime Requirement** - The category management module must maintain 99.5% uptime during business hours (6 AM - 11 PM local time). Planned maintenance must be scheduled during off-peak hours with advance notice.

- **NFR-CAT-019**: **Error Recovery** - If category operations fail due to database errors, the system must gracefully handle failures without data corruption. Failed operations must be retryable, and partial updates must be rolled back transactionally.

### Scalability
- **NFR-CAT-020**: **Hierarchy Size Support** - The system must efficiently handle category hierarchies up to 1,000 total entries (categories + subcategories + item groups) without performance degradation. Queries must use indexed lookups to avoid full table scans.

- **NFR-CAT-021**: **Product Assignment Scalability** - Category item counts must scale to handle 100,000+ product assignments across the hierarchy. Count calculations must be optimized (pre-calculated or cached) to avoid performance issues with large product catalogs.

---

## Success Metrics

1. **User Adoption**: 90%+ of products assigned to 3-level deep categories (Category → Subcategory → Item Group) within 3 months of launch.

2. **Navigation Efficiency**: Average time to locate a category reduced by 50% compared to previous flat list approach (target: < 30 seconds to find any category).

3. **Data Quality**: 99%+ category assignment compliance (all products have valid category assignments, no orphaned products).

4. **Performance**: 95%+ of category operations complete within performance targets (2s page load, 300ms search, 500ms save).

5. **User Satisfaction**: 85%+ satisfaction score on category management UX (measured via user survey).

6. **System Stability**: < 5 category-related bugs reported per month after initial 3-month stabilization period.

7. **Mobile Usage**: 30%+ of category management operations performed on mobile devices within 6 months.

---

## Assumptions and Constraints

**Assumptions**:
- Users are familiar with hierarchical folder structures (similar to file explorers)
- Product catalog contains between 500 and 10,000 products requiring classification
- Maximum category depth of 3 levels is sufficient for all organizational needs
- Users have modern web browsers (Chrome, Firefox, Safari, Edge) within last 2 versions
- Internet connection speed is at least 4G/LTE or equivalent for acceptable performance
- Category reorganization happens infrequently (weekly or monthly, not daily)

**Constraints**:
- Next.js 14 App Router framework (using React Server Components and Server Actions)
- PostgreSQL database for data storage (via Supabase)
- Cannot exceed 3-level hierarchy depth due to performance and UX considerations
- Must maintain backward compatibility with existing product category assignments
- Cannot delete categories with active product assignments (business rule constraint)
- Mobile experience must work on devices as small as 320px width (iPhone SE)
- Must support touch and mouse interactions equally well (no mouse-only features)

---

## Risks and Mitigation

**Risk 1**: Users may struggle with complex hierarchy organization if product catalog is large and categories are not well-defined.
- **Mitigation**: Provide clear guidance on category naming conventions and organization. Implement search and filter features to help users locate categories quickly. Consider providing pre-defined category templates for common hospitality operations.

**Risk 2**: Drag-and-drop functionality may not work well on all mobile devices or with assistive technologies.
- **Mitigation**: Provide alternative input methods (dropdown selectors, move buttons) for users who cannot use drag-and-drop. Ensure keyboard accessibility with arrow key navigation and enter to select.

**Risk 3**: Item count calculations may become slow with very large product catalogs (10,000+ products).
- **Mitigation**: Pre-calculate and cache item counts, updating asynchronously when products change. Use database triggers or background jobs to maintain count accuracy without impacting user-facing performance.

**Risk 4**: Users may accidentally delete important categories with many nested children.
- **Mitigation**: Implement cascade deletion with explicit confirmation showing count of affected items. Consider requiring admin approval for deletion of categories with > 50 products. Implement soft delete to allow recovery.

**Risk 5**: Category names may not be unique across different languages/locales if system expands internationally.
- **Mitigation**: Plan for future internationalization by designing data model to support locale-specific category names (category_translations table). Current implementation can use English names with notes field for translations.

---

## Future Enhancements

**Phase 2 Enhancements** (6-12 months):
- **Category Icons and Colors**: Allow custom icons and color coding for categories to improve visual recognition
- **Category Templates**: Pre-defined category structures for different hospitality types (hotel, restaurant, resort)
- **Bulk Operations**: Batch create, update, or move multiple categories at once
- **Category Analytics Dashboard**: Visual charts showing product distribution across categories, category utilization, empty categories
- **Advanced Search**: Fuzzy matching, search by attributes, saved search filters

**Phase 3 Enhancements** (12-24 months):
- **Multi-Language Support**: Translate category names and descriptions into multiple languages
- **Category Metadata**: Custom fields for categories (e.g., department, cost center, GL account, responsible manager)
- **Category Inheritance**: Inherit attributes from parent categories (e.g., all Coffee Bean subcategories inherit "Perishable" attribute)
- **Category Versioning**: Track history of category structure changes with ability to rollback
- **Category Approval Workflow**: Require approval for category creation/deletion in production environment

---

## Appendix

### Glossary

- **Category**: Top-level (level 1) classification in the three-level hierarchy (e.g., "Raw Materials", "Beverages")
- **Subcategory**: Second-level (level 2) classification nested under a category (e.g., "Coffee Beans" under "Raw Materials")
- **Item Group**: Third-level (level 3) classification nested under a subcategory (e.g., "Arabica" under "Coffee Beans")
- **Hierarchy Depth**: Number of levels from root to a specific node (1 for category, 2 for subcategory, 3 for item group)
- **Direct Product Count**: Number of products directly assigned to a specific category node
- **Nested Product Count**: Sum of all products in descendant categories (children, grandchildren)
- **Total Product Count**: Direct count + nested count
- **Sort Order**: Numerical sequence determining display order of siblings within same parent
- **Soft Delete**: Marking a record as deleted (deleted_at timestamp) without physically removing it from database
- **Circular Reference**: Invalid hierarchy relationship where a category is its own ancestor
- **Breadcrumb**: Navigation trail showing path from root to current location (e.g., "Category > Subcategory > Item Group")

### Related Documents

- **Use Cases**: [UC-categories.md](./UC-categories.md) - Detailed user scenarios and workflows
- **Technical Specification**: [TS-categories.md](./TS-categories.md) - Technical implementation details
- **Data Dictionary**: [DD-categories.md](./DD-categories.md) - Database design and relationships
- **Flow Diagrams**: [FD-categories.md](./FD-categories.md) - Process flows and state diagrams
- **Validation Rules**: [VAL-categories.md](./VAL-categories.md) - Input validation and business rules

---

**Document End**
