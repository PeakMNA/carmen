# Page Content: {Page Name}

## Document Information
- **Module**: {Module Name}
- **Sub-Module**: {Sub-Module Name}
- **Page**: {Page Name}
- **Route**: {Application Route Path}
- **Version**: 1.0.0
- **Last Updated**: {YYYY-MM-DD}
- **Owner**: {Team/Person Name}
- **Status**: Draft | Review | Approved | Deprecated

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | {YYYY-MM-DD} | {Author} | Initial version |

---

## Overview

**Page Purpose**: {Brief description of what this page does}

**User Personas**: {Who uses this page - e.g., Department Manager, Purchasing Staff, etc.}

**Related Documents**:
- [Business Requirements](../BR-{sub-module}.md)
- [Use Cases](../UC-{sub-module}.md)
- [Technical Specification](../TS-{sub-module}.md)

---

## Page Header

### Page Title
**Text**: {Main page heading}
**Style**: H1, bold, {color}
**Location**: Top left of page

### Breadcrumb
**Text**: {Home / Module / Sub-Module / Page Name}
**Location**: Below header
**Interactive**: Links to parent pages

### Action Buttons (Header)
| Button Label | Purpose | Style | Visibility Rules |
|--------------|---------|-------|------------------|
| {Button Text} | {What it does} | Primary/Secondary | {When shown} |
| {Button Text} | {What it does} | Primary/Secondary | {When shown} |

---

## Page Description/Instructions

**Instructional Text**:
```
{Any explanatory text that appears at top of page to guide users}
```

**Help Text/Tooltip**:
```
{Hover text or info icon content}
```

---

## Filter Section

### Filter Bar Labels

| Filter Field | Label | Placeholder Text | Tooltip |
|--------------|-------|------------------|---------|
| {Field 1} | {Label text} | {Placeholder...} | {Help text} |
| {Field 2} | {Label text} | {Placeholder...} | {Help text} |

### Filter Buttons
| Button Label | Purpose |
|--------------|---------|
| Apply Filters | Apply selected filters to list |
| Clear Filters | Reset all filters to default |

### Quick Filters (Chips/Tabs)
| Chip Label | Filter Criteria | Badge Count |
|------------|-----------------|-------------|
| {Label} | {What it filters} | Yes/No |
| {Label} | {What it filters} | Yes/No |

---

## Search Section

### Search Bar
**Placeholder Text**: {Search by...}
**Help Text**: {What can be searched}
**No Results Text**: {Message when no results found}

---

## Data Table/List

### Table Headers
| Column Header | Sortable | Tooltip |
|---------------|----------|---------|
| {Column Name} | Yes/No | {Column description} |
| {Column Name} | Yes/No | {Column description} |

### Column Content Formats
| Column | Display Format | Example |
|--------|----------------|---------|
| {Column} | {Format description} | {Sample value} |
| Status | Badge with color coding | Draft (gray), Approved (green) |
| Amount | Currency with symbol | $1,234.56 |
| Date | DD MMM YYYY | 15 Jan 2024 |

### Empty State
**Icon**: {Icon name or description}
**Message**:
```
{Primary message when no data}
```
**Secondary Message**:
```
{Additional guidance}
```
**Action Button**: {Button text if applicable}

### Loading State
**Message**: {Loading message}
**Animation**: {Description of loading indicator}

---

## Row Actions

### Action Buttons/Icons
| Icon/Button | Label | Tooltip | Visibility Rules |
|-------------|-------|---------|------------------|
| {Icon} | {Label} | {Hover text} | {When shown} |
| Eye icon | View | View details | Always visible |
| Pencil icon | Edit | Edit draft | Status = Draft only |
| Trash icon | Delete | Delete draft | Status = Draft only |

### Context Menu (Right-click or ... menu)
| Menu Item | Action | Visibility Rules |
|-----------|--------|------------------|
| {Item text} | {What it does} | {When shown} |

---

## Pagination

### Pagination Controls
**Items Per Page Label**: {Show}
**Items Per Page Options**: {10, 20, 50, 100}
**Page Info Text**: {Showing X to Y of Z items}
**Navigation Buttons**: {Previous | Next}
**Page Number Display**: {Page 1 of 10}

---

## Status Messages

### Success Messages
| Trigger | Message | Duration |
|---------|---------|----------|
| {Action completed} | {Success message text} | {3 seconds} |

**Example**:
```
✓ Purchase request created successfully
✓ Purchase request updated successfully
✓ Purchase request submitted for approval
```

### Error Messages
| Error Type | Message | Action |
|------------|---------|--------|
| {Error condition} | {Error message text} | {What user should do} |

**Example**:
```
✗ Cannot submit purchase request without items
✗ Budget check failed: Insufficient funds available
✗ Connection error. Please try again.
```

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| {Warning condition} | {Warning message text} | {Available actions} |

**Example**:
```
⚠ You have unsaved changes. Save before leaving?
[Save] [Discard] [Cancel]
```

### Info Messages
| Trigger | Message |
|---------|---------|
| {Info condition} | {Info message text} |

**Example**:
```
ℹ This purchase request is currently pending approval
```

---

## Dialogs/Modals

### Dialog 1: {Dialog Name}

#### Dialog Header
**Title**: {Dialog title}
**Close Button**: X icon in top right

#### Dialog Body

**Labels and Fields**:
| Field Label | Placeholder | Help Text | Required |
|-------------|-------------|-----------|----------|
| {Label} | {Placeholder...} | {Help text} | Yes/No |

**Instructional Text**:
```
{Any explanatory text in dialog}
```

**Validation Messages**:
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| {Field} | {Rule} | {Error text} |

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| {Button text} | Primary | {What it does} |
| {Button text} | Secondary | {What it does} |
| Cancel | Text/Secondary | Close dialog without action |

#### Dialog Success State
**Message**: {Success message after dialog action}
**Auto-close**: Yes/No after {X seconds}

---

### Dialog 2: {Dialog Name}

{Repeat structure as above}

---

## Form Sections

### Section 1: {Section Name}

#### Section Header
**Title**: {Section heading}
**Description**: {Optional section description}
**Help Icon**: {Tooltip text if present}

#### Form Fields

| Field Label | Type | Placeholder | Help Text | Required | Validation |
|-------------|------|-------------|-----------|----------|------------|
| {Label} | Text | {Placeholder...} | {Help} | Yes/No | {Rules} |
| {Label} | Dropdown | {Select...} | {Help} | Yes/No | {Rules} |
| {Label} | Date | {DD/MM/YYYY} | {Help} | Yes/No | {Rules} |

#### Field-Level Messages
| Field | Message Type | Message Text |
|-------|--------------|--------------|
| {Field} | Error | {Validation error message} |
| {Field} | Warning | {Warning message} |
| {Field} | Info | {Informational text below field} |

---

## Action Buttons (Bottom)

### Primary Actions
| Button Label | Style | Position | Visibility Rules |
|--------------|-------|----------|------------------|
| {Button text} | Primary | {Left/Right} | {When shown} |

### Secondary Actions
| Button Label | Style | Position | Visibility Rules |
|--------------|-------|----------|------------------|
| {Button text} | Secondary | {Left/Right} | {When shown} |

### Button States
| Button | Default Text | Loading Text | Success Text | Disabled State |
|--------|--------------|--------------|--------------|----------------|
| {Button} | {Text} | {Loading...} | {Success!} | {When disabled} |

---

## Confirmation Dialogs

### Confirmation 1: {Action Name}

**Trigger**: {What action triggers this confirmation}

**Dialog Content**:
```
{Confirmation question or warning text}
```

**Details** (if applicable):
```
{Additional information or consequences}
```

**Action Buttons**:
| Button Label | Style | Action |
|--------------|-------|--------|
| {Confirm button} | Destructive/Primary | {What happens} |
| {Cancel button} | Secondary | Close dialog |

---

## Tooltips and Help Text

### Field Tooltips
| Field/Element | Tooltip Text |
|---------------|--------------|
| {Element} | {Helpful explanatory text} |

### Icon Meanings
| Icon | Meaning |
|------|---------|
| {Icon description} | {What it indicates} |

---

## Status Indicators

### Status Badges
| Status Value | Badge Color | Badge Text | Icon |
|--------------|-------------|------------|------|
| {Status} | {Color} | {Display text} | {Icon if any} |

**Examples**:
- Draft: Gray background, "Draft" text, no icon
- Approved: Green background, "Approved" text, checkmark icon
- Rejected: Red background, "Rejected" text, X icon

### Progress Indicators
| Progress Stage | Display Text | Visual Indicator |
|----------------|--------------|------------------|
| {Stage} | {Text} | {Progress bar/stepper description} |

---

## Notifications

### Toast Notifications
| Trigger | Type | Message | Duration | Position |
|---------|------|---------|----------|----------|
| {Action} | Success/Error/Warning/Info | {Message text} | {Seconds} | {Screen position} |

### In-App Notifications
| Trigger | Title | Message | Actions |
|---------|-------|---------|---------|
| {Event} | {Notification title} | {Notification body} | {Action buttons} |

---

## Accessibility Labels

### ARIA Labels
| Element | ARIA Label | Purpose |
|---------|------------|---------|
| {Element} | {aria-label text} | {For screen readers} |

### Alt Text for Images/Icons
| Image/Icon | Alt Text |
|------------|----------|
| {Image} | {Descriptive alt text} |

---

## Microcopy

### Button Microcopy
| Context | Button Text | Rationale |
|---------|-------------|-----------|
| {When/where} | {Exact button text} | {Why this wording} |

### Link Text
| Link | Text | Destination |
|------|------|-------------|
| {Purpose} | {Link text} | {Where it goes} |

### Placeholder Text Patterns
| Input Type | Pattern | Example |
|------------|---------|---------|
| Search | "Search by..." | "Search by PR number or item" |
| Select | "Select..." | "Select department" |
| Date | Format | "DD/MM/YYYY" |

---

## Error States

### Validation Errors
| Field | Condition | Error Message |
|-------|-----------|---------------|
| {Field name} | {What makes it invalid} | {User-friendly error text} |

**Examples**:
- Required field empty: "This field is required"
- Invalid format: "Please enter a valid email address"
- Out of range: "Amount must be between $0 and $10,000"

### System Errors
| Error Type | User Message | Recovery Action |
|------------|--------------|-----------------|
| {Error} | {User-friendly message} | {What user can do} |

**Examples**:
- Network error: "Unable to connect. Please check your internet connection and try again."
- Server error: "Something went wrong. Please try again or contact support if the problem persists."

---

## Loading States

### Loading Messages
| Loading Context | Message | Visual Indicator |
|-----------------|---------|------------------|
| {What's loading} | {Loading message} | {Spinner/skeleton/progress} |

**Examples**:
- Page load: "Loading purchase requests..." + spinner
- Submit action: "Saving..." + disabled button
- Data fetch: Skeleton loading cards

---

## Empty States

### No Data States
| Context | Icon | Primary Message | Secondary Message | Call-to-Action |
|---------|------|-----------------|-------------------|----------------|
| {When occurs} | {Icon} | {Main message} | {Helpful guidance} | {Button text} |

**Example**:
```
Icon: 📋
Primary: "No purchase requests yet"
Secondary: "Create your first purchase request to get started"
CTA: [Create Purchase Request]
```

---

## Keyboard Shortcuts (if applicable)

| Shortcut | Action | Context |
|----------|--------|---------|
| {Key combo} | {What it does} | {Where it works} |

---

## Notes for Translators

### Translation Context
| Text | Context/Usage | Character Limit |
|------|---------------|-----------------|
| {Text to translate} | {Where/how it's used} | {Max characters} |

### Non-Translatable Content
| Content | Reason |
|---------|--------|
| {Content} | {Why not translated} |

**Examples**:
- PR-2401-000001: System-generated reference numbers
- USD, EUR: Currency codes
- 10, 20, 50: Numeric values

---

## Brand Voice Guidelines

### Tone
- {Describe tone: Professional, Friendly, Formal, etc.}
- {Key characteristics of messaging}

### Writing Style
- {Active vs passive voice preference}
- {Person (1st, 2nd, 3rd)}
- {Tense preferences}

### Terminology Standards
| Preferred Term | Avoid | Context |
|----------------|-------|---------|
| {Standard term} | {Alternative to avoid} | {When to use} |

**Example**:
- Purchase Request (not "Buy Request" or "PR Form")
- Approve (not "Accept" or "Authorize")
- Submit (not "Send" or "Post")

---

## Appendix

### Related Pages
- {List of related page content documents}

### Content Dependencies
- {List of shared content components or strings}

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| {Date} | {What changed} | {Why} | {Who} |

---

**Document End**

> 📝 **Note to Content Writers**:
> - Use actual copy, not placeholders
> - Verify all messages with UX team
> - Test message lengths in UI
> - Ensure consistency across pages
> - Consider localization needs
> - Update when UI changes
