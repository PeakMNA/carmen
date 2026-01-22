# Slow Moving Inventory

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Slow Moving |
| Version | 3.0.0 |
| Last Updated | 2025-01-15 |

---

## Overview

The Slow Moving Inventory module identifies and manages inventory items that have been idle for extended periods (30+ days without movement). It enables proactive action to optimize inventory investment, reduce waste, and improve cash flow through intelligent risk classification and actionable recommendations.

### Key Features
- **Automatic Detection**: Identify items with no movement for 30+ days
- **Risk Classification**: Four-tier risk levels (Low, Medium, High, Critical)
- **Action Recommendations**: System-suggested actions (Transfer, Promote, Write-Off, Hold)
- **Alert System**: Critical alerts for high-risk items and write-off candidates
- **Analytics Dashboard**: Risk distribution, aging analysis, category/location breakdowns
- **Action Center**: Quick actions for bulk operations and prioritized recommendations
- **Multi-view Support**: List view and grouped view by location

### Business Value
- Reduce inventory carrying costs
- Minimize waste and obsolescence
- Improve cash flow through proactive inventory management
- Enable data-driven decisions on slow-moving stock
- Support operational efficiency with actionable insights

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [BR-slow-moving.md](./BR-slow-moving.md) | **Business Requirements** - Functional requirements, success metrics, acceptance criteria, and business rules |
| [TS-slow-moving.md](./TS-slow-moving.md) | **Technical Specification** - Component architecture, interfaces, state management, and implementation details |
| [UC-slow-moving.md](./UC-slow-moving.md) | **Use Cases** - Actor-based scenarios covering all user interactions and workflows |
| [FD-slow-moving.md](./FD-slow-moving.md) | **Flow Diagrams** - Visual process flows for page load, risk calculation, alerts, and actions |
| [VAL-slow-moving.md](./VAL-slow-moving.md) | **Validation Rules** - Data validation, business rules, display formatting, and error handling |

---

## Quick Reference

### Data Model
```typescript
interface SlowMovingItem {
  id: string
  productId: string
  productCode: string
  productName: string
  category: string
  unit: string
  locationId: string
  locationName: string
  lastMovementDate: Date
  daysSinceMovement: number
  currentStock: number
  value: number
  averageCost: number
  turnoverRate: number  // movements per month
  suggestedAction: 'transfer' | 'promote' | 'writeoff' | 'hold'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}
```

### Risk Level Classification
| Level | Days Since Movement | Badge Style | Color |
|-------|---------------------|-------------|-------|
| Low | 30-60 | outline | Green |
| Medium | 61-90 | outline | Yellow |
| High | 91-120 | outline | Orange |
| Critical | 120+ | destructive | Red |

### Suggested Actions
| Action | Description | Badge Color |
|--------|-------------|-------------|
| Transfer | Move to higher-demand location | Blue |
| Promote | Run promotional pricing | Purple |
| Write Off | Remove from inventory | Red |
| Hold | Continue monitoring | Gray |

### Alert Types
| Alert | Type | Trigger Condition |
|-------|------|-------------------|
| Critical Risk Items | Critical | Items with 120+ days idle |
| Items for Write-Off | Warning | Items recommended for write-off |
| Items Inactive 180+ Days | Warning | Items with 180+ days idle |

### Key Tabs
1. **Inventory List** - Filterable table with all slow-moving items
2. **Analytics** - Risk/action distribution, aging charts, category/location breakdowns
3. **Action Center** - Quick actions and prioritized recommendations by risk level

### Summary Cards (6)
| Card | Metric | Icon |
|------|--------|------|
| Total Items | COUNT(slow_moving_items) | Package |
| Total Value | SUM(item.value) | DollarSign |
| Avg Days Idle | AVG(daysSinceMovement) | Clock |
| Critical Risk | COUNT(riskLevel='critical') | AlertTriangle |
| To Transfer | COUNT(suggestedAction='transfer') | ArrowRightLeft |
| To Write Off | COUNT(suggestedAction='writeoff') | Trash2 |

---

## Related Modules
- [Inventory Balance](../inventory-balance/index.md) - Current stock levels and status
- [Stock Cards](../stock-cards/index.md) - Detailed transaction history per product-location
