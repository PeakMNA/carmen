# Data Definition: Units Management

## Module Information
- **Module**: Product Management
- **Sub-Module**: Units Management
- **Database**: CARMEN PostgreSQL (via Supabase)
- **Schema Version**: 1.0.0
- **Last Updated**: 2025-11-26
- **Owner**: Product Management Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-11 | Product Management Team | Initial version |
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |
| 1.2.0 | 2025-11-26 | Documentation Team | Added UnitUsageStats view entity to align with BR-units.md |


---

## Overview

The Units Management data model provides a simple yet comprehensive structure for managing measurement units used throughout the CARMEN hospitality ERP system. The model consists of a single primary entity (units table) that stores all measurement unit definitions categorized by their operational context.

Units are fundamental reference data used across multiple modules including Product Management, Recipe Management, Inventory Management, and Procurement. The data model ensures consistency in unit usage while allowing flexibility through the unit type categorization system (INVENTORY, ORDER, RECIPE).

The schema supports business processes including product catalog management, recipe creation and management, inventory tracking and valuation, purchase order processing, and goods receiving operations. All write operations maintain a complete audit trail for compliance and troubleshooting purposes.

**⚠️ IMPORTANT: This is a Data Schema Document - TEXT FORMAT ONLY**
- **DO NOT include SQL code** - describe database structures in text
- **DO NOT include CREATE TABLE statements** - describe table purposes and fields
- **DO NOT include mermaid ERD diagrams** - describe relationships in text
- **DO include**: Entity descriptions, field definitions, relationship explanations, business rules
- **Focus on**: WHAT data is stored, WHY it exists, HOW it relates - all in descriptive text

**Related Documents**:
- [Business Requirements (BR-units.md)](./BR-units.md) - Requirements in text format (no code)
- [Technical Specification (TS-units.md)](./TS-units.md) - Implementation patterns in text format (no code)
- [Use Cases (UC-units.md)](./UC-units.md) - Use cases in text format (no code)
- [Flow Diagrams (FD-units.md)](./FD-units.md) - Visual diagrams (only place for diagrams)
- [Validation Rules (VAL-units.md)](./VAL-units.md) - Validation rules in text format (no code)

---

## Entity Relationship Overview

**Primary Entities**: This sub-module contains one primary data entity and one view entity

- **Unit**: Represents a measurement unit used for quantifying products, ingredients, inventory items, and purchase orders across the system. Each unit has a unique code, full name, type classification, and active status.

- **Unit Usage Statistics (View)**: Read-only computed view that provides aggregated usage statistics for units, used for deletion validation and administrative reporting.

**Key Relationships**:

1. **Unit → Product** (One-to-Many): Referenced by products table
   - Business meaning: Each product must have a base unit for inventory measurement
   - Cardinality: One unit can be referenced by 0 to many products
   - Implementation: Products table has base_unit foreign key referencing units.id
   - Example: Unit "KG" is the base unit for "Jasmine Rice", "Thai Rice", "Brown Rice"

2. **Unit → Product Units** (One-to-Many): Referenced by product_units junction table
   - Business meaning: Products can have multiple alternative units for ordering and sales
   - Cardinality: One unit can be used in 0 to many product unit conversions
   - Implementation: Product_units table has unit foreign key referencing units.id
   - Example: Unit "BAG" is an alternative unit for rice products (1 BAG = 25 KG)

3. **Unit → Recipe Ingredients** (One-to-Many): Referenced by recipe_ingredients table
   - Business meaning: Recipe ingredients specify quantities using recipe-appropriate units
   - Cardinality: One unit can be used in 0 to many recipe ingredient specifications
   - Implementation: Recipe_ingredients table has unit foreign key referencing units.id
   - Example: Unit "TSP" (teaspoon) is used in recipe for "Salt", "Sugar", "Vanilla Extract"

4. **Unit → Inventory Transactions** (One-to-Many): Referenced by inventory_transactions table
   - Business meaning: All inventory movements track quantities in specific units
   - Cardinality: One unit can be used in 0 to many inventory transactions
   - Implementation: Inventory_transactions table has unit foreign key referencing units.id
   - Example: Unit "ML" tracks all liquid inventory movements (stock in, stock out, adjustments)

5. **Unit → Purchase Order Items** (One-to-Many): Referenced by purchase_order_items table
   - Business meaning: Purchase orders specify item quantities in ordering units
   - Cardinality: One unit can be used in 0 to many purchase order items
   - Implementation: Purchase_order_items table has unit foreign key referencing units.id
   - Example: Unit "CASE" is used when ordering beverages in bulk (1 CASE = 24 bottles)

**Relationship Notes**:
- Units are pure reference data and do not have parent-child relationships within the units table itself
- Units are referenced but do not reference other tables (no foreign keys from units to other tables)
- Deletion restrictions apply: Units cannot be deleted if referenced by any products, recipes, or transactions
- All relationships use the unit ID (UUID) rather than unit code for referential integrity
- See [Flow Diagrams (FD-units.md)](./FD-units.md) for visual ERD diagrams showing these relationships

---

## Data Entities

### Entity: Unit

**Description**: Represents a measurement unit used throughout the CARMEN system for quantifying materials, products, ingredients, and inventory items. Units are categorized by type (INVENTORY, ORDER, RECIPE) to ensure appropriate usage in different operational contexts.

**Business Purpose**: Provides standardized measurement units for all quantifiable entities in the system. Ensures consistency in unit usage across products, recipes, inventory, and procurement. Supports unit conversion calculations and proper inventory valuation. Maintains reference data for dropdown selectors and unit validation.

**Data Ownership**: Product Management Team manages the master list of units. Department Managers can view units relevant to their operations. System Administrators have full control including activation/deactivation.

**Access Pattern**:
- Primary access by unit ID for foreign key lookups (O(log n) with primary key index)
- Frequent access by unit code for validation and display purposes (O(log n) with unique index)
- Filtered queries by unit type for dropdown selectors (O(log n) with type index)
- Filtered queries by active status for operational queries (partial index on active records)
- Full table scans rare (small dataset expected: 20-100 total units)

**Data Volume**:
- Expected data volume: 20-50 units initially, growth to 80-100 units over time
- Very low growth rate: 1-2 new units per year
- No archival needed (reference data remains active or is soft-deleted)
- Extremely low write volume: Creation during setup, occasional additions, rare updates
- High read volume: Thousands of reads per day across all modules

#### Fields Overview

**Primary Identification**:
- **ID Field**: id - UUID format, auto-generated using uuid_generate_v4()
- **Business Key**: code - Human-readable unit code (e.g., "KG", "ML", "PC") - unique, immutable after creation
- **Display Name**: name - Full unit name used for display in UI (e.g., "Kilogram", "Milliliter", "Piece")

**Core Business Fields**:
- **Code**: Short alphanumeric code for the unit (2-10 characters)
  - Required: Yes
  - Unique: Yes (case-insensitive)
  - Format: Uppercase letters and numbers only
  - Examples: "KG", "ML", "L", "PC", "BOX", "CASE"
  - Immutability: Cannot be changed after creation if referenced by other entities
  - Purpose: Quick identification, space-efficient storage, user-friendly reference

- **Name**: Full descriptive name of the unit (2-100 characters)
  - Required: Yes
  - Unique: No (multiple units could theoretically have similar names)
  - Examples: "Kilogram", "Milliliter", "Liter", "Piece", "Box", "Case"
  - Purpose: Display in UI, reports, and documentation
  - Guidelines: Should be clear and unambiguous

- **Description**: Optional detailed description of the unit (0-500 characters)
  - Required: No
  - Purpose: Provide additional context about when and how to use the unit
  - Examples: "Standard weight measurement for inventory", "Used for liquid volume in recipes", "Packaging unit for bulk orders"
  - Guidelines: Helpful for training and clarity, especially for uncommon units

- **Type**: Classification of unit usage context (Enum: INVENTORY, ORDER, RECIPE)
  - Required: Yes
  - Allowed values:
    - INVENTORY: Units used for stock measurement and inventory tracking (KG, L, PC)
    - ORDER: Units used in purchase orders and vendor transactions (BOX, CASE, PALLET)
    - RECIPE: Units used in recipe ingredient specifications (TSP, TBSP, CUP)
  - Default: None (must be explicitly specified)
  - Business rules:
    - Base units for products must be INVENTORY type
    - Recipe ingredients should use RECIPE or INVENTORY type units
    - Purchase orders can use ORDER or INVENTORY type units
  - Purpose: Ensures units are used in appropriate operational context

**Status and Workflow**:
- **Status Field**: isActive - Boolean flag indicating whether unit is active
  - Required: Yes
  - Default: true (new units are active by default)
  - Values:
    - true: Unit is active and available for use in new records
    - false: Unit is inactive/soft-deleted, not available for selection but preserved for historical data
  - Status transitions:
    - active → inactive: Manual deactivation by admin (soft delete)
    - inactive → active: Manual reactivation by admin (if no code conflicts exist)
  - Business rules:
    - Cannot deactivate unit if currently referenced by active products, recipes, or open orders
    - Inactive units remain visible in historical records for audit trail
    - Inactive units excluded from dropdown selectors for new records

**Monetary Fields**: Not applicable - units do not have monetary values

**Date and Time Fields**: Standard audit timestamps only (see Audit Fields below)

**Relationship Fields**: None - units table does not have foreign keys to other tables (it is referenced by others)

**Flexible Data Fields**: Not applicable - units have fixed schema with no need for metadata

**Audit Fields** (Standard for all entities):
- **Created At**: Timestamp when unit record was created (UTC, immutable)
  - Required: Yes
  - Default: NOW() - automatically set on insert
  - Purpose: Track when unit was added to the system
  - Immutability: Never updated after creation

- **Created By**: User who created the unit record (UUID reference to users table)
  - Required: Yes
  - Default: Current authenticated user ID
  - Purpose: Accountability for unit creation
  - Immutability: Never updated after creation

- **Updated At**: Timestamp of last modification to unit (UTC, auto-updated)
  - Required: Yes
  - Default: NOW() - automatically set on insert and update
  - Purpose: Track when unit was last modified
  - Auto-update: Trigger automatically updates this field on every update operation

- **Updated By**: User who last modified the unit record (UUID reference to users table)
  - Required: Yes
  - Default: Current authenticated user ID
  - Purpose: Accountability for unit modifications
  - Auto-update: Automatically set to current user on every update operation

- **Deleted At**: Soft delete timestamp (NULL for active records, timestamp for deleted)
  - Required: No
  - Default: NULL (active record)
  - Purpose: Soft delete implementation - preserves historical data
  - Business rule: When set (not NULL), record is considered deleted but preserved for audit trail

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key, unique identifier | 550e8400-e29b-41d4-a716-446655440001 | Unique, Non-null, Immutable |
| code | VARCHAR(10) | Yes | - | Short unit code, case-insensitive unique | KG, ML, L, PC, BOX, CASE, TSP, TBSP | Unique (uppercase), Non-empty, 2-10 chars, Immutable if referenced |
| name | VARCHAR(100) | Yes | - | Full descriptive unit name | Kilogram, Milliliter, Piece, Box | Non-empty, 2-100 chars |
| description | VARCHAR(500) | No | NULL | Optional detailed description | "Standard weight measurement for inventory" | 0-500 chars |
| type | VARCHAR(20) | Yes | - | Unit usage context | INVENTORY, ORDER, RECIPE | Must be from allowed enum values |
| isActive | BOOLEAN | Yes | true | Active/inactive status flag | true, false | Non-null |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp (UTC) | 2024-01-15T10:30:00Z | Non-null, Immutable |
| created_by | UUID | Yes | current_user_id | Creator user reference | 550e8400-... | Non-null, FK to users.id, Immutable |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp (UTC) | 2024-01-15T14:20:00Z | Non-null, Auto-updated on changes |
| updated_by | UUID | Yes | current_user_id | Last modifier user reference | 550e8400-... | Non-null, FK to users.id, Auto-updated |
| deleted_at | TIMESTAMPTZ | No | NULL | Soft delete timestamp | NULL or 2024-01-20T08:45:00Z | NULL for active records |

#### Data Constraints and Rules

**Primary Key**:
- Field: `id`
- Type: UUID, auto-generated using uuid_generate_v4() function
- Purpose: Uniquely identifies each unit across the entire system
- Properties: Immutable, globally unique, non-sequential, suitable for distributed systems
- Index: Automatically created with PRIMARY KEY constraint (B-tree index)

**Unique Constraints**:
- **Unit Code Uniqueness**: `code` must be unique among all units (case-insensitive)
  - Implementation: Unique index on UPPER(code) for case-insensitive enforcement
  - Allows: Reuse of code after soft delete (deleted_at IS NULL in unique index)
  - Purpose: Prevents duplicate unit codes which would cause confusion
  - Error message: "Unit code already exists" when violation occurs
  - Business rule: Code immutable after creation if referenced by any entity

**Foreign Key Relationships**:
- **Creator User** (`created_by` → `users.id`)
  - On Delete: SET NULL (preserve history even if user deleted)
  - On Update: CASCADE (propagate user ID changes if any)
  - Business rule: Track who added the unit to the system
  - Nullability: Cannot be NULL at creation, but can become NULL if user deleted

- **Updater User** (`updated_by` → `users.id`)
  - On Delete: SET NULL (preserve history even if user deleted)
  - On Update: CASCADE (propagate user ID changes if any)
  - Business rule: Track who last modified the unit
  - Nullability: Cannot be NULL at update time, but can become NULL if user deleted

**Check Constraints**:
- **Type Validation**: `type` must be one of three allowed values
  - Allowed values: 'INVENTORY', 'ORDER', 'RECIPE'
  - Purpose: Ensure unit type is valid and from business-defined categories
  - Error message: "Invalid unit type" when violation occurs
  - Implementation: CHECK (type IN ('INVENTORY', 'ORDER', 'RECIPE'))

- **Code Format**: `code` must follow format rules
  - Length: Between 2 and 10 characters
  - Pattern: Uppercase letters and numbers only (enforced at application layer)
  - Purpose: Maintain consistency and readability of unit codes
  - Implementation: CHECK (LENGTH(code) >= 2 AND LENGTH(code) <= 10)

- **Name Length**: `name` must be meaningful
  - Length: Between 2 and 100 characters
  - Purpose: Ensure unit has proper descriptive name
  - Implementation: CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100)

- **Description Length**: If provided, description must not exceed limit
  - Length: Maximum 500 characters
  - Purpose: Prevent excessively long descriptions
  - Implementation: CHECK (description IS NULL OR LENGTH(description) <= 500)

**Not Null Constraints**:
- Required fields that cannot be NULL: id, code, name, type, isActive, created_at, created_by, updated_at, updated_by
- Optional fields that can be NULL: description, deleted_at
- Business justification:
  - Core identity fields (id, code, name) required for basic unit definition
  - Type classification required for proper operational usage
  - Active status required to determine availability
  - Audit fields required for compliance and troubleshooting
  - Description optional as not all units need detailed explanation

**Default Values**:
- `id`: Auto-generated UUID (uuid_generate_v4() function)
- `isActive`: true - New units are active by default
- `created_at`: NOW() - Current timestamp when record inserted
- `updated_at`: NOW() - Current timestamp when record inserted or updated
- `deleted_at`: NULL - Records are active by default (not soft-deleted)
- `created_by`, `updated_by`: Current authenticated user ID (from session)
- No defaults for: code, name, description, type (must be explicitly provided)

#### Sample Data Examples

**Example 1: Inventory Unit - Weight**
```
ID: 550e8400-e29b-41d4-a716-446655440001
Code: KG
Name: Kilogram
Description: Standard weight measurement for inventory items
Type: INVENTORY
Is Active: true
Created: 2024-01-01 00:00:00 UTC
Created By: Admin User (system-admin-001)
Updated: 2024-01-01 00:00:00 UTC
Updated By: Admin User (system-admin-001)
Deleted At: NULL

Business Context:
- Used as base unit for all solid inventory items
- Referenced by products like rice, flour, meat, vegetables
- Used in inventory valuation calculations
- Standard unit for goods receiving and stock counting
```

**Example 2: Order Unit - Packaging**
```
ID: 550e8400-e29b-41d4-a716-446655440002
Code: CASE
Name: Case
Description: Standard packaging unit for bulk orders, typically contains 12 or 24 pieces
Type: ORDER
Is Active: true
Created: 2024-01-01 00:00:00 UTC
Created By: Admin User (system-admin-001)
Updated: 2024-01-01 00:00:00 UTC
Updated By: Admin User (system-admin-001)
Deleted At: NULL

Business Context:
- Used in purchase orders for beverages and canned goods
- Conversion to base unit defined at product level (e.g., 1 CASE = 24 bottles)
- Helps purchasing team order in vendor-preferred quantities
- Tracks order quantities matching vendor invoices
```

**Example 3: Recipe Unit - Volume**
```
ID: 550e8400-e29b-41d4-a716-446655440003
Code: TSP
Name: Teaspoon
Description: Teaspoon measurement for recipes, approximately 5ml
Type: RECIPE
Is Active: true
Created: 2024-01-01 00:00:00 UTC
Created By: Admin User (system-admin-001)
Updated: 2024-01-01 00:00:00 UTC
Updated By: Admin User (system-admin-001)
Deleted At: NULL

Business Context:
- Used exclusively in recipe ingredient specifications
- Common for spices, salt, baking powder in kitchen recipes
- Not used for inventory or ordering (too small for those contexts)
- Helps chefs follow standardized recipes consistently
```

**Example 4: Inactive Unit (Soft Deleted)**
```
ID: 550e8400-e29b-41d4-a716-446655440004
Code: DRUM
Name: Drum
Description: Large container unit, deprecated in favor of BARREL
Type: ORDER
Is Active: false
Created: 2024-01-01 00:00:00 UTC
Created By: Admin User (system-admin-001)
Updated: 2024-06-15 14:30:00 UTC
Updated By: Purchasing Manager (user-pm-001)
Deleted At: 2024-06-15 14:30:00 UTC

Business Context:
- Previously used for ordering liquids in large quantities
- Deactivated when company standardized on BARREL unit
- Remains in database for historical purchase orders
- Not available in dropdown selectors for new orders
- Can be reactivated if business needs change
```

---

### View Entity: Unit Usage Statistics

**Description**: Read-only view entity that provides aggregated usage statistics for units. Used to determine whether a unit can be safely deleted and to provide administrators with visibility into unit usage across the system.

**Business Purpose**: Prevents accidental deletion of units that are in active use. Informs management decisions about unit deactivation. Provides audit and reporting capabilities for unit usage patterns.

**Data Ownership**: System-generated view, not directly editable. Computed from relationships between units and referencing entities (products, recipes, transactions).

**Access Pattern**:
- Primary access by unit ID for deletion validation (O(n) aggregate query)
- Batch access for reporting on all units (O(n) full computation)
- Triggered on delete or status change operations

**Data Volume**: Virtual view, no storage. One record per unit computed on demand.

#### Fields Overview

**Identification Fields**:
- **unitId**: Reference to the unit being analyzed (UUID)
- **unitCode**: Unit code for display (VARCHAR, from units.code)
- **unitName**: Unit name for display (VARCHAR, from units.name)

**Usage Count Fields**:
- **productCount**: Number of products using this unit as base unit or alternative unit
  - Source: COUNT from products + product_units tables
  - Purpose: Determine if unit is used in product definitions

- **recipeCount**: Number of recipes using this unit in ingredient specifications
  - Source: COUNT from recipe_ingredients table
  - Purpose: Determine if unit is used in recipe management

**Computed Flags**:
- **canBeDeleted**: Boolean indicating whether unit can be safely deleted
  - Computed: true if productCount = 0 AND recipeCount = 0
  - Purpose: Prevent deletion of units with active references

- **deletionBlockedReason**: Human-readable explanation when canBeDeleted is false
  - Format: "Referenced by {N} products and {M} recipes"
  - Purpose: Provide clear feedback to administrators

#### Field Definitions Table

| Field Name | Data Type | Source | Description | Example Values |
|-----------|-----------|--------|-------------|----------------|
| unitId | UUID | units.id | Reference to unit | 550e8400-e29b-41d4-a716-446655440001 |
| unitCode | VARCHAR(10) | units.code | Unit code for display | KG, ML, BOX |
| unitName | VARCHAR(100) | units.name | Unit name for display | Kilogram, Milliliter |
| productCount | INTEGER | Computed | Products using this unit | 0, 5, 12 |
| recipeCount | INTEGER | Computed | Recipes using this unit | 0, 3, 8 |
| canBeDeleted | BOOLEAN | Computed | Whether deletion is safe | true, false |
| deletionBlockedReason | VARCHAR | Computed | Reason if deletion blocked | "Referenced by 5 products and 3 recipes" |

#### Sample Data Examples

**Example 1: Unit Safe to Delete**
```
Unit ID: 550e8400-e29b-41d4-a716-446655440099
Unit Code: DRUM
Unit Name: Drum
Product Count: 0
Recipe Count: 0
Can Be Deleted: true
Deletion Blocked Reason: NULL

Business Context:
- DRUM unit was created but never used
- No products or recipes reference this unit
- Safe to delete or deactivate
```

**Example 2: Unit with Active References**
```
Unit ID: 550e8400-e29b-41d4-a716-446655440001
Unit Code: KG
Unit Name: Kilogram
Product Count: 15
Recipe Count: 8
Can Be Deleted: false
Deletion Blocked Reason: "Referenced by 15 products and 8 recipes"

Business Context:
- KG is a heavily used inventory unit
- Cannot be deleted without affecting 23 entities
- Recommend deactivation instead of deletion
```

---

## Relationships

### Referenced By Products (One-to-Many)

#### Unit → Product (Base Unit)

**Relationship Type**: One unit can be the base unit for many products

**Foreign Key**: `products.base_unit` references `units.id`

**Cardinality**:
- One unit can be base unit for: 0 to many products
- Each product must have: exactly 1 base unit (required)

**Cascade Behavior**:
- **On Delete**: RESTRICT
  - Cannot delete unit if it is base unit for any active product
  - Prevents orphaned products without measurement units
  - User must change products to different base unit before deleting

- **On Update**: CASCADE
  - Updating unit ID propagates to all products (rare with UUIDs)
  - Maintains referential integrity automatically

**Business Rule**: Base unit for products must be of type INVENTORY because inventory tracking and valuation require consistent inventory-type units. ORDER or RECIPE type units cannot be base units.

**Example Scenario**:
```
Unit: KG (Kilogram, INVENTORY type)
Referenced as base unit by:
  - Product: Jasmine Rice (base_unit = KG)
  - Product: All-Purpose Flour (base_unit = KG)
  - Product: Ground Beef (base_unit = KG)
  - Product: Fresh Tomatoes (base_unit = KG)

If attempting to delete KG unit:
  - System checks for references in products.base_unit
  - Finds 4 active products using KG as base unit
  - Rejects deletion with error: "Cannot delete unit KG: Referenced by 4 products as base unit"
  - User must update products to use different base unit first
```

**Common Query Patterns**:
- Find all products using a specific unit as base unit: Filter products WHERE base_unit = {unit_id}
- Count products per base unit: GROUP BY base_unit with COUNT aggregate
- Find units not used as base unit: LEFT JOIN products on base_unit WHERE product IS NULL
- Validate base unit type: JOIN units and CHECK type = 'INVENTORY'

---

### Referenced By Product Units (One-to-Many)

#### Unit → Product Unit Conversions

**Relationship Type**: One unit can be used in many product alternative unit definitions

**Foreign Key**: `product_units.unit` references `units.id`

**Cardinality**:
- One unit can be used in: 0 to many product unit conversions
- Each product unit conversion must reference: exactly 1 unit (required)

**Cascade Behavior**:
- **On Delete**: RESTRICT
  - Cannot delete unit if used in any product unit conversions
  - Prevents loss of conversion data
  - User must remove conversions before deleting unit

- **On Update**: CASCADE
  - Unit ID changes propagate to product_units table
  - Maintains referential integrity

**Business Rule**: Alternative units can be any type (INVENTORY, ORDER, or RECIPE) depending on the product and usage context. For example, a product with base unit KG (inventory) might have alternative unit CASE (ordering) and CUP (recipe).

**Example Scenario**:
```
Unit: CASE (Case, ORDER type)
Referenced by product_units as alternative unit:
  - Product: Bottled Water (base_unit = L, alternative = CASE, conversion = 1 CASE = 24 L)
  - Product: Canned Tomatoes (base_unit = KG, alternative = CASE, conversion = 1 CASE = 12 cans)
  - Product: Beer (base_unit = L, alternative = CASE, conversion = 1 CASE = 24 bottles)

Business meaning:
  - Allows ordering in vendor packaging units (CASE)
  - While tracking inventory in base units (L or KG)
  - System automatically converts CASE to base unit for inventory
  - Purchase orders use CASE, inventory transactions use base unit
```

**Common Query Patterns**:
- Find all products with specific alternative unit: JOIN product_units WHERE unit = {unit_id}
- Find all alternative units for a product: Filter product_units WHERE product_id = {product_id}
- Check if unit is used in conversions: EXISTS query on product_units
- Calculate equivalent quantities: Use conversion_factor from product_units

---

### Referenced By Recipe Ingredients (One-to-Many)

#### Unit → Recipe Ingredient Quantities

**Relationship Type**: One unit can be used to measure many recipe ingredients

**Foreign Key**: `recipe_ingredients.unit` references `units.id`

**Cardinality**:
- One unit can be used for: 0 to many recipe ingredients
- Each recipe ingredient must have: exactly 1 unit (required)

**Cascade Behavior**:
- **On Delete**: RESTRICT
  - Cannot delete unit if used in any recipe ingredients
  - Prevents recipes from losing measurement units
  - User must update recipes to use different units before deletion

- **On Update**: CASCADE
  - Unit ID changes propagate to recipe_ingredients table

**Business Rule**: Recipe ingredients should use RECIPE type units (TSP, TBSP, CUP) or INVENTORY type units (KG, L, ML) appropriate for recipe preparation. ORDER type units (CASE, BOX) are typically too large for recipe measurements and should not be used.

**Example Scenario**:
```
Unit: TSP (Teaspoon, RECIPE type)
Referenced by recipe_ingredients:
  - Recipe: Thai Green Curry, Ingredient: Salt (quantity = 2 TSP)
  - Recipe: Chocolate Chip Cookies, Ingredient: Vanilla Extract (quantity = 1 TSP)
  - Recipe: Italian Pasta Sauce, Ingredient: Oregano (quantity = 1.5 TSP)
  - Recipe: Beef Marinade, Ingredient: Black Pepper (quantity = 0.5 TSP)

Business meaning:
  - Chefs follow recipes using kitchen-appropriate measurements
  - Recipe portions calculated using these units
  - Ingredient cost calculations convert recipe units to inventory units
  - Recipe scaling adjusts quantities while preserving unit
```

**Common Query Patterns**:
- Find all recipes using specific unit: JOIN recipe_ingredients WHERE unit = {unit_id}
- Find all ingredients for a recipe with units: JOIN recipe_ingredients with units table
- Validate recipe unit type: JOIN units and CHECK type IN ('RECIPE', 'INVENTORY')
- Calculate recipe costs: Convert recipe units to inventory units, multiply by cost per base unit

---

### Referenced By Inventory Transactions (One-to-Many)

#### Unit → Inventory Movement Records

**Relationship Type**: One unit can be used in many inventory transactions

**Foreign Key**: `inventory_transactions.unit` references `units.id`

**Cardinality**:
- One unit can be used in: 0 to many inventory transactions
- Each inventory transaction must have: exactly 1 unit (required)

**Cascade Behavior**:
- **On Delete**: RESTRICT
  - Cannot delete unit if used in any inventory transactions
  - Preserves historical inventory records
  - Critical for audit trail and inventory valuation accuracy

- **On Update**: CASCADE
  - Unit ID changes propagate to inventory_transactions table

**Business Rule**: Inventory transactions must use INVENTORY type units because inventory tracking, stock counts, and valuation calculations require standardized inventory measurements. ORDER and RECIPE units should not appear in inventory transactions.

**Example Scenario**:
```
Unit: L (Liter, INVENTORY type)
Referenced by inventory_transactions:
  - Transaction: Stock In, Product: Olive Oil, Quantity: 100 L (receiving from purchase order)
  - Transaction: Stock Out, Product: Olive Oil, Quantity: 25 L (issued to kitchen)
  - Transaction: Adjustment, Product: Olive Oil, Quantity: -2 L (waste/spoilage)
  - Transaction: Stock Count, Product: Olive Oil, Quantity: 73 L (physical count result)

Business meaning:
  - All inventory movements tracked in base inventory units
  - Valuation calculated using inventory unit quantities
  - Stock levels maintained in inventory units
  - Audit trail shows complete history in consistent units
```

**Common Query Patterns**:
- Find all transactions for specific unit: Filter inventory_transactions WHERE unit = {unit_id}
- Calculate net inventory by unit: SUM(quantity) GROUP BY unit for a product
- Audit inventory movements: SELECT all transactions with unit details
- Validate transaction unit type: JOIN units and CHECK type = 'INVENTORY'

---

### Referenced By Purchase Order Items (One-to-Many)

#### Unit → Purchase Order Line Items

**Relationship Type**: One unit can be used in many purchase order line items

**Foreign Key**: `purchase_order_items.unit` references `units.id`

**Cardinality**:
- One unit can be used in: 0 to many purchase order items
- Each purchase order item must have: exactly 1 unit (required)

**Cascade Behavior**:
- **On Delete**: RESTRICT
  - Cannot delete unit if used in any purchase order items
  - Preserves historical purchase order data
  - Prevents loss of procurement records

- **On Update**: CASCADE
  - Unit ID changes propagate to purchase_order_items table

**Business Rule**: Purchase orders can use ORDER type units (CASE, BOX, PALLET) or INVENTORY type units (KG, L) depending on vendor packaging and ordering preferences. RECIPE type units (TSP, CUP) should not be used in purchase orders as they are too small for procurement.

**Example Scenario**:
```
Unit: CASE (Case, ORDER type)
Referenced by purchase_order_items:
  - PO-2401-0001, Item: Bottled Water, Quantity: 10 CASE (vendor sells in cases only)
  - PO-2401-0002, Item: Canned Tomatoes, Quantity: 5 CASE (bulk discount for cases)
  - PO-2401-0003, Item: Beer, Quantity: 20 CASE (standard brewery packaging)

Business meaning:
  - Purchase orders match vendor packaging and pricing units
  - Receiving converts order units to inventory units using product conversions
  - Invoice quantities in order units, inventory tracking in base units
  - Simplifies purchase order creation and vendor communication
```

**Common Query Patterns**:
- Find all PO items with specific unit: Filter purchase_order_items WHERE unit = {unit_id}
- Find common ordering units: COUNT(*) GROUP BY unit ORDER BY count DESC
- Validate purchase unit type: JOIN units and CHECK type IN ('ORDER', 'INVENTORY')
- Calculate order quantities: SUM(quantity) GROUP BY unit for spending analysis

---

## Data Indexing Strategy

### Primary Indexes

**Primary Key Index** (Automatic):
- **Field**: `id`
- **Purpose**: Ensure uniqueness and provide fastest possible lookup by unit UUID
- **Type**: B-tree (automatically created with PRIMARY KEY constraint)
- **Performance**: O(log n) lookup time, highly efficient even with thousands of records
- **Use Cases**: Foreign key lookups from products, recipes, inventory, purchase orders
- **Cardinality**: High (each unit has unique UUID)

### Business Key Indexes

**Unique Unit Code Index**:
- **Field**: `UPPER(code)` (case-insensitive)
- **Purpose**: Fast lookup by unit code, enforce code uniqueness regardless of case
- **Type**: Unique B-tree index on uppercase transformation of code
- **Partial Index**: Only on non-deleted records (WHERE deleted_at IS NULL)
- **Use Cases**:
  - User searches for unit by code (e.g., searching for "kg" finds "KG")
  - Validation during unit creation (check for duplicate codes)
  - Display unit information in UI based on code
- **Performance**: O(log n) lookup, very fast even with case conversion
- **Cardinality**: High (each active unit has unique code)

### Status and Type Indexes

**Active Status Index**:
- **Field**: `isActive`
- **Purpose**: Fast filtering of active vs. inactive units
- **Type**: B-tree index
- **Partial Index**: Could be optimized as partial index on only active records
- **Use Cases**:
  - Dropdown selectors showing only active units
  - Filtering unit lists to show active or inactive units
  - Validation checks to ensure only active units used in new records
- **Performance**: Efficient for boolean filtering
- **Cardinality**: Low (only two values: true/false)

**Unit Type Index**:
- **Field**: `type`
- **Purpose**: Fast filtering by unit type (INVENTORY, ORDER, RECIPE)
- **Type**: B-tree index
- **Use Cases**:
  - Filter units for base unit selection (INVENTORY type only)
  - Filter units for recipe ingredient selection (RECIPE and INVENTORY types)
  - Filter units for purchase order selection (ORDER and INVENTORY types)
  - Analytics on unit type distribution
- **Performance**: Efficient for low-cardinality filtering
- **Cardinality**: Low (only three values: INVENTORY, ORDER, RECIPE)

### Composite Indexes

**Type + Active Status Composite Index**:
- **Fields**: (`type`, `isActive`)
- **Purpose**: Efficient filtering by both type and active status together
- **Type**: Composite B-tree index
- **Partial Index**: WHERE deleted_at IS NULL (excludes soft-deleted records)
- **Use Cases**:
  - Dropdown showing only active INVENTORY units for base unit selection
  - Dropdown showing only active RECIPE units for recipe ingredients
  - List pages filtered by type and status simultaneously
- **Performance**: Optimal for combined queries, avoids index merge operations
- **Query Pattern**: WHERE type = 'INVENTORY' AND isActive = true

**Type + Code Composite Index** (Optional):
- **Fields**: (`type`, `UPPER(code)`)
- **Purpose**: Fast lookup combining type filter with code search
- **Type**: Composite B-tree index
- **Use Cases**: Type-specific code searches or validations
- **Performance**: Efficient for queries filtering by both type and code
- **Query Pattern**: WHERE type = 'INVENTORY' AND UPPER(code) = 'KG'

### Audit Field Indexes

**Created At Index**:
- **Field**: `created_at`
- **Purpose**: Fast chronological queries and sorting by creation date
- **Type**: B-tree index
- **Use Cases**:
  - Audit trail analysis (units created in date range)
  - Recently added units report
  - Historical analysis of unit additions over time
- **Performance**: Efficient for time-series queries and sorting
- **Cardinality**: High (timestamps are unique or near-unique)

### Partial Indexes for Soft Deletes

**Active Records Partial Index**:
- **Fields**: Multiple indexes with WHERE clause
- **Condition**: WHERE deleted_at IS NULL
- **Purpose**: Exclude soft-deleted records from indexes, improve performance
- **Benefit**: Smaller index size, faster queries on active data (90%+ of queries)
- **Use Cases**: All production queries filter out deleted records
- **Application**: Applied to code unique index and composite indexes
- **Performance Impact**: 10-20% improvement on index lookup for active records

### Index Maintenance Guidelines

**Monitoring**:
- Track index usage statistics with database monitoring tools
- Identify unused indexes through pg_stat_user_indexes view
- Monitor index bloat percentage (reindex when exceeds 30%)
- Review slow query log to identify missing indexes
- Analyze query execution plans regularly

**Best Practices for Units Table**:
- Index foreign keys (created_by, updated_by) for user audit queries
- Index frequently filtered columns (type, isActive, code)
- Use composite index for common multi-column queries
- Avoid over-indexing (units table is small, reads are fast)
- Consider removing created_by/updated_by indexes if audit queries are rare

**Index Naming Convention**:
- Primary key: `units_pkey` (automatic)
- Unique code: `idx_units_code_unique` (on UPPER(code))
- Type: `idx_units_type`
- Active status: `idx_units_isactive`
- Composite type + active: `idx_units_type_isactive`
- Created timestamp: `idx_units_created_at`

**Reindexing Schedule**:
- Units table rarely needs reindexing (low write volume)
- Reindex after bulk data imports or large updates
- Reindex if index bloat detected (>30%)
- Typical frequency: Quarterly or as-needed basis

---

## Data Integrity Rules

### Referential Integrity

**Foreign Key Constraints**:
- Units table has outgoing foreign keys: `created_by` and `updated_by` reference users table
- Units table has incoming foreign keys: Referenced by products, product_units, recipe_ingredients, inventory_transactions, purchase_order_items tables
- All foreign keys are indexed automatically for query performance
- Referential integrity enforced at database level (cannot be bypassed by application)

**Cascade Rules** - What happens when unit record is deleted:
- **Cannot Delete**: Unit deletion is RESTRICTED if referenced by any:
  - Products (as base_unit)
  - Product units (as alternative unit)
  - Recipe ingredients (as ingredient unit)
  - Inventory transactions (as transaction unit)
  - Purchase order items (as order unit)
- **Soft Delete Instead**: Units should be soft-deleted (set deleted_at) rather than hard deleted
- **User References**: When user is deleted, unit's created_by and updated_by set to NULL
- **Preservation**: Historical records remain intact with unit references preserved

**Orphan Prevention**:
- No products without valid base unit (enforced by NOT NULL + foreign key constraint)
- No product unit conversions without valid unit reference
- No recipe ingredients without valid unit reference
- Application logic prevents deletion of referenced units
- Soft delete maintains referential integrity while hiding units from active use

### Domain Integrity

**Data Type Enforcement**:
- Column data types strictly enforced by PostgreSQL database engine
- UUID fields must be valid UUID format (36 characters with hyphens in standard format)
- VARCHAR fields truncated or rejected if exceeding maximum length
- BOOLEAN fields accept only true/false/null values
- TIMESTAMPTZ fields validate date/time format and timezone
- Type mismatches rejected at INSERT/UPDATE time with clear error messages

**Check Constraints**:
- **Unit Type Validation**: `type IN ('INVENTORY', 'ORDER', 'RECIPE')`
  - Purpose: Only allow predefined unit type categories
  - Error: "Invalid unit type: {value}" when constraint violated

- **Code Length Validation**: `LENGTH(code) >= 2 AND LENGTH(code) <= 10`
  - Purpose: Ensure unit codes are meaningful but concise
  - Error: "Unit code must be between 2 and 10 characters" when violated

- **Name Length Validation**: `LENGTH(name) >= 2 AND LENGTH(name) <= 100`
  - Purpose: Ensure unit names are descriptive but not excessively long
  - Error: "Unit name must be between 2 and 100 characters" when violated

- **Description Length Validation**: `description IS NULL OR LENGTH(description) <= 500`
  - Purpose: Limit description length for reasonable storage and display
  - Error: "Description exceeds 500 character limit" when violated

**NOT NULL Constraints**:
- **Required Fields**: id, code, name, type, isActive, created_at, created_by, updated_at, updated_by
- **Optional Fields**: description, deleted_at
- **Business Justification**:
  - Core identity (id, code, name): Required for unit to be meaningful
  - Type classification: Required for proper operational usage context
  - Active status: Required to determine availability for new records
  - Audit fields: Required for compliance, troubleshooting, accountability
  - Description: Optional because not all units need detailed explanation
  - Deleted_at: NULL for active records, timestamp for soft-deleted records

**DEFAULT Values**:
- **Auto-Generated**: id (UUID), created_at and updated_at (NOW())
- **Explicit Defaults**: isActive (true), deleted_at (NULL)
- **User-Provided**: created_by and updated_by (from authentication session)
- **Required Input**: code, name, type (no defaults, must be provided)
- **Benefits**: Reduces application complexity, ensures consistency, prevents null-related errors

**UNIQUE Constraints**:
- **Unit Code Uniqueness**: UPPER(code) must be unique among non-deleted records
  - Implementation: Unique partial index WHERE deleted_at IS NULL
  - Purpose: Prevent duplicate unit codes causing confusion
  - Case-Insensitive: "KG", "kg", "Kg" all considered duplicates
  - Allows Reuse: Code can be reused after unit is soft-deleted
  - Error: "Unit code already exists" when attempting to create duplicate

### Entity Integrity

**Primary Key Requirements**:
- Every unit record must have a primary key (id column)
- Primary key is UUID type for distributed system compatibility
- Primary keys are immutable (never updated after creation)
- Primary keys are always NOT NULL and UNIQUE (enforced by database)
- No composite primary keys (single UUID id column is sufficient)

**Audit Trail Requirements** (All write operations logged):
- `created_at`: When unit was created (immutable, set once at creation)
- `created_by`: Who created the unit (immutable, set once at creation)
- `updated_at`: When unit was last modified (auto-updated on every change)
- `updated_by`: Who last modified the unit (auto-updated on every change)
- **Purpose**: Accountability, compliance, troubleshooting, data forensics
- **Protection**: created_at and created_by cannot be modified (immutable)
- **Automation**: updated_at and updated_by automatically updated by database trigger

**Soft Delete Requirements**:
- `deleted_at`: NULL for active records, timestamp for soft-deleted records
- **Never Hard Delete**: Records preserved for historical reference and audit trail
- **Query Pattern**: All queries must filter WHERE deleted_at IS NULL for active records
- **Benefits**: Allows recovery, maintains audit trail, preserves historical data
- **Reactivation**: Units can be reactivated by setting deleted_at back to NULL (if no code conflicts)

### Data Quality Constraints

**Value Range Constraints**:
- Code length: 2-10 characters (enforced by CHECK constraint)
- Name length: 2-100 characters (enforced by CHECK constraint)
- Description length: 0-500 characters (enforced by CHECK constraint)
- Type: Must be from enum list (INVENTORY, ORDER, RECIPE)
- Boolean values: TRUE or FALSE only (no other values accepted)

**Format Constraints**:
- **Unit Code Format**: Uppercase letters and numbers only
  - Enforced at application layer before database insert
  - Validation pattern: /^[A-Z0-9]+$/
  - Examples: "KG", "ML", "L", "PC", "BOX", "CASE", "TSP"
  - Rejected: "kg" (lowercase), "K G" (spaces), "K-G" (special chars)

- **Unit Name Format**: Free text but must be meaningful
  - Should start with capital letter for consistency
  - Can include spaces, hyphens for multi-word names
  - Examples: "Kilogram", "Milli liter", "Box", "Twenty-Four Pack"

**Business Logic Constraints**:
- Base units for products must be INVENTORY type (enforced at application layer)
- Recipe ingredients should use RECIPE or INVENTORY type units (enforced at application layer)
- ORDER type units typically used in purchase orders, not recipes
- Deactivated units cannot be selected for new products/recipes (enforced at application layer)
- Unit code immutable after creation if referenced by other entities (enforced at application layer)

---

## Database Triggers and Automation

### Automatic Timestamp Updates

**Updated At Trigger**:
- **Purpose**: Automatically update `updated_at` timestamp whenever unit record is modified
- **Trigger Event**: BEFORE UPDATE on units table
- **Trigger Function**: Sets updated_at = NOW() before saving any changes
- **Benefits**: Ensures accurate last-modified tracking without relying on application logic
- **Reliability**: Database-level enforcement cannot be bypassed by application bugs
- **Performance**: Minimal overhead (simple timestamp assignment)

**Created At Protection**:
- **Purpose**: Prevent modification of `created_at` and `created_by` fields (immutability)
- **Trigger Event**: BEFORE UPDATE on units table
- **Trigger Function**: Restores original created_at and created_by values if changed
- **Benefits**: Immutable audit trail, prevents tampering with creation information
- **Error Handling**: Optionally raise exception if attempt to modify detected
- **Business Rule**: Creation timestamp and creator must never change after record creation

### Audit Logging

**Change Tracking Trigger**:
- **Purpose**: Record all INSERT, UPDATE, and DELETE operations to audit log for compliance
- **Trigger Event**: AFTER INSERT OR UPDATE OR DELETE on units table
- **Audit Log Table**: `audit_logs` table stores complete change history
- **Captured Data**:
  - **Operation Type**: INSERT, UPDATE, DELETE, SOFT_DELETE
  - **User**: Who performed the action (from session or updated_by field)
  - **Timestamp**: Exact time of change (high precision)
  - **Old Values**: Field values before change (for UPDATE operations)
  - **New Values**: Field values after change (for INSERT and UPDATE operations)
  - **Changed Fields**: List of fields that were modified (for UPDATE operations)
  - **Entity Info**: Entity type ('unit'), entity ID (unit UUID)

**Use Cases for Audit Logs**:
- **Compliance**: Regulatory requirements for data change tracking (SOX, GDPR, etc.)
- **Troubleshooting**: Investigate when and how unit data was changed
- **User Accountability**: Track which users made what changes and when
- **Security**: Detect unauthorized or suspicious changes to reference data
- **Data Recovery**: Restore previous values if needed (undo functionality)
- **Analytics**: Analyze patterns of unit additions and modifications over time

### Data Validation Triggers

**Business Rule Validation**:
- **Purpose**: Enforce complex business rules that cannot be expressed with simple constraints
- **Trigger Event**: BEFORE INSERT OR UPDATE on units table
- **Validation Examples**:
  - Verify unit code format (uppercase alphanumeric only)
  - Check for duplicate code (case-insensitive) among active units only
  - Validate type value is from allowed enum
  - Ensure user has permission to create or modify units
  - Verify code immutability if unit is referenced (on UPDATE only)

**Code Immutability Validation** (UPDATE only):
- **Purpose**: Prevent changing unit code if unit is referenced by products, recipes, or transactions
- **Trigger Event**: BEFORE UPDATE on units table (when code field is changed)
- **Validation Logic**:
  1. Check if code has changed (OLD.code != NEW.code)
  2. If changed, check for references in products, product_units, recipe_ingredients, inventory_transactions, purchase_order_items
  3. If references exist, raise exception preventing update
  4. If no references, allow update (admin maintenance scenarios)
- **Error Message**: "Cannot change unit code: Referenced by {count} products, {count} recipes, {count} transactions"
- **Business Rule**: Unit codes are immutable once used in operational data

### Cascade Operations

**Soft Delete Cascade** (Future Enhancement):
- **Purpose**: When unit is soft-deleted, optionally propagate soft delete to dependent records
- **Trigger Event**: AFTER UPDATE on units table (when deleted_at is set from NULL)
- **Behavior**: Not typically implemented for units (referenced data should remain intact)
- **Alternative**: Units with references cannot be deleted (RESTRICT enforcement)
- **Business Rule**: Units remain active or inactive but are not cascaded to dependent records

**Status Change Notifications** (Future Enhancement):
- **Purpose**: Notify application or trigger workflows when unit status changes
- **Trigger Event**: AFTER UPDATE on units table (when isActive changes)
- **Behavior**: Send notification or message to queue when unit activated/deactivated
- **Use Cases**: Update cached unit lists, notify users of unit availability changes
- **Implementation**: Database NOTIFY/LISTEN or message queue integration

### Computed Fields

Units table has no computed fields requiring triggers. All fields are directly stored and maintained by application or database defaults.

### Notification Triggers (Future Enhancement)

**Event Notification**:
- **Purpose**: Notify external systems or queue background jobs when units change
- **Trigger Event**: AFTER INSERT OR UPDATE OR DELETE on units table
- **Mechanism**: PostgreSQL NOTIFY/LISTEN or message queue integration (e.g., RabbitMQ, Redis)
- **Use Cases**:
  - **Cache Invalidation**: Invalidate cached unit lists when units change
  - **Search Index Update**: Update search indexes when unit data changes
  - **Notification**: Alert administrators when reference data changes
  - **Workflow**: Trigger downstream processes that depend on unit data
- **Implementation**: Trigger sends notification with entity type, entity ID, and operation type

---

## Performance Considerations

### Query Performance Targets

**Response Time Objectives**:
- **Single Unit by ID**: < 5ms (primary key index lookup, extremely fast)
- **Single Unit by Code**: < 10ms (unique index lookup with uppercase conversion)
- **List All Active Units**: < 20ms (small table, indexed filter on isActive)
- **Filtered by Type and Active**: < 25ms (composite index, small result set)
- **Full Table Scan** (all units including inactive): < 30ms (entire table fits in memory)

**Achieving Targets**:
- Proper indexing on primary key, code, type, and isActive columns
- Composite index on (type, isActive) for common filtered queries
- Partial indexes excluding soft-deleted records
- Small table size (20-100 records) allows excellent query performance
- All frequently accessed data fits in database cache/memory

**Performance Monitoring**:
- Track query execution times using database slow query log
- Monitor index usage statistics to identify unused indexes
- Use EXPLAIN ANALYZE to understand query execution plans
- Set slow query threshold to 50ms (units queries should be much faster)
- Alert if query times exceed 100ms (indicates potential issue)

### Table Size Projections

| Timeframe | Estimated Rows | Estimated Size | Notes |
|-----------|---------------|----------------|-------|
| Initial | 20-30 | 50 KB | Common inventory, order, and recipe units |
| Month 1 | 30-40 | 75 KB | Additional units as operations expand |
| Year 1 | 40-60 | 125 KB | Steady growth as new products and recipes added |
| Year 3 | 60-80 | 175 KB | Mature state with comprehensive unit library |
| Year 5 | 80-100 | 225 KB | Near-complete unit library, minimal growth |

**Sizing Assumptions**:
- Average row size: ~2.5 KB per unit (including all fields, indexes, TOAST overhead)
- Growth rate: 2-5 new units per year (very low growth for reference data)
- No archival needed: Units remain in table indefinitely (soft delete only)
- Retention: Inactive units retained indefinitely for historical reference
- Index overhead: Approximately 40% of table size (multiple indexes)

**Storage Planning**:
- Total table + indexes: < 400 KB even after 5 years (negligible storage)
- No partitioning needed (table will always be tiny)
- No special storage tier needed (can use fastest tier)
- Full table fits in database memory cache easily
- Backup/restore extremely fast due to small size

### Optimization Techniques

**Query Optimization**:
- **Index Usage**: All queries should use indexes (verify with EXPLAIN ANALYZE)
- **Avoid Full Scans**: Filter on indexed columns (code, type, isActive)
- **Use Covering Indexes**: Consider adding columns to indexes if needed
- **Limit Results**: Not necessary (entire table is small enough to return fully)
- **WHERE Clause**: Always filter deleted_at IS NULL for active records

**Indexing Best Practices**:
- **Primary Key**: Automatically indexed (id column)
- **Foreign Keys**: Index created_by and updated_by if audit queries are common
- **Unique Constraint**: Indexed automatically (UPPER(code))
- **Filtered Columns**: Index type and isActive for common filtering
- **Composite Index**: Create (type, isActive) for combined queries
- **Avoid Over-Indexing**: Units table is small, don't create unnecessary indexes

**Caching Strategy**:
- **Application Cache**: Cache entire units table in application memory (< 1 MB)
- **Cache Duration**: Long TTL (1 hour or more) because units change rarely
- **Cache Invalidation**: Invalidate on any unit create/update/delete operation
- **Cache Pattern**: Lazy loading (load on first request, cache indefinitely)
- **Cache Keys**: By id (UUID lookup), by code (code lookup), by type (filtered lists)
- **Benefits**: Eliminate database queries for unit lookups (thousands of requests per minute)

**Connection Pooling**:
- Not a concern for units table (queries are so fast that connection overhead is minimal)
- Use application's standard database connection pool settings
- Units queries take microseconds, connection time is larger overhead
- Typical pool size: 10-50 connections for entire application (not specific to units)

**Batch Operations**:
- **Bulk Insert**: Use single INSERT with multiple VALUES for initial data load
- **Bulk Update**: Rare for units (individual updates more common)
- **No Batch Reads Needed**: Entire table can be read efficiently in single query

**Read Replicas**:
- Not necessary for units table (very light load, minimal read contention)
- If implemented for other tables, units table can be read from replicas safely
- Eventual consistency acceptable (units change rarely)

**Partitioning**:
- **Not Needed**: Table will never be large enough to benefit from partitioning
- **Threshold**: Partitioning considered for tables > 1M rows (units will have < 100)

---

## Data Archival Strategy

### Archival Policy

Units are reference data and do not require traditional archival. Instead, soft delete provides a form of logical archival.

**Retention Policy**:
- **Active Units**: Remain in primary table indefinitely
- **Inactive Units**: Remain in primary table indefinitely (soft delete with deleted_at timestamp)
- **No Physical Archival**: Units table stays in place permanently
- **No Purging**: Units never deleted permanently (preserve historical references)

**Why No Archival Needed**:
- **Small Dataset**: Even after many years, units table remains tiny (< 500 KB)
- **Reference Data**: Units are looked up frequently, must remain accessible
- **Historical Integrity**: Products, recipes, and transactions reference units, must remain valid
- **Query Performance**: No performance impact from inactive units (indexed filtering very fast)
- **Storage Cost**: Negligible storage cost for keeping all units indefinitely

**Soft Delete as Archival**:
- **Inactive Units**: Set deleted_at timestamp instead of removing record
- **Remains Accessible**: Can be queried with deleted_at IS NOT NULL filter
- **Historical References**: Products and transactions maintain valid references
- **Reactivation Possible**: Can reactivate inactive units if business needs change
- **Query Filtering**: Active queries filter deleted_at IS NULL for operational data

### Archive Table Structure

**No Separate Archive Table**: Not needed for units reference data

**Alternative Approach** (if ever needed):
- **Audit Log Table**: Contains complete change history of all units
- **Historical Queries**: Use audit log to view unit state at any point in time
- **Restoration**: Reconstruct unit state from audit log if needed

---

## Security Considerations

### Row-Level Security (RLS)

**RLS Not Typically Applied** to units table because:
- Units are reference data visible to all authenticated users
- No departmental or ownership restrictions on unit visibility
- All users need access to all units for dropdown selectors and validation
- Security focus is on write permissions, not read access

**Potential RLS Policies** (if business requires):
- **Read Policy**: Allow all authenticated users to SELECT units
  - Policy: `USING (true)` for all authenticated roles
  - No restrictions on reading unit reference data

- **Write Policies**: Restrict INSERT, UPDATE, DELETE to authorized roles only
  - Admin Policy: `USING (current_user_role = 'admin')` for full access
  - Manager Policy: `USING (current_user_role IN ('admin', 'product_manager'))` for maintenance

- **Inactive Units**: Regular users only see active units
  - Policy: `USING (deleted_at IS NULL OR current_user_role = 'admin')`
  - Admins can see and reactivate inactive units

### Column-Level Security

**No Sensitive Columns**: Units table contains no sensitive data requiring column-level restrictions

**All Columns Public**: code, name, description, type, isActive all visible to authenticated users

**Audit Fields Access**:
- **created_by, updated_by**: Visible to users for accountability
- **created_at, updated_at**: Public for transparency
- **deleted_at**: Visible to admins only (indicates soft delete status)

### Data Encryption

**Encryption At Rest**:
- **Database-Level**: PostgreSQL database encrypted at rest by Supabase
- **Transparent**: Automatic encryption/decryption, no application changes needed
- **Compliance**: Meets standard security requirements (PCI-DSS, GDPR)
- **Key Management**: Encryption keys managed by Supabase or cloud provider

**Encryption In Transit**:
- **SSL/TLS**: All connections to database use SSL/TLS encryption
- **Certificate Validation**: Client validates server certificate
- **No Plaintext**: Unit data never transmitted unencrypted
- **HTTPS**: Web application uses HTTPS for all client-server communication

**Column-Level Encryption**: Not needed for units (no sensitive data)

### Access Control

**Database Users and Roles**:
- **app_read_only**: SELECT only on units table
  - Use Case: Reporting, analytics, read replicas
  - Restrictions: Cannot modify data

- **app_read_write**: SELECT, INSERT, UPDATE on units table
  - Use Case: Main application operations
  - Restrictions: Cannot DELETE (soft delete via UPDATE only)

- **app_admin**: Full access including DELETE
  - Use Case: System administration, data cleanup
  - Restrictions: None (full control)

**Application-Level Roles**:
- **Regular Users**: Can view all active units (SELECT with WHERE deleted_at IS NULL)
- **Department Managers**: Can view all active units
- **Product Managers**: Can create and update units (INSERT, UPDATE)
- **System Administrators**: Full access including soft delete and reactivation

**Authentication**:
- **Strong Passwords**: Minimum 12 characters, complexity requirements
- **Multi-Factor Auth**: Required for admin accounts with write access
- **Session Management**: Secure session tokens, automatic timeout after inactivity
- **API Keys**: Service accounts use API keys with limited scope

**Authorization Checks**:
- **Permission Validation**: Every write operation validates user has required permission
- **Role-Based**: Permissions assigned based on user role
- **Audit Trail**: All access attempts logged (successful and failed)

### Audit Trail

**Audit Logging Requirements**:
- **What**: All INSERT, UPDATE, and DELETE operations on units table
- **Who**: User ID of person performing action (from authenticated session)
- **When**: Timestamp of action (high precision, UTC)
- **What Changed**: Before and after values for UPDATE operations
- **Where From**: IP address and user agent of request
- **Why**: Optional reason/notes field for administrative changes

**Audit Log Retention**:
- **Minimum**: 7 years for compliance
- **Typical**: 10 years or indefinite
- **Storage**: Separate audit table or log aggregation service
- **Access**: Read-only for most users, admins can query for investigations

---

## Backup and Recovery

### Backup Strategy

**Full Backups**:
- **Frequency**: Daily at 2 AM UTC (off-peak hours, minimal impact)
- **Retention**: 30 days online (fast recovery), 90 days in cold storage (archival)
- **Method**: PostgreSQL dump (pg_dump) or Supabase snapshot
- **Location**: Off-site cloud storage in separate geographic region for disaster recovery

**Incremental Backups**:
- **Frequency**: Every 4 hours (6 times per day)
- **Retention**: 7 days (168 hours)
- **Method**: Write-Ahead Log (WAL) archiving
- **Purpose**: Minimize data loss window (RPO ≈ 4 hours max)

**Continuous Archiving**:
- **Method**: WAL streaming to backup server
- **Purpose**: Near-zero Recovery Point Objective (RPO < 1 minute)
- **Benefit**: Point-in-time recovery capability for precise restoration

**Backup Verification**:
- **Weekly Restore Test**: Automated restore to test environment every Sunday
- **Integrity Checks**: Automated checks verify backup files are complete and not corrupted
- **Alert on Failure**: Immediate notification if backup job fails
- **Documentation**: Detailed restore procedures documented and reviewed quarterly

### Backup Contents

**Included in Backup**:
- **Units Table**: All rows including soft-deleted records
- **Indexes**: All indexes recreated during restore
- **Constraints**: Primary key, foreign keys, unique constraints, check constraints
- **Triggers**: Audit triggers, timestamp triggers
- **Table Structure**: Complete DDL for table recreation

**Excluded from Backup** (backed up separately):
- **Audit Logs**: Backed up to separate audit archive system
- **Application Logs**: Stored in log aggregation service

### Recovery Procedures

**Point-in-Time Recovery (PITR)**:
- **Use Case**: Recover from accidental unit deletion or incorrect update
- **Method**: Restore latest full backup, replay WAL logs to specific timestamp
- **Recovery Time Objective (RTO)**: < 2 hours for units table
- **Recovery Point Objective (RPO)**: < 4 hours (time since last incremental backup)
- **Process**:
  1. Stop application writes to prevent further changes
  2. Restore full backup to staging database
  3. Apply WAL logs up to desired recovery point
  4. Verify data correctness
  5. Cutover to restored database

**Full Database Restore**:
- **Use Case**: Complete database corruption or catastrophic failure
- **Method**: Restore entire database from latest full backup
- **RTO**: < 4 hours
- **RPO**: < 24 hours (time since last full backup)
- **Process**:
  1. Provision new database instance
  2. Restore full backup
  3. Verify table structures and constraints
  4. Test application connectivity
  5. Cutover to restored database

**Table-Level Recovery**:
- **Use Case**: Recover specific units without affecting other tables
- **Method**: Restore units table only to staging, copy needed data to production
- **RTO**: < 1 hour
- **Process**:
  1. Restore units table to staging database
  2. Identify and extract needed unit records
  3. Merge data into production units table
  4. Verify foreign key references intact
  5. Update audit trail with recovery action

**Disaster Recovery**:
- **Use Case**: Primary datacenter failure or regional outage
- **Method**: Failover to backup region with replicated database
- **RTO**: < 30 minutes (automated failover)
- **RPO**: < 5 minutes (continuous replication lag)
- **Process**: Automatic failover to standby region, manual verification and testing

### Backup Retention Policy

**Retention Schedule**:
- **Daily Backups**: Keep for 30 days (fast online recovery)
- **Weekly Backups**: Keep for 90 days (3 months)
- **Monthly Backups**: Keep for 1 year (12 monthly backups)
- **Yearly Backups**: Keep for 7 years (compliance requirement)

**Storage Optimization**:
- **Compression**: All backups compressed using gzip (70-80% compression ratio)
- **Tiered Storage**: Move older backups to cheaper storage tiers automatically
  - 0-7 days: Hot storage (fast retrieval)
  - 7-30 days: Warm storage (moderate retrieval)
  - 30+ days: Cold storage (slow retrieval, lowest cost)
- **Deletion**: Automated scripts delete expired backups per retention policy
- **Cost Monitoring**: Track backup storage costs monthly

---

## Data Migration

### Version 1.0.0 - Initial Schema Creation

**Migration Metadata**:
- **Migration File**: `001_create_units_table.sql`
- **Date**: 2024-01-01
- **Author**: Product Management Team
- **Purpose**: Create units table with all fields, constraints, and indexes for initial system deployment

**Migration Steps** (High-Level Description):
1. **Create Extension**: Enable uuid-ossp extension for UUID generation (uuid_generate_v4 function)
2. **Create Table**: Create units table with all columns and appropriate data types
3. **Primary Key**: Add primary key constraint on id column (UUID)
4. **Unique Constraints**: Add unique constraint on UPPER(code) where deleted_at IS NULL
5. **Check Constraints**: Add check constraints for type enum, code length, name length, description length
6. **Foreign Keys**: Add foreign keys for created_by and updated_by referencing users table
7. **Indexes**: Create indexes on type, isActive, created_at, and composite index on (type, isActive)
8. **Triggers**: Create triggers for updated_at auto-update and audit logging
9. **Seed Data**: Insert initial set of common units (KG, L, PC, BOX, CASE, TSP, TBSP, CUP, etc.)
10. **Permissions**: Grant SELECT to app_read_only role, INSERT/UPDATE to app_read_write role

**Seed Data Included** (Initial Reference Units):
- **Weight Units**: KG (Kilogram), G (Gram), LB (Pound), OZ (Ounce) - Type: INVENTORY
- **Volume Units**: L (Liter), ML (Milliliter), GAL (Gallon), QT (Quart) - Type: INVENTORY
- **Count Units**: PC (Piece), PAIR (Pair), DOZEN (Dozen), SET (Set) - Type: INVENTORY
- **Packaging Units**: BOX (Box), CASE (Case), PALLET (Pallet), CRATE (Crate) - Type: ORDER
- **Recipe Units**: TSP (Teaspoon), TBSP (Tablespoon), CUP (Cup), PINCH (Pinch) - Type: RECIPE
- Total: Approximately 20-30 common units

**Verification Steps**:
- Query units table to verify structure: SELECT * FROM information_schema.columns WHERE table_name = 'units'
- Verify constraints: SELECT * FROM information_schema.table_constraints WHERE table_name = 'units'
- Test unique constraint: Attempt to insert duplicate code (should fail)
- Test check constraints: Attempt to insert invalid type (should fail)
- Verify triggers: Update a unit and check updated_at changed automatically
- Confirm seed data: SELECT COUNT(*) FROM units WHERE deleted_at IS NULL (should return 20-30)

**Rollback Plan**:
1. Drop audit log trigger
2. Drop auto-update trigger
3. Drop all indexes on units table
4. Drop foreign key constraints
5. Drop units table entirely (CASCADE to remove dependencies)
6. Verify clean rollback: Table should not exist

---

### Version 1.1.0 - Add Description Field (Example Future Migration)

**Migration Metadata**:
- **Migration File**: `002_add_description_to_units.sql`
- **Date**: 2024-06-15 (Example)
- **Author**: Product Management Team
- **Purpose**: Add optional description field to units table for better documentation

**Migration Steps** (High-Level Description):
1. Add description column as VARCHAR(500), NULLABLE
2. Backfill existing units with default descriptions based on name (optional)
3. Add check constraint: description IS NULL OR LENGTH(description) <= 500
4. Update audit trigger to include description in change tracking
5. Grant permissions on new column

**Backfill Strategy**:
- Leave description NULL for existing units (optional field)
- Or generate basic description from name: description = 'Standard ' || name || ' measurement'
- No batching needed (units table is tiny)

**Verification Steps**:
- Verify column exists: SELECT description FROM units LIMIT 1
- Check constraint works: Attempt insert with 501-character description (should fail)
- Verify backfill: SELECT COUNT(*) FROM units WHERE description IS NOT NULL
- Test update: Update description and verify updated_at changed

**Rollback Plan**:
1. Drop check constraint on description
2. Drop description column from units table
3. Verify rollback: Column should not exist

---

## Data Quality

### Data Quality Dimensions

**Completeness**:
- **Metric**: % of units with all required fields populated (id, code, name, type, isActive)
- **Target**: 100% (enforced by NOT NULL constraints)
- **Monitoring**: Check for NULL values in required fields (should be impossible)

**Accuracy**:
- **Metric**: % of units with correct unit types for their usage
- **Target**: 100%
- **Validation**: Base units for products are INVENTORY type, recipe ingredients use RECIPE or INVENTORY types
- **Monitoring**: Query for products with non-INVENTORY base units, recipe ingredients with ORDER type units

**Consistency**:
- **Metric**: % of unit codes matching uppercase format standard
- **Target**: 100%
- **Validation**: All codes should be uppercase alphanumeric only
- **Monitoring**: Query for codes with lowercase or special characters (should be none)

**Validity**:
- **Metric**: % of units with valid type enum values
- **Target**: 100% (enforced by CHECK constraint)
- **Monitoring**: Verify type IN ('INVENTORY', 'ORDER', 'RECIPE')

**Uniqueness**:
- **Metric**: % of units with unique codes (case-insensitive)
- **Target**: 100% (enforced by UNIQUE constraint)
- **Monitoring**: Check for duplicate UPPER(code) values among active units (should be none)

**Timeliness**:
- **Metric**: Average time between unit creation and first usage in products/recipes
- **Target**: < 24 hours (units should be used soon after creation)
- **Monitoring**: Track created_at vs. first reference in related tables

### Data Quality Checks

**Automated Quality Checks** (Run daily via scheduled job):

**Check for Null Required Fields**:
```
Purpose: Verify NOT NULL constraints are enforced (should always pass)
Query Logic: SELECT COUNT(*) FROM units WHERE id IS NULL OR code IS NULL OR name IS NULL OR type IS NULL OR isActive IS NULL
Expected Result: 0 rows (no null values in required fields)
Action: Alert database administrator if any nulls found (indicates constraint failure)
```

**Check for Invalid Type Values**:
```
Purpose: Ensure type field contains only allowed enum values
Query Logic: SELECT COUNT(*) FROM units WHERE type NOT IN ('INVENTORY', 'ORDER', 'RECIPE')
Expected Result: 0 rows (all types valid)
Action: Alert and investigate if invalid types found (indicates constraint bypass)
```

**Check for Duplicate Codes**:
```
Purpose: Verify code uniqueness among active units
Query Logic: SELECT UPPER(code), COUNT(*) FROM units WHERE deleted_at IS NULL GROUP BY UPPER(code) HAVING COUNT(*) > 1
Expected Result: 0 rows (no duplicate codes)
Action: Alert and resolve duplicates immediately (indicates unique constraint failure)
```

**Check for Lowercase or Invalid Code Format**:
```
Purpose: Verify all codes are uppercase alphanumeric
Query Logic: SELECT * FROM units WHERE code ~ '[a-z]' OR code ~ '[^A-Z0-9]'
Expected Result: 0 rows (all codes properly formatted)
Action: Update codes to uppercase, remove special characters
```

**Check for Referenced Inactive Units**:
```
Purpose: Find active products/recipes referencing inactive units (data inconsistency)
Query Logic: SELECT units.code, units.isActive, COUNT(products.id) FROM units LEFT JOIN products ON units.id = products.base_unit WHERE units.isActive = false AND products.deleted_at IS NULL GROUP BY units.id
Expected Result: 0 products referencing inactive units
Action: Reactivate units or update products to use active units
```

**Check for Orphaned Foreign Keys**:
```
Purpose: Find units with invalid created_by or updated_by references
Query Logic: SELECT * FROM units WHERE created_by NOT IN (SELECT id FROM users) OR updated_by NOT IN (SELECT id FROM users)
Expected Result: Some units may have NULL created_by or updated_by if users deleted (acceptable)
Action: No action needed (foreign key cascade allows NULL)
```

**Check for Unreferenced Units**:
```
Purpose: Identify units that are not used by any products, recipes, or transactions (potential cleanup)
Query Logic: Complex query joining units with products, product_units, recipe_ingredients, inventory_transactions, purchase_order_items to find units with 0 references
Expected Result: Some units may be unreferenced (newly created or obsolete)
Action: Review unreferenced units, potentially deactivate obsolete ones
```

**Check for Inconsistent Audit Timestamps**:
```
Purpose: Verify updated_at >= created_at (data integrity)
Query Logic: SELECT * FROM units WHERE updated_at < created_at
Expected Result: 0 rows (updated_at should always be >= created_at)
Action: Investigate and correct timestamp inconsistencies
```

### Data Quality Monitoring

**Quality Metrics Dashboard**:
- **Completeness Score**: % of units with complete required fields (target: 100%)
- **Accuracy Score**: % of units with correct type usage (target: 100%)
- **Consistency Score**: % of units with proper code format (target: 100%)
- **Uniqueness Score**: % of units with unique codes (target: 100%)
- **Reference Score**: % of units referenced by at least one entity (target: 80%+)
- **Daily Trend**: Quality scores over time (should remain stable at 100%)

**Alerting Thresholds**:
- **Critical**: Any check returns > 0 results (immediate alert to database admin)
- **Warning**: Unreferenced units count increases significantly (review for cleanup)
- **Info**: New units added (notification to product management team)

**Quality Reports**:
- **Daily Report**: Summary of all quality checks, pass/fail status
- **Weekly Report**: Trends over past week, any emerging patterns
- **Monthly Report**: Quality score trends, recommendations for improvements
- **Quarterly Review**: Comprehensive analysis, identify opportunities for optimization

---

## Testing Data

### Test Data Requirements

**Test Environments**:
- **Development**: Full set of realistic test units covering all types
- **Staging**: Copy of production units (no sanitization needed, no sensitive data)
- **Testing**: Mix of real units and specific test scenarios
- **Demo**: Curated set of well-documented units for demonstrations

**Data Sanitization**: Not needed for units (public reference data, no sensitive information)

### Test Data Generation

**Manual Test Units** (Well-Known Test Data):
```
ID: 550e8400-e29b-41d4-a716-446655440099
Code: TEST-KG
Name: Test Kilogram
Description: Test weight unit for development and testing
Type: INVENTORY
Is Active: true
Created By: Test Admin User

ID: 550e8400-e29b-41d4-a716-446655440098
Code: TEST-CASE
Name: Test Case
Description: Test packaging unit for order testing
Type: ORDER
Is Active: true
Created By: Test Admin User

ID: 550e8400-e29b-41d4-a716-446655440097
Code: TEST-TSP
Name: Test Teaspoon
Description: Test recipe unit for recipe testing
Type: RECIPE
Is Active: true
Created By: Test Admin User
```

**Generated Test Units** (For Volume Testing):
```
Generate 20 test units:
- Codes: TEST-UNIT-001 through TEST-UNIT-020
- Names: Test Unit 001 through Test Unit 020
- Types: Randomized across INVENTORY, ORDER, RECIPE
- Active: Mix of true and false for testing both states
- Created dates: Random dates within past year
```

**Realistic Test Data**:
- Use realistic unit codes: "KG", "ML", "BOX" (not "UNIT1", "UNIT2")
- Use descriptive names: "Kilogram", "Milliliter" (not "Test Unit 1")
- Vary types across realistic distribution: 50% INVENTORY, 30% ORDER, 20% RECIPE
- Include both active and inactive units for status filtering tests

### Test Scenarios

**Constraint Testing**:
- **Unique Code**: Attempt to insert duplicate code (should fail)
- **Code Length**: Insert code with 1 character (should fail), 11 characters (should fail)
- **Name Length**: Insert name with 1 character (should fail), 101 characters (should fail)
- **Type Validation**: Insert unit with type "INVALID" (should fail)
- **Required Fields**: Attempt insert without code, name, or type (should fail)

**Business Logic Testing**:
- **Code Immutability**: Update code on referenced unit (should fail)
- **Code Immutability**: Update code on unreferenced unit (should succeed)
- **Soft Delete**: Set deleted_at to current timestamp (should succeed)
- **Reactivation**: Set deleted_at back to NULL (should succeed if no code conflicts)
- **Delete Restriction**: Attempt to delete unit referenced by products (should fail with RESTRICT error)

**Query Performance Testing**:
- **Full Table Scan**: Query all units including inactive (should complete in < 30ms)
- **Filtered Query**: Query active units of specific type (should use composite index, < 25ms)
- **Code Lookup**: Query by specific code (should use unique index, < 10ms)
- **ID Lookup**: Query by UUID (should use primary key index, < 5ms)

**Referential Integrity Testing**:
- **Foreign Key Creation**: Create unit with valid created_by user ID (should succeed)
- **Foreign Key Violation**: Create unit with non-existent created_by (should fail)
- **Cascade Behavior**: Delete user, verify unit's created_by set to NULL (SET NULL cascade)
- **Restrict Behavior**: Attempt to delete unit referenced by product (should fail with RESTRICT error)

### Test Data Cleanup

**Cleanup Strategy**:
- **Identifiable Pattern**: All test units have codes starting with "TEST-" prefix
- **Automated Cleanup**: Script to delete all units WHERE code LIKE 'TEST-%'
- **Separate Test Department**: Optionally create test data in specific department context
- **Regular Cleanup**: Remove old test data weekly to keep test environment clean

**Cleanup Query Example**:
```
Delete test units:
- WHERE code LIKE 'TEST-%'
- WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%test%')
- WHERE description LIKE '%test%' OR description LIKE '%Test%'
```

**Cleanup Verification**:
- Check no test units remain: SELECT COUNT(*) FROM units WHERE code LIKE 'TEST-%'
- Verify production units unaffected: SELECT COUNT(*) FROM units WHERE deleted_at IS NULL
- Check foreign key references: Verify no products/recipes referencing deleted test units

---

## Glossary

**Database Terms**:
- **Primary Key**: Unique identifier for each unit (UUID), cannot be null or duplicate
- **Foreign Key**: Column referencing primary key of another table (created_by → users.id)
- **Index**: Database structure improving query performance (B-tree, composite, partial)
- **Constraint**: Rule enforced by database to maintain data integrity (UNIQUE, CHECK, NOT NULL)
- **Cascade**: Automatic propagation of changes (SET NULL when user deleted)
- **Transaction**: Group of database operations that succeed or fail together (atomic operation)
- **ACID**: Atomicity, Consistency, Isolation, Durability - transaction guarantees

**PostgreSQL-Specific Terms**:
- **UUID**: Universally Unique Identifier, 128-bit value for primary keys (550e8400-...)
- **TIMESTAMPTZ**: Timestamp with timezone, stores UTC with offset
- **BOOLEAN**: True/false data type (isActive field)
- **VARCHAR(n)**: Variable-length character string with maximum length (code, name, description)
- **CHECK Constraint**: Constraint validating field values (type IN (...), LENGTH(...) BETWEEN)
- **Partial Index**: Index with WHERE clause, indexes subset of rows (deleted_at IS NULL)
- **B-tree Index**: Default index type for equality and range queries (id, code, type)
- **RESTRICT**: Foreign key behavior preventing parent deletion if children exist

**Application Terms**:
- **Soft Delete**: Marking record deleted (deleted_at timestamp) instead of removing (preserves history)
- **Audit Trail**: Historical record of changes (who, what, when) in audit_logs table
- **Reference Data**: Master data used by many other entities (units, currencies, statuses)
- **Immutable Field**: Field that cannot be changed after creation (code after use, created_at always)
- **Base Unit**: Primary measurement unit for inventory (products.base_unit references units.id)

**Business Terms**:
- **Unit**: Measurement standard for quantities (Kilogram, Liter, Piece, Case)
- **Unit Code**: Short identifier for unit (KG, ML, PC, BOX, TSP) - uppercase alphanumeric
- **Unit Type**: Classification of unit usage (INVENTORY, ORDER, RECIPE)
- **Conversion Factor**: Ratio between alternative unit and base unit (1 CASE = 24 bottles)
- **Active Status**: Whether unit is available for use in new records (isActive true/false)

---

## Related Documents

- [Business Requirements (BR-units.md)](./BR-units.md) - Functional requirements and business rules
- [Use Cases (UC-units.md)](./UC-units.md) - Detailed user workflows and scenarios
- [Technical Specification (TS-units.md)](./TS-units.md) - System architecture and implementation
- [Flow Diagrams (FD-units.md)](./FD-units.md) - Visual workflow and ERD diagrams
- [Validation Rules (VAL-units.md)](./VAL-units.md) - Comprehensive validation specifications

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Database Architect | | | |
| Product Management Lead | | | |
| Development Team Lead | | | |
| Security Officer | | | |

---

**Document End**

> 📝 **Note to Authors**:
> - Extracted data definitions from actual implementation and mock data
> - Used descriptive text format (no SQL code as per template guidelines)
> - Focused on business meaning of data and relationships
> - Included realistic sample data from hospitality context
> - Documented constraints and rules in plain language
> - Described indexing strategy conceptually without SQL
> - Explained cascade behaviors and referential integrity clearly
> - All examples use hospitality-focused scenarios (kitchen, products, recipes)
> - Update this document when schema changes based on implementation
> - Review with database team and stakeholders before deployment
