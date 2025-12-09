# Inventory Planning - Technical Specification

## Document Information

| Field | Value |
|-------|-------|
| Module | Inventory Planning |
| Version | 1.0.0 |
| Last Updated | 2025-12-06 |
| Status | Draft |

---

## 1. System Architecture

### 1.1 Architecture Overview

The Inventory Planning module uses a shared service architecture with the Demand Forecasting module. Both modules consume the same `InventoryAnalyticsService` backend.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
├─────────────────────────────┬───────────────────────────────┤
│     Inventory Planning      │      Demand Forecasting       │
│     - Dashboard             │      - Forecast Generation    │
│     - Reorder Management    │      - Trend Analysis         │
│     - Dead Stock Analysis   │      - Performance Dashboard  │
│     - Safety Stock          │                               │
│     - Multi-Location        │                               │
└─────────────────────────────┴───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│         /api/inventory/analytics?operation=...               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    InventoryAnalyticsService                 │
│  ┌─────────────────────┬─────────────────────────────────┐  │
│  │  Inventory Planning │      Demand Forecasting         │  │
│  │  Methods:           │      Methods:                   │  │
│  │  - optimization     │      - forecast                 │  │
│  │  - deadStock        │      - trendAnalysis            │  │
│  │  - dashboard        │                                 │  │
│  └─────────────────────┴─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│              Inventory Items, Transactions, Locations        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript |
| Styling | Tailwind CSS, Shadcn/ui |
| State | React Query, Zustand |
| Charts | Recharts |
| API | Next.js Route Handlers |
| Service | TypeScript Service Layer |
| Data | Mock Data (Production: Supabase) |

---

## 2. Component Architecture

### 2.1 Page Components

```
app/(main)/operational-planning/inventory-planning/
├── page.tsx                      # Dashboard
├── reorder/
│   └── page.tsx                  # Reorder Management
├── dead-stock/
│   └── page.tsx                  # Dead Stock Analysis
├── safety-stock/
│   └── page.tsx                  # Safety Stock Optimization
├── locations/
│   └── page.tsx                  # Multi-Location Planning
├── settings/
│   └── page.tsx                  # Module Settings
└── components/
    ├── InventoryPlanningKpiCards.tsx
    ├── OptimizationTable.tsx
    ├── DeadStockTable.tsx
    ├── LocationBreakdownChart.tsx
    └── ReorderAlerts.tsx
```

### 2.2 Component Hierarchy

```
InventoryPlanningDashboard
├── PageHeader
├── QuickActions (4 buttons)
├── InventoryPlanningKpiCards
│   ├── KpiCard (Total Savings)
│   ├── KpiCard (Items at Risk)
│   ├── KpiCard (Optimization Rate)
│   └── KpiCard (Dead Stock Value)
├── ChartsRow
│   ├── OptimizationActionsChart (Pie)
│   └── LocationPerformanceChart (Bar)
├── ReorderAlerts
└── RecentRecommendationsTable

ReorderManagementPage
├── PageHeader
├── FilterBar
│   ├── LocationSelect
│   ├── CategorySelect
│   └── ActionTypeSelect
├── SummaryCards
│   ├── ItemsCard
│   ├── ChangesCard
│   └── SavingsCard
├── OptimizationTable
│   ├── TableHeader (sortable)
│   ├── TableRows (expandable)
│   └── BulkActions
└── ExportButton

DeadStockPage
├── PageHeader
├── RiskOverviewCards
│   ├── CriticalCard
│   ├── HighCard
│   ├── MediumCard
│   └── LowCard
├── FilterBar
│   ├── ThresholdDaysInput
│   ├── LocationSelect
│   └── RiskLevelSelect
├── DeadStockTable
│   ├── TableHeader
│   ├── TableRows (expandable)
│   └── BulkActions
└── ActionsSummary
```

---

## 3. Service Layer

### 3.1 InventoryAnalyticsService

**Location**: `lib/services/inventory/inventory-analytics-service.ts`

#### 3.1.1 Optimization Methods

```typescript
interface OptimizationParams {
  itemIds?: string[];
  locationId?: string;
  categoryId?: string;
  includeAllItems?: boolean;
}

interface InventoryOptimization {
  itemId: string;
  itemName: string;
  category: string;
  currentMetrics: {
    currentStock: number;
    averageStock: number;
    turnoverRate: number;
    carryingCost: number;
    currentReorderPoint: number;
    currentOrderQuantity: number;
    serviceLevel: number;
  };
  optimizedMetrics: {
    recommendedReorderPoint: number;
    recommendedOrderQuantity: number;
    recommendedSafetyStock: number;
    targetServiceLevel: number;
  };
  potentialSavings: {
    carryingCostSavings: number;
    stockoutCostSavings: number;
    totalSavings: number;
    paybackPeriod: number;
  };
  implementationRisk: 'low' | 'medium' | 'high';
  recommendedAction: 'implement' | 'pilot' | 'monitor' | 'reject';
}

generateOptimizationRecommendations(params: OptimizationParams): Promise<{
  recommendations: InventoryOptimization[];
  summary: {
    totalItems: number;
    totalPotentialSavings: number;
    averageRisk: number;
    actionBreakdown: Record<string, number>;
  };
}>
```

#### 3.1.2 Dead Stock Methods

```typescript
interface DeadStockParams {
  thresholdDays?: number;  // Default: 90
  locationId?: string;
  categoryId?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
}

interface DeadStockAnalysis {
  itemId: string;
  itemName: string;
  category: string;
  location: string;
  currentStock: number;
  currentValue: number;
  lastMovementDate: Date;
  daysSinceLastMovement: number;
  averageMonthlyConsumption: number;
  monthsOfStock: number;
  obsolescenceRisk: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: 'continue_stocking' | 'reduce_stock' | 'liquidate' | 'return_to_supplier' | 'write_off';
  potentialLoss: number;
  liquidationValue: number;
}

analyzeDeadStock(params: DeadStockParams): Promise<{
  items: DeadStockAnalysis[];
  summary: {
    totalItems: number;
    totalValue: number;
    totalPotentialLoss: number;
    riskBreakdown: Record<string, number>;
    actionBreakdown: Record<string, number>;
  };
}>
```

#### 3.1.3 Dashboard Methods

```typescript
interface DashboardParams {
  locationId?: string;
  dateRange?: { start: Date; end: Date };
}

interface InventoryPerformanceDashboard {
  overallMetrics: {
    totalInventoryValue: number;
    inventoryTurnover: number;
    daysOfInventory: number;
    fillRate: number;
    stockoutRate: number;
    carryingCostRate: number;
  };
  categoryBreakdown: Array<{
    category: string;
    value: number;
    percentage: number;
    turnover: number;
    itemCount: number;
  }>;
  locationBreakdown: Array<{
    location: string;
    value: number;
    turnover: number;
    alertCount: number;
    status: 'optimal' | 'overstocked' | 'understocked';
  }>;
  alerts: {
    lowStock: number;
    overstock: number;
    deadStock: number;
    expiring: number;
    highValue: number;
    fastMoving: number;
  };
  trends: {
    valueChange: number;
    turnoverChange: number;
    alertsChange: number;
  };
}

generatePerformanceDashboard(params: DashboardParams): Promise<InventoryPerformanceDashboard>
```

---

## 4. API Layer

### 4.1 API Endpoints

**Base Path**: `/api/inventory/analytics`

| Endpoint | Method | Operation | Parameters |
|----------|--------|-----------|------------|
| `/api/inventory/analytics?operation=optimization` | GET | Generate optimizations | itemIds, locationId, categoryId |
| `/api/inventory/analytics?operation=dead-stock` | GET | Analyze dead stock | thresholdDays, locationId, riskLevel |
| `/api/inventory/analytics?operation=dashboard` | GET | Get dashboard | locationId, startDate, endDate |

### 4.2 API Request/Response Examples

#### Optimization Request

```typescript
// Request
GET /api/inventory/analytics?operation=optimization&locationId=loc-001

// Response
{
  "recommendations": [
    {
      "itemId": "item-001",
      "itemName": "Olive Oil Extra Virgin",
      "category": "Oils & Vinegars",
      "currentMetrics": {
        "currentStock": 50,
        "averageStock": 45,
        "turnoverRate": 8.5,
        "carryingCost": 125.50,
        "currentReorderPoint": 20,
        "currentOrderQuantity": 30,
        "serviceLevel": 0.92
      },
      "optimizedMetrics": {
        "recommendedReorderPoint": 15,
        "recommendedOrderQuantity": 25,
        "recommendedSafetyStock": 8,
        "targetServiceLevel": 0.95
      },
      "potentialSavings": {
        "carryingCostSavings": 45.20,
        "stockoutCostSavings": 15.00,
        "totalSavings": 60.20,
        "paybackPeriod": 2.5
      },
      "implementationRisk": "low",
      "recommendedAction": "implement"
    }
  ],
  "summary": {
    "totalItems": 150,
    "totalPotentialSavings": 8500.00,
    "averageRisk": 0.35,
    "actionBreakdown": {
      "implement": 45,
      "pilot": 30,
      "monitor": 50,
      "reject": 25
    }
  }
}
```

#### Dead Stock Request

```typescript
// Request
GET /api/inventory/analytics?operation=dead-stock&thresholdDays=90

// Response
{
  "items": [
    {
      "itemId": "item-050",
      "itemName": "Specialty Truffle Oil",
      "category": "Oils & Vinegars",
      "location": "Main Kitchen",
      "currentStock": 15,
      "currentValue": 450.00,
      "lastMovementDate": "2025-06-15",
      "daysSinceLastMovement": 174,
      "averageMonthlyConsumption": 0.5,
      "monthsOfStock": 30,
      "obsolescenceRisk": "high",
      "recommendedAction": "liquidate",
      "potentialLoss": 270.00,
      "liquidationValue": 180.00
    }
  ],
  "summary": {
    "totalItems": 25,
    "totalValue": 12500.00,
    "totalPotentialLoss": 7500.00,
    "riskBreakdown": {
      "critical": 3,
      "high": 8,
      "medium": 10,
      "low": 4
    },
    "actionBreakdown": {
      "continue_stocking": 4,
      "reduce_stock": 10,
      "liquidate": 8,
      "return_to_supplier": 2,
      "write_off": 1
    }
  }
}
```

---

## 5. State Management

### 5.1 React Query Integration

```typescript
// hooks/useInventoryPlanning.ts

export function useOptimizationRecommendations(params: OptimizationParams) {
  return useQuery({
    queryKey: ['optimization', params],
    queryFn: () => fetchOptimizations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDeadStockAnalysis(params: DeadStockParams) {
  return useQuery({
    queryKey: ['dead-stock', params],
    queryFn: () => fetchDeadStock(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInventoryDashboard(params: DashboardParams) {
  return useQuery({
    queryKey: ['inventory-dashboard', params],
    queryFn: () => fetchDashboard(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
```

### 5.2 Zustand Store

```typescript
// stores/inventoryPlanningStore.ts

interface InventoryPlanningState {
  // Filters
  selectedLocation: string | null;
  selectedCategory: string | null;
  thresholdDays: number;
  serviceLevel: number;

  // UI State
  expandedRows: Set<string>;
  selectedItems: Set<string>;

  // Actions
  setSelectedLocation: (location: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  setThresholdDays: (days: number) => void;
  setServiceLevel: (level: number) => void;
  toggleRowExpanded: (itemId: string) => void;
  toggleItemSelected: (itemId: string) => void;
  selectAllItems: (itemIds: string[]) => void;
  clearSelection: () => void;
}

export const useInventoryPlanningStore = create<InventoryPlanningState>((set) => ({
  selectedLocation: null,
  selectedCategory: null,
  thresholdDays: 90,
  serviceLevel: 95,
  expandedRows: new Set(),
  selectedItems: new Set(),

  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setThresholdDays: (days) => set({ thresholdDays: days }),
  setServiceLevel: (level) => set({ serviceLevel: level }),
  toggleRowExpanded: (itemId) => set((state) => {
    const newExpanded = new Set(state.expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    return { expandedRows: newExpanded };
  }),
  toggleItemSelected: (itemId) => set((state) => {
    const newSelected = new Set(state.selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    return { selectedItems: newSelected };
  }),
  selectAllItems: (itemIds) => set({ selectedItems: new Set(itemIds) }),
  clearSelection: () => set({ selectedItems: new Set() }),
}));
```

---

## 6. UI Components Specification

### 6.1 InventoryPlanningKpiCards

```typescript
interface KpiCardsProps {
  totalSavings: number;
  itemsAtRisk: number;
  optimizationRate: number;
  deadStockValue: number;
  trends?: {
    savingsChange: number;
    riskChange: number;
    optimizationChange: number;
    deadStockChange: number;
  };
}
```

**Display**:
- 4 cards in a row (responsive grid)
- Each card shows: value, label, trend indicator
- Color coding based on status

### 6.2 OptimizationTable

```typescript
interface OptimizationTableProps {
  data: InventoryOptimization[];
  onApply: (itemIds: string[]) => void;
  onReject: (itemId: string) => void;
  onExport: () => void;
}
```

**Features**:
- Sortable columns (Item, Category, Savings, Risk, Action)
- Expandable rows showing current vs recommended
- Checkbox selection for bulk actions
- Action buttons (Apply, Reject)

### 6.3 DeadStockTable

```typescript
interface DeadStockTableProps {
  data: DeadStockAnalysis[];
  onAction: (itemId: string, action: string) => void;
  onBulkAction: (itemIds: string[], action: string) => void;
}
```

**Features**:
- Risk level color coding
- Days idle visualization
- Expandable details (consumption history, liquidation options)
- Bulk action support

### 6.4 LocationBreakdownChart

```typescript
interface LocationBreakdownChartProps {
  data: Array<{
    location: string;
    value: number;
    turnover: number;
    status: 'optimal' | 'overstocked' | 'understocked';
  }>;
  onLocationClick: (location: string) => void;
}
```

**Display**:
- Horizontal bar chart
- Color coding by status
- Click to filter

---

## 7. Performance Specifications

### 7.1 Performance Targets

| Operation | Target | Max Items |
|-----------|--------|-----------|
| Dashboard Load | < 3s | - |
| Optimization Generation | < 5s | 500 items |
| Dead Stock Analysis | < 3s | All items |
| Table Render | < 200ms | 100 rows |
| Chart Render | < 300ms | 50 data points |

### 7.2 Optimization Strategies

| Strategy | Implementation |
|----------|----------------|
| Pagination | 50 items per page default |
| Virtual Scrolling | For tables > 100 rows |
| Debounced Filters | 300ms delay |
| React Query Caching | 5 minute stale time |
| Lazy Loading | Charts load after initial render |

---

## 8. Error Handling

### 8.1 Error Types

| Error Type | HTTP Code | User Message |
|------------|-----------|--------------|
| InvalidParams | 400 | Please check your filter selections |
| NotFound | 404 | No data found for selected criteria |
| ServiceUnavailable | 503 | Service temporarily unavailable |
| InternalError | 500 | An unexpected error occurred |

### 8.2 Error Recovery

```typescript
// Error boundary for page-level errors
class InventoryPlanningErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

// React Query error handling
const { data, error, isLoading } = useOptimizationRecommendations(params);

if (error) {
  return <ErrorState error={error} onRetry={refetch} />;
}
```

---

## 9. Security Considerations

### 9.1 Access Control

| Permission | Description | Roles |
|------------|-------------|-------|
| inventory_planning.view | View dashboard and reports | All authorized users |
| inventory_planning.optimize | Generate recommendations | Inventory Manager, Financial Controller |
| inventory_planning.apply | Apply recommendations | Inventory Manager |
| inventory_planning.settings | Configure settings | Inventory Manager, Admin |

### 9.2 Data Validation

- All API inputs validated with Zod schemas
- Location/Category IDs validated against user permissions
- Numeric inputs bounded to reasonable ranges
- Date ranges limited to prevent excessive queries

---

## 10. Integration Points

### 10.1 Demand Forecasting Integration

```typescript
// Cross-module navigation
const navigateToDemandForecast = (itemId: string) => {
  router.push(`/operational-planning/demand-forecasting?itemId=${itemId}`);
};

// Shared data access
const { data: forecast } = useDemandForecast({ itemId });
const optimizationWithForecast = {
  ...optimization,
  forecastedDemand: forecast?.projectedDemand,
};
```

### 10.2 Inventory Management Integration

```typescript
// Apply recommendations
const applyRecommendations = async (recommendations: InventoryOptimization[]) => {
  const updates = recommendations.map(r => ({
    itemId: r.itemId,
    reorderPoint: r.optimizedMetrics.recommendedReorderPoint,
    orderQuantity: r.optimizedMetrics.recommendedOrderQuantity,
    safetyStock: r.optimizedMetrics.recommendedSafetyStock,
  }));

  await inventoryService.updateReorderParameters(updates);
};
```

---

**Document End**
