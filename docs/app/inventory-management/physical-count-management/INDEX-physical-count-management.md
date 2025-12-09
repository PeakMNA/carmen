# Physical Count Management Documentation

**Module**: Inventory Management
**Sub-Module**: Physical Count Management
**Status**: IMPLEMENTED (Prototype with Mock Data)
**Last Updated**: 2025-12-09

---

## Quick Links

| Document | Description | Status |
|----------|-------------|--------|
| [Business Requirements](./BR-physical-count-management.md) | Business rules, workflows, and functional requirements | ✅ Complete |
| [Use Cases](./UC-physical-count-management.md) | User workflows and actor interactions | ✅ Complete |
| [Technical Specification](./TS-physical-count-management.md) | System architecture and implementation details | ✅ Complete |
| [Data Definition](./DD-physical-count-management.md) | TypeScript interfaces and data structures | ✅ Complete |
| [Flow Diagrams](./FD-physical-count-management.md) | Visual workflow diagrams (Mermaid) | ✅ Complete |
| [Validations](./VAL-physical-count-management.md) | Validation rules and Zod schemas | ✅ Complete |

---

## Overview

The **Physical Count Management** module enables comprehensive inventory verification through scheduled and ad-hoc physical counts. It supports multiple count types with complete lifecycle management from planning through finalization and inventory adjustment posting.

**Key Capabilities**:
- ✅ **5 Count Types**: Full, Cycle, Annual, Perpetual, Partial
- ✅ **8 Status Lifecycle**: Draft → Planning → Pending → In-Progress → Completed → Finalized (+ On-Hold, Cancelled)
- ✅ **Dashboard Analytics**: KPIs, overdue alerts, active counts, statistics
- ✅ **4-Step Creation Wizard**: Type → Assignment → Scope → Review
- ✅ **Mobile-First Counting Interface**: Card-based UI optimized for tablet/mobile counting
- ✅ **Unit Calculator**: Multi-unit conversion (kg/g/lb, L/ml, pcs/dozen/case)
- ✅ **Notes & Evidence**: Variance reasons, photo/file attachments
- ✅ **Blind Count Mode**: Toggle system quantity visibility for independent verification
- ✅ **Variance Management**: Automatic calculation, reasons, approvals
- ✅ **Recount Support**: First count / recount workflow
- ✅ **Team Management**: Supervisor and counter assignments with roles

---

## Implementation Status

**Current State**: IMPLEMENTED - Prototype Complete with Mock Data

**What EXISTS**:
- ✅ Dashboard page (`dashboard/page.tsx`) - KPIs, overdue alerts, active counts
- ✅ Main list page (`page.tsx`) - Filtering, sorting, status tabs
- ✅ Creation wizard (`new/page.tsx`) - 4-step flow with validation
- ✅ Detail page (`[id]/page.tsx`) - 5 tabs (Overview, Items, Variance, Team, History)
- ✅ Counting interface (`[id]/count/page.tsx`) - Single-item and list modes
- ✅ TypeScript types (`types.ts`) - Complete type definitions
- ✅ Mock data layer (`lib/mock-data/physical-counts.ts`) - Sample data and helpers

**What's PENDING (Future Implementation)**:
- ❌ Database integration (Prisma/PostgreSQL)
- ❌ Server actions for data mutations
- ❌ Real-time variance posting to inventory
- ❌ Supervisor approval workflow integration
- ❌ Export functionality (CSV/Excel)
- ❌ Barcode scanner integration
- ❌ Offline capability
- ❌ Email notifications

---

## Business Context

### Problem Statement
Inventory management requires regular verification to ensure accuracy:
- **Compliance**: Financial audits require documented inventory counts
- **Shrinkage Detection**: Identify theft, damage, and spoilage
- **System Accuracy**: Reconcile system quantities with physical stock
- **Operational Efficiency**: Maintain optimal stock levels

### Solution Benefits
- **Structured Process**: Guided wizard ensures consistent count setup
- **Complete Lifecycle**: Track counts from planning to finalization
- **Variance Analysis**: Understand reasons for discrepancies
- **Audit Trail**: Full history of all count activities
- **Team Coordination**: Assign and track counter responsibilities

---

## Core Workflows

### 1. Create Physical Count (4-Step Wizard)
**Owner**: Inventory Coordinators, Supervisors
**Route**: `/inventory-management/physical-count-management/new`

| Step | Description | Key Fields |
|------|-------------|------------|
| 1. Type | Select count type and priority | Type, Priority, Approval Threshold |
| 2. Assignment | Assign location, supervisor, team | Location, Supervisor, Team, Dates |
| 3. Scope | Select items to count | Categories, Items (varies by type) |
| 4. Review | Confirm and create | Instructions, Notes |

[→ View Detailed Workflow](./UC-physical-count-management.md#uc-pcm-003-create-physical-count-wizard)

---

### 2. Perform Counting
**Owner**: Counters, Storekeepers
**Route**: `/inventory-management/physical-count-management/[id]/count`

**Mobile-First Card Interface**:
- Item cards with quantity input (+/- buttons)
- Filter tabs: All, Pending, Counted
- Search by item code or name
- Real-time variance calculation

**Key Features**:
| Feature | Description | Usage |
|---------|-------------|-------|
| Unit Calculator | Convert kg/g/lb, L/ml, pcs/dozen/case | Multi-unit items |
| Notes & Evidence | Variance reason, photo, file attachments | Documentation |
| Blind Count Mode | Hide system quantities | Independent verification |
| Save for Resume | Exit and continue later | Long counts |
| Reset All Counts | Clear all entered values | Start over |

**For Each Item**:
1. View item details (code, name, location, system quantity if visible)
2. Enter counted quantity (use calculator for unit conversion if needed)
3. Open Notes sheet for variance reason and evidence
4. Navigate to next item or filter by status

[→ View Counting Interface](./UC-physical-count-management.md#uc-pcm-005-perform-physical-counting)

---

### 3. Status Management
**Owner**: Supervisors, Managers
**Route**: `/inventory-management/physical-count-management/[id]`

**Status Transitions**:
```
draft → planning → pending → in-progress → completed → finalized
                                ↓   ↑
                             on-hold

Any (except finalized) → cancelled
```

[→ View Status Diagram](./FD-physical-count-management.md#2-physical-count-status-lifecycle)

---

### 4. View Dashboard
**Owner**: Inventory Managers, Supervisors
**Route**: `/inventory-management/physical-count-management/dashboard`

**KPI Cards**:
- Total Counts
- Average Accuracy
- Items Counted
- Pending Approval
- Total Variance

**Dashboard Sections**:
- Overdue counts alert with "Start Now" action
- Active counts with progress bars
- Recently finalized counts
- Upcoming scheduled counts
- Statistics by count type
- Statistics by location

[→ View Dashboard Details](./BR-physical-count-management.md#fr-pcm-001-dashboard-and-kpis)

---

## Data Model

### Core Entities

**PhysicalCount**: Main count session
- Identification: id, countNumber (PC-YYMMDD-XXXX), type, status, priority
- Location: locationId, locationName, departmentId, departmentName
- Personnel: supervisorId, supervisorName, team[]
- Scheduling: scheduledDate, startedAt, completedAt, finalizedAt, dueDate
- Items: items[], totalItems, countedItems, varianceItems
- Metrics: accuracy, totalSystemValue, totalCountedValue, totalVarianceValue
- Details: description, instructions, notes, cancellationReason

**PhysicalCountItem**: Individual product line item
- Identification: id, itemId, itemCode, itemName, category, unit
- Quantities: systemQuantity, countedQuantity, variance, variancePercent
- Status: status (pending/counted/variance/approved/skipped/recount)
- Tracking: varianceReason, countedBy, countedAt, notes

[→ View Complete Schema](./DD-physical-count-management.md)

---

## Type Definitions

```typescript
type PhysicalCountType = 'full' | 'cycle' | 'annual' | 'perpetual' | 'partial';

type PhysicalCountStatus = 
  | 'draft' | 'planning' | 'pending' | 'in-progress' 
  | 'completed' | 'finalized' | 'cancelled' | 'on-hold';

type PhysicalCountItemStatus = 
  | 'pending' | 'counted' | 'variance' | 'approved' | 'skipped' | 'recount';

type VarianceReason = 
  | 'damage' | 'theft' | 'spoilage' | 'measurement-error' 
  | 'system-error' | 'receiving-error' | 'issue-error' | 'unknown' | 'other';

type Priority = 'low' | 'medium' | 'high' | 'critical';

type CounterRole = 'primary' | 'secondary' | 'verifier';
```

---

## File Structure

```
app/(main)/inventory-management/physical-count-management/
├── page.tsx                    # Main list page
├── types.ts                    # TypeScript type definitions
├── new/
│   └── page.tsx               # 4-step creation wizard
├── dashboard/
│   └── page.tsx               # Dashboard with KPIs
└── [id]/
    ├── page.tsx               # Detail view with 5 tabs
    └── count/
        └── page.tsx           # Counting interface

lib/mock-data/
└── physical-counts.ts         # Mock data and helper functions
```

---

## Validation Rules

### Form Validations (Zod)
- Count type: Required, must be valid enum value
- Location: Required, non-empty string
- Supervisor: Required, non-empty string
- Scheduled date: Required, valid date
- Due date: Required, must be >= scheduled date
- Approval threshold: 0-100 percentage

### Business Rules
- Count number format: PC-YYMMDD-XXXX
- Counted quantity must be >= 0
- Variance reason required when counted ≠ system
- Skipped items require a reason
- Completed status requires all items counted or skipped
- Only completed counts can be finalized
- Finalized counts cannot be modified
- Cancelled counts preserve all data

[→ View Complete Validation Rules](./VAL-physical-count-management.md)

---

## Security & Permissions

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Counter** | View assigned counts, perform counting |
| **Storekeeper** | Create counts, count items, view location counts |
| **Inventory Coordinator** | All storekeeper + assign counts, manage team |
| **Inventory Supervisor** | All coordinator + approve variances, cancel counts |
| **Inventory Manager** | Full access, configure settings, view analytics |
| **Financial Controller** | View counts, finalize and post adjustments |

---

## Related Documentation

### Within Inventory Management
- [Spot Check](../spot-check/) - Quick targeted verification
- [Stock Overview](../stock-overview/) - Current stock levels and reports
- [Inventory Adjustments](../adjustments/) - Quantity corrections

### Other Modules
- [Product Management](../../product-management/) - Product catalog
- [Location Management](../../system-administration/locations/) - Location setup

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-06 | System | Initial documentation |
| 1.0.1 | 2025-12-09 | System | Updated for mobile-first counting interface (calculator, notes sheet, blind count mode, filter tabs) |

---

**Document Control**:
- **Created**: 2025-12-06
- **Author**: Development Team
- **Status**: Active
- **Next Review**: 2026-01-06

---

> **Note**: This is the central navigation hub for Physical Count Management documentation. Select a document from the Quick Links table above to dive into specific details.
