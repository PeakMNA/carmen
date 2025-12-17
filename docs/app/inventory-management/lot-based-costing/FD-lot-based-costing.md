# FD-LOT: Lot-Based Costing Flow Diagrams

**Document Version**: 1.0
**Last Updated**: 2025-11-07
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Module**: Inventory Management
**Feature**: Lot-Based Costing with Automatic Lot Creation

---

## Document Overview

This document provides comprehensive flow diagrams for the lot-based costing system. It includes process flows, sequence diagrams, state transitions, and data flows to illustrate system behavior.

**Related Documents**:
- [BR-LOT: Business Requirements](./BR-lot-based-costing.md)
- [UC-LOT: Use Cases](./UC-lot-based-costing.md)
- [TS-LOT: Technical Specification](./TS-lot-based-costing.md)
- [DS-LOT: Data Schema](./DS-lot-based-costing.md)

---

## Process Flow Diagrams

### PFD-001: GRN Commitment with Lot Creation

**Description**: Complete flow from GRN commitment through lot record creation

```
┌─────────────────────────────────────────────────────────────────┐
│                    START: User Commits GRN                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   Validate GRN Status        │
              │   - Must be "APPROVED"       │
              │   - Has valid lines          │
              │   - Quantities > 0           │
              │   - Costs > 0                │
              └──────────┬───────────────────┘
                         │
                         ├──────── [INVALID] ──────┐
                         │                         ▼
                         │              ┌──────────────────────┐
                         │              │  Display Error       │
                         │              │  Return to User      │
                         │              └──────────────────────┘
                         │                         │
                         │                         ▼
                         │                      [END]
                         │
                    [VALID]
                         │
                         ▼
              ┌──────────────────────────────┐
              │   BEGIN DATABASE TRANSACTION │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   FOR EACH GRN LINE          │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Get Location Code          │
              │   - Query tb_location        │
              │   - Extract location_code    │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Generate Lot Number        │
              │   (See DFD-002)              │
              │   Result: MK-251107-0001     │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Create Transaction Detail  │
              │   - transaction_type = GRN   │
              │   - transaction_id = GRN-xxx │
              │   - product, location, qty   │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Create Cost Layer (LOT)    │
              │   - lot_no = generated       │
              │   - lot_index = 1            │
              │   - parent_lot_no = NULL     │
              │   - in_qty = line qty        │
              │   - out_qty = 0              │
              │   - cost_per_unit = line cost│
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Update Closing Balance     │
              │   (Optional)                 │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Log Activity               │
              │   - User, timestamp, details │
              └──────────┬───────────────────┘
                         │
                         ├──────── [MORE LINES] ────┐
                         │                          │
                         │                          ▼
                         │                   [LOOP BACK]
                         │
                    [ALL LINES PROCESSED]
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Update GRN Status          │
              │   - status = "COMMITTED"     │
              │   - committed_at = now()     │
              │   - committed_by = user_id   │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   COMMIT TRANSACTION         │
              └──────────┬───────────────────┘
                         │
                         ├──────── [ROLLBACK] ──────┐
                         │                          ▼
                         │                 ┌────────────────┐
                         │                 │  Display Error │
                         │                 │  Log Exception │
                         │                 └────────┬───────┘
                         │                          │
                         │                          ▼
                         │                        [END]
                         │
                    [SUCCESS]
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Display Success Message    │
              │   "GRN committed. 3 lots     │
              │    created: MK-251107-0001,  │
              │    MK-251107-0002,           │
              │    MK-251107-0003"           │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Revalidate UI Paths        │
              │   - /procurement/grn         │
              │   - /procurement/grn/[id]    │
              └──────────┬───────────────────┘
                         │
                         ▼
                      [END]
```

**Success Criteria**:
- ✅ GRN status changed to "COMMITTED"
- ✅ One lot created per GRN line
- ✅ Lot numbers follow format `{LOCATION}-{YYMMDD}-{SEQSEQ}`
- ✅ Cost layers created with `parent_lot_no = NULL`
- ✅ Inventory balances updated

**Failure Scenarios**:
- ❌ Invalid GRN status → Display error, no changes
- ❌ Duplicate lot number → Retry with incremented sequence
- ❌ Sequence limit exceeded → Block transaction, manual intervention
- ❌ Database constraint violation → Rollback transaction, log error

---

### PFD-002: Stock-In Adjustment with Lot Creation

**Description**: Stock-in adjustment creating new lot record

```
┌─────────────────────────────────────────────────────────────────┐
│              START: User Saves Stock-In Adjustment              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   Validate Adjustment Data   │
              │   - Quantity > 0 (stock-in)  │
              │   - Unit cost > 0            │
              │   - Valid reason code        │
              │   - Product/location exist   │
              └──────────┬───────────────────┘
                         │
                         ├──────── [INVALID] ──────┐
                         │                         ▼
                         │              ┌──────────────────────┐
                         │              │  Display Validation  │
                         │              │  Errors              │
                         │              └──────────┬───────────┘
                         │                         │
                         │                         ▼
                         │                      [END]
                         │
                    [VALID]
                         │
                         ▼
              ┌──────────────────────────────┐
              │   BEGIN DATABASE TRANSACTION │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Get Location Code          │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Generate Lot Number        │
              │   Location: PV               │
              │   Date: 2025-11-07           │
              │   Result: PV-251107-0005     │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Create Transaction Detail  │
              │   - type = adjustment        │
              │   - id = ADJ-2501-001234     │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Create Cost Layer (LOT)    │
              │   - lot_no = PV-251107-0005  │
              │   - lot_index = 1            │
              │   - parent_lot_no = NULL     │
              │   - in_qty = adjustment qty  │
              │   - out_qty = 0              │
              │   - cost_per_unit = user cost│
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Update Closing Balance     │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Log Activity               │
              │   - Reason, notes, timestamp │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   COMMIT TRANSACTION         │
              └──────────┬───────────────────┘
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Display Confirmation       │
              │   "Stock-in adjustment saved │
              │    Lot PV-251107-0005 created"│
              └──────────┬───────────────────┘
                         │
                         ▼
                      [END]
```

**Success Criteria**:
- ✅ New lot created with user-specified cost
- ✅ Adjustment reason recorded
- ✅ Inventory balance increased
- ✅ Lot traceability maintained

---

### PFD-003: FIFO Consumption (Issue Transaction)

**Description**: Issue transaction consuming inventory using FIFO methodology

```
┌─────────────────────────────────────────────────────────────────┐
│              START: User Creates Issue Transaction              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   Validate Issue Request     │
              │   - Issue quantity > 0       │
              │   - Product exists           │
              │   - Location has inventory   │
              └──────────┬───────────────────┘
                         │
                    [VALID]
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Check Available Balance    │
              │   Query: SUM(in_qty - out_qty)│
              └──────────┬───────────────────┘
                         │
                         ├──────── [INSUFFICIENT] ───┐
                         │                           ▼
                         │              ┌─────────────────────────┐
                         │              │  Display Error          │
                         │              │  "Insufficient inventory│
                         │              │   Available: 50 kg      │
                         │              │   Requested: 100 kg"    │
                         │              └─────────┬───────────────┘
                         │                        │
                         │                        ▼
                         │                      [END]
                         │
                    [SUFFICIENT]
                         │
                         ▼
              ┌──────────────────────────────┐
              │   Query Available Lots (FIFO)│
              │   SELECT lot_no, balance,    │
              │          cost_per_unit       │
              │   ORDER BY lot_no ASC        │
              └──────────┬───────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────────────┐
        │  Available Lots (Example):                     │
        │  1. MK-251105-0003: 30 kg @ $5.00/kg          │
        │  2. MK-251106-0008: 80 kg @ $5.20/kg          │
        │  3. MK-251107-0001: 50 kg @ $5.30/kg          │
        │                                                │
        │  Issue Request: 100 kg                         │
        └────────────┬───────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────────────┐
        │   FIFO Allocation Algorithm:                   │
        │                                                │
        │   Remaining = 100 kg                           │
        │                                                │
        │   Step 1: Process Lot 1                        │
        │   - Lot balance: 30 kg                         │
        │   - Consume: min(30, 100) = 30 kg             │
        │   - Cost: 30 × $5.00 = $150.00                │
        │   - Remaining: 100 - 30 = 70 kg               │
        │                                                │
        │   Step 2: Process Lot 2                        │
        │   - Lot balance: 80 kg                         │
        │   - Consume: min(80, 70) = 70 kg              │
        │   - Cost: 70 × $5.20 = $364.00                │
        │   - Remaining: 70 - 70 = 0 kg                 │
        │                                                │
        │   Total Cost: $150.00 + $364.00 = $514.00     │
        │   Weighted Avg: $514.00 / 100 = $5.14/kg      │
        └────────────┬───────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────────────┐
        │   BEGIN DATABASE TRANSACTION                   │
        └────────────┬───────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────────────┐
        │   Create Transaction Detail                    │
        │   - type = issue                               │
        │   - id = ISS-2501-0050                          │
        │   - quantity = 100 kg                          │
        │   - unit_cost = $5.14 (weighted avg)           │
        └────────────┬───────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────────────┐
        │   FOR EACH ALLOCATED LOT                       │
        └────────────┬───────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────────────┐
        │   Get Next lot_index for Parent Lot            │
        │   Query: MAX(lot_index) + 1                    │
        └────────────┬───────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────────────┐
        │   Create Cost Layer (ADJUSTMENT)               │
        │   - lot_no = NULL                              │
        │   - lot_index = next (e.g., 2)                 │
        │   - parent_lot_no = consumed lot               │
        │   - in_qty = 0                                 │
        │   - out_qty = consumption qty                  │
        │   - cost_per_unit = from parent                │
        └────────────┬───────────────────────────────────┘
                     │
                     ├──────── [MORE LOTS] ────┐
                     │                         │
                     │                         ▼
                     │                   [LOOP BACK]
                     │
                [ALL LOTS PROCESSED]
                     │
                     ▼
        ┌────────────────────────────────────────────────┐
        │   Update Closing Balances                      │
        │   - Decrease each consumed lot balance         │
        └────────────┬───────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────────────┐
        │   COMMIT TRANSACTION                           │
        └────────────┬───────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────────────────┐
        │   Display Confirmation                         │
        │   "Issue completed                             │
        │    Consumed from 2 lots                        │
        │    Total cost: $514.00                         │
        │    Lots: MK-251105-0003 (30 kg),              │
        │          MK-251106-0008 (70 kg)"              │
        └────────────┬───────────────────────────────────┘
                     │
                     ▼
                   [END]
```

**Success Criteria**:
- ✅ Issue quantity fully allocated using FIFO
- ✅ Multiple cost layer records created (one per consumed lot)
- ✅ Weighted average cost calculated correctly
- ✅ Lot balances decreased appropriately
- ✅ Oldest lots consumed first

---

## Sequence Diagrams

### SEQ-001: Lot Number Generation

**Description**: Interaction between components during lot number generation

```
 User     UI        Server      Lot Gen      Database
  │        │        Action      Service         │
  │        │          │            │            │
  ├──[1]──►│          │            │            │
  │ Commit │          │            │            │
  │  GRN   │          │            │            │
  │        │          │            │            │
  │        ├──[2]────►│            │            │
  │        │ commitGrn()          │            │
  │        │          │            │            │
  │        │          ├──[3]──────►│            │
  │        │          │ generateLotNumber()    │
  │        │          │ {locationCode: 'MK',   │
  │        │          │  receiptDate: '2025-11-07'} │
  │        │          │            │            │
  │        │          │            ├──[4]──────►│
  │        │          │            │ Query last │
  │        │          │            │ sequence   │
  │        │          │            │            │
  │        │          │            │◄──[5]──────┤
  │        │          │            │ {last_seq: 5} │
  │        │          │            │            │
  │        │          │            ├─[6]        │
  │        │          │            │ Calculate  │
  │        │          │            │ next_seq=6 │
  │        │          │            │            │
  │        │          │            ├─[7]        │
  │        │          │            │ Format     │
  │        │          │            │ MK-251107- │
  │        │          │            │ 0006       │
  │        │          │            │            │
  │        │          │◄──[8]──────┤            │
  │        │          │ {lotNo: 'MK-251107-0006',│
  │        │          │  lotSeqNo: 6,          │
  │        │          │  lotAtDate: ...}       │
  │        │          │            │            │
  │        │          ├──[9]───────────────────►│
  │        │          │ BEGIN TRANSACTION      │
  │        │          │                        │
  │        │          ├──[10]──────────────────►│
  │        │          │ INSERT cost_layer      │
  │        │          │ (lot_no='MK-251107-0006',│
  │        │          │  lot_index=1,          │
  │        │          │  parent_lot_no=NULL,   │
  │        │          │  in_qty=50, ...)       │
  │        │          │                        │
  │        │          │◄──[11]──────────────────┤
  │        │          │ {id: 'uuid-...'}       │
  │        │          │                        │
  │        │          ├──[12]──────────────────►│
  │        │          │ COMMIT TRANSACTION     │
  │        │          │                        │
  │        │◄──[13]───┤                        │
  │        │ {success: true,                   │
  │        │  lotsCreated: ['MK-251107-0006']} │
  │        │          │                        │
  │◄─[14]──┤          │                        │
  │ Display│          │                        │
  │ "Lot   │          │                        │
  │ created"│         │                        │
  │        │          │                        │
```

**Steps**:
1. User commits GRN via UI
2. UI calls server action `commitGrn()`
3. Server action calls `LotGenerationService.generateLotNumber()`
4. Service queries database for last sequence number for location+date
5. Database returns last sequence (or empty if first of day)
6. Service calculates next sequence (last + 1, or 1 if first)
7. Service formats lot number: `{LOCATION}-{YYMMDD}-{SEQSEQ}`
8. Service returns lot metadata to server action
9-11. Server action creates cost layer record in transaction
12. Transaction committed
13. Server action returns success to UI
14. UI displays confirmation

---

### SEQ-002: FIFO Allocation

**Description**: FIFO consumption engine allocating lots

```
Server      FIFO          Database        Cost Layer
Action      Engine           │               Table
  │           │              │                 │
  ├──[1]─────►│              │                 │
  │ allocateLots()           │                 │
  │ {productId, locationId,  │                 │
  │  issueQty: 100}          │                 │
  │           │              │                 │
  │           ├──[2]─────────►│                 │
  │           │ Query available lots           │
  │           │ ORDER BY lot_no ASC            │
  │           │              │                 │
  │           │◄──[3]─────────┤                 │
  │           │ [                              │
  │           │   {lot: 'MK-251105-0003',      │
  │           │    balance: 30, cost: 5.00},   │
  │           │   {lot: 'MK-251106-0008',      │
  │           │    balance: 80, cost: 5.20}    │
  │           │ ]                              │
  │           │              │                 │
  │           ├─[4]          │                 │
  │           │ Calculate    │                 │
  │           │ allocations: │                 │
  │           │ Lot1: 30kg   │                 │
  │           │ Lot2: 70kg   │                 │
  │           │              │                 │
  │◄──[5]─────┤              │                 │
  │ {allocations: [          │                 │
  │   {lotNo: 'MK-251105-0003',                │
  │    qtyConsumed: 30, cost: 150},            │
  │   {lotNo: 'MK-251106-0008',                │
  │    qtyConsumed: 70, cost: 364}             │
  │  ],                      │                 │
  │  totalCost: 514}         │                 │
  │           │              │                 │
  ├──[6]──────────────────────────────────────►│
  │ FOR EACH allocation                        │
  │   INSERT cost_layer                        │
  │   (parent_lot_no=..., out_qty=...)         │
  │           │              │                 │
  │◄──[7]──────────────────────────────────────┤
  │ Records created                            │
  │           │              │                 │
```

---

## State Transition Diagrams

### STD-001: Lot Record States

**Description**: States and transitions for a lot record throughout its lifecycle

```
                    ┌──────────────┐
                    │   CREATED    │
                    │  (lot_index=1│
                    │   parent=NULL)│
                    └──────┬───────┘
                           │
                           │ Lot created on
                           │ GRN/Adjustment
                           │
                           ▼
                    ┌──────────────┐
                    │   ACTIVE     │
                    │ (balance > 0)│
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            │ Issue        │ Transfer     │ Adjustment
            │              │              │ (stock-out)
            │              │              │
            ▼              ▼              ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ PARTIALLY  │  │ PARTIALLY  │  │ PARTIALLY  │
    │ CONSUMED   │  │ TRANSFERRED│  │ ADJUSTED   │
    │(balance>0) │  │(balance>0) │  │(balance>0) │
    └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
          │               │               │
          │               │               │
          └───────────────┼───────────────┘
                          │
                          │ More consumption
                          │ until balance = 0
                          │
                          ▼
                   ┌──────────────┐
                   │   DEPLETED   │
                   │ (balance = 0)│
                   └──────┬───────┘
                          │
                          │ Age > 2 years
                          │ + Fully consumed
                          │
                          ▼
                   ┌──────────────┐
                   │   ARCHIVED   │
                   │  (historical)│
                   └──────────────┘
```

**State Definitions**:

| State | Condition | lot_no | parent_lot_no | balance |
|-------|-----------|--------|---------------|---------|
| CREATED | Initial lot creation | NOT NULL | NULL | = in_qty |
| ACTIVE | Has positive balance, not fully consumed | NOT NULL | NULL | > 0 |
| PARTIALLY CONSUMED | Some quantity consumed | NOT NULL | NULL | > 0, < original |
| DEPLETED | All quantity consumed | NOT NULL | NULL | = 0 |
| ARCHIVED | Old + depleted | NOT NULL | NULL | = 0, age > 2 years |

**Transitions**:

| From | To | Trigger | Action |
|------|----|---------| -------|
| CREATED | ACTIVE | Lot created | Insert cost_layer with in_qty |
| ACTIVE | PARTIALLY CONSUMED | Issue/transfer/adjustment | Insert cost_layer with out_qty, parent_lot_no populated |
| PARTIALLY CONSUMED | DEPLETED | Final consumption | balance becomes 0 |
| DEPLETED | ARCHIVED | Archive job | Move to archive table |

---

### STD-002: Transaction States

**Description**: States for inventory transactions

```
           ┌──────────────┐
           │   DRAFT      │
           │ (not saved)  │
           └──────┬───────┘
                  │
                  │ User saves
                  │
                  ▼
           ┌──────────────┐
           │   PENDING    │
           │ (saved,      │
           │  not posted) │
           └──────┬───────┘
                  │
         ┌────────┼────────┐
         │                 │
         │ Validate        │ Reject
         │                 │
         ▼                 ▼
  ┌──────────────┐  ┌──────────────┐
  │   APPROVED   │  │   REJECTED   │
  │              │  │              │
  └──────┬───────┘  └──────────────┘
         │
         │ Commit/Post
         │
         ▼
  ┌──────────────┐
  │   POSTED     │
  │ (lots created,│
  │  GL posted)   │
  └──────┬───────┘
         │
         │ Period close
         │
         ▼
  ┌──────────────┐
  │   CLOSED     │
  │ (in closed   │
  │  period)     │
  └──────────────┘
```

---

## Data Flow Diagrams

### DFD-001: Lot-Based Costing System Overview

**Description**: High-level data flow across the system

```
┌──────────────────────────────────────────────────────────────────┐
│                         EXTERNAL ENTITIES                         │
├───────────────┬──────────────┬──────────────┬────────────────────┤
│   Suppliers   │ Purchasing   │  Storekeeper │     Production     │
│               │     Staff    │              │       Staff        │
└───────┬───────┴──────┬───────┴──────┬───────┴──────┬─────────────┘
        │              │              │              │
        │ Purchase     │ GRN          │ Adjustments  │ Issues
        │ Orders       │ Commitment   │              │
        │              │              │              │
        ▼              ▼              ▼              ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│                      PROCESS LAYER                                │
│                                                                   │
│  ┌────────────┐   ┌──────────────┐   ┌──────────────────────┐   │
│  │    GRN     │   │  Inventory   │   │     Issue           │   │
│  │ Commitment │   │  Adjustment  │   │  Processing         │   │
│  │  Process   │   │   Process    │   │   (FIFO)            │   │
│  └─────┬──────┘   └──────┬───────┘   └──────────┬───────────┘   │
│        │                 │                      │               │
│        └─────────┬───────┴──────────────────────┘               │
│                  │                                               │
│                  ▼                                               │
│         ┌────────────────────┐                                   │
│         │  Lot Generation    │                                   │
│         │     Service        │                                   │
│         └────────┬───────────┘                                   │
│                  │                                               │
│                  ▼                                               │
│         ┌────────────────────┐                                   │
│         │  FIFO Consumption  │                                   │
│         │     Engine         │                                   │
│         └────────┬───────────┘                                   │
│                  │                                               │
└──────────────────┼───────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│                        DATA LAYER                                 │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────┐                  │
│  │  tb_inventory_     │  │  tb_inventory_     │                  │
│  │  transaction_      │  │  transaction_      │                  │
│  │  detail            │  │  cost_layer        │                  │
│  └────────────────────┘  └────────────────────┘                  │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────┐                  │
│  │  tb_product        │  │  tb_location       │                  │
│  └────────────────────┘  └────────────────────┘                  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                       REPORTING LAYER                             │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Lot Balance  │  │   Lot        │  │  Inventory   │           │
│  │   Report     │  │ Traceability │  │  Valuation   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

### DFD-002: Lot Number Generation Data Flow

**Description**: Detailed data flow for lot number generation

```
┌─────────────────┐
│  Calling        │
│  Process        │
│ (GRN/Adjustment)│
└────────┬────────┘
         │
         │ {locationCode, receiptDate}
         │
         ▼
┌─────────────────────────────────────────────────────┐
│          Lot Generation Service                     │
│                                                     │
│  ┌──────────────────────────────────────┐          │
│  │  1. Format Date Component            │          │
│  │     Input: 2025-11-07                │          │
│  │     Output: "251107"                 │          │
│  └──────────────┬───────────────────────┘          │
│                 │                                   │
│                 ▼                                   │
│  ┌──────────────────────────────────────┐          │
│  │  2. Query Last Sequence              │──────────┼──────┐
│  │     SELECT MAX(lot_seq_no)           │          │      │
│  │     WHERE location_code = 'MK'       │          │      │
│  │       AND lot_at_date::date =        │          │      │
│  │           '2025-11-07'::date         │          │      │
│  └──────────────┬───────────────────────┘          │      │
│                 │                                   │      │
│                 │ {last_seq_no: 5}                  │      │
│                 │                                   │      │
│                 ▼                                   │      │
│  ┌──────────────────────────────────────┐          │      │
│  │  3. Calculate Next Sequence          │          │      │
│  │     next_seq = 5 + 1 = 6             │          │      │
│  │     Check: 6 <= 9999 ✓               │          │      │
│  └──────────────┬───────────────────────┘          │      │
│                 │                                   │      │
│                 ▼                                   │      │
│  ┌──────────────────────────────────────┐          │      │
│  │  4. Format Sequence (4-digit padding)│          │      │
│  │     Input: 6                         │          │      │
│  │     Output: "0006"                   │          │      │
│  └──────────────┬───────────────────────┘          │      │
│                 │                                   │      │
│                 ▼                                   │      │
│  ┌──────────────────────────────────────┐          │      │
│  │  5. Construct Lot Number             │          │      │
│  │     "MK" + "-" + "251107" + "-" +    │          │      │
│  │     "0006"                           │          │      │
│  │     Result: "MK-251107-0006"         │          │      │
│  └──────────────┬───────────────────────┘          │      │
│                 │                                   │      │
└─────────────────┼───────────────────────────────────┘      │
                  │                                          │
                  │ {lotNo, lotSeqNo, lotAtDate}             │
                  │                                          │
                  ▼                                          │
         ┌─────────────────┐                                │
         │  Calling        │                                │
         │  Process        │                                │
         └────────┬────────┘                                │
                  │                                          │
                  │ Create cost_layer record                 │
                  │                                          │
                  ▼                                          │
         ┌─────────────────────────────────────┐            │
         │  tb_inventory_transaction_cost_layer│◄───────────┘
         │  - lot_no: "MK-251107-0006"         │
         │  - lot_seq_no: 6                    │
         │  - lot_at_date: 2025-11-07          │
         │  - location_code: "MK"              │
         └─────────────────────────────────────┘
```

---

### DFD-003: FIFO Consumption Data Flow

**Description**: Data flow for FIFO-based lot consumption

```
┌─────────────────┐
│  Issue          │
│  Transaction    │
│  Request        │
└────────┬────────┘
         │
         │ {productId, locationId, issueQty: 100}
         │
         ▼
┌─────────────────────────────────────────────────────┐
│       FIFO Consumption Engine                       │
│                                                     │
│  ┌──────────────────────────────────────┐          │
│  │  1. Query Available Lots (FIFO)      │──────────┼──────┐
│  │     SELECT lot_no, balance,          │          │      │
│  │            cost_per_unit             │          │      │
│  │     ORDER BY lot_no ASC              │          │      │
│  └──────────────┬───────────────────────┘          │      │
│                 │                                   │      │
│                 │ [lots ordered chronologically]    │      │
│                 │                                   │      │
│                 ▼                                   │      │
│  ┌──────────────────────────────────────┐          │      │
│  │  2. Allocate Quantity                │          │      │
│  │     Loop through lots:               │          │      │
│  │     - Lot1: consume 30 kg @ $5.00    │          │      │
│  │     - Lot2: consume 70 kg @ $5.20    │          │      │
│  └──────────────┬───────────────────────┘          │      │
│                 │                                   │      │
│                 │ {allocations, totalCost}          │      │
│                 │                                   │      │
└─────────────────┼───────────────────────────────────┘      │
                  │                                          │
                  ▼                                          │
         ┌─────────────────┐                                │
         │  Calling        │                                │
         │  Process        │                                │
         └────────┬────────┘                                │
                  │                                          │
                  │ FOR EACH allocation                      │
                  │                                          │
                  ▼                                          │
         ┌─────────────────────────────────────┐            │
         │  tb_inventory_transaction_cost_layer│◄───────────┘
         │  - lot_no: NULL                     │            Query
         │  - parent_lot_no: "MK-251105-0003"  │
         │  - out_qty: 30                      │
         │  - cost_per_unit: $5.00             │
         ├─────────────────────────────────────┤
         │  - lot_no: NULL                     │
         │  - parent_lot_no: "MK-251106-0008"  │
         │  - out_qty: 70                      │
         │  - cost_per_unit: $5.20             │
         └─────────────────────────────────────┘
```

---

## Decision Trees

### DT-001: Transaction Type Decision

**Description**: Decision logic for determining transaction type and lot creation

```
                        START
                          │
                          ▼
          ┌───────────────────────────────┐
          │  Is this a receipt            │
          │  (increasing inventory)?      │
          └───────┬───────────────┬───────┘
                  │               │
                 YES             NO
                  │               │
                  ▼               ▼
      ┌───────────────────┐   ┌──────────────────┐
      │  From GRN?        │   │  Is this an issue│
      └───┬───────────┬───┘   │  (decreasing     │
          │           │       │   inventory)?    │
         YES         NO       └────┬─────────┬───┘
          │           │            │         │
          ▼           ▼           YES       NO
   ┌────────────┐ ┌────────────┐  │         │
   │ CREATE LOT │ │ CREATE LOT │  │         ▼
   │ type: GRN  │ │ type: ADJ  │  │    ┌──────────────┐
   │ parent:NULL│ │ parent:NULL│  │    │  Transfer?   │
   └────────────┘ └────────────┘  │    └───┬──────┬───┘
                                   │        │      │
                                   │       YES    NO
                                   │        │      │
                                   ▼        ▼      ▼
                            ┌─────────────────┐ [ERROR]
                            │  CONSUME LOTS   │
                            │  using FIFO     │
                            │  parent: set    │
                            │  lot_no: NULL   │
                            └─────────────────┘
```

---

### DT-002: Lot Sequence Decision

**Description**: Decision logic for handling lot sequence generation

```
                        START
                          │
                          ▼
          ┌───────────────────────────────┐
          │  Query last sequence for      │
          │  location + date              │
          └───────────┬───────────────────┘
                      │
                      ▼
          ┌───────────────────────────────┐
          │  Found existing sequence?     │
          └───────┬───────────────┬───────┘
                  │               │
                 YES             NO
                  │               │
                  ▼               ▼
      ┌───────────────────┐   ┌──────────────────┐
      │ next_seq =        │   │ next_seq = 1     │
      │ last_seq + 1      │   │ (first of day)   │
      └───────┬───────────┘   └────────┬─────────┘
              │                        │
              └────────────┬───────────┘
                           │
                           ▼
          ┌───────────────────────────────┐
          │  next_seq <= 9999?            │
          └───────┬───────────────┬───────┘
                  │               │
                 YES             NO
                  │               │
                  ▼               ▼
      ┌───────────────────┐   ┌──────────────────┐
      │ Format with       │   │ THROW ERROR:     │
      │ 4-digit padding   │   │ "Daily lot limit │
      │ e.g., "0006"      │   │  exceeded"       │
      └───────┬───────────┘   └──────────────────┘
              │
              ▼
      ┌───────────────────┐
      │ Construct lot_no: │
      │ {LOC}-{DATE}-{SEQ}│
      └───────┬───────────┘
              │
              ▼
             END
```

---

## Timing Diagrams

### TM-001: GRN Commitment Timeline

**Description**: Timeline showing duration of each step in GRN commitment

```
Operation                           Duration    Cumulative
│                                                  Time
├─ User clicks "Commit GRN"           10ms         10ms
│
├─ Server receives request            50ms         60ms
│
├─ Validate GRN status & data         100ms        160ms
│
├─ BEGIN DATABASE TRANSACTION         5ms          165ms
│
├─ FOR EACH GRN LINE (3 lines):
│  ├─ Get location code               20ms         185ms
│  ├─ Generate lot number:
│  │  ├─ Query last sequence          30ms         215ms
│  │  └─ Calculate & format           5ms          220ms
│  ├─ Create transaction detail       25ms         245ms
│  ├─ Create cost layer (LOT)         25ms         270ms
│  └─ [Repeat for line 2]                          320ms
│  └─ [Repeat for line 3]                          370ms
│
├─ Update GRN status                  20ms         390ms
│
├─ COMMIT TRANSACTION                 50ms         440ms
│
├─ Log activity                       30ms         470ms
│
├─ Revalidate paths                   20ms         490ms
│
└─ Return response to UI              10ms         500ms
                                                    │
                                        TOTAL: ~500ms (0.5 seconds)
```

**Performance Target**: < 1 second for GRN with up to 10 lines

---

### TM-002: FIFO Consumption Timeline

**Description**: Timeline for FIFO allocation and consumption

```
Operation                           Duration    Cumulative
│                                                  Time
├─ User creates issue                 10ms         10ms
│
├─ Server receives request            50ms         60ms
│
├─ Validate issue data                50ms         110ms
│
├─ Check available balance:
│  ├─ Query SUM(in_qty-out_qty)       80ms         190ms
│  └─ Validate sufficient             5ms          195ms
│
├─ Query available lots (FIFO):
│  ├─ Execute grouped query           120ms        315ms
│  └─ Parse results                   10ms         325ms
│
├─ FIFO Allocation Algorithm:
│  ├─ Loop through 3 lots             15ms         340ms
│  ├─ Calculate allocations           5ms          345ms
│  └─ Calculate weighted avg cost     5ms          350ms
│
├─ BEGIN DATABASE TRANSACTION         5ms          355ms
│
├─ Create transaction detail          25ms         380ms
│
├─ FOR EACH allocated lot (3):
│  ├─ Get next lot_index              20ms         400ms
│  ├─ Create cost layer (ADJUSTMENT)  25ms         425ms
│  └─ [Repeat for lot 2]                           445ms
│  └─ [Repeat for lot 3]                           465ms
│
├─ Update closing balances            40ms         505ms
│
├─ COMMIT TRANSACTION                 50ms         555ms
│
├─ Log activity                       30ms         585ms
│
└─ Return response to UI              15ms         600ms
                                                    │
                                        TOTAL: ~600ms (0.6 seconds)
```

**Performance Target**: < 1 second for issues consuming up to 5 lots

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-07 | System | Initial flow diagrams documentation with 4-digit lot sequence |

---

**Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Business Analyst | | | |
| Technical Lead | | | |
| QA Lead | | | |
| Project Manager | | | |
