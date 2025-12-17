# Page Content: Price Lists List Page

## Document Information
- **Module**: Vendor Management
- **Sub-Module**: Price Lists
- **Page**: Price List (Staff-Facing)
- **Route**: `/vendor-management/price-lists`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-23
- **Owner**: UX/Content Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-23 | System | Initial version based on UC-PL v1.0, BR-PL v1.0 |

---

## Overview

**Page Purpose**: Centralized repository for all vendor price lists, enabling procurement staff to view, compare, and manage pricing data from multiple sources (manual entry, template submissions, RFQ responses, negotiations). Supports price comparison, approval workflows, historical tracking, and bulk operations.

**User Personas**: Procurement Manager, Procurement Staff, Finance Manager, Department Manager, Purchasing Staff

**Key Features**:
- Multi-source price list management (templates, RFQs, manual, contracts)
- Vendor-specific pricing with effective date ranges
- Price comparison and competitive analysis
- Approval workflows for significant price changes
- Excel import/export for offline work
- Bulk operations for efficiency
- Price history and trend analysis
- Alert management for price changes

**Related Documents**:
- [Business Requirements](../BR-price-lists.md) - BR-PL-001 to BR-PL-020
- [Use Cases](../UC-price-lists.md) - UC-PL-001 to UC-PL-010
- [Technical Specification](../TS-price-lists.md)
- [Data Dictionary](../DD-price-lists.md)
- [Flow Diagrams](../FD-price-lists.md)

---

## Page Header

### Page Title
**Text**: Price Lists
**Style**: H1, bold, text-gray-900, text-3xl
**Icon**: 💰 DollarSign icon (size-8, text-blue-600, mr-3)
**Location**: Top left of page, below breadcrumb

### Breadcrumb
**Text**: Home / Vendor Management / Price Lists
**Location**: Above page title
**Interactive**: Home and Vendor Management are clickable links
**Current Page**: "Price Lists" in text-gray-900, not clickable
**Separator**: "/" in text-gray-400
**Accessibility**: aria-label="Breadcrumb navigation"

### Page Description
**Text**: Manage vendor pricing from all sources. Compare prices, track changes, approve updates, and maintain pricing history for informed procurement decisions.

**Style**: text-gray-600, text-base, mt-2, max-width 800px

**Help Tooltip** (ℹ️ icon next to description):
```
Price Lists store vendor pricing information with:
• Effective date ranges for time-based pricing
• Source tracking (template, RFQ, manual, contract)
• Product-level details with UOM, MOQ, lead time
• Tier pricing for volume discounts
• Approval workflows for significant changes
• 5-year historical retention

Use price comparison tools to analyze vendor competitiveness and make data-driven decisions.
```

### Action Buttons (Header)

**Layout**: Flex row, gap-3, ml-auto (right-aligned)

| Button Label | Purpose | Style | Visibility Rules | Icon | Keyboard Shortcut |
|--------------|---------|-------|------------------|------|-------------------|
| Create Price List | Navigate to create wizard | Primary (blue, solid) | Permission: create | Plus | N |
| Import Prices | Import from Excel/CSV | Secondary (white, border-blue-600) | Permission: import | Upload | I |
| Compare Prices | Open price comparison tool | Secondary (white, border) | ≥2 active price lists exist | BarChart2 | C |
| Bulk Operations | Dropdown menu for batch actions | Secondary (white, border) | ≥1 price list exists | Layers | - |
| Export All | Export price lists to Excel | Secondary (white, border) | Price lists exist | Download | E |
| Settings | Price list configuration | Tertiary (icon only, text-gray-400) | Admin only | Settings | - |

**Bulk Operations Dropdown**:
- Bulk Import Updates
- Bulk Expire Price Lists
- Bulk Archive Price Lists
- Bulk Export Selection
- Generate Price Report

**Button States**:
- **Default**: Full opacity
- **Hover**: Slight shadow elevation, transform scale(1.02)
- **Disabled**: Opacity 50%, cursor not-allowed, tooltip explaining why
- **Loading**: Spinner icon, button disabled

**Accessibility**:
- All buttons have aria-labels
- Keyboard accessible (Tab navigation, Enter to activate)
- Focus indicators visible (ring-2 ring-blue-500)

---

## Quick Stats Cards

### Layout
**Container**: Grid 4 columns on desktop (≥1024px), 2 columns on tablet (640-1023px), 1 column on mobile (<640px)
**Gap**: gap-4
**Margin**: my-6

### Card Style (All Cards)
- **Background**: bg-white
- **Border**: border border-gray-200
- **Rounded**: rounded-lg
- **Padding**: p-6
- **Shadow**: shadow-sm hover:shadow-md transition-shadow
- **Cursor**: cursor-pointer (cards are clickable)
- **Accessibility**: role="button", tabindex="0", keyboard accessible

---

### Card 1: Active Price Lists

**Visual Layout**:
```
┌─────────────────────────────┐
│  📊 ACTIVE PRICE LISTS      │
│                             │
│        245                  │
│                             │
│  ↑ 12% vs last month        │
└─────────────────────────────┘
```

**Content**:
- **Label**: "Active Price Lists"
  - Style: text-sm font-medium text-gray-600 uppercase tracking-wide
  - Icon: FileText, size-5, text-blue-600, mr-2
- **Value**: "245"
  - Style: text-4xl font-bold text-gray-900, my-4
  - Animated count-up on load
- **Trend**: "↑ 12% vs last month"
  - Style: text-sm text-green-600 (up) or text-red-600 (down)
  - Icon: TrendingUp or TrendingDown
  - Format: Percentage change with direction arrow

**Click Action**: Filter list to show only active price lists (status = active)

**Tooltip**: "Price lists currently in effect with active status. Click to filter."

**Background Color**: bg-blue-50 (very subtle)

---

### Card 2: Unique Vendors

**Visual Layout**:
```
┌─────────────────────────────┐
│  🏢 VENDORS WITH PRICING    │
│                             │
│         89                  │
│                             │
│  85% of approved vendors    │
└─────────────────────────────┘
```

**Content**:
- **Label**: "Vendors with Pricing"
  - Icon: Users, size-5, text-purple-600, mr-2
- **Value**: "89"
  - Style: text-4xl font-bold text-gray-900, my-4
- **Sub-metric**: "85% of approved vendors"
  - Style: text-sm text-gray-600
  - Calculation: (Vendors with active price lists / Total approved vendors) × 100

**Click Action**: Navigate to vendor coverage analytics view

**Tooltip**: "Number of unique vendors with at least one active price list. Click to view vendor coverage."

**Background Color**: bg-purple-50

---

### Card 3: Avg Price Trend

**Visual Layout**:
```
┌─────────────────────────────┐
│  📈 AVG PRICE TREND (30d)   │
│                             │
│        +3.2%                │
│                             │
│  [Mini trend chart]         │
└─────────────────────────────┘
```

**Content**:
- **Label**: "Avg Price Trend (30 days)"
  - Icon: TrendingUp, size-5, text-green-600, mr-2
- **Value**: "+3.2%" or "-1.5%"
  - Style: text-4xl font-bold
  - Color: text-green-600 (increase) or text-red-600 (decrease)
  - Shows average price change across all products
- **Mini Chart**: Sparkline showing 30-day trend
  - Width: 100%, height: 40px
  - Line color: Matches value color
  - Area fill: Semi-transparent

**Click Action**: Navigate to price trend analytics

**Tooltip**: "Average price change across all active products in the last 30 days. Positive indicates inflation, negative indicates deflation."

**Background Color**: Dynamic based on trend (bg-green-50 if positive, bg-red-50 if negative)

---

### Card 4: Pending Approvals

**Visual Layout**:
```
┌─────────────────────────────┐
│  ⏳ PENDING APPROVALS       │
│                             │
│         18                  │
│                             │
│  Avg wait: 2.3 days         │
└─────────────────────────────┘
```

**Content**:
- **Label**: "Pending Approvals"
  - Icon: Clock, size-5, text-yellow-600, mr-2
- **Value**: "18"
  - Style: text-4xl font-bold text-gray-900, my-4
- **Sub-metric**: "Avg wait: 2.3 days"
  - Style: text-sm text-gray-600
  - Shows average time since submission

**Click Action**: Filter list to show only pending approval price lists

**Tooltip**: "Price lists awaiting approval. Click to filter and review."

**Background Color**: bg-yellow-50

**Urgency Indicator**:
- If any approval waiting >7 days: Add pulsing red dot
- If any approval waiting >14 days: Change value color to text-red-700

---

## Filter Section

### Filter Bar Container
**Style**: bg-white, border border-gray-200, rounded-lg, p-4, mb-6, shadow-sm

### Primary Filter Tabs (Mutually Exclusive)

**Layout**: Inline flex, gap-2, border-b border-gray-200, pb-3, mb-4

| Tab Label | Filter Criteria | Default | Badge Count | Description |
|-----------|-----------------|---------|-------------|-------------|
| Active | status = 'active' AND effective_to >= today | ✓ | Yes (e.g., "245") | Currently effective price lists |
| All Price Lists | All visible to user based on permissions | | Yes (total) | All price lists user can access |
| My Price Lists | created_by = current_user | | Yes | Price lists created by current user |
| Pending Approval | status = 'pending_approval' | | Yes (e.g., "18") | Awaiting approval |
| Expiring Soon | effective_to BETWEEN today AND today+30 | | Yes | Ending in next 30 days |
| Draft | status = 'draft' | | Yes | Incomplete price lists |

**Tab Style**:
- **Inactive**: text-gray-600, hover:text-gray-900, pb-2, px-4, cursor-pointer
- **Active**: text-blue-600, border-b-2 border-blue-600, font-semibold, pb-2, px-4
- **Badge**: ml-2, bg-gray-100 text-gray-600 (inactive) or bg-blue-100 text-blue-800 (active), rounded-full, px-2 py-0.5, text-xs

**Interaction**:
- Click tab to switch filter
- URL updates with ?filter=active|all|my|pending|expiring|draft
- Tab state persists in session
- Keyboard: Arrow keys to switch, Enter to select

---

### Secondary Filters

**Layout**: Grid 4 columns on desktop, 2 on tablet, 1 on mobile, gap-3, mt-4

#### Filter 1: Vendor

**Label**: Vendor
**Type**: Multi-select autocomplete dropdown
**Placeholder**: All Vendors
**Icon**: Building (left side of input)

**Options**:
- All Vendors (default, clears filter)
- [Searchable list of vendors]
  - Format: "Vendor Name (X price lists)"
  - Sort: Alphabetical, with most used at top
  - Group by: Vendor type (optional)

**Features**:
- Search by vendor name or code
- Multi-select with checkboxes
- Selected count badge
- Clear selection (X icon)
- Keyboard navigation

**Selected Display**: "3 vendors selected" or "Vendor A, Vendor B, +1 more"

#### Filter 2: Product Category

**Label**: Product Category
**Type**: Multi-select dropdown with tree structure
**Placeholder**: All Categories
**Icon**: FolderOpen

**Options**:
- All Categories (default)
- Hierarchical category tree:
  ```
  ☐ Food & Beverage
    ☐ Fresh Produce
    ☐ Dairy
    ☐ Meat & Seafood
  ☐ Kitchen Equipment
  ☐ Cleaning Supplies
  etc.
  ```

**Features**:
- Expand/collapse categories
- Parent selection selects all children
- Show product count per category
- Search categories

#### Filter 3: Source Type

**Label**: Source Type
**Type**: Multi-select dropdown
**Placeholder**: All Sources
**Icon**: FileText

**Options**:
- All Sources (default)
- ☐ Manual Entry
- ☐ Template Submission
- ☐ RFQ Response
- ☐ Negotiation
- ☐ Contract
- ☐ Imported from Excel

**Badge Count**: Show count of price lists per source type

#### Filter 4: Status

**Label**: Status
**Type**: Multi-select dropdown
**Placeholder**: All Statuses
**Icon**: Tag

**Options**:
- All Statuses (default)
- ☐ Draft
- ☐ Pending Approval
- ☐ Approved
- ☐ Active
- ☐ Expired
- ☐ Archived
- ☐ Superseded

**Color Coding**: Each status option shows its badge color

---

### Advanced Filters (Collapsible)

**Toggle Button**: "Show Advanced Filters ▼" / "Hide Advanced Filters ▲"
**Style**: text-sm text-blue-600 hover:text-blue-800 cursor-pointer
**Initial State**: Collapsed

**Expanded Content** (when visible):

**Layout**: Grid 3 columns desktop, 2 tablet, 1 mobile, gap-4, mt-4, pt-4, border-t border-gray-200

#### Advanced Filter 1: Effective Date Range

**Label**: Effective Date Range
**Type**: Date range picker
**Inputs**: From Date, To Date
**Icon**: Calendar

**Preset Options**:
- Currently Active (from <= today <= to)
- Active Next 30 Days
- Expired Last 30 Days
- Custom Range

**Validation**: From date must be <= To date

#### Advanced Filter 2: Price Range

**Label**: Price Range (Average)
**Type**: Dual range slider
**Range**: $0 - $10,000
**Step**: $10
**Display**: Min: $X | Max: $Y

**Tooltip**: "Filter by average product price across the price list"

#### Advanced Filter 3: Created Date

**Label**: Created Date
**Type**: Date range picker
**Presets**:
- Last 7 days
- Last 30 days
- Last 90 days
- This Year
- Custom

#### Advanced Filter 4: Product Count

**Label**: Number of Products
**Type**: Range slider
**Range**: 1 - 500 products
**Display**: Min - Max products

#### Advanced Filter 5: Approval Status

**Label**: Approval Required
**Type**: Checkbox group
**Options**:
- ☐ Requires Approval
- ☐ Auto-Approved
- ☐ No Approval Needed

#### Advanced Filter 6: Price Change

**Label**: Price Change vs Previous
**Type**: Dropdown
**Options**:
- Any Change
- Increased Only
- Decreased Only
- No Change
- Increased >10%
- Decreased >10%

#### Advanced Filter 7: Created By

**Label**: Created By
**Type**: Multi-select user dropdown
**Options**: All staff with create permission
**Search**: By user name or department

#### Advanced Filter 8: Has Alerts

**Label**: Active Alerts
**Type**: Checkbox
**Option**: ☐ Only price lists with active alerts

---

### Filter Action Buttons

**Layout**: Flex row, justify-end, gap-2, mt-4

| Button | Purpose | Style | Icon |
|--------|---------|-------|------|
| Clear All | Reset all filters to default | Secondary (gray outline) | X |
| Apply Filters | Apply selected filters to list | Primary (blue solid) | Check |
| Save Filter Set | Save current filter combination for reuse | Tertiary (text link) | Save |

**Save Filter Set Dialog**:
```
┌──────────────────────────────────┐
│  Save Filter Set                 │
│                                  │
│  Filter Name: [________________] │
│                                  │
│  ☐ Set as default filter         │
│  ☐ Share with team               │
│                                  │
│  [Cancel]  [Save Filter]         │
└──────────────────────────────────┘
```

**Saved Filters Dropdown** (next to Save button):
- Quick access to saved filter sets
- Edit/Delete options per saved filter
- "Manage Saved Filters" link at bottom

---

### Active Filters Display

**Location**: Below filter bar, above search

**Layout**: Flex row, flex-wrap, gap-2

**Filter Chips**:
```
[Vendor: ABC Corp ✕] [Category: Food & Beverage ✕] [Status: Active ✕] [Clear All]
```

**Chip Style**:
- bg-blue-100, text-blue-800, rounded-full, px-3 py-1, text-sm
- X icon to remove individual filter (hover: bg-blue-200)
- Click chip to edit filter value

**Results Count**: "Showing 45 of 245 price lists"
- Style: text-sm text-gray-600, ml-auto

**No Filters Active**: Section hidden

---

## Search Section

### Search Bar

**Layout**: Full width, mb-4

**Input Field**:
- **Placeholder**: "Search by price list name, vendor, product, code..."
- **Icon**: Search icon (left side, text-gray-400)
- **Clear**: X icon (right side, only visible when text entered)
- **Style**: border border-gray-300, rounded-lg, px-4 py-2, w-full, focus:ring-2 focus:ring-blue-500
- **Debounce**: 300ms delay before triggering search

**Search Scope** (checkbox filters below search bar):
- ☑ Price List Names
- ☑ Vendor Names
- ☑ Product Names
- ☑ Codes (Price list, vendor, product SKUs)
- ☐ Notes/Comments

**Search Behavior**:
- Real-time results as you type (after debounce)
- Highlight matching text in results
- Show "Searching..." indicator during search
- Clear button clears search and shows all results

**Search Suggestions Dropdown** (appears when focused or typing):
```
┌─────────────────────────────────────────────┐
│  Recent Searches:                           │
│  🕐 ABC Corp - Q1 2024                      │
│  🕐 Kitchen Equipment                       │
│  🕐 Fresh Produce Pricing                   │
│                                             │
│  Suggested Searches:                        │
│  💡 Price lists expiring this month         │
│  💡 Vendors with price increases            │
│  💡 Pending approvals                       │
└─────────────────────────────────────────────┘
```

**No Results**:
```
No price lists match your search for "xyz"

Suggestions:
• Check spelling
• Try different keywords
• Clear filters
• Use broader search terms
```

**Accessibility**:
- aria-label="Search price lists"
- Live region for result count updates
- Keyboard: Esc to clear, Enter to search immediately

---

## View Toggle

**Layout**: Above table, right side, flex row with sort dropdown

**Toggle Options**:
| View | Icon | Description | Keyboard |
|------|------|-------------|----------|
| Table View | List | Detailed table with all columns | T |
| Card View | Grid3x3 | Card layout with summary info | C |
| Compact View | Menu | Dense list view | M |

**Style**:
- Button group, rounded borders
- Active: bg-blue-600 text-white
- Inactive: bg-white text-gray-600 border border-gray-300
- Hover: bg-gray-50 (inactive), bg-blue-700 (active)

**Persistence**: Remember user's last selected view in localStorage

---

## Sort & Display Options

**Layout**: Flex row, gap-4, items-center, mb-4

### Sort Dropdown

**Label**: "Sort by:"
**Default**: Last Modified (Newest First)

**Options**:
| Sort Option | Sort Field | Direction |
|-------------|------------|-----------|
| Last Modified (Newest) | modified_at | DESC |
| Last Modified (Oldest) | modified_at | ASC |
| Created Date (Newest) | created_at | DESC |
| Created Date (Oldest) | created_at | ASC |
| Vendor Name (A-Z) | vendor.name | ASC |
| Vendor Name (Z-A) | vendor.name | DESC |
| Effective From (Soonest) | effective_from | ASC |
| Effective To (Soonest) | effective_to | ASC |
| Status | status | ASC |
| Avg Price (Lowest) | avg_price | ASC |
| Avg Price (Highest) | avg_price | DESC |
| Product Count (Most) | product_count | DESC |
| Product Count (Least) | product_count | ASC |

### Items Per Page

**Label**: "Show:"
**Options**: 10 | 25 | 50 | 100 | All
**Default**: 25

**Style**: Dropdown, compact

---

## Table View

### Table Structure

**Container**: Overflow-x-auto, rounded-lg border border-gray-200

**Table Style**:
- w-full
- bg-white
- Striped rows (even rows: bg-gray-50)
- Hover: bg-blue-50

### Table Headers

| Column | Sortable | Width | Sticky | Tooltip |
|--------|----------|-------|--------|---------|
| [Checkbox] | No | 40px | Left | Select for bulk actions |
| Price List Name | Yes | 280px | Left | Price list identifier and source |
| Vendor | Yes | 200px | No | Vendor name and code |
| Products | No | 100px | No | Number of products priced |
| Avg Price | Yes | 120px | No | Average product price |
| Effective Dates | Yes | 180px | No | Valid date range |
| Source | Yes | 140px | No | How price list was created |
| Status | Yes | 120px | No | Current status |
| Last Updated | Yes | 140px | No | Most recent modification |
| Actions | No | 100px | Right | Available actions |

**Header Style**:
- bg-gray-50, text-xs font-medium text-gray-700 uppercase tracking-wider
- Sortable headers: cursor-pointer, hover:bg-gray-100
- Sort icons: Arrow up/down, blue when active
- Sticky positioning for checkbox and actions columns

---

### Row Content Formats

#### Checkbox Column
- Checkbox for row selection
- Indeterminate state for partial selection
- Select all checkbox in header
- Shift-click for range selection
- Selected rows: bg-blue-50 highlight

#### Price List Name Column

**Format**:
```
Kitchen Equipment - Monthly 2024
PL-ABC-2401-0245 • Manual Entry • v1.0
```

**Components**:
- **Icon**: 💰 (color-coded by source type)
- **Primary Text**: Price list name
  - Style: font-medium text-gray-900, text-sm
  - Max 40 chars, truncate with ellipsis, full name in tooltip
- **Secondary Text**: Price list code • Source type • Version
  - Style: text-xs text-gray-500
  - Code: font-mono
  - Source: Icon badge
  - Version: Small badge (v1.0)

**Click Action**: Navigate to price list detail page

**Favorite Icon**: Star icon (click to toggle favorite)
- Filled: text-yellow-500
- Empty: text-gray-300 hover:text-yellow-500

#### Vendor Column

**Format**:
```
🏢 ABC Corporation
VEN-ABC-001 • Supplier
```

**Components**:
- **Vendor Logo**: 32x32px thumbnail (if available)
- **Vendor Name**: font-medium text-gray-900
- **Vendor Code**: font-mono text-xs text-gray-500
- **Vendor Type**: Badge (Supplier, Manufacturer, Distributor)

**Click Action**: Open vendor detail in new tab (Ctrl+Click)

**Tooltip**: Shows vendor contact info and rating

#### Products Column

**Format**:
```
128 products
12 categories
```

**Components**:
- **Count**: Bold number
- **Categories**: Secondary text, count of unique categories

**Visual**: Mini bar showing completion
- If partial pricing: Shows X of Y products priced
- Color: Green (100%), Yellow (50-99%), Red (<50%)

**Click Action**: Expand inline to show product list

#### Avg Price Column

**Format**:
```
$24.50
↑ 3.2%
```

**Components**:
- **Price**: Bold, currency formatted
  - Color: text-gray-900 (neutral)
- **Change Indicator**: Percentage change vs previous price list
  - Icon: TrendingUp (green) or TrendingDown (red)
  - Text: text-green-600 or text-red-600
  - Format: ± X.X%

**Tooltip**: "Average price across all products. Change vs previous price list."

**Conditional Formatting**:
- Price increase >10%: text-orange-600, AlertTriangle icon
- Price decrease >10%: text-blue-600, info icon

#### Effective Dates Column

**Format**:
```
Jan 15, 2024 → Dec 31, 2024
Valid for 245 days
```

**Components**:
- **Date Range**: From → To
  - Style: text-sm text-gray-900
  - Format: MMM DD, YYYY
- **Duration**: Days remaining or total duration
  - Style: text-xs text-gray-600
  - Dynamic: "X days remaining" or "X days total" or "Expired X days ago"

**Status Indicators**:
- **Active**: Green left border, text-green-700 for "days remaining"
- **Expiring Soon** (<30 days): Orange left border, AlertCircle icon
- **Expired**: Red left border, text-red-700

**Click Action**: Open date edit modal (if permission)

#### Source Column

**Format**: Badge with icon

| Source Type | Badge Color | Icon | Text |
|-------------|-------------|------|------|
| Manual Entry | Gray | Edit3 | Manual |
| Template Submission | Blue | FileText | Template |
| RFQ Response | Purple | MessageSquare | RFQ |
| Negotiation | Green | Handshake | Negotiation |
| Contract | Indigo | FileSignature | Contract |
| Excel Import | Orange | Upload | Import |

**Style**: rounded-full px-2 py-1 text-xs font-medium

**Tooltip**: Shows source reference (e.g., "Template: TPL-2401-0001" or "RFQ: RFQ-2401-0045")

**Click Action**: Navigate to source (template/RFQ detail page)

#### Status Column

**Format**: Badge with icon and sub-status

| Status | Badge Color | Icon | Sub-Status Examples |
|--------|-------------|------|---------------------|
| Draft | Gray (bg-gray-100 text-gray-800) | FileEdit | "In Progress" |
| Pending Approval | Yellow (bg-yellow-100 text-yellow-800) | Clock | "Awaiting Finance" |
| Approved | Green (bg-green-100 text-green-800) | CheckCircle | "Approved 2 days ago" |
| Active | Blue (bg-blue-100 text-blue-800) | Activity | "45 days remaining" |
| Expired | Orange (bg-orange-100 text-orange-800) | AlertTriangle | "Expired 3 days ago" |
| Archived | Red (bg-red-100 text-red-800) | Archive | "Superseded" |
| Superseded | Purple (bg-purple-100 text-purple-800) | Replace | "By PL-2401-00250" |

**Sub-status**: Small text below badge, provides context
- Pending: Shows who needs to approve
- Active: Shows expiry countdown
- Superseded: Shows which price list replaced it

**Tooltip**: Full status history, last 5 changes

#### Last Updated Column

**Format**:
```
2 hours ago
by Jane Doe
```

**Components**:
- **Relative Time**: "X minutes/hours/days ago"
  - Style: text-sm text-gray-900
  - Updates in real-time if <1 hour
- **User**: "by [Username]"
  - Style: text-xs text-gray-600
  - Hover: Underline, clickable to user profile

**Tooltip**: Full timestamp: "Jan 23, 2024 at 2:45 PM"

**Icon**: Edit2 or Clock icon (subtle, text-gray-400)

#### Actions Column

**Layout**: Flex row, gap-1, justify-end

**Icon Buttons** (always visible):
| Icon | Action | Tooltip | Visibility |
|------|--------|---------|------------|
| Eye | View Details | View price list | Always |
| Edit2 | Edit | Edit price list | Status: Draft, Active, permission: edit |
| Copy | Clone | Create copy | Always |

**Dropdown Menu** (MoreVertical icon):

**Menu Items**:
| Menu Item | Icon | Visibility Rules | Action |
|-----------|------|------------------|--------|
| View History | Clock | Always | Show price history |
| Compare Prices | BarChart2 | Active price lists | Open comparison |
| Download Excel | Download | Always | Export to Excel |
| Approve | CheckCircle | Status: Pending, permission: approve | Approve price list |
| Reject | XCircle | Status: Pending, permission: approve | Reject with reason |
| Extend Dates | Calendar | Active, permission: edit | Extend effective dates |
| Archive | Archive | Active, permission: archive | Archive price list |
| Delete | Trash2 | Status: Draft, permission: delete | Delete price list |
| Set Alert | Bell | Active | Create price alert |
| Generate Report | FileText | Always | Create PDF report |

**Menu Style**:
- Dropdown: min-width 200px, max-height 400px, overflow-y-auto
- Items: px-4 py-2, hover:bg-gray-50, cursor-pointer
- Dividers: border-t border-gray-200 between groups
- Icons: size-4, mr-2, text-gray-500
- Destructive actions: text-red-600 hover:bg-red-50

**Keyboard Navigation**:
- Tab to actions, Enter to open menu
- Arrow keys to navigate menu
- Enter to select, Esc to close

---

### Row Expansion (Optional)

**Trigger**: Click row (not on action buttons)

**Expanded Content**: Shows product list with pricing

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  [Collapsed Row]                                            │
├─────────────────────────────────────────────────────────────┤
│  Product List (128 products)              [Collapse ▲]      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Product         SKU       Price   Change   Status  │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Tomatoes 1kg   SKU001    $3.50    +5%     ✓       │    │
│  │ Onions 1kg     SKU002    $2.20    -2%     ✓       │    │
│  │ ...                                                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  [View Full Price List] [Compare with Others] [Download]   │
└─────────────────────────────────────────────────────────────┘
```

**Product Table** (within expansion):
- Paginated (10 products per page)
- Sortable columns
- Search within products
- Quick actions: Edit price, View history

**Expansion State**: Persists during session, auto-collapse on filter/sort change

---

## Card View

### Card Layout

**Container**: Grid 3 columns desktop, 2 tablet, 1 mobile, gap-6

### Card Structure

```
┌──────────────────────────────────────────┐
│ [Status Badge]        [Favorite ⭐]      │
│                                          │
│ 💰 Kitchen Equipment - Monthly 2024     │
│                                          │
│ 🏢 ABC Corporation                       │
│ VEN-ABC-001                              │
│                                          │
│ ┌──────────┬──────────┬────────────┐   │
│ │128       │$24.50    │Jan-Dec 2024│   │
│ │Products  │Avg Price │Valid Range │   │
│ └──────────┴──────────┴────────────┘   │
│                                          │
│ ━━━━━━━━━━━━━━━━━━ 75% ━━━━━━━━━━━    │
│                                          │
│ Updated 2 hours ago by Jane Doe          │
│                                          │
│ [View] [Edit] [•••]                     │
└──────────────────────────────────────────┘
```

**Card Style**:
- bg-white, rounded-lg, shadow-sm, border border-gray-200
- p-6, hover:shadow-md transition-shadow duration-200
- cursor-pointer (click anywhere to view details except action buttons)

### Card Elements

**Header Row**:
- **Status Badge**: Top-left, same styling as table view
- **Favorite Icon**: Top-right, toggle on click
- **Source Icon**: Small badge next to status

**Price List Name**:
- H3, text-lg font-semibold text-gray-900
- Icon: 💰 (left side)
- Truncate to 2 lines, ellipsis
- Full name in tooltip

**Vendor Info**:
- Vendor name: font-medium text-gray-700
- Vendor code: text-sm text-gray-500, font-mono
- Vendor logo: 24x24 icon (if available)

**Quick Stats Grid** (3 columns):
- Products count
- Average price with change indicator
- Effective date range (shortened)
- Each stat: Center-aligned, icon above value

**Progress Bar**:
- Shows completion percentage if partial
- Or shows time remaining if active
- Color-coded: Green (healthy), Yellow (warning), Red (urgent)

**Footer**:
- Last updated info: text-xs text-gray-600
- Action buttons: View, Edit, More (horizontal layout)

**Hover Effects**:
- Elevate shadow
- Slight border color change (border-blue-300)

---

## Compact View

### Layout
**Style**: List view, minimal spacing, maximum information density

**Row Structure**:
```
💰 Kitchen Equip. - Monthly '24 │ ABC Corp │ 128p │ $24.50 ↑3% │ Jan-Dec 2024 │ Active │ 2h ago │ [•••]
```

**Components** (all on one line):
- Icon + Name (truncated to 30 chars)
- Vendor (truncated to 15 chars)
- Product count
- Avg price + change
- Date range (abbreviated)
- Status badge (small)
- Last updated (relative)
- Actions menu

**Row Style**:
- py-2, px-4, border-b border-gray-200
- hover:bg-gray-50
- text-sm
- Overflow: ellipsis

**Use Case**: Large datasets, quick scanning

---

## Bulk Selection & Operations

### Selection Toolbar

**Trigger**: Appears when ≥1 rows selected

**Position**: Sticky top, z-index-10, slides down animation

**Style**: bg-blue-50, border-blue-200, rounded-lg, p-4, flex items-center

**Layout**:
```
┌────────────────────────────────────────────────────────────┐
│ ✓ 5 price lists selected              [Clear Selection]   │
│                                                            │
│ [Export Selected] [Approve All] [Bulk Edit] [Archive All] │
└────────────────────────────────────────────────────────────┘
```

**Selection Counter**: "X price lists selected"
- Style: font-semibold text-blue-900

**Clear Button**: Deselect all, reset

### Bulk Action Buttons

| Button | Icon | Purpose | Visibility |
|--------|------|---------|------------|
| Export Selected | Download | Export to Excel/CSV | ≥1 selected |
| Approve All | CheckCircle | Approve multiple | All selected = pending, permission: approve |
| Reject All | XCircle | Reject multiple | All selected = pending, permission: approve |
| Bulk Edit Dates | Calendar | Update effective dates | ≥1 selected, permission: edit |
| Archive All | Archive | Archive multiple | All selected = active, permission: archive |
| Delete All | Trash2 | Delete multiple | All selected = draft, permission: delete |
| Set Alerts | Bell | Create alerts for selected | ≥1 active selected |
| Compare Selected | BarChart2 | Multi-way price comparison | 2-10 active selected |

**Confirmation Dialogs**:
- All destructive actions require confirmation
- Show list of affected price lists
- Option to proceed with warnings
- Undo not available warning for delete/archive

---

## Pagination

**Position**: Bottom of table, center-aligned

**Layout**: Flex row, items-center, gap-4

**Components**:

### Page Info
**Text**: "Showing 1-25 of 245 price lists"
**Style**: text-sm text-gray-700

### Page Numbers
**Display**: Numbered buttons with ellipsis for large ranges
**Example**: `[1] [2] [3] ... [10] [11]`

**Button States**:
- Current: bg-blue-600 text-white, font-semibold
- Other: bg-white text-gray-700 border, hover:bg-gray-50
- Disabled: opacity-50 cursor-not-allowed

**Ellipsis**: When >7 pages, show first 2, last 2, current ±1

### Navigation Buttons
| Button | Icon | Action | Disabled When |
|--------|------|--------|---------------|
| First | ChevronsLeft | Go to page 1 | On page 1 |
| Previous | ChevronLeft | Previous page | On page 1 |
| Next | ChevronRight | Next page | On last page |
| Last | ChevronsRight | Go to last page | On last page |

### Jump to Page
**Input**: Number input + "Go" button
**Validation**: 1 to max page
**Placeholder**: "Page #"

### Items Per Page Selector
**Dropdown**: 10 | 25 | 50 | 100 | All
**Current selection highlighted**

**Keyboard Navigation**:
- Left/Right arrows: Prev/Next page
- Home/End: First/Last page
- Number keys: Jump to page (if <10 pages)

---

## Empty States

### No Price Lists (No Data)

**Display When**: Database has no price lists for this user

**Visual**:
```
┌──────────────────────────────────────┐
│                                      │
│          📊 (large icon)             │
│                                      │
│      No Price Lists Yet              │
│                                      │
│  Create your first price list to    │
│  start managing vendor pricing.      │
│                                      │
│  [Create First Price List]          │
│                                      │
│  or                                  │
│                                      │
│  [Import from Excel]                │
└──────────────────────────────────────┘
```

**Style**:
- Centered in page
- Icon: size-24, text-gray-400
- Title: text-xl font-semibold text-gray-900
- Description: text-gray-600, max-width 400px
- Buttons: Primary (Create) and Secondary (Import)

**Help Links**:
- "Learn about price lists"
- "Watch tutorial video"
- "Import from template"

---

### No Results (With Filters Active)

**Display When**: Filters/search return no results

**Visual**:
```
┌──────────────────────────────────────┐
│          🔍 (large icon)             │
│                                      │
│    No price lists match your        │
│         search criteria              │
│                                      │
│  Active filters:                     │
│  • Vendor: ABC Corp                  │
│  • Status: Active                    │
│  • Product Category: Food            │
│                                      │
│  [Clear All Filters] [Modify Search] │
└──────────────────────────────────────┘
```

**Components**:
- Icon: Search or Filter
- Title: "No results found"
- Active filters list
- Suggestions:
  - Remove some filters
  - Try different search terms
  - Clear all and start over
- Action buttons

---

### No Favorite Price Lists

**Display When**: User has no favorites, viewing favorites filter

**Visual**:
```
No favorite price lists yet

Click the ⭐ star icon on any price list
to add it to your favorites for quick access.

[View All Price Lists]
```

---

## Dialogs & Modals

### 1. Quick View Modal

**Trigger**: Click eye icon in actions

**Size**: Large (modal-lg, 800px width)

**Title**: Price List Quick View

**Content Sections**:

**Header**:
- Price list name
- Status badge
- Close button (X)

**Summary Card**:
- Vendor info with logo
- Effective dates
- Product count
- Avg price with trend
- Source info

**Product Table** (Simplified):
- Top 10 products
- Columns: Product, Price, Change, Status
- "View Full Details" link at bottom

**Actions**:
- [Edit Price List]
- [Download Excel]
- [Compare with Others]
- [View Full Details] (navigates to detail page)

**Footer**:
- Last updated info
- Created by info

---

### 2. Bulk Approve Confirmation

**Trigger**: Click "Approve All" in bulk toolbar

**Title**: Approve Selected Price Lists

**Warning**:
```
⚠️ You are about to approve 5 price lists.

This action will:
• Activate the price lists immediately
• Make them available for use in procurement
• Supersede any overlapping price lists
• Send notifications to relevant teams

Price lists to approve:
1. Kitchen Equipment - Monthly 2024 (ABC Corp)
2. Fresh Produce - Q1 2024 (XYZ Farms)
...
```

**Conflicts** (if any):
```
⚠️ Conflicts detected:

• "Kitchen Equipment - Monthly 2024" overlaps with
  existing active price list "Kitchen Equipment Jan 2024"

  Action: [Keep Both] [Supersede Old] [Skip This]
```

**Approval Note**:
- Textarea: "Approval note (optional)"
- Max 500 characters

**Actions**:
- [Cancel] (Secondary)
- [Approve All] (Primary, green)

**After Approval**:
- Success toast: "5 price lists approved successfully"
- Refresh list
- Email notifications sent

---

### 3. Excel Import Wizard

**Trigger**: Click "Import Prices" button

**Multi-Step Modal**: 4 steps with progress indicator

**Step 1: Select Import Type**:
```
Choose import operation:

○ Create New Price Lists
  Upload Excel file with pricing data to create
  new price lists for vendors.

○ Update Existing Price Lists
  Update prices in existing price lists with
  new data from Excel file.

○ Add Products to Price Lists
  Add additional products to existing price lists.

[Cancel]  [Next →]
```

**Step 2: Download Template**:
```
Download Excel Template

Template includes:
• Column headers and validation
• Sample data rows
• Vendor and product reference lists
• Instructions worksheet

Select template type:
○ New Price List Template
○ Update Prices Template (select price list: [dropdown])
○ Add Products Template (select price list: [dropdown])

[Download Template]

[← Back]  [Next →]
```

**Step 3: Upload Completed File**:
```
Upload Completed Excel File

[Drag & drop file here or click to browse]

Accepted formats: .xlsx, .xls, .csv
Maximum file size: 50MB

File requirements:
✓ Must match downloaded template structure
✓ Vendor codes must exist in system
✓ Product SKUs must exist in catalog
✓ All required fields must be filled

[← Back]  [Next →]
```

**Step 4: Review & Validate**:
```
Import Preview

File: vendor_prices_2024.xlsx
Total rows: 245

Validation Results:
✓ 238 rows valid
⚠️ 5 rows with warnings
✗ 2 rows with errors

[Show Valid] [Show Warnings] [Show Errors]

Warnings:
• Row 45: Product SKU-045 not found in catalog
  → [Skip Row] [Create New Product] [Map to Existing]

Errors:
• Row 78: Price value invalid (not a number)
• Row 112: Vendor code missing

Options:
☐ Skip rows with errors
☐ Import only valid rows
☐ Fix errors and re-upload

[← Back]  [Import Valid Rows]  [Download Error Report]
```

**After Import**:
- Progress bar during import
- Success summary:
  ```
  Import Complete! ✓

  • 238 price lists created/updated
  • 5 rows skipped (warnings)
  • 2 rows failed (errors)

  [View Imported Price Lists]
  [Download Import Log]
  [Close]
  ```

---

### 4. Compare Prices Dialog

**Trigger**: Click "Compare Prices" button or "Compare Selected" in bulk

**Size**: Extra large (modal-xl, fullscreen option)

**Title**: Price Comparison

**Vendor Selection** (if not from bulk):
```
Select vendors to compare (2-10):

☐ ABC Corporation (128 products)
☐ XYZ Farms (95 products)
☐ Quality Supplies Ltd (156 products)
...

[Select All] [Clear Selection]
```

**Comparison View**:
```
Comparing 3 vendors across 245 products

[Table View] [Chart View] [Summary View]

Product Filter: [All Categories ▼] [Search products...]

┌────────────────────────────────────────────────────────────┐
│ Product        │ ABC Corp  │ XYZ Farms │ Quality Ltd │Best│
├────────────────┼───────────┼───────────┼─────────────┼────┤
│ Tomatoes 1kg   │ $3.50 ✓  │ $3.75     │ $3.60       │ABC │
│ Onions 1kg     │ $2.20     │ $2.10 ✓  │ $2.25       │XYZ │
│ Potatoes 5kg   │ $8.50 ✓  │ $8.90     │ $8.70       │ABC │
...
└────────────────────────────────────────────────────────────┘

Summary:
• ABC Corp: Lowest price on 128 products (52%)
• XYZ Farms: Lowest price on 67 products (27%)
• Quality Ltd: Lowest price on 50 products (20%)

Total potential savings: $1,245 if buying from cheapest vendor per product

[Export Comparison] [Generate Report] [Close]
```

**Chart View**: Bar chart showing price distribution per product

**Summary View**: Aggregated statistics, savings opportunities

---

### 5. Set Price Alert Dialog

**Trigger**: Click "Set Alert" in actions menu

**Title**: Create Price Alert for [Price List Name]

**Alert Configuration**:
```
Alert Name: [_______________________________]

Alert Conditions:
☐ Price increases by more than [__]%
☐ Price decreases by more than [__]%
☐ New price list submitted by this vendor
☐ Price list expiring in [__] days
☐ Competitor pricing available

Alert Actions:
☑ Send email notification to [current user ▼]
☑ Show in-app notification
☐ Send SMS (mobile number required)

Additional Recipients:
[+ Add recipient]

Alert Frequency:
○ Immediate (real-time)
○ Daily digest
○ Weekly summary

Alert Duration:
○ Until manually disabled
○ Until [date picker]

[Cancel]  [Create Alert]
```

**After Creation**:
- Success toast: "Price alert created successfully"
- Alert badge appears on price list row
- Navigate to alerts management page (optional)

---

### 6. Extend Effective Dates Dialog

**Trigger**: Click "Extend Dates" in actions menu

**Title**: Extend Effective Dates

**Current Dates Display**:
```
Current Effective Dates:
From: Jan 15, 2024
To:   Dec 31, 2024

Status: Active (245 days remaining)
```

**New Dates Input**:
```
New Effective Dates:

Effective From: [Jan 15, 2024] (read-only)

Effective To: [_____________] (date picker)
              Current: Dec 31, 2024
              Minimum: Today

Extension Reason: [_______________________________]
                  (required, min 20 characters)

Notifications:
☑ Notify procurement team
☐ Notify vendor
☐ Notify finance team

[Cancel]  [Extend Dates]
```

**Validation**:
- New "To" date must be after current "To" date
- Reason required
- Warning if extension >1 year

**Confirmation**:
```
Confirm Date Extension

You are extending the effective dates:

From: Dec 31, 2024
To:   Jun 30, 2025

Extension: 6 months

This will keep the price list active for an additional 6 months.

[Cancel]  [Confirm Extension]
```

---

## Loading States

### Initial Page Load

**Skeleton Loaders**:
- Quick stats cards: 4 pulsing gray boxes
- Filter bar: Gray bars for dropdowns
- Table rows: 10 skeleton rows with animated gradient

**Style**: bg-gray-200 animate-pulse

**Duration**: Until data loads (typically <1s)

---

### Filter/Search Loading

**Overlay**: Semi-transparent gray overlay on table
**Spinner**: Centered spinner with "Filtering..." text
**Existing Content**: Remains visible but slightly faded

---

### Infinite Scroll Loading (if implemented)

**Position**: Bottom of table
**Spinner**: Small spinner + "Loading more price lists..."
**Trigger**: Scroll to bottom with >100 items remaining

---

## Error States

### General Error

**Display**:
```
⚠️ Unable to load price lists

An error occurred while loading the data.
Please try again or contact support if the problem persists.

Error Code: ERR_PL_001

[Retry]  [Contact Support]
```

**Fallback**: Show last successful data with "Data may be outdated" warning

---

### Permission Error

**Display**:
```
🔒 Access Denied

You don't have permission to view price lists.

Contact your administrator to request access.

Required permission: view_price_lists

[Go to Dashboard]  [Request Access]
```

---

### Network Error

**Display**:
```
📡 Connection Lost

Unable to connect to the server.
Retrying automatically in 5 seconds...

[Retry Now]
```

**Auto-retry**: Exponential backoff (5s, 10s, 20s, 40s)

---

## Accessibility (WCAG 2.1 AA Compliance)

### Keyboard Navigation

**Tab Order**:
1. Skip to main content link (hidden, visible on focus)
2. Action buttons (header)
3. Filter tabs
4. Filter dropdowns
5. Search field
6. Table rows / Cards
7. Pagination controls

**Shortcuts**:
| Key | Action |
|-----|--------|
| / | Focus search |
| N | New price list |
| F | Toggle filters |
| T | Switch to table view |
| C | Switch to card view |
| ↑↓ | Navigate table rows |
| Enter | View selected row details |
| Space | Select row (checkbox) |
| Esc | Close modal/clear search |

**Focus Indicators**:
- ring-2 ring-blue-500 ring-offset-2
- High contrast, clearly visible
- Never hidden (outline: none is forbidden)

### Screen Reader Support

**ARIA Labels**:
- All interactive elements labeled
- Table headers with proper scope
- Status announcements for dynamic content
- Live regions for updates

**ARIA Live Regions**:
```html
<div aria-live="polite" aria-atomic="true">
  Showing 25 of 245 price lists
</div>

<div aria-live="assertive" role="alert">
  Price list approved successfully
</div>
```

**Alternative Text**:
- All icons have aria-labels
- Status badges include full text for screen readers
- Chart visualizations have data table alternatives

### Color & Contrast

**Contrast Ratios**:
- Normal text: ≥4.5:1
- Large text (18pt+): ≥3:1
- UI components: ≥3:1
- Status indicators: Never rely on color alone

**Color-Blind Safe**:
- Use icons + text for status
- Distinct patterns for charts
- Tested with Deut eranopia/Protanopia/Tritanopia simulators

### Visual Hierarchy

**Headings**:
- H1: Page title
- H2: Section titles (Filters, Table)
- H3: Card titles, modal titles
- Proper nesting, no skipped levels

**Landmarks**:
- `<nav>`: Breadcrumb, pagination
- `<main>`: Primary content
- `<aside>`: Filters (if in sidebar)
- `<dialog>`: Modals

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | <640px | 1 column, stacked filters, compact cards |
| Tablet | 640-1023px | 2 columns, side drawer filters |
| Desktop | 1024-1279px | 3 columns, inline filters |
| Large | ≥1280px | 4 columns, full features |

### Mobile Optimizations (<640px)

**Header**:
- Action buttons in dropdown menu (hamburger)
- Breadcrumb hidden, show back button instead

**Quick Stats**:
- Horizontal scroll cards or vertical stack
- Swipe gesture between cards

**Filters**:
- Bottom sheet or full-screen modal
- "Filters (5)" button shows active count
- Apply button required

**Search**:
- Full width, prominent
- Voice search option (if supported)

**View**:
- Cards only (table too wide)
- Swipe to reveal actions

**Pagination**:
- Compact: [<] [5/25] [>]
- Load more button option

### Touch Interactions

**Tap Targets**: Minimum 44x44px
**Gestures**:
- Swipe row left: Quick actions
- Swipe row right: Select/favorite
- Pull down: Refresh
- Pinch zoom: Not applicable (disable)

---

## Performance Optimization

### Data Loading

**Initial Load**: Load first 25 rows, lazy load rest
**Virtual Scrolling**: For >100 items
**Pagination**: Default, better for large datasets
**Debounce**: Search/filter inputs (300ms)

### Caching Strategy

**LocalStorage**:
- User preferences (view mode, sort, items per page)
- Recent searches
- Saved filters

**Session Storage**:
- Current filter state
- Scroll position

**Cache Duration**:
- Price list data: 5 minutes
- Quick stats: 2 minutes
- Vendor/product lists: 1 hour

### Image Optimization

**Vendor Logos**:
- Lazy load off-screen images
- WebP format with fallback
- Responsive sizes: 32px, 64px, 128px
- Placeholder while loading

### Code Splitting

**Route-based**: Load page bundle on demand
**Component-based**: Lazy load modals/dialogs
**Vendor chunks**: Separate third-party libraries

**Bundle Targets**:
- Initial: <150KB gzipped
- Total: <500KB gzipped
- Time to Interactive: <3s on 3G

---

## Analytics & Tracking

### User Actions to Track

| Event | Trigger | Data Captured |
|-------|---------|---------------|
| page_viewed | Page load | user_id, filters_active, view_mode |
| filter_applied | Apply filters | filter_values, result_count |
| search_performed | Search submit | search_query, result_count |
| price_list_viewed | View details | price_list_id, source |
| price_list_created | Create success | price_list_id, source_type, product_count |
| bulk_action | Bulk operation | action_type, item_count |
| export_initiated | Export click | export_format, filter_state |
| comparison_performed | Compare prices | vendor_count, product_count |
| alert_created | Alert setup | alert_type, conditions |

### Performance Metrics

**Track**:
- Page load time
- Time to first interaction
- Filter response time
- Search response time
- API call duration

**Thresholds**:
- Page load: <3s target
- Filter/search: <500ms target
- API calls: <200ms target

---

## Integration Points

### API Endpoints

**Price Lists**:
- `GET /api/price-lists` - List with filters
- `GET /api/price-lists/:id` - Detail
- `POST /api/price-lists` - Create
- `PUT /api/price-lists/:id` - Update
- `DELETE /api/price-lists/:id` - Delete
- `POST /api/price-lists/bulk-import` - Excel import
- `GET /api/price-lists/export` - Excel export

**Stats**:
- `GET /api/price-lists/stats` - Quick stats
- `GET /api/price-lists/analytics` - Detailed analytics

**Comparison**:
- `POST /api/price-lists/compare` - Compare selected

**Alerts**:
- `POST /api/price-lists/alerts` - Create alert
- `GET /api/price-lists/:id/alerts` - List alerts

### Real-time Updates (WebSocket)

**Events**:
- `price_list.created` - New price list
- `price_list.updated` - Price changes
- `price_list.approved` - Approval status change
- `price_list.expired` - Expiration notification

**UI Updates**:
- Badge counts refresh
- Status badges update
- New row animation
- Toast notification

---

## Security Considerations

### Data Protection

**Row-Level Security**:
- Users only see price lists for authorized vendors
- Department filtering applied automatically
- Location-based access control

**Sensitive Data**:
- Pricing data masked for unauthorized users
- Vendor details restricted
- Approval history limited to approvers

**Audit Trail**:
- All actions logged (view, create, edit, delete)
- IP address and user agent captured
- Export actions tracked
- Bulk operations audited

### Input Validation

**Client-side**:
- Format validation (dates, numbers)
- Required field checks
- Dropdown constraints

**Server-side**:
- All inputs re-validated
- SQL injection prevention
- XSS protection
- CSRF tokens

---

## Browser Support

**Fully Supported**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Partially Supported** (degraded experience):
- IE 11 (basic table view only, no animations)

**Not Supported**: <IE 11

---

## Future Enhancements

### Planned Features

**Phase 2**:
- AI-powered price predictions
- Automated price optimization suggestions
- Advanced analytics dashboard
- Mobile app for price approvals

**Phase 3**:
- Blockchain price verification
- Real-time market price integration
- Supplier portal integration
- Advanced negotiation workflows

### Performance Targets

**Q2 2024**:
- Sub-second filter response
- <2s initial page load
- 95th percentile API response <200ms

---

## Document Metadata

**Created**: 2025-11-23
**Last Updated**: 2025-11-23
**Version**: 1.0.0
**Author**: System Documentation
**Approved By**: Pending
**Related Pages**:
- PC-pricelist-create.md
- PC-pricelist-detail.md
- PC-pricelist-comparison.md
- PC-pricelist-history.md

---

**End of Document**
