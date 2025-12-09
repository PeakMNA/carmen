# Stock Cards Module

## Overview

The **Stock Cards** module provides comprehensive product-level inventory management with detailed views of stock across all hotel locations. It offers multiple view modes (List, Cards, Grouped), advanced filtering, real-time stock level monitoring, and drill-down capability to individual product stock cards.

---

## Module Information

| Property | Value |
|----------|-------|
| **Module** | Inventory Management |
| **Sub-module** | Stock Cards |
| **Route** | `/inventory-management/stock-overview/stock-cards` |
| **Version** | 1.0 |
| **Status** | Active |

---

## Key Features

### 📦 Product Inventory View
- Complete product catalog with stock levels
- Multi-location stock tracking per product
- Active/Inactive product status
- Sortable columns with multiple sort options

### 📊 Multiple View Modes
- **List View**: Traditional table format with sortable columns
- **Cards View**: Visual card layout with progress indicators
- **Grouped View**: Location-based grouping with subtotals

### 🔍 Advanced Filtering
- Search by product name or code
- Category filter dropdown
- Status filter (Active/Inactive)
- Stock level filter (Low/Normal/High)
- Location-based filtering

### 📈 Summary Statistics
- Total products count with active breakdown
- Total inventory value with average
- Normal/Low/High stock distribution
- Category count and breakdown

### 🚨 Stock Level Indicators
- Real-time stock level badges
- Progress bars showing stock relative to max
- Color-coded status (Green/Red/Amber)
- Visual alerts for critical levels

### 📤 Export Capabilities
- CSV and Excel export
- Configurable column selection
- Grouped and flat data formats
- Filtered data export

### 🔐 Access Control
- Role-based location filtering
- Permission-aware data display
- System admin full access

---

## Summary Metrics

| Card | Icon | Color | Description |
|------|------|-------|-------------|
| Total Products | Package | Blue | Product count with active breakdown |
| Total Value | DollarSign | Green | Total inventory value with average |
| Normal Stock | CheckCircle2 | Green | Products within normal range |
| Low Stock | TrendingDown | Red | Products below minimum threshold |
| High Stock | TrendingUp | Amber | Products above maximum threshold |
| Categories | Activity | Purple | Category count with top category |

---

## Stock Level Classifications

| Level | Condition | Color | Action |
|-------|-----------|-------|--------|
| Low | Current ≤ Minimum | Red | Requires reorder |
| Normal | Minimum < Current < Maximum | Green | No action needed |
| High | Current ≥ Maximum | Amber | Monitor/transfer |

---

## View Modes

### List View
- Traditional table format
- Sortable columns (Code, Name, Category, Stock, Value)
- Click row to navigate to stock card detail

### Cards View
- Visual grid layout
- Progress bar stock indicator
- Quick metrics display
- Hover effects with actions

### Grouped View
- Location-based grouping
- Expand/collapse functionality
- Group subtotals (Items, Stock, Value)
- Grand totals summary

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
app/(main)/inventory-management/stock-overview/stock-cards/
├── page.tsx                    # Main page component with all views
└── [productId]/               # Dynamic product stock card routes
```

---

## Documentation Index

| Document | Description | Link |
|----------|-------------|------|
| **Business Requirements** | Functional requirements and business objectives | [BR-stock-cards.md](./BR-stock-cards.md) |
| **Use Cases** | User interaction scenarios | [UC-stock-cards.md](./UC-stock-cards.md) |
| **Technical Specification** | Architecture and implementation details | [TS-stock-cards.md](./TS-stock-cards.md) |
| **Flow Diagrams** | Visual process flows | [FD-stock-cards.md](./FD-stock-cards.md) |
| **Validation Rules** | Data validation and business rules | [VAL-stock-cards.md](./VAL-stock-cards.md) |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Stock Overview](/docs/app/inventory-management/stock-overview) | Parent module |
| [Inventory Balance](/docs/app/inventory-management/stock-overview/inventory-balance) | Balance reporting |
| [Stock Card Detail](/docs/app/inventory-management/stock-card) | Individual product detail |
| [Inventory Transactions](/docs/app/inventory-management/transactions) | Movement history |

---

## Quick Start

### Viewing Stock Cards
1. Navigate to **Inventory Management > Stock Overview > Stock Cards**
2. View summary cards for overall statistics
3. Browse products in your preferred view mode

### Using View Modes
1. Click view toggle buttons (List/Cards/Grouped)
2. **List**: Traditional table with sorting
3. **Cards**: Visual grid with progress indicators
4. **Grouped**: Location-based organization

### Filtering Products
1. Use search box for name/code lookup
2. Select category from dropdown
3. Filter by status (Active/Inactive)
4. Filter by stock level (Low/Normal/High)

### Viewing Product Details
1. Click any product row or card
2. Navigate to Stock Card detail page
3. View movement history and locations

### Exporting Data
1. Apply desired filters
2. Click **Export** button
3. Select format and columns
4. Download file

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds |
| Filter Response | < 500ms |
| View Switch | < 300ms |
| Export (1000 records) | < 5 seconds |

---

## Dependencies

### Internal
- User Context (`lib/context/simple-user-context`)
- GroupedTable Component (`components/inventory/GroupedTable`)
- ExportButton Component (`components/inventory/ExportButton`)
- Export Utils (`lib/utils/export-utils`)

### External Libraries
| Library | Purpose |
|---------|---------|
| lucide-react | Icons |
| shadcn/ui | UI components |
| next/navigation | Router |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-15 | Initial release with full feature set |
