# Stock Cards

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Stock Cards |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

---

## Overview

The Stock Cards module provides detailed transaction history and running balance tracking for inventory items at specific locations. It serves as the digital equivalent of traditional stock cards, enabling complete traceability of inventory movements with full audit capabilities.

### Key Features
- **Transaction History**: Complete record of all stock movements (IN/OUT)
- **Running Balance**: Real-time balance calculation after each transaction
- **Product-Location Tracking**: Stock cards per unique product-location combination
- **Document References**: Link transactions to source documents (GRN, SI, ADJ, TR)
- **Multi-view Support**: List view and grouped view by product
- **Analytics Dashboard**: Movement trends, transaction distribution, and activity patterns
- **Export & Print**: Generate stock card reports for external use

### Business Value
- Complete audit trail for inventory compliance
- Track inventory discrepancies to source transactions
- Support financial reconciliation with detailed movement logs
- Enable inventory analysis for optimization decisions
- Facilitate stock take and variance investigation

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [BR-stock-cards.md](./BR-stock-cards.md) | **Business Requirements** - Functional requirements, success metrics, acceptance criteria, and business rules |
| [TS-stock-cards.md](./TS-stock-cards.md) | **Technical Specification** - Component architecture, interfaces, state management, and implementation details |
| [UC-stock-cards.md](./UC-stock-cards.md) | **Use Cases** - Actor-based scenarios covering all user interactions and workflows |
| [FD-stock-cards.md](./FD-stock-cards.md) | **Flow Diagrams** - Visual process flows for page load, filtering, analytics, and exports |
| [VAL-stock-cards.md](./VAL-stock-cards.md) | **Validation Rules** - Data validation, business rules, display formatting, and error handling |

---

## Quick Reference

### Data Model
```typescript
interface StockCardEntry {
  id: string
  productId: string
  productCode: string
  productName: string
  category: string
  unit: string
  locationId: string
  locationName: string
  transactionDate: Date
  transactionType: 'IN' | 'OUT'
  documentType: 'GRN' | 'SI' | 'ADJ' | 'TR'
  documentNumber: string
  reference: string
  quantityIn: number
  quantityOut: number
  balanceAfter: number
  unitCost: number
  totalValue: number
  remarks: string
  createdBy: string
  createdAt: Date
}
```

### Transaction Types
| Type | Description | Typical Sources |
|------|-------------|-----------------|
| IN | Stock received | GRN (Goods Received), TR (Transfer In), ADJ (Positive Adjustment) |
| OUT | Stock issued | SI (Stock Issue), TR (Transfer Out), ADJ (Negative Adjustment) |

### Document Types
| Code | Document | Direction |
|------|----------|-----------|
| GRN | Goods Received Note | IN |
| SI | Stock Issue | OUT |
| ADJ | Adjustment | IN or OUT |
| TR | Transfer | IN or OUT |

### Key Tabs
1. **Transaction List** - Filterable table with all stock card entries
2. **Analytics** - Movement trends, transaction distribution, activity patterns
3. **Summary** - Product summaries with totals and statistics

---

## Related Modules
- [Inventory Balance](../inventory-balance/index.md) - Current stock levels and status
- [Slow Moving](../slow-moving/index.md) - Items with no movement for 30+ days
