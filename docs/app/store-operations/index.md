# Store Operations Documentation

## Module Overview

The Store Operations module manages day-to-day inventory movements and operational workflows in hospitality environments. It provides comprehensive tools for requesting, transferring, issuing, and tracking inventory items across multiple locations, as well as managing wastage and replenishment activities.

---

## Navigation Structure

```
Store Operations
├── Dashboard                   → /store-operations
├── Store Requisitions          → /store-operations/store-requisitions
├── Stock Replenishment         → /store-operations/stock-replenishment
├── Stock Transfers             → /store-operations/stock-transfers
├── Stock Issues                → /store-operations/stock-issues
└── Wastage Reporting           → /store-operations/wastage-reporting
```

---

## Submodules

| Submodule | Description | Documentation |
|-----------|-------------|---------------|
| **Store Requisitions** | Department requests for inventory items with multi-level approval workflows | [Index](./store-requisitions/INDEX-store-requisitions.md) |
| **Stock Replenishment** | Proactive inventory management with automated monitoring and recommendations | [Index](./stock-replenishment/INDEX-stock-replenishment.md) |
| **Stock Transfers** | Read-only audit view for inventory movements between INVENTORY locations | [Index](./stock-transfers/INDEX-stock-transfers.md) |
| **Stock Issues** | Read-only audit view for direct expense issues to consumption locations | [Index](./stock-issues/INDEX-stock-issues.md) |
| **Wastage Reporting** | Record, approve, and analyze food and beverage wastage | [Index](./wastage-reporting/INDEX-wastage-reporting.md) |

---

## Key Concepts

### Location Types

| Type | Description | Used In |
|------|-------------|---------|
| INVENTORY | Storage locations that track stock | Stock Transfers |
| DIRECT | Expense/consumption locations | Stock Issues |

### Store Requisition Workflow

```
Draft → Submit → Approve → Issue → Complete
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
              Stock Transfer      Stock Issue
           (INVENTORY dest)     (DIRECT dest)
```

---

## Source Code Location

```
app/(main)/store-operations/
├── page.tsx                    # Dashboard
├── store-requisitions/         # SR module
├── stock-replenishment/        # Replenishment module
├── stock-transfers/            # Transfers view (filtered SRs)
├── stock-issues/               # Issues view (filtered SRs)
└── wastage-reporting/          # Wastage module
```

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Inventory Management](../inventory-management/) | Receives inventory adjustments |
| [Product Management](../product-management/) | Product master data |
| [Procurement](../procurement/) | GRNs feed inventory |
| [Operational Planning](../operational-planning/) | Inventory Planning links to Replenishment |

---

**Document End**
