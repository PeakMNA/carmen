# Use Cases: Period End

## Document Information
- **Module**: Inventory Management - Period End
- **Document Type**: Use Cases (UC)
- **Related Documents**:
  - BR-period-end.md (Business Requirements)
  - TS-period-end.md (Technical Specification)
  - DD-period-end.md (Data Definition)
  - FD-period-end.md (Flow Diagrams)
  - VAL-period-end.md (Validations)
- **Version**: 1.1.0
- **Last Updated**: 2025-12-09

## Table of Contents
1. [Overview](#overview)
2. [Actor Definitions](#actor-definitions)
3. [Use Case Index](#use-case-index)
4. [User Use Cases](#user-use-cases)
5. [System Use Cases](#system-use-cases)
6. [Integration Use Cases](#integration-use-cases)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2025-12-09 | Development Team | Updated status values (open, closing, closed, reopened), expanded validation checklist to 11 items, updated status badge colors |
---

## Overview

This document defines all use cases for the Period End sub-module. Use cases are organized into three categories:
- **User Use Cases**: Initiated by human users (Inventory Managers, Financial Accountants, Administrators)
- **System Use Cases**: Automated system behaviors (validations, notifications, logging)
- **Integration Use Cases**: Interactions with other modules or external systems

Each use case includes detailed flow descriptions, business rules applied, error handling, and acceptance criteria.

---

## Actor Definitions

### Primary Actors

**Inventory Coordinator**
- Role: Day-to-day inventory management and period task execution
- Permissions: View periods, mark tasks complete (basic checklist items)
- Use Cases: UC-PE-001, UC-PE-006, UC-PE-010

**Inventory Manager**
- Role: Supervise period close process, review adjustments
- Permissions: All Coordinator permissions + Close periods, Create periods
- Use Cases: UC-PE-001 through UC-PE-007, UC-PE-010

**Financial Manager**
- Role: Approve period closures, manage period re-opens for compliance
- Permissions: All Inventory Manager permissions + Re-open closed periods
- Use Cases: All except UC-PE-009 (Administrator only)

**System Administrator**
- Role: System configuration, emergency operations, audit management
- Permissions: All permissions + Override constraints, Configure checklist, Access all audit logs
- Use Cases: All use cases including UC-PE-009

### Secondary Actors

**Warehouse Supervisor**
- Interacts with period end indirectly through Physical Count completion

**Financial Controller**
- Receives notifications for period re-opens, reviews audit logs

**External Auditor**
- Reviews period activity logs and closure documentation

---

## Use Case Index

### User Use Cases (UC-PE-001 to 099)
| ID | Use Case Name | Actor | Priority |
|----|---------------|-------|----------|
| UC-PE-001 | View Period List | Inventory Coordinator+ | High |
| UC-PE-002 | View Period Detail | Inventory Coordinator+ | High |
| UC-PE-003 | Create New Period | Inventory Manager+ | Critical |
| UC-PE-004 | Close Period | Inventory Manager+ | Critical |
| UC-PE-005 | Re-open Closed Period | Financial Manager+ | High |
| UC-PE-006 | Mark Task Complete | Inventory Coordinator+ | High |
| UC-PE-007 | View Period Adjustments | Inventory Manager+ | Medium |
| UC-PE-008 | Update Period Notes | Inventory Manager+ | Low |
| UC-PE-009 | Cancel Period | System Administrator | Medium |
| UC-PE-010 | Export Period Data | Inventory Coordinator+ | Low |

### System Use Cases (UC-PE-101 to 199)
| ID | Use Case Name | Trigger | Priority |
|----|---------------|---------|----------|
| UC-PE-101 | Validate Period Closure | User initiates close | Critical |
| UC-PE-102 | Log Activity Entry | Any period action | Critical |
| UC-PE-103 | Enforce Single Closing Period | Status transition | High |
| UC-PE-104 | Prevent Transaction Posting to Closed Period | Transaction creation | Critical |
| UC-PE-105 | Send Re-open Notification | Period re-opened | High |

### Integration Use Cases (UC-PE-201 to 299)
| ID | Use Case Name | Integration Point | Priority |
|----|---------------|-------------------|----------|
| UC-PE-201 | Check Physical Count Completion | Physical Count module | High |
| UC-PE-202 | Retrieve Period Adjustments | Inventory Adjustments module | High |
| UC-PE-203 | Validate Transaction Completeness | Stock Transactions modules | High |

---

## User Use Cases

### UC-PE-001: View Period List
**Description**: User views list of all accounting periods with status, dates, and completion information to monitor period lifecycle and select periods for review.

**Actor**: Inventory Coordinator, Inventory Manager, Financial Manager, System Administrator

**Priority**: High

**Frequency**: Daily (multiple times per day during month-end)

**Preconditions**:
- User is authenticated
- User has "Inventory.PeriodEnd.View" permission

**Postconditions**:
- Period list displayed showing all periods
- User can navigate to period detail

**Main Flow**:
1. User navigates to Period End module (/inventory-management/period-end)
2. System retrieves all period records from database
3. System displays period list with columns:
   - Period ID (e.g., PE-2024-01)
   - Period Name (e.g., "January 2024")
   - Start Date (formatted: Jan 1, 2024)
   - End Date (formatted: Jan 31, 2024)
   - Status (badge: Green=Open, Yellow=Closing, Gray=Closed, Blue=Reopened)
   - Completed By (user name or "-" if not closed)
   - Completed At (date or "-" if not closed)
   - Notes (truncated if long)
4. User sees "Start New Period" button in header (if authorized)
5. User can click any period row to navigate to detail view
6. User can use date picker to filter periods by date range (optional)

**Alternative Flows**:
- **Alt-1A: No Periods Exist**
  - System displays empty state message: "No periods found. Click 'Start New Period' to create the first period."
  - User sees "Start New Period" button (if authorized)

- **Alt-1B: Filter by Date Range**
  - User selects date range using calendar picker
  - System filters periods where start_date or end_date falls within range
  - Period list updates dynamically

**Exception Flows**:
- **Exc-1A: Permission Denied**
  - System returns 403 Forbidden
  - User sees error message: "You do not have permission to view periods"
  - User redirected to dashboard

**Business Rules Applied**: BR-PE-001, BR-PE-002, BR-PE-003, BR-PE-004, BR-PE-005

**Performance Requirements**: Page load within 2 seconds for up to 36 periods

**Acceptance Criteria**:
- All periods displayed in reverse chronological order (newest first)
- Status badges color-coded correctly
- "Start New Period" button visible only to Inventory Manager+
- Period row click navigates to detail page
- Empty state handled gracefully

---

### UC-PE-002: View Period Detail
**Description**: User views detailed information for a specific period including status, tasks, adjustments, and activity log.

**Actor**: Inventory Coordinator, Inventory Manager, Financial Manager, System Administrator

**Priority**: High

**Frequency**: Multiple times per day during active period

**Preconditions**:
- User is authenticated
- User has "Inventory.PeriodEnd.View" permission
- Period exists in system

**Postconditions**:
- Period detail page displayed with all information
- User can perform authorized actions (Close, Reopen, Cancel, Mark Tasks Complete)

**Main Flow**:
1. User clicks period row from list page (UC-PE-001)
2. System retrieves period record by ID
3. System displays period detail page with two main sections:

   **Section 1: Period Information Card**
   - Period ID, Period Name
   - Start Date, End Date (formatted)
   - Status badge (color-coded)
   - Completed By, Completed At (if closed)
   - Notes (editable text area for Inventory Manager+)

   **Section 2: Checklist Card (Validation Checklist)**
   - List of 11 default validation tasks:
     1. All inventory counts completed
     2. Stock movements recorded
     3. Adjustments posted
     4. Returns processed
     5. Costing calculations finalized
     6. GL entries reconciled
     7. Department allocations completed
     8. Variance analysis completed
     9. Audit trail verified
     10. Reports generated
     11. Management approval obtained
   - Visual indicators: Green checkmark for completed, gray circle for pending
   - Completed tasks show green background highlight

4. System displays "Adjustments" tab below main cards
5. System retrieves all adjustments created during period date range
6. System displays adjustments table:
   - Columns: ID, Type, Amount (currency), Reason, Status, Created By, Created At
   - Sortable by any column
   - Amount color-coded: Red for negative, Green for positive
   - Click row navigates to adjustment detail (opens in new tab)

7. User sees action buttons in header (role-dependent):
   - "Complete Period End" button (if status = "Closing" and user is Inventory Manager+)
   - "Cancel Period End" button (if status = "Open"/"Closing" and user is System Admin)
   - "Re-open Period" button (if status = "Closed" and user is Financial Manager+)

**Alternative Flows**:
- **Alt-2A: Period Already Closed**
  - Checklist displayed in read-only mode (no completion buttons)
  - "Complete Period End" button not shown
  - "Re-open Period" button shown (if authorized)

- **Alt-2B: No Adjustments in Period**
  - Adjustments tab displays empty state: "No adjustments made during this period"

- **Alt-2C: View Activity Log** (Future Enhancement)
  - User clicks "Activity Log" tab
  - System displays chronological list of all period actions with user, timestamp, details

**Exception Flows**:
- **Exc-2A: Period Not Found**
  - System returns 404 Not Found
  - User sees error message: "Period not found"
  - User redirected to period list

- **Exc-2B: Permission Denied**
  - System returns 403 Forbidden
  - User sees error message: "You do not have permission to view this period"
  - User redirected to period list

**Business Rules Applied**: BR-PE-001 to BR-PE-016

**Performance Requirements**: Page load within 1.5 seconds including tasks and adjustments

**Acceptance Criteria**:
- Period information displayed accurately
- Task checklist shows real-time completion status
- Adjustments filtered correctly by period date range
- Action buttons shown only to authorized users based on role and period status
- Navigation back to list preserves context

---

### UC-PE-003: Create New Period
**Description**: Authorized user creates a new monthly accounting period with default settings and checklist.

**Actor**: Inventory Manager, Financial Manager, System Administrator

**Priority**: Critical

**Frequency**: Monthly (once per month, typically first week)

**Preconditions**:
- User is authenticated
- User has "Inventory.PeriodEnd.Create" permission
- Prior period is closed (or user has override permission)

**Postconditions**:
- New period record created in database with status "Open"
- Default checklist tasks created
- Activity log entry recorded for period creation
- User redirected to new period detail page

**Main Flow**:
1. User clicks "Start New Period" button from period list page
2. System calculates next period details:
   - Determine current month/year
   - Generate Period ID: PE-YYYY-MM (e.g., PE-2024-02)
   - Generate Period Name: "Month YYYY" (e.g., "February 2024")
   - Calculate Start Date: First day of next month (00:00:00)
   - Calculate End Date: Last day of next month (23:59:59)
3. System validates period creation:
   - Check if Period ID already exists (must be unique)
   - Check if prior period (previous month) is closed (BR-PE-021)
   - Verify user has create permission
4. System displays confirmation dialog showing:
   - Period ID
   - Period Name
   - Start Date (formatted)
   - End Date (formatted)
   - Initial Status: "Open"
   - Message: "Are you sure you want to create this period?"
5. User reviews details and clicks "Confirm"
6. System creates period record:
   - INSERT into period_end table
   - Set status = "Open"
   - Set created_by, created_date
7. System creates default validation checklist tasks (11 items):
   - All inventory counts completed (sequence=1, status=Pending)
   - Stock movements recorded (sequence=2, status=Pending)
   - Adjustments posted (sequence=3, status=Pending)
   - Returns processed (sequence=4, status=Pending)
   - Costing calculations finalized (sequence=5, status=Pending)
   - GL entries reconciled (sequence=6, status=Pending)
   - Department allocations completed (sequence=7, status=Pending)
   - Variance analysis completed (sequence=8, status=Pending)
   - Audit trail verified (sequence=9, status=Pending)
   - Reports generated (sequence=10, status=Pending)
   - Management approval obtained (sequence=11, status=Pending)
8. System logs activity entry:
   - Action: "Create"
   - User, Timestamp, IP Address
   - Details: "Period created with initial status: Open"
9. System displays success message: "Period created successfully"
10. System navigates user to new period detail page (UC-PE-002)

**Alternative Flows**:
- **Alt-3A: Prior Period Not Closed (Administrator Override)**
  - System shows validation warning: "Prior period (PE-YYYY-MM) is not closed"
  - If user is System Administrator: "Continue anyway?" with warning icon
  - Administrator clicks "Override and Create"
  - System logs override in activity log with reason
  - Period created with warning flag

- **Alt-3B: Create Period for Specific Month** (Future Enhancement)
  - User clicks dropdown next to "Start New Period" to select specific month
  - System validates selected month is not more than 1 month in advance
  - Rest of flow proceeds as main flow

**Exception Flows**:
- **Exc-3A: Period Already Exists**
  - Validation fails at Step 3
  - System displays error: "Period PE-YYYY-MM already exists. Cannot create duplicate period."
  - User remains on period list page
  - No database changes made

- **Exc-3B: Prior Period Not Closed (Non-Administrator)**
  - Validation fails at Step 3
  - System displays error: "Cannot create new period. Prior period (PE-YYYY-MM) must be closed first. Please complete prior period or contact administrator."
  - User remains on period list page

- **Exc-3C: Permission Denied**
  - Validation fails at Step 3
  - System returns 403 Forbidden
  - User sees error: "You do not have permission to create periods. Required permission: Inventory.PeriodEnd.Create"

**Business Rules Applied**: BR-PE-001, BR-PE-009, BR-PE-012, BR-PE-017, BR-PE-018, BR-PE-019, BR-PE-020, BR-PE-021, BR-PE-026

**Performance Requirements**: Period creation completes within 2 seconds

**Acceptance Criteria**:
- Period ID auto-generated correctly (PE-YYYY-MM format)
- Start/End dates align with calendar month boundaries
- Default 11 validation tasks created automatically
- Activity log captures creation event
- Validation prevents duplicate periods
- Administrator override works when prior period not closed

---

### UC-PE-004: Close Period
**Description**: Authorized user closes a "Closing" period after all 11 validation checklist tasks are completed, locking it from further transactions.

**Actor**: Inventory Manager, Financial Manager, System Administrator

**Priority**: Critical

**Frequency**: Monthly (once per month, typically within 5 business days of month-end)

**Preconditions**:
- User is authenticated
- User has "Inventory.PeriodEnd.Close" permission (Inventory Manager or higher)
- Period status = "Closing"
- ALL 11 validation checklist tasks marked "Completed"

**Postconditions**:
- Period status updated to "Closed"
- Completed_by, completed_at fields populated
- Activity log entry recorded
- Transactions can no longer post to this period (enforced by UC-PE-104)
- Success notification displayed

**Main Flow**:
1. User navigates to period detail page (UC-PE-002)
2. System verifies period status = "Closing"
3. System displays "Complete Period End" button (enabled)
4. User clicks "Complete Period End" button
5. System validates all 11 validation checklist tasks completed:
   - Query period_task table: `WHERE period_end_id = :id AND status != 'completed'`
   - If any task pending, validation fails → Go to Exc-4A
6. System displays confirmation dialog:
   ```
   Title: "Complete Period End"
   Message:
   "Are you sure you want to close period PE-YYYY-MM (Month YYYY)?

   Summary:
   - Start Date: [date]
   - End Date: [date]
   - Total Adjustments: [count] ([positive_count] positive, [negative_count] negative)
   - Total Adjustment Amount: [currency amount]

   Warning: Once closed, no transactions can be posted to this period.
   Only Financial Managers can re-open closed periods.

   Actions: [Cancel] [Confirm Close]
   ```
7. User reviews summary and clicks "Confirm Close"
8. System begins atomic transaction:
   - BEGIN TRANSACTION
   - UPDATE period_end: status = 'Closed', completed_by = :user_id, completed_at = NOW()
   - INSERT into period_activity: action='Close', user, timestamp, details
   - COMMIT TRANSACTION
9. System triggers validation workflow (UC-PE-101) in background
10. System displays success message: "Period closed successfully. Period PE-YYYY-MM is now locked."
11. System refreshes period detail page showing updated status "Closed"
12. "Complete Period End" button hidden, "Re-open Period" button shown (if authorized)

**Alternative Flows**:
- **Alt-4A: Close Period with Override** (Future Enhancement)
  - System Administrator can override incomplete checklist
  - Extra confirmation required: "Override closure validation?"
  - Activity log records override with admin user and reason

**Exception Flows**:
- **Exc-4A: Incomplete Checklist Tasks**
  - Validation fails at Step 5
  - System displays error dialog:
    ```
    Title: "Cannot Close Period"
    Message: "The following required tasks are not completed:
    - [Task Name 1]
    - [Task Name 2]

    Please complete all tasks before closing the period."

    Action: [OK]
    ```
  - User remains on period detail page
  - Period status unchanged

- **Exc-4B: Period Status Not "Closing"**
  - Validation fails at Step 2
  - System displays error: "Period cannot be closed. Current status: [status]. Only periods in 'Closing' status can be closed."
  - User remains on page, button disabled

- **Exc-4C: Permission Denied**
  - Validation fails at Step 4
  - System returns 403 Forbidden
  - Error message: "You do not have permission to close periods. Required permission: Inventory.PeriodEnd.Close (Inventory Manager or higher)"

- **Exc-4D: Database Transaction Failure**
  - COMMIT fails at Step 8
  - System executes ROLLBACK
  - System displays error: "Period closure failed due to system error. Please try again. If problem persists, contact support."
  - Activity log records failed closure attempt
  - Period status unchanged

**Business Rules Applied**: BR-PE-003, BR-PE-006, BR-PE-007, BR-PE-023, BR-PE-026

**Performance Requirements**: Closure operation completes within 3 seconds

**Acceptance Criteria**:
- All checklist tasks validated before closure
- Confirmation dialog shows accurate summary statistics
- Closure operation is atomic (all succeed or all fail)
- Activity log captures closure event with full context
- Success message provides clear confirmation
- "Complete Period End" button hidden after closure
- Period immediately locked from new transactions

---

### UC-PE-005: Re-open Closed Period
**Description**: Financial Manager or System Administrator re-opens the most recent closed period to make corrections, maintaining full audit trail.

**Actor**: Financial Manager, System Administrator

**Priority**: High

**Frequency**: Rarely (< 5% of periods, ideally none)

**Preconditions**:
- User is authenticated
- User has "Inventory.PeriodEnd.Reopen" permission (Financial Manager or System Administrator)
- Period status = "Closed"
- Period is most recent closed period (cannot re-open historical periods)
- Next period (if exists) is not closed

**Postconditions**:
- Period status updated to "Reopened"
- Re-open reason, reopened_by, reopened_at fields populated
- Original closure information preserved in original_completed_by, original_completed_at
- Activity log entry recorded
- Email notification sent to Financial Controller and System Administrators
- Transactions can be posted to period again

**Main Flow**:
1. User navigates to closed period detail page (UC-PE-002)
2. System verifies period status = "Closed"
3. System displays "Re-open Period" button (if user authorized)
4. User clicks "Re-open Period" button
5. System validates re-open is allowed:
   - Query database to find most recent closed period
   - Verify selected period matches most recent closed period
   - If next period exists (period_id > current), verify its status != 'Closed'
   - Validation fails → Go to Exc-5A or Exc-5B
6. System displays re-open dialog:
   ```
   Title: "Re-open Period"
   Message: "You are about to re-open period PE-YYYY-MM (Month YYYY).

   Warning: This action will:
   - Allow transactions to be posted to this period again
   - Require re-closure after corrections are made
   - Send notification to Financial Controller and administrators
   - Create permanent audit trail entry

   Reason for Re-open (required, minimum 100 characters):
   [Text area, character counter showing: 0/100]

   Expected Corrections (optional):
   [Text area for describing planned changes]

   Actions: [Cancel] [Confirm Re-open]
   ```
7. User enters reason (minimum 100 characters) and clicks "Confirm Re-open"
8. System validates reason length ≥ 100 characters
9. System begins atomic transaction:
   - BEGIN TRANSACTION
   - UPDATE period_end:
     - status = 'Reopened'
     - reopened_by = :user_id
     - reopened_at = NOW()
     - reopen_reason = :reason
     - original_completed_by = current_completed_by (preserve)
     - original_completed_at = current_completed_at (preserve)
     - completed_by = NULL (clear)
     - completed_at = NULL (clear)
   - INSERT into period_activity: action='Reopen', user, timestamp, reason, from_status='Closed', to_status='Reopened'
   - COMMIT TRANSACTION
10. System triggers notification workflow (UC-PE-105):
    - Send email to Financial Controller: "Period PE-YYYY-MM has been re-opened by [user_name]. Reason: [reason]"
    - Send email to System Administrators with same content
11. System displays success message: "Period re-opened successfully. Transactions can now be posted to period PE-YYYY-MM. Remember to re-close the period after corrections are complete."
12. System refreshes period detail page showing updated status "Reopened"
13. Checklist tasks remain in "Completed" status (can be marked incomplete if needed)
14. "Complete Period End" button visible again

**Alternative Flows**:
- **Alt-5A: Re-open with 2FA** (Future Enhancement)
  - For production environments, require 2-factor authentication
  - User enters 2FA code after providing reason
  - Proceed with re-open only after 2FA verification

**Exception Flows**:
- **Exc-5A: Not Most Recent Closed Period**
  - Validation fails at Step 5
  - System displays error:
    ```
    Title: "Cannot Re-open Period"
    Message: "Period PE-YYYY-MM is not the most recent closed period.
    Only the most recent closed period can be re-opened.

    Most recent closed period: PE-YYYY-MM (Month YYYY)

    Action: [OK]
    ```
  - User remains on page, button disabled

- **Exc-5B: Next Period Already Closed**
  - Validation fails at Step 5
  - System displays error:
    ```
    Title: "Cannot Re-open Period"
    Message: "Period PE-YYYY-MM cannot be re-opened because the next period (PE-YYYY-MM) is already closed.

    You must first re-open the next period before re-opening this one.

    Action: [OK]
    ```

- **Exc-5C: Reason Too Short**
  - Validation fails at Step 8
  - System displays inline error: "Reason must be at least 100 characters. Current: [X]/100"
  - User can continue editing reason
  - "Confirm Re-open" button disabled until requirement met

- **Exc-5D: Permission Denied**
  - Validation fails at Step 5
  - System returns 403 Forbidden
  - Error message: "You do not have permission to re-open periods. Required permission: Inventory.PeriodEnd.Reopen (Financial Manager or System Administrator)"

- **Exc-5E: Notification Failure**
  - Email send fails at Step 10
  - Re-open still succeeds (notification failure not critical)
  - System logs warning in activity log: "Period re-opened successfully but email notification failed"
  - System displays warning to user: "Period re-opened but email notification could not be sent. Please inform Financial Controller manually."

**Business Rules Applied**: BR-PE-007, BR-PE-008, BR-PE-009, BR-PE-010, BR-PE-026, BR-PE-028, BR-PE-030

**Performance Requirements**: Re-open operation completes within 3 seconds (excluding email send)

**Acceptance Criteria**:
- Only most recent closed period can be re-opened
- Reason minimum length enforced (100 characters)
- Original closure information preserved
- Email notification sent to Financial Controller and admins
- Activity log captures full re-open context
- Re-opened period allows transaction posting immediately

---

### UC-PE-006: Mark Task Complete
**Description**: User marks a checklist task as completed, recording completion timestamp and user.

**Actor**: Inventory Coordinator (basic tasks), Inventory Manager, Financial Manager, System Administrator

**Priority**: High

**Frequency**: Multiple times per period (once per task)

**Preconditions**:
- User is authenticated
- User has "Inventory.PeriodEnd.UpdateTasks" permission
- Period status = "Open", "Closing", or "Reopened"
- Task status = "Pending"

**Postconditions**:
- Task status updated to "Completed"
- Completed_by, completed_at fields populated
- Activity log entry recorded
- Period status may auto-transition to "Closing" if first task completed

**Main Flow**:
1. User navigates to period detail page (UC-PE-002)
2. System displays checklist with pending tasks
3. User clicks checkbox next to pending task (e.g., "Complete Physical Count")
4. System displays confirmation prompt (optional, configurable):
   ```
   "Mark task '[Task Name]' as complete?

   This action will record you as the completing user with current timestamp.

   Actions: [Cancel] [Confirm]
   ```
5. User clicks "Confirm"
6. System validates:
   - User has permission to complete this task type
   - Period status is "Open", "Closing", or "Reopened"
   - Task is currently "Pending" (prevent duplicate completion)
7. System updates task:
   - UPDATE period_task: status = 'Completed', completed_by = :user_id, completed_at = NOW()
8. System checks if this is first task completed and period status = "Open":
   - If yes: UPDATE period_end: status = 'Closing'
   - Trigger UC-PE-103 (Enforce Single Closing Period)
9. System logs activity entry:
   - Action: "TaskComplete"
   - Task name, user, timestamp
   - Details: "Task '[Task Name]' marked complete"
10. System refreshes checklist showing:
    - Task status changed to "Completed" with green checkmark
    - Completed by: [User Name]
    - Completed at: [Timestamp formatted]
    - Green background highlight on completed task row
11. System updates task progress indicator: "X of Y tasks completed"

**Alternative Flows**:
- **Alt-6A: Task Completion Triggers Automated Validation** (Future Enhancement)
  - For tasks with automated validation criteria (e.g., "Complete Physical Count")
  - System queries Physical Count module to verify all scheduled counts committed
  - If validation passes: Task marked complete automatically
  - If validation fails: System displays error with details

**Exception Flows**:
- **Exc-6A: Task Already Completed**
  - Validation fails at Step 6 (race condition: another user completed task)
  - System displays info message: "Task '[Task Name]' has already been completed by [User Name] at [Timestamp]"
  - Checklist refreshes showing current state

- **Exc-6B: Period Closed**
  - Validation fails at Step 6
  - System displays error: "Cannot modify tasks. Period is closed."
  - Checkbox disabled

- **Exc-6C: Permission Denied**
  - Validation fails at Step 6
  - System returns 403 Forbidden
  - Error message: "You do not have permission to complete this task type. Contact supervisor."

- **Exc-6D: Period Status Transition Failed** (Step 8)
  - Period status update to "In Progress" fails
  - System logs error but task completion still succeeds
  - System displays warning: "Task marked complete but period status update failed. Please refresh page."

**Business Rules Applied**: BR-PE-012, BR-PE-014, BR-PE-015, BR-PE-016, BR-PE-026

**Performance Requirements**: Task completion updates within 500ms

**Acceptance Criteria**:
- Task status updates immediately in UI
- Completed user and timestamp recorded
- Cannot unmark task once completed (immutable)
- Period auto-transitions to "Closing" on first task completion
- Activity log captures task completion event
- Task progress indicator updates correctly

---

### UC-PE-007: View Period Adjustments
**Description**: User views all inventory adjustments created during a period to review variance impact and adjustment reasons.

**Actor**: Inventory Manager, Financial Manager, System Administrator

**Priority**: Medium

**Frequency**: Multiple times per period (during reconciliation and variance review)

**Preconditions**:
- User is authenticated
- User has "Inventory.PeriodEnd.View" and "Inventory.Adjustments.View" permissions
- Period exists

**Postconditions**:
- Adjustments list displayed filtered by period date range
- User can navigate to individual adjustment details

**Main Flow**:
1. User navigates to period detail page (UC-PE-002)
2. User clicks "Adjustments" tab (below period information and checklist cards)
3. System queries adjustments:
   ```sql
   SELECT * FROM inventory_adjustments
   WHERE transaction_date BETWEEN :period_start_date AND :period_end_date
   ORDER BY transaction_date DESC, created_date DESC
   ```
4. System displays adjustments table with columns:
   - **Adjustment ID** (clickable link)
   - **Type**: Physical Count Variance, Damaged Goods Write-off, Obsolescence, System Correction, Initial Balance
   - **Amount**: Currency formatted with 2 decimals
     - Positive amounts: Green text, prefixed with "+"
     - Negative amounts: Red text, prefixed with "-"
   - **Reason**: Truncated to 50 chars with "..." (hover shows full text)
   - **Status**: Badge (Pending/Approved/Posted)
   - **Created By**: User name
   - **Created At**: Date formatted (e.g., "Jan 15, 2024 10:30 AM")
5. System displays summary statistics above table:
   - Total Adjustments: [count]
   - Positive Adjustments: [count] (+[total amount])
   - Negative Adjustments: [count] (-[total amount])
   - Net Adjustment: [total amount] (green if positive, red if negative)
6. User can:
   - Sort by any column (click column header)
   - Filter by Type (dropdown selector)
   - Filter by Status (dropdown selector)
   - Search by Adjustment ID or reason text (search box)
7. User clicks adjustment row to navigate to adjustment detail page (opens in new tab)

**Alternative Flows**:
- **Alt-7A: No Adjustments in Period**
  - Query returns no results at Step 3
  - System displays empty state message:
    ```
    "No adjustments made during this period.

    This is expected for periods without physical counts or variances."
    ```
  - Summary statistics show: "Total Adjustments: 0"

- **Alt-7B: Export Adjustments** (Future Enhancement)
  - User clicks "Export" button above table
  - System generates Excel file with all adjustments (respecting current filters)
  - File downloads with name: "Period_PE-YYYY-MM_Adjustments_[timestamp].xlsx"

**Exception Flows**:
- **Exc-7A: Permission Denied**
  - User lacks "Inventory.Adjustments.View" permission
  - System displays warning in Adjustments tab: "You do not have permission to view adjustments. Contact administrator."
  - Table replaced with permission error message

**Business Rules Applied**: None specific to this use case (relies on Inventory Adjustments module rules)

**Performance Requirements**: Adjustments list displays within 1 second for up to 500 adjustments

**Acceptance Criteria**:
- Adjustments filtered correctly by period date range
- Amount color-coding clearly distinguishes positive/negative
- Summary statistics accurate
- Sort and filter work without page reload
- Navigation to adjustment detail preserves period context (back button returns to period detail)

---

### UC-PE-008: Update Period Notes
**Description**: User adds or edits notes on a period for documentation and context.

**Actor**: Inventory Manager, Financial Manager, System Administrator

**Priority**: Low

**Frequency**: As needed (typically once or twice per period)

**Preconditions**:
- User is authenticated
- User has "Inventory.PeriodEnd.Update" permission (Inventory Manager or higher)
- Period exists

**Postconditions**:
- Period notes updated in database
- Activity log entry recorded for notes change
- Updated notes visible immediately

**Main Flow**:
1. User navigates to period detail page (UC-PE-002)
2. System displays period information card with "Notes" field (text area, 1000 char limit)
3. User clicks in notes text area to edit
4. User types or modifies notes (e.g., "Physical count delayed due to inventory system migration. Extra week allocated.")
5. System displays character counter below text area: "[X]/1000 characters"
6. User clicks outside text area or presses "Save" button
7. System validates notes length ≤ 1000 characters
8. System updates period record:
   - UPDATE period_end: notes = :new_notes, modified_by = :user_id, modified_date = NOW()
9. System logs activity entry:
   - Action: "NotesUpdate"
   - User, timestamp
   - Field changes: old_value, new_value
10. System displays subtle success indicator (e.g., green checkmark appears briefly)
11. Notes saved and visible immediately

**Alternative Flows**:
- **Alt-8A: Auto-Save** (Future Enhancement)
  - System auto-saves notes every 30 seconds while user typing
  - No explicit "Save" button needed
  - Activity log records auto-save only if notes actually changed

**Exception Flows**:
- **Exc-8A: Notes Too Long**
  - Validation fails at Step 7
  - System displays error: "Notes cannot exceed 1000 characters. Current: [X]/1000. Please shorten your notes."
  - Text area border turns red
  - User must shorten notes to save

- **Exc-8B: Permission Denied**
  - User clicks in notes text area but lacks permission
  - Text area remains read-only (cannot edit)
  - Tooltip displays: "You do not have permission to edit period notes"

**Business Rules Applied**: BR-PE-026 (activity logging)

**Performance Requirements**: Notes save within 500ms

**Acceptance Criteria**:
- Notes text area clearly editable (for authorized users)
- Character counter updates in real-time
- Validation prevents exceeding length limit
- Activity log captures old and new values
- Save confirmation provides user feedback

---

### UC-PE-009: Cancel Period
**Description**: System Administrator cancels a period that should not proceed (e.g., created in error), marking it as "Void" for audit trail.

**Actor**: System Administrator ONLY

**Priority**: Medium

**Frequency**: Rare (only for error correction)

**Preconditions**:
- User is authenticated
- User has "Inventory.PeriodEnd.Cancel" permission (System Administrator only)
- Period status = "Open" or "Closing" (cannot cancel "Closed" periods)
- No transactions have been posted to the period

**Postconditions**:
- Period is deleted or marked as cancelled
- Cancellation reason recorded
- Activity log entry captured
- Cancelled periods are removed from active management

**Main Flow**:
1. User navigates to period detail page (UC-PE-002)
2. System verifies period status = "Open" or "Closing"
3. System displays "Cancel Period End" button (visible only to System Administrator)
4. User clicks "Cancel Period End" button
5. System validates cancellation is allowed:
   - Check no transactions posted: `SELECT COUNT(*) FROM stock_transactions WHERE period_id = :id`
   - If transactions exist → Go to Exc-9A
6. System displays cancellation dialog:
   ```
   Title: "Cancel Period"
   Message: "You are about to cancel period PE-YYYY-MM (Month YYYY).

   Warning: This action will:
   - Delete or cancel the period (cannot be undone)
   - Prevent any further modifications to this period
   - Remove it from active period management
   - Create permanent audit trail entry

   This should only be done if the period was created in error.

   Reason for Cancellation (required, minimum 50 characters):
   [Text area, character counter showing: 0/50]

   Actions: [Cancel] [Confirm Cancel]
   ```
7. User enters reason (minimum 50 characters) and clicks "Confirm Cancel"
8. System validates reason length ≥ 50 characters
9. System begins atomic transaction:
   - BEGIN TRANSACTION
   - DELETE period_end record OR mark as cancelled
   - INSERT into period_activity: action='Cancel', user, timestamp, reason, from_status
   - COMMIT TRANSACTION
10. System displays success message: "Period cancelled. Period PE-YYYY-MM will no longer appear in active period lists."
11. System redirects user to period list page (UC-PE-001)

**Alternative Flows**: None

**Exception Flows**:
- **Exc-9A: Transactions Posted to Period**
  - Validation fails at Step 5
  - System displays error:
    ```
    Title: "Cannot Cancel Period"
    Message: "Period PE-YYYY-MM cannot be cancelled because transactions have been posted to it.

    Transaction Count: [count]

    Periods with transactions cannot be voided for audit compliance.
    If you need to close this period without completing the checklist, use the 'Override Close' function instead.

    Action: [OK]
    ```
  - User remains on page, cancellation aborted

- **Exc-9B: Reason Too Short**
  - Validation fails at Step 8
  - System displays inline error: "Reason must be at least 50 characters. Current: [X]/50"
  - "Confirm Cancel" button disabled until requirement met

- **Exc-9C: Period Already Closed**
  - Validation fails at Step 2
  - System displays error: "Cannot cancel period. Status is 'Closed'. Only Open or Closing periods can be cancelled."
  - Button disabled

- **Exc-9D: Permission Denied**
  - User is not System Administrator
  - "Cancel Period End" button not displayed
  - If user attempts direct API call: 403 Forbidden with error "Only System Administrators can cancel periods"

**Business Rules Applied**: BR-PE-010, BR-PE-011, BR-PE-026

**Performance Requirements**: Cancellation completes within 2 seconds

**Acceptance Criteria**:
- Only System Administrator can cancel periods
- Validation prevents cancellation if transactions exist
- Reason requirement enforced (50 characters minimum)
- Cancellation is permanent (cannot be undone)
- Activity log captures full cancellation context

---

### UC-PE-010: Export Period Data
**Description**: User exports period information, tasks, and adjustments to Excel for offline analysis and reporting.

**Actor**: Inventory Coordinator, Inventory Manager, Financial Manager, System Administrator

**Priority**: Low

**Frequency**: As needed (typically monthly for reporting)

**Preconditions**:
- User is authenticated
- User has "Inventory.PeriodEnd.View" permission
- Period exists

**Postconditions**:
- Excel file generated with period data
- File downloaded to user's computer
- Audit log entry recorded for export (for compliance)

**Main Flow**:
1. User navigates to period detail page (UC-PE-002)
2. User clicks "Export" button (icon: download symbol) in header
3. System displays export options dialog:
   ```
   Title: "Export Period Data"

   Select data to export:
   [✓] Period Information (ID, name, dates, status, completion info)
   [✓] Checklist Tasks (with completion status and users)
   [✓] Adjustments (all adjustments during period)
   [ ] Activity Log (all period actions) - Optional

   Format: [Excel (.xlsx)] (dropdown: Excel, PDF - future)

   Actions: [Cancel] [Export]
   ```
4. User selects desired data sections and clicks "Export"
5. System generates Excel file with multiple worksheets:
   - **Worksheet 1: Period Summary**
     - Period ID, Period Name, Start Date, End Date, Status
     - Completed By, Completed At
     - Notes
     - Total Adjustments count, Net Adjustment amount
   - **Worksheet 2: Checklist Tasks**
     - Task Name, Status, Completed By, Completed At
   - **Worksheet 3: Adjustments** (if selected)
     - All adjustment columns from UC-PE-007
   - **Worksheet 4: Activity Log** (if selected)
     - Action Type, Date/Time, User, Details
6. System applies Excel formatting:
   - Headers bold with background color
   - Currency fields formatted as currency
   - Date fields formatted for user locale
   - Status cells color-coded matching UI badges
7. System generates filename: "Period_PE-YYYY-MM_[Month-YYYY]_Export_[timestamp].xlsx"
8. System triggers browser download of file
9. System logs export action in activity log:
   - Action: "Export"
   - User, timestamp, sections exported
10. System displays success message: "Period data exported successfully"

**Alternative Flows**:
- **Alt-10A: Export to PDF** (Future Enhancement)
  - User selects "PDF" format from dropdown
  - System generates formatted PDF report
  - Filename: "Period_PE-YYYY-MM_[Month-YYYY]_Export_[timestamp].pdf"

- **Alt-10B: Export Multiple Periods** (Future Enhancement)
  - From period list page, user selects multiple periods (checkboxes)
  - User clicks "Export Selected"
  - System generates combined Excel file with one worksheet per period

**Exception Flows**:
- **Exc-10A: No Data Selected**
  - User unchecks all data sections
  - "Export" button disabled
  - Message: "Please select at least one data section to export"

- **Exc-10B: Export Generation Failure**
  - File generation fails at Step 5 (e.g., memory issue for very large dataset)
  - System displays error: "Export failed due to system error. Please try exporting fewer sections or contact support."
  - Activity log records failed export attempt

- **Exc-10C: Permission Denied**
  - User lacks export permission (future: separate "Inventory.PeriodEnd.Export" permission)
  - Button disabled with tooltip: "You do not have permission to export period data"

**Business Rules Applied**: BR-PE-026 (activity logging for compliance)

**Performance Requirements**: Export generation completes within 5 seconds for up to 500 adjustments

**Acceptance Criteria**:
- Excel file structured with clear worksheets
- All data formatted appropriately (currency, dates, status colors)
- Filename clearly identifies period and export timestamp
- Export action logged for audit purposes
- File downloads successfully in all major browsers
- Large datasets (>1000 adjustments) handled without timeout

---

## System Use Cases

### UC-PE-101: Validate Period Closure
**Description**: System automatically validates all requirements are met before allowing period closure.

**Trigger**: User initiates period closure (UC-PE-004)

**Priority**: Critical

**Preconditions**:
- Period status = "Closing"
- User has Close permission

**Postconditions**:
- Validation result returned (pass/fail)
- If fail: Error messages provided with specific issues
- If pass: Closure proceeds

**Main Flow**:
1. System receives period closure request from UC-PE-004 Step 5
2. System performs validation checks in sequence:

   **Check 1: All Checklist Tasks Completed**
   - Query: `SELECT COUNT(*) FROM period_task WHERE period_end_id = :id AND status != 'completed'`
   - If count > 0: Validation fails
   - Error: "The following tasks are not completed: [list task names]"

   **Check 2: Physical Count Completion** (Integration with Physical Count module)
   - Call UC-PE-201: Check Physical Count Completion
   - If physical counts scheduled but not committed: Validation fails
   - Error: "Physical count [count_id] is not committed. Please complete all scheduled counts."

   **Check 3: Transaction Completeness** (Future Enhancement)
   - Call UC-PE-203: Validate Transaction Completeness
   - Verify all GRNs, Issues, Adjustments for period are posted (not draft)
   - If uncommitted transactions exist: Warning (not blocking)
   - Warning: "[count] transactions in draft status. Consider posting before period close."

   **Check 4: Adjustment Review** (Future Enhancement)
   - Call UC-PE-202: Retrieve Period Adjustments
   - Verify all adjustments are approved (not pending)
   - If pending adjustments exist: Warning (not blocking)
   - Warning: "[count] adjustments pending approval. Review before period close."

3. System compiles validation results:
   - If any CRITICAL check fails: Return failure with error list
   - If all checks pass: Return success with any warnings

4. System returns validation result to UC-PE-004

**Alternative Flows**:
- **Alt-101A: Administrator Override** (Future Enhancement)
  - If user is System Administrator
  - Validation can be overridden for non-critical checks
  - Override logged in activity log with reason

**Exception Flows**:
- **Exc-101A: Integration Service Unavailable**
  - Physical Count module unreachable at Step 2
  - System logs warning but allows closure to proceed (graceful degradation)
  - Warning message: "Could not verify physical count completion (service unavailable). Proceed with caution."

**Business Rules Applied**: BR-PE-006, BR-PE-014, BR-PE-015

**Performance Requirements**: Validation completes within 2 seconds

---

### UC-PE-102: Log Activity Entry
**Description**: System automatically logs all period-related actions to immutable activity log for audit trail.

**Trigger**: Any period action (Create, StatusChange, TaskComplete, Close, Reopen, Cancel, NotesUpdate)

**Priority**: Critical

**Preconditions**:
- User is authenticated
- Action is being performed on a period

**Postconditions**:
- Activity log entry created in database
- Entry is immutable (cannot be modified or deleted)

**Main Flow**:
1. System detects period action being performed
2. System captures action context:
   - Action type (Create, StatusChange, TaskComplete, Close, Reopen, Cancel, NotesUpdate)
   - User ID, user name (denormalized for audit)
   - Timestamp (high precision with timezone)
   - IP address (from HTTP request)
   - User agent (browser info)
   - Period ID
3. System captures action-specific details:
   - For StatusChange: from_status, to_status
   - For TaskComplete: task_name
   - For Reopen/Cancel: reason
   - For NotesUpdate: old_value, new_value
4. System inserts activity log entry:
   ```sql
   INSERT INTO period_activity (
     id, period_end_id, action_type, action_date, action_by, action_by_name,
     ip_address, user_agent, from_status, to_status, task_name, reason, notes, field_changes
   ) VALUES (...)
   ```
5. System verifies insert succeeded
6. If insert fails: System logs critical error (activity logging failure is serious)

**Alternative Flows**: None (this is critical path)

**Exception Flows**:
- **Exc-102A: Insert Failure**
  - Database insert fails at Step 4 (e.g., connection loss, constraint violation)
  - System logs critical error to application log
  - System attempts retry (3 attempts with exponential backoff)
  - If all retries fail: System displays error to user and rolls back entire action
  - Error message: "Action failed due to audit logging error. No changes have been made. Please try again."

**Business Rules Applied**: BR-PE-026, BR-PE-027, BR-PE-029

**Performance Requirements**: Log entry creation completes within 100ms

---

### UC-PE-103: Enforce Single Closing Period
**Description**: System ensures only one period can be in "Closing" status at any time across the entire system.

**Trigger**: Period status transitions to "Closing"

**Priority**: High

**Preconditions**:
- Period status change being requested

**Postconditions**:
- Only one period has status "Closing"
- All other periods are "Open", "Closed", or "Reopened"

**Main Flow**:
1. System detects period status changing to "Closing" (from UC-PE-006 Step 8 when first task completed)
2. System queries database for existing "Closing" periods:
   ```sql
   SELECT id, period_id, period_name FROM period_end
   WHERE status = 'Closing' AND id != :current_period_id
   ```
3. If query returns results (another period is already "Closing"):
   - Validation fails
   - Return error to calling use case
4. If query returns no results (no other "Closing" period):
   - Validation passes
   - Allow status change to proceed

**Alternative Flows**: None

**Exception Flows**:
- **Exc-103A: Multiple Closing Periods Found**
  - Query returns multiple results at Step 2 (data integrity issue)
  - System logs critical error: "Data integrity violation: Multiple Closing periods detected"
  - System displays error: "System error: Multiple periods in closing state. Please contact administrator immediately."
  - System halts operation

**Business Rules Applied**: BR-PE-004

**Performance Requirements**: Validation completes within 200ms

---

### UC-PE-104: Prevent Transaction Posting to Closed Period
**Description**: System prevents inventory transactions from being posted to closed periods, maintaining period boundary integrity.

**Trigger**: User attempts to create/post inventory transaction (GRN, Issue, Adjustment, Transfer)

**Priority**: Critical

**Preconditions**:
- User creating inventory transaction
- Transaction has transaction_date field

**Postconditions**:
- Transaction allowed ONLY if posting to Open or In Progress period
- Transaction rejected if posting to Closed or Void period

**Main Flow**:
1. System detects transaction being created/posted (from Stock Transactions modules)
2. System extracts transaction_date from transaction
3. System determines period for transaction date:
   - Calculate period_id from transaction_date (e.g., 2024-01-15 → PE-2024-01)
   - Query: `SELECT status FROM period_end WHERE period_id = :calculated_period_id`
4. System validates period status:
   - If status = 'Open', 'Closing', or 'Reopened': Validation passes → Allow transaction
   - If status = 'Closed': Validation fails → Reject transaction
   - If period not found (no period exists for that month): Validation fails → Reject transaction
5. System returns validation result to calling transaction module

**Alternative Flows**:
- **Alt-104A: Administrator Override** (Future Enhancement)
  - System Administrator can override closed period check
  - Requires explicit confirmation and reason
  - Override logged in activity log for both period and transaction

**Exception Flows**:
- **Exc-104A: Transaction Date Outside All Periods**
  - Period not found at Step 3
  - System displays error: "Cannot post transaction. Transaction date [date] does not fall within any defined period. Please create the period first."

- **Exc-104B: Period Closed**
  - Status is 'Closed' at Step 4
  - System displays error:
    ```
    "Cannot post transaction to closed period.

    Transaction Date: [date]
    Period: PE-YYYY-MM ([Month YYYY])
    Period Status: Closed (closed on [date] by [user])

    To post this transaction:
    1. Contact Financial Manager to re-open the period, or
    2. Adjust transaction date to current open period

    Note: Historical transactions to closed periods are not allowed for audit compliance."
    ```
  - Transaction creation/posting fails
  - No database changes made

**Business Rules Applied**: BR-PE-022, BR-PE-023, BR-PE-024, BR-PE-025

**Performance Requirements**: Validation completes within 100ms

---

### UC-PE-105: Send Re-open Notification
**Description**: System sends email notification when a period is re-opened to inform financial oversight personnel.

**Trigger**: Period status changes to "Reopened" from "Closed" (re-open action)

**Priority**: High

**Preconditions**:
- Period has been re-opened (UC-PE-005 Step 9)
- Email service is configured

**Postconditions**:
- Email sent to Financial Controller and System Administrators
- Notification logged in activity log

**Main Flow**:
1. System detects period re-open completion (from UC-PE-005 Step 10)
2. System retrieves email recipients:
   - Query users with role 'Financial Controller': Get email addresses
   - Query users with role 'System Administrator': Get email addresses
3. System composes email:
   ```
   Subject: [Action Required] Period PE-YYYY-MM Has Been Re-opened

   To: Financial Controller, System Administrators

   A closed accounting period has been re-opened and requires your attention.

   Period Details:
   - Period ID: PE-YYYY-MM
   - Period Name: [Month YYYY]
   - Date Range: [start date] to [end date]

   Re-open Information:
   - Re-opened By: [User Name] ([user_email])
   - Re-opened At: [timestamp]
   - Reason: [reason provided by user]

   Original Closure:
   - Originally Closed By: [original_user]
   - Originally Closed At: [original_timestamp]

   Action Required:
   - Monitor transactions posted to this period
   - Verify corrections are completed promptly
   - Ensure period is re-closed within 3 business days

   View Period: [Link to period detail page]

   This is an automated notification from the Inventory Management System.
   ```
4. System sends email via SMTP service
5. System waits for send confirmation (timeout: 10 seconds)
6. If send succeeds:
   - System logs activity: "Re-open notification sent to [recipient count] recipients"
   - Return success to UC-PE-005
7. If send fails:
   - System logs warning: "Re-open notification send failed"
   - Return failure to UC-PE-005 (caller handles failure gracefully)

**Alternative Flows**:
- **Alt-105A: No Recipients Found**
  - Query returns no Financial Controller or System Admin users
  - System logs warning: "Cannot send re-open notification: No recipients found with required roles"
  - System displays warning to user: "Period re-opened successfully but notification could not be sent (no recipients configured). Please inform Financial Controller manually."

**Exception Flows**:
- **Exc-105A: Email Service Unavailable**
  - SMTP connection fails at Step 4
  - System logs warning with error details
  - System does NOT fail the re-open operation (notification is nice-to-have, not critical)
  - Return failure status to UC-PE-005 Step 10 (caller displays warning)

- **Exc-105B: Send Timeout**
  - Email send exceeds 10-second timeout
  - System logs warning: "Email send timeout"
  - Treat as failed send (Exception Exc-105A handling)

**Business Rules Applied**: BR-PE-028

**Performance Requirements**: Email send completes within 10 seconds (or times out gracefully)

---

## Integration Use Cases

### UC-PE-201: Check Physical Count Completion
**Description**: System validates that all scheduled physical counts for a period are committed before allowing period closure.

**Integration Point**: Physical Count Management module

**Priority**: High

**Preconditions**:
- Period has start_date and end_date
- Physical Count module is accessible

**Postconditions**:
- Validation result returned (all counts committed or not)
- If incomplete counts found: List of incomplete count IDs returned

**Main Flow**:
1. System receives validation request from UC-PE-101 Step 2
2. System queries Physical Count module database:
   ```sql
   SELECT id, count_date, location_id, status
   FROM physical_count
   WHERE count_date BETWEEN :period_start_date AND :period_end_date
     AND status != 'Committed'
   ORDER BY count_date, location_id
   ```
3. If query returns results (uncommitted counts exist):
   - Validation fails
   - System compiles list of incomplete counts with details
   - Return failure with error message: "Physical counts not completed: [list count IDs, dates, locations]"
4. If query returns no results (all counts committed or no counts scheduled):
   - Validation passes
   - Return success

**Alternative Flows**:
- **Alt-201A: No Physical Counts Scheduled**
  - Query returns no results (counts committed or none exist)
  - This is acceptable - not all periods require physical counts
  - Validation passes

**Exception Flows**:
- **Exc-201A: Physical Count Module Unreachable**
  - Database query fails (connection error, table not found)
  - System logs error: "Physical Count integration failed: [error details]"
  - Return warning (not blocking failure) to UC-PE-101
  - Warning message: "Could not verify physical count completion (module unavailable). Please manually verify all scheduled counts are completed before closing period."

**Business Rules Applied**: BR-PE-014 (checklist task validation)

**Performance Requirements**: Validation query completes within 500ms

---

### UC-PE-202: Retrieve Period Adjustments
**Description**: System retrieves all inventory adjustments created during a period for display and review.

**Integration Point**: Inventory Adjustments module

**Priority**: High

**Preconditions**:
- Period has start_date and end_date
- Inventory Adjustments module is accessible

**Postconditions**:
- List of adjustments returned
- Adjustments include all required fields for display (ID, Type, Amount, Reason, Status, Created By, Created At)

**Main Flow**:
1. System receives request from UC-PE-007 Step 3 or UC-PE-101 Check 4
2. System queries Inventory Adjustments database:
   ```sql
   SELECT
     a.id,
     a.transaction_type as type,
     SUM(ad.qty * ad.unit_cost) as amount,
     a.reason,
     a.status,
     u.name as created_by,
     a.created_date as created_at
   FROM inventory_adjustment a
   INNER JOIN inventory_adjustment_detail ad ON a.id = ad.adjustment_id
   INNER JOIN tb_user u ON a.created_by = u.id
   WHERE a.transaction_date BETWEEN :period_start_date AND :period_end_date
     AND a.deleted_at IS NULL
   GROUP BY a.id, a.transaction_type, a.reason, a.status, u.name, a.created_date
   ORDER BY a.transaction_date DESC, a.created_date DESC
   ```
3. System calculates summary statistics:
   - Total adjustments count
   - Positive adjustments count and total amount
   - Negative adjustments count and total amount
   - Net adjustment amount
4. System returns adjustments list and summary to calling use case

**Alternative Flows**:
- **Alt-202A: No Adjustments in Period**
  - Query returns no results
  - Return empty list with summary showing zeros
  - Calling use case handles empty state display

**Exception Flows**:
- **Exc-202A: Adjustments Module Unreachable**
  - Database query fails (connection error, table not found)
  - System logs error: "Adjustments integration failed: [error details]"
  - Return empty list with error flag to calling use case
  - UC-PE-007: Display error message in Adjustments tab
  - UC-PE-101: Skip adjustment review check (warning only)

**Business Rules Applied**: None specific (relies on Inventory Adjustments module rules)

**Performance Requirements**: Query completes within 1 second for up to 500 adjustments

---

### UC-PE-203: Validate Transaction Completeness
**Description**: System validates that all inventory transactions for a period are posted (not in draft status) before allowing period closure.

**Integration Point**: Stock Transactions modules (GRN, Issues, Transfers, Adjustments)

**Priority**: High (Future Enhancement)

**Preconditions**:
- Period has start_date and end_date
- Stock Transaction modules are accessible

**Postconditions**:
- Validation result returned (all transactions posted or not)
- If draft transactions found: List of draft transaction IDs and types returned

**Main Flow**:
1. System receives validation request from UC-PE-101 Step 2 Check 3
2. System queries all transaction types:

   **GRN Transactions**:
   ```sql
   SELECT 'GRN' as type, id, ref_no, status
   FROM stock_in_transaction
   WHERE date BETWEEN :period_start_date AND :period_end_date
     AND status = 'Saved'
   ```

   **Issue Transactions**:
   ```sql
   SELECT 'ISSUE' as type, id, ref_no, status
   FROM store_issue
   WHERE issue_date BETWEEN :period_start_date AND :period_end_date
     AND status = 'Saved'
   ```

   **Transfer Transactions**:
   ```sql
   SELECT 'TRANSFER' as type, id, ref_no, status
   FROM inventory_transfer
   WHERE transfer_date BETWEEN :period_start_date AND :period_end_date
     AND status IN ('Draft', 'Pending')
   ```

   **Adjustment Transactions**:
   ```sql
   SELECT 'ADJUSTMENT' as type, id, ref_no, status
   FROM inventory_adjustment
   WHERE transaction_date BETWEEN :period_start_date AND :period_end_date
     AND status = 'Draft'
   ```

3. System combines results from all transaction type queries
4. If any draft/uncommitted transactions found:
   - Validation returns warning (not blocking error)
   - Compile list: "[count] transactions in draft status: [list IDs and types]"
   - Return warning to UC-PE-101
5. If no draft transactions found:
   - Validation passes
   - Return success

**Alternative Flows**: None

**Exception Flows**:
- **Exc-203A: Transaction Module Unreachable**
  - One or more transaction module queries fail
  - System logs error: "Transaction completeness check failed for [module]: [error]"
  - Skip this validation check (return warning)
  - Warning: "Could not verify transaction completeness. Please manually check all transactions are posted."

**Business Rules Applied**: BR-PE-014, BR-PE-015 (all transactions should be posted before period close)

**Performance Requirements**: All queries complete within 1 second combined

---

## Appendix

### Use Case Relationships

**Primary Workflows**:
1. **Monthly Period Close Workflow**: UC-PE-003 (Create) → UC-PE-006 (Complete 11 tasks) → UC-PE-004 (Close) → UC-PE-101 (validation)
2. **Period Re-open Workflow**: UC-PE-005 (Reopen) → UC-PE-105 (notification) → UC-PE-006 (corrections) → UC-PE-004 (re-close)
3. **Period Review Workflow**: UC-PE-001 → UC-PE-002 → UC-PE-007 (adjustments) → UC-PE-010 (export)

**Integration Touchpoints**:
- Physical Count → UC-PE-201
- Inventory Adjustments → UC-PE-202
- Stock Transactions → UC-PE-203, UC-PE-104

### Activity Log Action Types

All activity log entries use these standard action types:
- **Create**: Period creation
- **StatusChange**: Status transition (Open → Closing → Closed → Reopened)
- **TaskComplete**: Validation task marked complete (11 tasks)
- **Close**: Period closure finalization
- **Reopen**: Period re-opened from Closed status (changes to Reopened)
- **Cancel**: Period cancelled
- **NotesUpdate**: Period notes modified
- **Export**: Period data exported

### Permission Matrix

| Use Case | Coordinator | Manager | Financial | Admin |
|----------|------------|---------|-----------|-------|
| UC-PE-001: View List | ✅ | ✅ | ✅ | ✅ |
| UC-PE-002: View Detail | ✅ | ✅ | ✅ | ✅ |
| UC-PE-003: Create Period | ❌ | ✅ | ✅ | ✅ |
| UC-PE-004: Close Period | ❌ | ✅ | ✅ | ✅ |
| UC-PE-005: Re-open Period | ❌ | ❌ | ✅ | ✅ |
| UC-PE-006: Mark Task Complete | ✅ | ✅ | ✅ | ✅ |
| UC-PE-007: View Adjustments | ❌ | ✅ | ✅ | ✅ |
| UC-PE-008: Update Notes | ❌ | ✅ | ✅ | ✅ |
| UC-PE-009: Cancel Period | ❌ | ❌ | ❌ | ✅ |
| UC-PE-010: Export Data | ✅ | ✅ | ✅ | ✅ |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-11 | System | Initial version with 10 user use cases, 5 system use cases, 3 integration use cases |
| 1.1.0 | 2025-12-09 | Development Team | Updated status values (open, closing, closed, reopened), expanded validation checklist to 11 items |

---

**Document Control**:
- **Classification**: Internal Use
- **Review Required**: Yes
- **Approved By**: Pending
- **Last Review**: 2025-12-09
- **Next Review Date**: 2026-03-09
