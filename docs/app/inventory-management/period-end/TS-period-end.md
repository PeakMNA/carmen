# Technical Specification: Period End Management

## Document Information
- **Module**: Inventory Management - Period End
- **Component**: Period End Management
- **Version**: 1.1.0
- **Last Updated**: 2025-12-09
- **Status**: Active

## Related Documents
- [Business Requirements](./BR-period-end.md)
- [Use Cases](./UC-period-end.md)
- [Shared Method: Period End Snapshots](../../shared-methods/SM-period-end-snapshots.md) (Future Implementation)
- [Business Requirements: Physical Count](../physical-count/BR-physical-count.md)
- [Business Requirements: Inventory Adjustments](../inventory-adjustments/BR-inventory-adjustments.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2025-12-09 | Development Team | Updated status values (open, closing, closed, reopened), expanded validation checklist to 11 items |
---

## 1. Architecture Overview

### 1.1 Three-Tier Architecture

The Period End Management sub-module follows the application's three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (Next.js 14.2+ App Router with React Server Components)    │
├─────────────────────────────────────────────────────────────┤
│  • Period List Page (app/(main)/inventory-management/       │
│    period-end/page.tsx)                                      │
│  • Period Detail Page (app/(main)/inventory-management/     │
│    period-end/[id]/page.tsx)                                 │
│  • Client Components for interactive UI elements            │
│  • Shadcn/ui components for consistent design                │
├─────────────────────────────────────────────────────────────┤
│                   APPLICATION LAYER                          │
│  (Server Actions + Business Logic + Validation)             │
├─────────────────────────────────────────────────────────────┤
│  • Period CRUD Operations (Create, Read, Update, Delete)    │
│  • Period Status Transitions (Open → Closing → Closed → Reopened)  │
│  • Checklist Task Management (Mark Complete, Reset)         │
│  • Period Closure Validation (All tasks complete, etc.)     │
│  • Period Re-open Workflow (Authorization + Audit)          │
│  • Activity Logging (Immutable audit trail)                 │
│  • Integration with Physical Count, Adjustments modules     │
│  • Transaction Posting Validation (Prevent closed periods)  │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                              │
│  (PostgreSQL 14+ with Prisma ORM 5.8+)                      │
├─────────────────────────────────────────────────────────────┤
│  • period_end table (Period records)                         │
│  • period_task table (Checklist tasks)                       │
│  • period_activity table (Immutable audit log)               │
│  • Row-Level Security (RLS) for location-based access       │
│  • Database constraints and triggers for data integrity     │
│  • Indexes for performance optimization                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Module Characteristics

**Period End is a Process Orchestrator Module**:
- **NOT** a transactional data module (like Stock In/Out)
- **IS** a workflow coordination module that manages period boundaries
- **Primary Purpose**: Control when inventory periods are open/closed for transactions
- **Secondary Purpose**: Enforce checklist-based closure process with validation
- **Integration Role**: Acts as a gatekeeper for transaction posting across inventory modules

**Key Architectural Decisions**:
- Use Server Actions pattern (no separate API routes)
- Atomic transactions for status changes with activity logging
- Immutable activity log for complete audit trail
- Read-heavy operation pattern (status checks performed by many modules)
- Single source of truth for period status enforced at database level

---

## 2. Technology Stack

### 2.1 Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2+ | Full-stack React framework with App Router |
| React | 18.2+ | UI component library with Server Components |
| TypeScript | 5.8+ | Type-safe development with strict mode |
| Prisma ORM | 5.8+ | Type-safe database client with migrations |
| PostgreSQL | 14+ | Relational database with advanced features |
| Tailwind CSS | 3.4+ | Utility-first CSS framework |
| Shadcn/ui | Latest | Component library built on Radix UI primitives |

### 2.2 State Management

| Library | Version | Purpose |
|---------|---------|---------|
| Zustand | 4.5+ | Global UI state (filters, modals) |
| React Query | 5.0+ | Server state caching and synchronization |
| React Hook Form | 7.50+ | Form state management |
| Zod | 3.22+ | Schema validation for forms and API |

### 2.3 UI Components

| Component Type | Library | Usage |
|----------------|---------|-------|
| Primitives | Radix UI | Accessible, unstyled components |
| Styled Components | Shadcn/ui | Pre-built components with Tailwind |
| Icons | Lucide React | Icon library |
| Tables | TanStack Table | Data table with sorting/filtering |
| Date Pickers | React Day Picker | Calendar component |
| Forms | React Hook Form + Zod | Form handling with validation |

### 2.4 Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | 8.56+ | Code linting |
| Prettier | 3.2+ | Code formatting |
| TypeScript ESLint | 6.19+ | TypeScript-specific linting |
| Vitest | 1.2+ | Unit testing framework |
| Playwright | 1.40+ | E2E testing framework |

---

## 3. Component Structure

### 3.1 Directory Organization

```
app/(main)/inventory-management/period-end/
├── page.tsx                          # Period List Page (Server Component)
├── [id]/
│   └── page.tsx                      # Period Detail Page (Server Component)
├── components/
│   ├── period-list-table.tsx         # Client: Period list with filters
│   ├── period-status-badge.tsx       # Client: Status display component
│   ├── period-checklist.tsx          # Client: Task checklist display
│   ├── period-adjustments-tab.tsx    # Client: Adjustments list for period
│   ├── period-activity-log.tsx       # Client: Activity history display
│   ├── create-period-dialog.tsx      # Client: New period creation modal
│   ├── close-period-dialog.tsx       # Client: Period closure confirmation
│   ├── reopen-period-dialog.tsx      # Client: Re-open authorization modal
│   ├── cancel-period-dialog.tsx      # Client: Period cancellation modal
│   └── period-notes-editor.tsx       # Client: Notes editing component
├── actions.ts                        # Server Actions for CRUD operations
├── hooks/
│   ├── use-period-list.ts            # React Query hook for list
│   ├── use-period-detail.ts          # React Query hook for detail
│   ├── use-period-mutations.ts       # React Query mutations
│   └── use-period-filters.ts         # Zustand hook for filter state
├── types/
│   └── period-end.ts                 # TypeScript interfaces
└── lib/
    ├── period-validators.ts          # Zod schemas for validation
    ├── period-calculations.ts        # Period date calculations
    └── period-permissions.ts         # Permission checking utilities
```

### 3.2 Component Hierarchy

```
PeriodListPage (Server Component)
├── PeriodListFilters (Client Component)
│   ├── DateRangePicker
│   ├── StatusFilter (Dropdown)
│   └── SearchInput
├── PeriodListTable (Client Component)
│   ├── TableHeader (Sortable columns)
│   ├── TableBody
│   │   ├── PeriodRow (multiple)
│   │   │   ├── PeriodStatusBadge
│   │   │   └── ActionMenu (View Details)
│   │   └── EmptyState (if no data)
│   └── TablePagination
└── CreatePeriodButton (Client Component)
    └── CreatePeriodDialog (Modal)

PeriodDetailPage (Server Component)
├── PeriodHeader (Client Component)
│   ├── PeriodStatusBadge
│   ├── PeriodInfo (ID, dates, status)
│   └── ActionButtons (Close, Re-open, Cancel)
├── Tabs (Client Component)
│   ├── TabList
│   │   ├── Overview Tab
│   │   ├── Checklist Tab
│   │   ├── Adjustments Tab
│   │   └── Activity Log Tab
│   └── TabPanels
│       ├── OverviewPanel
│       │   └── PeriodNotesEditor
│       ├── ChecklistPanel
│       │   └── PeriodChecklist
│       │       ├── TaskRow (multiple)
│       │       │   ├── TaskStatus
│       │       │   ├── TaskInfo
│       │       │   └── MarkCompleteButton
│       │       └── ChecklistSummary
│       ├── AdjustmentsPanel
│       │   └── PeriodAdjustmentsTab
│       │       ├── AdjustmentsList
│       │       └── AdjustmentFilters
│       └── ActivityLogPanel
│           └── PeriodActivityLog
│               ├── ActivityTimeline
│               └── ActivityFilters
└── Dialogs (Conditional Rendering)
    ├── ClosePeriodDialog
    ├── ReopenPeriodDialog
    └── CancelPeriodDialog
```

---

## 4. Page Structure and Routing

### 4.1 App Router Pages

#### Period List Page (`page.tsx`)

**Route**: `/inventory-management/period-end`

**Component Type**: React Server Component (RSC)

**Responsibilities**:
- Server-side data fetching (initial period list)
- SEO metadata generation
- Permission checking (server-side)
- Rendering static UI shell
- Passing initial data to client components

**Data Fetching**:
```typescript
// Server Component - Direct database query via Prisma
async function PeriodListPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Permission check
  const session = await getServerSession()
  if (!hasPermission(session, 'Inventory.PeriodEnd.View')) {
    redirect('/unauthorized')
  }

  // Parse search params
  const filters = {
    startDate: searchParams.startDate as string,
    endDate: searchParams.endDate as string,
    status: searchParams.status as string,
    page: Number(searchParams.page) || 1,
    pageSize: Number(searchParams.pageSize) || 20
  }

  // Fetch initial data server-side
  const periodsData = await prisma.periodEnd.findMany({
    where: buildWhereClause(filters),
    orderBy: { startDate: 'desc' },
    take: filters.pageSize,
    skip: (filters.page - 1) * filters.pageSize,
    include: {
      tasks: {
        select: { status: true }
      },
      _count: {
        select: { adjustments: true }
      }
    }
  })

  const totalCount = await prisma.periodEnd.count({
    where: buildWhereClause(filters)
  })

  return (
    <div>
      <PeriodListHeader />
      <PeriodListFilters initialFilters={filters} />
      <PeriodListTable
        initialData={periodsData}
        totalCount={totalCount}
        pageSize={filters.pageSize}
      />
    </div>
  )
}
```

**Client Components Used**:
- `PeriodListFilters`: Filter controls (date range, status)
- `PeriodListTable`: Interactive data table
- `CreatePeriodButton`: Opens creation dialog

---

#### Period Detail Page (`[id]/page.tsx`)

**Route**: `/inventory-management/period-end/[id]`

**Component Type**: React Server Component (RSC)

**Responsibilities**:
- Server-side data fetching (period detail, tasks, activity log)
- Permission checking (server-side)
- SEO metadata with period information
- Dynamic route parameter handling
- Rendering static UI shell with tabs

**Data Fetching**:
```typescript
// Server Component - Direct database query via Prisma
async function PeriodDetailPage({
  params
}: {
  params: { id: string }
}) {
  // Permission check
  const session = await getServerSession()
  if (!hasPermission(session, 'Inventory.PeriodEnd.View')) {
    redirect('/unauthorized')
  }

  // Fetch period detail with related data
  const period = await prisma.periodEnd.findUnique({
    where: { id: params.id },
    include: {
      tasks: {
        orderBy: { sequence: 'asc' },
        include: {
          completedByUser: {
            select: { name: true, email: true }
          }
        }
      },
      activityLog: {
        orderBy: { actionDate: 'desc' },
        take: 100,
        include: {
          actionByUser: {
            select: { name: true, email: true }
          }
        }
      },
      createdByUser: {
        select: { name: true, email: true }
      },
      completedByUser: {
        select: { name: true, email: true }
      },
      reopenedByUser: {
        select: { name: true, email: true }
      }
    }
  })

  if (!period) {
    notFound()
  }

  // Fetch adjustments for this period (from Adjustments module)
  const adjustments = await prisma.inventoryAdjustment.findMany({
    where: {
      createdDate: {
        gte: period.startDate,
        lte: period.endDate
      },
      status: { in: ['Committed', 'Approved'] }
    },
    orderBy: { createdDate: 'desc' },
    take: 50
  })

  return (
    <div>
      <PeriodDetailHeader period={period} />
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checklist">
            Checklist ({period.tasks.filter(t => t.status === 'completed').length}/{period.tasks.length})
          </TabsTrigger>
          <TabsTrigger value="adjustments">
            Adjustments ({adjustments.length})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PeriodOverview period={period} />
        </TabsContent>

        <TabsContent value="checklist">
          <PeriodChecklist period={period} />
        </TabsContent>

        <TabsContent value="adjustments">
          <PeriodAdjustmentsTab
            periodId={period.id}
            initialAdjustments={adjustments}
          />
        </TabsContent>

        <TabsContent value="activity">
          <PeriodActivityLog
            periodId={period.id}
            initialActivities={period.activityLog}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Client Components Used**:
- `PeriodDetailHeader`: Period info and action buttons
- `PeriodOverview`: Period summary with notes editor
- `PeriodChecklist`: Interactive task checklist
- `PeriodAdjustmentsTab`: Adjustments list with filters
- `PeriodActivityLog`: Activity timeline display

---

### 4.2 URL Structure and Parameters

#### List Page URL

```
/inventory-management/period-end
  ?startDate=2024-01-01
  &endDate=2024-12-31
  &status=closing
  &page=1
  &pageSize=20
```

**Query Parameters**:
- `startDate`: Filter by period start date (ISO format)
- `endDate`: Filter by period end date (ISO format)
- `status`: Filter by status (open, closing, closed, reopened)
- `page`: Current page number (default: 1)
- `pageSize`: Items per page (default: 20)

#### Detail Page URL

```
/inventory-management/period-end/[id]
  ?tab=checklist
```

**Route Parameters**:
- `id`: Period record ID (UUID)

**Query Parameters**:
- `tab`: Active tab (overview, checklist, adjustments, activity)

---

## 5. Data Flows

### 5.1 Create New Period

**Actors**: Inventory Manager, Financial Manager, System Administrator

**Flow**:

```
User                    Client                  Server Action            Database
  |                       |                           |                      |
  |  Click "Create"       |                           |                      |
  |---------------------->|                           |                      |
  |                       |  Open Dialog              |                      |
  |                       |  (Auto-fill next month)   |                      |
  |                       |<--------------------------|                      |
  |  Review & Confirm     |                           |                      |
  |---------------------->|                           |                      |
  |                       |  createPeriod()           |                      |
  |                       |-------------------------->|                      |
  |                       |                           |  BEGIN TRANSACTION   |
  |                       |                           |--------------------->|
  |                       |                           |  Check: No future    |
  |                       |                           |  periods exist       |
  |                       |                           |<---------------------|
  |                       |                           |  INSERT period_end   |
  |                       |                           |  (status='open')     |
  |                       |                           |--------------------->|
  |                       |                           |  INSERT 4 default    |
  |                       |                           |  period_task rows    |
  |                       |                           |--------------------->|
  |                       |                           |  INSERT activity     |
  |                       |                           |  (action='Create')   |
  |                       |                           |--------------------->|
  |                       |                           |  COMMIT              |
  |                       |                           |--------------------->|
  |                       |  Success Response         |                      |
  |                       |<--------------------------|                      |
  |                       |  Invalidate cache         |                      |
  |                       |  (React Query)            |                      |
  |                       |  Navigate to detail       |                      |
  |                       |  page /period-end/[id]    |                      |
  |  Success Message      |                           |                      |
  |<----------------------|                           |                      |
```

**Implementation**:

```typescript
// Server Action: actions.ts
export async function createPeriod(formData: CreatePeriodFormData) {
  'use server'

  // 1. Validation
  const session = await getServerSession()
  if (!hasPermission(session, 'Inventory.PeriodEnd.Create')) {
    return { success: false, error: 'Permission denied' }
  }

  const validation = CreatePeriodSchema.safeParse(formData)
  if (!validation.success) {
    return { success: false, error: validation.error.message }
  }

  try {
    // 2. Check for existing future periods
    const existingFuturePeriod = await prisma.periodEnd.findFirst({
      where: {
        startDate: { gte: validation.data.startDate }
      }
    })

    if (existingFuturePeriod) {
      return {
        success: false,
        error: 'Cannot create period. Future periods already exist.'
      }
    }

    // 3. Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create period
      const period = await tx.periodEnd.create({
        data: {
          periodId: validation.data.periodId,
          periodName: validation.data.periodName,
          startDate: validation.data.startDate,
          endDate: validation.data.endDate,
          status: 'open',
          notes: validation.data.notes,
          createdBy: session.user.id,
          modifiedBy: session.user.id
        }
      })

      // Create default checklist tasks
      const defaultTasks = [
        { name: 'Complete Physical Count', sequence: 1 },
        { name: 'Reconcile Inventory Adjustments', sequence: 2 },
        { name: 'Review Variances', sequence: 3 },
        { name: 'Post Period End Entries', sequence: 4 }
      ]

      await tx.periodTask.createMany({
        data: defaultTasks.map(task => ({
          periodEndId: period.id,
          name: task.name,
          sequence: task.sequence,
          isRequired: true,
          status: 'pending',
          createdBy: session.user.id,
          modifiedBy: session.user.id
        }))
      })

      // Log activity
      await tx.periodActivity.create({
        data: {
          periodEndId: period.id,
          actionType: 'Create',
          actionDate: new Date(),
          actionBy: session.user.id,
          actionByName: session.user.name,
          ipAddress: getClientIp(),
          toStatus: 'open',
          notes: `Period ${period.periodName} created`
        }
      })

      return period
    })

    // 4. Success response
    revalidatePath('/inventory-management/period-end')
    return {
      success: true,
      data: result,
      message: `Period ${result.periodName} created successfully`
    }

  } catch (error) {
    console.error('Create period error:', error)
    return {
      success: false,
      error: 'Failed to create period. Please try again.'
    }
  }
}
```

**Client Usage**:

```typescript
// Component: create-period-dialog.tsx
'use client'

export function CreatePeriodDialog() {
  const form = useForm<CreatePeriodFormData>({
    resolver: zodResolver(CreatePeriodSchema),
    defaultValues: {
      periodId: generateNextPeriodId(),
      periodName: generateNextPeriodName(),
      startDate: getFirstDayOfNextMonth(),
      endDate: getLastDayOfNextMonth()
    }
  })

  const mutation = useMutation({
    mutationFn: createPeriod,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['periods'] })
        router.push(`/inventory-management/period-end/${result.data.id}`)
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    }
  })

  const onSubmit = (data: CreatePeriodFormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog>
      {/* Dialog UI */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Form fields */}
        </form>
      </Form>
    </Dialog>
  )
}
```

---

### 5.2 Close Period

**Actors**: Inventory Manager, Financial Manager, System Administrator

**Flow**:

```
User                    Client                  Server Action            Database
  |                       |                           |                      |
  |  Click "Close"        |                           |                      |
  |---------------------->|                           |                      |
  |                       |  Open Confirmation        |                      |
  |                       |  Dialog                   |                      |
  |                       |<--------------------------|                      |
  |                       |  Show: Period info,       |                      |
  |                       |  checklist status         |                      |
  |  Confirm Close        |                           |                      |
  |---------------------->|                           |                      |
  |                       |  closePeriod(id)          |                      |
  |                       |-------------------------->|                      |
  |                       |                           |  BEGIN TRANSACTION   |
  |                       |                           |--------------------->|
  |                       |                           |  Validate: All tasks |
  |                       |                           |  completed           |
  |                       |                           |<---------------------|
  |                       |                           |  Validate: Status    |
  |                       |                           |  = 'closing'         |
  |                       |                           |<---------------------|
  |                       |                           |  UPDATE period_end   |
  |                       |                           |  SET status='closed' |
  |                       |                           |  completed_by, _at   |
  |                       |                           |--------------------->|
  |                       |                           |  INSERT activity     |
  |                       |                           |  (action='Close')    |
  |                       |                           |--------------------->|
  |                       |                           |  COMMIT              |
  |                       |                           |--------------------->|
  |                       |  Success Response         |                      |
  |                       |<--------------------------|                      |
  |                       |  Invalidate cache         |                      |
  |                       |  Refresh page             |                      |
  |  Success Message      |                           |                      |
  |<----------------------|                           |                      |
```

**Implementation**:

```typescript
// Server Action: actions.ts
export async function closePeriod(periodId: string) {
  'use server'

  // 1. Validation
  const session = await getServerSession()
  if (!hasPermission(session, 'Inventory.PeriodEnd.Close')) {
    return { success: false, error: 'Permission denied' }
  }

  try {
    // 2. Fetch period with tasks
    const period = await prisma.periodEnd.findUnique({
      where: { id: periodId },
      include: { tasks: true }
    })

    if (!period) {
      return { success: false, error: 'Period not found' }
    }

    // 3. Validate status
    if (period.status !== 'closing') {
      return {
        success: false,
        error: `Cannot close period with status '${period.status}'. Must be 'closing'.`
      }
    }

    // 4. Validate checklist
    const incompleteTasks = period.tasks.filter(t => t.status !== 'completed')
    if (incompleteTasks.length > 0) {
      return {
        success: false,
        error: `Cannot close period. ${incompleteTasks.length} task(s) not completed: ${incompleteTasks.map(t => t.name).join(', ')}`
      }
    }

    // 5. Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update period status
      const updatedPeriod = await tx.periodEnd.update({
        where: { id: periodId },
        data: {
          status: 'closed',
          completedBy: session.user.id,
          completedAt: new Date(),
          modifiedBy: session.user.id,
          modifiedDate: new Date()
        }
      })

      // Log activity
      await tx.periodActivity.create({
        data: {
          periodEndId: periodId,
          actionType: 'Close',
          actionDate: new Date(),
          actionBy: session.user.id,
          actionByName: session.user.name,
          ipAddress: getClientIp(),
          fromStatus: 'closing',
          toStatus: 'closed',
          notes: `Period ${period.periodName} closed`
        }
      })

      return updatedPeriod
    })

    // 6. Success response
    revalidatePath('/inventory-management/period-end')
    revalidatePath(`/inventory-management/period-end/${periodId}`)
    return {
      success: true,
      data: result,
      message: `Period ${period.periodName} closed successfully`
    }

  } catch (error) {
    console.error('Close period error:', error)
    return {
      success: false,
      error: 'Failed to close period. Please try again.'
    }
  }
}
```

---

### 5.3 Re-open Closed Period

**Actors**: Financial Manager, System Administrator

**Flow**:

```
User                    Client                  Server Action            Database
  |                       |                           |                      |
  |  Click "Re-open"      |                           |                      |
  |---------------------->|                           |                      |
  |                       |  Open Authorization       |                      |
  |                       |  Dialog                   |                      |
  |                       |<--------------------------|                      |
  |                       |  Show: Period info,       |                      |
  |                       |  Re-open reason field     |                      |
  |                       |  (100 char min)           |                      |
  |  Enter Reason         |                           |                      |
  |  & Confirm            |                           |                      |
  |---------------------->|                           |                      |
  |                       |  reopenPeriod(id, reason) |                      |
  |                       |-------------------------->|                      |
  |                       |                           |  BEGIN TRANSACTION   |
  |                       |                           |--------------------->|
  |                       |                           |  Validate: Status    |
  |                       |                           |  = 'closed'          |
  |                       |                           |<---------------------|
  |                       |                           |  Validate: Most      |
  |                       |                           |  recent closed       |
  |                       |                           |<---------------------|
  |                       |                           |  Validate: No future |
  |                       |                           |  'closing'           |
  |                       |                           |<---------------------|
  |                       |                           |  UPDATE period_end   |
  |                       |                           |  SET status='reopened'|
  |                       |                           |  reopen fields       |
  |                       |                           |--------------------->|
  |                       |                           |  INSERT activity     |
  |                       |                           |  (action='Reopen')   |
  |                       |                           |--------------------->|
  |                       |                           |  COMMIT              |
  |                       |                           |--------------------->|
  |                       |                           |  Send notification   |
  |                       |                           |  email to Financial  |
  |                       |                           |  Controller & Admins |
  |                       |                           |--------------------->|
  |                       |  Success Response         |                      |
  |                       |<--------------------------|                      |
  |                       |  Invalidate cache         |                      |
  |                       |  Refresh page             |                      |
  |  Success Message      |                           |                      |
  |<----------------------|                           |                      |
```

**Implementation**:

```typescript
// Server Action: actions.ts
export async function reopenPeriod(periodId: string, reason: string) {
  'use server'

  // 1. Validation
  const session = await getServerSession()
  if (!hasPermission(session, 'Inventory.PeriodEnd.Reopen')) {
    return { success: false, error: 'Permission denied. Requires Financial Manager or Admin role.' }
  }

  if (!reason || reason.length < 100) {
    return { success: false, error: 'Re-open reason must be at least 100 characters' }
  }

  try {
    // 2. Fetch period
    const period = await prisma.periodEnd.findUnique({
      where: { id: periodId }
    })

    if (!period) {
      return { success: false, error: 'Period not found' }
    }

    // 3. Validate status
    if (period.status !== 'closed') {
      return {
        success: false,
        error: `Cannot re-open period with status '${period.status}'. Must be 'closed'.`
      }
    }

    // 4. Validate most recent closed period
    const moreFutureClosedPeriods = await prisma.periodEnd.count({
      where: {
        status: 'closed',
        endDate: { gt: period.endDate }
      }
    })

    if (moreFutureClosedPeriods > 0) {
      return {
        success: false,
        error: 'Cannot re-open period. Only the most recent closed period can be re-opened.'
      }
    }

    // 5. Validate no future closing periods
    const futureClosing = await prisma.periodEnd.count({
      where: {
        status: 'closing',
        startDate: { gt: period.startDate }
      }
    })

    if (futureClosing > 0) {
      return {
        success: false,
        error: 'Cannot re-open period. A future period is already in closing status.'
      }
    }

    // 6. Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update period status
      const updatedPeriod = await tx.periodEnd.update({
        where: { id: periodId },
        data: {
          status: 'reopened',
          originalCompletedBy: period.completedBy,
          originalCompletedAt: period.completedAt,
          reopenedBy: session.user.id,
          reopenedAt: new Date(),
          reopenReason: reason,
          completedBy: null,
          completedAt: null,
          modifiedBy: session.user.id,
          modifiedDate: new Date()
        }
      })

      // Log activity
      await tx.periodActivity.create({
        data: {
          periodEndId: periodId,
          actionType: 'Reopen',
          actionDate: new Date(),
          actionBy: session.user.id,
          actionByName: session.user.name,
          ipAddress: getClientIp(),
          fromStatus: 'closed',
          toStatus: 'reopened',
          reason: reason,
          notes: `Period ${period.periodName} re-opened by ${session.user.name}`
        }
      })

      return updatedPeriod
    })

    // 7. Send notification email
    await sendReopenNotification({
      periodName: period.periodName,
      reopenedBy: session.user.name,
      reason: reason,
      recipients: ['financial-controller@company.com', 'admins@company.com']
    })

    // 8. Success response
    revalidatePath('/inventory-management/period-end')
    revalidatePath(`/inventory-management/period-end/${periodId}`)
    return {
      success: true,
      data: result,
      message: `Period ${period.periodName} re-opened successfully. Notification sent to Financial Controller.`
    }

  } catch (error) {
    console.error('Re-open period error:', error)
    return {
      success: false,
      error: 'Failed to re-open period. Please try again.'
    }
  }
}
```

---

### 5.4 Mark Task Complete

**Actors**: Inventory Manager, Financial Manager, System Administrator

**Flow**:

```
User                    Client                  Server Action            Database
  |                       |                           |                      |
  |  Click "Complete"     |                           |                      |
  |  on task row          |                           |                      |
  |---------------------->|                           |                      |
  |                       |  markTaskComplete(id)     |                      |
  |                       |-------------------------->|                      |
  |                       |                           |  BEGIN TRANSACTION   |
  |                       |                           |--------------------->|
  |                       |                           |  Validate: Period    |
  |                       |                           |  status != 'closed'  |
  |                       |                           |<---------------------|
  |                       |                           |  UPDATE period_task  |
  |                       |                           |  SET status='done'   |
  |                       |                           |  completed_by, _at   |
  |                       |                           |--------------------->|
  |                       |                           |  INSERT activity     |
  |                       |                           |  (action='TaskDone') |
  |                       |                           |--------------------->|
  |                       |                           |  COMMIT              |
  |                       |                           |--------------------->|
  |                       |  Success Response         |                      |
  |                       |<--------------------------|                      |
  |                       |  Optimistic Update        |                      |
  |                       |  (Update UI immediately)  |                      |
  |  Checkmark & User     |                           |                      |
  |  Name displayed       |                           |                      |
  |<----------------------|                           |                      |
```

**Implementation**:

```typescript
// Server Action: actions.ts
export async function markTaskComplete(taskId: string) {
  'use server'

  // 1. Validation
  const session = await getServerSession()
  if (!hasPermission(session, 'Inventory.PeriodEnd.ManageTasks')) {
    return { success: false, error: 'Permission denied' }
  }

  try {
    // 2. Fetch task with period
    const task = await prisma.periodTask.findUnique({
      where: { id: taskId },
      include: { period: true }
    })

    if (!task) {
      return { success: false, error: 'Task not found' }
    }

    // 3. Validate period not closed
    if (task.period.status === 'closed') {
      return {
        success: false,
        error: 'Cannot modify tasks in closed period'
      }
    }

    // 4. Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update task status
      const updatedTask = await tx.periodTask.update({
        where: { id: taskId },
        data: {
          status: 'completed',
          completedBy: session.user.id,
          completedAt: new Date(),
          modifiedBy: session.user.id,
          modifiedDate: new Date()
        },
        include: {
          completedByUser: {
            select: { name: true, email: true }
          }
        }
      })

      // Log activity
      await tx.periodActivity.create({
        data: {
          periodEndId: task.periodEndId,
          actionType: 'TaskComplete',
          actionDate: new Date(),
          actionBy: session.user.id,
          actionByName: session.user.name,
          ipAddress: getClientIp(),
          taskName: task.name,
          notes: `Task '${task.name}' marked complete`
        }
      })

      return updatedTask
    })

    // 5. Success response
    revalidatePath(`/inventory-management/period-end/${task.periodEndId}`)
    return {
      success: true,
      data: result,
      message: `Task '${task.name}' marked complete`
    }

  } catch (error) {
    console.error('Mark task complete error:', error)
    return {
      success: false,
      error: 'Failed to update task. Please try again.'
    }
  }
}
```

---

## 6. State Management

### 6.1 Global UI State (Zustand)

**Store Definition**:

```typescript
// hooks/use-period-filters.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PeriodFiltersState {
  // Filters
  startDate: Date | null
  endDate: Date | null
  status: string[]
  searchTerm: string

  // Pagination
  page: number
  pageSize: number

  // Sorting
  sortBy: 'startDate' | 'endDate' | 'status' | 'periodId'
  sortDirection: 'asc' | 'desc'

  // Actions
  setStartDate: (date: Date | null) => void
  setEndDate: (date: Date | null) => void
  setStatus: (status: string[]) => void
  setSearchTerm: (term: string) => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setSorting: (by: string, direction: 'asc' | 'desc') => void
  resetFilters: () => void
}

export const usePeriodFilters = create<PeriodFiltersState>()(
  persist(
    (set) => ({
      // Initial state
      startDate: null,
      endDate: null,
      status: [],
      searchTerm: '',
      page: 1,
      pageSize: 20,
      sortBy: 'startDate',
      sortDirection: 'desc',

      // Actions
      setStartDate: (date) => set({ startDate: date, page: 1 }),
      setEndDate: (date) => set({ endDate: date, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setSearchTerm: (term) => set({ searchTerm: term, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (size) => set({ pageSize: size, page: 1 }),
      setSorting: (by, direction) => set({
        sortBy: by as any,
        sortDirection: direction
      }),
      resetFilters: () => set({
        startDate: null,
        endDate: null,
        status: [],
        searchTerm: '',
        page: 1,
        pageSize: 20,
        sortBy: 'startDate',
        sortDirection: 'desc'
      })
    }),
    {
      name: 'period-filters-storage',
      partialize: (state) => ({
        // Only persist filters, not pagination
        startDate: state.startDate,
        endDate: state.endDate,
        status: state.status,
        pageSize: state.pageSize,
        sortBy: state.sortBy,
        sortDirection: state.sortDirection
      })
    }
  )
)
```

**Usage in Component**:

```typescript
// components/period-list-filters.tsx
'use client'

export function PeriodListFilters() {
  const {
    startDate,
    endDate,
    status,
    searchTerm,
    setStartDate,
    setEndDate,
    setStatus,
    setSearchTerm,
    resetFilters
  } = usePeriodFilters()

  return (
    <div className="filters">
      <DateRangePicker
        from={startDate}
        to={endDate}
        onSelect={(range) => {
          setStartDate(range?.from || null)
          setEndDate(range?.to || null)
        }}
      />

      <MultiSelect
        value={status}
        onChange={setStatus}
        options={[
          { value: 'open', label: 'Open' },
          { value: 'closing', label: 'Closing' },
          { value: 'closed', label: 'Closed' },
          { value: 'reopened', label: 'Reopened' }
        ]}
      />

      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search periods..."
      />

      <Button onClick={resetFilters} variant="outline">
        Reset Filters
      </Button>
    </div>
  )
}
```

---

### 6.2 Server State (React Query)

**Query Hooks**:

```typescript
// hooks/use-period-list.ts
import { useQuery } from '@tanstack/react-query'

export function usePeriodList(filters: PeriodFilters) {
  return useQuery({
    queryKey: ['periods', filters],
    queryFn: async () => {
      const response = await fetch(
        `/api/periods?${new URLSearchParams(filters as any)}`
      )
      if (!response.ok) throw new Error('Failed to fetch periods')
      return response.json()
    },
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000 // 5 minutes
  })
}

// hooks/use-period-detail.ts
export function usePeriodDetail(periodId: string) {
  return useQuery({
    queryKey: ['period', periodId],
    queryFn: async () => {
      const response = await fetch(`/api/periods/${periodId}`)
      if (!response.ok) throw new Error('Failed to fetch period')
      return response.json()
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000
  })
}
```

**Mutation Hooks**:

```typescript
// hooks/use-period-mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function usePeriodMutations() {
  const queryClient = useQueryClient()

  const createPeriod = useMutation({
    mutationFn: async (data: CreatePeriodFormData) => {
      return await createPeriod(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] })
    }
  })

  const closePeriod = useMutation({
    mutationFn: async (periodId: string) => {
      return await closePeriod(periodId)
    },
    onMutate: async (periodId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['period', periodId] })

      const previousPeriod = queryClient.getQueryData(['period', periodId])

      queryClient.setQueryData(['period', periodId], (old: any) => ({
        ...old,
        status: 'closed'
      }))

      return { previousPeriod }
    },
    onError: (err, periodId, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['period', periodId],
        context?.previousPeriod
      )
    },
    onSettled: (data, error, periodId) => {
      queryClient.invalidateQueries({ queryKey: ['period', periodId] })
      queryClient.invalidateQueries({ queryKey: ['periods'] })
    }
  })

  const reopenPeriod = useMutation({
    mutationFn: async ({ periodId, reason }: { periodId: string, reason: string }) => {
      return await reopenPeriod(periodId, reason)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] })
    }
  })

  const markTaskComplete = useMutation({
    mutationFn: async (taskId: string) => {
      return await markTaskComplete(taskId)
    },
    onSuccess: (data, taskId) => {
      // Invalidate period detail query
      queryClient.invalidateQueries({ queryKey: ['period'] })
    }
  })

  return {
    createPeriod,
    closePeriod,
    reopenPeriod,
    markTaskComplete
  }
}
```

---

### 6.3 Form State (React Hook Form + Zod)

**Schema Definition**:

```typescript
// lib/period-validators.ts
import { z } from 'zod'

export const CreatePeriodSchema = z.object({
  periodId: z.string()
    .regex(/^PE-\d{4}-\d{2}$/, 'Period ID must be in format PE-YYYY-MM'),
  periodName: z.string()
    .min(3, 'Period name must be at least 3 characters')
    .max(50, 'Period name must not exceed 50 characters'),
  startDate: z.date(),
  endDate: z.date(),
  notes: z.string().max(500).optional()
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
)

export const ReopenPeriodSchema = z.object({
  reason: z.string()
    .min(100, 'Re-open reason must be at least 100 characters')
    .max(500, 'Re-open reason must not exceed 500 characters')
})

export const UpdateNotesSchema = z.object({
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional()
})
```

**Form Component**:

```typescript
// components/reopen-period-dialog.tsx
'use client'

export function ReopenPeriodDialog({
  period
}: {
  period: PeriodEnd
}) {
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof ReopenPeriodSchema>>({
    resolver: zodResolver(ReopenPeriodSchema),
    defaultValues: {
      reason: ''
    }
  })

  const { reopenPeriod } = usePeriodMutations()

  const onSubmit = async (data: z.infer<typeof ReopenPeriodSchema>) => {
    const result = await reopenPeriod.mutateAsync({
      periodId: period.id,
      reason: data.reason
    })

    if (result.success) {
      toast.success(result.message)
      setOpen(false)
      form.reset()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LucideUnlock className="mr-2 h-4 w-4" />
          Re-open Period
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Re-open Period {period.periodName}</DialogTitle>
          <DialogDescription>
            This action requires Financial Manager or System Administrator authorization.
            Please provide a detailed reason (minimum 100 characters).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Re-open Reason *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Provide detailed reason for re-opening this period..."
                      rows={5}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/500 characters
                    {field.value.length < 100 && ` (minimum 100 required)`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={reopenPeriod.isPending}
              >
                {reopenPeriod.isPending && (
                  <LucideLoader className="mr-2 h-4 w-4 animate-spin" />
                )}
                Re-open Period
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 7. Integration Patterns

### 7.1 Integration with Physical Count Module

**Purpose**: Validate that physical counts are completed before period closure

**Integration Point**: Period closure validation (UC-PE-004)

**Implementation**:

```typescript
// lib/period-validators.ts
export async function validatePhysicalCountCompletion(
  period: PeriodEnd
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Query Physical Count module for counts within period date range
    const incompleteCounts = await prisma.physicalCount.count({
      where: {
        countDate: {
          gte: period.startDate,
          lte: period.endDate
        },
        status: { in: ['Saved', 'In Progress'] }
      }
    })

    if (incompleteCounts > 0) {
      return {
        valid: false,
        error: `Cannot close period. ${incompleteCounts} physical count(s) not completed.`
      }
    }

    return { valid: true }

  } catch (error) {
    console.error('Physical count validation error:', error)
    return {
      valid: false,
      error: 'Failed to validate physical counts. Please try again.'
    }
  }
}
```

**Usage in Close Period Action**:

```typescript
// actions.ts - closePeriod()
export async function closePeriod(periodId: string) {
  // ... existing validation ...

  // Validate physical count completion (UC-PE-201)
  const countValidation = await validatePhysicalCountCompletion(period)
  if (!countValidation.valid) {
    return { success: false, error: countValidation.error }
  }

  // ... proceed with closure ...
}
```

---

### 7.2 Integration with Inventory Adjustments Module

**Purpose**: Display all adjustments created during the period

**Integration Point**: Period detail page - Adjustments tab (FR-PE-005)

**Implementation**:

```typescript
// Server Component: [id]/page.tsx
async function PeriodDetailPage({ params }: { params: { id: string } }) {
  // ... fetch period ...

  // Fetch adjustments for this period (from Adjustments module)
  const adjustments = await prisma.inventoryAdjustment.findMany({
    where: {
      createdDate: {
        gte: period.startDate,
        lte: period.endDate
      },
      status: { in: ['Committed', 'Approved'] }
    },
    orderBy: { createdDate: 'desc' },
    include: {
      location: {
        select: { code: true, name: true }
      },
      createdByUser: {
        select: { name: true }
      }
    }
  })

  return (
    <div>
      {/* ... other tabs ... */}

      <TabsContent value="adjustments">
        <PeriodAdjustmentsTab
          periodId={period.id}
          initialAdjustments={adjustments}
        />
      </TabsContent>
    </div>
  )
}
```

**Client Component**:

```typescript
// components/period-adjustments-tab.tsx
'use client'

export function PeriodAdjustmentsTab({
  periodId,
  initialAdjustments
}: {
  periodId: string
  initialAdjustments: Adjustment[]
}) {
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    status: ''
  })

  // Client-side filtering
  const filteredAdjustments = useMemo(() => {
    return initialAdjustments.filter(adj => {
      if (filters.type && adj.type !== filters.type) return false
      if (filters.location && adj.locationId !== filters.location) return false
      if (filters.status && adj.status !== filters.status) return false
      return true
    })
  }, [initialAdjustments, filters])

  return (
    <div>
      <div className="filters">
        {/* Filter controls */}
      </div>

      <DataTable
        columns={adjustmentColumns}
        data={filteredAdjustments}
      />

      <div className="summary">
        <p>Total Adjustments: {filteredAdjustments.length}</p>
        <p>
          Total Value: {formatCurrency(
            filteredAdjustments.reduce((sum, adj) => sum + adj.totalAmount, 0)
          )}
        </p>
      </div>
    </div>
  )
}
```

---

### 7.3 Integration with Stock Transactions (Transaction Posting Validation)

**Purpose**: Prevent transactions from posting to closed periods

**Integration Point**: Stock transaction validation layer (UC-PE-104)

**Implementation**:

```typescript
// lib/period-validators.ts
export async function validateTransactionPostingAllowed(
  transactionDate: Date,
  locationId: string
): Promise<{ allowed: boolean; error?: string }> {
  try {
    // Find period that contains the transaction date
    const period = await prisma.periodEnd.findFirst({
      where: {
        startDate: { lte: transactionDate },
        endDate: { gte: transactionDate }
      }
    })

    if (!period) {
      // No period defined for this date - allow posting
      return { allowed: true }
    }

    if (period.status === 'closed') {
      return {
        allowed: false,
        error: `Cannot post transaction. Period ${period.periodName} is closed.`
      }
    }

    return { allowed: true }

  } catch (error) {
    console.error('Transaction posting validation error:', error)
    return {
      allowed: false,
      error: 'Failed to validate transaction posting. Please try again.'
    }
  }
}
```

**Usage in Stock In Module**:

```typescript
// app/(main)/inventory-management/stock-in/actions.ts
export async function commitStockIn(transactionId: string) {
  'use server'

  // ... existing validation ...

  // Validate transaction posting allowed (UC-PE-104)
  const postingValidation = await validateTransactionPostingAllowed(
    transaction.transactionDate,
    transaction.locationId
  )

  if (!postingValidation.allowed) {
    return { success: false, error: postingValidation.error }
  }

  // ... proceed with commit ...
}
```

**Database Trigger (Additional Enforcement)**:

```sql
-- Trigger to enforce period status at database level
CREATE OR REPLACE FUNCTION check_period_status_before_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_period_status VARCHAR(20);
BEGIN
  -- Find period containing transaction date
  SELECT status INTO v_period_status
  FROM period_end
  WHERE NEW.transaction_date BETWEEN start_date AND end_date
  LIMIT 1;

  -- If period is closed, reject transaction
  IF v_period_status = 'closed' THEN
    RAISE EXCEPTION 'Cannot post transaction to closed period';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_period_before_stock_transaction
  BEFORE INSERT OR UPDATE ON inventory_transaction
  FOR EACH ROW
  EXECUTE FUNCTION check_period_status_before_transaction();
```

---

## 8. Security Implementation

### 8.1 Role-Based Access Control (RBAC)

**Permission Matrix**:

| Operation | Coordinator | Manager | Financial | Admin |
|-----------|------------|---------|-----------|-------|
| View Periods | ✅ | ✅ | ✅ | ✅ |
| Create Period | ❌ | ✅ | ✅ | ✅ |
| Update Notes | ❌ | ✅ | ✅ | ✅ |
| Mark Task Complete | ❌ | ✅ | ✅ | ✅ |
| Close Period | ❌ | ✅ | ✅ | ✅ |
| Re-open Period | ❌ | ❌ | ✅ | ✅ |
| Cancel Period | ❌ | ❌ | ❌ | ✅ |
| View Activity Log | ✅ | ✅ | ✅ | ✅ |

**Permission Checking Utility**:

```typescript
// lib/period-permissions.ts
import { getServerSession } from 'next-auth'

const PERMISSIONS = {
  VIEW: ['Inventory Coordinator', 'Inventory Manager', 'Financial Manager', 'System Administrator'],
  CREATE: ['Inventory Manager', 'Financial Manager', 'System Administrator'],
  UPDATE_NOTES: ['Inventory Manager', 'Financial Manager', 'System Administrator'],
  MANAGE_TASKS: ['Inventory Manager', 'Financial Manager', 'System Administrator'],
  CLOSE: ['Inventory Manager', 'Financial Manager', 'System Administrator'],
  REOPEN: ['Financial Manager', 'System Administrator'],
  CANCEL: ['System Administrator']
}

export async function hasPermission(
  permission: keyof typeof PERMISSIONS
): Promise<boolean> {
  const session = await getServerSession()

  if (!session || !session.user) {
    return false
  }

  const userRole = session.user.role
  return PERMISSIONS[permission].includes(userRole)
}

export async function requirePermission(
  permission: keyof typeof PERMISSIONS
): Promise<void> {
  const hasAccess = await hasPermission(permission)

  if (!hasAccess) {
    throw new Error('Insufficient permissions')
  }
}
```

**Usage in Server Actions**:

```typescript
// actions.ts
export async function closePeriod(periodId: string) {
  'use server'

  // Permission check at start of every action
  await requirePermission('CLOSE')

  // ... rest of implementation ...
}
```

---

### 8.2 Row-Level Security (RLS)

**Database Policies**:

```sql
-- Enable RLS on period_end table
ALTER TABLE period_end ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view periods for their authorized locations
CREATE POLICY period_end_view_policy ON period_end
  FOR SELECT
  USING (
    -- System Admins and Financial Managers can see all periods
    current_user_role() IN ('System Administrator', 'Financial Manager')
    OR
    -- Other users can only see periods for their locations
    EXISTS (
      SELECT 1 FROM user_location_access ula
      WHERE ula.user_id = current_user_id()
        AND ula.location_id = period_end.location_id
    )
  );

-- Policy: Only authorized users can create periods
CREATE POLICY period_end_create_policy ON period_end
  FOR INSERT
  WITH CHECK (
    current_user_role() IN ('Inventory Manager', 'Financial Manager', 'System Administrator')
  );

-- Policy: Only authorized users can update periods
CREATE POLICY period_end_update_policy ON period_end
  FOR UPDATE
  USING (
    current_user_role() IN ('Inventory Manager', 'Financial Manager', 'System Administrator')
  )
  WITH CHECK (
    current_user_role() IN ('Inventory Manager', 'Financial Manager', 'System Administrator')
  );

-- Policy: Only System Administrators can delete periods
CREATE POLICY period_end_delete_policy ON period_end
  FOR DELETE
  USING (
    current_user_role() = 'System Administrator'
  );
```

**Note**: If Period End is organization-wide (not location-specific), RLS policies would be simplified to check only user roles, not location access.

---

### 8.3 Activity Logging and Audit Trail

**Logging Strategy**:

Every Period End action is logged to the `period_activity` table with:
- Action type (Create, StatusChange, TaskComplete, Close, Reopen, Cancel, NotesUpdate)
- Timestamp (immutable, server-generated)
- User ID and name
- IP address and user agent (for security audit)
- From/To status (for status changes)
- Reason (for Re-open and Cancel actions)
- Field changes (for Update actions)

**Implementation**:

```typescript
// lib/activity-logger.ts
export async function logPeriodActivity({
  periodEndId,
  actionType,
  userId,
  userName,
  fromStatus,
  toStatus,
  taskName,
  reason,
  notes,
  fieldChanges
}: LogActivityParams) {
  try {
    await prisma.periodActivity.create({
      data: {
        periodEndId,
        actionType,
        actionDate: new Date(),
        actionBy: userId,
        actionByName: userName,
        ipAddress: getClientIp(),
        userAgent: getUserAgent(),
        fromStatus,
        toStatus,
        taskName,
        reason,
        notes,
        fieldChanges: fieldChanges ? JSON.stringify(fieldChanges) : null,
        createdDate: new Date()
      }
    })
  } catch (error) {
    console.error('Activity logging error:', error)
    // Log to error monitoring service (e.g., Sentry)
    // Do NOT throw error - activity logging failure should not block operations
  }
}
```

**Activity Log Display**:

```typescript
// components/period-activity-log.tsx
'use client'

export function PeriodActivityLog({
  periodId,
  initialActivities
}: {
  periodId: string
  initialActivities: PeriodActivity[]
}) {
  return (
    <div className="activity-log">
      <Timeline>
        {initialActivities.map(activity => (
          <TimelineItem key={activity.id}>
            <TimelineIcon>
              {getActionIcon(activity.actionType)}
            </TimelineIcon>

            <TimelineContent>
              <div className="activity-header">
                <span className="action-type">
                  {formatActionType(activity.actionType)}
                </span>
                <span className="timestamp">
                  {formatDistanceToNow(activity.actionDate, { addSuffix: true })}
                </span>
              </div>

              <div className="activity-details">
                <p>
                  <strong>{activity.actionByName}</strong>
                  {' '}
                  {getActionDescription(activity)}
                </p>

                {activity.reason && (
                  <div className="reason">
                    <strong>Reason:</strong> {activity.reason}
                  </div>
                )}

                {activity.fieldChanges && (
                  <div className="field-changes">
                    <strong>Changes:</strong>
                    <ul>
                      {JSON.parse(activity.fieldChanges).map((change: any) => (
                        <li key={change.field}>
                          <code>{change.field}</code>:
                          <span className="old-value">{change.oldValue}</span>
                          {' → '}
                          <span className="new-value">{change.newValue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="activity-meta">
                <span className="ip-address">IP: {activity.ipAddress}</span>
                <span className="user-agent" title={activity.userAgent}>
                  {getBrowserInfo(activity.userAgent)}
                </span>
              </div>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  )
}
```

---

### 8.4 CSRF Protection

**Next.js Server Actions** provide built-in CSRF protection:
- Automatic CSRF token generation and validation
- Token sent with every Server Action request
- No manual implementation required

**Additional Security Headers**:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
}
```

---

## 9. Performance Optimization

### 9.1 Database Indexing

**Indexes for Period End Module**:

```sql
-- Primary key index (automatic)
-- period_end.id (UUID primary key)

-- Composite index for period lookup by date
CREATE INDEX idx_period_end_date_range ON period_end (start_date, end_date);

-- Index for status filtering
CREATE INDEX idx_period_end_status ON period_end (status);

-- Index for period ID lookup (unique)
CREATE UNIQUE INDEX idx_period_end_period_id ON period_end (period_id);

-- Composite index for common query pattern (list page)
CREATE INDEX idx_period_end_list_query ON period_end (status, start_date DESC);

-- Foreign key indexes
CREATE INDEX idx_period_task_period_end_id ON period_task (period_end_id);
CREATE INDEX idx_period_activity_period_end_id ON period_activity (period_end_id);

-- Index for task completion status
CREATE INDEX idx_period_task_status ON period_task (period_end_id, status);

-- Index for activity log queries
CREATE INDEX idx_period_activity_action_date ON period_activity (period_end_id, action_date DESC);
```

---

### 9.2 Query Optimization

**Efficient Period List Query**:

```typescript
// Optimized query with selective field loading
const periods = await prisma.periodEnd.findMany({
  where: buildWhereClause(filters),
  select: {
    id: true,
    periodId: true,
    periodName: true,
    startDate: true,
    endDate: true,
    status: true,
    completedBy: true,
    completedAt: true,
    notes: true,
    // Aggregate task completion count (efficient)
    tasks: {
      select: { status: true }
    },
    // Count adjustments without loading all data
    _count: {
      select: { adjustments: true }
    }
  },
  orderBy: { startDate: 'desc' },
  take: pageSize,
  skip: (page - 1) * pageSize
})

// Process task completion percentage on client
const periodsWithMetrics = periods.map(period => ({
  ...period,
  completedTasks: period.tasks.filter(t => t.status === 'completed').length,
  totalTasks: period.tasks.length,
  completionPercentage:
    (period.tasks.filter(t => t.status === 'completed').length / period.tasks.length) * 100
}))
```

**Efficient Period Detail Query**:

```typescript
// Single query with all necessary data
const period = await prisma.periodEnd.findUnique({
  where: { id: params.id },
  include: {
    // Include tasks with user info
    tasks: {
      orderBy: { sequence: 'asc' },
      include: {
        completedByUser: {
          select: { name: true, email: true }
        }
      }
    },
    // Limit activity log to recent 100 entries
    activityLog: {
      orderBy: { actionDate: 'desc' },
      take: 100,
      include: {
        actionByUser: {
          select: { name: true, email: true }
        }
      }
    },
    // Include user info for audit
    createdByUser: { select: { name: true, email: true } },
    completedByUser: { select: { name: true, email: true } },
    reopenedByUser: { select: { name: true, email: true } }
  }
})
```

---

### 9.3 Caching Strategy

**React Query Cache Configuration**:

```typescript
// App-level query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds - data fresh for 30s
      gcTime: 5 * 60_000, // 5 minutes - cache retained for 5 min
      refetchOnWindowFocus: true, // Refetch when window gains focus
      refetchOnReconnect: true, // Refetch when network reconnects
      retry: 1 // Retry failed queries once
    }
  }
})

// Period-specific cache config
export function usePeriodList(filters: PeriodFilters) {
  return useQuery({
    queryKey: ['periods', filters],
    queryFn: fetchPeriods,
    staleTime: 30_000, // List data fresh for 30s
    gcTime: 5 * 60_000 // Cache retained for 5 min
  })
}

export function usePeriodDetail(periodId: string) {
  return useQuery({
    queryKey: ['period', periodId],
    queryFn: () => fetchPeriodDetail(periodId),
    staleTime: 30_000, // Detail data fresh for 30s
    gcTime: 10 * 60_000 // Detail cache retained for 10 min (longer)
  })
}
```

**Server-Side Caching (Next.js)**:

```typescript
// Server Component with caching
export const revalidate = 30 // Revalidate every 30 seconds

async function PeriodListPage({ searchParams }) {
  // Next.js automatically caches this fetch for 30 seconds
  const periods = await prisma.periodEnd.findMany({
    // ... query ...
  })

  return <PeriodListTable initialData={periods} />
}
```

**Cache Invalidation**:

```typescript
// Invalidate cache after mutations
import { revalidatePath } from 'next/cache'

export async function createPeriod(data: CreatePeriodFormData) {
  // ... create period ...

  // Invalidate list page cache
  revalidatePath('/inventory-management/period-end')

  return result
}

export async function closePeriod(periodId: string) {
  // ... close period ...

  // Invalidate both list and detail page caches
  revalidatePath('/inventory-management/period-end')
  revalidatePath(`/inventory-management/period-end/${periodId}`)

  return result
}
```

---

### 9.4 Component Optimization

**React Server Components (RSC)**:
- Default for all pages (server-side rendering)
- Reduces client-side JavaScript bundle
- Faster initial page load

**Client Components Only When Needed**:
- Interactive elements (filters, forms, buttons)
- State management (Zustand, React Query)
- Event handlers (onClick, onChange)

**Code Splitting**:

```typescript
// Lazy load dialog components (reduce initial bundle)
const CreatePeriodDialog = dynamic(
  () => import('./components/create-period-dialog'),
  { ssr: false }
)

const ClosePeriodDialog = dynamic(
  () => import('./components/close-period-dialog'),
  { ssr: false }
)

const ReopenPeriodDialog = dynamic(
  () => import('./components/reopen-period-dialog'),
  { ssr: false }
)
```

**Memoization**:

```typescript
// Memoize expensive calculations
const completionPercentage = useMemo(() => {
  const completed = period.tasks.filter(t => t.status === 'completed').length
  return (completed / period.tasks.length) * 100
}, [period.tasks])

// Memoize filtered data
const filteredAdjustments = useMemo(() => {
  return adjustments.filter(adj => {
    if (filters.type && adj.type !== filters.type) return false
    if (filters.location && adj.locationId !== filters.location) return false
    return true
  })
}, [adjustments, filters])
```

---

## 10. Error Handling

### 10.1 Server Action Error Handling

**Consistent Error Response Format**:

```typescript
// Response type for all server actions
interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Example server action with error handling
export async function closePeriod(periodId: string): Promise<ActionResponse> {
  'use server'

  try {
    // Permission check
    await requirePermission('CLOSE')

    // Validation
    const period = await prisma.periodEnd.findUnique({
      where: { id: periodId },
      include: { tasks: true }
    })

    if (!period) {
      return { success: false, error: 'Period not found' }
    }

    if (period.status !== 'closing') {
      return {
        success: false,
        error: `Cannot close period with status '${period.status}'. Must be 'closing'.`
      }
    }

    const incompleteTasks = period.tasks.filter(t => t.status !== 'completed')
    if (incompleteTasks.length > 0) {
      return {
        success: false,
        error: `${incompleteTasks.length} task(s) not completed`
      }
    }

    // Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // ... transaction logic ...
    })

    revalidatePath('/inventory-management/period-end')
    return {
      success: true,
      data: result,
      message: 'Period closed successfully'
    }

  } catch (error) {
    console.error('Close period error:', error)

    // Log to monitoring service
    await logErrorToMonitoring({
      action: 'closePeriod',
      periodId,
      error,
      userId: session?.user?.id
    })

    // Return user-friendly error
    return {
      success: false,
      error: 'Failed to close period. Please try again or contact support.'
    }
  }
}
```

---

### 10.2 Client-Side Error Handling

**React Query Error Handling**:

```typescript
// Mutation with error handling
const { mutate: closePeriod, isPending, error } = useMutation({
  mutationFn: closePeriodAction,
  onSuccess: (result) => {
    if (result.success) {
      toast.success(result.message)
      queryClient.invalidateQueries({ queryKey: ['periods'] })
      router.push('/inventory-management/period-end')
    } else {
      toast.error(result.error)
    }
  },
  onError: (error) => {
    toast.error('Network error. Please check your connection and try again.')
  }
})
```

**Error Boundary Component**:

```typescript
// components/error-boundary.tsx
'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <div className="error-boundary">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <h2>Something went wrong</h2>
      <p>{error.message || 'An unexpected error occurred'}</p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  )
}
```

**Page-Level Error Handling**:

```typescript
// app/(main)/inventory-management/period-end/error.tsx
'use client'

export default function PeriodEndError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundary error={error} reset={reset} />
}
```

---

### 10.3 Validation Error Handling

**Zod Validation Errors**:

```typescript
// Form component with validation error display
export function CreatePeriodDialog() {
  const form = useForm<CreatePeriodFormData>({
    resolver: zodResolver(CreatePeriodSchema),
    defaultValues: { /* ... */ }
  })

  const onSubmit = async (data: CreatePeriodFormData) => {
    const result = await createPeriodAction(data)

    if (!result.success) {
      // Display server-side error as form error
      form.setError('root', {
        type: 'server',
        message: result.error
      })
    } else {
      toast.success(result.message)
      router.push(`/inventory-management/period-end/${result.data.id}`)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}

        {form.formState.errors.root && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit">Create Period</Button>
      </form>
    </Form>
  )
}
```

---

## 11. Testing Strategy

### 11.1 Unit Testing (Vitest)

**Test: Period Validators**

```typescript
// lib/__tests__/period-validators.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { validatePhysicalCountCompletion, validateTransactionPostingAllowed } from '../period-validators'

describe('Period Validators', () => {
  describe('validatePhysicalCountCompletion', () => {
    it('should return valid when all counts completed', async () => {
      const period = {
        id: '1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      }

      const result = await validatePhysicalCountCompletion(period)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return invalid when counts incomplete', async () => {
      // Mock incomplete counts
      const period = {
        id: '1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      }

      const result = await validatePhysicalCountCompletion(period)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('physical count(s) not completed')
    })
  })

  describe('validateTransactionPostingAllowed', () => {
    it('should allow posting to open period', async () => {
      const result = await validateTransactionPostingAllowed(
        new Date('2024-01-15'),
        'location-1'
      )

      expect(result.allowed).toBe(true)
    })

    it('should prevent posting to closed period', async () => {
      const result = await validateTransactionPostingAllowed(
        new Date('2023-12-15'), // Closed period
        'location-1'
      )

      expect(result.allowed).toBe(false)
      expect(result.error).toContain('Period')
      expect(result.error).toContain('is closed')
    })
  })
})
```

**Test: Server Actions**

```typescript
// actions/__tests__/period-actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { closePeriod, reopenPeriod, markTaskComplete } from '../actions'

describe('Period Actions', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
  })

  describe('closePeriod', () => {
    it('should successfully close period when valid', async () => {
      // Mock valid period
      const result = await closePeriod('period-1')

      expect(result.success).toBe(true)
      expect(result.message).toContain('closed successfully')
    })

    it('should fail when checklist incomplete', async () => {
      // Mock period with incomplete tasks
      const result = await closePeriod('period-2')

      expect(result.success).toBe(false)
      expect(result.error).toContain('task(s) not completed')
    })

    it('should fail when status not closing', async () => {
      // Mock period with wrong status (not 'closing')
      const result = await closePeriod('period-3')

      expect(result.success).toBe(false)
      expect(result.error).toContain('closing')
    })
  })

  describe('reopenPeriod', () => {
    it('should successfully reopen period with valid reason', async () => {
      const reason = 'A'.repeat(100) // 100 character reason

      const result = await reopenPeriod('period-1', reason)

      expect(result.success).toBe(true)
      expect(result.message).toContain('re-opened successfully')
    })

    it('should fail when reason too short', async () => {
      const reason = 'Too short' // Less than 100 characters

      const result = await reopenPeriod('period-1', reason)

      expect(result.success).toBe(false)
      expect(result.error).toContain('100 characters')
    })

    it('should fail when not most recent closed period', async () => {
      const reason = 'A'.repeat(100)

      const result = await reopenPeriod('period-old', reason)

      expect(result.success).toBe(false)
      expect(result.error).toContain('most recent')
    })
  })
})
```

---

### 11.2 Integration Testing (Vitest + Prisma)

**Test: Period Creation Flow**

```typescript
// __tests__/integration/period-creation.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { createPeriod } from '@/app/(main)/inventory-management/period-end/actions'

const prisma = new PrismaClient()

describe('Period Creation Integration', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.periodActivity.deleteMany()
    await prisma.periodTask.deleteMany()
    await prisma.periodEnd.deleteMany()
  })

  afterEach(async () => {
    await prisma.$disconnect()
  })

  it('should create period with default tasks and activity log', async () => {
    const formData = {
      periodId: 'PE-2024-01',
      periodName: 'January 2024',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      notes: 'Test period'
    }

    const result = await createPeriod(formData)

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()

    // Verify period created
    const period = await prisma.periodEnd.findUnique({
      where: { id: result.data.id },
      include: {
        tasks: true,
        activityLog: true
      }
    })

    expect(period).toBeDefined()
    expect(period?.status).toBe('open')
    expect(period?.tasks).toHaveLength(4)
    expect(period?.activityLog).toHaveLength(1)
    expect(period?.activityLog[0].actionType).toBe('Create')
  })

  it('should prevent creating future period when one exists', async () => {
    // Create first period
    await createPeriod({
      periodId: 'PE-2024-02',
      periodName: 'February 2024',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-29')
    })

    // Attempt to create January period (earlier)
    const result = await createPeriod({
      periodId: 'PE-2024-01',
      periodName: 'January 2024',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Future periods already exist')
  })
})
```

---

### 11.3 End-to-End Testing (Playwright)

**Test: Period Closure Workflow**

```typescript
// e2e/period-end.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Period End Closure Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Inventory Manager
    await page.goto('/login')
    await page.fill('input[name='email']', 'manager@example.com')
    await page.fill('input[name='password']', 'password')
    await page.click('button[type='submit']')

    // Navigate to Period End page
    await page.goto('/inventory-management/period-end')
  })

  test('should complete period closure workflow', async ({ page }) => {
    // Click on "Closing" period
    await page.click('tr[data-status='closing']')

    // Navigate to Checklist tab
    await page.click('button[data-tab='checklist']')

    // Mark all tasks as complete
    const taskRows = await page.locator('.task-row').all()
    for (const row of taskRows) {
      await row.locator('button[aria-label='Mark Complete']').click()
      await expect(row.locator('.status-badge')).toHaveText('Completed')
    }

    // Click "Complete Period End" button
    await page.click('button:has-text("Complete Period End")')

    // Confirm in dialog
    await page.click('dialog button:has-text("Confirm Close")')

    // Verify success message
    await expect(page.locator('.toast')).toContainText('closed successfully')

    // Verify status updated
    await expect(page.locator('.status-badge')).toHaveText('Closed')

    // Verify "Complete" button hidden
    await expect(page.locator('button:has-text("Complete Period End")')).not.toBeVisible()

    // Verify "Re-open" button visible (if authorized)
    await expect(page.locator('button:has-text("Re-open Period")')).toBeVisible()
  })

  test('should prevent closure with incomplete tasks', async ({ page }) => {
    // Click on "Closing" period
    await page.click('tr[data-status='closing']')

    // Navigate to Checklist tab
    await page.click('button[data-tab='checklist']')

    // Mark only 2 out of 4 tasks complete
    const taskRows = await page.locator('.task-row').all()
    await taskRows[0].locator('button[aria-label='Mark Complete']').click()
    await taskRows[1].locator('button[aria-label='Mark Complete']').click()

    // Click "Complete Period End" button
    await page.click('button:has-text("Complete Period End")')

    // Confirm in dialog
    await page.click('dialog button:has-text("Confirm Close")')

    // Verify error message
    await expect(page.locator('.toast')).toContainText('task(s) not completed')

    // Verify status NOT updated
    await expect(page.locator('.status-badge')).toHaveText('Closing')
  })

  test('should complete re-open workflow', async ({ page }) => {
    // Click on most recent "Closed" period
    await page.click('tr[data-status='closed']:first-child')

    // Click "Re-open Period" button
    await page.click('button:has-text("Re-open Period")')

    // Enter reason (100+ characters)
    await page.fill(
      'textarea[name='reason']',
      'Re-opening this period to correct inventory adjustment errors discovered during audit review. ' +
      'Multiple discrepancies identified that require correction before finalizing period close.'
    )

    // Confirm re-open
    await page.click('dialog button:has-text("Re-open Period")')

    // Verify success message
    await expect(page.locator('.toast')).toContainText('re-opened successfully')

    // Verify status updated
    await expect(page.locator('.status-badge')).toHaveText('Open')
  })
})
```

---

## 12. Deployment

### 12.1 Environment Variables

```bash
# .env.production
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXTAUTH_URL="https://app.company.com"
NEXTAUTH_SECRET="[generated-secret]"

# Email Configuration (for re-open notifications)
SMTP_HOST="smtp.company.com"
SMTP_PORT="587"
SMTP_USER="noreply@company.com"
SMTP_PASSWORD="[smtp-password]"
SMTP_FROM="noreply@company.com"

# Monitoring & Logging
SENTRY_DSN="https://[key]@sentry.io/[project]"
LOG_LEVEL="info"

# Feature Flags
ENABLE_PERIOD_END="true"
ENABLE_PERIOD_REOPEN="true"
```

---

### 12.2 Database Migration

**Prisma Migration Steps**:

```bash
# 1. Create migration for period_end tables
npx prisma migrate dev --name add-period-end-tables

# 2. Review generated SQL
cat prisma/migrations/[timestamp]_add-period-end-tables/migration.sql

# 3. Deploy to production
npx prisma migrate deploy
```

**Migration SQL** (example):

```sql
-- Create period_end table
CREATE TABLE period_end (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id VARCHAR(20) NOT NULL UNIQUE,
  period_name VARCHAR(50) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  completed_by UUID,
  completed_at TIMESTAMP,
  notes TEXT,
  original_completed_by UUID,
  original_completed_at TIMESTAMP,
  reopened_by UUID,
  reopened_at TIMESTAMP,
  reopen_reason TEXT,
  created_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL,
  modified_date TIMESTAMP NOT NULL DEFAULT NOW(),
  modified_by UUID NOT NULL,
  CONSTRAINT fk_period_end_completed_by FOREIGN KEY (completed_by) REFERENCES users(id),
  CONSTRAINT fk_period_end_reopened_by FOREIGN KEY (reopened_by) REFERENCES users(id),
  CONSTRAINT fk_period_end_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_period_end_modified_by FOREIGN KEY (modified_by) REFERENCES users(id),
  CONSTRAINT chk_period_end_status CHECK (status IN ('open', 'closing', 'closed', 'reopened'))
);

-- Create period_task table
CREATE TABLE period_task (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_end_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sequence INT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  completed_by UUID,
  completed_at TIMESTAMP,
  validation_type VARCHAR(50),
  validation_criteria TEXT,
  created_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL,
  modified_date TIMESTAMP NOT NULL DEFAULT NOW(),
  modified_by UUID NOT NULL,
  CONSTRAINT fk_period_task_period_end_id FOREIGN KEY (period_end_id) REFERENCES period_end(id) ON DELETE CASCADE,
  CONSTRAINT fk_period_task_completed_by FOREIGN KEY (completed_by) REFERENCES users(id),
  CONSTRAINT fk_period_task_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_period_task_modified_by FOREIGN KEY (modified_by) REFERENCES users(id),
  CONSTRAINT chk_period_task_status CHECK (status IN ('pending', 'completed'))
);

-- Create period_activity table
CREATE TABLE period_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_end_id UUID NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_date TIMESTAMP NOT NULL DEFAULT NOW(),
  action_by UUID NOT NULL,
  action_by_name VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  from_status VARCHAR(20),
  to_status VARCHAR(20),
  task_name VARCHAR(100),
  reason TEXT,
  notes TEXT,
  field_changes JSONB,
  created_date TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_period_activity_period_end_id FOREIGN KEY (period_end_id) REFERENCES period_end(id) ON DELETE CASCADE,
  CONSTRAINT fk_period_activity_action_by FOREIGN KEY (action_by) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_period_end_date_range ON period_end (start_date, end_date);
CREATE INDEX idx_period_end_status ON period_end (status);
CREATE UNIQUE INDEX idx_period_end_period_id ON period_end (period_id);
CREATE INDEX idx_period_end_list_query ON period_end (status, start_date DESC);
CREATE INDEX idx_period_task_period_end_id ON period_task (period_end_id);
CREATE INDEX idx_period_activity_period_end_id ON period_activity (period_end_id);
CREATE INDEX idx_period_task_status ON period_task (period_end_id, status);
CREATE INDEX idx_period_activity_action_date ON period_activity (period_end_id, action_date DESC);

-- Enable Row-Level Security
ALTER TABLE period_end ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (if needed - see section 8.2)
```

---

### 12.3 Deployment Checklist

**Pre-Deployment**:
- [ ] All tests passing (unit, integration, E2E)
- [ ] Database migration reviewed and tested on staging
- [ ] Environment variables configured in production
- [ ] Feature flags configured correctly
- [ ] RBAC permissions configured for all roles
- [ ] Email templates configured for re-open notifications
- [ ] Monitoring and logging configured (Sentry, CloudWatch)

**Deployment Steps**:
1. Deploy database migration to production
2. Deploy Next.js application to production
3. Verify deployment health checks pass
4. Test Period End list page load performance
5. Test Period End creation workflow
6. Test Period End closure workflow
7. Test Period End re-open workflow (Financial Manager role)
8. Verify activity logging working correctly
9. Verify email notifications sent on re-open

**Post-Deployment**:
- [ ] Monitor error rates in production (Sentry)
- [ ] Monitor page load performance (Core Web Vitals)
- [ ] Verify no database performance degradation
- [ ] Collect user feedback on Period End workflows
- [ ] Document any issues or edge cases discovered

---

## 13. Future Enhancements

### 13.1 Planned: Period End Snapshots

**Reference Document**: [SM-period-end-snapshots.md](../../shared-methods/SM-period-end-snapshots.md)

**Current Implementation** (Transaction-Based):
- Period boundaries enforced through transaction posting validation
- No persistent snapshot records created
- Period CLOSE/OPEN represented as special transactions with in_qty/out_qty

**Future Implementation** (Snapshot-Based):
- **FIFO Snapshots**: Lot-level opening/closing balances with lot tracking
- **Periodic Average Snapshots**: Aggregate balances with weighted average costs
- **Snapshot Generation**: Automatic snapshot creation on period close
- **Snapshot Validation**: Verify snapshot integrity and balance reconciliation
- **Snapshot Reports**: Period-to-period comparison, variance analysis

**Implementation Impact**:
- New `period_snapshot` table (lot-level records)
- New `period_snapshot_summary` table (aggregate records)
- Enhanced Period Closure workflow to generate snapshots
- New snapshot generation service
- New snapshot validation service
- New snapshot reconciliation reports

**Timeline**: Phase 2 implementation (Q2 2025)

---

### 13.2 Configurable Checklist Tasks

**Current Implementation**:
- 4 default tasks hardcoded in period creation
- Tasks cannot be customized per organization

**Future Enhancement**:
- Admin interface to configure default checklist tasks
- Organization-level checklist template management
- Period-specific task customization
- Task dependencies and prerequisites
- Conditional tasks based on period characteristics

**Implementation**:
- New `checklist_template` table
- New `checklist_template_task` table
- Admin UI for template management
- Enhanced period creation to use templates

---

### 13.3 Period Summary Dashboard

**Reference**: FR-PE-010 (Future Enhancement)

**Planned Features**:
- Period-to-period comparison metrics
- Inventory value trends over time
- Adjustment summary statistics
- Physical count variance analysis
- Period closure time tracking
- Task completion rate metrics

**Implementation**:
- New dashboard page route
- Aggregate query service for metrics
- Chart components (Recharts or Chart.js)
- Export to Excel functionality

---

## 14. Appendices

### 14.1 TypeScript Interfaces (Full Definitions)

```typescript
// types/period-end.ts

export interface PeriodEnd {
  id: string
  periodId: string                    // PE-YYYY-MM format
  periodName: string                  // "January 2024"
  startDate: Date
  endDate: Date
  status: 'open' | 'closing' | 'closed' | 'reopened'
  completedBy: string | null
  completedAt: Date | null
  notes: string | null
  originalCompletedBy: string | null  // For re-open tracking
  originalCompletedAt: Date | null
  reopenedBy: string | null
  reopenedAt: Date | null
  reopenReason: string | null
  createdDate: Date
  createdBy: string
  modifiedDate: Date
  modifiedBy: string

  // Relations
  tasks?: PeriodTask[]
  activityLog?: PeriodActivity[]
  completedByUser?: User
  reopenedByUser?: User
  createdByUser?: User
  modifiedByUser?: User
}

export interface PeriodTask {
  id: string
  periodEndId: string
  name: string
  description: string | null
  sequence: number
  isRequired: boolean
  status: 'pending' | 'completed'
  completedBy: string | null
  completedAt: Date | null
  validationType: string | null
  validationCriteria: string | null
  createdDate: Date
  createdBy: string
  modifiedDate: Date
  modifiedBy: string

  // Relations
  period?: PeriodEnd
  completedByUser?: User
}

export interface PeriodActivity {
  id: string
  periodEndId: string
  actionType: 'Create' | 'StatusChange' | 'TaskComplete' | 'Close' | 'Reopen' | 'Cancel' | 'NotesUpdate'
  actionDate: Date
  actionBy: string
  actionByName: string
  ipAddress: string | null
  userAgent: string | null
  fromStatus: string | null
  toStatus: string | null
  taskName: string | null
  reason: string | null
  notes: string | null
  fieldChanges: FieldChange[] | null
  createdDate: Date

  // Relations
  period?: PeriodEnd
  actionByUser?: User
}

export interface FieldChange {
  field: string
  oldValue: string
  newValue: string
}

export interface PeriodFilters {
  startDate: Date | null
  endDate: Date | null
  status: string[]
  searchTerm: string
  page: number
  pageSize: number
  sortBy: 'startDate' | 'endDate' | 'status' | 'periodId'
  sortDirection: 'asc' | 'desc'
}

export interface CreatePeriodFormData {
  periodId: string
  periodName: string
  startDate: Date
  endDate: Date
  notes?: string
}

export interface ReopenPeriodFormData {
  reason: string
}

export interface UpdateNotesFormData {
  notes: string
}
```

---

### 14.2 Prisma Schema (Full Definition)

```prisma
// prisma/schema.prisma

model PeriodEnd {
  id                    String            @id @default(uuid()) @db.Uuid
  periodId              String            @unique @map("period_id") @db.VarChar(20)
  periodName            String            @map("period_name") @db.VarChar(50)
  startDate             DateTime          @map("start_date") @db.Timestamp(6)
  endDate               DateTime          @map("end_date") @db.Timestamp(6)
  status                String            @default("open") @db.VarChar(20)
  completedBy           String?           @map("completed_by") @db.Uuid
  completedAt           DateTime?         @map("completed_at") @db.Timestamp(6)
  notes                 String?           @db.Text
  originalCompletedBy   String?           @map("original_completed_by") @db.Uuid
  originalCompletedAt   DateTime?         @map("original_completed_at") @db.Timestamp(6)
  reopenedBy            String?           @map("reopened_by") @db.Uuid
  reopenedAt            DateTime?         @map("reopened_at") @db.Timestamp(6)
  reopenReason          String?           @map("reopen_reason") @db.Text
  createdDate           DateTime          @default(now()) @map("created_date") @db.Timestamp(6)
  createdBy             String            @map("created_by") @db.Uuid
  modifiedDate          DateTime          @default(now()) @updatedAt @map("modified_date") @db.Timestamp(6)
  modifiedBy            String            @map("modified_by") @db.Uuid

  // Relations
  tasks                 PeriodTask[]
  activityLog           PeriodActivity[]
  completedByUser       User?             @relation("PeriodCompletedBy", fields: [completedBy], references: [id])
  reopenedByUser        User?             @relation("PeriodReopenedBy", fields: [reopenedBy], references: [id])
  createdByUser         User              @relation("PeriodCreatedBy", fields: [createdBy], references: [id])
  modifiedByUser        User              @relation("PeriodModifiedBy", fields: [modifiedBy], references: [id])

  @@map("period_end")
  @@index([startDate, endDate], name: "idx_period_end_date_range")
  @@index([status], name: "idx_period_end_status")
  @@index([status, startDate(sort: Desc)], name: "idx_period_end_list_query")
}

model PeriodTask {
  id                    String            @id @default(uuid()) @db.Uuid
  periodEndId           String            @map("period_end_id") @db.Uuid
  name                  String            @db.VarChar(100)
  description           String?           @db.Text
  sequence              Int               @db.Integer
  isRequired            Boolean           @default(true) @map("is_required")
  status                String            @default("pending") @db.VarChar(20)
  completedBy           String?           @map("completed_by") @db.Uuid
  completedAt           DateTime?         @map("completed_at") @db.Timestamp(6)
  validationType        String?           @map("validation_type") @db.VarChar(50)
  validationCriteria    String?           @map("validation_criteria") @db.Text
  createdDate           DateTime          @default(now()) @map("created_date") @db.Timestamp(6)
  createdBy             String            @map("created_by") @db.Uuid
  modifiedDate          DateTime          @default(now()) @updatedAt @map("modified_date") @db.Timestamp(6)
  modifiedBy            String            @map("modified_by") @db.Uuid

  // Relations
  period                PeriodEnd         @relation(fields: [periodEndId], references: [id], onDelete: Cascade)
  completedByUser       User?             @relation("TaskCompletedBy", fields: [completedBy], references: [id])
  createdByUser         User              @relation("TaskCreatedBy", fields: [createdBy], references: [id])
  modifiedByUser        User              @relation("TaskModifiedBy", fields: [modifiedBy], references: [id])

  @@map("period_task")
  @@index([periodEndId], name: "idx_period_task_period_end_id")
  @@index([periodEndId, status], name: "idx_period_task_status")
}

model PeriodActivity {
  id                    String            @id @default(uuid()) @db.Uuid
  periodEndId           String            @map("period_end_id") @db.Uuid
  actionType            String            @map("action_type") @db.VarChar(50)
  actionDate            DateTime          @default(now()) @map("action_date") @db.Timestamp(6)
  actionBy              String            @map("action_by") @db.Uuid
  actionByName          String            @map("action_by_name") @db.VarChar(100)
  ipAddress             String?           @map("ip_address") @db.VarChar(45)
  userAgent             String?           @map("user_agent") @db.Text
  fromStatus            String?           @map("from_status") @db.VarChar(20)
  toStatus              String?           @map("to_status") @db.VarChar(20)
  taskName              String?           @map("task_name") @db.VarChar(100)
  reason                String?           @db.Text
  notes                 String?           @db.Text
  fieldChanges          Json?             @map("field_changes") @db.JsonB
  createdDate           DateTime          @default(now()) @map("created_date") @db.Timestamp(6)

  // Relations
  period                PeriodEnd         @relation(fields: [periodEndId], references: [id], onDelete: Cascade)
  actionByUser          User              @relation("ActivityActionBy", fields: [actionBy], references: [id])

  @@map("period_activity")
  @@index([periodEndId], name: "idx_period_activity_period_end_id")
  @@index([periodEndId, actionDate(sort: Desc)], name: "idx_period_activity_action_date")
}
```

---

### 14.3 Database Constraints Summary

| Constraint Type | Table | Constraint | Purpose |
|----------------|-------|------------|---------|
| Primary Key | period_end | PK_period_end_id | Unique identifier |
| Unique | period_end | UK_period_end_period_id | Prevent duplicate period IDs (PE-YYYY-MM) |
| Check | period_end | CHK_period_end_status | Validate status enum values |
| Check | period_end | CHK_period_end_dates | Ensure end_date >= start_date |
| Foreign Key | period_end | FK_period_end_completed_by | Reference users table |
| Foreign Key | period_end | FK_period_end_reopened_by | Reference users table |
| Foreign Key | period_task | FK_period_task_period_end_id | Reference period_end table (CASCADE) |
| Check | period_task | CHK_period_task_status | Validate status enum values |
| Foreign Key | period_activity | FK_period_activity_period_end_id | Reference period_end table (CASCADE) |
| Trigger | period_end | TRG_single_closing | Enforce single "closing" period |
| Trigger | inventory_transaction | TRG_check_period_before_post | Prevent posting to closed periods |

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Period End sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/inventory-management/period-end)']
    CreatePage['Create Page<br>(/inventory-management/period-end/new)']
    DetailPage["Detail Page<br>(/inventory-management/period-end/[id])"]
    EditPage["Edit Page<br>(/inventory-management/period-end/[id]/edit)"]

    %% List Page Tabs
    ListPage --> ListTab1['Tab: All Items']
    ListPage --> ListTab2['Tab: Active']
    ListPage --> ListTab3['Tab: Archived']

    %% List Page Dialogues
    ListPage -.-> ListDialog1['Dialog: Quick Create']
    ListPage -.-> ListDialog2['Dialog: Bulk Actions']
    ListPage -.-> ListDialog3['Dialog: Export']
    ListPage -.-> ListDialog4['Dialog: Filter']

    %% Detail Page Tabs
    DetailPage --> DetailTab1['Tab: Overview']
    DetailPage --> DetailTab2['Tab: History']
    DetailPage --> DetailTab3['Tab: Activity Log']

    %% Detail Page Dialogues
    DetailPage -.-> DetailDialog1['Dialog: Edit']
    DetailPage -.-> DetailDialog2['Dialog: Delete Confirm']
    DetailPage -.-> DetailDialog3['Dialog: Status Change']

    %% Create/Edit Dialogues
    CreatePage -.-> CreateDialog1['Dialog: Cancel Confirm']
    CreatePage -.-> CreateDialog2['Dialog: Save Draft']

    EditPage -.-> EditDialog1['Dialog: Discard Changes']
    EditPage -.-> EditDialog2['Dialog: Save Draft']

    %% Navigation Flow
    ListPage --> DetailPage
    ListPage --> CreatePage
    DetailPage --> EditPage
    CreatePage --> DetailPage
    EditPage --> DetailPage

    style ListPage fill:#e1f5ff
    style CreatePage fill:#fff4e1
    style DetailPage fill:#e8f5e9
    style EditPage fill:#fce4ec
```

### Pages

#### 1. List Page
**Route**: `/inventory-management/period-end`
**File**: `page.tsx`
**Purpose**: Display paginated list of all period closings

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all period closings
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/inventory-management/period-end/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive period closing details

**Sections**:
- Header: Breadcrumbs, period closing title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change period closing status with reason

#### 3. Create Page
**Route**: `/inventory-management/period-end/new`
**File**: `new/page.tsx`
**Purpose**: Create new period closing

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/inventory-management/period-end/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing period closing

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## 15. Conclusion

This Technical Specification document provides a comprehensive blueprint for implementing the Period End Management sub-module within the Inventory Management system. The specification covers:

1. **Architecture**: Three-tier design with Next.js 14.2+ App Router, Server Actions, and PostgreSQL
2. **Technology Stack**: Modern technologies with TypeScript, Prisma, Zustand, React Query, and Shadcn/ui
3. **Component Structure**: Server Components for initial data fetching, Client Components for interactivity
4. **Data Flows**: Detailed flows for Create, Close, Re-open Period, and Mark Task Complete
5. **State Management**: Zustand for UI state, React Query for server state, React Hook Form for forms
6. **Integration Patterns**: Integration with Physical Count, Adjustments, and Stock Transactions modules
7. **Security**: RBAC, RLS policies, activity logging, CSRF protection
8. **Performance**: Database indexing, query optimization, caching, component optimization
9. **Error Handling**: Consistent error responses, client/server error handling, validation errors
10. **Testing**: Unit, integration, and E2E testing strategies with examples
11. **Deployment**: Environment variables, database migration, deployment checklist

**Implementation Readiness**: This specification is **ready for implementation** by backend and frontend development teams. All necessary patterns, code examples, and configurations are provided.

**Next Steps**:
1. Review and approve this Technical Specification
2. Complete implementation of Period End module (3 documents: BR ✅, UC ✅, TS ✅)
3. Move to Task 5: Generate Fractional Inventory documentation (BR, UC, TS only)

**Document Status**: Active - Revision 1.1.0 (2025-12-09)

---

**End of Technical Specification Document**
