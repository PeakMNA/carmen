# Menu Engineering Documentation Index

## Module Overview

The Menu Engineering module provides comprehensive tools for analyzing menu performance, optimizing menu items, and implementing strategic pricing decisions based on data-driven insights. It implements the Boston Matrix (Kasavana-Smith) methodology to classify menu items into four quadrants: Stars, Plow Horses, Puzzles, and Dogs.

## Quick Links

| Document | Description |
|----------|-------------|
| [BR-menu-engineering.md](./BR-menu-engineering.md) | Business Rules - Core rules governing menu engineering analysis |
| [UC-menu-engineering.md](./UC-menu-engineering.md) | Use Cases - User interactions and workflows |
| [DD-menu-engineering.md](./DD-menu-engineering.md) | Data Dictionary - Database schema and TypeScript interfaces |
| [FD-menu-engineering.md](./FD-menu-engineering.md) | Flow Diagrams - Visual workflow representations |
| [TS-menu-engineering.md](./TS-menu-engineering.md) | Technical Specifications - Component architecture and implementation |
| [VAL-menu-engineering.md](./VAL-menu-engineering.md) | Validation Rules - Zod schemas and field validation |
| [INDEX-menu-engineering.md](./INDEX-menu-engineering.md) | Comprehensive Index - Full documentation navigation |

## Key Concepts

### Boston Matrix Classifications
- **Star**: High popularity, High profitability - Maintain and promote
- **Plow Horse**: High popularity, Low profitability - Increase pricing
- **Puzzle**: Low popularity, High profitability - Marketing focus
- **Dog**: Low popularity, Low profitability - Consider removal

### Performance Metrics
- **Popularity Score**: Percentile ranking based on sales volume (0-100)
- **Profitability Score**: Percentile ranking based on contribution margin (0-100)
- **Contribution Margin**: (Price - Cost) / Price × 100
- **Menu Mix Percentage**: Item sales / Total sales × 100

### Key Features
- Performance Matrix visualization (scatter chart)
- Portfolio Analysis (pie chart)
- Sales Data Import from POS systems (Square, Toast, Clover, Resy, OpenTable)
- Cost Alert Management with severity levels
- AI-powered recommendations
- Real-time filtering and date range selection

## Source Code Location

```
app/(main)/operational-planning/menu-engineering/
  page.tsx                                    # Main dashboard
  components/
    sales-data-import.tsx                     # POS data import wizard
    cost-alert-management.tsx                 # Alert management
    recipe-performance-metrics.tsx            # Detailed recipe metrics
```

## Related Modules

- [Recipes](../recipe-management/recipes/) - Recipe data for cost calculations
- [Categories](../recipe-management/categories/) - Menu categorization
- [Units](../recipe-management/units/) - Units of measure
- [Inventory Management](../../inventory-management/) - Real-time inventory costs
