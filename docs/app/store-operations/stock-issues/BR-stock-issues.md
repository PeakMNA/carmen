# Business Rules: Stock Issues View

## 1. Overview

This document defines the business rules for the Stock Issues view.

**KEY ARCHITECTURE**: Stock Issues are NOT separate documents. They are **read-only audit views** of Store Requisitions at the Issue or Complete stage with DIRECT type destinations.

- **Stock Issue View** = SRs where (stage='issue' OR stage='complete') AND destinationLocationType='DIRECT'
- The SI page provides a specialized **read-only view** focused on direct issues to expense/consumption locations
- All workflow actions (approve, issue, complete) are performed in the Store Requisitions module, not in Stock Issues
- Stock Issues supports **View and Print only** - no stage changes

## 2. View Definition

### 2.1 What Appears in Stock Issue View

| Criteria | Value | Description |
|----------|-------|-------------|
| SR Stage | Issue OR Complete | SR must be at Issue or Complete stage |
| Destination Type | DIRECT | Destination must be a DIRECT location |

### 2.2 What Does NOT Appear

- SRs at Draft, Submit, or Approve stages
- SRs with INVENTORY destination (those appear in Stock Transfers)
- Cancelled or Voided SRs

## 3. Document Reference Format

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-REF-001 | Reference Number | Uses the source SR reference (SR-YYMM-NNNN) |
| BR-SI-REF-002 | No Separate Number | Stock Issues do not have separate reference numbers |
| BR-SI-REF-003 | Traceability | Always traceable back to source SR |

## 4. Location Type Rules

### 4.1 Source Location (From)

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-LOC-001 | Source Location Type | Must be INVENTORY type (defined in SR) |
| BR-SI-LOC-002 | Source Stock Availability | Checked when SR reaches Issue stage |
| BR-SI-LOC-003 | Source Location Active | Location must be active |

### 4.2 Destination Location (To)

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-LOC-004 | Destination Location Type | Must be DIRECT type (this makes it an "issue" vs "transfer") |
| BR-SI-LOC-005 | Destination Active | Location must be active |
| BR-SI-LOC-006 | Department Association | DIRECT locations are associated with departments/cost centers |
| BR-SI-LOC-007 | No Stock Tracking | Stock issued to DIRECT locations is expensed immediately |

## 5. Status & Stage Rules

### 5.1 Status (from underlying SR)

| Status | Description | Meaning for Issue View |
|--------|-------------|------------------------|
| in_progress | SR is being processed | Issue is active |
| completed | SR workflow complete | Issue is complete |

### 5.2 Stage (from underlying SR)

| Stage | Description | Issue View |
|-------|-------------|------------|
| issue | Items have been issued | Shows in Stock Issue list |
| complete | All items processed | Shows in Stock Issue list (as completed) |

### 5.3 Stage Flow

```
SR Stage Flow:
Draft → Submit → Approve → Issue → Complete
                            ↓         ↓
                   Both stages appear in Stock Issue view
                   (if destination = DIRECT)

Stage management happens in Store Requisitions, NOT in Stock Issues
```

## 6. Actions (Read-Only)

| Rule ID | Action | Performed On | Description |
|---------|--------|--------------|-------------|
| BR-SI-ACT-001 | View Issue | SI View | Read-only view of SR as issue |
| BR-SI-ACT-002 | View Full SR | SR Detail | Navigate to full SR detail (link only) |
| BR-SI-ACT-003 | Print | SI View | Print issue slip |

**Note**: Stage management (Issue → Complete) is performed in the Store Requisitions module. Stock Issues is a read-only audit view.

## 7. Quantity Rules

### 7.1 Quantities (from SR Items)

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-QTY-001 | Requested Qty | From SR item requestedQty |
| BR-SI-QTY-002 | Approved Qty | From SR item approvedQty |
| BR-SI-QTY-003 | Issued Qty | From SR item issuedQty |
| BR-SI-QTY-004 | Unit | From SR item unit |

### 7.2 Issue Process

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-QTY-005 | Direct Issue | Items go directly to consumption/expense |
| BR-SI-QTY-006 | No Receipt | DIRECT locations do not track inventory |
| BR-SI-QTY-007 | Expense Recording | Issue is recorded as expense to department |

## 8. Stock Movement Rules

### 8.1 On Issue (When SR reaches Issue stage)

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-MOV-001 | Source Deduction | Deduct issuedQty from source location stock |
| BR-SI-MOV-002 | No Destination Addition | DIRECT locations don't hold inventory |
| BR-SI-MOV-003 | Issue Timestamp | Record issuedAt and issuedBy on SR |
| BR-SI-MOV-004 | Expense Recording | Record as expense to department/cost center |

### 8.2 Costing Impact

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-MOV-005 | COGS Recording | Issue generates Cost of Goods Sold entry |
| BR-SI-MOV-006 | Department Allocation | Cost allocated to assigned department |

## 9. Costing Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-COST-001 | Unit Cost | From SR item unitCost |
| BR-SI-COST-002 | Total Value | totalCost = issuedQty x unitCost |
| BR-SI-COST-003 | Department Charge | Cost charged to destination department |
| BR-SI-COST-004 | Currency | System base currency |
| BR-SI-COST-005 | Immediate Expense | Value expensed immediately on issue |

## 10. Department and Expense Rules

### 10.1 Department Assignment

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-DEPT-001 | Department Required | DIRECT issues must have department assignment |
| BR-SI-DEPT-002 | Cost Center | Department determines cost center for expense |
| BR-SI-DEPT-003 | Budget Tracking | Issues tracked against department budget |

### 10.2 Expense Account Allocation

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-EXP-001 | Expense Account | Optional expense account for cost allocation |
| BR-SI-EXP-002 | Default Account | If not specified, uses department's default expense account |
| BR-SI-EXP-003 | Period Tracking | Expenses tracked by accounting period |

## 11. GL Integration Rules

### 11.1 Expense Recording

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-GL-001 | Expense Entry | Debit department expense account |
| BR-SI-GL-002 | Inventory Credit | Credit source location inventory account |
| BR-SI-GL-003 | COGS Impact | Issue generates Cost of Goods Sold entry |

### 11.2 Account Determination

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-GL-004 | Expense Account Source | Destination department's default expense account |
| BR-SI-GL-005 | Cost Center | Department's assigned cost center |
| BR-SI-GL-006 | Inventory Account | Source location's inventory account |

## 12. Access Control Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-SI-ACC-001 | View Access | Users with store_operations.view permission |
| BR-SI-ACC-002 | Print Access | Users with store_operations.view permission |
| BR-SI-ACC-003 | Department Filter | Users may see only their department's issues |
| BR-SI-ACC-004 | Stage Actions | Not available - managed in Store Requisitions |

## 13. Business Constraints Summary

| Constraint | Rule |
|------------|------|
| View Type | Read-only audit view of SRs |
| Location Types | INVENTORY to DIRECT only |
| Stage Required | SR must be at Issue or Complete stage |
| Available Actions | View and Print only |
| Stage Management | Handled by Store Requisitions module |
| Inventory Impact | Deducts from source, records as expense |
| Department | Required for expense allocation |

## 14. Differences from Previous Architecture

| Aspect | Previous | Current |
|--------|----------|---------|
| Document Type | Separate StockIssue entity | Filtered view of SR |
| Reference | Separate SI-NNNN | Uses SR reference |
| Status | IssueStatus enum (3 values) | Uses SRStatus (5 values) |
| Data Storage | Separate mockStockIssues | Part of mockStoreRequisitions |
| Actions | SI-specific actions | View and Print only |
| Stage Changes | Could complete from SI view | Stage managed in SR only |

## 15. Related OUT-Direction Documents

| Document | Source | Created By | Use Case |
|----------|--------|-----------|---------|
| Stock Issue (this module) | Store Requisition | User | Manual direct issue from store to department |
| Sales Consumption (SC) | POS sales pipeline | System | Automatic ingredient deduction from menu sales at shift close |
| Wastage Report | User report | User | Spoilage, spillage, expired inventory |

For POS-driven inventory depletion, see [Sales Consumption](../sales-consumption/INDEX-sales-consumption.md). SC is system-generated and should not be confused with manually-created Stock Issues.

---

## 16. Differences from Stock Transfers

| Aspect | Stock Transfer | Stock Issue |
|--------|---------------|-------------|
| Destination Type | INVENTORY | DIRECT (expense) |
| Stock at Destination | Added to inventory | Not tracked (expensed) |
| Cost Treatment | Transfer at cost | Immediate expense |
| Department | Optional | Required |
| COGS Impact | No | Yes |
| GL Entries | None (balance sheet only) | Expense + Inventory credit |
