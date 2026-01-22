# Business Requirements: Unit Management

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
| 1.1.0 | 2026-01-15 | System | Added MEASURE unit type for ingredient measurements, updated unit type descriptions to align with code |


## Overview

The Unit Management sub-module provides a centralized system for managing all measurement units used throughout the Carmen ERP system. Units are fundamental to inventory management, purchasing, recipe management, and product specifications in hospitality operations. This module enables hotel staff to maintain a standardized catalog of measurement units across four distinct categories: inventory units (for stock tracking), order units (for procurement), recipe units (for serving/portion output), and measure units (for ingredient measurements in recipes).

The system supports different types of measurement units required in hotel operations, from weight measurements (kilograms, grams) for kitchen inventory to volume measurements (liters, milliliters) for beverages, and specialized recipe measurements (teaspoons, tablespoons, cups) for food preparation. Each unit can be independently managed with full lifecycle control including creation, modification, activation/deactivation, and deletion.

This sub-module serves as the foundation for unit conversions in the Product Management module and ensures consistency in measurements across procurement, inventory, and operational planning workflows throughout the hotel enterprise.

## Business Objectives

1. **Standardize Measurements**: Establish a single source of truth for all measurement units used across kitchen, housekeeping, and maintenance departments to eliminate confusion and errors in ordering and inventory management.

2. **Support Multiple Unit Types**: Enable differentiation between inventory units (stock counting), order units (purchasing), and recipe units (food preparation) to accommodate different operational contexts in hospitality.

3. **Ensure Data Integrity**: Prevent deletion or modification of units that are actively used in products, recipes, or transactions, protecting critical business data from accidental corruption.

4. **Facilitate Unit Conversions**: Provide the base unit catalog that enables automatic conversions between different measurement systems (metric/imperial) in product and recipe management.

5. **Enable Operational Flexibility**: Allow authorized staff to add custom units specific to hotel operations while maintaining standard units required for reporting and compliance.

6. **Improve Search Efficiency**: Enable quick lookup of units through search and filtering capabilities, reducing time spent by purchasing staff, chefs, and storekeepers when creating orders or recipes.

7. **Support Audit Compliance**: Maintain complete audit trail of unit changes including creation dates, modification history, and active status for regulatory compliance in food service operations.

## Key Stakeholders

- **Primary Users**: Purchasing Manager, Head Chef, Storekeeper (manage and maintain unit catalog)
- **Secondary Users**: Sous Chef, Receiving Clerk, Kitchen Staff (reference units when creating recipes or processing deliveries)
- **Administrators**: System Administrator, IT Manager (configure system-wide unit settings and permissions)
- **Approvers**: General Manager, Financial Controller (approve addition of custom units)
- **Reviewers**: Internal Auditor, Quality Manager (audit unit usage and compliance)
- **Support**: IT Support Team (troubleshoot unit-related issues)

---

## Functional Requirements

### FR-UNIT-001: View Unit List
**Priority**: Critical

As a Purchasing Manager, I want to view a comprehensive list of all measurement units so that I can quickly reference available units when setting up products or creating purchase orders.

**Acceptance Criteria**:
- System displays all units in a table format with columns: Code, Name, Type, Status, Description
- Units are sortable by any column (ascending/descending)
- Default sort is alphabetical by unit code
- System shows unit count summary (e.g., "Showing 12 of 12 units")
- Each unit row displays color-coded status badge (green for active, gray for inactive)
- Unit type is displayed with category badge (INVENTORY, ORDER, RECIPE)

**Related Requirements**: FR-UNIT-002, FR-UNIT-003

---

### FR-UNIT-002: Search and Filter Units
**Priority**: High

As a Head Chef, I want to search and filter units by name, code, type, or status so that I can quickly find specific measurement units needed for recipe creation without scrolling through the entire list.

**Acceptance Criteria**:
- Search box filters units in real-time by name, code, or description
- Type filter dropdown includes options: All Types, INVENTORY, ORDER, RECIPE, MEASURE
- Status filter dropdown includes options: All Status, Active, Inactive
- Multiple filters can be applied simultaneously
- Search is case-insensitive and matches partial text
- Filter results update immediately without page reload
- System displays "No units found matching your criteria" when filters return zero results

**Related Requirements**: FR-UNIT-001

---

### FR-UNIT-003: Switch View Modes
**Priority**: Medium

As a Storekeeper, I want to switch between table view and card view so that I can choose the display format that works best for my device (desktop vs. tablet) and task context.

**Acceptance Criteria**:
- View toggle buttons appear in toolbar (Table icon and Grid icon)
- Table view displays units in tabular format with all fields visible
- Card view displays units as cards with key information (code, name, type, status)
- View mode preference is maintained during session
- Both views support same filtering and search functionality
- View switch occurs instantly without data reload

**Related Requirements**: FR-UNIT-001

---

### FR-UNIT-004: Create New Unit
**Priority**: High

As a Purchasing Manager, I want to create new measurement units so that I can add custom units specific to our hotel's operational needs (e.g., hotel-specific packaging sizes).

**Acceptance Criteria**:
- "Add Unit" button is prominently displayed in page header
- Clicking button opens unit creation form/dialog
- Form includes fields: Code (required), Name (required), Description (optional), Type (required dropdown), Status (active by default)
- Code field accepts only uppercase alphanumeric characters and hyphens
- Code must be unique across all units
- Name field accepts alphanumeric characters and spaces (max 100 characters)
- Type dropdown offers four options: INVENTORY, ORDER, RECIPE, MEASURE
- Form validates all required fields before submission
- System displays success message upon successful creation
- Newly created unit appears in the unit list immediately

**Related Requirements**: BR-UNIT-001, BR-UNIT-002, VAL-UNIT-001

---

### FR-UNIT-005: Edit Existing Unit
**Priority**: High

As a Purchasing Manager, I want to edit unit details so that I can correct errors, update descriptions, or modify unit information as business needs change.

**Acceptance Criteria**:
- Edit action available via dropdown menu (three-dot icon) in each unit row
- Edit action available in card view through card action menu
- Clicking edit opens inline edit mode or edit dialog with pre-populated fields
- All fields except Code can be modified (code is immutable after creation)
- Changes are validated using same rules as creation
- System prompts for confirmation if unit is actively used in products
- System displays success message upon successful update
- Updated unit information reflects immediately in the list
- Edit history is recorded in audit log

**Related Requirements**: BR-UNIT-003, BR-UNIT-009

---

### FR-UNIT-006: Delete Unit
**Priority**: High

As a Purchasing Manager, I want to delete obsolete units so that I can maintain a clean, relevant unit catalog and remove units that are no longer used in operations.

**Acceptance Criteria**:
- Delete action available via dropdown menu in each unit row
- System checks if unit is referenced in any products, recipes, or transactions
- If unit is in use, system displays error message: "Cannot delete unit. It is currently used in X products and Y recipes"
- If unit is not in use, system displays confirmation dialog: "Are you sure you want to delete this unit?"
- Confirmation dialog shows unit details (code, name, type)
- Upon confirmation, unit is permanently deleted (hard delete, not soft delete)
- System displays success message upon successful deletion
- Deleted unit is immediately removed from unit list

**Related Requirements**: BR-UNIT-010

---

### FR-UNIT-007: Change Unit Status
**Priority**: Medium

As a Purchasing Manager, I want to activate or deactivate units so that I can temporarily disable units without deleting them, allowing for potential future reactivation.

**Acceptance Criteria**:
- Status can be changed through edit functionality
- Active units show green badge with "Active" label
- Inactive units show gray badge with "Inactive" label
- Inactive units remain in the system and database but are not available for selection in new products or recipes
- Existing products/recipes with inactive units continue to function
- System displays warning when deactivating unit that is actively used
- Status change is recorded in audit log with timestamp and user

**Related Requirements**: BR-UNIT-011

---

### FR-UNIT-008: Export Unit List
**Priority**: Low

As a System Administrator, I want to export the unit list to Excel/CSV so that I can share unit data with external systems, perform offline analysis, or create backup documentation.

**Acceptance Criteria**:
- "Export" button appears in page header toolbar
- Export includes all units matching current filters (if any filters applied)
- Export file includes columns: Code, Name, Type, Status, Description, Created Date, Updated Date
- File format is CSV with UTF-8 encoding
- File name follows pattern: units_export_YYYYMMDD_HHMMSS.csv
- Export completes within 5 seconds for up to 1000 units
- System displays download progress indicator
- System displays success message upon completion

**Related Requirements**: None

---

### FR-UNIT-009: View Unit Details
**Priority**: Medium

As a Storekeeper, I want to view complete details of a unit including its usage statistics so that I can understand how and where each unit is being used in the system.

**Acceptance Criteria**:
- Clicking unit name or view action opens unit detail view
- Detail view displays: Code, Name, Description, Type, Status, Created Date, Updated Date, Created By, Last Modified By
- Detail view shows usage statistics: Number of products using unit, Number of recipes using unit
- Detail view displays list of recent products/recipes using the unit (top 10)
- Back button returns to unit list maintaining previous filters
- Detail view is read-only; edit button navigates to edit mode

**Related Requirements**: FR-UNIT-005

---

## Business Rules

### General Rules
- **BR-UNIT-001**: Unit codes must be unique across the entire system and cannot be changed after creation.
- **BR-UNIT-002**: Unit codes must be uppercase alphanumeric characters with optional hyphens (e.g., KG, ML, TSP, BOX-10).
- **BR-UNIT-003**: Unit codes must be between 1 and 20 characters in length.
- **BR-UNIT-004**: Unit names must be unique within their unit type category (INVENTORY, ORDER, RECIPE, MEASURE).
- **BR-UNIT-005**: Unit names must be between 2 and 100 characters in length.

### Data Validation Rules
- **BR-UNIT-006**: Unit type must be one of four valid values: INVENTORY, ORDER, RECIPE, or MEASURE.
- **BR-UNIT-007**: Description field is optional but if provided must not exceed 500 characters.
- **BR-UNIT-008**: Status must be either Active (true) or Inactive (false).
- **BR-UNIT-009**: Created date and updated date must be system-generated timestamps and cannot be manually modified.
- **BR-UNIT-010**: Created by and updated by fields must contain valid user IDs from the user management system.

### Workflow Rules
- **BR-UNIT-011**: Only users with "Manage Units" permission can create, edit, or delete units.
- **BR-UNIT-012**: Users with "View Units" permission can view and search units but cannot modify them.
- **BR-UNIT-013**: Deactivating a unit does not affect existing products or recipes using that unit.
- **BR-UNIT-014**: Newly created units are set to Active status by default unless explicitly set to Inactive.
- **BR-UNIT-015**: A unit cannot be deleted if it is referenced in any product, recipe, purchase order, or inventory transaction.

### Calculation Rules
- **BR-UNIT-016**: Unit conversion factors are defined at the product level, not in the unit master data.
- **BR-UNIT-017**: Base units for each product are selected from INVENTORY type units only.
- **BR-UNIT-018**: Recipe units (SERVING, PORTION) are used for recipe yield output; Measure units (TSP, TBSP, CUP) are used for ingredient measurements in recipes.

### Security Rules
- **BR-UNIT-019**: All unit modifications must be logged in the system audit trail with user ID, timestamp, and action type.
- **BR-UNIT-020**: Unit data export requires "Export Data" permission in addition to "View Units" permission.
- **BR-UNIT-021**: System administrators can bypass the deletion restriction (BR-UNIT-015) with proper authorization and confirmation.

---

## Data Model

**Note**: The interfaces shown below are **conceptual data models** used to communicate business requirements. They are NOT intended to be copied directly into code. Developers should use these as a guide to understand the required data structure and then implement using appropriate technologies and patterns for the technical stack.

### Unit Entity

**Purpose**: Represents a measurement unit used throughout the system for products, inventory, orders, and recipes.

**Conceptual Structure**:

```typescript
interface Unit {
  // Primary key
  id: string;                     // Unique identifier (UUID format)

  // Core identification fields
  code: string;                   // Unit code (e.g., KG, ML, BOX) - unique, immutable
  name: string;                   // Full unit name (e.g., Kilogram, Milliliter)
  description?: string;           // Optional detailed description of the unit

  // Classification
  type: UnitType;                 // INVENTORY | ORDER | RECIPE

  // Status and state
  isActive: boolean;              // Active (true) or Inactive (false)

  // Audit fields
  createdAt: Date;                // Creation timestamp
  createdBy: string;              // User ID who created the unit
  updatedAt: Date;                // Last modification timestamp
  updatedBy: string;              // User ID who last modified the unit
}

// Unit type enumeration
type UnitType = 'INVENTORY' | 'ORDER' | 'RECIPE' | 'MEASURE';
```

**Key Fields Explanation**:

- **code**: Immutable unique identifier used throughout the system for unit references. Must be memorable and standardized (e.g., KG, LB, L, GAL).
- **type**: Categorizes units based on their primary usage context in hospitality operations:
  - INVENTORY: Units for stock tracking (KG, L, PC)
  - ORDER: Units for purchasing and receiving (BOX, CASE, CTN, PLT)
  - RECIPE: Serving units for recipe yield output (SERVING, PORTION, PLATE, BOWL, SLICE)
  - MEASURE: Ingredient measurement units for recipes (TSP, TBSP, CUP, OZ, PINCH)
- **isActive**: Controls whether unit can be selected for new products/recipes while preserving existing references.

### Unit Usage Statistics (Read-Only View)

**Purpose**: Provides usage analytics for units to prevent accidental deletion and inform management decisions.

**Conceptual Structure**:

```typescript
interface UnitUsageStats {
  unitId: string;                 // Reference to unit
  unitCode: string;               // Unit code for display
  unitName: string;               // Unit name for display

  // Usage counts
  productCount: number;           // Number of products using this unit
  recipeCount: number;            // Number of recipes using this unit
  activeTransactionCount: number; // Number of active transactions using this unit

  // Recent usage
  lastUsedDate?: Date;            // Most recent usage in any transaction
  lastUsedContext: string;        // Context of last usage (Product, Recipe, Transaction)

  // Computed flags
  canBeDeleted: boolean;          // True if all usage counts are zero
  deletionBlockedReason?: string; // Explanation if canBeDeleted is false
}
```

---

## Integration Points

### Internal System Integration

#### Product Management Integration
- **Purpose**: Units are selected as base units, purchase units, and stock units for products
- **Data Flow**: Product → Unit (read-only reference)
- **Validation**: Products can only use active units; inactive units can still display in existing products
- **Dependency**: Deleting a unit requires checking product_units table

#### Recipe Management Integration
- **Purpose**: Recipe units define serving/portion sizes for yield output; Measure units (TSP, TBSP, CUP) are used for ingredient measurements in recipes
- **Data Flow**: Recipe Ingredient → Unit (read-only reference)
- **Validation**: Recipe ingredients must use units of type MEASURE or INVENTORY; Recipe yield must use units of type RECIPE
- **Dependency**: Deleting a unit requires checking recipe_ingredients table

#### Inventory Management Integration
- **Purpose**: Inventory transactions reference units for stock movements
- **Data Flow**: Inventory Transaction → Unit (read-only reference)
- **Validation**: Stock movements must use INVENTORY type units
- **Dependency**: Deleting a unit requires checking inventory_transactions table

#### Purchase Order Integration
- **Purpose**: Purchase order line items reference order units for quantity specification
- **Data Flow**: PO Line Item → Unit (read-only reference)
- **Validation**: Purchase orders can use INVENTORY or ORDER type units
- **Dependency**: Deleting a unit requires checking purchase_order_items table

### External System Integration

None. Unit Management is an internal master data module with no direct external system integrations.

---

## Non-Functional Requirements

### Performance Requirements
- **NFR-UNIT-001**: Unit list page must load within 2 seconds for up to 500 units
- **NFR-UNIT-002**: Search and filter operations must return results within 500 milliseconds
- **NFR-UNIT-003**: Unit creation/update operations must complete within 1 second
- **NFR-UNIT-004**: Unit deletion validation (usage check) must complete within 2 seconds
- **NFR-UNIT-005**: Export operation must complete within 5 seconds for up to 1000 units

### Usability Requirements
- **NFR-UNIT-006**: Unit list must be accessible on desktop, tablet, and mobile devices with responsive design
- **NFR-UNIT-007**: All form fields must have clear labels and inline validation messages
- **NFR-UNIT-008**: Unit type badges must use distinct colors for easy visual differentiation
- **NFR-UNIT-009**: Keyboard navigation must be supported for all unit management operations
- **NFR-UNIT-010**: Screen readers must be able to announce all unit information and actions

### Security Requirements
- **NFR-UNIT-011**: All API endpoints must require authentication with valid session token
- **NFR-UNIT-012**: Unit modification actions must verify user permissions before execution
- **NFR-UNIT-013**: Audit log must capture all unit changes with user ID, timestamp, and action details
- **NFR-UNIT-014**: Failed deletion attempts must be logged for security monitoring

### Reliability Requirements
- **NFR-UNIT-015**: System must handle concurrent unit modifications with optimistic locking
- **NFR-UNIT-016**: Database constraints must prevent duplicate unit codes
- **NFR-UNIT-017**: Failed operations must roll back completely without partial updates
- **NFR-UNIT-018**: System must maintain data consistency during unit status changes

### Scalability Requirements
- **NFR-UNIT-019**: System must support up to 1000 units without performance degradation
- **NFR-UNIT-020**: Search and filter operations must scale linearly with unit count
- **NFR-UNIT-021**: Unit list pagination must support efficient loading for large datasets

---

## Success Metrics

### Operational Metrics
- **Reduction in Unit-Related Errors**: 80% reduction in incorrect unit usage in purchase orders within 3 months
- **Time Savings**: 50% reduction in time spent searching for units by purchasing staff
- **Data Quality**: 100% of products have valid, active units assigned within 6 months

### User Adoption Metrics
- **User Training**: 95% of purchasing staff and chefs trained on unit management within 1 month
- **Active Usage**: 100% of new products created use units from centralized catalog
- **System Utilization**: Zero unauthorized custom units created outside the system

### System Performance Metrics
- **Page Load Time**: Consistent sub-2-second load times for unit list
- **Search Response**: 95% of searches return results within 500ms
- **System Availability**: 99.9% uptime for unit management functionality

### Compliance Metrics
- **Audit Trail Completeness**: 100% of unit modifications captured in audit log
- **Data Integrity**: Zero orphaned unit references in products or recipes
- **Regulatory Compliance**: 100% of units meet food service measurement standards

---

## Constraints and Assumptions

### Technical Constraints
- System must integrate with existing PostgreSQL database
- Unit codes are limited to 20 characters due to database column size
- Mobile devices must support touch-based interactions for unit management

### Business Constraints
- Budget allows for up to 1000 units in the system
- Staff training budget limits training to 2 hours per user
- Implementation must not disrupt ongoing procurement operations

### Assumptions
- Users have basic computer literacy and can navigate web applications
- Stable internet connection is available for cloud-based system access
- Standard metric and imperial units cover 95% of operational needs
- Unit conversion logic will be implemented in Product Management module, not in Unit Management

---

## Glossary

- **Base Unit**: The primary measurement unit assigned to a product for inventory tracking
- **Unit Type**: Category classification (INVENTORY, ORDER, RECIPE, MEASURE) that determines where a unit can be used
- **Active Unit**: A unit that is available for selection in new products, recipes, and transactions
- **Inactive Unit**: A unit that is hidden from selection but still valid for existing references
- **Unit Code**: Short, unique identifier for a unit (e.g., KG, LB, TSP)
- **Hard Delete**: Permanent removal of unit record from database (only allowed if no references exist)
- **Soft Delete**: Marking unit as inactive while keeping database record (not used in this system)

---

**Document Control**:
- **Classification**: Internal Use Only
- **Review Cycle**: Quarterly
- **Next Review Date**: 2026-04-15
- **Approval Required**: Product Management Team Lead, IT Manager
