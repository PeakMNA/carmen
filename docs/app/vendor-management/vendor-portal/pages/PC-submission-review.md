# Page Content: Submission Review Detail Page

## Document Information
- **Module**: Vendor Management
- **Sub-Module**: Vendor Portal / Price Collection
- **Page**: Submission Review (Staff-Facing)
- **Route**: `/vendor-management/campaigns/{campaignId}/submissions/{submissionId}`
- **Version**: 2.0.0
- **Last Updated**: 2025-01-23
- **Owner**: UX/Content Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.0.0 | 2025-01-23 | System | Initial version based on UC-VPP-011, UC-VPP-012 |

---

## Overview

**Page Purpose**: Review vendor pricelist submissions in detail, analyze pricing data, compare with other vendors, and approve or request revisions.

**User Personas**: Procurement Staff, Purchasing Managers, Approvers

**Related Documents**:
- [Use Cases](../UC-vendor-portal.md) - UC-VPP-011, UC-VPP-012
- [Technical Specification](../TS-vendor-portal.md)
- [Validation Specification](../VAL-vendor-portal.md)
- [PC Campaign Detail](./PC-campaign-detail.md)

---

## Page Header

### Submission Title
**Layout**: Vendor name with status badge

```
ABC Kitchen Supplies - Pricelist Submission  ✅ Approved
```

**Status Badge Colors**:
- Draft: Gray (📝)
- Submitted: Blue (📋)
- Pending Review: Blue (📋)
- Approved: Green (✅)
- Revision Requested: Yellow (🔄)
- Rejected: Red (❌)

### Breadcrumb
**Text**: Home / Campaigns / {Campaign Name} / Submissions / {Vendor Name}
**Interactive**: All previous levels clickable

### Submission Metadata
**Format**:
```
Reference: PL-2401-001234 • Submitted: 21 Jan 2024, 14:23 • Quality Score: 88/100 ⭐⭐⭐⭐
```

---

### Header Actions
| Button Label | Purpose | Style | Visibility Rules | Icon |
|--------------|---------|-------|------------------|------|
| Approve | Approve submission | Primary (green solid) | Status = Pending Review | ✅ |
| Request Revisions | Request changes | Secondary (yellow outline) | Status = Pending Review | 🔄 |
| Reject | Reject submission | Destructive (red outline) | Status = Pending Review | ❌ |
| Compare Prices | Compare with other vendors | Secondary (blue outline) | Always | 📊 |
| Download PDF | Export submission | Secondary (white border) | Always | 📥 |
| Contact Vendor | Send message | Secondary (white border) | Always | 📧 |
| More Actions | Additional menu | Secondary (white border) | Always | ⋯ |

**More Actions Dropdown**:
```
┌──────────────────────────────┐
│ Download Excel               │
│ Print Submission             │
│ View Audit Log               │
│ View Email History           │
│ ────────────────────────────  │
│ Revert Approval (if approved)│
│ Delete Draft (if draft)      │
└──────────────────────────────┘
```

---

## Submission Overview Card

### Summary Information
```
┌─────────────────────────────────────────────────────────────┐
│ Submission Overview                                          │
│                                                              │
│ Vendor:  ABC Kitchen Supplies                               │
│          contact@abckitchen.com • +1 234-567-8900           │
│                                                              │
│ Campaign: Q1 2024 Kitchen Equipment Pricing                 │
│          CAM-2401-001234 • 20 products                      │
│                                                              │
│ Submission:                                                  │
│ • Reference: PL-2401-001234                                 │
│ • Submitted: 21 Jan 2024, 14:23 (2 days ago)                │
│ • Response Time: 6 days (Expected: 8 days) 🟢              │
│ • Method: Online Entry                                       │
│ • Currency: USD                                              │
│ • Valid Period: 1 Feb 2024 - 30 Apr 2024                   │
│                                                              │
│ Quality Metrics:                                             │
│ • Overall Score: 88/100 ⭐⭐⭐⭐                              │
│ • Completeness: 100% (20/20 products)                       │
│ • Data Quality: Excellent                                    │
│ • Validation: 0 errors, 0 warnings                          │
│                                                              │
│ Approval Status:                                             │
│ ✅ Approved by John Doe on 22 Jan 2024, 10:05              │
│ Notes: "Pricing is competitive and complete"                │
└─────────────────────────────────────────────────────────────┘
```

---

## Quality Score Breakdown

### Score Card
```
┌─────────────────────────────────────────────────────────────┐
│ Quality Score: 88/100 ⭐⭐⭐⭐ Good                           │
│                                                              │
│ Component Breakdown:                                         │
│                                                              │
│ Completeness (40%):  ████████████ 100%  (40/40 points)     │
│ • All 20 products priced                                    │
│ • All required fields completed                             │
│                                                              │
│ Accuracy (30%):      ██████████   83%   (25/30 points)     │
│ • Prices within acceptable range                            │
│ • Valid MOQ tier structure                                  │
│ • 2 products flagged for price variance review              │
│                                                              │
│ Detail (20%):        █████████    90%   (18/20 points)     │
│ • 8 products with multi-tier MOQ pricing                    │
│ • 2 products with FOC promotional quantities                │
│ • Detailed product notes provided                           │
│                                                              │
│ Timeliness (10%):    █████████    50%   (5/10 points)      │
│ • Submitted 6 days after campaign start                     │
│ • 10 days before deadline                                   │
│                                                              │
│ [View Detailed Scoring Logic →]                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab Navigation

### Main Tabs
| Tab Label | Purpose | Badge | Default |
|-----------|---------|-------|---------|
| Products & Pricing | Product list with pricing details | - | ✓ |
| Validation Results | Errors and warnings | Count if >0 | |
| Price Comparison | Compare with other vendors | - | |
| Submission History | Version history and changes | - | |
| Vendor Information | Vendor profile and metrics | - | |
| Documents | Attachments and Excel files | Count | |

---

## Tab 1: Products & Pricing (Default)

### View Controls
```
View: (●) Table  ( ) Cards  ( ) Grid

Show: [All Products ▼]  [All Categories ▼]  Sort: [Product Code ▼]

[Search products...]  [Export to Excel]
```

---

### Product Pricing Table

**Table Headers**:
| Column | Sortable | Width | Sticky |
|--------|----------|-------|--------|
| Product Code | Yes | 120px | Yes |
| Product Name | Yes | 200px | No |
| Category | Yes | 120px | No |
| Base Price | Yes | 120px | No |
| MOQ Tiers | No | 250px | No |
| Lead Time | Yes | 100px | No |
| FOC | No | 150px | No |
| Notes | No | 200px | No |
| Flags | No | 80px | No |

---

### Product Row (Expandable)

**Collapsed State**:
```
┌─────────────────────────────────────────────────────────────┐
│ ▼ PROD-00123  Premium Coffee Beans       Beverages          │
│                                                              │
│    $15.50/kg   2 tiers   14 days   1kg/100kg FOC    🟢     │
└─────────────────────────────────────────────────────────────┘
```

**Expanded State**:
```
┌─────────────────────────────────────────────────────────────┐
│ ▼ PROD-00123  Premium Coffee Beans       Beverages          │
│                                                              │
│ Product Details:                                             │
│ • Category: Beverages > Coffee                              │
│ • Description: Premium Arabica coffee beans, roasted       │
│ • Order Unit: Kilogram (kg)                                 │
│                                                              │
│ Pricing Information:                                         │
│                                                              │
│ Base Price: $15.50 per kg                                   │
│ Currency: USD                                                │
│ Lead Time: 14 days                                           │
│                                                              │
│ MOQ Pricing Tiers:                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Tier │ MOQ    │ Unit │ Unit Price │ Per    │ Lead Time │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │  1   │ 100 kg │ kg   │ $15.00     │ per kg │ 14 days   │ │
│ │  2   │ 500 kg │ kg   │ $14.00     │ per kg │ 14 days   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ Free of Charge (FOC):                                        │
│ • Quantity: 1 kg free per 100 kg ordered                    │
│ • Promotional offer valid during pricelist period           │
│                                                              │
│ Vendor Notes:                                                │
│ "Organic certified, fair trade. Volume discounts available  │
│ for orders >1000kg. Rush delivery available for 20% surcharge."│
│                                                              │
│ Validation Status: ✅ No errors or warnings                 │
│                                                              │
│ Price Analysis:                                              │
│ • Compared to previous period: +2.1% (within acceptable)   │
│ • Compared to other vendors: -5.1% (competitive) 🟢        │
│ • Market benchmark: -3.2% (below market average) 🟢        │
│                                                              │
│ [Compare with Other Vendors →]  [View Price History →]     │
└─────────────────────────────────────────────────────────────┘
```

---

### Product Row States

**Valid Product** (Green indicator):
```
PROD-00123  Premium Coffee Beans    $15.50/kg   2 tiers   🟢
```

**Product with Warning** (Yellow indicator):
```
PROD-00124  Chef's Knife Set        $52.00/set  No MOQ    ⚠️
⚠️ Price 15% higher than previous period
```

**Product with Error** (Red indicator):
```
PROD-00125  Cutting Boards          Not priced            ❌
❌ Missing required pricing information
```

---

### Bulk Product Actions
**Selection Controls**:
```
☑ Select all 20 products

3 products selected  [Export Selected]  [Flag for Review]  [Deselect]
```

---

## Tab 2: Validation Results

### Validation Summary
```
┌─────────────────────────────────────────────────────────────┐
│ Validation Results                                           │
│                                                              │
│ Overall Status: ✅ Passed                                   │
│                                                              │
│ Summary:                                                     │
│ ✅ Errors: 0                                                │
│ ⚠️ Warnings: 2                                              │
│ ℹ️ Info: 5                                                  │
│                                                              │
│ Validation Performed: 21 Jan 2024, 14:23                    │
│ Validation Level: Strict                                     │
└─────────────────────────────────────────────────────────────┘
```

---

### Validation Categories

**Category: Token & Access Validation**
```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Token & Access Validation                                │
│                                                              │
│ All checks passed:                                           │
│ ✓ Valid token format (UUID v4)                             │
│ ✓ Token exists in database                                 │
│ ✓ Token not expired                                         │
│ ✓ Campaign is active                                        │
│ ✓ Portal session valid                                      │
└─────────────────────────────────────────────────────────────┘
```

---

**Category: Field-Level Validation**
```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Field-Level Validation                                   │
│                                                              │
│ Pricelist Header:                                            │
│ ✓ Valid currency code (USD)                                │
│ ✓ Effective start date is valid (1 Feb 2024)               │
│ ✓ Effective end date is valid (30 Apr 2024)                │
│ ✓ Start date before end date                               │
│                                                              │
│ Product Pricing (20 products validated):                     │
│ ✓ All base prices are positive numbers                     │
│ ✓ All prices have ≤4 decimal places                        │
│ ✓ All lead times are 1-365 days                            │
│ ✓ MOQ tiers are in ascending order (where applicable)      │
│ ✓ FOC quantities are non-negative (where provided)         │
│                                                              │
│ Issues:                                                      │
│ ⚠️ 2 products: No MOQ tiers provided (recommended)         │
│    • PROD-00124: Chef's Knife Set                          │
│    • PROD-00127: Sauce Pans                                │
└─────────────────────────────────────────────────────────────┘
```

---

**Category: Business Rule Validation**
```
┌─────────────────────────────────────────────────────────────┐
│ ℹ️ Business Rule Validation                                 │
│                                                              │
│ BR-VPP-001: Complete Product Pricing                         │
│ ✅ Status: Passed                                           │
│ • All 20 products have pricing information                  │
│                                                              │
│ BR-VPP-002: Valid Price Range                                │
│ ℹ️ Status: Passed with Notes                               │
│ • All prices are positive                                   │
│ • 2 products flagged for price variance review:            │
│   - PROD-00124: +15% vs previous period (within 20% limit) │
│   - PROD-00129: +18% vs previous period (within 20% limit) │
│                                                              │
│ BR-VPP-003: MOQ Tier Consistency                             │
│ ✅ Status: Passed                                           │
│ • All MOQ tiers have ascending quantities                   │
│ • All MOQ tiers have valid lead times                       │
│                                                              │
│ BR-VPP-004: FOC Validity                                     │
│ ✅ Status: Passed                                           │
│ • FOC quantities are non-negative                           │
│ • FOC units are provided where required                     │
│                                                              │
│ BR-VPP-005: Lead Time Limits                                 │
│ ✅ Status: Passed                                           │
│ • All lead times are ≤365 days                             │
│                                                              │
│ BR-VPP-006: Data Quality Thresholds                          │
│ ✅ Status: Passed                                           │
│ • Quality score (88/100) exceeds minimum (70/100)          │
│ • Completeness (100%) meets requirement (≥80%)             │
└─────────────────────────────────────────────────────────────┘
```

---

### Warnings Detail List
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Warnings (2)                                             │
│                                                              │
│ 1. PROD-00124: Chef's Knife Set                            │
│    Warning: No MOQ tiers provided                           │
│    Severity: Low                                             │
│    Recommendation: Add volume pricing to improve quality    │
│    Impact: No blocking issue, submission can be approved    │
│                                                              │
│ 2. PROD-00127: Sauce Pans                                   │
│    Warning: No MOQ tiers provided                           │
│    Severity: Low                                             │
│    Recommendation: Add volume pricing to improve quality    │
│    Impact: No blocking issue, submission can be approved    │
└─────────────────────────────────────────────────────────────┘
```

---

### Info Messages
```
┌─────────────────────────────────────────────────────────────┐
│ ℹ️ Information (5)                                          │
│                                                              │
│ • 8 products include multi-tier MOQ pricing (good practice) │
│ • 2 products include FOC promotional quantities             │
│ • All products have detailed vendor notes                   │
│ • Submission completed 10 days before deadline              │
│ • No previous pricelist on file for comparison              │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab 3: Price Comparison

### Comparison Controls
```
Compare with:
☑ Other vendors in this campaign (2 vendors)
☑ Previous period pricing (if available)
☑ Market benchmarks (if available)

View: (●) Side-by-side  ( ) Overlay  ( ) Difference

[Export Comparison Report]
```

---

### Product-by-Product Comparison Table

**Table Headers**:
| Product | ABC Kitchen | Global Food | Premium Rest | Previous Period | Market Avg |
|---------|-------------|-------------|--------------|-----------------|------------|

**Sample Product Comparison**:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Premium Coffee Beans (PROD-00123)                                            │
├──────────────┬─────────────┬─────────────┬──────────────┬──────────────────┤
│ Metric       │ ABC Kitchen │ Global Food │ Premium Rest │ Previous Period  │
├──────────────┼─────────────┼─────────────┼──────────────┼──────────────────┤
│ Base Price   │ $15.50/kg   │ $14.75/kg ✅│ $16.20/kg    │ $15.18/kg (+2.1%)│
│ MOQ Tier 1   │ 100kg@$15   │ 50kg@$14.5  │ Not provided │ 100kg@$14.8      │
│ MOQ Tier 2   │ 500kg@$14   │ 200kg@$14 ✅│ Not provided │ 500kg@$13.9      │
│ Lead Time    │ 14 days     │ 7 days ✅   │ 21 days      │ 14 days          │
│ FOC          │ 1kg/100kg ✅│ None        │ None         │ None             │
│ Quality      │ 88/100      │ 92/100 ✅   │ N/A          │ N/A              │
├──────────────┼─────────────┼─────────────┼──────────────┼──────────────────┤
│ Overall      │ Competitive │ Best Value  │ Incomplete   │ +2.1% increase   │
└──────────────────────────────────────────────────────────────────────────────┘

Analysis:
✅ Global Foodservice Equipment offers lowest base price and fastest lead time
⭐ ABC Kitchen Supplies provides best FOC promotional offer
⚠️ Premium Restaurant Supply has not provided pricing yet
📊 Price increase of 2.1% from previous period is within acceptable range

[View Next Product →]  [Export This Comparison]
```

---

### Price Variance Heatmap

**Visual**: Color-coded grid showing price differences

```
Price Variance Heatmap (vs. Campaign Average)

Product              │ ABC  │ Global │ Premium │ Variance
─────────────────────┼──────┼────────┼─────────┼─────────
Premium Coffee       │ 🟢   │ 🟢🟢   │ 🔴      │ Low
Chef's Knife Set     │ 🟡   │ 🟢     │ ⚪      │ Medium
Cutting Boards       │ 🟢   │ 🟢🟢   │ ⚪      │ Low
Mixing Bowls         │ 🔴   │ 🟢     │ 🟢🟢    │ High
Stock Pots           │ 🟢🟢 │ 🟡     │ ⚪      │ Medium

Legend:
🟢🟢 Best price (lowest)
🟢   Below average (competitive)
🟡   Average
🔴   Above average (expensive)
⚪   Not priced

Recommendations:
• ABC Kitchen: 15 products competitive or below average
• Global Food: 18 products competitive or below average (⭐ Best overall)
• Premium Rest: Only 5 products priced (incomplete submission)
```

---

### Summary Metrics
```
┌─────────────────────────────────────────────────────────────┐
│ Comparison Summary                                           │
│                                                              │
│ ABC Kitchen Supplies Position:                              │
│ • Price Competitiveness: 75% (15/20 products competitive)  │
│ • Best Price Products: 6 products (30%)                     │
│ • Average Price Products: 9 products (45%)                  │
│ • Above Average Products: 5 products (25%)                  │
│                                                              │
│ Overall Ranking: #2 of 3 vendors                            │
│ (Based on price competitiveness and quality score)          │
│                                                              │
│ Recommendation:                                              │
│ ✅ Approve - Pricing is competitive and complete            │
│ • Strong MOQ tier pricing on key products                   │
│ • FOC offers add value                                      │
│ • Quality score excellent (88/100)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab 4: Submission History

### Version History
```
┌─────────────────────────────────────────────────────────────┐
│ Version History                                              │
│                                                              │
│ Version 3 (Current) - Final Submission ✅ Approved          │
│ 21 Jan 2024, 14:23 • Reference: PL-2401-001234             │
│ Changes from Version 2:                                      │
│ • Updated pricing for 5 products                            │
│ • Added FOC offer for 2 products                            │
│ • Improved product notes and details                        │
│ Quality Score: 88/100 (+8 from Version 2)                   │
│ [View This Version]  [Download PDF]                         │
│                                                              │
│ Version 2 - Draft (Auto-saved)                               │
│ 19 Jan 2024, 16:42                                          │
│ Changes from Version 1:                                      │
│ • Added MOQ tiers for 8 products                            │
│ • Completed pricing for 15 additional products              │
│ Quality Score: 80/100 (+40 from Version 1)                  │
│ [View This Version]  [Compare with Current]                │
│                                                              │
│ Version 1 - Initial Draft                                    │
│ 16 Jan 2024, 10:23                                          │
│ Initial submission started                                   │
│ • 5 products priced (25% complete)                          │
│ Quality Score: 40/100                                        │
│ [View This Version]                                         │
└─────────────────────────────────────────────────────────────┘
```

---

### Change Timeline
```
Timeline of Changes

21 Jan 2024, 14:23 - Final Submission
├─ Status changed: Draft → Submitted
├─ Quality score: 88/100 (final)
└─ All validation checks passed

21 Jan 2024, 14:15 - Auto-save
├─ Updated 2 product prices
└─ Added vendor notes for 5 products

21 Jan 2024, 13:30 - Auto-save
├─ Added FOC promotional quantities (2 products)
└─ Quality score: 86/100

19 Jan 2024, 16:42 - Auto-save
├─ Added MOQ tiers for 8 products
├─ Completed pricing for 15 products
└─ Quality score: 80/100

16 Jan 2024, 10:23 - Session Started
├─ Portal accessed via token
├─ Initial draft created
└─ 5 products priced (25% complete)
```

---

### Field-Level Change Log

**Expandable Section**: Click to view detailed changes

```
┌─────────────────────────────────────────────────────────────┐
│ Detailed Change Log                              [Collapse ▲]│
│                                                              │
│ 21 Jan 2024, 14:15                                          │
│ PROD-00123: Premium Coffee Beans                            │
│ • Base Price: $15.00 → $15.50 (+3.3%)                       │
│ • Reason: Market price adjustment                           │
│                                                              │
│ PROD-00124: Chef's Knife Set                                │
│ • Base Price: $50.00 → $52.00 (+4.0%)                       │
│ • Vendor Notes: Added "Premium steel construction"          │
│                                                              │
│ 21 Jan 2024, 13:30                                          │
│ PROD-00123: Premium Coffee Beans                            │
│ • FOC Quantity: None → 1 kg per 100 kg ordered              │
│ • FOC Unit: Added "kg"                                      │
│                                                              │
│ PROD-00128: Mixing Bowls                                    │
│ • FOC Quantity: None → 1 set per 50 sets ordered           │
│                                                              │
│ 19 Jan 2024, 16:42                                          │
│ Multiple Products: MOQ Tiers Added (8 products)             │
│ • PROD-00123: Added 2 MOQ tiers                             │
│ • PROD-00124: Added 1 MOQ tier                              │
│ • PROD-00125: Added 3 MOQ tiers                             │
│ • ...and 5 more products                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab 5: Vendor Information

### Vendor Profile
```
┌─────────────────────────────────────────────────────────────┐
│ Vendor Profile                                               │
│                                                              │
│ ABC Kitchen Supplies                                         │
│ Vendor ID: VEN-00123                                         │
│                                                              │
│ Contact Information:                                         │
│ • Email: contact@abckitchen.com                             │
│ • Phone: +1 234-567-8900                                    │
│ • Address: 123 Main Street, San Francisco, CA 94102        │
│ • Website: www.abckitchen.com                               │
│                                                              │
│ Business Details:                                            │
│ • Status: Active                                            │
│ • Preferred Currency: USD                                    │
│ • Payment Terms: Net 30                                     │
│ • Tax ID: 12-3456789                                        │
│                                                              │
│ Categories:                                                  │
│ • Kitchen Equipment • Cookware • Appliances                 │
└─────────────────────────────────────────────────────────────┘
```

---

### Performance Metrics
```
┌─────────────────────────────────────────────────────────────┐
│ Vendor Performance Metrics                                   │
│                                                              │
│ Campaign Participation:                                      │
│ • Total Campaigns: 5 participated                           │
│ • Completed Submissions: 5 (100%)                           │
│ • Average Response Rate: 95%                                │
│ • Average Response Time: 7.2 days                           │
│                                                              │
│ Quality Metrics:                                             │
│ • Average Quality Score: 86/100 ⭐⭐⭐⭐                     │
│ • This Submission: 88/100 (+2 above average)                │
│ • Completeness: 100% average                                │
│ • Data Accuracy: Excellent                                   │
│                                                              │
│ Pricing Performance:                                         │
│ • Price Competitiveness: 75% below average                  │
│ • Win Rate: 45% (best price on 9/20 products)              │
│ • Price Stability: Low variance (<5% period-to-period)     │
│                                                              │
│ Reliability:                                                 │
│ • On-Time Delivery Rate: 95%                                │
│ • Order Fulfillment Rate: 98%                               │
│ • Quality Issues: <1% return rate                          │
│                                                              │
│ [View Full Vendor History →]                                │
└─────────────────────────────────────────────────────────────┘
```

---

### Campaign Participation History
```
┌─────────────────────────────────────────────────────────────┐
│ Previous Campaign Submissions                                │
│                                                              │
│ Q4 2023 Kitchen Equipment Pricing                           │
│ • Submitted: 15 Oct 2023 • Quality: 85/100                  │
│ • Status: Approved • Products: 18/18 (100%)                 │
│ [View Submission →]                                         │
│                                                              │
│ Q3 2023 Kitchen Equipment Pricing                           │
│ • Submitted: 15 Jul 2023 • Quality: 87/100                  │
│ • Status: Approved • Products: 20/20 (100%)                 │
│ [View Submission →]                                         │
│                                                              │
│ Q2 2023 Kitchen Equipment Pricing                           │
│ • Submitted: 17 Apr 2023 • Quality: 84/100                  │
│ • Status: Approved • Products: 19/20 (95%)                  │
│ [View Submission →]                                         │
│                                                              │
│ [View All (5 campaigns) →]                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab 6: Documents

### Attachments List
```
┌─────────────────────────────────────────────────────────────┐
│ Submission Documents                                         │
│                                                              │
│ 📄 Original Excel Upload                                    │
│    File: ABC_Kitchen_Q1_2024_Pricing.xlsx                   │
│    Size: 125 KB • Uploaded: 21 Jan 2024, 14:20             │
│    [Download]  [Preview]                                    │
│                                                              │
│ 📄 Vendor Certifications                                     │
│    File: Certifications_2024.pdf                            │
│    Size: 2.3 MB • Uploaded: 21 Jan 2024, 14:21             │
│    [Download]  [Preview]                                    │
│                                                              │
│ 📄 Product Catalog                                           │
│    File: ABC_Kitchen_Catalog_2024.pdf                       │
│    Size: 5.8 MB • Uploaded: 21 Jan 2024, 14:22             │
│    [Download]  [Preview]                                    │
│                                                              │
│ Generated Reports:                                           │
│                                                              │
│ 📊 Submission Summary Report                                │
│    Generated: 22 Jan 2024, 10:05                            │
│    [Download PDF]  [Download Excel]                         │
│                                                              │
│ 📊 Price Comparison Report                                  │
│    Generated: 22 Jan 2024, 10:06                            │
│    [Download PDF]                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Approval Workflow Section

### Approval Panel
**Location**: Right sidebar (desktop), bottom (mobile)
**Always Visible**: Yes (sticky)

---

### Approval Quick Actions
```
┌─────────────────────────────────┐
│ Approval Actions                 │
│                                  │
│ Status: 📋 Pending Review       │
│                                  │
│ Quick Approve                    │
│ ☑ Quality score meets minimum   │
│ ☑ No validation errors           │
│ ☑ Pricing is competitive         │
│                                  │
│ [✅ Approve Pricelist]          │
│                                  │
│ ────────────────────────────     │
│                                  │
│ Or:                              │
│ [🔄 Request Revisions]          │
│ [❌ Reject Submission]          │
│                                  │
│ ────────────────────────────     │
│                                  │
│ Other Actions:                   │
│ • Flag for Manager Review        │
│ • Request Additional Info        │
│ • Schedule Review Meeting        │
└─────────────────────────────────┘
```

---

### Approval Notes Section
```
┌─────────────────────────────────┐
│ Approval Notes                   │
│                                  │
│ Add notes for approval decision: │
│ [_____________________________] │
│ [_____________________________] │
│ [_____________________________] │
│                                  │
│ These notes will be:             │
│ • Saved in audit log             │
│ • Visible to other reviewers     │
│ • Included in vendor email       │
└─────────────────────────────────┘
```

---

### Approval Checklist
```
┌─────────────────────────────────┐
│ Review Checklist                 │
│                                  │
│ ☑ All required products priced   │
│ ☑ Quality score ≥70/100         │
│ ☑ No validation errors           │
│ ☑ Prices within acceptable range │
│ ☑ Lead times are reasonable      │
│ ☑ MOQ terms are clear            │
│ ☐ Compared with other vendors    │
│ ☐ Reviewed vendor history        │
│                                  │
│ Completion: 75%                  │
└─────────────────────────────────┘
```

---

## Dialogs/Modals

### Dialog 1: Approve Submission

#### Dialog Header
**Title**: Approve Pricelist Submission
**Icon**: ✅
**Close Button**: X icon

#### Dialog Body

**Submission Summary**:
```
Vendor: ABC Kitchen Supplies
Reference: PL-2401-001234
Quality Score: 88/100 ⭐⭐⭐⭐
Products: 20/20 (100% complete)
```

**Pre-Approval Checklist**:
```
✅ All products priced
✅ Quality score meets minimum (70/100)
✅ No validation errors
✅ Pricing is competitive
⚠️ 2 products have prices 10%+ higher than previous
```

**Approval Options**:
```
Approval Type:
( ) Full Approval - Activate all pricing immediately
( ) Conditional Approval - Approve with notes for vendor
( ) Approve Pending Verification - Approve but flag for follow-up
```

**Approval Notes**:
```
Approval Notes (required):
[_________________________________________________]
[_________________________________________________]

These notes will be:
• Sent to vendor via email
• Saved in audit log
• Visible to other staff
```

**Auto-Actions**:
```
☑ Send approval confirmation email to vendor
☑ Add approved prices to vendor pricelist history
☑ Update product price database with new pricing
☐ Create purchase orders based on pricing (if applicable)
```

#### Dialog Footer
| Button Label | Type | Action |
|--------------|------|--------|
| Approve & Notify | Primary (green solid) | Execute approval |
| Approve Silently | Secondary (green outline) | Approve without email |
| Cancel | Secondary (gray outline) | Close dialog |

---

### Dialog 2: Request Revisions

#### Dialog Header
**Title**: Request Revisions from Vendor
**Icon**: 🔄
**Close Button**: X icon

#### Dialog Body

**Current Issues**:
```
Issues to Address:

Select issues to include in revision request:

☑ Missing Products (3 products)
  ☑ PROD-00125: Cutting Boards
  ☑ PROD-00129: Stock Pots
  ☑ PROD-00131: Ladles

☑ Invalid Data (2 products)
  ☑ PROD-00127: Lead time exceeds 365 days
  ☑ PROD-00128: Invalid MOQ tier sequence

☐ Quality Concerns (0 products)

☐ Price Issues (0 products)
```

**Revision Request Message**:
```
Message to Vendor (required):
[_________________________________________________]
[_________________________________________________]
[_________________________________________________]

Template Messages:
• Please provide pricing for all products
• Please review and correct validation errors
• Please adjust lead times to acceptable range
• Please provide MOQ pricing for key products
```

**Deadline Options**:
```
Revision Deadline:
( ) Original campaign deadline (31 Jan 2024)
( ) Extended deadline: [DD/MM/YYYY ▼] at [HH:MM ▼]
    (Recommended: +7 days)
```

**Vendor Notification**:
```
☑ Send revision request email immediately
☑ Include detailed issue list
☑ Include link to edit pricelist
☐ Request confirmation of receipt
```

#### Dialog Footer
| Button Label | Type | Action |
|--------------|------|--------|
| Send Revision Request | Primary (yellow solid) | Send to vendor |
| Save as Draft | Secondary (gray outline) | Save without sending |
| Cancel | Secondary (gray outline) | Close dialog |

---

### Dialog 3: Reject Submission

#### Dialog Header
**Title**: Reject Pricelist Submission
**Icon**: ❌ (red)
**Close Button**: X icon

#### Dialog Body

**Warning**:
```
⚠️ Important: Rejecting this submission

Rejection is a serious action and should only be used when:
• Vendor cannot or will not provide acceptable pricing
• Submission quality is unacceptably poor
• Vendor violated submission guidelines
• Business relationship is ending

Consider "Request Revisions" instead if issues can be corrected.
```

**Rejection Reason** (required):
```
Reason for Rejection (required):
( ) Uncompetitive pricing
( ) Poor data quality
( ) Incomplete submission (vendor unable to complete)
( ) Guideline violations
( ) Other (specify below)

Detailed Explanation:
[_________________________________________________]
[_________________________________________________]
[_________________________________________________]
(This will be sent to the vendor)
```

**Impact**:
```
Rejection Impact:
• Vendor will be notified via email
• Vendor portal access will be revoked
• Submission will be marked as "Rejected"
• Vendor can NOT resubmit unless re-invited
• This action is logged and reviewable
```

**Alternative Actions**:
```
Before rejecting, have you considered:
• Requesting revisions to fix issues
• Contacting vendor to discuss concerns
• Extending deadline to allow more time
• Flagging for manager review

[Contact Vendor First]  [Request Revisions Instead]
```

#### Dialog Footer
| Button Label | Type | Action |
|--------------|------|--------|
| Reject Submission | Destructive (red solid) | Execute rejection |
| Cancel | Secondary (gray outline) | Close dialog |

---

## Status Messages

### Success Messages
| Trigger | Message | Duration |
|---------|---------|----------|
| Approval | ✓ Pricelist approved successfully. Vendor notified via email. | 5s |
| Revision request | ✓ Revision request sent to vendor. Deadline extended to {date}. | 5s |
| Rejection | ✓ Submission rejected. Vendor notified. Access revoked. | 5s |
| Notes saved | ✓ Approval notes saved | 3s |
| Export | ✓ Report exported successfully | 3s |

### Error Messages
| Error Type | Message | Recovery |
|------------|---------|----------|
| Load failed | ✗ Unable to load submission. Please refresh. | [Retry] |
| Approval failed | ✗ Unable to approve submission. Please try again. | [Retry] [Contact Support] |
| Email failed | ✗ Unable to send notification email. Approval saved but vendor not notified. | [Resend Email] [Continue] |

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| High price variance | ⚠️ 3 products have prices >20% higher than previous period | [Review Prices] [Approve Anyway] |
| Incomplete data | ⚠️ Quality score below recommended (70/100). Request revisions? | [Request Revisions] [Approve Anyway] |
| No comparison data | ⚠️ Unable to compare with other vendors (no other submissions yet) | [Dismiss] |

---

## Loading States
| Context | Message | Visual |
|---------|---------|--------|
| Initial load | Loading submission details... | Skeleton layout |
| Comparison | Loading price comparison data... | Spinner on comparison tab |
| Approval | Processing approval... | Button spinner |
| Export | Generating report... {percentage}% | Progress bar |

---

## Accessibility
| Element | ARIA Label |
|---------|------------|
| Approve button | Approve pricelist from {vendor name} |
| Product row | Product: {product name}, price {price}, status {status} |
| Validation badge | Validation status: {status}, {error count} errors |
| Tab navigation | Navigate to {tab name} tab |

---

## Appendix

### Related Pages
- [PC-campaign-detail.md](./PC-campaign-detail.md)
- [PC-vendor-portal-submission.md](./PC-vendor-portal-submission.md)

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-01-23 | Initial version | Created from UC-VPP-011, UC-VPP-012 | System |

---

**Document End**
