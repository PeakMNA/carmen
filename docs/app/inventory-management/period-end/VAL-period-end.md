# Validation Rules: Period End

> Version: 2.0.0 | Status: Active | Last Updated: 2025-01-16

## 1. Document Control

| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Feature | Period End |
| Document Type | Validation Rules |

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-01-16 | Development Team | Aligned with actual implementation: 3-stage validation (Transactions, Spot Checks, Physical Counts), corrected status values (open, in_progress, closing, closed), documented actual validation architecture |
| 1.1.0 | 2025-12-09 | Development Team | Updated status enum values |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---

## 2. Validation Overview

| Category | Count | Critical |
|----------|-------|----------|
| Period Status Validations | 4 | 3 |
| Stage 1: Transaction Validations | 5 | 5 |
| Stage 2: Spot Check Validations | 2 | 2 |
| Stage 3: Physical Count Validations | 2 | 2 |
| Business Rules | 4 | 3 |

---

## 3. Period Status Validations

### VAL-PE-001: Valid Status Values

| Attribute | Value |
|-----------|-------|
| Field | status |
| Rule | Must be one of: open, in_progress, closing, closed |
| Type | Enum |
| Severity | Critical |
| Error Message | "Invalid period status" |

**Valid Values**:
- `open` - Period created, accepting transactions
- `in_progress` - Close workflow initiated
- `closing` - Validations being run
- `closed` - Period finalized, locked

---

### VAL-PE-002: Valid Status Transitions

| Attribute | Value |
|-----------|-------|
| Field | status |
| Rule | Only valid transitions allowed |
| Type | Business |
| Severity | Critical |
| Error Message | "Invalid status transition from {from} to {to}" |

**Valid Transitions**:

| From | Allowed To |
|------|------------|
| open | in_progress |
| in_progress | closing, open |
| closing | closed, in_progress |
| closed | (none - terminal state) |

---

### VAL-PE-003: Period Not Found

| Attribute | Value |
|-----------|-------|
| Field | id |
| Rule | Period must exist in system |
| Type | Reference |
| Severity | Critical |
| Error Message | "Period not found" |

**Implementation**:
- Display error card on close workflow page
- Provide navigation back to period list

---

### VAL-PE-004: Period Already Closed

| Attribute | Value |
|-----------|-------|
| Field | status |
| Rule | Cannot run close workflow on closed period |
| Type | Business |
| Severity | Warning |
| Error Message | "This period is already closed" |

**Implementation**:
- Display info card instead of validation checklist
- Provide link to period detail page

---

## 4. Stage 1: Transaction Validations

### VAL-PE-010: GRN Documents Posted

| Attribute | Value |
|-----------|-------|
| Field | GRN status |
| Rule | All GRN documents must be Posted or Approved |
| Type | Business |
| Severity | Critical |
| Error Message | "{count} GRN pending" |

**Valid Statuses**: Posted, Approved

---

### VAL-PE-011: ADJ Documents Posted

| Attribute | Value |
|-----------|-------|
| Field | ADJ status |
| Rule | All Adjustment documents must be Posted |
| Type | Business |
| Severity | Critical |
| Error Message | "{count} ADJ pending" |

**Valid Statuses**: Posted

---

### VAL-PE-012: TRF Documents Posted

| Attribute | Value |
|-----------|-------|
| Field | TRF status |
| Rule | All Transfer documents must be Posted or Completed |
| Type | Business |
| Severity | Critical |
| Error Message | "{count} TRF pending" |

**Valid Statuses**: Posted, Completed

---

### VAL-PE-013: SR Documents Fulfilled

| Attribute | Value |
|-----------|-------|
| Field | SR status |
| Rule | All Store Requisitions must be Fulfilled or Completed |
| Type | Business |
| Severity | Critical |
| Error Message | "{count} SR pending" |

**Valid Statuses**: Fulfilled, Completed

---

### VAL-PE-014: WR Documents Posted

| Attribute | Value |
|-----------|-------|
| Field | WR status |
| Rule | All Wastage Reports must be Posted or Approved |
| Type | Business |
| Severity | Critical |
| Error Message | "{count} WR pending" |

**Valid Statuses**: Posted, Approved

---

## 5. Stage 2: Spot Check Validations

### VAL-PE-020: Spot Checks Completed

| Attribute | Value |
|-----------|-------|
| Field | spot_check.status |
| Rule | All spot checks in period must be Completed |
| Type | Business |
| Severity | Critical |
| Error Message | "{count} spot checks incomplete" |

**Valid Status**: Completed

---

### VAL-PE-021: Spot Check Exists

| Attribute | Value |
|-----------|-------|
| Field | spot_check.id |
| Rule | Referenced spot check must exist |
| Type | Reference |
| Severity | Critical |
| Error Message | "Spot check not found" |

---

## 6. Stage 3: Physical Count Validations

### VAL-PE-030: Physical Counts Finalized

| Attribute | Value |
|-----------|-------|
| Field | physical_count.status |
| Rule | All physical counts must be Finalized |
| Type | Business |
| Severity | Critical |
| Error Message | "{count} physical counts not finalized" |

**Valid Status**: Finalized

---

### VAL-PE-031: GL Adjustments Posted

| Attribute | Value |
|-----------|-------|
| Field | physical_count.gl_posted |
| Rule | All variance adjustments must be posted to GL |
| Type | Business |
| Severity | Critical |
| Error Message | "GL adjustments pending for physical count {id}" |

---

## 7. Business Rules

### VAL-PE-040: All Stages Must Pass

| Attribute | Value |
|-----------|-------|
| Field | allChecksPassed |
| Rule | All 3 validation stages must pass to enable close |
| Type | Business |
| Severity | Critical |
| Error Message | "Cannot close period - validations incomplete" |

**Formula**:
```typescript
allChecksPassed = transactionsCommitted &&
                  spotChecksComplete &&
                  physicalCountsFinalized
```

---

### VAL-PE-041: Close Permission Required

| Attribute | Value |
|-----------|-------|
| Field | user.permissions |
| Rule | User must have period close permission |
| Type | Authorization |
| Severity | Critical |
| Error Message | "Insufficient permissions to close period" |

**Required Role**: Financial Controller or System Administrator

---

### VAL-PE-042: Confirmation Required

| Attribute | Value |
|-----------|-------|
| Field | confirmation |
| Rule | User must confirm before closing |
| Type | UI |
| Severity | Critical |
| Error Message | N/A (dialog cancellation) |

**Implementation**:
- Confirmation dialog with warning text
- Explain irreversibility of action

---

### VAL-PE-043: Period Date Range

| Attribute | Value |
|-----------|-------|
| Field | startDate, endDate |
| Rule | Period dates must be valid calendar month |
| Type | Format |
| Severity | Critical |
| Error Message | "Invalid period date range" |

**Rules**:
- startDate must be first day of month
- endDate must be last day of same month
- startDate < endDate

---

## 8. Validation Result Structure

### Overall Checklist

```typescript
interface PeriodCloseChecklist {
  // Stage results
  transactionsCommitted: boolean;
  spotChecksComplete: boolean;
  physicalCountsFinalized: boolean;

  // Overall result
  allChecksPassed: boolean;
  totalIssueCount: number;
  summaryMessages: string[];
}
```

### Stage Section

```typescript
interface ValidationStageSection {
  id: string;
  title: string;
  description: string;
  order: number;
  passed: boolean;
  issueCount: number;
  items: ValidationItem[];
}
```

---

## 9. Validation Summary Table

| ID | Field | Rule | Type | Severity |
|----|-------|------|------|----------|
| VAL-PE-001 | status | Valid enum value | Enum | Critical |
| VAL-PE-002 | status | Valid transition | Business | Critical |
| VAL-PE-003 | id | Period exists | Reference | Critical |
| VAL-PE-004 | status | Not already closed | Business | Warning |
| VAL-PE-010 | GRN.status | Posted/Approved | Business | Critical |
| VAL-PE-011 | ADJ.status | Posted | Business | Critical |
| VAL-PE-012 | TRF.status | Posted/Completed | Business | Critical |
| VAL-PE-013 | SR.status | Fulfilled/Completed | Business | Critical |
| VAL-PE-014 | WR.status | Posted/Approved | Business | Critical |
| VAL-PE-020 | spot_check.status | Completed | Business | Critical |
| VAL-PE-021 | spot_check.id | Exists | Reference | Critical |
| VAL-PE-030 | physical_count.status | Finalized | Business | Critical |
| VAL-PE-031 | physical_count.gl_posted | GL posted | Business | Critical |
| VAL-PE-040 | allChecksPassed | All stages pass | Business | Critical |
| VAL-PE-041 | user.permissions | Close permission | Authorization | Critical |
| VAL-PE-042 | confirmation | User confirms | UI | Critical |
| VAL-PE-043 | dates | Valid month range | Format | Critical |

---

## 10. Error Handling

### User-Facing Errors

| Scenario | Display | Action |
|----------|---------|--------|
| Period not found | Error card | Navigate to list |
| Period already closed | Info card | Link to detail |
| Validation fails | Issue list with counts | Show help text |
| Permission denied | Error message | Disable close button |

### UI Indicators

| Status | Color | Icon |
|--------|-------|------|
| Pass | Green | CheckCircle2 |
| Fail | Red | XCircle |
| Pending | Gray | Circle |

---

## 11. Testing Matrix

### Stage 1: Transaction Tests

| Test ID | Input | Expected Result |
|---------|-------|-----------------|
| TC-PE-010 | All GRN posted | Pass |
| TC-PE-011 | 1 GRN pending | Fail with count |
| TC-PE-012 | All ADJ posted | Pass |
| TC-PE-013 | 2 ADJ pending | Fail with count |
| TC-PE-014 | All TRF completed | Pass |
| TC-PE-015 | All SR fulfilled | Pass |
| TC-PE-016 | All WR approved | Pass |

### Stage 2: Spot Check Tests

| Test ID | Input | Expected Result |
|---------|-------|-----------------|
| TC-PE-020 | All spot checks completed | Pass |
| TC-PE-021 | 1 spot check incomplete | Fail with count |
| TC-PE-022 | No spot checks in period | Pass (vacuously true) |

### Stage 3: Physical Count Tests

| Test ID | Input | Expected Result |
|---------|-------|-----------------|
| TC-PE-030 | All counts finalized | Pass |
| TC-PE-031 | 1 count not finalized | Fail with count |
| TC-PE-032 | GL not posted | Fail |
| TC-PE-033 | No counts in period | Pass (vacuously true) |

### Overall Tests

| Test ID | Input | Expected Result |
|---------|-------|-----------------|
| TC-PE-040 | All 3 stages pass | allChecksPassed = true |
| TC-PE-041 | Stage 1 fails | allChecksPassed = false |
| TC-PE-042 | Stage 2 fails | allChecksPassed = false |
| TC-PE-043 | Stage 3 fails | allChecksPassed = false |
| TC-PE-044 | Close without permission | Error |
| TC-PE-045 | Close with permission | Success |

---

*Document Version: 2.0.0 | Carmen ERP Period End Module*
