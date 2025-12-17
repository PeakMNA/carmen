# Use Cases: Product Categories

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

This document defines all use cases for the Product Categories sub-module of the CARMEN hospitality ERP system. It covers user interactions for managing a three-level category hierarchy (Category → Subcategory → Item Group) used to organize and classify products throughout the system.

The use cases encompass category viewing and navigation, creation and editing operations, drag-and-drop reorganization, search and filtering capabilities, and integrations with related modules (Products, Inventory, Procurement, Recipes). Each use case includes main flow, alternative flows for common variations, exception flows for error handling, and references to related business rules and requirements.

**Related Documents**:
- [Business Requirements](./BR-categories.md)
- [Technical Specification](./TS-categories.md)
- [Data Dictionary](./DD-categories.md)
- [Flow Diagrams](./FD-categories.md)
- [Validations](./VAL-categories.md)

---

## Actors

### Primary Actors

| Actor | Description | Role |
|-------|-------------|------|
| Product Manager | Manages product catalog and organizational structure | Creates, edits, and organizes category hierarchy; maintains taxonomy consistency |
| Inventory Manager | Monitors stock levels and inventory organization | Views categories for inventory reporting; uses category filters for stock analysis |
| Purchasing Manager | Manages procurement and supplier relationships | Views categories for purchase planning; groups orders by category |
| System Administrator | Maintains system configuration and data integrity | Full category management access; performs data cleanup and bulk operations |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| Head Chef | Manages kitchen operations and recipes | Views categories to select ingredients; categorizes recipe components |
| Department Manager | Manages departmental budgets and requisitions | Views categories for budget tracking; filters requisitions by category |
| Staff User | General system user with limited permissions | Read-only access to view categories for product selection |

### System Actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| Product Module | Manages product catalog and specifications | Module - bidirectional data exchange |
| Inventory Module | Tracks stock levels and movements | Module - category-based reporting queries |
| Procurement Module | Manages purchase requests and orders | Module - category-based purchase grouping |
| Recipe Module | Manages recipes and ingredient specifications | Module - ingredient categorization |
| Reporting Module | Generates reports and analytics | Module - category dimension for reporting |

---

## Use Case Diagram

```
                            ┌─────────────────────────────────────────────┐
                            │    Product Categories Management System     │
                            └─────────────────────┬───────────────────────┘
                                                  │
          ┌───────────────────────────────────────┼───────────────────────────────────────┐
          │                                       │                                       │
          │                                       │                                       │
    ┌─────▼──────────┐                     ┌─────▼──────────┐                     ┌─────▼──────────┐
    │    Product     │                     │   Inventory    │                     │    System      │
    │    Manager     │                     │    Manager     │                     │ Administrator  │
    └─────┬──────────┘                     └─────┬──────────┘                     └─────┬──────────┘
          │                                       │                                      │
     [UC-CAT-002]                            [UC-CAT-001]                            [UC-CAT-006]
     [UC-CAT-003]                            [UC-CAT-009]                            [UC-CAT-014]
     [UC-CAT-004]                            [UC-CAT-010]                          (delete access)
     [UC-CAT-005]                           (view & filter)
     [UC-CAT-007]
     [UC-CAT-008]
    (full management)
          │
          │                         ┌────────────────┐
          │                         │  Purchasing    │
          │                         │    Manager     │
          │                         └────────┬───────┘
          │                                  │
          └──────────────────────────────────┤
                                        [UC-CAT-001]
                                        [UC-CAT-009]
                                        [UC-CAT-010]
                                       (view & search)


    ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
    │   Product    │              │  Inventory   │              │ Procurement  │
    │   Module     │              │   Module     │              │   Module     │
    │              │              │              │              │              │
    └──────┬───────┘              └──────┬───────┘              └──────┬───────┘
           │                             │                             │
      [UC-CAT-201]                  [UC-CAT-202]                  [UC-CAT-203]
     (integration)                 (integration)                 (integration)
```

**Legend**:
- **Primary Actors** (top): User roles who directly manage or view categories
- **System Actors** (bottom): Modules that integrate with categories for specific functions
- Use case IDs in brackets indicate which use cases each actor participates in

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **User Use Cases - Viewing and Navigation** | | | | | |
| UC-CAT-001 | View Category Hierarchy | All Users | Critical | Simple | User |
| UC-CAT-011 | Navigate Hierarchy with Breadcrumbs | All Users | High | Simple | User |
| UC-CAT-012 | View Category Item Counts | All Users | High | Medium | User |
| UC-CAT-015 | View Category Details | All Users | Medium | Simple | User |
| **User Use Cases - Creation** | | | | | |
| UC-CAT-002 | Create Category (Level 1) | Product Manager, Admin | Critical | Medium | User |
| UC-CAT-003 | Create Subcategory (Level 2) | Product Manager, Admin | Critical | Medium | User |
| UC-CAT-004 | Create Item Group (Level 3) | Product Manager, Admin | Critical | Medium | User |
| **User Use Cases - Modification** | | | | | |
| UC-CAT-005 | Edit Category Details | Product Manager, Admin | Critical | Medium | User |
| UC-CAT-007 | Drag-and-Drop Reorder Categories | Product Manager, Admin | High | Complex | User |
| UC-CAT-013 | Move Category to Different Parent | Product Manager, Admin | High | Complex | User |
| UC-CAT-014 | Activate/Deactivate Category | Product Manager, Admin | Medium | Simple | User |
| **User Use Cases - Deletion** | | | | | |
| UC-CAT-006 | Delete Category | Admin | Critical | Complex | User |
| **User Use Cases - Views and Display** | | | | | |
| UC-CAT-008 | Switch Between Tree and List Views | All Users | High | Simple | User |
| **User Use Cases - Search and Filter** | | | | | |
| UC-CAT-009 | Search Categories | All Users | High | Medium | User |
| UC-CAT-010 | Filter Categories | All Users | High | Medium | User |
| **Integration Use Cases** | | | | | |
| UC-CAT-201 | Product Module Integration | Product Module | Critical | Medium | Integration |
| UC-CAT-202 | Inventory Module Integration | Inventory Module | High | Medium | Integration |
| UC-CAT-203 | Procurement Module Integration | Procurement Module | High | Medium | Integration |
| UC-CAT-204 | Recipe Module Integration | Recipe Module | Medium | Medium | Integration |

**Complexity Definitions**:
- **Simple**: Single-step or straightforward process, 1-3 scenarios, minimal validation (view operations, toggles)
- **Medium**: Multi-step process with business rules, 4-8 scenarios, moderate validation (create, edit, search operations)
- **Complex**: Multi-step process with complex validation, multiple integrations, 9+ scenarios, extensive error handling (delete with checks, drag-and-drop, hierarchy moves)

**Priority Definitions**:
- **Critical**: Core functionality required for system operation, blocking for users, high business impact
- **High**: Important functionality that significantly enhances user experience, frequent operations
- **Medium**: Supporting functionality, less frequent operations, nice-to-have features

---

## User Use Cases - Viewing and Navigation

### UC-CAT-001: View Category Hierarchy

**Description**: Display the complete three-level category hierarchy in an expandable tree structure, allowing users to browse and understand the product classification system.

**Actor(s)**: All authenticated users (Product Manager, Inventory Manager, Purchasing Manager, Head Chef, Department Manager, System Administrator, Staff)

**Priority**: Critical

**Frequency**: Multiple times per day (every time user accesses product management)

**Preconditions**:
- User is authenticated and has access to product management module
- At least one category exists in the system
- User has permission to view categories (all authenticated users)

**Postconditions**:
- **Success**: Category hierarchy is displayed with current expansion state preserved, user can view structure and navigate to categories
- **Failure**: Error message displayed if data load fails, partial hierarchy shown if some data unavailable

**Main Flow** (Happy Path):
1. User navigates to Product Management → Categories page
2. System retrieves all active categories from database ordered by sort_order
3. System builds hierarchical tree structure with parent-child relationships
4. System calculates item counts (direct and nested) for each category node
5. System renders tree view with root categories expanded by default
6. System displays each node with: name, type icon, item count badge, expand/collapse control
7. System highlights any previously selected category (from session)
8. User sees complete hierarchy with visual indentation (20px per level)
9. Use case ends

**Alternative Flows**:

**Alt-1A: User Expands Category** (At step 8)
- 8a. User clicks expand icon (chevron right) on collapsed category node
- 8b. System rotates chevron icon to down position
- 8c. System reveals child categories with slide-down animation (200ms)
- 8d. System saves expansion state to localStorage
- Continue to step 9

**Alt-1B: User Collapses Category** (At step 8)
- 8a. User clicks collapse icon (chevron down) on expanded category node
- 8b. System rotates chevron icon to right position
- 8c. System hides child categories with slide-up animation (200ms)
- 8d. System saves collapse state to localStorage
- Continue to step 9

**Alt-1C: User Selects Category** (At step 8)
- 8a. User clicks category name to select it
- 8b. System highlights selected category with accent background color
- 8c. System displays category details in side panel or detail section
- 8d. System updates breadcrumb to show path to selected category
- 8e. System saves selected category ID to session storage
- Continue to step 9

**Alt-1D: Empty Category Structure** (At step 2)
- 2a. System finds no categories in database (new installation or all deleted)
- 2b. System displays empty state message: "No categories defined yet. Click 'Add Category' to create your first category."
- 2c. System shows prominent "Add Category" button
- 2d. If user has create permission, button is enabled; otherwise disabled with tooltip
- Use case ends

**Alt-1E: Restore Expansion State** (At step 5)
- 5a. System checks localStorage for previously saved expansion state
- 5b. System finds saved state from user's last session
- 5c. System applies saved state (expand categories that were previously expanded)
- 5d. System scrolls to previously selected category if found
- Continue to step 6

**Exception Flows**:

**Exc-1A: Database Connection Error** (At step 2)
- System fails to connect to database or query times out
- System displays error message: "Unable to load categories. Please check your connection and try again."
- System shows retry button
- System logs error with timestamp and details
- Use case ends

**Exc-1B: Data Load Timeout** (At step 2)
- Category query takes longer than timeout threshold (5 seconds)
- System displays loading skeleton UI
- System continues attempting to load in background
- If load succeeds, system renders tree and removes skeleton
- If load fails after 30 seconds, show error message and retry option
- Use case ends or retries

**Exc-1C: Corrupt Hierarchy Data** (At step 3)
- System detects circular references or orphaned categories during tree building
- System logs data integrity error
- System displays warning: "Category data inconsistency detected. Contact administrator."
- System displays categories in flat list as fallback
- System notifies administrator via email alert
- Use case continues with limited functionality

**Business Rules**:
- **BR-CAT-001**: Hierarchy depth limited to 3 levels (enforced in display)
- **BR-CAT-008**: Categories displayed in sort_order sequence
- **BR-CAT-012**: Item counts show direct + nested products

**Related Requirements**:
- FR-CAT-001: Three-Level Category Hierarchy
- FR-CAT-004: Tree and List View Modes
- FR-CAT-007: Hierarchy Navigation and Breadcrumbs
- FR-CAT-011: Item Count Aggregation

**UI Mockups**: Category Tree View wireframe showing expandable hierarchy with icons and counts

**Notes**:
- Tree expansion state persists across browser sessions via localStorage
- Item counts update in real-time when products are added/removed/reassigned
- Tree view is primary default view, users can switch to list view via toggle
- Mobile devices show simplified tree with larger touch targets (44px minimum)

---

### UC-CAT-011: Navigate Hierarchy with Breadcrumbs

**Description**: Display and interact with a breadcrumb navigation trail showing the full path from root to currently selected category, enabling quick navigation to ancestor categories.

**Actor(s)**: All authenticated users

**Priority**: High

**Frequency**: Daily (when navigating deep hierarchies)

**Preconditions**:
- User has selected a category in the tree view
- Category has at least one parent (level 2 or level 3)
- Breadcrumb component is visible on page

**Postconditions**:
- **Success**: Breadcrumb displays full path, clicking segments navigates to that level
- **Failure**: Breadcrumb shows partial path if ancestor data unavailable

**Main Flow**:
1. User selects a category at any level (category, subcategory, or item group)
2. System highlights selected category in tree view
3. System traverses parent relationships upward to root
4. System constructs breadcrumb path: "Root > Parent > Current"
5. System displays breadcrumb below page header with clickable segments
6. System renders each segment separated by ">" chevron icon
7. System styles current segment as bold and non-clickable
8. System enables hover effect on clickable segments
9. User sees complete path from root to selected category
10. Use case ends

**Alternative Flows**:

**Alt-11A: User Clicks Breadcrumb Segment** (At step 9)
- 9a. User clicks on parent segment in breadcrumb (e.g., "Parent" in "Root > Parent > Current")
- 9b. System navigates to clicked category
- 9c. System updates tree view selection to clicked category
- 9d. System updates breadcrumb to reflect new selection
- 9e. System displays details for clicked category in detail panel
- Continue to step 10

**Alt-11B: Root Category Selected** (At step 3)
- 3a. System detects selected category is root level (parent_id is null)
- 3b. System displays single-segment breadcrumb with just category name
- 3c. System disables breadcrumb click (already at root)
- Continue to step 10

**Alt-11C: Long Category Names** (At step 5)
- 5a. System detects breadcrumb path exceeds available width (> 800px)
- 5b. System truncates middle segments with ellipsis ("Root > ... > Parent > Current")
- 5c. System shows full path on hover tooltip
- 5d. System ensures first and last segments always visible
- Continue to step 6

**Exception Flows**:

**Exc-11A: Missing Parent Data** (At step 3)
- System fails to retrieve parent category data (deleted or data corruption)
- System displays partial breadcrumb with available segments
- System shows warning icon with tooltip: "Incomplete category path"
- System logs data integrity issue
- Use case continues with partial breadcrumb

**Business Rules**:
- **BR-CAT-013**: Breadcrumb path constructed by traversing parent_id relationships
- **BR-CAT-001**: Maximum 3 segments (root > level 2 > level 3)

**Related Requirements**:
- FR-CAT-007: Hierarchy Navigation and Breadcrumbs
- FR-CAT-001: Three-Level Category Hierarchy

**Notes**:
- Breadcrumb updates immediately when selection changes (no page reload)
- Mobile devices show condensed breadcrumb with first and last segments only
- Breadcrumb persists when switching between tree and list views

---

### UC-CAT-012: View Category Item Counts

**Description**: Display the number of products directly assigned to a category plus the aggregate count from all descendant categories, providing visibility into category usage.

**Actor(s)**: All authenticated users

**Priority**: High

**Frequency**: Continuously visible in tree and list views

**Preconditions**:
- User is viewing category hierarchy (tree or list view)
- Categories exist in system
- Product assignments exist (or counts are zero)

**Postconditions**:
- **Success**: Accurate item counts displayed for all categories, counts distinguish between direct and nested products
- **Failure**: Counts show as loading or unavailable if calculation fails

**Main Flow**:
1. User views category list in tree or list view
2. System calculates direct product count for each category (products with category_id = this category)
3. System recursively calculates nested product count (sum of all descendant category counts)
4. System computes total count = direct count + nested count
5. System displays total count as badge next to category name
6. System applies visual styling (gray badge for zero, blue badge for non-zero)
7. User sees count immediately next to each category name (e.g., "Raw Materials (245)")
8. Use case ends

**Alternative Flows**:

**Alt-12A: User Hovers Over Count Badge** (At step 7)
- 7a. User hovers mouse over item count badge
- 7b. System displays tooltip showing breakdown:
  ```
  Total: 245 products
  Direct: 35 products
  In subcategories: 210 products
  ```
- 7c. Tooltip remains visible while mouse hovering
- 7d. Tooltip disappears when mouse moves away
- Continue to step 8

**Alt-12B: User Clicks Count Badge** (At step 7)
- 7a. User clicks on item count badge
- 7b. System navigates to Product list filtered by this category
- 7c. System displays all products in category and descendants
- 7d. System shows breadcrumb indicating filtered view
- Use case ends (transitions to Product List use case)

**Alt-12C: Zero Item Count** (At step 6)
- 6a. System detects category has zero products (direct and nested)
- 6b. System displays count as "(0)" in muted gray color
- 6c. System shows empty state icon (outline badge instead of filled)
- 6d. Tooltip shows "No products assigned"
- Continue to step 7

**Alt-12D: Large Item Count** (At step 6)
- 6a. System detects count exceeds 999
- 6b. System displays abbreviated count: "(1.2K)" or "(10K+)"
- 6c. Tooltip shows exact count: "1,234 products"
- Continue to step 7

**Exception Flows**:

**Exc-12A: Count Calculation Error** (At step 2-4)
- System fails to calculate counts (query error or timeout)
- System displays count as "(-)" with warning icon
- System shows tooltip: "Unable to load item count"
- System logs calculation error
- System retries calculation in background
- Use case continues with unavailable counts

**Exc-12B: Stale Count Data** (At step 4)
- System detects counts may be outdated (last calculation > 5 minutes ago)
- System displays current cached count with refresh icon
- System recalculates counts in background
- System updates display when fresh counts available
- Use case continues with potentially stale data

**Business Rules**:
- **BR-CAT-012**: Total count = direct products + sum of all descendant category counts (recursive)
- **BR-CAT-010**: All products must be assigned to exactly one category

**Related Requirements**:
- FR-CAT-011: Item Count Aggregation
- FR-CAT-001: Three-Level Category Hierarchy

**Notes**:
- Counts update in real-time when products added, removed, or reassigned
- Large hierarchies may use pre-calculated counts updated via background job
- Counts cached for performance, refreshed every 5 minutes or on demand
- Count badge clickable to filter product list by category

---

### UC-CAT-015: View Category Details

**Description**: Display comprehensive information about a selected category including name, description, hierarchy position, product count, and audit information.

**Actor(s)**: All authenticated users

**Priority**: Medium

**Frequency**: Several times per day (when reviewing category information)

**Preconditions**:
- User has selected a category in tree or list view
- Category exists and is not deleted
- User has permission to view category details (all authenticated users)

**Postconditions**:
- **Success**: Complete category details displayed in detail panel or modal
- **Failure**: Error message if category details unavailable

**Main Flow**:
1. User clicks on category name in tree or list view
2. System highlights selected category
3. System retrieves full category details from database (including parent and child relationships)
4. System displays detail panel on right side of screen (or modal on mobile)
5. System shows category information:
   - Name and description
   - Type (Category, Subcategory, or Item Group)
   - Hierarchy level and full path
   - Item counts (direct and nested)
   - Active status
   - Created date and by user
   - Last modified date and by user
   - Number of child categories
6. System displays action buttons (Edit, Delete, Activate/Deactivate) based on permissions
7. System shows "View Products" button linking to filtered product list
8. User reviews category information
9. Use case ends

**Alternative Flows**:

**Alt-15A: View Products in Category** (At step 8)
- 8a. User clicks "View Products" button
- 8b. System navigates to Product list page
- 8c. System applies filter: category_id = selected category
- 8d. System displays all products in category and descendants
- Use case ends (transitions to Product List)

**Alt-15B: Edit Category from Details** (At step 8)
- 8a. User clicks "Edit" button
- 8b. System opens edit dialog pre-populated with current values
- Use case transitions to UC-CAT-005 (Edit Category)

**Alt-15C: Close Detail Panel** (At step 8)
- 8a. User clicks close button (X) or clicks outside panel
- 8b. System hides detail panel with slide-out animation
- 8c. System deselects category in tree view
- Continue to step 9

**Exception Flows**:

**Exc-15A: Category Data Unavailable** (At step 3)
- System fails to retrieve category details
- System displays error message in detail panel: "Unable to load category details"
- System shows retry button
- Use case ends

**Business Rules**:
- **BR-CAT-017**: Audit information displayed for transparency
- **BR-CAT-014-016**: Action buttons shown only if user has required permissions

**Related Requirements**:
- FR-CAT-002: Category CRUD Operations (Read)
- FR-CAT-010: Category Access Permissions

**Notes**:
- Detail panel remains open when switching between categories
- Mobile devices show details in full-screen modal instead of side panel
- Audit information (created by, updated by) shows user names, not IDs

---

## User Use Cases - Creation

### UC-CAT-002: Create Category (Level 1)

**Description**: Create a new top-level category (root level with no parent) to serve as the first level in the three-tier hierarchy.

**Actor(s)**: Product Manager, System Administrator

**Priority**: Critical

**Frequency**: Weekly to monthly (infrequent, as root categories are stable)

**Preconditions**:
- User is authenticated and has category creation permission
- User has navigated to Categories page
- User has "Product Manager" or "System Administrator" role

**Postconditions**:
- **Success**: New category created with unique ID, displayed in tree at root level, sorted at end of sibling list, audit trail recorded
- **Failure**: Category not created, error message explains validation failure, form remains populated for correction

**Main Flow**:
1. User clicks "Add Category" button at top of page
2. System displays category creation dialog/form
3. System pre-selects "Category" as type (level 1)
4. System disables parent selection (root categories have no parent)
5. User enters category name (required, 1-100 characters)
6. User enters description (optional, 0-500 characters)
7. User confirms active status checkbox (checked by default)
8. User clicks "Save" button
9. System validates input fields (required, length, format)
10. System checks name uniqueness at root level (case-insensitive)
11. System generates unique UUID for new category
12. System assigns sort_order as max(existing_sort_orders) + 1
13. System creates category record with type = CATEGORY, parent_id = null, level = 1
14. System sets audit fields (created_by, created_at)
15. System saves category to database
16. System displays success message: "Category '{name}' created successfully"
17. System refreshes category tree
18. System scrolls to and highlights newly created category
19. System closes creation dialog
20. Use case ends

**Alternative Flows**:

**Alt-2A: User Cancels Creation** (At step 8)
- 8a. User clicks "Cancel" button or presses ESC key
- 8b. System displays confirmation dialog: "Discard unsaved changes?"
- 8c. User confirms cancellation
- 8d. System closes creation dialog without saving
- 8e. System returns to category list view
- Use case ends

**Alt-2B: User Wants Inactive Category** (At step 7)
- 7a. User unchecks "Active" status checkbox
- 7b. System sets is_active = false for new category
- 7c. Category will not appear in product assignment dropdowns
- 7d. Category appears with gray/muted styling in tree view
- Continue to step 8

**Alt-2C: Auto-Format Name** (At step 5)
- 5a. User enters name with inconsistent spacing or case: "  raw  MATERIALS  "
- 5b. System auto-trims leading/trailing spaces on blur
- 5c. System suggests title case format: "Raw Materials"
- 5d. User accepts suggestion or keeps original
- Continue to step 6

**Exception Flows**:

**Exc-2A: Validation Error** (At step 9)
- System detects validation failure:
  - Name is empty or exceeds 100 characters
  - Name contains invalid characters (only letters, numbers, space, hyphen, ampersand allowed)
  - Name has leading/trailing whitespace
- System displays field-specific error messages below each invalid field
- System prevents form submission (Save button remains disabled)
- User corrects errors
- Resume at step 9 when all fields valid

**Exc-2B: Duplicate Category Name** (At step 10)
- System finds existing root-level category with same name (case-insensitive)
- System displays error: "Category name 'Raw Materials' already exists at this level. Please choose a different name."
- System highlights name field with error styling
- User modifies name to be unique
- Resume at step 10

**Exc-2C: Database Error** (At step 15)
- System fails to save category due to database error (connection lost, constraint violation)
- System displays error message: "Unable to create category. Please try again."
- System logs error details for support team
- System keeps form open with entered data preserved
- User can retry submission or cancel
- Use case ends

**Exc-2D: Permission Denied** (At step 1 or 9)
- System detects user lacks category creation permission
- System displays error: "You do not have permission to create categories. Contact your administrator."
- System logs permission denial attempt
- System disables "Add Category" button for this user
- Use case ends

**Business Rules**:
- **BR-CAT-002**: Category names follow naming conventions (1-100 chars, specific character restrictions, title case recommended)
- **BR-CAT-003**: New category explicitly typed as CATEGORY (level 1)
- **BR-CAT-004**: Root-level category names must be unique among other root categories (case-insensitive)
- **BR-CAT-008**: Sort order auto-assigned to append at end
- **BR-CAT-009**: Active status defaults to true
- **BR-CAT-014**: Only Product Managers and Admins can create categories

**Includes**:
- Field validation (VAL-CAT-001 through VAL-CAT-012)

**Related Requirements**:
- FR-CAT-001: Three-Level Category Hierarchy
- FR-CAT-002: Category CRUD Operations
- FR-CAT-005: Category Data Validation
- FR-CAT-010: Category Access Permissions

**Notes**:
- Category creation is relatively infrequent as root structure is stable
- New categories appear immediately in tree without page reload
- Created categories can have subcategories added subsequently
- System suggests naming conventions in placeholder text: "e.g., Raw Materials, Beverages, Consumables"

---

### UC-CAT-003: Create Subcategory (Level 2)

**Description**: Create a new subcategory nested under an existing category, representing the second level in the hierarchy.

**Actor(s)**: Product Manager, System Administrator

**Priority**: Critical

**Frequency**: Weekly (more frequent than category creation as middle-level structure evolves)

**Preconditions**:
- User has category creation permission
- At least one root-level category exists
- User has selected parent category or is viewing category tree
- Parent category is active and not deleted

**Postconditions**:
- **Success**: New subcategory created under selected parent, parent expanded to show new child, sort order assigned, audit recorded
- **Failure**: Subcategory not created, validation error shown, form remains open for correction

**Main Flow**:
1. User right-clicks on category in tree view and selects "Add Subcategory" OR
   User clicks "+" icon next to category name OR
   User clicks "Add Subcategory" button while category is selected
2. System displays subcategory creation dialog
3. System pre-fills parent field with selected category (disabled/read-only)
4. System pre-selects "Subcategory" as type (level 2)
5. System displays parent breadcrumb: "Parent: {Category Name}"
6. User enters subcategory name (required, 1-100 characters)
7. User enters description (optional, 0-500 characters)
8. User confirms active status (checked by default)
9. User clicks "Save" button
10. System validates input fields
11. System checks name uniqueness within parent (siblings cannot have duplicate names)
12. System validates parent is level 1 (CATEGORY type)
13. System generates unique UUID
14. System assigns sort_order as max(sibling_sort_orders) + 1
15. System creates subcategory record with type = SUBCATEGORY, parent_id = parent.id, level = 2
16. System sets audit fields (created_by, created_at)
17. System saves to database
18. System displays success message: "Subcategory '{name}' created under '{parent.name}'"
19. System refreshes tree and expands parent category
20. System highlights newly created subcategory
21. System closes dialog
22. Use case ends

**Alternative Flows**:

**Alt-3A: Select Different Parent** (At step 3)
- 3a. User wants to create subcategory under different parent
- 3b. User clicks "Change Parent" button in dialog
- 3c. System displays category selector (only root-level categories shown)
- 3d. User selects different parent category
- 3e. System updates parent field and breadcrumb
- Continue to step 6

**Alt-3B: Create Multiple Subcategories** (At step 21)
- 21a. User enabled "Create Another" checkbox before saving
- 21b. System creates subcategory as normal
- 21c. System clears form fields (except parent selection)
- 21d. System keeps dialog open for next subcategory
- 21e. User repeats process for additional subcategories
- 21f. User clicks "Done" or "Cancel" when finished
- Use case ends

**Alt-3C: Inactive Parent Warning** (At step 12)
- 12a. System detects selected parent has is_active = false
- 12b. System displays warning: "Parent category is inactive. Subcategory will inherit inactive status."
- 12c. System sets is_active = false for new subcategory
- 12d. User acknowledges warning or cancels creation
- Continue to step 13 or end use case

**Exception Flows**:

**Exc-3A: Duplicate Subcategory Name Within Parent** (At step 11)
- System finds existing subcategory with same name under same parent
- System displays error: "Subcategory 'Coffee Beans' already exists under 'Raw Materials'. Please choose different name."
- System highlights name field
- User modifies name
- Resume at step 11

**Exc-3B: Invalid Parent Level** (At step 12)
- System detects selected parent is not level 1 (is subcategory or item group)
- System displays error: "Cannot create subcategory under '{parent.name}'. Subcategories can only be created under root categories."
- System prompts user to select different parent
- Resume at step 3

**Exc-3C: Parent Not Found** (At step 10)
- System cannot retrieve parent category (deleted or data corruption)
- System displays error: "Parent category no longer exists. Please select different parent."
- System refreshes category list
- Resume at step 1

**Exc-3D: Database Constraint Violation** (At step 17)
- Database rejects insertion due to foreign key constraint (parent_id invalid)
- System displays error: "Unable to create subcategory. Parent category may have been deleted."
- System refreshes parent selection
- User selects valid parent
- Resume at step 3

**Business Rules**:
- **BR-CAT-003**: Type must be SUBCATEGORY (level 2)
- **BR-CAT-004**: Name must be unique among siblings (same parent), but can duplicate across different parents
- **BR-CAT-005**: Parent must be CATEGORY type (level 1)
- **BR-CAT-001**: Enforces hierarchy depth (subcategories are level 2 of 3)

**Related Requirements**:
- FR-CAT-001: Three-Level Category Hierarchy
- FR-CAT-002: Category CRUD Operations
- FR-CAT-005: Category Data Validation

**Notes**:
- Context menu (right-click) provides quickest access to subcategory creation
- Multiple subcategories can be created in sequence with "Create Another" option
- Parent category automatically expands to show newly created subcategory
- Same name can exist under different parents (e.g., "Organic" under both "Coffee Beans" and "Tea Leaves")

---

### UC-CAT-004: Create Item Group (Level 3)

**Description**: Create a new item group nested under an existing subcategory, representing the finest level (level 3) in the hierarchy.

**Actor(s)**: Product Manager, System Administrator

**Priority**: Critical

**Frequency**: Daily to weekly (most frequent creation as item groups provide finest classification)

**Preconditions**:
- User has category creation permission
- At least one subcategory exists
- User has selected parent subcategory
- Parent subcategory is active and not deleted

**Postconditions**:
- **Success**: New item group created under parent subcategory, hierarchy complete to level 3, audit recorded
- **Failure**: Item group not created, validation error displayed, form preserved

**Main Flow**:
1. User right-clicks subcategory and selects "Add Item Group" OR
   User clicks "+" icon next to subcategory OR
   User clicks "Add Item Group" button while subcategory selected
2. System displays item group creation dialog
3. System pre-fills parent field with selected subcategory (read-only)
4. System pre-selects "Item Group" as type (level 3)
5. System displays parent breadcrumb: "Parent: {Category} > {Subcategory}"
6. User enters item group name (required, 1-100 characters)
7. User enters description (optional, 0-500 characters)
8. User confirms active status (checked by default)
9. User clicks "Save" button
10. System validates input fields
11. System checks name uniqueness within parent subcategory
12. System validates parent is level 2 (SUBCATEGORY type)
13. System generates unique UUID
14. System assigns sort_order as max(sibling_sort_orders) + 1
15. System creates item group record with type = ITEM_GROUP, parent_id = parent.id, level = 3
16. System sets audit fields
17. System saves to database
18. System displays success message: "Item group '{name}' created under '{parent.name}'"
19. System refreshes tree, expands parent subcategory
20. System highlights new item group
21. System closes dialog
22. Use case ends

**Alternative Flows**:

**Alt-4A: View Full Hierarchy Path** (At step 5)
- 5a. User clicks "View Path" link in dialog
- 5b. System displays full breadcrumb from root: "Category > Subcategory"
- 5c. System shows item count at each level
- 5d. User confirms correct parent location
- Continue to step 6

**Alt-4B: Create From Product Assignment** (Alternate start)
- 1a. User is creating/editing product and needs new item group
- 1b. User clicks "Create New Item Group" from category selector dropdown
- 1c. System opens item group creation dialog in modal
- 1d. System pre-fills parent from product's current category
- Continue to step 6

**Alt-4C: Bulk Create Item Groups** (At step 21)
- 21a. User has list of multiple item groups to create under same parent
- 21b. User clicks "Bulk Create" button instead of single create
- 21c. System displays multi-line text area
- 21d. User enters one item group name per line
- 21e. System creates all item groups with sequential sort_order
- 21f. System displays success count: "Created 5 item groups under '{parent}'"
- Use case ends

**Exception Flows**:

**Exc-4A: Duplicate Item Group Name** (At step 11)
- System finds existing item group with same name under same subcategory
- System displays error: "Item group 'Arabica' already exists under 'Coffee Beans'. Please choose different name."
- User modifies name
- Resume at step 11

**Exc-4B: Invalid Parent Type** (At step 12)
- System detects parent is not subcategory (is root category or already item group)
- If parent is category (level 1):
  - System displays error: "Cannot create item group directly under category. Create subcategory first."
- If parent is item group (level 3):
  - System displays error: "Cannot create item group under another item group. Maximum 3 levels allowed."
- System prompts user to select valid subcategory parent
- Resume at step 3

**Exc-4C: Maximum Depth Reached** (At step 12)
- System detects attempt to create beyond level 3
- System displays error: "Maximum hierarchy depth (3 levels) reached. Cannot create deeper levels."
- System explains: "Hierarchy: Category > Subcategory > Item Group (maximum)"
- Use case ends

**Business Rules**:
- **BR-CAT-001**: Maximum 3 levels enforced - item groups cannot have children
- **BR-CAT-003**: Type must be ITEM_GROUP (level 3)
- **BR-CAT-004**: Name unique within parent, can duplicate across different parents
- **BR-CAT-005**: Parent must be SUBCATEGORY type (level 2)

**Related Requirements**:
- FR-CAT-001: Three-Level Category Hierarchy (enforces 3-level maximum)
- FR-CAT-002: Category CRUD Operations
- FR-CAT-005: Category Data Validation

**Notes**:
- Item groups are the finest classification level and most frequently created
- Products are typically assigned to item groups for precise categorization
- No "Add Child" option appears on item group nodes (cannot have children)
- Bulk creation useful when importing product categories from external systems
- Item groups provide specificity: "Raw Materials > Coffee Beans > Arabica/Robusta/Liberica"

---

## User Use Cases - Modification

### UC-CAT-005: Edit Category Details

**Description**: Modify the name, description, or active status of an existing category at any hierarchy level.

**Actor(s)**: Product Manager, System Administrator

**Priority**: Critical

**Frequency**: Weekly (name refinements, description updates, status changes)

**Preconditions**:
- User has category edit permission
- Category exists and is not deleted
- User has selected category to edit
- Category is not actively referenced in critical processes

**Postconditions**:
- **Success**: Category updated with new values, changes reflected immediately in all views, audit trail recorded, dependent data remains consistent
- **Failure**: Category unchanged, error message explains validation failure, form remains open with original values

**Main Flow**:
1. User selects category in tree or list view
2. User clicks "Edit" button or double-clicks category name
3. System opens edit dialog pre-populated with current values:
   - Name (editable)
   - Description (editable)
   - Active status (editable checkbox)
   - Type (read-only, cannot change)
   - Parent (read-only for existing categories)
   - Level (read-only, computed)
4. System displays current item count and child count (informational)
5. User modifies name, description, or active status
6. User clicks "Save" button
7. System validates modified fields (required, length, format)
8. System checks name uniqueness within same parent (if name changed)
9. System updates category record with new values
10. System updates updated_at timestamp and updated_by user
11. System saves to database
12. System displays success message: "Category '{name}' updated successfully"
13. System refreshes category display in tree/list
14. System maintains current scroll position and selection
15. System closes edit dialog
16. Use case ends

**Alternative Flows**:

**Alt-5A: User Cancels Edit** (At step 6)
- 6a. User clicks "Cancel" or presses ESC
- 6b. System checks if any fields were modified
- 6c. If modified, system displays confirmation: "Discard changes?"
- 6d. User confirms cancellation
- 6e. System reverts to original values
- 6f. System closes dialog without saving
- Use case ends

**Alt-5B: Deactivate Category** (At step 5)
- 5a. User unchecks "Active" checkbox to deactivate category
- 5b. System displays warning: "Deactivating will hide category from product assignment dropdowns. Continue?"
- 5c. If category has children: "Child categories will also be hidden from dropdowns."
- 5d. User confirms deactivation
- 5e. System sets is_active = false
- Continue to step 7

**Alt-5C: Reactivate Category** (At step 5)
- 5a. User checks "Active" checkbox to reactivate inactive category
- 5b. If parent category is inactive: System displays warning "Parent category is inactive. This category will remain hidden until parent is activated."
- 5c. User confirms reactivation
- 5d. System sets is_active = true
- Continue to step 7

**Alt-5D: View Edit History** (At step 4)
- 4a. User clicks "View History" link in dialog
- 4b. System displays modal showing change history:
  ```
  Modified 2024-03-15 by John Doe
  - Changed name from "Coffee" to "Coffee Beans"
  - Updated description

  Created 2024-01-10 by Jane Smith
  ```
- 4c. User reviews history
- 4d. User closes history modal
- Continue to step 5

**Alt-5E: No Changes Made** (At step 6)
- 6a. User clicks Save without modifying any fields
- 6b. System detects no changes
- 6c. System displays message: "No changes to save"
- 6d. System closes dialog without database update
- Use case ends

**Exception Flows**:

**Exc-5A: Duplicate Name After Edit** (At step 8)
- User changed name to match existing sibling category
- System displays error: "Category name '{new_name}' already exists under '{parent}'. Choose different name."
- System highlights name field
- User modifies name to be unique
- Resume at step 8

**Exc-5B: Validation Error** (At step 7)
- Modified name violates validation rules (empty, too long, invalid characters)
- System displays field-specific errors
- System prevents save until errors corrected
- User fixes validation errors
- Resume at step 7

**Exc-5C: Concurrent Edit Detected** (At step 9)
- Another user modified category between when edit dialog opened and save clicked
- System displays warning: "Category was modified by {user} at {timestamp}. Your changes may overwrite theirs."
- System shows comparison of changes
- User chooses: "Save anyway" or "Cancel and refresh"
- If save anyway: continue to step 10
- If cancel: reload fresh data and resume at step 3

**Exc-5D: Category Deleted During Edit** (At step 9)
- Another user deleted category while edit dialog was open
- System displays error: "Category no longer exists. It may have been deleted."
- System closes dialog
- System refreshes category list
- Use case ends

**Exc-5E: Database Update Failure** (At step 11)
- Database update fails (connection lost, constraint violation)
- System displays error: "Unable to save changes. Please try again."
- System logs error details
- System keeps dialog open with unsaved changes
- User can retry save or cancel
- Resume at step 6

**Business Rules**:
- **BR-CAT-002**: Name must follow naming conventions
- **BR-CAT-004**: Name must be unique within parent (siblings)
- **BR-CAT-017**: All edits logged in audit trail
- **BR-CAT-015**: Only Product Managers and Admins can edit

**Related Requirements**:
- FR-CAT-002: Category CRUD Operations (Update)
- FR-CAT-005: Category Data Validation
- FR-CAT-010: Category Access Permissions

**Notes**:
- Cannot change category type (CATEGORY, SUBCATEGORY, ITEM_GROUP) after creation to maintain hierarchy integrity
- Cannot change parent via edit (use Move operation instead, UC-CAT-013)
- Deactivating category hides it from product assignment dropdowns but preserves existing product assignments
- Double-click to edit is keyboard-accessible alternative to Edit button
- Edit dialog supports keyboard navigation (Tab, Enter, ESC)

---

### UC-CAT-007: Drag-and-Drop Reorder Categories

**Description**: Reorder categories within the same parent (change sort order among siblings) or move to different parent (change hierarchy position) using intuitive drag-and-drop interaction.

**Actor(s)**: Product Manager, System Administrator

**Priority**: High

**Frequency**: Weekly to monthly (periodic reorganization as product catalog evolves)

**Preconditions**:
- User has category management permission
- Multiple categories exist at same level
- User is viewing tree view (drag-and-drop not available in list view)
- Browser supports drag-and-drop API

**Postconditions**:
- **Success**: Category moved to new position, sort order updated for affected siblings, hierarchy relationships maintained, changes persisted to database
- **Failure**: Category returns to original position, error message explains why move failed, no data changed

**Main Flow** (Reorder Within Same Parent):
1. User hovers mouse over category name in tree view
2. System displays drag handle icon (6 dots) to left of category name
3. User clicks and holds on drag handle or category name
4. System detects drag start event
5. System creates semi-transparent drag preview showing category name
6. System highlights dragged category with blue border
7. User moves mouse while holding down (dragging)
8. System displays drop zones (horizontal lines) between sibling categories
9. System highlights valid drop zones in green on hover
10. System shows "cannot drop" cursor over invalid targets (different parent, wrong level)
11. User releases mouse over valid drop zone
12. System calculates new sort_order position
13. System updates sort_order for dragged category and affected siblings
14. System saves changes to database
15. System animates category moving to new position (300ms slide animation)
16. System displays success toast: "Category reordered successfully"
17. System removes drag preview and highlights
18. Use case ends

**Alternative Flows**:

**Alt-7A: Move to Different Parent** (At step 11)
- 11a. User drags category over different parent category node
- 11b. System highlights parent node with blue background (drop target)
- 11c. System validates move is allowed (hierarchy rules)
- 11d. User releases mouse over parent node
- 11e. System prompts confirmation: "Move '{category}' under '{new_parent}'?"
- 11f. User confirms move
- 11g. System updates parent_id to new parent
- 11h. System updates level if moving to different depth
- 11i. System recalculates path
- 11j. System updates sort_order to append at end of new parent's children
- 11k. System saves to database
- 11l. System expands new parent to show moved category
- 11m. System displays success message
- Continue to step 18

**Alt-7B: Cancel Drag** (At step 7-11)
- User presses ESC key while dragging OR
- User drags outside valid area OR
- User releases mouse over invalid target
- System cancels drag operation
- System returns category to original position (no animation)
- System removes drag preview and highlights
- Use case ends (no changes)

**Alt-7C: Drag Multiple Levels** (At step 11)
- 11a. User drags category up/down spanning multiple drop zones
- 11b. System continuously updates highlighted drop zone as mouse moves
- 11c. System shows live preview of where category will be inserted
- 11d. User releases at desired position
- Continue to step 12

**Alt-7D: Touch Device Drag** (Alternate interaction)
- 1a. User long-presses category name on touch device (1 second)
- 1b. System activates drag mode with haptic feedback
- 1c. System shows drag preview attached to finger
- 1d. User moves finger while maintaining contact
- 1e. System highlights drop zones as finger moves
- 1f. User lifts finger to drop
- Continue to step 12

**Alt-7E: Auto-Scroll During Drag** (At step 7-11)
- 7a. User drags category near top or bottom edge of viewport
- 7b. System detects proximity to edge (within 50px)
- 7c. System auto-scrolls page in direction of edge
- 7d. Scroll speed increases closer to edge (0-20px/second)
- 7e. User continues drag with auto-scrolling
- Continue normal flow

**Exception Flows**:

**Exc-7A: Invalid Drop Target** (At step 11)
- User attempts to drop category on invalid target:
  - Drop category on subcategory (wrong level)
  - Drop subcategory on item group (wrong level)
  - Drop category on itself (no-op)
  - Drop category on its own child (circular reference)
- System shows "not allowed" cursor (🚫)
- System prevents drop action
- System returns category to original position on release
- System displays message: "Cannot move category here. {Reason}"
- Use case ends (no changes)

**Exc-7B: Permission Denied During Drag** (At step 14)
- Server rejects reorder due to insufficient permissions
- System displays error: "You don't have permission to reorganize categories"
- System reverts category to original position
- System logs permission denial
- Use case ends

**Exc-7C: Database Save Failure** (At step 14)
- Database update fails (connection lost, constraint violation)
- System displays error: "Unable to save reorder. Please try again."
- System reverts category to original position with animation
- System logs error details
- User can retry drag operation
- Use case ends

**Exc-7D: Category Deleted During Drag** (At step 12)
- Another user deleted category or parent while drag in progress
- System detects category no longer exists
- System displays error: "Category was deleted. Refreshing list."
- System refreshes category tree
- System cancels drag operation
- Use case ends

**Exc-7E: Concurrent Reorder Conflict** (At step 14)
- Another user reordered categories in same parent simultaneously
- System detects sort_order conflict
- System displays warning: "Categories were reordered by another user"
- System refreshes tree with latest order
- System reverts user's drag
- User can retry reorder with current state
- Use case ends

**Business Rules**:
- **BR-CAT-005**: Categories can only be moved within same level or to valid parent level (hierarchy rules enforced)
- **BR-CAT-006**: Circular references prevented (category cannot be moved under its own descendants)
- **BR-CAT-008**: Sort order automatically recalculated for affected siblings
- **BR-CAT-015**: Only Product Managers and Admins can reorder

**Related Requirements**:
- FR-CAT-003: Drag-and-Drop Reordering
- FR-CAT-006: Category Sort Order Management
- FR-CAT-001: Three-Level Category Hierarchy (move validation)

**Notes**:
- Drag-and-drop only available in tree view (not list view)
- Keyboard alternative: select category, press Ctrl+Up/Down to reorder, Ctrl+Left/Right to change parent
- Touch devices use long-press (1 second) to activate drag mode
- Large trees support auto-scroll when dragging near viewport edges
- Visual feedback critical for usability (drag preview, drop zones, cursor changes)
- Undo not supported - users must manually move category back if mistake

---

### UC-CAT-013: Move Category to Different Parent

**Description**: Change a category's parent relationship, moving it to a different location in the hierarchy while maintaining level consistency and preventing circular references.

**Actor(s)**: Product Manager, System Administrator

**Priority**: High

**Frequency**: Monthly (infrequent hierarchy restructuring)

**Preconditions**:
- User has category management permission
- Category to move exists and is not deleted
- Target parent exists and accepts children at appropriate level
- Move would not create circular reference or violate hierarchy rules

**Postconditions**:
- **Success**: Category moved to new parent, parent_id updated, sort order recalculated, path updated, children remain attached, audit recorded
- **Failure**: Category remains at original location, error message explains why move not allowed

**Main Flow** (Using Move Dialog):
1. User selects category to move in tree view
2. User clicks "Move" button in toolbar or context menu
3. System opens "Move Category" dialog
4. System displays current location breadcrumb: "Current: {Category} > {Subcategory}"
5. System shows category selector listing valid target parents
6. System filters parent list based on category type:
   - For subcategories: show only root categories
   - For item groups: show only subcategories
   - For categories: show only root level (peer move)
7. User selects new parent from dropdown
8. System displays preview: "Will move to: {New Parent} > {Category}"
9. System shows impact: "{X} products will remain assigned, {Y} child categories will move"
10. User clicks "Move" button
11. System validates move is allowed (no circular reference, correct level)
12. System updates category record: parent_id = new_parent.id
13. System recalculates sort_order (append to end of new parent's children)
14. System updates path field
15. System removes from old parent's children, adds to new parent's children
16. System saves to database
17. System refreshes tree view
18. System expands new parent to show moved category
19. System highlights moved category
20. System displays success message: "'{category}' moved to '{new_parent}'"
21. System closes dialog
22. Use case ends

**Alternative Flows**:

**Alt-13A: Move Via Drag-and-Drop** (Alternate path)
- See UC-CAT-007 (Drag-and-Drop) Alt-7A for drag-based move workflow
- This use case (UC-CAT-013) documents the same operation via form interface

**Alt-13B: Move With Children** (At step 9)
- 9a. Category being moved has child categories
- 9b. System displays warning: "This will also move {count} child categories"
- 9c. System lists affected children
- 9d. User reviews and confirms move
- 9e. System moves category and all descendants together
- Continue to step 11

**Alt-13C: Select Parent Via Tree** (At step 7)
- 7a. User clicks "Browse" instead of dropdown
- 7b. System displays tree view of valid parents
- 7c. User navigates tree and clicks to select parent
- 7d. System updates preview with selected parent
- Continue to step 9

**Alt-13D: Cancel Move** (At step 10)
- 10a. User clicks "Cancel" or closes dialog
- 10b. System closes dialog without changes
- 10c. Category remains at original location
- Use case ends

**Exception Flows**:

**Exc-13A: Circular Reference Detected** (At step 11)
- User attempts to move category under one of its own descendants
- System detects circular reference: new_parent is child/grandchild of moving category
- System displays error: "Cannot move category under its own descendant. This would create circular reference."
- System prevents move and highlights issue in tree
- User selects different parent
- Resume at step 7

**Exc-13B: Invalid Level Combination** (At step 11)
- User attempts invalid level move:
  - Move category (level 1) under subcategory (level 2)
  - Move subcategory (level 2) under item group (level 3)
  - Move item group (level 3) to root level
- System displays error: "Cannot move {current_type} under {target_type}. Hierarchy structure must be maintained."
- System explains valid moves for this category type
- User selects valid parent
- Resume at step 7

**Exc-13C: Target Parent Deleted** (At step 12)
- Selected parent was deleted by another user after dialog opened
- System displays error: "Target parent no longer exists. Refreshing categories."
- System refreshes tree and parent selector
- User selects different parent
- Resume at step 7

**Exc-13D: Products Assigned Conflict** (At step 12)
- Move would cause issues with product assignments (business rule conflict)
- System displays warning: "{count} products are assigned to this category"
- System asks: "Products will remain assigned. Proceed with move?"
- User confirms or cancels
- If confirmed: continue to step 13
- If cancelled: use case ends

**Exc-13E: Database Update Failure** (At step 16)
- Database update fails (constraint violation, connection lost)
- System displays error: "Unable to complete move. Please try again."
- System ensures category remains at original location
- System logs error details
- User can retry move
- Use case ends

**Business Rules**:
- **BR-CAT-005**: Parent must be appropriate level (categories under null, subcategories under categories, item groups under subcategories)
- **BR-CAT-006**: Circular references prevented (cannot move under own descendant)
- **BR-CAT-008**: Sort order recalculated after move
- **BR-CAT-013**: Path reconstructed after parent change

**Related Requirements**:
- FR-CAT-001: Three-Level Category Hierarchy (level validation)
- FR-CAT-002: Category CRUD Operations (update parent relationship)
- FR-CAT-003: Drag-and-Drop Reordering (alternate interface)

**Notes**:
- Moving category also moves all its descendants (children, grandchildren)
- Products assigned to moved category remain assigned (category_id unchanged)
- Move operation is alternative to drag-and-drop for users who prefer form interface
- Keyboard-accessible for users who cannot use drag-and-drop
- Confirmation required for moves affecting many products or children

---

### UC-CAT-014: Activate/Deactivate Category

**Description**: Toggle a category's active status to show/hide it from product assignment dropdowns while preserving existing data and relationships.

**Actor(s)**: Product Manager, System Administrator

**Priority**: Medium

**Frequency**: Monthly (when categories become obsolete or need to be hidden temporarily)

**Preconditions**:
- User has category edit permission
- Category exists and is not deleted
- User understands impact of status change on product assignments and visibility

**Postconditions**:
- **Success**: Category active status toggled, visibility in dropdowns updated, child categories inherit status, existing assignments preserved, audit recorded
- **Failure**: Status unchanged, error message explains why change not allowed

**Main Flow** (Deactivate):
1. User selects active category in tree or list view
2. User clicks "Deactivate" button or unchecks "Active" toggle switch
3. System displays confirmation dialog:
   ```
   Deactivate category '{name}'?

   Effects:
   - Hidden from product assignment dropdowns
   - Existing product assignments preserved
   - {X} child categories will also be hidden
   - {Y} products currently assigned

   Category can be reactivated at any time.
   ```
4. User reviews impact and clicks "Confirm"
5. System validates user has permission to deactivate
6. System sets is_active = false for category
7. System cascades status to all child categories (recursive)
8. System sets updated_at and updated_by
9. System saves to database
10. System displays success message: "Category '{name}' deactivated"
11. System updates tree view (category shown in gray/muted style)
12. System updates list view (category marked as Inactive in status column)
13. System removes category from active product assignment dropdowns
14. Use case ends

**Alternative Flows**:

**Alt-14A: Reactivate Category** (Main flow for activation)
- 1a. User selects inactive category (shown in gray)
- 2a. User clicks "Activate" button or checks "Active" toggle
- 3a. If parent is inactive: System displays warning "Parent category is inactive. This category will remain hidden until parent is activated."
- 3b. System displays confirmation: "Activate category '{name}'?"
- 4a. User confirms activation
- 5a. System sets is_active = true
- 6a. System updates timestamp and user
- 7a. System saves to database
- 8a. System displays success: "Category '{name}' activated"
- 9a. System updates display (category shown in normal colors)
- 10a. If parent is active: Category appears in product assignment dropdowns
- Use case ends

**Alt-14B: Deactivate Category With No Children** (At step 7)
- 7a. Category has no child categories
- 7b. System skips cascade (only this category affected)
- Continue to step 8

**Alt-14C: View Affected Products** (At step 3)
- 3a. User clicks "View {Y} Products" link in confirmation
- 3b. System opens modal showing list of products assigned to this category
- 3c. User reviews products (will remain assigned but category hidden from dropdowns)
- 3d. User closes modal and returns to confirmation
- Continue to step 4

**Alt-14D: Bulk Status Change** (At step 2)
- 2a. User has multiple categories selected (multi-select mode)
- 2b. User clicks "Deactivate Selected" from bulk actions menu
- 2c. System displays confirmation showing total categories, children, and products affected
- 2d. User confirms bulk operation
- 2e. System updates all selected categories and their children
- 2f. System displays success: "{count} categories deactivated"
- Use case ends

**Exception Flows**:

**Exc-14A: Permission Denied** (At step 5)
- User lacks permission to change category status
- System displays error: "You don't have permission to activate/deactivate categories"
- System logs permission denial
- Use case ends

**Exc-14B: Cannot Reactivate Due to Inactive Parent** (At step 5 for reactivation)
- User attempts to reactivate category but parent is inactive
- System prevents reactivation
- System displays error: "Cannot activate because parent '{parent}' is inactive. Activate parent first."
- System offers "Activate parent too" option
- If user accepts: System activates both parent and child
- If user declines: use case ends

**Exc-14C: Category In Critical Use** (At step 6)
- System detects category is referenced in active purchase orders or pending transactions
- System displays warning: "This category is in active use by {count} pending orders. Deactivating may affect ongoing operations."
- System shows affected transactions
- User can proceed with caution or cancel
- Continue to step 7 or end use case

**Exc-14D: Database Update Failure** (At step 9)
- Database update fails
- System displays error: "Unable to change status. Please try again."
- System reverts any partial changes
- User can retry operation
- Use case ends

**Business Rules**:
- **BR-CAT-009**: Active status defaults to true for new categories
- **BR-CAT-010**: Inactive categories hidden from product assignment dropdowns but existing assignments preserved
- **BR-CAT-017**: Status changes logged in audit trail

**Related Requirements**:
- FR-CAT-002: Category CRUD Operations (update status)
- FR-CAT-010: Category Access Permissions

**Notes**:
- Deactivating category does NOT delete or reassign existing products - assignments preserved
- Inactive categories still visible in full category tree (shown in gray/muted style)
- Inactive categories excluded from product assignment dropdowns
- Child categories inherit parent's inactive status (cannot be active if parent inactive)
- Status change is reversible - reactivation restores full functionality
- Useful for seasonal categories or categories being phased out gradually

---

## User Use Cases - Deletion

### UC-CAT-006: Delete Category

**Description**: Soft-delete a category from the system, marking it as deleted while preserving data for audit trail and preventing deletion of categories with product assignments.

**Actor(s)**: System Administrator (Product Managers cannot delete, only deactivate)

**Priority**: Critical

**Frequency**: Infrequent (quarterly cleanup of obsolete categories)

**Preconditions**:
- User has System Administrator role (deletion requires highest permission)
- Category exists and is not already deleted
- Category has zero direct product assignments
- User has reviewed category for dependencies
- Category should preferably be inactive before deletion

**Postconditions**:
- **Success**: Category soft-deleted (deleted_at timestamp set), hidden from all views except audit, child categories handled per user choice (cascade or block), audit trail complete
- **Failure**: Category not deleted, error explains blocking condition (has products, has active children, permission denied)

**Main Flow** (Delete category without products or children):
1. User selects category in tree or list view
2. User clicks "Delete" button (only visible to System Administrators)
3. System verifies user has System Administrator role
4. System checks if category has direct product assignments
5. System checks if category has child categories
6. System checks if category is referenced in active transactions or reports
7. System displays confirmation dialog:
   ```
   Delete category '{name}'?

   This action cannot be easily undone.

   Status:
   - ✓ No products assigned
   - ✓ No child categories
   - ✓ Not in active use

   The category will be marked as deleted but preserved in audit history.
   ```
8. User reviews and clicks "Delete" button in confirmation
9. System prompts for deletion reason (required for audit): "Why are you deleting this category?"
10. User enters reason (e.g., "Duplicate category", "No longer needed")
11. User confirms final deletion
12. System sets deleted_at = current timestamp
13. System sets deleted_by = current user ID
14. System saves deletion reason in audit log
15. System performs soft delete (record remains in database)
16. System removes category from tree view
17. System removes from list view (unless "Show Deleted" filter enabled)
18. System displays success message: "Category '{name}' deleted successfully"
19. System logs deletion with full context
20. Use case ends

**Alternative Flows**:

**Alt-6A: Delete Category With Children - Cascade** (At step 5)
- 5a. System detects category has child categories
- 5b. System displays warning:
   ```
   This category has {count} child categories:
   - {Child 1}
   - {Child 2}
   - ...

   Choose how to proceed:
   [Cascade Delete] Delete this category and all {count} children
   [Cancel] Keep category and children
   ```
- 5c. User reviews list of children
- 5d. User clicks "Cascade Delete" if certain
- 5e. System prompts additional confirmation: "Delete {parent} and {count} children? This affects {product_count} products."
- 5f. User confirms cascade
- 5g. System checks each child has zero products
- 5h. If all children are empty: System soft-deletes parent and all children recursively
- 5i. If any child has products: System blocks deletion (see Exc-6B)
- Continue to step 12

**Alt-6B: Delete Category With Inactive Status** (At step 2)
- 2a. System detects category is already inactive
- 2b. System displays info: "This category is already inactive. Deletion will permanently remove it from active use."
- 2c. User proceeds with deletion
- Continue to step 3

**Alt-6C: View Deletion History** (At step 2)
- 2a. User clicks "View Deleted" filter toggle
- 2b. System displays deleted categories in list with gray background
- 2c. System shows deleted_at date and deleted_by user
- 2d. System shows "Restore" button for deleted categories
- 2e. User can review deleted categories or restore if needed
- Resume normal flow or restore category

**Alt-6D: Restore Deleted Category** (From deleted view)
- User viewing deleted categories (Alt-6C)
- User selects deleted category
- User clicks "Restore" button
- System prompts confirmation: "Restore category '{name}'?"
- User confirms
- System clears deleted_at and deleted_by fields
- System sets is_active = false (requires explicit reactivation)
- System restores category to tree view
- System displays success: "Category '{name}' restored as inactive"
- Use case ends (restored category now inactive, can be activated via UC-CAT-014)

**Exception Flows**:

**Exc-6A: Category Has Products** (At step 4)
- System detects category has direct product assignments (product_count > 0)
- System displays error:
   ```
   Cannot delete category '{name}'

   {count} products are assigned to this category:
   - {Product 1}
   - {Product 2}
   - ...

   You must reassign these products to a different category before deletion.

   [View Products] [Cancel]
   ```
- User clicks "View Products" to see full list
- System opens product list filtered by this category
- User must reassign all products first
- Use case ends (deletion blocked)

**Exc-6B: Child Categories Have Products** (At step 7 during cascade)
- System detects child categories have product assignments during cascade delete
- System displays error:
   ```
   Cannot cascade delete '{parent}'

   Child categories have products:
   - {Child 1}: {X} products
   - {Child 2}: {Y} products

   You must reassign these products before deleting.
   ```
- User must first handle child category products
- Use case ends (deletion blocked)

**Exc-6C: Permission Denied** (At step 3)
- User is Product Manager attempting deletion (only Admins allowed)
- System displays error: "Only System Administrators can delete categories. Product Managers can deactivate instead."
- System shows "Deactivate" button as alternative
- Use case ends (or transitions to UC-CAT-014)

**Exc-6D: Category In Active Use** (At step 6)
- System detects category referenced in active purchase orders, pending requisitions, or recent reports
- System displays warning:
   ```
   Category '{name}' is in active use:
   - {X} pending purchase orders
   - {Y} open requisitions
   - Used in reports generated this week

   Recommend deactivating instead of deleting to preserve transaction history.

   [Deactivate Instead] [Force Delete] [Cancel]
   ```
- User reviews usage
- User can choose to deactivate (safer) or force delete (if critical)
- If force delete: System requires additional confirmation and audit reason
- Continue to step 9 if user proceeds with deletion

**Exc-6E: Database Delete Failure** (At step 15)
- Database update fails (connection lost, constraint violation)
- System displays error: "Unable to delete category. Please try again."
- System does not modify category record
- System logs error details
- User can retry deletion
- Use case ends

**Business Rules**:
- **BR-CAT-011**: Categories with products cannot be deleted (products must be reassigned first)
- **BR-CAT-016**: Only System Administrators can delete categories
- **BR-CAT-018**: Soft delete implemented (deleted_at timestamp, record preserved)
- **BR-CAT-007**: Cascade deletion requires explicit confirmation and empty children

**Related Requirements**:
- FR-CAT-002: Category CRUD Operations (Delete)
- FR-CAT-010: Category Access Permissions (admin-only deletion)
- BR-CAT-011: Deletion prevention with products

**Notes**:
- Deletion is soft delete - record remains in database with deleted_at timestamp
- Deleted categories hidden from normal views but visible in audit logs
- System Administrators can restore deleted categories if needed
- Product Managers should use deactivate (UC-CAT-014) instead of delete
- Cascade deletion requires all descendants to have zero products
- Deletion requires reason for audit trail and compliance
- Cannot delete category if any child has products - must be reassigned first
- Recommend deactivating category and monitoring for period before deletion

---

## User Use Cases - Views and Display

### UC-CAT-008: Switch Between Tree and List Views

**Description**: Toggle between hierarchical tree view and flat table list view for category display, each offering different advantages for navigation and analysis.

**Actor(s)**: All authenticated users

**Priority**: High

**Frequency**: Multiple times per session (users switch based on task needs)

**Preconditions**:
- User is viewing Categories page
- Categories exist in system
- Browser supports both view layouts

**Postconditions**:
- **Success**: View mode changed, categories displayed in selected format, view preference saved for next session
- **Failure**: View remains unchanged, error message if view cannot be loaded

**Main Flow** (Switch to List View):
1. User is viewing categories in tree view (default)
2. User clicks "List View" toggle button in toolbar (icon shows table/rows)
3. System saves view preference to localStorage
4. System transitions view with fade animation (200ms)
5. System displays categories in flat table format with columns:
   - Name
   - Type (Category/Subcategory/Item Group)
   - Level (1, 2, or 3)
   - Parent Path (hierarchical breadcrumb)
   - Item Count
   - Status (Active/Inactive)
   - Actions (Edit, Delete buttons)
6. System applies current search and filter settings to list
7. System enables column sorting (click headers)
8. System shows pagination controls (50 items per page default)
9. User sees all categories in sortable, filterable table
10. Use case ends

**Alternative Flows**:

**Alt-8A: Switch to Tree View** (From list view)
- 1a. User is viewing categories in list view
- 2a. User clicks "Tree View" toggle button (icon shows hierarchical tree)
- 3a. System saves preference to localStorage
- 4a. System transitions to tree view
- 5a. System reconstructs hierarchy with parent-child relationships
- 6a. System restores previous expansion state (if saved)
- 7a. System applies current search/filter
- 8a. User sees hierarchical tree with expand/collapse controls
- Use case ends

**Alt-8B: Restore Preferred View** (At page load)
- On first page load, system checks localStorage for saved preference
- If preference found: System loads preferred view immediately
- If no preference: System defaults to tree view
- User sees their preferred view without manual toggle

**Alt-8C: Sort Columns in List View** (At step 7)
- 7a. User clicks column header (e.g., "Name")
- 7b. System sorts list ascending by clicked column
- 7c. System displays up arrow (▲) in header
- 7d. User clicks same header again
- 7e. System reverses sort to descending
- 7f. System displays down arrow (▼) in header
- 7g. Third click removes sort (returns to default sort_order)
- Continue to step 9

**Alt-8D: Change Page Size in List View** (At step 8)
- 8a. User clicks page size dropdown (showing "50 per page")
- 8b. System displays options: 25, 50, 100, 200
- 8c. User selects different size (e.g., 100)
- 8d. System reloads list with new page size
- 8e. System updates pagination controls
- 8f. System saves preference to localStorage
- Continue to step 9

**Alt-8E: Mobile View Optimization** (At step 4)
- 4a. System detects mobile device (screen width < 768px)
- 4b. List view: System hides less critical columns (Level, Parent Path)
- 4c. List view: System stacks data vertically in cards instead of table rows
- 4d. Tree view: System reduces indentation (10px instead of 20px per level)
- 4e. Tree view: System shows single-line condensed nodes
- Continue with mobile-optimized view

**Exception Flows**:

**Exc-8A: View Load Failure** (At step 4)
- System fails to render requested view (JavaScript error, data corruption)
- System displays error: "Unable to load {view_type} view. Please try again."
- System remains in current view
- System logs error details
- User can retry view switch
- Use case ends

**Exc-8B: Large Dataset Performance** (At step 5)
- System detects category count exceeds performance threshold (>1000 categories)
- List view: System enforces pagination (cannot show all at once)
- Tree view: System implements virtual scrolling or lazy loading
- System displays performance notice: "Large dataset - using optimized display"
- View loads with performance optimizations
- Continue normal flow

**Business Rules**:
- **BR-CAT-008**: Categories sorted by sort_order in tree view, sortable by any column in list view
- Default view is tree view (hierarchical structure more intuitive for categories)

**Related Requirements**:
- FR-CAT-004: Tree and List View Modes
- FR-CAT-012: Mobile-Responsive Category Management

**Notes**:
- View preference persists across browser sessions (localStorage)
- Both views support same search and filter functionality
- Tree view better for understanding hierarchy and relationships
- List view better for sorting, comparing, and bulk operations
- Column sorting in list view supports multi-column sort (hold Shift while clicking)
- Mobile devices default to list view (table cards) as tree view can be cramped
- View toggle is keyboard accessible (Tab to button, Enter to toggle)

---

## User Use Cases - Search and Filter

### UC-CAT-009: Search Categories

**Description**: Perform real-time search across category names and descriptions with instant results highlighting matches, enabling users to quickly find categories in large hierarchies.

**Actor(s)**: All authenticated users

**Priority**: High

**Frequency**: Daily (multiple times when locating specific categories)

**Preconditions**:
- User is viewing Categories page (tree or list view)
- Categories exist in system
- Search input field is visible and accessible

**Postconditions**:
- **Success**: Search results displayed showing matching categories with highlighted terms, result count shown, hierarchy context preserved
- **Failure**: Search returns no results with clear message, or error if search fails to execute

**Main Flow**:
1. User clicks in search input field at top of page
2. System focuses input and displays placeholder: "Search categories..."
3. User types search term (e.g., "coffee")
4. System debounces input (waits 300ms after last keystroke)
5. System performs case-insensitive search across name and description fields
6. System finds matching categories (partial matches allowed)
7. System filters visible categories to show only matches
8. System highlights matching text in yellow in results
9. System displays result count: "Found {X} categories matching 'coffee'"
10. System shows full hierarchy path for each match in list format
11. In tree view: System expands parent nodes to reveal matches
12. User sees filtered results with highlighted matches
13. Use case ends (results remain until search cleared)

**Alternative Flows**:

**Alt-9A: Clear Search** (At step 13)
- 13a. User clicks clear button (X icon) in search input
- 13b. System clears search term
- 13c. System removes filters (shows all categories)
- 13d. System removes highlighting
- 13e. System hides result count
- 13f. System restores original tree expansion state
- Continue to step 13

**Alt-9B: Search with Multiple Terms** (At step 5)
- 5a. User enters multiple words: "organic coffee beans"
- 5b. System splits into individual terms: ['organic', 'coffee', 'beans']
- 5c. System searches for records matching ANY term (OR logic)
- 5d. System ranks results: exact phrase match > all terms match > partial match
- 5e. System displays highest ranked results first
- Continue to step 6

**Alt-9C: Search with No Results** (At step 6)
- 6a. Search finds zero matching categories
- 6b. System displays empty state:
   ```
   No categories found matching '{search_term}'

   Suggestions:
   - Check spelling
   - Try fewer or different keywords
   - Browse categories by expanding tree
   ```
- 6c. System keeps search term visible for editing
- 6d. User can modify search or clear it
- Use case ends with empty results

**Alt-9D: Navigate to Search Result** (At step 12)
- 12a. User clicks on category in search results
- 12b. System selects category
- 12c. System clears search to show full context
- 12d. System expands tree to show selected category
- 12e. System highlights selected category
- 12f. System displays category details in side panel
- Use case ends

**Alt-9E: Search in List View** (At step 7)
- 7a. User is in list view mode
- 7b. System filters table rows to show only matches
- 7c. System highlights matching text in Name and Description columns
- 7d. System updates pagination (matches may fit on fewer pages)
- 7e. System shows "Filtered by search" indicator
- Continue to step 12

**Alt-9F: Keyboard Navigation in Results** (At step 12)
- 12a. User presses Down arrow key
- 12b. System highlights next search result
- 12c. User presses Up arrow to go back
- 12d. User presses Enter to select highlighted result
- 12e. User presses ESC to clear search
- Continue with keyboard navigation

**Exception Flows**:

**Exc-9A: Search Too Short** (At step 4)
- User has entered only 1 character
- System does not trigger search (minimum 2 characters required)
- System displays hint: "Enter at least 2 characters to search"
- User continues typing
- Resume at step 4 when input length >= 2

**Exc-9B: Search Performance Timeout** (At step 5)
- Search takes longer than timeout threshold (5 seconds)
- System displays loading spinner
- System continues searching in background
- If search completes: Display results
- If search times out: Display error "Search took too long. Try more specific terms."
- Use case ends or user refines search

**Exc-9C: Special Characters in Search** (At step 5)
- User enters special characters or SQL-like patterns
- System sanitizes input to prevent injection
- System escapes regex special characters
- System performs safe search
- Continue to step 6

**Business Rules**:
- **BR-CAT-007**: Search scope includes name and description fields (not IDs or internal fields)
- Case-insensitive search (matches "Coffee", "coffee", "COFFEE")
- Partial matching (searching "coff" finds "Coffee")
- Debounced input (300ms delay after last keystroke)

**Related Requirements**:
- FR-CAT-008: Category Search Functionality
- FR-CAT-004: Tree and List View Modes (search works in both)

**Notes**:
- Search results update in real-time as user types (debounced 300ms)
- Search term persists in URL query parameter for bookmarking/sharing
- Search works across all fields: name, description
- Highlighting helps users quickly identify why category matched
- Search preserves current view mode (tree or list)
- In tree view, parent nodes expand to reveal matched children
- Mobile devices show larger search input (minimum 44px height)
- Search supports UTF-8 characters and international text
- Search history not stored (no autocomplete from previous searches)

---

### UC-CAT-010: Filter Categories

**Description**: Apply multiple filter criteria simultaneously to narrow down category list based on level, status, parent, item count, and other attributes.

**Actor(s)**: All authenticated users

**Priority**: High

**Frequency**: Daily (when analyzing specific subsets of categories)

**Preconditions**:
- User is viewing Categories page
- Multiple categories exist with varied attributes
- Filter controls are visible in UI

**Postconditions**:
- **Success**: Filters applied, visible categories match all criteria (AND logic), active filters shown as chips, result count updated
- **Failure**: No categories match filters (empty result), filter criteria shown for adjustment

**Main Flow**:
1. User is viewing full category list (tree or list view)
2. System displays filter panel/toolbar with filter options
3. User clicks filter dropdown for desired criteria (e.g., "Level")
4. System displays filter options:
   - By Level: All Levels, Categories Only (1), Subcategories Only (2), Item Groups Only (3)
   - By Status: All, Active, Inactive
   - By Parent: All, {List of parent categories}
   - By Item Count: All, With Products (>0), Empty (=0)
5. User selects filter value (e.g., "Subcategories Only")
6. System applies filter immediately (no "Apply" button needed)
7. System displays active filter as chip/tag: "Level: Subcategories" with X remove button
8. System filters visible categories to match selected criteria
9. System updates result count: "Showing {X} of {Y} categories"
10. User sees filtered results
11. Use case ends (filters remain active)

**Alternative Flows**:

**Alt-10A: Apply Multiple Filters** (At step 6)
- 6a. User selects additional filter (e.g., "Active" status after "Subcategories" level)
- 6b. System applies second filter with AND logic (both must match)
- 6c. System displays both filter chips
- 6d. System further narrows results (only active subcategories)
- 6e. System updates count: "Showing {X} of {Y} (2 filters active)"
- Continue to step 10

**Alt-10B: Remove Single Filter** (At step 10)
- 10a. User clicks X button on filter chip
- 10b. System removes that filter criterion
- 10c. System re-expands results to match remaining filters
- 10d. System removes chip from display
- 10e. System updates count
- Continue to step 10

**Alt-10C: Clear All Filters** (At step 10)
- 10a. User clicks "Clear All Filters" button
- 10b. System removes all active filters
- 10c. System removes all filter chips
- 10d. System displays full unfiltered category list
- 10e. System updates count: "Showing all {Y} categories"
- Use case ends

**Alt-10D: Filter by Parent Category** (At step 5)
- 5a. User selects "By Parent" filter
- 5b. System displays tree selector showing category hierarchy
- 5c. User navigates tree and selects parent category
- 5d. System filters to show only children of selected parent
- 5e. System displays filter chip: "Parent: {Parent Name}"
- Continue to step 8

**Alt-10E: Filter by Name Pattern** (At step 5)
- 5a. User selects "By Name" filter
- 5b. System displays alphabetical range buttons: A-F, G-M, N-S, T-Z, All
- 5c. User clicks range (e.g., "A-F")
- 5d. System filters categories starting with letters A through F
- 5e. System displays filter chip: "Name: A-F"
- Continue to step 8

**Alt-10F: No Results After Filtering** (At step 8)
- 8a. Filter combination returns zero categories
- 8b. System displays empty state:
   ```
   No categories match your filters

   Active filters:
   - Level: Item Groups
   - Status: Inactive
   - Item Count: With Products

   Try removing or changing some filters.

   [Clear All Filters]
   ```
- 8c. User can adjust filters or clear all
- Continue to step 10

**Alt-10G: Save Filter Preset** (At step 10)
- 10a. User clicks "Save Filter" button
- 10b. System prompts for preset name: "My Active Subcategories"
- 10c. User enters name and saves
- 10d. System stores filter combination in localStorage
- 10e. System displays preset in "Saved Filters" dropdown for future use
- Continue to step 11

**Alt-10H: Apply Saved Filter Preset** (At step 3)
- 3a. User clicks "Saved Filters" dropdown
- 3b. System displays list of user's saved filter presets
- 3c. User selects preset (e.g., "Empty Categories for Cleanup")
- 3d. System applies all filters from preset
- 3e. System displays all filter chips
- Continue to step 8

**Exception Flows**:

**Exc-10A: Filter Load Failure** (At step 6)
- System fails to apply filter (data error, query failure)
- System displays error: "Unable to apply filter. Please try again."
- System removes problematic filter chip
- System reverts to previous filter state
- User can retry filter
- Use case continues

**Exc-10B: Invalid Filter Combination** (At step 8)
- User selects logically impossible combination (e.g., "Item Groups" + "Parent: {Root Category}")
- System detects invalid combination
- System displays warning: "Item groups cannot be direct children of root categories"
- System suggests valid adjustment
- User modifies filters
- Continue to step 6

**Business Rules**:
- **BR-CAT-008**: Multiple filters combine with AND logic (all must match)
- Filters apply immediately (no "Apply" button delay)
- Filter state persists in URL for bookmarking/sharing
- Filters save to localStorage for session persistence

**Related Requirements**:
- FR-CAT-009: Category Filtering Options
- FR-CAT-004: Tree and List View Modes (filters work in both views)
- FR-CAT-008: Category Search Functionality (filters complement search)

**Notes**:
- Filters and search work together (AND logic between them)
- Active filters displayed as removable chips for clarity
- "Clear All" button appears only when filters active
- Filter state preserved in URL (shareable links)
- Filter preferences saved per user in localStorage
- Mobile devices show filters in collapsible drawer or accordion
- Keyboard accessible (Tab to filters, Enter to select, ESC to close dropdown)
- Result count updates in real-time as filters applied
- Smart filter options (e.g., parent filter only shows categories, not item groups)

---

## Integration Use Cases

### UC-CAT-201: Product Module Integration

**Description**: Enable Product module to query, reference, and utilize category data for product classification, dropdown selectors, filtering, and reporting.

**Actor(s)**: Product Module (system actor)

**Trigger**: Product creation, editing, filtering, or reporting operations

**Priority**: Critical

**Frequency**: Continuous (every product operation involves categories)

**Preconditions**:
- Category data available and accessible to Product module
- API endpoints or data services exist for category queries
- Product module has proper permissions to access category data

**Postconditions**:
- **Success**: Product module retrieves category data successfully, products correctly assigned to categories, referential integrity maintained
- **Failure**: Product operations may be blocked if category data unavailable, errors logged for investigation

**Main Flow**:
1. Product module initiates category data request (e.g., user creating new product)
2. Product module calls category service API or queries database
3. System retrieves active categories matching request criteria (e.g., only active, specific level)
4. System formats category data for Product module consumption (hierarchical or flat)
5. System returns categories with: id, name, parent_id, level, type, path
6. Product module receives category data
7. Product module displays categories in dropdown selector showing hierarchy (e.g., "Raw Materials > Coffee Beans > Arabica")
8. User selects category from dropdown
9. Product module assigns category_id to product record
10. System validates category_id exists and is active
11. Product saved with valid category reference
12. Category's item count increments (direct count)
13. Integration completes successfully

**Alternative Flows**:

**Alt-201A: Filter Products by Category** (Alternate trigger)
- User in Product module wants to filter products by category
- Product module requests category tree for filter UI
- System returns full hierarchy with item counts
- Product module displays category tree filter
- User selects category (including descendants checkbox)
- Product module queries products WHERE category_id IN (selected category + all descendants)
- Product list filtered by category
- Integration completes

**Alt-201B: Category-Based Product Report** (Alternate trigger)
- Reporting module generates product distribution report
- Reporting module requests all categories with product counts
- System calculates aggregated counts (direct + nested)
- System returns categories with counts sorted by level and name
- Reporting module generates report showing products per category
- Integration completes

**Alt-201C: Bulk Product Import with Categories** (Alternate trigger)
- User importing products from CSV file with category names
- Product module must match category names to IDs
- Product module sends batch category lookup request with list of names
- System searches categories by name (case-insensitive) across all levels
- System returns matching category IDs
- For unmatched names: System returns null with error message
- Product module maps names to IDs for import
- Products created with correct category_id references
- Integration completes

**Exception Flows**:

**Exc-201A: Category Service Unavailable** (At step 2-3)
- Product module cannot connect to category service or database
- Product module displays error: "Unable to load categories. Please try again."
- Product creation/edit forms disable category selector
- System logs service unavailability
- Integration fails gracefully (product operations blocked until service restored)

**Exc-201B: Invalid Category ID in Product** (At step 10)
- Product module attempts to save product with category_id that doesn't exist
- System validation detects invalid foreign key reference
- System rejects product save with error: "Selected category no longer exists"
- Product module prompts user to select valid category
- Integration fails (product not saved)

**Exc-201C: Category Deleted After Selection** (At step 10)
- User selected category but it was deleted before save
- System validation detects category has deleted_at timestamp
- System displays error: "Selected category has been removed. Please choose another."
- Product module reloads category selector
- User selects different category
- Integration retries

**Data Contract**:

**Category Query Request**:
- active_only: Boolean (default true) - filter to active categories only
- level: Integer (optional) - filter by hierarchy level (1, 2, or 3)
- parent_id: UUID (optional) - filter children of specific parent
- include_counts: Boolean (default false) - include item counts in response
- format: String (hierarchical or flat) - response structure format

**Category Query Response**:
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Raw Materials",
      "description": "Raw ingredients and materials",
      "type": "CATEGORY",
      "level": 1,
      "parentId": null,
      "path": "Raw Materials",
      "itemCount": 35,
      "totalItemCount": 245,
      "isActive": true,
      "children": [
        {
          "id": "uuid",
          "name": "Coffee Beans",
          "type": "SUBCATEGORY",
          "level": 2,
          "parentId": "parent-uuid",
          "path": "Raw Materials > Coffee Beans",
          "itemCount": 10,
          "totalItemCount": 45
        }
      ]
    }
  ],
  "count": 125
}
```

**Product Assignment Event**:
When product assigned to category, system publishes event:
```json
{
  "eventType": "ProductCategoryAssigned",
  "productId": "uuid",
  "categoryId": "uuid",
  "previousCategoryId": "uuid or null",
  "timestamp": "ISO-8601"
}
```

**Business Rules**:
- **BR-CAT-010**: Every product must be assigned to exactly one category
- **BR-CAT-012**: Category item counts aggregate direct and nested products

**SLA**:
- **Category Query Response Time**: < 200ms for standard queries (< 1000 categories)
- **Availability**: 99.9% uptime (categories critical for product operations)

**Monitoring**:
- Category query success rate (target: 99.5%)
- Category query response time (p50, p95, p99)
- Invalid category reference error count
- Category service availability percentage

**Related Requirements**:
- FR-CAT-001: Three-Level Category Hierarchy
- FR-CAT-011: Item Count Aggregation
- BR-CAT-010: Product Assignment Requirement

**Notes**:
- Category dropdown in Product module should show hierarchy with visual indentation or separators
- Only active categories appear in product assignment dropdowns
- Inactive categories preserved for products already assigned
- Category changes trigger item count recalculation
- Product module caches category tree (5 minute TTL) for performance

---

### UC-CAT-202: Inventory Module Integration

**Description**: Enable Inventory module to use category data for stock reporting, inventory valuation by category, and category-based inventory analysis.

**Actor(s)**: Inventory Module (system actor)

**Trigger**: Inventory report generation, stock analysis queries, category-based grouping

**Priority**: High

**Frequency**: Daily (inventory reports run daily, ad-hoc analysis multiple times per day)

**Preconditions**:
- Category data available for reporting queries
- Products have valid category assignments
- Inventory module has read access to category data

**Postconditions**:
- **Success**: Inventory reports generated with category grouping, valuations calculated per category, category hierarchies reflected in analysis
- **Failure**: Reports may exclude category dimension or show incomplete data

**Main Flow**:
1. Inventory module initiates category-based report (e.g., "Inventory Valuation by Category")
2. Inventory module queries category tree with product relationships
3. System retrieves categories with product counts and inventory data
4. Inventory module joins category data with stock levels and valuations
5. System aggregates inventory metrics by category:
   - Total stock quantity per category
   - Total valuation per category
   - Stock movement (in/out) per category
   - Low stock alerts grouped by category
6. System calculates hierarchical rollups (subcategory totals roll up to parent category)
7. Inventory module formats report with category hierarchy
8. Report displays:
   ```
   Category: Raw Materials ($125,450 total value)
     Subcategory: Coffee Beans ($45,230)
       Item Group: Arabica ($30,150)
       Item Group: Robusta ($15,080)
     Subcategory: Tea Leaves ($35,120)
       ...
   ```
9. Integration completes successfully

**Alternative Flows**:

**Alt-202A: Stock Movement Report** (Alternate trigger)
- Inventory manager runs "Stock Movement by Category" report
- Inventory module requests categories with transaction data
- System retrieves inventory transactions grouped by product category
- System aggregates: items received, items issued, adjustments per category
- System calculates net movement per category
- Report shows movement trends by category over time period
- Integration completes

**Alt-202B: Low Stock Alert by Category** (Alternate trigger)
- Inventory system generates low stock alert report
- System identifies products below reorder point
- System groups low stock products by category
- System calculates: {X} items low in category Y
- System sends alert: "Low stock in 3 categories: Coffee Beans (8 items), Cleaning Supplies (5 items), Linens (12 items)"
- Purchasing manager can review by category priority
- Integration completes

**Alt-202C: Inventory Aging by Category** (Alternate trigger)
- Inventory manager analyzes slow-moving stock
- Inventory module requests products with age grouped by category
- System calculates average age of stock per category
- System identifies categories with oldest inventory
- Report shows: "Coffee Beans avg age: 15 days, Tea Leaves: 45 days (attention needed)"
- Integration completes

**Exception Flows**:

**Exc-202A: Category Data Stale** (At step 3)
- Inventory module detects category cache is outdated
- System refreshes category data from source
- Slight delay in report generation (< 2 seconds)
- Integration continues with fresh data

**Exc-202B: Orphaned Products Without Category** (At step 4)
- System finds products with null or invalid category_id
- System displays warning in report: "{X} products have no category assigned"
- Report includes "Uncategorized" section with these products
- System logs data integrity issue for admin review
- Integration completes with warning

**Data Contract**:

**Category Inventory Query Request**:
```json
{
  "reportType": "valuation | movement | aging | lowstock",
  "categoryLevel": "all | 1 | 2 | 3",
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  },
  "includeInactive": false
}
```

**Category Inventory Response**:
```json
{
  "categories": [
    {
      "categoryId": "uuid",
      "categoryName": "Raw Materials",
      "level": 1,
      "metrics": {
        "totalValue": 125450.00,
        "totalQuantity": 1520,
        "productCount": 245,
        "lowStockCount": 12,
        "averageAge": 22
      },
      "children": [
        {
          "categoryId": "uuid",
          "categoryName": "Coffee Beans",
          "level": 2,
          "metrics": {...}
        }
      ]
    }
  ],
  "reportDate": "2024-03-15T10:30:00Z"
}
```

**Business Rules**:
- **BR-CAT-012**: Inventory metrics aggregate across category hierarchy (subcategory metrics roll up to parent)
- Category-based reports should include both direct and nested totals

**SLA**:
- **Report Generation Time**: < 5 seconds for standard category reports
- **Data Freshness**: Category data refreshed every 5 minutes

**Monitoring**:
- Category report generation success rate
- Report query performance metrics
- Uncategorized product count (data quality metric)

**Related Requirements**:
- FR-CAT-011: Item Count Aggregation (extends to inventory metrics)
- FR-CAT-001: Three-Level Category Hierarchy (reflected in reporting)

**Notes**:
- Inventory reports should show category hierarchy with proper indentation
- Drill-down functionality allows navigation from category to subcategory to item group to individual products
- Historical reports use category assignments at time of transaction (not current assignments)
- Category-based inventory alerts prioritize by business criticality of category

---

### UC-CAT-203: Procurement Module Integration

**Description**: Enable Procurement module to group purchase requests and orders by category, support category-based purchasing workflows, and analyze spend by category.

**Actor(s)**: Procurement Module (system actor)

**Trigger**: Purchase request creation, order grouping, supplier-category assignment, spend analysis

**Priority**: High

**Frequency**: Daily (purchase orders created daily, spend analysis weekly)

**Preconditions**:
- Category data available for procurement queries
- Products in purchase requests have category assignments
- Procurement module has read access to category data

**Postconditions**:
- **Success**: Purchase requests grouped by category, orders optimized by category for supplier negotiation, spend analysis provides category-level insights
- **Failure**: Manual category grouping required, spend analysis incomplete

**Main Flow**:
1. Purchasing manager creates purchase request with multiple products
2. Procurement module retrieves category data for selected products
3. System groups products by category (category → subcategory → item group)
4. System displays purchase request organized by category:
   ```
   Raw Materials
     Coffee Beans
       - Product A: 100kg
       - Product B: 50kg
     Tea Leaves
       - Product C: 75kg
   ```
5. Purchasing manager reviews category-grouped request
6. System suggests suppliers based on category specialization
7. Purchasing manager approves request
8. Procurement module converts to purchase orders grouped by category
9. System generates separate POs for different category groups (optional)
10. Integration completes successfully

**Alternative Flows**:

**Alt-203A: Category-Based Spend Analysis** (Alternate trigger)
- Finance manager requests spend analysis by category
- Procurement module queries all purchase orders for date range
- System joins PO line items with product categories
- System aggregates spend by category hierarchy
- System calculates: total spend, order count, average order value per category
- Report shows: "Coffee Beans: $45K (35 orders, avg $1,285 per order)"
- System identifies top spending categories
- Integration completes

**Alt-203B: Supplier-Category Assignment** (Alternate trigger)
- Purchasing manager configures supplier preferred categories
- System associates supplier with specific categories (e.g., "Supplier X handles all Coffee Beans category")
- When creating PO for Coffee Beans products, system suggests Supplier X
- Purchasing manager uses category-based supplier routing
- Integration completes

**Alt-203C: Budget Tracking by Category** (Alternate trigger)
- Department manager sets budget limits per category
- Procurement module monitors spending against category budgets
- When purchase request exceeds category budget, system alerts manager
- Alert: "Purchase request for Coffee Beans ($5,200) exceeds monthly budget ($5,000)"
- Manager approves exception or adjusts request
- Integration completes

**Exception Flows**:

**Exc-203A: Products Without Categories** (At step 2)
- Procurement module finds products in request without category assignments
- System displays warning: "{X} products have no category. Category grouping incomplete."
- System lists uncategorized products separately
- Purchasing manager assigns categories or proceeds with warning
- Integration continues

**Exc-203B: Category Deleted After PO Created** (At step 8)
- Category was deleted between request creation and PO generation
- System detects deleted category via deleted_at timestamp
- System preserves category name in PO for historical record
- System flags PO for category re-assignment if needed
- Integration completes with data preservation

**Data Contract**:

**Category Procurement Query Request**:
```json
{
  "queryType": "grouping | spend | suppliers",
  "productIds": ['uuid1', 'uuid2'],
  "dateRange": {
    "startDate": "2024-01-01",
    "endDate": "2024-03-31"
  },
  "aggregationLevel": 1 | 2 | 3
}
```

**Category Spend Response**:
```json
{
  "categories": [
    {
      "categoryId": "uuid",
      "categoryName": "Raw Materials",
      "level": 1,
      "spendMetrics": {
        "totalSpend": 125450.00,
        "orderCount": 152,
        "avgOrderValue": 825.33,
        "topSuppliers": [
          {'supplierId': 'uuid', 'supplierName': 'ABC Corp', 'spend': 45000}
        ]
      }
    }
  ],
  "totalSpend": 450000.00,
  "periodStart": "2024-01-01",
  "periodEnd": "2024-03-31"
}
```

**Business Rules**:
- Purchase requests can group products by category for supplier consolidation
- Category-based budgets enforce spending limits per category
- Historical purchase orders preserve category assignments at time of order (snapshot)

**SLA**:
- **Category Grouping Time**: < 1 second for typical purchase request (< 100 line items)
- **Spend Report Generation**: < 10 seconds for 90-day analysis

**Monitoring**:
- Category grouping success rate
- Uncategorized products in purchase requests (data quality metric)
- Category-based budget compliance percentage

**Related Requirements**:
- FR-CAT-011: Item Count Aggregation (extends to order line item counts)
- BR-CAT-010: All products must have category (ensures grouping works)

**Notes**:
- Category-based PO grouping optimizes supplier negotiations (bulk orders per category)
- Category budgets enable departmental cost control
- Spend analysis by category identifies cost reduction opportunities
- Supplier-category assignments streamline procurement workflows
- Historical data uses category at time of transaction (not current category)

---

### UC-CAT-204: Recipe Module Integration

**Description**: Enable Recipe module to categorize ingredients by product category, calculate recipe costs by category, and analyze ingredient usage by category.

**Actor(s)**: Recipe Module (system actor)

**Trigger**: Recipe creation, ingredient selection, recipe costing, usage analysis

**Priority**: Medium

**Frequency**: Daily (recipe creation and modification, weekly cost analysis)

**Preconditions**:
- Category data available for recipe queries
- Recipe ingredients (products) have category assignments
- Recipe module has read access to category data

**Postconditions**:
- **Success**: Recipe ingredients grouped by category, recipe costs broken down by ingredient category, usage patterns analyzed by category
- **Failure**: Manual category grouping required for recipe analysis

**Main Flow**:
1. Head Chef creates or edits recipe in Recipe module
2. Chef selects ingredients (products) for recipe
3. Recipe module retrieves category data for selected products
4. System displays ingredients grouped by category:
   ```
   Recipe: Signature Coffee Blend

   Raw Materials - Coffee Beans
     - Arabica Beans: 60% (300g)
     - Robusta Beans: 40% (200g)

   Consumables - Packaging
     - Coffee Bags: 1 unit
   ```
5. Chef reviews ingredient list with category context
6. Recipe module calculates cost per category
7. System displays recipe cost breakdown:
   ```
   Total Recipe Cost: $12.50

   By Category:
   - Raw Materials: $10.00 (80%)
   - Consumables: $2.50 (20%)
   ```
8. Chef saves recipe with category-grouped ingredients
9. Integration completes successfully

**Alternative Flows**:

**Alt-204A: Recipe Cost Analysis by Category** (Alternate trigger)
- Finance manager analyzes recipe costs by ingredient category
- Recipe module queries all recipes with ingredient categories
- System aggregates ingredient costs by category across all recipes
- Report shows: "Coffee Beans represent 65% of total recipe costs"
- Manager identifies cost reduction opportunities by category
- Integration completes

**Alt-204B: Ingredient Usage Report by Category** (Alternate trigger)
- Kitchen manager requests ingredient usage analysis
- Recipe module calculates total ingredient consumption for period
- System groups consumption by product category
- Report shows: "Used 245kg Coffee Beans (up 15% from last month)"
- Manager identifies high-usage categories for inventory planning
- Integration completes

**Alt-204C: Recipe Nutritional Analysis by Category** (Alternate trigger)
- Nutritionist analyzes recipe nutritional content
- Recipe module groups ingredients by category
- System calculates nutritional values per category
- Report shows nutritional breakdown: "Proteins (Raw Materials): 45g, Fats (Dairy): 30g"
- Integration completes

**Exception Flows**:

**Exc-204A: Ingredient Without Category** (At step 3)
- Recipe includes product without category assignment
- System displays warning: "Ingredient '{product}' has no category. Cost breakdown incomplete."
- Recipe module lists uncategorized ingredients separately
- System suggests assigning category to product
- Integration continues with partial grouping

**Exc-204B: Category Changed After Recipe Created** (At step 6)
- Ingredient's category was changed since recipe was created
- System detects category mismatch between recipe snapshot and current data
- System uses current category for cost calculation
- System logs category change for audit
- Integration completes with updated category

**Data Contract**:

**Recipe Category Query Request**:
```json
{
  "recipeId": "uuid",
  "includeCosting": true,
  "groupBy": "category | subcategory | itemgroup"
}
```

**Recipe Category Response**:
```json
{
  "recipe": {
    "id": "uuid",
    "name": "Signature Coffee Blend",
    "ingredientsByCategory": [
      {
        "categoryId": "uuid",
        "categoryName": "Raw Materials",
        "categoryLevel": 1,
        "ingredients": [
          {
            "productId": "uuid",
            "productName": "Arabica Beans",
            "quantity": 300,
            "unit": "g",
            "cost": 8.00,
            "subcategory": "Coffee Beans"
          }
        ],
        "categoryCost": 10.00,
        "categoryPercentage": 80.0
      }
    ],
    "totalCost": 12.50
  }
}
```

**Business Rules**:
- Recipe costing aggregates by category for cost analysis
- Category grouping helps identify ingredient cost patterns
- Historical recipes preserve category assignments at time of creation

**SLA**:
- **Category Grouping Time**: < 500ms for typical recipe (< 50 ingredients)
- **Cost Calculation Time**: < 1 second including category breakdown

**Monitoring**:
- Category grouping success rate for recipes
- Uncategorized ingredients in recipes (data quality metric)
- Recipe cost calculation accuracy

**Related Requirements**:
- FR-CAT-011: Item Count Aggregation (extends to ingredient counts)
- BR-CAT-010: All products should have category for proper grouping

**Notes**:
- Category-based recipe costing helps identify cost reduction opportunities
- Ingredient usage analysis by category supports inventory planning
- Recipe module caches category data for performance (5 minute TTL)
- Category breakdown useful for menu engineering and pricing decisions
- Nutritional analysis by category helps balance recipe composition

---

## Use Case Traceability Matrix

| Use Case | Functional Req | Business Rule | Test Case | Status |
|----------|----------------|---------------|-----------|--------|
| UC-CAT-001 | FR-CAT-001, FR-CAT-004 | BR-CAT-001, BR-CAT-012 | TC-CAT-001 | Implemented |
| UC-CAT-002 | FR-CAT-002 | BR-CAT-002, BR-CAT-003, BR-CAT-014 | TC-CAT-002 | Implemented |
| UC-CAT-003 | FR-CAT-002 | BR-CAT-004, BR-CAT-005 | TC-CAT-003 | Implemented |
| UC-CAT-004 | FR-CAT-002 | BR-CAT-001, BR-CAT-005 | TC-CAT-004 | Implemented |
| UC-CAT-005 | FR-CAT-002 | BR-CAT-004, BR-CAT-015, BR-CAT-017 | TC-CAT-005 | Implemented |
| UC-CAT-006 | FR-CAT-002 | BR-CAT-011, BR-CAT-016, BR-CAT-018 | TC-CAT-006 | Implemented |
| UC-CAT-007 | FR-CAT-003, FR-CAT-006 | BR-CAT-005, BR-CAT-006, BR-CAT-008 | TC-CAT-007 | Implemented |
| UC-CAT-008 | FR-CAT-004 | - | TC-CAT-008 | Implemented |
| UC-CAT-009 | FR-CAT-008 | BR-CAT-007 | TC-CAT-009 | Implemented |
| UC-CAT-010 | FR-CAT-009 | BR-CAT-008 | TC-CAT-010 | Implemented |
| UC-CAT-011 | FR-CAT-007 | BR-CAT-013 | TC-CAT-011 | Implemented |
| UC-CAT-012 | FR-CAT-011 | BR-CAT-012 | TC-CAT-012 | Implemented |
| UC-CAT-013 | FR-CAT-002 | BR-CAT-005, BR-CAT-006, BR-CAT-013 | TC-CAT-013 | Implemented |
| UC-CAT-014 | FR-CAT-002 | BR-CAT-009 | TC-CAT-014 | Implemented |
| UC-CAT-015 | FR-CAT-002 | BR-CAT-017 | TC-CAT-015 | Implemented |
| UC-CAT-201 | - | BR-CAT-010, BR-CAT-012 | TC-CAT-201 | Implemented |
| UC-CAT-202 | - | BR-CAT-012 | TC-CAT-202 | Implemented |
| UC-CAT-203 | - | BR-CAT-010 | TC-CAT-203 | Implemented |
| UC-CAT-204 | - | BR-CAT-010 | TC-CAT-204 | Implemented |

---

## Appendix

### Glossary

- **Actor**: Person, role, or system that interacts with the category management system to achieve goals
- **Use Case**: Specific scenario describing how actor accomplishes goal using the system
- **Precondition**: State or condition that must be true before use case can start
- **Postcondition**: State or condition that will be true after use case successfully completes
- **Main Flow**: Primary "happy path" sequence of steps assuming no errors or alternative conditions
- **Alternative Flow**: Variations from main flow due to user choices or different conditions
- **Exception Flow**: Error conditions and system responses when something goes wrong
- **Hierarchy**: Tree structure of categories with parent-child relationships (Category > Subcategory > Item Group)
- **Drag-and-Drop**: Mouse/touch interaction to move categories by clicking, dragging, and releasing
- **Soft Delete**: Marking record as deleted (deleted_at timestamp) without physically removing from database
- **Item Count**: Number of products assigned to category (direct count) plus products in all descendant categories (nested count)
- **Integration Use Case**: Interaction between category system and another module or external system

### Common Patterns

**Pattern: Hierarchical Selection**
1. User views category tree
2. User expands parent categories as needed
3. User navigates to desired level
4. User clicks category name to select
5. System highlights selection
6. System updates dependent UI elements

**Pattern: Form Validation and Save**
1. User fills form fields
2. System validates on field blur (immediate feedback)
3. User clicks Save button
4. System validates all fields (client-side)
5. System submits to server
6. Server validates (authoritative)
7. Server saves to database
8. Server responds with success or error
9. System displays result to user

**Pattern: Real-Time Search**
1. User types in search input
2. System debounces input (300ms delay)
3. System performs client-side search (no server round-trip)
4. System filters visible items
5. System highlights matching text
6. System displays result count
7. User sees results immediately

**Pattern: Confirmation Dialog**
1. User initiates destructive action (delete, deactivate)
2. System displays confirmation dialog
3. System shows impact of action (affected items count)
4. User reviews and confirms or cancels
5. If confirmed: System proceeds with action
6. If cancelled: System closes dialog (no changes)

---

**Document End**

> 📝 **Note to Readers**:
> - Use cases describe user goals and system responses in detail
> - Main flows cover happy paths, alternatives cover variations, exceptions cover errors
> - Business rules enforce constraints and validation logic
> - Integration use cases show how category module interacts with other systems
> - Traceability matrix links use cases to requirements and tests for coverage verification
