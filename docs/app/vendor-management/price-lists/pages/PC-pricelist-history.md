# PC-pricelist-history.md - Price History Tracking Page

## Document Information
- **Page Name**: Price History Tracking
- **Route**: `/vendor-management/price-lists/history`
- **Parent Module**: Vendor Management > Price Lists
- **Related Documents**:
  - UC-price-lists.md (Use Cases)
  - BR-price-lists.md (Business Requirements)
  - TS-price-lists.md (Technical Specification)
  - PC-pricelist-list.md (List Page)
  - PC-pricelist-detail.md (Detail Page)
  - PC-pricelist-comparison.md (Comparison Tool)

---

## Page Overview

### Purpose
Comprehensive price history tracking and analytics tool that enables users to monitor, analyze, and understand pricing trends across all vendors, products, and time periods. Provides visual timeline, statistical analysis, volatility indicators, and detailed audit trail to support price forecasting, vendor negotiations, and cost management decisions.

### User Roles
- **All Users**: Can view price history and trends (read-only)
- **Procurement Staff**: Can export historical reports and set price alerts
- **Procurement Manager**: Full access including statistical analysis and forecasting
- **Finance Manager**: Access to cost trend analysis and budget planning data
- **Department Manager**: View history for assigned categories

### Key Features
- **Interactive Timeline View**: Visual timeline showing all price changes across vendors
- **Multi-Vendor Trend Charts**: Line charts comparing price trends across multiple vendors
- **Statistical Analysis**: Moving averages, standard deviation, price volatility metrics
- **Volatility Indicators**: Heat maps and indicators showing price stability
- **Price Change Audit Trail**: Complete change history with reasons and approvals
- **Historical Data Table**: Filterable table with all historical price data
- **Price Spike/Drop Alerts**: Automated alerts for significant price changes
- **Comparison Baseline Selector**: Set baseline for variance analysis
- **Product Drill-Down**: Click any product to see detailed pricing history
- **Export Historical Reports**: Excel, PDF, CSV with customizable date ranges
- **Trend Forecasting**: Basic price trend predictions based on historical data
- **Saved History Views**: Save and reload frequently used analysis configurations

---

## Page Layout

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Breadcrumb + Page Title + Action Buttons            │
├─────────────────────────────────────────────────────────────┤
│ Filter & Configuration Panel (Collapsible)                  │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Date Range | Products | Vendors | View Options     │    │
│ └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│ Summary Statistics Cards                                     │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ Avg Change│Volatility│ Alerts   │ Products │              │
│ └──────────┴──────────┴──────────┴──────────┘              │
├─────────────────────────────────────────────────────────────┤
│ View Toggle: [Timeline] [Chart] [Table] [Analysis]         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    Main Content Area                         │
│              (Timeline, Chart, Table, or Analysis)           │
│                                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop (≥1024px)**: Full layout, side-by-side panels, wide charts
- **Tablet (768px-1023px)**: Stacked panels, full-width charts, horizontal scroll
- **Mobile (<768px)**: Card-based layout, simplified charts, vertical scroll

---

## Page Header

### Breadcrumb
**Text**: Home / Vendor Management / Price Lists / Price History

**Style**:
- Text-sm, text-gray-500
- Links: text-blue-600 hover:text-blue-800 hover:underline
- Current: text-gray-900 font-medium
- Separator: text-gray-400 "/"

**Accessibility**:
- aria-label="Breadcrumb navigation"
- aria-current="page" on current item

### Page Title
**Text**: Price History & Trends

**Icon**: TrendingUp, size-6, text-purple-600, mr-3

**Style**: H1, text-2xl lg:text-3xl, font-bold, text-gray-900

**Subtitle**: Historical price tracking and analytics
- Text-sm, text-gray-600, mt-1

### Action Buttons

**Layout**: Flex row, gap-2, justify-end

| Button | Purpose | Icon | Style | Tooltip | Keyboard |
|--------|---------|------|-------|---------|----------|
| Set Alert | Configure price change alerts | Bell | Secondary | Set up price alerts | A |
| Export | Export historical report | Download | Secondary | Export to Excel/PDF | X |
| Save View | Save current analysis setup | Save | Secondary | Save for later use | S |
| Load View | Load saved analysis | FolderOpen | Secondary | Load saved view | L |
| Compare | Compare with other periods | GitCompare | Secondary | Compare periods | C |
| Refresh | Reload latest data | RefreshCw | Tertiary | Refresh data | R |

---

## Filter & Configuration Panel

### Panel Layout
**Container**: bg-white, border border-gray-200, rounded-lg, p-6, mb-6

**Collapsible**: Toggle button to hide/show panel after initial setup
- Default: Expanded on first visit
- Collapsed: Shows summary "Last 6 Months • 125 Products • 3 Vendors"

### Section 1: Date Range Selection

**Title**: Select Time Period

**Quick Presets** (Button group):
```
┌─────────────────────────────────────────────────────────────┐
│ [Last 30 Days] [Last 3 Months] [Last 6 Months]              │
│ [Last Year] [Year to Date] [All Time] [Custom]              │
└─────────────────────────────────────────────────────────────┘
```

**Custom Date Range** (appears when Custom selected):
```
┌─────────────────────────────────────────────────────────────┐
│ From: [Jan 1, 2023 📅]    To: [Jan 31, 2024 📅]            │
│                                                              │
│ [Apply Date Range]                                          │
└─────────────────────────────────────────────────────────────┘
```

**Date Picker Features**:
- Calendar popup with date range selection
- Max range: 5 years (configurable)
- Disable future dates
- Highlight data availability (dates with price data)
- Show data gaps with different styling

**Validation**:
- From date must be before To date
- Maximum range validation (5 years)
- Show warning if range >2 years: "Large date range may affect performance"

### Section 2: Product Selection

**Product Filter**:
```
┌─────────────────────────────────────────────────────────────┐
│ Products to Track:                                           │
│                                                              │
│ [🔍 Search products by name or code_______________]         │
│                                                              │
│ Selection Mode:                                              │
│ ( ) All Products (125 total)                                │
│ ( ) Selected Products Only                                  │
│ (•) By Category                                             │
│                                                              │
│ Categories (when "By Category" selected):                   │
│ ☑ Fresh Produce (89 products)                              │
│ ☑ Dairy Products (23 products)                             │
│ ☐ Meat & Poultry (34 products)                             │
│ ☐ Bakery Items (18 products)                               │
│                                                              │
│ Selected Products (12): Show list ▼                         │
└─────────────────────────────────────────────────────────────┘
```

**Product Selection Features**:
- Multi-select with checkboxes
- Search with real-time filtering
- Category-based selection
- Show product count per category
- Display selected products as tags (removable)
- "Select All" / "Select None" shortcuts

### Section 3: Vendor Selection

**Vendor Filter**:
```
┌─────────────────────────────────────────────────────────────┐
│ Vendors to Compare:                                          │
│                                                              │
│ ☑ ABC Foods Inc. (VEN-001)                                  │
│   Last updated: Jan 20, 2024 • 118 products tracked        │
│                                                              │
│ ☑ XYZ Distributors (VEN-002)                                │
│   Last updated: Jan 18, 2024 • 112 products tracked        │
│                                                              │
│ ☑ GreenFarm Suppliers (VEN-003)                             │
│   Last updated: Jan 15, 2024 • 98 products tracked         │
│                                                              │
│ ☐ FreshDirect Ltd. (VEN-004)                                │
│   Last updated: Jan 12, 2024 • 85 products tracked         │
│                                                              │
│ [+ Add More Vendors]    [Select All]    [Clear All]        │
└─────────────────────────────────────────────────────────────┘
```

**Vendor Selection Features**:
- Multi-select with checkboxes
- Show vendor code and last update date
- Show product count with historical data
- Highlight vendors with recent updates (within 7 days)
- Max 10 vendors for performance

### Section 4: View Options & Filters

**Display Options**:
```
┌─────────────────────────────────────────────────────────────┐
│ Display Options:                                             │
│                                                              │
│ Chart Settings:                                              │
│ ☑ Show moving average (30-day)                             │
│ ☑ Show trend lines                                         │
│ ☑ Highlight price spikes (>20% change)                     │
│ ☐ Show confidence intervals                                │
│                                                              │
│ Data Filters:                                                │
│ Price Change: [All Changes ▼]                               │
│   • All Changes                                             │
│   • Increases Only                                          │
│   • Decreases Only                                          │
│   • Significant Changes (>10%)                              │
│   • Spikes (>20%)                                           │
│                                                              │
│ Volatility: [All Levels ▼]                                  │
│   • All Levels                                              │
│   • High Volatility                                         │
│   • Medium Volatility                                       │
│   • Low Volatility (Stable)                                 │
│                                                              │
│ Baseline Comparison:                                         │
│ Compare to: [First Price in Range ▼]                        │
│   • First Price in Range                                    │
│   • Last Price in Range                                     │
│   • Average Price                                           │
│   • Specific Date: [Select Date 📅]                        │
│   • Specific Price List: [Select List ▼]                   │
│                                                              │
│ [Reset All Filters]                                         │
└─────────────────────────────────────────────────────────────┘
```

### Apply Button
```
┌─────────────────────────────────────────────────────────────┐
│              [🔍 Analyze Price History →]                    │
│         (Enabled when valid selection made)                  │
└─────────────────────────────────────────────────────────────┘
```

**Button States**:
- Disabled (gray): No products or vendors selected
- Enabled (blue): Valid selection made
- Loading: "Analyzing..." with spinner

---

## Summary Statistics Cards

**After analysis generated**:

**Layout**: Grid 4 columns on desktop, 2 on tablet, 1 on mobile

### Card 1: Average Price Change
```
┌────────────────────────┐
│ 📊 Avg Price Change    │
│                        │
│ +5.2%                  │
│ over selected period   │
│                        │
│ ↑ 78 increases         │
│ ↓ 32 decreases         │
│ → 15 unchanged         │
└────────────────────────┘
```

**Card Style**:
- Large metric: text-3xl font-bold
- Color: Green if negative (price decrease), Red if positive (price increase)
- Sub-metrics: text-sm text-gray-600

### Card 2: Price Volatility
```
┌────────────────────────┐
│ ⚡ Price Volatility    │
│                        │
│ Medium                 │
│ Std Dev: $1.23         │
│                        │
│ 12 High volatility     │
│ 45 Medium volatility   │
│ 68 Low volatility      │
└────────────────────────┘
```

**Volatility Levels**:
- High: Std Dev > 20% of average price
- Medium: Std Dev 10-20% of average price
- Low: Std Dev < 10% of average price

**Card Style**:
- Volatility badge: High (red), Medium (yellow), Low (green)
- Distribution bars showing breakdown

### Card 3: Price Alerts
```
┌────────────────────────┐
│ 🔔 Price Alerts        │
│                        │
│ 8 Active Alerts        │
│ 3 triggered today      │
│                        │
│ 2 Spike alerts         │
│ 1 Drop alert           │
└────────────────────────┘
```

**Interaction**:
- Click card to view all alerts
- Badge showing triggered count
- Quick link to configure alerts

### Card 4: Products Tracked
```
┌────────────────────────┐
│ 📦 Products Tracked    │
│                        │
│ 125 Products           │
│ across 3 vendors       │
│                        │
│ 5-year history         │
│ 1,234 price changes    │
└────────────────────────┘
```

**Metrics**:
- Total products in analysis
- Vendor count
- History depth (years)
- Total price change events

---

## View Toggle

**Toggle Buttons**:
```
┌─────────────────────────────────────────────────────────────┐
│ View: [Timeline] [Chart] [Table] [Analysis]                 │
└─────────────────────────────────────────────────────────────┘
```

**Button States**:
- Active: bg-blue-600, text-white
- Inactive: bg-white, text-gray-700, border-gray-300
- Hover: border-gray-400, shadow-sm

**Keyboard Navigation**:
- Tab to cycle through views
- T for Timeline, C for Chart, T for Table, A for Analysis

---

## View 1: Timeline View

### Timeline Layout
```
┌─────────────────────────────────────────────────────────────┐
│                        Timeline                              │
│                                                              │
│ Jan 2023 ─────────────────────────────── Jan 2024          │
│    ││││    ││    ││││    │    ││││││    ││                │
│    ││││    ││    ││││    │    ││││││    ││                │
│                                                              │
│ Legend:                                                      │
│ │ Price increase  │ Price decrease  │ No change            │
│ Red              Green             Gray                     │
│                                                              │
│ Filter timeline:                                             │
│ [All Vendors ▼] [All Products ▼] [All Changes ▼]           │
└─────────────────────────────────────────────────────────────┘
```

### Timeline Elements

**Time Axis**:
- Horizontal axis showing date range
- Major ticks: Months
- Minor ticks: Weeks
- Labels: MMM YYYY format
- Zoom controls: +/- buttons, date range slider

**Price Change Markers**:
```
Each marker represents a price change event:

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│ Jan 15  ABC Foods - Fresh Tomatoes                          │
│    │    $2.50 → $2.75 (+10%)                               │
│    │                                                         │
│ Jan 20  XYZ Dist - Fresh Tomatoes                          │
│    │    $2.60 → $2.55 (-2%)                                │
│    │                                                         │
│ Jan 25  GreenFarm - Fresh Tomatoes                         │
│    │    $2.70 → $2.90 (+7.4%)                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Marker Style**:
- Circle marker on timeline
- Size: 8px (normal), 12px (significant change >10%), 16px (spike >20%)
- Color: Red (increase), Green (decrease), Gray (no change)
- Tooltip on hover showing details
- Click to open detail dialog

**Grouping Options**:
```
┌─────────────────────────────────────────────────────────────┐
│ Group by: (•) Vendor  ( ) Product  ( ) Category             │
└─────────────────────────────────────────────────────────────┘
```

**Grouped Timeline** (when grouped by Vendor):
```
┌─────────────────────────────────────────────────────────────┐
│ ABC Foods Inc.                                               │
│ Jan ────────│─────│────│──────│────────────│────── Dec      │
│                                                              │
│ XYZ Distributors                                             │
│ Jan ─────│────│─────────│────│────│───────────│──── Dec     │
│                                                              │
│ GreenFarm Suppliers                                          │
│ Jan ────│────│──────│────────│────│──────────────── Dec     │
└─────────────────────────────────────────────────────────────┘
```

### Timeline Controls

**Zoom Controls**:
- Zoom In: Show daily view
- Zoom Out: Show yearly view
- Fit to Window: Auto-scale to show all data
- Date Range Slider: Drag to adjust visible range

**Navigation**:
- Pan left/right: Arrow keys or drag
- Jump to date: Click date on axis
- Today button: Jump to current date (if in range)

### Timeline Interactions

**Hover State**:
- Highlight all changes on same date
- Show vertical line on hover date
- Display tooltip with summary

**Click Action**:
- Single click: Open price change detail dialog
- Double click: Zoom to product history
- Right click: Context menu (Export, Set Alert, Compare)

**Tooltip Content**:
```
┌─────────────────────────────────────────┐
│ Jan 15, 2024                            │
│                                         │
│ Fresh Tomatoes - ABC Foods              │
│ $2.50 → $2.75                          │
│ Change: +$0.25 (+10.0%)                │
│                                         │
│ Reason: Seasonal price increase        │
│ Approved by: Sarah Johnson             │
│                                         │
│ [View Details →]                       │
└─────────────────────────────────────────┘
```

---

## View 2: Chart View

### Chart Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Chart Type: [Line Chart ▼]                                  │
│                                                              │
│   Price Trend - Fresh Tomatoes                              │
│                                                              │
│ $3.00 ┐                                                     │
│       │     ╱──╲     ABC Foods                             │
│ $2.75 ┤    ╱    ╲   ╱                                      │
│       │   ╱      ╲ ╱   XYZ Dist                            │
│ $2.50 ┤──╱        ╳                                         │
│       │          ╱ ╲   GreenFarm                            │
│ $2.25 ┤         ╱   ╲╱                                      │
│       │        ╱                                            │
│ $2.00 ┴────────────────────────────────                    │
│       Jan  Feb  Mar  Apr  May  Jun                         │
│                                                              │
│ Legend: ─── ABC Foods  ─── XYZ Dist  ─── GreenFarm        │
└─────────────────────────────────────────────────────────────┘
```

### Chart Types

**Available Chart Types**:
| Type | Purpose | Best For |
|------|---------|----------|
| Line Chart | Price trends over time | Comparing multiple vendors |
| Area Chart | Price ranges with fill | Showing price volatility |
| Bar Chart | Period-over-period comparison | Monthly/quarterly analysis |
| Scatter Plot | Price distribution | Identifying outliers |
| Candlestick | Open/High/Low/Close prices | Detailed price movements |

### Chart Configuration

**Chart Settings Panel**:
```
┌─────────────────────────────────────────────────────────────┐
│ Chart Configuration:                                         │
│                                                              │
│ Y-Axis:                                                      │
│ Scale: (•) Linear  ( ) Logarithmic                          │
│ Range: ( ) Auto  (•) Custom [$0 to $5]                     │
│                                                              │
│ X-Axis:                                                      │
│ Grouping: [Daily ▼]                                         │
│   • Daily                                                    │
│   • Weekly                                                   │
│   • Monthly                                                  │
│   • Quarterly                                                │
│                                                              │
│ Data Display:                                                │
│ ☑ Show data points                                         │
│ ☑ Show trend line                                          │
│ ☑ Show moving average (30-day)                             │
│ ☑ Show statistical bands (±1 std dev)                      │
│ ☐ Show forecast (next 30 days)                             │
│                                                              │
│ Annotations:                                                 │
│ ☑ Mark significant changes (>20%)                          │
│ ☑ Show alert triggers                                      │
│ ☐ Show approval dates                                      │
│                                                              │
│ [Apply Settings]                                            │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Product Chart

**Product Selector** (when multiple products selected):
```
┌─────────────────────────────────────────────────────────────┐
│ Products in Chart:                                           │
│                                                              │
│ ☑ Fresh Tomatoes (3 vendors) ─── Red line                 │
│ ☑ Fresh Lettuce (3 vendors)  ─── Green line               │
│ ☑ Fresh Carrots (2 vendors)  ─── Orange line              │
│                                                              │
│ [+ Add Product]  Max: 5 products                            │
└─────────────────────────────────────────────────────────────┘
```

**Small Multiples View** (grid of mini charts):
```
┌─────────────────────────────────────────────────────────────┐
│ Fresh Tomatoes        Fresh Lettuce       Fresh Carrots     │
│ ┌─────────┐          ┌─────────┐         ┌─────────┐       │
│ │  ╱╲ ╱  │          │╲  ╱╲   │         │ ╱──╲    │       │
│ │ ╱  ╲╱   │          │ ╲╱  ╲  │         │╱    ╲   │       │
│ └─────────┘          └─────────┘         └─────────┘       │
│ +5.2%                -2.1%               +8.3%              │
│                                                              │
│ Fresh Onions          Fresh Peppers      Fresh Cucumbers    │
│ ┌─────────┐          ┌─────────┐         ┌─────────┐       │
│ │    ╱──  │          │╲    ╱│          │  ╱╲ ╱╲ │       │
│ │ ──╱     │          │ ╲──╱  │         │ ╱  ╳  ╲│       │
│ └─────────┘          └─────────┘         └─────────┘       │
│ +12.5%               -5.8%               +3.2%              │
└─────────────────────────────────────────────────────────────┘
```

### Chart Interactions

**Hover State**:
- Show crosshair on hover
- Display tooltip with exact values
- Highlight corresponding data point on all series

**Tooltip Content**:
```
┌─────────────────────────────────────────┐
│ Jan 15, 2024                            │
│                                         │
│ ABC Foods: $2.75                       │
│ XYZ Dist: $2.55                        │
│ GreenFarm: $2.90                       │
│                                         │
│ Best Price: $2.55 (XYZ Dist)           │
│ Avg Price: $2.73                       │
│ Range: $0.35 (12.8%)                   │
└─────────────────────────────────────────┘
```

**Click Actions**:
- Click data point: Open price change detail
- Click legend: Toggle vendor visibility
- Double click: Zoom to time range
- Right click: Export chart image

**Zoom & Pan**:
- Scroll wheel: Zoom in/out
- Click & drag: Pan chart
- Zoom controls: +/- buttons
- Reset zoom: Double-click background

### Chart Export

**Export Options**:
- PNG: High-resolution image (300 DPI)
- SVG: Vector format for scaling
- PDF: Printable report format
- Data: Export underlying data as CSV

---

## View 3: Statistical Analysis View

### Analysis Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Statistical Analysis                                         │
│                                                              │
│ ┌─────────────────────┬─────────────────────┐              │
│ │ Summary Statistics  │ Volatility Analysis │              │
│ └─────────────────────┴─────────────────────┘              │
│                                                              │
│ ┌─────────────────────┬─────────────────────┐              │
│ │ Trend Analysis      │ Price Distribution  │              │
│ └─────────────────────┴─────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Correlation Matrix (Multi-Product)        │              │
│ └───────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Panel 1: Summary Statistics

**Product Selector**:
```
┌─────────────────────────────────────────────────────────────┐
│ Analyze: [Fresh Tomatoes ▼]                                 │
└─────────────────────────────────────────────────────────────┘
```

**Statistics Table**:
```
┌─────────────────────────────────────────────────────────────┐
│ Summary Statistics - Fresh Tomatoes                          │
│                                                              │
│ Statistic          ABC Foods   XYZ Dist    GreenFarm   All  │
│ ────────────────────────────────────────────────────────────│
│ Current Price      $2.75       $2.55       $2.90       -    │
│ Average Price      $2.65       $2.58       $2.82       $2.68│
│ Median Price       $2.70       $2.60       $2.85       $2.72│
│ Min Price          $2.30       $2.25       $2.50       $2.25│
│ Max Price          $2.95       $2.85       $3.10       $3.10│
│ Price Range        $0.65       $0.60       $0.60       $0.85│
│ Std Deviation      $0.18       $0.15       $0.16       $0.19│
│ Coefficient Var    6.8%        5.8%        5.7%        7.1%│
│ Total Changes      12          10          8           30  │
│ Avg Change         +2.3%       +1.8%       +3.1%       +2.4%│
│ Price Volatility   Medium      Low         Low         Med │
└─────────────────────────────────────────────────────────────┘
```

**Table Features**:
- Sortable columns
- Export to Excel/CSV
- Compare vendors side-by-side
- Highlight best/worst values

### Panel 2: Volatility Analysis

**Volatility Heat Map**:
```
┌─────────────────────────────────────────────────────────────┐
│ Price Volatility by Product & Vendor                         │
│                                                              │
│ Product          ABC Foods   XYZ Dist    GreenFarm          │
│ ────────────────────────────────────────────────────────────│
│ Fresh Tomatoes   [Medium]    [Low]       [Low]              │
│ Fresh Lettuce    [High]      [Medium]    [Medium]           │
│ Fresh Carrots    [Low]       [Low]       [High]             │
│ Fresh Onions     [High]      [High]      [Medium]           │
│ Fresh Peppers    [Medium]    [Low]       [Low]              │
│                                                              │
│ Legend: Low (Green) | Medium (Yellow) | High (Red)          │
└─────────────────────────────────────────────────────────────┘
```

**Heat Map Colors**:
- Green (bg-green-100): Low volatility (CoV < 5%)
- Yellow (bg-yellow-100): Medium volatility (CoV 5-10%)
- Red (bg-red-100): High volatility (CoV > 10%)

**Volatility Details** (click cell for details):
```
┌─────────────────────────────────────────┐
│ Fresh Tomatoes - ABC Foods              │
│                                         │
│ Volatility: Medium (6.8%)               │
│ Std Deviation: $0.18                   │
│ Price Range: $2.30 - $2.95             │
│                                         │
│ Contributing Factors:                   │
│ • 2 spike events (>20% increase)       │
│ • Seasonal variations                   │
│ • Supply chain disruptions             │
│                                         │
│ Recommendation:                         │
│ Consider longer-term contracts to      │
│ stabilize pricing                       │
│                                         │
│ [Set Price Alert] [View History]      │
└─────────────────────────────────────────┘
```

### Panel 3: Trend Analysis

**Trend Indicators**:
```
┌─────────────────────────────────────────────────────────────┐
│ Price Trends - Last 6 Months                                 │
│                                                              │
│ Product          Trend     Direction  Rate      Confidence  │
│ ────────────────────────────────────────────────────────────│
│ Fresh Tomatoes   ↗️ Up     Increasing  +0.8%/mo  High      │
│ Fresh Lettuce    ↘️ Down   Decreasing  -0.5%/mo  Medium    │
│ Fresh Carrots    → Stable  Flat        +0.1%/mo  High      │
│ Fresh Onions     ↗️↗️ Up   Accelerating +1.5%/mo  High     │
│ Fresh Peppers    ↘️ Down   Decreasing  -0.3%/mo  Low       │
└─────────────────────────────────────────────────────────────┘
```

**Trend Icons**:
- ↗️ Increasing: Positive slope
- ↘️ Decreasing: Negative slope
- → Stable: Near-zero slope
- ↗️↗️ Accelerating: Increasing rate of change
- ↘️↘️ Declining: Decreasing rate of change

**Trend Chart** (inline mini chart):
```
Each row shows mini sparkline:
Fresh Tomatoes   ↗️ Up     [  ╱──╲  ╱── ]  +0.8%/mo
Fresh Lettuce    ↘️ Down   [ ╲   ╲╱     ]  -0.5%/mo
Fresh Carrots    → Stable  [ ─────────── ]  +0.1%/mo
```

**Forecast Section**:
```
┌─────────────────────────────────────────────────────────────┐
│ Price Forecast - Next 30 Days                                │
│                                                              │
│ Fresh Tomatoes:                                              │
│ Current: $2.75                                               │
│ Forecast (30d): $2.82 ± $0.15                              │
│ Trend: Slight increase expected                             │
│ Confidence: 75%                                              │
│                                                              │
│ Factors:                                                     │
│ • Historical trend: +0.8%/month                             │
│ • Seasonal pattern: Increasing in this period               │
│ • Recent changes: Stable last 2 weeks                       │
│                                                              │
│ Note: Forecast based on historical patterns. Actual         │
│ prices may vary due to market conditions.                   │
└─────────────────────────────────────────────────────────────┘
```

### Panel 4: Price Distribution

**Distribution Chart** (histogram):
```
┌─────────────────────────────────────────────────────────────┐
│ Price Distribution - Fresh Tomatoes (All Vendors)            │
│                                                              │
│ Frequency                                                    │
│    12 ┤                                                      │
│    10 ┤     ███                                             │
│     8 ┤     ███                                             │
│     6 ┤ ███ ███ ███                                         │
│     4 ┤ ███ ███ ███ ███                                     │
│     2 ┤ ███ ███ ███ ███ ███                                 │
│     0 ┴─────────────────────────────                        │
│       $2.20 $2.40 $2.60 $2.80 $3.00                        │
│                                                              │
│ Mean: $2.68  Median: $2.72  Mode: $2.75                    │
│ Normal distribution test: p = 0.15 (Normal)                 │
└─────────────────────────────────────────────────────────────┘
```

**Distribution Statistics**:
- Mean: Average price
- Median: Middle value
- Mode: Most common price
- Skewness: Asymmetry measure
- Kurtosis: Tail heaviness
- Normal distribution test (Shapiro-Wilk)

**Outlier Detection**:
```
┌─────────────────────────────────────────────────────────────┐
│ Outliers Detected (>2 std dev from mean):                   │
│                                                              │
│ Date        Vendor      Product    Price   Deviation        │
│ ────────────────────────────────────────────────────────────│
│ Jan 5, 2024 GreenFarm   Tomatoes   $3.10   +2.2σ (High)   │
│ Feb 12, 2024 ABC Foods   Tomatoes   $2.20   -2.5σ (Low)    │
│                                                              │
│ [Investigate] [Set Alert] [Mark as Exception]               │
└─────────────────────────────────────────────────────────────┘
```

### Panel 5: Correlation Matrix (Multi-Product)

**Correlation Heat Map**:
```
┌─────────────────────────────────────────────────────────────┐
│ Price Correlation Matrix (Pearson)                          │
│                                                              │
│                Tomatoes Lettuce Carrots Onions Peppers      │
│ Tomatoes       [1.00]   [0.75]  [0.42]  [0.18]  [0.63]     │
│ Lettuce        [0.75]   [1.00]  [0.55]  [0.22]  [0.71]     │
│ Carrots        [0.42]   [0.55]  [1.00]  [0.08]  [0.38]     │
│ Onions         [0.18]   [0.22]  [0.08]  [1.00]  [0.15]     │
│ Peppers        [0.63]   [0.71]  [0.38]  [0.15]  [1.00]     │
│                                                              │
│ Color Scale: Strong (0.7-1.0) | Moderate (0.4-0.7) | Weak (<0.4) │
└─────────────────────────────────────────────────────────────┘
```

**Correlation Colors**:
- Dark Green: Strong positive correlation (0.7-1.0)
- Light Green: Moderate positive correlation (0.4-0.7)
- Gray: Weak correlation (<0.4)
- Diagonal: Always 1.0 (self-correlation)

**Interpretation**:
```
┌─────────────────────────────────────────┐
│ Correlation Insights                    │
│                                         │
│ Strong Correlations (>0.7):             │
│ • Tomatoes ↔ Lettuce (0.75)            │
│   Prices tend to move together         │
│                                         │
│ • Lettuce ↔ Peppers (0.71)             │
│   Prices tend to move together         │
│                                         │
│ Weak Correlations (<0.3):               │
│ • Carrots ↔ Onions (0.08)              │
│   Independent price movements           │
│                                         │
│ Action: Products with strong            │
│ correlation could be bundled for        │
│ better pricing negotiations             │
└─────────────────────────────────────────┘
```

---

## View 4: Historical Data Table

### Table Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Historical Price Data                                        │
│                                                              │
│ [🔍 Search__________] [Export ▼] [Columns ▼] [Filters ▼]  │
│                                                              │
│ Showing 1-25 of 1,234 price changes                         │
└─────────────────────────────────────────────────────────────┘
```

### Table Structure

**Table Headers**:
| Column | Sortable | Width | Sticky | Tooltip |
|--------|----------|-------|--------|---------|
| Date | Yes | 110px | Left | Date of price change |
| Product | Yes | 180px | Left | Product name and code |
| Vendor | Yes | 140px | No | Vendor name |
| Previous Price | Yes | 100px | No | Price before change |
| New Price | Yes | 100px | No | Current price |
| Change | Yes | 90px | No | Price change amount and % |
| Reason | No | 150px | No | Change reason/notes |
| Changed By | Yes | 120px | No | User who submitted |
| Status | Yes | 100px | No | Approval status |
| Actions | No | 80px | Right | Quick actions |

**Sample Row**:
```
| Jan 15, 2024 | Fresh Tomatoes | ABC Foods | $2.50 | $2.75 | +$0.25 (+10%) | Seasonal | John Smith | Approved | [...] |
```

### Cell Formatting

**Date Column**:
- Format: MMM DD, YYYY
- Relative time tooltip: "15 days ago"
- Grouping option: Group by month

**Product Column**:
```
Fresh Tomatoes
PROD-001 • Fresh Produce
```
- Product name (bold)
- Product code + category (text-sm text-gray-600)

**Vendor Column**:
```
ABC Foods Inc.
VEN-001
```
- Vendor name (bold)
- Vendor code (text-sm text-gray-600)

**Price Columns** (Previous/New):
- Format: $0.00 (2 decimals)
- Alignment: Right-aligned
- Font: Monospace (font-mono) for alignment

**Change Column**:
```
+$0.25
+10.0%
```
- Amount and percentage on separate lines
- Color: Green for decrease, Red for increase
- Icon: ↑ increase, ↓ decrease, → no change
- Bold if change >10%

**Reason Column**:
- Text truncated to 50 characters
- Tooltip shows full text
- Common reasons as tags (colored)

**Changed By Column**:
```
John Smith
Jan 15, 2:30 PM
```
- User name
- Timestamp (text-sm text-gray-600)

**Status Column** (badge):
| Status | Color | Icon |
|--------|-------|------|
| Approved | Green | CheckCircle |
| Pending | Yellow | Clock |
| Rejected | Red | XCircle |
| Auto-Updated | Blue | RefreshCw |

**Actions Column** (icon buttons):
- View Details (Eye icon): Open price change detail dialog
- Compare (GitCompare icon): Compare with other prices
- Set Alert (Bell icon): Create price alert
- More (MoreVertical icon): Additional actions

### Table Features

**Search**:
- Real-time search across all visible columns
- Placeholder: "Search by product, vendor, or reason..."
- Clear button (X) appears when typing

**Filters**:
```
┌─────────────────────────────────────────────────────────────┐
│ Filters:                                                     │
│                                                              │
│ Date Range:     [Last 6 Months ▼]                           │
│ Product:        [All Products ▼]                            │
│ Vendor:         [All Vendors ▼]                             │
│ Category:       [All Categories ▼]                          │
│ Change Type:    [All Changes ▼]                             │
│ Status:         [All Statuses ▼]                            │
│ Price Range:    [$___] to [$___]                           │
│ Change Range:   [___]% to [___]%                           │
│                                                              │
│ [Apply Filters] [Reset]                                     │
└─────────────────────────────────────────────────────────────┘
```

**Column Selector**:
```
┌─────────────────────────────────────────┐
│ Show/Hide Columns:                      │
│                                         │
│ ☑ Date                                 │
│ ☑ Product                              │
│ ☑ Vendor                               │
│ ☑ Previous Price                       │
│ ☑ New Price                            │
│ ☑ Change                               │
│ ☑ Reason                               │
│ ☑ Changed By                           │
│ ☑ Status                               │
│ ☐ Approval Date                        │
│ ☐ Price List Reference                 │
│ ☐ Effective Date                       │
│                                         │
│ [Select All] [Reset to Default]        │
└─────────────────────────────────────────┘
```

**Sorting**:
- Click column header to sort
- First click: Ascending
- Second click: Descending
- Third click: Remove sort
- Multi-column sort: Hold Shift + click
- Sort indicator: ↑ ↓ icons

**Pagination**:
```
┌─────────────────────────────────────────────────────────────┐
│ Rows per page: [25 ▼]                                       │
│                                                              │
│ [← Previous] Page 1 of 50 [Next →]                          │
│                                                              │
│ Go to page: [__] [Go]                                       │
└─────────────────────────────────────────────────────────────┘
```

**Pagination Options**:
- Rows per page: 10, 25, 50, 100, All
- Previous/Next buttons
- Jump to page input
- Keyboard: PageUp/PageDown to navigate

**Export Options**:
```
┌─────────────────────────────────────────┐
│ Export Historical Data:                 │
│                                         │
│ ( ) Current page (25 rows)             │
│ ( ) Filtered data (456 rows)           │
│ (•) All data (1,234 rows)              │
│                                         │
│ Format:                                 │
│ ( ) Excel (.xlsx)                      │
│ ( ) CSV (.csv)                         │
│ ( ) PDF Report                         │
│                                         │
│ Include:                                │
│ ☑ Summary statistics                  │
│ ☑ Charts                               │
│ ☐ Full change notes                   │
│                                         │
│ [Cancel] [Export]                      │
└─────────────────────────────────────────┘
```

### Row Actions

**Hover State**:
- Highlight row on hover (bg-gray-50)
- Show action buttons
- Change cursor to pointer

**Click Row**:
- Single click: Select row (checkbox)
- Double click: Open price change detail dialog

**Bulk Actions** (when rows selected):
```
┌─────────────────────────────────────────────────────────────┐
│ 12 items selected                                            │
│                                                              │
│ [Export Selected] [Set Alert] [Compare] [Clear Selection]  │
└─────────────────────────────────────────────────────────────┘
```

---

## Price Change Detail Dialog

**Trigger**: Click on timeline marker, chart data point, or table row action

### Dialog Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Price Change Details                                    [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Fresh Tomatoes - ABC Foods Inc.                             │
│ Price Change on Jan 15, 2024                                │
│                                                              │
│ ┌─────────────────────┬─────────────────────┐              │
│ │ Previous Price      │ New Price           │              │
│ │ $2.50              │ $2.75               │              │
│ └─────────────────────┴─────────────────────┘              │
│                                                              │
│ Change: +$0.25 (+10.0%) ↑                                  │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Change Details                            │              │
│ │                                           │              │
│ │ Reason: Seasonal price increase           │              │
│ │ Effective Date: Jan 20, 2024              │              │
│ │ Valid Until: Apr 20, 2024                 │              │
│ │                                           │              │
│ │ Submitted By: John Smith                  │              │
│ │ Department: Procurement                   │              │
│ │ Submission Date: Jan 15, 2024 10:30 AM    │              │
│ │                                           │              │
│ │ Price List: PL-2401-0001                   │              │
│ │ Reference: Fresh Produce - January 2024   │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Approval Workflow                         │              │
│ │                                           │              │
│ │ Step 1: Department Manager                │              │
│ │ ✓ Approved by Sarah Johnson               │              │
│ │   Jan 15, 2024 2:15 PM                    │              │
│ │   Comment: "Approved. Seasonal pricing    │              │
│ │   is within acceptable range."            │              │
│ │                                           │              │
│ │ Step 2: Procurement Manager               │              │
│ │ ✓ Approved by Mike Chen                   │              │
│ │   Jan 16, 2024 9:45 AM                    │              │
│ │   Comment: "Final approval granted."      │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Price History Context (Last 6 months)     │              │
│ │                                           │              │
│ │ ┌─────────────────────────────────────┐  │              │
│ │ │   Price Trend Chart                  │  │              │
│ │ │ $3.00 ┐                              │  │              │
│ │ │       │     ╱──╲                     │  │              │
│ │ │ $2.75 ┤    ╱    ╲   ← Current       │  │              │
│ │ │       │   ╱      ╲                   │  │              │
│ │ │ $2.50 ┤──╱        ╲                  │  │              │
│ │ │       │                              │  │              │
│ │ │ $2.25 ┴──────────────────────────   │  │              │
│ │ │       Aug  Sep  Oct  Nov  Dec  Jan  │  │              │
│ │ └─────────────────────────────────────┘  │              │
│ │                                           │              │
│ │ Historical Statistics:                    │              │
│ │ Average Price (6mo): $2.65                │              │
│ │ Min Price: $2.30 (Nov 12, 2023)          │              │
│ │ Max Price: $2.95 (Oct 8, 2023)           │              │
│ │ Volatility: Medium (6.8%)                 │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Vendor Comparison (Same Date)             │              │
│ │                                           │              │
│ │ ABC Foods:    $2.75 (This price) 🥉      │              │
│ │ XYZ Dist:     $2.55 🥇 Best price        │              │
│ │ GreenFarm:    $2.90                       │              │
│ │ FreshDirect:  $2.65 🥈                    │              │
│ │                                           │              │
│ │ This price is $0.20 higher than best     │              │
│ │ Potential savings: 7.3%                   │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ [Set Price Alert] [Compare Prices] [View Full History]     │
│                                                              │
│ [Close]                                                      │
└─────────────────────────────────────────────────────────────┘
```

### Dialog Features

**Price Change Summary**:
- Previous and new prices side-by-side
- Change amount and percentage with color coding
- Visual indicator (↑ ↓ →)

**Change Details Section**:
- Reason for change (required field)
- Effective date range
- Submitter information
- Related price list reference

**Approval Workflow Section**:
- Show all approval steps
- Approver name and timestamp
- Approval comments
- Status icons (✓ ✕ ⏳)

**Historical Context Chart**:
- Mini line chart showing last 6 months
- Highlight current change position
- Show average, min, max prices
- Volatility indicator

**Vendor Comparison Section**:
- Compare with other vendors on same date
- Rank prices (🥇 🥈 🥉)
- Show potential savings
- Quick link to full comparison

**Action Buttons**:
- Set Price Alert: Create alert for future changes
- Compare Prices: Open comparison tool
- View Full History: Navigate to full history page
- Close: Dismiss dialog

---

## Set Price Alert Dialog

**Trigger**: Click "Set Alert" button in header or price change detail

### Dialog Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Set Price Alert                                         [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Create automated alert for price changes                     │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Alert Settings                            │              │
│ │                                           │              │
│ │ Alert Name: *                             │              │
│ │ [Fresh Tomatoes Price Alert_________]     │              │
│ │                                           │              │
│ │ Alert For:                                │              │
│ │ (•) Specific Product                      │              │
│ │ ( ) Product Category                      │              │
│ │ ( ) All Products                          │              │
│ │                                           │              │
│ │ Product: *                                │              │
│ │ [Fresh Tomatoes ▼]                        │              │
│ │                                           │              │
│ │ Vendor:                                   │              │
│ │ ( ) All Vendors                           │              │
│ │ (•) Specific Vendors                      │              │
│ │ ☑ ABC Foods Inc.                         │              │
│ │ ☑ XYZ Distributors                       │              │
│ │ ☑ GreenFarm Suppliers                    │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Trigger Conditions                        │              │
│ │                                           │              │
│ │ Alert when price:                         │              │
│ │ ☑ Increases by more than [10___]%        │              │
│ │ ☑ Decreases by more than [10___]%        │              │
│ │ ☑ Exceeds $[3.00___]                     │              │
│ │ ☑ Falls below $[2.00___]                 │              │
│ │ ☐ Changes (any amount)                   │              │
│ │ ☐ Becomes highest among vendors          │              │
│ │ ☐ Becomes lowest among vendors           │              │
│ │ ☐ Volatility exceeds [15___]%            │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Notification Settings                     │              │
│ │                                           │              │
│ │ Notify me via:                            │              │
│ │ ☑ Email (john.smith@example.com)         │              │
│ │ ☑ In-app notification                    │              │
│ │ ☐ SMS (+1 555-0123)                      │              │
│ │                                           │              │
│ │ Notification Frequency:                   │              │
│ │ (•) Immediately                           │              │
│ │ ( ) Daily digest                          │              │
│ │ ( ) Weekly summary                        │              │
│ │                                           │              │
│ │ Active Period:                            │              │
│ │ From: [Jan 1, 2024 📅]                   │              │
│ │ To:   [Dec 31, 2024 📅]                  │              │
│ │ ☑ Indefinite (no end date)               │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Preview                                   │              │
│ │                                           │              │
│ │ Alert Summary:                            │              │
│ │ "Fresh Tomatoes Price Alert" will notify │              │
│ │ you immediately via Email and In-app when │              │
│ │ the price for Fresh Tomatoes from ABC     │              │
│ │ Foods, XYZ Distributors, or GreenFarm     │              │
│ │ increases by more than 10%, decreases by  │              │
│ │ more than 10%, exceeds $3.00, or falls    │              │
│ │ below $2.00.                              │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ [Cancel] [Create Alert]                                     │
└─────────────────────────────────────────────────────────────┘
```

### Alert Features

**Alert Configuration**:
- Name for easy identification
- Scope: Specific product, category, or all products
- Vendor selection: All or specific vendors

**Trigger Conditions**:
- Percentage increase threshold
- Percentage decrease threshold
- Maximum price threshold
- Minimum price threshold
- Any change detection
- Relative position (highest/lowest)
- Volatility threshold

**Notification Options**:
- Email notifications
- In-app notifications
- SMS notifications (if configured)
- Frequency: Immediate, daily digest, weekly summary

**Active Period**:
- Start and end dates
- Option for indefinite alerts
- Automatic deactivation after end date

**Preview Section**:
- Plain English summary of alert
- Review before creating

---

## Export Historical Report Dialog

**Trigger**: Click "Export" button in header

### Dialog Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Export Historical Report                                [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Export Scope                              │              │
│ │                                           │              │
│ │ Data to Export:                           │              │
│ │ (•) Current view (125 products)           │              │
│ │ ( ) Filtered data (456 changes)           │              │
│ │ ( ) Custom selection                      │              │
│ │                                           │              │
│ │ Date Range:                               │              │
│ │ From: [Jan 1, 2023 📅]                   │              │
│ │ To:   [Jan 31, 2024 📅]                  │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Report Format                             │              │
│ │                                           │              │
│ │ (•) Excel Workbook (.xlsx)                │              │
│ │     ☑ Include summary dashboard           │              │
│ │     ☑ Include charts                      │              │
│ │     ☑ Include pivot tables                │              │
│ │     ☑ Separate sheet per vendor           │              │
│ │                                           │              │
│ │ ( ) PDF Report (.pdf)                     │              │
│ │     ☑ Executive summary                   │              │
│ │     ☑ Price trend charts                  │              │
│ │     ☑ Statistical analysis                │              │
│ │     ☑ Vendor comparison tables            │              │
│ │                                           │              │
│ │ ( ) CSV Data (.csv)                       │              │
│ │     Simple data export for analysis       │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Report Content                            │              │
│ │                                           │              │
│ │ Include:                                  │              │
│ │ ☑ Raw price data                         │              │
│ │ ☑ Summary statistics                     │              │
│ │ ☑ Price trends & forecasts               │              │
│ │ ☑ Volatility analysis                    │              │
│ │ ☑ Vendor comparisons                     │              │
│ │ ☑ Change reasons & notes                 │              │
│ │ ☑ Approval history                       │              │
│ │ ☐ Full audit trail                       │              │
│ │                                           │              │
│ │ Grouping:                                 │              │
│ │ [By Product ▼]                            │              │
│ │   • By Product                            │              │
│ │   • By Vendor                             │              │
│ │   • By Category                           │              │
│ │   • By Time Period                        │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Report Options                            │              │
│ │                                           │              │
│ │ Report Title:                             │              │
│ │ [Price History Report - 2023-2024____]    │              │
│ │                                           │              │
│ │ Include company branding:                 │              │
│ │ ☑ Company logo                           │              │
│ │ ☑ Report header/footer                   │              │
│ │                                           │              │
│ │ Report prepared by:                       │              │
│ │ John Smith (Auto-populated)               │              │
│ │                                           │              │
│ │ Include date range in filename:           │              │
│ │ ☑ Yes (Report_2023-01_2024-01.xlsx)      │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Estimated File Size: 2.4 MB               │              │
│ │ Estimated Export Time: 10-15 seconds      │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ [Cancel] [Export Report]                                    │
└─────────────────────────────────────────────────────────────┘
```

### Export Features

**Export Scope**:
- Current view: Export what's currently displayed
- Filtered data: Export based on active filters
- Custom selection: Choose specific products/vendors/dates

**Format Options**:

**Excel (.xlsx)**:
- Summary dashboard sheet with key metrics
- Charts and visualizations
- Pivot tables for analysis
- Separate sheets per vendor/category
- Formatted tables with conditional formatting

**PDF (.pdf)**:
- Executive summary page
- Price trend charts
- Statistical analysis section
- Vendor comparison tables
- Professional formatting
- Page numbers and headers/footers

**CSV (.csv)**:
- Simple comma-separated data
- All columns included
- No formatting or charts
- Easy import to other tools

**Report Content**:
- Select which data to include
- Grouping options (product, vendor, category, time)
- Customizable title
- Company branding options

**Estimated Metrics**:
- File size prediction
- Export time estimate
- Warning for large exports

---

## Saved Views Feature

**Purpose**: Save frequently used analysis configurations for quick access

### Save Current View Dialog

**Trigger**: Click "Save View" button

```
┌─────────────────────────────────────────────────────────────┐
│ Save Current View                                       [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ View Name: *                                                 │
│ [Fresh Produce Monthly Trends_________________]             │
│                                                              │
│ Description (optional):                                      │
│ [Monthly price trends for fresh produce category       ]    │
│ [to support budget planning and vendor negotiations    ]    │
│                                                              │
│ This view will save:                                         │
│ ✓ Date range (Last 6 Months)                                │
│ ✓ Selected products (12 products in Fresh Produce)          │
│ ✓ Selected vendors (3 vendors)                              │
│ ✓ Active filters and view options                           │
│ ✓ Chart type and configuration                              │
│                                                              │
│ Visibility:                                                  │
│ (•) Private (Only visible to me)                            │
│ ( ) Shared (Share with team)                                │
│                                                              │
│ Set as default view:                                         │
│ ☐ Load this view automatically when I visit this page       │
│                                                              │
│ [Cancel] [Save View]                                        │
└─────────────────────────────────────────────────────────────┘
```

### Load Saved View Dialog

**Trigger**: Click "Load View" button

```
┌─────────────────────────────────────────────────────────────┐
│ Load Saved View                                         [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [🔍 Search saved views___________________]                  │
│                                                              │
│ My Saved Views (4):                                          │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Fresh Produce Monthly Trends                         │    │
│ │ Monthly price trends for fresh produce category     │    │
│ │ Last used: 2 days ago                               │    │
│ │ [Load] [Edit] [Delete]                              │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Dairy Price Analysis Q1 2024                        │    │
│ │ Quarterly analysis for dairy products               │    │
│ │ Last used: 1 week ago                               │    │
│ │ [Load] [Edit] [Delete]                              │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ All Vendors Price Comparison                        │    │
│ │ Compare prices across all active vendors            │    │
│ │ Last used: 3 weeks ago                              │    │
│ │ [Load] [Edit] [Delete]                              │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ Shared Views (2):                                            │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Weekly Procurement Review                            │    │
│ │ Shared by: Sarah Johnson (Procurement Manager)      │    │
│ │ [Load] [Copy to My Views]                           │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ [Close]                                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Empty States

### No Data Available
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     📊                                       │
│                                                              │
│                No Price History Data                         │
│                                                              │
│   No historical price data available for the selected        │
│   filters. Try adjusting your date range, products, or      │
│   vendors to see results.                                    │
│                                                              │
│   [Reset Filters] [View All History]                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### No Saved Views
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     💾                                       │
│                                                              │
│                No Saved Views Yet                            │
│                                                              │
│   Save your frequently used analysis configurations for     │
│   quick access later.                                        │
│                                                              │
│   [Create First Saved View]                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### No Alerts Configured
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     🔔                                       │
│                                                              │
│                No Price Alerts Set                           │
│                                                              │
│   Stay informed about significant price changes. Set up     │
│   automated alerts to monitor products and vendors.         │
│                                                              │
│   [Set Your First Alert]                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Loading States

### Initial Load
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ⏳                                       │
│                                                              │
│            Loading Price History Data...                     │
│                                                              │
│   [▓▓▓▓▓▓▓▓░░░░░░░░] 60%                                   │
│                                                              │
│   Fetching 125 products from 3 vendors                       │
│   Analyzing 1,234 price changes                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Chart Loading (Skeleton)
```
┌─────────────────────────────────────────────────────────────┐
│ Price Trend Chart                                            │
│                                                              │
│ [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]        │
│ [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]        │
│ [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]        │
│ [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]        │
│                                                              │
│ Loading chart data...                                        │
└─────────────────────────────────────────────────────────────┘
```

### Table Loading (Skeleton)
```
┌─────────────────────────────────────────────────────────────┐
│ Date        Product         Vendor      Price      Change   │
│ ───────────────────────────────────────────────────────────│
│ [░░░░░░]   [░░░░░░░░░░]   [░░░░░░]   [░░░░░]   [░░░░░]    │
│ [░░░░░░]   [░░░░░░░░░░]   [░░░░░░]   [░░░░░]   [░░░░░]    │
│ [░░░░░░]   [░░░░░░░░░░]   [░░░░░░]   [░░░░░]   [░░░░░]    │
│                                                              │
│ Loading historical data...                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Error States

### Data Load Error
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ⚠️                                       │
│                                                              │
│            Failed to Load Price History                      │
│                                                              │
│   We encountered an error while loading the price history   │
│   data. This might be a temporary issue.                    │
│                                                              │
│   Error: Unable to connect to database                       │
│   Error Code: DB_CONNECTION_TIMEOUT                          │
│                                                              │
│   [Try Again] [Contact Support]                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Export Error
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ❌                                       │
│                                                              │
│               Export Failed                                  │
│                                                              │
│   The report export failed. The file may be too large or    │
│   there was a temporary issue.                              │
│                                                              │
│   Suggestions:                                               │
│   • Reduce the date range                                   │
│   • Select fewer products or vendors                         │
│   • Try exporting as CSV instead                            │
│                                                              │
│   [Try Again] [Adjust Filters] [Cancel]                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Alert Creation Error
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ⚠️                                       │
│                                                              │
│          Failed to Create Price Alert                        │
│                                                              │
│   The price alert could not be created. Please check your   │
│   settings and try again.                                    │
│                                                              │
│   Issue: Invalid threshold values                            │
│                                                              │
│   [Review Settings] [Cancel]                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Design

### Desktop View (≥1024px)
- Full layout with side-by-side panels
- Wide charts (800px+)
- 4-column summary cards
- Multi-column tables
- All features visible

### Tablet View (768px-1023px)
- Stacked panels
- Full-width charts (600px)
- 2-column summary cards
- Horizontal scroll for tables
- Collapsible filter panel (default collapsed)

### Mobile View (<768px)
- Single-column layout
- Simplified charts (400px)
- 1-column summary cards (stacked)
- Card-based table view (one row per card)
- Bottom sheet for filters
- Horizontal tab scrolling
- Sticky header with essential actions

**Mobile Table Card**:
```
┌─────────────────────────────────────┐
│ Jan 15, 2024                        │
│ Fresh Tomatoes - ABC Foods          │
│                                     │
│ $2.50 → $2.75                      │
│ +$0.25 (+10.0%) ↑                  │
│                                     │
│ Reason: Seasonal price increase    │
│ Status: ✓ Approved                 │
│                                     │
│ [View Details] [...]               │
└─────────────────────────────────────┘
```

---

## Accessibility (WCAG 2.1 AA Compliance)

### Keyboard Navigation
- **Tab**: Navigate between interactive elements
- **Shift+Tab**: Navigate backwards
- **Enter/Space**: Activate buttons, toggle selections
- **Arrow Keys**: Navigate timeline, chart, table rows
- **Escape**: Close dialogs and dropdowns
- **T/C/T/A**: Switch between Timeline/Chart/Table/Analysis views
- **Ctrl+F**: Focus search input
- **Ctrl+E**: Focus export button
- **Ctrl+S**: Save current view

### Screen Reader Support
- **ARIA Labels**: All interactive elements properly labeled
- **ARIA Live Regions**: Dynamic content updates announced
- **Landmark Regions**: Proper semantic structure (header, main, navigation)
- **Table Semantics**: Proper th, td, caption usage
- **Chart Alt Text**: Text descriptions of chart data
- **Status Announcements**: Alert creation, data load completion

**Example ARIA**:
```html
<button aria-label="Export price history report" aria-describedby="export-tooltip">
  <Download aria-hidden="true" />
  Export
</button>

<div role="region" aria-label="Price trend chart" aria-describedby="chart-description">
  <canvas id="price-chart"></canvas>
  <div id="chart-description" class="sr-only">
    Line chart showing price trends for Fresh Tomatoes from Jan 2023 to Jan 2024.
    ABC Foods prices ranged from $2.30 to $2.95 with an average of $2.65.
  </div>
</div>

<table role="table" aria-label="Historical price data">
  <caption>Historical price changes for selected products and vendors</caption>
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">Date</th>
      <th scope="col">Product</th>
      ...
    </tr>
  </thead>
</table>
```

### Visual Accessibility
- **Color Contrast**: All text meets 4.5:1 ratio
- **Color Coding**: Never rely on color alone (icons + text)
- **Focus Indicators**: Visible 3px outline on focus
- **Text Size**: Minimum 14px (base), scalable with browser zoom
- **Spacing**: Adequate padding and margins (min 8px)
- **Target Size**: Interactive elements minimum 44x44px

### Error Handling
- **Form Validation**: Inline error messages with ARIA
- **Error Summary**: List of errors at top of form
- **Focus Management**: Focus first error on submission
- **Clear Instructions**: Help text before fields

---

## Performance Optimization

### Data Loading Strategy
- **Lazy Loading**: Load timeline/chart data on demand
- **Pagination**: Limit table to 25 rows per page (default)
- **Virtual Scrolling**: For large tables (>1000 rows)
- **Data Aggregation**: Pre-aggregate statistics on server
- **Caching**: Cache frequently accessed historical data (Redis)
- **Progressive Loading**: Load summary first, details on demand

### Chart Performance
- **Canvas Rendering**: Use HTML5 Canvas for large datasets
- **Data Decimation**: Reduce data points for display (keep raw data)
- **Debounced Updates**: Delay chart updates during rapid interactions
- **WebGL**: Use for extremely large datasets (>10,000 points)

### API Optimization
- **GraphQL**: Request only needed fields
- **Compression**: Gzip response data
- **CDN**: Cache static assets (charts, images)
- **Connection Pooling**: Reuse database connections
- **Query Optimization**: Indexed queries, proper joins

**Performance Targets**:
- Initial page load: <2 seconds
- Timeline render: <1 second (1,000 events)
- Chart render: <1 second (500 data points)
- Table pagination: <500ms
- Export generation: <10 seconds (1 year data)

---

## Security Considerations

### Data Access Control
- **Role-Based Access**: Filter data by user permissions
- **Vendor Isolation**: Vendors see only their own data
- **Department Filtering**: Department managers see assigned categories
- **Audit Logging**: Log all data access and exports

### Export Security
- **File Encryption**: Encrypt sensitive reports
- **Watermarking**: Add user/timestamp to PDF exports
- **Download Limits**: Rate limit export requests
- **Temporary Files**: Delete exported files after download

### Price Alert Security
- **Email Validation**: Verify email addresses
- **Rate Limiting**: Limit alert creation frequency
- **Injection Prevention**: Sanitize alert criteria
- **Permission Checks**: Verify user can set alerts

### API Security
- **Authentication**: JWT tokens required
- **Authorization**: Validate permissions on every request
- **Input Validation**: Sanitize all user inputs
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Prevention**: Escape output, CSP headers

---

## Analytics Tracking

### Page Events
```javascript
// Page view
analytics.track('Price History Viewed', {
  user_role: 'procurement_staff',
  date_range: 'last_6_months',
  product_count: 125,
  vendor_count: 3
});

// View change
analytics.track('Price History View Changed', {
  from_view: 'timeline',
  to_view: 'chart',
  product_count: 125
});

// Filter applied
analytics.track('Price History Filtered', {
  filter_type: 'date_range',
  filter_value: 'last_3_months',
  result_count: 456
});

// Alert created
analytics.track('Price Alert Created', {
  alert_type: 'price_increase',
  threshold: '10%',
  product: 'Fresh Tomatoes',
  vendor_count: 3
});

// Export generated
analytics.track('Price History Exported', {
  export_format: 'excel',
  data_scope: 'filtered',
  row_count: 456,
  date_range: '2023-01-01_2024-01-31'
});
```

### User Interaction Events
- Timeline marker clicked
- Chart data point hovered
- Table row selected
- Saved view loaded
- Statistical analysis viewed

### Performance Metrics
- Page load time
- Chart render time
- Table pagination time
- Export generation time
- API response times

---

## API Integration

### Endpoints

**GET /api/price-lists/history**
```javascript
// Fetch price history data
const response = await fetch('/api/price-lists/history?{params}');

// Query Parameters:
// - product_ids: string[] (comma-separated)
// - vendor_ids: string[] (comma-separated)
// - category_ids: string[] (comma-separated)
// - start_date: ISO date string
// - end_date: ISO date string
// - change_type: 'all' | 'increase' | 'decrease' | 'significant'
// - page: number
// - limit: number
// - sort_by: string
// - sort_order: 'asc' | 'desc'

// Response:
{
  "data": [
    {
      "id": "ph-001",
      "date": "2024-01-15T00:00:00Z",
      "product_id": "PROD-001",
      "product_name": "Fresh Tomatoes",
      "vendor_id": "VEN-001",
      "vendor_name": "ABC Foods Inc.",
      "previous_price": 2.50,
      "new_price": 2.75,
      "change_amount": 0.25,
      "change_percentage": 10.0,
      "reason": "Seasonal price increase",
      "submitted_by": "user-123",
      "submitted_at": "2024-01-15T10:30:00Z",
      "status": "approved",
      "price_list_id": "PL-2401-0001"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 1234,
    "pages": 50
  },
  "summary": {
    "total_changes": 1234,
    "increases": 780,
    "decreases": 320,
    "unchanged": 134,
    "avg_change_percentage": 5.2
  }
}
```

**GET /api/price-lists/history/statistics**
```javascript
// Fetch statistical analysis
const response = await fetch('/api/price-lists/history/statistics?{params}');

// Response:
{
  "product_id": "PROD-001",
  "vendor_statistics": [
    {
      "vendor_id": "VEN-001",
      "vendor_name": "ABC Foods Inc.",
      "current_price": 2.75,
      "average_price": 2.65,
      "median_price": 2.70,
      "min_price": 2.30,
      "max_price": 2.95,
      "price_range": 0.65,
      "std_deviation": 0.18,
      "coefficient_of_variation": 6.8,
      "total_changes": 12,
      "avg_change_percentage": 2.3,
      "volatility": "medium"
    }
  ]
}
```

**POST /api/price-lists/alerts**
```javascript
// Create price alert
const response = await fetch('/api/price-lists/alerts', {
  method: 'POST',
  body: JSON.stringify({
    name: "Fresh Tomatoes Price Alert",
    product_id: "PROD-001",
    vendor_ids: ['VEN-001', 'VEN-002'],
    conditions: {
      increase_threshold: 10,
      decrease_threshold: 10,
      max_price: 3.00,
      min_price: 2.00
    },
    notifications: {
      email: true,
      in_app: true,
      frequency: "immediate"
    },
    active_from: "2024-01-01",
    active_to: "2024-12-31"
  })
});

// Response:
{
  "id": "alert-001",
  "status": "active",
  "created_at": "2024-01-20T10:00:00Z"
}
```

**POST /api/price-lists/history/export**
```javascript
// Export historical report
const response = await fetch('/api/price-lists/history/export', {
  method: 'POST',
  body: JSON.stringify({
    format: "excel",
    scope: "filtered",
    filters: {
      product_ids: ['PROD-001', 'PROD-002'],
      vendor_ids: ['VEN-001', 'VEN-002'],
      start_date: "2023-01-01",
      end_date: "2024-01-31"
    },
    options: {
      include_summary: true,
      include_charts: true,
      grouping: "by_product"
    }
  })
});

// Response:
{
  "export_id": "exp-001",
  "status": "processing",
  "download_url": "/api/downloads/exp-001",
  "estimated_completion": "2024-01-20T10:15:00Z"
}
```

---

## Browser Compatibility

### Supported Browsers
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari: iOS 14+
- Chrome Mobile: Android 10+

### Progressive Enhancement
- **Modern Browsers**: Full feature set with charts and animations
- **Older Browsers**: Fallback to table view, simplified interactions
- **No JavaScript**: Basic table display with server-side pagination

### Polyfills Required
- IntersectionObserver (for lazy loading)
- ResizeObserver (for responsive charts)
- Intl.NumberFormat (for number formatting)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 20, 2024 | System | Initial creation - Complete price history tracking specification |

---

## Related Documentation

**Must Read**:
- BR-price-lists.md: Business requirements and rules
- TS-price-lists.md: Technical specifications and data models
- UC-price-lists.md: Use cases and user workflows

**Related Pages**:
- PC-pricelist-list.md: Price list management
- PC-pricelist-detail.md: Individual price list details
- PC-pricelist-comparison.md: Multi-dimensional price comparison
- PC-pricelist-alerts.md: Alert management (to be created)

**Reference**:
- Design System Guide: UI components and patterns
- Analytics Guide: Event tracking standards
- Accessibility Guide: WCAG compliance checklist
- Performance Guide: Optimization best practices

---

**END OF DOCUMENT**
