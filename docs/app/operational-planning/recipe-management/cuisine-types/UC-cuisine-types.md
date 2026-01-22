# Recipe Cuisine Types - Use Cases (UC)

## Document Information
- **Document Type**: Use Cases Document
- **Module**: Operational Planning > Recipe Management > Cuisine Types
- **Version**: 2.0.0
- **Last Updated**: 2025-01-16
- **Related Documents**:
  - [BR-cuisine-types.md](./BR-cuisine-types.md) - Business Requirements

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial use cases document created |
| 2.0.0 | 2025-01-16 | Development Team | Aligned with actual implementation: added spiceLevel, flavorProfile, cookingMethods, typicalIngredients management use cases |

---

## 1. Overview

### 1.1 Purpose
This document defines detailed use cases for the Recipe Cuisine Types management system, describing how different users interact with the system to accomplish their goals. Each use case includes complete flows, alternative paths, and exception handling.

### 1.2 Actors

**Primary Actors**:
- **Head Chef**: Creates and manages cuisine types, oversees recipe categorization
- **Sous Chef**: Updates cuisine details, assigns recipes to cuisines
- **Recipe Manager**: Maintains cuisine data, ensures accuracy
- **Menu Planner**: Uses cuisine data for menu planning and analysis

**Secondary Actors**:
- **System Administrator**: Manages permissions and system settings
- **Report Analyst**: Uses cuisine data for reporting and analytics

### 1.3 Use Case Catalog

| ID | Name | Priority | Frequency | Complexity |
|----|------|----------|-----------|------------|
| UC-CUI-001 | View Cuisine Types List | High | Daily | Low |
| UC-CUI-002 | Search Cuisine Types | High | Daily | Low |
| UC-CUI-003 | Filter Cuisine Types | High | Daily | Medium |
| UC-CUI-004 | Create New Cuisine Type | High | Weekly | Medium |
| UC-CUI-005 | Edit Existing Cuisine Type | High | Weekly | Medium |
| UC-CUI-006 | View Cuisine Type Details | Medium | Daily | Low |
| UC-CUI-007 | Delete Cuisine Type | Medium | Monthly | High |
| UC-CUI-008 | Bulk Select Cuisines | Medium | Weekly | Low |
| UC-CUI-009 | Bulk Operations | Medium | Monthly | Medium |
| UC-CUI-010 | Export Cuisines | Low | Weekly | Low |

---

## 2. Use Cases

### UC-CUI-001: View Cuisine Types List

**Description**: User views a comprehensive list of all recipe cuisine types with key information.

**Actor**: All Users (Head Chef, Sous Chef, Recipe Manager, Menu Planner)

**Priority**: High

**Frequency**: Multiple times daily

**Preconditions**:
- User is authenticated
- User has `cuisine.view` permission
- At least one cuisine type exists in the system

**Postconditions**:
- Cuisine list is displayed with current data
- User can see all visible cuisines based on filters
- List metrics show accurate counts

**Main Flow**:
1. User navigates to Operational Planning > Recipe Management > Cuisine Types
2. System loads cuisine types from database
3. System applies default filters (active cuisines only)
4. System calculates recipe count metrics
5. System displays cuisine list in table view
6. System shows:
   - Cuisine name and code
   - Description (truncated if long)
   - Region
   - Status badge (active/inactive)
   - Recipe count and active recipe count
   - Last updated date
   - Actions menu
7. System enables search, filters, and bulk actions
8. User views the list

**Alternative Flows**:

**A1: Switch to Grid View**
1. At step 5, user clicks grid view icon
2. System switches to card-based grid layout
3. System displays cuisines in responsive grid
4. System shows essential information on each card:
   - Name, code, region
   - Status badge
   - Recipe counts
   - Hover actions menu

**A2: Empty State**
1. At step 3, system finds no cuisines matching filters
2. System displays empty state message
3. System shows illustration and helpful text
4. System offers "Clear Filters" button
5. System offers "Create New Cuisine" button

**A3: Loading State**
1. At step 2, while data is loading
2. System displays skeleton loaders
3. System shows animated loading indicators
4. System maintains UI structure during load
5. Data appears when ready

**Exception Flows**:

**E1: Database Error**
1. At step 2, database connection fails
2. System displays error alert
3. System shows retry button
4. System logs error for investigation
5. User can retry or navigate away

**E2: Permission Denied**
1. At step 1, user lacks `cuisine.view` permission
2. System displays permission denied message
3. System redirects to dashboard
4. System logs unauthorized access attempt

**E3: Network Timeout**
1. At step 2, request times out (>30 seconds)
2. System displays timeout message
3. System offers retry option
4. System suggests checking connectivity

**Business Rules Applied**:
- BR-CUI-013: Recipe counts calculated from Recipe table
- Only active cuisines shown by default
- Cuisines sorted by sortOrder then name

**Performance Requirements**:
- Initial load: ≤ 2 seconds
- Grid/List view switch: ≤ 300ms
- No visible lag during interactions

**Acceptance Criteria**:
- ✓ List loads within 2 seconds
- ✓ All columns display correctly
- ✓ Recipe counts are accurate
- ✓ Status badges show correct colors
- ✓ Actions menu appears on hover/click
- ✓ Grid view displays in responsive layout
- ✓ Empty state shows helpful message
- ✓ Loading state shows skeleton UI

---

### UC-CUI-002: Search Cuisine Types

**Description**: User searches for specific cuisine types using real-time text search.

**Actor**: All Users

**Priority**: High

**Frequency**: Multiple times daily

**Preconditions**:
- User is viewing cuisine types list (UC-CUI-001)
- Search input field is visible and enabled

**Postconditions**:
- Search results display matching cuisines
- Search term is preserved during session
- List updates in real-time as user types

**Main Flow**:
1. User clicks in search input field
2. System focuses search input
3. System shows placeholder text: "Search cuisine types..."
4. User types search term (e.g., "Italian")
5. System waits 300ms (debounce)
6. System searches across name and code fields
7. System applies case-insensitive matching
8. System filters cuisine list to show only matches
9. System highlights matched text in results
10. System shows result count: "Showing {count} of {total} cuisines"
11. System displays clear search button (X icon)
12. User views filtered results

**Alternative Flows**:

**A1: No Results Found**
1. At step 8, system finds no matching cuisines
2. System displays empty state
3. System shows search term in message: "No results for '{term}'"
4. System suggests:
   - Check spelling
   - Try different keywords
   - Clear filters
5. System offers "Clear Search" button

**A2: Clear Search**
1. At step 11, user clicks clear search button (X)
2. System clears search input field
3. System removes search filter
4. System restores full cuisine list
5. System re-applies other active filters
6. System updates result count

**A3: Search with Active Filters**
1. At step 6, other filters are active
2. System applies search within filtered results
3. System shows both search and filter indicators
4. System maintains filter state
5. Results match search AND filters (AND logic)

**Exception Flows**:

**E1: Special Characters in Search**
1. At step 4, user enters special characters (@, #, $)
2. System sanitizes input to prevent injection
3. System searches for literal character matches
4. System shows results or empty state

**E2: Very Long Search Term**
1. At step 4, user enters >100 characters
2. System truncates search to 100 characters
3. System shows warning: "Search limited to 100 characters"
4. System performs search on truncated term

**Business Rules Applied**:
- Search is case-insensitive
- Search covers name and code fields only
- Minimum debounce: 300ms
- Maximum search length: 100 characters

**Performance Requirements**:
- Debounce delay: 300ms
- Search execution: ≤ 300ms
- Results update: immediate (no perceived lag)
- Works smoothly with 10,000+ cuisines

**Acceptance Criteria**:
- ✓ Search activates after 300ms typing pause
- ✓ Results update as user types
- ✓ Case-insensitive matching works
- ✓ Search works across name and code
- ✓ No results state shows helpful message
- ✓ Clear button removes search filter
- ✓ Search combines with other filters
- ✓ Special characters handled safely

---

### UC-CUI-003: Filter Cuisine Types

**Description**: User applies filters to narrow down the cuisine types list using quick filters or advanced conditions.

**Actor**: All Users

**Priority**: High

**Frequency**: Multiple times daily

**Preconditions**:
- User is viewing cuisine types list (UC-CUI-001)
- Filter controls are visible and enabled

**Postconditions**:
- Filtered cuisine list displays
- Active filters are visually indicated
- Filter state persists during session
- Filter count badge shows number of active filters

**Main Flow - Quick Filters**:
1. User views cuisine list with filter controls
2. System shows quick filter buttons:
   - "No Recipes" (cuisines with 0 recipes)
   - "Has Recipes" (cuisines with ≥1 recipes)
   - "Asian" (region = Asia)
   - "European" (region = Europe)
3. User clicks "Asian" quick filter
4. System highlights "Asian" button (active state)
5. System filters list to show only Asian cuisines
6. System updates result count
7. System shows "Clear Filters" button
8. User views filtered results

**Alternative Flows**:

**A1: Multiple Quick Filters**
1. At step 3, user clicks "Asian" filter
2. System activates "Asian" filter
3. User clicks "Has Recipes" filter
4. System activates "Has Recipes" filter
5. System applies both filters (AND logic)
6. System shows only Asian cuisines with recipes
7. System updates filter count badge: "(2)"

**A2: Toggle Quick Filter Off**
1. At step 3, quick filter is already active
2. User clicks active filter button
3. System deactivates filter
4. System removes filter from list
5. System restores filtered-out results
6. System updates result count
7. Filter count badge decrements

**A3: Advanced Filters**
1. At step 2, user clicks "More Filters" button
2. System opens advanced filter popover
3. System shows filter builder interface:
   - Field dropdown (name, code, description, region, status, recipe count)
   - Operator dropdown (contains, equals, not equals, greater than, less than)
   - Value input field
   - Add/Remove buttons
4. User selects field: "Recipe Count"
5. User selects operator: "Greater than"
6. User enters value: "20"
7. User clicks "Add Filter" button
8. System adds filter condition to list
9. User clicks "Apply Filters" button
10. System closes popover
11. System applies all filter conditions
12. System updates filter count badge
13. System shows filtered results

**A4: Multiple Advanced Filter Conditions**
1. Following A3, user adds another condition
2. User selects field: "Region"
3. User selects operator: "Equals"
4. User enters value: "Asia"
5. System adds second condition
6. System applies both conditions (AND logic)
7. Results show Asian cuisines with >20 recipes

**A5: Remove Filter Condition**
1. In advanced filter popover, condition exists
2. User clicks X button next to condition
3. System removes condition from list
4. System re-applies remaining filters
5. System updates results immediately

**A6: Clear All Filters**
1. Multiple filters are active
2. User clicks "Clear All Filters" button
3. System confirms: "Clear all {count} filters?"
4. User confirms
5. System removes all quick filters
6. System removes all advanced filters
7. System restores full cuisine list
8. System hides filter count badge
9. System updates result count

**Exception Flows**:

**E1: Invalid Filter Value**
1. At A3 step 6, user enters invalid value
2. System validates input format
3. System shows validation error below field
4. System disables "Apply Filters" button
5. User corrects value
6. System re-enables button

**E2: Conflicting Filters**
1. User activates "No Recipes" AND "Has Recipes"
2. System detects mutual exclusion
3. System shows warning: "These filters conflict"
4. System keeps last selected filter active
5. System deactivates conflicting filter

**E3: No Results After Filtering**
1. System applies filters
2. No cuisines match all conditions
3. System shows empty state
4. System suggests: "Try removing some filters"
5. System highlights active filters for review

**Business Rules Applied**:
- Multiple filters use AND logic
- Quick filters and advanced filters combine
- Filter state persists during session
- Maximum 10 advanced filter conditions

**Performance Requirements**:
- Filter application: ≤ 500ms
- Quick filter toggle: immediate (<100ms)
- Advanced filter popover: opens instantly
- Smooth interaction with 10,000+ cuisines

**Acceptance Criteria**:
- ✓ Quick filters toggle on/off correctly
- ✓ Multiple filters combine with AND logic
- ✓ Advanced filters support all operators
- ✓ Filter count badge shows accurate count
- ✓ Clear filters removes all active filters
- ✓ Empty state shows when no results
- ✓ Filters persist during session
- ✓ Invalid inputs show validation errors
- ✓ Filter application is performant

---

### UC-CUI-004: Create New Cuisine Type

**Description**: User creates a new cuisine type with required information and optional characteristics.

**Actor**: Head Chef, Recipe Manager

**Priority**: High

**Frequency**: Weekly

**Preconditions**:
- User is authenticated
- User has `cuisine.create` permission
- User is viewing cuisine types list

**Postconditions**:
- New cuisine type is created and saved
- New cuisine appears in list
- Recipe count metrics initialized to zero
- Audit trail records creation

**Main Flow**:
1. User clicks "New Cuisine Type" button
2. System opens create cuisine dialog
3. System displays form with fields:
   - Name (required, text input)
   - Code (required, text input, uppercase)
   - Description (required, textarea)
   - Region (required, dropdown)
   - Status (optional, dropdown, default: active)
   - Popular Dishes (optional, comma-separated)
   - Key Ingredients (optional, comma-separated)
4. User enters cuisine name: "Thai"
5. System auto-suggests code: "THA"
6. User accepts suggested code
7. User enters description: "Flavorful Thai cooking traditions featuring aromatic herbs and spices"
8. User selects region: "Asia"
9. User enters popular dishes: "Pad Thai, Green Curry, Tom Yum"
10. User enters key ingredients: "Lemongrass, Coconut Milk, Fish Sauce, Thai Basil"
11. System validates all inputs in real-time
12. System shows validation feedback (green checkmarks)
13. User clicks "Create Cuisine Type" button
14. System validates all fields
15. System checks code uniqueness
16. System checks name uniqueness (case-insensitive)
17. System parses comma-separated lists into arrays
18. System creates cuisine record with:
    - Generated ID
    - User input data
    - Status: active
    - Sort order: 0
    - Recipe counts: 0
    - Created by: current user ID
    - Created at: current timestamp
19. System saves to database
20. System revalidates cuisine list route
21. System closes dialog
22. System displays success toast: "Cuisine type 'Thai' created successfully"
23. System refreshes cuisine list
24. System highlights newly created cuisine (3-second highlight)
25. New cuisine appears at appropriate position

**Alternative Flows**:

**A1: Auto-generate Code from Name**
1. At step 4, user enters name: "Italian Coastal"
2. At step 5, system auto-generates code: "ITA-COASTAL"
3. User modifies code to: "ITA_COAST"
4. System validates modified code
5. Flow continues at step 7

**A2: Cancel Creation**
1. At any step before step 13
2. User clicks "Cancel" button
3. System confirms: "Discard changes?"
4. User confirms
5. System closes dialog without saving
6. System returns to cuisine list

**A3: Required Field Missing**
1. At step 13, user clicks create button
2. System detects empty required field
3. System shows validation error on field
4. System scrolls to first error
5. System keeps dialog open
6. User fills missing field
7. Flow resumes at step 13

**A4: Select Different Region**
1. At step 8, user initially selects "Europe"
2. User reconsiders and changes to "Asia"
3. System updates region selection
4. Flow continues normally

**Exception Flows**:

**E1: Duplicate Code**
1. At step 15, system finds existing cuisine with code "THA"
2. System shows error: "Cuisine code 'THA' is already used by 'Thai Traditional'"
3. System highlights code field in red
4. System suggests alternative: "THA-NEW" or "THAI"
5. User enters different code: "THA-MOD"
6. System validates new code
7. Flow resumes at step 16

**E2: Duplicate Name**
1. At step 16, system finds existing cuisine with name "Thai" (case-insensitive)
2. System shows error: "Cuisine name 'Thai' is already in use"
3. System highlights name field in red
4. User modifies name to: "Thai Modern"
5. System validates new name
6. Flow resumes at step 17

**E3: Invalid Code Format**
1. At step 6, user enters code with lowercase: "tha"
2. System automatically converts to uppercase: "THA"
3. System shows info message: "Code converted to uppercase"
4. Flow continues normally

**E4: Description Too Short**
1. At step 7, user enters: "Thai food"
2. System shows validation error: "Description must be at least 10 characters"
3. System shows character count: "9/10 minimum"
4. User adds more text
5. System validates and shows checkmark
6. Flow continues

**E5: Too Many Popular Dishes**
1. At step 9, user enters 25 comma-separated dishes
2. System validates and shows warning: "Maximum 20 popular dishes allowed. First 20 will be saved."
3. System truncates to first 20
4. User acknowledges
5. Flow continues

**E6: Database Error During Save**
1. At step 19, database save operation fails
2. System catches error
3. System rolls back transaction
4. System shows error toast: "Failed to create cuisine. Please try again."
5. System keeps dialog open with entered data
6. System logs error for investigation
7. User can retry or cancel

**Business Rules Applied**:
- BR-CUI-001: Cuisine code must be unique
- BR-CUI-002: Cuisine name must be unique (case-insensitive)
- BR-CUI-003: Region must be valid enum value
- BR-CUI-004: Code format validation (uppercase, alphanumeric, hyphens, underscores)
- BR-CUI-008: Popular dishes stored as array (max 20)
- BR-CUI-009: Key ingredients stored as array (max 30)
- BR-CUI-010: Name format validation
- BR-CUI-011: Description minimum length (10 characters)

**Performance Requirements**:
- Dialog opens: ≤ 200ms
- Real-time validation: ≤ 100ms per field
- Code uniqueness check: ≤ 500ms (debounced)
- Name uniqueness check: ≤ 500ms (debounced)
- Save operation: ≤ 1 second
- List refresh: ≤ 500ms

**Acceptance Criteria**:
- ✓ Dialog opens with blank form
- ✓ All required fields marked clearly
- ✓ Auto-suggest code from name
- ✓ Real-time validation feedback
- ✓ Duplicate code detection works
- ✓ Duplicate name detection works (case-insensitive)
- ✓ Code auto-converts to uppercase
- ✓ Comma-separated lists parse correctly
- ✓ Success message shows after creation
- ✓ New cuisine appears in list
- ✓ New cuisine highlighted briefly
- ✓ Recipe counts initialize to zero
- ✓ Audit trail records creation
- ✓ Cancel discards changes
- ✓ Validation prevents invalid submissions

---

### UC-CUI-005: Edit Existing Cuisine Type

**Description**: User modifies an existing cuisine type's information.

**Actor**: Head Chef, Recipe Manager, Sous Chef

**Priority**: High

**Frequency**: Weekly

**Preconditions**:
- User is authenticated
- User has `cuisine.update` permission
- User is viewing cuisine types list
- At least one cuisine type exists

**Postconditions**:
- Cuisine type is updated with new values
- Changes reflect immediately in list
- Audit trail records update
- Recipe associations remain intact

**Main Flow**:
1. User locates cuisine to edit in list
2. User clicks actions menu (three dots) on cuisine row
3. System shows dropdown menu
4. User clicks "Edit" option
5. System opens edit cuisine dialog
6. System pre-fills form with current values:
   - Name: "Italian"
   - Code: "ITA"
   - Description: "Traditional Italian cuisine..."
   - Region: "Europe"
   - Status: "Active"
   - Popular Dishes: "Pizza, Pasta, Risotto"
   - Key Ingredients: "Olive Oil, Tomatoes, Basil"
7. User modifies description to add more detail
8. User updates popular dishes: "Pizza Margherita, Pasta Carbonara, Risotto Milanese, Tiramisu"
9. System validates changes in real-time
10. User clicks "Save Changes" button
11. System validates all fields
12. System checks code uniqueness (excluding current cuisine)
13. System checks name uniqueness (excluding current cuisine)
14. System parses updated comma-separated lists
15. System updates cuisine record:
    - Modified fields only
    - Updated by: current user ID
    - Updated at: current timestamp
    - Last updated: current date (formatted)
16. System saves to database
17. System revalidates cuisine list route
18. System closes dialog
19. System displays success toast: "Cuisine type 'Italian' updated successfully"
20. System refreshes cuisine list
21. System highlights updated cuisine (3-second highlight)
22. Updated values appear in list

**Alternative Flows**:

**A1: Change Status to Inactive**
1. At step 7, user changes status from "Active" to "Inactive"
2. System checks if cuisine has active recipes
3. System finds 15 active recipes
4. System shows warning banner:
   "⚠️ This cuisine has 15 active recipe(s). Deactivating will prevent new recipes from using this cuisine. Existing recipes will remain active."
5. User acknowledges warning
6. User continues with save
7. System updates status to inactive
8. System logs status change
9. Flow continues at step 16

**A2: Modify Code**
1. At step 7, user changes code from "ITA" to "ITA-TRAD"
2. System shows warning banner:
   "⚠️ Changing the code may affect integrations and reports. Verify all dependent systems before changing."
3. User acknowledges warning
4. System validates new code format
5. System checks new code uniqueness
6. Flow continues at step 11

**A3: Cancel Edit**
1. At any step before step 10
2. User has made changes
3. User clicks "Cancel" button
4. System detects unsaved changes
5. System confirms: "Discard changes to 'Italian'?"
6. User confirms
7. System closes dialog without saving
8. System returns to cuisine list (no changes)

**A4: No Changes Made**
1. At step 10, user clicks save
2. System detects no fields were modified
3. System shows info message: "No changes to save"
4. System closes dialog
5. No database update occurs
6. No audit trail entry created

**Exception Flows**:

**E1: Duplicate Code (Different Cuisine)**
1. At step 12, user changed code to "FRA"
2. System finds existing cuisine "French" with code "FRA"
3. System shows error: "Cuisine code 'FRA' is already used by 'French'"
4. System highlights code field
5. System keeps dialog open
6. User changes to different code: "ITA-CLASSIC"
7. System validates and accepts
8. Flow resumes at step 13

**E2: Duplicate Name (Different Cuisine)**
1. At step 13, user changed name to "French"
2. System finds existing cuisine with name "French"
3. System shows error: "Cuisine name 'French' is already in use"
4. System highlights name field
5. System keeps dialog open
6. User changes name back or to different value
7. Flow resumes at step 14

**E3: Invalid Edit (Active Recipes Block)**
1. This scenario does NOT apply to cuisine edits
2. Unlike categories, cuisines can be edited with active recipes
3. Only warnings are shown, no blocking

**E4: Database Update Fails**
1. At step 16, database update fails
2. System catches error
3. System rolls back transaction
4. System shows error toast: "Failed to update cuisine. Please try again."
5. System keeps dialog open with changes
6. System logs error
7. User can retry or cancel

**E5: Concurrent Edit Conflict**
1. At step 16, system detects cuisine was modified by another user
2. System shows conflict message:
   "This cuisine was recently updated by {user} at {time}. Your changes may overwrite theirs."
3. System offers options:
   - "Reload and lose my changes"
   - "Save anyway (overwrite)"
   - "Cancel"
4. User chooses option
5. System proceeds based on choice

**Business Rules Applied**:
- BR-CUI-001: Code uniqueness (excluding current cuisine)
- BR-CUI-002: Name uniqueness (excluding current cuisine)
- BR-CUI-004: Code format validation
- BR-CUI-007: Status change warnings for active recipes
- BR-CUI-010: Name format validation
- BR-CUI-011: Description minimum length

**Performance Requirements**:
- Dialog opens: ≤ 200ms
- Form pre-fill: immediate
- Real-time validation: ≤ 100ms per field
- Save operation: ≤ 1 second
- List refresh: ≤ 500ms

**Acceptance Criteria**:
- ✓ Dialog opens with current values
- ✓ All fields editable
- ✓ Real-time validation active
- ✓ Warning shown for status change if has recipes
- ✓ Warning shown for code change
- ✓ Duplicate detection excludes current cuisine
- ✓ No changes detected prevents unnecessary save
- ✓ Success message shows after update
- ✓ Updated values reflect immediately
- ✓ Audit trail records update
- ✓ Cancel discards changes
- ✓ Concurrent edit conflict detected

---

### UC-CUI-006: View Cuisine Type Details

**Description**: User views comprehensive details of a specific cuisine type.

**Actor**: All Users

**Priority**: Medium

**Frequency**: Daily

**Preconditions**:
- User is authenticated
- User has `cuisine.view` permission
- User is viewing cuisine types list
- Cuisine type exists

**Postconditions**:
- Full cuisine details displayed
- User can navigate to related recipes
- User can perform actions from detail view

**Main Flow**:
1. User locates cuisine in list
2. User clicks on cuisine name (clickable link)
3. System opens detail view dialog
4. System fetches complete cuisine data
5. System fetches associated recipe summary (top 10)
6. System displays cuisine details:

**Basic Information Section**:
   - Name (large heading)
   - Code (badge)
   - Status (badge with color)
   - Region (with region icon)
   - Description (full text)

**Characteristics Section**:
   - Popular Dishes (list with check icons)
   - Key Ingredients (tags)

**Metrics Section**:
   - Total Recipes: {count}
   - Active Recipes: {count} ({percentage}%)
   - Inactive Recipes: {count}
   - Last Updated: {date and time}

**Recent Recipes Section** (top 10):
   - Recipe name
   - Recipe code
   - Status
   - Cost
   - Link to recipe details

**Audit Trail Section**:
   - Created by: {user name}
   - Created at: {date and time}
   - Last modified by: {user name}
   - Last modified at: {date and time}

7. User reviews information
8. User clicks "Close" or X button
9. System closes detail view
10. System returns to cuisine list

**Alternative Flows**:

**A1: View Associated Recipe**
1. At step 6, user views Recent Recipes section
2. User clicks on recipe name link
3. System opens recipe detail view (new dialog)
4. User views recipe details
5. User closes recipe dialog
6. System returns to cuisine detail view

**A2: Edit from Detail View**
1. At step 6, user sees "Edit" button in detail dialog
2. User clicks "Edit" button
3. System closes detail view
4. System opens edit dialog (UC-CUI-005)
5. Flow continues in UC-CUI-005

**A3: Delete from Detail View**
1. At step 6, user sees "Delete" button
2. User clicks "Delete" button
3. System confirms deletion
4. System proceeds with UC-CUI-007 (Delete Cuisine)

**A4: No Recipes Associated**
1. At step 6, cuisine has zero recipes
2. System shows empty state in Recent Recipes:
   "No recipes associated with this cuisine yet."
3. System shows "Create Recipe" button
4. User can create new recipe with this cuisine

**A5: View All Recipes**
1. At step 6, cuisine has >10 recipes
2. System shows "View All {count} Recipes" link
3. User clicks link
4. System navigates to Recipes page with cuisine filter applied
5. All recipes for this cuisine displayed

**Exception Flows**:

**E1: Cuisine Not Found**
1. At step 4, cuisine ID not found in database
2. System shows error: "Cuisine not found. It may have been deleted."
3. System closes detail dialog
4. System refreshes cuisine list
5. System removes deleted cuisine if present

**E2: Recipe Load Fails**
1. At step 5, recipe fetch fails
2. System shows error in Recent Recipes section:
   "Unable to load recipes. Please try again."
3. System shows retry button
4. Rest of cuisine details still display
5. User can retry or close

**Business Rules Applied**:
- BR-CUI-013: Recipe counts calculated from Recipe table
- Only top 10 most recent recipes shown
- Audit trail shows complete history

**Performance Requirements**:
- Detail dialog opens: ≤ 500ms
- Recipe fetch: ≤ 1 second
- Dialog remains responsive during recipe load

**Acceptance Criteria**:
- ✓ All cuisine details display correctly
- ✓ Recipe counts are accurate
- ✓ Top 10 recent recipes shown
- ✓ Audit trail complete
- ✓ Links to recipes work
- ✓ Edit/Delete actions available
- ✓ Empty state for no recipes
- ✓ Error handling for missing data
- ✓ Close returns to list

---

### UC-CUI-007: Delete Cuisine Type

**Description**: User deletes a cuisine type with safety checks for data integrity.

**Actor**: Head Chef, Recipe Manager

**Priority**: Medium

**Frequency**: Monthly

**Preconditions**:
- User is authenticated
- User has `cuisine.delete` permission
- User is viewing cuisine types list
- Cuisine type exists

**Postconditions**:
- Cuisine type is deleted from database (if allowed)
- Or deletion is blocked with clear reason
- Audit trail records deletion attempt
- List refreshes without deleted cuisine

**Main Flow**:
1. User locates cuisine to delete
2. User clicks actions menu on cuisine row
3. System shows dropdown menu
4. User clicks "Delete" option
5. System performs safety checks:
   - Counts active recipes using this cuisine
   - Counts inactive recipes using this cuisine
   - Checks for historical references
6. System finds 0 active recipes and 0 inactive recipes
7. System opens delete confirmation dialog
8. System displays:
   - Title: "Delete Cuisine Type"
   - Message: "Are you sure you want to delete '{name}'? This action cannot be undone."
   - Cuisine details (name, code, region)
   - Warning: "This will permanently remove the cuisine from the system."
9. System shows two buttons:
   - "Cancel" (outlined, default focused)
   - "Delete" (destructive red)
10. User clicks "Delete" button
11. System deletes cuisine record from database
12. System logs deletion in audit trail
13. System closes confirmation dialog
14. System displays success toast: "Cuisine type '{name}' deleted successfully"
15. System refreshes cuisine list
16. Deleted cuisine no longer appears in list

**Alternative Flows**:

**A1: Cancel Deletion**
1. At step 10, user clicks "Cancel" button
2. System closes dialog without deleting
3. System returns to cuisine list (no changes)

**A2: Close Dialog Without Action**
1. At step 10, user clicks X button or clicks outside dialog
2. System treats as cancel
3. System closes dialog without deleting
4. System returns to cuisine list

**Exception Flows**:

**E1: Active Recipes Exist (BLOCKING)**
1. At step 5, system finds 8 active recipes
2. System determines deletion is blocked
3. System opens error dialog:
   - Title: "Cannot Delete Cuisine Type"
   - Message: "This cuisine has 8 active recipe(s) and cannot be deleted."
   - Details: Shows list of affected recipes (up to 5, with "and 3 more")
   - Required Action: "Please reassign or deactivate these recipes first."
4. System shows buttons:
   - "View Recipes" - Opens recipes filtered by this cuisine
   - "Close" - Returns to list
5. User must reassign/deactivate recipes before deletion possible
6. Deletion is blocked

**E2: Inactive Recipes Exist (WARNING)**
1. At step 5, system finds 0 active recipes but 12 inactive recipes
2. System allows deletion with warning
3. System opens confirmation dialog with warning:
   - Title: "Delete Cuisine Type"
   - Warning: "⚠️ This cuisine has 12 inactive recipe(s) that will be reassigned to 'Uncategorized'."
   - Message: "Are you sure you want to proceed?"
   - Cuisine details
4. System shows checkbox: "I understand the impact" (must check to enable Delete)
5. System shows buttons:
   - "Cancel"
   - "Delete Anyway" (disabled until checkbox checked)
6. User checks checkbox
7. System enables "Delete Anyway" button
8. User clicks "Delete Anyway"
9. System deletes cuisine
10. System reassigns inactive recipes to "Uncategorized" cuisine
11. System logs reassignment in audit trail
12. Flow continues at step 13 of main flow

**E3: Both Active and Inactive Recipes**
1. At step 5, system finds 5 active and 8 inactive recipes
2. System blocks deletion (active recipes take precedence)
3. System shows error dialog similar to E1
4. Message includes: "This cuisine has 5 active and 8 inactive recipes."
5. Deletion blocked until active recipes reassigned

**E4: Database Error During Deletion**
1. At step 11, database delete operation fails
2. System catches error
3. System shows error toast: "Failed to delete cuisine. Please try again."
4. System keeps cuisine in list
5. System logs error for investigation
6. User can retry deletion

**E5: Concurrent Deletion**
1. At step 11, another user already deleted the cuisine
2. System receives "record not found" error
3. System shows info message: "This cuisine was already deleted by another user."
4. System refreshes list
5. Cuisine no longer appears

**Business Rules Applied**:
- BR-CUI-005: Cannot delete with active recipes (BLOCKING)
- BR-CUI-006: Warn when deleting with inactive recipes
- Inactive recipes reassigned to "Uncategorized"
- Deletion requires explicit confirmation
- Audit trail records all deletion attempts

**Performance Requirements**:
- Safety check: ≤ 1 second
- Dialog opens: immediate
- Delete operation: ≤ 2 seconds
- List refresh: ≤ 500ms

**Acceptance Criteria**:
- ✓ Deletion blocked if active recipes exist
- ✓ Warning shown if inactive recipes exist
- ✓ Confirmation required for deletion
- ✓ Cancel prevents deletion
- ✓ Success message after deletion
- ✓ Cuisine removed from list
- ✓ Inactive recipes reassigned correctly
- ✓ Audit trail records deletion
- ✓ Error handling for failures
- ✓ Concurrent deletion handled gracefully

---

### UC-CUI-008: Bulk Select Cuisine Types

**Description**: User selects multiple cuisine types for bulk operations.

**Actor**: All Users

**Priority**: Medium

**Frequency**: Weekly

**Preconditions**:
- User is viewing cuisine types list
- At least one cuisine type is visible

**Postconditions**:
- Selected cuisines are visually highlighted
- Selection count displayed
- Bulk actions toolbar appears
- Selection state maintained during filtering

**Main Flow**:
1. User views cuisine list in table view
2. System shows checkbox column on left
3. User clicks checkbox next to first cuisine
4. System checks checkbox
5. System highlights cuisine row with muted background
6. System increments selection count: "1 selected"
7. System shows bulk actions toolbar
8. User clicks checkboxes next to 4 more cuisines
9. System checks all selected checkboxes
10. System highlights all selected rows
11. System updates count: "5 selected"
12. System keeps bulk actions toolbar visible
13. User can proceed with bulk operations (UC-CUI-009)

**Alternative Flows**:

**A1: Select All Visible Cuisines**
1. At step 2, user clicks "Select All" checkbox in table header
2. System checks header checkbox
3. System selects all currently visible cuisines (after filters)
4. System highlights all visible rows
5. System shows count: "{count} selected"
6. System shows bulk actions toolbar

**A2: Select All with Filters Active**
1. Filters are applied, showing 15 of 50 cuisines
2. User clicks "Select All" in header
3. System selects only the 15 filtered cuisines
4. System shows: "15 selected"
5. System shows info tooltip: "Selected filtered cuisines only"

**A3: Deselect Individual Cuisine**
1. Multiple cuisines are selected
2. User clicks checked checkbox next to one cuisine
3. System unchecks that checkbox
4. System removes highlight from that row
5. System decrements count: "{count-1} selected"
6. If count reaches 0, toolbar disappears

**A4: Deselect All**
1. Multiple cuisines are selected
2. User clicks "Clear Selection" button in toolbar
3. System unchecks all checkboxes
4. System removes all highlights
5. System hides bulk actions toolbar
6. Count resets to 0

**A5: Selection with Pagination**
1. List has pagination (50+ cuisines)
2. User selects cuisines on page 1
3. User navigates to page 2
4. System maintains selection from page 1
5. User selects additional cuisines on page 2
6. Count includes selections from both pages
7. System tracks selections across pages

**A6: Selection Persists During Filtering**
1. User has 10 cuisines selected
2. User applies filter
3. 3 of the 10 selected cuisines match filter
4. System shows 3 selected cuisines with checkmarks
5. System preserves selection of filtered-out 7 cuisines
6. When filter removed, all 10 selections restore

**Exception Flows**:

**E1: Maximum Selection Limit**
1. User attempts to select 101st cuisine
2. System shows warning toast: "Maximum 100 cuisines can be selected at once"
3. System does not select the 101st item
4. Selection count remains at 100
5. User must deselect items to select others

**E2: Select Deleted Cuisine**
1. Cuisine is selected
2. Another user deletes that cuisine
3. System detects cuisine no longer exists
4. System removes from selection
5. System shows info: "1 selected cuisine was deleted by another user"
6. System decrements count

**Business Rules Applied**:
- Maximum 100 cuisines can be selected at once
- Select All applies to filtered results only
- Selection state persists during filtering and pagination

**Performance Requirements**:
- Checkbox interaction: immediate (<50ms)
- Select all (100 items): ≤ 200ms
- Highlight updates: immediate, no lag
- Smooth interaction with large lists

**Acceptance Criteria**:
- ✓ Individual checkbox selection works
- ✓ Select All selects visible cuisines only
- ✓ Selection highlights rows clearly
- ✓ Count displays accurately
- ✓ Bulk toolbar appears/disappears correctly
- ✓ Clear selection removes all selections
- ✓ Selection persists during filtering
- ✓ Selection tracked across pages
- ✓ Maximum 100 selection limit enforced
- ✓ Deselection works correctly

---

### UC-CUI-009: Bulk Operations

**Description**: User performs operations on multiple selected cuisine types simultaneously.

**Actor**: Head Chef, Recipe Manager

**Priority**: Medium

**Frequency**: Monthly

**Preconditions**:
- User has `cuisine.update` permission (for activate/deactivate)
- User has `cuisine.delete` permission (for bulk delete)
- User has selected 2+ cuisine types (UC-CUI-008)
- Bulk actions toolbar is visible

**Postconditions**:
- Operation applied to all valid selected cuisines
- Invalid selections skipped with reason
- Success/error summary displayed
- Selection cleared after operation
- List refreshes with updated data

**Main Flow - Bulk Activate**:
1. User has 5 cuisines selected
2. System shows bulk actions toolbar with buttons:
   - Activate
   - Deactivate
   - Export Selected
   - Delete Selected
3. User clicks "Activate" button
4. System opens bulk activate confirmation:
   - Title: "Activate Cuisines"
   - Message: "Activate 5 selected cuisine types?"
   - List of selected cuisines (names)
5. User clicks "Activate" button
6. System performs validation:
   - Checks each cuisine's current status
   - Identifies already-active cuisines (skip)
7. System finds 3 inactive, 2 already active
8. System updates 3 cuisines to active status
9. System logs changes in audit trail
10. System closes dialog
11. System shows success toast: "3 cuisines activated successfully. 2 were already active."
12. System clears selection
13. System hides bulk toolbar
14. System refreshes list with updated statuses

**Alternative Flows**:

**A1: Bulk Deactivate**
1. At step 3, user clicks "Deactivate" button
2. System validates each selected cuisine:
   - Checks for active recipes
   - Identifies blocking conditions
3. System finds:
   - 2 cuisines safe to deactivate (0 active recipes)
   - 3 cuisines blocked (have active recipes)
4. System shows dialog:
   - Title: "Deactivate Cuisines"
   - Success count: "2 cuisines can be deactivated"
   - Blocked count: "3 cuisines have active recipes and cannot be deactivated:"
   - Lists blocked cuisines with recipe counts
5. System offers options:
   - "Deactivate Safe Cuisines Only" - Proceeds with 2
   - "Cancel" - No action
6. User clicks "Deactivate Safe Cuisines Only"
7. System deactivates 2 cuisines
8. System logs changes
9. System shows result: "2 cuisines deactivated. 3 skipped due to active recipes."
10. Flow continues at step 12 of main flow

**A2: Bulk Export Selected**
1. At step 3, user clicks "Export Selected" button
2. System opens export dialog
3. System shows format options:
   - CSV
   - Excel (XLSX)
   - PDF
4. User selects "Excel"
5. System generates Excel file with selected cuisines
6. System includes all cuisine data fields
7. System downloads file: "cuisines_export_{timestamp}.xlsx"
8. System shows success toast: "5 cuisines exported successfully"
9. Selection remains active (not cleared)
10. User can perform additional actions

**A3: Bulk Delete Selected**
1. At step 3, user clicks "Delete Selected" button
2. System validates each selected cuisine:
   - Checks for active recipes (BLOCKING)
   - Checks for inactive recipes (WARNING)
3. System finds:
   - 1 cuisine with 8 active recipes (BLOCKED)
   - 2 cuisines with inactive recipes only (WARNING)
   - 2 cuisines with no recipes (SAFE)
4. System shows detailed dialog:
   - Title: "Delete Cuisines"
   - Blocked section: "Cannot delete 1 cuisine:" with details
   - Warning section: "2 cuisines have inactive recipes (will be reassigned)"
   - Safe section: "2 cuisines can be safely deleted"
5. System offers options:
   - "Delete Safe Cuisines Only" (2 cuisines)
   - "Delete Safe + Warned" (4 cuisines, requires confirmation checkbox)
   - "Cancel"
6. User selects "Delete Safe + Warned"
7. System requires checkbox: "I understand inactive recipes will be reassigned"
8. User checks box
9. User clicks confirm
10. System deletes 4 cuisines
11. System reassigns inactive recipes to "Uncategorized"
12. System shows result: "4 cuisines deleted. 1 skipped due to active recipes. 12 inactive recipes reassigned."
13. Flow continues at step 12 of main flow

**A4: Cancel Bulk Operation**
1. At any confirmation dialog
2. User clicks "Cancel" button
3. System closes dialog without action
4. System maintains current selection
5. User returns to list with bulk toolbar visible

**Exception Flows**:

**E1: All Selections Invalid for Operation**
1. User selects 5 cuisines
2. User clicks "Deactivate"
3. System checks all 5 cuisines
4. All 5 have active recipes (cannot deactivate)
5. System shows error dialog:
   - "Cannot deactivate any selected cuisines"
   - "All 5 selected cuisines have active recipes"
   - Lists cuisines with recipe counts
6. System offers "Close" button only
7. No changes made
8. Selection remains active

**E2: Partial Bulk Operation Failure**
1. User confirms bulk activate for 10 cuisines
2. System begins update process
3. After updating 6 cuisines, database error occurs
4. System rolls back 6 updates (transaction)
5. System shows error: "Operation failed. Changes were not saved. Please try again."
6. System keeps all 10 cuisines selected
7. User can retry operation

**E3: Network Timeout During Bulk Operation**
1. User confirms bulk operation
2. Network connection lost during processing
3. System shows error: "Connection lost. Some changes may not have been saved."
4. System suggests: "Refresh the page to see current state"
5. User refreshes page
6. System shows updated state based on what was saved

**Business Rules Applied**:
- BR-CUI-005: Cannot delete cuisines with active recipes
- BR-CUI-006: Warn when deleting with inactive recipes
- BR-CUI-007: Can deactivate only if no active recipes
- Maximum 100 selections for bulk operations
- Bulk operations are atomic (all or nothing)

**Performance Requirements**:
- Validation (100 items): ≤ 3 seconds
- Bulk update (100 items): ≤ 5 seconds
- Bulk delete (100 items): ≤ 5 seconds
- Export (100 items): ≤ 3 seconds

**Acceptance Criteria**:
- ✓ Bulk activate works for inactive cuisines
- ✓ Bulk deactivate validates active recipes
- ✓ Bulk delete validates and warns appropriately
- ✓ Bulk export downloads correct data
- ✓ Invalid items skipped with explanation
- ✓ Success/error summary shows counts
- ✓ Selection cleared after successful operation
- ✓ Partial failures handled gracefully
- ✓ Transaction rollback on errors
- ✓ Audit trail records all changes

---

### UC-CUI-010: Export Cuisine Types

**Description**: User exports cuisine type data to external file formats.

**Actor**: All Users

**Priority**: Low

**Frequency**: Weekly

**Preconditions**:
- User is authenticated
- User has `cuisine.export` permission
- User is viewing cuisine types list

**Postconditions**:
- Export file downloaded to user's device
- File contains requested cuisine data
- Export logged in audit trail
- Original data unchanged

**Main Flow**:
1. User views cuisine list
2. User clicks "Export" button in primary toolbar
3. System opens export dialog
4. System shows export options:

**Format Selection**:
   - CSV (Comma-Separated Values)
   - Excel (XLSX)
   - PDF (Formatted Report)

**Scope Selection**:
   - Export All (all cuisines, ignoring filters)
   - Export Filtered (currently filtered cuisines)
   - Export Selected (requires selections via UC-CUI-008)

**Field Selection** (checkboxes):
   - Basic Info: Name, Code, Description, Region, Status
   - Characteristics: Popular Dishes, Key Ingredients
   - Metrics: Recipe Count, Active Recipe Count
   - Audit: Created By, Created At, Updated By, Updated At

5. User selects format: "Excel"
6. User selects scope: "Export Filtered" (35 cuisines match filters)
7. User selects fields: All checkboxes checked
8. System shows preview count: "35 cuisines will be exported"
9. User clicks "Export" button
10. System generates Excel file:
    - Sheet name: "Cuisine Types"
    - Headers in bold
    - Data rows with selected fields
    - Formatted dates and numbers
    - Auto-sized columns
11. System triggers download: "cuisine_types_20240115_143022.xlsx"
12. System logs export in audit trail
13. System shows success toast: "35 cuisines exported successfully"
14. System closes export dialog
15. User saves file to desired location

**Alternative Flows**:

**A1: Export as CSV**
1. At step 5, user selects format: "CSV"
2. System notes CSV format selection
3. At step 10, system generates CSV file:
   - UTF-8 encoding
   - Comma delimiters
   - Quoted text fields
   - Arrays as comma-separated within quotes
4. System downloads: "cuisine_types_20240115_143022.csv"
5. Flow continues at step 13

**A2: Export as PDF**
1. At step 5, user selects format: "PDF"
2. System shows additional PDF options:
   - Page Size: A4 / Letter
   - Orientation: Portrait / Landscape
   - Include Logo: Yes / No
3. User selects: Letter, Landscape, Include Logo
4. At step 10, system generates formatted PDF:
   - Header with logo and title
   - Table with cuisines
   - Page numbers
   - Generation timestamp
5. System downloads: "cuisine_types_20240115_143022.pdf"
6. Flow continues at step 13

**A3: Export Selected Only**
1. User has 8 cuisines selected (UC-CUI-008)
2. At step 3, system detects selection
3. At step 4, "Export Selected" is pre-selected
4. At step 8, preview shows: "8 cuisines will be exported"
5. Flow continues normally with 8 cuisines

**A4: Cancel Export**
1. At any step before step 9
2. User clicks "Cancel" button
3. System closes dialog without exporting
4. No file generated
5. No audit trail entry

**A5: Download Template**
1. At step 3, system shows "Download Template" link
2. User clicks template link
3. System downloads blank template file (Excel)
4. Template includes:
   - All field headers
   - Example row with sample data
   - Data validation rules in Excel
5. Export dialog remains open
6. User can use template for future imports

**Exception Flows**:

**E1: No Cuisines to Export**
1. At step 8, filters result in 0 cuisines
2. System shows warning: "No cuisines match your criteria"
3. System disables "Export" button
4. System suggests: "Adjust filters or select 'Export All'"
5. User must change scope or filters

**E2: Export Generation Fails**
1. At step 10, file generation fails
2. System catches error
3. System shows error toast: "Failed to generate export file. Please try again."
4. System keeps dialog open
5. System logs error for investigation
6. User can retry or cancel

**E3: Large Export Warning**
1. At step 8, user selects "Export All"
2. System counts 5,000+ cuisines
3. System shows warning:
   "Large export detected (5,000+ cuisines). This may take several minutes."
4. System offers options:
   - "Continue with Export"
   - "Apply Filters First"
   - "Cancel"
5. User chooses to continue
6. System shows progress bar during generation
7. Export completes when done

**E4: Browser Blocks Download**
1. At step 11, browser blocks download (popup blocker)
2. System detects block
3. System shows message: "Download blocked. Please allow downloads and retry."
4. System shows retry button
5. User allows downloads
6. User clicks retry
7. Download succeeds

**Business Rules Applied**:
- Export respects current filters when "Export Filtered" selected
- Maximum 10,000 cuisines per export
- Exported files include generation timestamp
- Arrays (popular dishes, key ingredients) formatted appropriately per format

**Performance Requirements**:
- Dialog opens: immediate
- Export preview: ≤ 1 second
- Generate file (1,000 cuisines): ≤ 5 seconds
- Generate file (10,000 cuisines): ≤ 30 seconds
- Download starts: immediate after generation

**Acceptance Criteria**:
- ✓ All format options work correctly
- ✓ All scope options apply correctly
- ✓ Field selection filters exported data
- ✓ CSV format properly formatted
- ✓ Excel format with formatting
- ✓ PDF format includes header/footer
- ✓ Preview shows accurate count
- ✓ Downloaded file has timestamp
- ✓ Audit trail logs export
- ✓ Large exports show progress
- ✓ Template download works
- ✓ Empty result handled gracefully

---

## 3. Use Case Matrix

### 3.1 Actor-Use Case Matrix

| Use Case | Head Chef | Sous Chef | Recipe Manager | Menu Planner | Report Analyst |
|----------|-----------|-----------|----------------|--------------|----------------|
| UC-CUI-001: View List | ✓ | ✓ | ✓ | ✓ | ✓ |
| UC-CUI-002: Search | ✓ | ✓ | ✓ | ✓ | ✓ |
| UC-CUI-003: Filter | ✓ | ✓ | ✓ | ✓ | ✓ |
| UC-CUI-004: Create | ✓ | | ✓ | | |
| UC-CUI-005: Edit | ✓ | ✓ | ✓ | | |
| UC-CUI-006: View Details | ✓ | ✓ | ✓ | ✓ | ✓ |
| UC-CUI-007: Delete | ✓ | | ✓ | | |
| UC-CUI-008: Bulk Select | ✓ | ✓ | ✓ | ✓ | ✓ |
| UC-CUI-009: Bulk Operations | ✓ | | ✓ | | |
| UC-CUI-010: Export | ✓ | ✓ | ✓ | ✓ | ✓ |

### 3.2 Use Case Dependencies

```
UC-CUI-001 (View List)
    ├─→ UC-CUI-002 (Search) [extends]
    ├─→ UC-CUI-003 (Filter) [extends]
    ├─→ UC-CUI-006 (View Details) [includes]
    ├─→ UC-CUI-008 (Bulk Select) [extends]
    └─→ UC-CUI-010 (Export) [extends]

UC-CUI-008 (Bulk Select)
    └─→ UC-CUI-009 (Bulk Operations) [enables]

UC-CUI-004 (Create)
    └─→ UC-CUI-005 (Edit) [similar flow]

UC-CUI-006 (View Details)
    ├─→ UC-CUI-005 (Edit) [includes]
    └─→ UC-CUI-007 (Delete) [includes]
```

### 3.3 Use Case Frequency Matrix

| Use Case | Daily | Weekly | Monthly | Quarterly |
|----------|-------|--------|---------|-----------|
| UC-CUI-001 | ✓ | | | |
| UC-CUI-002 | ✓ | | | |
| UC-CUI-003 | ✓ | | | |
| UC-CUI-004 | | ✓ | | |
| UC-CUI-005 | | ✓ | | |
| UC-CUI-006 | ✓ | | | |
| UC-CUI-007 | | | ✓ | |
| UC-CUI-008 | | ✓ | | |
| UC-CUI-009 | | | ✓ | |
| UC-CUI-010 | | ✓ | | |

---

## 4. Related Documentation

- **[BR-cuisine-types.md](./BR-cuisine-types.md)** - Business Requirements
- **TS-cuisine-types.md** - Technical Specification (to be created)
- **DS-cuisine-types.md** - Data Schema (to be created)
- **FD-cuisine-types.md** - Flow Diagrams (to be created)
- **VAL-cuisine-types.md** - Validations (to be created)

---
