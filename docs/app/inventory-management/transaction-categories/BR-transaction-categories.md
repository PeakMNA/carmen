# Business Requirements: Transaction Categories

**Module**: Inventory Management
**Sub-module**: Transaction Categories
**Version**: 1.0.0
**Last Updated**: 2025-01-16
**Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Documentation Team | Initial version |

---

## Executive Summary

Transaction Categories provide a two-level classification system (Category → Reason) for inventory adjustments. Categories determine GL account mapping for journal entries, while reasons provide detailed classification for reporting. This module enables Financial Controllers and Storekeepers to configure how inventory adjustments are categorized and how they impact the general ledger.

---

## Business Context

### Problem Statement
Hotel operations require precise tracking of inventory discrepancies with proper financial reporting. Without a structured classification system, adjustments lack consistency, making it difficult to analyze patterns (wastage, theft, quality issues) and ensure accurate GL postings.

### Business Objectives
1. Standardize inventory adjustment classification across all hotel locations
2. Enable accurate GL account mapping for financial reporting
3. Provide detailed reason tracking for operational analysis
4. Support both Stock IN (increases) and Stock OUT (decreases) scenarios

---

## Stakeholders

| Role | Responsibilities | Access Level |
|------|------------------|--------------|
| Financial Controller | Define categories and GL mappings | Full Access |
| Storekeeper | View categories when creating adjustments | Read Only |
| Warehouse Manager | View categories, suggest new reasons | Read Only |
| System Administrator | Manage all configuration | Full Access |

---

## Functional Requirements

### FR-TXC-001: View Category List
**Priority**: High
**User Story**: As a Financial Controller, I want to view all transaction categories so that I can manage the classification system for inventory adjustments.

**Requirements**:
- Display categories in a tabular format with columns: Code, Name, Type, GL Account, Reasons Count, Status
- Three-tab navigation: All Categories, Stock In, Stock Out
- Search across code, name, GL account code, GL account name, description
- Filter by status (Active, Inactive, All)
- Sort by code, name, or custom sort order
- Show reason count per category

**Intent**:
- Provide quick overview of all classification options
- Enable filtering to find specific category types
- Show relationship between categories and GL accounts

**Acceptance Criteria**:
- [ ] All active and inactive categories visible in list
- [ ] Tab switching filters by Stock IN or Stock OUT type
- [ ] Search returns matching categories within 300ms
- [ ] Click on row navigates to category detail page

**Source Evidence**: `page.tsx:71-171`, `components/category-list.tsx:101-398`

---

### FR-TXC-002: View Category Details
**Priority**: High
**User Story**: As a Financial Controller, I want to view category details and associated reasons so that I can understand the classification structure.

**Requirements**:
- Display header with category name, type badge (Stock IN green, Stock OUT red), and code
- Show category details: Code, Name, Type, Status, GL Account Code + Name, Description
- List all reasons with columns: Code, Name, Description, Status
- Inline status toggle for reasons
- Edit and Delete buttons in header
- Add Reason button above reasons list

**Intent**:
- Provide complete view of category configuration
- Enable quick management of reasons
- Show GL account mapping clearly

**Acceptance Criteria**:
- [ ] Category details displayed in card format
- [ ] All associated reasons listed in table
- [ ] Status toggle works inline for each reason
- [ ] Delete confirmation dialog shown before deletion

**Source Evidence**: `[id]/page.tsx:50-288`

---

### FR-TXC-003: Create New Category
**Priority**: High
**User Story**: As a Financial Controller, I want to create new transaction categories so that I can expand the classification system as business needs evolve.

**Requirements**:
- Type selection cards (Stock OUT, Stock IN) with visual indication
- Type can be pre-selected via URL query parameter (?type=in or ?type=out)
- Type is locked after pre-selection from tab context
- Required fields: Code (max 10 chars, auto-uppercase), Name, GL Account Code, GL Account Name
- Optional fields: Description, Sort Order (1-999, default 1), Active Status (default true)
- Discard confirmation dialog when navigating with unsaved changes

**Intent**:
- Enable expansion of classification system
- Ensure proper GL account mapping from creation
- Support context-aware creation from tabs

**Acceptance Criteria**:
- [ ] Form validates all required fields before save
- [ ] Code auto-converts to uppercase
- [ ] Type selection visually highlighted with border and background
- [ ] Cancel with changes triggers discard confirmation

**Source Evidence**: `new/page.tsx:24-52`, `components/category-form.tsx:80-506`

---

### FR-TXC-004: Edit Category
**Priority**: High
**User Story**: As a Financial Controller, I want to edit existing categories so that I can update GL mappings or descriptions as accounting requirements change.

**Requirements**:
- Pre-populate form with existing category data
- Type field is locked (cannot be changed after creation)
- All other fields editable: Code, Name, GL Account, Description, Sort Order, Status
- Track changes and show discard dialog only if changes made

**Intent**:
- Allow updates to GL mappings when chart of accounts changes
- Prevent type changes that would affect existing adjustment records
- Support soft-disable via Active status

**Acceptance Criteria**:
- [ ] All fields pre-populated with current values
- [ ] Type selection disabled with explanation message
- [ ] Save button only enabled when form is valid
- [ ] Success redirects to category list

**Source Evidence**: `[id]/edit/page.tsx:24-61`, `components/category-form.tsx:86-109`

---

### FR-TXC-005: Delete Category
**Priority**: Medium
**User Story**: As a Financial Controller, I want to delete unused categories so that I can keep the classification system clean.

**Requirements**:
- Confirmation dialog before deletion
- Dialog shows category name and count of associated reasons
- Warning that deletion includes all reasons
- Soft delete (set deleted flag, not physical removal)

**Intent**:
- Prevent accidental deletion of categories with data
- Maintain audit trail of deleted categories
- Cascade delete to child reasons

**Acceptance Criteria**:
- [ ] Confirmation dialog appears before delete
- [ ] Reason count displayed in warning message
- [ ] Category removed from list after successful deletion
- [ ] Delete prevented if category used in posted adjustments

**Source Evidence**: `[id]/page.tsx:83-97`, `[id]/page.tsx:249-276`

---

### FR-TXC-006: Manage Reasons
**Priority**: High
**User Story**: As a Financial Controller, I want to add, edit, and delete reasons within a category so that I can provide detailed classification options for adjustments.

**Requirements**:
- Add Reason via modal dialog from category detail page
- Reason fields: Code (max 10 chars), Name (required), Description (optional), Sort Order, Active Status
- Edit Reason via same modal with pre-populated data
- Delete Reason with confirmation dialog
- Inline status toggle in reason list
- Reasons sorted by sort order

**Intent**:
- Enable granular classification within categories
- Support quick status changes without full edit
- Maintain clean reason list with soft-disable

**Acceptance Criteria**:
- [ ] Add Reason opens modal dialog
- [ ] Edit pre-fills modal with current values
- [ ] Delete shows confirmation with reason name
- [ ] Status toggle updates immediately

**Source Evidence**: `components/reason-dialog.tsx:66-279`, `components/reason-list.tsx:69-210`

---

### FR-TXC-007: GL Account Mapping
**Priority**: Critical
**User Story**: As a Financial Controller, I want categories to map to specific GL accounts so that inventory adjustments post to the correct accounts.

**Requirements**:
- Each category stores GL Account Code and GL Account Name
- Stock OUT categories typically map to expense accounts (5xxx)
- Stock IN categories typically map to inventory accounts (1xxx)
- GL mapping used by adjustment posting to generate journal entries

**Default GL Mappings**:
| Category | Type | GL Code | GL Name |
|----------|------|---------|---------|
| Wastage | OUT | 5200 | Waste Expense |
| Loss | OUT | 5210 | Inventory Loss |
| Quality | OUT | 5100 | Cost of Goods Sold |
| Consumption | OUT | 5100 | Cost of Goods Sold |
| Found | IN | 1310 | Raw Materials Inventory |
| Return | IN | 1310 | Raw Materials Inventory |
| Correction | IN | 1310 | Raw Materials Inventory |

**Intent**:
- Ensure accurate financial reporting
- Separate expense tracking by category
- Support audit requirements for inventory valuation

**Acceptance Criteria**:
- [ ] GL Account Code and Name required when creating category
- [ ] GL mapping displayed prominently in category details
- [ ] GL accounts used when adjustment is posted

**Source Evidence**: `lib/types/transaction-category.ts:57-61`, `lib/mock-data/transaction-categories.ts:51-146`

---

### FR-TXC-008: Type-Based Filtering
**Priority**: Medium
**User Story**: As a Storekeeper, I want to see only relevant categories when creating an adjustment so that I select the correct classification.

**Requirements**:
- Stock IN tab shows only categories with type='IN'
- Stock OUT tab shows only categories with type='OUT'
- Context-aware create buttons on each tab
- Type filter passed to form via URL query parameter

**Intent**:
- Reduce user error in category selection
- Streamline adjustment creation workflow
- Match category type to adjustment direction

**Acceptance Criteria**:
- [ ] Stock In tab shows only IN categories
- [ ] Stock Out tab shows only OUT categories
- [ ] Add button on Stock In tab navigates with ?type=in
- [ ] Add button on Stock Out tab navigates with ?type=out

**Source Evidence**: `page.tsx:90-166`, `components/category-list.tsx:146-149`

---

## Non-Functional Requirements

### NFR-TXC-001: Performance
- Category list loads within 2 seconds
- Search filter responds within 300ms (debounced)
- Form save completes within 3 seconds

### NFR-TXC-002: Usability
- Type selection uses visual cards with icons
- Status badges color-coded (green for IN, red for OUT)
- Responsive layout for tablet and desktop

### NFR-TXC-003: Data Integrity
- Code uniqueness enforced per type
- Soft delete to maintain referential integrity
- Audit timestamps on all records

---

## Integration Points

| System | Integration Type | Purpose |
|--------|------------------|---------|
| Inventory Adjustments | Data Lookup | Provide category/reason options for adjustment forms |
| Journal Entries | GL Mapping | Determine debit/credit accounts when posting |
| Reports | Data Source | Enable filtering by category/reason |

---

## Assumptions and Constraints

### Assumptions
1. Users understand basic accounting concepts (GL accounts)
2. Categories are defined before creating adjustments
3. One category per adjustment (header-level)
4. Multiple reasons per adjustment (item-level, filtered by category)

### Constraints
1. Type cannot be changed after category creation
2. Category deletion blocked if used in posted adjustments
3. Code maximum 10 characters

---

## Glossary

| Term | Definition |
|------|------------|
| Transaction Category | Parent-level classification for inventory adjustments, maps to GL account |
| Transaction Reason | Child-level classification within a category, provides detailed tracking |
| Stock IN | Adjustment type that increases inventory (positive) |
| Stock OUT | Adjustment type that decreases inventory (negative) |
| GL Account | General Ledger account for financial posting |
| Sort Order | Numeric value determining display sequence in dropdowns |

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Documentation Team | Initial creation |
