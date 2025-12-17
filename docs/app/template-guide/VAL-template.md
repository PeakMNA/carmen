# VAL-{CODE}: {Sub-Module Name} Validation Rules

**Module**: {Module Name}
**Sub-Module**: {Sub-Module Name}
**Document Type**: Validations (VAL)
**Version**: 1.0.0
**Last Updated**: {YYYY-MM-DD}
**Status**: Draft | Review | Approved | Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | {YYYY-MM-DD} | {Author} | Initial version |

---

## 1. Overview

### 1.1 Purpose
{Brief description of the validation requirements for this sub-module. What data needs validation? What are the critical validation rules? What are the consequences of invalid data?}

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

---

## 2. Field-Level Validations (VAL-{CODE}-001 to 099)

### VAL-{CODE}-001: {Field Name} - Required Field Validation

**Field**: `{field_name}`
**Database Column**: `{table_name}.{column_name}`
**Data Type**: {PostgreSQL type} / {TypeScript type}

**Validation Rule**: This field is mandatory and cannot be empty or null.

**Implementation Requirements**:
- **Client-Side**: Display red asterisk (*) next to field label. Show error immediately on blur if empty.
- **Server-Side**: Reject request if field is missing, null, or contains only whitespace.
- **Database**: Column defined as NOT NULL.

**Error Code**: VAL-{CODE}-001
**Error Message**: "{Field name} is required"
**User Action**: User must provide a value for this field before proceeding.

**Test Cases**:
- ✅ Valid: Field contains non-empty text
- ❌ Invalid: Field is empty
- ❌ Invalid: Field contains only spaces
- ❌ Invalid: Field is null or undefined

---

### VAL-{CODE}-002: {Field Name} - Minimum Length

**Field**: `{field_name}`

**Validation Rule**: Field value must contain at least {n} characters.

**Rationale**: {Why this minimum length is required - e.g., "Ensures meaningful descriptions", "Prevents accidental single-character entries"}

**Implementation Requirements**:
- **Client-Side**: Display character counter below field. Show warning when length < minimum.
- **Server-Side**: Reject if trimmed length is less than minimum.
- **Database**: CHECK constraint on length.

**Error Code**: VAL-{CODE}-002
**Error Message**: "{Field name} must be at least {n} characters"
**User Action**: User must add more characters to meet minimum length.

**Test Cases**:
- ✅ Valid: "Valid Description" (length = 18, minimum = 3)
- ❌ Invalid: "ab" (length = 2, minimum = 3)
- ❌ Invalid: "   " (whitespace doesn't count)

---

### VAL-{CODE}-003: {Field Name} - Maximum Length

**Field**: `{field_name}`

**Validation Rule**: Field value cannot exceed {n} characters.

**Rationale**: {Why this maximum is set - e.g., "Database column limit", "UI display constraints", "Business requirement"}

**Implementation Requirements**:
- **Client-Side**: Limit input to maximum characters using maxLength attribute. Show character count.
- **Server-Side**: Reject if length exceeds maximum.
- **Database**: Column defined as VARCHAR(n).

**Error Code**: VAL-{CODE}-003
**Error Message**: "{Field name} cannot exceed {n} characters"
**User Action**: User must shorten the text or summarize.

**Test Cases**:
- ✅ Valid: Text with exactly {n} characters
- ✅ Valid: Text with less than {n} characters
- ❌ Invalid: Text with {n+1} characters

---

### VAL-{CODE}-004: {Field Name} - Format Validation

**Field**: `{field_name}`

**Validation Rule**: Field value must match the format pattern: {describe pattern}

**Format Requirements**:
- Allowed characters: {list allowed characters}
- Pattern: {describe the expected format}
- Examples: {provide 2-3 valid examples}

**Rationale**: {Why this format is required}

**Implementation Requirements**:
- **Client-Side**: Validate against pattern on blur. Show format hint below field.
- **Server-Side**: Verify pattern match using regular expression validation.
- **Database**: CHECK constraint with pattern matching.

**Error Code**: VAL-{CODE}-004
**Error Message**: "{Field name} must be in format: {format description}"
**User Action**: User must correct the format to match the required pattern.

**Test Cases**:
- ✅ Valid: {example 1}
- ✅ Valid: {example 2}
- ❌ Invalid: {bad example 1} - Reason: {why it fails}
- ❌ Invalid: {bad example 2} - Reason: {why it fails}

---

### VAL-{CODE}-005: {Field Name} - Range Validation

**Field**: `{field_name}`

**Validation Rule**: Field value must be between {minimum} and {maximum} (inclusive/exclusive).

**Rationale**: {Why these limits exist}

**Implementation Requirements**:
- **Client-Side**: Set min/max attributes on input. Show range hint.
- **Server-Side**: Verify value is within acceptable range.
- **Database**: CHECK constraint for min/max values.

**Error Code**: VAL-{CODE}-005
**Error Message**: "{Field name} must be between {minimum} and {maximum}"
**User Action**: User must enter a value within the specified range.

**Special Cases**:
- Boundary values ({minimum} and {maximum}): {Are they allowed? Yes/No}
- Negative values: {Allowed? Yes/No}
- Zero: {Allowed? Yes/No}

**Test Cases**:
- ✅ Valid: {minimum value}
- ✅ Valid: {mid-range value}
- ✅ Valid: {maximum value}
- ❌ Invalid: {below minimum}
- ❌ Invalid: {above maximum}

---

### VAL-{CODE}-006: {Field Name} - Uniqueness Validation

**Field**: `{field_name}`

**Validation Rule**: Field value must be unique {within what scope - e.g., "globally", "within department", "for active records"}.

**Rationale**: {Why uniqueness is required - e.g., "Prevents duplicate entries", "Used as business identifier"}

**Implementation Requirements**:
- **Client-Side**: Async validation after user stops typing (debounced check).
- **Server-Side**: Query database to check for existing records with same value.
- **Database**: UNIQUE constraint on column or unique index.

**Error Code**: VAL-{CODE}-006
**Error Message**: "This {field name} already exists"
**User Action**: User must choose a different, unique value.

**Uniqueness Scope**:
- Check against: {describe what records are checked}
- Case sensitivity: {Case-sensitive? Yes/No}
- Exclude current record on update: {Yes/No}

**Test Cases**:
- ✅ Valid: New unique value
- ✅ Valid: Same value as current record (when updating)
- ❌ Invalid: Duplicate of existing active record
- ❌ Invalid: Duplicate with different case (if case-insensitive)

---

### VAL-{CODE}-007: {Field Name} - Decimal Precision

**Field**: `{field_name}`

**Validation Rule**: Numeric value must have at most {n} decimal places.

**Rationale**: {Why this precision - e.g., "Currency amounts use 2 decimals", "Weights use 3 decimals"}

**Implementation Requirements**:
- **Client-Side**: Validate decimal places on change. Round display value appropriately.
- **Server-Side**: Verify decimal precision before saving.
- **Database**: Column defined as DECIMAL(m,n) where n = max decimal places.

**Error Code**: VAL-{CODE}-007
**Error Message**: "{Field name} can have at most {n} decimal places"
**User Action**: User must round or truncate to allowed decimal places.

**Test Cases**:
- ✅ Valid: 123.45 (2 decimals when max = 2)
- ✅ Valid: 123 (0 decimals)
- ✅ Valid: 123.4 (1 decimal when max = 2)
- ❌ Invalid: 123.456 (3 decimals when max = 2)

---

## 3. Business Rule Validations (VAL-{CODE}-101 to 199)

### VAL-{CODE}-101: {Business Rule Name}

**Rule Description**: {Clear description of the business rule being enforced}

**Business Justification**: {Why this rule exists from a business perspective}

**Validation Logic**: {Describe in plain language what is being checked and the conditions}

**When Validated**: {On create | On update | On delete | On status change | Always}

**Implementation Requirements**:
- **Client-Side**: {What should happen in the UI}
- **Server-Side**: {What checks must be performed}
- **Database**: {Any database-level enforcement}

**Error Code**: VAL-{CODE}-101
**Error Message**: {User-friendly message explaining why the rule failed}
**User Action**: {What the user needs to do to resolve this}

**Related Business Requirements**: {List BR document references}

**Examples**:

**Scenario 1: Valid Case**
- Situation: {Describe the scenario}
- Input: {What data is provided}
- Result: ✅ Validation passes
- Reason: {Why this passes}

**Scenario 2: Invalid Case**
- Situation: {Describe the scenario}
- Input: {What data is provided}
- Result: ❌ Validation fails
- Reason: {Why this fails}
- User must: {What to do to fix}

---

### VAL-{CODE}-102: Budget Availability Check

**Rule Description**: When a budget code is specified, the total amount must not exceed the available budget for that code.

**Business Justification**: Prevents over-spending and ensures financial controls are maintained.

**Validation Logic**:
1. If budget code is provided, retrieve available budget amount
2. Calculate total amount requested
3. Compare: available amount >= requested amount
4. If insufficient, validation fails

**When Validated**: On submission, on amount change after submission

**Implementation Requirements**:
- **Client-Side**: Show budget availability indicator next to budget code field
- **Server-Side**: Query budget system for current availability. Perform comparison before allowing submission.
- **Database**: Not enforced at database level (requires external system check)

**Error Code**: VAL-{CODE}-102
**Error Message**: "Insufficient budget. Available: {available}, Requested: {requested}"
**User Action**: User must reduce the amount, choose a different budget code, or request budget increase.

**Special Cases**:
- If budget system is unavailable, {describe fallback behavior}
- For multi-currency requests, amounts must be converted to budget currency before comparison
- Reserved budget from other pending requests counts against available budget

**Related Business Requirements**: BR-{CODE}-008

**Examples**:

**Scenario 1: Sufficient Budget**
- Budget Code: DEPT-2501-0001
- Available: $10,000
- Requested: $5,000
- Result: ✅ Passes (sufficient budget)

**Scenario 2: Insufficient Budget**
- Budget Code: DEPT-2501-0001
- Available: $2,000
- Requested: $5,000
- Result: ❌ Fails (shortfall of $3,000)
- User must: Reduce amount to $2,000 or less, or use different budget code

---

### VAL-{CODE}-103: Approval Threshold Validation

**Rule Description**: Purchase requests above {threshold amount} require additional approval levels.

**Business Justification**: Ensures appropriate oversight for high-value purchases.

**Validation Logic**:
1. Calculate total amount of purchase request
2. Compare against department-specific thresholds
3. Determine required approval levels based on amount tiers
4. Verify appropriate approvers are available for all required levels

**Approval Tiers**:
- Tier 1: $0 - $5,000 → Department Manager only
- Tier 2: $5,001 - $25,000 → Department Manager + Finance Manager
- Tier 3: $25,001 - $100,000 → Department Manager + Finance Manager + General Manager
- Tier 4: Above $100,000 → Executive approval required

**When Validated**: On submission, before creating approval records

**Implementation Requirements**:
- **Client-Side**: Display required approval chain before submission
- **Server-Side**: Retrieve approval rules, determine chain, verify approvers exist
- **Database**: Not enforced (business logic only)

**Error Code**: VAL-{CODE}-103
**Error Message**: "No approver configured for {approval level}"
**User Action**: Contact administrator to assign required approvers before submitting.

**Special Cases**:
- Asset purchases may have different thresholds
- Emergency purchases may have expedited approval paths
- Recurring/template-based purchases may have different rules

**Related Business Requirements**: BR-{CODE}-006

---

## 4. Cross-Field Validations (VAL-{CODE}-201 to 299)

### VAL-{CODE}-201: {Validation Name}

**Fields Involved**: {field1}, {field2}, {field3}

**Validation Rule**: {Describe the relationship that must exist between these fields}

**Business Justification**: {Why this relationship is important}

**Validation Logic**: {Describe in plain language how the fields are compared}

**When Validated**: {When this check occurs}

**Implementation Requirements**:
- **Client-Side**: {What happens in the UI}
- **Server-Side**: {What checks are performed}
- **Database**: {Database-level enforcement if any}

**Error Code**: VAL-{CODE}-201
**Error Message**: {User-friendly message}
**User Action**: {What user needs to do}

**Examples**:

**Valid Scenarios**:
- {Describe valid case 1}
- {Describe valid case 2}

**Invalid Scenarios**:
- {Describe invalid case 1} - Why it fails
- {Describe invalid case 2} - Why it fails

---

### VAL-{CODE}-202: Date Range Consistency

**Fields Involved**: PR Date, Delivery Date

**Validation Rule**: Delivery Date must be after PR Date, and within 1 year from PR Date.

**Business Justification**:
- Ensures logical temporal ordering
- Prevents unrealistic delivery timelines
- Limits long-term commitments that may become outdated

**Validation Logic**:
1. Verify Delivery Date > PR Date
2. Calculate difference between dates
3. Verify difference <= 365 days
4. Both checks must pass

**When Validated**: On form submission, when either date changes

**Implementation Requirements**:
- **Client-Side**:
  * Set minimum date for Delivery Date picker to PR Date + 1 day
  * Show warning if dates are more than 365 days apart
  * Highlight both fields in red if validation fails
- **Server-Side**: Compare both dates, reject if either check fails
- **Database**: CHECK constraint: delivery_date > pr_date

**Error Code**: VAL-{CODE}-202
**Error Message**:
- If Delivery Date <= PR Date: "Delivery date must be after PR date"
- If difference > 365 days: "Delivery date cannot be more than 1 year from PR date"

**User Action**: User must adjust one or both dates to meet the requirements.

**Special Cases**:
- If PR Date is changed after Delivery Date is set, re-validate the relationship
- Consider business days vs calendar days: {specify which applies}
- Holidays: {Do they affect validation? Yes/No}

**Examples**:

**Valid Scenarios**:
- PR Date: 2025-01-15, Delivery Date: 2025-02-01 (17 days apart) ✅
- PR Date: 2025-01-15, Delivery Date: 2025-12-31 (350 days apart) ✅

**Invalid Scenarios**:
- PR Date: 2025-01-15, Delivery Date: 2025-01-15 (same day) ❌
- PR Date: 2025-01-15, Delivery Date: 2025-01-10 (before PR date) ❌
- PR Date: 2025-01-15, Delivery Date: 2026-02-01 (382 days apart) ❌

---

### VAL-{CODE}-203: Total Amount Consistency

**Fields Involved**: Line Item quantities and prices, Subtotal, Tax Amount, Total Amount

**Validation Rule**: The Total Amount must equal the sum of all line item totals plus tax amount minus discount amount.

**Business Justification**: Ensures financial accuracy and prevents data corruption.

**Validation Logic**:
1. For each line item: Calculate line_total = quantity × unit_price
2. Sum all line_total values = calculated_subtotal
3. Add tax_amount to calculated_subtotal
4. Subtract discount_amount
5. Compare result with provided total_amount
6. Allow difference of <= $0.01 for rounding

**When Validated**: After any amount changes, before saving, before submission

**Implementation Requirements**:
- **Client-Side**: Automatically recalculate totals when line items change
- **Server-Side**: Verify calculation matches before saving
- **Database**: Trigger to recalculate on INSERT/UPDATE of line items

**Error Code**: VAL-{CODE}-203
**Error Message**: "Total amount does not match calculated total. Calculated: {calculated}, Provided: {provided}"
**User Action**: System should automatically correct the total. If manual intervention needed, user must verify line items and amounts.

**Rounding Rules**:
- All amounts rounded to 2 decimal places
- Use banker's rounding (round half to even)
- Apply rounding at each step of calculation

**Examples**:

**Valid Scenario**:
- Line 1: 10 units × $5.00 = $50.00
- Line 2: 5 units × $3.50 = $17.50
- Subtotal: $67.50
- Tax (10%): $6.75
- Discount: $5.00
- Total: $69.25 ✅

**Invalid Scenario**:
- Calculated Total: $69.25
- Provided Total: $75.00
- Difference: $5.75 (exceeds $0.01 threshold) ❌

---

## 5. Security Validations (VAL-{CODE}-301 to 399)

### VAL-{CODE}-301: Permission Check

**Validation Rule**: User must have the required permission to perform the action.

**Checked Permissions**:
- `create_{entity}`: Can create new records
- `update_{entity}`: Can modify existing records
- `delete_{entity}`: Can delete records
- `approve_{entity}`: Can approve records

**When Validated**: Before every create, update, delete, or approval action

**Implementation Requirements**:
- **Client-Side**: Hide UI elements user doesn't have permission for
- **Server-Side**: Always verify permission before performing action
- **Database**: Row Level Security (RLS) policies enforce permission checks

**Error Code**: VAL-{CODE}-301
**Error Message**: "You do not have permission to perform this action"
**User Action**: User must request appropriate permissions from administrator.

---

### VAL-{CODE}-302: Ownership Validation

**Validation Rule**: User can only modify or delete records they created, unless they have admin permissions.

**Exceptions**:
- Approvers can view records pending their approval
- Managers can view records from their department
- Admins can view/modify all records

**When Validated**: On edit, delete, or status change operations

**Implementation Requirements**:
- **Client-Side**: Disable edit/delete buttons if user is not owner
- **Server-Side**: Verify user ID matches record's created_by field
- **Database**: RLS policies check ownership

**Error Code**: VAL-{CODE}-302
**Error Message**: "You can only modify your own {records}"
**User Action**: User cannot proceed. Action is restricted to record owner.

---

### VAL-{CODE}-303: Department/Location Access

**Validation Rule**: User can only create/view records for departments and locations they have access to.

**Access Rules**:
- User must be assigned to department to create records for it
- User must have access to location to create records for it
- Approvers can view records for departments they approve
- Department managers can view all records for their departments

**When Validated**: On create, when filtering/viewing lists

**Implementation Requirements**:
- **Client-Side**: Department/location dropdowns show only accessible options
- **Server-Side**: Verify user has access before allowing operation
- **Database**: RLS policies filter records based on user access

**Error Code**: VAL-{CODE}-303
**Error Message**: "You do not have access to the selected department/location"
**User Action**: User must select a department/location they have access to.

---

### VAL-{CODE}-304: Input Sanitization

**Validation Rule**: All text input must be sanitized to prevent security vulnerabilities.

**Security Checks**:
- Remove HTML tags and scripts (XSS prevention)
- Escape special characters in database queries (SQL injection prevention)
- Validate file uploads for malicious content
- Check URLs for malicious redirects
- Limit input length to prevent buffer overflow

**When Validated**: On all user input, before storing or displaying data

**Implementation Requirements**:
- **Client-Side**: Basic sanitization, mainly for UX
- **Server-Side**: Comprehensive sanitization before database operations
- **Database**: Use parameterized queries, never concatenate user input

**Error Code**: VAL-{CODE}-304
**Error Message**: "Input contains invalid or potentially harmful content"
**User Action**: User must remove the problematic content and resubmit.

**Forbidden Content**:
- `<script>` tags
- `javascript:` URLs
- SQL keywords in unexpected contexts
- Executable file extensions in uploads
- Extremely long strings (> max length)

---

## 6. Validation Error Messages

### Error Message Guidelines

**Principles**:
1. **Be Specific**: Tell user exactly what's wrong
2. **Be Actionable**: Explain how to fix the problem
3. **Be Kind**: Use friendly, helpful tone
4. **Be Consistent**: Use same format and tone throughout
5. **Avoid Technical Jargon**: Use plain language

### Error Message Format

**Structure**:
```
[Field Name] {problem statement}. {Expected format or action}.
```

**Examples**:

✅ **Good Messages**:
- "Email address is required. Please enter your email."
- "Password must be at least 8 characters long."
- "Delivery date must be after the order date."
- "Insufficient budget available. Please reduce amount or select different budget code."

❌ **Bad Messages**:
- "Error" (too vague)
- "Invalid input" (not specific)
- "FK constraint violation" (too technical)
- "Your submission is wrong" (unfriendly)

### Error Severity Levels

| Level | When to Use | Display |
|-------|-------------|---------|
| Error | Blocks submission/progress | Red icon, red border, red text |
| Warning | Should be corrected but not blocking | Yellow icon, yellow border |
| Info | Helpful guidance | Blue icon, normal border |

### Error Message Examples by Type

**Required Field**:
- Message: "{Field name} is required"
- Context: "This field is required to proceed"

**Format Error**:
- Message: "{Field name} must be in format: {expected format}"
- Example: "Email address must be in format: user@example.com"

**Range Error**:
- Message: "{Field name} must be between {min} and {max}"
- Example: "Quantity must be between 1 and 1000"

**Business Rule Violation**:
- Message: "{Clear explanation of why action is not allowed}"
- Example: "Cannot delete this item because it is referenced by 3 active orders"

---

## 7. Test Scenarios

### Test Coverage Requirements

All validation rules must have test cases covering:
1. **Positive Tests**: Valid input that should pass validation
2. **Negative Tests**: Invalid input that should fail validation
3. **Boundary Tests**: Edge cases at limits of acceptable values
4. **Integration Tests**: Validation working across all layers

### Test Scenario Template

**Test ID**: VAL-{CODE}-T{###}

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

#### Positive Test Example

**Test ID**: VAL-PR-T001

**Test Description**: Create PR with valid data

**Test Type**: Positive

**Preconditions**:
- User is authenticated
- User has create_purchase_request permission
- User has access to selected department

**Test Steps**:
1. Navigate to Create PR page
2. Select PR Type: General
3. Enter PR Date: Today
4. Enter Delivery Date: Today + 7 days
5. Select Department: User's department
6. Add one line item with valid product, quantity, and price
7. Click Submit

**Input Data**:
- Type: General
- Date: 2025-01-30
- Delivery Date: 2025-02-06
- Department: Food & Beverage
- Item: Product A, Qty: 10, Price: $5.00

**Expected Result**: ✅ PR created successfully with status "Submitted"

**Validation Layer**: All

**Pass/Fail Criteria**:
- No validation errors displayed
- PR saved to database
- Approval records created
- Success message shown

---

#### Negative Test Example

**Test ID**: VAL-PR-T101

**Test Description**: Create PR with delivery date before PR date

**Test Type**: Negative

**Preconditions**: User is on Create PR page

**Test Steps**:
1. Enter PR Date: 2025-01-30
2. Enter Delivery Date: 2025-01-25 (before PR date)
3. Fill other required fields with valid data
4. Click Submit

**Input Data**:
- PR Date: 2025-01-30
- Delivery Date: 2025-01-25

**Expected Result**: ❌ Validation error displayed

**Validation Layer**: Client and Server

**Pass/Fail Criteria**:
- Error message shown: "Delivery date must be after PR date"
- Delivery Date field highlighted in red
- PR not saved to database
- User remains on form

---

#### Boundary Test Example

**Test ID**: VAL-PR-T201

**Test Description**: Create PR with delivery date exactly 365 days from PR date

**Test Type**: Boundary

**Preconditions**: User is on Create PR page

**Test Steps**:
1. Enter PR Date: 2025-01-30
2. Enter Delivery Date: 2026-01-30 (exactly 365 days later)
3. Fill other required fields with valid data
4. Click Submit

**Input Data**:
- PR Date: 2025-01-30
- Delivery Date: 2026-01-30
- Days difference: 365 (maximum allowed)

**Expected Result**: ✅ PR created successfully (boundary value is acceptable)

**Validation Layer**: All

**Pass/Fail Criteria**:
- No validation errors
- PR saved successfully
- Success message shown

---

## 8. Validation Matrix

| Error Code | Rule Name | Fields Involved | Type | Client | Server | Database |
|------------|-----------|-----------------|------|--------|--------|----------|
| VAL-{CODE}-001 | Required Field | {field_name} | Field | ✅ | ✅ | ✅ |
| VAL-{CODE}-002 | Min Length | {field_name} | Field | ✅ | ✅ | ✅ |
| VAL-{CODE}-003 | Max Length | {field_name} | Field | ✅ | ✅ | ✅ |
| VAL-{CODE}-004 | Format | {field_name} | Field | ✅ | ✅ | ✅ |
| VAL-{CODE}-005 | Range | {field_name} | Field | ✅ | ✅ | ✅ |
| VAL-{CODE}-006 | Uniqueness | {field_name} | Field | ✅ | ✅ | ✅ |
| VAL-{CODE}-101 | Business Rule 1 | Multiple | Business | ❌ | ✅ | ❌ |
| VAL-{CODE}-102 | Budget Check | amount, budget_code | Business | ⚠️ | ✅ | ❌ |
| VAL-{CODE}-201 | Date Range | pr_date, delivery_date | Cross-field | ✅ | ✅ | ✅ |
| VAL-{CODE}-202 | Total Calculation | items, totals | Cross-field | ✅ | ✅ | ✅ |
| VAL-{CODE}-301 | Permission | - | Security | ✅ | ✅ | ✅ |
| VAL-{CODE}-302 | Ownership | created_by | Security | ✅ | ✅ | ✅ |

Legend:
- ✅ Enforced at this layer
- ❌ Not enforced at this layer
- ⚠️ Partial enforcement (e.g., display only)

---

## 9. Related Documents

- **Business Requirements**: [BR-template.md](./BR-template.md)
- **Use Cases**: [UC-template.md](./UC-template.md)
- **Technical Specification**: [TS-template.md](./TS-template.md)
- **Data Definition**: [DD-template.md](./DD-template.md)
- **Flow Diagrams**: [FD-template.md](./FD-template.md)

---

**Document Control**:
- **Created**: {YYYY-MM-DD}
- **Author**: {Author Name}
- **Reviewed By**: Business Analyst, QA Lead, Security Team
- **Approved By**: Technical Lead, Product Owner
- **Next Review**: {YYYY-MM-DD}

---

## Appendix: Error Code Registry

| Code Range | Category | Description |
|------------|----------|-------------|
| VAL-{CODE}-001 to 099 | Field Validations | Individual field rules |
| VAL-{CODE}-101 to 199 | Business Rules | Business logic validations |
| VAL-{CODE}-201 to 299 | Cross-Field | Multi-field relationships |
| VAL-{CODE}-301 to 399 | Security | Permission and access control |
| VAL-{CODE}-901 to 999 | System | System-level errors |

---

**Template Usage Notes**:
- Replace all `{placeholders}` with actual values
- Remove sections not applicable to your sub-module
- Add additional validation rules as needed
- Keep error messages user-friendly and actionable
- Document rationale for all business rules
- Include examples for complex validations
- Maintain error code uniqueness within module
