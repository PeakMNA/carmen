# Use Cases: Unit Management

## Module Information
- **Module**: Product Management
- **Sub-Module**: Unit Management
- **Route**: `/product-management/units`
- **Version**: 1.1.0
- **Last Updated**: 2026-01-15
- **Owner**: Product Management Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-02 | Documentation Team | Initial version based on source code analysis |
| 1.1.0 | 2026-01-15 | System | Added MEASURE unit type for ingredient measurements, updated unit type descriptions |

---

## Overview

This document describes all use cases for the Unit Management sub-module within the Carmen ERP system. Use cases cover unit catalog management including viewing, searching, creating, editing, and deleting measurement units used throughout the hospitality operation. The module supports four unit types: INVENTORY (for stock tracking), ORDER (for purchasing), RECIPE (for serving/portion output), and MEASURE (for ingredient measurements in recipes).

**Related Documents**:
- [Business Requirements](./BR-units.md)
- [Technical Specification](./TS-units.md)
- [Data Dictionary](./DD-units.md)
- [Flow Diagrams](./FD-units.md)
- [Validations](./VAL-units.md)

---

## Actors

### Primary Actors
Actors who directly interact with the system to achieve goals

| Actor | Description | Role |
|-------|-------------|------|
| Purchasing Manager | Senior staff responsible for procurement operations | Creates, edits, and manages unit catalog; sets up units for ordering |
| Head Chef | Kitchen manager responsible for recipe management | Views and references units for recipe creation; requests custom recipe units |
| Storekeeper | Warehouse staff managing inventory | Views units for inventory counting and stock management; uses units daily for receiving |
| System Administrator | IT staff managing system configuration | Manages system-wide unit settings; exports data; troubleshoots issues |

### Secondary Actors
Actors who support primary actors but don't directly initiate use cases

| Actor | Description | Role |
|-------|-------------|------|
| Sous Chef | Assistant kitchen manager | References units when creating recipes and production orders |
| Receiving Clerk | Staff processing incoming deliveries | Uses units to verify delivery quantities match purchase orders |
| Financial Controller | Finance manager overseeing costs | Reviews unit usage for cost analysis and reporting |
| General Manager | Hotel operations manager | Approves addition of custom units; reviews unit utilization reports |

### System Actors
External systems, internal modules, or automated services that interact with this sub-module as actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| Product Management Module | Requires units for product base unit, purchase unit, and stock unit selection | Module (internal reference) |
| Recipe Management Module | Uses RECIPE type units for yield output and MEASURE type units for ingredient measurements | Module (internal reference) |
| Inventory Management Module | References INVENTORY type units for stock transactions and counting | Module (internal reference) |
| Purchase Order Module | Uses ORDER and INVENTORY type units for order line items | Module (internal reference) |
| Audit Log System | Records all unit changes for compliance and traceability | Event (async logging) |

---

## Use Case Diagram

```
                            ┌─────────────────────────────────┐
                            │   Unit Management System        │
                            └────────────┬────────────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          │                              │                              │
          │                              │                              │
    ┌─────▼──────┐                 ┌────▼─────┐                  ┌─────▼──────┐
    │ Purchasing │                 │   Head   │                  │  Store     │
    │  Manager   │                 │   Chef   │                  │  Keeper    │
    └─────┬──────┘                 └────┬─────┘                  └─────┬──────┘
          │                              │                              │
     [UC-UNIT-001]                 [UC-UNIT-001]                  [UC-UNIT-001]
     [UC-UNIT-002]                 [UC-UNIT-002]                  [UC-UNIT-002]
     [UC-UNIT-003]                 [UC-UNIT-009]                  [UC-UNIT-003]
     [UC-UNIT-004]                 (view only)
     [UC-UNIT-005]
     [UC-UNIT-006]


    ┌─────▼──────┐                                               ┌──────▼──────┐
    │   System   │                                               │  Financial  │
    │   Admin    │                                               │ Controller  │
    └─────┬──────┘                                               └──────┬──────┘
          │                                                             │
     [UC-UNIT-001]                                                [UC-UNIT-009]
     [UC-UNIT-002]                                              (reporting only)
     [UC-UNIT-007]
     [UC-UNIT-008]


    ┌──────────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
    │   Product    │       │    Recipe    │       │  Inventory   │       │   Purchase   │
    │  Management  │       │  Management  │       │  Management  │       │    Order     │
    │    Module    │       │    Module    │       │    Module    │       │    Module    │
    └──────┬───────┘       └──────┬───────┘       └──────┬───────┘       └──────┬───────┘
           │                      │                      │                      │
      [UC-UNIT-201]          [UC-UNIT-202]          [UC-UNIT-203]          [UC-UNIT-204]
    (reference unit)       (reference unit)       (reference unit)       (reference unit)
```

**Legend**:
- **Primary Actors** (top): User roles who create, edit, and manage units
- **Secondary Actors** (middle): Supporting roles who primarily view or reference units
- **System Actors** (bottom): Internal modules that reference units as master data

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **User Use Cases** | | | | | |
| UC-UNIT-001 | View Unit List | All Users | High | Simple | User |
| UC-UNIT-002 | Search and Filter Units | All Users | High | Simple | User |
| UC-UNIT-003 | Switch View Mode (Table/Card) | Storekeeper, Purchasing Manager | Medium | Simple | User |
| UC-UNIT-004 | Create New Unit | Purchasing Manager | High | Medium | User |
| UC-UNIT-005 | Edit Existing Unit | Purchasing Manager | High | Medium | User |
| UC-UNIT-006 | Delete Unit | Purchasing Manager | High | Complex | User |
| UC-UNIT-007 | Change Unit Status | Purchasing Manager, System Admin | Medium | Simple | User |
| UC-UNIT-008 | Export Unit List | System Admin | Low | Simple | User |
| UC-UNIT-009 | View Unit Details | Head Chef, Financial Controller | Medium | Simple | User |
| **Integration Use Cases** | | | | | |
| UC-UNIT-201 | Reference Unit in Product | Product Management Module | High | Simple | Integration |
| UC-UNIT-202 | Reference Unit in Recipe | Recipe Management Module | High | Simple | Integration |
| UC-UNIT-203 | Reference Unit in Inventory | Inventory Management Module | High | Simple | Integration |
| UC-UNIT-204 | Reference Unit in Purchase Order | Purchase Order Module | High | Simple | Integration |

**Complexity Definitions**:
- **Simple**: Single-step process with minimal logic, 1-3 scenarios, straightforward validation
- **Medium**: Multi-step process with business rules, 4-8 scenarios, moderate validation
- **Complex**: Multi-step process with complex validation, multiple integrations, 9+ scenarios, extensive error handling

---

## User Use Cases

### UC-UNIT-001: View Unit List

**Actor**: All Users (Purchasing Manager, Head Chef, Storekeeper, System Administrator)

**Priority**: High

**Frequency**: Daily (multiple times per user)

**Preconditions**:
- User is authenticated and has "View Units" permission
- User has navigated to `/product-management/units`
- Database contains unit records

**Main Flow**:
1. User navigates to Unit Management page
2. System loads unit list from database
3. System displays units in table format with columns: Code, Name, Type, Status, Description, Actions
4. System sorts units alphabetically by code (default sort)
5. System displays summary: "Showing X of Y units"
6. Each unit row shows:
   - Unit code (e.g., KG, ML, TSP)
   - Unit name (e.g., Kilogram, Milliliter, Teaspoon)
   - Type badge (INVENTORY, ORDER, RECIPE, or MEASURE) with color coding
   - Status badge (Active in green, Inactive in gray)
   - Description text (truncated if too long)
   - Actions dropdown menu (three-dot icon)
7. User can click column headers to sort by that column (ascending/descending)
8. Use case ends

**Alternative Flows**:

**Alt-1A: No Units Exist**
- At step 3: If database contains no units
  - System displays empty state message: "No units found"
  - System shows "Add Unit" button prominently
  - Use case ends

**Alt-1B: Slow Network Connection**
- At step 2: If database query takes >2 seconds
  - System displays loading spinner
  - System shows "Loading units..." message
  - When data loads, continue to step 3

**Alt-1C: Sort by Column**
- At step 7: User clicks column header
  - System re-sorts units by selected column
  - System toggles sort direction (asc/desc) on repeated clicks
  - System updates sort indicator (arrow icon) in column header
  - Use case returns to step 7

**Exception Flows**:

**Exc-1A: Database Connection Error**
- At step 2: If database is unavailable
  - System displays error message: "Unable to load units. Please try again."
  - System provides "Retry" button
  - System logs error to error tracking system
  - Use case ends

**Exc-1B: Permission Denied**
- At step 1: If user lacks "View Units" permission
  - System displays error: "Access denied. You do not have permission to view units."
  - System redirects to dashboard or previous page
  - Use case ends

**Postconditions**:
- Unit list is displayed with current data
- User can see all available units and their status
- Sort and filter controls are available for use

**Business Rules**: BR-UNIT-011, BR-UNIT-012

---

### UC-UNIT-002: Search and Filter Units

**Actor**: All Users

**Priority**: High

**Frequency**: Daily

**Preconditions**:
- User is on Unit Management page (UC-UNIT-001 completed)
- Unit list is displayed
- Search and filter controls are visible

**Main Flow**:
1. User enters search term in search box (e.g., "kilo")
2. System filters units in real-time (as user types)
3. System displays matching units where search term appears in code, name, or description
4. System updates summary: "Showing X of Y units"
5. User can additionally select status filter from dropdown (All Status, Active, Inactive)
6. User can additionally select type filter from dropdown (All Types, INVENTORY, ORDER, RECIPE, MEASURE)
7. System applies all active filters simultaneously
8. System displays filtered results
9. Use case ends

**Alternative Flows**:

**Alt-2A: No Results Found**
- At step 8: If no units match filter criteria
  - System displays message: "No units found matching your criteria"
  - System shows current filter settings
  - System provides "Clear Filters" button
  - Use case ends

**Alt-2B: Clear Search**
- At any point: User clears search box (deletes all text)
  - System removes search filter
  - System displays all units (respecting other active filters)
  - Use case returns to step 7

**Alt-2C: Clear All Filters**
- At any point: User clicks "Clear Filters" button (if shown)
  - System resets search box to empty
  - System resets status filter to "All Status"
  - System resets type filter to "All Types"
  - System displays all units (same as UC-UNIT-001)
  - Use case returns to UC-UNIT-001, step 6

**Alt-2D: Change Filter Without Search**
- At step 1: User doesn't enter search, directly selects filter
  - Skip steps 2-4
  - System applies selected filter
  - Continue to step 7

**Exception Flows**:

**Exc-2A: Special Characters in Search**
- At step 2: If user enters special characters (e.g., SQL injection attempt)
  - System sanitizes input automatically
  - System treats special characters as literal text search
  - Continue to step 3

**Postconditions**:
- Filtered unit list is displayed
- Filter settings persist during session
- User can further refine or clear filters

**Business Rules**: BR-UNIT-002

---

### UC-UNIT-003: Switch View Mode (Table/Card)

**Actor**: Storekeeper, Purchasing Manager

**Priority**: Medium

**Frequency**: Varies by user preference

**Preconditions**:
- User is on Unit Management page
- Unit list is displayed
- View mode toggle buttons are visible in toolbar

**Main Flow**:
1. User sees current view mode (default: table view)
2. User clicks view mode toggle button (Table icon or Grid icon)
3. System switches display mode instantly
4. If switching to card view:
   - System displays units as cards in grid layout
   - Each card shows: Code (large), Name, Type badge, Status badge
   - Cards are responsive (adjusts columns based on screen size)
5. If switching to table view:
   - System displays units in table format (as in UC-UNIT-001)
6. System saves view preference for current session
7. Use case ends

**Alternative Flows**:

**Alt-3A: Already in Selected View**
- At step 2: If user clicks button for current view mode
  - System does nothing (button already active/highlighted)
  - Use case ends

**Alt-3B: Mobile Device**
- At step 4: If user is on mobile device (screen width <768px)
  - Card view automatically adjusts to single column
  - Cards have larger touch targets
  - Use case continues to step 6

**Exception Flows**:

**Exc-3A: View Render Error**
- At step 3: If view mode switch fails to render
  - System reverts to previous view mode
  - System displays error toast: "Failed to switch view. Please try again."
  - Use case ends

**Postconditions**:
- Selected view mode is active
- View preference persists during session
- All filtering and search functionality works in both views

**Business Rules**: None specific

---

### UC-UNIT-004: Create New Unit

**Actor**: Purchasing Manager

**Priority**: High

**Frequency**: Weekly to Monthly

**Preconditions**:
- User has "Manage Units" permission
- User is on Unit Management page
- User has identified need for new unit

**Main Flow**:
1. User clicks "Add Unit" button in page header
2. System opens unit creation form/dialog
3. System displays form fields:
   - Code (text input, required, max 20 chars)
   - Name (text input, required, max 100 chars)
   - Description (textarea, optional, max 500 chars)
   - Type (dropdown, required: INVENTORY, ORDER, RECIPE, MEASURE)
   - Status (toggle, default: Active)
4. User enters unit code (e.g., "BAG")
5. User enters unit name (e.g., "Bag")
6. User optionally enters description
7. User selects unit type from dropdown
8. User keeps or changes status (default Active)
9. User clicks "Save" button
10. System validates all fields (see VAL-units.md)
11. System checks for duplicate code
12. System creates new unit record in database
13. System displays success toast: "Unit created successfully"
14. System refreshes unit list, showing new unit
15. System closes form/dialog
16. Use case ends

**Alternative Flows**:

**Alt-4A: Cancel Creation**
- At any point: User clicks "Cancel" button
  - System closes form without saving
  - System discards entered data
  - Use case ends

**Alt-4B: Auto-Format Code**
- At step 5: User enters lowercase code (e.g., "bag")
  - System automatically converts to uppercase ("BAG")
  - Continue to step 6

**Exception Flows**:

**Exc-4A: Validation Error**
- At step 10: If any field fails validation
  - System displays inline error messages under invalid fields
  - System highlights invalid fields in red
  - System keeps form open with entered data
  - System focuses cursor on first invalid field
  - User corrects errors and clicks Save again
  - Use case returns to step 10

**Exc-4B: Duplicate Code**
- At step 11: If code already exists in database
  - System displays error message: "Unit code 'XXX' already exists. Please use a different code."
  - System highlights Code field in red
  - System keeps form open with entered data
  - User changes code and clicks Save again
  - Use case returns to step 10

**Exc-4C: Database Error**
- At step 12: If database insert fails
  - System displays error: "Failed to create unit. Please try again."
  - System logs error details
  - System keeps form open with entered data
  - System provides "Retry" option
  - Use case ends

**Exc-4D: Permission Check Failure**
- At step 1: If user permission check fails
  - System displays error: "You do not have permission to create units."
  - System disables "Add Unit" button
  - Use case ends

**Postconditions**:
- New unit exists in database with unique ID
- New unit appears in unit list
- New unit is available for selection in products/recipes (if Active)
- Creation is logged in audit trail

**Business Rules**: BR-UNIT-001, BR-UNIT-002, BR-UNIT-003, BR-UNIT-004, BR-UNIT-005, BR-UNIT-006, BR-UNIT-011, BR-UNIT-014, BR-UNIT-019

**Related Use Cases**: UC-UNIT-005 (Edit Unit), VAL-UNIT-001 through VAL-UNIT-005

---

### UC-UNIT-005: Edit Existing Unit

**Actor**: Purchasing Manager

**Priority**: High

**Frequency**: Monthly

**Preconditions**:
- User has "Manage Units" permission
- Unit exists in database
- User is on Unit Management page viewing unit list

**Main Flow**:
1. User locates unit to edit in unit list
2. User clicks actions menu (three-dot icon) for that unit
3. System displays dropdown menu with options: Edit, Delete
4. User clicks "Edit" option
5. System opens edit form/dialog with pre-populated fields
6. System displays form fields (same as create, except Code is read-only):
   - Code (read-only, grayed out)
   - Name (editable)
   - Description (editable)
   - Type (editable dropdown)
   - Status (editable toggle)
7. User modifies desired fields (Name, Description, Type, or Status)
8. User clicks "Save Changes" button
9. System validates modified fields
10. If Name changed: System checks for duplicate name within same type
11. System updates unit record in database
12. System displays success toast: "Unit updated successfully"
13. System refreshes unit list showing updated data
14. System closes form/dialog
15. Use case ends

**Alternative Flows**:

**Alt-5A: Cancel Edit**
- At any point: User clicks "Cancel" button
  - System discards changes
  - System closes form without saving
  - Use case ends

**Alt-5B: No Changes Made**
- At step 8: User clicks Save without changing any fields
  - System displays info message: "No changes detected"
  - System closes form
  - Use case ends

**Alt-5C: Change Status Only**
- At step 7: User only changes status toggle
  - Skip step 10 (no name validation needed)
  - Continue to step 11

**Alt-5D: Unit In Use Warning**
- At step 7: If unit is used in products/recipes
  - System displays warning badge: "This unit is used in X products"
  - System allows edit to proceed (changes won't break references)
  - Continue to step 8

**Exception Flows**:

**Exc-5A: Validation Error**
- At step 9: If any field fails validation
  - System displays inline error messages
  - System highlights invalid fields
  - System keeps form open with entered data
  - User corrects errors
  - Use case returns to step 9

**Exc-5B: Duplicate Name Error**
- At step 10: If name already exists for same unit type
  - System displays error: "A unit with name 'XXX' already exists for type INVENTORY"
  - System highlights Name field in red
  - System keeps form open
  - User changes name
  - Use case returns to step 9

**Exc-5C: Concurrent Modification**
- At step 11: If another user edited same unit
  - System displays error: "This unit was modified by another user. Please refresh and try again."
  - System provides "Refresh" button
  - User clicks Refresh, form reloads with latest data
  - Use case returns to step 5

**Exc-5D: Database Error**
- At step 11: If database update fails
  - System displays error: "Failed to update unit. Please try again."
  - System logs error
  - System keeps form open
  - System provides "Retry" option
  - Use case ends

**Postconditions**:
- Unit record updated in database
- Changes visible in unit list
- If status changed to Inactive: Unit no longer available for new selections
- Edit logged in audit trail with user ID and timestamp
- Existing product/recipe references remain valid

**Business Rules**: BR-UNIT-003, BR-UNIT-004, BR-UNIT-005, BR-UNIT-009, BR-UNIT-011, BR-UNIT-013, BR-UNIT-019

**Related Use Cases**: UC-UNIT-004 (Create), UC-UNIT-007 (Change Status)

---

### UC-UNIT-006: Delete Unit

**Actor**: Purchasing Manager

**Priority**: High

**Frequency**: Rare (Quarterly or as needed)

**Preconditions**:
- User has "Manage Units" permission
- Unit exists in database
- User is on Unit Management page

**Main Flow**:
1. User locates unit to delete in unit list
2. User clicks actions menu (three-dot icon) for that unit
3. System displays dropdown menu with options: Edit, Delete
4. User clicks "Delete" option
5. System checks if unit is referenced in any products, recipes, or transactions
6. If unit is not in use (reference count = 0):
   - System displays confirmation dialog:
     - Title: "Delete Unit"
     - Message: "Are you sure you want to delete unit 'CODE - Name'? This action cannot be undone."
     - Buttons: "Cancel", "Delete" (red/destructive)
7. User clicks "Delete" button in confirmation dialog
8. System permanently deletes unit record from database (hard delete)
9. System displays success toast: "Unit deleted successfully"
10. System removes unit from unit list immediately
11. Use case ends

**Alternative Flows**:

**Alt-6A: Cancel Deletion**
- At step 7: User clicks "Cancel" button in confirmation dialog
  - System closes dialog without deleting
  - Use case ends

**Exception Flows**:

**Exc-6A: Unit In Use - Cannot Delete**
- At step 5: If unit is referenced in products/recipes/transactions
  - System displays error dialog:
    - Title: "Cannot Delete Unit"
    - Message: "This unit is currently used in X products and Y recipes. It cannot be deleted."
    - Details: "To remove this unit, first remove it from all products and recipes, or mark it as Inactive instead."
    - Buttons: "Mark Inactive", "Cancel"
  - If user clicks "Mark Inactive":
    - System changes unit status to Inactive
    - System displays success toast
    - System updates unit list
    - Use case ends
  - If user clicks "Cancel":
    - System closes dialog
    - Use case ends

**Exc-6B: Database Error**
- At step 8: If database delete fails
  - System displays error: "Failed to delete unit. Please try again."
  - System logs error
  - System provides "Retry" option
  - Use case ends

**Exc-6C: Concurrent Deletion**
- At step 8: If unit was already deleted by another user
  - System displays error: "This unit no longer exists. The list will be refreshed."
  - System refreshes unit list
  - Deleted unit is not shown
  - Use case ends

**Exc-6D: Permission Override (Admin)**
- At step 5: If user is System Administrator with override permission
  - System allows deletion even if unit is in use (with additional confirmation)
  - System displays stronger warning:
    - Message: "⚠️ WARNING: This unit is used in X products. Deleting it may cause data integrity issues. This action requires administrator approval."
    - Additional checkbox: "I understand the risks and have approval to delete this unit"
    - Delete button disabled until checkbox checked
  - Continue to step 7

**Postconditions**:
- Unit record permanently removed from database
- Unit no longer appears in any lists
- Deletion logged in audit trail
- Products/recipes referencing deleted unit show warning (if admin override used)

**Business Rules**: BR-UNIT-010, BR-UNIT-011, BR-UNIT-015, BR-UNIT-019, BR-UNIT-021

**Related Use Cases**: UC-UNIT-005 (Edit), UC-UNIT-007 (Change Status as alternative)

---

### UC-UNIT-007: Change Unit Status

**Actor**: Purchasing Manager, System Administrator

**Priority**: Medium

**Frequency**: Monthly

**Preconditions**:
- User has "Manage Units" permission
- Unit exists in database
- User is on Unit Management page

**Main Flow**:
1. User locates unit to change status
2. User opens Edit form for that unit (see UC-UNIT-005, steps 1-6)
3. User toggles Status field (Active ↔ Inactive)
4. If changing to Inactive and unit is used in products/recipes:
   - System displays warning: "This unit is used in X products and Y recipes. Marking it inactive will hide it from new selections but existing usage will remain valid."
5. User clicks "Save Changes"
6. System updates unit status in database
7. System displays success toast: "Unit status updated to [Active/Inactive]"
8. System refreshes unit list
9. If status changed to Inactive:
   - Unit row background becomes slightly grayed
   - Status badge changes to gray "Inactive"
10. If status changed to Active:
    - Unit row background returns to normal
    - Status badge changes to green "Active"
11. Use case ends

**Alternative Flows**:

**Alt-7A: Quick Status Toggle (Future Enhancement)**
- At step 2: Instead of full edit form
  - User clicks status badge directly in list
  - System displays inline confirmation: "Change status to [Active/Inactive]?"
  - User confirms
  - System updates status immediately
  - Use case jumps to step 6

**Exception Flows**:

**Exc-7A: Status Change Blocked by Business Rule**
- At step 6: If system has business rule preventing deactivation
  - System displays error with reason
  - System keeps form open
  - Use case ends

**Postconditions**:
- Unit status updated in database
- If Inactive: Unit hidden from dropdowns in Products, Recipes
- If Active: Unit available for selection again
- Existing references unaffected regardless of status
- Status change logged in audit trail

**Business Rules**: BR-UNIT-008, BR-UNIT-011, BR-UNIT-013, BR-UNIT-014

**Related Use Cases**: UC-UNIT-005 (Edit Unit)

---

### UC-UNIT-008: Export Unit List

**Actor**: System Administrator

**Priority**: Low

**Frequency**: As needed (Monthly for reporting)

**Preconditions**:
- User has "Export Data" permission
- User is on Unit Management page
- Unit list is displayed (with or without filters applied)

**Main Flow**:
1. User clicks "Export" button in page header toolbar
2. System prepares CSV export with columns: Code, Name, Type, Status, Description, Created Date, Updated Date
3. System includes all units matching current filters (if any filters active)
4. System generates filename: units_export_YYYYMMDD_HHMMSS.csv
5. System displays download progress indicator
6. System triggers file download to user's device
7. System displays success toast: "Export completed. X units exported."
8. Use case ends

**Alternative Flows**:

**Alt-8A: Export With Filters**
- At step 3: If filters are active (search, status, or type filters)
  - System exports only filtered units
  - System includes filter info in success message: "Export completed. X of Y total units exported (filtered)."
  - Continue to step 5

**Alt-8B: Export All Units**
- At step 3: If no filters active
  - System exports all units in database
  - Continue to step 4

**Exception Flows**:

**Exc-8A: No Units to Export**
- At step 3: If unit list is empty (or filters return zero results)
  - System displays error: "No units to export"
  - Use case ends

**Exc-8B: Export Generation Error**
- At step 3: If CSV generation fails
  - System displays error: "Failed to generate export file. Please try again."
  - System logs error
  - Use case ends

**Exc-8C: Export Timeout**
- At step 3: If export takes longer than 10 seconds
  - System displays message: "Export is taking longer than expected. The file will download when ready."
  - System continues export in background
  - When complete, system triggers download
  - Use case ends

**Postconditions**:
- CSV file downloaded to user's device
- Export logged in audit trail
- File contains UTF-8 encoded data
- File format is compatible with Excel and Google Sheets

**Business Rules**: BR-UNIT-020

**Related Use Cases**: None

---

### UC-UNIT-009: View Unit Details

**Actor**: Head Chef, Financial Controller, Purchasing Manager

**Priority**: Medium

**Frequency**: Weekly

**Preconditions**:
- User has "View Units" permission
- Unit exists in database
- User is on Unit Management page

**Main Flow**:
1. User locates unit in unit list
2. User clicks on unit name (linked text)
3. System navigates to unit detail page (if implemented) or opens detail panel
4. System displays comprehensive unit information:
   - **Header**: Code, Name, Status badge
   - **Basic Info**: Description, Type
   - **Usage Statistics**:
     - Number of products using this unit
     - Number of recipes using this unit
     - Last used date and context
   - **Audit Info**:
     - Created date and created by user name
     - Last updated date and updated by user name
5. System shows list of recent products using this unit (top 10)
6. System shows list of recent recipes using this unit (top 10)
7. User reviews information
8. User clicks "Back" button or browser back to return to unit list
9. System returns to unit list maintaining previous filters/scroll position
10. Use case ends

**Alternative Flows**:

**Alt-9A: Unit Not Used Anywhere**
- At step 4: If unit has zero usage (no products/recipes reference it)
  - System displays usage statistics as zero
  - System shows message: "This unit is not currently used in any products or recipes"
  - System may suggest: "Consider marking as Inactive or deleting if no longer needed"
  - Continue to step 7

**Alt-9B: View From Actions Menu**
- At step 2: Instead of clicking name
  - User clicks actions menu (three-dot icon)
  - User selects "View Details" option
  - System opens detail view
  - Continue to step 4

**Exception Flows**:

**Exc-9A: Unit Not Found**
- At step 3: If unit was deleted by another user
  - System displays error: "Unit not found. It may have been deleted."
  - System redirects back to unit list
  - Use case ends

**Postconditions**:
- User has viewed unit details
- User can make informed decision about editing or deleting unit
- View action logged in audit trail (optional)

**Business Rules**: BR-UNIT-012

**Related Use Cases**: UC-UNIT-005 (Edit), UC-UNIT-006 (Delete)

---

## Integration Use Cases

### UC-UNIT-201: Reference Unit in Product

**Actor**: Product Management Module

**Priority**: High

**Frequency**: Continuous (whenever products are created/edited)

**Preconditions**:
- Unit Management module is operational
- Units exist in database
- Product Management module needs to assign units to product

**Main Flow**:
1. Product Management module displays unit selection dropdown
2. Module requests list of active units from Unit Management
3. Unit Management returns list of units filtered by:
   - Status = Active
   - Type = INVENTORY (for base unit, stock unit)
   - Type = INVENTORY or ORDER (for purchase unit)
4. Product Management displays units in dropdown
5. User selects unit from dropdown
6. Product Management stores unit ID reference (not unit code)
7. System validates unit ID exists
8. Integration complete

**Exception Flows**:

**Exc-201A: No Active Units Available**
- At step 3: If no active units match filter criteria
  - Unit Management returns empty list
  - Product Management displays error: "No units available. Please create units first."
  - Integration fails gracefully

**Exc-201B: Invalid Unit Reference**
- At step 7: If unit ID doesn't exist (unit was deleted)
  - System displays error: "Selected unit is no longer available"
  - Product Management clears selection
  - User must select different unit

**Business Rules**: BR-UNIT-013, BR-UNIT-017

---

### UC-UNIT-202: Reference Unit in Recipe

**Actor**: Recipe Management Module

**Priority**: High

**Frequency**: Continuous (whenever recipes are created/edited)

**Preconditions**:
- Unit Management module is operational
- Recipe Management is adding ingredient to recipe

**Main Flow**:
1. Recipe Management displays unit dropdown for ingredient
2. Module requests list of active units from Unit Management
3. Unit Management returns units filtered by:
   - Status = Active
   - Type = MEASURE or INVENTORY (for ingredient quantities)
   - Type = RECIPE (for yield output)
4. Recipe Management displays filtered units
5. User selects unit for ingredient
6. Recipe Management stores unit ID reference
7. Integration complete

**Business Rules**: BR-UNIT-013, BR-UNIT-18

---

### UC-UNIT-203: Reference Unit in Inventory Transaction

**Actor**: Inventory Management Module

**Priority**: High

**Frequency**: Continuous (for all stock movements)

**Main Flow**:
1. Inventory Management processes stock transaction
2. Module retrieves product's assigned inventory unit
3. Unit Management confirms unit exists and returns unit details
4. Inventory Management uses unit for quantity calculation
5. Transaction records unit ID reference
6. Integration complete

**Business Rules**: BR-UNIT-017

---

### UC-UNIT-204: Reference Unit in Purchase Order

**Actor**: Purchase Order Module

**Priority**: High

**Frequency**: Continuous (for all purchase order line items)

**Main Flow**:
1. Purchase Order module displays order unit dropdown
2. Module requests active units from Unit Management
3. Unit Management returns units filtered by:
   - Status = Active
   - Type = ORDER or INVENTORY
4. Purchase Order displays filtered units
5. User selects unit for order line item
6. Purchase Order stores unit ID reference
7. Integration complete

**Business Rules**: BR-UNIT-013

---

## Data Contracts

### Get Active Units Request/Response

**Request**:
```typescript
{
  type?: 'INVENTORY' | 'ORDER' | 'RECIPE' | 'MEASURE' | 'ALL',  // Optional filter
  statusFilter?: 'ACTIVE' | 'ALL'                               // Default: ACTIVE
}
```

**Response**:
```typescript
{
  success: boolean,
  units: [
    {
      id: string,
      code: string,
      name: string,
      type: 'INVENTORY' | 'ORDER' | 'RECIPE' | 'MEASURE',
      isActive: boolean
    }
  ],
  totalCount: number
}
```

### Check Unit Usage Request/Response

**Request**:
```typescript
{
  unitId: string
}
```

**Response**:
```typescript
{
  success: boolean,
  canBeDeleted: boolean,
  usageStats: {
    productCount: number,
    recipeCount: number,
    transactionCount: number
  },
  blockingReason?: string
}
```

---

**Document Control**:
- **Classification**: Internal Use Only
- **Review Cycle**: Quarterly
- **Next Review Date**: 2026-04-15
- **Approval Required**: Product Management Team Lead, IT Manager
