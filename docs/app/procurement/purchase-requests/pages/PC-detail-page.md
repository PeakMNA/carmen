# Page Content: Purchase Request Detail Page

## Document Information
- **Module**: Procurement
- **Sub-Module**: Purchase Requests
- **Page**: Detail Page
- **Route**: `/procurement/purchase-requests/[id]`
- **Version**: 1.0.0
- **Last Updated**: 2025-10-31
- **Owner**: UX/Content Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|-----------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-10-31 | Content Team | Initial version from TS specification |

---

## Overview

**Page Purpose**: View complete purchase request details including header information, line items, approval workflow, attachments, comments, and activity log. Status-specific actions available based on user role and PR status.

**User Personas**: Department Staff (Requestor), Department Managers (Approvers), Purchasing Staff, Finance Managers, General Managers

**Related Documents**:
- [Business Requirements](../BR-purchase-requests.md)
- [Use Cases](../UC-purchase-requests.md)
- [Technical Specification](../TS-purchase-requests.md)

---

## Page Header

### Page Title
**Text**: Purchase Request {PR Number}
**Example**: Purchase Request PR-2401-0123
**Style**: H1, bold, text-gray-900
**Location**: Top left of page

### Status Badge
**Location**: Next to page title
**Badges**: Same as list page (Draft, Pending Approval, Approved, Rejected, Cancelled, In Process, Partially Received, Completed)
**See**: PC-list-page.md for badge color coding

### Breadcrumb
**Text**: Home / Procurement / Purchase Requests / {PR Number}
**Location**: Above page title
**Interactive**: Home, Procurement, and Purchase Requests are clickable links

### Action Buttons (Header)
| Button Label | Purpose | Style | Visibility Rules |
|--------------|---------|-------|------------------|
| Edit | Navigate to edit form | Secondary (blue outline) | Status = Draft OR Rejected AND user is requestor |
| Submit for Approval | Submit draft for approval | Primary (blue, solid) | Status = Draft AND user is requestor |
| Approve | Approve the request | Primary (green, solid) | Status = Pending Approval AND user is current approver |
| Reject | Reject the request | Destructive (red outline) | Status = Pending Approval AND user is current approver |
| Recall | Recall from approval | Secondary (gray outline) | Status = Pending Approval AND user is requestor |
| Convert to PO | Convert to purchase order | Primary (blue, solid) | Status = Approved AND user is purchasing staff |
| Cancel | Cancel the request | Destructive (red outline) | Status = Draft OR Pending Approval AND user is requestor |
| Save as Template | Save as reusable template | Secondary (gray outline) | Any status, all users with create permission |
| Print | Print or export PDF | Secondary (gray outline) | Always visible |
| More Actions | Dropdown menu | Secondary (gray outline) | Always visible |

---

## Page Description/Instructions

**Instructional Text** (status-dependent):

**For Draft Status**:
```
This purchase request is in draft status. You can edit the details or submit for approval when ready.
```

**For Pending Approval Status**:
```
This purchase request is pending approval. Current approver: {Approver Name} ({Role}).
```

**For Approved Status**:
```
This purchase request has been approved and is ready to be converted to a purchase order.
```

**For Rejected Status**:
```
This purchase request was rejected. Reason: {Rejection reason}. You can edit and resubmit.
```

---

## Section 1: Header Information

### Section Header
**Title**: Request Information
**Description**: None
**Collapsible**: No

### Information Display

| Field Label | Display Format | Example |
|-------------|----------------|---------|
| PR Number | PR-YYMM-NNNN | PR-2401-0123 |
| PR Type | Badge with icon | General, Market List, Asset |
| Date Created | DD MMM YYYY, HH:mm | 15 Jan 2024, 14:30 |
| Status | Badge with color coding | Draft (gray), Pending Approval (blue), etc. |
| Requestor | Name with avatar/initials | Maria Santos |
| Department | Full department name | Food & Beverage |
| Delivery Location | Location name | Main Kitchen |
| Delivery Date | DD MMM YYYY | 22 Jan 2024 |
| Description | Full text | Weekly vegetable and fresh produce order for restaurant operations |
| Justification | Full text or "-" | Required for weekend special menu and catering event |

---

## Section 2: Line Items

### Section Header
**Title**: Line Items
**Description**: {X} items in this request
**Collapsible**: No

### Line Items Table (Read-Only)

**Table Headers**:
| Column Header | Sortable | Tooltip |
|---------------|----------|---------|
| # | No | Item sequence number |
| Item Name | No | Product name and code |
| Description | No | Item specification |
| Quantity | No | Requested quantity and unit |
| Unit Price | No | Price per unit |
| FOC Qty/Unit | No | Free of charge quantity and unit (if applicable) |
| Tax Rate | No | Applicable tax rate |
| Line Total | No | Total amount for this line |

**Column Content Formats**:
| Column | Display Format | Example |
|--------|----------------|---------|
| # | Sequence number | 1, 2, 3 |
| Item Name | Product name<br>(Product code) | Fresh Tomatoes<br>(VEG-001) |
| Description | Specification text | Red, Firm, Grade A |
| Quantity | Number + Unit abbreviation | 10 kg |
| Unit Price | $X,XXX.XX or CURRENCY X,XXX.XX | $5.50 |
| FOC Qty/Unit | Number + Unit abbreviation or "-" | 2 kg or - |
| Tax Rate | Percentage | 7% |
| Line Total | $X,XXX.XX or CURRENCY X,XXX.XX | $58.85 |

---

## Section 3: Financial Summary

### Section Header
**Title**: Financial Summary
**Description**: Total request amount
**Collapsible**: No

### Summary Display

| Field Label | Display Format | Example |
|-------------|----------------|---------|
| Subtotal | $X,XXX.XX or CURRENCY X,XXX.XX | $1,250.00 |
| Discount | $X,XXX.XX (XX%) or "-" | $125.00 (10%) |
| Tax | $X,XXX.XX | $78.75 |
| **Grand Total** | **Bold, larger font, $X,XXX.XX** | **$1,203.75** |
| Currency | Currency code (Symbol) | USD ($) |
| Base Currency Total | Display if different from transaction currency | SGD $1,630.08 |

---

## Section 4: Approval Workflow

### Section Header
**Title**: Approval Workflow
**Description**: Approval progress and history
**Collapsible**: Yes (default expanded)

### Visual Workflow Progress Indicator

**Display Format**: Horizontal stepper/timeline showing approval stages

**Example**:
```
[✓ Submitted] ─────> [🔄 Dept Manager] ─────> [⏳ Finance] ─────> [ ] Approved
   15 Jan 14:30        Current Step              Pending
```

**Stage States**:
- ✓ Completed (green): Stage approved
- 🔄 In Progress (blue): Current approval stage
- ⏳ Pending (gray): Future approval stage
- ❌ Rejected (red): Rejection at this stage
- ↩️ Recalled (orange): Recalled before approval

### Approval History Timeline

**Format**: Reverse chronological list with timestamps

**Entry Format**:
```
[Avatar] {Approver Name} ({Role}) {Action} • {Timestamp}
         {Optional comment or reason}
```

**Example Entries**:
```
[MS] Maria Santos (Requestor) Submitted for approval • 15 Jan 2024, 14:30
     "Weekly order for fresh produce"

[DM] David Miller (Department Manager) Approved • 15 Jan 2024, 16:45
     "Quantities look good for weekend operations"

[FM] Finance Manager Pending approval • Current step
```

### Current Approvers Display

**When Pending Approval**:
```
⏳ Waiting for approval from:
• {Approver Name} ({Role}) - {Department}
• {Approver Name} ({Role}) - {Department} (if parallel approval)
```

**Example**:
```
⏳ Waiting for approval from:
• Jennifer Chen (Finance Manager) - Finance Department
```

---

## Section 5: Attachments

### Section Header
**Title**: Attachments
**Description**: {X} file(s) attached
**Collapsible**: Yes (default collapsed if no attachments)
**Action Button**: Upload Attachment (visible if user has edit permission and status allows)

### Attachment List

**Empty State**:
```
📎 No attachments
Add supporting documents, quotes, or specifications to this request.
```

**Attachment Item Format**:
| Element | Display |
|---------|---------|
| File Icon | 📄 Document icon based on file type |
| File Name | Full filename | clickable link to preview/download |
| File Size | X.X MB or X KB |
| Uploaded By | {User name} |
| Upload Date | DD MMM YYYY, HH:mm |
| Actions | Download, Preview (if supported), Delete (if editable) |

**Example**:
```
📄 Vendor_Quote_VEG-001.pdf
   2.3 MB • Uploaded by Maria Santos • 15 Jan 2024, 14:35
   [Download] [Preview] [Delete]
```

**File Type Icons**:
- 📄 PDF files
- 📊 Excel/spreadsheet files
- 📝 Word/document files
- 🖼️ Image files
- 📎 Other files

---

## Section 6: Comments

### Section Header
**Title**: Comments
**Description**: {X} comment(s)
**Collapsible**: Yes (default expanded)

### Comment Display

**Empty State**:
```
💬 No comments yet
Start a conversation about this purchase request.
```

**Comment Thread Format**:
```
[Avatar] {User Name} ({Role}) • {Timestamp}
         {Comment text}
         [Internal] or [External] badge (if applicable)

         [Reply] [Edit] [Delete]
```

**Example**:
```
[MS] Maria Santos (Requestor) • 15 Jan 2024, 14:35
     Can we expedite approval? Needed for weekend event.
     [Internal]

     [Reply] [Edit] [Delete]

     [DM] David Miller (Department Manager) • 15 Jan 2024, 15:10
          Approved and forwarded to Finance. Should have decision today.
          [Internal]

          [Reply]
```

### Add Comment Section

**Visibility**: Visible if user has permission to comment

**Comment Input**:
| Field Label | Type | Placeholder | Help Text |
|-------------|------|-------------|-----------|
| Comment | Textarea | Add a comment... | Share updates, ask questions, or provide additional information |

**Toggle Options**:
| Toggle Label | Description | Default |
|--------------|-------------|---------|
| Internal Comment | Only visible to internal staff | Checked |
| External Comment | Visible to vendors (if PR converted to PO) | Unchecked |

**Action Buttons**:
| Button Label | Purpose | Style |
|--------------|---------|-------|
| Post Comment | Submit comment | Primary (blue, solid) |
| Cancel | Clear comment input | Text/Link (gray) |

---

## Section 7: Activity Log

### Section Header
**Title**: Activity Log
**Description**: Chronological history of all actions
**Collapsible**: Yes (default collapsed)

### Activity Log Display

**Entry Format**:
```
{Timestamp} • {User Name} {Action} {Details}
```

**Activity Types**:
- Created: PR created
- Updated: Field changes
- Submitted: Submitted for approval
- Approved: Approval granted
- Rejected: Approval rejected
- Recalled: Recalled from approval
- Cancelled: PR cancelled
- Converted: Converted to PO
- Attachment Added: File uploaded
- Attachment Removed: File deleted
- Comment Added: Comment posted
- Status Changed: Status updated

**Example Entries**:
```
15 Jan 2024, 14:30 • Maria Santos created this purchase request
15 Jan 2024, 14:32 • Maria Santos added 5 items
15 Jan 2024, 14:35 • Maria Santos uploaded Vendor_Quote_VEG-001.pdf
15 Jan 2024, 14:30 • Maria Santos submitted for approval
15 Jan 2024, 16:45 • David Miller (Department Manager) approved
15 Jan 2024, 16:45 • Status changed from Pending Approval to Approved
```

**Field Change Details**:
```
15 Jan 2024, 15:20 • Maria Santos updated Delivery Date
                     From: 20 Jan 2024 → To: 22 Jan 2024
```

---

## Section 8: Related Documents

### Section Header
**Title**: Related Documents
**Description**: Linked purchase orders and templates
**Collapsible**: Yes (default collapsed if no related documents)

### Related Documents Display

**Empty State**:
```
🔗 No related documents
Related purchase orders and templates will appear here.
```

**Document Link Format**:
| Document Type | Display Format | Example |
|---------------|----------------|---------|
| Created PO | PO-YYMM-NNNN • Created {date} | PO-2401-0456 • Created 16 Jan 2024 |
| Source Template | Template: {Template Name} | Template: Weekly Produce Order |
| Created Template | Saved as Template: {Template Name} | Saved as Template: Market List Standard |

**Example**:
```
Purchase Orders:
  🔗 PO-2401-0456 • Created 16 Jan 2024 • Status: Approved

Templates:
  🔗 Source: Weekly Produce Order template
  🔗 Saved as: Market List Standard template
```

---

## Dialogs/Modals

### Dialog 1: Approve Purchase Request

#### Dialog Header
**Title**: Approve Purchase Request?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
You are about to approve this purchase request. Please review the details and add any approval comments.
```

**Details Display**:
- **PR Number**: {PR-YYMM-NNNN}
- **Requestor**: {Requestor name}
- **Total Amount**: {$X,XXX.XX}
- **Items**: {X} item(s)

**Comment Field**:
| Field Label | Type | Placeholder | Required |
|-------------|------|-------------|----------|
| Approval Comments | Textarea | Add approval comments (optional)... | No |

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Approve | Primary (green, solid) | Approve the PR and advance to next approver |
| Cancel | Secondary (gray outline) | Close dialog without action |

---

### Dialog 2: Reject Purchase Request

#### Dialog Header
**Title**: Reject Purchase Request?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
You are about to reject this purchase request. Please provide a reason for rejection to help the requestor understand the decision.
```

**Details Display**:
- **PR Number**: {PR-YYMM-NNNN}
- **Requestor**: {Requestor name}
- **Total Amount**: {$X,XXX.XX}

**Reason Field**:
| Field Label | Type | Placeholder | Required |
|-------------|------|-------------|----------|
| Rejection Reason * | Textarea | Enter reason for rejection... | Yes |

**Validation**:
- Minimum 10 characters
- Maximum 1000 characters

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Reject | Destructive (red, solid) | Reject the PR and notify requestor |
| Cancel | Secondary (gray outline) | Close dialog without action |

---

### Dialog 3: Convert to Purchase Order

#### Dialog Header
**Title**: Convert to Purchase Order
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Select how to convert this purchase request to purchase order(s). You can create one PO for all items or split by vendor.
```

**Options**:
- ⚪ Single PO: Create one purchase order for all items
- ⚪ Split by Vendor: Create separate POs for each vendor

**Preview** (when option selected):
```
This will create:
• PO 1: 5 items from Vendor A ($1,203.75)
• PO 2: 3 items from Vendor B ($850.00)
Total: 2 purchase orders
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Convert to PO | Primary (blue, solid) | Create PO(s) and link to PR |
| Cancel | Secondary (gray outline) | Close dialog without action |

---

### Dialog 4: Recall Purchase Request

#### Dialog Header
**Title**: Recall Purchase Request?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
You are about to recall this purchase request from the approval process. It will return to draft status and you can make changes.
```

**Details Display**:
- **PR Number**: {PR-YYMM-NNNN}
- **Current Approver**: {Approver name} ({Role})
- **Total Amount**: {$X,XXX.XX}

**Reason Field**:
| Field Label | Type | Placeholder | Required |
|-------------|------|-------------|----------|
| Recall Reason * | Textarea | Enter reason for recall... | Yes |

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Recall | Destructive (orange, solid) | Recall PR to draft status |
| Cancel | Secondary (gray outline) | Close dialog without action |

---

### Dialog 5: Cancel Purchase Request

#### Dialog Header
**Title**: Cancel Purchase Request?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
You are about to cancel this purchase request. This action cannot be undone. Cancelled requests cannot be edited or resubmitted.
```

**Details Display**:
- **PR Number**: {PR-YYMM-NNNN}
- **Total Amount**: {$X,XXX.XX}
- **Items**: {X} item(s)

**Reason Field**:
| Field Label | Type | Placeholder | Required |
|-------------|------|-------------|----------|
| Cancellation Reason * | Textarea | Enter reason for cancellation... | Yes |

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Cancel PR | Destructive (red, solid) | Cancel the purchase request permanently |
| Keep PR | Primary (blue, solid) | Close dialog without action |

---

### Dialog 6: Save as Template

#### Dialog Header
**Title**: Save as Template
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Save this purchase request as a reusable template for recurring orders. Template prices will update automatically based on current rates.
```

**Template Fields**:
| Field Label | Type | Placeholder | Required |
|-------------|------|-------------|----------|
| Template Name * | Text | Enter template name... | Yes |
| Description | Textarea | Enter template description... | No |
| Visibility | Dropdown | My Department / All Departments | Yes |
| Tags | Multi-select | Add tags for easier searching... | No |

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Save Template | Primary (blue, solid) | Save as template and confirm |
| Cancel | Secondary (gray outline) | Close dialog without saving |

---

## Status Messages

### Success Messages
| Trigger | Message | Duration |
|---------|---------|----------|
| PR submitted | ✓ Purchase request submitted for approval successfully | 3 seconds |
| PR approved | ✓ Purchase request approved successfully | 3 seconds |
| PR rejected | ✓ Purchase request rejected. Requestor has been notified. | 3 seconds |
| PR recalled | ✓ Purchase request recalled successfully | 3 seconds |
| PR cancelled | ✓ Purchase request cancelled | 3 seconds |
| Converted to PO | ✓ Purchase request converted to purchase order {PO number} | 4 seconds |
| Template saved | ✓ Template saved successfully | 3 seconds |
| Attachment uploaded | ✓ Attachment uploaded successfully | 2 seconds |
| Attachment deleted | ✓ Attachment deleted | 2 seconds |
| Comment posted | ✓ Comment posted | 2 seconds |
| PDF exported | ✓ PDF exported successfully. File downloaded. | 3 seconds |

### Error Messages
| Error Type | Message | Action |
|------------|---------|--------|
| Load failed | ✗ Unable to load purchase request details. Please refresh the page. | Retry button |
| Approve failed | ✗ Unable to approve purchase request. Please try again. | Retry button |
| Reject failed | ✗ Unable to reject purchase request. Please try again. | Retry button |
| Recall failed | ✗ Unable to recall purchase request. Please try again or contact support. | Retry button |
| Cancel failed | ✗ Unable to cancel purchase request. Please try again. | Retry button |
| Convert failed | ✗ Unable to convert to purchase order. Please try again or contact support. | Retry button |
| Permission denied | ✗ You don't have permission to perform this action | Dismiss |
| Upload failed | ✗ Unable to upload attachment. Please check file size and format. | Retry button |
| Network error | ✗ Connection error. Please check your internet connection and try again. | Retry button |
| Not found | ✗ Purchase request not found. It may have been deleted. | Redirect to list |

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| Already converted | ⚠ This purchase request has already been converted to PO {PO number} | [View PO] [Dismiss] |
| Budget exceeded | ⚠ Total amount exceeds available budget. Approval required from Finance Manager. | [Continue] [Dismiss] |
| Low stock warning | ⚠ Some items have low stock levels. Review inventory before converting to PO. | [Continue] [View Inventory] |

### Info Messages
| Trigger | Message |
|---------|---------|
| Pending approval | ℹ This purchase request is awaiting approval from {Approver name} ({Role}) |
| Approval routing | ℹ Approval required from: Department Manager → Finance Manager (if total > $5,000) → General Manager (if total > $20,000) |
| Template based | ℹ This request was created from template: {Template name} |
| Auto-refresh | ℹ Page automatically refreshes every 30 seconds to show latest updates |

---

## Notifications

### Toast Notifications
| Trigger | Type | Message | Duration | Position |
|---------|------|---------|----------|----------|
| Approve success | Success | Purchase request approved successfully | 3s | Top right |
| Reject success | Success | Purchase request rejected. Requestor notified. | 3s | Top right |
| Recall success | Success | Purchase request recalled successfully | 3s | Top right |
| Convert success | Success | Converted to PO {PO number} successfully | 4s | Top right |
| Action error | Error | Unable to complete action. Please try again. | 5s | Top right |
| Comment posted | Success | Comment posted | 2s | Top right |
| Attachment uploaded | Success | Attachment uploaded successfully | 2s | Top right |

---

## Accessibility Labels

### ARIA Labels
| Element | ARIA Label | Purpose |
|---------|------------|---------|
| Edit button | Edit purchase request | For screen readers |
| Submit button | Submit purchase request for approval | For screen readers |
| Approve button | Approve purchase request | For screen readers |
| Reject button | Reject purchase request | For screen readers |
| Recall button | Recall purchase request from approval | For screen readers |
| Convert button | Convert purchase request to purchase order | For screen readers |
| Cancel button | Cancel purchase request | For screen readers |
| Print button | Print or export purchase request as PDF | For screen readers |
| Status badge | Status: {status name} | For screen readers |
| Approval stage | Approval stage: {stage name}, {status} | For screen readers |

### Alt Text for Images/Icons
| Image/Icon | Alt Text |
|------------|----------|
| User avatar | {User name} avatar |
| File type icon | {File type} file icon |
| Status icons | {Status name} status indicator |
| Loading spinner | Loading data |
| Empty state icon | No {content type} illustration |

---

## Microcopy

### Button Microcopy
| Context | Button Text | Rationale |
|---------|-------------|-----------|
| Edit action | Edit | Short and universally understood |
| Submit action | Submit for Approval | Clear outcome - goes to approvers |
| Approve action | Approve | Single word, clear action |
| Reject action | Reject | Single word, clear action |
| Recall action | Recall | Industry standard terminology |
| Convert action | Convert to PO | Clear transformation |
| Cancel action | Cancel | Short and universally understood |
| Template save | Save as Template | Clear that creating reusable template |

### Link Text
| Link | Text | Destination |
|------|------|-------------|
| PR number link | {PR-YYMM-NNNN} | PR detail page (self) |
| PO link | PO-{YYMM-NNNN} | PO detail page |
| Template link | Template: {Template name} | Template detail/edit |
| Breadcrumb - Purchase Requests | Purchase Requests | Purchase requests list page |

### Placeholder Text Patterns
| Input Type | Pattern | Example |
|------------|---------|---------|
| Textarea | "Enter {field}..." | "Enter reason for rejection..." |
| Comment | "Add a comment..." | Comment input |

---

## Error States

### System Errors
| Error Type | User Message | Recovery Action |
|------------|--------------|-----------------|
| Network error | Unable to connect. Please check your internet connection and try again. | [Retry] button |
| Server error | Something went wrong on our end. Please try again in a few moments. | [Retry] button + Support contact |
| Permission error | You don't have permission to view this purchase request. Contact your administrator. | Redirect to list |
| Not found error | Purchase request not found. It may have been deleted. | Redirect to list |
| Load error | Unable to load purchase request details. Please refresh the page or try again later. | [Refresh] button |

---

## Loading States

### Loading Messages
| Loading Context | Message | Visual Indicator |
|-----------------|---------|------------------|
| Initial page load | Loading purchase request details... | Skeleton layout with shimmer effect |
| Approving | Approving purchase request... | Disabled approve button with spinner |
| Rejecting | Processing rejection... | Disabled reject button with spinner |
| Converting | Converting to purchase order... | Overlay spinner on page |
| Uploading attachment | Uploading file... | Progress bar |
| Posting comment | Posting comment... | Disabled post button with spinner |

---

## Empty States

### No Data States
| Context | Icon | Primary Message | Secondary Message | Call-to-Action |
|---------|------|-----------------|-------------------|----------------|
| No attachments | 📎 | No attachments | Add supporting documents, quotes, or specifications to this request. | Upload Attachment |
| No comments | 💬 | No comments yet | Start a conversation about this purchase request. | Add Comment |
| No related documents | 🔗 | No related documents | Related purchase orders and templates will appear here. | None |

---

## Notes for Translators

### Translation Context
| Text | Context/Usage | Character Limit |
|------|---------------|-----------------|
| "Purchase Request {PR Number}" | Page title with dynamic PR number | 50 characters |
| "Approve" | Action button | 15 characters |
| "Reject" | Action button | 15 characters |
| "Convert to PO" | Action button | 20 characters |
| Section headers | Section titles | 30 characters |
| Status messages | Success/error messages | 100 characters |

### Non-Translatable Content
| Content | Reason |
|---------|--------|
| PR-YYMM-NNNN | System-generated reference format |
| PO-YYMM-NNNN | System-generated reference format |
| $, USD, EUR | Currency symbols and codes |
| DD MMM YYYY | Standardized date format |
| Timestamps | System-generated times |

---

## Brand Voice Guidelines

### Tone
- Professional and informative
- Clear and status-aware
- Supportive for approvers
- Transparent about workflow

### Writing Style
- Active voice: "Approve purchase request" not "Purchase request can be approved"
- Second person: "You are about to approve" not "User will approve"
- Present tense for actions
- Clear hospitality terminology

### Terminology Standards
| Preferred Term | Avoid | Context |
|----------------|-------|---------|
| Purchase Request | PR, Request, Buy Request | Always use full term |
| Approve | Accept, OK, Confirm | Approval action |
| Reject | Deny, Decline | Rejection action |
| Recall | Withdraw, Pull Back | Recall from approval |
| Convert to PO | Create PO, Make PO | Conversion action |

---

## Appendix

### Related Pages
- [PC-list-page.md](./PC-list-page.md) - Purchase Request List Page
- [PC-create-form.md](./PC-create-form.md) - Create Purchase Request Form
- [PC-edit-form.md](./PC-edit-form.md) - Edit Purchase Request Form
- [PC-dialogs.md](./PC-dialogs.md) - Shared Dialogs

### Content Dependencies
- Status badge colors and text shared across all PR pages
- Button labels consistent with other pages
- Approval workflow terminology consistent with system-wide approval processes
- Currency formatting follows financial module standards

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-10-31 | Initial version | Created from TS specification | Content Team |

---

**Document End**

> 📝 **Implementation Notes**:
> - All copy reviewed and approved by UX team
> - Approval workflow terminology aligns with system-wide approval processes
> - Status-dependent content and actions properly specified
> - Accessibility labels meet WCAG AA standards
> - Dialog content follows consistent patterns
