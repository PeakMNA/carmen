# Page Content: Template Management Page

## Document Information
- **Module**: Procurement
- **Sub-Module**: Purchase Requests
- **Page**: Template Management
- **Route**: `/procurement/purchase-requests/templates`
- **Version**: 1.0.0
- **Last Updated**: 2025-10-31
- **Owner**: UX/Content Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|------------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-10-31 | Content Team | Initial version from TS specification |

---

## Overview

**Page Purpose**: Manage purchase request templates for recurring orders. Create, edit, duplicate, archive, and delete templates to streamline frequent purchase requests.

**User Personas**: Department Staff (Requestor), Department Managers, Purchasing Staff

**Related Documents**:
- [Business Requirements](../BR-purchase-requests.md)
- [Use Cases](../UC-purchase-requests.md)
- [Technical Specification](../TS-purchase-requests.md)

---

## Page Header

### Page Title
**Text**: Purchase Request Templates
**Style**: H1, bold, text-gray-900
**Location**: Top left of page

### Breadcrumb
**Text**: Home / Procurement / Purchase Requests / Templates
**Location**: Above page title
**Interactive**: Home, Procurement, and Purchase Requests are clickable links

### Action Buttons (Header)
| Button Label | Purpose | Style | Visibility Rules |
|--------------|---------|-------|------------------|
| Create New Template | Navigate to create template form | Primary (blue, solid) | All users with create permission |

---

## Page Description/Instructions

**Instructional Text**:
```
Manage purchase request templates for recurring orders. Templates save time by pre-filling common items and specifications. Prices are automatically updated to current rates when using templates.
```

**Help Text/Tooltip**:
```
💡 Tip: Create templates for frequently ordered items like weekly market lists or monthly supply orders. Templates can be shared with your department or kept private.
```

---

## Filter Section

### Filter Bar Labels

| Filter Field | Label | Placeholder Text | Tooltip |
|--------------|-------|------------------|---------|
| Type | Template Type | All Types | Filter by template type |
| Department | Department | All Departments | Filter by department |
| Tags | Tags | All Tags | Filter by assigned tags |
| Visibility | Visibility | All Templates | Filter by shared/private status |
| Created By | Created By | All Users | Filter by template creator |

### Filter Buttons
| Button Label | Purpose |
|--------------|---------|
| Apply Filters | Apply selected filters to list |
| Clear All | Reset all filters to default values |

### Quick Filters (Chips/Tabs)
| Chip Label | Filter Criteria | Badge Count |
|------------|-----------------|-------------|
| My Templates | Templates created by logged-in user | Yes |
| Shared | Templates shared with department or all | Yes |
| Recently Used | Last used within 30 days | No |
| Popular | Usage count > 10 | Yes |

---

## Search Section

### Search Bar
**Placeholder Text**: Search templates by name, description, or items...
**Help Text**: Search across template names, descriptions, and included items
**No Results Text**: No templates match your search. Try different keywords or clear filters.

---

## Sort Section

### Sort Options
| Sort Label | Sort Field | Direction Options |
|------------|------------|-------------------|
| Name | Template name | A-Z, Z-A |
| Recently Used | Last used date | Newest first, Oldest first |
| Usage Count | Number of times used | Highest first, Lowest first |
| Date Created | Created date | Newest first, Oldest first |
| Total Amount | Estimated total | Highest first, Lowest first |

**Default Sort**: Recently Used (Newest first)

---

## Data Table/List

### Table Headers
| Column Header | Sortable | Tooltip |
|---------------|----------|---------|
| Template Name | Yes | Template name and description |
| Type | Yes | Template type (Market List, Standard Order, Asset) |
| Items | No | Number of items in template |
| Estimated Total | Yes | Total estimated amount at current prices |
| Last Used | Yes | Date template was last used |
| Usage Count | Yes | Number of times template has been used |
| Visibility | No | Private, Department, or All |
| Created By | Yes | User who created template |
| Actions | No | Available actions for this template |

### Column Content Formats
| Column | Display Format | Example |
|--------|----------------|---------|
| Template Name | Template name<br>(Description) | Weekly Market List<br>(Fresh produce and vegetables) |
| Type | Badge with icon | Market List, Standard Order, Asset |
| Items | Number + "items" | 12 items |
| Estimated Total | $X,XXX.XX or CURRENCY X,XXX.XX | $1,234.56 |
| Last Used | DD MMM YYYY or "Never" | 15 Jan 2024 or Never |
| Usage Count | Number + "uses" | 23 uses |
| Visibility | Badge | Private, My Department, All Departments |
| Created By | Name or "Me" | Maria Santos or Me |
| Actions | Icon buttons | View, Edit, Duplicate, Archive, Delete |

### Empty State (No Templates)
**Icon**: 📋 Clipboard icon
**Message**:
```
No templates yet
```
**Secondary Message**:
```
Create your first template to save time on recurring purchase requests. Templates automatically update prices to current rates.
```
**Action Button**: Create New Template

### Loading State
**Message**: Loading templates...
**Animation**: Skeleton loading with shimmer effect showing 10 placeholder rows

---

## Row Actions

### Action Buttons/Icons
| Icon/Button | Label | Tooltip | Visibility Rules |
|-------------|-------|---------|------------------|
| Eye icon | View | View template details | Always visible |
| Pencil icon | Edit | Edit template | User is creator OR has admin permission |
| Copy icon | Duplicate | Create a copy of this template | Always visible |
| Archive icon | Archive | Archive template (hide from list) | User is creator OR has admin permission |
| Trash icon | Delete | Permanently delete template | User is creator OR has admin permission |
| Chart icon | Usage History | View usage statistics | Always visible |

### Context Menu (Right-click or ... menu)
| Menu Item | Action | Visibility Rules |
|-----------|--------|------------------|
| Use Template | Create new PR from template | Always |
| View Details | Open detail panel | Always |
| Edit Template | Open edit form | User is creator or admin |
| Duplicate Template | Create copy | Always |
| View Usage History | Show usage stats | Always |
| Archive Template | Hide from active list | User is creator or admin |
| Delete Template | Permanently delete | User is creator or admin |

---

## Template Detail Panel

### Panel Location
**Display**: Right sidebar or modal (responsive)
**Trigger**: Click template name or "View" action
**Width**: 400px sidebar or full-width modal on mobile

### Panel Header
**Title**: {Template Name}
**Type Badge**: {Template Type}
**Close Button**: X icon in top right

### Panel Sections

#### 1. Template Information

| Field Label | Display Format | Example |
|-------------|----------------|---------|
| Template Name | Full text | Weekly Market List |
| Description | Full text | Fresh produce and vegetables for restaurant operations |
| Type | Badge | Market List |
| Visibility | Badge | My Department |
| Created By | Name and date | Maria Santos • Created 15 Dec 2023 |
| Last Updated | Date | Updated 15 Jan 2024 |
| Last Used | Date or "Never" | 15 Jan 2024 or Never used |

#### 2. Usage Statistics

**Display Format**:
```
📊 Usage Statistics
Total Uses: 23 times
Last 30 Days: 8 uses
Average per Month: 6 uses
Most Recent: 15 Jan 2024
```

**Chart** (optional): Bar chart showing monthly usage over last 6 months

#### 3. Items in Template

**Section Header**: Items ({X} items)

**Item List Format**:
```
# | Item Name | Specification | Quantity | Current Price | Line Total
1 | Fresh Tomatoes | Red, Firm, Grade A | 10 kg | $5.50/kg | $55.00
2 | Fresh Lettuce | Iceberg, Grade A | 5 kg | $3.20/kg | $16.00
...
```

**Total Display**:
```
Estimated Total: $1,234.56
(Based on current prices as of {date})
```

**Price Update Notice**:
```
ℹ Template prices update automatically when creating new purchase requests
```

#### 4. Tags

**Display**: Tag chips (if any)
**Example**: `market-list` `weekly` `produce` `recurring`

### Panel Actions

| Button Label | Purpose | Style |
|--------------|---------|-------|
| Use Template | Create new PR from this template | Primary (blue, solid) |
| Edit Template | Open edit form | Secondary (blue outline) |
| Duplicate | Create a copy | Secondary (gray outline) |
| Delete | Delete template | Text/Link (red) |

---

## Dialogs/Modals

### Dialog 1: Create/Edit Template

**Note**: Template create/edit form is very similar to PC-create-form.md with additional fields:

**Additional Fields**:
| Field Label | Type | Placeholder | Required |
|-------------|------|-------------|----------|
| Template Name * | Text | Enter template name... | Yes |
| Description | Textarea | Enter template description... | No |
| Visibility * | Dropdown | Select visibility... | Yes |
| Tags | Multi-select tags | Add tags... | No |

**Visibility Options**:
- Private (Only me)
- My Department
- All Departments

**Note**: Visibility setting controls who can view and use the template. Private templates are only visible to the creator.

---

### Dialog 2: Delete Template Confirmation

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

### Dialog 3: Archive Template Confirmation

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

### Dialog 4: Usage History

#### Dialog Header
**Title**: Template Usage History
**Close Button**: X icon in top right

#### Dialog Body

**Usage Statistics Summary**:
```
Total Uses: 23 times
First Used: 15 Dec 2023
Last Used: 15 Jan 2024
Average per Month: 6 uses
```

**Usage Timeline** (reverse chronological):
```
15 Jan 2024, 14:30 • Maria Santos created PR-2401-0123
12 Jan 2024, 09:15 • David Miller created PR-2401-0115
08 Jan 2024, 11:20 • Maria Santos created PR-2401-0098
...
```

**Monthly Chart**: Bar chart showing usage frequency by month

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Export History | Secondary (gray outline) | Download usage history as CSV |
| Close | Secondary (gray outline) | Close dialog |

---

## Pagination

### Pagination Controls
**Items Per Page Label**: Show
**Items Per Page Options**: 10, 20, 50, 100
**Default**: 20 templates per page
**Page Info Text**: Showing {start} to {end} of {total} templates
**Navigation Buttons**: Previous | Next
**Page Number Display**: Page {current} of {total}

**Example**: "Showing 1 to 20 of 87 templates" | "Page 1 of 5"

---

## Status Messages

### Success Messages
| Trigger | Message | Duration |
|---------|---------|----------|
| Template created | ✓ Template created successfully | 3 seconds |
| Template updated | ✓ Template updated successfully | 3 seconds |
| Template deleted | ✓ Template deleted successfully | 3 seconds |
| Template duplicated | ✓ Template duplicated successfully | 3 seconds |
| Template archived | ✓ Template archived successfully | 3 seconds |
| Template restored | ✓ Template restored from archive | 3 seconds |

### Error Messages
| Error Type | Message | Action |
|------------|---------|--------|
| Load failed | ✗ Unable to load templates. Please refresh the page. | Retry button |
| Create failed | ✗ Unable to create template. Please try again. | Retry button |
| Update failed | ✗ Unable to update template. Please try again. | Retry button |
| Delete failed | ✗ Unable to delete template. Please try again. | Dismiss |
| Permission denied | ✗ You don't have permission to perform this action | Dismiss |
| Network error | ✗ Connection error. Please check your internet connection and try again. | Retry button |

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| Delete template with usage | ⚠ This template has been used {X} times. Delete anyway? | [Delete] [Cancel] |
| Duplicate prices | ⚠ Prices in duplicated template will be updated to current rates | [Continue] [Cancel] |

### Info Messages
| Trigger | Message |
|---------|---------|
| No templates | ℹ No templates found. Create your first template to get started. |
| Archived view | ℹ Viewing archived templates. These are hidden from active list. |
| Price update | ℹ Template prices update automatically when creating new purchase requests |
| Visibility note | ℹ Template visibility is set when creating or editing the template. Private templates are only visible to you. |

---

## Accessibility Labels

### ARIA Labels
| Element | ARIA Label | Purpose |
|---------|------------|---------|
| Create button | Create new purchase request template | For screen readers |
| View button | View template details for {template name} | For screen readers |
| Edit button | Edit template {template name} | For screen readers |
| Delete button | Delete template {template name} | For screen readers |
| Duplicate button | Duplicate template {template name} | For screen readers |
| Archive button | Archive template {template name} | For screen readers |
| Search input | Search templates | For screen readers |
| Filter dropdown | Filter templates by {field name} | For screen readers |
| Sort dropdown | Sort templates by {field name} | For screen readers |

### Alt Text for Images/Icons
| Image/Icon | Alt Text |
|------------|----------|
| Empty state icon | No templates illustration |
| Loading spinner | Loading templates |
| Template type icon | {Type} template icon |
| Visibility icon | {Visibility level} indicator |

---

## Microcopy

### Button Microcopy
| Context | Button Text | Rationale |
|---------|-------------|-----------|
| Primary action | Create New Template | Clear action and object |
| Use template | Use Template | Short, clear action |
| Duplicate action | Duplicate | Universally understood |
| Archive action | Archive | Industry standard term |
| Delete action | Delete | Clear, destructive action |

### Link Text
| Link | Text | Destination |
|------|------|-------------|
| Template name | {Template name} | Template detail panel |
| Usage count | {X} uses | Usage history dialog |
| Breadcrumb - Purchase Requests | Purchase Requests | Purchase requests list page |

### Placeholder Text Patterns
| Input Type | Pattern | Example |
|------------|---------|---------|
| Search | "Search by..." | "Search templates by name, description, or items..." |
| Dropdown | "All {field}s" | "All Types", "All Departments" |
| Text input | "Enter {field}..." | "Enter template name..." |

---

## Error States

### System Errors
| Error Type | User Message | Recovery Action |
|------------|--------------|-----------------|
| Network error | Unable to connect. Please check your internet connection and try again. | [Retry] button |
| Server error | Something went wrong on our end. Please try again in a few moments. | [Retry] button + Support link |
| Permission error | You don't have permission to manage templates. Contact your administrator. | Redirect to home |
| Not found error | Template not found. It may have been deleted. | Redirect to list |

---

## Loading States

### Loading Messages
| Loading Context | Message | Visual Indicator |
|-----------------|---------|------------------|
| Initial page load | Loading templates... | Skeleton table/grid with shimmer effect |
| Creating template | Creating template... | Disabled form with spinner |
| Deleting template | Deleting template... | Disabled button with spinner |
| Loading details | Loading template details... | Panel skeleton |

---

## Empty States

### No Data States
| Context | Icon | Primary Message | Secondary Message | Call-to-Action |
|---------|------|-----------------|-------------------|----------------|
| No templates | 📋 | No templates yet | Create your first template to save time on recurring purchase requests. Templates automatically update prices to current rates. | Create New Template |
| No search results | 🔍 | No templates found | No templates match "{search term}". Try different keywords or check your spelling. | Clear search |
| No filter results | 📭 | No templates match your filters | Try adjusting your filters or clearing them to see all templates you have access to. | Clear All Filters |
| No archived templates | 📦 | No archived templates | Archived templates will appear here. You can restore them later. | Back to Active |

---

## Notes for Translators

### Translation Context
| Text | Context/Usage | Character Limit |
|------|---------------|-----------------|
| "Purchase Request Templates" | Page title | 40 characters |
| "Create New Template" | Primary action button | 30 characters |
| "Use Template" | Action button in cards/rows | 20 characters |
| Template type names | Type badges | 25 characters each |
| Visibility levels | Sharing status | 20 characters |

### Non-Translatable Content
| Content | Reason |
|---------|--------|
| Numbers (usage counts, prices) | Numeric values |
| Dates | System-generated dates |
| User names | Person names |
| $, USD, EUR | Currency symbols and codes |

---

## Brand Voice Guidelines

### Tone
- Efficient and organized
- Helpful for recurring tasks
- Clear about template benefits
- Supportive for sharing

### Writing Style
- Active voice: "Create template" not "Template can be created"
- Second person: "your templates" not "user's templates"
- Present tense for actions
- Clear hospitality terminology

### Terminology Standards
| Preferred Term | Avoid | Context |
|----------------|-------|---------|
| Template | Form, Pattern, Blueprint | Always use "Template" |
| Use Template | Apply, Use, Load | Creating PR from template |
| Duplicate | Copy, Clone | Making a copy of template |
| Archive | Hide, Deactivate | Hiding from active list |
| Visibility | Sharing, Access | Who can see/use template |

---

## Appendix

### Related Pages
- [PC-list-page.md](./PC-list-page.md) - Purchase Request List Page
- [PC-create-form.md](./PC-create-form.md) - Create Purchase Request Form
- [PC-dialogs.md](./PC-dialogs.md) - Shared Dialogs

### Content Dependencies
- Template type badges consistent with PR type badges
- Sharing terminology consistent with system-wide sharing patterns
- Button labels consistent with other list/management pages

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-10-31 | Initial version | Created from TS specification | Content Team |

---

**Document End**

> 📝 **Implementation Notes**:
> - All copy reviewed and approved by UX team
> - Template sharing terminology clear and consistent
> - Usage statistics display tested for various data ranges
> - Empty states encourage template creation
> - Archive functionality clearly differentiated from delete
