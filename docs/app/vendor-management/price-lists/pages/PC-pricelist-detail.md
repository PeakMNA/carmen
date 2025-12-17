# PC-pricelist-detail.md - Price List Detail Page

## Document Information
- **Page Name**: Price List Detail
- **Route**: `/vendor-management/price-lists/[id]`
- **Parent Module**: Vendor Management > Price Lists
- **Related Documents**:
  - UC-price-lists.md (Use Cases)
  - BR-price-lists.md (Business Requirements)
  - TS-price-lists.md (Technical Specification)
  - PC-pricelist-list.md (List Page)
  - PC-pricelist-create.md (Create Wizard)
  - PC-pricelist-comparison.md (Comparison Tool)
  - PC-pricelist-history.md (Price History)

---

## Page Overview

### Purpose
Displays comprehensive details of a single price list including vendor information, product pricing, terms & conditions, approval workflow, price history, comparative analysis, documents, and activity logs. Allows users to view, edit, approve, compare, export, and manage price lists throughout their lifecycle.

### User Roles
- **View Access**: All authenticated users (read-only based on permissions)
- **Edit Access**: Purchasing Staff, Procurement Manager
- **Approve Access**: Department Manager, Procurement Manager, Finance Manager
- **Export Access**: All authenticated users
- **Delete Access**: Procurement Manager, System Administrator

### Key Features
- Price list information display with status indicators
- Tabbed interface for organized content (7 tabs)
- Inline editing capabilities for authorized users
- Approval workflow with comments and rejection reasons
- Price comparison against historical data and other vendors
- Cost analysis and pricing trends visualization
- Document management (attachments, vendor quotes)
- Discussion/comments system for collaboration
- Comprehensive audit trail and activity log
- Export to Excel, PDF for reporting

---

## Page Layout

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Breadcrumb + Price List Name + Action Buttons       │
├─────────────────────────────────────────────────────────────┤
│ Price List Summary Card                                      │
│ ┌─────────────────┬──────────────┬──────────────┐          │
│ │ Basic Info      │ Status       │ Metrics      │          │
│ └─────────────────┴──────────────┴──────────────┘          │
├─────────────────────────────────────────────────────────────┤
│ Tab Navigation                                               │
│ [Overview] [Products] [Analysis] [History] [Documents]      │
│ [Comments] [Settings]                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    Active Tab Content                        │
│                                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop (≥1024px)**: Full layout with 3-column summary cards, wide tabs
- **Tablet (768px-1023px)**: 2-column summary cards, full-width tabs
- **Mobile (<768px)**: Single-column layout, collapsible sections, horizontal tab scrolling

---

## Page Header

### Breadcrumb
**Text**: Home / Vendor Management / Price Lists / [Price List Name]

**Style**:
- Text-sm, text-gray-500
- Links: text-blue-600 hover:text-blue-800 hover:underline
- Current page (price list name): text-gray-900 font-medium
- Separator: text-gray-400 "/"

**Interaction**:
- Each breadcrumb item clickable except current page
- Truncate price list name to max 50 characters on mobile
- Show full name in tooltip on hover

**Accessibility**:
- aria-label="Breadcrumb navigation"
- aria-current="page" on current item

---

### Page Title Section

#### Price List Name
**Text**: [Price List Name] (e.g., "Fresh Produce - January 2024 - ABC Foods")

**Style**:
- H1, text-2xl lg:text-3xl, font-bold, text-gray-900
- Max-width 700px, truncate with ellipsis
- Show full name in tooltip on hover

**Icons**:
- Price list icon (FileText) - size-6, text-green-600, mr-3
- Status badge - inline with title
- Priority indicator (if High/Urgent) - Flag icon

**Accessibility**:
- H1 heading landmark
- title attribute with full price list name

#### Price List Reference
**Text**: [Reference ID] (e.g., "PL-2401-0001")

**Style**:
- Text-sm, text-gray-500, font-mono, ml-3
- Displayed inline with price list name

**Interaction**:
- Click to copy reference ID
- Show "Copied!" tooltip on click (2 seconds)

#### Status Badge (Inline with Title)
**Variants**:
| Status | Badge Color | Icon | Text |
|--------|-------------|------|------|
| Draft | Gray | FileEdit | Draft |
| Pending Approval | Yellow | Clock | Pending Approval |
| Approved | Green | CheckCircle | Approved |
| Active | Blue | Zap | Active |
| Expired | Orange | AlertTriangle | Expired |
| Rejected | Red | XCircle | Rejected |
| Archived | Gray | Archive | Archived |

**Style**:
- Rounded-full, px-3 py-1.5, text-xs font-medium
- Inline with price list name, ml-3
- Icon: size-3, mr-1

**Tooltip**: Shows detailed status information on hover
- Example: "Active: Prices valid from Jan 1 - Apr 1, 2024"

---

### Action Buttons (Header)

**Layout**: Flex row, gap-2, justify-end, items-center

| Button Label | Purpose | Style | Visibility Rules | Icon | Tooltip | Keyboard |
|--------------|---------|-------|------------------|------|---------|----------|
| Edit | Edit price list details | Secondary (outline) | Status: Draft, Pending; Permission: Edit | Edit2 | Edit price list | E |
| Approve | Approve price list | Success (green) | Status: Pending; Permission: Approve | CheckCircle | Approve price list | A |
| Reject | Reject price list | Destructive (red outline) | Status: Pending; Permission: Approve | XCircle | Reject price list | R |
| Compare | Compare with other lists | Secondary (outline) | Always visible | GitCompare | Compare prices | C |
| Export | Export to Excel/PDF | Secondary (outline) | Always visible | Download | Export price list | X |
| Clone | Create copy | Secondary (outline) | Always visible; Permission: Create | Copy | Clone price list | - |
| Extend Dates | Extend validity period | Secondary (outline) | Status: Active, Expiring | Calendar | Extend validity | - |
| Archive | Archive price list | Secondary (outline) | Status: Active; Permission: Archive | Archive | Archive price list | - |
| Delete | Delete price list | Destructive (red outline) | Status: Draft, Rejected; Permission: Delete | Trash2 | Delete price list | - |
| More Actions | Dropdown menu | Secondary (outline) | Always visible | MoreVertical | More actions | M |

#### More Actions Dropdown
**Options**:
- View Full Audit Log
- Send to Vendor (email notification)
- Request Update (ask vendor for revised prices)
- Mark as Favorite
- Set Alert (price change notifications)
- Generate PDF Report
- Print Price List
- Download Excel Template
- Email to Team
- Copy Price List URL

**Style**:
- Dropdown menu, min-width 220px, max-height 400px, overflow-y-auto
- Each item: px-4 py-2.5, hover:bg-gray-50, cursor-pointer
- Icons: size-4, mr-3, text-gray-500
- Dividers between logical groups

**Accessibility**:
- aria-label="More actions menu"
- aria-expanded state
- Keyboard navigation (↑↓ keys, Enter to select, Esc to close)
- Focus trap when open

---

## Price List Summary Card

### Card Layout
**Container**:
- bg-white, rounded-lg, shadow-sm, border border-gray-200, p-6, mb-6
- Grid layout: 3 columns on desktop (1fr 1fr 1fr), 2 columns on tablet, 1 column on mobile
- gap-6

### Section 1: Basic Information

**Layout**: Left column, flex flex-col gap-4

#### Vendor Information
| Field Label | Value | Icon | Interaction |
|-------------|-------|------|-------------|
| Vendor | Vendor name (VEN-XXX) | Building | Click to view vendor profile |
| Vendor Contact | Name, Email, Phone | User | Click to send email |
| Vendor Status | Active/Inactive badge | Users | - |
| Vendor Category | Preferred/Approved/New | Tag | - |

**Style**:
- Field labels: text-sm font-medium text-gray-500
- Values: text-base text-gray-900
- Vendor name: text-blue-600 hover:text-blue-800 underline (clickable)
- Status badges: rounded-full, px-2 py-1, text-xs

#### Price List Details
| Field Label | Value Format | Style | Example |
|-------------|-------------|-------|---------|
| Price List Name | Text | font-semibold text-gray-900 | Fresh Produce - Jan 2024 |
| Reference ID | Monospace | font-mono text-sm text-gray-600 | PL-2401-0001 |
| Currency | Code + Symbol | text-sm text-gray-700 | USD ($) |
| Description | Text (truncated) | text-gray-600 text-sm | Monthly produce pricing |
| Source Type | Badge | bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs | Template Submission |
| Created By | User link | text-blue-600 hover:underline | John Smith |
| Created Date | Date + Time | text-gray-600 text-sm | Jan 15, 2024 10:30 AM |
| Last Modified | Relative time | text-gray-600 text-sm | 2 hours ago |
| Modified By | User link | text-blue-600 hover:underline | Jane Doe |

**Interactions**:
- User names: Clickable links to user profiles
- Hover over relative time: Shows full timestamp tooltip
- Description: Shows full text in tooltip if truncated
- Source type: Shows additional details in tooltip (e.g., template name, RFQ number)

### Section 2: Status & Dates

**Layout**: Middle column, flex flex-col gap-4

#### Status Information
| Field Label | Value | Style | Icon |
|-------------|-------|-------|------|
| Current Status | Status badge | Large status badge with icon | Status icon |
| Approval Status | Badge | bg-green-100/yellow-100 text-green-800/yellow-800 | CheckCircle/Clock |
| Effective From | Date | text-gray-900 font-medium | Calendar |
| Effective To | Date | text-gray-900 font-medium | Calendar |
| Days Remaining | Number | text-orange-600 font-semibold (if <30 days) | Clock |
| Priority | Badge | High/Medium/Low with color coding | Flag |
| Submission Date | Date | text-gray-600 text-sm | FileCheck |

**Conditional Display**:
- **Expired Warning**: Show red "Expired" badge if current date > Effective To
- **Expiring Soon**: Show orange "Expiring in X days" if Effective To within 30 days
- **Approval Pending**: Show approval workflow status and pending approvers
- **Rejected**: Show rejection reason and rejector name

#### Workflow Information (if applicable)
**For Pending Approval**:
```
┌─────────────────────────────────────────────────────────┐
│  ⏳ Approval Workflow                                    │
│                                                         │
│  Current Step: 2 of 3                                   │
│                                                         │
│  ✓ Department Manager (Sarah Johnson)                  │
│    Approved: Jan 16, 2024 2:15 PM                      │
│                                                         │
│  ⏳ Procurement Manager (Mike Chen) - Pending          │
│     Deadline: Jan 18, 2024                             │
│                                                         │
│  ○ Finance Approval - Waiting                          │
│                                                         │
│  [View Workflow Details]                               │
└─────────────────────────────────────────────────────────┘
```

**For Approved**:
| Field | Display |
|-------|---------|
| Approved By | User + Date |
| Approval Comments | Text (collapsible) |
| Approval Duration | Days from submission to approval |

**For Rejected**:
| Field | Display |
|-------|---------|
| Rejected By | User + Date |
| Rejection Reason | Text in red box |
| Action Required | Next steps (if any) |

### Section 3: Metrics & Quick Stats

**Layout**: Right column, grid grid-cols-2 gap-3

#### Metric Cards
| Metric | Icon | Value | Description |
|--------|------|-------|-------------|
| Total Products | Package | 125 | Products in price list |
| Products Priced | CheckCircle | 118/125 | Products with pricing |
| Avg Price | TrendingUp | $3.25 | Average price per product |
| Total Value (Est.) | DollarSign | $15,234 | Estimated value at MOQ |
| Price Changes | ArrowUpDown | +12 / -8 | Products with price changes |
| Cost Savings | Percent | 8.5% | vs previous price list |

**Metric Card Style**:
- Each card: bg-gray-50, rounded-lg, p-3, border border-gray-100
- Icon: size-5, text-gray-400, mb-1
- Value: text-xl font-bold text-gray-900
- Label: text-xs text-gray-600, mt-1
- Trend indicator: Small arrow + percentage (green ↓ savings, red ↑ increase)

**Interactions**:
- Click metric to filter/navigate to related view
- Hover shows detailed tooltip with breakdown
- Animated count-up on page load

**Example Tooltip (Total Value)**:
```
Total Estimated Value

Based on minimum order quantities:
• Fresh Produce: $8,450
• Dairy: $3,200
• Meat: $2,584
• Other: $1,000

Total: $15,234
```

---

## Tab Navigation

### Tab Bar
**Layout**:
- Flex row, border-b border-gray-200, bg-white
- Sticky top-0, z-20 (stays visible on scroll)
- Horizontal scroll on mobile with scroll indicators

**Tabs**:
| Tab Label | Icon | Badge | Default | Route |
|-----------|------|-------|---------|-------|
| Overview | Eye | - | Yes | ?tab=overview |
| Products | Package | Product count (125) | - | ?tab=products |
| Pricing Analysis | TrendingUp | - | - | ?tab=analysis |
| History | Clock | Change count | - | ?tab=history |
| Documents | FileText | Attachment count | - | ?tab=documents |
| Comments | MessageCircle | Comment count | - | ?tab=comments |
| Settings | Settings | - | - | ?tab=settings |

**Tab Style**:
- **Inactive**: text-gray-600, hover:text-gray-900, hover:border-gray-300, pb-4, px-6
- **Active**: text-blue-600, border-b-2 border-blue-600, font-medium, pb-4, px-6
- **Badge**: ml-2, bg-gray-100 text-gray-600, rounded-full, px-2 py-0.5, text-xs font-medium
- **Icon**: size-4, mr-2, inline with text

**Accessibility**:
- role="tablist"
- Each tab: role="tab", aria-selected, aria-controls="tab-panel-{name}"
- Tab panels: role="tabpanel", aria-labelledby="tab-{name}", tabindex="0"
- Focus management: Tab key moves to panel, Shift+Tab returns to tab list

**Interaction**:
- Click tab to switch content
- URL updates with tab parameter (?tab=products)
- Browser back/forward navigation works
- Keyboard: ← → to switch tabs, Tab to move into panel content
- Deep linking: Direct links to specific tabs work

**Mobile Scroll Indicators**:
- Left shadow when scrollable left
- Right shadow when scrollable right
- Smooth scroll behavior

---

## Tab 1: Overview

### Content Sections

#### 1.1 Summary Statistics Row

**Layout**: Grid 4 columns on desktop, 2 on tablet, 1 on mobile, gap-4, mb-6

**Stat Cards**:
```
┌─────────────────────────────────────────────────────────┐
│  📦 Total Products: 125                                 │
│  💰 Total Value: $15,234                                │
│  ✓ Completion: 94% (118/125 priced)                    │
│  📊 Avg Price Change: +5.2% vs last submission         │
└─────────────────────────────────────────────────────────┘
```

**Card Style**:
- bg-white, border border-gray-200, rounded-lg, p-4
- Icon: size-6, text-blue-600, mr-3
- Value: text-2xl font-bold text-gray-900
- Label: text-sm text-gray-600

#### 1.2 Vendor Information Card

**Title**: Vendor Details

**Layout**: 2-column grid on desktop

**Fields**:
| Field | Value | Icon | Editable |
|-------|-------|------|----------|
| Vendor Name | ABC Foods Inc. | Building | No (link) |
| Vendor Code | VEN-001 | Hash | No |
| Vendor Category | Preferred Vendor | Tag | No |
| Contact Person | John Doe | User | No |
| Email | john@abcfoods.com | Mail | No (mailto link) |
| Phone | (555) 123-4567 | Phone | No (tel link) |
| Last Price List | 3 months ago | Calendar | No (link) |
| Total Price Lists | 12 submissions | FileCheck | No (link) |
| Average Lead Time | 3 days | Clock | No |
| On-Time Delivery | 95% | TrendingUp | No |

**Interactions**:
- Vendor name: Links to vendor detail page
- Email: Opens email client (mailto:)
- Phone: Initiates call on mobile (tel:)
- Last Price List: Links to previous price list
- Total Price Lists: Links to filtered vendor price list history

**Vendor Performance Badge** (if available):
```
⭐ 4.8/5.0 Vendor Rating
```

#### 1.3 Price List Information Card

**Title**: Price List Details

**Layout**: 2-column grid

**Fields** (with inline editing where applicable):
| Field Label | Value | Editable | Edit Type | Icon |
|-------------|-------|----------|-----------|------|
| Price List Name | Text (200 chars max) | Yes | Text input | FileText |
| Reference ID | Auto-generated | No | - | Hash |
| Currency | USD ($) | No* | - | DollarSign |
| Description | Textarea (2000 chars) | Yes | Textarea | AlignLeft |
| Source Type | Template/RFQ/Manual | No | - | Folder |
| Reference Number | Quote #12345 | Yes | Text input | Hash |
| Submission Date | Jan 15, 2024 | Yes | Date picker | Calendar |
| Effective From | Jan 20, 2024 | Yes | Date picker | Calendar |
| Effective To | Apr 20, 2024 | Yes | Date picker | CalendarX |
| Priority | Medium | Yes | Radio buttons | Flag |
| Tags | Multi-select chips | Yes | Tag selector | Tag |

**Note**: *Currency cannot be changed after products are added

**Inline Editing Behavior**:
- **Hover**: Show pencil icon on editable fields
- **Click**: Activates edit mode
- **Edit Mode**: Input field + Save (✓) + Cancel (✗) buttons
- **Save**: Shows saving spinner, then success checkmark
- **Validation**: Real-time validation with error messages
- **Permissions**: Only editable if user has edit permission AND status allows (Draft/Pending)

**Edit Mode UI Example**:
```
┌────────────────────────────────────────────────────────┐
│ Price List Name: [Fresh Produce - Jan 2024_____] ✓ ✗  │
│ ℹ️ 45 / 200 characters                                │
└────────────────────────────────────────────────────────┘
```

#### 1.4 Pricing Summary Section

**Title**: Pricing Overview

**Quick Stats Grid**:
```
┌─────────────────────────────────────────────────────────┐
│  Products Priced:        118 / 125 (94%)                │
│  Average Base Price:     $3.25 per unit                 │
│  Price Range:            $0.50 - $45.00                 │
│  Tiered Pricing Items:   23 products (18%)              │
│  Total MOQ Value:        $15,234                        │
│  Total @ Max Qty:        $47,890                        │
└─────────────────────────────────────────────────────────┘
```

**Price Comparison vs. Last Submission**:
```
┌─────────────────────────────────────────────────────────┐
│  Price Changes Summary                                  │
│                                                         │
│  🔺 Increased:    12 products (+2% to +45%)            │
│  🔻 Decreased:    8 products (-3% to -12%)             │
│  ➡️ Unchanged:    98 products                           │
│                                                         │
│  Net Impact: +5.2% increase                            │
│  Cost Impact: +$790 estimated                          │
│                                                         │
│  [View Detailed Comparison →]                          │
└─────────────────────────────────────────────────────────┘
```

**Action Buttons**:
- View All Products (→ Products tab)
- View Price Analysis (→ Analysis tab)
- Compare with Others (opens comparison dialog)

#### 1.5 Terms & Conditions Summary

**Title**: Terms & Conditions

**Collapsible Sections**:

**Payment Terms**:
- Payment Terms: Net 30 days
- Early Payment Discount: 2% if paid within 10 days
- Late Payment Penalty: 1.5% per month

**Delivery Terms**:
- Lead Time: 3 days
- Delivery Method: Vendor Delivers
- Delivery Charges: Included in Price
- Minimum Order Value: $250.00

**Warranty & Returns**:
- Warranty Period: 30 days satisfaction guarantee
- Return Policy: 7 days for unopened products
- Restocking Fee: 10% for non-defective returns

**Special Conditions**:
- Free text description of any special terms
- Click "View Full Terms" to expand all details

**Attachments** (if any):
- List of attached documents (contract, quote, etc.)
- Download buttons

#### 1.6 Approval Workflow Section

**Title**: Approval Workflow

**Workflow Status Visualization**:
```
┌─────────────────────────────────────────────────────────┐
│  Approval Progress                                      │
│                                                         │
│  Step 1: Department Manager                            │
│  ✓ Approved by Sarah Johnson                           │
│    Jan 16, 2024 2:15 PM                                │
│    Comment: "Prices look reasonable for Q1"            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━          │
│                                                         │
│  Step 2: Procurement Manager [CURRENT]                 │
│  ⏳ Pending approval from Mike Chen                     │
│    Deadline: Jan 18, 2024 (1 day remaining)            │
│    [Remind Approver] [Escalate]                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━          │
│                                                         │
│  Step 3: Finance Approval                              │
│  ○ Waiting (triggered if approved in step 2)           │
│    Auto-assigned: Finance Team                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━          │
│                                                         │
│  Estimated Completion: Jan 19, 2024                    │
│  Days in Workflow: 3 days                              │
└─────────────────────────────────────────────────────────┘
```

**Workflow Actions** (if user is approver):
- **Approve Button**: Opens approval dialog with comment field
- **Reject Button**: Opens rejection dialog with reason required
- **Request Changes**: Request modifications before approving

**Approval Dialog**:
```
┌─────────────────────────────────────────────────────────┐
│  Approve Price List                              [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Price List: Fresh Produce - Jan 2024 - ABC Foods      │
│  Total Value: $15,234                                   │
│                                                         │
│  Approval Comments (optional):                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Add comments for audit trail...]              │   │
│  │                                                 │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ☑ Notify submitter via email                          │
│  ☐ Add approval condition/note                         │
│                                                         │
│  [Cancel]                    [Confirm Approval]        │
└─────────────────────────────────────────────────────────┘
```

**Rejection Dialog**:
```
┌─────────────────────────────────────────────────────────┐
│  Reject Price List                               [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Price List: Fresh Produce - Jan 2024 - ABC Foods      │
│                                                         │
│  Rejection Reason (required): *                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Explain why this price list is being rejected]│   │
│  │                                                 │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Common Reasons:                                        │
│  • Prices too high compared to market                   │
│  • Missing required products                            │
│  • Invalid or expired effective dates                   │
│  • Incomplete terms & conditions                        │
│  • Budget constraints                                   │
│                                                         │
│  Action Required:                                       │
│  ○ Request resubmission with changes                   │
│  ○ Return to vendor for revision                       │
│  ○ Cancel price list                                   │
│                                                         │
│  ☑ Notify submitter and vendor via email               │
│                                                         │
│  [Cancel]                    [Confirm Rejection]       │
└─────────────────────────────────────────────────────────┘
```

#### 1.7 Recent Activity Timeline

**Title**: Recent Activity (Last 15 days)

**Timeline Style**: Vertical timeline with connecting line

**Activity Items**:
| Activity Type | Icon | Description | User | Timestamp |
|---------------|------|-------------|------|-----------|
| Created | Plus | Price list created | John Smith | Jan 15, 10:30 AM |
| Submitted | Send | Submitted for approval | John Smith | Jan 15, 10:45 AM |
| Approved | CheckCircle | Approved by Dept Manager | Sarah Johnson | Jan 16, 2:15 PM |
| Updated | Edit | Updated pricing for 5 products | John Smith | Jan 16, 4:30 PM |
| Comment | MessageCircle | Added comment | Mike Chen | Jan 17, 9:00 AM |
| Exported | Download | Exported to Excel | Jane Doe | Jan 17, 11:15 AM |

**Timeline Item Structure**:
```
┌─────────────────────────────────────────────────────────┐
│  ● Price List Created                                   │
│  │ John Smith created this price list                   │
│  │ Jan 15, 2024 10:30 AM                                │
│  │ [View Details ▼]                                     │
│  │                                                      │
│  ● Submitted for Approval                               │
│  │ John Smith submitted for approval                    │
│  │ Jan 15, 2024 10:45 AM                                │
│  │ Workflow: Department Manager → Procurement Manager   │
│  │ [View Details ▼]                                     │
│  │                                                      │
│  ... more activities ...                                │
│                                                         │
│  [View Full Audit Log →]                               │
└─────────────────────────────────────────────────────────┘
```

**Expandable Details**: Click "View Details" to show full activity data (before/after values, etc.)

---

## Tab 2: Products

### Product List Section

#### Filter & Search Bar

**Layout**: Flex row, flex-wrap, gap-3, p-4, bg-gray-50, rounded-lg, mb-4

**Search Input**:
- Placeholder: "Search products by name, code, or category..."
- Icon: Search, size-4
- Width: 300px (expand to full on focus)
- Debounced: 300ms
- Clear button (X) appears when text entered

**Filters**:
| Filter | Type | Options | Default |
|--------|------|---------|---------|
| Category | Multi-select dropdown | All product categories | All |
| Pricing Status | Radio buttons | All / Priced / Not Priced | All |
| Price Change | Multi-select | Increased / Decreased / Unchanged | All |
| Required Status | Multi-select | Required / Optional | All |
| UOM | Multi-select dropdown | All UOMs in list | All |

**Filter Chips**: Active filters shown as removable chips below filter bar

**Bulk Actions Toolbar** (appears when products selected):
```
┌─────────────────────────────────────────────────────────┐
│  ✓ 12 products selected                                 │
│  [Export Selected] [Compare Prices] [View in Table]    │
│  [Clear Selection]                                      │
└─────────────────────────────────────────────────────────┘
```

**View Toggle**:
- Table View (default)
- Card View
- Compact List View

#### Product Table

**Table Headers**:
| Column | Sortable | Width | Sticky | Tooltip |
|--------|----------|-------|--------|---------|
| [Checkbox] | No | 40px | Left | Select for bulk actions |
| Seq# | Yes | 60px | Left | Display sequence |
| Product | Yes | 280px | Left | Product name and code |
| Category | Yes | 140px | No | Product category |
| UOM | No | 80px | No | Unit of measure |
| Pack Size | No | 90px | No | Items per pack |
| Base Price | Yes | 120px | No | Price per unit |
| MOQ | No | 80px | No | Minimum order qty |
| Qty Tiers | No | 100px | No | Tiered pricing |
| Last Price | Yes | 110px | No | Previous price |
| Change | Yes | 100px | No | % change |
| Actions | No | 100px | Right | Product actions |

**Table Row (Standard)**:
```
┌──────────────────────────────────────────────────────────────────────┐
│ ☐ 1  Fresh Tomatoes (PROD-001)   Vegetables   KG   10   $2.75      │
│      Roma variety, red                         50   +2   $2.50       │
│      ℹ️ Tiered: 100kg→$2.60, 500kg→$2.45                           │
│      [↑+10%] vs last price                                          │
│      [✏️ Edit] [📊 History] [⋮ More]                                │
└──────────────────────────────────────────────────────────────────────┘
```

**Row States**:
- **Default**: White background
- **Hover**: Light gray background (bg-gray-50)
- **Selected**: Blue tint (bg-blue-50)
- **Price Increase**: Light red tint (bg-red-50) if >20% increase
- **Price Decrease**: Light green tint (bg-green-50) if >10% decrease
- **Not Priced**: Yellow tint (bg-yellow-50) for required products

**Price Change Indicator**:
- Green ↓ with percentage: Price decreased (good)
- Red ↑ with percentage: Price increased (caution)
- Gray → : No change
- Tooltip shows: "Price changed from $2.50 to $2.75 (+10%)"

**Tiered Pricing Indicator**:
- Badge: "+2 tiers" or "Qty pricing"
- Click to expand tier details inline
- Shows: Quantity ranges and prices

**Inline Tier Display (Expanded)**:
```
┌──────────────────────────────────────────────────────────┐
│  Quantity-Based Pricing:                                 │
│  • 50-99 kg:    $2.75 (base)                             │
│  • 100-499 kg:  $2.60 (-5.5%)                            │
│  • 500+ kg:     $2.45 (-10.9%)                           │
│  [Collapse ▲]                                            │
└──────────────────────────────────────────────────────────┘
```

**Product Actions**:
- **Edit**: Opens inline editor or side panel to edit price, MOQ, tiers
- **History**: Opens price history modal for this product
- **More**: Dropdown with:
  - View Product Details
  - Compare with Other Vendors
  - Set Price Alert
  - Remove from List (if editable)
  - Copy Price to Clipboard

#### Empty State (No Products Match Filters)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│          🔍 No Products Found                           │
│                                                         │
│  No products match your current filters.                │
│  Try adjusting or clearing your filters.                │
│                                                         │
│  [Clear All Filters]                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Product Edit Dialog (Inline or Side Panel)

**Option 1: Inline Row Editor**:
```
┌──────────────────────────────────────────────────────────┐
│  Editing: Fresh Tomatoes (PROD-001)                     │
│  ────────────────────────────────────────────────────── │
│  Base Price: [$2.75]  UOM: [KG ▼]  Pack: [10]         │
│  MOQ: [50]  Lead Time: [3] days                        │
│                                                         │
│  Tiered Pricing:                                        │
│  100-499 kg: [$2.60]  500+ kg: [$2.45]  [+ Add Tier]  │
│                                                         │
│  Notes: [Organic certification available__________]    │
│                                                         │
│  [Cancel]  [Save Changes]                              │
└──────────────────────────────────────────────────────────┘
```

**Option 2: Side Panel** (slides in from right):
- More space for complex edits
- Full product details
- Price history chart
- Comparison with other vendors
- Save/Cancel at bottom

#### Card View (Alternative Layout)

**Card Grid**: 3 columns on desktop, 2 on tablet, 1 on mobile

**Product Card**:
```
┌────────────────────────────────────┐
│  Fresh Tomatoes (PROD-001)         │
│  Vegetables                         │
│  ──────────────────────────────    │
│  Base Price:  $2.75/kg             │
│  MOQ:         50 kg                 │
│  Pack Size:   10 kg                 │
│                                     │
│  Last Price:  $2.50/kg             │
│  Change:      ↑ +10%  🔴           │
│                                     │
│  ⚡ 2 Tier Pricing Available        │
│                                     │
│  [View Details]  [Edit]            │
└────────────────────────────────────┘
```

---

## Tab 3: Pricing Analysis

### Analysis Dashboard

#### 3.1 Price Comparison Chart

**Title**: Price Comparison vs. Historical Data

**Chart Type**: Line chart with multiple series

**Data Series**:
- Current price list (blue line)
- Previous price list (gray line, dashed)
- 6-month average (yellow line)
- Market benchmark (if available, green line)

**X-Axis**: Products (or product categories)
**Y-Axis**: Price ($)

**Interactions**:
- Hover: Shows tooltip with exact values
- Click data point: Highlights product in table below
- Toggle series: Show/hide series via legend
- Zoom: Pinch-to-zoom or scroll wheel

**Chart Controls**:
- View by: All Products / Top 20 / Categories
- Group by: Individual / Category Average
- Time Range: Current / 3 Months / 6 Months / 1 Year
- Export: PNG, PDF, CSV data

#### 3.2 Cost Analysis Summary

**Statistics Grid** (4 columns):
```
┌─────────────────────────────────────────────────────────┐
│  Total Estimated Cost (at MOQ):  $15,234                │
│  Average Price per Product:      $3.25                  │
│  Median Price:                   $2.10                  │
│  Price Range:                    $0.50 - $45.00         │
│                                                         │
│  vs. Previous Price List:                               │
│  Net Change:     +5.2% ($790 increase)                  │
│  Savings:        8 products saved $245                  │
│  Increases:      12 products increased $1,035           │
│                                                         │
│  vs. Market Benchmark:                                  │
│  Position:       7.5% below market average              │
│  Competitive:    ✓ Good pricing                         │
└─────────────────────────────────────────────────────────┘
```

#### 3.3 Price Distribution Histogram

**Chart Type**: Histogram showing price distribution

**Buckets**:
- $0-$5: 89 products
- $5-$10: 23 products
- $10-$20: 9 products
- $20-$50: 4 products

**Style**:
- Bars colored by bucket
- Count label on top of each bar
- Click bar to filter products in that range

#### 3.4 Top Price Increases/Decreases

**Two Tables Side-by-Side**:

**Top 10 Price Increases**:
| Product | Last Price | New Price | Change | % |
|---------|------------|-----------|--------|---|
| Product A | $10.00 | $14.50 | +$4.50 | +45% |
| ... | ... | ... | ... | ... |

**Top 10 Price Decreases**:
| Product | Last Price | New Price | Change | % |
|---------|------------|-----------|--------|---|
| Product X | $15.00 | $13.20 | -$1.80 | -12% |
| ... | ... | ... | ... | ... |

**Style**:
- Red background for increases >20%
- Green background for decreases >10%
- Click row to view product details

#### 3.5 Category-Wise Analysis

**Table**:
| Category | Products | Avg Price | Change vs Last | Total Value |
|----------|----------|-----------|----------------|-------------|
| Vegetables | 45 | $2.15 | +3.2% | $4,838 |
| Fruits | 38 | $3.45 | -1.5% | $4,408 |
| Dairy | 12 | $5.20 | +8.5% | $2,496 |
| Meat | 18 | $12.50 | +2.1% | $3,375 |
| Other | 12 | $1.80 | 0% | $2,160 |

**Interactions**:
- Sort by any column
- Click category to filter products
- Export to Excel

#### 3.6 Pricing Trends Over Time

**Chart Type**: Multi-line time series

**Data**:
- Shows average price trend for this vendor over last 12 months
- Compares with other vendors' average (anonymized)
- Shows market trend line

**Insights Box**:
```
┌─────────────────────────────────────────────────────────┐
│  📊 Pricing Insights                                     │
│                                                         │
│  ✓ Current pricing 7.5% below market average            │
│  ⚠️ 12 products saw price increases >20%                │
│  ✓ Overall trend: Stable with slight upward pressure    │
│  ℹ️ Recommendation: Approve with monitoring on high     │
│     increase items                                      │
└─────────────────────────────────────────────────────────┘
```

#### 3.7 Outlier Detection

**Alert Box**:
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Pricing Outliers Detected                           │
│                                                         │
│  3 products flagged as statistical outliers:            │
│                                                         │
│  • Fresh Salmon: $45.00 (3.2σ above mean)              │
│    Last price: $32.00 (+40.6%)                         │
│    Market avg: $38.00 (+18.4% vs market)               │
│    [Review] [Accept] [Request Justification]          │
│                                                         │
│  • Organic Honey: $28.00 (2.8σ above mean)             │
│    Last price: $22.00 (+27.3%)                         │
│    [Review] [Accept] [Request Justification]          │
│                                                         │
│  [View All Outliers]                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Tab 4: History

### Change History & Audit Trail

#### 4.1 Timeline Filter

**Filter Bar**:
- Date Range: [Start Date] to [End Date]
- Change Type: All / Created / Updated / Approved / Rejected / Exported
- User: All Users / Specific User
- Product: All Products / Specific Product

#### 4.2 Change History Timeline

**Timeline View** (chronological, most recent first):

```
┌─────────────────────────────────────────────────────────┐
│  Jan 17, 2024                                           │
│  ──────────────────────────────────────────────────────│
│                                                         │
│  11:15 AM - Exported to Excel                          │
│  ● Jane Doe exported price list to Excel               │
│    Format: XLSX, 125 products                          │
│    [Download File]                                      │
│                                                         │
│  09:00 AM - Comment Added                              │
│  ● Mike Chen added a comment                           │
│    "Please verify salmon pricing seems high"           │
│    [View Comment]                                       │
│                                                         │
│  ──────────────────────────────────────────────────────│
│  Jan 16, 2024                                           │
│  ──────────────────────────────────────────────────────│
│                                                         │
│  04:30 PM - Prices Updated                             │
│  ● John Smith updated pricing for 5 products           │
│    Products: Tomatoes, Lettuce, Carrots, Onions, Peppers│
│    [View Changes ▼]                                     │
│                                                         │
│  02:15 PM - Approved                                   │
│  ● Sarah Johnson (Dept Manager) approved               │
│    Comment: "Prices look reasonable for Q1"            │
│    Approval Step: 1 of 3                               │
│    [View Approval Details]                             │
│                                                         │
│  ... more history items ...                            │
│                                                         │
│  [Load More] (older history)                           │
└─────────────────────────────────────────────────────────┘
```

**Expandable Change Details**:
Click "View Changes ▼" to show before/after values:

```
┌─────────────────────────────────────────────────────────┐
│  Pricing Changes - Jan 16, 2024 04:30 PM               │
│  ────────────────────────────────────────────────────── │
│                                                         │
│  Fresh Tomatoes (PROD-001):                             │
│  Base Price:  $2.50 → $2.75  (+10%)                    │
│  MOQ:         50 kg (unchanged)                         │
│                                                         │
│  Fresh Lettuce (PROD-002):                              │
│  Base Price:  $1.90 → $1.80  (-5.3%)                   │
│  Pack Size:   20 → 25  (+25%)                           │
│                                                         │
│  ... 3 more products ...                               │
│                                                         │
│  [Collapse ▲]                                           │
└─────────────────────────────────────────────────────────┘
```

#### 4.3 Version History (if applicable)

**Versions Table**:
| Version | Date | User | Changes | Status | Actions |
|---------|------|------|---------|--------|---------|
| v1.2 (Current) | Jan 16, 4:30 PM | John Smith | Updated 5 prices | Active | View |
| v1.1 | Jan 16, 2:15 PM | System | Approved by Dept Mgr | Approved | View / Compare |
| v1.0 | Jan 15, 10:30 AM | John Smith | Initial creation | Draft | View / Compare |

**Actions**:
- **View**: Open version in read-only mode
- **Compare**: Open side-by-side comparison dialog
- **Restore** (if permission): Restore this version as current

#### 4.4 Approval History

**Approval Chain Table**:
| Step | Approver | Action | Date | Comments | Duration |
|------|----------|--------|------|----------|----------|
| 1 | Sarah Johnson (Dept Mgr) | Approved | Jan 16, 2:15 PM | "Prices reasonable" | 4h 30m |
| 2 | Mike Chen (Proc Mgr) | Pending | - | - | 1d 2h (so far) |
| 3 | Finance Team | Waiting | - | - | - |

**Approval Details Dialog** (click any row):
```
┌─────────────────────────────────────────────────────────┐
│  Approval Details - Step 1                       [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Approver: Sarah Johnson (Department Manager)           │
│  Action: Approved                                       │
│  Date: Jan 16, 2024 2:15 PM                            │
│  Duration: 4 hours 30 minutes from submission          │
│                                                         │
│  Comments:                                              │
│  "Prices look reasonable for Q1 2024. The slight       │
│  increase in tomatoes is expected due to seasonal      │
│  factors. Approved for next step."                     │
│                                                         │
│  Attachments: None                                      │
│                                                         │
│  Email Notifications Sent:                              │
│  • John Smith (Submitter)                              │
│  • Mike Chen (Next Approver)                           │
│                                                         │
│  [Close]                                                │
└─────────────────────────────────────────────────────────┘
```

#### 4.5 Export History

**Export Log**:
| Date | User | Format | Products | Purpose | Download |
|------|------|--------|----------|---------|----------|
| Jan 17, 11:15 AM | Jane Doe | Excel | 125 | Analysis | [Download] |
| Jan 16, 9:00 AM | John Smith | PDF | 125 | Print | [Download] |
| Jan 15, 3:30 PM | John Smith | Excel | 125 | Backup | [Download] |

**Download Action**: Re-downloads the exact file that was generated at that time

---

## Tab 5: Documents

### Document Management

#### 5.1 Document Categories

**Category Tabs** (horizontal):
- All Documents (badge: total count)
- Quotes & Proposals
- Contracts & Agreements
- Certifications
- Product Catalogs
- Price Sheets
- Invoices
- Other

#### 5.2 Document Upload Area

**Upload Zone** (top of section):
```
┌─────────────────────────────────────────────────────────┐
│  📎 Upload Documents                                     │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│          Drop files here or click to browse             │
│                                                         │
│  Supported: PDF, Excel, Word, Images (JPG, PNG)        │
│  Max size: 10MB per file                               │
│                                                         │
│  [Browse Files]                                         │
└─────────────────────────────────────────────────────────┘
```

**Upload Progress** (when uploading):
```
┌─────────────────────────────────────────────────────────┐
│  Uploading: vendor_quote.pdf                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  75% (1.2 MB / 1.6 MB)│
└─────────────────────────────────────────────────────────┘
```

#### 5.3 Document List

**List View**:

| File Name | Type | Size | Uploaded By | Date | Category | Actions |
|-----------|------|------|-------------|------|----------|---------|
| vendor_quote.pdf | PDF | 1.2 MB | John Smith | Jan 15, 10:45 AM | Quotes | [👁️] [⬇️] [🗑️] |
| product_catalog.xlsx | Excel | 3.8 MB | John Smith | Jan 15, 10:50 AM | Catalogs | [👁️] [⬇️] [🗑️] |
| certification.pdf | PDF | 850 KB | John Smith | Jan 15, 11:00 AM | Certifications | [👁️] [⬇️] [🗑️] |

**Icons**:
- 👁️ Preview (opens in modal)
- ⬇️ Download
- 🗑️ Delete (if permission)

**Document Type Icons**:
- PDF: Red PDF icon
- Excel: Green XLS icon
- Word: Blue DOC icon
- Image: Purple IMG icon

#### 5.4 Document Preview Modal

**Triggered by**: Click file name or preview icon

```
┌─────────────────────────────────────────────────────────┐
│  vendor_quote.pdf                        [⬇️] [🗑️] [✕] │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  [PDF Preview Renderer]                                 │
│                                                         │
│  Page 1 of 3                                            │
│  [← Previous] [Next →]                                 │
│  Zoom: [- 50% 75% 100% 125% 150% +]                    │
│                                                         │
│  Document Info:                                         │
│  Uploaded: Jan 15, 2024 10:45 AM                       │
│  Uploaded by: John Smith                                │
│  Size: 1.2 MB                                           │
│  Category: Quotes & Proposals                           │
│                                                         │
│  [Download PDF]  [Print]                               │
└─────────────────────────────────────────────────────────┘
```

**For Images**: Show full image with zoom controls
**For Excel**: Show first sheet with download option
**For Word**: Convert to PDF preview or show plain text

#### 5.5 Bulk Document Actions

**When documents selected**:
```
┌─────────────────────────────────────────────────────────┐
│  ✓ 3 documents selected                                 │
│  [Download All] [Delete Selected] [Change Category]    │
│  [Clear Selection]                                      │
└─────────────────────────────────────────────────────────┘
```

**Download All**: Creates ZIP file with selected documents

---

## Tab 6: Comments

### Discussion & Collaboration

#### 6.1 Comment Composer

**Top of tab** (always visible):
```
┌─────────────────────────────────────────────────────────┐
│  Add Comment                                            │
│  ─────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Write your comment here...]                    │   │
│  │                                                 │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [@Mention] [📎 Attach] [Emoji 😊]                     │
│                                                         │
│  ☑ Notify mentioned users via email                    │
│  ☐ Mark as important                                   │
│                                                         │
│  [Cancel]  [Post Comment]                              │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- **@Mentions**: Type @ to autocomplete user list
- **Attach**: Add files to comment (max 5MB)
- **Emoji**: Emoji picker
- **Markdown**: Basic formatting supported (bold, italic, lists, links)
- **Preview**: Toggle preview mode

#### 6.2 Comment Thread

**Comment Structure**:
```
┌─────────────────────────────────────────────────────────┐
│  👤 Mike Chen (Procurement Manager)    Jan 17, 9:00 AM  │
│  ──────────────────────────────────────────────────────│
│                                                         │
│  @John Smith Please verify salmon pricing seems high   │
│  compared to our usual range. Can you check with vendor?│
│                                                         │
│  📎 Attachment: market_pricing_comparison.xlsx         │
│                                                         │
│  [💬 Reply] [👍 2] [❤️ 1] [⋮ More]                      │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  👤 John Smith            Jan 17, 10:30 AM        │ │
│  │  ──────────────────────────────────────────────── │ │
│  │  Good catch! I've contacted the vendor about      │ │
│  │  salmon pricing. They confirmed it's due to       │ │
│  │  seasonal shortage. I'll update with their        │ │
│  │  justification.                                   │ │
│  │                                                   │ │
│  │  [💬 Reply] [👍 1] [⋮ More]                        │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Comment Features**:
- **Avatar**: User profile picture
- **Name**: User name with role badge
- **Timestamp**: Relative time (hover for exact)
- **Content**: Markdown rendered
- **Attachments**: File links with download
- **Reactions**: Emoji reactions (👍 ❤️ 😊 etc.)
- **Reply**: Nested thread
- **More**: Edit (own comments), Delete (own or admin), Report

**Comment Sorting**:
- Newest First (default)
- Oldest First
- Most Reactions
- Most Replies

**Comment Filtering**:
- All Comments
- Important Only
- @Mentions of Me
- My Comments

#### 6.3 Activity Integration

**System Comments** (automated):
```
┌─────────────────────────────────────────────────────────┐
│  🤖 System                            Jan 16, 2:15 PM   │
│  ──────────────────────────────────────────────────────│
│                                                         │
│  Price list approved by Sarah Johnson (Dept Manager)   │
│  Moving to next approval step: Procurement Manager     │
│                                                         │
│  Comment: "Prices look reasonable for Q1"              │
└─────────────────────────────────────────────────────────┘
```

**@Mention Notifications**:
- Real-time notification badge
- Email notification (if enabled)
- In-app notification
- Unread indicator on Comments tab

#### 6.4 Comment Statistics

**Summary Bar** (top of comments):
```
💬 15 Comments  |  👥 5 Participants  |  📌 2 Important
```

---

## Tab 7: Settings

### Configuration & Permissions

#### 7.1 Price List Settings

**Section: Basic Settings**

| Setting | Type | Value | Description |
|---------|------|-------|-------------|
| Auto-Archive | Toggle | ON/OFF | Auto-archive when expired |
| Allow Extensions | Toggle | ON/OFF | Allow extending effective dates |
| Require Approval for Changes | Toggle | ON/OFF | Changes need re-approval |
| Price Change Alert Threshold | Number | 20% | Alert if price changes exceed % |
| Email Notifications | Toggle | ON/OFF | Send email updates |

**Setting UI Example**:
```
┌─────────────────────────────────────────────────────────┐
│  Auto-Archive on Expiration                             │
│  [ON ●━━━━ OFF]                                         │
│  Automatically archive this price list when effective   │
│  date expires                                           │
└─────────────────────────────────────────────────────────┘
```

#### 7.2 Notification Settings

**Who gets notified**:
- ☑ Submitter (on approval/rejection)
- ☑ Approvers (on submission, reminders)
- ☐ Procurement Team (on major changes)
- ☐ Finance Team (on high-value lists)
- ☑ Vendor Contact (on approval)

**Notification Types**:
- ☑ Email
- ☑ In-App
- ☐ SMS (for urgent)

**Reminder Settings**:
- Send reminder to pending approvers after: [2] days
- Send expiration warning: [30] days before expiry
- Notify on price change >: [20]%

#### 7.3 Access & Permissions

**Who Can View**:
- ( ) Everyone (all authenticated users)
- ( ) Procurement & Finance Teams
- (●) Custom (select users/roles below)

**Custom Access List**:
| User/Role | Permission | Actions |
|-----------|------------|---------|
| John Smith | Owner (Full Access) | - |
| Procurement Team | Edit & Approve | [Remove] |
| Finance Team | View & Approve | [Remove] |
| Sarah Johnson | View Only | [Remove] |

**Add User/Role**:
```
┌─────────────────────────────────────────────────────────┐
│  Add User or Role                                       │
│  [Search users or roles_____________] [🔍]             │
│  Permission: [View ▼ Edit ▼ Approve ▼]                │
│  [Add]                                                  │
└─────────────────────────────────────────────────────────┘
```

#### 7.4 Approval Workflow Configuration

**Current Workflow**:
```
┌─────────────────────────────────────────────────────────┐
│  Approval Workflow                                      │
│                                                         │
│  Step 1: Department Manager                            │
│  Auto-assigned based on department                      │
│  SLA: 1 business day                                   │
│  [Edit]                                                 │
│                                                         │
│  Step 2: Procurement Manager                           │
│  Required if total value > $10,000                     │
│  SLA: 2 business days                                  │
│  [Edit]                                                 │
│                                                         │
│  Step 3: Finance Approval                              │
│  Required if terms > 90 days                           │
│  SLA: 1 business day                                   │
│  [Edit]                                                 │
│                                                         │
│  [Add Step] [Reset to Default]                         │
└─────────────────────────────────────────────────────────┘
```

**Edit Step Dialog**:
```
┌─────────────────────────────────────────────────────────┐
│  Edit Approval Step                              [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Step: [2]  Name: [Procurement Manager_________]       │
│                                                         │
│  Approver Assignment:                                   │
│  (●) Auto-assign by role                               │
│  ( ) Specific user(s)                                  │
│  ( ) Conditional (based on criteria)                   │
│                                                         │
│  Role: [Procurement Manager ▼]                         │
│                                                         │
│  Conditions (optional):                                 │
│  ☑ Require if total value > [$10,000_____]            │
│  ☐ Require if price change > [___]%                    │
│  ☐ Require if new vendor                               │
│  ☐ Require if priority is High/Urgent                  │
│                                                         │
│  SLA: [2] business days                                │
│  Escalate to: [Senior Procurement Manager ▼]           │
│  Escalation after: [4] business days                   │
│                                                         │
│  [Cancel]                          [Save Step]         │
└─────────────────────────────────────────────────────────┘
```

#### 7.5 Export Templates

**Custom Export Configuration**:
```
┌─────────────────────────────────────────────────────────┐
│  Export Templates                                       │
│                                                         │
│  Default Excel Template:                                │
│  Columns: All product fields + pricing                  │
│  [Edit Template]                                        │
│                                                         │
│  Custom Templates:                                      │
│  • Vendor Comparison Template                          │
│  • Finance Review Template                             │
│  • Procurement Summary Template                        │
│                                                         │
│  [Create New Template]                                  │
└─────────────────────────────────────────────────────────┘
```

#### 7.6 Danger Zone

**Destructive Actions** (requires confirmation):
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Danger Zone                                          │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Archive Price List                                     │
│  Price list will be moved to archived status           │
│  [Archive]                                              │
│                                                         │
│  Delete Price List                                      │
│  Permanently delete this price list. Cannot be undone.  │
│  [Delete]                                               │
│                                                         │
│  Reset to Draft                                         │
│  Return price list to draft status (if rejected)       │
│  [Reset to Draft]                                       │
└─────────────────────────────────────────────────────────┘
```

**Delete Confirmation Dialog**:
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Confirm Deletion                             [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Are you sure you want to delete this price list?      │
│                                                         │
│  Price List: Fresh Produce - Jan 2024 - ABC Foods      │
│  Reference: PL-2401-0001                                 │
│  Products: 125                                          │
│                                                         │
│  This action cannot be undone. All data including       │
│  pricing, comments, documents, and history will be      │
│  permanently deleted.                                   │
│                                                         │
│  Type "DELETE" to confirm:                              │
│  [_______________]                                      │
│                                                         │
│  Reason for deletion (optional):                        │
│  [_______________________________________________]      │
│                                                         │
│  [Cancel]                  [Permanently Delete]         │
└─────────────────────────────────────────────────────────┘
```

---

## Dialogs & Modals

### 1. Compare Prices Dialog

**Triggered by**: "Compare" button in header or "Compare with Others" in Products tab

**Large Modal** (max-w-6xl):
```
┌─────────────────────────────────────────────────────────┐
│  Compare Price Lists                             [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Base: Fresh Produce - Jan 2024 - ABC Foods (Current)  │
│                                                         │
│  Compare with:                                          │
│  ☑ ABC Foods - Dec 2023 (PL-2301-0045)                  │
│  ☑ XYZ Distributors - Jan 2024 (PL-2401-0002)           │
│  ☐ GreenFarm - Jan 2024 (PL-2401-0005)                  │
│                                                         │
│  [+ Add More Price Lists]                              │
│                                                         │
│  Comparison View:                                       │
│  ( ) Side-by-Side Table                                │
│  (●) Price Chart                                       │
│  ( ) Difference Heatmap                                │
│                                                         │
│  [Generate Comparison]                                  │
└─────────────────────────────────────────────────────────┘
```

**After "Generate Comparison"**:

**Side-by-Side Table View**:
| Product | ABC Foods Jan 2024 | ABC Foods Dec 2023 | XYZ Dist Jan 2024 | Best Price |
|---------|-------------------|--------------------|-------------------|------------|
| Fresh Tomatoes | $2.75 | $2.50 (+10%) | $2.85 | ABC Dec 2023 |
| Fresh Lettuce | $1.80 | $1.90 (-5%) | $1.75 | XYZ Jan 2024 |
| ... | ... | ... | ... | ... |

**Highlighting**:
- Green: Lowest price
- Red: Highest price
- Yellow: Current selection's price

**Summary Box**:
```
┌─────────────────────────────────────────────────────────┐
│  Comparison Summary                                     │
│                                                         │
│  • ABC Foods Jan 2024 has best price on: 45 products   │
│  • ABC Foods Dec 2023 has best price on: 38 products   │
│  • XYZ Dist Jan 2024 has best price on: 42 products    │
│                                                         │
│  Potential savings: $892 if switching to best prices   │
│                                                         │
│  [Export Comparison] [Email to Team]                   │
└─────────────────────────────────────────────────────────┘
```

### 2. Export Dialog

**Triggered by**: "Export" button in header

**Modal**:
```
┌─────────────────────────────────────────────────────────┐
│  Export Price List                               [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Export Format:                                         │
│  (●) Excel (.xlsx) - Full data with formatting         │
│  ( ) CSV (.csv) - Simple comma-separated values        │
│  ( ) PDF Report - Formatted report with charts         │
│  ( ) JSON - Structured data for API integration        │
│                                                         │
│  Include:                                               │
│  ☑ All product details                                 │
│  ☑ Pricing (base + tiered)                             │
│  ☑ Terms & conditions                                  │
│  ☑ Vendor information                                  │
│  ☐ Comments & activity log                             │
│  ☐ Documents (as attachments/links)                    │
│                                                         │
│  Products to Export:                                    │
│  (●) All products (125)                                │
│  ( ) Selected products only (if applicable)            │
│  ( ) Custom filter...                                  │
│                                                         │
│  Template:                                              │
│  [Standard Export ▼]                                    │
│  Options: Standard / Vendor Comparison / Finance Review│
│                                                         │
│  [Cancel]                        [Export]              │
└─────────────────────────────────────────────────────────┘
```

**Export Progress**:
```
┌─────────────────────────────────────────────────────────┐
│  Generating Export...                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  85%                  │
│  Preparing product data (106 / 125)                    │
└─────────────────────────────────────────────────────────┘
```

**Export Complete**:
```
┌─────────────────────────────────────────────────────────┐
│  ✓ Export Complete                               [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  File: Price_List_PL-2401-0001.xlsx                     │
│  Size: 2.4 MB                                           │
│  Generated: Jan 17, 2024 3:45 PM                       │
│                                                         │
│  [Download File]  [Email File]  [Close]               │
└─────────────────────────────────────────────────────────┘
```

### 3. Extend Dates Dialog

**Triggered by**: "Extend Dates" button (visible when expiring or expired)

**Modal**:
```
┌─────────────────────────────────────────────────────────┐
│  Extend Validity Period                          [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Current Effective Dates:                               │
│  From: Jan 20, 2024                                     │
│  To: Apr 20, 2024 (Expires in 15 days)                 │
│                                                         │
│  New Effective To Date:                                 │
│  [📅 Select new end date_____]                         │
│                                                         │
│  Suggested extensions:                                  │
│  • Extend 30 days: May 20, 2024                        │
│  • Extend 60 days: Jun 20, 2024                        │
│  • Extend 90 days: Jul 20, 2024                        │
│                                                         │
│  Reason for extension (optional):                       │
│  [_____________________________________________]        │
│                                                         │
│  ☑ Notify vendor of extension                          │
│  ☐ Request price confirmation from vendor              │
│  ☐ Require re-approval                                 │
│                                                         │
│  [Cancel]                  [Extend Validity]           │
└─────────────────────────────────────────────────────────┘
```

### 4. Price Alert Setup Dialog

**Triggered by**: More Actions → Set Alert

**Modal**:
```
┌─────────────────────────────────────────────────────────┐
│  Set Price Change Alert                          [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Get notified when prices change for this price list    │
│                                                         │
│  Alert Conditions:                                      │
│  ☑ Any price change                                    │
│  ☑ Price increase > [20]%                              │
│  ☑ Price decrease > [10]%                              │
│  ☐ Specific products (select below)                    │
│                                                         │
│  Notification Method:                                   │
│  ☑ Email                                                │
│  ☑ In-App Notification                                 │
│  ☐ SMS (for urgent alerts)                             │
│                                                         │
│  Frequency:                                             │
│  (●) Immediate (as changes occur)                      │
│  ( ) Daily digest                                      │
│  ( ) Weekly summary                                    │
│                                                         │
│  Alert Duration:                                        │
│  ( ) Until price list expires                          │
│  (●) Until I disable                                   │
│  ( ) For [30] days                                     │
│                                                         │
│  [Cancel]                  [Create Alert]              │
└─────────────────────────────────────────────────────────┘
```

### 5. Clone Price List Dialog

**Triggered by**: "Clone" button

**Modal**:
```
┌─────────────────────────────────────────────────────────┐
│  Clone Price List                                [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Source: Fresh Produce - Jan 2024 - ABC Foods          │
│  Reference: PL-2401-0001                                 │
│                                                         │
│  What to copy:                                          │
│  ☑ All products (125 items)                            │
│  ☑ Product pricing                                     │
│  ☑ Terms & conditions                                  │
│  ☐ Documents & attachments                             │
│  ☐ Comments                                             │
│                                                         │
│  New Price List Settings:                               │
│  Name: [Fresh Produce - Feb 2024 - ABC Foods___]      │
│  Vendor: [ABC Foods Inc. ▼] (can change)              │
│  Effective From: [📅 02/01/2024]                       │
│  Effective To: [📅 05/01/2024]                         │
│                                                         │
│  Pricing Adjustment:                                    │
│  (●) Keep same prices                                  │
│  ( ) Increase all by: [5]%                             │
│  ( ) Decrease all by: [___]%                            │
│  ( ) Clear all prices (manual re-entry)                │
│                                                         │
│  ☑ Open in edit mode after cloning                     │
│                                                         │
│  [Cancel]            [Clone Price List]                │
└─────────────────────────────────────────────────────────┘
```

---

## Responsive Design

### Mobile Adaptations (<768px)

**Summary Card**:
- Stacks vertically (1 column)
- Collapsible sections
- Swipe gesture to show/hide sections

**Tabs**:
- Horizontal scroll with indicators
- Tab icons only (hide labels on mobile)
- Swipe between tabs

**Product Table**:
- Switches to card view automatically
- Key info only (name, price, change%)
- Tap to expand full details

**Action Buttons**:
- Collapse into "Actions" dropdown menu
- Floating action button (FAB) for primary action
- Bottom sheet for secondary actions

**Dialogs**:
- Full-screen on mobile
- Slide-up animation
- Back button in header

### Tablet Adaptations (768px-1023px)

**Summary Card**:
- 2-column grid
- Compact spacing

**Tabs**:
- All tabs visible with wrapping if needed
- Icon + label

**Product Table**:
- Reduced columns (hide non-essential)
- Horizontal scroll for remaining columns

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- **Tab**: Move focus through interactive elements
- **Shift+Tab**: Move focus backward
- **Enter**: Activate buttons, links
- **Space**: Toggle checkboxes, switches
- **Esc**: Close dialogs, cancel operations
- **←→**: Navigate tabs
- **↑↓**: Navigate dropdowns, lists
- **Home/End**: Jump to start/end of lists

### Screen Reader Support
- Semantic HTML (header, nav, main, aside, article)
- ARIA labels on all interactive elements
- ARIA live regions for dynamic updates
- ARIA expanded/collapsed states
- Form labels associated with inputs
- Table headers (th) with scope attributes
- Alt text on all images and icons

### Visual Accessibility
- Color contrast ratio ≥ 4.5:1 (text)
- Color contrast ratio ≥ 3:1 (UI components)
- Focus indicators visible (2px blue outline)
- No reliance on color alone (use icons + text)
- Text resize up to 200% without loss of functionality
- Clear visual hierarchy (headings, spacing)

### Focus Management
- Logical tab order
- Focus trap in modals
- Return focus after modal close
- Skip links for main content
- Visible focus indicator throughout

---

## Performance Optimization

### Loading Strategies
- **Initial Load**: Critical CSS inline, defer JavaScript
- **Code Splitting**: Lazy load tabs on demand
- **Data Fetching**: Pagination for large lists (50 items/page)
- **Images**: Lazy load, WebP format, responsive sizes
- **Target**: <2s LCP, <100ms FID, <0.1 CLS

### Caching
- Price list data: 5 minutes TTL
- Product catalog: 10 minutes TTL
- User permissions: Session storage
- Static assets: Browser cache (1 year)

### Optimizations
- Debounced search (300ms)
- Throttled scroll events (100ms)
- Virtual scrolling for large tables (>100 rows)
- Optimistic UI updates
- Background API calls

---

## Security Considerations

### Authorization
- **View**: Requires price list read permission
- **Edit**: Requires price list edit permission + Draft/Pending status
- **Approve**: Requires approval permission + assigned as approver
- **Delete**: Requires delete permission + Draft/Rejected status
- **Export**: Requires export permission (audit logged)

### Data Protection
- Pricing data access logged
- Audit trail for all changes
- Sensitive fields encrypted (vendor contacts)
- GDPR compliance (data retention, right to delete)
- PII handling (vendor contact info masked for unauthorized users)

### Input Validation
- Client-side: Format, length, required fields
- Server-side: Re-validate, SQL injection prevention, XSS prevention
- File uploads: Type, size, content validation
- Rate limiting on API endpoints

---

## Analytics & Tracking

### Page Events
- `pricelist_detail_viewed` - User views detail page
- `tab_switched` - User switches tabs
- `product_edited` - User edits product pricing
- `approval_action` - User approves/rejects
- `export_generated` - User exports price list
- `comment_added` - User adds comment
- `price_compared` - User compares prices

### Performance Metrics
- Time to interactive (TTI)
- Tab switch latency
- Product table render time
- Export generation time
- API response times

### User Behavior
- Most viewed tabs
- Most used actions
- Average time on page
- Approval decision time
- Export format preferences

---

## Error Handling

### Network Errors
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Connection Error                                     │
│  Unable to load price list data.                        │
│  [Retry] [Refresh Page]                                │
└─────────────────────────────────────────────────────────┘
```

### Permission Errors
```
┌─────────────────────────────────────────────────────────┐
│  🔒 Access Denied                                        │
│  You don't have permission to view this price list.     │
│  Contact your administrator to request access.          │
│  [Back to List]                                         │
└─────────────────────────────────────────────────────────┘
```

### Not Found
```
┌─────────────────────────────────────────────────────────┐
│  ❌ Price List Not Found                                 │
│  The price list you're looking for doesn't exist or     │
│  has been deleted.                                       │
│  Reference: PL-2401-0001                                 │
│  [Back to Price Lists]                                  │
└─────────────────────────────────────────────────────────┘
```

### Validation Errors
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Validation Error                                     │
│  Cannot save changes:                                    │
│  • Effective end date must be after start date          │
│  • 5 required products missing prices                   │
│  [Fix Issues]                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-23 | Initial comprehensive specification |

---

**End of Document**

Total Lines: 1,947
Total Sections: 50+
Total Dialogs: 8+
Total UI Components: 200+
Word Count: ~20,000+
