# Data Definition: Spot Check

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Spot Check
- **Route**: `/app/(main)/inventory-management/spot-check`
- **Version**: 2.1.0
- **Last Updated**: 2025-12-09
- **Owner**: Inventory Management Team
- **Status**: Implemented

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version (planned database design) |
| 2.0.0 | 2025-12-06 | System | Updated to reflect actual TypeScript implementation |
| 2.1.0 | 2025-12-09 | System | Updated for 2-step wizard, revised SelectionMethod, added Zustand store types |

---

## Overview

This document defines the data structures for the Spot Check sub-module as currently implemented in the prototype.

**Current Implementation**: The prototype uses TypeScript interfaces with mock data. No database integration exists yet.

**Data Layer Architecture**:
- **Types**: Defined in `app/(main)/inventory-management/spot-check/types.ts`
- **Mock Data**: Defined in `lib/mock-data/spot-checks.ts`
- **State Management**: React useState/useMemo hooks + Zustand (`useCountStore`)
- **Form Validation**: React Hook Form + Zod schemas

**Related Documents**:
- [Business Requirements](./BR-spot-check.md)
- [Use Cases](./UC-spot-check.md)
- [Technical Specification](./TS-spot-check.md)
- [Flow Diagrams](./FD-spot-check.md)
- [Validations](./VAL-spot-check.md)

---

## Type Definitions

### Core Enums and Types

#### SpotCheckType

**Purpose**: Defines the category of spot check being performed.

```typescript
type SpotCheckType = 'random' | 'targeted' | 'high-value' | 'variance-based' | 'cycle-count';
```

| Value | Description | Use Case |
|-------|-------------|----------|
| `random` | System-selected random sample | Routine verification |
| `targeted` | Specific items of interest | Investigation |
| `high-value` | Expensive items focus | Risk management |
| `variance-based` | Items with historical variance | Problem resolution |
| `cycle-count` | Part of regular counting cycle | Scheduled maintenance |

#### SpotCheckStatus

**Purpose**: Tracks the lifecycle state of a spot check session.

```typescript
type SpotCheckStatus = 'draft' | 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
```

| Value | Description | Transitions From | Transitions To |
|-------|-------------|------------------|----------------|
| `draft` | Initial creation state | - | pending |
| `pending` | Ready to start | draft | in-progress, cancelled |
| `in-progress` | Active counting | pending, on-hold | completed, on-hold, cancelled |
| `on-hold` | Temporarily paused | in-progress | in-progress, cancelled |
| `completed` | Finished (final) | in-progress | - |
| `cancelled` | Terminated (final) | pending, in-progress, on-hold | - |

#### ItemCheckStatus

**Purpose**: Tracks the status of individual item counts within a spot check.

```typescript
type ItemCheckStatus = 'pending' | 'counted' | 'variance' | 'skipped';
```

| Value | Description |
|-------|-------------|
| `pending` | Awaiting count |
| `counted` | Count entered, no variance |
| `variance` | Count entered, variance detected |
| `skipped` | Item skipped with reason |

#### ItemCondition

**Purpose**: Records the physical condition of counted items.

```typescript
type ItemCondition = 'good' | 'damaged' | 'expired' | 'missing';
```

| Value | Description | Impact |
|-------|-------------|--------|
| `good` | Normal condition | No additional action |
| `damaged` | Physical damage detected | May require write-off |
| `expired` | Past expiration date | Requires removal |
| `missing` | Cannot be located | Full variance |

#### Priority

**Purpose**: Indicates urgency level of spot check.

```typescript
type Priority = 'low' | 'medium' | 'high' | 'critical';
```

| Value | Visual | Description |
|-------|--------|-------------|
| `low` | Gray badge | Routine check |
| `medium` | Blue badge | Standard priority |
| `high` | Orange badge | Urgent attention |
| `critical` | Red badge | Immediate action |

#### SelectionMethod

**Purpose**: Defines how items are selected for the spot check in the 2-step creation wizard.

```typescript
type SelectionMethod = 'random' | 'high-value' | 'manual';
```

| Value | Description | Use Case |
|-------|-------------|----------|
| `random` | System generates random selection | Routine verification, unbiased sampling |
| `high-value` | Automatically selects highest-value items | Risk management, high-cost items |
| `manual` | User selects individual items | Targeted investigation, specific concerns |

---

## Entity Interfaces

### SpotCheck Interface

**Purpose**: Represents a complete spot check session with all metadata and items.

**Location**: `app/(main)/inventory-management/spot-check/types.ts`

```typescript
interface SpotCheck {
  // Identification
  id: string;
  checkNumber: string;                    // Format: SC-YYMMDD-XXXX
  checkType: SpotCheckType;
  status: SpotCheckStatus;
  priority: Priority;

  // Location
  locationId: string;
  locationName: string;
  departmentId: string;
  departmentName: string;

  // Assignment
  assignedTo: string;
  assignedToName: string;
  scheduledDate: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  dueDate: Date | null;

  // Items
  items: SpotCheckItem[];
  totalItems: number;
  countedItems: number;
  matchedItems: number;
  varianceItems: number;

  // Metrics
  accuracy: number;                       // Percentage 0-100
  totalValue: number;                     // Currency value
  varianceValue: number;                  // Currency value

  // Details
  reason: string;
  notes: string;

  // Audit
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (UUID format) |
| `checkNumber` | string | Yes | Business reference number |
| `checkType` | SpotCheckType | Yes | Category of spot check |
| `status` | SpotCheckStatus | Yes | Current lifecycle state |
| `priority` | Priority | Yes | Urgency level |
| `locationId` | string | Yes | Reference to location |
| `locationName` | string | Yes | Display name of location |
| `departmentId` | string | No | Reference to department |
| `departmentName` | string | No | Display name of department |
| `assignedTo` | string | Yes | User ID of assignee |
| `assignedToName` | string | Yes | Display name of assignee |
| `scheduledDate` | Date | Yes | When check is scheduled |
| `startedAt` | Date | null | No | When counting began |
| `completedAt` | Date | null | No | When check was completed |
| `dueDate` | Date | null | No | Due date for completion |
| `items` | SpotCheckItem[] | Yes | Array of items to check |
| `totalItems` | number | Yes | Total count of items |
| `countedItems` | number | Yes | Count of completed items |
| `matchedItems` | number | Yes | Items with zero variance |
| `varianceItems` | number | Yes | Items with variance |
| `accuracy` | number | Yes | Percentage accuracy (0-100) |
| `totalValue` | number | Yes | Total monetary value |
| `varianceValue` | number | Yes | Total variance value |
| `reason` | string | No | Reason for spot check |
| `notes` | string | No | Additional notes |
| `createdBy` | string | Yes | User who created |
| `createdAt` | Date | Yes | Creation timestamp |
| `updatedAt` | Date | Yes | Last update timestamp |

### SpotCheckItem Interface

**Purpose**: Represents an individual product line item within a spot check.

```typescript
interface SpotCheckItem {
  // Identification
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  unit: string;
  location: string;

  // Quantities
  systemQuantity: number;
  countedQuantity: number | null;
  variance: number;
  variancePercent: number;

  // Status
  condition: ItemCondition;
  status: ItemCheckStatus;

  // Tracking
  countedBy: string | null;
  countedAt: Date | null;
  notes: string;

  // Value
  value: number;
  lastCountDate: Date | null;
}
```

#### Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `itemId` | string | Yes | Reference to product |
| `itemCode` | string | Yes | Product SKU/code |
| `itemName` | string | Yes | Product display name |
| `category` | string | Yes | Product category |
| `unit` | string | Yes | Unit of measure |
| `location` | string | Yes | Storage location |
| `systemQuantity` | number | Yes | Expected quantity |
| `countedQuantity` | number | null | No | Actual counted quantity |
| `variance` | number | Yes | Quantity difference |
| `variancePercent` | number | Yes | Percentage difference |
| `condition` | ItemCondition | Yes | Physical condition |
| `status` | ItemCheckStatus | Yes | Counting status |
| `countedBy` | string | null | No | Who performed count |
| `countedAt` | Date | null | No | When counted |
| `notes` | string | No | Item-specific notes |
| `value` | number | Yes | Monetary value |
| `lastCountDate` | Date | null | No | Previous count date |

### SpotCheckFormData Interface

**Purpose**: Form data structure for creating new spot checks via the 2-step wizard.

```typescript
interface SpotCheckFormData {
  // Step 1 - Location Selection
  locationId: string;
  departmentId: string;
  assignedTo: string;
  scheduledDate: Date;

  // Step 2 - Method & Items
  selectionMethod: SelectionMethod;   // 'random' | 'high-value' | 'manual'
  itemCount: number;                  // 10 | 20 | 50
  selectedItems: string[];            // Item IDs for manual selection
}
```

#### Field Specifications

| Field | Type | Required | Default | Step | Description |
|-------|------|----------|---------|------|-------------|
| `locationId` | string | Yes | - | 1 | Target location |
| `departmentId` | string | No | '' | 1 | Target department (optional) |
| `assignedTo` | string | Yes | - | 1 | Assigned staff |
| `scheduledDate` | Date | Yes | Today | 1 | Scheduled date |
| `selectionMethod` | SelectionMethod | Yes | 'random' | 2 | How items are selected |
| `itemCount` | number | Yes | 20 | 2 | Number of items (10, 20, or 50) |
| `selectedItems` | string[] | Conditional | [] | 2 | Item IDs when method is 'manual' |

#### Item Count Options

```typescript
const ITEM_COUNT_OPTIONS = [10, 20, 50] as const;
```

| Option | Description |
|--------|-------------|
| 10 | Quick spot check, minimal items |
| 20 | Standard spot check (default) |
| 50 | Comprehensive spot check |

### CountStore Interface (Zustand)

**Purpose**: Manages active spot checks state across the application using Zustand.

**Location**: Used in `app/(main)/inventory-management/spot-check/active/page.tsx`

```typescript
interface CountStore {
  // State
  activeCounts: SpotCheck[];

  // Actions
  addCount: (count: SpotCheck) => void;
  updateCount: (id: string, updates: Partial<SpotCheck>) => void;
  removeCount: (id: string) => void;
}
```

#### Store Fields

| Field | Type | Description |
|-------|------|-------------|
| `activeCounts` | SpotCheck[] | Array of active (pending, in-progress, on-hold) spot checks |
| `addCount` | function | Add a new spot check to active counts |
| `updateCount` | function | Update an existing spot check by ID |
| `removeCount` | function | Remove a spot check from active counts (on completion/cancellation) |

#### Usage Example

```typescript
// In active/page.tsx
import { useCountStore } from '@/lib/stores/count-store';

function ActiveSpotChecksPage() {
  const activeCounts = useCountStore((state) => state.activeCounts);
  const updateCount = useCountStore((state) => state.updateCount);

  // Filter and display active counts
  const pendingCounts = activeCounts.filter(c => c.status === 'pending');
  const inProgressCounts = activeCounts.filter(c => c.status === 'in-progress');

  return (/* ... */);
}
```

---

## Mock Data Structure

### mockSpotChecks Array

**Location**: `lib/mock-data/spot-checks.ts`

**Purpose**: Provides sample data for prototype development and testing.

```typescript
export const mockSpotChecks: SpotCheck[] = [
  {
    id: 'sc-001',
    checkNumber: 'SC-251206-0001',
    checkType: 'random',
    status: 'completed',
    priority: 'medium',
    // ... complete record
  },
  // ... more records
];
```

### Helper Functions

**Purpose**: Provide data access patterns for the mock data layer.

```typescript
// Get summary counts by status
export function getSpotCheckSummary(): StatusSummary;

// Get single spot check by ID
export function getSpotCheckById(id: string): SpotCheck | undefined;

// Filter spot checks by status
export function getSpotChecksByStatus(status: SpotCheckStatus): SpotCheck[];

// Get active (pending + in-progress) spot checks
export function getActiveSpotChecks(): SpotCheck[];

// Get overdue spot checks
export function getOverdueSpotChecks(): SpotCheck[];

// Get dashboard statistics
export function getSpotCheckDashboardStats(): DashboardStats;
```

---

## Calculated Fields

### Variance Calculation

**Purpose**: Determine discrepancy between expected and actual quantities.

```typescript
// Variance quantity (can be negative or positive)
variance = countedQuantity - systemQuantity;

// Variance percentage (relative to system quantity)
if (systemQuantity > 0) {
  variancePercent = (variance / systemQuantity) * 100;
} else if (countedQuantity > 0) {
  variancePercent = 100; // System shows 0, found some
} else {
  variancePercent = 0; // Both zero
}
```

### Accuracy Calculation

**Purpose**: Determine overall accuracy of the spot check.

```typescript
// Matched items = items with zero variance
accuracy = (matchedItems / totalItems) * 100;
```

### Status Counts

**Purpose**: Aggregate counts for dashboard display.

```typescript
interface StatusSummary {
  all: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  onHold: number;
}
```

---

## Data Validation Rules

### Required Field Rules

| Entity | Field | Rule |
|--------|-------|------|
| SpotCheck | id | Non-empty string |
| SpotCheck | checkNumber | Format: SC-YYMMDD-XXXX |
| SpotCheck | checkType | Valid SpotCheckType enum |
| SpotCheck | status | Valid SpotCheckStatus enum |
| SpotCheck | locationId | Non-empty string |
| SpotCheck | assignedTo | Non-empty string |
| SpotCheck | scheduledDate | Valid Date |
| SpotCheckItem | id | Non-empty string |
| SpotCheckItem | itemId | Non-empty string |
| SpotCheckItem | systemQuantity | >= 0 |

### Business Rules

| Rule | Description |
|------|-------------|
| BR-DD-001 | countedQuantity must be >= 0 when provided |
| BR-DD-002 | variance = countedQuantity - systemQuantity |
| BR-DD-003 | variancePercent calculated from variance/systemQuantity |
| BR-DD-004 | completedAt only set when status = 'completed' |
| BR-DD-005 | startedAt set when status transitions to 'in-progress' |
| BR-DD-006 | items array cannot be empty for non-draft spot checks |
| BR-DD-007 | countedItems <= totalItems |
| BR-DD-008 | matchedItems + varianceItems = countedItems |

---

## Data Relationships

### Entity Relationship Diagram

```
┌─────────────────┐       1:N        ┌──────────────────┐
│   SpotCheck     │─────────────────▶│  SpotCheckItem   │
├─────────────────┤                  ├──────────────────┤
│ id              │                  │ id               │
│ checkNumber     │                  │ itemId           │
│ checkType       │                  │ itemCode         │
│ status          │                  │ itemName         │
│ priority        │                  │ category         │
│ locationId      │◀─ ─ ─ ─ ─ ─ ─ ─ ─│ location         │
│ departmentId    │                  │ systemQuantity   │
│ assignedTo      │                  │ countedQuantity  │
│ items[]─────────│──────────────────│ variance         │
│ ...             │                  │ variancePercent  │
└─────────────────┘                  │ condition        │
                                     │ status           │
                                     │ ...              │
                                     └──────────────────┘
```

### Reference Data (External)

| Reference | Description | Used In |
|-----------|-------------|---------|
| Location | Store/warehouse locations | SpotCheck.locationId |
| Department | Organizational units | SpotCheck.departmentId |
| User | System users | SpotCheck.assignedTo, createdBy |
| Product | Inventory items | SpotCheckItem.itemId |

---

## Sample Data

### Example Spot Check Session

```typescript
const exampleSpotCheck: SpotCheck = {
  id: 'sc-001',
  checkNumber: 'SC-251206-0001',
  checkType: 'high-value',
  status: 'completed',
  priority: 'high',

  locationId: 'loc-001',
  locationName: 'Main Kitchen',
  departmentId: 'dept-001',
  departmentName: 'Kitchen Operations',

  assignedTo: 'user-001',
  assignedToName: 'John Smith',
  scheduledDate: new Date('2025-12-06'),
  startedAt: new Date('2025-12-06T09:00:00'),
  completedAt: new Date('2025-12-06T09:45:00'),
  dueDate: new Date('2025-12-06'),

  items: [/* array of SpotCheckItem */],
  totalItems: 5,
  countedItems: 5,
  matchedItems: 4,
  varianceItems: 1,

  accuracy: 80,
  totalValue: 1500.00,
  varianceValue: -75.00,

  reason: 'Daily high-value protein verification',
  notes: 'Found expired chicken breast, removed from inventory',

  createdBy: 'user-001',
  createdAt: new Date('2025-12-06T08:55:00'),
  updatedAt: new Date('2025-12-06T09:45:00'),
};
```

### Example Spot Check Item

```typescript
const exampleItem: SpotCheckItem = {
  id: 'item-001',
  itemId: 'prod-001',
  itemCode: 'MEAT-CHKN-001',
  itemName: 'Chicken Breast, Boneless, Skinless',
  category: 'Meat & Poultry',
  unit: 'kg',
  location: 'Cooler A, Shelf 2',

  systemQuantity: 100.00,
  countedQuantity: 95.00,
  variance: -5.00,
  variancePercent: -5.00,

  condition: 'expired',
  status: 'variance',

  countedBy: 'user-001',
  countedAt: new Date('2025-12-06T09:15:00'),
  notes: 'Found 5kg expired, removed from inventory',

  value: 1500.00,
  lastCountDate: new Date('2025-12-01'),
};
```

---

## Future Database Design

### Planned Database Tables

When database integration is implemented, the following schema is planned:

**tb_spot_check** (Spot Check Sessions)
- Primary key: `id` (UUID)
- Business key: `check_number` (unique)
- Foreign keys: `location_id`, `department_id`, `assigned_to`, `created_by`
- Status tracking with workflow support
- JSON field for extensible metadata

**tb_spot_check_item** (Spot Check Items)
- Primary key: `id` (UUID)
- Foreign key: `spot_check_id`
- Product reference: `product_id`
- Quantity fields: `system_qty`, `counted_qty`, `variance_qty`, `variance_pct`
- Audit fields: `counted_by`, `counted_at`

### Migration Path

1. Create Prisma schema matching TypeScript interfaces
2. Generate database migrations
3. Implement server actions for CRUD operations
4. Replace mock data helpers with database queries
5. Add real-time synchronization

---

## Glossary

| Term | Definition |
|------|------------|
| Spot Check | Targeted inventory verification of selected products |
| Check Type | Classification of spot check purpose |
| System Quantity | Expected quantity from inventory system |
| Counted Quantity | Physical count performed during verification |
| Variance | Difference between system and counted quantities |
| Item Condition | Physical state of item during count |
| Selection Method | How items are chosen for spot check (random, high-value, manual) |
| Check Number | Business reference number (SC-YYMMDD-XXXX) |
| Accuracy | Percentage of items with matching counts |
| Variance Value | Monetary impact of quantity discrepancies |
| Active Count | Spot check with pending, in-progress, or on-hold status |
| Count Store | Zustand store managing active spot check state |
| Item Count | Number of items to include in a spot check (10, 20, or 50) |

---

**Document End**
