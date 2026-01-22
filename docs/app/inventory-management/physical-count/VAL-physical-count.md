# Validation Rules: Physical Count

> Version: 1.0.0 | Status: Active | Last Updated: 2025-01-16

## 1. Document Control

| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Feature | Physical Count |
| Document Type | Validation Rules |

## 2. Validation Overview

| Category | Count | Critical |
|----------|-------|----------|
| Setup Validations | 4 | 2 |
| Location Validations | 2 | 1 |
| Item Validations | 5 | 2 |
| Status Validations | 4 | 3 |
| Business Rules | 6 | 4 |

## 3. Setup Validations

### VAL-PC-001: Counter Name Required

| Attribute | Value |
|-----------|-------|
| Field | counterName |
| Rule | Must be populated from authenticated user |
| Type | System |
| Severity | Critical |
| Error Message | "Counter name is required" |

**Implementation**:
- Auto-populated from user context
- Input field is read-only
- Cannot be modified by user

---

### VAL-PC-002: Department Required

| Attribute | Value |
|-----------|-------|
| Field | department |
| Rule | Must select a department |
| Type | Required |
| Severity | Critical |
| Error Message | "Please select a department" |

**Implementation**:
- Dropdown must have selection
- Empty/null value not accepted
- Validates before Step 2

---

### VAL-PC-003: Date/Time Required

| Attribute | Value |
|-----------|-------|
| Field | dateTime |
| Rule | Must specify count date and time |
| Type | Required |
| Severity | Critical |
| Error Message | "Please select date and time" |

**Implementation**:
- Date picker must have value
- Cannot be empty
- Validates before Step 2

---

### VAL-PC-004: Notes Length

| Attribute | Value |
|-----------|-------|
| Field | notes |
| Rule | Maximum 500 characters |
| Type | Format |
| Severity | Warning |
| Error Message | "Notes cannot exceed 500 characters" |

**Implementation**:
- Textarea with maxLength
- Character counter display
- Truncates at limit

## 4. Location Validations

### VAL-PC-005: Minimum Location Selection

| Attribute | Value |
|-----------|-------|
| Field | selectedLocations |
| Rule | At least one location must be selected |
| Type | Required |
| Severity | Critical |
| Error Message | "Please select at least one location" |

**Implementation**:
- Array length must be >= 1
- Validates before Step 3
- Blocks navigation until satisfied

---

### VAL-PC-006: Valid Location IDs

| Attribute | Value |
|-----------|-------|
| Field | selectedLocations |
| Rule | All location IDs must exist in system |
| Type | Reference |
| Severity | Critical |
| Error Message | "Invalid location selected" |

**Implementation**:
- Validate against location master
- Remove invalid selections
- Refresh if data stale

## 5. Item Validations

### VAL-PC-007: Physical Count Numeric

| Attribute | Value |
|-----------|-------|
| Field | physicalQuantity |
| Rule | Must be a valid non-negative number |
| Type | Format |
| Severity | Critical |
| Error Message | "Physical count must be a valid number" |

**Implementation**:
- Input type="number"
- min="0"
- Reject negative values
- Allow decimals for weight-based items

---

### VAL-PC-008: Physical Count Required for Save

| Attribute | Value |
|-----------|-------|
| Field | physicalQuantity |
| Rule | Must enter count before saving item |
| Type | Required |
| Severity | Critical |
| Error Message | "Please enter the physical count" |

**Implementation**:
- Save button disabled if empty
- Validates on Save Count click

---

### VAL-PC-009: Item Status Selection

| Attribute | Value |
|-----------|-------|
| Field | itemCondition |
| Rule | Must select item condition status |
| Type | Required |
| Severity | Warning |
| Error Message | "Please select item condition" |

**Implementation**:
- Default to "good" if not selected
- Options: good, damaged, missing, expired

---

### VAL-PC-010: Variance Reason for Large Variance

| Attribute | Value |
|-----------|-------|
| Field | varianceReason |
| Rule | Required when variance > 10% |
| Type | Conditional |
| Severity | Warning |
| Error Message | "Please provide reason for significant variance" |

**Implementation**:
- Triggered when |variance%| > 10
- Reason dropdown becomes required
- Can proceed with acknowledgment

---

### VAL-PC-011: Item Uniqueness

| Attribute | Value |
|-----------|-------|
| Field | productId + locationId |
| Rule | Each product-location combination unique in count |
| Type | Business |
| Severity | Critical |
| Error Message | "Item already exists in this count" |

**Implementation**:
- System prevents duplicates
- Loads unique items only

## 6. Status Validations

### VAL-PC-012: Valid Status Transitions

| Attribute | Value |
|-----------|-------|
| Field | status |
| Rule | Only valid transitions allowed |
| Type | Business |
| Severity | Critical |
| Error Message | "Invalid status transition" |

**Valid Transitions**:

| From | Allowed To |
|------|------------|
| draft | planning, cancelled |
| planning | pending, cancelled |
| pending | in-progress, cancelled |
| in-progress | on-hold, completed, cancelled |
| on-hold | in-progress, cancelled |
| completed | finalized |
| finalized | (none) |
| cancelled | (none) |

---

### VAL-PC-013: Start Count Prerequisites

| Attribute | Value |
|-----------|-------|
| Field | status (pending -> in-progress) |
| Rule | All setup steps must be complete |
| Type | Business |
| Severity | Critical |
| Error Message | "Cannot start count - setup incomplete" |

**Prerequisites**:
- Department selected
- Date/time set
- At least one location selected
- Items loaded for locations

---

### VAL-PC-014: Complete Count Prerequisites

| Attribute | Value |
|-----------|-------|
| Field | status (in-progress -> completed) |
| Rule | All items should be counted (warning only) |
| Type | Business |
| Severity | Warning |
| Error Message | "Not all items have been counted. Continue anyway?" |

**Implementation**:
- Calculate uncounted items
- Show warning if any pending
- Allow completion with confirmation

---

### VAL-PC-015: Finalize Prerequisites

| Attribute | Value |
|-----------|-------|
| Field | status (completed -> finalized) |
| Rule | All variances must be reviewed |
| Type | Business |
| Severity | Critical |
| Error Message | "Cannot finalize - variances pending review" |

**Prerequisites**:
- All variance items reviewed
- Variance reasons provided for significant variances
- Authorized user approval

## 7. Business Rules

### VAL-PC-016: One Active Count Per Counter

| Attribute | Value |
|-----------|-------|
| Field | createdBy |
| Rule | User cannot have multiple in-progress counts |
| Type | Business |
| Severity | Critical |
| Error Message | "You already have an active count in progress" |

**Implementation**:
- Check for existing in-progress count by user
- Must complete or pause before starting new

---

### VAL-PC-017: Count Date Validation

| Attribute | Value |
|-----------|-------|
| Field | scheduledDate |
| Rule | Cannot schedule count in the past |
| Type | Business |
| Severity | Warning |
| Error Message | "Scheduled date cannot be in the past" |

**Implementation**:
- Compare with current date
- Allow same-day counts
- Warn but allow past dates for corrections

---

### VAL-PC-018: Expected Quantity Source

| Attribute | Value |
|-----------|-------|
| Field | expectedQuantity |
| Rule | Must be sourced from inventory balance |
| Type | System |
| Severity | Critical |
| Error Message | "Unable to determine expected quantity" |

**Implementation**:
- Query inventory balance at count start
- Freeze expected values during count
- Log source timestamp

---

### VAL-PC-019: Variance Calculation

| Attribute | Value |
|-----------|-------|
| Field | variance |
| Rule | variance = physicalQuantity - expectedQuantity |
| Type | Calculated |
| Severity | N/A |

**Implementation**:
- Auto-calculate on item save
- Calculate percentage: (variance / expected) * 100
- Handle zero expected (infinite variance)

---

### VAL-PC-020: Duration Calculation

| Attribute | Value |
|-----------|-------|
| Field | duration |
| Rule | Elapsed time from start to current/end |
| Type | Calculated |
| Severity | N/A |

**Implementation**:
- Update in real-time during active count
- Pause timer when on-hold
- Final duration on completion

---

### VAL-PC-021: Progress Calculation

| Attribute | Value |
|-----------|-------|
| Field | progress |
| Rule | progress = (countedItems / totalItems) * 100 |
| Type | Calculated |
| Severity | N/A |

**Implementation**:
- Update on each item save
- Display as percentage
- Use for progress indicator

## 8. Validation Summary Table

| ID | Field | Rule | Type | Severity |
|----|-------|------|------|----------|
| VAL-PC-001 | counterName | Auto-populated, required | System | Critical |
| VAL-PC-002 | department | Required selection | Required | Critical |
| VAL-PC-003 | dateTime | Required | Required | Critical |
| VAL-PC-004 | notes | Max 500 chars | Format | Warning |
| VAL-PC-005 | selectedLocations | Min 1 location | Required | Critical |
| VAL-PC-006 | selectedLocations | Valid IDs | Reference | Critical |
| VAL-PC-007 | physicalQuantity | Non-negative number | Format | Critical |
| VAL-PC-008 | physicalQuantity | Required for save | Required | Critical |
| VAL-PC-009 | itemCondition | Status selection | Required | Warning |
| VAL-PC-010 | varianceReason | Required if >10% variance | Conditional | Warning |
| VAL-PC-011 | product+location | Unique combination | Business | Critical |
| VAL-PC-012 | status | Valid transitions | Business | Critical |
| VAL-PC-013 | status | Start prerequisites | Business | Critical |
| VAL-PC-014 | status | Complete prerequisites | Business | Warning |
| VAL-PC-015 | status | Finalize prerequisites | Business | Critical |
| VAL-PC-016 | createdBy | One active count | Business | Critical |
| VAL-PC-017 | scheduledDate | Not in past | Business | Warning |
| VAL-PC-018 | expectedQuantity | From inventory balance | System | Critical |
| VAL-PC-019 | variance | Calculated | Calculated | N/A |
| VAL-PC-020 | duration | Calculated | Calculated | N/A |
| VAL-PC-021 | progress | Calculated | Calculated | N/A |

## 9. Error Handling

### User-Facing Errors

| Scenario | Display | Action |
|----------|---------|--------|
| Required field missing | Inline error message | Highlight field |
| Invalid format | Inline error message | Show expected format |
| Business rule violation | Toast notification | Explain requirement |
| System error | Alert dialog | Offer retry |

### System Errors

| Scenario | Handling |
|----------|----------|
| Network failure | Save locally, sync on reconnect |
| Concurrent modification | Reload and merge |
| Invalid data state | Log error, notify admin |

---
*Document Version: 1.0.0 | Carmen ERP Physical Count Module*
