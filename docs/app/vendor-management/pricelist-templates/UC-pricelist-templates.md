# Pricelist Templates - Use Cases (UC)

## Document Information
- **Document Type**: Use Cases Document
- **Module**: Vendor Management > Pricelist Templates
- **Version**: 3.0.0
- **Last Updated**: 2026-01-15
- **Document Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2026-01-15 | Documentation Team | Synced with current code; Updated UC-PT-001 to 3-step wizard flow; Updated UC-PT-002 for hierarchical product selection; Added notification settings and Multi-MOQ configuration; Updated route paths from /pricelist-templates to /templates; Added currency options (BHT, USD, CNY, SGD) |
| 2.0.0 | 2025-11-25 | Documentation Team | Simplified to align with BR-pricelist-templates.md; Reduced from 18 to 6 core use cases; Removed distribution, approval, versioning, submission tracking use cases |
| 1.1 | 2025-11-25 | System | Updated document status to Active |
| 1.0 | 2024-01-15 | System | Initial creation with detailed use cases |

---

## 1. Introduction

### 1.1 Purpose
This document details the use cases for the Pricelist Templates module, describing how different actors interact with the system to create, manage, and maintain standardized pricing templates for vendor price collection.

### 1.2 Scope
This document covers all user interactions with the Pricelist Templates module as defined in BR-pricelist-templates.md, including:
- Template creation and management
- Product/item assignment to templates
- Template activation and deactivation
- Template cloning

### 1.3 Document Conventions
- **Actor**: User or system component interacting with the module
- **Precondition**: State that must exist before use case executes
- **Postcondition**: State after successful use case completion
- **Main Flow**: Primary path through the use case
- **Alternate Flow**: Variations from the main flow
- **Exception Flow**: Error conditions and recovery

---

## 2. Actors

### 2.1 Primary Actors

**Procurement Manager**
- **Role**: Primary administrator of pricing templates
- **Responsibilities**: Create templates, manage product assignments, activate templates
- **Permissions**: Full access to template management

**Procurement Staff**
- **Role**: Template creators and maintainers
- **Responsibilities**: Create draft templates, add products
- **Permissions**: Create/edit templates (draft status)

### 2.2 Secondary Actors

**Finance Manager**
- View templates for pricing reference

**Department Manager**
- View department-specific templates

**Executive**
- View all templates and reports

---

## 3. Use Cases Overview

### 3.1 Use Case List

| ID | Use Case Name | Primary Actor | Priority |
|----|---------------|---------------|----------|
| UC-PT-001 | Create Pricelist Template | Procurement Manager, Procurement Staff | Critical |
| UC-PT-002 | Add Products to Template | Procurement Manager, Procurement Staff | Critical |
| UC-PT-003 | Edit Template | Procurement Manager, Procurement Staff | High |
| UC-PT-004 | Clone Existing Template | Procurement Manager, Procurement Staff | Medium |
| UC-PT-005 | Activate/Deactivate Template | Procurement Manager | High |
| UC-PT-006 | Search and View Templates | All Users | High |

---

## 4. Detailed Use Cases

### UC-PT-001: Create Pricelist Template

**Primary Actor**: Procurement Manager, Procurement Staff
**Priority**: Critical
**Frequency**: Weekly (2-5 templates/week)
**Related FR**: FR-PT-001

#### Preconditions
- User is authenticated with appropriate role
- User has permission to create templates
- System is operational
- Product catalog is accessible

#### Main Flow (3-Step Wizard)
1. User navigates to Vendor Management > Templates (/vendor-management/templates)
2. User clicks "Create New Template" button
3. System displays 3-step wizard interface

**Step 1: Basic Information**
4. User enters basic information:
   - Template Name (required, unique)
   - Description (optional)
   - Currency (required, dropdown: BHT, USD, CNY, SGD)
   - Validity Period (days, default: 90)
   - Vendor Instructions (optional, textarea)
5. System validates template name uniqueness
6. User clicks "Next" to proceed to Step 2

**Step 2: Product Selection**
7. System displays hierarchical product selection interface
8. User selects products using hierarchical selection:
   - Select entire Categories (checkbox)
   - Select specific Subcategories (checkbox)
   - Select Item Groups (checkbox)
   - Select individual Specific Items (checkbox)
9. System shows selection summary with count badges
10. User clicks "Next" to proceed to Step 3

**Step 3: Settings & Notifications**
11. User configures template settings:
    - Allow Multi-MOQ (toggle, default: on)
    - Require Lead Time (toggle, default: on)
    - Max Items Per Submission (number, default: 1000)
12. User configures notification settings:
    - Send Reminders (toggle, default: on)
    - Reminder Days (checkboxes: 14, 7, 3, 1 days)
    - Escalation Days (number, default: 14)
13. User reviews template summary
14. User clicks "Create Template"
15. System validates:
    - Template name is unique (BR-PT-001)
    - At least one product selection (BR-PT-002)
16. If validation passes:
    - System saves template with status "Draft"
    - System generates unique template ID
    - System displays success message
17. System navigates to template detail page
18. System logs creation in audit trail

#### Postconditions
- **Success**: Template created in database with Draft status
- **Success**: Template ID assigned and displayed
- **Success**: All fields saved with entered data
- **Success**: Notification settings configured
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Clone from Existing Template**
- At step 2, user clicks "Duplicate" on existing template:
  - System creates copy with "Copy of [Original Name]"
  - System opens cloned template in edit mode
  - User modifies as needed
  - Continue to save

**AF-002: Navigate Between Wizard Steps**
- At any step, user can click "Previous" to go back
- System preserves entered data when navigating between steps

**AF-003: Cancel Creation**
- At any step, user clicks "Cancel"
- System displays confirmation dialog
- User confirms cancellation
- System returns to template list

#### Exception Flows

**EF-001: Duplicate Template Name**
- At step 5, if template name already exists:
  - System highlights template name field in red
  - System displays error: "Template name already exists. Please use a unique name."
  - User corrects template name
  - Continue to step 5

**EF-002: Missing Required Fields**
- At step 15, if required fields are missing:
  - System highlights missing fields with red borders
  - System displays validation summary
  - User completes missing fields
  - User clicks Save again
  - Continue to step 15

**EF-003: No Products Selected**
- At step 15, if no products selected:
  - System displays error: "Template must have at least one product selection."
  - System navigates to Step 2 (Product Selection)
  - User must select products
  - Continue to step 10

#### Business Rules Applied
- BR-PT-001: Template name must be unique across active templates
- BR-PT-002: Each template must have at least one product selection

#### UI Requirements
- 3-step wizard with progress indicator
- Step navigation (Previous/Next buttons)
- Real-time validation feedback
- Hierarchical product selection with checkboxes
- Selection count badges
- Toggle switches for boolean settings
- Mobile-responsive form layout

---

### UC-PT-002: Add Products to Template

**Primary Actor**: Procurement Manager, Procurement Staff
**Priority**: Critical
**Frequency**: Daily (10-50 products/template)
**Related FR**: FR-PT-002

#### Preconditions
- User is authenticated with appropriate role
- User has permission to edit templates
- Template exists (draft or active)
- Product catalog is accessible
- User is in template edit mode or Step 2 of creation wizard

#### Main Flow (Hierarchical Product Selection)
1. User is in Product Selection step (Step 2 of wizard or edit mode)
2. System displays ProductSelectionComponent with hierarchical structure:
   - Categories panel (with checkboxes)
   - Subcategories panel (with checkboxes)
   - Item Groups panel (with checkboxes)
   - Specific Items panel (with checkboxes and search)
3. System shows selection summary panel with:
   - Selected Categories count
   - Selected Subcategories count
   - Selected Item Groups count
   - Selected Specific Items count
   - Total estimated products count

**Hierarchical Selection Flow**
4. User can select at any level:
   - **Categories**: Select entire category (includes all subcategories, item groups, and items)
   - **Subcategories**: Select specific subcategories (includes all item groups and items in that subcategory)
   - **Item Groups**: Select specific item groups (includes all items in that group)
   - **Specific Items**: Select individual products
5. System updates selection summary in real-time
6. User can use search/filter within each panel
7. User clicks checkboxes to toggle selection
8. System shows visual indicators for:
   - Fully selected (checked)
   - Partially selected (indeterminate)
   - Not selected (unchecked)

**Completing Product Selection**
9. User reviews selection summary
10. User clicks "Next" to proceed to Settings step
11. System validates at least one selection exists

#### Postconditions
- **Success**: Product selections saved to template
- **Success**: Selection hierarchy preserved
- **Success**: Selection summary accurate
- **Success**: Template updated with product selections

#### Alternate Flows

**AF-001: Search for Specific Items**
- At step 4, user uses search bar in Specific Items panel:
  - System filters products by name/code
  - User selects matching products
  - Continue to step 5

**AF-002: Clear All Selections**
- User clicks "Clear All" button:
  - System clears all selections across all levels
  - Selection summary resets to zero
  - Continue to step 4

**AF-003: Expand/Collapse Hierarchy**
- User clicks expand/collapse on category levels:
  - System shows/hides child elements
  - Selection state preserved when collapsed
  - Continue to step 4

**AF-004: Filter by Category in Items Panel**
- User selects category filter in Specific Items panel:
  - System shows only items from selected category
  - User can select individual items
  - Continue to step 5

#### Exception Flows

**EF-001: No Products Available**
- If product catalog is empty:
  - System displays "No products available"
  - User cannot proceed to next step
  - User must contact administrator

**EF-002: No Selection Made**
- At step 11, if no selections made:
  - System displays error: "Please select at least one category, subcategory, item group, or specific item"
  - User must make at least one selection
  - Continue to step 4

**EF-003: Category/Product Not Found**
- If search returns no results:
  - System displays "No matching products found"
  - System suggests trying different search terms
  - User adjusts search

#### Business Rules Applied
- BR-PT-002: Each template must have at least one selection
- Hierarchical selection: parent selection includes all children
- Products can appear in multiple templates
- Selection at higher level overrides individual item selections

#### UI Requirements
- ProductSelectionComponent with 4-panel layout
- Checkbox-based multi-selection at each level
- Collapsible/expandable category tree
- Search/filter within each panel
- Selection count badges per level
- Real-time selection summary
- Clear all selections option
- Mobile-responsive layout

---

### UC-PT-003: Edit Template

**Primary Actor**: Procurement Manager, Procurement Staff
**Priority**: High
**Frequency**: Weekly (5-10 edits/week)
**Related FR**: FR-PT-001

#### Preconditions
- User is authenticated with appropriate role
- User has permission to edit templates
- Template exists in system
- Template is in Draft or Active status

#### Main Flow
1. User navigates to template detail page (/vendor-management/templates/[id])
2. User clicks "Edit" button
3. System navigates to edit page (/vendor-management/templates/[id]/edit)
4. System displays template in edit mode with inline editing:

**Basic Information Section**
   - Template Name (inline editable, click to edit)
   - Description (inline editable, click to edit)
   - Currency (dropdown: BHT, USD, CNY, SGD)
   - Validity Period (days input)
   - Vendor Instructions (textarea)

**Template Settings Section**
   - Allow Multi-MOQ (toggle switch)
   - Require Lead Time (toggle switch)
   - Max Items Per Submission (number input)

**Notification Settings Section**
   - Send Reminders (toggle switch)
   - Reminder Days (checkboxes: 14, 7, 3, 1 days before deadline)
   - Escalation Days (number input)

**Product Selection Section**
   - Link to edit product selection
   - Current selection summary displayed

5. User modifies desired fields using inline editing
6. User clicks "Save Changes"
7. System validates all changes:
   - Template name uniqueness (if changed)
   - Validity period is valid (1-365 days)
   - At least one product selection exists
8. System saves changes
9. System increments doc_version
10. System displays success message
11. System logs changes in audit trail

#### Postconditions
- **Success**: Template updated with changes
- **Success**: doc_version incremented
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Inline Edit Name/Description**
- User clicks on template name or description:
  - Field becomes editable inline
  - User types new value
  - User clicks away or presses Enter to confirm
  - System saves change immediately
  - Continue to step 9

**AF-002: Edit Product Selection**
- User clicks "Edit Products" button:
  - System navigates to product selection interface
  - User modifies selections using hierarchical picker
  - User saves changes
  - System returns to edit page

**AF-003: Cancel Edit**
- At any step, user clicks "Cancel" or "Back":
  - System returns to template detail page
  - Unsaved changes are discarded

#### Exception Flows

**EF-001: Validation Failure**
- At step 7, if validation fails:
  - System displays validation errors inline
  - User corrects errors
  - User clicks Save again

**EF-002: Concurrent Edit Conflict**
- At step 8, if another user saved changes:
  - System displays conflict warning
  - User options:
    - "Refresh": Loads other user's changes
    - "Override": Saves current user's changes

#### Business Rules Applied
- BR-PT-001: Template name must remain unique

#### UI Requirements
- Inline editable fields (click to edit)
- Toggle switches for boolean settings
- Checkbox groups for reminder days
- Save/Cancel buttons
- Real-time validation feedback
- Unsaved changes indicator

---

### UC-PT-004: Clone Existing Template

**Primary Actor**: Procurement Manager, Procurement Staff
**Priority**: Medium
**Frequency**: Weekly (5-10 clones/week)
**Related FR**: FR-PT-001

#### Preconditions
- User is authenticated with appropriate role
- User has permission to create templates
- Source template exists in system

#### Main Flow
1. User navigates to template library or detail page
2. User locates template to clone
3. User clicks "Clone Template" action button
4. System displays clone dialog:
   - New template name (required)
   - Pre-filled with "Copy of [Original Name]"
5. User enters new template name
6. System validates name uniqueness
7. User clicks "Clone"
8. System creates new template copy with:
   - All products from original template
   - All product configurations (UOM, MOQ, Lead Time)
   - Description and vendor instructions
   - Currency setting
9. System resets template metadata:
   - Status: Draft
   - Created date: Current date
   - Created by: Current user
   - Effective dates: Cleared
10. System displays success message
11. User options:
    - "Edit Now": Opens cloned template for editing
    - "View Template": Views cloned template
    - "Back to Library": Returns to template list
12. System logs clone operation in audit trail

#### Postconditions
- **Success**: New template created as copy of original
- **Success**: Status set to Draft
- **Success**: User can edit cloned template
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Clone and Edit Immediately**
- At step 11, user selects "Edit Now":
  - System opens template editor
  - User makes changes
  - User saves changes
  - End use case

#### Exception Flows

**EF-001: Duplicate Name**
- At step 6, if name already exists:
  - System displays error: "Template name already exists"
  - User enters different name
  - Continue to step 6

**EF-002: Clone Permission Denied**
- At step 3, if user lacks permission:
  - System displays error: "You do not have permission to clone templates"
  - End use case

#### Business Rules Applied
- BR-PT-001: Cloned template must have unique name
- Cloned template starts as Draft status

#### UI Requirements
- One-click clone button
- Clone confirmation dialog
- Quick edit after clone
- Success notification

---

### UC-PT-005: Activate/Deactivate Template

**Primary Actor**: Procurement Manager
**Priority**: High
**Frequency**: Weekly (5-10 status changes/week)
**Related FR**: FR-PT-001

#### Preconditions
- User is authenticated as Procurement Manager
- User has permission to manage template status
- Template exists in system

#### Main Flow (Activate)
1. User navigates to template detail page
2. Template status is "Draft"
3. User clicks "Activate" button
4. System validates template is ready:
   - Has at least one product (BR-PT-002)
   - Template name is unique (BR-PT-001)
5. If validation passes:
   - System changes status to "Active"
   - System displays success message
6. System logs status change in audit trail

#### Main Flow (Deactivate)
1. User navigates to template detail page
2. Template status is "Active"
3. User clicks "Deactivate" button
4. System displays confirmation dialog
5. User confirms deactivation
6. System changes status to "Inactive"
7. System displays success message
8. System logs status change in audit trail

#### Postconditions
- **Success**: Template status updated
- **Success**: Audit log entry created

#### Alternate Flows

**AF-001: Reactivate Inactive Template**
- If template status is "Inactive":
  - User clicks "Reactivate"
  - System validates template
  - System changes status to "Active"
  - Continue to step 6 of Main Flow (Activate)

#### Exception Flows

**EF-001: Activation Validation Failure**
- At step 4 (Activate), if template has no products:
  - System displays error: "Template must have at least one product before activation"
  - User must add products first
  - End use case

**EF-002: Permission Denied**
- At step 3, if user is not Procurement Manager:
  - System displays error: "Only Procurement Manager can change template status"
  - End use case

#### Business Rules Applied
- BR-PT-002: Template must have at least one product to activate
- Status workflow: Draft → Active → Inactive

#### UI Requirements
- Status badge on template card
- Activate/Deactivate button based on current status
- Confirmation dialog for deactivation
- Status change success notification

---

### UC-PT-006: Search and View Templates

**Primary Actor**: All Users
**Priority**: High
**Frequency**: Daily (multiple times/day)
**Related FR**: FR-PT-001

#### Preconditions
- User is authenticated
- User has permission to view templates

#### Main Flow
1. User navigates to Vendor Management > Templates (/vendor-management/templates)
2. System displays template list with view toggle (Table/Card view)
3. **Table View** displays columns:
   - Template name
   - Status badge (Draft/Active/Inactive with color coding)
   - Currency
   - Product count
   - Validity Period (days)
   - Last updated date
   - Actions dropdown
4. **Card View** displays cards with:
   - Template name
   - Description (truncated)
   - Status badge
   - Currency and validity period
   - Product selection summary
   - Quick action buttons
5. User can filter templates by:
   - Status tabs (All, Draft, Active, Inactive)
   - Search term (name, description)
6. User can sort templates by:
   - Name (A-Z, Z-A)
   - Last updated (newest, oldest)
   - Status
7. User clicks on template row/card
8. System displays template detail page (/vendor-management/templates/[id]) with:
   - Basic information header
   - Template settings (Multi-MOQ, Lead Time, etc.)
   - Notification settings
   - Tabs for:
     - Product Selection (hierarchical view)
     - RfP/Campaigns (linked campaigns)
9. User can navigate through template details

#### Postconditions
- **Success**: User views template information
- **Success**: Search/filter applied correctly
- **Success**: View preference (Table/Card) remembered

#### Alternate Flows

**AF-001: Quick Actions from List**
- At step 3/4, user clicks action dropdown on template:
  - "View": Opens template detail page
  - "Edit": Opens template in edit mode
  - "Duplicate": Creates copy of template
  - "Generate Excel": Downloads Excel template
  - "Delete": Soft deletes template (if Draft)

**AF-002: Toggle View Mode**
- User clicks Table/Card toggle button:
  - System switches between table and card layouts
  - View preference persisted in session
  - Filter/search state preserved

**AF-003: Export Template to Excel**
- At step 8, user clicks "Generate Excel":
  - System opens ExcelTemplateCustomizer dialog
  - User configures Excel options
  - System generates and downloads Excel file

**AF-004: Preview Template**
- At step 8, user clicks "Preview":
  - System displays TemplatePreview modal
  - Shows template as vendors will see it
  - User can close preview to return

#### Exception Flows

**EF-001: No Templates Found**
- At step 5, if no templates match filter:
  - System displays empty state with illustration
  - System suggests: "No templates found. Create a new template?"
  - "Create Template" button displayed

#### Business Rules Applied
- Users can only see templates they have permission to view
- Status filters show accurate counts
- Status badge colors: Draft (gray), Active (green), Inactive (red)

#### UI Requirements
- Table/Card view toggle
- Searchable list with debounce
- Status filter tabs with counts
- Sortable columns (table view)
- Responsive grid (card view)
- Actions dropdown menu
- Status badges with consistent colors
- Empty state handling
- Pagination or infinite scroll

---

## 5. Use Case Dependencies

### 5.1 Dependency Matrix

| Use Case | Depends On | Enables |
|----------|-----------|---------|
| UC-PT-001: Create Template | - | UC-PT-002, UC-PT-003, UC-PT-005 |
| UC-PT-002: Add Products | UC-PT-001 | UC-PT-005 |
| UC-PT-003: Edit Template | UC-PT-001 | - |
| UC-PT-004: Clone Template | Existing template | UC-PT-001, UC-PT-002 |
| UC-PT-005: Activate/Deactivate | UC-PT-001, UC-PT-002 | - |
| UC-PT-006: Search/View | - | UC-PT-003, UC-PT-004, UC-PT-005 |

---

## 6. Success Metrics

### 6.1 Use Case Performance Targets

| Use Case | Target Time | Target Success Rate |
|----------|-------------|-------------------|
| UC-PT-001: Create Template | <3 minutes | >90% |
| UC-PT-002: Add Products (10 products) | <2 minutes | >95% |
| UC-PT-003: Edit Template | <2 minutes | >95% |
| UC-PT-004: Clone Template | <10 seconds | >99% |
| UC-PT-005: Activate/Deactivate | <5 seconds | >99% |
| UC-PT-006: Search/View | <1 second | >99% |

### 6.2 User Satisfaction Targets
- Overall satisfaction: >4.0/5.0
- Ease of use: >4.2/5.0
- Template completion rate: >90%

### 6.3 Business Impact Targets
- 80% reduction in time to create pricing templates
- 100% templates use standardized format
- <5 support tickets per 100 template operations

---

## Related Documents
- BR-pricelist-templates.md - Business Requirements
- DD-pricelist-templates.md - Data Definition
- FD-pricelist-templates.md - Flow Diagrams
- VAL-pricelist-templates.md - Validations
- TS-pricelist-templates.md - Technical Specification

---

**End of Use Cases Document**
