# Business Requirements: Physical Count

> Version: 1.0.0 | Status: Active | Last Updated: 2025-01-16

## 1. Document Control

| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Feature | Physical Count |
| Owner | Inventory Control |
| Status | Active |

## 2. Executive Summary

Physical Count provides comprehensive inventory verification through systematic counting of all items in selected locations. The module supports multiple count types (full, cycle, annual, perpetual, partial) with a structured workflow from planning through finalization.

## 3. Business Objectives

| ID | Objective | Success Metric |
|----|-----------|----------------|
| BO-01 | Accurate inventory records | <2% variance rate |
| BO-02 | Efficient counting process | <4 hours for full count |
| BO-03 | Complete audit trail | 100% count traceability |
| BO-04 | Timely variance resolution | <24h variance investigation |

## 4. Functional Requirements

### FR-PC-001: Count Creation Wizard

**Priority**: High
**User Story**: As a Storekeeper, I want to create physical counts using a guided wizard so that I can systematically plan my counting activities.

**Requirements**:
- 4-step wizard: Setup → Location Selection → Item Review → Final Review
- Auto-populate counter name from logged-in user
- Required fields: department, date/time
- Optional notes field for count instructions
- Multi-location selection with search and type filtering
- Item preview with category breakdown
- Estimated duration calculation

**Intent**:
- Standardize count setup process
- Ensure all required information captured upfront
- Allow counter to review scope before starting

**Acceptance Criteria**:
- [ ] Counter name auto-fills and is read-only
- [ ] Cannot proceed past Step 1 without department and date/time
- [ ] Location search filters by name
- [ ] Location type filter works (storage, kitchen, restaurant, bar, maintenance)
- [ ] Item list updates based on selected locations
- [ ] Final review shows accurate item count and estimated duration
- [ ] Start Count navigates to active counting page

---

### FR-PC-002: Physical Count Dashboard

**Priority**: High
**User Story**: As an Inventory Manager, I want to view all physical counts in a dashboard so that I can monitor counting activities and track progress.

**Requirements**:
- KPI cards: Total Counts, In Progress, Active Counters, Pending Review
- Bar chart showing count activity over time
- Recent counts list with status badges
- Searchable, sortable, paginated counts table
- Quick filters by status

**Intent**:
- Provide real-time visibility into counting operations
- Enable quick identification of counts requiring attention
- Support trend analysis of counting activities

**Acceptance Criteria**:
- [ ] KPIs reflect accurate count statistics
- [ ] Chart displays count volumes by period
- [ ] Table columns: Department, Location, Counter, Start Time, Duration, Status, Items, Variance
- [ ] Search works across department, location, counter
- [ ] Sorting works on all columns
- [ ] Pagination handles large datasets
- [ ] Status badges use correct colors (blue=in-progress, green=completed, yellow=pending, red=cancelled)

---

### FR-PC-003: Active Counting Interface

**Priority**: High
**User Story**: As a Storekeeper, I want to count items in real-time with an efficient interface so that I can complete counts quickly and accurately.

**Requirements**:
- Count header with count number, counter name, start time, elapsed duration
- Pause Count and Complete Count action buttons
- Progress indicator (items counted / total items)
- Item list with search and filter
- Per-item entry: physical count input, status selection (good, damaged, missing, expired)
- Save Count button per item
- Running variance calculation

**Intent**:
- Minimize time spent per item
- Capture item condition during count
- Allow partial progress saves
- Track counting duration for productivity analysis

**Acceptance Criteria**:
- [ ] Duration updates in real-time
- [ ] Progress percentage updates as items are counted
- [ ] Physical count accepts numeric input
- [ ] Status dropdown has options: good, damaged, missing, expired
- [ ] Save Count persists individual item count
- [ ] Pause Count allows resumption later
- [ ] Complete Count triggers variance analysis

---

### FR-PC-004: Location-Based Item Loading

**Priority**: Medium
**User Story**: As a Storekeeper, I want to select specific locations for counting so that I can organize my counting by physical area.

**Requirements**:
- Location types: storage, kitchen, restaurant, bar, maintenance
- Location search by name
- Multi-select locations
- Items automatically loaded based on location inventory
- Category breakdown of items per location

**Intent**:
- Support zone-based counting approach
- Allow flexible scope definition
- Show item distribution for planning

**Acceptance Criteria**:
- [ ] All 5 location types available as filter
- [ ] Search matches location names
- [ ] Multiple locations can be selected
- [ ] Item count updates based on selection
- [ ] Deselecting location removes its items

---

### FR-PC-005: Item Review and Filtering

**Priority**: Medium
**User Story**: As a Storekeeper, I want to review and filter the item list before starting so that I can verify the count scope is correct.

**Requirements**:
- Sortable columns: code, name, last purchase date
- Category filter dropdown
- Search by item code or name
- Display: item code, name, category, unit, expected quantity
- Total item count display

**Intent**:
- Allow verification of count scope
- Enable identification of high-value or problematic items
- Support count planning and item sequencing

**Acceptance Criteria**:
- [ ] Click column header to sort ascending/descending
- [ ] Category dropdown shows all categories in selection
- [ ] Search filters item list in real-time
- [ ] All item details visible in table
- [ ] Total count accurate

---

### FR-PC-006: Count Summary and Duration Estimation

**Priority**: Medium
**User Story**: As a Storekeeper, I want to see a summary with estimated duration before starting so that I can plan my time accordingly.

**Requirements**:
- Counter information display
- Location count summary
- Total items to count
- Category breakdown
- Estimated duration based on item count
- Selected locations list

**Intent**:
- Provide final verification before commit
- Set time expectations for counter
- Document count parameters

**Acceptance Criteria**:
- [ ] Counter name, department, date/time displayed
- [ ] Location count matches selection
- [ ] Item count matches filtered list
- [ ] Duration estimate shown (calculation based on items)
- [ ] Category breakdown accurate
- [ ] Start Count initiates active count

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Page load time | <2 seconds |
| NFR-02 | Item save response | <500ms |
| NFR-03 | Search responsiveness | <300ms |
| NFR-04 | Concurrent counters | Support 10+ simultaneous |
| NFR-05 | Offline capability | Cache current count locally |

## 6. Business Rules

| ID | Rule | Enforcement |
|----|------|-------------|
| BR-01 | Count requires at least one location | Wizard validation |
| BR-02 | Counter name from authenticated user | Auto-populated, read-only |
| BR-03 | Count date cannot be in past | Date picker validation |
| BR-04 | Items auto-loaded from location inventory | System logic |
| BR-05 | Variance = Physical Count - Expected | Automatic calculation |
| BR-06 | Only one active count per counter | System constraint |

## 7. Integration Points

| System | Integration | Direction |
|--------|-------------|-----------|
| Inventory Balance | Expected quantities | Inbound |
| Inventory Adjustments | Variance corrections | Outbound |
| User Management | Counter authentication | Inbound |
| Location Management | Location data | Inbound |
| Product Management | Item master data | Inbound |

## 8. Glossary

| Term | Definition |
|------|------------|
| Physical Count | Complete inventory verification for selected locations |
| Cycle Count | Rotating partial counts covering all items over time |
| Variance | Difference between physical count and expected quantity |
| Counter | Staff member performing the physical count |
| Count Type | Category of count (full, cycle, annual, perpetual, partial) |

---
*Document Version: 1.0.0 | Carmen ERP Physical Count Module*
