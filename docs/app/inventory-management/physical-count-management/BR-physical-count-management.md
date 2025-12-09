# Business Requirements: Physical Count Management

**Module**: Inventory Management
**Sub-Module**: Physical Count Management
**Version**: 1.0.0
**Status**: IMPLEMENTED (Prototype with Mock Data)
**Last Updated**: 2025-12-09

---

## 1. Executive Summary

Physical Count Management enables comprehensive inventory verification through scheduled and ad-hoc physical counts. The module supports multiple count types (full, cycle, annual, perpetual, partial) with complete lifecycle management from planning through finalization and inventory adjustment posting.

---

## 2. Business Objectives

| Objective | Description | Success Metric |
|-----------|-------------|----------------|
| Inventory Accuracy | Maintain accurate inventory records through regular verification | ≥98% count accuracy |
| Variance Control | Identify and investigate inventory discrepancies | Variance resolution <48 hours |
| Compliance | Support audit requirements with documented count procedures | 100% audit compliance |
| Operational Efficiency | Minimize disruption while ensuring thorough counts | Complete counts within schedule |

---

## 3. Functional Requirements

### FR-PCM-001: Dashboard and KPIs

**Priority**: High
**User Story**: As an **Inventory Manager**, I want to view KPIs and active counts at a glance so that I can monitor counting activities and take action on overdue items.

**Requirements**:
- Display 5 KPI cards: Total Counts, Average Accuracy, Items Counted, Pending Approval, Total Variance
- Show overdue counts alert section with "Start Now" action
- Display pending approval section for counts requiring review
- List active counts with progress indicators
- Show recently finalized counts with accuracy and variance
- Provide quick action buttons for creating different count types
- Display upcoming scheduled counts
- Show statistics by count type and location
- Support date range filtering (7d, 30d, 90d, 365d)

**Acceptance Criteria**:
- [ ] Dashboard loads within 3 seconds
- [ ] All KPI values are calculated from actual data
- [ ] Overdue counts are highlighted with visual alerts
- [ ] Progress bars accurately reflect count completion

---

### FR-PCM-002: Physical Count List Management

**Priority**: High
**User Story**: As a **Storekeeper**, I want to view and filter all physical counts so that I can find and manage counts assigned to my location.

**Requirements**:
- Display counts in both table and grid view modes
- Support filtering by: status, type, location, department, supervisor, date range, priority, variance presence
- Support search by count number, location, or supervisor
- Show count summary cards by status (draft, planning, pending, in-progress, completed, finalized, cancelled, on-hold)
- Display progress percentage for active counts
- Show priority badges (low, medium, high, critical)
- Enable sorting by multiple columns

**Acceptance Criteria**:
- [ ] View toggle persists user preference
- [ ] Filters apply correctly and update counts
- [ ] Status tabs show accurate counts
- [ ] Search returns relevant results

---

### FR-PCM-003: Create Physical Count Wizard

**Priority**: High
**User Story**: As an **Inventory Coordinator**, I want to create physical counts using a guided wizard so that I can properly configure all count parameters.

**Requirements**:
- **Step 1 - Count Type**: Select from 5 count types with descriptions:
  - Full Physical Count: Complete count of all inventory items
  - Cycle Count: Regular scheduled count of specific categories
  - Annual Count: Year-end comprehensive inventory count
  - Perpetual Inventory: Continuous counting of selected items
  - Partial Count: Count of specific items or locations
- Set priority level (low, medium, high, critical)
- Configure approval threshold percentage

- **Step 2 - Assignment**:
  - Select location (required)
  - Select department (optional)
  - Select zone (optional)
  - Assign supervisor (required)
  - Add counting team members with roles (primary, secondary, verifier)
  - Set scheduled date and due date

- **Step 3 - Scope Selection** (varies by type):
  - Full/Annual: All items included automatically
  - Cycle/Partial: Category-based selection
  - Perpetual: Manual item selection

- **Step 4 - Review**:
  - Add description, instructions, and notes
  - Review all selections
  - Confirm and create

**Acceptance Criteria**:
- [ ] All steps validate before allowing progression
- [ ] Back navigation preserves entered data
- [ ] Count number is auto-generated on creation
- [ ] Team members can be added/removed dynamically

---

### FR-PCM-004: Physical Count Detail View

**Priority**: High
**User Story**: As a **Count Supervisor**, I want to view complete details of a physical count so that I can monitor progress and manage the count lifecycle.

**Requirements**:
- Display count header with status, type, priority badges
- Show progress bar for in-progress counts with breakdown (approved, counted, variance, recount, pending)
- Display 5 summary cards: Total Items, Accuracy Rate, System Value, Counted Value, Variance Value
- **Overview Tab**: Count details, location, supervisor, team size, dates, instructions, notes
- **Items Tab**: Searchable/filterable list of all items with quantities and variance
- **Variance Tab**: Items with discrepancies, variance reasons, value impact
- **Team Tab**: Supervisor and counter information with roles
- **History Tab**: Activity timeline with timestamps

**Status Actions**:
- Draft → Activate
- Planning → Approve Plan
- Pending → Start Count
- In Progress → Continue Count, Put On Hold
- On Hold → Resume
- Completed → Finalize & Post
- Any (non-terminal) → Cancel

**Acceptance Criteria**:
- [ ] Status transitions update correctly
- [ ] Progress bar reflects accurate item counts
- [ ] Cancel requires reason
- [ ] Finalize confirms before posting adjustments

---

### FR-PCM-005: Counting Interface

**Priority**: High
**User Story**: As a **Counter**, I want to count items efficiently so that I can complete the physical count accurately and quickly.

**Requirements**:
- **Mobile-First Design**: Optimized card-based interface for tablet and mobile counting
- **Item Count Cards**: Display item details with quantity input, +/- buttons, inline variance preview
- **Unit Calculator**: Multi-unit conversion calculator supporting:
  - Weight: kg, g, lb (conversion between units)
  - Volume: L, ml (conversion between units)
  - Count: pcs, dozen, case (configurable case sizes)
- **Notes & Evidence Sheet**: Bottom sheet for adding:
  - Variance reason selection (Damage, Theft, Spoilage, Measurement Error, System Error, Receiving Error, Issue Error, Unknown, Other)
  - Free-text notes
  - Photo attachment capability
  - File attachment capability
- **Blind Count Mode**: Toggle system quantity visibility (`showSystemQuantity` user preference) for independent verification
- **Filter Tabs**: Filter items by All, Pending, Counted status
- **Search**: Search items by code or name
- **Reset All Counts**: Clear all entered counts with confirmation
- **Save for Resume**: Save progress and return to detail page
- Progress tracking with counted/total and status breakdown
- Navigation between items (Previous/Next)

**Acceptance Criteria**:
- [ ] Quantity validates non-negative values
- [ ] Variance calculates automatically in real-time
- [ ] Calculator correctly converts between units
- [ ] Notes and evidence can be attached to any item
- [ ] Skip requires reason
- [ ] Can complete only when all items processed
- [ ] Blind count mode hides system quantities when enabled

---

### FR-PCM-006: Status Lifecycle Management

**Priority**: High
**User Story**: As an **Inventory Manager**, I want to manage count status transitions so that counts follow proper workflow.

**Requirements**:
- Support 8 statuses: draft, planning, pending, in-progress, completed, finalized, cancelled, on-hold
- Enforce valid transitions per state machine

**Acceptance Criteria**:
- [ ] Invalid transitions are prevented
- [ ] Status changes are logged
- [ ] Timestamps recorded for key transitions

---

## 4. Business Rules

| Rule ID | Description |
|---------|-------------|
| BR-001 | Count number format: PC-YYMMDD-XXXX |
| BR-002 | Approval threshold applies to total variance percentage |
| BR-003 | Skipped items must have reason |
| BR-004 | Cancelled counts preserve all data |
| BR-005 | Only completed counts can be finalized |
| BR-006 | Finalized counts cannot be modified |
| BR-007 | Variance reason required when counted ≠ system |

---

## 5. User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Counter | View assigned counts, perform counting |
| Storekeeper | Create counts, count items, view location counts |
| Inventory Coordinator | All storekeeper + assign counts, manage team |
| Inventory Supervisor | All coordinator + approve variances, cancel counts |
| Inventory Manager | Full access, configure settings, view analytics |
| Financial Controller | View counts, finalize and post adjustments |

---

## 6. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-06 | System | Initial documentation |
| 1.0.1 | 2025-12-09 | System | Updated counting interface features (mobile-first design, unit calculator, notes & evidence, blind count mode) |
