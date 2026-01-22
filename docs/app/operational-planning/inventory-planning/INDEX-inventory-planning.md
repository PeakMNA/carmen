# Inventory Planning - Document Index

## Document Information

| Field | Value |
|-------|-------|
| Module | Operational Planning > Inventory Planning |
| Version | 2.0.0 |
| Last Updated | 2025-01-17 |
| Status | Implemented |

---

## Quick Navigation

| | | |
|:---:|:---:|:---:|
| [**BR**](/operational-planning/inventory-planning/business-requirements)<br/>Business Requirements | [**UC**](/operational-planning/inventory-planning/use-cases)<br/>Use Cases | [**TS**](/operational-planning/inventory-planning/technical-specification)<br/>Technical Spec |
| [**DD**](/operational-planning/inventory-planning/data-dictionary)<br/>Data Dictionary | [**FD**](/operational-planning/inventory-planning/flow-diagrams)<br/>Flow Diagrams | [**VAL**](/operational-planning/inventory-planning/validations)<br/>Validations |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-01-17 | Development Team | Updated to match actual implementation with UI details |
| 1.0.0 | 2025-12-06 | Development Team | Initial documentation |

---

## Module Overview

The Inventory Planning submodule provides advanced inventory optimization capabilities for hospitality operations. It enables organizations to optimize inventory levels, analyze dead stock, configure safety stock by service level, manage multi-location inventory, and configure reorder planning based on EOQ and ROP calculations.

---

## Document Index

| Document | Type | Description | Status |
|----------|------|-------------|--------|
| [BR-inventory-planning.md](./BR-inventory-planning.md) | Business Rules | Core business rules governing inventory optimization, dead stock management, and reorder calculations | Implemented |
| [UC-inventory-planning.md](./UC-inventory-planning.md) | Use Cases | User interactions and workflows for all inventory planning features | Implemented |
| [DD-inventory-planning.md](./DD-inventory-planning.md) | Data Dictionary | TypeScript interfaces, database schema, and data structures | Implemented |
| [FD-inventory-planning.md](./FD-inventory-planning.md) | Flow Diagrams | Mermaid 8.8.2 compatible workflow diagrams | Implemented |
| [TS-inventory-planning.md](./TS-inventory-planning.md) | Technical Spec | Component architecture, state management, and implementation details | Implemented |
| [VAL-inventory-planning.md](./VAL-inventory-planning.md) | Validation Rules | Zod schemas and field validation rules | Implemented |

---

## Module Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/operational-planning/inventory-planning` | Main dashboard with KPIs, charts, and alerts |
| Reorder Management | `/operational-planning/inventory-planning/reorder` | EOQ/ROP optimization recommendations |
| Dead Stock Analysis | `/operational-planning/inventory-planning/dead-stock` | Risk-based dead stock analysis |
| Safety Stock | `/operational-planning/inventory-planning/safety-stock` | Service level-based safety stock optimization |
| Multi-Location | `/operational-planning/inventory-planning/locations` | Cross-location inventory balancing |
| Settings | `/operational-planning/inventory-planning/settings` | Module configuration |

---

## Key Features

### Dashboard
- KPI cards: Total Savings, Items at Risk, Optimization Rate, Dead Stock Value
- Trend indicators with month-over-month comparisons
- Optimization Actions pie chart (Implement, Pilot, Monitor, Reject)
- Location Performance bar chart
- Alert summary grid (Low Stock, Overstock, Dead Stock, Expiring, High Value, Fast Moving)
- Recent Recommendations table
- Cross-navigation to Demand Forecasting

### Reorder Management (Supplier Reorder Planning)
- EOQ (Economic Order Quantity) and ROP (Reorder Point) calculations
- Current vs Recommended metrics comparison
- Risk levels: low, medium, high
- Action types: implement, pilot, monitor, reject
- Expandable rows with detailed metrics
- Bulk actions (Apply Selected, Export)
- Filtering by action type
- Link to Stock Replenishment in Store Operations

### Dead Stock Analysis
- Risk overview cards: Critical, High, Medium, Low counts with values
- Risk levels: critical, high, medium, low
- Recommended actions: liquidate, return, writeoff, continue, reduce
- Threshold filters: 60, 90, 120, 180, 365 days
- Days since movement visualization
- Expandable rows with Stock Analysis and Financial Impact sections
- Bulk action support with checkboxes
- Export functionality

### Safety Stock Optimization
- Service level tabs: 90%, 95%, 99%
- Current vs Recommended safety stock comparison table
- What-if analysis chart (Recharts LineChart)
- Cost impact calculations
- Apply Selected functionality

### Multi-Location Planning
- Location status: optimal, overstocked, understocked
- Location performance chart (Recharts BarChart)
- Transfer priority: high, medium, low
- Transfer recommendations table
- Estimated savings per transfer

### Settings Configuration
- Default Parameters: service level, order cost, holding cost rate, lead time
- Alert Thresholds: dead stock threshold days, alert toggles
- Notification Settings: email toggle, notification email, digest frequency
- Automation Settings: auto-apply low risk, auto-generate weekly, sync with procurement

---

## Key Business Concepts

### EOQ (Economic Order Quantity)
```
EOQ = sqrt(2DS/H)
Where:
- D = Annual demand (units)
- S = Order cost per order ($)
- H = Annual holding cost per unit ($)
```

### Reorder Point (ROP)
```
ROP = (Lead Time x Daily Demand) + Safety Stock
```

### Safety Stock
```
Safety Stock = Z x sigma x sqrt(Lead Time)
Where:
- Z = Z-score for service level (90%=1.28, 95%=1.65, 99%=2.33)
- sigma = Standard deviation of demand
```

### Risk Classification (Dead Stock)
| Risk Level | Days No Movement | OR | Months of Stock |
|------------|-----------------|-----|-----------------|
| Critical | > 365 | OR | > 24 |
| High | > 180 | OR | > 12 |
| Medium | > 90 | OR | > 6 |
| Low | <= 90 | AND | <= 6 |

### Action Recommendations
| Action | Criteria |
|--------|----------|
| Implement | Low risk, savings > $100 |
| Pilot | Any risk, savings > $50 |
| Monitor | Medium risk, savings > $0 |
| Reject | High risk or negative savings |

---

## Source Code Location

```
app/(main)/operational-planning/inventory-planning/
├── page.tsx                    # Dashboard with KPIs and charts
├── reorder/
│   └── page.tsx                # EOQ/ROP optimization (680 lines)
├── dead-stock/
│   └── page.tsx                # Dead stock analysis (673 lines)
├── safety-stock/
│   └── page.tsx                # Safety stock by service level (417 lines)
├── locations/
│   └── page.tsx                # Multi-location planning (527 lines)
└── settings/
    └── page.tsx                # Configuration settings (430 lines)
```

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Demand Forecasting](../demand-forecasting/) | Cross-navigation for demand predictions |
| [Inventory Management](/docs/app/inventory-management/) | Source of stock data and transactions |
| [Procurement](/docs/app/procurement/) | Consumes purchase recommendations |
| [Store Operations](/docs/app/store-operations/stock-replenishment/) | Link from reorder planning |

---

## UI Component Library

| Component | Source |
|-----------|--------|
| Card, Button, Badge | Shadcn/ui |
| Table, Select, Input | Shadcn/ui |
| Checkbox, Tabs | Shadcn/ui |
| Dialog, Switch, Label | Shadcn/ui |
| Charts (Pie, Bar, Line) | Recharts |
| Icons | Lucide React |

---

**Document End**
