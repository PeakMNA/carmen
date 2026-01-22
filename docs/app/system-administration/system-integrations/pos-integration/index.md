# POS Integration

Real-time synchronization between Point-of-Sale systems and Carmen ERP for automatic inventory deduction and sales analytics.

---

## Quick Navigation

| | | |
|:---:|:---:|:---:|
| [**BR**](/system-administration/system-integrations/pos-integration/business-requirements)<br/>Business Requirements | [**UC**](/system-administration/system-integrations/pos-integration/use-cases)<br/>Use Cases | [**TS**](/system-administration/system-integrations/pos-integration/technical-specification)<br/>Technical Spec |
| [**DD**](/system-administration/system-integrations/pos-integration/data-dictionary)<br/>Data Dictionary | [**FD**](/system-administration/system-integrations/pos-integration/flow-diagrams)<br/>Flow Diagrams | [**VAL**](/system-administration/system-integrations/pos-integration/validations)<br/>Validations |

---

## Documents

| Document | Description |
|----------|-------------|
| [BR-pos-integration](./BR-pos-integration.md) | Business Requirements |
| [UC-pos-integration](./UC-pos-integration.md) | Use Cases |
| [DD-pos-integration](./DD-pos-integration.md) | Data Dictionary |
| [TS-pos-integration](./TS-pos-integration.md) | Technical Specification |
| [FD-pos-integration](./FD-pos-integration.md) | Flow Diagrams |
| [VAL-pos-integration](./VAL-pos-integration.md) | Validation Rules |

## Features

### Dashboard
- System connection status monitoring
- Alert cards (unmapped items, pending approvals, failed transactions)
- Transaction statistics and recent activity
- Sync schedule display

### Recipe Mapping
- Map POS menu items to Carmen recipes
- Outlet-specific pricing support
- Portion size and unit configuration
- Unmapped items tracking

### Location Mapping
- Link Carmen locations to POS outlets
- Sync status monitoring
- Transaction routing configuration

### Fractional Variants
- Configure fractional sales (slices, glasses, portions)
- Yield and deduction percentage settings
- Rounding rule configuration

### Transaction Processing
- Approval queue for pending transactions
- Bulk approval support
- Failed transaction retry
- Transaction history with filtering

### Configuration
- POS system connection settings
- Sync frequency configuration
- Processing mode (automatic/approval/manual)
- Email notification settings
- Data retention policies

### Reports
- Gross Profit Analysis by category
- Consumption Analysis (theoretical vs actual)
- Variance Report with cost impact
- Export to CSV/PDF/Excel

## Tabs

| Tab | URL Param | Description |
|-----|-----------|-------------|
| Dashboard | ?tab=dashboard | Overview and metrics |
| Mapping | ?tab=mapping | Recipe, location, variant mappings |
| Transactions | ?tab=transactions | Transaction processing |
| Configuration | ?tab=config | Integration settings |
| Reports | ?tab=reports | Analytics and reports |

## Route

`/system-administration/system-integration/pos`

## Supported POS Systems

- Comanche POS (primary)
- Custom/Other (via API)
