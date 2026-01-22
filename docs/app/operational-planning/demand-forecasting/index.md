# Demand Forecasting Documentation Index

## Module Overview

The Demand Forecasting submodule provides advanced analytics and prediction capabilities for inventory management in hospitality operations. It enables forecasting future demand, analyzing consumption trends, optimizing inventory levels, and identifying slow-moving items.

## Quick Links

| Document | Description |
|----------|-------------|
| [BR-demand-forecasting.md](./BR-demand-forecasting.md) | Business Rules - Core rules governing demand forecasting |
| [UC-demand-forecasting.md](./UC-demand-forecasting.md) | Use Cases - User interactions and workflows |
| [DD-demand-forecasting.md](./DD-demand-forecasting.md) | Data Dictionary - Database schema and TypeScript interfaces |
| [FD-demand-forecasting.md](./FD-demand-forecasting.md) | Flow Diagrams - Visual workflow representations |
| [TS-demand-forecasting.md](./TS-demand-forecasting.md) | Technical Specifications - Component architecture and implementation |
| [VAL-demand-forecasting.md](./VAL-demand-forecasting.md) | Validation Rules - Zod schemas and field validation |

## Key Concepts

### Forecast Methods
- **Moving Average**: 30-day rolling window baseline calculation
- **Exponential Smoothing**: Alpha=0.3 weighted recent data
- **Linear Regression**: Trend-based forecasting with slope calculation
- **Seasonal Decomposition**: Seasonal pattern detection (requires 60+ days history)

### Service Levels
- **90%**: Safety stock multiplier 1.28
- **95%**: Safety stock multiplier 1.65 (default)
- **99%**: Safety stock multiplier 2.33

### Risk Levels
- **LOW**: Risk score < 0.8
- **MEDIUM**: Risk score 0.8-1.5
- **HIGH**: Risk score > 1.5

### Key Features
- Dashboard with KPIs and alerts
- Forecast generation wizard
- Item-level forecast details
- Trend analysis with charts
- Optimization recommendations
- Configurable settings

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

## Related Modules

- [Inventory Management](../../inventory-management/) - Source of stock data and transactions
- [Procurement](../../procurement/) - Consumes purchase recommendations
- [Recipe Management](../recipe-management/) - Provides ingredient consumption patterns
