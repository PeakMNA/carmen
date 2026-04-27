# Sales Consumption Documentation

**Module**: Store Operations
**Sub-Module**: Sales Consumption
**Status**: ACTIVE
**Last Updated**: 2026-01-27

---

## Quick Links

| Document | Description | Status |
|----------|-------------|--------|
| [Business Rules](./BR-sales-consumption.md) | Business rules, posting model, exception handling | Complete |
| [Data Dictionary](./DD-sales-consumption.md) | Data model and entity relationships | Complete |
| [Flow Diagrams](./FD-sales-consumption.md) | Visual workflow diagrams (Mermaid 8.8.2) | Complete |
| [Technical Specification](./TS-sales-consumption.md) | System architecture and implementation details | Complete |
| [Use Cases](./UC-sales-consumption.md) | User workflows and actor interactions | Complete |
| [Validations](./VAL-sales-consumption.md) | Validation rules and constraints | Complete |

---

## Overview

**Sales Consumption (SC)** is the **typed inventory source document** that closes the loop between POS sales and the inventory ledger. One SC is generated per **(location, shift, business_date)** at shift close, automatically posting ingredient consumption to inventory based on the menu items sold.

**Key Architecture**: SC documents are system-generated, not user-initiated. They are the downstream output of the POS → Mapping → Recipe Explosion pipeline, and the upstream input for Menu Engineering analytics.

```
POS sale (raw transaction)
    -> POS Mapping (recipe explosion)
    -> SC Document (per location/shift)
        -> Inventory Ledger (mapped lines auto-posted)
        -> Exception Queue (unmapped lines queued in POS)
    -> Menu Engineering (reads SC for analytics)
```

**Doc prefix**: `SC-` following Carmen's convention (PR, PO, GRN, SR, SI, SC).

---

## Key Concepts

### What is a Sales Consumption Document?

A Sales Consumption document aggregates all POS sales for a location and shift period, explodes each menu item through its recipe mapping, and deducts the resulting ingredient quantities from inventory. It is the formal audit record that answers: "What inventory was consumed today because of sales?"

### System-Generated vs User-Initiated

| Aspect | Sales Consumption | Stock Issue |
|--------|-------------------|-------------|
| Created by | System (scheduled job at shift close) | User (manual request) |
| Source | POS sales transactions | Store Requisition |
| Direction | OUT (inventory deducted) | OUT (inventory deducted) |
| Edit after post | Not allowed — corrections via reversing lines or Supplemental SC | Not allowed |
| Manual create | Not possible | User-initiated |
| Basis for deduction | Recipe mapping + quantity sold | Requested/approved quantities |

### Status Model

| Status | Meaning |
|--------|---------|
| Draft | SC created by job, validation in progress |
| Posted | All lines posted to ledger |
| Posted with Exceptions | Some lines posted; others in POS Exception Queue |
| Blocked | Zero lines could post (e.g. outlet entirely unmapped) |
| Voided | Manager voided entire SC (e.g. POS data corruption) |

### Supplemental SC

When exceptions from a prior SC are resolved in POS, a Supplemental SC is generated and linked to the parent SC. The parent SC is never edited after posting — the supplemental carries the late-posted lines as a separate document with its own reference number.

---

## Core Workflows

### 1. Shift-Close Auto-Generation

**Owner**: System (scheduled job)
**Trigger**: Configurable shift-close time per location, or midnight for non-shift outlets
**Description**: The job groups all POS transactions since last run by (location, shift), explodes each via recipe mapping, posts clean lines to the inventory ledger, and routes exception lines to the POS Exception Queue.

**Features**:
- Per-location, per-shift granularity
- Auto-deduplication of duplicate POS transaction IDs
- Tax-only and non-inventory items automatically skipped (after one-time flag)
- Currency conversion applied when POS currency differs from Carmen location currency

### 2. Manager Review of SC with Exceptions

**Owner**: F&B Manager, Store Manager
**Description**: When an SC has status `Posted with Exceptions`, the SC detail page shows an exception banner linking directly to the POS Exception Queue. Manager identifies unmapped items, resolves mappings in POS, and triggers re-post.

**Features**:
- Exception banner visible on SC detail and SC list
- Filter SC list by status = `posted_with_exceptions` or `blocked`
- Cross-link from SC to POS Operate → Exceptions for resolution

### 3. Supplemental SC via Exception Resolution

**Owner**: System (triggered by POS exception resolution)
**Description**: After a mapping is fixed in POS and "Resolve & Re-post" is clicked, the system generates a Supplemental SC (status: Posted) linked to the original SC, carrying the previously-queued lines.

### 4. Manager Void

**Owner**: Store Manager, Finance Manager
**Description**: Rare operation for corrupted or duplicate SC documents. Void creates a full reversal of all posted inventory transactions. Cannot be undone.

---

## GL Integration

### Inventory Impact

When an SC is posted, the following inventory transactions are created per ingredient line:

| Entry | Account | Direction |
|-------|---------|-----------|
| Inventory | Source location inventory account | Credit (reduce stock) |
| COGS | Cost of Goods Sold expense account | Debit (record expense) |

### Account Determination

| Factor | Source |
|--------|--------|
| Inventory Account | Product's associated inventory account at location |
| COGS Account | Location's configured COGS account or outlet default |
| Cost Basis | Current cost at time of posting (FIFO or Periodic Average per location config) |

---

## Audit Trail

### Tracked Information

| Field | Description |
|-------|-------------|
| docNumber | SC-{YYYYMMDD}-{location}-{shift}-{seq} |
| businessDate | The business date the shift belongs to |
| shiftId | Which shift (Breakfast, Lunch, Dinner, All-Day) |
| locationId | Carmen location that generated the SC |
| postedAt | Timestamp when lines were posted to ledger |
| postedBy | `system` (auto-post) or UserId (manual retry) |
| sourceConnectionIds | Which POS connections contributed transactions |
| transactionCount | Number of raw POS sales aggregated |

---

## Related Documentation

### Within Store Operations
- [Stock Issues](../stock-issues/INDEX-stock-issues.md) — Manual direct issues (user-initiated OUT)
- [Stock Transfers](../stock-transfers/INDEX-stock-transfers.md) — Inventory movements between locations
- [Wastage Reporting](../wastage-reporting/INDEX-wastage-reporting.md) — Spoilage and loss recording

### Other Modules
- [POS Integration](../../system-administration/system-integrations/pos-integration/INDEX-pos-integration.md) — Source transactions, mappings, and Exception Queue
- [Menu Engineering](../../operational-planning/menu-engineering/) — Analytics consumer of SC data
- [Inventory Management](../../inventory-management/) — Ledger that SC posts into
- [Recipe Management](../../operational-planning/recipe-management/) — Recipe definitions used in mapping explosion

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-27 | Documentation Team | Initial version — new module |

---

**Document Control**:
- **Created**: 2026-01-27
- **Author**: Documentation Team
- **Next Review**: 2026-04-27
