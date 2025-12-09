# Spot Check Documentation

**Module**: Inventory Management
**Sub-Module**: Spot Check
**Status**: IMPLEMENTED (Prototype with Mock Data)
**Version**: 2.1.0
**Last Updated**: 2025-12-09

---

## Quick Links

| Document | Description | Status |
|----------|-------------|--------|
| [Business Requirements](./BR-spot-check.md) | Business rules, workflows, and functional requirements | ✅ Complete |
| [Use Cases](./UC-spot-check.md) | User workflows and actor interactions | ✅ Complete |
| [Technical Specification](./TS-spot-check.md) | System architecture and implementation details | ✅ Complete |
| [Data Definition](./DD-spot-check.md) | TypeScript interfaces and data structures | ✅ Complete |
| [Flow Diagrams](./FD-spot-check.md) | Visual workflow diagrams (Mermaid) | ✅ Complete |
| [Validations](./VAL-spot-check.md) | Validation rules and Zod schemas | ✅ Complete |

---

## Overview

The **Spot Check** module enables quick, targeted verification of inventory quantities for selected items at any location. Unlike full physical counts that verify all inventory, spot checks focus on specific products or categories that require immediate verification, such as high-value items, fast-moving products, or items with suspected discrepancies.

**Key Capabilities**:
- ✅ **Multiple Check Types**: Random, targeted, high-value, variance-based, and cycle-count
- ✅ **Dashboard Analytics**: KPIs, active checks, overdue alerts, and performance metrics
- ✅ **2-Step Creation Wizard**: Location Selection → Method & Items
- ✅ **Selection Methods**: Random, High-Value, or Manual item selection
- ✅ **Item Count Options**: 10, 20, or 50 items per check
- ✅ **Active Spot Checks Page**: Zustand-based state management for in-progress checks
- ✅ **Completed Spot Checks Page**: Historical view with time-based filtering
- ✅ **Flexible Counting**: Single-item mode and list-view modes
- ✅ **Status Management**: Full lifecycle with pause, resume, and cancellation
- ✅ **Real-time Variance**: Automatic calculation with visual indicators
- ✅ **Item Conditions**: Track good, damaged, expired, or missing items

---

## Implementation Status

**Current State**: IMPLEMENTED - Prototype Complete with Mock Data

**What EXISTS**:
- ✅ Dashboard page (`dashboard/page.tsx`) - KPIs, active checks, overdue alerts
- ✅ Main list page (`page.tsx`) - Filtering, sorting, status tabs
- ✅ Creation wizard (`new/page.tsx`) - 2-step flow (Location → Method & Items)
- ✅ Active checks page (`active/page.tsx`) - Zustand-based state management
- ✅ Completed checks page (`completed/page.tsx`) - Historical view with time filters
- ✅ Detail page (`[id]/page.tsx`) - Tabbed view (Overview, Items, Variances, History)
- ✅ Counting interface (`[id]/count/page.tsx`) - Single-item and list modes
- ✅ TypeScript types (`types.ts`) - Complete type definitions
- ✅ Mock data layer (`lib/mock-data/spot-checks.ts`) - Sample data and helpers

**What's PENDING (Future Implementation)**:
- ❌ Database integration (Prisma/PostgreSQL)
- ❌ Server actions for data mutations
- ❌ Real-time variance posting to inventory
- ❌ Supervisor approval workflow for high-variance items
- ❌ Export functionality (CSV/Excel)
- ❌ Spot check templates
- ❌ Barcode scanner integration
- ❌ Offline capability

---

## Business Context

### Problem Statement
Inventory management requires continuous verification beyond scheduled physical counts:
- **Variance Detection**: Discrepancies need immediate attention, not monthly discovery
- **Risk Management**: High-value items require frequent verification
- **Operational Impact**: Full counts disrupt operations; targeted checks don't
- **Loss Prevention**: Quick verification catches theft or process errors early
- **Compliance**: Auditors expect evidence of ongoing inventory controls

### Solution Benefits
- **Rapid Verification**: Complete spot checks in 15-30 minutes vs. hours for full counts
- **Targeted Focus**: Concentrate effort on items that matter most
- **Minimal Disruption**: Verify inventory without stopping operations
- **Early Detection**: Catch issues when they're small and correctable
- **Audit Evidence**: Documented verification history for compliance

---

## Core Workflows

### 1. Create Spot Check (2-Step Wizard)
**Owner**: Inventory Coordinators, Storekeepers
**Route**: `/inventory-management/spot-check/new`

**Step 1 - Location Selection**:
| Field | Required | Description |
|-------|----------|-------------|
| Location | Yes | Target location for spot check |
| Department | No | Specific department (optional) |
| Assigned To | Yes | Staff member responsible |
| Scheduled Date | Yes | When to perform the check |

**Step 2 - Method & Items**:
| Selection Method | Description | Item Count |
|------------------|-------------|------------|
| Random | System generates random selection | 10 / 20 / 50 |
| High-Value | Automatically selects highest-value items | 10 / 20 / 50 |
| Manual | User selects individual items | User-defined |

[→ View Detailed Workflow](./UC-spot-check.md#uc-sc-003-create-new-spot-check-wizard)

---

### 2. Perform Counting
**Owner**: Storekeepers, Inventory Staff
**Route**: `/inventory-management/spot-check/[id]/count`

**Counting Modes**:

| Mode | Description | Best For |
|------|-------------|----------|
| Single Item | Focus on one item at a time | Careful verification |
| List Mode | View all items in scrollable list | Quick data entry |

**For Each Item**:
1. View item details (code, name, location, system quantity)
2. Enter counted quantity (number input or +/- buttons)
3. Select condition (good, damaged, expired, missing)
4. Add notes if needed
5. See real-time variance preview
6. Navigate to next item or skip with reason

**Variance Indicators**:
- 🟢 Green: Match (0% variance)
- 🟡 Yellow: Minor variance (<5%)
- 🔴 Red: Significant variance (≥5%)

[→ View Counting Interface](./UC-spot-check.md#uc-sc-003-perform-spot-check-counting)

---

### 3. Status Management
**Owner**: Inventory Coordinators, Supervisors

**Status Transitions**:
```
draft → pending → in-progress → completed
                      ↓   ↑
                   on-hold

Any (except completed) → cancelled
```

| Action | From Status | To Status | Description |
|--------|-------------|-----------|-------------|
| Start | pending | in-progress | Begin counting, record start time |
| Pause | in-progress | on-hold | Temporarily suspend, preserve progress |
| Resume | on-hold | in-progress | Continue counting |
| Complete | in-progress | completed | Finish check (all items counted) |
| Cancel | any | cancelled | Terminate with reason |

[→ View Status Diagram](./FD-spot-check.md#spot-check-status-transitions)

---

### 4. View Dashboard & Analytics
**Owner**: Inventory Managers, Supervisors
**Route**: `/inventory-management/spot-check/dashboard`

**KPI Cards**:
- Total checks (this month)
- Average accuracy percentage
- Total items counted
- Total variance value

**Dashboard Sections**:
- Overdue checks alert
- Active checks with progress
- Recently completed checks
- Upcoming scheduled checks
- Stats by check type
- Stats by location

[→ View Dashboard Details](./BR-spot-check.md#fr-sc-001-dashboard-and-overview)

---

## Data Model

### Core Entities

**SpotCheck**: Main spot check session
- Identification: id, checkNumber (SC-YYMMDD-XXXX), checkType, status, priority
- Location: locationId, locationName, departmentId, departmentName
- Assignment: assignedTo, scheduledDate, startedAt, completedAt, dueDate
- Items: items[], totalItems, countedItems, matchedItems, varianceItems
- Metrics: accuracy, totalValue, varianceValue
- Details: reason, notes, createdBy, createdAt, updatedAt

**SpotCheckItem**: Individual product line item
- Identification: id, itemId, itemCode, itemName, category, unit, location
- Quantities: systemQuantity, countedQuantity, variance, variancePercent
- Status: condition (good/damaged/expired/missing), status (pending/counted/variance/skipped)
- Tracking: countedBy, countedAt, notes, value, lastCountDate

[→ View Complete Schema](./DD-spot-check.md)

---

## Type Definitions

```typescript
// Check Types
type SpotCheckType = 'random' | 'targeted' | 'high-value' | 'variance-based' | 'cycle-count';

// Status Types
type SpotCheckStatus = 'draft' | 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
type ItemCheckStatus = 'pending' | 'counted' | 'variance' | 'skipped';

// Selection Methods (2-step wizard)
type SelectionMethod = 'random' | 'high-value' | 'manual';

// Item Count Options
const ITEM_COUNT_OPTIONS = [10, 20, 50] as const;

// Item Conditions
type ItemCondition = 'good' | 'damaged' | 'expired' | 'missing';

// Priority Levels
type Priority = 'low' | 'medium' | 'high' | 'critical';
```

---

## File Structure

```
app/(main)/inventory-management/spot-check/
├── page.tsx                    # Main list page
├── types.ts                    # TypeScript type definitions
├── new/
│   └── page.tsx               # 2-step creation wizard
├── dashboard/
│   └── page.tsx               # Dashboard with KPIs
├── active/
│   └── page.tsx               # Active spot checks (Zustand state)
├── completed/
│   └── page.tsx               # Completed spot checks with time filters
└── [id]/
    ├── page.tsx               # Detail view with tabs
    └── count/
        └── page.tsx           # Counting interface

lib/mock-data/
└── spot-checks.ts             # Mock data and helper functions
```

---

## Validation Rules

### Form Validations (2-Step Wizard)
**Step 1 - Location Selection**:
- Location: Required, non-empty string
- Assigned To: Required, non-empty string
- Scheduled date: Required, valid date

**Step 2 - Method & Items**:
- Selection method: Required, must be `'random' | 'high-value' | 'manual'`
- Item count: Required for random/high-value (must be 10, 20, or 50)
- Selected items: Required for manual selection (at least 1 item)

### Business Rules
- Counted quantity must be >= 0
- Skipped items require a reason
- Cannot complete with uncounted items (unless skipped)
- Completed status is final (no further modifications)
- Cancelled checks preserve all entered data

[→ View Complete Validation Rules](./VAL-spot-check.md)

---

## Security & Permissions

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Storekeeper** | Create spot checks, perform counting, view own checks |
| **Inventory Coordinator** | All storekeeper permissions, assign checks, view all location checks |
| **Supervisor** | All coordinator permissions, approve high-variance items, cancel checks |
| **Inventory Manager** | Full access, configure settings, view analytics across all locations |

---

## Related Documentation

### Within Inventory Management
- [Physical Count Management](../physical-count-management/) - Full inventory counts
- [Stock Overview](../stock-overview/) - Current stock levels and reports
- [Inventory Adjustments](../adjustments/) - Quantity corrections

### Other Modules
- [Product Management](../../product-management/) - Product catalog
- [Location Management](../../system-administration/locations/) - Location setup

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial documentation (planned design) |
| 2.0.0 | 2025-12-06 | System | Updated to reflect implemented prototype |
| 2.1.0 | 2025-12-09 | System | Updated for 2-step wizard, active/completed pages, Zustand state |

---

**Document Control**:
- **Created**: 2025-12-06
- **Author**: Development Team
- **Status**: Active
- **Next Review**: 2026-01-09

---

> **Note**: This is the central navigation hub for Spot Check documentation. Select a document from the Quick Links table above to dive into specific details.
