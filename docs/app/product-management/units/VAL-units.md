# VAL-UNIT: Units Management Validation Rules

**Module**: Product Management
**Sub-Module**: Units Management
**Document Type**: Validations (VAL)
**Version**: 1.0.0
**Last Updated**: 2025-11-02
**Status**: Approved

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2026-01-15 | Documentation Team | Added MEASURE unit type for recipe ingredient measurements; updated all type-related validations |
---

## 1. Overview

### 1.1 Purpose

This document defines comprehensive validation rules for the Units Management sub-module of the CARMEN ERP system. The Units Management module handles the creation, maintenance, and management of measurement units used throughout the hospitality operation for inventory tracking, purchasing, and recipe management.

**Critical Validation Requirements**:
- **Data Integrity**: Prevent invalid unit definitions that could break system calculations
- **Code Uniqueness**: Ensure unit codes remain unique to prevent confusion
- **Referential Integrity**: Protect referenced units from modifications that could corrupt dependent data
- **Type Consistency**: Maintain unit type integrity across product, recipe, and inventory contexts
- **Business Rule Enforcement**: Apply hospitality-specific measurement standards

**Consequences of Invalid Data**:
- **Financial Impact**: Incorrect units lead to wrong inventory valuations and purchase order amounts
- **Operational Impact**: Wrong unit conversions result in incorrect recipe yields and portion sizes
- **Compliance Impact**: Measurement inconsistencies create audit trail issues
- **User Experience**: Invalid units cause confusion and data entry errors

### 1.2 Scope

This document defines validation rules across three layers:
- **Client-Side**: Immediate user feedback and UX validation
- **Server-Side**: Security and business rule enforcement
- **Database**: Final data integrity constraints

### 1.3 Validation Strategy

```
User Input
    ↓
[Client-Side Validation] ← Immediate feedback, UX
    ↓
[Server-Side Validation] ← Security, business rules
    ↓
[Database Constraints] ← Final enforcement
    ↓
Data Stored
```

**Validation Principles**:
1. Never trust client-side data - always validate on server
2. Provide immediate user feedback when possible
3. Use clear, actionable error messages
4. Prevent security vulnerabilities (SQL injection, XSS)
5. Enforce business rules consistently
6. Protect referential integrity across all modules

---

## 2. Field-Level Validations (VAL-UNIT-001 to 099)

### VAL-UNIT-001: Code - Required Field Validation

**Field**: `code`
**Database Column**: `units.code`
**Data Type**: VARCHAR(10) / string

**Validation Rule**: Unit code is mandatory and cannot be empty or null.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to "Code" field label. Show error immediately on blur if empty. Disable submit button if code is empty.
- **Server-Side**: Reject request if code is missing, null, empty string, or contains only whitespace.
- **Database**: Column defined as NOT NULL.

**Error Code**: VAL-UNIT-001
**Error Message**: "Unit code is required"
**User Action**: User must provide a unit code before proceeding.

**Test Cases**:
- ✅ Valid: "KG" (non-empty code)
- ✅ Valid: "ML" (valid code)
- ❌ Invalid: "" (empty string)
- ❌ Invalid: "   " (only whitespace)
- ❌ Invalid: null or undefined

**Related Business Requirements**: BR-UNIT-001 (Code uniqueness and immutability)

---

### VAL-UNIT-002: Code - Minimum Length

**Field**: `code`

**Validation Rule**: Unit code must contain at least 2 characters.

**Rationale**: Single-character codes are too short to be meaningful and could cause confusion. Two-character minimum ensures codes are reasonably descriptive (e.g., "KG", "ML", "PC").

**Implementation Requirements**:
- **Client-Side**: Display character counter below field. Show warning when length < 2. Prevent submission if length < 2.
- **Server-Side**: Reject if trimmed length is less than 2 characters.
- **Database**: CHECK constraint: LENGTH(code) >= 2

**Error Code**: VAL-UNIT-002
**Error Message**: "Unit code must be at least 2 characters"
**User Action**: User must add more characters to meet minimum length.

**Test Cases**:
- ✅ Valid: "KG" (length = 2, meets minimum)
- ✅ Valid: "TSP" (length = 3, exceeds minimum)
- ❌ Invalid: "K" (length = 1, below minimum)
- ❌ Invalid: " K " (trim to "K", length = 1)

**Related Business Requirements**: BR-UNIT-001

---

### VAL-UNIT-003: Code - Maximum Length

**Field**: `code`

**Validation Rule**: Unit code cannot exceed 10 characters.

**Rationale**: Database column limit (VARCHAR(10)). Short codes are easier to display in constrained UI spaces (dropdowns, tables, mobile views) and faster to type.

**Implementation Requirements**:
- **Client-Side**: Limit input to 10 characters using maxLength attribute. Show character count "X/10". Prevent typing beyond limit.
- **Server-Side**: Reject if length exceeds 10 characters.
- **Database**: Column defined as VARCHAR(10).

**Error Code**: VAL-UNIT-003
**Error Message**: "Unit code cannot exceed 10 characters"
**User Action**: User must shorten the code or use abbreviations.

**Test Cases**:
- ✅ Valid: "KG" (length = 2, well under limit)
- ✅ Valid: "KILOGRAM" (length = 8, under limit)
- ✅ Valid: "TABLESPOON" (length = 10, exactly at limit)
- ❌ Invalid: "TABLESPOONS" (length = 11, exceeds limit)

**Related Business Requirements**: BR-UNIT-001

---

### VAL-UNIT-004: Code - Format Validation

**Field**: `code`

**Validation Rule**: Unit code must contain only uppercase letters, numbers, and underscores. No spaces or special characters allowed.

**Format Requirements**:
- Allowed characters: A-Z, 0-9, _ (underscore)
- Pattern: `^[A-Z0-9_]{2,10}$`
- Examples: "KG", "ML", "BOX_10", "CASE_24"

**Rationale**:
- Uppercase ensures consistency and easier matching
- Alphanumeric characters prevent encoding issues
- No spaces prevents parsing errors in exports/imports
- Underscore allowed for compound units (e.g., BOX_10, CASE_24)

**Implementation Requirements**:
- **Client-Side**: Auto-uppercase input on typing. Validate against pattern on blur. Show format hint below field: "Use uppercase letters, numbers, and underscores only (e.g., KG, BOX_10)".
- **Server-Side**: Transform to uppercase, then verify pattern match using regular expression.
- **Database**: CHECK constraint with regex pattern matching.

**Error Code**: VAL-UNIT-004
**Error Message**: "Unit code must contain only uppercase letters, numbers, and underscores (e.g., KG, BOX_10)"
**User Action**: User must remove invalid characters and use only allowed characters.

**Test Cases**:
- ✅ Valid: "KG" (uppercase letters)
- ✅ Valid: "ML" (uppercase letters)
- ✅ Valid: "BOX10" (letters and numbers)
- ✅ Valid: "CASE_24" (letters, numbers, underscore)
- ❌ Invalid: "kg" (lowercase - should be auto-uppercased)
- ❌ Invalid: "K G" (contains space)
- ❌ Invalid: "K-G" (contains hyphen)
- ❌ Invalid: "K.G" (contains period)
- ❌ Invalid: "KG!" (contains special character)

**Auto-Transformation**: Client automatically converts lowercase input to uppercase before validation.

**Related Business Requirements**: BR-UNIT-002 (Code format standards)

---

### VAL-UNIT-005: Code - Uniqueness Validation

**Field**: `code`

**Validation Rule**: Unit code must be unique across all active units (case-insensitive comparison).

**Rationale**: Prevents duplicate units that would cause confusion in dropdown selections, reports, and data imports. Unit codes serve as business identifiers throughout the system.

**Implementation Requirements**:
- **Client-Side**: Async validation 500ms after user stops typing (debounced check). Call API endpoint to check if code exists. Show loading spinner during check.
- **Server-Side**: Query database for existing records with same code (case-insensitive): `WHERE UPPER(code) = UPPER(new_code) AND deleted_at IS NULL AND id != current_record_id`
- **Database**: UNIQUE constraint on UPPER(code) where deleted_at IS NULL (partial unique index).

**Error Code**: VAL-UNIT-006
**Error Message**: "Unit code '{CODE}' already exists. Please choose a different code."
**User Action**: User must choose a different, unique code.

**Uniqueness Scope**:
- Check against: All active units (where deleted_at IS NULL)
- Case sensitivity: Case-insensitive (KG = kg = Kg)
- Exclude current record on update: Yes (allows saving without changes)
- Soft-deleted records: Ignored (code can be reused after deletion)

**Test Cases**:
- ✅ Valid: "KG" when no existing unit has code "KG"
- ✅ Valid: "KG" when updating the same record (id matches)
- ✅ Valid: "KG" when a soft-deleted unit has code "KG"
- ❌ Invalid: "KG" when active unit already has code "KG"
- ❌ Invalid: "kg" when active unit has code "KG" (case-insensitive)
- ❌ Invalid: "Kg" when active unit has code "kg" (case-insensitive)

**Special Cases**:
- **On Create**: Check all active units for duplicate code
- **On Update**: Exclude current unit's ID from duplicate check
- **After Soft Delete**: Code becomes available for reuse
- **Async Validation Timeout**: Show warning "Unable to verify uniqueness, please try again"

**Related Business Requirements**: BR-UNIT-001 (Code uniqueness)

---

### VAL-UNIT-006: Name - Required Field Validation

**Field**: `name`
**Database Column**: `units.name`
**Data Type**: VARCHAR(100) / string

**Validation Rule**: Unit name is mandatory and cannot be empty or null.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to "Name" field label. Show error immediately on blur if empty.
- **Server-Side**: Reject request if name is missing, null, empty string, or contains only whitespace.
- **Database**: Column defined as NOT NULL.

**Error Code**: VAL-UNIT-006
**Error Message**: "Unit name is required"
**User Action**: User must provide a unit name before proceeding.

**Test Cases**:
- ✅ Valid: "Kilogram" (non-empty name)
- ✅ Valid: "Box" (valid name)
- ❌ Invalid: "" (empty string)
- ❌ Invalid: "   " (only whitespace)
- ❌ Invalid: null or undefined

**Related Business Requirements**: BR-UNIT-001

---

### VAL-UNIT-007: Name - Minimum Length

**Field**: `name`

**Validation Rule**: Unit name must contain at least 1 character (after trimming whitespace).

**Rationale**: Ensures name is meaningful and not just whitespace. Prevents accidental empty submissions.

**Implementation Requirements**:
- **Client-Side**: Trim whitespace and check length >= 1. Show error on blur if invalid.
- **Server-Side**: Trim whitespace and reject if length < 1.
- **Database**: CHECK constraint: LENGTH(TRIM(name)) >= 1

**Error Code**: VAL-UNIT-007
**Error Message**: "Unit name must contain at least 1 character"
**User Action**: User must provide a meaningful name.

**Test Cases**:
- ✅ Valid: "K" (length = 1, minimum)
- ✅ Valid: "Kilogram" (length > 1)
- ❌ Invalid: "" (empty)
- ❌ Invalid: "   " (only whitespace, trims to empty)

**Related Business Requirements**: BR-UNIT-001

---

### VAL-UNIT-008: Name - Maximum Length

**Field**: `name`

**Validation Rule**: Unit name cannot exceed 100 characters.

**Rationale**: Database column limit (VARCHAR(100)). Ensures names fit in UI displays, dropdowns, and reports without truncation.

**Implementation Requirements**:
- **Client-Side**: Limit input to 100 characters using maxLength attribute. Show character count "X/100".
- **Server-Side**: Reject if length exceeds 100 characters.
- **Database**: Column defined as VARCHAR(100).

**Error Code**: VAL-UNIT-008
**Error Message**: "Unit name cannot exceed 100 characters"
**User Action**: User must shorten the name or use abbreviations.

**Test Cases**:
- ✅ Valid: "Kilogram" (length = 8, well under limit)
- ✅ Valid: "Box of 10 units" (length = 14, under limit)
- ✅ Valid: String with exactly 100 characters
- ❌ Invalid: String with 101 characters

**Related Business Requirements**: BR-UNIT-001

---

### VAL-UNIT-009: Description - Maximum Length

**Field**: `description`
**Database Column**: `units.description`
**Data Type**: TEXT / string (optional)

**Validation Rule**: If provided, description cannot exceed 500 characters.

**Rationale**: Reasonable limit for descriptive text. Prevents excessively long descriptions that could impact database performance and UI layout.

**Implementation Requirements**:
- **Client-Side**: Limit input to 500 characters using maxLength attribute. Show character count "X/500". Field is optional, no error if empty.
- **Server-Side**: If provided, reject if length exceeds 500 characters.
- **Database**: TEXT column (no hard limit, but application enforces 500).

**Error Code**: VAL-UNIT-009
**Error Message**: "Description cannot exceed 500 characters"
**User Action**: User must shorten the description or summarize.

**Test Cases**:
- ✅ Valid: null or empty (description is optional)
- ✅ Valid: "Standard weight measurement for inventory" (under limit)
- ✅ Valid: String with exactly 500 characters
- ❌ Invalid: String with 501 characters

**Related Business Requirements**: BR-UNIT-001

---

### VAL-UNIT-010: Type - Required Field Validation

**Field**: `type`
**Database Column**: `units.type`
**Data Type**: VARCHAR(20) / UnitType enum

**Validation Rule**: Unit type is mandatory and must be one of the allowed values.

**Implementation Requirements**:
- **Client-Side**: Display as required dropdown with four options. No default selection (forces explicit choice). Show error if not selected.
- **Server-Side**: Reject if type is missing or not one of the allowed enum values.
- **Database**: Column defined as NOT NULL with CHECK constraint for enum values.

**Error Code**: VAL-UNIT-010
**Error Message**: "Unit type is required. Please select INVENTORY, ORDER, RECIPE, or MEASURE."
**User Action**: User must select one of the four unit types.

**Test Cases**:
- ✅ Valid: "INVENTORY"
- ✅ Valid: "ORDER"
- ✅ Valid: "RECIPE"
- ✅ Valid: "MEASURE"
- ❌ Invalid: null or undefined
- ❌ Invalid: empty string
- ❌ Invalid: "INVALID_TYPE"

**Related Business Requirements**: BR-UNIT-003 (Unit types), BR-UNIT-010 (Base units must be INVENTORY)

---

### VAL-UNIT-011: Type - Enum Validation

**Field**: `type`

**Validation Rule**: Unit type must be exactly one of the following enum values: "INVENTORY", "ORDER", "RECIPE", or "MEASURE" (case-sensitive).

**Allowed Values**:
- **INVENTORY**: Units for stock measurement and inventory tracking (e.g., KG, L, PC)
- **ORDER**: Units for purchasing and procurement (e.g., BOX, CASE, PALLET)
- **RECIPE**: Units for recipe yield/portion output (e.g., SERVING, PORTION, PLATE, BOWL, SLICE)
- **MEASURE**: Units for recipe ingredient measurements (e.g., TSP, TBSP, CUP, OZ, PINCH)

**Rationale**: These four types cover all measurement contexts in hospitality operations. Type determines where and how the unit can be used throughout the system. RECIPE type is for output (yields and portions), while MEASURE type is for input (ingredient quantities).

**Implementation Requirements**:
- **Client-Side**: Dropdown with four options, each with descriptive tooltip. Cannot type custom values.
- **Server-Side**: Verify value is exactly one of the four allowed strings (case-sensitive).
- **Database**: CHECK constraint: `type IN ('INVENTORY', 'ORDER', 'RECIPE', 'MEASURE')`

**Error Code**: VAL-UNIT-011
**Error Message**: "Unit type must be INVENTORY, ORDER, RECIPE, or MEASURE"
**User Action**: User must select one of the valid unit types from the dropdown.

**Test Cases**:
- ✅ Valid: "INVENTORY"
- ✅ Valid: "ORDER"
- ✅ Valid: "RECIPE"
- ✅ Valid: "MEASURE"
- ❌ Invalid: "inventory" (wrong case)
- ❌ Invalid: "Inventory" (wrong case)
- ❌ Invalid: "STOCK" (not in enum)
- ❌ Invalid: "PURCHASE" (not in enum)

**Related Business Requirements**: BR-UNIT-003, BR-UNIT-010, BR-UNIT-013

---

### VAL-UNIT-012: Status - Required Field Validation

**Field**: `isActive`
**Database Column**: `units.isActive`
**Data Type**: BOOLEAN / boolean

**Validation Rule**: Unit status (isActive) is mandatory and must be a boolean value.

**Implementation Requirements**:
- **Client-Side**: Display as toggle switch or checkbox. Default to true (Active) for new units.
- **Server-Side**: Ensure value is boolean (true or false). Convert string "true"/"false" to boolean if needed.
- **Database**: Column defined as NOT NULL with default value true.

**Error Code**: VAL-UNIT-012
**Error Message**: "Unit status is required"
**User Action**: System should prevent this error by always providing a default value.

**Test Cases**:
- ✅ Valid: true
- ✅ Valid: false
- ❌ Invalid: null or undefined
- ❌ Invalid: "yes" or "no" (not boolean)

**Related Business Requirements**: BR-UNIT-004 (Default status), BR-UNIT-005 (Active status requirement)

---

## 3. Business Rule Validations (VAL-UNIT-101 to 199)

### VAL-UNIT-101: Code Immutability When Referenced

**Rule Description**: Unit code cannot be modified if the unit is referenced by any products, recipes, inventory transactions, purchase orders, or store requisitions.

**Business Justification**: Changing a unit code after it's been used would break referential integrity and corrupt historical data. All dependent records reference the unit by its code, so changing it would make those records invalid.

**Validation Logic**:
1. When user attempts to save changes to a unit where code has been modified
2. System queries all tables that reference units by foreign key:
   - products (base_unit foreign key)
   - product_units (unit_id foreign key)
   - recipe_ingredients (unit_id foreign key)
   - inventory_transactions (unit_id foreign key)
   - purchase_order_items (unit_id foreign key)
   - store_requisition_items (unit_id foreign key)
3. If ANY references exist (active or historical), code modification is blocked
4. If no references exist, code modification is allowed

**When Validated**: On update operation when code field has changed

**Implementation Requirements**:
- **Client-Side**:
  * If editing existing unit, check if it has references via API call when form loads
  * If references exist, make code field read-only (display as disabled input)
  * Show info message: "Code cannot be changed because this unit is in use"
- **Server-Side**:
  * Before updating, check if code has changed
  * If changed, query all referencing tables for count of references
  * If count > 0, reject update with error
  * If count = 0, allow update
- **Database**:
  * Foreign key constraints prevent deletion of referenced units
  * No database-level enforcement of code immutability (handled by application logic)

**Error Code**: VAL-UNIT-101
**Error Message**: "Cannot modify unit code '{OLD_CODE}'. This unit is referenced by {COUNT} records across products, recipes, transactions, and orders. The code must remain '{OLD_CODE}' to maintain data integrity."
**User Action**: User cannot change the code. If a different code is needed, user must:
1. Deactivate the current unit
2. Create a new unit with the desired code
3. Manually migrate references (if permitted by business rules)

**Related Business Requirements**: BR-UNIT-001 (Code immutability)

**Examples**:

**Scenario 1: No References - Code Change Allowed**
- Situation: Unit "KGS" was created but never used
- User tries to change code from "KGS" to "KG"
- Check: Query all referencing tables, count = 0
- Result: ✅ Code change allowed
- Reason: No dependent data would be affected

**Scenario 2: Has References - Code Change Blocked**
- Situation: Unit "KG" is used as base unit for 150 products
- User tries to change code from "KG" to "KILOGRAM"
- Check: Query finds 150 product references
- Result: ❌ Code change blocked
- Error: "Cannot modify unit code 'KG'. This unit is referenced by 150 products. The code must remain 'KG' to maintain data integrity."
- User must: Keep code as "KG" or create new unit "KILOGRAM" and migrate products

**Scenario 3: Soft-Deleted References - Code Change Blocked**
- Situation: Unit "LB" was used historically but all products using it are now soft-deleted
- User tries to change code from "LB" to "POUND"
- Check: Query finds 50 soft-deleted product references
- Result: ❌ Code change blocked (historical data must be preserved)
- User must: Cannot change code even for historical references

---

### VAL-UNIT-102: Type Immutability When Referenced

**Rule Description**: Unit type cannot be modified if the unit is referenced by any active records.

**Business Justification**: Changing a unit's type after it's been used could violate business rules. For example:
- An INVENTORY unit changed to RECIPE would no longer be valid as a product base unit
- An ORDER unit changed to INVENTORY might break purchase order conversions
- Type changes could invalidate unit conversion calculations

**Validation Logic**:
1. When user attempts to save changes to a unit where type has been modified
2. System queries referencing tables for active (non-deleted) references only
3. If any active references exist, type modification is blocked
4. If only historical (soft-deleted) references exist, type modification may be allowed with warning
5. If no references exist, type modification is allowed

**When Validated**: On update operation when type field has changed

**Implementation Requirements**:
- **Client-Side**:
  * When editing form loads, check for active references
  * If active references exist, make type field read-only
  * Show info message: "Type cannot be changed because this unit is currently in use"
- **Server-Side**:
  * Before updating, check if type has changed
  * If changed, query for active references (WHERE deleted_at IS NULL)
  * If active references exist, reject update
  * If only historical references, allow with warning log
- **Database**: No database-level enforcement

**Error Code**: VAL-UNIT-102
**Error Message**: "Cannot modify unit type from '{OLD_TYPE}' to '{NEW_TYPE}'. This unit is currently used by {COUNT} active records. Type changes would violate business rules."
**User Action**: User cannot change the type. Must:
1. Deactivate the current unit
2. Create a new unit with the desired type
3. Update references to use the new unit

**Related Business Requirements**: BR-UNIT-003 (Unit types), BR-UNIT-010 (Base units must be INVENTORY)

**Examples**:

**Scenario 1: INVENTORY to ORDER - Has Active Product References**
- Current: Unit "KG" with type=INVENTORY, used as base_unit for 100 products
- User tries to change type from INVENTORY to ORDER
- Check: Query finds 100 active product references
- Result: ❌ Type change blocked
- Reason: Products require INVENTORY type base units (BR-UNIT-010)

**Scenario 2: MEASURE to INVENTORY - Has Recipe References**
- Current: Unit "TSP" with type=MEASURE, used in 50 recipe ingredient measurements
- User tries to change type from MEASURE to INVENTORY
- Check: Query finds 50 active recipe ingredient references
- Result: ❌ Type change blocked
- Reason: Changing type could break recipe calculations

**Scenario 3: No Active References - Type Change Allowed**
- Current: Unit "TEMP" with type=ORDER, only used in historical (deleted) purchase orders
- User tries to change type from ORDER to INVENTORY
- Check: Query finds 0 active references, only historical
- Result: ✅ Type change allowed with warning
- Reason: No active data would be affected

---

### VAL-UNIT-103: Deletion Prevention When Referenced

**Rule Description**: Unit cannot be deleted (soft-deleted) if it is referenced by any active records. Only units with no active references or only historical references can be soft-deleted.

**Business Justification**: Prevents deletion of units that are currently in use, which would break active products, recipes, orders, and inventory tracking. Historical data must be preserved.

**Validation Logic**:
1. When user attempts to delete a unit
2. System queries all referencing tables for active references:
   - Active products (WHERE deleted_at IS NULL)
   - Active recipes (WHERE deleted_at IS NULL)
   - Active purchase orders (WHERE status IN ('draft', 'submitted', 'approved', 'in_progress'))
   - Active store requisitions (WHERE status IN ('draft', 'submitted', 'approved'))
   - Any inventory transactions (historical transactions cannot prevent deletion)
3. If ANY active references exist, deletion is blocked
4. If only historical references exist, soft deletion is allowed (set deleted_at timestamp)
5. If no references at all, physical deletion could be considered (but soft delete is preferred)

**When Validated**: On delete operation

**Implementation Requirements**:
- **Client-Side**:
  * Before showing delete confirmation, call API to check references
  * If active references exist:
    - Show blocking message with reference counts
    - Offer "Deactivate Instead" option as alternative
    - Do not show delete confirmation
  * If only historical references:
    - Show warning in delete confirmation
    - Explain soft delete will preserve historical data
- **Server-Side**:
  * Query all referencing tables for active record counts
  * If active references > 0, reject deletion with detailed error
  * If only historical references, perform soft delete (set deleted_at)
  * Log deletion with reference counts for audit trail
- **Database**:
  * Foreign key constraints with RESTRICT prevent orphan records
  * Soft delete mechanism (deleted_at timestamp) preserves data

**Error Code**: VAL-UNIT-103
**Error Message**:
"Cannot delete unit '{CODE}'. This unit is currently referenced by:
- {PRODUCT_COUNT} active products
- {RECIPE_COUNT} active recipes
- {PO_COUNT} active purchase orders
- {SR_COUNT} active store requisitions

Please deactivate this unit instead, or remove all references before deleting."

**User Action**: User must either:
1. **Deactivate instead of delete**: Set isActive=false (recommended)
2. **Remove references**: Update all referencing records to use different units (time-consuming)
3. **Wait**: If references are temporary (e.g., draft orders), wait for them to be completed/cancelled

**Related Business Requirements**: BR-UNIT-007 (Soft delete mechanism), BR-UNIT-008 (Deletion blocking)

**Examples**:

**Scenario 1: Active Product References - Deletion Blocked**
- Unit: "KG" (Kilogram)
- References: 150 active products use "KG" as base unit
- User clicks Delete
- System check: 150 active product references found
- Result: ❌ Deletion blocked
- Message: "Cannot delete unit 'KG'. This unit is currently referenced by 150 active products. Please deactivate this unit instead."
- Offer: "Deactivate" button as alternative

**Scenario 2: Only Historical References - Soft Delete Allowed**
- Unit: "LB" (Pound)
- References: All products using "LB" have been soft-deleted
- User clicks Delete
- System check: 0 active references, 50 historical references
- Result: ✅ Soft delete allowed
- Action: Set deleted_at timestamp, preserve historical data
- Message: "Unit 'LB' has been deleted. Historical data has been preserved."

**Scenario 3: No References - Safe Deletion**
- Unit: "TEST" (Test Unit)
- References: Never used in any records
- User clicks Delete
- System check: 0 references (active or historical)
- Result: ✅ Soft delete allowed (safest case)
- Action: Set deleted_at timestamp
- Message: "Unit 'TEST' has been deleted."

**Scenario 4: Mixed References - Deletion Blocked**
- Unit: "BOX"
- References:
  - 25 active products
  - 10 active purchase orders
  - 100 historical inventory transactions
- User clicks Delete
- System check: 35 active references found
- Result: ❌ Deletion blocked
- Message: "Cannot delete unit 'BOX'. This unit is currently referenced by 25 active products and 10 active purchase orders. Please deactivate this unit instead."

---

### VAL-UNIT-104: Active Unit Requirement for Selection

**Rule Description**: Only units with isActive=true can be selected for use in new products, recipes, inventory transactions, purchase orders, and store requisitions.

**Business Justification**: Inactive units represent obsolete or discontinued measurements. Preventing their selection in new records ensures data quality and prevents use of outdated unit definitions.

**Validation Logic**:
1. When displaying unit dropdown/selection in any module
2. Filter units to only show WHERE isActive = true AND deleted_at IS NULL
3. Existing records can display inactive units (for historical data visibility)
4. New records cannot select inactive units

**When Validated**: On all dropdown/selection UI components for units

**Implementation Requirements**:
- **Client-Side**:
  * Unit dropdowns query: `GET /api/units?status=active`
  * Filter results to only isActive=true units
  * Sort by type, then code for easy selection
  * Show unit type badge next to each option
- **Server-Side**:
  * API endpoints for unit lists accept status filter
  * Default to active=true if no filter specified
  * Validate selected unit_id is active before saving new records
- **Database**:
  * No database constraint (enforced by application logic)
  * Queries always include WHERE isActive = true for selection lists

**Error Code**: VAL-UNIT-104
**Error Message**: "The selected unit '{CODE}' is inactive and cannot be used. Please select an active unit."
**User Action**: User must select a different, active unit from the dropdown.

**Related Business Requirements**: BR-UNIT-005 (Active unit requirement), BR-UNIT-006 (Inactive unit visibility)

**Examples**:

**Scenario 1: Creating New Product**
- User: Creating new product "Rice"
- Action: Opens "Base Unit" dropdown
- System: Queries `GET /api/units?type=INVENTORY&status=active`
- Display: Shows only active INVENTORY units (KG, L, PC, etc.)
- Inactive units: Not shown in dropdown (e.g., LB, OZ if deactivated)
- Result: User can only select from active units

**Scenario 2: Editing Existing Product with Inactive Unit**
- Product: "Sugar" with base_unit = "LB" (now inactive)
- User: Opens edit form
- Display: Current unit "LB" shown with "(Inactive)" label
- Dropdown: If user changes unit, only active units are available
- Save: Can save without changing unit (preserves existing reference)
- Result: Existing inactive unit reference is preserved but cannot be selected for new references

**Scenario 3: Purchase Order Item**
- User: Creating purchase order item
- Action: Opens "Unit" dropdown for item
- System: Queries product's available units (base + alternative units)
- Filter: Only units where isActive=true are shown
- Result: User cannot accidentally select inactive units

---

### VAL-UNIT-105: Base Unit Type Requirement

**Rule Description**: When a unit is used as a product's base_unit, it must be of type INVENTORY.

**Business Justification**: Base units are used for inventory valuation and stock calculations. Only INVENTORY type units have the proper context and conversion definitions for these calculations.

**Validation Logic**:
1. When assigning a unit as a product's base_unit
2. Verify selected unit has type = 'INVENTORY'
3. If unit type is ORDER, RECIPE, or MEASURE, reject assignment
4. Only allow INVENTORY units for base_unit selection

**When Validated**: When creating or updating a product's base_unit field

**Implementation Requirements**:
- **Client-Side**:
  * Base unit dropdown filters to type=INVENTORY only
  * Query: `GET /api/units?type=INVENTORY&status=active`
  * Disable selection of ORDER, RECIPE, and MEASURE units
- **Server-Side**:
  * Before saving product, verify base_unit references an INVENTORY type unit
  * Query unit by ID and check type field
  * Reject if type !== 'INVENTORY'
- **Database**:
  * Foreign key constraint: products.base_unit → units.id
  * No database check for type (enforced by application)

**Error Code**: VAL-UNIT-105
**Error Message**: "Base unit must be an INVENTORY type unit. '{CODE}' is a {TYPE} unit and cannot be used for inventory valuation."
**User Action**: User must select a different unit with type=INVENTORY.

**Related Business Requirements**: BR-UNIT-010 (Base units must be INVENTORY type)

**Examples**:

**Scenario 1: Valid Base Unit Assignment**
- Product: "Rice"
- Selected base unit: "KG" (type=INVENTORY)
- Check: Unit "KG" has type='INVENTORY'
- Result: ✅ Assignment allowed
- Reason: Correct type for base unit

**Scenario 2: Invalid Base Unit - ORDER Type**
- Product: "Coffee Beans"
- Selected base unit: "BOX" (type=ORDER)
- Check: Unit "BOX" has type='ORDER'
- Result: ❌ Assignment blocked
- Error: "Base unit must be an INVENTORY type unit. 'BOX' is an ORDER unit and cannot be used for inventory valuation."
- User must: Select an INVENTORY unit like "KG" instead

**Scenario 3: Invalid Base Unit - RECIPE Type**
- Product: "Flour"
- Selected base unit: "SERVING" (type=RECIPE)
- Check: Unit "SERVING" has type='RECIPE'
- Result: ❌ Assignment blocked
- Error: "Base unit must be an INVENTORY type unit. 'SERVING' is a RECIPE unit and cannot be used for inventory valuation."
- User must: Select an INVENTORY unit like "KG" instead

**Scenario 4: Invalid Base Unit - MEASURE Type**
- Product: "Sugar"
- Selected base unit: "CUP" (type=MEASURE)
- Check: Unit "CUP" has type='MEASURE'
- Result: ❌ Assignment blocked
- Error: "Base unit must be an INVENTORY type unit. 'CUP' is a MEASURE unit and cannot be used for inventory valuation."
- User must: Select an INVENTORY unit like "KG" instead

---

## 4. Cross-Field Validations (VAL-UNIT-201 to 299)

**Note**: The Units Management module has minimal cross-field validations since it deals primarily with a single entity (Unit) with independent field values. Cross-field validations are more relevant in modules with complex relationships between multiple fields (e.g., date ranges, calculated totals).

### VAL-UNIT-201: Code and Name Consistency (Advisory)

**Fields Involved**: code, name

**Validation Rule**: Unit code should be a reasonable abbreviation of the unit name for clarity and consistency.

**Business Justification**: While not strictly enforced, maintaining alignment between code and name helps users understand the system and reduces confusion.

**Validation Logic**: This is an advisory warning, not a blocking validation:
1. Check if code appears to be related to name
2. If code seems unrelated to name, show warning (not error)
3. User can proceed despite warning

**When Validated**: On create or update, after both fields are filled

**Implementation Requirements**:
- **Client-Side**:
  * Show info icon with tooltip if code/name seem mismatched
  * Example warning: "Code 'KG' typically represents 'Kilogram'. Your unit name is 'Pound'. Is this correct?"
  * Allow submission despite warning
- **Server-Side**: No validation (advisory only)
- **Database**: No constraint

**Error Code**: N/A (advisory warning only, not an error)
**Warning Message**: "Unit code '{CODE}' may not match unit name '{NAME}'. Please verify this is correct."
**User Action**: User reviews and confirms or corrects the mismatch.

**Examples**:

**Good Consistency**:
- Code: "KG", Name: "Kilogram" ✅ (abbreviation matches)
- Code: "ML", Name: "Milliliter" ✅ (abbreviation matches)
- Code: "TSP", Name: "Teaspoon" ✅ (abbreviation matches)

**Questionable Consistency** (shows warning):
- Code: "KG", Name: "Pound" ⚠️ (mismatch - KG usually means Kilogram)
- Code: "PC", Name: "Kilogram" ⚠️ (mismatch - PC usually means Piece)
- Code: "BOX", Name: "Case" ⚠️ (similar but different terms)

**Related Business Requirements**: None (usability enhancement)

---

## 5. Security Validations (VAL-UNIT-301 to 399)

### VAL-UNIT-301: Permission Check for Create

**Validation Rule**: User must have 'create_unit' or 'manage_units' permission to create new units.

**Checked Permissions**:
- `create_unit`: Can create new unit records
- `manage_units`: Can create, update, and delete units (admin-level)
- Role requirements: System Administrator, Purchasing Manager

**When Validated**: Before showing create form, before saving new unit

**Implementation Requirements**:
- **Client-Side**:
  * Hide "Add Unit" button if user lacks permission
  * Check permissions on form mount, redirect if unauthorized
  * Display "You don't have permission to create units" if accessed directly
- **Server-Side**:
  * Verify user has required permission before processing create request
  * Check user's role and permissions from authentication token
  * Reject request with 403 Forbidden if unauthorized
- **Database**:
  * Row Level Security (RLS) policies enforce permission checks
  * Only users with proper permissions can insert into units table

**Error Code**: VAL-UNIT-301
**Error Message**: "You do not have permission to create units. Please contact your system administrator if you need this access."
**User Action**: User must request 'create_unit' or 'manage_units' permission from administrator.

**Related Business Requirements**: BR-UNIT-015 (Permission requirements)

**Examples**:

**Scenario 1: Authorized User**
- User: Admin with 'manage_units' permission
- Action: Clicks "Add Unit" button
- Check: Permission verified
- Result: ✅ Create form displayed

**Scenario 2: Unauthorized User**
- User: Head Chef without unit management permissions
- Action: Attempts to access create unit page
- Check: Permission check fails
- Result: ❌ Access denied
- Display: "You do not have permission to create units."

---

### VAL-UNIT-302: Permission Check for Update

**Validation Rule**: User must have 'update_unit' or 'manage_units' permission to modify existing units.

**Checked Permissions**:
- `update_unit`: Can modify existing unit records
- `manage_units`: Full management access (admin-level)
- Role requirements: System Administrator, Purchasing Manager

**When Validated**: Before showing edit form, before saving changes

**Implementation Requirements**:
- **Client-Side**:
  * Hide "Edit" action buttons if user lacks permission
  * Disable edit form if user unauthorized
  * Show read-only view if permission denied
- **Server-Side**:
  * Verify permission before processing update
  * Reject unauthorized updates with 403 Forbidden
- **Database**: RLS policies enforce update permissions

**Error Code**: VAL-UNIT-302
**Error Message**: "You do not have permission to modify units. Please contact your system administrator."
**User Action**: User must request appropriate permissions.

**Related Business Requirements**: BR-UNIT-015

---

### VAL-UNIT-303: Permission Check for Delete

**Validation Rule**: User must have 'delete_unit' or 'manage_units' permission to delete units. Only System Administrators should have this permission.

**Checked Permissions**:
- `delete_unit`: Can soft-delete unit records
- `manage_units`: Full management access
- Role requirements: System Administrator (typically only admins)

**When Validated**: Before showing delete action, before processing deletion

**Implementation Requirements**:
- **Client-Side**:
  * Hide "Delete" action button if user lacks permission
  * Show disabled delete button with tooltip explaining restriction
- **Server-Side**:
  * Verify permission before processing deletion
  * Require additional confirmation for delete operations
  * Reject unauthorized deletions with 403 Forbidden
- **Database**: RLS policies restrict deletion to authorized users

**Error Code**: VAL-UNIT-303
**Error Message**: "You do not have permission to delete units. Only system administrators can delete units."
**User Action**: User must contact administrator. Consider deactivating instead of deleting.

**Related Business Requirements**: BR-UNIT-015

---

### VAL-UNIT-304: Input Sanitization

**Validation Rule**: All text input must be sanitized to prevent security vulnerabilities.

**Security Checks**:
- Remove HTML tags and scripts (XSS prevention)
- Escape special characters in database queries (SQL injection prevention)
- Validate against dangerous patterns (e.g., `<script>`, `javascript:`)
- Limit input length to prevent buffer overflow
- Remove null bytes and control characters

**When Validated**: On all user input, before storing or displaying data

**Implementation Requirements**:
- **Client-Side**:
  * Basic sanitization for UX (remove HTML tags from display)
  * Input validation (prevent special characters where not allowed)
- **Server-Side**:
  * Comprehensive sanitization before database operations
  * Use parameterized queries (prepared statements)
  * Sanitize all text fields: code, name, description
  * Validate against XSS patterns
- **Database**:
  * Use parameterized queries exclusively
  * Never concatenate user input into SQL strings
  * Prepared statements prevent SQL injection

**Error Code**: VAL-UNIT-304
**Error Message**: "Input contains invalid or potentially harmful content. Please remove special characters and try again."
**User Action**: User must remove problematic content and resubmit.

**Forbidden Content**:
- `<script>` tags in any field
- `javascript:` URLs
- SQL keywords in unexpected contexts (e.g., `'; DROP TABLE users;--`)
- Null bytes (`\0`)
- Control characters (ASCII 0-31)
- Extremely long strings (> maximum field length)

**Sanitization Process**:
```
User Input → Client Validation → Server Sanitization → Database Storage
```

**Test Cases**:
- ✅ Valid: "KG" (normal code)
- ✅ Valid: "Kilogram" (normal name)
- ❌ Invalid: "KG<script>alert('XSS')</script>" (contains script tag)
- ❌ Invalid: "'; DROP TABLE units;--" (SQL injection attempt)
- ❌ Invalid: "javascript:alert('XSS')" (dangerous URL pattern)

**Related Business Requirements**: Security best practices, OWASP guidelines

---

### VAL-UNIT-305: Audit Trail Enforcement

**Validation Rule**: All create, update, and delete operations must record audit trail information (created_by, created_at, updated_by, updated_at, deleted_at).

**Audit Fields**:
- `created_at`: Timestamp when record was created
- `created_by`: UUID of user who created the record
- `updated_at`: Timestamp when record was last updated
- `updated_by`: UUID of user who last updated the record
- `deleted_at`: Timestamp when record was soft-deleted (null if active)

**When Validated**: On every write operation (create, update, delete)

**Implementation Requirements**:
- **Client-Side**:
  * Not applicable (audit fields not user-editable)
  * Display audit information in read-only format on view/edit forms
- **Server-Side**:
  * Automatically populate audit fields on create:
    - created_at = current timestamp
    - created_by = current user ID
    - updated_at = current timestamp
    - updated_by = current user ID
  * Automatically update audit fields on modify:
    - updated_at = current timestamp
    - updated_by = current user ID
  * On soft delete:
    - deleted_at = current timestamp
    - updated_by = current user ID
- **Database**:
  * Columns defined as NOT NULL (except deleted_at)
  * Default values for timestamps: NOW()
  * Triggers to auto-update updated_at on row changes
  * Foreign keys to users table (SET NULL on user deletion)

**Error Code**: VAL-UNIT-305
**Error Message**: "Audit trail information is missing. Operation cannot be completed."
**User Action**: System error - should not occur in normal operation. Contact support.

**Related Business Requirements**: BR-UNIT-017, BR-UNIT-018, BR-UNIT-019 (Audit trail requirements)

---

## 6. Validation Error Messages

### Error Message Guidelines

**Principles**:
1. **Be Specific**: Tell user exactly what's wrong with the unit data
2. **Be Actionable**: Explain how to fix the unit validation issue
3. **Be Kind**: Use friendly, helpful tone in messages
4. **Be Consistent**: Use same format and tone throughout unit validation
5. **Avoid Technical Jargon**: Use plain language, not database terms

### Error Message Format

**Structure**:
```
[Field Name] {problem statement}. {Expected format or action}.
```

**Examples**:

✅ **Good Messages**:
- "Unit code is required. Please enter a 2-10 character code."
- "Unit code must contain only uppercase letters, numbers, and underscores (e.g., KG, BOX_10)."
- "Unit code 'KG' already exists. Please choose a different code."
- "Cannot modify unit code 'KG'. This unit is referenced by 150 products."
- "Base unit must be an INVENTORY type unit. 'BOX' is an ORDER unit."

❌ **Bad Messages**:
- "Error" (too vague)
- "Invalid" (not specific)
- "FK constraint violation" (too technical)
- "You're wrong" (unfriendly)
- "Code failed validation" (doesn't explain what's wrong)

### Error Severity Levels

| Level | When to Use | Display |
|-------|-------------|---------|
| **Error** | Blocks saving/submission | Red icon, red border, red text below field |
| **Warning** | Should be reviewed but not blocking | Yellow icon, yellow border, warning text |
| **Info** | Helpful guidance | Blue icon, normal border, info text |

### Error Message Examples by Type

**Required Field**:
- Message: "Unit {field} is required"
- Context: "This field is required to create a valid unit"
- Display: Red border on empty field, red asterisk on label

**Format Error**:
- Message: "Unit code must contain only uppercase letters, numbers, and underscores"
- Example: "Valid codes: KG, BOX_10, CASE_24"
- Display: Red border, inline error text with example

**Uniqueness Error**:
- Message: "Unit code '{CODE}' already exists. Please choose a different code."
- Context: "Each unit must have a unique code"
- Suggestion: Show alternative codes if possible

**Business Rule Violation**:
- Message: "Cannot {action} because {clear reason}"
- Example: "Cannot delete unit 'KG' because it is referenced by 150 active products. Please deactivate this unit instead."
- Action: Offer alternative (e.g., "Deactivate" button)

**Immutability Error**:
- Message: "Cannot modify {field} '{value}'. This unit is referenced by {count} records."
- Context: Explain why field is locked
- Display: Field shown as read-only/disabled with info icon

---

## 7. Test Scenarios

### Test Coverage Requirements

All validation rules must have test cases covering:
1. **Positive Tests**: Valid unit data that should pass validation
2. **Negative Tests**: Invalid unit data that should fail validation
3. **Boundary Tests**: Edge cases at limits of acceptable values
4. **Integration Tests**: Validation working across all layers

### Test Scenario Template

**Test ID**: VAL-UNIT-T{###}

**Test Description**: {What is being tested}

**Test Type**: Positive | Negative | Boundary | Integration

**Preconditions**: {What must be true before test}

**Test Steps**:
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Input Data**: {What data is provided}

**Expected Result**: {What should happen}

**Validation Layer**: Client | Server | Database | All

**Pass/Fail Criteria**: {How to determine if test passed}

---

### Example Test Scenarios

#### Positive Test: Create Valid INVENTORY Unit

**Test ID**: VAL-UNIT-T001

**Test Description**: Create a new INVENTORY unit with all valid data

**Test Type**: Positive

**Preconditions**:
- User is authenticated as System Administrator
- User has 'create_unit' or 'manage_units' permission
- Unit code "KG" does not already exist

**Test Steps**:
1. Navigate to Product Management → Units
2. Click "Add Unit" button
3. Enter Code: "KG"
4. Enter Name: "Kilogram"
5. Enter Description: "Standard weight measurement for inventory"
6. Select Type: "INVENTORY"
7. Set Status: Active (isActive = true)
8. Click "Save"

**Input Data**:
- code: "KG"
- name: "Kilogram"
- description: "Standard weight measurement for inventory"
- type: "INVENTORY"
- isActive: true

**Expected Result**: ✅ Unit created successfully

**Validation Layer**: All (Client, Server, Database)

**Pass/Fail Criteria**:
- No validation errors displayed
- Unit saved to database with generated UUID
- Audit fields populated (created_at, created_by)
- Success message shown: "Unit created successfully"
- Unit appears in units list
- Can be selected in product base unit dropdown

---

#### Negative Test: Create Unit with Duplicate Code

**Test ID**: VAL-UNIT-T101

**Test Description**: Attempt to create unit with code that already exists

**Test Type**: Negative

**Preconditions**:
- Unit with code "KG" already exists in database
- User is authenticated with create permissions

**Test Steps**:
1. Navigate to Product Management → Units
2. Click "Add Unit" button
3. Enter Code: "KG" (duplicate)
4. Enter Name: "Kilograms"
5. Select Type: "INVENTORY"
6. Click "Save"

**Input Data**:
- code: "KG" (duplicate of existing unit)
- name: "Kilograms"
- type: "INVENTORY"
- isActive: true

**Expected Result**: ❌ Validation error displayed

**Validation Layer**: Client (async check) and Server

**Pass/Fail Criteria**:
- Error message shown: "Unit code 'KG' already exists. Please choose a different code."
- Code field highlighted in red
- Unit NOT saved to database
- User remains on create form
- Can correct code and resubmit

---

#### Negative Test: Create Unit with Invalid Code Format

**Test ID**: VAL-UNIT-T102

**Test Description**: Attempt to create unit with code containing spaces and special characters

**Test Type**: Negative

**Preconditions**: User is on Create Unit form

**Test Steps**:
1. Navigate to Create Unit form
2. Enter Code: "K G" (contains space)
3. Tab out of code field (trigger validation)

**Input Data**:
- code: "K G" (contains space - invalid)

**Expected Result**: ❌ Validation error displayed

**Validation Layer**: Client

**Pass/Fail Criteria**:
- Error message shown: "Unit code must contain only uppercase letters, numbers, and underscores (e.g., KG, BOX_10)"
- Code field highlighted in red
- Submit button remains disabled
- Hint text shown: "Use uppercase letters, numbers, and underscores only"

---

#### Boundary Test: Create Unit with Maximum Code Length

**Test ID**: VAL-UNIT-T201

**Test Description**: Create unit with code exactly at 10-character limit

**Test Type**: Boundary

**Preconditions**: User is on Create Unit form

**Test Steps**:
1. Enter Code: "TABLESPOON" (exactly 10 characters)
2. Enter Name: "Tablespoon"
3. Select Type: "MEASURE"
4. Click "Save"

**Input Data**:
- code: "TABLESPOON" (length = 10, maximum allowed)
- name: "Tablespoon"
- type: "MEASURE"
- isActive: true

**Expected Result**: ✅ Unit created successfully (boundary value is acceptable)

**Validation Layer**: All

**Pass/Fail Criteria**:
- No validation errors
- Unit saved successfully
- Code stored as "TABLESPOON" (10 characters)
- Success message shown

---

#### Boundary Test: Create Unit with Code Exceeding Maximum Length

**Test ID**: VAL-UNIT-T202

**Test Description**: Attempt to create unit with code exceeding 10-character limit

**Test Type**: Boundary

**Preconditions**: User is on Create Unit form

**Test Steps**:
1. Enter Code: "TABLESPOONS" (11 characters, exceeds limit)
2. Attempt to type 11th character

**Input Data**:
- code: "TABLESPOONS" (length = 11, exceeds maximum)

**Expected Result**: ❌ Input prevented or validation error

**Validation Layer**: Client

**Pass/Fail Criteria**:
- **Option 1 (HTML maxLength)**: Cannot type 11th character (input stops at 10)
- **Option 2 (Validation)**: Error shown: "Unit code cannot exceed 10 characters"
- Character counter shows "10/10" when at limit
- Submit button disabled if exceeds limit

---

#### Integration Test: Edit Referenced Unit Code (Should Block)

**Test ID**: VAL-UNIT-T301

**Test Description**: Attempt to modify code of unit that is referenced by products

**Test Type**: Integration (Business Rule + Database)

**Preconditions**:
- Unit "KG" exists with 100 product references
- User has update permissions

**Test Steps**:
1. Navigate to Units list
2. Click "Edit" on unit "KG"
3. Edit form loads
4. Attempt to change code from "KG" to "KILOGRAM"
5. Click "Save"

**Input Data**:
- Original code: "KG"
- New code: "KILOGRAM"
- Has references: 100 products

**Expected Result**: ❌ Code change blocked

**Validation Layer**: Client (field read-only) and Server (validation)

**Pass/Fail Criteria**:
- **Client**: Code field displayed as read-only/disabled
- **Client**: Info message shown: "Code cannot be changed because this unit is in use"
- **Server**: If somehow bypassed, server rejects with error
- Error: "Cannot modify unit code 'KG'. This unit is referenced by 100 products."
- Code remains "KG" in database
- Other fields can still be updated

---

#### Integration Test: Delete Referenced Unit (Should Block)

**Test ID**: VAL-UNIT-T302

**Test Description**: Attempt to delete unit that has active product references

**Test Type**: Integration (Business Rule + Database)

**Preconditions**:
- Unit "KG" exists with 150 active product references
- User has delete permissions

**Test Steps**:
1. Navigate to Units list
2. Click "Delete" action on unit "KG"
3. System checks for references
4. Blocking message displayed

**Input Data**:
- Unit: "KG"
- Active references: 150 products

**Expected Result**: ❌ Deletion blocked with detailed error

**Validation Layer**: Server (reference check)

**Pass/Fail Criteria**:
- Deletion blocked before showing confirmation dialog
- Blocking message shown:
  "Cannot delete unit 'KG'. This unit is currently referenced by 150 active products. Please deactivate this unit instead."
- "Deactivate Instead" button offered as alternative
- Unit NOT deleted from database
- User can click "Deactivate" to set isActive=false

---

#### Integration Test: Create Unit with MEASURE Type and Use as Product Base Unit (Should Block)

**Test ID**: VAL-UNIT-T303

**Test Description**: Attempt to use MEASURE type unit as product base unit (should be prevented)

**Test Type**: Integration (Business Rule)

**Preconditions**:
- Unit "CUP" exists with type=MEASURE
- User is creating a new product

**Test Steps**:
1. Create unit "CUP" with type=MEASURE
2. Navigate to Create Product page
3. Open "Base Unit" dropdown
4. Verify "CUP" is NOT in the dropdown

**Input Data**:
- Unit "CUP" with type=MEASURE exists
- Attempting to select as base_unit

**Expected Result**: ✅ MEASURE unit not available for base unit selection

**Validation Layer**: Client (filtered dropdown) and Server (validation)

**Pass/Fail Criteria**:
- Base unit dropdown only shows INVENTORY type units
- "CUP" (MEASURE type) is not in dropdown
- Only INVENTORY units like "KG", "L", "PC" are selectable
- If somehow bypassed, server rejects with error:
  "Base unit must be an INVENTORY type unit. 'CUP' is a MEASURE unit."

---

## 8. Validation Matrix

| Error Code | Rule Name | Fields Involved | Type | Client | Server | Database | Priority |
|------------|-----------|-----------------|------|--------|--------|----------|----------|
| VAL-UNIT-001 | Code Required | code | Field | ✅ | ✅ | ✅ | High |
| VAL-UNIT-002 | Code Min Length | code | Field | ✅ | ✅ | ✅ | High |
| VAL-UNIT-003 | Code Max Length | code | Field | ✅ | ✅ | ✅ | High |
| VAL-UNIT-004 | Code Format | code | Field | ✅ | ✅ | ✅ | High |
| VAL-UNIT-005 | Code Uniqueness | code | Field | ✅ | ✅ | ✅ | Critical |
| VAL-UNIT-006 | Name Required | name | Field | ✅ | ✅ | ✅ | High |
| VAL-UNIT-007 | Name Min Length | name | Field | ✅ | ✅ | ✅ | Medium |
| VAL-UNIT-008 | Name Max Length | name | Field | ✅ | ✅ | ✅ | Medium |
| VAL-UNIT-009 | Description Max Length | description | Field | ✅ | ✅ | ⚠️ | Low |
| VAL-UNIT-010 | Type Required | type | Field | ✅ | ✅ | ✅ | High |
| VAL-UNIT-011 | Type Enum | type | Field | ✅ | ✅ | ✅ | High |
| VAL-UNIT-012 | Status Required | isActive | Field | ✅ | ✅ | ✅ | Medium |
| VAL-UNIT-101 | Code Immutability | code | Business | ✅ | ✅ | ❌ | Critical |
| VAL-UNIT-102 | Type Immutability | type | Business | ✅ | ✅ | ❌ | Critical |
| VAL-UNIT-103 | Deletion Prevention | * | Business | ✅ | ✅ | ⚠️ | Critical |
| VAL-UNIT-104 | Active Unit Selection | isActive | Business | ✅ | ✅ | ❌ | High |
| VAL-UNIT-105 | Base Unit Type | type | Business | ✅ | ✅ | ❌ | Critical |
| VAL-UNIT-201 | Code/Name Consistency | code, name | Advisory | ⚠️ | ❌ | ❌ | Low |
| VAL-UNIT-301 | Create Permission | - | Security | ✅ | ✅ | ✅ | Critical |
| VAL-UNIT-302 | Update Permission | - | Security | ✅ | ✅ | ✅ | Critical |
| VAL-UNIT-303 | Delete Permission | - | Security | ✅ | ✅ | ✅ | Critical |
| VAL-UNIT-304 | Input Sanitization | code, name, description | Security | ✅ | ✅ | ✅ | Critical |
| VAL-UNIT-305 | Audit Trail | audit fields | Security | ❌ | ✅ | ✅ | High |

**Legend**:
- ✅ **Enforced at this layer**: Full validation implemented
- ❌ **Not enforced at this layer**: No validation at this level
- ⚠️ **Partial enforcement**: Limited or conditional validation
- **Priority**: Critical > High > Medium > Low

**Priority Definitions**:
- **Critical**: Data integrity or security issue, must never fail
- **High**: Important business rule, serious impact if violated
- **Medium**: User experience or data quality issue
- **Low**: Advisory or nice-to-have validation

---

## 9. Related Documents

- **Business Requirements**: [BR-units.md](./BR-units.md) - Functional requirements and business rules
- **Use Cases**: [UC-units.md](./UC-units.md) - Detailed user scenarios and workflows
- **Technical Specification**: [TS-units.md](./TS-units.md) - Technical implementation details
- **Data Dictionary**: [DD-units.md](./DD-units.md) - Database structure and relationships
- **Flow Diagrams**: [FD-units.md](./FD-units.md) - Process flows and state diagrams

---

**Document Control**:
- **Created**: 2025-11-02
- **Author**: Documentation Team
- **Reviewed By**: Business Analyst, QA Lead, Security Team
- **Approved By**: Technical Lead, Product Owner
- **Next Review**: 2025-02-02 (Quarterly review)

---

## Appendix: Error Code Registry

| Code Range | Category | Description | Count |
|------------|----------|-------------|-------|
| VAL-UNIT-001 to 099 | Field Validations | Individual field rules | 12 rules |
| VAL-UNIT-101 to 199 | Business Rules | Business logic validations | 5 rules |
| VAL-UNIT-201 to 299 | Cross-Field | Multi-field relationships | 1 rule (advisory) |
| VAL-UNIT-301 to 399 | Security | Permission and access control | 5 rules |
| VAL-UNIT-901 to 999 | System | System-level errors | Reserved |

**Total Validation Rules**: 23 rules (12 field + 5 business + 1 cross-field + 5 security)

---

**Validation Coverage Summary**:

- **Field-Level Validations**: 12 rules covering all 5 unit fields
- **Business Rule Validations**: 5 critical rules protecting data integrity
- **Security Validations**: 5 rules ensuring proper access control
- **Test Scenarios**: 10+ comprehensive test cases covering positive, negative, boundary, and integration tests
- **Validation Layers**: All rules implemented across client, server, and database layers where applicable

---

**Template Usage Notes**:
- All placeholders replaced with actual Units Management values
- All validation rules based on actual business requirements from BR-units.md
- Error messages designed to be user-friendly and actionable
- Test scenarios cover real-world usage patterns
- Security validations aligned with CARMEN ERP role-based access control

**Maintenance Notes**:
- Review validation rules when business requirements change
- Update error messages based on user feedback
- Add new test scenarios as edge cases are discovered
- Monitor validation performance and optimize slow checks
- Keep validation rules synchronized across all three layers
