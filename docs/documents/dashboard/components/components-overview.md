# Dashboard Components Overview

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Component Architecture

The Dashboard module consists of 4 main components that work together to provide a comprehensive system overview.

## 1. Dashboard Header Component

**File**: `/app/(main)/dashboard/components/dashboard-header.tsx`

### Purpose
Provides the top navigation bar with search, notifications, and settings access.

### Structure
```typescript
<header>
  <SidebarTrigger /> // Toggle sidebar
  <h1>Hotel Supply Chain Dashboard</h1>
  <Search Input /> // Desktop only
  <Bell Button /> // Notifications
  <Settings Button /> // Settings
</header>
```

### Features
- **Sidebar Toggle**: Opens/closes main navigation sidebar
- **Page Title**: "Hotel Supply Chain Dashboard"
- **Search Bar**: Global search (hidden on mobile, visible on md+ screens)
- **Notifications**: Bell icon button for system notifications
- **Settings**: Gear icon button for user/system settings

### Props
None (stateless component)

### Styling
- Height: 64px (h-16), reduced to 48px when sidebar is collapsed
- Responsive: Search hidden on mobile (<768px)
- Icons: 16px (h-4 w-4) Lucide icons
- Layout: Flexbox with space-between alignment

### Accessibility
- Screen reader labels on icon buttons
- Keyboard navigable
- Semantic header element

### Dependencies
- `@/components/ui/sidebar` - SidebarTrigger
- `@/components/ui/button` - Button component
- `@/components/ui/input` - Search input
- `lucide-react` - Icons (Bell, Search, Settings)

## 2. Dashboard Cards Component

**File**: `/app/(main)/dashboard/components/dashboard-cards.tsx`

### Purpose
Displays key performance indicators and status alerts in card format.

### Structure
```typescript
<div>
  {/* Main Metrics - 4 cards */}
  <MetricCard>
    - Total Orders
    - Active Suppliers
    - Inventory Value
    - Monthly Spend
  </MetricCard>

  {/* Status Cards - 3 cards */}
  <StatusCard>
    - Critical Stock Items
    - Orders Pending Approval
    - Completed Deliveries
  </StatusCard>
</div>
```

### Main Metric Cards

#### 1. Total Orders Card
- **Value**: Number of purchase orders
- **Change**: Percentage change from previous month
- **Trend**: Up/Down indicator
- **Icon**: ShoppingCart
- **Description**: "Purchase orders this month"
- **Current Mock Value**: 1,234 (+12.5%)

#### 2. Active Suppliers Card
- **Value**: Count of verified suppliers
- **Change**: Growth percentage
- **Trend**: Up/Down indicator
- **Icon**: Users
- **Description**: "Verified suppliers"
- **Current Mock Value**: 89 (+3.2%)

#### 3. Inventory Value Card
- **Value**: Total stock value in dollars
- **Change**: Value change percentage
- **Trend**: Up/Down indicator
- **Icon**: Package
- **Description**: "Current stock value"
- **Current Mock Value**: $45,231 (-2.4%)

#### 4. Monthly Spend Card
- **Value**: Total procurement spend
- **Change**: Spend change percentage
- **Trend**: Up/Down indicator
- **Icon**: DollarSign
- **Description**: "Total procurement spend"
- **Current Mock Value**: $89,432 (+8.7%)

### Status Alert Cards

#### 1. Critical Stock Items
- **Value**: Count of items below threshold
- **Status**: Critical (red badge)
- **Icon**: AlertTriangle
- **Description**: "Items below minimum threshold"
- **Current Mock Value**: 12 items

#### 2. Orders Pending Approval
- **Value**: Count of pending orders
- **Status**: Warning (yellow badge)
- **Icon**: Package
- **Description**: "Awaiting manager approval"
- **Current Mock Value**: 8 orders

#### 3. Completed Deliveries
- **Value**: Count of completed deliveries
- **Status**: Success (green badge)
- **Icon**: CheckCircle2
- **Description**: "This week"
- **Current Mock Value**: 156 deliveries

### Color Scheme
- **Green**: Positive trends, success states
- **Red**: Negative trends, critical alerts
- **Yellow**: Warning states
- **Muted**: Secondary information

### Responsive Grid
- **Mobile** (< 768px): 1 column
- **Tablet** (768px - 1024px): 2 columns
- **Desktop** (> 1024px): 4 columns (main metrics), 3 columns (status)

### Data Source
Currently uses static mock data. Future: API endpoint `/api/dashboard/metrics`

## 3. Dashboard Chart Component

**File**: `/app/(main)/dashboard/components/dashboard-chart.tsx`

### Purpose
Visualizes trends and analytics using interactive charts.

### Chart Types

#### 1. Order Trends (Area Chart)
**Layout**: Top-left position

**Configuration**:
- Type: Area chart with gradient fill
- Data Points: 6 months (Jan-Jun)
- X-Axis: Month names (abbreviated)
- Y-Axis: Hidden (shown in tooltip)
- Color: Chart-1 color variable
- Fill Opacity: 40%

**Data Structure**:
```typescript
{
  month: string
  orders: number
}
```

**Features**:
- Natural curve type
- Interactive tooltip on hover
- Responsive sizing
- Accessibility layer

#### 2. Spend Analysis (Bar Chart)
**Layout**: Top-right position

**Configuration**:
- Type: Bar chart with rounded corners
- Data Points: 6 months (Jan-Jun)
- X-Axis: Month names (abbreviated)
- Y-Axis: Hidden (shown in tooltip)
- Color: Chart-2 color variable
- Border Radius: 8px

**Data Structure**:
```typescript
{
  month: string
  spend: number // in thousands
}
```

**Features**:
- Rounded bar corners
- Hide label tooltip
- Responsive sizing
- Accessibility layer

#### 3. Supplier Network Growth (Line Chart)
**Layout**: Full-width bottom position (spans 2 columns)

**Configuration**:
- Type: Dual-line chart
- Data Points: 6 months (Jan-Jun)
- Lines: Suppliers (Chart-3) and Orders (Chart-1)
- X-Axis: Month names (abbreviated)
- Y-Axis: Hidden (shown in tooltip)
- Stroke Width: 2px
- Line Type: Monotone

**Data Structure**:
```typescript
{
  month: string
  suppliers: number
  orders: number
}
```

**Features**:
- Correlation visualization
- Dual-metric comparison
- Interactive tooltips
- Responsive sizing

### Chart Configuration
```typescript
chartConfig = {
  orders: {
    label: "Orders"
    color: "hsl(var(--chart-1))"
  }
  spend: {
    label: "Spend (k)"
    color: "hsl(var(--chart-2))"
  }
  suppliers: {
    label: "Suppliers"
    color: "hsl(var(--chart-3))"
  }
}
```

### Dependencies
- `recharts` - Chart library
- `@/components/ui/chart` - Chart container and tooltip components
- `@/components/ui/card` - Card wrapper

### Responsive Behavior
- **Mobile**: Stacked layout, reduced height
- **Tablet**: 2-column grid for first two charts
- **Desktop**: 2-column grid, full-width third chart

### Performance
- Client component (uses state)
- Lazy loaded with dynamic import
- Memoized data transformations
- Throttled tooltip updates

## 4. Dashboard Data Table Component

**File**: `/app/(main)/dashboard/components/dashboard-data-table.tsx`

### Purpose
Displays recent system activities in a sortable, actionable table format.

### Table Structure

#### Columns
1. **Type** - Activity type
   - Purchase Request
   - Purchase Order
   - Goods Receipt
   - Stock Adjustment
   - Vendor Invoice
   - Quality Check

2. **Document** - Document reference
   - Primary: Document number (e.g., PR-2401-0001)
   - Secondary: Internal ID

3. **Target** - Associated entity
   - Supplier name
   - Department name
   - Product category

4. **Status** - Current status with badge
   - Approved (green)
   - Processing (yellow)
   - Pending (yellow)
   - Under Review (blue)
   - Complete (green)
   - Failed (red)

5. **Priority** - Priority level with badge
   - Critical (red)
   - High (orange)
   - Medium (yellow)
   - Low (green)

6. **Reviewer** - Assigned person

7. **Date** - Activity date

8. **Actions** - Dropdown menu
   - View details
   - Edit
   - Delete (destructive)

### Data Structure
```typescript
interface Activity {
  id: number
  type: string
  header: string // Document number
  status: string
  target: string
  limit: string
  reviewer: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  date: string
}
```

### Color Functions

#### Status Colors
```typescript
getStatusColor(status: string) {
  'approved' | 'complete' → green
  'processing' | 'pending' → yellow
  'under review' → blue
  'failed' → red
  default → gray
}
```

#### Priority Colors
```typescript
getPriorityColor(priority: string) {
  'critical' → red
  'high' → orange
  'medium' → yellow
  'low' → green
  default → gray
}
```

### Actions Menu
**Trigger**: Three-dot (MoreHorizontal) icon button

**Menu Items**:
1. **View details**
   - Icon: Eye
   - Action: Navigate to detail page
   - Available: Always

2. **Edit**
   - Icon: Edit
   - Action: Open edit modal/page
   - Available: If user has permission

3. **Delete**
   - Icon: Trash2
   - Action: Delete with confirmation
   - Style: Red text (destructive)
   - Available: If user has permission

### Features
- **Responsive**: Horizontal scroll on mobile
- **Sortable**: Click column headers to sort (future)
- **Filterable**: Filter by type, status, priority (future)
- **Pagination**: Load more activities (future)
- **Real-time Updates**: WebSocket for live data (future)

### Accessibility
- Semantic table structure
- Row headers for screen readers
- Keyboard navigable dropdowns
- Focus indicators on rows
- ARIA labels on icon buttons

### Data Source
Currently uses static mock data (6 activities). Future: API endpoint `/api/dashboard/activities`

## Component Interactions

### Data Flow
```
Page Load
  ↓
DashboardHeader renders (static)
  ↓
DashboardCards fetches metrics
  ↓
DashboardChart fetches chart data
  ↓
DashboardDataTable fetches activities
  ↓
All components render with data
```

### User Interactions
1. **Search** (Header) → Navigate to search results
2. **Notifications** (Header) → Open notifications panel
3. **Settings** (Header) → Navigate to settings
4. **Metric Card Click** → Navigate to detailed view (future)
5. **Chart Click** → Drill-down to detailed analytics (future)
6. **Table Row Click** → Navigate to activity details (future)
7. **Action Menu** → View/Edit/Delete operations

## Shared Utilities

### Color Mapping
All components use consistent color scheme:
- Success/Positive: Green (`green-100` to `green-800`)
- Warning/Pending: Yellow (`yellow-100` to `yellow-800`)
- Info/Review: Blue (`blue-100` to `blue-800`)
- Error/Critical: Red (`red-100` to `red-800`)
- Neutral: Gray (`gray-100` to `gray-800`)

### Icon Library
All icons from `lucide-react`:
- TrendingUp, TrendingDown - Trend indicators
- Package, Users, ShoppingCart, DollarSign - Metric icons
- AlertTriangle, CheckCircle2 - Status icons
- Bell, Search, Settings - Action icons
- Eye, Edit, Trash2, MoreHorizontal - Table actions

## Testing Considerations

### Unit Tests
- Component rendering
- Data transformation functions
- Color mapping functions
- Icon selection logic

### Integration Tests
- Component interaction
- Data flow between components
- Event handling
- Navigation triggers

### Visual Regression Tests
- Chart rendering accuracy
- Responsive layout behavior
- Color consistency
- Typography hierarchy

## Performance Optimization

### Current Optimizations
1. **Static Components**: Header uses no state
2. **Memoization**: Card and chart data memoized
3. **Lazy Loading**: Charts lazy loaded
4. **Code Splitting**: Each component separately bundled

### Future Optimizations
1. Virtual scrolling for long activity lists
2. Chart data aggregation on server
3. Incremental static regeneration
4. Service worker caching
5. WebSocket connection pooling

## Dependencies Summary

### UI Components
- `@/components/ui/sidebar` - Sidebar components
- `@/components/ui/button` - Button component
- `@/components/ui/input` - Input component
- `@/components/ui/card` - Card components
- `@/components/ui/badge` - Badge component
- `@/components/ui/table` - Table components
- `@/components/ui/chart` - Chart container
- `@/components/ui/dropdown-menu` - Dropdown menu

### External Libraries
- `lucide-react` - Icon library
- `recharts` - Chart library
- `react` - React framework
- `next` - Next.js framework

### Type Definitions
All components use TypeScript with strict type checking. Interfaces are defined inline currently. Future: Move to centralized type definitions.
