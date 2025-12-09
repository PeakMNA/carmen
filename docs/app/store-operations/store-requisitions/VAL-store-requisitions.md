# VAL-SR: Store Requisitions Validation Rules

**Module**: Store Operations
**Sub-Module**: Store Requisitions
**Document Type**: Validations (VAL)
**Version**: 1.0.0
**Last Updated**: 2025-11-12
**Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2025-12-05 | Documentation Team | Synced related documents with BR, added shared methods references |
---

## 1. Overview

### 1.1 Purpose

This document defines comprehensive validation rules for the Store Requisitions module, ensuring data integrity, business rule compliance, and security across all operations. Validations prevent invalid data entry, enforce business policies, and protect against security vulnerabilities.

**Critical Validations**:
- Requisition number uniqueness and format
- Quantity and approval workflow validation
- Department/location access control
- Multi-stage approval enforcement
- Inventory availability checks
- Partial issuance tracking

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
6. Support partial approvals and issuance

---

## 2. Field-Level Validations (VAL-SR-001 to 099)

### VAL-SR-001: Store Requisition Number (sr_no) - Required & Format

**Field**: `sr_no`
**Database Column**: `tb_store_requisition.sr_no`
**Data Type**: VARCHAR / string

**Validation Rule**: Required field with specific format pattern: `SR-YYYY-NNNN`

**Format Requirements**:
- Prefix: "SR-" (uppercase, required)
- Year: 4-digit current year (YYYY)
- Separator: Single hyphen (-)
- Sequence: 4-digit zero-padded number (0001-9999)
- Pattern: `^SR-\d{4}-\d{4}$`

**Implementation Requirements**:
- **Client-Side**: Auto-generate on create. Display format hint. Read-only field.
- **Server-Side**: Generate using sequence: `SR-{YEAR}-{SEQUENCE}`. Verify uniqueness before insert.
- **Database**: UNIQUE constraint on sr_no column. Index: sr_no_u

**Error Code**: VAL-SR-001
**Error Message**: "Store Requisition number must be in format SR-YYYY-NNNN"
**User Action**: System auto-generates. User cannot manually edit.

**Test Cases**:
- ✅ Valid: "SR-2025-0001"
- ✅ Valid: "SR-2025-9999"
- ❌ Invalid: "SR-25-001" (2-digit year)
- ❌ Invalid: "SR-2025-1" (not zero-padded)
- ❌ Invalid: "sr-2025-0001" (lowercase prefix)

---

### VAL-SR-002: SR Date - Required

**Field**: `sr_date`
**Database Column**: `tb_store_requisition.sr_date`
**Data Type**: TIMESTAMPTZ(6) / Date

**Validation Rule**: Required field. Must be valid date.

**Implementation Requirements**:
- **Client-Side**: Date picker with default = today. Cannot be empty. Red asterisk indicator.
- **Server-Side**: Verify date is provided and parseable. Reject if null/invalid.
- **Database**: Column allows NULL but application enforces NOT NULL.

**Error Code**: VAL-SR-002
**Error Message**: "SR Date is required"
**User Action**: User must select a valid date.

**Test Cases**:
- ✅ Valid: 2025-01-30
- ✅ Valid: Today's date
- ❌ Invalid: null
- ❌ Invalid: empty string
- ❌ Invalid: "invalid-date"

---

### VAL-SR-003: Expected Date - Required & Future Date

**Field**: `expected_date`
**Database Column**: `tb_store_requisition.expected_date`
**Data Type**: TIMESTAMPTZ(6) / Date

**Validation Rule**: Required field. Must be after SR Date.

**Business Justification**: Ensures logical temporal ordering. Expected delivery must be in the future relative to request date.

**Implementation Requirements**:
- **Client-Side**: Date picker with min date = sr_date + 1 day. Show warning if > 90 days from sr_date.
- **Server-Side**: Verify expected_date > sr_date. Reject if validation fails.
- **Database**: No database constraint (application-level only).

**Error Code**: VAL-SR-003
**Error Message**: "Expected date must be after SR date"
**User Action**: User must select a date after the SR date.

**Test Cases**:
- ✅ Valid: sr_date=2025-01-30, expected_date=2025-02-05 (6 days later)
- ✅ Valid: sr_date=2025-01-30, expected_date=2025-01-31 (1 day later)
- ❌ Invalid: sr_date=2025-01-30, expected_date=2025-01-30 (same day)
- ❌ Invalid: sr_date=2025-01-30, expected_date=2025-01-25 (before sr_date)

---

### VAL-SR-004: Description - Optional with Length Limits

**Field**: `description`
**Database Column**: `tb_store_requisition.description`
**Data Type**: VARCHAR / string

**Validation Rule**: Optional field. If provided, must be between 10 and 500 characters.

**Implementation Requirements**:
- **Client-Side**: Textarea with character counter. Show warning at 450 characters. maxLength=500.
- **Server-Side**: If provided, trim and check length. Reject if outside bounds.
- **Database**: VARCHAR column (no length constraint enforced).

**Error Code**: VAL-SR-004
**Error Message**:
- "Description must be at least 10 characters" (if < 10)
- "Description cannot exceed 500 characters" (if > 500)

**User Action**: User must adjust description length to meet requirements.

**Test Cases**:
- ✅ Valid: 50-character description
- ✅ Valid: null (optional field)
- ✅ Valid: 10-character description (boundary)
- ✅ Valid: 500-character description (boundary)
- ❌ Invalid: 9-character description (too short)
- ❌ Invalid: 501-character description (too long)

---

### VAL-SR-005: Document Status - Valid Enum Value

**Field**: `doc_status`
**Database Column**: `tb_store_requisition.doc_status`
**Data Type**: enum_doc_status / string

**Validation Rule**: Must be one of: draft, in_progress, completed, cancelled, voided

**Implementation Requirements**:
- **Client-Side**: Dropdown with allowed values only. Default = draft.
- **Server-Side**: Verify value is in allowed enum set. Reject if invalid.
- **Database**: ENUM constraint enforces allowed values.

**Error Code**: VAL-SR-005
**Error Message**: "Invalid document status"
**User Action**: User must select from allowed status values.

**Allowed Values**:
- `draft` - Initial state, can be edited
- `in_progress` - Submitted for approval
- `completed` - Fully issued and closed
- `cancelled` - Cancelled by requestor/manager
- `voided` - Voided by admin

**Test Cases**:
- ✅ Valid: "draft"
- ✅ Valid: "in_progress"
- ✅ Valid: "completed"
- ❌ Invalid: "pending"
- ❌ Invalid: "approved"
- ❌ Invalid: null (must have value)

---

### VAL-SR-006: From Location - Required & Valid Location

**Field**: `from_location_id`, `from_location_name`
**Database Column**: `tb_store_requisition.from_location_id`
**Data Type**: UUID / string

**Validation Rule**: Required field. Must reference valid location from tb_location table.

**Business Justification**: Identifies the requesting department/location. Required for inventory allocation and access control.

**Implementation Requirements**:
- **Client-Side**: Location dropdown filtered by user access. Auto-populate name when ID selected.
- **Server-Side**: Verify location exists and user has access. Populate both ID and name.
- **Database**: Foreign key relationship to tb_location table.

**Error Code**: VAL-SR-006
**Error Message**: "From location is required"
**User Action**: User must select a valid location they have access to.

**Test Cases**:
- ✅ Valid: Valid location UUID user has access to
- ❌ Invalid: null
- ❌ Invalid: Non-existent location UUID
- ❌ Invalid: Location UUID user doesn't have access to

---

### VAL-SR-007: Workflow Assignment - Required if Multi-Stage Approval

**Field**: `workflow_id`, `workflow_name`
**Database Column**: `tb_store_requisition.workflow_id`
**Data Type**: UUID / string

**Validation Rule**: Workflow must be assigned if requisition requires multi-stage approval.

**Business Justification**: Routes requisition through appropriate approval stages based on department, amount, or item type.

**Implementation Requirements**:
- **Client-Side**: System automatically determines workflow based on department and total amount.
- **Server-Side**: Query tb_workflow to find matching workflow. Assign workflow_id and populate workflow_name.
- **Database**: Foreign key relationship to tb_workflow table (optional).

**Error Code**: VAL-SR-007
**Error Message**: "No approval workflow found for this requisition"
**User Action**: Contact administrator to configure approval workflow for this department.

**Workflow Selection Logic**:
1. Query workflows with matching department_id
2. Filter by total_amount thresholds
3. Select workflow with highest priority
4. If no match, use default department workflow

**Test Cases**:
- ✅ Valid: Workflow found and assigned
- ✅ Valid: Single-stage approval (no workflow required)
- ❌ Invalid: Multi-stage required but no workflow exists

---

### VAL-SR-008: Requestor - Required & Valid User

**Field**: `requestor_id`, `requestor_name`
**Database Column**: `tb_store_requisition.requestor_id`
**Data Type**: UUID / string

**Validation Rule**: Required field. Must reference valid user.

**Implementation Requirements**:
- **Client-Side**: Auto-populate from current logged-in user. Read-only field.
- **Server-Side**: Verify user exists. Populate both ID and name from session.
- **Database**: No foreign key (user table external).

**Error Code**: VAL-SR-008
**Error Message**: "Requestor information is missing"
**User Action**: System error. User should refresh and try again.

**Test Cases**:
- ✅ Valid: Current logged-in user UUID
- ❌ Invalid: null
- ❌ Invalid: Non-existent user UUID

---

### VAL-SR-009: Department - Required & Valid Department

**Field**: `department_id`, `department_name`
**Database Column**: `tb_store_requisition.department_id`
**Data Type**: UUID / string

**Validation Rule**: Required field. Must reference valid department user has access to.

**Implementation Requirements**:
- **Client-Side**: Department dropdown filtered by user access. Auto-populate name when ID selected.
- **Server-Side**: Verify department exists and user has access. Populate both ID and name.
- **Database**: No enforced foreign key.

**Error Code**: VAL-SR-009
**Error Message**: "Department is required"
**User Action**: User must select a department they have access to.

**Test Cases**:
- ✅ Valid: Valid department UUID user has access to
- ❌ Invalid: null
- ❌ Invalid: Department user doesn't have access to

---

### VAL-SR-010: Document Version - Optimistic Locking

**Field**: `doc_version`
**Database Column**: `tb_store_requisition.doc_version`
**Data Type**: DECIMAL / number

**Validation Rule**: Version must match current database version for updates.

**Business Justification**: Prevents concurrent modification conflicts. Ensures user is updating the latest version.

**Implementation Requirements**:
- **Client-Side**: Store doc_version in form state. Include in update payload.
- **Server-Side**: Compare payload version with database version. Reject if mismatch. Increment version on successful update.
- **Database**: Default = 0. Incremented on each update.

**Error Code**: VAL-SR-010
**Error Message**: "This requisition has been modified by another user. Please refresh and try again."
**User Action**: User must refresh to get latest version and re-apply changes.

**Test Cases**:
- ✅ Valid: payload version matches DB version
- ❌ Invalid: payload version < DB version (stale data)

---

### VAL-SR-020: Line Item - Product Required

**Field**: `product_id`, `product_name`
**Database Column**: `tb_store_requisition_detail.product_id`
**Data Type**: UUID / string

**Validation Rule**: Required field. Must reference valid product.

**Implementation Requirements**:
- **Client-Side**: Product search/dropdown. Auto-populate name and unit when ID selected.
- **Server-Side**: Verify product exists and is active. Populate both ID and name.
- **Database**: Foreign key relationship to product table.

**Error Code**: VAL-SR-020
**Error Message**: "Product is required for each line item"
**User Action**: User must select a valid product for each line item.

**Test Cases**:
- ✅ Valid: Valid active product UUID
- ❌ Invalid: null
- ❌ Invalid: Inactive product UUID
- ❌ Invalid: Non-existent product UUID

---

### VAL-SR-021: Line Item - Requested Quantity

**Field**: `requested_qty`
**Database Column**: `tb_store_requisition_detail.requested_qty`
**Data Type**: DECIMAL(20,5) / number

**Validation Rule**: Required. Must be positive number > 0. Max 5 decimal places.

**Implementation Requirements**:
- **Client-Side**: Number input with min=0.00001, step based on product UOM. Show decimal places based on product.
- **Server-Side**: Verify qty > 0 and decimals <= 5. Round to 5 decimals if needed.
- **Database**: DECIMAL(20,5) column type.

**Error Code**: VAL-SR-021
**Error Message**:
- "Requested quantity is required" (if missing)
- "Requested quantity must be greater than 0" (if <= 0)
- "Requested quantity cannot exceed 5 decimal places" (if > 5 decimals)

**User Action**: User must enter a valid positive quantity.

**Test Cases**:
- ✅ Valid: 10.00000
- ✅ Valid: 0.5
- ✅ Valid: 0.00001 (boundary)
- ❌ Invalid: 0
- ❌ Invalid: -5
- ❌ Invalid: null
- ❌ Invalid: 10.123456 (6 decimals)

---

### VAL-SR-022: Line Item - Approved Quantity Range

**Field**: `approved_qty`
**Database Column**: `tb_store_requisition_detail.approved_qty`
**Data Type**: DECIMAL(20,5) / number

**Validation Rule**: Optional. If provided, must be >= 0 and <= requested_qty. Max 5 decimal places.

**Business Justification**: Approvers can approve partial quantities. Cannot approve more than requested.

**Implementation Requirements**:
- **Client-Side**: Number input with max=requested_qty. Default = requested_qty when approving.
- **Server-Side**: Verify 0 <= approved_qty <= requested_qty. Reject if outside range.
- **Database**: DECIMAL(20,5) column type.

**Error Code**: VAL-SR-022
**Error Message**:
- "Approved quantity cannot exceed requested quantity"
- "Approved quantity cannot be negative"

**User Action**: Approver must enter quantity between 0 and requested quantity.

**Test Cases**:
- ✅ Valid: approved_qty = requested_qty (full approval)
- ✅ Valid: approved_qty = requested_qty / 2 (partial approval)
- ✅ Valid: approved_qty = 0 (rejected)
- ✅ Valid: null (not yet approved)
- ❌ Invalid: approved_qty > requested_qty
- ❌ Invalid: approved_qty < 0

---

### VAL-SR-023: Line Item - Issued Quantity Tracking

**Field**: `issued_qty`
**Database Column**: `tb_store_requisition_detail.issued_qty`
**Data Type**: DECIMAL(20,5) / number

**Validation Rule**: Optional. If provided, must be >= 0 and <= approved_qty. Max 5 decimal places.

**Business Justification**: Tracks cumulative issued quantity. Supports partial issuance over multiple batches.

**Implementation Requirements**:
- **Client-Side**: Read-only display of cumulative issued. Editable during issuance with max=remaining_to_issue.
- **Server-Side**: Verify issued_qty <= approved_qty. Update cumulative total on each issuance.
- **Database**: DECIMAL(20,5) column type.

**Error Code**: VAL-SR-023
**Error Message**:
- "Issued quantity cannot exceed approved quantity"
- "Issued quantity cannot be negative"

**User Action**: Storekeeper must issue quantity within approved amount.

**Test Cases**:
- ✅ Valid: issued_qty <= approved_qty
- ✅ Valid: issued_qty = 0 (nothing issued yet)
- ✅ Valid: null (not yet issued)
- ❌ Invalid: issued_qty > approved_qty
- ❌ Invalid: issued_qty < 0

---

### VAL-SR-024: Line Item - Sequence Number

**Field**: `sequence_no`
**Database Column**: `tb_store_requisition_detail.sequence_no`
**Data Type**: INT / number

**Validation Rule**: Required. Must be positive integer. Unique within requisition.

**Implementation Requirements**:
- **Client-Side**: Auto-assigned based on line order. User can reorder lines (updates sequence).
- **Server-Side**: Assign sequence based on array index. Verify uniqueness within requisition.
- **Database**: Default = 1. Integer column.

**Error Code**: VAL-SR-024
**Error Message**: "Line item sequence numbers must be unique"
**User Action**: System auto-manages sequence. User shouldn't see this error.

**Test Cases**:
- ✅ Valid: Sequence 1, 2, 3, 4 (unique and ordered)
- ✅ Valid: Sequence 1, 5, 10 (unique, non-consecutive OK)
- ❌ Invalid: Sequence 1, 1, 2 (duplicate sequence)

---

## 3. Business Rule Validations (VAL-SR-101 to 199)

### VAL-SR-101: Minimum Line Items Required

**Rule Description**: Store Requisition must have at least 1 line item before submission.

**Business Justification**: Empty requisitions serve no purpose and waste approval resources.

**Validation Logic**:
1. Count line items in tb_store_requisition_detail for requisition
2. Verify count >= 1
3. Reject submission if count = 0

**When Validated**: On submission (draft → in_progress status change)

**Implementation Requirements**:
- **Client-Side**: Disable Submit button if no line items. Show warning message.
- **Server-Side**: Count line items in database. Reject submission if count = 0.
- **Database**: Not enforced (application-level rule).

**Error Code**: VAL-SR-101
**Error Message**: "At least one line item is required to submit requisition"
**User Action**: User must add at least one product line item before submitting.

**Related Business Requirements**: BR-SR-003

**Examples**:

**Scenario 1: Valid Submission**
- Line items count: 3
- Result: ✅ Validation passes
- Reason: Has required line items

**Scenario 2: Invalid Submission**
- Line items count: 0
- Result: ❌ Validation fails
- Reason: No line items added
- User must: Add at least one product

---

### VAL-SR-102: Maximum Line Items Limit

**Rule Description**: Store Requisition cannot exceed 100 line items per requisition.

**Business Justification**: Prevents performance issues and encourages breaking large requisitions into logical groups.

**Validation Logic**:
1. Count line items being added
2. Verify count <= 100
3. Reject if exceeds limit

**When Validated**: When adding new line item

**Implementation Requirements**:
- **Client-Side**: Disable "Add Item" button when count = 100. Show warning at 95 items.
- **Server-Side**: Count existing items plus new items. Reject if total > 100.
- **Database**: Not enforced (application-level rule).

**Error Code**: VAL-SR-102
**Error Message**: "Cannot exceed 100 line items per requisition"
**User Action**: User must create a separate requisition for additional items.

**Related Business Requirements**: BR-SR-004

---

### VAL-SR-103: Duplicate Product Detection

**Rule Description**: Same product cannot appear multiple times in a single requisition.

**Business Justification**: Prevents confusion and errors. Multiple quantities of same product should be combined into single line.

**Validation Logic**:
1. For each line item, check product_id
2. Verify product_id is unique within requisition
3. Reject if duplicate found

**When Validated**: When adding or modifying line items

**Implementation Requirements**:
- **Client-Side**: Check existing products when adding new line. Show warning if duplicate.
- **Server-Side**: Query existing line items for requisition. Verify new product_id not in list.
- **Database**: Not enforced (would need composite unique constraint).

**Error Code**: VAL-SR-103
**Error Message**: "Product {product_name} already exists in this requisition"
**User Action**: User must either:
- Increase quantity on existing line item
- Remove existing line and re-add with combined quantity

**Related Business Requirements**: BR-SR-005

**Examples**:

**Scenario 1: Valid Addition**
- Existing: Product A, Product B
- Adding: Product C
- Result: ✅ Passes (unique product)

**Scenario 2: Invalid Addition**
- Existing: Product A (10 units), Product B
- Adding: Product A (5 units)
- Result: ❌ Fails (duplicate product)
- User must: Update existing Product A line to 15 units instead

---

### VAL-SR-104: Draft Edit Restriction

**Rule Description**: Only requisitions in 'draft' status can be edited by requestor.

**Business Justification**: Prevents modification after submission. Maintains approval integrity.

**Validation Logic**:
1. Retrieve requisition's current doc_status
2. If status != 'draft', reject edit attempt
3. Allow edit only if status = 'draft'

**When Validated**: On any update operation

**Implementation Requirements**:
- **Client-Side**: Disable all form fields if status != 'draft'. Show read-only message.
- **Server-Side**: Verify doc_status = 'draft' before allowing updates. Reject if status changed.
- **Database**: Not enforced (application-level rule).

**Error Code**: VAL-SR-104
**Error Message**: "Cannot edit requisition after submission. Status: {current_status}"
**User Action**: User cannot edit submitted requisitions. Must contact approver to reject/cancel.

**Related Business Requirements**: BR-SR-010

**Exceptions**:
- Approvers can modify approved quantities during approval
- Storekeepers can modify issued quantities during issuance
- Admins can modify certain fields with audit trail

---

### VAL-SR-105: Submission Completeness Check

**Rule Description**: All required fields must be populated before submission.

**Business Justification**: Ensures requisition has all information needed for approval and issuance.

**Required Fields for Submission**:
- sr_no, sr_date, expected_date
- from_location_id
- requestor_id, department_id
- At least 1 line item with: product_id, requested_qty

**Validation Logic**:
1. Check all header required fields are non-null
2. Verify at least 1 line item exists
3. Check all line items have required fields
4. Reject if any required field missing

**When Validated**: On submission (draft → in_progress)

**Implementation Requirements**:
- **Client-Side**: Show validation errors for missing fields. Highlight required fields.
- **Server-Side**: Comprehensive check of all required fields. Provide detailed error list.
- **Database**: NOT NULL constraints on some fields.

**Error Code**: VAL-SR-105
**Error Message**: "Cannot submit: Missing required fields: {field_list}"
**User Action**: User must complete all required fields before submitting.

**Related Business Requirements**: BR-SR-011

---

### VAL-SR-106: Approval Authority Validation

**Rule Description**: Approver must have authority to approve requisitions from the requesting department.

**Business Justification**: Enforces organizational hierarchy and approval boundaries.

**Validation Logic**:
1. Retrieve approver's authorized departments
2. Check if requisition's department_id is in approver's list
3. Verify approver has required permission level
4. Reject if approver lacks authority

**When Validated**: During approval action

**Implementation Requirements**:
- **Client-Side**: Filter requisitions list to show only those approver has authority for.
- **Server-Side**: Verify approver authority before recording approval. Reject if unauthorized.
- **Database**: Not enforced (application-level rule).

**Error Code**: VAL-SR-106
**Error Message**: "You do not have authority to approve requisitions from {department_name}"
**User Action**: Approver cannot proceed. Requisition must be routed to authorized approver.

**Related Business Requirements**: BR-SR-015

---

### VAL-SR-107: Workflow Stage Sequence

**Rule Description**: Approval stages must be completed in sequential order.

**Business Justification**: Maintains proper approval hierarchy. Prevents skipping required approvals.

**Validation Logic**:
1. Retrieve workflow configuration with stage order
2. Get current workflow stage from requisition
3. Verify approval is for current stage (not future stage)
4. Reject if attempting to approve out of sequence

**When Validated**: During approval action

**Implementation Requirements**:
- **Client-Side**: Show only current stage approval option. Disable future stages.
- **Server-Side**: Verify approval stage matches workflow_current_stage. Reject if mismatch.
- **Database**: Not enforced (application-level rule).

**Error Code**: VAL-SR-107
**Error Message**: "Requisition is at stage {current_stage}. Cannot approve stage {attempted_stage}"
**User Action**: User must wait for current stage approval before proceeding.

**Related Business Requirements**: BR-SR-016

---

### VAL-SR-108: Rejection Reason Required

**Rule Description**: When rejecting a requisition or line item, rejection message is required.

**Business Justification**: Provides feedback to requestor on why rejection occurred.

**Validation Logic**:
1. If action = 'reject', check reject_message field
2. Verify reject_message is not null or empty
3. Verify length >= 10 characters
4. Reject if message missing or too short

**When Validated**: During reject action

**Implementation Requirements**:
- **Client-Side**: Show textarea for rejection reason. Mark as required. Enforce min length 10 chars.
- **Server-Side**: Verify reject_message provided and meets minimum length.
- **Database**: VARCHAR column (allows null normally).

**Error Code**: VAL-SR-108
**Error Message**: "Rejection reason is required and must be at least 10 characters"
**User Action**: User must provide detailed reason for rejection.

**Related Business Requirements**: BR-SR-017

---

### VAL-SR-109: Inventory Availability Check

**Rule Description**: Before issuance, verify sufficient stock available at from_location.

**Business Justification**: Prevents issuing more than available. Maintains inventory accuracy.

**Validation Logic**:
1. For each line item being issued, retrieve current stock level at from_location
2. Check: available_stock >= quantity_to_issue
3. Reject if insufficient stock for any item

**When Validated**: During issuance action

**Implementation Requirements**:
- **Client-Side**: Show real-time stock availability next to each item. Warn if insufficient.
- **Server-Side**: Query inventory for real-time availability. Reject issuance if insufficient.
- **Database**: Not enforced (requires inventory system integration).

**Error Code**: VAL-SR-109
**Error Message**: "Insufficient stock for {product_name}. Available: {available}, Requested: {requested}"
**User Action**: Storekeeper must:
- Issue partial quantity (if available > 0)
- Defer issuance until stock arrives
- Cancel line item if stock unavailable

**Related Business Requirements**: BR-SR-020

---

### VAL-SR-110: Partial Issuance Tracking

**Rule Description**: Cumulative issued quantity cannot exceed approved quantity.

**Business Justification**: Prevents over-issuing beyond approved amount.

**Validation Logic**:
1. Get current issued_qty from database
2. Add new issuance quantity
3. Verify: (current_issued_qty + new_issue_qty) <= approved_qty
4. Reject if total would exceed approved

**When Validated**: During each issuance transaction

**Implementation Requirements**:
- **Client-Side**: Show remaining quantity to issue. Max input = approved_qty - issued_qty.
- **Server-Side**: Calculate remaining issuable amount. Reject if new issuance exceeds remaining.
- **Database**: Not enforced (application calculates).

**Error Code**: VAL-SR-110
**Error Message**: "Cannot issue {new_qty}. Remaining approved quantity: {remaining}"
**User Action**: Storekeeper must issue quantity within remaining approved amount.

**Related Business Requirements**: BR-SR-021

---

### VAL-SR-111: Cancellation Restriction

**Rule Description**: Requisition can only be cancelled if not yet fully issued.

**Business Justification**: Prevents cancelling requisitions that have already been fulfilled.

**Validation Logic**:
1. Check doc_status of requisition
2. If status = 'completed', reject cancellation
3. Check if any line items have issued_qty > 0
4. If issuance started, reject cancellation (must void instead)

**When Validated**: During cancel action

**Implementation Requirements**:
- **Client-Side**: Hide Cancel button if status = 'completed' or any items issued.
- **Server-Side**: Verify status != 'completed' and issued_qty = 0 for all items.
- **Database**: Not enforced (application-level rule).

**Error Code**: VAL-SR-111
**Error Message**:
- "Cannot cancel completed requisition"
- "Cannot cancel requisition with issued items. Use void instead."

**User Action**: User must use void action if items already issued.

**Related Business Requirements**: BR-SR-023

---

### VAL-SR-112: Completion Criteria

**Rule Description**: Requisition can only be marked completed when all approved items are fully issued.

**Business Justification**: Ensures requisition closure reflects actual fulfillment.

**Validation Logic**:
1. For each line item with approved_qty > 0:
   - Verify issued_qty = approved_qty
2. Reject completion if any item not fully issued
3. Allow completion only when all items fulfilled

**When Validated**: During status change to 'completed'

**Implementation Requirements**:
- **Client-Side**: Auto-mark completed when last item issued. Show progress indicator.
- **Server-Side**: Verify all approved items fully issued before changing status.
- **Database**: Not enforced (application-level rule).

**Error Code**: VAL-SR-112
**Error Message**: "{count} items not fully issued. Cannot mark as completed."
**User Action**: Storekeeper must issue remaining quantities or adjust approved quantities.

**Related Business Requirements**: BR-SR-024

---

## 4. Cross-Field Validations (VAL-SR-201 to 299)

### VAL-SR-201: Date Range Consistency

**Fields Involved**: `sr_date`, `expected_date`

**Validation Rule**: Expected date must be after SR date.

**Business Justification**: Ensures logical temporal ordering. Cannot expect delivery before request made.

**Validation Logic**:
1. Parse both dates
2. Compare: expected_date > sr_date
3. Reject if expected_date <= sr_date

**When Validated**: On form submission, when either date changes

**Implementation Requirements**:
- **Client-Side**: Set min date for expected_date picker to sr_date + 1 day. Show error if validation fails.
- **Server-Side**: Compare both dates. Reject if expected_date <= sr_date.
- **Database**: No database constraint (application-level only).

**Error Code**: VAL-SR-201
**Error Message**: "Expected date must be after SR date"
**User Action**: User must adjust one or both dates to meet requirement.

**Examples**:

**Valid Scenarios**:
- sr_date=2025-01-30, expected_date=2025-02-05 ✅
- sr_date=2025-01-30, expected_date=2025-01-31 ✅

**Invalid Scenarios**:
- sr_date=2025-01-30, expected_date=2025-01-30 ❌ (same day)
- sr_date=2025-01-30, expected_date=2025-01-25 ❌ (before sr_date)

---

### VAL-SR-202: Quantity Relationship Consistency

**Fields Involved**: `requested_qty`, `approved_qty`, `issued_qty`

**Validation Rule**: issued_qty <= approved_qty <= requested_qty

**Business Justification**: Maintains logical quantity flow through approval and issuance process.

**Validation Logic**:
1. Verify approved_qty <= requested_qty (if approved_qty exists)
2. Verify issued_qty <= approved_qty (if issued_qty exists)
3. All comparisons must be true

**When Validated**: When any quantity field is updated

**Implementation Requirements**:
- **Client-Side**: Set max values based on prior quantity. Show warnings if approaching max.
- **Server-Side**: Verify all quantity relationships. Reject if any violation.
- **Database**: Not enforced (application-level rule).

**Error Code**: VAL-SR-202
**Error Message**:
- "Approved quantity cannot exceed requested quantity"
- "Issued quantity cannot exceed approved quantity"

**User Action**: User must adjust quantities to maintain proper relationship.

**Examples**:

**Valid Scenarios**:
- requested=100, approved=100, issued=100 ✅ (full approval & issuance)
- requested=100, approved=80, issued=50 ✅ (partial approval & issuance)
- requested=100, approved=null, issued=null ✅ (not yet approved/issued)

**Invalid Scenarios**:
- requested=100, approved=120, issued=null ❌ (approved > requested)
- requested=100, approved=80, issued=90 ❌ (issued > approved)

---

### VAL-SR-203: Approval Message Consistency

**Fields Involved**: `last_action`, `approved_message`, `reject_message`

**Validation Rule**:
- If last_action = 'approved', approved_message should be populated
- If last_action = 'rejected', reject_message must be populated

**Business Justification**: Ensures proper documentation of approval decisions.

**Validation Logic**:
1. Check last_action value
2. If 'approved', verify approved_message exists (optional but recommended)
3. If 'rejected', verify reject_message exists (required, min 10 chars)

**When Validated**: During approval/rejection actions

**Implementation Requirements**:
- **Client-Side**: Show appropriate message field based on action. Mark reject_message as required.
- **Server-Side**: Enforce reject_message requirement. Validate based on action type.
- **Database**: Both message fields allow null.

**Error Code**: VAL-SR-203
**Error Message**: "Rejection reason is required"
**User Action**: User must provide message appropriate to action taken.

---

### VAL-SR-204: Workflow Stage Consistency

**Fields Involved**: `workflow_current_stage`, `workflow_previous_stage`, `workflow_next_stage`, `workflow_history`

**Validation Rule**: Workflow stage transitions must follow configured workflow sequence.

**Business Justification**: Maintains workflow integrity and proper approval sequence.

**Validation Logic**:
1. Retrieve workflow configuration from tb_workflow
2. Verify current_stage exists in workflow definition
3. Verify transition from previous_stage to current_stage is valid
4. Update workflow_history JSON with stage transition record

**When Validated**: During workflow stage transitions

**Implementation Requirements**:
- **Client-Side**: Display workflow progress indicator. Show only valid next stages.
- **Server-Side**: Validate stage transition against workflow config. Update all stage fields and history.
- **Database**: Not enforced (application-level rule).

**Error Code**: VAL-SR-204
**Error Message**: "Invalid workflow stage transition from {previous} to {current}"
**User Action**: System error. User should contact administrator.

---

## 5. Security Validations (VAL-SR-301 to 399)

### VAL-SR-301: Create Permission Check

**Validation Rule**: User must have 'create_store_requisition' permission.

**Checked Permissions**:
- `create_store_requisition`: Can create new requisitions

**When Validated**: Before allowing access to create requisition page/action

**Implementation Requirements**:
- **Client-Side**: Hide "New Requisition" button if user lacks permission.
- **Server-Side**: Verify permission before creating record. Reject if unauthorized.
- **Database**: Row Level Security (RLS) policy enforces permission.

**Error Code**: VAL-SR-301
**Error Message**: "You do not have permission to create store requisitions"
**User Action**: User must request permission from administrator.

---

### VAL-SR-302: Update Permission Check

**Validation Rule**: User must be requisition owner or have admin permission.

**Authorization Rules**:
- Owner (created_by = user_id) can edit own drafts
- Department managers can edit requisitions from their departments (if draft status)
- Admins can edit any requisition

**When Validated**: Before allowing edit action

**Implementation Requirements**:
- **Client-Side**: Disable edit button if user unauthorized.
- **Server-Side**: Verify user is owner OR has admin role. Reject if unauthorized.
- **Database**: RLS policy checks ownership or admin role.

**Error Code**: VAL-SR-302
**Error Message**: "You can only edit your own requisitions"
**User Action**: User cannot proceed. Must be requisition owner to edit.

---

### VAL-SR-303: Approval Permission Check

**Validation Rule**: User must be assigned as approver for current workflow stage.

**Authorization Rules**:
- User must be in approvers list for current workflow stage
- User must have 'approve_store_requisition' permission
- User must have access to requisition's department

**When Validated**: During approval action

**Implementation Requirements**:
- **Client-Side**: Filter requisitions to show only those pending user's approval.
- **Server-Side**: Verify user is valid approver for current stage. Reject if unauthorized.
- **Database**: RLS policy filters to show only relevant requisitions.

**Error Code**: VAL-SR-303
**Error Message**: "You are not authorized to approve this requisition at current stage"
**User Action**: User cannot proceed. Requisition must be approved by assigned approver.

---

### VAL-SR-304: Issuance Permission Check

**Validation Rule**: User must have 'issue_store_items' permission and access to from_location.

**Authorization Rules**:
- User must have 'issue_store_items' permission
- User must have access to requisition's from_location
- User must be assigned to store/warehouse department

**When Validated**: During issuance action

**Implementation Requirements**:
- **Client-Side**: Hide issuance actions if user lacks permission.
- **Server-Side**: Verify permission and location access. Reject if unauthorized.
- **Database**: RLS policy enforces permission and location access.

**Error Code**: VAL-SR-304
**Error Message**: "You do not have permission to issue items from this location"
**User Action**: User cannot proceed. Must have storekeeper role and location access.

---

### VAL-SR-305: Department/Location Access Control

**Validation Rule**: User can only create/view requisitions for departments and locations they have access to.

**Access Rules**:
- User must be assigned to department to create requisitions for it
- User must have access to from_location
- Approvers can view requisitions for departments they approve
- Department managers can view all requisitions for their departments

**When Validated**: On create, when filtering/viewing lists

**Implementation Requirements**:
- **Client-Side**: Department/location dropdowns show only accessible options.
- **Server-Side**: Verify user has access before allowing operation.
- **Database**: RLS policies filter records based on user access.

**Error Code**: VAL-SR-305
**Error Message**: "You do not have access to the selected department/location"
**User Action**: User must select department/location they have access to.

---

### VAL-SR-306: Input Sanitization

**Validation Rule**: All text input must be sanitized to prevent security vulnerabilities.

**Security Checks**:
- Remove HTML tags and scripts (XSS prevention)
- Escape special characters in database queries (SQL injection prevention)
- Validate descriptions and messages for malicious content
- Limit input length to prevent buffer overflow

**When Validated**: On all user input, before storing or displaying data

**Implementation Requirements**:
- **Client-Side**: Basic sanitization for UX.
- **Server-Side**: Comprehensive sanitization before database operations.
- **Database**: Use parameterized queries (Prisma handles this).

**Error Code**: VAL-SR-306
**Error Message**: "Input contains invalid or potentially harmful content"
**User Action**: User must remove problematic content and resubmit.

**Forbidden Content**:
- `<script>` tags
- `javascript:` URLs
- SQL keywords in unexpected contexts
- Extremely long strings (> max length)

---

### VAL-SR-307: Audit Trail Enforcement

**Validation Rule**: All modifications must be logged with user ID and timestamp.

**Audit Fields**:
- `created_at`, `created_by_id`: Set on INSERT
- `updated_at`, `updated_by_id`: Updated on each UPDATE
- `deleted_at`, `deleted_by_id`: Set on soft delete
- `workflow_history`: JSON log of all workflow transitions

**When Validated**: On every create, update, delete operation

**Implementation Requirements**:
- **Client-Side**: Display audit trail in UI (created by, last modified by, etc.).
- **Server-Side**: Automatically populate audit fields from session user. Never allow client to set.
- **Database**: Default values for created_at, updated_at. Triggers for automatic updates.

**Error Code**: VAL-SR-307
**Error Message**: "Audit information missing"
**User Action**: System error. User should retry operation.

---

## 6. Zod Validation Schemas

### 6.1 RequisitionHeaderSchema

```typescript
import { z } from 'zod';

export const RequisitionHeaderSchema = z.object({
  id: z.string().uuid().optional(),
  sr_no: z.string().regex(/^SR-\d{4}-\d{4}$/, {
    message: "Store Requisition number must be in format SR-YYYY-NNNN"
  }),
  sr_date: z.date({
    required_error: "SR Date is required",
    invalid_type_error: "SR Date must be a valid date"
  }),
  expected_date: z.date({
    required_error: "Expected date is required",
    invalid_type_error: "Expected date must be a valid date"
  }),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal('')),
  doc_status: z.enum(['draft', 'in_progress', 'completed', 'cancelled', 'voided'], {
    errorMap: () => ({ message: "Invalid document status" })
  }),
  from_location_id: z.string().uuid("Invalid location ID"),
  from_location_name: z.string().min(1, "Location name is required"),
  workflow_id: z.string().uuid().optional().nullable(),
  workflow_name: z.string().optional().nullable(),
  workflow_current_stage: z.string().optional().nullable(),
  requestor_id: z.string().uuid("Invalid requestor ID"),
  requestor_name: z.string().min(1, "Requestor name is required"),
  department_id: z.string().uuid("Invalid department ID"),
  department_name: z.string().min(1, "Department name is required"),
  doc_version: z.number().default(0),
  created_at: z.date().optional(),
  created_by_id: z.string().uuid().optional(),
  updated_at: z.date().optional(),
  updated_by_id: z.string().uuid().optional()
}).refine(
  (data) => data.expected_date > data.sr_date,
  {
    message: "Expected date must be after SR date",
    path: ["expected_date"]
  }
);

export type RequisitionHeader = z.infer<typeof RequisitionHeaderSchema>;
```

### 6.2 LineItemSchema

```typescript
export const LineItemSchema = z.object({
  id: z.string().uuid().optional(),
  store_requisition_id: z.string().uuid("Invalid requisition ID"),
  sequence_no: z.number().int().positive("Sequence number must be positive").default(1),
  product_id: z.string().uuid("Invalid product ID"),
  product_name: z.string().min(1, "Product name is required"),
  requested_qty: z.number()
    .positive("Requested quantity must be greater than 0")
    .refine(
      (val) => {
        const decimalPlaces = val.toString().split('.')[1]?.length || 0;
        return decimalPlaces <= 5;
      },
      { message: "Requested quantity cannot exceed 5 decimal places" }
    ),
  approved_qty: z.number()
    .min(0, "Approved quantity cannot be negative")
    .refine(
      (val) => {
        const decimalPlaces = val.toString().split('.')[1]?.length || 0;
        return decimalPlaces <= 5;
      },
      { message: "Approved quantity cannot exceed 5 decimal places" }
    )
    .optional()
    .nullable(),
  issued_qty: z.number()
    .min(0, "Issued quantity cannot be negative")
    .refine(
      (val) => {
        const decimalPlaces = val.toString().split('.')[1]?.length || 0;
        return decimalPlaces <= 5;
      },
      { message: "Issued quantity cannot exceed 5 decimal places" }
    )
    .optional()
    .nullable(),
  last_action: z.enum(['submitted', 'approved', 'reviewed', 'rejected']).optional().nullable(),
  approved_message: z.string().optional().nullable(),
  reject_message: z.string()
    .min(10, "Rejection reason must be at least 10 characters")
    .optional()
    .nullable(),
  approved_by_id: z.string().uuid().optional().nullable(),
  approved_date_at: z.date().optional().nullable()
}).refine(
  (data) => {
    if (data.approved_qty !== null && data.approved_qty !== undefined) {
      return data.approved_qty <= data.requested_qty;
    }
    return true;
  },
  {
    message: "Approved quantity cannot exceed requested quantity",
    path: ["approved_qty"]
  }
).refine(
  (data) => {
    if (data.issued_qty !== null && data.issued_qty !== undefined &&
        data.approved_qty !== null && data.approved_qty !== undefined) {
      return data.issued_qty <= data.approved_qty;
    }
    return true;
  },
  {
    message: "Issued quantity cannot exceed approved quantity",
    path: ["issued_qty"]
  }
).refine(
  (data) => {
    if (data.last_action === 'rejected') {
      return data.reject_message && data.reject_message.length >= 10;
    }
    return true;
  },
  {
    message: "Rejection reason is required when rejecting line item",
    path: ["reject_message"]
  }
);

export type LineItem = z.infer<typeof LineItemSchema>;
```

### 6.3 CreateRequisitionSchema

```typescript
export const CreateRequisitionSchema = z.object({
  header: RequisitionHeaderSchema.omit({
    id: true,
    sr_no: true,
    doc_status: true,
    doc_version: true,
    created_at: true,
    created_by_id: true,
    updated_at: true,
    updated_by_id: true
  }),
  line_items: z.array(LineItemSchema.omit({
    id: true,
    store_requisition_id: true,
    approved_qty: true,
    issued_qty: true,
    last_action: true,
    approved_message: true,
    reject_message: true,
    approved_by_id: true,
    approved_date_at: true
  }))
    .min(1, "At least one line item is required")
    .max(100, "Cannot exceed 100 line items per requisition")
    .refine(
      (items) => {
        const productIds = items.map(item => item.product_id);
        const uniqueIds = new Set(productIds);
        return productIds.length === uniqueIds.size;
      },
      {
        message: "Duplicate products are not allowed. Combine quantities for same product."
      }
    )
});

export type CreateRequisitionInput = z.infer<typeof CreateRequisitionSchema>;
```

### 6.4 UpdateRequisitionSchema

```typescript
export const UpdateRequisitionSchema = z.object({
  id: z.string().uuid("Invalid requisition ID"),
  doc_version: z.number().min(0, "Invalid document version"),
  header: RequisitionHeaderSchema.omit({
    id: true,
    sr_no: true,
    created_at: true,
    created_by_id: true
  }).partial(),
  line_items: z.array(LineItemSchema.omit({
    store_requisition_id: true,
    approved_qty: true,
    issued_qty: true,
    last_action: true,
    approved_message: true,
    reject_message: true,
    approved_by_id: true,
    approved_date_at: true
  })).optional()
}).refine(
  (data) => {
    if (data.line_items) {
      const productIds = data.line_items.map(item => item.product_id);
      const uniqueIds = new Set(productIds);
      return productIds.length === uniqueIds.size;
    }
    return true;
  },
  {
    message: "Duplicate products are not allowed",
    path: ["line_items"]
  }
);

export type UpdateRequisitionInput = z.infer<typeof UpdateRequisitionSchema>;
```

### 6.5 SubmitRequisitionSchema

```typescript
export const SubmitRequisitionSchema = z.object({
  id: z.string().uuid("Invalid requisition ID"),
  doc_version: z.number().min(0, "Invalid document version")
});

export type SubmitRequisitionInput = z.infer<typeof SubmitRequisitionSchema>;
```

### 6.6 ApproveRequisitionSchema

```typescript
export const ApproveRequisitionSchema = z.object({
  id: z.string().uuid("Invalid requisition ID"),
  doc_version: z.number().min(0, "Invalid document version"),
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: "Action must be 'approve' or 'reject'" })
  }),
  line_items: z.array(z.object({
    id: z.string().uuid("Invalid line item ID"),
    action: z.enum(['approve', 'reject']),
    approved_qty: z.number()
      .min(0, "Approved quantity cannot be negative")
      .optional(),
    approved_message: z.string().optional(),
    reject_message: z.string()
      .min(10, "Rejection reason must be at least 10 characters")
      .optional()
  })).min(1, "At least one line item action required")
}).refine(
  (data) => {
    return data.line_items.every(item => {
      if (item.action === 'reject') {
        return item.reject_message && item.reject_message.length >= 10;
      }
      return true;
    });
  },
  {
    message: "Rejection reason required for rejected items",
    path: ["line_items"]
  }
);

export type ApproveRequisitionInput = z.infer<typeof ApproveRequisitionSchema>;
```

### 6.7 IssueItemsSchema

```typescript
export const IssueItemsSchema = z.object({
  id: z.string().uuid("Invalid requisition ID"),
  doc_version: z.number().min(0, "Invalid document version"),
  line_items: z.array(z.object({
    id: z.string().uuid("Invalid line item ID"),
    issue_qty: z.number()
      .positive("Issue quantity must be greater than 0")
      .refine(
        (val) => {
          const decimalPlaces = val.toString().split('.')[1]?.length || 0;
          return decimalPlaces <= 5;
        },
        { message: "Issue quantity cannot exceed 5 decimal places" }
      ),
    inventory_transaction_id: z.string().uuid().optional()
  })).min(1, "At least one line item to issue required")
});

export type IssueItemsInput = z.infer<typeof IssueItemsSchema>;
```

### 6.8 SearchRequisitionSchema

```typescript
export const SearchRequisitionSchema = z.object({
  sr_no: z.string().optional(),
  doc_status: z.enum(['draft', 'in_progress', 'completed', 'cancelled', 'voided']).optional(),
  from_location_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  requestor_id: z.string().uuid().optional(),
  sr_date_from: z.date().optional(),
  sr_date_to: z.date().optional(),
  expected_date_from: z.date().optional(),
  expected_date_to: z.date().optional(),
  page: z.number().int().positive().default(1),
  page_size: z.number().int().positive().max(100).default(20),
  sort_by: z.enum(['sr_no', 'sr_date', 'expected_date', 'doc_status']).default('sr_date'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
}).refine(
  (data) => {
    if (data.sr_date_from && data.sr_date_to) {
      return data.sr_date_to >= data.sr_date_from;
    }
    return true;
  },
  {
    message: "SR Date To must be after or equal to SR Date From",
    path: ["sr_date_to"]
  }
).refine(
  (data) => {
    if (data.expected_date_from && data.expected_date_to) {
      return data.expected_date_to >= data.expected_date_from;
    }
    return true;
  },
  {
    message: "Expected Date To must be after or equal to Expected Date From",
    path: ["expected_date_to"]
  }
);

export type SearchRequisitionInput = z.infer<typeof SearchRequisitionSchema>;
```

---

## 7. Validation Error Messages Catalog

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

### Complete Error Messages by Category

#### Required Field Errors (VAL-SR-001 to 010)

| Code | Message | Context |
|------|---------|---------|
| VAL-SR-001 | Store Requisition number must be in format SR-YYYY-NNNN | Auto-generated, user shouldn't see |
| VAL-SR-002 | SR Date is required | User must select date |
| VAL-SR-003 | Expected date must be after SR date | User must adjust dates |
| VAL-SR-004 | Description must be at least 10 characters / Description cannot exceed 500 characters | User must adjust length |
| VAL-SR-005 | Invalid document status | System error |
| VAL-SR-006 | From location is required | User must select location |
| VAL-SR-007 | No approval workflow found for this requisition | Contact administrator |
| VAL-SR-008 | Requestor information is missing | System error |
| VAL-SR-009 | Department is required | User must select department |
| VAL-SR-010 | This requisition has been modified by another user. Please refresh and try again. | User must refresh |

#### Line Item Errors (VAL-SR-020 to 024)

| Code | Message | Context |
|------|---------|---------|
| VAL-SR-020 | Product is required for each line item | User must select product |
| VAL-SR-021 | Requested quantity is required / Requested quantity must be greater than 0 / Requested quantity cannot exceed 5 decimal places | User must enter valid quantity |
| VAL-SR-022 | Approved quantity cannot exceed requested quantity / Approved quantity cannot be negative | Approver must adjust quantity |
| VAL-SR-023 | Issued quantity cannot exceed approved quantity / Issued quantity cannot be negative | Storekeeper must adjust quantity |
| VAL-SR-024 | Line item sequence numbers must be unique | System error |

#### Business Rule Errors (VAL-SR-101 to 112)

| Code | Message | Context |
|------|---------|---------|
| VAL-SR-101 | At least one line item is required to submit requisition | User must add items |
| VAL-SR-102 | Cannot exceed 100 line items per requisition | User must create separate requisition |
| VAL-SR-103 | Product {product_name} already exists in this requisition | User must update existing line or remove duplicate |
| VAL-SR-104 | Cannot edit requisition after submission. Status: {current_status} | User cannot edit |
| VAL-SR-105 | Cannot submit: Missing required fields: {field_list} | User must complete fields |
| VAL-SR-106 | You do not have authority to approve requisitions from {department_name} | User cannot approve |
| VAL-SR-107 | Requisition is at stage {current_stage}. Cannot approve stage {attempted_stage} | User must wait for current stage |
| VAL-SR-108 | Rejection reason is required and must be at least 10 characters | User must provide reason |
| VAL-SR-109 | Insufficient stock for {product_name}. Available: {available}, Requested: {requested} | Storekeeper must adjust or defer |
| VAL-SR-110 | Cannot issue {new_qty}. Remaining approved quantity: {remaining} | Storekeeper must issue within limit |
| VAL-SR-111 | Cannot cancel completed requisition / Cannot cancel requisition with issued items. Use void instead. | User must use void |
| VAL-SR-112 | {count} items not fully issued. Cannot mark as completed. | Storekeeper must issue remaining |

#### Cross-Field Errors (VAL-SR-201 to 204)

| Code | Message | Context |
|------|---------|---------|
| VAL-SR-201 | Expected date must be after SR date | User must adjust dates |
| VAL-SR-202 | Approved quantity cannot exceed requested quantity / Issued quantity cannot exceed approved quantity | User must adjust quantities |
| VAL-SR-203 | Rejection reason is required | User must provide message |
| VAL-SR-204 | Invalid workflow stage transition from {previous} to {current} | System error |

#### Security Errors (VAL-SR-301 to 307)

| Code | Message | Context |
|------|---------|---------|
| VAL-SR-301 | You do not have permission to create store requisitions | User lacks permission |
| VAL-SR-302 | You can only edit your own requisitions | User not owner |
| VAL-SR-303 | You are not authorized to approve this requisition at current stage | User not assigned approver |
| VAL-SR-304 | You do not have permission to issue items from this location | User lacks permission |
| VAL-SR-305 | You do not have access to the selected department/location | User lacks access |
| VAL-SR-306 | Input contains invalid or potentially harmful content | User must remove content |
| VAL-SR-307 | Audit information missing | System error |

### Error Severity Levels

| Level | When to Use | Display |
|-------|-------------|---------|
| Error | Blocks submission/progress | Red icon, red border, red text |
| Warning | Should be corrected but not blocking | Yellow icon, yellow border |
| Info | Helpful guidance | Blue icon, normal border |

---

## 8. Validation Testing Matrix

| Error Code | Rule Name | Fields | Type | Client | Server | DB | Test Cases |
|------------|-----------|--------|------|--------|--------|----|------------|
| VAL-SR-001 | SR Number Format | sr_no | Field | ✅ | ✅ | ✅ | 5 |
| VAL-SR-002 | SR Date Required | sr_date | Field | ✅ | ✅ | ❌ | 4 |
| VAL-SR-003 | Expected Date | expected_date | Field | ✅ | ✅ | ❌ | 4 |
| VAL-SR-004 | Description Length | description | Field | ✅ | ✅ | ❌ | 6 |
| VAL-SR-005 | Doc Status Enum | doc_status | Field | ✅ | ✅ | ✅ | 6 |
| VAL-SR-006 | Location Required | from_location_id | Field | ✅ | ✅ | ✅ | 4 |
| VAL-SR-007 | Workflow Assignment | workflow_id | Field | ❌ | ✅ | ❌ | 3 |
| VAL-SR-008 | Requestor Required | requestor_id | Field | ✅ | ✅ | ❌ | 3 |
| VAL-SR-009 | Department Required | department_id | Field | ✅ | ✅ | ❌ | 3 |
| VAL-SR-010 | Version Check | doc_version | Field | ✅ | ✅ | ❌ | 2 |
| VAL-SR-020 | Product Required | product_id | Field | ✅ | ✅ | ✅ | 4 |
| VAL-SR-021 | Requested Qty | requested_qty | Field | ✅ | ✅ | ✅ | 6 |
| VAL-SR-022 | Approved Qty Range | approved_qty | Field | ✅ | ✅ | ❌ | 6 |
| VAL-SR-023 | Issued Qty Tracking | issued_qty | Field | ✅ | ✅ | ❌ | 5 |
| VAL-SR-024 | Sequence Unique | sequence_no | Field | ✅ | ✅ | ❌ | 3 |
| VAL-SR-101 | Min Line Items | line_items | Business | ✅ | ✅ | ❌ | 2 |
| VAL-SR-102 | Max Line Items | line_items | Business | ✅ | ✅ | ❌ | 2 |
| VAL-SR-103 | Duplicate Product | product_id | Business | ✅ | ✅ | ❌ | 2 |
| VAL-SR-104 | Draft Edit Only | doc_status | Business | ✅ | ✅ | ❌ | 3 |
| VAL-SR-105 | Complete Check | multiple | Business | ✅ | ✅ | ❌ | 2 |
| VAL-SR-106 | Approval Authority | approver | Security | ✅ | ✅ | ✅ | 3 |
| VAL-SR-107 | Stage Sequence | workflow_stage | Business | ✅ | ✅ | ❌ | 3 |
| VAL-SR-108 | Reject Message | reject_message | Business | ✅ | ✅ | ❌ | 3 |
| VAL-SR-109 | Stock Available | inventory | Business | ⚠️ | ✅ | ❌ | 3 |
| VAL-SR-110 | Partial Issuance | issued_qty | Business | ✅ | ✅ | ❌ | 3 |
| VAL-SR-111 | Cancel Restriction | doc_status | Business | ✅ | ✅ | ❌ | 3 |
| VAL-SR-112 | Complete Criteria | line_items | Business | ✅ | ✅ | ❌ | 2 |
| VAL-SR-201 | Date Range | dates | Cross-field | ✅ | ✅ | ❌ | 4 |
| VAL-SR-202 | Qty Relationship | quantities | Cross-field | ✅ | ✅ | ❌ | 5 |
| VAL-SR-203 | Message Consistency | messages | Cross-field | ✅ | ✅ | ❌ | 3 |
| VAL-SR-204 | Workflow Stages | workflow | Cross-field | ✅ | ✅ | ❌ | 2 |
| VAL-SR-301 | Create Permission | permissions | Security | ✅ | ✅ | ✅ | 2 |
| VAL-SR-302 | Update Permission | permissions | Security | ✅ | ✅ | ✅ | 3 |
| VAL-SR-303 | Approve Permission | permissions | Security | ✅ | ✅ | ✅ | 3 |
| VAL-SR-304 | Issue Permission | permissions | Security | ✅ | ✅ | ✅ | 3 |
| VAL-SR-305 | Dept/Loc Access | permissions | Security | ✅ | ✅ | ✅ | 3 |
| VAL-SR-306 | Input Sanitization | text_fields | Security | ✅ | ✅ | ✅ | 5 |
| VAL-SR-307 | Audit Trail | audit_fields | Security | ❌ | ✅ | ✅ | 2 |

**Legend**:
- ✅ Enforced at this layer
- ❌ Not enforced at this layer
- ⚠️ Partial enforcement (display only)

**Total Test Cases Required**: 135+

---

## 9. Database Constraints Summary

### Table: tb_store_requisition

| Constraint Type | Columns | Description |
|----------------|---------|-------------|
| PRIMARY KEY | id | UUID primary key |
| UNIQUE | sr_no | Business key uniqueness |
| INDEX | sr_no | Performance optimization |
| FOREIGN KEY | from_location_id | References tb_location (optional) |
| FOREIGN KEY | workflow_id | References tb_workflow (optional) |
| ENUM | doc_status | Allowed values enforced |
| ENUM | last_action | Allowed values enforced |
| DEFAULT | doc_status | 'draft' |
| DEFAULT | doc_version | 0 |
| DEFAULT | created_at | now() |
| DEFAULT | updated_at | now() |

### Table: tb_store_requisition_detail

| Constraint Type | Columns | Description |
|----------------|---------|-------------|
| PRIMARY KEY | id | UUID primary key |
| FOREIGN KEY | store_requisition_id | References tb_store_requisition |
| FOREIGN KEY | product_id | References product table |
| ENUM | last_action | Allowed values enforced |
| DEFAULT | sequence_no | 1 |
| DECIMAL | requested_qty | DECIMAL(20,5) |
| DECIMAL | approved_qty | DECIMAL(20,5) |
| DECIMAL | issued_qty | DECIMAL(20,5) |

---

## 10. Related Documents

- **Business Requirements**: [BR-store-requisitions.md](./BR-store-requisitions.md) - Business rules, functional requirements, and backend specifications
- **Use Cases**: [UC-store-requisitions.md](./UC-store-requisitions.md) - User scenarios and workflows
- **Technical Specification**: [TS-store-requisitions.md](./TS-store-requisitions.md) - System architecture and components
- **Data Definition**: [DD-store-requisitions.md](./DD-store-requisitions.md) - Database entity descriptions
- **Flow Diagrams**: [FD-store-requisitions.md](./FD-store-requisitions.md) - Visual workflow diagrams
- **Backend Requirements**: [BR-store-requisitions.md#10-backend-requirements](./BR-store-requisitions.md#10-backend-requirements) - API endpoints, server actions (Section 10 of BR)
- **Prisma Schema**: `/docs/app/data-struc/schema.prisma` - Authoritative database schema
- **Inventory Operations Shared Method**: [SM-inventory-operations.md](../../shared-methods/inventory-operations/SM-inventory-operations.md) - Inventory transaction patterns
- **Costing Methods Shared Method**: [SM-costing-methods.md](../../shared-methods/inventory-valuation/SM-costing-methods.md) - FIFO/AVG costing validation

---

**Document Control**:
- **Created**: 2025-11-12
- **Author**: Documentation Team
- **Reviewed By**: Business Analyst, QA Lead, Security Team, Technical Lead
- **Approved By**: Product Owner, Technical Architect
- **Next Review**: 2025-12-12
- **Version History**:
  - v1.0.0 (2025-11-12): Initial comprehensive validation rules document

---

## Appendix: Quick Reference

### Critical Validations Checklist

**Before Submission**:
- [ ] At least 1 line item added
- [ ] All required fields populated
- [ ] Expected date after SR date
- [ ] No duplicate products
- [ ] All quantities > 0

**Before Approval**:
- [ ] User is assigned approver for current stage
- [ ] Approved quantities <= requested quantities
- [ ] Rejection messages provided for rejected items (min 10 chars)
- [ ] All approved quantities >= 0

**Before Issuance**:
- [ ] User has issuance permission
- [ ] Sufficient stock available
- [ ] Issue quantities <= remaining approved quantities
- [ ] Cumulative issued <= approved

**Before Completion**:
- [ ] All approved items fully issued
- [ ] No pending issuances
- [ ] All workflow stages completed

---

**End of Document**
