# Slow Moving Inventory Module

## Overview

The **Slow Moving Inventory** module provides comprehensive analysis and management of inventory items that have been idle for extended periods. It helps identify stock that is not moving, assesses risk levels, and provides actionable recommendations for transfers, promotions, or write-offs to optimize inventory investment.

---

## Module Information

| Property | Value |
|----------|-------|
| **Module** | Inventory Management |
| **Sub-module** | Slow Moving |
| **Route** | `/inventory-management/stock-overview/slow-moving` |
| **Version** | 1.0 |
| **Status** | Active |

---

## Key Features

### 📊 Inventory Analysis
- Days idle tracking for each item
- Risk level assessment (Low, Medium, High, Critical)
- Value at risk calculations
- Category-based analysis

### 🚨 Risk Classification
- **Low Risk**: 30-60 days idle
- **Medium Risk**: 61-90 days idle
- **High Risk**: 91-120 days idle
- **Critical Risk**: 120+ days idle

### 💡 Action Recommendations
- **Transfer**: Move to higher-demand location
- **Promote**: Run promotional pricing
- **Write Off**: Remove from inventory
- **Hold**: Keep monitoring

### 📈 Analytics Dashboard
- Risk distribution visualization (Pie chart)
- Category breakdown (Bar chart)
- Days idle trend analysis
- Value impact assessment

### 🎯 Action Center
- Pending actions queue
- Action tracking and status
- Bulk action capabilities
- Priority-based sorting

### 🔍 Advanced Filtering
- Search by product name/code
- Category filter
- Risk level filter
- Suggested action filter
- Location filter

### 📊 Multiple View Modes
- **List View**: Traditional table format
- **Grouped View**: Location-based grouping

### 📤 Export Capabilities
- Full filtered dataset export
- Analytics report export
- Action summary export

---

## Summary Metrics

| Card | Icon | Color | Description |
|------|------|-------|-------------|
| Total Items | Package | Blue | Total slow-moving items |
| Total Value | DollarSign | Green | Value of slow-moving inventory |
| Avg Days Idle | Clock | Purple | Average days without movement |
| Critical Risk | AlertTriangle | Red | High priority items |
| To Transfer | ArrowRight | Amber | Items recommended for transfer |
| To Write Off | Trash2 | Red | Items recommended for write-off |

---

## Risk Levels

| Level | Days Idle | Color | Badge Style |
|-------|-----------|-------|-------------|
| Low | 30-60 | Green | Outline |
| Medium | 61-90 | Amber | Secondary |
| High | 91-120 | Orange | Warning |
| Critical | 120+ | Red | Destructive |

---

## Suggested Actions

| Action | Description | Icon | Color |
|--------|-------------|------|-------|
| Transfer | Move to higher-demand location | ArrowRight | Blue |
| Promote | Run promotional pricing | Tag | Purple |
| Write Off | Remove from inventory | Trash2 | Red |
| Hold | Keep monitoring | Eye | Gray |

---

## User Roles & Permissions

| Role | View | Filter | Take Action | All Locations |
|------|------|--------|-------------|---------------|
| Storekeeper | ✅ | ✅ | ❌ | ❌ |
| Inventory Manager | ✅ | ✅ | ✅ | ❌ |
| Financial Controller | ✅ | ✅ | ✅ | ✅ |
| System Administrator | ✅ | ✅ | ✅ | ✅ |

---

## Technical Architecture

```
app/(main)/inventory-management/stock-overview/slow-moving/
├── page.tsx                    # Main page component (1293 lines)
└── components/                 # Sub-components (if any)
```

---

## Documentation Index

| Document | Description | Link |
|----------|-------------|------|
| **Business Requirements** | Functional requirements and business objectives | [BR-slow-moving.md](./BR-slow-moving.md) |
| **Use Cases** | User interaction scenarios | [UC-slow-moving.md](./UC-slow-moving.md) |
| **Technical Specification** | Architecture and implementation details | [TS-slow-moving.md](./TS-slow-moving.md) |
| **Flow Diagrams** | Visual process flows | [FD-slow-moving.md](./FD-slow-moving.md) |
| **Validation Rules** | Data validation and business rules | [VAL-slow-moving.md](./VAL-slow-moving.md) |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Stock Overview](/docs/app/inventory-management/stock-overview) | Parent module |
| [Inventory Aging](/docs/app/inventory-management/stock-overview/inventory-aging) | Complementary aging analysis |
| [Stock Transfers](/docs/app/inventory-management/stock-transfers) | Execute transfer actions |
| [Inventory Adjustments](/docs/app/inventory-management/inventory-adjustments) | Execute write-off actions |

---

## Quick Start

### Viewing Slow Moving Inventory
1. Navigate to **Inventory Management > Stock Overview > Slow Moving**
2. View summary cards for quick statistics
3. Review items in Inventory List tab

### Analyzing Risk Distribution
1. Click **Analytics** tab
2. Review risk distribution pie chart
3. Examine category breakdown
4. Identify highest-value at-risk items

### Taking Action on Items
1. Click **Action Center** tab
2. Review pending actions by priority
3. Select items for action
4. Execute transfer, promotion, or write-off

### Filtering Data
1. Use search for specific items
2. Select category from dropdown
3. Filter by risk level
4. Filter by suggested action
5. Filter by location

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
| Recharts | PieChart, BarChart, ComposedChart |
| lucide-react | Icons |
| shadcn/ui | UI components |
| date-fns | Date formatting |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial release with full feature set |
