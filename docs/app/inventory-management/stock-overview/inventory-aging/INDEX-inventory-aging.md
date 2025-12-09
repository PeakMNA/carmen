# Inventory Aging Module

## Overview

The **Inventory Aging** module provides comprehensive analysis and tracking of inventory items based on their age and expiry status. It helps identify items approaching expiration, tracks value at risk, and provides actionable insights for inventory rotation and waste reduction through FIFO compliance.

---

## Module Information

| Property | Value |
|----------|-------|
| **Module** | Inventory Management |
| **Sub-module** | Inventory Aging |
| **Route** | `/inventory-management/stock-overview/inventory-aging` |
| **Version** | 1.0 |
| **Status** | Active |

---

## Key Features

### 📊 Age Bucket Analysis
- Categorize items by age buckets (0-30, 31-60, 61-90, 90+ days)
- Track receiving date and age in days
- Visual age distribution charts

### ⏰ Expiry Tracking
- Monitor expiry dates for perishable items
- Track days until expiration
- Expiry status classification

### 🚨 Value at Risk
- Calculate expired inventory value
- Track critical expiry value
- Monitor expiring-soon value
- Total value at risk dashboard

### 📈 Analytics Dashboard
- Age distribution visualization (Area chart)
- Expiry status breakdown (Pie chart)
- Category analysis (Bar chart)
- Value trend analysis

### 🎯 Action Center
- Priority-based action queue
- FIFO compliance recommendations
- Expiry-based disposal tracking
- Transfer recommendations

### 🔍 Advanced Filtering
- Search by product name/code
- Category filter
- Age bucket filter
- Expiry status filter
- Location filter

### 📊 Multiple View Modes
- **List View**: Traditional table format
- **Grouped View**: By location or age bucket

### 📤 Export Capabilities
- Full filtered dataset export
- Expiry report export
- Value at risk summary

---

## Summary Metrics

| Card | Icon | Color | Description |
|------|------|-------|-------------|
| Total Items | Package | Blue | Total inventory items tracked |
| Total Value | DollarSign | Green | Total inventory value |
| Average Age | Clock | Purple | Average item age in days |
| Near Expiry | AlertTriangle | Amber | Items expiring within 30 days |
| Expired Items | XCircle | Red | Items past expiration date |
| Value at Risk | TrendingDown | Red | Total value at risk |

---

## Age Buckets

| Bucket | Age Range | Color | Description |
|--------|-----------|-------|-------------|
| 0-30 | 0-30 days | Green | Fresh inventory |
| 31-60 | 31-60 days | Blue | Normal age |
| 61-90 | 61-90 days | Amber | Aging inventory |
| 90+ | 90+ days | Red | Old inventory |

---

## Expiry Status Classifications

| Status | Condition | Color | Badge Style |
|--------|-----------|-------|-------------|
| Good | > 30 days to expiry | Green | Success |
| Expiring Soon | 15-30 days to expiry | Amber | Warning |
| Critical | < 15 days to expiry | Orange | Warning |
| Expired | Past expiry date | Red | Destructive |
| No Expiry | No expiry date set | Gray | Secondary |

---

## Grouping Options

| Group By | Description |
|----------|-------------|
| Location | Group items by storage location |
| Age Bucket | Group items by age range |

---

## User Roles & Permissions

| Role | View | Filter | Take Action | All Locations |
|------|------|--------|-------------|---------------|
| Storekeeper | ✅ | ✅ | ✅ | ❌ |
| Quality Manager | ✅ | ✅ | ✅ | ✅ |
| Inventory Manager | ✅ | ✅ | ✅ | ❌ |
| Financial Controller | ✅ | ✅ | ✅ | ✅ |
| System Administrator | ✅ | ✅ | ✅ | ✅ |

---

## Technical Architecture

```
app/(main)/inventory-management/stock-overview/inventory-aging/
├── page.tsx                    # Main page component (1543 lines)
└── components/                 # Sub-components (if any)
```

---

## Documentation Index

| Document | Description | Link |
|----------|-------------|------|
| **Business Requirements** | Functional requirements and business objectives | [BR-inventory-aging.md](./BR-inventory-aging.md) |
| **Use Cases** | User interaction scenarios | [UC-inventory-aging.md](./UC-inventory-aging.md) |
| **Technical Specification** | Architecture and implementation details | [TS-inventory-aging.md](./TS-inventory-aging.md) |
| **Flow Diagrams** | Visual process flows | [FD-inventory-aging.md](./FD-inventory-aging.md) |
| **Validation Rules** | Data validation and business rules | [VAL-inventory-aging.md](./VAL-inventory-aging.md) |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Stock Overview](/docs/app/inventory-management/stock-overview) | Parent module |
| [Slow Moving](/docs/app/inventory-management/stock-overview/slow-moving) | Complementary analysis |
| [Stock Transfers](/docs/app/inventory-management/stock-transfers) | Execute FIFO transfers |
| [Inventory Adjustments](/docs/app/inventory-management/inventory-adjustments) | Execute disposal actions |

---

## Quick Start

### Viewing Inventory Aging
1. Navigate to **Inventory Management > Stock Overview > Inventory Aging**
2. View summary cards for quick statistics
3. Review items in Inventory List tab

### Analyzing Age Distribution
1. Click **Analytics** tab
2. Review age distribution area chart
3. Examine expiry status pie chart
4. Identify categories with oldest inventory

### Managing Expiring Items
1. Click **Action Center** tab
2. Review items by expiry priority
3. Select items for action
4. Execute transfer or disposal

### Filtering Data
1. Use search for specific items
2. Select category from dropdown
3. Filter by age bucket
4. Filter by expiry status
5. Filter by location

### Using Group View
1. Select "Grouped" view mode
2. Choose grouping: Location or Age Bucket
3. Expand/collapse groups as needed
4. View subtotals per group

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds |
| Filter Response | < 500ms |
| Report Export | < 5 seconds |
| Action Execution | < 1 second |

---

## Dependencies

### Internal
- User Context (`lib/context/simple-user-context`)
- Export Utils (`lib/utils/export-utils`)
- Formatters (`lib/utils/formatters`)

### External Libraries
| Library | Purpose |
|---------|---------|
| Recharts | AreaChart, PieChart, BarChart, ComposedChart |
| lucide-react | Icons |
| shadcn/ui | UI components |
| date-fns | Date formatting and calculations |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial release with full feature set |
