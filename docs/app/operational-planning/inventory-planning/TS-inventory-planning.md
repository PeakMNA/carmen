# Inventory Planning - Technical Specification

## Document Information

| Field | Value |
|-------|-------|
| Module | Operational Planning > Inventory Planning |
| Version | 2.0.0 |
| Last Updated | 2025-01-17 |
| Status | Implemented |

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-06 | Development Team | Initial documentation |
| 2.0.0 | 2025-01-17 | Development Team | Updated to match actual UI implementation |

---

## 1. System Architecture

### 1.1 Architecture Overview

The Inventory Planning module is part of the Operational Planning section and shares navigation with the Demand Forecasting module. It uses mock data for development with planned backend integration.

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
│     - Settings              │                               │
└─────────────────────────────┴───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Component Layer                          │
│         React Components with Local State                    │
│         - useState for filters, selections                   │
│         - useMemo for filtered/computed data                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Mock Data Layer                         │
│              Inline mock data in page components             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, TypeScript |
| Styling | Tailwind CSS, Shadcn/ui |
| State | React useState, useMemo |
| Charts | Recharts (PieChart, BarChart, LineChart) |
| Icons | Lucide React |
| Data | Mock Data (Production: Supabase) |

---

## 2. Component Architecture

### 2.1 Page Components

```
app/(main)/operational-planning/inventory-planning/
├── page.tsx                      # Dashboard (487 lines)
├── reorder/
│   └── page.tsx                  # Reorder Management (680 lines)
├── dead-stock/
│   └── page.tsx                  # Dead Stock Analysis (673 lines)
├── safety-stock/
│   └── page.tsx                  # Safety Stock Optimization (417 lines)
├── locations/
│   └── page.tsx                  # Multi-Location Planning (527 lines)
└── settings/
    └── page.tsx                  # Module Settings (430 lines)
```

### 2.2 Dashboard Component Hierarchy

```
InventoryPlanningDashboard (page.tsx)
├── PageHeader
│   └── "Inventory Planning" with subtitle
├── LocationFilter (Select component)
├── QuickActionsSection
│   ├── Card: Optimize Inventory → /reorder
│   ├── Card: Analyze Dead Stock → /dead-stock
│   ├── Card: Review Locations → /locations
│   └── Card: Configure Settings → /settings
├── KPICardsSection (4 cards in grid)
│   ├── TotalSavingsCard (DollarSign icon, green)
│   │   └── Trend indicator (TrendingUp/TrendingDown)
│   ├── ItemsAtRiskCard (AlertTriangle icon, orange)
│   │   └── Trend indicator
│   ├── OptimizationRateCard (CheckCircle icon, blue)
│   │   └── Trend indicator
│   └── DeadStockValueCard (Package icon, red)
│       └── Trend indicator
├── ChartsSection (2 cards in grid)
│   ├── OptimizationActionsCard
│   │   └── Recharts PieChart
│   │       └── Sectors: Implement, Pilot, Monitor, Reject
│   └── LocationPerformanceCard
│       └── Recharts BarChart (horizontal)
├── AlertSummaryGrid (6 clickable cards)
│   ├── LowStockAlert → /reorder?filter=low-stock
│   ├── OverstockAlert → /reorder?filter=overstock
│   ├── DeadStockAlert → /dead-stock
│   ├── ExpiringAlert → /inventory-management/expiring
│   ├── HighValueAlert → /reorder?filter=high-value
│   └── FastMovingAlert (info only)
├── RecentRecommendationsTable
│   └── Columns: Item, Category, Savings, Risk, Action
└── DemandForecastingLink
    └── Link to /operational-planning/demand-forecasting
```

### 2.3 Reorder Management Component Hierarchy

```
ReorderManagementPage (reorder/page.tsx)
├── PageHeader
│   └── "Reorder Management / Supplier Reorder Planning"
├── FilterBar
│   ├── LocationSelect
│   └── ActionTypeSelect (All, Implement, Pilot, Monitor, Reject)
├── SummaryCards (3 cards)
│   ├── ItemsCard (ClipboardList icon)
│   ├── ChangesCard (ArrowUpDown icon)
│   └── SavingsCard (TrendingUp icon)
├── ActionBar
│   ├── ApplySelectedButton (disabled until selection)
│   └── ExportButton
├── RecommendationsTable
│   ├── TableHeader
│   │   └── Checkbox (select all)
│   ├── TableBody
│   │   └── TableRow (expandable)
│   │       ├── Checkbox
│   │       ├── ProductCode
│   │       ├── ProductName
│   │       ├── Location
│   │       ├── CurrentROP
│   │       ├── RecommendedROP
│   │       ├── CurrentEOQ
│   │       ├── RecommendedEOQ
│   │       ├── AnnualSavings
│   │       ├── RiskLevelBadge
│   │       └── ActionTypeBadge
│   └── ExpandedRowContent
│       ├── CurrentMetricsSection
│       │   └── ROP, EOQ, SafetyStock, ServiceLevel, LeadTime
│       ├── RecommendedChangesSection
│       │   └── ROP, EOQ, SafetyStock, ServiceLevel
│       └── PotentialImpactSection
│           └── PaybackPeriod, TurnoverRate, DailyDemand
└── StockReplenishmentLink
    └── Link to /store-operations/stock-replenishment
```

### 2.4 Dead Stock Analysis Component Hierarchy

```
DeadStockPage (dead-stock/page.tsx)
├── PageHeader
│   └── "Dead Stock Analysis"
├── FilterBar
│   ├── ThresholdDaysSelect (60, 90, 120, 180, 365)
│   ├── LocationSelect
│   └── RiskLevelSelect
├── RiskOverviewCards (4 cards)
│   ├── CriticalCard (bg-red-100, AlertTriangle)
│   │   └── Count and Value
│   ├── HighCard (bg-orange-100, AlertTriangle)
│   │   └── Count and Value
│   ├── MediumCard (bg-yellow-100, AlertTriangle)
│   │   └── Count and Value
│   └── LowCard (bg-green-100, CheckCircle)
│       └── Count and Value
├── ActionBar
│   ├── BulkActionButton (disabled until selection)
│   └── ExportButton
├── DeadStockTable
│   ├── TableHeader
│   │   └── Checkbox (select all)
│   └── TableBody
│       └── TableRow (expandable)
│           ├── Checkbox
│           ├── ProductInfo (code, name, category)
│           ├── CurrentStock (with unit)
│           ├── Value (currency)
│           ├── LastMovement (formatted date)
│           ├── DaysSinceMovement (with bar visualization)
│           ├── RiskLevelBadge
│           └── ActionSelect
└── ExpandedRowContent
    ├── StockAnalysisSection
    │   └── MonthsOfStock, ExpiryDate, DaysUntilExpiry
    └── FinancialImpactSection
        └── PotentialLoss, LiquidationValue, RecoveryRate
```

### 2.5 Safety Stock Component Hierarchy

```
SafetyStockPage (safety-stock/page.tsx)
├── PageHeader
│   └── "Safety Stock Optimization"
├── ServiceLevelTabs
│   ├── Tab: 90% (Z-score: 1.28)
│   ├── Tab: 95% (Z-score: 1.65) [default]
│   └── Tab: 99% (Z-score: 2.33)
├── FilterBar
│   └── CategorySelect
├── ComparisonTable
│   ├── TableHeader
│   │   └── Checkbox (select all)
│   └── TableBody
│       └── TableRow
│           ├── Checkbox
│           ├── ProductInfo
│           ├── CurrentSafetyStock
│           ├── RecommendedSafetyStock
│           ├── DemandVariability
│           └── CostImpact
├── ActionBar
│   └── ApplySelectedButton
└── WhatIfAnalysisCard
    └── Recharts LineChart
        └── X: ServiceLevel, Y: Cost
```

### 2.6 Multi-Location Component Hierarchy

```
MultiLocationPage (locations/page.tsx)
├── PageHeader
│   └── "Multi-Location Planning"
├── FilterBar
│   └── LocationSelect
├── LocationSummaryCards (3 cards)
│   ├── OptimalCard (CheckCircle, green)
│   ├── OverstockedCard (AlertTriangle, yellow)
│   └── UnderstockedCard (AlertTriangle, red)
├── LocationPerformanceChart
│   └── Recharts BarChart
│       └── X: Location, Y: InventoryValue
├── LocationBreakdownTable
│   ├── TableHeader
│   └── TableBody
│       └── TableRow
│           ├── LocationName
│           ├── InventoryValue
│           ├── TurnoverRate
│           ├── AlertCount
│           └── StatusBadge
└── TransferRecommendationsSection
    └── TransferTable
        └── TableRow
            ├── ProductInfo
            ├── FromLocation
            ├── ToLocation
            ├── Quantity
            ├── Reason
            ├── PriorityBadge
            ├── EstimatedSavings
            └── CreateTransferButton
```

### 2.7 Settings Component Hierarchy

```
SettingsPage (settings/page.tsx)
├── PageHeader
│   └── "Inventory Planning Settings"
├── DefaultParametersCard
│   ├── ServiceLevelSelect (90%, 95%, 99%)
│   ├── OrderCostInput (number, $)
│   ├── HoldingCostRateInput (number, %)
│   └── DefaultLeadTimeInput (number, days)
├── AlertThresholdsCard
│   ├── DeadStockThresholdInput (number, days)
│   ├── LowStockAlertSwitch
│   ├── DeadStockAlertSwitch
│   └── OverstockAlertSwitch
├── NotificationSettingsCard
│   ├── EmailNotificationsSwitch
│   ├── NotificationEmailInput
│   └── DigestFrequencySelect (Daily, Weekly, Monthly)
├── AutomationSettingsCard
│   ├── AutoApplyLowRiskSwitch
│   ├── AutoGenerateWeeklySwitch
│   └── SyncWithProcurementSwitch
└── ActionBar
    ├── SaveSettingsButton
    └── ResetToDefaultsButton
```

---

## 3. State Management

### 3.1 Dashboard State

```typescript
// Dashboard page local state
const [selectedLocation, setSelectedLocation] = useState<string>("all")

// Computed data using useMemo
const filteredData = useMemo(() => {
  if (selectedLocation === "all") return mockDashboardData
  // Filter logic
}, [selectedLocation])
```

### 3.2 Reorder Management State

```typescript
// Reorder page local state
const [selectedLocation, setSelectedLocation] = useState<string>("all")
const [actionFilter, setActionFilter] = useState<string>("all")
const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

// Toggle row expansion
const toggleRowExpanded = (id: string) => {
  const newExpanded = new Set(expandedRows)
  if (newExpanded.has(id)) {
    newExpanded.delete(id)
  } else {
    newExpanded.add(id)
  }
  setExpandedRows(newExpanded)
}

// Toggle item selection
const toggleItemSelected = (id: string) => {
  const newSelected = new Set(selectedItems)
  if (newSelected.has(id)) {
    newSelected.delete(id)
  } else {
    newSelected.add(id)
  }
  setSelectedItems(newSelected)
}
```

### 3.3 Dead Stock State

```typescript
// Dead stock page local state
const [thresholdDays, setThresholdDays] = useState<string>("90")
const [selectedLocation, setSelectedLocation] = useState<string>("all")
const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("all")
const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

// Filtered items with useMemo
const filteredItems = useMemo(() => {
  return mockDeadStockItems.filter(item => {
    if (thresholdDays !== "all" && item.daysSinceMovement < parseInt(thresholdDays)) {
      return false
    }
    if (selectedLocation !== "all" && item.locationId !== selectedLocation) {
      return false
    }
    if (selectedRiskLevel !== "all" && item.riskLevel !== selectedRiskLevel) {
      return false
    }
    return true
  })
}, [thresholdDays, selectedLocation, selectedRiskLevel])

// Risk counts with useMemo
const riskCounts = useMemo(() => {
  return {
    critical: filteredItems.filter(i => i.riskLevel === 'critical'),
    high: filteredItems.filter(i => i.riskLevel === 'high'),
    medium: filteredItems.filter(i => i.riskLevel === 'medium'),
    low: filteredItems.filter(i => i.riskLevel === 'low'),
  }
}, [filteredItems])
```

### 3.4 Safety Stock State

```typescript
// Safety stock page local state
const [serviceLevel, setServiceLevel] = useState<string>("95")
const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
const [selectedCategory, setSelectedCategory] = useState<string>("all")

// Z-score mapping
const getZScore = (level: string): number => {
  switch (level) {
    case "90": return 1.28
    case "95": return 1.65
    case "99": return 2.33
    default: return 1.65
  }
}
```

### 3.5 Multi-Location State

```typescript
// Multi-location page local state
const [selectedLocation, setSelectedLocation] = useState<string>("all")

// Location status counts with useMemo
const statusCounts = useMemo(() => {
  return {
    optimal: mockLocations.filter(l => l.status === 'optimal').length,
    overstocked: mockLocations.filter(l => l.status === 'overstocked').length,
    understocked: mockLocations.filter(l => l.status === 'understocked').length,
  }
}, [])
```

### 3.6 Settings State

```typescript
// Settings page local state
const [settings, setSettings] = useState<InventoryPlanningSettings>({
  defaultServiceLevel: "95",
  orderCostPerOrder: 50,
  holdingCostRate: 25,
  defaultLeadTime: 7,
  deadStockThreshold: 90,
  lowStockAlertEnabled: true,
  deadStockAlertEnabled: true,
  overstockAlertEnabled: true,
  emailNotificationsEnabled: true,
  notificationEmail: "",
  digestFrequency: "daily",
  autoApplyLowRisk: false,
  autoGenerateWeekly: true,
  syncWithProcurement: true,
})

// Update handler
const handleSettingChange = (key: keyof InventoryPlanningSettings, value: any) => {
  setSettings(prev => ({ ...prev, [key]: value }))
}
```

---

## 4. UI Components Specification

### 4.1 KPI Cards

```typescript
interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
}

// Usage in Dashboard
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium">{title}</CardTitle>
    <Icon className={`h-4 w-4 ${iconColor}`} />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{value}</div>
    {trend && (
      <p className={`text-xs ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {trend.direction === 'up' ? <TrendingUp /> : <TrendingDown />}
        {trend.value}% from last month
      </p>
    )}
  </CardContent>
</Card>
```

### 4.2 Badge Styling

```typescript
// Risk Level Badges
const riskBadgeStyles = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
}

// Action Type Badges
const actionBadgeStyles = {
  implement: "bg-green-100 text-green-800",
  pilot: "bg-blue-100 text-blue-800",
  monitor: "bg-yellow-100 text-yellow-800",
  reject: "bg-red-100 text-red-800",
}

// Location Status Badges
const statusBadgeStyles = {
  optimal: "bg-green-100 text-green-800",
  overstocked: "bg-yellow-100 text-yellow-800",
  understocked: "bg-red-100 text-red-800",
}

// Priority Badges
const priorityBadgeStyles = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
}
```

### 4.3 Expandable Table Row

```typescript
// Table row with expansion
<TableRow
  className="cursor-pointer hover:bg-muted/50"
  onClick={() => toggleRowExpanded(item.id)}
>
  <TableCell>
    <Checkbox
      checked={selectedItems.has(item.id)}
      onClick={(e) => e.stopPropagation()}
      onCheckedChange={() => toggleItemSelected(item.id)}
    />
  </TableCell>
  {/* Other cells */}
  <TableCell>
    {expandedRows.has(item.id) ? <ChevronUp /> : <ChevronDown />}
  </TableCell>
</TableRow>

{expandedRows.has(item.id) && (
  <TableRow>
    <TableCell colSpan={10}>
      <div className="p-4 bg-muted/20 rounded-lg">
        {/* Expanded content sections */}
      </div>
    </TableCell>
  </TableRow>
)}
```

### 4.4 Charts Configuration

```typescript
// Pie Chart (Optimization Actions)
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={[
        { name: 'Implement', value: 45, color: '#22c55e' },
        { name: 'Pilot', value: 30, color: '#3b82f6' },
        { name: 'Monitor', value: 50, color: '#f59e0b' },
        { name: 'Reject', value: 25, color: '#ef4444' },
      ]}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={100}
    >
      {data.map((entry, index) => (
        <Cell key={index} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>

// Bar Chart (Location Performance)
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={locationData} layout="vertical">
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis type="number" />
    <YAxis dataKey="name" type="category" />
    <Tooltip formatter={(value) => formatCurrency(value)} />
    <Bar dataKey="value" fill="#3b82f6" />
  </BarChart>
</ResponsiveContainer>

// Line Chart (What-If Analysis)
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={whatIfData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="serviceLevel" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="cost" stroke="#3b82f6" />
  </LineChart>
</ResponsiveContainer>
```

---

## 5. Performance Specifications

### 5.1 Performance Targets

| Operation | Target | Max Items |
|-----------|--------|-----------|
| Dashboard Load | < 2s | - |
| Table Render | < 200ms | 100 rows |
| Chart Render | < 300ms | 50 data points |
| Filter Application | < 100ms | 500 items |
| Row Expansion | < 50ms | - |

### 5.2 Optimization Strategies

| Strategy | Implementation |
|----------|----------------|
| Memoization | useMemo for filtered/computed data |
| Debounced Filters | 300ms delay for search inputs |
| Virtual Scrolling | For tables > 100 rows (future) |
| Lazy Loading | Charts load after initial render |
| Pagination | 50 items per page default |

---

## 6. Error Handling

### 6.1 Error Types

| Error Type | User Message | UI Treatment |
|------------|--------------|--------------|
| No Data | "No items found" | Empty state with setup instructions |
| Filter No Results | "No matching items" | Empty state with clear filters button |
| Invalid Input | Field-specific message | Inline error with red border |

### 6.2 Loading States

```typescript
// Loading state for data fetch
{isLoading && (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
)}

// Empty state
{!isLoading && items.length === 0 && (
  <div className="text-center py-12">
    <Package className="h-12 w-12 mx-auto text-muted-foreground" />
    <h3 className="mt-4 text-lg font-medium">No items found</h3>
    <p className="text-muted-foreground">Try adjusting your filters</p>
  </div>
)}
```

---

## 7. Security Considerations

### 7.1 Access Control (Future Implementation)

| Permission | Description | Roles |
|------------|-------------|-------|
| inventory_planning.view | View dashboard and reports | All authorized users |
| inventory_planning.optimize | Generate recommendations | Inventory Manager, Financial Controller |
| inventory_planning.apply | Apply recommendations | Inventory Manager |
| inventory_planning.settings | Configure settings | Inventory Manager, Admin |

### 7.2 Data Validation

- All numeric inputs bounded to reasonable ranges
- Location/Category IDs validated against available options
- Settings validated before save

---

## 8. Integration Points

### 8.1 Cross-Module Navigation

```typescript
// Dashboard to Demand Forecasting
<Link href="/operational-planning/demand-forecasting">
  Go to Demand Forecasting
</Link>

// Reorder to Stock Replenishment
<Link href="/store-operations/stock-replenishment">
  Stock Replenishment
</Link>

// Alert clicks to filtered pages
<Link href="/operational-planning/inventory-planning/reorder?filter=low-stock">
  {alerts.lowStock} Low Stock Items
</Link>
```

### 8.2 Future API Integration

```typescript
// Planned API endpoints
// GET /api/inventory/planning/dashboard
// GET /api/inventory/planning/reorder
// GET /api/inventory/planning/dead-stock
// GET /api/inventory/planning/safety-stock
// GET /api/inventory/planning/locations
// GET /api/inventory/planning/settings
// PUT /api/inventory/planning/settings
// POST /api/inventory/planning/apply-recommendations
```

---

## 9. Component Library Usage

### 9.1 Shadcn/ui Components

| Component | Usage |
|-----------|-------|
| Card, CardHeader, CardTitle, CardContent | KPI cards, section containers |
| Button | Actions, navigation |
| Badge | Risk levels, action types, statuses |
| Table, TableHeader, TableBody, TableRow, TableCell | Data tables |
| Select, SelectTrigger, SelectContent, SelectItem | Filters |
| Input | Settings inputs |
| Checkbox | Row selection |
| Switch | Boolean settings |
| Tabs, TabsList, TabsTrigger, TabsContent | Service level selection |
| Dialog | Confirmation dialogs |
| Label | Form labels |

### 9.2 Lucide React Icons

| Icon | Usage |
|------|-------|
| DollarSign | Total savings KPI |
| AlertTriangle | Items at risk, alerts |
| CheckCircle | Optimization rate, optimal status |
| Package | Dead stock, inventory |
| TrendingUp, TrendingDown | Trend indicators |
| ClipboardList | Items count |
| ArrowUpDown | Changes count |
| ChevronUp, ChevronDown | Row expansion |
| Settings | Settings page |
| BarChart2 | Charts |
| MapPin | Locations |

---

**Document End**
