# Page Content: Campaign Detail Page

## Document Information
- **Module**: Vendor Management
- **Sub-Module**: Vendor Portal / Price Collection
- **Page**: Campaign Detail (Staff-Facing)
- **Route**: `/vendor-management/campaigns/{campaignId}`
- **Version**: 2.0.0
- **Last Updated**: 2025-01-23
- **Owner**: UX/Content Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.0.0 | 2025-01-23 | System | Initial version based on UC v2.0, TS v2.0, FD v2.0 |

---

## Overview

**Page Purpose**: Monitor campaign progress, manage vendor submissions, send reminders, and analyze pricing data for a specific price collection campaign.

**User Personas**: Procurement Staff, Purchasing Managers, Department Managers

**Related Documents**:
- [Business Requirements](../BR-vendor-portal.md)
- [Use Cases](../UC-vendor-portal.md) - UC-VPP-011, UC-VPP-012
- [Technical Specification](../TS-vendor-portal.md)
- [Flow Diagrams](../FD-vendor-portal.md)
- [PC Campaign List](./PC-campaign-list.md)
- [PC Submission Review](./PC-submission-review.md)

---

## Page Header

### Page Title
**Layout**: Campaign name with status badge

```
Q1 2024 Kitchen Equipment Pricing  🟢 Active
```

**Status Badge Colors**:
- Draft: Gray (📝)
- Active: Green (🟢)
- Paused: Yellow (⏸️)
- Completed: Blue (✅)
- Cancelled: Red (❌)

### Breadcrumb
**Text**: Home / Vendor Management / Campaigns / {Campaign Name}
**Location**: Above page title
**Interactive**: All previous levels are clickable links

### Campaign ID & Metadata
**Location**: Below title
**Format**:
```
Campaign ID: CAM-2401-001234 • Created by John Doe on 10 Jan 2024 • Last updated 2 hours ago
```

---

### Header Actions
| Button Label | Purpose | Style | Visibility Rules | Icon |
|--------------|---------|-------|------------------|------|
| Edit Campaign | Edit campaign settings | Secondary (white with border) | Status = Draft or Active AND user is creator | ✏️ |
| Pause Campaign | Temporarily suspend | Secondary (yellow outline) | Status = Active | ⏸️ |
| Resume Campaign | Reactivate paused campaign | Secondary (blue outline) | Status = Paused | ▶️ |
| Send Reminders | Send reminder emails now | Secondary (blue outline) | Status = Active | 📧 |
| Export Report | Download analytics | Secondary (white with border) | Always | 📊 |
| More Actions | Additional menu | Secondary (white with border) | Always | ⋯ |

**More Actions Dropdown**:
```
┌─────────────────────────┐
│ Duplicate Campaign      │
│ View as Vendor          │
│ Download Submissions    │
│ View Email Logs         │
│ ──────────────────────  │
│ Cancel Campaign         │
│ Delete Campaign (Draft) │
└─────────────────────────┘
```

---

## Campaign Progress Overview

### Progress Cards Row
**Layout**: 4 cards in horizontal row, responsive stack on mobile

#### Card 1: Submission Progress
```
┌──────────────────────────────────┐
│  Submissions                      │
│                                   │
│       8 of 12                     │
│    ████████░░░░ 67%               │
│                                   │
│  Expected completion: 2 days      │
└──────────────────────────────────┘
```
**Click Action**: Scroll to submissions list

---

#### Card 2: Response Rate
```
┌──────────────────────────────────┐
│  Response Rate                    │
│                                   │
│       75%                         │
│    🟢 Above average               │
│                                   │
│  9 of 12 vendors responded        │
└──────────────────────────────────┘
```
**Color Coding**:
- ≥80%: Green "Excellent"
- 60-79%: Blue "Above average"
- 40-59%: Yellow "Below average"
- <40%: Red "Low"

---

#### Card 3: Average Quality Score
```
┌──────────────────────────────────┐
│  Quality Score                    │
│                                   │
│       82/100                      │
│    ⭐⭐⭐⭐ Good                    │
│                                   │
│  Based on 8 submissions           │
└──────────────────────────────────┘
```
**Rating**:
- 90-100: ⭐⭐⭐⭐⭐ Excellent
- 75-89: ⭐⭐⭐⭐ Good
- 60-74: ⭐⭐⭐ Fair
- <60: ⭐⭐ Needs improvement

---

#### Card 4: Time Remaining
```
┌──────────────────────────────────┐
│  Time Remaining                   │
│                                   │
│       5 days                      │
│    ⏰ Ends 31 Jan                 │
│                                   │
│  Portal closes 17:00 PST          │
└──────────────────────────────────┘
```
**Color Coding** (based on days remaining):
- >7 days: Green
- 3-7 days: Yellow
- <3 days: Red with "Urgent" label

---

## Campaign Timeline

### Timeline Visualization
```
┌────────────────────────────────────────────────────────────────┐
│                     Campaign Timeline                           │
│                                                                 │
│  Created    Launched      Now         Deadline       Completed │
│    ●──────────●────────────▼────────────●──────────────○       │
│  10 Jan    15 Jan       23 Jan       31 Jan         TBD        │
│                                                                 │
│  ├─ Setup: 5 days                                              │
│  ├─ Active: 8 days (50%)                                       │
│  └─ Remaining: 8 days                                          │
└────────────────────────────────────────────────────────────────┘
```

**Timeline Events**:
```
Recent Activity:
• 2 hours ago: New submission from Global Foodservice Equipment
• 5 hours ago: Reminder sent to 4 vendors
• Yesterday: ABC Kitchen Supplies submitted pricelist
• 2 days ago: Premium Restaurant Supply submitted pricelist
```

**Upcoming Events**:
```
Scheduled:
• In 2 days: Automated reminder (3 days before deadline)
• In 5 days: Campaign deadline (31 Jan, 17:00)
• In 5 days: Portal access expires automatically
```

---

## Tab Navigation

### Main Tabs
| Tab Label | Purpose | Badge | Default |
|-----------|---------|-------|---------|
| Overview | Campaign summary and metrics | - | ✓ |
| Submissions | Vendor submission list | Count (e.g., "8") | |
| Vendors | Invited vendor list | - | |
| Analytics | Charts and insights | - | |
| Settings | Campaign configuration | - | |
| Activity Log | Audit trail | - | |

**Tab Styles**:
- Active: Blue underline, bold text
- Inactive: Gray text, hover underline

---

## Tab 1: Overview (Default)

### Key Metrics Section
**Already displayed in Progress Cards above**

---

### Submission Status Breakdown

**Section Title**: Submission Status

**Visual**: Horizontal stacked bar chart
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│ ███████ Completed (7)  ███ In Progress (2)  █ Not Started (3)│
│   58%                    17%                  25%            │
└─────────────────────────────────────────────────────────────┘
```

**Status Categories**:
| Status | Count | Percentage | Color | Description |
|--------|-------|------------|-------|-------------|
| Completed | 7 | 58% | Green | Submitted and approved |
| In Progress | 2 | 17% | Blue | Draft saved, not submitted |
| Not Started | 3 | 25% | Gray | No portal access yet |
| Rejected | 0 | 0% | Red | Submitted but needs revision |

**Click Status**: Filter submissions by status

---

### Vendor Performance List

**Section Title**: Vendor Submissions

**List Header**:
```
☑ Sort by: Status ▼        [Search vendors...]        [Send Selected Reminders]
```

**Sort Options**:
- Status (default)
- Vendor name
- Submission date
- Quality score
- Response time

---

**Vendor Cards**:

```
┌─────────────────────────────────────────────────────────────┐
│ ☑ ABC Kitchen Supplies                                      │
│    contact@abckitchen.com                                   │
│                                                              │
│    Status: ✅ Completed • Quality: 88/100 ⭐⭐⭐⭐          │
│    Submitted: 21 Jan 2024, 14:23 (2 days ago)               │
│    Response Time: 6 days (Expected: 8 days)                 │
│                                                              │
│    Products Priced: 20/20 (100%)                            │
│    MOQ Tiers: 8 products • FOC: 2 products                  │
│                                                              │
│    [View Submission →]  [Download PDF]  [Send Message]     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ☑ Global Foodservice Equipment                              │
│    sales@globalfood.com                                     │
│                                                              │
│    Status: 📝 In Progress • Quality: Pending                │
│    Last Activity: 2 hours ago                                │
│    Portal Accessed: 5 times (first: 16 Jan)                 │
│                                                              │
│    Products Priced: 15/20 (75%)                             │
│    Draft saved: 2 hours ago                                 │
│                                                              │
│    [View Draft →]  [Send Reminder]  [Send Message]         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ☑ Premium Restaurant Supply                                 │
│    sales@premiumrest.com                                    │
│                                                              │
│    Status: ⏳ Not Started • Quality: N/A                    │
│    Invitation: Sent 15 Jan, not accessed                    │
│    Last Reminder: 3 days ago                                 │
│                                                              │
│    Portal Access: Never                                      │
│    Email Status: Delivered ✓                                │
│                                                              │
│    [Resend Invitation]  [Send Reminder]  [Call Vendor]     │
└─────────────────────────────────────────────────────────────┘
```

**Card Sections**:
1. Vendor name (checkbox for bulk actions)
2. Contact email
3. Status badge with quality score
4. Submission/activity timestamp
5. Progress metrics
6. Action buttons

**Bulk Actions** (when vendors selected):
```
3 vendors selected

[Send Reminders]  [Download All]  [Export Selected]  [Deselect All]
```

---

### Quick Actions Panel

**Section Title**: Quick Actions
**Location**: Right sidebar (desktop), bottom (mobile)

```
┌─────────────────────────────────┐
│ Quick Actions                    │
│                                  │
│ [📧 Send Reminder to All]       │
│ [📊 Download Analytics Report]  │
│ [📥 Export All Submissions]     │
│ [📋 Duplicate Campaign]         │
│ [⏸️ Pause Campaign]             │
└─────────────────────────────────┘
```

**Action Descriptions**:
- Send Reminder to All: Email all vendors without submissions
- Download Analytics Report: PDF with charts and metrics
- Export All Submissions: Excel file with all pricing data
- Duplicate Campaign: Create new campaign with same settings
- Pause Campaign: Temporarily suspend vendor access

---

## Tab 2: Submissions

### Submissions List

**Section Title**: Vendor Submissions

**View Controls**:
```
View: (●) List  ( ) Grid  ( ) Comparison

Filter: [All Statuses ▼]  [All Vendors ▼]  [Quality Score ▼]

Sort by: [Submission Date ▼]  [Search submissions...]
```

---

### Submission List Items

```
┌─────────────────────────────────────────────────────────────┐
│ ABC Kitchen Supplies                                         │
│ Submitted: 21 Jan 2024, 14:23 • Reference: PL-2401-001234   │
│                                                              │
│ Status: ✅ Approved                                         │
│ Quality Score: 88/100 ⭐⭐⭐⭐                                │
│ Products: 20/20 (100%) • Completion: 100%                   │
│ Currency: USD • Valid: 1 Feb - 30 Apr 2024                  │
│                                                              │
│ Highlights:                                                  │
│ • 8 products with multi-tier MOQ pricing                    │
│ • 2 products with FOC promotional quantities                │
│ • Average lead time: 14 days                                │
│ • No validation errors or warnings                          │
│                                                              │
│ [📝 Review Details]  [📊 Compare Prices]  [📥 Download]    │
│ [✅ Approved by John Doe on 22 Jan 2024]                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Global Foodservice Equipment                                 │
│ Submitted: 23 Jan 2024, 09:15 • Reference: PL-2401-001237   │
│                                                              │
│ Status: 📋 Pending Review                                   │
│ Quality Score: 92/100 ⭐⭐⭐⭐⭐                              │
│ Products: 20/20 (100%) • Completion: 100%                   │
│ Currency: USD • Valid: 1 Feb - 31 Mar 2024                  │
│                                                              │
│ Highlights:                                                  │
│ • 12 products with multi-tier MOQ pricing                   │
│ • Detailed product notes and specifications                 │
│ • Excellent data quality                                     │
│ ⚠️ 3 products: prices 15% higher than previous period       │
│                                                              │
│ [📝 Review & Approve]  [📊 Compare Prices]  [📥 Download]  │
│ [⚠️ Needs Review]                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Premium Restaurant Supply                                    │
│ Submitted: 20 Jan 2024, 16:45 • Reference: PL-2401-001228   │
│                                                              │
│ Status: 🔄 Revision Requested                               │
│ Quality Score: 65/100 ⭐⭐⭐                                 │
│ Products: 17/20 (85%) • Completion: 85%                     │
│ Currency: USD • Valid: 1 Feb - Open-ended                   │
│                                                              │
│ Issues:                                                      │
│ ❌ 3 products missing pricing                               │
│ ⚠️ 2 products: invalid lead times (>365 days)              │
│ ⚠️ 5 products: no MOQ information                          │
│                                                              │
│ [📝 View Revision Notes]  [📧 Contact Vendor]  [📥 Download]│
│ [🔄 Rejected by Maria Garcia on 21 Jan - Revisions sent]  │
└─────────────────────────────────────────────────────────────┘
```

**Submission Status Icons**:
- ✅ Approved: Green
- 📋 Pending Review: Blue
- 🔄 Revision Requested: Yellow
- ❌ Rejected: Red
- 📝 Draft: Gray

---

### Submission Comparison View

**Trigger**: Click "Compare Prices" or toggle to Comparison view

**Layout**: Side-by-side table comparison

```
┌─────────────────────────────────────────────────────────────┐
│ Price Comparison - Premium Coffee Beans                      │
│                                                              │
│ Metric             │ ABC Kitchen │ Global Food │ Premium R. │
│────────────────────┼─────────────┼────────────┼────────────│
│ Base Price         │ $15.50/kg   │ $14.75/kg  │ $16.20/kg  │
│ MOQ Tier 1         │ 100kg@$15   │ 50kg@$14.5 │ N/A        │
│ MOQ Tier 2         │ 500kg@$14   │ 200kg@$14  │ N/A        │
│ Lead Time          │ 14 days     │ 7 days     │ 21 days    │
│ FOC                │ 1kg/100kg   │ None       │ None       │
│ Quality Score      │ 88/100      │ 92/100     │ 65/100     │
│────────────────────┼─────────────┼────────────┼────────────│
│ Winner             │             │ ✅ Best    │            │
└─────────────────────────────────────────────────────────────┘

Analysis:
• Global Foodservice Equipment offers lowest base price
• ABC Kitchen Supplies has best MOQ volume pricing
• Global Food has fastest lead time
• Premium Restaurant Supply missing MOQ tiers

[Export Comparison]  [View Next Product →]
```

---

## Tab 3: Vendors

### Vendors List

**Section Title**: Invited Vendors ({count})

**List Controls**:
```
[Search vendors...]  Filter by: [All Statuses ▼]  Sort: [Name ▼]

☑ Select All (12 vendors)    [Send Bulk Reminder]  [Export List]
```

---

**Vendor Detail Cards**:

```
┌─────────────────────────────────────────────────────────────┐
│ ☑ ABC Kitchen Supplies                                      │
│    contact@abckitchen.com • +1 234-567-8900                 │
│                                                              │
│    Invitation Status: ✅ Delivered • Accessed 6 times       │
│    Sent: 15 Jan 2024, 09:05 • First Access: 15 Jan, 10:23  │
│    Token Status: Active • Expires: 31 Jan, 17:00            │
│                                                              │
│    Submission: ✅ Completed (21 Jan)                        │
│    Quality: 88/100 • Response Time: 6 days                  │
│                                                              │
│    Historical Performance:                                   │
│    • Past Campaigns: 5 participated, 5 completed            │
│    • Average Response Rate: 95%                             │
│    • Average Quality Score: 86/100                          │
│    • Average Response Time: 7.2 days                        │
│                                                              │
│    [View Submission]  [View History]  [Send Message]       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ☑ Global Foodservice Equipment                              │
│    sales@globalfood.com • +1 345-678-9012                   │
│                                                              │
│    Invitation Status: ✅ Delivered • Accessed 5 times       │
│    Sent: 15 Jan 2024, 09:05 • First Access: 16 Jan, 08:14  │
│    Token Status: Active • Expires: 31 Jan, 17:00            │
│                                                              │
│    Submission: 📋 Pending Review (23 Jan)                   │
│    Quality: 92/100 • Response Time: 8 days                  │
│                                                              │
│    [Review Submission]  [View History]  [Send Message]     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ☑ Premium Restaurant Supply                                 │
│    sales@premiumrest.com • +1 456-789-0123                  │
│                                                              │
│    Invitation Status: ✅ Delivered • Never accessed         │
│    Sent: 15 Jan 2024, 09:05 • Reminders: 2 sent            │
│    Token Status: Active • Expires: 31 Jan, 17:00            │
│                                                              │
│    Submission: ⏳ Not Started                                │
│    Last Reminder: 3 days ago                                 │
│                                                              │
│    Email Log:                                                │
│    • 15 Jan: Invitation sent ✓ delivered                   │
│    • 18 Jan: Reminder sent ✓ delivered                     │
│    • 20 Jan: Reminder sent ✓ delivered                     │
│                                                              │
│    [Resend Invitation]  [Call Vendor]  [Remove from Campaign]│
└─────────────────────────────────────────────────────────────┘
```

---

### Vendor Invitation Timeline

**Section Title**: Invitation Timeline

```
Timeline of vendor invitations and activity:

15 Jan 2024, 09:05 - Campaign Launched
├─ Invitations sent to 12 vendors
├─ 10 of 12 delivered successfully
└─ 2 of 12 pending delivery

15 Jan 2024, 10:23 - First portal access
└─ ABC Kitchen Supplies accessed portal

16 Jan 2024 - Day 2
└─ 5 vendors accessed portal

18 Jan 2024 - First reminder
├─ Automated reminder sent to 7 vendors without submissions
└─ 6 of 7 delivered successfully

20 Jan 2024 - First submission
└─ Premium Restaurant Supply submitted (Quality: 65/100)

...continuing chronologically

23 Jan 2024 - Current
└─ 9 of 12 vendors have accessed portal
```

---

## Tab 4: Analytics

### Analytics Dashboard

**Section Title**: Campaign Analytics

---

#### Chart 1: Submission Timeline

**Chart Type**: Line chart with annotations

```
Submissions Over Time
     │
  12 │                                    ┌─ Expected
     │                               ╱───┘  (12 total)
  10 │                          ╱───╱
     │                     ╱───╱
   8 │                ╱───╱
     │           ╱───╱
   6 │      ╱───╱                         Actual
     │ ╱───╱                              (8 completed)
   4 │╱
     │
   2 │
     │
   0 └────┬────┬────┬────┬────┬────┬────┬
        15   17   19   21   23   25   27   29   31
        Jan (Start)                             (End)

Key Milestones:
• 20 Jan: First submission received
• 21 Jan: Peak submission day (3 submissions)
• 23 Jan: Current (8 of 12 complete, 67%)
• 31 Jan: Deadline (expected 11-12 submissions based on trend)
```

---

#### Chart 2: Quality Score Distribution

**Chart Type**: Bar chart

```
Quality Score Distribution

100-90 │████████ 3 vendors (38%)
89-75  │██████ 2 vendors (25%)
74-60  │████ 1 vendor (13%)
59-0   │██ 0 vendors (0%)
       └────────────────────────
        Not yet: 2 vendors (25%)

Average Quality: 82/100 ⭐⭐⭐⭐
Median Quality: 88/100
Highest: 92/100 (Global Foodservice Equipment)
Lowest: 65/100 (Premium Restaurant Supply)
```

---

#### Chart 3: Response Time Analysis

**Chart Type**: Scatter plot

```
Vendor Response Times
Days │
to   │
Submit
     │
  14 │                   ● Premium Restaurant Supply
     │
  12 │
     │
  10 │
     │
   8 │        ● Global Foodservice Equipment
     │
   6 │    ● ABC Kitchen Supplies
     │
   4 │
     │
   2 │
     │
   0 └────────────────────────────────────────
      0%        50%       100%
           Completion Percentage

Average Response Time: 7.3 days
Expected Campaign Completion: 31 Jan (on time)
Fastest: ABC Kitchen Supplies (6 days)
Slowest: Premium Restaurant Supply (14 days)
```

---

#### Metrics Cards

**Completion Metrics**:
```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│ Total Products      │ Products with       │ Average Products    │
│ Requested           │ ≥2 Vendor Quotes    │ per Submission      │
│                     │                     │                     │
│      20             │      18 (90%)       │      19.3           │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

**Pricing Insights**:
```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│ Products with       │ Products with       │ Average MOQ         │
│ MOQ Tiers           │ FOC Offers          │ Tiers per Product   │
│                     │                     │                     │
│      12 (60%)       │       5 (25%)       │      2.4            │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

---

#### Price Analysis Table

**Section Title**: Price Analysis by Product

```
Product Analysis - Top 5 Products by Quote Variance

Product              │Vendors│ Low Price  │ High Price │ Variance │Winner
─────────────────────┼───────┼────────────┼────────────┼──────────┼──────
Premium Coffee Beans │   3   │ $14.75/kg  │ $16.20/kg  │   9.8%   │Global
Chef's Knife Set     │   3   │ $45.00/set │ $52.00/set │  15.6%   │ABC
Cutting Boards       │   3   │ $12.50/ea  │ $15.00/ea  │  20.0%   │Global
Mixing Bowls         │   3   │ $8.00/set  │ $11.00/set │  37.5%   │Premium
Stock Pots (20L)     │   2   │ $89.00/ea  │ $95.00/ea  │   6.7%   │ABC

Average Price Variance: 17.9%
Products with >20% variance: 4 of 20 (flagged for review)

[Export Full Analysis →]
```

---

## Tab 5: Settings

### Campaign Configuration

**Section Title**: Campaign Settings
**Description**: Review and modify campaign configuration

**Edit Mode Toggle**:
```
[View Mode] / [Edit Mode]   [Save Changes]  [Discard]
```

---

#### Campaign Information
```
┌─────────────────────────────────────────────────────────────┐
│ Campaign Information                          [Edit →]       │
│                                                              │
│ Campaign Name:                                               │
│ Q1 2024 Kitchen Equipment Pricing                           │
│                                                              │
│ Description:                                                 │
│ Quarterly price collection for all kitchen equipment...     │
│                                                              │
│ Type: One-Time                                               │
│ Priority: High ⚠️                                            │
│ Tags: Kitchen Equipment, Q1 2024                            │
│                                                              │
│ Created: 10 Jan 2024 by John Doe                            │
│ Last Modified: 15 Jan 2024 by John Doe                      │
└─────────────────────────────────────────────────────────────┘
```

---

#### Schedule Configuration
```
┌─────────────────────────────────────────────────────────────┐
│ Campaign Schedule                             [Edit →]       │
│                                                              │
│ Campaign Type: One-Time                                      │
│                                                              │
│ Start: 15 Jan 2024, 09:00 PST                               │
│ End: 31 Jan 2024, 17:00 PST                                 │
│ Duration: 16 days, 8 hours                                   │
│                                                              │
│ Portal Access: 16 days                                       │
│ Status: Active (5 days remaining)                           │
│                                                              │
│ Time Zone: Pacific Standard Time (PST, UTC-8)               │
└─────────────────────────────────────────────────────────────┘
```

**Edit Controls** (when in edit mode):
- Extend deadline (if campaign active)
- Change priority
- Update tags
- Modify notification settings
- Cannot change: Campaign type, start date (if started), template

---

#### Template Configuration
```
┌─────────────────────────────────────────────────────────────┐
│ Pricelist Template                        [Preview →]       │
│                                                              │
│ Template: Kitchen Equipment Template                        │
│ Products: 20 items                                           │
│ Categories: Cookware (8), Appliances (7), Tools (5)        │
│ Custom Fields: Lead Time, Certifications                   │
│                                                              │
│ Submission Methods Allowed:                                  │
│ ✓ Online Entry                                              │
│ ✓ Excel Upload                                              │
│ ✗ API Integration                                           │
└─────────────────────────────────────────────────────────────┘
```

---

#### Vendor List Configuration
```
┌─────────────────────────────────────────────────────────────┐
│ Invited Vendors (12)                      [Manage →]        │
│                                                              │
│ • ABC Kitchen Supplies                                      │
│ • Global Foodservice Equipment                              │
│ • Premium Restaurant Supply                                 │
│ • ...and 9 more vendors                                     │
│                                                              │
│ [View All Vendors]  [Add Vendors]  [Remove Vendors]        │
└─────────────────────────────────────────────────────────────┘
```

**Actions**:
- Add vendors (if campaign active): Send new invitations
- Remove vendors: Revoke portal access
- Resend invitations: Generate new tokens

---

#### Notification Settings
```
┌─────────────────────────────────────────────────────────────┐
│ Notification Settings                     [Edit →]          │
│                                                              │
│ Automatic Reminders: Enabled ✓                             │
│ • 7 days before deadline                                    │
│ • 3 days before deadline                                    │
│ • 1 day before deadline                                     │
│                                                              │
│ Escalation: Disabled                                         │
│                                                              │
│ Email Recipients:                                            │
│ • Submission received: john.doe@company.com                 │
│ • Campaign milestones: john.doe@company.com                 │
│ • Daily summary: john.doe@company.com                       │
│                                                              │
│ [Test Email Notifications →]                                │
└─────────────────────────────────────────────────────────────┘
```

---

#### Approval Settings
```
┌─────────────────────────────────────────────────────────────┐
│ Approval Workflow                         [Edit →]          │
│                                                              │
│ Approval Required: Yes ✓                                    │
│ Approver: John Doe (Procurement Manager)                   │
│                                                              │
│ Auto-Approval Rules:                                         │
│ • Quality score ≥90: Auto-approve                          │
│ • Trusted vendors (5+ campaigns): Auto-approve             │
│ • Value <$10,000: Auto-approve                             │
│                                                              │
│ Approval Statistics:                                         │
│ • Pending: 2 submissions                                    │
│ • Approved: 6 submissions                                   │
│ • Rejected: 0 submissions                                   │
│                                                              │
│ Average Review Time: 1.2 days                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab 6: Activity Log

### Audit Trail

**Section Title**: Campaign Activity Log

**Filters**:
```
[All Activities ▼]  [All Users ▼]  [Date Range ▼]  [Search...]
```

**Activity Types**:
- Campaign events
- Vendor actions
- System events
- Email notifications
- Approval actions
- Data changes

---

**Activity Log Entries**:

```
┌─────────────────────────────────────────────────────────────┐
│ 23 Jan 2024, 09:15 PST                                      │
│ Submission Received                                          │
│                                                              │
│ Global Foodservice Equipment submitted pricelist            │
│ • Reference: PL-2401-001237                                 │
│ • Quality Score: 92/100                                     │
│ • Products: 20/20 (100% complete)                           │
│ • Method: Online Entry                                       │
│                                                              │
│ IP: 192.168.1.100 • User Agent: Chrome 120/MacOS           │
│ [View Submission]                                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 22 Jan 2024, 10:05 PST                                      │
│ Approval Action                                              │
│                                                              │
│ John Doe approved submission from ABC Kitchen Supplies      │
│ • Reference: PL-2401-001234                                 │
│ • Approval Notes: "Pricing is competitive and complete"    │
│ • Quality Score: 88/100                                     │
│                                                              │
│ IP: 10.0.0.25 • User: john.doe@company.com                 │
│ [View Submission]  [View Approval Details]                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 21 Jan 2024, 18:30 PST                                      │
│ Email Notification                                           │
│                                                              │
│ Reminder sent to 4 vendors (3 days before deadline)         │
│ • Recipients: Premium Restaurant Supply, ...and 3 more      │
│ • Template: Standard Reminder                               │
│ • Delivery: 4 sent, 4 delivered, 0 failed                  │
│                                                              │
│ [View Email Log]  [View Email Content]                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 20 Jan 2024, 16:45 PST                                      │
│ Revision Requested                                           │
│                                                              │
│ Maria Garcia requested revisions from Premium Restaurant     │
│ • Reference: PL-2401-001228                                 │
│ • Issues: 3 products missing pricing, 2 invalid lead times  │
│ • Revision Notes: "Please provide pricing for all products" │
│                                                              │
│ IP: 10.0.0.30 • User: maria.garcia@company.com             │
│ [View Submission]  [View Revision Details]                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 15 Jan 2024, 09:05 PST                                      │
│ Campaign Launched                                            │
│                                                              │
│ John Doe launched campaign                                   │
│ • Campaign ID: CAM-2401-001234                              │
│ • Vendors: 12 invitations sent                              │
│ • Duration: 16 days (15 Jan - 31 Jan)                       │
│ • Template: Kitchen Equipment Template                      │
│                                                              │
│ IP: 10.0.0.25 • User: john.doe@company.com                 │
│ [View Campaign Settings]                                    │
└─────────────────────────────────────────────────────────────┘
```

**Activity Entry Structure**:
1. Timestamp
2. Activity type badge
3. Activity description
4. Relevant details and metadata
5. User/IP information
6. Action links

**Export Options**:
```
[Export Log]  [Download PDF Report]  [Subscribe to Updates]
```

---

## Dialogs/Modals

### Dialog 1: Send Reminders

#### Dialog Header
**Title**: Send Reminder Emails
**Close Button**: X icon

#### Dialog Body

**Recipient Selection**:
```
Send reminders to:

☑ Vendors without submissions (3)
  • Premium Restaurant Supply
  • Luxury Food Distributors
  • Quality Kitchen Imports

☐ Vendors with incomplete drafts (2)
  • Global Foodservice Equipment (75% complete)
  • Budget Supplies Co (45% complete)

☐ All vendors (12)

Email Template: [Standard Reminder ▼]
```

**Email Preview**:
```
Subject: Reminder: Q1 2024 Kitchen Equipment Pricing - 5 Days Remaining

Dear [Vendor Name],

This is a friendly reminder that the Q1 2024 Kitchen Equipment
Pricing campaign will close in 5 days on 31 Jan 2024 at 17:00 PST.

Current Status: Not Started
Products to Price: 20 items

Please submit your pricing at your earliest convenience:
[Access Portal Link]

Questions? Contact: john.doe@company.com

Best regards,
Carmen Procurement Team
```

**Custom Message** (optional):
```
Add custom message:
[_________________________________________________]
[_________________________________________________]
```

#### Dialog Footer
| Button Label | Type | Action |
|--------------|------|--------|
| Send Reminders | Primary (blue solid) | Send emails to selected vendors |
| Cancel | Secondary (gray outline) | Close dialog |

---

### Dialog 2: Pause Campaign

#### Dialog Header
**Title**: Pause Campaign?
**Icon**: ⏸️
**Close Button**: X icon

#### Dialog Body

**Warning**:
```
⚠️ Pausing this campaign will:
• Immediately disable vendor access to the portal
• Suspend auto-save functionality for in-progress submissions
• Pause all automated reminder emails
• Preserve all submitted and draft pricelists

You can resume the campaign at any time.
```

**Current Activity**:
```
Campaign Activity:
• Active vendors: 4 currently accessing portal
• In-progress drafts: 2 with unsaved changes
• Pending submissions: 3 expected

These vendors will lose access immediately.
```

**Pause Options**:
```
Resume options:
( ) Manual (I will resume when ready)
( ) Scheduled: [DD/MM/YYYY] at [HH:MM]
```

**Notification**:
```
☑ Send notification email to vendors about pause
☑ Include expected resume date (if scheduled)
```

#### Dialog Footer
| Button Label | Type | Action |
|--------------|------|--------|
| Pause Campaign | Primary (yellow solid) | Pause immediately |
| Cancel | Secondary (gray outline) | Close dialog |

---

### Dialog 3: Approve Submission

#### Dialog Header
**Title**: Approve Pricelist Submission
**Close Button**: X icon

#### Dialog Body

**Submission Summary**:
```
Vendor: Global Foodservice Equipment
Reference: PL-2401-001237
Submitted: 23 Jan 2024, 09:15

Quality Score: 92/100 ⭐⭐⭐⭐⭐
Products: 20/20 (100%)
Validity: 1 Feb - 31 Mar 2024
```

**Review Checklist**:
```
Pre-Approval Checklist:
✅ All required products priced
✅ Pricing is within acceptable range
✅ Quality score meets minimum (70/100)
✅ Lead times are reasonable
✅ No validation errors
✅ Currency is correct (USD)

Warnings:
⚠️ 3 products have prices 15% higher than previous period
   (within acceptable threshold of 20%)
```

**Approval Notes** (optional):
```
Approval Notes:
[_________________________________________________]
[_________________________________________________]
(These notes will be saved in the audit log)
```

**Auto-Actions**:
```
☑ Notify vendor of approval via email
☑ Add approved prices to vendor pricelist history
☐ Update product price database
```

#### Dialog Footer
| Button Label | Type | Action |
|--------------|------|--------|
| Approve Pricelist | Primary (green solid) | Approve and notify |
| Request Revisions | Secondary (yellow outline) | Open revision dialog |
| Reject | Destructive (red outline) | Open rejection dialog |
| Cancel | Secondary (gray outline) | Close dialog |

---

### Dialog 4: Request Revisions

#### Dialog Header
**Title**: Request Revisions
**Close Button**: X icon

#### Dialog Body

**Submission Details**:
```
Vendor: Premium Restaurant Supply
Reference: PL-2401-001228
Submitted: 20 Jan 2024, 16:45
```

**Issues Detected**:
```
Validation Issues Found:
❌ 3 products missing pricing:
   • Chef's Knife Set (PROD-00124)
   • Cutting Boards (PROD-00125)
   • Mixing Bowls (PROD-00126)

⚠️ 2 products with invalid lead times:
   • Stock Pots: 400 days (exceeds 365 day maximum)
   • Sauce Pans: 380 days (exceeds 365 day maximum)

⚠️ 5 products missing MOQ information (recommended)
```

**Revision Notes** (required):
```
Revision Request Message to Vendor:
[_________________________________________________]
[_________________________________________________]
[_________________________________________________]

Template Suggestions:
• Please provide pricing for all 20 products
• Lead times must not exceed 365 days
• MOQ tiers are recommended for volume discounts
```

**Deadline Extension**:
```
☐ Extend submission deadline by [7▼] days
  (New deadline: 7 Feb 2024, 17:00)
```

#### Dialog Footer
| Button Label | Type | Action |
|--------------|------|--------|
| Send Revision Request | Primary (yellow solid) | Send to vendor with email notification |
| Cancel | Secondary (gray outline) | Close dialog |

---

## Status Messages

### Success Messages
| Trigger | Message | Duration |
|---------|---------|----------|
| Reminder sent | ✓ Reminders sent to {count} vendors | 3s |
| Submission approved | ✓ Pricelist approved. Vendor notified via email. | 3s |
| Revision requested | ✓ Revision request sent to vendor | 3s |
| Campaign paused | ✓ Campaign paused. Vendor access disabled. | 3s |
| Campaign resumed | ✓ Campaign resumed. Vendor access restored. | 3s |
| Settings updated | ✓ Campaign settings updated successfully | 3s |
| Export completed | ✓ Report exported successfully | 3s |

### Error Messages
| Error Type | Message | Recovery |
|------------|---------|----------|
| Load failed | ✗ Unable to load campaign data. Please refresh. | [Retry] |
| Update failed | ✗ Unable to update campaign. Please try again. | [Retry] [Discard] |
| Email failed | ✗ Unable to send reminders to some vendors. See details. | [View Details] [Retry] |
| Export failed | ✗ Export failed. Please try again or contact support. | [Retry] |

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| High price variance | ⚠️ Some products have prices >20% higher than previous period | [View Details] [Approve Anyway] |
| Low quality score | ⚠️ Quality score below minimum threshold (70/100). Review recommended. | [Review] [Approve Anyway] |
| Missing products | ⚠️ {count} products not priced. Request revisions? | [Request Revisions] [Approve Partial] |

---

## Loading States

### Loading Messages
| Context | Message | Visual |
|---------|---------|--------|
| Initial load | Loading campaign details... | Skeleton layout |
| Refresh | Refreshing data... | Top progress bar |
| Export | Preparing export... {percentage}% | Progress dialog |
| Send emails | Sending reminders... {count} of {total} | Progress bar |

---

## Accessibility

### ARIA Labels
| Element | ARIA Label |
|---------|------------|
| Tab navigation | Navigate to {tab name} |
| Submission card | Vendor submission: {vendor name}, status {status} |
| Approve button | Approve pricelist from {vendor name} |
| Reminder button | Send reminder to {vendor name} |

---

## Appendix

### Related Pages
- [PC-campaign-list.md](./PC-campaign-list.md) - Campaign list
- [PC-campaign-create.md](./PC-campaign-create.md) - Create campaign
- [PC-vendor-portal-submission.md](./PC-vendor-portal-submission.md) - Vendor view
- PC-submission-review.md - Submission review details (to be created)

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-01-23 | Initial version | Created from UC v2.0, TS v2.0, FD v2.0 | System |

---

**Document End**
