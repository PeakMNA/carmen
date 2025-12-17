# VAL-APPR: My Approvals Validation Rules

**Module**: Procurement
**Sub-Module**: My Approvals
**Document Type**: Validations (VAL)
**Version**: 1.0.0
**Last Updated**: 2025-11-12
**Status**: Draft

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

### 1.1 Purpose

This document defines comprehensive validation rules for the My Approvals module, which provides a centralized approval interface for all document types in Carmen ERP. Validations ensure:

- **Data Integrity**: All approval actions are valid and traceable
- **Authority Enforcement**: Users can only approve within their authority limits
- **Workflow Compliance**: Status transitions follow defined approval workflows
- **Security**: No unauthorized access or self-approvals
- **Audit Trail**: All actions are properly logged with tamper-evidence

### 1.2 Scope

This document defines validation rules across three layers:
- **Client-Side**: Immediate user feedback and UX validation (React Hook Form + Zod)
- **Server-Side**: Security and business rule enforcement (Server Actions + Zod)
- **Database**: Final data integrity constraints (PostgreSQL CHECK constraints, RLS)

### 1.3 Validation Strategy

```
User Input
    ↓
[Client-Side Validation] ← Immediate feedback, UX
    ↓
[Server-Side Validation] ← Security, business rules, authority checks
    ↓
[Database Constraints] ← Final enforcement, RLS policies
    ↓
Data Stored
```

**Validation Principles**:
1. Never trust client-side data - always validate on server
2. Validate approval authority before every action
3. Enforce workflow state transitions
4. Prevent self-approvals at all layers
5. Use clear, actionable error messages
6. Maintain immutable audit trail

---

## 2. Field-Level Validations (VAL-APPR-001 to 099)

### Entity: approval_queue_items

#### VAL-APPR-001: document_id - Required UUID

**Field**: `document_id`
**Database Column**: `approval_queue_items.document_id`
**Data Type**: UUID / string (UUID format)

**Validation Rule**: Document ID is mandatory and must reference an existing document.

**Implementation Requirements**:
- **Client-Side**: Hidden field populated from document context. No user interaction.
- **Server-Side**: Validate UUID format. Verify document exists in source table based on document_type.
- **Database**: Column defined as UUID NOT NULL. Foreign key enforced via application logic (polymorphic).

**Error Code**: VAL-APPR-001
**Error Message**: "Document ID is required and must be valid"
**User Action**: System error - user should not encounter this. Log and investigate.

**Test Cases**:
- ✅ Valid: "550e8400-e29b-41d4-a716-446655440000"
- ❌ Invalid: null
- ❌ Invalid: "invalid-uuid"
- ❌ Invalid: "999e8400-e29b-41d4-a716-446655440000" (non-existent document)

---

#### VAL-APPR-002: document_type - Required Enum

**Field**: `document_type`
**Database Column**: `approval_queue_items.document_type`
**Data Type**: VARCHAR(50) / enum string

**Validation Rule**: Document type must be one of the supported approval document types.

**Allowed Values**:
- purchase_request
- purchase_order
- grn
- credit_note
- wastage
- stock_requisition
- inventory_adjustment
- stock_transfer

**Implementation Requirements**:
- **Client-Side**: Populated from document context. Validated against enum.
- **Server-Side**: Strict enum validation. Reject if not in allowed list.
- **Database**: CHECK constraint on allowed values.

**Error Code**: VAL-APPR-002
**Error Message**: "Invalid document type: {provided_value}"
**User Action**: System error - contact administrator.

**Test Cases**:
- ✅ Valid: "purchase_request"
- ✅ Valid: "grn"
- ❌ Invalid: "invoice" (not supported)
- ❌ Invalid: null

---

#### VAL-APPR-003: approver_user_id - Required UUID

**Field**: `approver_user_id`
**Database Column**: `approval_queue_items.approver_user_id`
**Data Type**: UUID / string (UUID format)

**Validation Rule**: Approver must be a valid, active user with approval authority for this document type.

**Implementation Requirements**:
- **Client-Side**: Hidden field populated from user session. No user interaction.
- **Server-Side**: Validate user exists, is active, has approval authority for document_type and amount. Check approval_authority_matrix table.
- **Database**: Foreign key to users(id) ON DELETE RESTRICT. NOT NULL constraint.

**Error Code**: VAL-APPR-003
**Error Message**: "Invalid approver or insufficient authority"
**User Action**: Contact administrator to verify approval permissions.

**Authority Validation Logic**:
1. Query approval_authority_matrix WHERE (user_id = approver_user_id OR role_id = user_role_id)
2. Filter by document_type AND approval_level
3. Verify document amount <= maximum_amount (or unlimited_authority = true)
4. Verify effective_start_date <= today <= effective_end_date (or end_date IS NULL)
5. Verify is_active = true

**Test Cases**:
- ✅ Valid: Active user with authority >= document amount
- ❌ Invalid: null
- ❌ Invalid: Inactive user
- ❌ Invalid: User with authority < document amount
- ❌ Invalid: User without approval_authority_matrix entry for document_type

---

#### VAL-APPR-004: status - Required Enum with State Transitions

**Field**: `status`
**Database Column**: `approval_queue_items.status`
**Data Type**: VARCHAR(50) / enum string

**Validation Rule**: Status must be valid enum value and follow allowed state transitions.

**Allowed Values**:
- pending
- under_review
- approved
- rejected
- returned
- awaiting_info
- recalled

**Default Value**: pending

**Implementation Requirements**:
- **Client-Side**: Display status badge. Users cannot directly change status (controlled by actions).
- **Server-Side**: Validate enum value. Enforce state transition rules (see VAL-APPR-201).
- **Database**: CHECK constraint on allowed values. Default 'pending'.

**Error Code**: VAL-APPR-004
**Error Message**: "Invalid status value: {provided_value}"
**User Action**: System error - status should be set by workflow actions only.

**Test Cases**:
- ✅ Valid: "pending"
- ✅ Valid: "approved"
- ❌ Invalid: "processing" (not in enum)
- ❌ Invalid: null

---

#### VAL-APPR-005: total_amount - Required Numeric (Non-negative)

**Field**: `total_amount`
**Database Column**: `approval_queue_items.total_amount`
**Data Type**: NUMERIC(15,2) / number

**Validation Rule**: Total amount must be non-negative with maximum 2 decimal places.

**Implementation Requirements**:
- **Client-Side**: Display formatted amount (read-only, populated from document).
- **Server-Side**: Validate non-negative. Verify matches source document total.
- **Database**: CHECK constraint total_amount >= 0. NUMERIC(15,2) enforces precision.

**Error Code**: VAL-APPR-005
**Error Message**: "Total amount must be zero or positive"
**User Action**: System error - amount should match source document.

**Special Cases**:
- Zero amount allowed (e.g., sample requests, returns)
- Maximum value: 9,999,999,999,999.99
- Rounding: Always round to 2 decimal places using banker's rounding

**Test Cases**:
- ✅ Valid: 0.00
- ✅ Valid: 1234.56
- ✅ Valid: 9999999999999.99
- ❌ Invalid: -100.00 (negative)
- ❌ Invalid: 123.456 (too many decimals)
- ❌ Invalid: null

---

#### VAL-APPR-006: approval_level_required - Required Integer (1-10)

**Field**: `approval_level_required`
**Database Column**: `approval_queue_items.approval_level_required`
**Data Type**: INTEGER / number

**Validation Rule**: Required approval level must be between 1 and 10 inclusive.

**Implementation Requirements**:
- **Client-Side**: Display approval progress (e.g., "Level 2 of 3"). Read-only.
- **Server-Side**: Validate range 1-10. Determined by workflow configuration based on document_type and amount.
- **Database**: CHECK constraint approval_level_required BETWEEN 1 AND 10.

**Error Code**: VAL-APPR-006
**Error Message**: "Approval level required must be between 1 and 10"
**User Action**: System error - contact workflow administrator.

**Test Cases**:
- ✅ Valid: 1
- ✅ Valid: 5
- ✅ Valid: 10
- ❌ Invalid: 0
- ❌ Invalid: 11
- ❌ Invalid: null

---

#### VAL-APPR-007: current_approval_level - Required Integer (1 to approval_level_required)

**Field**: `current_approval_level`
**Database Column**: `approval_queue_items.current_approval_level`
**Data Type**: INTEGER / number

**Validation Rule**: Current approval level must be between 1 and approval_level_required inclusive.

**Implementation Requirements**:
- **Client-Side**: Display current level in approval progress indicator.
- **Server-Side**: Validate 1 <= current_approval_level <= approval_level_required. Increment on approval.
- **Database**: CHECK constraint current_approval_level BETWEEN 1 AND approval_level_required.

**Error Code**: VAL-APPR-007
**Error Message**: "Current approval level must be between 1 and required level"
**User Action**: System error - workflow state corruption.

**Test Cases** (assuming approval_level_required = 3):
- ✅ Valid: 1
- ✅ Valid: 2
- ✅ Valid: 3
- ❌ Invalid: 0
- ❌ Invalid: 4 (exceeds required)
- ❌ Invalid: null

---

#### VAL-APPR-008: priority - Required Enum

**Field**: `priority`
**Database Column**: `approval_queue_items.priority`
**Data Type**: VARCHAR(20) / enum string

**Validation Rule**: Priority must be one of: urgent, high, normal, low.

**Default Value**: normal

**Implementation Requirements**:
- **Client-Side**: Display priority badge with appropriate color (urgent=red, high=orange, normal=blue, low=gray).
- **Server-Side**: Validate enum value. Determine priority based on document flags and SLA configuration.
- **Database**: CHECK constraint on allowed values. Default 'normal'.

**Error Code**: VAL-APPR-008
**Error Message**: "Invalid priority value: {provided_value}"
**User Action**: System error - priority set by system rules.

**Priority Determination Logic**:
- urgent: document.is_urgent = true OR SLA deadline < 4 hours
- high: document.priority = 'high' OR SLA deadline < 24 hours
- normal: default
- low: document.priority = 'low'

**Test Cases**:
- ✅ Valid: "urgent"
- ✅ Valid: "normal"
- ❌ Invalid: "critical" (not in enum)
- ❌ Invalid: null

---

#### VAL-APPR-009: sla_deadline - Optional DateTime

**Field**: `sla_deadline`
**Database Column**: `approval_queue_items.sla_deadline`
**Data Type**: TIMESTAMPTZ / Date

**Validation Rule**: If provided, SLA deadline must be after submission_timestamp and calculated using business hours.

**Implementation Requirements**:
- **Client-Side**: Display deadline with countdown timer. Show "overdue" badge if past deadline.
- **Server-Side**: Calculate based on approval_sla_configuration. Validate deadline > submission_timestamp. Handle business hours calculation.
- **Database**: No constraint (calculated field, can be null).

**Error Code**: VAL-APPR-009
**Error Message**: "SLA deadline must be after submission date"
**User Action**: System error - SLA misconfiguration.

**SLA Calculation Rules**:
1. Retrieve SLA config for document_type and priority
2. Get target_approval_hours from config
3. Apply business_hours_start, business_hours_end, business_days
4. Exclude holidays if exclude_holidays = true
5. Set deadline = submission_timestamp + target hours in business time

**Test Cases**:
- ✅ Valid: null (no SLA configured)
- ✅ Valid: submission_timestamp + 48 business hours
- ❌ Invalid: submission_timestamp - 1 hour (before submission)

---

#### VAL-APPR-010: is_delegated - Boolean

**Field**: `is_delegated`
**Database Column**: `approval_queue_items.is_delegated`
**Data Type**: BOOLEAN / boolean

**Validation Rule**: Must be true if delegation_id is populated, false otherwise.

**Implementation Requirements**:
- **Client-Side**: Display "Delegated" badge if true.
- **Server-Side**: Auto-set based on delegation_id. Validate consistency.
- **Database**: CHECK constraint: (is_delegated = true AND delegation_id IS NOT NULL) OR (is_delegated = false AND delegation_id IS NULL).

**Error Code**: VAL-APPR-010
**Error Message**: "Delegation flag inconsistent with delegation ID"
**User Action**: System error - data integrity issue.

**Test Cases**:
- ✅ Valid: is_delegated = false, delegation_id = null
- ✅ Valid: is_delegated = true, delegation_id = "550e8400-..."
- ❌ Invalid: is_delegated = true, delegation_id = null
- ❌ Invalid: is_delegated = false, delegation_id = "550e8400-..."

---

### Entity: approval_actions

#### VAL-APPR-011: action_type - Required Enum

**Field**: `action_type`
**Database Column**: `approval_actions.action_type`
**Data Type**: VARCHAR(50) / enum string

**Validation Rule**: Action type must be one of the allowed approval actions.

**Allowed Values**:
- approve
- reject
- request_info
- return
- delegate
- partial_approve
- recall

**Implementation Requirements**:
- **Client-Side**: Action buttons trigger different action_types. Validate on button click.
- **Server-Side**: Strict enum validation. Validate action is allowed for current status.
- **Database**: CHECK constraint on allowed values. NOT NULL.

**Error Code**: VAL-APPR-011
**Error Message**: "Invalid action type: {provided_value}"
**User Action**: System error - contact support.

**Test Cases**:
- ✅ Valid: "approve"
- ✅ Valid: "reject"
- ❌ Invalid: "cancel" (not in enum)
- ❌ Invalid: null

---

#### VAL-APPR-012: action_comments - Optional Text (Max 500 chars)

**Field**: `action_comments`
**Database Column**: `approval_actions.action_comments`
**Data Type**: TEXT / string

**Validation Rule**: Optional comments with maximum 500 characters.

**Implementation Requirements**:
- **Client-Side**: Textarea with character counter. Max length 500. Optional for approve, required for reject (see VAL-APPR-013).
- **Server-Side**: Validate length <= 500. Trim whitespace. Sanitize HTML/scripts.
- **Database**: TEXT column (no length limit, enforced in app).

**Error Code**: VAL-APPR-012
**Error Message**: "Comments cannot exceed 500 characters (current: {count})"
**User Action**: Shorten comments to 500 characters or less.

**Test Cases**:
- ✅ Valid: null (for approve action)
- ✅ Valid: "Approved as per budget allocation" (35 chars)
- ✅ Valid: 500 character comment
- ❌ Invalid: 501 character comment

---

#### VAL-APPR-013: rejection_reason - Conditional Required Text (20-500 chars)

**Field**: `rejection_reason`
**Database Column**: `approval_actions.rejection_reason`
**Data Type**: TEXT / string

**Validation Rule**: Required when action_type = 'reject'. Must be 20-500 characters after trimming.

**Rationale**: Rejections must be documented with clear reasons for audit trail and requestor feedback.

**Implementation Requirements**:
- **Client-Side**: Textarea shown only when reject button clicked. Min 20, max 500 chars. Required field indicator. Character counter.
- **Server-Side**: If action_type = 'reject', validate rejection_reason is provided and trimmed length >= 20 and <= 500. Sanitize input.
- **Database**: TEXT column. Application enforces conditional requirement.

**Error Code**: VAL-APPR-013
**Error Message**:
- If missing: "Rejection reason is required when rejecting a document"
- If too short: "Rejection reason must be at least 20 characters (current: {count})"
- If too long: "Rejection reason cannot exceed 500 characters (current: {count})"

**User Action**: Provide detailed rejection reason explaining why document was rejected.

**Test Cases**:
- ✅ Valid (action_type = 'reject'): "Budget allocation exhausted for this quarter, please resubmit next period" (75 chars)
- ❌ Invalid (action_type = 'reject'): "Not approved" (12 chars - too short)
- ❌ Invalid (action_type = 'reject'): null (missing)
- ✅ Valid (action_type = 'approve'): null (not required for approve)

---

#### VAL-APPR-014: info_request_text - Conditional Required Text (20-1000 chars)

**Field**: `info_request_text`
**Database Column**: `approval_actions.info_request_text`
**Data Type**: TEXT / string

**Validation Rule**: Required when action_type = 'request_info'. Must be 20-1000 characters after trimming.

**Rationale**: Information requests must clearly specify what information is needed.

**Implementation Requirements**:
- **Client-Side**: Textarea shown when "Request Info" clicked. Min 20, max 1000 chars. Required field indicator. Character counter.
- **Server-Side**: If action_type = 'request_info', validate text is provided and 20 <= trimmed length <= 1000. Sanitize input.
- **Database**: TEXT column. Application enforces conditional requirement.

**Error Code**: VAL-APPR-014
**Error Message**:
- If missing: "Please specify what additional information is required"
- If too short: "Information request must be at least 20 characters (current: {count})"
- If too long: "Information request cannot exceed 1000 characters (current: {count})"

**User Action**: Clearly describe what additional information or clarification is needed from the requestor.

**Test Cases**:
- ✅ Valid (action_type = 'request_info'): "Please provide detailed justification for the budget increase and attach quotes from at least 3 vendors" (120 chars)
- ❌ Invalid (action_type = 'request_info'): "More info needed" (16 chars - too short)
- ❌ Invalid (action_type = 'request_info'): null (missing)
- ✅ Valid (action_type = 'approve'): null (not required for approve)

---

#### VAL-APPR-015: info_request_deadline - Conditional Required DateTime

**Field**: `info_request_deadline`
**Database Column**: `approval_actions.info_request_deadline`
**Data Type**: TIMESTAMPTZ / Date

**Validation Rule**: Required when action_type = 'request_info'. Must be between now and 30 days in the future.

**Implementation Requirements**:
- **Client-Side**: Date picker shown when "Request Info" clicked. Min date = tomorrow, max date = today + 30 days. Required field indicator.
- **Server-Side**: If action_type = 'request_info', validate deadline is provided, > current timestamp, and <= current timestamp + 30 days.
- **Database**: TIMESTAMPTZ column. Application enforces conditional requirement.

**Error Code**: VAL-APPR-015
**Error Message**:
- If missing: "Deadline for information request is required"
- If too soon: "Deadline must be at least 1 day from now"
- If too far: "Deadline cannot be more than 30 days from now"
- If in past: "Deadline cannot be in the past"

**User Action**: Set reasonable deadline for requestor to provide the requested information.

**Test Cases**:
- ✅ Valid (action_type = 'request_info'): tomorrow
- ✅ Valid (action_type = 'request_info'): today + 7 days
- ❌ Invalid (action_type = 'request_info'): today (too soon)
- ❌ Invalid (action_type = 'request_info'): today + 31 days (too far)
- ❌ Invalid (action_type = 'request_info'): null (missing)
- ✅ Valid (action_type = 'approve'): null (not required)

---

#### VAL-APPR-016: partial_approval_reason - Conditional Required Text (20+ chars)

**Field**: `partial_approval_reason`
**Database Column**: `approval_actions.partial_approval_reason`
**Data Type**: TEXT / string

**Validation Rule**: Required when action_type = 'partial_approve'. Must be at least 20 characters after trimming.

**Implementation Requirements**:
- **Client-Side**: Textarea shown in partial approval dialog. Min 20 chars. Required field indicator.
- **Server-Side**: If action_type = 'partial_approve', validate reason provided and trimmed length >= 20.
- **Database**: TEXT column. Application enforces conditional requirement.

**Error Code**: VAL-APPR-016
**Error Message**:
- If missing: "Reason for partial approval is required"
- If too short: "Partial approval reason must be at least 20 characters (current: {count})"

**User Action**: Explain why only partial approval is being granted (e.g., budget constraints, stock limitations).

**Test Cases**:
- ✅ Valid (action_type = 'partial_approve'): "Only $5000 available in current budget allocation, remaining $2000 to be approved next quarter" (105 chars)
- ❌ Invalid (action_type = 'partial_approve'): "Budget limit" (12 chars - too short)
- ❌ Invalid (action_type = 'partial_approve'): null (missing)
- ✅ Valid (action_type = 'approve'): null (not required)

---

#### VAL-APPR-017: override_justification - Conditional Required Text (50+ chars)

**Field**: `override_justification`
**Database Column**: `approval_actions.override_justification`
**Data Type**: TEXT / string

**Validation Rule**: Required when is_policy_override = true. Must be at least 50 characters after trimming.

**Rationale**: Policy overrides are exceptions that require detailed justification for compliance and audit.

**Implementation Requirements**:
- **Client-Side**: Textarea shown in override dialog. Min 50 chars. Required field indicator. Warning message about override implications.
- **Server-Side**: If is_policy_override = true, validate justification provided and trimmed length >= 50.
- **Database**: TEXT column. Application enforces conditional requirement.

**Error Code**: VAL-APPR-017
**Error Message**:
- If missing: "Policy override requires detailed justification (minimum 50 characters)"
- If too short: "Override justification must be at least 50 characters (current: {count})"

**User Action**: Provide comprehensive justification for why normal policy is being overridden (e.g., emergency situation, executive directive).

**Examples of Valid Justifications**:
- "Emergency procurement required due to equipment failure impacting production. CEO approval obtained via email dated 2025-11-12. Production loss estimated at $10,000 per day." (178 chars)
- "Budget exceeded due to unforeseen price increase from vendor. CFO has approved additional allocation from contingency fund. See attached email approval." (155 chars)

**Test Cases**:
- ✅ Valid (is_policy_override = true): 50+ character detailed justification
- ❌ Invalid (is_policy_override = true): "Emergency" (9 chars - too short)
- ❌ Invalid (is_policy_override = true): null (missing)
- ✅ Valid (is_policy_override = false): null (not required)

---

### Entity: approval_delegations

#### VAL-APPR-018: delegator_user_id - Required UUID

**Field**: `delegator_user_id`
**Database Column**: `approval_delegations.delegator_user_id`
**Data Type**: UUID / string (UUID format)

**Validation Rule**: Must be valid UUID referencing active user who has approval authority.

**Implementation Requirements**:
- **Client-Side**: Populated from current user session. Hidden field.
- **Server-Side**: Validate user exists, is active, has approval authority to delegate. Cannot delegate to self.
- **Database**: Foreign key to users(id) ON DELETE CASCADE. NOT NULL.

**Error Code**: VAL-APPR-018
**Error Message**: "Invalid delegator user or insufficient authority"
**User Action**: Only users with approval authority can create delegations.

**Test Cases**:
- ✅ Valid: Active user with approval authority
- ❌ Invalid: null
- ❌ Invalid: Inactive user
- ❌ Invalid: User without approval authority
- ❌ Invalid: Same as delegate_user_id (self-delegation)

---

#### VAL-APPR-019: delegate_user_id - Required UUID (Different from Delegator)

**Field**: `delegate_user_id`
**Database Column**: `approval_delegations.delegate_user_id`
**Data Type**: UUID / string (UUID format)

**Validation Rule**: Must be valid UUID referencing active user. Cannot be same as delegator_user_id. Delegate must have approval authority >= delegator or >= maximum_amount_limit.

**Implementation Requirements**:
- **Client-Side**: User picker showing eligible delegates only. Cannot select self.
- **Server-Side**: Validate user exists, is active, delegate_user_id != delegator_user_id. Check delegate has sufficient authority.
- **Database**: Foreign key to users(id) ON DELETE CASCADE. NOT NULL. CHECK constraint delegate_user_id != delegator_user_id.

**Error Code**: VAL-APPR-019
**Error Message**:
- If same user: "Cannot delegate to yourself"
- If insufficient authority: "Delegate must have approval authority at least equal to your authority or the specified limit"
- If not found: "Selected delegate user not found or inactive"

**User Action**: Select different active user with appropriate approval authority.

**Authority Validation Logic**:
1. Get delegator's max approval authority from approval_authority_matrix
2. Get delegate's max approval authority from approval_authority_matrix
3. If maximum_amount_limit specified: verify delegate_authority >= maximum_amount_limit
4. Else: verify delegate_authority >= delegator_authority

**Test Cases**:
- ✅ Valid: Different active user with authority >= delegator
- ❌ Invalid: null
- ❌ Invalid: Same as delegator_user_id
- ❌ Invalid: User with authority < maximum_amount_limit
- ❌ Invalid: Inactive user

---

#### VAL-APPR-020: start_datetime and end_datetime - Required Date Range

**Fields**: `start_datetime`, `end_datetime`
**Database Columns**: `approval_delegations.start_datetime`, `approval_delegations.end_datetime`
**Data Type**: TIMESTAMPTZ / Date

**Validation Rule**:
- Both required
- end_datetime must be after start_datetime
- Maximum delegation period: 90 days
- start_datetime can be now (immediate) or future (scheduled)
- end_datetime must be in future

**Implementation Requirements**:
- **Client-Side**: Date range picker. Min start = now, max end = start + 90 days. Show duration calculation.
- **Server-Side**: Validate both dates provided, end > start, duration <= 90 days, end > now.
- **Database**: TIMESTAMPTZ NOT NULL columns. CHECK constraint end_datetime > start_datetime.

**Error Code**: VAL-APPR-020
**Error Messages**:
- If start missing: "Delegation start date is required"
- If end missing: "Delegation end date is required"
- If end <= start: "End date must be after start date"
- If duration > 90: "Delegation period cannot exceed 90 days (current: {days} days)"
- If end in past: "End date must be in the future"

**User Action**: Select valid date range within 90-day limit.

**Test Cases**:
- ✅ Valid: start = now, end = now + 7 days
- ✅ Valid: start = tomorrow, end = tomorrow + 14 days
- ✅ Valid: start = now, end = now + 90 days (maximum)
- ❌ Invalid: end = start (no duration)
- ❌ Invalid: end < start
- ❌ Invalid: end = start + 91 days (exceeds limit)
- ❌ Invalid: end = yesterday (in past)

---

#### VAL-APPR-021: delegation_scope - Required Enum

**Field**: `delegation_scope`
**Database Column**: `approval_delegations.delegation_scope`
**Data Type**: VARCHAR(50) / enum string

**Validation Rule**: Must be one of: all_documents, specific_types, specific_departments.

**Implementation Requirements**:
- **Client-Side**: Radio buttons for scope selection. Show conditional fields based on selection.
- **Server-Side**: Validate enum value. Verify consistency with document_types and departments fields.
- **Database**: CHECK constraint on allowed values. NOT NULL.

**Error Code**: VAL-APPR-021
**Error Message**: "Invalid delegation scope: {provided_value}"
**User Action**: Select valid scope option.

**Conditional Field Rules**:
- If all_documents: document_types and departments must be null or empty
- If specific_types: document_types required (non-empty array), departments must be null or empty
- If specific_departments: departments required (non-empty array), document_types must be null or empty

**Test Cases**:
- ✅ Valid: "all_documents"
- ✅ Valid: "specific_types" + document_types = ['purchase_request']
- ✅ Valid: "specific_departments" + departments = [dept_uuid]
- ❌ Invalid: "all" (not in enum)
- ❌ Invalid: null

---

#### VAL-APPR-022: maximum_amount_limit - Optional Numeric (Positive)

**Field**: `maximum_amount_limit`
**Database Column**: `approval_delegations.maximum_amount_limit`
**Data Type**: NUMERIC(15,2) / number

**Validation Rule**: Optional. If provided, must be positive. Cannot exceed delegator's approval authority (unless delegator has unlimited authority).

**Implementation Requirements**:
- **Client-Side**: Numeric input. Optional. Show delegator's authority limit for reference. Validate <= delegator limit.
- **Server-Side**: If provided, validate > 0 and <= delegator's max authority (unless unlimited).
- **Database**: CHECK constraint maximum_amount_limit > 0.

**Error Code**: VAL-APPR-022
**Error Messages**:
- If negative or zero: "Amount limit must be positive"
- If exceeds authority: "Amount limit cannot exceed your approval authority (max: {delegator_max})"

**User Action**: Enter valid amount within your approval authority or leave blank for unlimited (up to your authority).

**Special Cases**:
- null = delegate has same authority as delegator (up to delegator's limit)
- If delegator has unlimited authority, any positive limit is valid

**Test Cases** (assuming delegator max = $50,000):
- ✅ Valid: null (inherit delegator's authority)
- ✅ Valid: 10000.00
- ✅ Valid: 50000.00 (delegator's limit)
- ❌ Invalid: 0.00 (not positive)
- ❌ Invalid: -100.00 (negative)
- ❌ Invalid: 60000.00 (exceeds delegator's authority)

---

#### VAL-APPR-023: delegation_reason - Required Text (10-500 chars)

**Field**: `delegation_reason`
**Database Column**: `approval_delegations.delegation_reason`
**Data Type**: TEXT / string

**Validation Rule**: Required. Must be 10-500 characters after trimming.

**Rationale**: All delegations must be documented with reason for audit and compliance.

**Implementation Requirements**:
- **Client-Side**: Textarea with character counter. Min 10, max 500. Required field indicator.
- **Server-Side**: Validate present and 10 <= trimmed length <= 500.
- **Database**: TEXT column. NOT NULL enforced in app.

**Error Code**: VAL-APPR-023
**Error Messages**:
- If missing: "Delegation reason is required"
- If too short: "Reason must be at least 10 characters (current: {count})"
- If too long: "Reason cannot exceed 500 characters (current: {count})"

**User Action**: Provide clear reason for delegation (e.g., vacation, medical leave, business trip).

**Examples**:
- "Annual leave from 2025-11-15 to 2025-11-22"
- "Business trip to Singapore for vendor negotiations"
- "Medical leave - doctor's appointment and recovery"

**Test Cases**:
- ✅ Valid: "Annual vacation leave" (22 chars)
- ❌ Invalid: "Vacation" (8 chars - too short)
- ❌ Invalid: null (missing)
- ❌ Invalid: 501 character string

---

### Entity: approval_sla_configuration

#### VAL-APPR-024: target_approval_hours - Required Positive Numeric

**Field**: `target_approval_hours`
**Database Column**: `approval_sla_configuration.target_approval_hours`
**Data Type**: NUMERIC(8,2) / number

**Validation Rule**: Required. Must be positive. Represents business hours.

**Implementation Requirements**:
- **Client-Side**: Numeric input. Min 0.01. Show equivalent business days calculation.
- **Server-Side**: Validate > 0.
- **Database**: CHECK constraint target_approval_hours > 0. NOT NULL.

**Error Code**: VAL-APPR-024
**Error Messages**:
- If missing: "Target approval hours is required"
- If non-positive: "Target hours must be greater than zero"

**User Action**: Enter positive number representing approval time target in business hours.

**Examples**:
- 4.0 = 4 business hours (half day)
- 8.0 = 1 business day
- 24.0 = 3 business days
- 168.0 = 21 business days (approx 1 calendar month)

**Test Cases**:
- ✅ Valid: 0.5 (30 minutes)
- ✅ Valid: 8.0 (1 day)
- ✅ Valid: 168.0 (21 days)
- ❌ Invalid: 0.0
- ❌ Invalid: -8.0 (negative)
- ❌ Invalid: null

---

#### VAL-APPR-025: escalation_threshold_percent - Integer Range (50-100)

**Field**: `escalation_threshold_percent`
**Database Column**: `approval_sla_configuration.escalation_threshold_percent`
**Data Type**: INTEGER / number

**Validation Rule**: Must be integer between 50 and 100 inclusive. Represents % of SLA elapsed before escalation.

**Implementation Requirements**:
- **Client-Side**: Slider or number input. Min 50, max 100. Default 80. Show escalation time calculation.
- **Server-Side**: Validate 50 <= value <= 100.
- **Database**: CHECK constraint escalation_threshold_percent BETWEEN 50 AND 100.

**Error Code**: VAL-APPR-025
**Error Messages**:
- If < 50: "Escalation threshold cannot be less than 50%"
- If > 100: "Escalation threshold cannot exceed 100%"

**User Action**: Select percentage between 50% and 100% for when escalation should trigger.

**Common Values**:
- 75% = Escalate at 75% of SLA time elapsed
- 80% = Default, escalate at 80%
- 90% = Late escalation, more time before escalating
- 100% = Escalate only when SLA breached

**Test Cases**:
- ✅ Valid: 50
- ✅ Valid: 80 (default)
- ✅ Valid: 100
- ❌ Invalid: 49
- ❌ Invalid: 101
- ❌ Invalid: null

---

### Entity: approval_authority_matrix

#### VAL-APPR-026: user_id OR role_id - Conditional Required UUID

**Fields**: `user_id`, `role_id`
**Database Columns**: `approval_authority_matrix.user_id`, `approval_authority_matrix.role_id`
**Data Type**: UUID / string (UUID format)

**Validation Rule**: Exactly one of user_id or role_id must be populated (not both, not neither).

**Rationale**: Authority can be assigned to specific user OR to a role, but not both simultaneously.

**Implementation Requirements**:
- **Client-Side**: Radio button to select user-based or role-based. Show appropriate picker. Disable the other field.
- **Server-Side**: Validate exactly one is populated. Validate referenced user/role exists and is active.
- **Database**: CHECK constraint (user_id IS NOT NULL AND role_id IS NULL) OR (user_id IS NULL AND role_id IS NOT NULL).

**Error Code**: VAL-APPR-026
**Error Messages**:
- If both null: "Either user or role must be selected"
- If both populated: "Cannot assign authority to both user and role simultaneously"
- If user not found: "Selected user not found or inactive"
- If role not found: "Selected role not found"

**User Action**: Select either a specific user OR a role to assign authority.

**Test Cases**:
- ✅ Valid: user_id = "550e8400...", role_id = null
- ✅ Valid: user_id = null, role_id = "660e8400..."
- ❌ Invalid: user_id = null, role_id = null (neither)
- ❌ Invalid: user_id = "550e8400...", role_id = "660e8400..." (both)

---

#### VAL-APPR-027: minimum_amount and maximum_amount - Amount Range

**Fields**: `minimum_amount`, `maximum_amount`
**Database Columns**: `approval_authority_matrix.minimum_amount`, `approval_authority_matrix.maximum_amount`
**Data Type**: NUMERIC(15,2) / number

**Validation Rule**:
- minimum_amount required, must be >= 0
- maximum_amount optional (null = unlimited)
- If maximum_amount provided: must be > minimum_amount

**Implementation Requirements**:
- **Client-Side**: Two numeric inputs. Checkbox for "Unlimited". Validate max > min.
- **Server-Side**: Validate min >= 0. If max provided, validate max > min.
- **Database**: CHECK constraints minimum_amount >= 0, maximum_amount > minimum_amount (when not null).

**Error Code**: VAL-APPR-027
**Error Messages**:
- If min < 0: "Minimum amount cannot be negative"
- If max <= min: "Maximum amount must be greater than minimum amount"
- If min missing: "Minimum amount is required"

**User Action**: Enter valid amount range or check "Unlimited" for no upper limit.

**Examples**:
- min = 0, max = 5000: Authority for $0 to $5,000
- min = 5000, max = 50000: Authority for $5,000.01 to $50,000
- min = 0, max = null: Unlimited authority (any amount)

**Test Cases**:
- ✅ Valid: min = 0, max = 1000
- ✅ Valid: min = 0, max = null (unlimited)
- ✅ Valid: min = 1000, max = 5000
- ❌ Invalid: min = -100 (negative)
- ❌ Invalid: min = 1000, max = 500 (max <= min)
- ❌ Invalid: min = null (missing)

---

#### VAL-APPR-028: effective_start_date and effective_end_date - Date Range

**Fields**: `effective_start_date`, `effective_end_date`
**Database Columns**: `approval_authority_matrix.effective_start_date`, `approval_authority_matrix.effective_end_date`
**Data Type**: DATE / Date

**Validation Rule**:
- effective_start_date required
- effective_end_date optional (null = no expiration)
- If end_date provided: must be > start_date

**Implementation Requirements**:
- **Client-Side**: Date pickers. Checkbox for "No expiration". Validate end > start.
- **Server-Side**: Validate start provided. If end provided, validate end > start.
- **Database**: NOT NULL on start_date. CHECK constraint end_date > start_date (when not null).

**Error Code**: VAL-APPR-028
**Error Messages**:
- If start missing: "Effective start date is required"
- If end <= start: "End date must be after start date"

**User Action**: Select valid date range for authority or leave end date blank for permanent authority.

**Examples**:
- start = 2025-01-01, end = null: Permanent authority from 2025-01-01
- start = 2025-01-01, end = 2025-12-31: Authority for calendar year 2025
- start = today, end = today + 90 days: Temporary 90-day authority

**Test Cases**:
- ✅ Valid: start = 2025-01-01, end = null
- ✅ Valid: start = 2025-01-01, end = 2025-12-31
- ❌ Invalid: start = null (missing)
- ❌ Invalid: start = 2025-12-31, end = 2025-01-01 (end before start)
- ❌ Invalid: start = 2025-01-01, end = 2025-01-01 (equal)

---

## 3. Business Rule Validations (VAL-APPR-101 to 199)

### VAL-APPR-101: No Self-Approval

**Rule ID**: BR-APPR-002 (from BR document)
**Rule Description**: Users cannot approve documents they created or submitted.

**Business Justification**: Prevents conflict of interest and ensures proper segregation of duties. Critical for financial and operational controls.

**Validation Logic**:
1. When user attempts approval action
2. Retrieve document's requestor_user_id from approval_queue_items
3. Compare with current user's user_id (approver_user_id)
4. If requestor_user_id = approver_user_id, reject action

**When Validated**: Before any approval action (approve, partial_approve)

**Implementation Requirements**:
- **Client-Side**: Disable approval buttons if current_user_id = requestor_user_id. Show "Cannot approve own request" tooltip.
- **Server-Side**: Always validate. Reject action if self-approval attempted. Log attempt for security audit.
- **Database**: Not enforceable at DB level (requires application logic).

**Error Code**: VAL-APPR-101
**Error Message**: "You cannot approve documents you created. Please request approval from appropriate authority."
**User Action**: Contact supervisor or another approver to review the document.

**Related Business Requirements**: BR-APPR-002

**Examples**:

**Scenario 1: Valid Case - Different Users**
- Requestor: user_id = "aaa-111"
- Approver: user_id = "bbb-222"
- Result: ✅ Validation passes (different users)

**Scenario 2: Invalid Case - Self-Approval Attempt**
- Requestor: user_id = "aaa-111"
- Approver: user_id = "aaa-111"
- Result: ❌ Validation fails
- Error: "You cannot approve documents you created"
- User must: Request approval from different user

**Scenario 3: Valid Case - Delegated Approval**
- Requestor: user_id = "aaa-111"
- Original Approver: user_id = "aaa-111" (same as requestor)
- Delegate Approver: user_id = "ccc-333" (different)
- Result: ✅ Validation passes (delegate is different from requestor)

---

### VAL-APPR-102: Approval Authority Validation

**Rule ID**: BR-APPR-001 (from BR document)
**Rule Description**: Users can only approve documents within their authority limits as defined in approval_authority_matrix.

**Business Justification**: Ensures proper financial controls and prevents unauthorized approvals beyond user's authority level.

**Validation Logic**:
1. Get document amount (total_amount) and document_type from approval_queue_items
2. Get current approval level (current_approval_level)
3. Query approval_authority_matrix WHERE:
   - (user_id = approver_user_id OR role_id = user_role_id)
   - AND document_type = queue_item.document_type
   - AND approval_level = queue_item.current_approval_level
   - AND is_active = true
   - AND effective_start_date <= today
   - AND (effective_end_date >= today OR effective_end_date IS NULL)
4. Check authority:
   - If unlimited_authority = true: approve any amount
   - Else: verify document.total_amount >= minimum_amount AND document.total_amount <= maximum_amount
5. If no matching authority record or amount exceeds limit, reject

**When Validated**: Before every approval action

**Implementation Requirements**:
- **Client-Side**: Show user's authority limit for reference. Warn if document amount exceeds authority.
- **Server-Side**: Always validate before approval. Query authority matrix. Compare amounts.
- **Database**: Not fully enforceable (requires application logic for complex checks).

**Error Code**: VAL-APPR-102
**Error Message**: "Insufficient approval authority. This document requires approval from user with authority of at least {required_amount}. Your authority: {user_authority}."
**User Action**: Route to appropriate approver with sufficient authority or request authority increase.

**Related Business Requirements**: BR-APPR-001

**Examples**:

**Scenario 1: Valid - Within Authority**
- Document amount: $10,000
- User authority: $0 - $50,000
- Result: ✅ Passes (amount within range)

**Scenario 2: Valid - Unlimited Authority**
- Document amount: $500,000
- User authority: Unlimited
- Result: ✅ Passes (unlimited)

**Scenario 3: Invalid - Exceeds Authority**
- Document amount: $60,000
- User authority: $0 - $50,000
- Result: ❌ Fails
- Error: "Insufficient approval authority. Required: $60,000. Your authority: $50,000."
- User must: Route to General Manager or VP with higher authority

**Scenario 4: Invalid - No Authority for Document Type**
- Document type: purchase_order
- User authority: Only for purchase_request
- Result: ❌ Fails
- Error: "You do not have approval authority for this document type"
- User must: Contact administrator to assign appropriate authority

**Scenario 5: Invalid - Authority Expired**
- Document date: 2025-11-12
- User authority effective_end_date: 2025-10-31
- Result: ❌ Fails
- Error: "Your approval authority expired on 2025-10-31"
- User must: Contact administrator to renew authority

---

### VAL-APPR-103: Status Transition Validation

**Rule ID**: BR-APPR-009, BR-APPR-010 (from BR document)
**Rule Description**: Queue item status transitions must follow defined workflow rules.

**Business Justification**: Ensures workflow integrity and prevents invalid state changes that could bypass controls.

**Allowed Transitions**:
```
pending → under_review, recalled
under_review → approved, rejected, returned, awaiting_info
awaiting_info → under_review (resume), recalled
approved → [TERMINAL] (or pending if next level)
rejected → [TERMINAL]
returned → [TERMINAL]
recalled → [TERMINAL]
```

**Validation Logic**:
1. Get current status from approval_queue_items
2. Determine target status based on action_type:
   - approve → approved (or pending if next level exists)
   - reject → rejected
   - request_info → awaiting_info
   - return → returned
   - recall → recalled
3. Check if transition (current_status → target_status) is allowed
4. If not in allowed list, reject

**When Validated**: Before every action that changes status

**Implementation Requirements**:
- **Client-Side**: Show only valid action buttons based on current status. Disable invalid actions.
- **Server-Side**: Validate transition before applying status change. Reject invalid transitions.
- **Database**: Not fully enforceable (complex state machine, application logic required).

**Error Code**: VAL-APPR-103
**Error Message**: "Invalid status transition: Cannot change from '{current_status}' to '{target_status}'"
**User Action**: Refresh page and attempt appropriate action for current status.

**Related Business Requirements**: BR-APPR-009, BR-APPR-010

**Examples**:

**Scenario 1: Valid - Approve from Under Review**
- Current status: under_review
- Action: approve
- Target status: approved
- Result: ✅ Passes (valid transition)

**Scenario 2: Valid - Request Info from Under Review**
- Current status: under_review
- Action: request_info
- Target status: awaiting_info
- Result: ✅ Passes (valid transition)

**Scenario 3: Invalid - Approve Already Approved**
- Current status: approved
- Action: approve
- Target status: approved
- Result: ❌ Fails
- Error: "Cannot approve an already approved document"
- User must: Refresh page to see current status

**Scenario 4: Invalid - Reject Recalled Document**
- Current status: recalled
- Action: reject
- Target status: rejected
- Result: ❌ Fails
- Error: "Cannot reject a recalled document"
- User must: Document is already in terminal state

**Scenario 5: Valid - Recall from Awaiting Info**
- Current status: awaiting_info
- Action: recall
- Target status: recalled
- Result: ✅ Passes (requestor can recall while awaiting info)

---

### VAL-APPR-104: Sequential Approval Level Validation

**Rule ID**: BR-APPR-008 (from BR document)
**Rule Description**: Approvals must be obtained in sequential order. Cannot skip levels.

**Business Justification**: Maintains proper approval hierarchy and ensures all required reviewers have opportunity to review.

**Validation Logic**:
1. Get current_approval_level and approval_level_required from approval_queue_items
2. Verify current_approval_level >= 1 AND current_approval_level <= approval_level_required
3. On approval:
   - If current_approval_level < approval_level_required:
     * Increment to current_approval_level + 1
     * Create new queue_item for next level approver
     * Update status to 'pending' for next level
   - If current_approval_level = approval_level_required:
     * Mark as final approval
     * Update document status to 'approved'
     * No further approvals needed
4. Cannot approve if current_approval_level > user's assigned level

**When Validated**: Before approval action, when determining next approver

**Implementation Requirements**:
- **Client-Side**: Display approval level progress (e.g., "Level 2 of 3"). Show approval chain.
- **Server-Side**: Validate current level. Increment level on approval. Route to next level if needed.
- **Database**: CHECK constraint current_approval_level <= approval_level_required.

**Error Code**: VAL-APPR-104
**Error Message**: "Invalid approval level. This document is currently at level {current_level} of {required_levels}."
**User Action**: Wait for appropriate level approver or contact workflow administrator.

**Related Business Requirements**: BR-APPR-008

**Examples**:

**Scenario 1: Valid - First Level Approval**
- Current level: 1
- Required levels: 3
- Action: Level 1 approver approves
- Result: ✅ Passes
- Next action: Increment to level 2, route to Level 2 approver

**Scenario 2: Valid - Final Level Approval**
- Current level: 3
- Required levels: 3
- Action: Level 3 approver approves
- Result: ✅ Passes
- Next action: Mark document as fully approved, no further routing

**Scenario 3: Invalid - Skip Level**
- Current level: 1
- Approver authority: Level 3 approver
- Action: Attempt to approve at level 3
- Result: ❌ Fails
- Error: "Cannot skip approval levels. Level 1 approval is pending."
- User must: Wait for Level 1 and Level 2 approvals first

**Scenario 4: Valid - Rejection at Any Level**
- Current level: 2
- Required levels: 3
- Action: Level 2 approver rejects
- Result: ✅ Passes
- Next action: Document marked as rejected, workflow terminates

---

### VAL-APPR-105: Delegation Authority Validation

**Rule ID**: BR-APPR-025 (from BR document)
**Rule Description**: Delegates can only approve within the scope and limits of the delegation.

**Business Justification**: Ensures delegated approvals stay within granted authority and don't exceed delegator's intent.

**Validation Logic**:
1. If is_delegated = true on approval_queue_items:
2. Retrieve delegation record from approval_delegations using delegation_id
3. Verify delegation is active:
   - status = 'active'
   - current timestamp BETWEEN start_datetime AND end_datetime
   - is_active = true
4. Check delegation scope:
   - If delegation_scope = 'all_documents': any document allowed
   - If delegation_scope = 'specific_types': verify document_type IN delegation.document_types array
   - If delegation_scope = 'specific_departments': verify document.department_id IN delegation.departments array
5. Check amount limit:
   - If maximum_amount_limit IS NULL: use delegator's authority limit
   - If maximum_amount_limit IS NOT NULL: verify document.total_amount <= maximum_amount_limit
6. Reject if any check fails

**When Validated**: Before approval action when delegation is active

**Implementation Requirements**:
- **Client-Side**: Show "Acting as delegate for {delegator_name}" indicator. Show delegation scope and limits.
- **Server-Side**: Full delegation validation before allowing action. Log all delegated approvals separately.
- **Database**: Foreign key delegation_id. Application enforces scope/limit checks.

**Error Code**: VAL-APPR-105
**Error Messages**:
- If delegation expired: "Delegation has expired. End date: {end_datetime}"
- If out of scope: "This document type is not included in your delegation scope"
- If exceeds limit: "Document amount ${amount} exceeds delegation limit of ${limit}"
- If delegation not active: "Delegation is not currently active"

**User Action**: Contact delegator to extend delegation, increase limit, or expand scope. Or route to appropriate approver.

**Related Business Requirements**: BR-APPR-025, BR-APPR-026

**Examples**:

**Scenario 1: Valid - Within Delegation Scope and Limit**
- Delegation scope: specific_types = ['purchase_request', 'grn']
- Maximum limit: $10,000
- Document: purchase_request, amount = $5,000
- Delegation: active, current time within date range
- Result: ✅ Passes (type matches, amount within limit)

**Scenario 2: Invalid - Exceeds Amount Limit**
- Delegation maximum_amount_limit: $10,000
- Document amount: $15,000
- Result: ❌ Fails
- Error: "Document amount $15,000 exceeds delegation limit of $10,000"
- User must: Route to delegator or higher authority

**Scenario 3: Invalid - Document Type Not in Scope**
- Delegation scope: specific_types = ['purchase_request']
- Document type: 'credit_note'
- Result: ❌ Fails
- Error: "Credit notes are not included in your delegation scope"
- User must: Contact delegator to expand scope or route to appropriate approver

**Scenario 4: Invalid - Delegation Expired**
- Delegation end_datetime: 2025-11-10
- Current datetime: 2025-11-12
- Result: ❌ Fails
- Error: "Delegation expired on 2025-11-10"
- User must: Request new delegation or route to active approver

**Scenario 5: Valid - All Documents Scope**
- Delegation scope: 'all_documents'
- Maximum limit: null (inherit delegator's authority)
- Document: any type, amount within delegator's authority
- Result: ✅ Passes (unlimited scope, within authority)

---

### VAL-APPR-106: SLA Pause Validation

**Rule ID**: BR-APPR-012 (from BR document)
**Rule Description**: SLA should be paused when awaiting information from requestor and resumed when information provided.

**Business Justification**: Fair measurement of approval performance. Approval time shouldn't be penalized for delays caused by incomplete information.

**Validation Logic**:
1. When action_type = 'request_info':
   - Set sla_paused_at = current timestamp
   - Set status = 'awaiting_info'
   - SLA deadline calculation stops
2. When info provided (resume from awaiting_info):
   - Calculate pause_duration = resume_timestamp - sla_paused_at
   - Add pause_duration to sla_paused_duration
   - Extend sla_deadline by pause_duration
   - Set sla_paused_at = null
   - Update status to 'under_review'
3. SLA monitoring should exclude paused time from calculations
4. Multiple pause/resume cycles allowed (cumulative paused_duration)

**When Validated**: When requesting info and when resuming from awaiting_info status

**Implementation Requirements**:
- **Client-Side**: Show "SLA Paused" badge when awaiting_info. Display paused duration.
- **Server-Side**: Calculate pause duration. Adjust deadline. Validate state transitions.
- **Database**: sla_paused_at, sla_paused_duration fields. Application manages calculations.

**Error Code**: VAL-APPR-106
**Error Messages**:
- If pause without info request: "SLA can only be paused when requesting information"
- If resume without previous pause: "Cannot resume SLA that is not paused"

**User Action**: System-managed field. No direct user action.

**Related Business Requirements**: BR-APPR-012

**Examples**:

**Scenario 1: Valid - Pause SLA on Info Request**
- Original SLA deadline: 2025-11-15 17:00
- Info requested at: 2025-11-12 10:00
- Action: request_info
- Result: ✅ SLA paused at 10:00
- Next action: SLA monitoring stopped until resume

**Scenario 2: Valid - Resume SLA After Info Provided**
- SLA paused at: 2025-11-12 10:00
- Info provided at: 2025-11-13 14:00
- Pause duration: 28 hours
- Original deadline: 2025-11-15 17:00
- New deadline: 2025-11-15 17:00 + 28 hours = 2025-11-16 21:00
- Result: ✅ SLA resumed with adjusted deadline

**Scenario 3: Valid - Multiple Pause Cycles**
- Pause 1: 2025-11-12 to 2025-11-13 (24 hours)
- Pause 2: 2025-11-14 to 2025-11-15 (12 hours)
- Total paused: 36 hours
- Original deadline: 2025-11-18 17:00
- Adjusted deadline: 2025-11-20 05:00
- Result: ✅ Cumulative pause time applied

---

### VAL-APPR-107: Bulk Approval Consistency Validation

**Rule ID**: BR-APPR-029 (from BR document)
**Rule Description**: Bulk approvals must be atomic - all succeed or all fail. All documents must be same type and user must have authority for total.

**Business Justification**: Ensures consistency in bulk operations and prevents partial failures that could cause confusion.

**Validation Logic**:
1. Validate all documents in bulk are same document_type
2. Validate all documents currently in 'pending' or 'under_review' status
3. Validate user has authority for each individual document
4. Calculate total_bulk_amount = SUM(total_amount for all documents)
5. Validate user's authority >= total_bulk_amount
6. Validate no self-approvals in bulk (no document where requestor = current user)
7. Use database transaction (BEGIN...COMMIT/ROLLBACK)
8. If any validation fails or any document approval fails, rollback entire bulk operation

**When Validated**: Before bulk approval operation

**Implementation Requirements**:
- **Client-Side**: Show bulk selection count. Validate consistent type. Display total amount. Warn if authority exceeded.
- **Server-Side**: Wrap in transaction. Validate all checks before any approvals. Rollback on any failure.
- **Database**: Transaction ensures atomicity.

**Error Code**: VAL-APPR-107
**Error Messages**:
- If mixed types: "Bulk approval requires all documents to be the same type"
- If exceeds authority: "Total amount ${total} exceeds your approval authority of ${authority}"
- If includes self-approval: "Bulk selection includes {count} document(s) you created, which cannot be approved"
- If transaction fails: "Bulk approval failed. No documents were approved. Error: {error_details}"

**User Action**: Adjust selection to meet requirements or split into multiple bulk operations.

**Related Business Requirements**: BR-APPR-029

**Examples**:

**Scenario 1: Valid - Consistent Type, Within Authority**
- Documents: 5 purchase_requests
- Amounts: $1,000, $2,000, $1,500, $3,000, $2,500
- Total: $10,000
- User authority: $50,000
- None are self-approvals
- Result: ✅ All 5 approved atomically

**Scenario 2: Invalid - Mixed Document Types**
- Documents: 3 purchase_requests, 2 grns
- Result: ❌ Fails
- Error: "Bulk approval requires all documents to be same type"
- User must: Separate into two bulk operations (one for PRs, one for GRNs)

**Scenario 3: Invalid - Exceeds Authority**
- Documents: 10 purchase_requests
- Total: $60,000
- User authority: $50,000
- Result: ❌ Fails
- Error: "Total amount $60,000 exceeds your authority of $50,000"
- User must: Reduce selection or route to higher authority

**Scenario 4: Invalid - Includes Self-Approval**
- Documents: 8 purchase_requests
- 2 of them created by current user
- Result: ❌ Fails
- Error: "Bulk selection includes 2 document(s) you created"
- User must: Deselect own documents

**Scenario 5: Invalid - One Document Fails, All Rollback**
- Documents: 5 purchase_requests
- 4 pass all validations
- 1 fails (already approved by someone else concurrently)
- Result: ❌ All rollback
- Error: "Bulk approval failed. Document PR-2501-0123 was already approved."
- User must: Refresh and reselect documents

---

### VAL-APPR-108: Policy Override Authorization

**Rule ID**: BR-APPR-030 (from BR document)
**Rule Description**: Policy overrides require detailed justification and may require additional executive approval.

**Business Justification**: Exceptions to standard policies must be documented for audit, compliance, and risk management.

**Validation Logic**:
1. If is_policy_override = true:
2. Validate override_justification is provided and length >= 50 characters
3. Check user's allows_policy_override flag in approval_authority_matrix
4. For critical overrides (amount > threshold OR high-risk document type):
   - Require override_approver_user_id (executive approval)
   - Validate override_approver has executive role
   - Log override for audit
5. Record override in approval_actions with full details

**When Validated**: When user attempts approval with policy override flag

**Implementation Requirements**:
- **Client-Side**: "Override Policy" checkbox (only if user has permission). Required justification textarea (min 50 chars). Warning message about override implications. For critical overrides, require executive approval selection.
- **Server-Side**: Validate user has override permission. Validate justification length. For critical overrides, validate executive approver. Log comprehensively.
- **Database**: is_policy_override, override_justification, override_approver_user_id columns.

**Error Code**: VAL-APPR-108
**Error Messages**:
- If no permission: "You do not have permission to override policies"
- If justification missing: "Policy override requires detailed justification (minimum 50 characters)"
- If justification too short: "Override justification must be at least 50 characters (current: {count})"
- If executive approval missing: "This override requires executive approval. Please select an executive approver."

**User Action**: Provide detailed justification explaining why policy exception is necessary. For critical overrides, obtain executive pre-approval.

**Related Business Requirements**: BR-APPR-030

**Override Thresholds**:
- **Standard Override**: Amount <= $50,000, standard document types → User's override permission sufficient
- **Critical Override**: Amount > $50,000 OR high-risk types (credit_note, inventory_adjustment) → Requires executive approval

**Examples**:

**Scenario 1: Valid - Standard Override with Justification**
- Document: purchase_request, $10,000
- Budget: Exceeded by $2,000
- User has allows_policy_override = true
- Justification: "Emergency procurement required due to equipment failure impacting production line. CEO approval obtained via email dated 2025-11-12. Production downtime cost estimated at $15,000 per day. Budget increase will be requested in next quarter adjustment." (268 chars)
- Result: ✅ Override approved with justification logged

**Scenario 2: Invalid - No Override Permission**
- User has allows_policy_override = false
- Attempts policy override
- Result: ❌ Fails
- Error: "You do not have permission to override policies"
- User must: Route to authorized approver

**Scenario 3: Invalid - Insufficient Justification**
- is_policy_override = true
- override_justification = "Emergency situation" (19 chars)
- Result: ❌ Fails
- Error: "Override justification must be at least 50 characters (current: 19)"
- User must: Provide detailed explanation (who approved, why needed, business impact)

**Scenario 4: Valid - Critical Override with Executive Approval**
- Document: credit_note, $100,000
- Budget significantly exceeded
- User has override permission
- Justification: 150 characters
- override_approver_user_id = CFO's user_id
- Result: ✅ Critical override approved with executive authorization logged

**Scenario 5: Invalid - Critical Override Without Executive**
- Document: inventory_adjustment, $75,000
- is_policy_override = true
- override_justification = "Emergency adjustment needed due to stock discrepancy found during audit. Physical count shows shortage." (105 chars)
- override_approver_user_id = null
- Result: ❌ Fails
- Error: "This override requires executive approval. Please select an executive approver."
- User must: Obtain CFO or COO pre-approval and include their user_id

---

### VAL-APPR-109: Concurrent Modification Prevention (Optimistic Locking)

**Rule ID**: BR-APPR-032 (from BR document)
**Rule Description**: Use optimistic locking (doc_version) to prevent concurrent modification conflicts.

**Business Justification**: Prevents lost updates when multiple users attempt to approve the same document simultaneously.

**Validation Logic**:
1. Client reads queue_item with doc_version (e.g., doc_version = 5)
2. User takes approval action
3. Server receives action request with doc_version = 5
4. Server queries database for current doc_version
5. If current doc_version != provided doc_version:
   - Rejection: Document was modified by another user
   - Return current state to client
6. If doc_version matches:
   - Proceed with approval
   - Increment doc_version (5 → 6)
   - Update in single transaction
7. Client handles rejection by refreshing and showing current state

**When Validated**: Every update/approval action on approval_queue_items

**Implementation Requirements**:
- **Client-Side**: Include doc_version in every action request. Handle optimistic lock failure by refreshing queue. Show message "This document was just approved by another user. Refreshing..."
- **Server-Side**: Compare doc_version in request with current database value. Reject if mismatch. Increment doc_version on successful update. Use transaction to ensure atomicity.
- **Database**: doc_version column (INTEGER). Default 1. Increment on every update.

**Error Code**: VAL-APPR-109
**Error Message**: "This document was modified by another user. The page will refresh with the latest version."
**User Action**: No action needed. Page auto-refreshes. Review updated state and retry if needed.

**Related Business Requirements**: BR-APPR-032

**Examples**:

**Scenario 1: Valid - No Concurrent Modification**
- User A reads document at doc_version = 5
- User A approves
- Server checks: current doc_version still 5
- Server updates: doc_version = 6, status = approved
- Result: ✅ Approval succeeds

**Scenario 2: Invalid - Concurrent Approval Detected**
- User A reads document at doc_version = 5
- User B reads document at doc_version = 5
- User B approves first → doc_version becomes 6
- User A attempts approval with doc_version = 5
- Server checks: current doc_version is now 6
- Result: ❌ Fails with optimistic lock error
- Action: User A's page refreshes, shows document already approved by User B
- User A sees: "Document already approved by John Smith at 2025-11-12 10:30"

**Scenario 3: Valid - Sequential Approvals (Multi-Level)**
- Level 1: User A approves → doc_version 5 → 6
- Level 2: User B reads at doc_version = 6
- Level 2: User B approves → doc_version 6 → 7
- Result: ✅ Both approvals succeed sequentially

---

### VAL-APPR-110: Budget Integration Validation

**Rule ID**: BR-APPR-033 (from BR document)
**Rule Description**: For document types requiring budget checks, validate budget availability during approval.

**Business Justification**: Ensures approved commitments have corresponding budget allocation.

**Validation Logic**:
1. For document types requiring budget (purchase_request, purchase_order):
2. On approval action, call Budget System API:
   - Endpoint: POST /api/budget/check-availability
   - Params: budget_code, amount, fiscal_year, department
3. Validate response:
   - available_budget >= document_amount
   - budget period is active
   - budget is not frozen
4. If budget insufficient:
   - Allow policy override (if user has permission) with justification
   - Or reject approval
5. If budget available, proceed with approval
6. After approval, create budget commitment (async)

**When Validated**: During approval action for budget-tracked document types

**Implementation Requirements**:
- **Client-Side**: Show budget availability indicator. Warning if budget low. Policy override option if budget insufficient.
- **Server-Side**: Call Budget System API. Handle timeout (30s default). If API unavailable: allow with flag "pending_budget_verification". Retry budget check async. Validate response. Allow override with justification.
- **Database**: Not enforced (external system check).

**Error Code**: VAL-APPR-110
**Error Messages**:
- If budget unavailable: "Insufficient budget. Available: ${available}, Required: ${required}. Policy override required to proceed."
- If budget system down: "Budget system temporarily unavailable. Approval will proceed with pending verification flag."
- If budget frozen: "Budget code is currently frozen. Contact budget manager."

**User Action**: If budget insufficient: reduce amount, use different budget code, or override with justification. If system down: approval proceeds with pending verification.

**Related Business Requirements**: BR-APPR-033

**Budget Check API Response**:
```typescript
{
  budget_code: string
  available_budget: number
  committed_budget: number
  actual_spend: number
  total_budget: number
  is_sufficient: boolean
  is_active: boolean
  is_frozen: boolean
  fiscal_year: string
}
```

**Examples**:

**Scenario 1: Valid - Sufficient Budget**
- Document amount: $10,000
- Budget API response: available_budget = $50,000
- Result: ✅ Approval proceeds, budget commitment created

**Scenario 2: Invalid - Insufficient Budget, No Override**
- Document amount: $30,000
- Budget API response: available_budget = $5,000
- User does not have override permission
- Result: ❌ Approval rejected
- Error: "Insufficient budget. Available: $5,000, Required: $30,000"
- User must: Reduce amount, use different budget code, or route to authorized approver

**Scenario 3: Valid - Insufficient Budget with Override**
- Document amount: $30,000
- Budget API response: available_budget = $5,000
- User has override permission
- Override justification: "Emergency procurement approved by CFO. Additional budget allocation approved in Board meeting 2025-11-10. Budget amendment will be processed within 3 business days." (180 chars)
- Result: ✅ Approval proceeds with override flag, comprehensive logging

**Scenario 4: Valid - Budget System Unavailable**
- Document amount: $10,000
- Budget API: Timeout after 30 seconds
- Result: ✅ Approval proceeds with pending_budget_verification = true
- System: Async job retries budget check every 15 minutes for 24 hours
- Notification: Email to Finance team about pending verification

**Scenario 5: Invalid - Budget Frozen**
- Document amount: $10,000
- Budget API response: is_frozen = true, available_budget = $50,000
- Result: ❌ Approval rejected
- Error: "Budget code DEPT-2501-0001 is currently frozen. Contact budget manager."
- User must: Contact budget manager to unfreeze or use alternative budget code

---

## 4. Cross-Field Validations (VAL-APPR-201 to 299)

### VAL-APPR-201: Status Transition Matrix

**Fields Involved**: status (current), action_type, status (target)

**Validation Rule**: Status transitions must follow allowed state machine transitions.

**Business Justification**: Maintains workflow integrity and prevents invalid state changes.

**Validation Logic**: See detailed transition matrix below

**When Validated**: Before every action that changes status

**Implementation Requirements**:
- **Client-Side**: Show only valid action buttons based on current status
- **Server-Side**: Validate transition against matrix before applying
- **Database**: Application enforces (complex state machine)

**Error Code**: VAL-APPR-201
**Error Message**: "Invalid status transition: Cannot {action} from '{current_status}'"
**User Action**: Refresh page to see current status and available actions

**Status Transition Matrix**:

```
FROM pending:
  ✅ → under_review (user clicks to review)
  ✅ → recalled (requestor recalls)
  ❌ → approved (must review first)
  ❌ → rejected (must review first)
  ❌ → awaiting_info (must review first)
  ❌ → returned (must review first)

FROM under_review:
  ✅ → approved (approve action)
  ✅ → rejected (reject action)
  ✅ → awaiting_info (request_info action)
  ✅ → returned (return action)
  ✅ → pending (next level if multi-level approval)
  ❌ → recalled (cannot recall while under review)

FROM awaiting_info:
  ✅ → under_review (resume action after info provided)
  ✅ → recalled (requestor recalls)
  ❌ → approved (must resume review first)
  ❌ → rejected (must resume review first)

FROM approved:
  ✅ → pending (if next approval level exists)
  ✅ → [TERMINAL] (if final approval level)
  ❌ → Any other status (terminal state)

FROM rejected, returned, recalled:
  ❌ → Any status (terminal states, document must be resubmitted as new)
```

**Test Cases**:

**Valid Transitions**:
- pending → under_review: User starts reviewing
- under_review → approved: User approves
- under_review → awaiting_info: User requests info
- awaiting_info → under_review: Info provided, resume review
- approved → pending: Multi-level approval, route to next level

**Invalid Transitions**:
- pending → approved: Cannot approve without reviewing
- awaiting_info → rejected: Cannot reject without resuming review
- approved → rejected: Cannot reject an approved document
- recalled → approved: Cannot approve a recalled document

---

### VAL-APPR-202: Delegation Date Overlap Prevention

**Fields Involved**: delegator_user_id, start_datetime, end_datetime (for new delegation), existing delegations

**Validation Rule**: User cannot have overlapping delegations (same delegator, overlapping time periods).

**Business Justification**: Prevents confusion about which delegation is active and ensures clear authority chain.

**Validation Logic**:
1. When creating new delegation for delegator_user_id
2. Query existing active delegations WHERE:
   - delegator_user_id = new_delegation.delegator_user_id
   - status IN ('scheduled', 'active')
   - deleted_at IS NULL
3. For each existing delegation, check for date overlap:
   - Overlap exists if: (new_start < existing_end) AND (new_end > existing_start)
4. If any overlap found, reject new delegation

**When Validated**: Before creating or updating delegation

**Implementation Requirements**:
- **Client-Side**: Async validation when date range selected. Show existing delegations on calendar view. Highlight conflicts in red.
- **Server-Side**: Query for overlaps before INSERT/UPDATE. Reject if overlap detected.
- **Database**: UNIQUE constraint on (delegator_user_id, start_datetime, end_datetime) WHERE deleted_at IS NULL helps but doesn't cover all overlap cases. Application logic required.

**Error Code**: VAL-APPR-202
**Error Message**: "Delegation period overlaps with existing delegation to {delegate_name} from {existing_start} to {existing_end}"
**User Action**: Adjust dates to avoid overlap, or revoke existing delegation first, or end existing delegation early.

**Examples**:

**Valid - No Overlap**:
- Existing: 2025-11-01 to 2025-11-10
- New: 2025-11-11 to 2025-11-20
- Result: ✅ No overlap (gap between delegations)

**Valid - Sequential, No Gap**:
- Existing: 2025-11-01 to 2025-11-10 23:59:59
- New: 2025-11-11 00:00:00 to 2025-11-20
- Result: ✅ No overlap (sequential, no gap or overlap)

**Invalid - Partial Overlap (Start)**:
- Existing: 2025-11-05 to 2025-11-15
- New: 2025-11-01 to 2025-11-10
- Overlap: 2025-11-05 to 2025-11-10 (6 days)
- Result: ❌ Fails
- User must: End new delegation by 2025-11-04, or start it on 2025-11-16

**Invalid - Partial Overlap (End)**:
- Existing: 2025-11-01 to 2025-11-10
- New: 2025-11-05 to 2025-11-15
- Overlap: 2025-11-05 to 2025-11-10 (6 days)
- Result: ❌ Fails
- User must: Start new delegation on 2025-11-11

**Invalid - Complete Overlap (Contained)**:
- Existing: 2025-11-01 to 2025-11-30
- New: 2025-11-10 to 2025-11-20
- Overlap: Entire new period
- Result: ❌ Fails
- User must: Wait until existing delegation ends or revoke it

**Invalid - Complete Overlap (Contains)**:
- Existing: 2025-11-10 to 2025-11-20
- New: 2025-11-01 to 2025-11-30
- Overlap: Entire existing period
- Result: ❌ Fails
- User must: Revoke existing delegation first or adjust new dates

---

### VAL-APPR-203: Approval Chain Completeness

**Fields Involved**: document_type, total_amount, approval_level_required, approval routing configuration

**Validation Rule**: Before submission to approval queue, verify that approvers are configured for all required levels based on document type and amount.

**Business Justification**: Prevents documents from entering approval queue when workflow cannot be completed due to missing approvers.

**Validation Logic**:
1. When document submitted for approval
2. Determine approval_level_required based on:
   - Document type
   - Total amount
   - Workflow rules
3. For each level (1 to approval_level_required):
   - Query approval_authority_matrix for available approvers WHERE:
     * document_type matches
     * approval_level = current level
     * amount authority sufficient
     * is_active = true
     * effective dates valid
   - Verify at least 1 approver exists for each level
4. If any level has 0 approvers, reject submission

**When Validated**: Before creating approval_queue_items record

**Implementation Requirements**:
- **Client-Side**: Pre-submission check. Show approval chain with approver names. Warn if any level missing approvers.
- **Server-Side**: Validate complete approval chain. Return details of missing levels. Provide guidance to resolve.
- **Database**: Not enforced (validation requires complex query across multiple tables).

**Error Code**: VAL-APPR-203
**Error Message**: "No approver configured for approval level {level} for {document_type} with amount ${amount}. Contact administrator to assign approvers."
**User Action**: Contact system administrator to configure missing approvers in approval authority matrix. Or adjust document amount to lower approval level requirement.

**Examples**:

**Valid - Complete Approval Chain**:
- Document: purchase_request, $25,000
- Required levels: 3
- Level 1: 2 approvers found (Department Managers)
- Level 2: 1 approver found (Finance Manager)
- Level 3: 1 approver found (General Manager)
- Result: ✅ Complete chain, document submitted

**Invalid - Missing Level 2 Approver**:
- Document: purchase_order, $40,000
- Required levels: 3
- Level 1: 3 approvers found
- Level 2: 0 approvers found (Finance Manager on extended leave, no delegation)
- Level 3: 1 approver found
- Result: ❌ Submission rejected
- Error: "No approver configured for approval level 2 for purchase orders with amount $40,000"
- User must: Contact admin to assign temporary Level 2 approver or create delegation

**Valid - Alternative Approvers Available**:
- Document: credit_note, $15,000
- Required levels: 2
- Level 1: 1 primary approver (Department Manager)
- Level 2: 2 approvers found (Finance Controller OR General Manager)
- Result: ✅ Sufficient approvers at each level

---

### VAL-APPR-204: Partial Approval Quantity Consistency

**Fields Involved**: original_quantity, approved_quantity, rejected_quantity (in approval_actions for partial_approve)

**Validation Rule**: When action_type = 'partial_approve', the sum of approved and rejected quantities must equal original quantity.

**Business Justification**: Ensures all requested quantities are accounted for in partial approvals.

**Validation Logic**:
1. If action_type = 'partial_approve'
2. Validate all three quantity fields are provided
3. Calculate: original_quantity = approved_quantity + rejected_quantity
4. Verify calculation is exact (accounting for decimal precision)
5. Validate approved_quantity > 0 AND rejected_quantity > 0 (true partial)
6. Validate all quantities >= 0

**When Validated**: When processing partial approval action

**Implementation Requirements**:
- **Client-Side**: Partial approval form with three fields. Auto-calculate rejected when approved entered (or vice versa). Display quantity breakdown. Validate sum equals original.
- **Server-Side**: Strict validation of equation. Reject if quantities don't match or if not true partial.
- **Database**: CHECK constraints on non-negative values. Application enforces equation.

**Error Code**: VAL-APPR-204
**Error Messages**:
- If sum mismatch: "Approved ({approved}) + Rejected ({rejected}) must equal Original ({original})"
- If approved = 0: "Approved quantity must be greater than zero for partial approval"
- If rejected = 0: "Rejected quantity must be greater than zero for partial approval (use full approval instead)"
- If negative: "Quantities cannot be negative"

**User Action**: Adjust approved/rejected quantities to sum to original. Use full approval if rejecting none. Use rejection if approving none.

**Examples**:

**Valid - True Partial Approval**:
- Original: 100 units
- Approved: 60 units
- Rejected: 40 units
- Sum: 60 + 40 = 100 ✅
- Result: Partial approval succeeds

**Valid - Decimal Precision**:
- Original: 15.50 kg
- Approved: 10.25 kg
- Rejected: 5.25 kg
- Sum: 10.25 + 5.25 = 15.50 ✅
- Result: Partial approval succeeds

**Invalid - Sum Mismatch**:
- Original: 100 units
- Approved: 60 units
- Rejected: 30 units
- Sum: 60 + 30 = 90 ≠ 100 ❌
- Error: "Approved (60) + Rejected (30) must equal Original (100)"
- User must: Adjust rejected to 40

**Invalid - Not True Partial (Zero Rejection)**:
- Original: 100 units
- Approved: 100 units
- Rejected: 0 units
- Result: ❌ Not a partial approval
- Error: "Rejected quantity must be greater than zero for partial approval (use full approval instead)"
- User must: Use regular approve action

**Invalid - Not True Partial (Zero Approval)**:
- Original: 100 units
- Approved: 0 units
- Rejected: 100 units
- Result: ❌ Not a partial approval
- Error: "Approved quantity must be greater than zero for partial approval (use rejection instead)"
- User must: Use reject action

**Invalid - Negative Quantity**:
- Original: 100 units
- Approved: 120 units
- Rejected: -20 units
- Result: ❌ Negative not allowed
- Error: "Quantities cannot be negative"
- User must: Enter valid positive quantities

---

## 5. Security Validations (VAL-APPR-301 to 399)

### VAL-APPR-301: Row-Level Security (RLS) Enforcement

**Validation Rule**: Users can only view and interact with approval queue items assigned to them or delegated to them.

**Security Policy**: PostgreSQL RLS policy on approval_queue_items table.

**Policy Logic**:
```sql
CREATE POLICY approver_access ON approval_queue_items
FOR SELECT
USING (
  approver_user_id = auth.uid()
  OR
  (is_delegated = true AND delegation_id IN (
    SELECT id FROM approval_delegations
    WHERE delegate_user_id = auth.uid()
    AND status = 'active'
    AND current_timestamp BETWEEN start_datetime AND end_datetime
  ))
);
```

**Implementation Requirements**:
- **Client-Side**: No access to data not in RLS policy scope. UI disabled if no data.
- **Server-Side**: Session user authenticated. RLS policies enforced on all queries. No raw SQL bypassing RLS.
- **Database**: RLS enabled on table. Policies enforce approver-level isolation.

**Error Code**: VAL-APPR-301
**Error Message**: "Access denied. You are not authorized to view this approval."
**User Action**: Contact administrator if access is needed but not granted.

**Test Cases**:
- ✅ Valid: Approver views own queue items
- ✅ Valid: Delegate views delegated approvals
- ❌ Invalid: User attempts to view another approver's queue (403 Forbidden)

---

### VAL-APPR-302: Session Validation

**Validation Rule**: All approval actions must have valid authenticated session.

**Security Check**:
1. Verify session token is valid and not expired
2. Verify user account is active (not suspended/deleted)
3. Verify user has approval permissions
4. For sensitive actions (policy override), require session reauth or 2FA

**Implementation Requirements**:
- **Client-Side**: Handle 401 Unauthorized by redirecting to login. Refresh token before expiry.
- **Server-Side**: Validate session on every request. Check user status. For policy overrides, require 2FA verification within last 5 minutes.
- **Database**: Session stored in secure session table or JWT with short expiry.

**Error Code**: VAL-APPR-302
**Error Messages**:
- "Session expired. Please log in again."
- "User account inactive. Contact administrator."
- "This action requires two-factor authentication. Please verify."

**User Action**: Re-authenticate. Enable 2FA if required for policy overrides.

---

### VAL-APPR-303: Audit Trail Integrity (Hash Chain)

**Validation Rule**: All approval actions must maintain cryptographic hash chain for tamper detection.

**Security Implementation**:
1. Each approval_actions record contains:
   - action_hash: SHA-256 hash of current record fields
   - previous_action_hash: Hash from previous action on same document
2. Hash calculation includes: document_id, document_type, action_type, approver_user_id, action_timestamp, action_comments, rejection_reason, all amounts
3. Hash chain verification:
   - On query: Verify each action's previous_action_hash matches prior action's action_hash
   - Break in chain indicates tampering

**Implementation Requirements**:
- **Client-Side**: Display hash verification status for audit review.
- **Server-Side**: Calculate hash before INSERT. Retrieve previous_action_hash from last action. Verify chain on critical queries. Alert on chain break.
- **Database**: action_hash VARCHAR(64), previous_action_hash VARCHAR(64). Immutable records (no UPDATE allowed, only INSERT).

**Error Code**: VAL-APPR-303
**Error Message**: "Audit trail integrity violation detected. Hash chain broken at action {action_id}."
**User Action**: Alert security team immediately. Do not proceed with further actions on this document.

**Hash Calculation**:
```typescript
const hashInput = [
  action.document_id,
  action.document_type,
  action.action_type,
  action.approver_user_id,
  action.action_timestamp.toISOString(),
  action.original_quantity || '',
  action.approved_quantity || '',
  action.action_comments || '',
  action.previous_action_hash || ''
].join('|');

const action_hash = crypto.createHash('sha256').update(hashInput).digest('hex');
```

---

### VAL-APPR-304: Input Sanitization

**Validation Rule**: All text input must be sanitized to prevent XSS, SQL injection, and other injection attacks.

**Security Checks**:
- Remove or escape HTML tags: `<script>`, `<iframe>`, `<object>`, etc.
- Escape SQL special characters (use parameterized queries)
- Validate URLs for malicious redirects
- Remove null bytes and control characters
- Limit input length to prevent buffer overflow

**Implementation Requirements**:
- **Client-Side**: Basic HTML sanitization for UX. Not relied upon for security.
- **Server-Side**: Comprehensive sanitization before any database operation. Use DOMPurify or similar library. Parameterized queries only (never string concatenation). Escape output when rendering.
- **Database**: Use parameterized queries exclusively. Prepared statements.

**Error Code**: VAL-APPR-304
**Error Message**: "Input contains invalid or potentially harmful content. Please remove special characters and try again."
**User Action**: Remove problematic content (scripts, SQL keywords, etc.) and resubmit.

**Forbidden Content**:
- `<script>` tags
- `javascript:` URLs
- `data:` URLs
- SQL keywords in unexpected contexts (SELECT, DROP, UNION, etc.)
- Null bytes (`\0`)
- Control characters (ASCII < 32 except whitespace)

**Test Cases**:
- ✅ Valid: "Approved for budget allocation 2025"
- ❌ Invalid: "Approved <script>alert('XSS')</script>"
- ❌ Invalid: "'; DROP TABLE approval_actions; --"
- ❌ Invalid: "Approved \0\0\0"

---

## 6. Validation Error Messages

### Error Message Guidelines

**Principles**:
1. **Be Specific**: Tell user exactly what's wrong
2. **Be Actionable**: Explain how to fix the problem
3. **Be Kind**: Use friendly, helpful tone
4. **Be Consistent**: Use same format throughout
5. **Avoid Technical Jargon**: Use business language

**Error Message Format**:
```
[Problem Statement]. [Expected Behavior]. [Action Required].
```

### Error Severity Levels

| Level | When to Use | Display | User Action |
|-------|-------------|---------|-------------|
| **Error** | Blocks submission/progress | Red icon, red border, red text | Must fix to proceed |
| **Warning** | Should be corrected but not blocking | Yellow icon, yellow border | Review and decide |
| **Info** | Helpful guidance | Blue icon, normal border | Optional consideration |

### Error Message Examples

**Field Validation Errors**:
- "Location is required. Please select a location."
- "Approval comments cannot exceed 500 characters. Current length: 523 characters. Please shorten."
- "Delivery date must be after start date."

**Business Rule Errors**:
- "You cannot approve documents you created. Please request approval from your manager."
- "Insufficient approval authority. This $60,000 document requires General Manager approval. Your authority: $50,000."
- "This document is already approved. The page will refresh to show current status."

**Security Errors**:
- "Access denied. You are not authorized to view this approval."
- "Session expired. Please log in again to continue."
- "This action requires two-factor authentication. Please verify your identity."

**Integration Errors**:
- "Budget system temporarily unavailable. Your approval will proceed with pending verification flag."
- "Insufficient budget. Available: $5,000, Required: $30,000. Policy override required to proceed, or reduce amount/select different budget code."

---

## 7. Test Scenarios

### Test Coverage Requirements

All validation rules must have:
1. **Positive Tests**: Valid input that should pass (at least 2 scenarios per rule)
2. **Negative Tests**: Invalid input that should fail (at least 2 scenarios per rule)
3. **Boundary Tests**: Edge cases at limits (for numeric/date validations)
4. **Integration Tests**: Validation working across all layers
5. **Security Tests**: Attempt to bypass validations

### Test Scenario Template

**Test ID**: VAL-APPR-T{###}
**Validation Rule**: VAL-APPR-{###}
**Test Description**: {What is being tested}
**Test Type**: Positive | Negative | Boundary | Integration | Security
**Preconditions**: {What must be true before test}

**Test Steps**:
1. {Step 1}
2. {Step 2}
...

**Input Data**: {What data is provided}
**Expected Result**: {What should happen}
**Validation Layer**: Client | Server | Database | All
**Pass/Fail Criteria**: {How to determine if test passed}

---

### Example Test Scenarios

#### VAL-APPR-T001: Positive - Approve Document with Valid Authority

**Validation Rule**: VAL-APPR-102 (Authority Validation)
**Test Description**: User with sufficient authority approves document
**Test Type**: Positive
**Preconditions**:
- User authenticated with approval permissions
- User has authority: $0 - $50,000 for purchase_request at Level 1
- Document: purchase_request, $10,000, status = pending, level = 1

**Test Steps**:
1. Navigate to My Approvals queue
2. Verify document PR-2501-0123 appears in queue
3. Click on document to review
4. Click "Approve" button
5. Enter optional comments: "Approved as per budget allocation"
6. Confirm approval

**Input Data**:
- action_type: approve
- action_comments: "Approved as per budget allocation"
- document_id: PR-2501-0123
- document_amount: $10,000
- user_authority: $50,000

**Expected Result**: ✅
- Approval succeeds
- Document status changes to 'approved' (or 'pending' if next level exists)
- Success message displayed
- Document removed from user's queue
- Approval recorded in approval_actions table
- Budget commitment created (async)

**Validation Layer**: All (Client, Server, Database)
**Pass/Fail Criteria**:
- Approval action recorded with correct details
- Status updated correctly
- User receives success confirmation
- Document no longer in user's queue

---

#### VAL-APPR-T101: Negative - Self-Approval Attempt

**Validation Rule**: VAL-APPR-101 (No Self-Approval)
**Test Description**: User attempts to approve document they created
**Test Type**: Negative
**Preconditions**:
- User authenticated
- User created document PR-2501-0456
- Same user is configured as Level 1 approver
- Document routed to user's approval queue

**Test Steps**:
1. Navigate to My Approvals queue
2. Find document PR-2501-0456 in queue
3. Click on document
4. Attempt to click "Approve" button
5. Observe button state and error message

**Input Data**:
- requestor_user_id: user_123
- approver_user_id: user_123 (same)
- action_type: approve

**Expected Result**: ❌
- Client-side: "Approve" button is disabled with tooltip "Cannot approve own request"
- If client-side bypassed: Server rejects with error VAL-APPR-101
- Error message: "You cannot approve documents you created. Please request approval from appropriate authority."
- Document remains in pending status
- Attempt logged for security audit

**Validation Layer**: Client and Server
**Pass/Fail Criteria**:
- Approval action prevented
- Clear error message shown
- Document status unchanged
- Security audit log created

---

#### VAL-APPR-T201: Boundary - Maximum Delegation Period

**Validation Rule**: VAL-APPR-020 (Delegation Date Range)
**Test Description**: Create delegation with exactly 90-day maximum period
**Test Type**: Boundary
**Preconditions**:
- User authenticated with delegation permission
- No existing delegations that would overlap

**Test Steps**:
1. Navigate to Delegation Management
2. Click "Create Delegation"
3. Select delegate user
4. Set start_datetime: 2025-11-12 00:00:00
5. Set end_datetime: 2025-02-10 23:59:59 (exactly 90 days later)
6. Select delegation_scope: all_documents
7. Enter reason: "Extended annual leave"
8. Click "Create"

**Input Data**:
- start_datetime: 2025-11-12 00:00:00
- end_datetime: 2025-02-10 23:59:59
- Duration: 90 days exactly
- delegation_scope: all_documents

**Expected Result**: ✅
- Delegation created successfully
- Duration calculation: 90 days (at maximum boundary)
- Delegation status: scheduled (or active if start is now)
- Success message shown
- Delegation appears in list

**Validation Layer**: All
**Pass/Fail Criteria**:
- Delegation saved to database
- Exactly 90-day duration accepted
- Activation scheduled correctly
- No validation errors

---

#### VAL-APPR-T202: Boundary - Exceeds Maximum Delegation Period

**Validation Rule**: VAL-APPR-020 (Delegation Date Range)
**Test Description**: Attempt to create delegation longer than 90 days
**Test Type**: Boundary (Negative)
**Preconditions**: Same as T201

**Test Steps**:
1. Navigate to Delegation Management
2. Click "Create Delegation"
3. Select delegate user
4. Set start_datetime: 2025-11-12 00:00:00
5. Set end_datetime: 2025-02-11 23:59:59 (91 days later)
6. Enter other required fields
7. Attempt to submit

**Input Data**:
- Duration: 91 days (exceeds maximum)

**Expected Result**: ❌
- Client-side validation prevents submission
- Error message: "Delegation period cannot exceed 90 days (current: 91 days)"
- End date field highlighted in red
- Delegation not created

**Validation Layer**: Client and Server
**Pass/Fail Criteria**:
- Delegation creation prevented
- Clear error message with current duration
- No database record created
- User can adjust dates to fix

---

#### VAL-APPR-T301: Security - Attempt Unauthorized Access

**Validation Rule**: VAL-APPR-301 (RLS Enforcement)
**Test Description**: User attempts to access another approver's queue item
**Test Type**: Security
**Preconditions**:
- User A authenticated (user_123)
- User B has approval queue item (queue_item_456)
- User A is NOT the approver for queue_item_456
- No delegation exists

**Test Steps**:
1. User A logged in
2. Directly navigate to URL: /my-approvals/queue_item_456
3. Or API call: GET /api/approvals/queue_item_456
4. Observe response

**Input Data**:
- Requested resource: queue_item_456
- Resource owner: user_789 (User B)
- Requesting user: user_123 (User A)

**Expected Result**: ❌
- HTTP 403 Forbidden response
- Error message: "Access denied. You are not authorized to view this approval."
- No data returned
- Attempt logged in security audit log
- User A cannot view User B's approval details

**Validation Layer**: Server and Database (RLS)
**Pass/Fail Criteria**:
- Access denied at database level (RLS policy)
- No sensitive data leaked
- Security audit log entry created
- User redirected or shown error page

---

#### VAL-APPR-T401: Integration - Optimistic Locking Concurrent Approval

**Validation Rule**: VAL-APPR-109 (Concurrent Modification Prevention)
**Test Description**: Two users attempt to approve same document simultaneously
**Test Type**: Integration
**Preconditions**:
- Document PR-2501-0789 in queue
- doc_version = 5
- Two Level 1 approvers: User A and User B
- Both have document in their queue

**Test Steps**:
1. User A opens document (reads doc_version = 5)
2. User B opens document (reads doc_version = 5)
3. User B clicks Approve and submits first
4. Server processes User B's approval:
   - Verifies doc_version = 5 (matches)
   - Records approval
   - Updates doc_version to 6
   - Updates status to approved
5. User A clicks Approve 2 seconds later
6. Server receives User A's request with doc_version = 5
7. Server checks current doc_version (now 6)
8. Optimistic locking detects conflict

**Input Data**:
- User A request: doc_version = 5
- User B request: doc_version = 5
- Current database doc_version after User B: 6

**Expected Result**: ✅ (for User B), ❌ (for User A)
- User B's approval succeeds (first to complete)
- User A's approval fails with optimistic lock error
- User A receives error: "This document was modified by another user. The page will refresh with the latest version."
- User A's page auto-refreshes
- User A sees document already approved by User B with timestamp
- No duplicate approval recorded
- Data integrity maintained

**Validation Layer**: Server and Database
**Pass/Fail Criteria**:
- Only one approval recorded (User B's)
- User A's approval prevented
- Clear error message to User A
- Page refresh shows current state
- No data corruption

---

## 8. Validation Matrix

| Error Code | Rule Name | Fields | Type | Client | Server | DB | Priority |
|------------|-----------|--------|------|--------|--------|----|----------|
| VAL-APPR-001 | document_id Required | document_id | Field | ✅ | ✅ | ✅ | High |
| VAL-APPR-002 | document_type Enum | document_type | Field | ✅ | ✅ | ✅ | High |
| VAL-APPR-003 | approver_user_id Required | approver_user_id | Field | ✅ | ✅ | ✅ | Critical |
| VAL-APPR-004 | status Enum | status | Field | ✅ | ✅ | ✅ | High |
| VAL-APPR-005 | total_amount Non-negative | total_amount | Field | ✅ | ✅ | ✅ | High |
| VAL-APPR-006 | approval_level 1-10 | approval_level_required | Field | ✅ | ✅ | ✅ | Medium |
| VAL-APPR-007 | current_level Range | current_approval_level | Field | ✅ | ✅ | ✅ | Medium |
| VAL-APPR-008 | priority Enum | priority | Field | ✅ | ✅ | ✅ | Low |
| VAL-APPR-009 | sla_deadline Valid | sla_deadline | Field | ✅ | ✅ | ❌ | Medium |
| VAL-APPR-010 | delegation Consistency | is_delegated, delegation_id | Field | ✅ | ✅ | ✅ | High |
| VAL-APPR-011 | action_type Enum | action_type | Field | ✅ | ✅ | ✅ | High |
| VAL-APPR-012 | comments Length | action_comments | Field | ✅ | ✅ | ❌ | Low |
| VAL-APPR-013 | rejection_reason Conditional | rejection_reason | Field | ✅ | ✅ | ❌ | Critical |
| VAL-APPR-014 | info_request Conditional | info_request_text | Field | ✅ | ✅ | ❌ | High |
| VAL-APPR-015 | info_deadline Conditional | info_request_deadline | Field | ✅ | ✅ | ❌ | High |
| VAL-APPR-016 | partial_reason Conditional | partial_approval_reason | Field | ✅ | ✅ | ❌ | High |
| VAL-APPR-017 | override_justification Conditional | override_justification | Field | ✅ | ✅ | ❌ | Critical |
| VAL-APPR-018 | delegator Valid | delegator_user_id | Field | ✅ | ✅ | ✅ | High |
| VAL-APPR-019 | delegate Valid Different | delegate_user_id | Field | ✅ | ✅ | ✅ | Critical |
| VAL-APPR-020 | Date Range 90 Days | start/end_datetime | Field | ✅ | ✅ | ✅ | High |
| VAL-APPR-021 | delegation_scope Enum | delegation_scope | Field | ✅ | ✅ | ✅ | Medium |
| VAL-APPR-022 | amount_limit Positive | maximum_amount_limit | Field | ✅ | ✅ | ✅ | Medium |
| VAL-APPR-023 | reason Required | delegation_reason | Field | ✅ | ✅ | ❌ | Medium |
| VAL-APPR-024 | target_hours Positive | target_approval_hours | Field | ✅ | ✅ | ✅ | Medium |
| VAL-APPR-025 | escalation 50-100 | escalation_threshold_percent | Field | ✅ | ✅ | ✅ | Medium |
| VAL-APPR-026 | user XOR role | user_id, role_id | Field | ✅ | ✅ | ✅ | High |
| VAL-APPR-027 | Amount Range | min/max_amount | Field | ✅ | ✅ | ✅ | High |
| VAL-APPR-028 | Effective Dates | start/end_date | Field | ✅ | ✅ | ✅ | Medium |
| VAL-APPR-101 | No Self-Approval | requestor, approver | Business | ✅ | ✅ | ❌ | Critical |
| VAL-APPR-102 | Authority Validation | amount, authority | Business | ⚠️ | ✅ | ❌ | Critical |
| VAL-APPR-103 | Status Transitions | status, action | Business | ✅ | ✅ | ❌ | High |
| VAL-APPR-104 | Sequential Levels | approval_level | Business | ✅ | ✅ | ✅ | High |
| VAL-APPR-105 | Delegation Scope | delegation fields | Business | ⚠️ | ✅ | ❌ | High |
| VAL-APPR-106 | SLA Pause | sla fields | Business | ⚠️ | ✅ | ❌ | Medium |
| VAL-APPR-107 | Bulk Consistency | bulk selection | Business | ✅ | ✅ | ❌ | High |
| VAL-APPR-108 | Policy Override | override fields | Business | ✅ | ✅ | ❌ | Critical |
| VAL-APPR-109 | Optimistic Locking | doc_version | Business | ❌ | ✅ | ❌ | High |
| VAL-APPR-110 | Budget Integration | budget_code, amount | Business | ⚠️ | ✅ | ❌ | High |
| VAL-APPR-201 | Status Transitions | status, action | Cross-field | ✅ | ✅ | ❌ | High |
| VAL-APPR-202 | Delegation Overlap | date ranges | Cross-field | ✅ | ✅ | ⚠️ | Medium |
| VAL-APPR-203 | Approval Chain | approval config | Cross-field | ✅ | ✅ | ❌ | High |
| VAL-APPR-204 | Partial Quantities | quantity fields | Cross-field | ✅ | ✅ | ❌ | High |
| VAL-APPR-301 | RLS Enforcement | approver access | Security | ❌ | ✅ | ✅ | Critical |
| VAL-APPR-302 | Session Validation | session token | Security | ✅ | ✅ | ✅ | Critical |
| VAL-APPR-303 | Hash Chain Integrity | action hashes | Security | ❌ | ✅ | ✅ | Critical |
| VAL-APPR-304 | Input Sanitization | all text inputs | Security | ✅ | ✅ | ✅ | Critical |

**Legend**:
- ✅ Fully enforced at this layer
- ❌ Not enforced at this layer
- ⚠️ Partial enforcement (e.g., display only, soft validation)

---

## 9. Related Documents

- **Business Requirements**: [BR-my-approvals.md](./BR-my-approvals.md)
- **Use Cases**: [UC-my-approvals.md](./UC-my-approvals.md)
- **Technical Specification**: [TS-my-approvals.md](./TS-my-approvals.md)
- **Data Schema**: [DS-my-approvals.md](./DS-my-approvals.md)
- **Flow Diagrams**: [FD-my-approvals.md](./FD-my-approvals.md)

---

**Document Control**:
- **Created**: 2025-11-12
- **Author**: Carmen ERP Documentation Team
- **Reviewed By**: Business Analyst, QA Lead, Security Team
- **Approved By**: Technical Lead, Product Owner
- **Next Review**: 2025-12-12

---

## Appendix: Error Code Registry

| Code Range | Category | Count | Description |
|------------|----------|-------|-------------|
| VAL-APPR-001 to 099 | Field Validations | 28 | Individual field rules for all entities |
| VAL-APPR-101 to 199 | Business Rules | 10 | Business logic validations and workflow rules |
| VAL-APPR-201 to 299 | Cross-Field | 4 | Multi-field relationships and consistency checks |
| VAL-APPR-301 to 399 | Security | 4 | Permission, access control, and audit integrity |
| VAL-APPR-901 to 999 | System | Reserved | System-level errors (future use) |

**Total Validation Rules**: 46

---

**End of Validation Rules Document**
