# Transaction Categories Module

## Overview
The Transaction Categories module provides a two-level classification system (Category → Reason) for inventory adjustments. Categories map to GL accounts for financial reporting, while reasons provide detailed classification within each category for operational analysis.

## Module Path
`/inventory-management/transaction-categories`

## Documentation

| Document | Description |
|----------|-------------|
| [BR-transaction-categories.md](./BR-transaction-categories.md) | Business Requirements |
| [UC-transaction-categories.md](./UC-transaction-categories.md) | Use Cases |
| [TS-transaction-categories.md](./TS-transaction-categories.md) | Technical Specification |
| [DD-transaction-categories.md](./DD-transaction-categories.md) | Data Definition |
| [FD-transaction-categories.md](./FD-transaction-categories.md) | Flow Diagrams |
| [VAL-transaction-categories.md](./VAL-transaction-categories.md) | Validation Rules |

## Key Features
- Two-level classification: Category (header) → Reason (item)
- GL Account mapping for journal entries
- Type-specific categories (Stock IN, Stock OUT)
- Active/Inactive status management
- Configurable sort order

## Category Types
| Type | Label | Description |
|------|-------|-------------|
| IN | Stock In | Increases inventory (Found, Return, Correction) |
| OUT | Stock Out | Decreases inventory (Wastage, Loss, Quality, Consumption) |

## Default GL Mappings
| Category | Type | GL Code | GL Name |
|----------|------|---------|---------|
| Wastage | OUT | 5200 | Waste Expense |
| Loss | OUT | 5210 | Inventory Loss |
| Quality | OUT | 5100 | Cost of Goods Sold |
| Consumption | OUT | 5100 | Cost of Goods Sold |
| Found | IN | 1310 | Raw Materials Inventory |
| Return | IN | 1310 | Raw Materials Inventory |
| Correction | IN | 1310 | Raw Materials Inventory |

## Version
- Current Version: 1.0.0
- Last Updated: 2025-01-16
