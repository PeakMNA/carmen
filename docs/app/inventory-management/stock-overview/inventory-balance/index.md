# Inventory Balance

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Balance |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

---

## Overview

The Inventory Balance module provides real-time visibility into stock levels across all locations. It enables inventory managers, storekeepers, and financial controllers to monitor current stock quantities, track inventory value, and identify items requiring attention such as low stock or overstocked items.

### Key Features
- **Real-time Stock Visibility**: View current quantities and values across all locations
- **Multi-location Support**: Filter and compare stock across different storage locations
- **Status Classification**: Automatic categorization (Normal, Low Stock, Overstock, Out of Stock)
- **Value Tracking**: Monitor inventory value with average cost calculations
- **Transaction History**: Track all stock movements with detailed transaction logs
- **Analytics Dashboard**: Visual charts for category and location distribution
- **Export Capabilities**: Generate reports for external analysis

### Business Value
- Optimize inventory levels to reduce carrying costs
- Prevent stockouts through proactive low-stock alerts
- Identify overstocked items for promotional or transfer actions
- Support financial reporting with accurate inventory valuations
- Enable data-driven purchasing decisions

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [BR-inventory-balance.md](./BR-inventory-balance.md) | **Business Requirements** - Functional requirements, success metrics, acceptance criteria, and business rules |
| [TS-inventory-balance.md](./TS-inventory-balance.md) | **Technical Specification** - Component architecture, interfaces, state management, and implementation details |
| [UC-inventory-balance.md](./UC-inventory-balance.md) | **Use Cases** - Actor-based scenarios covering all user interactions and workflows |
| [FD-inventory-balance.md](./FD-inventory-balance.md) | **Flow Diagrams** - Visual process flows for page load, filtering, transactions, and analytics |
| [VAL-inventory-balance.md](./VAL-inventory-balance.md) | **Validation Rules** - Data validation, business rules, display formatting, and error handling |

---

## Quick Reference

### Data Model
```typescript
interface InventoryBalanceItem {
  id: string
  productId: string
  productCode: string
  productName: string
  category: string
  unit: string
  locationId: string
  locationName: string
  currentQuantity: number
  averageCost: number
  totalValue: number
  reorderLevel: number
  maxLevel: number
  status: 'normal' | 'low' | 'overstock' | 'out'
  lastUpdated: Date
}
```

### Status Classification
| Status | Condition | Badge Style |
|--------|-----------|-------------|
| Out of Stock | quantity = 0 | destructive |
| Low Stock | quantity ≤ reorderLevel | warning (orange) |
| Overstock | quantity > maxLevel | secondary (purple) |
| Normal | reorderLevel < quantity ≤ maxLevel | default (green) |

### Key Tabs
1. **Inventory List** - Filterable table with all balance items
2. **Analytics** - Distribution charts and category/location breakdowns
3. **Transaction History** - Detailed movement logs with IN/OUT tracking

---

## Related Modules
- [Stock Cards](../stock-cards/index.md) - Detailed transaction history per product-location
- [Slow Moving](../slow-moving/index.md) - Items with no movement for 30+ days
