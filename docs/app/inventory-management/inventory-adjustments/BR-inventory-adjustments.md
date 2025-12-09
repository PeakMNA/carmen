# Business Requirements: Inventory Adjustments

**Module**: Inventory Management
**Sub-module**: Inventory Adjustments
**Version**: 1.0
**Last Updated**: 2025-01-10

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

## Table of Contents
1. [Document Overview](#document-overview)
2. [Functional Requirements](#functional-requirements)
3. [Business Rules](#business-rules)
4. [User Personas](#user-personas)
5. [Success Criteria](#success-criteria)

---

## Document Overview

### Purpose
This document defines business requirements for the Inventory Adjustments module, which enables hotel staff to record and manage inventory quantity corrections, physical count variances, damaged goods, and other stock adjustments across hotel locations.

### Scope
The Inventory Adjustments module provides:
- Recording of inventory adjustments (IN/OUT transactions)
- Physical count variance adjustments
- Damaged/expired goods write-offs
- System reconciliation adjustments
- Multi-location adjustment tracking
- Automated journal entry generation
- Lot-based stock movement tracking

### Module Context
**Parent Module**: Inventory Management
**Related Modules**:
- Physical Count Management
- Stock Overview
- Financial Accounting (Journal Entries)
- Warehouse Operations

### Related Documentation
**Shared Methods** (Infrastructure):
- **[SM: Costing Methods](../../shared-methods/inventory-valuation/SM-costing-methods.md)** - Core transaction system, FIFO logic, lot tracking
- **[SM: Period-End Snapshots](../../shared-methods/inventory-valuation/SM-period-end-snapshots.md)** - Period management and valuation

**Module Documentation**:
- [Use Cases](./UC-inventory-adjustments.md)
- [Technical Specification](./TS-inventory-adjustments.md)
- [Data Schema](./DS-inventory-adjustments.md)
- [Flow Diagrams](./FD-inventory-adjustments.md)
- [Validations](./VAL-inventory-adjustments.md)

---

## Functional Requirements

### Adjustment List Management

#### FR-INV-ADJ-001: View Inventory Adjustments List
**Priority**: Critical
**User Story**: As a Storekeeper, I want to view all inventory adjustments in a searchable list so that I can track all stock corrections and their current status.

**Requirements**:
- Display paginated list of all adjustments
- Show key fields: Adjustment #, Date, Type (IN/OUT), Location, Reason, Items count, Total Value, Status
- Support real-time search across all fields
- Display status badges (Posted, Draft, Voided)
- Show type badges (IN for increases, OUT for decreases)
- Currency formatting for total values

**Acceptance Criteria**:
- ✅ List loads within 2 seconds
- ✅ Search filters results as user types
- ✅ All adjustments visible with pagination
- ✅ Status and type clearly indicated with color-coded badges
- ✅ Currency values formatted correctly (USD with 2 decimals)

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-list.tsx:28-109` (mock data), lines 111-237 (list component)

---

#### FR-INV-ADJ-002: Filter and Sort Adjustments
**Priority**: High
**User Story**: As a Financial Controller, I want to filter adjustments by status, type, and location so that I can quickly find specific adjustments for review or audit.

**Requirements**:
- Filter by Status: Posted, Draft, Voided
- Filter by Type: IN, OUT
- Filter by Location: Main Warehouse, Production Store, etc.
- Sort by: Date, Adjustment #, Total Value, Items count
- Support multiple active filters simultaneously
- Sort order toggle (ascending/descending)

**Acceptance Criteria**:
- ✅ Multiple filters can be active at once
- ✅ Filter results update immediately
- ✅ Sort order toggles on column header click
- ✅ Active filters visually indicated

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-list.tsx:117-155` (filter and sort logic), `components/filter-sort-options.tsx`

---

#### FR-INV-ADJ-003: Search Adjustments
**Priority**: High
**User Story**: As a Warehouse Manager, I want to search adjustments by any field so that I can quickly locate specific adjustments without scrolling.

**Requirements**:
- Global search across all visible fields
- Real-time search (no submit button)
- Search icon indicator in input field
- Clear search button
- Case-insensitive matching
- Search includes: ID, date, type, status, location, reason

**Acceptance Criteria**:
- ✅ Search works across all text fields
- ✅ Results filter in real-time as user types
- ✅ No performance degradation with large lists
- ✅ Clear indicator when search active

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-list.tsx:160-173`

---

### Adjustment Detail Management

#### FR-INV-ADJ-004: View Adjustment Details
**Priority**: Critical
**User Story**: As a Storekeeper, I want to view complete details of an adjustment including all items, quantities, costs, and lot numbers so that I can verify the accuracy of stock corrections.

**Requirements**:
- Display header information: Adjustment #, Date, Type, Status, Location, Department, Reason, Description
- Show three tabs: Items, Stock Movement, Journal Entries
- Items tab: Product details, quantities, costs, status
- Stock Movement tab: Lot-level details with IN/OUT quantities
- Journal Entries tab: GL accounts affected with debit/credit amounts
- Display totals: IN quantity, OUT quantity, Total Cost
- Support edit mode for draft adjustments

**Acceptance Criteria**:
- ✅ All header fields displayed clearly
- ✅ Three tabs functional and properly labeled
- ✅ Each tab shows appropriate data
- ✅ Totals calculate correctly
- ✅ Edit mode enabled for draft status only

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-detail.tsx:92-211` (mock data), lines 251-417 (detail component)

---

#### FR-INV-ADJ-005: Manage Adjustment Items
**Priority**: High
**User Story**: As a Storekeeper, I want to add, edit, and remove items from draft adjustments so that I can correct inventory discrepancies accurately.

**Requirements**:
- Display items table with columns: Location, Product, Unit, On Hand, Adjustment, Closing, Total Price, Status, Actions
- Show checkbox for bulk selection
- Display product name with SKU
- Show item description in secondary line
- Display current stock (On Hand)
- Show adjustment quantity (positive or negative)
- Calculate closing stock automatically
- Show total cost per item
- Display item status badge
- Edit and Delete buttons per row (visible on hover)
- Add Item button to insert new lines
- Show additional details row: On Order, Last Price, Last Vendor

**Acceptance Criteria**:
- ✅ All item fields visible and editable in edit mode
- ✅ Closing stock calculated automatically (On Hand + Adjustment)
- ✅ Total price calculated correctly (Unit Cost × Adjustment Qty)
- ✅ Add/Edit/Delete actions work correctly
- ✅ Additional details row expands below each item

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-detail.tsx:330-411` (Items tab implementation)

---

#### FR-INV-ADJ-006: View Stock Movement by Lot
**Priority**: High
**User Story**: As a Quality Control Manager, I want to see lot-level stock movements for adjustments so that I can track which specific lots were adjusted for traceability purposes.

**Requirements**:
- Display stock movement table by product
- Show location details (type, code, name)
- List all lots per product with lot numbers
- Show IN quantity (positive adjustments)
- Show OUT quantity (negative adjustments)
- Display unit of measure
- Show unit cost and total cost per product
- Subtotal IN/OUT quantities per product
- Grand total for all products

**Acceptance Criteria**:
- ✅ Each product shows all affected lots
- ✅ IN and OUT quantities clearly differentiated
- ✅ Lot numbers displayed for traceability
- ✅ Subtotals and grand totals calculate correctly
- ✅ Currency values formatted properly

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-detail.tsx:302-323` (Stock Movement tab), `components/types.ts:7-22` (Lot interface)

---

#### FR-INV-ADJ-007: View Journal Entries
**Priority**: High
**User Story**: As a Financial Controller, I want to view the accounting journal entries generated from inventory adjustments so that I can verify the financial impact on the general ledger.

**Requirements**:
- Display journal header: Status, Journal #, Posting Date, Posting Period, Description, Reference
- Show audit trail: Created By, Created At, Posted By, Posted At
- Display journal entries table: Account, Account Name, Debit, Credit, Department, Reference
- Verify debit and credit balance (must be equal)
- Show entry-level department allocation
- Display reference to source adjustment document
- Color-code status badge (Posted = green)

**Acceptance Criteria**:
- ✅ Journal header shows all required fields
- ✅ Audit trail shows who created and posted
- ✅ Debit total equals credit total
- ✅ Account codes and names displayed
- ✅ Department shown for each entry

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-detail.tsx:213-249` (mock journal data), lines 325-328 (Journal tab), `components/journal-entries/journal-header.tsx`, `components/journal-entries/journal-table.tsx`

---

### Adjustment Workflow Actions

#### FR-INV-ADJ-008: Create New Adjustment
**Priority**: Critical
**User Story**: As a Storekeeper, I want to create new inventory adjustments so that I can record physical count variances and other stock corrections.

**Requirements**:
- "New Adjustment" button prominently displayed
- Opens adjustment creation form
- Required fields: Date, Type (IN/OUT), Location, Department, Reason
- Optional fields: Description
- Status defaults to "Draft"
- Auto-generate Adjustment # (ADJ-YYYY-NNN format)
- Save and continue functionality

**Acceptance Criteria**:
- ✅ Button visible on list page
- ✅ Form opens on click
- ✅ All required fields validated
- ✅ Adjustment # auto-generated
- ✅ Saves as Draft initially

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/page.tsx:13-16` (New Adjustment button)

---

#### FR-INV-ADJ-009: Edit Draft Adjustments
**Priority**: High
**User Story**: As a Storekeeper, I want to edit draft adjustments so that I can correct errors before posting to the general ledger.

**Requirements**:
- Edit mode toggle button
- Only available for Draft status
- Allow editing: Type, Location, Department, Reason, Description
- Allow add/edit/delete of items
- Allow changing quantities and costs
- Save changes with validation
- Cancel edit mode without saving

**Acceptance Criteria**:
- ✅ Edit button visible for Draft adjustments only
- ✅ All editable fields become input fields
- ✅ Changes can be saved or cancelled
- ✅ Validation prevents invalid data
- ✅ Posted adjustments cannot be edited

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-detail.tsx:253, 275-277` (edit mode state), `components/header-actions.tsx`

---

#### FR-INV-ADJ-010: Post Adjustments
**Priority**: Critical
**User Story**: As a Warehouse Manager, I want to post verified adjustments so that inventory balances and financial accounts are updated in the system.

**Requirements**:
- Post action available for Draft adjustments
- Validation: All items must have quantities and costs
- Validation: Adjustment must have at least one item
- Generate journal entries on post
- Update stock balances immediately
- Create inventory transactions
- Update status to "Posted"
- Record who posted and when
- Posted adjustments cannot be modified

**Acceptance Criteria**:
- ✅ Only Draft adjustments can be posted
- ✅ Validation prevents posting invalid data
- ✅ Journal entries created automatically
- ✅ Stock balances updated correctly
- ✅ Audit trail captured (Posted By, Posted At)

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/header-actions.tsx` (action buttons), mock data shows "Posted" status at line 96

---

#### FR-INV-ADJ-011: Void Adjustments
**Priority**: Medium
**User Story**: As a Financial Controller, I want to void incorrect adjustments so that I can reverse their impact without deleting the audit trail.

**Requirements**:
- Void action available for Posted adjustments
- Requires reason for voiding
- Generates reversing journal entries
- Restores original stock balances
- Updates status to "Voided"
- Preserves original adjustment data
- Records who voided and when
- Voided adjustments cannot be un-voided

**Acceptance Criteria**:
- ✅ Only Posted adjustments can be voided
- ✅ Void reason required
- ✅ Reversing entries created
- ✅ Stock balances restored
- ✅ Original data preserved for audit

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-list.tsx:86-89` (Voided status in mock data)

---

### Reason Code Management

#### FR-INV-ADJ-012: Type-Specific Adjustment Reasons
**Priority**: High
**User Story**: As a Storekeeper, I want to select from predefined adjustment reasons based on the adjustment type so that adjustments are categorized consistently for reporting.

**Requirements**:
- Reason dropdown with type-specific predefined values:

  **Stock IN Reasons**:
  - Physical Count Variance - Count revealed more inventory than system
  - Found Items - Previously unaccounted inventory discovered
  - Return to Stock - Items returned to inventory
  - System Correction - Correcting system errors
  - Other - Free-text reason required

  **Stock OUT Reasons**:
  - Damaged Goods - Items physically damaged and unusable
  - Expired Items - Items past expiration date
  - Theft/Loss - Missing items from theft or unexplained loss
  - Spoilage - Perishable items spoiled
  - Physical Count Variance - Count revealed less inventory than system
  - Quality Control Rejection - Items failing quality standards
  - Other - Free-text reason required

- Allow free-text description for additional details
- Reason required for all adjustments
- Reason options change dynamically based on selected type
- Reason displayed in list and detail views

**Acceptance Criteria**:
- ✅ IN-specific reasons available when type is IN
- ✅ OUT-specific reasons available when type is OUT
- ✅ Reason dropdown updates when type changes
- ✅ Reason selection required
- ✅ Description field optional (required for "Other")
- ✅ Reason displayed consistently in list and detail

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/new/page.tsx:52-77` (adjustmentReasons object with IN/OUT specific values)

---

## Business Rules

### BR-INV-ADJ-001: Adjustment Type Classification
**Rule**: Adjustments must be classified as either IN (increase stock) or OUT (decrease stock).

**Rationale**: Clear classification ensures proper accounting treatment and stock balance updates.

**Implementation**:
- IN adjustments: Debit inventory asset, Credit variance/adjustment account
- OUT adjustments: Debit variance/adjustment account, Credit inventory asset
- Type badge displayed with appropriate color (IN = green, OUT = red)

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-list.tsx:32, 42, 52, 62, 72, 82, 92, 102` (type field in mock data)

---

### BR-INV-ADJ-002: Status Workflow
**Rule**: Adjustments follow a strict status progression: Draft → Posted → Voided (optional).

**Rationale**: Maintain data integrity and proper accounting controls.

**Status Definitions**:
- **Draft**: Editable, not affecting stock or GL
- **Posted**: Finalized, stock and GL updated, no further edits
- **Voided**: Reversed, reversing entries created, preserved for audit

**Transitions**:
- Draft can be: Edited, Posted, Deleted
- Posted can be: Voided
- Voided cannot be: Modified or Un-voided

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-list.tsx:33, 43, 53, 63, 73, 83, 93, 103` (status field in mock data)

---

### BR-INV-ADJ-003: Location-Based Access Control
**Rule**: Users can only create and view adjustments for locations they are assigned to, unless they have System Administrator role.

**Rationale**: Enforce data segregation and prevent unauthorized stock modifications.

**Implementation**:
- Filter adjustment list by user's accessible locations
- Location dropdown shows only accessible locations
- System Administrator sees all locations

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-list.tsx:34, 44, 54, 64, 74, 84, 94, 104` (location field in mock data)

---

### BR-INV-ADJ-004: Lot-Level Traceability
**Rule**: All adjustments must track stock changes at the lot level for complete traceability.

**Rationale**: Support food safety regulations, quality control, and recall procedures.

**Implementation**:
- Each adjustment item links to specific lot numbers
- Lot IN and OUT quantities tracked separately
- Lot numbers displayed in Stock Movement tab
- System prevents adjusting non-existent lots

**Source Evidence**: `components/types.ts:7-11` (Lot interface), `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-detail.tsx:120-133, 154-167, 188-201` (lot data in mock items)

---

### BR-INV-ADJ-005: Automated Journal Entry Generation
**Rule**: System automatically generates balanced journal entries when adjustments are posted.

**Rationale**: Ensure financial integrity and eliminate manual accounting errors.

**Journal Entry Rules**:
- IN adjustments: DR Raw Materials Inventory, CR Inventory Variance
- OUT adjustments: DR Inventory Variance, CR Raw Materials Inventory
- Department allocation based on adjustment location
- Reference field links back to adjustment document

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-detail.tsx:213-249` (journal entries mock data)

---

### BR-INV-ADJ-006: Total Cost Calculation
**Rule**: Total adjustment cost calculated as sum of (Unit Cost × Adjustment Quantity) for all items.

**Rationale**: Accurate financial impact assessment for reporting and analysis.

**Calculation**:
```
Item Total = Unit Cost × Adjustment Quantity
Adjustment Total = SUM(Item Totals)
```

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-list.tsx:37, 47, 57, 67, 77, 87, 97, 107` (totalValue in mock data), `components/types.ts:35-40` (totals interface)

---

### BR-INV-ADJ-007: Currency Formatting
**Rule**: All monetary values displayed in hotel's base currency (USD) with consistent formatting.

**Implementation**: Use `toLocaleString('en-US', { style: 'currency', currency: 'USD' })`

**Source Evidence**: `app/(main)/inventory-management/inventory-adjustments/components/inventory-adjustment-list.tsx:204-207`

---

## User Personas

### Primary Users

#### Storekeeper / Warehouse Clerk
**Role**: Daily warehouse operations and inventory record-keeping
**Key Needs**:
- Create adjustments for physical count variances
- Record damaged/expired goods
- Edit draft adjustments
- View adjustment history

**Features Used**:
- Create New Adjustment
- Edit Draft Adjustments
- View Adjustment List
- Search and Filter

---

#### Warehouse Manager / Store Manager
**Role**: Warehouse supervision and approval authority
**Key Needs**:
- Review and approve adjustments
- Post adjustments to GL
- Monitor adjustment patterns
- Investigate significant variances

**Features Used**:
- Post Adjustments
- View Journal Entries
- Filter by Status and Location
- View Stock Movement Details

---

#### Head Chef / Sous Chef
**Role**: Food inventory management and quality control
**Key Needs**:
- Track spoilage and waste
- Record quality rejections
- View ingredient adjustments
- Monitor food cost impacts

**Features Used**:
- Create OUT Adjustments (damaged/expired)
- View Adjustment Details
- Stock Movement by Lot (traceability)

---

#### Financial Controller / Accounting Manager
**Role**: Financial oversight and GL reconciliation
**Key Needs**:
- Review financial impact
- Verify journal entries
- Void incorrect adjustments
- Monthly reconciliation

**Features Used**:
- View Journal Entries
- Void Adjustments
- Filter by Status
- Export adjustment reports

---

#### Chief Engineer / Maintenance Supervisor
**Role**: Engineering supplies and maintenance parts inventory
**Key Needs**:
- Record parts usage
- Adjust for damaged equipment
- Track spare parts

**Features Used**:
- Create Adjustments (production store)
- View Adjustment List
- Filter by Location

---

### Secondary Users

#### Receiving Clerk
**Role**: Goods receiving and initial stock recording
**Key Features**: View adjustments related to receiving variances

#### Quality Control Inspector
**Role**: Product quality verification
**Key Features**: Create adjustments for QC rejections, View lot-level details

---

## Success Criteria

### Operational Metrics
- **Data Accuracy**: 99.9% accuracy in stock balance updates
- **Posting Time**: Adjustments post within 3 seconds
- **Response Time**: List page loads in < 2 seconds
- **Search Performance**: Results return within 500ms

### Business Metrics
- **Variance Reduction**: 25% reduction in unexplained variances within 6 months
- **Adjustment Turnaround**: 80% of adjustments posted within 24 hours of creation
- **Audit Compliance**: 100% of adjustments have supporting documentation
- **Write-off Tracking**: Detailed tracking of all damaged/expired items

### User Adoption
- **Daily Active Users**: 90% of storekeepers use module daily
- **Training Time**: New users proficient within 2 hours
- **Error Rate**: < 1% of adjustments require correction
- **User Satisfaction**: 4.5/5 average rating

### Compliance & Control
- **Segregation of Duties**: 100% separation of creation and posting roles
- **Audit Trail**: Complete history of all changes and approvals
- **Authorization**: All adjustments tied to authorized users
- **GL Reconciliation**: 100% reconciliation between inventory and GL

---

## Appendices

### Appendix A: Adjustment Types
- **IN (Increase)**: Physical count found more than expected, production yield gains
- **OUT (Decrease)**: Damaged goods, expired items, theft/loss, quality rejections

### Appendix B: Common Adjustment Reasons
1. **Physical Count Variance**: Periodic inventory count differences
2. **Damaged Goods**: Items physically damaged and unusable
3. **Expired Items**: Items past expiration date requiring disposal
4. **Quality Control Rejection**: Items failing quality standards
5. **Theft/Loss**: Missing items from theft or loss
6. **System Reconciliation**: Correcting system errors
7. **Spot Check Variance**: Random check discrepancies
8. **Production Yield Variance**: Manufacturing output differences

### Appendix C: Related Documentation
- Physical Count Management: `docs/app/inventory-management/physical-counts/`
- Stock Overview: `docs/app/inventory-management/stock-overview/`
- Journal Entries: `docs/app/finance/journal-entries/`
- Costing Methods: `docs/app/shared-methods/inventory-valuation/SM-costing-methods.md`

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-10 | System | Initial creation based on source code analysis |
