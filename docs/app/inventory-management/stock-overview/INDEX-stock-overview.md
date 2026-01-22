# Stock Overview Module

## Overview

The **Stock Overview** module is a comprehensive inventory visibility platform within the Inventory Management system. It provides real-time and historical insights into inventory positions across all hotel locations, enabling proactive inventory management through dashboards, alerts, and actionable analytics.

---

## Module Information

| Property | Value |
|----------|-------|
| **Module** | Inventory Management |
| **Sub-module** | Stock Overview |
| **Route** | `/inventory-management/stock-overview` |
| **Version** | 1.0 |
| **Status** | Active |

---

## Sub-sections

The Stock Overview module contains four specialized sub-sections for different inventory analysis needs:

| Sub-section | Description | Route |
|-------------|-------------|-------|
| **[Inventory Balance](./inventory-balance/INDEX-inventory-balance.md)** | Real-time stock quantities and values by location, category, and product | `/stock-overview/inventory-balance` |
| **[Stock Cards](./stock-cards/INDEX-stock-cards.md)** | Product-centric inventory view with location distribution | `/stock-overview/stock-cards` |
| **[Slow Moving](./slow-moving/INDEX-slow-moving.md)** | Analysis of stagnant inventory requiring action | `/stock-overview/slow-moving` |
| **[Inventory Aging](./inventory-aging/INDEX-inventory-aging.md)** | Age bucket analysis and expiry tracking | `/stock-overview/inventory-aging` |

---

## Key Features

### Dashboard & KPIs
- Real-time inventory summary cards
- Total quantity and value metrics
- Location count and category overview
- Trend indicators vs. previous periods

### Multi-Location Visibility
- Unified view across all storage locations
- Location-specific filtering
- Cross-location comparisons
- Performance benchmarking

### Proactive Alerts
- Low stock warnings
- Expiry notifications
- Slow-moving inventory alerts
- Reorder point triggers

### Transfer Optimization
- AI-powered transfer suggestions
- Priority-based recommendations
- Potential savings calculations
- Cross-location balancing

### Analytics & Reporting
- Value trend charts
- Category distribution analysis
- Location performance metrics
- Export capabilities

---

## Summary Metrics

| Metric | Description | Icon | Color |
|--------|-------------|------|-------|
| Total Items | Sum of all stock quantities | Package | Blue |
| Total Value | Total inventory valuation | DollarSign | Green |
| Locations | Number of active inventory points | Building2 | Purple |
| Categories | Product category count | Layers | Amber |
| Low Stock | Items below reorder point | AlertTriangle | Red |
| Expiring Soon | Items nearing expiry | Clock | Orange |

---

## User Roles & Permissions

| Role | View All | Filter | Export | All Locations |
|------|----------|--------|--------|---------------|
| Storekeeper | Yes | Yes | Yes | No (assigned only) |
| Receiving Clerk | Yes | Yes | Yes | No (assigned only) |
| Department Manager | Yes | Yes | Yes | No (assigned only) |
| Inventory Manager | Yes | Yes | Yes | No (assigned only) |
| Financial Controller | Yes | Yes | Yes | Yes |
| System Administrator | Yes | Yes | Yes | Yes |

---

## Navigation Flow

```
Stock Overview (Index)
    |
    +-- Inventory Balance
    |       View current stock by location/category/product
    |
    +-- Stock Cards
    |       Product-centric view with location breakdown
    |
    +-- Slow Moving
    |       Stagnant inventory analysis and actions
    |
    +-- Inventory Aging
            Age bucket analysis and expiry tracking
```

---

## Technical Architecture

```
app/(main)/inventory-management/stock-overview/
+-- page.tsx                      # Section landing (redirects to inventory-balance)
+-- inventory-balance/            # Current stock balances
|   +-- page.tsx
|   +-- types.ts
|   +-- utils.ts
|   +-- components/
+-- stock-cards/                  # Product inventory cards
|   +-- page.tsx
+-- slow-moving/                  # Slow moving analysis
|   +-- page.tsx
+-- inventory-aging/              # Aging and expiry
    +-- page.tsx
```

---

## Documentation Index

| Document | Description | Link |
|----------|-------------|------|
| **Business Requirements** | Functional requirements and business objectives | [BR-stock-overview.md](./BR-stock-overview.md) |
| **Use Cases** | User interaction scenarios | [UC-stock-overview.md](./UC-stock-overview.md) |
| **Technical Specification** | Architecture and implementation details | [TS-stock-overview.md](./TS-stock-overview.md) |
| **Data Dictionary** | Database schema and data structures | [DD-stock-overview.md](./DD-stock-overview.md) |
| **Flow Diagrams** | Visual process flows | [FD-stock-overview.md](./FD-stock-overview.md) |
| **Validation Rules** | Data validation and business rules | [VAL-stock-overview.md](./VAL-stock-overview.md) |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Inventory Transactions](../transactions/INDEX-inventory-transactions.md) | Transaction source data |
| [Inventory Adjustments](../inventory-adjustments) | Stock adjustment source |
| [Period End](../period-end) | Period closing integration |
| [Spot Check](../spot-check) | Physical count verification |
| [Store Requisitions](../../store-operations/store-requisitions) | Issue transaction source |
| [Stock Transfers](../../store-operations/stock-transfers) | Transfer audit view |

---

## Quick Start

### Viewing Inventory Overview
1. Navigate to **Inventory Management > Stock Overview**
2. System redirects to Inventory Balance view
3. Review summary metrics cards
4. Browse inventory by location/category/product

### Checking Stock Levels
1. Go to **Stock Overview > Inventory Balance**
2. Filter by location or category as needed
3. Expand location nodes to see category breakdown
4. Expand categories to view product details

### Monitoring Product Inventory
1. Go to **Stock Overview > Stock Cards**
2. Use list, cards, or grouped view mode
3. Filter by category or status
4. Click product to see location distribution

### Identifying Slow Moving Items
1. Go to **Stock Overview > Slow Moving**
2. Review risk level distribution
3. Filter by risk level (Low/Medium/High/Critical)
4. Take action (Transfer/Promote/Writeoff/Hold)

### Tracking Inventory Age
1. Go to **Stock Overview > Inventory Aging**
2. Review age bucket distribution
3. Check expiry status indicators
4. Prioritize items expiring soon

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds |
| Filter Response | < 500ms |
| Chart Render | < 1 second |
| Export Generation | < 5 seconds |
| Data Refresh | < 1 second |

---

## Dependencies

### Internal
- User Context (`lib/context/simple-user-context`)
- Mock Data (`lib/mock-data/location-inventory.ts`)
- Type Definitions (`lib/types`)

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
| 1.0 | 2026-01-15 | Initial release with all sub-sections |
