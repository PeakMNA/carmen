# Data Definition: Physical Count Management

**Module**: Inventory Management
**Sub-Module**: Physical Count Management
**Version**: 1.0.0
**Status**: IMPLEMENTED (Prototype with Mock Data)
**Last Updated**: 2025-12-09

---

## 1. Overview

This document defines TypeScript interfaces and data structures for the Physical Count Management module.

---

## 2. Type Definitions

### 2.1 Enum Types

```typescript
// Physical count types
type PhysicalCountType = 'full' | 'cycle' | 'annual' | 'perpetual' | 'partial';

// Physical count lifecycle statuses
type PhysicalCountStatus = 
  | 'draft'       // Initial creation, not yet activated
  | 'planning'    // Being configured and assigned
  | 'pending'     // Ready to start, awaiting counter
  | 'in-progress' // Counting actively happening
  | 'completed'   // All items counted, pending finalization
  | 'finalized'   // Adjustments posted, count closed
  | 'cancelled'   // Terminated before completion
  | 'on-hold';    // Temporarily paused

// Individual item count statuses
type PhysicalCountItemStatus = 
  | 'pending'   // Not yet counted
  | 'counted'   // Counted, no variance
  | 'variance'  // Counted with discrepancy
  | 'approved'  // Variance approved
  | 'skipped'   // Intentionally skipped
  | 'recount';  // Marked for recounting

// Reasons for inventory variance
type VarianceReason = 
  | 'damage'           // Physical damage to items
  | 'theft'            // Suspected theft
  | 'spoilage'         // Perishable item spoilage
  | 'measurement-error'// Counting mistake
  | 'system-error'     // System quantity incorrect
  | 'receiving-error'  // Error at goods receipt
  | 'issue-error'      // Error at stock issue
  | 'unknown'          // Cannot determine cause
  | 'other';           // Other documented reason

// Priority levels
type Priority = 'low' | 'medium' | 'high' | 'critical';

// Team member roles
type CounterRole = 'primary' | 'secondary' | 'verifier';
```

---

### 2.2 Counting Interface Types

```typescript
// Filter state for counting interface
type CountingFilter = 'all' | 'pending' | 'counted';

// Unit conversion types for calculator
type WeightUnit = 'kg' | 'g' | 'lb';
type VolumeUnit = 'L' | 'ml';
type CountUnit = 'pcs' | 'dozen' | 'case';

// Calculator state
interface CalculatorState {
  unitType: 'weight' | 'volume' | 'count';
  values: Record<string, number>;
  total: number;
  caseSize: number; // For count conversions
}

// User context for blind count mode
interface UserCountingPreferences {
  showSystemQuantity: boolean; // When false, enables "blind count" mode
}
```

---

### 2.3 Core Interfaces

#### PhysicalCount

```typescript
interface PhysicalCount {
  // Identification
  id: string;
  countNumber: string;           // Format: PC-YYMMDD-XXXX
  
  // Type and Status
  type: PhysicalCountType;
  status: PhysicalCountStatus;
  priority: Priority;
  
  // Location Assignment
  locationId: string;
  locationName: string;
  departmentId?: string;
  departmentName?: string;
  zoneId?: string;
  zoneName?: string;
  
  // Personnel
  supervisorId: string;
  supervisorName: string;
  team: CountTeamMember[];
  
  // Scheduling
  scheduledDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  finalizedAt?: Date;
  dueDate: Date;
  
  // Configuration
  approvalThreshold: number;     // Percentage (e.g., 5 = 5%)
  
  // Items and Progress
  items: PhysicalCountItem[];
  totalItems: number;
  countedItems: number;
  varianceItems: number;
  approvedItems: number;
  
  // Metrics
  accuracy: number;              // Percentage
  totalSystemValue: number;
  totalCountedValue: number;
  totalVarianceValue: number;
  
  // Documentation
  description?: string;
  instructions?: string;
  notes?: string;
  cancellationReason?: string;
  
  // Audit
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  history: CountHistoryEntry[];
}
```

#### PhysicalCountItem

```typescript
interface PhysicalCountItem {
  // Identification
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  
  // Classification
  category: string;
  subcategory?: string;
  unit: string;
  
  // Location
  locationCode: string;
  binLocation?: string;
  
  // Quantities
  systemQuantity: number;
  countedQuantity?: number;
  variance?: number;             // countedQuantity - systemQuantity
  variancePercent?: number;      // (variance / systemQuantity) * 100
  
  // First Count / Recount
  firstCountQuantity?: number;
  recountQuantity?: number;
  
  // Status and Reason
  status: PhysicalCountItemStatus;
  varianceReason?: VarianceReason;
  skipReason?: string;
  
  // Valuation
  unitCost: number;
  systemValue: number;           // systemQuantity * unitCost
  countedValue?: number;         // countedQuantity * unitCost
  varianceValue?: number;        // variance * unitCost
  
  // Counter Information
  countedBy?: string;
  countedByName?: string;
  countedAt?: Date;
  
  // Notes
  notes?: string;
  
  // Reference
  lastCountDate?: Date;
  lastVariance?: number;
}
```

#### CountTeamMember

```typescript
interface CountTeamMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: CounterRole;
  assignedAt: Date;
  itemsAssigned?: number;
  itemsCounted?: number;
}
```

#### CountHistoryEntry

```typescript
interface CountHistoryEntry {
  id: string;
  action: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
  performedBy: string;
  performedByName: string;
  performedAt: Date;
}
```

---

### 2.4 Form and Input Interfaces

#### CreateCountForm

```typescript
interface CreateCountForm {
  // Step 1: Type
  type: PhysicalCountType;
  priority: Priority;
  approvalThreshold: number;
  
  // Step 2: Assignment
  locationId: string;
  departmentId?: string;
  zoneId?: string;
  supervisorId: string;
  team: {
    userId: string;
    role: CounterRole;
  }[];
  scheduledDate: Date;
  dueDate: Date;
  
  // Step 3: Scope
  selectedCategories?: string[];
  selectedItems?: string[];
  includeAllItems?: boolean;
  
  // Step 4: Details
  description?: string;
  instructions?: string;
  notes?: string;
}
```

#### CountItemUpdate

```typescript
interface CountItemUpdate {
  countedQuantity: number;
  varianceReason?: VarianceReason;
  notes?: string;
}
```

#### FilterState

```typescript
interface FilterState {
  status: PhysicalCountStatus | 'all';
  type: PhysicalCountType | 'all';
  location: string;
  department: string;
  supervisor: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  priority: Priority | 'all';
  hasVariance: boolean | null;
}
```

---

### 2.5 Dashboard Interfaces

#### DashboardKPIs

```typescript
interface DashboardKPIs {
  totalCounts: number;
  averageAccuracy: number;
  itemsCounted: number;
  pendingApproval: number;
  totalVariance: number;
}
```

#### CountTypeStats

```typescript
interface CountTypeStats {
  type: PhysicalCountType;
  count: number;
  avgAccuracy: number;
}
```

#### LocationStats

```typescript
interface LocationStats {
  locationId: string;
  locationName: string;
  countCount: number;
  avgAccuracy: number;
  lastCount: Date;
}
```

---

### 2.6 Display Configuration

#### StatusConfig

```typescript
interface StatusConfig {
  label: string;
  color: string;           // Tailwind color class
  icon: string;            // Lucide icon name
  description: string;
}

const statusConfig: Record<PhysicalCountStatus, StatusConfig> = {
  draft: {
    label: 'Draft',
    color: 'bg-slate-100 text-slate-700',
    icon: 'FileEdit',
    description: 'Count being configured'
  },
  planning: {
    label: 'Planning',
    color: 'bg-purple-100 text-purple-700',
    icon: 'ClipboardList',
    description: 'Assigning team and scope'
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700',
    icon: 'Clock',
    description: 'Ready to start'
  },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-700',
    icon: 'Play',
    description: 'Counting in progress'
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-100 text-emerald-700',
    icon: 'CheckCircle',
    description: 'Counting finished'
  },
  finalized: {
    label: 'Finalized',
    color: 'bg-green-100 text-green-700',
    icon: 'CheckCircle2',
    description: 'Adjustments posted'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700',
    icon: 'XCircle',
    description: 'Count terminated'
  },
  'on-hold': {
    label: 'On Hold',
    color: 'bg-orange-100 text-orange-700',
    icon: 'Pause',
    description: 'Temporarily paused'
  }
};
```

#### TypeConfig

```typescript
interface TypeConfig {
  label: string;
  description: string;
  icon: string;
  scopeMethod: 'all' | 'category' | 'manual';
}

const typeConfig: Record<PhysicalCountType, TypeConfig> = {
  full: {
    label: 'Full Physical Count',
    description: 'Complete count of all inventory items at a location',
    icon: 'Package',
    scopeMethod: 'all'
  },
  cycle: {
    label: 'Cycle Count',
    description: 'Regular scheduled count of specific categories',
    icon: 'RefreshCw',
    scopeMethod: 'category'
  },
  annual: {
    label: 'Annual Count',
    description: 'Year-end comprehensive inventory count',
    icon: 'Calendar',
    scopeMethod: 'all'
  },
  perpetual: {
    label: 'Perpetual Inventory',
    description: 'Continuous counting of selected items',
    icon: 'Infinity',
    scopeMethod: 'manual'
  },
  partial: {
    label: 'Partial Count',
    description: 'Count of specific items or locations',
    icon: 'LayoutGrid',
    scopeMethod: 'category'
  }
};
```

---

## 3. Mock Data Structure

### 3.1 Mock Data File Location

```
lib/mock-data/physical-counts.ts
```

### 3.2 Export Structure

```typescript
// Main data exports
export const mockPhysicalCounts: PhysicalCount[];
export const mockCountItems: PhysicalCountItem[];
export const mockCountHistory: CountHistoryEntry[];

// Helper functions
export function getPhysicalCountById(id: string): PhysicalCount | undefined;
export function getCountItemsByCountId(countId: string): PhysicalCountItem[];
export function getCountHistoryByCountId(countId: string): CountHistoryEntry[];

// Dashboard data functions
export function getDashboardKPIs(dateRange: string): DashboardKPIs;
export function getOverdueCounts(): PhysicalCount[];
export function getPendingApprovalCounts(): PhysicalCount[];
export function getActiveCounts(): PhysicalCount[];
export function getRecentFinalizedCounts(): PhysicalCount[];
export function getUpcomingCounts(): PhysicalCount[];
export function getStatsByType(): CountTypeStats[];
export function getStatsByLocation(): LocationStats[];

// Count number generation
export function generateCountNumber(): string;
```

---

## 4. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-06 | System | Initial documentation |
| 1.0.1 | 2025-12-09 | System | Added counting interface types (CountingFilter, Calculator types, UserCountingPreferences for blind count mode) |
