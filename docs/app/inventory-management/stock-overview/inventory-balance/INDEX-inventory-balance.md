# Inventory Balance Module

## Overview

The **Inventory Balance** module provides comprehensive real-time visibility into stock quantities and values across all hotel locations. It offers hierarchical reporting by location, category, and product with advanced filtering, trend analytics, and actionable insights for inventory management.

---

## Quick Navigation

| | | |
|:---:|:---:|:---:|
| [**BR**](/inventory-management/stock-overview/inventory-balance/business-requirements)<br/>Business Requirements | [**UC**](/inventory-management/stock-overview/inventory-balance/use-cases)<br/>Use Cases | [**TS**](/inventory-management/stock-overview/inventory-balance/technical-specification)<br/>Technical Spec |
| [**DD**](/inventory-management/stock-overview/inventory-balance/data-dictionary)<br/>Data Dictionary | [**FD**](/inventory-management/stock-overview/inventory-balance/flow-diagrams)<br/>Flow Diagrams | [**VAL**](/inventory-management/stock-overview/inventory-balance/validations)<br/>Validations |

---

## Module Information

| Property | Value |
|----------|-------|
| **Module** | Inventory Management |
| **Sub-module** | Inventory Balance |
| **Route** | `/inventory-management/stock-overview/inventory-balance` |
| **Version** | 1.0 |
| **Status** | Active |

---

## Key Features

### 📊 Balance Report
- Real-time inventory quantities by location, category, and product
- Hierarchical data display with expandable sections
- Support for lot number tracking
- Point-in-time reporting with date selection

### 📈 Analytics Dashboard
- Inventory value trend visualization (6-month history)
- Value distribution by category (Pie chart)
- Stock quantity by location (Bar chart)
- Value by location comparison (Bar chart)

### 💡 Insights Panel
- High value items identification
- Low stock alerts with actionable recommendations
- Location performance overview
- Stock distribution efficiency metrics

### 🔄 Movement History
- Recent stock movements tracking
- Transaction type breakdown
- Inbound/outbound analysis
- Reference document linking

### 🔍 Advanced Filtering
- Location range selection
- Category range filtering
- Product range filtering
- As-of-date reporting
- Active filter badges

### 📤 Export Capabilities
- Full report export
- Customizable date ranges
- Multiple format support

### 🔐 Access Control
- Role-based location filtering
- Permission-aware data display
- System admin full access

---

## Summary Metrics

| Card | Icon | Color | Description |
|------|------|-------|-------------|
| Total Quantity | Package | Blue | Sum of all stock quantities |
| Total Value | DollarSign | Green | Total inventory value |
| Locations | Building2 | Purple | Number of active inventory points |
| Categories | Layers | Amber | Product category count |

---

## View Types

| Type | Description |
|------|-------------|
| `PRODUCT` | Product-level detail view |
| `CATEGORY` | Category-level summary view |
| `LOT` | Lot/batch-level detail view |

---

## User Roles & Permissions

| Role | View | Filter | Export | All Locations |
|------|------|--------|--------|---------------|
| Storekeeper | ✅ | ✅ | ✅ | ❌ |
| Receiving Clerk | ✅ | ✅ | ✅ | ❌ |
| Department Manager | ✅ | ✅ | ✅ | ❌ |
| Inventory Manager | ✅ | ✅ | ✅ | ❌ |
| Financial Controller | ✅ | ✅ | ✅ | ✅ |
| System Administrator | ✅ | ✅ | ✅ | ✅ |

---

## Technical Architecture

```
app/(main)/inventory-management/stock-overview/inventory-balance/
├── page.tsx                    # Main page component
├── types.ts                    # Type definitions
├── utils.ts                    # Formatting utilities
└── components/
    ├── ReportHeader.tsx        # Header with view controls
    ├── FilterPanel.tsx         # Filter inputs
    ├── BalanceTable.tsx        # Main balance table
    └── MovementHistory.tsx     # Movement history component
```

---

## Documentation Index

| Document | Description | Link |
|----------|-------------|------|
| **Business Requirements** | Functional requirements and business objectives | [BR-inventory-balance.md](./BR-inventory-balance.md) |
| **Use Cases** | User interaction scenarios | [UC-inventory-balance.md](./UC-inventory-balance.md) |
| **Technical Specification** | Architecture and implementation details | [TS-inventory-balance.md](./TS-inventory-balance.md) |
| **Data Dictionary** | Data structures and schema definitions | [DD-inventory-balance.md](./DD-inventory-balance.md) |
| **Flow Diagrams** | Visual process flows | [FD-inventory-balance.md](./FD-inventory-balance.md) |
| **Validation Rules** | Data validation and business rules | [VAL-inventory-balance.md](./VAL-inventory-balance.md) |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Stock Overview](/docs/app/inventory-management/stock-overview) | Parent module |
| [Stock Cards](/docs/app/inventory-management/stock-overview/stock-cards) | Product-level detail view |
| [Inventory Transactions](/docs/app/inventory-management/transactions) | Transaction source |
| [Stock Transfers](/docs/app/inventory-management/stock-transfers) | Movement source |

---

## Quick Start

### Viewing Balance Report
1. Navigate to **Inventory Management > Stock Overview > Inventory Balance**
2. View summary cards for total quantities and values
3. Browse hierarchical balance table

### Filtering Data
1. Click **Filters** to expand the filter panel
2. Set location, category, or product ranges
3. Select as-of date for point-in-time reporting
4. View active filters as badges

### Analyzing Trends
1. Click **Analytics** tab
2. Review value trend chart
3. Examine distribution charts
4. Identify patterns across locations

### Viewing Insights
1. Click **Insights** tab
2. Review high value items
3. Check low stock alerts
4. Analyze location performance

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds |
| Filter Response | < 500ms |
| Report Export | < 5 seconds |
| Chart Render | < 1 second |

---

## Dependencies

### Internal
- User Context (`lib/context/simple-user-context`)
- Mock Balance Report (`lib/mock-data`)

### External Libraries
| Library | Purpose |
|---------|---------|
| Recharts | Analytics charts |
| date-fns | Date manipulation |
| lucide-react | Icons |
| shadcn/ui | UI components |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial release with full feature set |
