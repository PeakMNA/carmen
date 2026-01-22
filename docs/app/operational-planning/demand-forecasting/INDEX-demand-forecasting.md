# Demand Forecasting Documentation

## Module Overview

The **Demand Forecasting** module provides advanced analytics and prediction capabilities for inventory management in hospitality operations. It enables operations managers, executive chefs, and inventory planners to forecast future demand, analyze consumption trends, optimize inventory levels, and identify slow-moving items.

---

## Quick Navigation

| | | |
|:---:|:---:|:---:|
| [**BR**](/operational-planning/demand-forecasting/business-requirements)<br/>Business Requirements | [**UC**](/operational-planning/demand-forecasting/use-cases)<br/>Use Cases | [**TS**](/operational-planning/demand-forecasting/technical-specification)<br/>Technical Spec |
| [**DD**](/operational-planning/demand-forecasting/data-dictionary)<br/>Data Dictionary | [**FD**](/operational-planning/demand-forecasting/flow-diagrams)<br/>Flow Diagrams | [**VAL**](/operational-planning/demand-forecasting/validations)<br/>Validations |

---

## Documentation Index

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Business Requirements](./BR-demand-forecasting.md) | Functional requirements, business rules, backend specs | 2025-01-17 |
| [Use Cases](./UC-demand-forecasting.md) | User workflows and detailed scenarios | 2025-01-17 |
| [Technical Specification](./TS-demand-forecasting.md) | System architecture and component design | 2025-01-17 |
| [Data Definition](./DD-demand-forecasting.md) | Entity descriptions and data models | 2025-01-17 |
| [Flow Diagrams](./FD-demand-forecasting.md) | Visual workflow diagrams (Mermaid) | 2025-01-17 |
| [Validations](./VAL-demand-forecasting.md) | Validation rules and schemas | 2025-01-17 |

---

## Shared Methods Integration

| Shared Method | Purpose | Link |
|---------------|---------|------|
| SM-INVENTORY-OPERATIONS | Stock balance queries, transaction recording | [Documentation](../../shared-methods/inventory-operations/SM-inventory-operations.md) |
| SM-COSTING-METHODS | FIFO/Periodic Average costing integration | [Documentation](../../shared-methods/inventory-valuation/SM-costing-methods.md) |

---

## Key Features

### Forecasting Capabilities

| Feature | Description | Method |
|---------|-------------|--------|
| **Moving Average** | 30-day rolling window baseline | Simple average |
| **Exponential Smoothing** | Weighted recent data (α=0.3) | Weighted average |
| **Linear Regression** | Trend-based prediction | Least squares |
| **Seasonal Decomposition** | Seasonal pattern detection | Monthly cycles |

### Analytics Functions

| Function | Purpose | Output |
|----------|---------|--------|
| Generate Forecast | Predict future demand | Projected demand, purchase recommendations |
| Trend Analysis | Analyze consumption patterns | Direction, slope, seasonality indicators |
| Optimization | Improve inventory metrics | Reorder points, safety stock, savings |
| Dead Stock Analysis | Identify obsolete items | Risk level, recommended actions |
| Performance Dashboard | Monitor KPIs | Turnover, fill rate, alerts |

---

## User Roles & Access

| Role | Forecast | Trends | Optimization | Dead Stock | Dashboard |
|------|----------|--------|--------------|------------|-----------|
| Inventory Manager | Full | Full | Full | View | Full |
| Operations Manager | View | View | View | - | Full |
| Executive Chef | View | View | - | - | View |
| Financial Controller | View | View | Full | Full | Full |
| Purchasing Manager | View | View | View | - | View |
| General Manager | View | View | View | View | Full |

---

## Business Rules Quick Reference

### Forecasting Rules

| Rule | Description |
|------|-------------|
| BR-DF-005 | Safety stock = demand × variability × 1.65 |
| BR-DF-006 | Purchase = MAX(0, (demand + safety) - stock) |
| BR-DF-007 | Moving average uses 30-day window |
| BR-DF-008 | Exponential smoothing alpha = 0.3 |

### Risk Assessment

| Risk Level | Score Range |
|------------|-------------|
| LOW | < 0.8 |
| MEDIUM | 0.8 - 1.5 |
| HIGH | > 1.5 |

### Dead Stock Thresholds

| Risk | Days No Movement | Months of Stock |
|------|-----------------|-----------------|
| CRITICAL | > 365 | > 24 |
| HIGH | > 180 | > 12 |
| MEDIUM | > 90 | > 6 |
| LOW | ≤ 90 | ≤ 6 |

### Optimization Actions

| Action | Criteria |
|--------|----------|
| IMPLEMENT | Savings > $100, Low risk |
| PILOT | Savings > $50 |
| MONITOR | Low savings, Medium risk |
| REJECT | High risk, Negative ROI |

---

## Service Architecture

```
InventoryAnalyticsService
├── generateInventoryForecast()
├── performTrendAnalysis()
├── generateOptimizationRecommendations()
├── analyzeDeadStock()
└── generatePerformanceDashboard()
```

**Location**: `lib/services/inventory/inventory-analytics-service.ts`

---

## Performance Targets

| Operation | Target Time | Max Items |
|-----------|------------|-----------|
| Forecast Generation | < 5 seconds | 1,000 |
| Trend Analysis | < 10 seconds | 500 |
| Optimization | < 5 seconds | 500 |
| Dead Stock Analysis | < 3 seconds | All |
| Dashboard | < 3 seconds | All |
| Widget Render | < 500ms | 7 days |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| Inventory Management | Source of stock data and transactions |
| Procurement | Consumes purchase recommendations |
| Recipe Management | Provides ingredient consumption patterns |
| Store Operations | Provides requisition patterns |
| Financial Reporting | Receives valuation and dead stock data |

---

## Source Code Location

```
app/(main)/operational-planning/demand-forecasting/
├── page.tsx                    # Main dashboard with KPIs and alerts
├── forecast/
│   ├── page.tsx                # Forecast generation wizard
│   └── [itemId]/
│       └── page.tsx            # Item-level forecast detail
├── trends/
│   └── page.tsx                # Trend analysis dashboard
├── optimization/
│   └── page.tsx                # Optimization recommendations
└── settings/
    └── page.tsx                # Forecasting configuration
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-01-17 | Updated to reflect actual UI implementation with 6 pages |
| 1.0.0 | 2025-12-05 | Initial documentation release |

---

## Support

For questions or issues with Demand Forecasting:
1. Review the [Business Requirements](./BR-demand-forecasting.md) for feature details
2. Check the [Use Cases](./UC-demand-forecasting.md) for workflow guidance
3. Consult the [Technical Specification](./TS-demand-forecasting.md) for implementation details
4. Reference the [Validations](./VAL-demand-forecasting.md) for error resolution

---

**Document End**
