# Recipe Cuisine Types - Business Requirements (BR)

## Document Information
- **Document Type**: Business Requirements Document
- **Module**: Operational Planning > Recipe Management > Cuisine Types
- **Version**: 2.0.0
- **Last Updated**: 2025-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-15 | System | Initial business requirements document created |
| 2.0.0 | 2025-01-16 | Development Team | Aligned with actual implementation: added country, typicalIngredients, cookingMethods, flavorProfile, spiceLevel, image, flag fields |


## 1. Overview

### 1.1 Purpose
This document defines the business requirements for the Recipe Cuisine Types management system within the Operational Planning module. Cuisine types categorize recipes by their culinary traditions, regional origins, and cooking styles, enabling better recipe organization and menu planning based on culinary themes.

### 1.2 Business Context
In hospitality operations, organizing recipes by cuisine type is essential for:
- **Menu Planning**: Creating diverse menus that showcase different culinary traditions
- **Guest Experience**: Meeting guest preferences and dietary expectations
- **Recipe Discovery**: Helping culinary teams find recipes based on cuisine style
- **Trend Analysis**: Tracking popularity and performance of different cuisines
- **Operational Efficiency**: Grouping recipes with similar ingredients and techniques

### 1.3 Scope
**In Scope**:
- Cuisine type creation, modification, and deletion
- Region-based categorization
- Popular dishes and key ingredients tracking
- Recipe count metrics and analytics
- Status management (active/inactive)
- Search and filtering capabilities
- Bulk operations
- Import/export functionality

**Out of Scope**:
- Recipe creation and management (separate submodule)
- Menu engineering and pricing (separate submodule)
- Ingredient procurement
- Kitchen operations and production
- Guest ordering and preferences

---

## 2. Functional Requirements

### FR-CUI-001: View Cuisine Types List
**Priority**: High
**Description**: Users shall be able to view a comprehensive list of all cuisine types with key information.

**Requirements**:
- Display cuisine types in table or grid view
- Show name, code, description, region, status
- Display recipe count metrics (total and active)
- Include last updated timestamp
- Support both list and grid view modes
- Minimum 48px row height for touch targets
- Responsive design for mobile, tablet, and desktop

**Acceptance Criteria**:
- List loads within 2 seconds
- All fields display correctly formatted data
- Grid view shows cards with essential information
- View mode preference is preserved during session

### FR-CUI-002: Search Cuisine Types
**Priority**: High
**Description**: Users shall be able to search for cuisine types using real-time text search.

**Requirements**:
- Search across name and code fields
- Real-time filtering as user types
- Case-insensitive search
- Debounced search input (300ms delay)
- Clear search button when text is present
- Search results update immediately

**Acceptance Criteria**:
- Search returns relevant results within 300ms
- Empty state shows helpful message
- Search works across all visible columns
- Search can be cleared with one click

### FR-CUI-003: Filter Cuisine Types
**Priority**: High
**Description**: Users shall be able to filter cuisine types using quick filters and advanced conditions.

**Quick Filters**:
- No Recipes: Cuisines with zero recipes
- Has Recipes: Cuisines with one or more recipes
- Asian: Cuisines from Asia region
- European: Cuisines from Europe region

**Advanced Filters**:
- Field selection: name, code, description, region, status, recipe count
- Operator selection: contains, equals, not equals, greater than, less than, is empty, is not empty
- Multiple filter conditions (AND logic)
- Add/remove filter conditions dynamically

**Acceptance Criteria**:
- Quick filters toggle on/off
- Multiple quick filters can be active simultaneously
- Advanced filters support up to 10 conditions
- Filter count badge shows number of active filters
- "Clear All Filters" removes all active filters
- Filters persist during session

### FR-CUI-004: Create New Cuisine Type
**Priority**: High
**Description**: Users with appropriate permissions shall be able to create new cuisine types.

**Required Fields**:
- Name (2-100 characters)
- Code (2-20 characters, uppercase)
- Description (10-500 characters)
- Region (predefined list)
- Status (active/inactive, default: active)

**Optional Fields**:
- Sort Order (default: 0)
- Popular Dishes (comma-separated list)
- Key Ingredients (comma-separated list)

**Business Rules**:
- Cuisine code must be unique
- Cuisine name must be unique (case-insensitive)
- Auto-generate code from name if not provided
- Default status is "active"
- Sort order determines display sequence

**Acceptance Criteria**:
- Creation dialog opens with blank form
- All validations execute before save
- Success message shows after creation
- List refreshes with new cuisine highlighted
- Duplicate code/name shows error message
- Created cuisine appears at appropriate position based on sort order

### FR-CUI-005: Edit Existing Cuisine Type
**Priority**: High
**Description**: Users with appropriate permissions shall be able to modify existing cuisine types.

**Editable Fields**:
- Name, Code, Description, Region, Status
- Sort Order
- Popular Dishes, Key Ingredients

**Restrictions**:
- Cannot change code if referenced by active recipes (show warning)
- Cannot change name to duplicate existing name
- Cannot change code to duplicate existing code

**Acceptance Criteria**:
- Edit dialog pre-fills with current values
- All validations execute before save
- Success message shows after update
- List refreshes with updated values
- Warning shown if change impacts active recipes
- Audit trail captures all changes

### FR-CUI-006: Delete Cuisine Type
**Priority**: Medium
**Description**: Users with appropriate permissions shall be able to delete cuisine types with safety checks.

**Safety Checks**:
- Cannot delete cuisine with active recipes (BLOCKING)
- Warn if cuisine has inactive recipes
- Warn if cuisine has been used historically

**Deletion Options**:
- Standard delete: Requires no active recipe dependencies
- Force delete: Requires explicit confirmation for warnings

**Acceptance Criteria**:
- Confirmation dialog shows before deletion
- Deletion blocked if active recipes exist
- Warning message lists impacted recipes
- Force delete requires checkbox confirmation
- Success message shows after deletion
- List refreshes without deleted cuisine
- Deleted cuisine removed from all associations

### FR-CUI-007: View Cuisine Type Details
**Priority**: Medium
**Description**: Users shall be able to view comprehensive details of any cuisine type.

**Display Information**:
- All basic fields (name, code, description, region, status)
- Recipe metrics (total, active, inactive)
- Popular dishes list
- Key ingredients list
- Audit information (created by, created date, last modified)
- Associated recipes (top 10)

**Acceptance Criteria**:
- Details dialog opens from list actions
- All information displays correctly formatted
- Recipe list links to recipe details
- Close button returns to list view

### FR-CUI-008: Bulk Select Cuisine Types
**Priority**: Medium
**Description**: Users shall be able to select multiple cuisine types for bulk operations.

**Selection Features**:
- Individual checkbox per cuisine
- "Select All" checkbox in table header
- Selected count indicator
- Visual highlight for selected items
- "Clear Selection" button

**Acceptance Criteria**:
- Checkbox selection works on first click
- Select All selects only filtered results
- Selected items persist during filtering
- Selection cleared after bulk operation completes
- Maximum 100 items can be selected at once

### FR-CUI-009: Bulk Operations
**Priority**: Medium
**Description**: Users shall be able to perform bulk operations on selected cuisine types.

**Supported Operations**:
- Bulk Activate: Set status to active for all selected
- Bulk Deactivate: Set status to inactive for all selected (with validation)
- Bulk Export: Export selected cuisines to CSV/Excel
- Bulk Delete: Delete multiple cuisines (with validation)

**Validation Rules**:
- Activate: No restrictions
- Deactivate: Block if any selected cuisine has active recipes
- Delete: Block if any selected cuisine has active recipes
- All operations require confirmation

**Acceptance Criteria**:
- Bulk action toolbar appears when items selected
- Operation applies to all selected items
- Validation errors list specific problem items
- Confirmation dialog shows count of affected items
- Success message shows count of successful operations
- Selection cleared after operation

### FR-CUI-010: Export Cuisine Types
**Priority**: Low
**Description**: Users shall be able to export cuisine type data in multiple formats.

**Export Formats**:
- CSV (Comma-Separated Values)
- Excel (XLSX)
- PDF (formatted report)

**Export Options**:
- Export all visible (after filters)
- Export selected only
- Export all cuisines

**Export Fields**:
- All basic fields
- Recipe count metrics
- Popular dishes and ingredients
- Audit information

**Acceptance Criteria**:
- Export dialog shows format and scope options
- Export completes within 5 seconds for up to 1000 cuisines
- File downloads with timestamp in filename
- Exported data matches current filters
- All selected fields present in export

### FR-CUI-011: Import Cuisine Types
**Priority**: Low
**Description**: Users shall be able to import cuisine types from external files.

**Supported Formats**:
- CSV (Comma-Separated Values)
- Excel (XLSX)

**Import Features**:
- Template download for correct format
- Validation before import
- Duplicate detection (by code)
- Error reporting with line numbers
- Preview before final import

**Import Modes**:
- Add New: Only create new cuisines (skip duplicates)
- Update Existing: Update cuisines with matching codes
- Add or Update: Create new or update existing

**Acceptance Criteria**:
- Template file downloads correctly formatted
- Validation errors show specific line numbers
- Preview shows all items to be imported
- Import completes with success/error summary
- Failed imports don't create partial data
- Import logged in audit trail

### FR-CUI-012: Print Cuisine Types
**Priority**: Low
**Description**: Users shall be able to print cuisine type lists and details.

**Print Layouts**:
- List view: Table format with essential columns
- Grid view: Card layout with key information
- Detail view: Single cuisine with all details

**Print Options**:
- Page orientation (portrait/landscape)
- Include/exclude filters applied
- Include header with timestamp and user

**Acceptance Criteria**:
- Print preview shows correctly formatted content
- Printed output matches screen display
- Page breaks occur at logical points
- Headers and footers include context information

---

## 3. Business Rules

### BR-CUI-001: Cuisine Code Uniqueness
**Rule**: Each cuisine type must have a unique code across the entire system.

**Rationale**: Codes are used as identifiers in integrations and references.

**Enforcement**:
- Client: Real-time validation during entry
- Server: Unique constraint validation
- Database: UNIQUE constraint on code column

**Error Message**: "Cuisine code '{code}' is already in use by '{name}'"

### BR-CUI-002: Cuisine Name Uniqueness
**Rule**: Each cuisine type must have a unique name (case-insensitive) across the entire system.

**Rationale**: Prevents confusion and ensures clear identification of cuisines.

**Enforcement**:
- Client: Real-time validation during entry
- Server: Case-insensitive uniqueness check
- Database: UNIQUE constraint with case-insensitive index

**Error Message**: "Cuisine name '{name}' is already in use"

### BR-CUI-003: Region Validation
**Rule**: Region must be one of the predefined valid regions.

**Valid Regions**:
- Asia
- Europe
- Americas
- Africa
- Middle East
- Oceania

**Rationale**: Standardized regions enable consistent reporting and analysis.

**Enforcement**:
- Client: Dropdown selection only
- Server: Enum validation
- Database: CHECK constraint

**Error Message**: "Invalid region. Must be one of: {valid regions}"

### BR-CUI-004: Code Format Validation
**Rule**: Cuisine code must contain only uppercase letters, numbers, hyphens, and underscores.

**Format Pattern**: `^[A-Z0-9\-_]+$`

**Examples**:
- Valid: "ITA", "CHN", "MEX-TRADITIONAL", "IND_NORTH"
- Invalid: "ita", "Italian", "MEX@", "中文"

**Rationale**: Ensures codes are suitable for URLs, file names, and system integrations.

**Enforcement**:
- Client: Pattern validation and auto-uppercase
- Server: Regex validation
- Database: CHECK constraint with regex

**Error Message**: "Code must contain only uppercase letters, numbers, hyphens, and underscores"

### BR-CUI-005: Deletion with Active Recipes (BLOCKING)
**Rule**: Cannot delete a cuisine type that has active recipes assigned to it.

**Rationale**: Prevents data integrity issues and broken recipe references.

**Required Action**: User must first reassign or deactivate all recipes

**Enforcement**:
- Client: Show error and block delete button
- Server: Count validation before deletion
- Database: RESTRICT foreign key constraint

**Error Message**: "Cannot delete cuisine type with {count} active recipe(s). Please reassign or deactivate recipes first."

### BR-CUI-006: Deletion with Inactive Recipes (WARNING)
**Rule**: Warn user when deleting a cuisine type that has inactive recipes.

**Rationale**: User should be aware of historical data impact.

**User Options**:
- Cancel deletion
- Proceed with deletion (inactive recipes reassigned to "Uncategorized")

**Enforcement**:
- Client: Show warning dialog with recipe count
- Server: Validation check with warning flag

**Warning Message**: "This cuisine has {count} inactive recipe(s) that will be reassigned to 'Uncategorized'. Continue?"

### BR-CUI-007: Status Change with Active Recipes
**Rule**: Can deactivate cuisine even with active recipes, but show warning.

**Rationale**: Allows operational flexibility while maintaining awareness.

**Impact**: Recipes remain active but cuisine marked inactive for new assignments.

**Enforcement**:
- Client: Show warning dialog with recipe count
- Server: Allow status change with logging

**Warning Message**: "This cuisine has {count} active recipe(s). Deactivating will prevent new recipes from using this cuisine."

### BR-CUI-008: Popular Dishes Format
**Rule**: Popular dishes must be stored as array of strings.

**Format**: Comma-separated values in UI, JSON array in database

**Validation**:
- Each dish name: 2-50 characters
- Maximum 20 dishes per cuisine
- Duplicate dish names removed automatically

**Enforcement**:
- Client: Parse comma-separated input
- Server: Validate array format and content
- Database: Store as JSON array

**Error Message**: "Each popular dish must be 2-50 characters. Maximum 20 dishes allowed."

### BR-CUI-009: Key Ingredients Format
**Rule**: Key ingredients must be stored as array of strings.

**Format**: Comma-separated values in UI, JSON array in database

**Validation**:
- Each ingredient: 2-50 characters
- Maximum 30 ingredients per cuisine
- Duplicate ingredients removed automatically

**Enforcement**:
- Client: Parse comma-separated input
- Server: Validate array format and content
- Database: Store as JSON array

**Error Message**: "Each key ingredient must be 2-50 characters. Maximum 30 ingredients allowed."

### BR-CUI-010: Name Format Validation
**Rule**: Cuisine name must contain only letters, numbers, spaces, hyphens, ampersands, apostrophes, and parentheses.

**Format Pattern**: `^[a-zA-Z0-9\s\-&'()]+$`

**Examples**:
- Valid: "Italian", "Chinese (Cantonese)", "Mexican - Traditional", "Chef's Special"
- Invalid: "Italian@", "Chinese#Cuisine", "Mexican|Style"

**Rationale**: Ensures names are suitable for display and reporting.

**Enforcement**:
- Client: Pattern validation with helpful message
- Server: Regex validation
- Database: No special constraint (text field)

**Error Message**: "Name can only contain letters, numbers, spaces, hyphens, ampersands, apostrophes, and parentheses"

### BR-CUI-011: Description Minimum Length
**Rule**: Description must be at least 10 characters to ensure meaningful content.

**Rationale**: Prevents low-quality or placeholder descriptions.

**Enforcement**:
- Client: Character count validation
- Server: Length validation
- Database: CHECK constraint

**Error Message**: "Description must be at least 10 characters"

### BR-CUI-012: Sort Order Uniqueness (RECOMMENDED)
**Rule**: Sort order values should be unique to ensure predictable ordering.

**Rationale**: Duplicate sort orders create ambiguous display sequence.

**Enforcement**:
- Client: Warning if duplicate sort order detected
- Server: No blocking validation (business rule)
- Database: No constraint (allows duplicates)

**Warning Message**: "Sort order {value} is already used. Consider using a unique value for predictable ordering."

### BR-CUI-013: Recipe Count Calculation
**Rule**: Recipe counts (total and active) must be automatically calculated from Recipe table.

**Calculation Logic**:
- `recipeCount`: COUNT of all recipes with this cuisine ID
- `activeRecipeCount`: COUNT of recipes with this cuisine ID AND status = 'active'

**Update Triggers**:
- When recipe is created
- When recipe cuisine is changed
- When recipe status is changed
- When recipe is deleted

**Enforcement**:
- Server: Calculated fields, not user-editable
- Database: Triggers update counts on recipe changes

**Validation**: Active count cannot exceed total count

---

## 4. Data Model

### 4.1 Cuisine Type Entity

```typescript
interface RecipeCuisine {
  // Identity
  id: string                    // Unique identifier (CUID)

  // Basic Information
  name: string                  // Cuisine name (2-100 chars, unique)
  code: string                  // Cuisine code (2-20 chars, unique, uppercase)
  description: string           // Description (10-500 chars)
  region: CuisineRegion         // Geographic region

  // Status
  status: CuisineStatus         // 'active' | 'inactive'
  sortOrder: number             // Display order (default: 0)

  // Characteristics
  popularDishes: string[]       // Array of popular dish names
  keyIngredients: string[]      // Array of key ingredients

  // Metrics (Calculated)
  recipeCount: number           // Total recipes with this cuisine
  activeRecipeCount: number     // Active recipes with this cuisine

  // Audit Trail
  createdAt: Date               // Creation timestamp
  createdBy: string             // User ID who created
  updatedAt: Date               // Last update timestamp
  updatedBy: string             // User ID who last updated
  lastUpdated: string           // Formatted last update date
}
```

### 4.2 Enumerations

```typescript
// Cuisine Status
enum CuisineStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

// Geographic Regions
enum CuisineRegion {
  ASIA = 'Asia',
  EUROPE = 'Europe',
  AMERICAS = 'Americas',
  AFRICA = 'Africa',
  MIDDLE_EAST = 'Middle East',
  OCEANIA = 'Oceania'
}
```

### 4.3 Input/Output Models

```typescript
// Create Cuisine Input
interface CreateCuisineInput {
  name: string
  code: string
  description: string
  region: CuisineRegion
  status?: CuisineStatus          // Default: 'active'
  sortOrder?: number              // Default: 0
  popularDishes?: string[]        // Default: []
  keyIngredients?: string[]       // Default: []
}

// Update Cuisine Input
interface UpdateCuisineInput {
  id: string                      // Required for update
  name?: string
  code?: string
  description?: string
  region?: CuisineRegion
  status?: CuisineStatus
  sortOrder?: number
  popularDishes?: string[]
  keyIngredients?: string[]
}

// Delete Cuisine Input
interface DeleteCuisineInput {
  id: string
  force?: boolean                 // Force delete despite warnings
}

// Filter Criteria
interface CuisineFilterCriteria {
  searchTerm?: string             // Search in name, code
  regions?: CuisineRegion[]       // Filter by regions
  status?: CuisineStatus[]        // Filter by status
  hasRecipes?: boolean            // Filter by recipe presence
  minRecipes?: number             // Minimum recipe count
  maxRecipes?: number             // Maximum recipe count
  customFilters?: FilterCondition[] // Advanced filters
}
```

---

## 5. Integration Points

### 5.1 Recipe Management System
**Integration Type**: Bidirectional

**Data Flow**:
- Cuisine types available for recipe assignment
- Recipe status changes trigger cuisine metric updates
- Recipe deletion triggers cuisine count recalculation

**Key Operations**:
- `GET /cuisines` - Retrieve cuisines for recipe forms
- `PUT /cuisines/{id}/metrics` - Update recipe counts
- `GET /cuisines/{id}/recipes` - List recipes for a cuisine

**Business Rules**:
- Cannot delete cuisine with active recipes
- Deactivating cuisine shows warning if has active recipes
- Recipe count updates trigger within 1 second

### 5.2 Menu Engineering System
**Integration Type**: One-way (Cuisine → Menu Engineering)

**Data Flow**:
- Cuisine types used for menu analysis by cuisine
- Popular dishes inform menu item suggestions
- Regional information aids menu planning

**Key Operations**:
- `GET /cuisines/{id}` - Retrieve cuisine details
- `GET /cuisines` - List all active cuisines
- `GET /cuisines/{id}/performance` - Cuisine sales performance

**Business Rules**:
- Only active cuisines appear in menu planning
- Cuisine changes reflect in menu reports immediately

### 5.3 Reporting & Analytics System
**Integration Type**: One-way (Cuisine → Reporting)

**Data Flow**:
- Cuisine data used for recipe distribution reports
- Regional analysis based on cuisine regions
- Trend analysis by cuisine popularity

**Key Operations**:
- `GET /cuisines/analytics` - Cuisine performance metrics
- `GET /cuisines/trends` - Popularity trends by cuisine
- `GET /cuisines/regional-analysis` - Regional breakdown

**Business Rules**:
- Reports include both active and inactive cuisines
- Historical data preserved even after deletion

### 5.4 User Management System
**Integration Type**: Bidirectional

**Data Flow**:
- User permissions control cuisine CRUD operations
- User IDs recorded in audit trail
- Role-based access to cuisine features

**Key Operations**:
- `GET /users/{id}/permissions` - Check cuisine permissions
- `POST /audit/cuisines` - Log cuisine operations

**Permissions Required**:
- `cuisine.view` - View cuisines
- `cuisine.create` - Create new cuisines
- `cuisine.update` - Modify existing cuisines
- `cuisine.delete` - Delete cuisines
- `cuisine.import` - Import cuisine data
- `cuisine.export` - Export cuisine data

---

## 6. Non-Functional Requirements

### 6.1 Performance
- **List Load Time**: Initial cuisine list load ≤ 2 seconds
- **Search Response**: Real-time search results ≤ 300ms
- **Filter Application**: Filter results appear ≤ 500ms
- **Create/Update**: Save operations complete ≤ 1 second
- **Delete Operation**: Deletion (with validation) ≤ 2 seconds
- **Bulk Operations**: Process up to 100 items ≤ 5 seconds
- **Export**: Generate export file ≤ 5 seconds for 1000 cuisines
- **Import**: Validate and import ≤ 10 seconds for 500 cuisines

### 6.2 Usability
- **Touch Targets**: Minimum 44x44 pixels for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility without mouse
- **Screen Reader**: Compatible with JAWS, NVDA, VoiceOver
- **Mobile**: Fully functional on 320px width devices
- **Error Messages**: Clear, actionable error messages within 150 characters
- **Help Text**: Context-sensitive help available for all fields
- **Undo**: Recent deletion can be undone within 30 seconds

### 6.3 Reliability
- **Availability**: 99.9% uptime (8.7 hours downtime per year)
- **Data Integrity**: Zero data loss during updates or crashes
- **Backup**: Automated backups every 6 hours
- **Recovery Time**: System recovery ≤ 15 minutes after failure
- **Error Rate**: ≤ 0.1% of operations result in errors
- **Validation**: 100% of inputs validated before storage

### 6.4 Security
- **Authentication**: All operations require valid authentication
- **Authorization**: Role-based access control for all operations
- **Audit Trail**: All changes logged with user ID and timestamp
- **Data Encryption**: Data encrypted at rest and in transit
- **Input Validation**: All inputs sanitized to prevent injection attacks
- **Session Timeout**: Automatic timeout after 30 minutes of inactivity

### 6.5 Scalability
- **Concurrent Users**: Support 100+ concurrent users
- **Data Volume**: Handle up to 10,000 cuisine types
- **Recipe Association**: Handle up to 100,000 recipes per cuisine
- **Search Performance**: Maintain ≤300ms search time with 10,000 cuisines
- **Filter Performance**: Maintain ≤500ms filter time with complex conditions

---

## 7. Success Criteria

### 7.1 Business Success Metrics
- **Adoption Rate**: 90% of culinary staff actively using cuisine types within 3 months
- **Recipe Organization**: 95% of recipes assigned to cuisine types within 6 months
- **User Satisfaction**: User satisfaction score ≥ 4.5/5.0
- **Error Reduction**: 50% reduction in recipe categorization errors
- **Time Savings**: 30% reduction in recipe search time

### 7.2 Technical Success Metrics
- **Performance**: All operations meet performance targets in NFRs
- **Reliability**: 99.9% uptime achieved
- **Data Quality**: 100% of cuisine data passes validation
- **Integration**: Seamless integration with Recipe Management
- **Accessibility**: WCAG 2.1 AA compliance achieved

### 7.3 User Experience Success Metrics
- **Task Completion**: 95% of users complete cuisine CRUD tasks without assistance
- **Error Recovery**: 90% of users successfully recover from errors
- **Learning Curve**: New users proficient within 15 minutes
- **Mobile Usage**: 40% of operations performed on mobile devices

---

## 8. Future Enhancements

### 8.1 Phase 2 Features
- **Cuisine Hierarchy**: Parent-child relationships (e.g., Italian → Northern Italian)
- **Regional Variations**: Support for regional sub-types (e.g., Cantonese, Sichuan)
- **Cuisine Combinations**: Fusion cuisines (e.g., Asian-Fusion, Tex-Mex)
- **Dietary Tags**: Vegetarian, vegan, gluten-free indicators per cuisine
- **Spice Level**: Default spice level ranges per cuisine

### 8.2 Phase 3 Features
- **Cuisine Trends**: Track popularity trends over time
- **Guest Preferences**: Link to guest preference data
- **Seasonal Variations**: Seasonal dish recommendations per cuisine
- **Ingredient Sourcing**: Link key ingredients to suppliers by region
- **Cultural Context**: Rich media (images, videos, history) for each cuisine

### 8.3 Advanced Analytics
- **Sales Analysis**: Revenue and profit by cuisine type
- **Menu Engineering**: Star/puzzle/plow horse/dog analysis by cuisine
- **Guest Demographics**: Cuisine preferences by guest segments
- **Trend Forecasting**: Predict cuisine popularity trends
- **Competitive Analysis**: Compare cuisine offerings to competitors

---

## 9. Glossary

**Active Cuisine**: A cuisine type that is currently available for recipe assignment and menu planning.

**Cuisine Code**: A unique, uppercase identifier for a cuisine type, used in system integrations and reporting.

**Cuisine Region**: The primary geographic region associated with a cuisine's culinary traditions.

**Inactive Cuisine**: A cuisine type that is archived but retained for historical data integrity.

**Key Ingredients**: A list of ingredients that are characteristic or essential to a cuisine type.

**Popular Dishes**: Representative or signature dishes associated with a cuisine type.

**Recipe Count**: The total number of recipes (active and inactive) associated with a cuisine type.

**Active Recipe Count**: The number of active recipes associated with a cuisine type.

**Sort Order**: A numeric value determining the display sequence of cuisines in lists and dropdowns.

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Owner | | | |
| Product Manager | | | |
| Technical Lead | | | |
| QA Lead | | | |
