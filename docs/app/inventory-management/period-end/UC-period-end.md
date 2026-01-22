# Use Cases: Period End

> Version: 2.0.0 | Status: Active | Last Updated: 2025-01-16

## 1. Document Control

| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Feature | Period End |
| Document Type | Use Cases |

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-01-16 | Development Team | Aligned with actual implementation: 3-stage validation (Transactions, Spot Checks, Physical Counts), corrected status values (open, in_progress, closing, closed), updated page structure |
| 1.1.0 | 2025-12-09 | Development Team | Updated status values, expanded validation checklist |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---

## 2. Overview

This document defines all use cases for the Period End sub-module. The implementation uses a 3-stage validation architecture:
1. **Stage 1: Transactions** - All documents (GRN, ADJ, TRF, SR, WR) must be Posted/Approved
2. **Stage 2: Spot Checks** - All spot checks must be Completed
3. **Stage 3: Physical Counts** - All counts must be Finalized with GL postings

---

## 3. Actor Definitions

### Primary Actors

**Inventory Coordinator**
- Role: Day-to-day inventory management
- Permissions: View periods, view validation status
- Use Cases: UC-PE-001, UC-PE-002

**Inventory Manager**
- Role: Supervise period close process
- Permissions: All Coordinator permissions + Initiate close, View validation details
- Use Cases: UC-PE-001 through UC-PE-004

**Financial Controller**
- Role: Approve period closures, final authorization
- Permissions: All Manager permissions + Close period, Re-open periods
- Use Cases: All use cases

**System Administrator**
- Role: System configuration, emergency operations
- Permissions: All permissions + Override constraints
- Use Cases: All use cases

---

## 4. Use Case Index

### User Use Cases

| ID | Use Case Name | Actor | Priority |
|----|---------------|-------|----------|
| UC-PE-001 | View Period List | Inventory Coordinator+ | High |
| UC-PE-002 | View Period Detail | Inventory Coordinator+ | High |
| UC-PE-003 | Run Validation Checklist | Inventory Manager+ | Critical |
| UC-PE-004 | Close Period | Financial Controller+ | Critical |

### System Use Cases

| ID | Use Case Name | Trigger | Priority |
|----|---------------|---------|----------|
| UC-PE-101 | Validate Transactions Stage | User runs validation | Critical |
| UC-PE-102 | Validate Spot Checks Stage | User runs validation | Critical |
| UC-PE-103 | Validate Physical Counts Stage | User runs validation | Critical |
| UC-PE-104 | Log Activity Entry | Any period action | Critical |

---

## 5. User Use Cases

### UC-PE-001: View Period List

**Description**: User views the period list page showing the current open period and period history.

**Actor**: Inventory Coordinator, Inventory Manager, Financial Controller, System Administrator

**Priority**: High

**Preconditions**:
- User is authenticated
- User has period view permission

**Postconditions**:
- Period list displayed with current and historical periods
- User can navigate to period detail or close workflow

**Main Flow**:
1. User navigates to `/inventory-management/period-end`
2. System displays page with two main sections:

   **Current Period Card (PeriodSummaryCard - featured variant)**
   - Period ID (e.g., "PE-2025-01")
   - Period name (e.g., "January 2025")
   - Date range (formatted start and end dates)
   - Status badge (color-coded: blue=open, yellow=in_progress, orange=closing, green=closed)
   - Action buttons: "View Details", "Start Period Close"

   **Period History Table**
   - Columns: Period ID, Period Name, Start Date, End Date, Status, Closed By, Closed At, Notes
   - Clickable rows navigate to period detail
   - Sortable and filterable

3. System displays information panel explaining period close requirements
4. User can click "View Details" to go to detail page (UC-PE-002)
5. User can click "Start Period Close" to go to close workflow (UC-PE-003)

**Alternative Flows**:
- **Alt-1A: No Open Period**
  - System displays empty state: "No open period"
  - "Start New Period" button shown (if authorized)

**Business Rules Applied**: BR-PE-001, BR-PE-002

**Acceptance Criteria**:
- [ ] Current open period displayed with featured PeriodSummaryCard styling
- [ ] Period history table shows closed periods
- [ ] Status badges use correct colors
- [ ] Navigation to detail and close workflow works

---

### UC-PE-002: View Period Detail

**Description**: User views detailed information for a specific period including validation status overview.

**Actor**: Inventory Coordinator, Inventory Manager, Financial Controller, System Administrator

**Priority**: High

**Preconditions**:
- User is authenticated
- Period exists

**Postconditions**:
- Period detail page displayed with validation overview

**Main Flow**:
1. User navigates to `/inventory-management/period-end/[id]`
2. System retrieves period by ID
3. System displays period detail page with:

   **Period Information (PeriodSummaryCard)**
   - Period ID, name, date range
   - Status badge
   - Audit trail (closedBy, closedAt) for closed periods

   **Validation Status Overview (ValidationSummaryCard)**
   - 3 validation stages with pass/fail indicators:
     1. Transactions - All Posted/Approved
     2. Spot Checks - All Completed
     3. Physical Counts - All Finalized
   - Overall validation status
   - Issue count for failing stages
   - "View Full Validation Details" link (for open periods)

   **Adjustments Tab**
   - Table of period-end adjustments
   - Columns: ID, Type, Amount, Reason, Status, Created By, Created At

4. For open periods, "Start Period Close" button is visible
5. For closed periods, audit information is displayed

**Alternative Flows**:
- **Alt-2A: Period Not Found**
  - System displays error card
  - Navigation back to period list

- **Alt-2B: Period Already Closed**
  - Validation status shown as read-only
  - "Start Period Close" button hidden
  - Audit trail displayed

**Business Rules Applied**: BR-PE-001 through BR-PE-007

**Acceptance Criteria**:
- [ ] Period metadata displayed correctly
- [ ] 3 validation stages shown with pass/fail indicators
- [ ] Issue counts displayed for failing validations
- [ ] Adjustments table shows financial details
- [ ] Navigation to close workflow works for open periods

---

### UC-PE-003: Run Validation Checklist

**Description**: User runs the 3-stage validation checklist to verify all prerequisites are met before closing the period.

**Actor**: Inventory Manager, Financial Controller, System Administrator

**Priority**: Critical

**Preconditions**:
- User is authenticated
- User has close permission
- Period status is open or in_progress

**Postconditions**:
- All validation results displayed
- Close button enabled if all validations pass

**Main Flow**:
1. User navigates to `/inventory-management/period-end/close/[id]`
2. System verifies period exists and is not already closed
3. System displays close workflow page with:

   **ValidationChecklist Component**
   - 3 expandable/collapsible sections (ValidationSection):

   **Stage 1: Transactions** (Order: 1, Icon: FileText)
   - TransactionValidationItem for each document type:
     - GRN: Total count, pending count, "All Posted" or "X pending"
     - ADJ: Total count, pending count
     - TRF: Total count, pending count
     - SR: Total count, pending count
     - WR: Total count, pending count
   - Pass/fail status with color coding

   **Stage 2: Spot Checks** (Order: 2, Icon: ClipboardCheck)
   - ValidationItem for each spot check:
     - Check ID, location, status
     - Link to source document
   - Pass/fail based on completion status

   **Stage 3: Physical Counts** (Order: 3, Icon: Package)
   - ValidationItem for each physical count:
     - Count ID, location, status
     - Link to source document
   - Pass/fail based on finalization status

   **ValidationSummaryCard**
   - Overall pass/fail status
   - Total issue count
   - Summary messages

4. User clicks "Validate All" button
5. System runs all validations (UC-PE-101, UC-PE-102, UC-PE-103)
6. System updates checklist with results
7. If all pass, "Close Period" button is enabled
8. User can expand/collapse individual sections to view details

**Alternative Flows**:
- **Alt-3A: Period Not Found**
  - System displays error card: "Period not found"
  - Navigation back to period list

- **Alt-3B: Period Already Closed**
  - System displays info card: "This period is already closed"
  - Link to period detail page

- **Alt-3C: Validation Fails**
  - Failed stages show issue count and details
  - Warning message panel displayed
  - "Close Period" button remains disabled
  - Help text explains how to resolve issues

**Business Rules Applied**: BR-PE-003, BR-PE-005, BR-PE-006, BR-PE-007

**Acceptance Criteria**:
- [ ] Three validation stages displayed in correct sequence
- [ ] Each stage shows expandable item list
- [ ] Transaction validation shows per-type breakdown (GRN, ADJ, TRF, SR, WR)
- [ ] Spot check and physical count items link to source documents
- [ ] "Validate All" refreshes all validation results
- [ ] Close button enabled only when allChecksPassed is true

---

### UC-PE-004: Close Period

**Description**: Authorized user closes the period after all validations pass, locking it from further transactions.

**Actor**: Financial Controller, System Administrator

**Priority**: Critical

**Preconditions**:
- User is authenticated
- User has close permission
- Period status is closing
- All 3 validation stages pass

**Postconditions**:
- Period status updated to closed
- closedBy, closedAt fields populated
- Activity log entry recorded
- Transactions blocked for this period

**Main Flow**:
1. User is on close workflow page (UC-PE-003)
2. All validations have passed (allChecksPassed = true)
3. User clicks "Close Period" button
4. System displays confirmation dialog:
   ```
   Title: "Close Period"
   Message: "Are you sure you want to close this period?
   This action cannot be undone. No further transactions
   can be posted to this period once closed."
   Actions: [Cancel] [Confirm Close]
   ```
5. User clicks "Confirm Close"
6. System performs atomic transaction:
   - Update period: status = 'closed', closedBy, closedAt
   - Log activity entry
7. System displays success message
8. System redirects to period list page

**Exception Flows**:
- **Exc-4A: Validation No Longer Passes**
  - System re-validates before closing
  - If validation fails, display error and stay on page

- **Exc-4B: Permission Denied**
  - System returns 403 Forbidden
  - User sees error message

- **Exc-4C: Database Error**
  - System rolls back transaction
  - Display error message with retry option

**Business Rules Applied**: BR-PE-003, BR-PE-004

**Acceptance Criteria**:
- [ ] Confirmation dialog warns of irreversibility
- [ ] Closure operation is atomic
- [ ] Activity log captures closure event
- [ ] Success redirects to period list
- [ ] Closed period blocks new transactions

---

## 6. System Use Cases

### UC-PE-101: Validate Transactions Stage

**Description**: System validates all transaction documents are Posted/Approved for the period.

**Trigger**: User runs validation (UC-PE-003)

**Priority**: Critical

**Main Flow**:
1. System queries transaction documents for period date range
2. For each document type, count total and pending:
   - **GRN**: Status must be Posted or Approved
   - **ADJ**: Status must be Posted
   - **TRF**: Status must be Posted or Completed
   - **SR**: Status must be Fulfilled or Completed
   - **WR**: Status must be Posted or Approved
3. System compiles results:
   - transactionsCommitted: boolean (all documents posted)
   - Per-type breakdown with counts
4. Return validation result

**Validation Result Structure**:
```typescript
interface TransactionValidationResult {
  passed: boolean;
  grn: { total: number; pending: number; posted: boolean };
  adj: { total: number; pending: number; posted: boolean };
  trf: { total: number; pending: number; posted: boolean };
  sr: { total: number; pending: number; posted: boolean };
  wr: { total: number; pending: number; posted: boolean };
}
```

---

### UC-PE-102: Validate Spot Checks Stage

**Description**: System validates all spot checks are completed for the period.

**Trigger**: User runs validation (UC-PE-003)

**Priority**: Critical

**Main Flow**:
1. System queries spot checks for period date range
2. For each spot check:
   - Check status = 'completed'
   - Capture ID, location, status
3. Compile results:
   - spotChecksComplete: boolean
   - List of incomplete spot checks
4. Return validation result

---

### UC-PE-103: Validate Physical Counts Stage

**Description**: System validates all physical counts are finalized with GL postings.

**Trigger**: User runs validation (UC-PE-003)

**Priority**: Critical

**Main Flow**:
1. System queries physical counts for period date range
2. For each physical count:
   - Check status = 'finalized'
   - Verify GL adjustments posted
   - Capture ID, location, status
3. Compile results:
   - physicalCountsFinalized: boolean
   - List of non-finalized counts
4. Return validation result

---

### UC-PE-104: Log Activity Entry

**Description**: System logs all period-related actions to immutable activity log.

**Trigger**: Any period action (view, validate, close)

**Priority**: Critical

**Main Flow**:
1. System captures action context:
   - Action type
   - User ID, name
   - Timestamp
   - Period ID
2. System captures action-specific details
3. System inserts activity log entry
4. Entry is immutable (no updates or deletes)

---

## 7. Validation Results Structure

### Overall Validation Result

```typescript
interface PeriodCloseChecklist {
  transactionsCommitted: boolean;
  spotChecksComplete: boolean;
  physicalCountsFinalized: boolean;
  allChecksPassed: boolean;
  totalIssueCount: number;
  summaryMessages: string[];

  sections: {
    transactions: ValidationSection;
    spotChecks: ValidationSection;
    physicalCounts: ValidationSection;
  };
}

interface ValidationSection {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  issueCount: number;
  items: ValidationItem[];
}
```

---

## 8. Permission Matrix

| Use Case | Coordinator | Manager | Financial | Admin |
|----------|------------|---------|-----------|-------|
| UC-PE-001: View List | Y | Y | Y | Y |
| UC-PE-002: View Detail | Y | Y | Y | Y |
| UC-PE-003: Run Validation | N | Y | Y | Y |
| UC-PE-004: Close Period | N | N | Y | Y |

---

*Document Version: 2.0.0 | Carmen ERP Period End Module*
