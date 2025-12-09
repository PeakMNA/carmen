# Use Cases: Spot Check

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Spot Check
- **Route**: `/app/(main)/inventory-management/spot-check`
- **Version**: 2.1.0
- **Last Updated**: 2025-12-09
- **Owner**: Inventory Management Team
- **Status**: Implemented

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial version |
| 2.0.0 | 2025-12-06 | System | Updated to reflect actual implementation |
| 2.1.0 | 2025-12-09 | System | Updated to 2-step wizard, added active/completed pages use cases |

---

## Overview

This document describes the use cases for the Spot Check sub-module based on the actual implementation. Each use case represents a specific user interaction with the system.

**Related Documents**:
- [Business Requirements](./BR-spot-check.md)
- [Technical Specification](./TS-spot-check.md)
- [Data Definition](./DD-spot-check.md)
- [Flow Diagrams](./FD-spot-check.md)
- [Validations](./VAL-spot-check.md)

---

## Actor Definitions

### Primary Actors

| Actor | Description | Permissions |
|-------|-------------|-------------|
| **Storekeeper** | Front-line inventory staff who conduct spot checks | Create, view, count items, complete own checks |
| **Inventory Coordinator** | Supervises storekeepers and coordinates inventory activities | Create, view all, assign, count, approve |
| **Department Supervisor** | Manages department inventory and approves variances | View department checks, approve high variance, cancel |
| **Inventory Manager** | Oversees all inventory operations | Full access, configure parameters, view analytics |

### Secondary Actors

| Actor | Description | Role |
|-------|-------------|------|
| **System** | Carmen ERP platform | Auto-calculations, notifications, data persistence |
| **Timer** | Background scheduler | Overdue alerts, scheduled checks |

---

## Use Case Catalog

### Core Use Cases

| ID | Use Case | Primary Actor | Priority |
|----|----------|---------------|----------|
| UC-SC-001 | View Spot Check Dashboard | All Staff | High |
| UC-SC-002 | View Spot Check List | All Staff | High |
| UC-SC-003 | Create Spot Check | Storekeeper | Critical |
| UC-SC-004 | View Spot Check Details | All Staff | High |
| UC-SC-005 | Count Items | Storekeeper | Critical |
| UC-SC-006 | Start Spot Check | Storekeeper | High |
| UC-SC-007 | Pause Spot Check | Storekeeper | Medium |
| UC-SC-008 | Complete Spot Check | Storekeeper | Critical |
| UC-SC-009 | Cancel Spot Check | Supervisor | Medium |
| UC-SC-010 | Filter Spot Checks | All Staff | Medium |
| UC-SC-011 | Skip Item | Storekeeper | Medium |
| UC-SC-012 | Review Variances | Coordinator | High |
| UC-SC-013 | View Active Spot Checks | All Staff | High |
| UC-SC-014 | View Completed Spot Checks | All Staff | High |

---

## Detailed Use Cases

### UC-SC-001: View Spot Check Dashboard

**Primary Actor**: All Staff (Storekeeper, Coordinator, Supervisor, Manager)

**Description**: View comprehensive dashboard with KPIs, active checks, and performance metrics for spot check activities.

**Preconditions**:
- User is authenticated
- User has access to inventory management module

**Trigger**: User navigates to Spot Check Dashboard

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to `/inventory-management/spot-check/dashboard` | System loads dashboard page |
| 2 | System | - | Display KPI cards: Total checks, Average accuracy, Items counted, Total variance |
| 3 | System | - | Display overdue checks alert if any exist |
| 4 | System | - | Display active spot checks with progress bars |
| 5 | System | - | Display recently completed checks table |
| 6 | System | - | Display quick action buttons |
| 7 | System | - | Display upcoming checks section |
| 8 | System | - | Display stats by type and location |
| 9 | User | Click on quick action (e.g., "New Spot Check") | Navigate to creation wizard |
| 10 | User | Click on active check | Navigate to detail page |

**Alternative Flows**:

| Alt | Step | Condition | Action |
|-----|------|-----------|--------|
| A1 | 3 | No overdue checks | Hide overdue alert section |
| A2 | 4 | No active checks | Display "No active spot checks" message |
| A3 | 5 | No completed checks | Display "No recent completions" message |

**Postconditions**:
- Dashboard displays current spot check status and metrics
- User can navigate to other spot check pages via quick actions

**UI Elements**:
- KPI Cards with icons (ClipboardList, CheckCircle2, Package, AlertTriangle)
- Progress bars for active checks
- Data table for completed checks
- Action buttons (New Check, View All, Reports)

---

### UC-SC-002: View Spot Check List

**Primary Actor**: All Staff

**Description**: View filterable list of all spot checks with status summary and search capabilities.

**Preconditions**:
- User is authenticated
- User has access to spot check module

**Trigger**: User navigates to Spot Check main page

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to `/inventory-management/spot-check` | System loads list page |
| 2 | System | - | Display summary cards with status counts |
| 3 | System | - | Display spot checks in default view (list) |
| 4 | User | Click status tab (All/Active/Completed) | Filter list by selected status |
| 5 | User | Toggle view (List/Grid) | Switch display mode |
| 6 | User | Enter search term | Filter by check number or description |
| 7 | User | Click on spot check row | Navigate to detail page |

**Alternative Flows**:

| Alt | Step | Condition | Action |
|-----|------|-----------|--------|
| A1 | 3 | No spot checks exist | Display empty state with "Create First Check" |
| A2 | 6 | No search results | Display "No results found" message |

**Postconditions**:
- User can view all spot checks matching their permissions
- User can navigate to detail view or creation wizard

**UI Elements**:
- Summary cards (All, Pending, In Progress, Completed, Cancelled)
- Tabs (All, Active, Completed)
- View toggle (LayoutGrid, List icons)
- Search input
- Data table with columns (Check #, Type, Status, Location, Date, Items, Accuracy, Actions)

---

### UC-SC-003: Create Spot Check (2-Step Wizard)

**Primary Actor**: Storekeeper, Inventory Coordinator

**Description**: Create a new spot check using the streamlined 2-step creation wizard.

**Preconditions**:
- User is authenticated
- User has permission to create spot checks
- Locations and departments are configured

**Trigger**: User clicks "New Spot Check" button

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Click "New Spot Check" | Navigate to creation wizard |
| **Step 1: Location Selection** |
| 2 | System | - | Display location selection form with step indicator (Step 1 of 2) |
| 3 | User | Select location (required) | Populate departments dropdown, update form state |
| 4 | User | Select department (optional) | Update form state |
| 5 | User | Select assigned staff member | Update form state |
| 6 | User | Select scheduled date (defaults to today) | Update form state |
| 7 | User | Click "Next" | Validate location selected, proceed to Step 2 |
| **Step 2: Method & Items Selection** |
| 8 | System | - | Display selection method form with step indicator (Step 2 of 2) |
| 9 | User | Select method (Random/High-Value/Manual) | Show relevant options based on method |
| 10 | User | Select item count (10/20/50) | Update form state |
| 11a | User | If Random: System auto-generates items | Display preview table with random items |
| 11b | User | If High-Value: System selects highest value items | Display preview table with high-value items |
| 11c | User | If Manual: Search and select items individually | Display item selection interface with checkboxes |
| 12 | System | - | Show item preview table with: code, name, category, system qty, unit |
| 13 | User | Click "Create Spot Check" | Create spot check record |
| 14 | System | - | Show success toast, navigate to detail or list page |

**Alternative Flows**:

| Alt | Step | Condition | Action |
|-----|------|-----------|--------|
| A1 | 7 | Location not selected | Display error "Please select a location" |
| A2 | 11c | Manual mode, no items selected | Display error "Please select at least one item" |
| A3 | 7 | User clicks "Cancel" | Prompt confirmation, discard and return to list |
| A4 | 13 | User clicks "Back" | Return to Step 1 with preserved data |

**Postconditions**:
- New spot check created with status "pending"
- Check number generated (format: SC-YYMMDD-XXXX)
- User redirected to list or detail page

**UI Elements**:
- Step indicator (Step 1: Location → Step 2: Items)
- Form inputs (Select dropdown, DatePicker)
- Selection method radio buttons (Random, High-Value, Manual)
- Item count selector (10, 20, 50)
- Item preview/selection table
- Navigation buttons (Cancel, Back, Next, Create Spot Check)

---

### UC-SC-004: View Spot Check Details

**Primary Actor**: All Staff

**Description**: View detailed information about a specific spot check with tabbed sections.

**Preconditions**:
- User is authenticated
- Spot check exists
- User has permission to view

**Trigger**: User clicks on spot check from list

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Click spot check row or navigate to `/spot-check/[id]` | Load detail page |
| 2 | System | - | Display header with check number, type, status badge |
| 3 | System | - | Display Overview tab by default |
| 4 | User | Click "Items" tab | Display items table with counts and variances |
| 5 | User | Click "Variances" tab | Display only items with variance |
| 6 | User | Click "History" tab | Display activity log |
| 7 | User | Click action button (Start/Pause/Cancel/Complete) | Execute status change |

**Alternative Flows**:

| Alt | Step | Condition | Action |
|-----|------|-----------|--------|
| A1 | 1 | Spot check not found | Display 404 error page |
| A2 | 4 | No items | Display "No items" message |
| A3 | 5 | No variances | Display "No variances found" message |

**Postconditions**:
- User views complete spot check information
- User can take actions based on current status

**UI Elements**:
- Tabs component (Overview, Items, Variances, History)
- Status badge with color coding
- Progress indicators (accuracy, items counted)
- Items data table
- Action buttons (Start Check, Pause, Cancel, Complete, Edit, Print)
- Cancel dialog

---

### UC-SC-005: Count Items

**Primary Actor**: Storekeeper

**Description**: Enter physical count quantities for items in a spot check using the counting interface.

**Preconditions**:
- Spot check status is "in-progress"
- User is assigned to the spot check
- Items exist in the spot check

**Trigger**: User clicks "Count Items" or navigates to count page

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to `/spot-check/[id]/count` | Load counting interface |
| 2 | System | - | Display current item with details (Single Item Mode) |
| 3 | System | - | Show item: code, name, location, system quantity |
| 4 | User | Enter counted quantity (or use +/- buttons) | Update quantity, calculate variance preview |
| 5 | System | - | Display variance preview (quantity and percentage) |
| 6 | User | Select condition (Good/Damaged/Expired/Missing) | Update item condition |
| 7 | User | Enter notes (optional) | Update item notes |
| 8 | User | Click "Next Item" | Save current item, move to next |
| 9 | User | Repeat steps 4-8 for all items | Progress indicator updates |
| 10 | User | Click "Save Progress" | Save all counted items |
| 11 | User | Click "Complete Check" when all counted | Open completion dialog |
| 12 | User | Confirm completion | Complete spot check |

**Alternative Flows**:

| Alt | Step | Condition | Action |
|-----|------|-----------|--------|
| A1 | 2 | User prefers list view | Toggle to List Mode, show all items |
| A2 | 8 | User clicks "Previous" | Navigate to previous item |
| A3 | 8 | User clicks "Skip Item" | Open skip reason dialog |
| A4 | 11 | Not all items counted | Display warning, allow force complete |

**Postconditions**:
- Item quantities and conditions recorded
- Variances calculated automatically
- Progress saved

**UI Elements**:
- View toggle (Single Item / List Mode)
- Progress bar (e.g., "Item 3 of 15")
- Item details card
- Quantity input with +/- buttons
- Condition radio buttons (Good, Damaged, Expired, Missing)
- Notes textarea
- Variance preview (color-coded)
- Navigation buttons (Previous, Next, Skip)
- Action buttons (Save Progress, Complete Check)

---

### UC-SC-006: Start Spot Check

**Primary Actor**: Storekeeper, Inventory Coordinator

**Description**: Transition spot check from "pending" to "in-progress" status.

**Preconditions**:
- Spot check exists with status "pending"
- User has permission to start

**Trigger**: User clicks "Start Check" button

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Click "Start Check" button on detail page | - |
| 2 | System | - | Update status to "in-progress" |
| 3 | System | - | Record startedAt timestamp |
| 4 | System | - | Update status badge to "In Progress" |
| 5 | System | - | Enable "Count Items" action |
| 6 | System | - | Show success toast "Spot check started" |

**Postconditions**:
- Status changed to "in-progress"
- Start time recorded
- User can proceed to count items

---

### UC-SC-007: Pause Spot Check

**Primary Actor**: Storekeeper

**Description**: Temporarily pause an in-progress spot check.

**Preconditions**:
- Spot check status is "in-progress"
- User is assigned to the spot check

**Trigger**: User clicks "Pause" button

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Click "Pause" button | - |
| 2 | System | - | Save current progress |
| 3 | System | - | Update status to "on-hold" |
| 4 | System | - | Update status badge |
| 5 | System | - | Show success toast "Spot check paused" |

**Alternative Flows**:

| Alt | Step | Condition | Action |
|-----|------|-----------|--------|
| A1 | 2 | User clicks "Resume" later | Update status back to "in-progress" |

**Postconditions**:
- Status changed to "on-hold"
- Progress preserved
- Can be resumed later

---

### UC-SC-008: Complete Spot Check

**Primary Actor**: Storekeeper

**Description**: Mark spot check as complete after all items have been counted.

**Preconditions**:
- Spot check status is "in-progress"
- All items have been counted or skipped

**Trigger**: User clicks "Complete Check" button

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Click "Complete Check" | - |
| 2 | System | - | Validate all items counted |
| 3 | System | - | Open completion confirmation dialog |
| 4 | System | - | Display summary: items counted, accuracy, variance |
| 5 | User | Confirm completion | - |
| 6 | System | - | Update status to "completed" |
| 7 | System | - | Record completedAt timestamp |
| 8 | System | - | Calculate final accuracy and variance values |
| 9 | System | - | Navigate to detail page |
| 10 | System | - | Show success toast "Spot check completed" |

**Alternative Flows**:

| Alt | Step | Condition | Action |
|-----|------|-----------|--------|
| A1 | 2 | Items not counted | Display warning, option to skip uncounted |
| A2 | 5 | User cancels | Close dialog, remain on count page |

**Postconditions**:
- Status changed to "completed"
- Final metrics calculated and stored
- No further modifications allowed

---

### UC-SC-009: Cancel Spot Check

**Primary Actor**: Supervisor, Manager

**Description**: Cancel a spot check that is no longer needed.

**Preconditions**:
- Spot check status is NOT "completed"
- User has supervisor or higher permissions

**Trigger**: User clicks "Cancel Check" button

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Click "Cancel Check" | - |
| 2 | System | - | Open cancellation dialog |
| 3 | User | Select cancellation reason from dropdown | Update form |
| 4 | User | Enter additional notes (optional) | Update form |
| 5 | User | Click "Cancel Spot Check" | - |
| 6 | System | - | Update status to "cancelled" |
| 7 | System | - | Preserve all entered data |
| 8 | System | - | Close dialog |
| 9 | System | - | Show success toast "Spot check cancelled" |

**Cancellation Reasons**:
- Items Unavailable
- Staff Unavailable
- Incorrect Items
- Duplicate Check
- Emergency
- Other

**Alternative Flows**:

| Alt | Step | Condition | Action |
|-----|------|-----------|--------|
| A1 | 5 | User clicks "Back" | Close dialog, return to detail page |

**Postconditions**:
- Status changed to "cancelled"
- Data preserved for reference
- No inventory adjustments made

**UI Elements**:
- Dialog with form
- Reason dropdown
- Notes textarea
- Cancel/Confirm buttons

---

### UC-SC-010: Filter Spot Checks

**Primary Actor**: All Staff

**Description**: Apply filters to narrow down spot check list.

**Preconditions**:
- User is on spot check list page

**Trigger**: User interacts with filter controls

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Click "Filters" button | Open filter panel |
| 2 | User | Select status filter | Filter list by status |
| 3 | User | Select check type filter | Filter list by type |
| 4 | User | Select priority filter | Filter list by priority |
| 5 | User | Select location filter | Filter list by location |
| 6 | User | Click "Apply" | Apply all filters |
| 7 | System | - | Update list to show matching spot checks |
| 8 | User | Click "Clear Filters" | Reset all filters |

**Filter Options**:
- **Status**: draft, pending, in-progress, completed, cancelled, on-hold
- **Type**: random, targeted, high-value, variance-based, cycle-count
- **Priority**: low, medium, high, critical
- **Location**: [Dynamic list from system]

**Postconditions**:
- List displays only matching spot checks
- Filter state maintained during session

---

### UC-SC-011: Skip Item

**Primary Actor**: Storekeeper

**Description**: Skip counting an item with a documented reason.

**Preconditions**:
- User is in counting interface
- Item is in "pending" status

**Trigger**: User clicks "Skip Item" button

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Click "Skip Item" | Open skip reason dialog |
| 2 | User | Enter reason for skipping | Update form |
| 3 | User | Click "Skip" | - |
| 4 | System | - | Mark item status as "skipped" |
| 5 | System | - | Record skip reason in notes |
| 6 | System | - | Move to next item |

**Alternative Flows**:

| Alt | Step | Condition | Action |
|-----|------|-----------|--------|
| A1 | 3 | User clicks "Cancel" | Close dialog, remain on item |

**Postconditions**:
- Item marked as skipped
- Reason documented
- Item not counted in accuracy calculation

---

### UC-SC-012: Review Variances

**Primary Actor**: Inventory Coordinator, Supervisor

**Description**: Review items with variance in a completed or in-progress spot check.

**Preconditions**:
- Spot check has items with variance
- User has permission to view

**Trigger**: User clicks "Variances" tab

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Click "Variances" tab | - |
| 2 | System | - | Display filtered list of items with variance |
| 3 | System | - | Show variance details: item, system qty, counted qty, variance, % |
| 4 | System | - | Color-code by severity (yellow = minor, red = significant) |
| 5 | User | Review variance explanations in notes | - |
| 6 | User | Sort by variance percentage or value | Reorder list |

**Postconditions**:
- User has visibility into all variances
- Can identify items requiring investigation

---

### UC-SC-013: View Active Spot Checks

**Primary Actor**: All Staff

**Description**: View and manage all active (pending, in-progress, paused) spot checks in a dedicated page with quick actions.

**Preconditions**:
- User is authenticated
- User has access to spot check module

**Trigger**: User navigates to Active Spot Checks page

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to `/spot-check/active` | System loads active checks page |
| 2 | System | - | Load active spot checks from Zustand store (`useCountStore`) |
| 3 | System | - | Display filter tabs: All, Pending, In Progress, Paused |
| 4 | System | - | Display list of active spot checks with progress indicators |
| 5 | User | Click status tab (e.g., "Pending") | Filter list by selected status |
| 6 | User | Click "Start Count" on pending check | Navigate to counting interface |
| 7 | User | Click "Continue Count" on in-progress check | Navigate to counting interface |
| 8 | User | Click row or "View Details" | Navigate to detail page |

**Alternative Flows**:

| Alt | Step | Condition | Action |
|-----|------|-----------|--------|
| A1 | 3 | No active checks | Display empty state with "Create Spot Check" link |
| A2 | 5 | No checks match filter | Display "No [status] spot checks" message |

**Postconditions**:
- User views all active spot checks with real-time status
- User can quickly start or continue counting

**UI Elements**:
- Filter tabs (All, Pending, In Progress, Paused)
- List cards showing:
  - Check number with type badge
  - Location name
  - Progress bar (items counted/total)
  - Status badge
  - Due date with overdue indicator (red if past due)
- Action buttons (Start Count, Continue, View Details)
- Empty state component

**State Management**:
- Uses Zustand store: `useCountStore((state) => state.activeCounts)`

---

### UC-SC-014: View Completed Spot Checks

**Primary Actor**: All Staff

**Description**: View and review all completed spot checks with filtering by time period and summary statistics.

**Preconditions**:
- User is authenticated
- User has access to spot check module

**Trigger**: User navigates to Completed Spot Checks page

**Main Flow**:

| Step | Actor | Action | System Response |
|------|-------|--------|-----------------|
| 1 | User | Navigate to `/spot-check/completed` | System loads completed checks page |
| 2 | System | - | Display summary statistics cards |
| 3 | System | - | Display filter tabs: All, Today, This Week, This Month |
| 4 | System | - | Display list of completed spot checks |
| 5 | User | Click time period tab (e.g., "This Week") | Filter list by time range |
| 6 | User | Click row to view details | Navigate to completed check detail page |

**Alternative Flows**:

| Alt | Step | Condition | Action |
|-----|------|-----------|--------|
| A1 | 2 | No completed checks | Display empty state |
| A2 | 5 | No checks in time range | Display "No completed checks [period]" message |

**Postconditions**:
- User views completed spot checks with accuracy metrics
- User can analyze performance trends

**UI Elements**:
- Summary statistics cards:
  - Total Completed (count)
  - Average Accuracy (percentage with color coding)
  - Total Items Counted
  - Total Variance Value (monetary)
- Filter tabs (All, Today, This Week, This Month)
- List table with columns:
  - Check number with type badge
  - Location
  - Completion date and time
  - Accuracy percentage (color-coded: green >95%, yellow 90-95%, red <90%)
  - Variance value
  - Items counted
  - Counted by user
- Empty state component

---

## Use Case Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SPOT CHECK USE CASES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐        ┌─────────────────────┐                     │
│  │ UC-001: View        │───────▶│ UC-010: Filter      │                     │
│  │ Dashboard           │        │ Spot Checks         │                     │
│  └─────────────────────┘        └─────────────────────┘                     │
│           │                                                                  │
│     ┌─────┼─────────────────────────────────────┐                           │
│     ▼     ▼                                     ▼                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ UC-002: View    │  │ UC-013: View    │  │ UC-014: View    │              │
│  │ Spot Check List │  │ Active Checks   │  │ Completed       │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│           │                    │                    │                        │
│           ▼                    │                    │                        │
│  ┌─────────────────────┐       │                    │                        │
│  │ UC-003: Create      │       │                    │                        │
│  │ Spot Check (2-step) │       │                    │                        │
│  └─────────────────────┘       │                    │                        │
│           │                    │                    │                        │
│           ▼                    ▼                    ▼                        │
│  ┌───────────────────────────────────────────────────────────────┐          │
│  │                    UC-004: View Details                       │          │
│  └───────────────────────────────────────────────────────────────┘          │
│                                    │                                         │
│          ┌─────────────────────────┼─────────────────────┐                  │
│          ▼                         ▼                     ▼                  │
│  ┌───────────────┐       ┌───────────────┐       ┌────────────┐             │
│  │ UC-006: Start │       │ UC-009: Cancel│       │ UC-012:    │             │
│  │ Spot Check    │       │ Spot Check    │       │ Review     │             │
│  └───────────────┘       └───────────────┘       │ Variances  │             │
│          │                                       └────────────┘             │
│          ▼                                                                   │
│  ┌───────────────┐                                                          │
│  │ UC-005: Count │───────▶┌───────────────┐                                 │
│  │ Items         │        │ UC-011: Skip  │                                 │
│  └───────────────┘        │ Item          │                                 │
│          │                └───────────────┘                                 │
│    ┌─────┴─────┐                                                            │
│    ▼           ▼                                                            │
│  ┌───────────────┐  ┌───────────────┐                                       │
│  │ UC-007: Pause │  │ UC-008:       │                                       │
│  │ Spot Check    │  │ Complete      │                                       │
│  └───────────────┘  └───────────────┘                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix

### User Stories

| ID | As a | I want to | So that |
|----|------|-----------|---------|
| US-001 | Storekeeper | view the dashboard | I can see pending tasks and performance |
| US-002 | Storekeeper | create a random spot check quickly | I can verify inventory without bias using 2-step wizard |
| US-003 | Storekeeper | count items one at a time | I can focus on accuracy |
| US-004 | Supervisor | cancel an incorrect spot check | I can prevent bad data |
| US-005 | Coordinator | review variances | I can investigate discrepancies |
| US-006 | Manager | filter by location | I can analyze specific areas |
| US-007 | Storekeeper | view active spot checks | I can quickly continue my work |
| US-008 | Manager | view completed checks by period | I can analyze weekly/monthly performance |

### Test Scenarios

| TC | Use Case | Scenario | Expected Result |
|----|----------|----------|-----------------|
| TC-001 | UC-003 | Create spot check with random items (2-step) | Spot check created with generated items |
| TC-002 | UC-005 | Enter quantity that matches system | Variance shows 0%, green indicator |
| TC-003 | UC-005 | Enter quantity with large variance | Red variance indicator, warning shown |
| TC-004 | UC-009 | Cancel in-progress check | Status changes to cancelled, data preserved |
| TC-005 | UC-008 | Complete with uncounted items | Warning displayed, option to continue |
| TC-006 | UC-013 | Filter active checks by status | Only matching status checks displayed |
| TC-007 | UC-014 | Filter completed checks by "This Week" | Only checks completed in current week shown |

---

**Document End**
