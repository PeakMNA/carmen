# Page Content: Purchase Request List Page

## Document Information
- **Module**: Procurement
- **Sub-Module**: Purchase Requests
- **Page**: List Page
- **Route**: `/procurement/purchase-requests`
- **Version**: 1.0.0
- **Last Updated**: 2025-10-31
- **Owner**: UX/Content Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-10-31 | Content Team | Initial version |

---

## Overview

**Page Purpose**: Display all purchase requests with filtering, sorting, and search capabilities for users to manage and track their purchase requests.

**User Personas**: Department Staff, Department Managers, Purchasing Staff, Finance Managers

**Related Documents**:
- [Business Requirements](../BR-purchase-requests.md)
- [Use Cases](../UC-purchase-requests.md)
- [Technical Specification](../TS-purchase-requests.md)

---

## Page Header

### Page Title
**Text**: Purchase Requests
**Style**: H1, bold, text-gray-900
**Location**: Top left of page

### Breadcrumb
**Text**: Home / Procurement / Purchase Requests
**Location**: Below header
**Interactive**: Home and Procurement are clickable links

### Action Buttons (Header)
| Button Label | Purpose | Style | Visibility Rules |
|--------------|---------|-------|------------------|
| Create Purchase Request | Navigate to create PR form | Primary (blue) | All users with create permission |
| Export | Export filtered list to Excel | Secondary (white with border) | Always visible when list has data |

---

## Page Description/Instructions

**Instructional Text**:
```
View and manage all purchase requests. Use filters to find specific requests or create a new purchase request to procure supplies for your department.
```

**Help Text/Tooltip**:
```
Purchase requests must be approved before they can be converted to purchase orders. Click on any request to view full details.
```

---

## Filter Section

### Filter Bar Labels

| Filter Field | Label | Placeholder Text | Tooltip |
|--------------|-------|------------------|---------|
| Status | Status | All Statuses | Filter by request status |
| Date Range | Date Range | Select date range | Filter by creation or submission date |
| Department | Department | All Departments | Filter by requesting department |
| Location | Delivery Location | All Locations | Filter by delivery location |
| Requestor | Requestor | All Requestors | Filter by person who created request |
| Amount Range | Amount | Min - Max | Filter by total amount range |

### Filter Buttons
| Button Label | Purpose |
|--------------|---------|
| Apply Filters | Apply selected filters to list |
| Clear All | Reset all filters to default |

### Quick Filters (Chips/Tabs)
| Chip Label | Filter Criteria | Badge Count |
|------------|-----------------|-------------|
| My Requests | Requests created by logged-in user | Yes |
| Pending Approval | Status = Pending Approval | Yes |
| Draft | Status = Draft | Yes |
| Approved | Status = Approved | Yes |
| Rejected | Status = Rejected | No |

---

## Search Section

### Search Bar
**Placeholder Text**: Search by PR number, item name, or description...
**Help Text**: Search across PR numbers, item names, and descriptions
**No Results Text**: No purchase requests match your search. Try different keywords or clear filters.

---

## Data Table/List

### Table Headers
| Column Header | Sortable | Tooltip |
|---------------|----------|---------|
| PR Number | Yes | Unique purchase request identifier |
| Requestor | Yes | Person who created the request |
| Department | Yes | Requesting department |
| Date | Yes | Date request was created |
| Delivery Location | No | Where items will be delivered |
| Status | Yes | Current request status |
| Total Amount | Yes | Total value of request |
| Actions | No | Available actions for this request |

### Column Content Formats
| Column | Display Format | Example |
|--------|----------------|---------|
| PR Number | PR-YYMM-NNNN (clickable link) | PR-2401-0123 |
| Requestor | First Name Last Name | John Smith |
| Department | Full department name | Food & Beverage |
| Date | DD MMM YYYY | 15 Jan 2024 |
| Delivery Location | Location name | Main Kitchen |
| Status | Badge with color coding | Draft (gray), Pending Approval (blue), Approved (green), Rejected (red) |
| Total Amount | $X,XXX.XX or CURRENCY X,XXX.XX | $1,234.56 |
| Actions | Icon buttons | View, Edit, Delete icons |

### Empty State
**Icon**: 📋 Clipboard icon
**Message**:
```
No purchase requests yet
```
**Secondary Message**:
```
Create your first purchase request to start procuring supplies for your department. Purchase requests streamline the approval and ordering process.
```
**Action Button**: Create Purchase Request

### Loading State
**Message**: Loading purchase requests...
**Animation**: Skeleton loading with shimmer effect showing 10 placeholder rows

---

## Row Actions

### Action Buttons/Icons
| Icon/Button | Label | Tooltip | Visibility Rules |
|-------------|-------|---------|------------------|
| Eye icon | View | View request details | Always visible |
| Pencil icon | Edit | Edit draft request | Status = Draft AND user is requestor |
| Trash icon | Delete | Delete draft request | Status = Draft AND user is requestor |
| Copy icon | Duplicate | Create copy of this request | Always visible |
| Download icon | Export PDF | Download request as PDF | Status ≠ Draft |

### Context Menu (Right-click or ... menu)
| Menu Item | Action | Visibility Rules |
|-----------|--------|------------------|
| View Details | Open detail page | Always |
| Edit | Open edit form | Status = Draft AND user is requestor |
| Duplicate | Create copy | Always |
| Save as Template | Save as reusable template | User has template permission |
| Export PDF | Download PDF | Status ≠ Draft |
| Delete | Delete request | Status = Draft AND user is requestor |

---

## Pagination

### Pagination Controls
**Items Per Page Label**: Show
**Items Per Page Options**: 10, 20, 50, 100
**Page Info Text**: Showing {start} to {end} of {total} requests
**Navigation Buttons**: Previous | Next
**Page Number Display**: Page {current} of {total}

**Example**: "Showing 1 to 20 of 156 requests" | "Page 1 of 8"

---

## Status Messages

### Success Messages
| Trigger | Message | Duration |
|---------|---------|----------|
| PR created | ✓ Purchase request created successfully | 3 seconds |
| PR deleted | ✓ Purchase request deleted successfully | 3 seconds |
| Export completed | ✓ Export completed. File downloaded. | 3 seconds |
| Filter applied | ✓ Filters applied | 2 seconds |

### Error Messages
| Error Type | Message | Action |
|------------|---------|--------|
| Load failed | ✗ Unable to load purchase requests. Please refresh the page or try again later. | Retry button |
| Export failed | ✗ Export failed. Please try again or contact support if the problem persists. | Retry button |
| Delete failed | ✗ Unable to delete purchase request. Please try again. | Dismiss |
| Permission denied | ✗ You don't have permission to perform this action | Dismiss |

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| Large export | ⚠ Exporting {count} records may take a few moments | [Continue] [Cancel] |
| Unsaved filters | ⚠ You have unsaved filter changes | [Apply] [Clear] |

### Info Messages
| Trigger | Message |
|---------|---------|
| No results | ℹ No purchase requests match your current filters. Try adjusting your search criteria. |
| First time user | ℹ Welcome! This is where you'll see all your purchase requests. Click "Create Purchase Request" to get started. |

---

## Dialogs/Modals

### Dialog 1: Delete Confirmation

#### Dialog Header
**Title**: Delete Purchase Request?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Are you sure you want to delete this purchase request? This action cannot be undone.
```

**Details Display**:
- PR Number: {PR-YYMM-NNNN}
- Date: {DD MMM YYYY}
- Total Amount: {$X,XXX.XX}

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Delete | Destructive (red) | Delete the purchase request |
| Cancel | Secondary (gray) | Close dialog without action |

#### Dialog Success State
**Message**: Purchase request deleted successfully
**Auto-close**: Yes, after 2 seconds

---

### Dialog 2: Export Options

#### Dialog Header
**Title**: Export Purchase Requests
**Close Button**: X icon in top right

#### Dialog Body

**Labels and Fields**:
| Field Label | Placeholder | Help Text | Required |
|-------------|-------------|-----------|----------|
| File Format | Select format | Choose export file format | Yes |
| Include Filters | Checkbox | Export only filtered results | No |
| Date Range | Select dates | Optional date range for export | No |

**Format Options**:
- Excel (.xlsx) - Recommended for data analysis
- CSV (.csv) - Compatible with all spreadsheet applications
- PDF (.pdf) - Print-ready format

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Export | Primary (blue) | Start export and download |
| Cancel | Secondary (gray) | Close dialog |

---

## Status Indicators

### Status Badges
| Status Value | Badge Color | Badge Text | Icon |
|--------------|-------------|------------|------|
| Draft | Gray (bg-gray-100, text-gray-800) | Draft | None |
| Pending Approval | Blue (bg-blue-100, text-blue-800) | Pending Approval | Clock icon |
| Approved | Green (bg-green-100, text-green-800) | Approved | Checkmark icon |
| Rejected | Red (bg-red-100, text-red-800) | Rejected | X icon |
| Cancelled | Orange (bg-orange-100, text-orange-800) | Cancelled | Ban icon |
| Converted | Purple (bg-purple-100, text-purple-800) | Converted to PO | Arrow right icon |

---

## Notifications

### Toast Notifications
| Trigger | Type | Message | Duration | Position |
|---------|------|---------|----------|----------|
| Create success | Success | Purchase request created successfully | 3s | Top right |
| Delete success | Success | Purchase request deleted successfully | 3s | Top right |
| Update success | Success | Purchase request updated successfully | 3s | Top right |
| Action error | Error | Unable to complete action. Please try again. | 5s | Top right |
| Export complete | Success | Export completed. File downloaded. | 3s | Top right |

---

## Accessibility Labels

### ARIA Labels
| Element | ARIA Label | Purpose |
|---------|------------|---------|
| Create button | Create new purchase request | For screen readers |
| Export button | Export purchase requests to file | For screen readers |
| Search input | Search purchase requests | For screen readers |
| Filter dropdown | Filter by {field name} | For screen readers |
| Action button | Actions for purchase request {PR number} | For screen readers |
| Sort button | Sort by {column name} | For screen readers |

### Alt Text for Images/Icons
| Image/Icon | Alt Text |
|------------|----------|
| Empty state icon | No purchase requests illustration |
| Loading spinner | Loading data |
| Status icons | {Status name} status indicator |

---

## Microcopy

### Button Microcopy
| Context | Button Text | Rationale |
|---------|-------------|-----------|
| Primary action | Create Purchase Request | Clear, action-oriented |
| Export action | Export | Short and clear |
| Filter apply | Apply Filters | Explicit about applying multiple filters |
| Filter clear | Clear All | Clear that all filters will be reset |

### Link Text
| Link | Text | Destination |
|------|------|-------------|
| PR number | PR-2401-0123 | PR detail page |
| Breadcrumb | Procurement | Procurement module home |

### Placeholder Text Patterns
| Input Type | Pattern | Example |
|------------|---------|---------|
| Search | "Search by..." | "Search by PR number, item name, or description..." |
| Select | "All {field}s" or "Select {field}" | "All Departments", "Select date range" |
| Number Range | "Min - Max" | "0 - 10000" |

---

## Error States

### Validation Errors
*Not applicable for list page - see form pages for validation errors*

### System Errors
| Error Type | User Message | Recovery Action |
|------------|--------------|-----------------|
| Network error | Unable to connect. Please check your internet connection and try again. | [Retry] button |
| Server error | Something went wrong on our end. Please try again in a few moments. | [Retry] button + Support contact link |
| Permission error | You don't have permission to view purchase requests. Contact your administrator. | Redirect to home |
| Not found error | Purchase request not found. It may have been deleted. | Redirect to list |

---

## Loading States

### Loading Messages
| Loading Context | Message | Visual Indicator |
|-----------------|---------|------------------|
| Initial page load | Loading purchase requests... | Skeleton table with 10 rows |
| Filter apply | Applying filters... | Overlay spinner on table |
| Export | Preparing export... | Progress indicator in export dialog |
| Delete | Deleting... | Disabled button with spinner |

---

## Empty States

### No Data States
| Context | Icon | Primary Message | Secondary Message | Call-to-Action |
|---------|------|-----------------|-------------------|----------------|
| No PRs exist | 📋 | No purchase requests yet | Create your first purchase request to start procuring supplies for your department. Purchase requests streamline the approval and ordering process. | Create Purchase Request |
| No search results | 🔍 | No purchase requests found | No requests match "{search term}". Try different keywords or check your spelling. | Clear search |
| No filter results | 📭 | No requests match your filters | Try adjusting your filters or clearing them to see all purchase requests. | Clear All Filters |

---

## Notes for Translators

### Translation Context
| Text | Context/Usage | Character Limit |
|------|---------------|-----------------|
| "Purchase Requests" | Page title | 30 characters |
| "Create Purchase Request" | Primary action button | 35 characters |
| Status badges | Short status indicators | 20 characters each |
| Table headers | Column names | 25 characters |

### Non-Translatable Content
| Content | Reason |
|---------|--------|
| PR-2401-0123 | System-generated reference format |
| USD, EUR, etc. | ISO currency codes |
| Date formats (DD MMM YYYY) | Standardized format |

---

## Brand Voice Guidelines

### Tone
- Professional yet approachable
- Clear and concise
- Action-oriented
- Helpful and supportive

### Writing Style
- Active voice preferred ("Create purchase request" not "Purchase request can be created")
- Second person ("your purchase requests" not "the user's purchase requests")
- Present tense for actions
- Avoid jargon - use clear hospitality terminology

### Terminology Standards
| Preferred Term | Avoid | Context |
|----------------|-------|---------|
| Purchase Request | Buy Request, PR Form | Always use full term in headers |
| Requestor | User, Creator | Person who creates request |
| Department Manager | Supervisor, Boss | Approval role |
| Delivery Location | Destination, Address | Where items go |

---

## Appendix

### Related Pages
- PC-create-form.md (Create Purchase Request Form)
- PC-detail-page.md (Purchase Request Detail Page)
- PC-edit-form.md (Edit Purchase Request Form)

### Content Dependencies
- Status badge colors and text used across all PR pages
- Button labels consistent with other list pages
- Error messages follow app-wide patterns

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-10-31 | Initial version | First documentation | Content Team |

---

**Document End**

> 📝 **Implementation Notes**:
> - All copy reviewed and approved by UX team
> - Message lengths tested in UI at various screen sizes
> - Status badge colors meet WCAG AA contrast requirements
> - Terminology consistent with other procurement pages
