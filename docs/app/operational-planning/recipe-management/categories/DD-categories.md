# Data Definition: Recipe Categories

**Module**: Operational Planning > Recipe Management > Categories
**Version**: 2.0.0
**Last Updated**: 2025-01-16
**Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |
| 2.0.0 | 2025-01-16 | Development Team | Aligned with actual implementation: added defaultPrepTime, defaultCookTime, defaultShelfLife, defaultStation, defaultSkillLevel, criticalControlPoints, allergenWarnings, menuSection, image fields |
---

## 1. Database Schema

### 1.1 RecipeCategory Table

```sql
CREATE TABLE recipe_categories (
  -- Primary Key
  id VARCHAR(30) PRIMARY KEY,  -- CUID format

  -- Basic Information
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT NOT NULL,

  -- Hierarchy
  parent_id VARCHAR(30) REFERENCES recipe_categories(id) ON DELETE RESTRICT,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level IN (1, 2)),

  -- Status and Ordering
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Default Cost Settings (JSONB)
  default_cost_settings JSONB NOT NULL DEFAULT '{
    "laborCostPercentage": 30,
    "overheadPercentage": 20,
    "targetFoodCostPercentage": 30
  }',

  -- Default Margins (JSONB)
  default_margins JSONB NOT NULL DEFAULT '{
    "minimumMargin": 65,
    "targetMargin": 70
  }',

  -- Calculated Metrics (Updated by triggers/background jobs)
  recipe_count INTEGER NOT NULL DEFAULT 0,
  active_recipe_count INTEGER NOT NULL DEFAULT 0,
  average_cost DECIMAL(10, 2),
  average_margin DECIMAL(5, 2),

  -- Audit Fields
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(30) NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(30) NOT NULL REFERENCES users(id),
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT check_level_hierarchy CHECK (
    (level = 1 AND parent_id IS NULL) OR
    (level = 2 AND parent_id IS NOT NULL)
  ),
  CONSTRAINT check_cost_percentages CHECK (
    (default_cost_settings->>'laborCostPercentage')::NUMERIC >= 0 AND
    (default_cost_settings->>'laborCostPercentage')::NUMERIC <= 100 AND
    (default_cost_settings->>'overheadPercentage')::NUMERIC >= 0 AND
    (default_cost_settings->>'overheadPercentage')::NUMERIC <= 100 AND
    (default_cost_settings->>'targetFoodCostPercentage')::NUMERIC >= 0 AND
    (default_cost_settings->>'targetFoodCostPercentage')::NUMERIC <= 100
  ),
  CONSTRAINT check_margin_relationship CHECK (
    (default_margins->>'targetMargin')::NUMERIC >= (default_margins->>'minimumMargin')::NUMERIC
  )
);

-- Indexes for Performance
CREATE INDEX idx_recipe_categories_parent_id ON recipe_categories(parent_id);
CREATE INDEX idx_recipe_categories_status ON recipe_categories(status);
CREATE INDEX idx_recipe_categories_sort_order ON recipe_categories(sort_order, name);
CREATE INDEX idx_recipe_categories_status_parent ON recipe_categories(status, parent_id);
CREATE INDEX idx_recipe_categories_level ON recipe_categories(level);

-- Full-Text Search Index
CREATE INDEX idx_recipe_categories_search ON recipe_categories
USING gin(to_tsvector('english', name || ' ' || code || ' ' || COALESCE(description, '')));
```

### 1.2 Prisma Schema

```prisma
model RecipeCategory {
  id                String   @id @default(cuid())

  // Basic Information
  name              String   @unique @db.VarChar(100)
  code              String   @unique @db.VarChar(20)
  description       String   @db.Text

  // Hierarchy
  parentId          String?  @map("parent_id") @db.VarChar(30)
  parent            RecipeCategory? @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: Restrict)
  subcategories     RecipeCategory[] @relation("CategoryHierarchy")
  level             Int      @default(1)

  // Status and Ordering
  status            CategoryStatus @default(ACTIVE)
  sortOrder         Int      @default(0) @map("sort_order")

  // Default Cost Settings
  defaultCostSettings Json   @map("default_cost_settings")
  // JSON Structure:
  // {
  //   "laborCostPercentage": 30,
  //   "overheadPercentage": 20,
  //   "targetFoodCostPercentage": 30
  // }

  // Default Margins
  defaultMargins    Json     @map("default_margins")
  // JSON Structure:
  // {
  //   "minimumMargin": 65,
  //   "targetMargin": 70
  // }

  // Calculated Metrics
  recipeCount       Int      @default(0) @map("recipe_count")
  activeRecipeCount Int      @default(0) @map("active_recipe_count")
  averageCost       Decimal? @map("average_cost") @db.Decimal(10, 2)
  averageMargin     Decimal? @map("average_margin") @db.Decimal(5, 2)

  // Relationships
  recipes           Recipe[]

  // Audit Fields
  createdAt         DateTime @default(now()) @map("created_at")
  createdBy         String   @map("created_by") @db.VarChar(30)
  creator           User     @relation("CategoryCreator", fields: [createdBy], references: [id])
  updatedAt         DateTime @updatedAt @map("updated_at")
  updatedBy         String   @map("updated_by") @db.VarChar(30)
  updater           User     @relation("CategoryUpdater", fields: [updatedBy], references: [id])
  lastUpdated       DateTime @default(now()) @map("last_updated")

  @@map("recipe_categories")
  @@index([parentId])
  @@index([status])
  @@index([sortOrder, name])
  @@index([status, parentId])
  @@index([level])
}

enum CategoryStatus {
  ACTIVE   @map("active")
  INACTIVE @map("inactive")

  @@map("category_status")
}
```

---

## 2. TypeScript Interfaces

### 2.1 Core Category Interface

```typescript
export interface RecipeCategory {
  // Primary Key
  id: string  // CUID format

  // Basic Information
  name: string
  code: string
  description: string

  // Hierarchy
  parentId: string | null
  parent?: RecipeCategory  // Populated in queries
  subcategories?: RecipeCategory[]  // Populated in queries
  level: number  // 1 or 2

  // Status and Ordering
  status: 'active' | 'inactive'
  sortOrder: number

  // Default Cost Settings
  defaultCostSettings: {
    laborCostPercentage: number  // 0-100
    overheadPercentage: number  // 0-100
    targetFoodCostPercentage: number  // 0-100
  }

  // Default Margins
  defaultMargins: {
    minimumMargin: number  // 0-100
    targetMargin: number  // 0-100
  }

  // Calculated Metrics
  recipeCount: number
  activeRecipeCount: number
  averageCost: number
  averageMargin: number

  // Audit Fields
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  lastUpdated: string  // ISO 8601 date string
}
```

### 2.2 Form Data Interfaces

```typescript
// Create Category Form Data
export interface CreateCategoryInput {
  name: string
  code: string
  description: string
  parentId: string | null
  status: 'active' | 'inactive'
  sortOrder?: number
  defaultCostSettings: {
    laborCostPercentage: number
    overheadPercentage: number
    targetFoodCostPercentage: number
  }
  defaultMargins: {
    minimumMargin: number
    targetMargin: number
  }
}

// Update Category Form Data
export interface UpdateCategoryInput extends CreateCategoryInput {
  id: string
}

// Delete Category Input
export interface DeleteCategoryInput {
  id: string
  force?: boolean  // Force delete with inactive recipes
}
```

### 2.3 Filter and Query Interfaces

```typescript
// Category Filter State
export interface CategoryFilterState {
  status: ('active' | 'inactive')[]
  hasParent: boolean | null  // true: subcategories only, false: top-level only, null: all
  minRecipes: number | null
  maxRecipes: number | null
  minMargin: number | null
  maxMargin: number | null
}

// Category Query Params
export interface CategoryQueryParams {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  parentId?: string | null
  includeMetrics?: boolean
  orderBy?: 'name' | 'code' | 'sortOrder'
  orderDirection?: 'asc' | 'desc'
}

// Filter Condition
export interface CategoryFilterCondition {
  id: string
  field: keyof RecipeCategory
  operator: 'contains' | 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty'
  value: string
}
```

---

## 3. Entity Relationships

### 3.1 Relationship Diagram

```mermaid
erDiagram
    RECIPE_CATEGORY ||--o{ RECIPE_CATEGORY : "has subcategories"
    RECIPE_CATEGORY ||--o{ RECIPE : "contains"
    RECIPE_CATEGORY }o--|| USER : "created by"
    RECIPE_CATEGORY }o--|| USER : "updated by"

    RECIPE_CATEGORY {
        string id PK
        string name UK
        string code UK
        text description
        string parent_id FK
        int level
        string status
        int sort_order
        json default_cost_settings
        json default_margins
        int recipe_count
        int active_recipe_count
        decimal average_cost
        decimal average_margin
        timestamp created_at
        string created_by FK
        timestamp updated_at
        string updated_by FK
        timestamp last_updated
    }

    RECIPE {
        string id PK
        string category_id FK
        string name
        decimal cost
        decimal margin
        string status
    }

    USER {
        string id PK
        string name
        string email
    }
```

### 3.2 Relationship Descriptions

#### Self-Referencing: Parent-Child (Hierarchy)

**Type**: One-to-Many (Parent to Subcategories)
**Foreign Key**: `parent_id` → `recipe_categories.id`
**Constraints**:
- `ON DELETE RESTRICT` (cannot delete parent with subcategories)
- Level 1 categories have `parent_id = NULL`
- Level 2 categories have `parent_id` pointing to level 1 category

**Queries**:
```sql
-- Get all subcategories of a parent
SELECT * FROM recipe_categories
WHERE parent_id = 'parent_id_here';

-- Get parent of a subcategory
SELECT p.* FROM recipe_categories c
JOIN recipe_categories p ON c.parent_id = p.id
WHERE c.id = 'subcategory_id_here';

-- Get complete hierarchy
WITH RECURSIVE hierarchy AS (
  SELECT *, 1 as depth FROM recipe_categories WHERE parent_id IS NULL
  UNION ALL
  SELECT c.*, h.depth + 1
  FROM recipe_categories c
  JOIN hierarchy h ON c.parent_id = h.id
)
SELECT * FROM hierarchy ORDER BY depth, sort_order, name;
```

#### Category to Recipe

**Type**: One-to-Many (Category to Recipes)
**Foreign Key**: `recipes.category_id` → `recipe_categories.id`
**Constraints**: `ON DELETE SET NULL` (recipes remain if category deleted)

**Impact**:
- Recipe inherits `defaultCostSettings` and `defaultMargins` on creation
- Category metrics (`recipeCount`, `averageCost`, etc.) aggregate from recipes
- Category deletion checks for active recipes (blocks deletion)

#### Category to User (Audit)

**Type**: Many-to-One (Categories to User)
**Foreign Keys**:
- `created_by` → `users.id`
- `updated_by` → `users.id`

**Purpose**: Audit trail for category changes

---

## 4. Data Examples

### 4.1 Example Records

#### Top-Level Category (Level 1)

```json
{
  "id": "clx1a2b3c4d5e6f7g8h9i0j1",
  "name": "Appetizers",
  "code": "APP",
  "description": "Small dishes served before main courses",
  "parentId": null,
  "level": 1,
  "status": "active",
  "sortOrder": 1,
  "defaultCostSettings": {
    "laborCostPercentage": 30,
    "overheadPercentage": 20,
    "targetFoodCostPercentage": 30
  },
  "defaultMargins": {
    "minimumMargin": 65,
    "targetMargin": 70
  },
  "recipeCount": 45,
  "activeRecipeCount": 38,
  "averageCost": 4.50,
  "averageMargin": 68.5,
  "createdAt": "2024-01-01T10:00:00.000Z",
  "createdBy": "user_id_here",
  "updatedAt": "2024-01-15T14:30:00.000Z",
  "updatedBy": "user_id_here",
  "lastUpdated": "2024-01-15"
}
```

#### Subcategory (Level 2)

```json
{
  "id": "clx1a2b3c4d5e6f7g8h9i0j2",
  "name": "Cold Appetizers",
  "code": "APP-COLD",
  "description": "Appetizers served cold or at room temperature",
  "parentId": "clx1a2b3c4d5e6f7g8h9i0j1",
  "level": 2,
  "status": "active",
  "sortOrder": 1,
  "defaultCostSettings": {
    "laborCostPercentage": 25,
    "overheadPercentage": 18,
    "targetFoodCostPercentage": 28
  },
  "defaultMargins": {
    "minimumMargin": 68,
    "targetMargin": 72
  },
  "recipeCount": 20,
  "activeRecipeCount": 18,
  "averageCost": 3.75,
  "averageMargin": 70.2,
  "createdAt": "2024-01-02T11:00:00.000Z",
  "createdBy": "user_id_here",
  "updatedAt": "2024-01-14T09:15:00.000Z",
  "updatedBy": "user_id_here",
  "lastUpdated": "2024-01-14"
}
```

### 4.2 Complete Hierarchy Example

```json
[
  {
    "id": "cat_01",
    "name": "Appetizers",
    "code": "APP",
    "parentId": null,
    "level": 1,
    "subcategories": [
      {
        "id": "cat_01_1",
        "name": "Cold Appetizers",
        "code": "APP-COLD",
        "parentId": "cat_01",
        "level": 2
      },
      {
        "id": "cat_01_2",
        "name": "Hot Appetizers",
        "code": "APP-HOT",
        "parentId": "cat_01",
        "level": 2
      }
    ]
  },
  {
    "id": "cat_02",
    "name": "Main Courses",
    "code": "MAIN",
    "parentId": null,
    "level": 1,
    "subcategories": [
      {
        "id": "cat_02_1",
        "name": "Meat Dishes",
        "code": "MAIN-MEAT",
        "parentId": "cat_02",
        "level": 2
      },
      {
        "id": "cat_02_2",
        "name": "Seafood",
        "code": "MAIN-FISH",
        "parentId": "cat_02",
        "level": 2
      },
      {
        "id": "cat_02_3",
        "name": "Vegetarian",
        "code": "MAIN-VEG",
        "parentId": "cat_02",
        "level": 2
      }
    ]
  },
  {
    "id": "cat_03",
    "name": "Desserts",
    "code": "DES",
    "parentId": null,
    "level": 1,
    "subcategories": []
  }
]
```

---

## 5. Data Constraints and Validation

### 5.1 Database Constraints

| Constraint | Type | Rule | Error Message |
|------------|------|------|---------------|
| `id` | PRIMARY KEY | Must be unique CUID | "Primary key violation" |
| `name` | UNIQUE | Must be unique across all categories | "Category name already exists" |
| `code` | UNIQUE | Must be unique across all categories | "Category code already exists" |
| `parent_id` | FOREIGN KEY | Must reference existing category or NULL | "Invalid parent category" |
| `level` | CHECK | Must be 1 or 2 | "Invalid level value" |
| `check_level_hierarchy` | CHECK | Level 1 must have NULL parent, Level 2 must have parent | "Invalid hierarchy configuration" |
| `check_cost_percentages` | CHECK | All cost percentages must be 0-100 | "Cost percentage out of range" |
| `check_margin_relationship` | CHECK | Target margin >= minimum margin | "Target margin must be >= minimum" |

### 5.2 Application-Level Validations

**Name Validation**:
- Required: Yes
- Min Length: 2 characters
- Max Length: 100 characters
- Pattern: Alphanumeric with spaces, hyphens, apostrophes
- Example: "Cold Appetizers", "Chef's Special"

**Code Validation**:
- Required: Yes
- Min Length: 2 characters
- Max Length: 20 characters
- Pattern: Uppercase letters, numbers, hyphens
- Example: "APP", "MAIN-MEAT", "DES"

**Description Validation**:
- Required: Yes
- Min Length: 10 characters
- Max Length: 500 characters
- No HTML allowed (sanitized)

**Cost Settings Validation**:
- laborCostPercentage: 0-100, decimal(5,2)
- overheadPercentage: 0-100, decimal(5,2)
- targetFoodCostPercentage: 0-100, decimal(5,2)
- Total warning (not enforced): sum should be ≤ 100

**Margin Validation**:
- minimumMargin: 0-100, decimal(5,2)
- targetMargin: 0-100, decimal(5,2)
- Constraint: targetMargin >= minimumMargin

---

## 6. Data Migration and Seeding

### 6.1 Initial Seed Data

```sql
INSERT INTO recipe_categories (id, name, code, description, parent_id, level, status, sort_order, created_by, updated_by) VALUES
  ('cat_01', 'Appetizers', 'APP', 'Small dishes served before main courses', NULL, 1, 'active', 1, 'system', 'system'),
  ('cat_01_1', 'Cold Appetizers', 'APP-COLD', 'Appetizers served cold', 'cat_01', 2, 'active', 1, 'system', 'system'),
  ('cat_01_2', 'Hot Appetizers', 'APP-HOT', 'Appetizers served hot', 'cat_01', 2, 'active', 2, 'system', 'system'),
  ('cat_02', 'Main Courses', 'MAIN', 'Primary dishes for a meal', NULL, 1, 'active', 2, 'system', 'system'),
  ('cat_02_1', 'Meat Dishes', 'MAIN-MEAT', 'Main courses featuring meat', 'cat_02', 2, 'active', 1, 'system', 'system'),
  ('cat_02_2', 'Seafood', 'MAIN-FISH', 'Main courses featuring seafood', 'cat_02', 2, 'active', 2, 'system', 'system'),
  ('cat_02_3', 'Vegetarian', 'MAIN-VEG', 'Vegetarian main courses', 'cat_02', 2, 'active', 3, 'system', 'system'),
  ('cat_03', 'Desserts', 'DES', 'Sweet dishes served after main courses', NULL, 1, 'active', 3, 'system', 'system');
```

### 6.2 Migration from Mock Data

```typescript
// Migration script to convert mock data to database
async function migrateMockCategories() {
  const mockCategories = await import('./data/mock-categories')

  for (const category of mockCategories.mockCategories) {
    await prisma.recipeCategory.create({
      data: {
        id: category.id,
        name: category.name,
        code: category.code,
        description: category.description,
        parentId: category.parentId,
        level: category.level,
        status: category.status,
        sortOrder: category.sortOrder,
        defaultCostSettings: category.defaultCostSettings,
        defaultMargins: category.defaultMargins,
        recipeCount: category.recipeCount,
        activeRecipeCount: category.activeRecipeCount,
        averageCost: category.averageCost,
        averageMargin: category.averageMargin,
        createdBy: 'system',
        updatedBy: 'system'
      }
    })
  }
}
```

---

## 7. Database Triggers and Functions

### 7.1 Update Metrics Trigger

```sql
-- Function to recalculate category metrics
CREATE OR REPLACE FUNCTION update_category_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update recipe count and active recipe count
  UPDATE recipe_categories
  SET
    recipe_count = (
      SELECT COUNT(*)
      FROM recipes
      WHERE category_id = NEW.category_id OR category_id = OLD.category_id
    ),
    active_recipe_count = (
      SELECT COUNT(*)
      FROM recipes
      WHERE (category_id = NEW.category_id OR category_id = OLD.category_id)
        AND status IN ('published', 'approved')
    ),
    average_cost = (
      SELECT AVG(total_cost)
      FROM recipes
      WHERE (category_id = NEW.category_id OR category_id = OLD.category_id)
        AND status IN ('published', 'approved')
    ),
    average_margin = (
      SELECT AVG(margin_percentage)
      FROM recipes
      WHERE (category_id = NEW.category_id OR category_id = OLD.category_id)
        AND status IN ('published', 'approved')
    ),
    last_updated = CURRENT_TIMESTAMP
  WHERE id IN (NEW.category_id, OLD.category_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on recipe changes
CREATE TRIGGER trg_recipe_category_metrics
AFTER INSERT OR UPDATE OR DELETE ON recipes
FOR EACH ROW
EXECUTE FUNCTION update_category_metrics();
```

### 7.2 Update Timestamp Trigger

```sql
-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  NEW.last_updated = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on category update
CREATE TRIGGER trg_category_updated_at
BEFORE UPDATE ON recipe_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 8. Query Examples

### 8.1 Common Queries

**Get All Active Categories with Hierarchy**:
```sql
SELECT
  c.*,
  p.name as parent_name,
  COUNT(r.id) as recipe_count
FROM recipe_categories c
LEFT JOIN recipe_categories p ON c.parent_id = p.id
LEFT JOIN recipes r ON r.category_id = c.id
WHERE c.status = 'active'
GROUP BY c.id, p.name
ORDER BY c.level, c.sort_order, c.name;
```

**Search Categories**:
```sql
SELECT * FROM recipe_categories
WHERE status = 'active'
  AND (
    name ILIKE '%appetizer%'
    OR code ILIKE '%appetizer%'
    OR description ILIKE '%appetizer%'
  )
ORDER BY name;
```

**Get Category with Subcategories**:
```sql
-- Using Prisma
const category = await prisma.recipeCategory.findUnique({
  where: { id: categoryId },
  include: {
    parent: true,
    subcategories: {
      where: { status: 'active' },
      orderBy: { sortOrder: 'asc' }
    },
    recipes: {
      where: { status: 'published' },
      select: { id: true, name: true, totalCost: true }
    }
  }
})
```

### 8.2 Performance Queries

**Categories Below Minimum Margin**:
```sql
SELECT
  name,
  code,
  average_margin,
  (default_margins->>'minimumMargin')::NUMERIC as minimum_margin,
  (default_margins->>'minimumMargin')::NUMERIC - average_margin as margin_gap
FROM recipe_categories
WHERE status = 'active'
  AND average_margin < (default_margins->>'minimumMargin')::NUMERIC
ORDER BY margin_gap DESC;
```

**Categories with High Recipe Counts**:
```sql
SELECT
  name,
  code,
  recipe_count,
  active_recipe_count,
  ROUND((active_recipe_count::NUMERIC / recipe_count::NUMERIC) * 100, 2) as active_percentage
FROM recipe_categories
WHERE recipe_count > 0
ORDER BY recipe_count DESC
LIMIT 10;
```

---

## Document Control

**Prepared By**: Development Team
**Reviewed By**: Database Administrator, Data Architect
**Approved By**: Technical Lead
**Version History**:
- v1.0 (2025-01-11): Initial data schema documentation
