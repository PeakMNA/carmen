# PC-pricelist-alerts.md - Price Alert Management Page

## Document Information
- **Page Name**: Price Alert Management
- **Route**: `/vendor-management/price-lists/alerts`
- **Parent Module**: Vendor Management > Price Lists
- **Related Documents**:
  - UC-price-lists.md (Use Cases)
  - BR-price-lists.md (Business Requirements)
  - TS-price-lists.md (Technical Specification)
  - PC-pricelist-list.md (List Page)
  - PC-pricelist-detail.md (Detail Page)
  - PC-pricelist-history.md (Price History)
  - PC-pricelist-comparison.md (Comparison Tool)

---

## Page Overview

### Purpose
Centralized alert management system that enables users to create, configure, monitor, and manage automated price alerts. Provides proactive notifications for significant price changes, helping procurement teams respond quickly to market fluctuations and optimize purchasing decisions.

### User Roles
- **All Users**: Can view alerts assigned to them and create personal alerts
- **Procurement Staff**: Can create and manage alerts for assigned products/categories
- **Procurement Manager**: Full access including team alert management and templates
- **Department Manager**: View and manage alerts for department products
- **Finance Manager**: Access to cost-related alerts and analytics

### Key Features
- **Alert List View**: Display all active, inactive, and triggered alerts
- **Alert Configuration Wizard**: Step-by-step alert creation with validation
- **Trigger Conditions**: Price thresholds, percentage changes, volatility levels
- **Notification Settings**: Email, in-app, SMS with frequency control
- **Alert History**: Complete log of triggered alerts with details
- **Performance Metrics**: Alert effectiveness and response analytics
- **Bulk Operations**: Enable/disable/delete multiple alerts at once
- **Alert Templates**: Pre-configured alerts for common scenarios
- **Test Alert**: Test notifications before activating
- **Alert Analytics**: Dashboard showing alert performance and trends
- **Smart Suggestions**: AI-powered alert recommendations

---

## Page Layout

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Breadcrumb + Page Title + Action Buttons            │
├─────────────────────────────────────────────────────────────┤
│ Alert Summary Cards                                          │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ Active   │ Triggered│ Templates│ Response │              │
│ └──────────┴──────────┴──────────┴──────────┘              │
├─────────────────────────────────────────────────────────────┤
│ Tab Navigation                                               │
│ [My Alerts] [Team Alerts] [History] [Templates] [Analytics] │
├─────────────────────────────────────────────────────────────┤
│ Filter Bar + Search + Bulk Actions                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    Alert List / Active Tab Content           │
│                                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop (≥1024px)**: Full layout, side-by-side panels, wide tables
- **Tablet (768px-1023px)**: Stacked panels, full-width tables
- **Mobile (<768px)**: Card-based layout, collapsible sections, bottom sheets

---

## Page Header

### Breadcrumb
**Text**: Home / Vendor Management / Price Lists / Price Alerts

**Style**:
- Text-sm, text-gray-500
- Links: text-blue-600 hover:text-blue-800 hover:underline
- Current: text-gray-900 font-medium
- Separator: text-gray-400 "/"

**Accessibility**:
- aria-label="Breadcrumb navigation"
- aria-current="page" on current item

### Page Title
**Text**: Price Alert Management

**Icon**: Bell, size-6, text-orange-600, mr-3

**Style**: H1, text-2xl lg:text-3xl, font-bold, text-gray-900

**Subtitle**: Monitor and manage price change alerts
- Text-sm, text-gray-600, mt-1

### Action Buttons

**Layout**: Flex row, gap-2, justify-end

| Button | Purpose | Icon | Style | Tooltip | Keyboard |
|--------|---------|------|-------|---------|----------|
| Create Alert | Create new alert | Plus | Primary (orange) | Create new price alert | N |
| Templates | Browse alert templates | FileTemplate | Secondary | Use alert template | T |
| Test Alert | Send test notification | Zap | Secondary | Test alert notifications | - |
| Settings | Alert preferences | Settings | Tertiary | Alert settings | - |
| Export | Export alert data | Download | Tertiary | Export alert list | X |

---

## Summary Statistics Cards

**Layout**: Grid 4 columns on desktop, 2 on tablet, 1 on mobile

### Card 1: Active Alerts
```
┌────────────────────────┐
│ 🔔 Active Alerts       │
│                        │
│ 23                     │
│ monitoring products    │
│                        │
│ 15 Personal            │
│ 8 Team alerts          │
└────────────────────────┘
```

**Card Style**:
- Large metric: text-3xl font-bold text-orange-600
- Sub-metrics: text-sm text-gray-600

**Interaction**:
- Click to filter list to active alerts only

### Card 2: Triggered Today
```
┌────────────────────────┐
│ ⚡ Triggered Today     │
│                        │
│ 5                      │
│ alerts triggered       │
│                        │
│ 3 Price increases      │
│ 2 Price decreases      │
└────────────────────────┘
```

**Badge**: Shows "NEW" if any unreviewed triggers

**Interaction**:
- Click to view triggered alerts

### Card 3: Alert Templates
```
┌────────────────────────┐
│ 📋 Alert Templates     │
│                        │
│ 12                     │
│ templates available    │
│                        │
│ 3 Most used            │
│ 2 Custom templates     │
└────────────────────────┘
```

**Interaction**:
- Click to browse templates

### Card 4: Avg Response Time
```
┌────────────────────────┐
│ ⏱️ Avg Response Time   │
│                        │
│ 2.3 hours              │
│ from trigger to action │
│                        │
│ ↓ 15% vs last month   │
└────────────────────────┘
```

**Trend Indicator**:
- Green ↓: Improvement (faster response)
- Red ↑: Degradation (slower response)

---

## Tab Navigation

### Tabs
| Tab Label | Icon | Badge | Default | Route |
|-----------|------|-------|---------|-------|
| My Alerts | User | Active count (23) | Yes | ?tab=my-alerts |
| Team Alerts | Users | Team count (8) | - | ?tab=team-alerts |
| History | Clock | Today's triggers (5) | - | ?tab=history |
| Templates | FileTemplate | - | - | ?tab=templates |
| Analytics | TrendingUp | - | - | ?tab=analytics |

**Tab Style**:
- Active: border-b-2 border-orange-600, text-orange-600, font-medium
- Inactive: text-gray-600 hover:text-gray-900
- Badge: bg-orange-100 text-orange-800, rounded-full, px-2 py-0.5

---

## Tab 1: My Alerts

### Filter & Search Bar
```
┌─────────────────────────────────────────────────────────────┐
│ [🔍 Search alerts by name, product, or vendor_________]      │
│                                                              │
│ Status: [All Alerts ▼]  Product: [All Products ▼]          │
│ Vendor: [All Vendors ▼]  Type: [All Types ▼]               │
│                                                              │
│ [Reset Filters]                                             │
└─────────────────────────────────────────────────────────────┘
```

**Filter Options**:

**Status Filter**:
- All Alerts
- Active Only
- Inactive Only
- Recently Triggered (last 7 days)
- Never Triggered

**Type Filter**:
- All Types
- Price Increase
- Price Decrease
- Price Spike (>20%)
- Volatility
- Threshold

### Bulk Actions Bar (when items selected)
```
┌─────────────────────────────────────────────────────────────┐
│ 5 alerts selected                                            │
│                                                              │
│ [Enable] [Disable] [Delete] [Export] [Clear Selection]     │
└─────────────────────────────────────────────────────────────┘
```

### Alert List

**List Item Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ [☑] 🔔 Fresh Tomatoes Price Spike Alert          [Active ✓] │
│                                                              │
│ Product: Fresh Tomatoes (PROD-001) • Vendors: 3             │
│ Trigger: Price increase >20% or exceeds $3.00               │
│                                                              │
│ Last Triggered: 2 days ago (Jan 18, 2024)                  │
│ Total Triggers: 12 times • Response Rate: 75%              │
│                                                              │
│ Notifications: Email, In-app • Frequency: Immediate         │
│ Created: Jan 1, 2024 by You                                │
│                                                              │
│ [Edit] [Disable] [View History] [Test] [Delete] [...]      │
└─────────────────────────────────────────────────────────────┘
```

**List Item Components**:

**Header Section**:
- Checkbox for bulk selection
- Alert icon (🔔 Bell)
- Alert name (text-lg font-semibold)
- Status badge (Active/Inactive)

**Details Section**:
- Product and vendor information
- Trigger conditions (plain English)
- Last triggered date and time
- Performance metrics (triggers, response rate)
- Notification settings
- Creation info

**Action Buttons**:
- Edit: Open edit dialog
- Disable/Enable: Toggle alert status
- View History: Show trigger history
- Test: Send test notification
- Delete: Remove alert (with confirmation)
- More: Additional options dropdown

**Status Badge Variants**:
| Status | Badge Color | Icon | Meaning |
|--------|-------------|------|---------|
| Active | Green | CheckCircle | Alert is monitoring |
| Inactive | Gray | Pause | Alert is paused |
| Triggered | Orange | Bell | Recently triggered |
| Error | Red | AlertTriangle | Configuration error |

### Alert States

**Active Alert** (normal):
- Border: border-l-4 border-green-500
- Background: bg-white
- Icons: text-gray-600

**Recently Triggered** (within 24 hours):
- Border: border-l-4 border-orange-500
- Background: bg-orange-50
- Badge: "NEW" if unreviewed

**Inactive Alert**:
- Border: border-l-4 border-gray-300
- Background: bg-gray-50
- Opacity: opacity-60

**Error State**:
- Border: border-l-4 border-red-500
- Background: bg-red-50
- Error message displayed

### Sorting Options
```
┌─────────────────────────────────────────────────────────────┐
│ Sort by: [Most Recent ▼]                                    │
│                                                              │
│ Options:                                                     │
│ • Most Recent (created)                                     │
│ • Last Triggered                                            │
│ • Alert Name (A-Z)                                          │
│ • Product Name (A-Z)                                        │
│ • Most Triggered                                            │
│ • Highest Response Rate                                     │
└─────────────────────────────────────────────────────────────┘
```

### Pagination
```
┌─────────────────────────────────────────────────────────────┐
│ Showing 1-10 of 23 alerts                                    │
│                                                              │
│ [← Previous] Page 1 of 3 [Next →]                           │
│                                                              │
│ Items per page: [10 ▼]                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Create Alert Wizard

**Trigger**: Click "Create Alert" button

### Wizard Overview

**Wizard Steps**:
1. **Alert Type** - Choose alert template or custom
2. **Monitoring Scope** - Select products and vendors
3. **Trigger Conditions** - Define alert criteria
4. **Notification Settings** - Configure notifications
5. **Review & Activate** - Review and activate alert

### Wizard Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Create Price Alert                                      [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Progress: [●────────────────] Step 1 of 5                   │
│                                                              │
│ [1. Type] → [2. Scope] → [3. Conditions] → [4. Notify] → [5. Review] │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    Step Content Area                         │
│                                                              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [Cancel] [Save as Draft]           [← Previous] [Next →]   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Step 1: Alert Type

**Page Content**:
```
┌─────────────────────────────────────────────────────────────┐
│ Choose How to Create Your Alert                             │
│                                                              │
│ (•) Start from Template                                     │
│     Use a pre-configured alert for common scenarios         │
│                                                              │
│     Template Categories:                                     │
│     ┌───────────────────────────────────────────┐          │
│     │ Price Spike Alerts (3 templates)          │          │
│     │ Threshold Alerts (4 templates)            │          │
│     │ Volatility Alerts (2 templates)           │          │
│     │ Comparative Alerts (3 templates)          │          │
│     └───────────────────────────────────────────┘          │
│                                                              │
│     Most Popular:                                            │
│     ( ) Price Increase >10% Alert                          │
│     ( ) Price Threshold Alert ($X exceeded)                │
│     ( ) High Volatility Alert                              │
│                                                              │
│ ( ) Create Custom Alert                                    │
│     Build from scratch with full customization              │
│                                                              │
│ [View All Templates]                                        │
└─────────────────────────────────────────────────────────────┘
```

**Template Selection**:
- Radio button selection
- Template preview on hover
- Quick start with popular templates
- Link to browse all templates

### Step 2: Monitoring Scope

**Page Content**:
```
┌─────────────────────────────────────────────────────────────┐
│ What Should This Alert Monitor?                             │
│                                                              │
│ Alert Name: *                                                │
│ [Fresh Tomatoes Price Monitor____________________]          │
│                                                              │
│ Monitor: (•) Specific Products  ( ) Categories  ( ) All     │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Select Products                           │              │
│ │                                           │              │
│ │ [🔍 Search products_______________]       │              │
│ │                                           │              │
│ │ Selected (2):                             │              │
│ │ ✓ Fresh Tomatoes (PROD-001)    [✕]       │              │
│ │ ✓ Fresh Lettuce (PROD-002)     [✕]       │              │
│ │                                           │              │
│ │ [+ Add Products]                          │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ Vendors to Monitor: (•) All Vendors  ( ) Specific Vendors   │
│                                                              │
│ When "Specific Vendors" selected:                           │
│ ┌───────────────────────────────────────────┐              │
│ │ ☑ ABC Foods Inc. (VEN-001)               │              │
│ │ ☑ XYZ Distributors (VEN-002)             │              │
│ │ ☐ GreenFarm Suppliers (VEN-003)          │              │
│ │                                           │              │
│ │ [Select All] [Clear All]                  │              │
│ └───────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**Validation**:
- Alert name required (5-100 characters)
- At least 1 product required
- At least 1 vendor required (if "Specific Vendors")

### Step 3: Trigger Conditions

**Page Content**:
```
┌─────────────────────────────────────────────────────────────┐
│ When Should This Alert Trigger?                             │
│                                                              │
│ Alert Conditions (Select at least one):                     │
│                                                              │
│ Price Change Thresholds:                                     │
│ ☑ Price increases by more than [10__]%                     │
│ ☑ Price decreases by more than [10__]%                     │
│ ☐ Price changes (any amount)                               │
│                                                              │
│ Price Level Thresholds:                                      │
│ ☑ Price exceeds $[3.00___]                                 │
│ ☑ Price falls below $[2.00___]                             │
│                                                              │
│ Competitive Position:                                        │
│ ☐ Becomes highest price among vendors                      │
│ ☐ Becomes lowest price among vendors                       │
│ ☐ Deviates >[$0.50] from average vendor price             │
│                                                              │
│ Volatility Alerts:                                           │
│ ☐ Price volatility exceeds [15__]%                         │
│ ☐ Price changes more than [3__] times in [7__] days       │
│                                                              │
│ Time-Based Conditions:                                       │
│ Only trigger during: (•) Any time  ( ) Specific period      │
│                                                              │
│ When "Specific period" selected:                            │
│ Active from: [Jan 1, 2024 📅] to [Dec 31, 2024 📅]        │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Preview Trigger Logic:                    │              │
│ │                                           │              │
│ │ Alert will trigger when Fresh Tomatoes    │              │
│ │ from any vendor:                          │              │
│ │ • Increases by more than 10%, OR          │              │
│ │ • Decreases by more than 10%, OR          │              │
│ │ • Price exceeds $3.00, OR                 │              │
│ │ • Price falls below $2.00                 │              │
│ └───────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**Condition Options**:
- Multiple conditions can be selected (OR logic)
- Percentage inputs with validation
- Dollar amount inputs with validation
- Time period selector
- Live preview of trigger logic

**Validation**:
- At least one condition required
- Percentage values: 0-100
- Dollar values: >= 0
- Date range validation

### Step 4: Notification Settings

**Page Content**:
```
┌─────────────────────────────────────────────────────────────┐
│ How Should We Notify You?                                   │
│                                                              │
│ Notification Channels:                                       │
│                                                              │
│ ☑ Email                                                     │
│   Send to: john.smith@example.com [Edit]                   │
│   Include: ☑ Price details  ☑ Trend chart  ☐ Full history │
│                                                              │
│ ☑ In-App Notification                                       │
│   Show in: ☑ Notification center  ☑ Desktop toast         │
│   Sound: [Default Alert Sound ▼]                           │
│                                                              │
│ ☐ SMS Text Message                                          │
│   Phone: [+1 (___) ___-____]                               │
│   Note: Charges may apply for SMS notifications            │
│                                                              │
│ ☐ Webhook (Advanced)                                        │
│   POST to: [https://_______________]                        │
│   [Configure Headers]                                       │
│                                                              │
│ Notification Frequency:                                      │
│ (•) Immediate (as soon as triggered)                        │
│ ( ) Digest (group multiple alerts)                          │
│     Send digest: [Daily ▼] at [9:00 AM ▼]                 │
│     Maximum frequency: [Once per day ▼]                     │
│                                                              │
│ Smart Notifications:                                         │
│ ☑ Skip notifications during quiet hours                    │
│   Quiet hours: [10:00 PM] to [7:00 AM]                    │
│                                                              │
│ ☑ Suppress duplicate alerts                                │
│   Don't re-alert for same condition within [1__] hour(s)   │
│                                                              │
│ ☐ Require acknowledgment                                   │
│   Alert stays active until manually acknowledged           │
│                                                              │
│ [Send Test Notification]                                    │
└─────────────────────────────────────────────────────────────┘
```

**Notification Features**:
- Multiple channels supported
- Email customization (what to include)
- In-app notification settings
- SMS with opt-in
- Webhook for integrations
- Frequency control (immediate or digest)
- Quiet hours configuration
- Duplicate suppression
- Test notification button

### Step 5: Review & Activate

**Page Content**:
```
┌─────────────────────────────────────────────────────────────┐
│ Review Your Alert Configuration                             │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Alert Summary                             │              │
│ │                                           │              │
│ │ Alert Name:                               │              │
│ │ Fresh Tomatoes Price Monitor              │              │
│ │                                           │              │
│ │ Monitoring:                               │              │
│ │ • Products: Fresh Tomatoes (2 products)   │              │
│ │ • Vendors: All vendors                    │              │
│ │                                           │              │
│ │ Trigger Conditions:                       │              │
│ │ • Price increase >10%                     │              │
│ │ • Price decrease >10%                     │              │
│ │ • Price exceeds $3.00                     │              │
│ │ • Price falls below $2.00                 │              │
│ │                                           │              │
│ │ Notifications:                            │              │
│ │ • Email (immediate)                       │              │
│ │ • In-app notification                     │              │
│ │ • Quiet hours: 10 PM - 7 AM              │              │
│ │                                           │              │
│ │ Active Period:                            │              │
│ │ Jan 1, 2024 - Dec 31, 2024               │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ Estimated Alert Volume:                                      │
│ Based on historical data, this alert may trigger            │
│ approximately 2-3 times per month.                          │
│                                                              │
│ ⚠️ High Volume Warning:                                     │
│ This configuration may trigger frequently (>10x/week).      │
│ Consider adjusting thresholds to reduce noise.              │
│                                                              │
│ Start Alert: (•) Immediately  ( ) On specific date          │
│                                                              │
│ Visibility:   (•) Private  ( ) Share with team              │
│                                                              │
│ [Edit Alert] [Save as Template] [Create & Activate]        │
└─────────────────────────────────────────────────────────────┘
```

**Review Features**:
- Complete alert summary
- Estimated trigger volume (based on historical data)
- High volume warning if applicable
- Start date selection
- Visibility settings (private/shared)
- Edit any step from review
- Save as template option

---

## Tab 2: Team Alerts

### Team Alert List

**List displays shared alerts** created by team members

**Additional Columns**:
- Created By (user name + avatar)
- Shared With (team/department)
- Owner Actions (if you're the owner)

**Filters**:
```
┌─────────────────────────────────────────────────────────────┐
│ Show: (•) All Team Alerts  ( ) Created by Me  ( ) Shared with Me │
│                                                              │
│ Department: [All Departments ▼]                             │
│ Created By: [All Team Members ▼]                            │
└─────────────────────────────────────────────────────────────┘
```

**Team Alert Card**:
```
┌─────────────────────────────────────────────────────────────┐
│ [☑] 🔔 Dairy Category Price Alert           [Active ✓] 👥  │
│                                                              │
│ Product: All Dairy Products (23 products)                   │
│ Trigger: Price increase >15%                                │
│                                                              │
│ Created by: Sarah Johnson (Procurement Manager)             │
│ Shared with: Procurement Team (12 members)                  │
│                                                              │
│ Last Triggered: Yesterday • Total: 8 times                  │
│ Team Response Rate: 92%                                      │
│                                                              │
│ [View] [Subscribe] [Copy to My Alerts] [...]               │
└─────────────────────────────────────────────────────────────┘
```

**Team Alert Actions**:
- View: See full details (read-only)
- Subscribe: Receive notifications for this alert
- Copy to My Alerts: Duplicate for personal use
- Unsubscribe (if subscribed)
- Edit (only if owner)
- Delete (only if owner)

---

## Tab 3: Alert History

### History View

**Time Range Selector**:
```
┌─────────────────────────────────────────────────────────────┐
│ Show alerts from: [Last 30 Days ▼]                          │
│                                                              │
│ Options:                                                     │
│ • Last 7 Days                                               │
│ • Last 30 Days                                              │
│ • Last 90 Days                                              │
│ • This Month                                                │
│ • Last Month                                                │
│ • Custom Date Range                                         │
└─────────────────────────────────────────────────────────────┘
```

### Triggered Alert Timeline

**Timeline View**:
```
┌─────────────────────────────────────────────────────────────┐
│                     Alert Timeline                           │
│                                                              │
│ Today ─────────────────────────────────────────────────    │
│   │                                                          │
│   ├─ 2:30 PM  Fresh Tomatoes Price Alert                   │
│   │   Price increased to $2.85 (+8.5%)                     │
│   │   Acknowledged by You (2:45 PM) ✓                      │
│   │                                                          │
│   ├─ 10:15 AM  Dairy Volatility Alert                      │
│   │   High volatility detected (18% std dev)               │
│   │   Not yet acknowledged                                 │
│   │                                                          │
│ Yesterday ─────────────────────────────────────────────    │
│   │                                                          │
│   ├─ 4:20 PM  Lettuce Price Drop                           │
│   │   Price decreased to $1.65 (-12%)                      │
│   │   Acknowledged by Sarah J. (4:35 PM) ✓                │
│   │                                                          │
│ Jan 18 ────────────────────────────────────────────────    │
│   │                                                          │
│   ├─ 11:30 AM  Tomato Price Spike                          │
│   │   Price exceeded $3.00 threshold                       │
│   │   Acknowledged by You (Same day) ✓                     │
└─────────────────────────────────────────────────────────────┘
```

**Timeline Features**:
- Chronological listing
- Grouped by day
- Show time of trigger
- Alert name and trigger reason
- Acknowledgment status and by whom
- Click to see full details

### Triggered Alert Detail Card

**Expanded View**:
```
┌─────────────────────────────────────────────────────────────┐
│ Fresh Tomatoes Price Alert - Triggered                      │
│                                                              │
│ Triggered: Today at 2:30 PM                                 │
│ Alert: Fresh Tomatoes Price Monitor                         │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Trigger Details                           │              │
│ │                                           │              │
│ │ Product: Fresh Tomatoes (PROD-001)        │              │
│ │ Vendor: ABC Foods Inc.                    │              │
│ │                                           │              │
│ │ Price Change:                             │              │
│ │ $2.75 → $2.85                            │              │
│ │ +$0.10 (+8.5%) ↑                         │              │
│ │                                           │              │
│ │ Condition Met: Price increase >10%       │              │
│ │ (configured threshold: 10%)               │              │
│ │                                           │              │
│ │ Price List: PL-2401-0025                   │              │
│ │ Effective: Jan 20, 2024                   │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Actions Taken                             │              │
│ │                                           │              │
│ │ Notified:                                 │              │
│ │ ✓ Email sent (2:30 PM)                   │              │
│ │ ✓ In-app notification (2:30 PM)          │              │
│ │                                           │              │
│ │ Acknowledged:                             │              │
│ │ ✓ By You at 2:45 PM                      │              │
│ │ Response time: 15 minutes                 │              │
│ │                                           │              │
│ │ Notes: "Reviewed. Price increase is      │              │
│ │ seasonal and acceptable. No action       │              │
│ │ needed at this time."                     │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ [View Price History] [Compare Vendors] [Acknowledge]       │
│ [Add Note] [Escalate] [Dismiss]                            │
└─────────────────────────────────────────────────────────────┘
```

### Alert History Statistics

**Summary Panel**:
```
┌─────────────────────────────────────────────────────────────┐
│ Alert History Statistics (Last 30 Days)                     │
│                                                              │
│ ┌──────────┬──────────┬──────────┬──────────┐              │
│ │ Total    │ Avg/Day  │ Response │ False    │              │
│ │ Triggers │          │ Time     │ Positives│              │
│ ├──────────┼──────────┼──────────┼──────────┤              │
│ │ 45       │ 1.5      │ 2.3 hrs  │ 8 (18%)  │              │
│ └──────────┴──────────┴──────────┴──────────┘              │
│                                                              │
│ Top Triggered Alerts:                                        │
│ 1. Fresh Tomatoes Price Monitor (12 triggers)               │
│ 2. Dairy Volatility Alert (8 triggers)                      │
│ 3. Meat Price Threshold (7 triggers)                        │
│                                                              │
│ [Export History] [Download Report]                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab 4: Templates

### Template Categories

**Category Cards**:
```
┌─────────────────────────────────────────────────────────────┐
│ Alert Templates                                              │
│                                                              │
│ Browse by Category:                                          │
│                                                              │
│ ┌────────────────────┬────────────────────┐                │
│ │ 📈 Price Spike     │ 🎯 Threshold       │                │
│ │ 3 templates        │ 4 templates        │                │
│ │                    │                    │                │
│ │ Quick detection of │ Set price limits   │                │
│ │ rapid increases    │ and boundaries     │                │
│ │                    │                    │                │
│ │ [Browse →]         │ [Browse →]         │                │
│ └────────────────────┴────────────────────┘                │
│                                                              │
│ ┌────────────────────┬────────────────────┐                │
│ │ ⚡ Volatility      │ 🔄 Comparative     │                │
│ │ 2 templates        │ 3 templates        │                │
│ │                    │                    │                │
│ │ Monitor price      │ Track relative     │                │
│ │ stability          │ vendor positions   │                │
│ │                    │                    │                │
│ │ [Browse →]         │ [Browse →]         │                │
│ └────────────────────┴────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Template List

**Template Card**:
```
┌─────────────────────────────────────────────────────────────┐
│ ⭐ Price Increase >10% Alert                    [Popular]    │
│                                                              │
│ Category: Price Spike                                        │
│ Used 45 times in last 30 days                               │
│                                                              │
│ Description:                                                 │
│ Get notified when any product price increases by more       │
│ than 10% compared to the previous price. Ideal for          │
│ catching sudden market changes and seasonal spikes.         │
│                                                              │
│ Default Configuration:                                       │
│ • Trigger: Price increase >10%                              │
│ • Notification: Email (immediate)                           │
│ • Monitoring: All products, all vendors                     │
│                                                              │
│ Estimated Trigger Frequency: 2-4 times/month                │
│                                                              │
│ [Use This Template] [Preview] [Customize]                  │
└─────────────────────────────────────────────────────────────┘
```

**Template Categories**:

**1. Price Spike Templates**:
- Price Increase >10% Alert
- Price Increase >20% Alert (Major Spike)
- Rapid Price Change Alert (multiple changes in short time)

**2. Threshold Templates**:
- Price Exceeds Threshold Alert
- Price Below Minimum Alert
- Price Range Alert (outside acceptable range)
- Budget Threshold Alert

**3. Volatility Templates**:
- High Volatility Alert (std dev >15%)
- Unstable Pricing Alert (frequent changes)

**4. Comparative Templates**:
- Highest Price Among Vendors
- Lowest Price Among Vendors
- Price Deviation from Average (>X from mean)

### Custom Template Creation

**Button**: "Create Custom Template"

**Template Creation Dialog**:
```
┌─────────────────────────────────────────────────────────────┐
│ Create Alert Template                                   [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Template Name: *                                             │
│ [High Value Product Monitor______________]                  │
│                                                              │
│ Category: *                                                  │
│ [Price Spike ▼]                                             │
│                                                              │
│ Description:                                                 │
│ [Monitor high-value products for any price increase    ]    │
│ [over 10% to ensure budget compliance____________      ]    │
│                                                              │
│ Default Configuration:                                       │
│ (Uses the alert wizard to configure)                        │
│                                                              │
│ Share Template:                                              │
│ (•) Private (only visible to you)                           │
│ ( ) Share with team                                         │
│ ( ) Share with organization                                 │
│                                                              │
│ [Cancel] [Create Template]                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab 5: Analytics

### Analytics Dashboard

**Dashboard Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│ Alert Performance Analytics                                  │
│                                                              │
│ Time Period: [Last 30 Days ▼]    [Export Report]           │
│                                                              │
│ ┌─────────────────────┬─────────────────────┐              │
│ │ Trigger Trends      │ Response Metrics    │              │
│ └─────────────────────┴─────────────────────┘              │
│                                                              │
│ ┌─────────────────────┬─────────────────────┐              │
│ │ Top Alerts          │ Alert Effectiveness │              │
│ └─────────────────────┴─────────────────────┘              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Alert ROI Analysis                        │              │
│ └───────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Panel 1: Trigger Trends

**Line Chart**:
```
┌─────────────────────────────────────────────────────────────┐
│ Alert Triggers Over Time                                     │
│                                                              │
│ Triggers                                                     │
│    8 ┐                                                      │
│      │     ╱╲                                               │
│    6 ┤    ╱  ╲    ╱╲                                        │
│      │   ╱    ╲  ╱  ╲                                       │
│    4 ┤  ╱      ╲╱    ╲   ╱╲                                │
│      │ ╱              ╲ ╱  ╲                                │
│    2 ┤╱                ╲╱    ╲                              │
│      │                        ╲                             │
│    0 ┴────────────────────────────────                     │
│      Week1 Week2 Week3 Week4                                │
│                                                              │
│ Total Triggers: 45 • Avg per day: 1.5 • Peak: 8 (Week 2)  │
└─────────────────────────────────────────────────────────────┘
```

**Breakdown by Type**:
```
┌─────────────────────────────────────────────────────────────┐
│ Trigger Type Distribution                                    │
│                                                              │
│ Price Increase      ████████████████ 60% (27)               │
│ Price Decrease      ████████ 27% (12)                       │
│ Threshold Exceeded  ████ 9% (4)                             │
│ Volatility          ██ 4% (2)                               │
└─────────────────────────────────────────────────────────────┘
```

### Panel 2: Response Metrics

**Response Time Chart**:
```
┌─────────────────────────────────────────────────────────────┐
│ Average Response Time by Alert                               │
│                                                              │
│ Alert Name                          Avg Response Time        │
│ ──────────────────────────────────────────────────────────  │
│ Fresh Tomatoes Monitor              ████ 1.5 hrs            │
│ Dairy Volatility Alert              ██████ 2.3 hrs          │
│ Meat Price Threshold                ████████ 3.1 hrs        │
│ Produce Price Spike                 ███ 1.2 hrs             │
│                                                              │
│ Overall Average: 2.3 hours                                   │
│ Target: <4 hours ✓                                          │
└─────────────────────────────────────────────────────────────┘
```

**Acknowledgment Rate**:
```
┌─────────────────────────────────────────────────────────────┐
│ Alert Acknowledgment Rate                                    │
│                                                              │
│ ┌─────────────────────────────────────┐                    │
│ │        ╱╲                            │                    │
│ │       ╱  ╲    ╱╲                    │                    │
│ │      ╱    ╲  ╱  ╲                   │                    │
│ │     ╱      ╲╱    ╲                  │                    │
│ │    ╱              ╲                 │                    │
│ │   ╱                ╲╱╲              │                    │
│ │  ╱                    ╲             │                    │
│ └─────────────────────────────────────┘                    │
│                                                              │
│ Acknowledged: 38 (84%)                                       │
│ Unacknowledged: 7 (16%)                                      │
│ Dismissed as False Positive: 8 (18%)                        │
└─────────────────────────────────────────────────────────────┘
```

### Panel 3: Top Alerts

**Ranking Table**:
```
┌─────────────────────────────────────────────────────────────┐
│ Most Triggered Alerts (Last 30 Days)                        │
│                                                              │
│ Rank  Alert Name              Triggers  Response  False+    │
│ ────────────────────────────────────────────────────────── │
│ 1     Fresh Tomatoes Monitor   12       95%       2 (17%)   │
│ 2     Dairy Volatility Alert   8        88%       1 (13%)   │
│ 3     Meat Price Threshold     7        100%      0 (0%)    │
│ 4     Produce Price Spike      6        83%       2 (33%)   │
│ 5     Bakery Price Monitor     5        80%       1 (20%)   │
│                                                              │
│ [View Full Rankings]                                        │
└─────────────────────────────────────────────────────────────┘
```

### Panel 4: Alert Effectiveness

**Effectiveness Scores**:
```
┌─────────────────────────────────────────────────────────────┐
│ Alert Effectiveness Analysis                                 │
│                                                              │
│ Metric                          Score    Benchmark           │
│ ──────────────────────────────────────────────────────────  │
│ Relevance Rate                  82%      ████████ >75%  ✓   │
│ (Not false positives)                                        │
│                                                              │
│ Response Rate                   84%      ████████ >80%  ✓   │
│ (Acknowledged alerts)                                        │
│                                                              │
│ Action Taken Rate               67%      ██████   >60%  ✓   │
│ (Led to procurement action)                                  │
│                                                              │
│ Cost Savings Impact             $2,450   ████████ High      │
│ (Estimated savings from alerts)                              │
│                                                              │
│ Overall Effectiveness: Excellent (85/100)                    │
└─────────────────────────────────────────────────────────────┘
```

**Recommendations**:
```
┌─────────────────────────────────────────────────────────────┐
│ 💡 Optimization Recommendations                              │
│                                                              │
│ 1. High False Positive Rate (33%)                           │
│    Alert: "Produce Price Spike"                             │
│    → Suggestion: Increase threshold from 10% to 15%         │
│                                                              │
│ 2. Delayed Response (Avg 3.1 hrs)                           │
│    Alert: "Meat Price Threshold"                            │
│    → Suggestion: Add SMS notifications for faster response  │
│                                                              │
│ 3. Underutilized Alert                                       │
│    Only 2 triggers in 30 days                                │
│    → Suggestion: Review threshold or consider disabling     │
│                                                              │
│ [Apply Recommendations] [Dismiss]                           │
└─────────────────────────────────────────────────────────────┘
```

### Panel 5: Alert ROI Analysis

**ROI Calculation**:
```
┌─────────────────────────────────────────────────────────────┐
│ Return on Investment (ROI) Analysis                          │
│                                                              │
│ Time Saved:                                                  │
│ 45 alerts × 30 min avg investigation time = 22.5 hours     │
│ Value: $675 (at $30/hour)                                   │
│                                                              │
│ Cost Savings from Actions:                                   │
│ • Switched to lower-price vendor: 8 times → $1,200         │
│ • Negotiated better price: 5 times → $800                  │
│ • Delayed purchase (price drop): 3 times → $450            │
│ Total Savings: $2,450                                        │
│                                                              │
│ Alert Management Time:                                       │
│ Setup time: 2 hours (one-time)                              │
│ Monthly maintenance: 1 hour                                  │
│ Cost: $90                                                    │
│                                                              │
│ Net Benefit: $3,035                                          │
│ ROI: 3,372%                                                  │
│                                                              │
│ Payback Period: <1 week                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Test Alert Feature

**Test Button**: Available in wizard Step 4 and alert edit dialog

### Test Alert Dialog
```
┌─────────────────────────────────────────────────────────────┐
│ Test Alert Notification                                 [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Send a test notification to verify your alert settings      │
│ work correctly.                                              │
│                                                              │
│ Test Notification Will Be Sent To:                          │
│ ☑ Email: john.smith@example.com                            │
│ ☑ In-App Notification                                       │
│ ☐ SMS: +1 (555) 123-4567                                   │
│                                                              │
│ Test Message:                                                │
│ ┌───────────────────────────────────────────┐              │
│ │ 🔔 Price Alert Test                       │              │
│ │                                           │              │
│ │ This is a test notification for your      │              │
│ │ alert "Fresh Tomatoes Price Monitor".     │              │
│ │                                           │              │
│ │ Alert Configuration:                      │              │
│ │ • Product: Fresh Tomatoes                 │              │
│ │ • Trigger: Price increase >10%            │              │
│ │ • Notification: Email, In-app             │              │
│ │                                           │              │
│ │ If you receive this notification, your    │              │
│ │ alert is configured correctly.            │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ [Cancel] [Send Test Notification]                          │
└─────────────────────────────────────────────────────────────┘
```

**After Sending**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ✓                                        │
│                                                              │
│        Test Notification Sent Successfully!                  │
│                                                              │
│   Test notifications have been sent to:                      │
│   • Email: john.smith@example.com                           │
│   • In-app notification center                              │
│                                                              │
│   Please check your notifications to confirm receipt.       │
│                                                              │
│   [Close]                                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Alert Settings

**Settings Page**: Global preferences for all alerts

### Settings Dialog
```
┌─────────────────────────────────────────────────────────────┐
│ Alert Settings                                          [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Default Notification Preferences                     │    │
│ │                                                      │    │
│ │ Email:                                               │    │
│ │ Primary: john.smith@example.com [Edit]              │    │
│ │ CC: sarah.johnson@example.com (optional) [Edit]     │    │
│ │                                                      │    │
│ │ Quiet Hours:                                         │    │
│ │ ☑ Enable quiet hours                               │    │
│ │ From: [10:00 PM] To: [7:00 AM]                     │    │
│ │ Time zone: [EST (UTC-5) ▼]                         │    │
│ │                                                      │    │
│ │ Weekend Notifications:                               │    │
│ │ (•) Allow all notifications                         │    │
│ │ ( ) Critical only                                   │    │
│ │ ( ) Suppress all weekend notifications              │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Alert Behavior                                       │    │
│ │                                                      │    │
│ │ Duplicate Suppression:                               │    │
│ │ ☑ Suppress duplicate alerts                        │    │
│ │ Wait [1__] hour(s) before re-alerting              │    │
│ │                                                      │    │
│ │ Auto-Disable Inactive Alerts:                        │    │
│ │ ☑ Auto-disable alerts not triggered in [90__] days │    │
│ │                                                      │    │
│ │ Alert Retention:                                     │    │
│ │ Keep alert history for [365__] days                │    │
│ │                                                      │    │
│ │ Default Alert Status:                                │    │
│ │ New alerts start as: (•) Active  ( ) Inactive       │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Advanced Settings                                    │    │
│ │                                                      │    │
│ │ Data Export:                                         │    │
│ │ [Export All Alerts] [Export History]                │    │
│ │                                                      │    │
│ │ Alert Cleanup:                                       │    │
│ │ [Delete Inactive Alerts] [Clear Old History]        │    │
│ │                                                      │    │
│ │ Reset Settings:                                      │    │
│ │ [Reset to Defaults]                                 │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ [Cancel] [Save Settings]                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Empty States

### No Alerts Created
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     🔔                                       │
│                                                              │
│                No Price Alerts Yet                           │
│                                                              │
│   Get notified when prices change significantly.            │
│   Set up your first alert in just a few clicks.            │
│                                                              │
│   Benefits of Price Alerts:                                  │
│   • Never miss important price changes                      │
│   • Respond faster to market fluctuations                   │
│   • Save time on manual price monitoring                    │
│   • Optimize purchasing decisions                           │
│                                                              │
│   [Create Your First Alert] [Browse Templates]              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### No Triggered Alerts
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ✓                                        │
│                                                              │
│                All Quiet - No Alerts                         │
│                                                              │
│   No price alerts have been triggered recently.             │
│   This means prices have been stable.                       │
│                                                              │
│   Your alerts are actively monitoring:                       │
│   • 125 products across 3 vendors                           │
│   • 23 active alerts                                        │
│                                                              │
│   [View All Alerts] [Check Alert Status]                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### No Templates
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     📋                                       │
│                                                              │
│                No Alert Templates                            │
│                                                              │
│   Create reusable alert templates for common scenarios.     │
│                                                              │
│   [Create First Template]                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Loading States

### Alert List Loading
```
┌─────────────────────────────────────────────────────────────┐
│ [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  [░░░░░]     │
│                                                              │
│ [░░░░░░░░░] [░░░░░░░░░░░░░░░░░]                            │
│ [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]                    │
│                                                              │
│ [░░░░░░] [░░░░░] [░░░░░] [░░░░░]                           │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  [░░░░░]     │
│                                                              │
│ Loading alerts...                                            │
└─────────────────────────────────────────────────────────────┘
```

### Creating Alert
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ⏳                                       │
│                                                              │
│              Creating Your Alert...                          │
│                                                              │
│   [▓▓▓▓▓▓▓▓▓▓░░░░░░] 60%                                   │
│                                                              │
│   Configuring trigger conditions...                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Error States

### Alert Creation Failed
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ⚠️                                       │
│                                                              │
│            Failed to Create Alert                            │
│                                                              │
│   There was a problem creating your alert. Please try       │
│   again or contact support if the issue persists.           │
│                                                              │
│   Error: Invalid threshold configuration                     │
│   Code: ALERT_VALIDATION_ERROR                               │
│                                                              │
│   [Try Again] [Edit Settings] [Contact Support]            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Notification Delivery Failed
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Notification Delivery Issue                              │
│                                                              │
│ Failed to send notification for "Fresh Tomatoes Monitor"    │
│                                                              │
│ Details:                                                     │
│ • Email delivery failed (invalid address)                   │
│ • In-app notification: Delivered ✓                          │
│                                                              │
│ Please update your notification settings.                    │
│                                                              │
│ [Update Settings] [Retry] [Dismiss]                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Design

### Desktop View (≥1024px)
- Full layout with all features
- Side-by-side summary cards (4 columns)
- Wide alert list with all columns
- Full wizard in modal
- All action buttons visible

### Tablet View (768px-1023px)
- 2-column summary cards
- Full-width alert list
- Horizontal scroll for wide content
- Modal wizard (full screen)
- Collapsible filter panel

### Mobile View (<768px)
- 1-column summary cards (stacked)
- Card-based alert list
- Bottom sheet for filters
- Full-screen wizard
- Simplified action buttons (hamburger menu)

**Mobile Alert Card**:
```
┌─────────────────────────────────────┐
│ 🔔 Fresh Tomatoes Alert  [Active ✓] │
│                                     │
│ Product: Fresh Tomatoes             │
│ Vendors: 3 vendors                  │
│                                     │
│ Trigger: Price >10% increase        │
│                                     │
│ Last: 2 days ago                    │
│ Total: 12 triggers                  │
│                                     │
│ [Edit] [Disable] [More...]         │
└─────────────────────────────────────┘
```

---

## Accessibility (WCAG 2.1 AA Compliance)

### Keyboard Navigation
- **Tab**: Navigate between elements
- **Shift+Tab**: Navigate backwards
- **Enter/Space**: Activate buttons, toggle checkboxes
- **Arrow Keys**: Navigate lists, select options
- **Escape**: Close dialogs and dropdowns
- **N**: Create new alert
- **T**: Browse templates
- **E**: Edit selected alert
- **Delete**: Delete selected alert (with confirmation)

### Screen Reader Support
- **ARIA Labels**: All interactive elements properly labeled
- **ARIA Live Regions**: Alert status changes announced
- **Landmark Regions**: Proper semantic structure
- **Form Labels**: All form fields properly labeled
- **Status Announcements**: Alert created, triggered, disabled

**Example ARIA**:
```html
<button aria-label="Create new price alert" aria-describedby="create-tooltip">
  <Plus aria-hidden="true" />
  Create Alert
</button>

<div role="alert" aria-live="polite" aria-atomic="true">
  Alert "Fresh Tomatoes Monitor" has been triggered. Price increased to $2.85.
</div>

<table role="table" aria-label="Price alert list">
  <caption>Active and inactive price alerts</caption>
  <thead>
    <tr>
      <th scope="col">Alert Name</th>
      <th scope="col">Status</th>
      <th scope="col">Last Triggered</th>
    </tr>
  </thead>
</table>

<div role="tablist" aria-label="Alert management tabs">
  <button role="tab" aria-selected="true" aria-controls="my-alerts-panel">
    My Alerts
  </button>
  <button role="tab" aria-selected="false" aria-controls="team-alerts-panel">
    Team Alerts
  </button>
</div>
```

### Visual Accessibility
- **Color Contrast**: All text meets 4.5:1 ratio
- **Focus Indicators**: Visible 3px outline
- **Icon + Text**: Never rely on color alone
- **Text Size**: Minimum 14px, scalable
- **Target Size**: 44x44px minimum

---

## Performance Optimization

### Loading Strategy
- **Lazy Loading**: Load alert details on demand
- **Pagination**: Default 10 alerts per page
- **Virtual Scrolling**: For large alert lists (>100)
- **Caching**: Cache frequently accessed data
- **Debouncing**: Search and filter inputs debounced (300ms)

### Notification Performance
- **Queue Management**: Batch notifications to prevent flooding
- **Rate Limiting**: Max 10 notifications per hour per user
- **Deduplication**: Suppress identical alerts within timeframe
- **Background Processing**: Trigger evaluation runs asynchronously

### API Optimization
- **GraphQL**: Request only needed fields
- **Compression**: Gzip response data
- **Connection Pooling**: Reuse database connections
- **Indexing**: Indexed queries for alert conditions

**Performance Targets**:
- Page load: <2 seconds
- Alert creation: <1 second
- Notification delivery: <5 seconds
- History load: <1 second
- Analytics render: <2 seconds

---

## Security Considerations

### Data Access Control
- **Role-Based Access**: Filter alerts by user permissions
- **Ownership**: Users can only edit/delete their own alerts
- **Team Visibility**: Team alerts visible based on department
- **Audit Logging**: Log all alert CRUD operations

### Notification Security
- **Email Validation**: Verify email addresses before sending
- **SMS Verification**: Require phone verification for SMS
- **Webhook Security**: HTTPS only, signature verification
- **Rate Limiting**: Prevent notification abuse

### Input Validation
- **Threshold Validation**: Numeric ranges validated
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Escape all user inputs
- **Email Injection**: Sanitize email addresses

### Alert Management Security
- **Permission Checks**: Verify user can create/edit/delete
- **Ownership Validation**: Ensure user owns alert before modifications
- **Bulk Operation Limits**: Max 50 alerts per bulk action
- **Deletion Confirmation**: Require confirmation for destructive actions

---

## Analytics Tracking

### Page Events
```javascript
// Page view
analytics.track('Alert Management Viewed', {
  user_role: 'procurement_staff',
  active_alerts_count: 23,
  tab: 'my-alerts'
});

// Alert created
analytics.track('Alert Created', {
  alert_type: 'price_increase',
  template_used: 'price_spike_10',
  monitoring_scope: 'specific_products',
  product_count: 2,
  vendor_count: 3,
  notification_channels: ['email', 'in_app']
});

// Alert triggered
analytics.track('Alert Triggered', {
  alert_id: 'alert-001',
  alert_name: 'Fresh Tomatoes Monitor',
  trigger_condition: 'price_increase_threshold',
  product_id: 'PROD-001',
  vendor_id: 'VEN-001',
  change_amount: 0.10,
  change_percentage: 8.5
});

// Alert acknowledged
analytics.track('Alert Acknowledged', {
  alert_id: 'alert-001',
  trigger_id: 'trigger-123',
  response_time_minutes: 15,
  action_taken: 'reviewed',
  notes_added: true
});

// Template used
analytics.track('Alert Template Used', {
  template_id: 'price-spike-10',
  template_name: 'Price Increase >10%',
  customizations_made: true
});
```

### Performance Metrics
- Alert creation time
- Notification delivery time
- Average response time
- False positive rate
- Alert effectiveness score

---

## API Integration

### Endpoints

**GET /api/alerts**
```javascript
// Fetch user's alerts
const response = await fetch('/api/alerts?status=active&limit=10');

// Response:
{
  "data": [
    {
      "id": "alert-001",
      "name": "Fresh Tomatoes Price Monitor",
      "status": "active",
      "product_ids": ['PROD-001'],
      "vendor_ids": ['VEN-001', 'VEN-002'],
      "conditions": {
        "price_increase_threshold": 10,
        "price_threshold_max": 3.00
      },
      "notifications": {
        "email": true,
        "in_app": true,
        "frequency": "immediate"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "last_triggered": "2024-01-18T14:30:00Z",
      "trigger_count": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 23
  }
}
```

**POST /api/alerts**
```javascript
// Create new alert
const response = await fetch('/api/alerts', {
  method: 'POST',
  body: JSON.stringify({
    name: "Fresh Tomatoes Price Monitor",
    product_ids: ['PROD-001'],
    vendor_ids: ['VEN-001', 'VEN-002'],
    conditions: {
      price_increase_threshold: 10,
      price_decrease_threshold: 10,
      price_threshold_max: 3.00,
      price_threshold_min: 2.00
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

**GET /api/alerts/history**
```javascript
// Fetch alert trigger history
const response = await fetch('/api/alerts/history?days=30');

// Response:
{
  "data": [
    {
      "id": "trigger-001",
      "alert_id": "alert-001",
      "triggered_at": "2024-01-18T14:30:00Z",
      "product_id": "PROD-001",
      "vendor_id": "VEN-001",
      "trigger_condition": "price_increase_threshold",
      "previous_price": 2.75,
      "new_price": 2.85,
      "change_percentage": 8.5,
      "acknowledged": true,
      "acknowledged_at": "2024-01-18T14:45:00Z",
      "acknowledged_by": "user-123"
    }
  ]
}
```

**POST /api/alerts/{id}/test**
```javascript
// Send test notification
const response = await fetch('/api/alerts/alert-001/test', {
  method: 'POST',
  body: JSON.stringify({
    channels: ['email', 'in_app']
  })
});

// Response:
{
  "sent": true,
  "channels": {
    "email": "delivered",
    "in_app": "delivered"
  }
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
- **Modern Browsers**: Full features with real-time updates
- **Older Browsers**: Basic alert list, simplified notifications
- **No JavaScript**: Server-rendered alert list

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 20, 2024 | System | Initial creation - Complete alert management specification |

---

## Related Documentation

**Must Read**:
- BR-price-lists.md: Business requirements and alert rules
- TS-price-lists.md: Technical specifications for alert system
- UC-price-lists.md: Alert use cases and workflows

**Related Pages**:
- PC-pricelist-list.md: Price list management
- PC-pricelist-history.md: Historical price tracking
- PC-pricelist-comparison.md: Price comparison tool

**Reference**:
- Design System Guide: UI components and patterns
- Analytics Guide: Event tracking standards
- Accessibility Guide: WCAG compliance checklist
- Performance Guide: Optimization best practices

---

**END OF DOCUMENT**
