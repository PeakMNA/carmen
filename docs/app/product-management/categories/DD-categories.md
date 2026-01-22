# Data Definition: Product Categories

## Module Information
- **Module**: Product Management
- **Sub-Module**: Product Categories
- **Route**: `/product-management/categories`
- **Database**: CARMEN (PostgreSQL via Supabase)
- **Schema Version**: 1.0.0
- **Last Updated**: 2025-11-26
- **Owner**: Product Management Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-02 | Documentation Team | Initial version |
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |
| 1.2.0 | 2025-11-26 | Documentation Team | Added route reference, aligned with BR-categories.md |


---

## Overview

The Categories sub-module implements a hierarchical three-level product classification system within the CARMEN hospitality ERP database. The data model supports a parent-child relationship structure enabling Category (level 1), Subcategory (level 2), and Item Group (level 3) organization. This hierarchical taxonomy serves as the foundational organizational structure for all product-related operations including inventory management, purchasing workflows, recipe management, and financial reporting.

The database design emphasizes referential integrity, data quality, and performance optimization for hierarchical queries. Key features include self-referencing foreign keys for parent-child relationships, soft delete implementation for data preservation, comprehensive audit trails, and optimized indexes for common query patterns. The schema supports drag-and-drop reordering through sort_order fields, item count aggregation through database views, and real-time updates through trigger-based automation.

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**
- **DO NOT include SQL code** - describe database structures in text
- **DO NOT include CREATE TABLE statements** - describe table purposes and fields
- **DO NOT include mermaid ERD diagrams** - describe relationships in text
- **DO include**: Entity descriptions, field definitions, relationship explanations, business rules
- **Focus on**: WHAT data is stored, WHY it exists, HOW it relates - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-categories.md) - Requirements in text format (no code)
- [Technical Specification](./TS-categories.md) - Implementation patterns in text format (no code)
- [Use Cases](./UC-categories.md) - Use cases in text format (no code)
- [Flow Diagrams](./FD-categories.md) - Visual diagrams with mermaid (ONLY place for diagrams)
- [Validations](./VAL-categories.md) - Validation rules in text format (no code)

---

## TypeScript Interface Reference

**Important**: This section documents the current TypeScript interfaces that correspond to the database entities described below. Developers should reference these interfaces from `lib/types/` when implementing features.

### Base Category Interface (lib/types/common.ts)

```typescript
interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;                    // 1=Category, 2=Subcategory, 3=ItemGroup
  sortOrder?: number;
  path?: string;                    // e.g., "Food > Dairy > Cheese"
  itemCount?: number;               // Direct product count
  totalItemCount?: number;          // Nested count including children
  isActive: boolean;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}
```

### UI Tree Operations Interface (lib/types/product.ts)

```typescript
type CategoryType = 'CATEGORY' | 'SUBCATEGORY' | 'ITEM_GROUP';

interface CategoryItem {
  id: string;
  name: string;
  type: CategoryType;              // Explicit type for UI tree display
  itemCount: number;
  children?: CategoryItem[];
  parentId?: string;
  isExpanded?: boolean;
  isEditing?: boolean;
}

interface CategoryTreeOperations {
  onMove: (dragId: string, hoverId: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newName: string) => void;
  onAdd: (parentId: string, type: CategoryType) => void;
}
```

**Note**: The base `Category` interface uses `level` (1, 2, 3) to determine hierarchy position. The `CategoryItem` interface adds an explicit `type` field for UI tree operations. When mapping between database entities and UI components, derive `CategoryType` from `level`: level 1 = 'CATEGORY', level 2 = 'SUBCATEGORY', level 3 = 'ITEM_GROUP'.

---

## Entity Relationship Overview

**Primary Entities**: The Categories sub-module consists of one primary entity with self-referencing relationships

- **categories**: Represents all nodes in the three-level product classification hierarchy. Each record can be a Category (level 1), Subcategory (level 2), or Item Group (level 3) depending on its level and parent relationship. This single-table design simplifies hierarchy management while supporting flexible depth structures.

**Key Relationships**:

1. **categories → categories** (Self-Referencing Hierarchical Relationship)
   - Business meaning: A category can have a parent category, creating a tree structure with up to three levels. Root-level categories have no parent (parent_id is NULL). Subcategories reference their parent category. Item groups reference their parent subcategory. This self-referencing design allows unlimited flexibility within the three-level constraint.
   - Cardinality: One category has 0 to many child categories. Each child category has exactly 0 or 1 parent (0 for root level, 1 for all others).
   - Hierarchy rules: Categories (level 1) can only have Subcategory children. Subcategories (level 2) can only have Item Group children. Item Groups (level 3) cannot have any children.
   - Example: Category "Raw Materials" (level 1, parent_id NULL) has Subcategory "Coffee Beans" (level 2, parent_id = Raw Materials ID) which has Item Group "Arabica" (level 3, parent_id = Coffee Beans ID).

2. **categories → products** (One-to-Many Relationship)
   - Business meaning: Products are assigned to categories for organizational purposes. Every product must be assigned to exactly one category at any hierarchy level. This assignment enables category-based reporting, purchasing, and inventory management. Categories cannot be deleted if they have products assigned to them.
   - Cardinality: One category has 0 to many products. Each product must have exactly 1 category assignment.
   - Foreign key: products.category_id references categories.id
   - Cascade behavior: ON DELETE RESTRICT prevents category deletion if products exist
   - Example: Item Group "Arabica Coffee Beans" has 5 products assigned (different brands/sizes). Category "Raw Materials" indirectly contains all products in its descendant categories.

3. **categories → users** (Many-to-One Relationships for Audit)
   - Business meaning: Track which user created, last updated, or deleted each category for accountability, audit compliance, and troubleshooting. Multiple audit relationships link each category to user records for complete change history.
   - Cardinality: One user can create/update/delete many categories. Each category has exactly one creator, one last updater, and optionally one deleter.
   - Foreign keys: created_by, updated_by, deleted_by all reference users.id
   - Cascade behavior: ON DELETE SET NULL preserves audit history even if user is deleted
   - Example: User "John Smith" (Product Manager) created category "Beverages" on 2024-01-15. User "Jane Doe" (System Admin) later updated the description on 2024-02-20.

**Relationship Notes**:
- The self-referencing hierarchy is limited to 3 levels by database check constraints and application logic enforcement
- Circular references are prevented through validation (a category cannot be its own ancestor)
- Parent categories cannot be deleted if they have children (ON DELETE RESTRICT)
- Soft delete implementation (deleted_at timestamp) preserves relationships even after deletion
- Item counts are calculated recursively by traversing the hierarchy and summing products across all descendant categories
- See [Flow Diagrams](./FD-categories.md) for visual ERD diagrams showing the complete relationship structure

---

## Data Entities

### Entity: categories

**Description**: Represents all nodes in the three-level hierarchical product classification taxonomy. Each record can function as a Category (top level), Subcategory (middle level), or Item Group (bottom level) based on its type field and parent relationship. This unified table design simplifies hierarchy management while maintaining clear level boundaries through type validation and foreign key constraints.

**Business Purpose**: Provides the foundational organizational structure for all product-related operations in the CARMEN ERP system. Categories enable logical grouping for inventory management (stock reports by category), purchasing workflows (bulk orders by category), recipe management (ingredient categorization), financial analysis (spend by category), and reporting (category-based analytics). The hierarchical structure allows flexible organization from broad classifications down to specific item groups while maintaining referential integrity.

**Data Ownership**: Product Management Team maintains the category taxonomy structure. Purchasing Managers and Inventory Managers use categories for operational tasks. System Administrators have full control including deletion rights. All modifications are tracked through audit fields for accountability.

**Access Pattern**: Categories are primarily accessed through hierarchical tree queries (load all categories with parent-child relationships), parent-child lookups (find all children of specific category), and full-text search (search by name/description). Common query patterns include: loading entire tree for navigation (90% of reads), finding products within category (70% of reads), calculating item counts recursively (50% of reads), and validating hierarchy constraints during updates (100% of writes).

**Data Volume**: Expected data volume based on typical hospitality ERP usage:
- Initial setup: 50-100 categories across 3 levels
- Year 1: 150-200 categories as product catalog grows
- Steady state: 300-500 categories for mature multi-property operation
- Maximum supported: 1,000 categories with optimized performance
- Monthly growth: 5-10 new categories as product offerings expand
- Deletion rate: Minimal (< 1 per month) due to soft delete policy

#### Fields Overview

**Primary Identification**:
- **ID Field**: Unique identifier using UUID format, auto-generated using PostgreSQL uuid_generate_v4() function. Immutable once created. Used as primary key and for all foreign key references.
- **Business Key**: Categories use name + parent_id combination as natural business key. No separate business key field needed because name is unique within parent scope. For root categories, name alone serves as business identifier.
- **Display Name**: The `name` field serves as the primary display value throughout the system. Used in dropdowns, tree navigation, breadcrumbs, and all reporting interfaces.

**Core Business Fields**:

- **name**: VARCHAR(100) - The display name for the category
  - Required: Yes (NOT NULL constraint)
  - Unique: Yes, but only within same parent scope (composite unique constraint with parent_id)
  - Purpose: Human-readable label identifying this category. Must be descriptive and follow title case convention.
  - Example values: "Raw Materials", "Coffee Beans", "Arabica", "Beverages", "Non-Alcoholic Drinks", "Cleaning Supplies"
  - Constraints: Length between 1-100 characters. Cannot contain special characters except space, hyphen, ampersand. Must start and end with alphanumeric characters. Case-insensitive uniqueness within parent.
  - Validation: Trimmed of leading/trailing whitespace. Normalized to title case during creation. Checked for uniqueness among siblings before save.

- **description**: VARCHAR(500) - Detailed explanation of category purpose and contents
  - Required: No (nullable)
  - Default value: NULL
  - Purpose: Provides context about what products belong in this category, usage guidelines, and organizational notes. Helps users select correct category during product assignment.
  - Example values: "Raw ingredients used in food preparation and cooking", "All types of coffee beans including whole bean and ground varieties", "High-quality Arabica coffee beans from various origins"
  - Constraints: Maximum 500 characters. Optional field for additional context.
  - Best practice: Provide descriptions for top-level categories and ambiguous subcategories to guide users.

- **type**: VARCHAR(20) - Explicit type identifier for hierarchy level
  - Required: Yes (NOT NULL constraint)
  - Allowed values: 'CATEGORY' (level 1), 'SUBCATEGORY' (level 2), 'ITEM_GROUP' (level 3)
  - Purpose: Explicitly identifies the hierarchical level and controls allowed operations. Type determines whether item can have children and what parent types are valid.
  - Example values: "CATEGORY" (for "Raw Materials"), "SUBCATEGORY" (for "Coffee Beans"), "ITEM_GROUP" (for "Arabica")
  - Constraints: Must be one of three allowed values. Check constraint enforces valid types. Cannot be changed once set (type is immutable).
  - Business rule: Type must match level field and parent constraints (CATEGORY at level 1, SUBCATEGORY at level 2, ITEM_GROUP at level 3).
  - **Implementation Note**: The `type` field is defined in the database schema for explicit hierarchy identification. However, the base TypeScript `Category` interface (in `lib/types/common.ts`) does NOT include this field - it relies on the `level` field (1, 2, 3) to determine hierarchy position. The `CategoryType` enum ('CATEGORY' | 'SUBCATEGORY' | 'ITEM_GROUP') is used separately in the `CategoryItem` interface (in `lib/types/product.ts`) for UI tree operations. If database implementation proceeds, consider adding type derivation logic based on level.

**Hierarchy and Relationship Fields**:

- **parent_id**: UUID - Foreign key reference to parent category in the hierarchy
  - Required: No (nullable for root level categories)
  - Default value: NULL (indicates root level category with no parent)
  - Purpose: Establishes parent-child relationship enabling tree structure. NULL value identifies root-level categories. Non-NULL values link to parent category forming hierarchy.
  - Relationships: Foreign key referencing categories.id with ON DELETE RESTRICT (prevents deleting parent with children)
  - Example values: NULL (for root categories like "Raw Materials"), UUID of "Raw Materials" category (for "Coffee Beans" subcategory), UUID of "Coffee Beans" (for "Arabica" item group)
  - Constraints: Must reference existing category if not NULL. Cannot reference self (circular prevention). Parent must be correct type for child level (CATEGORY parents for SUBCATEGORY children, SUBCATEGORY parents for ITEM_GROUP children).
  - Validation: Application validates hierarchy rules before saving. Database foreign key constraint ensures referential integrity.

- **level**: INTEGER - Numeric hierarchy depth indicator
  - Required: Yes (NOT NULL constraint)
  - Allowed values: 1 (Category), 2 (Subcategory), 3 (Item Group)
  - Default value: Calculated from parent_id during insert (1 if parent_id NULL, parent.level + 1 otherwise)
  - Purpose: Explicitly stores depth in hierarchy for efficient queries. Enables filtering by level without recursive traversal. Denormalized field improving read performance.
  - Example values: 1 (for "Raw Materials" category), 2 (for "Coffee Beans" subcategory), 3 (for "Arabica" item group)
  - Constraints: Must be 1, 2, or 3 (check constraint). Must match parent relationship (level 1 has no parent, level 2 has level 1 parent, level 3 has level 2 parent).
  - Business rule: Level 3 categories cannot have children (enforced by preventing parent_id references to level 3 records).

- **sort_order**: INTEGER - Position among sibling categories for display ordering
  - Required: Yes (NOT NULL constraint)
  - Default value: 0 (or max(sort_order) + 1 among siblings)
  - Purpose: Controls display sequence within same parent. Enables user-customizable ordering via drag-and-drop. Siblings sorted by this field ascending for consistent display.
  - Example values: 0 (first position), 1 (second position), 2 (third position)
  - Constraints: Must be >= 0 (check constraint). No gaps enforced (after delete, remaining siblings renumbered).
  - Validation: Automatically calculated during insert. Updated via drag-and-drop operations. Re-sequenced after deletions.
  - Performance: Indexed in composite index with parent_id for efficient sorted sibling queries.

- **path**: TEXT - Computed full breadcrumb path from root to current category
  - Required: No (computed field, can be NULL initially)
  - Purpose: Stores pre-calculated hierarchical path for display without recursive queries. Format: "Category > Subcategory > Item Group" showing full ancestry.
  - Example values: "Raw Materials" (for root), "Raw Materials > Coffee Beans" (for subcategory), "Raw Materials > Coffee Beans > Arabica" (for item group)
  - Constraints: Separator is " > " with spaces. Maximum length determined by TEXT column (practically unlimited).
  - Computation: Generated by traversing parent relationships upward to root and joining names. Updated via trigger when name or parent changes.
  - Use cases: Display breadcrumbs in UI. Search across full paths. Show context in dropdowns and reports.

**Status and Workflow Fields**:

- **is_active**: BOOLEAN - Active status flag controlling visibility in dropdowns
  - Required: Yes (NOT NULL constraint)
  - Default value: true (newly created categories are active by default)
  - Allowed values: true (active/visible), false (inactive/hidden)
  - Purpose: Controls whether category appears in product assignment dropdowns and active category lists. Allows temporary hiding without deletion. Inactive categories remain in database but are excluded from normal operations.
  - Status transitions: New categories default to active. Users can deactivate categories to hide them. Deactivation is reversible (can be reactivated). Soft-deleted categories are also marked inactive.
  - Business rule: Products can still reference inactive categories (assignment preserved). Inactive parent categories have inactive descendants (cascade rule).
  - Use cases: Seasonal categories (deactivate off-season). Deprecated classifications (hide but preserve history). Testing/staging categories.

**Flexible Data Fields**:

- Categories do not have metadata or settings JSON fields in current design. All category data is structured in defined columns. Future enhancements may add JSONB metadata field for flexible properties like color coding, icons, custom attributes, department restrictions, or budget allocations.

**Audit Fields** (Standard for all entities):

- **created_at**: TIMESTAMPTZ - Creation timestamp in UTC
  - Required: Yes (NOT NULL constraint)
  - Default value: NOW() (current timestamp at insert time)
  - Purpose: Records exact moment category was created. Immutable after insertion (cannot be updated).
  - Format: Timestamp with timezone stored as UTC. Displayed in user's local timezone in UI.
  - Example value: 2024-01-15T10:30:00.000Z
  - Compliance: Part of required audit trail for 7-year retention period.

- **created_by**: UUID - Foreign key to user who created the category
  - Required: Yes (NOT NULL constraint)
  - Purpose: Identifies which user account created this category. Supports accountability and audit compliance.
  - Foreign key: References users.id with ON DELETE SET NULL (preserves audit trail even if user deleted)
  - Example value: UUID of "John Smith" (Purchasing Manager)
  - Immutable: Cannot be changed after record creation.

- **updated_at**: TIMESTAMPTZ - Last modification timestamp in UTC
  - Required: Yes (NOT NULL constraint)
  - Default value: NOW() (same as created_at at insert, updated on modifications)
  - Purpose: Tracks when category was last modified. Auto-updated by database trigger on every UPDATE operation.
  - Format: Timestamp with timezone stored as UTC.
  - Example value: 2024-02-20T14:45:00.000Z (if category was modified after creation)
  - Automation: Database trigger automatically updates this field on every row modification.

- **updated_by**: UUID - Foreign key to user who last modified the category
  - Required: Yes (NOT NULL constraint)
  - Purpose: Identifies which user account last modified this category. Tracks responsibility for changes.
  - Foreign key: References users.id with ON DELETE SET NULL
  - Example value: UUID of "Jane Doe" (System Administrator)
  - Updated: Set during every UPDATE operation in application code.

- **deleted_at**: TIMESTAMPTZ - Soft delete timestamp
  - Required: No (nullable)
  - Default value: NULL (indicates active, non-deleted record)
  - Purpose: Implements soft delete pattern. Instead of physically removing records, sets this timestamp to mark as deleted. Deleted records excluded from queries via WHERE deleted_at IS NULL clause.
  - Format: Timestamp with timezone stored as UTC. NULL means record is active.
  - Example value: 2024-03-01T09:00:00.000Z (if category was deleted) or NULL (if active)
  - Benefits: Preserves audit history. Enables data recovery. Maintains referential integrity. Supports reporting on deleted items.
  - Indexing: Partial indexes include WHERE deleted_at IS NULL for performance on active records only.

- **deleted_by**: UUID - Foreign key to user who deleted the category
  - Required: No (nullable, only set when deleted_at is set)
  - Default value: NULL (for active records)
  - Purpose: Records which user performed the soft delete operation. Part of complete audit trail.
  - Foreign key: References users.id with ON DELETE SET NULL
  - Example value: UUID of admin who performed deletion, or NULL if not deleted
  - Validation: Should only be non-NULL when deleted_at is also non-NULL (consistency rule).

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | uuid_generate_v4() | Primary key, unique identifier | 550e8400-e29b-41d4-a716-446655440001 | Unique, Non-null, Primary Key |
| name | VARCHAR(100) | Yes | - | Display name for category | "Raw Materials", "Coffee Beans", "Arabica" | Non-empty, 1-100 chars, Unique within parent, Title case, Alphanumeric start/end |
| description | VARCHAR(500) | No | NULL | Detailed category description | "Raw ingredients used in food preparation" | Max 500 chars, Optional context |
| type | VARCHAR(20) | Yes | - | Hierarchy level type | CATEGORY, SUBCATEGORY, ITEM_GROUP | Must be one of three allowed values, Immutable |
| parent_id | UUID | No | NULL | Reference to parent category | 550e8400-... or NULL | Foreign key to categories.id, NULL for root level |
| level | INTEGER | Yes | Auto-calculated | Hierarchy depth (1, 2, or 3) | 1, 2, 3 | Must be 1, 2, or 3, Matches parent relationship |
| sort_order | INTEGER | Yes | 0 | Display order among siblings | 0, 1, 2, 3 | Must be >= 0, Sequential within parent |
| path | TEXT | No | Computed | Full breadcrumb path from root | "Raw Materials > Coffee Beans > Arabica" | Generated from parent traversal |
| is_active | BOOLEAN | Yes | true | Active status for visibility | true, false | Controls dropdown appearance |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp (UTC) | 2024-01-15T10:30:00Z | Immutable, Part of audit trail |
| created_by | UUID | Yes | - | Creator user reference | 550e8400-... | Foreign key to users.id |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp (UTC) | 2024-02-20T14:45:00Z | Auto-updated via trigger |
| updated_by | UUID | Yes | - | Last modifier user reference | 550e8400-... | Foreign key to users.id |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL or timestamp | NULL for active records |
| deleted_by | UUID | No | NULL | Deleter user reference | NULL or UUID | Foreign key to users.id, NULL if active |

#### Data Constraints and Rules

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated using PostgreSQL uuid_generate_v4() extension function
- Purpose: Uniquely identifies each category record across the entire system. UUIDs prevent ID collisions in distributed systems and database merges. Immutable once created (never updated or reused).
- Index: B-tree index automatically created with PRIMARY KEY constraint for O(log n) lookup performance

**Unique Constraints**:

- **Unique Name Within Parent** (Composite Constraint):
  - Fields: Combination of UPPER(name) and parent_id
  - Purpose: Enforces that category names are unique among siblings (same parent) but allows reuse across different parents
  - Implementation: Partial unique index on UPPER(name) WHERE parent_id = X AND deleted_at IS NULL (case-insensitive)
  - Business rule: "Coffee Beans" can exist under both "Raw Materials" and "Finished Goods" categories, but not twice under "Raw Materials"
  - Soft delete handling: Index excludes soft-deleted records (WHERE deleted_at IS NULL) allowing name reuse after deletion
  - Case sensitivity: UPPER() function ensures "coffee beans" and "Coffee Beans" are treated as duplicates

**Foreign Key Relationships**:

- **Parent Category** (`parent_id` → `categories.id`)
  - On Delete: RESTRICT - Prevents deletion of parent category if children exist. User must delete or reassign children first.
  - On Update: CASCADE - If parent ID is updated (rare with UUIDs), change propagates to children automatically
  - Business rule: Maintains hierarchy integrity. Ensures no orphaned categories. Validates parent exists before allowing child creation.
  - Validation: Application checks that parent type is compatible with child level (CATEGORY parents for SUBCATEGORY, SUBCATEGORY parents for ITEM_GROUP)
  - Circular prevention: Before insert/update, validates that new parent is not a descendant of the category being modified

- **Creator User** (`created_by` → `users.id`)
  - On Delete: SET NULL - If user account is deleted, creator field becomes NULL but record is preserved
  - On Update: CASCADE - User ID updates propagate if user record is updated (rare)
  - Business rule: Track accountability for category creation. Preserve audit trail even if user no longer exists in system.
  - Immutable: Created_by field never changes after initial insert. Historical record of original creator maintained forever.

- **Last Updater User** (`updated_by` → `users.id`)
  - On Delete: SET NULL - Preserve record even if updater user is deleted
  - On Update: CASCADE - Propagate user ID changes
  - Business rule: Track most recent modifier for troubleshooting and accountability. Updated every time category is modified.

- **Deleter User** (`deleted_by` → `users.id`)
  - On Delete: SET NULL - Preserve soft delete audit trail even if deleter user is deleted
  - On Update: CASCADE - Propagate user ID changes
  - Business rule: Record which user performed soft delete operation. Part of complete audit history.

- **Product Category Assignment** (`products.category_id` → `categories.id`)
  - On Delete: RESTRICT - Prevents deletion of category if any products reference it. User must reassign products before deleting category.
  - On Update: CASCADE - Category ID updates propagate to product records (rare with UUIDs)
  - Business rule: Enforces referential integrity. Prevents orphaned products. Every product must have valid category assignment at all times.
  - Item count impact: This relationship drives item count calculations. Count triggers update when products added/removed/reassigned.

**Check Constraints**:

- **Valid Category Types**:
  - Rule: type must be one of 'CATEGORY', 'SUBCATEGORY', or 'ITEM_GROUP'
  - Enforcement: Database check constraint type IN ('CATEGORY', 'SUBCATEGORY', 'ITEM_GROUP')
  - Business rule: Explicitly identifies hierarchy level and controls allowed operations. Type determines parent/child rules.
  - Error message: "Invalid category type. Must be CATEGORY, SUBCATEGORY, or ITEM_GROUP"

- **Valid Hierarchy Levels**:
  - Rule: level must be 1, 2, or 3
  - Enforcement: Database check constraint level IN (1, 2, 3)
  - Business rule: Three-level hierarchy limit ensures manageable complexity and optimal performance. Prevents unlimited nesting.
  - Error message: "Invalid hierarchy level. Must be 1, 2, or 3"

- **Name Length Validation**:
  - Rule: name must be between 1 and 100 characters
  - Enforcement: Check constraint LENGTH(TRIM(name)) BETWEEN 1 AND 100
  - Business rule: Prevents empty names and excessively long names. Ensures names fit in UI displays and dropdown menus.
  - Error message: "Category name must be 1-100 characters"

- **Non-Negative Sort Order**:
  - Rule: sort_order must be >= 0
  - Enforcement: Check constraint sort_order >= 0
  - Business rule: Negative sort orders are meaningless and complicate ordering logic. Zero-based indexing is standard.
  - Error message: "Sort order must be non-negative"

- **Level-Parent Consistency** (Enforced by application logic and database trigger):
  - Rule: If level = 1 then parent_id must be NULL
  - Rule: If level = 2 then parent must be type CATEGORY
  - Rule: If level = 3 then parent must be type SUBCATEGORY
  - Enforcement: Before insert/update trigger validates these rules
  - Business rule: Maintains correct hierarchy structure. Prevents invalid parent-child type combinations.
  - Error messages: "Root categories (level 1) cannot have parents", "Subcategories must have category parents", "Item groups must have subcategory parents"

**Not Null Constraints**:

- Required fields that cannot be NULL: id, name, type, level, sort_order, is_active, created_at, created_by, updated_at, updated_by
- Business justification for each:
  - id: Primary key must exist to uniquely identify record
  - name: Display value required for UI, dropdowns, and reporting
  - type: Must explicitly identify hierarchy level for business logic
  - level: Required for queries filtering by depth and hierarchy validation
  - sort_order: Needed for display ordering even if value is 0
  - is_active: Boolean status must be explicitly true or false, not ambiguous NULL
  - created_at/created_by: Audit trail requires knowing when and by whom record was created
  - updated_at/updated_by: Track modification history for accountability

**Default Values**:

- `id`: uuid_generate_v4() - Auto-generate unique UUID on insert
- `level`: Calculated from parent_id (1 if parent_id NULL, parent.level + 1 otherwise)
- `sort_order`: 0 or MAX(sort_order) + 1 among siblings - Append to end of sibling list by default
- `is_active`: true - New categories are active and visible by default
- `created_at`: NOW() - Automatic current timestamp capture at insert time
- `updated_at`: NOW() - Initialize to creation time, updated by trigger on modifications
- `deleted_at`: NULL - Records are active by default (not soft-deleted)
- `deleted_by`: NULL - No deleter for active records
- `parent_id`: NULL - Default to root level category unless explicitly assigned parent
- `description`: NULL - Optional field, description not required
- `path`: NULL initially, computed by trigger after insert - Full breadcrumb generated from parent traversal

#### Sample Data Examples

**Example 1: Root Level Category (Level 1)**
```
ID: 550e8400-e29b-41d4-a716-446655440001
Name: Raw Materials
Description: Raw ingredients and components used in food and beverage preparation including produce, proteins, dairy, grains, and cooking supplies
Type: CATEGORY
Parent ID: NULL (root level)
Level: 1
Sort Order: 0
Path: Raw Materials
Is Active: true
Created At: 2024-01-15 10:30:00 UTC
Created By: 7a9b2c4d-5e6f-4a8b-9c7d-8e9f0a1b2c3d (John Smith - Product Manager)
Updated At: 2024-01-15 10:30:00 UTC
Updated By: 7a9b2c4d-5e6f-4a8b-9c7d-8e9f0a1b2c3d (John Smith - Product Manager)
Deleted At: NULL (active)
Deleted By: NULL (not deleted)
Item Count: 0 (direct products)
Total Item Count: 125 (includes all products in descendant categories)
Children Count: 12 (subcategories like Coffee Beans, Dairy Products, Fresh Produce)
```

**Example 2: Subcategory (Level 2)**
```
ID: 550e8400-e29b-41d4-a716-446655440002
Name: Coffee Beans
Description: All varieties of coffee beans including whole bean and ground coffee for brewing, both regular and specialty grades from various origins
Type: SUBCATEGORY
Parent ID: 550e8400-e29b-41d4-a716-446655440001 (Raw Materials)
Level: 2
Sort Order: 3
Path: Raw Materials > Coffee Beans
Is Active: true
Created At: 2024-01-16 09:15:00 UTC
Created By: 7a9b2c4d-5e6f-4a8b-9c7d-8e9f0a1b2c3d (John Smith - Product Manager)
Updated At: 2024-02-20 14:30:00 UTC
Updated By: 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d (Jane Doe - System Admin)
Deleted At: NULL (active)
Deleted By: NULL (not deleted)
Item Count: 3 (direct products not assigned to item groups)
Total Item Count: 28 (includes products in Arabica and Robusta item groups)
Children Count: 2 (Arabica, Robusta item groups)
```

**Example 3: Item Group (Level 3)**
```
ID: 550e8400-e29b-41d4-a716-446655440003
Name: Arabica
Description: Premium Arabica coffee beans known for smooth, complex flavor profiles with notes of fruit and chocolate, grown at high altitudes
Type: ITEM_GROUP
Parent ID: 550e8400-e29b-41d4-a716-446655440002 (Coffee Beans)
Level: 3
Sort Order: 0
Path: Raw Materials > Coffee Beans > Arabica
Is Active: true
Created At: 2024-01-16 09:20:00 UTC
Created By: 7a9b2c4d-5e6f-4a8b-9c7d-8e9f0a1b2c3d (John Smith - Product Manager)
Updated At: 2024-01-16 09:20:00 UTC
Updated By: 7a9b2c4d-5e6f-4a8b-9c7d-8e9f0a1b2c3d (John Smith - Product Manager)
Deleted At: NULL (active)
Deleted By: NULL (not deleted)
Item Count: 15 (direct products - various Arabica coffee SKUs)
Total Item Count: 15 (no children at level 3)
Children Count: 0 (item groups cannot have children)
```

**Example 4: Inactive Subcategory**
```
ID: 550e8400-e29b-41d4-a716-446655440004
Name: Seasonal Beverages
Description: Limited-time seasonal drink products only available during specific periods of the year (holiday specials, summer drinks, etc.)
Type: SUBCATEGORY
Parent ID: 550e8400-e29b-41d4-a716-446655440010 (Beverages category)
Level: 2
Sort Order: 8
Path: Beverages > Seasonal Beverages
Is Active: false (deactivated but not deleted)
Created At: 2024-03-01 08:00:00 UTC
Created By: 7a9b2c4d-5e6f-4a8b-9c7d-8e9f0a1b2c3d (John Smith - Product Manager)
Updated At: 2024-10-15 16:45:00 UTC
Updated By: 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d (Jane Doe - System Admin - deactivated off-season)
Deleted At: NULL (not deleted, just inactive)
Deleted By: NULL (not deleted)
Item Count: 8 (products still assigned but category hidden from dropdowns)
Total Item Count: 8
Children Count: 0
```

**Example 5: Soft-Deleted Category**
```
ID: 550e8400-e29b-41d4-a716-446655440005
Name: Test Category (Deprecated)
Description: Testing category used during initial setup, deprecated and soft-deleted to preserve audit history
Type: CATEGORY
Parent ID: NULL (was root level)
Level: 1
Sort Order: 99
Path: Test Category (Deprecated)
Is Active: false (inactive and deleted)
Created At: 2024-01-10 12:00:00 UTC
Created By: 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d (Jane Doe - System Admin)
Updated At: 2024-01-10 12:00:00 UTC
Updated By: 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d (Jane Doe - System Admin)
Deleted At: 2024-01-20 10:00:00 UTC (soft-deleted after testing complete)
Deleted By: 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d (Jane Doe - System Admin)
Item Count: 0 (all products reassigned before deletion)
Total Item Count: 0
Children Count: 0 (all children deleted first)
```

---

## Relationships

### One-to-Many Relationships

#### categories → products (Category to Products Assignment)

**Relationship Type**: One category has many products assigned to it for organizational purposes

**Foreign Key**: `products.category_id` references `categories.id`

**Cardinality**:
- One category can have: 0 to many products assigned
- Each product must have: exactly 1 category assignment (required foreign key)

**Cascade Behavior**:
- **On Delete**: RESTRICT - Cannot delete category if any products reference it
  - Business rule: Prevents orphaned products. User must first reassign all products to different categories before deletion is allowed.
  - Error handling: Deletion attempt returns error with count of assigned products. UI shows error message: "Cannot delete category with 15 assigned products. Please reassign products first."
  - Verification: Before delete operation, query product count. If count > 0, reject deletion and display reassignment instructions.

- **On Update**: CASCADE - Category ID updates propagate to products (rare with UUIDs)
  - Automatic propagation: If category.id is updated (highly unlikely with UUIDs), all products.category_id automatically update to new value
  - Maintains referential integrity during rare ID changes

**Business Rule**: Every product in the system must be assigned to exactly one category at any hierarchy level (category, subcategory, or item group). This assignment enables category-based reporting, inventory management, purchasing workflows, and financial analysis. Categories serve as the primary organizational dimension for all product-related operations throughout the ERP system.

**Example Scenario**:
```
Category: Item Group "Arabica" (ID: 550e8400-...003)
Products assigned:
  - Product 1: "Colombian Arabica Coffee - 1lb" (SKU: COF-COL-001)
  - Product 2: "Ethiopian Arabica Coffee - 1lb" (SKU: COF-ETH-001)
  - Product 3: "Brazilian Arabica Coffee - 1lb" (SKU: COF-BRA-001)
  - Product 4: "Guatemalan Arabica Coffee - 1lb" (SKU: COF-GUA-001)
  - Product 5: "Costa Rican Arabica Coffee - 1lb" (SKU: COF-CRC-001)
  ... (15 total products)

Business meaning:
  - All these coffee products are classified under "Arabica" for organization
  - Reports can aggregate inventory value, purchase orders, or usage by "Arabica" category
  - Parent category "Coffee Beans" includes these 15 products in its total count
  - Root category "Raw Materials" includes these products in its aggregated count

Deletion prevention:
  - Attempting to delete "Arabica" category returns error: "Cannot delete. Category has 15 assigned products."
  - Admin must first reassign all 15 products to different category (e.g., "Coffee Beans" or "Robusta")
  - After reassignment, "Arabica" category shows 0 products and can be safely deleted
```

**Common Query Patterns**:
- Get all products for a category: Filter products WHERE category_id = {category_id}
- Count products in category: SELECT COUNT(*) FROM products WHERE category_id = {category_id}
- Get categories with products: JOIN products ON category_id with GROUP BY to filter non-empty categories
- Get categories without products: LEFT JOIN products with WHERE products.id IS NULL to find empty categories available for deletion
- Validate deletion eligibility: COUNT products before attempting category deletion, reject if count > 0
- Reassign products: UPDATE products SET category_id = {new_category_id} WHERE category_id = {old_category_id}

---

### Hierarchical Relationships (Self-Referencing)

#### categories → categories (Parent-Child Category Hierarchy)

**Relationship Type**: Self-referencing hierarchical structure where each category can have a parent category and multiple child categories, forming a tree with maximum 3 levels

**Foreign Key**: `parent_id` references `categories.id` (same table, self-referencing)

**Hierarchy Characteristics**:
- **Depth**: Maximum 3 levels strictly enforced (Category → Subcategory → Item Group)
  - Level 1 (Category): Root level with parent_id = NULL
  - Level 2 (Subcategory): Has Category parent (parent.type = 'CATEGORY')
  - Level 3 (Item Group): Has Subcategory parent (parent.type = 'SUBCATEGORY')
  - No level 4 allowed: Item Groups cannot have children

- **Root Nodes**: Categories with parent_id = NULL (top-level categories)
  - Examples: "Raw Materials", "Beverages", "Consumables", "Non-Consumables"
  - Query: WHERE parent_id IS NULL AND deleted_at IS NULL

- **Leaf Nodes**: Categories with no children (bottom of hierarchy)
  - Can be at any level (categories without subcategories, subcategories without item groups, all item groups)
  - Query: Categories NOT IN (SELECT DISTINCT parent_id FROM categories WHERE parent_id IS NOT NULL)

- **Cycles**: Prevented by validation logic (a category cannot be its own ancestor)
  - Before insert/update: Traverse parent chain upward to root, verify new parent is not descendant of current category
  - Database constraint: Cannot reference self (check parent_id != id)
  - Application logic: Recursive ancestry check prevents circular references

**Business Rule**: The three-level hierarchy provides organizational flexibility while maintaining manageable complexity. Top-level categories represent broad classifications (Raw Materials, Beverages). Subcategories refine classifications (Coffee Beans, Dairy Products). Item Groups provide finest-granularity grouping (Arabica, Whole Milk). This structure balances organization needs with query performance and user interface simplicity.

**Cardinality**:
- Each category can have: 0 to many child categories
- Each category must have: 0 or 1 parent category (0 for root level, 1 for all others)
- Parent-child relationships follow type rules:
  - CATEGORY parents have SUBCATEGORY children
  - SUBCATEGORY parents have ITEM_GROUP children
  - ITEM_GROUP cannot have any children (level 3 limit)

**Cascade Behavior**:
- **On Delete**: RESTRICT - Cannot delete category if it has children
  - Business rule: Prevents orphaned child categories. User must delete or reassign children before deleting parent.
  - Error message: "Cannot delete category with 8 child categories. Please delete or reassign children first."
  - Cascading delete workflow: To delete category with descendants, must delete from bottom up (item groups first, then subcategories, then category).

- **On Update**: CASCADE - Parent ID updates propagate (rare with UUIDs)
  - If parent.id changes, all children's parent_id automatically update
  - Maintains hierarchy integrity during rare ID changes

**Example Scenario**:
```
Hierarchy Structure:

Root: Raw Materials (Level 1, parent_id = NULL)
  ├── Coffee Beans (Level 2, parent_id = Raw Materials ID)
  │   ├── Arabica (Level 3, parent_id = Coffee Beans ID)
  │   │   - 15 products assigned
  │   └── Robusta (Level 3, parent_id = Coffee Beans ID)
  │       - 10 products assigned
  │
  ├── Dairy Products (Level 2, parent_id = Raw Materials ID)
  │   ├── Milk (Level 3, parent_id = Dairy Products ID)
  │   │   - 8 products assigned
  │   └── Cheese (Level 3, parent_id = Dairy Products ID)
  │       - 20 products assigned
  │
  └── Fresh Produce (Level 2, parent_id = Raw Materials ID)
      ├── Vegetables (Level 3, parent_id = Fresh Produce ID)
      │   - 45 products assigned
      └── Fruits (Level 3, parent_id = Fresh Produce ID)
          - 32 products assigned

Business meaning:
  - "Raw Materials" contains all products in its descendant categories (total: 130 products)
  - "Coffee Beans" contains 25 products (15 in Arabica + 10 in Robusta)
  - Each item group contains only its directly assigned products
  - Deleting "Dairy Products" requires first deleting "Milk" and "Cheese" item groups
  - Moving "Coffee Beans" to different parent validates new parent is CATEGORY type

Query examples:
  - Get immediate children of "Raw Materials": WHERE parent_id = {Raw Materials ID} AND deleted_at IS NULL
  - Get all descendants of "Raw Materials": Recursive CTE traversing parent_id chain downward
  - Get ancestors of "Arabica": Recursive traversal upward following parent_id to NULL (root)
  - Get siblings of "Coffee Beans": WHERE parent_id = {Raw Materials ID} AND id != {Coffee Beans ID}
```

**Common Query Patterns**:
- **Get immediate children**: WHERE parent_id = {parent_id} AND deleted_at IS NULL ORDER BY sort_order
- **Get all descendants**: Recursive Common Table Expression (CTE) starting from parent and traversing downward through parent_id relationships
- **Get ancestors (path to root)**: Recursive upward traversal following parent_id until parent_id IS NULL
- **Get root categories**: WHERE parent_id IS NULL AND deleted_at IS NULL
- **Get siblings**: WHERE parent_id = (SELECT parent_id FROM categories WHERE id = {current_id}) AND id != {current_id}
- **Get leaf nodes**: Categories WHERE id NOT IN (SELECT DISTINCT parent_id FROM categories WHERE parent_id IS NOT NULL)
- **Validate hierarchy depth**: Recursive count of levels from node to root, verify <= 3
- **Prevent circular references**: Before update, traverse parent chain and verify new parent is not in descendant tree

---

## Data Indexing Strategy

### Primary Indexes

**Primary Key Index** (Automatic):
- **Field**: `id`
- **Purpose**: Ensure uniqueness and enable fast lookup by UUID. Primary access pattern for single-record retrieval by ID.
- **Type**: B-tree index (default for PRIMARY KEY constraint)
- **Performance**: O(log n) lookup time. Highly efficient for exact-match queries. Automatically maintained by PostgreSQL.
- **Index name**: categories_pkey (standard PostgreSQL naming)
- **Size estimate**: ~10-15 bytes per record (UUID 16 bytes + B-tree overhead)

### Business Key Indexes

**Unique Name Within Parent Index**:
- **Fields**: UPPER(name) - Case-insensitive name comparison
- **Purpose**: Enforce uniqueness of category names among siblings (same parent). Fast lookup by name within parent scope.
- **Type**: Unique partial B-tree index
- **Partial Index Condition**: WHERE parent_id = {specific_parent} AND deleted_at IS NULL
- **Implementation**: Separate partial index for each parent_id value, or functional unique index on (parent_id, UPPER(name)) WHERE deleted_at IS NULL
- **Use Cases**: Validate name uniqueness before insert/update. Search categories by name within parent. Prevent duplicate sibling names.
- **Case sensitivity**: UPPER() function ensures "Coffee Beans" and "coffee beans" treated as duplicates
- **Soft delete handling**: Excludes deleted records (WHERE deleted_at IS NULL) allowing name reuse after soft deletion

### Foreign Key Indexes

**Parent Reference Index**:
- **Field**: `parent_id`
- **Purpose**: Fast lookup of children for given parent. Essential for tree navigation, hierarchy expansion, and cascade validations.
- **Type**: B-tree index
- **Use Cases**: Load children when expanding tree node. Count children before allowing deletion. Validate parent exists during insert/update. Build full tree structure recursively.
- **Performance**: Critical for tree queries. Without this index, finding children requires full table scan. Index enables O(log n) child lookup.
- **Query patterns**: WHERE parent_id = {parent_id}, JOIN on parent_id for hierarchy queries

**User Reference Indexes**:
- **Fields**: `created_by`, `updated_by`, `deleted_by`
- **Purpose**: Filter categories by who created, modified, or deleted them. Support audit queries and user activity reports.
- **Type**: B-tree indexes (one per audit field)
- **Use Cases**: "Show all categories created by John Smith". "Find categories modified by admin today". Audit reports by user activity.
- **Performance**: Without indexes, user-based filtering requires full table scan. Indexes enable efficient user activity queries.
- **Query patterns**: WHERE created_by = {user_id}, WHERE updated_by IN (admin_users), WHERE deleted_by IS NOT NULL

### Status and Workflow Indexes

**Active Status Index**:
- **Field**: `is_active`
- **Purpose**: Fast filtering of active vs inactive categories. Most queries only need active categories.
- **Type**: B-tree index
- **Partial Index**: WHERE deleted_at IS NULL (only index active records, not soft-deleted)
- **Use Cases**: Load active categories for dropdowns. Filter category list to show only visible categories. Exclude inactive categories from navigation tree.
- **Performance**: Separates active (majority) from inactive (minority) categories. Enables efficient filtering without full table scan.
- **Combined queries**: Often combined with deleted_at IS NULL filter for "active and not deleted" criteria

**Type Filter Index**:
- **Field**: `type`
- **Purpose**: Fast filtering by hierarchy level (CATEGORY, SUBCATEGORY, ITEM_GROUP). Enable level-specific queries.
- **Type**: B-tree index
- **Use Cases**: Load only root categories (type = 'CATEGORY'). Filter list view to show only subcategories. Validate parent type compatibility.
- **Performance**: Type has low cardinality (only 3 values) but frequently used in queries. Index improves filtering performance.
- **Query patterns**: WHERE type = 'CATEGORY', WHERE type IN ('SUBCATEGORY', 'ITEM_GROUP')

### Composite Indexes

**Parent and Sort Order Index**:
- **Fields**: (`parent_id`, `sort_order`)
- **Purpose**: Efficiently retrieve children sorted by display order. Single index serves both parent lookup and sorting.
- **Type**: Composite B-tree index
- **Use Cases**: Load children of parent in correct display order for tree navigation. Drag-and-drop reordering queries. Sibling order validation.
- **Performance**: Composite index eliminates need for separate sort operation. Query retrieves sorted results directly from index.
- **Query pattern**: WHERE parent_id = {parent_id} ORDER BY sort_order ASC (index scan, no sort needed)
- **Optimization**: Placing parent_id first enables index use even when sort_order not in query

**Active Categories Composite Index**:
- **Fields**: (`is_active`, `deleted_at`, `name`)
- **Purpose**: Efficiently query active, non-deleted categories alphabetically. Covers common "active list" query pattern.
- **Type**: Composite B-tree index
- **Partial Index**: WHERE deleted_at IS NULL (index only active records)
- **Use Cases**: Load alphabetical list of active categories. Populate dropdowns sorted by name. Search active categories.
- **Query pattern**: WHERE is_active = true AND deleted_at IS NULL ORDER BY name (fully covered by index)

### Date Range Indexes

**Created Date Index**:
- **Field**: `created_at`
- **Purpose**: Time-series queries, chronological sorting, reporting by creation date ranges.
- **Type**: B-tree index (efficient for range queries)
- **Use Cases**: "Categories created in last 30 days". Chronological reports. Activity tracking over time.
- **Query patterns**: WHERE created_at >= {start_date} AND created_at <= {end_date}, ORDER BY created_at DESC

**Updated Date Index**:
- **Field**: `updated_at`
- **Purpose**: Find recently modified categories. Track change frequency. Audit reports by modification date.
- **Type**: B-tree index
- **Use Cases**: "Categories modified this week". Change tracking. Recent activity reports.
- **Query patterns**: WHERE updated_at > NOW() - INTERVAL '7 days', ORDER BY updated_at DESC

### Full-Text Search Indexes

**Name and Description Search Index**:
- **Fields**: Combination of `name` and `description`
- **Purpose**: Fast full-text search across category names and descriptions. Enable search bar functionality.
- **Type**: GIN (Generalized Inverted Index) with tsvector
- **Function**: to_tsvector('english', name || ' ' || COALESCE(description, ''))
- **Use Cases**: Search bar "find categories matching 'coffee'". Fuzzy search across names and descriptions. Keyword-based filtering.
- **Performance**: GIN indexes are optimized for full-text search. Much faster than LIKE queries on large datasets.
- **Query patterns**: WHERE to_tsvector('english', name || ' ' || description) @@ to_tsquery('coffee'), ranked results by relevance

### Partial Indexes (Soft Delete)

**Active Records Index**:
- **Fields**: Multiple indexes include WHERE clause
- **Condition**: WHERE deleted_at IS NULL (exclude soft-deleted records)
- **Purpose**: Reduce index size by excluding deleted records. Improve query performance on active data (vast majority of queries).
- **Benefit**: Smaller index size (typically 10-20% smaller). Faster queries on active records. Better cache hit rates.
- **Use Cases**: All production queries filtering WHERE deleted_at IS NULL benefit from partial indexes
- **Applied to**: Name uniqueness index, active status index, type index, composite indexes
- **Implementation**: Each functional index has WHERE deleted_at IS NULL clause appended

### Index Maintenance Guidelines

**Monitoring**:
- Track index usage statistics using pg_stat_user_indexes view. Identify unused indexes consuming space and write performance.
- Monitor index bloat using pgstattuple extension. Reindex when bloat exceeds 20-30% of index size.
- Check slow query log for missing indexes. Add indexes for frequently slow queries identified in logs.
- Monitor index size growth over time. Plan capacity for index storage (typically 30-50% of table size).

**Best Practices**:
- Index foreign keys used in joins (parent_id, created_by, updated_by, deleted_by) for optimal join performance
- Index columns frequently used in WHERE clauses (is_active, type, deleted_at, parent_id) with >10% query usage threshold
- Index columns used in ORDER BY (sort_order, created_at, updated_at, name) for sorted retrieval without sort operation
- Use composite indexes for multi-column queries (parent_id + sort_order, is_active + name) to eliminate multiple index lookups
- Avoid over-indexing: Each index has write overhead (insert, update, delete slower). Balance read performance vs write performance.
- Remove unused indexes: Periodically query pg_stat_user_indexes.idx_scan = 0 and drop unused indexes to reclaim space and improve write performance

**Index Naming Convention**:
- Primary key: `categories_pkey` (automatic PostgreSQL naming)
- Unique indexes: `idx_categories_{column}_unique` (e.g., idx_categories_name_parent_unique)
- Foreign key: `idx_categories_{fk_column}` (e.g., idx_categories_parent_id)
- Composite: `idx_categories_{col1}_{col2}` (e.g., idx_categories_parent_sort)
- Partial: `idx_categories_{column}_active` (e.g., idx_categories_is_active_active) for partial indexes with WHERE clause
- Full-text: `idx_categories_search` (for full-text search indexes)

**Rebuild Schedule**:
- Routine reindex: Every 3-6 months during maintenance window to reduce bloat and rebuild statistics
- Bloat threshold: Reindex when bloat exceeds 30% of index size (identified via pgstattuple)
- After bulk operations: Reindex after large data imports, migrations, or bulk updates to optimize index structure
- Monitor fragmentation: Use VACUUM ANALYZE regularly to update statistics and reduce table/index bloat

---

## Data Integrity Rules

### Referential Integrity

**Foreign Key Constraints**: All foreign keys strictly enforced at database level. Referential integrity cannot be bypassed by application code. Database automatically validates relationships during all insert, update, and delete operations.

- **parent_id → categories.id**: Ensures every child category references valid parent. NULL allowed for root level categories only.
- **created_by, updated_by, deleted_by → users.id**: Ensures audit fields reference valid users. Tracks accountability for all operations.
- **products.category_id → categories.id** (referenced): Ensures products reference valid categories. Prevents orphaned products.

**Foreign Key Indexing**: All foreign key columns automatically indexed for query performance. Indexes enable fast join operations and relationship validation. Without indexes, foreign key constraint checks would require full table scans.

**Relationship Validation**: Foreign key constraints enforce relationships at insert/update time:
- Insert: Cannot insert child without valid parent (parent_id must exist or be NULL for root)
- Update: Cannot update parent_id to non-existent category
- Delete: Cannot delete parent with children (ON DELETE RESTRICT enforced)

**Cascade Rules** - Actions taken when referenced record (parent) is deleted or updated:

**CASCADE** - Not used for categories table relationships:
- Rationale: Category relationships use RESTRICT to protect data integrity. Cascading deletes would risk unintentional data loss. Users must explicitly delete or reassign children and products before deleting categories.

**SET NULL** - Used for audit fields only:
- **created_by, updated_by, deleted_by → users.id**: ON DELETE SET NULL
  - When user deleted: Audit field becomes NULL but category record preserved
  - Rationale: Preserve historical categories even if user account no longer exists
  - Use case: Former employee's created categories remain in system indefinitely

**RESTRICT** - Used for structural relationships:
- **parent_id → categories.id**: ON DELETE RESTRICT
  - When parent has children: Delete operation rejected with error
  - Rationale: Prevents orphaned categories. Forces explicit handling of children before parent deletion.
  - Error message: "Cannot delete category with 8 children. Delete or reassign children first."

- **products.category_id → categories.id**: ON DELETE RESTRICT
  - When category has products: Delete operation rejected with error
  - Rationale: Prevents orphaned products. Every product must have valid category assignment.
  - Error message: "Cannot delete category with 25 assigned products. Reassign products first."

**Orphan Prevention**: Database structure prevents orphaned records through multiple mechanisms:
- Foreign key constraints enforce valid references at all times
- RESTRICT cascade rules prevent deletion of referenced parents
- Application validates relationships before deletion attempts
- Soft delete preserves relationships in database even after logical deletion

### Domain Integrity

**Data Type Enforcement**: PostgreSQL strictly enforces column data types. Type mismatches rejected at insert/update time with clear error messages.

**Type Validations**:
- UUID fields: Must be valid UUID format (8-4-4-4-12 hexadecimal pattern). Invalid UUIDs rejected: "invalid input syntax for type uuid"
- VARCHAR fields: Must not exceed maximum length. Strings over limit rejected: "value too long for type character varying(100)"
- INTEGER fields: Must be whole numbers within PostgreSQL integer range (-2147483648 to 2147483647). Non-integers rejected.
- BOOLEAN fields: Must be true, false, or NULL (if nullable). Invalid values rejected: "invalid input syntax for type boolean"
- TIMESTAMPTZ fields: Must be valid timestamps with timezone. Invalid dates/times rejected with parsing error.

**Check Constraints**: Business rules enforced at database level through check constraints. All constraint violations return errors preventing invalid data storage.

**Implemented Check Constraints**:
- **Type validation**: `type IN ('CATEGORY', 'SUBCATEGORY', 'ITEM_GROUP')`
  - Ensures only three allowed category types. Rejects invalid types: "new row violates check constraint"

- **Level validation**: `level IN (1, 2, 3)`
  - Enforces three-level hierarchy limit. Prevents unlimited nesting depth.

- **Name length**: `LENGTH(TRIM(name)) BETWEEN 1 AND 100`
  - Prevents empty names and excessively long names. Ensures UI display compatibility.

- **Sort order non-negative**: `sort_order >= 0`
  - Prevents negative ordering. Ensures valid sort sequences.

- **Parent-level consistency**: Validated via triggers (application logic reinforced at database)
  - Level 1 must have parent_id = NULL
  - Level 2 must have parent with type = 'CATEGORY'
  - Level 3 must have parent with type = 'SUBCATEGORY'

**NOT NULL Constraints**: Required fields cannot contain NULL values. Database rejects insert/update attempts with NULL in NOT NULL columns.

**Enforced NOT NULL Fields**:
- id, name, type, level, sort_order, is_active, created_at, created_by, updated_at, updated_by
- Business justification: These fields are essential for core category functionality. NULL values would break business logic, UI display, or audit requirements.

**Application Responsibility**: Application must provide values for all NOT NULL fields during insert/update operations. Database provides safety net by rejecting NULL values with clear error messages.

**DEFAULT Values**: Sensible defaults reduce application complexity and ensure consistency.

**Applied Defaults**:
- `id`: uuid_generate_v4() - Automatic UUID generation eliminates application responsibility
- `is_active`: true - New categories visible by default, explicitly deactivate if needed
- `created_at`, `updated_at`: NOW() - Automatic timestamp capture ensures accurate audit trail
- `sort_order`: 0 or MAX(sort_order) + 1 - Append new categories to end of sibling list by default
- `deleted_at`: NULL - Records active by default, explicitly set timestamp for soft delete
- `deleted_by`, `parent_id`: NULL - Optional fields default to NULL

**Benefits of Defaults**: Reduce required fields in application code. Ensure consistent initial values. Simplify insert operations. Prevent accidental NULL values in critical fields.

**UNIQUE Constraints**: Prevent duplicate values where business requires uniqueness. Can be simple (single column) or composite (multiple columns together must be unique).

**Implemented Unique Constraints**:
- **Primary key** (id): Simple unique constraint ensuring each category has unique UUID identifier
- **Name within parent** (UPPER(name), parent_id WHERE deleted_at IS NULL): Composite partial unique constraint
  - Prevents duplicate sibling names (case-insensitive)
  - Allows same name under different parents
  - Excludes soft-deleted records (name can be reused after deletion)
  - Example: Can have "Organic" subcategory under both "Produce" and "Dairy" but not twice under "Produce"

**Uniqueness Validation**: Database enforces uniqueness constraints at insert/update time. Violations return error: "duplicate key value violates unique constraint". Application should validate uniqueness before submission to provide user-friendly error messages.

### Entity Integrity

**Primary Key Requirements**: Every table must have primary key constraint. Categories table uses UUID as primary key.

**Primary Key Properties**:
- Immutable: Primary keys never updated after insertion. UUID assigned at creation time remains forever.
- Unique: Primary key constraint ensures no duplicate IDs across all records in table.
- Non-null: Primary keys cannot be NULL. Every record must have valid unique identifier.
- UUID type: Universally unique identifier enables distributed system compatibility, database merges, and eliminates ID collision risks.

**UUID Generation**: Using PostgreSQL uuid_generate_v4() extension function. Generates version 4 UUIDs (random-based) with 122 bits of randomness. Collision probability negligible (1 in 2^122 for two UUIDs generated).

**Audit Trail Requirements** (Standard for all tables): Every table must include audit fields for compliance, troubleshooting, and accountability.

**Required Audit Fields**:
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()
  - Records exact creation moment in UTC. Immutable after insertion.
  - Purpose: Know when each category was created for reporting, compliance, troubleshooting.

- `created_by`: UUID NOT NULL
  - References users.id (user who created record). Immutable after insertion.
  - Purpose: Accountability - identify who created each category. Essential for audit compliance.

- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW()
  - Records last modification moment in UTC. Auto-updated by trigger on every UPDATE.
  - Purpose: Track when categories were last changed. Identify recent activity. Troubleshoot issues.

- `updated_by`: UUID NOT NULL
  - References users.id (user who last modified record). Updated on every modification.
  - Purpose: Accountability - identify who made most recent changes. Track modification responsibility.

**Audit Trail Benefits**:
- Compliance: Meet regulatory requirements for change tracking (7-year retention)
- Troubleshooting: Identify when issues introduced by tracking change timestamps
- Accountability: Establish responsibility for all data modifications
- Reporting: Analyze user activity, change frequency, creation patterns

**Soft Delete Requirements**: Categories table implements soft delete pattern for data preservation.

**Soft Delete Implementation**:
- `deleted_at`: TIMESTAMPTZ NULL DEFAULT NULL
  - NULL indicates active record. Non-NULL timestamp indicates logical deletion.
  - Purpose: Preserve data history. Enable recovery. Maintain referential integrity. Support historical reporting.

- `deleted_by`: UUID NULL DEFAULT NULL
  - References users.id (user who performed soft delete). NULL for active records.
  - Purpose: Audit who deleted category. Complete deletion history for compliance.

**Soft Delete Query Pattern**: All queries retrieving active records must include WHERE deleted_at IS NULL clause. Omitting this filter returns soft-deleted records (usually undesired).

**Benefits of Soft Delete**:
- Data recovery: Accidentally deleted categories can be restored by setting deleted_at back to NULL
- Audit history: Complete record of deletions preserved indefinitely
- Referential integrity: Foreign keys remain valid even after logical deletion
- Historical reporting: Include deleted categories in historical analysis when needed
- Compliance: Meet data retention requirements for audit and regulatory purposes

**Never Physical Delete**: Categories are never physically removed from database using DELETE command. All deletions are logical (setting deleted_at timestamp). This policy ensures complete audit trail and data preservation.

### Data Quality Constraints

**Value Range Constraints**: Business rules limiting acceptable value ranges beyond simple data types.

**Implemented Range Constraints**:
- **sort_order**: Must be >= 0. Negative values are meaningless for display ordering.
- **level**: Must be 1, 2, or 3. Enforces three-level hierarchy limit.
- **name length**: 1-100 characters. Prevents empty names and names too long for UI display.

**Format Constraints**: Business rules enforcing specific data formats and patterns.

**Name Format Rules** (enforced by application, described in VAL-categories.md):
- Must start and end with alphanumeric characters (letters or numbers)
- Cannot contain special characters except space, hyphen, ampersand
- No leading or trailing whitespace (automatically trimmed)
- Title case convention recommended (not enforced at database level)
- Examples: Valid: "Coffee Beans", "Raw Materials & Supplies", "ISO-9001 Certified"
- Examples: Invalid: " Coffee " (whitespace), "Coffee$Beans" (special chars), "(Coffee)" (starts with special)

**Business Logic Constraints**: Complex business rules enforced through triggers and application validation.

**Level-Parent Type Consistency** (enforced by trigger):
- Level 1 (CATEGORY) must have parent_id = NULL (root level)
- Level 2 (SUBCATEGORY) must have parent with type = 'CATEGORY'
- Level 3 (ITEM_GROUP) must have parent with type = 'SUBCATEGORY'
- Validation: Before insert/update trigger checks parent type matches level requirements
- Error: "Subcategories must have CATEGORY parent" if rule violated

**Circular Reference Prevention** (enforced by trigger):
- Category cannot be its own parent (parent_id != id)
- Category cannot be its own ancestor (no cycles in parent chain)
- Validation: Before insert/update, traverse parent chain to root, verify new parent not in descendant tree
- Error: "Circular reference detected. Cannot set parent to descendant category"

**Deletion With Products Prevention** (enforced by foreign key):
- Categories with assigned products cannot be deleted
- Foreign key constraint products.category_id → categories.id with ON DELETE RESTRICT
- Error: "Cannot delete category with 15 assigned products"

**Parent With Children Prevention** (enforced by foreign key):
- Parent categories with children cannot be deleted
- Foreign key constraint parent_id → categories.id with ON DELETE RESTRICT
- Error: "Cannot delete category with 8 child categories"

---

## Database Triggers and Automation

### Automatic Timestamp Updates

**Updated At Trigger**:
- **Purpose**: Automatically update `updated_at` field to current timestamp on every row modification
- **Trigger Event**: BEFORE UPDATE on categories table
- **Trigger Name**: trigger_update_categories_updated_at
- **Behavior**: Function sets NEW.updated_at = NOW() before saving updated row to disk
- **Benefits**: Ensures accurate last-modified tracking without application code managing timestamp. Impossible to forget updating timestamp. Consistent behavior across all update operations.
- **Implementation**: PostgreSQL function created once, trigger attached to table. Function executes automatically on every UPDATE statement.
- **Performance**: Minimal overhead (simple timestamp assignment). Executes in microseconds.

**Created At Protection**:
- **Purpose**: Prevent modification of `created_at` and `created_by` audit fields after initial insert
- **Trigger Event**: BEFORE UPDATE on categories table
- **Trigger Name**: trigger_protect_categories_created_fields
- **Behavior**: Trigger rejects any UPDATE attempting to change created_at or created_by values
- **Benefits**: Immutable creation audit trail. Prevents accidental or malicious modification of historical data. Ensures data integrity for compliance.
- **Error Message**: "Cannot modify created_at or created_by fields. These fields are immutable."
- **Exception**: No exceptions. Created fields are strictly immutable after insertion.

### Audit Logging

**Change Tracking Trigger**:
- **Purpose**: Record all insert, update, and delete operations to separate audit log table for complete change history
- **Trigger Event**: AFTER INSERT OR UPDATE OR DELETE on categories table
- **Trigger Name**: trigger_audit_categories_changes
- **Audit Table**: categories_audit (separate table storing historical changes)
- **Captured Data**:
  - Operation type: INSERT, UPDATE, DELETE (action performed)
  - User who performed action: extracted from current session or application context
  - Timestamp of change: exact moment operation occurred
  - Old values: complete row state before change (for UPDATE and DELETE)
  - New values: complete row state after change (for INSERT and UPDATE)
  - Changed fields only: for efficiency, only fields that actually changed are logged for UPDATE operations
  - Session metadata: IP address, application identifier, session ID if available

**Audit Table Schema Description** (TEXT FORMAT):
- Table: categories_audit
- Purpose: Immutable log of all category changes for compliance and troubleshooting
- Fields: audit_id (UUID primary key), operation (INSERT/UPDATE/DELETE), category_id (UUID of affected category), timestamp (TIMESTAMPTZ of change), user_id (UUID of user), old_data (JSONB of previous values), new_data (JSONB of new values), changed_fields (ARRAY of modified field names), ip_address (VARCHAR), session_id (UUID)
- Retention: 7 years minimum for compliance. Never delete audit logs.
- Performance: Insert-only table (no updates or deletes). Can grow large over time. Consider partitioning by year.

**Use Cases**:
- Compliance and regulatory requirements: Demonstrate complete audit trail for category changes
- Troubleshooting data issues: Identify when and how bad data was introduced
- User accountability: Track which users made which changes to categories
- Security investigation: Detect unauthorized modifications or suspicious activity patterns
- Data recovery: Restore previous category state by reviewing audit log and manually reverting changes
- Change analysis: Analyze frequency and patterns of category modifications

### Data Validation Triggers

**Business Rule Validation**:
- **Purpose**: Enforce complex business rules that cannot be expressed with simple CHECK constraints
- **Trigger Event**: BEFORE INSERT OR UPDATE on categories table
- **Trigger Name**: trigger_validate_categories_business_rules
- **Validation Rules Enforced**:

  **Level-Parent Consistency**:
  - Rule: If level = 1, then parent_id must be NULL (root level categories)
  - Rule: If level = 2, then parent must exist and have type = 'CATEGORY'
  - Rule: If level = 3, then parent must exist and have type = 'SUBCATEGORY'
  - Validation: Query parent record, verify type matches level requirements
  - Error: "Level 2 categories must have CATEGORY parent" if violation detected

  **Circular Reference Prevention**:
  - Rule: Category cannot be its own ancestor in parent chain
  - Validation: Recursive query traversing parent_id chain upward to root, verify new parent not in current category's descendant tree
  - Error: "Circular reference detected. Cannot set category as its own ancestor"

  **Hierarchy Depth Limit**:
  - Rule: Maximum 3 levels in hierarchy (enforced by level constraint and parent type validation)
  - Validation: Verify level does not exceed 3, verify parent level is compatible (parent.level + 1 = child.level)
  - Error: "Maximum hierarchy depth is 3 levels"

  **Name Uniqueness Within Parent**:
  - Rule: Name must be unique among siblings (case-insensitive)
  - Validation: Query for existing sibling with same name (UPPER comparison), excluding current record and soft-deleted records
  - Error: "Category name 'Coffee Beans' already exists under this parent"

**Error Handling**:
- Trigger raises EXCEPTION with meaningful error message when validation fails
- Transaction is automatically rolled back (changes not saved)
- Application receives error message to display to user
- User can correct validation error and resubmit

### Cascade Operations

**Soft Delete Cascade**:
- **Purpose**: When parent category is soft-deleted, automatically soft-delete all child categories to maintain logical consistency
- **Trigger Event**: AFTER UPDATE on categories table (fires when deleted_at column changes from NULL to timestamp)
- **Trigger Name**: trigger_cascade_soft_delete_categories
- **Behavior**:
  - Detects when deleted_at is set (soft delete operation)
  - Queries for all child categories (WHERE parent_id = deleted_category_id)
  - Updates all children to set deleted_at = same timestamp and deleted_by = same user
  - Recursively cascades to grandchildren and great-grandchildren
- **Benefits**: Maintains referential integrity with soft deletes. Prevents orphaned categories in UI. Ensures entire subtree is logically deleted together.
- **Example**: Soft-deleting "Raw Materials" category automatically soft-deletes "Coffee Beans", "Dairy Products", and all their child item groups.

**Item Count Updates**:
- **Purpose**: Automatically update item count fields when products are added, removed, or reassigned to categories
- **Trigger Event**: AFTER INSERT OR UPDATE OR DELETE on products table (when category_id changes)
- **Trigger Name**: trigger_update_category_item_counts
- **Behavior**:
  - When product created: Increment item count for assigned category and all ancestors
  - When product deleted: Decrement item count for previous category and all ancestors
  - When product reassigned: Decrement count for old category, increment count for new category, update all ancestor counts
  - Uses recursive query to update entire parent chain to root level
- **Performance**: For large product catalogs, consider using materialized view refreshed periodically instead of real-time triggers to avoid performance bottleneck.

### Computed Fields

**Path Calculation Trigger**:
- **Purpose**: Automatically calculate full breadcrumb path from root to current category
- **Trigger Event**: BEFORE INSERT OR UPDATE on categories table (when name or parent_id changes)
- **Trigger Name**: trigger_calculate_category_path
- **Computation Logic**:
  - If parent_id is NULL: path = name (root category)
  - If parent_id exists: path = parent.path + ' > ' + name
  - Recursively builds path by traversing parent chain upward to root
- **Behavior**: Function queries parent record, retrieves its path, concatenates with current name using " > " separator
- **Benefits**: Pre-calculated paths eliminate need for recursive queries during display. Improves performance for breadcrumb display and path-based searches.
- **Example**: Category "Arabica" with parent "Coffee Beans" and grandparent "Raw Materials" gets path "Raw Materials > Coffee Beans > Arabica"

**Level Calculation Trigger**:
- **Purpose**: Automatically calculate level field based on parent relationship
- **Trigger Event**: BEFORE INSERT OR UPDATE on categories table (when parent_id changes)
- **Trigger Name**: trigger_calculate_category_level
- **Computation Logic**:
  - If parent_id is NULL: level = 1 (root category)
  - If parent_id exists: level = parent.level + 1
- **Behavior**: Function queries parent record, retrieves its level, adds 1 for current category level
- **Benefits**: Denormalized level field enables fast filtering by depth without recursive queries. Essential for hierarchy depth validation.

### Notification Triggers

**Event Notification** (Optional, for future implementation):
- **Purpose**: Notify external systems or queue background jobs when category changes occur
- **Trigger Event**: AFTER INSERT OR UPDATE OR DELETE on categories table
- **Trigger Name**: trigger_notify_category_changes
- **Mechanism**: PostgreSQL NOTIFY/LISTEN or message queue integration (RabbitMQ, Redis Pub/Sub)
- **Use Cases**:
  - Send notification when new category created (notify administrators)
  - Queue email when category hierarchy significantly reorganized
  - Trigger search index update when category name/description changes
  - Invalidate application cache when category data modified
  - Update reporting dashboards with new category structure
- **Payload**: JSON object containing: operation type, category ID, timestamp, user ID, summary of changes
- **Performance**: Asynchronous notifications do not block database operations. Trigger fires event but does not wait for processing.

---

## Performance Considerations

### Query Performance Targets

**Response Time Objectives**: Performance targets for various category operations to ensure responsive user experience.

**Simple Queries** (single record by ID): < 10ms
- Operation: SELECT * FROM categories WHERE id = {uuid} AND deleted_at IS NULL
- Target: Sub-10 millisecond response time
- Optimization: Primary key index enables O(log n) lookup, typically 5-8ms on modern hardware
- Use case: Load category details when user clicks tree node or list row

**List Queries** (filtered, sorted, paginated): < 100ms
- Operation: SELECT with WHERE filters, ORDER BY sort_order, LIMIT/OFFSET for pagination
- Target: Sub-100 millisecond response time for full page load
- Optimization: Composite indexes (parent_id, sort_order), partial indexes (deleted_at IS NULL)
- Use case: Load category list page, expand tree node showing children
- Typical result set: 20-50 categories per query

**Hierarchy Queries** (load full tree with counts): < 200ms
- Operation: Recursive CTE traversing parent_id relationships, joining with product counts
- Target: Sub-200 millisecond response time for complete tree structure
- Optimization: Recursive query with parent_id index, materialized view for pre-calculated counts
- Use case: Initial page load displaying entire category tree with item counts
- Typical result set: 100-500 categories (full tree)

**Complex Queries** (joins, aggregations, calculations): < 500ms
- Operation: Multi-table joins with products, users; GROUP BY aggregations; recursive count calculations
- Target: Sub-500 millisecond response time for reporting queries
- Optimization: Appropriate indexes, query plan optimization, consider caching frequent queries
- Use case: Category-based reports, analytics dashboards, item count summaries

**Reports and Analytics**: < 5 seconds
- Operation: Complex aggregations across categories, products, purchase orders, inventory transactions
- Target: Sub-5 second response time for comprehensive reports
- Optimization: Use read replicas, materialized views, pre-aggregated summary tables, scheduled report generation
- Use case: Monthly spend by category report, inventory valuation by category, purchasing analytics

**Batch Operations** (1000 records): < 10 seconds
- Operation: Bulk insert, update, or delete operations on large record sets
- Target: Process 1000 records in under 10 seconds (100 records/second throughput)
- Optimization: Batch inserts in single transaction, disable triggers temporarily for imports, use COPY command for large imports
- Use case: Initial category import from legacy system, bulk taxonomy reorganization

**Achieving Targets**: Methods to meet or exceed performance targets.
- Proper indexing on frequently queried columns (id, parent_id, type, is_active, deleted_at)
- Query optimization using EXPLAIN ANALYZE to identify slow operations
- Connection pooling to manage database connections efficiently (10-50 connection pool)
- Read replicas for reporting and analytics to offload primary database
- Caching frequently accessed data in application layer (Redis, Memcached) with 5-60 minute TTL
- Materialized views for expensive aggregations like item counts, refreshed every 5 minutes
- Partial indexes to reduce index size and improve query performance on active records

### Table Size Projections

**Size Estimation Methodology**: Based on typical hospitality ERP deployment patterns and field sizes.

| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Initial Setup | 50-100 | 250 KB | Basic category structure during implementation |
| Month 3 | 150 | 750 KB | Expanded taxonomy as product catalog grows |
| Year 1 | 200-300 | 1.5 MB | Mature taxonomy for single-property operation |
| Year 3 | 400-600 | 3 MB | Multi-property with standardized taxonomy |
| Year 5 | 600-800 | 4 MB | Mature multi-property with full product coverage |
| Maximum Supported | 1000 | 5 MB | System designed to handle up to 1000 categories efficiently |

**Sizing Assumptions**:
- Average row size: ~5 KB per category record (includes all fields, UUIDs, varchar data, indexes overhead)
- Growth rate: 10-20 new categories per month during first year, 5-10 per month thereafter (slowing growth as taxonomy matures)
- Archival: Soft-deleted categories retained indefinitely (not archived). Minimal impact as deletions are rare (<1% annually).
- Retention: All category records kept forever for audit trail and referential integrity. No purging policy.
- Index overhead: Approximately 50-70% of table size for all indexes combined (7-12 indexes on table)

**Storage Planning**: Recommendations for database storage capacity.
- Primary tables: Active categories data relatively small (< 10 MB for 1000 categories)
- Indexes: Approximately 60% of table size (3-6 MB for 1000 categories with full indexing)
- Audit tables: categories_audit grows continuously with every modification. Plan 10-100 MB per year depending on change frequency.
- Total with overhead: Plan for 3x estimated size to account for indexes, audit logs, database overhead, and future growth
- Storage requirements: 50 MB minimum allocation for categories sub-module (table + indexes + audit logs for 5 years)

### Optimization Techniques

**Query Optimization**:
- Use EXPLAIN ANALYZE to understand query execution plans and identify bottlenecks
- Identify slow queries from PostgreSQL slow query log (queries > 500ms)
- Add indexes for frequently accessed columns with high query usage (> 10% of queries use column in WHERE)
- Optimize JOIN order and conditions to reduce intermediate result sets
- Use appropriate WHERE clause filtering to minimize rows scanned (WHERE deleted_at IS NULL, WHERE is_active = true)
- Limit result sets with LIMIT and OFFSET for pagination (avoid loading entire table)
- Rewrite recursive queries as iterative when possible to reduce function call overhead

**Indexing Best Practices**:
- Index foreign keys used in JOINs (parent_id for hierarchy queries, created_by/updated_by for audit queries)
- Index columns in WHERE clauses with high selectivity (parent_id, type, is_active - frequently filtered fields)
- Index columns in ORDER BY to eliminate sort operations (sort_order, name, created_at for sorted results)
- Use composite indexes for multi-column queries (parent_id + sort_order together, is_active + deleted_at + name for filtered lists)
- Create partial indexes for filtered queries (WHERE deleted_at IS NULL) to reduce index size by 20-40%
- Monitor and remove unused indexes (query pg_stat_user_indexes.idx_scan = 0 monthly, drop indices with zero usage)

**Caching Strategy**:
- Cache frequently accessed, rarely changed data (entire category tree structure)
- Use in-memory cache (Redis, Memcached) for hot data
- Cache at application level with React Query (5-minute stale-while-revalidate)
- Invalidate cache on data changes (after create, update, delete operations)
- Typical cache TTL: 5-60 minutes depending on data volatility
- Cache keys: ['categories', 'tree'] for full tree, ['categories', categoryId] for individual categories
- Cache warming: Pre-load category tree on application startup for immediate availability

**Materialized Views**: (for expensive aggregations)
- View: v_category_counts - Pre-calculates direct and nested product counts for each category
- Purpose: Eliminate recursive COUNT queries during tree display (recursive count calculation is expensive O(n*m) where n=categories, m=products)
- Refresh strategy: Refresh every 5 minutes via scheduled job (REFRESH MATERIALIZED VIEW CONCURRENTLY)
- Benefit: Item count queries become O(1) lookups instead of recursive traversals
- Use case: Display item counts in tree view and list view without real-time calculation overhead

**Connection Pooling**:
- Limit concurrent database connections (prevents connection exhaustion)
- Reuse connections across requests (reduces connection overhead)
- Typical pool size: 10-50 connections for web application (depends on concurrent users and query patterns)
- Prevents connection exhaustion under high load (database max_connections limit typically 100-200)
- Connection pool configuration: Supabase handles automatically, application uses connection pool via SDK

**Batch Operations**:
- Group multiple INSERTs into single transaction (reduces transaction overhead from N to 1)
- Use bulk UPDATE where possible (UPDATE with multiple IDs in WHERE clause)
- Process large datasets in chunks (process 100-500 records per batch to avoid long-running transactions)
- Avoid row-by-row processing in application (use SET-based operations in database)
- Use COPY command for large imports (10-100x faster than individual INSERTs)

---

## Data Archival Strategy

**Archival Policy**: Categories are NOT archived. All category records retained indefinitely in primary table.

**Retention Periods**:
- **Active Data**: All non-deleted categories remain in primary categories table forever
- **Soft-Deleted Data**: Soft-deleted categories (deleted_at IS NOT NULL) remain in primary table forever for audit trail
- **Audit Data**: categories_audit table retained for 7 years minimum (compliance requirement), potentially longer for historical analysis
- **No Purging**: Categories are never physically deleted or moved to archive tables

**Rationale for No Archival**:
- Small data volume: Even with 1000 categories, table size is only ~5 MB (including indexes). No storage pressure requiring archival.
- Referential integrity: Products may reference old categories. Moving categories to archive would require complex foreign key management.
- Audit requirements: Complete history of category structure needed for reporting and compliance. Archival would complicate historical queries.
- Query simplicity: Keeping all data in one table simplifies queries. No need for UNION queries across primary and archive tables.
- Soft delete sufficient: Soft delete pattern (deleted_at timestamp) provides logical separation of active vs deleted data without physical archival.

**Alternative Approach for Future**: If categories table grows beyond manageable size (> 10,000 records, unlikely in hospitality ERP):
- Partition table by year of creation (partition by RANGE on created_at)
- Older partitions can be stored on slower, cheaper storage tiers
- Query performance maintained because partitions are transparent to application
- All data remains in single logical table (categories) with automatic partition routing

**Audit Table Management**: Only audit table (categories_audit) may require archival due to continuous growth.

**Audit Archival Strategy**:
- Retention: 7 years minimum (compliance), potentially longer for analysis
- Archival frequency: Annual archival of records older than 7 years
- Archive location: Separate archive database or cold storage (AWS S3, Azure Blob Storage)
- Query access: Archived audit data accessible via archive queries for historical investigations
- Primary table: Keep 7 years of audit data in primary categories_audit table for fast access

---

## Security Considerations

### Row-Level Security (RLS)

**Purpose**: Control which rows users can see and modify based on their role, department, and ownership.

**Implementation Status**: Row-Level Security policies are described here conceptually but implementation depends on Supabase RLS configuration.

**Policy Types**:
- **Read Policies**: Control which rows users can SELECT (view in UI)
- **Write Policies**: Control which rows users can INSERT/UPDATE/DELETE (modify data)
- **Role-Based**: Different policies for different user roles (Staff, Product Manager, Admin)
- **Department Isolation**: Users only see categories relevant to their department (if categories are department-specific in future)

**Example Policies** (Conceptual Description):

**All Users Can Read Active Categories**:
- Policy name: policy_categories_read_all
- Users: All authenticated users
- Rule: Allow SELECT on categories WHERE deleted_at IS NULL (active categories only)
- Purpose: All users can view active category structure for product browsing and assignment

**Product Managers Can Create Categories**:
- Policy name: policy_categories_create_product_manager
- Users: Users with role 'Product Manager' or 'System Administrator'
- Rule: Allow INSERT on categories WHERE user has Product Manager role
- Purpose: Limit category creation to authorized users. Regular staff cannot create new categories.

**Product Managers Can Edit Categories**:
- Policy name: policy_categories_update_product_manager
- Users: Users with role 'Product Manager' or 'System Administrator'
- Rule: Allow UPDATE on categories WHERE user has Product Manager role AND deleted_at IS NULL
- Purpose: Limit category modifications to authorized users. Cannot modify soft-deleted categories.

**Admins Can Delete Categories**:
- Policy name: policy_categories_delete_admin
- Users: Users with role 'System Administrator' only
- Rule: Allow UPDATE on categories SET deleted_at = NOW() WHERE user has Admin role
- Purpose: Deletion requires highest privilege level. Product Managers can only deactivate, not delete.

**Admin Override**:
- All policies: System Administrators bypass RLS policies via USING (current_user_role = 'System Administrator')
- Purpose: Full system access for troubleshooting, data fixes, emergency operations
- Security: Admin role assigned rarely and audited carefully

### Column-Level Security

**Purpose**: Hide sensitive columns from unauthorized users, even if they can read the row.

**Sensitive Data Columns**: Categories table has minimal sensitive data. All fields generally visible to users with read access.

**Future Considerations** (if categories extended with sensitive fields):
- Cost or margin data: Grant SELECT only to financial managers
- Department restrictions: Hide internal classification fields from external users
- Custom JSONB metadata: Filter sensitive JSON keys based on user role

**Access Control**: Supabase RLS policies can include column-level restrictions through custom functions or views.

**Example Permissions** (Conceptual):
```
Grant regular users SELECT on: id, name, description, type, parent_id, level, is_active
Grant financial managers additional SELECT on: cost_center_code, budget_category (if added)
Grant admins full SELECT on all columns including audit fields
```

### Data Encryption

**Encryption At Rest**:
- Implementation: Supabase database storage encrypted at rest using industry-standard encryption
- Method: Transparent Data Encryption (TDE) - automatic encrypt on write, decrypt on read
- Key management: Encryption keys managed by Supabase/AWS infrastructure (not application responsibility)
- Compliance: Meets PCI-DSS, SOC 2, ISO 27001 encryption requirements
- Performance: Negligible overhead (encryption handled at storage layer)

**Encryption In Transit**:
- Protocol: SSL/TLS 1.2+ for all database connections (HTTPS for API, encrypted PostgreSQL connection)
- Certificate: Valid SSL certificate issued by trusted Certificate Authority
- Connection string: Database URLs enforce SSL mode (sslmode=require in connection parameters)
- No plaintext: All data transmitted between application and database is encrypted

**Column-Level Encryption** (Not currently implemented, but available if needed):
- Technology: PostgreSQL pgcrypto extension for column-level encryption
- Use case: Extremely sensitive fields requiring additional encryption layer beyond database encryption
- Key management: Application manages encryption keys (stored in secure key vault like AWS KMS, Hashicorp Vault)
- Process: Encrypt before INSERT, decrypt after SELECT in application layer
- Performance: Additional overhead (1-5ms per encryption/decryption operation)

**Encryption Key Management**:
- Separation: Encryption keys stored separately from encrypted data (keys in key management service, data in database)
- Rotation: Regular key rotation policy (annual rotation for high-security requirements)
- Access: Multi-factor authentication required for key access
- Backup: Keys backed up securely with same or higher protection than primary keys

### Access Control

**Database Users and Roles**: PostgreSQL roles configured with principle of least privilege.

**Database Role Structure**:
- **app_read_only**: SELECT privileges only
  - Purpose: Application read operations, reporting queries, data exports
  - Permissions: SELECT on all tables and views
  - No write access: Cannot INSERT, UPDATE, DELETE

- **app_read_write**: SELECT, INSERT, UPDATE (no DELETE)
  - Purpose: Application write operations for normal business processes
  - Permissions: SELECT, INSERT, UPDATE on categories table
  - Soft delete only: Can UPDATE deleted_at but cannot use DELETE command

- **app_admin**: Full access including DELETE
  - Purpose: Administrative operations, data maintenance, emergency fixes
  - Permissions: ALL privileges on categories table including physical DELETE
  - Usage: Rare, logged, audited

- **reporting_user**: SELECT on views and archive tables
  - Purpose: Business intelligence, reporting, analytics tools
  - Permissions: SELECT on materialized views, audit tables, no write access
  - No PII access: May have restrictions on audit fields with user IDs

**Authentication**:
- Method: Supabase Auth provides authentication services (email/password, OAuth, magic links)
- Password policy: Minimum 12 characters, complexity requirements (uppercase, lowercase, number, special character)
- MFA: Multi-factor authentication required for admin access (TOTP, SMS, or hardware token)
- Service accounts: Separate credentials for application vs human administrators
- Rotation: Human passwords rotated every 90 days, service account keys rotated annually

**Authorization**:
- Principle: Least privilege - grant minimum necessary permissions for role requirements
- Review: Regular access reviews and audits (quarterly for admins, annually for all users)
- Revocation: Revoke access immediately when no longer needed (employee termination, role change)
- Separation: Separate roles for different environments (dev, staging, production)

**Audit Trail**:
- Access logging: All database connections logged with timestamp, user, IP address, query
- Failed attempts: Track failed login attempts, alert on suspicious patterns (5 failures in 10 minutes)
- Monitoring: Real-time monitoring of database activity, alert on anomalies
- Security violations: Alert on unauthorized access attempts, privilege escalation attempts, suspicious queries

---

## Backup and Recovery

### Backup Strategy

**Full Backups**:
- **Frequency**: Daily at 2 AM UTC (off-peak hours, minimal user activity)
- **Retention**: 30 days online (fast restore), 90 days in cold storage (compliance)
- **Method**: Supabase automated daily snapshots or PostgreSQL pg_dump
- **Location**: Off-site cloud storage in separate region from primary database (disaster recovery)
- **Size**: Full database backup including categories table ~5 MB, grows with audit table
- **Encryption**: Backups encrypted at rest and in transit (same as primary database)

**Incremental Backups**:
- **Frequency**: Every 4 hours (6 backups per day)
- **Retention**: 7 days (168 hours of incremental history)
- **Method**: PostgreSQL Write-Ahead Log (WAL) archiving
- **Purpose**: Minimize data loss window (maximum 4 hours data loss in catastrophic failure)
- **Size**: Incrementals typically 10-50 MB depending on transaction volume

**Continuous Archiving**:
- **Method**: WAL streaming to backup server (real-time replication)
- **Purpose**: Near-zero Recovery Point Objective (RPO < 1 minute)
- **Benefit**: Point-in-time recovery capability (restore to any second within retention period)
- **Implementation**: Supabase provides continuous WAL archiving automatically

**Backup Verification**:
- **Weekly restore test**: Automated restore of backup to staging environment, verify data integrity
- **Health checks**: Automated backup success monitoring, alert on failures within 1 hour
- **Alert on failure**: Email and SMS notifications to database administrators on backup failures
- **Documentation**: Restore procedures documented and tested quarterly

### Backup Contents

**Included in Backup**:
- All database tables (categories, products, audit tables - structure and data)
- Indexes and constraints (primary keys, foreign keys, check constraints, unique constraints)
- Views and materialized views (v_category_counts, v_category_tree)
- Stored procedures and functions (triggers, validation functions, automation logic)
- User roles and permissions (database roles, row-level security policies)
- Database configuration (PostgreSQL settings, performance tuning parameters)

**Excluded from Backup** (stored separately):
- Large binary files (product images, documents - stored in object storage like S3)
- Temporary tables (session tables, cache tables)
- Cache tables (application-level caching, automatically repopulated)
- Log tables with short retention (application logs, temporary debug logs)

### Recovery Procedures

**Point-in-Time Recovery** (PITR):
- **Process**: Restore from full backup, replay WAL logs to specific timestamp
- **Use case**: Recover from accidental data deletion or erroneous update at known time
- **Recovery Time Objective (RTO)**: < 4 hours (time to restore full backup + replay WAL)
- **Recovery Point Objective (RPO)**: < 4 hours (maximum data loss = time since last incremental backup)
- **Steps**: 1) Stop application. 2) Restore full backup to staging. 3) Replay WAL to target timestamp. 4) Verify data. 5) Switch to recovered database. 6) Resume application.

**Full Database Restore**:
- **Process**: Restore entire database from latest full backup
- **Use case**: Complete database corruption, hardware failure, data center disaster
- **RTO**: < 8 hours (includes backup retrieval, restore, verification, switchover)
- **Steps**: 1) Provision new database server. 2) Retrieve latest backup from storage. 3) Restore backup. 4) Apply incremental backups. 5) Verify integrity. 6) Update connection strings. 7) Resume application.

**Table-Level Recovery**:
- **Process**: Restore specific table (categories) from backup to staging, copy needed data back to production
- **Use case**: Recover accidentally deleted categories, restore corrupted category records
- **RTO**: < 2 hours (faster than full restore, only affects categories table)
- **Steps**: 1) Restore categories table to staging database. 2) Query staging for missing/corrupted records. 3) INSERT missing records into production. 4) Verify data integrity and referential integrity. 5) Clear application cache.

**Disaster Recovery**:
- **Process**: Failover to backup region/server (automated or manual)
- **Automated triggers**: Primary datacenter unreachable for > 5 minutes, health checks failing
- **Use case**: Primary datacenter failure, regional outage, catastrophic hardware failure
- **RTO**: < 1 hour (time to detect failure + failover + verification)
- **Steps**: 1) Detect primary failure. 2) Promote read replica to primary. 3) Update DNS/load balancer. 4) Verify application functionality. 5) Notify users of service restoration.

### Backup Retention Policy

**Retention Schedule**: Balanced approach providing recovery options while managing storage costs.

- **Daily backups**: Keep for 30 days (1 month of daily recovery points)
  - Storage: Hot storage (SSD) for fast restore
  - Use case: Recent accidental changes, short-term recovery needs

- **Weekly backups**: Keep for 90 days (13 weeks)
  - Storage: Warm storage (standard HDD) for balance of cost and performance
  - Use case: Recover from issues discovered weeks later

- **Monthly backups**: Keep for 1 year (12 months)
  - Storage: Warm storage with compression
  - Use case: Annual recovery needs, quarterly audit requirements

- **Yearly backups**: Keep for 7 years (compliance requirement)
  - Storage: Cold storage (AWS Glacier, Azure Archive) for long-term retention at low cost
  - Use case: Regulatory compliance (SOX, GDPR), legal holds, historical analysis

**Storage Optimization**:
- **Compression**: Compress old backups (6 months+) to reduce storage costs by 50-70%
- **Tiering**: Automatically move backups to cheaper storage tiers over time (hot → warm → cold)
- **Deletion**: Automatically delete expired backups per retention policy (no manual intervention)
- **Monitoring**: Track storage costs, optimize retention policy if costs exceed budget

---

## Data Migration

### Version 1.0.0 - Initial Schema

**Migration Metadata**:
- **Migration File**: 001_create_categories_table.sql (conceptual, not actual SQL code)
- **Date**: 2024-01-10
- **Author**: Database Team
- **Purpose**: Initial database schema creation for Categories sub-module

**Migration Steps** (Description in Text):
1. Create categories table with all columns (id, name, description, type, parent_id, level, sort_order, path, is_active, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by) and appropriate data types (UUID, VARCHAR, TEXT, INTEGER, BOOLEAN, TIMESTAMPTZ)
2. Create primary key constraint on id column (ensures uniqueness and creates automatic index)
3. Create foreign key constraint on parent_id referencing categories.id with ON DELETE RESTRICT (prevents deleting parent with children)
4. Create foreign key constraints on created_by, updated_by, deleted_by referencing users.id with ON DELETE SET NULL (preserve audit trail)
5. Create unique constraint on (UPPER(name), parent_id) WHERE deleted_at IS NULL (case-insensitive unique names within parent, excluding soft-deleted)
6. Create check constraints: type IN ('CATEGORY', 'SUBCATEGORY', 'ITEM_GROUP'), level IN (1, 2, 3), sort_order >= 0, LENGTH(TRIM(name)) BETWEEN 1 AND 100
7. Create indexes: parent_id (B-tree), type (B-tree), is_active (B-tree), (parent_id, sort_order) composite (B-tree), deleted_at IS NULL partial index
8. Create triggers: trigger_update_categories_updated_at (auto-update updated_at), trigger_calculate_category_path (auto-calculate path field), trigger_validate_categories_business_rules (validate hierarchy rules)
9. Insert seed/reference data: Initial root categories ("Raw Materials", "Beverages", "Consumables", "Non-Consumables") with appropriate levels, types, and default sort orders
10. Set up row-level security policies via Supabase dashboard (policy_categories_read_all for all users, policy_categories_write_product_manager for create/edit)
11. Grant permissions to database roles: app_read_only gets SELECT, app_read_write gets SELECT/INSERT/UPDATE, app_admin gets ALL

**Data Included**:
- Table structure with all fields and data types
- All constraints (primary key, foreign keys, unique, check)
- All indexes for query performance
- All triggers for automation and validation
- Initial reference data (4 root categories for standard taxonomy)
- No sample products or detailed subcategories (added by users during setup)

**Verification**:
- Verify table structure matches specification: SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'categories'
- Test constraints work as expected: Attempt to insert invalid data (level 4, circular parent, duplicate name) and verify errors
- Validate triggers fire properly: Insert test category, verify created_at set, path calculated, updated_at updates on modification
- Confirm indexes created: Query pg_indexes table for categories table, verify all specified indexes exist
- Test seed data inserted successfully: SELECT * FROM categories WHERE parent_id IS NULL (should return 4 root categories)

**Rollback Plan**:
- Drop triggers: DROP TRIGGER trigger_update_categories_updated_at, trigger_calculate_category_path, trigger_validate_categories_business_rules
- Drop indexes: DROP INDEX idx_categories_parent_id, idx_categories_type, etc.
- Drop table: DROP TABLE categories CASCADE (CASCADE removes dependent objects like foreign key constraints in other tables)
- Verify clean rollback: SELECT * FROM categories (should error "table does not exist")

---

### Version 1.1.0 - Add Metadata Field (Future Enhancement)

**Migration Metadata**:
- **Migration File**: 002_add_metadata_to_categories.sql
- **Date**: TBD (future enhancement)
- **Author**: Database Team
- **Purpose**: Add JSONB metadata field for flexible category attributes

**Migration Steps** (Description):
1. Add metadata column as NULLABLE initially: ALTER TABLE categories ADD COLUMN metadata JSONB DEFAULT '{}'
2. Backfill existing records with empty JSON object: UPDATE categories SET metadata = '{}' WHERE metadata IS NULL
3. Create GIN index on metadata column for JSON queries: CREATE INDEX idx_categories_metadata ON categories USING GIN (metadata)
4. No NOT NULL constraint (metadata remains optional, defaults to empty object)
5. Update validation triggers if needed to validate metadata structure
6. Grant SELECT permission on new column to existing roles
7. Document metadata schema and usage in separate schema registry

**Example Metadata Fields** (Conceptual):
- color_code: Hex color for category color coding in UI (#FF5733)
- icon: Icon identifier for category visual representation ("coffee-beans")
- department_restrictions: Array of department IDs allowed to use this category
- budget_category: Account code for financial categorization
- custom_attributes: Nested JSON for organization-specific fields

**Backfill Strategy**:
- Set default empty JSON object '{}' for all existing records (no data loss)
- No calculation needed (metadata starts empty, populated by users over time)
- Backfill executes instantly (simple UPDATE with constant value)

**Verification**:
- Check column exists: SELECT column_name FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'metadata'
- Verify backfill completed: SELECT COUNT(*) FROM categories WHERE metadata = '{}'
- Test JSON queries: SELECT * FROM categories WHERE metadata->>'color_code' = '#FF5733'
- Confirm GIN index created: SELECT indexname FROM pg_indexes WHERE tablename = 'categories' AND indexname LIKE '%metadata%'

**Rollback Plan**:
- Drop GIN index: DROP INDEX idx_categories_metadata
- Drop metadata column: ALTER TABLE categories DROP COLUMN metadata
- Verify rollback: SELECT column_name FROM information_schema.columns WHERE table_name = 'categories' (metadata should not appear)

---

## Data Quality

### Data Quality Dimensions

**Completeness**: All required fields populated, no unexpected NULL values.
- Measurement: % of records with all required fields complete (id, name, type, level, is_active, audit fields)
- Target: 100% completeness (NOT NULL constraints enforce this)
- Validation: SELECT COUNT(*) FROM categories WHERE name IS NULL OR type IS NULL OR level IS NULL (should return 0)

**Accuracy**: Data matches source system or real-world truth. Fields contain correct, valid values.
- Measurement: % of records passing validation rules (type in allowed values, level 1-3, name within length, sort_order non-negative)
- Target: 100% accuracy (check constraints enforce this)
- Validation: Manual review of sample records, compare category names against physical product classifications

**Consistency**: Related data is consistent across tables and within hierarchy relationships.
- Measurement: % of records passing consistency checks (parent-child type compatibility, level matches parent relationship, path reflects actual hierarchy)
- Target: 100% consistency (foreign keys and triggers enforce this)
- Validation: SELECT categories with parent type incompatible with child level, verify 0 results

**Validity**: Data conforms to business rules and format requirements.
- Measurement: % of records passing validation rules (name format, no circular references, hierarchy depth limit)
- Target: 100% validity (application validation and database triggers enforce this)
- Validation: Attempt to insert invalid data and verify rejection

**Timeliness**: Data updated within SLA. Audit timestamps reflect actual changes.
- Measurement: Average lag between event and data update (in this case, immediate)
- Target: < 1 second lag (database operations are real-time)
- Validation: Verify updated_at timestamp changes after UPDATE, created_at set accurately on INSERT

**Uniqueness**: No duplicate records. Business keys are unique within constraints.
- Measurement: % of records with unique business keys (name unique within parent, id globally unique)
- Target: 100% uniqueness (unique constraints enforce this)
- Validation: SELECT name, parent_id, COUNT(*) FROM categories WHERE deleted_at IS NULL GROUP BY name, parent_id HAVING COUNT(*) > 1 (should return 0 rows)

### Data Quality Checks

**Automated Quality Checks**: Run daily via scheduled database job or weekly manual review.

**Check for Orphaned Categories** (Invalid Parent References):
```
Purpose: Find child categories with non-existent parent (referential integrity violation)
Query Logic: SELECT * FROM categories WHERE parent_id IS NOT NULL AND parent_id NOT IN (SELECT id FROM categories)
Expected Result: 0 orphaned categories (foreign key constraint should prevent this)
Action: If found (should never happen), investigate constraint failure, reassign children to valid parent or set parent_id NULL for temporary fix
```

**Check for Invalid Type Values**:
```
Purpose: Ensure type field contains only allowed values
Query Logic: SELECT * FROM categories WHERE type NOT IN ('CATEGORY', 'SUBCATEGORY', 'ITEM_GROUP') AND deleted_at IS NULL
Expected Result: 0 invalid types (check constraint should prevent this)
Action: If found (should never happen), investigate constraint failure, correct type values to match level
```

**Check for Invalid Hierarchy Levels**:
```
Purpose: Verify level field contains only 1, 2, or 3
Query Logic: SELECT * FROM categories WHERE level NOT IN (1, 2, 3) AND deleted_at IS NULL
Expected Result: 0 invalid levels (check constraint should prevent this)
Action: If found, investigate constraint failure, recalculate level based on parent chain
```

**Check for Level-Parent Inconsistency**:
```
Purpose: Verify level matches parent relationship (level 1 has no parent, level 2 has category parent, level 3 has subcategory parent)
Query Logic: SELECT child.*, parent.type AS parent_type FROM categories child LEFT JOIN categories parent ON child.parent_id = parent.id WHERE (child.level = 1 AND child.parent_id IS NOT NULL) OR (child.level = 2 AND parent.type != 'CATEGORY') OR (child.level = 3 AND parent.type != 'SUBCATEGORY')
Expected Result: 0 inconsistent records (trigger validation should prevent this)
Action: If found, recalculate level or reassign parent to fix inconsistency
```

**Check for Duplicate Names Within Parent**:
```
Purpose: Ensure unique sibling names (case-insensitive)
Query Logic: SELECT parent_id, UPPER(name), COUNT(*) FROM categories WHERE deleted_at IS NULL GROUP BY parent_id, UPPER(name) HAVING COUNT(*) > 1
Expected Result: 0 duplicates (unique constraint should prevent this)
Action: If found, rename duplicates or investigate how constraint was bypassed
```

**Check for Circular References**:
```
Purpose: Find categories that are their own ancestors (circular parent chain)
Query Logic: Recursive CTE traversing parent_id upward, detecting if original category appears in ancestor chain
Expected Result: 0 circular references (trigger validation should prevent this)
Action: If found, break circular chain by setting one parent_id to NULL or valid non-circular parent
```

**Check for Path Calculation Accuracy**:
```
Purpose: Verify path field matches actual hierarchy traversal
Query Logic: Calculate expected path by traversing parent chain, compare to stored path field
Expected Result: 100% match (trigger should maintain path accurately)
Action: If mismatches found, recalculate paths by traversing hierarchy and updating path fields
```

**Check for Item Count Accuracy** (Future, after implementing count fields):
```
Purpose: Verify pre-calculated item counts match actual product counts
Query Logic: Compare stored item_count and total_item_count with real-time COUNT queries on products table
Expected Result: 100% match (triggers should maintain counts accurately)
Action: If mismatches found, recalculate counts by querying products and updating category records
```

### Data Quality Monitoring

**Quality Metrics Dashboard**: Real-time or near-real-time monitoring of data quality indicators.

**Metrics Tracked**:
- Completeness score by entity (% records with all required fields)
- Accuracy score by entity (% records passing validation rules)
- Consistency score (% records with valid parent-child relationships)
- Uniqueness violations (count of duplicate business keys)
- Daily quality trend (quality score over time, aim for consistent 100%)
- Top quality issues (most frequent validation failures, ranked by frequency)

**Alerting**:
- **Quality score threshold**: Alert when completeness/accuracy/consistency drops below 98%
- **Critical check failures**: Immediate alert when any critical quality check fails (orphaned categories, circular references)
- **Data volume anomalies**: Alert on unusual data volume (> 50 categories created in one day, unusual deletion patterns)
- **Unusual patterns**: Alert on suspicious activity (all categories deactivated, mass deletions, repeated validation errors)

**Reporting**:
- **Weekly data quality report**: Automated email to database administrators summarizing quality metrics, issues found, resolution status
- **Monthly quality trends**: Executive dashboard showing quality trends over time, improvement initiatives progress
- **Issue resolution tracking**: Track quality issues from detection through resolution, measure time-to-resolution
- **Root cause analysis**: Monthly review of recurring issues, identify systemic problems, implement preventive measures

---

## Testing Data

### Test Data Requirements

**Test Environments**: Separate test data strategies for each environment based on purpose and sensitivity.

**Development Environment**:
- Data source: Full synthetic test data created via scripts
- Volume: 100-200 categories across 3 levels for realistic testing
- Characteristics: Realistic names, complete hierarchy, all edge cases represented
- Refresh: Monthly or on-demand to incorporate schema changes

**Staging Environment**:
- Data source: Sanitized copy of production data (de-identified)
- Volume: Full production dataset size for realistic performance testing
- Refresh: Weekly copy from production with sanitization applied
- Purpose: Pre-production testing, performance validation, UAT

**Testing Environment**:
- Data source: Mix of synthetic data and sanitized production samples
- Volume: Representative sample (50-100 categories) for functional testing
- Purpose: Automated test execution, manual QA testing, regression testing

**Demo Environment**:
- Data source: Curated realistic data showcasing features
- Volume: 50 categories demonstrating all functionality and use cases
- Characteristics: Hospitality-focused examples (Raw Materials, Beverages, Kitchen Equipment)
- Refresh: As needed for demos, updated when new features added

**Data Sanitization** (for production data copies to non-production environments):
- **Anonymize user references**: Replace created_by/updated_by/deleted_by with generic test user IDs
- **Preserve relationships**: Maintain parent-child relationships and foreign key integrity
- **Mask descriptions**: Redact any proprietary or sensitive information in description fields
- **Preserve structure**: Keep hierarchy structure identical to production for realistic testing
- **Audit timestamps**: Optionally adjust timestamps to recent dates for testing time-based queries

### Test Data Generation

**Synthetic Data Creation**: Two approaches for generating test data.

**Approach 1: Manual Test Records** (for functional testing):
- Create specific test scenarios covering all use cases
- Well-known test data values for predictable testing (e.g., "Test Category 001")
- Edge cases: Empty descriptions, maximum length names, all three levels, single-child hierarchies
- Positive cases: Valid hierarchies, correct parent-child types, unique sibling names
- Negative cases: Duplicate names, circular references, invalid types (for validation testing)

**Approach 2: Generated Test Data** (for volume and performance testing):
- Use database generate_series() function for bulk generation
- Generate 100-1000 records for performance testing
- Randomized values within valid ranges (names from word list, random levels, random parents)
- Automated test data creation via script or migration

**Example Test Data Generation Logic** (Description):
```
Generate 100 Test Categories:

1. Generate 20 root categories (level 1):
   - Name: "Test Category " + series number (001-020)
   - Type: CATEGORY
   - Parent ID: NULL
   - Level: 1
   - Sort Order: Series number
   - Description: "Test category for automated testing"

2. Generate 40 subcategories (level 2):
   - Name: "Test Subcategory " + series number (021-060)
   - Type: SUBCATEGORY
   - Parent ID: Randomly select from root categories (001-020)
   - Level: 2
   - Sort Order: Counter within parent (0, 1, 2...)
   - Description: "Test subcategory under " + parent.name

3. Generate 40 item groups (level 3):
   - Name: "Test Item Group " + series number (061-100)
   - Type: ITEM_GROUP
   - Parent ID: Randomly select from subcategories (021-060)
   - Level: 3
   - Sort Order: Counter within parent
   - Description: "Test item group under " + parent.name

4. Assign audit fields:
   - Created At: Random timestamp within last 30 days
   - Created By: Random test user ID
   - Updated At: Random timestamp after created_at or equal
   - Updated By: Random test user ID
   - Deleted At: NULL (active records)
   - Deleted By: NULL
```

**Realistic Test Data**: Guidelines for creating believable test data.
- Use realistic hospitality names (not generic "Test 1", "Test 2")
  - Good: "Fresh Produce", "Dairy Products", "Cleaning Supplies"
  - Bad: "Category A", "Category B", "Test Category"
- Realistic descriptions (not placeholder lorem ipsum)
- Realistic hierarchies (reflect actual product taxonomy)
- Realistic distributions (more level 2 than level 1, level 3 optional)
- Realistic audit timestamps (spread over time, not all same date)

### Test Scenarios

**Volume Testing**: Validate performance under load.
- Insert 1,000 categories (bulk insert test)
- Load tree view with 1,000 categories (query performance test)
- Test pagination with large datasets (10,000+ total records across modules)
- Calculate item counts recursively with deep hierarchy (performance test)
- Verify query response times meet targets (< 200ms for tree, < 100ms for list)

**Concurrency Testing**: Validate multi-user scenarios.
- Simultaneous INSERT from 5 users (test locking and transaction isolation)
- Concurrent UPDATE to same category from 2 users (optimistic locking test)
- Concurrent reorder operations on same parent (sort_order conflict test)
- Test locking behavior: READ COMMITTED isolation level prevents dirty reads
- Verify no data corruption (all transactions either succeed or roll back cleanly)

**Edge Case Testing**: Test boundary conditions and unusual inputs.
- NULL values in optional fields (description, deleted_at, deleted_by, parent_id for root)
- Minimum and maximum values (name length 1 char, name length 100 chars, sort_order 0, sort_order 999999)
- Boundary conditions (level exactly 3, hierarchy depth exactly 3 levels)
- Empty strings vs NULL (test NOT NULL constraints, ensure empty string rejected)
- Special characters in names (test validation, ensure special chars rejected except space, hyphen, ampersand)
- Unicode characters (test UTF-8 support, emoji in names if allowed)

**Referential Integrity Testing**: Validate foreign key behavior.
- Test CASCADE delete behavior: Not applicable (categories use RESTRICT, not CASCADE)
- Test SET NULL on parent delete: Not applicable for parent_id (RESTRICT), applicable for created_by (audit field)
- Test RESTRICT prevents deletion: Attempt to delete parent with children, verify error
- Verify orphan prevention: Attempt to insert child with non-existent parent_id, verify foreign key violation error

**Constraint Testing**: Validate all constraints enforce rules.
- Test unique constraint violations: Insert duplicate name under same parent, verify unique constraint error
- Test check constraint enforcement: Insert level 4, type 'INVALID', negative sort_order, verify check constraint errors
- Test NOT NULL requirements: Attempt NULL insert for name, type, level, verify NOT NULL constraint errors
- Test default value application: Insert category without specifying sort_order or is_active, verify defaults applied

**Data Quality Testing**: Validate business rules and data integrity.
- Test validation triggers: Attempt circular parent reference, verify trigger rejection
- Test level-parent consistency: Attempt level 2 with item group parent, verify trigger rejection
- Test calculated fields: Verify path auto-calculated from parent chain, level auto-calculated from parent
- Test audit field automation: Verify created_at set on insert, updated_at set on update

### Test Data Cleanup

**Cleanup Strategy**: Remove test data after testing completes.
- Mark test data with identifiable pattern (name starts with "Test ", description contains "test data")
- Separate test department/tenant (if multi-tenant system, use dedicated test tenant)
- Regular cleanup of old test data (delete test records older than 90 days)
- Automated cleanup scripts run weekly or after test suite execution

**Cleanup Query Examples** (Description):
```
Delete test data based on name pattern:
DELETE FROM categories WHERE name LIKE 'Test %' AND description LIKE '%test data%'

Delete test data by test user:
DELETE FROM categories WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%@test.example.com')

Delete test data in test department:
DELETE FROM categories WHERE department_id = {test_department_id}

Soft delete test data (preserve for audit):
UPDATE categories SET deleted_at = NOW(), deleted_by = {admin_user_id} WHERE name LIKE 'Test %'
```

**Cleanup Verification**:
- Count remaining test records: SELECT COUNT(*) FROM categories WHERE name LIKE 'Test %' (should be 0)
- Verify production data unaffected: SELECT COUNT(*) FROM categories WHERE name NOT LIKE 'Test %' (should match expected count)
- Check audit log: Verify test data deletions recorded in categories_audit table

---

## Glossary

**Database Terms**:
- **Primary Key**: Unique identifier for each record in a table. Cannot be null or duplicate. Used for row identification and foreign key references. In categories table, this is the id field (UUID type).
- **Foreign Key**: Column that references the primary key of another table (or same table for self-referencing). Establishes relationships between tables. Enforces referential integrity - cannot reference non-existent record.
- **Index**: Database structure that improves query performance by enabling fast lookups. Similar to book index allowing quick location of information. Trade-off: improves reads but slows writes.
- **Constraint**: Rule enforced by the database to maintain data integrity. Types include PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, NOT NULL. Violations cause errors preventing data corruption.
- **Cascade**: Automatic propagation of changes or deletes to related records. CASCADE deletes children when parent deleted. SET NULL sets foreign key to NULL when parent deleted. RESTRICT prevents deletion if children exist.
- **Transaction**: Group of database operations that succeed or fail together (atomic). Either all operations commit or all rollback. Ensures data consistency across multiple operations.
- **ACID**: Database transaction properties - Atomicity (all-or-nothing), Consistency (valid state to valid state), Isolation (transactions don't interfere), Durability (committed changes persist).

**PostgreSQL-Specific Terms**:
- **UUID**: Universally Unique Identifier. 128-bit value (32 hexadecimal characters) used for primary keys. Format: 550e8400-e29b-41d4-a716-446655440001. Globally unique without coordination.
- **TIMESTAMPTZ**: Timestamp with timezone. Stores UTC time with timezone offset. Automatically converts to user's timezone on display. Example: 2024-01-15T10:30:00Z (Z indicates UTC).
- **JSONB**: Binary JSON storage format. Indexed and queryable. More efficient than plain JSON type. Supports GIN indexes for fast JSON queries. Stores JSON data in decomposed binary format.
- **GIN**: Generalized Inverted Index. Optimized for JSONB and full-text search. Allows fast queries on JSON properties and text search. Larger than B-tree but faster for complex queries.
- **B-tree**: Default index type for efficient equality and range queries. Balanced tree structure enabling O(log n) lookups. Works for =, <, >, <=, >=, BETWEEN operators.
- **Partial Index**: Index with WHERE clause, indexes only subset of rows. Reduces index size and improves performance. Example: WHERE deleted_at IS NULL indexes only active records.
- **RLS**: Row-Level Security. PostgreSQL feature for fine-grained access control. Filters rows based on user identity or role. Enforced at database level, cannot be bypassed by application.
- **WAL**: Write-Ahead Log. Transaction log used for crash recovery and replication. Changes written to WAL before data files. Enables point-in-time recovery and streaming replication.

**Application Terms**:
- **Soft Delete**: Marking record as deleted (deleted_at timestamp) instead of physically removing it. Record remains in database but excluded from queries. Enables recovery and maintains audit trail.
- **Audit Trail**: Historical record of who changed what and when. Includes created_by, created_at, updated_by, updated_at, deleted_by, deleted_at fields. Required for compliance and troubleshooting.
- **Backfill**: Updating existing records with new data after adding a column. Populates newly added field with calculated or default values. Ensures data consistency after schema changes.
- **Migration**: Script to change database schema from one version to another. Includes both upgrade (add features) and rollback (undo changes) logic. Version controlled alongside application code.
- **Seed Data**: Initial reference data inserted during setup. Provides essential baseline data for application operation. Examples: default categories, statuses, system settings.
- **Orphan Record**: Child record with non-existent parent (referential integrity violation). Prevented by foreign key constraints. Example: category with parent_id pointing to deleted parent.

**Business Terms**:
- **Entity**: Business object represented by a database table. Example: Category entity represents product classification nodes.
- **Hierarchy**: Tree structure with parent-child relationships. Categories form 3-level hierarchy: Category → Subcategory → Item Group.
- **Root Node**: Top-level record with no parent (parent_id = NULL). Starting point for hierarchy traversal. Example: "Raw Materials" category.
- **Leaf Node**: Bottom-level record with no children. End point in hierarchy. Can be at any level. Example: "Arabica" item group.
- **Sibling**: Records sharing same parent. Ordered by sort_order field. Must have unique names within siblings.
- **Ancestor**: Any parent in the chain from current node to root. Grandparent, great-grandparent, etc.
- **Descendant**: Any child in the tree below current node. Children, grandchildren, great-grandchildren, etc.
- **Business Key**: Human-readable identifier. For categories, this is the name field (unique within parent). Distinct from technical primary key (UUID).
- **Item Count**: Number of products assigned to category. Direct count (products directly assigned) + nested count (products in descendant categories) = total count.

---

## Related Documents

- [Business Requirements](./BR-categories.md) - User stories and functional requirements defining what the system must do
- [Technical Specification](./TS-categories.md) - System architecture and component design describing how it's implemented
- [Use Cases](./UC-categories.md) - Detailed user workflows and scenarios showing how users interact with categories
- [Flow Diagrams](./FD-categories.md) - Visual workflow and process diagrams including ERD and sequence diagrams
- [Validations](./VAL-categories.md) - Data validation rules and error handling specifications

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Database Architect | | | |
| Technical Lead | | | |
| Security Officer | | | |
| Operations Manager | | | |

---

**Document End**

> 📝 **Note to Authors**:
> - Extract data definitions from actual code implementation and database schema
> - Use descriptive text instead of SQL CREATE statements
> - Focus on business meaning and relationships (what data represents, why it exists, how it relates)
> - Include realistic sample data examples from hospitality domain
> - Document constraints and rules in plain language (not SQL syntax)
> - Describe indexing strategy conceptually (purpose, performance impact, use cases)
> - Explain cascade behaviors and referential integrity in business terms
> - No code, no SQL queries - only text descriptions of database structure
> - Keep examples realistic and hospitality-focused (Raw Materials, Coffee Beans, Arabica)
> - Update when schema changes based on code implementation
> - Review with database team and stakeholders for accuracy
