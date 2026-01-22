# VAL-CAT: Product Categories Validation Rules

**Module**: Product Management
**Sub-Module**: Product Categories
**Route**: `/product-management/categories`
**Document Type**: Validations (VAL)
**Version**: 1.0.0
**Last Updated**: 2025-11-26
**Status**: Approved

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-11 | System | Initial validation rules documentation |

---

## 1. Overview

### 1.1 Purpose

This document defines comprehensive validation rules for the Product Categories sub-module. Categories form a three-level hierarchy (Category → Subcategory → Item Group) that organizes all products in the CARMEN ERP system. Invalid category data can:

- Corrupt the hierarchical structure
- Prevent product assignment and operations
- Break reporting and aggregation functions
- Create security vulnerabilities
- Violate business rules and data integrity

Validation occurs at three layers to ensure data quality and security:
- **Client-Side**: Immediate user feedback and UX validation
- **Server-Side**: Security and business rule enforcement
- **Database**: Final data integrity constraints

### Implementation Note: Type vs Level Field

> **⚠️ Database Schema vs TypeScript Implementation**
>
> This validation document references a `type` field as part of the **database schema design** with values 'CATEGORY', 'SUBCATEGORY', or 'ITEM_GROUP'.
>
> The current **TypeScript implementation** in `/lib/types/common.ts` uses a `level` field (number: 1, 2, or 3) instead:
>
> - `level: 1` = Category (root level, replaces type = 'CATEGORY')
> - `level: 2` = Subcategory (middle level, replaces type = 'SUBCATEGORY')
> - `level: 3` = Item Group (leaf level, replaces type = 'ITEM_GROUP')
>
> Validation rules referencing the `type` field (VAL-CAT-006, VAL-CAT-102, VAL-CAT-202) should be adapted to use the `level` field in TypeScript code. The `CategoryType` type exists only in the UI-focused `CategoryItem` interface for display purposes.

### 1.2 Scope

This document covers validation for:
- **Field-level validations**: Individual field constraints (name, description, type/level, parent_id, sort_order, is_active)
- **Business rule validations**: Hierarchy depth, type compatibility, deletion constraints
- **Cross-field validations**: Type-level compatibility, parent-child relationships, circular references
- **Security validations**: Permission checks, role-based access, ownership validation

All validation rules apply to:
- Category creation (level 1)
- Subcategory creation (level 2)
- Item Group creation (level 3)
- Updates to existing categories
- Soft deletion operations
- Drag-and-drop reordering

### 1.3 Validation Strategy

```
User Input
    ↓
[Client-Side Validation] ← Immediate feedback, UX
    ↓
[Server-Side Validation] ← Security, business rules
    ↓
[Database Constraints] ← Final enforcement
    ↓
Data Stored
```

**Validation Principles**:
1. Never trust client-side data - always validate on server
2. Provide immediate user feedback when possible
3. Use clear, actionable error messages
4. Prevent security vulnerabilities (SQL injection, XSS)
5. Enforce business rules consistently across all operations
6. Maintain referential integrity of the hierarchy
7. Validate at creation, update, and deletion operations

---

## 2. Field-Level Validations (VAL-CAT-001 to 099)

### VAL-CAT-001: Category Name - Required Field Validation

**Field**: `name`
**Database Column**: `categories.name`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: Category name is mandatory and cannot be empty or null.

**Rationale**: Category name is the primary identifier displayed to users. Empty names prevent meaningful categorization and cause UI display issues.

**Implementation Requirements**:
- **Client-Side**:
  * Display red asterisk (*) next to "Category Name" label
  * Show error immediately on blur if empty or whitespace-only
  * Trim leading/trailing whitespace before validation
- **Server-Side**:
  * Reject request if name is missing, null, empty string, or contains only whitespace
  * Trim name before further validation
- **Database**:
  * Column defined as NOT NULL
  * CHECK constraint: LENGTH(TRIM(name)) >= 1

**Error Code**: VAL-CAT-001
**Error Message**: "Category name is required"
**User Action**: User must provide a non-empty category name before proceeding.

**Test Cases**:
- ✅ Valid: "Beverages" (non-empty text)
- ✅ Valid: "A" (single character)
- ❌ Invalid: "" (empty string)
- ❌ Invalid: "   " (whitespace only)
- ❌ Invalid: null
- ❌ Invalid: undefined

---

### VAL-CAT-002: Category Name - Minimum Length

**Field**: `name`

**Validation Rule**: Category name must contain at least 1 character (after trimming whitespace).

**Rationale**: Single-character names are acceptable for abbreviations (e.g., "A" grade categories), but empty strings provide no meaningful information.

**Implementation Requirements**:
- **Client-Side**:
  * Display character counter below field showing "X / 100 characters"
  * Trim whitespace before checking length
  * Show warning if trimmed length = 0
- **Server-Side**:
  * Trim name and reject if length < 1
- **Database**:
  * CHECK constraint: LENGTH(TRIM(name)) >= 1

**Error Code**: VAL-CAT-002
**Error Message**: "Category name must be at least 1 character"
**User Action**: User must enter at least one non-whitespace character.

**Test Cases**:
- ✅ Valid: "A" (length = 1)
- ✅ Valid: "Raw Materials" (length = 13)
- ❌ Invalid: "" (length = 0)
- ❌ Invalid: "   " (whitespace only, trimmed length = 0)

---

### VAL-CAT-003: Category Name - Maximum Length

**Field**: `name`

**Validation Rule**: Category name cannot exceed 100 characters.

**Rationale**:
- Database column limit (VARCHAR 100)
- UI display constraints in tree views and dropdowns
- Prevents excessively long names that harm UX

**Implementation Requirements**:
- **Client-Side**:
  * Set maxLength="100" on input element to prevent typing beyond limit
  * Show character counter: "X / 100 characters"
  * Turn counter red when approaching limit (> 90 characters)
- **Server-Side**:
  * Reject if length > 100 characters
- **Database**:
  * Column defined as VARCHAR(100)

**Error Code**: VAL-CAT-003
**Error Message**: "Category name cannot exceed 100 characters"
**User Action**: User must shorten the name or use abbreviations.

**Test Cases**:
- ✅ Valid: "A" (length = 1)
- ✅ Valid: "Raw Materials and Ingredients for Food Production" (length = 50)
- ✅ Valid: String with exactly 100 characters
- ❌ Invalid: String with 101 characters
- ❌ Invalid: String with 200 characters

---

### VAL-CAT-004: Category Name - Uniqueness Validation

**Field**: `name`

**Validation Rule**: Category name must be unique within its parent scope. Case-insensitive comparison. Soft-deleted categories are excluded from uniqueness check.

**Rationale**:
- Prevents duplicate categories that confuse users
- Ensures each sibling category has a distinct name
- Names can be reused across different parents (e.g., "Coffee" under both "Hot Beverages" and "Ingredients")

**Uniqueness Scope**:
- Check against: All sibling categories with the same parent_id
- Case sensitivity: Case-insensitive (UPPER(name) comparison)
- Exclude: Records where deleted_at IS NOT NULL
- Exclude on update: Current record being updated

**Implementation Requirements**:
- **Client-Side**:
  * Async validation after user stops typing (300ms debounce)
  * API call: GET /api/categories/check-duplicate?name={name}&parent_id={parent_id}&exclude_id={current_id}
  * Show "Checking availability..." indicator during API call
  * Show warning icon if duplicate found
- **Server-Side**:
  * Query database for existing records with UPPER(name) = UPPER(provided_name) AND parent_id = provided_parent_id AND deleted_at IS NULL
  * Exclude current record ID when updating
  * Return 409 Conflict if duplicate found
- **Database**:
  * Unique partial index: CREATE UNIQUE INDEX idx_category_name_parent ON categories (UPPER(name), parent_id) WHERE deleted_at IS NULL

**Error Code**: VAL-CAT-004
**Error Message**: "This category name already exists in the selected parent. Please choose a different name."
**User Action**: User must choose a different, unique name within the parent scope.

**Test Cases**:
- ✅ Valid: Creating "Coffee" under parent "Hot Beverages" (no existing sibling with this name)
- ✅ Valid: Creating "Coffee" under parent "Ingredients" (name exists elsewhere but different parent)
- ✅ Valid: Updating category name from "Coffee" to "Coffee" (same record, no change)
- ✅ Valid: Creating "Coffee" when another "Coffee" was soft-deleted (deleted_at IS NOT NULL)
- ❌ Invalid: Creating "Coffee" under parent "Hot Beverages" when active sibling "Coffee" exists
- ❌ Invalid: Creating "coffee" under parent when active sibling "COFFEE" exists (case-insensitive)
- ❌ Invalid: Creating "Coffee" under parent when active sibling " Coffee " exists (trimmed comparison)

---

### VAL-CAT-005: Description - Maximum Length

**Field**: `description`
**Database Column**: `categories.description`
**Data Type**: VARCHAR(500) / string | null

**Validation Rule**: Description cannot exceed 500 characters. Field is optional (nullable).

**Rationale**:
- Database column limit (VARCHAR 500)
- Encourages concise descriptions
- Prevents storage of essays in description field

**Implementation Requirements**:
- **Client-Side**:
  * Set maxLength="500" on textarea element
  * Show character counter: "X / 500 characters"
  * Turn counter orange when > 450 characters
  * Turn counter red when = 500 characters
- **Server-Side**:
  * Reject if length > 500 characters
  * Allow null or empty string
- **Database**:
  * Column defined as VARCHAR(500) NULL

**Error Code**: VAL-CAT-005
**Error Message**: "Description cannot exceed 500 characters"
**User Action**: User must shorten the description or move detailed information elsewhere.

**Test Cases**:
- ✅ Valid: null (description is optional)
- ✅ Valid: "" (empty string is acceptable)
- ✅ Valid: "High-quality beverages" (length = 23)
- ✅ Valid: String with exactly 500 characters
- ❌ Invalid: String with 501 characters
- ❌ Invalid: String with 1000 characters

---

### VAL-CAT-006: Category Type - Required and Valid Values

**Field**: `type`
**Database Column**: `categories.type`
**Data Type**: VARCHAR(20) / enum

**Validation Rule**: Type field is required and must be one of three valid values: CATEGORY, SUBCATEGORY, or ITEM_GROUP.

**Rationale**:
- Type determines position in three-level hierarchy
- Must match the level field for consistency
- Prevents invalid hierarchy structures

**Valid Values**:
- `CATEGORY` (Level 1 - root level)
- `SUBCATEGORY` (Level 2 - middle level)
- `ITEM_GROUP` (Level 3 - leaf level)

**Implementation Requirements**:
- **Client-Side**:
  * Display as radio buttons or dropdown with only valid options
  * Pre-select based on context (if parent selected, infer type from parent's level)
  * Disable invalid options based on parent selection
- **Server-Side**:
  * Validate against enum values
  * Reject if not one of the three valid values
  * Case-sensitive comparison
- **Database**:
  * CHECK constraint: type IN ('CATEGORY', 'SUBCATEGORY', 'ITEM_GROUP')

**Error Code**: VAL-CAT-006
**Error Message**: "Category type must be one of: CATEGORY, SUBCATEGORY, or ITEM_GROUP"
**User Action**: User must select one of the valid category types.

**Test Cases**:
- ✅ Valid: "CATEGORY"
- ✅ Valid: "SUBCATEGORY"
- ✅ Valid: "ITEM_GROUP"
- ❌ Invalid: null (required field)
- ❌ Invalid: "" (empty string)
- ❌ Invalid: "Category" (lowercase, case-sensitive)
- ❌ Invalid: "PRODUCT" (not in enum)
- ❌ Invalid: "SUB_CATEGORY" (wrong format)

---

### VAL-CAT-007: Level - Required and Valid Range

**Field**: `level`
**Database Column**: `categories.level`
**Data Type**: INTEGER / number

**Validation Rule**: Level field is required and must be 1, 2, or 3 (representing the three hierarchy levels).

**Rationale**:
- Enforces three-level hierarchy depth
- Must match the type field for consistency
- Prevents invalid hierarchy structures beyond three levels

**Valid Values**:
- `1` = Category (root level, parent_id = null)
- `2` = Subcategory (middle level, parent must be level 1)
- `3` = Item Group (leaf level, parent must be level 2)

**Implementation Requirements**:
- **Client-Side**:
  * Auto-calculate from parent selection (parent.level + 1)
  * Display as read-only field showing calculated value
  * If no parent selected, default to 1
- **Server-Side**:
  * Validate level is 1, 2, or 3
  * Verify level matches type (1=CATEGORY, 2=SUBCATEGORY, 3=ITEM_GROUP)
  * Verify level = parent.level + 1 (if parent exists)
- **Database**:
  * CHECK constraint: level IN (1, 2, 3)

**Error Code**: VAL-CAT-007
**Error Message**: "Category level must be 1, 2, or 3"
**User Action**: System should auto-calculate level. If manual intervention needed, user must select valid level.

**Test Cases**:
- ✅ Valid: 1 (root level category)
- ✅ Valid: 2 (subcategory)
- ✅ Valid: 3 (item group)
- ❌ Invalid: 0 (below minimum)
- ❌ Invalid: 4 (exceeds maximum)
- ❌ Invalid: null (required field)
- ❌ Invalid: -1 (negative value)
- ❌ Invalid: 2.5 (decimal value)

---

### VAL-CAT-008: Sort Order - Required and Non-Negative

**Field**: `sort_order`
**Database Column**: `categories.sort_order`
**Data Type**: INTEGER / number

**Validation Rule**: Sort order is required and must be a non-negative integer (>= 0).

**Rationale**:
- Determines display order within parent category
- Zero-based index for programmatic consistency
- Negative values have no semantic meaning

**Implementation Requirements**:
- **Client-Side**:
  * Auto-calculate as max(sibling.sort_order) + 1 for new categories
  * Allow manual adjustment via drag-and-drop or number input
  * Set min="0" on number input
  * Prevent negative value entry
- **Server-Side**:
  * Validate sort_order >= 0
  * Reject negative values
  * Auto-assign if not provided (max + 1)
- **Database**:
  * CHECK constraint: sort_order >= 0
  * Default value can be calculated by trigger

**Error Code**: VAL-CAT-008
**Error Message**: "Sort order must be a non-negative number (0 or greater)"
**User Action**: User must enter a value of 0 or higher.

**Test Cases**:
- ✅ Valid: 0 (first position)
- ✅ Valid: 1 (second position)
- ✅ Valid: 100 (any non-negative integer)
- ✅ Valid: 999999 (large value)
- ❌ Invalid: -1 (negative)
- ❌ Invalid: -100 (negative)
- ❌ Invalid: null (required field)
- ❌ Invalid: 1.5 (decimal, should be integer)

---

### VAL-CAT-009: Parent ID - Required for Levels 2 and 3

**Field**: `parent_id`
**Database Column**: `categories.parent_id`
**Data Type**: UUID / string | null

**Validation Rule**:
- For level 1 (CATEGORY): parent_id MUST be null
- For level 2 (SUBCATEGORY): parent_id is REQUIRED and must reference a valid level 1 category
- For level 3 (ITEM_GROUP): parent_id is REQUIRED and must reference a valid level 2 subcategory

**Rationale**:
- Enforces hierarchical structure
- Prevents orphaned categories at levels 2 and 3
- Prevents root categories from having parents

**Implementation Requirements**:
- **Client-Side**:
  * For level 1: Hide parent selection field
  * For level 2: Show dropdown of level 1 categories only
  * For level 3: Show dropdown of level 2 subcategories only
  * Mark parent field as required when level > 1
- **Server-Side**:
  * If level = 1, require parent_id = null
  * If level > 1, require parent_id IS NOT NULL
  * Verify parent_id references existing active category
  * Verify parent.level = current.level - 1
- **Database**:
  * Foreign key: parent_id REFERENCES categories(id) ON DELETE RESTRICT
  * CHECK constraint combined with level validation

**Error Code**: VAL-CAT-009
**Error Message**:
- For level 1: "Root categories cannot have a parent"
- For level 2-3: "Parent category is required"

**User Action**:
- For level 1: Remove parent selection (should be null)
- For level 2-3: Select a valid parent category

**Test Cases**:
- ✅ Valid: Level 1, parent_id = null
- ✅ Valid: Level 2, parent_id = valid level 1 category UUID
- ✅ Valid: Level 3, parent_id = valid level 2 subcategory UUID
- ❌ Invalid: Level 1, parent_id = some UUID (must be null)
- ❌ Invalid: Level 2, parent_id = null (required)
- ❌ Invalid: Level 3, parent_id = null (required)
- ❌ Invalid: Level 2, parent_id = level 2 UUID (wrong level)
- ❌ Invalid: Level 3, parent_id = level 1 UUID (wrong level)
- ❌ Invalid: Any level, parent_id = non-existent UUID

---

### VAL-CAT-010: Parent ID - Must Reference Existing Category

**Field**: `parent_id`

**Validation Rule**: When parent_id is provided, it must reference an existing, active (not soft-deleted) category in the database.

**Rationale**:
- Maintains referential integrity
- Prevents orphaned categories
- Ensures valid hierarchy

**Implementation Requirements**:
- **Client-Side**:
  * Populate parent dropdown from API only with active categories
  * Disable selection if no valid parents exist
- **Server-Side**:
  * Query database: SELECT id FROM categories WHERE id = parent_id AND deleted_at IS NULL
  * Return 400 if parent not found or soft-deleted
- **Database**:
  * Foreign key constraint: FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE RESTRICT

**Error Code**: VAL-CAT-010
**Error Message**: "Selected parent category does not exist or has been deleted"
**User Action**: User must select a different, valid parent category from the list.

**Test Cases**:
- ✅ Valid: parent_id references active category
- ❌ Invalid: parent_id = random UUID not in database
- ❌ Invalid: parent_id references soft-deleted category (deleted_at IS NOT NULL)
- ❌ Invalid: parent_id = malformed UUID

---

### VAL-CAT-011: Is Active - Required Boolean

**Field**: `is_active`
**Database Column**: `categories.is_active`
**Data Type**: BOOLEAN / boolean

**Validation Rule**: is_active is required and must be a boolean value (true or false).

**Rationale**:
- Controls category visibility in active lists
- Provides soft deactivation without deletion
- Default is true for new categories

**Implementation Requirements**:
- **Client-Side**:
  * Display as checkbox or toggle switch
  * Default checked (true) for new categories
  * Cannot be null or undefined
- **Server-Side**:
  * Validate value is strictly boolean (true or false)
  * Reject string values like "true" or "1"
- **Database**:
  * Column defined as BOOLEAN NOT NULL
  * Default value: true

**Error Code**: VAL-CAT-011
**Error Message**: "Category status (active/inactive) is required"
**User Action**: User must set category status.

**Test Cases**:
- ✅ Valid: true
- ✅ Valid: false
- ❌ Invalid: null
- ❌ Invalid: undefined
- ❌ Invalid: "true" (string)
- ❌ Invalid: 1 (number)
- ❌ Invalid: 0 (number)

---

## 3. Business Rule Validations (VAL-CAT-101 to 199)

### VAL-CAT-101: Hierarchy Depth Enforcement

**Rule Description**: The category hierarchy must not exceed three levels (Category → Subcategory → Item Group). Level 3 categories (Item Groups) cannot have children.

**Business Justification**:
- Simplifies product organization and prevents over-complexity
- Improves UI performance and user navigation
- Aligns with hospitality industry standards
- Referenced in BR-CAT-001

**Validation Logic**:
1. Check if parent category exists
2. If parent exists, check parent.level
3. Verify parent.level < 3 (cannot add children to level 3)
4. Verify new category.level = parent.level + 1
5. Reject if conditions not met

**When Validated**: On create, on update (if parent_id changes)

**Implementation Requirements**:
- **Client-Side**:
  * Disable "Add Subcategory" button on level 3 (Item Group) categories
  * Show tooltip: "Item Groups cannot have children"
  * Filter parent dropdown to exclude level 3 categories
- **Server-Side**:
  * Query parent.level before allowing insertion
  * Return 400 if parent.level = 3
  * Verify new level = parent.level + 1
- **Database**:
  * Trigger: validate_category_hierarchy
  * CHECK constraint combining level and parent_id validation

**Error Code**: VAL-CAT-101
**Error Message**: "Cannot create category. Maximum hierarchy depth (3 levels) would be exceeded. Item Groups cannot have children."
**User Action**: User must select a different parent at level 1 or 2, or create a sibling category instead.

**Related Business Requirements**: BR-CAT-001 (Three-level hierarchy structure)

**Examples**:

**Scenario 1: Valid Creation**
- Parent: "Beverages" (level 1, type CATEGORY)
- New: "Coffee" (level 2, type SUBCATEGORY)
- Result: ✅ Validation passes (level 2 under level 1 is allowed)

**Scenario 2: Valid Creation**
- Parent: "Coffee" (level 2, type SUBCATEGORY)
- New: "Arabica" (level 3, type ITEM_GROUP)
- Result: ✅ Validation passes (level 3 under level 2 is allowed)

**Scenario 3: Invalid Creation**
- Parent: "Arabica" (level 3, type ITEM_GROUP)
- New: "Ethiopian Arabica" (level 4 attempt)
- Result: ❌ Validation fails
- Reason: Level 3 categories cannot have children
- User must: Create as sibling of "Arabica" instead, or select different parent

---

### VAL-CAT-102: Type-Level Consistency

**Rule Description**: The type field must be consistent with the level field. Level 1 must be CATEGORY, level 2 must be SUBCATEGORY, level 3 must be ITEM_GROUP.

**Business Justification**:
- Ensures terminology consistency throughout the system
- Prevents type mismatches that confuse users
- Simplifies business logic and reporting
- Referenced in BR-CAT-003

**Validation Logic**:
1. Check level value
2. Verify corresponding type:
   - level = 1 → type MUST be "CATEGORY"
   - level = 2 → type MUST be "SUBCATEGORY"
   - level = 3 → type MUST be "ITEM_GROUP"
3. Reject if mismatch

**Type-Level Mapping**:
| Level | Required Type | Description |
|-------|---------------|-------------|
| 1 | CATEGORY | Root level, no parent |
| 2 | SUBCATEGORY | Middle level, parent is level 1 |
| 3 | ITEM_GROUP | Leaf level, parent is level 2 |

**When Validated**: On create, on update (if level or type changes)

**Implementation Requirements**:
- **Client-Side**:
  * Auto-set type based on level selection
  * If level = 1, set type = "CATEGORY" (read-only)
  * If level = 2, set type = "SUBCATEGORY" (read-only)
  * If level = 3, set type = "ITEM_GROUP" (read-only)
  * User should not be able to manually set type
- **Server-Side**:
  * Validate (level, type) pair matches mapping table
  * Reject if mismatch detected
- **Database**:
  * CHECK constraint:
    - (level = 1 AND type = 'CATEGORY') OR
    - (level = 2 AND type = 'SUBCATEGORY') OR
    - (level = 3 AND type = 'ITEM_GROUP')

**Error Code**: VAL-CAT-102
**Error Message**: "Category type must be {expected_type} for level {level}"
**User Action**: System should auto-correct. If manual intervention needed, user must select matching type-level combination.

**Related Business Requirements**: BR-CAT-003 (Hierarchy and type)

**Examples**:

**Scenario 1: Valid Type-Level**
- Level: 1
- Type: CATEGORY
- Result: ✅ Validation passes

**Scenario 2: Valid Type-Level**
- Level: 2
- Type: SUBCATEGORY
- Result: ✅ Validation passes

**Scenario 3: Valid Type-Level**
- Level: 3
- Type: ITEM_GROUP
- Result: ✅ Validation passes

**Scenario 4: Invalid Type-Level**
- Level: 1
- Type: SUBCATEGORY
- Result: ❌ Validation fails
- Reason: Level 1 must be CATEGORY
- User must: System auto-corrects to type = CATEGORY

**Scenario 5: Invalid Type-Level**
- Level: 3
- Type: CATEGORY
- Result: ❌ Validation fails
- Reason: Level 3 must be ITEM_GROUP
- User must: System auto-corrects to type = ITEM_GROUP

---

### VAL-CAT-103: Cannot Move Category with Children

**Rule Description**: A category that has child categories cannot be moved to a different parent. Children must be removed or moved first.

**Business Justification**:
- Prevents unintended hierarchy changes affecting multiple categories
- Protects against cascading level changes
- Requires explicit user intent to reorganize hierarchy
- Referenced in BR-CAT-007

**Validation Logic**:
1. When updating parent_id (parent change)
2. Query database: SELECT COUNT(*) FROM categories WHERE parent_id = current_category_id AND deleted_at IS NULL
3. If count > 0, validation fails
4. Allow update only if count = 0

**When Validated**: On update (only when parent_id is being changed)

**Implementation Requirements**:
- **Client-Side**:
  * When editing category, check if it has children
  * If has children, disable parent dropdown
  * Show info message: "Cannot move category with children. Remove or move children first."
  * Provide link to view children
- **Server-Side**:
  * Before allowing parent_id update, count children
  * Return 400 if children exist
  * Allow update only for childless categories
- **Database**:
  * Not enforced at database level (business logic only)
  * Could implement as trigger for additional safety

**Error Code**: VAL-CAT-103
**Error Message**: "Cannot move this category because it has {count} child categories. Please move or remove child categories first."
**User Action**: User must:
1. Navigate to child categories
2. Either delete them or move them to a different parent
3. Then return to move the parent category

**Related Business Requirements**: BR-CAT-007 (Category updates)

**Examples**:

**Scenario 1: Valid Move (No Children)**
- Category: "Empty Category" (no children)
- Action: Change parent from "Food" to "Beverages"
- Result: ✅ Validation passes (no children to affect)

**Scenario 2: Invalid Move (Has Children)**
- Category: "Beverages" (has 5 child subcategories)
- Action: Attempt to change parent from null to "Food"
- Result: ❌ Validation fails
- Reason: 5 children would be affected
- User must: Move or remove all 5 children first, then retry

**Scenario 3: Valid Update (Not Changing Parent)**
- Category: "Beverages" (has 5 children)
- Action: Update name from "Beverages" to "Drinks"
- Result: ✅ Validation passes (parent_id not changing)

---

### VAL-CAT-104: Cannot Delete Category with Products

**Rule Description**: A category cannot be deleted (soft or hard) if it has products assigned to it. Products must be reassigned or removed first.

**Business Justification**:
- Prevents orphaned products without categories
- Requires explicit user decision on product reassignment
- Protects critical business data
- Referenced in BR-CAT-008

**Validation Logic**:
1. When deleting category
2. Query database: SELECT COUNT(*) FROM products WHERE category_id = current_category_id AND deleted_at IS NULL
3. If count > 0, validation fails
4. Allow deletion only if count = 0

**When Validated**: On delete operation (soft or hard delete)

**Implementation Requirements**:
- **Client-Side**:
  * Before showing delete confirmation, check product count via API
  * API call: GET /api/categories/:id/products/count
  * If count > 0, show blocking error instead of confirmation
  * Provide link to "View and reassign products" page
- **Server-Side**:
  * Before allowing deletion, count associated products
  * Return 409 Conflict if products exist
  * Include product count in error response
- **Database**:
  * Foreign key: products.category_id REFERENCES categories(id) ON DELETE RESTRICT
  * This constraint prevents deletion at database level

**Error Code**: VAL-CAT-104
**Error Message**: "Cannot delete this category because {count} products are assigned to it. Please reassign or remove these products first."
**User Action**: User must:
1. View list of products assigned to this category
2. Reassign products to a different category
3. Or delete the products (if appropriate)
4. Then return to delete the category

**Related Business Requirements**: BR-CAT-008, BR-CAT-018 (Deletion constraints)

**Examples**:

**Scenario 1: Valid Deletion (No Products)**
- Category: "Obsolete Category" (0 products assigned)
- Action: Soft delete the category
- Result: ✅ Validation passes (safe to delete)

**Scenario 2: Invalid Deletion (Has Products)**
- Category: "Coffee" (25 products assigned)
- Action: Attempt to delete the category
- Result: ❌ Validation fails
- Reason: 25 products still reference this category
- User must: Reassign all 25 products to different categories first

**Scenario 3: Invalid Deletion (Database Protection)**
- Category: "Beverages" (50 products assigned)
- Action: Attempt hard delete via direct database access
- Result: ❌ Database foreign key constraint violation
- Reason: ON DELETE RESTRICT prevents deletion

---

### VAL-CAT-105: Soft Delete Cascade Warning

**Rule Description**: When deleting a category that has child categories, the user must be warned that all descendants (children and grandchildren) will also be soft deleted in a cascade operation.

**Business Justification**:
- Prevents accidental deletion of large hierarchy branches
- Requires explicit user acknowledgment of impact
- Protects against data loss
- Referenced in BR-CAT-017

**Validation Logic**:
1. When deleting category with children
2. Recursively count all descendants
3. Display count to user with clear warning
4. Require explicit confirmation before proceeding

**When Validated**: On delete operation, after checking for products

**Implementation Requirements**:
- **Client-Side**:
  * API call: GET /api/categories/:id/deletion-impact
  * Returns: { childCount: N, productCount: 0, descendantIds: [...] }
  * Show warning dialog: "This will also delete {N} child categories. Continue?"
  * List affected categories in scrollable area
  * Require checkbox: "I understand this will delete X categories"
  * Enable Delete button only after checkbox is checked
- **Server-Side**:
  * Calculate full cascade impact before deletion
  * Use recursive CTE to find all descendants
  * Perform cascade soft delete in transaction
  * Log cascade deletion to audit trail
- **Database**:
  * Soft delete trigger: Sets deleted_at on all descendants
  * Transaction ensures atomicity (all or nothing)

**Error Code**: VAL-CAT-105
**Error Message**: (This is a warning, not an error. No error code unless user attempts deletion without confirmation.)
**Warning Message**: "Deleting this category will also delete {count} child categories. Are you sure you want to continue?"
**User Action**: User must:
1. Review list of categories that will be deleted
2. Confirm they understand the cascade impact
3. Click "Yes, Delete All" to proceed
4. Or click "Cancel" to abort

**Related Business Requirements**: BR-CAT-017 (Cascade soft delete)

**Examples**:

**Scenario 1: Single Category (No Cascade)**
- Category: "Coffee" (no children)
- Action: Initiate delete
- Warning: "Delete this category?" (standard confirmation)
- Result: ✅ Simple confirmation, no cascade

**Scenario 2: Category with Children**
- Category: "Beverages" (3 children, 5 grandchildren)
- Action: Initiate delete
- Warning: "This will also delete 8 child categories (3 direct + 5 nested). Continue?"
- Shows list:
  - Hot Beverages (child)
    - Coffee (grandchild)
    - Tea (grandchild)
  - Cold Beverages (child)
  - etc.
- Result: ✅ Requires explicit cascade confirmation

**Scenario 3: User Cancels**
- Category: "Food" (50 descendants)
- Action: Initiate delete, see warning, click Cancel
- Result: ✅ Deletion aborted, no changes made

---

### VAL-CAT-106: Circular Reference Prevention

**Rule Description**: A category cannot be set as a descendant of itself (circular reference). This prevents infinite loops in hierarchy queries.

**Business Justification**:
- Prevents database query infinite loops
- Protects system stability
- Maintains tree structure integrity

**Validation Logic**:
1. When updating parent_id
2. Trace ancestry from new parent back to root
3. If current category ID is found in ancestry chain, validation fails
4. Allows update only if no circular reference detected

**When Validated**: On update (when parent_id is being changed)

**Implementation Requirements**:
- **Client-Side**:
  * Filter parent dropdown to exclude current category
  * Filter to exclude all descendants of current category
  * Show disabled options with tooltip: "Cannot select self or descendants"
- **Server-Side**:
  * Use recursive CTE to trace parent ancestry
  * Check if current category ID appears in ancestry
  * Return 400 if circular reference detected
- **Database**:
  * Trigger: validate_category_hierarchy
  * Prevents circular references before UPDATE

**Error Code**: VAL-CAT-106
**Error Message**: "Cannot set this parent. This would create a circular reference in the category hierarchy."
**User Action**: User must select a different parent that is not a descendant of the current category.

**Examples**:

**Scenario 1: Valid Parent Change**
- Category: "Coffee" (level 2)
- Current parent: "Hot Beverages" (level 1)
- New parent: "Beverages" (level 1, not a descendant)
- Result: ✅ Validation passes (no circular reference)

**Scenario 2: Direct Circular Reference**
- Category: "Beverages" (level 1)
- Action: Attempt to set parent to "Beverages" (itself)
- Result: ❌ Validation fails (direct circular reference)

**Scenario 3: Indirect Circular Reference**
- Category: "Beverages" (level 1)
- Has child: "Hot Beverages" (level 2)
- Has grandchild: "Coffee" (level 3)
- Action: Attempt to set parent to "Coffee" (its grandchild)
- Result: ❌ Validation fails (indirect circular reference)
- Reason: "Beverages" → "Hot Beverages" → "Coffee" → "Beverages" (loop)

---

## 4. Cross-Field Validations (VAL-CAT-201 to 299)

### VAL-CAT-201: Parent-Level Compatibility

**Fields Involved**: `parent_id`, `level`

**Validation Rule**: When a category has a parent, the parent's level must be exactly one level less than the child's level.

**Business Justification**:
- Enforces strict hierarchical progression (1 → 2 → 3)
- Prevents skipping levels in hierarchy
- Maintains consistent tree structure

**Validation Logic**:
1. If parent_id IS NOT NULL
2. Query parent.level
3. Verify: parent.level = current.level - 1
4. Reject if condition fails

**When Validated**: On create, on update (if parent_id or level changes)

**Implementation Requirements**:
- **Client-Side**:
  * Auto-calculate level from parent (parent.level + 1)
  * Display level as read-only calculated field
  * Prevent manual level adjustment when parent is selected
- **Server-Side**:
  * Query parent record to get parent.level
  * Verify parent.level + 1 = child.level
  * Return 400 if mismatch
- **Database**:
  * Trigger: validate_category_hierarchy
  * Checks parent-child level relationship

**Error Code**: VAL-CAT-201
**Error Message**: "Invalid hierarchy. Parent level ({parent_level}) must be one less than child level ({child_level})."
**User Action**: System should auto-correct. If manual intervention needed, user must select parent with correct level.

**Examples**:

**Valid Scenarios**:
- Parent: level 1, Child: level 2 ✅
- Parent: level 2, Child: level 3 ✅
- Parent: null, Child: level 1 ✅

**Invalid Scenarios**:
- Parent: level 1, Child: level 3 ❌ (skipped level 2)
- Parent: level 2, Child: level 2 ❌ (same level)
- Parent: level 3, Child: level 3 ❌ (level 3 cannot have children)

---

### VAL-CAT-202: Parent-Type Compatibility

**Fields Involved**: `parent_id`, `type`

**Validation Rule**: When a category has a parent, the parent's type must be compatible with the child's type according to the hierarchy rules.

**Business Justification**:
- Enforces correct type progression
- Prevents invalid parent-child type combinations
- Maintains semantic meaning of types

**Validation Logic**:
1. If parent_id IS NOT NULL
2. Query parent.type
3. Verify compatibility:
   - If child.type = SUBCATEGORY, parent.type MUST be CATEGORY
   - If child.type = ITEM_GROUP, parent.type MUST be SUBCATEGORY
4. Reject if incompatible

**Type Compatibility Matrix**:
| Child Type | Required Parent Type |
|------------|---------------------|
| CATEGORY | (null - no parent) |
| SUBCATEGORY | CATEGORY |
| ITEM_GROUP | SUBCATEGORY |

**When Validated**: On create, on update (if parent_id or type changes)

**Implementation Requirements**:
- **Client-Side**:
  * Filter parent dropdown based on child type
  * If creating SUBCATEGORY, show only CATEGORY parents
  * If creating ITEM_GROUP, show only SUBCATEGORY parents
- **Server-Side**:
  * Query parent.type
  * Verify against compatibility matrix
  * Return 400 if incompatible
- **Database**:
  * Trigger: validate_category_hierarchy
  * Checks parent-child type relationship

**Error Code**: VAL-CAT-202
**Error Message**: "Invalid parent type. A {child_type} must have a {expected_parent_type} as parent."
**User Action**: User must select a parent with the correct type.

**Examples**:

**Valid Scenarios**:
- Child: SUBCATEGORY, Parent: CATEGORY ✅
- Child: ITEM_GROUP, Parent: SUBCATEGORY ✅
- Child: CATEGORY, Parent: null ✅

**Invalid Scenarios**:
- Child: SUBCATEGORY, Parent: SUBCATEGORY ❌
- Child: SUBCATEGORY, Parent: ITEM_GROUP ❌
- Child: ITEM_GROUP, Parent: CATEGORY ❌ (skips SUBCATEGORY level)
- Child: CATEGORY, Parent: any type ❌ (CATEGORY cannot have parent)

---

### VAL-CAT-203: Root Category Constraints

**Fields Involved**: `level`, `parent_id`, `type`

**Validation Rule**: Level 1 categories (root categories) must have:
- level = 1
- parent_id = null
- type = CATEGORY

All three conditions must be true together.

**Business Justification**:
- Defines clear root level of hierarchy
- Prevents inconsistent root category definitions
- Simplifies hierarchy traversal logic

**Validation Logic**:
1. Check if any of these is true:
   - level = 1
   - parent_id IS NULL
   - type = CATEGORY
2. If any is true, verify all three are true
3. Reject if only some conditions are met (inconsistent state)

**When Validated**: On create, on update

**Implementation Requirements**:
- **Client-Side**:
  * When level = 1 selected, auto-set parent_id = null and type = CATEGORY
  * When parent_id = null, auto-set level = 1 and type = CATEGORY
  * When type = CATEGORY selected, auto-set level = 1 and parent_id = null
  * All three fields locked together
- **Server-Side**:
  * Verify all three conditions together
  * Reject if inconsistent
- **Database**:
  * CHECK constraint: (level = 1 AND parent_id IS NULL AND type = 'CATEGORY') OR (level > 1)

**Error Code**: VAL-CAT-203
**Error Message**: "Root categories must have level=1, no parent, and type=CATEGORY"
**User Action**: System should auto-correct. If manual intervention needed, user must ensure all three fields are consistent.

**Examples**:

**Valid Root Category**:
- level: 1
- parent_id: null
- type: CATEGORY
- Result: ✅ All three conditions met

**Invalid Scenarios**:
- level: 1, parent_id: null, type: SUBCATEGORY ❌ (type mismatch)
- level: 1, parent_id: some UUID, type: CATEGORY ❌ (has parent but level 1)
- level: 2, parent_id: null, type: CATEGORY ❌ (no parent but level 2)

---

### VAL-CAT-204: Unique Sort Order Within Parent (Optional)

**Fields Involved**: `parent_id`, `sort_order`

**Validation Rule**: (Optional enforcement) Sort order values should be unique within siblings (categories with same parent). However, duplicates are allowed and will be auto-resolved by the system.

**Business Justification**:
- Ensures deterministic display order
- Prevents ambiguity in drag-and-drop operations
- Auto-resolution allows flexible reordering

**Validation Logic**:
1. When setting sort_order
2. Query siblings: SELECT sort_order FROM categories WHERE parent_id = ? AND deleted_at IS NULL
3. If duplicate found, auto-increment conflicting items
4. Or display warning (non-blocking)

**When Validated**: On create, on update, on reorder

**Implementation Requirements**:
- **Client-Side**:
  * Display warning if duplicate sort order detected
  * Auto-adjust sort orders when using drag-and-drop
  * Renumber all siblings sequentially (0, 1, 2, ...) after reorder
- **Server-Side**:
  * Allow duplicate sort orders (non-blocking validation)
  * Or auto-increment conflicting items
  * Provide reorder endpoint to normalize sort orders
- **Database**:
  * No UNIQUE constraint (allows duplicates)
  * Optional: Trigger to auto-adjust on INSERT/UPDATE

**Error Code**: VAL-CAT-204 (Warning only)
**Warning Message**: "Another category has the same sort order. Display order may be ambiguous."
**User Action**: User can ignore (system handles duplicates) or manually adjust sort orders.

**Examples**:

**Scenario 1: Unique Sort Orders**
- Siblings: A (sort_order=0), B (sort_order=1), C (sort_order=2)
- Result: ✅ All unique, clear display order

**Scenario 2: Duplicate Sort Orders**
- Siblings: A (sort_order=0), B (sort_order=1), C (sort_order=1)
- Warning: ⚠️ B and C have same sort order
- Display: System uses secondary sort (e.g., by name) to break tie
- User can: Ignore or manually renumber

---

## 5. Security Validations (VAL-CAT-301 to 399)

### VAL-CAT-301: Permission Check

**Validation Rule**: User must have the required permission to perform the action.

**Checked Permissions**:
- `manage_categories` (admin/manager) - Full access
- OR role-based permissions:
  - `create_category` - Can create new categories
  - `update_category` - Can modify existing categories
  - `delete_category` - Can soft delete categories
  - `view_categories` - Can view category list

**Permission Matrix**:
| Action | Required Permission |
|--------|-------------------|
| View list | view_categories |
| View detail | view_categories |
| Create | create_category OR manage_categories |
| Update | update_category OR manage_categories |
| Delete | delete_category OR manage_categories |
| Reorder | update_category OR manage_categories |

**When Validated**: Before every create, update, delete, or view action

**Implementation Requirements**:
- **Client-Side**:
  * Hide "Create Category" button if user lacks create_category permission
  * Hide "Edit" button if user lacks update_category permission
  * Hide "Delete" button if user lacks delete_category permission
  * Show read-only view if user only has view_categories permission
- **Server-Side**:
  * Extract user permissions from JWT token
  * Check required permission before allowing action
  * Return 403 Forbidden if permission missing
- **Database**:
  * Row Level Security (RLS) policies enforce permission checks
  * Policies filter categories based on user role and department access

**Error Code**: VAL-CAT-301
**Error Message**: "You do not have permission to perform this action. Required permission: {permission_name}"
**User Action**: User must request appropriate permissions from administrator.

**Examples**:

**Scenario 1: User with manage_categories**
- User role: Admin (has manage_categories permission)
- Action: Any category operation
- Result: ✅ All operations allowed

**Scenario 2: User with create_category only**
- User role: Staff (has create_category permission only)
- Actions:
  - Create category: ✅ Allowed
  - View categories: ✅ Allowed (view is default)
  - Update category: ❌ Denied (requires update_category)
  - Delete category: ❌ Denied (requires delete_category)

**Scenario 3: User with no permissions**
- User role: Guest (no category permissions)
- Action: View category list
- Result: ❌ Denied (requires view_categories)

---

### VAL-CAT-302: Role-Based Access

**Validation Rule**: Certain operations are restricted to specific roles regardless of granular permissions.

**Role Restrictions**:
- **Staff**: Can create/view categories, cannot delete
- **Department Manager**: Can create/update/view categories for their department
- **Admin**: Full access to all categories
- **Financial Manager**: Can view all, update/delete own department only

**When Validated**: On every operation, in addition to permission checks

**Implementation Requirements**:
- **Client-Side**:
  * Adjust UI based on user role
  * Staff users see limited options
  * Admins see full management interface
- **Server-Side**:
  * Check user role in addition to permissions
  * Enforce role-specific restrictions
  * Log access attempts by role
- **Database**:
  * RLS policies combine role and permission checks
  * Additional policies for role-specific access

**Error Code**: VAL-CAT-302
**Error Message**: "Your role does not allow this operation. Contact your administrator for access."
**User Action**: User must request role change or additional permissions from administrator.

---

### VAL-CAT-303: Department/Location Access (Future)

**Validation Rule**: Users can only manage categories for departments and locations they have access to.

**Access Rules**:
- User must be assigned to department to manage its categories
- Department managers can manage categories for their department only
- Admins can manage categories for all departments

**Note**: This validation is documented for future implementation when categories are associated with departments/locations. Currently, categories are organization-wide.

**When Validated**: On create, on view (filtering)

**Implementation Requirements**:
- **Client-Side**:
  * Filter category list by accessible departments
  * Show department selector for users with multi-department access
- **Server-Side**:
  * Verify user has access to selected department
  * Return 403 if access denied
- **Database**:
  * RLS policies filter by department access
  * Join with user_department_access table

**Error Code**: VAL-CAT-303
**Error Message**: "You do not have access to manage categories for this department."
**User Action**: User must select a department they have access to, or request access from administrator.

---

### VAL-CAT-304: Input Sanitization

**Validation Rule**: All text input must be sanitized to prevent security vulnerabilities (XSS, SQL injection).

**Security Checks**:
- Remove HTML tags and scripts (XSS prevention)
- Escape special characters in database queries (SQL injection prevention)
- Limit input length to prevent buffer overflow
- Reject suspicious patterns

**Sanitization Rules**:
- **name field**:
  * Remove HTML tags: `<script>`, `<iframe>`, etc.
  * Escape quotes and special characters
  * Trim whitespace
  * Remove control characters
- **description field**:
  * Remove HTML tags except safe formatting (if any)
  * Escape special characters
  * Limit to 500 characters

**When Validated**: On all user input, before storing or displaying data

**Implementation Requirements**:
- **Client-Side**:
  * Basic sanitization for UX (mainly prevent accidental HTML)
  * Input validation to block obvious malicious patterns
- **Server-Side**:
  * Comprehensive sanitization before database operations
  * Use libraries: DOMPurify (for HTML), validator.js (for strings)
  * Escape all SQL parameters (use parameterized queries)
- **Database**:
  * Always use parameterized queries
  * Never concatenate user input into SQL strings
  * Use ORM (Prisma) which provides automatic escaping

**Error Code**: VAL-CAT-304
**Error Message**: "Input contains invalid or potentially harmful content. Please remove special characters or scripts."
**User Action**: User must remove the problematic content and resubmit.

**Forbidden Content**:
- `<script>` tags
- `<iframe>` tags
- `javascript:` URLs
- SQL keywords in unexpected contexts (e.g., name contains "DROP TABLE")
- Extremely long strings (> maximum length + buffer)
- Control characters (ASCII 0-31 except newline/tab)

**Examples**:

**Valid Input**:
- "Coffee & Tea" ✅ (ampersand is acceptable)
- "Items (Category 1)" ✅ (parentheses are acceptable)
- "Café" ✅ (accented characters are acceptable)

**Invalid Input**:
- "<script>alert('XSS')</script>" ❌ (script tag)
- "Category'; DROP TABLE categories; --" ❌ (SQL injection attempt)
- "Cat<iframe>egory" ❌ (iframe tag)
- "javascript:void(0)" ❌ (javascript protocol)

---

## 6. Validation Error Messages

### Error Message Guidelines

**Principles**:
1. **Be Specific**: Tell user exactly what's wrong
2. **Be Actionable**: Explain how to fix the problem
3. **Be Kind**: Use friendly, helpful tone
4. **Be Consistent**: Use same format and tone throughout
5. **Avoid Technical Jargon**: Use plain language

### Error Message Format

**Structure**:
```
[Field Name] {problem statement}. {Expected format or action}.
```

**Examples**:

✅ **Good Messages**:
- "Category name is required. Please enter a category name."
- "Category name must be between 1 and 100 characters."
- "This category name already exists in the selected parent. Please choose a different name."
- "Cannot delete this category because 15 products are assigned to it. Please reassign or remove these products first."
- "Cannot move category with children. Please move or remove child categories first."

❌ **Bad Messages**:
- "Error" (too vague)
- "Invalid input" (not specific)
- "FK constraint violation" (too technical)
- "Validation failed" (not helpful)
- "Your submission is wrong" (unfriendly)

### Error Severity Levels

| Level | When to Use | Display |
|-------|-------------|---------|
| Error | Blocks submission/progress | Red icon, red border, red text |
| Warning | Should be corrected but not blocking | Yellow icon, yellow border |
| Info | Helpful guidance | Blue icon, normal border |

### Error Message Examples by Type

**Required Field**:
- Message: "Category name is required"
- Context: "This field is required to create a category"

**Format Error**:
- Message: "Category name must be between 1 and 100 characters"
- Example: "Coffee" ✅ | "A" ✅ | "" ❌

**Uniqueness Error**:
- Message: "This category name already exists in the selected parent"
- Suggestion: "Try: Coffee (Premium), Coffee Items, or choose different parent"

**Business Rule Violation**:
- Message: "Cannot create category. Maximum hierarchy depth (3 levels) would be exceeded."
- Explanation: "Item Groups (level 3) cannot have children. Please select a different parent."

**Permission Error**:
- Message: "You do not have permission to delete categories"
- Action: "Contact your administrator to request delete_category permission"

---

## 7. Test Scenarios

### Test Coverage Requirements

All validation rules must have test cases covering:
1. **Positive Tests**: Valid input that should pass validation
2. **Negative Tests**: Invalid input that should fail validation
3. **Boundary Tests**: Edge cases at limits of acceptable values
4. **Integration Tests**: Validation working across all layers

### Example Test Scenarios

#### Positive Test Example

**Test ID**: VAL-CAT-T001

**Test Description**: Create category with valid data at all three levels

**Test Type**: Positive

**Preconditions**:
- User is authenticated
- User has create_category permission

**Test Steps**:
1. Navigate to Create Category page
2. Enter name: "Beverages"
3. Set type: CATEGORY (level 1)
4. Leave parent: null
5. Enter description: "All beverages including hot and cold drinks"
6. Set active: true
7. Click Submit
8. Verify category created
9. Create subcategory under "Beverages": "Hot Beverages"
10. Create item group under "Hot Beverages": "Coffee"

**Input Data**:
- Level 1: name="Beverages", type=CATEGORY, parent_id=null, description="All beverages..."
- Level 2: name="Hot Beverages", type=SUBCATEGORY, parent_id={Beverages UUID}
- Level 3: name="Coffee", type=ITEM_GROUP, parent_id={Hot Beverages UUID}

**Expected Result**: ✅ All three categories created successfully

**Validation Layer**: All (Client, Server, Database)

**Pass/Fail Criteria**:
- No validation errors displayed
- All 3 categories saved to database
- Hierarchy path calculated correctly
- Success messages shown
- Categories appear in tree view

---

#### Negative Test Example

**Test ID**: VAL-CAT-T101

**Test Description**: Attempt to create category with duplicate name in same parent

**Test Type**: Negative

**Preconditions**:
- Category "Coffee" already exists under parent "Hot Beverages"
- User has create_category permission

**Test Steps**:
1. Navigate to Create Category page
2. Select parent: "Hot Beverages"
3. Enter name: "Coffee" (duplicate)
4. Fill other fields with valid data
5. Click Submit

**Input Data**:
- name: "Coffee" (duplicate)
- parent_id: {Hot Beverages UUID}
- type: ITEM_GROUP
- level: 3

**Expected Result**: ❌ Validation error displayed

**Validation Layer**: Client and Server

**Pass/Fail Criteria**:
- Error message shown: "This category name already exists in the selected parent. Please choose a different name."
- Name field highlighted in red
- Category not saved to database
- User remains on form
- Suggestions shown: "Coffee (Ethiopian)", "Coffee Items", etc.

---

#### Boundary Test Example

**Test ID**: VAL-CAT-T201

**Test Description**: Create category with name exactly 100 characters long

**Test Type**: Boundary

**Preconditions**: User has create_category permission

**Test Steps**:
1. Navigate to Create Category page
2. Enter name: String with exactly 100 characters
3. Fill other fields with valid data
4. Click Submit

**Input Data**:
- name: "Beverages for Hospitality Industry Including Hotels, Restaurants, Cafes, Bars and Catering Services" (100 chars)
- type: CATEGORY
- level: 1
- parent_id: null

**Expected Result**: ✅ Category created successfully (boundary value is acceptable)

**Validation Layer**: All

**Pass/Fail Criteria**:
- No validation errors
- Category saved successfully
- Full name stored without truncation
- Character counter shows "100 / 100"
- Success message shown

---

#### Integration Test Example

**Test ID**: VAL-CAT-T301

**Test Description**: Test cascade soft delete with hierarchy validation

**Test Type**: Integration

**Preconditions**:
- Category "Beverages" exists with 2 subcategories and 3 item groups
- No products assigned to any category
- User has delete_category permission

**Test Steps**:
1. Navigate to category list
2. Select "Beverages" category
3. Click Delete button
4. System shows cascade warning: "This will also delete 5 child categories"
5. User confirms cascade deletion
6. System performs soft delete
7. Verify all 6 categories marked as deleted (deleted_at set)
8. Verify categories no longer appear in active list
9. Verify item counts updated on parent categories

**Input Data**:
- Target: "Beverages" category UUID
- Cascade: true

**Expected Result**: ✅ All 6 categories soft deleted successfully

**Validation Layer**: All (Client, Server, Database)

**Pass/Fail Criteria**:
- Cascade warning displayed correctly
- All 6 categories have deleted_at timestamp
- All 6 categories have deleted_by = current user
- Categories filtered out of active lists
- Audit log records cascade deletion
- Parent category counts updated
- Success message: "Category and 5 children deleted successfully"

---

## 8. Validation Matrix

| Error Code | Rule Name | Fields Involved | Type | Client | Server | Database |
|------------|-----------|-----------------|------|--------|--------|----------|
| VAL-CAT-001 | Required Name | name | Field | ✅ | ✅ | ✅ |
| VAL-CAT-002 | Min Length Name | name | Field | ✅ | ✅ | ✅ |
| VAL-CAT-003 | Max Length Name | name | Field | ✅ | ✅ | ✅ |
| VAL-CAT-004 | Unique Name | name, parent_id | Field | ✅ | ✅ | ✅ |
| VAL-CAT-005 | Max Length Description | description | Field | ✅ | ✅ | ✅ |
| VAL-CAT-006 | Valid Type | type | Field | ✅ | ✅ | ✅ |
| VAL-CAT-007 | Valid Level | level | Field | ✅ | ✅ | ✅ |
| VAL-CAT-008 | Non-Negative Sort | sort_order | Field | ✅ | ✅ | ✅ |
| VAL-CAT-009 | Parent Required | parent_id, level | Field | ✅ | ✅ | ✅ |
| VAL-CAT-010 | Valid Parent Ref | parent_id | Field | ✅ | ✅ | ✅ |
| VAL-CAT-011 | Required Active | is_active | Field | ✅ | ✅ | ✅ |
| VAL-CAT-101 | Hierarchy Depth | level, parent_id | Business | ⚠️ | ✅ | ✅ |
| VAL-CAT-102 | Type-Level Match | type, level | Business | ✅ | ✅ | ✅ |
| VAL-CAT-103 | No Move with Children | parent_id, children | Business | ⚠️ | ✅ | ❌ |
| VAL-CAT-104 | No Delete with Products | id, products | Business | ⚠️ | ✅ | ✅ |
| VAL-CAT-105 | Cascade Warning | id, descendants | Business | ✅ | ✅ | ✅ |
| VAL-CAT-106 | No Circular Ref | parent_id, id | Business | ✅ | ✅ | ✅ |
| VAL-CAT-201 | Parent-Level Compat | parent_id, level | Cross-field | ✅ | ✅ | ✅ |
| VAL-CAT-202 | Parent-Type Compat | parent_id, type | Cross-field | ✅ | ✅ | ✅ |
| VAL-CAT-203 | Root Constraints | level, parent_id, type | Cross-field | ✅ | ✅ | ✅ |
| VAL-CAT-204 | Unique Sort Order | parent_id, sort_order | Cross-field | ⚠️ | ⚠️ | ❌ |
| VAL-CAT-301 | Permission Check | user, action | Security | ✅ | ✅ | ✅ |
| VAL-CAT-302 | Role-Based Access | user, role | Security | ✅ | ✅ | ✅ |
| VAL-CAT-303 | Department Access | user, department | Security | ✅ | ✅ | ✅ |
| VAL-CAT-304 | Input Sanitization | name, description | Security | ✅ | ✅ | ✅ |

Legend:
- ✅ Enforced at this layer
- ❌ Not enforced at this layer
- ⚠️ Partial enforcement (e.g., display only, warning, or async check)

---

## 9. Related Documents

- **Business Requirements**: [BR-categories.md](./BR-categories.md) - Business rules and functional requirements
- **Use Cases**: [UC-categories.md](./UC-categories.md) - Detailed use case scenarios
- **Technical Specification**: [TS-categories.md](./TS-categories.md) - Technical implementation details
- **Data Dictionary**: [DD-categories.md](./DD-categories.md) - Complete database schema
- **Flow Diagrams**: [FD-categories.md](./FD-categories.md) - Visual process flows and workflows

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Analyst | | | |
| QA Lead | | | |
| Security Team | | | |
| Technical Lead | | | |
| Product Owner | | | |

---

**Document Control**:
- **Created**: 2025-02-11
- **Author**: System Documentation Generator
- **Reviewed By**: Business Analyst, QA Lead, Security Team
- **Approved By**: Technical Lead, Product Owner
- **Next Review**: 2025-05-11 (Quarterly review)

---

## Appendix: Error Code Registry

| Code Range | Category | Description |
|------------|----------|-------------|
| VAL-CAT-001 to 099 | Field Validations | Individual field rules and constraints |
| VAL-CAT-101 to 199 | Business Rules | Business logic validations and hierarchy rules |
| VAL-CAT-201 to 299 | Cross-Field | Multi-field relationships and consistency |
| VAL-CAT-301 to 399 | Security | Permission, access control, and input sanitization |
| VAL-CAT-901 to 999 | System | System-level errors (reserved for future use) |

---

## Appendix: Validation Quick Reference

**Creating a Category**:
1. ✅ Name: 1-100 characters, unique within parent
2. ✅ Description: 0-500 characters (optional)
3. ✅ Type: CATEGORY (level 1), SUBCATEGORY (level 2), or ITEM_GROUP (level 3)
4. ✅ Parent: Required for level 2-3, null for level 1
5. ✅ Level: Must match parent level + 1 (or 1 if no parent)
6. ✅ Permission: Requires create_category or manage_categories

**Updating a Category**:
1. ✅ Name: Can change (must remain unique within parent)
2. ✅ Cannot move category with children
3. ✅ Cannot change parent if it creates circular reference
4. ✅ Permission: Requires update_category or manage_categories

**Deleting a Category**:
1. ✅ Cannot delete if products assigned
2. ✅ Cascade deletes all children (requires confirmation)
3. ✅ Soft delete (sets deleted_at timestamp)
4. ✅ Permission: Requires delete_category or manage_categories

---

**Document End**

> 📝 **Notes for Developers**:
> - All client-side validations must be duplicated on server-side for security
> - Error messages should be user-friendly and actionable
> - Test all validation rules at all three layers (client, server, database)
> - Update validation matrix when adding new rules
> - Maintain error code uniqueness within VAL-CAT range
> - Document rationale for all business rule validations
> - Include examples for complex validation scenarios
> - Keep validation logic consistent with business requirements (BR-categories.md)
