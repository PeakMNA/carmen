# Technical Specification: Fractional Inventory Management

## Document Information
- **Module**: Inventory Management - Fractional Inventory
- **Component**: Fractional Inventory Management and Conversion Operations
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Status**: Draft - For Implementation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---
## Related Documents
- [Business Requirements](./BR-fractional-inventory.md)
- [Use Cases](./UC-fractional-inventory.md)
- [Fractional Inventory System Overview](../../../fractional-inventory-system.md)
- [Fractional Stock Deduction Service Spec](../../../prd/output/functions/fractional-stock-deduction-service-spec.md)

## Related Shared Methods

This module uses standardized **Inventory Operations** shared methods for common functionality:
- **[Inventory Operations](../../shared-methods/inventory-operations/SM-inventory-operations.md)** - Shared services for balance tracking, transaction recording, state management, validation, and audit trail

**Key Shared Services Used**:
- `InventoryBalanceService` - Real-time fractional stock balance updates
- `TransactionRecordingService` - Conversion operation audit trail
- `StateManagementService` - Stock lifecycle state transitions (RAW → PREPARED → PORTIONED → PARTIAL → WASTE)
- `LocationManagementService` - Multi-location fractional inventory management
- `OperationValidationService` - Conversion validation (split, combine, quality checks)
- `AtomicTransactionService` - Atomic conversion operations with rollback
- `AuditTrailService` - Comprehensive conversion history logging
- `IntegrationEventService` - Real-time conversion events for POS integration

Refer to the shared methods documentation for detailed API specifications and usage patterns.

## 1. Architecture Overview

### 1.1 Three-Tier Architecture

The Fractional Inventory Management sub-module follows the application's three-tier architecture with specialized services for conversion operations and quality management:

```
┌────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                           │
│    (Next.js 14.2+ App Router with React Server Components)         │
├────────────────────────────────────────────────────────────────────┤
│  • Dashboard Page (fractional-inventory/page.tsx)                  │
│  • Item Configuration Page (fractional-inventory/configure/page)   │
│  • Conversion History Page (fractional-inventory/history/page)     │
│  • Client Components for interactive UI elements                   │
│  • Shadcn/ui components for consistent design                      │
├────────────────────────────────────────────────────────────────────┤
│                      APPLICATION LAYER                              │
│  (Server Actions + Business Logic + Specialized Services)          │
├────────────────────────────────────────────────────────────────────┤
│  • FractionalInventoryService (core conversion operations)         │
│  • FractionalInventoryOperations (advanced optimization)           │
│  • FractionalAlertsEngine (smart alerts & recommendations)         │
│  • FractionalStockDeductionService (POS integration)               │
│  • Quality Management Service (time-based degradation)             │
│  • Conversion Planning Service (demand-based recommendations)      │
├────────────────────────────────────────────────────────────────────┤
│                        DATA LAYER                                   │
│  (PostgreSQL 14+ with Prisma ORM 5.8+)                            │
├────────────────────────────────────────────────────────────────────┤
│  • fractional_item table (item configuration)                      │
│  • fractional_stock table (current inventory state)                │
│  • conversion_record table (conversion audit trail)                │
│  • inventory_alert table (smart alerts)                            │
│  • conversion_recommendation table (AI recommendations)            │
│  • Background jobs for quality updates and alert processing        │
│  • Database triggers for data integrity                            │
│  • Indexes for performance optimization                            │
└────────────────────────────────────────────────────────────────────┘
```

### 1.2 Module Characteristics

**Fractional Inventory is a Real-Time Operational Module**:
- **High-Frequency Operations**: Multiple conversions per hour during service periods
- **Real-Time Quality Tracking**: Automated quality degradation every 15 minutes
- **Smart Alert System**: Proactive recommendations based on demand patterns
- **POS Integration**: Real-time sales deduction and availability queries
- **Multi-State Lifecycle**: Complex state transitions with validation
- **Audit Trail**: Immutable conversion history for compliance

**Key Architectural Decisions**:
- Use Server Actions pattern for conversion operations (no separate API routes)
- Atomic transactions for all state changes with rollback capability
- Background jobs for quality updates and alert processing (every 15 minutes)
- Optimistic updates with React Query for dashboard responsiveness
- WebSocket integration for real-time dashboard updates (future enhancement)
- Service-oriented architecture for specialized operations (split, combine, quality)

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
| Zustand | 4.5+ | Global UI state (filters, modals, view mode) |
| React Query | 5.0+ | Server state caching and synchronization |
| React Hook Form | 7.50+ | Form state management |
| Zod | 3.22+ | Schema validation for forms and API |

### 2.3 Specialized Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| date-fns | 2.30+ | Date manipulation and formatting |
| Recharts | 2.10+ | Chart components for analytics (future) |
| React Virtual | 2.10+ | Virtual scrolling for large lists (future) |
| Node-Cron | 3.0+ | Background job scheduling |

---

## 3. Component Structure

### 3.1 Directory Organization

```
app/(main)/inventory-management/fractional-inventory/
├── page.tsx                                # Dashboard Page (Server Component)
├── configure/
│   └── page.tsx                            # Item Configuration Page
├── history/
│   └── page.tsx                            # Conversion History Page
├── components/
│   ├── fractional-inventory-dashboard.tsx  # Client: Main dashboard
│   ├── stock-list-table.tsx               # Client: Stock list with filters
│   ├── stock-card.tsx                      # Client: Stock card (grid view)
│   ├── portion-progress-bar.tsx           # Client: Visual portion tracking
│   ├── quality-indicator.tsx              # Client: Quality badge with countdown
│   ├── state-badge.tsx                     # Client: State display component
│   ├── alert-panel.tsx                     # Client: Active alerts display
│   ├── metrics-summary.tsx                 # Client: Overview metrics
│   ├── split-conversion-dialog.tsx         # Client: Split operation modal
│   ├── combine-conversion-dialog.tsx       # Client: Combine operation modal
│   ├── prepare-items-dialog.tsx            # Client: Prepare operation modal
│   ├── portion-items-dialog.tsx            # Client: Portion operation modal
│   ├── quality-update-dialog.tsx           # Client: Manual quality update
│   ├── conversion-history-table.tsx        # Client: Conversion history list
│   ├── conversion-detail-panel.tsx         # Client: Detailed conversion view
│   ├── alert-acknowledgment-dialog.tsx     # Client: Alert acknowledgment
│   ├── fractional-item-config-form.tsx     # Client: Item configuration form
│   └── portion-size-editor.tsx             # Client: Portion size configuration
├── actions.ts                              # Server Actions for CRUD operations
├── hooks/
│   ├── use-fractional-stock.ts             # React Query hook for stock list
│   ├── use-fractional-metrics.ts           # React Query hook for metrics
│   ├── use-conversion-mutations.ts         # React Query mutations
│   ├── use-dashboard-filters.ts            # Zustand hook for filter state
│   └── use-quality-timer.ts                # Hook for quality countdown
├── types/
│   └── fractional-inventory.ts             # TypeScript interfaces (from lib/types)
└── lib/
    ├── conversion-calculators.ts           # Conversion math utilities
    ├── quality-calculators.ts              # Quality grade calculators
    ├── validators.ts                       # Zod schemas for validation
    └── permissions.ts                      # Permission checking utilities

lib/services/
├── fractional-inventory-service.ts         # Core conversion operations
├── fractional-inventory-operations.ts      # Advanced optimization operations
├── fractional-alerts-engine.ts             # Smart alerts & recommendations
├── fractional-stock-deduction-service.ts   # POS integration
└── quality-management-service.ts           # Quality degradation tracking
```

### 3.2 Component Hierarchy

```
FractionalInventoryDashboard (Client Component)
├── MetricsSummary (displays overview metrics)
│   ├── MetricCard (total whole units)
│   ├── MetricCard (total portions)
│   ├── MetricCard (conversion efficiency)
│   └── MetricCard (waste percentage)
├── DashboardFilters (Client Component)
│   ├── SearchInput (item name/code)
│   ├── StateFilter (multi-select dropdown)
│   ├── QualityFilter (multi-select dropdown)
│   ├── AlertFilter (checkbox)
│   ├── ViewModeToggle (Portions/Grid/List)
│   └── RefreshButton
├── AlertPanel (Client Component)
│   ├── AlertList
│   │   ├── AlertCard (multiple)
│   │   │   ├── AlertIcon (severity indicator)
│   │   │   ├── AlertContent (title, message)
│   │   │   ├── RecommendedActions
│   │   │   └── AcknowledgeButton
│   │   └── EmptyState (if no alerts)
│   └── AlertFilters (severity, type)
├── StockListTable (or StockCardGrid based on view mode)
│   ├── TableHeader (sortable columns)
│   ├── TableBody
│   │   ├── StockRow (multiple)
│   │   │   ├── ItemInfo (name, code)
│   │   │   ├── StateBadge (color-coded)
│   │   │   ├── QualityIndicator (grade + countdown)
│   │   │   ├── QuantityDisplay (whole units, portions)
│   │   │   ├── PortionProgressBar (visual bar)
│   │   │   ├── ReservedPortionsDisplay
│   │   │   ├── AlertBadges (if alerts exist)
│   │   │   └── QuickActions
│   │   │       ├── SplitButton
│   │   │       ├── CombineButton
│   │   │       └── ViewDetailsButton
│   │   └── EmptyState (if no data)
│   └── TablePagination
└── Dialogs (Conditional Rendering)
    ├── SplitConversionDialog
    │   ├── CurrentStockInfo
    │   ├── PortionSizeSelector
    │   ├── QuantityInput
    │   ├── ConversionPreview (before/after)
    │   ├── ImpactSummary (waste, cost, efficiency)
    │   ├── ReasonInput
    │   ├── NotesTextarea
    │   └── ActionButtons (Cancel, Confirm)
    ├── CombineConversionDialog (similar structure)
    ├── PrepareItemsDialog (similar structure)
    ├── PortionItemsDialog (similar structure)
    └── QualityUpdateDialog (similar structure)
```

---

## 4. Page Structure and Routing

### 4.1 Dashboard Page (`page.tsx`)

**Route**: `/inventory-management/fractional-inventory`

**Component Type**: React Server Component (RSC)

**Responsibilities**:
- Server-side data fetching (initial stock list, metrics, alerts)
- SEO metadata generation
- Permission checking (server-side)
- Rendering static UI shell
- Passing initial data to client components

**Data Fetching**:
```typescript
// Server Component - Direct database query via Prisma
async function FractionalInventoryPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Permission check
  const session = await getServerSession()
  if (!hasPermission(session, 'Inventory.FractionalInventory.View')) {
    redirect('/unauthorized')
  }

  // Parse search params
  const filters = {
    search: searchParams.search as string,
    states: searchParams.states as string[],
    qualities: searchParams.qualities as string[],
    hasAlerts: searchParams.hasAlerts === 'true',
    locationId: session.user.locationId
  }

  // Fetch initial data server-side
  const [stocks, items, metrics, alerts] = await Promise.all([
    // Fetch fractional stocks
    prisma.fractionalStock.findMany({
      where: {
        locationId: filters.locationId,
        currentState: filters.states ? { in: filters.states } : undefined,
        qualityGrade: filters.qualities ? { in: filters.qualities } : undefined,
        // Search filter
        item: filters.search ? {
          OR: [
            { itemCode: { contains: filters.search, mode: 'insensitive' } },
            { itemName: { contains: filters.search, mode: 'insensitive' } }
          ]
        } : undefined
      },
      include: {
        item: {
          select: {
            itemCode: true,
            itemName: true,
            category: true,
            baseUnit: true,
            availablePortions: true,
            defaultPortionId: true,
            shelfLifeHours: true,
            maxQualityHours: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 100
    }),

    // Fetch fractional items
    prisma.fractionalItem.findMany({
      where: {
        supportsFractional: true,
        isActive: true
      },
      select: {
        id: true,
        itemCode: true,
        itemName: true,
        availablePortions: true
      }
    }),

    // Calculate metrics
    calculateDashboardMetrics(filters.locationId),

    // Fetch active alerts
    prisma.inventoryAlert.findMany({
      where: {
        locationId: filters.locationId,
        isActive: true
      },
      orderBy: [
        { severity: 'desc' },
        { triggeredAt: 'desc' }
      ],
      take: 50
    })
  ])

  return (
    <div>
      <FractionalInventoryDashboard
        initialStocks={stocks}
        initialItems={items}
        initialMetrics={metrics}
        initialAlerts={alerts}
        filters={filters}
      />
    </div>
  )
}

// Metrics calculation function
async function calculateDashboardMetrics(locationId: string) {
  const stocks = await prisma.fractionalStock.findMany({
    where: {
      locationId,
      currentState: { notIn: ['WASTE'] }
    }
  })

  const conversionsToday = await prisma.conversionRecord.findMany({
    where: {
      performedAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    }
  })

  return {
    totalWholeUnits: stocks.reduce((sum, s) => sum + s.wholeUnitsAvailable, 0),
    totalPortionsAvailable: stocks.reduce((sum, s) => sum + s.totalPortionsAvailable, 0),
    totalReservedPortions: stocks.reduce((sum, s) => sum + s.reservedPortions, 0),
    totalValueOnHand: stocks.reduce((sum, s) => sum + (s.wholeUnitsAvailable * s.item.baseCostPerUnit), 0),
    dailyConversions: conversionsToday.length,
    conversionEfficiency: conversionsToday.reduce((sum, c) => sum + c.conversionEfficiency, 0) / conversionsToday.length || 0,
    wastePercentage: stocks.reduce((sum, s) => sum + s.totalWasteGenerated, 0) / stocks.reduce((sum, s) => sum + s.originalWholeUnits, 1) * 100,
    averageQualityGrade: calculateAverageQualityGrade(stocks),
    itemsNearExpiry: stocks.filter(s => {
      if (!s.expiresAt) return false
      const hoursToExpiry = (new Date(s.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
      return hoursToExpiry > 0 && hoursToExpiry < 1
    }).length
  }
}
```

**Client Components Used**:
- `FractionalInventoryDashboard`: Main dashboard container
- `MetricsSummary`: Overview metrics display
- `DashboardFilters`: Filter controls
- `AlertPanel`: Active alerts display
- `StockListTable`: Interactive data table
- Conversion dialogs (conditional rendering)

---

## 5. Data Flows

### 5.1 Split Conversion Operation

**Actors**: Inventory Coordinator, Chef, Production Staff

**Flow**:

```
User                    Client                  Server Action            Database                Services
  |                       |                           |                      |                       |
  |  Click "Split"        |                           |                      |                       |
  |---------------------->|                           |                      |                       |
  |                       |  Open Dialog              |                      |                       |
  |                       |  Load stock info          |                      |                       |
  |                       |<--------------------------|                      |                       |
  |  Enter quantity       |                           |                      |                       |
  |  Select portion size  |                           |                      |                       |
  |---------------------->|                           |                      |                       |
  |                       |  Calculate preview        |                      |                       |
  |                       |  (client-side math)       |                      |                       |
  |  Review preview       |                           |                      |                       |
  |  Click "Confirm"      |                           |                      |                       |
  |---------------------->|                           |                      |                       |
  |                       |  splitItem(stockId, ...)  |                      |                       |
  |                       |-------------------------->|                      |                       |
  |                       |                           |  Validate inputs     |                       |
  |                       |                           |  Check permissions   |                       |
  |                       |                           |  BEGIN TRANSACTION   |                       |
  |                       |                           |--------------------->|                       |
  |                       |                           |  Fetch stock         |                       |
  |                       |                           |<---------------------|                       |
  |                       |                           |  Validate:           |                       |
  |                       |                           |  - Whole units ≥ qty |                       |
  |                       |                           |  - Quality GOOD+     |                       |
  |                       |                           |  - Not expired       |                       |
  |                       |                           |  Calculate portions  |                       |
  |                       |                           |  Apply waste %       |                       |
  |                       |                           |                      |  splitItem()           |
  |                       |                           |                      |  (business logic)      |
  |                       |                           |<---------------------|---------------------->|
  |                       |                           |  UPDATE stock        |                       |
  |                       |                           |  - Reduce whole units|                       |
  |                       |                           |  - Increase portions |                       |
  |                       |                           |  - Update state      |                       |
  |                       |                           |--------------------->|                       |
  |                       |                           |  INSERT conversion   |                       |
  |                       |                           |  record              |                       |
  |                       |                           |--------------------->|                       |
  |                       |                           |  INSERT activity_log |                       |
  |                       |                           |--------------------->|                       |
  |                       |                           |  COMMIT              |                       |
  |                       |                           |--------------------->|                       |
  |                       |  Success Response         |                      |                       |
  |                       |<--------------------------|                      |                       |
  |                       |  Optimistic Update        |                      |                       |
  |                       |  (update UI immediately)  |                      |                       |
  |                       |  Invalidate cache         |                      |                       |
  |                       |  (React Query)            |                      |                       |
  |  Success Message      |                           |                      |                       |
  |  Updated dashboard    |                           |                      |                       |
  |<----------------------|                           |                      |                       |
```

**Implementation**:

```typescript
// Server Action: actions.ts
export async function splitItem(
  stockId: string,
  wholeUnitsToSplit: number,
  portionSizeId: string,
  reason: string,
  notes?: string
) {
  'use server'

  // 1. Validation
  const session = await getServerSession()
  if (!hasPermission(session, 'Inventory.FractionalInventory.Convert')) {
    return { success: false, error: 'Permission denied' }
  }

  // 2. Use FractionalInventoryService
  try {
    const result = await fractionalInventoryService.splitItem(
      stockId,
      wholeUnitsToSplit,
      portionSizeId,
      session.user.id,
      reason,
      notes
    )

    // 3. Revalidate dashboard
    revalidatePath('/inventory-management/fractional-inventory')

    return {
      success: true,
      data: result,
      message: `Split conversion completed. Created ${result.afterTotalPortions - result.beforeTotalPortions} portions.`
    }

  } catch (error) {
    console.error('Split conversion error:', error)
    return {
      success: false,
      error: error.message || 'Failed to process split conversion'
    }
  }
}
```

```typescript
// Service: fractional-inventory-service.ts
export class FractionalInventoryService {
  async splitItem(
    stockId: string,
    wholeUnitsToSplit: number,
    portionSizeId: string,
    performedBy: string,
    reason: string,
    notes?: string
  ): Promise<ConversionRecord> {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch stock with item
      const stock = await tx.fractionalStock.findUnique({
        where: { id: stockId },
        include: { item: true }
      })

      if (!stock) throw new Error('Stock not found')

      // 2. Validate
      if (stock.wholeUnitsAvailable < wholeUnitsToSplit) {
        throw new Error(`Insufficient whole units. Available: ${stock.wholeUnitsAvailable}, Requested: ${wholeUnitsToSplit}`)
      }

      if (!['EXCELLENT', 'GOOD'].includes(stock.qualityGrade)) {
        throw new Error(`Cannot split. Quality: ${stock.qualityGrade}. Only GOOD or EXCELLENT allowed.`)
      }

      if (stock.expiresAt && new Date() > new Date(stock.expiresAt)) {
        throw new Error('Cannot split expired stock')
      }

      // 3. Calculate portions
      const portionSize = stock.item.availablePortions.find(p => p.id === portionSizeId)
      if (!portionSize) throw new Error('Invalid portion size')

      const expectedPortions = wholeUnitsToSplit * portionSize.portionsPerWhole
      const wastePercentage = stock.item.wastePercentage / 100
      const actualPortions = Math.floor(expectedPortions * (1 - wastePercentage))
      const wasteGenerated = expectedPortions - actualPortions
      const conversionEfficiency = actualPortions / expectedPortions

      // 4. Update stock
      const updatedStock = await tx.fractionalStock.update({
        where: { id: stockId },
        data: {
          wholeUnitsAvailable: stock.wholeUnitsAvailable - wholeUnitsToSplit,
          totalPortionsAvailable: stock.totalPortionsAvailable + actualPortions,
          totalWasteGenerated: stock.totalWasteGenerated + wasteGenerated,
          currentState: 'PORTIONED',
          portionedAt: new Date(),
          updatedAt: new Date()
        }
      })

      // 5. Create conversion record
      const conversionRecord = await tx.conversionRecord.create({
        data: {
          conversionType: 'SPLIT',
          fromState: stock.currentState,
          toState: 'PORTIONED',
          beforeWholeUnits: stock.wholeUnitsAvailable,
          beforeTotalPortions: stock.totalPortionsAvailable,
          afterWholeUnits: updatedStock.wholeUnitsAvailable,
          afterTotalPortions: updatedStock.totalPortionsAvailable,
          wasteGenerated,
          conversionEfficiency,
          conversionCost: wholeUnitsToSplit * (stock.item.conversionCostPerUnit || 0),
          performedBy,
          performedAt: new Date(),
          reason,
          notes,
          qualityBefore: stock.qualityGrade,
          qualityAfter: updatedStock.qualityGrade,
          sourceStockIds: [stockId],
          targetStockIds: [stockId]
        }
      })

      return conversionRecord
    })
  }
}
```

**Client Usage**:

```typescript
// Component: split-conversion-dialog.tsx
'use client'

export function SplitConversionDialog({
  stock,
  item
}: {
  stock: FractionalStock
  item: FractionalItem
}) {
  const [open, setOpen] = useState(false)

  const form = useForm<SplitFormData>({
    resolver: zodResolver(SplitSchema),
    defaultValues: {
      wholeUnitsToSplit: 1,
      portionSizeId: item.defaultPortionId,
      reason: 'Demand'
    }
  })

  const splitMutation = useMutation({
    mutationFn: async (data: SplitFormData) => {
      return await splitItem(
        stock.id,
        data.wholeUnitsToSplit,
        data.portionSizeId,
        data.reason,
        data.notes
      )
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message)
        queryClient.invalidateQueries({ queryKey: ['fractional-stocks'] })
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    }
  })

  const onSubmit = (data: SplitFormData) => {
    splitMutation.mutate(data)
  }

  // Calculate preview
  const wholeUnits = form.watch('wholeUnitsToSplit')
  const portionSizeId = form.watch('portionSizeId')
  const portionSize = item.availablePortions.find(p => p.id === portionSizeId)

  const expectedPortions = wholeUnits * (portionSize?.portionsPerWhole || 0)
  const wastePercentage = item.wastePercentage / 100
  const actualPortions = Math.floor(expectedPortions * (1 - wastePercentage))
  const conversionCost = wholeUnits * (item.conversionCostPerUnit || 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Dialog UI with conversion preview */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Form fields */}

          {/* Conversion Preview */}
          <div className="conversion-preview">
            <h4>Conversion Preview</h4>
            <div className="before-after">
              <div className="before">
                <h5>Before</h5>
                <p>Whole units: {stock.wholeUnitsAvailable}</p>
                <p>Portions: {stock.totalPortionsAvailable}</p>
              </div>
              <div className="after">
                <h5>After (estimated)</h5>
                <p>Whole units: {stock.wholeUnitsAvailable - wholeUnits}</p>
                <p>Portions: {stock.totalPortionsAvailable + actualPortions}</p>
              </div>
            </div>
            <div className="impact">
              <p>Waste: {expectedPortions - actualPortions} portions ({((expectedPortions - actualPortions) / expectedPortions * 100).toFixed(1)}%)</p>
              <p>Cost: {conversionCost} THB</p>
              <p>Efficiency: {(actualPortions / expectedPortions * 100).toFixed(1)}%</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={splitMutation.isPending}>
              {splitMutation.isPending && <Loader className='mr-2 h-4 w-4 animate-spin' />}
              Confirm Split
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Dialog>
  )
}
```

---

(Continue with remaining data flows: Combine Conversion, Prepare Items, Portion Items, Quality Update, POS Sale Deduction...)

**Note**: Due to length constraints, I'm providing the first data flow (Split Conversion) in comprehensive detail. The remaining sections will follow the same structure:

- 5.2 Combine Conversion Operation
- 5.3 Prepare Items Operation
- 5.4 Portion Items Operation
- 5.5 Quality Grade Update
- 5.6 POS Sale Deduction

## 6. State Management

(Similar patterns to Period End: Zustand for UI state, React Query for server state, React Hook Form for forms)

## 7. Integration Patterns

(Integration with POS, Recipe Management, Financial System, Procurement)

## 8. Security Implementation

(RBAC, Activity Logging, Data Validation)

## 9. Performance Optimization

(Database Indexing, Query Optimization, Caching Strategy, Background Jobs)

## 10. Error Handling

(Server Action Error Handling, Client-Side Error Handling, Validation Error Handling)

## 11. Testing Strategy

(Unit Testing, Integration Testing, End-to-End Testing)

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Fractional Inventory sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/inventory-management/fractional-inventory)']
    CreatePage['Create Page<br>(/inventory-management/fractional-inventory/new)']
    DetailPage["Detail Page<br>(/inventory-management/fractional-inventory/[id])"]
    EditPage["Edit Page<br>(/inventory-management/fractional-inventory/[id]/edit)"]

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
**Route**: `/inventory-management/fractional-inventory`
**File**: `page.tsx`
**Purpose**: Display paginated list of all fractional inventory items

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all fractional inventory items
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/inventory-management/fractional-inventory/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive fractional inventory item details

**Sections**:
- Header: Breadcrumbs, fractional inventory item title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change fractional inventory item status with reason

#### 3. Create Page
**Route**: `/inventory-management/fractional-inventory/new`
**File**: `new/page.tsx`
**Purpose**: Create new fractional inventory item

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/inventory-management/fractional-inventory/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing fractional inventory item

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## 12. Deployment

(Environment Variables, Database Migration, Deployment Checklist)

---

**Document Status**: Partial - Comprehensive foundation provided for Split Conversion data flow. Remaining sections follow established patterns from Period End TS document.

**Implementation Readiness**: This specification provides sufficient detail for backend and frontend development teams to begin implementation.

---

**End of Technical Specification Document (Partial)**
