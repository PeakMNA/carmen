## Module Information

- **Module**: Procurement
- **Sub-Module**: Purchase Requests
- **Route**: `/procurement/purchase-requests`
- **Version**: 1.9.0
- **Last Updated**: 2025-12-17

## **Document History**

| Version | Date | Author | Changes |
| --- | --- | --- | --- |
| 1.0.0 | 2025-10-30 | System Architect | Initial Notion from Mark Down |
| 1.0.1 | 2025-11-23 | Peak | Base on meeting requirement |
| 1.2.0 | 2025-11-26 | Documentation Team | Added implementation status markers to track development progress |
| 1.3.0 | 2025-11-28 | Development Team | Added FR-PR-011A: Purchasing Staff Edit Mode Capabilities for vendor pricing, tax profiles, and override functionality |
| 1.4.0 | 2025-11-28 | Development Team | Updated FR-PR-011 with Returned status as editable, added Editable Status Matrix by Role, added Requestor Editable Fields by Status matrix |
| 1.5.0 | 2025-11-28 | Development Team | Added FR-PR-026: Bulk Item Actions for line-item level bulk operations (Approve Selected, Reject Selected, Return Selected, Split, Set Date Required) |
| 1.6.0 | 2025-11-28 | Development Team | Added FR-PR-027: Budget Tab CRUD Operations for budget allocation management within Purchase Requests |
| 1.7.0 | 2025-12-03 | Development Team | Updated FR-PR-011A: Approvers can view vendor/pricing in read-only; Updated FR-PR-026: Approvers can Split PR to enable parallel processing of approved vs returned items |
| 1.8.0 | 2025-12-17 | Development Team | Added FR-PR-028: Auto-Pricing System with vendor scoring, MOQ validation, and price normalization |
| 1.9.0 | 2025-12-17 | Development Team | Added FR-PR-029: Multi-Currency Display with dual currency visibility and exchange rate handling |

---

## Overview

The Purchase Requests sub-module enables users to create, manage, and track purchase requests throughout the approval workflow. It provides comprehensive functionality for requesting goods and services with budget control and multi-level approval workflows.


## Business Objectives

1. Streamline purchase request creation and approval process
2. Ensure budget compliance and control before commitment
3. Maintain accurate and auditable procurement records
4. Optimize vendor selection through historical data
5. Track procurement spending and commitments
6. Support multi-level approval workflows
7. Enable efficient collaboration between departments

## Key Stakeholders

### Primary Users

1. **Head Chef / Executive Chef**: Creates purchase requests for F&B operations, kitchen supplies, and ingredients
2. **Housekeeping Manager**: Requests cleaning supplies, linens, amenities, and housekeeping equipment
3. **Chief Engineer / Maintenance Manager**: Requests maintenance supplies, spare parts, and equipment
4. **Front Office Manager**: Requests office supplies, guest amenities, and front desk materials
5. **Department Managers**: Create and manage purchase requests for their respective departments

### Procurement Team

1. **Purchasing Manager**: Reviews and approves purchase requests, manages vendor selection
2. **Purchasing Staff / Buyer**: Processes approved requests, converts to purchase orders, manages vendor pricing and allocations in edit mode
3. **Procurement Coordinator**: Tracks request status, coordinates with departments

### Approval Authorities

1. **General Manager / Hotel Manager**: Final approval for high-value purchases
2. **Financial Controller**: Reviews and approves budget impact, ensures fiscal compliance
3. **Department Heads**: First-level approval for department-specific requests

### Supporting Roles

1. **Budget Controller**: Monitors budget availability and compliance
2. **Internal Auditor**: Reviews procurement compliance and audit trails
3. **System Administrator**: Manages user access and system configuration

## Functional Requirements

### FR-PR-001: Purchase Request Creation

**Priority**: High | **Status**: 🔧 Partial
**User Story**: As a department manager (chef, housekeeping manager, engineer), I want to create purchase requests for my department so that I can procure necessary supplies and equipment while maintaining proper approval and budget control.

**Requirements**:
- Auto-generated unique reference numbers following format PR-[YYMM]-[NNNN]
- PR type selection (General/Market List/Asset)
- Requestor information auto-populated from user profile
- Department and location assignment based on user’s primary department/location
- Description field for purchase purpose
- Document attachments support for quotes, specifications, or supporting documents

**Acceptance Criteria**:
- Reference number automatically generated following format PR-[YYMM]-[NNNN]
- All required fields validated before save
- Draft PRs can be saved without submission for later completion
- Requestor defaults to logged-in user and cannot be changed
- Department and location default to user’s assignment
- System prevents submission with missing required fields
- Attachment support for common file types (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG)

### FR-PR-002: Item Management

**Priority**: High | **Status**: 🔧 Partial
**User Story**: As a department staff member, I want to add and manage multiple items in a single purchase request so that I can consolidate related purchases and streamline the approval process.

**Requirements**:
- Add multiple items to a single PR with line-by-line detail
- Specify location, item details: name, local name, quantity, unit of measure, estimated unit price
- Category and subcategory, item group assignment for proper classification and reporting
- Delivery date per item 
- Delivery point specification (e.g., Main Kitchen, Pastry Kitchen, Housekeeping Store)
- Dimensions: Job code assignment for cost allocation to specific projects or events
- Vendor suggestion based on price history and previous purchases 
- Price comparison with historical data to identify significant variances
- inline editing for efficient data entry

**Acceptance Criteria**:
- Minimum one item required per PR
- Quantity supports 3 decimal places (e.g., 12.500 kg)
- Price supports 2 decimal places (e.g., $15.50)
- Item subtotal calculated automatically (Quantity × Unit Price)
- inline editing with real-time validation
- Items can be reordered, duplicated, or removed
- Vendor suggestions based on best price for similar items in last 90 days

### FR-PR-003: Financial Calculations

**Priority**: High | **Status**: 🚧 Pending
**User Story**: As a purchasing staff member, I want the system to automatically calculate all financial amounts accurately so that I can ensure correct budgeting and pricing without manual calculation errors.

**Requirements**:
- Item subtotal calculation (Quantity × Unit Price) with automatic updates
- Discount application (percentage or fixed amount) at item or PR level
- Tax calculation (on net amount) based on item tax category
- Currency conversion (if multi-currency enabled) using daily exchange rates
- Total amount calculation (Net Amount + Tax) for each item and PR total
- Base currency conversion for all amounts for consolidated reporting

**Calculation Rules**:
- Item subtotal = Round(Quantity × Unit Price, 2)
- Discount amount = Round(Subtotal × Discount Rate, 2)
- Net amount = Round(Subtotal - Discount, 2)
- Tax amount = Round(Net Amount × Tax Rate, 2)
- Item total = Round(Net Amount + Tax, 2)
- All rounding uses half-up (banker’s) rounding for consistency
- Base currency conversion applies organization’s daily exchange rate

**Acceptance Criteria**:
- All monetary amounts displayed with 2 decimals
- All quantities displayed based on product configuration
- Exchange rates displayed with 5 decimals
- Real-time calculation updates as user enters data
- Base currency totals always displayed alongside transaction currency
- Zero-value items handled correctly (e.g., FOC items)
- Tax-exclusive pricing supported

### FR-PR-004: Budget Control

**Priority**: High | **Status**: 🚧 Pending
**User Story**: As a department manager, I want the system to check budget availability before I submit a purchase request so that I can ensure compliance with my department’s budget limits and avoid over-spending.

**Requirements**:
- Check budget availability before submission against department budget allocation
- Display budget information: total budget, committed amount, available balance
- Create soft commitment on PR submission to reserve budget allocation
- Update budget availability in real-time as PRs are created and approved
- Prevent submission if budget exceeded (configurable by organization policy)
- Support budget categories and cost centers for detailed tracking
- Show budget consumption percentage and trend
- Provide budget forecast based on pending PRs

**Acceptance Criteria**:
- Budget check performed automatically on submission attempt
- Clear error message displayed if budget insufficient, showing shortfall amount
- Budget impact displayed to user before submission (amount to be committed)
- Soft commitment created immediately on PR submission (not approval)
- Budget release on PR rejection/cancellation within 1 hour
- Budget information updated in real-time across all users
- Department managers can view budget status for their department
- Finance team can view organization-wide budget status

### FR-PR-005: Approval Workflow

**Priority**: High | **Status**: 🔧 Partial
**User Story**: As a purchasing manager, I want purchase requests to be automatically routed through appropriate approval levels so that purchases are properly authorized based on workflow policies  and department policies.

**Requirements**:
- Automatic routing based on workflow configuration
- Department head approval always required
- Finance review required for high-value PRs
- General Manager approval for purchases above specified limit
- Sequential or parallel approval stages (configurable)
- Email notifications to approvers with PR summary and direct link
- Approval delegation support for approvers when away
- Rejection with mandatory comments explaining reason
- Return: Send the PR back to previous stage with comment
- Approval history tracking with full audit trail

**Acceptance Criteria**:
- PR routes to correct approver(s) automatically based on rules
- Approvers receive email notifications within 5 minutes of submission
- Approval/rejection/return recorded with timestamp and approver identity
- Comments required (minimum 10 characters) for rejection and return
- Status updated in real-time and visible to all stakeholders
- Full approval history visible with timeline view
- Delegation works correctly with notification to delegate

### FR-PR-005A: Workflow Actions by Role

**Priority**: High | **Status**: ✅ Implemented
**User Story**: As a user with specific role permissions, I want clear workflow actions available to me so that I can appropriately progress, reject, or return purchase requests based on my authority level.

#### Requestor Actions (Staff, Store Staff, Chef, Counter Staff, Executive Chef, Warehouse Staff)

| Action | Description | PR Status Before | PR Status After | Comment Required |
|--------|-------------|------------------|-----------------|------------------|
| **Submit** | Submit PR for approval | Draft | In-progress | No |
| **Delete** | Delete draft PR | Draft | Deleted | No |
| **Edit** | Modify draft or rejected PR | Draft, Void | Draft | No |


**Button Display**:
- **Draft Status**: Delete (red), Submit (blue/primary)
- **Void Status**: Edit button to modify 

#### Approver Actions (Department Manager, Financial Manager, General Manager, Finance Director)

| Action | Description | PR Status Before | PR Status After | Comment Required |
|--------|-------------|------------------|-----------------|------------------|
| **Reject** | Deny PR permanently | In-progress | Void | Yes (min 10 chars) |
| **Return** | Send back for revision | In-progress | In-progress (previous stage) | Yes (min 10 chars) |
| **Approve** | Approve and advance to next stage | In-progress | In-progress or Approved | No (optional) |

**Button Display**: Reject (red/destructive), Return (outline), Approve (green)
**Edit Capabilities** (in Edit Mode):
- Edit Approved quantity 
**Approval Logic**:
- If more approval stages pending → PR remains "In-progress", routes to next approver
- If final approval stage → PR status changes to "Approved"

#### Purchasing Staff Actions (Purchasing Staff, Purchaser, Procurement Manager, Purchasing Agent)

| Action | Description | PR Status Before | PR Status After | Comment Required |
|--------|-------------|------------------|-----------------|------------------|
| **Reject** | Deny PR (pricing/vendor issues) | In-progress | Void | Yes (min 10 chars) |
| **Return** | Send back for revision | In-progress | In-progress (previous stage) | Yes (min 10 chars) |
| **Submit** | Submit to next workflow stage | In-progress | In-progress or Approved | No |

**Button Display**: Reject (red/destructive), Return (outline), Submit (blue)

**Edit Capabilities** (in Edit Mode):
- Vendor selection and allocation
- Currency and exchange rate
- Unit price entry
- Discount rate/amount override
- Tax profile selection and override
- FOC quantity entry

#### Workflow Action Matrix

| Role Category | View | Edit | Submit | Approve | Reject | Return | Delete |
|--------------|------|------|--------|---------|--------|--------|--------|
| Requestor | ✅ | ✅ (Draft/Void) | ✅ | ❌ | ❌ | ❌ | ✅ (Draft) |
| Approver | ✅ | ✅| ❌ | ✅ | ✅ | ✅ | ❌ |
| Purchasing Staff | ✅ | ✅ (Edit Mode) | ✅ | ❌ | ✅ | ✅ | ❌ |

#### Return Flow Details

When **Return** action is selected:
1. User selects return destination (previous workflow stage)
2. User enters return comment (required, min 10 characters)
3. System moves PR to selected previous stage
4. System notifies the user responsible for that stage
5. PR remains in "In-progress" status but at earlier workflow stage
6. Activity log records return action with timestamp, user, and comment

**Return Destinations**:
- Request Creation (Requestor)
- Department Approval (Department Manager)
- Purchasing Review (Purchasing Staff)
- Finance Review (Financial Manager)

**Acceptance Criteria**:
- All three action buttons (Reject, Return, Submit/Approve) visible simultaneously for Approvers and Purchasing Staff
- Actions disabled when workflow decision engine indicates user cannot act
- Return action allows selection of destination stage
- All actions logged in activity trail with user, timestamp, and comments
- Notifications sent to appropriate users upon action completion

### FR-PR-006: Status Management

**Priority**: High | **Status**: ✅ Implemented
**User Story**: As a requestor, I want to easily track the current status of my purchase requests so that I know where they are in the approval process and when I can expect them to be processed.

**Requirements**:
- Clear status tracking with standardized status values
- Status timeline showing progression through workflow
- Status change notifications to requestor and stakeholders using workflow configuration
- Color-coded status indicators for quick visual identification
- Status-based filtering in list views

**Status Values**:

- **Draft**: Saved but not submitted (editable by requestor)
- **In-progress** : Some approvals received, others pending
- **Approved**: All approvals received (ready for PO conversion)
- **Void**: Approval denied (returned to requestor with comments)
- **Completed**: Converted to Purchase Order(s) (read-only)
- **Cancelled**: Manually cancelled by requestor or approver (with reason)

**Acceptance Criteria**:
- Status clearly displayed on PR detail page and list view
- Status transitions logged with timestamp, user, and reason
- Only valid status transitions allowed (enforced by workflow rules)
- Status filters available in list view with count indicators
- Status indicators color-coded (Green=Approved, Blue=Completed, Yellow=In-progress, Red=Void, Gray=Draft/Cancelled)
- Status change triggers appropriate notifications
- Status history visible with full audit trail

### FR-PR-007: Document Management

**Priority**: Medium | **Status**: 🚧 Pending
**User Story**: As a requestor, I want to attach supporting documents (quotes, specifications, images) to my purchase requests so that approvers have all necessary information to make informed decisions.

**Requirements**:
- Upload multiple files per PR (quotations, product specifications, images, etc.)
- Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, CSV
- Maximum file size: 10MB per file, 50MB total per PR
- Document preview capability for common formats (PDF, images)
- Document download for offline review
- Document deletion (by creator only, before PR submission)
- Compress images automatically to reduce storage

**Acceptance Criteria**:
- File upload interface intuitive with drag-and-drop support
- File type validation enforced with clear error messages
- File size limits enforced with warning before upload
- Documents linked to PR permanently (cannot be removed after submission)
- Audit trail for all document actions (upload, download, delete)
- Document preview works for PDF and images
- Document list shows file name, size, type, upload date, and uploader

### FR-PR-008: Comments and Collaboration

**Priority**: Medium | **Status**: 🚧 Pending
**User Story**: As a team member involved in the procurement process, I want to add comments and collaborate on purchase requests so that we can clarify requirements, provide additional information, and coordinate effectively.

**Requirements**:
- Internal comments visible to organization staff only (not vendors)
- Comment threading for organized discussions
- Comment timestamps with relative time display (e.g., “2 hours ago”)
- Edit/delete own comments within 15 minutes of posting
- Rich text formatting (bold, italic, lists, links) * 
- Attachment support in comments (images, documents)

**Acceptance Criteria**:
- Comments displayed chronologically (newest first or last, user-configurable)
- Comment author clearly identified with name, role, and avatar
- Thread replies indented for visual hierarchy
- Approvers can add rejection comments directly (no separate form)

### FR-PR-009: List View and Filtering

**Priority**: High | **Status**: ✅ Implemented
**User Story**: As a purchasing staff member, I want to view and filter purchase requests efficiently so that I can quickly find specific requests, monitor pending approvals, and track department spending.

**Requirements**:
- Paginated list view with configurable rows per page (default 20, options: 10, 20, 50, 100)
- Sort by: Date, PR Number, Status, Total Amount, Requestor, Department, Delivery Date
- Multi-level filtering with instant results:
* **Status**: Draft, Pending Approval, Approved, Rejected, Cancelled, In Process, Complete, Partial
* **Date Range**: Created Date, Delivery Date (with calendar picker)
* **Department**: F&B, Housekeeping, Engineering, Front Office, etc.
* **Location**: Main Kitchen, Pastry Kitchen, Housekeeping Store, etc.
* **Requestor**: Filter by user name or department staff
* **Amount Range**: Min/Max values with preset ranges
* **Currency**: Dropdown Currency lookup
* **PR Type**: General, Market List, Asset
- Global search: PR Number, Item Name, Description
- Quick filters (one-click):
* **My PRs**: PRs created by logged-in user
* **Pending My Approval**: PRs awaiting current user’s approval
* **Recently Approved**: PRs approved in last 7 days
* **In Process**: PRs being converted to POs
* **Rejected**: PRs rejected and awaiting resubmission
- Export to Excel/CSV with all filtered data and columns
- **Create button** prominently displayed in list header
- **No** Refresh button (real-time auto-refresh)
- **No** Modify button in row (use row click for detail view)

**Acceptance Criteria**:
- List loads within 2 seconds for up to 1,000 records
- Filters apply instantly (<500ms response time)
- Sort order persists in user session
- Export includes all filtered data with proper formatting
- Column visibility customizable and persists per user
- Status filter prominently displayed for tracking workflow
- Real-time updates without manual refresh (using WebSocket or polling)
- Row actions accessible via context menu or row click
- Create button clearly visible in list header (top-right)
- Create button opens PR creation form in modal or new page
- Mobile-responsive design with collapsible filters
- Pagination controls include page jump and total count display

- Primary Filter Toggle (mutually exclusive buttons):
  * My Pending (default): Shows actionable PRs requiring user attention
    - Filters PRs with statuses: Draft, Submitted, InProgress, Rejected
    - Purpose: Quick access to items needing action from the user
  * All Documents: Shows comprehensive view of all accessible PRs
    - Displays all PRs based on user role and department permissions
    - Purpose: Full visibility of all purchase requests in the system
- Secondary Filters (context-sensitive dropdowns):
  * Status Filter (available when "All Documents" selected):
    - Options: All Status, Draft, Submitted, In Progress, Approved, Rejected, Cancelled
    - Purpose: Further refine the comprehensive document view by specific status
  * Stage Filter (available when "My Pending" selected):
    - Options: All Stage, Request Creation, Department Approval, Purchasing Review, Finance Review, Final Approval, Completed
    - Purpose: Filter actionable items by current workflow stage
  * Requester Filter (always available for both modes):
    - Filter by user name or department staff
    - Purpose: View PRs created by specific users

### FR-PR-010: Detail View

**Priority**: High | **Status**: ✅ Implemented
**User Story**: As a user, I want to view complete purchase request details in a well-organized format so that I can review all information, track progress, and make informed decisions.

**Requirements**:
- **Header Information** displayed prominently:
* PR Reference Number (large, bold)
* Creation Date and Delivery Date
* Requestor Name, Department
* Current Status with visual indicator (badge/chip)
* **Department** (clearly labeled as “Department” - the department that created the PR)
* PR Type (General, Market List, Fixed Asset)
- **Item Details Grid** with columns:
* Line Number
* Location (e.g., Main Kitchen, Housekeeping Store)
* Item Name, Description
* Request Quantity, Unit, Unit Price
* Approved Quantity
* Subtotal, Discount, Tax, Total
* Delivery Date, Delivery Point
* Vendor (if selected)
- **Financial Summary Panel**:
* Subtotal (sum of all item subtotals)
* Total Discount
* Net Amount (Subtotal - Discount)
* Total Tax
* **Grand Total** (Net + Tax)
* Currency and Exchange Rate (if multi-currency)
- **Budget Information Panel**:
* Budget Category, Budget Allocated
* Budget Committed, Budget Available
* Budget Impact of this PR
- **Approval Workflow Panel**:
* Visual timeline of approval stages
* Current stage highlighted
* Approver names, dates, and comments
* Pending approvals clearly indicated
- **Document Attachments Section**:
* List of uploaded files with preview/download
* File name, size, type, uploader, date
- **Comments Thread**:
* All comments chronologically
* User avatars and names
* Timestamps
- **Activity Log**:
* All PR actions chronologically
* User who performed action
* Timestamp
* Action description
- **Related Documents**:
* Purchase Orders created from this PR
* Links to PO detail pages

**Acceptance Criteria**:
- All information clearly organized in logical sections
- Item grid responsive and readable on all devices
- Financial summary accurate with real-time calculation
- Workflow progress visually indicated with timeline
- Activity log chronological (newest first)
- **Department field clearly labeled as “Department”** (identifies the department that created the PR)
- No ambiguous labels like “Approve by” or “Approved by” for department field
- Print view well-formatted for PDF generation
- All panels collapsible/expandable for better navigation

### FR-PR-011: Edit and Modify

**Priority**: High | **Status**: 🔧 Partial
**User Story**: As a requestor, I want to edit my purchase requests when necessary so that I can correct errors, update quantities, or modify requirements before final approval.

**Requirements**:
- **Draft PRs**: Full editing capability (all fields, items, attachments)
- **Submitted PRs**: No editing until returned or rejected
- **Rejected PRs (Void)**: Full editing capability to address rejection comments and resubmit
- **Returned PRs**: Full editing capability to address feedback and resubmit
- **Pending (In-progress)**: No editing by requestor (read-only)
- **Approved PRs**: No editing (read-only for all users)
- **Approver Adjustments**: Approvers can adjust item quantities during approval
- Edit locking to prevent concurrent modifications
- Change tracking for audit purposes
- Version history to track all modifications

**Editable Status Matrix by Role**:

| Status | Requestor | Approver | Purchasing Staff | Notes |
|--------|-----------|----------|------------------|-------|
| Draft | ✅ Full Edit | ❌ View Only | ❌ View Only | Initial state, can add/edit/remove items |
| Void (Rejected) | ❌ View Only  | ❌ View Only | ❌ View Only | View Only
| Returned | ✅ Full Edit | 👁️ Limited*  | ✅ Edit Mode | Address feedback and resubmit |
| In-progress | ❌ View Only | 👁️ Limited* | ✅ Edit Mode | *Approvers can adjust quantities |
| Approved | ❌ View Only | ❌ View Only | ❌ View Only | Read-only for all |
| Completed | ❌ View Only | ❌ View Only | ❌ View Only | Converted to PO |
| Cancelled | ❌ View Only | ❌ View Only | ❌ View Only | Cancelled PO |

**Acceptance Criteria**:
- Edit restrictions enforced by status (Draft, Void, Returned = editable by Requestor; others = read-only)
- Permission checks on all edit actions (role-based access control)
- Audit trail for all modifications (what changed, who changed, when, why)
- Version history maintained with ability to view previous versions
- Concurrent edit prevention (lock PR when user is editing, show "locked by" indicator)
- Approvers can adjust quantities with justification comments
- Returned PR status remains Returned during editing (changes to In-progress on resubmit)
- Void PR status remains Void during editing (changes to In-progress on resubmit)
- Auto-save draft changes every 30 seconds
- Warning message when navigating away with unsaved changes

### FR-PR-011A: Purchasing Staff Edit Mode Capabilities

**Priority**: High | **Status**: ✅ Implemented
**User Story**: As a purchasing staff member, I want to edit vendor pricing information, perform vendor allocations, manage tax profiles, and override financial calculations when editing a PR so that I can accurately process procurement requests with current pricing and vendor information.

**Requirements**:
- **Vendor Selection**: Select or change vendor for each line item from approved vendor list
- **Currency Management**: Select transaction currency and set exchange rate for items
- **Unit Price Entry**: Enter or modify unit price for each item
- **Discount Override**:
  - Set discount rate percentage
  - Override calculated discount amount with manual entry
- **Tax Profile Management**:
  - Select tax profile (VAT, GST, SST, WHT, None) for each item (Default from Product) 
  - Tax rate automatically set from selected tax profile
  - Override calculated tax amount with manual entry
- **Price Calculation**: System auto-calculates subtotal, net amount, and total based on inputs, All tax are add tax

**Tax Profile Defaults**:
| Tax Profile | Default Rate |
|-------------|--------------|
| VAT | 7% |
| GST | 10% |
| SST | 6% |
| WHT | 3% |
| None | 0% |

**Acceptance Criteria**:
- Purchasing staff role has access to all pricing fields in edit mode
- Vendor dropdown shows only approved vendors for the item category
- Currency selection updates exchange rate lookup
- Tax rate field displays rate from selected tax profile (read-only)
- Tax profile selection automatically updates tax rate
- Override fields allow manual entry that bypasses calculation
- All calculations update in real-time as values change
- Changes are tracked in audit log with before/after values
- Non-purchaser roles cannot edit vendor/pricing fields
- FOC items automatically set unit price to 0

**Field Availability by Role**:

Legend: ✅ = Editable | 👁️ = Read-only (visible) | ❌ = Hidden

| Field | Requestor | Approver | Purchasing Staff |
|-------|-----------|----------|------------------|
| Location | ✅  | 👁️ | 👁️ |
| Item Name | ✅  | 👁️ | 👁️ |
| Description |  👁️  | 👁️ | 👁️ |
| Item Note | ✅  | ✅ | ✅ |
| Vendor Selection | ❌ | 👁️ | ✅ |
| Currency | ❌ | 👁️ | ✅ |
| Exchange Rate | ❌ | 👁️ | ✅ |
| Unit Price | ❌ | 👁️ | ✅ |
| Discount Rate | ❌ | 👁️ | ✅ |
| Discount Override | ❌ | 👁️ | ✅ |
| Tax Profile | ❌ | 👁️ | ✅ |
| Tax Rate | ❌ | 👁️ | 👁️ |
| Tax Override | ❌ | 👁️ | ✅ |
| FOC Quantity | ❌ | 👁️ | ✅ |
| Approved Quantity | ❌ | ✅ | ✅ |
| Request Quantity | ✅  | 👁️ | 👁️ |
| Delivery Point | ✅ | ✅ | ✅ |

**Note**: Approvers always see vendor and pricing information in read-only mode to make informed approval decisions, regardless of the requestor's hide_price setting.

**Requestor Editable Fields by Status**:

| Field | Draft | Void | Returned | In-progress | Notes |
|-------|-------|------|----------|-------------|-------|
| Delivery Date | ✅ | ✅ | ✅ | ❌ | Header level |
| Description |  👁️  | 👁️  |  👁️  |  👁️ | PR purpose |
| Location | ✅ | ✅ | ✅ | ❌ | Line item |
| Item Name | ✅ | ✅ | ✅ | ❌ | Line item |
| Request Quantity | ✅ | ✅ | ✅ | ❌ | Line item |
| Approved Quantity | ❌ | ❌ | ❌ | ❌ | Line item |
| Unit of Measure | ✅ | ✅ | ✅ | ❌ | Line item |
| Requested Delivery Date | ✅ | ✅ | ✅ | ❌ | Per item |
| Delivery Point | ✅ | ✅ | ✅ | ❌ | Per item |
| Item Notes | ✅ | ✅ | ✅ | ✅  | Line item |
| Attachments | ✅ | ✅ | ✅ | ❌ | Add/remove |
| Add New Items | ✅ | ✅ | ✅ | ❌ | Line item management |
| Remove Items | ✅ | ✅ | ✅ | ❌ | Line item management |
| Vendor | ❌ | ❌ | ❌ | ❌ | Purchasing only |
| Unit Price | ❌ | ❌ | ❌ | ❌ | Purchasing only |
| Discount | ❌ | ❌ | ❌ | ❌ | Purchasing only |
| Tax | ❌ | ❌ | ❌ | ❌ | Purchasing only |

### FR-PR-012: Copy and Template

**Priority**: Medium | **Status**: 🔧 Partial
**User Story**: As a department manager, I want to create purchase requests from templates or copy existing PRs so that I can quickly create recurring orders (like daily market lists) without re-entering the same information.

**Requirements**:
- **Copy from Existing PR**: Duplicate any PR with all items and details
- **Create from Template**: Use predefined templates for common purchases
- **Template Management**: Create, edit, delete, and share templates

**Acceptance Criteria**:
- Copy preserves all items, quantities, and details from source PR
- User can modify copied PR before saving
- New reference number automatically generated for copied PR
- Template application works correctly with price updates
- Templates can be department-specific or organization-wide
- Market list templates update prices from last purchase automatically
- User can select which template fields to include (prices, vendors, delivery dates)
- Template usage tracked for optimization and improvement

### FR-PR-013: Print and Export

**Priority**: Medium | **Status**: 🔧 Partial
**User Story**: As a user, I want to print and export purchase requests in various formats so that I can share them with stakeholders, file physical copies, and perform offline analysis.

**Requirements**:
- **Print Preview**: View formatted PR before printing
- **PDF Generation**: Create PDF version of PR with all details
- **Email as PDF**: Send PR as PDF attachment via email
- **Excel Export**: Export PR details to Excel for analysis
- **Batch Export**: Export multiple PRs at once (from list view)
- **Print Format**: Professional layout matching hotel branding (logo, colors, fonts)
- **Print Options**: Include/exclude certain sections (e.g., internal comments, budget info)


**Acceptance Criteria**:
- Print preview shows exactly what will be printed
- Print layout professional, clear, and well-formatted
- PDF includes all relevant information (header, items, financials, approval history)
- PDF file size optimized (<2MB per PR)
- Email integration works correctly with customizable message
- Excel export structured properly with separate sheets for header and items
- Hotel branding elements included (logo, name, address, contact)
- Print options allow selective inclusion of sections
- Print/export actions logged in activity log

### FR-PR-014: Notifications

**Priority**: High | **Status**: 🚧 Pending
**User Story**: As a user, I want to receive timely notifications about purchase request activities so that I can take required actions promptly and stay informed about my requests’ progress.

**Requirements**:
- **Email Notifications** for key events:
* PR Submitted: Notify designated approvers with PR summary
* PR Approved (Stage): Notify requestor and next approver (if multi-stage)
* PR Fully Approved: Notify requestor and purchasing staff
* PR Rejected: Notify requestor with rejection comments
* PR Requires Action: Daily digest to pending approvers (8:00 AM)
* PR Converted to PO: Notify requestor with PO number(s)
* PR Deadline Approaching: Notify if delivery date within 3 days and not approved
- **In-App Notifications**:
* @Mention in Comments: Notify mentioned user immediately (Optional)
* Bell icon with notification counter
* Notification panel with recent activities
* Mark as read/unread
* Direct link to related PR
- **Notification Preferences**:
* User can configure which notifications to receive
* Email vs. in-app vs. both
* Frequency (immediate, daily digest, weekly digest)
* Quiet hours (no emails during specified times)
- **Mobile Push Notifications** (future enhancement)

**Acceptance Criteria**:
- Email notifications sent within 1 minute of event
- Email template professional and matches hotel branding
- Email includes PR number, requestor, amount, and direct link to PR
- Notification preferences configurable per user
- Unsubscribe option available in email footer
- In-app notifications also displayed with visual indicator
- Notification counter updates in real-time
- Digest emails group multiple notifications intelligently
- Approvers can set delegation and notifications redirect to delegate
- Notification history accessible for reference

### FR-PR-015: Mobile Responsiveness

**Priority**: Medium | **Status**: 🔧 Partial
**User Story**: As a hotel manager or department head, I want to review and approve purchase requests on my mobile device so that I can take action while on the move and not delay the procurement process.

**Requirements**:
- **Responsive Design**: Auto-adapts to tablets (iPad) and phones (iPhone, Android)
- **Touch-Friendly Controls**: Large buttons, swipe gestures, pull-to-refresh
- **Simplified Mobile View**: Streamlined interface for small screens
- **Mobile-Optimized Forms**: Easy data entry with appropriate input types
- **Offline Capability**: View PRs offline, sync when online (future)
- **Key Actions on Mobile**:
* View PR list and details
* Approve/reject PRs
* Add comments
* View approval workflow
* Receive notifications
- **No Horizontal Scrolling**: Content fits screen width
- **Mobile Navigation**: Hamburger menu, bottom tabs for quick access
- **Touch Gestures**: Swipe to view details, pull-to-refresh lists

**Acceptance Criteria**:
- Works on iOS (iPhone, iPad) and Android devices
- Touch targets minimum 44x44 pixels (Apple HIG standard)
- Forms usable on mobile with proper keyboard types (number pad for quantities)
- List view optimized for small screens with collapsible filters
- Approval actions work correctly on mobile (approve, reject, comment)
- No horizontal scrolling required on any screen
- Mobile-specific navigation (bottom tabs or slide-out menu)
- Performance optimized for mobile networks (compress images, lazy load)
- Portrait and landscape orientations supported
- Tested on minimum screen size: 375x667 (iPhone SE)

### FR-PR-016: Real-Time Inventory Integration

**Priority**: High | **Status**: 🚧 Pending
**User Story**: As a chef or department manager, I want to see real-time inventory levels and pricing information when creating purchase requests so that I can make informed decisions about what to order, avoid over-ordering, and ensure best pricing.

**Requirements**:
- **Real-Time Stock Information**:
* Display on-hand inventory quantity for user’s location (e.g., Main Kitchen Store)
* Show inventory at other locations (summary view for potential transfers)
* Display available quantity (on-hand minus reserved/committed stock)
* Show stock status indicators (Healthy, Caution, Critical, Out of Stock, No Data)
* Display suggested reorder point and reorder quantity based on consumption
- **Pricing Information**:
* Show current average cost (weighted average)
* Display last purchase price and vendor
* Show price history trend (last 30 days)
* Alert on significant price variance (>15%) from last purchase
- **Consumption Analytics**:
* Display 30-day consumption history with daily/weekly trends
* Show average daily/weekly usage
* Forecast days of stock remaining
- **Smart Suggestions**:
* Auto-fill quantity with reorder suggestion
* Suggest alternative/substitute products when out of stock
* Recommend inter-location transfers when stock available elsewhere
* Flag seasonal items or special pricing opportunities
- **Data Freshness & Caching**:
* Cache inventory data with 5-minute TTL for frequently accessed products
* Display warning when inventory data is stale (>2 hours old)
* Preserve inventory snapshot with PR for audit trail
* Real-time refresh option (manual or auto every 60 seconds)

**Acceptance Criteria**:
- Inventory data loads within 2 seconds of product selection (95th percentile)
- Inventory data refresh completes within 1 second
- System supports 50+ concurrent inventory queries without degradation
- Stock level indicators color-blind accessible (icons + colors)
- Users can only view inventory for locations within their permission scope
- Pricing information access controlled by role-based permissions (some users cannot see costs)
- Alternative product suggestions limited to same category and ±30% price range
- Historical consumption data limited to 90 days for performance
- All inventory data access logged for compliance auditing
- Rate limiting: Maximum 100 inventory queries per user per minute
- System gracefully handles inventory system unavailability (shows cached data with warning banner)
- Inventory panel does not obstruct product selection workflow (side panel or modal)
- Mobile view: inventory panel collapses to expandable accordion
- Inventory snapshot saved with PR shows: stock level, price, consumption at time of creation

**Integration Requirements**:
- REST API integration with Inventory Management System (IMS)
- Redis-backed caching with 5-minute TTL for active products
- Database query optimization: Indexed queries on product_id + location_id
- Product Catalog integration for master data and specifications
- Pricing System integration for historical pricing and cost calculations
- Analytics System integration for consumption patterns and forecasting
- Location Master integration for hierarchy and transfer rules

**Hospitality-Specific Considerations**:
- **Kitchen Operations**: Chefs can see par levels for ingredients and avoid waste
- **Housekeeping**: View amenity stock levels to optimize replenishment
- **Engineering**: Track spare parts inventory for maintenance planning
- **F&B Market Lists**: Daily ingredient orders based on real-time stock and expected covers

**Rationale**:
Integrating real-time inventory and pricing data into the PR creation process enables hotel staff to make informed purchasing decisions based on current stock levels and cost trends. This reduces unnecessary purchases, prevents stockouts, improves budget accuracy, and supports just-in-time inventory management for optimal working capital utilization.

---

### FR-PR-017: Inventory Display Integration

**Priority**: High | **Status**: 🚧 Pending
**User Story**: As a Requestor, I need to see on-hand and on-order quantities directly in the PR item row so that I can make informed ordering decisions without leaving the PR screen.

**Requirements**:
- **On-Hand Display**:
* Display current inventory quantity available for selected item
* Show as read-only field in the PR item row
* Real-time query to Inventory Management System API
* Format as integer with comma separators (e.g., “1,250”)
* Display “N/A” if inventory system unavailable or non-stock item
* Update automatically when item is changed
- **On-Order Display**:
* Display quantity currently on order from suppliers
* Show as read-only field adjacent to on-hand quantity
* Real-time query to Purchase Order System API
* Format as integer with comma separators
* Display “N/A” if data unavailable
* Include tooltip showing expected delivery dates
- **Visual Indicators**:
* Color-code on-hand based on stock levels (green: healthy, yellow: low, red: critical)
* Show icon indicator for stock status
* Display warning icon if on-order quantity exists but on-hand is critical
- **Performance Optimization**:
* Cache inventory data with 5-minute TTL
* Batch API calls for multiple items
* Load inventory data asynchronously to avoid blocking UI
* Display loading spinner while fetching data

**Acceptance Criteria**:
- On-hand and on-order quantities load within 2 seconds of item selection
- Data refreshes automatically when item is changed
- System supports 50+ concurrent inventory queries without performance degradation
- Visual indicators are color-blind accessible (icons + colors)
- Users can only view inventory for locations within their permission scope
- Clear error message displayed if inventory API fails
- Cached data displays timestamp to indicate freshness

**Integration Points**:
- Inventory Management System API
- Purchase Order System API
- User location and permission service

---

### FR-PR-018: FOC Visibility Controls

**Priority**: Medium | **Status**: 🚧 Pending
**User Story**: As a Requestor, I should not see FOC (Free of Charge) fields during PR creation, as these are procurement-level decisions handled by approvers and procurement staff.

**Requirements**:
- **Role-Based Visibility**:
* Hide `foc_quantity` and `foc_unit` fields from Requestor role
* Display FOC fields for Approver, Procurement, and Finance roles
* FOC fields visible in view mode for authorized roles
* Fields remain in database regardless of visibility
- **UI Implementation**:
* Remove FOC columns from PR item grid for Requestors
* Remove FOC input fields from item detail forms for Requestors
* Display FOC information in approval screen for authorized users
* Show FOC indicator icon in item list for users who can see it
- **Data Integrity**:
* FOC fields still saved to database even when hidden
* Validation rules apply regardless of visibility
* API accepts FOC data from authorized roles only
* Audit log records who set FOC values
- **Permission Checks**:
* Server-side validation of FOC field access
* Role-based access control on API endpoints
* Clear error message if unauthorized user attempts to set FOC
* Frontend enforcement prevents unauthorized form submission

**Acceptance Criteria**:
- Requestor role cannot see FOC fields in any PR screen
- Approver, Procurement, Finance roles see FOC fields in all screens
- FOC data is preserved in database regardless of user role
- Unauthorized API calls to set FOC values return 403 error
- UI dynamically adjusts based on user role without page refresh
- FOC visibility rules documented in user permissions matrix

**Security Considerations**:
- Frontend hiding is supplementary; server enforces access control
- API validates user role before accepting FOC data
- Audit trail captures all FOC field modifications

---

### FR-PR-019: Price Visibility Controls

**Priority**: Medium | **Status**: 🚧 Pending
**User Story**: As a Requestor, I want the option to hide pricing details from my PR so that I can focus on item specifications and quantities without being influenced by costs, while still allowing approvers and procurement to see full pricing.

**Requirements**:
- **Hide Price Toggle**:
* Add “Hide Price” checkbox/toggle at PR header level
* Default state: unchecked (prices visible)
* Setting persists with PR record
* Available only to Requestor role during creation/editing
* Not available during approval or view-only modes
- **Affected Fields When Hidden**:
* `vendor_name`
* `unit_price`
* `discount_amount`
* `net_amount`
* `tax_amount`
* `total_amount`
* All currency and monetary calculations
- **Role-Based Override**:
* Approver role: always sees prices regardless of hide_price setting
* Procurement role: always sees prices regardless of hide_price setting
* Finance role: always sees prices regardless of hide_price setting
* Requestor: respects hide_price flag
- **UI Behavior**:
* When hide_price = true for Requestor:
- Hide pricing columns from item grid
- Hide pricing fields from item detail form
- Hide PR totals and subtotals
- Replace with “Price Hidden” placeholder or remove entirely
* When hide_price = true for Approver/Procurement/Finance:
- Show all pricing fields normally
- Display indicator that Requestor chose to hide prices
- **Data Integrity**:
* All pricing data still saved to database
* Calculations still performed server-side
* API returns pricing data based on user role and hide_price flag
* Audit log records when hide_price is toggled

**Acceptance Criteria**:
- Hide Price toggle is visible and functional for Requestor role only
- When enabled, Requestor cannot see any pricing fields
- Approver/Procurement/Finance always see full pricing details
- Toggle state is saved and persists across sessions
- Pricing data is fully intact in database regardless of toggle state
- API enforces role-based pricing visibility
- Clear indicator shows when prices are hidden for authorized viewers
- Toggle cannot be changed after PR is submitted

**User Experience**:
- Toggle includes helpful tooltip explaining its purpose
- Visual confirmation when toggle is changed
- Clear messaging that approvers will still see prices

---

### FR-PR-020: Enhanced Item Pricing Breakdown

**Priority**: High | **Status**: 🚧 Pending
**User Story**: As a Procurement Officer and Finance Manager, I need to see detailed pricing breakdown including vendor name, net amount (after discount), and tax amount for each line item so that I can validate pricing accuracy and understand the full cost structure.

**Requirements**:
- **Vendor Name Field**:
* Display vendor/supplier name for each PR item
* Data type: VARCHAR(255)
* Editable field during PR creation/editing
* Read-only during approval workflow
* Auto-populate from last purchase if available
* Typeahead/dropdown with vendor suggestions
- **Net Amount Field**:
* Display amount after discount, before tax
* Calculation: `net_amount = (unit_price × quantity) - discount_amount`
* Read-only, auto-calculated field
* Data type: Decimal(15,2)
* Display with 2 decimal places
* Currency symbol based on transaction currency
* Update in real-time when unit_price, quantity, or discount changes
- **Tax Amount Field**:
* Display calculated tax for the line item
* Calculation: `tax_amount = net_amount × (tax_rate / 100)`
* Read-only, auto-calculated field
* Data type: Decimal(15,2)
* Display with 2 decimal places
* Update in real-time when net_amount or tax_rate changes
* Show tax_rate percentage in tooltip
- **Total Amount Per Line**:
* Display final line total including tax
* Calculation: `total_amount = net_amount + tax_amount`
* Read-only, auto-calculated field
* Bold or highlighted for emphasis
* Display with currency symbol
- **UI Layout**:
* Add new columns to PR item grid: Vendor, Net Amount, Tax, Total
* Group pricing fields visually for clarity
* Mobile responsive layout (stack on small screens)
* Export to PDF/Excel includes all pricing breakdown fields
- **Validation**:
* Vendor name required if unit_price is entered
* Net amount cannot be negative (discount cannot exceed unit_price × quantity)
* Tax amount recalculates automatically
* Total amount reflects all calculation changes immediately

**Acceptance Criteria**:
- All pricing fields display correctly in PR item grid and detail view
- Calculations are accurate and update in real-time
- Vendor name auto-populates from purchase history when available
- Fields are read-only where specified, editable where specified
- Mobile layout maintains usability without horizontal scrolling
- All monetary values display with correct currency symbol and 2 decimals
- PDF/Excel exports include complete pricing breakdown
- Calculation formulas match finance requirements exactly

**Integration Points**:
- Vendor Management System for vendor lookup
- Purchase History for auto-population
- Tax Rate Configuration for tax calculations
- Multi-currency system for exchange rates

---

### FR-PR-021: Item Metadata Enhancement

**Priority**: Medium | **Status**: 🔧 Partial
**User Story**: As a Requestor, I need to add specific delivery instructions, required dates, and delivery locations for each item so that procurement and receiving teams have all necessary information for fulfillment.

**Requirements**:
- **Comment Field**:
* Add free-text comment field for each PR item
* Data type: VARCHAR(500)
* Maximum 500 characters
* Optional field (not required)
* Supports special instructions, notes, handling requirements
* Display character counter during input
* Multi-line text area (3-4 rows)
* Placeholder text: “e.g., Deliver to back kitchen entrance, handle with care”
- **Required Date Field**:
* Add date picker for item-specific required date
* Data type: DATE
* Optional field (not required)
* Default: blank (no pre-filled date)
* Constraint: Must be >= current date
* Validation: Cannot be in the past
* Format: YYYY-MM-DD or locale-specific format
* Calendar picker with date restrictions
* Show days remaining if date is entered
- **Delivery Point Field**:
* Add dropdown selector for delivery location
* Data type: UUID (references delivery_points table)
* Optional field (not required)
* Options loaded from DeliveryPoint master data
* Display format: “Code - Name” (e.g., “DOCK-A - Main Kitchen Loading Dock”)
* Filter by user’s department or location if applicable
* Typeahead search within dropdown
* Show delivery point address in tooltip
- **Delivery Point Label Field**:
* Auto-populated from selected delivery point
* Data type: VARCHAR(100)
* Read-only field
* Displays human-readable location name
* Updates automatically when delivery point is changed
* Used for display in reports and approvals
- **UI Layout**:
* Add “Item Details” section to PR item form
* Group metadata fields together visually
* Collapse/expand panel for optional details
* Mobile-friendly layout
* Fields appear in both item grid (condensed) and detail view (full)
- **Validation**:
* Comment field: max 500 characters with client-side validation
* Required Date: must be >= current date
* Delivery Point: must exist in master data
* Delivery Point Label: auto-populated, cannot be manually edited

**Acceptance Criteria**:
- All three metadata fields are available for each PR item
- Comment field has character counter and validation
- Required Date field has date picker with past date restrictions
- Delivery Point dropdown loads active delivery points only
- Delivery Point Label auto-populates and updates correctly
- Fields are saved and displayed in approval workflow
- Mobile layout maintains usability
- Fields appear in PDF/Excel exports
- Validation messages are clear and user-friendly

**Integration Points**:
- DeliveryPoint master data table
- User location/department for filtering delivery points
- Date validation service

---

### FR-PR-022: Delivery Point Dropdown

**Priority**: Medium | **Status**: 🚧 Pending
**User Story**: As a Requestor, I need to select from a list of valid delivery locations so that items are delivered to the correct receiving point without manual entry errors.

**Requirements**:
- **Master Data Integration**:
* Load delivery points from `delivery_points` master data table
* Filter to show only active delivery points (active_flag = true)
* Filter by user’s department if applicable
* Cache delivery point list with appropriate TTL (e.g., 15 minutes)
- **Dropdown Behavior**:
* Searchable/typeahead dropdown for easy selection
* Display format: “{code} - {name}” (e.g., “DOCK-A - Main Kitchen Loading Dock”)
* Sort alphabetically by name
* Show delivery point description in tooltip on hover
* Allow clearing selection (set to NULL)
* Default: no pre-selected value
- **DeliveryPoint Entity Fields** (reference):
* `id` (UUID): Primary key
* `code` (VARCHAR(20)): Short location code
* `name` (VARCHAR(100)): Full location name
* `description` (TEXT): Detailed location information
* `address` (VARCHAR(500)): Physical address
* `department_id` (UUID): Owner department reference
* `active_flag` (BOOLEAN): Active status
* Created/modified audit fields
- **Validation**:
* Selected delivery point must exist in master data
* Selected delivery point must be active
* User must have permission to deliver to selected location (optional, based on business rules)
- **UI Behavior**:
* Dropdown appears in PR item detail form
* Selected value displays in item grid as condensed label
* Mobile-friendly dropdown (native select on mobile devices)
* Clear button to remove selection
* Loading state while fetching delivery points
- **Admin Configuration**:
* Delivery points managed through System Administration module
* Add/edit/deactivate delivery points
* Associate delivery points with departments
* Set default delivery points per department (optional)

**Acceptance Criteria**:
- Dropdown loads all active delivery points within 1 second
- Typeahead search filters delivery points in real-time
- Selected delivery point saves correctly to PR item
- Display format is clear and consistent
- Tooltip shows full delivery point details
- User can clear selection if needed
- Mobile dropdown is usable and accessible
- Invalid or inactive delivery points cannot be selected
- Delivery point list refreshes when master data changes

**Integration Points**:
- `delivery_points` master data table
- User department/location permissions
- Cache service for performance

---

### FR-PR-023: Header Total Removal

**Priority**: Low | **Status**: 🚧 Pending
**User Story**: As a Requestor, I do not need to see header-level totals during PR creation, as I am focused on individual line items. Totals should be calculated and visible only during approval and finalization stages.

**Requirements**:
- **Header Total Removal for Requestor**:
* Remove total amount display from PR header during creation/editing
* Remove subtotal, discount, tax, and grand total from header
* Remove any summary financial sections from header area
* Requestor focuses on line items only
- **Total Display for Approvers**:
* Display header totals during approval workflow
* Show: Subtotal, Total Discount, Net Amount, Total Tax, Grand Total
* Display in prominent summary panel
* Use clear visual hierarchy for financial summary
- **Calculation Logic**:
* Calculate totals server-side regardless of display
* Totals available via API for authorized roles
* Real-time calculation when line items change
* Totals persist in database for audit trail
- **UI Behavior**:
* Requestor view: clean header without financial summary
* Approver view: comprehensive financial summary in header
* Finance view: detailed financial breakdown with currency information
* Mobile view: collapsible financial summary for approvers
- **Role-Based Display**:
* Requestor: no header totals
* Approver: full header totals
* Procurement: full header totals
* Finance: full header totals with additional breakdown
- **Backward Compatibility**:
* Existing PRs retain calculated totals in database
* Historical reports show totals regardless of creation date
* Export functions include totals for all roles

**Acceptance Criteria**:
- Requestor view has no financial summary in header
- Approver/Procurement/Finance views display complete financial summary
- Totals are calculated accurately regardless of display
- Mobile layout adapts financial summary appropriately
- PDF/Excel exports include totals for all user roles
- Transition from creation to approval shows totals correctly
- Historical PRs display totals as expected

**User Experience**:
- Cleaner, less cluttered interface for Requestors
- Focus on item-level details during creation
- Comprehensive financial view for decision-makers

---

### FR-PR-024: Amount Override Repositioning

**Priority**: Low | **Status**: 🚧 Pending
**User Story**: As a Requestor, I need the amount override field to be positioned logically near pricing fields so that I can easily adjust amounts when necessary without confusion.

**Requirements**:
- **Field Repositioning**:
* Move `override_amount` field from its current position to be adjacent to pricing fields
* Position after `total_amount` in the pricing breakdown
* Group visually with unit_price, discount, net_amount, tax, total
* Maintain clear visual separation with subtle border or background color
- **Field Behavior**:
* Optional field (not required by default)
* Editable by Requestor during creation/editing
* Read-only during approval workflow
* When populated, overrides calculated total_amount
* Clear indicator when override is active (icon, badge, or highlight)
* Tooltip explains purpose: “Override the calculated total amount if needed”
- **Visual Indicators**:
* Show warning icon when override_amount differs from calculated total
* Display calculated amount alongside override for comparison
* Highlight override field to indicate it’s active
* Color-code: yellow for override active, default for no override
- **Validation**:
* Override amount must be > 0
* Override amount can be less than or greater than calculated amount
* Warning message if override is significantly different from calculated amount (e.g., >20% variance)
* Approval workflow flags items with override for review
- **UI Layout**:
* Position in pricing breakdown section
* Label: “Override Amount (Optional)”
* Show calculated amount for reference: “Calculated: $XXX.XX”
* Mobile layout stacks fields vertically
* Clear “Remove Override” button to revert to calculated amount
- **Audit Trail**:
* Log when override is set, modified, or removed
* Capture user who set override
* Capture timestamp of override action
* Display override reason if provided (optional comment field)

**Acceptance Criteria**:
- Override amount field is positioned in pricing breakdown section
- Field is clearly labeled and has helpful tooltip
- Visual indicators show when override is active
- Calculated amount is displayed for comparison
- Validation prevents invalid override amounts
- Approval workflow highlights overridden items
- Audit trail captures all override actions
- Mobile layout maintains usability
- “Remove Override” function works correctly

**User Experience**:
- Logical field positioning reduces confusion
- Clear visual feedback when override is active
- Easy comparison between calculated and override amounts
- Simple process to remove override and revert to calculated

---

### FR-PR-025: Monetary Amount Formatting Standards

**Priority**: Medium | **Status**: 🔧 Partial
**User Story**: As a user of the PR system, I need all monetary amounts to be formatted consistently with proper currency symbols, thousands separators, and decimal places so that financial data is easy to read and understand.

**Requirements**:
- **Format Standards**:
* All monetary amounts display with 2 decimal places
* Use comma as thousands separator (e.g., 1,234.56)
* Currency symbol positioned based on locale (e.g., $1,234.56 or 1.234,56 €)
* Negative amounts displayed with minus sign or parentheses (configurable)
* Zero amounts displayed as “0.00” not “-” or blank
- **Affected Fields**:
* `unit_price`
* `discount_amount`
* `net_amount`
* `tax_amount`
* `total_amount`
* `override_amount`
* All header totals (subtotal, grand total, etc.)
- **Multi-Currency Support**:
* Display amounts in transaction currency by default
* Show base currency equivalent in parentheses or tooltip
* Currency code displayed alongside amount (e.g., “1,234.56 USD”)
* Exchange rate displayed when viewing foreign currency amounts
* Consistent formatting across all currencies
- **Locale-Specific Formatting**:
* Respect user’s locale settings for number formatting
* Support different decimal separators (. vs ,)
* Support different thousands separators (, vs . vs space)
* Currency symbol positioning varies by locale
* Date format varies by locale
- **Visual Presentation**:
* Right-align monetary amounts in tables for easy comparison
* Use tabular/monospace numbers for alignment
* Bold or highlight total amounts
* Subtle background color for calculated fields
* Different color for negative amounts (red) vs positive (default)
- **Input Formatting**:
* Auto-format as user types (add commas, fix decimals)
* Accept input with or without currency symbols
* Accept input with or without commas
* Round to 2 decimal places automatically
* Validate numeric input only
- **Export Formatting**:
* PDF exports: maintain visual formatting
* Excel exports: numeric format with 2 decimals
* CSV exports: unformatted numbers for data processing
* Print view: formatted for readability

**Acceptance Criteria**:
- All monetary fields display with consistent 2-decimal formatting
- Thousands separators appear correctly (1,234.56)
- Currency symbols positioned correctly based on locale
- Negative amounts are clearly distinguished
- Multi-currency amounts show both transaction and base currency
- Right-alignment in tables for monetary columns
- Input fields auto-format as user types
- Locale settings are respected throughout application
- Exports maintain appropriate formatting for each format type
- Zero amounts display as “0.00”
- Tabular numbers align properly in tables

**Integration Points**:
- User locale preferences
- Multi-currency configuration
- Exchange rate service
- Export/reporting services

**User Experience**:
- Professional, consistent financial data presentation
- Easy to read and compare monetary values
- Reduced input errors with auto-formatting
- Clear distinction between different currencies

---

### FR-PR-026: Bulk Item Actions

**Priority**: High | **Status**: 🔧 Partial
**User Story**: As an Approver or Purchasing Staff member, I want to select multiple line items and perform bulk actions (approve, reject, return, split, set date) so that I can efficiently process purchase requests with many items without having to action each item individually.

**Requirements**:

- **Item Selection**:
  * Checkbox on each line item row for individual selection
  * "Select All" checkbox in header to select all visible items
  * Selected item count displayed in bulk action toolbar
  * Status summary of selected items (e.g., "10 items selected: 3 Approved, 5 Pending, 2 Rejected")
  * Selection persists during page scrolling (for paginated lists)
  * Clear selection button to deselect all items

- **Bulk Action Toolbar**:
  * Appears when one or more items are selected
  * Fixed position at top of item grid for visibility
  * Shows selection summary: "{n} items selected: {status breakdown}"
  * Action buttons displayed based on user role and item statuses
  * Toolbar dismisses when selection cleared

- **Approve Selected**:
  * Available to: Approvers, Purchasing Staff
  * Applies to items in "Pending" or "In-progress" status
  * Sets item status to "Approved"
  * Updates `approved_quantity` to match `requested_quantity` (unless modified)
  * Records approval timestamp and approver for each item
  * Skips items already approved (with notification)

- **Reject Selected**:
  * Available to: Approvers, Purchasing Staff
  * Applies to items in "Pending" or "In-progress" status
  * Opens rejection comment dialog (single comment applies to all selected items)
  * Comment required (minimum 10 characters)
  * Sets item status to "Rejected"
  * Records rejection timestamp, user, and comment for each item
  * Skips items already rejected (with notification)

- **Return Selected**:
  * Available to: Approvers, Purchasing Staff
  * Applies to items in "Pending", "In-progress", or "Approved" status
  * Opens return comment dialog (single comment applies to all selected items)
  * Comment required (minimum 10 characters)
  * Sets item status to "Returned"
  * Item returns to requestor for revision
  * Records return timestamp, user, and comment for each item

- **Split**:
  * Available to: Approver, Purchasing Staff
  * Minimum 2 items must be selected
  * Opens split configuration dialog
  * Split options:
    - By Approval Status: Separate approved items from items needing review (enables parallel processing)
    - By Vendor: Group selected items by assigned vendor
    - By Delivery Date: Group selected items by required delivery date
    - Manual Split: User defines item groupings
  * Creates new PR(s) with split items
  * Original PR updated to reflect remaining items
  * Maintains audit trail linking original and split PRs
  * **Approver Split Workflow**:
    - When some items are approved and others need requestor review
    - Approved items proceed in original PR (status: Approved)
    - Items needing review are split to new PR (status: Returned)
    - Requestor notified of split with reason for each returned item
    - Both PRs linked via parent_pr_id for traceability

- **Set Date Required**:
  * Available to: Requestor (Draft/Void/Returned), Approvers, Purchasing Staff
  * Opens date picker dialog
  * Single date applies to all selected items
  * Date must be >= current date
  * Updates `delivery_date` field for all selected items
  * Records date change in item audit trail

**Role-Based Action Availability**:

| Action | Requestor | Approver | Purchasing Staff | Notes |
|--------|-----------|----------|------------------|-------|
| Select Items | ✅ (Draft/Void/Returned) | ✅ | ✅ | Selection available based on edit permissions |
| Approve Selected | ❌ | ✅ | ✅ | For pending/in-progress items |
| Reject Selected | ❌ | ✅ | ✅ | Requires comment |
| Return Selected | ❌ | ✅ | ✅ | Requires comment |
| Split | ❌ | ✅ | ✅ | Minimum 2 items; enables parallel processing |
| Set Date Required | ✅ (Draft/Void/Returned) | ✅ | ✅ | Date >= today |

**UI Specifications**:

- **Selection Checkbox Column**:
  * Position: First column in item grid
  * Width: 40px fixed
  * Header: Checkbox for "Select All"
  * Row: Checkbox for item selection
  * Indeterminate state when some items selected

- **Bulk Action Toolbar Layout**:
  ```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ ☑ 10 items selected: 3 Approved                                        │
  │ [Approve Selected] [Reject Selected] [Return Selected] [Split] [Set Date Required] │
  └─────────────────────────────────────────────────────────────────────────┘
  ```

- **Button Styling**:
  * Approve Selected: Primary/Green
  * Reject Selected: Destructive/Red
  * Return Selected: Outline/Gray
  * Split: Secondary/Blue
  * Set Date Required: Secondary/Blue

**Validation Rules**:

- **Pre-Action Validation**:
  * Minimum 1 item selected for all actions (except Split requires 2)
  * User has permission for the action
  * Items in valid status for the action
  * Comment provided for reject/return actions

- **Action Conflict Handling**:
  * If some selected items are not valid for action:
    - Display warning: "X of Y items cannot be {action}ed"
    - Options: "Proceed with valid items" or "Cancel"
  * If all selected items are invalid:
    - Display error: "No items can be {action}ed"
    - Action button disabled

**Acceptance Criteria**:
- Checkbox selection works on individual items and "Select All"
- Bulk action toolbar appears when items are selected
- Selection count and status summary updates in real-time
- All bulk actions process correctly for valid items
- Invalid items are skipped with appropriate notification
- Comment dialogs enforce minimum character requirement
- Date picker enforces future date requirement
- Split action creates new PR(s) with correct item grouping
- All actions logged in activity trail with bulk operation indicator
- Performance: Bulk actions complete within 3 seconds for up to 50 items
- Mobile: Bulk actions accessible via long-press or action menu

**Integration Points**:
- Workflow Engine for status updates
- Notification Service for action confirmations
- Audit Service for activity logging
- PR Management for split operations

---

### FR-PR-027: Budget Tab CRUD Operations

**Priority**: High | **Status**: ✅ Implemented
**User Story**: As a Finance Manager or Purchasing Staff member, I want to manage budget allocations directly within the Purchase Request detail view so that I can add, edit, and remove budget entries to accurately track departmental spending and commitments.

**Requirements**:

- **Budget Allocation Display**:
  * Display budget allocations in a tabular format within the Budget tab
  * Show columns: Location, Category, Total Budget, Soft Commitment (Dept Head), Soft Commitment (PO), Hard Commitment, Available Budget, Current PR Amount, Status
  * Support both desktop table view and mobile card view
  * Real-time calculation of totals and available budget

- **Add Budget Allocation**:
  * "Add Budget" button opens a dialog form
  * Required fields: Location (dropdown), Category (dropdown), Total Budget (currency)
  * Optional fields: Soft Commitment (Dept Head), Soft Commitment (PO), Hard Commitment, Current PR Amount
  * Available budget calculated automatically: Total Budget - Soft Commitments - Hard Commitment
  * Status calculated automatically based on budget utilization
  * Duplicate check: Cannot add same Location + Category combination twice

- **Edit Budget Allocation**:
  * Edit action available via row dropdown menu (desktop) or card menu (mobile)
  * Opens same dialog form pre-populated with existing values
  * All fields editable except calculated fields (Available Budget, Status)
  * Real-time preview of available budget as values change
  * Validation before save

- **Delete Budget Allocation**:
  * Delete action available via row dropdown menu
  * Confirmation dialog before deletion (AlertDialog)
  * Shows budget details in confirmation to prevent accidental deletion
  * Toast notification on successful deletion

- **Status Calculation**:
  * **Over Budget**: Available budget < 0
  * **Near Limit**: Budget utilization >= 80% (Available Budget <= 20% of Total Budget)
  * **Within Budget**: Available budget >= 20% of Total Budget

- **Totals Calculation**:
  * Dynamic footer showing totals for all numeric columns
  * Totals update in real-time as budget items are added, edited, or deleted
  * Currency formatting with proper locale settings

**Location Options**:
- Front Office, Accounting, HouseKeeping, Kitchen, Restaurant, Engineering, IT, HR, Sales, Marketing

**Category Options**:
- F&B, Operating Supplies, Maintenance, Equipment, Services

**BudgetItem Interface**:
```typescript
interface BudgetItem {
  id: string;
  location: string;
  category: string;
  totalBudget: number;
  softCommitmentDeptHead: number;
  softCommitmentPO: number;
  hardCommitment: number;
  availableBudget: number;        // Calculated
  currentPRAmount: number;
  status: 'Over Budget' | 'Within Budget' | 'Near Limit';  // Calculated
}
```

**Role-Based Access**:

| Action | Requestor | Approver | Purchasing Staff | Finance Manager |
|--------|-----------|----------|------------------|-----------------|
| View Budget Tab | ✅ | ✅ | ✅ | ✅ |
| Add Budget | ❌ | ❌ | ✅ | ✅ |
| Edit Budget | ❌ | ❌ | ✅ | ✅ |
| Delete Budget | ❌ | ❌ | ✅ | ✅ |

**UI Specifications**:

- **Add Budget Button**:
  * Position: Top-right of Budget tab content area
  * Icon: Plus icon
  * Style: Primary/default button variant

- **Dialog Form Layout**:
  * Two-column grid for desktop, single column for mobile
  * Location and Category as dropdown selectors
  * Numeric fields with currency formatting
  * Real-time Available Budget preview section
  * Cancel and Save buttons in footer

- **Row Actions Dropdown**:
  * Trigger: MoreHorizontal icon button
  * Menu items: Edit (with Pencil icon), Delete (with Trash2 icon, destructive style)
  * Separator between Edit and Delete

- **Delete Confirmation Dialog**:
  * AlertDialog component for accessibility
  * Shows Location and Category of item being deleted
  * Warning message about irreversibility
  * Cancel (outline) and Delete (destructive) buttons

**Validation Rules**:

- **Required Fields**: Location, Category, Total Budget
- **Numeric Validation**: All amount fields must be >= 0
- **Duplicate Prevention**: Location + Category combination must be unique
- **Format Validation**: Numeric fields accept only valid numbers

**Error Messages**:
- Location required: "Location is required"
- Category required: "Category is required"
- Total Budget required: "Total Budget is required"
- Invalid number: "Must be a valid number >= 0"
- Duplicate entry: "Budget allocation for this Location and Category already exists"

**Acceptance Criteria**:
- Add Budget button visible and functional for authorized roles
- Dialog form validates all required fields before submission
- Edit pre-populates form with existing data correctly
- Delete confirmation prevents accidental deletions
- Totals row updates dynamically on any data change
- Available Budget calculates correctly: Total - Soft (Dept Head) - Soft (PO) - Hard Commitment
- Status indicators show correct color coding (red for Over Budget, yellow for Near Limit, green for Within Budget)
- Toast notifications confirm successful operations
- Mobile view displays budget data in card format with same functionality
- All actions logged for audit trail

**Integration Points**:
- Budget Management System for budget validation
- User Role Service for permission checking
- Audit Service for activity logging

---

### FR-PR-028: Auto-Pricing System

**Priority**: High | **Status**: ✅ Implemented
**User Story**: As a Purchasing Staff member, I want the system to automatically recommend the optimal vendor based on pricing, MOQ, and business preferences so that I can efficiently process purchase requests while ensuring cost optimization.

**Related Documentation**: [PR-AUTO-PRICING-PROCESS.md](./PR-AUTO-PRICING-PROCESS.md), [FD-purchase-requests.md](./FD-purchase-requests.md#211-auto-pricing-process-flow)

**Requirements**:

- **Unit Conversion & Price Normalization**:
  * System converts all vendor prices to a common base inventory unit (e.g., KG, L, EA)
  * Formula: `pricePerBaseUnit = unitPrice / conversionToBase`
  * All price comparisons use normalized prices for accuracy
  * Product unit configuration defines conversion factors for each ordering unit

- **Vendor Scoring Algorithm**:
  * System calculates vendor score using weighted factors:
    - Preferred Item: 35% (item marked as preferred from this vendor)
    - Preferred Vendor: 25% (vendor is department preferred)
    - Price Score: 25% (lower price = higher score)
    - Rating: 10% (vendor performance rating)
    - Lead Time: 5% (shorter lead time = higher score)
  * Formula: `score = (preferredItem × 0.35) + (preferredVendor × 0.25) + (priceScore × 0.25) + (rating × 0.10) + (leadTime × 0.05)`
  * Highest scoring vendor marked as "Recommended"

- **MOQ (Minimum Order Quantity) Validation**:
  * System converts vendor MOQ to base unit for comparison
  * Formula: `moqInBaseUnit = moqQuantity × conversionToBase`
  * Validation: `meetsRequirement = requestedInBaseUnit >= moqInBaseUnit`
  * MOQ gap calculated when requirement not met: `gap = moqInBaseUnit - requestedInBaseUnit`

- **MOQ Alert Severity Levels**:
  * **INFO** (Blue): ≥90% of MOQ met - minor adjustment suggested
  * **WARNING** (Yellow): 50-90% of MOQ met - quantity increase recommended
  * **ERROR** (Red): <50% of MOQ met - significant gap, may block submission

- **Enhanced Price Comparison UI**:
  * Display all vendor options in comparison table
  * Columns: Vendor Name, Price/Base Unit, MOQ Status, Rating, Lead Time, Score, Rank
  * Highlight recommended vendor row
  * Filter options: "MOQ Met Only", "Preferred Only"
  * Sort options: Score, Price, Rating, Lead Time, MOQ

- **Vendor Override Workflow**:
  * Purchasing Staff can select non-recommended vendor
  * Override requires reason selection:
    - Better relationship
    - Quality preference
    - Delivery requirement
    - Other (with text)
  * Override recorded for audit trail with price difference

- **Caching & Performance**:
  * Price comparison results cached for 5 minutes (TTL)
  * Cache invalidated on quantity change
  * Batch processing for multiple PR items

**Role-Based Access**:

| Feature | Requestor | Approver | Purchasing Staff |
|---------|-----------|----------|------------------|
| View Price Comparison | ❌ | 👁️ View-only | ✅ Full access |
| Select Vendor | ❌ | ❌ | ✅ |
| Override Recommended | ❌ | ❌ | ✅ (with reason) |
| View MOQ Alerts | ❌ | ✅ | ✅ |

**Acceptance Criteria**:
- All vendor prices normalized to base unit for accurate comparison
- Scoring algorithm ranks vendors consistently with business rules
- MOQ validation prevents submission when critical gaps exist (ERROR severity)
- Override reasons captured and available in audit trail
- Price comparison table displays all vendor options with relevant metrics
- Filter and sort controls function correctly
- Recommended vendor clearly highlighted in UI
- Cache improves performance on repeated views

**Implementation Files**:
- `lib/services/pr-auto-pricing-service.ts` - Main orchestrator service
- `lib/services/unit-conversion-service.ts` - Unit conversion utilities
- `lib/services/vendor-allocation-service.ts` - Vendor scoring/ranking
- `app/(main)/procurement/purchase-requests/components/enhanced-price-comparison.tsx` - Comparison UI
- `app/(main)/procurement/purchase-requests/components/moq-warning-banner.tsx` - MOQ alerts
- `app/(main)/procurement/purchase-requests/hooks/use-pr-auto-pricing.ts` - Client-side hook

---

### FR-PR-029: Multi-Currency Display

**Priority**: High | **Status**: ✅ Implemented
**User Story**: As a Finance Manager, I want to see both the transaction currency and base currency amounts throughout the Purchase Request so that I can understand the true financial impact in our reporting currency.

**Related Documentation**: [FD-purchase-requests.md](./FD-purchase-requests.md#212-multi-currency-display-flow)

**Requirements**:

- **Dual Currency Display**:
  * When item currency differs from base currency, display both amounts
  * Primary display: Transaction currency (item's original currency)
  * Secondary display: Base currency (converted amount)
  * Secondary amount shown in green (green-700) text, smaller font size

- **Currency Conversion**:
  * Formula: `convertedAmount = originalAmount × exchangeRate`
  * Exchange rate sourced from currency configuration
  * Rate can be manually overridden by Purchasing Staff with appropriate permissions

- **Display Locations**:
  * Item Detail Cards: Unit price, subtotal, discount, tax, total
  * Summary Total component: All financial summary rows
  * Applies to all monetary fields throughout PR lifecycle

- **Currency Selector (Purchasing Staff)**:
  * Dropdown with active currencies from system configuration
  * Currency options include: code, symbol, name, and "(Base)" indicator
  * Exchange rate input field (auto-populated, editable)
  * Currency change triggers recalculation of all amounts

- **Visual Indicators**:
  * Badge: "Base Currency" indicator when viewing multi-currency PR
  * Badge: Exchange rate display (e.g., "Rate: 1 EUR = 1.176 USD")
  * Green text color for converted amounts
  * Smaller font size for secondary (base) amounts

- **Summary Total Display**:
  * Subtotal: Primary + Secondary amounts
  * Discount: Primary + Secondary amounts (with minus sign)
  * Net Amount: Primary + Secondary amounts
  * Tax: Primary + Secondary amounts (with plus sign)
  * Total: Primary (bold) + Secondary amounts

**Display Rules**:

| Scenario | Primary Display | Secondary Display | Badges |
|----------|-----------------|-------------------|--------|
| Same currency | Transaction amount only | None | None |
| Different currency | Transaction currency | Base currency (green) | Base Currency, Exchange Rate |

**Styling Specifications**:

| Element | Transaction Currency | Base Currency |
|---------|---------------------|---------------|
| Text Color | gray-900 (default) | green-700 |
| Font Size | text-sm, text-base | text-xs |
| Position | Primary (top/left) | Secondary (below/right) |
| Font Weight | semibold/bold | normal |

**Acceptance Criteria**:
- Single currency PRs display amounts without conversion
- Multi-currency PRs display both amounts at all relevant locations
- Exchange rate badge shows current conversion rate
- Base currency badge indicates reporting currency
- Currency selector allows Purchasing Staff to change currency
- Exchange rate field allows manual override when needed
- All calculations use consistent exchange rate throughout PR
- Green color clearly distinguishes base currency amounts
- Font sizing creates clear visual hierarchy

**Implementation Files**:
- `app/(main)/procurement/purchase-requests/components/tabs/ItemDetailCards.tsx` - Dual display implementation
- `app/(main)/procurement/purchase-requests/components/SummaryTotal.tsx` - Summary dual display
- `components/ui/currency-selector.tsx` - Currency selection component
- `lib/mock-data/index.ts` - mockCurrencies data

---

## Business Rules

> **Status Summary**: 🔧 Partial - Frontend validation exists; backend enforcement and integration pending

### Required Fields (🔧 Partial - frontend validation only)

- **BR-PR-001**: Reference number must be unique and auto-generated
- **BR-PR-002**: Requestor, department, delivery date are mandatory
- **BR-PR-003**: At least one item required with quantity > 0
- **BR-PR-004**: Item unit price must be > 0
- **BR-PR-005**: Description and justification required for submission

### Budget Rules (🚧 Pending - no budget system)

- **BR-PR-006**: Budget availability must be checked before submission
- **BR-PR-007**: Soft commitment created on submission, not approval
- **BR-PR-008**: Budget category must be valid and active
- **BR-PR-009**: Amount thresholds determine approval levels
- **BR-PR-010**: Budget must be available in base currency

### Workflow Rules (🔧 Partial - display only)

- **BR-PR-011**: Department head approval always required
- **BR-PR-012**: Finance review required for amounts > threshold
- **BR-PR-013**: All approvals required before status = Approved
- **BR-PR-014**: Rejection requires comments (minimum 10 characters)
- **BR-PR-015**: Approver cannot approve own PR
- **BR-PR-027**: PR rejection allowed during approval workflow (UC-PR-006) by any approver
- **BR-PR-028**: PR splitting allowed during PO conversion (UC-PR-011 Alternative Flow A1)
- **BR-PR-029**: Rejected PRs return to “Rejected” status and can be edited and resubmitted
- **BR-PR-030**: Split PRs can be divided into multiple POs by vendor or delivery date

### Data Validation Rules (🔧 Partial - client-side only)

- **BR-PR-016**: Delivery date must be future date
- **BR-PR-017**: Currency must be valid and active
- **BR-PR-018**: Exchange rates updated daily (if multi-currency)
- **BR-PR-019**: Tax rates must be current and valid
- **BR-PR-020**: Item categories must be from approved list

### Display Rules (✅ Implemented)

- **BR-PR-021**: All dates displayed in user's timezone
- **BR-PR-022**: All amounts displayed with 2 decimal places
- **BR-PR-023**: All quantities displayed with 3 decimal places
- **BR-PR-024**: Currency symbol displayed based on PR currency
- **BR-PR-025**: Numeric values right-aligned in grids
- **BR-PR-026**: Department field must be labeled as “Department” (not “Approve by” or “Approved by”)

### Inventory Integration Rules (🚧 Pending)

- **BR-PR-039**: Inventory data must be displayed within 2 seconds of product selection
- **BR-PR-040**: Stock level indicators update in real-time as user modifies quantities
- **BR-PR-041**: Inventory snapshot preserved with PR for audit trail
- **BR-PR-042**: Cached inventory data max age: 24 hours before warning required
- **BR-PR-043**: Price variance >15% triggers mandatory justification
- **BR-PR-044**: Users can only view inventory for locations they have permission to access
- **BR-PR-045**: Alternative product suggestions limited to same category and similar price range (±30%)
- **BR-PR-046**: Historical consumption data limited to 90 days for performance

### Template Management Rules (🚧 Pending)

- **BR-PR-047**: Template names must be unique within department scope
- **BR-PR-048**: Templates can be department-specific or organization-wide
- **BR-PR-049**: Organization-wide templates require purchasing manager approval
- **BR-PR-050**: Templates automatically include last purchase pricing option
- **BR-PR-051**: Deleted templates are soft-deleted and retained for audit purposes
- **BR-PR-052**: Template usage tracked for analytics and optimization
- **BR-PR-053**: Templates can have tags for easier discovery (max 10 tags)
- **BR-PR-054**: Template items retain product references for automatic price updates

### FOC (Free of Charge) Rules (🚧 Pending)

- **BR-PR-055**: Item is considered FOC if focQuantity > 0 (no separate boolean flag needed)
- **BR-PR-056**: If focQuantity > 0, then focUnit is required and must be specified
- **BR-PR-057**: FOC unit may differ from order unit and must be converted to inventory unit
- **BR-PR-058**: FOC items have price = 0 but quantities tracked for inventory purposes
- **BR-PR-059**: FOC unit conversions must use product unit conversion table
- **BR-PR-060**: FOC quantity must be displayed in price comparison table (not Yes/No)

### Tax Rate Assignment Rules (🚧 Pending)

- **BR-PR-061**: When product manually selected from catalog, tax rate defaults from product table
- **BR-PR-062**: When auto-allocate triggered, tax rate comes from price list
- **BR-PR-063**: When manual allocate, tax rate assigned from price list
- **BR-PR-064**: "Adjust" checkbox prevents automatic price updates when checked
- **BR-PR-065**: Tax rate can be overridden by user with appropriate permissions

### Budget Tab CRUD Rules (✅ Implemented)

- **BR-PR-066**: Budget allocations must have unique Location + Category combinations per PR
- **BR-PR-067**: Available Budget = Total Budget - Soft Commitment (Dept Head) - Soft Commitment (PO) - Hard Commitment
- **BR-PR-068**: Status "Over Budget" when Available Budget < 0
- **BR-PR-069**: Status "Near Limit" when Available Budget <= 20% of Total Budget
- **BR-PR-070**: Status "Within Budget" when Available Budget > 20% of Total Budget
- **BR-PR-071**: Only Purchasing Staff and Finance Manager can add/edit/delete budget allocations
- **BR-PR-072**: All numeric budget fields must be >= 0
- **BR-PR-073**: Location and Category are required fields for budget allocation
- **BR-PR-074**: Total Budget is a required field and must be > 0
- **BR-PR-075**: Budget deletion requires confirmation dialog
- **BR-PR-076**: Budget totals recalculate dynamically on any CRUD operation

### Auto-Pricing Rules (✅ Implemented)

- **BR-PR-077**: All vendor prices must be normalized to base inventory unit before comparison
- **BR-PR-078**: Price normalization formula: `pricePerBaseUnit = unitPrice / conversionToBase`
- **BR-PR-079**: Vendor scoring uses weighted formula: (Preferred Item × 0.35) + (Preferred Vendor × 0.25) + (Price × 0.25) + (Rating × 0.10) + (Lead Time × 0.05)
- **BR-PR-080**: MOQ conversion formula: `moqInBaseUnit = moqQuantity × conversionToBase`
- **BR-PR-081**: MOQ validation: `meetsRequirement = requestedInBaseUnit >= moqInBaseUnit`
- **BR-PR-082**: MOQ severity INFO when percentage met ≥90%
- **BR-PR-083**: MOQ severity WARNING when percentage met is 50-90%
- **BR-PR-084**: MOQ severity ERROR when percentage met <50%
- **BR-PR-085**: Vendor with highest score is marked as "Recommended"
- **BR-PR-086**: Purchasing Staff can override recommended vendor with mandatory reason
- **BR-PR-087**: Override reasons must be one of: "Better relationship", "Quality preference", "Delivery requirement", or "Other"
- **BR-PR-088**: All vendor overrides must be recorded for audit trail with price difference
- **BR-PR-089**: Price comparison cache TTL is 5 minutes
- **BR-PR-090**: Cache must be invalidated when quantity changes
- **BR-PR-091**: Requestors cannot view price comparison or vendor details
- **BR-PR-092**: Approvers can view price comparison in read-only mode
- **BR-PR-093**: Only Purchasing Staff can select/change vendors

### Multi-Currency Display Rules (✅ Implemented)

- **BR-PR-094**: When item currency equals base currency, display single amount only
- **BR-PR-095**: When item currency differs from base currency, display both amounts
- **BR-PR-096**: Currency conversion formula: `convertedAmount = originalAmount × exchangeRate`
- **BR-PR-097**: Base currency amounts must be displayed in green (green-700) text
- **BR-PR-098**: Base currency amounts must use smaller font size (text-xs)
- **BR-PR-099**: Base currency amounts positioned below/after transaction currency amounts
- **BR-PR-100**: "Base Currency" badge must be shown for multi-currency PRs
- **BR-PR-101**: Exchange rate badge must show conversion rate (e.g., "Rate: 1 EUR = 1.176 USD")
- **BR-PR-102**: Currency selector available to Requestors during PR creation and Purchasing Staff in edit mode
- **BR-PR-103**: Exchange rate field auto-populated from system, editable for override
- **BR-PR-104**: Currency change must trigger recalculation of all base currency amounts
- **BR-PR-105**: Dual currency display applies to: Unit Price, Subtotal, Discount, Net Amount, Tax, Total
- **BR-PR-106**: Summary Total component must show dual amounts for all rows

## Data Model

### Purchase Request Entity

**Purpose**: Represents a purchase request document containing header information, financial totals, and relationships to line items, attachments, comments, and approval history.

#### Primary Key
- **id**: Unique identifier (UUID format)

#### Core Fields
| Field | Type | Description |
|-------|------|-------------|
| refNumber | Text | Reference number in format PR-YYMM-NNNN |
| date | Date | Creation date of the purchase request |
| type | Enum | Type of request: General, Market List, or Asset |
| deliveryDate | Date | Required delivery date for all items |
| description | Text | Purpose or description of the purchase request |
| justification | Text (optional) | Business justification for the request |

#### Requestor Information
| Field | Type | Description |
|-------|------|-------------|
| requestorId | Text | User ID of the person creating the request |
| requestor.name | Text | Display name of the requestor |
| requestor.department | Text | Department of the requestor |
| requestor.email | Text | Email address of the requestor |

#### Status and Workflow
| Field | Type | Description |
|-------|------|-------------|
| status | Enum | Current status: Draft, In-progress, Approved, Void, Completed, Cancelled |
| workflowStatus | Enum | Approval workflow status |
| location | Text | Location code where items are needed |
| department | Text | Department code for the request |
| jobCode | Text (optional) | Project or job code for cost allocation |

#### Currency and Exchange
| Field | Type | Description |
|-------|------|-------------|
| currency | Text | Transaction currency code |
| baseCurrency | Text | Organization base currency code |
| exchangeRate | Number | Exchange rate from transaction to base currency |

#### Financial Totals (Transaction Currency)
| Field | Type | Description |
|-------|------|-------------|
| subTotalPrice | Number | Sum of all line item subtotals (2 decimals) |
| discountAmount | Number | Total discount amount (2 decimals) |
| netAmount | Number | Subtotal minus discount (2 decimals) |
| taxAmount | Number | Total tax amount (2 decimals) |
| totalAmount | Number | Net amount plus tax (2 decimals) |

#### Financial Totals (Base Currency)
| Field | Type | Description |
|-------|------|-------------|
| baseSubTotalPrice | Number | Subtotal converted to base currency |
| baseDiscAmount | Number | Discount converted to base currency |
| baseNetAmount | Number | Net amount converted to base currency |
| baseTaxAmount | Number | Tax converted to base currency |
| baseTotalAmount | Number | Total converted to base currency |

#### Relationships
| Field | Type | Description |
|-------|------|-------------|
| items | Collection | List of Purchase Request Item records |
| attachments | Collection | List of file attachments |
| comments | Collection | List of comments and notes |
| approvalHistory | Collection | List of approval action records |

#### Audit Fields
| Field | Type | Description |
|-------|------|-------------|
| createdDate | DateTime | Timestamp when record was created |
| createdBy | Text | User ID who created the record |
| updatedDate | DateTime | Timestamp of last modification |
| updatedBy | Text | User ID who last modified the record |

---

### Purchase Request Item Entity

**Purpose**: Represents an individual line item within a purchase request, containing product details, quantities, pricing, vendor information, and delivery specifications.

#### Primary Key
- **id**: Unique identifier (UUID format)

#### Parent Relationship
| Field | Type | Description |
|-------|------|-------------|
| prId | Text | Foreign key to parent Purchase Request |
| lineNumber | Number | Sequence number for display ordering |

#### Item Details
| Field | Type | Description |
|-------|------|-------------|
| itemCode | Text (optional) | Product code if selecting from catalog |
| name | Text | Item name or description |
| description | Text (optional) | Additional description or notes |
| specification | Text (optional) | Technical specifications |

#### Quantity and Units
| Field | Type | Description |
|-------|------|-------------|
| quantityRequested | Number | Requested quantity (3 decimal places) |
| quantityApproved | Number (optional) | Approved quantity after review (3 decimal places) |
| unit | Text | Unit of measure code |

#### Location and Delivery
| Field | Type | Description |
|-------|------|-------------|
| location | Text | Storage location code |
| deliveryDate | Date | Required delivery date for this item |
| deliveryPoint | Text | Delivery point or receiving location |

#### Pricing (Transaction Currency)
| Field | Type | Description |
|-------|------|-------------|
| currency | Text | Currency code for pricing |
| price | Number | Unit price (2 decimal places) |
| subtotal | Number | Quantity multiplied by unit price |
| discountRate | Number | Discount percentage (0-100) |
| discountAmount | Number | Calculated discount amount |
| netAmount | Number | Subtotal minus discount |
| taxRate | Number | Tax percentage |
| taxAmount | Number | Calculated tax amount |
| totalAmount | Number | Net amount plus tax |

#### Pricing (Base Currency)
| Field | Type | Description |
|-------|------|-------------|
| baseSubtotal | Number | Subtotal converted to base currency |
| baseDiscAmount | Number | Discount converted to base currency |
| baseNetAmount | Number | Net amount converted to base currency |
| baseTaxAmount | Number | Tax converted to base currency |
| baseTotalAmount | Number | Total converted to base currency |

#### Classification
| Field | Type | Description |
|-------|------|-------------|
| itemCategory | Text | Primary category for the item |
| itemSubcategory | Text (optional) | Subcategory for the item |
| accountCode | Text (optional) | General ledger account code |
| jobCode | Text (optional) | Project or job code for cost allocation |

#### Vendor Information
| Field | Type | Description |
|-------|------|-------------|
| vendorId | Number (optional) | Vendor identifier |
| vendorName | Text (optional) | Vendor display name |
| pricelistNumber | Text (optional) | Reference to vendor price list |

#### FOC (Free of Charge) Fields
| Field | Type | Description |
|-------|------|-------------|
| focQuantity | Number (optional) | FOC quantity if item includes free goods |
| focUnit | Text (optional) | Unit of measure for FOC quantity |
| taxIncluded | Boolean | Whether price includes tax |

#### Additional Fields
| Field | Type | Description |
|-------|------|-------------|
| comment | Text (optional) | Line item notes or comments |

#### Audit Fields
| Field | Type | Description |
|-------|------|-------------|
| createdDate | DateTime | Timestamp when record was created |
| createdBy | Text | User ID who created the record |
| updatedDate | DateTime | Timestamp of last modification |
| updatedBy | Text | User ID who last modified the record |

## Integration Points

### Internal Systems

- **Budget Management**: Real-time budget availability checks
- **User Management**: User authentication and authorization
- **Department Management**: Department and location data
- **Workflow Engine**: Approval routing and notifications
- **Purchase Orders**: PR to PO conversion
- **Vendor Management**: Vendor selection and pricing
- **Accounting**: GL code validation and posting

### External Systems (Future)

- **Email Service**: Notification delivery
- **Document Storage**: Attachment management
- **ERP Integration**: Sync with external ERP systems
- **Vendor Portal**: Vendor access to PRs

## Non-Functional Requirements

> **Status Summary**: 🚧 Pending - Requires backend implementation for measurement and enforcement

### Performance (🚧 Pending - no backend to measure)

- **NFR-PR-001**: List page load time < 2 seconds for 1000 records
- **NFR-PR-002**: Detail page load time < 1 second
- **NFR-PR-003**: Save operation completes < 3 seconds
- **NFR-PR-004**: Budget check completes < 1 second
- **NFR-PR-005**: Support 100 concurrent users

### Security (🚧 Pending - mock auth only)

- **NFR-PR-006**: All data transmitted over HTTPS/TLS
- **NFR-PR-007**: Role-based access control enforced
- **NFR-PR-008**: Audit trail for all data modifications
- **NFR-PR-009**: Session timeout after 30 minutes inactivity
- **NFR-PR-010**: Password-protected PDF exports

### Usability (🔧 Partial - UI exists)

- **NFR-PR-011**: Interface follows organization design system
- **NFR-PR-012**: Help text available for all fields
- **NFR-PR-013**: Error messages clear and actionable
- **NFR-PR-014**: Keyboard shortcuts for common actions
- **NFR-PR-015**: Accessibility WCAG 2.1 AA compliant

### Reliability (🚧 Pending - no backend)

- **NFR-PR-016**: System availability 99.5% during business hours
- **NFR-PR-017**: Data backup every 4 hours
- **NFR-PR-018**: Disaster recovery RTO 4 hours
- **NFR-PR-019**: Automatic session recovery on network failure
- **NFR-PR-020**: Graceful degradation on service unavailability

### Scalability (🚧 Pending - mock data)

- **NFR-PR-021**: Support 10,000 PRs per year
- **NFR-PR-022**: Support 50,000 PR items per year
- **NFR-PR-023**: Database query optimization for large datasets
- **NFR-PR-024**: Pagination for all list views
- **NFR-PR-025**: Archival strategy for historical data

## Success Metrics

### Efficiency Metrics

- Average time to create PR: < 5 minutes
- Average approval cycle time: < 24 hours for standard PRs
- PR resubmission rate: < 10%
- Budget check failures: < 5%

### Quality Metrics

- PR data accuracy: > 98%
- User satisfaction score: > 4.0/5.0
- System uptime: > 99.5%
- Audit compliance: 100%

### Adoption Metrics

- User adoption rate: > 90% of target users
- Mobile usage: > 30% of total usage
- Self-service rate: > 80% (users completing without support)
- Training completion rate: 100% of active users

## Dependencies

- User Management module for authentication
- Department Management for organizational structure
- Budget Management for budget control
- Workflow Engine for approvals
- Vendor Management for vendor data
- Product Management for item catalog

## Assumptions and Constraints

### Assumptions

- Users have basic computer literacy
- Internet connection available
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Email system operational for notifications
- Budget data maintained and current

### Constraints

- Must integrate with existing ERP system
- Must comply with financial approval policies
- Must support multiple currencies
- Must maintain audit trail for 7 years
- Performance limited by database capacity

## Future Enhancements

- Mobile app (iOS/Android native)
- Recurring PR scheduling
- AI-powered vendor recommendations
- Predictive budget analysis
- Advanced analytics dashboard
- OCR for document processing
- E-signature integration
- Blockchain for audit trail
- Machine learning for approval routing

## Implementation Summary

This section provides a high-level overview of implementation progress across all requirement categories.

| Category | Total | ✅ Implemented | 🔧 Partial | 🚧 Pending | ⏳ Future |
|----------|-------|----------------|------------|------------|-----------|
| Functional Requirements | 29 | 5 | 11 | 13 | 0 |
| Business Rules | ~106 | 36 | 15 | 55 | 0 |
| Non-Functional Requirements | 25 | 0 | 5 | 20 | 0 |

### Implementation Progress by Category

**Functional Requirements (29 total)**:
- ✅ Implemented (5): Status Management, List View & Filtering, Detail View, Auto-Pricing System (FR-PR-028), Multi-Currency Display (FR-PR-029)
- 🔧 Partial (11): PR Creation, Item Management, Approval Workflow, Edit/Modify, Copy/Template, Print/Export, Mobile Responsiveness, Item Metadata, Monetary Formatting, Enhanced Pricing fields, Bulk Item Actions
- 🚧 Pending (13): Financial Calculations, Budget Control, Document Management, Comments/Collaboration, Notifications, Real-Time Inventory, Inventory Display, FOC Visibility, Price Visibility, Delivery Point Dropdown, Header Total Removal, Amount Override

**Business Rules (~106 total)**:
- ✅ Implemented (36): Display Rules (BR-PR-021 to BR-PR-026), Budget Tab CRUD Rules (BR-PR-066 to BR-PR-076), Auto-Pricing Rules (BR-PR-077 to BR-PR-093), Multi-Currency Display Rules (BR-PR-094 to BR-PR-106)
- 🔧 Partial (15): Required Fields (frontend validation), Workflow Rules (display only), Data Validation Rules (client-side)
- 🚧 Pending (55): Budget Rules, Inventory Integration Rules, Template Management Rules, FOC Rules, Tax Rate Assignment Rules

**Non-Functional Requirements (25 total)**:
- 🔧 Partial (5): Usability requirements - UI exists but not fully optimized
- 🚧 Pending (20): Performance, Security, Reliability, Scalability - require backend implementation

### Development Priority Recommendations

1. **High Priority - Enable Core Functionality**:
   - Backend API development for PR CRUD operations
   - Workflow engine integration for approvals
   - Budget system integration

2. **Medium Priority - Enhanced Features**:
   - Document upload functionality
   - Real-time inventory integration
   - Email notification system

3. **Lower Priority - Advanced Features**:
   - Template management system
   - FOC and tax visibility rules
   - Advanced reporting

## Approval

| Role | Name | Date | Signature |
| --- | --- | --- | --- |
| Business Owner |  |  |  |
| Procurement Manager |  |  |  |
| Finance Manager |  |  |  |
| IT Manager |  |  |  |