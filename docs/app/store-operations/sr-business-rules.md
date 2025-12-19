# Store Requisition & Stock Replenishment System
## Business Rules & Process Documentation

**Version:** 2.0
**Last Updated:** December 2025
**Module:** Inventory Management

---

## 1. Overview

### 1.1 Purpose
This document defines the business rules and processes for the integrated Store Requisition (SR), Stock Replenishment, and Purchase Requisition (PR) system. The system automates inventory movement decisions based on stock availability and user-defined locations.

### 1.2 KEY ARCHITECTURE: ST/SI as Views
**IMPORTANT**: Stock Transfer (ST) and Stock Issue (SI) are NOT separate documents. They are **filtered views** of Store Requisitions at the Issue stage.

| View | Filter Criteria | Purpose |
|------|-----------------|---------|
| Stock Transfer | SR stage = 'issue'/'complete' AND destinationLocationType = 'INVENTORY' | View SRs being issued to inventory locations |
| Stock Issue | SR stage = 'issue'/'complete' AND destinationLocationType = 'DIRECT' | View SRs being issued to expense locations |

### 1.3 Scope
- Store Requisition creation and processing
- Automatic document type determination (view-based)
- Stock Replenishment (PAR-based)
- Purchase Requisition generation
- Stock Transfer and Issue views

### 1.4 Key Principles
1. **User selects destination ("To")** — from their assigned locations only
2. **System determines source ("From")** — based on stock availability
3. **View type is automatic** — derived from destination location type
4. **Partial fulfillment supported** — splits into multiple documents when needed
5. **ST/SI are views, not documents** — all actions performed on the underlying SR

---

## 2. Core Concepts

### 2.1 Location Types

| Type | Code | Description | Inventory Impact |
|------|------|-------------|------------------|
| **Inventory** | `INVENTORY` | Physical storage location (warehouse, store room) | Tracks stock quantities |
| **Direct** | `DIRECT` | Cost center for immediate consumption | Expenses immediately, no stock tracking |

### 2.2 View Types (Based on Destination)

| View | Destination Type | Purpose | Actions Available |
|------|------------------|---------|-------------------|
| **Stock Transfer** | INVENTORY | Track inventory movements | View, Print, Navigate to SR |
| **Stock Issue** | DIRECT | Track expense allocations | View, Print, Navigate to SR |

**Note**: These are read-only views. All workflow actions (approve, issue, complete) are performed on the underlying Store Requisition.

### 2.3 Document Type Determination Matrix

| Source Stock | Destination Type | Result |
|--------------|------------------|--------|
| Has Stock | INVENTORY | SR appears in Stock Transfer view |
| Has Stock | DIRECT | SR appears in Stock Issue view |
| No Stock | INVENTORY | Purchase Requisition (PR) created |
| No Stock | DIRECT | Purchase Requisition (PR) created |
| Partial Stock | INVENTORY | SR in Transfer view + PR for shortage |
| Partial Stock | DIRECT | SR in Issue view + PR for shortage |

---

## 3. User Location Assignment

### 3.1 Rules
- Users can only select "To" locations from their **assigned locations**
- Assignment is configured per user in system administration
- Each assignment specifies location type (Inventory/Direct) and permissions

### 3.2 Location Assignment Structure

```
UserLocationAssignment:
  - userId: string
  - locationId: string
  - locationType: INVENTORY | DIRECT
  - permissions: [REQUEST, RECEIVE, ISSUE, APPROVE]
  - isDefault: boolean
```

### 3.3 Permission Definitions

| Permission | Allows |
|------------|--------|
| `REQUEST` | Create SR for this location as "To" |
| `RECEIVE` | Confirm receipt of transfers/deliveries |
| `ISSUE` | Issue stock from this location |
| `APPROVE` | Approve SR for this location |

---

## 4. Store Requisition (SR) Process

### 4.1 SR Header Fields

| Field | Required | Rules |
|-------|----------|-------|
| Department | Yes (DIRECT only) | Required for expense allocation |
| To Location | Yes | Must be from user's assigned locations |
| To Location Type | Auto | Derived from selected location |
| Required Date | Yes | Must be ≥ today |
| Reference | No | Free text for internal tracking |
| Notes | No | Additional instructions |
| Expense Account | No (DIRECT only) | For expense allocation |

### 4.2 SR Line Item Fields

| Field | Required | Rules |
|-------|----------|-------|
| Item | Yes | Active inventory item |
| Requested Qty | Yes | > 0 |
| UOM | Auto | From item master (can convert) |
| From Location | Auto | System determines based on stock |
| Available Qty | Auto | Real-time stock check |
| Approved Qty | Auto | Set during approval |
| Issued Qty | Auto | Set during issue |
| Unit Cost | Auto | From stock valuation |
| Total Cost | Auto | issuedQty × unitCost |

### 4.3 Line Item Processing Logic

```
FOR each line item:
  1. Check stock across all potential source locations
  2. Select best source (priority order, exclude "To" location)

  IF availableStock >= requestedQty:
    → Full fulfillment possible
    → SR will appear in Transfer/Issue view based on destination type

  ELSE IF availableStock > 0:
    → Partial fulfillment
    → SR appears in Transfer/Issue view for available qty
    → PR created for shortage qty

  ELSE (availableStock = 0):
    → No fulfillment from inventory
    → PR created for full requestedQty
```

### 4.4 Source Location Selection Priority

```
1. Main Store / Central Warehouse (default primary)
2. Regional Warehouse (if configured)
3. Other Inventory locations with stock
4. Exclude: Requesting location itself

Selection Criteria:
- Has sufficient stock (full qty preferred)
- Lowest transfer cost/distance
- Not reserved for other orders
```

### 4.5 SR Status (5 Values)

| Status | Description |
|--------|-------------|
| `draft` | Created, can be edited |
| `in_progress` | Submitted, in workflow (submit/approve/issue stages) |
| `completed` | All items issued, SR complete |
| `cancelled` | Cancelled before completion |
| `voided` | Voided after completion |

### 4.6 SR Workflow Stages (5 Stages)

| Stage | Status | Description | Actions Available |
|-------|--------|-------------|-------------------|
| `draft` | draft | SR created, can be edited | Edit, Submit, Cancel |
| `submit` | in_progress | SR submitted for approval | Approve, Reject, Cancel |
| `approve` | in_progress | SR approved, ready for issue | Issue, Cancel |
| `issue` | in_progress | Items being issued (visible in ST/SI views) | Complete, Cancel |
| `complete` | completed | All items issued, SR complete | Void, Print |

### 4.7 SR Status Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Stage    │ Status      │ Action                                             │
├──────────┼─────────────┼────────────────────────────────────────────────────┤
│ Draft    │ draft       │ Create SR, edit items                              │
│ Submit   │ in_progress │ Submit for approval                                │
│ Approve  │ in_progress │ Approve SR (role-based)                            │
│ Issue    │ in_progress │ Items issued (visible in ST/SI filtered views)     │
│ Complete │ completed   │ All items issued, SR complete                      │
└──────────┴─────────────┴────────────────────────────────────────────────────┘
         ↓ Can cancel at any stage (before complete)
      cancelled
         ↓ Can void after complete
       voided
```

### 4.8 View Visibility at Issue Stage

When SR reaches Issue stage:

```
SR reaches Issue Stage
       │
       ├── destinationLocationType === 'INVENTORY'
       │   └── Visible in /stock-transfers (Stock Transfer view)
       │
       └── destinationLocationType === 'DIRECT'
           └── Visible in /stock-issues (Stock Issue view)
```

---

## 5. Stock Transfer View (NOT a Document)

### 5.1 Architecture

**Stock Transfer is a FILTERED VIEW of Store Requisitions**, not a separate document.

```typescript
// Filter function for Stock Transfer view
const isStockTransfer = (sr: StoreRequisition): boolean => {
  return (
    (sr.stage === SRStage.Issue || sr.stage === SRStage.Complete) &&
    sr.destinationLocationType === InventoryLocationType.INVENTORY
  )
}
```

### 5.2 View Capabilities

| Capability | Available | Notes |
|------------|-----------|-------|
| View list | Yes | Filtered SR list |
| View details | Yes | SR detail in "transfer" layout |
| Search/filter | Yes | By ref, location, status |
| Print | Yes | Transfer document format |
| Edit | No | Edit via SR |
| Actions | No | Actions via SR |

### 5.3 Stock Movement (On Issue)

| Event | Source Location | Destination Location |
|-------|-----------------|---------------------|
| SR → Issue Stage | -Qty (deducted) | +Qty (added) |
| SR → Complete | No change | No change |

**Note**: Stock movement happens immediately when SR reaches Issue stage. There is no separate "in transit" or "receive" step.

### 5.4 Removed Features (Previous Architecture)

| Feature | Previous | Current |
|---------|----------|---------|
| TransferStatus enum | 5 values | Uses SRStatus (5 values) |
| StockTransfer interface | Separate entity | Filtered view of SR |
| StockTransferItem interface | Separate entity | Uses StoreRequisitionItem |
| Issue action | On transfer | On SR |
| Confirm Receipt action | On transfer | **Removed entirely** |
| Receipt tracking | receivedAt, receivedBy, receivedQty | Not applicable |
| InTransit status | Yes | No (Issue = Complete) |
| ST reference number | ST-YYMM-NNNN | Uses SR reference (SR-YYMM-NNNN) |

---

## 6. Stock Issue View (NOT a Document)

### 6.1 Architecture

**Stock Issue is a FILTERED VIEW of Store Requisitions**, not a separate document.

```typescript
// Filter function for Stock Issue view
const isStockIssue = (sr: StoreRequisition): boolean => {
  return (
    (sr.stage === SRStage.Issue || sr.stage === SRStage.Complete) &&
    sr.destinationLocationType === InventoryLocationType.DIRECT
  )
}
```

### 6.2 View Capabilities

| Capability | Available | Notes |
|------------|-----------|-------|
| View list | Yes | Filtered SR list |
| View details | Yes | SR detail in "issue" layout with dept/expense |
| Search/filter | Yes | By ref, location, department, status |
| Print | Yes | Issue document format |
| Edit | No | Edit via SR |
| Actions | No | Actions via SR |

### 6.3 Expense Allocation

Stock Issues display additional fields for expense allocation:

| Field | Description |
|-------|-------------|
| Department | Required for DIRECT destinations |
| Expense Account | Optional, defaults from department |

### 6.4 Stock Movement & Expense (On Issue)

| Event | Source Location | Expense Impact |
|-------|-----------------|----------------|
| SR → Issue Stage | -Qty (deducted) | Expense entry created |
| SR → Complete | No change | No change |

**Note**: Stock issued to DIRECT locations is immediately expensed. There is no inventory tracking at DIRECT locations.

### 6.5 Removed Features (Previous Architecture)

| Feature | Previous | Current |
|---------|----------|---------|
| IssueStatus enum | 3 values | Uses SRStatus (5 values) |
| StockIssue interface | Separate entity | Filtered view of SR |
| StockIssueItem interface | Separate entity | Uses StoreRequisitionItem |
| Issue action | On issue | On SR |
| SI reference number | SI-YYMM-NNNN | Uses SR reference (SR-YYMM-NNNN) |

---

## 7. Purchase Requisition (PR) Generation

### 7.1 PR Creation Triggers

| Condition | Action |
|-----------|--------|
| Zero stock for item | Create PR for full requested qty |
| Partial stock | Create PR for shortage qty |
| SR approval | PR generated if stock insufficient |

### 7.2 PR Fields

| Field | Source |
|-------|--------|
| Deliver To | Configurable (see 7.3) |
| Department | SR department |
| Items/Qty | Shortage quantities |
| Preferred Vendor | From item master (optional) |
| Source Document | SR reference |
| Required Date | SR required date + lead time |

### 7.3 PR Delivery Destination Options

| Configuration | Behavior | Use Case |
|---------------|----------|----------|
| `FROM_LOCATION` | Deliver to source location (Main Store) | Centralized receiving, then transfer |
| `TO_LOCATION` | Deliver to requesting location | Direct delivery to outlet |
| `USER_SELECT` | User chooses during SR | Flexible per situation |

**Default:** `FROM_LOCATION` (centralized receiving recommended)

---

## 8. Stock Replenishment (PAR-Based)

### 8.1 PAR Level Configuration

```
PAR Configuration (per Location + Item):
  - locationId: string
  - itemId: string
  - parLevel: number (target stock level)
  - reorderPoint: number (trigger level)
  - minOrderQty: number (minimum to order)
  - maxOrderQty: number (maximum cap)
  - leadTimeDays: number
  - isActive: boolean
```

### 8.2 Replenishment Trigger Logic

```
Trigger Conditions (scheduled or on-demand):

FOR each location with PAR configured:
  FOR each item with PAR at this location:

    currentStock = getAvailableStock(location, item)

    IF currentStock <= reorderPoint:
      suggestedQty = parLevel - currentStock
      suggestedQty = MAX(suggestedQty, minOrderQty)
      suggestedQty = MIN(suggestedQty, maxOrderQty)

      → Add to replenishment suggestions
```

### 8.3 Replenishment Processing

```
FOR each replenishment suggestion:

  1. Find source location with stock

  2. Apply same logic as SR:
     - Full stock available → Create SR (appears in Transfer/Issue view)
     - Partial stock → Create SR + PR for shortage
     - No stock → Create PR

  3. Options for output:
     a) Create Draft SR for review
     b) Auto-submit SR (if within thresholds)
     c) Create documents directly (high automation)
```

### 8.4 Auto-Replenishment Modes

| Mode | Behavior | Approval |
|------|----------|----------|
| `SUGGEST` | Creates draft SR for review | Manual submit + approval |
| `AUTO_DRAFT` | Creates submitted SR | Approval required |
| `AUTO_APPROVE` | Creates approved SR, advances to Issue | No approval (threshold-based) |

---

## 9. Workflow Integration

### 9.1 Workflow Types (Header Level)

| Workflow | Description | Typical Use |
|----------|-------------|-------------|
| `TRANSFER_INTERNAL` | Between inventory locations | Warehouse to outlet |
| `MAIN_STORE` | Central warehouse to outlets | Standard replenishment |
| `DIRECT` | Inventory to expense | Immediate consumption |
| `CONSIGNMENT` | Special vendor-owned stock | Stock in/out only |

### 9.2 Workflow Selection Impact

```
When workflow selected:
  - Filters available "To" locations
  - Sets default approval chain
  - May restrict certain item types
  - Determines GL posting rules
```

---

## 10. Approval Rules

### 10.1 Workflow Engine Integration

Approval routing is managed by the **Workflow Engine** based on configured workflow definitions. The SR module does not define approval thresholds or routing logic internally.

| Aspect | Handling |
|--------|----------|
| Approval levels | Defined in Workflow Configuration |
| Routing conditions | Defined in Workflow Configuration |
| Escalation rules | Defined in Workflow Configuration |
| Parallel/Sequential | Defined in Workflow Configuration |

### 10.2 PR Approval

| Document | Approval Rule |
|----------|---------------|
| Store Requisition | SR Workflow (configured in workflow engine) |
| Purchase Requisition | Separate workflow configuration for PR |

**Note**: ST and SI do not have separate approval workflows since they are views of the SR.

---

## 11. Inventory Impact Summary

### 11.1 Transaction Types

| Event | Source Location | Destination | Timing |
|-------|-----------------|-------------|--------|
| SR → Issue Stage (INVENTORY dest) | -Qty | +Qty | Immediate on Issue stage |
| SR → Issue Stage (DIRECT dest) | -Qty | Expense | Immediate on Issue stage |
| PR → PO → GR | — | +Qty | On goods receipt |

### 11.2 Stock Reservation (Optional)

```
IF reservation enabled:
  - On SR Approval: Reserve stock at source
  - On SR Cancel: Release reservation
  - On SR Issue: Convert reservation to movement
```

---

## 12. Document Linking & Traceability

### 12.1 Link Structure

```
StoreRequisition (SR-001)
  │
  ├── [View] Stock Transfer view (if dest = INVENTORY)
  │   └── Read-only view of SR at Issue/Complete stage
  │
  ├── [View] Stock Issue view (if dest = DIRECT)
  │   └── Read-only view of SR at Issue/Complete stage
  │
  └── PurchaseRequisition (PR-001) [if shortage]
        └── PurchaseOrder (PO-001)
              └── GoodsReceipt (GR-001)
```

**Note**: Stock Transfer and Stock Issue are VIEWS, not linked documents. They display SR data filtered by destination type.

### 12.2 SR Completion Rules

```
SR Status = COMPLETED when:
  - SR reaches Complete stage
  - All items issued

SR can be VOIDED after completion:
  - Creates reversal entries
  - SR marked as voided

Linked PR completion:
  - PR follows separate workflow
  - SR does not wait for PR completion
```

---

## 13. Business Rules Summary

### 13.1 Core Rules

| # | Rule |
|---|------|
| BR-01 | "To" location must be from user's assigned locations |
| BR-02 | "From" location is system-determined based on stock availability |
| BR-03 | View type (Transfer/Issue) is automatically determined by destination type |
| BR-04 | One SR can generate PR for shortage quantities |
| BR-05 | Partial stock creates: SR (partial) + PR (shortage) |
| BR-06 | Zero stock creates PR for full quantity |
| BR-07 | Department is required for DIRECT destinations |
| BR-08 | PR delivers to configured location (From or To) |
| BR-09 | ST/SI are read-only views; all actions on SR |
| BR-10 | Stock movement is immediate on Issue stage (no separate receipt) |

### 13.2 Validation Rules

| # | Rule |
|---|------|
| VR-01 | Requested quantity must be > 0 |
| VR-02 | Required date must be ≥ current date |
| VR-03 | Item must be active and requestable |
| VR-04 | User must have REQUEST permission for To location |
| VR-05 | Cannot request from same location as To |
| VR-06 | UOM must be valid for item |
| VR-07 | Department required for DIRECT destinations |
| VR-08 | Expense account must be active (if specified) |

### 13.3 Processing Rules

| # | Rule |
|---|------|
| PR-01 | Stock check is real-time on line item entry |
| PR-02 | SR advances through stages: Draft → Submit → Approve → Issue → Complete |
| PR-03 | PR generated on approval if stock insufficient |
| PR-04 | PR requires separate approval workflow |
| PR-05 | Cancelling SR at any stage before Complete |
| PR-06 | Cannot edit SR after Issue stage |
| PR-07 | Voiding allowed only after Complete stage |

---

## 14. Configuration Parameters

### 14.1 System Settings

| Parameter | Type | Description |
|-----------|------|-------------|
| `pr.deliveryDestination` | Enum | Where PR delivers (FROM/TO/SELECT) |
| `sr.allowPartialFulfillment` | Boolean | Enable line splitting |
| `sr.autoSelectSource` | Boolean | Auto-select From location |
| `sr.allowSourceOverride` | Boolean | User can change From |
| `sr.reserveStockOnApproval` | Boolean | Reserve stock when approved |
| `replenishment.mode` | Enum | SUGGEST/AUTO_DRAFT/AUTO_APPROVE |
| `replenishment.schedule` | Cron | Auto-replenishment schedule |

### 14.2 Location Settings

| Parameter | Type | Description |
|-----------|------|-------------|
| `isSourceLocation` | Boolean | Can be used as "From" |
| `isRequestableLocation` | Boolean | Can be used as "To" |
| `locationType` | Enum | INVENTORY / DIRECT |
| `defaultCostCenter` | String | For Direct locations |
| `sourcePriority` | Number | Order for source selection |

---

## 15. Appendix

### 15.1 Status Definitions

**SR Status (5 values):**
| Status | Description |
|--------|-------------|
| `draft` | Created, not submitted |
| `in_progress` | In workflow (submit/approve/issue stages) |
| `completed` | All items issued, SR complete |
| `cancelled` | Cancelled by user (before complete) |
| `voided` | Voided after completion |

**SR Workflow Stage (5 stages):**
| Stage | Status | Description |
|-------|--------|-------------|
| `draft` | draft | Initial creation, editable |
| `submit` | in_progress | Submitted for approval |
| `approve` | in_progress | Approved, ready for issue |
| `issue` | in_progress | Items being issued |
| `complete` | completed | All items issued |

**PR Status:**
| Status | Description |
|--------|-------------|
| `DRAFT` | Created |
| `SUBMITTED` | Awaiting approval |
| `APPROVED` | Ready for PO |
| `ORDERED` | PO created |
| `PARTIAL_RECEIVED` | Some items received |
| `RECEIVED` | All items received |
| `CANCELLED` | Cancelled |

### 15.2 Removed Status Definitions (Previous Architecture)

The following statuses have been **removed**:

**Previous SR Status (9 values) → Now 5 values:**
- ~~SUBMITTED~~ → in_progress
- ~~APPROVED~~ → in_progress (at approve stage)
- ~~PROCESSING~~ → Removed
- ~~PROCESSED~~ → Removed
- ~~PARTIAL_COMPLETE~~ → Removed
- ~~REJECTED~~ → Removed (use cancelled)

**Previous Transfer Status (5 values) → Removed:**
- ~~PENDING~~ → N/A (views use SR status)
- ~~ISSUED~~ → N/A
- ~~IN_TRANSIT~~ → N/A
- ~~RECEIVED~~ → N/A
- ~~CANCELLED~~ → N/A

**Previous Issue Status (3 values) → Removed:**
- ~~PENDING~~ → N/A (views use SR status)
- ~~ISSUED~~ → N/A
- ~~CANCELLED~~ → N/A

### 15.3 Glossary

| Term | Definition |
|------|------------|
| PAR Level | Periodic Automatic Replenishment level - target stock quantity |
| Reorder Point | Stock level that triggers replenishment |
| Lead Time | Days from order to delivery |
| Safety Stock | Buffer stock for demand variability |
| Direct Issue | Stock issued directly to expense without destination inventory |
| Transfer | Movement of stock between inventory locations |
| View | Filtered display of SR data (not a separate document) |
| Stage | Workflow position within the SR lifecycle |
| Status | Overall document state (draft, in_progress, completed, etc.) |

---

*End of Document*
