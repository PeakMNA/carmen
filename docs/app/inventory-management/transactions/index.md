# Inventory Transactions Module

## Overview
The Inventory Transactions module provides a unified view of all inventory movements across hotel locations. It consolidates transactions from multiple sources (GRN, Stock Transfers, Stock Issues, Adjustments, Write-offs, Physical Counts) into a single, filterable interface with analytics capabilities.

## Module Path
`/inventory-management/transactions`

## Documentation

| Document | Description |
|----------|-------------|
| [BR-inventory-transactions.md](./BR-inventory-transactions.md) | Business Requirements |
| [UC-inventory-transactions.md](./UC-inventory-transactions.md) | Use Cases |
| [TS-inventory-transactions.md](./TS-inventory-transactions.md) | Technical Specification |
| [DD-inventory-transactions.md](./DD-inventory-transactions.md) | Data Definition |
| [FD-inventory-transactions.md](./FD-inventory-transactions.md) | Flow Diagrams |
| [VAL-inventory-transactions.md](./VAL-inventory-transactions.md) | Validation Rules |

## Key Features
- View all inventory movements in one place
- Filter by date range, transaction type, reference type, location, category
- Search across product name, code, reference, location, category, user
- Sort by date, reference, product, location, quantities, value
- Export filtered data to CSV
- Analytics dashboard with 5 charts
- Location-based access control

## Transaction Types
| Type | Label | Description |
|------|-------|-------------|
| IN | Inbound | Stock entering location |
| OUT | Outbound | Stock leaving location |

## Reference Types
| Code | Description |
|------|-------------|
| GRN | Goods Received Note |
| SO | Sales Order |
| ADJ | Adjustment |
| ST | Stock Transfer |
| SI | Stock Issue |
| WO | Write Off |
| PC | Physical Count |
| WR | Wastage Report |

## Version
- Current Version: 2.0.0
- Last Updated: 2025-01-16
