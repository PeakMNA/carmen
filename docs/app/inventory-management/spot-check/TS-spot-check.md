# Technical Specification: Spot Check

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Spot Check
- **Route**: `/app/(main)/inventory-management/spot-check`
- **Version**: 2.1.0
- **Last Updated**: 2025-12-09
- **Owner**: Inventory Management Team
- **Status**: Implemented (Prototype)

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version with database integration design |
| 2.0.0 | 2025-12-06 | System | Updated to reflect actual prototype implementation with mock data |
| 2.1.0 | 2025-12-09 | System | Updated to 2-step wizard, added active/completed pages, Zustand state management |

---

## Overview

The Spot Check sub-module implements a targeted inventory verification system using Next.js 14+ App Router with React client components. The current prototype uses mock data for demonstration and UI development.

**Current Implementation Features**:
- Dashboard with KPIs and analytics
- Streamlined 2-step creation wizard for new spot checks
- List page with filtering, sorting, and status tabs
- Active spot checks management page (with Zustand state)
- Completed spot checks management page
- Detail page with tabbed view (Overview, Items, Variances, History)
- Counting interface with single-item and list modes
- Status management (start, pause, resume, complete, cancel)
- Real-time variance calculation

**Related Documents**:
- [Business Requirements](./BR-spot-check.md)
- [Use Cases](./UC-spot-check.md)
- [Data Definition](./DD-spot-check.md)
- [Flow Diagrams](./FD-spot-check.md)
- [Validations](./VAL-spot-check.md)

---

## Architecture

### Current Architecture (Prototype)

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  React Pages │  │ UI Components│  │  Mock Data   │     │
│  │   (Client)   │  │  (Shadcn/ui) │  │    Layer     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ React State      │ Component Props  │ Static Data
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                 Application Logic                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ React Hooks  │  │Business Logic│  │  Validation  │     │
│  │   (State)    │  │  (Client)    │  │   (Zod)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

**Key Architectural Decisions**:
1. **Client Components**: All pages use 'use client' directive for interactivity
2. **Mock Data**: Static TypeScript data simulates database responses
3. **React State**: useState, useEffect, useMemo for state management
4. **Form Validation**: React Hook Form with Zod schemas
5. **UI Components**: Shadcn/ui with Tailwind CSS

### Future Architecture (With Database)

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  React Pages │  │ UI Components│  │Local Storage │     │
│  │   (RSC)      │  │  (Shadcn/ui) │  │  (Fallback)  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ Server Actions   │ Client State     │ Cache
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                 Application Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Server Actions│  │Business Logic│  │ Validation   │     │
│  │              │  │  & Workflows │  │   Engine     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ Prisma Client    │ API Calls        │ Rules
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │ Inventory    │  │  Audit Log   │     │
│  │   (Prisma)   │  │ Transaction  │  │   System     │     │
│  │              │  │    System    │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend (Current Implementation)
- **Framework**: Next.js 14.2+ with App Router
- **UI Library**: React 18+
- **Language**: TypeScript 5.8+
- **Styling**: Tailwind CSS 3.4+, Shadcn/ui components
- **State Management**:
  - React hooks (useState, useMemo, useCallback) for component state
  - Zustand for active counts state management (`useCountStore`)
- **Form Handling**: React Hook Form 7.50+, Zod 3.22+ (validation)
- **Icons**: Lucide React 0.300+
- **Date Handling**: date-fns 3.0+

### Backend (Future Implementation)
- **Runtime**: Node.js 20.14.0+
- **Framework**: Next.js Server Actions (mutations), API Routes
- **Database**: PostgreSQL 14+ via Supabase
- **ORM**: Prisma 5.8+
- **Authentication**: Supabase Auth with Row-Level Security

### Testing
- **Unit Tests**: Vitest 1.0+
- **E2E Tests**: Playwright 1.40+

---

## Directory Structure

### Current Implementation

```
app/(main)/inventory-management/spot-check/
├── page.tsx                          # Main list page
├── types.ts                          # TypeScript type definitions
├── new/
│   └── page.tsx                      # 2-step creation wizard
├── dashboard/
│   └── page.tsx                      # Dashboard with KPIs
├── active/
│   ├── page.tsx                      # Active spot checks list (Zustand)
│   └── [id]/
│       └── page.tsx                  # Active check detail
├── completed/
│   ├── page.tsx                      # Completed spot checks list
│   └── [id]/
│       └── page.tsx                  # Completed check detail
└── [id]/
    ├── page.tsx                      # Detail view with tabs
    └── count/
        └── page.tsx                  # Counting interface

lib/mock-data/
├── index.ts                          # Barrel export
└── spot-checks.ts                    # Mock spot check data and helpers
```

### Component Files

#### page.tsx (List Page)
**Type**: Client Component ('use client')
**Purpose**: Display filterable list of spot checks with status tabs

**Key Features**:
- Summary cards showing counts by status
- Tab navigation (All, Active, Completed)
- View toggle (List/Grid)
- Filter by status, type, priority, location
- Search functionality
- Sortable data table
- Navigation to detail pages

**State Management**:
- `useState` for filters, search, view mode, sort config
- `useMemo` for filtered and sorted data

#### new/page.tsx (Creation Wizard)
**Type**: Client Component ('use client')
**Purpose**: Streamlined 2-step wizard for creating new spot checks

**Wizard Steps**:
1. **Location Selection**: Select location, department (optional), assigned user, scheduled date
2. **Method & Items**: Choose selection method (random, high-value, manual), item count (10/20/50), preview/select items

**State Management**:
- `useState` for current step (1 or 2), form data, selected items
- Step validation before navigation
- Selection method options: `"random" | "high-value" | "manual"`
- Item count options: `[10, 20, 50]`

#### active/page.tsx (Active Spot Checks)
**Type**: Client Component ('use client')
**Purpose**: Manage active (pending, in-progress, paused) spot checks

**Key Features**:
- Filter tabs: All, Pending, In Progress, Paused
- Quick action buttons: Start Count, Continue Count
- Progress bar visualization
- Overdue indicator for checks past due date

**State Management**:
- Zustand store: `useCountStore((state) => state.activeCounts)`
- Local filter state with `useState`

#### completed/page.tsx (Completed Spot Checks)
**Type**: Client Component ('use client')
**Purpose**: Review completed spot checks with time-based filtering

**Key Features**:
- Summary statistics cards (total, accuracy, items, variance)
- Filter tabs: All, Today, This Week, This Month
- Accuracy color coding (green >95%, yellow 90-95%, red <90%)
- Click-through to detailed view

**State Management**:
- Local mock data (not from centralized mock-data)
- Local filter state with `useState`

#### [id]/page.tsx (Detail Page)
**Type**: Client Component ('use client')
**Purpose**: Display spot check details with tabbed sections

**Tabs**:
- **Overview**: Header info, progress metrics, assignment details
- **Items**: Full item list with counts and conditions
- **Variances**: Items with variance highlighted
- **History**: Activity log

**Actions**:
- Start (pending → in-progress)
- Pause (in-progress → on-hold)
- Resume (on-hold → in-progress)
- Complete (in-progress → completed)
- Cancel (any non-completed → cancelled)
- Count Items (navigate to counting interface)

#### [id]/count/page.tsx (Counting Interface)
**Type**: Client Component ('use client')
**Purpose**: Enter physical counts for items

**Modes**:
- **Single Item Mode**: Focus on one item with large display
- **List Mode**: View all items in scrollable list

**Features**:
- Quantity input with +/- buttons
- Condition selector (good, damaged, expired, missing)
- Notes field
- Real-time variance preview
- Skip item with reason
- Progress indicator
- Navigation between items
- Save and Complete actions

---

## Type System

### Core Types

```typescript
// Check Types
type SpotCheckType = 'random' | 'targeted' | 'high-value' | 'variance-based' | 'cycle-count';

// Status Types
type SpotCheckStatus = 'draft' | 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
type ItemCheckStatus = 'pending' | 'counted' | 'variance' | 'skipped';

// Item Conditions
type ItemCondition = 'good' | 'damaged' | 'expired' | 'missing';

// Priority Levels
type Priority = 'low' | 'medium' | 'high' | 'critical';

// Selection Methods
type SelectionMethod = 'random' | 'high-value' | 'manual';
```

### Main Interfaces

```typescript
interface SpotCheck {
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
  accuracy: number;                       // Percentage
  totalValue: number;
  varianceValue: number;

  // Details
  reason: string;
  notes: string;

  // Audit
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SpotCheckItem {
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

---

## Mock Data Layer

### Data Source

**File**: `lib/mock-data/spot-checks.ts`

**Purpose**: Provide realistic sample data for UI development and testing

**Exported Functions**:
- `mockSpotChecks`: Array of sample spot check records
- `getSpotCheckSummary()`: Returns counts by status
- `getSpotCheckById(id)`: Returns single spot check or undefined
- `getSpotChecksByStatus(status)`: Returns filtered array
- `getActiveSpotChecks()`: Returns pending and in-progress checks
- `getOverdueSpotChecks()`: Returns checks past due date
- `getSpotCheckDashboardStats()`: Returns aggregated KPI data

### Sample Data Structure

```typescript
const mockSpotChecks: SpotCheck[] = [
  {
    id: 'sc-001',
    checkNumber: 'SC-251206-0001',
    checkType: 'random',
    status: 'completed',
    priority: 'medium',
    locationId: 'loc-001',
    locationName: 'Main Warehouse',
    // ... other fields
    items: [
      {
        id: 'item-001',
        itemCode: 'SKU-001',
        itemName: 'Chicken Breast',
        systemQuantity: 100,
        countedQuantity: 98,
        variance: -2,
        variancePercent: -2,
        condition: 'good',
        status: 'counted',
        // ... other fields
      }
    ]
  }
];
```

---

## State Management Patterns

### Component-Level State

**List Page Filters**:
```typescript
const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState<SpotCheckStatus | 'all'>('all');
const [typeFilter, setTypeFilter] = useState<SpotCheckType | 'all'>('all');
```

**Wizard State (2-Step)**:
```typescript
const [step, setStep] = useState<1 | 2>(1);
const [location, setLocation] = useState('');
const [department, setDepartment] = useState('');
const [assignedTo, setAssignedTo] = useState('');
const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
const [selectionMethod, setSelectionMethod] = useState<'random' | 'high-value' | 'manual'>('random');
const [itemCount, setItemCount] = useState<10 | 20 | 50>(20);
const [selectedItems, setSelectedItems] = useState<SpotCheckItem[]>([]);
```

**Active Counts State (Zustand)**:
```typescript
// From useCountStore
interface CountStore {
  activeCounts: SpotCheck[];
  addCount: (count: SpotCheck) => void;
  updateCount: (id: string, updates: Partial<SpotCheck>) => void;
  removeCount: (id: string) => void;
}

// Usage in active/page.tsx
const activeCounts = useCountStore((state) => state.activeCounts);
```

**Counting State**:
```typescript
const [currentItemIndex, setCurrentItemIndex] = useState(0);
const [countedQuantity, setCountedQuantity] = useState<number | null>(null);
const [condition, setCondition] = useState<ItemCondition>('good');
const [notes, setNotes] = useState('');
```

### Derived State with useMemo

```typescript
// Filter and sort spot checks
const filteredSpotChecks = useMemo(() => {
  return spotChecks
    .filter(sc => statusFilter === 'all' || sc.status === statusFilter)
    .filter(sc => typeFilter === 'all' || sc.checkType === typeFilter)
    .filter(sc => searchQuery === '' ||
      sc.checkNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.locationName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortConfig.direction === 'asc') {
        return a[sortConfig.field] > b[sortConfig.field] ? 1 : -1;
      }
      return a[sortConfig.field] < b[sortConfig.field] ? 1 : -1;
    });
}, [spotChecks, statusFilter, typeFilter, searchQuery, sortConfig]);
```

---

## Component Patterns

### Wizard Navigation (2-Step)

```typescript
const handleNext = () => {
  if (step === 1) {
    // Validate location is selected
    if (!location) {
      toast.error('Please select a location');
      return;
    }
    setStep(2);
  } else {
    handleSubmit();
  }
};

const handleBack = () => {
  if (step === 2) {
    setStep(1);
  }
};

const handleSubmit = () => {
  // Create spot check with form data
  const newSpotCheck: SpotCheck = {
    // ... form fields
  };
  // Navigate to list or detail page
};
```

### Status Transition Helpers

```typescript
const canStart = (status: SpotCheckStatus) => status === 'pending';
const canPause = (status: SpotCheckStatus) => status === 'in-progress';
const canResume = (status: SpotCheckStatus) => status === 'on-hold';
const canComplete = (status: SpotCheckStatus) => status === 'in-progress';
const canCancel = (status: SpotCheckStatus) =>
  status !== 'completed' && status !== 'cancelled';
```

### Variance Calculation

```typescript
const calculateVariance = (systemQty: number, countedQty: number | null) => {
  if (countedQty === null) {
    return { variance: 0, variancePercent: 0 };
  }
  const variance = countedQty - systemQty;
  const variancePercent = systemQty !== 0
    ? (variance / systemQty) * 100
    : 0;
  return { variance, variancePercent };
};
```

### Color Coding for Variance

```typescript
const getVarianceColor = (variancePercent: number) => {
  const absPercent = Math.abs(variancePercent);
  if (absPercent === 0) return 'text-green-600 bg-green-50';
  if (absPercent < 5) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};
```

---

## UI Components Used

### From Shadcn/ui
- Button, Card, Badge, Tabs, TabsList, TabsTrigger, TabsContent
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
- Select, SelectTrigger, SelectValue, SelectContent, SelectItem
- Input, Textarea, Label
- Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- Progress, Separator
- DropdownMenu for actions
- Form components with React Hook Form integration

### Custom Components
- SpotCheckCard: Summary card for dashboard/grid view
- SpotCheckFilters: Filter bar component
- VarianceIndicator: Color-coded variance display
- ProgressRing: Circular progress indicator
- ItemCounterControls: +/- buttons for quantity input

---

## Performance Considerations

### Current Optimizations
- `useMemo` for expensive filtering/sorting operations
- Lazy loading of tab content in detail page
- Conditional rendering to avoid unnecessary DOM nodes

### Future Optimizations (With Database)
- Server-side pagination with Prisma take/skip
- React Query caching for server state
- Optimistic updates for mutations
- Virtual scrolling for large item lists

---

## Error Handling

### Current Implementation
- Form validation errors displayed inline
- Toast notifications for action feedback
- Loading states for async operations (mock delay)

### Future Implementation
- Server Action error handling
- API error retries with exponential backoff
- Error boundaries for component failures
- Sentry integration for error tracking

---

## Implementation Status

### Completed
- [x] Dashboard with KPIs
- [x] List page with filtering
- [x] 2-step creation wizard (location → method/items)
- [x] Active spot checks page (Zustand state)
- [x] Completed spot checks page
- [x] Detail page with tabs
- [x] Counting interface (single/list modes)
- [x] Status transitions
- [x] Variance calculation
- [x] Cancel with reason dialog
- [x] Mock data layer
- [x] TypeScript type definitions

### Pending (Future)
- [ ] Database integration (Prisma/PostgreSQL)
- [ ] Server Actions for mutations
- [ ] User authentication/authorization
- [ ] Location-based permissions (RLS)
- [ ] Real inventory integration (ITS API)
- [ ] Approval workflow for high variance
- [ ] Export functionality
- [ ] Barcode scanner integration
- [ ] Offline capability

---

## Security Considerations (Future)

### Authentication
- Supabase Auth with JWT tokens
- Session management via HTTP-only cookies

### Authorization
- Role-based access control (Storekeeper, Coordinator, Supervisor, Manager)
- Location-based permissions
- Row-Level Security at database level

### Input Validation
- Client-side: React Hook Form + Zod
- Server-side: Zod validation in Server Actions
- Database: Prisma constraints and triggers

---

## Testing Strategy

### Unit Tests (Vitest)
- Component rendering tests
- Validation function tests
- Variance calculation tests
- Status transition logic tests

### E2E Tests (Playwright)
- Create spot check flow
- Enter quantities and complete
- Cancel spot check
- Filter and search functionality

---

## Appendix

### Glossary
- **Spot Check**: Targeted inventory verification of selected items
- **Check Type**: Classification of spot check purpose (random, targeted, etc.)
- **Variance**: Difference between system and counted quantities
- **Item Condition**: Physical state of item (good, damaged, expired, missing)

### Related Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [Shadcn/ui Components](https://ui.shadcn.com)

---

**Document End**
