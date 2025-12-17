# VAL-WAST: Wastage Reporting Validation Rules

**Module**: Store Operations
**Sub-Module**: Wastage Reporting
**Document Type**: Validations (VAL)
**Version**: 1.2.0
**Last Updated**: 2025-12-09
**Status**: Active
**Implementation Status**: PARTIALLY IMPLEMENTED (Frontend validation exists, backend pending)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2.0 | 2025-12-09 | Documentation Team | Updated to reflect implemented frontend validation |
| 1.1.0 | 2025-12-05 | Documentation Team | Added implementation status warning |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---

## ✅ IMPLEMENTATION NOTE

The Wastage Reporting module frontend has been implemented with client-side validation in forms. Backend validation and database constraints are pending.

**Implemented Validation Contexts**:
- ✅ **New Report Form** - Location required, item selection required, quantity > 0, reason selection required
- ✅ **Category Form** - Name required, code max 4 chars, color selection, approval threshold numeric
- ✅ **Report Status** - Valid transitions: pending → under_review → approved/rejected
- ✅ **High Value Alert** - Reports > $100 display manager approval warning

**Validation Status**:
- ✅ Client-side validation in forms - IMPLEMENTED
- ⏳ Server-side business rules - PENDING (using mock data)
- ⏳ Database constraints - PENDING (schema not deployed)

See [BR-wastage-reporting.md](./BR-wastage-reporting.md) for complete implementation details.

---

## 1. Overview

### 1.1 Purpose

This document defines comprehensive validation rules for the Wastage Reporting module to ensure data integrity, business rule enforcement, and security compliance. Wastage reporting involves recording food and beverage wastage, multi-level approval workflows, photo evidence requirements, inventory synchronization, and financial posting. Invalid data can result in incorrect inventory levels, financial misstatements, and audit compliance issues.

**Critical Validation Areas**:
- **Product and Quantity Validation**: Ensuring wasted products exist in inventory and quantities don't exceed stock on hand
- **Financial Calculations**: Accurate total value calculations and approval threshold determinations
- **Photo Requirements**: Mandatory photo evidence for high-value wastage (>$100)
- **Approval Workflows**: Routing to appropriate approvers based on value thresholds and authority limits
- **Status Transitions**: Enforcing valid state changes throughout wastage lifecycle
- **Security Controls**: Permission checks, ownership validation, and Row-Level Security enforcement

**Consequences of Invalid Data**:
- Incorrect inventory stock levels leading to stockouts or over-ordering
- Financial statements showing inaccurate wastage expense amounts
- Audit compliance failures due to missing or insufficient documentation
- Approval workflow failures causing operational delays
- Security breaches allowing unauthorized data access or modification

### 1.2 Scope

This document defines validation rules across three layers:
- **Client-Side**: Immediate user feedback and UX validation (React Hook Form + Zod)
- **Server-Side**: Security and business rule enforcement (Zod + custom validation)
- **Database**: Final data integrity constraints (PostgreSQL CHECK constraints, RLS)

### 1.3 Validation Strategy

```
User Input (React Form)
    ↓
[Client-Side Validation] ← React Hook Form + Zod Schema
    ↓ (real-time feedback)
[Server-Side Validation] ← Server Actions + Zod Schema + Business Logic
    ↓ (security enforcement)
[Database Constraints] ← PostgreSQL CHECK, FK, UNIQUE, RLS
    ↓ (final enforcement)
Data Stored
```

**Validation Principles**:
1. **Never Trust Client**: Always validate on server even if client validation passes
2. **Immediate Feedback**: Provide real-time client-side validation for better UX
3. **Clear Messages**: Use actionable error messages guiding users to fix issues
4. **Security First**: Prevent SQL injection, XSS, unauthorized access at all layers
5. **Consistency**: Same validation rules enforced across all layers
6. **Shared Schemas**: Use Zod schemas on both client and server for consistency

**Validation Layers**:
- **Layer 1 (Client)**: 40% - UX enhancement, immediate feedback
- **Layer 2 (Server)**: 100% - Security, business rules, database checks
- **Layer 3 (Database)**: 80% - Final enforcement of constraints and RLS

---

## 2. Field-Level Validations (VAL-WAST-001 to 099)

### VAL-WAST-001: Wastage Date - Required Field

**Field**: `wastage_date`
**Database Column**: `wastage_headers.wastage_date`
**Data Type**: DATE / Date

**Validation Rule**: Wastage date is mandatory and must be a valid date.

**Rationale**: Required for tracking when wastage occurred, trend analysis, and period-based reporting.

**Implementation Requirements**:
- **Client-Side**: Date picker with red asterisk (*). Show error on blur if empty.
- **Server-Side**: Reject if field is missing or null using Zod `.date()` validator.
- **Database**: Column defined as NOT NULL with CHECK constraint.

**Error Code**: VAL-WAST-001
**Error Message**: "Wastage date is required"
**User Action**: User must select a date when wastage occurred.

**Test Cases**:
- ✅ Valid: 2025-01-12 (valid date)
- ✅ Valid: Today's date
- ❌ Invalid: null or undefined
- ❌ Invalid: Empty string ""
- ❌ Invalid: Invalid date format "2025-13-45"

---

### VAL-WAST-002: Wastage Date - Cannot Be Future Date

**Field**: `wastage_date`

**Validation Rule**: Wastage date cannot be in the future (must be <= current date).

**Rationale**: Cannot record wastage that hasn't occurred yet. Prevents data entry errors and fraud.

**Implementation Requirements**:
- **Client-Side**: Set date picker max date to today. Show warning if future date selected.
- **Server-Side**: Compare wastage_date with current server date. Reject if greater.
- **Database**: CHECK constraint `wastage_date <= CURRENT_DATE`.

**Error Code**: VAL-WAST-002
**Error Message**: "Wastage date cannot be in the future"
**User Action**: User must select today's date or an earlier date.

**Test Cases**:
- ✅ Valid: Today's date (2025-01-12)
- ✅ Valid: Yesterday (2025-01-11)
- ✅ Valid: 7 days ago (2025-01-05)
- ❌ Invalid: Tomorrow (2025-01-13)
- ❌ Invalid: Next week (2025-01-19)

---

### VAL-WAST-003: Wastage Date - Maximum Backdating Limit

**Field**: `wastage_date`

**Validation Rule**: Wastage date cannot be more than 7 days in the past without special approval.

**Rationale**: Encourages timely wastage reporting. Old wastage reports may have inaccurate details or missing photos.

**Implementation Requirements**:
- **Client-Side**: Show warning (not error) if date is > 7 days old. Allow submission.
- **Server-Side**: Flag wastage as `requires_special_review` if date > 7 days old.
- **Database**: Not enforced (business logic only, not hard constraint).

**Error Code**: VAL-WAST-003 (Warning, not error)
**Error Message**: "Wastage date is more than 7 days old. This may require additional review."
**User Action**: User can proceed but approval may take longer.

**Test Cases**:
- ✅ Valid: 5 days ago (warning shown but allowed)
- ✅ Valid: 10 days ago (warning shown, flagged for review)
- ⚠️ Warning: 8 days ago (shown warning but not blocked)

---

### VAL-WAST-004: Product Selection - Required Field

**Field**: `product_id` (in wastage_line_items)
**Database Column**: `wastage_line_items.product_id`
**Data Type**: UUID / string

**Validation Rule**: Product must be selected for each line item.

**Implementation Requirements**:
- **Client-Side**: Product search/select dropdown required. Show error if not selected.
- **Server-Side**: Verify product_id is provided and references existing product.
- **Database**: Foreign key constraint to products table with RESTRICT on delete.

**Error Code**: VAL-WAST-004
**Error Message**: "Product selection is required"
**User Action**: User must search and select a product from inventory.

**Test Cases**:
- ✅ Valid: Valid product UUID "550e8400-e29b-41d4-a716-446655440001"
- ❌ Invalid: null or undefined
- ❌ Invalid: Empty string ""
- ❌ Invalid: Non-existent product UUID

---

### VAL-WAST-005: Product Existence Check

**Field**: `product_id`

**Validation Rule**: Selected product must exist in inventory system and be active.

**Rationale**: Cannot record wastage for products that don't exist or have been discontinued.

**Implementation Requirements**:
- **Client-Side**: Product dropdown only shows active products.
- **Server-Side**: Query products table to verify product exists and is_active = true.
- **Database**: Foreign key constraint ensures referential integrity.

**Error Code**: VAL-WAST-005
**Error Message**: "Selected product does not exist or is no longer active"
**User Action**: User must select a different, active product.

**Related Business Requirements**: BR-WAST-004

**Test Cases**:
- ✅ Valid: Active product in inventory
- ❌ Invalid: Inactive/discontinued product
- ❌ Invalid: Deleted product
- ❌ Invalid: Product from different location's inventory

---

### VAL-WAST-006: Quantity - Required and Positive

**Field**: `quantity` (in wastage_line_items)
**Database Column**: `wastage_line_items.quantity`
**Data Type**: DECIMAL(12,3) / number

**Validation Rule**: Quantity is required and must be greater than zero.

**Rationale**: Cannot record zero or negative wastage. All wastage must have a positive quantity.

**Implementation Requirements**:
- **Client-Side**: Numeric input with min="0.001". Show error if <= 0 or empty.
- **Server-Side**: Validate quantity > 0 using Zod `.positive()` validator.
- **Database**: CHECK constraint `quantity > 0`.

**Error Code**: VAL-WAST-006
**Error Message**: "Quantity must be greater than zero"
**User Action**: User must enter a positive quantity value.

**Test Cases**:
- ✅ Valid: 1.0
- ✅ Valid: 2.5 kg
- ✅ Valid: 0.001 (minimum)
- ❌ Invalid: 0
- ❌ Invalid: -5.0 (negative)
- ❌ Invalid: null or undefined

---

### VAL-WAST-007: Quantity - Stock Availability Check

**Field**: `quantity`

**Validation Rule**: Wastage quantity cannot exceed current stock on hand for the product at the location.

**Rationale**: Cannot waste more than available inventory. Prevents data errors and inventory discrepancies.

**Implementation Requirements**:
- **Client-Side**: Display current stock next to quantity field. Show warning if quantity > stock.
- **Server-Side**: Query inventory_stock table for current quantity. Reject if wastage qty > stock.
- **Database**: Not enforced (requires real-time stock check).

**Error Code**: VAL-WAST-007
**Error Message**: "Wastage quantity ({qty}) exceeds available stock ({stock})"
**User Action**: User must reduce quantity to available stock or contact inventory team.

**Related Business Requirements**: BR-WAST-005

**Special Cases**:
- If concurrent wastage transactions reduce stock, last transaction may fail validation
- System should lock stock record during validation to prevent race conditions
- If stock check fails, suggest refreshing page to get latest stock levels

**Test Cases**:
- ✅ Valid: Quantity 5 kg, Stock 25 kg (sufficient)
- ✅ Valid: Quantity 25 kg, Stock 25 kg (exact match)
- ❌ Invalid: Quantity 30 kg, Stock 25 kg (exceeds)
- ❌ Invalid: Quantity 10 kg, Stock 0 kg (no stock available)

---

### VAL-WAST-008: Reason - Required and Minimum Length

**Field**: `reason`
**Database Column**: `wastage_headers.reason`
**Data Type**: TEXT / string

**Validation Rule**: Reason is required and must be at least 20 characters long.

**Rationale**: Ensures meaningful explanation of wastage for review, analysis, and corrective action.

**Implementation Requirements**:
- **Client-Side**: Textarea with character counter. Show error if < 20 chars. Red asterisk for required.
- **Server-Side**: Validate length >= 20 after trimming whitespace using Zod `.min(20)`.
- **Database**: CHECK constraint `LENGTH(TRIM(reason)) >= 20`.

**Error Code**: VAL-WAST-008
**Error Message**: "Reason must be at least 20 characters. Current: {count}/20"
**User Action**: User must provide more detailed explanation of wastage.

**Related Business Requirements**: BR-WAST-006

**Test Cases**:
- ✅ Valid: "Salmon overcooked during grill service, 3 portions affected due to temperature control issue." (85 chars)
- ❌ Invalid: "Overcooked" (10 chars)
- ❌ Invalid: "     " (only whitespace)
- ❌ Invalid: "Overcooked salmon." (18 chars, below minimum)

---

### VAL-WAST-009: Reason - Maximum Length

**Field**: `reason`

**Validation Rule**: Reason cannot exceed 500 characters.

**Rationale**: Database column limit and UI display constraints. Encourages concise explanations.

**Implementation Requirements**:
- **Client-Side**: Textarea with maxLength={500}. Show character count "450/500".
- **Server-Side**: Reject if length > 500 using Zod `.max(500)`.
- **Database**: Column defined as TEXT with CHECK constraint.

**Error Code**: VAL-WAST-009
**Error Message**: "Reason cannot exceed 500 characters. Current: {count}/500"
**User Action**: User must shorten the text or summarize.

**Test Cases**:
- ✅ Valid: 500 characters exactly
- ✅ Valid: 250 characters
- ❌ Invalid: 501 characters

---

### VAL-WAST-010: Wastage Category - Required and Valid Value

**Field**: `wastage_category`
**Database Column**: `wastage_headers.wastage_category`
**Data Type**: VARCHAR(50) / enum string

**Validation Rule**: Wastage category is required and must be one of the allowed values.

**Allowed Values**:
- `spoilage`: Product has spoiled or gone bad
- `overproduction`: Excess production beyond demand
- `preparation_error`: Cooking or preparation mistake
- `damaged`: Product damaged during handling or storage
- `expired`: Product past expiration date
- `customer_return`: Customer sent food back
- `portion_control`: Incorrect portion sizes
- `quality_issue`: Quality does not meet standards
- `contamination`: Cross-contamination or foreign object
- `equipment_failure`: Equipment malfunction caused wastage
- `training_testing`: Used for staff training or recipe testing
- `sampling`: Product sampling for quality control
- `other`: Other reasons not covered above

**Implementation Requirements**:
- **Client-Side**: Dropdown select with predefined categories. Required field with red asterisk.
- **Server-Side**: Validate against enum using Zod `.enum()` validator.
- **Database**: CHECK constraint with allowed values list.

**Error Code**: VAL-WAST-010
**Error Message**: "Please select a wastage category"
**User Action**: User must select one of the predefined categories.

**Test Cases**:
- ✅ Valid: "preparation_error"
- ✅ Valid: "spoilage"
- ❌ Invalid: null or undefined
- ❌ Invalid: "invalid_category" (not in allowed list)

---

### VAL-WAST-011: Supplier Quality Issue - Vendor Required

**Fields**: `is_supplier_quality_issue`, `supplier_id`
**Database Columns**: `wastage_headers.is_supplier_quality_issue`, `wastage_headers.supplier_id`

**Validation Rule**: If wastage is flagged as supplier quality issue, vendor selection is mandatory.

**Rationale**: Need to track which vendor supplied defective products for quality management and potential refunds.

**Implementation Requirements**:
- **Client-Side**: Show vendor dropdown only if is_supplier_quality_issue = true. Mark as required.
- **Server-Side**: If is_supplier_quality_issue = true, verify supplier_id is provided and valid.
- **Database**: CHECK constraint `(is_supplier_quality_issue = false OR supplier_id IS NOT NULL)`.

**Error Code**: VAL-WAST-011
**Error Message**: "Vendor selection is required for supplier quality issues"
**User Action**: User must select the vendor who supplied the defective product.

**Related Business Requirements**: BR-WAST-012

**Test Cases**:
- ✅ Valid: is_supplier_quality_issue = false, supplier_id = null
- ✅ Valid: is_supplier_quality_issue = true, supplier_id = "550e8400-..."
- ❌ Invalid: is_supplier_quality_issue = true, supplier_id = null
- ❌ Invalid: is_supplier_quality_issue = true, supplier_id = invalid UUID

---

### VAL-WAST-012: Photo Requirements - High Value Wastage

**Fields**: `total_value`, `photos` (count)
**Database Columns**: `wastage_headers.total_value`, count of `wastage_photos`

**Validation Rule**: Wastage with total value > $100 must have at least 1 photo attached.

**Rationale**: Visual evidence required for high-value wastage to prevent fraud and support approvals.

**Implementation Requirements**:
- **Client-Side**: Show warning if value > $100 and no photos. Block submission if mandatory threshold exceeded.
- **Server-Side**: Check photo count if total_value > configured threshold (default $100). Reject if no photos.
- **Database**: Not enforced (business logic check, not database constraint).

**Error Code**: VAL-WAST-012
**Error Message**: "Photo evidence is required for wastage over $100. Please upload at least one photo."
**User Action**: User must upload photo(s) showing wasted product before submitting.

**Related Business Requirements**: BR-WAST-010

**Configuration**: Threshold configurable in wastage_configuration.photo_requirements.mandatory_threshold

**Test Cases**:
- ✅ Valid: Value $150, 2 photos attached
- ✅ Valid: Value $50, 0 photos (below threshold)
- ✅ Valid: Value $100.01, 1 photo (just above threshold)
- ❌ Invalid: Value $150, 0 photos (exceeds threshold, no photos)
- ❌ Invalid: Value $500, 0 photos (high value, no photos)

---

### VAL-WAST-013: Photo Requirements - Maximum Photo Count

**Field**: Number of photos per wastage

**Validation Rule**: Maximum 5 photos per wastage transaction.

**Rationale**: Storage limits, reasonable documentation, and UI/UX considerations.

**Implementation Requirements**:
- **Client-Side**: Disable "Add Photo" button when count = 5. Show message "Maximum 5 photos".
- **Server-Side**: Reject photo upload if count >= 5. Return error.
- **Database**: Not enforced (application logic).

**Error Code**: VAL-WAST-013
**Error Message**: "Maximum 5 photos allowed per wastage transaction"
**User Action**: User must delete an existing photo before adding another.

**Test Cases**:
- ✅ Valid: 0 photos
- ✅ Valid: 5 photos
- ❌ Invalid: Attempting to upload 6th photo

---

### VAL-WAST-014: Photo File - Size and Format

**Field**: Photo file upload

**Validation Rule**:
- Maximum file size: 10MB per photo
- Allowed formats: JPEG, PNG, HEIC, WebP
- Minimum dimensions: 400×300 pixels

**Rationale**: Storage capacity, upload performance, and image quality requirements.

**Implementation Requirements**:
- **Client-Side**: Check file size and type before upload. Show error if invalid.
- **Server-Side**: Validate file size, MIME type, and dimensions. Reject if invalid.
- **Database**: file_size column with CHECK constraint <= 10485760 bytes.

**Error Code**: VAL-WAST-014
**Error Message**:
- Size: "Photo file size ({size}MB) exceeds maximum 10MB"
- Format: "Invalid file format. Allowed: JPEG, PNG, HEIC, WebP"
- Dimensions: "Photo dimensions too small. Minimum 400×300 pixels required."

**User Action**: User must resize/compress photo or choose different file.

**Test Cases**:
- ✅ Valid: 2MB JPEG file, 4032×3024 pixels
- ✅ Valid: 5MB PNG file, 1920×1080 pixels
- ❌ Invalid: 12MB file (exceeds limit)
- ❌ Invalid: PDF file (wrong format)
- ❌ Invalid: 200×150 pixels (too small)

---

### VAL-WAST-015: Total Value - Non-Negative

**Field**: `total_value`
**Database Column**: `wastage_headers.total_value`
**Data Type**: DECIMAL(15,2) / number

**Validation Rule**: Total value must be >= 0 (zero or positive).

**Rationale**: Negative wastage value doesn't make business sense. All wastage represents a cost.

**Implementation Requirements**:
- **Client-Side**: Calculated field (not user input). Display validation on calculation.
- **Server-Side**: Validate total_value >= 0 using Zod `.min(0)`.
- **Database**: CHECK constraint `total_value >= 0`.

**Error Code**: VAL-WAST-015
**Error Message**: "Total value cannot be negative"
**User Action**: System error - contact support if this occurs (should not happen with proper calculation).

**Test Cases**:
- ✅ Valid: $0.00 (zero value)
- ✅ Valid: $31.25
- ✅ Valid: $10,000.00
- ❌ Invalid: -$50.00 (negative)

---

### VAL-WAST-016: Currency Code - Valid ISO Code

**Field**: `currency`
**Database Column**: `wastage_headers.currency`
**Data Type**: VARCHAR(3) / string

**Validation Rule**: Currency must be a valid ISO 4217 3-letter code.

**Implementation Requirements**:
- **Client-Side**: Dropdown with supported currencies. Default to location's currency.
- **Server-Side**: Validate against list of supported currency codes.
- **Database**: CHECK constraint with supported currencies list.

**Supported Currencies**: USD, EUR, GBP, CAD, AUD, SGD, JPY, CNY

**Error Code**: VAL-WAST-016
**Error Message**: "Invalid currency code. Must be one of: USD, EUR, GBP, CAD, AUD, SGD, JPY, CNY"
**User Action**: User must select valid currency from dropdown.

**Test Cases**:
- ✅ Valid: "USD"
- ✅ Valid: "EUR"
- ❌ Invalid: "US" (2 letters)
- ❌ Invalid: "DOLLARS" (not ISO code)
- ❌ Invalid: "XXX" (not supported)

---

## 3. Business Rule Validations (VAL-WAST-101 to 199)

### VAL-WAST-101: Approval Threshold Determination

**Rule Description**: Wastage transactions must be routed to appropriate approval level(s) based on total value thresholds.

**Business Justification**: Ensures appropriate oversight based on financial impact. Higher value wastage requires more senior approval.

**Validation Logic**:
1. Calculate total_value from line items (sum of quantity × unit_cost)
2. Retrieve approval thresholds from wastage_configuration for location
3. Determine approval_level_required based on value tiers:
   - $0 - $49.99: Level 0 (check auto-approve rules)
   - $50 - $199.99: Level 1 (Department Manager)
   - $200 - $499.99: Level 2 (Store Manager)
   - $500+: Level 3 (Finance Manager)
4. Set approval_level_required field on wastage_headers

**When Validated**: On submission, when line item values change

**Implementation Requirements**:
- **Client-Side**: Display required approval chain before submission
- **Server-Side**: Query wastage_configuration, apply threshold logic, set approval_level_required
- **Database**: approval_level_required stored as INTEGER (0-3) with CHECK constraint

**Error Code**: VAL-WAST-101
**Error Message**: "No approval configuration found for this location. Contact administrator."
**User Action**: Administrator must configure approval thresholds for location.

**Related Business Requirements**: BR-WAST-007

**Examples**:

**Scenario 1: Low Value - Auto-Approve Candidate**
- Total Value: $45.00
- Threshold Check: < $50
- Result: approval_level_required = 0 (check auto-approve rules)
- If auto-approve rule matches: doc_status = 'approved', is_auto_approved = true
- If no rule matches: approval_level_required = 1

**Scenario 2: Medium Value - Single Level**
- Total Value: $125.00
- Threshold Check: $50 - $199.99
- Result: approval_level_required = 1 (Department Manager)
- Approver: Department Manager for Kitchen department

**Scenario 3: High Value - Multi-Level**
- Total Value: $550.00
- Threshold Check: > $500
- Result: approval_level_required = 3 (Finance Manager)
- Approval Chain: Level 1 (Dept Manager) → Level 2 (Store Manager) → Level 3 (Finance Manager)
- All three must approve sequentially

---

### VAL-WAST-102: Auto-Approve Rules Check

**Rule Description**: Certain wastage transactions can be auto-approved based on configurable rules (e.g., expired items within 24 hours of expiry, value < $50).

**Business Justification**: Streamlines approval process for routine, low-risk wastage. Reduces administrative burden.

**Validation Logic**:
1. Check if approval_level_required = 0
2. Retrieve auto-approve rules from wastage_configuration.approval_thresholds.auto_approve_rules
3. For each rule, check if wastage matches conditions:
   - Category match (e.g., category = 'expired')
   - Condition match (e.g., days_past_expiry <= 1)
   - Value limit (e.g., total_value <= 50.00)
4. If any rule matches completely, set is_auto_approved = true, doc_status = 'approved'
5. If no rules match, set approval_level_required = 1 (default to Level 1)

**When Validated**: On submission, after total value calculation

**Implementation Requirements**:
- **Client-Side**: Display "Auto-approve eligible" message if rules match
- **Server-Side**: Evaluate rules engine logic, set status accordingly
- **Database**: is_auto_approved BOOLEAN field stores result

**Error Code**: VAL-WAST-102 (Info, not error)
**Info Message**: "This wastage qualifies for auto-approval and will be processed immediately."
**User Action**: None - system automatically approves.

**Related Business Requirements**: BR-WAST-007

**Auto-Approve Rule Example**:
```json
{
  "category": "expired",
  "condition": "days_past_expiry <= 1",
  "max_value": 50.00,
  "description": "Auto-approve expired items within 24 hours of expiry date"
}
```

**Evaluation**:
- Wastage: category = "expired", expiry_date = 2025-01-11, wastage_date = 2025-01-12, total_value = $45
- days_past_expiry = 1 (within 24 hours)
- value = $45 (< $50 limit)
- Result: ✅ Auto-approved

---

### VAL-WAST-103: Approver Authority Validation

**Rule Description**: Approver must have sufficient approval authority limit to approve the wastage value.

**Business Justification**: Prevents approvers from exceeding their delegated authority. Ensures proper financial controls.

**Validation Logic**:
1. When approver attempts to approve wastage
2. Retrieve approver's approval_authority_limit from user profile
3. Compare: approver.approval_authority_limit >= wastage.total_value
4. If insufficient authority, reject approval and suggest escalation

**When Validated**: On approval action

**Implementation Requirements**:
- **Client-Side**: Show approver's authority limit in approval UI
- **Server-Side**: Query user.approval_authority_limit, compare with wastage.total_value, reject if insufficient
- **Database**: User profile stores approval_authority_limit, wastage_approvals stores for audit

**Error Code**: VAL-WAST-103
**Error Message**: "Your approval authority limit (${limit}) is below the wastage value (${value}). This requires approval from a manager with higher authority."
**User Action**: Approver must escalate to higher authority or reject the wastage.

**Related Business Requirements**: BR-WAST-009

**Examples**:

**Scenario 1: Sufficient Authority**
- Approver: Department Manager (authority limit: $200)
- Wastage Value: $125
- Result: ✅ Can approve (authority sufficient)

**Scenario 2: Insufficient Authority**
- Approver: Department Manager (authority limit: $200)
- Wastage Value: $350
- Result: ❌ Cannot approve (exceeds authority)
- Action: System suggests escalating to Store Manager ($500 limit)

---

### VAL-WAST-104: Self-Approval Prevention

**Rule Description**: User cannot approve their own wastage submissions.

**Business Justification**: Prevents conflict of interest and potential fraud. Ensures independent review.

**Validation Logic**:
1. When user attempts to approve wastage
2. Compare approver's user_id with wastage.created_by
3. If user_id matches created_by, reject approval
4. Exception: System user (for auto-approvals) is allowed

**When Validated**: On approval action

**Implementation Requirements**:
- **Client-Side**: Hide/disable approve button if user is creator
- **Server-Side**: Verify approver_id != wastage.created_by before allowing approval
- **Database**: Not enforced (application logic)

**Error Code**: VAL-WAST-104
**Error Message**: "You cannot approve your own wastage submission. Please request approval from your manager."
**User Action**: User must wait for assigned approver to review and approve.

**Related Business Requirements**: BR-WAST-008

**Test Cases**:
- ✅ Valid: Creator = Chef Daniel, Approver = Store Manager Maria
- ❌ Invalid: Creator = Chef Daniel, Approver = Chef Daniel (same person)
- ✅ Valid: Creator = Chef Daniel, Approver = System (auto-approval)

---

### VAL-WAST-105: Sequential Approval Validation

**Rule Description**: Multi-level approvals must be completed sequentially (Level 1 before Level 2, Level 2 before Level 3).

**Business Justification**: Ensures proper approval hierarchy. Lower levels must approve before higher levels.

**Validation Logic**:
1. When Level N approver attempts approval
2. Verify all previous levels (1 to N-1) are completed
3. Check wastage.current_approval_level = N-1
4. If previous level incomplete, reject approval

**When Validated**: On approval action

**Implementation Requirements**:
- **Client-Side**: Show approval level status indicator. Disable approve button if out of sequence.
- **Server-Side**: Verify current_approval_level = approval_level - 1 before allowing approval
- **Database**: current_approval_level tracks progress

**Error Code**: VAL-WAST-105
**Error Message**: "This wastage requires Level {N-1} approval before Level {N} approval. Current status: Level {current}."
**User Action**: Wait for previous approval level to complete.

**Examples**:

**Scenario 1: Correct Sequence**
- Wastage requires Level 2 approval (Store Manager)
- current_approval_level = 1 (Dept Manager approved)
- Store Manager attempts approval
- Result: ✅ Allowed (sequence correct)

**Scenario 2: Out of Sequence**
- Wastage requires Level 3 approval
- current_approval_level = 1 (Level 2 not yet approved)
- Finance Manager (Level 3) attempts approval
- Result: ❌ Rejected (Level 2 must approve first)

---

### VAL-WAST-106: Status Transition Rules

**Rule Description**: Wastage status can only transition through valid state paths.

**Business Justification**: Enforces workflow integrity. Prevents invalid status changes that could bypass approvals.

**Valid Transitions**:
- `draft` → `pending_approval` (Submit)
- `draft` → `[deleted]` (Delete)
- `pending_approval` → `approved` (Approve)
- `pending_approval` → `partially_approved` (Partial approve)
- `pending_approval` → `rejected` (Reject)
- `pending_approval` → `draft` (Return for revision)
- `pending_approval` → `cancelled` (Withdraw)
- `approved` → `cancelled` (Cancel if not yet adjusted)
- `rejected` → `draft` (Revise and resubmit)

**Invalid Transitions**:
- `approved` → `draft` (Cannot un-approve)
- `approved` → `rejected` (Cannot reject after approval)
- `rejected` → `approved` (Cannot directly approve rejected)
- `approved` → `pending_approval` (Cannot return to pending)

**When Validated**: On status change operations

**Implementation Requirements**:
- **Client-Side**: Only show valid action buttons based on current status
- **Server-Side**: Validate transition is allowed before updating status
- **Database**: Not enforced (application logic with comprehensive audit log)

**Error Code**: VAL-WAST-106
**Error Message**: "Invalid status transition: cannot change from '{current_status}' to '{new_status}'"
**User Action**: User cannot perform this action. Status transition not allowed.

**Test Cases**:
- ✅ Valid: draft → pending_approval (Submit action)
- ✅ Valid: pending_approval → approved (Approve action)
- ❌ Invalid: approved → draft (Cannot un-approve)
- ❌ Invalid: rejected → approved (Cannot skip revision)

---

### VAL-WAST-107: Immutable Approved Records

**Rule Description**: Once wastage is approved and inventory adjusted, the record becomes immutable (cannot be edited or deleted).

**Business Justification**: Maintains audit trail integrity. Prevents tampering with approved financial records.

**Validation Logic**:
1. Check wastage doc_status = 'approved'
2. Check inventory_adjusted = true
3. If both true, reject any edit or delete operations
4. Only allow viewing and audit field updates (updated_date, updated_by)

**When Validated**: On update or delete operations

**Implementation Requirements**:
- **Client-Side**: Disable edit/delete buttons if approved and adjusted
- **Server-Side**: Reject update/delete requests if status = 'approved' AND inventory_adjusted = true
- **Database**: Not enforced (application logic)

**Error Code**: VAL-WAST-107
**Error Message**: "Cannot modify approved wastage that has been inventory adjusted. Record is locked for audit compliance."
**User Action**: User cannot edit. If correction needed, create adjustment transaction.

**Exceptions**:
- Audit fields (updated_date, updated_by) can be updated
- System processes can add approval records, inventory adjustment links
- Admin "unlock" function with special permission and audit log

**Test Cases**:
- ✅ Valid: Edit draft wastage
- ✅ Valid: Edit pending_approval wastage (by creator)
- ❌ Invalid: Edit approved + inventory_adjusted = true wastage
- ❌ Invalid: Delete approved wastage

---

### VAL-WAST-108: Partial Approval Quantity Validation

**Rule Description**: In partial approval scenarios, approved quantity must be positive, less than or equal to original quantity, and must have adjustment reason.

**Business Justification**: Ensures partial approvals are meaningful and documented.

**Validation Logic**:
1. If approver selects "Partial Approval"
2. Verify: 0 < approved_quantity < original_quantity
3. Verify: adjustment_reason is provided (min 20 characters)
4. Calculate: rejected_quantity = original_quantity - approved_quantity

**When Validated**: On partial approval action

**Implementation Requirements**:
- **Client-Side**: Show partial approval dialog with quantity adjustment fields and reason textarea
- **Server-Side**: Validate approved_quantity > 0 AND < original_quantity, reason length >= 20
- **Database**: CHECK constraints on wastage_line_items

**Error Code**: VAL-WAST-108
**Error Message**:
- "Approved quantity must be between 0 and {original_quantity}"
- "Adjustment reason is required for partial approvals (minimum 20 characters)"

**User Action**: Approver must enter valid approved quantity and detailed reason for reduction.

**Test Cases**:
- ✅ Valid: Original 5 kg, Approved 4 kg, Reason "Only 4 kg clearly visible in photos."
- ❌ Invalid: Original 5 kg, Approved 0 kg (cannot approve zero)
- ❌ Invalid: Original 5 kg, Approved 5 kg (not partial, use full approval)
- ❌ Invalid: Original 5 kg, Approved 4 kg, Reason "OK" (reason too short)

---

## 4. Cross-Field Validations (VAL-WAST-201 to 299)

### VAL-WAST-201: Wastage Date vs Current Inventory Date

**Fields Involved**: `wastage_date`, `stock_on_hand_before` (from inventory at wastage time)

**Validation Rule**: Stock on hand before wastage must be retrieved from inventory as of wastage date, not current date.

**Business Justification**: Ensures accurate stock validation for backdated wastage entries.

**Validation Logic**:
1. Query inventory_stock for product at location
2. If wastage_date = today, use current stock
3. If wastage_date < today, use historical stock from inventory_transactions at that date
4. Validate wastage quantity against historical stock, not current stock

**When Validated**: On submission, when validating stock availability

**Implementation Requirements**:
- **Client-Side**: Display warning if wastage date is not today
- **Server-Side**: Query inventory history for specified date, validate against historical stock
- **Database**: Not enforced (complex temporal query)

**Error Code**: VAL-WAST-201
**Error Message**: "Wastage quantity exceeds stock available on {wastage_date}. Stock on {wastage_date}: {historical_stock}"
**User Action**: User must reduce quantity to match historical stock levels or change wastage date.

**Examples**:

**Scenario 1: Same Day Wastage**
- Wastage Date: 2025-01-12 (today)
- Current Stock: 25 kg
- Wastage Qty: 5 kg
- Validation: Use current stock (25 kg)
- Result: ✅ Valid (5 < 25)

**Scenario 2: Backdated Wastage**
- Wastage Date: 2025-01-05 (7 days ago)
- Current Stock: 25 kg
- Historical Stock (2025-01-05): 10 kg
- Wastage Qty: 15 kg
- Validation: Use historical stock (10 kg)
- Result: ❌ Invalid (15 > 10)

---

### VAL-WAST-202: Total Value Calculation Accuracy

**Fields Involved**: Line item `quantity`, `unit_cost`, `total_value` (line level), wastage_headers `total_value` (header level)

**Validation Rule**: Header total_value must equal sum of all line item total_value fields. Each line item total_value must equal quantity × unit_cost.

**Business Justification**: Ensures financial accuracy and prevents calculation errors or data corruption.

**Validation Logic**:
1. For each line item: Verify line_item.total_value = line_item.quantity × line_item.unit_cost (within $0.01 rounding)
2. Calculate sum of all line_item.total_value
3. Verify wastage_headers.total_value = sum of line item totals (within $0.01 rounding)

**When Validated**: On line item addition/update, before submission

**Implementation Requirements**:
- **Client-Side**: Auto-calculate totals when quantities or costs change. Display calculations.
- **Server-Side**: Recalculate all totals and verify match before saving
- **Database**: Trigger to recalculate on line item INSERT/UPDATE (optional)

**Error Code**: VAL-WAST-202
**Error Message**: "Total value calculation mismatch. Calculated: ${calculated}, Provided: ${provided}. Difference: ${diff}"
**User Action**: System should auto-correct. If error persists, contact support.

**Rounding Rules**:
- All calculations use DECIMAL(15,4) precision internally
- Final amounts rounded to 2 decimal places for currency
- Rounding tolerance: $0.01 acceptable due to floating-point arithmetic

**Examples**:

**Valid Calculation**:
- Line 1: 2.5 kg × $12.50/kg = $31.25
- Line 2: 1.0 kg × $45.00/kg = $45.00
- Header Total: $31.25 + $45.00 = $76.25 ✅

**Invalid Calculation**:
- Line 1: 2.5 kg × $12.50/kg = $31.25
- Line 2: 1.0 kg × $45.00/kg = $45.00
- Calculated Total: $76.25
- Provided Total: $80.00 (user manually entered wrong amount)
- Result: ❌ Invalid (difference of $4.75 exceeds $0.01 tolerance)

---

### VAL-WAST-203: Photo Requirements vs Wastage Value

**Fields Involved**: `total_value`, `photos` (array count)

**Validation Rule**: If total_value > configured photo_mandatory_threshold (default $100), at least one photo must be attached.

**Business Justification**: Visual evidence prevents fraud for high-value wastage and supports approval decisions.

**Validation Logic**:
1. Retrieve photo_mandatory_threshold from wastage_configuration (location-specific or global)
2. Calculate total_value from line items
3. Count photos attached to wastage (wastage_photos where wastage_header_id = id)
4. If total_value > threshold AND photo_count = 0, validation fails

**When Validated**: On submission

**Implementation Requirements**:
- **Client-Side**: Show required photo indicator if value exceeds threshold. Block submission if missing.
- **Server-Side**: Check photo count vs threshold before allowing submission
- **Database**: Not enforced (business logic)

**Error Code**: VAL-WAST-203
**Error Message**: "Photo evidence is required for wastage over ${threshold}. Current value: ${total_value}. Please upload at least one photo."
**User Action**: User must upload photo(s) before submitting.

**Configuration**: Retrieved from `wastage_configuration.photo_requirements.mandatory_threshold`

**Test Cases**:
- ✅ Valid: Value $150, 2 photos (exceeds threshold, photos present)
- ✅ Valid: Value $50, 0 photos (below threshold, photos optional)
- ❌ Invalid: Value $150, 0 photos (exceeds threshold, missing photos)

---

### VAL-WAST-204: Supplier Issue Fields Consistency

**Fields Involved**: `is_supplier_quality_issue`, `supplier_id`, `quality_issue_type`, `grn_reference`

**Validation Rule**: If is_supplier_quality_issue = true, then supplier_id and quality_issue_type are required. GRN reference is optional but recommended.

**Business Justification**: Complete supplier quality data enables vendor performance tracking and claim processing.

**Validation Logic**:
1. Check is_supplier_quality_issue flag
2. If true:
   - Verify supplier_id is provided and references valid vendor
   - Verify quality_issue_type is selected from allowed values
   - Show warning (not error) if grn_reference is empty
3. If false:
   - Ignore supplier-related fields (set to null)

**When Validated**: On form submission, when supplier flag changes

**Implementation Requirements**:
- **Client-Side**: Show/hide supplier fields based on checkbox. Mark supplier_id and quality_issue_type as required.
- **Server-Side**: Validate required fields if flag = true
- **Database**: CHECK constraint enforces supplier_id requirement

**Error Code**: VAL-WAST-204
**Error Message**:
- "Vendor selection is required for supplier quality issues"
- "Quality issue type must be specified"
**Warning Message**: "GRN reference is recommended for traceability and vendor claims"

**User Action**: User must select vendor and quality issue type. Optionally provide GRN reference.

**Quality Issue Types**:
- `incorrect_specification`: Product doesn't match order specs
- `damaged_in_transit`: Product damaged during delivery
- `short_shelf_life`: Product nearing expiry upon receipt
- `poor_freshness`: Product quality below standards
- `wrong_product`: Incorrect product delivered
- `contamination`: Product contaminated
- `packaging_defect`: Packaging issue causing product damage
- `other`: Other quality issues

**Examples**:

**Valid Scenario**:
- is_supplier_quality_issue: true
- supplier_id: "ABC Seafood Suppliers"
- quality_issue_type: "damaged_in_transit"
- grn_reference: "GRN-2501-0110-0015"
- Result: ✅ Valid (all required fields provided)

**Invalid Scenario**:
- is_supplier_quality_issue: true
- supplier_id: null
- quality_issue_type: null
- Result: ❌ Invalid (missing required supplier fields)

---

### VAL-WAST-205: Batch Wastage Line Items

**Fields Involved**: `is_batch`, `line_items` (count)

**Validation Rule**: If is_batch = true, must have at least 2 line items. If is_batch = false, must have exactly 1 line item.

**Business Justification**: Batch flag indicates multiple products wasted together. Single-product wastage doesn't need batch flag.

**Validation Logic**:
1. Count line items in wastage transaction
2. If is_batch = true AND line_item_count < 2, validation fails
3. If is_batch = false AND line_item_count != 1, validation fails
4. No duplicate products in batch (same product_id in multiple line items)

**When Validated**: On submission, when line items added/removed

**Implementation Requirements**:
- **Client-Side**: Set is_batch automatically based on line item count. Show batch context field if is_batch = true.
- **Server-Side**: Verify line item count matches batch flag. Check for duplicate products.
- **Database**: Not enforced (application logic)

**Error Code**: VAL-WAST-205
**Error Message**:
- "Batch wastage requires at least 2 line items. Current: {count}"
- "Single product wastage should not use batch flag"
- "Duplicate products not allowed in batch wastage. Product '{name}' appears {count} times"

**User Action**: Add more line items for batch, or remove batch flag for single product.

**Test Cases**:
- ✅ Valid: is_batch = true, 3 line items (different products)
- ✅ Valid: is_batch = false, 1 line item
- ❌ Invalid: is_batch = true, 1 line item (batch needs multiple)
- ❌ Invalid: is_batch = false, 3 line items (use batch flag)
- ❌ Invalid: is_batch = true, 2 line items with same product_id (duplicate)

---

## 5. Security Validations (VAL-WAST-301 to 399)

### VAL-WAST-301: Permission Check - Record Wastage

**Validation Rule**: User must have `record-wastage` permission to create wastage transactions.

**Checked Permissions**:
- `record-wastage`: Can create new wastage records
- `edit-wastage`: Can modify draft/pending wastage
- `delete-wastage`: Can delete draft wastage
- `approve-wastage`: Can approve wastage at assigned level
- `view-all-wastage`: Can view wastage across all locations
- `view-wastage-analytics`: Can access wastage reports and trends

**When Validated**: Before every create, update, delete, or approval action

**Implementation Requirements**:
- **Client-Side**: Hide "Record Wastage" button if user lacks permission. Show "Access Denied" message.
- **Server-Side**: Verify user has required permission from user.permissions array before allowing action
- **Database**: Row Level Security (RLS) policies check permissions via user_permissions table

**Error Code**: VAL-WAST-301
**Error Message**: "You do not have permission to {action} wastage. Contact your manager to request access."
**User Action**: User must request appropriate permission from administrator.

**Permission Matrix**:

| Role | record-wastage | edit-wastage | delete-wastage | approve-wastage | view-all-wastage |
|------|----------------|--------------|----------------|-----------------|------------------|
| Kitchen Staff | ✅ | ✅ (own) | ✅ (own, draft) | ❌ | ❌ |
| Department Manager | ✅ | ✅ (dept) | ✅ (dept, draft) | ✅ (Level 1) | ❌ |
| Store Manager | ✅ | ✅ (location) | ✅ (location) | ✅ (Level 2) | ✅ (location) |
| Finance Manager | ❌ | ❌ | ❌ | ✅ (Level 3) | ✅ (all) |

**Test Cases**:
- ✅ Valid: Kitchen Staff with record-wastage permission creates wastage
- ❌ Invalid: Counter Staff without record-wastage permission attempts to create wastage
- ✅ Valid: Department Manager with approve-wastage approves Level 1 wastage
- ❌ Invalid: Kitchen Staff without approve-wastage attempts to approve

---

### VAL-WAST-302: Ownership Validation - Edit/Delete

**Validation Rule**: User can only edit or delete wastage records they created, unless they have department/location management permissions.

**Ownership Rules**:
- Creator can edit/delete own draft wastage
- Creator can edit own pending_approval wastage (before approval starts)
- Creator cannot edit approved/rejected wastage
- Department Managers can edit/delete wastage from their department (draft only)
- Store Managers can edit/delete wastage from their location (draft only)
- Admins can edit/delete any wastage (with audit log)

**When Validated**: On edit or delete operations

**Implementation Requirements**:
- **Client-Side**: Disable edit/delete buttons if user is not owner or lacks management permission
- **Server-Side**: Verify user_id = wastage.created_by OR user has dept/location management permission
- **Database**: RLS policies check ownership: `created_by = current_user_id() OR user_has_dept_access()`

**Error Code**: VAL-WAST-302
**Error Message**: "You can only modify wastage you created. This wastage was created by {creator_name}."
**User Action**: User cannot proceed. Only record owner or manager can edit.

**Test Cases**:
- ✅ Valid: Chef Daniel edits his own draft wastage
- ✅ Valid: Department Manager edits draft wastage from their department
- ❌ Invalid: Chef Daniel attempts to edit Chef Sarah's wastage
- ❌ Invalid: Kitchen Staff attempts to delete approved wastage

---

### VAL-WAST-303: Location Access Validation

**Validation Rule**: User can only create/view wastage for locations they have access to.

**Access Rules**:
- User must be assigned to location via user_locations table
- User can only select locations they have access to in wastage form
- Row Level Security filters wastage list to show only accessible locations
- Multi-location users see combined wastage from all assigned locations

**When Validated**: On create, on list filtering, on detail view

**Implementation Requirements**:
- **Client-Side**: Location dropdown shows only accessible locations. Filter list by user's locations.
- **Server-Side**: Verify user has access to location before creating/viewing wastage
- **Database**: RLS policy: `location_id IN (SELECT location_id FROM user_locations WHERE user_id = current_user_id())`

**Error Code**: VAL-WAST-303
**Error Message**: "You do not have access to the selected location. Please select a location you are assigned to."
**User Action**: User must select a location they have access to or request location access from admin.

**RLS Policy Example**:
```sql
CREATE POLICY wastage_location_access ON wastage_headers
FOR SELECT
USING (
  location_id IN (
    SELECT location_id
    FROM user_locations
    WHERE user_id = auth.uid()
    AND is_active = true
  )
);
```

**Test Cases**:
- ✅ Valid: User assigned to Location A views Location A wastage
- ✅ Valid: Multi-location user views wastage from all assigned locations
- ❌ Invalid: User assigned to Location A attempts to view Location B wastage
- ❌ Invalid: User attempts to create wastage for unassigned location

---

### VAL-WAST-304: Input Sanitization - XSS and SQL Injection Prevention

**Validation Rule**: All text input must be sanitized to prevent security vulnerabilities.

**Security Checks**:
- **XSS Prevention**: Remove HTML tags, scripts, event handlers from user input
- **SQL Injection Prevention**: Use parameterized queries (Prisma ORM handles this)
- **File Upload Validation**: Scan photos for malicious content, validate MIME types
- **URL Validation**: Check GRN references and other URLs for malicious redirects
- **Length Limits**: Enforce maximum lengths to prevent buffer overflow

**Sanitization Rules**:
- Strip HTML tags: `<script>`, `<iframe>`, `<object>`, `<embed>`
- Remove JavaScript: `javascript:`, `onclick=`, `onerror=`
- Escape special characters: `'`, `"`, `;`, `--`
- Validate URLs: Must start with `http://` or `https://`, no `javascript:` protocol
- Limit string lengths: reason (500 chars), comments (1000 chars), etc.

**When Validated**: On all user input, before storing or displaying data

**Implementation Requirements**:
- **Client-Side**: Basic sanitization for UX, not security
- **Server-Side**: Comprehensive sanitization using DOMPurify or similar library
- **Database**: Prisma ORM uses parameterized queries preventing SQL injection

**Error Code**: VAL-WAST-304
**Error Message**: "Input contains invalid or potentially harmful content. Please remove scripts, HTML tags, or special characters."
**User Action**: User must remove problematic content and resubmit.

**Forbidden Content**:
- `<script>alert('XSS')</script>` - Script tags
- `<img src=x onerror=alert('XSS')>` - Event handlers
- `javascript:void(0)` - JavaScript protocol
- `' OR '1'='1` - SQL injection attempt
- Strings exceeding max length limits

**Sanitization Example**:
```typescript
// Before sanitization
input: "Salmon <script>alert('xss')</script> overcooked"

// After sanitization
output: "Salmon  overcooked"
```

**Test Cases**:
- ✅ Valid: "Salmon overcooked during service"
- ❌ Invalid: "Salmon <script>alert('xss')</script> overcooked"
- ❌ Invalid: "'; DROP TABLE wastage_headers; --"
- ✅ Valid (after sanitization): HTML tags removed, safe text retained

---

### VAL-WAST-305: Concurrent Modification Detection - Optimistic Locking

**Validation Rule**: Use doc_version field to detect concurrent modifications and prevent lost updates.

**Business Justification**: Prevents data loss when multiple users edit same wastage simultaneously.

**Validation Logic**:
1. When loading wastage for edit, retrieve current doc_version
2. User makes changes in UI (client holds doc_version)
3. On save, send doc_version with update request
4. Server checks: current_doc_version == provided_doc_version
5. If versions match: Allow update, increment doc_version
6. If versions don't match: Reject update, show conflict error

**When Validated**: On update operations

**Implementation Requirements**:
- **Client-Side**: Store doc_version when loading record. Send with update request.
- **Server-Side**: WHERE clause includes version check: `WHERE id = ? AND doc_version = ?`
- **Database**: doc_version INTEGER NOT NULL DEFAULT 1, incremented on each update

**Error Code**: VAL-WAST-305
**Error Message**: "This wastage was modified by another user. Please refresh and try again."
**User Action**: User must refresh page to get latest version, then re-apply their changes.

**Update Query Example**:
```sql
UPDATE wastage_headers
SET
  reason = 'Updated reason',
  doc_version = doc_version + 1,
  updated_date = NOW(),
  updated_by = ?
WHERE
  id = ?
  AND doc_version = ? -- Optimistic lock check
```

**Scenario**:
1. User A loads wastage (doc_version = 5)
2. User B loads same wastage (doc_version = 5)
3. User A saves changes → Success (doc_version = 6)
4. User B saves changes → Conflict (expected version 5, found 6)
5. User B gets error, refreshes, sees User A's changes, re-applies own changes

---

## 6. Zod Schema Definitions

### Wastage Header Schema

```typescript
import { z } from 'zod';

export const wastageHeaderSchema = z.object({
  // Required fields
  wastage_date: z.date({
    required_error: "Wastage date is required",
    invalid_type_error: "Invalid date format"
  }).max(new Date(), {
    message: "Wastage date cannot be in the future"
  }),

  wastage_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Invalid time format. Use HH:MM"
  }),

  location_id: z.string().uuid({
    message: "Invalid location ID"
  }),

  department_id: z.string().uuid({
    message: "Invalid department ID"
  }),

  wastage_category: z.enum([
    'spoilage',
    'overproduction',
    'preparation_error',
    'damaged',
    'expired',
    'customer_return',
    'portion_control',
    'quality_issue',
    'contamination',
    'equipment_failure',
    'training_testing',
    'sampling',
    'other'
  ], {
    required_error: "Wastage category is required",
    invalid_type_error: "Invalid wastage category"
  }),

  reason: z.string()
    .min(20, "Reason must be at least 20 characters")
    .max(500, "Reason cannot exceed 500 characters")
    .trim(),

  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'JPY', 'CNY'], {
    required_error: "Currency is required"
  }),

  // Optional fields
  subcategory: z.string().max(100).optional(),

  additional_notes: z.string().max(1000).optional(),

  responsible_party_id: z.string().uuid().optional(),

  is_supplier_quality_issue: z.boolean().default(false),

  supplier_id: z.string().uuid().optional(),

  quality_issue_type: z.enum([
    'incorrect_specification',
    'damaged_in_transit',
    'short_shelf_life',
    'poor_freshness',
    'wrong_product',
    'contamination',
    'packaging_defect',
    'other'
  ]).optional(),

  grn_reference: z.string().max(50).optional(),

  is_batch: z.boolean().default(false),

  batch_context: z.string().max(500).optional(),

}).refine(
  (data) => {
    // If supplier quality issue, supplier_id is required
    if (data.is_supplier_quality_issue && !data.supplier_id) {
      return false;
    }
    return true;
  },
  {
    message: "Vendor selection is required for supplier quality issues",
    path: ['supplier_id']
  }
).refine(
  (data) => {
    // If supplier quality issue, quality_issue_type is required
    if (data.is_supplier_quality_issue && !data.quality_issue_type) {
      return false;
    }
    return true;
  },
  {
    message: "Quality issue type is required for supplier quality issues",
    path: ['quality_issue_type']
  }
);

// Type inference
export type WastageHeaderInput = z.infer<typeof wastageHeaderSchema>;
```

### Wastage Line Item Schema

```typescript
export const wastageLineItemSchema = z.object({
  product_id: z.string().uuid({
    message: "Invalid product ID"
  }),

  quantity: z.number({
    required_error: "Quantity is required",
    invalid_type_error: "Quantity must be a number"
  }).positive({
    message: "Quantity must be greater than zero"
  }).multipleOf(0.001, {
    message: "Quantity can have at most 3 decimal places"
  }),

  unit_of_measure: z.string({
    required_error: "Unit of measure is required"
  }).min(1).max(20),

  line_reason: z.string().max(500).optional(),

  expiry_date: z.date().optional(),

}).refine(
  (data) => {
    // If quantity has more than 3 decimal places, reject
    const decimalPlaces = (data.quantity.toString().split('.')[1] || '').length;
    return decimalPlaces <= 3;
  },
  {
    message: "Quantity can have at most 3 decimal places",
    path: ['quantity']
  }
);

export type WastageLineItemInput = z.infer<typeof wastageLineItemSchema>;
```

### Complete Wastage Submission Schema

```typescript
export const wastageSubmissionSchema = z.object({
  header: wastageHeaderSchema,

  line_items: z.array(wastageLineItemSchema)
    .min(1, "At least one line item is required")
    .max(20, "Maximum 20 line items allowed per wastage"),

  photos: z.array(z.object({
    file: z.instanceof(File),
    caption: z.string().max(500).optional()
  }))
    .max(5, "Maximum 5 photos allowed")
    .optional()

}).refine(
  (data) => {
    // Batch flag validation
    if (data.header.is_batch && data.line_items.length < 2) {
      return false;
    }
    if (!data.header.is_batch && data.line_items.length !== 1) {
      return false;
    }
    return true;
  },
  {
    message: "Batch wastage requires at least 2 line items. Single product wastage must have exactly 1 line item.",
    path: ['line_items']
  }
).refine(
  (data) => {
    // Check for duplicate products in batch
    const productIds = data.line_items.map(item => item.product_id);
    const uniqueProducts = new Set(productIds);
    return productIds.length === uniqueProducts.size;
  },
  {
    message: "Duplicate products not allowed in wastage. Each product can only appear once.",
    path: ['line_items']
  }
);

export type WastageSubmissionInput = z.infer<typeof wastageSubmissionSchema>;
```

### Approval Action Schema

```typescript
export const approvalActionSchema = z.object({
  wastage_id: z.string().uuid(),

  approval_action: z.enum(['approved', 'partially_approved', 'rejected', 'returned', 'escalated']),

  comments: z.string()
    .min(1, "Comments are required")
    .max(1000, "Comments cannot exceed 1000 characters")
    .trim(),

  // For partial approval
  approved_value: z.number().positive().optional(),

  rejected_value: z.number().min(0).optional(),

  adjustment_reason: z.string().min(20).max(500).optional(),

  // For rejection
  rejection_reason: z.string().min(20).max(500).optional(),

  // For escalation
  escalation_reason: z.string().min(20).max(500).optional(),

  // Line item adjustments (for partial approval of batch)
  line_item_adjustments: z.array(z.object({
    line_item_id: z.string().uuid(),
    original_quantity: z.number().positive(),
    approved_quantity: z.number().min(0),
    rejected_quantity: z.number().min(0),
    reason: z.string().min(20).max(500)
  })).optional()

}).refine(
  (data) => {
    // If rejected, rejection_reason is required
    if (data.approval_action === 'rejected' && !data.rejection_reason) {
      return false;
    }
    return true;
  },
  {
    message: "Rejection reason is required when rejecting wastage",
    path: ['rejection_reason']
  }
).refine(
  (data) => {
    // If partially approved, adjustment_reason is required
    if (data.approval_action === 'partially_approved' && !data.adjustment_reason) {
      return false;
    }
    return true;
  },
  {
    message: "Adjustment reason is required for partial approvals",
    path: ['adjustment_reason']
  }
).refine(
  (data) => {
    // If partially approved, approved_value must be less than original
    if (data.approval_action === 'partially_approved') {
      if (!data.approved_value || data.approved_value <= 0) {
        return false;
      }
    }
    return true;
  },
  {
    message: "Approved value must be greater than zero for partial approvals",
    path: ['approved_value']
  }
);

export type ApprovalActionInput = z.infer<typeof approvalActionSchema>;
```

### Photo Upload Schema

```typescript
export const photoUploadSchema = z.object({
  file: z.instanceof(File, {
    message: "File is required"
  }).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    {
      message: "Photo file size cannot exceed 10MB"
    }
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/heic', 'image/webp'].includes(file.type),
    {
      message: "Invalid file format. Allowed: JPEG, PNG, HEIC, WebP"
    }
  ),

  caption: z.string().max(500).optional(),

  wastage_header_id: z.string().uuid(),

  wastage_line_item_id: z.string().uuid().optional()
});

export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;
```

---

## 7. Validation Error Messages Reference

### Error Message Format

All validation error messages follow this format:
```
[Field/Rule Name] {problem statement}. {Expected format or action}.
```

### Field-Level Error Messages

| Error Code | Message Template | Example |
|------------|------------------|---------|
| VAL-WAST-001 | "{Field} is required" | "Wastage date is required" |
| VAL-WAST-002 | "Wastage date cannot be in the future" | "Wastage date cannot be in the future" |
| VAL-WAST-003 | "Wastage date is more than {days} days old. This may require additional review." | "Wastage date is more than 7 days old..." |
| VAL-WAST-004 | "Product selection is required" | "Product selection is required" |
| VAL-WAST-005 | "Selected product does not exist or is no longer active" | "Selected product does not exist..." |
| VAL-WAST-006 | "Quantity must be greater than zero" | "Quantity must be greater than zero" |
| VAL-WAST-007 | "Wastage quantity ({qty}) exceeds available stock ({stock})" | "Wastage quantity (30 kg) exceeds available stock (25 kg)" |
| VAL-WAST-008 | "Reason must be at least 20 characters. Current: {count}/20" | "Reason must be at least 20 characters. Current: 15/20" |
| VAL-WAST-009 | "Reason cannot exceed 500 characters. Current: {count}/500" | "Reason cannot exceed 500 characters. Current: 523/500" |
| VAL-WAST-010 | "Please select a wastage category" | "Please select a wastage category" |
| VAL-WAST-011 | "Vendor selection is required for supplier quality issues" | "Vendor selection is required..." |
| VAL-WAST-012 | "Photo evidence is required for wastage over ${threshold}" | "Photo evidence is required for wastage over $100" |
| VAL-WAST-013 | "Maximum 5 photos allowed per wastage transaction" | "Maximum 5 photos allowed..." |
| VAL-WAST-014 | "Photo file size ({size}MB) exceeds maximum 10MB" | "Photo file size (12.5MB) exceeds maximum 10MB" |
| VAL-WAST-015 | "Total value cannot be negative" | "Total value cannot be negative" |
| VAL-WAST-016 | "Invalid currency code. Must be one of: {list}" | "Invalid currency code. Must be one of: USD, EUR, GBP..." |

### Business Rule Error Messages

| Error Code | Message Template |
|------------|------------------|
| VAL-WAST-101 | "No approval configuration found for this location. Contact administrator." |
| VAL-WAST-102 | "This wastage qualifies for auto-approval and will be processed immediately." (Info) |
| VAL-WAST-103 | "Your approval authority limit (${limit}) is below the wastage value (${value}). This requires approval from a manager with higher authority." |
| VAL-WAST-104 | "You cannot approve your own wastage submission. Please request approval from your manager." |
| VAL-WAST-105 | "This wastage requires Level {N-1} approval before Level {N} approval. Current status: Level {current}." |
| VAL-WAST-106 | "Invalid status transition: cannot change from '{current_status}' to '{new_status}'" |
| VAL-WAST-107 | "Cannot modify approved wastage that has been inventory adjusted. Record is locked for audit compliance." |
| VAL-WAST-108 | "Approved quantity must be between 0 and {original_quantity}" |

### Security Error Messages

| Error Code | Message Template |
|------------|------------------|
| VAL-WAST-301 | "You do not have permission to {action} wastage. Contact your manager to request access." |
| VAL-WAST-302 | "You can only modify wastage you created. This wastage was created by {creator_name}." |
| VAL-WAST-303 | "You do not have access to the selected location. Please select a location you are assigned to." |
| VAL-WAST-304 | "Input contains invalid or potentially harmful content. Please remove scripts, HTML tags, or special characters." |
| VAL-WAST-305 | "This wastage was modified by another user. Please refresh and try again." |

---

## 8. Test Scenarios

### Positive Test: Create Valid Single Product Wastage

**Test ID**: VAL-WAST-T001
**Test Description**: Create wastage with valid single product and all required fields
**Test Type**: Positive
**Validation Layer**: All (Client, Server, Database)

**Preconditions**:
- User authenticated as Kitchen Staff
- User has `record-wastage` permission
- User assigned to Restaurant A Downtown location
- Product "Atlantic Salmon Fillet" exists in inventory with 25 kg stock

**Test Steps**:
1. Navigate to Record Wastage page
2. Select wastage date: Today (2025-01-12)
3. Select wastage time: 14:30
4. Select location: Restaurant A Downtown
5. Select department: Kitchen
6. Search and select product: Atlantic Salmon Fillet
7. Enter quantity: 2.5 kg
8. Select wastage category: preparation_error
9. Select subcategory: overcooked
10. Enter reason: "Salmon overcooked during grill service. Three portions affected due to grill temperature control issue. Scheduled temperature calibration for tomorrow morning."
11. Upload 1 photo showing overcooked salmon
12. Review calculated total: $31.25
13. Click Submit

**Expected Result**: ✅ Wastage created successfully

**Pass Criteria**:
- No validation errors displayed
- Wastage saved with status "pending_approval"
- Wastage number generated: WST-2501-0112-NNNN
- Approval level determined: Level 1 (value $31.25)
- Department Manager notified via email
- Success message: "Wastage WST-2501-0112-NNNN submitted successfully"
- User redirected to wastage detail page

---

### Negative Test: Submit Without Required Photo for High-Value Wastage

**Test ID**: VAL-WAST-T101
**Test Description**: Attempt to submit wastage > $100 without photo evidence
**Test Type**: Negative (VAL-WAST-012)
**Validation Layer**: Client and Server

**Preconditions**:
- User on Record Wastage page
- Configuration: photo_mandatory_threshold = $100

**Test Steps**:
1. Fill form with valid data
2. Add line item: Beef Ribeye, Quantity: 3 kg, Unit Cost: $45/kg
3. Total calculated: $135.00
4. Skip photo upload (0 photos)
5. Click Submit

**Expected Result**: ❌ Validation error displayed

**Pass Criteria**:
- Error message shown: "Photo evidence is required for wastage over $100. Please upload at least one photo."
- Photo upload section highlighted in red
- Submit button remains disabled until photo uploaded
- Wastage not saved to database
- User remains on form page

---

### Negative Test: Quantity Exceeds Available Stock

**Test ID**: VAL-WAST-T102
**Test Description**: Attempt to record wastage quantity exceeding stock on hand
**Test Type**: Negative (VAL-WAST-007)
**Validation Layer**: Server

**Preconditions**:
- Product "Atlantic Salmon" has 25 kg stock on hand
- User on Record Wastage page

**Test Steps**:
1. Select product: Atlantic Salmon
2. Enter quantity: 30 kg (exceeds 25 kg stock)
3. Fill other required fields
4. Click Submit

**Expected Result**: ❌ Validation error

**Pass Criteria**:
- Error message: "Wastage quantity (30 kg) exceeds available stock (25 kg)"
- Quantity field highlighted in red
- Display current stock: "Available: 25 kg"
- Suggest: "Reduce quantity or contact inventory team"
- Wastage not saved

---

### Negative Test: Self-Approval Attempt

**Test ID**: VAL-WAST-T103
**Test Description**: User with approval permission attempts to approve own wastage
**Test Type**: Negative (VAL-WAST-104)
**Validation Layer**: Server

**Preconditions**:
- User is Department Manager (has approve-wastage permission)
- User created wastage WST-2501-0112-0023 yesterday
- Wastage status: pending_approval, Level 1 required

**Test Steps**:
1. Navigate to Approval Queue
2. Find own wastage WST-2501-0112-0023
3. Click to view details
4. Click "Approve" button
5. Enter comments: "Approved"
6. Click Confirm Approve

**Expected Result**: ❌ Validation error

**Pass Criteria**:
- Error message: "You cannot approve your own wastage submission. Please request approval from your manager."
- Approval not recorded
- Wastage status remains: pending_approval
- User returned to approval queue

---

### Boundary Test: Wastage at Exact Approval Threshold

**Test ID**: VAL-WAST-T201
**Test Description**: Create wastage at exact threshold boundary ($200)
**Test Type**: Boundary (VAL-WAST-101)
**Validation Layer**: All

**Preconditions**:
- Approval thresholds configured:
  - Level 1: $50 - $199.99
  - Level 2: $200 - $499.99
  - Level 3: $500+

**Test Steps**:
1. Create wastage with total value exactly $200.00
2. Submit wastage

**Expected Result**: ✅ Wastage created with Level 2 approval

**Pass Criteria**:
- approval_level_required = 2 (Store Manager)
- Both Department Manager AND Store Manager notified
- Sequential approval required (Level 1 → Level 2)
- Success message displayed

---

### Integration Test: End-to-End Wastage Lifecycle

**Test ID**: VAL-WAST-T301
**Test Description**: Complete wastage lifecycle from creation through approval to inventory adjustment
**Test Type**: Integration
**Validation Layer**: All

**Preconditions**:
- Kitchen Staff user (creator)
- Department Manager user (Level 1 approver)
- Product inventory with sufficient stock

**Test Steps**:
1. **Kitchen Staff**: Create wastage ($125, 1 line item, 2 photos)
2. Verify: Status = pending_approval, Level 1 required
3. Verify: Department Manager receives email notification
4. **Department Manager**: Navigate to approval queue
5. View wastage details, review photos
6. Approve with comments: "Approved. Photos clearly show overcooked condition."
7. Verify: Status = approved, current_approval_level = 1
8. Verify: Inventory adjustment created (stock reduced by wastage quantity)
9. Verify: GL journal entry created (wastage expense posted)
10. Verify: Kitchen Staff receives approval notification email

**Expected Result**: ✅ Complete workflow successful

**Pass Criteria**:
- All validations pass at each step
- Approval recorded with timestamp and approver details
- inventory_transactions record created
- gl_journal_entries record created
- wastage_headers.inventory_adjusted = true
- wastage_headers.gl_posted = true
- Notifications sent at each stage
- Audit log complete with all actions

---

## 9. Summary

This Validation Rules document defines **50+ validation rules** across three layers (client, server, database) for the Wastage Reporting module:

**Field-Level Validations** (VAL-WAST-001 to 016):
- Required fields, format validation, range checks
- Photo requirements, file size/format validation
- Currency codes, date constraints

**Business Rule Validations** (VAL-WAST-101 to 108):
- Approval threshold determination
- Auto-approve rules engine
- Approver authority validation
- Self-approval prevention
- Sequential approval enforcement
- Status transition rules
- Immutable approved records
- Partial approval validation

**Cross-Field Validations** (VAL-WAST-201 to 205):
- Date vs inventory stock validation
- Total value calculation accuracy
- Photo requirements vs value thresholds
- Supplier issue fields consistency
- Batch wastage line item validation

**Security Validations** (VAL-WAST-301 to 305):
- Permission checks for all operations
- Ownership validation for edit/delete
- Location-based access control (RLS)
- Input sanitization (XSS/SQL injection prevention)
- Optimistic locking for concurrent modifications

**Zod Schemas**: Type-safe validation schemas for TypeScript, shared between client and server for consistency.

**Test Scenarios**: 7 comprehensive test cases covering positive, negative, boundary, and integration testing.

All validation rules are enforced across three layers with clear error messages guiding users to resolve issues. The validation strategy prevents invalid data from entering the system while maintaining excellent user experience through immediate feedback.

### Implementation Checklist

- [ ] Implement all Zod schemas in `validations.ts`
- [ ] Add client-side validation to React Hook Form in components
- [ ] Implement server-side validation in Server Actions
- [ ] Create database CHECK constraints and RLS policies
- [ ] Test all validation rules with provided test scenarios
- [ ] Document custom error messages in UI
- [ ] Set up validation error logging and monitoring
- [ ] Train users on validation requirements and error resolution
