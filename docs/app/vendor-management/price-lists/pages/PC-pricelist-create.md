# Page Content: Create Price List - Multi-Step Wizard

## Document Information
- **Module**: Vendor Management
- **Sub-Module**: Price Lists
- **Page**: Create Price List Wizard (Staff-Facing)
- **Route**: `/vendor-management/price-lists/create`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-23
- **Owner**: UX/Content Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-23 | System | Initial version based on UC-PL-001, BR-PL-001 |

---

## Overview

**Page Purpose**: Multi-step wizard to create new price lists from vendors with product pricing, terms, and conditions. Guides users through 5 steps to capture comprehensive vendor pricing with validation, approval workflow, and multiple creation methods (wizard, quick create, template, clone, Excel import).

**User Personas**: Procurement Manager, Procurement Staff, Purchasing Coordinator

**Related Documents**:
- [Business Requirements](../BR-price-lists.md) - BR-PL-001, BR-PL-002, BR-PL-003
- [Use Cases](../UC-price-lists.md) - UC-PL-001, UC-PL-002, UC-PL-003
- [Technical Specification](../TS-price-lists.md)
- [Data Dictionary](../DD-price-lists.md)
- [Validation Rules](../VAL-price-lists.md)

---

## Creation Methods Overview

The system supports **5 creation methods** to accommodate different workflows:

### 1. Full Wizard (Default)
**Route**: `/vendor-management/price-lists/create`
**Steps**: 5-step guided process with comprehensive validation
**Use Case**: New price lists requiring detailed pricing, terms, and approval
**Time**: 5-10 minutes

### 2. Quick Create
**Route**: `/vendor-management/price-lists/create?mode=quick`
**Steps**: Single-page simplified form
**Use Case**: Rapid entry of basic price lists without detailed terms
**Time**: 2-3 minutes

### 3. Use Template
**Route**: `/vendor-management/price-lists/create?from=template&template_id={id}`
**Steps**: 4 steps (pre-filled product list from template)
**Use Case**: Creating price lists from distributed pricelist templates
**Time**: 3-5 minutes

### 4. Clone Existing
**Route**: `/vendor-management/price-lists/create?clone={id}`
**Steps**: 5 steps (all data pre-filled from source price list)
**Use Case**: Creating updated versions or similar price lists
**Time**: 3-5 minutes

### 5. Excel Import
**Route**: `/vendor-management/price-lists/import`
**Steps**: 4-step import wizard with mapping and validation
**Use Case**: Bulk import from vendor Excel submissions
**Time**: 5-8 minutes

---

## Wizard Overview (Full Create Method)

### Wizard Steps
1. **Basic Information** - Vendor, currency, effective dates, source type, reference details
2. **Product Selection** - Search, browse, multi-select products with UOM configuration
3. **Pricing Details** - Base prices, UOM, MOQ, quantity breakpoints, tiered pricing
4. **Terms & Conditions** - Payment terms, lead time, warranty, delivery terms, attachments
5. **Review & Submit** - Summary preview, validation check, submit for approval

### Wizard Navigation Pattern
- **Progress Indicator**: Horizontal stepper showing current step and completion status
- **Navigation Buttons**: Previous, Next, Save Draft, Submit for Approval
- **Auto-Save**: Draft saved every 2 minutes automatically (configurable)
- **Exit Warning**: Prompt user if unsaved changes when attempting to leave
- **Keyboard Navigation**: Tab, Enter, Escape support throughout

### Auto-Save Behavior
```
┌─────────────────────────────────────────────────────────┐
│  ✓ Draft auto-saved at 10:45 AM                        │
│  [Restore previous draft?]  [Start fresh]              │
└─────────────────────────────────────────────────────────┘
```

**Auto-Save Features**:
- Saves every 2 minutes when changes detected
- Visual indicator showing last save time
- Ability to restore previous draft on page load
- Manual "Save Draft" button always available
- Drafts retained for 30 days

---

## Page Header

### Page Title
**Text**: Create Price List
**Style**: H1, text-3xl font-bold text-gray-900
**Location**: Top left of page

### Breadcrumb
**Text**: Home / Vendor Management / Price Lists / Create
**Location**: Above page title (mb-2)
**Interactive**: All segments except "Create" are clickable links
**Style**: text-sm text-gray-500

### Header Actions
| Button Label | Purpose | Style | Visibility | Icon | Keyboard |
|--------------|---------|-------|------------|------|----------|
| Switch to Quick Create | Change to single-page mode | Link (text-blue-600) | Step 1 only | ⚡ | Alt+Q |
| Save Draft | Save current progress without submitting | Secondary (white outline) | Always visible | 💾 | Ctrl+S |
| Exit | Leave wizard (with unsaved changes warning) | Tertiary (text link) | Always visible | ✕ | Esc |

**"Switch to Quick Create" Behavior**:
- Only visible on Step 1
- Preserves any entered data
- Shows confirmation: "Switch to Quick Create mode? Current progress will be transferred."
- Transfers to `/price-lists/create?mode=quick` with data carried over

---

## Progress Indicator

### Horizontal Stepper Design

```
┌──────────────────────────────────────────────────────────────────────┐
│  1 ●━━━━━ 2 ○━━━━━ 3 ○━━━━━ 4 ○━━━━━ 5 ○                           │
│  Basic    Product   Pricing  Terms    Review                         │
│  Info     Selection Details          & Submit                        │
└──────────────────────────────────────────────────────────────────────┘
```

**Step States**:
- **Current Step**: Filled circle (●), bold text, blue-600 color, pulsing animation
- **Completed Step**: Filled circle with checkmark (✓), blue-600 color, clickable
- **Future Step**: Empty circle (○), gray-400 text, not clickable, cursor-not-allowed
- **Invalid Step**: Filled circle with exclamation (!), red-600 color, clickable
- **Connecting Line**: Solid line when step completed, dashed line when future

**Click Behavior**:
- **Completed steps**: Navigate to that step (no data loss)
- **Current step**: No action
- **Future steps**: Disabled, show tooltip "Complete previous steps first"
- **Invalid steps**: Navigate to step, highlight validation errors

**Tooltip on Hover**:
- Current: "Step 1 of 5 - In Progress"
- Completed: "Step 1 of 5 - Completed ✓ Click to edit"
- Future: "Step 3 of 5 - Complete previous steps first"
- Invalid: "Step 2 of 5 - Has errors ⚠ Click to fix"

**Mobile Adaptation** (<768px):
```
┌────────────────────────────┐
│  Step 1 of 5               │
│  Basic Information         │
│  ━━━━━━━●○○○○  20%         │
└────────────────────────────┘
```

---

## Step 1: Basic Information

### Section Header
**Title**: Price List Basic Information
**Icon**: 📋 (FileText, size-6, text-blue-600)
**Description**: Enter essential details about this price list submission.
**Style**: Sticky header, bg-white, border-b, shadow-sm when scrolled

### Form Layout

#### Field 1: Price List Name
**Label**: Price List Name *
**Input Type**: Text input
**Placeholder**: e.g., Fresh Produce - January 2024 - ABC Farms
**Max Length**: 200 characters
**Character Counter**: Visible (e.g., "45 / 200")
**Width**: Full width

**Validation**:
- Required field
- Minimum 5 characters
- Maximum 200 characters
- No special characters except: - , ( ) / &
- Cannot start or end with spaces

**Error Messages**:
- Empty: "Price list name is required"
- Too short: "Price list name must be at least 5 characters"
- Too long: "Price list name cannot exceed 200 characters"
- Invalid characters: "Only letters, numbers, hyphens, commas, parentheses, slashes, and ampersands allowed"
- Leading/trailing spaces: "Name cannot start or end with spaces"

**Help Text**:
```
ℹ️ Choose a descriptive name that identifies the vendor, product category,
and time period. This will help you locate the price list later.
Example: "Fresh Vegetables - Q1 2024 - GreenFarm Suppliers"
```

**Smart Suggestions** (below input):
```
💡 Suggested names based on vendor and date:
• Fresh Produce - January 2024 - {Vendor Name}
• {Vendor Name} - {Category} - {Month Year}
• {Vendor Name} Price List - {Date}
```

---

#### Field 2: Vendor Selection
**Label**: Vendor *
**Input Type**: Searchable dropdown (Combobox)
**Placeholder**: Search vendor by name or code...
**Width**: Full width
**Required**: Yes

**Dropdown Features**:
- **Search**: Real-time filtering as user types
- **Display**: Vendor name, code, status badge
- **Sorting**: Alphabetical by default
- **Pagination**: Load 50 vendors at a time (infinite scroll)
- **Recent Vendors**: Show 5 most recent at top with separator
- **Quick Actions**: "Add New Vendor" button at bottom

**Vendor List Item Display**:
```
┌─────────────────────────────────────────────────────────┐
│ ABC Foods Inc. (VEN-001)                                │
│ Preferred Vendor • Last Price List: 2 months ago        │
│ ──────────────────────────────────────────────────────  │
│ XYZ Distributors (VEN-002)                              │
│ Approved Vendor • Last Price List: 6 months ago         │
│ ──────────────────────────────────────────────────────  │
│ ... more vendors ...                                    │
│ ──────────────────────────────────────────────────────  │
│ + Add New Vendor                                        │
└─────────────────────────────────────────────────────────┘
```

**Selected State**:
```
┌─────────────────────────────────────────────────────────┐
│ Vendor: ABC Foods Inc. (VEN-001) ▼                      │
│ Status: Preferred Vendor ✓                              │
│ Contact: John Smith • john@abcfoods.com • (555) 123-4567│
│ Last Price List: 2 months ago                           │
│ [View Vendor Profile]  [View Price History]            │
└─────────────────────────────────────────────────────────┘
```

**Validation**:
- Required field
- Must select from list (no free text)
- Only active vendors allowed (warning for inactive: "This vendor is inactive. Price lists from inactive vendors require manager approval.")

**Error Messages**:
- Empty: "Please select a vendor"
- Inactive vendor: "⚠️ Warning: {Vendor Name} is inactive. This price list will require manager approval."

**"Add New Vendor" Action**:
- Opens vendor creation modal
- After creation, automatically selects new vendor
- Returns to price list creation flow

---

#### Field 3: Description
**Label**: Description
**Input Type**: Textarea
**Placeholder**: Add notes about this price list submission (optional)...
**Rows**: 4
**Max Length**: 2000 characters
**Character Counter**: Visible
**Width**: Full width

**Validation**: Optional (recommended)

**Help Text**: Provide context about this submission, special agreements, or important notes for approval reviewers.

**Rich Text Features** (optional enhancement):
- Bold, italic formatting
- Bullet lists
- @mentions for internal staff
- Hyperlinks

---

#### Field 4: Currency
**Label**: Currency *
**Input Type**: Dropdown select
**Default**: USD (based on system settings)
**Width**: 200px

**Common Currencies** (top of list):
- USD - US Dollar ($)
- EUR - Euro (€)
- GBP - British Pound (£)
- CAD - Canadian Dollar (C$)
- AUD - Australian Dollar (A$)

**All Currencies** (alphabetical):
- 150+ currencies with codes and symbols
- Searchable dropdown

**Validation**:
- Required field
- Cannot change after Step 2 (products selected)

**Warning on Change** (if products already selected):
```
⚠️ Changing currency will clear all entered prices. Continue?
[Cancel]  [Change Currency]
```

**Display Format**:
```
Currency: USD - US Dollar ($) ▼
```

**Help Text**: Select the currency for all prices in this list. This cannot be changed after adding products.

---

#### Field 5: Effective Date Range
**Label**: Effective Date Range *
**Input Type**: Date range picker
**Width**: Full width
**Layout**: Side-by-side date pickers

**Start Date (Effective From)**:
- **Label**: "Effective From"
- **Default**: Today's date
- **Min**: Today (cannot backdate)
- **Max**: +6 months from today
- **Icon**: 📅 Calendar

**End Date (Effective To)**:
- **Label**: "Effective To"
- **Default**: +3 months from start date
- **Min**: Start date + 1 day
- **Max**: +5 years from start date
- **Icon**: 📅 Calendar
- **Optional**: Can be left blank for "ongoing" price list

**Visual Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Effective Date Range *                                 │
│  ┌──────────────────┐       ┌──────────────────┐       │
│  │ Effective From   │   to  │ Effective To     │       │
│  │ 📅 01/15/2024    │       │ 📅 04/15/2024    │       │
│  └──────────────────┘       └──────────────────┘       │
│                                                         │
│  ℹ️ Duration: 90 days                                  │
│  ⚠️ Overlaps with existing price list "ABC-Dec2023"   │
└─────────────────────────────────────────────────────────┘
```

**Validation**:
- Start date required
- End date optional (blank = ongoing)
- If end date provided, must be after start date
- Duration warning if >365 days: "⚠️ This price list is valid for over 1 year. Consider shorter periods for better pricing control."
- Overlap detection with same vendor (shows warning, not error)

**Overlap Warning**:
```
⚠️ Date Range Overlap Detected

This date range overlaps with:
• "ABC Foods - Winter Produce" (VEN-001)
  Active: 12/01/2023 - 03/31/2024

Consider:
• Adjusting dates to avoid overlap
• Archiving the conflicting price list
• Continuing anyway (you can manage multiple active lists)

[Adjust Dates]  [Continue Anyway]
```

**Error Messages**:
- Start date empty: "Start date is required"
- Invalid range: "End date must be after start date"
- Past start date: "Start date cannot be in the past"
- Too far future: "Start date cannot be more than 6 months in the future"

**Calendar Picker Features**:
- Month/year dropdowns for fast navigation
- Highlight today's date
- Disable past dates
- Show existing price list periods on calendar (colored overlays)
- Keyboard navigation (arrow keys, Enter, Escape)

**Duration Calculator**:
- Automatically shows duration: "Duration: X days / X months"
- Updates in real-time as dates change

---

#### Field 6: Source Type
**Label**: Source Type *
**Input Type**: Radio buttons (vertical stack with descriptions)
**Default**: Manual
**Width**: Full width

**Options**:

```
○ Manual Entry
  Prices entered manually by procurement staff.
  Use for: Phone quotes, email submissions, negotiations

○ Template Submission
  Vendor submitted prices using a pricelist template.
  Use for: Structured vendor responses from distributed templates
  [Select Template] button (enabled when selected)

○ RFQ Response
  Vendor response to a formal Request for Quote.
  Use for: Competitive bidding, formal procurement
  [Link to RFQ] button (enabled when selected)

○ Negotiated Contract
  Prices from negotiated vendor contracts.
  Use for: Long-term agreements, strategic vendors
  [Attach Contract] button (enabled when selected)

○ Market Rate
  Prices based on current market rates/surveys.
  Use for: Commodity pricing, market-based procurement

○ Historical Update
  Updated version of previous price list.
  Use for: Price adjustments, annual updates
  [Select Previous List] button (enabled when selected)
```

**Conditional Fields Based on Selection**:

**If "Template Submission" selected**:
```
┌─────────────────────────────────────────────────────────┐
│  Template Reference                                     │
│  [Select Template ▼]                                    │
│                                                         │
│  Selected: Kitchen Equipment - Monthly Pricing (TPL-001)│
│  Products: 45 items • Distributed: 12/01/2023          │
│  [View Template]  [Load Products from Template]        │
└─────────────────────────────────────────────────────────┘
```

**If "RFQ Response" selected**:
```
┌─────────────────────────────────────────────────────────┐
│  RFQ Reference                                          │
│  [Select RFQ ▼]                                         │
│                                                         │
│  Selected: RFQ-2401-0001 - Fresh Produce Q1 2024        │
│  Due Date: 01/15/2024 • Vendors Invited: 12            │
│  [View RFQ]  [Load Products from RFQ]                  │
└─────────────────────────────────────────────────────────┘
```

**If "Negotiated Contract" selected**:
```
┌─────────────────────────────────────────────────────────┐
│  Contract Details                                       │
│  Contract Number: [_______________]                     │
│  Contract Date:   [📅 Select Date]                     │
│  Contract File:   [Upload Contract PDF/Excel] (optional)│
│  ℹ️ Attach the signed contract document for reference  │
└─────────────────────────────────────────────────────────┘
```

**If "Historical Update" selected**:
```
┌─────────────────────────────────────────────────────────┐
│  Previous Price List                                    │
│  [Select Previous List ▼]                               │
│                                                         │
│  Selected: ABC Foods - Dec 2023 (PL-2301-0045)          │
│  Products: 78 items • Avg Price: $2.45                 │
│  [View Previous List]  [Clone Products & Prices]       │
│  [Show Price Comparison After Import]                  │
└─────────────────────────────────────────────────────────┘
```

**Validation**:
- Required field
- If Template/RFQ/Historical selected, reference must be selected
- If Contract selected, contract number required

**Help Text**: Select how these prices were obtained. This helps track pricing sources and validation requirements.

---

#### Field 7: Reference Number/ID
**Label**: Reference Number/ID
**Input Type**: Text input
**Placeholder**: e.g., Quote #12345, Email ref, PO reference
**Max Length**: 100 characters
**Width**: 50%

**Validation**: Optional
**Help Text**: Internal reference number, quote ID, email reference, or purchase order number for tracking.

---

#### Field 8: Submission Date
**Label**: Submission Date
**Input Type**: Date picker
**Default**: Today's date
**Width**: 200px

**Validation**:
- Optional (defaults to today)
- Cannot be future date
- Cannot be more than 90 days in past (warning shown)

**Warning for old submissions**:
```
⚠️ This submission date is more than 30 days ago.
Prices may no longer be valid. Consider requesting updated pricing.
```

**Help Text**: Date when vendor provided these prices. Defaults to today.

---

#### Field 9: Priority Level
**Label**: Priority Level
**Input Type**: Radio buttons (horizontal with icons)
**Default**: Medium
**Width**: Full width

**Options**:
```
( ) 📋 Low           ( ) 📊 Medium         ( ) ⚠️ High          ( ) 🚨 Urgent
    Standard            Important            Critical             Emergency
```

**Descriptions** (shown below selected option):
- **Low**: Standard procurement timeline, no rush
- **Medium**: Important items, moderate priority (default)
- **High**: Critical items, expedited approval needed
- **Urgent**: Emergency procurement, immediate attention required

**Impact on Workflow**:
- **Low**: Standard 5-day approval SLA
- **Medium**: 3-day approval SLA
- **High**: 1-day approval SLA, email notifications
- **Urgent**: 4-hour approval SLA, SMS + email notifications, escalation

**Help Text**: Priority affects approval timeline and notification urgency.

---

### Step 1 Footer

**Navigation Buttons**:
```
┌──────────────────────────────────────────────────────────┐
│  [Save Draft]                    [Next: Products →]     │
└──────────────────────────────────────────────────────────┘
```

| Button | Action | Enabled Condition | Style | Keyboard |
|--------|--------|-------------------|-------|----------|
| Save Draft | Save progress, stay on step 1 | Always | Secondary (white outline) | Ctrl+S |
| Next: Products → | Validate and proceed to step 2 | All required fields complete | Primary (blue solid) | Enter |

**Validation Summary** (if errors exist):
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Please fix the following errors before continuing:  │
│                                                         │
│  • Price list name is required                          │
│  • Vendor must be selected                              │
│  • Currency is required                                 │
│  • Effective start date is required                     │
│  • Source type must be selected                         │
│                                                         │
│  [Jump to First Error]                                  │
└─────────────────────────────────────────────────────────┘
```

**"Jump to First Error" Action**:
- Scrolls to first invalid field
- Sets focus on field
- Highlights field with red border

**Auto-Save Indicator**:
```
✓ Draft saved at 10:45 AM
```

**Progress Saved Notification** (toast):
```
┌─────────────────────────────────────────────────────────┐
│  ✓ Progress Saved                                       │
│  Your draft has been saved automatically.               │
└─────────────────────────────────────────────────────────┘
```

---

## Step 2: Product Selection

### Section Header
**Title**: Select Products for Pricing
**Icon**: 📦 (Package, size-6, text-blue-600)
**Description**: Add products that will have prices in this price list.
**Style**: Sticky header, bg-white, border-b, shadow-sm

**Product Count Badge**:
```
📦 {count} products selected ({required} required, {optional} optional)
```

---

### Action Buttons (Top of Section)

| Button | Purpose | Icon | Style | Shortcut |
|--------|---------|------|-------|----------|
| Add Products | Open product search dialog | ➕ Plus | Primary | Ctrl+P |
| Bulk Add by Category | Add all products in category | 📦 Package | Secondary | Ctrl+B |
| Import from Excel | Upload Excel file with products | 📥 Upload | Secondary | Ctrl+I |
| Load from Template | Import from pricelist template | 📋 FileText | Secondary | - |
| Load from Previous | Copy from historical price list | 🔄 RotateCcw | Secondary | - |
| Clear All | Remove all products | 🗑️ Trash | Tertiary (danger) | - |

**Button Availability**:
- **Add Products**: Always available
- **Bulk Add by Category**: Always available
- **Import from Excel**: Always available
- **Load from Template**: Only if source_type = "Template Submission"
- **Load from Previous**: Only if source_type = "Historical Update"
- **Clear All**: Only when products > 0

---

### Product List States

#### Empty State
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│          📦 No Products Added Yet                       │
│                                                         │
│  Add products that vendors will provide pricing for.    │
│  Choose from several methods:                           │
│                                                         │
│  • Search and select individual products                │
│  • Add all products from a category                     │
│  • Import products from Excel file                      │
│  • Load from a pricelist template                       │
│  • Copy from a previous price list                      │
│                                                         │
│  [➕ Add Products]  [📦 Bulk Add]  [📥 Import Excel]  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

#### Product List Table

**Table Controls (above table)**:
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Search products...          [Category ▼] [Sort ▼]  │
│  ☐ Select All (125)             125 products            │
└─────────────────────────────────────────────────────────┘
```

**Search Bar**:
- Real-time filtering by product name, code, category
- Highlights matching text
- Shows result count

**Filters**:
- **Category**: Multi-select dropdown
- **Sort**: Name (A-Z), Name (Z-A), Category, Seq#

**Bulk Selection**:
- "Select All" checkbox
- "Select All on Page" vs "Select All {count} products"
- Bulk actions toolbar appears when >0 selected

---

**Table Headers**:

| Column | Width | Sortable | Resizable | Sticky | Content |
|--------|-------|----------|-----------|--------|---------|
| [Checkbox] | 40px | No | No | Left | Multi-select |
| Seq# | 60px | Yes | No | Left | Auto-numbered sequence |
| Product | 280px | Yes | Yes | Left | Product name + code |
| Category | 150px | Yes | Yes | No | Product category |
| UOM | 120px | No | No | No | Unit of measure |
| Pack Size | 100px | No | No | No | Package quantity |
| MOQ | 100px | No | No | No | Minimum order qty |
| Current Price | 120px | Yes | No | No | Last known price |
| Required | 90px | No | No | No | Toggle switch |
| Actions | 100px | No | No | Right | Edit, Remove |

**Column Descriptions**:
- **Checkbox**: Select for bulk operations
- **Seq#**: Display sequence (drag-drop reordering)
- **Product**: Product name, code, description preview
- **Category**: Primary product category
- **UOM**: Base unit of measure (editable)
- **Pack Size**: Quantity per package (editable)
- **MOQ**: Minimum order quantity (editable)
- **Current Price**: Last recorded price (reference only)
- **Required**: Toggle if vendor must price this item
- **Actions**: Edit product details, Remove from list

---

**Table Row Example**:
```
┌──────────────────────────────────────────────────────────────────────┐
│ ☐ ⋮⋮ 1  Fresh Tomatoes (PROD-001)              Vegetables            │
│           Roma variety, red, ripe                                    │
│           UOM: KG   Pack: 10 kg   MOQ: 50 kg   Last: $2.50/kg       │
│           [Required: ON ✓]  [✏️ Edit] [🗑️ Remove]                   │
└──────────────────────────────────────────────────────────────────────┘
```

**Row States**:
- **Default**: White background, border-b
- **Hover**: Light gray background (bg-gray-50)
- **Selected**: Blue tint background (bg-blue-50)
- **Editing**: Yellow tint background (bg-yellow-50)
- **Error**: Red tint background (bg-red-50)

**Drag Handle**:
- **Icon**: ⋮⋮ (GripVertical)
- **Behavior**: Drag to reorder rows
- **Visual**: Shows drop target line between rows
- **Update**: Seq# updates automatically

**Product Info Row**:
- **Line 1**: Product name (bold) + code (gray)
- **Line 2**: Description preview (italic, gray, 1-line truncate)
- **Line 3**: Configuration (UOM, Pack, MOQ, Last Price)
- **Line 4**: Actions (Required toggle, Edit, Remove)

**Required Toggle**:
```
[Required: ON ✓]  (green background, white text)
[Required: OFF]   (gray background, gray text)
```
- Click to toggle on/off
- When ON: Vendor must provide price for this item
- When OFF: Pricing optional

**Edit Action**:
- Opens inline editor or side panel
- Edit UOM, Pack Size, MOQ, Description
- Save/Cancel buttons

**Remove Action**:
- Confirmation dialog: "Remove {product name}?"
- Removes from list immediately
- Toast notification: "{product name} removed"

---

**Bulk Selection Toolbar** (appears when items selected):
```
┌─────────────────────────────────────────────────────────┐
│  ✓ 12 products selected                                 │
│  [Set Required] [Set Optional] [Edit UOM] [Remove All] │
│  [Cancel Selection]                                     │
└─────────────────────────────────────────────────────────┘
```

**Bulk Actions**:
- **Set Required**: Mark all selected as required
- **Set Optional**: Mark all selected as optional
- **Edit UOM**: Batch update UOM (opens dialog)
- **Remove All**: Remove all selected (with confirmation)
- **Cancel Selection**: Clear selection

---

### Dialog: Add Products

**Dialog Size**: Large (max-w-4xl)
**Height**: 80vh, scrollable body

#### Dialog Header
```
┌─────────────────────────────────────────────────────────┐
│  Add Products to Price List                      [✕]   │
└─────────────────────────────────────────────────────────┘
```

#### Dialog Body

**Search & Filters Section**:
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Search products by name, code, or description...    │
│                                                         │
│  Filters: ▼ Show Filters                               │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Category:    [All Categories ▼]                   │ │
│  │ Department:  [All Departments ▼]                  │ │
│  │ Supplier:    [All Suppliers ▼]                    │ │
│  │ Status:      ☑ Active only  ☐ Include inactive   │ │
│  │ Price:       ☑ Show last price  ☐ Show suppliers │ │
│  │                                                    │ │
│  │ [Reset Filters]                                   │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Product List** (with checkboxes):
```
┌─────────────────────────────────────────────────────────┐
│ ☑ Fresh Tomatoes (PROD-001)                            │
│   Category: Vegetables • Last Price: $2.50/kg          │
│   Stock: In Stock • UOM: KG • Suppliers: 3             │
│                                                         │
│ ☐ Fresh Lettuce (PROD-002)                             │
│   Category: Vegetables • Last Price: $1.80/kg          │
│   Stock: In Stock • UOM: KG • Suppliers: 2             │
│                                                         │
│ ☐ Fresh Carrots (PROD-003)                             │
│   Category: Vegetables • Last Price: $1.20/kg          │
│   Stock: Low Stock • UOM: KG • Suppliers: 4            │
│                                                         │
│ ... 247 more products ...                              │
│                                                         │
│ [Select All Visible] [Select None]  Showing 1-50/250  │
│ [← Previous] [Next →]                                  │
└─────────────────────────────────────────────────────────┘
```

**Product Item Features**:
- **Checkbox**: Multi-select
- **Product Name & Code**: Bold name, gray code
- **Metadata**: Category, Last Price, Stock Status, UOM, Supplier Count
- **Icons**:
  - Stock status: ✓ In Stock (green), ⚠️ Low (yellow), ✕ Out (red)
  - Price trend: ↑ Increasing, ↓ Decreasing, → Stable
- **Hover**: Show full description tooltip

**Selection Summary** (sticky footer in dialog):
```
┌─────────────────────────────────────────────────────────┐
│  ✓ 12 products selected                                 │
│  [View Selected]  [Clear Selection]                     │
└─────────────────────────────────────────────────────────┘
```

#### Dialog Footer
```
┌─────────────────────────────────────────────────────────┐
│  [Cancel]          [Add 12 Products to Price List]     │
└─────────────────────────────────────────────────────────┘
```

**Add Products Button**:
- Disabled when 0 selected
- Enabled when >0 selected
- Shows count: "Add {count} Products"
- Closes dialog and adds to table

---

### Dialog: Bulk Add by Category

**Dialog Size**: Medium (max-w-2xl)

#### Dialog Header
```
┌─────────────────────────────────────────────────────────┐
│  Bulk Add Products by Category                   [✕]   │
└─────────────────────────────────────────────────────────┘
```

#### Dialog Body
```
┌─────────────────────────────────────────────────────────┐
│  Select categories to add all their products:           │
│                                                         │
│  ☑ Vegetables (45 products)                            │
│  ☑ Fruits (38 products)                                │
│  ☐ Dairy (12 products)                                 │
│  ☐ Meat & Poultry (23 products)                        │
│  ☐ Seafood (18 products)                               │
│  ☐ Bakery (15 products)                                │
│  ☐ Dry Goods (67 products)                             │
│  ☐ Beverages (34 products)                             │
│  ☐ Cleaning Supplies (28 products)                     │
│  ☐ Kitchen Equipment (41 products)                     │
│                                                         │
│  [Select All] [Select None]                            │
│                                                         │
│  ✓ 2 categories selected (83 products)                 │
│                                                         │
│  Options:                                               │
│  ☑ Mark all as required                                │
│  ☐ Use default UOM                                     │
│  ☐ Skip products already in list                       │
└─────────────────────────────────────────────────────────┘
```

#### Dialog Footer
```
┌─────────────────────────────────────────────────────────┐
│  [Cancel]              [Add 83 Products]               │
└─────────────────────────────────────────────────────────┘
```

**Behavior**:
- Adds all products from selected categories
- Applies options (required, UOM, skip duplicates)
- Shows progress: "Adding 83 products..." with spinner
- Toast notification: "✓ 83 products added successfully"

---

### Dialog: Import from Excel

**Dialog Size**: Large (max-w-4xl)
**Multi-Step**: 4 steps with progress indicator

**Steps**:
1. **Upload File** - Select Excel file
2. **Map Columns** - Map Excel columns to system fields
3. **Validate Data** - Review validation errors/warnings
4. **Import Products** - Confirm and import

#### Step 1: Upload File

```
┌─────────────────────────────────────────────────────────┐
│  Step 1 of 4: Upload Excel File                        │
│  ━━━━━●○○○○                                            │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │                                                   │ │
│  │          📥 Drop Excel file here                  │ │
│  │          or click to browse                       │ │
│  │                                                   │ │
│  │  Supported: .xlsx, .xls (max 10MB)               │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Or download template:                                  │
│  [📥 Download Product Import Template]                 │
│                                                         │
│  Template includes:                                     │
│  • Product Code (required)                              │
│  • Product Name (required)                              │
│  • Category                                             │
│  • UOM                                                  │
│  • Pack Size                                            │
│  • MOQ                                                  │
│  • Required (Yes/No)                                    │
│                                                         │
│  [Cancel]                      [Next →]                │
└─────────────────────────────────────────────────────────┘
```

**File Upload Features**:
- Drag-drop or click to browse
- Supported formats: .xlsx, .xls
- Max file size: 10MB
- Progress bar during upload
- File validation (format, size, headers)

**Template Download**:
- Pre-formatted Excel template
- Column headers with examples
- Instructions sheet included
- Sample data rows

#### Step 2: Map Columns

```
┌─────────────────────────────────────────────────────────┐
│  Step 2 of 4: Map Excel Columns                        │
│  ━━━━━━━●○○                                            │
│                                                         │
│  File: product_list.xlsx (125 rows)                    │
│                                                         │
│  Map your Excel columns to system fields:              │
│                                                         │
│  Excel Column        →  System Field                   │
│  ─────────────────────  ──────────────────────────────│ │
│  Product Code        →  [Product Code ▼] *            │
│  Product Name        →  [Product Name ▼] *            │
│  Category            →  [Category ▼]                   │
│  Unit                →  [UOM ▼]                        │
│  Pack                →  [Pack Size ▼]                  │
│  Min Qty             →  [MOQ ▼]                        │
│  Required?           →  [Required ▼]                   │
│  <unmapped>          →  [Skip ▼]                       │
│                                                         │
│  ✓ All required fields mapped                          │
│                                                         │
│  [← Back]              [Next: Validate →]             │
└─────────────────────────────────────────────────────────┘
```

**Mapping Features**:
- Auto-detect columns by header name
- Dropdown to select system field
- Required fields marked with *
- Preview of first 3 rows
- Validation: Required fields must be mapped

#### Step 3: Validate Data

```
┌─────────────────────────────────────────────────────────┐
│  Step 3 of 4: Validate Data                            │
│  ━━━━━━━━━●○                                           │
│                                                         │
│  Validation Results:                                    │
│                                                         │
│  ✓ 118 rows valid                                      │
│  ⚠️ 5 rows with warnings                               │
│  ✕ 2 rows with errors (will be skipped)               │
│                                                         │
│  Errors (must fix or skip):                            │
│  • Row 12: Product code "XYZ-999" not found            │
│  • Row 45: Required field "UOM" is empty               │
│                                                         │
│  Warnings (can proceed):                                │
│  • Row 8: Category "Misc" doesn't exist (will create)  │
│  • Row 23: Pack size "0" is unusual                    │
│  • Row 34: MOQ is very high (500 units)                │
│  • Row 67: Duplicate product "PROD-001" (will skip)    │
│  • Row 89: UOM "EA" will be converted to "EACH"        │
│                                                         │
│  [View All Errors/Warnings]                            │
│                                                         │
│  [← Back]        [Skip Errors & Import 123 Products]  │
└─────────────────────────────────────────────────────────┘
```

**Validation Rules**:
- Product code must exist in system
- Required fields cannot be empty
- Numeric fields must be valid numbers
- Category must exist (or will be created with warning)
- Duplicate detection

**View All Errors/Warnings**:
- Opens detailed table view
- Shows row number, error/warning, value
- Allows fixing or skipping individual rows

#### Step 4: Import Products

```
┌─────────────────────────────────────────────────────────┐
│  Step 4 of 4: Importing Products                       │
│  ━━━━━━━━━━●                                           │
│                                                         │
│  Importing 123 products...                             │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  85%             │
│                                                         │
│  ✓ 104 imported                                        │
│  ⚠️ 19 remaining                                        │
│                                                         │
│  Please wait...                                         │
│                                                         │
│  [Cancel Import]                                        │
└─────────────────────────────────────────────────────────┘
```

**After Import Complete**:
```
┌─────────────────────────────────────────────────────────┐
│  ✓ Import Complete                                      │
│                                                         │
│  Results:                                               │
│  • 123 products imported successfully                   │
│  • 2 rows skipped (errors)                             │
│  • 5 warnings (see details)                            │
│                                                         │
│  [View Import Log]  [Done]                             │
└─────────────────────────────────────────────────────────┘
```

**Toast Notification**:
```
✓ 123 products imported successfully
```

---

### Step 2 Footer

**Navigation Buttons**:
```
┌──────────────────────────────────────────────────────────┐
│  [← Previous]  [Save Draft]      [Next: Pricing →]     │
└──────────────────────────────────────────────────────────┘
```

| Button | Action | Enabled Condition | Keyboard |
|--------|--------|-------------------|----------|
| ← Previous | Return to Step 1 | Always | Alt+← |
| Save Draft | Save progress | Always | Ctrl+S |
| Next: Pricing → | Proceed to Step 3 | At least 1 product added | Enter |

**Validation**:
- Minimum 1 product required
- At least 1 product must be marked "Required"
- All products must have valid UOM

**Error Message** (if validation fails):
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Cannot proceed to next step                         │
│                                                         │
│  • At least 1 product is required                       │
│  • At least 1 product must be marked as "Required"      │
│                                                         │
│  [Add Products]                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Step 3: Pricing Details

### Section Header
**Title**: Enter Product Pricing
**Icon**: 💰 (DollarSign, size-6, text-green-600)
**Description**: Provide base prices and quantity-based pricing tiers for each product.
**Style**: Sticky header

**Pricing Progress Badge**:
```
💰 {completed} of {total} products priced ({percentage}% complete)
```

---

### Pricing Entry Modes

**Mode Selector** (tabs above table):
```
┌─────────────────────────────────────────────────────────┐
│  ( Quick Entry )  ( Detailed Entry )  ( Bulk Entry )   │
└─────────────────────────────────────────────────────────┘
```

**Quick Entry**: Simple table with base price only
**Detailed Entry**: Full table with tiered pricing, discounts, notes
**Bulk Entry**: Spreadsheet-like interface for fast data entry

---

### Quick Entry Mode

**Pricing Table (Simple)**:

| Column | Width | Editable | Content |
|--------|-------|----------|---------|
| Product | 280px | No | Product name + code |
| UOM | 80px | No | Unit of measure |
| Pack Size | 80px | No | Package quantity |
| Base Price * | 120px | Yes | Price per UOM |
| Last Price | 120px | No | Previous price (reference) |
| Change | 80px | No | % change from last |
| Status | 80px | No | Priced / Not Priced |

**Table Row Example**:
```
┌──────────────────────────────────────────────────────────────────────┐
│  Fresh Tomatoes (PROD-001)   KG   10 kg   [$ 2.75____] $2.50  ↑10% │
│  ℹ️ Estimated based on last price: $2.50/kg                        │
└──────────────────────────────────────────────────────────────────────┘
```

**Price Input Field**:
- Currency symbol prefix ($)
- Decimal input (2 decimal places)
- Real-time validation
- Auto-calculate % change from last price
- Highlight: Green if lower, Red if higher, Gray if same

**Validation**:
- Required for "Required" products
- Must be >0
- Maximum 999,999.99
- Warning if >50% change from last price

**Warning for Large Price Change**:
```
⚠️ Price increased by 45% from last submission ($2.50 → $3.62).
Verify this price is correct.
[Confirm]  [Edit Price]
```

---

### Detailed Entry Mode

**Pricing Table (Full)**:

| Column | Width | Editable | Content |
|--------|-------|----------|---------|
| Product | 250px | No | Product name + code |
| UOM | 70px | No | Unit |
| Base Price * | 110px | Yes | Standard price |
| MOQ | 80px | Yes | Min order qty |
| Tiered Pricing | 200px | Yes | Qty breakpoints |
| Discount | 100px | Yes | % or fixed |
| Lead Time | 90px | Yes | Days |
| Notes | 150px | Yes | Special terms |
| Status | 70px | No | Complete/Incomplete |

**Table Row (Collapsed)**:
```
┌──────────────────────────────────────────────────────────────────────┐
│  Fresh Tomatoes (PROD-001)   KG   [$2.75] 50  [+2 tiers] [5%] 3d   │
│  [Expand for Details ▼]                                       ✓     │
└──────────────────────────────────────────────────────────────────────┘
```

**Table Row (Expanded)**:
```
┌──────────────────────────────────────────────────────────────────────┐
│  Fresh Tomatoes (PROD-001)                                          │
│  ────────────────────────────────────────────────────────────────── │
│  Base Pricing:                                                       │
│  • Base Price: $2.75/KG                                             │
│  • MOQ: 50 kg                                                        │
│  • Standard Lead Time: 3 days                                       │
│                                                                      │
│  Quantity-Based Pricing (Tiered):                                   │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Qty Range      │ Price/Unit  │ Discount │ Total Savings       │ │
│  ├────────────────────────────────────────────────────────────────│ │
│  │ 50 - 99 kg     │ $2.75       │ -        │ -                   │ │
│  │ 100 - 499 kg   │ $2.60       │ 5.5%     │ $15 per 100kg      │ │
│  │ 500+ kg        │ $2.45       │ 10.9%    │ $30 per 100kg      │ │
│  │ [+ Add Tier]                                                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Additional Terms:                                                   │
│  • Volume Discount: 5% on orders >$500                              │
│  • Payment Terms: Net 30 days                                       │
│  • Notes: "Organic certification available"                         │
│                                                                      │
│  [Collapse Details ▲]                                    [✏️ Edit]  │
└──────────────────────────────────────────────────────────────────────┘
```

**Tiered Pricing Dialog** (click "+ Add Tier" or "Edit"):
```
┌─────────────────────────────────────────────────────────┐
│  Tiered Pricing: Fresh Tomatoes                  [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Base Price: $2.75/kg (for 50-99 kg)                   │
│                                                         │
│  Tier 1:                                                │
│  Quantity Range: [100] to [499] kg                     │
│  Price per Unit: [$2.60]                               │
│  Discount: 5.5% (calculated)                           │
│                                                         │
│  Tier 2:                                                │
│  Quantity Range: [500] to [999999] kg (500+)           │
│  Price per Unit: [$2.45]                               │
│  Discount: 10.9% (calculated)                          │
│                                                         │
│  [+ Add Another Tier]                                  │
│                                                         │
│  Validation:                                            │
│  ✓ No overlapping ranges                               │
│  ✓ Prices decrease with quantity                       │
│  ✓ All required fields complete                        │
│                                                         │
│  [Cancel]                  [Save Tiered Pricing]       │
└─────────────────────────────────────────────────────────┘
```

**Tiered Pricing Validation**:
- Quantity ranges cannot overlap
- Prices should decrease with volume (warning if not)
- Upper range of one tier must be lower boundary of next tier
- Maximum 5 tiers per product

---

### Bulk Entry Mode

**Spreadsheet Interface**:
- Grid layout with editable cells
- Tab/Enter navigation between cells
- Copy/paste from Excel
- Auto-fill down feature
- Formula support for discounts

```
┌─────────────────────────────────────────────────────────┐
│  Bulk Pricing Entry (Excel-like)                        │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Product              │UOM│ Base Price│MOQ│Disc%│Notes │
│  ─────────────────────│───│───────────│───│─────│───── │
│  Fresh Tomatoes       │KG │   2.75    │50 │ 5   │      │
│  Fresh Lettuce        │KG │   1.80    │25 │ 0   │      │
│  Fresh Carrots        │KG │   1.20    │100│ 10  │Org   │
│  [+ Add Row]                                            │
│                                                         │
│  Tips:                                                  │
│  • Tab/Enter to navigate cells                          │
│  • Ctrl+C/V to copy/paste                              │
│  • Drag cell corner to auto-fill                       │
│  • Formulas: =B2*0.95 for 5% discount                  │
│                                                         │
│  [Import from Excel]  [Export to Excel]  [Clear All]  │
└─────────────────────────────────────────────────────────┘
```

---

### Action Buttons (Top of Section)

| Button | Purpose | Icon |
|--------|---------|------|
| Auto-Fill Prices | Copy last prices to all products | 🔄 |
| Apply Discount | Bulk apply % discount | 💯 |
| Import Prices from Excel | Upload pricing spreadsheet | 📥 |
| Export Template | Download Excel template | 📤 |
| Clear All Prices | Reset all pricing entries | 🗑️ |

**Auto-Fill Dialog**:
```
┌─────────────────────────────────────────────────────────┐
│  Auto-Fill Prices from Last Submission                  │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  ✓ 78 products have previous prices                    │
│  ✕ 47 products have no price history                   │
│                                                         │
│  Options:                                               │
│  ☑ Copy last price to current price                    │
│  ☑ Apply adjustment:  [○ None ○ % ○ Fixed amount]     │
│      Increase by: [5] [%]                              │
│  ☐ Only fill empty prices (don't overwrite)           │
│                                                         │
│  Preview:                                               │
│  Fresh Tomatoes: $2.50 → $2.63 (+5%)                   │
│  Fresh Lettuce: $1.80 → $1.89 (+5%)                    │
│  ... 76 more products                                   │
│                                                         │
│  [Cancel]            [Fill 78 Products]                │
└─────────────────────────────────────────────────────────┘
```

---

### Pricing Validation & Warnings

**Real-Time Validation**:
- Price >0 required
- Price ≤ 999,999.99
- 2 decimal places only
- Warning if >50% change from last price

**Validation Summary** (sticky bottom bar):
```
┌─────────────────────────────────────────────────────────┐
│  Pricing Status: 78 / 125 priced (62%)                  │
│  ⚠️ 47 required products missing prices                 │
│  ⚠️ 12 products with large price changes (>50%)         │
│  [Show Incomplete]  [Show Warnings]                     │
└─────────────────────────────────────────────────────────┘
```

**Click "Show Incomplete"**:
- Filters table to show only unpriced products
- Highlights rows

**Click "Show Warnings"**:
- Shows list of products with warnings
- Allows jumping to each product

---

### Step 3 Footer

**Navigation Buttons**:
```
┌──────────────────────────────────────────────────────────┐
│  [← Previous]  [Save Draft]      [Next: Terms →]        │
└──────────────────────────────────────────────────────────┘
```

| Button | Action | Enabled Condition | Keyboard |
|--------|--------|-------------------|----------|
| ← Previous | Return to Step 2 | Always | Alt+← |
| Save Draft | Save progress | Always | Ctrl+S |
| Next: Terms → | Proceed to Step 4 | All required products priced | Enter |

**Validation Error**:
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Cannot proceed - 47 required products need pricing  │
│                                                         │
│  Required products without prices:                      │
│  • Fresh Tomatoes (PROD-001)                            │
│  • Fresh Lettuce (PROD-002)                             │
│  ... 45 more products                                   │
│                                                         │
│  [Show All]  [Auto-Fill from Last Prices]              │
└─────────────────────────────────────────────────────────┘
```

---

## Step 4: Terms & Conditions

### Section Header
**Title**: Terms & Conditions
**Icon**: 📝 (FileText, size-6, text-blue-600)
**Description**: Define payment terms, delivery conditions, warranties, and attach supporting documents.
**Style**: Sticky header

---

### Form Sections

#### Section 1: Payment Terms

**Field 1: Payment Terms**
**Label**: Payment Terms *
**Input Type**: Dropdown select with custom option
**Width**: Full width

**Pre-defined Options**:
- Net 30 days
- Net 45 days
- Net 60 days
- Net 90 days
- Due on Receipt
- 2/10 Net 30 (2% discount if paid within 10 days)
- 5/10 Net 30 (5% discount if paid within 10 days)
- 50% Advance, 50% on Delivery
- Custom (opens text input)

**Default**: Net 30 days

**Custom Input** (if "Custom" selected):
```
┌─────────────────────────────────────────────────────────┐
│  Payment Terms: Custom ▼                                │
│                                                         │
│  Describe payment terms:                                │
│  [_________________________________________________]    │
│  [_________________________________________________]    │
│                                                         │
│  Example: "50% upon order, 30% upon delivery,          │
│  20% within 15 days of invoice"                         │
└─────────────────────────────────────────────────────────┘
```

**Validation**: Required field

**Help Text**: Specify when payment is due after invoice date.

---

**Field 2: Early Payment Discount**
**Label**: Early Payment Discount
**Input Type**: Conditional (checkbox + fields)
**Width**: Full width

```
☑ Offer early payment discount

If checked:
┌─────────────────────────────────────────────────────────┐
│  Discount: [2] [%]  if paid within [10] days            │
│                                                         │
│  Preview: 2% discount if paid within 10 days of invoice │
└─────────────────────────────────────────────────────────┘
```

**Validation**:
- Discount: 0.01% - 15%
- Days: 1 - 90

---

**Field 3: Late Payment Penalty**
**Label**: Late Payment Penalty
**Input Type**: Conditional (checkbox + fields)
**Width**: Full width

```
☐ Apply late payment penalty

If checked:
┌─────────────────────────────────────────────────────────┐
│  Penalty: [1.5] [%] per month on overdue balance        │
│                                                         │
│  ℹ️ Common range: 0.5% - 2% per month                  │
└─────────────────────────────────────────────────────────┘
```

---

#### Section 2: Delivery Terms

**Field 4: Lead Time**
**Label**: Standard Lead Time *
**Input Type**: Number input + dropdown
**Width**: 300px

```
┌─────────────────────────────────────────────────────────┐
│  Lead Time: [3] [Days ▼]                                │
│                                                         │
│  Units: Days / Weeks / Months                           │
└─────────────────────────────────────────────────────────┘
```

**Validation**:
- Required field
- Number: 1 - 365 (if days)
- Number: 1 - 52 (if weeks)
- Number: 1 - 12 (if months)

**Help Text**: Time between order placement and delivery.

---

**Field 5: Delivery Method**
**Label**: Delivery Method
**Input Type**: Radio buttons
**Width**: Full width

**Options**:
```
○ Vendor Delivers to Our Location (Delivered)
○ We Pick Up from Vendor Location (Pickup)
○ Third-Party Logistics / Freight (Freight)
○ Other (specify)
```

**If "Other" selected**:
```
┌─────────────────────────────────────────────────────────┐
│  Describe delivery method:                              │
│  [_________________________________________________]    │
└─────────────────────────────────────────────────────────┘
```

---

**Field 6: Delivery Charges**
**Label**: Delivery Charges
**Input Type**: Radio buttons + conditional inputs
**Width**: Full width

**Options**:
```
○ Included in Price (No additional delivery charge)

○ Fixed Fee per Order
  Fee: [$50.00] per delivery

○ Percentage of Order Value
  Rate: [5]% of order total

○ Tiered by Order Value
  [+ Add Tier]

  Tier 1: Orders <$100: $25 delivery fee
  Tier 2: Orders $100-$500: $15 delivery fee
  Tier 3: Orders >$500: Free delivery

○ Custom / Variable (describe)
  [_________________________________________________]
```

**Default**: Included in Price

---

**Field 7: Minimum Order Value**
**Label**: Minimum Order Value
**Input Type**: Currency input
**Width**: 200px

```
┌─────────────────────────────────────────────────────────┐
│  Minimum Order Value:  [$250.00]                        │
│                                                         │
│  ☑ Waive minimum for first 3 orders (new vendor)       │
└─────────────────────────────────────────────────────────┘
```

**Validation**:
- Optional
- If provided, must be >0
- Max: 999,999.99

**Help Text**: Minimum order amount required per purchase order.

---

#### Section 3: Warranty & Returns

**Field 8: Warranty Period**
**Label**: Warranty / Guarantee
**Input Type**: Radio buttons
**Width**: Full width

**Options**:
```
○ No Warranty

○ Satisfaction Guarantee
  Duration: [7] days from delivery
  Terms: Full refund if not satisfied

○ Product Warranty
  Duration: [30] days / [3] months / [1] year
  Coverage: [Defects in materials and workmanship]

○ Custom Warranty (describe)
  [_________________________________________________]
  [_________________________________________________]
```

---

**Field 9: Return Policy**
**Label**: Return Policy
**Input Type**: Textarea
**Placeholder**: Describe the return policy...
**Rows**: 4
**Max Length**: 1000 characters
**Width**: Full width

**Help Text**: Conditions for returning products (e.g., unopened, damaged, expiry date).

**Example Text** (placeholder):
```
"Products may be returned within 7 days if:
- Packaging is unopened and intact
- Product is damaged or defective
- Product expires within 30 days of delivery

Restocking fee: 10% for non-defective returns"
```

---

#### Section 4: Additional Terms

**Field 10: Insurance & Liability**
**Label**: Insurance & Liability
**Input Type**: Textarea
**Rows**: 3
**Max Length**: 500 characters
**Width**: Full width

**Placeholder**: "Vendor maintains $1M product liability insurance..."

---

**Field 11: Force Majeure**
**Label**: Force Majeure Clause
**Input Type**: Checkbox
**Width**: Full width

```
☑ Standard force majeure clause applies
   (Acts of God, natural disasters, war, strikes, etc.)
```

---

**Field 12: Special Conditions**
**Label**: Special Conditions / Notes
**Input Type**: Textarea
**Placeholder**: Any special terms, agreements, or conditions...
**Rows**: 4
**Max Length**: 2000 characters
**Width**: Full width

**Help Text**: Document any unique terms, volume commitments, exclusivity agreements, etc.

---

#### Section 5: Supporting Documents

**Field 13: Attachments**
**Label**: Attachments
**Input Type**: File upload (multiple)
**Width**: Full width
**Accepted Formats**: PDF, Excel (.xlsx, .xls), Word (.docx, .doc), Images (.jpg, .png)
**Max File Size**: 10MB per file
**Max Files**: 10

**Upload Area**:
```
┌─────────────────────────────────────────────────────────┐
│  📎 Attach Supporting Documents                         │
│                                                         │
│  Drop files here or click to browse                     │
│  (PDF, Excel, Word, Images - max 10MB each)            │
│                                                         │
│  Uploaded Files:                                        │
│  ✓ vendor_quote.pdf (1.2 MB)               [✕ Remove]  │
│  ✓ product_catalog.xlsx (3.8 MB)           [✕ Remove]  │
│  ✓ certification.pdf (850 KB)              [✕ Remove]  │
│                                                         │
│  [+ Add More Files]                                     │
└─────────────────────────────────────────────────────────┘
```

**File List Features**:
- File name with icon (based on type)
- File size
- Remove button
- Download/preview on click

**Document Types** (suggestions):
- Vendor quotes
- Product catalogs
- Certifications
- Contracts
- Insurance certificates
- Test reports

---

### Step 4 Footer

**Navigation Buttons**:
```
┌──────────────────────────────────────────────────────────┐
│  [← Previous]  [Save Draft]      [Next: Review →]       │
└──────────────────────────────────────────────────────────┘
```

| Button | Action | Enabled Condition | Keyboard |
|--------|--------|-------------------|----------|
| ← Previous | Return to Step 3 | Always | Alt+← |
| Save Draft | Save progress | Always | Ctrl+S |
| Next: Review → | Proceed to Step 5 | Payment terms completed | Enter |

**Validation**:
- Payment terms required
- Lead time required
- All other fields optional but recommended

---

## Step 5: Review & Submit

### Section Header
**Title**: Review & Submit Price List
**Icon**: ✓ (CheckCircle, size-6, text-green-600)
**Description**: Review all information before submitting for approval.
**Style**: Sticky header

---

### Summary Sections

#### Section 1: Basic Information Summary

```
┌─────────────────────────────────────────────────────────┐
│  📋 BASIC INFORMATION                          [✏️ Edit] │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Price List Name:  Fresh Produce - Jan 2024 - ABC Farm │
│  Vendor:           ABC Foods Inc. (VEN-001)             │
│  Currency:         USD - US Dollar ($)                  │
│  Effective Dates:  01/15/2024 - 04/15/2024 (90 days)   │
│  Source Type:      Manual Entry                         │
│  Priority:         Medium                               │
│  Created By:       John Smith                           │
│  Created On:       01/10/2024                           │
└─────────────────────────────────────────────────────────┘
```

**Edit Button**: Returns to Step 1 with all data preserved

---

#### Section 2: Products & Pricing Summary

```
┌─────────────────────────────────────────────────────────┐
│  📦 PRODUCTS & PRICING                         [✏️ Edit] │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Total Products:        125                             │
│  Required Products:     78 (all priced ✓)               │
│  Optional Products:     47 (39 priced)                  │
│                                                         │
│  Pricing Statistics:                                    │
│  • Average Price:       $3.25 per unit                  │
│  • Price Range:         $0.50 - $45.00                  │
│  • Total Value:         $15,234 (if all ordered at MOQ) │
│  • Products w/ Tiers:   23 (18%)                        │
│                                                         │
│  [View Full Product List]  [Export to Excel]           │
└─────────────────────────────────────────────────────────┘
```

**"View Full Product List"** (expands):
```
┌─────────────────────────────────────────────────────────┐
│  Product List (125 items):                              │
│                                                         │
│  1. Fresh Tomatoes (PROD-001)                           │
│     Base Price: $2.75/kg • MOQ: 50kg                    │
│     Tiered: 100kg→$2.60, 500kg→$2.45                   │
│                                                         │
│  2. Fresh Lettuce (PROD-002)                            │
│     Base Price: $1.80/kg • MOQ: 25kg                    │
│                                                         │
│  ... 123 more products ...                             │
│                                                         │
│  [Collapse]                                             │
└─────────────────────────────────────────────────────────┘
```

---

#### Section 3: Terms & Conditions Summary

```
┌─────────────────────────────────────────────────────────┐
│  📝 TERMS & CONDITIONS                         [✏️ Edit] │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Payment Terms:      Net 30 days                        │
│  Early Pay Discount: 2% if paid within 10 days          │
│  Lead Time:          3 days                             │
│  Delivery Method:    Vendor Delivers                    │
│  Delivery Charges:   Included in Price                  │
│  Minimum Order:      $250.00                            │
│  Warranty:           30 days satisfaction guarantee     │
│  Return Policy:      7 days, unopened products          │
│                                                         │
│  Attachments:        3 files                            │
│  • vendor_quote.pdf (1.2 MB)                            │
│  • product_catalog.xlsx (3.8 MB)                        │
│  • certification.pdf (850 KB)                           │
│                                                         │
│  [View Full Terms]                                      │
└─────────────────────────────────────────────────────────┘
```

---

### Validation Checklist

**System Validation Status**:
```
┌─────────────────────────────────────────────────────────┐
│  ✓ VALIDATION CHECKLIST                                 │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  ✓ Basic information complete                           │
│  ✓ Vendor selected and active                           │
│  ✓ At least 1 product added                             │
│  ✓ All required products priced                         │
│  ✓ Payment terms defined                                │
│  ✓ Lead time specified                                  │
│  ⚠️ Optional: 8 products without pricing                │
│  ⚠️ Warning: 12 large price changes (>50%)              │
│                                                         │
│  Status: Ready to Submit ✓                              │
└─────────────────────────────────────────────────────────┘
```

**Validation Categories**:
- **✓ Passed**: All requirements met
- **⚠️ Warning**: Optional items or warnings (can proceed)
- **✕ Failed**: Critical issues (cannot proceed)

---

### Approval Workflow Preview

```
┌─────────────────────────────────────────────────────────┐
│  🔄 APPROVAL WORKFLOW                                    │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  This price list will follow this approval path:        │
│                                                         │
│  1. ○ Department Manager (Sarah Johnson)                │
│     Auto-assigned • SLA: 1 day                          │
│                                                         │
│  2. ○ Procurement Manager (Mike Chen)                   │
│     If value >$10,000 • SLA: 2 days                     │
│                                                         │
│  3. ○ Finance Approval (Required)                       │
│     If contract terms >90 days • SLA: 1 day             │
│                                                         │
│  Estimated Approval Time: 2-4 business days             │
│                                                         │
│  ℹ️ You will receive email notifications at each stage  │
└─────────────────────────────────────────────────────────┘
```

---

### Submission Options

```
┌─────────────────────────────────────────────────────────┐
│  📤 SUBMISSION OPTIONS                                   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  ( ) Submit for Approval (Recommended)                  │
│      Send to approval workflow immediately              │
│      Status: Pending Approval                           │
│                                                         │
│  ( ) Save as Draft                                      │
│      Save progress and submit later                     │
│      Status: Draft                                      │
│                                                         │
│  ( ) Submit with Notes                                  │
│      Add comments for approvers                         │
│      Status: Pending Approval                           │
│      [Add Notes ▼]                                      │
│      ┌─────────────────────────────────────────────┐   │
│      │ Notes for approvers:                        │   │
│      │ [_____________________________________]     │   │
│      │ [_____________________________________]     │   │
│      └─────────────────────────────────────────────┘   │
│                                                         │
│  ( ) Submit & Create Another                            │
│      Submit and start a new price list                  │
│      Status: Pending Approval                           │
│                                                         │
│  Notifications:                                         │
│  ☑ Notify approvers via email                          │
│  ☑ Notify vendor of submission                         │
│  ☐ Send copy to my email                               │
└─────────────────────────────────────────────────────────┘
```

---

### Step 5 Footer

**Navigation Buttons**:
```
┌──────────────────────────────────────────────────────────┐
│  [← Previous]  [Save Draft]      [Submit for Approval]  │
└──────────────────────────────────────────────────────────┘
```

| Button | Action | Style | Keyboard |
|--------|--------|-------|----------|
| ← Previous | Return to Step 4 | Secondary | Alt+← |
| Save Draft | Save as draft, stay on page | Secondary | Ctrl+S |
| Submit for Approval | Submit and redirect to list | Primary (green) | Enter |

**Submit Button States**:
- **Ready**: "Submit for Approval" (green, enabled)
- **Processing**: "Submitting..." (disabled, spinner)
- **Success**: "Submitted ✓" (green, briefly before redirect)

---

### Submission Confirmation Dialog

**After clicking "Submit for Approval"**:
```
┌─────────────────────────────────────────────────────────┐
│  ✓ Price List Submitted Successfully                    │
│                                                         │
│  Price List: Fresh Produce - Jan 2024 - ABC Farm       │
│  Reference: PL-2401-0001                                 │
│  Status: Pending Approval                               │
│                                                         │
│  Next Steps:                                            │
│  1. Sarah Johnson (Dept Manager) will review           │
│  2. You'll receive email notification when approved     │
│  3. Price list will become active on 01/15/2024        │
│                                                         │
│  Estimated Approval: 2-4 business days                  │
│                                                         │
│  [View Price List]  [Create Another]  [Back to List]  │
└─────────────────────────────────────────────────────────┘
```

**Redirect Options**:
- **View Price List**: Go to price list detail page
- **Create Another**: Start new price list wizard
- **Back to List**: Return to price list list page

**Default Behavior**: Auto-redirect to list page after 5 seconds

---

## Quick Create Mode

**Route**: `/vendor-management/price-lists/create?mode=quick`

**Purpose**: Simplified single-page form for rapid price list entry

### Page Layout

**Page Header**:
```
┌─────────────────────────────────────────────────────────┐
│  Create Price List (Quick Mode)              [✕ Exit]  │
│                                                         │
│  [Switch to Full Wizard →]                             │
└─────────────────────────────────────────────────────────┘
```

**Single-Page Form** (all fields on one page):

```
┌─────────────────────────────────────────────────────────┐
│  BASIC INFORMATION                                      │
│  ─────────────────────────────────────────────────────  │
│  Name: [_________________________________]              │
│  Vendor: [Select Vendor ▼]                             │
│  Currency: [USD ▼]  Dates: [01/15/24] to [04/15/24]   │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│  PRODUCTS & PRICING                                     │
│  ─────────────────────────────────────────────────────  │
│  [➕ Add Products]  [Import Excel]                     │
│                                                         │
│  Product                   UOM  Base Price   MOQ        │
│  Fresh Tomatoes (PROD-001) KG   [$2.75]    [50]       │
│  Fresh Lettuce (PROD-002)  KG   [$1.80]    [25]       │
│  ... more products ...                                  │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│  TERMS (Optional)                                       │
│  ─────────────────────────────────────────────────────  │
│  Payment: [Net 30 ▼]  Lead Time: [3] days             │
│  Delivery: [○ Vendor Delivers  ○ Pickup]              │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│  [Save Draft]           [Submit for Approval]          │
└─────────────────────────────────────────────────────────┘
```

**Differences from Full Wizard**:
- Single page instead of 5 steps
- Simplified fields (fewer optional fields)
- No tiered pricing (base price only)
- Minimal terms section
- Faster completion (~2-3 minutes)

**Use Cases**:
- Quick vendor quotes
- Simple price updates
- Emergency procurement
- Basic vendor comparisons

---

## Clone Price List Mode

**Route**: `/vendor-management/price-lists/create?clone={id}`

**Purpose**: Create new price list by copying existing one

### Clone Dialog (before wizard)

```
┌─────────────────────────────────────────────────────────┐
│  Clone Price List                                [✕]   │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Source: Fresh Produce - Dec 2023 (PL-2301-0045)        │
│  Vendor: ABC Foods Inc.                                 │
│  Products: 125 items                                    │
│                                                         │
│  What to copy:                                          │
│  ☑ All products                                        │
│  ☑ Product pricing (will need review)                 │
│  ☑ Terms & conditions                                  │
│  ☐ Attachments                                         │
│                                                         │
│  New price list settings:                              │
│  Name: [Fresh Produce - Jan 2024 - ABC Foods]         │
│  Dates: [01/15/24] to [04/15/24]                      │
│                                                         │
│  Pricing adjustment (optional):                         │
│  ○ Keep same prices                                    │
│  ○ Increase all by: [5] [%]                            │
│  ○ Clear all prices (re-enter manually)                │
│                                                         │
│  [Cancel]              [Clone & Edit in Wizard]        │
└─────────────────────────────────────────────────────────┘
```

**After Clone**:
- Opens full wizard with all data pre-filled
- User can edit any step
- All validation still applies
- Shows "Cloned from {source}" badge

---

## Use Template Mode

**Route**: `/vendor-management/price-lists/create?from=template&template_id={id}`

**Purpose**: Create price list from distributed pricelist template

### Template Selection (if no template_id)

```
┌─────────────────────────────────────────────────────────┐
│  Create Price List from Template              [✕]     │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Select a template:                                     │
│                                                         │
│  ( ) Kitchen Equipment - Monthly (TPL-001)              │
│      45 products • Distributed: 12/01/2023             │
│      [View Template]                                    │
│                                                         │
│  ( ) Fresh Produce - Weekly (TPL-002)                   │
│      78 products • Distributed: 01/05/2024             │
│      [View Template]                                    │
│                                                         │
│  ( ) Dry Goods - Quarterly (TPL-003)                    │
│      112 products • Distributed: 11/15/2023            │
│      [View Template]                                    │
│                                                         │
│  [Cancel]              [Load Template]                 │
└─────────────────────────────────────────────────────────┘
```

**Wizard with Template**:
- Step 1: Pre-fills vendor, dates based on template distribution
- Step 2: Auto-loads all products from template with UOM, Pack, MOQ
- Step 3: Pricing table ready for price entry
- Step 4: Terms section empty (manual entry)
- Step 5: Review & submit

**Template Info Badge** (shown throughout wizard):
```
📋 Using Template: Kitchen Equipment - Monthly (TPL-001)
```

---

## Excel Import Mode

**Route**: `/vendor-management/price-lists/import`

**Purpose**: Bulk import complete price list from Excel

### Import Wizard (4 Steps)

**Step 1: Upload File**
**Step 2: Map Columns**
**Step 3: Validate Data**
**Step 4: Import**

*(See Step 2: Product Selection → Dialog: Import from Excel for detailed specs)*

**Additional Fields in Import**:
- Vendor (required column)
- Price List Name (optional, can auto-generate)
- Effective Dates (optional, can prompt)
- All product fields + pricing
- Terms (optional columns)

**Import Result**:
```
┌─────────────────────────────────────────────────────────┐
│  ✓ Price List Imported Successfully                     │
│                                                         │
│  Price List: Fresh Produce - Jan 2024 - ABC Farm       │
│  Reference: PL-2401-0001                                 │
│  Products: 125 imported                                 │
│  Status: Draft                                          │
│                                                         │
│  Next Steps:                                            │
│  • Review imported data                                 │
│  • Add terms & conditions (optional)                    │
│  • Submit for approval                                  │
│                                                         │
│  [Edit Price List]  [Submit Now]  [Back to List]      │
└─────────────────────────────────────────────────────────┘
```

---

## Auto-Save & Draft Management

### Auto-Save Behavior

**Auto-Save Triggers**:
- Every 2 minutes when changes detected
- Before navigating between steps
- After bulk operations
- Before closing/exiting

**Auto-Save Indicator**:
```
✓ Draft auto-saved at 10:45 AM
🔄 Saving draft...
⚠️ Auto-save failed - click to retry
```

**Draft Recovery** (on page load):
```
┌─────────────────────────────────────────────────────────┐
│  📝 Draft Found                                          │
│                                                         │
│  You have an unsaved draft from 30 minutes ago:         │
│                                                         │
│  Price List: Fresh Produce - Jan 2024 - ABC Farm       │
│  Last Saved: 10:15 AM                                   │
│  Progress: Step 3 of 5 (60% complete)                   │
│                                                         │
│  [Restore Draft]  [Start Fresh]  [View Draft]         │
└─────────────────────────────────────────────────────────┘
```

**Manual Save Draft**:
- Button always visible in header
- Keyboard: Ctrl+S
- Shows confirmation toast
- Redirects to draft list (optional)

---

## Exit & Unsaved Changes

### Exit Warning Dialog

**Triggered when**:
- Clicking "Exit" button
- Browser back button
- Closing tab/window
- Navigating away

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Unsaved Changes                                      │
│                                                         │
│  You have unsaved changes. What would you like to do?   │
│                                                         │
│  [Save Draft & Exit]  [Exit Without Saving]  [Cancel]  │
└─────────────────────────────────────────────────────────┘
```

**Save Draft & Exit**:
- Saves current progress
- Redirects to price list list
- Shows toast: "Draft saved successfully"

**Exit Without Saving**:
- Discards all changes
- Shows final confirmation
- Redirects to previous page

**Cancel**:
- Stays on current page
- No changes lost

---

## Validation Rules

### Field-Level Validation

**Real-Time Validation**:
- Validates on blur (when field loses focus)
- Shows error message below field
- Red border on invalid fields
- Prevents progression with errors

**Validation Messages**:
- Required field: "{Field name} is required"
- Format error: "{Field name} must follow format {pattern}"
- Range error: "{Field name} must be between {min} and {max}"
- Duplicate error: "{Field name} already exists"

### Step-Level Validation

**Before Next Button**:
- Validates all required fields in current step
- Shows validation summary if errors exist
- Scrolls to first error
- Highlights invalid fields

**Validation Summary**:
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Please fix 3 errors before continuing:              │
│                                                         │
│  • Price list name is required                          │
│  • Vendor must be selected                              │
│  • Effective start date is required                     │
│                                                         │
│  [Jump to First Error]                                  │
└─────────────────────────────────────────────────────────┘
```

### Business Logic Validation

**Cross-Field Validation**:
- End date > Start date
- MOQ ≤ Pack Size (warning)
- Tiered pricing: Higher qty = Lower price
- Total estimated value < Budget limit (if set)

**Vendor Validation**:
- Vendor must be active (warning if inactive)
- Vendor must have contact info (warning if missing)
- No duplicate active price lists for same vendor + dates (warning)

**Pricing Validation**:
- Price > 0
- Price ≤ 999,999.99
- Large price change warning (>50% from last)
- Unusual pricing patterns (e.g., all same price)

---

## Accessibility

### WCAG 2.1 AA Compliance

**Keyboard Navigation**:
- Tab order follows logical flow
- All interactive elements keyboard accessible
- Escape closes dialogs/dropdowns
- Enter submits forms
- Arrow keys navigate dropdowns/lists

**Screen Reader Support**:
- Semantic HTML (header, nav, main, aside)
- ARIA labels on all interactive elements
- ARIA live regions for dynamic content
- ARIA expanded/collapsed states
- Form field descriptions via aria-describedby

**Visual Accessibility**:
- Color contrast ratio ≥ 4.5:1 (text)
- Color contrast ratio ≥ 3:1 (UI components)
- Focus indicators visible and clear
- No reliance on color alone for meaning
- Text resize up to 200% without loss of functionality

**Form Accessibility**:
- Labels associated with inputs (for/id)
- Required fields marked with * and aria-required
- Error messages linked with aria-describedby
- Fieldsets for grouped fields
- Clear error messages with instructions

---

## Responsive Design

### Breakpoints

**Desktop** (≥1280px):
- Full wizard layout
- Side-by-side fields where appropriate
- Large tables with all columns visible
- Multi-column forms

**Tablet** (768px - 1279px):
- Stacked form fields
- Horizontal scrolling for wide tables
- Collapsible sections
- Simplified navigation

**Mobile** (<768px):
- Single column layout
- Mobile-optimized stepper (vertical)
- Card-based product list (instead of table)
- Bottom sheet for dialogs
- Sticky action buttons at bottom

### Mobile Adaptations

**Progress Stepper**:
```
Mobile (Vertical):
┌────────────────────┐
│  1 ● Basic Info ✓  │
│  │                 │
│  2 ● Products ✓    │
│  │                 │
│  3 ● Pricing       │ ← Current
│  │                 │
│  4 ○ Terms         │
│  │                 │
│  5 ○ Review        │
└────────────────────┘
```

**Product List (Card View)**:
```
┌────────────────────────────────────┐
│  Fresh Tomatoes (PROD-001)         │
│  Vegetables                         │
│                                     │
│  UOM: KG  Pack: 10kg  MOQ: 50kg   │
│  Price: [$2.75]                    │
│  [Required: ON ✓]                  │
│                                     │
│  [✏️ Edit]  [🗑️ Remove]             │
└────────────────────────────────────┘
```

**Navigation Buttons (Mobile)**:
```
┌────────────────────────────────────┐
│  [← Previous]                      │
│  [Save Draft]                      │
│  [Next: Pricing →]                 │
└────────────────────────────────────┘
```

---

## Performance Optimization

### Loading Strategies

**Initial Page Load**:
- Critical CSS inline
- Defer non-critical JavaScript
- Lazy load images
- Preload fonts
- Target: <2 seconds LCP (Largest Contentful Paint)

**Data Fetching**:
- Pagination for product lists (50 per page)
- Infinite scroll for dropdowns (vendors, products)
- Debounced search (300ms delay)
- Cached vendor/product data (5 minutes TTL)

**Form Performance**:
- Debounced auto-save (2 seconds after last change)
- Optimistic UI updates
- Background validation
- Lazy validation (on blur, not on every keystroke)

### Bundle Optimization

**Code Splitting**:
- Separate bundle per wizard step
- Lazy load dialogs
- Dynamic imports for heavy components
- Shared vendor bundle

**Asset Optimization**:
- Compressed images (WebP format)
- Minified CSS/JS
- Tree shaking for unused code
- Gzip/Brotli compression

---

## API Integration

### Endpoints Used

**GET** `/api/vendors`
- Fetch vendor list for dropdown
- Pagination, search, filtering

**GET** `/api/products`
- Fetch product catalog
- Pagination, search, filtering by category

**GET** `/api/pricelist-templates`
- Fetch templates for "Use Template" mode

**GET** `/api/price-lists/{id}`
- Fetch existing price list for clone mode

**POST** `/api/price-lists`
- Create new price list
- Body: All wizard data

**PUT** `/api/price-lists/{id}/draft`
- Save draft
- Body: Current wizard state

**POST** `/api/price-lists/import`
- Import from Excel
- Body: FormData with Excel file

**GET** `/api/price-lists/{id}/history`
- Fetch price history for comparison

---

## Error Handling

### Error States

**Network Errors**:
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Connection Error                                     │
│                                                         │
│  Unable to save your changes. Please check your         │
│  internet connection and try again.                     │
│                                                         │
│  Your work has been saved locally.                      │
│                                                         │
│  [Retry]  [Save Offline]  [Cancel]                     │
└─────────────────────────────────────────────────────────┘
```

**Validation Errors**:
```
┌─────────────────────────────────────────────────────────┐
│  ✕ Validation Failed                                    │
│                                                         │
│  The following issues must be fixed:                    │
│  • 12 required products are missing prices              │
│  • End date must be after start date                    │
│  • Vendor "ABC Foods" is inactive                       │
│                                                         │
│  [View Details]  [Fix Issues]                          │
└─────────────────────────────────────────────────────────┘
```

**Server Errors**:
```
┌─────────────────────────────────────────────────────────┐
│  ✕ Server Error                                         │
│                                                         │
│  We're experiencing technical difficulties.             │
│  Your draft has been saved.                             │
│                                                         │
│  Error code: 500-PL-CREATE-001                          │
│                                                         │
│  [Contact Support]  [Try Again]  [Back to List]       │
└─────────────────────────────────────────────────────────┘
```

**Permission Errors**:
```
┌─────────────────────────────────────────────────────────┐
│  🔒 Access Denied                                        │
│                                                         │
│  You don't have permission to create price lists.       │
│                                                         │
│  Required permission: CREATE_PRICE_LIST                 │
│  Your role: Purchasing Assistant                        │
│                                                         │
│  [Request Access]  [Back to Dashboard]                 │
└─────────────────────────────────────────────────────────┘
```

---

## Notifications

### Success Notifications (Toast)

```
✓ Draft saved successfully
✓ Price list submitted for approval
✓ 125 products imported successfully
✓ Template loaded: Kitchen Equipment - Monthly
```

**Toast Properties**:
- Position: Top-right
- Duration: 3 seconds
- Auto-dismiss: Yes
- Dismissible: Yes (X button)
- Actions: Optional (e.g., "View", "Undo")

### Warning Notifications

```
⚠️ 12 products have large price increases (>50%)
⚠️ Vendor "ABC Foods" is inactive
⚠️ This will replace your current draft
```

### Email Notifications

**On Submit**:
- To: User (submitter)
- Subject: "Price List Submitted for Approval: {Name}"
- Content: Confirmation, next steps, approval timeline

**To Approvers**:
- Subject: "New Price List Awaiting Your Approval: {Name}"
- Content: Summary, approve/reject buttons, SLA deadline

**On Approval/Rejection**:
- To: User (submitter)
- Subject: "Price List {Approved/Rejected}: {Name}"
- Content: Decision, comments, next actions

---

## Analytics Tracking

### Events Tracked

**Wizard Events**:
- `wizard_started` - User enters wizard
- `wizard_step_completed` - User completes a step
- `wizard_abandoned` - User exits without saving
- `wizard_submitted` - User submits price list
- `draft_saved` - User saves draft

**Interaction Events**:
- `product_added` - Product added to list
- `product_removed` - Product removed from list
- `price_entered` - Pricing entered for product
- `template_loaded` - Template loaded
- `excel_imported` - Excel import completed

**Performance Metrics**:
- Time to complete wizard (per step and total)
- Number of validation errors encountered
- Success/failure rates
- Most used creation method

---

## Security Considerations

### Data Validation

**Client-Side**:
- Input sanitization (XSS prevention)
- Field length limits
- Format validation (email, phone, numbers)
- Required field checks

**Server-Side**:
- Re-validate all fields
- SQL injection prevention
- File upload validation (type, size, content)
- Rate limiting on API endpoints

### Authorization

**Permission Checks**:
- CREATE_PRICE_LIST permission required
- Vendor access validation (can only create for accessible vendors)
- Approval workflow based on user role
- Document access control (attachments)

### Data Privacy

**PII Handling**:
- Vendor contact info encrypted
- Pricing data access logged
- Audit trail for all changes
- GDPR compliance (data retention, right to delete)

---

## Testing Checklist

### Functional Testing

- [ ] All 5 creation methods work correctly
- [ ] Each wizard step validates properly
- [ ] Product selection and pricing entry functions correctly
- [ ] Terms & conditions save correctly
- [ ] Review & submit shows accurate summary
- [ ] Auto-save triggers at correct intervals
- [ ] Draft recovery works after page refresh
- [ ] Excel import handles all edge cases
- [ ] Clone and template modes pre-fill correctly
- [ ] All dialogs open/close properly

### Validation Testing

- [ ] Required fields prevent progression
- [ ] Format validation catches invalid inputs
- [ ] Cross-field validation works (dates, pricing)
- [ ] Business logic validation triggers warnings
- [ ] Large price changes show warnings
- [ ] Duplicate detection works

### Accessibility Testing

- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces all elements
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Form errors announced to screen readers
- [ ] ARIA labels present and accurate

### Responsive Testing

- [ ] Desktop layout renders correctly
- [ ] Tablet view adapts appropriately
- [ ] Mobile view uses card layouts
- [ ] Touch targets sized correctly (≥44px)
- [ ] Horizontal scrolling only where intended
- [ ] No content cut off at any breakpoint

### Performance Testing

- [ ] Page loads in <2 seconds
- [ ] Product list pagination works smoothly
- [ ] Auto-save doesn't lag UI
- [ ] Large Excel imports don't freeze browser
- [ ] Validation runs without noticeable delay

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS 14+)
- [ ] Mobile Chrome (Android 10+)

---

## Glossary

**Price List**: Collection of product prices from a vendor, valid for a specific time period

**Base Price**: Standard price per unit without quantity discounts

**UOM (Unit of Measure)**: How a product is measured (KG, LB, EA, BOX, etc.)

**MOQ (Minimum Order Quantity)**: Smallest quantity that can be ordered

**Pack Size**: Number of units in a package

**Tiered Pricing**: Volume-based pricing where higher quantities get lower prices

**Lead Time**: Time between order placement and delivery

**Net Payment Terms**: Payment due X days after invoice (e.g., Net 30 = due in 30 days)

**Early Payment Discount**: Discount offered if paid before due date (e.g., 2/10 Net 30)

**SLA (Service Level Agreement)**: Expected response/approval time

**Draft**: Incomplete price list saved for later completion

**Pending Approval**: Price list submitted and awaiting manager approval

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-23 | Initial comprehensive specification |

---

**End of Document**

Total Lines: 1,892
Total Sections: 45+
Total Dialogs: 15+
Word Count: ~18,000+
