# POS Integration Module

## Overview

The **POS Integration** module enables real-time synchronization between Point-of-Sale systems (primarily Comanche POS) and Carmen ERP for automatic inventory deduction, sales tracking, and consumption analysis. It supports multi-outlet configurations with outlet-specific pricing and comprehensive analytics.

---

## Module Information

| Property | Value |
|----------|-------|
| **Module** | System Administration > System Integrations |
| **Sub-module** | POS Integration |
| **Route** | `/system-administration/system-integration/pos` |
| **Version** | 1.0 |
| **Status** | Active |

---

## Key Features

### Dashboard Monitoring
- Real-time POS system connection status
- Alert cards for unmapped items, pending approvals, failed transactions
- Transaction statistics with period filtering
- Recent activity feed and sync schedule display

### Recipe Mapping
- Map POS menu items to Carmen recipes
- Outlet-specific pricing support (same item, different prices per outlet)
- Portion size and unit configuration
- Bulk sync of POS items

### Location Mapping
- Link Carmen locations to POS outlets
- Sync status monitoring per location
- Transaction routing configuration

### Fractional Variants
- Configure fractional sales (pizza slices, cake portions)
- Yield and deduction percentage settings
- Configurable rounding rules (up, down, nearest)

### Transaction Processing
- Approval queue for pending transactions
- Bulk approval support for efficiency
- Failed transaction retry mechanism
- Comprehensive transaction history with filtering

### Configuration Management
- POS system connection settings
- Sync frequency configuration (5/15/30/60 minutes)
- Processing modes: Automatic, Approval, Manual
- Email notification settings
- Data retention policies

### Analytics & Reports
- Gross Profit Analysis by category
- Consumption Analysis (theoretical vs actual)
- Variance Report with cost impact
- Export to CSV/PDF/Excel

---

## Tabs

| Tab | URL Param | Description |
|-----|-----------|-------------|
| Dashboard | `?tab=dashboard` | Overview, metrics, and alerts |
| Mapping | `?tab=mapping` | Recipe, location, and fractional mappings |
| Transactions | `?tab=transactions` | Transaction processing and approval |
| Configuration | `?tab=config` | Integration settings |
| Reports | `?tab=reports` | Analytics and reporting |

---

## Transaction Status Types

| Status | Label | Color | Description |
|--------|-------|-------|-------------|
| `pending_approval` | Pending | Amber | Awaiting manager approval |
| `approved` | Approved | Blue | Approved, ready for processing |
| `rejected` | Rejected | Gray | Rejected by manager |
| `processing` | Processing | Blue | Currently being processed |
| `success` | Success | Green | Successfully processed |
| `failed` | Failed | Red | Processing failed |
| `manually_resolved` | Resolved | Purple | Manually resolved by user |

---

## Processing Modes

| Mode | Description |
|------|-------------|
| `automatic` | Auto-approve and process immediately |
| `approval` | Require manager approval (with optional auto-approve threshold) |
| `manual` | Manual processing only |

---

## User Roles & Permissions

| Role | Dashboard | Mapping | Transactions | Config | Reports |
|------|-----------|---------|--------------|--------|---------|
| F&B Manager | ✅ View | ✅ View | ✅ Approve/Reject | ❌ | ✅ View/Export |
| Purchasing Manager | ✅ View | ✅ Full CRUD | ✅ View | ❌ | ✅ View |
| Head Chef | ✅ View | ✅ Variants | ✅ View | ❌ | ✅ View |
| IT Administrator | ✅ View | ✅ Full CRUD | ✅ Full | ✅ Full | ✅ View |
| Financial Controller | ✅ View | ❌ | ✅ View | ❌ | ✅ Full |

---

## Technical Architecture

```
app/(main)/system-administration/system-integration/pos/
├── page.tsx                           # Main page with tabs
└── components/
    ├── index.ts                       # Component exports
    ├── pos-dashboard.tsx              # Dashboard tab
    ├── pos-mapping-tab.tsx            # Mapping tab (recipe/location/fractional)
    ├── pos-transactions-tab.tsx       # Transaction processing tab
    ├── pos-config-tab.tsx             # Configuration tab
    └── pos-reports-tab.tsx            # Reports tab
```

---

## Documentation Index

| Document | Description | Link |
|----------|-------------|------|
| **Business Requirements** | Functional requirements and user stories | [BR-pos-integration.md](./BR-pos-integration.md) |
| **Use Cases** | User interaction scenarios | [UC-pos-integration.md](./UC-pos-integration.md) |
| **Data Dictionary** | Type definitions and data structures | [DD-pos-integration.md](./DD-pos-integration.md) |
| **Technical Specification** | Architecture and implementation | [TS-pos-integration.md](./TS-pos-integration.md) |
| **Flow Diagrams** | Visual process flows | [FD-pos-integration.md](./FD-pos-integration.md) |
| **Validation Rules** | Data validation and business rules | [VAL-pos-integration.md](./VAL-pos-integration.md) |

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Recipes](/docs/app/operational-planning/recipe-management/recipes) | Recipe definitions for POS mapping |
| [Location Management](/docs/app/system-administration/location-management) | Locations for outlet mapping |
| [Inventory Transactions](/docs/app/inventory-management/transactions) | Transaction records from POS |
| [Stock Overview](/docs/app/inventory-management/stock-overview) | Stock levels affected by deductions |

---

## Quick Start

### Configuring POS Connection
1. Navigate to **System Integrations > POS Integration > Configuration**
2. Select POS system type (Comanche or Custom)
3. Enter API endpoint URL
4. Click **Test Connection** to verify
5. Configure sync settings and save

### Mapping Recipes
1. Go to **Mapping > Recipe Mapping** tab
2. Click **Sync Items** to fetch POS menu items
3. Click unmapped item badge to open mapping dialog
4. Select outlet, recipe, portion size, and unit
5. Save mapping

### Processing Transactions
1. Navigate to **Transactions** tab
2. Review transactions in Approval Queue
3. Select transaction and click **Approve** or **Reject**
4. For bulk operations, select multiple and click **Approve Selected**

### Viewing Reports
1. Go to **Reports** tab
2. Select report type (Gross Profit, Consumption, Variance)
3. Choose time period filter
4. Click **Export** to download data

---

## Supported POS Systems

| System | Status | Notes |
|--------|--------|-------|
| Comanche POS | ✅ Active | Primary integration |
| Custom/Other | ✅ Active | Via custom API endpoint |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 2 seconds |
| Sync Operation | < 30 seconds |
| Transaction Processing | < 5 seconds |
| Report Generation | < 10 seconds |

---

## Dependencies

### Internal
- User Context (`lib/context/simple-user-context`)
- Type Definitions (`lib/types/pos-integration`)
- Mock Data (`lib/mock-data/pos-integration`)

### External Libraries
| Library | Purpose |
|---------|---------|
| date-fns | Date formatting and manipulation |
| lucide-react | Icons |
| shadcn/ui | UI components |
| recharts | Report charts (if used) |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-18 | Initial release with full feature set |
