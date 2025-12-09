# Demand Forecasting Documentation

## Module Overview

The **Demand Forecasting** module provides advanced analytics and prediction capabilities for inventory management in hospitality operations. It enables operations managers, executive chefs, and inventory planners to forecast future demand, analyze consumption trends, optimize inventory levels, and identify slow-moving or dead stock items.

---

## Quick Navigation

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [Business Requirements](./BR-demand-forecasting.md) | Functional requirements, business rules, backend specs | 2025-12-05 |
| [Use Cases](./UC-demand-forecasting.md) | User workflows and detailed scenarios | 2025-12-05 |
| [Technical Specification](./TS-demand-forecasting.md) | System architecture and component design | 2025-12-05 |
| [Data Definition](./DD-demand-forecasting.md) | Entity descriptions and data models | 2025-12-05 |
| [Flow Diagrams](./FD-demand-forecasting.md) | Visual workflow diagrams (Mermaid) | 2025-12-05 |
| [Validations](./VAL-demand-forecasting.md) | Validation rules and schemas | 2025-12-05 |

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

## Version History

| Version | Date | Changes |
|---------|------|---------|
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
