# Use Cases: Products

## Module Information
- **Module**: Product Management
- **Sub-Module**: Products
- **Route**: /product-management/products
- **Version**: 1.1.0
- **Last Updated**: 2026-01-15
- **Owner**: Product Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-11 | System | Initial use cases documentation |
| 1.1.0 | 2026-01-15 | System | Renamed Recipe Units to Ingredient Units; Updated location assignment with new fields (shelves, tags, parLevel, reorderPoint); Updated product type flags to isIngredient/isForSale; Added advanced filtering with saved filters; Added Table/Card view modes |

---

## Overview

This document details all use cases for the Products sub-module within the CARMEN hospitality ERP system. The use cases cover the complete product lifecycle from creation through deletion, including unit management, store assignments, cost tracking, tax configuration, and integration with dependent modules.

Products serve as the central master data repository for all operational modules including Procurement, Inventory Management, Recipe Management, Store Operations, Sales, and Finance. The use cases reflect this central role by detailing both direct user interactions and system-to-system integrations.

**Related Documents**:
- [Business Requirements](./BR-products.md)
- [Technical Specification](./TS-products.md)
- [Data Dictionary](./DD-products.md)
- [Flow Diagrams](./FD-products.md)
- [Validations](./VAL-products.md)

---

## Actors

### Primary Actors

| Actor | Description | Role |
|-------|-------------|------|
| Procurement Staff | Users responsible for purchasing and vendor management | Create and manage products, update costs, view purchase history |
| Inventory Manager | Users managing warehouse and stock operations | Manage product units, store assignments, inventory thresholds |
| Product Manager | Users responsible for product catalog management | Comprehensive product management, categorization, attributes |
| System Administrator | IT staff managing system configuration and data | Bulk import/export, data migration, system maintenance |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| Store Manager | Managers of individual store/location operations | View products assigned to their location, check inventory thresholds |
| Recipe Planner | Users creating and managing recipes | View products flagged for recipe use, check unit conversions |
| Finance Manager | Financial controllers and accountants | Review product costs, approve cost changes, audit pricing |
| Department Manager | Managers approving operational changes | Approve product changes affecting costs or operations |

### System Actors

| System | Description | Integration Type |
|--------|-------------|------------------|
| Procurement Module | Purchase Request and Purchase Order system | Module - Product selection, cost validation |
| Inventory Module | Stock tracking and warehouse management | Module - Unit conversions, store assignments |
| GRN Module | Goods Receipt Note processing | Module - Update last receiving cost, purchase history |
| Recipe Module | Recipe management and costing | Module - Ingredient selection, ingredient units |
| Sales Module | Point of sale and sales order processing | Module - Product selection for direct sales |
| Finance Module | Financial accounting and reporting | Module - Cost data, tax configuration |
| Activity Log Service | Centralized audit logging | Service - Record all product changes |
| Notification Service | Alert and notification system | Service - Cost change notifications |

---

## Use Case Diagram

```
                            ┌─────────────────────────────────┐
                            │     Products Sub-Module         │
                            └────────────┬────────────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          │                              │                              │
          │                              │                              │
    ┌─────▼──────┐                 ┌────▼─────┐                  ┌─────▼──────┐
    │ Procurement│                 │Inventory │                  │  Product   │
    │   Staff    │                 │ Manager  │                  │  Manager   │
    └─────┬──────┘                 └────┬─────┘                  └─────┬──────┘
          │                              │                              │
     [UC-PROD-001]                  [UC-PROD-006]                  [UC-PROD-002]
     [UC-PROD-008]                  [UC-PROD-007]                  [UC-PROD-005]
     [UC-PROD-009]                  [UC-PROD-014]                  [UC-PROD-011]
     [UC-PROD-013]                  [UC-PROD-015]                  [UC-PROD-012]
     [UC-PROD-018]                                                 [UC-PROD-016]
          │
          │                         ┌────▼─────┐
          │                         │  System  │
          │                         │   Admin  │
          └─────────────────────────┤          │
                   [UC-PROD-018]    └──────────┘
                   [UC-PROD-019]    [UC-PROD-003]
                                    [UC-PROD-004]
                                    [UC-PROD-010]
                                    [UC-PROD-017]
                                    [UC-PROD-020]

    ┌──────────────┐              ┌──────────────┐              ┌──────────────┐
    │     GRN      │              │  Procurement │              │   Inventory  │
    │    Module    │              │    Module    │              │    Module    │
    │ (Automated)  │              │  Integration │              │  Integration │
    └──────┬───────┘              └──────┬───────┘              └──────┬───────┘
           │                             │                             │
      [UC-PROD-101]                 [UC-PROD-201]                 [UC-PROD-202]
      [UC-PROD-102]              (product selection)         (unit conversions)
    (cost update)


    ┌──────────────┐              ┌──────────────┐
    │    Recipe    │              │    Sales     │
    │    Module    │              │    Module    │
    │  Integration │              │  Integration │
    └──────┬───────┘              └──────┬───────┘
           │                             │
      [UC-PROD-203]                 [UC-PROD-204]
    (ingredient)                   (direct sale)
```

**Legend**:
- **Primary Actors** (top): User roles who directly interact with products
- **Secondary Actors** (middle): Supporting roles with view-only or approval access
- **System Actors** (bottom): Automated processes and module integrations

---

## Use Case Summary

| ID | Use Case Name | Actor(s) | Priority | Complexity | Category |
|----|---------------|----------|----------|------------|----------|
| **User Use Cases** | | | | | |
| UC-PROD-001 | Create Product | Procurement Staff, Product Manager | Critical | Medium | User |
| UC-PROD-002 | Update Product Information | Product Manager, Procurement Staff | Critical | Medium | User |
| UC-PROD-003 | Delete Product (Soft Delete) | System Administrator | High | Medium | User |
| UC-PROD-004 | Change Product Status | Product Manager, System Admin | High | Simple | User |
| UC-PROD-005 | Assign Product Category | Product Manager | Critical | Simple | User |
| UC-PROD-006 | Manage Product Units | Inventory Manager, Product Manager | Critical | Complex | User |
| UC-PROD-007 | Assign Product to Location | Inventory Manager | High | Medium | User |
| UC-PROD-008 | Update Product Cost | Procurement Staff, Finance Manager | High | Medium | User |
| UC-PROD-009 | Configure Price Deviation | Product Manager, Procurement Staff | High | Simple | User |
| UC-PROD-010 | Configure Product Tax | Finance Manager, Product Manager | High | Simple | User |
| UC-PROD-011 | Set Product Type Flags | Product Manager | Medium | Simple | User |
| UC-PROD-012 | Manage Product Attributes | Product Manager | Medium | Simple | User |
| UC-PROD-013 | View Purchase History | Procurement Staff, Finance Manager | High | Simple | User |
| UC-PROD-014 | Search and Filter Products | All Users | High | Medium | User |
| UC-PROD-015 | View Product List | All Users | High | Simple | User |
| UC-PROD-016 | Duplicate Product | Product Manager, Procurement Staff | Medium | Simple | User |
| UC-PROD-017 | Manage Product Barcode | Inventory Manager, Product Manager | Medium | Simple | User |
| UC-PROD-018 | Import Products from File | System Administrator | Medium | Complex | User |
| UC-PROD-019 | Export Products to File | All Users | Medium | Simple | User |
| UC-PROD-020 | Print Product Details | All Users | Low | Simple | User |
| **System Use Cases** | | | | | |
| UC-PROD-101 | Update Last Receiving Cost | GRN Module | High | Medium | System |
| UC-PROD-102 | Log Product Activity | Activity Log Service | Medium | Simple | System |
| **Integration Use Cases** | | | | | |
| UC-PROD-201 | Product Selection in Procurement | Procurement Module | Critical | Medium | Integration |
| UC-PROD-202 | Product Data for Inventory | Inventory Module | Critical | Medium | Integration |
| UC-PROD-203 | Product as Recipe Ingredient | Recipe Module | High | Medium | Integration |
| UC-PROD-204 | Product for Direct Sales | Sales Module | High | Medium | Integration |

---

## User Use Cases

### UC-PROD-001: Create Product

**Description**: User creates a new product record with all required information including unique product code, descriptions, category assignment, default units, and basic cost information.

**Actor(s)**: Procurement Staff, Product Manager

**Priority**: Critical

**Frequency**: Daily (1-5 new products per day)

**Preconditions**:
- User has create_product permission
- User is authenticated and authorized
- Category hierarchy exists (at least one complete path with 3 levels)
- Unit master data exists (at least one active unit)

**Postconditions**:
- **Success**: New product created with unique ID, status Active, visible in product list, activity log entry created
- **Failure**: Product not created, validation errors displayed, no database changes

**Main Flow** (Happy Path):
1. User navigates to product list page (/product-management/products)
2. System displays product list with "Create Product" button
3. User clicks "Create Product" button
4. System displays product creation form with all fields empty and required fields marked with asterisk (*)
5. User enters product code (required, unique)
6. User enters English description (required)
7. User enters local description (optional)
8. User selects Category from dropdown (required, cascades to Subcategory)
9. User selects Subcategory from filtered dropdown (required, cascades to Item Group)
10. User selects Item Group from filtered dropdown (required)
11. User selects Inventory Unit from dropdown (required, base unit)
12. User selects Default Order Unit from dropdown (optional)
13. User enters Standard Cost (optional, defaults to 0)
14. User enters Price Deviation % (optional, inherits from Item Group if blank)
15. User enters Quantity Deviation % (optional, inherits from Item Group if blank)
16. User clicks "Save" button
17. System validates all required fields are populated
18. System validates product code uniqueness (case-insensitive)
19. System validates category hierarchy consistency
20. System validates numeric fields (cost >= 0, deviations 0-100%)
21. System saves product to database with status Active, created_by current user, created_at current timestamp
22. System creates activity log entry with action type "CREATED"
23. System displays success message: "Product [Code] created successfully"
24. System redirects to product detail page for new product
25. Use case ends

**Alternative Flows**:

**Alt-001A: Product Code Already Exists** (At step 18)
- 18a. System detects duplicate product code (case-insensitive match)
- 18b. System displays error message: "Product code '[Code]' already exists. Please use a unique code."
- 18c. System highlights product code field in red
- 18d. User corrects product code
- Resume at step 16

**Alt-001B: Invalid Category Selection** (At step 19)
- 19a. System detects invalid category hierarchy (e.g., subcategory not child of category)
- 19b. System displays error message: "Invalid category selection. Please select categories in correct hierarchy."
- 19c. System resets category selections
- 19d. User re-selects categories
- Resume at step 16

**Alt-001C: User Cancels Creation** (At any step 5-15)
- User clicks "Cancel" button
- System displays confirmation dialog: "Discard unsaved changes?"
- User confirms cancellation
- System discards all entered data
- System returns to product list page
- Use case ends

**Exception Flows**:

**Exc-001A: Required Field Missing** (At step 17)
- System detects one or more required fields are empty
- System displays error message: "Please complete all required fields marked with *"
- System highlights missing fields in red
- Resume at step 5

**Exc-001B: Invalid Numeric Value** (At step 20)
- System detects invalid numeric format or out of range value
- System displays error message: "Standard Cost must be >= 0" or "Deviation must be 0-100%"
- System highlights invalid field in red
- User corrects value
- Resume at step 16

**Exc-001C: Database Error** (At step 21)
- Database save operation fails due to connection error or constraint violation
- System logs error with full context
- System displays user-friendly error: "Unable to save product. Please try again or contact support."
- System retains form data for user to retry
- Use case ends

**Business Rules**:
- **BR-PROD-001**: Product code must be unique
- **BR-PROD-002**: English description is mandatory
- **BR-PROD-004**: Category assignment at all three levels required
- **BR-PROD-005**: Inventory unit is mandatory
- **BR-PROD-007**: Product code format validation
- **BR-PROD-008**: Price deviation 0-100%
- **BR-PROD-009**: Quantity deviation 0-100%

**Related Requirements**:
- FR-PROD-001: Product Creation
- NFR-PROD-002: Load time < 2 seconds
- NFR-PROD-013: Required fields marked with asterisk

**UI Mockups**: See product-create-form.png

**Notes**:
- Product status defaults to Active upon creation
- Deviations inherit from Item Group if not specified
- User can save and continue editing after initial creation
- Created product immediately available in all dropdowns across modules

---

### UC-PROD-002: Update Product Information

**Description**: User edits existing product information including descriptions, category assignment, units, costs, pricing information, deviations, tax settings, and attributes. All changes are logged in activity trail.

**Actor(s)**: Product Manager, Procurement Staff

**Priority**: Critical

**Frequency**: Weekly (3-10 product updates per week)

**Preconditions**:
- User has update_product permission
- Product exists and is not soft-deleted
- User is authenticated and authorized

**Postconditions**:
- **Success**: Product updated with new values, activity log entries created for each changed field, success message displayed
- **Failure**: Product not updated, validation errors displayed, no database changes

**Main Flow** (Happy Path):
1. User navigates to product detail page or clicks "Edit" from product list
2. System displays product detail page with current values in read-only mode
3. User clicks "Edit" button
4. System enables all editable fields (product code remains read-only)
5. User modifies one or more fields (description, category, costs, etc.)
6. User clicks "Save" button
7. System validates all modified fields against business rules
8. System detects which fields have changed by comparing to original values
9. System updates product record in database with new values
10. System updates updated_by to current user and updated_at to current timestamp
11. For each changed field, system creates activity log entry with field name, old value, new value
12. System displays success message: "Product updated successfully. [N] fields changed."
13. System returns to detail page with updated values displayed
14. Use case ends

**Alternative Flows**:

**Alt-002A: Category Change with Transaction History** (At step 7)
- 7a. System detects category change on product with existing transactions
- 7b. System displays warning dialog: "This product has [N] historical transactions. Changing category may affect reporting. Continue?"
- 7c. User confirms or cancels:
  - If confirm: continue to step 8
  - If cancel: discard category change, return to step 5

**Alt-002B: Cost Change Exceeds Threshold** (At step 7)
- 7a. System detects standard cost change > 10% of current value
- 7b. System displays warning: "Cost change of [X%] requires approval from Finance Manager"
- 7c. System sends approval request notification
- 7d. System saves change with pending_approval flag
- 7e. System creates activity log with approval status
- Continue to step 12

**Alt-002C: No Changes Made** (At step 8)
- 8a. System detects no fields have been modified
- 8b. System displays info message: "No changes detected"
- 8c. System returns to read-only detail view
- Use case ends

**Alt-002D: User Cancels Edit** (At step 5)
- User clicks "Cancel" button
- System displays confirmation if any fields modified: "Discard unsaved changes?"
- User confirms cancellation
- System discards all changes
- System returns to read-only detail view
- Use case ends

**Exception Flows**:

**Exc-002A: Validation Failure** (At step 7)
- System validation fails for one or more fields
- System displays error messages for each failed validation
- System highlights invalid fields in red
- System retains all entered values
- Resume at step 5

**Exc-002B: Concurrent Update Conflict** (At step 9)
- Another user has updated the product since this user loaded it
- System detects updated_at timestamp mismatch
- System displays error: "This product has been modified by another user. Please refresh and retry."
- System offers "Refresh" button to reload current values
- User clicks refresh and sees latest values
- Use case ends (user must re-enter changes)

**Exc-002C: Database Constraint Violation** (At step 9)
- Database update fails due to foreign key or check constraint
- System logs error with constraint details
- System displays user-friendly error: "Unable to save changes due to data integrity issue. Please review your changes."
- System retains form data for correction
- Use case ends

**Business Rules**:
- **BR-PROD-001**: Product code cannot be changed after creation
- **BR-PROD-005**: Inventory unit cannot be changed if transaction history exists
- **BR-PROD-007**: All validation rules enforced on update
- **BR-PROD-022**: All changes must be logged

**Related Requirements**:
- FR-PROD-002: Product Update
- FR-PROD-014: Activity Logging
- NFR-PROD-017: Transactional updates

**Notes**:
- Product code field is read-only and cannot be changed
- Category change impact warning only shown if product has transaction history
- Large cost changes (>10%) may require approval workflow
- Activity log captures before/after values for audit trail

---

### UC-PROD-003: Delete Product (Soft Delete)

**Description**: System administrator deletes a product record using soft delete mechanism (setting deleted_at timestamp). Products with active dependencies cannot be deleted.

**Actor(s)**: System Administrator

**Priority**: High

**Frequency**: Infrequent (1-2 deletions per month)

**Preconditions**:
- User has delete_product permission (System Admin role)
- Product exists and is not already soft-deleted
- User is authenticated and authorized

**Postconditions**:
- **Success**: Product marked as deleted (deleted_at timestamp set), excluded from active lists, activity log entry created
- **Failure**: Product not deleted, blocking message with dependency details displayed, no database changes

**Main Flow** (Happy Path):
1. User navigates to product detail page
2. System displays product information with "Delete" button
3. User clicks "Delete" button
4. System performs dependency check by querying:
   - Active purchase orders with this product
   - Inventory transactions in current fiscal period
   - Active recipes using this product as ingredient
   - Open sales orders with this product
5. System finds no dependencies (all counts are zero)
6. System displays confirmation dialog: "Are you sure you want to delete product '[Code] - [Description]'? This action cannot be easily undone."
7. User confirms deletion
8. System sets deleted_at to current timestamp
9. System sets deleted_by to current user ID
10. System creates activity log entry with action type "DELETED"
11. System displays success message: "Product '[Code]' has been deleted"
12. System redirects to product list page
13. Deleted product no longer appears in active product list
14. Use case ends

**Alternative Flows**:

**Alt-003A: User Cancels Deletion** (At step 7)
- User clicks "Cancel" in confirmation dialog
- System closes dialog without changes
- System returns to product detail page
- Use case ends

**Alt-003B: Product Has Historical Data Only** (At step 5)
- 5a. System finds old transactions (from prior fiscal periods) but no current/active dependencies
- 5b. System allows deletion but displays informational warning
- Continue to step 6 with enhanced message: "This product has historical transaction data that will be retained for reporting. Proceed with deletion?"

**Exception Flows**:

**Exc-003A: Active Purchase Orders Exist** (At step 5)
- System finds [N] active purchase orders referencing this product
- System displays blocking error: "Cannot delete product. [N] active purchase orders reference this product. Please complete or cancel these orders first."
- System displays list of PO numbers with links to details
- System provides "Cancel" button to return to product detail
- Use case ends

**Exc-003B: Current Inventory Transactions Exist** (At step 5)
- System finds inventory transactions in current fiscal period
- System displays blocking error: "Cannot delete product. Inventory transactions exist in current period. Product can only be deleted after period close."
- System displays count of transactions by type (receipts, issues, adjustments)
- Use case ends

**Exc-003C: Active Recipes Use Product** (At step 5)
- System finds [N] active recipes using this product as ingredient
- System displays blocking error: "Cannot delete product. [N] active recipes use this product as ingredient. Please remove from recipes or deactivate recipes first."
- System displays list of recipe names with links
- Use case ends

**Exc-003D: Multiple Dependencies Exist** (At step 5)
- System finds multiple types of dependencies
- System displays blocking error with complete dependency list:
  - "Cannot delete product due to the following dependencies:"
  - "[N] active purchase orders"
  - "[N] inventory transactions"
  - "[N] active recipes"
  - "[N] open sales orders"
- System provides guidance: "Resolve all dependencies before attempting deletion"
- Use case ends

**Business Rules**:
- **BR-PROD-006**: Products with dependencies cannot be deleted
- **BR-PROD-018**: Soft delete only (deleted_at timestamp)
- **BR-PROD-022**: Deletion must be logged

**Related Requirements**:
- FR-PROD-003: Product Deletion (Soft Delete)
- NFR-PROD-010: Soft delete only

**Notes**:
- Soft-deleted products can be restored by admin users via database operation
- Deleted products retained indefinitely for audit and historical reporting
- Dependency check is comprehensive across all ERP modules
- Product code from deleted product cannot be reused (uniqueness across all products)

---

### UC-PROD-006: Manage Product Units

**Description**: User manages multiple unit types for a product including Inventory Unit (base), Order Units (for purchasing), and Ingredient Units (for recipes), each with conversion rates to the base unit. Units support isDefault flag to designate the primary unit and isInverse flag to control conversion calculation direction.

**Actor(s)**: Inventory Manager, Product Manager

**Priority**: Critical

**Frequency**: Weekly (unit changes on 5-10 products per week)

**Preconditions**:
- User has update_product permission
- Product exists and user is in edit mode
- Units master data has at least one active unit
- User is authenticated and authorized

**Postconditions**:
- **Success**: Product units updated, conversion rates saved, activity log entries created, real-time calculator updated
- **Failure**: Units not updated, validation errors displayed, no database changes

**Main Flow** (Happy Path):
1. User is on product edit page
2. System displays three unit management tabs:
   - Inventory Unit (single, required, base unit)
   - Order Units tab (multiple, optional, with conversion rates)
   - Ingredient Units tab (multiple, optional, with conversion rates)
3. User reviews current Inventory Unit (base unit, conversion rate = 1.00000)
4. User clicks Order Units tab
5. User clicks "Add Unit" button in Order Units section
6. System displays order unit entry form with fields:
   - Unit dropdown (populated from available units: BAG, BOX, CASE, PALLET, PACK)
   - Description input (optional, descriptive name)
   - Conversion Factor input (5 decimal places)
   - Default toggle (Switch component)
   - Direction toggle (isInverse flag - controls calculation direction)
7. User selects Unit from dropdown (e.g., "BOX")
8. User enters description (e.g., "Box of 12")
9. User enters conversion factor (e.g., 12.00000)
10. User toggles Direction to set isInverse flag:
    - If isInverse = true: "1 KG = X [Unit]" (multiply by factor)
    - If isInverse = false: "1 [Unit] = X KG" (factor is direct)
11. User optionally enables "Default" switch to make this the default order unit
12. User clicks Save icon to add unit
13. System validates:
    - Unit selected is not already in Order Units list
    - Conversion factor is positive, non-zero, max 5 decimals
14. System adds order unit to product's order units collection
15. System calculates and displays conversion based on isInverse flag:
    - If isInverse: "1 KG = [1/factor] BOX" (e.g., "1 KG = 0.08333 BOX")
    - Calculation formula: "Qty × [1/factor]" displayed below
16. System updates real-time conversion calculator showing all unit relationships
17. System creates activity log entry with action type "UNIT_ADDED"
18. User repeats steps 5-17 for additional order units as needed
19. User clicks Ingredient Units tab
20. User clicks "Add Unit" button
21. System displays ingredient unit entry form with same fields (available units: G, KG, LB, OZ)
22. User adds ingredient units following same process
23. User clicks "Save" button to save all unit changes
24. System saves all units and conversion rates to database
25. System displays success message: "Product units updated successfully"
26. Use case ends

**Alternative Flows**:

**Alt-006A: Change Inventory Unit** (At step 3)
- 3a. User attempts to change Inventory Unit (base unit)
- 3b. System checks if product has transaction history
- 3c. If no history: allow change
- 3d. If history exists: display blocking error: "Inventory unit cannot be changed because product has transaction history. Contact administrator if change is required."
- Resume at step 3

**Alt-006B: Remove Order Unit** (After step 17)
- User clicks delete icon (trash) next to existing order unit
- System displays confirmation: "Remove order unit '[Unit]'?"
- User confirms
- System checks if unit is referenced in any active POs
- If no references: system removes unit, creates activity log "UNIT_REMOVED"
- If references exist: display error: "Cannot remove. Unit referenced in [N] active purchase orders."
- Resume at step 17

**Alt-006C: Edit Conversion Factor** (After step 17)
- User modifies conversion factor in existing unit row (inline editing enabled when in edit mode)
- User updates factor value
- System validates new factor (positive, non-zero, 5 decimals)
- System recalculates conversion display based on isInverse flag
- System creates activity log "UNIT_CHANGED" with old/new factors
- Resume at step 17

**Alt-006D: Set Different Default Order Unit** (At step 11)
- 11a. Another unit is already marked as default
- 11b. User enables "Default" switch on new unit
- 11c. System automatically disables default flag on previous default unit
- 11d. System shows info message: "Default order unit changed from [Old Unit] to [New Unit]"
- Continue to step 12

**Alt-006E: Toggle Direction (isInverse)** (At step 10)
- User clicks Direction toggle button to change isInverse flag
- System immediately recalculates and displays updated conversion text
- System shows visual indicator (rotated arrow icon) for current direction
- Resume at step 11

**Exception Flows**:

**Exc-006A: Duplicate Unit** (At step 13)
- System detects selected unit already exists in Order Units list
- System displays error: "Unit '[Unit]' is already assigned as an order unit"
- System highlights unit dropdown in red
- User selects different unit
- Resume at step 7

**Exc-006B: Invalid Conversion Factor** (At step 13)
- System detects invalid conversion factor (zero, negative, or > 5 decimals)
- System displays error: "Conversion factor must be positive, non-zero, with max 5 decimal places"
- System highlights conversion factor field in red
- User corrects value
- Resume at step 9

**Exc-006C: No Inventory Unit Selected** (At step 23)
- User attempts to save without setting inventory unit
- System displays error: "Inventory unit is required. Please select a base unit."
- System highlights inventory unit section in red
- Resume at step 3

**Business Rules**:
- **BR-PROD-005**: Inventory unit is mandatory and cannot change if transaction history exists
- **BR-PROD-011**: Inventory unit conversion rate always 1.00000
- **BR-PROD-012**: Order units optional, multiple allowed, unique units with isDefault and isInverse flags. Available units: BAG, BOX, CASE, PALLET, PACK
- **BR-PROD-013**: Ingredient units optional, multiple allowed, unique units with isDefault and isInverse flags. Available units: G, KG, LB, OZ
- **BR-PROD-021**: Unit conversion calculation formulas:
  - If isInverse = true: Result = Quantity × (1/factor)
  - If isInverse = false: Result = Quantity × factor

**Related Requirements**:
- FR-PROD-006: Multi-Unit Management
- NFR-PROD-002: Page load < 2 seconds

**UI Mockups**: See product-units-management.png

**Notes**:
- Inventory unit is the base unit (conversion rate = 1.00000 by definition)
- All other units convert to/from the inventory unit
- Real-time calculator shows conversion between any two assigned units
- Conversion factors support up to 5 decimal precision for accurate calculations
- System automatically calculates reverse conversion rates for display based on isInverse flag
- isInverse flag controls whether conversion shows "1 KG = X [Unit]" (inverse) or "1 [Unit] = X KG" (direct)
- Description field allows user-friendly naming (e.g., "Box of 12" for BOX unit)
- Only one unit per type (Order/Ingredient) can be marked as default

---

### UC-PROD-013: View Purchase History

**Description**: User views product's recent purchase history showing the 10 most recent purchase orders and 10 most recent goods receipt notes, enabling analysis of procurement patterns and pricing trends.

**Actor(s)**: Procurement Staff, Finance Manager

**Priority**: High

**Frequency**: Daily (multiple times per day during purchasing decisions)

**Preconditions**:
- User has view_product permission
- Product exists
- User is on product detail page

**Postconditions**:
- **Success**: Purchase history modal displayed with recent POs and GRNs, user can click through to full details
- **Failure**: Error message displayed, empty state shown if no history

**Main Flow** (Happy Path):
1. User is viewing product detail page
2. System displays "Latest Purchase" button/link in header section
3. User clicks "Latest Purchase" button
4. System queries database for:
   - 10 most recent purchase orders containing this product (ordered by delivery date DESC)
   - 10 most recent goods receipt notes for this product (ordered by receipt date DESC)
5. System opens modal/panel with two tabs: "Purchase Orders" and "Receipts"
6. System displays Purchase Orders tab (default) with table showing:
   - Columns: PO Number, Delivery Date, Vendor Name, Location, Status, Quantity, Unit, Price, Currency
   - 10 rows sorted by delivery date (newest first)
   - Each row clickable to navigate to PO detail
7. User reviews purchase order information, observes pricing trends
8. User clicks "Receipts" tab
9. System displays Receipts tab with table showing:
   - Columns: GRN Number, Receipt Date, Vendor Name, Location, Status, Quantity, Unit, Price, Currency
   - 10 rows sorted by receipt date (newest first)
   - Each row clickable to navigate to GRN detail
10. User reviews receipt information, checks actual received costs
11. User clicks row to view full PO or GRN details (opens in new tab)
12. User returns to purchase history modal
13. User clicks "Close" or "X" button to close modal
14. System closes modal, returns to product detail page
15. Use case ends

**Alternative Flows**:

**Alt-013A: No Purchase History Exists** (At step 4)
- 4a. System query returns zero purchase orders and zero receipts
- 4b. System displays empty state message: "No purchase history available for this product"
- 4c. System shows informational icon and text: "Purchase history will appear here after first purchase order is created"
- 4d. User clicks "Close" button
- Use case ends

**Alt-013B: Only Purchase Orders Exist** (At step 4)
- 4a. System finds purchase orders but no receipts yet (orders not yet received)
- 4b. System displays Purchase Orders tab with data
- 4c. System displays Receipts tab with message: "No receipts recorded yet"
- Continue to step 6

**Alt-013C: Only Receipts Exist** (At step 4)
- 4a. System finds receipts but no related purchase orders (direct receipts)
- 4b. System displays Receipts tab with data
- 4c. System displays Purchase Orders tab with message: "No purchase orders found"
- Continue to step 9

**Alt-013D: Export to Excel** (At step 7 or 10)
- User clicks "Export" button on Purchase Orders or Receipts tab
- System generates Excel file with displayed data
- System downloads file: "Product_[Code]_Purchase_History_[Date].xlsx"
- User saves file locally
- Resume at current step

**Exception Flows**:

**Exc-013A: Database Query Timeout** (At step 4)
- Database query exceeds 3-second timeout due to large data volume
- System logs timeout error
- System displays error message: "Purchase history is taking longer than expected to load. Please try again."
- System offers "Retry" button
- User clicks retry and system re-queries
- If second attempt succeeds: continue to step 5
- If second attempt fails: display support contact info, use case ends

**Exc-013B: Procurement Module Unavailable** (At step 4)
- Procurement module service is down or unreachable
- System detects service unavailability
- System displays error: "Purchase history temporarily unavailable. Please try again later."
- System logs integration error for monitoring
- Use case ends

**Business Rules**:
- Display maximum 10 most recent records per type (PO, GRN)
- Sort by date descending (newest first)
- Include all statuses (draft, approved, received, cancelled)
- Price displayed with 2 decimal precision
- Quantity displayed with 3 decimal precision

**Related Requirements**:
- FR-PROD-013: Purchase History Tracking
- NFR-PROD-004: Load within 3 seconds
- Integration with Procurement Module

**UI Mockups**: See purchase-history-modal.png

**Notes**:
- Purchase history provides quick access to recent procurement data
- Helps procurement staff in price negotiations and vendor selection
- Finance managers use for cost analysis and variance tracking
- Clicking row opens full PO/GRN detail in new browser tab
- History includes all transaction statuses for complete visibility

---

### UC-PROD-014: Search and Filter Products

**Description**: User searches for products using type-ahead search and applies multiple filters to quickly locate products from large catalog. Supports advanced filtering with multiple conditions, logical operators (AND/OR), and saved filter presets for reuse.

**Actor(s)**: All Users

**Priority**: High

**Frequency**: Daily (10-20 searches per user per day)

**Preconditions**:
- User has view_product permission
- User is on product list page
- Product data exists in database

**Postconditions**:
- **Success**: Search results displayed with matching products, filters applied, result count shown
- **Failure**: Empty result set with message, or error message if search fails

**Main Flow** (Happy Path):
1. User navigates to product list page
2. System displays search box at top with placeholder: "Search by code, description, barcode..."
3. System displays filter panel with quick filter options:
   - Category hierarchy (expandable tree)
   - Status (Active, Inactive, All)
   - Product Type (isIngredient, isForSale checkboxes)
   - Location Assignment (dropdown of locations)
4. User types search term in search box (e.g., "coffee")
5. System waits 300ms (debounce delay)
6. System performs search query matching term against:
   - Product code (partial match, case-insensitive)
   - English description (partial match, case-insensitive)
   - Local description (partial match, case-insensitive)
   - Barcode (exact match prioritized, then partial)
   - Category name at any level (partial match)
7. System displays search results in table below (live update)
8. System shows result count: "Showing 15 of 150 products"
9. User reviews results, finds some but wants to narrow down further
10. User expands "Food" category in filter panel
11. User checks "Beverages" subcategory checkbox
12. System applies additional filter (AND logic: search term AND category)
13. System updates result list showing only coffee products in Beverages category
14. System updates result count: "Showing 8 of 150 products"
15. System displays active filters as removable tags/pills above result table: "Search: coffee" "Category: Food > Beverages"
16. User finds desired product in filtered results
17. User clicks product row to view details
18. Use case ends

**Alternative Flows**:

**Alt-014A: Clear Search** (After step 8)
- User clicks "X" button in search box to clear search term
- System removes search term
- System re-displays full product list (or with filters still applied)
- System updates result count
- Resume at step 2

**Alt-014B: Clear All Filters** (After step 14)
- User clicks "Clear All Filters" button
- System removes all active filters and search term
- System displays full unfiltered product list
- System updates result count to total products
- Resume at step 2

**Alt-014C: Remove Individual Filter** (After step 15)
- User clicks "X" on specific filter tag (e.g., "Category: Beverages")
- System removes that specific filter only
- System keeps other filters and search term active
- System updates results with remaining filters
- System updates result count
- Resume at current view

**Alt-014D: No Results Found** (At step 7 or 13)
- System query returns zero matching products
- System displays empty state message: "No products found matching your search criteria"
- System suggests: "Try different keywords or clear some filters"
- User modifies search or removes filters
- Resume at step 4 or 10

**Alt-014E: Export Filtered Results** (After step 14)
- User clicks "Export" button while filters are active
- System generates Excel export of filtered results only
- System includes applied filters in filename: "Products_Coffee_Beverages_[Date].xlsx"
- User downloads file
- Resume at step 14

**Alt-014F: Use Advanced Filtering** (At step 3)
- User clicks "Advanced Filters" button
- System opens advanced filter panel with:
  - Multiple filter conditions (add/remove conditions)
  - Field selector for each condition (Category, Status, Product Type, Cost Range, etc.)
  - Operator selector (equals, contains, greater than, less than, etc.)
  - Value input appropriate to field type
  - Logical operator between conditions (AND/OR toggle)
- User adds first condition: "Category equals Beverages"
- User clicks "Add Condition" button
- User adds second condition: "Standard Cost greater than 100"
- User toggles logical operator to "AND"
- User clicks "Apply" button
- System filters results showing products in Beverages with cost > 100
- System displays condition summary in filter tags
- Resume at step 14

**Alt-014G: Save Filter as Preset** (After step 14 or Alt-014F)
- User clicks "Save Filter" icon/button
- System displays save dialog with fields:
  - Filter name input (required)
  - Description (optional)
- User enters name: "Premium Beverages"
- User clicks "Save" button
- System saves filter configuration to user preferences
- System displays success message: "Filter saved"
- Saved filter appears in "Saved Filters" dropdown
- Resume at step 14

**Alt-014H: Load Saved Filter** (At step 3)
- User clicks "Saved Filters" dropdown
- System displays list of user's saved filters with names
- User selects "Premium Beverages" from list
- System loads saved filter configuration
- System applies all conditions from saved filter
- System updates results with saved filter applied
- System displays filter name in active filters area
- Resume at step 14

**Alt-014I: Delete Saved Filter** (At step 3)
- User clicks "Saved Filters" dropdown
- User clicks delete (trash) icon next to a saved filter
- System displays confirmation: "Delete saved filter 'Premium Beverages'?"
- User confirms deletion
- System removes saved filter from user preferences
- System displays success message: "Filter deleted"
- Resume at step 3

**Exception Flows**:

**Exc-014A: Search Query Too Short** (At step 6)
- User types only 1-2 characters
- System displays helper text: "Enter at least 3 characters to search"
- System does not execute search
- User types more characters
- Resume at step 5

**Exc-014B: Search Performance Degradation** (At step 6)
- Search query takes > 2 seconds due to complex filters or large dataset
- System displays loading spinner
- System logs slow query for optimization review
- If query completes within 5 seconds: display results normally
- If query exceeds 5 seconds: display timeout message, suggest narrowing search
- Use case ends or resume at step 4

**Exc-014C: Full-Text Search Index Unavailable** (At step 6)
- Search index service is down or rebuilding
- System falls back to basic database LIKE query (slower)
- System displays warning: "Search may be slower than usual"
- System executes fallback search
- Continue to step 7 with potentially slower response

**Exc-014D: Invalid Filter Value** (At Alt-014F)
- User enters invalid value for field type (e.g., text in numeric field)
- System displays validation error: "Please enter a valid [field type] value"
- System highlights invalid field in red
- User corrects value
- Resume at Alt-014F

**Business Rules**:
- Search is case-insensitive
- Partial matches supported (contains, not just starts-with)
- Multiple quick filters use AND logic (all must match)
- Advanced filter conditions support AND/OR logic (user selectable)
- 300ms debounce prevents excessive queries while typing
- Active filters persist when navigating away and returning
- Saved filters are user-specific (not shared between users)
- Maximum 10 saved filters per user
- isIngredient and isForSale are boolean filter options for product type filtering

**Related Requirements**:
- FR-PROD-015: Product Search and Filtering
- NFR-PROD-003: Search results within 1 second
- NFR-PROD-014: Auto-complete suggestions

**UI Mockups**: See product-search-filters.png

**Notes**:
- Type-ahead search provides instant feedback as user types
- Filter state persists in browser session storage
- Result count helps user understand search effectiveness
- Multiple simultaneous filters support complex queries
- Export respects active filters for reporting
- Advanced filtering supports building complex queries with multiple conditions
- Saved filters improve efficiency for frequent search patterns
- Logical operators (AND/OR) allow flexible condition combinations

---

### UC-PROD-018: Import Products from File

**Description**: System administrator bulk imports products from Excel or CSV file for initial data migration or ongoing bulk updates, with comprehensive validation and error reporting.

**Actor(s)**: System Administrator

**Priority**: Medium

**Frequency**: Infrequent (data migration, quarterly bulk updates)

**Preconditions**:
- User has import_product permission (System Admin role)
- User has prepared Excel/CSV file with product data
- File follows required template format with correct headers
- Dependent master data exists (categories, units, stores)

**Postconditions**:
- **Success**: Valid products imported/updated, counts displayed, activity log entries created, error report available
- **Failure**: No products imported, validation errors displayed with row details, file remains available for correction

**Main Flow** (Happy Path):
1. User navigates to product list page
2. System displays "Import" button in page header
3. User clicks "Import" button
4. System displays import dialog with instructions and "Download Template" link
5. User has already prepared file based on template
6. User clicks "Choose File" button
7. User selects Excel (.xlsx) or CSV (.csv) file from local drive
8. User clicks "Upload" button
9. System uploads file to server (progress indicator shown)
10. System validates file format and headers:
    - File type is .xlsx or .csv
    - Required column headers present: Product Code, English Description, Category, Subcategory, Item Group, Inventory Unit
    - Optional headers recognized: Local Description, Standard Cost, Order Units, etc.
11. System parses all data rows (skips header row)
12. System validates each row:
    - Required fields populated (code, English description, category hierarchy, inventory unit)
    - Product code format valid and unique (within file and against existing products)
    - Category path exists in database
    - Inventory unit exists in units master
    - Numeric fields valid format and range (costs >= 0, deviations 0-100%)
13. System completes validation and displays results summary:
    - "Validation Complete: 95 valid rows, 5 errors"
    - Valid row count
    - Error row count
14. System displays validation errors table:
    - Row number, Product Code, Field, Error Message
    - Example: "Row 12, PROD-012, Category, Category 'Bakery' not found"
15. User reviews errors, has two options:
    - Fix errors and re-upload corrected file
    - Import valid rows only (skip error rows)
16. User clicks "Import Valid Rows Only" button
17. System displays confirmation: "Import 95 valid products? 5 rows with errors will be skipped."
18. User confirms import
19. System processes valid rows in background job:
    - For each row, check if product code exists
    - If exists: update existing product (overwrite with new data)
    - If new: create new product
    - Log each operation (created/updated count)
20. System displays progress: "Importing... 50 of 95 products processed"
21. Import completes successfully
22. System displays success message: "Import complete! 60 products created, 35 updated, 5 skipped (errors)."
23. System generates downloadable error report Excel file with error rows and messages
24. System creates bulk activity log entries with batch identifier
25. User clicks "Download Error Report" to review skipped rows
26. User clicks "Close" to return to product list
27. Newly imported products immediately visible in list
28. Use case ends

**Alternative Flows**:

**Alt-018A: Cancel Upload** (At step 6 or 8)
- User clicks "Cancel" button in import dialog
- System discards uploaded file (if any)
- System closes import dialog
- System returns to product list
- Use case ends

**Alt-018B: Download Template** (At step 4)
- User clicks "Download Template" link
- System generates Excel template file with:
  - All required column headers
  - Example data rows showing correct format
  - Data validation rules embedded (dropdowns for categories, units)
  - Instructions tab with field definitions
- System downloads file: "Product_Import_Template.xlsx"
- User uses template to prepare import data
- Resume at step 6

**Alt-018C: All Rows Valid** (At step 13)
- System validation finds zero errors (all 100 rows valid)
- System displays: "Validation Complete: 100 valid rows, 0 errors"
- System skips error display (step 14) and proceeds directly to import
- User clicks "Import All" button
- Continue to step 17

**Alt-018D: Re-upload After Error Correction** (At step 15)
- User selects "Fix errors and re-upload"
- User clicks "Download Error Report" to get error details
- User corrects errors in original file
- User clicks "Upload Corrected File" button
- System reprocesses entire file
- Resume at step 11 with corrected file

**Alt-018E: Import Cancelled Mid-Process** (At step 20)
- User clicks "Cancel Import" button while processing
- System stops processing immediately (graceful shutdown)
- System rolls back uncommitted transactions
- System displays: "Import cancelled. [N] products imported before cancellation."
- System provides option to "Undo Imported Products" (marks as deleted)
- Use case ends

**Exception Flows**:

**Exc-018A: Invalid File Format** (At step 10)
- File is not .xlsx or .csv format, or file is corrupted
- System displays error: "Invalid file format. Please upload .xlsx or .csv file."
- System rejects file
- Resume at step 6

**Exc-018B: Missing Required Headers** (At step 10)
- File missing required column headers (Product Code, English Description, etc.)
- System displays error: "Missing required columns: [list]. Please use the template."
- System highlights missing columns in red
- User downloads template and reprepares file
- Resume at step 6

**Exc-018C: All Rows Have Errors** (At step 13)
- System validation finds errors in every single row (100% error rate)
- System displays: "Validation Failed: 0 valid rows, 100 errors"
- System blocks import and forces error correction
- System message: "Cannot proceed with import. Please correct all errors and re-upload."
- User downloads error report
- Use case ends

**Exc-018D: Database Constraint Violation** (At step 19)
- During import, database constraint violated (e.g., foreign key, unique constraint)
- System logs detailed error with row context
- System marks specific row as failed
- System continues processing remaining rows (not fatal)
- At completion: display partial success message with failure count
- Error report includes constraint violation details
- Resume at step 22

**Exc-018E: Import Timeout** (At step 19)
- Import process exceeds maximum execution time (30 seconds for 1000 rows)
- System displays error: "Import timed out. Please reduce file size or contact support."
- System logs timeout event for admin investigation
- System provides guidance: "Try importing in smaller batches (max 500 rows)"
- Use case ends

**Business Rules**:
- **BR-PROD-001**: Product codes must be unique
- **BR-PROD-002**: English description required
- **BR-PROD-004**: Category at all three levels required
- **BR-PROD-007**: All data validation rules enforced
- Import supports both insert (new products) and update (existing based on product code)
- Maximum 1000 rows per import file
- Batch operations logged with unique batch identifier

**Related Requirements**:
- FR-PROD-019: Bulk Import/Export
- NFR-PROD-005: Import 1000 records within 30 seconds

**UI Mockups**: See product-import-flow.png

**Notes**:
- Template file includes embedded validation rules for easier data entry
- Error report downloadable as Excel with error details in dedicated column
- Import process is transactional per product (one failure doesn't roll back all)
- Large imports process in background to avoid UI blocking
- Progress indicator shows real-time status during import
- Support for both creating new products and updating existing (based on product code match)

---

## System Use Cases

### UC-PROD-101: Update Last Receiving Cost

**Description**: When a Goods Receipt Note (GRN) is posted for a product, the system automatically updates the product's Last Receiving Cost, Last Receiving Date, and Last Receiving Vendor fields.

**Trigger**: GRN posted/completed for product

**Actor(s)**:
- **Primary**: GRN Module (automated)
- **Secondary**: Product module receives update

**Priority**: High

**Frequency**: Real-time (triggered by each GRN posting)

**Preconditions**:
- GRN record exists and is being posted/completed
- GRN contains product line items with unit cost
- Product exists in products table
- GRN status changing to "Posted" or "Completed"

**Postconditions**:
- **Success**: Product Last Receiving Cost, Date, and Vendor updated, activity log entry created
- **Failure**: GRN posting continues, error logged for manual correction

**Main Flow**:
1. GRN Module initiates GRN posting process
2. GRN Module iterates through each product line item in GRN
3. For each product, GRN Module extracts:
   - Product ID
   - Unit Cost (in base currency)
   - Receipt Date
   - Vendor ID/Name
4. GRN Module calls Product Module API: `updateLastReceivingCost(productId, cost, date, vendor)`
5. Product Module receives API call
6. Product Module validates input data:
   - Product ID exists
   - Cost is numeric and >= 0
   - Date is valid timestamp
   - Vendor is valid string
7. Product Module updates product record:
   - lastReceivingCost = received cost
   - lastReceivingDate = receipt date
   - lastReceivingVendor = vendor name
   - updatedAt = current timestamp
   - updatedBy = 'system' or GRN user ID
8. Product Module creates activity log entry:
   - activityType = 'COST_CHANGED'
   - description = 'Last receiving cost updated from GRN [GRN_NUMBER]'
   - oldValue = previous cost (serialized)
   - newValue = new cost (serialized)
   - fieldName = 'lastReceivingCost'
9. Product Module returns success response to GRN Module
10. GRN Module continues with next product line item
11. All product costs updated successfully
12. Process completes

**Alternative Flows**:

**Alt-101A: Multiple Products in Single GRN** (At step 2)
- GRN contains 10+ different products
- System processes each product sequentially
- Updates made independently (one failure doesn't affect others)
- Continue to step 3 for each product

**Alt-101B: Same Product Multiple Times in GRN** (At step 3)
- GRN line items include same product multiple times (different batch/lot)
- System processes each line item
- Last line item processed becomes the "last receiving cost"
- Only single activity log entry created (not one per line)
- Continue to step 4

**Alt-101C: Cost Unchanged** (At step 7)
- New cost equals current last receiving cost
- System updates date and vendor but not cost
- Activity log records date/vendor change only
- Continue to step 9

**Exception Flows**:

**Exc-101A: Product Not Found** (At step 6)
- Product ID does not exist in products table (data integrity issue)
- System logs error: "Product [ID] not found during GRN cost update"
- System continues processing other products (non-fatal)
- GRN posting continues
- Admin notification sent for investigation
- Process continues

**Exc-101B: Invalid Cost Value** (At step 6)
- Cost is negative or non-numeric
- System logs validation error
- System skips cost update for this product
- Activity log records attempted update with validation failure
- GRN posting continues
- Admin notification sent
- Process continues

**Exc-101C: Database Update Failure** (At step 7)
- Database update fails (connection timeout, constraint violation)
- System logs database error with full context
- System does NOT retry automatically (to prevent race conditions)
- GRN posting continues
- Admin notification sent with error details
- Process continues (non-fatal to GRN posting)

**Exc-101D: Activity Log Service Unavailable** (At step 8)
- Activity logging service is down
- Cost update succeeds but log entry fails
- System logs logging failure separately
- GRN posting continues (logging is non-critical)
- Process completes

**Data Contract**:

**Input Data Requirements**:
- **productId**: UUID - Product identifier from GRN line item
- **unitCost**: Decimal(10,2) - Cost per unit in base currency (positive, non-zero)
- **receiptDate**: Timestamp - Date GRN was received (not future date)
- **vendorName**: String(255) - Vendor name from GRN header

**Validation Rules**:
- productId must exist in products table
- unitCost must be >= 0, max 2 decimals
- receiptDate must be valid timestamp, not future
- vendorName max 255 characters

**Output Data Structure**:
- **status**: 'success' | 'partial' | 'failure'
- **updatedProducts**: Array of product IDs successfully updated
- **failedProducts**: Array of {productId, reason} for failures
- **transactionId**: UUID for this batch update

**Business Rules**:
- **BR-PROD-016**: Costs stored in base currency only
- **BR-PROD-021**: Last receiving cost is most recent GRN cost
- **BR-PROD-022**: Cost changes logged to activity log

**SLA**:
- **Processing Time**: <100ms per product
- **Availability**: 99.9% (follows GRN module availability)
- **Recovery Time**: Manual correction via admin interface if automated update fails

**Monitoring**:
- Count of cost updates per day
- Average update time per product
- Error rate (% of failed updates)
- Validation failure count by reason

**Rollback Procedure**:
If incorrect cost update detected:
1. Query activity log for original cost value
2. Admin manually updates product via UI to correct value
3. Activity log records manual correction
4. GRN remains unchanged (source of truth)

**Related Requirements**:
- FR-PROD-008: Cost Tracking
- Integration with GRN Module

---

### UC-PROD-102: Log Product Activity

**Description**: System automatically logs all product data changes to activity log table for audit trail and compliance.

**Trigger**: Any product CRUD operation (create, update, delete, status change, unit change, store assignment)

**Actor(s)**:
- **Primary**: Activity Log Service (automated)
- **Secondary**: Product Module triggers log entries

**Priority**: Medium

**Frequency**: Real-time (triggered by every product change)

**Preconditions**:
- Product change operation initiated by user or system
- User context available (user ID, IP address, user agent)
- Activity log service is running

**Postconditions**:
- **Success**: Activity log entry created with full change details, entry immutable
- **Failure**: Product change succeeds, log failure recorded separately (logging is non-critical)

**Main Flow**:
1. Product Module receives product change request (create, update, delete, etc.)
2. Product Module processes business logic and validates data
3. Product Module prepares change data:
   - Product ID
   - User ID (from session/token)
   - Activity Type (CREATED, UPDATED, DELETED, etc.)
   - Description (human-readable summary)
   - Changed field names (for updates)
   - Old values (before change)
   - New values (after change)
   - IP address (from request context)
   - User agent (from request headers)
4. Product Module executes database transaction:
   - 4a. Update/insert/delete product record
   - 4b. Insert activity log entry
   - 4c. Commit transaction (both succeed or both rollback)
5. Activity log entry persisted to database:
   - id = new UUID
   - productId = affected product
   - userId = current user
   - activityDate = current timestamp (UTC)
   - activityType = action type
   - description = summary
   - fieldName = changed field (null for create/delete)
   - oldValue = previous value serialized as JSON
   - newValue = new value serialized as JSON
   - ipAddress = user IP
   - userAgent = browser/client info
6. Transaction commits successfully
7. Product Module returns success response
8. Process completes

**Alternative Flows**:

**Alt-102A: Multiple Fields Changed** (At step 3)
- User updated 5 fields in single save operation
- System creates separate activity log entry for each changed field
- All entries share same timestamp and transaction
- Each entry has specific fieldName, oldValue, newValue
- Continue to step 4

**Alt-102B: Bulk Operation** (At step 3)
- Bulk import updated 100 products
- System creates activity log entry for each product
- All entries tagged with batch identifier in description
- Entries processed efficiently in batch insert
- Continue to step 4

**Alt-102C: System-Triggered Change** (At step 3)
- Change triggered by automated process (e.g., GRN cost update)
- userId = system service account or 'SYSTEM'
- ipAddress = server IP or null
- userAgent = 'System Process' or service name
- Continue to step 4

**Exception Flows**:

**Exc-102A: Activity Log Insert Fails** (At step 4)
- Product update succeeds but log insert fails (disk full, service down)
- Database transaction configured with:
  - Option 1: Rollback entire transaction (strict audit requirement)
  - Option 2: Commit product change, log failure separately (availability priority)
- System logs logging failure to separate error log
- If Option 1: Product change fails with error message
- If Option 2: Product change succeeds, background job retries logging
- Admin notification sent for logging failures

**Exc-102B: Activity Log Service Unavailable** (At step 5)
- Activity log database partition unavailable
- System queues log entry to message queue for later processing
- Product change succeeds
- Background job processes queued entries when service recovers
- Process completes

**Exc-102C: Serialization Error** (At step 3)
- Complex object (nested data) fails JSON serialization
- System logs serialization error
- System uses simple string representation as fallback
- Activity log entry created with "Serialization Error" note
- Product change continues
- Process completes

**Data Contract**:

**Input Data Requirements**:
- **productId**: UUID - Product being changed
- **userId**: UUID - User making change (or 'SYSTEM')
- **activityType**: ENUM - Type of change from predefined list
- **description**: String(500) - Human-readable summary
- **fieldName**: String(100) - Name of changed field (null for create/delete)
- **oldValue**: String(1000) - Previous value as JSON string
- **newValue**: String(1000) - New value as JSON string
- **ipAddress**: String(45) - IPv4 or IPv6 address
- **userAgent**: String(255) - Browser/client identification

**Activity Types Supported**:
- CREATED - Product created
- UPDATED - General field update
- DELETED - Product soft deleted
- STATUS_CHANGED - isActive toggled
- UNIT_ADDED - New unit added to product
- UNIT_CHANGED - Unit conversion rate modified
- UNIT_REMOVED - Unit removed from product
- STORE_ASSIGNED - Product assigned to store
- STORE_REMOVED - Store assignment removed
- COST_CHANGED - Standard cost or last receiving cost updated

**Business Rules**:
- **BR-PROD-022**: All changes must be logged
- Activity log entries are immutable (no updates or deletes)
- Activity log retained indefinitely (no purging)
- Each log entry is atomic and independent

**SLA**:
- **Insert Time**: <50ms per entry
- **Availability**: 99.9%
- **Storage**: Unlimited retention

**Monitoring**:
- Activity log entries per hour
- Average insert time
- Failed log attempts count
- Storage growth rate

**Related Requirements**:
- FR-PROD-014: Activity Logging
- NFR-PROD-009: All changes logged with user, timestamp, IP

---

## Integration Use Cases

### UC-PROD-201: Product Selection in Procurement

**Description**: Procurement module retrieves product data for purchase request and purchase order entry, including validation of costs and deviations.

**Actor(s)**:
- **Primary**: Procurement Module
- **External System**: Product Module

**Trigger**: User creating/editing Purchase Request or Purchase Order

**Integration Type**: REST API

**Direction**: Outbound (Procurement calls Product)

**Priority**: Critical

**Frequency**: Real-time (every PR/PO entry)

**Preconditions**:
- Products exist in product master
- User is authenticated in procurement module
- Product API service is available

**Postconditions**:
- **Success**: Product data retrieved, displayed in procurement form, validation rules applied
- **Failure**: Error message displayed, procurement entry blocked until resolved

**Main Flow** (Outbound Example):
1. User is creating Purchase Request in Procurement module
2. User begins typing product code or description in product selection field
3. Procurement module sends type-ahead search request to Product API:
   - Endpoint: GET /api/products/search?q=[term]&active=true
   - Query includes: search term, active status filter, limit=10
4. Product API receives request
5. Product API queries products table with full-text search
6. Product API returns top 10 matching active products with data:
   - Product ID, Product Code, English Description, Category Path
   - Inventory Unit, Default Order Unit, Standard Cost
   - Price Deviation %, Quantity Deviation %
7. Procurement module receives response (JSON array)
8. Procurement module displays dropdown with search results
9. User selects product from dropdown
10. Procurement module populates form fields with product data:
    - Product code and description (read-only)
    - Unit dropdown (pre-populated with product's order units)
    - Unit price field (defaulted to standard cost)
    - Quantity field (blank for user entry)
11. User enters quantity and unit price
12. Procurement module validates price against deviation limit:
    - Calculate: |Unit Price - Standard Cost| / Standard Cost * 100
    - Compare to product's price deviation %
13. If within deviation: allow save
14. If exceeds deviation: display warning, require approval override
15. User completes PR/PO entry
16. Process completes

**Alternative Flows**:

**Alt-201A: Product Detail Lookup** (After step 9)
- User needs full product information before selecting
- User clicks "View Details" link next to product in dropdown
- Procurement module calls: GET /api/products/{id}
- Product API returns full product details including units, costs, tax, attributes
- Procurement module displays product detail modal
- User reviews details, closes modal
- Resume at step 9

**Alt-201B: No Products Found** (At step 6)
- Search query returns zero matching products
- Product API returns empty array with 200 OK status
- Procurement module displays: "No products found matching '[term]'"
- User refines search term
- Resume at step 3

**Alt-201C: Price Exceeds Deviation** (At step 13)
- Price variance is 15% but product deviation limit is 10%
- Procurement module displays warning:
  - "Price variance (15%) exceeds allowed deviation (10%)"
  - "This purchase requires approval from Department Manager"
- User options:
  - Adjust price to within limit
  - Request approval override (sends notification)
  - Save as draft (pending approval)
- Resume at step 15 based on user choice

**Exception Flows**:

**Exc-201A: Product API Unavailable** (At step 4)
- Product API service is down or unreachable
- HTTP timeout (5 second) or connection refused
- Procurement module displays error: "Product service temporarily unavailable. Please try again."
- User can retry or contact support
- Process ends

**Exc-201B: Invalid Product Data** (At step 7)
- Product API returns data with missing required fields
- Procurement module detects validation failure
- Procurement module logs integration error
- Procurement module displays: "Invalid product data. Please contact support."
- User cannot proceed with this product
- Process ends

**Exc-201C: Concurrent Product Update** (Between steps 9 and 15)
- Product master data changed while user was entering PR/PO
- User's cached product data is now stale
- Procurement module detects version mismatch on save
- Procurement module displays: "Product data has changed. Please refresh."
- User clicks refresh to get latest data
- Resume at step 3

**API Contract**:

**Request**:
```json
GET /api/products/search?q=coffee&active=true&limit=10
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
```

**Response**:
```json
{
  "status": "success",
  "count": 3,
  "data": [
    {
      "id": "uuid-1234",
      "productCode": "PROD-001",
      "englishDescription": "Premium Coffee Beans",
      "localDescription": "กาแฟเมล็ดพรีเมียม",
      "categoryPath": "Food/Beverages/Coffee",
      "inventoryUnit": {
        "id": "unit-uuid",
        "code": "KG",
        "name": "Kilogram"
      },
      "defaultOrderUnit": {
        "id": "unit-uuid-2",
        "code": "BAG",
        "name": "Bag",
        "conversionRate": 5.00000
      },
      "standardCost": 250.00,
      "priceDeviation": 10.00,
      "quantityDeviation": 5.00,
      "isActive": true
    }
  ]
}
```

**Error Handling**:
- 200 OK: Success (even if 0 results)
- 400 Bad Request: Invalid query parameters
- 401 Unauthorized: Missing or invalid auth token
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Product ID not found (detail lookup)
- 500 Internal Server Error: Server-side error
- 503 Service Unavailable: Service down

**Data Mapping**:

| Product Field | Procurement Field | Transformation |
|---------------|-------------------|----------------|
| productCode | item_code | Direct mapping |
| englishDescription | item_description | Direct mapping |
| standardCost | unit_price | Default value (user can override) |
| priceDeviation | price_tolerance | Used in validation |
| quantityDeviation | quantity_tolerance | Used in validation |
| defaultOrderUnit | unit | Dropdown default selection |
| orderUnits[] | unit_options | Populate dropdown choices |

**Monitoring**:
- API call count per day
- Average response time
- Error rate by error type
- Cache hit rate (if caching implemented)

**Fallback Strategy**:
If Product API unavailable for extended period:
- Procurement module allows manual product code entry
- Validation disabled (manual override)
- Warning displayed about missing validation
- After service recovery, batch validation job checks historical entries

**Related Requirements**:
- FR-PROD-009: Price Deviation Control
- NFR-PROD-003: Search results within 1 second
- Integration with Procurement Module

---

### UC-PROD-202: Product Data for Inventory

**Description**: Inventory module retrieves product unit conversion data for inventory transactions, stock tracking, and threshold monitoring.

**Actor(s)**:
- **Primary**: Inventory Module
- **External System**: Product Module

**Trigger**: Inventory transaction (receipt, issue, adjustment, transfer)

**Integration Type**: REST API

**Direction**: Bidirectional (Inventory calls Product for data, Product queries Inventory for stock levels)

**Priority**: Critical

**Frequency**: Real-time (every inventory transaction)

**Preconditions**:
- Products exist with inventory unit defined
- Product assigned to store/location
- Inventory transaction being created/processed

**Postconditions**:
- **Success**: Unit conversions calculated correctly, inventory updated in base unit, stock levels compared to thresholds
- **Failure**: Transaction validation error, inventory not updated

**Main Flow**:
1. User creates Goods Receipt in Inventory module
2. User selects product and store/location
3. Inventory module calls Product API to get product data:
   - Endpoint: GET /api/products/{id}/inventory-data?storeId={storeId}
4. Product API returns:
   - Product ID, Code, Description
   - Inventory Unit (base unit) with ID, code, name
   - Order Units with conversion rates
   - Store assignment with min/max thresholds for selected store
5. Inventory module displays unit dropdown with all order units
6. User enters received quantity: 10
7. User selects unit: Box
8. Inventory module needs to convert to base unit (inventory unit)
9. Inventory module calls Product API for conversion:
   - Endpoint: POST /api/products/convert-unit
   - Body: {productId, fromUnit: "Box", toUnit: "Each", quantity: 10}
10. Product API retrieves conversion rate: 1 Box = 12 Each
11. Product API calculates: 10 Box × 12 = 120 Each
12. Product API returns: {convertedQuantity: 120.000, targetUnit: "Each"}
13. Inventory module records transaction with 120 Each in inventory unit
14. Inventory module calculates new stock level: Previous stock + 120 Each
15. Inventory module compares to thresholds:
    - New stock: 350 Each
    - Minimum threshold: 100 Each (from product store assignment)
    - Maximum threshold: 500 Each
16. Stock within thresholds, no alert triggered
17. Transaction saved successfully
18. Process completes

**Alternative Flows**:

**Alt-202A: Stock Below Minimum** (At step 15)
- New stock level is 80 Each
- Minimum threshold is 100 Each
- Inventory module triggers low stock alert
- Notification sent to procurement staff and store manager
- Alert displayed in dashboard
- Continue to step 17

**Alt-202B: Stock Above Maximum** (At step 15)
- New stock level is 550 Each
- Maximum threshold is 500 Each
- Inventory module triggers overstock warning
- Warning logged for review
- Dashboard shows overstock indicator
- Continue to step 17

**Alt-202C: Convert Between Non-Base Units** (At step 9)
- User wants to convert 5 Boxes to Cartons (both are order units)
- Inventory module calls: POST /api/products/convert-unit
  - Body: {productId, fromUnit: "Box", toUnit: "Carton", quantity: 5}
- Product API converts to base unit first: 5 Box × 12 = 60 Each
- Product API converts from base to target: 60 Each ÷ 24 = 2.5 Cartons
- Product API returns: {convertedQuantity: 2.500, targetUnit: "Carton"}
- Inventory module displays conversion result
- Continue to step 13

**Exception Flows**:

**Exc-202A: Product Not Assigned to Store** (At step 4)
- Product API finds product but no store assignment for requested store
- Product API returns error response:
  - Status: 400 Bad Request
  - Message: "Product [Code] is not assigned to store [Name]"
- Inventory module displays error to user
- User must assign product to store first or select different store
- Transaction cannot proceed
- Process ends

**Exc-202B: Unit Not Found** (At step 10)
- User selected unit that is not assigned to product
- Product API cannot find conversion rate
- Product API returns error response:
  - Status: 400 Bad Request
  - Message: "Unit 'Box' is not assigned to product [Code]"
- Inventory module displays error
- User must select valid unit from dropdown
- Process ends

**Exc-202C: Conversion Rate Zero or Missing** (At step 10)
- Product data has invalid conversion rate (0.00000 or null)
- Product API detects data integrity issue
- Product API logs error for admin investigation
- Product API returns error:
  - Status: 500 Internal Server Error
  - Message: "Invalid conversion rate for product [Code], unit [Unit]"
- Inventory module displays error with support contact
- Transaction blocked until data corrected
- Process ends

**API Contract**:

**Get Product Inventory Data**:
```json
GET /api/products/{id}/inventory-data?locationId={locationId}
Response:
{
  "productId": "uuid",
  "productCode": "PROD-001",
  "englishDescription": "Coffee Beans",
  "inventoryUnit": {
    "id": "unit-uuid",
    "code": "KG",
    "name": "Kilogram"
  },
  "orderUnits": [
    {
      "id": "unit-uuid-2",
      "code": "BAG",
      "description": "Bag (5kg)",
      "factor": 5.00000,
      "isDefault": true,
      "isInverse": false
    }
  ],
  "ingredientUnits": [
    {
      "id": "unit-uuid-3",
      "code": "G",
      "description": "Gram",
      "factor": 0.001,
      "isDefault": false,
      "isInverse": true
    }
  ],
  "locationAssignment": {
    "locationId": "location-uuid",
    "locationName": "Main Kitchen",
    "locationCode": "LOC-001",
    "shelfId": "shelf-uuid",
    "shelfName": "Shelf A-1",
    "minQuantity": 100.000,
    "maxQuantity": 500.000,
    "reorderPoint": 150.000,
    "parLevel": 300.000,
    "tags": ["dry-goods", "high-usage"]
  }
}
```

**Unit Conversion API**:
```json
POST /api/products/convert-unit
Request Body:
{
  "productId": "uuid",
  "fromUnitCode": "BAG",
  "toUnitCode": "KG",
  "quantity": 10
}
Response:
{
  "status": "success",
  "convertedQuantity": 50.000,
  "fromUnit": "BAG",
  "toUnit": "KG",
  "conversionRate": 5.00000,
  "formula": "10 BAG × 5.00000 = 50.000 KG"
}
```

**Data Mapping**:

| Product Field | Inventory Field | Usage |
|---------------|----------------|--------|
| inventoryUnit | base_unit | Primary unit for stock tracking |
| orderUnits[].factor | conversion_rates | Order unit conversion calculations |
| orderUnits[].isInverse | conversion_direction | Controls calculation direction |
| ingredientUnits[].factor | ingredient_rates | Ingredient unit conversion calculations |
| ingredientUnits[].isInverse | ingredient_direction | Controls ingredient calculation direction |
| locationAssignment.minQuantity | reorder_point | Low stock alerts |
| locationAssignment.maxQuantity | max_stock_level | Overstock warnings |
| locationAssignment.reorderPoint | reorder_trigger | Reorder notification threshold |
| locationAssignment.parLevel | target_stock | Target inventory level |
| locationAssignment.shelfId | shelf_location | Physical storage location |
| locationAssignment.tags | inventory_tags | Categorization tags |

**Monitoring**:
- Unit conversion API calls per day
- Average conversion time
- Conversion errors by product
- Stock threshold violations per store

**Related Requirements**:
- FR-PROD-006: Multi-Unit Management
- BR-PROD-021: Unit Conversion Calculations
- Integration with Inventory Module

---

## Use Case Traceability Matrix

| Use Case | Functional Req | Business Rule | Test Case | Status |
|----------|----------------|---------------|-----------|--------|
| UC-PROD-001 | FR-PROD-001 | BR-PROD-001, BR-PROD-002, BR-PROD-004, BR-PROD-005 | TC-PROD-001 | Planned |
| UC-PROD-002 | FR-PROD-002 | BR-PROD-001, BR-PROD-005, BR-PROD-022 | TC-PROD-002 | Planned |
| UC-PROD-003 | FR-PROD-003 | BR-PROD-006, BR-PROD-018 | TC-PROD-003 | Planned |
| UC-PROD-004 | FR-PROD-004 | BR-PROD-003 | TC-PROD-004 | Planned |
| UC-PROD-005 | FR-PROD-005 | BR-PROD-004, BR-PROD-010 | TC-PROD-005 | Planned |
| UC-PROD-006 | FR-PROD-006 | BR-PROD-005, BR-PROD-011, BR-PROD-012, BR-PROD-013 | TC-PROD-006 | Planned |
| UC-PROD-007 | FR-PROD-007 | BR-PROD-014, BR-PROD-015 | TC-PROD-007 | Planned |
| UC-PROD-008 | FR-PROD-008 | BR-PROD-016, BR-PROD-021 | TC-PROD-008 | Planned |
| UC-PROD-009 | FR-PROD-009 | BR-PROD-008, BR-PROD-009, BR-PROD-020 | TC-PROD-009 | Planned |
| UC-PROD-010 | FR-PROD-010 | BR-PROD-017 | TC-PROD-010 | Planned |
| UC-PROD-011 | FR-PROD-011 | BR-PROD-019 | TC-PROD-011 | Planned |
| UC-PROD-012 | FR-PROD-012 | BR-PROD-023 | TC-PROD-012 | Planned |
| UC-PROD-013 | FR-PROD-013 | Integration with Procurement | TC-PROD-013 | Planned |
| UC-PROD-014 | FR-PROD-015 | Usability requirements | TC-PROD-014 | Planned |
| UC-PROD-015 | FR-PROD-016 | Performance requirements | TC-PROD-015 | Planned |
| UC-PROD-016 | FR-PROD-017 | Usability requirements | TC-PROD-016 | Planned |
| UC-PROD-017 | FR-PROD-018 | Integration with barcode devices | TC-PROD-017 | Planned |
| UC-PROD-018 | FR-PROD-019 | BR-PROD-001, BR-PROD-007 | TC-PROD-018 | Planned |
| UC-PROD-019 | FR-PROD-019 | Data export requirements | TC-PROD-019 | Planned |
| UC-PROD-020 | FR-PROD-020 | Reporting requirements | TC-PROD-020 | Planned |
| UC-PROD-101 | System Process | BR-PROD-016, BR-PROD-021 | TC-PROD-101 | Planned |
| UC-PROD-102 | System Process | BR-PROD-022 | TC-PROD-102 | Planned |
| UC-PROD-201 | Integration | FR-PROD-009 | TC-PROD-201 | Planned |
| UC-PROD-202 | Integration | FR-PROD-006, BR-PROD-021 | TC-PROD-202 | Planned |

---

## Appendix

### Glossary

- **Actor**: Person, system, or external service that interacts with the product module to achieve a goal
- **Use Case**: Complete description of how actors interact with system to accomplish specific objective
- **Precondition**: State or condition that must be true before use case can execute
- **Postcondition**: State or condition that is true after successful completion of use case
- **Main Flow**: Primary sequence of steps in the happy path scenario (no errors)
- **Alternative Flow**: Valid variations from main flow that still achieve the goal
- **Exception Flow**: Error conditions that prevent use case from completing successfully
- **System Actor**: Automated service or external module that interacts with product module
- **Integration Use Case**: Use case describing interaction between product module and external system

### Common Patterns

**Pattern: Form Submission with Validation**
1. User fills form fields
2. User clicks submit button
3. System validates client-side (immediate feedback)
4. System submits to server via API
5. Server validates again (security and business rules)
6. Server processes and saves data
7. Server responds with success or error
8. System displays result message to user
9. System updates UI with new data

**Pattern: List with Search and Pagination**
1. User navigates to list page
2. System loads first page (default 25 rows)
3. System displays rows with pagination controls
4. User types search term
5. System filters list (300ms debounce)
6. System displays filtered results
7. User clicks next page
8. System loads page 2 of filtered results
9. System updates display

**Pattern: Master-Detail Navigation**
1. User views list of master records
2. User clicks row to view details
3. System navigates to detail page
4. System loads full record data
5. System displays detail view
6. User clicks edit button
7. System enables edit mode
8. User modifies fields
9. User saves changes
10. System returns to detail view (read-only)

**Pattern: Soft Delete with Dependency Check**
1. User initiates delete action
2. System checks for dependencies across modules
3. If dependencies exist: display blocking error with details
4. If no dependencies: display confirmation dialog
5. User confirms deletion
6. System sets deleted_at timestamp and deleted_by user ID
7. System creates activity log entry
8. System displays success message
9. Deleted record excluded from active lists

---

**Document End**

> 📝 **Note to Reviewers**:
> - Use cases derived from functional requirements in BR-products.md
> - Each use case includes comprehensive flows for all scenarios
> - Integration use cases detail API contracts and data flows
> - Traceability matrix links use cases to requirements and tests
> - Test cases (TC-PROD-xxx) to be developed in separate test plan document
