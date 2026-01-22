# Recipe Management - Use Cases (UC)

## Document Information
- **Document Type**: Use Cases Document
- **Module**: Operational Planning > Recipe Management > Recipes
- **Version**: 2.0.0
- **Last Updated**: 2025-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial use cases document created with 16 comprehensive use cases |
| 2.0.0 | 2025-01-16 | Development Team | Aligned with actual implementation: updated recipe status workflow (draft, under_review, approved, rejected, published, archived), updated complexity levels (simple, moderate, complex, advanced), added quality control review use cases |

---

## Use Case Index

| Use Case ID | Use Case Name | Priority | Actor |
|-------------|---------------|----------|-------|
| UC-REC-001 | View Recipe List | Critical | Chef, Kitchen Manager, Admin |
| UC-REC-002 | Search and Filter Recipes | High | Chef, Kitchen Manager, Admin |
| UC-REC-003 | Create New Recipe | Critical | Chef, Kitchen Manager |
| UC-REC-004 | Edit Existing Recipe | Critical | Chef, Kitchen Manager |
| UC-REC-005 | Manage Recipe Ingredients | Critical | Chef, Kitchen Manager |
| UC-REC-006 | Manage Preparation Steps | High | Chef, Kitchen Manager |
| UC-REC-007 | Analyze Recipe Costs | Critical | Kitchen Manager, Finance Manager |
| UC-REC-008 | Set Pricing Strategy | Critical | Kitchen Manager, Finance Manager |
| UC-REC-009 | Configure Yield Variants | High | Kitchen Manager |
| UC-REC-010 | Publish Recipe | Critical | Kitchen Manager, Admin |
| UC-REC-011 | View Recipe Details | High | Chef, Kitchen Manager, Production Staff |
| UC-REC-012 | Clone Recipe | Medium | Chef, Kitchen Manager |
| UC-REC-013 | Delete Recipe | Medium | Kitchen Manager, Admin |
| UC-REC-014 | Bulk Recipe Operations | Medium | Kitchen Manager, Admin |
| UC-REC-015 | Import Recipes | Medium | Kitchen Manager, Admin |
| UC-REC-016 | Export Recipes | Medium | Chef, Kitchen Manager, Admin |

---

## UC-REC-001: View Recipe List

### Description
Users can view a paginated list of recipes with summary information including name, category, cuisine, cost, price, margin, and status.

### Actor(s)
- Primary: Chef, Kitchen Manager
- Secondary: Production Staff, Admin

### Priority
Critical

### Frequency
Multiple times per day

### Preconditions
1. User is authenticated
2. User has `recipe.view` permission
3. At least one recipe exists in the system

### Postconditions
1. Recipe list is displayed with current data
2. User can select a recipe for detailed view
3. UI reflects user's viewing preferences (grid/list mode)

### Main Flow
1. User navigates to Recipe Management section
2. System loads and displays recipe list
3. System shows default view mode (grid or user's last preference)
4. For each recipe, system displays:
   - Recipe image thumbnail
   - Recipe name
   - Category and cuisine
   - Cost per portion
   - Selling price
   - Gross margin percentage
   - Status badge (draft/published)
5. System displays recipe count and filtering status
6. User can toggle between grid and list view modes
7. User selects a recipe to view details
8. System navigates to recipe detail view

### Alternative Flows

#### A1: No Recipes Found
- **Trigger**: No recipes match current filters or none exist
- **Flow**:
  1. System displays empty state message
  2. System suggests creating first recipe or clearing filters
  3. System shows "Create Recipe" action button
  4. User can click to create new recipe or adjust filters

#### A2: Grid View Selected
- **Trigger**: User clicks grid view toggle
- **Flow**:
  1. System switches to card-based grid layout
  2. System displays 2-6 recipe cards per row (responsive)
  3. System saves user preference for future sessions
  4. Each card shows thumbnail, name, category, price, margin

#### A3: List View Selected
- **Trigger**: User clicks list view toggle
- **Flow**:
  1. System switches to table-based list layout
  2. System displays detailed tabular information
  3. System enables column sorting
  4. System saves user preference for future sessions
  5. User can select multiple recipes via checkboxes

### Exception Flows

#### E1: Load Failure
- **Trigger**: Database connection error or timeout
- **Flow**:
  1. System displays error message: "Unable to load recipes. Please try again."
  2. System shows retry button
  3. User clicks retry
  4. System attempts to reload recipe list

#### E2: Slow Loading (>3 seconds)
- **Trigger**: Large dataset or slow connection
- **Flow**:
  1. System displays loading skeleton UI
  2. System progressively loads recipes in batches
  3. System shows loading progress indicator
  4. User can interact with loaded recipes while others load

### Business Rules Applied
- BR-REC-009: Draft recipes only visible to users with `recipe.viewDraft` permission
- Only published recipes shown to production staff
- Recipe cost information only visible to users with `recipe.cost.view` permission

### Performance Requirements
- Initial load: < 2 seconds for 100 recipes
- View mode toggle: < 500ms transition
- Scroll/pagination: < 1 second per page

### Acceptance Criteria
- [ ] Recipe list displays within 2 seconds
- [ ] Grid and list views both functional
- [ ] Recipe thumbnails load progressively
- [ ] Status badges correctly colored (draft = gray, published = green)
- [ ] Cost/price/margin display formatted consistently
- [ ] Empty state displayed when no recipes found
- [ ] View mode preference persists across sessions
- [ ] Recipe count displayed accurately

---

## UC-REC-002: Search and Filter Recipes

### Description
Users can search recipes by name, description, or tags, and apply advanced filters to narrow results by category, cuisine, cost range, margin, preparation time, difficulty, and custom criteria.

### Actor(s)
- Primary: Chef, Kitchen Manager
- Secondary: Production Staff

### Priority
High

### Frequency
Multiple times per day

### Preconditions
1. User is viewing recipe list (UC-REC-001)
2. At least one recipe exists in the system

### Postconditions
1. Filtered recipe list displayed
2. Active filters indicated with badges
3. Result count updated
4. Filters persist during session

### Main Flow
1. User types search term in search box
2. System debounces input (300ms delay)
3. System filters recipes matching:
   - Recipe name (case-insensitive)
   - Description text
   - Tags
4. System updates result count
5. System displays filtered recipes
6. User reviews results
7. User can clear search to reset

### Alternative Flows

#### A1: Quick Filters Applied
- **Trigger**: User clicks quick filter button
- **Flow**:
  1. User clicks quick filter: "No Media", "Has Media", "Active", or "Draft"
  2. System applies filter immediately
  3. System updates result count
  4. System highlights active filter button
  5. System displays filtered recipes
  6. User can toggle filter off by clicking again
  7. Multiple quick filters can be active (AND logic)

#### A2: Advanced Filters Applied
- **Trigger**: User clicks "Advanced Filters" button
- **Flow**:
  1. User clicks "Advanced Filters"
  2. System opens filter popover panel
  3. System displays existing filter conditions (if any)
  4. User clicks "Add Filter Condition"
  5. User selects filter field from dropdown:
     - Name, Category, Cuisine, Status
     - Cost Range, Margin, Preparation Time, Difficulty
  6. User selects operator:
     - Contains, Equals, Not equals
     - Greater than, Less than
     - Is empty, Is not empty
  7. User enters filter value (if required for operator)
  8. User can add multiple conditions (AND logic)
  9. User clicks "Apply Filters"
  10. System closes popover
  11. System applies all filter conditions
  12. System displays filtered results
  13. System shows filter count badge

#### A3: Clear All Filters
- **Trigger**: User clicks "Clear All" button
- **Flow**:
  1. System removes all active filters
  2. System removes all quick filters
  3. System clears search term
  4. System displays all recipes (unfiltered)
  5. System updates result count to total
  6. System removes filter badges

#### A4: Remove Individual Filter
- **Trigger**: User removes specific filter condition
- **Flow**:
  1. User opens advanced filter panel
  2. User clicks X button on specific condition
  3. System removes that condition
  4. System re-applies remaining filters
  5. System updates results

### Exception Flows

#### E1: No Results Found
- **Trigger**: Filter combination returns zero recipes
- **Flow**:
  1. System displays "No recipes found" message
  2. System suggests:
     - Try clearing some filters
     - Check spelling in search
     - Create a new recipe
  3. System shows "Clear Filters" button prominently
  4. User can clear filters or adjust criteria

#### E2: Invalid Filter Value
- **Trigger**: User enters invalid value for numeric field
- **Flow**:
  1. System detects invalid input (e.g., letters in cost field)
  2. System highlights field with error styling
  3. System displays inline error: "Please enter a valid number"
  4. System disables "Apply" button until corrected
  5. User corrects value
  6. System validates and enables "Apply" button

### Business Rules Applied
- Search is case-insensitive
- Search matches partial strings (contains logic)
- Multiple filters use AND logic (all must match)
- Quick filters combined with advanced filters
- Filter state preserved during session
- Filter badge shows total active filter count

### Performance Requirements
- Search debounce: 300ms
- Filter application: < 500ms
- Result update: < 1 second for 1000 recipes

### Acceptance Criteria
- [ ] Search filters results in real-time (after debounce)
- [ ] Quick filters apply immediately
- [ ] Advanced filter panel opens/closes smoothly
- [ ] Multiple filter conditions can be added
- [ ] Filter logic correctly applied (AND)
- [ ] Result count updates accurately
- [ ] Active filter badge displays correct count
- [ ] "Clear All" removes all filters
- [ ] Empty state shown when no results
- [ ] Invalid inputs prevented with validation

---

## UC-REC-003: Create New Recipe

### Description
Users can create a new recipe with complete information including basic details, ingredients, preparation steps, cost analysis, and pricing strategy.

### Actor(s)
- Primary: Chef, Kitchen Manager
- Secondary: Admin

### Priority
Critical

### Frequency
1-10 times per day (varies by operation)

### Preconditions
1. User is authenticated
2. User has `recipe.create` permission
3. At least one active category exists
4. At least one active cuisine exists

### Postconditions
1. New recipe created in system with status "draft"
2. Recipe appears in draft recipe list
3. Recipe assigned unique ID
4. Audit trail records creation

### Main Flow
1. User clicks "New Recipe" button from recipe list
2. System navigates to recipe creation form
3. System displays multi-section form with tabs:
   - Basic Information (left sidebar)
   - Ingredients (right panel, tab 1)
   - Preparation (right panel, tab 2)
   - Cost Analysis (right panel, tab 3)
   - Details (right panel, tab 4)
4. User enters basic information:
   - Recipe name (required)
   - Description
   - Category (required)
   - Cuisine type (required)
   - Recipe unit (portions, servings, pieces)
   - Number of portions
   - Unit of sale
   - Preparation time
   - Total time
   - Difficulty level
5. User uploads recipe image (recommended)
6. User adds ingredients (UC-REC-005)
7. User adds preparation steps (UC-REC-006)
8. System auto-calculates costs as user enters data
9. User reviews cost analysis tab
10. User sets pricing on cost tab
11. User adds tags and allergens on details tab
12. User clicks "Save as Draft" or "Publish Recipe"
13. System validates all required fields
14. System saves recipe with status "draft" or "published"
15. System displays success message
16. System redirects to recipe detail view

### Alternative Flows

#### A1: Save as Draft
- **Trigger**: User clicks "Save as Draft"
- **Flow**:
  1. System performs basic validation (name, category, cuisine)
  2. System saves recipe with status = "draft"
  3. System displays: "Recipe saved as draft"
  4. Recipe appears in draft recipes list
  5. User can continue editing later
  6. Draft not visible to production staff

#### A2: Publish Immediately
- **Trigger**: User clicks "Publish Recipe"
- **Flow**:
  1. System performs complete validation (all required fields)
  2. System checks publish requirements:
     - Name, description, category, cuisine
     - At least one ingredient
     - At least one preparation step
     - Recipe image uploaded
     - Cost calculated
     - Selling price set
  3. If validation passes:
     - System saves recipe with status = "published"
     - System displays: "Recipe published successfully"
     - Recipe visible to all authorized users
  4. If validation fails:
     - System displays error: "Cannot publish. Missing: [list]"
     - System highlights missing fields
     - Recipe remains in draft status
     - User corrects issues and retries

#### A3: Clone Existing Recipe
- **Trigger**: User clicks "Clone" on existing recipe
- **Flow**:
  1. System copies all recipe data
  2. System appends " (Copy)" to recipe name
  3. System sets status to "draft"
  4. System generates new unique ID
  5. System opens recipe form with cloned data
  6. User modifies as needed
  7. User saves new recipe

#### A4: Cancel Creation
- **Trigger**: User clicks browser back or Cancel button
- **Flow**:
  1. System detects unsaved changes
  2. System displays confirmation dialog:
     - "You have unsaved changes. Discard them?"
     - Options: "Discard", "Save as Draft", "Cancel"
  3. User selects option:
     - **Discard**: Navigate away, no save
     - **Save as Draft**: Save and navigate
     - **Cancel**: Stay on form, continue editing

### Exception Flows

#### E1: Validation Errors
- **Trigger**: User attempts to save with invalid/missing data
- **Flow**:
  1. System validates all fields
  2. System identifies validation errors:
     - Required fields empty
     - Invalid format (e.g., negative numbers)
     - Business rule violations
  3. System displays error summary at top of form
  4. System scrolls to first error field
  5. System highlights error fields in red
  6. System displays inline error messages
  7. User corrects errors
  8. System revalidates on field blur or submit
  9. When all valid, save succeeds

#### E2: Duplicate Recipe Name
- **Trigger**: User enters name that already exists
- **Flow**:
  1. System checks name uniqueness on blur
  2. System detects duplicate
  3. System displays error: "Recipe name already exists"
  4. System highlights name field
  5. User modifies name to be unique
  6. System revalidates
  7. When unique, error clears

#### E3: Category or Cuisine Inactive
- **Trigger**: Selected category/cuisine deactivated after form load
- **Flow**:
  1. System validates category/cuisine on save
  2. System detects inactive reference
  3. System displays error: "[Category/Cuisine] is no longer active. Please select another."
  4. System refreshes category/cuisine dropdown
  5. User selects different active option
  6. System validates and save succeeds

### Business Rules Applied
- BR-REC-001: Recipe name must be unique
- BR-REC-002: Required fields for publishing
- BR-REC-009: Recipe status workflow (starts as draft)
- Audit trail captures user ID and timestamp
- Cost calculations follow BR-REC-003

### Performance Requirements
- Form load: < 1 second
- Auto-save draft: every 2 minutes (background)
- Validation: < 500ms
- Save operation: < 2 seconds

### Acceptance Criteria
- [ ] Form displays all required sections
- [ ] Basic information fields validate correctly
- [ ] Category and cuisine dropdowns show active options only
- [ ] Image upload works (drag-drop or click)
- [ ] Ingredient addition functional (see UC-REC-005)
- [ ] Preparation steps addition functional (see UC-REC-006)
- [ ] Cost calculations update automatically
- [ ] Validation errors displayed clearly
- [ ] Duplicate name prevented
- [ ] Save as draft succeeds with minimal data
- [ ] Publish requires all mandatory fields
- [ ] Success message displayed on save
- [ ] User redirected to recipe detail view

---

## UC-REC-004: Edit Existing Recipe

### Description
Users can edit existing recipes to update information, modify ingredients, adjust preparation steps, recalculate costs, or change pricing strategies.

### Actor(s)
- Primary: Chef, Kitchen Manager
- Secondary: Admin

### Priority
Critical

### Frequency
Multiple times per day

### Preconditions
1. User is authenticated
2. User has `recipe.edit` permission
3. Recipe exists in system

### Postconditions
1. Recipe updated with new information
2. Updated timestamp and user recorded
3. If recipe was published, version history created
4. Cost calculations updated if ingredients changed
5. Dependent recipes updated if this is a sub-recipe

### Main Flow
1. User selects recipe to edit from list or detail view
2. System loads recipe data into edit form
3. System displays form pre-filled with current values
4. User modifies desired fields:
   - Basic information
   - Ingredients
   - Preparation steps
   - Cost parameters
   - Pricing
5. System validates changes in real-time
6. System recalculates costs if ingredients or parameters changed
7. User clicks "Save Changes"
8. System validates all fields
9. System saves updates
10. System updates `updated_at` and `updated_by` fields
11. System displays success message
12. System refreshes recipe detail view

### Alternative Flows

#### A1: Edit Draft Recipe
- **Trigger**: User edits draft recipe
- **Flow**:
  1. System loads draft recipe
  2. User makes changes
  3. User can save as draft or publish
  4. If publish selected, system validates publish requirements
  5. If valid, status changes to "published"
  6. If invalid, error shown, remains draft

#### A2: Edit Published Recipe
- **Trigger**: User edits published recipe
- **Flow**:
  1. System loads published recipe
  2. System displays warning: "This recipe is published and in use"
  3. User makes changes
  4. User clicks "Save Changes"
  5. System creates version history entry:
     - Stores previous version
     - Records change author and timestamp
     - Links versions for audit trail
  6. System updates recipe with new data
  7. System notifies dependent systems (POS, Production) of changes
  8. If used in active menus, system alerts:
     - "This recipe is used in [X] menu items. Changes will affect pricing."
     - User confirms to proceed

#### A3: Unpublish Recipe
- **Trigger**: User changes status from published to draft
- **Flow**:
  1. System checks if recipe in active use (menus, production)
  2. If in use:
     - System blocks unpublish
     - System displays: "Cannot unpublish. Recipe used in [list of places]"
     - User must remove dependencies first
  3. If not in use:
     - System changes status to draft
     - System removes from production visibility
     - System displays: "Recipe reverted to draft"

#### A4: Discard Changes
- **Trigger**: User clicks Cancel or browser back
- **Flow**:
  1. System detects unsaved changes
  2. System displays confirmation:
     - "Discard unsaved changes?"
     - Options: "Discard", "Save", "Cancel"
  3. User selects:
     - **Discard**: Reload original data, navigate away
     - **Save**: Save changes, then navigate
     - **Cancel**: Stay on form, continue editing

### Exception Flows

#### E1: Concurrent Edit Conflict
- **Trigger**: Two users edit same recipe simultaneously
- **Flow**:
  1. User A opens recipe for edit
  2. User B opens same recipe for edit
  3. User A saves changes successfully
  4. User B attempts to save
  5. System detects version conflict (timestamp mismatch)
  6. System displays warning:
     - "This recipe was modified by [User A] at [time]"
     - Options: "View their changes", "Override", "Cancel"
  7. User selects:
     - **View**: Show diff of changes, merge manually
     - **Override**: Save anyway (last write wins)
     - **Cancel**: Discard changes, reload fresh

#### E2: Invalid Cost Calculations
- **Trigger**: Ingredient costs produce invalid calculations
- **Flow**:
  1. System recalculates costs after ingredient change
  2. System detects error (e.g., missing ingredient cost, negative values)
  3. System displays error: "Cost calculation error: [details]"
  4. System highlights problematic ingredients
  5. User corrects ingredient data or costs
  6. System recalculates successfully
  7. Save proceeds

#### E3: Published Recipe with Active Dependencies
- **Trigger**: User modifies published recipe used in menus/production
- **Flow**:
  1. System detects recipe has dependencies
  2. System displays warning banner:
     - "⚠️ This recipe is used in [X] menu items and [Y] production orders"
     - "Changes may affect pricing and operations"
  3. User acknowledges risk
  4. User saves changes
  5. System updates recipe
  6. System queues notifications to affected systems
  7. System logs high-impact change for audit

### Business Rules Applied
- BR-REC-001: Recipe name uniqueness
- BR-REC-009: Published recipe changes create versions
- BR-REC-011: Sub-recipe changes propagate to parent recipes
- BR-REC-003: Cost calculations maintain integrity
- Audit trail records all changes

### Performance Requirements
- Form load: < 1 second
- Cost recalculation: < 500ms
- Save operation: < 2 seconds
- Version history creation: < 1 second

### Acceptance Criteria
- [ ] Form pre-populated with current data
- [ ] All fields editable except ID
- [ ] Real-time validation on field changes
- [ ] Costs recalculate automatically when ingredients change
- [ ] Concurrent edit conflict detected and handled
- [ ] Version history created for published recipe edits
- [ ] Dependency warnings displayed when relevant
- [ ] Changes saved successfully
- [ ] Success message shown
- [ ] Updated data reflected in detail view
- [ ] Audit trail updated with change details

---

## UC-REC-005: Manage Recipe Ingredients

### Description
Users can add, edit, remove, and reorder ingredients for a recipe, with automatic cost calculations including wastage.

### Actor(s)
- Primary: Chef, Kitchen Manager
- Secondary: Admin

### Priority
Critical

### Frequency
Multiple times per day

### Preconditions
1. User is creating or editing a recipe (UC-REC-003 or UC-REC-004)
2. User has access to recipe form
3. Ingredient database populated with products/recipes

### Postconditions
1. Recipe ingredient list updated
2. Total recipe cost recalculated
3. Cost per portion updated
4. Ingredient availability checked
5. Sub-recipe dependencies tracked

### Main Flow
1. User navigates to Ingredients tab in recipe form
2. System displays current ingredient list (empty if new recipe)
3. User clicks "Add Ingredient"
4. System adds new ingredient row to list
5. User selects ingredient type (Product or Recipe)
6. User searches and selects specific ingredient from dropdown
7. System loads ingredient default data:
   - Name
   - Cost per unit (from inventory)
   - Inventory quantity
   - Inventory unit
8. User enters recipe quantity needed
9. User selects unit of measurement
10. User enters wastage percentage (default 0%)
11. System calculates:
    - Net cost = Quantity × Cost per unit
    - Wastage cost = Net cost × (Wastage% / 100)
    - Total cost = Net cost + Wastage cost
12. System displays calculated costs in row
13. System updates total recipe cost
14. User repeats for all ingredients
15. System saves ingredient list with recipe

### Alternative Flows

#### A1: Add Product Ingredient
- **Trigger**: User selects "Product" type
- **Flow**:
  1. System displays product search dropdown
  2. User types to search product inventory
  3. System filters products matching search
  4. User selects product from results
  5. System loads:
     - Product name
     - Current cost per unit (latest purchase price)
     - Available inventory quantity
     - Inventory unit
  6. If inventory low, system displays warning icon
  7. User proceeds with quantity entry

#### A2: Add Recipe Ingredient (Sub-Recipe)
- **Trigger**: User selects "Recipe" type
- **Flow**:
  1. System displays recipe search dropdown
  2. System shows only published recipes (exclude drafts)
  3. User types to search recipes
  4. System filters recipes matching search
  5. User selects recipe from results
  6. System checks for circular dependency:
     - Current recipe cannot use itself
     - Check nesting depth (max 3 levels)
     - Detect circular references (A → B → A)
  7. If circular detected:
     - System displays error: "Circular reference detected"
     - System blocks selection
  8. If valid:
     - System loads recipe cost per portion
     - User enters quantity needed
     - System calculates total cost

#### A3: Edit Ingredient
- **Trigger**: User modifies ingredient field
- **Flow**:
  1. User changes:
     - Quantity
     - Unit
     - Wastage percentage
  2. System recalculates costs in real-time:
     - Net cost
     - Wastage cost
     - Total cost
  3. System updates total recipe cost
  4. System validates:
     - Quantity > 0
     - Wastage 0-50%
  5. If valid, update succeeds
  6. If invalid, show error inline

#### A4: Remove Ingredient
- **Trigger**: User clicks delete icon on ingredient row
- **Flow**:
  1. System displays confirmation (optional for unsaved):
     - "Remove [ingredient name]?"
     - Options: "Remove", "Cancel"
  2. If confirmed:
     - System removes ingredient from list
     - System recalculates total recipe cost
     - System updates cost per portion

#### A5: Reorder Ingredients
- **Trigger**: User drags ingredient row to new position
- **Flow**:
  1. System enables drag handle on ingredient rows
  2. User drags ingredient to desired position
  3. System reorders ingredient list
  4. System updates display order
  5. Order saved with recipe

#### A6: Add Ingredient Notes
- **Trigger**: User expands ingredient row for details
- **Flow**:
  1. User clicks expand icon on ingredient row
  2. System displays additional fields:
     - Notes/Instructions
     - Preparation notes
  3. User enters text
  4. System saves notes with ingredient

### Exception Flows

#### E1: Product Not in Inventory
- **Trigger**: User searches for product not in system
- **Flow**:
  1. System search returns no results
  2. System displays: "No products found matching '[search term]'"
  3. System suggests:
     - "Check spelling and try again"
     - "Add product to inventory first"
  4. User can cancel or go to inventory management

#### E2: Ingredient Cost Missing
- **Trigger**: Selected ingredient has no cost data
- **Flow**:
  1. System detects missing cost per unit
  2. System displays warning: "⚠️ No cost available for [ingredient]"
  3. System allows:
     - Continue with $0 cost (warning shown)
     - Manually enter estimated cost
     - Cancel and update inventory first
  4. If manual entry:
     - User enters cost
     - System flags as manual override
     - System shows flag icon: "Manual cost - update inventory for accuracy"

#### E3: Circular Recipe Dependency
- **Trigger**: User tries to add recipe that creates circular reference
- **Flow**:
  1. System validates sub-recipe selection
  2. System detects circular dependency:
     - Recipe A uses Recipe B
     - User tries to make Recipe B use Recipe A
  3. System blocks selection
  4. System displays error:
     - "Circular reference detected"
     - "Recipe B cannot use Recipe A because Recipe A already uses Recipe B"
  5. User selects different recipe or cancels

#### E4: Inventory Insufficient
- **Trigger**: Recipe quantity exceeds available inventory
- **Flow**:
  1. System compares recipe quantity to inventory availability
  2. System detects insufficient inventory
  3. System displays warning icon with tooltip:
     - "⚠️ Low inventory"
     - "Need: [recipe qty], Available: [inventory qty]"
  4. System allows recipe save (warning only, not blocking)
  5. Production planning can handle procurement

#### E5: Maximum Nesting Depth Exceeded
- **Trigger**: User tries to add sub-recipe exceeding nesting limit
- **Flow**:
  1. System checks sub-recipe nesting depth
  2. Current recipe at depth 2, sub-recipe would be depth 3 (max)
  3. If exceeds max (3 levels):
     - System blocks selection
     - System displays: "Maximum recipe nesting depth exceeded"
     - System explains: "Recipes can only be nested 3 levels deep"
  4. User selects different ingredient or cancels

### Business Rules Applied
- BR-REC-004: Ingredient type constraints
- BR-REC-011: Sub-recipe dependency management
- BR-REC-003: Cost calculation integrity
- BR-REC-008: Wastage percentage constraints
- Minimum one ingredient required per recipe

### Performance Requirements
- Ingredient search: < 500ms
- Cost recalculation: < 200ms per ingredient
- Total cost update: < 500ms
- Ingredient list load: < 1 second for 50 ingredients

### Acceptance Criteria
- [ ] "Add Ingredient" button adds new row
- [ ] Type selector switches between Product/Recipe
- [ ] Search dropdown filters results as user types
- [ ] Selected ingredient loads default data
- [ ] Quantity and wastage fields accept numeric input only
- [ ] Costs calculate automatically and correctly
- [ ] Net cost, wastage cost, total cost displayed accurately
- [ ] Total recipe cost updates when ingredients change
- [ ] Circular dependencies detected and prevented
- [ ] Low inventory warnings displayed
- [ ] Ingredient removal recalculates costs
- [ ] Ingredient reordering works via drag-and-drop
- [ ] Validation errors shown inline
- [ ] All calculations match BR-REC-003 formulas

---

## UC-REC-006: Manage Preparation Steps

### Description
Users can add, edit, remove, and reorder preparation steps with detailed instructions, timing, temperature, equipment requirements, and step-specific images.

### Actor(s)
- Primary: Chef, Kitchen Manager
- Secondary: Admin

### Priority
High

### Frequency
Multiple times per day

### Preconditions
1. User is creating or editing a recipe (UC-REC-003 or UC-REC-004)
2. User has access to recipe form
3. Equipment list configured in system

### Postconditions
1. Recipe preparation steps updated
2. Steps numbered sequentially
3. Total prep time calculated from step durations
4. Step images uploaded to media storage
5. Equipment requirements documented

### Main Flow
1. User navigates to Preparation tab in recipe form
2. System displays current step list (empty if new recipe)
3. User clicks "Add Step"
4. System adds new step with sequential number
5. User enters step details:
   - Instructions (detailed text)
   - Duration (minutes)
   - Temperature (Celsius, optional)
   - Equipment selection (dropdown, optional)
6. User optionally uploads step image (drag-drop or click)
7. System validates and displays step
8. User repeats for all steps
9. System auto-numbers steps sequentially (1, 2, 3, ...)
10. System calculates total prep time (sum of step durations)
11. System saves steps with recipe

### Alternative Flows

#### A1: Upload Step Image
- **Trigger**: User uploads image for step
- **Flow**:
  1. User drags image file onto upload area or clicks to browse
  2. System validates:
     - File type: JPG, PNG, WebP only
     - File size: Max 10MB
     - Image dimensions: Min 800×600px
  3. If valid:
     - System uploads to media storage
     - System generates thumbnail
     - System displays image preview in step card
     - System enables "Remove Image" option
  4. If invalid:
     - System displays error: "[Invalid reason]"
     - System rejects upload
     - User corrects and retries

#### A2: Remove Step Image
- **Trigger**: User removes uploaded image
- **Flow**:
  1. User hovers over step image
  2. System displays "Remove Image" button overlay
  3. User clicks "Remove Image"
  4. System prompts: "Remove this image?"
  5. User confirms
  6. System removes image from media storage
  7. System displays empty upload placeholder

#### A3: Reorder Steps
- **Trigger**: User drags step to new position
- **Flow**:
  1. System enables drag handle on step cards
  2. User drags step to desired position
  3. System reorders steps
  4. System auto-renumbers all steps sequentially
  5. System updates display
  6. New order saved with recipe

#### A4: Edit Step
- **Trigger**: User modifies step field
- **Flow**:
  1. User changes:
     - Instructions text
     - Duration
     - Temperature
     - Equipment
  2. System validates changes in real-time
  3. If duration changed:
     - System recalculates total prep time
     - System updates recipe prep time field
  4. Changes saved with recipe

#### A5: Remove Step
- **Trigger**: User clicks delete icon on step card
- **Flow**:
  1. System prompts: "Remove Step [#]?"
  2. User confirms
  3. System removes step from list
  4. System renumbers remaining steps (no gaps)
  5. System recalculates total prep time
  6. System updates display

#### A6: Select Multiple Equipment Items
- **Trigger**: User needs to specify multiple equipment pieces
- **Flow**:
  1. User clicks equipment dropdown
  2. System displays equipment list
  3. System allows multiple selections (checkboxes)
  4. User selects required equipment:
     - Oven, Stove, Grill, Mixer, etc.
  5. System displays selected equipment as tags
  6. User can remove individual tags

### Exception Flows

#### E1: Invalid Image Format
- **Trigger**: User uploads unsupported image type
- **Flow**:
  1. System detects invalid file type (e.g., .gif, .bmp, .pdf)
  2. System rejects upload
  3. System displays error:
     - "Invalid file format"
     - "Please upload JPG, PNG, or WebP images only"
  4. User selects valid file and retries

#### E2: Image Too Large
- **Trigger**: User uploads image exceeding size limit
- **Flow**:
  1. System detects file size > 10MB
  2. System rejects upload
  3. System displays error:
     - "Image too large (current size: [size])"
     - "Maximum size: 10MB"
     - "Please resize or compress image"
  4. User compresses image and retries

#### E3: Empty Step Description
- **Trigger**: User attempts to save step with no instructions
- **Flow**:
  1. System validates step on save
  2. System detects empty description field
  3. System highlights field with error styling
  4. System displays error: "Step instructions required"
  5. User enters instructions (min 10 characters)
  6. System validates and save succeeds

#### E4: Invalid Duration or Temperature
- **Trigger**: User enters invalid numeric value
- **Flow**:
  1. System validates numeric fields
  2. System detects:
     - Duration: negative or > 1000 minutes
     - Temperature: negative or > 500°C
  3. System displays inline error:
     - "Duration must be 0-1000 minutes"
     - "Temperature must be 0-500°C"
  4. User corrects value
  5. System validates and accepts

### Business Rules Applied
- BR-REC-006: Preparation step ordering
- Steps numbered sequentially without gaps
- Step description: 10-1000 characters
- Duration and temperature optional but validated if provided
- Image upload follows BR-REC-013 media requirements

### Performance Requirements
- Add step: < 500ms
- Image upload: < 3 seconds per image
- Reorder steps: < 500ms transition
- Total prep time calculation: < 200ms

### Acceptance Criteria
- [ ] "Add Step" button adds sequentially numbered step
- [ ] Step instructions field accepts rich text
- [ ] Duration field accepts numbers only (0-1000)
- [ ] Temperature field accepts numbers only (0-500)
- [ ] Equipment dropdown allows multiple selections
- [ ] Image upload works (drag-drop or click)
- [ ] Image preview displays after upload
- [ ] Invalid images rejected with clear error
- [ ] Step reordering auto-renumbers steps
- [ ] Step removal auto-renumbers remaining steps
- [ ] Total prep time recalculates when durations change
- [ ] Equipment selections saved correctly
- [ ] Step images uploaded to media storage
- [ ] All validations work as specified

---

## UC-REC-007: Analyze Recipe Costs

### Description
Users can view detailed cost breakdowns including ingredient costs, labor costs, overhead costs, and total costs with percentage contributions and variance analysis.

### Actor(s)
- Primary: Kitchen Manager, Finance Manager
- Secondary: Chef, Admin

### Priority
Critical

### Frequency
Multiple times per day

### Preconditions
1. User is viewing recipe detail or edit form
2. User has `recipe.cost.view` permission
3. Recipe has at least one ingredient
4. Ingredient costs available in inventory

### Postconditions
1. Cost breakdown displayed with all components
2. Percentage contributions calculated
3. Cost per portion calculated
4. Variance from targets identified
5. Cost optimization recommendations provided

### Main Flow
1. User navigates to Cost tab in recipe form/detail
2. System displays "Cost Analysis" section
3. System shows ingredient cost table with columns:
   - Ingredient name
   - Quantity and unit
   - Cost per unit
   - Net cost
   - Wastage cost
   - Total cost
   - Percentage of total recipe cost
4. System displays cost summary card:
   - Total ingredient cost
   - Labor cost (percentage and amount)
   - Overhead cost (percentage and amount)
   - Total recipe cost
   - Cost per portion
5. System displays cost distribution chart (pie chart):
   - Ingredient cost segment
   - Labor cost segment
   - Overhead cost segment
6. User can adjust labor and overhead percentages
7. System recalculates costs in real-time
8. System highlights high-cost ingredients (>20% of total)
9. User reviews analysis for optimization opportunities

### Alternative Flows

#### A1: Adjust Labor Cost Percentage
- **Trigger**: User modifies labor cost percentage
- **Flow**:
  1. User changes labor cost % field
  2. System validates: 0-100%
  3. System recalculates:
     - Labor cost amount = Ingredient cost × (Labor% / 100)
     - Total recipe cost = Ingredient + Labor + Overhead
     - Cost per portion = Total / Yield
  4. System updates all dependent values
  5. System updates cost distribution chart
  6. System saves new percentage with recipe

#### A2: Adjust Overhead Cost Percentage
- **Trigger**: User modifies overhead cost percentage
- **Flow**:
  1. User changes overhead cost % field
  2. System validates: 0-100%
  3. System recalculates (same as A1)
  4. System updates all dependent values
  5. System updates cost distribution chart
  6. System saves new percentage with recipe

#### A3: Recalculate Costs
- **Trigger**: User clicks "Recalculate" button
- **Flow**:
  1. System refreshes ingredient costs from inventory
  2. System checks for cost changes since last calculation
  3. System recalculates all cost components
  4. System displays changes summary:
     - Previous total cost
     - Current total cost
     - Change amount and percentage
     - Ingredients with cost changes highlighted
  5. System updates recipe with new costs
  6. If significant change (>10%):
     - System displays alert: "Cost increased by [%]"
     - System suggests reviewing pricing

#### A4: View Historical Cost Trends
- **Trigger**: User clicks "Cost History" button
- **Flow**:
  1. System displays cost trend chart
  2. System shows:
     - Cost per portion over time (line chart)
     - Major cost changes (markers)
     - Ingredient cost volatility
  3. User can select date range
  4. System highlights cost spikes
  5. User identifies cost drivers for management action

#### A5: Compare to Category Averages
- **Trigger**: User clicks "Compare to Category"
- **Flow**:
  1. System calculates category averages:
     - Average cost per portion
     - Average food cost percentage
     - Average margin
  2. System displays comparison:
     - This recipe: [values]
     - Category average: [values]
     - Difference: +/- [amount] ([%])
  3. System color codes performance:
     - Green: Better than average
     - Yellow: Near average (±10%)
     - Red: Significantly above average (>10%)

### Exception Flows

#### E1: Missing Ingredient Costs
- **Trigger**: One or more ingredients lack cost data
- **Flow**:
  1. System detects missing costs during calculation
  2. System displays warning:
     - "⚠️ Cost calculation incomplete"
     - "Missing costs for: [ingredient list]"
  3. System shows partial calculation:
     - Known costs: [amount]
     - Unknown: [count] ingredients
     - Estimated total: [range]
  4. System suggests:
     - "Update inventory costs for accuracy"
     - Link to inventory management
  5. User can:
     - Proceed with partial data
     - Manually enter estimated costs
     - Update inventory first

#### E2: Cost Calculation Error
- **Trigger**: Mathematical error during calculation
- **Flow**:
  1. System encounters error (e.g., division by zero, null values)
  2. System catches error gracefully
  3. System displays:
     - "Cost calculation error"
     - Error details (for admins)
     - "Please check ingredient data"
  4. System logs error for debugging
  5. System allows manual cost entry
  6. User reports issue or manually corrects

#### E3: Outdated Ingredient Costs
- **Trigger**: Ingredient costs not updated recently (>30 days)
- **Flow**:
  1. System checks cost update timestamps
  2. System detects stale costs (>30 days old)
  3. System displays warning:
     - "⚠️ Some ingredient costs may be outdated"
     - "Last updated: [date] ([X] days ago)"
     - List of outdated ingredients
  4. System suggests:
     - "Refresh costs from inventory"
     - "Verify costs with procurement"
  5. User acknowledges or updates costs

### Business Rules Applied
- BR-REC-003: Cost calculation integrity
- BR-REC-008: Wastage percentage constraints
- Labor cost %: 0-100% (default from category)
- Overhead cost %: 0-100% (default from category)
- All formulas per BR-REC-003

### Performance Requirements
- Cost calculation: < 500ms for 50 ingredients
- Real-time recalculation: < 200ms per change
- Chart rendering: < 1 second
- Cost history query: < 2 seconds

### Acceptance Criteria
- [ ] Ingredient cost table displays all ingredients with costs
- [ ] Cost summary shows all components accurately
- [ ] Percentage contributions calculated correctly
- [ ] Cost per portion calculated accurately
- [ ] Labor and overhead percentages adjustable
- [ ] Costs recalculate in real-time on percentage change
- [ ] Cost distribution chart renders correctly
- [ ] High-cost ingredients highlighted (>20%)
- [ ] "Recalculate" button refreshes from inventory
- [ ] Missing costs handled gracefully with warnings
- [ ] Cost history displays trends over time
- [ ] Category comparison shows relative performance
- [ ] All calculations match BR-REC-003 formulas

---

## UC-REC-008: Set Pricing Strategy

### Description
Users can set selling prices based on target margins, view pricing recommendations, analyze profitability, and compare against competitors.

### Actor(s)
- Primary: Kitchen Manager, Finance Manager
- Secondary: Admin

### Priority
Critical

### Frequency
Daily

### Preconditions
1. User is viewing recipe cost analysis (UC-REC-007)
2. User has `recipe.cost.edit` permission
3. Recipe costs calculated
4. Cost per portion available

### Postconditions
1. Selling price set for recipe
2. Food cost percentage calculated
3. Gross profit and margin calculated
4. Pricing alerts generated if thresholds exceeded
5. Recommended price displayed

### Main Flow
1. User views Pricing Analysis section in Cost tab
2. System displays current pricing metrics:
   - Cost per portion
   - Current selling price (if set)
   - Food cost percentage
   - Gross profit
   - Gross margin percentage
3. User enters target food cost percentage (e.g., 30%)
4. System calculates recommended price:
   - Recommended = Cost per portion / (Target% / 100)
   - Example: $10 cost / 0.30 = $33.33 recommended
5. System displays recommendation
6. User enters actual selling price
7. System calculates actual metrics:
   - Actual food cost % = (Cost / Selling price) × 100
   - Gross profit = Selling price - Cost
   - Gross margin % = (Gross profit / Selling price) × 100
8. System compares actual vs. target:
   - Color codes: Green (at/below target), Yellow (±5%), Red (>target +5%)
   - Displays variance: +/- [amount] ([%])
9. System displays alert if thresholds exceeded
10. User saves pricing
11. System updates recipe with new selling price

### Alternative Flows

#### A1: Use Recommended Price
- **Trigger**: User clicks "Use Recommended" button
- **Flow**:
  1. System copies recommended price to selling price field
  2. System recalculates metrics (actual = target)
  3. System displays confirmation:
     - "Pricing set to recommended $[amount]"
     - Food cost % = Target %
     - Margin = Expected margin
  4. User can adjust or save

#### A2: Adjust Target Food Cost Percentage
- **Trigger**: User modifies target %
- **Flow**:
  1. User changes target food cost % (e.g., 30% → 25%)
  2. System validates: 15-50% range
  3. System recalculates recommended price
  4. System updates pricing recommendation
  5. User reviews new recommendation
  6. User decides whether to adjust selling price

#### A3: Compare to Competitor Pricing
- **Trigger**: User views competitor analysis section
- **Flow**:
  1. System displays competitor pricing table:
     - Competitor name
     - Their price
     - Their portion size
     - Price per 100g (standardized)
  2. System highlights:
     - Lowest competitor price (green)
     - Highest competitor price (red)
     - Own price position
  3. System shows competitive position:
     - "Your price: $X ([position] out of [count])"
     - "Average competitor: $Y"
     - "Difference: ±$Z ([%])"
  4. User assesses competitive positioning
  5. User adjusts price if needed

#### A4: Add Competitor
- **Trigger**: User clicks "Add Competitor"
- **Flow**:
  1. System opens competitor entry dialog
  2. User enters:
     - Competitor name
     - Their selling price
     - Their portion size
     - Notes (optional)
  3. System calculates standardized unit price
  4. System adds to competitor table
  5. System recalculates competitive position
  6. System saves competitor data

#### A5: View Profitability Chart
- **Trigger**: User views pricing analysis chart
- **Flow**:
  1. System displays profitability visualization:
     - Cost per portion (bar)
     - Selling price (bar)
     - Gross profit (difference, highlighted)
     - Target margin line (reference)
  2. System shows margin zones:
     - Below cost (red zone)
     - Low margin <40% (orange zone)
     - Target margin 40-60% (yellow zone)
     - Healthy margin >60% (green zone)
  3. User visualizes pricing performance
  4. User identifies improvement opportunities

### Exception Flows

#### E1: Selling Price Below Cost
- **Trigger**: User enters selling price less than cost per portion
- **Flow**:
  1. System detects selling price < cost
  2. System displays critical alert:
     - "⚠️ CRITICAL: Selling price below cost!"
     - "You will lose $[amount] per portion sold"
     - "Food cost: [%] (>100%)"
  3. System highlights field in red
  4. System prevents save until corrected or override confirmed
  5. If override requested:
     - System displays: "Are you sure? This will result in losses."
     - User must confirm understanding
     - System logs override with reason

#### E2: Food Cost Percentage Too High
- **Trigger**: Actual food cost % > Target + 10%
- **Flow**:
  1. System calculates actual vs. target variance
  2. System detects: Actual = 45%, Target = 30% (diff = +15%)
  3. System displays warning:
     - "⚠️ Food cost above target"
     - "Actual: 45%, Target: 30% (+15%)"
     - "You are losing [X%] margin"
  4. System suggests actions:
     - "Increase selling price to $[recommended]"
     - "Reduce ingredient costs by [%]"
     - "Review portion sizes"
  5. User reviews and takes action

#### E3: Margin Too Low
- **Trigger**: Gross margin < 60% (configurable threshold)
- **Flow**:
  1. System detects low margin
  2. System displays warning:
     - "⚠️ Margin below recommended threshold"
     - "Current: [margin]%, Recommended: ≥60%"
  3. System calculates required price increase:
     - "Increase price by $[amount] to reach 60% margin"
  4. User reviews recommendation
  5. User adjusts pricing or accepts lower margin

#### E4: Invalid Target Food Cost Percentage
- **Trigger**: User enters target % outside valid range
- **Flow**:
  1. System validates target food cost % (15-50%)
  2. System detects out of range (e.g., 5% or 80%)
  3. System displays error:
     - "Target food cost must be between 15% and 50%"
     - "Industry standard: 25-35%"
  4. System highlights field
  5. User corrects to valid range
  6. System validates and accepts

### Business Rules Applied
- BR-REC-007: Pricing strategy and analysis
- BR-REC-010: Pricing alert thresholds
- Target food cost %: 15-50%
- Alert if actual > target + 5%
- Critical if selling price < cost
- All pricing formulas per BR-REC-007

### Performance Requirements
- Price calculation: < 200ms
- Real-time recalculation: < 200ms per change
- Chart rendering: < 1 second
- Competitor data load: < 1 second

### Acceptance Criteria
- [ ] Target food cost % field accepts 15-50% range
- [ ] Recommended price calculated correctly
- [ ] "Use Recommended" button sets selling price
- [ ] Actual food cost % calculated correctly
- [ ] Gross profit and margin calculated correctly
- [ ] Color coding applied based on thresholds
- [ ] Alerts displayed when thresholds exceeded
- [ ] Competitor pricing table displays comparisons
- [ ] Add competitor functionality works
- [ ] Profitability chart renders correctly
- [ ] Selling price below cost blocked or requires override
- [ ] All calculations match BR-REC-007 formulas
- [ ] Pricing saved with recipe successfully

---

## UC-REC-009: Configure Yield Variants

### Description
Users can define multiple yield variants for recipes to support fractional sales scenarios such as selling pizza by the slice, cake by the portion, or beverages by the glass.

### Actor(s)
- Primary: Kitchen Manager
- Secondary: Chef, Admin

### Priority
High

### Frequency
Several times per week

### Preconditions
1. User is creating or editing a recipe (UC-REC-003 or UC-REC-004)
2. Recipe basic information entered (name, yield)
3. Recipe costs calculated

### Postconditions
1. Multiple yield variants defined
2. Conversion rates set for each variant
3. Individual pricing per variant
4. Default variant designated
5. Fractional sales enabled for recipe
6. POS integration updated with variants

### Main Flow
1. User navigates to basic information section in recipe form
2. System displays yield information:
   - Base yield (e.g., 1 large pizza, 8 portions)
   - Base yield unit (pizza, cake, portions)
3. User checks "Allow Fractional Sales" checkbox
4. System displays "Fractional Sales Type" dropdown
5. User selects fractional type:
   - Pizza Slice
   - Cake Slice
   - Bottle/Glass
   - Portion Control
   - Custom
6. System displays yield variants configuration section
7. User clicks "Add Yield Variant"
8. User enters variant details:
   - Variant name (e.g., "Pizza Slice", "Half Pizza")
   - Unit (slice, half, whole)
   - Conversion rate (portion of base recipe, 0.01-1.0)
   - Selling price
   - Shelf life (hours, optional)
   - Wastage rate (%, optional)
9. System calculates cost per unit:
   - Cost per unit = Total recipe cost × Conversion rate
10. User sets one variant as default (for standard sales)
11. User repeats for all selling options
12. System validates:
    - At least one variant defined
    - One variant marked as default
    - Conversion rates logical and sum appropriately
13. System saves yield variants with recipe

### Alternative Flows

#### A1: Pizza Slice Configuration
- **Trigger**: User selects "Pizza Slice" fractional type
- **Flow**:
  1. System suggests standard pizza variants:
     - Single Slice (1/8, 0.125)
     - Half Pizza (1/2, 0.5)
     - Whole Pizza (1.0)
  2. User clicks "Use Standard Pizza Variants"
  3. System adds all three variants
  4. System sets conversion rates automatically
  5. User enters pricing for each variant:
     - Slice: $4.99
     - Half: $18.99
     - Whole: $34.99
  6. System validates pricing logic (slice × 8 ≤ whole price)
  7. User sets "Whole Pizza" as default
  8. System saves configuration

#### A2: Cake Slice Configuration
- **Trigger**: User selects "Cake Slice" fractional type
- **Flow**:
  1. System suggests standard cake variants:
     - Single Slice (1/16, 0.0625)
     - Quarter Cake (1/4, 0.25)
     - Half Cake (1/2, 0.5)
     - Whole Cake (1.0)
  2. User clicks "Use Standard Cake Variants"
  3. System adds all four variants
  4. System sets conversion rates
  5. User enters pricing:
     - Slice: $6.99
     - Quarter: $24.99
     - Half: $47.99
     - Whole: $89.99
  6. User sets "Single Slice" as default (most common sale)
  7. System saves configuration

#### A3: Bottle/Glass Configuration
- **Trigger**: User selects "Bottle/Glass" fractional type
- **Flow**:
  1. System suggests beverage variants:
     - By the Glass (1/5, 0.2 for standard 750ml bottle)
     - Half Bottle (1/2, 0.5)
     - Full Bottle (1.0)
  2. User customizes glass size:
     - Enters glass volume (ml)
     - System calculates conversion rate from bottle size
  3. User enters pricing:
     - Glass: $12.00
     - Half Bottle: $28.00
     - Bottle: $52.00
  4. User configures shelf life:
     - Glass: 2 hours (service time)
     - Half Bottle: 24 hours (re-corked)
     - Bottle: 168 hours (unopened)
  5. System saves configuration

#### A4: Custom Variant Configuration
- **Trigger**: User selects "Custom" or needs non-standard variants
- **Flow**:
  1. User manually adds each variant
  2. User enters all details manually:
     - Name: descriptive name
     - Unit: custom unit name
     - Conversion rate: decimal value
     - Pricing: per-unit price
     - Shelf life: hours
     - Wastage rate: percentage
  3. System validates entries
  4. User saves custom configuration

#### A5: Edit Yield Variant
- **Trigger**: User modifies existing variant
- **Flow**:
  1. User clicks edit icon on variant row
  2. System displays variant details in edit mode
  3. User modifies:
     - Name, unit, conversion rate, price, shelf life, wastage
  4. System recalculates cost per unit
  5. System validates changes
  6. User saves updates
  7. System refreshes variant list

#### A6: Remove Yield Variant
- **Trigger**: User deletes variant
- **Flow**:
  1. User clicks delete icon on variant row
  2. System checks if variant is default
  3. If default:
     - System displays error: "Cannot delete default variant"
     - System suggests: "Set another variant as default first"
  4. If not default:
     - System prompts: "Remove [variant name]?"
     - User confirms
     - System removes variant
  5. If only one variant remains:
     - System displays warning: "At least one variant required"
     - System prevents deletion of last variant

### Exception Flows

#### E1: Invalid Conversion Rate
- **Trigger**: User enters conversion rate outside 0.01-1.0 range
- **Flow**:
  1. System validates conversion rate
  2. System detects: rate < 0.01 or rate > 1.0
  3. System displays error:
     - "Conversion rate must be between 0.01 and 1.0"
     - "Example: 1/8 pizza slice = 0.125"
  4. System highlights field
  5. User corrects value
  6. System validates and accepts

#### E2: No Default Variant Selected
- **Trigger**: User attempts to save without default variant
- **Flow**:
  1. System validates yield variants on save
  2. System detects no variant marked as default
  3. System displays error:
     - "Please select a default variant"
     - "Default variant used for standard sales"
  4. User sets one variant as default
  5. System validates and save succeeds

#### E3: Illogical Pricing
- **Trigger**: System detects pricing that doesn't scale logically
- **Flow**:
  1. System checks pricing relationships
  2. System detects: Slice × 8 > Whole price significantly
     - Example: Slice $6 × 8 = $48, Whole = $35 (customer better buying slices)
  3. System displays warning:
     - "⚠️ Pricing may not be optimal"
     - "8 slices cost more than whole pizza"
     - "This may confuse customers"
  4. System allows save (warning only, not blocking)
  5. User reviews and adjusts or accepts

#### E4: Shelf Life Conflicts
- **Trigger**: User sets longer shelf life for smaller portions
- **Flow**:
  1. System checks shelf life relationships
  2. System detects: Slice shelf life > Whole shelf life
     - Example: Slice = 24 hours, Whole = 12 hours (illogical)
  3. System displays warning:
     - "⚠️ Shelf life inconsistency detected"
     - "Smaller portions typically have shorter shelf life"
  4. User reviews and corrects or confirms

### Business Rules Applied
- BR-REC-004: Yield variant consistency
- At least one yield variant required
- Conversion rate: 0.01-1.0
- One variant must be default
- Pricing should scale logically (warning if not)
- Fractional sales require special POS handling

### Performance Requirements
- Variant addition: < 500ms
- Cost calculation per variant: < 200ms
- Variant list update: < 500ms
- Save operation: < 2 seconds

### Acceptance Criteria
- [ ] "Allow Fractional Sales" checkbox enables variant configuration
- [ ] Fractional sales type dropdown offers all options
- [ ] Standard variants suggested based on type
- [ ] "Add Yield Variant" creates new variant row
- [ ] Conversion rate field validates 0.01-1.0 range
- [ ] Cost per unit calculated automatically
- [ ] Default variant can be set (radio button)
- [ ] Cannot delete last variant
- [ ] Cannot delete default variant without reassignment
- [ ] Pricing logic warnings displayed
- [ ] Shelf life consistency checked
- [ ] All variants saved with recipe
- [ ] POS integration receives variant data

---

## UC-REC-010: Publish Recipe

### Description
Users can publish draft recipes to make them available for production use, menu planning, and POS integration after completing all required information and passing validation.

### Actor(s)
- Primary: Kitchen Manager
- Secondary: Admin

### Priority
Critical

### Frequency
Several times per day

### Preconditions
1. User has `recipe.publish` permission
2. Recipe exists in draft status
3. Recipe has all required fields completed

### Postconditions
1. Recipe status changed to "published"
2. Recipe visible to production staff
3. Recipe available in POS system
4. Recipe available for menu engineering
5. Publish timestamp and user recorded
6. Recipe version created (for future edits)

### Main Flow
1. User views draft recipe in detail or edit view
2. User clicks "Publish Recipe" button
3. System performs pre-publish validation checks:
   - Recipe name unique
   - Description present (≥10 characters)
   - Category assigned
   - Cuisine assigned
   - At least one yield variant defined
   - At least one ingredient added
   - At least one preparation step documented
   - Recipe image uploaded
   - Cost per portion calculated
   - Selling price set
4. System validates all business rules
5. All checks pass
6. System displays confirmation dialog:
   - "Publish Recipe: [Recipe Name]?"
   - Summary of key details
   - "Once published, changes will create versions"
   - Options: "Publish", "Cancel"
7. User clicks "Publish"
8. System updates recipe status to "published"
9. System records publish timestamp and user
10. System creates initial version (v1.0)
11. System triggers integration updates:
    - Send recipe to POS system
    - Make available in menu engineering
    - Notify production planning
12. System displays success message: "Recipe published successfully"
13. System redirects to recipe detail view with published badge
14. Recipe now visible to all authorized users

### Alternative Flows

#### A1: Validation Fails - Missing Required Fields
- **Trigger**: Pre-publish validation detects missing fields
- **Flow**:
  1. System performs validation checks
  2. System identifies missing fields:
     - Example: No image, no preparation steps
  3. System displays error dialog:
     - "Cannot publish recipe"
     - "Please complete the following:"
     - [✗] Recipe image
     - [✗] Preparation steps (0 of min 1)
     - [✓] Other fields complete
  4. System highlights sections with issues
  5. User clicks "Complete Now" or "Cancel"
  6. If "Complete Now":
     - System navigates to first incomplete section
     - User completes required fields
     - User retries publish
  7. If "Cancel":
     - Recipe remains in draft
     - User can complete later

#### A2: Publish with Warnings
- **Trigger**: Validation passes but warnings exist
- **Flow**:
  1. System performs validation
  2. System detects non-blocking issues:
     - Food cost % above target
     - No competitor data
     - Ingredient costs outdated (>30 days)
  3. System displays warning dialog:
     - "Ready to publish with warnings:"
     - ⚠️ Food cost 38% (target: 30%)
     - ⚠️ Ingredient costs not updated recently
     - "Publish anyway?"
     - Options: "Yes, Publish", "Review", "Cancel"
  4. User selects:
     - **Yes, Publish**: Proceed with warnings, publish succeeds
     - **Review**: Navigate to problem areas, fix if desired
     - **Cancel**: Stay in draft, address warnings

#### A3: Unpublish Recipe (Revert to Draft)
- **Trigger**: User needs to unpublish recipe for major revisions
- **Flow**:
  1. User views published recipe
  2. User clicks "Unpublish" button (if available)
  3. System checks recipe usage:
     - Used in active menus?
     - Used in production orders?
     - POS sales in last 30 days?
  4. If in use:
     - System blocks unpublish
     - System displays:
       - "Cannot unpublish - Recipe in active use"
       - "Used in: [Menu items, Production orders]"
       - "Last sold: [date]"
     - User must remove dependencies first
  5. If not in use:
     - System prompts: "Revert to draft? Recipe will be hidden from production."
     - User confirms
     - System changes status to draft
     - System hides from production and POS
     - System notifies affected systems

#### A4: Schedule Publish Date
- **Trigger**: User wants to publish recipe at future date
- **Flow**:
  1. User clicks "Schedule Publish"
  2. System displays date/time picker
  3. User selects future publish date and time
  4. System validates date is in future
  5. System saves scheduled publish
  6. System displays: "Recipe scheduled to publish on [date] at [time]"
  7. System creates scheduled job
  8. At scheduled time:
     - System automatically validates recipe
     - If valid, publishes recipe
     - If invalid, sends notification to user
  9. Recipe remains draft until scheduled time

### Exception Flows

#### E1: Duplicate Recipe Name
- **Trigger**: Published recipe name conflicts with existing recipe
- **Flow**:
  1. System checks name uniqueness during validation
  2. System detects duplicate: "[Name]" already exists
  3. System displays error:
     - "Cannot publish - Recipe name already exists"
     - "Similar recipe: [Link to existing recipe]"
     - "Please choose a unique name"
  4. System highlights name field
  5. User modifies recipe name
  6. System revalidates
  7. When unique, publish proceeds

#### E2: Category or Cuisine Inactive
- **Trigger**: Referenced category/cuisine deactivated since draft creation
- **Flow**:
  1. System validates category/cuisine during publish
  2. System detects inactive status
  3. System displays error:
     - "Cannot publish - [Category/Cuisine] is inactive"
     - "Please select an active [category/cuisine]"
  4. System refreshes dropdown with active options
  5. User selects active alternative
  6. System revalidates
  7. When valid, publish proceeds

#### E3: Sub-Recipe Dependencies Not Published
- **Trigger**: Recipe uses sub-recipes that are still in draft
- **Flow**:
  1. System validates all sub-recipe dependencies
  2. System detects draft sub-recipes
  3. System displays error:
     - "Cannot publish - Uses unpublished recipes"
     - "Draft recipes: [List with links]"
     - Options:
       - "Publish dependencies first"
       - "Replace with published alternatives"
       - "Cancel"
  4. If "Publish dependencies":
     - System opens each draft recipe
     - User publishes each (recursive)
     - User returns and retries main recipe publish
  5. If "Replace":
     - System suggests published alternatives
     - User selects replacements
     - System updates recipe
     - Publish proceeds

#### E4: POS Integration Failure
- **Trigger**: Recipe publishes but POS sync fails
- **Flow**:
  1. System successfully publishes recipe locally
  2. System attempts to sync with POS
  3. POS sync fails (network, API error, etc.)
  4. System displays warning:
     - "Recipe published locally"
     - "⚠️ POS sync failed - Recipe not yet in POS"
     - "Will retry automatically"
  5. System queues recipe for retry
  6. System adds retry job to background queue
  7. System notifies user when sync succeeds
  8. Recipe visible in app but not POS until sync

### Business Rules Applied
- BR-REC-002: Required fields for publishing
- BR-REC-009: Recipe status workflow
- BR-REC-001: Recipe name uniqueness
- BR-REC-011: Sub-recipe dependencies
- Audit trail records publish action
- Version created for published recipes

### Performance Requirements
- Validation checks: < 1 second
- Publish operation: < 3 seconds
- POS integration: < 5 seconds
- Version creation: < 1 second

### Acceptance Criteria
- [ ] "Publish Recipe" button visible for draft recipes
- [ ] Pre-publish validation runs all checks
- [ ] Missing fields clearly identified with checklist
- [ ] Validation errors displayed with helpful messages
- [ ] Warnings displayed but don't block publish
- [ ] Duplicate name prevented
- [ ] Inactive category/cuisine detected
- [ ] Sub-recipe dependencies validated
- [ ] Publish confirmation dialog shown
- [ ] Recipe status changes to "published" on success
- [ ] Publish timestamp and user recorded
- [ ] Version created for future edit tracking
- [ ] POS integration triggered
- [ ] Success message displayed
- [ ] Recipe badge updated to show "Published"
- [ ] Recipe visible to production staff
- [ ] Integration failures handled gracefully

---

## UC-REC-011: View Recipe Details

### Description
Users can view comprehensive recipe information including all details, costs, pricing, preparation steps, and history in a read-only detail view.

### Actor(s)
- Primary: Chef, Kitchen Manager, Production Staff
- Secondary: Admin

### Priority
High

### Frequency
Multiple times per day

### Preconditions
1. User is authenticated
2. User has `recipe.view` permission
3. Recipe exists in system

### Postconditions
1. Recipe details displayed comprehensively
2. User can navigate to edit if authorized
3. User can print or export recipe if authorized

### Main Flow
1. User selects recipe from list view
2. System navigates to recipe detail view
3. System displays recipe header:
   - Recipe name
   - Category and cuisine badges
   - Status badge (draft/published)
   - Recipe image (large)
   - Quick stats: Yield, Prep time, Difficulty, Cost, Price, Margin
4. System displays tabbed sections:
   - **Overview**: Summary information
   - **Ingredients**: Full ingredient list with costs
   - **Preparation**: Step-by-step instructions with images
   - **Costs & Pricing**: Detailed cost breakdown and pricing analysis
   - **Yield Variants**: Available selling options
   - **Details**: Tags, allergens, notes
   - **History**: Version history and changes (if published)
5. User can switch between tabs to view different sections
6. User can scroll through all information
7. User can click "Edit" button (if authorized) to modify recipe
8. User can click "Print" to generate printable recipe card
9. User can click "Export" to download recipe data

### Alternative Flows

#### A1: View Ingredient Details
- **Trigger**: User views Ingredients tab
- **Flow**:
  1. System displays ingredient table:
     - Ingredient name (product or recipe link)
     - Type badge (Product/Recipe)
     - Quantity and unit
     - Wastage %
     - Cost per unit
     - Total cost
  2. User can click product ingredient to view inventory details
  3. User can click recipe ingredient to view sub-recipe details
  4. System displays hover tooltip with additional info:
     - Inventory availability
     - Last cost update
     - Supplier info (if available)

#### A2: View Preparation Steps
- **Trigger**: User views Preparation tab
- **Flow**:
  1. System displays steps in sequential order
  2. Each step card shows:
     - Step number
     - Large step image (if available)
     - Detailed instructions
     - Duration, temperature, equipment
  3. User can view step images in fullscreen (click to expand)
  4. User can scroll through all steps
  5. System displays total prep time at bottom

#### A3: View Cost Breakdown
- **Trigger**: User views Costs & Pricing tab
- **Flow**:
  1. System displays cost analysis dashboard:
     - Cost pie chart (ingredient, labor, overhead)
     - Cost summary table
     - Pricing metrics
     - Margin analysis
  2. User reviews cost distribution
  3. User sees historical cost trends (if available)
  4. User compares to category averages
  5. User views competitor pricing comparison

#### A4: View Yield Variants
- **Trigger**: User views Yield Variants tab
- **Flow**:
  1. System displays all configured variants
  2. Each variant shows:
     - Variant name (e.g., "Pizza Slice")
     - Unit and quantity
     - Conversion rate
     - Cost per unit
     - Selling price
     - Margin
     - Default badge (if applicable)
  3. User sees how fractional pricing works
  4. User identifies default selling option

#### A5: View Recipe History
- **Trigger**: User views History tab (published recipes only)
- **Flow**:
  1. System displays version timeline:
     - Current version (v1.2)
     - Previous versions (v1.1, v1.0)
     - Each with: Date, User, Changes summary
  2. User clicks version to view details
  3. System displays version comparison:
     - What changed (fields modified)
     - Old vs. new values
     - Change reason (if recorded)
  4. User can restore previous version (if authorized)

#### A6: Print Recipe Card
- **Trigger**: User clicks "Print" button
- **Flow**:
  1. System opens print preview dialog
  2. System generates print-optimized layout:
     - Recipe name and image
     - Ingredients list
     - Preparation steps
     - Cost/pricing summary
     - Allergen warnings
     - QR code for digital version
  3. User reviews print preview
  4. User adjusts print settings (portrait/landscape, color/BW)
  5. User clicks "Print"
  6. System sends to printer or saves as PDF

#### A7: Export Recipe
- **Trigger**: User clicks "Export" button
- **Flow**:
  1. System displays export options:
     - Format: PDF, CSV, JSON
     - Include images: Yes/No
     - Include cost data: Yes/No
  2. User selects preferences
  3. User clicks "Export"
  4. System generates file
  5. System triggers download
  6. User saves file locally

### Exception Flows

#### E1: Recipe Not Found
- **Trigger**: User accesses invalid recipe ID
- **Flow**:
  1. System attempts to load recipe
  2. System detects recipe doesn't exist
  3. System displays 404 error page:
     - "Recipe not found"
     - "This recipe may have been deleted"
     - "Return to recipe list"
  4. User clicks link to return to list

#### E2: Missing Media Assets
- **Trigger**: Recipe images fail to load
- **Flow**:
  1. System attempts to load images
  2. Image load fails (404, timeout, etc.)
  3. System displays placeholder image:
     - Gray box with camera icon
     - "Image unavailable"
  4. User can continue viewing other recipe data
  5. System logs missing media for admin review

#### E3: Cost Data Unavailable
- **Trigger**: User views recipe with incomplete cost data
- **Flow**:
  1. System detects missing ingredient costs
  2. System displays warning in Costs tab:
     - "⚠️ Cost information incomplete"
     - "Missing costs for [X] ingredients"
     - "Contact kitchen management"
  3. System shows partial cost data available
  4. User notes limitation and proceeds

#### E4: Permission Denied for Cost View
- **Trigger**: User lacks `recipe.cost.view` permission
- **Flow**:
  1. System checks user permissions
  2. System detects missing cost permission
  3. System hides Costs & Pricing tab
  4. System displays message in tab area:
     - "Cost information restricted"
     - "Contact administrator for access"
  5. User can view other recipe sections

### Business Rules Applied
- Draft recipes only visible to users with `recipe.viewDraft` permission
- Cost information only visible to users with `recipe.cost.view` permission
- Recipe history only available for published recipes
- Audit trail tracks recipe views (optional, for sensitive data)

### Performance Requirements
- Recipe detail load: < 1 second
- Tab switching: < 500ms
- Image loading: < 2 seconds per image (progressive)
- Print generation: < 3 seconds
- Export generation: < 5 seconds

### Acceptance Criteria
- [ ] Recipe header displays all key information
- [ ] Recipe image displays prominently
- [ ] Status badge correctly styled (draft/published)
- [ ] All tabs accessible and functional
- [ ] Ingredient list displays with costs (if permitted)
- [ ] Preparation steps display in order with images
- [ ] Cost breakdown displays accurately (if permitted)
- [ ] Yield variants displayed with pricing
- [ ] Recipe history shows version timeline
- [ ] "Edit" button visible to authorized users
- [ ] "Print" generates formatted recipe card
- [ ] "Export" downloads file in selected format
- [ ] Missing images handled with placeholders
- [ ] Permission restrictions enforced correctly
- [ ] All sections load within performance requirements

---

## UC-REC-012: Clone Recipe

### Description
Users can create a copy of an existing recipe to use as a template for creating similar recipes, saving time by avoiding re-entry of common information.

### Actor(s)
- Primary: Chef, Kitchen Manager
- Secondary: Admin

### Priority
Medium

### Frequency
Several times per week

### Preconditions
1. User is authenticated
2. User has `recipe.create` permission
3. Source recipe exists in system

### Postconditions
1. New recipe created with cloned data
2. Recipe name modified to indicate copy
3. Recipe status set to "draft"
4. New unique ID assigned
5. User owns new recipe (creator)
6. Ingredients and steps copied

### Main Flow
1. User views recipe detail or list
2. User clicks "Clone Recipe" button
3. System displays confirmation dialog:
   - "Clone Recipe: [Recipe Name]?"
   - "This will create a copy for editing"
   - Options: "Clone", "Cancel"
4. User clicks "Clone"
5. System creates new recipe record with:
   - All data copied from source
   - Recipe name: "[Original Name] (Copy)"
   - Status: "draft"
   - New unique ID generated
   - Creator: Current user
   - Created date: Current timestamp
6. System opens cloned recipe in edit mode
7. System highlights name field for modification
8. User modifies recipe as needed:
   - Change name (required to publish)
   - Adjust ingredients
   - Modify steps
   - Update costs/pricing
9. User saves cloned recipe
10. System displays success message: "Recipe cloned successfully"
11. User continues editing or publishes

### Alternative Flows

#### A1: Clone and Immediately Modify
- **Trigger**: User clones recipe for variation (e.g., spicy version)
- **Flow**:
  1. User clones "Thai Green Curry"
  2. System creates "Thai Green Curry (Copy)"
  3. User immediately changes name to "Thai Green Curry - Spicy"
  4. User adds chili peppers to ingredients
  5. User updates preparation steps for extra spice
  6. User adjusts pricing (slightly higher)
  7. User saves new variation
  8. System creates new recipe successfully

#### A2: Clone from Different Category
- **Trigger**: User clones recipe to create similar dish in different category
- **Flow**:
  1. User clones "Beef Bourguignon" (Main Course)
  2. System creates copy
  3. User changes:
     - Name: "Beef Bourguignon Pie"
     - Category: Main Course → Appetizer (portion style)
     - Yield: 6 portions → 12 portions (smaller size)
     - Ingredients: Add pie crust, adjust quantities
     - Steps: Add pie assembly steps
  4. User saves as new appetizer recipe

#### A3: Clone Multiple Times for Menu Variations
- **Trigger**: User needs to create multiple size variations
- **Flow**:
  1. User clones "Signature Burger"
  2. Creates "Signature Burger - Double" (2x patties)
  3. User clones again
  4. Creates "Signature Burger - Junior" (1/2 size)
  5. Each variation has:
     - Adjusted ingredient quantities
     - Modified yield
     - Different pricing
     - Same preparation method
  6. All variations saved as separate recipes

### Exception Flows

#### E1: Clone Published Recipe with Dependencies
- **Trigger**: Cloned recipe has sub-recipes or complex dependencies
- **Flow**:
  1. System clones recipe data
  2. System detects sub-recipe ingredients
  3. System displays info dialog:
     - "This recipe uses sub-recipes:"
     - [List of sub-recipes]
     - "Sub-recipes will be linked, not copied"
     - "Changes to sub-recipes affect both recipes"
  4. User acknowledges
  5. System creates clone with linked sub-recipes
  6. User can replace sub-recipes if needed

#### E2: Source Recipe Has Missing Data
- **Trigger**: Source recipe incomplete (draft, missing costs)
- **Flow**:
  1. System clones available data
  2. System detects missing fields:
     - No cost data
     - No preparation steps
     - No image
  3. System displays warning:
     - "⚠️ Source recipe incomplete"
     - "Missing: [list]"
     - "You'll need to complete these in the copy"
  4. User acknowledges
  5. System creates clone with gaps
  6. User completes missing information

#### E3: Insufficient Permissions
- **Trigger**: User tries to clone but lacks create permission
- **Flow**:
  1. System checks user permissions
  2. System detects missing `recipe.create` permission
  3. System displays error:
     - "Permission Denied"
     - "You don't have permission to create recipes"
     - "Contact administrator for access"
  4. Clone operation blocked
  5. User can only view original recipe

### Business Rules Applied
- BR-REC-001: Cloned recipe name must be unique (appends " (Copy)")
- BR-REC-009: Cloned recipe starts as draft
- New creator/owner assigned (current user)
- All ingredient relationships preserved
- Sub-recipes linked, not duplicated
- Audit trail records clone action

### Performance Requirements
- Clone operation: < 2 seconds
- Recipe load in edit mode: < 1 second
- Save cloned recipe: < 2 seconds

### Acceptance Criteria
- [ ] "Clone Recipe" button visible to authorized users
- [ ] Confirmation dialog explains clone action
- [ ] All recipe data copied correctly
- [ ] Recipe name appends " (Copy)" automatically
- [ ] Status set to "draft"
- [ ] New unique ID assigned
- [ ] Creator set to current user
- [ ] Cloned recipe opens in edit mode
- [ ] Name field highlighted for modification
- [ ] Ingredients and steps copied accurately
- [ ] Sub-recipes linked (not duplicated)
- [ ] Cost calculations preserved
- [ ] Images referenced correctly
- [ ] Save succeeds without errors
- [ ] Success message displayed
- [ ] User redirected to cloned recipe edit view

---

## UC-REC-013: Delete Recipe

### Description
Users can delete recipes that are no longer needed, with safety checks to prevent deletion of recipes in active use.

### Actor(s)
- Primary: Kitchen Manager, Admin
- Secondary: None (restricted operation)

### Priority
Medium

### Frequency
Occasionally (few times per month)

### Preconditions
1. User is authenticated
2. User has `recipe.delete` permission
3. Recipe exists in system

### Postconditions
1. Recipe marked as deleted (soft delete)
2. Recipe removed from active lists
3. Recipe no longer available for new use
4. Historical data preserved for reporting
5. Audit trail records deletion

### Main Flow
1. User selects recipe to delete from list or detail view
2. User clicks "Delete" button
3. System performs safety checks:
   - Check if used in active menus
   - Check if used in production orders
   - Check if in active POS sales
   - Check if used as sub-recipe in other recipes
4. All safety checks pass (recipe not in use)
5. System displays confirmation dialog:
   - "Delete Recipe: [Recipe Name]?"
   - "This action cannot be undone"
   - Warning about impact
   - Options: "Delete", "Cancel"
6. User clicks "Delete"
7. System performs soft delete:
   - Sets deleted flag = true
   - Records deletion timestamp
   - Records deleting user
   - Preserves all data for audit
8. System removes recipe from active lists
9. System displays success message: "Recipe deleted successfully"
10. System redirects to recipe list

### Alternative Flows

#### A1: Delete Draft Recipe
- **Trigger**: User deletes draft recipe (not published)
- **Flow**:
  1. User clicks delete on draft recipe
  2. System checks usage (none for drafts)
  3. System displays simpler confirmation:
     - "Delete draft recipe?"
     - Less severe warning (not published)
  4. User confirms
  5. System deletes immediately (can be hard delete for drafts)
  6. System displays success message
  7. Recipe removed from list

#### A2: Archive Instead of Delete
- **Trigger**: User wants to hide recipe but preserve for history
- **Flow**:
  1. User clicks "Archive" instead of "Delete"
  2. System displays confirmation:
     - "Archive Recipe: [Name]?"
     - "Recipe will be hidden but preserved"
     - "Can be restored later if needed"
  3. User confirms
  4. System sets status = "archived"
  5. System removes from active lists
  6. System keeps in special "Archived" list
  7. Admins can restore archived recipes if needed

#### A3: Bulk Delete Multiple Recipes
- **Trigger**: User selects multiple recipes for deletion
- **Flow**:
  1. User selects multiple recipes (checkboxes)
  2. User clicks bulk "Delete" button
  3. System checks each recipe:
     - Identify recipes safe to delete
     - Identify recipes in use (blocked)
  4. System displays summary:
     - "Safe to delete: [X] recipes"
     - "Cannot delete (in use): [Y] recipes"
     - List blocked recipes with reasons
  5. User reviews summary
  6. User decides:
     - "Delete safe recipes only"
     - "Cancel entire operation"
  7. If confirmed:
     - System deletes safe recipes
     - System displays: "[X] deleted, [Y] skipped"
  8. Blocked recipes remain, user can address individually

### Exception Flows

#### E1: Recipe Used in Active Menus
- **Trigger**: Recipe is part of active menu items
- **Flow**:
  1. System checks menu usage
  2. System detects active menu items:
     - "Summer Menu - Grilled Salmon"
     - "Lunch Special - Salmon Salad"
  3. System blocks deletion
  4. System displays error:
     - "Cannot delete - Recipe in active use"
     - "Used in menu items:"
     - [List of menu items with links]
     - "Remove from menus first or mark as unavailable"
  5. User must:
     - Remove recipe from menus
     - OR mark menu items inactive
     - Then retry deletion

#### E2: Recipe Used as Sub-Recipe
- **Trigger**: Recipe is ingredient in other recipes
- **Flow**:
  1. System checks recipe dependencies
  2. System detects parent recipes:
     - "Thai Green Curry" uses "Green Curry Paste"
     - "Pad Thai" uses "Green Curry Paste"
  3. System blocks deletion
  4. System displays error:
     - "Cannot delete - Used as ingredient in other recipes"
     - "Parent recipes:"
     - [List with links]
     - "Remove from parent recipes first or replace with alternative"
  5. User must update parent recipes first

#### E3: Recent POS Sales
- **Trigger**: Recipe has sales in recent period (configurable, e.g., last 30 days)
- **Flow**:
  1. System checks POS sales history
  2. System detects recent sales:
     - Last sale: [date]
     - Sales in last 30 days: [count]
  3. System displays warning:
     - "⚠️ Recent sales detected"
     - "Last sold: [X] days ago"
     - "Total sales last 30 days: [count]"
     - "Consider archiving instead of deleting"
     - Options: "Archive", "Delete Anyway", "Cancel"
  4. User decides:
     - **Archive**: Preserve with sales history
     - **Delete Anyway**: Confirm deletion (requires reason)
     - **Cancel**: Return without action

#### E4: Active Production Orders
- **Trigger**: Recipe in current/upcoming production orders
- **Flow**:
  1. System checks production schedule
  2. System detects active orders:
     - Production Order #1234 (Today)
     - Production Order #1245 (Tomorrow)
  3. System blocks deletion
  4. System displays error:
     - "Cannot delete - Active production orders"
     - "Production orders:"
     - [List with dates and quantities]
     - "Complete or cancel orders first"
  5. User must wait for orders to complete or cancel them

#### E5: Insufficient Permissions
- **Trigger**: User lacks delete permission
- **Flow**:
  1. System checks user permissions
  2. System detects missing `recipe.delete` permission
  3. System hides or disables "Delete" button
  4. If user attempts via URL/API:
     - System returns 403 Forbidden
     - System displays: "Permission denied"

### Business Rules Applied
- Deletion blocked if recipe in active use (menus, production, sales)
- Soft delete preserves data for audit and reporting
- Draft recipes can be hard deleted
- Deletion requires explicit user confirmation
- Audit trail records deletion with timestamp and user
- Deleted recipes hidden from active lists but preserved in database

### Performance Requirements
- Safety checks: < 1 second
- Soft delete operation: < 1 second
- Bulk delete: < 5 seconds for 100 recipes
- Audit log update: < 500ms

### Acceptance Criteria
- [ ] "Delete" button visible to authorized users only
- [ ] Safety checks performed before deletion
- [ ] Active usage blocks deletion with clear message
- [ ] Confirmation dialog displayed with warnings
- [ ] User can cancel deletion at any time
- [ ] Soft delete preserves all data
- [ ] Deleted flag and timestamp recorded
- [ ] Deleting user recorded in audit trail
- [ ] Recipe removed from active lists
- [ ] Success message displayed after deletion
- [ ] User redirected appropriately
- [ ] Bulk deletion handles mixed scenarios
- [ ] Recent sales generate warning
- [ ] Archive option available as alternative

---

## UC-REC-014: Bulk Recipe Operations

### Description
Users can select multiple recipes and perform batch operations including activate (publish), deactivate (unpublish), export, and delete.

### Actor(s)
- Primary: Kitchen Manager, Admin
- Secondary: None

### Priority
Medium

### Frequency
Few times per week

### Preconditions
1. User is authenticated
2. User has relevant permissions for desired operation
3. Multiple recipes exist in system

### Postconditions
1. Selected recipes modified according to operation
2. Operation results displayed (success/failed counts)
3. Audit trail records bulk operation
4. Affected systems notified (POS, Production)

### Main Flow
1. User views recipe list (grid or list view)
2. User selects multiple recipes via checkboxes
3. System displays selection count in status bar
4. System shows bulk action toolbar with options:
   - Activate (publish)
   - Deactivate (unpublish)
   - Export
   - Delete
5. User clicks desired bulk action
6. System validates operation on all selected recipes
7. System categorizes recipes:
   - Can be processed
   - Cannot be processed (with reasons)
8. System displays operation summary dialog
9. User reviews and confirms
10. System processes all eligible recipes
11. System displays results:
    - Successful: [X] recipes
    - Failed: [Y] recipes (with reasons)
12. System clears selection
13. System refreshes recipe list

### Alternative Flows

#### A1: Bulk Activate (Publish)
- **Trigger**: User selects "Activate" for multiple draft recipes
- **Flow**:
  1. User selects draft recipes (5 selected)
  2. User clicks "Activate" in bulk toolbar
  3. System validates each recipe for publish requirements
  4. System categorizes results:
     - **Ready**: 3 recipes (all requirements met)
     - **Not Ready**: 2 recipes (missing fields)
  5. System displays dialog:
     - "Bulk Activate - 5 recipes selected"
     - "Ready to publish: 3"
     - "Cannot publish: 2"
     - [Expandable list showing issues per recipe]
     - Options: "Publish ready recipes", "Cancel"
  6. User clicks "Publish ready recipes"
  7. System publishes 3 recipes successfully
  8. System displays:
     - "✓ 3 recipes published"
     - "✗ 2 recipes skipped (not ready)"
  9. User reviews results
  10. Unpublished recipes remain selected for user to fix

#### A2: Bulk Deactivate (Unpublish)
- **Trigger**: User selects "Deactivate" for multiple published recipes
- **Flow**:
  1. User selects published recipes (4 selected)
  2. User clicks "Deactivate" in bulk toolbar
  3. System checks each recipe for active usage:
     - Recipe A: In 2 active menus (blocked)
     - Recipe B: Not in use (can deactivate)
     - Recipe C: In 1 menu (blocked)
     - Recipe D: Not in use (can deactivate)
  4. System displays dialog:
     - "Bulk Deactivate - 4 recipes selected"
     - "Can deactivate: 2 recipes"
     - "Cannot deactivate: 2 recipes (in active menus)"
     - [List showing which recipes and why]
     - Options: "Deactivate available", "Cancel"
  5. User confirms
  6. System unpublishes 2 eligible recipes
  7. System displays:
     - "✓ 2 recipes deactivated"
     - "✗ 2 recipes skipped (in use)"

#### A3: Bulk Export
- **Trigger**: User exports multiple recipes
- **Flow**:
  1. User selects recipes (10 selected)
  2. User clicks "Export" in bulk toolbar
  3. System displays export options dialog:
     - Format: PDF, CSV, JSON
     - Include images: Yes/No
     - Include costs: Yes/No
     - Package: Single file or ZIP
  4. User selects preferences:
     - Format: PDF
     - Include images: Yes
     - Include costs: Yes (if permitted)
     - Package: ZIP (for multiple PDFs)
  5. User clicks "Export"
  6. System generates PDF for each recipe
  7. System packages all PDFs into ZIP archive
  8. System includes manifest.json with recipe list
  9. System triggers download
  10. User saves ZIP file locally
  11. System displays: "✓ 10 recipes exported"

#### A4: Bulk Delete
- **Trigger**: User deletes multiple recipes
- **Flow**:
  1. User selects recipes (6 selected)
  2. User clicks "Delete" in bulk toolbar
  3. System performs safety checks on each:
     - Recipe A: Draft, not in use (can delete)
     - Recipe B: Published, in 1 menu (blocked)
     - Recipe C: Draft, not in use (can delete)
     - Recipe D: Published, has recent sales (warning)
     - Recipe E: Draft, not in use (can delete)
     - Recipe F: Published, used as sub-recipe (blocked)
  4. System displays detailed dialog:
     - "Bulk Delete - 6 recipes selected"
     - "✓ Safe to delete: 3 recipes"
     - "⚠️ Warning (recent sales): 1 recipe"
     - "✗ Cannot delete (in use): 2 recipes"
     - [Expandable sections showing details]
     - Options: "Delete safe only", "Delete safe + warned", "Cancel"
  5. User selects "Delete safe only"
  6. System deletes 3 recipes
  7. System displays:
     - "✓ 3 recipes deleted"
     - "⚠️ 1 recipe skipped (recent sales)"
     - "✗ 2 recipes skipped (in use)"
  8. Blocked recipes remain selected for review

### Exception Flows

#### E1: No Recipes Selected
- **Trigger**: User clicks bulk action without selection
- **Flow**:
  1. System detects empty selection
  2. System displays message: "Please select at least one recipe"
  3. Bulk action toolbar remains visible but disabled
  4. User selects recipes to enable actions

#### E2: Mixed Selection (Draft + Published)
- **Trigger**: User selects both draft and published recipes for activation
- **Flow**:
  1. System detects mixed status
  2. System filters selection:
     - Draft recipes: Can activate
     - Published recipes: Already active (skip)
  3. System displays info:
     - "Some selected recipes already published"
     - "Will process [X] draft recipes"
  4. User confirms
  5. System processes draft recipes only

#### E3: Insufficient Permissions for Some Operations
- **Trigger**: User lacks permission for selected operation
- **Flow**:
  1. System checks user permissions
  2. System detects missing permission (e.g., `recipe.delete`)
  3. System disables "Delete" button in bulk toolbar
  4. System displays tooltip: "You don't have permission to delete recipes"
  5. Other permitted actions remain enabled

#### E4: Partial Failure During Bulk Operation
- **Trigger**: Some recipes succeed, others fail due to system errors
- **Flow**:
  1. System processes recipes sequentially
  2. Recipe 1-3: Success
  3. Recipe 4: Database error (connection timeout)
  4. System logs error
  5. Recipe 5-6: Success
  6. System displays results:
     - "✓ 5 recipes processed successfully"
     - "✗ 1 recipe failed (system error)"
     - "See error log for details"
  7. User can retry failed recipe individually

### Business Rules Applied
- Minimum 2 recipes required for bulk operations
- Each recipe validated individually
- Operations applied only to eligible recipes
- Audit trail records bulk action with recipe list
- Failed operations don't affect successful ones
- Users see clear results for each action

### Performance Requirements
- Selection: < 500ms for 100 recipes
- Validation: < 2 seconds for 50 recipes
- Bulk publish: < 5 seconds for 20 recipes
- Bulk export: < 10 seconds for 20 recipes (without images)
- Bulk delete: < 3 seconds for 20 recipes
- Result display: < 1 second

### Acceptance Criteria
- [ ] Checkbox selection works in grid and list view
- [ ] Selection count displayed in status bar
- [ ] Bulk action toolbar appears when ≥2 recipes selected
- [ ] All bulk actions available (activate, deactivate, export, delete)
- [ ] Validation categorizes recipes correctly
- [ ] Operation summary dialog shows counts and details
- [ ] User can review issues before confirming
- [ ] Eligible recipes processed successfully
- [ ] Ineligible recipes skipped with clear reasons
- [ ] Results displayed with success/failed counts
- [ ] Selection cleared after operation
- [ ] Recipe list refreshed to show changes
- [ ] Audit trail records bulk operation
- [ ] Performance meets requirements for all operations

---

## UC-REC-015: Import Recipes

### Description
Users can import multiple recipes from CSV file to batch-create recipes, streamlining migration from legacy systems or bulk recipe entry.

### Actor(s)
- Primary: Kitchen Manager, Admin
- Secondary: None

### Priority
Medium

### Frequency
Occasionally (during migration or bulk updates)

### Preconditions
1. User is authenticated
2. User has `recipe.create` permission
3. CSV file prepared according to template
4. Required reference data exists (categories, cuisines)

### Postconditions
1. Valid recipes created in system
2. Invalid rows reported with errors
3. Import summary displayed
4. Audit trail records import operation
5. Created recipes available in draft status

### Main Flow
1. User navigates to recipe list page
2. User clicks "Import" button
3. System displays import dialog
4. System offers "Download CSV Template" link
5. User downloads template (optional, if first time)
6. User selects prepared CSV file
7. System uploads file
8. System validates file format
9. System parses CSV and validates each row:
   - Required fields present
   - Data types correct
   - References valid (category, cuisine)
   - Business rules satisfied
10. System displays validation summary:
    - Total rows: [X]
    - Valid rows: [Y]
    - Invalid rows: [Z]
    - [Expandable error list]
11. User reviews validation results
12. User decides:
    - "Import valid rows" (skip invalid)
    - "Cancel and fix CSV"
13. If "Import valid rows":
    - System creates recipes for valid rows
    - System generates unique IDs
    - System sets status = "draft"
    - System sets creator = current user
14. System displays import results:
    - "✓ [Y] recipes imported successfully"
    - "✗ [Z] rows skipped due to errors"
    - Download error report (CSV with error details)
15. System redirects to recipe list with newly imported recipes highlighted

### Alternative Flows

#### A1: Download CSV Template
- **Trigger**: User clicks "Download Template"
- **Flow**:
  1. System generates CSV template with:
     - Header row with all field names
     - Example row with sample data
     - Comment row explaining each field
  2. Template includes columns:
     - name, description, category, cuisine, status
     - yield, yield_unit, unit_of_sale
     - prep_time, cook_time, difficulty
     - target_food_cost, labor_cost_percentage, overhead_percentage
     - selling_price
     - deduct_from_stock
     - allergens (comma-separated)
     - tags (comma-separated)
  3. System triggers CSV file download
  4. User opens in spreadsheet software (Excel, Google Sheets)
  5. User fills in recipe data
  6. User saves as CSV

#### A2: Validate Before Import (Dry Run)
- **Trigger**: User wants to check CSV without importing
- **Flow**:
  1. User uploads CSV file
  2. User checks "Validate only (don't import)" option
  3. System performs full validation
  4. System displays validation results
  5. System highlights errors per row
  6. System generates error report CSV
  7. User downloads error report
  8. User fixes issues in original CSV
  9. User re-uploads corrected CSV
  10. User performs actual import

#### A3: Import with Ingredients and Steps
- **Trigger**: CSV includes ingredient and step data (advanced)
- **Flow**:
  1. User prepares multi-sheet CSV or JSON format
  2. Main sheet: Recipe info
  3. Ingredients sheet: Recipe ID, ingredient details
  4. Steps sheet: Recipe ID, step details
  5. System imports recipes first
  6. System links ingredients to recipes
  7. System links steps to recipes
  8. System validates relationships
  9. All valid data imported as complete recipes

#### A4: Update Existing Recipes via Import
- **Trigger**: User wants to bulk-update recipes (not create)
- **Flow**:
  1. User prepares CSV with recipe IDs
  2. CSV includes ID column for existing recipes
  3. User uploads CSV
  4. System detects IDs and treats as updates
  5. System validates:
     - IDs exist in system
     - User has edit permission
  6. System displays update summary:
     - "Update mode: [X] recipes will be updated"
  7. User confirms
  8. System updates existing recipes
  9. System creates version history for published recipes

### Exception Flows

#### E1: Invalid CSV Format
- **Trigger**: Uploaded file is not valid CSV
- **Flow**:
  1. System attempts to parse file
  2. System detects invalid format (e.g., .xlsx, .txt, corrupted)
  3. System displays error:
     - "Invalid file format"
     - "Please upload a valid CSV file"
     - "Supported format: .csv"
  4. User corrects file format
  5. User re-uploads

#### E2: Missing Required Columns
- **Trigger**: CSV missing required header columns
- **Flow**:
  1. System parses CSV header
  2. System detects missing columns:
     - Example: Missing "category", "cuisine"
  3. System displays error:
     - "Missing required columns"
     - "Required: [list of missing columns]"
     - "Download template for correct format"
  4. User adds missing columns
  5. User re-uploads

#### E3: Duplicate Recipe Names in CSV
- **Trigger**: CSV contains duplicate recipe names
- **Flow**:
  1. System validates each row
  2. System detects duplicates within CSV:
     - Row 5: "Margherita Pizza"
     - Row 12: "Margherita Pizza"
  3. System marks both rows as invalid
  4. System displays error:
     - "Duplicate recipe names in CSV"
     - Rows: 5, 12 - "Margherita Pizza"
  5. User resolves duplicates (rename one)
  6. User re-uploads

#### E4: Invalid References (Category/Cuisine)
- **Trigger**: CSV references non-existent categories or cuisines
- **Flow**:
  1. System validates references
  2. System detects invalid references:
     - Row 3: Category "FastFood" not found
     - Row 7: Cuisine "Fusion" not found
  3. System marks rows as invalid
  4. System displays error with details
  5. System suggests:
     - Create missing categories/cuisines first
     - OR use valid references from system
  6. User corrects CSV or creates references
  7. User re-imports

#### E5: Data Type Errors
- **Trigger**: CSV contains invalid data types
- **Flow**:
  1. System validates data types
  2. System detects errors:
     - Row 4: prep_time = "quick" (expected: number)
     - Row 8: selling_price = "10 dollars" (expected: number)
  3. System marks rows as invalid
  4. System displays detailed errors
  5. User corrects data types in CSV
  6. User re-uploads

#### E6: Business Rule Violations
- **Trigger**: Data violates business rules
- **Flow**:
  1. System validates business rules
  2. System detects violations:
     - Row 6: target_food_cost = 60% (max: 50%)
     - Row 9: labor_cost_percentage + overhead_percentage = 110% (max: 100%)
  3. System marks rows as invalid
  4. System explains violations
  5. User corrects values
  6. User re-uploads

### Business Rules Applied
- BR-REC-001: Recipe name uniqueness
- BR-REC-002: Required fields validation
- All business rules from BR-REC section apply
- Import validation matches manual entry validation
- Invalid rows skipped, not rolled back (partial import allowed)

### Performance Requirements
- File upload: < 5 seconds for 1MB file
- Validation: < 10 seconds for 100 recipes
- Import: < 30 seconds for 100 recipes
- Error report generation: < 5 seconds

### Acceptance Criteria
- [ ] "Import" button visible to authorized users
- [ ] Import dialog displays with instructions
- [ ] "Download Template" provides correct CSV format
- [ ] File upload accepts .csv files only
- [ ] Validation checks all required fields
- [ ] Invalid file format rejected with clear message
- [ ] Missing columns detected and reported
- [ ] Data types validated correctly
- [ ] References (category, cuisine) validated
- [ ] Business rules enforced on each row
- [ ] Duplicate names detected within CSV
- [ ] Validation summary displayed with counts
- [ ] Error report downloadable as CSV
- [ ] Invalid rows listed with specific errors
- [ ] "Import valid rows" proceeds with eligible recipes
- [ ] Valid recipes created successfully
- [ ] Import results displayed with success/failed counts
- [ ] Imported recipes appear in draft status
- [ ] Audit trail records import operation with file name

---

## UC-REC-016: Export Recipes

### Description
Users can export recipe data in various formats (PDF, CSV, JSON) for reporting, backup, integration, or printing purposes.

### Actor(s)
- Primary: Chef, Kitchen Manager, Admin
- Secondary: Finance Manager, Production Staff

### Priority
Medium

### Frequency
Several times per week

### Preconditions
1. User is authenticated
2. User has `recipe.view` and `recipe.export` permissions
3. At least one recipe exists in system

### Postconditions
1. Export file generated successfully
2. File downloaded to user's device
3. Export operation logged in audit trail
4. Data exported matches current system state

### Main Flow
1. User selects recipes to export (single or multiple)
2. User clicks "Export" button
3. System displays export options dialog:
   - **Format**: PDF, CSV, JSON, ZIP
   - **Content**: Basic info, Full details, With images
   - **Filters**: Current filters, All recipes, Selected only
4. User selects export preferences
5. User clicks "Export"
6. System generates export file(s)
7. System applies formatting based on selected format
8. System includes selected data fields
9. System packages media assets if requested
10. System triggers file download
11. System displays success message: "Export completed: [filename]"
12. User saves file locally

### Alternative Flows

#### A1: Export Single Recipe to PDF
- **Trigger**: User exports recipe as printable PDF
- **Flow**:
  1. User views recipe detail
  2. User clicks "Export" → "PDF"
  3. System generates print-optimized PDF with:
     - Recipe name and image (full page header)
     - Ingredients table (with costs if permitted)
     - Preparation steps (numbered, with images)
     - Cost and pricing summary
     - Allergen warnings (highlighted)
     - QR code linking to digital version
     - Footer with: Created by, date, version
  4. System applies professional styling
  5. System triggers PDF download
  6. Filename: [Recipe-Name]-[Date].pdf
  7. User saves or prints PDF

#### A2: Export Multiple Recipes to CSV
- **Trigger**: User exports recipes for analysis in Excel
- **Flow**:
  1. User selects recipes or applies filters
  2. User clicks "Export" → "CSV"
  3. System displays field selection:
     - [ ] Basic info (name, category, cuisine)
     - [ ] Yield information
     - [ ] Time information
     - [ ] Cost data (if permitted)
     - [ ] Pricing data (if permitted)
     - [ ] Ingredients (summary or detailed)
     - [ ] Allergens and tags
  4. User selects desired fields
  5. User clicks "Generate CSV"
  6. System creates CSV with:
     - Header row with field names
     - Data rows for each recipe
     - Formatted numbers (costs with currency)
     - Comma-separated lists (allergens, tags)
  7. System triggers CSV download
  8. Filename: Recipes-Export-[Date].csv

#### A3: Export Recipe Collection as ZIP
- **Trigger**: User exports multiple recipes with all assets
- **Flow**:
  1. User selects multiple recipes (10 recipes)
  2. User clicks "Export" → "Complete Package"
  3. System displays package options:
     - Include PDF recipe cards: Yes
     - Include JSON data: Yes
     - Include all images: Yes
     - Include ingredient list: Yes
  4. User confirms selections
  5. System generates ZIP archive containing:
     - /recipes/
       - recipe-001.json (full data)
       - recipe-002.json
       - ...
     - /recipe-cards/
       - recipe-001.pdf (printable card)
       - recipe-002.pdf
       - ...
     - /images/
       - recipe-001/
         - main.jpg
         - step-001.jpg
         - step-002.jpg
       - recipe-002/
         - ...
     - manifest.json (package contents index)
     - README.txt (package description)
  6. System compresses all files
  7. System triggers ZIP download
  8. Filename: Recipe-Collection-[Date].zip

#### A4: Export to JSON for Integration
- **Trigger**: User exports recipes for system integration
- **Flow**:
  1. User clicks "Export" → "JSON"
  2. System displays options:
     - Format: Single file or Multiple files
     - Include: Ingredients, Steps, Cost data
     - Schema: Standard or Custom mapping
  3. User selects: Multiple files, All data, Standard schema
  4. System generates JSON files:
     ```json
     {
       "id": "margherita-pizza",
       "name": "Margherita Pizza",
       "category": "main-course",
       "ingredients": [...],
       "steps": [...],
       "cost": {...},
       "pricing": {...}
     }
     ```
  5. System validates JSON structure
  6. System packages files (ZIP if multiple)
  7. System triggers download

#### A5: Export Filtered Recipe List
- **Trigger**: User exports recipes matching specific criteria
- **Flow**:
  1. User applies filters:
     - Category: Dessert
     - Cuisine: Italian
     - Status: Published
  2. System filters list (15 recipes match)
  3. User clicks "Export" → "CSV"
  4. System includes only filtered recipes
  5. System displays confirmation:
     - "Export 15 filtered recipes?"
     - "Current filters: Category=Dessert, Cuisine=Italian, Status=Published"
  6. User confirms
  7. System generates CSV with filtered data
  8. Filename includes filter info: Desserts-Italian-Published-[Date].csv

### Exception Flows

#### E1: Export with Missing Cost Permission
- **Trigger**: User lacks `recipe.cost.view` permission
- **Flow**:
  1. User attempts to export with cost data
  2. System detects missing permission
  3. System displays warning:
     - "You don't have permission to view cost data"
     - "Cost fields will be excluded from export"
  4. User can:
     - Continue without cost data
     - Cancel export
  5. If continue:
     - System exports without cost/pricing fields
     - Cost columns show "N/A" or omitted

#### E2: Large Export Timeout
- **Trigger**: Export of many recipes with images takes too long
- **Flow**:
  1. User selects 500 recipes with images
  2. User clicks "Export" → "Complete Package"
  3. System estimates export size and time:
     - Estimated size: 2.5 GB
     - Estimated time: 5-10 minutes
  4. System displays warning:
     - "Large export detected"
     - "This may take several minutes"
     - "Process in background?"
  5. User selects "Background processing"
  6. System queues export job
  7. System displays: "Export queued. You'll receive email when ready."
  8. User can continue working
  9. When complete, system:
     - Sends email with download link
     - Notifies user in app
     - Link valid for 48 hours

#### E3: Export Generation Failure
- **Trigger**: System error during export generation
- **Flow**:
  1. User initiates export
  2. System begins generation
  3. Error occurs (disk space, memory, corruption)
  4. System catches error
  5. System displays error message:
     - "Export failed"
     - "Error details: [technical message]"
     - "Please try again or contact support"
  6. System logs error for debugging
  7. User can retry or cancel

#### E4: No Recipes Match Export Criteria
- **Trigger**: User attempts to export but no recipes match filters
- **Flow**:
  1. User applies very restrictive filters
  2. User clicks "Export"
  3. System detects zero recipes matching
  4. System displays message:
     - "No recipes to export"
     - "Current filters return 0 results"
     - "Adjust filters or clear to export all"
  5. User adjusts filters or cancels

### Business Rules Applied
- Export only includes recipes user has permission to view
- Cost data only exported if user has `recipe.cost.view` permission
- Draft recipes only exported if user has `recipe.viewDraft` permission
- Export file naming follows convention: [Type]-[Filter]-[Date].[ext]
- Media assets only included if explicitly requested (bandwidth consideration)

### Performance Requirements
- PDF generation (single): < 3 seconds
- CSV generation (100 recipes): < 5 seconds
- JSON generation (100 recipes): < 5 seconds
- ZIP packaging (with images): < 30 seconds for 50 recipes
- Large exports (>100 recipes with images): Background job

### Acceptance Criteria
- [ ] "Export" button visible to authorized users
- [ ] Export options dialog displays all format choices
- [ ] PDF export generates print-optimized layout
- [ ] PDF includes all requested sections
- [ ] CSV export creates properly formatted file
- [ ] CSV includes selected fields only
- [ ] JSON export follows valid schema
- [ ] JSON validates against schema
- [ ] ZIP archive contains all files
- [ ] ZIP includes manifest and README
- [ ] Filtered exports include only matching recipes
- [ ] Permission restrictions enforced (cost data, drafts)
- [ ] Large exports processed in background
- [ ] Email notification sent when background export ready
- [ ] Download link valid and working
- [ ] Filenames follow naming convention
- [ ] Success message displayed
- [ ] Audit trail records export operation
- [ ] All formats meet performance requirements

---
