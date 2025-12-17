# Page Content: Edit Purchase Request Form

## Document Information
- **Module**: Procurement
- **Sub-Module**: Purchase Requests
- **Page**: Edit Form
- **Route**: `/procurement/purchase-requests/[id]/edit`
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

**Page Purpose**: Edit existing purchase request in draft or rejected status. Same functionality as create form but with pre-filled data, change tracking, and version conflict detection.

**User Personas**: Department Staff (Requestor) - only the original requestor can edit

**Related Documents**:
- [Business Requirements](../BR-purchase-requests.md)
- [Use Cases](../UC-purchase-requests.md)
- [Technical Specification](../TS-purchase-requests.md)
- [Create Form](./PC-create-form.md) - Reference for most content

---

## Page Header

### Page Title
**Text**: Edit Purchase Request {PR Number}
**Example**: Edit Purchase Request PR-2401-0123
**Style**: H1, bold, text-gray-900
**Location**: Top left of page

### Status Badge
**Location**: Next to page title
**Badges**: Draft (gray) or Rejected (red)
**See**: PC-list-page.md for badge color coding

### Breadcrumb
**Text**: Home / Procurement / Purchase Requests / {PR Number} / Edit
**Location**: Above page title
**Interactive**: Home, Procurement, Purchase Requests, and {PR Number} are clickable links

### Action Buttons (Header)
No action buttons in header area. All actions at bottom of form.

---

## Page Description/Instructions

**Instructional Text** (for Draft status):
```
Edit your purchase request details below. Changes are tracked automatically. Save your changes as draft or submit for approval when ready.
```

**Instructional Text** (for Rejected status):
```
This purchase request was rejected. Make the necessary changes and resubmit for approval. Rejection reason: {Rejection reason}
```

**Help Text/Tooltip**:
```
💡 Tip: Changed fields are highlighted. You can restore original values using the reset button next to each field. Save as draft to continue editing later.
```

---

## Change Tracking Banner

**Visibility**: Shown when any field has been modified

**Banner Content**:
```
⚠ You have unsaved changes
{X} field(s) modified • Last saved: {timestamp} ago
[Save Changes] [Discard Changes] [View Changes]
```

**Example**:
```
⚠ You have unsaved changes
3 fields modified • Last saved: 5 minutes ago
[Save Changes] [Discard Changes] [View Changes]
```

---

## Version Conflict Warning

**Visibility**: Shown if PR was modified by another user since page was loaded

**Warning Banner**:
```
🚨 Version Conflict Detected
This purchase request was modified by {User name} at {timestamp}. Your changes may overwrite their updates.
[Reload Latest Version] [Force Save My Changes] [View Differences]
```

**Example**:
```
🚨 Version Conflict Detected
This purchase request was modified by Maria Santos at 10:45 AM. Your changes may overwrite their updates.
[Reload Latest Version] [Force Save My Changes] [View Differences]
```

---

## Form Sections

### Section 1: Header Information

All fields same as PC-create-form.md with the following additions:

#### Change Indicators
**Visual Indicator**: Modified fields show with colored left border and reset button
**Color**: Blue left border (3px) on modified field
**Icon**: ↻ Reset icon button next to field label

**Example**:
```
[Blue bar] Description *  [↻]
           [Textarea with modified content highlighted]
```

#### Field-Level Reset
| Element | Label | Tooltip | Action |
|---------|-------|---------|--------|
| Reset button | ↻ | Restore original value | Reset field to original PR value |

**Reset Confirmation** (for destructive changes):
```
Reset to original value?
Original: "{Original value}"
Current: "{Modified value}"
[Reset] [Cancel]
```

---

### Section 2: Line Items

All functionality same as PC-create-form.md with the following additions:

#### Modified Item Indicators
**Visual**: Modified line items show with highlight background (light blue)
**Indicator**: "Modified" badge next to item number
**Details**: Hover to see change details

**Example**:
```
# | Item Name | Description | Quantity | ... | Actions
1 [Modified] | Fresh Tomatoes | Red, Firm | 12 kg → 15 kg | ... | [Remove] [Reset]
```

#### Line Item Change Tracking
**Change Types Tracked**:
- Quantity changed: "{old qty} → {new qty}"
- Price changed: "${old price} → ${new price}"
- Specification changed: "Modified"
- Item added: "New item" badge
- Item removed: Shown in change summary

---

## Dialogs/Modals

### Dialog 1: Discard Changes Confirmation

#### Dialog Header
**Title**: Discard All Changes?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
You have {X} unsaved change(s). Are you sure you want to discard all changes and return to the original purchase request?
```

**Change Summary**:
```
Changes that will be discarded:
• Delivery Date: 20 Jan 2024 → 22 Jan 2024
• Quantity (Item #2): 10 kg → 15 kg
• New item added: Fresh Lettuce
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Discard All Changes | Destructive (red, solid) | Discard changes and redirect to detail page |
| Keep Editing | Primary (blue, solid) | Close dialog and continue editing |
| Save as Draft | Secondary (gray outline) | Save changes as draft |

---

### Dialog 2: Version Conflict Details

#### Dialog Header
**Title**: Version Conflict Details
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
This purchase request was modified while you were editing. Review the conflicting changes below.
```

**Conflict Details**:
```
Modified by: {User name}
Modified at: {DD MMM YYYY, HH:mm}
Time ago: {X} minutes ago

Conflicting Changes:
Field              | Your Version    | Their Version   | Resolution
-------------------|-----------------|-----------------|------------
Delivery Date      | 22 Jan 2024     | 24 Jan 2024     | [Use Mine] [Use Theirs]
Quantity (Item #1) | 15 kg           | 12 kg           | [Use Mine] [Use Theirs]
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Save My Version | Primary (blue, solid) | Overwrite with my changes |
| Use Latest Version | Secondary (gray outline) | Reload latest and discard my changes |
| Merge Manually | Secondary (gray outline) | Close and manually merge changes |

---

### Dialog 3: View Changes Summary

#### Dialog Header
**Title**: Changes Summary
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Review all changes made to this purchase request before saving.
```

**Change List**:
```
Header Information:
✓ Description changed
  From: "Weekly vegetable order"
  To: "Weekly vegetable and fruit order for weekend event"

✓ Delivery Date changed
  From: 20 Jan 2024
  To: 22 Jan 2024

Line Items:
✓ Item #2 quantity changed
  From: 10 kg
  To: 15 kg

+ New item added: Fresh Lettuce (5 kg)

- Item removed: Tomatoes (2 kg)

Financial Summary:
Total changed: $1,250.00 → $1,485.00 (+$235.00)
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Close | Secondary (gray outline) | Close dialog |

---

## Additional Dialogs

**Note**: All other dialogs (Item Selection, Template Selection) are identical to PC-create-form.md. See that document for full specifications.

---

## Action Buttons (Bottom)

### Primary Actions
| Button Label | Style | Position | Visibility Rules |
|--------------|-------|----------|------------------|
| Save Changes | Primary (blue, solid) | Bottom right | Always visible, disabled if no changes |
| Submit for Approval | Secondary (blue outline) | Bottom right (left of Save) | Always visible, disabled if no changes or validation errors |
| Discard Changes | Text/Link (red) | Bottom center | Visible if changes made |
| Cancel | Text/Link (gray) | Bottom left | Always visible |

### Button States

| Button | Default Text | Loading Text | Success Text | Disabled State |
|--------|--------------|--------------|--------------|----------------|
| Save Changes | Save Changes | Saving... | Changes Saved! | Disabled when: no changes made |
| Submit for Approval | Submit for Approval | Submitting... | Submitted! | Disabled when: no changes, missing required fields, or validation errors |
| Discard Changes | Discard Changes | - | - | Disabled when: no changes made |
| Cancel | Cancel | - | - | Never disabled |

---

## Status Messages

### Success Messages
| Trigger | Message | Duration |
|---------|---------|----------|
| Changes saved | ✓ Purchase request updated successfully | 3 seconds |
| PR submitted | ✓ Purchase request submitted for approval | 3 seconds |
| Changes discarded | ✓ Changes discarded | 2 seconds |
| Field restored | ✓ Field restored to original value | 2 seconds |
| Item added | ✓ Item added to purchase request | 2 seconds |
| Item removed | ✓ Item removed | 2 seconds |
| All changes restored | ✓ All changes restored to original values | 3 seconds |

### Error Messages
| Error Type | Message | Action |
|------------|---------|--------|
| Validation failed | ✗ Please fix the errors below before saving | Review form |
| No changes | ℹ No changes to save | None |
| Save failed | ✗ Unable to save changes. Please try again. | Retry button |
| Submit failed | ✗ Unable to submit purchase request. Please try again or save as draft. | Retry button |
| Version conflict | ✗ This purchase request was modified by another user. Please reload and try again. | Reload button |
| Network error | ✗ Connection error. Your changes may not be saved. Please check your internet connection. | Retry button |
| Permission error | ✗ You no longer have permission to edit this purchase request | Redirect to detail |
| Status changed | ✗ This purchase request is no longer editable. Status has changed to {status}. | Redirect to detail |

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| Unsaved changes | ⚠ You have {X} unsaved change(s). Save before leaving? | [Save Changes] [Discard] [Cancel] |
| Version conflict | ⚠ This purchase request was modified by {User name}. Review conflicts before saving. | [View Conflicts] [Reload] |
| Large changes | ⚠ You've made significant changes ({X} fields modified). Review summary before saving? | [View Summary] [Continue] |
| Price increase | ⚠ Total increased by {X}% ({$old} → {$new}). Verify changes before submitting. | [Continue] [Review] |

### Info Messages
| Trigger | Message |
|---------|---------|
| Edit mode | ℹ You are editing an existing purchase request. Changes are tracked and can be restored. |
| Rejection context | ℹ This request was rejected on {date} by {Approver name}. Reason: {Rejection reason} |
| Auto-save | ℹ Changes are automatically saved as draft every 2 minutes |
| Change tracking | ℹ Modified fields are highlighted in blue. Use the reset button (↻) to restore original values. |

---

## Change Tracking Features

### Modified Field Indicators

**Visual Elements**:
- Blue left border (3px) on modified input field
- Light blue background tint on field
- "Modified" badge for line items
- Reset button (↻) next to field label

**Hover Tooltip on Modified Field**:
```
Modified
Original: {original value}
Current: {current value}
Click ↻ to restore original
```

### Change Counter

**Location**: Top of page, sticky header
**Format**: "{X} unsaved change(s)"
**Visibility**: Only shown when changes exist

### Change Summary Access

**Button**: "View Changes" in change tracking banner
**Action**: Opens modal with detailed change summary
**Keyboard Shortcut**: Ctrl/Cmd + Shift + C

---

## Validation and Error Display

**Note**: All validation rules and error display patterns are identical to PC-create-form.md. See that document for complete specifications.

**Additional Validations for Edit**:
| Validation | Rule | Error Message |
|------------|------|---------------|
| Version check | PR version matches database version | Version conflict detected. Please reload and try again. |
| Status check | PR status is Draft or Rejected | This purchase request can no longer be edited. |
| Permission check | User is original requestor | You don't have permission to edit this purchase request. |

---

## Loading States

### Loading Messages
| Loading Context | Message | Visual Indicator |
|-----------------|---------|------------------|
| Initial page load | Loading purchase request... | Skeleton form with shimmer effect |
| Saving changes | Saving changes... | Disabled form with spinner overlay |
| Submitting | Submitting purchase request... | Disabled form with spinner overlay |
| Checking version | Checking for conflicts... | Spinner in header |
| Loading original | Loading original values... | Spinner overlay |

---

## Accessibility Labels

### ARIA Labels
| Element | ARIA Label | Purpose |
|---------|------------|---------|
| Save Changes button | Save changes to purchase request | For screen readers |
| Submit button | Submit purchase request for approval | For screen readers |
| Discard Changes button | Discard all changes and return to original | For screen readers |
| Reset field button | Restore original value for {field name} | For screen readers |
| View Changes button | View summary of all changes | For screen readers |
| Change indicator | Field modified: {field name} | For screen readers |

---

## Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| Ctrl/Cmd + S | Save Changes | When form has focus and changes exist |
| Ctrl/Cmd + Enter | Submit for Approval | When form has focus, valid, and changes exist |
| Ctrl/Cmd + Z | Undo last change | When form has focus |
| Ctrl/Cmd + Shift + C | View Changes Summary | When changes exist |
| Esc | Cancel/Close dialog | When dialog is open |

---

## Microcopy

### Button Microcopy
| Context | Button Text | Rationale |
|---------|-------------|-----------|
| Save without submit | Save Changes | Clear that saving modifications to existing PR |
| Discard edits | Discard Changes | Explicit about losing modifications |
| Restore field | ↻ | Universal reset icon |
| View modifications | View Changes | Clear what will be shown |

### Status Microcopy
| Status | Message | Context |
|--------|---------|---------|
| No changes | "No unsaved changes" | When form matches original |
| Has changes | "{X} unsaved change(s)" | When fields modified |
| Saving | "Saving changes..." | During save operation |
| Saved | "All changes saved" | After successful save |

---

## Notes for Translators

### Translation Context
| Text | Context/Usage | Character Limit |
|------|---------------|-----------------|
| "Edit Purchase Request {PR Number}" | Page title with PR number | 50 characters |
| "Save Changes" | Primary action button | 25 characters |
| "Discard Changes" | Destructive action | 25 characters |
| "Modified" | Change indicator badge | 15 characters |
| "{X} unsaved change(s)" | Change counter | 40 characters |

### Non-Translatable Content
| Content | Reason |
|---------|--------|
| PR-YYMM-NNNN | System-generated reference format |
| ↻ | Universal reset symbol |
| Timestamps | System-generated times |
| Field values | User-entered data |

---

## Brand Voice Guidelines

### Tone
- Cautious about changes
- Clear about tracking and conflicts
- Supportive for corrections
- Transparent about modifications

### Writing Style
- Active voice: "Save changes" not "Changes can be saved"
- Clear change descriptions: "From X → To Y"
- Warning-focused for conflicts
- Supportive for rejected status

### Terminology Standards
| Preferred Term | Avoid | Context |
|----------------|-------|---------|
| Save Changes | Update, Modify, Edit | Primary save action |
| Discard Changes | Cancel, Delete, Remove | Revert all changes |
| Modified | Changed, Updated, Edited | Field change indicator |
| Original Value | Previous, Old, Initial | Pre-edit value |
| Version Conflict | Concurrent Edit, Collision | Simultaneous modifications |

---

## Appendix

### Related Pages
- [PC-list-page.md](./PC-list-page.md) - Purchase Request List Page
- [PC-create-form.md](./PC-create-form.md) - Create Purchase Request Form (base reference)
- [PC-detail-page.md](./PC-detail-page.md) - Purchase Request Detail Page
- [PC-dialogs.md](./PC-dialogs.md) - Shared Dialogs

### Content Dependencies
- Inherits all content from PC-create-form.md unless specified otherwise
- Change tracking terminology consistent across system
- Version conflict handling follows system-wide patterns
- Status badge colors and text shared across all PR pages

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-10-31 | Initial version | Created from TS specification | Content Team |

---

**Document End**

> 📝 **Implementation Notes**:
> - All copy reviewed and approved by UX team
> - Change tracking UI tested for usability
> - Version conflict messaging clear and actionable
> - Inherits most content from PC-create-form.md to maintain consistency
> - Modified field indicators meet WCAG AA contrast requirements
