# PC-pricelist-bulk-operations.md - Bulk Price List Operations Page

## Document Information
- **Page Name**: Bulk Price List Operations
- **Route**: `/vendor-management/price-lists/bulk-operations`
- **Parent Module**: Vendor Management > Price Lists
- **Related Documents**:
  - UC-price-lists.md (Use Cases)
  - BR-price-lists.md (Business Requirements)
  - TS-price-lists.md (Technical Specification)
  - PC-pricelist-list.md (List Page)
  - PC-pricelist-detail.md (Detail Page)
  - PC-pricelist-alerts.md (Alert Management)

---

## Page Overview

### Purpose
Centralized interface for performing bulk operations on multiple price lists simultaneously. Enables efficient management of large numbers of price lists through batch processing, validation, conflict resolution, and rollback capabilities. Designed to save time and reduce errors when managing price lists at scale.

### User Roles
- **Procurement Staff**: Can perform bulk operations on assigned price lists
- **Procurement Manager**: Full access to all bulk operations and scheduling
- **Finance Manager**: Can perform bulk status updates and exports
- **System Administrator**: Full access including dangerous operations (bulk delete)

### Key Features
- **Bulk Selection Interface**: Select multiple price lists with advanced filtering
- **Operation Types**: Enable/disable, archive, delete, export, update prices, extend dates, change status
- **Operation Wizard**: Step-by-step guidance with preview and confirmation
- **Real-Time Progress**: Live progress tracking with detailed status updates
- **Rollback Capability**: Undo failed or incorrect bulk operations
- **Operation History**: Complete log of all bulk operations
- **Validation & Conflict Resolution**: Pre-operation validation with conflict detection
- **Scheduled Operations**: Schedule bulk operations for future execution
- **Dry Run Mode**: Test operations without applying changes
- **Batch Processing**: Process operations in optimized batches
- **Error Handling**: Comprehensive error recovery and reporting

---

## Page Layout

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Header: Breadcrumb + Page Title + Action Buttons            │
├─────────────────────────────────────────────────────────────┤
│ Selection Summary Banner (when items selected)              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ X items selected • [Clear] [Select Actions ▼]      │    │
│ └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│ Filter & Search Panel                                        │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Search | Status | Vendor | Date Range | Category   │    │
│ └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    Price List Table                          │
│              (with checkboxes for selection)                 │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Tab Navigation                                               │
│ [Active Operations] [History] [Scheduled]                   │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop (≥1024px)**: Full layout, side-by-side panels, wide tables
- **Tablet (768px-1023px)**: Stacked panels, scrollable tables
- **Mobile (<768px)**: Card-based layout, bottom sheets for operations

---

## Page Header

### Breadcrumb
**Text**: Home / Vendor Management / Price Lists / Bulk Operations

**Style**:
- Text-sm, text-gray-500
- Links: text-blue-600 hover:text-blue-800 hover:underline
- Current: text-gray-900 font-medium
- Separator: text-gray-400 "/"

**Accessibility**:
- aria-label="Breadcrumb navigation"
- aria-current="page" on current item

### Page Title
**Text**: Bulk Price List Operations

**Icon**: Layers, size-6, text-purple-600, mr-3

**Style**: H1, text-2xl lg:text-3xl, font-bold, text-gray-900

**Subtitle**: Manage multiple price lists efficiently
- Text-sm, text-gray-600, mt-1

### Action Buttons

**Layout**: Flex row, gap-2, justify-end

| Button | Purpose | Icon | Style | Tooltip | Keyboard |
|--------|---------|------|-------|---------|----------|
| View History | View operation history | History | Secondary | View past operations | H |
| Schedule Operation | Schedule future operation | Calendar | Secondary | Schedule bulk operation | S |
| Import Selection | Import price list IDs | Upload | Tertiary | Import from file | - |
| Help | Show bulk operations guide | HelpCircle | Tertiary | Learn about bulk ops | ? |

---

## Selection Summary Banner

**Appears when**: One or more price lists selected

### Banner Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ✓ 15 price lists selected                          [✕ Clear] │
│                                                              │
│ Selected items summary:                                      │
│ • Status: 12 Active, 3 Draft                                │
│ • Vendors: ABC Foods (8), XYZ Dist (5), GreenFarm (2)      │
│ • Date range: Jan 2024 - Mar 2024                          │
│                                                              │
│ [Select Actions ▼]                                          │
│                                                              │
│ Available Actions:                                           │
│ • Archive (15 eligible)                                     │
│ • Export (15 eligible)                                      │
│ • Extend Validity (12 active only)                         │
│ • Change Status (15 eligible)                               │
│ • Delete (3 draft only) ⚠️                                  │
└─────────────────────────────────────────────────────────────┘
```

**Banner Features**:
- Selected count with clear button
- Summary statistics (status, vendors, dates)
- Action eligibility indicators
- Warning for destructive actions
- Sticky position (stays visible while scrolling)

---

## Filter & Selection Panel

### Filter Controls
```
┌─────────────────────────────────────────────────────────────┐
│ Find Price Lists to Operate On:                             │
│                                                              │
│ [🔍 Search by name, reference, or product___________]       │
│                                                              │
│ Status: [All Statuses ▼]  Vendor: [All Vendors ▼]          │
│ Effective Date: [Any Date ▼]  Category: [All Categories ▼] │
│                                                              │
│ Advanced Filters:                                            │
│ ☐ Show only expired price lists                            │
│ ☐ Show only expiring soon (<30 days)                       │
│ ☐ Show only pending approval                               │
│ ☐ Show only never used                                     │
│                                                              │
│ [Reset Filters] [Save Filter Preset]                       │
└─────────────────────────────────────────────────────────────┘
```

### Quick Selection Tools
```
┌─────────────────────────────────────────────────────────────┐
│ Quick Selection:                                             │
│                                                              │
│ [Select All Visible (25)] [Select All Filtered (156)]      │
│ [Select by Status ▼] [Select by Vendor ▼]                  │
│ [Invert Selection] [Clear Selection]                       │
│                                                              │
│ Saved Selections:                                            │
│ • Q1 2024 Price Lists (45 items) [Load]                    │
│ • Expired Lists (23 items) [Load]                           │
│ • [+ Save Current Selection]                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Price List Table (with Selection)

### Table Headers
| Column | Sortable | Width | Sticky | Tooltip |
|--------|----------|-------|--------|---------|
| [☐ Select All] | No | 40px | Left | Select/deselect all visible |
| Reference | Yes | 120px | Left | Price list reference ID |
| Name | Yes | 280px | No | Price list name |
| Vendor | Yes | 140px | No | Vendor name |
| Status | Yes | 100px | No | Current status |
| Effective Dates | Yes | 180px | No | Validity period |
| Products | Yes | 80px | No | Product count |
| Last Modified | Yes | 120px | No | Last update date |

### Table Row Example
```
[☑] | PL-2401-0001 | Fresh Produce - Jan 2024 | ABC Foods | Active | Jan 1 - Mar 31 | 125 | Jan 15 |
```

**Row States**:
- Selected: bg-blue-50, border-l-4 border-blue-600
- Hover: bg-gray-50
- Disabled (ineligible): opacity-50, cursor-not-allowed

**Selection Indicators**:
- Checkbox (individual selection)
- Row highlight when selected
- Batch count in header
- Eligibility badge (if not eligible for current operation)

---

## Bulk Actions Dropdown

**Trigger**: Click "Select Actions" button in summary banner

### Actions Menu
```
┌─────────────────────────────────────────────────────────────┐
│ Bulk Actions (15 selected)                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Status Operations:                                           │
│ • Change Status (15 eligible)                               │
│ • Archive (15 eligible)                                     │
│ • Activate (3 draft eligible)                               │
│ • Deactivate (12 active eligible)                           │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ Data Operations:                                             │
│ • Update Prices (15 eligible)                               │
│ • Extend Validity Dates (12 active eligible)               │
│ • Bulk Price Adjustment (15 eligible)                      │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ Export Operations:                                           │
│ • Export to Excel (15 eligible)                             │
│ • Export to PDF (15 eligible)                               │
│ • Export Summary Report (15 eligible)                      │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ Destructive Operations: ⚠️                                   │
│ • Delete Draft Lists (3 draft eligible)                    │
│ • Permanently Delete (Requires approval)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Action Eligibility**:
- Show count of eligible items
- Disable actions if no eligible items
- Explain why items are ineligible (tooltip)
- Warning icons for destructive actions

---

## Operation Wizard

**Common wizard for all bulk operations**

### Wizard Structure
```
┌─────────────────────────────────────────────────────────────┐
│ Bulk Operation: [Operation Name]                       [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Progress: [●────] Step 1 of 4                               │
│                                                              │
│ [1. Validate] → [2. Configure] → [3. Preview] → [4. Execute] │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    Step Content Area                         │
│                                                              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [Cancel]              [← Previous] [Next →] [Execute]      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Step 1: Validate Selection

**Validation Results**:
```
┌─────────────────────────────────────────────────────────────┐
│ Validating Selection...                                      │
│                                                              │
│ ✓ All selected items are valid (15/15)                      │
│                                                              │
│ Selection Summary:                                           │
│ • Total selected: 15 price lists                            │
│ • Eligible for this operation: 15 (100%)                    │
│ • Ineligible: 0                                             │
│                                                              │
│ Pre-Operation Checks:                                        │
│ ✓ No conflicts detected                                    │
│ ✓ All items in compatible status                           │
│ ✓ User has required permissions                            │
│ ✓ No items currently locked                                │
│                                                              │
│ Estimated Operation Time: 30-45 seconds                      │
│                                                              │
│ [Continue to Configuration →]                               │
└─────────────────────────────────────────────────────────────┘
```

**Validation with Issues**:
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Validation Issues Found                                  │
│                                                              │
│ Eligible: 12 price lists                                     │
│ Ineligible: 3 price lists                                    │
│                                                              │
│ Issues:                                                      │
│ • PL-2401-0003: Currently locked by Sarah Johnson           │
│   (being edited)                                             │
│   → Action: Wait for unlock or remove from selection       │
│                                                              │
│ • PL-2401-0012: Archived status (cannot modify)              │
│   → Action: Remove from selection                           │
│                                                              │
│ • PL-2401-0025: Pending approval (restricted)                │
│   → Action: Wait for approval or remove                     │
│                                                              │
│ Options:                                                     │
│ [Remove Ineligible Items (3)] [Cancel Operation]           │
│ [Contact Sarah J. about PL-2401-0003]                        │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: Configure Operation

**Configuration varies by operation type**

#### Example: Extend Validity Dates
```
┌─────────────────────────────────────────────────────────────┐
│ Configure Date Extension                                     │
│                                                              │
│ Extend validity dates for 12 price lists                    │
│                                                              │
│ Extension Method:                                            │
│ (•) Extend by duration                                      │
│ ( ) Set new end date                                        │
│                                                              │
│ Duration:                                                    │
│ Extend by [30__] days                                       │
│                                                              │
│ Preview:                                                     │
│ PL-2401-0001: Jan 1 - Mar 31 → Jan 1 - Apr 30              │
│ PL-2401-0002: Jan 5 - Apr 5  → Jan 5 - May 5               │
│ ... (10 more)                                               │
│                                                              │
│ Options:                                                     │
│ ☑ Send notification to vendors                             │
│ ☑ Update related purchase orders                           │
│ ☐ Create audit log entry                                   │
│                                                              │
│ [← Back to Validation] [Preview Changes →]                 │
└─────────────────────────────────────────────────────────────┘
```

#### Example: Bulk Price Adjustment
```
┌─────────────────────────────────────────────────────────────┐
│ Configure Price Adjustment                                   │
│                                                              │
│ Adjustment Type:                                             │
│ (•) Percentage increase/decrease                            │
│ ( ) Fixed amount increase/decrease                          │
│ ( ) Set to specific price                                   │
│                                                              │
│ Percentage Adjustment:                                       │
│ ( ) Increase all prices by [___]%                           │
│ (•) Decrease all prices by [5__]%                           │
│                                                              │
│ Apply to:                                                    │
│ (•) All products in selected price lists                    │
│ ( ) Specific products only                                  │
│ ( ) Specific categories only                                │
│                                                              │
│ Rounding:                                                    │
│ Round to: [Nearest $0.05 ▼]                                │
│                                                              │
│ Preview Sample (5 products):                                 │
│ Fresh Tomatoes:  $2.75 → $2.61 (-5.1%)                     │
│ Fresh Lettuce:   $1.80 → $1.71 (-5.0%)                     │
│ Fresh Carrots:   $2.20 → $2.09 (-5.0%)                     │
│ Fresh Onions:    $1.50 → $1.43 (-4.7%)                     │
│ Fresh Peppers:   $3.00 → $2.85 (-5.0%)                     │
│                                                              │
│ Total affected products: 1,245 across 12 price lists       │
│                                                              │
│ [← Back] [Preview All Changes →]                           │
└─────────────────────────────────────────────────────────────┘
```

#### Example: Change Status
```
┌─────────────────────────────────────────────────────────────┐
│ Configure Status Change                                      │
│                                                              │
│ Change status for 15 price lists                            │
│                                                              │
│ New Status: *                                                │
│ [Active ▼]                                                  │
│                                                              │
│ Options:                                                     │
│ • Active                                                     │
│ • Inactive                                                   │
│ • Archived                                                   │
│ • Pending Approval (requires approval workflow)             │
│                                                              │
│ Reason for Change: (optional)                                │
│ [Seasonal pricing period ended_______________]              │
│                                                              │
│ Additional Actions:                                          │
│ ☑ Send status change notification to vendors               │
│ ☐ Update related purchase orders                           │
│ ☑ Log in audit trail                                       │
│                                                              │
│ Status Change Impact:                                        │
│ • 15 price lists will change to Active                      │
│ • 245 products affected                                     │
│ • 3 vendors will be notified                                │
│                                                              │
│ [← Back] [Preview Changes →]                               │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Preview Changes

**Change Preview Table**:
```
┌─────────────────────────────────────────────────────────────┐
│ Preview Changes Before Applying                              │
│                                                              │
│ Review all changes that will be made:                        │
│                                                              │
│ Price List          Current → New         Impact            │
│ ─────────────────────────────────────────────────────────── │
│ PL-2401-0001         Active → Archived     125 products     │
│ Fresh Produce Jan                                            │
│                                                              │
│ PL-2401-0002         Active → Archived     112 products     │
│ Dairy Products Jan                                           │
│                                                              │
│ PL-2401-0003         Active → Archived     98 products      │
│ Meat & Poultry Jan                                           │
│                                                              │
│ ... (12 more items)                                         │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Summary of Changes                        │              │
│ │                                           │              │
│ │ Total Items: 15 price lists               │              │
│ │ Total Products Affected: 1,245            │              │
│ │ Vendors Affected: 3                       │              │
│ │ Estimated Time: 30-45 seconds             │              │
│ │                                           │              │
│ │ Notifications to Send: 3 vendor emails    │              │
│ │ Audit Log Entries: 15                     │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ ⚠️ Important: This operation cannot be undone automatically. │
│ You can manually rollback if needed.                         │
│                                                              │
│ Dry Run Mode:                                                │
│ ☐ Perform dry run first (test without applying changes)    │
│                                                              │
│ [← Back to Config] [Execute Operation →]                   │
└─────────────────────────────────────────────────────────────┘
```

**Conflict Detection**:
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Conflicts Detected                                       │
│                                                              │
│ The following conflicts must be resolved before proceeding: │
│                                                              │
│ Conflict 1: PL-2401-0005                                     │
│ Issue: This price list has pending approval workflow        │
│ Current approver: Sarah Johnson (Procurement Manager)        │
│                                                              │
│ Resolution Options:                                          │
│ ( ) Wait for approval completion                            │
│ ( ) Cancel approval and proceed with operation              │
│ (•) Skip this item                                          │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ Conflict 2: PL-2401-0008, PL-2401-0012                        │
│ Issue: Referenced in 5 active purchase orders                │
│ Archiving these will affect ongoing procurement             │
│                                                              │
│ Resolution Options:                                          │
│ ( ) Archive and update purchase orders                      │
│ (•) Skip these items                                        │
│ ( ) Cancel operation                                         │
│                                                              │
│ [Resolve All Conflicts] [Cancel Operation]                 │
└─────────────────────────────────────────────────────────────┘
```

### Step 4: Execute Operation

**Execution in Progress**:
```
┌─────────────────────────────────────────────────────────────┐
│ Executing Bulk Operation...                             [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Operation: Archive Price Lists                               │
│ Processing: 8 of 15 (53%)                                   │
│                                                              │
│ [▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░] 53%                                 │
│                                                              │
│ Current: Processing PL-2401-0008 (Meat & Poultry)           │
│ Estimated time remaining: 15 seconds                         │
│                                                              │
│ Progress Log:                                                │
│ ✓ PL-2401-0001 archived successfully                        │
│ ✓ PL-2401-0002 archived successfully                        │
│ ✓ PL-2401-0003 archived successfully                        │
│ ✓ PL-2401-0004 archived successfully                        │
│ ✓ PL-2401-0005 archived successfully                        │
│ ✓ PL-2401-0006 archived successfully                        │
│ ✓ PL-2401-0007 archived successfully                        │
│ ⏳ PL-2401-0008 processing...                                │
│ ⏳ PL-2401-0009 queued                                        │
│ ... (6 more queued)                                         │
│                                                              │
│ [Pause] [Cancel Operation]                                  │
│                                                              │
│ Note: Canceling will not undo completed items              │
└─────────────────────────────────────────────────────────────┘
```

**Operation Complete (Success)**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ✓                                        │
│                                                              │
│        Bulk Operation Completed Successfully!                │
│                                                              │
│ Operation: Archive Price Lists                               │
│ Completed: 15 of 15 (100%)                                  │
│ Duration: 28 seconds                                         │
│                                                              │
│ Results:                                                     │
│ ✓ Success: 15 price lists                                  │
│ ✗ Failed: 0 price lists                                    │
│ ⚠️ Warnings: 2 items                                        │
│                                                              │
│ Warnings:                                                    │
│ • PL-2401-0008: Related purchase orders updated              │
│ • PL-2401-0012: Related purchase orders updated              │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Summary                                   │              │
│ │                                           │              │
│ │ • 15 price lists archived                 │              │
│ │ • 1,245 products affected                 │              │
│ │ • 3 vendors notified                      │              │
│ │ • 15 audit log entries created            │              │
│ │                                           │              │
│ │ Operation ID: BLK-OP-2401-0001             │              │
│ │ Can be rolled back until: Jan 25, 2024    │              │
│ └───────────────────────────────────────────┘              │
│                                                              │
│ [View Details] [Rollback Operation] [Close]                │
└─────────────────────────────────────────────────────────────┘
```

**Operation Complete (with Errors)**:
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ⚠️                                       │
│                                                              │
│      Operation Completed with Errors                         │
│                                                              │
│ Operation: Update Prices                                     │
│ Completed: 12 of 15 (80%)                                   │
│ Duration: 35 seconds                                         │
│                                                              │
│ Results:                                                     │
│ ✓ Success: 12 price lists                                  │
│ ✗ Failed: 3 price lists                                    │
│                                                              │
│ Failed Items:                                                │
│ • PL-2401-0003: Locked by another user                       │
│ • PL-2401-0007: Validation error (invalid prices)            │
│ • PL-2401-0014: Database connection timeout                  │
│                                                              │
│ Options:                                                     │
│ [Retry Failed Items] [Rollback All] [Close]                │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Error Details                             │              │
│ │                                           │              │
│ │ PL-2401-0007: Invalid prices detected     │              │
│ │ • Product PROD-045: Price $0.00          │              │
│ │ • Product PROD-089: Price negative       │              │
│ │                                           │              │
│ │ Action: Fix prices and retry             │              │
│ └───────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## Rollback Capability

**Rollback Button**: Available in operation complete dialog and history

### Rollback Dialog
```
┌─────────────────────────────────────────────────────────────┐
│ Rollback Bulk Operation                                 [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Are you sure you want to rollback this operation?           │
│                                                              │
│ Operation Details:                                           │
│ ID: BLK-OP-2401-0001                                         │
│ Type: Archive Price Lists                                   │
│ Executed: Jan 20, 2024 at 10:30 AM                         │
│ By: John Smith                                               │
│ Affected: 15 price lists                                    │
│                                                              │
│ Rollback will:                                               │
│ • Restore 15 price lists to "Active" status                │
│ • Revert all product price changes                          │
│ • Restore original validity dates                           │
│ • Update 5 related purchase orders                          │
│ • Send notification to 3 vendors                            │
│ • Create rollback audit log entry                           │
│                                                              │
│ ⚠️ Warning: Rollback cannot be undone                       │
│                                                              │
│ Rollback Validation:                                         │
│ ✓ All items eligible for rollback                          │
│ ✓ No conflicting changes since operation                   │
│ ✓ You have permission to rollback                          │
│                                                              │
│ Reason for Rollback: (required)                             │
│ [Operation applied incorrectly_______________]              │
│                                                              │
│ [Cancel] [Confirm Rollback]                                │
└─────────────────────────────────────────────────────────────┘
```

**Rollback with Conflicts**:
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Rollback Conflicts Detected                              │
│                                                              │
│ Cannot rollback some items due to changes:                  │
│                                                              │
│ PL-2401-0005:                                                 │
│ Issue: Modified by Sarah Johnson after bulk operation       │
│ Changed: Prices updated on Jan 21, 2024                     │
│ → Cannot rollback this item automatically                   │
│                                                              │
│ PL-2401-0012:                                                 │
│ Issue: Deleted by system administrator                       │
│ → Cannot rollback (item no longer exists)                   │
│                                                              │
│ Options:                                                     │
│ [Partial Rollback (13 items)] [Cancel] [View Details]      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operation History

**Tab**: History tab in main page

### History List

**Time Range Selector**:
```
┌─────────────────────────────────────────────────────────────┐
│ Show operations from: [Last 30 Days ▼]                      │
└─────────────────────────────────────────────────────────────┘
```

**History Table**:
```
┌─────────────────────────────────────────────────────────────┐
│ Operation History                                            │
│                                                              │
│ Operation ID    Type      Items  Status     Date       By    │
│ ─────────────────────────────────────────────────────────── │
│ BLK-OP-2401-0003 Archive   15    ✓ Success  Jan 20    You   │
│ BLK-OP-2401-0002 Export    25    ✓ Success  Jan 19    You   │
│ BLK-OP-2401-0001 Update    12    ⚠️ Partial  Jan 18    Sarah │
│ BLK-OP-2301-0345 Delete    5     ✗ Failed   Jan 15    Mike  │
│                                                              │
│ [Load More]                                                  │
└─────────────────────────────────────────────────────────────┘
```

**History Detail Card** (click row):
```
┌─────────────────────────────────────────────────────────────┐
│ Operation Details: BLK-OP-2401-0003                           │
│                                                              │
│ Operation Type: Archive Price Lists                          │
│ Status: ✓ Completed Successfully                            │
│                                                              │
│ Execution Details:                                           │
│ Executed by: John Smith (Procurement Staff)                 │
│ Started: Jan 20, 2024 at 10:30:15 AM                        │
│ Completed: Jan 20, 2024 at 10:30:43 AM                      │
│ Duration: 28 seconds                                         │
│                                                              │
│ Items Processed:                                             │
│ • Total: 15 price lists                                     │
│ • Successful: 15 (100%)                                     │
│ • Failed: 0                                                  │
│ • Warnings: 2                                                │
│                                                              │
│ Affected Data:                                               │
│ • Price lists archived: 15                                  │
│ • Products affected: 1,245                                  │
│ • Vendors notified: 3                                       │
│ • Purchase orders updated: 5                                │
│                                                              │
│ Rollback Status:                                             │
│ ✓ Can be rolled back until: Jan 25, 2024                   │
│ ✗ Not rolled back                                           │
│                                                              │
│ [View Full Log] [Rollback Operation] [Export Report]       │
│                                                              │
│ ┌───────────────────────────────────────────┐              │
│ │ Detailed Log (Last 10 entries)            │              │
│ │                                           │              │
│ │ 10:30:43 - Operation completed            │              │
│ │ 10:30:41 - PL-2401-0015 archived ✓        │              │
│ │ 10:30:39 - PL-2401-0014 archived ✓        │              │
│ │ 10:30:37 - PL-2401-0013 archived ✓        │              │
│ │ ... (12 more entries)                     │              │
│ │                                           │              │
│ │ [View Full Log (47 entries)]              │              │
│ └───────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## Scheduled Operations

**Tab**: Scheduled tab in main page

### Scheduled Operations List
```
┌─────────────────────────────────────────────────────────────┐
│ Scheduled Bulk Operations                                    │
│                                                              │
│ [+ Schedule New Operation]                                  │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Archive Expired Q1 Price Lists                       │    │
│ │                                                      │    │
│ │ Operation: Archive                                   │    │
│ │ Items: 23 price lists (auto-selected)               │    │
│ │ Scheduled: Jan 31, 2024 at 11:00 PM                │    │
│ │ Status: Active • Runs in 11 days                    │    │
│ │                                                      │    │
│ │ Recurrence: None (one-time)                         │    │
│ │ Created by: Sarah Johnson                           │    │
│ │                                                      │    │
│ │ [Edit] [Run Now] [Disable] [Delete]                │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Weekly Price List Backup Export                     │    │
│ │                                                      │    │
│ │ Operation: Export to Excel                           │    │
│ │ Items: All active price lists                       │    │
│ │ Next run: Jan 27, 2024 at 11:00 PM                 │    │
│ │ Status: Active • Runs in 7 days                     │    │
│ │                                                      │    │
│ │ Recurrence: Weekly (every Friday)                   │    │
│ │ Created by: You                                      │    │
│ │                                                      │    │
│ │ [Edit] [Run Now] [Disable] [Delete]                │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Schedule Operation Dialog
```
┌─────────────────────────────────────────────────────────────┐
│ Schedule Bulk Operation                                 [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Operation Name: *                                            │
│ [Archive Expired Q1 Price Lists_______________]             │
│                                                              │
│ Operation Type: *                                            │
│ [Archive ▼]                                                 │
│                                                              │
│ Selection Criteria:                                          │
│ (•) Use saved selection                                     │
│     Saved selection: [Expired Lists (23 items) ▼]          │
│                                                              │
│ ( ) Use filter criteria (dynamic selection)                 │
│     Items matching filters will be selected at runtime      │
│                                                              │
│ Schedule:                                                    │
│ (•) One-time                                                │
│     Run on: [Jan 31, 2024 📅] at [11:00 PM ⏰]            │
│                                                              │
│ ( ) Recurring                                               │
│     Frequency: [Weekly ▼] on [Friday ▼] at [11:00 PM]     │
│     Ends: ( ) Never  (•) On date [Dec 31, 2024 📅]        │
│                                                              │
│ Notifications:                                               │
│ ☑ Notify me before execution (1 hour)                      │
│ ☑ Notify me after completion                               │
│ ☐ Send summary report                                      │
│                                                              │
│ Options:                                                     │
│ ☑ Skip operation if no items match criteria                │
│ ☐ Require manual approval before execution                 │
│                                                              │
│ [Cancel] [Save Schedule]                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Specific Operation Details

### Archive Operation
- Changes status to "Archived"
- Price lists no longer appear in active lists
- Can be un-archived later
- Affects purchase order visibility

### Delete Operation
- Permanent deletion (with soft delete option)
- Only drafts or rejected items eligible
- Requires confirmation + reason
- Cannot be undone (except via rollback window)
- Creates comprehensive audit log

### Export Operation
- Supports Excel, PDF, CSV formats
- Batch export up to 100 price lists
- Generates zip file for large exports
- Includes summary sheet
- Option to include price history

### Update Prices Operation
- Percentage or fixed amount adjustment
- Selective product/category targeting
- Rounding options
- Preview before applying
- Validates price ranges

### Extend Validity Dates
- Extend by duration or set new dates
- Validates overlapping periods
- Updates related purchase orders
- Notifies vendors automatically

### Change Status Operation
- Batch status updates
- Workflow validation
- Approval requirements respected
- Notification triggers

---

## Empty States

### No Selection Made
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     📋                                       │
│                                                              │
│            No Price Lists Selected                           │
│                                                              │
│   Select one or more price lists to perform bulk            │
│   operations.                                                │
│                                                              │
│   Use the checkboxes in the table or quick selection        │
│   tools above to get started.                               │
│                                                              │
│   [View Selection Guide]                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### No Operations History
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     📊                                       │
│                                                              │
│              No Operations History                           │
│                                                              │
│   No bulk operations have been performed yet.               │
│                                                              │
│   [Perform First Operation]                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### No Scheduled Operations
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     📅                                       │
│                                                              │
│           No Scheduled Operations                            │
│                                                              │
│   Automate repetitive bulk operations by scheduling them.   │
│                                                              │
│   [Schedule Operation] [Learn More]                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Loading States

### Loading Price Lists
```
┌─────────────────────────────────────────────────────────────┐
│ [░░░░] [░░░░░░░░░░░] [░░░░░░] [░░░░] [░░░░░░] [░░] [░░░░] │
│ [░░░░] [░░░░░░░░░░░] [░░░░░░] [░░░░] [░░░░░░] [░░] [░░░░] │
│ [░░░░] [░░░░░░░░░░░] [░░░░░░] [░░░░] [░░░░░░] [░░] [░░░░] │
│                                                              │
│ Loading price lists...                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Error States

### Selection Load Error
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ⚠️                                       │
│                                                              │
│         Failed to Load Price Lists                           │
│                                                              │
│   There was a problem loading the price list data.          │
│   Please try again or contact support.                      │
│                                                              │
│   Error: Database connection timeout                         │
│                                                              │
│   [Try Again] [Contact Support]                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Operation Failed
```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     ✗                                        │
│                                                              │
│            Operation Failed                                  │
│                                                              │
│   The bulk operation could not be completed.                │
│                                                              │
│   Error: Insufficient permissions for 5 items               │
│                                                              │
│   Items affected: 0 of 15                                   │
│   All changes have been rolled back.                        │
│                                                              │
│   [Try Again] [Contact Support] [Close]                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsive Design

### Desktop (≥1024px)
- Full table layout
- Side-by-side wizard steps
- All columns visible
- Inline action buttons

### Tablet (768px-1023px)
- Horizontal scrollable table
- Full-screen wizard
- Stacked summary cards
- Collapsed action menus

### Mobile (<768px)
- Card-based price list view
- Bottom sheet for operations
- Full-screen wizard
- Simplified selection (tap cards)

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- **Tab**: Navigate elements
- **Space**: Toggle checkboxes
- **Enter**: Execute actions
- **Ctrl+A**: Select all visible
- **Escape**: Cancel/close dialogs
- **Arrow Keys**: Navigate table rows

### Screen Reader Support
```html
<table role="table" aria-label="Price lists for bulk operations">
  <caption>Select price lists to perform bulk operations</caption>
  <thead>
    <tr>
      <th scope="col">
        <input type="checkbox" aria-label="Select all visible price lists" />
      </th>
    </tr>
  </thead>
</table>

<div role="status" aria-live="polite" aria-atomic="true">
  15 price lists selected. Archive operation available.
</div>

<button aria-label="Execute bulk archive operation" aria-describedby="archive-help">
  Archive Selected
</button>
```

---

## Performance Optimization

### Batch Processing
- Process in batches of 25 items
- Parallel processing where possible
- Queue management for large operations
- Progress streaming for real-time updates

### API Optimization
- Bulk API endpoints (not individual calls)
- Transaction support for rollback
- Optimistic locking for conflicts
- Connection pooling

**Performance Targets**:
- Selection UI: <1 second
- Operation validation: <2 seconds
- Processing: 2-3 items/second
- Rollback: <5 seconds

---

## Security

### Permission Checks
- Verify user permissions before showing actions
- Item-level permission validation
- Audit all operations
- Require confirmation for destructive actions

### Data Integrity
- Transaction support
- Optimistic locking
- Conflict detection
- Rollback capability

---

## Analytics

```javascript
// Operation started
analytics.track('Bulk Operation Started', {
  operation_type: 'archive',
  item_count: 15,
  user_role: 'procurement_staff'
});

// Operation completed
analytics.track('Bulk Operation Completed', {
  operation_id: 'BLK-OP-2401-0001',
  operation_type: 'archive',
  success_count: 15,
  failed_count: 0,
  duration_seconds: 28
});

// Rollback performed
analytics.track('Bulk Operation Rolled Back', {
  operation_id: 'BLK-OP-2401-0001',
  reason: 'incorrect_application',
  items_rolled_back: 15
});
```

---

## API Integration

**POST /api/bulk-operations/validate**
```javascript
// Validate selection
const response = await fetch('/api/bulk-operations/validate', {
  method: 'POST',
  body: JSON.stringify({
    operation_type: 'archive',
    price_list_ids: ['PL-2401-0001', 'PL-2401-0002']
  })
});

// Response:
{
  "eligible": 15,
  "ineligible": 0,
  "conflicts": [],
  "estimated_duration": 30
}
```

**POST /api/bulk-operations/execute**
```javascript
// Execute operation
const response = await fetch('/api/bulk-operations/execute', {
  method: 'POST',
  body: JSON.stringify({
    operation_type: 'archive',
    price_list_ids: ['PL-2401-0001'],
    options: {
      notify_vendors: true,
      create_audit_log: true
    }
  })
});

// Response (async):
{
  "operation_id": "BLK-OP-2401-0001",
  "status": "processing"
}
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 20, 2024 | System | Initial creation |

---

**END OF DOCUMENT**
