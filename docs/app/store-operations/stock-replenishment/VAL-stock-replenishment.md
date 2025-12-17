# VAL-SREP: Stock Replenishment Validation Rules

**Module**: Store Operations
**Sub-Module**: Stock Replenishment
**Document Type**: Validations (VAL)
**Version**: 1.2.0
**Last Updated**: 2025-12-09
**Status**: Active
**Implementation Status**: PARTIALLY IMPLEMENTED (Frontend validation exists, backend pending)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2.0 | 2025-12-09 | Documentation Team | Updated to reflect implemented frontend validation |
| 1.1.0 | 2025-12-05 | Documentation Team | Added implementation status |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---

**✅ IMPLEMENTATION NOTE**: The Stock Replenishment module frontend has been implemented with client-side validation in forms. The validation rules in this document are followed in the UI implementation using React Hook Form and Zod schemas. Backend validation and database constraints are pending.

**Implemented Validation Contexts**:
- ✅ **New Request Form** (`/store-operations/stock-replenishment/new/`) - Location selection, item validation, quantity limits, priority selection
- ✅ **Request Approval** (`/store-operations/stock-replenishment/requests/[id]/`) - Status transitions, authorization checks
- ✅ **Par Level Monitoring** (`/store-operations/stock-replenishment/stock-levels/`) - Threshold validation (40% reorder, 30% minimum)

**Validation Status**:
- ✅ Client-side validation in forms - IMPLEMENTED
- ⏳ Server-side business rules - PENDING (using mock data)
- ⏳ Database constraints - PENDING (schema not deployed)

See BR-stock-replenishment.md Section 1.4 for complete implementation details.

---

## 1. Overview

### 1.1 Purpose

This document defines comprehensive validation rules for the Stock Replenishment module, ensuring data integrity, business rule enforcement, and system security across all replenishment operations. Proper validation prevents stockouts, over-ordering, data corruption, and unauthorized access.

**Critical Validations**:
- Par level configuration within storage capacity and business rules
- Replenishment quantities within acceptable limits
- Stock availability verification before approvals
- Expiry date validation for perishables
- Permission-based access control
- Cross-field relationship consistency

**Consequences of Invalid Data**:
- Stockouts from incorrect par levels affecting operations
- Over-ordering leading to waste and carrying costs
- Transfer failures from invalid quantities
- Security breaches from insufficient access controls
- Financial losses from incorrect calculations
- Operational disruptions from data inconsistencies

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
6. Validate cross-system data (inventory, workflow)

---

## 2. Field-Level Validations (VAL-SREP-001 to 099)

### VAL-SREP-001: Par Level - Required and Positive

**Field**: `par_level`
**Database Column**: `tb_par_level_config.par_level`
**Data Type**: DECIMAL(20,5) / number

**Validation Rule**: Par level is mandatory and must be a positive number greater than zero.

**Rationale**: Par level is the foundation of automated replenishment. Zero or negative values would make monitoring impossible.

**Implementation Requirements**:
- **Client-Side**: Required field with red asterisk. Show error on blur if empty or ≤ 0.
- **Server-Side**: Reject if missing, null, ≤ 0, or not a valid number.
- **Database**: Column NOT NULL, CHECK constraint `par_level > 0`.

**Error Code**: VAL-SREP-001
**Error Message**: "Par level is required and must be greater than zero"
**User Action**: User must enter a positive number representing target stock level.

**Test Cases**:
- ✅ Valid: 25 (positive number)
- ✅ Valid: 10.5 (decimal allowed)
- ❌ Invalid: 0 (zero not allowed)
- ❌ Invalid: -5 (negative not allowed)
- ❌ Invalid: "" (empty not allowed)
- ❌ Invalid: null (null not allowed)

---

### VAL-SREP-002: Par Level - Maximum Value

**Field**: `par_level`

**Validation Rule**: Par level cannot exceed location's storage capacity for the item.

**Rationale**: Prevents configuring par levels higher than physical storage allows.

**Implementation Requirements**:
- **Client-Side**: Display storage capacity info. Validate against capacity on blur.
- **Server-Side**: Query location capacity, compare before saving.
- **Database**: Not enforced (capacity is dynamic configuration).

**Error Code**: VAL-SREP-002
**Error Message**: "Par level ({value}) exceeds storage capacity ({capacity}) for this location"
**User Action**: User must reduce par level to within storage capacity or request capacity increase.

**Test Cases**:
- ✅ Valid: Par 50, Capacity 100
- ✅ Valid: Par 100, Capacity 100 (equal is acceptable)
- ❌ Invalid: Par 150, Capacity 100

---

### VAL-SREP-003: Reorder Point - Calculation Validation

**Field**: `reorder_point`
**Database Column**: `tb_par_level_config.reorder_point`
**Data Type**: DECIMAL(20,5) / number

**Validation Rule**: Reorder point must be between 30% and 60% of par level.

**Rationale**: Ensures adequate lead time for replenishment without triggering too early.

**Formula**: `reorder_point = par_level × 0.4` (default 40%)

**Implementation Requirements**:
- **Client-Side**: Auto-calculate when par level entered. Allow manual override with validation.
- **Server-Side**: Verify reorder_point is between `par_level × 0.3` and `par_level × 0.6`.
- **Database**: CHECK constraint `reorder_point >= par_level * 0.3 AND reorder_point <= par_level * 0.6`.

**Error Code**: VAL-SREP-003
**Error Message**: "Reorder point must be between 30% and 60% of par level ({min} - {max})"
**User Action**: Adjust reorder point to acceptable range or accept system suggestion.

**Test Cases**:
- ✅ Valid: Par 100, Reorder 40 (40%)
- ✅ Valid: Par 100, Reorder 30 (30% - minimum)
- ✅ Valid: Par 100, Reorder 60 (60% - maximum)
- ❌ Invalid: Par 100, Reorder 25 (25% - below minimum)
- ❌ Invalid: Par 100, Reorder 65 (65% - above maximum)

---

### VAL-SREP-004: Minimum Level - Calculation Validation

**Field**: `minimum_level`
**Database Column**: `tb_par_level_config.minimum_level`
**Data Type**: DECIMAL(20,5) / number

**Validation Rule**: Minimum level must equal 30% of par level.

**Rationale**: Standardizes critical threshold for consistent alerting across system.

**Formula**: `minimum_level = par_level × 0.3`

**Implementation Requirements**:
- **Client-Side**: Auto-calculate when par level entered. Display as calculated field.
- **Server-Side**: Calculate and set automatically, ignore any provided value.
- **Database**: Calculated column or CHECK constraint `minimum_level = par_level * 0.3`.

**Error Code**: VAL-SREP-004
**Error Message**: "Minimum level must equal 30% of par level"
**User Action**: System automatically calculates this value.

**Test Cases**:
- ✅ Valid: Par 100, Minimum 30 (30% exact)
- ❌ Invalid: Par 100, Minimum 25 (not 30%)
- ❌ Invalid: Par 100, Minimum 35 (not 30%)

---

### VAL-SREP-005: Lead Time Days - Range Validation

**Field**: `lead_time_days`
**Database Column**: `tb_par_level_config.lead_time_days`
**Data Type**: INTEGER / number

**Validation Rule**: Lead time must be between 1 and 30 days (inclusive).

**Rationale**: Reasonable range for internal replenishment operations.

**Implementation Requirements**:
- **Client-Side**: Number input with min=1, max=30. Show hint: "Days until item can be received"
- **Server-Side**: Verify value is integer between 1 and 30.
- **Database**: CHECK constraint `lead_time_days >= 1 AND lead_time_days <= 30`.

**Error Code**: VAL-SREP-005
**Error Message**: "Lead time must be between 1 and 30 days"
**User Action**: Enter realistic lead time for replenishment delivery.

**Test Cases**:
- ✅ Valid: 2 (typical)
- ✅ Valid: 1 (minimum - same day)
- ✅ Valid: 30 (maximum)
- ❌ Invalid: 0 (below minimum)
- ❌ Invalid: 31 (above maximum)
- ❌ Invalid: 2.5 (must be integer)

---

### VAL-SREP-006: Requested Quantity - Positive and Maximum

**Field**: `requested_quantity`
**Database Column**: `tb_replenishment_request_detail.requested_quantity`
**Data Type**: DECIMAL(20,5) / number

**Validation Rule**: Requested quantity must be positive and cannot exceed par level × 2.

**Rationale**: Prevents unrealistic replenishment quantities and potential over-ordering.

**Implementation Requirements**:
- **Client-Side**: Minimum 0 (exclusive), show warning if > par level.
- **Server-Side**: Verify quantity > 0 and <= (par_level × 2).
- **Database**: CHECK constraint `requested_quantity > 0`.

**Error Code**: VAL-SREP-006
**Error Message**: "Requested quantity must be positive and cannot exceed twice the par level ({max})"
**User Action**: Reduce quantity to reasonable amount or split into multiple requests.

**Test Cases**:
- ✅ Valid: Par 50, Requested 30
- ✅ Valid: Par 50, Requested 100 (2× par - maximum)
- ❌ Invalid: Par 50, Requested 0
- ❌ Invalid: Par 50, Requested -10
- ❌ Invalid: Par 50, Requested 150 (3× par - exceeds maximum)

---

### VAL-SREP-007: Required By Date - Future Date

**Field**: `required_by_date`
**Database Column**: `tb_replenishment_request.required_by_date`
**Data Type**: TIMESTAMPTZ(6) / Date

**Validation Rule**: Required by date must be a future date within 30 days from request date.

**Rationale**: Ensures realistic delivery timelines and prevents backdated requests.

**Implementation Requirements**:
- **Client-Side**: Date picker with min=today+1, max=today+30. Show date in user's timezone.
- **Server-Side**: Verify required_by_date > request_date AND required_by_date <= request_date + 30 days.
- **Database**: CHECK constraint `required_by_date > request_date`.

**Error Code**: VAL-SREP-007
**Error Message**: "Required by date must be after request date and within 30 days"
**User Action**: Select realistic future delivery date.

**Test Cases**:
- ✅ Valid: Request 2025-01-30, Required 2025-02-01 (2 days)
- ✅ Valid: Request 2025-01-30, Required 2025-02-28 (29 days)
- ❌ Invalid: Request 2025-01-30, Required 2025-01-30 (same day)
- ❌ Invalid: Request 2025-01-30, Required 2025-01-25 (past date)
- ❌ Invalid: Request 2025-01-30, Required 2025-03-15 (44 days - exceeds 30)

---

### VAL-SREP-008: Product Selection - Required and Valid

**Field**: `product_id`
**Database Column**: Multiple tables `.product_id`
**Data Type**: UUID / string

**Validation Rule**: Product must be selected and must be an active product in the catalog.

**Rationale**: Ensures replenishment only for valid, active products.

**Implementation Requirements**:
- **Client-Side**: Required field, searchable dropdown showing only active products.
- **Server-Side**: Verify product_id exists in tb_product with status='active'.
- **Database**: Foreign key constraint to tb_product.

**Error Code**: VAL-SREP-008
**Error Message**: "Product is required and must be an active product"
**User Action**: Select valid active product from catalog.

**Test Cases**:
- ✅ Valid: Existing active product UUID
- ❌ Invalid: Empty/null product_id
- ❌ Invalid: Non-existent product UUID
- ❌ Invalid: Inactive/discontinued product UUID

---

### VAL-SREP-009: Location Selection - Required and Valid

**Field**: `location_id`
**Database Column**: Multiple tables `.location_id`
**Data Type**: UUID / string

**Validation Rule**: Location must be selected and must be an active location user has access to.

**Rationale**: Ensures replenishment for valid locations with proper access control.

**Implementation Requirements**:
- **Client-Side**: Required field, dropdown showing only accessible active locations.
- **Server-Side**: Verify location_id exists, is active, and user has access.
- **Database**: Foreign key constraint to tb_location.

**Error Code**: VAL-SREP-009
**Error Message**: "Location is required and must be an active location you have access to"
**User Action**: Select valid location from accessible list.

**Test Cases**:
- ✅ Valid: Existing active location UUID with user access
- ❌ Invalid: Empty/null location_id
- ❌ Invalid: Non-existent location UUID
- ❌ Invalid: Inactive location UUID
- ❌ Invalid: Location UUID user doesn't have access to

---

### VAL-SREP-010: Batch/Lot Number - Format Validation

**Field**: `batch_lot_number`
**Database Column**: `tb_stock_transfer_detail.batch_lot_number`
**Data Type**: VARCHAR / string

**Validation Rule**: Batch/lot number must match format LOT-YYYY-MM-DD when provided (optional field).

**Format**: `LOT-YYYY-MM-DD` where YYYY=year, MM=month, DD=day

**Implementation Requirements**:
- **Client-Side**: Pattern validation on blur if value provided.
- **Server-Side**: Regex validation: `^LOT-\d{4}-\d{2}-\d{2}$`.
- **Database**: No constraint (optional field).

**Error Code**: VAL-SREP-010
**Error Message**: "Batch/lot number must be in format LOT-YYYY-MM-DD (e.g., LOT-2025-01-30)"
**User Action**: Enter batch number in correct format or leave empty.

**Test Cases**:
- ✅ Valid: "LOT-2025-01-30"
- ✅ Valid: "" (empty - optional field)
- ✅ Valid: null (optional field)
- ❌ Invalid: "LOT-25-01-30" (year must be 4 digits)
- ❌ Invalid: "LOT-2025-1-30" (month must be 2 digits)
- ❌ Invalid: "BATCH-2025-01-30" (wrong prefix)

---

### VAL-SREP-011: Expiry Date - Future Date for Perishables

**Field**: `expiry_date`
**Database Column**: `tb_stock_transfer_detail.expiry_date`
**Data Type**: TIMESTAMPTZ(6) / Date

**Validation Rule**: For perishable items, expiry date must be at least 7 days in the future from today.

**Rationale**: Ensures items have sufficient shelf life for use.

**Implementation Requirements**:
- **Client-Side**: Date picker with min=today+7 for perishable items. Disabled for non-perishables.
- **Server-Side**: If product is perishable, verify expiry_date >= today + 7 days.
- **Database**: No constraint (product-type dependent).

**Error Code**: VAL-SREP-011
**Error Message**: "Expiry date must be at least 7 days in the future for perishable items"
**User Action**: Select items with longer shelf life or adjust order.

**Test Cases**:
- ✅ Valid: Perishable item, expiry = today + 10 days
- ✅ Valid: Non-perishable item, any expiry or no expiry
- ❌ Invalid: Perishable item, expiry = today + 3 days
- ❌ Invalid: Perishable item, expiry = today (too soon)

---

### VAL-SREP-012: Special Notes - Maximum Length

**Field**: `special_notes`
**Database Column**: `tb_par_level_config.special_notes`
**Data Type**: VARCHAR / string

**Validation Rule**: Special notes cannot exceed 500 characters.

**Rationale**: Prevents excessively long text affecting database performance and UI display.

**Implementation Requirements**:
- **Client-Side**: Textarea with maxLength=500. Show character counter "0/500".
- **Server-Side**: Verify length <= 500 characters.
- **Database**: Column defined as VARCHAR(500).

**Error Code**: VAL-SREP-012
**Error Message**: "Special notes cannot exceed 500 characters"
**User Action**: Shorten notes or use additional documentation fields.

**Test Cases**:
- ✅ Valid: Text with 500 characters (at limit)
- ✅ Valid: Text with 100 characters
- ✅ Valid: Empty string
- ❌ Invalid: Text with 501 characters

---

## 3. Business Rule Validations (VAL-SREP-101 to 199)

### VAL-SREP-101: Par Level Change Approval Required

**Rule Description**: Par level changes greater than 20% from current value require Department Manager approval.

**Business Justification**: Prevents unauthorized significant changes to inventory levels that affect carrying costs and operational efficiency.

**Related Business Requirements**: BR-SREP-001

**Validation Logic**:
1. Retrieve current par level for item/location
2. If no current par level, no approval needed (new configuration)
3. Calculate percentage change: `|new_par - current_par| / current_par × 100`
4. If percentage > 20%, set approval_status = 'pending' and require manager approval
5. If percentage <= 20%, set approval_status = 'approved' automatically

**When Validated**: On par level configuration save/update

**Implementation Requirements**:
- **Client-Side**: Show warning if change > 20%: "This change requires manager approval"
- **Server-Side**: Calculate percentage, set approval status, notify manager if needed
- **Database**: Column `approval_status` enum('approved', 'pending', 'rejected')

**Error Code**: VAL-SREP-101
**Error Message**: "Par level change of {percentage}% requires Department Manager approval"
**User Action**: Provide justification and submit for approval, or reduce change to ≤20%.

**Examples**:

**Scenario 1: Small Change (Valid)**
- Current par: 50
- New par: 55
- Change: 10% (acceptable)
- Result: ✅ Auto-approved, saved immediately

**Scenario 2: Large Change (Requires Approval)**
- Current par: 50
- New par: 65
- Change: 30% (requires approval)
- Result: ⚠️ Saved as 'pending', manager notified
- User must: Wait for manager approval

---

### VAL-SREP-102: Stock Availability Check

**Rule Description**: Before approving transfer request, verify sufficient stock available at source location (warehouse).

**Business Justification**: Prevents approving requests that cannot be fulfilled, avoiding false expectations.

**Related Business Requirements**: BR-SREP-006, BR-SREP-008

**Validation Logic**:
1. For each line item, query current warehouse inventory
2. Check: `available_stock >= requested_quantity`
3. Consider: `available_stock = on_hand - reserved_for_other_requests`
4. If any item insufficient, determine partial approval eligibility
5. Minimum 50% of requested quantity must be available for partial approval

**When Validated**: On request approval action by Warehouse Manager

**Implementation Requirements**:
- **Client-Side**: Show real-time warehouse availability next to each item
- **Server-Side**: Query inventory system, calculate available stock, verify quantities
- **Database**: Not enforced (runtime business logic)

**Error Code**: VAL-SREP-102
**Error Message**: "Insufficient warehouse stock for {product_name}. Available: {available}, Requested: {requested}"
**User Action**: Approve partial quantity, reject request, or wait for warehouse stock replenishment.

**Examples**:

**Scenario 1: Sufficient Stock**
- Requested: 20 units
- Warehouse available: 45 units
- Result: ✅ Can approve full quantity

**Scenario 2: Partial Stock**
- Requested: 20 units
- Warehouse available: 12 units
- Percentage: 60% (acceptable for partial - ≥50%)
- Result: ⚠️ Can approve 12 units (partial approval)
- User must: Contact store manager to confirm partial acceptable

**Scenario 3: Insufficient Stock**
- Requested: 20 units
- Warehouse available: 8 units
- Percentage: 40% (<50% threshold)
- Result: ❌ Cannot approve (below minimum threshold)
- User must: Reject request or wait for warehouse replenishment

---

### VAL-SREP-103: Emergency Request Frequency Limit

**Rule Description**: Store locations limited to 2 emergency transfer requests per week.

**Business Justification**: Prevents abuse of emergency process and encourages proper planning.

**Related Business Requirements**: BR-SREP-007

**Validation Logic**:
1. Query emergency requests from this location in past 7 days
2. Count = number of emergency requests
3. If count >= 2, reject new emergency request
4. Exception: Department Manager can override limit with approval

**When Validated**: On emergency request submission

**Implementation Requirements**:
- **Client-Side**: Show emergency request count for current week
- **Server-Side**: Query recent emergency requests, enforce limit
- **Database**: Not enforced (runtime business logic)

**Error Code**: VAL-SREP-103
**Error Message**: "Emergency request limit reached ({count}/2 this week). Use standard replenishment or contact Department Manager for override."
**User Action**: Submit as standard request or escalate to Department Manager for emergency override.

**Examples**:

**Scenario 1: Within Limit**
- Emergency requests this week: 1
- Limit: 2
- Result: ✅ Can submit emergency request

**Scenario 2: At Limit**
- Emergency requests this week: 2
- Limit: 2
- Result: ❌ Cannot submit without manager approval
- User must: Submit standard request or contact Department Manager

**Scenario 3: Manager Override**
- Emergency requests this week: 2
- Department Manager approval: Yes
- Result: ✅ Can proceed with emergency request (exception)

---

### VAL-SREP-104: Reorder Point Between Minimum and Par

**Rule Description**: Reorder point must be greater than minimum level and less than par level.

**Business Justification**: Ensures logical ordering of threshold levels for proper monitoring.

**Related Business Requirements**: BR-SREP-002, BR-SREP-003

**Validation Logic**:
1. Verify: `reorder_point > minimum_level`
2. Verify: `reorder_point < par_level`
3. Both conditions must be true

**When Validated**: On par level configuration save

**Implementation Requirements**:
- **Client-Side**: Real-time validation as values change
- **Server-Side**: Verify relationship before saving
- **Database**: CHECK constraint `reorder_point > minimum_level AND reorder_point < par_level`

**Error Code**: VAL-SREP-104
**Error Message**: "Reorder point ({reorder}) must be between minimum level ({min}) and par level ({par})"
**User Action**: Adjust reorder point to be within valid range.

**Examples**:

**Valid Relationship**:
- Par: 100
- Reorder: 40
- Minimum: 30
- Check: 30 < 40 < 100 ✅

**Invalid: Reorder Below Minimum**:
- Par: 100
- Reorder: 25
- Minimum: 30
- Check: 25 < 30 ❌ (reorder should be > minimum)

**Invalid: Reorder Above Par**:
- Par: 100
- Reorder: 105
- Minimum: 30
- Check: 105 > 100 ❌ (reorder should be < par)

---

### VAL-SREP-105: Replenishment Quantity Calculation

**Rule Description**: System-calculated replenishment quantity = Par Level - (Current Stock + Pending Transfers).

**Business Justification**: Ensures accurate replenishment without over-ordering.

**Related Business Requirements**: BR-SREP-004

**Validation Logic**:
1. current_stock = on-hand inventory at location
2. pending_transfers = sum of quantities in in_transit transfers
3. calculated_quantity = par_level - (current_stock + pending_transfers)
4. If user-provided quantity differs by >20%, flag for review
5. Minimum replenishment: 1 unit (don't allow zero)

**When Validated**: On transfer request creation from recommendations

**Implementation Requirements**:
- **Client-Side**: Display calculation breakdown to user
- **Server-Side**: Calculate recommended quantity, compare to user input
- **Database**: Not enforced (calculated value)

**Error Code**: VAL-SREP-105
**Error Message**: "Requested quantity ({requested}) differs significantly from calculated ({calculated}). Provide reason for difference."
**User Action**: Accept system recommendation or provide justification for different quantity.

**Examples**:

**Scenario 1: Standard Calculation**
- Par Level: 100
- Current Stock: 20
- Pending Transfers: 10
- Calculated: 100 - (20 + 10) = 70 ✅

**Scenario 2: Excess Stock (No Replenishment Needed)**
- Par Level: 100
- Current Stock: 90
- Pending Transfers: 20
- Calculated: 100 - (90 + 20) = -10 → 0 (no replenishment needed)

---

### VAL-SREP-106: Partial Fulfillment Minimum

**Rule Description**: Partial approval must be at least 50% of requested quantity for standard requests.

**Business Justification**: Balances operational need with efficiency of transfers.

**Related Business Requirements**: BR-SREP-008

**Validation Logic**:
1. If full quantity unavailable, calculate available percentage
2. percentage = (available_quantity / requested_quantity) × 100
3. If percentage >= 50%, partial approval allowed
4. If percentage < 50%, partial approval not recommended (requires consultation)
5. Exception: Critical/urgent requests can accept <50% with explicit approval

**When Validated**: On warehouse approval with partial stock

**Implementation Requirements**:
- **Client-Side**: Calculate and display percentage automatically
- **Server-Side**: Enforce 50% rule, allow manager override for urgent
- **Database**: Not enforced (business logic)

**Error Code**: VAL-SREP-106
**Error Message**: "Partial quantity ({available}) is only {percentage}% of requested. Minimum 50% required for standard partial approval."
**User Action**: Contact store manager to discuss options: accept partial, wait for stock, or cancel request.

**Examples**:

**Scenario 1: Acceptable Partial (60%)**
- Requested: 20
- Available: 12
- Percentage: 60%
- Result: ✅ Can approve partial (≥50%)

**Scenario 2: Below Threshold (40%)**
- Requested: 20
- Available: 8
- Percentage: 40%
- Result: ⚠️ Should contact store manager first

**Scenario 3: Critical Override**
- Requested: 20
- Available: 5
- Percentage: 25%
- Priority: Critical/Urgent
- Result: ✅ Can approve with explicit manager approval

---

### VAL-SREP-107: Transfer Timeline Validation

**Rule Description**: Transfer must be completed within specified timeframe based on priority.

**Business Justification**: Ensures timely fulfillment and prevents overdue transfers.

**Related Business Requirements**: BR-SREP-007

**Timeline Requirements**:
- **Urgent**: Approve within 30 min, transfer within 4 hours
- **Priority**: Approve within 4 hours, transfer within 24 hours
- **Standard**: Approve within 24 hours, transfer within 48 hours
- **Scheduled**: Approve in advance, transfer on scheduled date

**Validation Logic**:
1. On approval, set expected_completion_date based on priority
2. Monitor transfer status against timeline
3. If overdue, escalate to Department Manager
4. Track SLA compliance for performance metrics

**When Validated**: On status transitions, scheduled checks

**Implementation Requirements**:
- **Client-Side**: Display SLA countdown for approvers
- **Server-Side**: Calculate expected dates, trigger escalations
- **Database**: Columns for expected dates and SLA tracking

**Error Code**: VAL-SREP-107
**Error Message**: "Transfer is overdue. Expected completion: {expected_date}, Current: {current_date}"
**User Action**: Expedite transfer or provide reason for delay.

---

### VAL-SREP-108: Consumption Data Requirement

**Rule Description**: Minimum 30 days of consumption data required before system generates automatic par level recommendations.

**Business Justification**: Ensures recommendations based on reliable historical patterns.

**Related Business Requirements**: BR-SREP-009

**Validation Logic**:
1. Query inventory transactions for item/location
2. Count transaction days with consumption (issues)
3. Calculate data span = earliest_date to latest_date
4. Require: transaction_count >= 10 AND data_span >= 30 days AND week_count >= 3
5. If insufficient, use category averages and mark as "estimated"

**When Validated**: On consumption pattern analysis run

**Implementation Requirements**:
- **Client-Side**: Show data confidence indicator on par level suggestions
- **Server-Side**: Verify data sufficiency before generating recommendations
- **Database**: Not enforced (runtime business logic)

**Error Code**: VAL-SREP-108
**Error Message**: "Insufficient consumption data for reliable recommendation. Using category averages (confidence: low)"
**User Action**: Review system suggestion carefully and adjust based on operational knowledge.

**Examples**:

**Scenario 1: Sufficient Data**
- Transaction count: 45
- Data span: 60 days
- Week count: 8
- Result: ✅ Generate reliable recommendations

**Scenario 2: Insufficient Data**
- Transaction count: 8
- Data span: 15 days
- Week count: 2
- Result: ⚠️ Use category averages, flag as "estimated"

---

## 4. Cross-Field Validations (VAL-SREP-201 to 299)

### VAL-SREP-201: Par Level Hierarchy

**Fields Involved**: `par_level`, `reorder_point`, `minimum_level`

**Validation Rule**: Par level > Reorder point > Minimum level (strict hierarchy).

**Business Justification**: Ensures logical threshold ordering for proper automated monitoring.

**Validation Logic**:
```
par_level > reorder_point > minimum_level
AND
reorder_point - minimum_level >= 0.1 × par_level (meaningful gap)
```

**When Validated**: On par level configuration save/update

**Implementation Requirements**:
- **Client-Side**: Real-time validation as any value changes. Show visual indicator of levels.
- **Server-Side**: Verify hierarchy before saving. Verify minimum 10% gap between levels.
- **Database**: CHECK constraint `par_level > reorder_point AND reorder_point > minimum_level`

**Error Code**: VAL-SREP-201
**Error Message**: "Invalid level hierarchy. Must be: Par ({par}) > Reorder ({reorder}) > Minimum ({min}) with adequate gaps"
**User Action**: Adjust values to maintain proper hierarchy with meaningful gaps.

**Valid Scenarios**:
- Par: 100, Reorder: 40, Minimum: 30 ✅ (100 > 40 > 30, adequate gaps)
- Par: 50, Reorder: 20, Minimum: 15 ✅

**Invalid Scenarios**:
- Par: 100, Reorder: 105, Minimum: 30 ❌ (reorder > par)
- Par: 100, Reorder: 25, Minimum: 30 ❌ (minimum > reorder)
- Par: 100, Reorder: 99, Minimum: 98 ❌ (gaps too small)

---

### VAL-SREP-202: Request Date Range

**Fields Involved**: `request_date`, `required_by_date`

**Validation Rule**: Required by date must be after request date and within 30 days.

**Business Justification**: Ensures logical temporal ordering and realistic delivery expectations.

**Validation Logic**:
1. Verify: `required_by_date > request_date`
2. Calculate: `days_difference = required_by_date - request_date`
3. Verify: `days_difference <= 30`
4. Verify: `days_difference >= lead_time_days` (if par level configured)

**When Validated**: On request creation/update, when either date changes

**Implementation Requirements**:
- **Client-Side**: Set min date for required_by_date picker to request_date + 1. Show warning if >30 days.
- **Server-Side**: Compare dates, verify range.
- **Database**: CHECK constraint `required_by_date > request_date`

**Error Code**: VAL-SREP-202
**Error Message**:
- If required_by_date <= request_date: "Required by date must be after request date"
- If difference > 30 days: "Required by date cannot be more than 30 days from request date"
- If difference < lead_time: "Required by date should allow for lead time ({lead_time} days)"

**User Action**: Adjust dates to meet requirements.

**Valid Scenarios**:
- Request: 2025-01-30, Required: 2025-02-05 (6 days) ✅
- Request: 2025-01-30, Required: 2025-02-28 (29 days) ✅

**Invalid Scenarios**:
- Request: 2025-01-30, Required: 2025-01-30 (same day) ❌
- Request: 2025-01-30, Required: 2025-01-25 (before request) ❌
- Request: 2025-01-30, Required: 2025-03-15 (44 days) ❌

---

### VAL-SREP-203: Received vs Ordered Quantity

**Fields Involved**: `requested_quantity`, `approved_quantity`, `received_quantity`

**Validation Rule**: Received quantity cannot exceed approved quantity for any line item.

**Business Justification**: Prevents receiving more than was approved and allocated.

**Validation Logic**:
1. For each line item during receipt:
2. Verify: `received_quantity <= approved_quantity`
3. Allow: `received_quantity < approved_quantity` (shortage)
4. Reject: `received_quantity > approved_quantity` (overage)

**When Validated**: On transfer receipt confirmation

**Implementation Requirements**:
- **Client-Side**: Show approved quantity, validate entered received quantity doesn't exceed
- **Server-Side**: Verify received <= approved for all items
- **Database**: No constraint (runtime validation)

**Error Code**: VAL-SREP-203
**Error Message**: "Received quantity ({received}) cannot exceed approved quantity ({approved}) for {product_name}"
**User Action**: Verify count. If truly received more, contact warehouse to investigate overage.

**Valid Scenarios**:
- Approved: 20, Received: 20 ✅ (exact match)
- Approved: 20, Received: 18 ✅ (shortage - acceptable)

**Invalid Scenarios**:
- Approved: 20, Received: 22 ❌ (overage - not allowed)

---

### VAL-SREP-204: Total Value Calculation

**Fields Involved**: Line item quantities and prices, Total value

**Validation Rule**: Total request value must equal sum of (quantity × unit_price) for all line items.

**Business Justification**: Ensures financial accuracy and prevents calculation errors.

**Validation Logic**:
```
calculated_total = SUM(quantity × unit_price) for all items
allow_difference = 0.01 (rounding tolerance)
ABS(calculated_total - provided_total) <= allow_difference
```

**When Validated**: After line item changes, before request submission

**Implementation Requirements**:
- **Client-Side**: Auto-calculate and display total as items added/modified
- **Server-Side**: Recalculate total, verify matches within tolerance
- **Database**: No constraint (calculated value)

**Error Code**: VAL-SREP-204
**Error Message**: "Total value mismatch. Calculated: {calculated}, Provided: {provided}"
**User Action**: System should auto-correct. If persists, verify line item prices.

**Valid Scenario**:
- Item 1: 10 units × $5.00 = $50.00
- Item 2: 5 units × $3.50 = $17.50
- Total: $67.50 ✅

**Invalid Scenario**:
- Calculated: $67.50
- Provided: $70.00
- Difference: $2.50 (exceeds $0.01 tolerance) ❌

---

## 5. Security Validations (VAL-SREP-301 to 399)

### VAL-SREP-301: Configure Par Level Permission

**Validation Rule**: User must have `configure_par_levels` permission to create or modify par level configurations.

**Checked Permissions**:
- `configure_par_levels`: Can create/modify par level configurations for assigned locations
- `approve_par_levels`: Can approve par level changes >20%

**When Validated**: Before par level configuration operations

**Implementation Requirements**:
- **Client-Side**: Hide par level configuration UI if permission missing
- **Server-Side**: Verify permission before allowing any par level operations
- **Database**: RLS policies check user permissions

**Error Code**: VAL-SREP-301
**Error Message**: "You do not have permission to configure par levels"
**User Action**: Request `configure_par_levels` permission from administrator.

---

### VAL-SREP-302: Create Request Permission

**Validation Rule**: User must have `create_replenishment_request` permission and access to requesting location.

**Checked Permissions**:
- `create_replenishment_request`: Can create transfer requests
- Location access: User is assigned to requesting location

**When Validated**: Before transfer request creation

**Implementation Requirements**:
- **Client-Side**: Hide create request button if permission missing
- **Server-Side**: Verify both permission and location access
- **Database**: RLS policies enforce location access

**Error Code**: VAL-SREP-302
**Error Message**: "You do not have permission to create transfer requests for this location"
**User Action**: Request permission or create request for accessible location.

---

### VAL-SREP-303: Approve Request Permission

**Validation Rule**: User must have `approve_replenishment_request` permission and appropriate authority level.

**Checked Permissions**:
- `approve_replenishment_request`: Can approve requests
- Authority level: Sufficient for request value tier

**Authority Tiers**:
- Warehouse Manager: Up to $50,000
- Department Manager: $50,001 - $100,000
- General Manager: Above $100,000

**When Validated**: Before approval action

**Implementation Requirements**:
- **Client-Side**: Hide approve button if permission missing or insufficient authority
- **Server-Side**: Verify permission and authority level vs request value
- **Database**: RLS policies check permissions

**Error Code**: VAL-SREP-303
**Error Message**: "You do not have sufficient authority to approve requests of this value ({value})"
**User Action**: Request higher authority level or escalate to appropriate approver.

---

### VAL-SREP-304: Location Access Validation

**Validation Rule**: User can only create requests for and view inventory of locations they have access to.

**Access Rules**:
- User must be assigned to location (via user_locations table)
- OR user is department manager for location's department
- OR user has admin role

**When Validated**: On all location-specific operations

**Implementation Requirements**:
- **Client-Side**: Location dropdowns show only accessible locations
- **Server-Side**: Verify location access before any operation
- **Database**: RLS policies filter by user's accessible locations

**Error Code**: VAL-SREP-304
**Error Message**: "You do not have access to the selected location"
**User Action**: Select location you have access to or request access from administrator.

---

### VAL-SREP-305: Input Sanitization

**Validation Rule**: All text input must be sanitized to prevent security vulnerabilities.

**Security Checks**:
- Remove HTML tags and scripts (XSS prevention)
- Escape special SQL characters (SQL injection prevention)
- Validate UUIDs match format
- Limit input length to prevent buffer overflow
- Validate numeric inputs are actual numbers

**When Validated**: On all user input before processing

**Implementation Requirements**:
- **Client-Side**: Basic sanitization for UX
- **Server-Side**: Comprehensive sanitization using Zod and custom validators
- **Database**: Use parameterized queries exclusively

**Error Code**: VAL-SREP-305
**Error Message**: "Input contains invalid or potentially harmful content"
**User Action**: Remove problematic content and resubmit.

**Forbidden Content**:
- `<script>` tags
- `javascript:` URLs
- SQL keywords in text fields
- Extremely long strings

---

### VAL-SREP-306: Department Access Validation

**Validation Rule**: User can only configure par levels and create requests for departments they are assigned to.

**Access Rules**:
- User must be in department's user list
- OR user is department manager
- OR user has admin role

**When Validated**: On department-specific operations

**Implementation Requirements**:
- **Client-Side**: Filter department options by user access
- **Server-Side**: Verify department access
- **Database**: RLS policies check department membership

**Error Code**: VAL-SREP-306
**Error Message**: "You do not have access to the selected department"
**User Action**: Select accessible department or request access.

---

## 6. Zod Validation Schemas

### Schema: Par Level Configuration

```typescript
import { z } from 'zod';

export const ParLevelConfigSchema = z.object({
  id: z.string().uuid().optional(),
  location_id: z.string().uuid({
    required_error: "Location is required",
    invalid_type_error: "Invalid location ID"
  }),
  location_name: z.string().optional(),
  product_id: z.string().uuid({
    required_error: "Product is required",
    invalid_type_error: "Invalid product ID"
  }),
  product_name: z.string().optional(),
  product_code: z.string().optional(),
  par_level: z.number({
    required_error: "Par level is required",
    invalid_type_error: "Par level must be a number"
  }).positive('Par level must be greater than zero'),
  reorder_point: z.number({
    required_error: "Reorder point is required",
    invalid_type_error: "Reorder point must be a number"
  }).positive('Reorder point must be greater than zero'),
  minimum_level: z.number({
    required_error: "Minimum level is required",
    invalid_type_error: "Minimum level must be a number"
  }).positive('Minimum level must be greater than zero'),
  maximum_level: z.number().positive().optional(),
  lead_time_days: z.number()
    .int("Lead time must be a whole number of days")
    .min(1, "Lead time must be at least 1 day")
    .max(30, "Lead time cannot exceed 30 days")
    .default(2),
  safety_stock: z.number().nonnegative().optional(),
  seasonal_config: z.object({
    summer_multiplier: z.number().positive().optional(),
    winter_multiplier: z.number().positive().optional(),
    holiday_multiplier: z.number().positive().optional()
  }).optional(),
  special_notes: z.string()
    .max(500, "Special notes cannot exceed 500 characters")
    .optional()
    .or(z.literal('')),
  status: z.enum(['active', 'inactive', 'review']).default('active'),
  approval_status: z.enum(['approved', 'pending', 'rejected']).default('approved'),
  approved_by_id: z.string().uuid().optional().nullable(),
  approved_by_name: z.string().optional().nullable(),
  approved_at: z.date().optional().nullable(),
  last_reviewed_at: z.date().optional().nullable(),
  next_review_date: z.date().optional().nullable()
}).refine(
  (data) => data.reorder_point < data.par_level,
  {
    message: "Reorder point must be less than par level",
    path: ['reorder_point']
  }
).refine(
  (data) => data.minimum_level < data.reorder_point,
  {
    message: "Minimum level must be less than reorder point",
    path: ['minimum_level']
  }
).refine(
  (data) => {
    // Reorder point should be between 30% and 60% of par level
    const minReorder = data.par_level * 0.3;
    const maxReorder = data.par_level * 0.6;
    return data.reorder_point >= minReorder && data.reorder_point <= maxReorder;
  },
  {
    message: "Reorder point should be between 30% and 60% of par level",
    path: ['reorder_point']
  }
).refine(
  (data) => {
    // Minimum level should be approximately 30% of par level
    const expectedMinimum = data.par_level * 0.3;
    const tolerance = data.par_level * 0.05; // 5% tolerance
    return Math.abs(data.minimum_level - expectedMinimum) <= tolerance;
  },
  {
    message: "Minimum level should be approximately 30% of par level",
    path: ['minimum_level']
  }
);

export type ParLevelConfig = z.infer<typeof ParLevelConfigSchema>;
```

---

### Schema: Transfer Request Header

```typescript
export const TransferRequestHeaderSchema = z.object({
  id: z.string().uuid().optional(),
  request_number: z.string()
    .regex(/^REP-\d{4}-\d{4}$/, {
      message: "Request number must be in format REP-YYMM-NNNN"
    })
    .optional(), // Auto-generated
  from_location_id: z.string().uuid("Invalid source location ID"),
  from_location_name: z.string().optional(),
  to_location_id: z.string().uuid("Invalid destination location ID"),
  to_location_name: z.string().optional(),
  request_date: z.date({
    required_error: "Request date is required",
    invalid_type_error: "Request date must be a valid date"
  }),
  required_by_date: z.date({
    required_error: "Required by date is required",
    invalid_type_error: "Required by date must be a valid date"
  }),
  priority: z.enum(['standard', 'high', 'urgent']).default('standard'),
  doc_status: z.enum(['draft', 'pending_approval', 'approved', 'partially_approved', 'rejected', 'completed', 'cancelled']),
  reason: z.string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason cannot exceed 500 characters")
    .optional()
    .or(z.literal('')),
  approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  approved_by_id: z.string().uuid().optional().nullable(),
  approved_by_name: z.string().optional().nullable(),
  approved_at: z.date().optional().nullable(),
  total_value: z.number().nonnegative().optional(),
  requestor_id: z.string().uuid("Invalid requestor ID"),
  requestor_name: z.string().optional(),
  department_id: z.string().uuid("Invalid department ID").optional(),
  department_name: z.string().optional(),
  doc_version: z.number().int().nonnegative().default(0)
}).refine(
  (data) => data.required_by_date > data.request_date,
  {
    message: "Required by date must be after request date",
    path: ['required_by_date']
  }
).refine(
  (data) => {
    // Required by date should be within 30 days of request date
    const daysDiff = Math.floor(
      (data.required_by_date.getTime() - data.request_date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff <= 30;
  },
  {
    message: "Required by date cannot be more than 30 days from request date",
    path: ['required_by_date']
  }
);

export type TransferRequestHeader = z.infer<typeof TransferRequestHeaderSchema>;
```

---

### Schema: Transfer Request Detail

```typescript
export const TransferRequestDetailSchema = z.object({
  id: z.string().uuid().optional(),
  request_id: z.string().uuid("Invalid request ID"),
  line_number: z.number().int().positive("Line number must be positive"),
  product_id: z.string().uuid("Invalid product ID"),
  product_code: z.string().optional(),
  product_name: z.string().min(1, "Product name is required"),
  uom: z.string().min(1, "Unit of measure is required"),
  requested_quantity: z.number({
    required_error: "Requested quantity is required",
    invalid_type_error: "Requested quantity must be a number"
  }).positive('Requested quantity must be greater than zero'),
  approved_quantity: z.number().nonnegative().optional().nullable(),
  current_stock_level: z.number().nonnegative().optional(),
  par_level: z.number().positive().optional(),
  reason: z.string().max(200, "Reason cannot exceed 200 characters").optional(),
  line_status: z.enum(['pending', 'approved', 'partially_approved', 'rejected']).default('pending'),
  approval_notes: z.string().max(500).optional(),
  unit_price: z.number().nonnegative().optional(),
  line_total: z.number().nonnegative().optional()
}).refine(
  (data) => {
    // If approved_quantity provided, must not exceed requested_quantity
    if (data.approved_quantity !== null && data.approved_quantity !== undefined) {
      return data.approved_quantity <= data.requested_quantity;
    }
    return true;
  },
  {
    message: "Approved quantity cannot exceed requested quantity",
    path: ['approved_quantity']
  }
).refine(
  (data) => {
    // If par level configured, requested quantity should not exceed par × 2
    if (data.par_level && data.par_level > 0) {
      return data.requested_quantity <= (data.par_level * 2);
    }
    return true;
  },
  {
    message: "Requested quantity cannot exceed twice the par level",
    path: ['requested_quantity']
  }
);

export type TransferRequestDetail = z.infer<typeof TransferRequestDetailSchema>;
```

---

### Schema: Stock Transfer Header

```typescript
export const StockTransferHeaderSchema = z.object({
  id: z.string().uuid().optional(),
  transfer_number: z.string()
    .regex(/^TRF-\d{4}-\d{4}$/, {
      message: "Transfer number must be in format TRF-YYMM-NNNN"
    })
    .optional(), // Auto-generated
  request_id: z.string().uuid("Invalid request ID").optional(),
  from_location_id: z.string().uuid("Invalid source location ID"),
  from_location_name: z.string().optional(),
  to_location_id: z.string().uuid("Invalid destination location ID"),
  to_location_name: z.string().optional(),
  transfer_date: z.date({
    required_error: "Transfer date is required"
  }),
  scheduled_date: z.date().optional(),
  dispatch_date: z.date().optional().nullable(),
  received_date: z.date().optional().nullable(),
  doc_status: z.enum([
    'scheduled',
    'preparing',
    'ready_for_dispatch',
    'in_transit',
    'delayed',
    'receiving',
    'partially_received',
    'rejected',
    'completed',
    'cancelled'
  ]),
  priority: z.enum(['standard', 'high', 'urgent']).default('standard'),
  total_value: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
  prepared_by_id: z.string().uuid().optional().nullable(),
  prepared_by_name: z.string().optional().nullable(),
  received_by_id: z.string().uuid().optional().nullable(),
  received_by_name: z.string().optional().nullable(),
  doc_version: z.number().int().nonnegative().default(0)
}).refine(
  (data) => {
    // If dispatch_date provided, must be >= scheduled_date
    if (data.dispatch_date && data.scheduled_date) {
      return data.dispatch_date >= data.scheduled_date;
    }
    return true;
  },
  {
    message: "Dispatch date cannot be before scheduled date",
    path: ['dispatch_date']
  }
).refine(
  (data) => {
    // If received_date provided, must be >= dispatch_date
    if (data.received_date && data.dispatch_date) {
      return data.received_date >= data.dispatch_date;
    }
    return true;
  },
  {
    message: "Received date cannot be before dispatch date",
    path: ['received_date']
  }
);

export type StockTransferHeader = z.infer<typeof StockTransferHeaderSchema>;
```

---

### Schema: Stock Transfer Detail

```typescript
export const StockTransferDetailSchema = z.object({
  id: z.string().uuid().optional(),
  transfer_id: z.string().uuid("Invalid transfer ID"),
  line_number: z.number().int().positive(),
  product_id: z.string().uuid("Invalid product ID"),
  product_code: z.string().optional(),
  product_name: z.string().min(1, "Product name is required"),
  uom: z.string().min(1, "Unit of measure is required"),
  quantity: z.number({
    required_error: "Quantity is required"
  }).positive('Quantity must be greater than zero'),
  received_quantity: z.number().nonnegative().optional().nullable(),
  batch_lot_number: z.string()
    .regex(/^LOT-\d{4}-\d{2}-\d{2}$/, {
      message: "Batch/lot number must be in format LOT-YYYY-MM-DD"
    })
    .optional()
    .or(z.literal('')),
  expiry_date: z.date().optional().nullable(),
  line_status: z.enum(['pending', 'picked', 'dispatched', 'received', 'rejected']).default('pending'),
  rejection_reason: z.string().max(500).optional(),
  unit_price: z.number().nonnegative().optional(),
  line_total: z.number().nonnegative().optional()
}).refine(
  (data) => {
    // If received_quantity provided, must not exceed quantity
    if (data.received_quantity !== null && data.received_quantity !== undefined) {
      return data.received_quantity <= data.quantity;
    }
    return true;
  },
  {
    message: "Received quantity cannot exceed transferred quantity",
    path: ['received_quantity']
  }
).refine(
  (data) => {
    // If expiry_date provided, must be at least 7 days in future (for perishables)
    // This check should only apply if product is perishable (would need product data)
    if (data.expiry_date) {
      const today = new Date();
      const minExpiryDate = new Date();
      minExpiryDate.setDate(today.getDate() + 7);
      // This is a simplified check - actual implementation would check if item is perishable
      // For now, just ensure expiry is future date
      return data.expiry_date > today;
    }
    return true;
  },
  {
    message: "Expiry date must be at least 7 days in the future for perishable items",
    path: ['expiry_date']
  }
);

export type StockTransferDetail = z.infer<typeof StockTransferDetailSchema>;
```

---

### Schema: Consumption Pattern

```typescript
export const ConsumptionPatternSchema = z.object({
  id: z.string().uuid().optional(),
  location_id: z.string().uuid("Invalid location ID"),
  location_name: z.string().optional(),
  product_id: z.string().uuid("Invalid product ID"),
  product_code: z.string().optional(),
  product_name: z.string().optional(),
  analysis_period_start: z.date({
    required_error: "Analysis period start date is required"
  }),
  analysis_period_end: z.date({
    required_error: "Analysis period end date is required"
  }),
  period_days: z.number().int().positive().min(30, "Analysis period must be at least 30 days"),
  total_consumption: z.number().nonnegative({
    required_error: "Total consumption is required"
  }),
  average_daily_consumption: z.number().nonnegative({
    required_error: "Average daily consumption is required"
  }),
  peak_daily_consumption: z.number().nonnegative(),
  minimum_daily_consumption: z.number().nonnegative().optional(),
  consumption_trend: z.enum(['increasing', 'stable', 'decreasing']),
  trend_percentage: z.number().optional(),
  standard_deviation: z.number().nonnegative().optional(),
  last_calculated_at: z.date()
}).refine(
  (data) => data.analysis_period_end > data.analysis_period_start,
  {
    message: "Analysis period end must be after start",
    path: ['analysis_period_end']
  }
).refine(
  (data) => data.peak_daily_consumption >= data.average_daily_consumption,
  {
    message: "Peak daily consumption must be greater than or equal to average",
    path: ['peak_daily_consumption']
  }
);

export type ConsumptionPattern = z.infer<typeof ConsumptionPatternSchema>;
```

---

### Schema: Par Level Approval

```typescript
export const ParLevelApprovalSchema = z.object({
  config_id: z.string().uuid("Invalid configuration ID"),
  current_par_level: z.number().positive(),
  proposed_par_level: z.number().positive(),
  justification: z.string()
    .min(20, "Justification must be at least 20 characters")
    .max(500, "Justification cannot exceed 500 characters"),
  approval_decision: z.enum(['approved', 'rejected']),
  approval_comments: z.string().max(500).optional(),
  approved_by_id: z.string().uuid("Invalid approver ID")
}).refine(
  (data) => {
    // Calculate percentage change
    const changePercent = Math.abs(
      (data.proposed_par_level - data.current_par_level) / data.current_par_level * 100
    );
    // Only changes > 20% should require approval
    return changePercent > 20;
  },
  {
    message: "Only par level changes greater than 20% require approval",
    path: ['proposed_par_level']
  }
);

export type ParLevelApproval = z.infer<typeof ParLevelApprovalSchema>;
```

---

### Schema: Request Approval

```typescript
export const RequestApprovalSchema = z.object({
  request_id: z.string().uuid("Invalid request ID"),
  approval_decision: z.enum(['approved', 'partially_approved', 'rejected']),
  line_items: z.array(z.object({
    line_id: z.string().uuid(),
    requested_quantity: z.number().positive(),
    approved_quantity: z.number().nonnegative(),
    item_decision: z.enum(['approved', 'partially_approved', 'rejected']),
    rejection_reason: z.string().max(200).optional(),
    notes: z.string().max(500).optional()
  })).min(1, 'At least one line item is required'),
  overall_comments: z.string().max(500).optional(),
  approved_by_id: z.string().uuid("Invalid approver ID"),
  scheduled_transfer_date: z.date().optional()
}).refine(
  (data) => {
    // All line items must have approved_quantity <= requested_quantity
    return data.line_items.every(item =>
      item.approved_quantity <= item.requested_quantity
    );
  },
  {
    message: "Approved quantity cannot exceed requested quantity for any item",
    path: ['line_items']
  }
).refine(
  (data) => {
    // If overall decision is partially_approved, at least one item must be partial/rejected
    if (data.approval_decision === 'partially_approved') {
      return data.line_items.some(item =>
        item.item_decision === 'partially_approved' || item.item_decision === 'rejected'
      );
    }
    return true;
  },
  {
    message: "Partial approval must have at least one item with reduced or rejected quantity",
    path: ['approval_decision']
  }
).refine(
  (data) => {
    // For partial approvals, minimum 50% of each item quantity should be approved
    if (data.approval_decision === 'partially_approved' || data.approval_decision === 'approved') {
      return data.line_items.every(item => {
        if (item.item_decision === 'rejected') return true;
        const fulfillmentRate = (item.approved_quantity / item.requested_quantity) * 100;
        return fulfillmentRate >= 50 || item.item_decision === 'rejected';
      });
    }
    return true;
  },
  {
    message: "Partial approvals should be at least 50% of requested quantity per item (unless rejected)",
    path: ['line_items']
  }
);

export type RequestApproval = z.infer<typeof RequestApprovalSchema>;
```

---

## 7. Validation Error Messages

### Error Message Guidelines

**Principles**:
1. **Be Specific**: Tell user exactly what's wrong
2. **Be Actionable**: Explain how to fix the problem
3. **Be Kind**: Use friendly, helpful tone
4. **Be Consistent**: Use same format throughout
5. **Avoid Technical Jargon**: Use plain language

### Error Message Format

**Structure**:
```
[Field Name] {problem statement}. {Expected format or action}.
```

### Examples by Category

**Field Validations**:
- ✅ "Par level is required and must be greater than zero"
- ✅ "Requested quantity must be positive and cannot exceed twice the par level (100)"
- ✅ "Lead time must be between 1 and 30 days"
- ✅ "Required by date must be after request date and within 30 days"

**Business Rule Violations**:
- ✅ "Par level change of 35% requires Department Manager approval"
- ✅ "Insufficient warehouse stock for Olive Oil. Available: 12L, Requested: 20L"
- ✅ "Emergency request limit reached (2/2 this week). Use standard replenishment or contact Department Manager"
- ✅ "Partial quantity (8 units) is only 40% of requested. Minimum 50% required for standard partial approval"

**Cross-Field Errors**:
- ✅ "Invalid level hierarchy. Must be: Par (100) > Reorder (40) > Minimum (30)"
- ✅ "Received quantity (22) cannot exceed approved quantity (20) for Olive Oil"
- ✅ "Reorder point (40) must be between minimum level (30) and par level (100)"

**Security Errors**:
- ✅ "You do not have permission to configure par levels"
- ✅ "You do not have access to the selected location"
- ✅ "You do not have sufficient authority to approve requests of this value ($75,000)"

### Error Severity Levels

| Level | When to Use | Display |
|-------|-------------|---------|
| Error | Blocks submission/progress | Red icon, red border, red text |
| Warning | Should be corrected but not blocking | Yellow icon, yellow border |
| Info | Helpful guidance | Blue icon, normal border |

---

## 8. Validation Matrix

| Error Code | Rule Name | Fields Involved | Type | Client | Server | Database |
|------------|-----------|-----------------|------|--------|--------|----------|
| VAL-SREP-001 | Par Level Required | par_level | Field | ✅ | ✅ | ✅ |
| VAL-SREP-002 | Par Level Max | par_level | Field | ✅ | ✅ | ❌ |
| VAL-SREP-003 | Reorder Point Range | reorder_point | Field | ✅ | ✅ | ✅ |
| VAL-SREP-004 | Minimum Level Calc | minimum_level | Field | ✅ | ✅ | ✅ |
| VAL-SREP-005 | Lead Time Range | lead_time_days | Field | ✅ | ✅ | ✅ |
| VAL-SREP-006 | Requested Qty Range | requested_quantity | Field | ✅ | ✅ | ✅ |
| VAL-SREP-007 | Required Date Future | required_by_date | Field | ✅ | ✅ | ✅ |
| VAL-SREP-008 | Product Valid | product_id | Field | ✅ | ✅ | ✅ |
| VAL-SREP-009 | Location Valid | location_id | Field | ✅ | ✅ | ✅ |
| VAL-SREP-010 | Batch Format | batch_lot_number | Field | ✅ | ✅ | ❌ |
| VAL-SREP-011 | Expiry Future | expiry_date | Field | ✅ | ✅ | ❌ |
| VAL-SREP-012 | Notes Length | special_notes | Field | ✅ | ✅ | ✅ |
| VAL-SREP-101 | Par Change Approval | par_level | Business | ❌ | ✅ | ❌ |
| VAL-SREP-102 | Stock Available | quantities | Business | ⚠️ | ✅ | ❌ |
| VAL-SREP-103 | Emergency Limit | request count | Business | ⚠️ | ✅ | ❌ |
| VAL-SREP-104 | Level Hierarchy | reorder, minimum | Business | ✅ | ✅ | ✅ |
| VAL-SREP-105 | Replenishment Qty | calculated qty | Business | ⚠️ | ✅ | ❌ |
| VAL-SREP-106 | Partial Minimum | approval qty | Business | ❌ | ✅ | ❌ |
| VAL-SREP-107 | Transfer Timeline | dates | Business | ⚠️ | ✅ | ❌ |
| VAL-SREP-108 | Data Requirement | consumption data | Business | ⚠️ | ✅ | ❌ |
| VAL-SREP-201 | Par Hierarchy | 3 levels | Cross-field | ✅ | ✅ | ✅ |
| VAL-SREP-202 | Date Range | dates | Cross-field | ✅ | ✅ | ✅ |
| VAL-SREP-203 | Received vs Ordered | quantities | Cross-field | ✅ | ✅ | ❌ |
| VAL-SREP-204 | Total Calculation | amounts | Cross-field | ✅ | ✅ | ❌ |
| VAL-SREP-301 | Configure Permission | - | Security | ✅ | ✅ | ✅ |
| VAL-SREP-302 | Request Permission | - | Security | ✅ | ✅ | ✅ |
| VAL-SREP-303 | Approve Permission | - | Security | ✅ | ✅ | ✅ |
| VAL-SREP-304 | Location Access | location_id | Security | ✅ | ✅ | ✅ |
| VAL-SREP-305 | Input Sanitization | all text | Security | ✅ | ✅ | ✅ |
| VAL-SREP-306 | Department Access | department_id | Security | ✅ | ✅ | ✅ |

**Legend**:
- ✅ Enforced at this layer
- ❌ Not enforced at this layer
- ⚠️ Partial enforcement (display/warning only)

---

## 9. Related Documents

- **Business Requirements**: [BR-stock-replenishment.md](./BR-stock-replenishment.md)
- **Use Cases**: [UC-stock-replenishment.md](./UC-stock-replenishment.md)
- **Technical Specification**: [TS-stock-replenishment.md](./TS-stock-replenishment.md)
- **Data Schema**: [DD-stock-replenishment.md](./DD-stock-replenishment.md)
- **Flow Diagrams**: [FD-stock-replenishment.md](./FD-stock-replenishment.md)
- **Store Requisitions Validations**: [VAL-store-requisitions.md](../store-requisitions/VAL-store-requisitions.md)

---

**Document Control**:
- **Created**: 2025-11-12
- **Author**: Documentation Team
- **Reviewed By**: Business Analyst, QA Lead, Security Team
- **Approved By**: Technical Lead, Operations Manager
- **Next Review**: 2026-01-09
- **Version History**:
  - v1.2.0 (2025-12-09): Updated to reflect implemented frontend validation
  - v1.1.0 (2025-12-05): Added implementation status
  - v1.0.0 (2025-11-12): Initial comprehensive validation rules document

---

## Appendix: Error Code Registry

| Code Range | Category | Description |
|------------|----------|-------------|
| VAL-SREP-001 to 099 | Field Validations | Individual field rules |
| VAL-SREP-101 to 199 | Business Rules | Business logic validations |
| VAL-SREP-201 to 299 | Cross-Field | Multi-field relationships |
| VAL-SREP-301 to 399 | Security | Permission and access control |

---

**End of Document**
