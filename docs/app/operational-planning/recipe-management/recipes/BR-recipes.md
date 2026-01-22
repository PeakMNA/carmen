# Recipe Management - Business Requirements (BR)

## Document Information
- **Document Type**: Business Requirements Document
- **Module**: Operational Planning > Recipe Management > Recipes
- **Version**: 2.0.0
- **Last Updated**: 2025-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial business requirements document created |
| 2.0.0 | 2025-01-16 | Development Team | Aligned with actual implementation: updated RecipeStatus enum (draft, published, archived, under_review, approved, rejected), RecipeComplexity (simple, moderate, complex, advanced), added quality control workflow, enhanced audit trail fields |


## 1. Overview

### 1.1 Purpose
The Recipe Management module provides comprehensive tools for creating, managing, and costing recipes used in food service operations. It enables kitchen staff and management to maintain standardized recipes, calculate accurate food costs, analyze pricing strategies, and support fractional sales scenarios (e.g., selling pizza by the slice or whole).

### 1.2 Scope
This document defines business requirements for:
- Recipe creation and lifecycle management
- Ingredient management with wastage tracking
- Preparation step documentation with media support
- Multi-level cost calculation (ingredient, labor, overhead)
- Yield variant management for fractional sales
- Pricing strategy analysis and recommendations
- Carbon footprint tracking
- Recipe publishing and version control

### 1.3 Key Business Objectives
- **Standardization**: Maintain consistent recipe execution across locations
- **Cost Control**: Accurate food cost calculation and margin analysis
- **Pricing Optimization**: Data-driven pricing recommendations based on target margins
- **Flexibility**: Support various sales units (whole, half, slice, portion)
- **Sustainability**: Track and report environmental impact
- **Efficiency**: Streamline recipe documentation and updates
- **Compliance**: Track allergens and dietary information

---

## 2. Functional Requirements

### FR-REC-001: Recipe Creation and Management
**Priority**: Critical
**Description**: System shall provide comprehensive recipe creation and editing capabilities.

**Requirements**:
- Allow users to create new recipes with complete details
- Support recipe status workflow (draft → published)
- Enable recipe cloning for variations
- Support recipe versioning and history tracking
- Allow recipe archiving without deletion
- Maintain audit trail (created by, updated by, timestamps)

**Business Rules**:
- Recipe name must be unique within the system
- All required fields must be completed before publishing
- Draft recipes are not visible to production staff
- Published recipes can be edited but changes create new versions
- Only authorized users can publish recipes

### FR-REC-002: Basic Recipe Information
**Priority**: Critical
**Description**: System shall capture essential recipe metadata.

**Requirements**:
- Recipe name (unique, required)
- Description (brief overview)
- Category assignment (from Recipe Categories)
- Cuisine type assignment (from Cuisine Types)
- Status (draft, published)
- Yield information (quantity and unit)
- Preparation time (minutes)
- Cooking time (minutes)
- Total time (auto-calculated)
- Complexity level (simple, moderate, complex, advanced)
- Recipe image upload with preview
- Tags for searchability
- Allergen information
- Special dietary indicators

**Business Rules**:
- Recipe name: 2-200 characters, alphanumeric with spaces
- Description: 10-1000 characters
- Category and Cuisine must reference existing active records
- Total time = Prep time + Cook time (auto-calculated)
- At least one yield unit must be defined
- Published recipes must have image

### FR-REC-003: Yield Variant Management
**Priority**: Critical
**Description**: System shall support multiple yield variants for fractional sales scenarios.

**Requirements**:
- Define multiple selling units per recipe
- Specify conversion rates for each variant
- Set individual pricing per variant
- Configure shelf life per variant
- Set wastage rates per variant
- Define min/max order quantities
- Designate default variant for sales
- Support fractional sales types:
  - Pizza slice (1/8, 1/4, 1/2, whole)
  - Cake slice (1/16, 1/8, 1/4, 1/2, whole)
  - Bottle/glass (glass, bottle)
  - Portion control (single, double, family)
  - Custom configurations

**Business Rules**:
- At least one yield variant required per recipe
- Conversion rate must equal portion of base recipe (0.0-1.0)
- Default variant must be specified
- Shelf life in hours after preparation/opening
- Fractional sales require special handling in POS integration

**Examples**:
- Margherita Pizza: Slice (1/8, $4.99), Half ($18.99), Whole ($34.99)
- Chocolate Cake: Slice (1/16, $6.99), Quarter ($24.99), Whole ($89.99)
- Thai Curry: Single Portion (1/4 recipe, $16.99)

### FR-REC-004: Ingredient Management
**Priority**: Critical
**Description**: System shall manage recipe ingredients with detailed tracking.

**Requirements**:
- Add multiple ingredients to recipe
- Specify ingredient type (product, recipe)
- Define recipe quantity and unit
- Link to inventory items for products
- Link to other recipes for sub-recipes
- Track wastage percentage per ingredient
- Calculate net cost per ingredient
- Calculate wastage cost per ingredient
- Calculate total cost per ingredient
- Display inventory availability
- Support ingredient notes
- Allow ingredient reordering
- Enable ingredient substitution suggestions

**Business Rules**:
- Minimum one ingredient required per recipe
- Product ingredients must exist in inventory system
- Recipe ingredients must reference active recipes
- Wastage percentage: 0-50% (default 0%)
- Cost calculations: Total Cost = (Quantity × Cost per Unit) × (1 + Wastage%)
- Net Cost = Quantity × Cost per Unit
- Wastage Cost = Net Cost × (Wastage% / 100)
- Inventory quantity checked for availability warnings

**Data Points**:
- Ingredient ID and name
- Type: product | recipe
- Recipe quantity and unit
- Inventory quantity and unit (for conversion)
- Wastage percentage
- Cost per unit (from inventory)
- Net cost (calculated)
- Wastage cost (calculated)
- Total cost (calculated)
- Optional notes

### FR-REC-005: Preparation Step Documentation
**Priority**: High
**Description**: System shall provide detailed preparation step documentation with media support.

**Requirements**:
- Add multiple preparation steps
- Define step order (sequential numbering)
- Write detailed instructions per step
- Specify duration per step
- Define temperature requirements
- List required equipment per step
- Upload step-specific images
- Support step reordering
- Enable step notes and tips
- Calculate total prep time from steps

**Business Rules**:
- Steps must be numbered sequentially (1, 2, 3...)
- Step description: 10-1000 characters
- Duration in minutes (optional)
- Temperature in Celsius (optional)
- Equipment selection from predefined list
- Image size limit: 10MB per step
- Supported formats: JPG, PNG, WebP
- Reordering automatically renumbers steps

**Equipment Categories**:
- Cooking: Oven, Stove, Grill, Fryer, Steamer
- Preparation: Mixer, Food processor, Blender, Knife, Cutting board
- Containers: Bowls, Pans, Pots, Baking dishes
- Temperature: Thermometer, Probe
- Specialized: Pizza oven, Pasta maker, Sous vide

### FR-REC-006: Cost Analysis and Calculation
**Priority**: Critical
**Description**: System shall provide comprehensive multi-level cost analysis.

**Requirements**:
- Calculate total ingredient cost (sum of all ingredients)
- Apply labor cost percentage
- Apply overhead cost percentage
- Calculate cost per portion
- Calculate total recipe cost
- Display cost breakdown by ingredient
- Show percentage contribution per ingredient
- Support cost recalculation on ingredient updates
- Track historical costs for trending
- Generate cost variance reports

**Business Rules**:
- Ingredient Cost = Sum of all ingredient total costs
- Labor Cost = Ingredient Cost × (Labor % / 100)
- Overhead Cost = Ingredient Cost × (Overhead % / 100)
- Total Recipe Cost = Ingredient Cost + Labor Cost + Overhead Cost
- Cost per Portion = Total Recipe Cost / Yield Quantity
- Labor Cost %: 0-100% (default from category settings)
- Overhead Cost %: 0-100% (default from category settings)
- Total percentages validation: Labor% + Overhead% + Target Food Cost% ≤ 100%

**Cost Components**:
1. **Ingredient Cost**: Direct material costs with wastage
2. **Labor Cost**: Preparation and cooking labor
3. **Overhead Cost**: Utilities, rent, equipment depreciation
4. **Total Cost**: Sum of all components

### FR-REC-007: Pricing Strategy and Analysis
**Priority**: Critical
**Description**: System shall support data-driven pricing strategies and margin analysis.

**Requirements**:
- Set target food cost percentage
- Define selling price per portion
- Calculate recommended price based on target margin
- Display actual food cost percentage
- Calculate gross profit per portion
- Calculate gross margin percentage
- Compare actual vs. target metrics
- Provide pricing recommendations
- Support competitive pricing analysis
- Generate pricing variance alerts

**Business Rules**:
- Target Food Cost %: 15-50% (industry standard: 25-35%)
- Recommended Price = Cost per Portion / (Target Food Cost % / 100)
- Actual Food Cost % = (Cost per Portion / Selling Price) × 100
- Gross Profit = Selling Price - Cost per Portion
- Gross Margin % = (Gross Profit / Selling Price) × 100
- Alert if Actual Food Cost % > Target + 5%
- Alert if Gross Margin < 60% (configurable threshold)

**Pricing Formulas**:
- **Cost-Plus Pricing**: Cost × Markup Factor
- **Target Margin Pricing**: Cost / (1 - Target Margin%)
- **Competitive Pricing**: Market rate ± variance

**Color Coding**:
- Green: Food Cost % ≤ Target
- Yellow: Food Cost % = Target + 1-5%
- Red: Food Cost % > Target + 5%

### FR-REC-008: Competitor Analysis
**Priority**: Medium
**Description**: System shall support competitor pricing tracking and comparison.

**Requirements**:
- Add competitor entries
- Record competitor name
- Track competitor pricing
- Note portion sizes
- Calculate price per standard unit (e.g., per 100g)
- Compare against own pricing
- Identify pricing opportunities
- Generate competitive analysis reports

**Business Rules**:
- Competitor name: 2-100 characters
- Price and portion size required
- Standardized unit comparison (per 100g, per portion)
- Highlight if competitor price significantly lower/higher

### FR-REC-009: Carbon Footprint Tracking
**Priority**: Low
**Description**: System shall track and report environmental impact of recipes.

**Requirements**:
- Record carbon footprint value (CO₂ equivalent in kg)
- Specify information source
- Calculate footprint per portion
- Aggregate footprint across menu
- Generate sustainability reports
- Compare recipes by environmental impact

**Business Rules**:
- Carbon footprint in kg CO₂eq per recipe
- Source documentation required for accuracy
- Sources: Supplier data, Industry standards, Internal calculations
- Footprint per portion = Total footprint / Yield quantity

### FR-REC-010: Recipe Search and Filtering
**Priority**: High
**Description**: System shall provide advanced search and filtering capabilities.

**Requirements**:
- Full-text search across name, description, tags
- Filter by category
- Filter by cuisine type
- Filter by status (draft, published)
- Filter by cost range
- Filter by margin range
- Filter by preparation time
- Filter by difficulty level
- Filter by allergens
- Filter by tags
- Quick filters: Has Media, No Media, Active, Draft
- Advanced filter builder with multiple conditions
- Save filter presets

**Filter Operators**:
- Contains, Equals, Not equals
- Greater than, Less than
- Is empty, Is not empty
- Between (for ranges)

### FR-REC-011: Bulk Operations
**Priority**: Medium
**Description**: System shall support bulk operations for efficiency.

**Requirements**:
- Select multiple recipes via checkboxes
- Bulk activate (publish)
- Bulk deactivate (revert to draft)
- Bulk export (CSV, PDF)
- Bulk delete with safety checks
- Bulk category reassignment
- Bulk tag application
- Display bulk action toolbar when selections made
- Show selection count
- Allow selection clearing

**Business Rules**:
- Minimum 2 recipes required for bulk operations
- Bulk delete blocked if recipes in active use
- Confirmation required for destructive actions
- Audit log for all bulk operations

### FR-REC-012: Recipe Import/Export
**Priority**: Medium
**Description**: System shall support recipe data import and export.

**Requirements**:
- Export single recipe to PDF (print-ready format)
- Export multiple recipes to CSV
- Export recipes with images (ZIP archive)
- Import recipes from CSV (template provided)
- Import validation with error reporting
- Support batch import
- Maintain data integrity during import

**Export Formats**:
- **PDF**: Print-ready recipe cards with images
- **CSV**: Bulk data export for analysis
- **JSON**: System integration format
- **ZIP**: Complete recipe packages with media

**Import Requirements**:
- Validate required fields
- Check for duplicates
- Verify category/cuisine references
- Report validation errors with line numbers
- Support dry-run mode (validate without importing)

### FR-REC-013: Recipe Media Management
**Priority**: Medium
**Description**: System shall manage recipe images and media assets.

**Requirements**:
- Upload recipe main image
- Upload step-specific images
- Support drag-and-drop upload
- Generate thumbnail previews
- Optimize images for web delivery
- Support image replacement
- Track media usage
- Clean up unused media

**Business Rules**:
- Supported formats: JPG, PNG, WebP
- Maximum file size: 10MB per image
- Recommended resolution: 1200×800px
- Automatic thumbnail generation: 400×300px
- Alt text required for accessibility
- Images stored in CDN for performance

---

## 3. Business Rules

### BR-REC-001: Recipe Name Uniqueness
**Rule**: Recipe names must be unique across the entire system.

**Rationale**: Prevents confusion in recipe selection and reporting.

**Validation**:
- Check uniqueness on create
- Check uniqueness on update (exclude current record)
- Case-insensitive comparison

**Error Message**: "A recipe with this name already exists. Please choose a unique name."

### BR-REC-002: Required Fields for Publishing
**Rule**: Recipes must have all required fields completed before publishing.

**Required Fields**:
- Recipe name
- Description (minimum 10 characters)
- Category
- Cuisine type
- At least one yield variant
- At least one ingredient
- At least one preparation step
- Recipe image
- Cost per portion calculated
- Selling price defined

**Validation**: Run pre-publish checklist and block if any required field missing.

**Error Message**: "Cannot publish recipe. Please complete: [list of missing fields]."

### BR-REC-003: Cost Calculation Integrity
**Rule**: All cost calculations must be mathematically accurate and consistent.

**Formulas**:
```
Ingredient Total Cost = Quantity × Cost per Unit × (1 + Wastage% / 100)
Total Ingredient Cost = Sum of all ingredient total costs
Labor Cost = Total Ingredient Cost × (Labor% / 100)
Overhead Cost = Total Ingredient Cost × (Overhead% / 100)
Total Recipe Cost = Total Ingredient Cost + Labor Cost + Overhead Cost
Cost per Portion = Total Recipe Cost / Yield Quantity
Actual Food Cost % = (Cost per Portion / Selling Price) × 100
Gross Profit = Selling Price - Cost per Portion
Gross Margin % = (Gross Profit / Selling Price) × 100
```

**Validation**: Recalculate on any ingredient or cost parameter change.

### BR-REC-004: Yield Variant Consistency
**Rule**: Yield variant conversion rates must sum logically for fractional sales.

**Requirements**:
- Conversion rate range: 0.01 to 1.0
- Conversion rate represents portion of base recipe
- All variants must reference same base yield
- Prices should scale proportionally (with markup adjustments)

**Example Validation**:
- Pizza (8 slices): Slice = 1/8 (0.125), Half = 1/2 (0.5), Whole = 1.0
- Verify: Slice price × 8 ≤ Whole price (allows bulk discount)

### BR-REC-005: Ingredient Type Constraints
**Rule**: Ingredients must reference valid, active records in the system.

**Constraints**:
- Product ingredients: Must exist in inventory system with active status
- Recipe ingredients: Must reference published recipes (no draft recipes)
- Circular references not allowed (Recipe A → Recipe B → Recipe A)
- Maximum recipe nesting depth: 3 levels

**Validation**:
- Check ingredient existence on add
- Verify active status
- Detect circular dependencies
- Alert if ingredient unavailable

### BR-REC-006: Preparation Step Ordering
**Rule**: Preparation steps must be sequentially numbered without gaps.

**Requirements**:
- Steps numbered 1, 2, 3, ... N
- No duplicate step numbers
- No gaps in sequence
- Auto-renumber on step deletion
- Auto-renumber on step reordering

**Behavior**: When step deleted, all subsequent steps renumbered automatically.

### BR-REC-007: Target Cost Percentage Limits
**Rule**: Target food cost percentage must fall within acceptable range.

**Range**: 15% - 50%
**Industry Standard**: 25% - 35%
**Warning Threshold**: < 20% or > 40%

**Validation**:
- Alert if target set below 15% (unrealistic margin)
- Alert if target set above 50% (poor profitability)
- Provide industry benchmark guidance

### BR-REC-008: Wastage Percentage Constraints
**Rule**: Wastage percentage must be realistic and justified.

**Range**: 0% - 50%
**Typical Values**:
- Dry goods: 0-2%
- Fresh produce: 5-15%
- Proteins: 5-20%
- Specialty items: 10-30%

**Validation**:
- Alert if wastage > 50% (requires justification)
- Alert if wastage changes significantly from historical average
- Track wastage trends for cost control

### BR-REC-009: Recipe Status Workflow
**Rule**: Recipe status follows controlled workflow.

**Workflow**:
1. **Draft**: Initial creation, editing allowed
2. **Under Review**: Submitted for approval, limited editing
3. **Approved**: Quality checked and approved, pending publish
4. **Rejected**: Returned for corrections with review notes
5. **Published**: Active for production use, version control on changes
6. **Archived**: No longer in active use, preserved for historical records

**Valid Status Values**: `draft | under_review | approved | rejected | published | archived`

**State Transitions**:
- Draft → Under Review: Recipe submitted for approval
- Under Review → Approved: Passes quality review
- Under Review → Rejected: Requires corrections (with review notes)
- Rejected → Draft: Author revises recipe
- Approved → Published: Made available for production
- Published → Archived: Recipe retired from active use
- Published → Draft: Reverts to editable state (creates new version)
- No deletion of published recipes (archive only)

**Business Logic**:
- Draft and Rejected recipes not visible to kitchen staff
- Only Approved recipes can be published
- Published recipes available in POS and production
- Changing published recipe creates new version automatically
- Archived recipes preserved for cost analysis and historical reporting

### BR-REC-010: Pricing Alert Thresholds
**Rule**: System generates alerts when pricing metrics fall outside acceptable ranges.

**Alert Conditions**:
- **Critical**: Actual Food Cost % > Target + 10%
- **Warning**: Actual Food Cost % > Target + 5%
- **Info**: Gross Margin < 60%
- **Critical**: Selling price < Cost per portion (negative margin)

**Alert Actions**:
- Display visual indicator (color coding)
- Generate pricing report
- Notify management
- Suggest corrective actions

### BR-REC-011: Sub-Recipe Dependency Management
**Rule**: Sub-recipes (recipe ingredients) must be properly managed.

**Requirements**:
- Sub-recipe must be published before use
- Cost of sub-recipe included in parent recipe cost
- Changes to sub-recipe trigger parent recipe cost updates
- Circular dependencies prevented (Recipe A cannot use Recipe B if Recipe B uses Recipe A)
- Maximum nesting depth: 3 levels (Recipe → Sub-Recipe → Sub-Sub-Recipe)

**Validation**:
- Check sub-recipe status on parent recipe publish
- Detect circular references
- Alert parent recipes when sub-recipe changes
- Recalculate parent costs when sub-recipe costs update

### BR-REC-012: Allergen Disclosure Requirements
**Rule**: All allergens must be properly declared for compliance.

**Common Allergens** (FDA Major Allergens):
- Milk (Dairy)
- Eggs
- Fish
- Shellfish
- Tree Nuts
- Peanuts
- Wheat (Gluten)
- Soybeans

**Requirements**:
- Allergen selection from standardized list
- Inherit allergens from ingredients automatically
- Display allergen warnings prominently
- Include in printed recipe cards
- Searchable/filterable by allergen

**Validation**:
- Alert if allergen not declared but present in ingredients
- Require confirmation before removing allergen declaration

### BR-REC-013: Media Asset Requirements
**Rule**: Recipe images must meet quality and technical standards.

**Requirements**:
- **Format**: JPG, PNG, or WebP
- **Size**: Maximum 10MB per image
- **Resolution**: Minimum 800×600px, Recommended 1200×800px
- **Aspect Ratio**: 3:2 or 4:3 preferred
- **Alt Text**: Required for accessibility
- **Copyright**: User confirms rights to upload

**Validation**:
- Check file format and size on upload
- Validate image dimensions
- Scan for inappropriate content (optional)
- Compress and optimize for web delivery

---

## 4. Data Model

### Recipe Entity
```typescript
interface Recipe {
  // Identification
  id: string                        // Unique identifier
  name: string                      // Recipe name (unique, 2-200 chars)
  description: string               // Brief description (10-1000 chars)

  // Classification
  category: string                  // FK to RecipeCategory
  cuisine: string                   // FK to RecipeCuisine
  status: RecipeStatus              // draft | under_review | approved | rejected | published | archived

  // Media
  image: string                     // Main recipe image URL
  hasMedia: boolean                 // Has uploaded images

  // Yield Information
  yield: number                     // Base recipe yield quantity
  yieldUnit: string                 // Unit: portions, servings, pieces
  yieldVariants: RecipeYieldVariant[] // Multiple selling units
  defaultVariantId: string          // Default variant for sales
  allowsFractionalSales: boolean    // Supports fractional sales
  fractionalSalesType?: FractionalSalesType // Pizza-slice, cake-slice, etc.

  // Time Requirements
  prepTime: number                  // Preparation time (minutes)
  cookTime: number                  // Cooking time (minutes)
  totalTime: number                 // Total time (auto-calculated)
  complexity: RecipeComplexity      // simple | moderate | complex | advanced

  // Cost Analysis
  costPerPortion: number            // Cost per single portion
  sellingPrice: number              // Selling price per portion
  grossMargin: number               // Gross margin percentage
  netPrice: number                  // Net price (after discounts)
  grossPrice: number                // Gross price (before discounts)
  totalCost: number                 // Total recipe cost

  // Cost Components
  targetFoodCost: number            // Target food cost percentage
  laborCostPercentage: number       // Labor cost percentage
  overheadPercentage: number        // Overhead cost percentage
  recommendedPrice: number          // Calculated recommended price
  foodCostPercentage: number        // Actual food cost percentage
  grossProfit: number               // Gross profit amount

  // Sustainability
  carbonFootprint: number           // CO2 equivalent (kg)
  carbonFootprintSource?: string    // Source of carbon data

  // Inventory Integration
  deductFromStock: boolean          // Deduct ingredients from inventory

  // Recipe Content
  ingredients: Ingredient[]         // List of ingredients
  steps: PreparationStep[]          // Preparation steps
  prepNotes: string                 // Preparation notes
  specialInstructions: string       // Special handling instructions
  additionalInfo: string            // Additional information

  // Dietary Information
  allergens: string[]               // List of allergens
  tags: string[]                    // Search tags

  // Audit Trail
  createdAt: string                 // Creation timestamp (ISO 8601)
  updatedAt: string                 // Last update timestamp (ISO 8601)
  createdBy: string                 // Created by user ID
  updatedBy: string                 // Updated by user ID

  // Sales Unit
  unitOfSale: string                // Unit used for sales: portion, plate, piece
}
```

### RecipeYieldVariant Entity
```typescript
interface RecipeYieldVariant {
  id: string                        // Unique identifier
  name: string                      // Variant name (e.g., "Pizza Slice")
  unit: string                      // Unit: slice, half, whole, portion
  quantity: number                  // Quantity of units
  conversionRate: number            // Portion of base recipe (0.0-1.0)
  sellingPrice: number              // Price for this variant
  costPerUnit: number               // Cost for this variant
  isDefault: boolean                // Default variant for sales
  shelfLife?: number                // Hours after preparation/opening
  wastageRate?: number              // Expected waste percentage
  minOrderQuantity?: number         // Minimum order quantity
  maxOrderQuantity?: number         // Maximum order quantity
}
```

### Ingredient Entity
```typescript
interface Ingredient {
  id: string                        // Unique identifier (or FK to product/recipe)
  name: string                      // Ingredient name
  type: IngredientType              // product | recipe
  quantity: number                  // Recipe quantity needed
  unit: string                      // Unit of measurement
  wastage: number                   // Wastage percentage (0-50)
  inventoryQty: number              // Available inventory quantity
  inventoryUnit: string             // Inventory unit (may differ from recipe unit)
  costPerUnit: number               // Cost per unit (from inventory)
  totalCost: number                 // Total cost including wastage
  notes?: string                    // Optional preparation notes
}
```

### PreparationStep Entity
```typescript
interface PreparationStep {
  id: string                        // Unique identifier
  order: number                     // Step sequence number
  description: string               // Step instructions (10-1000 chars)
  duration?: number                 // Duration in minutes
  temperature?: number              // Temperature in Celsius
  equipments: string[]              // Required equipment
  image: string                     // Step image URL (optional)
}
```

### Enumerations

```typescript
enum RecipeStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

enum RecipeComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
  ADVANCED = 'advanced'
}

enum IngredientType {
  PRODUCT = 'product',
  RECIPE = 'recipe'
}

enum FractionalSalesType {
  PIZZA_SLICE = 'pizza-slice',
  CAKE_SLICE = 'cake-slice',
  BOTTLE_GLASS = 'bottle-glass',
  PORTION_CONTROL = 'portion-control',
  CUSTOM = 'custom'
}
```

---

## 5. Integration Points

### 5.1 Recipe Categories Integration
**Direction**: Recipe → Categories
**Type**: Many-to-One

**Integration Requirements**:
- Recipe must reference active category
- Inherit default cost settings from category
- Category deletion blocked if recipes assigned
- Category status change affects recipe visibility

**Data Flow**:
- Recipe creation: Fetch active categories for selection
- Cost calculation: Apply category default percentages
- Reporting: Group recipes by category

### 5.2 Cuisine Types Integration
**Direction**: Recipe → Cuisines
**Type**: Many-to-One

**Integration Requirements**:
- Recipe must reference active cuisine
- Cuisine deletion blocked if recipes assigned
- Cuisine filtering for recipe search

**Data Flow**:
- Recipe creation: Fetch active cuisines for selection
- Reporting: Group recipes by cuisine
- Menu planning: Filter by cuisine type

### 5.3 Inventory Management Integration
**Direction**: Bidirectional
**Type**: Many-to-Many

**Integration Requirements**:
- Product ingredients link to inventory items
- Cost per unit fetched from inventory system
- Availability checks for production planning
- Stock deduction on recipe production (if enabled)

**Data Flow**:
- **Outbound**: Recipe ingredient list → Inventory availability check
- **Inbound**: Inventory cost updates → Recipe cost recalculation
- **Outbound**: Recipe production → Stock deduction (if deductFromStock = true)

### 5.4 Menu Engineering Integration
**Direction**: Bidirectional
**Type**: Many-to-Many

**Integration Requirements**:
- Recipes used in menu items
- Menu item pricing based on recipe costs
- Menu mix analysis considers recipe margins
- Recipe changes trigger menu impact analysis

**Data Flow**:
- **Outbound**: Recipe list → Menu item creation
- **Inbound**: Menu performance → Recipe optimization suggestions
- **Outbound**: Recipe cost changes → Menu price updates

### 5.5 POS (Point of Sale) Integration
**Direction**: Outbound
**Type**: Push/Pull

**Integration Requirements**:
- Published recipes available in POS
- Yield variants map to POS modifiers/options
- Recipe images displayed in POS
- Allergen information accessible at point of sale

**Data Flow**:
- **Outbound**: Recipe publish → POS menu update
- **Outbound**: Recipe price changes → POS price sync
- **Inbound**: Sales data → Recipe performance analysis

### 5.6 Production Planning Integration
**Direction**: Outbound
**Type**: Pull

**Integration Requirements**:
- Recipe preparation steps guide production
- Ingredient lists drive prep schedules
- Equipment requirements inform capacity planning
- Time estimates support labor scheduling

**Data Flow**:
- **Outbound**: Recipe details → Production work orders
- **Outbound**: Ingredient requirements → Prep lists
- **Outbound**: Equipment needs → Station assignments

### 5.7 Reporting & Analytics Integration
**Direction**: Inbound
**Type**: Pull

**Integration Requirements**:
- Recipe cost data for food cost reports
- Margin analysis for profitability reports
- Carbon footprint for sustainability reports
- Ingredient usage for waste analysis

**Data Flow**:
- **Inbound**: Recipe data → Cost analysis reports
- **Inbound**: Recipe performance → Menu optimization
- **Inbound**: Margin data → Pricing strategy reports

### 5.8 User Management Integration
**Direction**: Inbound
**Type**: Authentication & Authorization

**Integration Requirements**:
- User authentication for recipe access
- Role-based permissions for recipe operations
- Audit trail tracking user actions
- Creator/modifier information

**Permissions**:
- `recipe.view`: View published recipes
- `recipe.viewDraft`: View draft recipes
- `recipe.create`: Create new recipes
- `recipe.edit`: Edit existing recipes
- `recipe.delete`: Delete recipes
- `recipe.publish`: Publish draft recipes
- `recipe.cost.view`: View cost information
- `recipe.cost.edit`: Edit cost parameters

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

#### Response Time
- Recipe list load: < 2 seconds for 1000 recipes
- Recipe detail view: < 1 second
- Recipe form load: < 1 second
- Search results: < 1 second for 10,000 recipes
- Cost calculations: < 500ms real-time
- Bulk operations: < 5 seconds for 100 recipes

#### Throughput
- Support 100 concurrent users
- Handle 50 recipe edits per minute
- Process 10 bulk operations simultaneously

#### Scalability
- Support 50,000+ recipes
- Handle 1,000,000+ ingredients across recipes
- Scale horizontally for increased load

### 6.2 Usability Requirements

#### User Interface
- Intuitive recipe creation wizard
- Real-time cost calculations
- Drag-and-drop media upload
- Inline validation with helpful messages
- Mobile-responsive design
- Keyboard shortcuts for power users

#### Accessibility
- WCAG 2.1 AA compliance
- Screen reader compatible
- Keyboard navigation support
- High contrast mode available
- Alt text for all images

#### Learning Curve
- New users productive within 30 minutes
- Context-sensitive help available
- Tooltips for complex fields
- Video tutorials for key workflows

### 6.3 Security Requirements

#### Authentication
- Secure user authentication required
- Session timeout after inactivity
- Password complexity requirements

#### Authorization
- Role-based access control (RBAC)
- Granular permissions per operation
- Audit logging for sensitive actions

#### Data Protection
- Encryption in transit (HTTPS/TLS)
- Encryption at rest for sensitive data
- Regular security audits
- Compliance with data protection regulations

#### Input Validation
- Server-side validation for all inputs
- SQL injection prevention
- XSS attack prevention
- File upload scanning for malware

### 6.4 Reliability Requirements

#### Availability
- System uptime: 99.5% (excluding planned maintenance)
- Planned maintenance windows: Off-peak hours
- Backup system for critical operations

#### Data Integrity
- ACID compliance for transactions
- Foreign key constraints enforced
- Referential integrity maintained
- Regular data integrity checks

#### Error Handling
- Graceful degradation on errors
- User-friendly error messages
- Automatic error logging
- Recovery mechanisms for transient failures

#### Backup & Recovery
- Daily automated backups
- Point-in-time recovery capability
- Backup retention: 30 days
- Disaster recovery plan: RTO 4 hours, RPO 1 hour

### 6.5 Maintainability Requirements

#### Code Quality
- Clean, well-documented code
- Consistent coding standards
- Automated code quality checks
- Regular refactoring for technical debt

#### Testing
- Unit test coverage: ≥ 80%
- Integration test coverage: ≥ 70%
- Automated regression testing
- Performance testing for critical paths

#### Monitoring
- Application performance monitoring
- Error tracking and alerting
- Usage analytics
- System health dashboards

#### Documentation
- Comprehensive technical documentation
- User manuals and guides
- API documentation (if applicable)
- Change logs and release notes

---

## 7. Success Criteria

### 7.1 Functional Success Criteria

1. **Recipe Creation**: Users can create complete recipes with all required information in under 10 minutes
2. **Cost Accuracy**: Calculated costs match manual calculations within 1% margin of error
3. **Pricing Recommendations**: Recommended prices align with target margins within 2% variance
4. **Search Performance**: Users can find any recipe within 3 clicks from homepage
5. **Yield Variants**: Fractional sales scenarios (pizza slices, cake portions) correctly calculated and priced
6. **Ingredient Management**: Ingredient changes propagate to cost calculations within 1 second
7. **Preparation Steps**: Kitchen staff can follow preparation steps without additional clarification

### 7.2 User Adoption Criteria

1. **User Training**: 90% of users complete training within first week
2. **Active Usage**: 80% of recipes created in legacy system migrated within 3 months
3. **User Satisfaction**: ≥ 4.0/5.0 average rating in user surveys
4. **Support Tickets**: < 5 support tickets per 100 users per month after initial launch
5. **Feature Usage**: 70% of users actively using cost analysis features

### 7.3 Business Impact Criteria

1. **Food Cost Control**: 10% improvement in food cost variance within 6 months
2. **Recipe Standardization**: 95% of menu items have standardized recipes within 6 months
3. **Pricing Optimization**: 5% improvement in overall gross margin within 12 months
4. **Waste Reduction**: 15% reduction in ingredient waste through accurate wastage tracking
5. **Time Savings**: 30% reduction in time spent on recipe costing and updates
6. **Menu Engineering**: 20% faster menu development cycle with recipe database

### 7.4 Technical Success Criteria

1. **System Performance**: All operations meet or exceed performance requirements
2. **Data Quality**: < 1% error rate in cost calculations
3. **Integration Success**: Seamless data flow with inventory and POS systems
4. **System Availability**: 99.5% uptime achieved
5. **Security Compliance**: Zero security incidents related to recipe data

---

## 8. Assumptions and Dependencies

### 8.1 Assumptions

1. **User Competency**: Users have basic culinary knowledge and can describe recipes accurately
2. **Data Availability**: Ingredient cost data available and up-to-date in inventory system
3. **Equipment**: Kitchen equipment standardized and documented for reference
4. **Internet Connectivity**: Reliable internet connection for cloud-based features
5. **Browser Support**: Users have modern web browsers (latest 2 versions of Chrome, Firefox, Safari, Edge)
6. **Image Quality**: Users can provide or capture acceptable quality recipe images
7. **Unit Standardization**: Standardized units of measurement adopted across organization

### 8.2 Dependencies

#### Internal Dependencies
1. **Recipe Categories Module**: Must be implemented before recipes (provides category reference)
2. **Cuisine Types Module**: Must be implemented before recipes (provides cuisine reference)
3. **Inventory Management**: Required for ingredient costing and availability
4. **User Management**: Required for authentication and authorization
5. **Media Storage**: Cloud storage or CDN for image hosting

#### External Dependencies
1. **Cloud Infrastructure**: AWS, Azure, or GCP for hosting and storage
2. **Database**: PostgreSQL 14+ for data persistence
3. **Image Processing**: Image optimization libraries for media handling
4. **Authentication**: SSO or OAuth provider for user authentication
5. **Reporting Engine**: BI tool integration for advanced analytics

#### Third-Party Integrations
1. **POS System**: Integration API available and documented
2. **Inventory System**: Real-time data synchronization supported
3. **Carbon Footprint Data**: Access to environmental impact databases (optional)
4. **Nutritional Data**: Access to nutritional information databases (future enhancement)

---

## 9. Risks and Mitigation Strategies

### 9.1 Technical Risks

#### Risk: Complex Cost Calculation Performance
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Implement caching for frequently accessed recipes
- Use database triggers for automatic cost updates
- Optimize calculation algorithms
- Pre-calculate costs on recipe save (not on every view)

#### Risk: Image Storage Costs
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Implement image compression and optimization
- Set reasonable image size limits
- Use CDN for efficient delivery
- Archive old/unused images regularly

#### Risk: Circular Recipe Dependencies
**Probability**: Low
**Impact**: High
**Mitigation**:
- Implement dependency graph validation
- Limit recipe nesting depth to 3 levels
- Provide clear error messages on circular reference detection
- Automated testing for edge cases

### 9.2 Business Risks

#### Risk: User Resistance to Detailed Costing
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Demonstrate ROI through food cost savings
- Provide simplified data entry for basic users
- Offer batch import from existing recipe sources
- Implement gradual rollout with early adopter feedback

#### Risk: Inaccurate Ingredient Costs
**Probability**: High
**Impact**: High
**Mitigation**:
- Integrate with inventory system for real-time costs
- Implement cost update notifications
- Provide cost variance reporting
- Allow manual cost overrides with audit trail

#### Risk: Recipe IP Protection
**Probability**: Medium
**Impact**: Medium
**Mitigation**:
- Implement strict access controls
- Audit logging for all recipe accesses
- Watermarking for exported recipes
- Legal agreements with users regarding confidentiality

### 9.3 Operational Risks

#### Risk: Data Migration from Legacy System
**Probability**: High
**Impact**: High
**Mitigation**:
- Develop comprehensive migration plan
- Create data mapping specifications
- Perform test migrations with sample data
- Implement rollback procedures
- Provide data validation tools
- Plan for dual-run period

#### Risk: Kitchen Staff Adoption
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Involve kitchen staff in design and testing
- Provide hands-on training sessions
- Create simplified tablet/mobile interface
- Offer on-site support during initial rollout
- Collect and act on feedback quickly

---

## 10. Glossary

**Base Recipe**: The foundational recipe from which yield variants are calculated.

**Carbon Footprint**: The total greenhouse gas emissions caused by the production and consumption of recipe ingredients, measured in kg CO₂ equivalent.

**Conversion Rate**: The portion of the base recipe represented by a yield variant (e.g., 1 slice = 0.125 of whole pizza).

**Cost per Portion**: Total recipe cost divided by the number of servings.

**Food Cost Percentage**: The ratio of food cost to selling price, expressed as a percentage.

**Fractional Sales**: The practice of selling portions of a recipe (e.g., by the slice) rather than only whole units.

**Gross Margin**: The percentage of revenue remaining after deducting the cost of goods sold.

**Gross Profit**: Selling price minus cost of goods sold.

**Ingredient Wastage**: Expected loss of ingredients during preparation, expressed as a percentage.

**Labor Cost Percentage**: The percentage of ingredient cost allocated to labor expenses.

**Nested Recipe**: A recipe used as an ingredient in another recipe (also called sub-recipe).

**Overhead Cost Percentage**: The percentage of ingredient cost allocated to overhead expenses (utilities, rent, equipment).

**POS (Point of Sale)**: The system used for processing customer orders and payments.

**Recipe Variant**: See Yield Variant.

**Standardized Recipe**: A recipe with precise measurements, instructions, and specifications for consistent results.

**Sub-Recipe**: A recipe that serves as an ingredient in another recipe.

**Target Food Cost**: The desired percentage of selling price represented by food costs.

**Unit of Sale**: The standard unit used when selling the recipe (e.g., portion, plate, slice).

**Yield**: The number of servings or portions produced by a recipe.

**Yield Variant**: A defined serving size or portion of a recipe available for individual sale (e.g., whole pizza, half pizza, slice).

---
