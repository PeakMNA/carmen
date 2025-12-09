# Business Requirements: Spot Check

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
| 2.0.0 | 2025-12-06 | System | Updated to reflect actual implementation with check types, statuses, and dashboard |
| 2.1.0 | 2025-12-09 | System | Revised to match actual 2-step creation wizard, added active/completed pages, updated selection methods |

---

## Overview

The Spot Check sub-module enables quick, targeted verification of inventory quantities for selected items at any location. Unlike full physical counts that verify all inventory, spot checks focus on specific products or categories that require immediate verification, such as high-value items, fast-moving products, or items with suspected discrepancies.

The current implementation provides a comprehensive spot check management system with:
- **Multiple Check Types**: Random, targeted, high-value, variance-based, and cycle-count
- **Dashboard Analytics**: KPIs, active checks, overdue alerts, and performance metrics
- **Streamlined Creation Wizard**: 2-step flow for creating spot checks (location → method/items)
- **Counting Interface**: Both single-item and list-view counting modes
- **Status Management**: Full lifecycle from draft to completion with pause and cancellation options
- **Active/Completed Views**: Dedicated pages for managing active counts and reviewing completed checks

## Business Objectives

1. **Rapid Verification**: Enable quick spot verification of inventory accuracy for selected items without requiring full physical count
2. **Variance Detection**: Identify and correct inventory discrepancies immediately upon detection rather than waiting for monthly counts
3. **Risk Management**: Focus verification efforts on high-value, high-risk, or problem items that require closer monitoring
4. **Operational Continuity**: Allow inventory verification without disrupting normal operations or requiring extensive staff time
5. **Loss Prevention**: Detect potential theft, damage, or process errors through targeted sampling and investigation
6. **Compliance Support**: Provide evidence of ongoing inventory control processes for audit and regulatory requirements
7. **Data Quality**: Maintain inventory accuracy through frequent, targeted verification of critical items
8. **Process Improvement**: Identify patterns in variances to improve inventory management processes and controls

## Key Stakeholders

- **Primary Users**: Storekeepers, Inventory Coordinators - Conduct spot checks daily
- **Secondary Users**: Department Supervisors - Initiate and review spot checks for their areas
- **Approvers**: Inventory Managers - Approve significant variances, review spot check frequency and effectiveness
- **Administrators**: System Administrators - Configure spot check parameters, maintain product categories
- **Reviewers**: Internal Auditors - Review spot check history and variance patterns for compliance
- **Support**: IT Support - Troubleshoot system issues, provide training on spot check procedures

---

## Functional Requirements

### FR-SC-001: Dashboard and Overview
**Priority**: High
**Status**: Implemented

The system provides a comprehensive dashboard for monitoring spot check activities and performance.

**Acceptance Criteria**:
- Dashboard displays key performance indicators (KPIs):
  - Total checks (this month)
  - Average accuracy percentage
  - Total items counted
  - Total variance value
- System shows overdue spot checks with alert indicators
- Active checks display progress indicators (items counted/total)
- Recently completed checks table shows latest results
- Quick action buttons enable rapid access to common tasks
- Upcoming checks section shows scheduled verifications
- Stats by type and location provide breakdown analysis

**Implementation**: `dashboard/page.tsx`

---

### FR-SC-002: Initiate Spot Check (Creation Wizard)
**Priority**: Critical
**Status**: Implemented

The system provides a streamlined 2-step wizard for creating new spot checks.

**Acceptance Criteria**:
- **Step 1 - Location Selection**: Users configure basic information:
  - Location selection (required) - dropdown with all available locations
  - Department selection (optional) - dropdown filtered by location
  - Assigned staff member - selection from available users
  - Scheduled date - date picker with default to today
  - Navigation buttons (Cancel, Next)

- **Step 2 - Method & Items Selection**: Users choose selection method and items:
  - **Selection Method Options**:
    - Random: System generates random sample from location inventory
    - High-Value: System selects highest value items
    - Manual: User manually selects individual items
  - **Item Count Selection**: Preset options (10, 20, 50 items)
  - **Item Preview Table**: Shows selected items with:
    - Item code and name
    - Category
    - Current system quantity
    - Unit of measure
  - **Item Selection Interface** (for manual method):
    - Search functionality
    - Category filtering
    - Checkbox selection
  - Navigation buttons (Back, Create Spot Check)

**Implementation**: `new/page.tsx`

---

### FR-SC-002a: Active Spot Checks Management
**Priority**: High
**Status**: Implemented

The system provides a dedicated page for managing active (pending and in-progress) spot checks.

**Acceptance Criteria**:
- Filter tabs by status: All, Pending, In Progress, Paused
- List view displaying:
  - Check number and type badge
  - Location
  - Item count (counted/total)
  - Progress bar visualization
  - Status badge
  - Due date with overdue indicator
  - Action buttons
- Quick actions:
  - Start count (for pending)
  - Continue count (for in-progress)
  - View details
- State management using Zustand store (`useCountStore`)
- Empty state handling for each filter

**Implementation**: `active/page.tsx`

---

### FR-SC-002b: Completed Spot Checks Management
**Priority**: High
**Status**: Implemented

The system provides a dedicated page for reviewing completed spot checks.

**Acceptance Criteria**:
- Filter tabs by time period: All, Today, This Week, This Month
- List view displaying:
  - Check number and type badge
  - Location
  - Completion date and time
  - Final accuracy percentage with color coding
  - Variance value (monetary)
  - Item count summary
  - Counted by user
- Summary statistics cards:
  - Total completed checks
  - Average accuracy
  - Total items counted
  - Total variance value
- Click-through to detailed view
- Empty state handling

**Implementation**: `completed/page.tsx`

---

### FR-SC-003: List and Filter Spot Checks
**Priority**: High
**Status**: Implemented

The system provides comprehensive listing and filtering of spot checks.

**Acceptance Criteria**:
- Summary cards display counts by status (All, Pending, In Progress, Completed, Cancelled)
- Tabs filter by status categories (All, Active, Completed)
- View toggle between list and grid layouts
- Filter options include:
  - Status (draft, pending, in-progress, completed, cancelled, on-hold)
  - Check type (random, targeted, high-value, variance-based, cycle-count)
  - Priority (low, medium, high, critical)
  - Location
- Search functionality across check numbers and descriptions
- Sortable columns in list view
- Click-through to detail pages

**Implementation**: `page.tsx`

---

### FR-SC-004: Spot Check Detail View
**Priority**: High
**Status**: Implemented

The system provides detailed view of individual spot checks with tabbed sections.

**Acceptance Criteria**:
- **Overview Tab**: Displays spot check header information:
  - Check number, type, status badge
  - Location and department
  - Assignment details (who, when scheduled, when due)
  - Priority and reason
  - Progress metrics (accuracy, items counted, variance value)
- **Items Tab**: Shows all items with:
  - Item code, name, category
  - Location and unit of measure
  - System quantity vs counted quantity
  - Variance (quantity and percentage)
  - Item condition (good, damaged, expired, missing)
  - Item status (pending, counted, variance, skipped)
- **Variances Tab**: Focuses on items with discrepancies:
  - Highlighted variance items
  - Variance explanations and notes
  - Filter for variance severity
- **History Tab**: Activity log showing:
  - Status changes
  - User actions
  - Timestamps

**Implementation**: `[id]/page.tsx`

---

### FR-SC-005: Enter Counted Quantities (Counting Interface)
**Priority**: Critical
**Status**: Implemented

The system provides an efficient interface for entering physical counts.

**Acceptance Criteria**:
- **Single Item Mode**: Focus on one item at a time with:
  - Large display of item details
  - Prominent quantity input with +/- buttons
  - Condition selector (good, damaged, expired, missing)
  - Notes field for observations
  - Variance preview calculated in real-time
  - Skip item option with reason
  - Navigation buttons (previous/next item)
- **List Mode**: View all items in scrollable list with:
  - Inline quantity input fields
  - Status indicators per item
  - Quick condition selection
- Progress indicator shows items counted vs total
- Save functionality preserves work-in-progress
- Complete check dialog with confirmation

**Implementation**: `[id]/count/page.tsx`

---

### FR-SC-006: Review Variance Analysis
**Priority**: High
**Status**: Implemented

The system calculates and displays variance information for each item.

**Acceptance Criteria**:
- System calculates variance_qty = counted_qty - system_qty
- System calculates variance_pct = (variance_qty / system_qty) * 100
- Visual indicators show variance severity:
  - Green: Match (no variance)
  - Yellow: Small variance (within tolerance)
  - Red: High variance (exceeds threshold)
- Users can add notes explaining variances
- Items can be marked with conditions affecting variance interpretation
- Summary statistics include:
  - Total items with variance
  - Total variance value
  - Accuracy percentage

**Implementation**: `[id]/page.tsx` (Variances tab)

---

### FR-SC-007: Status Management
**Priority**: Critical
**Status**: Implemented

The system supports full lifecycle status management.

**Acceptance Criteria**:
- Status flow supports: draft → pending → in-progress → completed/cancelled/on-hold
- **Start**: Transition from pending to in-progress
- **Pause**: Transition from in-progress to on-hold
- **Resume**: Transition from on-hold to in-progress
- **Complete**: Transition from in-progress to completed (requires all items counted)
- **Cancel**: Transition to cancelled with reason dialog:
  - Predefined cancellation reasons dropdown
  - Additional notes field
  - Confirmation required
- Status changes recorded in history tab
- Visual status badges indicate current state

**Implementation**: `[id]/page.tsx`

---

### FR-SC-008: Cancel Spot Check
**Priority**: Medium
**Status**: Implemented

The system allows authorized users to cancel spot checks.

**Acceptance Criteria**:
- Cancel action available for non-completed spot checks
- Cancel dialog prompts for:
  - Cancellation reason (dropdown): Items Unavailable, Staff Unavailable, Incorrect Items, Duplicate Check, Emergency, Other
  - Additional notes (optional text field)
- Cancelled spot checks retain all entered data
- No inventory adjustments posted for cancelled checks
- Status badge shows "Cancelled" state

**Implementation**: `[id]/page.tsx` (Cancel dialog)

---

## Business Rules

### Check Type Rules
- **BR-SC-001**: System supports five check types: random, targeted, high-value, variance-based, cycle-count
- **BR-SC-002**: Each check type has specific selection criteria and purpose
- **BR-SC-003**: Check type is set during creation and cannot be changed after

### Status Rules
- **BR-SC-004**: Valid statuses are: draft, pending, in-progress, completed, cancelled, on-hold
- **BR-SC-005**: Status transitions must follow defined flow (no skipping states)
- **BR-SC-006**: Completed status is final - no further modifications allowed
- **BR-SC-007**: Cancelled status preserves data but prevents completion

### Item Rules
- **BR-SC-008**: Each item can have one of four conditions: good, damaged, expired, missing
- **BR-SC-009**: Item status tracks: pending, counted, variance, skipped
- **BR-SC-010**: Skipped items require a reason/note

### Calculation Rules
- **BR-SC-011**: Variance quantity = counted quantity - system quantity
- **BR-SC-012**: Variance percentage = (variance quantity / system quantity) * 100
- **BR-SC-013**: Accuracy = (matched items / total items) * 100
- **BR-SC-014**: Items with missing condition have variance equal to full system quantity

### Priority Rules
- **BR-SC-015**: Priority levels are: low, medium, high, critical
- **BR-SC-016**: Critical priority checks should be displayed prominently in dashboard
- **BR-SC-017**: Overdue checks are determined by due date comparison

### Selection Method Rules
- **BR-SC-018**: Random selection generates items based on configurable count (10, 20, or 50)
- **BR-SC-019**: Manual selection allows individual item picking with search and category filtering
- **BR-SC-020**: High-value selection automatically picks highest value items in the location

---

## Data Model

### SpotCheck Entity

**Purpose**: Represents a spot check verification session.

```typescript
interface SpotCheck {
  id: string;
  checkNumber: string;                    // Format: SC-YYMMDD-XXXX
  checkType: SpotCheckType;               // random | targeted | high-value | variance-based | cycle-count
  status: SpotCheckStatus;                // draft | pending | in-progress | completed | cancelled | on-hold
  priority: Priority;                     // low | medium | high | critical

  // Location
  locationId: string;
  locationName: string;
  departmentId: string;
  departmentName: string;

  // Assignment
  assignedTo: string;
  assignedToName: string;
  scheduledDate: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  dueDate: Date | null;

  // Items
  items: SpotCheckItem[];
  totalItems: number;
  countedItems: number;
  matchedItems: number;
  varianceItems: number;

  // Metrics
  accuracy: number;                       // Percentage
  totalValue: number;
  varianceValue: number;

  // Details
  reason: string;
  notes: string;

  // Audit
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### SpotCheckItem Entity

**Purpose**: Represents individual item within a spot check.

```typescript
interface SpotCheckItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  unit: string;
  location: string;

  // Quantities
  systemQuantity: number;
  countedQuantity: number | null;
  variance: number;
  variancePercent: number;

  // Status
  condition: ItemCondition;               // good | damaged | expired | missing
  status: ItemCheckStatus;                // pending | counted | variance | skipped

  // Tracking
  countedBy: string | null;
  countedAt: Date | null;
  notes: string;

  // Value
  value: number;
  lastCountDate: Date | null;
}
```

### SpotCheckFormData Entity

**Purpose**: Form data for creating new spot checks via the 2-step wizard.

```typescript
interface SpotCheckFormData {
  // Step 1 - Location Selection
  locationId: string;
  departmentId: string;
  assignedTo: string;
  scheduledDate: Date;

  // Step 2 - Method & Items
  selectionMethod: SelectionMethod;       // random | high-value | manual
  itemCount: number;                      // 10 | 20 | 50
  selectedItems: string[];                // Item IDs for manual selection
}

type SelectionMethod = 'random' | 'high-value' | 'manual';
```

---

## Integration Points

### Internal Integrations
- **Inventory Management**: Retrieve system quantities for comparison
- **Product Management**: Retrieve item details (name, code, category, unit)
- **Location Management**: Validate location access and retrieve details
- **User Management**: Validate user permissions and assignments
- **Dashboard**: Aggregate metrics for inventory management overview

### Mock Data Integration
Current implementation uses mock data from `lib/mock-data/spot-checks.ts`:
- `mockSpotChecks`: Array of sample spot check records
- `getSpotCheckSummary()`: Status breakdown counts
- `getSpotCheckById(id)`: Single record lookup
- `getSpotChecksByStatus(status)`: Filter by status
- `getActiveSpotChecks()`: Pending and in-progress checks
- `getOverdueSpotChecks()`: Checks past due date
- `getSpotCheckDashboardStats()`: KPI aggregations

---

## Non-Functional Requirements

### Performance
- **NFR-SC-001**: Dashboard must load within 2 seconds
- **NFR-SC-002**: List page must handle 100+ spot checks smoothly
- **NFR-SC-003**: Counting interface must respond within 100ms per action
- **NFR-SC-004**: Variance calculations must be real-time

### Usability
- **NFR-SC-005**: Mobile-responsive design for tablet use during counting
- **NFR-SC-006**: Single-item counting mode for focused data entry
- **NFR-SC-007**: Clear visual indicators for status and variance severity
- **NFR-SC-008**: Streamlined 2-step creation wizard for quick spot check setup

### Reliability
- **NFR-SC-009**: Save functionality prevents data loss during counting
- **NFR-SC-010**: Status transitions are atomic (no partial state)
- **NFR-SC-011**: Cancel operation preserves all entered data

---

## Success Metrics

### Efficiency Metrics
- **Spot Check Completion Time**: Average time to complete spot check < 15 minutes for 20 items
- **Creation Wizard Time**: Average time through 2-step wizard < 1 minute
- **Dashboard Load Time**: < 2 seconds for full dashboard with analytics

### Quality Metrics
- **Inventory Accuracy**: Maintain > 95% accuracy across all locations
- **Variance Rate**: < 5% of spot check items show significant variance
- **Completion Rate**: > 90% of started spot checks completed (not cancelled)

### Adoption Metrics
- **Spot Check Frequency**: Average 5+ spot checks per location per week
- **Dashboard Usage**: > 80% of inventory staff check dashboard daily
- **Feature Utilization**: All check types used across organization

---

## Implementation Status

### Completed Features
- [x] Dashboard with KPIs and analytics
- [x] Streamlined 2-step creation wizard
- [x] Main list page with filtering
- [x] Active spot checks management page
- [x] Completed spot checks management page
- [x] Detail page with tabbed view
- [x] Counting interface (single and list modes)
- [x] Status management (start, pause, cancel, complete)
- [x] Variance calculation and display
- [x] Cancel with reason dialog
- [x] Mock data layer
- [x] Zustand state management for active counts

### Pending Features
- [ ] Database integration (Prisma/PostgreSQL)
- [ ] Server actions for data mutations
- [ ] Real-time variance posting to inventory
- [ ] Supervisor approval workflow
- [ ] Export functionality (CSV/Excel)
- [ ] Spot check templates
- [ ] Barcode scanner integration
- [ ] Offline capability

---

## Appendix

### Glossary

- **Spot Check**: Targeted inventory verification of selected products
- **Check Type**: Classification of spot check purpose (random, targeted, etc.)
- **System Quantity**: Expected quantity from inventory system
- **Counted Quantity**: Physical count performed during spot check
- **Variance**: Difference between system and counted quantities
- **Item Condition**: Physical state of item (good, damaged, expired, missing)
- **Selection Method**: How items are chosen for spot check (random, high-value, manual)

### Type Definitions

```typescript
type SpotCheckType = 'random' | 'targeted' | 'high-value' | 'variance-based' | 'cycle-count';
type SpotCheckStatus = 'draft' | 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
type ItemCheckStatus = 'pending' | 'counted' | 'variance' | 'skipped';
type ItemCondition = 'good' | 'damaged' | 'expired' | 'missing';
type Priority = 'low' | 'medium' | 'high' | 'critical';
type SelectionMethod = 'random' | 'high-value' | 'manual';
```

### File Structure

```
app/(main)/inventory-management/spot-check/
├── page.tsx                    # Main list page
├── types.ts                    # TypeScript type definitions
├── new/
│   └── page.tsx               # 2-step creation wizard
├── dashboard/
│   └── page.tsx               # Dashboard with KPIs
├── active/
│   ├── page.tsx               # Active spot checks list
│   └── [id]/
│       └── page.tsx           # Active check detail
├── completed/
│   ├── page.tsx               # Completed spot checks list
│   └── [id]/
│       └── page.tsx           # Completed check detail
└── [id]/
    ├── page.tsx               # Detail view with tabs
    └── count/
        └── page.tsx           # Counting interface
```

---

**Document End**
