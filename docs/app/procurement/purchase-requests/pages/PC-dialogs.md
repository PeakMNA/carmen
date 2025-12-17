# Page Content: Shared Dialogs and Modals

## Document Information
- **Module**: Procurement
- **Sub-Module**: Purchase Requests
- **Page**: Shared Dialogs
- **Version**: 1.0.0
- **Last Updated**: 2025-10-31
- **Owner**: UX/Content Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-10-31 | Content Team | Initial version consolidating all shared dialogs |

---

## Overview

**Purpose**: Central repository for all dialog and modal content used across Purchase Request pages. Ensures consistency in messaging, button labels, and user interactions.

**Scope**: Common dialogs used in List Page, Create Form, Edit Form, Detail Page, and Template Management

**Related Documents**:
- [PC-list-page.md](./PC-list-page.md)
- [PC-create-form.md](./PC-create-form.md)
- [PC-detail-page.md](./PC-detail-page.md)
- [PC-edit-form.md](./PC-edit-form.md)
- [PC-template-management.md](./PC-template-management.md)

---

## Dialog Categories

1. **Confirmation Dialogs**: Delete, Discard, Archive, Cancel confirmations
2. **Selection Dialogs**: Item selection, Template selection
3. **Action Dialogs**: Approval, Rejection, Recall, Convert to PO
4. **Export Dialogs**: Export options and settings
5. **Information Dialogs**: Usage history, Change summary, Conflict resolution

---

## Category 1: Confirmation Dialogs

### Dialog 1.1: Delete Purchase Request

#### Dialog Header
**Title**: Delete Purchase Request?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Are you sure you want to delete this purchase request? This action cannot be undone.
```

**Details Display**:
- **PR Number**: {PR-YYMM-NNNN}
- **Date**: {DD MMM YYYY}
- **Total Amount**: {$X,XXX.XX}
- **Items**: {X} item(s)

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Delete | Destructive (red, solid) | Delete the purchase request permanently |
| Cancel | Secondary (gray outline) | Close dialog without action |

**Keyboard Shortcuts**:
- Enter: Trigger Cancel (safe default)
- Ctrl/Cmd + Delete: Trigger Delete

---

### Dialog 1.2: Delete Template

#### Dialog Header
**Title**: Delete Template?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Are you sure you want to permanently delete this template? This action cannot be undone.
```

**Warning** (if template has usage):
```
⚠ This template has been used {X} times. Deleting it will not affect existing purchase requests but users will no longer be able to create new PRs from it.
```

**Details Display**:
- **Template Name**: {Template name}
- **Type**: {Type}
- **Items**: {X} items
- **Usage Count**: {X} uses
- **Created**: {DD MMM YYYY}

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Delete Permanently | Destructive (red, solid) | Delete the template permanently |
| Cancel | Secondary (gray outline) | Close dialog without action |

---

### Dialog 1.3: Discard Changes

#### Dialog Header
**Title**: Discard Changes?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text** (Create form):
```
You have unsaved changes. Are you sure you want to discard this purchase request?
```

**Instructional Text** (Edit form):
```
You have {X} unsaved change(s). Are you sure you want to discard all changes and return to the original purchase request?
```

**Details Display** (Create):
- **PR Type**: {Selected type}
- **Delivery Date**: {Selected date}
- **Items**: {X} item(s) added
- **Total Amount**: {$X,XXX.XX}

**Change Summary** (Edit):
```
Changes that will be discarded:
• Delivery Date: 20 Jan 2024 → 22 Jan 2024
• Quantity (Item #2): 10 kg → 15 kg
• New item added: Fresh Lettuce
```

#### Dialog Footer
**Action Buttons** (Create):
| Button Label | Type | Action |
|--------------|------|--------|
| Discard | Destructive (red, solid) | Discard changes and redirect to list page |
| Keep Editing | Primary (blue, solid) | Close dialog and continue editing |
| Save as Draft | Secondary (gray outline) | Save as draft and redirect to detail page |

**Action Buttons** (Edit):
| Button Label | Type | Action |
|--------------|------|--------|
| Discard All Changes | Destructive (red, solid) | Discard changes and redirect to detail page |
| Keep Editing | Primary (blue, solid) | Close dialog and continue editing |
| Save as Draft | Secondary (gray outline) | Save changes as draft |

---

### Dialog 1.4: Archive Template

#### Dialog Header
**Title**: Archive Template?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Archive this template to hide it from the active list? You can restore it later from archived templates.
```

**Details Display**:
- **Template Name**: {Template name}
- **Last Used**: {DD MMM YYYY}
- **Usage Count**: {X} uses

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Archive | Primary (orange, solid) | Archive the template |
| Cancel | Secondary (gray outline) | Close dialog without action |

---

### Dialog 1.5: Cancel Purchase Request

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

**Validation**:
- Minimum 10 characters
- Maximum 1000 characters

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Cancel PR | Destructive (red, solid) | Cancel the purchase request permanently |
| Keep PR | Primary (blue, solid) | Close dialog without action |

---

## Category 2: Selection Dialogs

### Dialog 2.1: Item Selection Dialog

#### Dialog Header
**Title**: Add Item to Purchase Request
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Search and select a product, then enter quantity and pricing details. Real-time inventory levels are shown for reference.
```

**Form Fields**:
| Field Label | Type | Placeholder | Help Text | Required |
|-------------|------|-------------|-----------|----------|
| Search Product * | Search dropdown | Search by name or code... | Start typing to search products | Yes |
| Product | Display field | (Auto-populated from search) | Selected product information | Yes |
| Specification | Textarea | Enter specifications... | Item specifications (size, color, grade, etc.) | No |
| Quantity * | Number | Enter quantity... | Requested quantity | Yes |
| Unit * | Dropdown | Select unit... | Unit of measurement (kg, pcs, box, etc.) | Yes |
| Unit Price * | Number | Enter price... | Price per unit | Yes |
| Tax Rate * | Dropdown | Select tax rate... | Applicable tax rate | Yes |
| FOC Quantity | Number | Enter FOC quantity... | Free of charge quantity (if applicable) | No |
| FOC Unit | Dropdown | Select FOC unit... | FOC unit of measurement | No |
| Adjust Price | Checkbox | Lock price from changes | - | No |
| Budget Code | Dropdown | Select budget code... | Budget allocation code | No |
| Cost Center | Dropdown | Select cost center... | Cost center code | No |
| GL Account | Dropdown | Select GL account... | General ledger account | No |

**Real-time Inventory Panel** (displayed when product selected):
```
📦 Current Inventory
Current Stock: 45.5 kg
Allocated: 12.0 kg
Available: 33.5 kg
Reorder Level: 20.0 kg

💰 Pricing Information
Last Purchase Price: $5.25/kg
Average Price (30 days): $5.45/kg
```

**Validation Messages**:
| Field | Condition | Error Message |
|-------|-----------|---------------|
| Product | Required | Please select a product |
| Specification | Max 500 characters | Specification cannot exceed 500 characters |
| Quantity | Required, > 0 | Quantity must be greater than 0 |
| Quantity | Not numeric | Quantity must be a valid number |
| Unit | Required | Please select a unit |
| Unit Price | Required, > 0 | Unit price must be greater than 0 |
| Unit Price | Not numeric | Unit price must be a valid number |
| Tax Rate | Required | Please select a tax rate |
| FOC Quantity | If provided, > 0 | FOC quantity must be greater than 0 |
| FOC Unit | Required if FOC Qty | FOC unit is required when FOC quantity is specified |

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Add Item | Primary (blue, solid) | Add item to line items table and close dialog |
| Cancel | Secondary (gray outline) | Close dialog without adding item |

**Keyboard Shortcuts**:
- Enter: Trigger Add Item (when form valid)
- Esc: Trigger Cancel

---

### Dialog 2.2: Template Selection Dialog

#### Dialog Header
**Title**: Create from Template
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Select a template to pre-fill your purchase request with frequently ordered items. You can modify quantities and prices after selecting a template.
```

**Search and Filter**:
- **Search Bar**: Search templates by name...
- **Type Filter**: All Types, Market List, Standard Order, Asset
- **Department Filter**: All Departments, {user's department}
- **Sort**: Recently Used, Most Popular, Alphabetical

**Template List**:

**Template Card Format**:
```
┌──────────────────────────────────────┐
│ [Type Badge]                         │
│                                      │
│ Template Name                        │
│ Description text...                  │
│                                      │
│ 12 items • $1,234.56                 │
│ Last used: 15 Jan 2024               │
│                                      │
│ [Select]                             │
└──────────────────────────────────────┘
```

**Template Detail Preview** (when template hovered or selected):
```
Template: Weekly Market List
Type: Market List
Department: Food & Beverage
Created by: Maria Santos

Items:
1. Fresh Tomatoes - 10 kg @ $5.50/kg
2. Fresh Lettuce - 5 kg @ $3.20/kg
3. Fresh Carrots - 8 kg @ $2.80/kg
...

Estimated Total: $1,234.56
(Prices will update to current rates)
```

**Empty State**:
```
📋 No templates available
Create your first template to save time on recurring orders.
[Create New Template]
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Use Template | Primary (blue, solid) | Load template items and close dialog |
| Cancel | Secondary (gray outline) | Close dialog without loading template |

---

## Category 3: Action Dialogs

### Dialog 3.1: Approve Purchase Request

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
- **Department**: {Department name}
- **Total Amount**: {$X,XXX.XX}
- **Items**: {X} item(s)

**Approval Comments Field**:
| Field Label | Type | Placeholder | Required |
|-------------|------|-------------|----------|
| Approval Comments | Textarea | Add approval comments (optional)... | No |

**Next Approver Info** (if applicable):
```
ℹ Next Approval Required
This request will be forwarded to: {Next Approver Name} ({Role})
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Approve | Primary (green, solid) | Approve the PR and advance to next approver |
| Cancel | Secondary (gray outline) | Close dialog without action |

---

### Dialog 3.2: Reject Purchase Request

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

**Rejection Reason Field**:
| Field Label | Type | Placeholder | Required |
|-------------|------|-------------|----------|
| Rejection Reason * | Textarea | Enter reason for rejection... | Yes |

**Validation**:
- Minimum 10 characters
- Maximum 1000 characters

**Help Text**:
```
💡 Tip: Provide specific feedback to help the requestor resubmit successfully.
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Reject | Destructive (red, solid) | Reject the PR and notify requestor |
| Cancel | Secondary (gray outline) | Close dialog without action |

---

### Dialog 3.3: Recall Purchase Request

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

**Recall Reason Field**:
| Field Label | Type | Placeholder | Required |
|-------------|------|-------------|----------|
| Recall Reason * | Textarea | Enter reason for recall... | Yes |

**Validation**:
- Minimum 10 characters
- Maximum 500 characters

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Recall | Destructive (orange, solid) | Recall PR to draft status |
| Cancel | Secondary (gray outline) | Close dialog without action |

---

### Dialog 3.4: Convert to Purchase Order

#### Dialog Header
**Title**: Convert to Purchase Order
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Select how to convert this purchase request to purchase order(s). You can create one PO for all items or split by vendor.
```

**Conversion Options**:
- ⚪ **Single PO**: Create one purchase order for all items
- ⚪ **Split by Vendor**: Create separate POs for each vendor (recommended if items from multiple vendors)

**Preview** (when option selected):

**Single PO Preview**:
```
This will create:
• 1 Purchase Order with all {X} items
• Total Amount: ${Total}
• Vendor: {Primary vendor or Mixed vendors}
```

**Split by Vendor Preview**:
```
This will create:
• PO 1: 5 items from Fresh Produce Co. ($1,203.75)
• PO 2: 3 items from Quality Suppliers ($850.00)
• PO 3: 2 items from Premium Foods ($425.00)

Total: 3 purchase orders • ${Total}
```

**PO Settings** (optional):
- ☐ Use delivery date from PR for all POs
- ☐ Copy notes to all POs
- ☐ Assign to current user

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Convert to PO | Primary (blue, solid) | Create PO(s) and link to PR |
| Cancel | Secondary (gray outline) | Close dialog without action |

---

### Dialog 3.5: Save as Template

#### Dialog Header
**Title**: Save as Template
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Save this purchase request as a reusable template for recurring orders. Template prices will update automatically based on current rates.
```

**Template Fields**:
| Field Label | Type | Placeholder | Help Text | Required |
|-------------|------|-------------|-----------|----------|
| Template Name * | Text | Enter template name... | Short, descriptive name | Yes |
| Description | Textarea | Enter template description... | Explain when to use this template | No |
| Visibility * | Dropdown | Select visibility... | Who can view and use this template | Yes |
| Tags | Multi-select | Add tags... | Tags for easier searching (e.g., weekly, produce) | No |

**Visibility Options**:
- **Private**: Only you can view and use this template
- **My Department**: Anyone in {Department name} can view and use
- **All Departments**: Everyone in the organization can view and use

**Template Preview**:
```
This template will include:
• {X} items from this PR
• Current pricing (will update automatically)
• Department and location settings
• Item specifications and quantities
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Save Template | Primary (blue, solid) | Save as template and confirm |
| Cancel | Secondary (gray outline) | Close dialog without saving |

---

## Category 4: Export Dialogs

### Dialog 4.1: Export Purchase Requests

#### Dialog Header
**Title**: Export Purchase Requests
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Select export format and options for your purchase request data.
```

**Export Options**:

| Field Label | Type | Options | Default | Required |
|-------------|------|---------|---------|----------|
| File Format * | Radio buttons | Excel (.xlsx), CSV (.csv), PDF (.pdf) | Excel | Yes |
| Include | Radio buttons | All Results, Current Page Only, Selected Items | All Results | Yes |
| Date Range | Date range picker | Custom range | Current filters | No |
| Include Columns | Multi-select checkboxes | Select columns to export | All columns | No |

**Format Descriptions**:
```
📊 Excel (.xlsx)
Best for data analysis with formatting, formulas, and multiple sheets

📄 CSV (.csv)
Compatible with all spreadsheet applications, plain text format

📑 PDF (.pdf)
Print-ready format with professional layout
```

**Export Preview** (when options selected):
```
Export Summary:
• Format: Excel (.xlsx)
• Records: 156 purchase requests
• Date Range: 01 Jan 2024 - 31 Jan 2024
• Columns: All (12 columns)
• Estimated File Size: ~2.5 MB
```

**Warning** (for large exports):
```
⚠ Exporting {count} records may take a few moments. Continue?
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Export | Primary (blue, solid) | Start export and download file |
| Cancel | Secondary (gray outline) | Close dialog without exporting |

**Progress Indicator** (during export):
```
Preparing export... 45%
[Progress bar]
```

---

## Category 5: Information Dialogs

### Dialog 5.1: Version Conflict Details

#### Dialog Header
**Title**: Version Conflict Detected
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
This purchase request was modified while you were editing. Review the conflicting changes below and choose how to proceed.
```

**Conflict Summary**:
```
Modified by: {User name}
Modified at: {DD MMM YYYY, HH:mm}
Time ago: {X} minutes ago
```

**Conflicting Changes Table**:
| Field | Your Version | Their Version | Resolution |
|-------|--------------|---------------|------------|
| Delivery Date | 22 Jan 2024 | 24 Jan 2024 | [Use Mine] [Use Theirs] |
| Quantity (Item #1) | 15 kg | 12 kg | [Use Mine] [Use Theirs] |
| Description | "Updated for event" | "Weekly order" | [Use Mine] [Use Theirs] |

**Resolution Options**:
- 🔵 **Use Mine**: Keep your version for this field
- ⚪ **Use Theirs**: Accept their version for this field

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Save Selected | Primary (blue, solid) | Save with chosen resolutions |
| Use All Mine | Secondary (blue outline) | Override with all my changes |
| Use All Theirs | Secondary (gray outline) | Accept all their changes |
| Cancel | Text/Link (gray) | Close and continue editing |

---

### Dialog 5.2: View Changes Summary

#### Dialog Header
**Title**: Changes Summary
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Review all changes made to this purchase request before saving.
```

**Change Categories**:

**Header Information**:
```
✓ Description changed
  From: "Weekly vegetable order"
  To: "Weekly vegetable and fruit order for weekend event"

✓ Delivery Date changed
  From: 20 Jan 2024
  To: 22 Jan 2024
```

**Line Items**:
```
✓ Item #2 quantity changed
  From: 10 kg
  To: 15 kg

✓ Item #3 price changed
  From: $5.25/kg
  To: $5.50/kg

+ New item added: Fresh Lettuce (5 kg @ $3.20/kg)

- Item removed: Cherry Tomatoes (2 kg)
```

**Financial Summary**:
```
Total changed: $1,250.00 → $1,485.00 (+$235.00, +18.8%)
```

**Change Statistics**:
```
📊 Total Changes: 6
• Modified: 4 fields
• Added: 1 item
• Removed: 1 item
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Close | Secondary (gray outline) | Close dialog |
| Save Changes | Primary (blue, solid) | Save and close dialog |

---

### Dialog 5.3: Usage History

#### Dialog Header
**Title**: Template Usage History
**Close Button**: X icon in top right

#### Dialog Body

**Usage Statistics Summary**:
```
📊 Usage Statistics
Total Uses: 23 times
First Used: 15 Dec 2023
Last Used: 15 Jan 2024
Average per Month: 6 uses
Most Active Month: January 2024 (8 uses)
```

**Monthly Usage Chart**:
```
Jan 2024: ████████ 8 uses
Dec 2023: ██████ 6 uses
Nov 2023: ████ 4 uses
Oct 2023: █████ 5 uses
```

**Recent Usage Timeline** (reverse chronological):
```
15 Jan 2024, 14:30 • Maria Santos created PR-2401-0123
   Items: 12 • Total: $1,234.56 • Status: Approved

12 Jan 2024, 09:15 • David Miller created PR-2401-0115
   Items: 12 • Total: $1,189.00 • Status: Pending Approval

08 Jan 2024, 11:20 • Maria Santos created PR-2401-0098
   Items: 11 • Total: $1,105.45 • Status: Completed
...
```

**Load More**: [Load More History] button at bottom (if >10 entries)

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Export History | Secondary (gray outline) | Download usage history as CSV |
| Close | Secondary (gray outline) | Close dialog |

---

## Dialog Design Patterns

### Standard Dialog Structure

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ Dialog Title                              [X]   │ ← Header (sticky)
├─────────────────────────────────────────────────┤
│ Instructional text...                           │
│                                                  │
│ [Dialog content area]                           │ ← Body (scrollable)
│ - Form fields                                    │
│ - Details display                                │
│ - Lists/tables                                   │
│                                                  │
├─────────────────────────────────────────────────┤
│              [Secondary] [Primary]               │ ← Footer (sticky)
└─────────────────────────────────────────────────┘
```

### Dialog Sizing

| Dialog Type | Width | Max Height | Scroll Behavior |
|-------------|-------|------------|-----------------|
| Confirmation | 480px | Auto | No scroll needed |
| Selection | 720px | 80vh | Body scrolls |
| Form | 640px | 90vh | Body scrolls |
| Information | 600px | 80vh | Body scrolls |
| Full Detail | 900px | 90vh | Body scrolls |

### Dialog Behavior

**Opening**:
- Fade in with slide down animation (200ms)
- Focus trap enabled (tab navigation stays within dialog)
- Backdrop overlay (semi-transparent black)
- Body scroll locked

**Closing**:
- Fade out with slide up animation (150ms)
- Focus returns to trigger element
- Body scroll restored

**Keyboard Navigation**:
- Esc: Close dialog (unless destructive action)
- Tab: Navigate through focusable elements
- Shift+Tab: Navigate backward
- Enter: Trigger default action (if safe)

---

## Accessibility Guidelines

### ARIA Labels for Dialogs

| Dialog Type | ARIA Label Pattern |
|-------------|-------------------|
| Delete confirmation | Delete {item type} {item name} |
| Approval | Approve purchase request {PR number} |
| Selection | Select {item type} for {purpose} |
| Information | View {information type} for {item} |

### Focus Management

1. **Dialog Opens**: Focus moves to first focusable element (usually close button or first input)
2. **Dialog Active**: Tab cycles through focusable elements within dialog
3. **Dialog Closes**: Focus returns to element that triggered dialog

### Screen Reader Announcements

**Dialog Opens**:
```
"Dialog opened: {Dialog title}. {Instructional text}."
```

**Form Validation**:
```
"Error: {Field name}. {Error message}."
```

**Action Success**:
```
"Success: {Success message}. Dialog closed."
```

---

## Dialog Validation Patterns

### Required Field Validation

**Visual Indicator**:
- Red border on invalid field
- Error icon next to field label
- Error message below field

**Error Message Format**:
```
❌ {Field label} {validation rule}
```

**Examples**:
```
❌ Rejection reason is required
❌ Quantity must be greater than 0
❌ Template name cannot exceed 100 characters
```

### Form-Level Validation

**Trigger**: On submit button click
**Behavior**:
1. Validate all fields
2. Show inline errors
3. Prevent dialog action
4. Focus first error field
5. Display error summary (if multiple errors)

**Error Summary**:
```
❌ Please fix the following errors:
• Rejection reason is required (minimum 10 characters)
• Tax rate must be selected
```

---

## Success and Error Handling

### Success States

**After Successful Action**:
1. Show success toast notification
2. Close dialog with fade animation
3. Update parent page/list
4. Focus returns to trigger or relevant element
5. Scroll to updated item (if applicable)

**Success Message Format**:
```
✓ {Action} {item type} successfully
```

**Examples**:
```
✓ Purchase request approved successfully
✓ Template saved successfully
✓ Export completed. File downloaded.
```

### Error States

**After Failed Action**:
1. Show error message in dialog footer
2. Keep dialog open
3. Highlight relevant fields (if validation)
4. Provide retry option

**Error Message Format**:
```
❌ Unable to {action} {item type}. {Helpful guidance}
```

**Examples**:
```
❌ Unable to approve purchase request. Please try again or contact support.
❌ Unable to save template. Template name already exists.
❌ Connection error. Please check your internet connection and try again.
```

---

## Notes for Translators

### Translation Context
| Text | Context/Usage | Character Limit |
|------|---------------|-----------------|
| Dialog titles | Modal header | 50 characters |
| Instructional text | Dialog body intro | 200 characters |
| Button labels | Action buttons | 30 characters |
| Field labels | Form fields | 30 characters |
| Error messages | Validation feedback | 100 characters |
| Success messages | Toast notifications | 80 characters |

### Non-Translatable Content
| Content | Reason |
|---------|--------|
| PR-YYMM-NNNN | System-generated reference format |
| $, USD, EUR | Currency symbols and codes |
| Numbers (quantities, counts) | Numeric values |
| Dates and times | System-generated timestamps |
| User names | Person names |
| Field values | User-entered data |

---

## Brand Voice Guidelines

### Tone
- Clear and direct in confirmations
- Supportive in error messages
- Professional in approval/rejection
- Helpful in selection dialogs

### Writing Style
- Active voice: "Are you sure you want to delete..." not "This will be deleted"
- Second person: "You are about to approve..." not "User will approve"
- Clear consequences: "This action cannot be undone"
- Specific action verbs: "Delete" not "OK", "Approve" not "Yes"

### Terminology Standards
| Preferred Term | Avoid | Context |
|----------------|-------|---------|
| Delete | Remove, Trash, Discard | Permanent deletion |
| Discard | Cancel, Abandon | Throw away changes |
| Approve | Accept, OK, Confirm | Approval action |
| Reject | Deny, Decline | Rejection action |
| Cancel | Close, Abort, Quit | Close dialog without action |

---

## Appendix

### Related Pages
All Purchase Request pages reference dialogs from this document:
- [PC-list-page.md](./PC-list-page.md)
- [PC-create-form.md](./PC-create-form.md)
- [PC-detail-page.md](./PC-detail-page.md)
- [PC-edit-form.md](./PC-edit-form.md)
- [PC-template-management.md](./PC-template-management.md)

### Dialog Usage Matrix

| Dialog | List | Create | Detail | Edit | Template |
|--------|------|--------|--------|------|----------|
| Delete PR | ✓ | - | ✓ | - | - |
| Delete Template | - | - | - | - | ✓ |
| Discard Changes | - | ✓ | - | ✓ | - |
| Item Selection | - | ✓ | - | ✓ | ✓ |
| Template Selection | - | ✓ | - | ✓ | - |
| Approve PR | - | - | ✓ | - | - |
| Reject PR | - | - | ✓ | - | - |
| Recall PR | - | - | ✓ | - | - |
| Convert to PO | - | - | ✓ | - | - |
| Save as Template | - | - | ✓ | - | - |
| Export Options | ✓ | - | - | - | ✓ |
| Version Conflict | - | - | - | ✓ | - |
| View Changes | - | - | - | ✓ | - |
| Usage History | - | - | - | - | ✓ |

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-10-31 | Initial version | Consolidation of all shared dialogs | Content Team |

---

**Document End**

> 📝 **Implementation Notes**:
> - All dialog content reviewed and approved by UX team
> - Button labels and messaging consistent across all dialogs
> - Keyboard shortcuts and accessibility tested
> - Dialog behavior patterns follow system-wide standards
> - Validation messaging clear and actionable
> - Success/error handling standardized
