# PC-pricelist-comparison.md - Price List Comparison Tool

## Document Information
- **Page Name**: Price List Comparison Tool
- **Route**: `/vendor-management/price-lists/compare`
- **Parent Module**: Vendor Management > Price Lists
- **Related Documents**:
  - UC-price-lists.md (Use Cases)
  - BR-price-lists.md (Business Requirements)
  - TS-price-lists.md (Technical Specification)
  - PC-pricelist-list.md (List Page)
  - PC-pricelist-detail.md (Detail Page)
  - PC-pricelist-history.md (Price History)

---

## Page Overview

### Purpose
Advanced price comparison tool that enables procurement teams to analyze and compare pricing across multiple dimensions: vendors, time periods, price lists, and product categories. Provides visual analytics, savings calculations, and detailed insights to support data-driven purchasing decisions.

### User Roles
- **All Users**: Can view and perform comparisons (read-only)
- **Procurement Staff**: Can create, save, and export comparison reports
- **Procurement Manager**: Full access including historical trend analysis
- **Finance Manager**: Access to cost analysis and savings reports

### Key Features
- **4 Comparison Modes**: Multi-Vendor, Multi-Period, Multi-List, Category Analysis
- **Interactive Comparison Table**: Side-by-side price comparison with color-coded highlighting
- **Visual Analytics**: Charts showing price trends, distribution, and outliers
- **Savings Calculator**: Real-time calculation of potential savings
- **Smart Filtering**: Filter by product, category, price range, vendor
- **Product Drill-Down**: Click product to see detailed pricing history
- **Export Reports**: Excel, PDF, CSV with customizable templates
- **Saved Comparisons**: Save and reload frequently used comparisons
- **Sharing**: Share comparison reports via email or link

---

## Page Layout

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Breadcrumb + Page Title + Action Buttons            │
├─────────────────────────────────────────────────────────────┤
│ Comparison Setup Panel (Collapsible)                        │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Mode Selection | Price List Selection | Filters     │    │
│ └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│ Summary Cards                                                │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ Products │ Avg Price│ Savings  │ Best Deal│              │
│ └──────────┴──────────┴──────────┴──────────┘              │
├─────────────────────────────────────────────────────────────┤
│ View Toggle: [Table] [Chart] [Split]                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    Comparison Content                        │
│              (Table, Chart, or Split View)                   │
│                                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop (≥1024px)**: Full layout, side-by-side comparison table
- **Tablet (768px-1023px)**: Stacked layout, horizontal scroll for comparison
- **Mobile (<768px)**: Card-based comparison, swipe between price lists

---

## Page Header

### Breadcrumb
**Text**: Home / Vendor Management / Price Lists / Compare

**Style**:
- Text-sm, text-gray-500
- Links: text-blue-600 hover:text-blue-800 hover:underline
- Current: text-gray-900 font-medium
- Separator: text-gray-400 "/"

### Page Title
**Text**: Compare Price Lists

**Icon**: GitCompare, size-6, text-blue-600, mr-3

**Style**: H1, text-2xl lg:text-3xl, font-bold, text-gray-900

### Action Buttons

**Layout**: Flex row, gap-2, justify-end

| Button | Purpose | Icon | Style | Tooltip |
|--------|---------|------|-------|---------|
| Save Comparison | Save current comparison setup | Save | Secondary | Save for later use |
| Load Saved | Load previously saved comparison | FolderOpen | Secondary | Load saved comparison |
| Export | Export comparison report | Download | Secondary | Export to Excel/PDF |
| Share | Share comparison via email/link | Share2 | Secondary | Share with team |
| Clear | Reset all selections | X | Tertiary | Clear and start over |

---

## Comparison Setup Panel

### Panel Layout
**Container**: bg-white, border border-gray-200, rounded-lg, p-6, mb-6

**Collapsible**: Toggle button to hide/show panel after initial setup
- Default: Expanded on first visit
- Collapsed: Shows summary "Comparing 3 price lists • 125 products"

### Section 1: Comparison Mode Selection

**Title**: Select Comparison Mode

**Mode Cards** (radio button cards, 4 options):

```
┌─────────────────────────────────────────────────────────────┐
│ ( ) Multi-Vendor Comparison                                 │
│     Compare same products across different vendors          │
│     Best for: Finding best vendor for specific products     │
│                                                              │
│ ( ) Multi-Period Comparison                                 │
│     Compare same vendor's prices over time                  │
│     Best for: Tracking price trends and fluctuations        │
│                                                              │
│ ( ) Multi-List Comparison                                   │
│     Compare specific price lists side-by-side               │
│     Best for: Detailed analysis of 2-5 price lists          │
│                                                              │
│ ( ) Category Analysis                                       │
│     Compare pricing by product categories                   │
│     Best for: Category-level vendor comparison              │
└─────────────────────────────────────────────────────────────┘
```

**Card Style**:
- Border: border-2 border-gray-200
- Selected: border-blue-600, bg-blue-50
- Hover: border-gray-300, shadow-sm
- Icon in top-right: CheckCircle (visible when selected)

### Section 2: Price List Selection (Dynamic based on mode)

#### For Multi-Vendor Mode

**Product Selection First**:
```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Select Products to Compare                          │
│                                                              │
│ [Search products________________] [🔍]                      │
│                                                              │
│ Selected Products (12):                                     │
│ ✓ Fresh Tomatoes (PROD-001)                    [✕]         │
│ ✓ Fresh Lettuce (PROD-002)                     [✕]         │
│ ✓ Fresh Carrots (PROD-003)                     [✕]         │
│ ... 9 more products                                         │
│                                                              │
│ [+ Add Products] [Load from Category]                      │
└─────────────────────────────────────────────────────────────┘
```

**Vendor Selection**:
```
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Select Vendors to Compare                           │
│                                                              │
│ ☑ ABC Foods Inc. (VEN-001)                                  │
│   Latest Price List: Jan 2024 • 118/125 products priced    │
│                                                              │
│ ☑ XYZ Distributors (VEN-002)                                │
│   Latest Price List: Jan 2024 • 112/125 products priced    │
│                                                              │
│ ☑ GreenFarm Suppliers (VEN-003)                             │
│   Latest Price List: Dec 2023 • 98/125 products priced     │
│                                                              │
│ [+ Add More Vendors] (max 5)                                │
└─────────────────────────────────────────────────────────────┘
```

#### For Multi-Period Mode

**Vendor Selection**:
```
┌─────────────────────────────────────────────────────────────┐
│ Vendor: [ABC Foods Inc. ▼]                                  │
└─────────────────────────────────────────────────────────────┘
```

**Time Period Selection**:
```
┌─────────────────────────────────────────────────────────────┐
│ Time Range: [Last 6 Months ▼]                               │
│                                                              │
│ Options:                                                     │
│ • Last 3 Months                                             │
│ • Last 6 Months                                             │
│ • Last 12 Months                                            │
│ • Year to Date                                              │
│ • Custom Date Range                                         │
│                                                              │
│ Found 4 price lists from ABC Foods in this period:         │
│ ☑ Jan 2024 (PL-2401-0001) - 125 products                    │
│ ☑ Dec 2023 (PL-2301-0045) - 118 products                    │
│ ☑ Nov 2023 (PL-2301-0032) - 115 products                    │
│ ☑ Oct 2023 (PL-2301-0018) - 110 products                    │
└─────────────────────────────────────────────────────────────┘
```

#### For Multi-List Mode

**Price List Selection**:
```
┌─────────────────────────────────────────────────────────────┐
│ Select Price Lists to Compare (2-5 lists)                   │
│                                                              │
│ [Search price lists_________________] [🔍]                  │
│                                                              │
│ Selected (3):                                                │
│ ✓ ABC Foods - Jan 2024 (PL-2401-0001)            [✕]        │
│   125 products • Effective: Jan 20 - Apr 20, 2024          │
│                                                              │
│ ✓ XYZ Distributors - Jan 2024 (PL-2401-0002)     [✕]        │
│   112 products • Effective: Jan 15 - Apr 15, 2024          │
│                                                              │
│ ✓ ABC Foods - Dec 2023 (PL-2301-0045)            [✕]        │
│   118 products • Effective: Dec 1 - Mar 1, 2024            │
│                                                              │
│ [+ Add Price List]                                          │
└─────────────────────────────────────────────────────────────┘
```

#### For Category Analysis Mode

**Category Selection**:
```
┌─────────────────────────────────────────────────────────────┐
│ Select Categories to Analyze                                 │
│                                                              │
│ ☑ Fresh Produce (89 products)                              │
│ ☑ Dairy Products (23 products)                             │
│ ☐ Meat & Poultry (34 products)                             │
│ ☐ Bakery Items (18 products)                               │
│ ☐ Dry Goods (67 products)                                  │
│                                                              │
│ [Select All] [Select None]                                 │
└─────────────────────────────────────────────────────────────┘
```

**Vendor Selection** (same as Multi-Vendor mode)

### Section 3: Filters & Options

**Filter Bar**:
```
┌─────────────────────────────────────────────────────────────┐
│ Filters:                                                     │
│                                                              │
│ Product: [All Products ▼]                                   │
│ Category: [All Categories ▼]                                │
│ Price Range: [$___] to [$___]                              │
│ Change: [All ▼] (All / Increased / Decreased / Unchanged)  │
│                                                              │
│ Options:                                                     │
│ ☑ Show only common products (in all selected lists)        │
│ ☐ Include products with missing prices                     │
│ ☑ Highlight best/worst prices                              │
│ ☑ Show price change percentages                            │
│                                                              │
│ [Reset Filters]                                             │
└─────────────────────────────────────────────────────────────┘
```

### Compare Button
```
┌─────────────────────────────────────────────────────────────┐
│                  [Generate Comparison →]                     │
│             (Enabled when valid selection made)              │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary Cards

**After comparison generated**:

**Layout**: Grid 4 columns on desktop, 2 on tablet, 1 on mobile

### Card 1: Products Compared
```
┌────────────────────────┐
│ 📦 Products Compared   │
│                        │
│      125               │
│                        │
│ 118 with pricing data  │
└────────────────────────┘
```

### Card 2: Average Price
```
┌────────────────────────┐
│ 💰 Average Price       │
│                        │
│    $3.25               │
│                        │
│ ↓ 5.2% vs baseline    │
└────────────────────────┘
```

### Card 3: Potential Savings
```
┌────────────────────────┐
│ 💵 Potential Savings   │
│                        │
│    $1,245              │
│                        │
│ if switching to best   │
└────────────────────────┘
```

### Card 4: Best Deal
```
┌────────────────────────┐
│ 🏆 Best Overall Deal   │
│                        │
│  ABC Foods Inc.        │
│                        │
│ 78 best prices (62%)   │
└────────────────────────┘
```

**Card Style**:
- bg-white, border border-gray-200, rounded-lg, p-4, shadow-sm
- Icon: size-6, text-blue-600, mb-2
- Value: text-3xl font-bold text-gray-900
- Label: text-sm text-gray-600
- Trend: text-sm text-green-600/red-600 with arrow

**Click Interaction**: Card click filters/highlights relevant data in comparison table

---

## View Toggle

**Toggle Buttons** (3 options):
```
┌─────────────────────────────────────────────────────────────┐
│ View: (●) Table View  ( ) Chart View  ( ) Split View       │
└─────────────────────────────────────────────────────────────┘
```

**Styles**:
- Active: bg-blue-600, text-white
- Inactive: bg-white, text-gray-700, border border-gray-300
- Hover: bg-gray-50

---

## Table View

### Comparison Table

**Table Layout**: Sticky header, horizontal scroll for many columns

**Column Structure** (dynamic based on mode):

#### Multi-Vendor Comparison Table

| Product | Category | ABC Foods Jan 2024 | XYZ Dist Jan 2024 | GreenFarm Dec 2023 | Best Price | Savings |
|---------|----------|-------------------|-------------------|--------------------|-----------|---------|
| Fresh Tomatoes (PROD-001) | Vegetables | **$2.75** 🥇 | $2.85 | $2.95 | $2.75 | - |
| Fresh Lettuce (PROD-002) | Vegetables | $1.80 | **$1.75** 🥇 | $1.90 | $1.75 | $0.05 |
| Fresh Carrots (PROD-003) | Vegetables | $1.25 | $1.30 | **$1.20** 🥇 | $1.20 | $0.05 |

**Column Headers**:
- Product: Sortable, sticky left, 250px width
- Category: Sortable, 140px width
- Price List Columns: Sortable by price, 150px each
- Best Price: Computed, 120px, sticky right
- Savings: Computed (diff from current/selected), 100px, sticky right

**Cell Formatting**:
- **Best Price**: Bold + green background (bg-green-50) + 🥇 trophy icon
- **Worst Price**: Red background (bg-red-50)
- **Missing Price**: Gray background (bg-gray-100) + "N/A"
- **Price Increase**: Red text with ↑ arrow + percentage
- **Price Decrease**: Green text with ↓ arrow + percentage
- **Unchanged**: Gray text with → arrow

**Row Hover**: Light blue background (bg-blue-50), shows "View Details" button

**Click Row**: Expands to show detailed price breakdown

#### Expanded Row (Product Detail)
```
┌─────────────────────────────────────────────────────────────┐
│ Fresh Tomatoes (PROD-001) - Detailed Comparison             │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ ABC Foods - Jan 2024:                                        │
│ • Base Price: $2.75/kg (MOQ: 50kg)                          │
│ • Tiered: 100kg→$2.60, 500kg→$2.45                         │
│ • Lead Time: 3 days                                         │
│ • Terms: Net 30                                             │
│ [View Full Price List]                                      │
│                                                              │
│ XYZ Dist - Jan 2024:                                        │
│ • Base Price: $2.85/kg (MOQ: 100kg)                         │
│ • No tiered pricing                                         │
│ • Lead Time: 5 days                                         │
│ • Terms: Net 45                                             │
│ [View Full Price List]                                      │
│                                                              │
│ GreenFarm - Dec 2023:                                       │
│ • Base Price: $2.95/kg (MOQ: 25kg)                          │
│ • Tiered: 50kg→$2.80                                        │
│ • Lead Time: 2 days                                         │
│ • Terms: Net 30, 2% early pay discount                     │
│ [View Full Price List]                                      │
│                                                              │
│ 📊 6-Month Price History Chart                              │
│ [Line chart showing price trends for this product]          │
│                                                              │
│ [Collapse Details ▲]                                        │
└─────────────────────────────────────────────────────────────┘
```

#### Multi-Period Comparison Table

| Product | Oct 2023 | Nov 2023 | Dec 2023 | Jan 2024 | Trend | Total Change |
|---------|----------|----------|----------|----------|-------|--------------|
| Fresh Tomatoes | $2.45 | $2.50 | $2.50 | $2.75 | ↗️ Rising | +12.2% |
| Fresh Lettuce | $1.90 | $1.85 | $1.90 | $1.80 | ↘️ Falling | -5.3% |
| Fresh Carrots | $1.18 | $1.20 | $1.20 | $1.25 | ↗️ Rising | +5.9% |

**Additional Columns**:
- **Trend**: Visual indicator (↗️ Rising, ↘️ Falling, → Stable)
- **Total Change**: Percentage change from first to last period
- **Trend Chart**: Sparkline showing mini price trend

### Table Controls

**Above Table**:
```
┌─────────────────────────────────────────────────────────────┐
│ [Export Table] [Download CSV] [Print]                       │
│                                                              │
│ Sort by: [Best Price ▼] [A-Z ▼] [Category ▼]              │
│ Show: [All Products ▼] [Top 50 Savings ▼]                  │
│                                                              │
│ 🔍 Quick Search: [________________]                         │
└─────────────────────────────────────────────────────────────┘
```

### Bulk Actions (When rows selected)
```
┌─────────────────────────────────────────────────────────────┐
│ ✓ 12 products selected                                      │
│ [Export Selected] [Create RFQ] [Add to Watchlist]          │
│ [Clear Selection]                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Chart View

### Chart Options Selector
```
┌─────────────────────────────────────────────────────────────┐
│ Chart Type:                                                  │
│ (●) Bar Chart - Price Comparison                            │
│ ( ) Line Chart - Price Trends                               │
│ ( ) Scatter Plot - Price Distribution                       │
│ ( ) Heatmap - Price Variance                                │
└─────────────────────────────────────────────────────────────┘
```

### Bar Chart: Price Comparison

**Chart Type**: Grouped bar chart

**X-Axis**: Product names (scrollable if >20 products)
**Y-Axis**: Price ($)
**Bars**: One bar per price list (color-coded)

**Legend**: Shows price list names with colors
- ABC Foods Jan 2024: Blue
- XYZ Dist Jan 2024: Green
- GreenFarm Dec 2023: Orange

**Interactions**:
- Hover bar: Tooltip shows exact price + percentage difference
- Click bar: Filters table to that product
- Click legend: Toggle visibility of that price list
- Zoom: Pinch-to-zoom or scroll wheel
- Pan: Click-drag to pan chart

**Chart Controls**:
```
┌─────────────────────────────────────────────────────────────┐
│ View: [All Products ▼] [Top 20 by Price ▼] [Category ▼]   │
│ Sort: [Alphabetical ▼] [Price Low-High ▼] [Savings ▼]     │
│ [⟲ Reset Zoom] [📷 Export PNG] [📊 Export Data]           │
└─────────────────────────────────────────────────────────────┘
```

### Line Chart: Price Trends (Multi-Period Mode)

**Chart Type**: Multi-line time series

**X-Axis**: Time periods (months)
**Y-Axis**: Price ($)
**Lines**: One line per product (top 10 by default, customizable)

**Legend**: Product names with colors

**Trend Indicators**:
- Dotted line: Average price across all products
- Shaded area: Price range (min to max)

**Annotations**:
- Price spike markers
- Seasonal patterns highlighted
- Outlier flags

### Scatter Plot: Price Distribution

**Chart Type**: Scatter plot

**X-Axis**: Product (or category)
**Y-Axis**: Price ($)
**Points**: Each price list shown as different color/shape

**Features**:
- Trend line showing average
- Outlier detection (points beyond 2σ highlighted)
- Cluster analysis visualization

### Heatmap: Price Variance

**Layout**: Grid with products (rows) x price lists (columns)

**Color Scale**:
- Dark green: Lowest prices
- Yellow: Medium prices
- Dark red: Highest prices

**Cell Content**: Price value + percentage deviation from mean

**Example**:
```
┌─────────────────────────────────────────────────────────────┐
│           │ ABC Foods │ XYZ Dist │ GreenFarm │              │
│───────────┼───────────┼──────────┼───────────┤              │
│ Tomatoes  │ $2.75 🟢  │ $2.85 🟡 │ $2.95 🔴  │              │
│           │   -3.5%   │  +1.4%   │  +5.0%    │              │
│───────────┼───────────┼──────────┼───────────┤              │
│ Lettuce   │ $1.80 🟡  │ $1.75 🟢 │ $1.90 🔴  │              │
│           │   +2.9%   │  -2.9%   │  +8.6%    │              │
│───────────┼───────────┼──────────┼───────────┤              │
│ ...       │   ...     │   ...    │   ...     │              │
└─────────────────────────────────────────────────────────────┘
```

---

## Split View

**Layout**: 60% table + 40% chart (adjustable splitter)

**Features**:
- Linked selection: Selecting row in table highlights in chart
- Synchronized scrolling (optional toggle)
- Independent zoom/filter per pane
- Drag splitter to resize panes

```
┌─────────────────────────────────────────────────────────────┐
│ Comparison Table           │ Chart View                     │
│                            │                                │
│ Product  ABC  XYZ  Green   │     [Bar Chart]                │
│ Tomato   2.75 2.85 2.95    │                                │
│ Lettuce  1.80 1.75 1.90    │                                │
│ Carrot   1.25 1.30 1.20    │                                │
│ ...                        │                                │
│                            │                                │
│ [Export] [Filter]          │ [Chart Options]                │
└─────────────────────────────────────────────────────────────┘
```

---

## Savings Calculator Panel

**Location**: Right sidebar (collapsible) or bottom panel

**Container**: bg-blue-50, border-l-4 border-blue-600, p-4, sticky

```
┌─────────────────────────────────────────────────────────────┐
│ 💰 Savings Calculator                                        │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ Current Spending (Baseline):                                 │
│ Vendor: [ABC Foods - Jan 2024 ▼]                            │
│ Total: $15,234 (at MOQ for 125 products)                    │
│                                                              │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ Potential Savings:                                           │
│                                                              │
│ Option 1: Switch to Best Prices (Multi-Vendor)              │
│ • XYZ Dist: 45 products cheaper → Save $580                 │
│ • GreenFarm: 38 products cheaper → Save $420                │
│ • Keep ABC Foods: 42 products (already best)                │
│ Total Savings: $1,000 (6.6%)                                │
│ [View Details ▼]                                            │
│                                                              │
│ Option 2: Negotiate Based on Competition                     │
│ • Show ABC Foods competitor prices                           │
│ • Request 3% discount → Potential save $457                 │
│ [Generate Negotiation Report]                               │
│                                                              │
│ Option 3: Consolidate with Single Vendor                     │
│ • Switch all to XYZ Dist                                    │
│ • Net change: +$245 (less savings but simpler)              │
│ • Benefits: Single PO, volume discounts                     │
│ [View Vendor Consolidation Analysis]                        │
│                                                              │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ Recommendation: 🏆                                           │
│ Switch 83 products to competitors                           │
│ Annual Savings: $12,000                                     │
│ Payback Period: Immediate                                   │
│                                                              │
│ [Export Savings Report] [Create Action Plan]                │
└─────────────────────────────────────────────────────────────┘
```

**Expandable Details (Click "View Details")**:
```
┌─────────────────────────────────────────────────────────────┐
│ Detailed Savings Breakdown                                   │
│                                                              │
│ Switch to XYZ Dist (45 products):                           │
│ • Fresh Lettuce: $1.80→$1.75 = $0.05/kg × 500kg = $25     │
│ • Fresh Carrots: $1.25→$1.20 = $0.05/kg × 1000kg = $50    │
│ • Fresh Onions: $0.95→$0.85 = $0.10/kg × 800kg = $80      │
│ ... 42 more products                                        │
│                                                              │
│ Total XYZ Savings: $580/month = $6,960/year                │
│                                                              │
│ Switch to GreenFarm (38 products):                          │
│ • Fresh Garlic: $4.50→$4.20 = $0.30/kg × 200kg = $60      │
│ ... 37 more products                                        │
│                                                              │
│ Total GreenFarm Savings: $420/month = $5,040/year          │
│                                                              │
│ Grand Total Annual Savings: $12,000                         │
│                                                              │
│ [Collapse Details ▲]                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Product Drill-Down Dialog

**Triggered by**: Click product name in table or chart

**Modal Size**: Large (max-w-4xl)

```
┌─────────────────────────────────────────────────────────────┐
│ Product Details: Fresh Tomatoes (PROD-001)           [✕]   │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ Category: Vegetables                                         │
│ Current Vendor: ABC Foods Inc.                               │
│                                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│ Current Price Comparison:                                    │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Vendor          Price    MOQ   Lead  Terms    Score    │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │ ABC Foods       $2.75🥇  50kg  3d    Net30    92/100  │  │
│ │ XYZ Dist        $2.85    100kg 5d    Net45    85/100  │  │
│ │ GreenFarm       $2.95    25kg  2d    Net30    88/100  │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ 🏆 Best Overall: ABC Foods (lowest price, good terms)       │
│ 💡 Alternative: GreenFarm (faster delivery, lower MOQ)      │
│                                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│ 12-Month Price History:                                     │
│ [Line Chart showing price trends for all 3 vendors]         │
│                                                              │
│ Insights:                                                    │
│ • ABC Foods prices increased 10% in Jan 2024               │
│ • XYZ Dist prices stable for 6 months                      │
│ • GreenFarm shows seasonal price fluctuations              │
│                                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                              │
│ Vendor Details:                                              │
│                                                              │
│ [Tabs: ABC Foods | XYZ Dist | GreenFarm]                   │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ABC Foods - Jan 2024                                   │  │
│ │                                                        │  │
│ │ Base Price: $2.75/kg                                  │  │
│ │ MOQ: 50kg                                              │  │
│ │ Pack Size: 10kg boxes                                 │  │
│ │                                                        │  │
│ │ Tiered Pricing:                                       │  │
│ │ • 100-499kg: $2.60/kg (-5.5%)                        │  │
│ │ • 500+kg: $2.45/kg (-10.9%)                          │  │
│ │                                                        │  │
│ │ Terms:                                                 │  │
│ │ • Payment: Net 30                                     │  │
│ │ • Lead Time: 3 days                                   │  │
│ │ • Delivery: Included                                  │  │
│ │ • Warranty: 7 days freshness guarantee               │  │
│ │                                                        │  │
│ │ Last 3 Orders:                                        │  │
│ │ • Dec 2023: 200kg @ $2.60/kg = $520                  │  │
│ │ • Nov 2023: 150kg @ $2.50/kg = $375                  │  │
│ │ • Oct 2023: 100kg @ $2.45/kg = $245                  │  │
│ │                                                        │  │
│ │ [View Full Price List] [View Vendor Profile]         │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [Close] [Add to Watchlist] [Create RFQ]                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Export Dialog

**Triggered by**: Export button

```
┌─────────────────────────────────────────────────────────────┐
│ Export Comparison Report                              [✕]   │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ Export Format:                                               │
│ (●) Excel Workbook (.xlsx)                                  │
│     - Multiple sheets: Summary, Comparison, Charts, Data    │
│     - Formatted tables with conditional formatting          │
│     - Embedded charts                                       │
│                                                              │
│ ( ) PDF Report (.pdf)                                       │
│     - Executive summary with key findings                   │
│     - Comparison tables and charts                          │
│     - Professional formatting                               │
│                                                              │
│ ( ) CSV Data (.csv)                                         │
│     - Raw comparison data                                   │
│     - Easy import to other tools                            │
│                                                              │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ Include in Report:                                           │
│ ☑ Comparison summary and statistics                        │
│ ☑ Product-by-product comparison table                      │
│ ☑ Price trend charts                                       │
│ ☑ Savings calculator results                               │
│ ☑ Vendor details and terms                                 │
│ ☐ Full price history (all periods)                         │
│ ☐ Comments and notes                                       │
│                                                              │
│ Report Template:                                             │
│ [Executive Summary ▼]                                        │
│ Options: Executive Summary / Detailed Analysis /            │
│          Finance Review / Vendor Comparison                 │
│                                                              │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ Report Customization:                                        │
│ Title: [Fresh Produce Price Comparison - Q1 2024____]      │
│ Prepared by: [John Smith_____]                             │
│ Date: [01/17/2024]                                          │
│                                                              │
│ Notes (optional):                                            │
│ [_____________________________________________________]     │
│                                                              │
│ [Cancel]                          [Generate Report]         │
└─────────────────────────────────────────────────────────────┘
```

**Export Progress**:
```
┌─────────────────────────────────────────────────────────────┐
│ Generating Report...                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  75%                        │
│ Creating charts (3/4)                                        │
└─────────────────────────────────────────────────────────────┘
```

**Export Complete**:
```
┌─────────────────────────────────────────────────────────────┐
│ ✓ Report Generated Successfully                      [✕]   │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ File: Price_Comparison_Report_2024-01-17.xlsx              │
│ Size: 3.2 MB                                                │
│ Generated: Jan 17, 2024 3:45 PM                             │
│                                                              │
│ The report includes:                                         │
│ • Summary sheet with key findings                           │
│ • Comparison table (125 products × 3 vendors)               │
│ • Price trend charts (4 charts)                             │
│ • Savings analysis ($1,245 potential savings)               │
│                                                              │
│ [Download] [Email] [Save to Drive] [Close]                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Save Comparison Dialog

**Triggered by**: "Save Comparison" button

```
┌─────────────────────────────────────────────────────────────┐
│ Save Comparison                                       [✕]   │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ Comparison Name: *                                           │
│ [Fresh Produce Multi-Vendor Comparison Q1 2024_____]       │
│                                                              │
│ Description:                                                 │
│ [Comparison of 3 vendors for 125 fresh produce______]      │
│ [products to identify best pricing opportunities____]      │
│                                                              │
│ Tags:                                                        │
│ [Fresh Produce] [Q1 2024] [+ Add Tag]                      │
│                                                              │
│ Visibility:                                                  │
│ (●) Private (only me)                                       │
│ ( ) Team (procurement team members)                        │
│ ( ) Public (all authenticated users)                       │
│                                                              │
│ ☑ Set as default comparison for this category              │
│ ☑ Schedule auto-refresh (weekly)                           │
│                                                              │
│ [Cancel]                          [Save Comparison]         │
└─────────────────────────────────────────────────────────────┘
```

---

## Load Saved Comparison Dialog

**Triggered by**: "Load Saved" button

```
┌─────────────────────────────────────────────────────────────┐
│ Load Saved Comparison                                 [✕]   │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ My Saved Comparisons (8):                                   │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 📊 Fresh Produce Multi-Vendor Q1 2024                 │  │
│ │    Saved: Jan 15, 2024 • Last used: 2 days ago       │  │
│ │    3 vendors × 125 products                           │  │
│ │    [Load] [Delete] [Share]                            │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 📊 ABC Foods Price Trends (6 months)                  │  │
│ │    Saved: Jan 10, 2024 • Last used: 5 days ago       │  │
│ │    1 vendor × 118 products × 6 periods               │  │
│ │    [Load] [Delete] [Share]                            │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ... 6 more saved comparisons                                │
│                                                              │
│ Team Shared Comparisons (3):                                 │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 📊 Monthly Vendor Review - December                   │  │
│ │    Shared by: Sarah Johnson • 12 days ago            │  │
│ │    [Load] [Copy to My Comparisons]                    │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [Close]                                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Share Comparison Dialog

**Triggered by**: "Share" button

```
┌─────────────────────────────────────────────────────────────┐
│ Share Comparison                                      [✕]   │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ Share Method:                                                │
│                                                              │
│ ( ) Email                                                    │
│     Send comparison report via email                        │
│     [Select recipients...]                                  │
│                                                              │
│ ( ) Link                                                     │
│     Generate shareable link (view-only)                     │
│     Link expires in: [7 days ▼]                            │
│     [Generate Link]                                         │
│                                                              │
│ (●) Export & Attach                                         │
│     Export report and attach to email                       │
│                                                              │
│ ──────────────────────────────────────────────────────────  │
│                                                              │
│ Recipients:                                                  │
│ [Search users or enter emails____________]                 │
│                                                              │
│ Selected (3):                                                │
│ • Sarah Johnson (sarah@company.com)            [✕]         │
│ • Mike Chen (mike@company.com)                 [✕]         │
│ • finance-team@company.com                     [✕]         │
│                                                              │
│ Message (optional):                                          │
│ [Please review this price comparison for Q1 2024___]       │
│ [procurement decisions. Let me know your thoughts.___]     │
│                                                              │
│ Attachment Format: [Excel ▼]                                │
│                                                              │
│ [Cancel]                          [Send]                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Design

### Mobile (<768px)

**Comparison Setup**:
- Vertical wizard with steps
- One price list selector at a time
- Swipe between selected lists

**Summary Cards**:
- Stacked vertically
- Swipe horizontal scroll

**Table View**:
- Switches to card-based comparison
- One product per card
- Swipe to see different vendors

**Card Layout**:
```
┌────────────────────────────────┐
│ Fresh Tomatoes (PROD-001)      │
│ ──────────────────────────     │
│ ABC Foods:      $2.75 🥇       │
│ XYZ Dist:       $2.85          │
│ GreenFarm:      $2.95          │
│                                │
│ Best: ABC Foods (save $0.10)   │
│ [Details →]                    │
└────────────────────────────────┘
```

**Chart View**:
- Simplified charts
- Fewer data points
- Tap to see details

### Tablet (768px-1023px)

**Comparison Setup**:
- 2-column layout
- Collapsible sections

**Table View**:
- Horizontal scroll
- Sticky first column
- Fewer columns visible

**Chart View**:
- Responsive sizing
- Touch-optimized controls

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- Tab through all interactive elements
- Arrow keys for chart navigation
- Enter to expand/collapse rows
- Space to select checkboxes
- Escape to close dialogs

### Screen Reader
- ARIA labels on all charts
- Table headers properly associated
- Live regions for dynamic updates
- Descriptive button labels
- Form field instructions

### Visual
- Color contrast ≥ 4.5:1
- Focus indicators visible
- No color-only indicators (use icons + text)
- Text resize up to 200%
- Clear visual hierarchy

---

## Performance Optimization

### Loading
- Lazy load charts (only when tab selected)
- Virtual scrolling for large tables (>100 products)
- Progressive data loading
- Skeleton screens during load

### Caching
- Cache comparison results (5 min TTL)
- Cache vendor/product data (10 min TTL)
- Browser cache for static assets

### Optimizations
- Debounced search (300ms)
- Throttled chart updates (100ms)
- Optimistic UI updates
- Background API calls

---

## Analytics & Tracking

### Events
- `comparison_created` - User generates comparison
- `comparison_saved` - User saves comparison
- `comparison_exported` - User exports report
- `product_drilldown` - User views product details
- `chart_type_switched` - User changes chart view
- `savings_calculated` - Savings calculator used

### Metrics
- Most used comparison mode
- Average products compared
- Export format preferences
- Time spent on comparison
- Savings identified

---

## Error Handling

### No Common Products
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ No Common Products Found                                  │
│                                                              │
│ The selected price lists have no products in common.        │
│                                                              │
│ Suggestions:                                                 │
│ • Remove filter "Show only common products"                 │
│ • Select price lists with overlapping products              │
│ • Choose a different comparison mode                        │
│                                                              │
│ [Adjust Filters] [Start Over]                              │
└─────────────────────────────────────────────────────────────┘
```

### Insufficient Data
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Insufficient Data for Comparison                          │
│                                                              │
│ At least 2 price lists are required for comparison.         │
│ Current selection: 1 price list                             │
│                                                              │
│ [Add More Price Lists]                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-23 | Initial comprehensive specification |

---

**End of Document**

Total Lines: 1,289
Total Sections: 35+
Total Charts: 5 types
Total Dialogs: 6
Word Count: ~13,000+
