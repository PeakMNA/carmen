# Store Requisition & Stock Replenishment System
## Business Rules & Process Documentation

**Version:** 1.0  
**Last Updated:** December 2025  
**Module:** Inventory Management

---

## 1. Overview

### 1.1 Purpose
This document defines the business rules and processes for the integrated Store Requisition (SR), Stock Replenishment, and Purchase Requisition (PR) system. The system automates inventory movement decisions based on stock availability and user-defined locations.

### 1.2 Scope
- Store Requisition creation and processing
- Automatic document type determination
- Stock Replenishment (PAR-based)
- Purchase Requisition generation
- Stock Transfer and Issue generation

### 1.3 Key Principles
1. **User selects destination ("To")** — from their assigned locations only
2. **System determines source ("From")** — based on stock availability
3. **Document type is automatic** — derived from From/To combination
4. **Partial fulfillment supported** — splits into multiple documents when needed

---

## 2. Core Concepts

### 2.1 Location Types

| Type | Code | Description | Inventory Impact |
|------|------|-------------|------------------|
| **Inventory** | `INV` | Physical storage location (warehouse, store room) | Tracks stock quantities |
| **Direct** | `DIR` | Cost center for immediate consumption | Expenses immediately, no stock tracking |

### 2.2 Document Types Generated

| Document | Code | Trigger Condition | Purpose |
|----------|------|-------------------|---------|
| **Stock Transfer** | `ST` | From: Inventory → To: Inventory | Move stock between locations |
| **Stock Issue** | `SI` | From: Inventory → To: Direct | Issue stock to expense/consumption |
| **Purchase Requisition** | `PR` | No "From" available (zero stock) | Request external purchase |

### 2.3 Document Type Determination Matrix

| From Location | To Location Type | Resulting Document |
|---------------|------------------|-------------------|
| Has Stock | INVENTORY | Stock Transfer (ST) |
| Has Stock | DIRECT | Stock Issue (SI) |
| No Stock | INVENTORY | Purchase Requisition (PR) |
| No Stock | DIRECT | Purchase Requisition (PR) |
| Partial Stock | INVENTORY | ST (partial) + PR (shortage) |
| Partial Stock | DIRECT | SI (partial) + PR (shortage) |

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
| `APPROVE` | Approve SR/transfers for this location |

---

## 4. Store Requisition (SR) Process

### 4.1 SR Header Fields

| Field | Required | Rules |
|-------|----------|-------|
| Department | Yes | Fixed per SR, cannot mix departments |
| To Location | Yes | Must be from user's assigned locations |
| To Location Type | Auto | Derived from selected location |
| Required Date | Yes | Must be ≥ today |
| Reference | No | Free text for internal tracking |
| Notes | No | Additional instructions |

### 4.2 SR Line Item Fields

| Field | Required | Rules |
|-------|----------|-------|
| Item | Yes | Active inventory item |
| Requested Qty | Yes | > 0 |
| UOM | Auto | From item master (can convert) |
| From Location | Auto | System determines based on stock |
| Available Qty | Auto | Real-time stock check |
| Document Type | Auto | Calculated per line |
| Fulfillable Qty | Auto | Min(Available, Requested) |
| Shortage Qty | Auto | Requested - Fulfillable |

### 4.3 Line Item Processing Logic

```
FOR each line item:
  1. Check stock across all potential source locations
  2. Select best source (priority order, exclude "To" location)
  
  IF availableStock >= requestedQty:
    → Full fulfillment
    → Document = TRANSFER (if To=INV) or ISSUE (if To=DIR)
    
  ELSE IF availableStock > 0:
    → Partial fulfillment
    → Document 1 = TRANSFER/ISSUE for availableQty
    → Document 2 = PR for (requestedQty - availableQty)
    
  ELSE (availableStock = 0):
    → No fulfillment from inventory
    → Document = PR for full requestedQty
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

### 4.5 SR Status Flow

```
DRAFT
  ↓ Submit
SUBMITTED
  ↓ Approve / Reject
APPROVED ←──────────────────┐
  ↓ Process                 │
PROCESSING                  │
  ↓ Generate Documents      │
PROCESSED                   │ Reopen (if docs cancelled)
  ↓ All linked docs complete│
COMPLETED ──────────────────┘
  
REJECTED (terminal - can create new SR)
CANCELLED (terminal)
```

---

## 5. Document Generation Rules

### 5.1 On SR Approval/Processing

```
1. Group all line actions by document type
2. Further group by "From" location (for ST/SI)
3. Create one document per group

Example:
  SR Lines:
    - Beef 50: From Main Store → Transfer
    - Fish 30: From Main Store → Transfer  
    - Fish 20: No stock → PR
    - Wine 10: From Main Store → Issue (Direct)
  
  Generated Documents:
    - ST-001: Beef 50 + Fish 30 (Main Store → Kitchen)
    - SI-001: Wine 10 (Main Store → F&B Cost Center)
    - PR-001: Fish 20
```

### 5.2 Stock Transfer (ST) Generation

| Field | Source |
|-------|--------|
| From Location | Line item's determined source |
| To Location | SR header "To Location" |
| Items/Qty | Grouped fulfillable quantities |
| Source Document | SR reference |
| Required Date | SR required date |

**Inventory Impact:**
- On Issue: Deduct from source location
- On Receive: Add to destination location

### 5.3 Stock Issue (SI) Generation

| Field | Source |
|-------|--------|
| From Location | Line item's determined source |
| Cost Center | From "To Location" (Direct type) |
| Department | SR department |
| Items/Qty | Grouped fulfillable quantities |
| Source Document | SR reference |

**Inventory Impact:**
- On Issue: Deduct from source location
- On Issue: Post expense to cost center/GL

### 5.4 Purchase Requisition (PR) Generation

| Field | Source |
|-------|--------|
| Deliver To | Configurable (see 5.5) |
| Department | SR department |
| Items/Qty | Shortage quantities |
| Preferred Vendor | From item master (optional) |
| Source Document | SR reference |
| Required Date | SR required date + lead time |

### 5.5 PR Delivery Destination Options

| Configuration | Behavior | Use Case |
|---------------|----------|----------|
| `FROM_LOCATION` | Deliver to source location (Main Store) | Centralized receiving, then transfer |
| `TO_LOCATION` | Deliver to requesting location | Direct delivery to outlet |
| `USER_SELECT` | User chooses during SR | Flexible per situation |

**Default:** `FROM_LOCATION` (centralized receiving recommended)

---

## 6. Stock Replenishment (PAR-Based)

### 6.1 PAR Level Configuration

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

### 6.2 Replenishment Trigger Logic

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

### 6.3 Replenishment Processing

```
FOR each replenishment suggestion:
  
  1. Find source location with stock
  
  2. Apply same logic as SR:
     - Full stock available → Create Transfer/Issue
     - Partial stock → Create Transfer/Issue + PR
     - No stock → Create PR
  
  3. Options for output:
     a) Create Draft SR for review
     b) Auto-submit SR (if within thresholds)
     c) Create documents directly (high automation)
```

### 6.4 Auto-Replenishment Modes

| Mode | Behavior | Approval |
|------|----------|----------|
| `SUGGEST` | Creates draft SR for review | Manual submit + approval |
| `AUTO_DRAFT` | Creates submitted SR | Approval required |
| `AUTO_APPROVE` | Creates approved SR, generates docs | No approval (threshold-based) |

---

## 7. Workflow Integration

### 7.1 Workflow Types (Header Level)

| Workflow | Description | Typical Use |
|----------|-------------|-------------|
| `TRANSFER_INTERNAL` | Between inventory locations | Warehouse to outlet |
| `MAIN_STORE` | Central warehouse to outlets | Standard replenishment |
| `DIRECT` | Inventory to expense | Immediate consumption |
| `CONSIGNMENT` | Special vendor-owned stock | Stock in/out only |

### 7.2 Workflow Selection Impact

```
When workflow selected:
  - Filters available "To" locations
  - Sets default approval chain
  - May restrict certain item types
  - Determines GL posting rules
```

---

## 8. Approval Rules

### 8.1 Workflow Engine Integration

Approval routing is managed by the **Workflow Engine** based on configured workflow definitions. The SR module does not define approval thresholds or routing logic internally.

| Aspect | Handling |
|--------|----------|
| Approval levels | Defined in Workflow Configuration |
| Routing conditions | Defined in Workflow Configuration |
| Escalation rules | Defined in Workflow Configuration |
| Parallel/Sequential | Defined in Workflow Configuration |

### 8.2 Generated Document Approval

| Document | Approval Rule |
|----------|---------------|
| Stock Transfer | Follows SR approval (pre-approved) |
| Stock Issue | Follows SR approval (pre-approved) |
| Purchase Requisition | Separate workflow configuration for PR |

### 8.3 Workflow Assignment

Each document type can be assigned a different workflow:

```
Document Type → Workflow Configuration
  SR          → SR Workflow (configured in workflow engine)
  ST          → Inherits SR approval OR separate ST Workflow
  SI          → Inherits SR approval OR separate SI Workflow
  PR          → PR Workflow (configured in workflow engine)
```

---

## 9. Inventory Impact Summary

### 9.1 Transaction Types

| Event | Source Location | Destination | Timing |
|-------|-----------------|-------------|--------|
| Transfer Issue | -Qty | — | On issue |
| Transfer Receive | — | +Qty | On receive |
| Stock Issue | -Qty | Expense | On issue |
| PR → PO → GR | — | +Qty | On goods receipt |

### 9.2 Stock Reservation (Optional)

```
IF reservation enabled:
  - On SR Approval: Reserve stock at source
  - On Document Cancel: Release reservation
  - On Transfer Issue: Convert reservation to movement
```

---

## 10. Document Linking & Traceability

### 10.1 Link Structure

```
StoreRequisition (SR-001)
  ├── StockTransfer (ST-001)
  │     ├── TransferIssue (TI-001)
  │     └── TransferReceive (TR-001)
  ├── StockIssue (SI-001)
  └── PurchaseRequisition (PR-001)
        └── PurchaseOrder (PO-001)
              └── GoodsReceipt (GR-001)
```

### 10.2 SR Completion Rules

```
SR Status = COMPLETED when:
  - All linked Transfers: Received
  - All linked Issues: Issued
  - All linked PRs: One of:
    a) PO received (GR complete)
    b) PR cancelled
    c) PR fulfilled via alternative

SR Status = PARTIAL_COMPLETE when:
  - Some documents complete, others pending
```

---

## 11. Business Rules Summary

### 11.1 Core Rules

| # | Rule |
|---|------|
| BR-01 | "To" location must be from user's assigned locations |
| BR-02 | "From" location is system-determined based on stock availability |
| BR-03 | Document type is automatically determined, not user-selected |
| BR-04 | One SR can generate multiple documents (ST, SI, PR) |
| BR-05 | Partial stock creates split: Transfer/Issue + PR |
| BR-06 | Zero stock creates PR for full quantity |
| BR-07 | Department is fixed per SR (no mixing) |
| BR-08 | PR delivers to configured location (From or To) |

### 11.2 Validation Rules

| # | Rule |
|---|------|
| VR-01 | Requested quantity must be > 0 |
| VR-02 | Required date must be ≥ current date |
| VR-03 | Item must be active and requestable |
| VR-04 | User must have REQUEST permission for To location |
| VR-05 | Cannot request from same location as To |
| VR-06 | UOM must be valid for item |

### 11.3 Processing Rules

| # | Rule |
|---|------|
| PR-01 | Stock check is real-time on line item entry |
| PR-02 | Documents generated only on approval |
| PR-03 | Generated documents inherit SR approval status |
| PR-04 | PR requires separate approval workflow |
| PR-05 | Cancelling SR cancels all pending linked documents |
| PR-06 | Cannot edit SR after documents generated |

---

## 12. Configuration Parameters

### 12.1 System Settings

| Parameter | Type | Description |
|-----------|------|-------------|
| `pr.deliveryDestination` | Enum | Where PR delivers (FROM/TO/SELECT) |
| `sr.allowPartialFulfillment` | Boolean | Enable line splitting |
| `sr.autoSelectSource` | Boolean | Auto-select From location |
| `sr.allowSourceOverride` | Boolean | User can change From |
| `sr.reserveStockOnApproval` | Boolean | Reserve stock when approved |
| `replenishment.mode` | Enum | SUGGEST/AUTO_DRAFT/AUTO_APPROVE |
| `replenishment.schedule` | Cron | Auto-replenishment schedule |

### 12.2 Location Settings

| Parameter | Type | Description |
|-----------|------|-------------|
| `isSourceLocation` | Boolean | Can be used as "From" |
| `isRequestableLocation` | Boolean | Can be used as "To" |
| `locationType` | Enum | INVENTORY / DIRECT |
| `defaultCostCenter` | String | For Direct locations |
| `sourcePriority` | Number | Order for source selection |

---

## 13. Appendix

### 13.1 Status Definitions

**SR Status:**
- `DRAFT` - Created, not submitted
- `SUBMITTED` - Awaiting approval
- `APPROVED` - Approved, pending processing
- `PROCESSING` - Generating documents
- `PROCESSED` - Documents created
- `PARTIAL_COMPLETE` - Some documents fulfilled
- `COMPLETED` - All documents fulfilled
- `REJECTED` - Approval rejected
- `CANCELLED` - Cancelled by user

**Document Status (ST/SI):**
- `PENDING` - Created, not actioned
- `ISSUED` - Stock issued from source
- `IN_TRANSIT` - Issued, not received (Transfer only)
- `RECEIVED` - Stock received at destination
- `CANCELLED` - Cancelled

**PR Status:**
- `DRAFT` - Created
- `SUBMITTED` - Awaiting approval
- `APPROVED` - Ready for PO
- `ORDERED` - PO created
- `PARTIAL_RECEIVED` - Some items received
- `RECEIVED` - All items received
- `CANCELLED` - Cancelled

### 13.2 Glossary

| Term | Definition |
|------|------------|
| PAR Level | Periodic Automatic Replenishment level - target stock quantity |
| Reorder Point | Stock level that triggers replenishment |
| Lead Time | Days from order to delivery |
| Safety Stock | Buffer stock for demand variability |
| Direct Issue | Stock issued directly to expense without destination inventory |
| Transfer | Movement of stock between inventory locations |

---

*End of Document*
