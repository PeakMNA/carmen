# Inventory Aging

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Aging |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

---

## Overview

The Inventory Aging module helps hotel operations track inventory age and expiration dates to ensure FIFO (First-In-First-Out) compliance, minimize waste from expired products, and optimize inventory freshness for quality assurance.

### Key Features
- **Age Tracking**: Track inventory age from receipt date with four-tier age buckets (0-30, 31-60, 61-90, 90+ days)
- **Expiry Monitoring**: Monitor expiry dates with status classification (Good, Expiring Soon, Critical, Expired, No Expiry)
- **Value at Risk**: Calculate financial exposure from aging and expiring inventory
- **Alert System**: Critical alerts for expired and near-expiry items requiring attention
- **Analytics Dashboard**: Expiry timeline, age distribution, expiry status, location performance, and category analysis
- **Action Center**: Quick actions, critical items list, oldest items list, and recommended actions
- **Multi-view Support**: List view and grouped view by location or age bucket
- **Export Capabilities**: Generate aging reports for external use

### Business Value
- Ensure food safety through expiry monitoring
- Reduce waste and financial losses from expired products
- Improve FIFO compliance across all locations
- Enable data-driven decisions on inventory management
- Visualize upcoming expirations for proactive planning

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [BR-inventory-aging.md](./BR-inventory-aging.md) | **Business Requirements** - Functional requirements, success metrics, acceptance criteria, and business rules |
| [TS-inventory-aging.md](./TS-inventory-aging.md) | **Technical Specification** - Component architecture, interfaces, state management, and implementation details |
| [UC-inventory-aging.md](./UC-inventory-aging.md) | **Use Cases** - Actor-based scenarios covering all user interactions and workflows |
| [FD-inventory-aging.md](./FD-inventory-aging.md) | **Flow Diagrams** - Visual process flows for page load, calculations, alerts, and actions |
| [VAL-inventory-aging.md](./VAL-inventory-aging.md) | **Validation Rules** - Data validation, business rules, display formatting, and error handling |

---

## Quick Reference

### Data Model
```typescript
interface AgingItem {
  id: string
  productId: string
  productCode: string
  productName: string
  category: string
  unit: string
  lotNumber?: string
  locationId: string
  locationName: string
  receiptDate: Date
  ageInDays: number
  ageBucket: '0-30' | '31-60' | '61-90' | '90+'
  expiryDate?: Date
  quantity: number
  value: number
}
```

### Age Bucket Classification
| Bucket | Age Range | Badge Style | Color |
|--------|-----------|-------------|-------|
| 0-30 | 0-30 days | outline | Green (#22c55e) |
| 31-60 | 31-60 days | outline | Yellow (#eab308) |
| 61-90 | 61-90 days | outline | Orange (#f97316) |
| 90+ | 90+ days | destructive | Red (#ef4444) |

### Expiry Status Classification
| Status | Days to Expiry | Badge Style | Color |
|--------|----------------|-------------|-------|
| Good | >= 90 days | outline | Green (#22c55e) |
| Expiring Soon | 30-89 days | outline | Yellow (#eab308) |
| Critical | 0-29 days | destructive | Orange (#f97316) |
| Expired | < 0 days | destructive | Red (#ef4444) |
| No Expiry | N/A | secondary | Gray (#94a3b8) |

### Alert Types
| Alert | Type | Trigger Condition |
|-------|------|-------------------|
| Expired Items | Destructive | Items past expiry date |
| Items Expiring Soon | Warning | Items expiring within 90 days |

### Summary Cards (6)
| Card | Metric | Icon |
|------|--------|------|
| Total Items | COUNT(aging_items) | Package |
| Total Value | SUM(item.value) | DollarSign |
| Average Age | AVG(item.ageInDays) | Clock |
| Near Expiry | COUNT(expiring-soon + critical) | Timer |
| Expired Items | COUNT(expired) | AlertCircle |
| Value at Risk | SUM(at-risk values) | TrendingDown |

### Key Tabs
1. **Inventory List** - Filterable table with all aging items
2. **Analytics** - Expiry timeline, age/expiry distribution, location performance, category analysis
3. **Action Center** - Value at risk summary, critical items, oldest items, recommended actions

### Value at Risk Categories
| Category | Condition | Badge |
|----------|-----------|-------|
| Already Expired | expiryStatus = 'expired' | Critical |
| Expiring <30 days | expiryStatus = 'critical' | Urgent |
| Expiring 30-90 days | expiryStatus = 'expiring-soon' | Monitor |

---

## Related Modules
- [Inventory Balance](../inventory-balance/index.md) - Current stock levels and status
- [Slow Moving](../slow-moving/index.md) - Items with no movement for 30+ days
- [Stock Cards](../stock-cards/index.md) - Detailed transaction history per product-location
