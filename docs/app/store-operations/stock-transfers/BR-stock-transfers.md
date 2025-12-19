# Business Rules: Stock Transfers View

## 1. Overview

This document defines the business rules for the Stock Transfers view.

**KEY ARCHITECTURE**: Stock Transfers are NOT separate documents. They are **filtered views** of Store Requisitions at the Issue stage with INVENTORY type destinations.

- **Stock Transfer View** = SRs where stage='issue' AND destinationLocationType='INVENTORY'
- All actions (issue, complete) are performed on the underlying SR, not a separate ST document
- The ST page provides a specialized view focused on inventory movements between locations

## 2. View Definition

### 2.1 What Appears in Stock Transfer View

| Criteria | Value | Description |
|----------|-------|-------------|
| SR Stage | Issue | SR must be at the Issue stage |
| Destination Type | INVENTORY | Destination must be an INVENTORY location |
| Status | in_progress OR completed | Only active or completed SRs |

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

| Status | Description | Meaning for Transfer |
|--------|-------------|---------------------|
| in_progress | SR is being processed | Transfer is active |
| completed | SR workflow complete | Transfer complete |

### 5.2 Stage (from underlying SR)

| Stage | Description | Transfer View |
|-------|-------------|---------------|
| issue | Items have been issued | Shows in Stock Transfer list |
| complete | All items processed | Shows as completed transfer |

### 5.3 Stage Flow

```
SR Stage Flow:
Draft → Submit → Approve → Issue → Complete
                            ↓
                   Appears in Stock Transfer view
                   (if destination = INVENTORY)
```

## 6. Actions (via SR)

| Rule ID | Action | Performed On | Description |
|---------|--------|--------------|-------------|
| BR-ST-ACT-001 | View Transfer | ST View | Read-only view of SR as transfer |
| BR-ST-ACT-002 | View Full SR | SR Detail | Navigate to full SR detail |
| BR-ST-ACT-003 | Complete | SR | Advances SR from Issue to Complete |
| BR-ST-ACT-004 | Print | ST View | Print transfer slip |

**Note**: All workflow actions (approve, issue, complete) are performed on the underlying SR.

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
| BR-ST-COST-002 | Total Value | totalCost = issuedQty × unitCost |
| BR-ST-COST-003 | Cost Transfer | Cost moves with stock (no markup) |
| BR-ST-COST-004 | Currency | System base currency |

## 10. Access Control Rules

| Rule ID | Rule | Description |
|---------|------|-------------|
| BR-ST-ACC-001 | View Access | Users with store_operations.view permission |
| BR-ST-ACC-002 | Actions | All actions via SR require SR permissions |
| BR-ST-ACC-003 | Location Filter | Users may see only their locations |

## 11. Business Constraints Summary

| Constraint | Rule |
|------------|------|
| View Type | Filtered view of SRs, not separate documents |
| Location Types | INVENTORY → INVENTORY only |
| Stage Required | SR must be at Issue or Complete stage |
| Actions | All performed on underlying SR |
| Receipt | No separate receipt process |

## 12. Differences from Previous Architecture

| Aspect | Previous | Current |
|--------|----------|---------|
| Document Type | Separate StockTransfer entity | Filtered view of SR |
| Reference | Separate ST-NNNN | Uses SR reference |
| Status | TransferStatus enum (5 values) | Uses SRStatus (5 values) |
| Receipt | Separate receive action | Removed (issue = complete) |
| Data Storage | Separate mockStockTransfers | Part of mockStoreRequisitions |
| Actions | ST-specific actions | SR actions only |
