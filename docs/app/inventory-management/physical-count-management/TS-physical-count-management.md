# Technical Specification: Physical Count Management

**Module**: Inventory Management
**Sub-Module**: Physical Count Management
**Version**: 1.0.0
**Status**: IMPLEMENTED (Prototype with Mock Data)
**Last Updated**: 2025-12-09

---

## 1. Overview

This document provides technical specifications for the Physical Count Management module, a Next.js 14 App Router implementation with mock data.

---

## 2. Architecture

### 2.1 Technology Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (Strict Mode) |
| Styling | Tailwind CSS + Shadcn/ui |
| State Management | React useState/useMemo |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

### 2.2 File Structure

```
app/(main)/inventory-management/physical-count-management/
├── page.tsx                    # Main list page (filtering, sorting, views)
├── types.ts                    # TypeScript type definitions
├── new/
│   └── page.tsx               # 4-step creation wizard
├── dashboard/
│   └── page.tsx               # KPI dashboard and analytics
└── [id]/
    ├── page.tsx               # Detail view with 5 tabs
    └── count/
        └── page.tsx           # Counting interface

lib/mock-data/
└── physical-counts.ts         # Mock data and helper functions
```

---

## 3. Component Specifications

### 3.1 Dashboard Page (`dashboard/page.tsx`)

**Route**: `/inventory-management/physical-count-management/dashboard`
**Lines**: ~767

**Key Features**:
- 5 KPI Cards: Total Counts, Avg Accuracy, Items Counted, Pending Approval, Total Variance
- Overdue Counts Alert Section with "Start Now" action
- Pending Approval Section
- Active Counts with Progress Bars
- Recently Finalized Counts
- Quick Action Buttons
- Upcoming Scheduled Counts
- Statistics by Count Type
- Statistics by Location
- Date Range Filter (7d, 30d, 90d, 365d)

**State Management**:
```typescript
const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '365d'>('30d');
```

**Mock Data Functions**:
- `getKPIData(dateRange)` - Returns calculated KPIs
- `getOverdueCounts()` - Returns counts past due date
- `getPendingApprovalCounts()` - Returns counts needing approval
- `getActiveCounts()` - Returns in-progress counts
- `getRecentFinalizedCounts()` - Returns recently finalized
- `getUpcomingCounts()` - Returns scheduled counts
- `getStatsByType()` - Aggregates by count type
- `getStatsByLocation()` - Aggregates by location

---

### 3.2 List Page (`page.tsx`)

**Route**: `/inventory-management/physical-count-management`
**Lines**: ~600+

**Key Features**:
- Table and Grid View Toggle
- Status Summary Cards (8 statuses)
- Multi-field Filtering
- Search by count number, location, supervisor
- Column Sorting
- Progress Indicators

**Filter State**:
```typescript
interface FilterState {
  status: PhysicalCountStatus | 'all';
  type: PhysicalCountType | 'all';
  location: string;
  department: string;
  supervisor: string;
  dateRange: { start: Date | null; end: Date | null };
  priority: Priority | 'all';
  hasVariance: boolean | null;
}
```

**Sorting Configuration**:
```typescript
interface SortConfig {
  field: keyof PhysicalCount;
  direction: 'asc' | 'desc';
}
```

---

### 3.3 Create Wizard (`new/page.tsx`)

**Route**: `/inventory-management/physical-count-management/new`
**Lines**: ~800+

**Wizard Steps**:
1. **Count Type Selection**: Type, Priority, Approval Threshold
2. **Assignment**: Location, Department, Zone, Supervisor, Team, Dates
3. **Scope Selection**: Category/Item selection based on type
4. **Review & Confirm**: Summary, Instructions, Notes

**Form Schema** (Zod):
```typescript
const createCountSchema = z.object({
  type: z.enum(['full', 'cycle', 'annual', 'perpetual', 'partial']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  approvalThreshold: z.number().min(0).max(100),
  locationId: z.string().min(1, 'Location is required'),
  departmentId: z.string().optional(),
  zoneId: z.string().optional(),
  supervisorId: z.string().min(1, 'Supervisor is required'),
  scheduledDate: z.date(),
  dueDate: z.date(),
  team: z.array(z.object({
    userId: z.string(),
    role: z.enum(['primary', 'secondary', 'verifier'])
  })),
  selectedCategories: z.array(z.string()),
  selectedItems: z.array(z.string()),
  description: z.string().optional(),
  instructions: z.string().optional(),
  notes: z.string().optional()
});
```

**State Management**:
```typescript
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState<Partial<CreateCountForm>>({});
```

---

### 3.4 Detail Page (`[id]/page.tsx`)

**Route**: `/inventory-management/physical-count-management/[id]`
**Lines**: ~1356

**Tab Structure**:
1. **Overview Tab**: Count metadata, dates, instructions, notes
2. **Items Tab**: Full item list with filtering, status badges
3. **Variance Tab**: Items with discrepancies, value impact, reasons
4. **Team Tab**: Supervisor info, counter list with roles
5. **History Tab**: Activity timeline with timestamps

**Progress Bar Breakdown**:
```typescript
interface ProgressBreakdown {
  approved: number;
  counted: number;
  variance: number;
  recount: number;
  pending: number;
}
```

**Status Actions**:
```typescript
const statusActions: Record<PhysicalCountStatus, StatusAction[]> = {
  draft: [{ label: 'Activate', nextStatus: 'planning' }],
  planning: [{ label: 'Approve Plan', nextStatus: 'pending' }],
  pending: [{ label: 'Start Count', nextStatus: 'in-progress' }],
  'in-progress': [
    { label: 'Put On Hold', nextStatus: 'on-hold' },
    { label: 'Complete', nextStatus: 'completed' }
  ],
  'on-hold': [{ label: 'Resume', nextStatus: 'in-progress' }],
  completed: [{ label: 'Finalize & Post', nextStatus: 'finalized' }],
  finalized: [],
  cancelled: []
};
```

**Dialogs**:
- Cancel Count Dialog (with reason)
- Finalize Count Confirmation Dialog

---

### 3.5 Counting Interface (`[id]/count/page.tsx`)

**Route**: `/inventory-management/physical-count-management/[id]/count`
**Lines**: ~1296

**Design Pattern**: Mobile-first card-based UI optimized for tablet and mobile counting

**Key Components**:

1. **ItemCountCard**: Individual item counting card
   - Item details (code, name, location)
   - System quantity display (toggleable via blind count mode)
   - Quantity input with +/- increment buttons
   - Real-time variance preview
   - Calculator button for unit conversion
   - Notes button to open NotesSheet

2. **NotesSheet**: Bottom sheet for notes & evidence
   - Variance reason selector
   - Free-text notes input
   - Photo attachment button
   - File attachment button

3. **CalculatorDialog**: Unit conversion calculator
   - Weight conversion: kg, g, lb
   - Volume conversion: L, ml
   - Count conversion: pcs, dozen, case (configurable sizes)
   - "Use Total" button to apply calculated value

**State Management**:
```typescript
// Filter state
const [filter, setFilter] = useState<'all' | 'pending' | 'counted'>('all');
const [searchTerm, setSearchTerm] = useState('');

// Notes sheet state
const [notesSheetOpen, setNotesSheetOpen] = useState(false);
const [currentNotesItem, setCurrentNotesItem] = useState<PhysicalCountItem | null>(null);

// Calculator state
const [calculatorOpen, setCalculatorOpen] = useState(false);
const [calculatorItem, setCalculatorItem] = useState<PhysicalCountItem | null>(null);

// Blind count mode from user context
const showSystemQuantity = user?.context?.showSystemQuantity ?? true;
```

**Key Features**:
- **Filter Tabs**: All, Pending, Counted status filters
- **Search**: Search by item code or name
- **Blind Count Mode**: `showSystemQuantity` user preference toggles system quantity visibility
- **Save for Resume**: Save progress and navigate to detail page
- **Reset All Counts**: Clear all counts with confirmation dialog

**Variance Calculation**:
```typescript
const variance = countedQuantity - systemQuantity;
const variancePercent = systemQuantity > 0
  ? (variance / systemQuantity) * 100
  : 0;
```

**Unit Conversion (Calculator)**:
```typescript
// Weight conversions
const weightConversions = {
  kg: 1,
  g: 0.001,
  lb: 0.453592
};

// Volume conversions
const volumeConversions = {
  L: 1,
  ml: 0.001
};

// Count conversions (configurable)
const countConversions = {
  pcs: 1,
  dozen: 12,
  case: caseSize // user-defined
};
```

---

## 4. API Integration Points (Future)

### 4.1 Planned Server Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| `createPhysicalCount` | Create new count | CreateCountForm |
| `updateCountStatus` | Transition status | countId, newStatus, reason? |
| `saveCountItem` | Save item count | countId, itemId, CountItemUpdate |
| `skipCountItem` | Skip with reason | countId, itemId, reason |
| `approveVariance` | Approve variance | countId, itemId |
| `requestRecount` | Mark for recount | countId, itemId |
| `finalizeCount` | Post adjustments | countId |
| `cancelCount` | Cancel with reason | countId, reason |

### 4.2 Database Schema (Planned)

```sql
-- Physical Counts
CREATE TABLE physical_counts (
  id UUID PRIMARY KEY,
  count_number VARCHAR(20) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  location_id UUID REFERENCES locations(id),
  department_id UUID REFERENCES departments(id),
  supervisor_id UUID REFERENCES users(id),
  scheduled_date TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  finalized_at TIMESTAMP,
  due_date TIMESTAMP,
  approval_threshold DECIMAL(5,2) DEFAULT 5.00,
  description TEXT,
  instructions TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Count Items
CREATE TABLE physical_count_items (
  id UUID PRIMARY KEY,
  count_id UUID REFERENCES physical_counts(id),
  item_id UUID REFERENCES inventory_items(id),
  system_quantity DECIMAL(12,3) NOT NULL,
  counted_quantity DECIMAL(12,3),
  variance DECIMAL(12,3) GENERATED ALWAYS AS (counted_quantity - system_quantity),
  variance_reason VARCHAR(30),
  status VARCHAR(20) DEFAULT 'pending',
  counted_by UUID REFERENCES users(id),
  counted_at TIMESTAMP,
  notes TEXT
);

-- Count Team Members
CREATE TABLE physical_count_team (
  id UUID PRIMARY KEY,
  count_id UUID REFERENCES physical_counts(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(20) NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW()
);

-- Count History
CREATE TABLE physical_count_history (
  id UUID PRIMARY KEY,
  count_id UUID REFERENCES physical_counts(id),
  action VARCHAR(50) NOT NULL,
  details JSONB,
  performed_by UUID REFERENCES users(id),
  performed_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Performance Considerations

### 5.1 Client-Side Optimization
- `useMemo` for filtered/sorted lists
- Virtualization for large item lists (planned)
- Debounced search input
- Optimistic UI updates

### 5.2 Data Loading Strategy
- Server Components for initial load
- Client Components for interactive features
- Streaming for dashboard KPIs (planned)

---

## 6. Security Considerations

### 6.1 Access Control
- Role-based permissions per operation
- Location-based data filtering
- Supervisor-only actions for approvals

### 6.2 Audit Trail
- All status changes logged with user and timestamp
- Item count changes tracked
- Cancellation reasons preserved

---

## 7. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-06 | System | Initial documentation |
| 1.0.1 | 2025-12-09 | System | Updated counting interface section with mobile-first design, ItemCountCard, NotesSheet, CalculatorDialog components |
