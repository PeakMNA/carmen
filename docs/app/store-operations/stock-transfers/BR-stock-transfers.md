# Business Rules: Stock Transfers View

## 1. Overview

This document defines the business rules for the Stock Transfers view.

**KEY ARCHITECTURE**: Stock Transfers are NOT separate documents. They are **read-only audit views** of Store Requisitions at the Issue or Complete stage with INVENTORY type destinations.

- **Stock Transfer View** = SRs where (stage='issue' OR stage='complete') AND destinationLocationType='INVENTORY'
- The ST page provides a specialized **read-only view** focused on inventory movements between locations
- All workflow actions (approve, issue, complete) are performed in the Store Requisitions module, not in Stock Transfers
- Stock Transfers supports **View and Print only** - no stage changes

## 2. View Definition

### 2.1 What Appears in Stock Transfer View

| Criteria | Value | Description |
|----------|-------|-------------|
| SR Stage | Issue OR Complete | SR must be at Issue or Complete stage |
| Destination Type | INVENTORY | Destination must be an INVENTORY location |

### 2.2 What Does NOT Appear

- SRs at Draft, Submit, or Approve stages
- SRs with DIRECT destination (those appear in Stock Issues)
- Cancelled or Voided SRs

## 3. Document Reference Format

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-ST-REF-001 | Reference Number | Uses the source SR reference (SR-YYMM-NNNN) |
| BR-ST-REF-002 | No Separate Number | Stock Transfers do not have separate reference numbers |
| BR-ST-REF-003 | Traceability | Always traceable back to source SR |

## 4. Location Type Rules

### 4.1 Source Location (From)

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-ST-LOC-001 | Source Location Type | Must be INVENTORY type (defined in SR) |
| BR-ST-LOC-002 | Source Stock Availability | Checked when SR reaches Issue stage |
| BR-ST-LOC-003 | Source Location Active | Location must be active |

### 4.2 Destination Location (To)

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-ST-LOC-004 | Destination Location Type | Must be INVENTORY type (this makes it a "transfer" vs "issue") |
| BR-ST-LOC-005 | Destination Active | Location must be active |
| BR-ST-LOC-006 | Location Difference | Source and destination must be different |

## 5. Status & Stage Rules

### 5.1 Status (from underlying SR)

| Status | Description | Meaning for Transfer View |
|--------|-------------|---------------------------|
| in_progress | SR is being processed | Transfer is active |
| completed | SR workflow complete | Transfer is complete |

### 5.2 Stage (from underlying SR)

| Stage | Description | Transfer View |
|-------|-------------|---------------|
| issue | Items have been issued | Shows in Stock Transfer list |
| complete | All items processed | Shows in Stock Transfer list (as completed) |

### 5.3 Stage Flow

```
SR Stage Flow:
Draft → Submit → Approve → Issue → Complete
                            ↓         ↓
                   Both stages appear in Stock Transfer view
                   (if destination = INVENTORY)

Stage management happens in Store Requisitions, NOT in Stock Transfers
```

## 6. Actions (Read-Only)

| Rule ID | Action | Performed On | Description |
|---------|--------|--------------|-------------|
| BR-ST-ACT-001 | View Transfer | ST View | Read-only view of SR as transfer |
| BR-ST-ACT-002 | View Full SR | SR Detail | Navigate to full SR detail (link only) |
| BR-ST-ACT-003 | Print | ST View | Print transfer slip |

**Note**: Stage management (Issue → Complete) is performed in the Store Requisitions module. Stock Transfers is a read-only audit view.

## 7. Quantity Rules

### 7.1 Quantities (from SR Items)

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-ST-QTY-001 | Requested Qty | From SR item requestedQty |
| BR-ST-QTY-002 | Approved Qty | From SR item approvedQty |
| BR-ST-QTY-003 | Issued Qty | From SR item issuedQty |
| BR-ST-QTY-004 | Unit | From SR item unit |

### 7.2 No Receipt Process

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-ST-QTY-005 | No Receive | Receipt confirmation has been removed |
| BR-ST-QTY-006 | Auto-Complete | Issue = Complete for stock transfers |
| BR-ST-QTY-007 | No Variance | No issued vs received variance tracking |

## 8. Stock Movement Rules

### 8.1 On Issue (When SR reaches Issue stage)

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-ST-MOV-001 | Source Deduction | Deduct issuedQty from source location |
| BR-ST-MOV-002 | Destination Addition | Add issuedQty to destination location |
| BR-ST-MOV-003 | Issue Timestamp | Record issuedAt and issuedBy on SR |
| BR-ST-MOV-004 | Immediate | Stock movement is immediate (no transit state) |

## 9. Costing Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-ST-COST-001 | Unit Cost | From SR item unitCost |
| BR-ST-COST-002 | Total Value | totalCost = issuedQty x unitCost |
| BR-ST-COST-003 | Cost Transfer | Cost moves with stock (no markup) |
| BR-ST-COST-004 | Currency | System base currency |

## 10. GL Impact Rules

### 10.1 No GL Entries

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-ST-GL-001 | Balance Sheet Only | Transfer is balance sheet movement only |
| BR-ST-GL-002 | No COGS | No Cost of Goods Sold impact |
| BR-ST-GL-003 | No Expense | No expense recording |

### 10.2 Cost Movement

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-ST-GL-004 | Inventory Transfer | Inventory value moves between location accounts |
| BR-ST-GL-005 | No Markup | Cost transfers at book value |

## 11. Access Control Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-ST-ACC-001 | View Access | Users with store_operations.view permission |
| BR-ST-ACC-002 | Print Access | Users with store_operations.view permission |
| BR-ST-ACC-003 | Location Filter | Users may see only their locations |
| BR-ST-ACC-004 | Stage Actions | Not available - managed in Store Requisitions |

## 12. Business Constraints Summary

| Constraint | Rule |
|------------|------|
| View Type | Read-only audit view of SRs |
| Location Types | INVENTORY to INVENTORY only |
| Stage Required | SR must be at Issue or Complete stage |
| Available Actions | View and Print only |
| Stage Management | Handled by Store Requisitions module |
| Receipt | No separate receipt process |

## 13. Differences from Previous Architecture

| Aspect | Previous | Current |
|--------|----------|---------|
| Document Type | Separate StockTransfer entity | Filtered view of SR |
| Reference | Separate ST-NNNN | Uses SR reference |
| Status | TransferStatus enum (5 values) | Uses SRStatus (5 values) |
| Receipt | Separate receive action | Removed (issue = complete) |
| Data Storage | Separate mockStockTransfers | Part of mockStoreRequisitions |
| Actions | ST-specific actions | View and Print only |
| Stage Changes | Could complete from ST view | Stage managed in SR only |

## 14. Differences from Stock Issues

| Aspect | Stock Transfer | Stock Issue |
|--------|----------------|-------------|
| Destination Type | INVENTORY | DIRECT (expense) |
| Stock at Destination | Added to inventory | Not tracked (expensed) |
| Cost Treatment | Transfer at cost | Immediate expense |
| Department | Optional | Required |
| COGS Impact | No | Yes |
| GL Entries | None (balance sheet only) | Expense + Inventory credit |
