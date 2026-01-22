# Business Requirements: Period End

> Version: 2.0.0 | Status: Active | Last Updated: 2025-01-16

## 1. Document Control

| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Feature | Period End |
| Owner | Inventory Control / Finance |
| Status | Active |

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-01-16 | Development Team | Aligned with actual implementation: 3-stage validation (Transactions → Spot Checks → Physical Counts), corrected status values (open, in_progress, closing, closed), documented actual components |
| 1.1.0 | 2025-12-09 | Development Team | Updated status values, expanded validation checklist |
| 1.0.0 | 2025-01-11 | System | Initial version |

## 2. Executive Summary

Period End provides a structured workflow for closing monthly inventory periods. It ensures all prerequisite activities (transactions posted, spot checks completed, physical counts finalized) are verified before locking a period to prevent further transactions.

## 3. Business Objectives

| ID | Objective | Success Metric |
|----|-----------|----------------|
| BO-01 | Complete period closure | 100% periods closed by 5th of following month |
| BO-02 | Data integrity | Zero post-close transaction errors |
| BO-03 | Audit compliance | Complete audit trail for all closures |
| BO-04 | Financial accuracy | Inventory values locked for reporting |

## 4. Functional Requirements

### FR-PE-001: Period List Page

**Priority**: High
**User Story**: As a Financial Controller, I want to view all periods with their status so that I can monitor period closures and initiate close workflows.

**Requirements**:
- Display current open period prominently with PeriodSummaryCard (featured variant)
- "View Details" and "Start Period Close" action buttons for open period
- Period history table showing closed periods
- Table columns: Period ID, Period Name, Start Date, End Date, Status, Closed By, Closed At, Notes
- Clickable rows navigate to period detail
- Information panel explaining period close requirements

**Intent**:
- Provide single entry point for period management
- Quick identification of current open period
- Historical reference for closed periods

**Acceptance Criteria**:
- [ ] Current open period displayed at top with featured styling
- [ ] Empty state shown when no period is open
- [ ] Period history table is sortable and filterable
- [ ] Status badges use correct colors (blue=open, yellow=in_progress, orange=closing, green=closed)
- [ ] "Start New Period" button available

---

### FR-PE-002: Period Detail View

**Priority**: High
**User Story**: As an Inventory Manager, I want to view period details and validation status so that I can understand what is required before closing.

**Requirements**:
- Period information card: ID, name, dates, status, audit trail (closedBy, closedAt)
- Validation status overview with 3 stages: Transactions, Spot Checks, Physical Counts
- Each validation stage shows pass/fail status with issue count
- "View Full Validation Details" link for open periods
- Adjustments tab showing period-end adjustments with: ID, Type, Amount, Reason, Status, Created By, Created At
- Conditional display: Show "Start Period Close" button for open periods only

**Intent**:
- Comprehensive view of period state
- Quick validation status assessment
- Access to financial adjustments

**Acceptance Criteria**:
- [ ] Period metadata displays correctly
- [ ] Validation status cards show pass (green) or fail (red) styling
- [ ] Issue counts displayed for failing validations
- [ ] Adjustments table shows financial details with color-coded amounts
- [ ] Navigation to close workflow works

---

### FR-PE-003: Period Close Workflow

**Priority**: Critical
**User Story**: As a Financial Controller, I want to validate all prerequisites and close the period so that inventory values are locked for financial reporting.

**Requirements**:
- 3-stage validation checklist (in order):
  1. **Transactions** (GRN, ADJ, TRF, SR, WR must be Posted/Approved)
  2. **Spot Checks** (all must be Completed)
  3. **Physical Counts** (all must be Finalized with GL postings)
- Expandable/collapsible sections for each validation stage
- "Validate All" button to refresh validation status
- Per-document-type validation results for transactions
- Individual item links for spot checks and physical counts
- Validation summary card showing overall pass/fail
- "Close Period" button (disabled until all validations pass)
- Confirmation dialog warning of irreversible action
- Help text when validations fail

**Intent**:
- Ensure data integrity before period lock
- Guide users through resolution of issues
- Prevent premature closure

**Acceptance Criteria**:
- [ ] Three validation stages displayed in correct sequence
- [ ] Each stage shows expandable item list
- [ ] Transaction validation shows per-type breakdown (GRN, ADJ, TRF, SR, WR)
- [ ] Spot check and physical count items link to source documents
- [ ] "Validate All" refreshes all validation results
- [ ] Close button enabled only when allChecksPassed is true
- [ ] Confirmation dialog explains consequences
- [ ] After close, redirects to period list

---

### FR-PE-004: Validation Checklist Component

**Priority**: High
**User Story**: As a Storekeeper, I want to see detailed validation results so that I can identify and resolve blocking issues.

**Requirements**:
- ValidationSection for each stage with:
  - Order number (1, 2, 3)
  - Title and description
  - Icon matching stage type
  - Pass/fail indicator with issue count
  - Expand/collapse chevron
- Expandable content showing:
  - TransactionValidationItem: Document type, total count, pending count, "All Posted" or "X pending"
  - ValidationItem: Check/count ID, location, status, validation message, link to source
- Warning message panel when stage has issues

**Intent**:
- Detailed visibility into validation state
- Quick navigation to resolve issues
- Clear guidance on requirements

**Acceptance Criteria**:
- [ ] All sections start expanded by default
- [ ] Toggle expand/collapse works independently per section
- [ ] Transaction items show document type breakdown
- [ ] Spot check and physical count items show individual records
- [ ] External link navigates to source document
- [ ] Warning messages provide actionable guidance

---

### FR-PE-005: Period Status Management

**Priority**: Critical
**User Story**: As a Financial Manager, I want periods to have clear status transitions so that data integrity is maintained.

**Requirements**:
- Status values: `open`, `in_progress`, `closing`, `closed`
- Allowed transitions:
  - `open` → `in_progress` (initiate close)
  - `in_progress` → `closing` (all validations pass)
  - `closing` → `closed` (close confirmed)
  - `in_progress` → `open` (cancel close process)
- Only one period can be `open` at a time
- Closed periods cannot accept new transactions

**Intent**:
- Controlled workflow progression
- Prevent invalid state transitions
- Protect data integrity

**Acceptance Criteria**:
- [ ] Status transitions follow allowed paths
- [ ] Concurrent open periods prevented
- [ ] Closed period blocks transaction posting
- [ ] Status displayed with correct badge color

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Validation response time | <3 seconds |
| NFR-02 | Close operation completion | <5 seconds |
| NFR-03 | Concurrent users | Support 5+ simultaneous close workflows |
| NFR-04 | Audit logging | 100% of status changes logged |

## 6. Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-PE-001 | Only one period can be open | Database constraint |
| BR-PE-002 | Periods close in chronological order | System validation |
| BR-PE-003 | All validations must pass to close | UI + server validation |
| BR-PE-004 | Closed periods reject transactions | Transaction posting check |
| BR-PE-005 | Physical counts require GL posting | "finalized" status check |
| BR-PE-006 | Spot checks require completion | "completed" status check |
| BR-PE-007 | Transactions require posting | Per-type status check |

## 7. Integration Points

| System | Integration | Direction |
|--------|-------------|-----------|
| Physical Count | Finalization status | Inbound |
| Spot Check | Completion status | Inbound |
| Transactions (GRN, ADJ, TRF, SR, WR) | Posting status | Inbound |
| General Ledger | Period lock | Outbound |
| Financial Reporting | Period boundaries | Outbound |

## 8. Glossary

| Term | Definition |
|------|------------|
| Period | Monthly accounting period (calendar month) |
| Period Close | Process of locking a period to prevent transactions |
| Finalized | Physical count with adjustments posted to GL |
| Posted | Transaction committed to inventory ledger |
| Validation Stage | One of three prerequisite checks (Transactions, Spot Checks, Physical Counts) |

---
*Document Version: 2.0.0 | Carmen ERP Period End Module*
