# Use Cases: Recipe Categories

**Module**: Operational Planning > Recipe Management > Categories
**Version**: 2.0.0
**Last Updated**: 2025-01-16
**Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 2.0.0 | 2025-01-16 | Development Team | Aligned with actual implementation: added kitchen workflow and food safety fields |
---

## Use Case Index

| ID | Use Case Name | Actor | Priority | Frequency |
|----|---------------|-------|----------|-----------|
| UC-CAT-001 | View Recipe Categories List | Kitchen Manager, Head Chef, Sous Chef | High | Daily |
| UC-CAT-002 | Search Recipe Categories | Kitchen Manager, Head Chef, Sous Chef | High | Daily |
| UC-CAT-003 | Filter Categories with Advanced Filters | Kitchen Manager, Head Chef | Medium | Weekly |
| UC-CAT-004 | Create New Recipe Category | Head Chef, Kitchen Manager | High | Weekly |
| UC-CAT-005 | Edit Recipe Category | Head Chef, Kitchen Manager | High | Weekly |
| UC-CAT-006 | View Category Details | Kitchen Manager, Sous Chef | Medium | Daily |
| UC-CAT-007 | Delete Recipe Category | Head Chef | Low | Monthly |
| UC-CAT-008 | Expand/Collapse Category Hierarchy | Kitchen Manager, Head Chef, Sous Chef | High | Daily |
| UC-CAT-009 | Bulk Select Categories | Kitchen Manager | Medium | Weekly |
| UC-CAT-010 | Export Categories | Head Chef, Kitchen Manager | Low | Monthly |

---

## UC-CAT-001: View Recipe Categories List

### Description
Kitchen staff views the complete list of recipe categories in a hierarchical table to understand the category structure and review category performance metrics.

### Actor
- Primary: Kitchen Manager, Head Chef, Sous Chef
- Secondary: Production Staff (view-only)

### Priority
High

### Frequency
Daily (20-50 times per day)

### Preconditions
- User is authenticated and has permission to view categories
- At least one category exists in the system
- User navigates to Recipe Categories page

### Postconditions
- **Success**: Categories displayed in hierarchical table with complete information
- **Failure**: Error message displayed if data cannot be loaded

### Main Flow

1. User navigates to Operational Planning > Recipe Management > Categories
2. System loads all categories from database
3. System calculates performance metrics (recipe counts, average cost, average margin)
4. System displays categories in hierarchical table:
   - Top-level categories (level 1) at root
   - Subcategories (level 2) nested under parents
   - Each row shows: checkbox, name, code, description, status, recipe counts, cost, margin, actions
5. System displays expand/collapse icons for parent categories
6. System shows total category count in header
7. System displays view mode toggle (List/Card)
8. User can:
   - Click expand/collapse icons to show/hide subcategories
   - Switch between list and card view modes
   - Select individual categories with checkboxes
   - Access actions menu for each category
   - Search or filter categories (see UC-CAT-002, UC-CAT-003)

### Alternative Flows

**A1: Card View Mode**
- At step 7, user clicks card view toggle
- System switches to card layout showing categories as cards
- Each card displays category image, name, code, recipe count, and quick stats
- User can switch back to list view at any time

**A2: Parent Category Collapsed by Default**
- At step 4, all parent categories render in collapsed state
- Subcategories hidden until user expands parent
- User clicks expand icon to reveal subcategories
- System remembers expanded state during session

**A3: Performance Badge Indicators**
- At step 4, system adds colored badges to categories based on performance:
  - Red badge: Average margin < minimum margin
  - Yellow badge: Average margin between minimum and target
  - Green badge: Average margin >= target margin
- User hovers badge to see detailed margin breakdown

### Exception Flows

**E1: No Categories Exist**
- At step 2, database returns empty result
- System displays empty state message: "No categories found. Create your first category to get started."
- System shows "Create Category" button prominently
- User can click button to create first category (see UC-CAT-004)

**E2: Database Connection Failure**
- At step 2, database connection fails
- System displays error message: "Unable to load categories. Please try again."
- System shows retry button
- User clicks retry to reload data
- System logs error for troubleshooting

**E3: Calculation Error for Metrics**
- At step 3, metric calculation fails for some categories
- System displays categories with "N/A" for failed metrics
- System shows warning icon with tooltip: "Metrics temporarily unavailable"
- System continues to display other category information
- Background process retries calculation

### Business Rules Applied
- BR-CAT-011: Status Change Impact
- BR-CAT-017: Performance Metric Calculation
- BR-CAT-003: Hierarchy Depth Limit

### Performance Requirements
- Categories load in <2 seconds for 500 records
- Hierarchy expansion/collapse responds in <100ms
- Metric calculations complete within 1 minute of recipe changes

### Acceptance Criteria
1. ✅ All active categories display in hierarchical structure
2. ✅ Parent categories show expand/collapse chevron icons
3. ✅ Subcategories display with 20px indentation per level
4. ✅ Category metrics (recipe counts, costs, margins) display accurately
5. ✅ Status badges render with appropriate colors (green for active, gray for inactive)
6. ✅ View mode toggle switches between list and card layouts
7. ✅ Last updated date displays in YYYY-MM-DD format
8. ✅ Empty state shows helpful message and create button
9. ✅ Error states display user-friendly error messages
10. ✅ Performance badges indicate margin status with colors

---

## UC-CAT-002: Search Recipe Categories

### Description
Kitchen staff searches for specific categories using keywords to quickly find and access category information without scrolling through the complete list.

### Actor
- Primary: Kitchen Manager, Head Chef, Sous Chef
- Secondary: Production Staff

### Priority
High

### Frequency
Daily (10-30 times per day)

### Preconditions
- User is viewing the categories list (UC-CAT-001)
- Categories exist in the system
- Search functionality is accessible

### Postconditions
- **Success**: Filtered list displays matching categories
- **Failure**: "No results" message displayed if no matches found

### Main Flow

1. User views recipe categories list
2. User clicks into search input field (displays placeholder "Search categories...")
3. User types search term (e.g., "appetizer", "APP", "cold")
4. System performs real-time search as user types:
   - Searches across name, code, and description fields
   - Case-insensitive matching
   - Partial matching (substring search)
5. System filters category list to show only matches
6. System displays result count: "Showing X of Y categories"
7. System highlights matching categories in list
8. System maintains hierarchy structure in results (shows parent if child matches)
9. User can:
   - Continue typing to refine search
   - Click clear button (X icon) to reset search
   - Select categories from filtered results
   - Perform actions on filtered categories

### Alternative Flows

**A1: Search with Hierarchy Preservation**
- At step 5, search matches a subcategory
- System automatically expands parent category
- System highlights matched subcategory
- Parent category remains visible for context
- Result count includes parent in total

**A2: Multi-term Search**
- At step 3, user types multiple words (e.g., "cold appetizer")
- System searches for categories containing both terms
- System returns results matching all terms (AND logic)
- User sees categories matching complete phrase

**A3: Quick Search Shortcuts**
- At step 2, user presses "/" keyboard shortcut
- System focuses search input immediately
- User types search term without clicking
- Search executes as normal

### Exception Flows

**E1: No Search Results**
- At step 5, no categories match search term
- System displays empty state: "No categories match '[search term]'"
- System shows suggestion: "Try different keywords or clear search"
- System displays clear search button prominently
- User clicks clear to reset and view all categories

**E2: Search Performance Issue**
- At step 4, search takes >500ms to execute
- System displays loading indicator in search field
- System debounces search input (waits 300ms after typing stops)
- System completes search and displays results
- User continues searching normally

**E3: Special Characters in Search**
- At step 3, user enters special characters (e.g., "&", "%")
- System sanitizes input to prevent injection
- System searches for literal characters
- System returns matching results or empty state
- Search executes safely without errors

### Business Rules Applied
- BR-CAT-011: Status Change Impact (inactive categories included in search with filter)

### Performance Requirements
- Search results return in <200ms
- Real-time filtering with <100ms debounce delay
- Search handles 1,000+ categories without lag

### Acceptance Criteria
1. ✅ Search input filters categories as user types (real-time)
2. ✅ Search matches name, code, and description fields
3. ✅ Case variations return same results (e.g., "APP" = "app")
4. ✅ Partial matches display correctly (e.g., "App" matches "Appetizers")
5. ✅ Result count updates dynamically (e.g., "Showing 3 of 15 categories")
6. ✅ Clear button removes search filter and restores full list
7. ✅ Hierarchy relationships maintained in search results
8. ✅ Parent categories auto-expand when children match
9. ✅ No results shows "No categories match your search" message
10. ✅ Search remains performant with 100+ categories

---

## UC-CAT-003: Filter Categories with Advanced Filters

### Description
Kitchen Managers apply complex filters to analyze specific category groups based on multiple criteria such as status, parent relationship, recipe counts, and performance margins.

### Actor
- Primary: Kitchen Manager, Head Chef
- Secondary: Sous Chef

### Priority
Medium

### Frequency
Weekly (5-10 times per week)

### Preconditions
- User is viewing the categories list (UC-CAT-001)
- Categories exist in the system
- User has permission to use advanced filters

### Postconditions
- **Success**: Categories filtered according to selected criteria
- **Failure**: Error message if filter application fails

### Main Flow

1. User views recipe categories list
2. User clicks "Advanced Filters" button in toolbar
3. System opens advanced filter panel with filter options:
   - Quick Filters: Pre-set buttons (No Recipes, Has Recipes, Top Level, Sub Level)
   - Custom Filters: Field-Operator-Value combinations
   - Available fields: Name, Code, Description, Status, Recipe Count, Cost, Margin
   - Available operators: Contains, Equals, Not Equals, Greater Than, Less Than, Is Empty, Is Not Empty
4. User selects quick filter button (e.g., "Has Recipes")
5. System applies filter immediately
6. System displays filtered results in table
7. System shows active filter count badge on filter button
8. User can:
   - Add additional quick filters (multiple allowed)
   - Add custom filter conditions with "Add Filter" button
   - Remove individual filters by clicking filter tag
   - Clear all filters with "Clear All" button
   - Export filtered results

### Alternative Flows

**A1: Add Custom Filter Condition**
- At step 4, user clicks "Add Filter Condition" button
- System adds new filter row with dropdowns:
  - Field dropdown: Select category attribute
  - Operator dropdown: Select comparison operator
  - Value input: Enter comparison value
- User selects field (e.g., "Recipe Count")
- User selects operator (e.g., "Greater Than")
- User enters value (e.g., "20")
- System applies filter and updates results
- Filter row displays with remove button (X icon)

**A2: Multiple Custom Filters (AND Logic)**
- At step 7, user clicks "Add Filter Condition" again
- System adds second filter row
- User configures second filter (e.g., "Average Margin > 65")
- System applies both filters with AND logic (both must be true)
- Results show only categories matching all conditions
- Each filter displays as removable tag

**A3: Quick Filter Toggle**
- At step 4, user clicks active quick filter again
- System removes filter (toggle off)
- System updates results to show unfiltered data
- Filter count badge decrements
- Other active filters remain applied

### Exception Flows

**E1: No Results Match Filters**
- At step 6, no categories match filter criteria
- System displays empty state: "No categories match your filters"
- System shows active filter summary
- System suggests: "Try adjusting your filters or clear all"
- User can clear filters or modify criteria

**E2: Invalid Filter Value**
- During A1, user enters invalid value (e.g., "abc" for numeric field)
- System displays inline validation error: "Please enter a valid number"
- System prevents filter application
- Filter row highlights in red
- User corrects value and filter applies successfully

**E3: Conflicting Filters**
- During A2, user adds contradictory filters (e.g., "Status = Active" AND "Status = Inactive")
- System applies all filters (results in empty set)
- System displays message: "Your filters returned no results. Check for conflicting conditions."
- User can review and adjust filters
- System allows contradictory filters (does not prevent)

### Business Rules Applied
- BR-CAT-011: Status Change Impact (filter respects active/inactive status)
- BR-CAT-017: Performance Metric Calculation (filters use calculated metrics)

### Performance Requirements
- Filter application completes in <500ms
- Multiple filters combine efficiently
- Filter state persists during session

### Acceptance Criteria
1. ✅ Advanced filter panel opens from filter button
2. ✅ Quick filters apply with single click
3. ✅ Multiple quick filters can be active simultaneously
4. ✅ Custom filter rows accept field, operator, and value inputs
5. ✅ Add Filter button creates new filter condition row
6. ✅ Multiple custom filters combine with AND logic
7. ✅ Active filter count displays on filter button badge
8. ✅ Remove buttons (X) delete individual filter conditions
9. ✅ Clear All button resets all filters to default
10. ✅ Filtered results update immediately after filter changes
11. ✅ Filter state persists while user navigates within page
12. ✅ Export functionality respects active filters

---

## UC-CAT-004: Create New Recipe Category

### Description
Head Chef creates a new recipe category with default cost settings and margin targets to organize recipes into logical groups.

### Actor
- Primary: Head Chef, Kitchen Manager
- Secondary: None (restricted access)

### Priority
High

### Frequency
Weekly (2-5 times per week)

### Preconditions
- User is authenticated with category creation permission
- User is viewing categories list
- System has validated user permissions

### Postconditions
- **Success**: New category created and displayed in list
- **Failure**: Error message displayed, category not created

### Main Flow

1. User clicks "Create Category" button in toolbar
2. System opens "Create Category" modal dialog
3. System displays blank form with fields:
   - Category Name* (required)
   - Category Code* (required, auto-suggests based on name)
   - Description* (required, multi-line)
   - Parent Category (dropdown, nullable)
   - Status (toggle, defaults to Active)
   - Sort Order (numeric, defaults to next available)
   - Default Cost Settings section:
     - Labor Cost % (defaults to 30%)
     - Overhead % (defaults to 20%)
     - Target Food Cost % (defaults to 30%)
     - Total Cost % (calculated, displays sum)
   - Default Margins section:
     - Minimum Margin % (defaults to 65%)
     - Target Margin % (defaults to 70%)
4. User enters category name (e.g., "Appetizers")
5. System auto-generates category code (e.g., "APP")
6. User enters description
7. User optionally selects parent category from dropdown
8. User adjusts cost settings and margins if needed
9. User reviews total cost percentage and margin values
10. User clicks "Save" button
11. System validates all inputs:
    - Required fields filled
    - Code unique (not duplicate)
    - Name unique (not duplicate)
    - Percentages within 0-100% range
    - Target margin >= minimum margin
12. System creates category record in database
13. System calculates initial metrics (recipe count = 0)
14. System displays success toast: "Category '[Name]' created successfully"
15. System closes modal dialog
16. System refreshes category list
17. System highlights newly created category
18. System automatically selects new category

### Alternative Flows

**A1: Create Subcategory**
- At step 7, user selects existing category from parent dropdown
- System sets selected category as parent
- System increments parent level to determine new category level
- System validates level < 3 (prevents 3rd level)
- System creates subcategory under parent
- System updates parent's subcategory count

**A2: Auto-generate Category Code**
- At step 5, user leaves code field blank
- System generates code from name:
  - Extracts uppercase letters
  - Adds hyphens for multi-word names
  - Example: "Cold Appetizers" → "COLD-APP"
- User can edit auto-generated code
- System validates edited code for uniqueness

**A3: Warning for High Total Cost Percentage**
- At step 9, total cost percentage exceeds 100%
- System displays warning banner: "Total cost percentage ([X]%) exceeds 100%. This may result in unachievable margins."
- Warning is informational only (does not block save)
- User can adjust values or proceed with warning
- System allows saving with warning acknowledged

**A4: Adjust Default Margins**
- At step 8, user modifies margin percentages
- System validates target >= minimum in real-time
- If target < minimum, system shows inline error
- System calculates achievable margin based on costs
- If target margin unachievable, system shows warning
- User adjusts values until valid

### Exception Flows

**E1: Duplicate Category Code**
- At step 11, validation detects duplicate code
- System displays error: "Category code '[CODE]' already exists. Please choose a unique code."
- Error appears below code input field
- Save button remains disabled
- User modifies code to unique value
- Validation re-checks and allows save

**E2: Duplicate Category Name**
- At step 11, validation detects duplicate name
- System displays error: "Category name '[NAME]' already exists. Please choose a different name."
- Error appears below name input field
- Save button remains disabled
- User modifies name to unique value
- Validation re-checks and allows save

**E3: Invalid Percentage Values**
- At step 11, validation detects value >100% or <0%
- System displays error: "[Field] must be between 0 and 100%"
- Error appears below invalid field
- Field highlights in red
- Save button remains disabled
- User enters valid value (0-100%)
- Validation passes and allows save

**E4: Target Margin Less Than Minimum**
- At step 11, validation detects target < minimum
- System displays error: "Target margin must be greater than or equal to minimum margin"
- Error appears below target margin field
- Save button remains disabled
- User increases target or decreases minimum
- Validation passes and allows save

**E5: Database Save Failure**
- At step 12, database operation fails
- System displays error toast: "Failed to create category. Please try again."
- Modal dialog remains open with user data intact
- User can retry save or cancel
- System logs error for troubleshooting
- If retry fails, user contacts support

**E6: Third-Level Hierarchy Attempt**
- During A1, user selects level 2 category as parent
- System detects this would create level 3
- System displays error: "Cannot create subcategory. Maximum hierarchy depth (2 levels) reached."
- Parent dropdown resets to empty
- User must select level 1 category or create top-level

### Business Rules Applied
- BR-CAT-001: Category Code Uniqueness
- BR-CAT-002: Category Name Uniqueness
- BR-CAT-003: Hierarchy Depth Limit
- BR-CAT-004: Parent Category Consistency
- BR-CAT-007: Cost Percentage Validation
- BR-CAT-008: Total Cost Percentage Warning
- BR-CAT-009: Margin Relationship Validation
- BR-CAT-010: Achievable Margin Validation
- BR-CAT-012: Default Settings Inheritance
- BR-CAT-015: Required Field Validation
- BR-CAT-018: Category Code Format

### Performance Requirements
- Form renders in <500ms
- Validation feedback appears in <100ms
- Save operation completes in <1 second

### Acceptance Criteria
1. ✅ Create button opens modal dialog with blank form
2. ✅ Required fields marked with asterisks (name, code, description)
3. ✅ Code auto-generates from name if left blank
4. ✅ Parent category dropdown populated with level 1 categories only
5. ✅ Status defaults to "Active"
6. ✅ Cost settings pre-filled with defaults (labor 30%, overhead 20%, food 30%)
7. ✅ Margins pre-filled with defaults (min 65%, target 70%)
8. ✅ Total cost percentage calculates automatically
9. ✅ Real-time validation prevents invalid input
10. ✅ Duplicate code/name validation shows error message
11. ✅ Warning displays if total cost >100%
12. ✅ Error if target margin < minimum margin
13. ✅ Success toast appears after creation
14. ✅ New category appears in list immediately
15. ✅ New category automatically selected/highlighted
16. ✅ Cancel button closes dialog without saving

---

## UC-CAT-005: Edit Recipe Category

### Description
Kitchen Manager edits existing category details, cost settings, and margin targets to update category information and adjust cost parameters.

### Actor
- Primary: Head Chef, Kitchen Manager
- Secondary: Sous Chef (limited fields)

### Priority
High

### Frequency
Weekly (5-15 times per week)

### Preconditions
- User has category edit permission
- User is viewing categories list
- Category to edit exists in system
- User has selected category to edit

### Postconditions
- **Success**: Category updated with new values, list refreshed
- **Failure**: Error message displayed, category unchanged

### Main Flow

1. User locates category to edit in list
2. User clicks action menu button (three dots) for category row
3. System displays dropdown menu with actions: View, Edit, Delete
4. User clicks "Edit" option
5. System opens "Edit Category" modal dialog
6. System pre-populates form with current category values:
   - Name, code, description
   - Parent category, status, sort order
   - Cost settings (labor%, overhead%, food cost%)
   - Margin targets (minimum%, target%)
   - Calculated metrics (recipe counts, averages) displayed as read-only
7. User modifies desired fields
8. User reviews changes and impact summary
9. User clicks "Save Changes" button
10. System validates all inputs (same validation as create)
11. System checks if changes affect recipes:
    - If margin changes and category has 10+ recipes, show warning dialog
    - User confirms changes in warning dialog
12. System updates category record in database
13. System recalculates metrics if cost/margin settings changed
14. System displays success toast: "Category '[Name]' updated successfully"
15. System closes modal dialog
16. System refreshes category list with updated values
17. System maintains current scroll position and expanded state

### Alternative Flows

**A1: Edit Subcategory Parent**
- At step 7, user attempts to change parent category
- System checks if category has assigned recipes
- If recipes exist, system disables parent dropdown
- System shows tooltip: "Cannot change parent. Category has [N] assigned recipe(s)."
- User cannot modify parent (field locked)
- User can edit other fields normally

**A2: Warning for Margin Changes with Many Recipes**
- At step 11, system detects margin change affecting 10+ recipes
- System displays warning dialog:
  - Title: "Confirm Margin Changes"
  - Message: "Changing margins will affect [N] recipes in this category. New recipes will use updated margin targets."
  - Note: "Existing recipes will not be automatically updated."
  - Buttons: "Confirm Changes" | "Cancel"
- User clicks "Confirm Changes"
- System proceeds with save
- User clicks "Cancel" to return to edit form

**A3: Status Change from Active to Inactive**
- At step 7, user toggles status from Active to Inactive
- System shows info banner: "Deactivating this category will hide it from recipe assignment dropdowns but will not affect existing recipes."
- User can toggle back to Active
- Save proceeds with new status
- Category moves to inactive filter group in list

**A4: Quick Edit from View Mode**
- User is viewing category details (see UC-CAT-006)
- User clicks "Edit" button in view dialog
- System closes view dialog
- System opens edit dialog with current values
- User edits as normal
- Edit flow continues from step 7

### Exception Flows

**E1: Duplicate Code During Edit**
- At step 10, validation detects code matches different category
- System displays error: "Category code '[CODE]' is already used by another category"
- Error appears below code field
- Save button disabled
- User changes code to unique value
- Validation passes, save enabled

**E2: Duplicate Name During Edit**
- At step 10, validation detects name matches different category
- System displays error: "Category name '[NAME]' already exists"
- Error appears below name field
- Save button disabled
- User changes name to unique value
- Validation passes, save enabled

**E3: Invalid Margin Values**
- At step 10, validation detects target < minimum
- System displays error: "Target margin must be >= minimum margin"
- Margin fields highlight in red
- Save button disabled
- User adjusts values to valid range
- Validation passes, save enabled

**E4: Concurrent Edit Conflict**
- At step 12, another user has modified category simultaneously
- System detects version conflict
- System displays error: "This category was modified by another user. Please refresh and try again."
- Modal remains open with user's changes
- User can copy values, click cancel, refresh page
- User re-enters changes after refresh

**E5: Database Update Failure**
- At step 12, database update operation fails
- System displays error toast: "Failed to update category. Please try again."
- Modal remains open with user data
- User can retry save
- If retry fails repeatedly, user contacts support
- System logs error details

### Business Rules Applied
- BR-CAT-001: Category Code Uniqueness
- BR-CAT-002: Category Name Uniqueness
- BR-CAT-004: Parent Category Consistency
- BR-CAT-007: Cost Percentage Validation
- BR-CAT-008: Total Cost Percentage Warning
- BR-CAT-009: Margin Relationship Validation
- BR-CAT-010: Achievable Margin Validation
- BR-CAT-011: Status Change Impact
- BR-CAT-013: Parent Category Modification with Recipes

### Performance Requirements
- Form loads with current values in <500ms
- Validation feedback appears in <100ms
- Save operation completes in <1 second

### Acceptance Criteria
1. ✅ Edit button opens dialog with all current values populated
2. ✅ All fields editable except read-only metrics (recipe counts, averages)
3. ✅ Parent category disabled if category has recipes (tooltip explains why)
4. ✅ Status toggle switches between Active/Inactive
5. ✅ Cost settings accept decimal values with validation
6. ✅ Margin fields validate target >= minimum in real-time
7. ✅ Total cost percentage calculates automatically
8. ✅ Warning dialog appears if margin changes affect 10+ recipes
9. ✅ Info banner displays for status changes
10. ✅ Duplicate validation excludes current category
11. ✅ Success toast appears after save
12. ✅ Updated values reflect immediately in list
13. ✅ Hierarchy structure preserved after edit
14. ✅ Cancel button discards changes without saving

---

## UC-CAT-006: View Category Details

### Description
Kitchen staff views complete category details in read-only mode to review category settings, performance metrics, and configuration without risk of accidental changes.

### Actor
- Primary: Kitchen Manager, Sous Chef
- Secondary: Head Chef, Production Staff

### Priority
Medium

### Frequency
Daily (10-20 times per day)

### Preconditions
- User has category view permission
- User is viewing categories list
- Category to view exists in system

### Postconditions
- **Success**: Category details displayed in read-only dialog
- **Failure**: Error message if category cannot be loaded

### Main Flow

1. User locates category to view in list
2. User clicks action menu button (three dots) for category row
3. System displays dropdown menu with actions
4. User clicks "View Details" option
5. System opens "Category Details" modal dialog
6. System displays all category information in read-only format:
   - **Basic Information**:
     - Name, Code, Description
     - Status (colored badge)
     - Parent Category (name or "None")
     - Hierarchy Level
   - **Cost Configuration**:
     - Labor Cost Percentage
     - Overhead Percentage
     - Target Food Cost Percentage
     - Total Cost Percentage (calculated, highlighted)
   - **Margin Targets**:
     - Minimum Margin Percentage
     - Target Margin Percentage
     - Achievable Margin (calculated)
   - **Performance Metrics**:
     - Total Recipe Count
     - Active Recipe Count
     - Average Cost per Recipe
     - Average Margin Percentage
     - Performance Status (badge: Below/Meeting/Exceeding targets)
   - **Audit Information**:
     - Last Updated Date
     - Last Updated By
7. System formats all values appropriately:
   - Percentages with % symbol
   - Currency with $ symbol
   - Dates in readable format
8. System displays "Edit" button (if user has edit permission)
9. User reviews information
10. User closes dialog by clicking X button or outside dialog

### Alternative Flows

**A1: Transition to Edit Mode**
- At step 9, user clicks "Edit" button
- System closes view dialog
- System opens edit dialog pre-populated with current values
- User proceeds with editing (see UC-CAT-005)

**A2: View Subcategory with Parent Context**
- At step 6, viewing subcategory
- System displays parent category name as clickable link
- User clicks parent category link
- System closes current dialog
- System opens view dialog for parent category
- User can navigate back to subcategory

**A3: View Performance Trend Indicator**
- At step 6, system displays trend arrows next to metrics
- Green up arrow: Improving performance (margin increasing)
- Red down arrow: Declining performance (margin decreasing)
- Gray dash: Stable performance (no significant change)
- User hovers arrow to see percentage change

### Exception Flows

**E1: Category Not Found**
- At step 5, category ID invalid or deleted
- System displays error dialog: "Category not found or has been deleted"
- Error dialog has "Go Back" button
- User clicks button to return to category list
- List refreshes to show current categories

**E2: Metrics Calculation Pending**
- At step 6, performance metrics not yet calculated
- System displays "Calculating..." placeholders for metrics
- System shows loading indicator
- Background process completes calculation
- System updates dialog with calculated values
- No user action required

**E3: Missing Audit Information**
- At step 6, audit information unavailable (legacy data)
- System displays "N/A" for missing audit fields
- Other information displays normally
- User can still review available data

### Business Rules Applied
- BR-CAT-011: Status Change Impact (status badge reflects current state)
- BR-CAT-017: Performance Metric Calculation (displays calculated metrics)

### Performance Requirements
- Dialog opens in <500ms
- All data loads without delay
- Performance metrics display with <1 second calculation

### Acceptance Criteria
1. ✅ View dialog displays all category information
2. ✅ All fields render as read-only formatted text (no input fields)
3. ✅ Percentages display with % symbol
4. ✅ Currency values display with $ symbol and 2 decimal places
5. ✅ Status displays as colored badge (green/gray)
6. ✅ Parent category shows name or "None" for top-level
7. ✅ Total cost percentage calculates and displays
8. ✅ Performance badge indicates meeting/exceeding/below targets
9. ✅ Edit button appears only for users with edit permission
10. ✅ Edit button transitions to edit mode with current values
11. ✅ Close button (X) exits dialog
12. ✅ Click outside dialog closes view
13. ✅ Layout is responsive and visually organized
14. ✅ No save/cancel buttons (view-only mode)

---

## UC-CAT-007: Delete Recipe Category

### Description
Head Chef deletes an unused category to maintain a clean and relevant category structure. System prevents deletion of categories with active recipes or subcategories to protect data integrity.

### Actor
- Primary: Head Chef
- Secondary: Kitchen Manager (with approval)

### Priority
Low

### Frequency
Monthly (1-5 times per month)

### Preconditions
- User has category delete permission
- User is viewing categories list
- Category to delete exists in system
- Category has no active recipes (or user has force-delete permission)
- Category has no subcategories

### Postconditions
- **Success**: Category deleted, removed from list, parent updated if applicable
- **Failure**: Error message displayed, category remains unchanged

### Main Flow

1. User locates category to delete in list
2. User clicks action menu button (three dots) for category row
3. System displays dropdown menu with actions
4. User clicks "Delete" option
5. System performs pre-deletion validation:
   - Checks for active recipes
   - Checks for inactive recipes
   - Checks for subcategories
6. System opens "Confirm Deletion" dialog
7. System displays deletion impact information:
   - Category name and code
   - Recipe count (if any)
   - Subcategory count (if any)
   - Warning message based on impact
8. User reviews deletion impact
9. User clicks "Confirm Delete" button
10. System deletes category record from database
11. System updates parent category (if applicable):
    - Decrements subcategory count
    - Recalculates parent metrics
12. System logs deletion in audit trail
13. System displays success toast: "Category '[Name]' deleted successfully"
14. System closes confirmation dialog
15. System refreshes category list
16. System removes deleted category from view
17. System updates hierarchy display

### Alternative Flows

**A1: Delete Empty Category (No Recipes)**
- At step 5, system detects zero recipes
- At step 7, dialog shows: "This category has no recipes and can be safely deleted."
- Green checkmark icon indicates safe deletion
- User confirms deletion
- System deletes immediately
- No additional warnings needed

**A2: Force Delete with Inactive Recipes**
- At step 5, system detects inactive recipes but no active recipes
- At step 7, dialog shows: "This category has [N] inactive recipe(s). Deleting will unassign these recipes."
- System displays checkbox: "I understand inactive recipes will be unassigned"
- User must check box to enable confirm button
- User confirms deletion
- System unassigns recipes from category
- System deletes category
- Unassigned recipes remain in system with null category

### Exception Flows

**E1: Category Has Active Recipes**
- At step 5, system detects active recipes
- System prevents deletion
- At step 7, dialog shows error:
  - Title: "Cannot Delete Category"
  - Message: "This category contains [N] active recipe(s) and cannot be deleted."
  - Instruction: "Please deactivate or reassign recipes before deleting this category."
  - Only "Cancel" button available (no confirm button)
- User clicks Cancel to close dialog
- Category remains in system unchanged
- User must deactivate/reassign recipes first

**E2: Category Has Subcategories**
- At step 5, system detects subcategories
- System prevents deletion
- At step 7, dialog shows error:
  - Title: "Cannot Delete Category"
  - Message: "This category has [N] subcategory(ies) and cannot be deleted."
  - Instruction: "Please delete or reassign subcategories before deleting this parent category."
  - Only "Cancel" button available
- User clicks Cancel
- Category remains in system
- User must handle subcategories first

**E3: Category Has Both Active Recipes and Subcategories**
- At step 5, system detects both blocking conditions
- System prevents deletion
- At step 7, dialog shows combined error:
  - Message: "This category cannot be deleted because it has:"
  - Bullet list: "[N] active recipe(s)" and "[M] subcategory(ies)"
  - Instruction with both resolution steps
- User must resolve both conditions
- Deletion blocked until all conditions cleared

**E4: Database Deletion Failure**
- At step 10, database delete operation fails
- System displays error toast: "Failed to delete category. Please try again."
- Confirmation dialog closes
- Category remains in list
- User can retry deletion
- System logs error for troubleshooting

**E5: Concurrent Deletion Conflict**
- At step 10, another user deleted category simultaneously
- System detects category no longer exists
- System displays info toast: "Category already deleted"
- Dialog closes
- System refreshes list
- Category no longer appears
- No error (successful outcome from user perspective)

### Business Rules Applied
- BR-CAT-005: Deletion with Active Recipes
- BR-CAT-006: Deletion with Subcategories

### Performance Requirements
- Validation checks complete in <200ms
- Delete operation completes in <1 second
- List refresh happens immediately after deletion

### Acceptance Criteria
1. ✅ Delete button triggers confirmation dialog
2. ✅ Dialog displays category name and deletion impact
3. ✅ Error message prevents deletion if active recipes exist
4. ✅ Error message prevents deletion if subcategories exist
5. ✅ Warning message displays if inactive recipes exist
6. ✅ Checkbox confirmation required for categories with inactive recipes
7. ✅ Confirm button disabled until checkbox checked (when applicable)
8. ✅ Cancel button closes dialog without deletion
9. ✅ Success toast displays after successful deletion
10. ✅ Deleted category immediately removed from list
11. ✅ Parent category metrics update if applicable
12. ✅ Deletion logged in system audit trail
13. ✅ Cannot delete if blocking conditions exist

---

## UC-CAT-008: Expand/Collapse Category Hierarchy

### Description
Kitchen staff expands and collapses parent categories to show or hide subcategories, allowing focused viewing of relevant categories and reducing visual clutter.

### Actor
- Primary: Kitchen Manager, Head Chef, Sous Chef
- Secondary: Production Staff

### Priority
High

### Frequency
Daily (30-50 times per day)

### Preconditions
- User is viewing categories list
- At least one parent category with subcategories exists
- Hierarchy is displayed in list view

### Postconditions
- **Success**: Subcategories shown/hidden based on user action
- **Failure**: Hierarchy state unchanged if error occurs

### Main Flow

1. User views recipe categories list with hierarchy
2. System displays parent categories with chevron icons:
   - Chevron Right (►): Category collapsed (children hidden)
   - Chevron Down (▼): Category expanded (children visible)
3. User identifies parent category to expand/collapse
4. User clicks chevron icon next to parent category name
5. System toggles expansion state:
   - If collapsed, expand to show subcategories
   - If expanded, collapse to hide subcategories
6. System animates transition (slide down/up animation)
7. System updates chevron icon direction
8. System maintains expansion state during session
9. User can:
   - Click other parent categories to expand/collapse independently
   - Perform actions on expanded subcategories
   - Search/filter while maintaining expansion states

### Alternative Flows

**A1: Expand All**
- At step 4, user clicks "Expand All" button in toolbar
- System expands all parent categories simultaneously
- All subcategories become visible
- All chevron icons change to Down (▼)
- User can collapse individual categories afterward

**A2: Collapse All**
- At step 4, user clicks "Collapse All" button in toolbar
- System collapses all parent categories simultaneously
- All subcategories become hidden
- All chevron icons change to Right (►)
- User can expand individual categories afterward

**A3: Expand on Search Match**
- User searches for category (see UC-CAT-002)
- Search matches a subcategory
- System automatically expands parent category
- Matched subcategory becomes visible
- Parent remains expanded for context
- User can collapse parent manually

**A4: Keyboard Navigation**
- At step 4, user focuses parent category row with keyboard (Tab)
- User presses Right Arrow key
- System expands category (if collapsed)
- User presses Left Arrow key
- System collapses category (if expanded)
- Keyboard navigation accessible for accessibility

### Exception Flows

**E1: Parent Category with No Children**
- At step 2, category has no subcategories
- System displays category without chevron icon
- Click on row does not trigger expansion
- Category appears as leaf node (end of branch)
- No error occurs (expected behavior)

**E2: Animation Performance Issue**
- At step 6, too many subcategories cause slow animation
- System detects >20 subcategories
- System skips animation and shows/hides instantly
- User sees immediate transition
- Performance maintained for large datasets

**E3: Expansion State Lost on Page Refresh**
- User expands multiple categories
- User refreshes browser page
- System resets all categories to collapsed state (default)
- User must re-expand categories as needed
- Note: Future enhancement could persist state in session storage

### Business Rules Applied
- BR-CAT-003: Hierarchy Depth Limit (only 2 levels, so only 1 level of expansion)

### Performance Requirements
- Expansion/collapse responds in <100ms
- Animation completes in <300ms
- State changes handle 100+ subcategories without lag

### Acceptance Criteria
1. ✅ Parent categories display chevron icons (Right when collapsed, Down when expanded)
2. ✅ Clicking chevron toggles expansion state
3. ✅ Expansion shows subcategories with proper indentation
4. ✅ Collapse hides subcategories
5. ✅ Transition animates smoothly (slide effect)
6. ✅ Expansion state maintained during session
7. ✅ Multiple parent categories can be expanded simultaneously
8. ✅ Expand All button expands all parent categories
9. ✅ Collapse All button collapses all parent categories
10. ✅ Search auto-expands parent when child matches
11. ✅ Keyboard navigation supports expand/collapse (arrow keys)
12. ✅ Categories without children show no chevron icon
13. ✅ Performance remains smooth with many subcategories

---

## UC-CAT-009: Bulk Select Categories

### Description
Kitchen Manager selects multiple categories using checkboxes to perform bulk actions efficiently, such as status updates or exports.

### Actor
- Primary: Kitchen Manager
- Secondary: Head Chef

### Priority
Medium

### Frequency
Weekly (5-10 times per week)

### Preconditions
- User is viewing categories list
- Multiple categories exist in system
- User has permission for bulk operations

### Postconditions
- **Success**: Selected categories available for bulk actions
- **Failure**: Selection state unchanged if error occurs

### Main Flow

1. User views recipe categories list
2. System displays checkbox in first column of each category row
3. System displays "Select All" checkbox in table header
4. User clicks individual category checkbox
5. System toggles selection state for that category:
   - Checked: Category selected (row highlights)
   - Unchecked: Category deselected (row normal)
6. System updates selected count badge in toolbar: "[N] selected"
7. System enables bulk actions menu
8. User continues selecting additional categories
9. System updates count dynamically as selections change
10. User can:
    - Select all with header checkbox
    - Deselect all by unchecking header checkbox
    - Access bulk actions menu (status update, export, print)
    - Clear selection with "Clear Selection" button

### Alternative Flows

**A1: Select All Categories**
- At step 4, user clicks "Select All" checkbox in header
- System selects all visible categories in current view
- All category row checkboxes become checked
- All category rows highlight
- Selected count shows total: "[N] selected"
- Header checkbox shows checked state
- If filters active, selects only filtered categories

**A2: Deselect All Categories**
- User has multiple categories selected
- User clicks "Select All" checkbox (currently checked)
- System deselects all categories
- All checkboxes become unchecked
- All row highlights removed
- Selected count resets to "0 selected"
- Bulk actions menu disabled

**A3: Select Category Range (with Shift Key)**
- User selects first category by clicking checkbox
- User holds Shift key
- User clicks checkbox of another category (above or below)
- System selects all categories between the two clicks
- All checkboxes in range become checked
- Selected count updates to include range
- User can extend selection with additional Shift+clicks

**A4: Selection Across Hierarchy**
- User selects parent category
- System selects only the parent (not subcategories)
- User can individually select subcategories
- System tracks parent and children independently
- Selected count includes parent and any selected children
- Bulk actions apply to all selected (parents and children)

### Exception Flows

**E1: No Categories to Select (Empty List)**
- At step 2, category list is empty
- System displays empty state message
- No checkboxes displayed
- Select All checkbox disabled and grayed out
- Bulk actions menu not available

**E2: Selection with Active Filters**
- User applies filter reducing visible categories
- User selects "Select All"
- System selects only visible (filtered) categories
- System does not select hidden categories
- Selected count reflects visible selection only
- User clears filter
- Selection maintained for previously selected categories

**E3: Selection Lost on Page Navigation**
- User selects multiple categories
- User navigates away from categories page
- User returns to categories page
- System clears all selections (default behavior)
- Selected count resets to 0
- Note: Future enhancement could persist selection in session

### Business Rules Applied
- None specific to selection (feature is UI mechanism for bulk actions)

### Performance Requirements
- Checkbox toggle responds in <50ms
- Select All completes in <200ms for 100 categories
- Selected count updates in real-time without lag

### Acceptance Criteria
1. ✅ Checkboxes appear in first column of table
2. ✅ Individual checkboxes select/deselect single categories
3. ✅ Header checkbox selects/deselects all visible categories
4. ✅ Selected categories highlight with background color
5. ✅ Selected count displays in toolbar (e.g., "3 selected")
6. ✅ Bulk actions menu appears when categories selected
7. ✅ Clear Selection button resets all selections
8. ✅ Shift+click selects range of categories
9. ✅ Parent and subcategory selections independent
10. ✅ Selection respects active filters (filtered-only)
11. ✅ Select All checkbox has indeterminate state when some selected
12. ✅ Performance smooth with 100+ categories

---

## UC-CAT-010: Export Categories

### Description
Head Chef or Kitchen Manager exports category data to Excel or CSV format for reporting, data sharing, or external analysis. Export respects current filters and selections.

### Actor
- Primary: Head Chef, Kitchen Manager
- Secondary: Sous Chef

### Priority
Low

### Frequency
Monthly (2-5 times per month)

### Preconditions
- User is viewing categories list
- At least one category exists
- User has export permission
- Export functionality available in browser

### Postconditions
- **Success**: File downloaded with category data in selected format
- **Failure**: Error message displayed, no file generated

### Main Flow

1. User views recipe categories list
2. User optionally applies search or filters (see UC-CAT-002, UC-CAT-003)
3. User optionally selects specific categories with checkboxes (see UC-CAT-009)
4. User clicks "Export" button in toolbar
5. System displays export format dropdown:
   - Excel (.xlsx)
   - CSV (.csv)
6. User selects desired export format (e.g., Excel)
7. System determines export scope:
   - If categories selected: Export selected only
   - If filters active: Export filtered results
   - If neither: Export all categories
8. System displays progress indicator: "Preparing export..."
9. System generates export file:
   - Includes all category fields (name, code, description, status, metrics, etc.)
   - Formats data appropriately for selected format
   - Maintains hierarchy structure with indentation
   - Adds header row with column names
   - Includes export metadata (date, user, filter summary)
10. System triggers browser download
11. File saves to user's default download location
12. System displays success toast: "Exported [N] categories to [format]"
13. System clears progress indicator
14. User opens file to review exported data

### Alternative Flows

**A1: Export to Excel with Formatting**
- At step 6, user selects Excel format
- At step 9, system applies Excel-specific formatting:
  - Bold header row
  - Freeze top row for scrolling
  - Auto-fit column widths
  - Currency format for cost columns
  - Percentage format for margin/cost% columns
  - Status column with color coding (green/gray)
  - Hierarchy indentation in Name column
- File downloads as formatted spreadsheet
- User can immediately use file for presentations

**A2: Export to CSV for Data Import**
- At step 6, user selects CSV format
- At step 9, system generates plain CSV:
  - Comma-separated values
  - Quoted text fields (handles commas in descriptions)
  - No formatting or styling
  - All data as text strings
  - Header row with field names
- File suitable for importing into other systems
- User uses for database imports or integrations

**A3: Export with Active Filters**
- At step 2, user applies filters (e.g., "Status = Active")
- At step 7, system detects active filters
- System includes filter summary in export:
  - Header row: "Filtered by: Status = Active"
  - Only filtered categories included in export
  - Selected count reflects filtered total
- Success message: "Exported [N] filtered categories"

**A4: Export Selected Categories Only**
- At step 3, user selects 5 specific categories
- At step 7, system detects selection
- System exports only selected categories
- Export includes selection note: "Export of [N] selected categories"
- Success message: "Exported [N] selected categories"

### Exception Flows

**E1: No Categories to Export**
- At step 7, no categories meet export criteria (empty list or no selection)
- System displays error message: "No categories to export. Please adjust your selection or filters."
- Export button remains available
- User can adjust criteria and retry
- No file downloaded

**E2: Export Generation Failure**
- At step 9, file generation fails (memory issue, format error)
- System displays error toast: "Export failed. Please try again or export fewer categories."
- Progress indicator clears
- No file downloaded
- System logs error details
- User can retry with smaller selection

**E3: Browser Blocks Download**
- At step 10, browser blocks automatic download (popup blocker)
- System displays message: "Download blocked. Please allow downloads and try again."
- System provides "Retry Download" button
- User adjusts browser settings
- User clicks retry button
- Download succeeds

**E4: Export Too Large**
- At step 9, export exceeds size limit (>500 categories)
- System displays warning: "Large export may take a moment..."
- System generates file in background
- Progress indicator shows percentage: "Generating... 45%"
- File generates successfully (may take 5-10 seconds)
- Download proceeds normally

### Business Rules Applied
- None specific to export (feature respects all filter/selection rules)

### Performance Requirements
- Export generates in <5 seconds for 500 categories
- Progress indicator updates every second
- Browser download triggers immediately when ready

### Acceptance Criteria
1. ✅ Export button opens format selection dropdown
2. ✅ Excel export includes formatting (bold headers, column widths, colors)
3. ✅ CSV export generates plain comma-separated text
4. ✅ Export includes all category fields
5. ✅ Hierarchy structure preserved with indentation
6. ✅ Header row includes column names
7. ✅ Export metadata includes date, user, filter summary
8. ✅ Respects active search/filter criteria
9. ✅ Bulk selection exports only selected categories
10. ✅ Progress indicator displays during generation
11. ✅ File downloads automatically to default location
12. ✅ Success toast shows count and format
13. ✅ Error handling for empty exports and failures
14. ✅ Large exports (>500 records) handle gracefully

---

## Summary

This document provides comprehensive use cases for the Recipe Categories submodule, covering all major user interactions and workflows. Each use case includes detailed flows, exception handling, business rules, and acceptance criteria to ensure complete implementation.

**Key Workflows Documented:**
- Viewing and navigating category hierarchies
- Searching and filtering categories
- Creating, editing, and deleting categories
- Managing cost settings and margin targets
- Bulk operations and exports
- Performance metric tracking

**Next Steps:**
- Implement server actions based on use case flows
- Develop validation logic per business rules
- Create comprehensive test cases from acceptance criteria
- Build UI components matching described interactions

---

## Document Control

**Prepared By**: Development Team
**Reviewed By**: Head Chef, Kitchen Manager, Product Owner
**Approved By**: General Manager
**Version History**:
- v1.0 (2025-01-11): Initial use cases based on prototype implementation
