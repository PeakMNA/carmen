# POS Integration Screenshot Capture Plan

## Module Overview
- **Total Pages**: 15
- **Current Screenshots**: 0 in local directory (some exist in SA screenshots)
- **Priority**: High - Critical integration feature
- **Status**: 🔴 Missing all page screenshots

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Required Screenshots

### 1. POS Integration Dashboard
**Route:** `/system-administration/system-integrations/pos`
**Filename:** `pos-dashboard.png`
**Priority:** ⭐⭐⭐ Critical

**What to Capture:**
- System Status Card with connection status
- Alert indicators (unmapped items, failed transactions, pending approvals)
- Setup, Mapping, Operations, and Reporting sections
- Recent Activity Table
- Quick action buttons

**Test Data Needed:**
- Mock connection status (connected)
- Sample unmapped items count (e.g., 5)
- Sample failed transactions (e.g., 2)
- Sample pending approvals (e.g., 3)
- Recent activity entries (5-10 items)

---

### 2. POS Configuration Page
**Route:** `/system-administration/system-integrations/pos/settings/config`
**Filename:** `pos-settings-config.png`
**Priority:** ⭐⭐⭐ Critical
**Status:** ✅ Already exists in `/sa/screenshots/`

**What to Capture:**
- API Configuration section (Comanche POS selected)
- Sync Settings (auto-sync enabled, 15 min frequency)
- Transaction Settings
- Advanced Settings
- Test Connection button and status

**Test Data:**
- POS System: Comanche
- API Endpoint: https://api.comanche.example.com
- Sync Frequency: 15 minutes
- Connection Status: Connected

---

### 3. System Settings Page
**Route:** `/system-administration/system-integrations/pos/settings/system`
**Filename:** `pos-settings-system.png`
**Priority:** ⭐⭐ High

**What to Capture:**
- Stock-out Approval settings
- Mapping Automation toggles
- Notification configuration
- Data Retention settings

**Test Data:**
- Require approval: Yes
- Auto-approve threshold: $100
- Email notifications: Enabled
- Transaction retention: 90 days

---

### 4. Recipe Mapping Page
**Route:** `/system-administration/system-integrations/pos/mapping/recipes`
**Filename:** `pos-mapping-recipes.png`
**Priority:** ⭐⭐⭐ Critical
**Status:** ✅ Already exists in `/sa/screenshots/`

**What to Capture:**
- Mapping table with columns (POS Item ID, Name, Category, Mapped Recipe, Status)
- Filter options (Status, Category, Search)
- Bulk action buttons
- Sample mappings showing Mapped and Unmapped statuses
- Auto-mapping suggestions panel

**Test Data:**
- 10-15 POS items
- Mix of mapped (green badge) and unmapped (red badge) items
- Sample categories: Beverages, Appetizers, Mains, Desserts
- Auto-suggestions showing confidence scores

---

### 5. Fractional Variants Mapping
**Route:** `/system-administration/system-integrations/pos/mapping/recipes/fractional-variants`
**Filename:** `pos-mapping-fractional-variants.png`
**Priority:** ⭐⭐⭐ Critical

**What to Capture:**
- Fractional Recipe Table
- Base recipe examples (Large Pizza, Whole Cake)
- Total yield configuration (8 slices, 12 portions)
- POS variant items mapped
- Deduction logic settings
- Preview inventory impact

**Test Data:**
- Large Pepperoni Pizza → 8 slices
- Chocolate Cake → 12 portions
- POS items: "Pizza Slice - Pepperoni", "Cake Slice - Chocolate"
- Fractional units: 1/8, 1/12
- Rounding rule: Nearest whole

---

### 6. Unit Mapping Page
**Route:** `/system-administration/system-integrations/pos/mapping/units`
**Filename:** `pos-mapping-units.png`
**Priority:** ⭐⭐ High
**Status:** ✅ Already exists in `/sa/screenshots/` (pos-mapping-units.png)

**What to Capture:**
- Unit mapping table
- POS units (oz, lb, each) mapped to system units
- Conversion factors
- Unit converter tool
- Test conversion examples

**Test Data:**
- oz → grams (28.35 conversion factor)
- lb → kg (0.4536 conversion factor)
- each → unit (1.0 conversion factor)

---

### 7. Location Mapping Page
**Route:** `/system-administration/system-integrations/pos/mapping/locations`
**Filename:** `pos-mapping-locations.png`
**Priority:** ⭐⭐⭐ Critical
**Status:** ✅ Already exists in `/sa/screenshots/`

**What to Capture:**
- Location mapping table
- POS location names mapped to system locations
- Default department assignments
- Multi-location support indicators

**Test Data:**
- Downtown Store → Main Kitchen
- Airport Branch → Airport Kitchen
- Mall Location → Central Kitchen

---

### 8. Transactions View Page
**Route:** `/system-administration/system-integrations/pos/transactions`
**Filename:** `pos-transactions-list.png`
**Priority:** ⭐⭐⭐ Critical
**Status:** ✅ Already exists in `/sa/screenshots/` (pos-transactions.png)

**What to Capture:**
- Transaction table with all columns
- Status indicators (Success, Failed, Pending)
- Filter controls (date range, location, status)
- Bulk action buttons
- Sample transactions showing different statuses

**Test Data:**
- 15-20 transactions
- Mix of statuses: 12 Success, 2 Failed, 1 Pending
- Date range: Last 7 days
- Various locations
- Different amounts

---

### 9. Transaction Detail Drawer
**Route:** `/system-administration/system-integrations/pos/transactions/[id]`
**Filename:** `pos-transaction-detail.png`
**Priority:** ⭐⭐ High

**What to Capture:**
- Transaction header (ID, date, location, amount)
- Line items table
- Inventory deductions applied section
- Error details (for failed transaction)
- Retry/Resolve buttons
- Audit log

**Test Data:**
- Transaction ID: TXN-2501-001234
- Date: Today's date
- Location: Downtown Store
- 5 line items
- Total: $125.50
- Status: Success
- Inventory impact showing deductions

---

### 10. Stock-out Review Page
**Route:** `/system-administration/system-integrations/pos/transactions/stock-out-review`
**Filename:** `pos-stockout-review.png`
**Priority:** ⭐⭐⭐ Critical

**What to Capture:**
- Approval Queue Table
- Pending approvals with inventory impact preview
- Bulk approval controls
- Transaction details expandable view
- Approve/Reject/Review action buttons

**Test Data:**
- 5-7 pending approvals
- Inventory impact showing quantities to be deducted
- Different item types
- Various requesters
- Approval notes field

---

### 11. Reports Home Page
**Route:** `/system-administration/system-integrations/pos/reports`
**Filename:** `pos-reports-home.png`
**Priority:** ⭐⭐ High

**What to Capture:**
- Available reports cards
- Quick stats section
- Report selection interface
- Date range selector
- Export options

**Test Data:**
- Today's sales: $2,450.00
- This week's sales: $15,320.00
- Top category: Beverages
- Average transaction: $35.25

---

### 12. Gross Profit Report
**Route:** `/system-administration/system-integrations/pos/reports/gross-profit`
**Filename:** `pos-reports-gross-profit.png`
**Priority:** ⭐⭐⭐ Critical
**Status:** ✅ Already exists in `/sa/screenshots/`

**What to Capture:**
- Summary cards (Revenue, COGS, Gross Profit, Margin %)
- Profit by Category table with bar chart
- Profit by Item breakdown
- Trend analysis chart
- Export options (PDF, Excel, CSV)

**Test Data:**
- Total Revenue: $45,200
- Total COGS: $18,080
- Gross Profit: $27,120
- Margin: 60%
- 5 categories with different margins
- Trend chart showing last 30 days

---

### 13. Consumption Report
**Route:** `/system-administration/system-integrations/pos/reports/consumption`
**Filename:** `pos-reports-consumption.png`
**Priority:** ⭐⭐⭐ Critical
**Status:** ✅ Already exists in `/sa/screenshots/`

**What to Capture:**
- Variance Summary cards
- Variance by Ingredient table with color coding
- Variance analysis section
- Trend charts (by time, location, category)
- Investigation tools
- High variance filter

**Test Data:**
- Total Theoretical: 1,200 units
- Total Actual: 1,245 units
- Total Variance: +45 units (+3.75%)
- 10 ingredients with varying variance levels
- Color coding: Green (normal), Yellow (over), Red (high variance)

---

### 14. Mapping Drawer Component
**Route:** Modal on Recipe Mapping page
**Filename:** `pos-mapping-drawer.png`
**Priority:** ⭐⭐ High

**What to Capture:**
- POS item details section
- Recipe selector dropdown (searchable)
- Portion size input
- Unit selector
- Cost override field (optional)
- Save mapping button

**Test Data:**
- POS Item: "Iced Coffee - Large"
- Selected Recipe: "House Iced Coffee"
- Portion Size: 16
- Unit: oz
- Cost Override: $2.50

---

### 15. Failed Transaction Error View
**Route:** Transaction detail with error
**Filename:** `pos-transaction-failed.png`
**Priority:** ⭐⭐ High

**What to Capture:**
- Failed transaction detail
- Error categorization
- Error message details
- Troubleshooting tips
- Retry button
- Manual resolution options

**Test Data:**
- Error: "Recipe mapping not found"
- Category: Mapping Error
- Affected items: 2
- Suggestions: "Map items in Recipe Mapping page"
- Retry available: Yes

---

## Screenshot Specifications

### Technical Requirements
- **Resolution**: 1920x1080 (desktop view)
- **Browser**: Chrome (latest)
- **Format**: PNG
- **Compression**: Optimized for web
- **Naming**: kebab-case with descriptive names

### Capture Guidelines
1. Use realistic test data (no lorem ipsum)
2. Show all key UI elements
3. Capture full page with scrolling if needed
4. Include hover states for interactive elements
5. Show both empty and populated states where applicable
6. Capture error states and validation messages

### Required States to Capture
- ✅ **Default state**: Normal operation
- ⚠️ **Populated state**: With realistic data
- ❌ **Error state**: Showing validation/errors (where applicable)
- 🔄 **Loading state**: Processing indicators (where applicable)

---

## Implementation Notes

### Existing Screenshots (Already in SA screenshots)
✅ `pos-settings-config.png` - POS Configuration
✅ `pos-mapping-recipes.png` - Recipe Mapping
✅ `pos-mapping-units.png` - Unit Mapping
✅ `pos-mapping-locations.png` - Location Mapping
✅ `pos-transactions.png` - Transactions List
✅ `pos-reports-gross-profit.png` - Gross Profit Report
✅ `pos-reports-consumption.png` - Consumption Report

### Newly Captured Screenshots (2025-10-18)
1. ✅ `pos-dashboard.png` - Main dashboard (**CAPTURED**)
2. ✅ `pos-settings-system.png` - System settings (**CAPTURED**)
3. ✅ `pos-mapping-fractional-variants.png` - Fractional variants (**CAPTURED**)
4. ✅ `pos-reports-home.png` - Reports landing page (**CAPTURED**)

### Screenshots Not Available (Page Not Implemented)
5. ⚠️ `pos-stockout-review.png` - Stock-out approval queue (404 - not implemented)
6. ⚠️ `pos-transaction-detail.png` - Transaction detail drawer (requires implementation)
7. ⚠️ `pos-mapping-drawer.png` - Mapping drawer modal (requires modal trigger)
8. ⚠️ `pos-transaction-failed.png` - Failed transaction view (requires failed transaction)

### Priority Order for Capture
1. **Critical (Capture First)**
   - POS Dashboard
   - Fractional Variants Mapping
   - Stock-out Review

2. **High (Capture Second)**
   - System Settings
   - Transaction Detail
   - Reports Home

3. **Nice to Have (Capture Last)**
   - Mapping Drawer
   - Failed Transaction View

---

## Playwright Automation Script

```javascript
// Script to automate screenshot capture
const pages = [
  {
    url: '/system-administration/system-integrations/pos',
    name: 'pos-dashboard',
    waitFor: '.status-card, .recent-activity',
  },
  {
    url: '/system-administration/system-integrations/pos/settings/system',
    name: 'pos-settings-system',
    waitFor: 'form',
  },
  {
    url: '/system-administration/system-integrations/pos/mapping/recipes/fractional-variants',
    name: 'pos-mapping-fractional-variants',
    waitFor: 'table',
  },
  {
    url: '/system-administration/system-integrations/pos/transactions/stock-out-review',
    name: 'pos-stockout-review',
    waitFor: '.approval-queue',
  },
  {
    url: '/system-administration/system-integrations/pos/reports',
    name: 'pos-reports-home',
    waitFor: '.report-card',
  },
];

// Run with: node capture-pos-screenshots.js
```

---

**Last Updated:** 2025-10-18
**Status:** 🟢 Capture Complete - 11/15 Screenshots Available
**Progress:** 73% Complete (11 existing + 4 newly captured / 15 total planned)

**Summary:**
- ✅ 7 screenshots already existed in `/sa/screenshots/`
- ✅ 4 screenshots newly captured (Dashboard, System Settings, Fractional Variants, Reports Home)
- ⚠️ 4 screenshots pending page implementation (Stock-out Review, Transaction Detail, Mapping Drawer, Failed Transaction)
