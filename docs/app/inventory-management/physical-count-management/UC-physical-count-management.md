# Use Cases: Physical Count Management

**Module**: Inventory Management
**Sub-Module**: Physical Count Management
**Version**: 1.0.0
**Status**: IMPLEMENTED (Prototype with Mock Data)
**Last Updated**: 2025-12-09

---

## 1. Overview

This document defines use cases for the Physical Count Management module, enabling inventory verification through scheduled and ad-hoc physical counts.

---

## 2. Actors

| Actor | Description |
|-------|-------------|
| Counter | Staff member assigned to perform physical counting |
| Storekeeper | Location-level inventory manager who creates and monitors counts |
| Inventory Coordinator | Cross-location coordinator who assigns and manages counting teams |
| Inventory Supervisor | Senior staff who approves variances and cancels counts |
| Inventory Manager | Full access to all counting operations and analytics |
| Financial Controller | Reviews and finalizes counts, posts inventory adjustments |

---

## 3. Use Cases

### UC-PCM-001: View Physical Count Dashboard

**Primary Actor**: Inventory Manager
**Preconditions**: User has dashboard view permission
**Postconditions**: Dashboard displays current counting metrics

**Main Flow**:
1. User navigates to Physical Count Dashboard
2. System displays 5 KPI cards (Total Counts, Average Accuracy, Items Counted, Pending Approval, Total Variance)
3. System shows overdue counts alert section
4. System displays pending approval section
5. System lists active counts with progress indicators
6. System shows recently finalized counts
7. System presents quick action buttons for count creation
8. System displays upcoming scheduled counts
9. System shows statistics by count type and location

**Alternative Flows**:
- **A1**: No active counts - System displays empty state with create count prompt
- **A2**: Date range filter applied - System refreshes KPIs for selected period (7d, 30d, 90d, 365d)

---

### UC-PCM-002: View Physical Count List

**Primary Actor**: Storekeeper
**Preconditions**: User has list view permission
**Postconditions**: Count list displayed with applied filters

**Main Flow**:
1. User navigates to Physical Count List
2. System displays counts in default table view
3. User views status summary cards (draft, planning, pending, in-progress, completed, finalized, cancelled, on-hold)
4. User can toggle between table and grid view
5. User applies filters (status, type, location, department, supervisor, date range, priority, variance)
6. System updates list based on filters
7. User can sort by multiple columns
8. User searches by count number, location, or supervisor

**Alternative Flows**:
- **A1**: Grid view selected - System displays counts as cards with visual progress
- **A2**: No results match filters - System shows empty state

---

### UC-PCM-003: Create Physical Count (Wizard)

**Primary Actor**: Inventory Coordinator
**Preconditions**: User has create permission
**Postconditions**: New physical count created in draft status

**Main Flow**:
1. User initiates count creation wizard
2. **Step 1 - Count Type**: User selects count type:
   - Full Physical Count (all items)
   - Cycle Count (specific categories)
   - Annual Count (year-end)
   - Perpetual Inventory (continuous)
   - Partial Count (specific items/locations)
3. User sets priority level (low, medium, high, critical)
4. User configures approval threshold percentage
5. User proceeds to Step 2
6. **Step 2 - Assignment**: User selects:
   - Location (required)
   - Department (optional)
   - Zone (optional)
   - Supervisor (required)
   - Team members with roles (primary, secondary, verifier)
   - Scheduled date and due date
7. User proceeds to Step 3
8. **Step 3 - Scope Selection** (varies by type):
   - Full/Annual: All items auto-included
   - Cycle/Partial: Category-based selection
   - Perpetual: Manual item selection
9. User proceeds to Step 4
10. **Step 4 - Review**: User reviews all selections
11. User adds description, instructions, and notes
12. User confirms and creates count
13. System generates count number (PC-YYMMDD-XXXX)
14. System creates count in draft status

**Alternative Flows**:
- **A1**: Back navigation - System preserves entered data
- **A2**: Validation fails - System highlights missing required fields
- **A3**: Cancel wizard - System discards draft with confirmation

---

### UC-PCM-004: View Physical Count Details

**Primary Actor**: Count Supervisor
**Preconditions**: Physical count exists
**Postconditions**: Count details displayed

**Main Flow**:
1. User selects physical count from list
2. System displays count header (status, type, priority badges)
3. System shows progress bar with breakdown (approved, counted, variance, recount, pending)
4. System displays 5 summary cards (Total Items, Accuracy Rate, System Value, Counted Value, Variance Value)
5. User navigates between tabs:
   - **Overview**: Count details, location, supervisor, team size, dates, instructions, notes
   - **Items**: Searchable/filterable list of all items
   - **Variance**: Items with discrepancies and value impact
   - **Team**: Supervisor and counter information with roles
   - **History**: Activity timeline with timestamps
6. User performs status-appropriate actions

**Alternative Flows**:
- **A1**: Count is in-progress - System shows real-time progress updates

---

### UC-PCM-005: Perform Physical Counting

**Primary Actor**: Counter
**Preconditions**: Count is in "in-progress" status, counter is assigned
**Postconditions**: Items counted and recorded

**Main Flow**:
1. Counter opens counting interface for assigned count (mobile-first card-based UI)
2. System displays progress tracking (counted/total items with status breakdown)
3. Counter views items as count cards with filter tabs (All, Pending, Counted)
4. **For Each Item**:
   a. System displays item card with code, name, location, and system quantity (if blind count mode disabled)
   b. Counter enters counted quantity using input field or +/- buttons
   c. System calculates and displays variance in real-time
   d. **If unit conversion needed**: Counter opens Calculator dialog
      - Selects unit type (weight: kg/g/lb, volume: L/ml, count: pcs/dozen/case)
      - Enters values in different units
      - System calculates total in base unit
      - Counter uses calculated total
   e. **If variance exists**: Counter opens Notes & Evidence sheet
      - Selects variance reason (damage, theft, spoilage, measurement-error, system-error, receiving-error, issue-error, unknown, other)
      - Adds optional notes
      - Attaches photo evidence (optional)
      - Attaches file evidence (optional)
   f. Counter navigates to next/previous item
5. Counter can search items by code or name
6. Counter can filter by status: All, Pending, Counted
7. Counter can "Save for Resume" to exit and continue later
8. Counter can "Reset All Counts" to clear all entered values (with confirmation)
9. Counter marks count as complete when all items processed

**Alternative Flows**:
- **A1**: Skip item - Counter must provide skip reason via Notes sheet
- **A2**: Recount mode - System shows first count value, counter enters recount quantity
- **A3**: Quantity validation fails - System prevents negative values
- **A4**: Blind count mode - System hides system quantities based on user preference (`showSystemQuantity`)

---

### UC-PCM-006: Manage Count Status

**Primary Actor**: Inventory Supervisor
**Preconditions**: Count exists in valid transition state
**Postconditions**: Count status updated

**Main Flow**:
1. User views count detail page
2. User selects status action based on current state:

| Current Status | Available Actions |
|----------------|-------------------|
| Draft | Activate → Planning |
| Planning | Approve Plan → Pending |
| Pending | Start Count → In Progress |
| In Progress | Put On Hold → On Hold, Complete → Completed |
| On Hold | Resume → In Progress |
| Completed | Finalize & Post → Finalized |
| Any (non-terminal) | Cancel → Cancelled |

3. System validates transition
4. System records status change with timestamp
5. System logs action in count history

**Alternative Flows**:
- **A1**: Cancel requires reason - System prompts for cancellation reason
- **A2**: Finalize requires confirmation - System shows confirmation dialog before posting adjustments
- **A3**: Invalid transition - System displays error message

---

### UC-PCM-007: Review and Approve Variances

**Primary Actor**: Inventory Supervisor
**Preconditions**: Count has items with variances
**Postconditions**: Variances reviewed and approved/rejected

**Main Flow**:
1. Supervisor views Variance tab on count detail page
2. System displays items with discrepancies
3. For each variance item:
   a. Supervisor reviews system quantity vs. counted quantity
   b. Supervisor reviews variance reason and notes
   c. Supervisor reviews value impact
4. Supervisor approves individual variances or bulk approves
5. System updates item status to approved
6. System recalculates count accuracy

**Alternative Flows**:
- **A1**: Require recount - Supervisor marks item for recount
- **A2**: Variance exceeds threshold - System flags for additional approval

---

### UC-PCM-008: Finalize and Post Count

**Primary Actor**: Financial Controller
**Preconditions**: Count is completed, all items processed
**Postconditions**: Inventory adjustments posted

**Main Flow**:
1. Controller selects "Finalize & Post" action
2. System displays confirmation dialog with:
   - Total variance value
   - Number of items adjusted
   - Summary of adjustments by reason
3. Controller confirms finalization
4. System posts inventory adjustments
5. System updates count status to "finalized"
6. System locks count from further modifications
7. System records completion in history

**Alternative Flows**:
- **A1**: High variance alert - System requires additional confirmation for large adjustments
- **A2**: Cancel finalization - Controller can cancel before confirmation

---

## 4. Use Case Relationships

```
UC-PCM-001 (Dashboard) ←references→ UC-PCM-002 (List)
UC-PCM-002 (List) →navigates→ UC-PCM-003 (Create) | UC-PCM-004 (Details)
UC-PCM-003 (Create) →creates→ UC-PCM-004 (Details)
UC-PCM-004 (Details) →initiates→ UC-PCM-005 (Counting) | UC-PCM-006 (Status)
UC-PCM-005 (Counting) →generates→ UC-PCM-007 (Variances)
UC-PCM-007 (Variances) →enables→ UC-PCM-008 (Finalize)
```

---

## 5. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-06 | System | Initial documentation |
| 1.0.1 | 2025-12-09 | System | Updated UC-PCM-005 with mobile-first counting interface details (calculator, notes sheet, blind count mode, filter tabs) |
