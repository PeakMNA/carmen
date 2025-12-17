# Purchase Request System - Screen Content Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-20 | System Documentation | Initial documentation with basic page structure and components |
| 2.0.0 | 2025-11-20 | System Documentation | Updated all screenshots with hidden sidebar, added comprehensive UI States and Interactions section, documented hover states/menus/interactive elements, added 15+ new screenshots, documented loading/empty/error states |

## Table of Contents
1. [Purchase Request List Page](#purchase-request-list-page)
2. [Purchase Request Detail Page](#purchase-request-detail-page)
3. [Dialogs and Modals](#dialogs-and-modals)
4. [Actions and Workflows](#actions-and-workflows)

---

## Purchase Request List Page

### Page Overview
**Route:** `/procurement/purchase-requests`  
**Component:** `ModernPurchaseRequestList.tsx`

### Header Section

#### Title
- **Text:** "Purchase Requests"
- **Style:** Large, bold heading (text-2xl font-bold)

#### Action Buttons
1. **Export Button**
   - Icon: Download icon
   - Text: "Export"
   - Style: Outline variant, small size (h-8)
   - Function: Export purchase requests data

2. **Print Button**
   - Icon: Printer icon
   - Text: "Print"
   - Style: Outline variant, small size (h-8)
   - Function: Print purchase requests list

3. **New PR Button** (Dropdown)
   - Icon: Plus icon
   - Text: "New PR"
   - Style: Primary button, small size (h-8)
   - **Dropdown Options:**
     - Create Blank PR
     - **PR Templates:**
       - Office Supplies
       - IT Equipment
       - Kitchen Supplies
       - Maintenance

### Filter Section

![Filter Interface](./screenshots/pr_filters_expanded_1763611688148.png)

The Purchase Request list page provides a comprehensive three-tier filtering system: Primary Filters (quick toggle), Secondary Filters (context-sensitive dropdowns), and Advanced Filter Builder (complex queries).

#### 1. Primary Filters (Quick Toggle Buttons)

**Component:** `PRQuickFilters` (`pr-quick-filters.tsx`)

Two mutually exclusive primary filter buttons displayed as a toggle group:

| Filter Button | Purpose | Filter Logic | Default |
|--------------|---------|--------------|---------|
| **My Pending** | Shows actionable items requiring user attention | Filters PRs with status: Draft, Submitted, InProgress, or Rejected | ✓ Selected by default |
| **All Documents** | Comprehensive view of all accessible PRs | Shows all PRs based on user role and permissions (no status filtering) | |

**Visual Design:**
- Toggle button group with rounded background (bg-muted)
- Active button has default variant styling (highlighted)
- Inactive button has ghost variant styling (transparent)
- Both buttons: h-8 height, px-3 padding, text-xs font size

#### 2. Secondary Filters (Context-Sensitive Dropdowns)

Secondary filter dropdowns change dynamically based on which primary filter is active:

**When "All Documents" is selected:**
- **Status Filter Dropdown:**
  - Options: All Status, Draft, Submitted, In Progress, Approved, Rejected, Cancelled
  - Purpose: Further filter the comprehensive document view by specific status values
  - Multi-select: No (single selection)

**When "My Pending" is selected:**
- **Stage Filter Dropdown:**
  - Options: All Stage, Request Creation, Department Approval, Purchasing Review, Finance Review, Final Approval, Completed
  - Purpose: Filter actionable items by current workflow stage
  - Multi-select: No (single selection)

**Always Available (Both Modes):**
- **Requester Filter Dropdown:**
  - Options: All Requester, Somchai, Somsri, John, Mary
  - Purpose: Filter PRs by the person who created the request
  - Searchable: Yes

#### 3. Advanced Filter Builder Panel

**Component:** `PRAdvancedFilter` (`pr-filter-builder.tsx`)

Opens a comprehensive filter builder panel with advanced query capabilities:

**Filter Options:**
- **Status Filter:** Multi-select dropdown for multiple status selections
- **Priority Filter:** Multi-select dropdown (Low, Medium, High, Urgent)
- **Date Range:** Date picker with from/to selection (Created Date, Delivery Date)
- **Department:** Dropdown selection (F&B, Housekeeping, Engineering, Front Office, etc.)
- **Requestor:** Searchable dropdown with user list
- **Amount Range:** Min/max currency inputs with validation
- **Vendor:** Multi-select dropdown for vendor filtering
- **PR Type:** General, Market List, Asset

**Filter Builder Features:**
- Field selection from available PR properties
- Operator selection (equals, contains, greater than, less than, between, etc.)
- Value input with appropriate controls (text, number, date, dropdown)
- Add multiple filter conditions with AND/OR logic
- Save filter presets with name and description
- Star/favorite frequently used filters
- Import/export filter configurations

**Filter Actions:**
- **Apply Filters** (primary button): Execute the filter query
- **Clear All** (secondary button): Reset all filters to default
- **Save Filter Preset** (optional): Save current configuration for reuse
- **Load Preset** (dropdown): Apply previously saved filter configurations

**Active Filters Display:**
- Badge chips showing currently applied filters
- X button on each badge to remove individual filters
- "Clear all" link to remove all filters at once
- Filter count indicator on Advanced Filter button

#### 4. Global Search

**Search Bar:**
- **Placeholder:** "Search purchase requests..."
- **Search Scope:** PR number, item name, description, vendor name
- **Position:** Left side of filter toolbar
- **Style:** h-8 height, text-xs font size with search icon
- **Behavior:** Real-time filtering as user types (debounced)

#### 5. Additional Filter Controls

**Columns Dropdown:**
- Show/hide table columns
- Checkbox list of available columns
- Selections persist across user sessions

**View Mode Toggle:**
- Switch between Table and Card view modes
- Icon buttons: List (table) and LayoutGrid (card)
- Positioned at far right of filter toolbar
- Maintains filtering state across view changes

### Data Table

#### View Modes
1. **Table View** (Default)
   - Sortable columns
   - Selectable rows
   - Pagination controls
   
2. **Card View**
   - Grid layout of PR cards
   - Summary information per card
   - Quick actions on each card

#### Table Columns
1. **PR Number**
   - Format: PR-YYMM-NNNN (e.g., PR-2501-0042)
   - Clickable link to detail page
   - Primary identifier

2. **Title/Description**
   - Brief description of the purchase request
   - Truncated with ellipsis if too long

3. **Requestor**
   - Name of person who created the PR
   - Department information

4. **Status**
   - Visual badge with color coding
   - Workflow stage indicator
   - Possible values:
     - Draft (gray)
     - Pending Approval (yellow)
     - Approved (green)
     - Rejected (red)
     - In Progress (blue)
     - Completed (green)

5. **Priority**
   - Badge with priority level
   - Values: Low, Medium, High, Urgent

6. **Total Amount**
   - Formatted currency value
   - Sum of all line items

7. **Created Date**
   - Date format: MMM DD, YYYY
   - Sortable column

8. **Actions**
   - Dropdown menu with:
     - View
     - Edit
     - Approve
     - Reject
     - Delete
     - Duplicate
     - Export

### Screenshots

#### Full List View
![Purchase Request List - Full View](./screenshots/pr_list_full_view_1763611677269.png)

#### Row Hover State
![Purchase Request List - Row Hover State](./screenshots/pr_row_hover_state_1763611691316.png)

**Visual Changes on Hover:**
- Background color changes to light gray/blue tint
- Row becomes slightly elevated (shadow effect)
- Action buttons become more prominent
- Cursor changes to pointer
- Subtle transition animation (200ms)

**Interactive Elements Revealed:**
- Quick action buttons
- Row selection checkbox
- Contextual information tooltips

#### Row Actions Menu
![Purchase Request List - Row Actions Menu](./screenshots/pr_row_actions_menu_1763611692818.png)

**Menu Options:**
1. **View** - Opens PR detail page
2. **Edit** - Opens PR in edit mode
3. **Duplicate** - Creates a copy of the PR
4. **Export** - Exports PR to PDF/Excel
5. **Print** - Opens print dialog
6. **Delete** - Deletes the PR (with confirmation)

**Menu Behavior:**
- Triggered by three-dot icon click
- Positioned relative to trigger button
- Auto-closes on outside click
- Keyboard navigable (arrow keys)
- Closes on Escape key

#### New PR Dropdown Menu
![Purchase Request List - New PR Dropdown](./screenshots/pr_new_dropdown_menu_1763611690820.png)

**Menu Options:**
1. **Create Blank PR** - Opens empty PR form
2. **From Template:**
   - Office Supplies Template
   - IT Equipment Template
   - Kitchen Supplies Template
   - Maintenance Template
   - Custom Templates (user-created)

**Template Benefits:**
- Pre-filled common items
- Standard budget allocations
- Default approval workflows
- Faster PR creation

---

## Purchase Request Detail Page

### Page Overview
**Route:** `/procurement/purchase-requests/[id]`  
**Component:** `PRDetailPage.tsx`

### Header Section

![PR Detail Overview](./screenshots/pr_detail_overview_1763611892985.png)

#### PR Header Component (`PRHeader.tsx`)

**Left Section:**
- **PR Number:** Large, prominent display (e.g., PR-2501-0042)
- **Status Badge:** Current workflow status with color coding
- **Priority Badge:** Priority level indicator

**Metadata Row:**
- **Requestor:** Name and department
- **Created Date:** Formatted date
- **Required Date:** Target delivery date
- **Department:** Requesting department
- **Location:** Delivery location

**Right Section - Action Buttons:**
1. **Back Button**
   - Icon: ChevronLeft
   - Function: Return to list page

2. **Edit Button**
   - Icon: Edit
   - Text: "Edit"
   - Visibility: Based on permissions and workflow stage

3. **Print Button**
   - Icon: Printer
   - Function: Print PR document

4. **Download Button**
   - Icon: Download
   - Function: Download PR as PDF

5. **Share Button**
   - Icon: Share
   - Function: Share PR with others

6. **Workflow Actions** (Conditional)
   - **Approve Button**
     - Icon: CheckCircle
     - Text: "Approve"
     - Style: Success/green variant
   
   - **Reject Button**
     - Icon: XCircle
     - Text: "Reject"
     - Style: Destructive/red variant
   
   - **Return Button**
     - Icon: RotateCcw
     - Text: "Return"
     - Function: Send back to previous stage

### Workflow Indicator

**Component:** `CompactWorkflowIndicator.tsx`

**Display:**
- Visual progress bar showing current stage
- Stage labels:
  - Draft
  - Pending Approval
  - Department Head Review
  - Finance Review
  - Procurement Review
  - Approved
- Current stage highlighted
- Completed stages marked with checkmarks

### Tab Navigation

**Tabs Component:** Three main tabs

1. **Items Tab** (Default)
2. **Budgets Tab**
3. **Workflow Tab**

---

## Tab 1: Items Tab

### Screenshots

#### Items Table Views
![Items Tab - Full View](./screenshots/pr_items_tab_full_view_1763612289485.png)

![Items Tab - Scrolled View](./screenshots/pr_items_tab_scrolled_1763612290829.png)

**Active State Indicators:**
- Tab underline in primary color
- Bold tab text
- Content area shows items table
- Add Item button visible

#### Item Row Hover State
![Items Tab - Item Hover State](./screenshots/pr_item_hover_state_1763611900316.png)

**Visual Changes on Hover:**
- Row background highlight
- Action buttons appear/become visible
- Price comparison indicator shows
- Inventory status tooltip appears

**Quick Actions Available:**
- Edit item inline
- View price history
- Compare vendors
- Check inventory
- Remove item

#### Item Actions Menu
![Items Tab - Item Actions Menu](./screenshots/pr_item_actions_menu_1763611910647.png)

**Menu Options:**
1. **Edit Item** - Opens item edit form
2. **View Price History** - Shows historical pricing chart
3. **Compare Vendors** - Opens vendor comparison modal
4. **Check Inventory** - Shows current stock levels
5. **Duplicate Item** - Creates a copy of the line item
6. **Remove Item** - Deletes the line item (with confirmation)
7. **Add Note** - Adds a note to the item
8. **Attach File** - Attaches specification/quote

**Context-Sensitive Options:**
- Options vary based on item status
- Permissions affect available actions
- Workflow stage determines editability

#### Item Name Click Interaction
![Items Tab - Item Name Clicked](./screenshots/pr_item_name_clicked_1763611941685.png)

**Clicking Item Name Opens:**
- **Product Detail Panel** (slide-in from right)

**Product Information Displayed:**
- Full product description
- Product specifications
- Product images
- Category and subcategory
- Standard unit of measure
- Current inventory levels
- Reorder point information
- Preferred vendors list

**Panel Features:**
- Close button (X)
- Quick add to PR button
- View full product catalog entry
- Recent purchase history
- Related products suggestions

### Component
`ItemsTab.tsx` / `EnhancedItemsTab.tsx`

### Header Section
- **Tab Title:** "Items"
- **Add Item Button:** 
  - Icon: Plus
  - Text: "Add Item"
  - Function: Opens item entry form

### Items Table

#### Columns
1. **#** - Line number
2. **Item Code/SKU**
   - Product identifier
   - Clickable for details

3. **Item Description**
   - Product name and description
   - Specifications if available

4. **Category**
   - Product category
   - Badge display

5. **Unit**
   - Unit of measure (e.g., KG, L, PC)

6. **Quantity**
   - Requested quantity
   - Editable in edit mode

7. **Unit Price**
   - Price per unit
   - Currency formatted

8. **Total**
   - Quantity × Unit Price
   - Auto-calculated

9. **Vendor**
   - Preferred vendor
   - Dropdown selection

10. **Price Alerts**
    - Badge showing price variance
    - Icons for:
      - Price increase
      - Price decrease
      - Price history available

11. **Actions**
    - Edit item
    - Delete item
    - View price history
    - Compare vendors
    - View inventory

### Item Row Features

#### Price History Button
- Icon: Chart/History icon
- Function: Opens `PriceHistoryModal`
- Shows historical pricing data

#### Vendor Comparison Button
- Icon: Compare icon
- Function: Opens `VendorComparisonModal`
- Shows vendor pricing comparison

#### Inventory Breakdown
- Component: `inventory-breakdown.tsx`
- Shows current stock levels
- Available locations
- Reserved quantities

### Summary Section

**Component:** `SummaryTotal.tsx`

**Display:**
- **Subtotal:** Sum of all line items
- **Tax:** Calculated tax amount
- **Shipping:** Shipping costs (if applicable)
- **Discount:** Any discounts applied
- **Total:** Grand total
- **Currency:** Display currency

**Style:**
- Right-aligned
- Large, bold total
- Breakdown in smaller text

---

## Tab 2: Budgets Tab

![Budgets Tab](./screenshots/pr_budgets_tab_view_1763611897036.png)

**Active State Indicators:**
- Tab underline in primary color
- Bold tab text
- Content area shows budget allocation
- Budget summary cards visible
- Add Budget Line button visible

### Component
`ResponsiveBudgetScreen.tsx` / `BudgetsTab.tsx`

### Budget Allocation Section

#### Budget Information Display
1. **Budget Code**
   - Unique budget identifier
   - Format: DEPT-YYMM-NNNN

2. **Budget Name**
   - Descriptive name of budget line

3. **Department**
   - Department owning the budget

4. **Budget Period**
   - Fiscal year or period
   - Start and end dates

5. **Total Budget**
   - Total allocated amount
   - Currency formatted

6. **Spent to Date**
   - Amount already spent
   - Percentage of total

7. **Committed**
   - Amount in pending PRs/POs
   - Not yet spent but allocated

8. **Available**
   - Remaining budget
   - Total - Spent - Committed
   - Color coded:
     - Green: > 20% available
     - Yellow: 10-20% available
     - Red: < 10% available

### Budget Allocation Table

#### Columns
1. **Item Description**
   - Links to item in Items tab

2. **Amount**
   - Amount allocated from this budget

3. **Budget Code**
   - Budget line being used

4. **Percentage**
   - % of total PR amount

5. **Actions**
   - Edit allocation
   - Remove allocation

### Budget Validation

**Warnings/Alerts:**
- ⚠️ Over budget warning
- ⚠️ Insufficient funds alert
- ℹ️ Budget approval required
- ✓ Budget available confirmation

### Add Budget Allocation

**Button:** "Add Budget Line"
**Form Fields:**
- Budget Code (dropdown)
- Amount (currency input)
- Notes (text area)

---

## Tab 3: Workflow Tab

![Workflow Tab](./screenshots/pr_workflow_tab_view_1763611898633.png)

**Active State Indicators:**
- Tab underline in primary color
- Bold tab text
- Content area shows workflow timeline
- Workflow action buttons visible (if applicable)
- Approval history displayed

### Component
`WorkflowTab.tsx`

### Workflow Timeline

**Component:** `WorkflowProgressTimeline.tsx`

#### Timeline Stages
Each stage displays:
1. **Stage Name**
   - Draft
   - Pending Approval
   - Department Head Review
   - Finance Review
   - Procurement Review
   - Approved/Rejected

2. **Status Icon**
   - ✓ Completed (green checkmark)
   - ⏳ In Progress (spinner)
   - ○ Pending (empty circle)
   - ✗ Rejected (red X)

3. **Timestamp**
   - Date and time of action
   - Format: MMM DD, YYYY HH:MM

4. **Actor**
   - Name of person who took action
   - Role/title
   - Department

5. **Action Taken**
   - Approved
   - Rejected
   - Returned
   - Submitted
   - Created

6. **Comments**
   - Approval comments
   - Rejection reasons
   - Return notes

### Workflow Actions Panel

**Conditional Display** based on:
- Current workflow stage
- User permissions
- PR status

#### Available Actions
1. **Submit for Approval**
   - Available in Draft stage
   - Validates PR completeness
   - Moves to next stage

2. **Approve**
   - Icon: CheckCircle (green)
   - Requires approval permission
   - Optional comment field
   - Moves to next approval stage

3. **Reject**
   - Icon: XCircle (red)
   - Requires approval permission
   - **Required:** Rejection reason
   - Returns to requestor

4. **Return for Revision**
   - Icon: RotateCcw
   - Returns to previous stage
   - **Required:** Return reason
   - Allows requestor to edit

5. **Withdraw**
   - Available to requestor
   - Cancels the PR
   - **Required:** Withdrawal reason

### Approval Dialog

**Triggered by:** Approve button

**Fields:**
- **Comments** (optional)
  - Text area for approval notes
  - Visible to all approvers

- **Notify Requestor** (checkbox)
  - Send email notification
  - Default: checked

- **Action Buttons:**
  - Confirm Approval (primary)
  - Cancel (secondary)

### Rejection Dialog

**Triggered by:** Reject button

**Fields:**
- **Rejection Reason** (required)
  - Dropdown with common reasons:
    - Budget not available
    - Incorrect pricing
    - Missing information
    - Policy violation
    - Duplicate request
    - Other (requires explanation)

- **Additional Comments** (required for "Other")
  - Text area for detailed explanation

- **Notify Requestor** (checkbox)
  - Send email notification
  - Default: checked

- **Action Buttons:**
  - Confirm Rejection (destructive)
  - Cancel (secondary)

---

## Dialogs and Modals

### 1. Price History Modal

**Component:** `PriceHistoryModal.tsx`

**Trigger:** Price history button on item row

**Content:**
- **Header:** Item name and code
- **Chart:** Line chart showing price trends
- **Table:**
  - Date
  - Vendor
  - Price
  - Quantity
  - PR/PO Number
  - % Change from previous

**Actions:**
- Export data
- Close modal

### 2. Vendor Comparison Modal

**Component:** `VendorComparisonModal.tsx`

**Trigger:** Vendor comparison button on item row

**Content:**
- **Header:** Item name and code
- **Comparison Table:**
  - Vendor Name
  - Unit Price
  - Lead Time
  - MOQ (Minimum Order Quantity)
  - Last Purchase Date
  - Rating/Score
  - Select (radio button)

**Features:**
- Sort by price, lead time, rating
- Filter by active vendors
- Show historical data

**Actions:**
- Select vendor (updates item)
- Close modal

### 3. Item Details Edit Form

**Component:** `item-details-edit-form.tsx`

**Trigger:** 
- Add Item button
- Edit item action

**Form Fields:**

#### Basic Information
1. **Item Code/SKU** (text input)
   - Auto-complete from product catalog
   - Manual entry allowed

2. **Item Description** (text area)
   - Product name
   - Detailed description

3. **Category** (dropdown)
   - Product categories
   - Hierarchical selection

4. **Unit of Measure** (dropdown)
   - KG, L, PC, BOX, etc.
   - Based on product

#### Quantity and Pricing
5. **Quantity** (number input)
   - Required quantity
   - Validation: > 0

6. **Unit Price** (currency input)
   - Price per unit
   - Auto-populated from vendor

7. **Total** (calculated, read-only)
   - Quantity × Unit Price

#### Vendor Information
8. **Preferred Vendor** (dropdown)
   - List of approved vendors
   - "Add new vendor" option

9. **Vendor Item Code** (text input)
   - Vendor's SKU/code

#### Additional Details
10. **Required Date** (date picker)
    - When item is needed
    - Validation: future date

11. **Notes** (text area)
    - Special instructions
    - Specifications

12. **Attachments** (file upload)
    - Specifications
    - Quotes
    - Images

**Actions:**
- Save (primary button)
- Cancel (secondary button)
- Delete (if editing existing item)

### 4. Comments and Attachments Tab

**Component:** `PRCommentsAttachmentsTab.tsx`

**Sections:**

#### Comments Section
- **Add Comment:**
  - Text area for new comment
  - @mention functionality
  - Attach files
  - Post button

- **Comment Thread:**
  - User avatar
  - Name and timestamp
  - Comment text
  - Attachments
  - Reply button
  - Edit/Delete (own comments)

#### Attachments Section
- **Upload Area:**
  - Drag and drop
  - Browse files button
  - Supported formats displayed

- **Attachments List:**
  - File name
  - File type icon
  - File size
  - Uploaded by
  - Upload date
  - Actions:
    - Download
    - Preview
    - Delete

---

## Actions and Workflows

### Workflow Decision Engine

**Component:** `workflow-decision-engine.ts`

**Functions:**
1. **Determine Next Stage**
   - Based on current stage
   - PR amount
   - Department
   - Budget availability

2. **Validate Transition**
   - Check permissions
   - Validate required fields
   - Check business rules

3. **Auto-routing**
   - Route to appropriate approver
   - Skip stages if not required
   - Parallel approvals

### RBAC Service

**Component:** `rbac-service.ts`

**Permissions Checked:**
1. **View Permissions**
   - Can view PR
   - Can view financial info
   - Can view workflow history

2. **Edit Permissions**
   - Can edit PR
   - Can edit items
   - Can edit budget allocation

3. **Workflow Permissions**
   - Can approve
   - Can reject
   - Can return
   - Can withdraw

4. **Field-level Permissions**
   - Component: `field-permissions.ts`
   - Granular control per field
   - Based on role and workflow stage

### Document Actions

**Component:** `utils.ts` - `handleDocumentAction`

**Actions:**
1. **Print**
   - Generate printable view
   - Open print dialog

2. **Download**
   - Generate PDF
   - Download to device

3. **Share**
   - Generate shareable link
   - Send via email
   - Copy to clipboard

4. **Export**
   - Export to Excel
   - Export to CSV
   - Export to PDF

---

## Data Flow and State Management

### Context Providers

1. **Workflow Context**
   - Component: `workflow-context.tsx`
   - Manages workflow state
   - Provides workflow actions

2. **Simple User Context**
   - Component: `simple-user-context.tsx`
   - Current user information
   - User permissions

### Data Sources

1. **Mock Data**
   - `@/lib/mock-data/purchase-requests.ts`
   - Sample PRs for development
   - Sample items

2. **API Integration**
   - `@/app/lib/data.ts`
   - `fetchPurchaseRequests()`
   - CRUD operations

---

## UI Components and Styling

### Component Library
- **shadcn/ui** components
- **Lucide React** icons
- **Tailwind CSS** styling

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

### Color Coding

#### Status Colors
- **Draft:** Gray (#6B7280)
- **Pending:** Yellow (#F59E0B)
- **Approved:** Green (#10B981)
- **Rejected:** Red (#EF4444)
- **In Progress:** Blue (#3B82F6)

#### Priority Colors
- **Low:** Gray
- **Medium:** Blue
- **High:** Orange
- **Urgent:** Red

---

## Keyboard Shortcuts

### List Page
- `Ctrl/Cmd + N` - New PR
- `Ctrl/Cmd + F` - Focus search
- `Ctrl/Cmd + P` - Print
- `Ctrl/Cmd + E` - Export

### Detail Page
- `Ctrl/Cmd + S` - Save (edit mode)
- `Ctrl/Cmd + E` - Edit
- `Ctrl/Cmd + P` - Print
- `Esc` - Close modal/dialog

---

## Accessibility Features

1. **Keyboard Navigation**
   - Tab order
   - Focus indicators
   - Skip links

2. **Screen Reader Support**
   - ARIA labels
   - Semantic HTML
   - Alt text for images

3. **Color Contrast**
   - WCAG AA compliance
   - High contrast mode support

4. **Responsive Text**
   - Scalable fonts
   - Readable line heights

---

## Error Handling and Validation

### Form Validation
- Required field indicators (*)
- Real-time validation
- Error messages below fields
- Summary of errors at top

### Business Rule Validation
- Budget availability check
- Approval hierarchy validation
- Date range validation
- Quantity limits

### Error States
- Network errors
- Permission errors
- Validation errors
- System errors

### User Feedback
- Success toasts
- Error alerts
- Warning messages
- Info notifications

---

## Performance Considerations

### Optimization Techniques
1. **Lazy Loading**
   - Tab content loaded on demand
   - Images lazy loaded

2. **Pagination**
   - List page pagination
   - Items table pagination

3. **Caching**
   - Vendor data cached
   - Product catalog cached

4. **Debouncing**
   - Search input debounced
   - Auto-save debounced

---

## UI States

### Loading States

**List Page Loading:**
- Skeleton loaders for table rows
- Shimmer animation effect
- Header and filters remain visible
- Pagination controls disabled

**Detail Page Loading:**
- Skeleton loader for header
- Tab content shows loading spinner
- Action buttons disabled
- Breadcrumb navigation remains visible

### Empty States

**No Purchase Requests:**
- Illustration/icon
- "No purchase requests found" message
- "Create New PR" button
- Helpful tips for getting started

**No Items in PR:**
- "No items added yet" message
- "Add Item" button prominent
- Suggestion to add items or use template

**No Budget Allocation:**
- "No budget allocated" message
- "Add Budget Line" button
- Warning if budget is required

### Error States

**Network Error:**
- Error icon
- "Unable to load data" message
- "Retry" button
- "Go Back" option

**Permission Error:**
- Lock icon
- "You don't have permission" message
- Contact administrator link
- Return to list button

**Validation Error:**
- Red border on invalid fields
- Error message below field
- Error summary at top of form
- Scroll to first error

---

## Future Enhancements

### Planned Features
1. **Bulk Operations**
   - Bulk approve
   - Bulk export
   - Bulk delete

2. **Advanced Filtering**
   - Saved filters
   - Custom filter builder
   - Filter presets

3. **Notifications**
   - Real-time updates
   - Email notifications
   - In-app notifications

4. **Analytics**
   - Spending analytics
   - Approval time metrics
   - Vendor performance

5. **Mobile App**
   - Native mobile experience
   - Offline support
   - Push notifications

---

## Appendix

### File Structure
```
app/(main)/procurement/purchase-requests/
├── [id]/
│   └── page.tsx
├── components/
│   ├── PRDetailPage.tsx
│   ├── PRHeader.tsx
│   ├── ModernPurchaseRequestList.tsx
│   ├── CompactWorkflowIndicator.tsx
│   ├── PriceHistoryModal.tsx
│   ├── VendorComparisonModal.tsx
│   ├── SummaryTotal.tsx
│   ├── tabs/
│   │   ├── ItemsTab.tsx
│   │   ├── BudgetsTab.tsx
│   │   ├── WorkflowTab.tsx
│   │   ├── AttachmentsTab.tsx
│   │   └── ActivityTab.tsx
│   └── ...
├── services/
│   ├── rbac-service.ts
│   └── workflow-decision-engine.ts
└── page.tsx
```

### Related Documentation
- [API Documentation](../api-docs.md)
- [Workflow Configuration](../workflow-config.md)
- [Permission Matrix](../permissions.md)
- [User Guide](../user-guide.md)

---

