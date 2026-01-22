# Inventory Planning Documentation Index

## Module Overview

The Inventory Planning submodule provides advanced inventory optimization capabilities for hospitality operations. It enables organizations to optimize inventory levels, analyze dead stock, configure safety stock by service level, manage multi-location inventory, and configure reorder planning based on EOQ and ROP calculations.

## Quick Links

| Document | Description |
|----------|-------------|
| [BR-inventory-planning.md](./BR-inventory-planning.md) | Business Rules - Core rules governing inventory optimization |
| [UC-inventory-planning.md](./UC-inventory-planning.md) | Use Cases - User interactions and workflows |
| [DD-inventory-planning.md](./DD-inventory-planning.md) | Data Dictionary - Database schema and TypeScript interfaces |
| [FD-inventory-planning.md](./FD-inventory-planning.md) | Flow Diagrams - Visual workflow representations |
| [TS-inventory-planning.md](./TS-inventory-planning.md) | Technical Specifications - Component architecture and implementation |
| [VAL-inventory-planning.md](./VAL-inventory-planning.md) | Validation Rules - TypeScript validation and field rules |

## Key Concepts

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

### Risk Levels (Dead Stock)
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

### Dead Stock Actions
| Action | Description |
|--------|-------------|
| Liquidate | Sell at discounted price |
| Return | Return to supplier for credit |
| Write Off | Write off as loss |
| Continue | Keep stocking |
| Reduce | Lower stock levels |

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
- EOQ and ROP optimization recommendations
- Current vs Recommended metrics comparison
- Risk levels: low, medium, high
- Action types: implement, pilot, monitor, reject
- Expandable rows with detailed metrics
- Bulk actions (Apply Selected, Export)
- Link to Stock Replenishment in Store Operations

### Dead Stock Analysis
- Risk overview cards: Critical, High, Medium, Low counts with values
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

## Source Code Location

```
app/(main)/operational-planning/inventory-planning/
├── page.tsx                    # Dashboard with KPIs and charts (487 lines)
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

## Related Modules

- [Demand Forecasting](../demand-forecasting/) - Cross-navigation for demand predictions
- [Inventory Management](/docs/app/inventory-management/) - Source of stock data and transactions
- [Procurement](/docs/app/procurement/) - Consumes purchase recommendations
- [Store Operations](/docs/app/store-operations/stock-replenishment/) - Link from reorder planning
