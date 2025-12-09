# Inventory Transactions Module

## Overview

The **Inventory Transactions** module provides a unified view of all inventory movements across hotel locations. It consolidates transactions from multiple sources—Goods Received Notes (GRN), Store Requisitions, Stock Transfers, Inventory Adjustments, Write-offs, Physical Counts, and Wastage Reports—into a single, filterable interface with comprehensive analytics capabilities.

---

## Module Information

| Property | Value |
|----------|-------|
| **Module** | Inventory Management |
| **Sub-module** | Transactions |
| **Route** | `/inventory-management/transactions` |
| **Version** | 1.0 |
| **Status** | Active |

---

## Key Features

### 📊 Unified Transaction View
- Consolidated view of all inventory movements
- 10-column sortable data table
- Real-time search across products, references, and locations

### 🔍 Advanced Filtering
- Date range selection with calendar picker
- Quick filters: Today, 7 Days, 30 Days, This Month
- Multi-select for transaction and reference types
- Location and category filtering
- Active filter badges with clear functionality

### 📈 Analytics Dashboard
- Transaction trend visualization (Area chart)
- Distribution by type (Pie chart)
- Location activity comparison (Bar chart)
- Reference type breakdown (Bar chart)
- Top categories by value (Bar chart)

### 📋 Summary Metrics
- Total transaction count
- Total inbound value
- Total outbound value
- Net change indicator

### 📤 Export Capabilities
- CSV export with all filtered records
- Comprehensive column selection
- Date-stamped filenames

### 🔐 Access Control
- Role-based location filtering
- Permission-aware data display
- System admin full access

---

## Transaction Types

| Type | Label | Color | Description |
|------|-------|-------|-------------|
| `IN` | Inbound | Green | Stock entering the location |
| `OUT` | Outbound | Red | Stock leaving the location |
| `ADJUSTMENT` | Adjustment | Amber | Non-movement stock corrections |

---

## Reference Types

| Code | Full Name | Source Module |
|------|-----------|---------------|
| `GRN` | Goods Received Note | Procurement |
| `SO` | Sales Order | Sales |
| `ADJ` | Adjustment | Inventory Adjustments |
| `TRF` | Transfer | Stock Transfers |
| `PO` | Purchase Order | Procurement |
| `WO` | Write Off | Inventory Management |
| `SR` | Store Requisition | Store Operations |
| `PC` | Physical Count | Inventory Counts |
| `WR` | Wastage Report | Store Operations |

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
app/(main)/inventory-management/transactions/
├── page.tsx                    # Main page component
├── types.ts                    # Type definitions
└── components/
    ├── index.ts                # Barrel export
    ├── TransactionSummaryCards.tsx
    ├── TransactionFilters.tsx
    ├── TransactionTable.tsx
    └── TransactionAnalytics.tsx
```

---

## Documentation Index

| Document | Description | Link |
|----------|-------------|------|
| **Business Requirements** | Functional requirements and business objectives | [BR-inventory-transactions.md](./BR-inventory-transactions.md) |
| **Use Cases** | User interaction scenarios | [UC-inventory-transactions.md](./UC-inventory-transactions.md) |
| **Technical Specification** | Architecture and implementation details | [TS-inventory-transactions.md](./TS-inventory-transactions.md) |
| **Flow Diagrams** | Visual process flows | [FD-inventory-transactions.md](./FD-inventory-transactions.md) |
| **Validation Rules** | Data validation and business rules | [VAL-inventory-transactions.md](./VAL-inventory-transactions.md) |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Stock Overview](/docs/app/inventory-management/stock-overview) | Source of stock level context |
| [Inventory Balance](/docs/app/inventory-management/inventory-balance) | Source of balance data |
| [Stock Transfers](/docs/app/inventory-management/stock-transfers) | Transfer transaction source |
| [Inventory Adjustments](/docs/app/inventory-management/inventory-adjustments) | Adjustment transaction source |
| [Inventory Counts](/docs/app/inventory-management/inventory-counts) | Physical count transaction source |
| [GRN](/docs/app/procurement/grn) | Goods received transaction source |
| [Store Requisitions](/docs/app/store-operations/store-requisitions) | Requisition transaction source |
| [Wastage Reporting](/docs/app/store-operations/wastage-reporting) | Wastage transaction source |

---

## Quick Start

### Viewing Transactions
1. Navigate to **Inventory Management > Transactions**
2. View summary cards for quick metrics overview
3. Browse transaction table with default 30-day filter

### Filtering Data
1. Click **Filters** to expand the filter panel
2. Select date range using calendar or quick buttons
3. Choose transaction types, reference types, or locations
4. View active filters as badges above the table

### Analyzing Trends
1. Click **Analytics** tab
2. Review trend chart for temporal patterns
3. Examine distribution charts for category insights
4. Hover on chart elements for detailed tooltips

### Exporting Data
1. Apply desired filters
2. Click **Export CSV** button
3. Download includes all filtered records (not just current page)

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds |
| Filter Response | < 500ms |
| CSV Export (1000 records) | < 5 seconds |
| Chart Render | < 1 second |

---

## Dependencies

### Internal
- User Context (`lib/context/simple-user-context`)
- Mock Data Generator (`lib/mock-data/transactions`)

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
