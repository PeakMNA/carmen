# Page Content: Purchase Request List Page

## Document Information
- **Module**: Procurement
- **Sub-Module**: Purchase Requests
- **Page**: List Page
- **Route**: `/procurement/purchase-requests`
- **Version**: 1.0.0
- **Last Updated**: 2025-10-31
- **Owner**: UX/Content Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-10-31 | Content Team | Initial version from TS specification |

---

## Overview

**Page Purpose**: Display all purchase requests with filtering, sorting, and search capabilities for users to manage and track their purchase requests.

**User Personas**: Department Staff (Requestor), Department Managers, Purchasing Staff, Finance Managers

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
**Location**: Above page title
**Interactive**: Home and Procurement are clickable links

### Action Buttons (Header)
| Button Label | Purpose | Style | Visibility Rules |
|--------------|---------|-------|------------------|
| Create Purchase Request | Navigate to create PR form | Primary (blue, solid) | All users with create permission |
| Export | Export filtered list to Excel/CSV | Secondary (white with border) | Always visible when list has data |

---

## Page Description/Instructions

**Instructional Text**:
```
View and manage all purchase requests. Use filters to find specific requests, or create a new purchase request to procure supplies for your department.
```

**Help Text/Tooltip**: None

---

## Filter Section

### Filter Bar Labels

| Filter Field | Label | Placeholder Text | Tooltip |
|--------------|-------|------------------|---------|
| Status | Status | All Statuses | Filter by request status |
| Date Range | Date Range | Select date range | Filter by creation date |
| Department | Department | All Departments | Filter by requesting department |
| Location | Delivery Location | All Locations | Filter by delivery location |
| Requestor | Requestor | All Requestors | Filter by person who created request |
| Amount Range | Amount Range | Min - Max | Filter by total amount |

### Filter Buttons
| Button Label | Purpose |
|--------------|---------|
| Apply Filters | Apply selected filters to list |
| Clear All | Reset all filters to default values |

### Quick Filters

#### Primary Filter Toggle (Mutually Exclusive Buttons)
| Button Label | Filter Criteria | Default | Badge Count |
|--------------|-----------------|---------|-------------|
| My Pending | Status in: Draft, Submitted, InProgress, Rejected | ✓ | Yes |
| All Documents | All PRs based on user permissions | | No |

#### Secondary Filter Dropdowns (Context-Sensitive)
**When "My Pending" is selected:**
| Dropdown Label | Options | Multi-Select |
|----------------|---------|--------------|
| Stage Filter | All Stages / Request Creation / Approval Process / Purchasing / Receiving / Completed | No |
| Requester Filter | All Requesters / [List of users] | Yes (searchable) |

**When "All Documents" is selected:**
| Dropdown Label | Options | Multi-Select |
|----------------|---------|--------------|
| Status Filter | All Statuses / Draft / Submitted / InProgress / Approved / Rejected / Cancelled / Completed / Closed | Yes (searchable) |
| Requester Filter | All Requesters / [List of users] | Yes (searchable) |

---

## Search Section

### Search Bar
**Placeholder Text**: Search by PR number, item name, description, or vendor...
**Help Text**: Search across PR numbers, item names, descriptions, and vendor names
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
| Requestor | First Name Last Name | Maria Santos |
| Department | Full department name | Food & Beverage |
| Date | DD MMM YYYY | 15 Jan 2024 |
| Delivery Location | Location name | Main Kitchen |
| Status | Badge with color coding | Draft (gray), Pending Approval (blue), Approved (green), Rejected (red), Cancelled (orange) |
| Total Amount | $X,XXX.XX or CURRENCY X,XXX.XX | $1,234.56 |
| Actions | Icon buttons (eye, pencil, trash) | View, Edit, Delete icons |

### Empty State
**Icon**: 📋 Clipboard with document icon
**Message**:
```
No purchase requests yet
```
**Secondary Message**:
```
Create your first purchase request to start procuring supplies for your department. Purchase requests must be approved before items can be ordered.
```
**Action Button**: Create Purchase Request

### Loading State
**Message**: Loading purchase requests...
**Animation**: Skeleton loading with shimmer effect showing 20 placeholder rows

---

## Row Actions

### Action Buttons/Icons
| Icon/Button | Label | Tooltip | Visibility Rules |
|-------------|-------|---------|------------------|
| Eye icon | View | View request details | Always visible |
| Pencil icon | Edit | Edit draft request | Status = Draft OR Rejected AND user is requestor |
| Trash icon | Delete | Delete draft request | Status = Draft AND user is requestor |

**Note**: Click row to view/edit - no modify button in row

### Context Menu (Right-click or ... menu)
Not implemented - click row for details

---

## Pagination

### Pagination Controls
**Items Per Page Label**: Show
**Items Per Page Options**: 10, 20, 50, 100
**Default**: 20 items per page
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
| PR updated | ✓ Purchase request updated successfully | 3 seconds |
| PR deleted | ✓ Purchase request deleted successfully | 3 seconds |
| PR submitted | ✓ Purchase request submitted for approval | 3 seconds |
| Export completed | ✓ Export completed successfully. File downloaded. | 3 seconds |

### Error Messages
| Error Type | Message | Action |
|------------|---------|--------|
| Load failed | ✗ Unable to load purchase requests. Please refresh the page. | Retry button |
| Export failed | ✗ Export failed. Please try again or contact support. | Retry button |
| Delete failed | ✗ Unable to delete purchase request. Please try again. | Dismiss |
| Permission denied | ✗ You don't have permission to perform this action. | Dismiss |
| Network error | ✗ Connection error. Please check your internet connection and try again. | Retry button |

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| Large export | ⚠ Exporting {count} records may take a few moments. Continue? | [Export] [Cancel] |

### Info Messages
| Trigger | Message |
|---------|---------|
| No filter results | ℹ No purchase requests match your current filters. Try adjusting your search criteria. |
| Auto-refresh | ℹ List automatically refreshes every 30 seconds |

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

---

### Dialog 2: Export Options

#### Dialog Header
**Title**: Export Purchase Requests
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Select export format and options
```

**Labels and Fields**:
| Field Label | Options | Default | Required |
|-------------|---------|---------|----------|
| File Format | Excel (.xlsx), CSV (.csv) | Excel | Yes |
| Include | All Results, Current Page Only | All Results | Yes |
| Date Range | Custom date picker | Current filters | No |

**Format Descriptions**:
- **Excel (.xlsx)**: Best for data analysis with formatting
- **CSV (.csv)**: Compatible with all spreadsheet applications

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Export | Primary (blue, solid) | Start export and download |
| Cancel | Secondary (gray outline) | Close dialog |

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
| In Process | Yellow (bg-yellow-100, text-yellow-800) | In Process | Arrow right icon |
| Partially Received | Indigo (bg-indigo-100, text-indigo-800) | Partially Received | Package icon |
| Completed | Teal (bg-teal-100, text-teal-800) | Completed | Check circle icon |

---

## Notifications

### Toast Notifications
| Trigger | Type | Message | Duration | Position |
|---------|------|---------|----------|----------|
| Create success | Success | Purchase request created successfully | 3s | Top right |
| Update success | Success | Purchase request updated successfully | 3s | Top right |
| Delete success | Success | Purchase request deleted successfully | 3s | Top right |
| Submit success | Success | Purchase request submitted for approval | 3s | Top right |
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
| Filter dropdown | Filter purchase requests by {field} | For screen readers |
| Sort button | Sort by {column name} | For screen readers |
| Action button | Actions for purchase request {PR number} | For screen readers |
| Status badge | Status: {status name} | For screen readers |

### Alt Text for Images/Icons
| Image/Icon | Alt Text |
|------------|----------|
| Empty state icon | No purchase requests illustration |
| Loading spinner | Loading data |
| Status checkmark | Approved status |
| Status X | Rejected status |

---

## Microcopy

### Button Microcopy
| Context | Button Text | Rationale |
|---------|-------------|-----------|
| Primary action | Create Purchase Request | Clear, specific action |
| Export action | Export | Short and universally understood |
| Filter apply | Apply Filters | Explicit about multiple filters |
| Filter clear | Clear All | Indicates all filters reset |

### Link Text
| Link | Text | Destination |
|------|------|-------------|
| PR number | PR-2401-0123 | PR detail page |
| Breadcrumb - Procurement | Procurement | Procurement module home |
| Breadcrumb - Home | Home | Application home |

### Placeholder Text Patterns
| Input Type | Pattern | Example |
|------------|---------|---------|
| Search | "Search by..." | "Search by PR number, item name, description, or vendor..." |
| Select | "All {field}s" | "All Departments", "All Statuses" |
| Number Range | "Min - Max" | "0 - 10000" |
| Date Range | "Select date range" | Date picker opens |

---

## Error States

### System Errors
| Error Type | User Message | Recovery Action |
|------------|--------------|-----------------|
| Network error | Unable to connect. Please check your internet connection and try again. | [Retry] button |
| Server error | Something went wrong on our end. Please try again in a few moments or contact support. | [Retry] button + Support link |
| Permission error | You don't have permission to view purchase requests. Contact your system administrator. | Redirect to home |
| Not found error | Purchase request not found. It may have been deleted. | Redirect to list |

---

## Loading States

### Loading Messages
| Loading Context | Message | Visual Indicator |
|-----------------|---------|------------------|
| Initial page load | Loading purchase requests... | Skeleton table with 20 rows |
| Filter apply | Applying filters... | Overlay spinner on table area |
| Export | Preparing export... | Progress in export dialog |
| Delete | Deleting... | Disabled button with spinner |

---

## Empty States

### No Data States
| Context | Icon | Primary Message | Secondary Message | Call-to-Action |
|---------|------|-----------------|-------------------|----------------|
| No PRs exist | 📋 | No purchase requests yet | Create your first purchase request to start procuring supplies for your department. Purchase requests must be approved before items can be ordered. | Create Purchase Request |
| No search results | 🔍 | No purchase requests found | No requests match "{search term}". Try different keywords or check your spelling. | Clear search |
| No filter results | 📭 | No requests match your filters | Try adjusting your filters or clearing them to see all purchase requests you have access to. | Clear All Filters |

---

## Notes for Translators

### Translation Context
| Text | Context/Usage | Character Limit |
|------|---------------|-----------------|
| "Purchase Requests" | Page title, main heading | 30 characters |
| "Create Purchase Request" | Primary action button | 40 characters |
| Status badge text | Short status indicators in table | 20 characters each |
| Column headers | Table column names | 25 characters |
| "My Pending" / "All Documents" | Primary filter toggle buttons | 20 characters each |
| "Stage" / "Status" / "Requester" | Secondary filter dropdown labels | 15 characters each |

### Non-Translatable Content
| Content | Reason |
|---------|--------|
| PR-YYMM-NNNN | System-generated reference number format |
| $, USD, EUR | Currency symbols and codes |
| DD MMM YYYY | Standardized date format pattern |
| Numbers (10, 20, 50, 100) | Pagination options |

---

## Brand Voice Guidelines

### Tone
- Professional and efficient
- Clear and action-oriented
- Supportive and helpful
- Hospitality-focused

### Writing Style
- Active voice: "Create purchase request" not "Purchase request can be created"
- Second person: "your purchase requests" not "user's purchase requests"
- Present tense for actions: "Delete" not "Will delete"
- Clear hospitality terminology: Use "Department" not "Approve by"

### Terminology Standards
| Preferred Term | Avoid | Context |
|----------------|-------|---------|
| Purchase Request | Buy Request, PR Form, Req | Always use full term |
| Requestor | User, Creator, Submitter | Person who creates request |
| Department Manager | Supervisor, Boss, Manager | Approval role |
| Delivery Location | Destination, Ship To | Where items delivered |
| PR Number | Request ID, Number | Unique identifier |

---

## Appendix

### Related Pages
- [PC-create-form.md](./PC-create-form.md) - Create Purchase Request Form
- [PC-detail-page.md](./PC-detail-page.md) - Purchase Request Detail Page
- [PC-edit-form.md](./PC-edit-form.md) - Edit Purchase Request Form
- [PC-dialogs.md](./PC-dialogs.md) - Shared Dialogs

### Content Dependencies
- Status badge colors and text shared across all PR pages
- Button labels consistent with other list pages in system
- Error messages follow application-wide patterns
- Primary filter labels ("My Pending", "All Documents") are standard across all list pages
- Secondary filter options (Stage, Status, Requester) follow consistent patterns

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-10-31 | Initial version | Created from TS specification | Content Team |

---

**Document End**
