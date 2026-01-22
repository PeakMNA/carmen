# Goods Received Note (GRN)

## Module Information
- **Module**: Procurement
- **Sub-Module**: Goods Received Note
- **Route**: `/procurement/goods-received-note`
- **Status**: Active

---

## Overview

The Goods Received Note (GRN) module manages the recording and tracking of goods received from vendors in the hotel procurement system. GRNs serve as the formal record of goods receipt, capturing what was ordered versus what was actually received, including any discrepancies in quantity or quality.

The module supports two distinct workflows:
1. **PO-Based Receiving**: Creating GRNs linked to existing Purchase Orders
2. **Manual Receiving**: Creating standalone GRNs for goods received without a prior PO

---

## Documentation Index

### Core Documentation

| Document | Description |
|----------|-------------|
| [Business Requirements (BR)](./br-goods-received-note) | Business objectives, functional requirements, stakeholders, and acceptance criteria |
| [Data Definition (DD)](./dd-goods-received-note) | Data models, entity relationships, field specifications, and database schema |
| [Flow Diagrams (FD)](./fd-goods-received-note) | Process flows, state diagrams, sequence diagrams, and workflow visualizations |
| [Technical Specification (TS)](./ts-goods-received-note) | Implementation details, API specifications, component architecture |
| [Use Cases (UC)](./uc-goods-received-note) | Detailed use case scenarios, user stories, and interaction flows |
| [Validation Rules (VAL)](./val-goods-received-note) | Business rules, validation logic, error handling, and constraints |

### Additional Documentation

| Document | Description |
|----------|-------------|
| [Mobile Receiving Process Analysis](./mobile-receiving-process-analysis) | Analysis of mobile-based receiving workflows |
| [Gap Analysis: BR vs Mobile](./gap-analysis-br-vs-mobile) | Gap analysis between business requirements and mobile implementation |

---

## Key Features

- **PO-Based Receiving**: Create GRNs from existing Purchase Orders with auto-populated items
- **Manual GRN Creation**: Support for non-PO receipts (emergency purchases, samples)
- **Multi-PO Consolidation**: Receive goods from multiple POs in a single GRN
- **Discrepancy Management**: Track over-receipts, under-receipts, damaged goods, quality issues
- **Inventory Integration**: Automatic stock level updates upon GRN commitment
- **Extra Cost Allocation**: Distribute freight, handling, and customs costs to items
- **Document Generation**: Generate printable GRN documents in PDF format
- **Mobile Support**: QR code scanning for PO lookup during receiving

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Purchase Orders](../purchase-orders) | Source POs for PO-based receiving |
| [Purchase Requests](../purchase-requests) | Original requisitions that led to POs |
| [Vendor Management](../../vendor-management) | Vendor information and contacts |
| [Product Management](../../product-management) | Product catalog and specifications |
| [Inventory Management](../../inventory-management) | Stock levels and inventory transactions |

---

## Quick Links

- **Create New GRN**: `/procurement/goods-received-note/create`
- **GRN List**: `/procurement/goods-received-note`
- **Pending Receipts**: `/procurement/goods-received-note?status=pending`

---

## Status Workflow

```
DRAFT → RECEIVED → COMMITTED
                 ↘ VOIDED
```

| Status | Description |
|--------|-------------|
| **Draft** | GRN created but not finalized |
| **Received** | Goods physically received and recorded |
| **Committed** | GRN finalized, inventory updated |
| **Voided** | GRN cancelled with reversal |
